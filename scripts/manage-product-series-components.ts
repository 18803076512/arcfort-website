#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  generatedSeriesComponentFactPath,
  printSeriesComponentIssues,
  renderProductSeriesComponentFacts,
  validateProductSeriesComponentEvidence,
} from "./product-series-component-utils.ts";

const writeGenerated = process.argv.includes("--write");
const checkGenerated = process.argv.includes("--check");
const result = validateProductSeriesComponentEvidence();

console.log(`Series component facts checked: ${result.facts.length}`);
console.log(`Series component candidates checked: ${result.confirmationRows.length}`);
console.log(`Series image requests checked: ${result.imageRows.length}`);
console.log(`Series confirmation files checked: ${result.confirmationPaths.length}`);
console.log(`Series image-intake files checked: ${result.imagePaths.length}`);
printSeriesComponentIssues("Errors", result.errors);
printSeriesComponentIssues("Warnings", result.warnings);

if (result.errors.length > 0) {
  console.error("\nProduct-series component evidence validation failed.");
  process.exit(1);
}

const generatedSource = await renderProductSeriesComponentFacts(result.facts);

if (writeGenerated) {
  mkdirSync(path.dirname(generatedSeriesComponentFactPath), { recursive: true });
  writeFileSync(generatedSeriesComponentFactPath, generatedSource);
  console.log(
    `Generated runtime series-component data: ${path.relative(process.cwd(), generatedSeriesComponentFactPath)}`,
  );
}

if (checkGenerated) {
  if (!existsSync(generatedSeriesComponentFactPath)) {
    throw new Error("Generated series-component data file is missing.");
  }
  if (readFileSync(generatedSeriesComponentFactPath, "utf8") !== generatedSource) {
    throw new Error(
      "Generated series-component data is stale. Run npm run series:components:generate.",
    );
  }
}

console.log("\nProduct-series component evidence validation passed.");
