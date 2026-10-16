export const documentUploadPath = "/console/documents/upload";
export const documentUploadBytes = 26_214_400;
export const documentUuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;

export const documentTypes = [
  "catalog",
  "drawing",
  "measurement_record",
  "inspection_record",
  "manual",
  "packaging_record",
  "supplier_record",
  "standard",
  "other",
] as const;
export const documentSources = {
  company_record: { level: "A", label: "Company record / A" },
  official_manufacturer: { level: "B", label: "Official manufacturer / B" },
  technical_standard: { level: "C", label: "Technical standard / C" },
  secondary_reference: { level: "D", label: "Secondary reference / D" },
} as const;
export type DocumentCopy = {
  title: string;
  document_type: (typeof documentTypes)[number];
  source_kind: keyof typeof documentSources;
  source_level: "A" | "B" | "C" | "D";
  owner_name: string;
  source_reference: string;
  source_location: string;
  scope_note: string;
  revision_label: string | null;
  issued_date: string | null;
};
export type DocumentReferenceCommand = {
  action: "document_reference";
  variant_id: string;
  prior_document_id: string | null;
  copy: DocumentCopy;
};
export function validDocumentCopy(value: unknown): value is DocumentCopy {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  const fields = [
    "document_type",
    "issued_date",
    "owner_name",
    "revision_label",
    "scope_note",
    "source_kind",
    "source_level",
    "source_location",
    "source_reference",
    "title",
  ];
  if (Object.keys(row).sort().join("|") !== fields.join("|")) return false;
  for (const field of fields) {
    if (["revision_label", "issued_date"].includes(field) && row[field] === null) continue;
    const text = row[field];
    const limit = field === "title" ? 500 : field === "revision_label" ? 200 : 2000;
    if (
      typeof text !== "string" ||
      !text.trim() ||
      text !== text.trim() ||
      text.length > limit ||
      /[\p{Cc}\p{Cf}]/u.test(text)
    )
      return false;
  }
  if (
    !documentTypes.includes(row.document_type as DocumentCopy["document_type"]) ||
    !Object.hasOwn(documentSources, String(row.source_kind)) ||
    documentSources[row.source_kind as keyof typeof documentSources].level !== row.source_level
  )
    return false;
  if (row.issued_date !== null) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(String(row.issued_date)) ||
      String(row.issued_date).startsWith("0000")
    )
      return false;
    const date = new Date(`${row.issued_date}T00:00:00Z`);
    if (
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== row.issued_date ||
      (row.issued_date as string) > new Date().toISOString().slice(0, 10)
    )
      return false;
  }
  return true;
}

export type DocumentUploadInput = {
  request_id: string;
  completion_id: string;
  document_id: string;
  filename: string;
  byte_size: number;
};
export type DocumentUploadResult =
  | { ok: true; document_id: string; intent_id: string }
  | { ok: false; code: string; message: string };

export function documentUploadFailure(code = "unavailable"): DocumentUploadResult {
  const messages: Record<string, string> = {
    "42501": "Document upload is unavailable for this session or environment.",
    "22023":
      "Select an intact, unencrypted PDF up to 25 MiB and 200 pages, without forms or attachments.",
    "40001":
      "The document reference or upload changed. Keep the original and refresh before retrying.",
    "54000": "The document upload limit has been reached. Keep the original and try again later.",
    unavailable:
      "The stored document could not be confirmed. Retry the unchanged original and reference.",
  };
  const safe = code === "55000" ? "40001" : Object.hasOwn(messages, code) ? code : "unavailable";
  return { ok: false, code: safe, message: messages[safe] };
}

export function parseDocumentUpload(header: string | null): DocumentUploadInput {
  if (!header || header.length > 4096) throw new Error("Invalid document metadata.");
  const value: unknown = JSON.parse(decodeURIComponent(header));
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid document metadata.");
  const row = value as Record<string, unknown>;
  const fields = ["request_id", "completion_id", "document_id", "filename", "byte_size"];
  if (Object.keys(row).length !== fields.length || fields.some((key) => !Object.hasOwn(row, key)))
    throw new Error("Invalid document fields.");
  for (const key of ["request_id", "completion_id", "document_id"])
    if (typeof row[key] !== "string" || !documentUuid.test(row[key]))
      throw new Error("Invalid document identity.");
  if (
    row.request_id === row.completion_id ||
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
    Number(row.byte_size) > documentUploadBytes
  )
    throw new Error("Invalid document file.");
  return row as DocumentUploadInput;
}
