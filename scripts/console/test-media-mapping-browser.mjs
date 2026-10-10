import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";
import { randomUUID } from "node:crypto";

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE_PATH || "./browser-runtime/node_modules/playwright",
);
const origin = "http://127.0.0.1:3901";
const uuid = (value) => `10000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
const id = {
  variant: uuid(1),
  head: uuid(2),
  mapping: uuid(3),
  asset: uuid(4),
  intent: uuid(5),
  rights: uuid(6),
  match: uuid(7),
  actor: uuid(9),
  adoption: uuid(10),
  key: uuid(12),
  nonce: uuid(13),
};
const url = `${origin}/console/products/${id.variant}/media`;
const output = path.resolve(".tmp/console-media-mapping-ui");
await mkdir(output, { recursive: true });
const original = await sharp({
  create: { width: 320, height: 240, channels: 3, background: "#18705f" },
})
  .png()
  .toBuffer();
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext();
const page = await context.newPage();
const errors = [],
  external = [],
  calls = [],
  inspectionCalls = [],
  screenshots = [];
let code = "",
  badObservation = false,
  shortExpiry = false,
  inspectionFailure = false;
page.on("pageerror", (error) => errors.push(error.message));
await context.route("**/*", async (route) => {
  const request = route.request();
  const target = new URL(request.url());
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
    return route.fulfill({
      status: code ? 409 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        code
          ? { ok: false, code, message: "PRIVATE_SENTINEL" }
          : {
              ok: true,
              result: {
                mapping_id: id.mapping,
                head_id: id.head,
                source_id: uuid(20),
                revision: 3,
              },
            },
      ),
    });
  }
  if (target.pathname === "/console/originals/inspect") {
    assert.equal(request.method(), "POST");
    assert.equal(request.headers()["x-console-command"], "1");
    const input = request.postDataJSON();
    inspectionCalls.push(input);
    const observedMode = Object.hasOwn(input, "mapping_id");
    assert.deepEqual(
      input,
      observedMode
        ? { mapping_id: id.mapping, revision: 2, digest: "a".repeat(64) }
        : { variant_id: id.variant, asset_id: id.asset },
    );
    if (inspectionFailure)
      return route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ message: "PRIVATE_SENTINEL" }),
      });
    const issued = Math.floor(Date.now() / 1000);
    const token = `v1|${id.key}|${id.actor}|${id.adoption}|${badObservation ? id.actor : id.mapping}|2|${"a".repeat(64)}|${"b".repeat(64)}|${issued}|${issued + (shortExpiry ? 20 : 300)}|${randomUUID()}|${"c".repeat(64)}`;
    return route.fulfill({
      status: 200,
      body: original,
      headers: {
        "content-type": "image/png",
        "content-length": String(original.length),
        "cache-control": "private, no-store",
        ...(observedMode ? { "x-console-media-observation": token } : {}),
      },
    });
  }
  assert.equal(request.method(), "GET");
  return route.continue();
});
let groups = 0;
async function visit(query = "") {
  const response = await page.goto(url + query);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page.getByRole("heading", { name: "Image mappings", exact: true }).waitFor();
}
async function inspect() {
  await page.getByRole("button", { name: "Inspect original", exact: true }).click();
  await page.getByRole("img", { name: /Stored original:/ }).waitFor();
  await page.getByText("Original checked / Inspection active", { exact: true }).waitFor();
}
async function approveInputs() {
  await page
    .getByLabel("Decision / proposal reason", { exact: true })
    .fill("Synthetic human approval reason");
  await page.getByLabel("Usage-rights evidence", { exact: true }).selectOption(id.rights);
  await page.getByLabel("Exact-product evidence", { exact: true }).selectOption(id.match);
  for (const label of [
    "I inspected the unchanged original",
    "I confirm documented image usage rights",
    "I confirm this image depicts the exact SKU",
  ])
    await page.getByLabel(label, { exact: true }).check();
}
try {
  await visit();
  assert.equal(
    await page.getByRole("button", { name: "Approve mapping", exact: true }).isDisabled(),
    true,
  );
  assert.equal(
    await page.getByLabel("I inspected the unchanged original", { exact: true }).isDisabled(),
    true,
  );
  await inspect();
  await approveInputs();
  assert.equal(
    await page.getByRole("button", { name: "Approve mapping", exact: true }).isEnabled(),
    true,
  );
  assert.equal(await page.getByLabel("Stored original", { exact: true }).isDisabled(), true);
  assert.equal(await page.getByLabel("Image alt text", { exact: true }).isDisabled(), true);
  assert.equal(
    await page.evaluate(() =>
      JSON.stringify({
        local: { ...localStorage },
        session: { ...sessionStorage },
        html: document.body.innerHTML,
      }).includes("v1|"),
    ),
    false,
  );
  await page.getByRole("button", { name: "Close original inspection", exact: true }).click();
  assert.match(
    await page.evaluate(() => document.activeElement?.textContent ?? ""),
    /Inspect original/,
  );
  assert.equal(
    await page.getByRole("button", { name: "Approve mapping", exact: true }).isDisabled(),
    true,
  );
  assert.equal(
    await page.getByLabel("I inspected the unchanged original", { exact: true }).isChecked(),
    false,
  );
  groups++;
  await inspect();
  await approveInputs();
  code = "40001";
  await page.getByRole("button", { name: "Approve mapping", exact: true }).click();
  await page.locator('.console-command-error[role="alert"]').waitFor();
  const approval = calls.at(-1);
  assert.equal(approval.action, "media_review");
  assert.equal(approval.decision, "APPROVE");
  assert.equal(approval.mapping_id, id.mapping);
  assert.equal(approval.revision, 2);
  assert.equal(approval.digest, "a".repeat(64));
  assert.equal(approval.rights_source_id, id.rights);
  assert.equal(approval.match_source_id, id.match);
  assert.deepEqual(approval.confirmation, {
    original_digest: "b".repeat(64),
    original_inspected: true,
    usage_rights_confirmed: true,
    exact_product_confirmed: true,
  });
  assert.match(approval.observation, /^v1\|/);
  assert.equal(approval.replacement, null);
  assert.equal(
    await page.getByRole("button", { name: "Approve mapping", exact: true }).isDisabled(),
    true,
  );
  assert.equal(
    await page
      .getByRole("link", { name: "Compare latest record", exact: true })
      .getAttribute("href"),
    `${new URL(url).pathname}?head=${id.head}`,
  );
  assert.doesNotMatch(await page.locator("body").innerText(), /PRIVATE_SENTINEL|v1\|/);
  groups++;
  await visit();
  code = "";
  await inspect();
  await approveInputs();
  await page.getByRole("button", { name: "Approve mapping", exact: true }).click();
  await page.waitForURL(`**/media?head=${id.head}`);
  assert.equal(calls.at(-1).decision, "APPROVE");
  groups++;
  await visit();
  await page.getByRole("button", { name: "Edit mapping", exact: true }).click();
  await page.getByLabel("Image alt text", { exact: true }).fill("Synthetic replacement original");
  await page
    .getByLabel("Decision / proposal reason", { exact: true })
    .fill("Synthetic correction reason");
  await page.getByRole("button", { name: "Save replacement", exact: true }).click();
  await page.waitForURL(`**/media?head=${id.head}`);
  const edit = calls.at(-1);
  assert.equal(edit.decision, "EDIT");
  assert.equal(edit.observation, null);
  assert.equal(edit.confirmation, null);
  assert.equal(edit.resolution, "");
  assert.equal(edit.replacement.asset_id, id.asset);
  assert.equal(edit.replacement.copy.alt_text, "Synthetic replacement original");
  groups++;
  await visit();
  await page
    .getByLabel("Decision / proposal reason", { exact: true })
    .fill("Synthetic rejection reason");
  await page.getByRole("button", { name: "Reject mapping", exact: true }).click();
  await page.waitForURL(`**/media?head=${id.head}`);
  const reject = calls.at(-1);
  assert.equal(reject.decision, "REJECT");
  for (const field of [
    "replacement",
    "observation",
    "confirmation",
    "rights_source_id",
    "match_source_id",
  ])
    assert.equal(reject[field], null);
  groups++;
  await visit("?state=proposed&role=editor");
  assert.equal(await page.getByRole("button", { name: "Approve mapping", exact: true }).count(), 0);
  await page.getByRole("button", { name: "Submit for review", exact: true }).click();
  await page.waitForURL(`**/media?head=${id.head}`);
  assert.equal(calls.at(-1).action, "media_submit");
  assert.equal(calls.at(-1).digest, "a".repeat(64));
  await visit("?new=1&role=editor");
  await page.getByLabel("Stored original", { exact: true }).selectOption(id.asset);
  await page.getByLabel("Image alt text", { exact: true }).fill("Synthetic proposed original");
  await page
    .getByLabel("Decision / proposal reason", { exact: true })
    .fill("Synthetic proposal reason");
  await page.getByRole("button", { name: "Save proposal", exact: true }).click();
  await page.waitForURL(`**/media?head=${id.head}`);
  assert.equal(calls.at(-1).action, "media_propose");
  assert.equal(calls.at(-1).head_id, null);
  assert.equal(calls.at(-1).revision, 0);
  assert.equal(calls.at(-1).slot, 0);
  groups++;
  await visit();
  await page.getByText("Add exact-image evidence", { exact: true }).click();
  await page.getByLabel("Evidence dimension", { exact: true }).selectOption("product_match");
  await page.getByLabel("Evidence basis", { exact: true }).selectOption("inspection_record");
  await page.getByLabel("Assertion", { exact: true }).selectOption("contradicts");
  for (const label of [
    "Source title",
    "Document / record reference",
    "Source custodian",
    "Document revision",
    "Page / clause / callout",
  ])
    await page.getByLabel(label, { exact: true }).fill(`Synthetic ${label}`);
  await page.getByLabel("Evidence date", { exact: true }).fill("2026-10-01");
  await page.getByRole("button", { name: "Record evidence", exact: true }).click();
  await page.getByText("Evidence changed / Latest record required", { exact: true }).waitFor();
  assert.equal(calls.at(-1).action, "media_source");
  assert.equal(calls.at(-1).dimension, "product_match");
  assert.equal(calls.at(-1).source.assertion, "contradicts");
  assert.equal(
    await page.getByRole("button", { name: "Approve mapping", exact: true }).isDisabled(),
    true,
  );
  groups++;
  for (const role of ["viewer", "publisher"]) {
    await visit(`?role=${role}`);
    for (const name of [
      "Approve mapping",
      "Edit mapping",
      "Reject mapping",
      "Save proposal",
      "Submit for review",
      "Record evidence",
    ])
      assert.equal(await page.getByRole("button", { name, exact: true }).count(), 0);
    await page.getByRole("button", { name: "Inspect original", exact: true }).click();
    await page.getByRole("img", { name: /Stored original:/ }).waitFor();
    assert.equal(Object.hasOwn(inspectionCalls.at(-1), "variant_id"), true);
  }
  await visit("?role=reviewer&state=proposed");
  assert.equal(await page.getByRole("button", { name: "Save proposal", exact: true }).count(), 0);
  assert.equal(
    await page.getByRole("button", { name: "Submit for review", exact: true }).isEnabled(),
    true,
  );
  await visit("?state=approved");
  await page.getByText("Original inspection not recorded", { exact: true }).waitFor();
  assert.equal(await page.getByText("CONFIRMED", { exact: true }).count(), 0);
  await visit("?state=approved&observed=1&invalid=1");
  await page.getByText("Approval invalidated", { exact: true }).waitFor();
  groups++;
  await visit("?reference=1");
  assert.equal(
    await page.getByLabel("Usage-rights evidence", { exact: true }).locator("option").count(),
    1,
  );
  await visit("?conflict=1");
  await inspect();
  await approveInputs();
  assert.equal(
    await page.getByRole("button", { name: "Approve mapping", exact: true }).isDisabled(),
    true,
  );
  await page
    .getByLabel("Conflict resolution", { exact: true })
    .fill("Synthetic resolution with controlled evidence");
  assert.equal(
    await page.getByRole("button", { name: "Approve mapping", exact: true }).isEnabled(),
    true,
  );
  await page
    .getByRole("region", { name: "Known image conflicts", exact: true })
    .getByText("Synthetic unselected contradiction", { exact: true })
    .waitFor();
  groups++;
  for (const kind of ["badObservation", "inspectionFailure"]) {
    badObservation = kind === "badObservation";
    inspectionFailure = kind === "inspectionFailure";
    await visit();
    await page.getByRole("button", { name: "Inspect original", exact: true }).click();
    await page.locator('.console-command-error[role="alert"]').waitFor();
    assert.equal(
      await page.getByRole("button", { name: "Approve mapping", exact: true }).isDisabled(),
      true,
    );
    assert.doesNotMatch(await page.locator("body").innerText(), /PRIVATE_SENTINEL|v1\|/);
  }
  badObservation = false;
  inspectionFailure = false;
  groups++;
  for (const width of [360, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await visit("?conflict=1&long=1");
    await inspect();
    const name = path.join(output, `mapping-${width}.png`);
    await page.screenshot({ path: name, fullPage: true });
    screenshots.push(name);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      `Overflow at ${width}`,
    );
    for (const label of [
      "Inspect original",
      "Close original inspection",
      "Approve mapping",
      "Edit mapping",
      "Reject mapping",
    ]) {
      const box = await page.getByRole("button", { name: label, exact: true }).boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44);
    }
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
  }
  groups++;
  await visit();
  await page
    .getByLabel("Decision / proposal reason", { exact: true })
    .fill("Unsaved synthetic review");
  const dismiss = (dialog) => dialog.dismiss();
  page.once("dialog", dismiss);
  await page.getByRole("link", { name: "New mapping", exact: true }).click();
  assert.equal(page.url(), url);
  await page.getByLabel("Decision / proposal reason", { exact: true }).fill("");
  await page.getByRole("link", { name: "Next Page", exact: true }).click();
  assert.match(page.url(), /historyPage=2/);
  groups++;
  shortExpiry = true;
  await visit();
  await inspect();
  await approveInputs();
  await page.getByText("Original inspection expired", { exact: true }).waitFor({ timeout: 25000 });
  assert.equal(
    await page.getByRole("button", { name: "Approve mapping", exact: true }).isDisabled(),
    true,
  );
  assert.equal(
    await page.getByLabel("I inspected the unchanged original", { exact: true }).isChecked(),
    false,
  );
  groups++;
  await page.getByRole("button", { name: "Recheck original", exact: true }).click();
  await page.getByText("Original checked / Inspection active", { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel("I inspected the unchanged original", { exact: true }).isChecked(),
    false,
  );
  assert.equal(
    await page.getByRole("button", { name: "Approve mapping", exact: true }).isDisabled(),
    true,
  );
  groups++;
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await writeFile(
    path.join(output, "report.json"),
    JSON.stringify(
      {
        status: "PASS",
        groups,
        commands: calls.length,
        inspections: inspectionCalls.length,
        screenshots,
        errors,
        external,
        evidence: "Synthetic UI transport only; not Auth/Storage/database acceptance",
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS: ${groups} media-mapping browser groups; six widths, synthetic transport only.`,
  );
} catch (error) {
  await page.screenshot({ path: path.join(output, "failure.png"), fullPage: true });
  console.log({ groups, url: page.url(), screenshot: path.join(output, "failure.png") });
  throw error;
} finally {
  await browser.close();
}
