import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { parseCsv } from "./product-import-utils.ts";

export const companyClaimHeaders = [
  "claim_id",
  "claim_key",
  "claim_group",
  "market_scope",
  "public_value",
  "source_level",
  "source_kind",
  "source_reference",
  "verification_status",
  "publication_status",
  "reviewed_by",
  "reviewed_date",
  "notes_internal",
] as const;

export const companyMediaHeaders = [
  "asset_id",
  "role",
  "public_path",
  "alt_text",
  "subject_scope",
  "source_kind",
  "source_reference",
  "source_file",
  "source_owner",
  "ownership_status",
  "usage_rights_status",
  "evidence_status",
  "publication_status",
  "reviewed_by",
  "reviewed_date",
  "notes_internal",
] as const;

export type CompanyClaimRow = Record<(typeof companyClaimHeaders)[number], string>;
export type CompanyMediaRow = Record<(typeof companyMediaHeaders)[number], string>;

export const companyClaimsPath = path.resolve("data", "evidence", "company-claims.csv");
export const companyMediaPath = path.resolve("data", "assets", "company-media-assets.csv");

const verificationStatuses = new Set([
  "CONFIRMED",
  "OEM_REFERENCE",
  "STANDARD_REFERENCE",
  "NEEDS_FACTORY_CONFIRMATION",
  "DATA_CONFLICT",
]);
const sourceLevels = new Set(["A", "B", "C", "D", "unknown"]);
const claimPublicationStatuses = new Set(["approved", "internal_only", "blocked"]);
const marketScopes = new Set(["global", "china", "international", "internal"]);
const mediaRoles = new Set([
  "hero",
  "oem_reference",
  "social_preview",
  "factory",
  "production",
  "warehouse",
  "inspection",
  "packaging",
  "shipment",
]);
const mediaSourceKinds = new Set([
  "unknown",
  "generated_visual",
  "own_photo",
  "supplier_photo",
  "company_document",
]);
const ownershipStatuses = new Set(["unknown", "company_owned", "supplier_owned"]);
const usageRightsStatuses = new Set(["approved", "needs_confirmation", "restricted", "unknown"]);
const evidenceStatuses = new Set(["company_evidence", "representative_only", "unknown"]);
const mediaPublicationStatuses = new Set([
  "approved",
  "legacy_reference",
  "internal_only",
  "blocked",
]);

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function readRegistry<Header extends string>(
  filePath: string,
  expectedHeaders: readonly Header[],
  errors: string[],
) {
  if (!existsSync(filePath)) {
    errors.push(`Missing registry: ${path.relative(process.cwd(), filePath)}.`);
    return [] as Record<Header, string>[];
  }

  const parsed = parseCsv(readFileSync(filePath, "utf8"));
  if (parsed.length === 0) {
    errors.push(`Registry is empty: ${path.relative(process.cwd(), filePath)}.`);
    return [] as Record<Header, string>[];
  }

  const actualHeaders = parsed[0].map((header, index) =>
    index === 0 ? header.replace(/^\uFEFF/, "").trim() : header.trim(),
  );
  if (actualHeaders.join("|") !== expectedHeaders.join("|")) {
    errors.push(
      `${path.relative(process.cwd(), filePath)} headers do not match the governed schema.`,
    );
    return [] as Record<Header, string>[];
  }

  return parsed.slice(1).flatMap((cells, rowIndex) => {
    if (cells.length !== expectedHeaders.length) {
      errors.push(
        `${path.relative(process.cwd(), filePath)} row ${rowIndex + 2} has ${cells.length} ` +
          `fields; expected ${expectedHeaders.length}.`,
      );
      return [];
    }

    return [
      Object.fromEntries(
        expectedHeaders.map((header, index) => [header, cells[index].trim()]),
      ) as Record<Header, string>,
    ];
  });
}

