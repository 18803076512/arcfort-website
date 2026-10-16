#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  resolveValidationInputPath,
  splitImageList,
  validateCsvFile,
  type ProductImportRow,
} from "./product-import-utils.ts";
import {
  validateProductImageAssets,
  type ProductImageAssetValidation,
} from "./product-image-asset-utils.ts";
import {
  assessProductMainImageEvidence,
  productMainImageEvidenceGapLabels,
  type ProductMainImageEvidence,
} from "./product-image-readiness-utils.ts";

const outputPath = path.join(process.cwd(), "docs", "product-readiness-report.md");

const placeholderValues = [
  "available upon request",
  "contact us for details",
  "tbd",
  "unknown",
  "needs_review",
  "material details available upon request",
  "standard export packing or customized packaging",
] as const;

const highPriorityFields = [
  "main_image",
  "material",
  "size",
  "thread",
  "compatible_brand",
  "compatible_model",
  "oem_number",
  "package",
  "moq",
  "lead_time",
] as const;

function isPlaceholder(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return (
    normalizedValue.length === 0 ||
    placeholderValues.some((placeholder) => normalizedValue.includes(placeholder))
  );
}

function publicImageExists(imagePath: string) {
  return imagePath.startsWith("/images/products/")
    ? existsSync(path.join(process.cwd(), "public", imagePath))
    : false;
}

function countBy<T extends string>(rows: ProductImportRow[], field: keyof ProductImportRow) {
  return rows.reduce<Record<T, number>>(
    (counts, row) => {
      const value = row[field] as T;
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    },
    {} as Record<T, number>,
  );
}

function getMissingImageRows(rows: ProductImportRow[]) {
  return rows.filter((row) => !publicImageExists(row.main_image));
}

function getImageReviewRows(rows: ProductImportRow[]) {
  return rows.filter(
    (row) => row.image_status === "placeholder" || row.image_status === "needs_photo",
  );
}

function getMissingGalleryRows(rows: ProductImportRow[]) {
  return rows
    .map((row) => ({
      row,
      missingImages: splitImageList(row.gallery_images).filter(
        (imagePath) => !publicImageExists(imagePath),
      ),
    }))
    .filter((entry) => entry.missingImages.length > 0);
}

function getPlaceholderFields(row: ProductImportRow) {
  return highPriorityFields.filter((field) => isPlaceholder(row[field]));
}

function formatStatusCounts(title: string, counts: Record<string, number>) {
  const rows = Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([status, count]) => `- ${status || "(blank)"}: ${count}`)
    .join("\n");

  return [`## ${title}`, "", rows || "- No values found."].join("\n");
}

function formatProductTable(rows: ProductImportRow[], getNotes: (row: ProductImportRow) => string) {
  if (rows.length === 0) {
    return "No items found.";
  }

  return [
    "| SKU | Product | Category | Notes |",
    "| --- | --- | --- | --- |",
    ...rows.map((row) => `| ${row.sku} | ${row.name} | ${row.category} | ${getNotes(row)} |`),
  ].join("\n");
}

function formatMainImageEvidenceTable(
  entries: Array<{ row: ProductImportRow; evidence: ProductMainImageEvidence }>,
) {
  if (entries.length === 0) {
    return "No active main-image evidence gaps found.";
  }

  return [
    "| SKU | Product | CSV image status | Registry state | Source | Rights | Match | Controls to complete |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...entries.map(({ row, evidence }) => {
      const asset = evidence.asset;
      const gaps = evidence.gaps.map((gap) => productMainImageEvidenceGapLabels[gap]).join(", ");

      return `| ${row.sku} | ${row.name} | ${row.image_status} | ${asset?.publication_status ?? "unregistered"} | ${asset?.source_kind ?? "unregistered"} | ${asset?.usage_rights_status ?? "unregistered"} | ${asset?.content_match_status ?? "unregistered"} | ${gaps || "None"} |`;
    }),
  ].join("\n");
}

