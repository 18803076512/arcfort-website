export const compatibilityRelationshipTypes = [
  "product_to_series",
  "product_to_torch",
  "product_to_machine",
  "product_to_oem_reference",
] as const;
export type CompatibilityRelationshipType = (typeof compatibilityRelationshipTypes)[number];
export type CompatibilityCopy = { role: string; confirmation_requirements: string[] };
export const COMPATIBILITY_SOURCE_FIELDS = [
  "source_kind",
  "source_level",
  "title",
  "source_reference",
  "evidence_basis",
  "evidence_date",
  "owner_name",
  "revision_label",
  "source_location",
  "assertion",
] as const;
export type CompatibilitySourceCopy = Record<(typeof COMPATIBILITY_SOURCE_FIELDS)[number], string>;

export const compatibilityCommandActions = [
  "compatibility_entity",
  "compatibility_source",
  "compatibility_propose",
  "compatibility_submit",
  "compatibility_review",
] as const;

export function isCompatibilityCommand(action: string) {
  return compatibilityCommandActions.some((candidate) => candidate === action);
}
