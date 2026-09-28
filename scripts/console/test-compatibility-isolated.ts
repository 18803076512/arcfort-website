import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { executeConsoleCommand } from "../../lib/console/commands.ts";
import {
  compatibilityFilters,
  readCompatibilityHistory,
  readCompatibilityTargets,
  readCompatibilityWorkbench,
} from "../../lib/console/compatibility.ts";
import type {
  CommandInput,
  CommandResult,
  ConsoleCommand,
} from "../../lib/domain/catalog/commands.ts";
import type { CompatibilitySourceCopy } from "../../lib/domain/catalog/compatibility.ts";
import { consoleCompatibilityEnabled } from "../../lib/console/working-config.ts";
import { sqlLiteral, type openLocalAcceptance } from "./local-acceptance.ts";

type Session = { id: string; client: ConsoleClient };
type Input = {
  local: ReturnType<typeof openLocalAcceptance>;
  variantId: string;
  owner: Session;
  editor: Session;
  reviewer: Session;
  viewer: Session;
  checkpoint: (label: string) => void;
};
function success(result: CommandResult) {
  assert.equal(result.ok, true, "Expected compatibility command success.");
  if (!result.ok) throw new Error("Compatibility command failed.");
  return result.result;
}
function failure(result: CommandResult, code: string) {
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Expected compatibility denial.");
  assert.equal(result.code, code);
}
function reviewTarget(result: ReturnType<typeof success>) {
  assert.ok(result.relationship_id && result.digest && typeof result.revision === "number");
  return {
    relationship_id: result.relationship_id,
    revision: result.revision,
    digest: result.digest,
  };
}
const request = (input: CommandInput): ConsoleCommand => ({ ...input, request_id: randomUUID() });