function buildReport(
  inputPath: string,
  rows: ProductImportRow[],
  imageAssets: ProductImageAssetValidation,
) {
  const missingMainImageRows = getMissingImageRows(rows);
  const imageReviewRows = getImageReviewRows(rows);
  const missingGalleryRows = getMissingGalleryRows(rows);
  const activeRows = rows.filter((row) => row.status === "active");
  const draftRows = rows.filter((row) => row.status === "draft");
  const activeImageReviewRows = getImageReviewRows(activeRows);
  const mainImageEvidence = rows.map((row) => ({
    row,
    evidence: assessProductMainImageEvidence(row, imageAssets.rows, publicImageExists),
  }));
  const activeMainImageEvidence = mainImageEvidence.filter(
    (entry) => entry.row.status === "active",
  );
  const activeRowsWithRegisteredPublicMainImages = activeMainImageEvidence.filter(
    (entry) => entry.evidence.hasRegisteredPublicMainImage,
  );
  const activeRowsWithSearchEligibleExactMainImages = activeMainImageEvidence.filter(
    (entry) => entry.evidence.hasSearchEligibleExactMainImage,
  );
  const activeLegacyMainImageRows = activeMainImageEvidence.filter(
    (entry) => entry.evidence.asset?.publication_status === "legacy_reference",
  );
  const activeMainImageEvidenceGaps = activeMainImageEvidence.filter(
    (entry) => !entry.evidence.hasSearchEligibleExactMainImage,
  );
  const blockedMainImageRows = mainImageEvidence.filter(
    (entry) => entry.evidence.asset?.publication_status === "blocked",
  );
  const rowsWithPlaceholderFields = rows
    .map((row) => ({ row, fields: getPlaceholderFields(row) }))
    .filter((entry) => entry.fields.length > 0);
  const confirmedDataRows = rows.filter((row) => row.data_status === "confirmed");
  const ownPhotoRows = rows.filter((row) => row.image_status === "own_photo");
  const csvOwnOrSupplierPhotoRows = rows.filter(
    (row) => row.image_status === "own_photo" || row.image_status === "supplier_photo",
  );
  const confirmedCompatibilityRows = rows.filter((row) => row.compatibility_status === "confirmed");
  const confirmedOemRows = rows.filter((row) => row.oem_status === "confirmed");
  return [
    "# Product Readiness Report",
    "",
    `Generated from \`${path.relative(process.cwd(), inputPath).replace(/\\/g, "/")}\`.`,
    "",
    "This report is an internal working checklist. Do not use it to invent product specifications, certifications, prices, stock status, factory capacity or confirmed compatibility.",
    "",
    "## Summary",
    "",
    `- Products checked: ${rows.length}`,
    `- Active public products: ${activeRows.length}`,
    `- Draft products: ${draftRows.length}`,
    `- Products with confirmed data status: ${confirmedDataRows.length}`,
    `- Products with own-photo image status: ${ownPhotoRows.length}`,
    `- Products whose CSV image status is own_photo or supplier_photo: ${csvOwnOrSupplierPhotoRows.length}`,
    `- Active products with registered public main images: ${activeRowsWithRegisteredPublicMainImages.length}`,
    `- Active products with search-eligible exact main images: ${activeRowsWithSearchEligibleExactMainImages.length}`,
    `- Active products using retained legacy-reference main images: ${activeLegacyMainImageRows.length}`,
    `- Active products still requiring exact main-image evidence: ${activeMainImageEvidenceGaps.length}`,
    `- Products with blocked main-image assets: ${blockedMainImageRows.length}`,
    `- Products whose CSV image status is needs_photo or placeholder: ${imageReviewRows.length}`,
    `- Active products whose CSV image status is needs_photo or placeholder: ${activeImageReviewRows.length}`,
    `- Products with confirmed compatibility status: ${confirmedCompatibilityRows.length}`,
    `- Products with confirmed OEM status: ${confirmedOemRows.length}`,
    `- Missing main images: ${missingMainImageRows.length}`,
    `- Missing gallery images: ${missingGalleryRows.length}`,
    `- Products with high-priority placeholder fields: ${rowsWithPlaceholderFields.length}`,
    "",
    "The CSV `image_status` is workflow metadata. It does not approve ownership, website-use rights, exact-product identity or image-search eligibility. Those decisions come only from the canonical image asset registry.",
    "",
    formatStatusCounts("Publication Status", countBy(rows, "status")),
    "",
    formatStatusCounts("Data Status", countBy(rows, "data_status")),
    "",
    formatStatusCounts("Image Status", countBy(rows, "image_status")),
    "",
    formatStatusCounts("Compatibility Status", countBy(rows, "compatibility_status")),
    "",
    formatStatusCounts("OEM Status", countBy(rows, "oem_status")),
    "",
    "## Active Main-Image Evidence Gap Queue",
    "",
    "Every active product below has a retained public reference image but still lacks one or more controls required for a rights-approved, exact-product, search-eligible main image.",
    "",
    formatMainImageEvidenceTable(activeMainImageEvidenceGaps),
    "",
    "## Draft / Needs-Photo Queue",
    "",
    formatProductTable(
      imageReviewRows,
      (row) => `${row.status}; ${row.image_status}: replace or verify ${row.main_image}`,
    ),
    "",
    "## Missing Main Images",
    "",
    formatProductTable(missingMainImageRows, (row) => row.main_image),
    "",
    "## Missing Gallery Images",
    "",
    missingGalleryRows.length === 0
      ? "No items found."
      : [
          "| SKU | Product | Missing Gallery Images |",
          "| --- | --- | --- |",
          ...missingGalleryRows.map(
            (entry) =>
              `| ${entry.row.sku} | ${entry.row.name} | ${entry.missingImages.join("<br>")} |`,
          ),
        ].join("\n"),
    "",
    "## High-Priority Placeholder Fields",
    "",
    rowsWithPlaceholderFields.length === 0
      ? "No high-priority placeholders found."
      : [
          "| SKU | Product | Fields To Confirm |",
          "| --- | --- | --- |",
          ...rowsWithPlaceholderFields.map(
            (entry) => `| ${entry.row.sku} | ${entry.row.name} | ${entry.fields.join(", ")} |`,
          ),
        ].join("\n"),
    "",
    "## Next Actions",
    "",
    "1. Replace retained family references with exact-product images and complete source owner, original file, website-use rights, reviewer and review date evidence.",
    "2. Keep products with `needs_photo` or `placeholder` image status as `draft` until a reviewed exact-product photo is available.",
    "3. Confirm high-priority product fields from samples, drawings, factory data or supplier catalogs.",
    "4. Change `data_status`, `image_status`, `compatibility_status` and `oem_status` only when the supporting data is actually confirmed.",
    "5. Run `npm run products:report`, `npm run images:assets:validate`, `npm run images:assets:report`, `npm run products:validate`, `npm run products:check-images` and `npm run build` before publishing SKU updates.",
    "",
  ].join("\n");
}

const inputPath = resolveValidationInputPath(process.argv[2]);
const result = validateCsvFile(inputPath);
const imageAssets = validateProductImageAssets({ productInputPath: inputPath });

if (result.errors.length > 0 || imageAssets.errors.length > 0) {
  console.error(
    "Product readiness report failed because the product CSV or image asset registry has validation errors.",
  );
  imageAssets.errors.forEach((issue) => console.error(`- ${issue.message}`));
  process.exit(1);
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buildReport(inputPath, result.rows, imageAssets));

console.log(`Product readiness report written to ${path.relative(process.cwd(), outputPath)}`);
console.log(`Products checked: ${result.rows.length}`);
console.log(`Image assets checked: ${imageAssets.rows.length}`);
console.log(`Validation warnings: ${result.warnings.length}`);
