import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import type {
  ProductSeriesComponentComparisonSourceType,
  ProductSeriesComponentEvidenceScope,
  ProductSeriesComponentFact,
  ProductSeriesComponentField,
  ProductSeriesComponentLifecycleStatus,
  TechnicalEvidenceLevel,
  TechnicalVerificationStatus,
} from "../lib/content/schemas.ts";
import { arcfortProducts } from "../lib/data/products.ts";
import { productSeriesEvidence } from "../lib/data/product-series-evidence.ts";
import { parseCsv } from "./product-import-utils.ts";

export const seriesComponentFactPath = path.join(
  process.cwd(),
  "data",
  "evidence",
  "product-series-component-facts.csv",
);

export const seriesComponentIntakeDirectory = path.join(process.cwd(), "data", "intake");

export const generatedSeriesComponentFactPath = path.join(
  process.cwd(),
  "lib",
  "data",
  "product-series-component-facts.ts",
);

export const seriesComponentFactHeaders = [
  "fact_id",
  "series_evidence_id",
  "scope",
  "component_key",
  "component_name",
  "catalog_position",
  "variant_key",
  "variant_label",
  "field",
  "label",
  "reference_value",
  "reference_unit",
  "source_reference",
  "source_level",
  "verification_status",
  "comparison_source_type",
  "comparison_source_reference",
  "comparison_value",
  "conflict_note",
  "lifecycle_status",
  "target_sku",
  "reviewed_by",
  "reviewed_date",
  "notes_internal",
] as const;

export const seriesComponentConfirmationHeaders = [
  "candidate_id",
  "series_evidence_id",
  "component_key",
  "component_name",
  "catalog_position",
  "variant_key",
  "variant_label",
  "reference_summary",
  "requested_confirmation",
  "factory_product_name",
  "factory_sku",
  "factory_material",
  "factory_thread",
  "factory_dimensions",
  "factory_compatibility",
  "factory_packaging",
  "factory_moq",
  "factory_lead_time",
  "evidence_type",
  "evidence_reference",
  "verification_status",
  "verified_by",
  "verified_date",
  "image_request_status",
  "notes_internal",
] as const;

