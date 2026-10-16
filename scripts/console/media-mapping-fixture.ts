import type {
  MediaMappingData,
  MediaMappingFact,
  MediaMappingHistory,
} from "../../lib/console/media-mapping.ts";

const uuid = (value: number) => `10000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
export const mediaMappingIds = {
  variant: uuid(1),
  head: uuid(2),
  mapping: uuid(3),
  asset: uuid(4),
  intent: uuid(5),
  rights: uuid(6),
  match: uuid(7),
  contradiction: uuid(8),
  actor: uuid(9),
  adoption: uuid(10),
  event: uuid(11),
  key: uuid(12),
  nonce: uuid(13),
};
export function mediaMappingFixture(query: Record<string, string> = {}, byteSize = 120) {
  const id = mediaMappingIds;
  const state = query.state ?? "pending";
  const fact: MediaMappingFact = {
    id: id.mapping,
    assetId: id.asset,
    originalIntentId: id.intent,
    altText: "Synthetic test-only original",
    revision: 2,
    state,
    status: query.conflict === "1" ? "DATA_CONFLICT" : "NEEDS_FACTORY_CONFIRMATION",
    digest: "a".repeat(64),
    originalDigest: "b".repeat(64),
    reason: "Synthetic proposal reason",
    sourceIds: [id.rights, id.match],
    valid: false,
    observed: false,
  };
  const data: MediaMappingData = {
    variantId: id.variant,
    sku: "AF-MIG-QA-9999",
    canPropose: !["viewer", "publisher", "reviewer"].includes(query.role),
    canSubmit: !["viewer", "publisher"].includes(query.role),
    canReview: !["viewer", "publisher", "editor"].includes(query.role),
    originals:
      query.empty === "1"
        ? []
        : [
            {
              intent_id: id.intent,
              asset_id: id.asset,
              filename:
                query.long === "1"
                  ? `${"synthetic-evidence-".repeat(14)}.png`
                  : "synthetic-review-original.png",
              byte_size: byteSize,
              mime_type: "image/png",
              width: 320,
              height: 240,
              source_kind: "other_reference",
              source_owner: "Synthetic custodian",
              source_reference: "QA-ONLY / not real product evidence",
              created_at: "2026-10-04T00:00:00Z",
              completed: true,
              subject_current: query.stale !== "1",
              total_count: 1,
            },
          ],
    sources: [
      {
        id: id.rights,
        assetId: id.asset,
        role: "main",
        dimension: "usage_rights",
        title: "Synthetic ownership record",
        reference: "QA-RIGHTS-ONLY",
        level: query.reference === "1" ? "B" : "A",
        assertion: "supports",
        basis: "company_ownership",
        version: "QA-1",
        location: "Record 1",
        date: "2026-10-01",
        owner: "Synthetic custodian",
      },
      {
        id: id.match,
        assetId: id.asset,
        role: "main",
        dimension: "product_match",
        title: "Synthetic SKU label",
        reference: "QA-MATCH-ONLY",
        level: "A",
        assertion: "supports",
        basis: "sku_label",
        version: "QA-1",
        location: "Label 1",
        date: "2026-10-01",
        owner: "Synthetic custodian",
      },
      ...(query.conflict === "1"
        ? [
            {
              id: id.contradiction,
              assetId: id.asset,
              role: "main" as const,
              dimension: "product_match" as const,
              title: "Synthetic unselected contradiction",
              reference: "QA-CONFLICT-ONLY",
              level: "A",
              assertion: "contradicts",
              basis: "inspection_record",
              version: "QA-2",
              location: "Record 2",
              date: "2026-10-02",
              owner: "Synthetic custodian",
            },
          ]
        : []),
    ],
    scopes:
      query.new === "1" || query.empty === "1"
        ? []
        : [
            {
              id: id.head,
              role: "main",
              slot: 0,
              revision: 2,
              candidate: state === "approved" || state === "rejected" ? null : fact,
              current:
                query.current === "1" || state === "approved"
                  ? {
                      ...fact,
                      state: "approved",
                      status: query.invalid === "1" ? "DATA_CONFLICT" : "CONFIRMED",
                      valid: query.invalid !== "1",
                      observed: query.observed === "1",
                    }
                  : null,
            },
          ],
    legacy: [
      {
        id: uuid(14),
        assetId: uuid(15),
        role: "main",
        slot: 0,
        altText: "Synthetic retained catalog reference",
        publicationReady: false,
      },
    ],
  };
  const history: MediaMappingHistory = {
    total: 26,
    page: 1,
    pageSize: 25,
    items: [
      {
        id: id.mapping,
        revision: 2,
        assetId: id.asset,
        altText: fact.altText,
        state,
        status: fact.status,
        reason: fact.reason,
        createdAt: "2026-10-04T00:00:00Z",
        decision: null,
        reviewReason: null,
        resolution: null,
        sourceIds: fact.sourceIds,
      },
    ],
  };
  return {
    data,
    selectedId: data.scopes[0]?.id ?? "",
    history: data.scopes.length ? history : null,
  };
}
