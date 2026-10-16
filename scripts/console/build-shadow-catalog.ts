import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compatibilityRelationships } from "../../lib/data/compatibility-relationships.ts";
import { productImageAssets } from "../../lib/data/product-image-assets.ts";
import { productSeriesComponentFacts } from "../../lib/data/product-series-component-facts.ts";
import { productSeriesEvidence } from "../../lib/data/product-series-evidence.ts";
import { productTechnicalFacts } from "../../lib/data/product-technical-facts.ts";
import { initialShadowLifecycle } from "../../lib/domain/catalog/lifecycle.ts";
import type {
  JsonObject,
  ShadowCatalog,
  ShadowCompatibilityEntityRow,
  ShadowEvidenceSourceRow,
  ShadowSeriesComponentRow,
  Uuid,
} from "../../lib/domain/catalog/shadow-catalog.ts";
import type { SourceLevel } from "../../lib/domain/catalog/verification.ts";
import { splitImageList, validateCsvFile, type ProductImportRow } from "../product-import-utils.ts";

const currentFile = fileURLToPath(import.meta.url);
export const repositoryRoot = path.resolve(path.dirname(currentFile), "..", "..");
export const shadowCatalogPath = path.join(
  repositoryRoot,
  "generated",
  "console",
  "product-intelligence-shadow-v1.json",
);

const sourcePaths = [
  "data/import/products.csv",
  "data/assets/product-image-assets.csv",
  "lib/data/product-series-evidence.ts",
  "lib/data/product-series-component-facts.ts",
  "lib/data/product-technical-facts.ts",
  "lib/data/compatibility-relationships.ts",
] as const;

type CanonicalProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  galleryImages: string[];
  material: string;
  size: string;
  thread: string;
  compatibleBrand: string;
  compatibleModel?: string;
  oemNumber: string;
  weight?: string;
  surfaceTreatment?: string;
  package: string;
  moq: string;
  leadTime: string;
  application: string;
  customAvailable?: string;
  sampleAvailable?: string;
  pdfUrl?: string;
  metaTitle: string;
  metaDescription: string;
  status: "active" | "draft" | "archived";
  dataStatus: "confirmed" | "pending" | "needs_review";
  sourceType: string;
  sourceReference?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  imageStatus: string;
  compatibilityStatus: string;
  oemStatus: string;
  notesInternal?: string;
};

function optional(value: string): string | undefined {
  return value || undefined;
}

function mapCanonicalProduct(row: ProductImportRow): CanonicalProduct {
  return {
    id: row.sku.toLowerCase(),
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    category: row.category,
    categorySlug: row.category_slug,
    shortDescription: row.short_description,
    description: row.description,
    mainImage: row.main_image,
    galleryImages: splitImageList(row.gallery_images),
    material: row.material,
    size: row.size,
    thread: row.thread,
    compatibleBrand: row.compatible_brand,
    compatibleModel: optional(row.compatible_model),
    oemNumber: row.oem_number,
    weight: optional(row.weight),
    surfaceTreatment: optional(row.surface_treatment),
    package: row.package,
    moq: row.moq,
    leadTime: row.lead_time,
    application: row.application,
    customAvailable: optional(row.custom_available),
    sampleAvailable: optional(row.sample_available),
    pdfUrl: optional(row.pdf_url),
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    status: row.status as CanonicalProduct["status"],
    dataStatus: row.data_status as CanonicalProduct["dataStatus"],
    sourceType: row.source_type,
    sourceReference: optional(row.source_reference),
    verifiedBy: optional(row.verified_by),
    verifiedDate: optional(row.verified_date),
    imageStatus: row.image_status,
    compatibilityStatus: row.compatibility_status,
    oemStatus: row.oem_status,
    notesInternal: optional(row.notes_internal),
  };
}

function deterministicUuid(key: string): Uuid {
  const bytes = createHash("sha256").update(`arcfort-product-intelligence-v1:${key}`).digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.subarray(0, 16).toString("hex");

  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)]
    .join("-")
    .toLowerCase();
}

function jsonObject(value: object): JsonObject {
  return JSON.parse(JSON.stringify(value)) as JsonObject;
}

function byKey<T>(selector: (value: T) => string) {
  return (left: T, right: T) => selector(left).localeCompare(selector(right));
}

