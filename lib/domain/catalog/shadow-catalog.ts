import type { ProductLifecycleState } from "./lifecycle";
import type { SourceLevel, VerificationStatus } from "./verification";

export type Uuid = string;
export type JsonObject = Record<string, unknown>;

export type ShadowSourceFile = {
  path: string;
  sha256: string;
};

export type ShadowCategoryRow = {
  id: Uuid;
  external_key: string;
  slug: string;
  name_en: string;
  name_zh: string | null;
  route_slug: string;
  raw_snapshot: JsonObject;
};

export type ShadowSeriesRow = {
  id: Uuid;
  external_key: string;
  category_id: Uuid;
  name: string;
  slug: string;
  process: string;
  source_type: string;
  source_level: SourceLevel;
  verification_status: VerificationStatus;
  publication_status: string;
  image_evidence_status: string;
  source_reference: string;
  raw_snapshot: JsonObject;
};

export type ShadowProductRow = {
  id: Uuid;
  external_key: string;
  category_id: Uuid;
  name_en: string;
  name_zh: string | null;
  product_type: string;
  source_type: string;
  source_reference: string | null;
  raw_snapshot: JsonObject;
};

export type ShadowVariantRow = {
  id: Uuid;
  product_id: Uuid;
  category_id: Uuid;
  sku: string;
  public_slug: string;
  model: string | null;
  lifecycle_state: ProductLifecycleState;
  is_shadow: true;
  legacy_status: string;
  legacy_data_status: string;
  legacy_image_status: string;
  legacy_compatibility_status: string;
  legacy_oem_status: string;
  raw_snapshot: JsonObject;
};

export type ShadowSeriesComponentRow = {
  id: Uuid;
  external_key: string;
  series_id: Uuid;
  scope: string;
  component_key: string;
  component_name: string;
  variant_key: string;
  variant_label: string;
  lifecycle_status: string;
  target_variant_id: Uuid | null;
  raw_snapshot: JsonObject;
};

export type ShadowTechnicalFieldRow = {
  id: Uuid;
  field_key: string;
  label: string;
  value_type: "text";
  default_unit: string | null;
  applies_to: string[];
};

export type ShadowEvidenceSourceRow = {
  id: Uuid;
  external_key: string;
  source_type: string;
  source_level: SourceLevel | null;
  title: string;
  source_reference: string;
  exact_subject: boolean;
  raw_snapshot: JsonObject;
};

export type ShadowTechnicalValueRow = {
  id: Uuid;
  external_key: string;
  field_definition_id: Uuid;
  product_variant_id: Uuid | null;
  series_component_id: Uuid | null;
  value_text: string;
  unit: string | null;
  variant_label: string | null;
  source_type: string;
  source_level: SourceLevel;
  verification_status: VerificationStatus;
  public_note: string | null;
  confirmation_requirements: string[];
  legacy_reviewed_by: string | null;
  legacy_reviewed_date: string | null;
  raw_snapshot: JsonObject;
};

export type ShadowTechnicalValueEvidenceRow = {
  technical_value_id: Uuid;
  evidence_source_id: Uuid;
  evidence_role: "supporting" | "conflicting";
};

export type ShadowPackagingRow = {
  id: Uuid;
  external_key: string;
  product_variant_id: Uuid;
  package_description: string;
  moq_note: string;
  lead_time_note: string;
  source_level: SourceLevel | null;
  verification_status: VerificationStatus;
  raw_snapshot: JsonObject;
};

export type ShadowCompatibilityEntityRow = {
  id: Uuid;
  external_key: string;
  entity_type: string;
  label: string;
  product_variant_id: Uuid | null;
  product_series_id: Uuid | null;
  raw_snapshot: JsonObject;
};

export type ShadowCompatibilityRelationshipRow = {
  id: Uuid;
  external_key: string;
  subject_entity_id: Uuid;
  target_entity_id: Uuid;
  relationship_type: string;
  role: string;
  relationship_status: string;
  source_type: string;
  source_level: SourceLevel;
  verification_status: VerificationStatus;
  buyer_confirmation_required: boolean;
  confirmation_requirements: string[];
  legacy_reviewed_by: string | null;
  legacy_reviewed_date: string | null;
  raw_snapshot: JsonObject;
};

export type ShadowCompatibilityEvidenceRow = {
  compatibility_relationship_id: Uuid;
  evidence_source_id: Uuid;
  evidence_role: "supporting" | "conflicting";
};

export type ShadowMediaAssetRow = {
  id: Uuid;
  external_key: string;
  storage_bucket: string | null;
  storage_path: string | null;
  public_path: string | null;
  source_kind: string;
  source_reference: string;
  source_file: string | null;
  source_owner: string | null;
  ownership_status: string;
  usage_rights_status: string;
  content_match_status: string;
  publication_status: string;
  legacy_reviewed_by: string | null;
  legacy_reviewed_date: string | null;
  raw_snapshot: JsonObject;
};

export type ShadowProductMediaRow = {
  id: Uuid;
  product_variant_id: Uuid;
  media_asset_id: Uuid;
  role: string;
  sort_order: number;
  alt_text: string;
  raw_snapshot: JsonObject;
};

export type ShadowSeoRow = {
  id: Uuid;
  external_key: string;
  entity_type: "product";
  product_variant_id: Uuid;
  locale: "en";
  search_intent: "commercial_product";
  title: string;
  meta_description: string;
  canonical_path: string;
  publication_status: "shadow";
  raw_snapshot: JsonObject;
};

export type ShadowImportRow = {
  id: Uuid;
  row_number: number;
  source_record_key: string;
  normalized_payload: JsonObject;
  errors: string[];
  warnings: string[];
};

export type ShadowCatalogCounts = {
  products: number;
  activeProducts: number;
  draftProducts: number;
  needsReviewProducts: number;
  categories: number;
  series: number;
  seriesComponents: number;
  seriesComponentCandidates: number;
  seriesComponentFacts: number;
  seriesComponentConflicts: number;
  technicalFacts: number;
  confirmedTechnicalFacts: number;
  compatibilityRelationships: number;
  confirmedCompatibilityRelationships: number;
  mediaAssets: number;
  searchEligibleMediaAssets: number;
};

export type ShadowCatalog = {
  schemaVersion: 1;
  authority: "repository-shadow";
  sourceRevision: string;
  batchId: Uuid;
  sourceFiles: ShadowSourceFile[];
  counts: ShadowCatalogCounts;
  tables: {
    product_categories: ShadowCategoryRow[];
    product_series: ShadowSeriesRow[];
    products: ShadowProductRow[];
    product_variants: ShadowVariantRow[];
    series_components: ShadowSeriesComponentRow[];
    technical_field_definitions: ShadowTechnicalFieldRow[];
    evidence_sources: ShadowEvidenceSourceRow[];
    technical_values: ShadowTechnicalValueRow[];
    technical_value_evidence: ShadowTechnicalValueEvidenceRow[];
    packaging_records: ShadowPackagingRow[];
    compatibility_entities: ShadowCompatibilityEntityRow[];
    compatibility_relationships: ShadowCompatibilityRelationshipRow[];
    compatibility_evidence: ShadowCompatibilityEvidenceRow[];
    media_assets: ShadowMediaAssetRow[];
    product_media: ShadowProductMediaRow[];
    seo_records: ShadowSeoRow[];
    import_rows: ShadowImportRow[];
  };
};