// Only called by the pristine, exact-target runner after adoption. Never invoke on retained data.
export async function runCompatibilityAcceptance(input: Input) {
  const { local, owner, editor, reviewer, viewer, variantId: id } = input;
  assert.equal(process.env.CI, "true");
  assert.equal(consoleCompatibilityEnabled(), true);
  const record = await owner.client
    .from("product_variants")
    .select("sku,public_slug,is_shadow,lifecycle_state")
    .eq("id", id)
    .single();
  assert.equal(record.error, null);
  assert.equal(record.data?.sku, "AF-MIG-TS-9996");
  assert.equal(record.data?.public_slug, "synthetic-isolated-m3-item");
  assert.equal(record.data?.is_shadow, false);
  assert.equal(record.data?.lifecycle_state, "DRAFT");
  const run = (client: ConsoleClient, command: CommandInput) =>
    executeConsoleCommand(client, request(command));

  input.checkpoint("compatibility identity persistence and current-role boundary");
  const entityCommand = request({ action: "compatibility_entity", variant_id: id });
  const entity = success(await executeConsoleCommand(editor.client, entityCommand));
  assert.ok(entity.entity_id);
  assert.equal(entity.product_variant_id, id);
  assert.deepEqual(success(await executeConsoleCommand(editor.client, entityCommand)), entity);
  assert.equal(
    success(await run(owner.client, { action: "compatibility_entity", variant_id: id })).entity_id,
    entity.entity_id,
  );
  for (const client of [reviewer.client, viewer.client])
    failure(await executeConsoleCommand(client, entityCommand), "42501");
  assert.equal(
    (
      await viewer.client.rpc("pi_ensure_product_compatibility_entity", {
        request_uuid: randomUUID(),
        variant_uuid: id,
      })
    ).error?.code,
    "42501",
  );
  const initial = await readCompatibilityWorkbench(viewer.client, id);
  assert.equal(initial?.subjectId, entity.entity_id);
  assert.equal(initial?.scopes.length, 0);
  assert.equal(initial?.canEdit, false);

  input.checkpoint("real target lookup and exact-bound source persistence");
  const targets = await readCompatibilityTargets(
    viewer.client,
    compatibilityFilters({ kind: "series" }),
  );
  assert.ok(targets.items.length);
  const target = targets.items[0];
  const destination = {
    subject_id: entity.entity_id,
    target_id: target.id,
    relationship_type: "product_to_series" as const,
    scope: "Synthetic isolated assembly",
  };
  const copy = {
    role: "Synthetic test component",
    confirmation_requirements: ["Synthetic source only, never a real fitment claim"],
  };
  const source: CompatibilitySourceCopy = {
    source_kind: "company_record",
    source_level: "A",
    title: "Synthetic isolated assembly drawing",
    source_reference: "QA-ONLY-ASSEMBLY",
    evidence_basis: "drawing",
    evidence_date: "2026-01-01",
    owner_name: "Synthetic fixture custodian",
    revision_label: "QA-1",
    source_location: "Synthetic callout 1",
    assertion: "supports",
  };
  const sourceCommand = request({
    action: "compatibility_source",
    ...destination,
    role: copy.role,
    source,
  });
  const evidence = success(await executeConsoleCommand(editor.client, sourceCommand));
  failure(await executeConsoleCommand(viewer.client, sourceCommand), "42501");
  assert.ok(evidence.source_id);
  assert.deepEqual(success(await executeConsoleCommand(editor.client, sourceCommand)), evidence);
  const contradiction = success(
    await run(reviewer.client, {
      action: "compatibility_source",
      ...destination,
      role: copy.role,
      source: {
        ...source,
        assertion: "contradicts",
        revision_label: "QA-CONFLICT",
        title: "Synthetic conflicting drawing",
      },
    }),
  );
  assert.ok(contradiction.source_id);
  const loaded = await readCompatibilityWorkbench(owner.client, id);
  assert.equal(loaded?.sources.length, 2);
  assert.equal(
    loaded?.sources.find((item) => item.id === evidence.source_id)?.location,
    source.source_location,
  );
  assert.doesNotMatch(
    JSON.stringify(loaded),
    /Synthetic fixture custodian|raw_snapshot|source_digest|endpoint_digest/,
  );
  assert.equal(
    (
      await editor.client
        .from("compatibility_source_bindings")
        .update({ scope_label: "Tampered" })
        .eq("evidence_source_id", evidence.source_id)
    ).error?.code,
    "42501",
  );

  input.checkpoint("source-free approval denied without partial review or confirmation");
  const incomplete = success(
    await run(editor.client, {
      action: "compatibility_propose",
      ...destination,
      scope: "Synthetic missing-evidence assembly",
      root_id: null,
      revision: 0,
      copy,
      evidence: [],
      reason: "Synthetic missing-evidence test",
    }),
  );
  const missing = success(
    await run(editor.client, { action: "compatibility_submit", ...reviewTarget(incomplete) }),
  );
  const emptyReview = request({
    action: "compatibility_review",
    ...reviewTarget(missing),
    decision: "APPROVE",
    reason: "Synthetic refusal probe",
    resolution: "",
    replacement: null,
    evidence: null,
  });
  for (const client of [editor.client, viewer.client])
    failure(await executeConsoleCommand(client, emptyReview), "42501");
  failure(
    await run(viewer.client, { action: "compatibility_submit", ...reviewTarget(incomplete) }),
    "42501",
  );
  const beforeEvents = local.sql("select count(*) from verification_events;");
  failure(await executeConsoleCommand(reviewer.client, emptyReview), "23514");
  assert.equal(local.sql("select count(*) from verification_events;"), beforeEvents);
  success(
    await executeConsoleCommand(reviewer.client, {
      ...emptyReview,
      request_id: randomUUID(),
      decision: "REJECT",
    }),
  );

  input.checkpoint("compatibility proposal rollback and observed concurrent stale-save exclusion");
  const links = [
    { source_id: evidence.source_id, role: "supporting" as const },
    { source_id: contradiction.source_id, role: "conflicting" as const },
  ];
  const base = {
    action: "compatibility_propose" as const,
    ...destination,
    root_id: null as string | null,
    revision: 0,
    copy,
    evidence: links,
    reason: "Synthetic exact-bound proposal",
  };
  const before = local.sql("select count(*) from compatibility_relationships;");
  for (const client of [reviewer.client, viewer.client]) failure(await run(client, base), "42501");
  const invalid = await run(editor.client, {
    ...base,
    evidence: [{ source_id: randomUUID(), role: "supporting" }],
  });
  failure(invalid, "22023");
  assert.equal(local.sql("select count(*) from compatibility_relationships;"), before);
  const editable = { ...base, evidence: links.slice(0, 1) };
  const first = success(await run(editor.client, editable));
  assert.ok(first.root_relationship_id && typeof first.revision === "number");
  const rootId = first.root_relationship_id;
  const changes = await local.withAuthorityLock(
    () =>
      Promise.all([
        run(owner.client, {
          ...editable,
          root_id: rootId,
          revision: first.revision!,
          reason: "Synthetic concurrent owner",
        }),
        run(editor.client, {
          ...editable,
          root_id: rootId,
          revision: first.revision!,
          reason: "Synthetic concurrent editor",
        }),
      ]),
    2,
  );
  assert.equal(changes.filter((item) => item.ok).length, 1);
  failure(changes.find((item) => !item.ok)!, "40001");
  const saved = success(changes.find((item) => item.ok)!);
  const conflicting = success(
    await run(editor.client, { ...base, root_id: rootId, revision: saved.revision! }),
  );
  const pending = success(
    await run(editor.client, { action: "compatibility_submit", ...reviewTarget(conflicting) }),
  );
  const scope = (await readCompatibilityWorkbench(viewer.client, id))?.scopes.find(
    (item) => item.id === rootId,
  );
  assert.equal(scope?.original, null);
  assert.equal(scope?.current, null);
  assert.equal(scope?.candidate?.state, "pending");
  assert.equal(scope?.candidate?.status, "DATA_CONFLICT");
  failure(
    await run(editor.client, { ...base, root_id: rootId, revision: pending.revision! }),
    "55000",
  );

  input.checkpoint("human compatibility EDIT preserves conflict and exact source binding");
  const edited = success(
    await run(reviewer.client, {
      action: "compatibility_review",
      ...reviewTarget(pending),
      decision: "EDIT",
      reason: "Synthetic revised requirement, unresolved conflict retained",
      resolution: "",
      replacement: copy,
      evidence: [{ source_id: evidence.source_id, role: "supporting" }],
    }),
  );
  assert.equal(
    (await readCompatibilityWorkbench(viewer.client, id))?.scopes.find((item) => item.id === rootId)
      ?.candidate?.status,
    "DATA_CONFLICT",
  );
  const editedPending = success(
    await run(reviewer.client, { action: "compatibility_submit", ...reviewTarget(edited) }),
  );
  const review = request({
    action: "compatibility_review",
    ...reviewTarget(editedPending),
    decision: "APPROVE",
    reason: "Synthetic exact evidence examined",
    resolution: "",
    replacement: null,
    evidence: null,
  });
  failure(await executeConsoleCommand(reviewer.client, review), "22023");
  const approval = {
    ...review,
    request_id: randomUUID(),
    resolution: "Synthetic resolution for a disposable SKU only",
  };
  input.checkpoint("observed duplicate approvals are idempotent and attributed once");
  const approvals = await local.withAuthorityLock(
    () =>
      Promise.all([
        executeConsoleCommand(reviewer.client, approval),
        executeConsoleCommand(reviewer.client, approval),
      ]),
    2,
  );
  const approved = success(approvals[0]);
  assert.deepEqual(success(approvals[1]), approved);
  const row = await owner.client
    .from("compatibility_relationships")
    .select("verification_status,confirmed_by,confirmed_at")
    .eq("id", approved.relationship_id!)
    .single();
  assert.equal(row.error, null);
  assert.equal(row.data?.verification_status, "CONFIRMED");
  assert.equal(row.data?.confirmed_by, reviewer.id);
  assert.ok(row.data?.confirmed_at);
  assert.equal(
    local.sql(
      `select count(*) from verification_events where id=${sqlLiteral(approved.event_id!)};`,
    ),
    "1",
  );
  assert.equal(
    local.sql(
      `select count(*) from verification_events where entity_type='compatibility_relationship' and entity_id=${sqlLiteral(approved.relationship_id!)} and decision='APPROVE';`,
    ),
    "1",
  );
  failure(
    await executeConsoleCommand(reviewer.client, { ...approval, request_id: randomUUID() }),
    "40001",
  );

  input.checkpoint(
    "catalog-only follow-up cannot approve; rejection retains current and immutable history",
  );
  const catalogSource = success(
    await run(editor.client, {
      action: "compatibility_source",
      ...destination,
      role: copy.role,
      source: {
        ...source,
        assertion: "catalog_grouping",
        evidence_basis: "company_catalog",
        revision_label: "QA-CATALOG",
      },
    }),
  );
  const replacement = success(
    await run(editor.client, {
      ...base,
      root_id: rootId,
      revision: approved.revision!,
      evidence: [{ source_id: catalogSource.source_id!, role: "supporting" }],
    }),
  );
  const submitted = success(
    await run(editor.client, { action: "compatibility_submit", ...reviewTarget(replacement) }),
  );
  const catalogDecision = request({
    action: "compatibility_review",
    ...reviewTarget(submitted),
    decision: "APPROVE",
    reason: "Synthetic catalog-only refusal",
    resolution: "",
    replacement: null,
    evidence: null,
  });
  failure(await executeConsoleCommand(reviewer.client, catalogDecision), "23514");
  success(
    await executeConsoleCommand(reviewer.client, {
      ...catalogDecision,
      request_id: randomUUID(),
      decision: "REJECT",
    }),
  );
  const current = (await readCompatibilityWorkbench(viewer.client, id))?.scopes.find(
    (item) => item.id === rootId,
  );
  assert.equal(current?.current?.id, approved.relationship_id);
  assert.equal(current?.candidate, null);
  const history = await readCompatibilityHistory(viewer.client, id, rootId, 1);
  assert.deepEqual(
    history.items
      .map((item) => item.decision)
      .filter(Boolean)
      .sort(),
    ["APPROVE", "EDIT", "REJECT"],
  );
  assert.equal((await readCompatibilityHistory(viewer.client, randomUUID(), rootId, 1)).total, 0);
  assert.equal(
    (await owner.client.from("product_variants").select("lifecycle_state").eq("id", id).single())
      .data?.lifecycle_state,
    "DRAFT",
  );
  assert.equal(local.sql("select count(*) from publish_records;"), "0");

  return {
    targetId: target.id,
    async assertRevoked() {
      failure(await executeConsoleCommand(reviewer.client, approval), "42501");
      assert.equal(
        (
          await reviewer.client.rpc("pi_submit_compatibility_review", {
            request_uuid: randomUUID(),
            relationship_uuid: approved.relationship_id!,
            expected_revision: approved.revision!,
            expected_digest: "a".repeat(64),
          })
        ).error?.code,
        "42501",
      );
      await assert.rejects(readCompatibilityWorkbench(reviewer.client, id));
    },
  };
}