function getSeriesComponentExternalKey(fact: (typeof productSeriesComponentFacts)[number]): string {
  return [fact.seriesEvidenceId, fact.scope, fact.componentKey, fact.variantKey].join(":");
}

function getComponentLifecycle(
  facts: typeof productSeriesComponentFacts,
): ShadowSeriesComponentRow["lifecycle_status"] {
  if (facts.some((fact) => fact.lifecycleStatus === "blocked")) return "blocked";
  if (facts.some((fact) => fact.lifecycleStatus === "mapped_to_sku")) return "mapped_to_sku";
  if (facts.some((fact) => fact.lifecycleStatus === "ready_for_sku")) return "ready_for_sku";
  return "evidence_only";
}

export async function buildShadowCatalog(): Promise<ShadowCatalog> {
  const productValidation = validateCsvFile(
    path.join(repositoryRoot, "data", "import", "products.csv"),
  );
  if (productValidation.errors.length > 0) {
    throw new Error(
      `Canonical product CSV has ${productValidation.errors.length} blocking validation errors.`,
    );
  }
  const products = productValidation.rows.map(mapCanonicalProduct);

  const sourceFiles = await Promise.all(
    sourcePaths.map(async (relativePath) => {
      const content = await readFile(path.join(repositoryRoot, relativePath));
      return {
        path: relativePath.replaceAll("\\", "/"),
        sha256: createHash("sha256").update(content).digest("hex"),
      };
    }),
  );

  const sourceRevision = createHash("sha256")
    .update(sourceFiles.map((file) => `${file.path}:${file.sha256}`).join("\n"))
    .digest("hex");
  const batchId = deterministicUuid(`shadow-batch:${sourceRevision}`);

  const categoryRows = [
    ...new Map(products.map((product) => [product.categorySlug, product])).values(),
  ]
    .map((product) => ({
      id: deterministicUuid(`category:${product.categorySlug}`),
      external_key: product.categorySlug,
      slug: product.categorySlug,
      name_en: product.category,
      name_zh: null,
      route_slug: product.categorySlug,
      raw_snapshot: {
        legacy_category_name: product.category,
      },
    }))
    .sort(byKey((row) => row.slug));
  const categoryBySlug = new Map(categoryRows.map((row) => [row.slug, row]));

  const seriesRows = productSeriesEvidence
    .map((series) => {
      const category = categoryBySlug.get(series.categorySlug);
      if (!category) {
        throw new Error(`Series ${series.id} references missing category ${series.categorySlug}.`);
      }

      return {
        id: deterministicUuid(`series:${series.id}`),
        external_key: series.id,
        category_id: category.id,
        name: series.name,
        slug: series.seriesSlug,
        process: series.process,
        source_type: series.sourceType,
        source_level: series.sourceLevel,
        verification_status: series.verificationStatus,
        publication_status: series.publicationStatus,
        image_evidence_status: series.imageEvidenceStatus,
        source_reference: series.sourceReference,
        raw_snapshot: {
          public_series_slug: series.publicSeriesSlug ?? null,
          catalog_url: series.catalogUrl,
          pdf_pages: series.pdfPages,
          catalog_pages: series.catalogPages,
          documented_components: series.documentedComponents,
          buyer_check: series.buyerCheck,
          missing_evidence: series.missingEvidence,
          reviewed_by: series.reviewedBy,
          reviewed_date: series.reviewedDate,
        },
      };
    })
    .sort(byKey((row) => row.external_key));
  const seriesByExternalKey = new Map(seriesRows.map((row) => [row.external_key, row]));

  const productRows = products
    .map((product) => {
      const category = categoryBySlug.get(product.categorySlug);
      if (!category)
        throw new Error(`Product ${product.sku} has unknown category ${product.categorySlug}.`);

      return {
        id: deterministicUuid(`product:${product.sku}`),
        external_key: product.sku,
        category_id: category.id,
        name_en: product.name,
        name_zh: null,
        product_type:
          product.categorySlug === "welding-machines" ? "welding-equipment" : "welding-consumable",
        source_type: product.sourceType ?? "unknown",
        source_reference: product.sourceReference ?? null,
        raw_snapshot: {
          short_description: product.shortDescription,
          description: product.description,
          application: product.application,
          notes_internal: product.notesInternal ?? null,
        },
      };
    })
    .sort(byKey((row) => row.external_key));
  const productBySku = new Map(productRows.map((row) => [row.external_key, row]));

  const variantRows = products
    .map((product) => {
      const master = productBySku.get(product.sku);
      const category = categoryBySlug.get(product.categorySlug);
      if (!master || !category) throw new Error(`Missing shadow identity for ${product.sku}.`);

      return {
        id: deterministicUuid(`variant:${product.sku}`),
        product_id: master.id,
        category_id: category.id,
        sku: product.sku,
        public_slug: product.slug,
        model: product.compatibleModel ?? null,
        lifecycle_state: initialShadowLifecycle(),
        is_shadow: true as const,
        legacy_status: product.status ?? "draft",
        legacy_data_status: product.dataStatus ?? "needs_review",
        legacy_image_status: product.imageStatus ?? "needs_photo",
        legacy_compatibility_status: product.compatibilityStatus ?? "unverified",
        legacy_oem_status: product.oemStatus ?? "unknown",
        raw_snapshot: {
          main_image: product.mainImage,
          gallery_images: product.galleryImages,
          material: product.material,
          size: product.size,
          thread: product.thread,
          compatible_brand: product.compatibleBrand,
          compatible_model: product.compatibleModel ?? null,
          oem_number: product.oemNumber,
          weight: product.weight ?? null,
          surface_treatment: product.surfaceTreatment ?? null,
          package: product.package,
          moq: product.moq,
          lead_time: product.leadTime,
          custom_available: product.customAvailable ?? null,
          sample_available: product.sampleAvailable ?? null,
          pdf_url: product.pdfUrl ?? null,
          verified_by: product.verifiedBy ?? null,
          verified_date: product.verifiedDate ?? null,
        },
      };
    })
    .sort(byKey((row) => row.sku));
  const variantBySku = new Map(variantRows.map((row) => [row.sku, row]));
  const variantBySlug = new Map(variantRows.map((row) => [row.public_slug, row]));

  const groupedComponentFacts = new Map<string, typeof productSeriesComponentFacts>();
  for (const fact of productSeriesComponentFacts) {
    const key = getSeriesComponentExternalKey(fact);
    const existing = groupedComponentFacts.get(key) ?? [];
    existing.push(fact);
    groupedComponentFacts.set(key, existing);
  }

  const seriesComponentRows = [...groupedComponentFacts.entries()]
    .map(([externalKey, facts]) => {
      const first = facts[0];
      const series = seriesByExternalKey.get(first.seriesEvidenceId);
      if (!series) throw new Error(`Component ${externalKey} references missing series.`);
      const targetSku = facts.find((fact) => fact.targetSku)?.targetSku;
      const targetVariant = targetSku ? variantBySku.get(targetSku) : undefined;
      if (targetSku && !targetVariant) {
        throw new Error(`Component ${externalKey} references missing target SKU ${targetSku}.`);
      }

      return {
        id: deterministicUuid(`series-component:${externalKey}`),
        external_key: externalKey,
        series_id: series.id,
        scope: first.scope,
        component_key: first.componentKey,
        component_name: first.componentName,
        variant_key: first.variantKey,
        variant_label: first.variantLabel,
        lifecycle_status: getComponentLifecycle(facts),
        target_variant_id: targetVariant?.id ?? null,
        raw_snapshot: {
          fact_ids: facts.map((fact) => fact.factId).sort(),
          catalog_position: first.catalogPosition ?? null,
        },
      };
    })
    .sort(byKey((row) => row.external_key));
  const componentByExternalKey = new Map(seriesComponentRows.map((row) => [row.external_key, row]));

  const fieldRecords = new Map<
    string,
    { label: string; units: Set<string>; appliesTo: Set<string> }
  >();
  for (const fact of productTechnicalFacts) {
    const record = fieldRecords.get(fact.field) ?? {
      label: fact.label,
      units: new Set<string>(),
      appliesTo: new Set<string>(),
    };
    if (fact.unit) record.units.add(fact.unit);
    record.appliesTo.add("product_variant");
    fieldRecords.set(fact.field, record);
  }
  for (const fact of productSeriesComponentFacts) {
    const record = fieldRecords.get(fact.field) ?? {
      label: fact.label,
      units: new Set<string>(),
      appliesTo: new Set<string>(),
    };
    if (fact.referenceUnit) record.units.add(fact.referenceUnit);
    record.appliesTo.add("series_component");
    fieldRecords.set(fact.field, record);
  }

  const technicalFieldRows = [...fieldRecords.entries()]
    .map(([fieldKey, record]) => ({
      id: deterministicUuid(`technical-field:${fieldKey}`),
      field_key: fieldKey,
      label: record.label,
      value_type: "text" as const,
      default_unit: record.units.size === 1 ? [...record.units][0] : null,
      applies_to: [...record.appliesTo].sort(),
    }))
    .sort(byKey((row) => row.field_key));
  const technicalFieldByKey = new Map(technicalFieldRows.map((row) => [row.field_key, row]));

  const evidenceByKey = new Map<string, ShadowEvidenceSourceRow>();
  const addEvidence = (input: {
    sourceType: string;
    sourceLevel: SourceLevel | null;
    sourceReference: string;
    title: string;
    exactSubject: boolean;
    rawSnapshot?: JsonObject;
  }) => {
    const externalKey = createHash("sha256")
      .update(`${input.sourceType}\n${input.sourceReference}`)
      .digest("hex");
    const existing = evidenceByKey.get(externalKey);
    if (existing) return existing;
    const row: ShadowEvidenceSourceRow = {
      id: deterministicUuid(`evidence:${externalKey}`),
      external_key: externalKey,
      source_type: input.sourceType,
      source_level: input.sourceLevel,
      title: input.title,
      source_reference: input.sourceReference,
      exact_subject: input.exactSubject,
      raw_snapshot: input.rawSnapshot ?? {},
    };
    evidenceByKey.set(externalKey, row);
    return row;
  };

  const technicalValueRows: ShadowCatalog["tables"]["technical_values"] = [];
  const technicalEvidenceRows: ShadowCatalog["tables"]["technical_value_evidence"] = [];
  const technicalEvidenceByKey = new Map<
    string,
    ShadowCatalog["tables"]["technical_value_evidence"][number]
  >();
  const addTechnicalEvidence = (
    row: ShadowCatalog["tables"]["technical_value_evidence"][number],
  ) => {
    const key = `${row.technical_value_id}:${row.evidence_source_id}`;
    const existing = technicalEvidenceByKey.get(key);
    if (existing) {
      if (existing.evidence_role !== row.evidence_role) {
        throw new Error(`Technical evidence ${key} has conflicting evidence roles.`);
      }
      return;
    }
    technicalEvidenceByKey.set(key, row);
    technicalEvidenceRows.push(row);
  };

  for (const fact of productTechnicalFacts) {
    const variant = variantBySlug.get(fact.productSlug);
    const field = technicalFieldByKey.get(fact.field);
    if (!variant || !field) throw new Error(`Technical fact ${fact.id} has an invalid subject.`);
    const valueId = deterministicUuid(`technical-value:${fact.id}`);
    const evidence = addEvidence({
      sourceType: fact.sourceType,
      sourceLevel: fact.sourceLevel,
      sourceReference: fact.sourceReference,
      title: `${fact.productSlug} ${fact.label}`,
      exactSubject: fact.verificationStatus === "CONFIRMED",
      rawSnapshot: { evidence_basis: fact.evidenceBasis },
    });

    technicalValueRows.push({
      id: valueId,
      external_key: fact.id,
      field_definition_id: field.id,
      product_variant_id: variant.id,
      series_component_id: null,
      value_text: fact.fieldValue,
      unit: fact.unit ?? null,
      variant_label: fact.variant ?? null,
      source_type: fact.sourceType,
      source_level: fact.sourceLevel,
      verification_status: fact.verificationStatus,
      public_note: fact.publicNote,
      confirmation_requirements: [...fact.confirmationRequirements],
      legacy_reviewed_by: fact.reviewedBy,
      legacy_reviewed_date: fact.lastVerifiedDate,
      raw_snapshot: {
        source_field: fact.sourceField,
        display_order: fact.displayOrder,
        evidence_basis: fact.evidenceBasis,
        notes_internal: fact.notesInternal ?? null,
      },
    });
    addTechnicalEvidence({
      technical_value_id: valueId,
      evidence_source_id: evidence.id,
      evidence_role: fact.verificationStatus === "DATA_CONFLICT" ? "conflicting" : "supporting",
    });
  }

  for (const fact of productSeriesComponentFacts) {
    const component = componentByExternalKey.get(getSeriesComponentExternalKey(fact));
    const field = technicalFieldByKey.get(fact.field);
    if (!component || !field)
      throw new Error(`Component fact ${fact.factId} has an invalid subject.`);
    const valueId = deterministicUuid(`technical-value:${fact.factId}`);
    const evidence = addEvidence({
      sourceType: "company_catalog",
      sourceLevel: fact.sourceLevel,
      sourceReference: fact.sourceReference,
      title: `${fact.seriesEvidenceId} ${fact.label}`,
      exactSubject: fact.verificationStatus === "CONFIRMED",
      rawSnapshot: {},
    });

    technicalValueRows.push({
      id: valueId,
      external_key: fact.factId,
      field_definition_id: field.id,
      product_variant_id: null,
      series_component_id: component.id,
      value_text: fact.referenceValue,
      unit: fact.referenceUnit ?? null,
      variant_label: fact.variantLabel,
      source_type: "official_catalog",
      source_level: fact.sourceLevel,
      verification_status: fact.verificationStatus,
      public_note: null,
      confirmation_requirements: [],
      legacy_reviewed_by: fact.reviewedBy,
      legacy_reviewed_date: fact.reviewedDate,
      raw_snapshot: {
        scope: fact.scope,
        component_key: fact.componentKey,
        catalog_position: fact.catalogPosition ?? null,
        comparison_source_type: fact.comparisonSourceType ?? null,
        comparison_source_reference: fact.comparisonSourceReference ?? null,
        comparison_value: fact.comparisonValue ?? null,
        conflict_note: fact.conflictNote ?? null,
        lifecycle_status: fact.lifecycleStatus,
        target_sku: fact.targetSku ?? null,
        notes_internal: fact.notesInternal ?? null,
      },
    });
    addTechnicalEvidence({
      technical_value_id: valueId,
      evidence_source_id: evidence.id,
      evidence_role: fact.verificationStatus === "DATA_CONFLICT" ? "conflicting" : "supporting",
    });

    if (fact.comparisonSourceReference) {
      const comparisonEvidence = addEvidence({
        sourceType: fact.comparisonSourceType ?? "comparison_source",
        sourceLevel: fact.comparisonSourceType === "official_oem_catalog" ? "B" : null,
        sourceReference: fact.comparisonSourceReference,
        title: `${fact.seriesEvidenceId} comparison for ${fact.label}`,
        exactSubject: false,
        rawSnapshot: {
          comparison_value: fact.comparisonValue ?? null,
          conflict_note: fact.conflictNote ?? null,
        },
      });
      addTechnicalEvidence({
        technical_value_id: valueId,
        evidence_source_id: comparisonEvidence.id,
        evidence_role: "conflicting",
      });
    }
  }

  technicalValueRows.sort(byKey((row) => row.external_key));
  technicalEvidenceRows.sort(byKey((row) => `${row.technical_value_id}:${row.evidence_source_id}`));

  const packagingRows = products
    .map((product) => {
      const variant = variantBySku.get(product.sku);
      if (!variant) throw new Error(`Packaging record has missing variant ${product.sku}.`);
      return {
        id: deterministicUuid(`packaging:${product.sku}`),
        external_key: `packaging:${product.sku}`,
        product_variant_id: variant.id,
        package_description: product.package,
        moq_note: product.moq,
        lead_time_note: product.leadTime,
        source_level: null,
        verification_status: "NEEDS_FACTORY_CONFIRMATION" as const,
        raw_snapshot: {
          custom_available: product.customAvailable ?? null,
          sample_available: product.sampleAvailable ?? null,
        },
      };
    })
    .sort(byKey((row) => row.external_key));

  const compatibilityEntityByKey = new Map<string, ShadowCompatibilityEntityRow>();
  const addCompatibilityEntity = (
    type: string,
    externalKey: string,
  ): ShadowCompatibilityEntityRow => {
    const key = `${type}:${externalKey}`;
    const existing = compatibilityEntityByKey.get(key);
    if (existing) return existing;
    const variant = type === "product" ? variantBySlug.get(externalKey) : undefined;
    const series = type === "series" ? seriesByExternalKey.get(externalKey) : undefined;
    const row: ShadowCompatibilityEntityRow = {
      id: deterministicUuid(`compatibility-entity:${key}`),
      external_key: key,
      entity_type: type,
      label: variant?.sku ?? series?.name ?? externalKey,
      product_variant_id: variant?.id ?? null,
      product_series_id: series?.id ?? null,
      raw_snapshot: {},
    };
    compatibilityEntityByKey.set(key, row);
    return row;
  };

  const compatibilityRelationshipRows: ShadowCatalog["tables"]["compatibility_relationships"] = [];
  const compatibilityEvidenceRows: ShadowCatalog["tables"]["compatibility_evidence"] = [];
  for (const relationship of compatibilityRelationships) {
    const subject = addCompatibilityEntity(relationship.subject.type, relationship.subject.id);
    const target = addCompatibilityEntity(relationship.target.type, relationship.target.id);
    if (relationship.subject.type === "product" && !subject.product_variant_id) {
      throw new Error(`Compatibility ${relationship.id} references missing product subject.`);
    }
    if (relationship.target.type === "series" && !target.product_series_id) {
      throw new Error(`Compatibility ${relationship.id} references missing series target.`);
    }
    const relationId = deterministicUuid(`compatibility:${relationship.id}`);
    const evidence = addEvidence({
      sourceType: relationship.sourceType,
      sourceLevel: relationship.sourceLevel,
      sourceReference: relationship.sourceReference,
      title: `Compatibility evidence for ${relationship.id}`,
      exactSubject: relationship.verificationStatus === "CONFIRMED",
      rawSnapshot: { evidence_basis: relationship.evidenceBasis },
    });

    compatibilityRelationshipRows.push({
      id: relationId,
      external_key: relationship.id,
      subject_entity_id: subject.id,
      target_entity_id: target.id,
      relationship_type: relationship.relationshipType,
      role: relationship.role,
      relationship_status: relationship.relationshipStatus,
      source_type: relationship.sourceType,
      source_level: relationship.sourceLevel,
      verification_status: relationship.verificationStatus,
      buyer_confirmation_required: relationship.buyerConfirmationRequired,
      confirmation_requirements: [...relationship.confirmationRequirements],
      legacy_reviewed_by: relationship.reviewedBy,
      legacy_reviewed_date: relationship.reviewedDate,
      raw_snapshot: {
        evidence_basis: relationship.evidenceBasis,
        notes_internal: relationship.notesInternal ?? null,
      },
    });
    compatibilityEvidenceRows.push({
      compatibility_relationship_id: relationId,
      evidence_source_id: evidence.id,
      evidence_role:
        relationship.verificationStatus === "DATA_CONFLICT" ? "conflicting" : "supporting",
    });
  }

  const compatibilityEntityRows = [...compatibilityEntityByKey.values()].sort(
    byKey((row) => row.external_key),
  );
  compatibilityRelationshipRows.sort(byKey((row) => row.external_key));
  compatibilityEvidenceRows.sort(
    byKey((row) => `${row.compatibility_relationship_id}:${row.evidence_source_id}`),
  );

  const mediaAssetRows = productImageAssets
    .map((asset) => ({
      id: deterministicUuid(`media:${asset.assetId}`),
      external_key: asset.assetId,
      storage_bucket: null,
      storage_path: null,
      public_path: asset.publicPath,
      source_kind: asset.sourceKind,
      source_reference: asset.sourceReference,
      source_file: asset.sourceFile ?? null,
      source_owner: asset.sourceOwner ?? null,
      ownership_status: asset.ownershipStatus,
      usage_rights_status: asset.usageRightsStatus,
      content_match_status: asset.contentMatchStatus,
      publication_status: asset.publicationStatus,
      legacy_reviewed_by: asset.reviewedBy ?? null,
      legacy_reviewed_date: asset.reviewedDate ?? null,
      raw_snapshot: {
        alt_text: asset.altText,
        notes_internal: asset.notesInternal ?? null,
      },
    }))
    .sort(byKey((row) => row.external_key));
  const mediaAssetByKey = new Map(mediaAssetRows.map((row) => [row.external_key, row]));

  const productMediaRows = productImageAssets
    .map((asset, index) => {
      const variant = variantBySku.get(asset.sku);
      const media = mediaAssetByKey.get(asset.assetId);
      if (!variant || !media) throw new Error(`Media ${asset.assetId} has an invalid SKU mapping.`);
      return {
        id: deterministicUuid(`product-media:${asset.assetId}:${asset.sku}`),
        product_variant_id: variant.id,
        media_asset_id: media.id,
        role: asset.role,
        sort_order: index,
        alt_text: asset.altText,
        raw_snapshot: {},
      };
    })
    .sort(
      byKey((row) => `${row.product_variant_id}:${row.sort_order.toString().padStart(4, "0")}`),
    );

  const seoRows = products
    .map((product) => {
      const variant = variantBySku.get(product.sku);
      if (!variant) throw new Error(`SEO record has missing variant ${product.sku}.`);
      return {
        id: deterministicUuid(`seo:${product.sku}:en`),
        external_key: `seo:${product.sku}:en`,
        entity_type: "product" as const,
        product_variant_id: variant.id,
        locale: "en" as const,
        search_intent: "commercial_product" as const,
        title: product.metaTitle,
        meta_description: product.metaDescription,
        canonical_path: `/products/${product.categorySlug}/${product.slug}`,
        publication_status: "shadow" as const,
        raw_snapshot: {},
      };
    })
    .sort(byKey((row) => row.external_key));

  const importRows = products
    .map((product, index) => ({
      id: deterministicUuid(`import-row:${batchId}:${product.sku}`),
      row_number: index + 2,
      source_record_key: product.sku,
      normalized_payload: jsonObject(product),
      errors: [],
      warnings: [
        ...(product.dataStatus === "needs_review" ? ["Product remains needs_review."] : []),
        ...(product.imageStatus === "placeholder" || product.imageStatus === "needs_photo"
          ? ["Product requires reviewed exact imagery."]
          : []),
      ],
    }))
    .sort(byKey((row) => row.source_record_key));

  const evidenceRows = [...evidenceByKey.values()].sort(byKey((row) => row.external_key));

  return {
    schemaVersion: 1,
    authority: "repository-shadow",
    sourceRevision,
    batchId,
    sourceFiles,
    counts: {
      products: products.length,
      activeProducts: products.filter((product) => product.status === "active").length,
      draftProducts: products.filter((product) => product.status === "draft").length,
      needsReviewProducts: products.filter((product) => product.dataStatus === "needs_review")
        .length,
      categories: categoryRows.length,
      series: seriesRows.length,
      seriesComponents: seriesComponentRows.length,
      seriesComponentCandidates: seriesComponentRows.filter(
        (component) => component.scope === "variant",
      ).length,
      seriesComponentFacts: productSeriesComponentFacts.length,
      seriesComponentConflicts: productSeriesComponentFacts.filter(
        (fact) => fact.verificationStatus === "DATA_CONFLICT",
      ).length,
      technicalFacts: productTechnicalFacts.length,
      confirmedTechnicalFacts: productTechnicalFacts.filter(
        (fact) => fact.verificationStatus === "CONFIRMED",
      ).length,
      compatibilityRelationships: compatibilityRelationships.length,
      confirmedCompatibilityRelationships: compatibilityRelationships.filter(
        (relationship) => relationship.verificationStatus === "CONFIRMED",
      ).length,
      mediaAssets: productImageAssets.length,
      searchEligibleMediaAssets: productImageAssets.filter(
        (asset) => asset.publicationStatus === "search_eligible",
      ).length,
    },
    tables: {
      product_categories: categoryRows,
      product_series: seriesRows,
      products: productRows,
      product_variants: variantRows,
      series_components: seriesComponentRows,
      technical_field_definitions: technicalFieldRows,
      evidence_sources: evidenceRows,
      technical_values: technicalValueRows,
      technical_value_evidence: technicalEvidenceRows,
      packaging_records: packagingRows,
      compatibility_entities: compatibilityEntityRows,
      compatibility_relationships: compatibilityRelationshipRows,
      compatibility_evidence: compatibilityEvidenceRows,
      media_assets: mediaAssetRows,
      product_media: productMediaRows,
      seo_records: seoRows,
      import_rows: importRows,
    },
  };
}
