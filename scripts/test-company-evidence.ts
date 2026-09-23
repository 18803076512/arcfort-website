#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  validateCompanyEvidence,
  type CompanyClaimRow,
  type CompanyMediaRow,
} from "./company-evidence-utils.ts";

const baseline = validateCompanyEvidence();
assert.equal(baseline.errors.length, 0);
assert.equal(baseline.claimRows.length, 22);
assert.equal(baseline.mediaRows.length, 3);
assert.equal(baseline.warnings.length, 3);

function claimsWithChange(mutate: (row: CompanyClaimRow) => CompanyClaimRow): CompanyClaimRow[] {
  return baseline.claimRows.map((row, index) => (index === 0 ? mutate({ ...row }) : { ...row }));
}

function mediaWithChange(mutate: (row: CompanyMediaRow) => CompanyMediaRow): CompanyMediaRow[] {
  return baseline.mediaRows.map((row, index) => (index === 0 ? mutate({ ...row }) : { ...row }));
}

const weakApprovedClaim = validateCompanyEvidence({
  claimRows: claimsWithChange((row) => ({ ...row, source_level: "D" })),
  mediaRows: baseline.mediaRows,
});
assert.ok(weakApprovedClaim.errors.some((error) => error.includes("required for CONFIRMED")));

const generatedCompanyEvidence = validateCompanyEvidence({
  claimRows: baseline.claimRows,
  mediaRows: mediaWithChange((row) => ({
    ...row,
    evidence_status: "company_evidence",
    publication_status: "approved",
    source_kind: "generated_visual",
    ownership_status: "company_owned",
    usage_rights_status: "approved",
    source_owner: "ArcFort Weld",
  })),
});
assert.ok(
  generatedCompanyEvidence.errors.some((error) =>
    error.includes("evidence required for a company_evidence asset"),
  ),
);

const unblockedConflict = validateCompanyEvidence({
  claimRows: claimsWithChange((row) => ({
    ...row,
    verification_status: "DATA_CONFLICT",
    publication_status: "internal_only",
  })),
  mediaRows: baseline.mediaRows,
});
assert.ok(unblockedConflict.errors.some((error) => error.includes("must remain blocked")));

const duplicateClaimId = validateCompanyEvidence({
  claimRows: [
    baseline.claimRows[0],
    { ...baseline.claimRows[1], claim_id: baseline.claimRows[0].claim_id },
  ],
  mediaRows: baseline.mediaRows,
});
assert.ok(duplicateClaimId.errors.some((error) => error.includes("Duplicate company claim ID")));

console.log("Company claim and media evidence gate tests passed.");
