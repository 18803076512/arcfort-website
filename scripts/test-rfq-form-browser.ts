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
          errors: { quantity: "Synthetic correction only." },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", "X-RFQ-Reference": reference },
        },
      ),
    );
  }, serverReference);
  await responsePage.getByText("Synthetic correction only.").waitFor();
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
