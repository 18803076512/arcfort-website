#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import { applications } from "../content/applications.ts";
import { productCategories } from "../content/categories.ts";
import { guides } from "../content/guides.ts";
import { siteConfig } from "../lib/content/site.ts";
import { compatibilityRelationships } from "../lib/data/compatibility-relationships.ts";
import { productSeriesComponentFacts } from "../lib/data/product-series-component-facts.ts";
import { productTechnicalFacts } from "../lib/data/product-technical-facts.ts";
import { productSeries } from "../lib/data/product-series.ts";
import { productSeriesEvidence } from "../lib/data/product-series-evidence.ts";
import {
  resolveValidationInputPath,
  validateCsvFile,
  type ProductImportRow,
} from "./product-import-utils.ts";
import {
  validateProductImageAssets,
  type ProductImageAssetValidation,
} from "./product-image-asset-utils.ts";
import { assessProductMainImageEvidence } from "./product-image-readiness-utils.ts";
import { validateProductSeriesComponentEvidence } from "./product-series-component-utils.ts";

type EvidenceState = boolean | null;

type AcquisitionEvidence = {
  asOf: string;
  production: {
    url: string;
    deploymentVerified: boolean;
    sitemapUrlCount: number;
    indexNowLastAccepted: string;
    liveSeoAuditChecked: string;
    securityHeadersChecked: string;
  };
  rfq: {
    statusChecked: string;
    productionReady: boolean;
    deliveryMode: string;
    salesEmailReady: boolean;
    buyerConfirmationReady: boolean;
    attachmentDeliveryReady: boolean;
    providerAcceptanceVerified: string;
    salesMailboxPlacementConfirmed: EvidenceState;
    buyerMailboxPlacementConfirmed: EvidenceState;
    supabaseStorageReady: boolean;
  };
  searchConsole: {
    property: string;
    exported: string;
    dataStart: string;
    dataEnd: string;
    clicks: number;
    impressions: number;
    ctr: number;
    nextComparableReviewOnOrAfter: string;
    sitemapSubmissionConfirmed: EvidenceState;
  };
  analytics: {
    ga4RealtimeConfirmed: EvidenceState;
    rfqConversionEventConfirmed: EvidenceState;
  };
  securityOperations: {
    resendCredentialRotatedAfterExternalExposure: EvidenceState;
    emailAuthenticationChecked: string;
    dkimRecordPresent: boolean;
    spfRecordPresent: boolean;
    mailFromMxRecordPresent: boolean;
    dmarcStatusConfirmed: EvidenceState;
    supplierImageUsageRightsConfirmed: EvidenceState;
  };
};

const evidencePath = path.resolve("docs/operations/acquisition-production-evidence.json");
const outputPath = path.resolve("docs/acquisition-readiness-report.md");
const errors: string[] = [];

