import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type {
  BrowserContext,
  Dialog,
  Locator,
  Page,
  Request as BrowserRequest,
} from "./browser-runtime/node_modules/playwright/index.js";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { executeConsoleCommand } from "../../lib/console/commands.ts";
import { readMediaMappingHistory, readMediaMappings } from "../../lib/console/media-mapping.ts";
import { consoleMediaReviewEnabled } from "../../lib/console/working-config.ts";
import type { CommandResult, ConsoleCommand } from "../../lib/domain/catalog/commands.ts";
import { originalInspectionPath } from "../../lib/domain/catalog/original-inspection.ts";
import { readMediaObservation } from "../../lib/domain/catalog/media-review.ts";
import { browserOrigin, privateResponse } from "./browser-server.ts";
import type { openLocalAcceptance } from "./local-acceptance.ts";

type Participant = { ctx: BrowserContext; page: Page; client: ConsoleClient };
type Input = {
  variantId: string;
  owner: Participant;
  reviewer: Participant & { id: string };
  viewer: Participant;
  context: () => Promise<BrowserContext>;
  original: { asset_id: string; intent_id: string; bytes: Buffer };
  withAuthorityLock: ReturnType<typeof openLocalAcceptance>["withAuthorityLock"];
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
  inspectionBody: (request: BrowserRequest) => Buffer;
};
function success(result: CommandResult) {
  assert.equal(result.ok, true, "Expected media command success.");
  if (!result.ok) throw new Error("Media command failed; private output suppressed.");
  return result.result;
}

