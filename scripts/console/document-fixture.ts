import type { DocumentLibraryData, DocumentRow } from "../../lib/console/documents.ts";
export const documentId = (n: number) => `a4000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const documentEnv = {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_DOCUMENTS_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_document",
};
export function documentFixture(
  query: Record<string, string> = {},
  global = false,
): DocumentLibraryData {
  const page = Math.min(10000, Math.max(1, Number(query.page) || 1));
  const total = query.empty ? 0 : query.many ? 27 : 4;
  const items: DocumentRow[] = Array.from(
    { length: total },
    (_, n): DocumentRow => ({
      document_id: documentId(100 + n),
      variant_id: documentId(1),
      sku: "AF-MIG-TEST-9999",
      title: query.long
        ? `Synthetic drawing ${n + 1} ${"TEST-ONLY".repeat(30)}`
        : `Synthetic drawing ${n + 1}`,
      document_type: "drawing",
      source_kind: "company_record",
      source_level: "A",
      owner_name: "Synthetic custodian",
      source_reference: "TEST-ONLY record",
      source_location: "Synthetic page 1",
      scope_note: "Synthetic exact-SKU scope; not evidence",
      revision_label: n ? "TEST-ONLY" : null,
      issued_date: n ? "2026-01-01" : null,
      prior_document_id: n === 3 ? documentId(100) : null,
      created_at: "2026-01-02T00:00:00Z",
      subject_current: query.stale !== "1",
      upload_state: n === 0 ? "missing" : n === 3 ? "recorded" : "pending",
      filename: n ? "synthetic.pdf" : null,
      byte_size: n ? 1024 : null,
      page_count: n ? 1 : null,
      upload_request_id:
        n === 1 && !["viewer", "publisher"].includes(query.role) ? documentId(200) : null,
    }),
  ).slice((page - 1) * 25, page * 25);
  return {
    variantId: global ? null : documentId(1),
    sku: global ? null : "AF-MIG-TEST-9999",
    canWrite: !["viewer", "publisher"].includes(query.role),
    page,
    pageSize: 25,
    total,
    items,
  };
}
