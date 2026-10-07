import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import sharp from "sharp";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE_PATH || "./browser-runtime/node_modules/playwright",
);
const origin = "http://127.0.0.1:3901",
  id = (n) => `a3000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const url = `${origin}/console/products/${id(1)}/packaging`,
  output = path.resolve(".tmp/console-packaging-ui");
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
  groups = 0;
page.on("pageerror", (error) => errors.push(error.message));
page.on("dialog", (dialog) => {
  if (dialog.type() === "beforeunload") dialog.accept();
});
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
    calls.push(request.postDataJSON());
    return route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, code, message: "PRIVATE_SENTINEL" }),
    });
  }
  assert.equal(request.method(), "GET");
  return route.continue();
});
const label = (name) => page.getByLabel(name, { exact: true }),
  button = (name) => page.getByRole("button", { name, exact: true });
async function visit(query = "") {
  const response = await page.goto(url + query);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page.getByRole("heading", { name: "Packaging", exact: true }).waitFor();
}
async function failed() {
  await page.locator('.console-command-error[role="alert"]').waitFor();
  assert.doesNotMatch(await page.locator("body").innerText(), /PRIVATE_SENTINEL/);
}
async function approval(status = "OEM_REFERENCE") {
  await label("Proposal or decision reason").fill("TEST-ONLY review; no real confirmation");
  await label("Approved status").selectOption(status);
  await label("Approval evidence").selectOption(status === "CONFIRMED" ? id(5) : id(6));
  for (const name of [
    "Source document reviewed",
    "Exact packaging reviewed",
    "Commercial terms unchanged",
    ...(status === "CONFIRMED" ? ["ArcFort supplied packaging confirmed"] : []),
  ])
    await label(name).check();
}
try {
  await visit();
  assert.ok(await button("Approve").isDisabled());
  await approval();
  await button("Approve").click();
  await failed();
  assert.equal(calls.at(-1).action, "packaging_review");
  assert.equal(calls.at(-1).status, "OEM_REFERENCE");
  assert.deepEqual(calls.at(-1).confirmation, {
    source_checked: true,
    packaging_checked: true,
    commercial_terms_unchanged: true,
    arcfort_packaging_confirmed: false,
  });
  const retry = calls.at(-1).request_id;
  await button("Approve").click();
  await failed();
  assert.equal(calls.at(-1).request_id, retry);
  await label("Approval evidence").selectOption("");
  await label("Approval evidence").selectOption(id(6));
  assert.ok(await button("Approve").isDisabled());
  assert.equal(await label("Source document reviewed").isChecked(), false);
  groups++;
  await visit();
  await approval("CONFIRMED");
  await button("Approve").click();
  await failed();
  assert.equal(calls.at(-1).confirmation.arcfort_packaging_confirmed, true);
  await label("Approved status").selectOption("OEM_REFERENCE");
  assert.ok(await button("Approve").isDisabled());
  assert.equal(await label("Source document reviewed").isChecked(), false);
  groups++;
  await visit("?unknown=1");
  assert.equal(await label("Quantity known").isChecked(), false);
  assert.ok(await label("Quantity").isDisabled());
  await label("Approved status").selectOption("CONFIRMED");
  assert.equal(await label("Approval evidence").locator("option").count(), 1);
  assert.ok(await button("Approve").isDisabled());
  groups++;
  await visit("?stale=1");
  await approval();
  assert.ok(await button("Approve").isDisabled());
  assert.match(await page.locator("body").innerText(), /Evidence snapshot changed/);
  await visit("?state=proposed&stale=1");
  assert.ok(await button("Submit frozen proposal").isDisabled());
  await visit("?staleSource=1");
  await label("Approved status").selectOption("CONFIRMED");
  assert.equal(await label("Approval evidence").locator("option").count(), 1);
  assert.ok(await label("Synthetic packaging record").isDisabled());
  await visit("?staleCurrent=1");
  assert.match(await page.locator("body").innerText(), /Approval invalidated/);
  assert.match(await page.locator("body").innerText(), /1 conflicts/);
  groups++;
  await visit("?conflict=1");
  await page
    .getByRole("region", { name: "Known packaging conflicts" })
    .getByText("Synthetic historical-count contradiction")
    .waitFor();
  assert.match(
    await page.getByRole("region", { name: "Known packaging conflicts" }).innerText(),
    /15 pieces/,
  );
  await approval();
  assert.ok(await button("Approve").isDisabled());
  await label("Conflict resolution").fill("TEST-ONLY explicit count reconciliation");
  assert.ok(await button("Approve").isEnabled());
  await button("Approve").click();
  await failed();
  assert.match(calls.at(-1).resolution, /reconciliation/);
  groups++;
  await visit();
  await label("Quantity").fill("12");
  await label("Proposal or decision reason").fill("Synthetic corrected count");
  assert.ok(await button("Approve").isDisabled());
  await button("Edit proposal").click();
  await failed();
  assert.deepEqual(calls.at(-1).replacement, {
    copy: {
      package_description: "TEST-ONLY sealed inner bag",
      quantity: 12,
      quantity_unit: "pieces",
    },
    sources: [],
  });
  assert.equal(calls.at(-1).status, null);
  assert.equal(calls.at(-1).confirmation, null);
  await button("Reject").click();
  await failed();
  assert.equal(calls.at(-1).replacement, null);
  groups++;
  await visit("?state=proposed");
  assert.ok(await button("Submit frozen proposal").isEnabled());
  await label("Quantity known").uncheck();
  assert.ok(await button("Submit frozen proposal").isDisabled());
  await button("Save proposal").click();
  await failed();
  assert.equal(calls.at(-1).copy.quantity, null);
  assert.equal(calls.at(-1).copy.quantity_unit, null);
  assert.equal(calls.at(-1).original_id, id(4));
  groups++;
  await visit("?state=proposed");
  code = "40001";
  await button("Submit frozen proposal").click();
  await failed();
  assert.ok(await button("Submit frozen proposal").isDisabled());
  await button("Reload record").click();
  assert.ok(await button("Submit frozen proposal").isEnabled());
  code = "unavailable";
  groups++;
  await visit();
  await page.getByText("Add packaging evidence", { exact: true }).click();
  await label("title").fill("Synthetic added evidence");
  assert.ok(await label("Quantity").isDisabled());
  assert.ok(await button("Approve").isDisabled());
  for (const [name, value] of Object.entries({
    "source reference": "TEST-ONLY",
    "evidence date": "2026-01-01",
    "owner name": "Synthetic owner",
    "revision label": "TEST-1",
    "source location": "Synthetic page",
  }))
    await label(name).fill(value);
  await button("Add source").click();
  await failed();
  assert.equal(calls.at(-1).action, "packaging_source");
  assert.equal(calls.at(-1).original_id, id(4));
  assert.equal(calls.at(-1).copy.quantity, 10);
  assert.equal(calls.at(-1).source.assertion, "reference_only");
  assert.equal(calls.at(-1).source.evidence_basis, "company_catalog");
  await button("Discard source entries").click();
  assert.ok(await label("Quantity").isEnabled());
  groups++;
  for (const role of ["viewer", "publisher", "editor", "reviewer"]) {
    await visit(`?role=${role}`);
    assert.equal(await button("Approve").count(), role === "reviewer" ? 1 : 0);
    assert.equal(
      await page.getByText("Add packaging evidence", { exact: true }).count(),
      ["editor", "reviewer"].includes(role) ? 1 : 0,
    );
    if (["viewer", "publisher"].includes(role))
      assert.ok(await label("Package description").isDisabled());
  }
  groups++;
  await visit("?head=new");
  await label("Original packaging").selectOption(id(4));
  assert.equal(await label("Quantity known").isChecked(), false);
  assert.equal(await label("Package description").inputValue(), "TEST-ONLY original carton");
  assert.match(await page.locator("body").innerText(), /TEST-ONLY MOQ retained/);
  assert.equal(await label("MOQ").count(), 0);
  assert.equal(await label("Lead time").count(), 0);
  await visit("?empty=1");
  assert.match(await page.locator("body").innerText(), /Packaging missing/);
  groups++;
  await visit();
  await page.getByRole("link", { name: "Next page", exact: true }).click();
  await page.waitForURL(/historyPage=2/);
  assert.match(await page.locator("body").innerText(), /Page 2/);
  await page.keyboard.press("Tab");
  assert.ok(await page.evaluate(() => document.activeElement !== document.body));
  groups++;
  for (const width of [1440, 1280, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await visit("?long=1&conflict=1");
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `overflow ${width}`,
    );
    const file = path.join(output, `packaging-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const pixels = await sharp(file).stats();
    assert.ok(
      pixels.channels.some((channel) => channel.stdev > 10),
      `blank ${width}`,
    );
    screenshots.push(file);
  }
  groups++;
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        status: "PASS",
        groups,
        screenshots,
        commands: calls.length,
        pageErrors: errors,
        externalRequests: external,
        scope: "Synthetic React/transport only; no Auth/PostgREST/persistence/human verification",
      },
      null,
      2,
    ),
  );
  console.log(
    `Packaging synthetic UI PASS: ${groups} groups, ${screenshots.length} responsive screenshots, no page errors or external requests.`,
  );
} finally {
  await context.close();
  await browser.close();
}
