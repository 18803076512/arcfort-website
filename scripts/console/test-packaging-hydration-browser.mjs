import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE_PATH || "./browser-runtime/node_modules/playwright",
);

const origin = "http://127.0.0.1:3901";
const url = `${origin}/console/products/a3000000-0000-4000-8000-000000000001/packaging`;
const baseline = process.argv.includes("--baseline");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : process.env.PLAYWRIGHT_CHANNEL
      ? { channel: process.env.PLAYWRIGHT_CHANNEL }
      : {}),
});
const context = await browser.newContext({ serviceWorkers: "block" });
const page = await context.newPage();
const external = [];
const mutations = [];
const pageErrors = [];
const consoleErrors = [];
let releaseScripts;
let firstScriptSeen;
let heldScripts = 0;
const scriptGate = new Promise((resolve) => {
  releaseScripts = resolve;
});
const firstScript = new Promise((resolve) => {
  firstScriptSeen = resolve;
});

page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
await context.route("**/*", async (route) => {
  const request = route.request();
  if (new URL(request.url()).origin !== origin) {
    external.push(request.url());
    return route.abort();
  }
  if (request.method() !== "GET") {
    mutations.push(`${request.method()} ${new URL(request.url()).pathname}`);
    return route.abort();
  }
  if (request.resourceType() === "script") {
    heldScripts++;
    firstScriptSeen();
    await scriptGate;
  }
  return route.continue();
});

const label = (name) => page.getByLabel(name, { exact: true });
try {
  const response = await page.goto(url, { waitUntil: "commit" });
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await label("Package description").waitFor();
  await firstScript;
  assert.ok(heldScripts > 0, "Console JavaScript was actually delayed");

  for (const name of ["Package description", "Quantity", "Proposal or decision reason"]) {
    assert.equal(await label(name).isDisabled(), !baseline, `${name} before hydration`);
  }
  assert.equal(await label("title").isDisabled(), !baseline, "source title before hydration");
  assert.equal(await label("Packaging record").isDisabled(), !baseline);
  assert.equal(await page.getByRole("button", { name: "Reload record" }).isDisabled(), !baseline);
  assert.equal(await page.getByRole("button", { name: "Edit proposal" }).isDisabled(), !baseline);
  assert.equal(await page.getByRole("button", { name: "Approve" }).isDisabled(), true);
  assert.equal(await page.getByRole("status").count(), baseline ? 0 : 1);
  assert.equal(
    await page.getByRole("link", { name: "Products", exact: true }).getAttribute("href"),
    "/console/products/new",
  );

  releaseScripts();
  if (!baseline) {
    await page.getByRole("status").waitFor({ state: "hidden" });
    await page.getByText("Add packaging evidence", { exact: true }).click();
    assert.equal(await label("Package description").isEnabled(), true);
    assert.equal(await label("Quantity").isEnabled(), true);
    assert.equal(await label("Proposal or decision reason").isEnabled(), true);
    assert.equal(await label("title").isEnabled(), true);
    assert.equal(await label("Packaging record").isEnabled(), true);
    assert.equal(await page.getByRole("button", { name: "Reload record" }).isEnabled(), true);
    assert.equal(await page.getByRole("button", { name: "Edit proposal" }).isEnabled(), true);
    await label("Package description").fill("TEST-ONLY hydration retained description");
    await label("Quantity").fill("12");
    await label("Proposal or decision reason").fill("TEST-ONLY retained reason");
    await label("title").fill("TEST-ONLY retained source");
    assert.equal(
      await label("Package description").inputValue(),
      "TEST-ONLY hydration retained description",
    );
    assert.equal(await label("Quantity").inputValue(), "12");
    assert.equal(
      await label("Proposal or decision reason").inputValue(),
      "TEST-ONLY retained reason",
    );
    assert.equal(await label("title").inputValue(), "TEST-ONLY retained source");
  }
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(external, []);
  assert.deepEqual(mutations, []);
  if (!baseline) {
    const noJs = await browser.newContext({ javaScriptEnabled: false, serviceWorkers: "block" });
    try {
      await noJs.route("**/*", (route) => {
        const request = route.request();
        if (new URL(request.url()).origin !== origin) {
          external.push(request.url());
          return route.abort();
        }
        if (request.method() !== "GET") {
          mutations.push(`${request.method()} ${new URL(request.url()).pathname}`);
          return route.abort();
        }
        return route.continue();
      });
      const noJsPage = await noJs.newPage();
      await noJsPage.goto(url);
      assert.equal(await noJsPage.getByLabel("Package description").isDisabled(), true);
      await noJsPage
        .getByRole("navigation", { name: "Console" })
        .getByRole("link", { name: "Products", exact: true })
        .click();
      await noJsPage.waitForURL(`${origin}/console/products/new`);
      assert.deepEqual(external, []);
      assert.deepEqual(mutations, []);
    } finally {
      await noJs.close();
    }
  }
  console.log(
    baseline
      ? `PASS: negative control observed ${heldScripts} delayed Console scripts and unguarded SSR inputs; no external or mutation requests.`
      : `PASS: ${heldScripts} delayed Console scripts, disabled SSR inputs, editable retained values after hydration, native navigation without JavaScript, no external or mutation requests.`,
  );
} finally {
  releaseScripts();
  await context.close();
  await browser.close();
}
