import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE_PATH || "./browser-runtime/node_modules/playwright",
);
const origin = "http://127.0.0.1:3901";
const url = `${origin}/console/products/10000000-0000-4000-8000-000000000001/originals`;
const output = path.resolve(".tmp/console-original-ui");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext();
await context.addCookies([
  {
    name: "arcfort_cookie_scope_probe",
    value: "synthetic-only",
    domain: "127.0.0.1",
    path: "/console",
    httpOnly: true,
    sameSite: "Lax",
  },
]);
const page = await context.newPage();
const errors = [];
const external = [];
const calls = [];
const screenshots = [];
const inspectionCalls = [];
let inspectionFailure = false;
let inspectionWrongSize = false;
let inspectionWait;
const storedRaster = (tiff = false) => {
  const raster = sharp({ create: { width: 32, height: 24, channels: 3, background: "#18705f" } });
  return (tiff ? raster.tiff() : raster.png()).toBuffer();
};
const storedPng = await storedRaster();
const storedTiff = await storedRaster(true);
const bytes = await sharp(
  Buffer.from(Array.from({ length: 64 * 48 * 3 }, (_, i) => (i * 71) % 256)),
  { raw: { width: 64, height: 48, channels: 3 } },
)
  .png()
  .toBuffer();
let code = "unavailable";
page.on("pageerror", (error) => errors.push(error.message));
await context.route("**/*", async (route) => {
  const request = route.request();
  const target = new URL(request.url());
  if (target.origin !== origin) {
    external.push(target.origin);
    return route.abort();
  }
  if (target.pathname === "/api/console/originals") {
    assert.equal(
      ((await request.allHeaders()).cookie ?? "").includes("arcfort_cookie_scope_probe"),
      false,
    );
    return route.fulfill({ status: 404, body: "Synthetic out-of-scope cookie control" });
  }
  if (target.pathname === "/console/originals") {
    assert.equal(request.method(), "POST");
    assert.match(
      (await request.allHeaders()).cookie ?? "",
      /arcfort_cookie_scope_probe=synthetic-only/,
    );
    assert.equal(request.headers()["x-console-command"], "1");
    assert.deepEqual(request.postDataBuffer(), bytes);
    calls.push(JSON.parse(decodeURIComponent(request.headers()["x-console-original"])));
    return route.fulfill({
      status: code ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        code
          ? { ok: false, code, message: "PRIVATE_SENTINEL" }
          : {
              ok: true,
              asset_id: "97000000-0000-4000-8000-000000000002",
              intent_id: "97000000-0000-4000-8000-000000000003",
            },
      ),
    });
  }
  if (target.pathname === "/console/originals/inspect") {
    assert.equal(request.method(), "POST");
    assert.match(
      (await request.allHeaders()).cookie ?? "",
      /arcfort_cookie_scope_probe=synthetic-only/,
    );
    assert.equal(request.headers()["x-console-command"], "1");
    assert.deepEqual(request.postDataJSON(), {
      variant_id: "10000000-0000-4000-8000-000000000001",
      asset_id: "10000000-0000-4000-8000-000000000003",
    });
    inspectionCalls.push(request.postDataJSON());
    await inspectionWait;
    if (inspectionFailure)
      return route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ message: "PRIVATE_SENTINEL" }),
      });
    const tiff = new URL(page.url()).searchParams.get("format") === "tiff";
    const original = tiff ? storedTiff : storedPng;
    return route.fulfill({
      status: 200,
      body: original,
      headers: {
        "content-type": tiff ? "image/tiff" : "image/png",
        "content-length": String(original.length + (inspectionWrongSize ? 1 : 0)),
        "cache-control": "private, no-store, max-age=0",
      },
    });
  }
  assert.equal(request.method(), "GET");
  return route.continue();
});
async function visit(query = "") {
  const response = await page.goto(url + query);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page.getByRole("heading", { name: "Original images", exact: true }).waitFor();
}
async function fill() {
  await page
    .getByLabel("Original image", { exact: true })
    .setInputFiles({ name: "synthetic.png", mimeType: "image/png", buffer: bytes });
  await page.getByLabel("Source type", { exact: true }).selectOption("other_reference");
  await page.getByLabel("Source custodian").fill("Synthetic custodian");
  await page.getByLabel("Source reference", { exact: true }).fill("TEST-ONLY photo source");
  await page.getByRole("img", { name: "Selected original" }).waitFor();
  await page.waitForFunction(
    () => document.querySelector('img[alt="Selected original"]')?.naturalWidth > 0,
  );
}
try {
  await visit();
  assert.equal(
    await page.evaluate(() => document.cookie.includes("arcfort_cookie_scope_probe")),
    false,
  );
  assert.equal(
    await page.evaluate(
      async () => (await fetch("/api/console/originals", { method: "POST" })).status,
    ),
    404,
  );
  await fill();
  await page.getByRole("button", { name: "Upload original", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "The original could not be confirmed" })
    .waitFor();
  assert.doesNotMatch(await page.locator("body").innerText(), /PRIVATE_SENTINEL/);
  assert.equal(
    await page.getByLabel("Source reference", { exact: true }).inputValue(),
    "TEST-ONLY photo source",
  );
  await page.getByRole("button", { name: "Retry upload", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector("fieldset")?.disabled);
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(calls[0].source_kind, "other_reference");
  await page.getByLabel("Source reference", { exact: true }).fill("TEST-ONLY revised source");
  await page.getByRole("button", { name: "Retry upload", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector("fieldset")?.disabled);
  assert.notEqual(calls[2].request_id, calls[1].request_id);
  code = "";
  await page.getByRole("button", { name: "Retry upload", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Original received" }).waitFor();
  assert.deepEqual(calls[2], calls[3]);
  assert.match(await page.getByRole("status").innerText(), /review pending/);
  assert.equal(await page.getByLabel("Original image", { exact: true }).inputValue(), "");
  console.log(
    "PASS original cookie scope: HttpOnly /console cookie reaches uploads, not the old API path.",
  );
  console.log(
    "PASS original UI: exact bytes/metadata, unchanged retry identities, changed-source identity, sanitized errors and pending-review receipt.",
  );
  await fill();
  for (const width of [1440, 1280, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 1000 });
    await page
      .getByRole("button", { name: "Upload original", exact: true })
      .scrollIntoViewIfNeeded();
    await page.evaluate(async () => {
      window.scrollTo(0, 0);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const bounds = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      controls: [...document.querySelectorAll("input,select,button")].filter((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width > 0 && (r.width < 40 || r.height < 40 || r.left < 0 || r.right > innerWidth + 1)
        );
      }).length,
      image: document.querySelector('img[alt="Selected original"]')?.naturalWidth,
    }));
    assert.equal(bounds.overflow, false, `${width}px overflow`);
    assert.equal(bounds.controls, 0, `${width}px controls`);
    assert.equal(bounds.image, 64);
    const file = `original-${width}.png`;
    await page.screenshot({ path: path.join(output, file), fullPage: true });
    screenshots.push(file);
  }
  await page.getByLabel("Source custodian").focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await page
      .getByLabel("Source reference", { exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("link", { name: "Product copy", exact: true }).click();
  assert.equal(page.url(), url);
  await page.getByRole("button", { name: "Clear selection" }).click();
  await page.evaluate(() => {
    const original = URL.revokeObjectURL.bind(URL);
    window.__revokedOriginalUrls = [];
    URL.revokeObjectURL = (url) => {
      window.__revokedOriginalUrls.push(url);
      original(url);
    };
  });
  inspectionFailure = true;
  await page.getByRole("button", { name: "Inspect synthetic-original.png", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "The stored original could not be checked" })
    .waitFor();
  assert.doesNotMatch(await page.locator("body").innerText(), /PRIVATE_SENTINEL/);
  inspectionFailure = false;
  await page.getByRole("button", { name: "Retry original inspection", exact: true }).click();
  const storedImage = page.getByRole("img", {
    name: "Stored original: synthetic-original.png",
    exact: true,
  });
  await storedImage.waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector('img[alt="Stored original: synthetic-original.png"]')?.naturalWidth ===
      32,
  );
  const blobUrl = await storedImage.getAttribute("src");
  assert.match(blobUrl, /^blob:/);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  assert.equal(
    await page.getByLabel("Stored original image", { exact: true }).getAttribute("data-fit"),
    "false",
  );
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "Zoom in", exact: true }).isDisabled(), true);
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await page.getByRole("button", { name: "Fit original", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download original", exact: true }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), "synthetic-original.png");
  const downloaded = [];
  for await (const chunk of await download.createReadStream()) downloaded.push(chunk);
  assert.deepEqual(Buffer.concat(downloaded), storedPng);
  for (const width of [1440, 1280, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 1000 });
    await page
      .getByRole("region", { name: "Stored original inspection", exact: true })
      .scrollIntoViewIfNeeded();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
    );
    const viewport = await page.getByLabel("Stored original image", { exact: true }).boundingBox();
    const displayed = await storedImage.boundingBox();
    assert.ok(
      viewport &&
        displayed &&
        displayed.width <= viewport.width &&
        displayed.height <= viewport.height,
    );
    const file = `inspection-${width}.png`;
    await page.screenshot({ path: path.join(output, file), fullPage: true });
    screenshots.push(file);
  }
  await page.getByRole("button", { name: "Close original inspection", exact: true }).click();
  assert.equal(
    await page.getByRole("region", { name: "Stored original inspection", exact: true }).count(),
    0,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Inspect synthetic-original.png", exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  assert.equal(
    await page.evaluate((url) => window.__revokedOriginalUrls.includes(url), blobUrl),
    true,
  );
  inspectionWrongSize = true;
  await page.getByRole("button", { name: "Inspect synthetic-original.png", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "The stored original could not be checked" })
    .waitFor();
  assert.equal(await page.getByRole("link", { name: "Download original", exact: true }).count(), 0);
  inspectionWrongSize = false;
  await page.getByRole("button", { name: "Close original inspection", exact: true }).click();
  let continueInspection;
  inspectionWait = new Promise((resolve) => {
    continueInspection = resolve;
  });
  const beforeCancel = inspectionCalls.length;
  await page.getByRole("button", { name: "Inspect synthetic-original.png", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Checking stored original" }).waitFor();
  while (inspectionCalls.length === beforeCancel) await page.waitForTimeout(10);
  await page.getByRole("button", { name: "Close original inspection", exact: true }).click();
  continueInspection();
  inspectionWait = undefined;
  await page.waitForTimeout(100);
  assert.equal(
    await page.getByRole("region", { name: "Stored original inspection", exact: true }).count(),
    0,
  );
  for (const role of ["viewer", "publisher"]) {
    await visit(`?role=${role}`);
    assert.equal(await page.getByRole("button", { name: "Upload original" }).count(), 0);
    await page.getByText("Read-only access", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Inspect synthetic-original.png", exact: true }).click();
    await page
      .getByRole("img", { name: "Stored original: synthetic-original.png", exact: true })
      .waitFor();
  }
  for (const role of ["editor", "reviewer"]) {
    await visit(`?role=${role}`);
    assert.equal(await page.getByRole("button", { name: "Upload original" }).count(), 1);
  }
  await visit("?state=pending");
  await page.getByText("Upload incomplete", { exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Inspect synthetic-original.png", exact: true })
      .isDisabled(),
    true,
  );
  await visit("?state=stale");
  await page.getByText("Product identity changed", { exact: true }).waitFor();
  await visit("?format=tiff");
  await page.getByRole("button", { name: "Inspect synthetic-original.tiff", exact: true }).click();
  await page.getByRole("link", { name: "Download original", exact: true }).waitFor();
  await page.getByText("TIFF original; inline preview unavailable", { exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Zoom in", exact: true }).count(), 0);
  console.log(
    "PASS stored-original inspection: exact cookie-scoped request/bytes, download, zoom, six widths, role access, retry, close/abort/revoke and TIFF state.",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        status: "PASS",
        scope: "Synthetic UI and intercepted transport; no Auth/Storage persistence",
        groups: 5,
        screenshots,
        pageErrors: errors.length,
        externalRequests: external.length,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "PASS original UI: six viewport screenshots, original image loading, keyboard/unsaved-input controls and role/history states.",
  );
} finally {
  await context.close();
  await browser.close();
}
