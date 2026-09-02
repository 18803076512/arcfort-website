#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { format, resolveConfig } from "prettier";
import { compatibilityRelationships } from "../lib/data/compatibility-relationships.ts";
import { productSeriesComponentFacts } from "../lib/data/product-series-component-facts.ts";
import { productSeriesEvidence } from "../lib/data/product-series-evidence.ts";
import { productSeries } from "../lib/data/product-series.ts";
import { productTechnicalFacts } from "../lib/data/product-technical-facts.ts";
import type { ShadowCatalog } from "../lib/domain/catalog/shadow-catalog.ts";
import { validateCompanyEvidence } from "./company-evidence-utils.ts";
import {
  resolveValidationInputPath,
  validateCsvFile,
  type ProductImportRow,
} from "./product-import-utils.ts";
import { validateProductImageAssets } from "./product-image-asset-utils.ts";

type AcquisitionEvidence = {
  asOf: string;
  production: {
    url: string;
    deploymentVerified: boolean;
    sitemapUrlCount: number;
  };
  rfq: {
    productionReady: boolean;
    deliveryMode: string;
    salesMailboxPlacementConfirmed: boolean | null;
    buyerMailboxPlacementConfirmed: boolean | null;
  };
  searchConsole: {
    dataStart: string;
    dataEnd: string;
    clicks: number;
    impressions: number;
    ctr: number;
    nextComparableReviewOnOrAfter: string;
    sitemapSubmissionConfirmed: boolean | null;
  };
  analytics: {
    rfqConversionEventConfirmed: boolean | null;
  };
  securityOperations: {
    resendCredentialRotatedAfterExternalExposure: boolean | null;
    dmarcStatusConfirmed: boolean | null;
  };
};

const outputPath = path.resolve("docs", "goal-progress-report.md");
const evidencePath = path.resolve("docs", "operations", "acquisition-production-evidence.json");
const shadowPath = path.resolve("generated", "console", "product-intelligence-shadow-v1.json");
const errors: string[] = [];
const warnings: string[] = [];

const productValidation = validateCsvFile(resolveValidationInputPath());
errors.push(...productValidation.errors.map((issue) => `Product CSV: ${issue.message}`));
warnings.push(...productValidation.warnings.map((issue) => `Product CSV: ${issue.message}`));

const imageValidation = validateProductImageAssets();
errors.push(...imageValidation.errors.map((issue) => `Product media: ${issue.message}`));
warnings.push(...imageValidation.warnings.map((issue) => `Product media: ${issue.message}`));

const companyEvidence = validateCompanyEvidence();
errors.push(...companyEvidence.errors.map((error) => `Company evidence: ${error}`));
warnings.push(...companyEvidence.warnings.map((warning) => `Company evidence: ${warning}`));

const acquisitionEvidence = JSON.parse(readFileSync(evidencePath, "utf8")) as AcquisitionEvidence;
const shadow = JSON.parse(readFileSync(shadowPath, "utf8")) as ShadowCatalog;

const products = productValidation.rows;
const activeProducts = products.filter((row) => row.status === "active");
const draftProducts = products.filter((row) => row.status === "draft");
const confirmedProductRows = products.filter((row) => row.data_status === "confirmed");
const exactMainImageSkus = new Set(
  imageValidation.rows
    .filter((row) => row.role === "main" && row.publication_status === "search_eligible")
    .map((row) => row.sku),
);
const strictVerifiedProducts = products.filter(
  (row) =>
    row.status === "active" &&
    row.data_status === "confirmed" &&
    row.compatibility_status === "confirmed" &&
    exactMainImageSkus.has(row.sku),
);
const confirmedTechnicalFacts = productTechnicalFacts.filter(
  (fact) => fact.verificationStatus === "CONFIRMED",
);
const confirmedCompatibility = compatibilityRelationships.filter(
  (relationship) => relationship.relationshipStatus === "confirmed",
);
const componentConflicts = productSeriesComponentFacts.filter(
  (fact) => fact.verificationStatus === "DATA_CONFLICT",
);
const confirmedComponentFacts = productSeriesComponentFacts.filter(
  (fact) => fact.verificationStatus === "CONFIRMED",
);
const approvedCompanyClaims = companyEvidence.claimRows.filter(
  (row) => row.publication_status === "approved",
);
const blockedCompanyClaims = companyEvidence.claimRows.filter(
  (row) => row.publication_status === "blocked",
);
const approvedCompanyMedia = companyEvidence.mediaRows.filter(
  (row) => row.evidence_status === "company_evidence" && row.publication_status === "approved",
);
const representativeCompanyMedia = companyEvidence.mediaRows.filter(
  (row) => row.evidence_status === "representative_only",
);
const pilotProductSlugs = new Set(productTechnicalFacts.map((fact) => fact.productSlug));
const reportEvidenceDate = [
  acquisitionEvidence.asOf,
  ...companyEvidence.claimRows.map((row) => row.reviewed_date),
  ...companyEvidence.mediaRows.map((row) => row.reviewed_date),
]
  .filter(Boolean)
  .sort()
  .at(-1);

