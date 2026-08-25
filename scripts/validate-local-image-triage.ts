#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseCsv } from "./product-import-utils.ts";
import { readImageAssetRows } from "./product-image-asset-utils.ts";

const triagePath = path.join(process.cwd(), "data", "evidence", "local-product-image-triage.csv");
const productImageDirectory = path.join(process.cwd(), "public", "images", "products");

const headers = [
  "candidate_id",
  "file_name",
  "public_path",
  "visual_family",
  "candidate_scope",
  "source_owner",
  "usage_rights_status",
  "exact_match_status",
  "review_status",
  "priority",
  "evidence_reference",
  "reviewed_by",
  "reviewed_date",
  "notes_internal",
] as const;

type Header = (typeof headers)[number];
type TriageRow = Record<Header, string>;

const requiredFields: Header[] = [
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
const allowedVisualFamilies = [
  "MIG/MAG",
  "TIG",
  "Plasma",
  "Welding Consumables",
  "Welding Accessories",
  "Welding Equipment",
  "Unknown",
] as const;
const allowedCandidateScopes = [
  "product_family_reference",
  "unknown_identity",
  "not_suitable",
] as const;
const allowedRights = ["needs_confirmation", "approved", "rejected"] as const;
const allowedExactMatches = ["unverified", "confirmed", "no_match", "data_conflict"] as const;
const allowedReviewStates = ["needs_review", "hold", "rejected", "approved"] as const;
const allowedPriorities = ["P0", "P1", "P2"] as const;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function listProductImageFiles() {
  return readdirSync(productImageDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:jpe?g|png|webp|avif)$/i.test(entry.name))
    .map((entry) => `/images/products/${entry.name}`)
    .sort((left, right) => left.localeCompare(right));
}

function countBy(rows: TriageRow[], field: Header) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const value = row[field] || "(blank)";
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

if (!existsSync(triagePath)) {
  console.error(`Local image triage file is missing: ${triagePath}`);
  process.exit(1);
}

const parsed = parseCsv(readFileSync(triagePath, "utf8"));
const actualHeaders = parsed[0]?.map((header) => header.trim()) ?? [];
const errors: string[] = [];
const warnings: string[] = [];

if (actualHeaders.join("|") !== headers.join("|")) {
  errors.push(`CSV headers must exactly match: ${headers.join(",")}`);
}

const rows = parsed
  .slice(1)
  .map(
    (cells) =>
      Object.fromEntries(
        headers.map((header) => [header, cells[actualHeaders.indexOf(header)]?.trim() ?? ""]),
      ) as TriageRow,
  );
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
    !allowedVisualFamilies.includes(row.visual_family as (typeof allowedVisualFamilies)[number])
  ) {
    errors.push(`Row ${rowNumber}: invalid visual_family ${row.visual_family}.`);
  }
  if (
    !allowedCandidateScopes.includes(row.candidate_scope as (typeof allowedCandidateScopes)[number])
  ) {
    errors.push(`Row ${rowNumber}: invalid candidate_scope ${row.candidate_scope}.`);
  }
  if (!allowedRights.includes(row.usage_rights_status as (typeof allowedRights)[number])) {
    errors.push(`Row ${rowNumber}: invalid usage_rights_status ${row.usage_rights_status}.`);
  }
  if (
    !allowedExactMatches.includes(row.exact_match_status as (typeof allowedExactMatches)[number])
  ) {
    errors.push(`Row ${rowNumber}: invalid exact_match_status ${row.exact_match_status}.`);
  }
  if (!allowedReviewStates.includes(row.review_status as (typeof allowedReviewStates)[number])) {
    errors.push(`Row ${rowNumber}: invalid review_status ${row.review_status}.`);
  }
  if (!allowedPriorities.includes(row.priority as (typeof allowedPriorities)[number])) {
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
const unassignedPaths = listProductImageFiles().filter(
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
console.log(`Priority: ${JSON.stringify(countBy(rows, "priority"))}`);
console.log(`Visual family: ${JSON.stringify(countBy(rows, "visual_family"))}`);

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
