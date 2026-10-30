#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  printTechnicalEvidenceIssues,
  validateGeneralM6ContactTipIntakeRows,
  validateProductTechnicalEvidence,
} from "./product-technical-evidence-utils.ts";

const result = validateProductTechnicalEvidence();

assert.equal(result.generalM6ContactTipIntakeRows.length, 4);
assert.ok(
  result.generalM6ContactTipIntakeRows.every(
    (row) =>
      row.verification_status === "NEEDS_FACTORY_CONFIRMATION" &&
      !row.confirmed_value &&
      !row.evidence_reference &&
      !row.verified_by &&
      !row.verified_date,
  ),
  "CT0006 intake must begin as unconfirmed reference data",
);

const wrongSource = result.generalM6ContactTipIntakeRows.map((row) => ({ ...row }));
wrongSource[0].source_reference = "15AK M6 x 25 mm catalog table";
assert.ok(
  validateGeneralM6ContactTipIntakeRows(wrongSource).some((issue) =>
    issue.message.includes("source has drifted"),
  ),
);

const unsupportedConfirmation = result.generalM6ContactTipIntakeRows.map((row) => ({ ...row }));
unsupportedConfirmation[0].verification_status = "CONFIRMED";
assert.ok(
  validateGeneralM6ContactTipIntakeRows(unsupportedConfirmation).some((issue) =>
    issue.message.includes("confirmation requires"),
  ),
);

const calendarDateConfirmation = result.generalM6ContactTipIntakeRows.map((row) => ({ ...row }));
calendarDateConfirmation[0].verification_status = "CONFIRMED";
calendarDateConfirmation[0].confirmed_value = "1.2";
calendarDateConfirmation[0].evidence_type = "measurement_record";
calendarDateConfirmation[0].evidence_reference = "Synthetic exact-SKU measurement fixture";
calendarDateConfirmation[0].verified_by = "Test reviewer";
calendarDateConfirmation[0].verified_date = "2026-02-30";
assert.ok(
  validateGeneralM6ContactTipIntakeRows(calendarDateConfirmation).some((issue) =>
    issue.message.includes("confirmation requires"),
  ),
  "An impossible calendar date must not confirm technical evidence",
);
calendarDateConfirmation[0].verified_date = "2024-02-29";
assert.ok(
  !validateGeneralM6ContactTipIntakeRows(calendarDateConfirmation).some((issue) =>
    issue.message.includes("confirmation requires"),
  ),
  "A real leap day must satisfy the review-date gate",
);

const wrongSku = result.generalM6ContactTipIntakeRows.map((row) => ({ ...row }));
wrongSku[0].sku = "AF-MIG-CT-0004";
assert.ok(
  validateGeneralM6ContactTipIntakeRows(wrongSku).some((issue) =>
    issue.message.includes("identity"),
  ),
);

const unsupportedConflict = result.generalM6ContactTipIntakeRows.map((row) => ({ ...row }));
unsupportedConflict[0].verification_status = "DATA_CONFLICT";
assert.ok(
  validateGeneralM6ContactTipIntakeRows(unsupportedConflict).some((issue) =>
    issue.message.includes("data conflict requires"),
  ),
);

console.log(`Technical facts checked: ${result.facts.length}`);
console.log(`Factory confirmation rows checked: ${result.technicalIntakeRows.length}`);
console.log(`Image intake rows checked: ${result.imageIntakeRows.length}`);
console.log(
  `Independent CT0006 confirmation rows checked: ${result.generalM6ContactTipIntakeRows.length}`,
);
printTechnicalEvidenceIssues("Errors", result.errors);
printTechnicalEvidenceIssues("Warnings", result.warnings);

if (result.errors.length > 0) {
  console.error("\nProduct technical evidence validation failed.");
  process.exit(1);
}

console.log("\nProduct technical evidence validation passed.");
