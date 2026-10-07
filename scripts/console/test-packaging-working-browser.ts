import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type {
  BrowserContext,
  Dialog,
  Locator,
  Page,
} from "./browser-runtime/node_modules/playwright/index.js";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { executeConsoleCommand } from "../../lib/console/commands.ts";
import {
  readPackagingHistory,
  readPackagingWorkbench,
  type PackagingFact,
} from "../../lib/console/packaging.ts";
import { consolePackagingEnabled } from "../../lib/console/working-config.ts";
import type { CommandResult, ConsoleCommand } from "../../lib/domain/catalog/commands.ts";
import type { PackagingCopy } from "../../lib/domain/catalog/packaging.ts";
import { browserOrigin, privateResponse } from "./browser-server.ts";
import type { openLocalAcceptance } from "./local-acceptance.ts";
import {
  assertPackagingLedger,
  packagingLedgerQuery,
  packagingNonInterferenceQueries,
  packagingTestCopies,
  packagingTestSource,
} from "./packaging-acceptance.ts";

type Participant = { ctx: BrowserContext; page: Page; client: ConsoleClient };
type Review = Extract<ConsoleCommand, { action: "packaging_review" }>;
type Input = {
  variantId: string;
  foreignVariantId: string;
  owner: Participant;
  reviewer: Participant & { id: string };
  viewer: Participant;
  local: ReturnType<typeof openLocalAcceptance>;
  context: () => Promise<BrowserContext>;
  output: string;
  goto: (page: Page, pathname: string) => Promise<void>;
  command: (
    page: Page,
    button: Locator,
    status?: number | number[],
    navigation?: boolean,
  ) => Promise<{ result: CommandResult; request: ConsoleCommand }>;
  checkpoint: (value: string) => void;
};
function success(result: CommandResult) {
  assert.equal(result.ok, true, "Expected isolated packaging success.");
  if (!result.ok) throw new Error("packaging command failed; private output suppressed.");
  return result.result;
}
const target = (fact: PackagingFact) => ({
  revision_id: fact.id,
  revision: fact.revision,
  digest: fact.digest,
});

