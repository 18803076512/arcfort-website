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
  status = "FAIL";
let browser: Browser | undefined;

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
    JSON.stringify({ status, completed, delayed, errors, refused }, null, 2),
  );
}