// Only the pristine, adopted, disposable runner may call this. No browser response is mocked.
// All evidence and human decisions below are TEST-ONLY declarations about a generated raster.
export async function runMediaWorkingBrowser(input: Input) {
  assert.equal(process.env.CI, "true");
  assert.equal(consoleMediaReviewEnabled(), true);
  const { owner, reviewer, viewer, original, variantId, goto, command } = input;
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
  const pathname = `/console/products/${variantId}/media`;
  const endpoint = browserOrigin + "/console/commands";
  const inspectEndpoint = browserOrigin + originalInspectionPath;
  const headers = { origin: browserOrigin, "x-console-command": "1" };
  const results: string[] = [];
  const reason = (page: Page, value: string) =>
    page.getByLabel("Decision / proposal reason", { exact: true }).fill(value);
  let reloadingEvidence = false;
  let dialogFailed = false;
  let reloadConfirmations = 0;
  const dialogSettlements: Promise<void>[] = [];
  const checkpoint = (value: string) => {
    assert.equal(dialogFailed, false, "Unexpected media dialog; private output suppressed.");
    input.checkpoint(value);
  };
  const dialog = (value: Dialog) => {
    const reload =
      reloadingEvidence &&
      value.page() === owner.page &&
      value.type() === "confirm" &&
      value.message() === "Discard unsaved changes and leave this page?";
    if (reload) {
      reloadingEvidence = false;
      reloadConfirmations++;
    }
    const allowed = reload || value.type() === "beforeunload";
    if (!allowed) dialogFailed = true;
    dialogSettlements.push(
      (allowed ? value.accept() : value.dismiss()).catch(() => {
        dialogFailed = true;
      }),
    );
  };
  for (const participant of [owner, reviewer, viewer]) participant.page.on("dialog", dialog);
  async function data() {
    const value = await readMediaMappings(owner.client, variantId);
    assert.ok(value);
    assert.equal(value.sku, "AF-MIG-TS-9998");
    assert.doesNotMatch(
      JSON.stringify(value),
      /working-originals|storage_path|raw_snapshot|access_token|v1\|/,
    );
    return value;
  }
  async function scope() {
    const value = await data();
    assert.equal(value.scopes.length, 1);
    assert.equal(value.scopes[0].role, "main");
    assert.equal(value.scopes[0].slot, 0);
    return value.scopes[0];
  }
  async function visit(participant: Participant, head = "new") {
    await goto(participant.page, `${pathname}?head=${head}`);
    await participant.page.getByRole("heading", { name: "Image mappings", exact: true }).waitFor();
  }
  async function record(
    dimension: "usage_rights" | "product_match",
    title: string,
    contradicts = false,
  ) {
    await owner.page.getByText("Add exact-image evidence", { exact: true }).click();
    await owner.page.getByLabel("Evidence dimension", { exact: true }).selectOption(dimension);
    await owner.page.getByLabel("Source class", { exact: true }).selectOption("company_record");
    await owner.page
      .getByLabel("Evidence basis", { exact: true })
      .selectOption(dimension === "usage_rights" ? "company_ownership" : "inspection_record");
    await owner.page
      .getByLabel("Assertion", { exact: true })
      .selectOption(contradicts ? "contradicts" : "supports");
    const fields = {
      "Source title": title,
      "Document / record reference": "TEST-ONLY generated raster; no real product evidence",
      "Source custodian": "Synthetic disposable custodian",
      "Document revision": contradicts ? "QA-CONFLICT" : "QA-1",
      "Page / clause / callout": "Synthetic fixture only",
      "Evidence date": new Date().toISOString().slice(0, 10),
    };
    for (const [label, value] of Object.entries(fields))
      await owner.page.getByLabel(label, { exact: true }).fill(value);
    const received = await command(
      owner.page,
      owner.page.getByRole("button", { name: "Record evidence", exact: true }),
    );
    assert.equal(received.request.action, "media_source");
    const result = success(received.result);
    assert.ok(result.source_id);
    await owner.page
      .getByText("Evidence changed / Latest record required", { exact: true })
      .waitFor();
    reloadingEvidence = true;
    try {
      await Promise.all([
        owner.page.waitForEvent("domcontentloaded"),
        owner.page.getByRole("link", { name: "Reload latest record", exact: true }).click(),
      ]);
    } finally {
      reloadingEvidence = false;
    }
    await owner.page.getByRole("heading", { name: "Image mappings", exact: true }).waitFor();
    return result.source_id;
  }
  async function propose(head?: string) {
    await visit(owner, head);
    await owner.page.getByLabel("Stored original", { exact: true }).selectOption(original.asset_id);
    await owner.page
      .getByLabel("Image alt text", { exact: true })
      .fill("Synthetic disposable raster, not a product image");
    for (const title of ["Synthetic media rights", "Synthetic media match"])
      await owner.page.getByRole("checkbox", { name: new RegExp(title) }).check();
    await reason(owner.page, "Synthetic mapping proposal only");
    const saved = await command(
      owner.page,
      owner.page.getByRole("button", { name: "Save proposal", exact: true }),
      200,
      true,
    );
    assert.equal(saved.request.action, "media_propose");
    const result = success(saved.result);
    assert.ok(result.head_id && result.mapping_id);
    return result.head_id;
  }
  async function submit() {
    const received = await command(
      owner.page,
      owner.page.getByRole("button", { name: "Submit for review", exact: true }),
      200,
      true,
    );
    assert.equal(received.request.action, "media_submit");
    success(received.result);
    assert.equal((await scope()).candidate?.state, "pending");
  }
  async function inspectHttp(participant: Participant, status = 200) {
    const current = await scope();
    const candidate = current.candidate;
    assert.ok(candidate && candidate.state === "pending");
    const response = await participant.ctx.request.post(inspectEndpoint, {
      headers,
      data: { mapping_id: candidate.id, revision: current.revision, digest: candidate.digest },
      maxRedirects: 0,
    });
    assert.equal(response.status(), status);
    privateResponse(response.headers());
    if (status !== 200) {
      assert.equal(response.headers()["x-console-media-observation"], undefined);
      assert.equal((await response.json()).ok, false);
      return null;
    }
    assert.equal(response.headers()["content-type"], "image/png");
    assert.equal(response.headers()["content-length"], String(original.bytes.length));
    assert.deepEqual(
      await response.body(),
      original.bytes,
      "Observed private original bytes changed.",
    );
    const token = readMediaObservation(response.headers()["x-console-media-observation"], {
      mapping_id: candidate.id,
      revision: current.revision,
      digest: candidate.digest,
      original_digest: candidate.originalDigest,
    });
    assert.ok(token);
    assert.equal(token.value.split("|")[2], reviewer.id);
    return token;
  }
  async function wire(
    participant: Participant,
    value: ConsoleCommand,
    status: number,
    code?: string,
  ) {
    const response = await participant.ctx.request.post(endpoint, {
      headers,
      data: value,
      maxRedirects: 0,
    });
    assert.equal(response.status(), status);
    privateResponse(response.headers());
    const body: CommandResult = await response.json();
    assert.equal(body.ok, status === 200);
    assert.doesNotMatch(JSON.stringify(body), /v1\||raw_snapshot|storage_path|access_token/);
    if (code) {
      assert.equal(body.ok, false);
      if (!body.ok) assert.equal(body.code, code);
    }
    return body;
  }
  try {
    checkpoint("media mappings: two real evidence forms, original association and source reload");
    await visit(owner);
    await owner.page.getByLabel("Stored original", { exact: true }).selectOption(original.asset_id);
    const rightsId = await record("usage_rights", "Synthetic media rights");
    await owner.page.getByLabel("Stored original", { exact: true }).selectOption(original.asset_id);
    const matchId = await record("product_match", "Synthetic media match");
    assert.notEqual(rightsId, matchId);
    assert.equal((await data()).sources.length, 2);
    const headId = await propose();
    await submit();
    const pending = (await scope()).candidate!;
    assert.equal(pending.originalIntentId, original.intent_id);
    assert.deepEqual([...pending.sourceIds].sort(), [rightsId, matchId].sort());
    results.push("media exact-SKU source forms, immutable original mapping and frozen submission");

    checkpoint(
      "media mappings: real reviewer image load, acknowledgements and APPROVE persistence",
    );
    await visit(reviewer, headId);
    assert.equal(
      await reviewer.page
        .getByRole("button", { name: "Approve mapping", exact: true })
        .isDisabled(),
      true,
    );
    const observedResponse = reviewer.page.waitForResponse(
      (value) => value.url() === inspectEndpoint && value.request().method() === "POST",
    );
    await reviewer.page.getByRole("button", { name: "Inspect original", exact: true }).click();
    const observed = await observedResponse;
    assert.equal(observed.status(), 200);
    privateResponse(observed.headers());
    assert.match((await observed.request().allHeaders()).cookie ?? "", /sb-/);
    assert.deepEqual(input.inspectionBody(observed.request()), original.bytes);
    await reviewer.page
      .getByText("Original checked / Inspection active", { exact: true })
      .waitFor();
    await reviewer.page.waitForFunction(
      () =>
        document.querySelector<HTMLImageElement>('img[alt^="Stored original:"]')?.naturalWidth ===
        32,
    );
    const downloaded = reviewer.page.waitForEvent("download");
    await reviewer.page.getByRole("link", { name: "Download original", exact: true }).click();
    const chunks: Buffer[] = [];
    for await (const chunk of await (await downloaded).createReadStream())
      chunks.push(Buffer.from(chunk));
    assert.deepEqual(Buffer.concat(chunks), original.bytes);
    await reason(reviewer.page, "Synthetic human image review, never real product approval");
    await reviewer.page.getByLabel("Usage-rights evidence", { exact: true }).selectOption(rightsId);
    await reviewer.page.getByLabel("Exact-product evidence", { exact: true }).selectOption(matchId);
    for (const label of [
      "I inspected the unchanged original",
      "I confirm documented image usage rights",
      "I confirm this image depicts the exact SKU",
    ])
      await reviewer.page.getByLabel(label, { exact: true }).check();
    assert.equal(
      await reviewer.page.evaluate(() =>
        JSON.stringify({
          html: document.body.innerHTML,
          local: { ...localStorage },
          session: { ...sessionStorage },
        }).includes("v1|"),
      ),
      false,
    );
    const approval = await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Approve mapping", exact: true }),
      200,
      true,
    );
    assert.equal(approval.request.action, "media_review");
    if (approval.request.action !== "media_review") throw new Error("Wrong media review action.");
    assert.equal(approval.request.decision, "APPROVE");
    const approved = success(approval.result);
    assert.equal((await scope()).candidate, null);
    assert.equal((await scope()).current?.id, approved.mapping_id);
    assert.equal((await scope()).current?.valid, true);
    assert.equal((await scope()).current?.observed, true);
    const replayed = await input.withAuthorityLock(
      () =>
        Promise.all([
          executeConsoleCommand(reviewer.client, approval.request),
          executeConsoleCommand(reviewer.client, approval.request),
        ]),
      2,
    );
    for (const item of replayed) assert.deepEqual(success(item), approved);
    results.push(
      "media real Storage inspector, human controls, approval ledger and contended exact receipt retry",
    );

    checkpoint(
      "media mappings: unselected contradiction invalidates current without legacy fallback",
    );
    await visit(owner, headId);
    await record("product_match", "Synthetic omitted contradiction", true);
    assert.equal((await scope()).current?.valid, false);
    assert.equal((await scope()).current?.observed, true);
    assert.equal((await scope()).current?.status, "DATA_CONFLICT");
    await propose(headId);
    await submit();
    assert.equal((await scope()).candidate?.status, "DATA_CONFLICT");
    assert.equal((await scope()).candidate?.sourceIds.length, 2);
    await visit(reviewer, headId);
    await reviewer.page.getByRole("button", { name: "Edit mapping", exact: true }).click();
    await reviewer.page
      .getByLabel("Image alt text", { exact: true })
      .fill("Synthetic corrected private raster");
    await reason(reviewer.page, "Synthetic correction keeps unresolved conflict");
    const edited = await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Save replacement", exact: true }),
      200,
      true,
    );
    assert.equal(edited.request.action, "media_review");
    if (edited.request.action !== "media_review") throw new Error("Wrong media edit action.");
    assert.equal(edited.request.decision, "EDIT");
    assert.equal(edited.request.observation, null);
    assert.equal(edited.request.confirmation, null);
    assert.equal((await scope()).candidate?.revision, 3);
    assert.equal((await scope()).candidate?.status, "DATA_CONFLICT");
    await visit(owner, headId);
    await submit();
    await visit(reviewer, headId);
    await reason(reviewer.page, "Synthetic explicit rejection preserves preceding approval");
    const rejected = await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Reject mapping", exact: true }),
      200,
      true,
    );
    success(rejected.result);
    assert.equal(rejected.request.action, "media_review");
    if (rejected.request.action !== "media_review")
      throw new Error("Wrong media rejection action.");
    assert.equal(rejected.request.decision, "REJECT");
    assert.equal(rejected.request.observation, null);
    assert.equal((await scope()).candidate, null);
    assert.equal((await scope()).current?.id, approved.mapping_id);
    results.push("media omitted conflict, explicit EDIT inheritance and REJECT retention");

    checkpoint("media mappings: copied-actor/tampered observations and read-only roles denied");
    await propose(headId);
    await submit();
    await visit(viewer, headId);
    for (const name of [
      "Approve mapping",
      "Edit mapping",
      "Reject mapping",
      "Save proposal",
      "Submit for review",
    ])
      assert.equal(await viewer.page.getByRole("button", { name, exact: true }).count(), 0);
    await inspectHttp(viewer, 403);
    const token = await inspectHttp(reviewer);
    assert.ok(token);
    const target = (await scope()).candidate!;
    const review: ConsoleCommand = {
      action: "media_review",
      request_id: randomUUID(),
      mapping_id: target.id,
      revision: target.revision,
      digest: target.digest,
      decision: "APPROVE",
      reason: "Synthetic contended media approval",
      resolution:
        "Synthetic TEST-ONLY contradiction reconciled for acceptance; not real SKU evidence",
      confirmation: {
        original_digest: target.originalDigest,
        original_inspected: true,
        usage_rights_confirmed: true,
        exact_product_confirmed: true,
      },
      rights_source_id: rightsId,
      match_source_id: matchId,
      observation: token.value,
      replacement: null,
    };
    await wire(owner, review, 422, "23514");
    await wire(viewer, review, 403, "42501");
    const anonymous = await input.context();
    try {
      await wire({ ...viewer, ctx: anonymous }, review, 403, "42501");
      await inspectHttp({ ...viewer, ctx: anonymous }, 403);
    } finally {
      await anonymous.close();
    }
    const foreignOrigin = await reviewer.ctx.request.post(inspectEndpoint, {
      headers: { ...headers, origin: "https://invalid.example" },
      data: { mapping_id: target.id, revision: target.revision, digest: target.digest },
      maxRedirects: 0,
    });
    assert.equal(foreignOrigin.status(), 403);
    privateResponse(foreignOrigin.headers());
    assert.equal(foreignOrigin.headers()["x-console-media-observation"], undefined);
    await wire(
      reviewer,
      {
        ...review,
        request_id: randomUUID(),
        observation: token.value.slice(0, -1) + (token.value.endsWith("a") ? "b" : "a"),
      },
      422,
      "23514",
    );
    assert.equal((await scope()).candidate?.id, target.id);
    const approvals = await input.withAuthorityLock(
      () =>
        Promise.all([
          executeConsoleCommand(reviewer.client, review),
          executeConsoleCommand(reviewer.client, { ...review, request_id: randomUUID() }),
        ]),
      2,
    );
    assert.equal(approvals.filter((item) => item.ok).length, 1);
    const loser = approvals.find((item) => !item.ok)!;
    assert.equal(loser.ok, false);
    if (!loser.ok) assert.equal(loser.code, "40001");
    assert.equal((await scope()).current?.id, target.id);
    assert.equal((await scope()).current?.valid, true);
    assert.equal((await scope()).current?.observed, true);
    results.push(
      "media actual actor/signature/role refusals and observed fresh-approval lock contention",
    );

    checkpoint("media mappings: persisted private history and six viewport widths");
    const history = await readMediaMappingHistory(owner.client, variantId, headId, 1);
    assert.equal(history.total, 4);
    assert.equal(history.items.length, 4);
    // Decisions attach to the reviewed revision: EDIT is on revision 2, not its replacement 3.
    assert.deepEqual(
      history.items.map((item) => [item.revision, item.decision]),
      [
        [4, "APPROVE"],
        [3, "REJECT"],
        [2, "EDIT"],
        [1, "APPROVE"],
      ],
    );
    assert.doesNotMatch(JSON.stringify(history), /v1\||raw_snapshot|storage_path|access_token/);
    for (const width of [360, 390, 768, 1024, 1280, 1440]) {
      await owner.page.setViewportSize({ width, height: 1000 });
      await visit(owner, headId);
      assert.equal(await owner.page.getByRole("heading", { level: 1 }).count(), 1);
      assert.equal(
        await owner.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        true,
      );
      await owner.page.screenshot({
        path: path.join(input.output, `media-${width}.png`),
        fullPage: true,
      });
    }
    await propose(headId);
    await submit();
    const revokedToken = await inspectHttp(reviewer);
    assert.ok(revokedToken);
    const revokedTarget = (await scope()).candidate!;
    const revokedReview = {
      ...review,
      request_id: randomUUID(),
      mapping_id: revokedTarget.id,
      revision: revokedTarget.revision,
      digest: revokedTarget.digest,
      observation: revokedToken.value,
      confirmation: { ...review.confirmation!, original_digest: revokedTarget.originalDigest },
    };
    await Promise.all(dialogSettlements);
    assert.equal(dialogFailed, false, "Unexpected media dialog; private output suppressed.");
    assert.ok(reloadConfirmations >= 2, "Synthetic unsaved reload guards were not exercised.");
    results.push("media counted immutable decision history and six persisted responsive views");
    return {
      results,
      screenshots: 6,
      assertRevoked: async () => {
        checkpoint(
          "media mappings: revoked reviewer cannot use fresh observation or completed receipt",
        );
        await wire(reviewer, revokedReview, 403, "42501");
        await wire(reviewer, approval.request, 403, "42501");
        await inspectHttp(reviewer, 403);
        await assert.rejects(() => readMediaMappings(reviewer.client, variantId));
        await assert.rejects(() => readMediaMappingHistory(reviewer.client, variantId, headId, 1));
        assert.equal((await scope()).candidate?.id, revokedTarget.id);
        assert.equal((await scope()).current?.id, target.id);
        results.push("media revoked-session inspection, receipt and pending approval refused");
      },
      assertLoggedOut: async () => {
        checkpoint("media mappings: logged-out owner cannot use copied review credentials");
        await wire(owner, revokedReview, 403, "42501");
        await inspectHttp(owner, 403);
        results.push("media logged-out browser command and observation refused");
      },
    };
  } finally {
    for (const participant of [owner, reviewer, viewer]) participant.page.off("dialog", dialog);
  }
}
