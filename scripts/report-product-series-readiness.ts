#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import { productSeriesComponentFacts } from "../lib/data/product-series-component-facts.ts";
import { productSeries } from "../lib/data/product-series.ts";
import { productSeriesEvidence } from "../lib/data/product-series-evidence.ts";
import { validateProductSeriesComponentEvidence } from "./product-series-component-utils.ts";

const outputPath = path.resolve("docs/product-series-readiness-report.md");

function formatStatus(status: (typeof productSeriesEvidence)[number]["publicationStatus"]) {
  if (status === "published") {
    return "Published";
  }

  if (status === "blocked") {
    return "Blocked by data conflict";
  }

  return "Evidence review";
}

function buildReport() {
  const componentEvidence = validateProductSeriesComponentEvidence();
  if (componentEvidence.errors.length > 0) {
    throw new Error("Product-series report cannot be generated with component-evidence errors.");
  }
  const publishedCount = productSeriesEvidence.filter(
    (record) => record.publicationStatus === "published",
  ).length;
  const reviewCount = productSeriesEvidence.filter(
    (record) => record.publicationStatus === "evidence_review",
  ).length;
  const blockedCount = productSeriesEvidence.filter(
    (record) => record.publicationStatus === "blocked",
  ).length;
  const componentConflictCount = componentEvidence.facts.filter(
    (fact) => fact.verificationStatus === "DATA_CONFLICT",
  ).length;
  const detailedSeriesIds = Array.from(
    new Set(componentEvidence.facts.map((fact) => fact.seriesEvidenceId)),
  ).sort();
  const publicationBoundary =
    productSeries.length === 0
      ? "No catalog series currently satisfies the complete public-series gate. All reviewed family names may be used as bounded RFQ choices, but they must not generate indexable series pages until canonical products, rights-approved exact-product images and governed relationships pass validation."
      : `${productSeries.map((series) => series.name).join(", ")} ${productSeries.length === 1 ? "is" : "are"} currently published through the governed series registry. All other reviewed family names may be used as bounded RFQ choices, but they must not generate indexable series pages until the complete publication gate passes.`;

  return [
    "# Product Series Readiness Report",
    "",
    "This internal report tracks company-catalog series evidence separately from public series pages. A catalog family proves that the company document contains the named sourcing group; it does not prove universal product compatibility.",
    "",
    "## Summary",
    "",
    `- Catalog series reviewed: ${productSeriesEvidence.length}`,
    `- Published governed series pages: ${publishedCount}`,
    `- Series awaiting product, compatibility or image evidence: ${reviewCount}`,
    `- Series blocked by unresolved source conflict: ${blockedCount}`,
    `- Public series-to-product relationships: ${productSeries.reduce((total, series) => total + series.productReferences.length, 0)}`,
    `- Detailed series with component evidence: ${detailedSeriesIds.length}`,
    `- Governed field-level component facts: ${componentEvidence.facts.length}`,
    `- Governed component and variant candidates: ${componentEvidence.confirmationRows.length}`,
    `- Component data conflicts held from publication: ${componentConflictCount}`,
    "",
    "## Series Matrix",
    "",
    "| Series | Company catalog evidence | Public status | Image evidence | Public product relationships |",
    "| --- | --- | --- | --- | ---: |",
    ...productSeriesEvidence.map((record) => {
      const publicSeries = productSeries.find((series) => series.evidenceId === record.id);
      const pageLabel = record.pdfPages.join(", ");
      const catalogPageLabel = record.catalogPages.join(", ");

      return `| ${record.name} | PDF ${pageLabel}; catalog ${catalogPageLabel} | ${formatStatus(record.publicationStatus)} | ${record.imageEvidenceStatus.replaceAll("_", " ")} | ${publicSeries?.productReferences.length ?? 0} |`;
    }),
    "",
    "## Publication Boundary",
    "",
    publicationBoundary,
    "",
    "Do not copy dimensions, compatibility or OEM references from a catalog page into an ArcFort Weld product record without retaining the source and verification boundary. Final fit still requires a torch label, drawing, approved sample, measured evidence or factory confirmation.",
    "",
    "## Detailed Component Evidence",
    "",
    "| Series | Field facts | Candidates | Conflicts | Approved images | Public route |",
    "| --- | ---: | ---: | ---: | --- | --- |",
    ...detailedSeriesIds.map((seriesEvidenceId) => {
      const record = productSeriesEvidence.find((item) => item.id === seriesEvidenceId);
      const facts = componentEvidence.facts.filter(
        (fact) => fact.seriesEvidenceId === seriesEvidenceId,
      );
      const candidates = componentEvidence.confirmationRows.filter(
        (row) => row.series_evidence_id === seriesEvidenceId,
      );
      const images = componentEvidence.imageRows.filter(
        (row) => row.series_evidence_id === seriesEvidenceId,
      );
      const conflicts = facts.filter((fact) => fact.verificationStatus === "DATA_CONFLICT").length;
      const approvedImages = images.filter((row) => row.review_status === "approved").length;

      return `| ${record?.name ?? seriesEvidenceId} | ${facts.length} | ${candidates.length} | ${conflicts} | ${approvedImages}/${images.length} | ${record?.publicationStatus === "published" ? "Published through governed series data" : "Not generated"} |`;
    }),
    "",
    "All source conflicts remain blocked. They include company-catalog values that differ from official OEM references and contradictions within a company-catalog spread. No component candidate in this detailed evidence workflow has been converted into a public SKU or compatibility relationship.",
    "",
    "Use `docs/product-series-component-evidence-report.md` for each component matrix, factory confirmation queue, image request and conflict detail.",
    "",
    "## Missing Evidence By Series",
    "",
    ...productSeriesEvidence.flatMap((record) => [
      `### ${record.name}`,
      "",
      `Source: ${record.sourceReference}`,
      "",
      ...record.missingEvidence.map((item) => `- ${item}`),
      "",
    ]),
    "## Expansion Workflow",
    "",
    "1. Confirm the exact series component matrix from the company, an approved sample or a controlled drawing.",
    "2. Create canonical product records without replacing existing generic product pages or guessing specifications.",
    "3. Add reviewed exact-product main, connection-detail and packaging images with documented rights.",
    "4. Record every product-to-series relationship as reference-only or confirmed according to its evidence.",
    "5. Run `npm run series:validate`, `npm run compatibility:validate`, `npm run technical:validate`, product validation, image checks, SEO checks and the production build.",
    "6. Publish the series page only after the evidence record changes to `published` and automated checks pass.",
    "",
  ].join("\n");
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, await format(buildReport(), { parser: "markdown", printWidth: 100 }));

console.log(
  `Product-series readiness report written to ${path.relative(process.cwd(), outputPath)}`,
);
console.log(`Catalog series reviewed: ${productSeriesEvidence.length}`);
console.log(`Published series pages: ${productSeries.length}`);
console.log(
  `Detailed component series: ${new Set(productSeriesComponentFacts.map((fact) => fact.seriesEvidenceId)).size}`,
);
console.log(`Series-component facts: ${productSeriesComponentFacts.length}`);
