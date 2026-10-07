import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE_PATH || "./browser-runtime/node_modules/playwright",
);
const origin = "http://127.0.0.1:3901",
  id = (n) => `a1000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const url = `${origin}/console/products/${id(1)}/oem`,
  output = path.resolve(".tmp/console-oem-ui");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext({ serviceWorkers: "block" }),
  page = await context.newPage();
const calls = [],
  errors = [],
  external = [],
  screenshots = [];
let code = "unavailable",
  malformed = false,
  delay = 0,
  groups = 0;
page.on("pageerror", (error) => errors.push(error.message));
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
    const input = request.postDataJSON();
    calls.push(input);
    assert.match(input.request_id, /^[a-f0-9-]{36}$/);
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    return route.fulfill({
      status: malformed ? 200 : code ? 409 : 200,
      contentType: "application/json",
      body: malformed
        ? "not-json"
        : JSON.stringify(
            code
              ? { ok: false, code, message: "PRIVATE_SENTINEL" }
              : {
                  ok: true,
                  result: { revision_id: id(3), head_id: id(2), source_id: id(25), revision: 3 },
                },
          ),
    });
  }
  assert.equal(request.method(), "GET");
  return route.continue();
});
page.on("dialog", (dialog) => {
  if (dialog.type() === "beforeunload") dialog.accept();
});
async function visit(query = "") {
  const response = await page.goto(url + query);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page.getByRole("heading", { name: "OEM references", exact: true }).waitFor();
}
const button = (name) => page.getByRole("button", { name, exact: true });
const label = (name) => page.getByLabel(name, { exact: true });
async function approveInputs(status = "OEM_REFERENCE") {
  await label("Proposal or decision reason").fill("Synthetic human decision; not real data");
  await label("Approved status").selectOption(status);
  await label("Approval evidence").selectOption(status === "CONFIRMED" ? id(5) : id(6));
  for (const name of [
    "Source document reviewed",
    "Exact reference reviewed",
    "No compatibility claim",
    ...(status === "CONFIRMED" ? ["ArcFort SKU designation confirmed"] : []),
  ])
    await label(name).check();
}
async function error() {
  await page.locator('.console-command-error[role="alert"]').waitFor();
  assert.doesNotMatch(await page.locator("body").innerText(), /PRIVATE_SENTINEL/);
  assert.equal(
    await page
      .locator('.console-command-error[role="alert"]')
      .evaluate((element) => element === document.activeElement),
    true,
  );
}
try {
  await visit();
  assert.ok(await button("Approve").isDisabled());
  assert.equal(await label("Approved status").inputValue(), "OEM_REFERENCE");
  assert.equal(await label("Approval evidence").locator("option").count(), 2);
  assert.equal(await label("Source document reviewed").isChecked(), false);
  await approveInputs();
  assert.ok(await button("Approve").isEnabled());
  await button("Approve").click();
  await error();
  let command = calls.at(-1);
  assert.equal(command.action, "oem_review");
  assert.equal(command.decision, "APPROVE");
  assert.equal(command.revision_id, id(3));
  assert.equal(command.revision, 2);
  assert.equal(command.digest, "a".repeat(64));
  assert.equal(command.status, "OEM_REFERENCE");
  assert.equal(command.source_id, id(6));
  assert.deepEqual(command.confirmation, {
    source_checked: true,
    reference_checked: true,
    compatibility_not_asserted: true,
    arcfort_reference_confirmed: false,
  });
  const retry = command.request_id;
  await button("Approve").click();
  await error();
  assert.equal(calls.at(-1).request_id, retry);
  groups++;
  await visit();
  await approveInputs("CONFIRMED");
  await button("Approve").click();
  await error();
  command = calls.at(-1);
  assert.equal(command.status, "CONFIRMED");
  assert.equal(command.source_id, id(5));
  assert.equal(command.confirmation.arcfort_reference_confirmed, true);
  await label("Approved status").selectOption("OEM_REFERENCE");
  assert.ok(await button("Approve").isDisabled());
  assert.equal(await label("Source document reviewed").isChecked(), false);
  assert.equal(await label("Approval evidence").inputValue(), "");
  groups++;
  await visit("?conflict=1");
  await approveInputs();
  assert.ok(await button("Approve").isDisabled());
  await label("Synthetic contradiction").waitFor();
  await label("Conflict resolution").fill("Synthetic documented resolution");
  await button("Approve").click();
  await error();
  assert.equal(calls.at(-1).resolution, "Synthetic documented resolution");
  assert.equal(calls.at(-1).source_id, id(6));
  groups++;
  for (const query of ["?stale=1", "?staleSource=1"]) {
    await visit(query);
    await label("Proposal or decision reason").fill("Synthetic stale review");
    await label("Approved status").selectOption("CONFIRMED");
    if (query.includes("staleSource"))
      assert.equal(await label("Approval evidence").locator("option").count(), 1);
    else await approveInputs("CONFIRMED");
    assert.ok(await button("Approve").isDisabled());
    assert.ok(await button("Reject").isEnabled());
  }
  await visit("?staleCurrent=1");
  await page.getByText("Approval invalidated", { exact: true }).waitFor();
  groups++;
  await visit();
  code = "40001";
  await approveInputs();
  await button("Approve").click();
  await error();
  assert.ok(await button("Approve").isDisabled());
  assert.equal(
    await page
      .getByRole("link", { name: "Compare latest record", exact: true })
      .getAttribute("href"),
    `/console/products/${id(1)}/oem?head=${id(2)}`,
  );
  page.once("dialog", (dialog) => dialog.accept());
  await button("Reload record").click();
  assert.equal(await label("Proposal or decision reason").inputValue(), "");
  assert.equal(await label("Source document reviewed").isChecked(), false);
  assert.equal(await page.locator('.console-command-error[role="alert"]').count(), 0);
  code = "unavailable";
  groups++;
  await visit();
  await label("Reference number").fill("TEST-ONLY-correction");
  await label("Proposal or decision reason").fill("Synthetic correction proposal");
  await button("Edit proposal").click();
  await error();
  command = calls.at(-1);
  assert.equal(command.decision, "EDIT");
  assert.equal(command.status, null);
  assert.equal(command.confirmation, null);
  assert.equal(command.source_id, null);
  assert.equal(command.resolution, "");
  assert.deepEqual(command.replacement, {
    copy: { manufacturer_name: "Synthetic manufacturer", reference_number: "TEST-ONLY-correction" },
    sources: [],
  });
  await button("Reject").click();
  await error();
  command = calls.at(-1);
  assert.equal(command.decision, "REJECT");
  assert.equal(command.replacement, null);
  assert.equal(command.confirmation, null);
  assert.equal(await label("Reference number").inputValue(), "TEST-ONLY-correction");
  groups++;
  await visit("?state=proposed");
  assert.ok(await button("Submit frozen proposal").isEnabled());
  await label("Reference number").fill("TEST-ONLY-unsaved");
  assert.ok(await button("Submit frozen proposal").isDisabled());
  page.once("dialog", (dialog) => dialog.accept());
  await button("Reload record").click();
  assert.equal(await label("Reference number").inputValue(), "TEST-ONLY-001");
  assert.ok(await button("Submit frozen proposal").isEnabled());
  await label("Proposal or decision reason").fill("Unsaved proposal reason");
  assert.ok(await button("Submit frozen proposal").isDisabled());
  page.once("dialog", (dialog) => dialog.accept());
  await button("Reload record").click();
  await button("Submit frozen proposal").click();
  await error();
  assert.deepEqual(
    Object.keys(calls.at(-1)).sort(),
    ["action", "request_id", "revision_id", "revision", "digest"].sort(),
  );
  groups++;
  await visit("?head=new&unlinked=1");
  await label("Manufacturer").fill("Synthetic manufacturer");
  await label("Reference number").fill("TEST-ONLY-001");
  await label("Synthetic factory record").check();
  await label("Proposal or decision reason").fill("Synthetic new proposal");
  await button("Save proposal").click();
  await error();
  command = calls.at(-1);
  assert.equal(command.action, "oem_propose");
  assert.equal(command.revision, 0);
  assert.equal(command.slot, 1);
  assert.equal(command.head_id, null);
  assert.equal(command.original_id, null);
  assert.deepEqual(command.sources, [id(5)]);
  assert.equal(
    await label("Original reference")
      .locator(`option[value="${id(4)}"]`)
      .count(),
    0,
  );
  await label("Original reference").selectOption(id(13));
  assert.equal(await label("Reference number").inputValue(), "TEST-ONLY-UNLINKED");
  groups++;
  await visit();
  await page.getByText("Add reference evidence", { exact: true }).click();
  assert.equal(await label("Evidence basis").inputValue(), "company_catalog");
  assert.equal(await label("Assertion").inputValue(), "reference_only");
  for (const [name, value] of Object.entries({
    title: "Synthetic new source",
    "source reference": "TEST-ONLY source",
    "evidence date": "2026-01-01",
    "owner name": "Synthetic custodian",
    "revision label": "TEST-1",
    "source location": "Synthetic page 1",
  }))
    await label(name).fill(value);
  assert.ok(await button("Reject").isDisabled());
  await button("Add source").click();
  await error();
  command = calls.at(-1);
  assert.equal(command.action, "oem_source");
  assert.equal(command.source.source_level, "A");
  assert.equal(command.source.assertion, "reference_only");
  assert.equal(command.source.evidence_basis, "company_catalog");
  await button("Discard source entries").click();
  assert.equal(await label("title").inputValue(), "");
  assert.ok(await button("Reject").isEnabled());
  code = "";
  for (const [name, value] of Object.entries({
    title: "Synthetic successful source",
    "source reference": "TEST-ONLY success",
    "evidence date": "2026-01-01",
    "owner name": "Synthetic custodian",
    "revision label": "TEST-2",
    "source location": "Synthetic page 2",
  }))
    await label(name).fill(value);
  await button("Add source").click();
  await page.waitForFunction(() => document.querySelector('[aria-label="title"]')?.value === "");
  assert.ok(await button("Reject").isEnabled());
  assert.equal(await label("Source document reviewed").isChecked(), false);
  code = "unavailable";
  groups++;
  for (const role of ["viewer", "publisher", "editor", "reviewer"]) {
    await visit(`?role=${role}`);
    assert.equal(await button("Approve").count(), role === "reviewer" ? 1 : 0);
    assert.equal(await button("Save proposal").count(), 0);
    assert.equal(
      await page.getByText("Add reference evidence", { exact: true }).count(),
      ["editor", "reviewer"].includes(role) ? 1 : 0,
    );
  }
  await visit("?role=reviewer&state=proposed");
  assert.equal(await button("Save proposal").count(), 0);
  assert.ok(await button("Submit frozen proposal").isEnabled());
  groups++;
  await visit();
  await label("Proposal or decision reason").fill("Unsaved synthetic review");
  page.once("dialog", (dialog) => dialog.dismiss());
  await label("Reference record").selectOption("");
  assert.equal(page.url(), url);
  assert.equal(await label("Proposal or decision reason").inputValue(), "Unsaved synthetic review");
  page.once("dialog", (dialog) => dialog.accept());
  await button("Reload record").click();
  await page.getByRole("link", { name: "Next page", exact: true }).click();
  await page.waitForURL(/historyPage=2/);
  await page.getByText("26 revisions / Page 2", { exact: true }).waitFor();
  groups++;
  await visit();
  malformed = true;
  await approveInputs();
  await button("Approve").click();
  await error();
  assert.equal(
    await label("Proposal or decision reason").inputValue(),
    "Synthetic human decision; not real data",
  );
  malformed = false;
  delay = 800;
  const previous = calls.length;
  await button("Approve").click();
  assert.ok(await button("Approve").isDisabled());
  assert.ok(await button("Reload record").isDisabled());
  await error();
  assert.equal(calls.length, previous + 1);
  delay = 0;
  groups++;
  await visit();
  code = "";
  await approveInputs();
  await button("Approve").click();
  await page.waitForURL(new RegExp(`head=${id(2)}`));
  assert.equal(await page.locator('.console-command-error[role="alert"]').count(), 0);
  let confirmations = 0;
  const confirm = (dialog) => {
    if (dialog.type() === "confirm") {
      confirmations++;
      void dialog.dismiss();
    }
  };
  page.on("dialog", confirm);
  await page.getByRole("link", { name: "History", exact: true }).click();
  await page.waitForURL(/\/history$/);
  page.off("dialog", confirm);
  assert.equal(confirmations, 0, "Successful decision clears the unsaved-navigation guard");
  code = "unavailable";
  groups++;
  for (const width of [360, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await visit("?conflict=1&long=1");
    const filename = path.join(output, `oem-${width}.png`);
    await page.screenshot({ path: filename, fullPage: true });
    screenshots.push(filename);
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Overflow at ${width}`,
    );
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
    for (const name of ["Approve", "Edit proposal", "Reject", "Reload record"]) {
      const box = await button(name).boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44);
    }
    const stats = await sharp(filename).stats();
    assert.ok(
      stats.channels.some((channel) => channel.stdev > 10),
      "Nonblank screenshot",
    );
  }
  groups++;
  await visit();
  await label("Proposal or decision reason").focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await label("Approved status").evaluate((element) => element === document.activeElement),
    true,
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  groups++;
  await writeFile(
    path.join(output, "report.json"),
    JSON.stringify(
      {
        status: "PASS",
        groups,
        commands: calls.length,
        screenshots,
        errors,
        external,
        evidence:
          "Synthetic browser transport only; no Auth, persisted database, source-document verification or native concurrency",
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS: ${groups} OEM browser groups, six responsive widths; synthetic transport only.`,
  );
} catch (error) {
  await page.screenshot({ path: path.join(output, "failure.png"), fullPage: true });
  console.log({ groups, url: page.url(), screenshot: path.join(output, "failure.png") });
  throw error;
} finally {
  await browser.close();
}
