import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import type { Browser, Page } from "./console/browser-runtime/node_modules/playwright/index.js";
import { assertNoRuntimeEnvFiles, assertPortAvailable } from "./console/browser-server.ts";

const { chromium } = createRequire(import.meta.url)(
  "./console/browser-runtime/node_modules/playwright",
) as typeof import("./console/browser-runtime/node_modules/playwright/index.js");
const origin = "http://127.0.0.1:3984";
const serverReference = "AF-RFQ-20261104-ABCDEF12";
const pageErrors: string[] = [];
let postCount = 0;
let browser: Browser | undefined;

assertNoRuntimeEnvFiles(process.cwd());
await assertPortAvailable(3984);
const env: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  CI: "true",
  NEXT_TELEMETRY_DISABLED: "1",
  CONSOLE_ENABLED: "false",
};
for (const [key, value] of Object.entries(process.env)) {
  if (/^(PATH|SYSTEMROOT|WINDIR|TEMP|TMP|TMPDIR|HOME|USERPROFILE|COMSPEC|PATHEXT)$/i.test(key)) {
    env[key] = value;
  }
}
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3984"],
  { env, windowsHide: true, stdio: "ignore" },
);
let exited = false;
const closed = new Promise<void>((resolve) => {
  const finish = () => {
    exited = true;
    resolve();
  };
  server.once("error", finish);
  server.once("close", finish);
});

async function fillValidForm(page: Page) {
  await page.locator("#name").fill("Synthetic Buyer");
  await page.locator("#company").fill("Synthetic Distributor");
  await page.locator("#email").fill("buyer@example.com");
  await page.locator("#country").fill("United States");
  await page.locator("#quantity").fill("500 pcs");
  await page.locator("#productRequirements").fill("Synthetic M6 contact tips");
}

async function verifyPreHydrationGuard(browser: Browser) {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width, height: 900 },
    });
    let delayedModules = 0;
    let blockedPosts = 0;
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
        if (request.method() === "POST") blockedPosts++;
        return route.abort();
      }
      if (decodeURIComponent(url.pathname).startsWith("/_next/static/chunks/app/(public)/")) {
        delayedModules++;
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));
    assert.equal((await page.goto(`${origin}/rfq`, { waitUntil: "commit" }))?.status(), 200);
    await page.locator("#name").waitFor({ state: "visible" });
    assert.equal(
      await page.locator("#name").isDisabled(),
      true,
      `RFQ must not accept input before hydration at ${width}px; pre-hydration input is lost.`,
    );
    assert.equal(await page.locator("#email").isDisabled(), true);
    assert.equal(await page.getByRole("button", { name: "Submit RFQ" }).isDisabled(), true);
    assert.equal(await page.locator("#rfq-load-status").isVisible(), true);
    assert.equal(
      await page.locator('#rfq-load-status a[href="mailto:arcfortweld@outlook.com"]').count(),
      1,
    );
    assert.equal(await page.locator('#rfq-load-status a[href^="https://wa.me/"]').count(), 1);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      `Pre-hydration RFQ layout overflows at ${width}px.`,
    );
    const beforeHydration = await page.evaluate(() => {
      const name = document.querySelector("#name");
      if (!name) throw new Error("RFQ name field is missing before hydration.");
      window.scrollTo({
        top: window.scrollY + name.getBoundingClientRect().top - 200,
        behavior: "instant",
      });
      return { nameY: name.getBoundingClientRect().top, scrollY: window.scrollY };
    });
    await page.waitForLoadState("networkidle");
    assert.ok(delayedModules > 0, "The browser must exercise delayed public RFQ modules.");
    assert.equal(await page.locator("#name").isEnabled(), true);
    assert.equal(await page.getByRole("button", { name: "Submit RFQ" }).isEnabled(), true);
    assert.ok((await page.locator("#rfq-load-status").innerText()).includes("Inquiry form ready."));
    const afterHydration = await page.evaluate(() => ({
      nameY: document.querySelector("#name")?.getBoundingClientRect().top,
      scrollY: window.scrollY,
    }));
    assert.ok(
      Math.abs((afterHydration.nameY ?? -1) - beforeHydration.nameY) < 1 &&
        Math.abs(afterHydration.scrollY - beforeHydration.scrollY) < 1,
      `RFQ hydration must not move the visible form at ${width}px: ${JSON.stringify({ beforeHydration, afterHydration })}`,
    );
    await fillValidForm(page);
    assert.equal(await page.locator("#name").inputValue(), "Synthetic Buyer");
    assert.equal(await page.locator("#company").inputValue(), "Synthetic Distributor");
    assert.equal(await page.locator("#email").inputValue(), "buyer@example.com");
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      `Hydrated RFQ layout overflows at ${width}px.`,
    );
    assert.equal(blockedPosts, 0, "No RFQ POST may leave the hydration regression.");
    await context.close();
  }

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false });
  await noScriptContext.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
      return route.abort();
    }
    return route.continue();
  });
  for (const path of ["/rfq", "/contact", "/distributor-supply"]) {
    const noScriptPage = await noScriptContext.newPage();
    assert.equal(
      (await noScriptPage.goto(`${origin}${path}`, { waitUntil: "networkidle" }))?.status(),
      200,
    );
    assert.equal(await noScriptPage.locator("#name").isDisabled(), true, path);
    assert.equal(
      await noScriptPage.locator("form[data-rfq-form-placement]").getAttribute("aria-busy"),
      "false",
      path,
    );
    assert.equal(await noScriptPage.locator("#rfq-load-status").isVisible(), true, path);
    assert.ok(
      (await noScriptPage.locator("#rfq-load-status").innerText()).includes(
        "If the fields do not become available",
      ),
      path,
    );
    assert.equal(
      await noScriptPage
        .locator('#rfq-load-status a[href="mailto:arcfortweld@outlook.com"]')
        .count(),
      1,
      path,
    );
    assert.equal(
      await noScriptPage.locator('#rfq-load-status a[href^="https://wa.me/"]').count(),
      1,
      path,
    );
    await noScriptPage.close();
  }
  await noScriptContext.close();
}

