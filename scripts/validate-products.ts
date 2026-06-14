#!/usr/bin/env node

import { resolveValidationInputPath, validateCsvFile, printIssues } from "./product-import-utils.ts";

const inputPath = resolveValidationInputPath(process.argv[2]);
const result = validateCsvFile(inputPath);

console.log(`Product CSV: ${inputPath}`);
console.log(`Products checked: ${result.rows.length}`);

printIssues("Errors", result.errors);
printIssues("Warnings", result.warnings);

if (result.errors.length > 0) {
  console.error("\nProduct CSV validation failed.");
  process.exit(1);
}

console.log("\nProduct CSV validation passed.");
