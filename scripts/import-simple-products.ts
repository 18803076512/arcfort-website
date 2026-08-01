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
  rowsFromCsv,
  serializeProductCsv,
  slugify,
  validateProductRows,
} from "./product-import-utils.ts";
import { createProductEditorialCopy } from "./product-copy-profiles.ts";

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

const categoryBySimpleInput: Record<
  string,
  { category: string; categorySlug: string; code: string }
> = {
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

function getSafePublicationStatus(
  requestedStatus: ProductImportRow["status"],
  imageStatus: ProductImportRow["image_status"],
  mainImage: string,
) {
  if (requestedStatus !== "active") {
    return requestedStatus;
  }

  const hasReviewedImage = imageStatus === "own_photo" || imageStatus === "supplier_photo";
  const imageExists = existsSync(path.join(process.cwd(), "public", mainImage));

  return hasReviewedImage && imageExists ? "active" : "draft";
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
  if (normalizedName.includes("torch liner")) return "TL";
  if (normalizedName.includes("swan neck")) return "SN";
  if (normalizedName.includes("ceramic cup")) return "CC";
  if (normalizedName.includes("collet body")) return "CB";
  if (normalizedName.includes("collet")) return "CL";
  if (normalizedName.includes("gas lens")) return "GL";
  if (normalizedName.includes("swirl ring")) return "SR";
  if (normalizedName.includes("shield")) return "SH";
  if (normalizedName.includes("retaining cap")) return "RC";
  if (normalizedName.includes("cutting tip")) return "CT";
  if (normalizedName.includes("torch spacer")) return "TS";
  if (normalizedName.includes("back cap")) return "BC";
  if (normalizedName.includes("tungsten electrode")) return "TE";
  if (normalizedName.includes("electrode holder")) return "EH";
  if (normalizedName.includes("electrode")) return "EL";
  if (normalizedName.includes("nozzle")) return "NZ";
  if (normalizedName.includes("ground clamp")) return "GC";
  if (normalizedName.includes("cable connector")) return "CC";
  if (normalizedName.includes("welding cable")) return "WC";
  if (normalizedName.includes("welding wire")) return "WW";
  if (normalizedName.includes("dinse connector")) return "DC";
  if (normalizedName.includes("welding magnet")) return "WM";

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
  if (normalizedCategory.includes("consumable"))
    return categoryBySimpleInput["welding consumables"];

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

function generateSku(
  categoryCode: string,
  typeCode: string,
  maxByCategoryCode: Map<string, number>,
) {
  const nextNumber = (maxByCategoryCode.get(categoryCode) ?? 0) + 1;
  maxByCategoryCode.set(categoryCode, nextNumber);

  return `AF-${categoryCode}-${typeCode}-${String(nextNumber).padStart(4, "0")}`;
}

function normalizeExistingSku(existingSku: string | undefined, typeCode: string) {
  if (!existingSku) {
    return undefined;
  }

  const match = /^(AF-[A-Z]+)-([A-Z0-9]+)-(\d{4})$/.exec(existingSku);

  if (!match) {
    return existingSku;
  }

  const [, prefix, existingTypeCode, sequence] = match;

  if (existingTypeCode === "AUTO" || (existingTypeCode === "EL" && typeCode === "TE")) {
    return `${prefix}-${typeCode}-${sequence}`;
  }

  return existingSku;
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
    const imageStatus = getImageStatus(simpleRow, mainImage);
    const typeCode = getTypeCode(name);
    const existingSku = normalizeExistingSku(existingSkuBySlug.get(slug), typeCode);
    const editorialCopy = createProductEditorialCopy(
      name,
      simpleRow.product_name,
      categoryInfo.categorySlug,
    );

    if (!editorialCopy.profileMatched) {
      console.warn(
        `Editorial copy fallback used for ${name}. Review the generated description before import.`,
      );
    }

    const row = createEmptyProductRow();

    row.sku = existingSku ?? generateSku(categoryInfo.code, typeCode, maxByCategoryCode);
    row.name = name;
    row.category = categoryInfo.category;
    row.category_slug = categoryInfo.categorySlug;
    row.slug = slug;
    row.short_description = editorialCopy.shortDescription;
    row.description = editorialCopy.description;
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
    row.application = editorialCopy.application;
    row.custom_available = "Available";
    row.sample_available = "Reference part review available";
    row.meta_title = `${name} | ArcFort Weld`;
    row.meta_description = editorialCopy.metaDescription;
    row.status = getSafePublicationStatus("active", imageStatus, mainImage);
    row.data_status = "needs_review";
    row.source_type = "unknown";
    row.source_reference = simpleRow.notes;
    row.image_status = imageStatus;
    row.compatibility_status = "unverified";
    row.oem_status = "unknown";
    row.notes_internal = simpleRow.notes;

    return row;
  });
}

