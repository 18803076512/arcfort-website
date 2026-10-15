import type { readReadiness, Filters } from "../../lib/console/catalog.ts";
import type { DocumentReadiness } from "../../lib/domain/catalog/document-readiness.ts";
import { documentId } from "./document-fixture.ts";

export function documentReadinessFixture(state = "unresolved"): DocumentReadiness {
  if (state === "empty")
    return {
      document_count: 0,
      reviewed_document_count: 0,
      unresolved_document_count: 0,
      unavailable_original_count: 0,
      open_document_review_count: 0,
      invalid_document_approval_count: 0,
      document_conflict_count: 0,
    };
  if (state === "reviewed")
    return {
      document_count: 2,
      reviewed_document_count: 2,
      unresolved_document_count: 0,
      unavailable_original_count: 0,
      open_document_review_count: 0,
      invalid_document_approval_count: 0,
      document_conflict_count: 0,
    };
  return {
    document_count: 5,
    reviewed_document_count: 1,
    unresolved_document_count: 4,
    unavailable_original_count: 1,
    open_document_review_count: 2,
    invalid_document_approval_count: 1,
    document_conflict_count: 1,
  };
}
export function readinessFixture(
  filter: Filters,
  enabled = true,
): Awaited<ReturnType<typeof readReadiness>> {
  const items = Array.from({ length: 30 }, (_, n) => {
    const documents = documentReadinessFixture(
      n % 3 === 0 ? "empty" : n % 3 === 1 ? "unresolved" : "reviewed",
    );
    return {
      id: documentId(n + 1),
      sku: `AF-MIG-TEST-${String(n + 1).padStart(4, "0")}`,
      lifecycle_state: "INGESTED" as const,
      is_shadow: false,
      blocker_count: 2 + Number(documents.unresolved_document_count > 0),
      unresolved_technical_count: 1,
      technical_conflict_count: 0,
      eligible_main_image_count: 0,
      approved_seo_count: 0,
      compatibility_conflict_count: 0,
      compatibility_count: 0,
      confirmed_compatibility_count: 0,
      documents: enabled ? documents : null,
      documentReviewAvailable: enabled && n !== 0,
    };
  }).filter(
    (row) =>
      row.sku.includes(filter.q) &&
      (filter.blocker !== "documents" || !!row.documents?.unresolved_document_count),
  );
  return {
    items: items.slice((filter.page - 1) * 25, filter.page * 25),
    total: items.length,
    page: filter.page,
    pageSize: 25,
    documentsEnabled: enabled,
  };
}
