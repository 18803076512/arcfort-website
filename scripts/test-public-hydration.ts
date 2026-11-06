import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import type { Browser } from "./console/browser-runtime/node_modules/playwright/index.js";
import { assertNoRuntimeEnvFiles, assertPortAvailable } from "./console/browser-server.ts";

const { chromium } = createRequire(import.meta.url)(
  "./console/browser-runtime/node_modules/playwright",
) as typeof import("./console/browser-runtime/node_modules/playwright/index.js");
const origin = "http://127.0.0.1:3982";
const paths = [
  "/",
  "/products",
  "/products/mig-mag-torch-parts",
  "/products/mig-mag-torch-parts/mig-gas-nozzle-for-mb15",
  "/about",
  "/distributor-supply",
  "/oem-service",
  "/downloads",
  "/contact",
  "/rfq",
];
const output = ".tmp/public-hydration";
const errors: { path: string; width: number; message: string }[] = [];
const refused: string[] = [];
let activePath = "",
  activeWidth = 0,
  delayMs = 0,
  delayed = 0,
  completed = 0,
  navigationChecks = 0,
  galleryChecks = 0,
  status = "FAIL";
let browser: Browser | undefined;

async function verifyProductGalleryHydration(browser: Browser) {
  const path = "/products/mig-mag-torch-parts/mig-gas-nozzle-for-mb15";
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width, height: 900 },
    });
    try {
      let delayedModules = 0;
      const pageErrors: string[] = [];
      await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
          refused.push(`${request.method()} ${url.origin}`);
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
      assert.equal((await page.goto(origin + path, { waitUntil: "commit" }))?.status(), 200);
      const gallery = page.locator('[data-snippet-region="product-visual"]').first();
      const thumbnails = gallery.getByRole("button");
      const second = thumbnails.nth(1);
      await second.waitFor({ state: "visible" });
      assert.ok((await thumbnails.count()) > 1, "Product must have multiple gallery images.");
      assert.equal(await second.isDisabled(), true, `${width}px thumbnail waits for hydration`);
      const fullImage = gallery.getByRole("link", { name: /View full image/ });
      const firstHref = await fullImage.getAttribute("href");
      assert.ok(firstHref, "Initial full image remains accessible before hydration.");
      await page.waitForLoadState("networkidle");
      assert.ok(delayedModules > 0, "Gallery test must delay client scripts.");
      assert.equal(await second.isEnabled(), true, `${width}px thumbnail becomes ready`);
      await second.click();
      assert.equal(await second.getAttribute("aria-pressed"), "true");
      assert.notEqual(await fullImage.getAttribute("href"), firstHref);
      assert.deepEqual(pageErrors, [], `${width}px gallery page errors`);
      galleryChecks++;
      console.log(`Product gallery selection retained at ${width}px after delayed hydration.`);
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({
    javaScriptEnabled: false,
    serviceWorkers: "block",
    viewport: { width: 390, height: 900 },
  });
  try {
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
        refused.push(`${request.method()} ${url.origin}`);
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    assert.equal((await page.goto(origin + path, { waitUntil: "networkidle" }))?.status(), 200);
    const gallery = page.locator('[data-snippet-region="product-visual"]').first();
    assert.equal(await gallery.getByRole("button").nth(1).isDisabled(), true);
    assert.ok(await gallery.getByRole("link", { name: /View full image/ }).getAttribute("href"));
    galleryChecks++;
    console.log("Product gallery retains a direct image link without JavaScript.");
  } finally {
    await context.close();
  }
}

