import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { ConsoleReadError } from "./catalog.ts";
import { parseDocumentPage, type DocumentRow } from "./documents.ts";
import { consoleDocumentReviewEnabled } from "./working-config.ts";
import { documentUuid } from "../domain/catalog/documents.ts";
import {
  documentDigest,
  documentRevision,
  documentText,
  validDocumentSource,
  validDocumentReviewCopy,
  type DocumentSourceCopy,
  type DocumentDimension,
} from "../domain/catalog/document-review.ts";

export type DocumentReviewSource = DocumentSourceCopy & {
  source_id: string;
  dimension: DocumentDimension;
  current: boolean;
  qualifies: boolean;
  created_at: string;
};
export type DocumentCandidate = {
  candidate_id: string;
  revision: number;
  digest: string;
  scope_note: string;
  sources: string[];
  original_digest: string;
  evidence_digest: string;
  verification_status: "NEEDS_FACTORY_CONFIRMATION" | "DATA_CONFLICT";
  reason: string;
  created_at: string;
  submitted: boolean;
  decision: "APPROVE" | "EDIT" | "REJECT" | null;
  review_reason: string | null;
  resolution: string | null;
  decided_at: string | null;
  fresh: boolean;
  observed: boolean;
  human_valid: boolean;
};
export type DocumentReviewData = {
  document: DocumentRow;
  revision: number;
  evidenceDigest: string;
  originalCurrent: boolean;
  latest: DocumentCandidate | null;
  current: DocumentCandidate | null;
  sources: { total: number; items: DocumentReviewSource[] };
  selectedSources: DocumentReviewSource[];
  history: { total: number; items: DocumentCandidate[] };
  sourcePage: number;
  historyPage: number;
  canSource: boolean;
  canPropose: boolean;
  canSubmit: boolean;
  canReview: boolean;
  reviewed: boolean;
  open: boolean;
};
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ConsoleReadError();
  return value as Record<string, unknown>;
}
function validId(value: unknown): value is string {
  return typeof value === "string" && documentUuid.test(value);
}
function hash(value: unknown): value is string {
  return typeof value === "string" && documentDigest.test(value);
}
function date(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function candidate(input: unknown): DocumentCandidate | null {
  if (input === null) return null;
  const row = record(input);
  if (
    !validId(row.candidate_id) ||
    !documentRevision(row.revision) ||
    !hash(row.digest) ||
    !hash(row.original_digest) ||
    !hash(row.evidence_digest) ||
    !validDocumentReviewCopy({ scope_note: row.scope_note, sources: row.sources }) ||
    !["NEEDS_FACTORY_CONFIRMATION", "DATA_CONFLICT"].includes(String(row.verification_status)) ||
    !documentText(row.reason) ||
    !date(row.created_at) ||
    typeof row.submitted !== "boolean" ||
    ![null, "APPROVE", "EDIT", "REJECT"].includes(row.decision as string | null) ||
    !["fresh", "observed", "human_valid"].every((key) => typeof row[key] === "boolean")
  )
    throw new ConsoleReadError();
  if (row.decision === null) {
    if (
      row.review_reason !== null ||
      row.resolution !== null ||
      row.decided_at !== null ||
      row.observed ||
      row.human_valid
    )
      throw new ConsoleReadError();
  } else if (
    !row.submitted ||
    !documentText(row.review_reason) ||
    !date(row.decided_at) ||
    !(row.resolution === "" || documentText(row.resolution)) ||
    (row.decision !== "APPROVE" && (row.observed || row.human_valid || row.resolution !== "")) ||
    (row.human_valid && !row.fresh)
  )
    throw new ConsoleReadError();
  return {
    candidate_id: row.candidate_id,
    revision: row.revision,
    digest: row.digest,
    scope_note: row.scope_note as string,
    sources: row.sources as string[],
    original_digest: row.original_digest,
    evidence_digest: row.evidence_digest,
    verification_status: row.verification_status as DocumentCandidate["verification_status"],
    reason: row.reason,
    created_at: row.created_at,
    submitted: row.submitted,
    decision: row.decision as DocumentCandidate["decision"],
    review_reason: row.review_reason as string | null,
    resolution: row.resolution as string | null,
    decided_at: row.decided_at as string | null,
    fresh: row.fresh as boolean,
    observed: row.observed as boolean,
    human_valid: row.human_valid as boolean,
  };
}
function source(input: unknown): DocumentReviewSource {
  const row = record(input);
  const copy = Object.fromEntries(
    [
      "title",
      "source_kind",
      "source_level",
      "evidence_basis",
      "evidence_date",
      "owner_name",
      "revision_label",
      "source_reference",
      "source_location",
      "scope_note",
      "assertion",
    ].map((field) => [field, row[field]]),
  );
  if (
    !validDocumentSource(copy, row.dimension) ||
    !validId(row.source_id) ||
    !date(row.created_at) ||
    typeof row.current !== "boolean" ||
    typeof row.qualifies !== "boolean" ||
    (row.qualifies &&
      (!row.current ||
        copy.source_level !== "A" ||
        copy.assertion !== "supports" ||
        !copy.evidence_date ||
        copy.evidence_basis === "company_catalog"))
  )
    throw new ConsoleReadError();
  return {
    ...copy,
    source_id: row.source_id,
    dimension: row.dimension as DocumentDimension,
    created_at: row.created_at,
    current: row.current,
    qualifies: row.qualifies,
  };
}
function page<T>(
  input: unknown,
  number: number,
  parse: (value: unknown) => T,
  id: (value: T) => string,
) {
  const row = record(input);
  if (
    !Number.isSafeInteger(row.total) ||
    Number(row.total) < 0 ||
    !Array.isArray(row.items) ||
    row.items.length !== Math.max(0, Math.min(25, Number(row.total) - (number - 1) * 25))
  )
    throw new ConsoleReadError();
  const items = row.items.map(parse);
  if (new Set(items.map(id)).size !== items.length) throw new ConsoleReadError();
  return { total: Number(row.total), items };
}
export function parseDocumentReview(
  input: unknown,
  variantId: string,
  documentId: string,
  sourcePage: number,
  historyPage: number,
) {
  if (
    !validId(variantId) ||
    !validId(documentId) ||
    ![sourcePage, historyPage].every((n) => Number.isSafeInteger(n) && n >= 1 && n <= 10000)
  )
    throw new ConsoleReadError();
  const row = record(input);
  const document = parseDocumentPage({ total: 1, items: [row.document] }, 1, variantId).items[0];
  if (
    document.document_id !== documentId ||
    !documentRevision(row.revision, 0) ||
    !hash(row.evidence_digest) ||
    typeof row.original_current !== "boolean" ||
    !Array.isArray(row.selected_sources) ||
    row.selected_sources.length > 40 ||
    (row.original_current && (!document.subject_current || document.upload_state !== "recorded"))
  )
    throw new ConsoleReadError();
  const latest = candidate(row.latest),
    current = candidate(row.current);
  const history = page(
    row.history,
    historyPage,
    (value) => {
      const item = candidate(value);
      if (!item) throw new ConsoleReadError();
      return item;
    },
    (item) => item.candidate_id,
  );
  const sources = page(row.sources, sourcePage, source, (item) => item.source_id);
  const selectedSources = row.selected_sources.map(source);
  const selectedIds = new Set([...(latest?.sources ?? []), ...(current?.sources ?? [])]);
  if (
    (row.revision === 0) !== (latest === null) ||
    (latest && latest.revision !== row.revision) ||
    (latest?.decision === "APPROVE" && current?.candidate_id !== latest.candidate_id) ||
    history.total !== row.revision ||
    (current && (current.decision !== "APPROVE" || current.revision > row.revision)) ||
    selectedSources.length !== selectedIds.size ||
    !selectedSources.every((item) => selectedIds.has(item.source_id)) ||
    new Set(selectedSources.map((item) => item.source_id)).size !== selectedSources.length ||
    sources.total < selectedSources.length
  )
    throw new ConsoleReadError();
  history.items.forEach((item, index) => {
    if (item.revision !== Number(row.revision) - (historyPage - 1) * 25 - index)
      throw new ConsoleReadError();
  });
  const candidates = [...history.items, ...(latest ? [latest] : []), ...(current ? [current] : [])];
  for (const item of candidates) {
    if (item.submitted && item.decision === null && item.candidate_id !== latest?.candidate_id)
      throw new ConsoleReadError();
    if (item.fresh && (!row.original_current || item.evidence_digest !== row.evidence_digest))
      throw new ConsoleReadError();
    for (const duplicate of candidates.filter(
      (other) => other.candidate_id === item.candidate_id || other.revision === item.revision,
    ))
      if (JSON.stringify(duplicate) !== JSON.stringify(item)) throw new ConsoleReadError();
  }
  for (const item of selectedSources) {
    const other = sources.items.find((entry) => entry.source_id === item.source_id);
    if (other && JSON.stringify(other) !== JSON.stringify(item)) throw new ConsoleReadError();
  }
  const open = !!latest && latest.decision === null;
  const reviewed = !!current && current.human_valid && current.observed && current.fresh && !open;
  return {
    document,
    revision: row.revision,
    evidenceDigest: row.evidence_digest,
    originalCurrent: row.original_current,
    latest,
    current,
    sources,
    selectedSources,
    history,
    sourcePage,
    historyPage,
    open,
    reviewed,
  };
}
export async function readDocumentReview(
  client: ConsoleClient,
  variantId: string,
  documentId: string,
  sourcePage: number,
  historyPage: number,
  env: Record<string, string | undefined> = process.env,
): Promise<DocumentReviewData | null> {
  if (
    !consoleDocumentReviewEnabled(env) ||
    !validId(variantId) ||
    !validId(documentId) ||
    ![sourcePage, historyPage].every((n) => Number.isSafeInteger(n) && n >= 1 && n <= 10000)
  )
    throw new ConsoleReadError();
  const access = await checkConsoleAccess(client);
  if (access.status !== "authorized") throw new ConsoleReadError();
  const args = {
    variant_uuid: variantId,
    document_uuid: documentId,
    source_page: sourcePage,
    history_page: historyPage,
  };
  const response = await client.rpc("pi_read_document_review", args);
  if (response.error) throw new ConsoleReadError();
  if (response.data === null) return null;
  const data = parseDocumentReview(response.data, variantId, documentId, sourcePage, historyPage);
  const checked = await client.rpc("pi_read_document_review", args);
  if (
    checked.error ||
    checked.data === null ||
    JSON.stringify(
      parseDocumentReview(checked.data, variantId, documentId, sourcePage, historyPage),
    ) !== JSON.stringify(data)
  )
    throw new ConsoleReadError();
  const current = await checkConsoleAccess(client);
  if (current.status !== "authorized" || current.userId !== access.userId)
    throw new ConsoleReadError();
  return {
    ...data,
    canSource: current.roles.some((r) => ["owner", "editor", "reviewer"].includes(r)),
    canPropose: current.roles.some((r) => ["owner", "editor"].includes(r)),
    canSubmit: current.roles.some((r) => ["owner", "editor", "reviewer"].includes(r)),
    canReview: current.roles.some((r) => ["owner", "reviewer"].includes(r)),
  };
}
