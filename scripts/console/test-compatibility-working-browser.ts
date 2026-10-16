import assert from "node:assert/strict";
import path from "node:path";
import type {
  BrowserContext,
  Locator,
  Page,
} from "./browser-runtime/node_modules/playwright/index.js";
import type { ConsoleClient } from "../../lib/console/client.ts";
import {
  readCompatibilityHistory,
  readCompatibilityWorkbench,
} from "../../lib/console/compatibility.ts";
import { consoleCompatibilityEnabled } from "../../lib/console/working-config.ts";
import type { CommandResult, ConsoleCommand } from "../../lib/domain/catalog/commands.ts";

type Participant = { ctx: BrowserContext; page: Page; client: ConsoleClient };
type Input = {
  variantId: string;
  targetId: string;
  owner: Participant;
  reviewer: Participant & { id: string };
  viewer: Participant;
  output: string;
  goto: (page: Page, pathname: string) => Promise<void>;
  command: (
    page: Page,
    button: Locator,
    status?: number,
    navigation?: boolean,
  ) => Promise<{
    result: CommandResult;
    request: ConsoleCommand;
  }>;
  checkpoint: (value: string) => void;
};

// Uses the owned server, real Auth sessions and unchanged HTTP responses from the parent runner.
// All form writes target the parent's disposable browser SKU, never an imported real product.
export async function runCompatibilityWorkingBrowser(input: Input) {
  assert.equal(process.env.CI, "true");
  assert.equal(consoleCompatibilityEnabled(), true);
  const { variantId, owner, reviewer, viewer, goto, command } = input;
  const record = await owner.client
    .from("product_variants")
    .select("sku,public_slug,is_shadow,lifecycle_state")
    .eq("id", variantId)
    .single();
  assert.equal(record.error, null);
  assert.equal(record.data?.sku, "AF-MIG-TS-9998");
  assert.equal(record.data?.public_slug, "synthetic-browser-m3-item");
  assert.equal(record.data?.is_shadow, false);
  assert.equal(record.data?.lifecycle_state, "DRAFT");
  const pathname = `/console/products/${variantId}/compatibility`;
  const page = owner.page;
  const results: string[] = [];
  let screenshots = 0;
  let phase = "";
  function checkpoint(value: string) {
    phase = value;
    input.checkpoint(value);
  }
  function button(page: Page, name: string) {
    return page.getByRole("button", { name, exact: true });
  }
  const read = () => readCompatibilityWorkbench(owner.client, variantId);
  async function action(page: Page, name: string, navigation = true) {
    const response = await command(page, button(page, name), 200, navigation);
    assert.equal(response.result.ok, true);
    if (!response.result.ok) throw new Error("Expected a successful compatibility form command.");
    return response.result.result;
  }
  async function recordEvidence(assertion: "supports" | "contradicts", title: string) {
    const evidence = reviewer.page.locator("details.console-source-entry");
    if (!(await evidence.evaluate((element) => (element as HTMLDetailsElement).open)))
      await evidence.locator("summary").click();
    for (const [label, value] of Object.entries({
      "Source title": title,
      "Document / record reference": `SYNTHETIC-COMPAT-${assertion}`,
      "Source custodian": "Synthetic browser fixture custodian",
      "Document revision": "QA-1",
      "Page / clause / callout": "Synthetic callout 1",
      "Evidence date": "2026-01-01",
    }))
      await reviewer.page.getByLabel(label, { exact: true }).fill(value);
    await reviewer.page.getByLabel("Evidence basis", { exact: true }).selectOption("drawing");
    await reviewer.page.getByLabel("Source assertion", { exact: true }).selectOption(assertion);
    await action(reviewer.page, "Record evidence", false);
    const checkbox = reviewer.page.getByRole("checkbox", { name: new RegExp(title) });
    await checkbox.waitFor();
    assert.equal(
      await checkbox.isChecked(),
      false,
      "Source recording must not silently link evidence.",
    );
    await checkbox.check();
  }

  checkpoint("compatibility browser identity, target selection and source-free proposal");
  await goto(page, pathname);
  await action(page, "Create product identity");
  assert.ok((await read())?.subjectId);
  await page.getByLabel("Target", { exact: true }).selectOption(input.targetId);
  await page.getByLabel("Assembly scope", { exact: true }).fill("Synthetic browser assembly");
  await page.getByLabel("Component role", { exact: true }).fill("Synthetic browser component");
  await page
    .getByLabel("Confirmation requirements", { exact: true })
    .fill("Synthetic sources only; not real fitment evidence");
  await page
    .getByLabel("Proposal reason", { exact: true })
    .fill("Synthetic browser proposal without evidence");
  const proposed = await action(page, "Save proposal");
  assert.ok(proposed.root_relationship_id);
  const rootId = proposed.root_relationship_id;
  const rootPath = `${pathname}?root=${rootId}`;
  await action(page, "Submit for review");
  await goto(reviewer.page, rootPath);
  assert.equal(await button(reviewer.page, "Approve").isDisabled(), true);
  const scope = () => read().then((data) => data?.scopes.find((item) => item.id === rootId));
  assert.equal((await scope())?.candidate?.state, "pending");
  assert.equal((await scope())?.current, null);
  results.push(phase);

  checkpoint("compatibility browser EDIT explicitly links sources and retains conflict");
  await button(reviewer.page, "Edit proposal").click();
  const supportingTitle = "Synthetic browser supporting assembly drawing";
  const conflictingTitle = "Synthetic browser conflicting assembly drawing";
  await recordEvidence("supports", supportingTitle);
  await recordEvidence("contradicts", conflictingTitle);
  await reviewer.page
    .getByLabel("Decision reason", { exact: true })
    .fill("Synthetic source review requires conflict resolution");
  await action(reviewer.page, "Save review edit");
  const edited = await scope();
  assert.equal(edited?.candidate?.state, "proposed");
  assert.equal(edited?.candidate?.status, "DATA_CONFLICT");
  assert.equal(edited?.candidate?.evidence.length, 2);
  assert.equal(edited?.original, null);
  assert.equal(edited?.current, null);
  await action(reviewer.page, "Submit for review");
  await reviewer.page.getByText("DATA CONFLICT", { exact: true }).waitFor();
  assert.equal(await button(reviewer.page, "Approve").isDisabled(), true);
  results.push(phase);

  checkpoint("compatibility browser explicit conflict resolution and reviewer attribution");
  await reviewer.page
    .getByLabel("Decision reason", { exact: true })
    .fill("Synthetic assembly drawing reviewed");
  await reviewer.page
    .getByLabel("Conflict resolution", { exact: true })
    .fill("Synthetic discrepancy resolved solely for a disposable browser SKU");
  await action(reviewer.page, "Approve");
  const approved = await scope();
  const approvedId = approved?.current?.id;
  assert.ok(approvedId);
  assert.equal(approved?.current?.status, "CONFIRMED");
  assert.equal(approved?.candidate, null);
  assert.equal(approved?.original, null);
  const attribution = await owner.client
    .from("compatibility_relationships")
    .select("confirmed_by,confirmed_at")
    .eq("id", approvedId)
    .single();
  assert.equal(attribution.error, null);
  assert.equal(attribution.data?.confirmed_by, reviewer.id);
  assert.ok(attribution.data?.confirmed_at);
  results.push(phase);

  checkpoint("compatibility browser stale tab cannot overwrite a saved revision");
  await goto(page, rootPath);
  await page.getByRole("checkbox", { name: new RegExp(conflictingTitle) }).uncheck();
  await page
    .getByLabel("Proposal reason", { exact: true })
    .fill("Synthetic supporting-only follow-up");
  await action(page, "Save proposal");
  const stale = await owner.ctx.newPage();
  try {
    await goto(stale, rootPath);
    await page
      .getByLabel("Confirmation requirements", { exact: true })
      .fill("Synthetic saved browser requirement");
    await page.getByLabel("Proposal reason", { exact: true }).fill("Synthetic first tab update");
    await action(page, "Save proposal");
    await stale
      .getByLabel("Confirmation requirements", { exact: true })
      .fill("Synthetic stale browser requirement");
    await stale.getByLabel("Proposal reason", { exact: true }).fill("Synthetic stale tab update");
    const refused = await command(stale, button(stale, "Save proposal"), 409);
    assert.equal(refused.result.ok, false);
    if (!refused.result.ok) assert.equal(refused.result.code, "40001");
    assert.equal(
      await stale.getByLabel("Confirmation requirements", { exact: true }).inputValue(),
      "Synthetic stale browser requirement",
    );
    assert.deepEqual((await scope())?.candidate?.requirements, [
      "Synthetic saved browser requirement",
    ]);
    assert.equal((await scope())?.current?.id, approvedId);
  } finally {
    await stale.close();
  }
  results.push(phase);

  checkpoint("compatibility browser rejection and persisted joined history");
  await action(page, "Submit for review");
  await goto(reviewer.page, rootPath);
  await reviewer.page
    .getByLabel("Decision reason", { exact: true })
    .fill("Synthetic follow-up rejected");
  await action(reviewer.page, "Reject");
  assert.equal((await scope())?.current?.id, approvedId);
  assert.equal((await scope())?.candidate, null);
  const history = await readCompatibilityHistory(viewer.client, variantId, rootId, 1);
  assert.deepEqual(
    history.items
      .map((item) => item.decision)
      .filter(Boolean)
      .sort(),
    ["APPROVE", "EDIT", "REJECT"],
  );
  await goto(page, rootPath);
  assert.equal(await page.locator(".console-history article").count(), history.total);
  for (const decision of ["APPROVE:", "EDIT:", "REJECT:"])
    await page.locator(".console-history").getByText(decision, { exact: false }).waitFor();
  results.push(phase);

  checkpoint("compatibility read-only browser and responsive persisted views");
  await goto(viewer.page, rootPath);
  assert.equal(await viewer.page.getByLabel("Component role", { exact: true }).isDisabled(), true);
  for (const name of ["Save proposal", "Approve", "Edit proposal", "Reject", "Record evidence"])
    assert.equal(await button(viewer.page, name).count(), 0);
  for (const width of [360, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await goto(page, rootPath);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
    );
    await page.screenshot({
      path: path.join(input.output, `compatibility-${width}.png`),
      fullPage: true,
    });
    screenshots++;
  }
  results.push(phase);

  checkpoint("prepare cached compatibility approval for shared reviewer revocation");
  await page.getByRole("checkbox", { name: new RegExp(conflictingTitle) }).uncheck();
  await page
    .getByLabel("Proposal reason", { exact: true })
    .fill("Synthetic pending compatibility for revocation test");
  await action(page, "Save proposal");
  await action(page, "Submit for review");
  const cached = await reviewer.ctx.newPage();
  await goto(cached, rootPath);
  await cached
    .getByLabel("Decision reason", { exact: true })
    .fill("Synthetic stale compatibility reviewer");
  assert.equal(await button(cached, "Approve").isEnabled(), true);
  return {
    results,
    screenshots,
    async assertRevoked() {
      checkpoint("cached compatibility browser approval is denied after role revocation");
      try {
        const refused = await command(cached, button(cached, "Approve"), 403);
        assert.equal(refused.result.ok, false);
        if (!refused.result.ok) assert.equal(refused.result.code, "42501");
        assert.equal((await scope())?.current?.id, approvedId);
        assert.equal((await scope())?.candidate?.state, "pending");
        results.push(phase);
      } finally {
        await cached.close();
      }
    },
  };
}
