import { readFile } from "node:fs/promises";

import type { ShadowCatalog } from "../../lib/domain/catalog/shadow-catalog.ts";
import {
  compareShadowTableRows,
  type ShadowParityRow,
} from "../../lib/domain/catalog/shadow-parity.ts";
import { getProductIntelligenceAdminConfig } from "../../lib/supabase/product-intelligence-config.ts";
import { ProductIntelligenceRestClient } from "../../lib/supabase/product-intelligence-rest.ts";
import type {
  ProductIntelligenceRow,
  ProductIntelligenceTableName,
} from "../../lib/supabase/product-intelligence.types.ts";
import { shadowCatalogPath } from "./build-shadow-catalog.ts";

if (!process.argv.includes("--apply")) {
  throw new Error(
    "Shadow database writes require the explicit --apply flag after reviewing the generated snapshot.",
  );
}

const catalog = JSON.parse(await readFile(shadowCatalogPath, "utf8")) as ShadowCatalog;
const config = getProductIntelligenceAdminConfig();
const client = new ProductIntelligenceRestClient(config);
const chunkSize = 100;

async function upsertInChunks<Table extends ProductIntelligenceTableName>(
  table: Table,
  rows: readonly ProductIntelligenceRow<Table>[],
  onConflict: string,
) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    await client.upsert(table, rows.slice(index, index + chunkSize), onConflict);
  }
  console.log(`Shadow upserted ${rows.length} ${table} rows.`);
}

function summarizeDifferences(
  differences: readonly { identifier: string; digest: string }[],
): string {
  if (differences.length === 0) return "none";
  return differences
    .slice(0, 3)
    .map((difference) => `${difference.identifier}@${difference.digest}`)
    .join(", ");
}

async function verifyTableParity<Table extends ProductIntelligenceTableName>(
  table: Table,
  expectedRows: readonly ProductIntelligenceRow<Table>[],
) {
  const actualRows = await client.selectAll(table);
  const parity = compareShadowTableRows(
    expectedRows as readonly ShadowParityRow[],
    actualRows as readonly ShadowParityRow[],
  );
  if (!parity.matches) {
    throw new Error(
      `Exact shadow parity failed for ${table}: expected ${parity.expectedCount}, ` +
        `actual ${parity.actualCount}, missing ${summarizeDifferences(parity.missing)}, ` +
        `unexpected ${summarizeDifferences(parity.unexpected)}.`,
    );
  }
  console.log(
    `Shadow parity verified ${parity.actualCount} ${table} rows across ` +
      `${parity.comparedColumns.length} source columns.`,
  );
}

const batch: ProductIntelligenceRow<"import_batches"> = {
  id: catalog.batchId,
  source_revision: catalog.sourceRevision,
  source_kind: "repository_shadow",
  source_files: catalog.sourceFiles,
  expected_counts: catalog.counts,
  imported_counts: null,
  reconciliation: null,
  status: "IMPORTING",
  is_shadow: true,
  completed_at: null,
  failure_message: null,
};

