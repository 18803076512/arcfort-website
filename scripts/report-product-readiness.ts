#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  resolveValidationInputPath,
  splitImageList,
  validateCsvFile,
  type ProductImportRow,
} from "./product-import-utils.ts";

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
  return rows.reduce<Record<T, number>>((counts, row) => {
    const value = row[field] as T;
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {} as Record<T, number>);
}

function getMissingImageRows(rows: ProductImportRow[]) {
  return rows.filter((row) => !publicImageExists(row.main_image));
}

function getMissingGalleryRows(rows: ProductImportRow[]) {
  return rows
    .map((row) => ({
      row,
      missingImages: splitImageList(row.gallery_images).filter((imagePath) => !publicImageExists(imagePath)),
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

function buildReport(inputPath: string, rows: ProductImportRow[]) {
  const missingMainImageRows = getMissingImageRows(rows);
  const missingGalleryRows = getMissingGalleryRows(rows);
  const rowsWithPlaceholderFields = rows
    .map((row) => ({ row, fields: getPlaceholderFields(row) }))
    .filter((entry) => entry.fields.length > 0);
  const confirmedDataRows = rows.filter((row) => row.data_status === "confirmed");
  const ownPhotoRows = rows.filter((row) => row.image_status === "own_photo");
  const confirmedCompatibilityRows = rows.filter((row) => row.compatibility_status === "confirmed");
  const confirmedOemRows = rows.filter((row) => row.oem_status === "confirmed");
  const generatedAt = new Date().toISOString();

  return [
    "# Product Readiness Report",
    "",
    `Generated from \`${path.relative(process.cwd(), inputPath).replace(/\\/g, "/")}\` at ${generatedAt}.`,
    "",
    "This report is an internal working checklist. Do not use it to invent product specifications, certifications, prices, stock status, factory capacity or confirmed compatibility.",
    "",
    "## Summary",
    "",
    `- Products checked: ${rows.length}`,
    `- Products with confirmed data status: ${confirmedDataRows.length}`,
    `- Products with own-photo image status: ${ownPhotoRows.length}`,
    `- Products with confirmed compatibility status: ${confirmedCompatibilityRows.length}`,
    `- Products with confirmed OEM status: ${confirmedOemRows.length}`,
    `- Missing main images: ${missingMainImageRows.length}`,
    `- Missing gallery images: ${missingGalleryRows.length}`,
    `- Products with high-priority placeholder fields: ${rowsWithPlaceholderFields.length}`,
    "",
    formatStatusCounts("Data Status", countBy(rows, "data_status")),
    "",
    formatStatusCounts("Image Status", countBy(rows, "image_status")),
    "",
    formatStatusCounts("Compatibility Status", countBy(rows, "compatibility_status")),
    "",
    formatStatusCounts("OEM Status", countBy(rows, "oem_status")),
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
            (entry) => `| ${entry.row.sku} | ${entry.row.name} | ${entry.missingImages.join("<br>")} |`,
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
    "1. Replace missing main images with white-background product photos named exactly as the CSV image paths.",
    "2. Confirm high-priority product fields from samples, drawings, factory data or supplier catalogs.",
    "3. Change `data_status`, `image_status`, `compatibility_status` and `oem_status` only when the supporting data is actually confirmed.",
    "4. Run `npm run products:report`, `npm run products:validate`, `npm run products:check-images` and `npm run build` before publishing SKU updates.",
    "",
  ].join("\n");
}

const inputPath = resolveValidationInputPath(process.argv[2]);
const result = validateCsvFile(inputPath);

if (result.errors.length > 0) {
  console.error("Product readiness report failed because the product CSV has validation errors.");
  process.exit(1);
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buildReport(inputPath, result.rows));

console.log(`Product readiness report written to ${path.relative(process.cwd(), outputPath)}`);
console.log(`Products checked: ${result.rows.length}`);
console.log(`Validation warnings: ${result.warnings.length}`);
