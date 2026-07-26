#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import path from "node:path";
import { createProductEditorialCopy } from "./product-copy-profiles.ts";
import {
  printIssues,
  rowsFromCsv,
  serializeProductCsv,
  validateProductRows,
} from "./product-import-utils.ts";

const args = process.argv.slice(2);
const inputPath = path.resolve(getArgValue("--input") ?? "data/import/products.csv");
const shouldWrite = args.includes("--write");

function getArgValue(flag: string) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

const { rows, issues } = rowsFromCsv(inputPath);
const refreshedProducts: string[] = [];
const unmatchedProducts: string[] = [];

const refreshedRows = rows.map((row) => {
  if (row.source_type !== "official_catalog" || row.status !== "active") {
    return row;
  }

  const copy = createProductEditorialCopy(row.name, row.name, row.category_slug);

  if (!copy.profileMatched) {
    unmatchedProducts.push(`${row.sku} ${row.name}`);
    return row;
  }

  refreshedProducts.push(`${row.sku} ${row.name}`);

  return {
    ...row,
    short_description: copy.shortDescription,
    description: copy.description,
    application: copy.application,
    meta_description: copy.metaDescription,
  };
});

const validation = validateProductRows(refreshedRows, issues);
printIssues("Errors", validation.errors);
printIssues("Warnings", validation.warnings);

console.log(`\nCatalog products with editorial profiles: ${refreshedProducts.length}`);
for (const product of refreshedProducts) {
  console.log(`- ${product}`);
}

if (unmatchedProducts.length > 0) {
  console.warn(`\nCatalog products without editorial profiles: ${unmatchedProducts.length}`);
  for (const product of unmatchedProducts) {
    console.warn(`- ${product}`);
  }
}

if (validation.errors.length > 0 || unmatchedProducts.length > 0) {
  process.exit(1);
}

if (!shouldWrite) {
  console.log("\nPreview only. Re-run with --write to update the CSV.");
  process.exit(0);
}

writeFileSync(inputPath, `${serializeProductCsv(validation.rows)}\n`, "utf8");
console.log(`\nUpdated catalog product copy: ${inputPath}`);
