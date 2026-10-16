import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

// Synthetic UI transport only, with all non-loopback requests blocked.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const origin = "http://127.0.0.1:3901";
const variant = "10000000-0000-4000-8000-000000000001";
const subject = "20000000-0000-4000-8000-000000000001";
const target = "30000000-0000-4000-8000-000000000001";
const root = "40000000-0000-4000-8000-000000000001";
const candidate = "50000000-0000-4000-8000-000000000001";
const source = "60000000-0000-4000-8000-000000000001";
const createdSource = "60000000-0000-4000-8000-000000000002";
const url = `${origin}/console/products/${variant}/compatibility`;
const output = path.resolve(".tmp/console-compatibility-ui");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext();
const errors = [],
  consoleProblems = [],
  external = [],
  requests = [],
  results = [];
let responder;
const fail = async (route) =>
  route.fulfill({ status: 503, json: { ok: false, code: "unavailable" } });
await context.route("**/*", async (route) => {
  if (new URL(route.request().url()).origin !== origin) {
    external.push(route.request().url());
    return route.abort();
  }
  if (route.request().url() === `${origin}/console/commands`) {
    requests.push(route.request().postDataJSON());
    return (responder ?? fail)(route);
  }
  return route.continue();
});
async function pageAt(query = "") {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (!["warning", "error"].includes(message.type())) return;
    const expectedFailure =
      message.location().url === `${origin}/console/commands` &&
      /^Failed to load resource: the server responded with a status of (503|409)\b/.test(
        message.text(),
      );
    if (!expectedFailure) consoleProblems.push(message.text());
  });
  const response = await page.goto(`${url}${query}`);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page.getByRole("heading", { name: "Compatibility", exact: true }).waitFor();
  return page;
}
async function scenario(name, run) {
  responder = fail;
  await run();
  results.push(name);
  console.log(`PASS ${name}`);
}
async function errorShown(page) {
  await page.locator(".console-command-error[role=alert]").waitFor();
}
try {
  await scenario("missing identity preserves exact SKU and has no viewer mutation", async () => {
    const page = await pageAt("?identity=missing");
    await page.getByRole("button", { name: "Create product identity" }).click();
    await errorShown(page);
    assert.equal(requests.at(-1).action, "compatibility_entity");
    assert.equal(requests.at(-1).variant_id, variant);
    await page.goto(`${url}?identity=missing&role=viewer`);
    assert.equal(await page.getByRole("button").count(), 0);
    await page.close();
  });
  await scenario(
    "original/current/proposal remain separate; failed save and retry keep input and receipt",
    async () => {
      const page = await pageAt();
      for (const title of ["Original reference", "Current relationship", "Saved proposal"])
        assert.equal(await page.getByRole("heading", { name: title, exact: true }).count(), 1);
      await page
        .getByLabel("Confirmation requirements", { exact: true })
        .fill("Synthetic drawing revision 2");
      await page.getByLabel("Proposal reason", { exact: true }).fill("Synthetic correction");
      await page.getByRole("button", { name: "Save proposal", exact: true }).click();
      await errorShown(page);
      const first = requests.at(-1);
      assert.equal(first.action, "compatibility_propose");
      assert.equal(first.root_id, root);
      assert.equal(first.revision, 2);
      assert.equal(first.subject_id, subject);
      assert.equal(first.target_id, target);
      assert.equal(first.scope, "Synthetic assembly A");
      assert.equal(first.relationship_type, "product_to_series");
      assert.deepEqual(first.copy, {
        role: "Tip holder",
        confirmation_requirements: ["Synthetic drawing revision 2"],
      });
      assert.deepEqual(first.evidence, [{ source_id: source, role: "supporting" }]);
      assert.equal(
        await page.getByLabel("Confirmation requirements", { exact: true }).inputValue(),
        "Synthetic drawing revision 2",
      );
      assert.equal(
        await page.getByRole("button", { name: "Submit for review" }).isDisabled(),
        true,
      );
      responder = async (route) =>
        route.fulfill({
          json: {
            ok: true,
            result: {
              root_relationship_id: root,
              relationship_id: candidate,
              revision: 3,
              digest: "b".repeat(64),
            },
          },
        });
      await page.getByRole("button", { name: "Save proposal", exact: true }).click();
      await page.waitForURL(`${url}?root=${root}`);
      assert.equal(requests.at(-1).request_id, first.request_id);
      assert.equal(await page.evaluate(() => localStorage.length), 0);
      await page.close();
    },
  );
  await scenario(
    "submitted digest, stale response and conflict cannot be overwritten",
    async () => {
      const page = await pageAt("?conflict=1");
      assert.equal(
        await page.getByRole("button", { name: "Save proposal", exact: true }).count(),
        0,
      );
      responder = async (route) =>
        route.fulfill({ status: 409, json: { ok: false, code: "40001" } });
      await page.getByRole("button", { name: "Submit for review" }).click();
      await errorShown(page);
      assert.equal(requests.at(-1).action, "compatibility_submit");
      assert.equal(requests.at(-1).relationship_id, candidate);
      assert.equal(requests.at(-1).revision, 2);
      assert.equal(requests.at(-1).digest, "a".repeat(64));
      const compare = page.locator(".console-command-error a");
      assert.equal(await compare.getAttribute("target"), "_blank");
      await page.close();
    },
  );
  for (const decision of ["APPROVE", "EDIT", "REJECT"])
    await scenario(
      `${decision} uses exact submitted revision, explicit reason and conflict resolution`,
      async () => {
        const page = await pageAt("?state=pending&conflict=1&role=reviewer");
        assert.equal(
          await page.getByRole("button", { name: "Approve", exact: true }).isDisabled(),
          true,
        );
        await page
          .getByLabel("Decision reason", { exact: true })
          .fill("Synthetic reviewer decision");
        await page
          .getByLabel("Conflict resolution", { exact: true })
          .fill("Synthetic conflict evidence examined");
        if (decision === "EDIT") {
          await page.getByRole("button", { name: "Edit proposal", exact: true }).click();
          await page
            .getByLabel("Confirmation requirements", { exact: true })
            .fill("Synthetic replacement requirement");
        }
        await page
          .getByRole("button", {
            name:
              decision === "EDIT"
                ? "Save review edit"
                : decision === "APPROVE"
                  ? "Approve"
                  : "Reject",
            exact: true,
          })
          .click();
        await errorShown(page);
        const payload = requests.at(-1);
        assert.equal(payload.action, "compatibility_review");
        assert.equal(payload.decision, decision);
        assert.equal(payload.relationship_id, candidate);
        assert.equal(payload.revision, 2);
        assert.equal(payload.digest, "a".repeat(64));
        assert.equal(payload.reason, "Synthetic reviewer decision");
        assert.equal(payload.resolution, "Synthetic conflict evidence examined");
        assert.deepEqual(
          payload.replacement,
          decision === "EDIT"
            ? {
                role: "Tip holder",
                confirmation_requirements: ["Synthetic replacement requirement"],
              }
            : null,
        );
        assert.deepEqual(
          payload.evidence,
          decision === "EDIT" ? [{ source_id: source, role: "supporting" }] : null,
        );
        await page.close();
      },
    );
  await scenario(
    "viewer/editor roles and missing exact source prevent approval controls",
    async () => {
      const page = await pageAt("?state=pending&role=viewer");
      assert.equal(await page.getByRole("button").count(), 0);
      assert.equal(await page.getByLabel("Component role", { exact: true }).isDisabled(), true);
      await page.goto(`${url}?state=pending&role=editor`);
      assert.equal(await page.getByRole("button", { name: "Approve", exact: true }).count(), 0);
      await page.goto(`${url}?state=pending&evidence=unbound`);
      assert.equal(
        await page.getByRole("button", { name: "Approve", exact: true }).isDisabled(),
        true,
      );
      await page.goto(`${url}?state=pending&basis=catalog`);
      assert.equal(
        await page.getByRole("button", { name: "Approve", exact: true }).isDisabled(),
        true,
      );
      await page.close();
    },
  );
  await scenario(
    "evidence intake binds scope, freezes concurrent commands and requires explicit linking",
    async () => {
      const page = await pageAt();
      await page.getByText("Add relationship evidence", { exact: true }).click();
      await page.getByLabel("Source title", { exact: true }).fill("Synthetic new drawing");
      page.once("dialog", (dialog) => dialog.dismiss());
      const before = requests.length;
      await page.getByRole("button", { name: "Submit for review" }).click();
      assert.equal(requests.length, before);
      for (const [label, value] of Object.entries({
        "Document / record reference": "QA-ONLY-NEW",
        "Source custodian": "Synthetic custodian",
        "Document revision": "QA-2",
        "Page / clause / callout": "Callout 2",
      }))
        await page.getByLabel(label, { exact: true }).fill(value);
      await page.getByLabel("Evidence basis", { exact: true }).selectOption("drawing");
      await page.getByLabel("Evidence date", { exact: true }).fill("2026-01-01");
      let release, entered;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      const arrival = new Promise((resolve) => {
        entered = resolve;
      });
      responder = async (route) => {
        entered();
        await gate;
        await route.fulfill({ json: { ok: true, result: { source_id: createdSource } } });
      };
      await page.getByRole("button", { name: "Record evidence", exact: true }).click();
      await Promise.race([
        arrival,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Source request was not sent")), 10000),
        ),
      ]);
      assert.equal(await page.getByLabel("Relationship", { exact: true }).isDisabled(), true);
      assert.equal(await page.getByLabel("Component role", { exact: true }).isDisabled(), true);
      assert.equal(
        await page.getByRole("button", { name: "Save proposal", exact: true }).isDisabled(),
        true,
      );
      const payload = requests.at(-1);
      assert.equal(payload.action, "compatibility_source");
      assert.equal(payload.subject_id, subject);
      assert.equal(payload.target_id, target);
      assert.equal(payload.scope, "Synthetic assembly A");
      assert.equal(payload.source.revision_label, "QA-2");
      release();
      await page
        .getByText("Evidence recorded; no relationship approved.", { exact: true })
        .waitFor();
      const checkbox = page.getByRole("checkbox", { name: /Synthetic new drawing/ });
      assert.equal(await checkbox.isChecked(), false);
      await checkbox.check();
      assert.equal(
        await page.getByRole("button", { name: "Submit for review" }).isDisabled(),
        true,
      );
      page.once("dialog", (dialog) => dialog.dismiss());
      await page.getByLabel("Relationship", { exact: true }).selectOption("");
      assert.equal(await page.getByLabel("Relationship", { exact: true }).inputValue(), root);
      assert.equal(await checkbox.isChecked(), true);
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByLabel("Relationship", { exact: true }).selectOption("");
      await page.getByLabel("Relationship", { exact: true }).selectOption(root);
      assert.equal(
        await checkbox.isChecked(),
        false,
        "Recorded sources survive switching; discarded links do not",
      );
      await page.getByLabel("Component role", { exact: true }).fill("Changed component role");
      await page
        .getByText("Recorded source scope differs from this proposal", { exact: true })
        .waitFor();
      await page.close();
    },
  );
  await scenario(
    "new relationship target search and pagination remain scoped and GET-only",
    async () => {
      const page = await pageAt("?root=new");
      await page.getByRole("link", { name: "Next targets", exact: true }).click();
      await page.waitForURL(/targetPage=2/);
      assert.equal(await page.getByLabel("Target", { exact: true }).locator("option").count(), 3);
      await page.getByLabel("Target type", { exact: true }).selectOption("torch");
      await page.getByLabel("Target name", { exact: true }).fill("27");
      const before = requests.length;
      await page.getByRole("button", { name: "Search targets", exact: true }).click();
      await page.waitForURL(/kind=torch&q=27/);
      assert.equal(requests.length, before);
      assert.equal(await page.getByLabel("Target", { exact: true }).locator("option").count(), 2);
      await page
        .getByLabel("Target", { exact: true })
        .selectOption({ label: "Synthetic torch 27" });
      await page.getByLabel("Assembly scope", { exact: true }).fill("Synthetic torch assembly");
      await page.getByLabel("Component role", { exact: true }).fill("Synthetic liner");
      await page
        .getByLabel("Confirmation requirements", { exact: true })
        .fill("Exact source required");
      await page.getByLabel("Proposal reason", { exact: true }).fill("Synthetic new relationship");
      page.once("dialog", (dialog) => dialog.dismiss());
      await page.getByRole("button", { name: "Search targets", exact: true }).click();
      assert.equal(
        await page.getByLabel("Component role", { exact: true }).inputValue(),
        "Synthetic liner",
      );
      // An incomplete proposal can be saved, but is not approved or publication-ready.
      await page.getByRole("button", { name: "Save proposal", exact: true }).click();
      await errorShown(page);
      assert.equal(requests.length, before + 1);
      assert.equal(requests.at(-1).root_id, null);
      assert.equal(requests.at(-1).revision, 0);
      assert.equal(requests.at(-1).relationship_type, "product_to_torch");
      assert.deepEqual(requests.at(-1).evidence, []);
      await page.close();
    },
  );
  await scenario("history pages and keyboard access", async () => {
    const page = await pageAt();
    await page.getByRole("link", { name: "Next history", exact: true }).click();
    await page.waitForURL(/historyPage=2/);
    await page.getByText("REJECT: Synthetic rejection", { exact: true }).waitFor();
    await page.getByLabel("Relationship", { exact: true }).focus();
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .getByLabel("Target", { exact: true })
        .evaluate((node) => node === document.activeElement),
      true,
    );
    await page.close();
  });
  await scenario(
    "six widths render comparison, conflict, target search and evidence forms without overflow",
    async () => {
      for (const width of [360, 390, 768, 1024, 1280, 1440]) {
        const page = await pageAt("?state=pending&conflict=1");
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
          String(width),
        );
        for (const control of await page
          .locator(
            "main input:visible,main select:visible,main textarea:visible,main button:visible",
          )
          .all()) {
          const box = await control.boundingBox();
          assert.ok(box.height >= ((await control.getAttribute("type")) === "checkbox" ? 20 : 43));
        }
        await page.screenshot({ path: path.join(output, `review-${width}.png`), fullPage: true });
        await page.getByText("Add relationship evidence", { exact: true }).click();
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
        );
        await page.screenshot({ path: path.join(output, `source-${width}.png`), fullPage: true });
        await page.goto(`${url}?root=new`);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
        );
        await page.screenshot({ path: path.join(output, `new-${width}.png`), fullPage: true });
        await page.close();
      }
    },
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(consoleProblems, []);
  assert.deepEqual(external, []);
  await writeFile(
    path.join(output, "results.json"),
    JSON.stringify(
      {
        scope: "Synthetic UI only, not Auth/PostgREST/persistence acceptance",
        checkedAt: new Date().toISOString(),
        results,
        requests: requests.map(({ action, decision }) => ({ action, decision })),
        pageErrors: errors,
        consoleProblems,
        externalRequests: external,
      },
      null,
      2,
    ),
  );
  console.log(`Compatibility UI passed: ${results.length} groups / 18 screenshots. ${output}`);
} finally {
  await context.close();
  await browser.close();
}
