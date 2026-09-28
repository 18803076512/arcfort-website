import type {
  ShadowCategoryRow,
  ShadowCompatibilityEntityRow,
  ShadowCompatibilityEvidenceRow,
  ShadowCompatibilityRelationshipRow,
  ShadowEvidenceSourceRow,
  ShadowMediaAssetRow,
  ShadowPackagingRow,
  ShadowProductMediaRow,
  ShadowProductRow,
  ShadowSeoRow,
  ShadowSeriesComponentRow,
  ShadowSeriesRow,
  ShadowTechnicalFieldRow,
  ShadowTechnicalValueEvidenceRow,
  ShadowTechnicalValueRow,
  ShadowVariantRow,
  Uuid,
} from "../domain/catalog/shadow-catalog";

export type ProductIntelligenceImportBatchRow = {
  id: Uuid;
  source_revision: string;
  source_kind: "repository_shadow";
  source_files: unknown;
  expected_counts: unknown;
  imported_counts?: unknown;
  reconciliation?: unknown;
  status: "PREPARED" | "IMPORTING" | "IMPORTED" | "RECONCILED" | "FAILED";
  is_shadow: true;
  completed_at?: string | null;
  failure_message?: string | null;
};

export type ProductIntelligenceImportRow = {
  id: Uuid;
  import_batch_id: Uuid;
  row_number: number;
  source_record_key: string;
  raw_payload: Record<string, unknown>;
  normalized_payload: Record<string, unknown>;
  errors: string[];
  warnings: string[];
};

export type ProductIntelligenceTableRows = {
  product_categories: ShadowCategoryRow;
  product_series: ShadowSeriesRow;
  products: ShadowProductRow;
  product_variants: ShadowVariantRow;
  series_components: ShadowSeriesComponentRow;
  technical_field_definitions: ShadowTechnicalFieldRow;
  evidence_sources: ShadowEvidenceSourceRow;
  technical_values: ShadowTechnicalValueRow;
  technical_value_evidence: ShadowTechnicalValueEvidenceRow;
  packaging_records: ShadowPackagingRow;
  compatibility_entities: ShadowCompatibilityEntityRow;
  compatibility_relationships: ShadowCompatibilityRelationshipRow;
  compatibility_evidence: ShadowCompatibilityEvidenceRow;
  media_assets: ShadowMediaAssetRow;
  product_media: ShadowProductMediaRow;
  seo_records: ShadowSeoRow;
  import_batches: ProductIntelligenceImportBatchRow;
  import_rows: ProductIntelligenceImportRow;
};

export type ProductIntelligenceTableName = keyof ProductIntelligenceTableRows;
export type ProductIntelligenceRow<Table extends ProductIntelligenceTableName> =
  ProductIntelligenceTableRows[Table];

export const PRODUCT_INTELLIGENCE_TABLES = [
  "product_categories",
  "product_series",
  "products",
  "product_variants",
  "series_components",
  "technical_field_definitions",
  "evidence_sources",
  "technical_values",
  "technical_value_evidence",
  "packaging_records",
  "compatibility_entities",
  "compatibility_relationships",
  "compatibility_evidence",
  "media_assets",
  "product_media",
  "seo_records",
  "import_batches",
  "import_rows",
] as const satisfies readonly ProductIntelligenceTableName[];
