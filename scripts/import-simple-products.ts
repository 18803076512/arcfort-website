#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  type ProductImportRow,
  parseCsv,
  printIssues,
  productCsvHeaders,
  slugify,
  validateProductRows,
} from "./product-import-utils.ts";

type ExistingProduct = {
  sku: string;
  slug: string;
};

type SimpleHeader =
  | "category"
  | "product_name"
  | "model"
  | "size"
  | "thread"
  | "material"
  | "compatible_model"
  | "image_name"
  | "notes";

type SimpleRow = Record<SimpleHeader, string>;

const simpleHeaders: SimpleHeader[] = [
  "category",
  "product_name",
  "model",
  "size",
  "thread",
  "material",
  "compatible_model",
  "image_name",
  "notes",
];

const categoryBySimpleInput: Record<string, { category: string; categorySlug: string; code: string }> = {
  "mig torch parts": {
    category: "MIG/MAG Torch Parts",
    categorySlug: "mig-mag-torch-parts",
    code: "MIG",
  },
  "mig/mag torch parts": {
    category: "MIG/MAG Torch Parts",
    categorySlug: "mig-mag-torch-parts",
    code: "MIG",
  },
  "tig torch parts": {
    category: "TIG Torch Parts",
    categorySlug: "tig-torch-parts",
    code: "TIG",
  },
  "plasma cutting parts": {
    category: "Plasma Cutting Consumables",
    categorySlug: "plasma-cutting-consumables",
    code: "PLA",
  },
  "plasma cutting consumables": {
    category: "Plasma Cutting Consumables",
    categorySlug: "plasma-cutting-consumables",
    code: "PLA",
  },
  "welding consumables": {
    category: "Welding Consumables",
    categorySlug: "welding-consumables",
    code: "CON",
  },
  "welding machines": {
    category: "Welding Machines",
    categorySlug: "welding-machines",
    code: "MAC",
  },
  "welding accessories": {
    category: "Welding Accessories",
    categorySlug: "welding-accessories",
    code: "ACC",
  },
};

const applicationByCategorySlug: Record<string, string> = {
  "mig-mag-torch-parts": "MIG/MAG welding torch consumables",
  "tig-torch-parts": "TIG welding torch consumables",
  "plasma-cutting-consumables": "Plasma cutting consumables",
  "welding-consumables": "Industrial welding consumables",
  "welding-machines": "Industrial welding and cutting equipment",
  "welding-accessories": "Workshop welding accessories",
};

const args = process.argv.slice(2);
const inputPath = path.resolve(getArgValue("--input") ?? "data/import/products-simple.csv");
const outputPath = path.resolve(getArgValue("--output") ?? "data/import/products.csv");
const shouldWrite = args.includes("--write");
const shouldImport = args.includes("--import");

function getArgValue(flag: string) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function createEmptyProductRow(): ProductImportRow {
  return Object.fromEntries(productCsvHeaders.map((header) => [header, ""])) as ProductImportRow;
}

