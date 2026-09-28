#!/usr/bin/env node

import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import {
  imageAssetRegistryPath,
  validateProductImageAssets,
  type ProductImageAssetCsvRow,
} from "./product-image-asset-utils.ts";

const outputPath = path.join(process.cwd(), "docs", "product-image-asset-report.md");
const productImageDirectory = path.join(process.cwd(), "public", "images", "products");

function countBy(rows: ProductImageAssetCsvRow[], field: keyof ProductImageAssetCsvRow) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const value = row[field] || "(blank)";
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function formatCounts(title: string, counts: Record<string, number>) {
  return [
    `### ${title}`,
    "",
    "| State | Assets |",
    "| --- | ---: |",
    ...Object.entries(counts)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([state, count]) => `| ${state} | ${count} |`),
  ].join("\n");
}

function formatAssetTable(
  rows: ProductImageAssetCsvRow[],
  note: (row: ProductImageAssetCsvRow) => string,
) {
  if (rows.length === 0) return "No assets in this state.";

  return [
    "| SKU | Product slug | Role | Public path | Required action |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| ${row.sku} | ${row.product_slug} | ${row.role} | \`${row.public_path}\` | ${note(row)} |`,
    ),
  ].join("\n");
}

function listProductImageFiles() {
  return readdirSync(productImageDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:jpe?g|png|webp|avif)$/i.test(entry.name))
    .map((entry) => `/images/products/${entry.name}`)
    .sort();
}

const result = validateProductImageAssets();

if (result.errors.length > 0) {
  console.error("Image asset report stopped because the registry has validation errors.");
  result.errors.forEach((issue) => console.error(`- ${issue.message}`));
  process.exit(1);
}

const rows = result.rows;
const existingRows = rows.filter((row) => result.inspections.get(row.public_path)?.exists);
const blockedRows = rows.filter((row) => row.publication_status === "blocked");
const unknownSourceRows = rows.filter((row) => row.source_kind === "unknown");
const rightsReviewRows = rows.filter((row) => row.usage_rights_status !== "approved");
const exactProductRows = rows.filter((row) => row.content_match_status === "exact_product");
const companyOwnedRows = rows.filter((row) => row.source_kind === "company_owned_photo");
const lowResolutionRows = rows.filter((row) => {
  const inspection = result.inspections.get(row.public_path);
  return (
    inspection?.exists &&
    inspection.width !== undefined &&
    inspection.height !== undefined &&
    (inspection.width < 1000 || inspection.height < 1000)
  );
});
const veryLowResolutionRows = lowResolutionRows.filter((row) => {
  const inspection = result.inspections.get(row.public_path)!;
  return inspection.width! < 600 || inspection.height! < 600;
});
const formatMismatchRows = rows.filter((row) => {
  const inspection = result.inspections.get(row.public_path);
  const extension = path.extname(row.public_path).toLowerCase();
  const extensionFormat =
    extension === ".png" ? "png" : [".jpg", ".jpeg"].includes(extension) ? "jpeg" : undefined;
  return Boolean(
    inspection?.detectedFormat && extensionFormat && inspection.detectedFormat !== extensionFormat,
  );
});

const rowsByHash = new Map<string, ProductImageAssetCsvRow[]>();
for (const row of existingRows) {
  const sha256 = result.inspections.get(row.public_path)?.sha256;
  if (!sha256) continue;
  const group = rowsByHash.get(sha256) ?? [];
  group.push(row);
  rowsByHash.set(sha256, group);
}
const duplicateGroups = Array.from(rowsByHash.values()).filter((group) => group.length > 1);
const referencedPaths = new Set(rows.map((row) => row.public_path.toLowerCase()));
const unassignedFiles = listProductImageFiles().filter(
  (publicPath) => !referencedPaths.has(publicPath.toLowerCase()),
);

