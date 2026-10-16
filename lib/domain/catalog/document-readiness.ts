export const documentReadinessColumns =
  "document_count,reviewed_document_count,unresolved_document_count,unavailable_original_count,open_document_review_count,invalid_document_approval_count,document_conflict_count" as const;

export type DocumentReadiness = {
  document_count: number;
  reviewed_document_count: number;
  unresolved_document_count: number;
  unavailable_original_count: number;
  open_document_review_count: number;
  invalid_document_approval_count: number;
  document_conflict_count: number;
};

export function parseDocumentReadiness(value: unknown): DocumentReadiness | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const entries = documentReadinessColumns.split(",").map((key) => [key, row[key]] as const);
  if (
    entries.some(
      ([, count]) =>
        !Number.isSafeInteger(count) || Number(count) < 0 || Number(count) > 2147483647,
    )
  )
    return null;
  const counts = Object.fromEntries(entries) as DocumentReadiness;
  if (counts.reviewed_document_count + counts.unresolved_document_count !== counts.document_count)
    return null;
  if (
    [
      counts.unavailable_original_count,
      counts.open_document_review_count,
      counts.invalid_document_approval_count,
      counts.document_conflict_count,
    ].some((count) => count > counts.unresolved_document_count)
  )
    return null;
  return counts;
}