async function verifyRfqListHydrationGuard(browser: Browser) {
  const paths = [
    {
      path: "/products/mig-mag-torch-parts/mig-contact-tip-m6-0-8mm",
      selector: 'button[title="Preparing RFQ list"]',
      fallback: 'a[href^="/rfq"]',
    },
    {
      path: "/products/mig-mag-torch-parts",
      selector: 'article button[title="Preparing RFQ list"]',
      fallback: 'article a[href^="/products/"]',
    },
  ] as const;

  for (const width of [390, 1440]) {
    for (const { path, selector, fallback } of paths) {
      console.log(`RFQ list hydration: ${path} at ${width}px`);
      const context = await browser.newContext({
        serviceWorkers: "block",
        viewport: { width, height: 900 },
      });
      let delayedModules = 0;
      let blockedPosts = 0;
      await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
          if (request.method() === "POST") blockedPosts++;
          return route.abort();
        }
        if (url.pathname.startsWith("/_next/static/chunks/")) {
          delayedModules++;
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => pageErrors.push(error.message));
      assert.equal((await page.goto(`${origin}${path}`, { waitUntil: "commit" }))?.status(), 200);
      const button = page.locator(selector).first();
      await button.waitFor({ state: "visible" });
      assert.equal(await button.isDisabled(), true, `${path} at ${width}px`);
      const itemName = (await button.getAttribute("aria-label"))?.replace(
        /^Preparing RFQ list for /,
        "",
      );
      assert.ok(itemName, `${path} must identify the pending product`);
      assert.ok((await page.locator(fallback).count()) > 0, `${path} fallback link`);
      await page.waitForLoadState("networkidle");
      assert.ok(delayedModules > 0, `${path} must exercise delayed scripts`);
      const readyButton = page.getByRole("button", { name: `Add ${itemName} to RFQ list` }).first();
      assert.equal(await readyButton.isEnabled(), true, `${path} ready at ${width}px`);
      await readyButton.evaluate((element) => element.scrollIntoView({ block: "center" }));
      if (path === "/products/mig-mag-torch-parts") {
        await page.locator("article").filter({ has: readyButton }).first().hover();
      }
      await readyButton.click();
      assert.equal(
        await page
          .getByRole("button", { name: `Remove ${itemName} from RFQ list` })
          .first()
          .getAttribute("aria-pressed"),
        "true",
      );
      assert.ok((await page.locator("[data-rfq-count]").count()) > 0, `${path} list count`);
      await page.goto(`${origin}/rfq`, { waitUntil: "networkidle" });
      assert.equal(await page.locator("#selected-products-title + span").innerText(), "1");
      assert.ok((await page.locator("#selected-products").innerText()).includes(itemName));
      assert.equal(blockedPosts, 0, "RFQ list regression must not submit an RFQ.");
      await context.close();
    }
  }
}

