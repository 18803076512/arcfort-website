import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { parseConsoleCommand } from "../../../lib/domain/catalog/commands.ts";
import { assertPristineBaseline, pristineBaselineQuery } from "../local-acceptance.ts";
import {
  assertPackagingLedger,
  packagingLedgerQuery,
  packagingNonInterferenceQueries,
  packagingTestCopies,
  packagingTestSource,
} from "../packaging-acceptance.ts";

const json = (value) => (value === null ? null : JSON.stringify(value));

// Actual parser/public wrappers and SQL guards, but simulated actors and sequential operations.
// This rollback rehearsal does not prove native Auth, HTTP, browser forms or lock contention.
export async function rehearsePackagingWorkflow(db, catalog, tables) {
  let stage = "pristine baseline";
  const query = async (sql, parameters = []) => (await db.query(sql, parameters)).rows;
  const owner = randomUUID(),
    reviewer = randomUUID(),
    editor = randomUUID(),
    viewer = randomUUID();
  const before = new Map();
  const snapshot = async (table) =>
    (
      await query(
        `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from public.${table} t`,
      )
    )[0].rows;
  for (const table of Object.keys(tables)) before.set(table, await snapshot(table));
  async function actor(id) {
    await db.exec("reset role");
    await query(
      "select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role','authenticated',true)",
      [id],
    );
    await db.exec("set local role authenticated");
  }
  async function command(input) {
    const value = parseConsoleCommand({ request_id: randomUUID(), ...input });
    let sql, params;
    switch (value.action) {
      case "packaging_source":
        sql = "select public.pi_add_packaging_source($1,$2,$3::jsonb,$4::jsonb,$5) as result";
        params = [
          value.request_id,
          value.variant_id,
          json(value.copy),
          json(value.source),
          value.original_id,
        ];
        break;
      case "packaging_propose":
        sql =
          "select public.pi_propose_packaging_revision($1,$2,$3,$4,$5::jsonb,$6::uuid[],$7,$8,$9) as result";
        params = [
          value.request_id,
          value.variant_id,
          value.slot,
          value.revision,
          json(value.copy),
          `{${value.sources.join(",")}}`,
          value.reason,
          value.head_id,
          value.original_id,
        ];
        break;
      case "packaging_submit":
        sql = "select public.pi_submit_packaging_revision($1,$2,$3,$4) as result";
        params = [value.request_id, value.revision_id, value.revision, value.digest];
        break;
      case "packaging_review":
        sql =
          "select public.pi_review_packaging_revision($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11::jsonb) as result";
        params = [
          value.request_id,
          value.revision_id,
          value.revision,
          value.digest,
          value.decision,
          value.reason,
          value.status,
          json(value.confirmation ?? {}),
          value.source_id,
          value.resolution,
          json(value.replacement),
        ];
        break;
      default:
        throw new Error("Unsupported packaging rehearsal command.");
    }
    return (await query(sql, params))[0].result;
  }
  async function denied(operation, code) {
    await db.exec("savepoint packaging_denial");
    try {
      await assert.rejects(operation, (error) => error.code === code);
    } finally {
      await db.exec("rollback to savepoint packaging_denial; release savepoint packaging_denial");
    }
  }
  const refTarget = (result) => ({
    revision_id: result.revision_id,
    revision: result.revision,
    digest: result.digest,
  });
  const approval = (result, source_id, status = "OEM_REFERENCE") => ({
    action: "packaging_review",
    request_id: randomUUID(),
    ...refTarget(result),
    decision: "APPROVE",
    reason: "TEST-ONLY synthetic declaration",
    status,
    source_id,
    resolution: "",
    replacement: null,
    confirmation: {
      source_checked: true,
      packaging_checked: true,
      commercial_terms_unchanged: true,
      arcfort_packaging_confirmed: status === "CONFIRMED",
    },
  });
  await db.exec("begin");
  try {
    assertPristineBaseline((await query(pristineBaselineQuery))[0].json_build_object);
    for (const [id, role] of [
      [owner, "owner"],
      [reviewer, "reviewer"],
      [editor, "editor"],
      [viewer, "viewer"],
    ]) {
      await query("insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())", [
        id,
        `packaging-${role}@example.invalid`,
      ]);
      await query("insert into console_user_roles(user_id,role) values($1,$2)", [id, role]);
    }
    stage = "exact adoption and synthetic drafts";
    await query(
      "select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role','authenticated',true)",
      [owner],
    );
    await query("select private.pi_adopt_15ak_working_scope($1,$2::jsonb,$3,$4)", [
      catalog.sourceRevision,
      json(tables),
      "a".repeat(40),
      "TEST-ONLY packaging rehearsal",
    ]);
    await actor(owner);
    async function draft(sku, slug) {
      return (
        await query("select public.pi_create_product_draft($1,$2::jsonb,$3::jsonb) as result", [
          randomUUID(),
          json({ sku, slug, source_reference: "TEST-ONLY packaging rehearsal" }),
          json({
            name_en: "Synthetic packaging fixture",
            name_zh: "",
            model: "",
            summary: "",
            description: "",
            applications: "",
          }),
        ])
      )[0].result.variant_id;
    }
    const variant = await draft("AF-MIG-TS-9998", "synthetic-browser-m3-item");
    const foreign = await draft("AF-MIG-TS-9996", "synthetic-isolated-m3-item");
    const protectedBefore = [];
    for (const sql of packagingNonInterferenceQueries)
      protectedBefore.push((await query(sql))[0].coalesce);
    const source = async (kind, copy) =>
      (
        await command({
          action: "packaging_source",
          variant_id: variant,
          original_id: null,
          copy,
          source: packagingTestSource(kind, copy),
        })
      ).source_id;
    stage = "exact source bindings and reference-only proposal";
    const { unknown, known, corrected } = packagingTestCopies;
    const referenceId = await source("reference", unknown),
      unknownFactoryId = await source("factory", unknown),
      knownFactoryId = await source("factory", known),
      factoryId = await source("factory", corrected);
    const proposal = {
      action: "packaging_propose",
      variant_id: variant,
      slot: 0,
      revision: 0,
      head_id: null,
      original_id: null,
      copy: unknown,
      sources: [referenceId, unknownFactoryId],
      reason: "TEST-ONLY isolated packaging proposal",
    };
    await denied(() => command({ ...proposal, variant_id: foreign }), "22023");
    await denied(
      () =>
        command({
          ...proposal,
          slot: 1,
          copy: { ...unknown, quantity: 999, quantity_unit: "pieces" },
        }),
      "22023",
    );
    const first = await command(proposal);
    const submit = (result) => command({ action: "packaging_submit", ...refTarget(result) });
    await submit(first);
    const originalApproval = approval(first, referenceId);
    await actor(viewer);
    await denied(() => command(originalApproval), "42501");
    await actor(editor);
    await denied(() => command(originalApproval), "42501");
    await actor(reviewer);
    await denied(
      () =>
        command({
          ...originalApproval,
          status: "CONFIRMED",
          confirmation: { ...originalApproval.confirmation, arcfort_packaging_confirmed: true },
        }),
      "23514",
    );
    await denied(() => command({ ...originalApproval, source_id: unknownFactoryId }), "23514");
    await denied(() => command(approval(first, unknownFactoryId, "CONFIRMED")), "23514");
    await denied(() => command({ ...originalApproval, digest: "0".repeat(64) }), "40001");
    const approved = await command(originalApproval);
    assert.deepEqual(await command(originalApproval), approved);
    const valid = async (id) =>
      (await query("select public.pi_packaging_approval_valid($1) as valid", [id]))[0].valid;
    assert.equal(await valid(first.revision_id), true);

    stage = "unselected late contradiction and stale pending review";
    await actor(owner);
    const second = await command({
      ...proposal,
      head_id: first.head_id,
      revision: 1,
      copy: known,
      sources: [knownFactoryId],
    });
    await submit(second);
    const contradictionId = await source("contradiction", unknown);
    assert.equal(await valid(first.revision_id), false);
    await actor(reviewer);
    await denied(() => command(approval(second, knownFactoryId, "CONFIRMED")), "23514");
    const third = await command({
      action: "packaging_review",
      ...refTarget(second),
      decision: "EDIT",
      reason: "TEST-ONLY retains omitted conflict",
      status: null,
      source_id: null,
      confirmation: null,
      resolution: "",
      replacement: { copy: corrected, sources: [factoryId] },
    });
    assert.equal(third.revision, 3);
    assert.equal(
      (
        await query("select verification_status from packaging_revisions where id=$1", [
          third.revision_id,
        ])
      )[0].verification_status,
      "DATA_CONFLICT",
    );
    await submit(third);
    await command({
      action: "packaging_review",
      ...refTarget(third),
      decision: "REJECT",
      reason: "TEST-ONLY explicit rejection",
      status: null,
      source_id: null,
      confirmation: null,
      resolution: "",
      replacement: null,
    });
    assert.equal(
      (await query("select revision_id from packaging_revision_currents"))[0].revision_id,
      first.revision_id,
    );

    stage = "explicit confirmation, resolution and sequential loser control";
    await actor(owner);
    const correction = { ...proposal, copy: corrected, sources: [factoryId] };
    const fourth = await command({ ...correction, head_id: first.head_id, revision: 3 });
    await submit(fourth);
    await actor(reviewer);
    const confirmation = approval(fourth, factoryId, "CONFIRMED");
    await denied(() => command(confirmation), "23514");
    await denied(
      () =>
        command({
          ...confirmation,
          source_id: contradictionId,
          resolution: "TEST-ONLY resolution",
        }),
      "23514",
    );
    const resolution = "TEST-ONLY contradiction reconciled for acceptance, not real SKU evidence";
    const confirmed = { ...confirmation, resolution };
    await command(confirmed);
    await denied(() => command({ ...confirmed, request_id: randomUUID() }), "40001");
    assert.equal(await valid(fourth.revision_id), true);
    await actor(owner);
    const fifth = await command({ ...correction, head_id: first.head_id, revision: 4 });
    await submit(fifth);
    // Independent ledger queries are privileged evidence, never application grants.
    await db.exec("reset role");
    assertPackagingLedger(
      (await query(packagingLedgerQuery(variant, reviewer)))[0].jsonb_build_object,
    );
    stage = "revoked role, receipt denial and unchanged original authority";
    await db.exec("reset role");
    await query("update console_user_roles set revoked_at=now() where user_id=$1", [reviewer]);
    await actor(reviewer);
    await denied(() => command(originalApproval), "42501");
    await denied(
      () => command({ ...confirmed, ...refTarget(fifth), request_id: randomUUID() }),
      "42501",
    );
    assert.equal((await query("select count(*)::int as n from packaging_revisions"))[0].n, 0);
    await actor(owner);
    assert.equal(await valid(fourth.revision_id), true);
    await db.exec("reset role");
    assertPackagingLedger(
      (await query(packagingLedgerQuery(variant, reviewer)))[0].jsonb_build_object,
    );
    const protectedAfter = [];
    for (const sql of packagingNonInterferenceQueries)
      protectedAfter.push((await query(sql))[0].coalesce);
    assert.deepEqual(protectedAfter, protectedBefore);
  } catch (error) {
    const code =
      typeof error?.code === "string" && /^[A-Z0-9]{5}$/.test(error.code)
        ? error.code
        : "assertion";
    throw new Error(
      `Embedded packaging workflow failed at ${stage} (${code}); private fixture output suppressed.`,
    );
  } finally {
    await db.exec("rollback; reset role");
  }
  assertPristineBaseline((await query(pristineBaselineQuery))[0].json_build_object);
  for (const [table, rows] of before)
    assert.deepEqual(await snapshot(table), rows, `${table} exact packaging rollback parity`);
  console.log(
    "Embedded packaging workflow PASS: actual parser/public wrappers, five revisions, exact decisions/retention, refusal/revocation, zero publication and 17-table rollback parity. Sequential simulated actors only; native Auth/forms/races NOT_RUN.",
  );
}