if (!reportEvidenceDate) errors.push("Goal progress evidence does not contain a review date.");

function assertEqual(actual: number, expected: number, label: string) {
  if (actual !== expected) {
    errors.push(`${label} does not match the deterministic shadow (${actual} versus ${expected}).`);
  }
}

assertEqual(products.length, shadow.counts.products, "Product count");
assertEqual(activeProducts.length, shadow.counts.activeProducts, "Active product count");
assertEqual(draftProducts.length, shadow.counts.draftProducts, "Draft product count");
assertEqual(productTechnicalFacts.length, shadow.counts.technicalFacts, "Technical fact count");
assertEqual(
  confirmedTechnicalFacts.length,
  shadow.counts.confirmedTechnicalFacts,
  "Confirmed technical fact count",
);
assertEqual(
  compatibilityRelationships.length,
  shadow.counts.compatibilityRelationships,
  "Compatibility relationship count",
);
assertEqual(
  confirmedCompatibility.length,
  shadow.counts.confirmedCompatibilityRelationships,
  "Confirmed compatibility count",
);
assertEqual(imageValidation.rows.length, shadow.counts.mediaAssets, "Product media count");
assertEqual(
  exactMainImageSkus.size,
  shadow.counts.searchEligibleMediaAssets,
  "Search-eligible media count",
);
assertEqual(
  productSeriesComponentFacts.length,
  shadow.counts.seriesComponentFacts,
  "Series component fact count",
);
assertEqual(
  componentConflicts.length,
  shadow.counts.seriesComponentConflicts,
  "Series component conflict count",
);

const migrationFiles = readdirSync(path.resolve("supabase", "migrations")).filter((file) =>
  file.endsWith(".sql"),
);
const databaseTestFiles = readdirSync(path.resolve("supabase", "tests", "database")).filter(
  (file) => file.endsWith(".test.sql"),
);
const databaseAssertionCount = databaseTestFiles.reduce((total, file) => {
  const source = readFileSync(path.resolve("supabase", "tests", "database", file), "utf8");
  const match = source.match(/\bplan\((\d+)\)/i);
  if (!match) {
    errors.push(`Database test ${file} does not declare a pgTAP plan.`);
    return total;
  }
  return total + Number(match[1]);
}, 0);

function percentage(value: number, target: number) {
  return `${((value / target) * 100).toFixed(1)}%`;
}

function milestoneRows() {
  return [100, 300, 500, 1000].map(
    (target) =>
      `| ${target} | ${products.length} | ${percentage(products.length, target)} | ` +
      `${strictVerifiedProducts.length} | ${Math.max(target - strictVerifiedProducts.length, 0)} |`,
  );
}

function externalState(value: boolean | null) {
  if (value === true) return "Confirmed";
  if (value === false) return "Not ready";
  return "External confirmation required";
}

function formatProductNames(rows: ProductImportRow[]) {
  return rows.length === 0 ? "None" : rows.map((row) => `${row.sku} ${row.name}`).join("; ");
}

