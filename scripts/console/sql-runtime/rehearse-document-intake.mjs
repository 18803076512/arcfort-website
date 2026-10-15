import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { parseDocumentReview } from "../../../lib/console/document-review.ts";
import { parseDocumentReadiness } from "../../../lib/domain/catalog/document-readiness.ts";

// Synthetic metadata only. No source file is read and no real technical assertion is made.
export async function rehearseDocumentIntake(db, pilotIds, tables) {
  const query = async (sql, parameters = []) => (await db.query(sql, parameters)).rows;
  const snapshot = async (table) => {
    assert.match(table, /^[a-z_]+$/);
    return (
      await query(
        `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from public.${table} t`,
      )
    )[0].rows;
  };
  const before = new Map();
  for (const table of [
    ...Object.keys(tables),
    "technical_documents",
    "entity_documents",
    "technical_document_bindings",
    "document_upload_intents",
    "document_upload_completions",
    "document_source_bindings",
    "document_review_heads",
    "document_review_candidates",
    "document_review_submissions",
    "document_review_decisions",
    "document_review_currents",
    "verification_events",
    "publish_records",
    "audit_events",
  ])
    before.set(table, await snapshot(table));
  for (const table of ["technical_documents", "entity_documents", "technical_document_bindings"])
    assert.equal(before.get(table).length, 0);
  const receiptSnapshot = async () =>
    (
      await query(
        "select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from private.pi_command_receipts t",
      )
    )[0].rows;
  const receiptsBefore = await receiptSnapshot();
  const storageSnapshot = async () =>
    (
      await query(
        "select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]'::jsonb) as rows from storage.objects t",
      )
    )[0].rows;
  const storageBefore = await storageSnapshot();
  const refused = async (sql, parameters, code) => {
    await db.exec("savepoint document_refusal");
    try {
      await query(sql, parameters);
      assert.fail("Document reference command should have been refused.");
    } catch (error) {
      assert.equal(error.code, code, "Refusal must be the exact command gate.");
    } finally {
      await db.exec("rollback to savepoint document_refusal; release savepoint document_refusal");
    }
  };
  await db.exec("begin");
  try {
    const draft = (
      await query("select public.pi_create_product_draft($1,$2::jsonb,$3::jsonb) as result", [
        randomUUID(),
        JSON.stringify({
          sku: "AF-MIG-TS-9994",
          slug: "synthetic-document-intake-item",
          source_reference: "TEST-ONLY document rehearsal",
        }),
        JSON.stringify({
          name_en: "Synthetic document intake",
          name_zh: "",
          model: "",
          summary: "",
          description: "Synthetic disposable candidate, not real document or product evidence",
          applications: "",
        }),
      ])
    )[0].result;
    const sql = "select private.pi_add_document_reference($1,$2,$3::jsonb,$4) as result";
    for (const [index, variant] of [...pilotIds, draft.variant_id].entries()) {
      const copy = {
        title: "TEST-ONLY document reference",
        document_type: "catalog",
        source_kind: "company_record",
        source_level: "A",
        source_reference: "TEST-ONLY declaration; not an actual company document",
        source_location: `Synthetic location ${index + 1}`,
        owner_name: "Synthetic custodian",
        scope_note: "TEST-ONLY SKU association, not confirmed technical data",
        revision_label: null,
        issued_date: null,
      };
      const request = randomUUID();
      const parameters = [request, variant, JSON.stringify(copy), null];
      const original = (await query(sql, parameters))[0].result;
      assert.deepEqual((await query(sql, parameters))[0].result, original);
      const next = (
        await query(sql, [
          randomUUID(),
          variant,
          JSON.stringify({ ...copy, revision_label: "TEST-REV-2" }),
          original.document_id,
        ])
      )[0].result;
      for (const document of [original, next]) {
        assert.equal(
          (
            await query("select private.pi_document_reference_matches($1,$2) as matches", [
              document.document_id,
              variant,
            ])
          )[0].matches,
          true,
        );
        assert.equal(
          (
            await query("select private.pi_document_reference_matches($1,$2) as matches", [
              document.document_id,
              pilotIds[(index + 1) % pilotIds.length],
            ])
          )[0].matches,
          false,
        );
      }
      // Synthetic Storage rows test SQL linkage only; no file-byte observation is claimed.
      const manifest = {
        filename: "synthetic.pdf",
        mime_type: "application/pdf",
        byte_size: 60,
        page_count: 2,
        file_hash: "a".repeat(64),
      };
      const beginArgs = [randomUUID(), next.document_id, JSON.stringify(manifest)];
      const beginSql = "select private.pi_begin_document_upload($1,$2,$3::jsonb) as result";
      const intent = (await query(beginSql, beginArgs))[0].result;
      assert.deepEqual((await query(beginSql, beginArgs))[0].result, intent);
      await query(
        "insert into storage.objects(id,bucket_id,name,owner_id,metadata,version) values($1,'pi-technical-evidence',$2,auth.uid()::text,$3::jsonb,'TEST-ONLY')",
        [
          randomUUID(),
          intent.storage_path,
          JSON.stringify({ size: 60, mimetype: "application/pdf" }),
        ],
      );
      const completeArgs = [randomUUID(), intent.intent_id];
      const completeSql = "select private.pi_complete_document_upload($1,$2) as result";
      const completion = (await query(completeSql, completeArgs))[0].result;
      assert.equal(completion.document_id, next.document_id);
      assert.deepEqual((await query(completeSql, completeArgs))[0].result, completion);
      const sourceSql = "select private.pi_add_document_source($1,$2,$3,$4,$5::jsonb) as result";
      const reviewSources = [];
      for (const [dimension, assertion] of [
        ["usage_rights", "reference_only"],
        ["exact_scope", "reference_only"],
        ["exact_scope", "contradicts"],
      ]) {
        const source = {
          title: "TEST-ONLY document review source",
          source_kind: "company_record",
          source_level: "A",
          source_reference: "Synthetic declaration; not actual company evidence",
          owner_name: "Synthetic custodian",
          source_location: "Synthetic page 1",
          scope_note: "Synthetic exact-SKU scope only",
          revision_label: null,
          evidence_date: null,
          evidence_basis: "company_catalog",
          assertion,
        };
        const args = [randomUUID(), variant, next.document_id, dimension, JSON.stringify(source)];
        const record = (await query(sourceSql, args))[0].result;
        reviewSources.push(record.source_id);
        assert.deepEqual((await query(sourceSql, args))[0].result, record);
        assert.equal(
          (
            await query("select private.pi_document_source_matches($1,$2,$3,$4) as matches", [
              record.source_id,
              variant,
              next.document_id,
              dimension,
            ])
          )[0].matches,
          true,
        );
        assert.equal(
          (
            await query(
              "select private.pi_document_source_can_support_review($1,$2,$3,$4) as eligible",
              [record.source_id, variant, next.document_id, dimension],
            )
          )[0].eligible,
          false,
        );
        for (const value of await query(
          "select id from public.technical_values where product_variant_id=$1",
          [variant],
        ))
          assert.equal(
            (
              await query("select private.pi_technical_source_matches($1,$2) as matches", [
                record.source_id,
                value.id,
              ])
            )[0].matches,
            false,
            "Document scope/rights evidence cannot become a field-specific technical source.",
          );
        await refused(
          sourceSql,
          [
            randomUUID(),
            pilotIds[(index + 1) % pilotIds.length],
            next.document_id,
            dimension,
            JSON.stringify(source),
          ],
          "40001",
        );
      }
      const proposalSql =
        "select private.pi_propose_document_review($1,$2,$3,$4,$5::jsonb,$6) as result";
      const proposalArgs = [
        randomUUID(),
        variant,
        next.document_id,
        0,
        JSON.stringify({
          scope_note: "TEST-ONLY review candidate, not a real 15AK approval",
          sources: reviewSources.slice(0, 2),
        }),
        "TEST-ONLY reference review",
      ];
      const proposal = (await query(proposalSql, proposalArgs))[0].result;
      assert.deepEqual((await query(proposalSql, proposalArgs))[0].result, proposal);
      const frozen = (
        await query("select * from public.document_review_candidates where id=$1", [
          proposal.candidate_id,
        ])
      )[0];
      assert.equal(
        frozen.verification_status,
        "DATA_CONFLICT",
        "Unselected contradiction remains visible.",
      );
      const submitSql = "select private.pi_submit_document_review($1,$2,$3,$4) as result";
      const submitArgs = [randomUUID(), proposal.candidate_id, proposal.revision, proposal.digest];
      const submitted = (await query(submitSql, submitArgs))[0].result;
      assert.deepEqual((await query(submitSql, submitArgs))[0].result, submitted);
      const review = parseDocumentReview(
        (
          await query("select public.pi_read_document_review($1,$2,1,1) as result", [
            variant,
            next.document_id,
          ])
        )[0].result,
        variant,
        next.document_id,
        1,
        1,
      );
      assert.equal(review.originalCurrent, true);
      assert.equal(review.sources.total, 3);
      assert.equal(review.history.total, 1);
      assert.equal(review.latest.candidate_id, proposal.candidate_id);
      assert.equal(review.latest.submitted, true);
      assert.equal(review.open, true);
      assert.equal(review.reviewed, false);
      assert.equal(review.current, null);
      const readiness = (
        await query("select * from public.pi_document_readiness where product_variant_id=$1", [
          variant,
        ])
      )[0];
      assert.deepEqual(
        parseDocumentReadiness(readiness),
        {
          document_count: 2,
          reviewed_document_count: 0,
          unresolved_document_count: 2,
          unavailable_original_count: 1,
          open_document_review_count: 1,
          invalid_document_approval_count: 0,
          document_conflict_count: 1,
        },
        "Prior version remains independently unresolved; actual SQL counts pass the application parser.",
      );
      await refused(
        "select private.pi_review_document($1,$2,$3,$4,'APPROVE',$5,$6::jsonb,$7,$8,$9,null)",
        [
          randomUUID(),
          proposal.candidate_id,
          proposal.revision,
          proposal.digest,
          "TEST-ONLY attempted reference approval",
          JSON.stringify({
            original_digest: frozen.original_digest,
            original_inspected: true,
            usage_rights_confirmed: true,
            exact_scope_confirmed: true,
          }),
          reviewSources[0],
          reviewSources[1],
          "TEST-ONLY alleged resolution does not supply missing qualifying evidence",
        ],
        "23514",
      );
      assert.deepEqual(
        (
          await query("select * from public.document_review_candidates where id=$1", [
            proposal.candidate_id,
          ])
        )[0],
        frozen,
        "Rejected approval cannot rewrite a frozen document candidate.",
      );
      await refused(
        sql,
        [request, variant, JSON.stringify({ ...copy, revision_label: "Changed" }), null],
        "40001",
      );
      await refused(
        sql,
        [randomUUID(), variant, JSON.stringify({ ...copy, publication_status: "public" }), null],
        "22023",
      );
      await refused(
        sql,
        [
          randomUUID(),
          pilotIds[(index + 1) % pilotIds.length],
          JSON.stringify(copy),
          original.document_id,
        ],
        "22023",
      );
    }
    const documents = await snapshot("technical_documents");
    const bindings = await snapshot("technical_document_bindings");
    assert.equal(documents.length, 10);
    assert.equal(bindings.length, 10);
    assert.equal((await snapshot("entity_documents")).length, 10);
    assert.equal((await snapshot("document_upload_intents")).length, 5);
    const completions = await snapshot("document_upload_completions");
    assert.equal(completions.length, 5);
    assert.ok(completions.every((row) => row.byte_verification === "not_attested"));
    const sources = await snapshot("document_source_bindings");
    assert.equal(sources.length, 15);
    assert.equal(sources.filter((row) => row.assertion === "contradicts").length, 5);
    assert.equal((await snapshot("document_review_heads")).length, 5);
    assert.equal((await snapshot("document_review_candidates")).length, 5);
    assert.equal((await snapshot("document_review_submissions")).length, 5);
    assert.equal((await snapshot("document_review_decisions")).length, 0);
    assert.equal((await snapshot("document_review_currents")).length, 0);
    assert.ok(sources.every((row) => row.revision_label === null));
    assert.equal(bindings.filter((row) => row.prior_document_id !== null).length, 5);
    assert.equal(bindings.filter((row) => row.revision_label === null).length, 5);
    assert.ok(bindings.every((row) => row.issued_date === null));
    assert.ok(
      documents.every(
        (row) =>
          row.publication_status === "private" &&
          row.usage_rights_status === "needs_confirmation" &&
          row.file_hash === null &&
          row.storage_path === null &&
          row.storage_bucket === null &&
          row.public_url === null &&
          row.raw_snapshot.file_inspection === "not_performed",
      ),
    );
    for (const table of Object.keys(tables)) {
      if (!["products", "product_variants", "evidence_sources"].includes(table)) {
        assert.deepEqual(await snapshot(table), before.get(table));
        continue;
      }
      const retained = (
        await query(
          `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows
          from public.${table} t where id=any($1::uuid[])`,
          [before.get(table).map((row) => row.id)],
        )
      )[0].rows;
      assert.deepEqual(retained, before.get(table), `${table} original document-intake parity`);
    }
    for (const table of ["verification_events", "publish_records"])
      assert.deepEqual(await snapshot(table), before.get(table));
    assert.equal(
      (await query("select count(*)::int as n from private.pi_mutation_context"))[0].n,
      0,
    );
  } finally {
    await db.exec("rollback");
  }
  for (const [table, rows] of before)
    assert.deepEqual(await snapshot(table), rows, `${table} document-intake rollback parity`);
  assert.deepEqual(
    await receiptSnapshot(),
    receiptsBefore,
    "Document receipts roll back with the fixture.",
  );
  assert.deepEqual(
    await storageSnapshot(),
    storageBefore,
    "Synthetic document Storage rows roll back exactly.",
  );
  console.log(
    "Document intake/review rehearsal PASS: four real 15AK identities and one created synthetic draft, ten TEST-ONLY references, five metadata-only completions, fifteen unqualified evidence bindings, five retained contradictions and five frozen submitted review candidates. Reference-only approval refused even with human declarations/resolution; zero decisions/current/publication. Exact retries, original data and complete rollback parity. Synthetic Storage rows only; no actual file, approval or native/provider evidence claimed.",
  );
}
