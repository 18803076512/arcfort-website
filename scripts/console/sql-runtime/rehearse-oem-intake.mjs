import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// Synthetic references and refusal controls only; no native Auth or actual OEM approval.
export async function rehearseOemIntake(db, pilotIds, tables) {
  const query = async (sql, parameters = []) => (await db.query(sql, parameters)).rows;
  const snapshot = async (table) =>
    (
      await query(
        `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from public.${table} t`,
      )
    )[0].rows;
  const before = new Map();
  for (const table of [
    ...Object.keys(tables),
    "oem_references",
    "oem_source_bindings",
    "oem_revision_heads",
    "oem_revisions",
    "oem_revision_evidence",
    "oem_revision_decisions",
    "oem_revision_currents",
  ])
    before.set(table, await snapshot(table));
  assert.equal(before.get("oem_source_bindings").length, 0);
  await db.exec("begin");
  try {
    const draft = (
      await query("select public.pi_create_product_draft($1,$2::jsonb,$3::jsonb) as result", [
        randomUUID(),
        JSON.stringify({
          sku: "AF-MIG-TS-9997",
          slug: "synthetic-oem-intake-item",
          source_reference: "TEST-ONLY OEM rehearsal",
        }),
        JSON.stringify({
          name_en: "Synthetic OEM intake",
          name_zh: "",
          model: "",
          summary: "",
          description: "Synthetic disposable candidate, never real product evidence",
          applications: "",
        }),
      ])
    )[0].result;
    for (const [index, variant] of [...pilotIds, draft.variant_id].entries()) {
      const manufacturer = "Synthetic TEST-ONLY manufacturer";
      const reference = `TEST-ONLY-OEM-${index + 1}`;
      const copy = {
        source_kind: "company_record",
        source_level: "A",
        title: "Synthetic reference intake",
        source_reference: "TEST-ONLY declaration; not an actual OEM number",
        evidence_basis: "company_catalog",
        evidence_date: new Date().toISOString().slice(0, 10),
        owner_name: "Synthetic custodian",
        revision_label: "QA-OEM-1",
        source_location: "Synthetic metadata only",
        assertion: "reference_only",
      };
      const result = (
        await query("select private.pi_add_oem_source($1,$2,$3,$4,$5::jsonb) as result", [
          randomUUID(),
          variant,
          manufacturer,
          reference,
          JSON.stringify(copy),
        ])
      )[0].result;
      assert.equal(
        (
          await query("select private.pi_oem_source_matches($1,$2,$3,$4) as matches", [
            result.source_id,
            variant,
            manufacturer,
            reference,
          ])
        )[0].matches,
        true,
      );
      assert.equal(
        (
          await query("select private.pi_oem_source_can_support_review($1,$2,$3,$4) as eligible", [
            result.source_id,
            variant,
            manufacturer,
            reference,
          ])
        )[0].eligible,
        false,
      );
      const candidate = (
        await query(
          "select private.pi_propose_oem_revision($1,$2,0,0,$3::jsonb,$4::uuid[],$5) as result",
          [
            randomUUID(),
            variant,
            JSON.stringify({ manufacturer_name: manufacturer, reference_number: reference }),
            [result.source_id],
            "TEST-ONLY OEM refusal rehearsal",
          ],
        )
      )[0].result;
      await query("select private.pi_submit_oem_revision($1,$2,$3,$4)", [
        randomUUID(),
        candidate.revision_id,
        candidate.revision,
        candidate.digest,
      ]);
      await db.exec("savepoint oem_refusal");
      try {
        await query(
          "select private.pi_review_oem_revision($1,$2,$3,$4,'APPROVE',$5,'CONFIRMED',$6::jsonb,$7,'',null)",
          [
            randomUUID(),
            candidate.revision_id,
            candidate.revision,
            candidate.digest,
            "TEST-ONLY negative control, not an actual approval",
            JSON.stringify({
              source_checked: true,
              reference_checked: true,
              compatibility_not_asserted: true,
              arcfort_reference_confirmed: true,
            }),
            result.source_id,
          ],
        );
        assert.fail("Reference-only company catalog must not confirm a real SKU.");
      } catch (error) {
        assert.equal(
          error.code,
          "23514",
          "OEM refusal must be the evidence gate, not a transport failure.",
        );
      } finally {
        await db.exec("rollback to savepoint oem_refusal; release savepoint oem_refusal");
      }
      assert.equal(
        (
          await query("select private.pi_oem_source_matches($1,$2,$3,$4) as matches", [
            result.source_id,
            variant,
            manufacturer,
            reference + "changed",
          ])
        )[0].matches,
        false,
      );
      assert.equal(
        (
          await query("select private.pi_oem_source_matches($1,$2,$3,$4) as matches", [
            result.source_id,
            pilotIds[(index + 1) % pilotIds.length],
            manufacturer,
            reference,
          ])
        )[0].matches,
        false,
      );
    }
    assert.equal((await query("select count(*)::int as n from oem_source_bindings"))[0].n, 5);
    assert.equal(
      (await query("select count(*)::int as n from oem_revisions where review_state='pending'"))[0]
        .n,
      5,
    );
    assert.equal((await query("select count(*)::int as n from oem_revision_decisions"))[0].n, 0);
    assert.equal((await query("select count(*)::int as n from oem_revision_currents"))[0].n, 0);
    assert.equal((await snapshot("oem_references")).length, before.get("oem_references").length);
    assert.equal((await query("select count(*)::int as n from verification_events"))[0].n, 0);
    assert.equal((await query("select count(*)::int as n from publish_records"))[0].n, 0);
    for (const table of [
      "product_variants",
      "technical_values",
      "compatibility_relationships",
      "media_assets",
      "product_media",
      "evidence_sources",
    ]) {
      const original = before.get(table);
      const retained = (
        await query(
          `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from public.${table} t where id=any($1::uuid[])`,
          [original.map((row) => row.id)],
        )
      )[0].rows;
      assert.ok(
        JSON.stringify(retained) === JSON.stringify(original),
        `${table} original OEM-intake parity failed.`,
      );
    }
  } finally {
    await db.exec("rollback");
  }
  for (const [table, rows] of before)
    assert.ok(
      JSON.stringify(await snapshot(table)) === JSON.stringify(rows),
      `${table} OEM-intake rollback parity failed.`,
    );
  console.log(
    "OEM rehearsal PASS: four real 15AK identities and one created synthetic draft, five frozen reference-only proposals, exact evidence-gate refusal, no decisions/current/fit/publication, unchanged original rows and exact rollback parity. No native/provider evidence claimed.",
  );
}
