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
  for (const role of ["viewer", "publisher"]) {
    await visit(`?role=${role}`);
    assert.equal(await page.getByRole("button", { name: "Upload original" }).count(), 0);
    await page.getByText("Read-only access", { exact: true }).waitFor();
  }
  for (const role of ["editor", "reviewer"]) {
    await visit(`?role=${role}`);
    assert.equal(await page.getByRole("button", { name: "Upload original" }).count(), 1);
  }
  await visit("?state=pending");
  await page.getByText("Upload incomplete", { exact: true }).waitFor();
  await visit("?state=stale");
  await page.getByText("Product identity changed", { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        status: "PASS",
        scope: "Synthetic UI and intercepted transport; no Auth/Storage persistence",
        groups: 4,
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
