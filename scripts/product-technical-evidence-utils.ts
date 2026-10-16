import { existsSync } from "node:fs";
import path from "node:path";
import { getAllCompatibilityRelationships } from "../lib/content/compatibility.ts";
import {
  formatTechnicalFactValue,
  getAllProductTechnicalFacts,
  isPublicTechnicalFact,
} from "../lib/content/product-technical-facts.ts";
import type {
  ProductTechnicalEvidenceBasis,
  TechnicalVerificationStatus,
} from "../lib/content/schemas.ts";
import { arcfortProducts } from "../lib/data/products.ts";
import { readCsvFile } from "./product-import-utils.ts";

export const technicalIntakePath = path.join(
  process.cwd(),
  "data",
  "intake",
  "15ak-technical-confirmation.csv",
);

export const imageIntakePath = path.join(
  process.cwd(),
  "data",
  "intake",
  "15ak-product-image-intake.csv",
);

export const technicalIntakeHeaders = [
  "record_id",
  "sku",
  "product_slug",
  "field",
  "label",
  "variant",
  "reference_value",
  "reference_unit",
  "source_reference",
  "requested_confirmation",
  "confirmed_value",
  "confirmed_unit",
  "evidence_type",
  "evidence_reference",
  "verification_status",
  "verified_by",
  "verified_date",
  "notes_internal",
] as const;

export const imageIntakeHeaders = [
  "request_id",
  "sku",
  "product_slug",
  "asset_role",
  "image_type",
  "target_path",
  "shot_guidance",
  "required_detail",
  "source_owner",
  "usage_rights",
  "file_name",
  "review_status",
  "reviewed_by",
  "reviewed_date",
  "notes_internal",
] as const;

export type TechnicalIntakeRow = Record<(typeof technicalIntakeHeaders)[number], string>;
export type ImageIntakeRow = Record<(typeof imageIntakeHeaders)[number], string>;

export type TechnicalEvidenceIssue = {
  level: "error" | "warning";
  scope: "fact" | "technical_intake" | "image_intake";
  id?: string;
  message: string;
};

