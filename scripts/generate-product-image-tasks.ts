#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  resolveValidationInputPath,
  splitImageList,
  validateCsvFile,
  type ProductImportRow,
} from "./product-import-utils.ts";

const outputPath = path.join(process.cwd(), "docs", "product-image-tasks.csv");

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function publicImageExists(imagePath: string) {
  return imagePath.startsWith("/images/products/")
    ? existsSync(path.join(process.cwd(), "public", imagePath))
    : false;
}

function getProductFamily(row: ProductImportRow) {
  if (row.category_slug.includes("mig")) {
    return "MIG/MAG torch consumable";
  }

  if (row.category_slug.includes("tig")) {
    return "TIG torch consumable";
  }

  if (row.category_slug.includes("plasma")) {
    return "Plasma cutting consumable";
  }

  if (row.category_slug.includes("accessories")) {
    return "Welding accessory";
  }

  if (row.category_slug.includes("consumables")) {
    return "Welding consumable";
  }

  return "Welding and cutting product";
}

function getShotGuidance(row: ProductImportRow) {
  const name = row.name.toLowerCase();

  if (name.includes("liner") || name.includes("cable")) {
    return "Show full length if possible plus one close-up of connector/end detail.";
  }

  if (name.includes("connector") || name.includes("holder") || name.includes("clamp")) {
    return "Show main body at 45 degrees plus close-up of contact/connection area.";
  }

  if (name.includes("nozzle") || name.includes("electrode") || name.includes("tip")) {
    return "Show front, side and opening/thread detail when available.";
  }

  if (name.includes("cup") || name.includes("collet") || name.includes("gas lens")) {
    return "Show side view and opening detail; include size marker only if confirmed.";
  }

  return "Show product on white background with one clear front/side view.";
}

function getPriority(row: ProductImportRow) {
  if (row.category_slug.includes("mig") || row.category_slug.includes("plasma")) {
    return "P1";
  }

  if (row.category_slug.includes("tig")) {
    return "P2";
  }

  return "P3";
}

function createTaskRows(rows: ProductImportRow[]) {
  return rows.flatMap((row) => {
    const missingMainImage = !publicImageExists(row.main_image)
      ? [
          {
            sku: row.sku,
            product: row.name,
            category: row.category,
            imageType: "main_image",
            targetPath: row.main_image,
            priority: getPriority(row),
            productFamily: getProductFamily(row),
            shotGuidance: getShotGuidance(row),
            requirements:
              "Real product photo, white or light background, no watermark, no fake certification logo, no price text, product fills 70-85% of frame.",
            dataReminder:
              "Confirm material, size, thread, compatible model, package and OEM data separately; image alone does not confirm specifications.",
          },
        ]
      : [];
    const missingGalleryImages = splitImageList(row.gallery_images)
      .filter((imagePath) => !publicImageExists(imagePath))
      .map((imagePath) => ({
        sku: row.sku,
        product: row.name,
        category: row.category,
        imageType: "gallery_image",
        targetPath: imagePath,
        priority: getPriority(row),
        productFamily: getProductFamily(row),
        shotGuidance: getShotGuidance(row),
        requirements:
          "Real product photo, white or light background, no watermark, no fake certification logo, no price text, product fills 70-85% of frame.",
        dataReminder:
          "Confirm material, size, thread, compatible model, package and OEM data separately; image alone does not confirm specifications.",
      }));

    return [...missingMainImage, ...missingGalleryImages];
  });
}

const inputPath = resolveValidationInputPath(process.argv[2]);
const result = validateCsvFile(inputPath);

if (result.errors.length > 0) {
  console.error("Product image task generation failed because the product CSV has validation errors.");
  process.exit(1);
}

const taskRows = createTaskRows(result.rows);
const headers = [
  "sku",
  "product",
  "category",
  "image_type",
  "target_path",
  "priority",
  "product_family",
  "shot_guidance",
  "requirements",
  "data_reminder",
];
const lines = [
  headers.join(","),
  ...taskRows.map((row) =>
    [
      row.sku,
      row.product,
      row.category,
      row.imageType,
      row.targetPath,
      row.priority,
      row.productFamily,
      row.shotGuidance,
      row.requirements,
      row.dataReminder,
    ]
      .map(csvEscape)
      .join(","),
  ),
];

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${lines.join("\n")}\n`);

console.log(`Product image task list written to ${path.relative(process.cwd(), outputPath)}`);
console.log(`Image tasks: ${taskRows.length}`);
console.log(`Validation warnings: ${result.warnings.length}`);