function evidenceLabel(value: EvidenceState, trueLabel: string, falseLabel: string) {
  if (value === true) {
    return trueLabel;
  }

  if (value === false) {
    return falseLabel;
  }

  return "Needs external confirmation";
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function validateEvidence(evidence: AcquisitionEvidence) {
  const dates = [
    evidence.asOf,
    evidence.production.indexNowLastAccepted,
    evidence.production.liveSeoAuditChecked,
    evidence.production.securityHeadersChecked,
    evidence.rfq.statusChecked,
    evidence.rfq.providerAcceptanceVerified,
    evidence.searchConsole.exported,
    evidence.searchConsole.dataStart,
    evidence.searchConsole.dataEnd,
    evidence.searchConsole.nextComparableReviewOnOrAfter,
    evidence.securityOperations.emailAuthenticationChecked,
  ];

  if (dates.some((value) => !isIsoDate(value))) {
    errors.push("Production evidence contains an invalid ISO date.");
  }

  if (evidence.production.sitemapUrlCount <= 0) {
    errors.push("Production sitemap URL count must be greater than zero.");
  }

  if (evidence.searchConsole.clicks < 0 || evidence.searchConsole.impressions <= 0) {
    errors.push("Search Console clicks and impressions must contain a valid measured baseline.");
  } else {
    const calculatedCtr = evidence.searchConsole.clicks / evidence.searchConsole.impressions;

    if (Math.abs(calculatedCtr - evidence.searchConsole.ctr) > 0.0005) {
      errors.push("Search Console CTR does not match the recorded clicks and impressions.");
    }
  }
}

function formatProductRows(rows: ProductImportRow[]) {
  return rows.length === 0
    ? "No products in this state."
    : [
        "| SKU | Product | Category | Required evidence |",
        "| --- | --- | --- | --- |",
        ...rows.map(
          (row) =>
            `| ${row.sku} | ${row.name} | ${row.category} | Reviewed own or legally usable supplier photo for the exact product |`,
        ),
      ].join("\n");
}

function formatCoverage(rows: ProductImportRow[]) {
  return [
    "| Product category | Active products | Buyer guides | Applications |",
    "| --- | ---: | ---: | ---: |",
    ...productCategories.map((category) => {
      const productCount = rows.filter(
        (row) => row.status === "active" && row.category_slug === category.slug,
      ).length;
      const guideCount = guides.filter((guide) =>
        guide.categorySlugs.includes(category.slug),
      ).length;
      const applicationCount = applications.filter((application) =>
        application.relatedCategorySlugs.includes(category.slug),
      ).length;

      if (productCount === 0) {
        errors.push(`${category.title} has no active product records.`);
      }

      if (guideCount === 0) {
        errors.push(`${category.title} has no buyer-guide coverage.`);
      }

      if (applicationCount === 0) {
        errors.push(`${category.title} has no application-page coverage.`);
      }

      return `| ${category.title} | ${productCount} | ${guideCount} | ${applicationCount} |`;
    }),
  ].join("\n");
}

function buildReport(
  rows: ProductImportRow[],
  evidence: AcquisitionEvidence,
  imageAssets: ProductImageAssetValidation,
) {
  const componentEvidence = validateProductSeriesComponentEvidence();
  if (componentEvidence.errors.length > 0) {
    errors.push(
      `${componentEvidence.errors.length} product-series component evidence validation error(s) must be resolved.`,
    );
  }
  const activeRows = rows.filter((row) => row.status === "active");
  const draftRows = rows.filter((row) => row.status === "draft");
  const mainImageEvidence = new Map(
    rows.map((row) => [
      row.sku,
      assessProductMainImageEvidence(
        row,
        imageAssets.rows,
        (publicPath) => imageAssets.inspections.get(publicPath)?.exists ?? false,
      ),
    ]),
  );
  const activeRowsWithRegisteredPublicMainImages = activeRows.filter(
    (row) => mainImageEvidence.get(row.sku)?.hasRegisteredPublicMainImage,
  );
  const activeRowsWithSearchEligibleExactMainImages = activeRows.filter(
    (row) => mainImageEvidence.get(row.sku)?.hasSearchEligibleExactMainImage,
  );
  const activeRowsUsingLegacyMainImages = activeRows.filter(
    (row) => mainImageEvidence.get(row.sku)?.asset?.publication_status === "legacy_reference",
  );
  const activeRowsWithoutRegisteredPublicMainImages = activeRows.filter(
    (row) => !mainImageEvidence.get(row.sku)?.hasRegisteredPublicMainImage,
  );
  const activeRowsWithUnknownSources = activeRows.filter((row) => row.source_type === "unknown");
  const confirmedDataRows = rows.filter((row) => row.data_status === "confirmed");
  const confirmedCompatibilityRows = rows.filter((row) => row.compatibility_status === "confirmed");
  const confirmedOemRows = rows.filter((row) => row.oem_status === "confirmed");
  const seriesEvidenceReviewCount = productSeriesEvidence.filter(
    (record) => record.publicationStatus === "evidence_review",
  ).length;
  const blockedSeriesEvidenceCount = productSeriesEvidence.filter(
    (record) => record.publicationStatus === "blocked",
  ).length;
  const seriesComponentConflictCount = productSeriesComponentFacts.filter(
    (fact) => fact.verificationStatus === "DATA_CONFLICT",
  ).length;
  const confirmedSeriesComponentCount = productSeriesComponentFacts.filter(
    (fact) => fact.verificationStatus === "CONFIRMED",
  ).length;
  const approvedSeriesComponentImageCount = componentEvidence.imageRows.filter(
    (row) => row.review_status === "approved",
  ).length;
  const confirmedRelationshipCount = compatibilityRelationships.filter(
    (relationship) => relationship.relationshipStatus === "confirmed",
  ).length;
  const referenceRelationshipCount = compatibilityRelationships.filter(
    (relationship) => relationship.relationshipStatus === "reference_only",
  ).length;
  const confirmedTechnicalFactCount = productTechnicalFacts.filter(
    (fact) => fact.verificationStatus === "CONFIRMED",
  ).length;
  const referenceTechnicalFactCount = productTechnicalFacts.filter(
    (fact) => fact.verificationStatus !== "CONFIRMED",
  ).length;
  const legacyImageAssetCount = imageAssets.rows.filter(
    (asset) => asset.publication_status === "legacy_reference",
  ).length;
  const searchEligibleImageAssetCount = imageAssets.rows.filter(
    (asset) => asset.publication_status === "search_eligible",
  ).length;
  const blockedImageAssetCount = imageAssets.rows.filter(
    (asset) => asset.publication_status === "blocked",
  ).length;
  const unknownSourceImageAssetCount = imageAssets.rows.filter(
    (asset) => asset.source_kind === "unknown",
  ).length;
  const approvedRightsImageAssetCount = imageAssets.rows.filter(
    (asset) => asset.usage_rights_status === "approved",
  ).length;
  const ctrPercent = `${(evidence.searchConsole.ctr * 100).toFixed(2)}%`;

  if (activeRowsWithoutRegisteredPublicMainImages.length > 0) {
    errors.push(
      `${activeRowsWithoutRegisteredPublicMainImages.length} active products do not have an existing registered public main image.`,
    );
  }

  if (evidence.production.url !== siteConfig.url) {
    errors.push("Production evidence URL does not match siteConfig.url.");
  }

  return [
    "# Acquisition Readiness Report",
    "",
    `Evidence date: ${evidence.asOf}. This internal report separates repository facts, verified production behavior and business evidence that still requires external confirmation.`,
    "",
    "## Executive Status",
    "",
    "ArcFort Weld is live and indexable. The RFQ path is configured through the email provider, while final inbox placement still requires external confirmation. The next growth constraint is not another general page. It is stronger product evidence, verified measurement and disciplined follow-up on the pages already receiving search impressions.",
    "",
    `- Production deployment verified: ${evidence.production.deploymentVerified ? "Yes" : "No"}`,
    `- Canonical production URL: ${evidence.production.url}`,
    `- Production sitemap URLs: ${evidence.production.sitemapUrlCount}`,
    `- Live SEO audit checked: ${evidence.production.liveSeoAuditChecked}`,
    `- Security headers checked: ${evidence.production.securityHeadersChecked}`,
    `- Active public products: ${activeRows.length}`,
    `- Draft products held from publication: ${draftRows.length}`,
    `- Product categories: ${productCategories.length}`,
    `- Governed product series: ${productSeries.length}`,
    `- Catalog product-series evidence records: ${productSeriesEvidence.length}`,
    `- Governed series-component facts: ${productSeriesComponentFacts.length}`,
    `- Governed series-component candidates: ${componentEvidence.confirmationRows.length}`,
    `- Governed compatibility relationships: ${compatibilityRelationships.length}`,
    `- Governed field-level technical facts: ${productTechnicalFacts.length}`,
    `- Governed product image assets: ${imageAssets.rows.length}`,
    `- Application pages: ${applications.length}`,
    `- Buyer guides: ${guides.length}`,
    `- RFQ production-ready status: ${evidence.rfq.productionReady ? "Yes" : "No"}`,
    `- Search Console baseline: ${evidence.searchConsole.clicks} clicks / ${evidence.searchConsole.impressions} impressions / ${ctrPercent} CTR`,
    "",
    "## Acquisition Channels",
    "",
    "| Channel | Evidence | Current status | Next control |",
    "| --- | --- | --- | --- |",
    `| Organic search | Search Console export for ${evidence.searchConsole.dataStart} through ${evidence.searchConsole.dataEnd} | ${evidence.searchConsole.clicks} clicks and ${evidence.searchConsole.impressions} impressions recorded | Compare a clean 28-day post-change window on or after ${evidence.searchConsole.nextComparableReviewOnOrAfter} |`,
    `| Website RFQ | Production status and controlled provider acceptance | Email delivery mode; sales notification, buyer confirmation and attachments are configured | Confirm matching references in the sales and buyer inboxes |`,
    `| Email / WhatsApp | ${siteConfig.email} and ${siteConfig.whatsapp} are visible across major buyer paths | Direct fallback contacts available | Track non-PII click and qualified-inquiry outcomes |`,
    `| Product catalog | ${activeRows.length} active pages across ${productCategories.length} categories, ${productSeries.length} governed public series and ${productSeriesEvidence.length} catalog-series evidence records | ${activeRowsUsingLegacyMainImages.length} active products retain legacy-reference main images; ${activeRowsWithSearchEligibleExactMainImages.length} have search-eligible exact main images | Replace legacy references with rights-approved exact-product views, then verify product and series relationships |`,
    `| Distributor / OEM | Dedicated service pages, builders and buyer workbooks | Operational buyer preparation paths are published | Review completed workbooks and qualified RFQs, not page count |`,
    "",
    "## RFQ And Delivery Evidence",
    "",
    `- Production status checked: ${evidence.rfq.statusChecked}`,
    `- Delivery mode: ${evidence.rfq.deliveryMode}`,
    `- Sales email configured: ${evidence.rfq.salesEmailReady ? "Yes" : "No"}`,
    `- Buyer confirmation configured: ${evidence.rfq.buyerConfirmationReady ? "Yes" : "No"}`,
    `- Attachment delivery configured: ${evidence.rfq.attachmentDeliveryReady ? "Yes" : "No"}`,
    `- Provider acceptance last verified: ${evidence.rfq.providerAcceptanceVerified}`,
    `- Sales inbox placement: ${evidenceLabel(evidence.rfq.salesMailboxPlacementConfirmed, "Confirmed", "Failed")}`,
    `- Buyer inbox placement: ${evidenceLabel(evidence.rfq.buyerMailboxPlacementConfirmed, "Confirmed", "Failed")}`,
    `- Optional Supabase inquiry storage: ${evidence.rfq.supabaseStorageReady ? "Configured" : "Not configured; email capture remains the active delivery path"}`,
    "",
    "## Product Evidence",
    "",
    `- Total product records: ${rows.length}`,
    `- Active products with registered public main-image files: ${activeRowsWithRegisteredPublicMainImages.length}`,
    `- Active products without registered public main-image files: ${activeRowsWithoutRegisteredPublicMainImages.length}`,
    `- Active products using retained legacy-reference main images: ${activeRowsUsingLegacyMainImages.length}`,
    `- Active products with search-eligible exact main images: ${activeRowsWithSearchEligibleExactMainImages.length}`,
    `- Active products still requiring exact main-image evidence: ${activeRows.length - activeRowsWithSearchEligibleExactMainImages.length}`,
    `- Active products whose structured source type is still \`unknown\`: ${activeRowsWithUnknownSources.length}`,
    `- Registered image assets: ${imageAssets.rows.length}`,
    `- Search-eligible exact image assets: ${searchEligibleImageAssetCount}`,
    `- Legacy public reference image assets: ${legacyImageAssetCount}`,
    `- Blocked image assets: ${blockedImageAssetCount}`,
    `- Image assets with approved usage rights: ${approvedRightsImageAssetCount}`,
    `- Image assets with unknown source: ${unknownSourceImageAssetCount}`,
    `- Products with confirmed technical data status: ${confirmedDataRows.length}`,
    `- Products with confirmed compatibility status: ${confirmedCompatibilityRows.length}`,
    `- Products with confirmed OEM status: ${confirmedOemRows.length}`,
    `- Governed product-series records: ${productSeries.length}`,
    `- Governed series-to-product relationships: ${productSeries.reduce((total, series) => total + series.productReferences.length, 0)}`,
    `- Company-catalog series evidence records: ${productSeriesEvidence.length}`,
    `- Catalog series still in evidence review: ${seriesEvidenceReviewCount}`,
    `- Catalog series blocked by source conflict: ${blockedSeriesEvidenceCount}`,
    `- Series-component facts confirmed: ${confirmedSeriesComponentCount}`,
    `- Series-component data conflicts blocked: ${seriesComponentConflictCount}`,
    `- Series-component images approved: ${approvedSeriesComponentImageCount} of ${componentEvidence.imageRows.length}`,
    `- Compatibility relationships confirmed: ${confirmedRelationshipCount}`,
    `- Compatibility relationships retained as reference only: ${referenceRelationshipCount}`,
    `- Field-level technical facts confirmed: ${confirmedTechnicalFactCount}`,
    `- Field-level technical facts awaiting confirmation: ${referenceTechnicalFactCount}`,
    "",
    "Draft product pages remain excluded from static generation and sitemap publication until exact-product imagery is reviewed.",
    "",
    formatProductRows(draftRows),
    "",
    "## Content Coverage",
    "",
    formatCoverage(rows),
    "",
    "## Email Domain Authentication",
    "",
    `- Public DNS checked: ${evidence.securityOperations.emailAuthenticationChecked}`,
    `- DKIM public key: ${evidence.securityOperations.dkimRecordPresent ? "Present" : "Missing"}`,
    `- SPF for custom MAIL FROM: ${evidence.securityOperations.spfRecordPresent ? "Present" : "Missing"}`,
    `- Custom MAIL FROM MX: ${evidence.securityOperations.mailFromMxRecordPresent ? "Present" : "Missing"}`,
    `- DMARC: ${evidenceLabel(evidence.securityOperations.dmarcStatusConfirmed, "Present and valid", "Confirmed missing or invalid")}`,
    "",
    "The public sender records support the configured Resend/Amazon SES path. DMARC remains a separate DNS control and must not be described as configured until the record is published and rechecked.",
    "",
    "## External Confirmations",
    "",
    `- Search Console sitemap submission: ${evidenceLabel(evidence.searchConsole.sitemapSubmissionConfirmed, "Confirmed", "Not submitted")}`,
    `- GA4 Realtime page views: ${evidenceLabel(evidence.analytics.ga4RealtimeConfirmed, "Confirmed", "Not configured")}`,
    `- GA4 RFQ conversion event: ${evidenceLabel(evidence.analytics.rfqConversionEventConfirmed, "Confirmed", "Not configured")}`,
    `- Resend credential rotation after external exposure: ${evidenceLabel(evidence.securityOperations.resendCredentialRotatedAfterExternalExposure, "Confirmed", "Not rotated")}`,
    `- Supplier-image provenance and usage rights: ${evidenceLabel(evidence.securityOperations.supplierImageUsageRightsConfirmed, "Confirmed and documented", "Not confirmed")}`,
    "",
    "These items cannot be proven from public page content or repository files. Update the evidence JSON only after checking the relevant provider console, DNS record or mailbox.",
    "",
    "## Highest-Impact Next Actions",
    "",
    "1. Confirm that the exposed Resend credential has been rotated, then record only the confirmation state, never the key.",
    "2. Add a monitoring-mode DMARC TXT record only after DNS-change approval, then rerun the email-domain audit.",
    "3. Confirm one matching RFQ reference in the sales mailbox and one in the buyer-confirmation mailbox.",
    "4. Work through `docs/product-image-asset-report.md`: confirm source and usage rights, then replace migration-period references with exact-product images.",
    "5. Supply exact, legally usable product photos for the three blocked draft SKUs; do not publish their current placeholders as product evidence.",
    "6. Complete the 15AK evidence intake, resolve the 602 page-identity conflict and work through the detailed 24KD/25AK/36KD/40KD/501D/602 component confirmation and image queues in `docs/product-series-component-evidence-report.md` before publishing another series.",
    "7. Confirm material, dimensions, interfaces and fitment for active products from drawings, samples or approved supplier/company records.",
    "8. Confirm GA4 Realtime and `rfq_submit_success` / lead events without recording buyer PII.",
    `9. Export Search Console again on or after ${evidence.searchConsole.nextComparableReviewOnOrAfter}; prioritize high-impression low-click existing URLs before adding overlapping content.`,
    "10. Configure Supabase only if searchable inquiry history, attachment retention or multi-user sales operations are needed.",
    "",
    "## Update Workflow",
    "",
    "1. Update `docs/operations/acquisition-production-evidence.json` after a real provider, mailbox, DNS or analytics check.",
    "2. Update product CSV and reviewed product images through the existing SKU workflow.",
    "3. Run `npm run products:report`, `npm run series:components:validate`, `npm run series:components:report`, `npm run series:report`, `npm run compatibility:report`, `npm run technical:report`, `npm run images:assets:report` and `npm run acquisition:report`.",
    "4. Run the required SEO, lint, type, build, performance and security checks before deployment.",
    "",
  ].join("\n");
}

const inputPath = resolveValidationInputPath(process.argv[2]);
const validation = validateCsvFile(inputPath);

if (validation.errors.length > 0) {
  console.error("Acquisition report failed because the product CSV has validation errors.");
  process.exit(1);
}

const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as AcquisitionEvidence;
const imageAssets = validateProductImageAssets();
validateEvidence(evidence);
if (imageAssets.errors.length > 0) {
  errors.push(
    `${imageAssets.errors.length} product image asset validation error(s) must be resolved.`,
  );
}
const report = buildReport(validation.rows, evidence, imageAssets);

if (errors.length > 0) {
  console.error(`Acquisition readiness errors (${errors.length})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, await format(report, { parser: "markdown", printWidth: 100 }));

console.log(`Acquisition readiness report written to ${path.relative(process.cwd(), outputPath)}`);
console.log(`Active products: ${validation.rows.filter((row) => row.status === "active").length}`);
console.log(`Draft products: ${validation.rows.filter((row) => row.status === "draft").length}`);
console.log(`Categories: ${productCategories.length}`);
console.log(`Product series: ${productSeries.length}`);
console.log(`Catalog series evidence: ${productSeriesEvidence.length}`);
console.log(`Series-component facts: ${productSeriesComponentFacts.length}`);
console.log(
  `Series-component candidates: ${validateProductSeriesComponentEvidence().confirmationRows.length}`,
);
console.log(`Compatibility relationships: ${compatibilityRelationships.length}`);
console.log(`Field-level technical facts: ${productTechnicalFacts.length}`);
console.log(`Product image assets: ${imageAssets.rows.length}`);
console.log(`Applications: ${applications.length}`);
console.log(`Buyer guides: ${guides.length}`);
