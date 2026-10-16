import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import sharp from "sharp";
import { parseConsoleCommand } from "../../../lib/domain/catalog/commands.ts";
import { signMediaObservation } from "../../../lib/console/media-observation.ts";
import { assertPristineBaseline, pristineBaselineQuery } from "../local-acceptance.ts";
import { disposableObserverInsertSql, disposableObserverDisableSql } from "../media-acceptance.ts";

const json = (value) => (value === null ? null : JSON.stringify(value));

// Actual domain parsing, signer and SQL wrappers; simulated JWT actors and Storage metadata.
// No provider, HTTP, original inspector, Storage service or concurrency is exercised here.
export async function rehearseMediaWorkflow(db, catalog, tables) {
  let stage = "pristine baseline";
  const observer = { id: "", secretHex: "" };
  const owner = randomUUID();
  const reviewer = randomUUID();
  const viewer = randomUUID();
  const statements = [];
  const query = async (sql, parameters = []) => {
    const result = await db.query(sql, parameters);
    return result.rows;
  };
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
    statements.push(value.action);
    let sql;
    let parameters;
    switch (value.action) {
      case "media_source":
        sql = "select public.pi_add_media_source($1,$2,$3,$4,$5,$6::jsonb) as result";
        parameters = [
          value.request_id,
          value.variant_id,
          value.asset_id,
          value.role,
          value.dimension,
          json(value.source),
        ];
        break;
      case "media_propose":
        sql =
          "select public.pi_propose_media_mapping($1,$2,$3,$4,$5,$6,$7::jsonb,$8::uuid[],$9,$10) as result";
        parameters = [
          value.request_id,
          value.variant_id,
          value.asset_id,
          value.role,
          value.slot,
          value.revision,
          json(value.copy),
          `{${value.sources.join(",")}}`,
          value.reason,
          value.head_id,
        ];
        break;
      case "media_submit":
        sql = "select public.pi_submit_media_mapping($1,$2,$3,$4) as result";
        parameters = [value.request_id, value.mapping_id, value.revision, value.digest];
        break;
      case "media_review":
        sql =
          "select public.pi_review_media_mapping($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11::jsonb,$12) as result";
        parameters = [
          value.request_id,
          value.mapping_id,
          value.revision,
          value.digest,
          value.decision,
          value.reason,
          json(value.confirmation ?? {}),
          value.rights_source_id,
          value.match_source_id,
          value.resolution,
          json(value.replacement),
          value.observation,
        ];
        break;
      default:
        throw new Error("Unsupported rehearsal command.");
    }
    return (await query(sql, parameters))[0].result;
  }
  async function denied(operation, code) {
    await db.exec("savepoint rehearsal_denial");
    try {
      await assert.rejects(operation, (error) => error.code === code);
    } finally {
      await db.exec("rollback to savepoint rehearsal_denial; release savepoint rehearsal_denial");
    }
  }
  const sourceRows = new Map();
  const sourceSnapshot = async (table) =>
    (
      await query(
        `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from public.${table} t`,
      )
    )[0].rows;
  for (const table of Object.keys(tables)) sourceRows.set(table, await sourceSnapshot(table));
  await db.exec("begin");
  try {
    assertPristineBaseline((await query(pristineBaselineQuery))[0].json_build_object);
    stage = "ephemeral observer insert SQL";
    const secret = randomBytes(32);
    observer.id = randomUUID();
    observer.secretHex = secret.toString("hex");
    secret.fill(0);
    await db.exec("set local log_statement='none'; set local log_min_error_statement='panic'");
    await db.exec(disposableObserverInsertSql(observer));
    const key = (
      await query(
        "select octet_length(secret) as bytes,enabled,valid_until>clock_timestamp()+interval '5 minutes' as usable from private.pi_media_observation_keys where id=$1",
        [observer.id],
      )
    )[0];
    assert.deepEqual(key, { bytes: 32, enabled: true, usable: true });
    for (const [id, role] of [
      [owner, "owner"],
      [reviewer, "reviewer"],
      [viewer, "viewer"],
    ]) {
      await query("insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())", [
        id,
        `rehearsal-${role}@example.invalid`,
      ]);
      await query("insert into console_user_roles(user_id,role) values($1,$2)", [id, role]);
    }
    await query(
      "select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role','authenticated',true)",
      [owner],
    );
    stage = "exact source adoption and synthetic draft";
    await query("select private.pi_adopt_15ak_working_scope($1,$2::jsonb,$3,$4)", [
      catalog.sourceRevision,
      json(tables),
      "a".repeat(40),
      "Synthetic media rehearsal; no real approval",
    ]);
    await actor(owner);
    const created = (
      await query("select public.pi_create_product_draft($1,$2::jsonb,$3::jsonb) as result", [
        randomUUID(),
        json({
          sku: "AF-MIG-TS-9998",
          slug: "synthetic-browser-m3-item",
          source_reference: "TEST-ONLY rehearsal",
        }),
        json({
          name_en: "Synthetic media rehearsal",
          name_zh: "",
          model: "",
          summary: "",
          description: "Synthetic disposable raster, never a real product",
          applications: "",
        }),
      ])
    )[0].result;
    const variantId = created.variant_id;
    const bytes = await sharp({
      create: { width: 32, height: 24, channels: 3, background: "#168565" },
    })
      .png()
      .toBuffer();
    stage = "synthetic original metadata completion";
    const original = (
      await query("select public.pi_begin_media_upload($1,$2,$3::jsonb) as result", [
        randomUUID(),
        variantId,
        json({
          filename: "synthetic-owner-original.png",
          byte_size: bytes.length,
          mime_type: "image/png",
          file_hash: createHash("sha256").update(bytes).digest("hex"),
          width: 32,
          height: 24,
          source_kind: "other_reference",
          source_owner: "Synthetic custodian",
          source_reference: "TEST-ONLY raster",
        }),
      ])
    )[0].result;
    await db.exec("reset role");
    await query(
      "insert into storage.objects(id,bucket_id,name,owner_id,metadata,version) values($1,'pi-product-originals',$2,$3,$4::jsonb,'synthetic-rehearsal')",
      [
        randomUUID(),
        original.storage_path,
        owner,
        json({ size: bytes.length, mimetype: "image/png" }),
      ],
    );
    await actor(owner);
    await query("select public.pi_complete_media_upload($1,$2)", [
      randomUUID(),
      original.intent_id,
    ]);
    const beforeAsset = (
      await query("select to_jsonb(a) as row from media_assets a where id=$1", [original.asset_id])
    )[0].row;
    const source = async (dimension, contradicts = false) =>
      command({
        action: "media_source",
        variant_id: variantId,
        asset_id: original.asset_id,
        role: "main",
        dimension,
        source: {
          source_kind: "company_record",
          source_level: "A",
          title: `Synthetic ${dimension}`,
          source_reference: "TEST-ONLY generated raster",
          evidence_basis: dimension === "usage_rights" ? "company_ownership" : "inspection_record",
          evidence_date: new Date().toISOString().slice(0, 10),
          owner_name: "Synthetic custodian",
          revision_label: "QA-1",
          source_location: "Synthetic test only",
          assertion: contradicts ? "contradicts" : "supports",
        },
      });
    stage = "two sources and revision 1 approval";
    const rights = (await source("usage_rights")).source_id;
    stage = "exact-product source";
    const match = (await source("product_match")).source_id;
    const sources = [rights, match];
    const proposal = async (previous = null) =>
      command({
        action: "media_propose",
        variant_id: variantId,
        asset_id: original.asset_id,
        role: "main",
        slot: 0,
        head_id: previous?.head_id ?? null,
        revision: previous?.revision ?? 0,
        copy: { alt_text: "Synthetic private raster, never real SKU evidence" },
        sources,
        reason: "Synthetic mapping only",
      });
    const submit = async (candidate) =>
      command({
        action: "media_submit",
        mapping_id: candidate.mapping_id,
        revision: candidate.revision,
        digest: candidate.digest,
      });
    const snapshot = async (candidate) =>
      (
        await query("select public.pi_media_review_snapshot($1,$2,$3,$4) as result", [
          candidate.mapping_id,
          candidate.revision,
          candidate.digest,
          observer.id,
        ])
      )[0].result;
    const approval = async (candidate, resolution = "") => {
      const value = await snapshot(candidate);
      const secret = Buffer.from(observer.secretHex, "hex");
      try {
        return {
          action: "media_review",
          request_id: randomUUID(),
          mapping_id: candidate.mapping_id,
          revision: candidate.revision,
          digest: candidate.digest,
          decision: "APPROVE",
          reason: "Synthetic approval only",
          resolution,
          confirmation: {
            original_digest: value.original_digest,
            original_inspected: true,
            usage_rights_confirmed: true,
            exact_product_confirmed: true,
          },
          rights_source_id: rights,
          match_source_id: match,
          observation: signMediaObservation(value, reviewer, { id: observer.id, secret }),
          replacement: null,
        };
      } finally {
        secret.fill(0);
      }
    };
    stage = "revision 1 proposal";
    const first = await proposal();
    stage = "revision 1 submission";
    await submit(first);
    await actor(reviewer);
    stage = "revision 1 snapshot and signer";
    const firstApproval = await approval(first);
    stage = "revision 1 approval command";
    const approved = await command(firstApproval);
    stage = "revision 1 exact receipt replay";
    assert.deepEqual(await command(firstApproval), approved);
    const current = async () =>
      (
        await query(
          "select mapping_id,verification_status,review_valid,publication_ready from pi_effective_media_mappings where product_variant_id=$1 and mapping_origin='current'",
          [variantId],
        )
      )[0];
    stage = "revision 1 effective mapping";
    assert.deepEqual(await current(), {
      mapping_id: first.mapping_id,
      verification_status: "CONFIRMED",
      review_valid: true,
      publication_ready: false,
    });
    assert.equal(
      (await query("select public.pi_media_review_observed($1) as observed", [first.mapping_id]))[0]
        .observed,
      true,
    );
    stage = "omitted contradiction and revisions 2/3 EDIT/REJECT";
    await actor(owner);
    await source("product_match", true);
    assert.equal((await current()).review_valid, false);
    assert.equal((await current()).verification_status, "DATA_CONFLICT");
    const second = await proposal(first);
    await submit(second);
    await actor(reviewer);
    const noConfirmation = {
      rights_source_id: null,
      match_source_id: null,
      observation: null,
      confirmation: null,
      resolution: "",
    };
    const edited = await command({
      action: "media_review",
      mapping_id: second.mapping_id,
      revision: second.revision,
      digest: second.digest,
      decision: "EDIT",
      reason: "Synthetic correction retains conflict",
      ...noConfirmation,
      replacement: {
        asset_id: original.asset_id,
        copy: { alt_text: "Synthetic corrected private raster" },
        sources,
      },
    });
    assert.equal(edited.revision, 3);
    assert.equal(
      (
        await query("select verification_status from media_mapping_revisions where id=$1", [
          edited.mapping_id,
        ])
      )[0].verification_status,
      "DATA_CONFLICT",
    );
    await actor(owner);
    await submit(edited);
    await actor(reviewer);
    await command({
      action: "media_review",
      mapping_id: edited.mapping_id,
      revision: edited.revision,
      digest: edited.digest,
      decision: "REJECT",
      reason: "Synthetic rejection keeps preceding mapping",
      ...noConfirmation,
      replacement: null,
    });
    assert.equal((await current()).mapping_id, first.mapping_id);
    stage = "revision 4 actor/signature/role refusal and approval";
    await actor(owner);
    const fourth = await proposal(edited);
    await submit(fourth);
    await actor(reviewer);
    const fourthApproval = await approval(
      fourth,
      "Synthetic TEST-ONLY conflict resolved for rehearsal, not real evidence",
    );
    await actor(owner);
    await denied(() => command(fourthApproval), "23514");
    await actor(viewer);
    await denied(() => command(fourthApproval), "42501");
    await actor(reviewer);
    await denied(
      () =>
        command({
          ...fourthApproval,
          request_id: randomUUID(),
          observation:
            fourthApproval.observation.slice(0, -1) +
            (fourthApproval.observation.endsWith("a") ? "b" : "a"),
        }),
      "23514",
    );
    await command(fourthApproval);
    await denied(() => command({ ...fourthApproval, request_id: randomUUID() }), "40001");
    assert.equal((await current()).mapping_id, fourth.mapping_id);
    assert.equal((await current()).review_valid, true);
    stage = "revision 5 pending, reviewer revocation and key disable";
    await actor(owner);
    const fifth = await proposal(fourth);
    await submit(fifth);
    await actor(reviewer);
    const fifthApproval = await approval(
      fifth,
      "Synthetic final pending approval is refused after revocation",
    );
    await db.exec("reset role");
    await query("update console_user_roles set revoked_at=clock_timestamp() where user_id=$1", [
      reviewer,
    ]);
    await actor(reviewer);
    await denied(() => command(fifthApproval), "42501");
    await denied(() => command(firstApproval), "42501");
    await denied(() => snapshot(fifth), "42501");
    await db.exec("reset role");
    assert.equal((await query(disposableObserverDisableSql(observer.id)))[0].id, observer.id);
    assert.equal(
      (
        await query(
          "select count(*)::int as n from private.pi_media_observation_keys where enabled",
        )
      )[0].n,
      0,
    );
    stage = "exact final counts and private output";
    const expected = {
      media_source_bindings: 3,
      media_mapping_heads: 1,
      media_mapping_revisions: 5,
      media_mapping_evidence: 10,
      media_mapping_decisions: 4,
      media_mapping_currents: 1,
      "private.pi_media_review_observations": 2,
      "private.pi_media_observation_keys": 1,
    };
    for (const [table, count] of Object.entries(expected))
      assert.equal((await query(`select count(*)::int as n from ${table}`))[0].n, count);
    const history = await query(
      "select r.sequence,d.decision from media_mapping_revisions r left join media_mapping_decisions d on d.mapping_id=r.id order by r.sequence desc",
    );
    assert.deepEqual(history, [
      { sequence: 5, decision: null },
      { sequence: 4, decision: "APPROVE" },
      { sequence: 3, decision: "REJECT" },
      { sequence: 2, decision: "EDIT" },
      { sequence: 1, decision: "APPROVE" },
    ]);
    assert.deepEqual(
      (
        await query("select to_jsonb(a) as row from media_assets a where id=$1", [
          original.asset_id,
        ])
      )[0].row,
      beforeAsset,
    );
    assert.equal(
      (
        await query("select count(*)::int as n from product_media where product_variant_id=$1", [
          variantId,
        ])
      )[0].n,
      0,
    );
    assert.equal((await query("select count(*)::int as n from publish_records"))[0].n, 0);
    assert.equal(
      (
        await query(
          "select count(*)::int as n from pi_effective_media_mappings where mapping_origin<>'legacy' and publication_ready",
        )
      )[0].n,
      0,
    );
    for (const table of ["private.pi_command_receipts", "verification_events"]) {
      const row = (
        await query(
          `select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)::text as rows from ${table} t`,
        )
      )[0].rows;
      assert.equal(row.includes("v1|"), false);
      assert.equal(row.includes(observer.secretHex), false);
    }
    await actor(owner);
    assert.equal((await current()).mapping_id, fourth.mapping_id);
    assert.equal((await current()).review_valid, true);
    assert.equal(
      (
        await query("select public.pi_media_review_observed($1) as observed", [fourth.mapping_id])
      )[0].observed,
      true,
    );
    const readiness = (
      await query(
        "select lifecycle_state,eligible_main_image_count,blocker_count from pi_variant_readiness where id=$1",
        [variantId],
      )
    )[0];
    assert.equal(readiness.lifecycle_state, "DRAFT");
    assert.equal(readiness.eligible_main_image_count, 0);
    assert.ok(readiness.blocker_count > 0);
    assert.deepEqual([...new Set(statements)].sort(), [
      "media_propose",
      "media_review",
      "media_source",
      "media_submit",
    ]);
  } catch (error) {
    const code =
      typeof error?.code === "string" && /^[A-Z0-9]{5}$/.test(error.code)
        ? error.code
        : "assertion";
    throw new Error(
      `Embedded media rehearsal failed at ${stage} (${code}); private fixture output suppressed.`,
    );
  } finally {
    observer.secretHex = "";
    await db.exec("rollback; reset role");
  }
  assertPristineBaseline((await query(pristineBaselineQuery))[0].json_build_object);
  for (const [table, rows] of sourceRows)
    assert.ok(
      JSON.stringify(await sourceSnapshot(table)) === JSON.stringify(rows),
      `${table} exact rollback parity failed.`,
    );
  console.log(
    "Embedded sequential media rehearsal PASS: all six command forms, five revisions, exact ledger/history, scoped disable, refusal, zero publication and exact 17-table rollback parity. Simulated actors/Storage metadata only; no native Auth/Storage/byte observation or races proven.",
  );
}
