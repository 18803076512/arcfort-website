#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import { formatTechnicalFactValue } from "../lib/content/product-technical-facts.ts";
import { arcfortProducts } from "../lib/data/products.ts";
import { validateProductTechnicalEvidence } from "./product-technical-evidence-utils.ts";

const outputPath = path.join(process.cwd(), "docs", "product-technical-evidence-report.md");

function escapeTable(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function countBy<T extends Record<string, string>>(rows: T[], field: keyof T) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const value = row[field];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function formatCounts(counts: Record<string, number>) {
  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([status, count]) => `- ${status || "blank"}: ${count}`)
    .join("\n");
}

function buildReport() {
  const result = validateProductTechnicalEvidence();

  if (result.errors.length > 0) {
    throw new Error("Technical evidence report cannot be generated while validation errors exist.");
  }

  const productBySlug = new Map(arcfortProducts.map((product) => [product.slug, product]));
  const generalM6ContactTip = arcfortProducts.find((product) => product.sku === "AF-MIG-CT-0006");
  const confirmedFacts = result.facts.filter((fact) => fact.verificationStatus === "CONFIRMED");
  const needsConfirmationFacts = result.facts.filter(
    (fact) => fact.verificationStatus === "NEEDS_FACTORY_CONFIRMATION",
  );
  const conflicts = result.facts.filter((fact) => fact.verificationStatus === "DATA_CONFLICT");
  const governedProductSlugs = Array.from(new Set(result.facts.map((fact) => fact.productSlug)));
  const completedIntakeRows = result.technicalIntakeRows.filter(
    (row) => row.verification_status === "CONFIRMED",
  );
  const approvedImages = result.imageIntakeRows.filter((row) => row.review_status === "approved");

  return [
    "# Product Technical Evidence Readiness Report",
    "",
    "This internal report separates company-catalog references from confirmed ArcFort Weld SKU specifications. Catalog values remain reference data until the exact SKU is supported by a factory record, controlled drawing, approved sample, verified reference or measurement record.",
    "",
    "## Summary",
    "",
    `- Governed products: ${governedProductSlugs.length}`,
    `- Field-level technical facts: ${result.facts.length}`,
    `- Confirmed technical facts: ${confirmedFacts.length}`,
    `- Facts needing factory confirmation: ${needsConfirmationFacts.length}`,
    `- Data conflicts: ${conflicts.length}`,
    `- Completed factory confirmation rows: ${completedIntakeRows.length} of ${result.technicalIntakeRows.length}`,
    `- Approved company-owned image requests: ${approvedImages.length} of ${result.imageIntakeRows.length}`,
    `- Independent CT0006 catalog-reference intake rows: ${result.generalM6ContactTipIntakeRows.length}`,
    `- Independent CT0006 factory-confirmed intake rows: ${result.generalM6ContactTipIntakeRows.filter((row) => row.verification_status === "CONFIRMED").length}`,
    "",
    "## Technical Fact Matrix",
    "",
    "| SKU | Product | Field | Catalog reference | Verification | Source |",
    "| --- | --- | --- | --- | --- | --- |",
    ...result.facts.map((fact) => {
      const product = productBySlug.get(fact.productSlug);
      return `| ${product?.sku ?? fact.productSlug} | ${escapeTable(product?.name ?? fact.productSlug)} | ${escapeTable(fact.label)} | ${escapeTable(formatTechnicalFactValue(fact))} | ${fact.verificationStatus} | ${escapeTable(fact.sourceReference)} |`;
    }),
    "",
    "## Factory Confirmation Intake",
    "",
    "Use `data/intake/15ak-technical-confirmation.csv`. Do not overwrite the catalog-reference columns. Complete the confirmed value, evidence type, evidence reference, reviewer and review date only after checking the exact SKU.",
    "",
    "A row may move to `CONFIRMED` only when it has a confirmed value and qualifying Level A evidence. A company catalog grouping by itself remains `NEEDS_FACTORY_CONFIRMATION`.",
    "",
    "### Intake Status",
    "",
    formatCounts(countBy(result.technicalIntakeRows, "verification_status")),
    "",
    "## Product Image Intake",
    "",
    "Use `data/intake/15ak-product-image-intake.csv`. Main, connection/detail, dimensional and packaging images are requested separately so one visually similar photo cannot be used as evidence for every variant.",
    "",
    "### Image Status",
    "",
    formatCounts(countBy(result.imageIntakeRows, "review_status")),
    "",
    "### Requests By Product",
    "",
    "| SKU | Product | Requested assets | Approved assets |",
    "| --- | --- | ---: | ---: |",
    ...governedProductSlugs.map((productSlug) => {
      const product = productBySlug.get(productSlug);
      const rows = result.imageIntakeRows.filter((row) => row.product_slug === productSlug);
      const approved = rows.filter((row) => row.review_status === "approved").length;
      return `| ${product?.sku ?? productSlug} | ${escapeTable(product?.name ?? productSlug)} | ${rows.length} | ${approved} |`;
    }),
    "",
    "## Separate General M6 x 27 mm Contact Tip Review",
    "",
    `\`AF-MIG-CT-0006\` is not in the 15AK exact-SKU intake. Its existing product record cites a general M6 x 27 mm company-catalog table on PDF page 20 (catalog page 33), while its product \`source_type\` is \`${generalM6ContactTip?.sourceType ?? "unknown"}\`. These rows are internal catalog-reference questions only; they do not create public field-level technical facts or confirm final SKU length, material or fit.`,
    "",
    "Use `data/intake/general-m6-27-contact-tip-technical-confirmation.csv` for factory responses. Preserve the source reference and enter confirmed values only with exact-SKU evidence, a reviewer and an ISO date. Keep image provenance and rights review in the existing product image asset queue.",
    "",
    "| SKU | Field | Catalog reference | Verification | Source | Required factory check |",
    "| --- | --- | --- | --- | --- | --- |",
    ...result.generalM6ContactTipIntakeRows.map(
      (row) =>
        `| ${row.sku} | ${escapeTable(row.label)} | ${escapeTable(`${row.reference_value}${row.reference_unit ? ` ${row.reference_unit}` : ""}`)} | ${row.verification_status} | ${escapeTable(row.source_reference)} | ${escapeTable(row.requested_confirmation)} |`,
    ),
    "",
    "## Confirmation Gate",
    "",
    "1. Confirm the exact SKU and physical variant; do not confirm a whole product family from appearance.",
    "2. Record the measured or factory-approved value and its unit without replacing the catalog reference.",
    "3. Attach or identify the factory record, controlled drawing, approved sample, verified reference or measurement record.",
    "4. Record reviewer and review date, then update the canonical technical fact deliberately.",
    "5. For images, record source owner and usage rights before changing an asset to `approved`.",
    "6. Run `npm run technical:validate`, `npm run technical:report`, product checks and the production build.",
    "",
    "## Current Evidence Gaps",
    "",
    "- The 15AK product-to-series relationships remain reference-only.",
    "- No field-level fact in this registry has factory, controlled-drawing, approved-sample or measurement confirmation yet.",
    "- Company-owned main, detail, dimensional and packaging image sets have not been approved for these four products.",
    "- Series-specific insulator, spring, swan-neck and liner SKU mapping still requires source evidence.",
    "",
  ].join("\n");
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, await format(buildReport(), { parser: "markdown", printWidth: 100 }));

console.log(
  `Product technical evidence report written to ${path.relative(process.cwd(), outputPath)}`,
);