async function verifyBuilderHydrationGuard(browser: Browser) {
  const cases = [
    { path: "/distributor-supply", selector: "#distributor-trial-quantity" },
    { path: "/oem-service", selector: "#oem-destination", select: true },
    { path: "/products/mig-mag-torch-parts", selector: "#mig-required-quantity" },
    { path: "/products/tig-torch-parts", selector: "#tig-required-quantity" },
    { path: "/products/plasma-cutting-consumables", selector: "#plasma-required-quantity" },
    { path: "/products/welding-machines", selector: "#machine-quantity" },
  ] as const;

  for (const { path, selector, ...options } of cases) {
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width: 390, height: 900 },
    });
    let delayedModules = 0;
    let blockedPosts = 0;
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
        if (request.method() === "POST") blockedPosts++;
        return route.abort();
      }
      if (url.pathname.startsWith("/_next/static/chunks/")) {
        delayedModules++;
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));
    assert.equal((await page.goto(`${origin}${path}`, { waitUntil: "commit" }))?.status(), 200);
    const input = page.locator(selector);
    const form = input.locator("xpath=ancestor::form[1]");
    await input.waitFor({ state: "visible" });
    assert.equal(await input.isDisabled(), true, `${path} pre-hydration input`);
    assert.equal(await form.locator('button[type="submit"]').isDisabled(), true, path);
    assert.ok((await form.getByRole("status").innerText()).includes("Preparing RFQ builder."));
    assert.equal(
      await form.getByRole("link", { name: "Open direct RFQ form" }).getAttribute("href"),
      "/rfq",
    );
    await page.waitForLoadState("networkidle");
    assert.ok(delayedModules > 0, `${path} must exercise delayed scripts`);
    assert.equal(await input.isEnabled(), true, `${path} hydrated input`);
    assert.equal(await form.locator('button[type="submit"]').isEnabled(), true, path);
    assert.ok((await form.getByRole("status").innerText()).includes("RFQ builder ready."));
    const expected =
      "select" in options
        ? await input.locator("option").nth(1).getAttribute("value")
        : "Synthetic 500";
    assert.ok(expected, `${path} expected synthetic value`);
    if ("select" in options) {
      await input.selectOption(expected);
    } else {
      await input.fill(expected);
    }
    await form.locator('button[type="submit"]').click();
    await page.waitForURL(/\/rfq\?/);
    const url = new URL(page.url());
    assert.ok(
      url.searchParams.get("quantity") === expected ||
        url.searchParams.get("product")?.includes(expected),
      `${path} must hand the buyer's entry to RFQ`,
    );
    assert.equal(blockedPosts, 0, `${path} must not submit a real RFQ`);
    console.log(`RFQ builder hydration and handoff: ${path} passed.`);
    await context.close();
  }

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false });
  await noScriptContext.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
      return route.abort();
    }
    return route.continue();
  });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto(`${origin}/distributor-supply`, { waitUntil: "networkidle" });
  assert.equal(await noScriptPage.locator("#distributor-trial-quantity").isDisabled(), true);
  assert.equal(
    await noScriptPage.getByRole("link", { name: "Open direct RFQ form" }).getAttribute("href"),
    "/rfq",
  );
  await noScriptContext.close();
}

