#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import { readImageAssetRows } from "./product-image-asset-utils.ts";
import {
  allowedLocalImageCandidateScopes,
  allowedLocalImageExactMatches,
  allowedLocalImagePriorities,
  allowedLocalImageReviewStates,
  allowedLocalImageRights,
  allowedLocalImageVisualFamilies,
  countLocalImageTriageBy,
  listLocalProductImageFiles,
  localImageTriageHeaders,
  localImageTriagePath,
  readLocalImageTriageRows,
  type LocalImageTriageHeader,
} from "./local-image-triage-utils.ts";

const requiredFields: LocalImageTriageHeader[] = [
  "candidate_id",
  "file_name",
  "public_path",
  "visual_family",
  "candidate_scope",
  "usage_rights_status",
  "exact_match_status",
  "review_status",
  "priority",
  "notes_internal",
];
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

if (!existsSync(localImageTriagePath)) {
  console.error(`Local image triage file is missing: ${localImageTriagePath}`);
  process.exit(1);
}

const { headers: actualHeaders, rows } = readLocalImageTriageRows();
const errors: string[] = [];
const warnings: string[] = [];

if (actualHeaders.join("|") !== localImageTriageHeaders.join("|")) {
  errors.push(`CSV headers must exactly match: ${localImageTriageHeaders.join(",")}`);
}
const ids = new Set<string>();
const paths = new Set<string>();

for (const [offset, row] of rows.entries()) {
  const rowNumber = offset + 2;
  for (const field of requiredFields) {
    if (!row[field]) errors.push(`Row ${rowNumber}: ${field} is required.`);
  }

  if (!/^local-img-\d{3,}$/.test(row.candidate_id)) {
    errors.push(`Row ${rowNumber}: invalid candidate_id ${row.candidate_id}.`);
  }
  if (ids.has(row.candidate_id.toLowerCase())) {
    errors.push(`Row ${rowNumber}: duplicate candidate_id ${row.candidate_id}.`);
  }
  ids.add(row.candidate_id.toLowerCase());

  const normalizedPath = row.public_path.toLowerCase();
  if (paths.has(normalizedPath)) {
    errors.push(`Row ${rowNumber}: duplicate public_path ${row.public_path}.`);
  }
  paths.add(normalizedPath);

  if (!row.public_path.startsWith("/images/products/")) {
    errors.push(`Row ${rowNumber}: public_path must start with /images/products/.`);
  }
  if (path.posix.basename(row.public_path) !== row.file_name) {
    errors.push(`Row ${rowNumber}: file_name must match the public_path basename.`);
  }
  if (!existsSync(path.join(process.cwd(), "public", row.public_path.replace(/^\//, "")))) {
    errors.push(`Row ${rowNumber}: candidate file does not exist at ${row.public_path}.`);
  }

  if (
    !allowedLocalImageVisualFamilies.includes(
      row.visual_family as (typeof allowedLocalImageVisualFamilies)[number],
    )
  ) {
    errors.push(`Row ${rowNumber}: invalid visual_family ${row.visual_family}.`);
  }
  if (
    !allowedLocalImageCandidateScopes.includes(
      row.candidate_scope as (typeof allowedLocalImageCandidateScopes)[number],
    )
  ) {
    errors.push(`Row ${rowNumber}: invalid candidate_scope ${row.candidate_scope}.`);
  }
  if (
    !allowedLocalImageRights.includes(
      row.usage_rights_status as (typeof allowedLocalImageRights)[number],
    )
  ) {
    errors.push(`Row ${rowNumber}: invalid usage_rights_status ${row.usage_rights_status}.`);
  }
  if (
    !allowedLocalImageExactMatches.includes(
      row.exact_match_status as (typeof allowedLocalImageExactMatches)[number],
    )
  ) {
    errors.push(`Row ${rowNumber}: invalid exact_match_status ${row.exact_match_status}.`);
  }
  if (
    !allowedLocalImageReviewStates.includes(
      row.review_status as (typeof allowedLocalImageReviewStates)[number],
    )
  ) {
    errors.push(`Row ${rowNumber}: invalid review_status ${row.review_status}.`);
  }
  if (
    !allowedLocalImagePriorities.includes(
      row.priority as (typeof allowedLocalImagePriorities)[number],
    )
  ) {
    errors.push(`Row ${rowNumber}: invalid priority ${row.priority}.`);
  }
  if (row.reviewed_date && !isoDatePattern.test(row.reviewed_date)) {
    errors.push(`Row ${rowNumber}: reviewed_date must use YYYY-MM-DD.`);
  }

  const approvalEvidence = [
    row.source_owner,
    row.evidence_reference,
    row.reviewed_by,
    row.reviewed_date,
  ];
  if (row.usage_rights_status === "approved" && approvalEvidence.some((value) => !value)) {
    errors.push(
      `Row ${rowNumber}: approved usage rights require owner, evidence, reviewer and date.`,
    );
  }
  if (row.exact_match_status === "confirmed" && approvalEvidence.slice(1).some((value) => !value)) {
    errors.push(`Row ${rowNumber}: confirmed exact match requires evidence, reviewer and date.`);
  }
  if (
    row.review_status === "approved" &&
    (row.usage_rights_status !== "approved" ||
      row.exact_match_status !== "confirmed" ||
      approvalEvidence.some((value) => !value))
  ) {
    errors.push(
      `Row ${rowNumber}: approved review requires approved rights, confirmed exact match, owner, evidence, reviewer and date.`,
    );
  }
}

const registry = readImageAssetRows();
if (registry.issues.some((issue) => issue.level === "error")) {
  errors.push("Canonical image asset registry contains structural errors.");
}
const assignedPaths = new Set(registry.rows.map((row) => row.public_path.toLowerCase()));
const unassignedPaths = listLocalProductImageFiles().filter(
  (publicPath) => !assignedPaths.has(publicPath.toLowerCase()),
);

for (const publicPath of unassignedPaths) {
  if (!paths.has(publicPath.toLowerCase())) {
    errors.push(`Unassigned image is missing from triage: ${publicPath}.`);
  }
}
for (const row of rows) {
  if (assignedPaths.has(row.public_path.toLowerCase())) {
    errors.push(
      `${row.candidate_id}: ${row.public_path} is now assigned; migrate evidence to the canonical asset registry and remove the triage row.`,
    );
  }
}

if (rows.every((row) => row.usage_rights_status !== "approved")) {
  warnings.push("No local candidate currently has approved website-usage rights.");
}
if (rows.every((row) => row.exact_match_status !== "confirmed")) {
  warnings.push("No local candidate currently has a confirmed exact-product match.");
}

console.log("ArcFort Weld local product-image triage");
console.log(`Rows checked: ${rows.length}`);
console.log(`Unassigned product-image files: ${unassignedPaths.length}`);
console.log(`Priority: ${JSON.stringify(countLocalImageTriageBy(rows, "priority"))}`);
console.log(`Visual family: ${JSON.stringify(countLocalImageTriageBy(rows, "visual_family"))}`);

if (warnings.length > 0) {
  console.log("Warnings:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}
if (errors.length > 0) {
  console.error("Errors:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Local product-image triage validation passed.");
