import { documentUuid, documentUploadBytes } from "./documents.ts";
export const documentInspectionPath = "/console/documents/inspect";
export type DocumentInspectionInput = { variant_id: string; document_id: string };
export type DocumentReviewInspectionInput = {
  candidate_id: string;
  revision: number;
  digest: string;
};
export type DocumentDownload = {
  document_id: string;
  filename: string;
  byte_size: number;
  page_count: number;
};
export type DocumentInspectionFailure = { ok: false; code: string; message: string };
export function documentInspectionFailure(code = "unavailable"): DocumentInspectionFailure {
  const messages: Record<string, string> = {
    "42501": "Document inspection is unavailable for this session or environment.",
    "22023": "Select a recorded document original from the current SKU.",
    "40001": "The document reference or original changed. Refresh before inspecting it again.",
    "54000": "Another original is being processed. Try again after it finishes.",
    unavailable: "The stored PDF could not be checked. No original was released; retry later.",
  };
  const safe = Object.hasOwn(messages, code) ? code : "unavailable";
  return { ok: false, code: safe, message: messages[safe] };
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid document inspection.");
  return value as Record<string, unknown>;
}
export function parseDocumentInspection(
  value: unknown,
): DocumentInspectionInput | DocumentReviewInspectionInput {
  const row = object(value);
  if (Object.keys(row).sort().join(",") === "candidate_id,digest,revision") {
    if (
      typeof row.candidate_id !== "string" ||
      !documentUuid.test(row.candidate_id) ||
      !Number.isSafeInteger(row.revision) ||
      Number(row.revision) < 1 ||
      Number(row.revision) > 999999999999999 ||
      typeof row.digest !== "string" ||
      !/^[a-f0-9]{64}$/.test(row.digest)
    )
      throw new Error("Invalid pending document review.");
    return {
      candidate_id: row.candidate_id.toLowerCase(),
      revision: row.revision as number,
      digest: row.digest,
    };
  }
  if (
    Object.keys(row).sort().join(",") !== "document_id,variant_id" ||
    typeof row.document_id !== "string" ||
    !documentUuid.test(row.document_id) ||
    typeof row.variant_id !== "string" ||
    !documentUuid.test(row.variant_id)
  )
    throw new Error("Invalid document identity.");
  return { document_id: row.document_id, variant_id: row.variant_id };
}
export function parseDocumentDownload(value: unknown): DocumentDownload {
  const row = object(value);
  if (
    Object.keys(row).sort().join(",") !== "byte_size,document_id,filename,page_count" ||
    typeof row.document_id !== "string" ||
    !documentUuid.test(row.document_id) ||
    typeof row.filename !== "string" ||
    !row.filename ||
    row.filename !== row.filename.trim() ||
    row.filename.length > 180 ||
    /[\p{Cc}\p{Cf}/\\:*?"<>|]/u.test(row.filename) ||
    row.filename.startsWith(".") ||
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])\./i.test(row.filename) ||
    !/\.pdf$/i.test(row.filename) ||
    !Number.isSafeInteger(row.byte_size) ||
    Number(row.byte_size) < 1 ||
    Number(row.byte_size) > documentUploadBytes ||
    !Number.isSafeInteger(row.page_count) ||
    Number(row.page_count) < 1 ||
    Number(row.page_count) > 200
  )
    throw new Error("Invalid document download.");
  return row as DocumentDownload;
}