async function verifyAttachmentErrorDescription(browser: Browser) {
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 390, height: 900 },
  });
  let blockedPosts = 0;
  await context.route("**/*", async (route) => {
    const request = route.request();
    if (new URL(request.url()).origin !== origin || !["GET", "HEAD"].includes(request.method())) {
      if (request.method() === "POST") blockedPosts++;
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => pageErrors.push(error.message));
  assert.equal((await page.goto(`${origin}/rfq`, { waitUntil: "networkidle" }))?.status(), 200);
  await fillValidForm(page);
  const input = page.locator("#attachments");
  assert.equal(await input.getAttribute("aria-describedby"), "attachments-help");
  await input.setInputFiles({
    name: "invalid.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("Synthetic invalid attachment"),
  });
  await page.getByRole("button", { name: "Submit RFQ" }).click();
  const error = page.getByText("Allowed files: PDF, Excel, CSV, Word, JPG and PNG.");
  await error.waitFor();
  assert.equal(await input.getAttribute("aria-invalid"), "true");
  assert.equal(await error.getAttribute("id"), "attachments-error");
  assert.equal(await input.getAttribute("aria-describedby"), "attachments-help attachments-error");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "attachments");
  assert.equal(blockedPosts, 0, "Client-side file validation must not send an RFQ POST.");

  await input.setInputFiles({
    name: "drawing.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\nSynthetic drawing"),
  });
  await page.waitForFunction(() => document.getElementById("attachments-error") === null);
  assert.equal(await input.getAttribute("aria-invalid"), "false");
  assert.equal(await input.getAttribute("aria-describedby"), "attachments-help");
  assert.equal(blockedPosts, 0, "Correcting the file must not send an RFQ POST.");
  await context.close();
}

