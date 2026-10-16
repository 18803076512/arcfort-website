#!/usr/bin/env node

import { validateCompanyEvidence } from "./company-evidence-utils.ts";

const result = validateCompanyEvidence();
const approvedClaims = result.claimRows.filter(
  (row) => row.publication_status === "approved",
).length;
const blockedClaims = result.claimRows.filter((row) => row.publication_status === "blocked").length;
const approvedCompanyMedia = result.mediaRows.filter(
  (row) => row.publication_status === "approved" && row.evidence_status === "company_evidence",
).length;

console.log("ArcFort Weld company evidence validation");
console.log(
  `Claims: ${result.claimRows.length} (${approvedClaims} approved, ${blockedClaims} blocked)`,
);
console.log(
  `Company media: ${result.mediaRows.length} (${approvedCompanyMedia} approved company-evidence assets)`,
);

for (const warning of result.warnings) console.warn(`Warning: ${warning}`);

if (result.errors.length > 0) {
  console.error("Company evidence validation failed:");
  for (const error of result.errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Company evidence validation passed.");
}
