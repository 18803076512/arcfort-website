import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  assertPortAvailable,
  browserOrigin,
  privateResponse,
  startBrowserServer,
} from "./browser-server.ts";

// Real Next + browser, deliberately WITHOUT a provider. No login or database writes.
async function main() {
  assert.equal(process.env.CI, "true");
  await assertPortAvailable(54321);
  const { chromium } = createRequire(import.meta.url)(
    "./browser-runtime/node_modules/playwright",
  ) as typeof import("./browser-runtime/node_modules/playwright/index.js");
  const server = await startBrowserServer("sb_publishable_synthetic_provider_absent");
  let browser;
  try {
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
    const response = await page.goto(`${browserOrigin}/console/login`);
    assert.equal(response?.status(), 200);
    privateResponse(response!.headers());
    await page.getByRole("heading", { name: "Product Intelligence", exact: true }).waitFor();
    await page
      .getByText("Sign-in is temporarily unavailable. Contact the project administrator.", {
        exact: true,
      })
      .waitFor();
    assert.equal(await page.getByLabel("Password", { exact: true }).count(), 0);
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
    assert.equal((await context.cookies()).length, 0);
    assert.equal(external, 0);
    console.log(
      "PASS: current production build, owned Next server, real browser unavailable-provider state, private headers, cross-origin denial and fail-closed command. No Auth/database acceptance claimed.",
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

main().catch(() => {
  console.error("Browser server smoke failed; private runtime output suppressed.");
  process.exitCode = 1;
});
