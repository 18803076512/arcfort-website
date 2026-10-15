import { documentSources, documentUuid } from "./documents.ts";

export const documentDimensions = ["usage_rights", "exact_scope"] as const;
export type DocumentDimension = (typeof documentDimensions)[number];
export const documentEvidenceBases = {
  usage_rights: [
    "company_ownership",
    "supplier_authorization",
    "license_record",
    "company_catalog",
  ],
  exact_scope: [
    "controlled_drawing",
    "approved_sample",
    "inspection_record",
    "sku_record",
    "company_catalog",
  ],
} as const;
export type DocumentSourceCopy = {
  title: string;
  source_kind: keyof typeof documentSources;
  source_level: "A" | "B" | "C" | "D";
  evidence_basis: string;
  evidence_date: string | null;
  owner_name: string;
  revision_label: string | null;
  source_reference: string;
  source_location: string;
  scope_note: string;
  assertion: "supports" | "contradicts" | "reference_only";
};
export type DocumentReviewCopy = { scope_note: string; sources: string[] };
export type DocumentConfirmation = {
  original_digest: string;
  original_inspected: true;
  usage_rights_confirmed: true;
  exact_scope_confirmed: true;
};
type Target = { candidate_id: string; revision: number; digest: string };
export type DocumentReviewCommand =
  | {
      action: "document_source";
      variant_id: string;
      document_id: string;
      dimension: DocumentDimension;
      source: DocumentSourceCopy;
    }
  | {
      action: "document_propose";
      variant_id: string;
      document_id: string;
      revision: number;
      copy: DocumentReviewCopy;
      reason: string;
    }
  | (Target & { action: "document_submit" })
  | (Target & {
      action: "document_review";
      decision: "APPROVE" | "EDIT" | "REJECT";
      reason: string;
      resolution: string;
      confirmation: DocumentConfirmation | null;
      rights_source_id: string | null;
      scope_source_id: string | null;
      observation: string | null;
      replacement: DocumentReviewCopy | null;
    });

