import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

// UI-only fixture: no credentials, provider access, adoption or database mutations.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const origin = "http://127.0.0.1:3901";
const id = "10000000-0000-4000-8000-000000000001";
const rootId = "10000000-0000-4000-8000-000000000003";
const sourceId = "10000000-0000-4000-8000-000000000004";
const product = `${origin}/console/products/${id}`;
const output = path.resolve(".tmp/console-ui");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext();
const errors = [];
const results = [];
const requests = [];
let responder = async (route) =>
  route.fulfill({ status: 503, json: { ok: false, code: "unavailable" } });
await context.route(`${origin}/console/commands`, async (route) => {
  requests.push(route.request().postDataJSON());
  await responder(route);
});
async function pageAt(url) {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(url);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page.getByRole("heading", { level: 1 }).waitFor();
  return page;
}
async function waitForText(page, text) {
  await page.getByText(text, { exact: true }).waitFor();
}
async function scenario(name, fn) {
  await fn();
  results.push(name);
  console.log(`PASS ${name}`);
}
try {
  await scenario("real no-referrer fetch headers pass JSON origin guard only", async () => {
    const page = await pageAt(`${product}/edit`);
    await context.unroute(`${origin}/console/commands`);
    const probe = await page.evaluate(
      async () =>
        await (
          await fetch("/console/commands", {
            method: "POST",
            headers: { "content-type": "application/json", "x-console-command": "1" },
            body: "{}",
          })
        ).json(),
    );
    assert.equal(probe.ok, false);
    assert.equal(probe.originAccepted, true);
    results.push({ browserHeaders: probe.headers });
    await context.route(`${origin}/console/commands`, async (route) => {
      requests.push(route.request().postDataJSON());
      await responder(route);
    });
    await page.close();
  });
  await scenario("create failure keeps entries and retry keeps one request id", async () => {
    const page = await pageAt(`${origin}/console/products/new`);
    await page.getByLabel("SKU", { exact: true }).fill("AF-MIG-QA-9999");
    await page.getByLabel("Product slug").fill("synthetic-ui-product");
    await page.getByLabel("Identity source reference").fill("Synthetic identity fixture");
    await page.getByLabel("English name").fill("Synthetic browser draft");
    await page.getByRole("button", { name: "Create draft" }).click();
    await page.locator(".console-command-error[role=alert]").waitFor();
    assert.equal(await page.getByLabel("English name").inputValue(), "Synthetic browser draft");
    assert.equal(
      await page
        .locator(".console-command-error[role=alert]")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    const first = requests.at(-1);
    responder = async (route) =>
      route.fulfill({ json: { ok: true, result: { variant_id: id, revision: 1 } } });
    await page.getByRole("button", { name: "Create draft" }).click();
    await page.waitForURL(`${product}/edit`);
    assert.equal(requests.at(-1).request_id, first.request_id);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    await page.close();
  });
  await scenario(
    "stale copy remains visible, compare opens separately, save updates revision",
    async () => {
      responder = async (route) =>
        route.fulfill({ status: 409, json: { ok: false, code: "40001" } });
      const page = await pageAt(`${product}/edit`);
      await page.getByLabel("Summary", { exact: true }).fill("Synthetic unsaved copy");
      await page.getByRole("button", { name: "Save product" }).click();
      await page.locator(".console-command-error[role=alert]").waitFor();
      assert.equal(
        await page.getByLabel("Summary", { exact: true }).inputValue(),
        "Synthetic unsaved copy",
      );
      assert.equal(
        await page.getByRole("link", { name: /latest/ }).getAttribute("target"),
        "_blank",
      );
      page.once("dialog", (dialog) => dialog.dismiss());
      await page.getByRole("link", { name: "Technical review", exact: true }).click();
      assert.equal(page.url(), `${product}/edit`);
      responder = async (route) =>
        route.fulfill({ json: { ok: true, result: { variant_id: id, revision: 2 } } });
      await page.getByRole("button", { name: "Save product" }).click();
      await waitForText(page, "Saved revision 2.");
      await page.getByLabel("English name").focus();
      await page.keyboard.press("Tab");
      assert.equal(
        await page.getByLabel("Chinese name").evaluate((el) => el === document.activeElement),
        true,
      );
      await page.getByLabel("Summary", { exact: true }).fill("Synthetic discard test");
      let prompts = 0;
      page.on("dialog", async (dialog) => {
        prompts++;
        await dialog.accept();
      });
      await page.getByRole("link", { name: "Technical review", exact: true }).click();
      await page.waitForURL(`${product}/review`);
      assert.equal(prompts, 1);
      await page.close();
    },
  );
  await scenario(
    "saved proposal submits the stored digest and local edits block submit",
    async () => {
      responder = async (route) =>
        route.fulfill({ status: 503, json: { ok: false, code: "unavailable" } });
      const page = await pageAt(`${product}/review`);
      await page.getByRole("button", { name: "Submit for review" }).click();
      await page.locator(".console-command-error[role=alert]").waitFor();
      assert.equal(requests.at(-1).action, "submit");
      assert.equal(requests.at(-1).digest, "a".repeat(64));
      await page.getByLabel("Candidate value").fill("13");
      assert.equal(
        await page.getByRole("button", { name: "Submit for review" }).isDisabled(),
        true,
      );
      page.once("dialog", (dialog) => dialog.dismiss());
      await page.getByLabel("Field / exact scope").selectOption("new");
      assert.equal(await page.getByLabel("Field / exact scope").inputValue(), rootId);
      assert.equal(await page.getByLabel("Candidate value").inputValue(), "13");
      await page.close();
    },
  );
  for (const decision of ["APPROVE", "REJECT", "EDIT"])
    await scenario(`explicit ${decision} binds reason, conflict and exact revision`, async () => {
      const page = await pageAt(`${product}/review?state=pending&conflict=1`);
      assert.equal(await page.getByLabel("Candidate value").isDisabled(), true);
      await page.getByLabel("Decision reason").fill("Synthetic human decision only");
      await page.getByLabel("Conflict resolution").fill("Synthetic resolution record");
      if (decision === "EDIT") {
        await page.getByRole("button", { name: "Edit", exact: true }).click();
        await page.getByLabel("Candidate value").fill("14");
      }
      await page
        .getByRole("button", {
          name:
            decision === "EDIT"
              ? "Save edit for review"
              : decision === "APPROVE"
                ? "Approve"
                : "Reject",
          exact: true,
        })
        .click();
      await page.locator(".console-command-error[role=alert]").waitFor();
      const request = requests.at(-1);
      assert.equal(request.action, "review");
      assert.equal(request.decision, decision);
      assert.equal(request.revision, 2);
      assert.equal(request.value_id, id);
      assert.equal(request.digest, "a".repeat(64));
      assert.equal(request.resolution, "Synthetic resolution record");
      assert.deepEqual(
        request.replacement,
        decision === "EDIT" ? { value_text: "14", unit: "mm" } : null,
      );
      await page.close();
    });
  await scenario(
    "unrecorded source entries warn before navigation; source save freezes scope",
    async () => {
      const page = await pageAt(`${product}/review`);
      await page.getByText("Add source reference", { exact: true }).click();
      await page.getByLabel("Source title", { exact: true }).fill("Synthetic source");
      page.once("dialog", (dialog) => dialog.dismiss());
      const before = requests.length;
      await page.getByRole("button", { name: "Submit for review" }).click();
      assert.equal(requests.length, before);
      for (const [label, text] of Object.entries({
        "Document / record reference": "Synthetic QA record",
        "Source custodian": "QA fixture",
        "Document revision": "1",
        "Page / clause / callout": "Callout 1",
        "Source value": "12",
        "Source unit": "mm",
      }))
        await page.getByLabel(label, { exact: true }).fill(text);
      await page.getByLabel("Evidence basis").selectOption("drawing");
      await page.getByLabel("Evidence date").fill("2026-01-01");
      let release;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      responder = async (route) => {
        await gate;
        await route.fulfill({ json: { ok: true, result: { source_id: sourceId } } });
      };
      await page.getByRole("button", { name: "Record source" }).click();
      await page.getByRole("button", { name: "Recording..." }).waitFor();
      assert.equal(await page.getByLabel("Field / exact scope").isDisabled(), true);
      assert.equal(await page.getByLabel("Candidate value").isDisabled(), true);
      assert.equal(await page.getByRole("button", { name: "Save proposal" }).isDisabled(), true);
      release();
      await waitForText(page, "Source reference recorded.");
      assert.equal(await page.getByLabel("Source title", { exact: true }).inputValue(), "");
      assert.equal(
        await page.getByRole("checkbox", { name: /Synthetic source/ }).isChecked(),
        true,
      );
      assert.equal(
        await page
          .getByRole("checkbox", { name: /Synthetic source/ })
          .evaluate((el) => getComputedStyle(el).appearance),
        "auto",
      );
      assert.equal(
        await page.getByRole("button", { name: "Submit for review" }).isDisabled(),
        true,
      );
      await page.close();
    },
  );
  await scenario("viewer has no technical commands and readonly copy", async () => {
    const page = await pageAt(`${product}/review?role=viewer&state=pending`);
    assert.equal(await page.getByRole("button").count(), 0);
    assert.equal(await page.getByLabel("Candidate value").isDisabled(), true);
    await page.goto(`${product}/edit?role=viewer`);
    assert.equal(await page.getByLabel("English name").isDisabled(), true);
    assert.equal(await page.getByRole("button", { name: "Save product" }).isDisabled(), true);
    await page.close();
  });
  await scenario("six responsive widths: create, conflict review and source intake", async () => {
    for (const width of [360, 390, 768, 1024, 1280, 1440])
      for (const mode of ["new", "review"]) {
        const page = await pageAt(
          mode === "new"
            ? `${origin}/console/products/new`
            : `${product}/review?state=pending&conflict=1`,
        );
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
          `${width}/${mode}`,
        );
        assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
        for (const control of await page
          .locator(
            "main input:visible,main select:visible,main textarea:visible,main button:visible",
          )
          .all()) {
          const box = await control.boundingBox();
          if ((await control.getAttribute("type")) !== "checkbox")
            assert.ok(box.height >= 43, `${width}/${mode}: target height ${box.height}`);
        }
        await page.screenshot({ path: path.join(output, `${mode}-${width}.png`), fullPage: true });
        await page.close();
      }
    const page = await pageAt(`${product}/review`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByText("Add source reference", { exact: true }).click();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    await page.screenshot({ path: path.join(output, "source-390.png"), fullPage: true });
    await page.close();
  });
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(output, "results.json"),
    JSON.stringify(
      {
        scope: "Synthetic UI fixture; not Auth/PostgREST/database acceptance",
        checkedAt: new Date().toISOString(),
        results,
        requests: requests.map(({ action, decision }) => ({ action, decision })),
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(`UI fixture checks passed. Screenshots: ${output}`);
} finally {
  await context.close();
  await browser.close();
}
