#!/usr/bin/env node

import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  type ProductImportRow,
  printIssues,
  splitImageList,
  validateCsvFile,
} from "./product-import-utils.ts";

type ImportableProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  galleryImages: string[];
  material: string;
  size: string;
  thread: string;
  compatibleBrand: string;
  compatibleModel?: string;
  oemNumber: string;
  weight?: string;
  surfaceTreatment?: string;
  package: string;
  moq: string;
  leadTime: string;
  application: string;
  customAvailable?: string;
  sampleAvailable?: string;
  pdfUrl?: string;
  metaTitle: string;
  metaDescription: string;
  status?: "active" | "draft" | "archived";
  dataStatus?: "confirmed" | "pending" | "needs_review";
  sourceType?: "factory" | "supplier_catalog" | "official_catalog" | "customer_sample" | "unknown";
  sourceReference?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  imageStatus?: "own_photo" | "supplier_photo" | "placeholder" | "needs_photo";
  compatibilityStatus?: "confirmed" | "reference_only" | "unverified";
  oemStatus?: "confirmed" | "unknown" | "not_applicable";
};

const inputPath = path.resolve(process.argv.find((argument) => argument.endsWith(".csv")) ?? "data/import/products.csv");
const dryRun = process.argv.includes("--dry-run");
const dataFilePath = path.resolve("lib/data/products.ts");

function emptyToUndefined(value: string) {
  return value ? value : undefined;
}

function getProductId(row: ProductImportRow, existingProduct?: ImportableProduct) {
  const generatedId = row.sku.toLowerCase();

  if (!existingProduct) {
    return generatedId;
  }

  if (/^af-[a-z]+-[a-z0-9]+-\d{4}$/.test(existingProduct.id)) {
    return generatedId;
  }

  return existingProduct.id;
}

function rowToProduct(row: ProductImportRow, existingProduct?: ImportableProduct): ImportableProduct {
  return {
    ...existingProduct,
    id: getProductId(row, existingProduct),
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    category: row.category,
    categorySlug: row.category_slug,
    shortDescription: row.short_description,
    description: row.description,
    mainImage: row.main_image,
    galleryImages: splitImageList(row.gallery_images),
    material: row.material,
    size: row.size || existingProduct?.size || "Available upon request",
    thread: row.thread || existingProduct?.thread || "Available upon request",
    compatibleBrand:
      row.compatible_brand || existingProduct?.compatibleBrand || "Contact us for details",
    compatibleModel: emptyToUndefined(row.compatible_model) ?? existingProduct?.compatibleModel,
    oemNumber: row.oem_number || existingProduct?.oemNumber || "TBD",
    weight: emptyToUndefined(row.weight) ?? existingProduct?.weight,
    surfaceTreatment: emptyToUndefined(row.surface_treatment) ?? existingProduct?.surfaceTreatment,
    package: row.package,
    moq: row.moq,
    leadTime: row.lead_time,
    application: row.application || existingProduct?.application || "Industrial welding supply",
    customAvailable: emptyToUndefined(row.custom_available) ?? existingProduct?.customAvailable,
    sampleAvailable: emptyToUndefined(row.sample_available) ?? existingProduct?.sampleAvailable,
    pdfUrl: emptyToUndefined(row.pdf_url) ?? existingProduct?.pdfUrl,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    status: row.status as ImportableProduct["status"],
    dataStatus: row.data_status as ImportableProduct["dataStatus"],
    sourceType: row.source_type as ImportableProduct["sourceType"],
    sourceReference: emptyToUndefined(row.source_reference) ?? existingProduct?.sourceReference,
    verifiedBy: emptyToUndefined(row.verified_by) ?? existingProduct?.verifiedBy,
    verifiedDate: emptyToUndefined(row.verified_date) ?? existingProduct?.verifiedDate,
    imageStatus: row.image_status as ImportableProduct["imageStatus"],
    compatibilityStatus: row.compatibility_status as ImportableProduct["compatibilityStatus"],
    oemStatus: row.oem_status as ImportableProduct["oemStatus"],
  };
}

async function loadExistingProducts() {
  if (!existsSync(dataFilePath)) {
    return [] as ImportableProduct[];
  }

  const moduleUrl = `${pathToFileURL(dataFilePath).href}?importedAt=${Date.now()}`;
  const importedModule = (await import(moduleUrl)) as { arcfortProducts?: ImportableProduct[] };

  return importedModule.arcfortProducts ?? [];
}

