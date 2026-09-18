import { readFile } from "node:fs/promises";

import type { ShadowCatalog } from "../../lib/domain/catalog/shadow-catalog.ts";
import { buildShadowCatalog, shadowCatalogPath } from "./build-shadow-catalog.ts";

const errors: string[] = [];
const expected = await buildShadowCatalog();
let committed: ShadowCatalog | null = null;

try {
  committed = JSON.parse(await readFile(shadowCatalogPath, "utf8")) as ShadowCatalog;
} catch (error) {
  errors.push(
    `Cannot read committed shadow catalog: ${error instanceof Error ? error.message : String(error)}`,
  );
}

function assertUnique(values: string[], label: string) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length > 0) {
    errors.push(`${label} contains duplicates: ${[...new Set(duplicates)].join(", ")}`);
  }
}

assertUnique(
  expected.tables.products.map((row) => row.external_key),
  "Product external keys",
);
assertUnique(
  expected.tables.product_variants.map((row) => row.sku),
  "Product SKUs",
);
assertUnique(
  expected.tables.product_variants.map((row) => row.public_slug),
  "Product slugs",
);
assertUnique(
  expected.tables.product_series.map((row) => row.external_key),
  "Series external keys",
);
assertUnique(
  expected.tables.series_components.map((row) => row.external_key),
  "Series component external keys",
);
assertUnique(
  expected.tables.technical_values.map((row) => row.external_key),
  "Technical value external keys",
);
assertUnique(
  expected.tables.technical_value_evidence.map(
    (row) => `${row.technical_value_id}:${row.evidence_source_id}`,
  ),
  "Technical evidence links",
);
assertUnique(
  expected.tables.media_assets.map((row) => row.external_key),
  "Media asset keys",
);
assertUnique(
  expected.tables.seo_records.map((row) => row.external_key),
  "SEO record external keys",
);

if (expected.tables.product_variants.some((row) => row.lifecycle_state !== "INGESTED")) {
  errors.push("A shadow-imported product variant was assigned a lifecycle above INGESTED.");
}

if (expected.tables.product_variants.some((row) => !row.is_shadow)) {
  errors.push("Every Milestone 1 imported variant must remain a shadow record.");
}

if (expected.counts.confirmedTechnicalFacts !== 0) {
  errors.push("The current repository baseline unexpectedly contains confirmed technical facts.");
}

if (expected.counts.confirmedCompatibilityRelationships !== 0) {
  errors.push("The current repository baseline unexpectedly contains confirmed compatibility.");
}

if (expected.counts.searchEligibleMediaAssets !== 0) {
  errors.push("The current repository baseline unexpectedly contains search-eligible media.");
}

const variantIds = new Set(expected.tables.product_variants.map((row) => row.id));
const seriesIds = new Set(expected.tables.product_series.map((row) => row.id));
const componentIds = new Set(expected.tables.series_components.map((row) => row.id));
const evidenceIds = new Set(expected.tables.evidence_sources.map((row) => row.id));
const technicalValueIds = new Set(expected.tables.technical_values.map((row) => row.id));
const compatibilityEntityIds = new Set(expected.tables.compatibility_entities.map((row) => row.id));
const compatibilityIds = new Set(expected.tables.compatibility_relationships.map((row) => row.id));

for (const row of expected.tables.technical_values) {
  const subjectCount =
    Number(Boolean(row.product_variant_id)) + Number(Boolean(row.series_component_id));
  if (subjectCount !== 1)
    errors.push(`Technical value ${row.external_key} has an invalid subject.`);
  if (row.product_variant_id && !variantIds.has(row.product_variant_id)) {
    errors.push(`Technical value ${row.external_key} references a missing variant.`);
  }
  if (row.series_component_id && !componentIds.has(row.series_component_id)) {
    errors.push(`Technical value ${row.external_key} references a missing component.`);
  }
}

for (const row of expected.tables.technical_value_evidence) {
  if (!technicalValueIds.has(row.technical_value_id) || !evidenceIds.has(row.evidence_source_id)) {
    errors.push("A technical evidence link references a missing record.");
  }
}

for (const row of expected.tables.compatibility_entities) {
  if (row.product_variant_id && !variantIds.has(row.product_variant_id)) {
    errors.push(`Compatibility entity ${row.external_key} references a missing variant.`);
  }
  if (row.product_series_id && !seriesIds.has(row.product_series_id)) {
    errors.push(`Compatibility entity ${row.external_key} references a missing series.`);
  }
}

for (const row of expected.tables.compatibility_relationships) {
  if (
    !compatibilityEntityIds.has(row.subject_entity_id) ||
    !compatibilityEntityIds.has(row.target_entity_id)
  ) {
    errors.push(`Compatibility relationship ${row.external_key} has a missing endpoint.`);
  }
}

for (const row of expected.tables.compatibility_evidence) {
  if (
    !compatibilityIds.has(row.compatibility_relationship_id) ||
    !evidenceIds.has(row.evidence_source_id)
  ) {
    errors.push("A compatibility evidence link references a missing record.");
  }
}

for (const row of expected.tables.seo_records) {
  if (row.entity_type !== "product" || !variantIds.has(row.product_variant_id)) {
    errors.push(`SEO record ${row.external_key} has an invalid product subject.`);
  }
}

if (committed && JSON.stringify(committed) !== JSON.stringify(expected)) {
  errors.push(
    "Committed shadow catalog is stale. Run the shadow generation command and review the diff.",
  );
}

if (errors.length > 0) {
  console.error("Product Intelligence shadow validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Product Intelligence shadow validation passed.");
  console.log(JSON.stringify(expected.counts, null, 2));
  console.log(`Source revision: ${expected.sourceRevision}`);
}