// Real Auth, Next forms, PostgREST and observed PostgreSQL contention only.
// The parent must have verified a pristine disposable target; all declarations are TEST-ONLY.
export async function runPackagingWorkingBrowser(input: Input) {
  assert.equal(process.env.CI, "true");
  assert.equal(input.local.packaging, true);
  assert.equal(consolePackagingEnabled(), true);
  const { variantId, owner, reviewer, viewer, local, goto, command, checkpoint } = input;
  const { unknown, known, corrected } = packagingTestCopies;
  const identity = await owner.client
    .from("product_variants")
    .select("sku,public_slug,is_shadow,lifecycle_state")
    .eq("id", variantId)
    .single();
  assert.equal(identity.error, null);
  assert.deepEqual(identity.data, {
    sku: "AF-MIG-TS-9998",
    public_slug: "synthetic-browser-m3-item",
    is_shadow: false,
    lifecycle_state: "DRAFT",
  });
  assert.notEqual(variantId, input.foreignVariantId);
  const protectedBefore = packagingNonInterferenceQueries.map((query) => local.json(query));
  const pathname = `/console/products/${variantId}/packaging`;
  const endpoint = `${browserOrigin}/console/commands`;
  const headers = { origin: browserOrigin, "x-console-command": "1" };
  const results: string[] = [];
  const dialog = (value: Dialog) => {
    if (value.type() === "beforeunload") void value.accept();
    else void value.dismiss();
  };
  for (const participant of [owner, reviewer, viewer]) participant.page.on("dialog", dialog);
  async function data() {
    const value = await readPackagingWorkbench(owner.client, variantId);
    assert.ok(value);
    return value;
  }
  async function scope() {
    const value = (await data()).scopes;
    assert.equal(value.length, 1);
    return value[0];
  }
  async function settled(participant: Participant) {
    const latest = (await scope()).latest;
    await participant.page
      .locator(".console-fact-snapshot")
      .filter({
        has: participant.page.getByRole("heading", { name: "Latest proposal", exact: true }),
      })
      .getByText(`Revision ${latest.revision} / ${latest.state}`, { exact: true })
      .waitFor();
  }
  async function visit(participant: Participant, head?: string) {
    await goto(participant.page, pathname + (head ? `?head=${head}` : "?head=new"));
    await participant.page.getByLabel("Package description", { exact: true }).waitFor();
  }
  async function reason(page: Page, text: string) {
    await page.getByLabel("Proposal or decision reason", { exact: true }).fill(text);
  }
  async function physical(page: Page, copy: PackagingCopy) {
    await page.getByLabel("Package description", { exact: true }).fill(copy.package_description);
    await page.getByLabel("Quantity known", { exact: true }).setChecked(copy.quantity !== null);
    if (copy.quantity !== null) {
      await page.getByLabel("Quantity", { exact: true }).fill(String(copy.quantity));
      await page.getByLabel("Quantity unit", { exact: true }).fill(copy.quantity_unit!);
    }
  }
  async function record(kind: Parameters<typeof packagingTestSource>[0], copy: PackagingCopy) {
    await physical(owner.page, copy);
    const source = packagingTestSource(kind, copy);
    await owner.page.locator(".console-source-entry summary").click();
    await owner.page
      .getByLabel("Source classification", { exact: true })
      .selectOption(source.source_kind);
    await owner.page
      .getByLabel("Evidence basis", { exact: true })
      .selectOption(source.evidence_basis);
    await owner.page.getByLabel("Assertion", { exact: true }).selectOption(source.assertion);
    for (const key of [
      "title",
      "source_reference",
      "evidence_date",
      "owner_name",
      "revision_label",
      "source_location",
    ] as const)
      await owner.page.getByLabel(key.replaceAll("_", " "), { exact: true }).fill(source[key]);
    const recorded = await command(
      owner.page,
      owner.page.getByRole("button", { name: "Add source", exact: true }),
    );
    assert.equal(recorded.request.action, "packaging_source");
    const id = success(recorded.result).source_id;
    assert.ok(id);
    // A new source refresh does not implicitly select or approve it.
    await visit(owner, (await data()).scopes[0]?.id);
    return id;
  }
  async function propose(copy: PackagingCopy, head?: string) {
    await visit(owner, head);
    await physical(owner.page, copy);
    const selected = (await data()).sources.filter(
      (source) =>
        source.copy.quantity === copy.quantity &&
        source.copy.quantity_unit === copy.quantity_unit &&
        source.copy.package_description === copy.package_description &&
        source.assertion !== "contradicts",
    );
    assert.equal(selected.length, copy.quantity === null ? 2 : 1);
    for (const source of selected)
      await owner.page.getByRole("checkbox", { name: source.title, exact: true }).check();
    await reason(owner.page, "TEST-ONLY isolated packaging proposal, never real SKU evidence");
    const proposal = await command(
      owner.page,
      owner.page.getByRole("button", { name: "Save proposal", exact: true }),
      200,
    );
    const saved = success(proposal.result);
    assert.ok(saved.head_id);
    await settled(owner);
    assert.equal((await scope()).latest.state, "proposed");
    assert.equal(
      (await scope()).latest.status,
      (await data()).sources.some((source) => source.assertion === "contradicts")
        ? "DATA_CONFLICT"
        : "NEEDS_FACTORY_CONFIRMATION",
    );
    return saved.head_id;
  }
  async function submit() {
    await command(
      owner.page,
      owner.page.getByRole("button", { name: "Submit frozen proposal", exact: true }),
      200,
    );
    await settled(owner);
    assert.equal((await scope()).latest.state, "pending");
  }
  async function acknowledge(status: "OEM_REFERENCE" | "CONFIRMED", sourceId: string) {
    const page = reviewer.page;
    await page.getByLabel("Approved status", { exact: true }).selectOption(status);
    await page.getByLabel("Approval evidence", { exact: true }).selectOption(sourceId);
    for (const name of [
      "Source document reviewed",
      "Exact packaging reviewed",
      "Commercial terms unchanged",
      ...(status === "CONFIRMED" ? ["ArcFort supplied packaging confirmed"] : []),
    ])
      await page.getByRole("checkbox", { name, exact: true }).check();
    await reason(
      page,
      "TEST-ONLY synthetic human physical packaging review, commercial terms unchanged",
    );
  }
  async function wire(
    participant: Participant,
    value: ConsoleCommand,
    status: number,
    code?: string,
    origin = browserOrigin,
  ) {
    const response = await participant.ctx.request.post(endpoint, {
      headers: { ...headers, origin },
      data: value,
      maxRedirects: 0,
    });
    assert.equal(response.status(), status);
    privateResponse(response.headers());
    const body: CommandResult = await response.json();
    assert.equal(body.ok, status === 200);
    assert.doesNotMatch(
      JSON.stringify(body),
      /raw_snapshot|source_digest|variant_digest|access_token|payload_digest/,
    );
    if (code) {
      assert.equal(body.ok, false);
      if (!body.ok) assert.equal(body.code, code);
    }
    return body;
  }
  function review(
    fact: PackagingFact,
    sourceId: string,
    status: "OEM_REFERENCE" | "CONFIRMED",
  ): Review {
    return {
      action: "packaging_review",
      request_id: randomUUID(),
      ...target(fact),
      decision: "APPROVE",
      reason: "TEST-ONLY synthetic reviewer declaration",
      status,
      source_id: sourceId,
      confirmation: {
        source_checked: true,
        packaging_checked: true,
        commercial_terms_unchanged: true,
        arcfort_packaging_confirmed: status === "CONFIRMED",
      },
      resolution: "",
      replacement: null,
    };
  }
  try {
    checkpoint("packaging real source forms and exact physical packaging");
    assert.equal((await data()).sources.length, 0);
    assert.equal((await data()).scopes.length, 0);
    assert.equal((await data()).originals.length, 0);
    await visit(owner);
    const referenceId = await record("reference", unknown);
    const unknownFactoryId = await record("factory", unknown);
    const knownFactoryId = await record("factory", known);
    const factoryId = await record("factory", corrected);
    const headId = await propose(unknown);
    await submit();
    assert.deepEqual(
      [...(await scope()).latest.sources].sort(),
      [referenceId, unknownFactoryId].sort(),
    );
    assert.equal((await data()).readiness.unknown, 1);
    results.push("packaging persisted source forms preserve explicit null quantity and unit");

    checkpoint("packaging reference refusal gates and actual reviewer form approval");
    const pending = (await scope()).latest;
    const referenceReview = review(pending, referenceId, "OEM_REFERENCE");
    await wire(
      reviewer,
      {
        ...referenceReview,
        request_id: randomUUID(),
        status: "CONFIRMED",
        confirmation: { ...referenceReview.confirmation!, arcfort_packaging_confirmed: true },
      },
      422,
      "23514",
    );
    await wire(
      reviewer,
      { ...referenceReview, request_id: randomUUID(), source_id: unknownFactoryId },
      422,
      "23514",
    );
    await wire(reviewer, review(pending, unknownFactoryId, "CONFIRMED"), 422, "23514");
    await visit(reviewer, headId);
    await reviewer.page.getByLabel("Approved status", { exact: true }).selectOption("CONFIRMED");
    assert.equal(
      await reviewer.page
        .getByLabel("Approval evidence", { exact: true })
        .locator("option")
        .count(),
      1,
    );
    assert.equal(
      await reviewer.page.getByRole("button", { name: "Approve", exact: true }).isDisabled(),
      true,
    );
    await wire(
      reviewer,
      { ...referenceReview, request_id: randomUUID(), digest: "0".repeat(64) },
      409,
      "40001",
    );
    await wire(viewer, referenceReview, 403, "42501");
    const anonymous = await input.context();
    try {
      await wire({ ...viewer, ctx: anonymous }, referenceReview, 403, "42501");
    } finally {
      await anonymous.close();
    }
    await wire(reviewer, referenceReview, 403, undefined, "https://invalid.example");
    const crossScope: ConsoleCommand = {
      action: "packaging_propose",
      request_id: randomUUID(),
      variant_id: input.foreignVariantId,
      slot: 0,
      revision: 0,
      head_id: null,
      original_id: null,
      copy: unknown,
      sources: [referenceId],
      reason: "TEST-ONLY copied source must be refused",
    };
    await wire(owner, crossScope, 422, "22023");
    await wire(
      owner,
      {
        ...crossScope,
        request_id: randomUUID(),
        variant_id: variantId,
        slot: 1,
        copy: { ...unknown, quantity: 999, quantity_unit: "pieces" },
      },
      422,
      "22023",
    );
    await visit(reviewer, headId);
    assert.equal(
      await reviewer.page.getByRole("button", { name: "Approve", exact: true }).isDisabled(),
      true,
    );
    await acknowledge("OEM_REFERENCE", referenceId);
    const approval = await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Approve", exact: true }),
      200,
    );
    assert.equal(approval.request.action, "packaging_review");
    if (approval.request.action !== "packaging_review")
      throw new Error("Wrong packaging review action.");
    const approved = success(approval.result);
    await settled(reviewer);
    assert.equal((await scope()).current?.id, approved.revision_id);
    assert.equal((await scope()).current?.status, "OEM_REFERENCE");
    assert.equal((await scope()).current?.valid, true);
    assert.deepEqual((await scope()).current?.copy, unknown);
    assert.equal((await data()).readiness.unknown, 1);
    assert.equal((await data()).readiness.unresolved, 1);
    const replays = await local.withAuthorityLock(
      () =>
        Promise.all([
          executeConsoleCommand(reviewer.client, approval.request),
          executeConsoleCommand(reviewer.client, approval.request),
        ]),
      2,
    );
    for (const replay of replays) assert.deepEqual(success(replay), approved);
    results.push(
      "packaging evidence and role refusals, real reference-only approval and observed receipt contention",
    );

    checkpoint("packaging omitted contradiction, stale snapshot and EDIT conflict inheritance");
    await propose(known, headId);
    await submit();
    // A contradiction against the earlier UNKNOWN count still binds this head after a count change.
    const historicalSource = await executeConsoleCommand(owner.client, {
      action: "packaging_source",
      request_id: randomUUID(),
      variant_id: variantId,
      original_id: null,
      copy: unknown,
      source: packagingTestSource("contradiction", unknown),
    });
    const contradictionId = success(historicalSource).source_id!;
    assert.ok(contradictionId);
    assert.notEqual(contradictionId, referenceId);
    assert.equal((await scope()).current?.valid, false);
    assert.equal((await scope()).current?.status, "DATA_CONFLICT");
    assert.equal((await scope()).latest.fresh, false);
    const stale = (await scope()).latest;
    await wire(reviewer, review(stale, knownFactoryId, "CONFIRMED"), 422, "23514");
    assert.deepEqual((await scope()).conflicts, [contradictionId]);
    assert.equal(stale.sources.includes(contradictionId), false);
    await visit(reviewer, headId);
    assert.equal(
      await reviewer.page.getByRole("button", { name: "Approve", exact: true }).isDisabled(),
      true,
    );
    await physical(reviewer.page, corrected);
    await reviewer.page
      .getByRole("checkbox", { name: packagingTestSource("factory", corrected).title, exact: true })
      .check();
    await reason(
      reviewer.page,
      "TEST-ONLY count correction retains historical unknown-count contradiction",
    );
    const edit = await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Edit proposal", exact: true }),
      200,
    );
    success(edit.result);
    await settled(reviewer);
    assert.equal(edit.request.action, "packaging_review");
    if (edit.request.action !== "packaging_review") throw new Error("Wrong packaging edit action.");
    assert.equal(edit.request.decision, "EDIT");
    assert.equal(edit.request.confirmation, null);
    assert.equal((await scope()).latest.revision, 3);
    assert.equal((await scope()).latest.status, "DATA_CONFLICT");
    await visit(owner, headId);
    await submit();
    await visit(reviewer, headId);
    await reason(reviewer.page, "TEST-ONLY explicit rejection preserves preceding reference");
    const reject = await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Reject", exact: true }),
      200,
    );
    success(reject.result);
    await settled(reviewer);
    assert.equal((await scope()).current?.id, approved.revision_id);
    assert.equal((await scope()).latest.state, "rejected");
    results.push(
      "packaging stale omitted contradiction, explicit EDIT conflict inheritance and REJECT retention",
    );

    checkpoint(
      "packaging human confirmation, conflict resolution and actual fresh-approval contention",
    );
    await propose(corrected, headId);
    await submit();
    const fresh = (await scope()).latest;
    const confirmedReview = review(fresh, factoryId, "CONFIRMED");
    await wire(reviewer, confirmedReview, 422, "23514");
    await wire(
      reviewer,
      {
        ...confirmedReview,
        request_id: randomUUID(),
        source_id: contradictionId,
        resolution: "TEST-ONLY resolution",
      },
      422,
      "23514",
    );
    await visit(reviewer, headId);
    await acknowledge("CONFIRMED", factoryId);
    assert.equal(
      await reviewer.page.getByRole("button", { name: "Approve", exact: true }).isDisabled(),
      true,
    );
    const resolution = "TEST-ONLY contradiction reconciled for acceptance, not real SKU evidence";
    await reviewer.page.getByLabel("Conflict resolution", { exact: true }).fill(resolution);
    const competingReview = { ...confirmedReview, request_id: randomUUID(), resolution };
    const [browserRace, sdkRace] = await local.withAuthorityLock(
      () =>
        Promise.all([
          command(
            reviewer.page,
            reviewer.page.getByRole("button", { name: "Approve", exact: true }),
            [200, 409],
          ),
          executeConsoleCommand(reviewer.client, competingReview),
        ]),
      2,
    );
    assert.equal([browserRace.result, sdkRace].filter((item) => item.ok).length, 1);
    const loser = [browserRace.result, sdkRace].find((item) => !item.ok)!;
    assert.equal(loser.ok, false);
    if (!loser.ok) assert.equal(loser.code, "40001");
    assert.notEqual(browserRace.request.request_id, competingReview.request_id);
    assert.equal((await scope()).current?.id, fresh.id);
    assert.equal((await scope()).current?.status, "CONFIRMED");
    assert.equal((await scope()).current?.valid, true);
    assert.deepEqual((await scope()).current?.copy, corrected);
    assert.equal((await data()).readiness.unknown, 0);
    assert.equal((await data()).readiness.unresolved, 0);
    results.push(
      "packaging explicit confirmation and conflict resolution with one observed native race winner",
    );

    checkpoint("packaging private history and six persisted responsive views");
    const history = await readPackagingHistory(owner.client, variantId, headId, 1);
    assert.deepEqual(
      history.items.map((item) => [item.revision, item.decision, item.approvedStatus]),
      [
        [4, "APPROVE", "CONFIRMED"],
        [3, "REJECT", null],
        [2, "EDIT", null],
        [1, "APPROVE", "OEM_REFERENCE"],
      ],
    );
    assert.equal(history.total, 4);
    assert.doesNotMatch(JSON.stringify(history), /raw_snapshot|access_token|source_digest/);
    await visit(viewer, headId);
    for (const name of [
      "Approve",
      "Edit proposal",
      "Reject",
      "Save proposal",
      "Submit frozen proposal",
      "Add source",
    ])
      assert.equal(await viewer.page.getByRole("button", { name, exact: true }).count(), 0);
    for (const width of [360, 390, 768, 1024, 1280, 1440]) {
      await owner.page.setViewportSize({ width, height: 1000 });
      await visit(owner, headId);
      assert.equal(await owner.page.getByRole("heading", { level: 1 }).count(), 1);
      assert.equal(
        await owner.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        true,
      );
      await owner.page.screenshot({
        path: path.join(input.output, `packaging-${width}.png`),
        fullPage: true,
      });
    }
    await propose(corrected, headId);
    await submit();
    const revokedTarget = (await scope()).latest;
    const revokedReview = { ...review(revokedTarget, factoryId, "CONFIRMED"), resolution };
    assertPackagingLedger(local.json(packagingLedgerQuery(variantId, reviewer.id)));
    const sourceRows = local.json(
      "select jsonb_agg(to_jsonb(t) order by evidence_source_id) from packaging_source_bindings t;",
    );
    results.push(
      "packaging counted decision history, six native responsive views and exact retained ledger",
    );
    async function deniedRoute(participant: Participant) {
      const page = await participant.ctx.newPage();
      try {
        const response = await page.goto(`${browserOrigin}${pathname}?head=${headId}`);
        privateResponse(response!.headers());
        await page.waitForURL((url) => url.pathname === "/console/login");
        assert.equal(await page.getByLabel("Package description", { exact: true }).count(), 0);
      } finally {
        await page.close();
      }
    }
    return {
      results,
      screenshots: 6,
      assertRevoked: async () => {
        checkpoint("packaging revoked reviewer cannot replay a receipt, approve or read");
        await wire(reviewer, revokedReview, 403, "42501");
        await wire(reviewer, approval.request, 403, "42501");
        const prior = approval.request as Review;
        const rpc = await reviewer.client.rpc("pi_review_packaging_revision", {
          request_uuid: prior.request_id,
          revision_uuid: prior.revision_id,
          expected_revision: prior.revision,
          expected_digest: prior.digest,
          decision: prior.decision,
          review_reason: prior.reason,
          approved_status: prior.status!,
          confirmation: prior.confirmation!,
          source_uuid: prior.source_id!,
          conflict_resolution: prior.resolution,
          replacement: prior.replacement,
        });
        assert.equal(rpc.error?.code, "42501");
        await assert.rejects(() => readPackagingWorkbench(reviewer.client, variantId));
        await assert.rejects(() => readPackagingHistory(reviewer.client, variantId, headId, 1));
        await deniedRoute(reviewer);
        assert.equal((await scope()).latest.id, revokedTarget.id);
        assert.equal((await scope()).current?.id, fresh.id);
        assert.equal((await scope()).current?.valid, true);
        assertPackagingLedger(local.json(packagingLedgerQuery(variantId, reviewer.id)));
        assert.deepEqual(
          local.json(
            "select jsonb_agg(to_jsonb(t) order by evidence_source_id) from packaging_source_bindings t;",
          ),
          sourceRows,
        );
        results.push(
          "packaging revoked HTTP/RPC receipt, fresh approval and private reads denied; history retained",
        );
      },
      assertLoggedOut: async () => {
        checkpoint("packaging logged-out owner cannot use copied commands or read the workbench");
        await wire(owner, revokedReview, 403, "42501");
        await deniedRoute(owner);
        assertPackagingLedger(local.json(packagingLedgerQuery(variantId, reviewer.id)));
        results.push(
          "packaging logged-out browser commands and private route denied without publication",
        );
      },
    };
  } finally {
    for (const participant of [owner, reviewer, viewer]) participant.page.off("dialog", dialog);
    assert.deepEqual(
      packagingNonInterferenceQueries.map((query) => local.json(query)),
      protectedBefore,
    );
  }
}
