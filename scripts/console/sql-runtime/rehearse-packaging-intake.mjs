import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

// TEST-ONLY physical packaging declarations, not measurements or human approvals.
export async function rehearsePackagingIntake(db, pilotIds, tables) {
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
    "packaging_source_bindings",
    "packaging_revision_heads",
    "packaging_revisions",
    "packaging_revision_evidence",
    "packaging_revision_decisions",
    "packaging_revision_currents",
    "oem_references",
    "verification_events",
    "publish_records",
  ])
    before.set(table, await snapshot(table));
  assert.equal(before.get("packaging_source_bindings").length, 0);
  assert.equal(before.get("packaging_records").length, 43);
  assert.ok(
    before
      .get("packaging_records")
      .every(
        (row) =>
          row.quantity === null &&
          row.quantity_unit === null &&
          row.source_level === null &&
          row.verification_status === "NEEDS_FACTORY_CONFIRMATION",
      ),
    "Original packaging quantities remain unknown and unconfirmed.",
  );
  await db.exec("begin");
  try {
    const draft = (
      await query("select public.pi_create_product_draft($1,$2::jsonb,$3::jsonb) as result", [
        randomUUID(),
        JSON.stringify({
          sku: "AF-MIG-TS-9995",
          slug: "synthetic-packaging-intake-item",
          source_reference: "TEST-ONLY packaging rehearsal",
        }),
        JSON.stringify({
          name_en: "Synthetic packaging intake",
          name_zh: "",
          model: "",
          summary: "",
          description: "Synthetic disposable candidate, never real product or commercial evidence",
          applications: "",
        }),
      ])
    )[0].result;
    for (const [index, variant] of [...pilotIds, draft.variant_id].entries()) {
      const original = before
        .get("packaging_records")
        .find((row) => row.product_variant_id === variant);
      assert.equal(Boolean(original), index < pilotIds.length);
      const packaging = {
        package_description: `TEST-ONLY sealed inner bag ${index + 1}`,
        quantity: 10,
        quantity_unit: "pieces",
      };
      const copy = {
        source_kind: "company_record",
        source_level: "A",
        title: "Synthetic packaging intake",
        source_reference:
          "TEST-ONLY declaration; not an actual supplied package or commercial term",
        evidence_basis: "company_catalog",
        evidence_date: new Date().toISOString().slice(0, 10),
        owner_name: "Synthetic custodian",
        revision_label: "QA-PACK-1",
        source_location: "Synthetic metadata only",
        assertion: "reference_only",
      };
      const request = randomUUID();
      const parameters = [
        request,
        variant,
        JSON.stringify(packaging),
        JSON.stringify(copy),
        original?.id ?? null,
      ];
      const sql = "select private.pi_add_packaging_source($1,$2,$3::jsonb,$4::jsonb,$5) as result";
      const result = (await query(sql, parameters))[0].result;
      assert.deepEqual((await query(sql, parameters))[0].result, result);
      const matches = async (target, candidate, lineage) =>
        (
          await query("select private.pi_packaging_source_matches($1,$2,$3::jsonb,$4) as matches", [
            result.source_id,
            target,
            JSON.stringify(candidate),
            lineage,
          ])
        )[0].matches;
      assert.equal(await matches(variant, packaging, original?.id ?? null), true);
      assert.equal(
        await matches(variant, { ...packaging, quantity: 11 }, original?.id ?? null),
        false,
      );
      const candidate = (
        await query(
          "select private.pi_propose_packaging_revision($1,$2,0,0,$3::jsonb,$4::uuid[],$5,null,$6) as result",
          [
            randomUUID(),
            variant,
            JSON.stringify(packaging),
            [result.source_id],
            "TEST-ONLY packaging review refusal; not real evidence",
            original?.id ?? null,
          ],
        )
      )[0].result;
      await query("select private.pi_submit_packaging_revision($1,$2,$3,$4)", [
        randomUUID(),
        candidate.revision_id,
        candidate.revision,
        candidate.digest,
      ]);
      await db.exec("savepoint packaging_approval_refusal");
      try {
        await query(
          "select private.pi_review_packaging_revision($1,$2,$3,$4,'APPROVE',$5,'CONFIRMED',$6::jsonb,$7,'',null)",
          [
            randomUUID(),
            candidate.revision_id,
            candidate.revision,
            candidate.digest,
            "TEST-ONLY evidence-gate refusal, not an actual human approval",
            JSON.stringify({
              source_checked: true,
              packaging_checked: true,
              commercial_terms_unchanged: true,
              arcfort_packaging_confirmed: true,
            }),
            result.source_id,
          ],
        );
        assert.fail("Reference-only catalog cannot confirm real SKU packaging.");
      } catch (error) {
        assert.equal(error.code, "23514", "Refusal must be the exact packaging evidence gate.");
      } finally {
        await db.exec(
          "rollback to savepoint packaging_approval_refusal; release savepoint packaging_approval_refusal",
        );
      }
      assert.equal(
        await matches(variant, { ...packaging, quantity_unit: "sets" }, original?.id ?? null),
        false,
      );
      assert.equal(
        await matches(pilotIds[(index + 1) % pilotIds.length], packaging, original?.id ?? null),
        false,
      );
      if (original) assert.equal(await matches(variant, packaging, null), false);
      assert.equal(
        (
          await query(
            "select private.pi_packaging_source_can_support_review($1,$2,$3::jsonb,$4) as eligible",
            [result.source_id, variant, JSON.stringify(packaging), original?.id ?? null],
          )
        )[0].eligible,
        false,
      );
      await db.exec("savepoint packaging_refusal");
      try {
        await query(sql, [
          request,
          variant,
          JSON.stringify({ ...packaging, quantity: 11 }),
          JSON.stringify(copy),
          original?.id ?? null,
        ]);
        assert.fail("Packaging receipt must not accept another quantity.");
      } catch (error) {
        assert.equal(
          error.code,
          "40001",
          "Refusal must be the receipt gate, not transport failure.",
        );
      } finally {
        await db.exec(
          "rollback to savepoint packaging_refusal; release savepoint packaging_refusal",
        );
      }
    }
    assert.equal((await snapshot("packaging_source_bindings")).length, 5);
    assert.equal((await snapshot("packaging_revision_heads")).length, 5);
    assert.equal((await snapshot("packaging_revision_evidence")).length, 5);
    const revisions = await snapshot("packaging_revisions");
    assert.equal(revisions.length, 5);
    assert.ok(
      revisions.every(
        (row) =>
          row.review_state === "pending" &&
          row.verification_status === "NEEDS_FACTORY_CONFIRMATION",
      ),
    );
    assert.equal((await snapshot("packaging_revision_decisions")).length, 0);
    assert.equal((await snapshot("packaging_revision_currents")).length, 0);
    assert.equal(
      (await snapshot("evidence_sources")).length,
      before.get("evidence_sources").length + 5,
    );
    assert.deepEqual(await snapshot("packaging_records"), before.get("packaging_records"));
    for (const table of [
      "oem_references",
      "technical_values",
      "compatibility_relationships",
      "media_assets",
      "product_media",
      "verification_events",
      "publish_records",
    ])
      assert.deepEqual(
        await snapshot(table),
        before.get(table),
        `${table} packaging non-interference`,
      );
    for (const table of ["product_variants", "evidence_sources"]) {
      const original = before.get(table);
      const retained = (
        await query(
          `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from public.${table} t where id=any($1::uuid[])`,
          [original.map((row) => row.id)],
        )
      )[0].rows;
      assert.deepEqual(retained, original, `${table} original packaging-intake parity`);
    }
  } finally {
    await db.exec("rollback");
  }
  for (const [table, rows] of before)
    assert.deepEqual(await snapshot(table), rows, `${table} packaging-intake rollback parity`);
  console.log(
    "Packaging rehearsal PASS: four real 15AK identities and one created synthetic draft, five frozen TEST-ONLY reference proposals, exact confirmation refusal and quantity/unit/lineage/receipt gates, all 43 original packaging/commercial records retained and exact 17-table rollback. No human approval, publication or native/provider evidence claimed.",
  );
}
