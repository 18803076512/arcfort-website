export const originalUploadBytes = 26_214_400;
export const originalUploadPath = "/console/originals";
export const originalSourceKinds = [
  "own_photo",
  "supplier_photo",
  "company_catalog",
  "other_reference",
] as const;
export type OriginalUploadInput = {
  request_id: string;
  completion_id: string;
  variant_id: string;
  filename: string;
  byte_size: number;
  source_kind: (typeof originalSourceKinds)[number];
  source_owner: string;
  source_reference: string;
};
export type OriginalUploadResult =
  | { ok: true; asset_id: string; intent_id: string }
  | { ok: false; code: string; message: string };
export const originalUuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export function originalUploadFailure(code = "unavailable"): OriginalUploadResult {
  const messages: Record<string, string> = {
    "42501": "Original upload is unavailable for this session or environment.",
    "22023":
      "Check the source details and select an intact single-image JPG, PNG, WebP or TIFF (up to 25 MiB).",
    "40001":
      "The product or upload changed. Keep the source file and refresh before starting a new intake.",
    "54000": "The upload limit has been reached. Keep the source file and try again later.",
    unavailable:
      "The original could not be confirmed. Retry the unchanged file and source details.",
  };
  const safeCode = Object.hasOwn(messages, code) ? code : "unavailable";
  return { ok: false, code: safeCode, message: messages[safeCode] };
}

export function parseOriginalUpload(header: string | null): OriginalUploadInput {
  if (!header || header.length > 8192) throw new Error("Invalid original metadata.");
  const value: unknown = JSON.parse(decodeURIComponent(header));
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid original metadata.");
  const row = value as Record<string, unknown>;
  const fields = [
    "request_id",
    "completion_id",
    "variant_id",
    "filename",
    "byte_size",
    "source_kind",
    "source_owner",
    "source_reference",
  ];
  if (Object.keys(row).length !== fields.length || fields.some((key) => !Object.hasOwn(row, key)))
    throw new Error("Invalid original metadata.");
  for (const key of ["request_id", "completion_id", "variant_id"]) {
    if (typeof row[key] !== "string" || !originalUuid.test(row[key]))
      throw new Error("Invalid original identity.");
  }
  for (const [key, limit] of [
    ["filename", 180],
    ["source_owner", 300],
    ["source_reference", 1000],
  ] as const) {
    if (
      typeof row[key] !== "string" ||
      !row[key].trim() ||
      row[key] !== row[key].trim() ||
      row[key].length > limit ||
      /[\p{Cc}\p{Cf}]/u.test(row[key])
    )
      throw new Error("Invalid original source.");
  }
  if (
    !originalSourceKinds.includes(row.source_kind as OriginalUploadInput["source_kind"]) ||
    !Number.isSafeInteger(row.byte_size) ||
    Number(row.byte_size) < 1 ||
    Number(row.byte_size) > originalUploadBytes
  )
    throw new Error("Invalid original file.");
  return row as OriginalUploadInput;
}