function createConflictErrors(rows: ProductImportRow[], existingProducts: ImportableProduct[]) {
  const errors: string[] = [];
  const existingBySku = new Map(existingProducts.map((product) => [product.sku, product]));
  const existingBySlug = new Map(existingProducts.map((product) => [product.slug, product]));

  for (const row of rows) {
    const productWithSlug = existingBySlug.get(row.slug);
    const productWithSku = existingBySku.get(row.sku);

    if (productWithSku && productWithSlug && productWithSku.slug !== productWithSlug.slug) {
      errors.push(
        `CSV row ${row.sku} / ${row.slug} matches two existing products: ${productWithSku.sku} and ${productWithSlug.sku}.`,
      );
    }
  }

  return errors;
}

function sortProducts(products: ImportableProduct[]) {
  return [...products].sort((firstProduct, secondProduct) =>
    firstProduct.sku.localeCompare(secondProduct.sku),
  );
}

function serializeProductsFile(products: ImportableProduct[]) {
  return `export type ProductStatus = "active" | "draft" | "archived";
export type ProductDataStatus = "confirmed" | "pending" | "needs_review";
export type ProductSourceType =
  | "factory"
  | "supplier_catalog"
  | "official_catalog"
  | "customer_sample"
  | "unknown";
export type ProductImageStatus = "own_photo" | "supplier_photo" | "placeholder" | "needs_photo";
export type ProductCompatibilityStatus = "confirmed" | "reference_only" | "unverified";
export type ProductOemStatus = "confirmed" | "unknown" | "not_applicable";

export type ArcfortProductData = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  galleryImages: string[];
  material: string;
  size: string;
  thread: string;
  compatibleBrand: string;
  compatibleModel?: string;
  oemNumber: string;
  weight?: string;
  surfaceTreatment?: string;
  package: string;
  moq: string;
  leadTime: string;
  application: string;
  customAvailable?: string;
  sampleAvailable?: string;
  pdfUrl?: string;
  metaTitle: string;
  metaDescription: string;
  status?: ProductStatus;
  dataStatus?: ProductDataStatus;
  sourceType?: ProductSourceType;
  sourceReference?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  imageStatus?: ProductImageStatus;
  compatibilityStatus?: ProductCompatibilityStatus;
  oemStatus?: ProductOemStatus;
};

export const arcfortProducts: ArcfortProductData[] = ${JSON.stringify(products, null, 2)};
`;
}

async function main() {
  if (!existsSync(inputPath)) {
    console.error(`Product CSV not found: ${inputPath}`);
    console.error("Create data/import/products.csv from data/import/products-template.csv first.");
    process.exit(1);
  }

  const validationResult = validateCsvFile(inputPath);

  console.log(`Product CSV: ${inputPath}`);
  console.log(`Products checked: ${validationResult.rows.length}`);
  printIssues("Errors", validationResult.errors);
  printIssues("Warnings", validationResult.warnings);

  if (validationResult.errors.length > 0) {
    console.error("\nImport stopped because product CSV has errors.");
    process.exit(1);
  }

  const existingProducts = await loadExistingProducts();
  const conflictErrors = createConflictErrors(validationResult.rows, existingProducts);

  if (conflictErrors.length > 0) {
    console.error("\nImport conflicts:");
    for (const conflictError of conflictErrors) {
      console.error(`- ${conflictError}`);
    }
    process.exit(1);
  }

  const existingBySku = new Map(existingProducts.map((product) => [product.sku, product]));
  const existingBySlug = new Map(existingProducts.map((product) => [product.slug, product]));
  const csvBySku = new Map(validationResult.rows.map((row) => [row.sku, row]));
  const csvBySlug = new Map(validationResult.rows.map((row) => [row.slug, row]));
  const mergedExistingProductIds = new Set<string>();
  const mergedProducts = existingProducts.map((product) => {
    const row = csvBySku.get(product.sku) ?? csvBySlug.get(product.slug);

    if (row) {
      mergedExistingProductIds.add(product.id);
    }

    return row ? rowToProduct(row, product) : product;
  });

  for (const row of validationResult.rows) {
    const existingProduct = existingBySku.get(row.sku) ?? existingBySlug.get(row.slug);

    if (!existingProduct || !mergedExistingProductIds.has(existingProduct.id)) {
      mergedProducts.push(rowToProduct(row));
    }
  }

  const sortedProducts = sortProducts(mergedProducts);

  if (dryRun) {
    console.log(`\nDry run complete. ${sortedProducts.length} products would be written.`);
    return;
  }

  writeFileSync(dataFilePath, serializeProductsFile(sortedProducts), "utf8");
  console.log(`\nImported ${validationResult.rows.length} CSV rows.`);
  console.log(`Updated product data file: ${dataFilePath}`);
  console.log(`Total products in data file: ${sortedProducts.length}`);
}

void main();
