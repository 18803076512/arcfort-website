import assert from "node:assert/strict";
import type { DocumentCopy } from "../../lib/domain/catalog/documents.ts";
import type { DocumentSourceCopy } from "../../lib/domain/catalog/document-review.ts";
import { sqlLiteral } from "./local-acceptance.ts";

export const documentTestCopy: DocumentCopy = {
  title: "TEST-ONLY synthetic document",
  document_type: "drawing",
  source_kind: "company_record",
  source_level: "A",
  owner_name: "Synthetic test custodian",
  source_reference: "TEST-ONLY declaration, not a real company drawing",
  source_location: "Synthetic page 1",
  scope_note: "TEST-ONLY exact SKU scope, not real technical evidence",
  revision_label: null,
  issued_date: null,
};
export function documentTestSource(kind: "rights" | "scope" | "contradiction"): DocumentSourceCopy {
  return {
    title: `TEST-ONLY document ${kind}`,
    source_kind: "company_record",
    source_level: "A",
    evidence_basis: kind === "rights" ? "company_ownership" : "controlled_drawing",
    evidence_date: new Date().toISOString().slice(0, 10),
    owner_name: "Synthetic test custodian",
    revision_label: "TEST-ONLY-1",
    source_reference: `TEST-ONLY ${kind}, never real rights or SKU evidence`,
    source_location: "Synthetic page 1",
    scope_note: documentTestCopy.scope_note,
    assertion: kind === "contradiction" ? "contradicts" : "supports",
  };
}
export const documentNonInterferenceTables = [
  "products",
  "product_variants",
  "technical_values",
  "technical_revisions",
  "compatibility_relationships",
  "compatibility_revisions",
  "compatibility_source_bindings",
  "media_assets",
  "product_media",
  "media_source_bindings",
  "media_upload_intents",
  "media_upload_completions",
  "media_mapping_heads",
  "media_mapping_revisions",
  "media_mapping_evidence",
  "media_mapping_decisions",
  "media_mapping_currents",
  "oem_references",
  "oem_source_bindings",
  "oem_revision_heads",
  "oem_revisions",
  "oem_revision_evidence",
  "oem_revision_decisions",
  "oem_revision_currents",
  "packaging_records",
  "packaging_source_bindings",
  "packaging_revision_heads",
  "packaging_revisions",
  "packaging_revision_evidence",
  "packaging_revision_decisions",
  "packaging_revision_currents",
  "seo_records",
  "publish_records",
] as const;
export const documentNonInterferenceQueries = documentNonInterferenceTables.map(
  (table) =>
    `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) from public.${table} t;`,
);

export const documentLedgerCounts = {
  technical_documents: 2,
  entity_documents: 2,
  technical_document_bindings: 2,
  document_upload_intents: 1,
  document_upload_completions: 1,
  document_source_bindings: 3,
  document_review_heads: 1,
  document_review_candidates: 5,
  document_review_submissions: 5,
  document_review_decisions: 4,
  document_review_currents: 1,
  "private.pi_document_observation_keys": 1,
  "private.pi_document_review_observations": 2,
} as const;

