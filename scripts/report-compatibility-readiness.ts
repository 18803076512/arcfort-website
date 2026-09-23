#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import { compatibilityRelationships } from "../lib/data/compatibility-relationships.ts";
import { productSeriesEvidence } from "../lib/data/product-series-evidence.ts";
import { arcfortProducts } from "../lib/data/products.ts";

const outputPath = path.resolve("docs/compatibility-readiness-report.md");
const productsBySlug = new Map(arcfortProducts.map((product) => [product.slug, product]));
const seriesById = new Map(productSeriesEvidence.map((series) => [series.id, series]));

function titleForEntity(type: string, id: string) {
  if (type === "product") {
    const product = productsBySlug.get(id);
    return product ? `${product.name} (${product.sku})` : id;
  }

  if (type === "series") {
    return seriesById.get(id)?.name ?? id;
  }

  return id;
}

function buildReport() {
  const confirmed = compatibilityRelationships.filter(
    (relationship) => relationship.relationshipStatus === "confirmed",
  );
  const referenceOnly = compatibilityRelationships.filter(
    (relationship) => relationship.relationshipStatus === "reference_only",
  );
  const unverified = compatibilityRelationships.filter(
    (relationship) => relationship.relationshipStatus === "unverified",
  );

  return [
    "# Compatibility Readiness Report",
    "",
    "This internal report tracks governed product relationships. A relationship is not confirmed merely because products share a catalog page, series name or similar appearance.",
    "",
    "## Summary",
    "",
    `- Governed compatibility relationships: ${compatibilityRelationships.length}`,
    `- Confirmed relationships: ${confirmed.length}`,
    `- Reference-only relationships: ${referenceOnly.length}`,
    `- Unverified relationships: ${unverified.length}`,
    `- Relationships requiring buyer/factory evidence: ${compatibilityRelationships.filter((relationship) => relationship.buyerConfirmationRequired).length}`,
    "",
    "## Relationship Matrix",
    "",
    "| Relationship | Subject | Target | Public status | Verification | Evidence basis |",
    "| --- | --- | --- | --- | --- | --- |",
    ...compatibilityRelationships.map(
      (relationship) =>
        `| ${relationship.id} | ${titleForEntity(relationship.subject.type, relationship.subject.id)} | ${titleForEntity(relationship.target.type, relationship.target.id)} | ${relationship.relationshipStatus.replaceAll("_", " ")} | ${relationship.verificationStatus} | ${relationship.evidenceBasis.join(", ").replaceAll("_", " ")} |`,
    ),
    "",
    "## Evidence Required Before Confirmation",
    "",
    ...compatibilityRelationships.flatMap((relationship) => [
      `### ${titleForEntity(relationship.subject.type, relationship.subject.id)}`,
      "",
      `Current relationship: ${relationship.role}. Status: ${relationship.relationshipStatus}.`,
      "",
      ...relationship.confirmationRequirements.map((requirement) => `- ${requirement}`),
      "",
    ]),
    "## Confirmation Gate",
    "",
    "A relationship may change to `confirmed` only when its verification status is `CONFIRMED` and the evidence includes factory confirmation, a controlled drawing, an approved sample, a verified reference number or confirmed dimensions. Company-catalog grouping alone remains reference-only.",
    "",
    "When evidence conflicts, retain the references internally, set `DATA_CONFLICT`, exclude the relationship from public projections and request review. Never resolve fitment from appearance alone.",
    "",
    "## Workflow",
    "",
    "1. Add or update the relationship in `lib/data/compatibility-relationships.ts`.",
    "2. Record the subject, target, role, source, evidence basis, verification status and review date.",
    "3. Keep buyer confirmation requirements specific to the product connection or assembly.",
    "4. Run `npm run compatibility:validate` and `npm run compatibility:report`.",
    "5. Run product-series, product, SEO and build checks before publication.",
    "",
  ].join("\n");
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, await format(buildReport(), { parser: "markdown", printWidth: 100 }));

console.log(`Compatibility readiness report written to ${path.relative(process.cwd(), outputPath)}`);
console.log(`Relationships: ${compatibilityRelationships.length}`);
