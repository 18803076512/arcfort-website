import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE_PATH || "./browser-runtime/node_modules/playwright",
);
const origin = "http://127.0.0.1:3901";
const id = (n) => `a4000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const url = `${origin}/console/products/${id(1)}/documents/${id(103)}`;
const output = path.resolve(".tmp/console-document-review-ui");
await mkdir(output, { recursive: true });
const pdf = await PDFDocument.create();
pdf.addPage([100, 100]);
const base = Buffer.from(await pdf.save({ useObjectStreams: false }));
const eof = base.lastIndexOf("%%EOF");
assert.ok(base.length < 1022);
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
const errors = [],
  external = [],
  commands = [],
  inspections = [],
  screenshots = [];
let inspectionMode = "success",
  commandCode = "unavailable",
  groups = 0,
  acceptDialog = false;
let lastToken = "";
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
page.on("pageerror", (error) => errors.push(error.message));
page.on("dialog", (dialog) =>
  dialog.type() === "beforeunload" || acceptDialog ? dialog.accept() : dialog.dismiss(),
);
await context.route("**/*", async (route) => {
  const request = route.request(),
    target = new URL(request.url());
  if (target.origin !== origin) {
    external.push(target.origin);
    return route.abort();
  }
  if (target.pathname === "/console/commands") {
    assert.equal(request.method(), "POST");
    assert.equal(request.headers()["x-console-command"], "1");
    commands.push(request.postDataJSON());
    return route.fulfill({
      status: commandCode ? 409 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        commandCode
          ? { ok: false, code: commandCode, message: "PRIVATE_SENTINEL" }
          : { ok: true, result: { candidate_id: id(201), revision: 1, digest: "b".repeat(64) } },
      ),
    });
  }
  if (target.pathname === "/console/documents/inspect") {
    assert.equal(request.method(), "POST");
    assert.equal(request.headers()["x-console-command"], "1");
    const input = request.postDataJSON();
    assert.deepEqual(input, {
      candidate_id: id(201),
      revision: 1,
      digest: "b".repeat(64),
    });
    inspections.push(input);
    const now = Math.floor(Date.now() / 1000);
    lastToken = [
      "document-v1",
      id(900),
      id(20),
      id(901),
      id(201),
      id(103),
      id(1),
      "1",
      "b".repeat(64),
      "a".repeat(64),
      "c".repeat(64),
      String(inspectionMode === "expired" ? now - 301 : now),
      String(inspectionMode === "expired" ? now - 1 : now + 300),
      id(902),
      "d".repeat(64),
    ].join("|");
    const headers = {
      "content-type": "application/pdf",
      "content-length": "1024",
      "x-console-document": encodeURIComponent(
        JSON.stringify({
          document_id: id(103),
          filename: "synthetic.pdf",
          byte_size: 1024,
          page_count: 1,
        }),
      ),
    };
    if (inspectionMode !== "unsigned")
      headers["x-console-document-observation"] =
        inspectionMode === "wrong" ? lastToken.replace(id(201), id(999)) : lastToken;
    return route.fulfill({
      status: inspectionMode === "denied" ? 409 : 200,
      headers,
      body: inspectionMode === "short" ? bytes.subarray(0, 1000) : bytes,
    });
  }
  assert.equal(request.method(), "GET");
  return route.continue();
});
const button = (name) => page.getByRole("button", { name, exact: true });
const field = (name) =>
  ["Review scope", "Conflict resolution"].includes(name)
    ? page.getByRole("textbox", { name, exact: true })
    : ["Rights evidence", "Exact-scope evidence"].includes(name)
      ? page.getByRole("combobox", { name, exact: true })
      : page.getByLabel(name, { exact: true });
const ack = [
  "I inspected this original document",
  "I confirm the usage rights for this document",
  "I confirm the exact SKU scope",
];
async function visit(query = "") {
  const response = await page.goto(url + query);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page.getByRole("heading", { name: "Document review", exact: true }).waitFor();
}
async function wait(check) {
  for (let n = 0; n < 150; n++) {
    if (await check()) return;
    await page.waitForTimeout(50);
  }
  assert.fail("Expected UI state did not arrive");
}
async function commandAfter(action) {
  const before = commands.length;
  await action();
  await wait(() => commands.length === before + 1);
  await page.locator(".console-document-review").getByRole("alert").waitFor();
  assert.doesNotMatch(await page.locator("body").innerText(), /PRIVATE_SENTINEL/);
  return commands.at(-1);
}
async function inspect() {
  await button("Inspect review original").click();
  await page
    .getByRole("region", { name: "Stored document inspection" })
    .getByText("Stored bytes checked", { exact: true })
    .waitFor();
  await wait(async () => !(await field(ack[0]).isDisabled()));
}
async function approvalFields() {
  await field("Reason").fill("TEST-ONLY human decision");
  await field("Rights evidence").selectOption(id(300));
  await field("Exact-scope evidence").selectOption(id(301));
  await field("Conflict resolution").fill("TEST-ONLY resolution, not a real claim");
}
async function capture(name) {
  const file = path.join(output, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  screenshots.push(file);
}
try {
  for (const role of ["viewer", "publisher", "editor", "reviewer", "owner"]) {
    await visit(`?role=${role}`);
    assert.equal(
      await button("Add evidence").count(),
      ["owner", "editor", "reviewer"].includes(role) ? 1 : 0,
    );
    assert.equal(
      await button("Record approval").count(),
      ["owner", "reviewer"].includes(role) ? 1 : 0,
    );
    assert.equal(await button("Save review draft").count(), 0);
    if (["owner", "reviewer"].includes(role))
      assert.equal(await button("Record approval").isDisabled(), true);
  }
  groups++;

  await visit("?state=missing");
  await page.getByText("Current original unavailable", { exact: true }).waitFor();
  assert.equal(await button("Save review draft").isDisabled(), true);
  assert.equal(await button("Add evidence").isDisabled(), true);
  await visit("?state=approved");
  await page.getByText("Rights and scope reviewed", { exact: true }).waitFor();
  await visit("?state=successor");
  await page.getByText("Document review incomplete", { exact: true }).waitFor();
  await page.getByText("Current rights and scope decision", { exact: true }).waitFor();
  await page.getByText("Open review remains", { exact: true }).waitFor();
  await capture("current-and-open");
  groups++;

  await visit();
  await button("Add evidence").click();
  for (const [name, value] of [
    ["Evidence title", "TEST-ONLY catalog"],
    ["Evidence owner", "Synthetic owner"],
    ["Evidence reference", "TEST-ONLY"],
    ["Evidence location", "Page 1"],
    ["Evidence scope", "Synthetic scope"],
  ])
    await field(name).fill(value);
  assert.equal(await button("Record approval").isDisabled(), true);
  let sent = await commandAfter(() => button("Register evidence").click());
  assert.equal(sent.action, "document_source");
  assert.equal(sent.source.assertion, "reference_only");
  assert.equal(sent.source.evidence_date, null);
  assert.equal(sent.source.revision_label, null);
  assert.equal(sent.source.evidence_basis, "company_catalog");
  await button("Discard evidence draft").click();
  assert.equal(await field("Evidence title").count(), 1);
  acceptDialog = true;
  await button("Discard evidence draft").click();
  acceptDialog = false;
  assert.equal(await field("Evidence title").count(), 0);
  groups++;

  await visit("?state=draft&role=editor");
  await field("Review scope").fill("TEST-ONLY revised scope");
  await field("Reason").fill("TEST-ONLY new proposal");
  assert.equal(await button("Submit review").isDisabled(), true);
  assert.equal(await button("Add evidence").isDisabled(), true);
  sent = await commandAfter(() => button("Save review draft").click());
  assert.equal(sent.action, "document_propose");
  assert.equal(sent.revision, 1);
  assert.equal(sent.copy.scope_note, "TEST-ONLY revised scope");
  assert.deepEqual(sent.copy.sources, [id(300), id(301)]);
  const previous = sent.request_id;
  sent = await commandAfter(() => button("Save review draft").click());
  assert.equal(sent.request_id, previous);
  groups++;

  await visit("?state=draft&role=reviewer");
  assert.equal(await button("Save review draft").count(), 0);
  sent = await commandAfter(() => button("Submit review").click());
  assert.equal(sent.action, "document_submit");
  assert.equal(sent.candidate_id, id(201));
  assert.equal(sent.digest, "b".repeat(64));
  groups++;

  await visit();
  await approvalFields();
  for (const name of ack) assert.equal(await field(name).isDisabled(), true);
  await inspect();
  assert.equal(await button("Record approval").isDisabled(), true);
  for (const name of ack) await field(name).check();
  assert.equal(await field(ack[0]).evaluate((input) => getComputedStyle(input).appearance), "auto");
  await capture("approval-ready");
  sent = await commandAfter(() => button("Record approval").click());
  assert.equal(sent.action, "document_review");
  assert.equal(sent.decision, "APPROVE");
  assert.equal(sent.observation, lastToken);
  assert.equal(sent.rights_source_id, id(300));
  assert.equal(sent.scope_source_id, id(301));
  assert.equal(sent.confirmation.original_inspected, true);
  assert.equal(sent.confirmation.usage_rights_confirmed, true);
  assert.equal(sent.confirmation.exact_scope_confirmed, true);
  assert.equal(sent.replacement, null);
  assert.doesNotMatch(await page.content(), /document-v1\|/);
  assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
  await button("Close document inspection").click();
  assert.equal(await button("Record approval").isDisabled(), true);
  assert.equal(await field(ack[0]).isChecked(), false);
  const urls = await page.evaluate(() => window.documentUrls);
  assert.ok(urls.created.length > 0);
  assert.ok(urls.created.every((value) => urls.revoked.includes(value)));
  groups++;

  for (const mode of ["unsigned", "wrong", "expired", "short", "denied"]) {
    await visit();
    inspectionMode = mode;
    await button("Inspect review original").click();
    await page
      .getByRole("region", { name: "Stored document inspection" })
      .getByRole("alert")
      .waitFor();
    assert.equal(await field(ack[0]).isDisabled(), true);
    assert.equal(await button("Record approval").isDisabled(), true);
    assert.equal(await page.getByRole("link", { name: "Download PDF original" }).count(), 0);
  }
  inspectionMode = "success";
  groups++;

  await visit();
  await page.clock.install();
  await approvalFields();
  await inspect();
  for (const name of ack) await field(name).check();
  await page.clock.fastForward(301000);
  assert.equal(await field(ack[0]).isChecked(), false);
  assert.equal(await field(ack[0]).isDisabled(), true);
  assert.equal(await button("Record approval").isDisabled(), true);
  // Reset only this synthetic browser clock before requesting a newly issued token.
  await page.clock.setSystemTime(Date.now());
  const count = inspections.length;
  await inspect();
  // Development Strict Mode may replay the mount, cancelling its first read.
  assert.ok(inspections.length > count && inspections.length <= count + 2);
  for (const name of ack) assert.equal(await field(name).isChecked(), false);
  groups++;

  await visit();
  await field("Edit").check();
  await field("Review scope").fill("TEST-ONLY atomic correction");
  await field("Reason").fill("TEST-ONLY correction reason");
  sent = await commandAfter(() => button("Save correction").click());
  assert.equal(sent.decision, "EDIT");
  assert.equal(sent.observation, null);
  assert.equal(sent.confirmation, null);
  assert.equal(sent.replacement.scope_note, "TEST-ONLY atomic correction");
  await field("Reject").check();
  assert.equal(await button("Reject review").isDisabled(), true);
  groups++;

  await visit("?state=stale");
  assert.equal(await button("Inspect review original").isDisabled(), true);
  await field("Reject").check();
  await field("Reason").fill("TEST-ONLY stale rejection");
  sent = await commandAfter(() => button("Reject review").click());
  assert.equal(sent.decision, "REJECT");
  assert.equal(sent.observation, null);
  assert.equal(sent.confirmation, null);
  assert.equal(sent.replacement, null);
  assert.equal(sent.resolution, "");
  groups++;

  await visit();
  commandCode = "40001";
  await field("Reject").check();
  await field("Reason").fill("TEST-ONLY stale command");
  await commandAfter(() => button("Reject review").click());
  assert.equal(await button("Reject review").isDisabled(), true);
  const beforeReload = page.url();
  await button("Reload review").click();
  assert.equal(page.url(), beforeReload);
  assert.equal(await field("Reason").inputValue(), "TEST-ONLY stale command");
  acceptDialog = true;
  await button("Reload review").click();
  await wait(async () => (await field("Reason").inputValue()) === "");
  acceptDialog = false;
  commandCode = "unavailable";
  groups++;

  await visit("?many=1&state=draft&role=editor");
  await field("Review scope").fill("TEST-ONLY unsaved scope across pages");
  await field("Select Synthetic evidence 3").check();
  await button("Next source page").click();
  await wait(() => new URL(page.url()).searchParams.get("source_page") === "2");
  await page
    .getByRole("navigation", { name: "source pagination" })
    .getByText("28 records / Page 2 of 2")
    .waitFor();
  assert.equal(await field("Review scope").inputValue(), "TEST-ONLY unsaved scope across pages");
  assert.equal(
    await page
      .getByRole("region", { name: "Document evidence", exact: true })
      .getByRole("row")
      .count(),
    6,
  );
  await button("Next history page").click();
  await page
    .getByRole("navigation", { name: "history pagination" })
    .getByText("30 records / Page 2 of 2")
    .waitFor();
  assert.equal(
    await page.getByRole("region", { name: "Document review history" }).getByRole("row").count(),
    6,
  );
  await button("Previous source page").click();
  await field("Select Synthetic evidence 3").waitFor();
  assert.equal(await field("Select Synthetic evidence 3").isChecked(), true);
  groups++;

  for (const width of [360, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await visit("?long=1");
    await button("Add evidence").click();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
      `Overflow at ${width}`,
    );
    const controls = await page
      .locator(".console-review-options input")
      .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().width));
    assert.ok(controls.every((value) => value === 18));
    await capture(`review-${width}`);
  }
  groups++;

  await visit();
  commandCode = "";
  await field("Reject").check();
  await field("Reason").fill("TEST-ONLY successful transport");
  await button("Reject review").click();
  await page.getByText("Decision recorded.", { exact: true }).waitFor();
  assert.equal(await page.locator(".console-document-review").getByRole("alert").count(), 0);
  groups++;
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await writeFile(
    path.join(output, "report.json"),
    JSON.stringify(
      {
        groups,
        commands: commands.length,
        inspections: inspections.length,
        screenshots,
        pageErrors: errors,
        externalRequests: external,
        scope:
          "Actual React components with synthetic fixture DTOs and mocked transport. No native provider, persisted command, human approval or real document evidence.",
      },
      null,
      2,
    ),
  );
  console.log(
    `Document review browser PASS: ${groups} groups, ${screenshots.length} screenshots, ${commands.length} command requests, ${inspections.length} inspections, zero page errors/external requests. Synthetic only.`,
  );
} catch (error) {
  console.error(`Browser failure after ${groups} groups at ${page.url()}`);
  console.error(await page.locator("body").innerText());
  await capture("failure");
  throw error;
} finally {
  await browser.close();
}
