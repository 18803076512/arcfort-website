#!/usr/bin/env node

import {
  printTechnicalEvidenceIssues,
  validateProductTechnicalEvidence,
} from "./product-technical-evidence-utils.ts";

const result = validateProductTechnicalEvidence();

console.log(`Technical facts checked: ${result.facts.length}`);
console.log(`Factory confirmation rows checked: ${result.technicalIntakeRows.length}`);
console.log(`Image intake rows checked: ${result.imageIntakeRows.length}`);
printTechnicalEvidenceIssues("Errors", result.errors);
printTechnicalEvidenceIssues("Warnings", result.warnings);

if (result.errors.length > 0) {
  console.error("\nProduct technical evidence validation failed.");
  process.exit(1);
}

console.log("\nProduct technical evidence validation passed.");
