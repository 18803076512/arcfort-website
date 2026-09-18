#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import { productSeriesEvidence } from "../lib/data/product-series-evidence.ts";
import { validateProductSeriesComponentEvidence } from "./product-series-component-utils.ts";

const outputPath = path.join(process.cwd(), "docs", "product-series-component-evidence-report.md");

function escapeTable(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function formatCounts(values: string[]) {
  const counts = values.reduce<Record<string, number>>((result, value) => {
    const key = value || "blank";
    result[key] = (result[key] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([status, count]) => `- ${status}: ${count}`)
    .join("\n");
}

function seriesLabel(seriesEvidenceId: string) {
  return (
    productSeriesEvidence.find((record) => record.id === seriesEvidenceId)?.name ?? seriesEvidenceId
  );
}

function buildReport() {
  const result = validateProductSeriesComponentEvidence();
  if (result.errors.length > 0) {
    throw new Error(
      "Series-component evidence report cannot be generated while validation errors exist.",
    );
  }

  const reviewedSeriesIds = Array.from(
    new Set(result.facts.map((fact) => fact.seriesEvidenceId)),
  ).sort((left, right) => seriesLabel(left).localeCompare(seriesLabel(right)));
  const conflicts = result.facts.filter((fact) => fact.verificationStatus === "DATA_CONFLICT");
  const confirmedFacts = result.facts.filter((fact) => fact.verificationStatus === "CONFIRMED");
  const readyFacts = result.facts.filter(
    (fact) => fact.lifecycleStatus === "ready_for_sku" || fact.lifecycleStatus === "mapped_to_sku",
  );
  const confirmedCandidates = result.confirmationRows.filter(
    (row) => row.verification_status === "CONFIRMED",
  );
  const approvedImages = result.imageRows.filter((row) => row.review_status === "approved");

  const seriesOverview = reviewedSeriesIds.map((seriesEvidenceId) => {
    const facts = result.facts.filter((fact) => fact.seriesEvidenceId === seriesEvidenceId);
    const candidates = result.confirmationRows.filter(
      (row) => row.series_evidence_id === seriesEvidenceId,
    );
    const images = result.imageRows.filter((row) => row.series_evidence_id === seriesEvidenceId);
    const seriesConflicts = facts.filter((fact) => fact.verificationStatus === "DATA_CONFLICT");
    const confirmed = candidates.filter((row) => row.verification_status === "CONFIRMED");
    const approved = images.filter((row) => row.review_status === "approved");
    const publicRecord = productSeriesEvidence.find((record) => record.id === seriesEvidenceId);

    return `| ${escapeTable(seriesLabel(seriesEvidenceId))} | ${facts.length} | ${candidates.length} | ${seriesConflicts.length} | ${confirmed.length}/${candidates.length} | ${approved.length}/${images.length} | ${publicRecord?.publicationStatus.replaceAll("_", " ") ?? "missing registry record"} |`;
  });

  const componentSections = reviewedSeriesIds.flatMap((seriesEvidenceId) => {
    const candidates = result.confirmationRows.filter(
      (row) => row.series_evidence_id === seriesEvidenceId,
    );
    const componentKeys = Array.from(new Set(candidates.map((row) => row.component_key))).sort();

    return [
      `### ${seriesLabel(seriesEvidenceId)}`,
      "",
      "| Position | Candidate group | Component | Candidate variants | Field facts | Confirmation | Main image |",
      "| --- | --- | --- | ---: | ---: | --- | --- |",
      ...componentKeys.map((componentKey) => {
        const componentCandidates = candidates.filter((row) => row.component_key === componentKey);
        const facts = result.facts.filter(
          (fact) =>
            fact.seriesEvidenceId === seriesEvidenceId && fact.componentKey === componentKey,
        );
        const confirmed = componentCandidates.filter(
          (row) => row.verification_status === "CONFIRMED",
        ).length;
        const mainImages = result.imageRows.filter(
          (row) =>
            row.series_evidence_id === seriesEvidenceId &&
            row.component_key === componentKey &&
            row.asset_role === "main",
        );
        const approvedMain = mainImages.filter((row) => row.review_status === "approved").length;
        const positions = Array.from(
          new Set(componentCandidates.map((row) => row.catalog_position)),
        ).join(", ");

        return `| ${escapeTable(positions)} | \`${escapeTable(componentKey)}\` | ${escapeTable(componentCandidates[0]?.component_name ?? componentKey)} | ${componentCandidates.length} | ${facts.length} | ${confirmed}/${componentCandidates.length} | ${approvedMain}/${mainImages.length} |`;
      }),
      "",
    ];
  });

  const confirmationFiles = result.confirmationPaths
    .map((filePath) => `- \`${path.relative(process.cwd(), filePath).replaceAll("\\", "/")}\``)
    .join("\n");
  const imageFiles = result.imagePaths
    .map((filePath) => `- \`${path.relative(process.cwd(), filePath).replaceAll("\\", "/")}\``)
    .join("\n");

  return [
    "# Product Series Component Evidence Report",
    "",
    "This internal report converts reviewed company-catalog series spreads into traceable field facts, exact-product confirmation queues and image requests. It does not create ArcFort Weld SKUs, confirm compatibility or publish a series page.",
    "",
    "## Summary",
    "",
    `- Detailed series reviewed: ${reviewedSeriesIds.length}`,
    `- Field-level catalog facts: ${result.facts.length}`,
    `- Component and variant candidates: ${result.confirmationRows.length}`,
    `- Confirmed facts: ${confirmedFacts.length}`,
    `- Facts ready for or mapped to a SKU: ${readyFacts.length}`,
    `- Data conflicts: ${conflicts.length}`,
    `- Completed candidate confirmations: ${confirmedCandidates.length} of ${result.confirmationRows.length}`,
    `- Approved image requests: ${approvedImages.length} of ${result.imageRows.length}`,
    "",
    "## Series Overview",
    "",
    "| Series | Field facts | Candidates | Conflicts | Candidate confirmation | Approved images | Public status |",
    "| --- | ---: | ---: | ---: | --- | --- | --- |",
    ...seriesOverview,
    "",
    "## Component Matrices",
    "",
    ...componentSections,
    "## Catalog And Comparison-Source Conflicts",
    "",
    "| Series | Field | Company catalog reference | Comparison-source value | Publication decision |",
    "| --- | --- | --- | --- | --- |",
    ...conflicts.map(
      (fact) =>
        `| ${escapeTable(seriesLabel(fact.seriesEvidenceId))} | ${escapeTable(fact.label)} | ${escapeTable(`${fact.referenceValue}${fact.referenceUnit ? ` ${fact.referenceUnit}` : ""}`)} | ${escapeTable(fact.comparisonValue ?? "Missing comparison")} | Blocked until the exact supplied product has Level A evidence |`,
    ),
    "",
    "Conflicts may compare a company-catalog value with an official OEM reference or preserve contradictory values within the same company document. No disputed value is published as an ArcFort Weld specification until exact-product Level A evidence resolves it.",
    "",
    "## Factory Confirmation Intake",
    "",
    "Complete the matching intake file against the exact supplied part. Preserve the catalog reference columns and record product name, proposed SKU, technical values, evidence source, reviewer and date only after checking factory records, a controlled drawing, an approved sample or a measurement record.",
    "",
    confirmationFiles,
    "",
    "### Confirmation Status",
    "",
    formatCounts(result.confirmationRows.map((row) => row.verification_status)),
    "",
    "## Image Intake",
    "",
    "Each candidate has one independent main-image request. Technical, dimension and packaging views remain separate so a family image cannot prove every variant.",
    "",
    imageFiles,
    "",
    "### Image Status",
    "",
    formatCounts(result.imageRows.map((row) => row.review_status)),
    "",
    "Approved images require an identified source owner, documented usage rights, original file name, reviewer, review date and an existing file under the series-specific intake directory. Requested or received files are never added to the public image registry automatically.",
    "",
    "## Publication Boundary",
    "",
    ...reviewedSeriesIds.map((seriesEvidenceId) => {
      const status = productSeriesEvidence.find(
        (record) => record.id === seriesEvidenceId,
      )?.publicationStatus;

      return status === "published"
        ? `- ${seriesLabel(seriesEvidenceId)} already has a governed public series route. This component-evidence workflow does not publish its unconfirmed candidate rows or expand its public product relationships.`
        : `- ${seriesLabel(seriesEvidenceId)} remains \`${status ?? "missing"}\` and has no public route created by this component-evidence workflow.`;
    }),
    "- Catalog grouping does not confirm product-to-series compatibility.",
    "- `DATA_CONFLICT` facts remain `blocked` and cannot move to SKU creation.",
    "- A candidate needs exact-product evidence before receiving a canonical SKU and public image record.",
    "- Public publication also requires a governed compatibility relationship and all normal product, image and SEO checks.",
    "",
    "## Next Evidence Actions",
    "",
    "1. Resolve each recorded conflict with an exact supplied-product factory specification, controlled drawing, measurement or test record.",
    "2. Confirm every nozzle, contact tip and torch-front component separately; shared catalog diagrams must not be treated as exact variant dimensions.",
    "3. Photograph each candidate on a white background and capture the requested interfaces, markings, dimensions and packaging.",
    "4. Record image ownership and usage rights before approval.",
    "5. Create canonical SKUs only for candidates whose exact identity and evidence are complete.",
    "6. Run `npm run series:components:validate`, `npm run series:components:report`, product, compatibility, image and build checks before any publication decision.",
    "",
  ].join("\n");
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, await format(buildReport(), { parser: "markdown", printWidth: 100 }));

console.log(
  `Product-series component evidence report written to ${path.relative(process.cwd(), outputPath)}`,
);
