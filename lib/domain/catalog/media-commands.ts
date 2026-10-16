export const mediaMappingRoles = [
  "main",
  "gallery",
  "technical",
  "dimension",
  "packaging",
  "bulk",
  "front",
  "45_degree",
  "thread_detail",
  "hole_detail",
  "surface_detail",
  "application",
] as const;
export type MediaMappingRole = (typeof mediaMappingRoles)[number];
export const MEDIA_SOURCE_FIELDS = [
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
export type MediaSourceCopy = Record<(typeof MEDIA_SOURCE_FIELDS)[number], string>;
export type MediaMappingCopy = { alt_text: string };
export type MediaConfirmation = {
  original_digest: string;
  original_inspected: true;
  usage_rights_confirmed: true;
  exact_product_confirmed: true;
};
export function isMediaCommand(action: string) {
  return ["media_source", "media_propose", "media_submit", "media_review"].includes(action);
}
export type MediaReviewSnapshot = {
  mapping_id: string;
  variant_id: string;
  asset_id: string;
  revision: number;
  digest: string;
  original_digest: string;
  adoption_id: string;
};
