#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const TO_BE_CONFIRMED = "To be confirmed";
const DEFAULT_INPUT = "docs/product-sku-template.csv";
const DEFAULT_OUTPUT = "content/generated-products.ts";

const requiredColumns = [
  "category_slug",
  "product_slug",
  "title",
  "sku",
  "kind",
  "process",
  "short_description",
  "material",
  "size",
  "thread",
  "compatible_brand",
  "oem_number",
  "package",
  "moq",
  "lead_time",
  "applications",
  "features",
  "faq_question_1",
  "faq_answer_1",
  "related_product_slugs",
  "missing_fields",
];

const allowedKinds = new Set(["welding-consumable", "welding-equipment"]);
const allowedProcesses = new Set(["MIG/MAG", "TIG", "MMA", "Plasma Cutting"]);

function parseArguments(argv) {
  const options = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--write") {
      options.write = true;
      continue;
    }

    if (arg === "--out") {
      options.output = argv[index + 1] ?? DEFAULT_OUTPUT;
      index += 1;
      continue;
    }

    if (!arg.startsWith("--")) {
      options.input = arg;
    }
  }

  return options;
}

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

function readCategories() {
  const categoriesPath = resolve("content/categories.ts");
  const categoriesFile = readFileSync(categoriesPath, "utf8");
  const categoryBlocks = categoriesFile.match(/\{[\s\S]*?slug:\s*"[^"]+"[\s\S]*?\},/g) ?? [];
  const categories = new Map();

  for (const block of categoryBlocks) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    const code = block.match(/code:\s*"([^"]+)"/)?.[1];

    if (slug && code) {
      categories.set(slug, { code });
    }
  }

  return categories;
}

function rowToRecord(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, (row[index] ?? "").trim()]));
}

function splitList(value) {
  if (!value || value === TO_BE_CONFIRMED) {
    return value ? [value] : [];
  }

  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toSpecRows(record) {
  return [
    { label: "Material", value: record.material },
    { label: "Size", value: record.size },
    { label: "Thread", value: record.thread },
    { label: "Compatible Brand", value: record.compatible_brand },
    { label: "OEM Number", value: record.oem_number },
    { label: "Package", value: record.package },
    { label: "MOQ", value: record.moq },
    { label: "Lead Time", value: record.lead_time },
  ];
}

function toProduct(record, categoryCode) {
  const baseProduct = {
    slug: record.product_slug,
    title: record.title,
    sku: record.sku,
    categorySlug: record.category_slug,
    kind: record.kind,
    shortDescription: record.short_description,
    description: record.short_description,
    imageLabel: categoryCode,
    keywords: [record.title],
    specifications: toSpecRows(record),
    compatibility: [
      { label: "Compatible Brand", value: record.compatible_brand },
      { label: "OEM Number", value: record.oem_number },
      { label: "Reference Number", value: TO_BE_CONFIRMED },
    ],
    applications: splitList(record.applications),
    features: splitList(record.features),
    packaging: record.package,
    moq: record.moq,
    leadTime: record.lead_time,
    faq: [
      {
        question: record.faq_question_1,
        answer: record.faq_answer_1,
      },
    ],
    relatedProductSlugs: splitList(record.related_product_slugs),
    missingFields: splitList(record.missing_fields),
  };

  if (record.kind === "welding-equipment") {
    return {
      ...baseProduct,
      equipmentFamily: record.title,
      supportedProcesses: allowedProcesses.has(record.process) ? [record.process] : [],
    };
  }

  return {
    ...baseProduct,
    process: record.process,
    consumableFamily: record.title,
  };
}

function validateHeaders(headers) {
  const missingColumns = requiredColumns.filter((column) => !headers.includes(column));
  const duplicateColumns = headers.filter((column, index) => headers.indexOf(column) !== index);
  const errors = [];

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  if (duplicateColumns.length > 0) {
    errors.push(`Duplicate columns: ${[...new Set(duplicateColumns)].join(", ")}`);
  }

  return errors;
}

function validateRecord(record, rowNumber, categories, writeMode) {
  const errors = [];
  const rowLabel = `Row ${rowNumber}`;

  for (const column of requiredColumns) {
    if (!record[column]) {
      errors.push(`${rowLabel}: ${column} is required.`);
    }
  }

  if (record.category_slug && !categories.has(record.category_slug)) {
    errors.push(`${rowLabel}: unknown category_slug "${record.category_slug}".`);
  }

  if (record.kind && !allowedKinds.has(record.kind)) {
    errors.push(`${rowLabel}: kind must be one of ${[...allowedKinds].join(", ")}.`);
  }

  if (record.process && record.process !== TO_BE_CONFIRMED && !allowedProcesses.has(record.process)) {
    errors.push(`${rowLabel}: process must be one of ${[...allowedProcesses].join(", ")}.`);
  }

  if (writeMode && (record.product_slug === "to-be-confirmed" || record.title === "to-be-confirmed")) {
    errors.push(`${rowLabel}: refusing to write placeholder product_slug or title.`);
  }

  if (writeMode && record.process === TO_BE_CONFIRMED) {
    errors.push(`${rowLabel}: process must be confirmed before generating website content.`);
  }

  return errors;
}

function buildTsFile(products) {
  return `import type { Product } from "@/lib/content/schemas";

// Generated from a validated product CSV. Review before importing into live pages.
export const generatedProducts: Product[] = ${JSON.stringify(products, null, 2)};
`;
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const csv = readFileSync(resolve(options.input), "utf8");
  const rows = parseCsv(csv);
  const categories = readCategories();
  const errors = [];

  if (rows.length < 2) {
    errors.push("CSV must include a header row and at least one product row.");
  }

  const headers = rows[0]?.map((header) => header.trim()) ?? [];
  errors.push(...validateHeaders(headers));

  const records = rows.slice(1).map((row) => rowToRecord(headers, row));
  const products = records.map((record, index) => {
    const rowNumber = index + 2;
    errors.push(...validateRecord(record, rowNumber, categories, options.write));
    const categoryCode = categories.get(record.category_slug)?.code ?? "SKU";
    return toProduct(record, categoryCode);
  });

  if (errors.length > 0) {
    console.error("Product generation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const output = buildTsFile(products);

  console.log(`Input: ${options.input}`);
  console.log(`Products converted: ${products.length}`);

  if (!options.write) {
    console.log("Preview mode only. Add --write to create a generated file.");
    console.log("\nGenerated preview:\n");
    console.log(output);
    return;
  }

  const outputPath = resolve(options.output);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, output, "utf8");
  console.log(`Generated: ${options.output}`);
}

main();