function csvEscape(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function serializeProductCsv(rows: ProductImportRow[]) {
  return [
    productCsvHeaders.join(","),
    ...rows.map((row) => productCsvHeaders.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

function normalizeImagePath(imageName: string, slug: string) {
  const fileName = imageName.trim() || `${slug}.jpg`;

  if (fileName.startsWith("/images/products/")) {
    return fileName;
  }

  return `/images/products/${fileName}`;
}

function getImageStatus(row: SimpleRow, mainImage: string) {
  const normalizedNotes = row.notes.trim().toLowerCase();

  if (normalizedNotes.includes("own photo")) {
    return "own_photo";
  }

  if (normalizedNotes.includes("supplier photo")) {
    return "supplier_photo";
  }

  if (!existsSync(path.join(process.cwd(), "public", mainImage))) {
    return "needs_photo";
  }

  return "placeholder";
}

function appendIfMissing(parts: string[], value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return;
  }

  const combinedValue = parts.join(" ").toLowerCase();

  if (!combinedValue.includes(cleanValue.toLowerCase())) {
    parts.push(cleanValue);
  }
}

function composeProductName(row: SimpleRow) {
  const parts = [row.product_name.trim()];
  appendIfMissing(parts, row.model);
  appendIfMissing(parts, row.size);

  return parts.filter(Boolean).join(" ");
}

function getTypeCode(productName: string) {
  const normalizedName = productName.toLowerCase();

  if (normalizedName.includes("contact tip")) return "CT";
  if (normalizedName.includes("gas nozzle")) return "GN";
  if (normalizedName.includes("diffuser")) return "DF";
  if (normalizedName.includes("tip holder")) return "TH";
  if (normalizedName.includes("ceramic cup")) return "CC";
  if (normalizedName.includes("collet body")) return "CB";
  if (normalizedName.includes("gas lens")) return "GL";
  if (normalizedName.includes("swirl ring")) return "SR";
  if (normalizedName.includes("electrode holder")) return "EH";
  if (normalizedName.includes("electrode")) return "EL";
  if (normalizedName.includes("nozzle")) return "NZ";
  if (normalizedName.includes("ground clamp")) return "GC";
  if (normalizedName.includes("cable connector")) return "CC";

  return "AUTO";
}

function getCategoryInfo(category: string) {
  const normalizedCategory = category.trim().toLowerCase();
  const exactMatch = categoryBySimpleInput[normalizedCategory];

  if (exactMatch) {
    return exactMatch;
  }

  if (normalizedCategory.includes("mig")) return categoryBySimpleInput["mig torch parts"];
  if (normalizedCategory.includes("tig")) return categoryBySimpleInput["tig torch parts"];
  if (normalizedCategory.includes("plasma")) return categoryBySimpleInput["plasma cutting parts"];
  if (normalizedCategory.includes("machine")) return categoryBySimpleInput["welding machines"];
  if (normalizedCategory.includes("accessor")) return categoryBySimpleInput["welding accessories"];
  if (normalizedCategory.includes("consumable")) return categoryBySimpleInput["welding consumables"];

  return categoryBySimpleInput["welding accessories"];
}

function getMaxSkuNumbers(existingProducts: ExistingProduct[]) {
  const maxByCategoryCode = new Map<string, number>();

  for (const product of existingProducts) {
    const match = /^AF-([A-Z]+)-[A-Z0-9]+-(\d{4})$/.exec(product.sku);

    if (!match) {
      continue;
    }

    const categoryCode = match[1];
    const currentNumber = Number(match[2]);
    const previousNumber = maxByCategoryCode.get(categoryCode) ?? 0;
    maxByCategoryCode.set(categoryCode, Math.max(previousNumber, currentNumber));
  }

  return maxByCategoryCode;
}

function generateSku(categoryCode: string, typeCode: string, maxByCategoryCode: Map<string, number>) {
  const nextNumber = (maxByCategoryCode.get(categoryCode) ?? 0) + 1;
  maxByCategoryCode.set(categoryCode, nextNumber);

  return `AF-${categoryCode}-${typeCode}-${String(nextNumber).padStart(4, "0")}`;
}

function createDescription(name: string, category: string) {
  return `${name} is prepared for industrial B2B sourcing by distributors, importers, repair workshops and OEM buyers. It can be quoted for ${category} supply programs after the buyer confirms required quantity, packaging, destination country and technical references. Material, size, thread, compatible model, OEM number and other product details should be confirmed by drawing, product photo, reference part or model number before final quotation. ArcFort Weld supports standard export packing and OEM packaging discussion when order details are available. Buyers can also send an existing product list or sample photo so the sales team can review the item and prepare a more practical RFQ response.`;
}

function createMetaDescription(name: string) {
  return `Request ${name} quotation from ArcFort Weld for distributors, repair shops and OEM buyers.`;
}

function createSimpleRows(filePath: string) {
  const parsedRows = parseCsv(readFileSync(filePath, "utf8"));
  const headers = parsedRows[0]?.map((header) => header.trim()) ?? [];
  const rows = parsedRows.slice(1);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const header of simpleHeaders) {
    if (!headers.includes(header)) {
      errors.push(`Missing simple CSV header: ${header}`);
    }
  }

  for (const header of headers) {
    if (!simpleHeaders.includes(header as SimpleHeader)) {
      warnings.push(`Unknown simple CSV header will be ignored: ${header}`);
    }
  }

  const simpleRows = rows.map((cells, index) => {
    const simpleRow = Object.fromEntries(simpleHeaders.map((header) => [header, ""])) as SimpleRow;

    for (const [cellIndex, header] of headers.entries()) {
      if (simpleHeaders.includes(header as SimpleHeader)) {
        simpleRow[header as SimpleHeader] = cells[cellIndex]?.trim() ?? "";
      }
    }

    if (!simpleRow.product_name) {
      errors.push(`Row ${index + 2}: product_name is required.`);
    }

    if (!simpleRow.category) {
      errors.push(`Row ${index + 2}: category is required.`);
    }

    return simpleRow;
  });

  return { simpleRows, errors, warnings };
}

async function loadExistingProducts() {
  const dataFilePath = path.resolve("lib/data/products.ts");

  if (!existsSync(dataFilePath)) {
    return [] as ExistingProduct[];
  }

  const moduleUrl = `${pathToFileURL(dataFilePath).href}?simpleImportedAt=${Date.now()}`;
  const importedModule = (await import(moduleUrl)) as { arcfortProducts?: ExistingProduct[] };

  return importedModule.arcfortProducts ?? [];
}

async function convertSimpleRows(simpleRows: SimpleRow[]) {
  const existingProducts = await loadExistingProducts();
  const existingSkuBySlug = new Map(existingProducts.map((product) => [product.slug, product.sku]));
  const maxByCategoryCode = getMaxSkuNumbers(existingProducts);

  return simpleRows.map((simpleRow) => {
    const categoryInfo = getCategoryInfo(simpleRow.category);
    const name = composeProductName(simpleRow);
    const slug = slugify(name);
    const mainImage = normalizeImagePath(simpleRow.image_name, slug);
    const typeCode = getTypeCode(name);
    const row = createEmptyProductRow();

    row.sku = existingSkuBySlug.get(slug) ?? generateSku(categoryInfo.code, typeCode, maxByCategoryCode);
    row.name = name;
    row.category = categoryInfo.category;
    row.category_slug = categoryInfo.categorySlug;
    row.slug = slug;
    row.short_description = `${name} for ${categoryInfo.category} sourcing and RFQ programs.`;
    row.description = createDescription(name, categoryInfo.category);
    row.main_image = mainImage;
    row.material = simpleRow.material || "Available upon request";
    row.size = simpleRow.size || "Available upon request";
    row.thread = simpleRow.thread || "Available upon request";
    row.compatible_brand = "Contact us for details";
    row.compatible_model = simpleRow.compatible_model || "Contact us for details";
    row.oem_number = "TBD";
    row.package = "Standard export packing or customized packaging";
    row.moq = "Small trial orders accepted";
    row.lead_time = "7-20 working days for regular orders";
    row.application = applicationByCategorySlug[categoryInfo.categorySlug] ?? "Industrial welding and cutting supply";
    row.custom_available = "Available";
    row.sample_available = "Reference part review available";
    row.meta_title = `${name} | ArcFort Weld`;
    row.meta_description = createMetaDescription(name);
    row.status = "active";
    row.data_status = "needs_review";
    row.source_type = "unknown";
    row.source_reference = simpleRow.notes;
    row.image_status = getImageStatus(simpleRow, mainImage);
    row.compatibility_status = "unverified";
    row.oem_status = "unknown";
    row.notes_internal = simpleRow.notes;

    return row;
  });
}

async function main() {
  if (!existsSync(inputPath)) {
    console.error(`Simple product CSV not found: ${inputPath}`);
    console.error("Copy data/import/products-simple-template.csv to data/import/products-simple.csv first.");
    process.exit(1);
  }

  const { simpleRows, errors: simpleErrors, warnings: simpleWarnings } = createSimpleRows(inputPath);

  if (simpleWarnings.length > 0) {
    console.log("\nSimple CSV warnings:");
    simpleWarnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (simpleErrors.length > 0) {
    console.error("\nSimple CSV errors:");
    simpleErrors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  const productRows = await convertSimpleRows(simpleRows);
  const validationResult = validateProductRows(productRows);

  printIssues("Errors", validationResult.errors);
  printIssues("Warnings", validationResult.warnings);

  if (validationResult.errors.length > 0) {
    console.error("\nSimple SKU import stopped because generated product CSV has errors.");
    process.exit(1);
  }

  const csvContent = serializeProductCsv(validationResult.rows);

  console.log(`Simple product CSV: ${inputPath}`);
  console.log(`Products generated: ${validationResult.rows.length}`);

  if (!shouldWrite) {
    console.log("\nPreview only. Add --write to generate the full product CSV file.");
    return;
  }

  writeFileSync(outputPath, `${csvContent}\n`, "utf8");
  console.log(`Generated full product CSV: ${outputPath}`);

  if (!shouldImport) {
    console.log("Run npm run products:import after reviewing the generated CSV.");
    return;
  }

  const importResult = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "scripts/import-products.ts", outputPath],
    { shell: false, stdio: "inherit" },
  );

  if (importResult.status !== 0) {
    process.exit(importResult.status ?? 1);
  }
}

void main();