export type TechnicalEvidenceValidation = {
  facts: ReturnType<typeof getAllProductTechnicalFacts>;
  technicalIntakeRows: TechnicalIntakeRow[];
  imageIntakeRows: ImageIntakeRow[];
  errors: TechnicalEvidenceIssue[];
  warnings: TechnicalEvidenceIssue[];
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const placeholderPattern = /^(available upon request|contact us for details|tbd|unknown)$/i;
const allowedVerificationStatuses: TechnicalVerificationStatus[] = [
  "CONFIRMED",
  "OEM_REFERENCE",
  "STANDARD_REFERENCE",
  "NEEDS_FACTORY_CONFIRMATION",
  "DATA_CONFLICT",
];
const qualifyingConfirmationEvidence: ProductTechnicalEvidenceBasis[] = [
  "factory_confirmation",
  "factory_specification",
  "drawing",
  "approved_sample",
  "verified_reference_number",
  "confirmed_dimensions",
  "measurement_record",
  "packaging_record",
];
const allowedImageRoles = ["main", "gallery", "technical", "packaging"] as const;
const allowedImageStatuses = ["requested", "received", "approved", "rejected"] as const;

function readTypedRows<const Headers extends readonly string[]>(
  filePath: string,
  expectedHeaders: Headers,
) {
  const { headers, dataRows } = readCsvFile(filePath);
  const issues: TechnicalEvidenceIssue[] = [];

  for (const header of expectedHeaders) {
    if (!headers.includes(header)) {
      issues.push({
        level: "error",
        scope: filePath === technicalIntakePath ? "technical_intake" : "image_intake",
        message: `Missing CSV header: ${header}`,
      });
    }
  }

  for (const header of headers) {
    if (!expectedHeaders.includes(header)) {
      issues.push({
        level: "warning",
        scope: filePath === technicalIntakePath ? "technical_intake" : "image_intake",
        message: `Unexpected CSV header: ${header}`,
      });
    }
  }

  const rows = dataRows.map((cells) =>
    Object.fromEntries(
      expectedHeaders.map((header) => [header, cells[headers.indexOf(header)]?.trim() ?? ""]),
    ),
  ) as Array<Record<Headers[number], string>>;

  return { rows, issues };
}

function addIssue(
  issues: TechnicalEvidenceIssue[],
  level: TechnicalEvidenceIssue["level"],
  scope: TechnicalEvidenceIssue["scope"],
  message: string,
  id?: string,
) {
  issues.push({ level, scope, message, id });
}

export function validateProductTechnicalEvidence(): TechnicalEvidenceValidation {
  const issues: TechnicalEvidenceIssue[] = [];
  const facts = getAllProductTechnicalFacts();
  const productBySlug = new Map(arcfortProducts.map((product) => [product.slug, product]));
  const factById = new Map(facts.map((fact) => [fact.id, fact]));
  const seenFactIds = new Set<string>();
  const seenFactKeys = new Set<string>();

  for (const fact of facts) {
    const product = productBySlug.get(fact.productSlug);
    const factKey = [fact.productSlug, fact.field, fact.variant ?? "", fact.label].join(":");

    if (seenFactIds.has(fact.id)) {
      addIssue(issues, "error", "fact", "Duplicate technical fact ID.", fact.id);
    }
    seenFactIds.add(fact.id);

    if (seenFactKeys.has(factKey)) {
      addIssue(issues, "error", "fact", "Duplicate product field and variant record.", fact.id);
    }
    seenFactKeys.add(factKey);

    if (!product) {
      addIssue(issues, "error", "fact", `Unknown product slug: ${fact.productSlug}`, fact.id);
      continue;
    }

    if ((product.status ?? "active") !== "active") {
      addIssue(issues, "error", "fact", "Technical fact points to a non-active product.", fact.id);
    }

    if (!fact.fieldValue.trim() || placeholderPattern.test(fact.fieldValue.trim())) {
      addIssue(
        issues,
        "error",
        "fact",
        "Technical fact must contain a sourced reference value.",
        fact.id,
      );
    }

    if (!fact.sourceReference.trim() || !fact.reviewedBy.trim()) {
      addIssue(issues, "error", "fact", "Source reference and reviewer are required.", fact.id);
    }

    if (fact.evidenceBasis.length === 0 || fact.displayOrder < 1) {
      addIssue(
        issues,
        "error",
        "fact",
        "Technical fact requires evidence basis and a positive display order.",
        fact.id,
      );
    }

    if (!datePattern.test(fact.lastVerifiedDate)) {
      addIssue(issues, "error", "fact", "lastVerifiedDate must use YYYY-MM-DD.", fact.id);
    }

    if (fact.verificationStatus === "CONFIRMED") {
      const hasQualifyingEvidence = fact.evidenceBasis.some((basis) =>
        qualifyingConfirmationEvidence.includes(basis),
      );

      if (!hasQualifyingEvidence || fact.sourceLevel !== "A") {
        addIssue(
          issues,
          "error",
          "fact",
          "CONFIRMED requires Level A data and qualifying factory, drawing, sample, reference or measurement evidence.",
          fact.id,
        );
      }
    }

    if (
      fact.verificationStatus === "NEEDS_FACTORY_CONFIRMATION" &&
      fact.confirmationRequirements.length < 2
    ) {
      addIssue(
        issues,
        "error",
        "fact",
        "Needs-confirmation facts require at least two concrete confirmation requirements.",
        fact.id,
      );
    }

    if (
      fact.verificationStatus !== "CONFIRMED" &&
      !fact.publicNote.toLowerCase().includes("confirm")
    ) {
      addIssue(
        issues,
        "error",
        "fact",
        "Unconfirmed public reference needs an explicit confirmation note.",
        fact.id,
      );
    }
  }

  const fifteenAkProductSlugs = new Set(
    getAllCompatibilityRelationships()
      .filter((relationship) => relationship.target.id === "mig-series-15ak")
      .map((relationship) => relationship.subject.id),
  );

  for (const productSlug of fifteenAkProductSlugs) {
    if (!facts.some((fact) => fact.productSlug === productSlug)) {
      addIssue(
        issues,
        "error",
        "fact",
        `15AK governed product has no field-level technical facts: ${productSlug}`,
      );
    }
  }

  const technicalCsv = readTypedRows(technicalIntakePath, technicalIntakeHeaders);
  issues.push(...technicalCsv.issues);
  const technicalIntakeRows = technicalCsv.rows as TechnicalIntakeRow[];
  const seenTechnicalRows = new Set<string>();

  for (const row of technicalIntakeRows) {
    const fact = factById.get(row.record_id);
    const product = productBySlug.get(row.product_slug);

    if (!row.record_id || seenTechnicalRows.has(row.record_id)) {
      addIssue(
        issues,
        "error",
        "technical_intake",
        "Missing or duplicate record_id.",
        row.record_id,
      );
    }
    seenTechnicalRows.add(row.record_id);

    if (!fact) {
      addIssue(
        issues,
        "error",
        "technical_intake",
        "Intake row has no canonical fact.",
        row.record_id,
      );
      continue;
    }

    if (!product || product.sku !== row.sku || fact.productSlug !== row.product_slug) {
      addIssue(
        issues,
        "error",
        "technical_intake",
        "Product slug or SKU does not match canonical data.",
        row.record_id,
      );
    }

    if (
      row.field !== fact.field ||
      row.label !== fact.label ||
      row.variant !== (fact.variant ?? "") ||
      row.reference_value !== fact.fieldValue ||
      row.reference_unit !== (fact.unit ?? "")
    ) {
      addIssue(
        issues,
        "error",
        "technical_intake",
        "Reference fields drifted from the canonical fact.",
        row.record_id,
      );
    }

    if (!row.requested_confirmation) {
      addIssue(
        issues,
        "error",
        "technical_intake",
        "Factory intake row requires a concrete confirmation request.",
        row.record_id,
      );
    }

    if (
      !allowedVerificationStatuses.includes(row.verification_status as TechnicalVerificationStatus)
    ) {
      addIssue(
        issues,
        "error",
        "technical_intake",
        `Invalid verification status: ${row.verification_status}`,
        row.record_id,
      );
    }

    if (row.verification_status === "CONFIRMED") {
      const hasEvidence = qualifyingConfirmationEvidence.includes(
        row.evidence_type as ProductTechnicalEvidenceBasis,
      );
      if (
        !row.confirmed_value ||
        !hasEvidence ||
        !row.evidence_reference ||
        !row.verified_by ||
        !datePattern.test(row.verified_date)
      ) {
        addIssue(
          issues,
          "error",
          "technical_intake",
          "Confirmed intake data requires a value, qualifying evidence, evidence reference, reviewer and date.",
          row.record_id,
        );
      }
    } else if (row.confirmed_value || row.confirmed_unit) {
      addIssue(
        issues,
        "error",
        "technical_intake",
        "A confirmed value cannot be stored under an unconfirmed verification status.",
        row.record_id,
      );
    }

    if (
      fact.verificationStatus === "CONFIRMED" &&
      (row.verification_status !== "CONFIRMED" ||
        row.confirmed_value !== fact.fieldValue ||
        row.confirmed_unit !== (fact.unit ?? ""))
    ) {
      addIssue(
        issues,
        "error",
        "technical_intake",
        "Canonical confirmed fact must match a completed confirmed intake row.",
        row.record_id,
      );
    }
  }

  for (const fact of facts) {
    if (!seenTechnicalRows.has(fact.id)) {
      addIssue(
        issues,
        "error",
        "technical_intake",
        "Canonical fact is missing from the factory intake CSV.",
        fact.id,
      );
    }
  }

  const imageCsv = readTypedRows(imageIntakePath, imageIntakeHeaders);
  issues.push(...imageCsv.issues);
  const imageIntakeRows = imageCsv.rows as ImageIntakeRow[];
  const seenImageIds = new Set<string>();
  const seenImagePaths = new Set<string>();

  for (const row of imageIntakeRows) {
    const product = productBySlug.get(row.product_slug);

    if (!row.request_id || seenImageIds.has(row.request_id)) {
      addIssue(issues, "error", "image_intake", "Missing or duplicate request_id.", row.request_id);
    }
    seenImageIds.add(row.request_id);

    if (!product || product.sku !== row.sku) {
      addIssue(
        issues,
        "error",
        "image_intake",
        "Product slug or SKU does not match canonical data.",
        row.request_id,
      );
    }

    if (!allowedImageRoles.includes(row.asset_role as (typeof allowedImageRoles)[number])) {
      addIssue(
        issues,
        "error",
        "image_intake",
        `Invalid asset role: ${row.asset_role}`,
        row.request_id,
      );
    }

    if (
      !allowedImageStatuses.includes(row.review_status as (typeof allowedImageStatuses)[number])
    ) {
      addIssue(
        issues,
        "error",
        "image_intake",
        `Invalid review status: ${row.review_status}`,
        row.request_id,
      );
    }

    if (!row.target_path.startsWith("/images/products/")) {
      addIssue(
        issues,
        "error",
        "image_intake",
        "target_path must begin with /images/products/.",
        row.request_id,
      );
    }

    if (!row.image_type || !row.shot_guidance || !row.required_detail) {
      addIssue(
        issues,
        "error",
        "image_intake",
        "Image request requires type, shot guidance and required detail.",
        row.request_id,
      );
    }

    if (seenImagePaths.has(row.target_path)) {
      addIssue(issues, "error", "image_intake", "Duplicate target image path.", row.request_id);
    }
    seenImagePaths.add(row.target_path);

    if (row.review_status === "approved") {
      const localPath = path.join(process.cwd(), "public", row.target_path);
      if (
        !row.source_owner ||
        !row.usage_rights ||
        !row.file_name ||
        !row.reviewed_by ||
        !datePattern.test(row.reviewed_date) ||
        !existsSync(localPath)
      ) {
        addIssue(
          issues,
          "error",
          "image_intake",
          "Approved image requires ownership, usage rights, source file, reviewer, date and a local asset.",
          row.request_id,
        );
      }
    } else if (row.review_status === "received" && (!row.source_owner || !row.file_name)) {
      addIssue(
        issues,
        "error",
        "image_intake",
        "Received image requires a source owner and original file name.",
        row.request_id,
      );
    }
  }

  for (const productSlug of fifteenAkProductSlugs) {
    const rows = imageIntakeRows.filter((row) => row.product_slug === productSlug);
    const roles = new Set(rows.map((row) => row.asset_role));
    for (const requiredRole of ["main", "technical", "packaging"]) {
      if (!roles.has(requiredRole)) {
        addIssue(
          issues,
          "error",
          "image_intake",
          `15AK image intake is missing the ${requiredRole} role for ${productSlug}.`,
        );
      }
    }
  }

  for (const fact of facts.filter(isPublicTechnicalFact)) {
    if (!formatTechnicalFactValue(fact).trim()) {
      addIssue(issues, "error", "fact", "Public technical projection is empty.", fact.id);
    }
  }

  return {
    facts,
    technicalIntakeRows,
    imageIntakeRows,
    errors: issues.filter((issue) => issue.level === "error"),
    warnings: issues.filter((issue) => issue.level === "warning"),
  };
}

export function printTechnicalEvidenceIssues(title: string, issues: TechnicalEvidenceIssue[]) {
  if (issues.length === 0) {
    console.log(`${title}: none`);
    return;
  }

  console.log(`${title}:`);
  for (const issue of issues) {
    console.log(`- [${issue.scope}]${issue.id ? ` ${issue.id}:` : ""} ${issue.message}`);
  }
}
