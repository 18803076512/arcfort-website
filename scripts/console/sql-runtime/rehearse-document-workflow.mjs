import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { parseConsoleCommand } from "../../../lib/domain/catalog/commands.ts";
import { parseDocumentReview } from "../../../lib/console/document-review.ts";
import { signDocumentObservation } from "../../../lib/console/document-observation.ts";
import { assertPristineBaseline, pristineBaselineQuery } from "../local-acceptance.ts";
import {
  disposableDocumentObserverInsertSql,
  disposableDocumentObserverDisableSql,
} from "../media-acceptance.ts";
import {
  assertDocumentLedger,
  documentLedgerQuery,
  documentNonInterferenceQueries,
  documentTestCopy,
  documentTestSource,
} from "../document-acceptance.ts";

// Sequential SQL rehearsal only: simulated actors/Storage metadata, not native provider or human evidence.
export async function rehearseDocumentWorkflow(db, catalog, tables) {
  const query = async (sql, values = []) => (await db.query(sql, values)).rows;
  const json = (value) => (value === null ? null : JSON.stringify(value));
  const owner = randomUUID(),
    reviewer = randomUUID(),
    editor = randomUUID();
  const key = { id: randomUUID(), secret: randomBytes(32) };
  let stage = "baseline",
    variant,
    document;
  const before = [];
  const snapshotSql = Object.keys(tables).map(
    (table) =>
      `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) from public.${table} t;`,
  );
  for (const sql of snapshotSql) before.push((await query(sql))[0].coalesce);
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
    let sql, args;
    switch (value.action) {
      case "document_reference":
        sql = "select public.pi_add_document_reference($1,$2,$3::jsonb,$4) as result";
        args = [value.request_id, value.variant_id, json(value.copy), value.prior_document_id];
        break;
      case "document_source":
        sql = "select public.pi_add_document_source($1,$2,$3,$4,$5::jsonb) as result";
        args = [
          value.request_id,
          value.variant_id,
          value.document_id,
          value.dimension,
          json(value.source),
        ];
        break;
      case "document_propose":
        sql = "select public.pi_propose_document_review($1,$2,$3,$4,$5::jsonb,$6) as result";
        args = [
          value.request_id,
          value.variant_id,
          value.document_id,
          value.revision,
          json(value.copy),
          value.reason,
        ];
        break;
      case "document_submit":
        sql = "select public.pi_submit_document_review($1,$2,$3,$4) as result";
        args = [value.request_id, value.candidate_id, value.revision, value.digest];
        break;
      case "document_review":
        sql =
          "select public.pi_review_document($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11::jsonb,$12) as result";
        args = [
          value.request_id,
          value.candidate_id,
          value.revision,
          value.digest,
          value.decision,
          value.reason,
          json(value.confirmation ?? {}),
          value.rights_source_id,
          value.scope_source_id,
          value.resolution,
          json(value.replacement),
          value.observation,
        ];
        break;
      default:
        throw new Error("Unsupported document rehearsal command.");
    }
    return (await query(sql, args))[0].result;
  }
  const target = (value) => ({
    candidate_id: value.candidate_id,
    revision: value.revision,
    digest: value.digest,
  });
  async function denied(operation, code) {
    await db.exec("savepoint document_workflow_denial");
    try {
      await assert.rejects(operation, (error) => error.code === code);
    } finally {
      await db.exec(
        "rollback to savepoint document_workflow_denial; release savepoint document_workflow_denial",
      );
    }
  }
  async function model() {
    const result = (
      await query("select public.pi_read_document_review($1,$2,1,1) as data", [variant, document])
    )[0].data;
    return parseDocumentReview(result, variant, document, 1, 1);
  }
  await db.exec("begin");
  try {
    assertPristineBaseline((await query(pristineBaselineQuery))[0].json_build_object);
    await db.exec(
      disposableDocumentObserverInsertSql({ id: key.id, secretHex: key.secret.toString("hex") }),
    );
    for (const [id, role] of [
      [owner, "owner"],
      [reviewer, "reviewer"],
      [editor, "editor"],
    ]) {
      await query("insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())", [
        id,
        `document-${role}@example.invalid`,
      ]);
      await query("insert into console_user_roles(user_id,role) values($1,$2)", [id, role]);
    }
    await query(
      "select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role','authenticated',true)",
      [owner],
    );
    await query("select private.pi_adopt_15ak_working_scope($1,$2::jsonb,$3,$4)", [
      catalog.sourceRevision,
      json(tables),
      "a".repeat(40),
      "TEST-ONLY document workflow",
    ]);
    await actor(owner);
    variant = (
      await query("select public.pi_create_product_draft($1,$2::jsonb,$3::jsonb) as result", [
        randomUUID(),
        json({
          sku: "AF-MIG-TS-9998",
          slug: "synthetic-browser-m3-item",
          source_reference: "TEST-ONLY document workflow",
        }),
        json({
          name_en: "Synthetic document fixture",
          name_zh: "",
          model: "",
          summary: "",
          description: "",
          applications: "",
        }),
      ])
    )[0].result.variant_id;
    const protectedBefore = [];
    for (const sql of documentNonInterferenceQueries)
      protectedBefore.push((await query(sql))[0].coalesce);
    stage = "reference/upload metadata";
    const reference = {
      action: "document_reference",
      request_id: randomUUID(),
      variant_id: variant,
      prior_document_id: null,
      copy: documentTestCopy,
    };
    const first = await command(reference);
    document = first.document_id;
    assert.deepEqual(await command(reference), first);
    await command({
      ...reference,
      request_id: randomUUID(),
      prior_document_id: document,
      copy: { ...documentTestCopy, title: documentTestCopy.title + " version 2" },
    });
    const manifest = {
      filename: "synthetic-document.pdf",
      mime_type: "application/pdf",
      byte_size: 1024,
      page_count: 1,
      file_hash: "a".repeat(64),
    };
    const intent = (
      await query("select public.pi_begin_document_upload($1,$2,$3::jsonb) as result", [
        randomUUID(),
        document,
        json(manifest),
      ])
    )[0].result;
    // Embedded bootstrap has no Storage HTTP role. Seed metadata as the test owner only.
    stage = "simulated Storage metadata";
    await db.exec("reset role");
    await query(
      "insert into storage.objects(id,bucket_id,name,owner_id,metadata,version) values($1,'pi-technical-evidence',$2,auth.uid()::text,$3::jsonb,'TEST-ONLY')",
      [randomUUID(), intent.storage_path, json({ size: 1024, mimetype: "application/pdf" })],
    );
    await actor(owner);
    stage = "completed upload and qualifying sources";
    await query("select public.pi_complete_document_upload($1,$2)", [
      randomUUID(),
      intent.intent_id,
    ]);
    const source = async (kind) =>
      (
        await command({
          action: "document_source",
          variant_id: variant,
          document_id: document,
          dimension: kind === "rights" ? "usage_rights" : "exact_scope",
          source: documentTestSource(kind),
        })
      ).source_id;
    const rights = await source("rights"),
      scope = await source("scope");
    const propose = (revision) =>
      command({
        action: "document_propose",
        variant_id: variant,
        document_id: document,
        revision,
        copy: { scope_note: documentTestCopy.scope_note, sources: [rights, scope] },
        reason: "TEST-ONLY proposal",
      });
    const submit = (result) => command({ action: "document_submit", ...target(result) });
    const review = (result, decision, extra = {}) => ({
      action: "document_review",
      request_id: randomUUID(),
      ...target(result),
      decision,
      reason: "TEST-ONLY decision",
      resolution: "",
      confirmation: null,
      observation: null,
      rights_source_id: null,
      scope_source_id: null,
      replacement: null,
      ...extra,
    });
    const approve = async (result, resolution = "") => {
      const snapshot = (
        await query("select public.pi_document_review_snapshot($1,$2,$3,$4) as result", [
          result.candidate_id,
          result.revision,
          result.digest,
          key.id,
        ])
      )[0].result;
      return review(result, "APPROVE", {
        rights_source_id: rights,
        scope_source_id: scope,
        resolution,
        confirmation: {
          original_digest: snapshot.original_digest,
          original_inspected: true,
          usage_rights_confirmed: true,
          exact_scope_confirmed: true,
        },
        observation: signDocumentObservation(snapshot, reviewer, key),
      });
    };
    stage = "approved snapshot and exact retry";
    const one = await propose(0);
    await submit(one);
    await actor(editor);
    await denied(() => command(review(one, "REJECT")), "42501");
    await actor(reviewer);
    const approved = await approve(one);
    const receipt = await command(approved);
    assert.deepEqual(await command(approved), receipt);
    assert.equal((await model()).reviewed, true);
    await actor(owner);
    await denied(() => command({ ...approved, request_id: randomUUID() }), "40001");
    stage = "omitted contradiction, edit inheritance and rejection";
    await source("contradiction");
    stage = "current invalidation after omitted contradiction";
    assert.equal((await model()).current.human_valid, false);
    assert.equal((await model()).current.observed, true);
    const two = await propose(1);
    stage = "second submission and edit";
    await submit(two);
    await actor(reviewer);
    await command(
      review(two, "EDIT", {
        replacement: { scope_note: "TEST-ONLY corrected scope", sources: [rights, scope] },
      }),
    );
    const three = (await model()).latest;
    stage = "replacement DTO and rejection";
    assert.equal(three.revision, 3);
    assert.equal(three.verification_status, "DATA_CONFLICT");
    await submit(three);
    await command(review(three, "REJECT"));
    assert.equal((await model()).current.revision, 1);
    await actor(owner);
    const four = await propose(3);
    stage = "stale proposal refusal";
    await denied(() => propose(3), "40001");
    await submit(four);
    await actor(reviewer);
    stage = "missing conflict resolution refusal";
    await denied(async () => command(await approve(four)), "22023");
    const finalApproval = await approve(four, "TEST-ONLY reconciled contradiction");
    stage = "tampered observation refusal";
    await denied(
      () =>
        command({
          ...finalApproval,
          observation: finalApproval.observation.slice(0, -64) + "0".repeat(64),
        }),
      "23514",
    );
    await actor(owner);
    stage = "copied actor refusal";
    await denied(() => command(finalApproval), "23514");
    await actor(reviewer);
    stage = "corrected approval and fifth proposal";
    await command(finalApproval);
    assert.equal((await model()).reviewed, true);
    await actor(owner);
    await submit(await propose(4));
    stage = "exact native ledger and independent readiness";
    const readiness = (
      await query("select * from pi_document_readiness where product_variant_id=$1", [variant])
    )[0];
    assert.deepEqual(readiness, {
      product_variant_id: variant,
      document_count: 2,
      reviewed_document_count: 0,
      unresolved_document_count: 2,
      unavailable_original_count: 1,
      open_document_review_count: 1,
      invalid_document_approval_count: 0,
      document_conflict_count: 1,
    });
    await db.exec("reset role");
    assertDocumentLedger(
      (await query(documentLedgerQuery(variant, reviewer)))[0].jsonb_build_object,
    );
    await query("update console_user_roles set revoked_at=clock_timestamp() where user_id=$1", [
      reviewer,
    ]);
    await actor(reviewer);
    await denied(() => command(finalApproval), "42501");
    await db.exec("reset role");
    await db.exec(disposableDocumentObserverDisableSql(key.id));
    await actor(owner);
    assert.equal((await model()).current.human_valid, true);
    assert.equal((await model()).current.observed, true);
    assert.equal((await model()).open, true);
    const protectedAfter = [];
    for (const sql of documentNonInterferenceQueries)
      protectedAfter.push((await query(sql))[0].coalesce);
    assert.deepEqual(protectedAfter, protectedBefore);
  } catch (error) {
    const code =
      typeof error?.code === "string" && /^[A-Z0-9_]{5,30}$/.test(error.code)
        ? error.code
        : "unknown";
    throw new Error(
      `Document workflow rehearsal failed at ${stage} (${code}); private output suppressed.`,
    );
  } finally {
    key.secret.fill(0);
    await db.exec("rollback");
    await db.exec("reset role");
  }
  assertPristineBaseline((await query(pristineBaselineQuery))[0].json_build_object);
  const after = [];
  for (const sql of snapshotSql) after.push((await query(sql))[0].coalesce);
  assert.deepEqual(after, before);
  console.log(
    "Embedded document workflow PASS: all command types, five revisions, signed synthetic decisions, current/open readiness, exact native-ledger query, refusals/revocation, noninterference and 17-table rollback. Native Auth/HTTP/Storage bytes/browser/races NOT_RUN.",
  );
}