export function documentLedgerQuery(variantId: string, reviewerId: string) {
  for (const id of [variantId, reviewerId])
    assert.match(id, /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
  const variant = sqlLiteral(variantId),
    reviewer = sqlLiteral(reviewerId);
  return `select jsonb_build_object(
    'counts',jsonb_build_object(${Object.keys(documentLedgerCounts)
      .map((table) => `${sqlLiteral(table)},(select count(*) from ${table})`)
      .join(",")}),
    'scopedReferences',(select count(*) from technical_document_bindings b
      join product_variants v on v.id=b.product_variant_id join entity_documents e on e.id=b.entity_document_id
      join technical_documents d on d.id=b.technical_document_id
      where v.id=${variant} and v.sku='AF-MIG-TS-9998' and v.public_slug='synthetic-browser-m3-item'
      and not v.is_shadow and v.lifecycle_state='DRAFT' and e.product_variant_id=v.id
      and e.technical_document_id=d.id and e.relationship_role='reference_only'
      and d.publication_status='private' and d.usage_rights_status='needs_confirmation'
      and d.storage_path is null and d.storage_bucket is null and d.public_url is null and d.file_hash is null),
    'lineage',(select count(*) from technical_document_bindings b join technical_document_bindings p
      on p.technical_document_id=b.prior_document_id where b.product_variant_id=${variant}
      and p.product_variant_id=${variant}),
    'originals',(select count(*) from document_upload_intents i join document_upload_completions c on c.intent_id=i.id
      join technical_document_bindings b on b.technical_document_id=i.technical_document_id
      join storage.objects o on o.id=c.storage_object_id where b.product_variant_id=${variant}
      and o.bucket_id='pi-technical-evidence' and o.name=i.storage_path and o.owner_id=i.actor_id::text
      and o.metadata=c.storage_metadata and o.version is not distinct from c.storage_version
      and o.metadata->>'size'=i.manifest->>'byte_size' and o.metadata->>'mimetype'='application/pdf'
      and c.created_by=i.actor_id and c.byte_verification='not_attested'),
    'sources',(select count(*) from document_source_bindings b join document_review_heads h
      on h.technical_document_id=b.technical_document_id where b.product_variant_id=${variant}
      and h.product_variant_id=${variant}),
    'heads',(select count(*) from document_review_heads where product_variant_id=${variant} and revision=5),
    'reviewerDecisions',(select count(*) from document_review_decisions d join verification_events e on e.id=d.event_id
      where d.created_by=${reviewer} and e.actor_id=${reviewer} and e.entity_type='document_review'
      and e.entity_id=d.candidate_id and e.decision=d.decision),
    'observations',(select count(*) from private.pi_document_review_observations o
      join document_review_decisions d on d.event_id=o.event_id and d.candidate_id=o.candidate_id
      join document_review_candidates c on c.id=o.candidate_id
      where o.actor_id=${reviewer} and d.created_by=${reviewer} and d.decision='APPROVE'
      and o.submitted_digest=c.proposal_digest and o.original_digest=c.original_digest
      and o.evidence_digest=c.evidence_digest),
    'history',(select jsonb_agg(jsonb_build_array(c.sequence,s.candidate_id is not null,d.decision,c.verification_status)
      order by c.sequence) from document_review_candidates c left join document_review_submissions s on s.candidate_id=c.id
      left join document_review_decisions d on d.candidate_id=c.id),
    'currentSequence',(select c.sequence from document_review_currents p join document_review_candidates c on c.id=p.candidate_id),
    'rawTokens',(select count(*) from private.pi_command_receipts where strpos(to_jsonb(pi_command_receipts)::text,'document-v1|')>0)
      +(select count(*) from verification_events where strpos(to_jsonb(verification_events)::text,'document-v1|')>0),
    'publications',(select count(*) from publish_records));`;
}

export function assertDocumentLedger(value: unknown) {
  assert.deepEqual(
    value,
    {
      counts: documentLedgerCounts,
      scopedReferences: 2,
      lineage: 1,
      originals: 1,
      sources: 3,
      heads: 1,
      reviewerDecisions: 4,
      observations: 2,
      history: [
        [1, true, "APPROVE", "NEEDS_FACTORY_CONFIRMATION"],
        [2, true, "EDIT", "DATA_CONFLICT"],
        [3, true, "REJECT", "DATA_CONFLICT"],
        [4, true, "APPROVE", "DATA_CONFLICT"],
        [5, true, null, "DATA_CONFLICT"],
      ],
      currentSequence: 4,
      rawTokens: 0,
      publications: 0,
    },
    "Document acceptance requires the exact independent ledger and zero publication.",
  );
}