try {
  let ready = false;
  const deadline = Date.now() + 30_000;
  while (!exited && Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/rfq`, { signal: AbortSignal.timeout(1000) });
      await response.body?.cancel();
      if (response.status === 200) {
        ready = true;
        break;
      }
    } catch {
      // The owned local server can take a moment to bind its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready && !exited, "Owned local RFQ test server unavailable.");

  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {}),
  });
  await verifyPreHydrationGuard(browser);
  await verifyRfqListHydrationGuard(browser);
  await verifyBuilderHydrationGuard(browser);
  await verifyAttachmentErrorDescription(browser);
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin) {
      return route.abort();
    }
    if (url.pathname === "/api/rfq" && request.method() === "POST") {
      postCount++;
      return route.abort();
    }
    assert.ok(["GET", "HEAD"].includes(request.method()), "Unexpected mutating request.");
    return route.continue();
  });

  const preflightPage = await context.newPage();
  preflightPage.on("pageerror", (error) => pageErrors.push(error.message));
  assert.equal(
    (await preflightPage.goto(`${origin}/rfq`, { waitUntil: "networkidle" }))?.status(),
    200,
  );
  await fillValidForm(preflightPage);
  await preflightPage.evaluate(() => {
    Object.defineProperty(window, "FormData", {
      configurable: true,
      value: class extends FormData {
        constructor() {
          super();
          throw new Error("Synthetic form preparation failure");
        }
      },
    });
  });
  await preflightPage.getByRole("button", { name: "Submit RFQ" }).click();
  await preflightPage
    .getByRole("alert")
    .getByText(/was not sent/i)
    .waitFor();
  assert.equal(await preflightPage.getByRole("button", { name: "Submit RFQ" }).isEnabled(), true);
  assert.equal(await preflightPage.locator("#email").inputValue(), "buyer@example.com");
  assert.equal(postCount, 0, "Preflight failure must not send an RFQ.");
  await preflightPage.close();

  const responsePage = await context.newPage();
  responsePage.on("pageerror", (error) => pageErrors.push(error.message));
  assert.equal(
    (await responsePage.goto(`${origin}/rfq`, { waitUntil: "networkidle" }))?.status(),
    200,
  );
  await fillValidForm(responsePage);
  await responsePage.evaluate(() => {
    type RfqMock = {
      count: number;
      mode: "pending" | "network" | "stall";
      resolve?: (response: Response) => void;
    };
    const testWindow = window as Window & { __rfqMock?: RfqMock };
    const mock: RfqMock = { count: 0, mode: "pending" };
    testWindow.__rfqMock = mock;
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      if (input === "/api/rfq" && init?.method === "POST") {
        mock.count++;
        return mock.mode === "network"
          ? Promise.reject(new TypeError("Synthetic network failure"))
          : new Promise<Response>((resolve) => {
              mock.resolve = resolve;
            });
      }
      return originalFetch(input, init);
    };
  });
  await responsePage.getByRole("button", { name: "Submit RFQ" }).click();
  await responsePage
    .locator("#rfq-submit-status")
    .getByText(/RFQ attempt reference: AF-RFQ-.*Delivery is not confirmed/i)
    .waitFor();
  assert.equal(
    await responsePage.evaluate(
      () => (window as unknown as Window & { __rfqMock: { count: number } }).__rfqMock.count,
    ),
    1,
  );
  await responsePage.evaluate((reference) => {
    const mock = (
      window as unknown as Window & { __rfqMock: { resolve?: (response: Response) => void } }
    ).__rfqMock;
    mock.resolve?.(
      new Response(
        JSON.stringify({
          ok: false,
          reference,
          errors: {
            quantity: "Synthetic correction only.",
            attachments: "Synthetic attachment correction only.",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", "X-RFQ-Reference": reference },
        },
      ),
    );
  }, serverReference);
  await responsePage.getByText("Synthetic correction only.").waitFor();
  await responsePage.getByText("Synthetic attachment correction only.").waitFor();
  assert.equal(
    await responsePage.locator("#attachments").getAttribute("aria-describedby"),
    "attachments-help attachments-error",
    "A server attachment correction must be associated with the file input.",
  );
  await responsePage.locator('p[role="status"]').filter({ hasText: serverReference }).waitFor();
  assert.equal(postCount, 0, "The browser test must not send a real RFQ POST.");
  assert.equal(await responsePage.getByRole("button", { name: "Submit RFQ" }).isEnabled(), true);
  assert.equal(await responsePage.getByText("Inquiry Submitted").count(), 0);

  await responsePage.evaluate(() => {
    (window as unknown as Window & { __rfqMock: { mode: "network" | "pending" } }).__rfqMock.mode =
      "network";
  });
  await responsePage.getByRole("button", { name: "Submit RFQ" }).click();
  await responsePage
    .getByRole("alert")
    .getByText(/check your email.*before submitting again/i)
    .waitFor();
  await responsePage
    .getByRole("alert")
    .getByText(/RFQ attempt reference: AF-RFQ-/i)
    .waitFor();
  assert.equal(await responsePage.getByRole("button", { name: "Submit RFQ" }).isEnabled(), true);
  await responsePage.waitForTimeout(250);
  assert.equal(
    await responsePage.evaluate(
      () => (window as unknown as Window & { __rfqMock: { count: number } }).__rfqMock.count,
    ),
    2,
    "An ambiguous network failure must not auto-resubmit.",
  );
  assert.equal(postCount, 0, "The browser test must not send a real RFQ POST.");
  assert.deepEqual(pageErrors, []);

  await responsePage.clock.install();
  await responsePage.evaluate(() => {
    (
      window as unknown as Window & { __rfqMock: { mode: "pending" | "network" | "stall" } }
    ).__rfqMock.mode = "stall";
  });
  await responsePage.getByRole("button", { name: "Submit RFQ" }).click();
  await responsePage
    .locator("#rfq-submit-status")
    .getByText(/RFQ attempt reference: AF-RFQ-.*Delivery is not confirmed/i)
    .waitFor();
  await responsePage.clock.fastForward(45_001);
  await responsePage
    .getByRole("alert")
    .getByText(/within 45 seconds/i)
    .waitFor();
  assert.equal(await responsePage.getByRole("button", { name: "Submit RFQ" }).isEnabled(), true);
  assert.equal(
    await responsePage.evaluate(
      () => (window as unknown as Window & { __rfqMock: { count: number } }).__rfqMock.count,
    ),
    3,
    "A stalled protected fetch must not auto-resubmit.",
  );
  assert.equal(postCount, 0, "A stalled protected fetch must not reach a real RFQ POST.");
  await responsePage.evaluate((reference) => {
    const mock = (
      window as unknown as Window & {
        __rfqMock: { resolve?: (response: Response) => void };
      }
    ).__rfqMock;
    mock.resolve?.(
      new Response(JSON.stringify({ ok: true, reference, emailProviderAccepted: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", "X-RFQ-Reference": reference },
      }),
    );
  }, serverReference);
  await responsePage.waitForTimeout(100);
  assert.equal(await responsePage.getByText("Inquiry Submitted").count(), 0);
  assert.equal(
    await responsePage.getByRole("alert").filter({ hasText: "within 45 seconds" }).count(),
    1,
    "Late fetch resolution must not replace the RFQ timeout warning.",
  );
  await context.close();
  console.log(
    "RFQ browser: preflight recovery, 400 reference, network failure and stalled fetch passed.",
  );
} finally {
  await browser?.close();
  if (!exited) server.kill();
  const timeout = setTimeout(() => {
    if (!exited) server.kill("SIGKILL");
  }, 5000);
  await closed;
  clearTimeout(timeout);
}
