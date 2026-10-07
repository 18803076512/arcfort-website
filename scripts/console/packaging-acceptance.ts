import assert from "node:assert/strict";
import type { PackagingCopy, PackagingSourceCopy } from "../../lib/domain/catalog/packaging.ts";
import { sqlLiteral } from "./local-acceptance.ts";

export const packagingTestCopies: Record<"unknown" | "known" | "corrected", PackagingCopy> = {
  unknown: { package_description: "TEST-ONLY inner bag", quantity: null, quantity_unit: null },
  known: { package_description: "TEST-ONLY inner bag", quantity: 10, quantity_unit: "pieces" },
  corrected: { package_description: "TEST-ONLY inner bag", quantity: 12, quantity_unit: "pieces" },
};
// Synthetic physical declarations only; never real packaging or commercial evidence.
export function packagingTestSource(
  kind: "reference" | "factory" | "contradiction",
  copy: PackagingCopy,
): PackagingSourceCopy {
  return {
    source_kind: kind === "reference" ? "official_manufacturer" : "company_record",
    source_level: kind === "reference" ? "B" : "A",
    title: `Synthetic packaging ${kind} ${copy.quantity ?? "unknown"}`,
    source_reference: `TEST-ONLY ${kind}; not an actual packaging document`,
    evidence_basis: kind === "reference" ? "manufacturer_catalog" : "packaging_record",
    evidence_date: new Date().toISOString().slice(0, 10),
    owner_name: "Synthetic test custodian",
    revision_label: "TEST-ONLY-1",
    source_location: "Synthetic page 1, package 1",
    assertion:
      kind === "reference" ? "reference_only" : kind === "factory" ? "supports" : "contradicts",
  };
}
export const packagingNonInterferenceTables = [
  "product_variants",
  "packaging_records",
  "oem_references",
  "oem_source_bindings",
  "oem_revision_heads",
  "oem_revisions",
  "oem_revision_evidence",
  "oem_revision_decisions",
  "oem_revision_currents",
  "technical_values",
  "technical_revisions",
  "compatibility_relationships",
  "compatibility_revisions",
  "media_assets",
  "product_media",
  "media_mapping_revisions",
  "publish_records",
] as const;
export const packagingNonInterferenceQueries = packagingNonInterferenceTables.map(
  (table) =>
    `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) from public.${table} t;`,
);
export function packagingLedgerQuery(variantId: string, reviewerId: string) {
  for (const id of [variantId, reviewerId])
    assert.match(id, /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
  const variant = sqlLiteral(variantId),
    reviewer = sqlLiteral(reviewerId);
  return `select jsonb_build_object(
    'sources',(select count(*) from packaging_source_bindings),
    'heads',(select count(*) from packaging_revision_heads),
    'revisions',(select count(*) from packaging_revisions),
    'evidence',(select count(*) from packaging_revision_evidence),
    'decisions',(select count(*) from packaging_revision_decisions),
    'currents',(select count(*) from packaging_revision_currents),
    'scopedHeads',(select count(*) from packaging_revision_heads h join product_variants v on v.id=h.product_variant_id
      where v.id=${variant} and v.sku='AF-MIG-TS-9998' and v.public_slug='synthetic-browser-m3-item'
      and not v.is_shadow and v.lifecycle_state='DRAFT' and h.revision=5 and h.slot=0 and h.original_packaging_id is null),
    'scopedSources',(select count(*) from packaging_source_bindings b where b.product_variant_id=${variant}
      and b.original_packaging_id is null and b.package_description='TEST-ONLY inner bag'
      and ((b.quantity is null and b.quantity_unit is null) or (b.quantity in (10,12) and b.quantity_unit='pieces'))),
    'reviewerDecisions',(select count(*) from packaging_revision_decisions d join verification_events e on e.id=d.event_id
      where d.created_by=${reviewer} and e.actor_id=${reviewer} and e.entity_type='packaging_revision' and e.entity_id=d.revision_id),
    'history',(select jsonb_agg(jsonb_build_array(r.sequence,r.review_state,d.decision,d.approved_status,r.quantity,r.quantity_unit) order by r.sequence)
      from packaging_revisions r left join packaging_revision_decisions d on d.revision_id=r.id),
    'validCurrent',(select count(*) from packaging_revision_currents c join packaging_revisions r on r.id=c.revision_id
      join packaging_revision_decisions d on d.revision_id=r.id where r.sequence=4 and d.approved_status='CONFIRMED'
      and r.quantity=12 and r.quantity_unit='pieces' and private.pi_packaging_approval_valid(r.id)),
    'publicationReady',(select count(*) from pi_effective_packaging_records where publication_ready),
    'publications',(select count(*) from publish_records));`;
}
export function assertPackagingLedger(value: unknown) {
  assert.deepEqual(
    value,
    {
      sources: 5,
      heads: 1,
      revisions: 5,
      evidence: 6,
      decisions: 4,
      currents: 1,
      scopedHeads: 1,
      scopedSources: 5,
      reviewerDecisions: 4,
      history: [
        [1, "approved", "APPROVE", "OEM_REFERENCE", null, null],
        [2, "superseded", "EDIT", null, 10, "pieces"],
        [3, "rejected", "REJECT", null, 12, "pieces"],
        [4, "approved", "APPROVE", "CONFIRMED", 12, "pieces"],
        [5, "pending", null, null, 12, "pieces"],
      ],
      validCurrent: 1,
      publicationReady: 0,
      publications: 0,
    },
    "Packaging acceptance must retain exact physical history and zero publication.",
  );
}