async function verifyNativeNavigationHydration(browser: Browser) {
  for (const { width, label } of [
    { width: 390, label: "Menu" },
    { width: 1440, label: "Products" },
  ]) {
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width, height: 900 },
    });
    try {
      let delayedModules = 0;
      const pageErrors: string[] = [];
      await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
          refused.push(`${request.method()} ${url.origin}`);
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
      assert.equal((await page.goto(origin, { waitUntil: "commit" }))?.status(), 200);
      const summary = page.locator("summary").filter({ hasText: label }).first();
      await summary.waitFor({ state: "visible" });
      const details = summary.locator("xpath=parent::details");
      await summary.click();
      assert.equal(
        await details.evaluate((element) => (element as HTMLDetailsElement).open),
        true,
        `${label} opens natively`,
      );
      await page.waitForLoadState("networkidle");
      assert.ok(delayedModules > 0, `${label} must exercise delayed scripts`);
      assert.equal(
        await details.evaluate((element) => (element as HTMLDetailsElement).open),
        true,
        `${label} must remain open when hydration finishes`,
      );
      await summary.press("Escape");
      assert.equal(
        await details.evaluate((element) => (element as HTMLDetailsElement).open),
        false,
        `${label} Escape closes`,
      );
      assert.equal(await summary.evaluate((element) => document.activeElement === element), true);
      assert.deepEqual(pageErrors, [], `${label} must not cause browser errors`);
      navigationChecks++;
      console.log(`Native ${label} navigation retained through hydration at ${width}px.`);
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({
    javaScriptEnabled: false,
    serviceWorkers: "block",
    viewport: { width: 390, height: 900 },
  });
  try {
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
        refused.push(`${request.method()} ${url.origin}`);
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    assert.equal((await page.goto(origin, { waitUntil: "networkidle" }))?.status(), 200);
    const summary = page.locator("summary").filter({ hasText: "Menu" }).first();
    await summary.click();
    assert.equal(
      await summary
        .locator("xpath=parent::details")
        .evaluate((element) => (element as HTMLDetailsElement).open),
      true,
    );
    const quoteLink = page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Request a Quote" });
    assert.equal(await quoteLink.getAttribute("href"), "/rfq");
    await quoteLink.click();
    await page.waitForURL(`${origin}/rfq`);
    navigationChecks++;
    console.log("Native mobile navigation reaches RFQ without JavaScript.");
  } finally {
    await context.close();
  }
}

assertNoRuntimeEnvFiles(process.cwd());
await assertPortAvailable(3982);
const env: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  CI: "true",
  NEXT_TELEMETRY_DISABLED: "1",
  CONSOLE_ENABLED: "false",
};
for (const [key, value] of Object.entries(process.env)) {
  if (/^(PATH|SYSTEMROOT|WINDIR|TEMP|TMP|TMPDIR|HOME|USERPROFILE|COMSPEC|PATHEXT)$/i.test(key))
    env[key] = value;
}
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3982"],
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
try {
  let ready = false;
  const deadline = Date.now() + 30_000;
  while (!exited && Date.now() < deadline) {
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      await response.body?.cancel();
      if (response.status === 200) {
        ready = true;
        break;
      }
    } catch {
      // The owned process can take a moment to bind its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready && !exited, "Owned public test server unavailable.");
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {}),
  });
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
      refused.push(`${request.method()} ${url.origin}`);
      return route.abort();
    }
    if (decodeURIComponent(url.pathname).startsWith("/_next/static/chunks/app/(public)/")) {
      delayed++;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    // Delays exercise lazy RSC replay; renderer, HTML and module bytes stay unchanged.
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => {
    errors.push({ path: activePath, width: activeWidth, message: error.message });
  });
  for (const delay of [8, 32, 96, 160, 320, 8]) {
    delayMs = delay;
    for (const width of [360, 1440]) {
      activeWidth = width;
      await page.setViewportSize({ width, height: 1000 });
      for (const path of paths) {
        activePath = path;
        const before = delayed;
        const response = await page.goto(origin + path, { waitUntil: "networkidle" });
        assert.equal(response?.status(), 200, path);
        assert.ok(delayed > before, "Every page must exercise delayed public modules.");
        assert.equal(await page.locator("main#main-content h1").count(), 1, path);
        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
        assert.ok(canonical, path);
        assert.equal(
          new URL(canonical).href,
          new URL(path, "https://www.arcfortweld.com").href,
          path,
        );
        completed++;
      }
      console.log(`Public hydration: ${completed}/120 loads; ${errors.length} page errors.`);
    }
  }
  assert.equal(completed, 120);
  await verifyNativeNavigationHydration(browser);
  await verifyProductGalleryHydration(browser);
  assert.deepEqual(refused, [], "Unexpected external or mutating request.");
  assert.deepEqual(errors, [], "Public hydration regression; see bounded local report.");
  status = "PASS";
} finally {
  await browser?.close();
  if (!exited) server.kill();
  const timeout = setTimeout(() => {
    if (!exited) server.kill("SIGKILL");
  }, 5000);
  await closed;
  clearTimeout(timeout);
  await mkdir(output, { recursive: true });
  await writeFile(
    `${output}/report.json`,
    JSON.stringify(
      { status, completed, delayed, navigationChecks, galleryChecks, errors, refused },
      null,
      2,
    ),
  );
}
