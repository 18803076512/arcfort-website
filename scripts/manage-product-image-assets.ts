#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  createInitialImageAssetRows,
  generatedImageAssetPath,
  imageAssetRegistryPath,
  printProductImageAssetIssues,
  readImageAssetRows,
  renderProductImageAssetData,
  serializeImageAssetCsv,
  validateProductImageAssets,
} from "./product-image-asset-utils.ts";
import { resolveValidationInputPath, validateCsvFile } from "./product-import-utils.ts";

const initialize = process.argv.includes("--initialize");
const sync = process.argv.includes("--sync");
const writeGenerated = process.argv.includes("--write");
const checkGenerated = process.argv.includes("--check");

if (initialize) {
  if (existsSync(imageAssetRegistryPath)) {
    throw new Error(
      `Refusing to overwrite existing registry: ${path.relative(process.cwd(), imageAssetRegistryPath)}`,
    );
  }

  const products = validateCsvFile(resolveValidationInputPath());
  if (products.errors.length > 0) {
    throw new Error("Cannot initialize the image registry while product CSV errors exist.");
  }

  mkdirSync(path.dirname(imageAssetRegistryPath), { recursive: true });
  writeFileSync(
    imageAssetRegistryPath,
    `${serializeImageAssetCsv(createInitialImageAssetRows(products.rows))}\n`,
  );
  console.log(
    `Initialized product image asset registry: ${path.relative(process.cwd(), imageAssetRegistryPath)}`,
  );
}

if (sync) {
  if (!existsSync(imageAssetRegistryPath)) {
    throw new Error("Image asset registry is missing. Run the initialize mode once first.");
  }

  const products = validateCsvFile(resolveValidationInputPath());
  if (products.errors.length > 0) {
    throw new Error("Cannot sync the image registry while product CSV errors exist.");
  }

  const current = readImageAssetRows();
  if (current.issues.some((issue) => issue.level === "error")) {
    throw new Error("Cannot sync an image registry with structural errors.");
  }

  const currentPaths = new Set(current.rows.map((row) => row.public_path));
  const currentIds = new Set(current.rows.map((row) => row.asset_id));
  const additions = createInitialImageAssetRows(products.rows).filter(
    (row) => !currentPaths.has(row.public_path),
  );
  const conflictingIds = additions.filter((row) => currentIds.has(row.asset_id));

  if (conflictingIds.length > 0) {
    throw new Error(
      `Cannot append ${conflictingIds.length} asset row(s) because their IDs already exist. Update the affected path and evidence row manually: ${conflictingIds.map((row) => row.asset_id).join(", ")}`,
    );
  }

  if (additions.length > 0) {
    writeFileSync(
      imageAssetRegistryPath,
      `${serializeImageAssetCsv([...current.rows, ...additions])}\n`,
    );
  }

  console.log(`Image asset registry sync added ${additions.length} row(s).`);
}

const result = validateProductImageAssets();

console.log(`Image assets checked: ${result.rows.length}`);
console.log(`Products covered: ${result.products.length}`);
printProductImageAssetIssues("Errors", result.errors);
printProductImageAssetIssues("Warnings", result.warnings);

if (result.errors.length > 0) {
  console.error("\nProduct image asset validation failed.");
  process.exit(1);
}

const generatedSource = await renderProductImageAssetData(result.rows);

if (writeGenerated) {
  mkdirSync(path.dirname(generatedImageAssetPath), { recursive: true });
  writeFileSync(generatedImageAssetPath, generatedSource);
  console.log(
    `Generated runtime image data: ${path.relative(process.cwd(), generatedImageAssetPath)}`,
  );
}

if (checkGenerated) {
  if (!existsSync(generatedImageAssetPath)) {
    throw new Error("Generated runtime image data file is missing.");
  }

  if (readFileSync(generatedImageAssetPath, "utf8") !== generatedSource) {
    throw new Error("Generated runtime image data is stale. Run npm run images:assets:generate.");
  }
}

console.log("\nProduct image asset validation passed.");
