import assert from "node:assert/strict";
import type { OemCopy, OemSourceCopy } from "../../lib/domain/catalog/oem.ts";
import { sqlLiteral } from "./local-acceptance.ts";

// Only synthetic declarations. Neither an OEM number nor real document evidence.
export const oemTestCopy: OemCopy = {
  manufacturer_name: "Synthetic TEST-ONLY manufacturer",
  reference_number: "00-TEST-ONLY.OEM/aB-01",
};
export function oemTestSource(kind: "reference" | "factory" | "contradiction"): OemSourceCopy {
  return {
    source_kind: kind === "reference" ? "official_manufacturer" : "company_record",
    source_level: kind === "reference" ? "B" : "A",
    title: `Synthetic OEM ${kind}`,
    source_reference: `TEST-ONLY ${kind}; not an actual OEM document`,
    evidence_basis: kind === "reference" ? "manufacturer_catalog" : "controlled_drawing",
    evidence_date: new Date().toISOString().slice(0, 10),
    owner_name: "Synthetic test custodian",
    revision_label: "TEST-ONLY-1",
    source_location: "Synthetic page 1, designation 1",
    assertion:
      kind === "reference" ? "reference_only" : kind === "factory" ? "supports" : "contradicts",
  };
}

export const oemNonInterferenceTables = [
  "product_variants",
  "oem_references",
  "technical_values",
  "technical_revisions",
  "compatibility_relationships",
  "compatibility_revisions",
  "media_assets",
  "product_media",
  "media_mapping_revisions",
  "publish_records",
] as const;
export const oemNonInterferenceQueries = oemNonInterferenceTables.map(
  (table) =>
    `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) from public.${table} t;`,
);

export function oemLedgerQuery(variantId: string, reviewerId: string) {
  for (const id of [variantId, reviewerId])
    assert.match(id, /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
  const variant = sqlLiteral(variantId);
  const reviewer = sqlLiteral(reviewerId);
  return `select jsonb_build_object(
    'sources',(select count(*) from oem_source_bindings),
    'heads',(select count(*) from oem_revision_heads),
    'revisions',(select count(*) from oem_revisions),
    'evidence',(select count(*) from oem_revision_evidence),
    'decisions',(select count(*) from oem_revision_decisions),
    'currents',(select count(*) from oem_revision_currents),
    'scopedHeads',(select count(*) from oem_revision_heads h join product_variants v on v.id=h.product_variant_id
      where v.id=${variant} and v.sku='AF-MIG-TS-9998' and v.public_slug='synthetic-browser-m3-item'
      and not v.is_shadow and v.lifecycle_state='DRAFT' and h.revision=5 and h.slot=0 and h.source_oem_reference_id is null),
    'scopedSources',(select count(*) from oem_source_bindings b where b.product_variant_id=${variant}
      and b.manufacturer_name=${sqlLiteral(oemTestCopy.manufacturer_name)}
      and b.reference_number=${sqlLiteral(oemTestCopy.reference_number)}),
    'reviewerDecisions',(select count(*) from oem_revision_decisions d join verification_events e on e.id=d.event_id
      where d.created_by=${reviewer} and e.actor_id=${reviewer} and e.entity_type='oem_revision' and e.entity_id=d.revision_id),
    'history',(select jsonb_agg(jsonb_build_array(r.sequence,r.review_state,d.decision,d.approved_status) order by r.sequence)
      from oem_revisions r left join oem_revision_decisions d on d.revision_id=r.id),
    'validCurrent',(select count(*) from oem_revision_currents c join oem_revisions r on r.id=c.revision_id
      join oem_revision_decisions d on d.revision_id=r.id where r.sequence=4 and d.approved_status='CONFIRMED'
      and private.pi_oem_approval_valid(r.id)),
    'publicationReady',(select count(*) from pi_effective_oem_references where publication_ready),
    'publications',(select count(*) from publish_records));`;
}

export function assertOemLedger(value: unknown) {
  assert.deepEqual(
    value,
    {
      sources: 3,
      heads: 1,
      revisions: 5,
      evidence: 10,
      decisions: 4,
      currents: 1,
      scopedHeads: 1,
      scopedSources: 3,
      reviewerDecisions: 4,
      history: [
        [1, "approved", "APPROVE", "OEM_REFERENCE"],
        [2, "superseded", "EDIT", null],
        [3, "rejected", "REJECT", null],
        [4, "approved", "APPROVE", "CONFIRMED"],
        [5, "pending", null, null],
      ],
      validCurrent: 1,
      publicationReady: 0,
      publications: 0,
    },
    "OEM acceptance must retain the exact isolated ledger and zero publication.",
  );
}