export const seriesComponentImageIntakeHeaders = [
  "request_id",
  "series_evidence_id",
  "candidate_id",
  "component_key",
  "variant_key",
  "variant_label",
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

export type SeriesComponentFactCsvRow = Record<(typeof seriesComponentFactHeaders)[number], string>;
export type SeriesComponentConfirmationRow = Record<
  (typeof seriesComponentConfirmationHeaders)[number],
  string
>;
export type SeriesComponentImageIntakeRow = Record<
  (typeof seriesComponentImageIntakeHeaders)[number],
  string
>;

export type SeriesComponentEvidenceIssue = {
  level: "error" | "warning";
  scope: "fact" | "confirmation" | "image";
  id?: string;
  message: string;
};

export type SeriesComponentEvidenceValidation = {
  facts: ProductSeriesComponentFact[];
  factRows: SeriesComponentFactCsvRow[];
  confirmationRows: SeriesComponentConfirmationRow[];
  imageRows: SeriesComponentImageIntakeRow[];
  confirmationPaths: string[];
  imagePaths: string[];
  errors: SeriesComponentEvidenceIssue[];
  warnings: SeriesComponentEvidenceIssue[];
};

const allowedScopes: ProductSeriesComponentEvidenceScope[] = ["series", "family", "variant"];
const allowedFields: ProductSeriesComponentField[] = [
  "component_presence",
  "series_designation",
  "compatibility_statement",
  "cooling_method",
  "cable_length",
  "rating",
  "duty_cycle",
  "wire_size",
  "profile",
  "opening",
  "outside_diameter",
  "wall_thickness",
  "overall_length",
  "material",
  "thread",
  "connection",
  "variant",
  "other",
];
const allowedSourceLevels: TechnicalEvidenceLevel[] = ["A", "B", "C", "D"];
const allowedVerificationStatuses: TechnicalVerificationStatus[] = [
  "CONFIRMED",
  "OEM_REFERENCE",
  "STANDARD_REFERENCE",
  "NEEDS_FACTORY_CONFIRMATION",
  "DATA_CONFLICT",
];
const allowedLifecycleStatuses: ProductSeriesComponentLifecycleStatus[] = [
  "evidence_only",
  "ready_for_sku",
  "mapped_to_sku",
  "blocked",
];
const allowedComparisonSources: ProductSeriesComponentComparisonSourceType[] = [
  "company_catalog",
  "official_oem_catalog",
  "standard_reference",
];
const qualifyingConfirmationEvidence = [
  "factory_confirmation",
  "factory_specification",
  "drawing",
  "approved_sample",
  "verified_reference_number",
  "confirmed_dimensions",
  "measurement_record",
  "packaging_record",
] as const;
const allowedImageRoles = ["main", "gallery", "technical", "dimension", "packaging", "bulk"];
const allowedImageStatuses = ["requested", "received", "approved", "rejected", "blocked"];
const allowedConfirmationImageStatuses = ["requested", "received", "approved", "blocked"];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const placeholderPattern = /^(available upon request|contact us for details|tbd|unknown)$/i;

function addIssue(
  issues: SeriesComponentEvidenceIssue[],
  level: SeriesComponentEvidenceIssue["level"],
  scope: SeriesComponentEvidenceIssue["scope"],
  message: string,
  id?: string,
) {
  issues.push({ level, scope, message, id });
}

function readTypedRows<const Headers extends readonly string[]>(
  filePath: string,
  expectedHeaders: Headers,
  scope: SeriesComponentEvidenceIssue["scope"],
) {
  const content = readFileSync(filePath, "utf8");
  const parsed = parseCsv(content);
  const headers = parsed[0]?.map((header) => header.trim()) ?? [];
  const issues: SeriesComponentEvidenceIssue[] = [];

  for (const header of expectedHeaders) {
    if (!headers.includes(header)) {
      addIssue(issues, "error", scope, `Missing CSV header: ${header}`);
    }
  }

  for (const header of headers) {
    if (!expectedHeaders.includes(header)) {
      addIssue(issues, "warning", scope, `Unexpected CSV header: ${header}`);
    }
  }

  const rows = parsed
    .slice(1)
    .map((cells) =>
      Object.fromEntries(
        expectedHeaders.map((header) => [header, cells[headers.indexOf(header)]?.trim() ?? ""]),
      ),
    ) as Array<Record<Headers[number], string>>;

  return { rows, issues };
}

function optional(value: string) {
  return value || undefined;
}

function discoverSeriesIntakePaths(suffix: "series-confirmation" | "image-intake") {
  const filePattern = new RegExp(`^[a-z0-9]+-${suffix}\\.csv$`);

  return readdirSync(seriesComponentIntakeDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && filePattern.test(entry.name))
    .map((entry) => path.join(seriesComponentIntakeDirectory, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

function expectedSeriesIdFromIntakePath(
  filePath: string,
  suffix: "series-confirmation" | "image-intake",
) {
  return `mig-series-${path.basename(filePath, ".csv").replace(`-${suffix}`, "")}`;
}

function factFromRow(row: SeriesComponentFactCsvRow): ProductSeriesComponentFact {
  return {
    factId: row.fact_id,
    seriesEvidenceId: row.series_evidence_id,
    scope: row.scope as ProductSeriesComponentEvidenceScope,
    componentKey: row.component_key,
    componentName: row.component_name,
    catalogPosition: optional(row.catalog_position),
    variantKey: row.variant_key,
    variantLabel: row.variant_label,
    field: row.field as ProductSeriesComponentField,
    label: row.label,
    referenceValue: row.reference_value,
    referenceUnit: optional(row.reference_unit),
    sourceReference: row.source_reference,
    sourceLevel: row.source_level as TechnicalEvidenceLevel,
    verificationStatus: row.verification_status as TechnicalVerificationStatus,
    comparisonSourceType: optional(
      row.comparison_source_type,
    ) as ProductSeriesComponentComparisonSourceType,
    comparisonSourceReference: optional(row.comparison_source_reference),
    comparisonValue: optional(row.comparison_value),
    conflictNote: optional(row.conflict_note),
    lifecycleStatus: row.lifecycle_status as ProductSeriesComponentLifecycleStatus,
    targetSku: optional(row.target_sku),
    reviewedBy: row.reviewed_by,
    reviewedDate: row.reviewed_date,
    notesInternal: optional(row.notes_internal),
  };
}

export function validateProductSeriesComponentEvidence(): SeriesComponentEvidenceValidation {
  const issues: SeriesComponentEvidenceIssue[] = [];
  const factCsv = readTypedRows(seriesComponentFactPath, seriesComponentFactHeaders, "fact");
  const confirmationPaths = discoverSeriesIntakePaths("series-confirmation");
  const expectedImagePaths = confirmationPaths.map((filePath) =>
    filePath.replace(/-series-confirmation\.csv$/, "-image-intake.csv"),
  );
  const imagePaths = expectedImagePaths.filter((filePath) => existsSync(filePath));
  for (const filePath of expectedImagePaths.filter((candidate) => !existsSync(candidate))) {
    addIssue(
      issues,
      "error",
      "image",
      `Missing matching image-intake CSV: ${path.basename(filePath)}`,
    );
  }
  const confirmationCsvs = confirmationPaths.map((filePath) => ({
    filePath,
    expectedSeriesId: expectedSeriesIdFromIntakePath(filePath, "series-confirmation"),
    ...readTypedRows(filePath, seriesComponentConfirmationHeaders, "confirmation"),
  }));
  const imageCsvs = imagePaths.map((filePath) => ({
    filePath,
    expectedSeriesId: expectedSeriesIdFromIntakePath(filePath, "image-intake"),
    ...readTypedRows(filePath, seriesComponentImageIntakeHeaders, "image"),
  }));
  issues.push(
    ...factCsv.issues,
    ...confirmationCsvs.flatMap((csv) => csv.issues),
    ...imageCsvs.flatMap((csv) => csv.issues),
  );

  const factRows = factCsv.rows as SeriesComponentFactCsvRow[];
  const confirmationRows = confirmationCsvs.flatMap(
    (csv) => csv.rows,
  ) as SeriesComponentConfirmationRow[];
  const imageRows = imageCsvs.flatMap((csv) => csv.rows) as SeriesComponentImageIntakeRow[];
  const facts = factRows.map(factFromRow);
  const seriesById = new Map(productSeriesEvidence.map((record) => [record.id, record]));
  const productBySku = new Map(arcfortProducts.map((product) => [product.sku, product]));
  const candidateById = new Map(confirmationRows.map((row) => [row.candidate_id, row]));
  const candidateByVariant = new Map(
    confirmationRows.map((row) => [`${row.series_evidence_id}:${row.variant_key}`, row]),
  );
  const seenFactIds = new Set<string>();
  const seenFactKeys = new Set<string>();

  if (confirmationPaths.length === 0) {
    addIssue(issues, "error", "confirmation", "No series confirmation intake CSV files found.");
  }
  if (imagePaths.length === 0) {
    addIssue(issues, "error", "image", "No series image-intake CSV files found.");
  }

  for (const csv of confirmationCsvs) {
    for (const row of csv.rows) {
      if (row.series_evidence_id !== csv.expectedSeriesId) {
        addIssue(
          issues,
          "error",
          "confirmation",
          `File ${path.basename(csv.filePath)} must contain only ${csv.expectedSeriesId} rows.`,
          row.candidate_id,
        );
      }
    }
  }

  for (const csv of imageCsvs) {
    for (const row of csv.rows) {
      if (row.series_evidence_id !== csv.expectedSeriesId) {
        addIssue(
          issues,
          "error",
          "image",
          `File ${path.basename(csv.filePath)} must contain only ${csv.expectedSeriesId} rows.`,
          row.request_id,
        );
      }
    }
  }

  for (const row of factRows) {
    const id = row.fact_id;
    const factKey = [row.series_evidence_id, row.variant_key, row.field, row.label].join(":");
    const comparisonFields = [
      row.comparison_source_type,
      row.comparison_source_reference,
      row.comparison_value,
      row.conflict_note,
    ];

    if (!id || seenFactIds.has(id)) {
      addIssue(issues, "error", "fact", "Missing or duplicate fact_id.", id);
    }
    seenFactIds.add(id);

    if (seenFactKeys.has(factKey)) {
      addIssue(issues, "error", "fact", "Duplicate series variant field and label record.", id);
    }
    seenFactKeys.add(factKey);

    if (!seriesById.has(row.series_evidence_id)) {
      addIssue(
        issues,
        "error",
        "fact",
        `Unknown series evidence ID: ${row.series_evidence_id}`,
        id,
      );
    }
    if (!allowedScopes.includes(row.scope as ProductSeriesComponentEvidenceScope)) {
      addIssue(issues, "error", "fact", `Invalid scope: ${row.scope}`, id);
    }
    if (!allowedFields.includes(row.field as ProductSeriesComponentField)) {
      addIssue(issues, "error", "fact", `Invalid field: ${row.field}`, id);
    }
    if (!allowedSourceLevels.includes(row.source_level as TechnicalEvidenceLevel)) {
      addIssue(issues, "error", "fact", `Invalid source level: ${row.source_level}`, id);
    }
    if (
      !allowedVerificationStatuses.includes(row.verification_status as TechnicalVerificationStatus)
    ) {
      addIssue(
        issues,
        "error",
        "fact",
        `Invalid verification status: ${row.verification_status}`,
        id,
      );
    }
    if (
      !allowedLifecycleStatuses.includes(
        row.lifecycle_status as ProductSeriesComponentLifecycleStatus,
      )
    ) {
      addIssue(issues, "error", "fact", `Invalid lifecycle status: ${row.lifecycle_status}`, id);
    }
    if (
      !row.component_key ||
      !row.component_name ||
      !row.variant_key ||
      !row.variant_label ||
      !row.label ||
      !row.reference_value ||
      placeholderPattern.test(row.reference_value) ||
      !row.source_reference ||
      !row.reviewed_by ||
      !datePattern.test(row.reviewed_date)
    ) {
      addIssue(
        issues,
        "error",
        "fact",
        "Fact requires sourced reference data, identifiers, reviewer and an ISO review date.",
        id,
      );
    }

    if (row.verification_status === "DATA_CONFLICT") {
      if (
        !allowedComparisonSources.includes(
          row.comparison_source_type as ProductSeriesComponentComparisonSourceType,
        ) ||
        !row.comparison_source_reference ||
        !row.comparison_value ||
        !row.conflict_note ||
        row.lifecycle_status !== "blocked"
      ) {
        addIssue(
          issues,
          "error",
          "fact",
          "DATA_CONFLICT requires a comparison source, reference, value, conflict note and blocked lifecycle.",
          id,
        );
      }
    } else if (comparisonFields.some(Boolean)) {
      addIssue(issues, "error", "fact", "Non-conflict facts must not contain conflict fields.", id);
    }

    if (row.lifecycle_status === "mapped_to_sku") {
      if (!row.target_sku || !productBySku.has(row.target_sku)) {
        addIssue(issues, "error", "fact", "mapped_to_sku requires a canonical product SKU.", id);
      }
    } else if (row.target_sku) {
      addIssue(issues, "error", "fact", "target_sku is allowed only for mapped_to_sku facts.", id);
    }

    if (row.lifecycle_status === "ready_for_sku" && row.verification_status === "DATA_CONFLICT") {
      addIssue(issues, "error", "fact", "A conflicting fact cannot be ready for SKU creation.", id);
    }

    if (row.verification_status === "CONFIRMED") {
      const candidate = candidateByVariant.get(`${row.series_evidence_id}:${row.variant_key}`);
      const hasEvidence = qualifyingConfirmationEvidence.includes(
        candidate?.evidence_type as (typeof qualifyingConfirmationEvidence)[number],
      );
      if (
        row.source_level !== "A" ||
        row.scope !== "variant" ||
        !candidate ||
        candidate.verification_status !== "CONFIRMED" ||
        !hasEvidence ||
        !candidate.evidence_reference ||
        !candidate.verified_by ||
        !datePattern.test(candidate.verified_date)
      ) {
        addIssue(
          issues,
          "error",
          "fact",
          "CONFIRMED requires a variant-scoped Level A fact and a matching confirmed factory intake record with qualifying evidence.",
          id,
        );
      }
    }

    if (
      row.scope === "variant" &&
      !candidateByVariant.has(`${row.series_evidence_id}:${row.variant_key}`)
    ) {
      addIssue(issues, "error", "fact", "Variant-scoped fact has no intake candidate.", id);
    }
  }

  const seenCandidateIds = new Set<string>();
  const seenCandidateVariants = new Set<string>();
  const seenFactorySkus = new Set<string>();

  for (const row of confirmationRows) {
    const id = row.candidate_id;
    if (!id || seenCandidateIds.has(id)) {
      addIssue(issues, "error", "confirmation", "Missing or duplicate candidate_id.", id);
    }
    seenCandidateIds.add(id);
    const candidateVariantKey = `${row.series_evidence_id}:${row.variant_key}`;
    if (!row.variant_key || seenCandidateVariants.has(candidateVariantKey)) {
      addIssue(issues, "error", "confirmation", "Missing or duplicate variant_key.", id);
    }
    seenCandidateVariants.add(candidateVariantKey);

    if (!seriesById.has(row.series_evidence_id)) {
      addIssue(
        issues,
        "error",
        "confirmation",
        `Unknown series evidence ID: ${row.series_evidence_id}`,
        id,
      );
    }
    if (
      !row.component_key ||
      !row.component_name ||
      !row.variant_label ||
      !row.reference_summary ||
      !row.requested_confirmation
    ) {
      addIssue(
        issues,
        "error",
        "confirmation",
        "Candidate identity and confirmation request are required.",
        id,
      );
    }
    if (
      !allowedVerificationStatuses.includes(row.verification_status as TechnicalVerificationStatus)
    ) {
      addIssue(
        issues,
        "error",
        "confirmation",
        `Invalid verification status: ${row.verification_status}`,
        id,
      );
    }
    if (!allowedConfirmationImageStatuses.includes(row.image_request_status)) {
      addIssue(
        issues,
        "error",
        "confirmation",
        `Invalid image request status: ${row.image_request_status}`,
        id,
      );
    }
    if (Boolean(row.verified_by) !== Boolean(row.verified_date)) {
      addIssue(
        issues,
        "error",
        "confirmation",
        "Reviewer and review date must be recorded together.",
        id,
      );
    }
    if (row.verified_date && !datePattern.test(row.verified_date)) {
      addIssue(issues, "error", "confirmation", "verified_date must use YYYY-MM-DD.", id);
    }

    const factoryFields = [
      row.factory_product_name,
      row.factory_sku,
      row.factory_material,
      row.factory_thread,
      row.factory_dimensions,
      row.factory_compatibility,
      row.factory_packaging,
      row.factory_moq,
      row.factory_lead_time,
    ];
    if (row.verification_status === "CONFIRMED") {
      const hasEvidence = qualifyingConfirmationEvidence.includes(
        row.evidence_type as (typeof qualifyingConfirmationEvidence)[number],
      );
      if (
        !row.factory_product_name ||
        !row.factory_sku ||
        !/^AF-(MIG|TIG|PLA|CON|MAC|ACC)-[A-Z0-9]+-\d{4}$/.test(row.factory_sku) ||
        !hasEvidence ||
        !row.evidence_reference ||
        !row.verified_by ||
        !datePattern.test(row.verified_date)
      ) {
        addIssue(
          issues,
          "error",
          "confirmation",
          "Confirmed candidate requires a product name, valid SKU, qualifying evidence, evidence reference, reviewer and date.",
          id,
        );
      }
      if (seenFactorySkus.has(row.factory_sku)) {
        addIssue(issues, "error", "confirmation", "Confirmed factory SKU is duplicated.", id);
      }
      seenFactorySkus.add(row.factory_sku);
    } else if (factoryFields.some(Boolean) || row.evidence_type || row.evidence_reference) {
      addIssue(
        issues,
        "warning",
        "confirmation",
        "Candidate contains draft factory data but remains unconfirmed; it must not be published.",
        id,
      );
    }

    const presenceFacts = factRows.filter(
      (fact) =>
        fact.series_evidence_id === row.series_evidence_id &&
        fact.variant_key === row.variant_key &&
        fact.field === "component_presence",
    );
    if (presenceFacts.length !== 1) {
      addIssue(
        issues,
        "error",
        "confirmation",
        `Candidate must have exactly one component_presence fact; found ${presenceFacts.length}.`,
        id,
      );
    } else if (
      presenceFacts[0].component_key !== row.component_key ||
      presenceFacts[0].variant_label !== row.variant_label
    ) {
      addIssue(
        issues,
        "error",
        "confirmation",
        "Candidate identity drifted from its presence fact.",
        id,
      );
    }
  }

  for (const row of factRows.filter((fact) => fact.field === "component_presence")) {
    if (!candidateByVariant.has(`${row.series_evidence_id}:${row.variant_key}`)) {
      addIssue(
        issues,
        "error",
        "fact",
        "Component presence fact has no intake candidate.",
        row.fact_id,
      );
    }
  }

  const detailedSeriesIds = new Set(factRows.map((row) => row.series_evidence_id));
  const confirmationSeriesIds = new Set(confirmationRows.map((row) => row.series_evidence_id));
  const imageSeriesIds = new Set(imageRows.map((row) => row.series_evidence_id));
  for (const seriesEvidenceId of detailedSeriesIds) {
    if (!confirmationSeriesIds.has(seriesEvidenceId)) {
      addIssue(
        issues,
        "error",
        "confirmation",
        `Detailed series has no confirmation intake rows: ${seriesEvidenceId}`,
      );
    }
    if (!imageSeriesIds.has(seriesEvidenceId)) {
      addIssue(
        issues,
        "error",
        "image",
        `Detailed series has no image-intake rows: ${seriesEvidenceId}`,
      );
    }
  }

  const seenImageIds = new Set<string>();
  const seenImagePaths = new Set<string>();
  for (const row of imageRows) {
    const id = row.request_id;
    const candidate = candidateById.get(row.candidate_id);
    if (!id || seenImageIds.has(id)) {
      addIssue(issues, "error", "image", "Missing or duplicate request_id.", id);
    }
    seenImageIds.add(id);
    if (!candidate) {
      addIssue(issues, "error", "image", "Image request has no matching candidate.", id);
    } else if (
      row.series_evidence_id !== candidate.series_evidence_id ||
      row.component_key !== candidate.component_key ||
      row.variant_key !== candidate.variant_key ||
      row.variant_label !== candidate.variant_label
    ) {
      addIssue(issues, "error", "image", "Image request identity drifted from its candidate.", id);
    }
    if (!allowedImageRoles.includes(row.asset_role)) {
      addIssue(issues, "error", "image", `Invalid asset role: ${row.asset_role}`, id);
    }
    if (!allowedImageStatuses.includes(row.review_status)) {
      addIssue(issues, "error", "image", `Invalid review status: ${row.review_status}`, id);
    }
    const seriesPathKey = row.series_evidence_id.replace(/^mig-series-/, "");
    const expectedImagePrefix = `/images/products/${seriesPathKey}-intake/`;
    if (!row.target_path.startsWith(expectedImagePrefix)) {
      addIssue(issues, "error", "image", `target_path must use ${expectedImagePrefix}.`, id);
    }
    if (seenImagePaths.has(row.target_path)) {
      addIssue(issues, "error", "image", "Duplicate target_path.", id);
    }
    seenImagePaths.add(row.target_path);
    if (!row.image_type || !row.shot_guidance || !row.required_detail) {
      addIssue(
        issues,
        "error",
        "image",
        "Image type, shot guidance and required detail are required.",
        id,
      );
    }
    if (Boolean(row.reviewed_by) !== Boolean(row.reviewed_date)) {
      addIssue(issues, "error", "image", "Reviewer and review date must be recorded together.", id);
    }
    if (row.reviewed_date && !datePattern.test(row.reviewed_date)) {
      addIssue(issues, "error", "image", "reviewed_date must use YYYY-MM-DD.", id);
    }

    const localPath = path.join(process.cwd(), "public", row.target_path.replace(/^\/+/, ""));
    if (row.review_status === "approved") {
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
          "image",
          "Approved image requires source owner, usage rights, source file, reviewer, date and an existing local file.",
          id,
        );
      }
    } else if (
      row.review_status === "received" &&
      (!row.source_owner || !row.file_name || !existsSync(localPath))
    ) {
      addIssue(
        issues,
        "error",
        "image",
        "Received image requires a source owner, source file and existing local file.",
        id,
      );
    }
  }

  for (const candidate of confirmationRows) {
    const mainRequests = imageRows.filter(
      (row) => row.candidate_id === candidate.candidate_id && row.asset_role === "main",
    );
    if (mainRequests.length !== 1) {
      addIssue(
        issues,
        "error",
        "image",
        `Candidate requires exactly one main image request; found ${mainRequests.length}.`,
        candidate.candidate_id,
      );
    }
  }

  return {
    facts,
    factRows,
    confirmationRows,
    imageRows,
    confirmationPaths,
    imagePaths,
    errors: issues.filter((issue) => issue.level === "error"),
    warnings: issues.filter((issue) => issue.level === "warning"),
  };
}

export async function renderProductSeriesComponentFacts(facts: ProductSeriesComponentFact[]) {
  const source = [
    "// This file is generated from data/evidence/product-series-component-facts.csv.",
    "// Update the CSV and run npm run series:components:generate.",
    'import type { ProductSeriesComponentFact } from "../content/schemas";',
    "",
    `export const productSeriesComponentFacts: ProductSeriesComponentFact[] = ${JSON.stringify(facts, null, 2)};`,
    "",
  ].join("\n");

  return format(source, { parser: "typescript", printWidth: 100 });
}

export function printSeriesComponentIssues(title: string, issues: SeriesComponentEvidenceIssue[]) {
  if (issues.length === 0) {
    console.log(`${title}: none`);
    return;
  }

  console.log(`${title}:`);
  for (const issue of issues) {
    console.log(`- [${issue.scope}]${issue.id ? ` ${issue.id}:` : ""} ${issue.message}`);
  }
}

export function readGeneratedSeriesComponentFacts() {
  return readFileSync(generatedSeriesComponentFactPath, "utf8");
}
