#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TO_BE_CONFIRMED = "To be confirmed";

const requiredColumns = [
  "category_slug",
  "product_slug",
  "title",
  "sku",
  "kind",
  "process",
  "short_description",
  "material",
  "thread",
  "size",
  "length",
  "compatible_model",
  "compatible_brand",
  "oem",
  "oem_number",
  "package",
  "moq",
  "lead_time",
  "image_name",
  "application",
  "applications",
  "features",
  "faq_question_1",
  "faq_answer_1",
  "related_product_slugs",
  "missing_fields",
];

const allowedKinds = new Set(["welding-consumable", "welding-equipment"]);
const allowedProcesses = new Set(["MIG/MAG", "TIG", "MMA", "Plasma Cutting", TO_BE_CONFIRMED]);

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((currentRow) => currentRow.some((value) => value.trim().length > 0));
}

function readCategorySlugs() {
  const categoriesPath = resolve("content/categories.ts");
  const categoriesFile = readFileSync(categoriesPath, "utf8");
  const matches = [...categoriesFile.matchAll(/slug:\s*"([^"]+)"/g)];
  return new Set(matches.map((match) => match[1]));
}

function rowToRecord(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, (row[index] ?? "").trim()]));
}

function isSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validateCsv(filePath) {
  const resolvedPath = resolve(filePath);
  const csv = readFileSync(resolvedPath, "utf8");
  const rows = parseCsv(csv);
  const errors = [];
  const warnings = [];

  if (rows.length < 2) {
    errors.push("CSV must include a header row and at least one product row.");
    return { errors, warnings, productCount: 0 };
  }

  const headers = rows[0].map((header) => header.trim());
  const missingColumns = requiredColumns.filter((column) => !headers.includes(column));
  const duplicateColumns = headers.filter((column, index) => headers.indexOf(column) !== index);

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  if (duplicateColumns.length > 0) {
    errors.push(`Duplicate columns: ${[...new Set(duplicateColumns)].join(", ")}`);
  }

  const categorySlugs = readCategorySlugs();
  const seenProductSlugs = new Set();
  const records = rows.slice(1).map((row) => rowToRecord(headers, row));

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    const rowLabel = `Row ${rowNumber}`;

    for (const column of requiredColumns) {
      if (!record[column]) {
        errors.push(`${rowLabel}: ${column} is required.`);
      }
    }

    if (record.category_slug && !categorySlugs.has(record.category_slug)) {
      errors.push(`${rowLabel}: unknown category_slug "${record.category_slug}".`);
    }

    if (record.product_slug && !isSlug(record.product_slug)) {
      errors.push(`${rowLabel}: product_slug must use lowercase letters, numbers and hyphens.`);
    }

    if (record.product_slug && seenProductSlugs.has(record.product_slug)) {
      errors.push(`${rowLabel}: duplicate product_slug "${record.product_slug}".`);
    }

    if (record.product_slug) {
      seenProductSlugs.add(record.product_slug);
    }

    if (record.kind && !allowedKinds.has(record.kind)) {
      errors.push(`${rowLabel}: kind must be one of ${[...allowedKinds].join(", ")}.`);
    }

    if (record.process && !allowedProcesses.has(record.process)) {
      errors.push(`${rowLabel}: process must be one of ${[...allowedProcesses].join(", ")}.`);
    }

    const toBeConfirmedFields = requiredColumns.filter(
      (column) => record[column] === TO_BE_CONFIRMED || record[column] === "to-be-confirmed",
    );

    if (toBeConfirmedFields.length > 0) {
      warnings.push(`${rowLabel}: pending fields: ${toBeConfirmedFields.join(", ")}`);
    }

    if (toBeConfirmedFields.length > 0 && !record.missing_fields) {
      warnings.push(`${rowLabel}: missing_fields should list all pending data.`);
    }
  });

  return { errors, warnings, productCount: records.length };
}

const inputFile = process.argv[2] ?? "docs/product-sku-template.csv";
const result = validateCsv(inputFile);

console.log(`Product CSV: ${inputFile}`);
console.log(`Products checked: ${result.productCount}`);

if (result.warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of result.warnings) {
    console.log(`- ${warning}`);
  }
}

if (result.errors.length > 0) {
  console.error("\nErrors:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("\nProduct CSV validation passed.");