function mergeWithExistingProductRows(
  generatedRows: ProductImportRow[],
  existingRows: ProductImportRow[],
) {
  const generatedBySku = new Map(generatedRows.map((row) => [row.sku, row]));
  const generatedBySlug = new Map(generatedRows.map((row) => [row.slug, row]));
  const mergedGeneratedKeys = new Set<string>();
  let preservedCount = 0;

  const mergedRows = existingRows.map((existingRow) => {
    const generatedRow =
      generatedBySku.get(existingRow.sku) ?? generatedBySlug.get(existingRow.slug);

    if (!generatedRow) {
      preservedCount += 1;
      return existingRow;
    }

    mergedGeneratedKeys.add(generatedRow.sku);
    const existingImageIsReviewed =
      (existingRow.image_status === "own_photo" ||
        existingRow.image_status === "supplier_photo") &&
      existsSync(path.join(process.cwd(), "public", existingRow.main_image));
    const sameImage = generatedRow.main_image === existingRow.main_image;
    const mergedRow = {
      ...generatedRow,
      main_image: existingImageIsReviewed ? existingRow.main_image : generatedRow.main_image,
      gallery_images: existingImageIsReviewed
        ? existingRow.gallery_images
        : generatedRow.gallery_images,
      status: existingRow.status || generatedRow.status,
      data_status: existingRow.data_status || generatedRow.data_status,
      source_type: existingRow.source_type || generatedRow.source_type,
      source_reference: existingRow.source_reference || generatedRow.source_reference,
      verified_by: existingRow.verified_by || generatedRow.verified_by,
      verified_date: existingRow.verified_date || generatedRow.verified_date,
      compatibility_status:
        existingRow.compatibility_status || generatedRow.compatibility_status,
      oem_status: existingRow.oem_status || generatedRow.oem_status,
      notes_internal: existingRow.notes_internal || generatedRow.notes_internal,
      image_status: existingImageIsReviewed
        ? existingRow.image_status
        : sameImage
        ? existingRow.image_status || generatedRow.image_status
        : generatedRow.image_status,
    };

    mergedRow.status = getSafePublicationStatus(
      mergedRow.status,
      mergedRow.image_status,
      mergedRow.main_image,
    );

    return mergedRow;
  });

  for (const generatedRow of generatedRows) {
    if (!mergedGeneratedKeys.has(generatedRow.sku)) {
      mergedRows.push(generatedRow);
    }
  }

  return { rows: mergedRows, preservedCount };
}

async function main() {
  if (!existsSync(inputPath)) {
    console.error(`Simple product CSV not found: ${inputPath}`);
    console.error(
      "Copy data/import/products-simple-template.csv to data/import/products-simple.csv first.",
    );
    process.exit(1);
  }

  const {
    simpleRows,
    errors: simpleErrors,
    warnings: simpleWarnings,
  } = createSimpleRows(inputPath);

  if (simpleWarnings.length > 0) {
    console.log("\nSimple CSV warnings:");
    simpleWarnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (simpleErrors.length > 0) {
    console.error("\nSimple CSV errors:");
    simpleErrors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  const generatedRows = await convertSimpleRows(simpleRows);
  const existingCsv = existsSync(outputPath)
    ? rowsFromCsv(outputPath)
    : { rows: [] as ProductImportRow[], issues: [] };
  const mergedRows = mergeWithExistingProductRows(generatedRows, existingCsv.rows);
  const validationResult = validateProductRows(mergedRows.rows, existingCsv.issues);

  printIssues("Errors", validationResult.errors);
  printIssues("Warnings", validationResult.warnings);

  if (validationResult.errors.length > 0) {
    console.error("\nSimple SKU import stopped because generated product CSV has errors.");
    process.exit(1);
  }

  const csvContent = serializeProductCsv(validationResult.rows);
  const activeProductsWithoutReviewedImages = validationResult.rows.filter(
    (row) =>
      row.status === "active" &&
      (row.image_status === "placeholder" || row.image_status === "needs_photo"),
  );

  if (activeProductsWithoutReviewedImages.length > 0) {
    console.error(
      `Simple SKU merge produced ${activeProductsWithoutReviewedImages.length} active products without reviewed images.`,
    );
    process.exit(1);
  }

  console.log(`Simple product CSV: ${inputPath}`);
  console.log(`Simple products generated or updated: ${generatedRows.length}`);
  console.log(`Existing products preserved: ${mergedRows.preservedCount}`);
  console.log(`Full product CSV rows: ${validationResult.rows.length}`);
  console.log(
    `Active products after merge: ${validationResult.rows.filter((row) => row.status === "active").length}`,
  );
  console.log(
    `Draft products after merge: ${validationResult.rows.filter((row) => row.status === "draft").length}`,
  );
  console.log("Active products without reviewed images: 0");

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
