import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE_PATH || "./browser-runtime/node_modules/playwright",
);
const origin = "http://127.0.0.1:3901";
const id = (n) => `a4000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const url = `${origin}/console/products/${id(1)}/documents`;
const output = path.resolve(".tmp/console-document-ui");
await mkdir(output, { recursive: true });
const pdf = await PDFDocument.create();
pdf.addPage([100, 100]);
const base = Buffer.from(await pdf.save({ useObjectStreams: false }));
const eof = base.lastIndexOf("%%EOF");
assert.ok(base.length < 1022);
// Match the synthetic library manifest with a legal trailing comment, not real evidence.
const bytes = Buffer.concat([
  base.subarray(0, eof),
  Buffer.from("%"),
  Buffer.alloc(1024 - base.length - 2, 65),
  Buffer.from("\n"),
  base.subarray(eof),
]);
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext({ serviceWorkers: "block" });
const page = await context.newPage();
const commands = [],
  uploads = [],
  errors = [],
  external = [],
  screenshots = [];
const inspections = [];
let inspectionMode = "success";
let pendingInspection;
let reportPending;
let commandCode = "unavailable",
  uploadCode = "unavailable",
  wrongReceipt = false,
  groups = 0;
let confirmLeave = false;
page.on("pageerror", (error) => errors.push(error.message));
await context.addInitScript(() => {
  window.documentUrls = { created: [], revoked: [] };
  const create = URL.createObjectURL.bind(URL),
    revoke = URL.revokeObjectURL.bind(URL);
  URL.createObjectURL = (blob) => {
    const url = create(blob);
    window.documentUrls.created.push(url);
    return url;
  };
  URL.revokeObjectURL = (url) => {
    window.documentUrls.revoked.push(url);
    revoke(url);
  };
});
page.on("dialog", (dialog) =>
  dialog.type() === "beforeunload" || confirmLeave ? dialog.accept() : dialog.dismiss(),
);
await context.route("**/*", async (route) => {
  const request = route.request(),
    target = new URL(request.url());
  if (target.origin !== origin) {
    external.push(target.origin);
    return route.abort();
  }
  if (target.pathname === "/console/documents/inspect") {
    assert.equal(request.method(), "POST");
    assert.equal(request.headers()["x-console-command"], "1");
    const input = request.postDataJSON();
    assert.deepEqual(input, { variant_id: id(1), document_id: id(103) });
    inspections.push(input);
    const finish = () =>
      route.fulfill({
        status: inspectionMode === "denied" ? 409 : 200,
        headers: {
          "content-type": "application/pdf",
          "content-length": "1024",
          "x-console-document": encodeURIComponent(
            JSON.stringify({
              document_id: inspectionMode === "wrong" ? id(999) : id(103),
              filename: "synthetic.pdf",
              byte_size: 1024,
              page_count: inspectionMode === "pages" ? 2 : 1,
            }),
          ),
        },
        body: inspectionMode === "short" ? bytes.subarray(0, 1000) : bytes,
      });
    if (inspectionMode === "wait") {
      pendingInspection = finish;
      reportPending();
      return;
    }
    return finish();
  }
  if (["/console/commands", "/console/documents/upload"].includes(target.pathname)) {
    assert.equal(request.method(), "POST");
    assert.equal(request.headers()["x-console-command"], "1");
    const upload = target.pathname.endsWith("/upload");
    let result;
    if (upload) {
      const input = JSON.parse(decodeURIComponent(request.headers()["x-console-document"]));
      assert.deepEqual(request.postDataBuffer(), bytes);
      assert.equal(input.filename, "synthetic.pdf");
      assert.equal(input.byte_size, bytes.length);
      assert.equal(request.headers()["content-type"], "application/pdf");
      uploads.push(input);
      result = {
        ok: true,
        document_id: wrongReceipt ? id(999) : input.document_id,
        intent_id: id(300),
      };
    } else {
      commands.push(request.postDataJSON());
      result = { ok: true, result: { document_id: id(400), link_id: id(401) } };
    }
    const code = upload ? uploadCode : commandCode;
    return route.fulfill({
      status: code ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(code ? { ok: false, code, message: "PRIVATE_SENTINEL" } : result),
    });
  }
  assert.equal(request.method(), "GET");
  return route.continue();
});
const label = (name) =>
  ["Source class", "Document type"].includes(name)
    ? page.getByRole("combobox", { name, exact: true })
    : page.getByLabel(name, { exact: true });
const button = (name) => page.getByRole("button", { name, exact: true });
async function visit(query = "", global = false) {
  const response = await page.goto((global ? `${origin}/console/documents` : url) + query);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page
    .getByRole("heading", {
      name: global ? "Technical Library" : "Technical documents",
      exact: true,
    })
    .waitFor();
}
async function fill(title = "Synthetic new document") {
  for (const [name, value] of [
    ["Document title", title],
    ["Source custodian", "Synthetic custodian"],
    ["Source reference", "TEST-ONLY source"],
    ["Page or section", "Synthetic page 1"],
    ["Exact-SKU scope", "Synthetic scope only"],
  ])
    await label(name).fill(value);
}
async function failed() {
  await page.locator('.console-command-error[role="alert"]').waitFor();
  assert.doesNotMatch(await page.locator("body").innerText(), /PRIVATE_SENTINEL/);
}
async function selectPdf(n = 1) {
  await button(`Upload original for Synthetic drawing ${n}`).click();
  assert.equal(
    await label("PDF original").evaluate((element) => document.activeElement === element),
    true,
  );
  await label("PDF original").setInputFiles({
    name: "synthetic.pdf",
    mimeType: "application/pdf",
    buffer: bytes,
  });
}
try {
  await visit();
  await fill();
  await button("Register reference").click();
  await failed();
  assert.equal(commands.at(-1).copy.issued_date, null);
  assert.equal(commands.at(-1).copy.revision_label, null);
  assert.equal(commands.at(-1).prior_document_id, null);
  const request = commands.at(-1).request_id;
  await button("Register reference").click();
  await failed();
  assert.equal(commands.at(-1).request_id, request);
  await label("Source class").selectOption("official_manufacturer");
  await button("Register reference").click();
  await failed();
  assert.equal(commands.at(-1).copy.source_level, "B");
  assert.notEqual(commands.at(-1).request_id, request);
  groups++;
  await button("Clear reference draft").click();
  await button("New version of Synthetic drawing 1").click();
  assert.equal(await label("Document title").inputValue(), "");
  assert.equal(await label("Issued date (optional)").inputValue(), "");
  await fill("Synthetic revision");
  await button("Register reference").click();
  await failed();
  assert.equal(commands.at(-1).prior_document_id, id(100));
  commandCode = "";
  await button("Register reference").click();
  await page.getByRole("status").filter({ hasText: "Reference registered" }).waitFor();
  assert.equal(await label("Document title").inputValue(), "");
  groups++;
  await visit();
  await selectPdf();
  await button("Upload PDF").click();
  await failed();
  const uploadRequest = { ...uploads.at(-1) };
  await button("Retry PDF upload").click();
  await failed();
  assert.deepEqual(uploads.at(-1), uploadRequest);
  uploadCode = "";
  wrongReceipt = true;
  await button("Retry PDF upload").click();
  await failed();
  assert.equal(await label("PDF original").evaluate((element) => element.files.length), 1);
  wrongReceipt = false;
  await button("Retry PDF upload").click();
  await page
    .getByRole("status")
    .filter({ hasText: "Document rights and exact-SKU review pending" })
    .waitFor();
  assert.equal(await label("PDF original").count(), 0);
  groups++;
  await visit();
  uploadCode = "unavailable";
  await selectPdf(2);
  await button("Upload PDF").click();
  await failed();
  assert.equal(uploads.at(-1).request_id, id(200));
  await visit();
  await selectPdf(2);
  await button("Upload PDF").click();
  await failed();
  assert.equal(uploads.at(-1).request_id, id(200));
  groups++;
  await visit();
  assert.ok(await button("Upload original for Synthetic drawing 3").isDisabled());
  assert.ok(await button("Upload original for Synthetic drawing 4").isDisabled());
  await visit("?stale=1");
  assert.ok(await button("New version of Synthetic drawing 1").isDisabled());
  assert.ok(await button("Upload original for Synthetic drawing 1").isDisabled());
  for (const role of ["viewer", "publisher"]) {
    await visit(`?role=${role}`);
    assert.equal(await page.locator("form").count(), 0);
    assert.match(await page.locator("body").innerText(), /Read-only access/);
  }
  groups++;
  await visit();
  await fill();
  await page
    .getByRole("navigation", { name: "Console", exact: true })
    .getByRole("link", { name: "Technical Library" })
    .click();
  assert.equal(page.url(), url);
  assert.equal(await label("Document title").inputValue(), "Synthetic new document");
  confirmLeave = true;
  await page
    .getByRole("navigation", { name: "Console", exact: true })
    .getByRole("link", { name: "Technical Library" })
    .click();
  await page.getByRole("heading", { name: "Technical Library", exact: true }).waitFor();
  confirmLeave = false;
  assert.equal(await page.locator("form").count(), 0);
  groups++;
  await visit("?many=1", true);
  assert.equal(await page.locator("tbody tr").count(), 25);
  assert.match(
    await page.getByRole("navigation", { name: "Pagination" }).innerText(),
    /27 records/,
  );
  assert.equal(
    await page.getByRole("link", { name: "Next Page", exact: true }).getAttribute("href"),
    "/console/documents?page=2",
  );
  await visit("?many=1&page=2", true);
  assert.equal(await page.locator("tbody tr").count(), 2);
  await visit("?many=1&page=3", true);
  assert.equal(await page.locator("tbody tr").count(), 0);
  assert.match(
    await page.getByRole("navigation", { name: "Pagination" }).innerText(),
    /27 records/,
  );
  await visit("?empty=1");
  assert.match(await page.locator("body").innerText(), /No records match/);
  groups++;
  await visit();
  await label("Document title").focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await label("Document type").evaluate((element) => document.activeElement === element),
    true,
  );
  await page.getByRole("region", { name: "Document references", exact: true }).focus();
  assert.equal(
    await page
      .getByRole("region", { name: "Document references", exact: true })
      .evaluate((element) => document.activeElement === element),
    true,
  );
  groups++;
  for (const width of [1440, 1280, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 1000 });
    await visit("?long=1");
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `Page overflow at ${width}`,
    );
    const controls = await page.locator("input,select,button").evaluateAll((elements) =>
      elements
        .filter((e) => e.getBoundingClientRect().width > 0)
        .map((e) => ({
          tag: e.tagName,
          left: e.getBoundingClientRect().left,
          right: e.getBoundingClientRect().right,
          parent: !!e.closest(".console-table-wrap"),
        })),
    );
    assert.ok(
      controls.filter((e) => !e.parent).every((e) => e.left >= 0 && e.right <= width + 1),
      `Control overflow at ${width}`,
    );
    const file = path.join(output, `documents-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const stats = await sharp(file).stats();
    assert.ok(stats.channels.some((channel) => channel.stdev > 15));
    screenshots.push(file);
  }
  groups++;
  assert.deepEqual(errors, []);
  await page.getByRole("button", { name: /^Upload original for Synthetic drawing 1 / }).click();
  await label("PDF original").waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  const uploadShot = path.join(output, "documents-upload-360.png");
  await page.screenshot({ path: uploadShot, fullPage: true });
  screenshots.push(uploadShot);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit("", true);
  const globalShot = path.join(output, "documents-global-1440.png");
  await page.screenshot({ path: globalShot, fullPage: true });
  screenshots.push(globalShot);
  groups++;
  for (const role of ["owner", "viewer", "publisher"]) {
    await visit(`?role=${role}`);
    for (const n of [1, 2, 3])
      assert.ok(await button(`Inspect original for Synthetic drawing ${n}`).isDisabled());
    await button("Inspect original for Synthetic drawing 4").click();
    const panel = page.getByRole("region", { name: "Stored document inspection" });
    await panel.getByRole("link", { name: "Download PDF original" }).waitFor();
    assert.equal(await panel.locator("iframe,embed,object").count(), 0);
    assert.ok(await panel.getByRole("heading").evaluate((el) => el === document.activeElement));
    assert.match(await panel.innerText(), /Rights and exact-SKU review separate/);
    const received = page.waitForEvent("download");
    await panel.getByRole("link", { name: "Download PDF original" }).click();
    const file = await received;
    assert.equal(file.suggestedFilename(), "synthetic.pdf");
    const chunks = [];
    for await (const chunk of await file.createReadStream()) chunks.push(chunk);
    assert.deepEqual(Buffer.concat(chunks), bytes);
    await button("Close document inspection").click();
    assert.ok(
      await button("Inspect original for Synthetic drawing 4").evaluate(
        (el) => el === document.activeElement,
      ),
    );
    const urls = await page.evaluate(() => window.documentUrls);
    assert.deepEqual(urls.revoked, urls.created);
  }
  groups++;
  await visit("?stale=1");
  assert.ok(await button("Inspect original for Synthetic drawing 4").isDisabled());
  await visit();
  for (const mode of ["wrong", "pages", "short", "denied"]) {
    inspectionMode = mode;
    await button("Inspect original for Synthetic drawing 4").click();
    await failed();
    assert.equal(await page.getByRole("link", { name: "Download PDF original" }).count(), 0);
    inspectionMode = "success";
    await button("Retry document inspection").click();
    await page.getByRole("link", { name: "Download PDF original" }).waitFor();
    await button("Close document inspection").click();
  }
  groups++;
  inspectionMode = "wait";
  const pendingSeen = new Promise((resolve) => {
    reportPending = resolve;
  });
  await button("Inspect original for Synthetic drawing 4").click();
  await page.getByRole("status").filter({ hasText: "Checking stored PDF" }).waitFor();
  await pendingSeen;
  assert.ok(pendingInspection);
  await button("Close document inspection").click();
  await pendingInspection();
  inspectionMode = "success";
  await button("Inspect original for Synthetic drawing 4").click();
  await page.getByRole("link", { name: "Download PDF original" }).waitFor();
  await button("Close document inspection").click();
  const lifecycle = await page.evaluate(() => window.documentUrls);
  assert.deepEqual(lifecycle.revoked, lifecycle.created);
  groups++;
  for (const width of [1440, 360]) {
    await page.setViewportSize({ width, height: 1000 });
    await visit("?long=1", true);
    await page.getByRole("button", { name: /^Inspect original for Synthetic drawing 4 / }).click();
    await page.getByRole("link", { name: "Download PDF original" }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const shot = path.join(output, `documents-inspection-${width}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    screenshots.push(shot);
  }
  groups++;
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  const result = {
    status: "PASS",
    groups,
    commandPosts: commands.length,
    uploadPosts: uploads.length,
    inspectionPosts: inspections.length,
    screenshots,
    pageErrors: errors.length,
    externalRequests: external.length,
    scope:
      "Synthetic component/transport checks only; no Auth, DB, private upload, human approval or native acceptance.",
  };
  await writeFile(path.join(output, "result.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
} finally {
  await context.close();
  await browser.close();
}