function findDuplicates(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export type CompanyEvidenceValidation = {
  claimRows: CompanyClaimRow[];
  mediaRows: CompanyMediaRow[];
  errors: string[];
  warnings: string[];
};

export type CompanyEvidenceValidationOptions = {
  claimRows?: CompanyClaimRow[];
  mediaRows?: CompanyMediaRow[];
};

export function validateCompanyEvidence(
  options: CompanyEvidenceValidationOptions = {},
): CompanyEvidenceValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const claimRows =
    options.claimRows ?? readRegistry(companyClaimsPath, companyClaimHeaders, errors);
  const mediaRows =
    options.mediaRows ?? readRegistry(companyMediaPath, companyMediaHeaders, errors);

  for (const duplicate of findDuplicates(claimRows.map((row) => row.claim_id))) {
    errors.push(`Duplicate company claim ID: ${duplicate}.`);
  }
  for (const duplicate of findDuplicates(claimRows.map((row) => row.claim_key))) {
    errors.push(`Duplicate company claim key: ${duplicate}.`);
  }

  for (const row of claimRows) {
    const label = row.claim_id || "company claim with missing ID";
    for (const field of ["claim_id", "claim_key", "claim_group", "market_scope"] as const) {
      if (!row[field]) errors.push(`${label} is missing ${field}.`);
    }
    if (!marketScopes.has(row.market_scope)) {
      errors.push(`${label} has unsupported market_scope ${row.market_scope}.`);
    }
    if (!sourceLevels.has(row.source_level)) {
      errors.push(`${label} has unsupported source_level ${row.source_level}.`);
    }
    if (!verificationStatuses.has(row.verification_status)) {
      errors.push(`${label} has unsupported verification_status ${row.verification_status}.`);
    }
    if (!claimPublicationStatuses.has(row.publication_status)) {
      errors.push(`${label} has unsupported publication_status ${row.publication_status}.`);
    }
    if (row.reviewed_date && !isIsoDate(row.reviewed_date)) {
      errors.push(`${label} has an invalid reviewed_date.`);
    }
    if (row.verification_status === "CONFIRMED") {
      if (
        row.source_level !== "A" ||
        !row.source_reference ||
        !row.reviewed_by ||
        !row.reviewed_date
      ) {
        errors.push(
          `${label} lacks the Level A source and review evidence required for CONFIRMED.`,
        );
      }
    }
    if (row.publication_status === "approved") {
      if (
        row.verification_status !== "CONFIRMED" ||
        !row.public_value ||
        row.public_value === "TBD"
      ) {
        errors.push(`${label} cannot be approved without a confirmed public value.`);
      }
    }
    if (row.verification_status === "DATA_CONFLICT" && row.publication_status !== "blocked") {
      errors.push(`${label} must remain blocked while its evidence is in conflict.`);
    }
  }

  for (const duplicate of findDuplicates(mediaRows.map((row) => row.asset_id))) {
    errors.push(`Duplicate company media asset ID: ${duplicate}.`);
  }
  for (const duplicate of findDuplicates(mediaRows.map((row) => row.public_path))) {
    errors.push(`Duplicate company media public path: ${duplicate}.`);
  }

  for (const row of mediaRows) {
    const label = row.asset_id || "company media row with missing ID";
    for (const field of ["asset_id", "role", "public_path", "alt_text", "subject_scope"] as const) {
      if (!row[field]) errors.push(`${label} is missing ${field}.`);
    }
    if (!mediaRoles.has(row.role)) errors.push(`${label} has unsupported role ${row.role}.`);
    if (!mediaSourceKinds.has(row.source_kind)) {
      errors.push(`${label} has unsupported source_kind ${row.source_kind}.`);
    }
    if (!ownershipStatuses.has(row.ownership_status)) {
      errors.push(`${label} has unsupported ownership_status ${row.ownership_status}.`);
    }
    if (!usageRightsStatuses.has(row.usage_rights_status)) {
      errors.push(`${label} has unsupported usage_rights_status ${row.usage_rights_status}.`);
    }
    if (!evidenceStatuses.has(row.evidence_status)) {
      errors.push(`${label} has unsupported evidence_status ${row.evidence_status}.`);
    }
    if (!mediaPublicationStatuses.has(row.publication_status)) {
      errors.push(`${label} has unsupported publication_status ${row.publication_status}.`);
    }
    if (row.reviewed_date && !isIsoDate(row.reviewed_date)) {
      errors.push(`${label} has an invalid reviewed_date.`);
    }
    if (!row.public_path.startsWith("/images/site/")) {
      errors.push(`${label} public_path must start with /images/site/.`);
    }

    const localPath = path.resolve("public", row.public_path.replace(/^\//, ""));
    if (
      ["approved", "legacy_reference"].includes(row.publication_status) &&
      !existsSync(localPath)
    ) {
      errors.push(`${label} references a missing public file: ${row.public_path}.`);
    }
    if (row.publication_status === "approved" && row.usage_rights_status !== "approved") {
      errors.push(`${label} cannot be approved without approved usage rights.`);
    }
    if (row.evidence_status === "company_evidence") {
      if (
        row.source_kind !== "own_photo" ||
        row.ownership_status !== "company_owned" ||
        row.usage_rights_status !== "approved" ||
        !row.source_owner ||
        !row.reviewed_by ||
        !row.reviewed_date
      ) {
        errors.push(`${label} lacks the evidence required for a company_evidence asset.`);
      }
    }
    if (row.publication_status === "legacy_reference") {
      warnings.push(
        `${label} remains a legacy representative visual and is not approved company evidence.`,
      );
    }
  }

  return { claimRows, mediaRows, errors, warnings };
}