const report = [
  "# Product Image Asset Report",
  "",
  `Generated from \`${path.relative(process.cwd(), imageAssetRegistryPath).replace(/\\/g, "/")}\`. This is an internal evidence and replacement queue; it is not a claim that migrated images are exact-product or rights-approved assets.`,
  "",
  "## Executive Summary",
  "",
  `- Products covered: ${new Set(rows.map((row) => row.sku)).size}`,
  `- Registered image assets: ${rows.length}`,
  `- Main images: ${rows.filter((row) => row.role === "main").length}`,
  `- Gallery images: ${rows.filter((row) => row.role === "gallery").length}`,
  `- Existing registered files: ${existingRows.length}`,
  `- Search-eligible exact assets: ${rows.filter((row) => row.publication_status === "search_eligible").length}`,
  `- Legacy public reference assets: ${rows.filter((row) => row.publication_status === "legacy_reference").length}`,
  `- Blocked assets: ${blockedRows.length}`,
  `- Company-owned photos: ${companyOwnedRows.length}`,
  `- Exact-product matches: ${exactProductRows.length}`,
  `- Assets with approved usage rights: ${rows.length - rightsReviewRows.length}`,
  `- Assets with unknown source: ${unknownSourceRows.length}`,
  `- Assets below 1000 px on at least one side: ${lowResolutionRows.length}`,
  `- Assets below 600 px on at least one side: ${veryLowResolutionRows.length}`,
  `- Assets whose extension does not match file content: ${formatMismatchRows.length}`,
  `- Duplicate-content groups: ${duplicateGroups.length}`,
  `- Unassigned files in \`public/images/products/\`: ${unassignedFiles.length}`,
  "",
  "`legacy_reference` preserves an already published buyer-facing image during migration. It does not approve copyright, prove an exact variant, or authorize reuse outside the current site. New images should reach `search_eligible` only after source, rights, exact-product match, reviewer and review date are recorded.",
  "",
  "## Registry States",
  "",
  formatCounts("Publication Status", countBy(rows, "publication_status")),
  "",
  formatCounts("Source Kind", countBy(rows, "source_kind")),
  "",
  formatCounts("Ownership Status", countBy(rows, "ownership_status")),
  "",
  formatCounts("Usage Rights", countBy(rows, "usage_rights_status")),
  "",
  formatCounts("Content Match", countBy(rows, "content_match_status")),
  "",
  "## Blocked Assets",
  "",
  formatAssetTable(
    blockedRows,
    () => "Collect and approve a dedicated exact-product image before publication.",
  ),
  "",
  "## Unknown Source Queue",
  "",
  formatAssetTable(
    unknownSourceRows,
    () => "Identify the original file owner, source file and permitted website use.",
  ),
  "",
  "## Resolution Replacement Queue",
  "",
  formatAssetTable(lowResolutionRows, (row) => {
    const inspection = result.inspections.get(row.public_path)!;
    return `${inspection.width} x ${inspection.height} px; replace with a sharper exact-product view when available.`;
  }),
  "",
  "## File Format Corrections",
  "",
  formatAssetTable(formatMismatchRows, (row) => {
    const inspection = result.inspections.get(row.public_path)!;
    const extension = path.extname(row.public_path).toLowerCase();
    return `${extension} extension with detected ${inspection.detectedFormat?.toUpperCase()} content; re-export or rename through the reviewed image workflow.`;
  }),
  "",
  "## Duplicate Content",
  "",
  duplicateGroups.length === 0
    ? "No duplicate registered image content found."
    : [
        "| Group | Products and assets | Review boundary |",
        "| --- | --- | --- |",
        ...duplicateGroups.map(
          (group, index) =>
            `| ${index + 1} | ${group.map((row) => `${row.sku} (\`${row.public_path}\`)`).join("<br>")} | Same-family reference image only; collect variant-specific views before presenting visual differences as confirmed. |`,
        ),
      ].join("\n"),
  "",
  "## Unassigned Files",
  "",
  "Files in the product-image directory that are not referenced by canonical product data remain outside the public product asset registry. Review provenance and product identity before assigning any of them.",
  "",
  unassignedFiles.length === 0
    ? "No unassigned files found."
    : unassignedFiles.map((publicPath) => `- \`${publicPath}\``).join("\n"),
  "",
  "## Approval Workflow",
  "",
  "1. Match the physical SKU using its label, drawing, dimensions or reviewed sample.",
  "2. Record the original file, source owner and written or company-owned usage basis.",
  "3. Capture main, 45-degree, connection/detail, dimension and packaging views without changing product geometry.",
  "4. Update the registry row to `exact_product`; use `approved` rights only with recorded evidence.",
  "5. Set `search_eligible` only after reviewer and ISO review date are present.",
  "6. Run `npm run images:assets:generate`, `npm run images:assets:validate`, `npm run images:assets:report`, SEO checks and the production build.",
  "",
].join("\n");

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, await format(report, { parser: "markdown", printWidth: 100 }));

console.log(`Product image asset report written to ${path.relative(process.cwd(), outputPath)}`);
console.log(`Registered assets: ${rows.length}`);
console.log(`Blocked assets: ${blockedRows.length}`);
console.log(`Unknown-source assets: ${unknownSourceRows.length}`);
console.log(`Rights-review assets: ${rightsReviewRows.length}`);
console.log(`File-format corrections: ${formatMismatchRows.length}`);
console.log(`Duplicate-content groups: ${duplicateGroups.length}`);
