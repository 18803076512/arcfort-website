import { documentFixture, documentId as id } from "./document-fixture.ts";
import {
  parseDocumentReview,
  type DocumentCandidate,
  type DocumentReviewData,
  type DocumentReviewSource,
} from "../../lib/console/document-review.ts";
export const reviewEnv = { CONSOLE_DOCUMENT_REVIEW_ENABLED: "true" };
export function documentReviewRaw(query: Record<string, string> = {}) {
  const document = documentFixture().items[3];
  document.prior_document_id = null;
  const missing = query.state === "missing",
    stale = query.state === "stale",
    unconfirmed = query.state === "unconfirmed";
  if (missing)
    Object.assign(document, {
      upload_state: "missing",
      filename: null,
      byte_size: null,
      page_count: null,
    });
  const sources: DocumentReviewSource[] = Array.from(
    { length: unconfirmed ? 2 : query.many ? 28 : 3 },
    (_, n) => ({
      source_id: id(300 + n),
      dimension: n === 1 ? "exact_scope" : "usage_rights",
      title: query.long
        ? `Synthetic evidence ${n + 1} ${"TESTONLY".repeat(40)}`
        : `Synthetic evidence ${n + 1}`,
      source_kind: "company_record",
      source_level: "A",
      evidence_basis:
        n === 1 ? "controlled_drawing" : n < 2 ? "company_ownership" : "company_catalog",
      evidence_date: n < 2 ? "2026-01-01" : null,
      owner_name: "Synthetic custodian",
      revision_label: null,
      source_reference: "TEST-ONLY reference",
      source_location: "Synthetic page 1",
      scope_note: "Synthetic scope, not real evidence",
      assertion: n < 2 ? "supports" : "contradicts",
      current: !stale && !missing,
      qualifies: n < 2 && !stale && !missing,
      created_at: "2026-01-01T00:00:00Z",
    }),
  );
  const count = missing ? 0 : query.many ? 30 : query.state === "successor" ? 2 : 1;
  const make = (revision: number, approved = false): DocumentCandidate => ({
    candidate_id: id(200 + revision),
    revision,
    digest: "b".repeat(64),
    scope_note: "TEST-ONLY document review",
    sources: [id(300), id(301)],
    original_digest: "a".repeat(64),
    evidence_digest: "c".repeat(64),
    verification_status: unconfirmed ? "NEEDS_FACTORY_CONFIRMATION" : "DATA_CONFLICT",
    reason: "Synthetic proposal",
    created_at: "2026-01-01T00:00:00Z",
    submitted: (query.state !== "draft" && revision === count) || approved,
    decision: approved ? "APPROVE" : null,
    review_reason: approved ? "Synthetic decision" : null,
    resolution: approved ? "Synthetic resolution" : null,
    decided_at: approved ? "2026-01-02T00:00:00Z" : null,
    fresh: !stale && !missing,
    observed: approved && !query.unsigned,
    human_valid: approved && !stale && !missing,
  });
  const candidates = Array.from({ length: count }, (_, index) =>
    make(
      count - index,
      query.state === "approved" || (query.state === "successor" && count - index === 1),
    ),
  );
  const latest = candidates[0] ?? null,
    current = candidates.find((item) => item.decision === "APPROVE") ?? null;
  const sourcePage = Number(query.source_page) || 1,
    historyPage = Number(query.history_page) || 1;
  return {
    document,
    revision: count,
    original_current: !stale && !missing,
    evidence_digest: "c".repeat(64),
    latest,
    current,
    sources: {
      total: missing ? 0 : sources.length,
      items: missing ? [] : sources.slice((sourcePage - 1) * 25, sourcePage * 25),
    },
    selected_sources: missing ? [] : sources.slice(0, 2),
    history: { total: count, items: candidates.slice((historyPage - 1) * 25, historyPage * 25) },
  };
}
export function documentReviewFixture(query: Record<string, string> = {}): DocumentReviewData {
  const role = query.role ?? "owner";
  return {
    ...parseDocumentReview(
      documentReviewRaw(query),
      id(1),
      id(103),
      Number(query.source_page) || 1,
      Number(query.history_page) || 1,
    ),
    canSource: ["owner", "editor", "reviewer"].includes(role),
    canPropose: ["owner", "editor"].includes(role),
    canSubmit: ["owner", "editor", "reviewer"].includes(role),
    canReview: ["owner", "reviewer"].includes(role),
  };
}