export const documentDigest = /^[a-f0-9]{64}$/;
export function isDocumentReviewCommand(action: unknown) {
  return ["document_source", "document_propose", "document_submit", "document_review"].includes(
    String(action),
  );
}
export function documentText(value: unknown, max = 2000): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= max &&
    value === value.trim() &&
    !/[\p{Cc}\p{Cf}]/u.test(value)
  );
}
function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, fields: string[]) {
  return Object.keys(value).sort().join("|") === [...fields].sort().join("|");
}
function uuid(value: unknown): value is string {
  return typeof value === "string" && documentUuid.test(value);
}
function digest(value: unknown): value is string {
  return typeof value === "string" && documentDigest.test(value);
}
export function documentRevision(value: unknown, minimum = 1): value is number {
  return (
    Number.isSafeInteger(value) && Number(value) >= minimum && Number(value) <= 999999999999999
  );
}
export function validDocumentSource(
  value: unknown,
  dimension: unknown,
): value is DocumentSourceCopy {
  if (
    !object(value) ||
    !documentDimensions.includes(dimension as DocumentDimension) ||
    !exact(value, [
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
    ])
  )
    return false;
  for (const [field, item] of Object.entries(value)) {
    if (["evidence_date", "revision_label"].includes(field) && item === null) continue;
    if (!documentText(item, field === "title" ? 500 : field === "revision_label" ? 200 : 2000))
      return false;
  }
  if (
    !Object.hasOwn(documentSources, String(value.source_kind)) ||
    documentSources[value.source_kind as keyof typeof documentSources].level !==
      value.source_level ||
    !["supports", "contradicts", "reference_only"].includes(String(value.assertion))
  )
    return false;
  const bases: readonly string[] =
    value.source_kind === "company_record"
      ? documentEvidenceBases[dimension as DocumentDimension]
      : value.source_kind === "official_manufacturer"
        ? ["manufacturer_catalog"]
        : value.source_kind === "technical_standard"
          ? ["standard_reference"]
          : ["secondary_reference"];
  if (!bases.includes(String(value.evidence_basis))) return false;
  if (value.evidence_date !== null) {
    const date = String(value.evidence_date);
    const parsed = new Date(`${date}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      date.startsWith("0000") ||
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date ||
      date > new Date().toISOString().slice(0, 10)
    )
      return false;
  }
  return true;
}
export function validDocumentReviewCopy(value: unknown): value is DocumentReviewCopy {
  return (
    object(value) &&
    exact(value, ["scope_note", "sources"]) &&
    documentText(value.scope_note) &&
    Array.isArray(value.sources) &&
    value.sources.length <= 20 &&
    value.sources.every(uuid) &&
    new Set(value.sources).size === value.sources.length
  );
}
// Structural validation only. The server/database own authenticity, access and expiry checks.
export function documentObservationParts(value: unknown): string[] | null {
  if (typeof value !== "string" || value.length > 1200) return null;
  const parts = value.split("|");
  if (
    parts.length !== 15 ||
    parts[0] !== "document-v1" ||
    ![1, 2, 3, 4, 5, 6, 13].every((i) => uuid(parts[i])) ||
    ![8, 9, 10, 14].every((i) => digest(parts[i])) ||
    !/^[1-9][0-9]{0,14}$/.test(parts[7]) ||
    ![11, 12].every((i) => /^[1-9][0-9]{0,9}$/.test(parts[i])) ||
    Number(parts[12]) <= Number(parts[11]) ||
    Number(parts[12]) - Number(parts[11]) > 300
  )
    return null;
  return parts;
}
export function validDocumentReviewCommand(value: Record<string, unknown>) {
  const base = ["action", "request_id"];
  if (value.action === "document_source")
    return (
      exact(value, [...base, "variant_id", "document_id", "dimension", "source"]) &&
      uuid(value.variant_id) &&
      uuid(value.document_id) &&
      validDocumentSource(value.source, value.dimension)
    );
  if (value.action === "document_propose")
    return (
      exact(value, [...base, "variant_id", "document_id", "revision", "copy", "reason"]) &&
      uuid(value.variant_id) &&
      uuid(value.document_id) &&
      documentRevision(value.revision, 0) &&
      validDocumentReviewCopy(value.copy) &&
      documentText(value.reason) &&
      value.reason.replace(/\s/g, "").length >= 3
    );
  if (!uuid(value.candidate_id) || !documentRevision(value.revision) || !digest(value.digest))
    return false;
  if (value.action === "document_submit")
    return exact(value, [...base, "candidate_id", "revision", "digest"]);
  if (
    value.action !== "document_review" ||
    !exact(value, [
      ...base,
      "candidate_id",
      "revision",
      "digest",
      "decision",
      "reason",
      "resolution",
      "confirmation",
      "rights_source_id",
      "scope_source_id",
      "observation",
      "replacement",
    ]) ||
    !documentText(value.reason) ||
    value.reason.replace(/\s/g, "").length < 3
  )
    return false;
  if (value.decision === "APPROVE") {
    const confirmation = value.confirmation;
    const parts = documentObservationParts(value.observation);
    return (
      object(confirmation) &&
      exact(confirmation, [
        "original_digest",
        "original_inspected",
        "usage_rights_confirmed",
        "exact_scope_confirmed",
      ]) &&
      digest(confirmation.original_digest) &&
      confirmation.original_inspected === true &&
      confirmation.usage_rights_confirmed === true &&
      confirmation.exact_scope_confirmed === true &&
      uuid(value.rights_source_id) &&
      uuid(value.scope_source_id) &&
      value.rights_source_id !== value.scope_source_id &&
      value.replacement === null &&
      (value.resolution === "" || documentText(value.resolution)) &&
      !!parts &&
      parts[4] === value.candidate_id &&
      parts[7] === String(value.revision) &&
      parts[8] === value.digest &&
      parts[9] === confirmation.original_digest
    );
  }
  return (
    ["EDIT", "REJECT"].includes(String(value.decision)) &&
    value.confirmation === null &&
    value.rights_source_id === null &&
    value.scope_source_id === null &&
    value.observation === null &&
    value.resolution === "" &&
    (value.decision === "EDIT"
      ? validDocumentReviewCopy(value.replacement)
      : value.replacement === null)
  );
}
