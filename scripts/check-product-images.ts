#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  resolveValidationInputPath,
  rowsFromCsv,
  splitImageList,
  validateProductRows,
} from "./product-import-utils.ts";

type ProductImageStatus = "own_photo" | "supplier_photo" | "placeholder" | "needs_photo";

type ProductImageRecord = {
  sku: string;
  name: string;
  mainImage: string;
  galleryImages: string[];
  imageStatus?: ProductImageStatus;
};

function imageExists(imagePath: string) {
  return existsSync(path.join(process.cwd(), "public", imagePath));
}

function checkImages(products: ProductImageRecord[]) {
  const warnings: string[] = [];

  for (const product of products) {
    if (product.imageStatus === "placeholder" || product.imageStatus === "needs_photo") {
      warnings.push(
        `${product.sku} ${product.name}: image status is ${product.imageStatus}; replace it with a reviewed own or supplier photo before image SEO publication`,
      );
    }

    if (product.mainImage && product.mainImage.startsWith("/images/products/")) {
      if (!imageExists(product.mainImage)) {
        warnings.push(`${product.sku} ${product.name}: missing main image ${product.mainImage}`);
      }
    } else {
      warnings.push(
        `${product.sku} ${product.name}: main_image should start with /images/products/`,
      );
    }

    for (const galleryImage of product.galleryImages) {
      if (!galleryImage.startsWith("/images/products/")) {
        warnings.push(
          `${product.sku} ${product.name}: gallery image should start with /images/products/`,
        );
        continue;
      }

      if (!imageExists(galleryImage)) {
        warnings.push(`${product.sku} ${product.name}: missing gallery image ${galleryImage}`);
      }
    }
  }

  return warnings;
}

async function loadProductsFromDataFile() {
  const dataFilePath = path.resolve("lib/data/products.ts");
  const moduleUrl = `${pathToFileURL(dataFilePath).href}?checkedAt=${Date.now()}`;
  const importedModule = (await import(moduleUrl)) as {
    arcfortProducts?: Array<{
      sku: string;
      name: string;
      mainImage: string;
      galleryImages: string[];
      imageStatus?: ProductImageStatus;
    }>;
  };

  return (importedModule.arcfortProducts ?? []).map((product) => ({
    sku: product.sku,
    name: product.name,
    mainImage: product.mainImage,
    galleryImages: product.galleryImages,
    imageStatus: product.imageStatus,
  }));
}

async function loadProducts() {
  const csvPath = process.argv.find((argument) => argument.endsWith(".csv"));

  if (csvPath || existsSync(path.resolve("data/import/products.csv"))) {
    const inputPath = resolveValidationInputPath(csvPath);
    const { rows, issues } = rowsFromCsv(inputPath);
    const validationResult = validateProductRows(rows, issues);

    console.log(`Image source: ${inputPath}`);

    return validationResult.rows.map((row) => ({
      sku: row.sku,
      name: row.name,
      mainImage: row.main_image,
      galleryImages: splitImageList(row.gallery_images),
      imageStatus: row.image_status as ProductImageStatus,
    }));
  }

  console.log("Image source: lib/data/products.ts");

  return loadProductsFromDataFile();
}

async function main() {
  const products = await loadProducts();
  const warnings = checkImages(products);

  console.log(`Products checked: ${products.length}`);

  if (warnings.length > 0) {
    console.log("\nImage warnings:");

    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  console.log("\nProduct image check completed. Missing images are warnings only.");
}

void main();