if (errors.length > 0) {
  console.error("Goal progress report generation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const ctrPercent = `${(acquisitionEvidence.searchConsole.ctr * 100).toFixed(2)}%`;
const reportSource = [
  "# ArcFort Weld Goal Progress Report",
  "",
  `Generated from governed repository evidence on ${reportEvidenceDate}. Source revision: \`${shadow.sourceRevision}\`. Do not edit this report manually.`,
  "",
  "## Executive Status",
  "",
  `ArcFort Weld currently has ${products.length} structured product records, including ${activeProducts.length} active public records and ${draftProducts.length} drafts. Under the strict evidence gate defined below, ${strictVerifiedProducts.length} products qualify as verified high-quality SKUs. Structured page count and verified product readiness are deliberately reported separately.`,
  "",
  `Product Intelligence Milestone 1 has ${migrationFiles.length} versioned migrations and ${databaseAssertionCount} declared pgTAP assertions across ${databaseTestFiles.length} test files. The Milestone 1 operations runbook records candidate-specific reset, pgTAP, generated-type and exact-row import evidence. Passing isolated-runtime results cover only the tested candidate and do not establish hosted parity. A named, authorized hosted non-production staging replay remains required before Console Milestone 2.`,
  "",
  "## SKU Milestones",
  "",
  "A strict verified SKU must be active, have confirmed product data, confirmed compatibility status and a rights-approved exact-product main image. This conservative count prevents active legacy pages from being mistaken for completed product intelligence.",
  "",
  "| Goal stage | Structured records | Structured coverage | Strict verified SKUs | Verified gap |",
  "| ---: | ---: | ---: | ---: | ---: |",
  ...milestoneRows(),
  "",
  "## Product Intelligence Health",
  "",
  "| Measure | Current | Required direction |",
  "| --- | ---: | --- |",
  `| Active product records | ${activeProducts.length} | Preserve stable URLs while evidence improves |`,
  `| Draft product records | ${draftProducts.length} | Keep blocked until data and exact imagery pass review |`,
  `| Product rows with confirmed data status | ${confirmedProductRows.length} | Confirm only from Level A product evidence |`,
  `| Field-level technical facts | ${productTechnicalFacts.length} | Expand exact-SKU coverage without duplicating product fields |`,
  `| Confirmed field-level technical facts | ${confirmedTechnicalFacts.length} | Factory measurements, drawings or approved samples required |`,
  `| Compatibility relationships | ${compatibilityRelationships.length} | Keep relationships separate from descriptive copy |`,
  `| Confirmed compatibility relationships | ${confirmedCompatibility.length} | Exact fit evidence required |`,
  `| Product image assets | ${imageValidation.rows.length} | Replace family references with governed exact-product views |`,
  `| Search-eligible exact main images | ${exactMainImageSkus.size} | Rights, exact match, owner, reviewer and date required |`,
  `| Product-series evidence records | ${productSeriesEvidence.length} | Progress evidence-ready families before adding more page volume |`,
  `| Governed public series | ${productSeries.length} | Publish only after the series gate passes |`,
  `| Series component facts | ${productSeriesComponentFacts.length} | Resolve evidence by stable candidate and field IDs |`,
  `| Confirmed component facts | ${confirmedComponentFacts.length} | Level A variant-scoped confirmation required |`,
  `| Blocked component conflicts | ${componentConflicts.length} | Resolve without selecting a convenient source value |`,
  "",
  "## 15AK Pilot",
  "",
  `The first pilot currently covers ${pilotProductSlugs.size} product records through ${productTechnicalFacts.length} governed technical facts and ${compatibilityRelationships.length} reference-only relationships. No technical fact or compatibility relationship is confirmed, and no exact main image is search eligible. The pilot cannot complete its ingest-to-publish workflow until Level A product evidence and reviewed media are returned.`,
  "",
  `Pilot product records: ${formatProductNames(products.filter((row) => pilotProductSlugs.has(row.slug)))}`,
  "",
  "## Company Evidence",
  "",
  `- Approved company claims: ${approvedCompanyClaims.length}`,
  `- Blocked unsupported claim topics: ${blockedCompanyClaims.length}`,
  `- Registered site media assets: ${companyEvidence.mediaRows.length}`,
  `- Approved real company-evidence media: ${approvedCompanyMedia.length}`,
  `- Representative-only site visuals: ${representativeCompanyMedia.length}`,
  "",
  "Factory ownership, certifications, capacity, customer cases, distributor coverage and export volume remain blocked. Current site visuals cannot be used as facility or process evidence.",
  "",
  "## Acquisition And RFQ Evidence",
  "",
  `- Production deployment recorded: ${acquisitionEvidence.production.deploymentVerified ? "Yes" : "No"}`,
  `- Production sitemap URLs at evidence date: ${acquisitionEvidence.production.sitemapUrlCount}`,
  `- Search Console baseline (${acquisitionEvidence.searchConsole.dataStart} to ${acquisitionEvidence.searchConsole.dataEnd}): ${acquisitionEvidence.searchConsole.clicks} clicks, ${acquisitionEvidence.searchConsole.impressions} impressions, ${ctrPercent} CTR`,
  `- Next comparable Search Console review: on or after ${acquisitionEvidence.searchConsole.nextComparableReviewOnOrAfter}`,
  `- Search Console sitemap submission: ${externalState(acquisitionEvidence.searchConsole.sitemapSubmissionConfirmed)}`,
  `- RFQ delivery mode: ${acquisitionEvidence.rfq.deliveryMode}`,
  `- RFQ repository production-ready state: ${acquisitionEvidence.rfq.productionReady ? "Yes" : "No"}`,
  `- Sales-mailbox placement: ${externalState(acquisitionEvidence.rfq.salesMailboxPlacementConfirmed)}`,
  `- Buyer-mailbox placement: ${externalState(acquisitionEvidence.rfq.buyerMailboxPlacementConfirmed)}`,
  `- GA4 RFQ conversion event: ${externalState(acquisitionEvidence.analytics.rfqConversionEventConfirmed)}`,
  `- Email-provider credential rotation after exposure: ${externalState(acquisitionEvidence.securityOperations.resendCredentialRotatedAfterExternalExposure)}`,
  `- DMARC status: ${externalState(acquisitionEvidence.securityOperations.dmarcStatusConfirmed)}`,
  "",
  "## Highest-Value Next Actions",
  "",
  "1. Name and authorize the dedicated hosted non-production Supabase project, record its owner, plan, region and rollback owner, then configure credentials locally without exposing secrets.",
  "2. Review the exact candidate's isolated-runtime evidence and hosted migration dry-run, then replay migrations, pgTAP and the deterministic shadow snapshot in that authorized staging project. Rerun local-stack CI when schema or importer contracts change.",
  "3. Return Level A 15AK measurements, drawings or approved sample records for the four pilot products and reconcile each fact by stable ID.",
  "4. Capture rights-approved exact 15AK main, connection-detail, dimensional and packaging images, then complete the product media review gate.",
  "5. Collect company-owned factory, production, inspection, packing, warehouse and shipment images with source owner, rights, reviewer and date.",
  "6. Verify one synthetic production RFQ reaches both controlled inboxes with the same inquiry reference; confirm credential rotation, DMARC and GA4 conversion evidence.",
  `7. Export the next comparable Search Console period on or after ${acquisitionEvidence.searchConsole.nextComparableReviewOnOrAfter} and update the governed SEO baseline.`,
  "",
  "## Known Data Boundary",
  "",
  `The report carries ${warnings.length} non-blocking validation warnings, primarily unresolved product and company-media evidence. Warnings do not upgrade any verification, compatibility, rights or publication state. Run the underlying validators for item-level details.`,
].join("\n");

const prettierConfig = (await resolveConfig(outputPath)) ?? {};
const report = await format(reportSource, {
  ...prettierConfig,
  filepath: outputPath,
  parser: "markdown",
  endOfLine: "lf",
});
writeFileSync(outputPath, report, "utf8");

for (const warning of warnings) console.warn(`Warning: ${warning}`);
console.log(
  `Wrote ${path.relative(process.cwd(), outputPath)} for ${products.length} structured products and ${strictVerifiedProducts.length} strict verified SKUs.`,
);
