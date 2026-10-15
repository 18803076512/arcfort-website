import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import type {
  BrowserContext,
  Dialog,
  Locator,
  Page,
  Request as BrowserRequest,
} from "./browser-runtime/node_modules/playwright/index.js";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { executeConsoleCommand } from "../../lib/console/commands.ts";
import { readDocumentLibrary } from "../../lib/console/documents.ts";
import { readDocumentReview, type DocumentCandidate } from "../../lib/console/document-review.ts";
import { readDocumentReadiness } from "../../lib/console/catalog.ts";
import { consoleDocumentReviewEnabled } from "../../lib/console/working-config.ts";
import { documentObservationParts } from "../../lib/domain/catalog/document-review.ts";
import type { ConsoleCommand, CommandResult } from "../../lib/domain/catalog/commands.ts";
import { browserOrigin, privateResponse } from "./browser-server.ts";
import type { openLocalAcceptance } from "./local-acceptance.ts";
import {
  assertDocumentLedger,
  documentLedgerQuery,
  documentNonInterferenceQueries,
  documentTestCopy,
  documentTestSource,
} from "./document-acceptance.ts";

type Participant = { ctx: BrowserContext; page: Page; client: ConsoleClient };
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
  inspectionBody: (request: BrowserRequest) => Buffer;
  checkpoint: (value: string) => void;
};
const success = (result: CommandResult) => {
  assert.equal(result.ok, true, "Expected isolated document command success.");
  if (!result.ok) throw new Error("Document command failed; private output suppressed.");
  return result.result;
};
const target = (candidate: DocumentCandidate) => ({
  candidate_id: candidate.candidate_id,
  revision: candidate.revision,
  digest: candidate.digest,
});