await upsertInChunks("import_batches", [batch], "source_revision");
try {
  await upsertInChunks("product_categories", catalog.tables.product_categories, "external_key");
  await upsertInChunks("product_series", catalog.tables.product_series, "external_key");
  await upsertInChunks("products", catalog.tables.products, "external_key");
  await upsertInChunks("product_variants", catalog.tables.product_variants, "sku");
  await upsertInChunks("series_components", catalog.tables.series_components, "external_key");
  await upsertInChunks(
    "technical_field_definitions",
    catalog.tables.technical_field_definitions,
    "field_key",
  );
  await upsertInChunks("evidence_sources", catalog.tables.evidence_sources, "external_key");
  await upsertInChunks("technical_values", catalog.tables.technical_values, "external_key");
  await upsertInChunks(
    "technical_value_evidence",
    catalog.tables.technical_value_evidence,
    "technical_value_id,evidence_source_id",
  );
  await upsertInChunks("packaging_records", catalog.tables.packaging_records, "external_key");
  await upsertInChunks(
    "compatibility_entities",
    catalog.tables.compatibility_entities,
    "external_key",
  );
  await upsertInChunks(
    "compatibility_relationships",
    catalog.tables.compatibility_relationships,
    "external_key",
  );
  await upsertInChunks(
    "compatibility_evidence",
    catalog.tables.compatibility_evidence,
    "compatibility_relationship_id,evidence_source_id",
  );
  await upsertInChunks("media_assets", catalog.tables.media_assets, "external_key");
  await upsertInChunks("product_media", catalog.tables.product_media, "id");
  await upsertInChunks("seo_records", catalog.tables.seo_records, "external_key");

  const importRows: ProductIntelligenceRow<"import_rows">[] = catalog.tables.import_rows.map(
    (row) => ({
      ...row,
      import_batch_id: catalog.batchId,
      raw_payload: row.normalized_payload,
    }),
  );
  await upsertInChunks("import_rows", importRows, "id");

  await upsertInChunks(
    "import_batches",
    [
      {
        ...batch,
        status: "IMPORTED",
      },
    ],
    "source_revision",
  );

  const reconciliation = await client.rpc<{
    matches: boolean;
    expected: Record<string, number>;
    actual: Record<string, number>;
    sourceRevision: string;
  }>("pi_reconcile_shadow_batch", { batch_id: catalog.batchId });

  if (!reconciliation.matches) {
    console.error(JSON.stringify(reconciliation, null, 2));
    throw new Error("Remote shadow import count reconciliation failed.");
  }

  await verifyTableParity("product_categories", catalog.tables.product_categories);
  await verifyTableParity("product_series", catalog.tables.product_series);
  await verifyTableParity("products", catalog.tables.products);
  await verifyTableParity("product_variants", catalog.tables.product_variants);
  await verifyTableParity("series_components", catalog.tables.series_components);
  await verifyTableParity(
    "technical_field_definitions",
    catalog.tables.technical_field_definitions,
  );
  await verifyTableParity("evidence_sources", catalog.tables.evidence_sources);
  await verifyTableParity("technical_values", catalog.tables.technical_values);
  await verifyTableParity("technical_value_evidence", catalog.tables.technical_value_evidence);
  await verifyTableParity("packaging_records", catalog.tables.packaging_records);
  await verifyTableParity("compatibility_entities", catalog.tables.compatibility_entities);
  await verifyTableParity(
    "compatibility_relationships",
    catalog.tables.compatibility_relationships,
  );
  await verifyTableParity("compatibility_evidence", catalog.tables.compatibility_evidence);
  await verifyTableParity("media_assets", catalog.tables.media_assets);
  await verifyTableParity("product_media", catalog.tables.product_media);
  await verifyTableParity("seo_records", catalog.tables.seo_records);
  await verifyTableParity("import_rows", importRows);

  const reconciledBatch = await client.selectOne("import_batches", { id: catalog.batchId });
  const batchParity = compareShadowTableRows(
    [
      {
        id: catalog.batchId,
        source_revision: catalog.sourceRevision,
        expected_counts: catalog.counts,
        imported_counts: catalog.counts,
        status: "RECONCILED",
        is_shadow: true,
        failure_message: null,
      },
    ],
    reconciledBatch ? [reconciledBatch as ShadowParityRow] : [],
  );
  if (!batchParity.matches) {
    throw new Error("The import batch did not retain its reconciled source revision and counts.");
  }
} catch (error) {
  try {
    await client.update(
      "import_batches",
      {
        status: "FAILED",
        completed_at: new Date().toISOString(),
        failure_message: "Shadow import failed before exact reconciliation completed.",
      },
      { id: catalog.batchId },
    );
  } catch {
    console.error("The shadow import failed and its batch status could not be updated.");
  }
  throw error;
}

console.log(
  `Shadow import count and exact-row parity reconciled in ${config.environment}: ` +
    `${catalog.sourceRevision.slice(0, 12)}.`,
);
