import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  assertPortAvailable,
  assertProviderAbsent,
  browserOrigin,
  privateResponse,
  startBrowserServer,
} from "./browser-server.ts";

// Real Next + browser, deliberately WITHOUT a provider. No login or database writes.
let stage = "prerequisites";
async function main() {
  assert.equal(process.env.CI, "true");
  await assertPortAvailable(54321);
  stage = "provider absence preflight";
  await assertProviderAbsent();
  const { chromium } = createRequire(import.meta.url)(
    "./browser-runtime/node_modules/playwright",
  ) as typeof import("./browser-runtime/node_modules/playwright/index.js");
  stage = "owned production build/server";
  const server = await startBrowserServer("sb_publishable_synthetic_provider_absent");
  let browser;
  try {
    stage = "browser launch";
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
    });
    const context = await browser.newContext({ serviceWorkers: "block" });
    let external = 0;
    await context.route("**/*", (route) => {
      if (new URL(route.request().url()).origin !== browserOrigin) {
        external++;
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    stage = "login response";
    const response = await page.goto(`${browserOrigin}/console/login`);
    assert.equal(response?.status(), 200);
    stage = "login private headers";
    privateResponse(response!.headers());
    stage = "login heading";
    await page.getByRole("heading", { name: "Product Intelligence", exact: true }).waitFor();
    stage = "login unavailable-provider state";
    await page
      .getByText("Sign-in is temporarily unavailable. Contact the project administrator.", {
        exact: true,
      })
      .waitFor();
    assert.equal(await page.getByLabel("Password", { exact: true }).count(), 0);
    stage = "cross-origin command refusal";
    const refused = await context.request.post(`${browserOrigin}/console/commands`, {
      headers: {
        origin: "https://invalid.example",
        "content-type": "application/json",
        "x-console-command": "1",
      },
      data: "{}",
      maxRedirects: 0,
    });
    assert.equal(refused.status(), 403);
    privateResponse(refused.headers());
    stage = "unavailable-provider command refusal";
    const unavailable = await page.evaluate(async () => {
      const result = await fetch("/console/commands", {
        method: "POST",
        headers: { "content-type": "application/json", "x-console-command": "1" },
        body: "{}",
      });
      return {
        status: result.status,
        headers: Object.fromEntries(result.headers),
        body: await result.json(),
      };
    });
    assert.equal(unavailable.status, 503);
    privateResponse(unavailable.headers);
    assert.equal(unavailable.body.ok, false);
    for (const view of ["media", "oem"]) {
      stage = `private ${view} route`;
      const mappingPage = await context.request.get(
        `${browserOrigin}/console/products/10000000-0000-4000-8000-000000000001/${view}`,
        { maxRedirects: 0 },
      );
      stage = "private mapping status";
      assert.ok([200, 307].includes(mappingPage.status()));
      stage = "private mapping headers";
      privateResponse(mappingPage.headers());
      stage = "private mapping redirect";
      const mappingHtml = await mappingPage.text();
      if (mappingPage.status() === 307) {
        const target = new URL(mappingPage.headers().location, browserOrigin);
        assert.equal(target.href, `${browserOrigin}/console/login?state=unavailable`);
      } else {
        // Installed Next emits an exact meta redirect after a streaming response has begun.
        const refresh = await page.evaluate(
          (html) =>
            new DOMParser()
              .parseFromString(html, "text/html")
              .querySelector('meta#__next-page-redirect[http-equiv="refresh"]')
              ?.getAttribute("content"),
          mappingHtml,
        );
        assert.equal(refresh, "1;url=/console/login?state=unavailable");
      }
      assert.equal(mappingPage.headers()["x-console-media-observation"], undefined);
      assert.doesNotMatch(
        mappingHtml,
        /Private image mappings|raw_snapshot|media_source_bindings|oem_source_bindings|AF-MIG-/,
      );
      const navigation = await page.goto(
        `${browserOrigin}/console/products/10000000-0000-4000-8000-000000000001/${view}`,
      );
      privateResponse(navigation!.headers());
      await page.waitForURL(`${browserOrigin}/console/login?state=unavailable`);
      await page
        .getByText("Sign-in is temporarily unavailable. Contact the project administrator.", {
          exact: true,
        })
        .waitFor();
      assert.equal(
        await page
          .getByRole("heading", {
            name: view === "media" ? "Image mappings" : "OEM references",
            exact: true,
          })
          .count(),
        0,
      );
    }
    stage = "disabled observation";
    for (const origin of [browserOrigin, "https://invalid.example", "null"]) {
      const observation = await context.request.post(`${browserOrigin}/console/originals/inspect`, {
        headers: { origin, "content-type": "application/json", "x-console-command": "1" },
        data: {
          mapping_id: "96000000-0000-4000-8000-000000000001",
          revision: 1,
          digest: "a".repeat(64),
        },
        maxRedirects: 0,
      });
      assert.equal(observation.status(), 403);
      privateResponse(observation.headers());
      assert.equal(observation.headers()["x-console-media-observation"], undefined);
      assert.equal(observation.headers()["set-cookie"], undefined);
    }
    assert.equal((await context.cookies()).length, 0);
    assert.equal(external, 0);
    console.log(
      "PASS: current production build, owned Next server, real browser unavailable-provider state, private headers, cross-origin denial, disabled media observation and fail-closed command. No Auth/database acceptance claimed.",
    );
  } finally {
    try {
      if (browser) await browser.close();
    } finally {
      await server.stop();
    }
  }
  await assertPortAvailable();
  console.log("PASS: owned acceptance server stopped and its port was released.");
}

main().catch((error) => {
  console.error(`Browser server smoke failed at ${stage}; private runtime output suppressed.`, {
    actualStatus: typeof error?.actual === "number" ? error.actual : undefined,
    expectedStatus: typeof error?.expected === "number" ? error.expected : undefined,
  });
  process.exitCode = 1;
});