// Real Auth, HTTP, Storage and observed database contention. No responses or decisions are mocked.
// The parent verifies a pristine disposable target before creating any synthetic account or key.
export async function runDocumentWorkingBrowser(input: Input) {
  assert.equal(process.env.CI, "true");
  assert.equal(input.local.documents, true);
  assert.equal(consoleDocumentReviewEnabled(), true);
  const { owner, reviewer, viewer, variantId, local, goto, command, checkpoint } = input;
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
  const retained = documentNonInterferenceQueries.map((query) => local.json(query));
  const libraryPath = `/console/products/${variantId}/documents`;
  const endpoint = `${browserOrigin}/console/commands`;
  const uploadEndpoint = `${browserOrigin}/console/documents/upload`;
  const inspectEndpoint = `${browserOrigin}/console/documents/inspect`;
  const headers = { origin: browserOrigin, "x-console-command": "1" };
  const results: string[] = [];
  const pdf = await PDFDocument.create();
  pdf.addPage([100, 100]);
  const bytes = Buffer.from(await pdf.save({ useObjectStreams: false }));
  const digest = createHash("sha256").update(bytes).digest("hex");
  let documentId = "",
    rightsId = "",
    scopeId = "";
  const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
  const field = (page: Page, name: string) => page.getByLabel(name, { exact: true });
  const reviewPath = () => `${libraryPath}/${documentId}`;
  const dialog = (event: Dialog) =>
    event.type() === "beforeunload" ? void event.accept() : void event.dismiss();
  for (const participant of [owner, reviewer, viewer]) participant.page.on("dialog", dialog);
  const data = async () => {
    const value = await readDocumentReview(owner.client, variantId, documentId, 1, 1);
    assert.ok(value);
    return value;
  };
  async function settled(participant: Participant, revision: number, state: string) {
    // Never force a reload here: successful commands must update the acting browser themselves.
    await participant.page
      .locator("section")
      .filter({
        has: participant.page.getByRole("heading", { name: "Latest candidate", exact: true }),
      })
      .getByText(`Revision ${revision} / ${state}`, { exact: true })
      .waitFor();
    const latest = (await data()).latest;
    assert.equal(latest?.revision, revision);
    assert.equal(latest?.decision ?? (latest?.submitted ? "Pending review" : "Draft"), state);
  }
  async function wire(
    participant: Participant,
    request: ConsoleCommand,
    status = 200,
    origin = browserOrigin,
  ) {
    const response = await participant.ctx.request.post(endpoint, {
      headers: { ...headers, origin },
      data: request,
      maxRedirects: 0,
    });
    assert.equal(response.status(), status);
    privateResponse(response.headers());
    return (await response.json()) as CommandResult;
  }
  async function inspection(
    participant: Participant,
    payload: object,
    status = 200,
    origin = browserOrigin,
  ) {
    const response = await participant.ctx.request.post(inspectEndpoint, {
      headers: { ...headers, origin },
      data: payload,
      maxRedirects: 0,
    });
    assert.equal(response.status(), status);
    privateResponse(response.headers());
    if (status === 200) {
      assert.equal(response.headers()["content-type"], "application/pdf");
      assert.equal(response.headers()["content-length"], String(bytes.length));
      assert.equal(response.headers()["x-content-type-options"], "nosniff");
      assert.deepEqual(await response.body(), bytes);
    }
    return response;
  }
  async function register(next = false) {
    if (next) await button(owner.page, `New version of ${documentTestCopy.title}`).click();
    for (const [name, value] of [
      ["Document title", documentTestCopy.title + (next ? " version 2" : "")],
      ["Source custodian", documentTestCopy.owner_name],
      ["Source reference", documentTestCopy.source_reference],
      ["Page or section", documentTestCopy.source_location],
      ["Exact-SKU scope", documentTestCopy.scope_note],
    ])
      await field(owner.page, name).fill(value);
    const sent = await command(owner.page, button(owner.page, "Register reference"));
    const receipt = success(sent.result);
    assert.ok(receipt.document_id);
    await owner.page
      .getByRole("table", { name: "Document references" })
      .getByText(documentTestCopy.title + (next ? " version 2" : ""), { exact: true })
      .waitFor();
    assert.equal(sent.request.action, "document_reference");
    if (sent.request.action === "document_reference")
      assert.equal(sent.request.prior_document_id, next ? documentId : null);
    return { id: receipt.document_id, request: sent.request, result: sent.result };
  }
  async function record(kind: "rights" | "scope" | "contradiction") {
    const copy = documentTestSource(kind);
    await button(owner.page, "Add evidence").click();
    await field(owner.page, "Evidence dimension").selectOption(
      kind === "rights" ? "usage_rights" : "exact_scope",
    );
    await owner.page
      .getByRole("combobox", { name: "Evidence basis", exact: true })
      .selectOption(copy.evidence_basis);
    await field(owner.page, "Assertion").selectOption(copy.assertion);
    for (const [name, value] of [
      ["Evidence title", copy.title],
      ["Evidence owner", copy.owner_name],
      ["Evidence reference", copy.source_reference],
      ["Evidence location", copy.source_location],
      ["Evidence scope", copy.scope_note],
      ["Evidence revision (unknown allowed)", copy.revision_label!],
      ["Evidence date (unknown allowed)", copy.evidence_date!],
    ])
      await field(owner.page, name).fill(value);
    const sent = await command(owner.page, button(owner.page, "Register evidence"));
    const id = success(sent.result).source_id;
    assert.ok(id);
    await owner.page
      .getByRole("table", { name: "Document evidence" })
      .getByText(copy.title, { exact: true })
      .waitFor();
    assert.ok((await data()).sources.items.some((source) => source.source_id === id));
    return id;
  }
  async function propose() {
    await goto(owner.page, reviewPath());
    for (const kind of ["rights", "scope"] as const)
      await owner.page
        .getByRole("checkbox", { name: `Select ${documentTestSource(kind).title}`, exact: true })
        .check();
    await owner.page
      .getByRole("textbox", { name: "Review scope", exact: true })
      .fill(documentTestCopy.scope_note);
    await field(owner.page, "Reason").fill(
      "TEST-ONLY isolated proposal, never a real document approval",
    );
    const sent = await command(owner.page, button(owner.page, "Save review draft"));
    const receipt = success(sent.result);
    assert.ok(receipt.revision);
    await settled(owner, receipt.revision, "Draft");
    const saved = await data();
    assert.equal(
      saved.latest?.verification_status,
      saved.sources.total === 3 ? "DATA_CONFLICT" : "NEEDS_FACTORY_CONFIRMATION",
    );
    return sent;
  }
  async function submit(participant = owner) {
    const before = (await data()).latest!;
    const sent = await command(participant.page, button(participant.page, "Submit review"));
    success(sent.result);
    await settled(participant, before.revision, "Pending review");
  }
  async function approvalFields() {
    await goto(reviewer.page, reviewPath());
    const latest = (await data()).latest!;
    assert.equal(await button(reviewer.page, "Record approval").isDisabled(), true);
    const pending = reviewer.page.waitForResponse(
      (response) => response.url() === inspectEndpoint && response.request().method() === "POST",
    );
    await button(reviewer.page, "Inspect review original").click();
    const response = await pending;
    assert.equal(response.status(), 200);
    privateResponse(response.headers());
    assert.match((await response.request().allHeaders()).cookie ?? "", /sb-/);
    assert.deepEqual(input.inspectionBody(response.request()), bytes);
    const token = response.headers()["x-console-document-observation"];
    const parts = documentObservationParts(token);
    assert.ok(parts, "Signed document observation missing or malformed.");
    assert.equal(parts[2], reviewer.id);
    assert.equal(parts[4], latest.candidate_id);
    assert.equal(parts[5], documentId);
    await reviewer.page
      .getByRole("region", { name: "Stored document inspection" })
      .getByText("Stored bytes checked", { exact: true })
      .waitFor();
    const download = reviewer.page.waitForEvent("download");
    await reviewer.page.getByRole("link", { name: "Download PDF original", exact: true }).click();
    const chunks: Buffer[] = [];
    for await (const chunk of await (await download).createReadStream())
      chunks.push(Buffer.from(chunk));
    assert.deepEqual(Buffer.concat(chunks), bytes);
    await field(reviewer.page, "Reason").fill(
      "TEST-ONLY human document review, never real product approval",
    );
    await reviewer.page
      .getByRole("combobox", { name: "Rights evidence", exact: true })
      .selectOption(rightsId);
    await reviewer.page
      .getByRole("combobox", { name: "Exact-scope evidence", exact: true })
      .selectOption(scopeId);
    await reviewer.page
      .getByRole("textbox", { name: "Conflict resolution", exact: true })
      .fill("TEST-ONLY contradiction reconciled for acceptance, not real evidence");
    for (const name of [
      "I inspected this original document",
      "I confirm the usage rights for this document",
      "I confirm the exact SKU scope",
    ])
      await field(reviewer.page, name).check();
    assert.equal(
      await reviewer.page.evaluate(() =>
        JSON.stringify({
          html: document.body.innerHTML,
          local: { ...localStorage },
          session: { ...sessionStorage },
        }).includes("document-v1|"),
      ),
      false,
    );
    return { latest, token };
  }

  checkpoint("documents: real reference/version forms and persisted library refresh");
  await goto(owner.page, libraryPath);
  assert.equal((await readDocumentLibrary(owner.client, variantId, 1))?.total, 0);
  const first = await register();
  documentId = first.id;
  assert.deepEqual(await wire(owner, first.request), first.result);
  const second = await register(true);
  assert.notEqual(first.id, second.id);
  assert.equal((await readDocumentLibrary(owner.client, variantId, 1))?.total, 2);
  results.push("document immutable reference/version forms and exact receipt retry");

  checkpoint("documents: real PDF upload, persisted refresh, exact Storage bytes and retry");
  await button(owner.page, `Upload original for ${documentTestCopy.title}`).click();
  await field(owner.page, "PDF original").setInputFiles({
    name: "synthetic-document.pdf",
    mimeType: "application/pdf",
    buffer: bytes,
  });
  const uploading = owner.page.waitForResponse(
    (response) => response.url() === uploadEndpoint && response.request().method() === "POST",
  );
  await button(owner.page, "Upload PDF").click();
  const uploaded = await uploading;
  assert.equal(uploaded.status(), 200);
  privateResponse(uploaded.headers());
  const uploadReceipt = await uploaded.json();
  assert.equal(uploadReceipt.ok, true);
  assert.equal(uploadReceipt.document_id, documentId);
  const uploadHeader = (await uploaded.request().allHeaders())["x-console-document"];
  assert.ok(uploadHeader);
  assert.deepEqual(uploaded.request().postDataBuffer(), bytes);
  await owner.page
    .getByRole("row")
    .filter({ has: owner.page.getByText(documentTestCopy.title, { exact: true }) })
    .getByText("Upload recorded", { exact: true })
    .waitFor();
  const intent = await owner.client
    .from("document_upload_intents")
    .select("storage_path,manifest")
    .eq("technical_document_id", documentId)
    .single();
  assert.equal(intent.error, null);
  assert.ok(intent.data);
  const storagePath = intent.data.storage_path;
  assert.equal((intent.data.manifest as { file_hash: string }).file_hash, digest);
  async function stored() {
    const response = await viewer.client.storage
      .from("pi-technical-evidence")
      .download(storagePath);
    assert.equal(response.error, null);
    assert.ok(response.data);
    assert.deepEqual(Buffer.from(await response.data.arrayBuffer()), bytes);
  }
  await stored();
  const retry = await owner.ctx.request.post(uploadEndpoint, {
    headers: { ...headers, "content-type": "application/pdf", "x-console-document": uploadHeader },
    data: bytes,
    maxRedirects: 0,
  });
  assert.equal(retry.status(), 200);
  privateResponse(retry.headers());
  assert.deepEqual(await retry.json(), uploadReceipt);
  const ordinary = await inspection(viewer, { variant_id: variantId, document_id: documentId });
  assert.equal(ordinary.headers()["x-console-document-observation"], undefined);
  await inspection(
    owner,
    { variant_id: variantId, document_id: documentId },
    403,
    "https://cross-origin.example.invalid",
  );
  await inspection(owner, { variant_id: input.foreignVariantId, document_id: documentId }, 409);
  results.push("document real PDF bytes, private ordinary inspection and upload idempotency");

  checkpoint("documents: evidence forms retain omitted contradiction and reviewer interlocks");
  await goto(owner.page, reviewPath());
  rightsId = await record("rights");
  scopeId = await record("scope");
  const proposal = await propose();
  await submit();
  await goto(viewer.page, reviewPath());
  for (const name of ["Add evidence", "Save review draft", "Submit review", "Record approval"])
    assert.equal(await button(viewer.page, name).count(), 0);
  await wire(viewer, proposal.request, 403);
  await wire(owner, proposal.request, 403, "https://cross-origin.example.invalid");
  const observed = await approvalFields();
  const approval: Extract<ConsoleCommand, { action: "document_review" }> = {
    action: "document_review",
    request_id: randomUUID(),
    ...target(observed.latest),
    decision: "APPROVE",
    reason: "TEST-ONLY refusal checks",
    resolution: "TEST-ONLY conflict resolution",
    confirmation: {
      original_digest: observed.latest.original_digest,
      original_inspected: true,
      usage_rights_confirmed: true,
      exact_scope_confirmed: true,
    },
    rights_source_id: rightsId,
    scope_source_id: scopeId,
    observation: observed.token,
    replacement: null,
  };
  for (const [participant, request, status] of [
    [owner, approval, 422],
    [reviewer, { ...approval, observation: observed.token.slice(0, -64) + "0".repeat(64) }, 422],
  ] as const)
    assert.equal((await wire(participant, request, status)).ok, false);
  await inspection(viewer, target(observed.latest), 403);
  assert.equal((await data()).latest?.decision, null);
  const approved = await command(reviewer.page, button(reviewer.page, "Record approval"));
  success(approved.result);
  await settled(reviewer, 1, "APPROVE");
  assert.equal((await data()).reviewed, true);
  const replay = await local.withAuthorityLock(
    () =>
      Promise.all([
        executeConsoleCommand(reviewer.client, approved.request),
        executeConsoleCommand(reviewer.client, approved.request),
      ]),
    2,
  );
  for (const response of replay) assert.deepEqual(response, approved.result);
  results.push(
    "document signed bytes, human approval, copied/tampered tokens, conflict and contended retry gates",
  );

  checkpoint("documents: EDIT creates unconfirmed replacement; REJECT retains prior current");
  await goto(owner.page, reviewPath());
  await record("contradiction");
  assert.equal((await data()).current?.human_valid, false);
  assert.equal((await data()).current?.observed, true);
  await propose();
  await submit();
  await goto(reviewer.page, reviewPath());
  await reviewer.page.getByRole("radio", { name: "Edit", exact: true }).check();
  await reviewer.page
    .getByRole("textbox", { name: "Review scope", exact: true })
    .fill("TEST-ONLY corrected scope");
  await field(reviewer.page, "Reason").fill("TEST-ONLY correction remains unconfirmed");
  success((await command(reviewer.page, button(reviewer.page, "Save correction"))).result);
  await settled(reviewer, 3, "Draft");
  assert.equal((await data()).latest?.verification_status, "DATA_CONFLICT");
  await submit(reviewer);
  await reviewer.page.getByRole("radio", { name: "Reject", exact: true }).check();
  await field(reviewer.page, "Reason").fill("TEST-ONLY rejection preserves the existing current");
  success((await command(reviewer.page, button(reviewer.page, "Reject review"))).result);
  await settled(reviewer, 3, "REJECT");
  assert.equal((await data()).current?.revision, 1);
  results.push("document EDIT/submit/REJECT forms, persisted history and current retention");

  checkpoint("documents: observed concurrent proposals permit one revision only");
  const concurrent: Extract<ConsoleCommand, { action: "document_propose" }> = {
    action: "document_propose",
    request_id: randomUUID(),
    variant_id: variantId,
    document_id: documentId,
    revision: 3,
    copy: { scope_note: "TEST-ONLY corrected scope", sources: [rightsId, scopeId] },
    reason: "TEST-ONLY concurrent proposal",
  };
  const raced = await local.withAuthorityLock(
    () =>
      Promise.all([
        executeConsoleCommand(owner.client, concurrent),
        executeConsoleCommand(owner.client, { ...concurrent, request_id: randomUUID() }),
      ]),
    2,
  );
  assert.equal(raced.filter((result) => result.ok).length, 1);
  const refused = raced.find((result) => !result.ok);
  assert.ok(refused && !refused.ok);
  assert.equal(refused.code, "40001");
  await goto(owner.page, reviewPath());
  await submit();
  const corrected = await approvalFields();
  const missingResolution = await wire(
    reviewer,
    {
      ...approval,
      request_id: randomUUID(),
      ...target(corrected.latest),
      observation: corrected.token,
      confirmation: {
        ...approval.confirmation!,
        original_digest: corrected.latest.original_digest,
      },
      resolution: "",
    },
    422,
  );
  assert.equal(missingResolution.ok, false);
  const finalApproval = await command(reviewer.page, button(reviewer.page, "Record approval"));
  success(finalApproval.result);
  await settled(reviewer, 4, "APPROVE");
  const ready = await readDocumentReadiness(viewer.client, variantId);
  assert.equal(ready?.reviewed_document_count, 1);
  assert.equal(ready?.unresolved_document_count, 1);
  assert.equal(ready?.unavailable_original_count, 1);
  await propose();
  await submit();
  assert.equal((await data()).current?.revision, 4);
  assert.equal((await data()).open, true);
  assert.equal((await data()).reviewed, false);
  const finalReadiness = {
    document_count: 2,
    reviewed_document_count: 0,
    unresolved_document_count: 2,
    unavailable_original_count: 1,
    open_document_review_count: 1,
    invalid_document_approval_count: 0,
    document_conflict_count: 1,
  };
  assert.deepEqual(await readDocumentReadiness(viewer.client, variantId), finalReadiness);
  assertDocumentLedger(local.json(documentLedgerQuery(variantId, reviewer.id)));
  results.push("document observed proposal race, independent versions and current/open readiness");

  let screenshots = 0;
  for (const width of [390, 1440]) {
    await viewer.page.setViewportSize({ width, height: 1000 });
    await goto(viewer.page, reviewPath());
    await viewer.page.getByText("Open review remains", { exact: true }).waitFor();
    await viewer.page.screenshot({
      path: path.join(input.output, `document-native-${width}.png`),
      fullPage: true,
    });
    screenshots++;
  }
  await viewer.page.setViewportSize({ width: 1440, height: 1000 });
  await goto(viewer.page, `/console/products/${variantId}`);
  await viewer.page
    .getByRole("region", { name: "Document Review", exact: true })
    .getByText("0 of 2 document versions reviewed; 2 unresolved.", { exact: true })
    .waitFor();
  await goto(viewer.page, "/console/readiness?blocker=documents");
  const readinessRow = viewer.page
    .getByRole("row")
    .filter({ has: viewer.page.getByText("AF-MIG-TS-9998", { exact: true }) });
  await readinessRow.getByRole("link", { name: /^2 unresolved \/ 2 versions/ }).waitFor();
  assert.deepEqual(
    documentNonInterferenceQueries.map((query) => local.json(query)),
    retained,
  );
  await stored();
  const anonymous = await input.context();
  try {
    const response = await anonymous.request.post(endpoint, {
      headers,
      data: proposal.request,
      maxRedirects: 0,
    });
    assert.equal(response.status(), 403);
    privateResponse(response.headers());
  } finally {
    await anonymous.close();
  }
  return {
    results,
    screenshots,
    async assertRevoked() {
      checkpoint("documents: revoked reviewer cannot replay approvals, inspect or read");
      await wire(reviewer, finalApproval.request, 403);
      await inspection(reviewer, { variant_id: variantId, document_id: documentId }, 403);
      await assert.rejects(() => readDocumentReview(reviewer.client, variantId, documentId, 1, 1));
      assertDocumentLedger(local.json(documentLedgerQuery(variantId, reviewer.id)));
      results.push("document revoked reviewer refusal preserves exact decision ledger");
    },
    async assertLoggedOut() {
      checkpoint("documents: logged-out HTTP denied; viewer retains exact bytes and readiness");
      await wire(owner, first.request, 403);
      await inspection(owner, { variant_id: variantId, document_id: documentId }, 403);
      await stored();
      assert.deepEqual(await readDocumentReadiness(viewer.client, variantId), finalReadiness);
      assertDocumentLedger(local.json(documentLedgerQuery(variantId, reviewer.id)));
      for (const participant of [owner, reviewer, viewer]) participant.page.off("dialog", dialog);
      results.push("document logout refusal, retained bytes and independent final ledger");
    },
  };
}
