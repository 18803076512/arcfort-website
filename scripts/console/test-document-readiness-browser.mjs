import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE_PATH || "./browser-runtime/node_modules/playwright",
);
const origin = "http://127.0.0.1:3901";
const output = path.resolve(".tmp/console-document-readiness-ui");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext({ serviceWorkers: "block" });
const page = await context.newPage();
const errors = [],
  external = [],
  writes = [],
  screenshots = [];
let groups = 0;
page.on("pageerror", (error) => errors.push(error.message));
await context.route("**/*", async (route) => {
  const request = route.request(),
    url = new URL(request.url());
  if (url.origin !== origin) {
    external.push(url.origin);
    return route.abort();
  }
  if (request.method() !== "GET") {
    writes.push(request.method());
    return route.abort();
  }
  return route.continue();
});
async function visit(route) {
  const response = await page.goto(origin + route);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page.locator("h1").waitFor();
}
async function screenshot(name) {
  const file = path.join(output, name + ".png");
  await page.screenshot({ path: file, fullPage: true });
  screenshots.push(file);
}
async function fits() {
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "No page horizontal overflow",
  );
  assert.equal(await page.locator("h1").count(), 1);
}
try {
  for (const width of [360, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await visit("/console/readiness?q=000");
    await page.getByRole("region", { name: "SKU readiness", exact: true }).waitFor();
    assert.equal(await page.locator("tbody tr").count(), 9);
    assert.ok(
      await page
        .locator("tbody tr")
        .evaluateAll((rows) => rows.every((row) => row.getBoundingClientRect().height < 180)),
      "Document details do not inflate mobile row heights",
    );
    assert.equal(
      await page.locator("tbody tr").first().locator("td").last().locator("a").count(),
      0,
      "Non-working SKU has no unavailable document link",
    );
    assert.equal(
      await page.getByRole("columnheader", { name: "Documents", exact: true }).count(),
      1,
    );
    await fits();
    await screenshot(`list-${width}`);
    await visit("/console/document-readiness");
    assert.match(
      await page.locator("main").innerText(),
      /1 of 5 document versions reviewed; 4 unresolved/,
    );
    assert.equal(await page.locator("dl dt").count(), 4);
    await fits();
    await screenshot(`summary-${width}`);
  }
  groups++;
  await visit("/console/readiness");
  await page.getByRole("combobox", { name: "Blocker", exact: true }).selectOption("documents");
  await page.getByRole("searchbox", { name: "SKU", exact: true }).fill("000");
  await page.getByRole("button", { name: "Apply Filters" }).click();
  await page.waitForURL((url) => url.searchParams.get("blocker") === "documents");
  assert.equal(await page.locator("tbody tr").count(), 3);
  assert.doesNotMatch(
    await page.locator("tbody").innerText(),
    /No documents recorded|0 unresolved/,
  );
  groups++;
  await visit("/console/readiness?q=AF-MIG&blocker=all");
  await page.getByRole("link", { name: "Next Page", exact: true }).click();
  await page.waitForURL((url) => url.searchParams.get("page") === "2");
  assert.equal(new URL(page.url()).searchParams.get("q"), "AF-MIG");
  assert.equal(new URL(page.url()).searchParams.get("blocker"), "all");
  assert.equal(await page.locator("tbody tr").count(), 5);
  await page.getByRole("link", { name: "Previous Page", exact: true }).click();
  await page.waitForURL((url) => url.searchParams.get("page") === "1");
  assert.equal(await page.locator("tbody tr").count(), 25);
  groups++;
  await visit("/console/readiness?q=NO-MATCH");
  assert.equal(await page.locator("tbody tr").count(), 0);
  assert.match(await page.locator("main").innerText(), /No records match this view/);
  await visit("/console/readiness?enabled=false");
  assert.equal(await page.locator('option[value="documents"]').count(), 0);
  assert.equal(await page.getByRole("columnheader", { name: "Documents", exact: true }).count(), 0);
  groups++;
  await visit("/console/document-readiness?state=empty");
  assert.match(await page.locator("main").innerText(), /No documents recorded/);
  assert.doesNotMatch(await page.locator("main").innerText(), /verified|publishable|approved/i);
  await visit("/console/document-readiness?state=reviewed");
  assert.match(
    await page.locator("main").innerText(),
    /2 of 2 document versions reviewed; 0 unresolved/,
  );
  assert.doesNotMatch(
    await page.locator("main").innerText(),
    /ready for publish|publication ready/i,
  );
  const documents = page.getByRole("link", { name: "Technical documents", exact: true });
  await documents.focus();
  assert.equal(await documents.evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press("Enter");
  await page.getByRole("heading", { name: "Technical documents", exact: true }).waitFor();
  groups++;
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  assert.deepEqual(writes, []);
  const report = {
    status: "PASS",
    scope: "Synthetic UI only; no native provider or persisted review",
    groups,
    widths: [360, 390, 768, 1024, 1280, 1440],
    screenshots,
    errors,
    external,
    writes,
  };
  await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
} finally {
  await context.close();
  await browser.close();
}
