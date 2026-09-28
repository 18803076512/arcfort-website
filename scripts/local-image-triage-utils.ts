import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseCsv } from "./product-import-utils.ts";

export const localImageTriagePath = path.join(
  process.cwd(),
  "data",
  "evidence",
  "local-product-image-triage.csv",
);

export const productImageDirectory = path.join(process.cwd(), "public", "images", "products");

export const localImageTriageHeaders = [
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

export type LocalImageTriageHeader = (typeof localImageTriageHeaders)[number];
export type LocalImageTriageRow = Record<LocalImageTriageHeader, string>;

export const allowedLocalImageVisualFamilies = [
  "MIG/MAG",
  "TIG",
  "Plasma",
  "Welding Consumables",
  "Welding Accessories",
  "Welding Equipment",
  "Unknown",
] as const;

export const allowedLocalImageCandidateScopes = [
  "product_family_reference",
  "unknown_identity",
  "not_suitable",
] as const;

export const allowedLocalImageRights = ["needs_confirmation", "approved", "rejected"] as const;
export const allowedLocalImageExactMatches = [
  "unverified",
  "confirmed",
  "no_match",
  "data_conflict",
] as const;
export const allowedLocalImageReviewStates = [
  "needs_review",
  "hold",
  "rejected",
  "approved",
] as const;
export const allowedLocalImagePriorities = ["P0", "P1", "P2"] as const;

export function readLocalImageTriageRows(filePath = localImageTriagePath) {
  const parsed = parseCsv(readFileSync(filePath, "utf8"));
  const headers = parsed[0]?.map((header) => header.trim()) ?? [];
  const rows = parsed
    .slice(1)
    .map(
      (cells) =>
        Object.fromEntries(
          localImageTriageHeaders.map((header) => [
            header,
            cells[headers.indexOf(header)]?.trim() ?? "",
          ]),
        ) as LocalImageTriageRow,
    );

  return { headers, rows };
}

export function listLocalProductImageFiles(directory = productImageDirectory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:jpe?g|png|webp|avif)$/i.test(entry.name))
    .map((entry) => `/images/products/${entry.name}`)
    .sort((left, right) => left.localeCompare(right));
}

export function countLocalImageTriageBy(
  rows: LocalImageTriageRow[],
  field: LocalImageTriageHeader,
) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const value = row[field] || "(blank)";
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
