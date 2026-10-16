export const DRAFT_LIMITS = {
  name_en: 200,
  name_zh: 200,
  model: 200,
  summary: 1000,
  description: 10000,
  applications: 2000,
} as const;

export type ProductDraftCopy = Record<keyof typeof DRAFT_LIMITS, string>;
export type DraftFieldError = { field: string; code: "required" | "invalid" | "too_long" };
export type DraftValidation =
  | { valid: true; value: ProductDraftCopy }
  | { valid: false; errors: DraftFieldError[] };

export function validateProductDraftCopy(input: unknown): DraftValidation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, errors: [{ field: "form", code: "invalid" }] };
  }
  const values = input as Record<string, unknown>;
  const errors: DraftFieldError[] = [];
  for (const key of Object.keys(values)) {
    if (!Object.hasOwn(DRAFT_LIMITS, key)) errors.push({ field: key, code: "invalid" });
  }
  const result = {} as ProductDraftCopy;
  for (const [field, limit] of Object.entries(DRAFT_LIMITS)) {
    const value = values[field];
    if (!Object.hasOwn(values, field) || typeof value !== "string")
      errors.push({ field, code: "invalid" });
    else if (value.length > limit) errors.push({ field, code: "too_long" });
    else if (field === "name_en" && !value.trim()) errors.push({ field, code: "required" });
    else result[field as keyof ProductDraftCopy] = value.trim();
  }
  return errors.length ? { valid: false, errors } : { valid: true, value: result };
}

export const DRAFT_COMMAND_ERRORS = {
  "42501": "You no longer have permission to save this draft.",
  "22023": "Review the highlighted draft fields.",
  "23505": "That SKU or slug is already in use.",
  "40001": "This record changed. Reload and compare before saving again.",
  "55000": "Draft editing is unavailable for this record.",
} as const;

export function draftCommandError(code: string | undefined): string {
  return code && Object.hasOwn(DRAFT_COMMAND_ERRORS, code)
    ? DRAFT_COMMAND_ERRORS[code as keyof typeof DRAFT_COMMAND_ERRORS]
    : "The draft could not be saved. Your entries have been kept.";
}
