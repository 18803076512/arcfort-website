#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import {
  buildDistributorRfqHref,
  buildDistributorRfqPrompt,
  distributorBuyerProfileOptions,
  distributorEvidenceOptions,
  distributorPackingOptions,
  distributorProductCategoryOptions,
  distributorSourcingStageOptions,
  getDistributorRfqReadiness,
} from "../lib/distributor-rfq-builder.ts";

const completeInput = {
  buyerProfile: distributorBuyerProfileOptions[0],
  productCategories: [
    distributorProductCategoryOptions[0],
    distributorProductCategoryOptions[2],
  ],
  sourcingStage: distributorSourcingStageOptions[2],
  trialQuantity: "Mixed trial order; line quantities in attached workbook",
  repeatPlan: "Quarterly restocking after sample approval",
  destination: "Germany",
  packing: distributorPackingOptions[2],
  evidence: [distributorEvidenceOptions[0], distributorEvidenceOptions[3]],
  currentReferences: "Current torch labels and part photos will be attached.",
};

const readiness = getDistributorRfqReadiness(completeInput);
assert.equal(readiness.completeCount, readiness.totalCount);
assert.equal(readiness.isComplete, true);

const prompt = buildDistributorRfqPrompt(completeInput);
assert.match(prompt, /Distributor and importer mixed-product RFQ/);
assert.match(prompt, /MIG\/MAG torch parts, Plasma cutting consumables/);
assert.match(prompt, /Destination market: Germany/);
assert.match(prompt, /No compatibility, specification, price, certification/);
assert.doesNotMatch(prompt, /CE certified|ISO certified|guaranteed compatibility/i);

const href = buildDistributorRfqHref(completeInput);
const url = new URL(href, "https://www.arcfortweld.com");
assert.equal(url.pathname, "/rfq");
assert.equal(url.searchParams.get("quantity"), completeInput.trialQuantity);
assert.match(url.searchParams.get("product") ?? "", /Destination market: Germany/);

const hostilePrompt = buildDistributorRfqPrompt({
  ...completeInput,
  buyerProfile: "Exclusive worldwide partner",
  productCategories: ["Unsupported certified product"],
  evidence: ["Guaranteed compatibility certificate"],
  trialQuantity: "x".repeat(400),
  currentReferences: "y".repeat(500),
});
assert.match(hostilePrompt, /Buyer profile to be provided/);
assert.match(hostilePrompt, /Product range to be provided/);
assert.doesNotMatch(hostilePrompt, /Exclusive worldwide partner/);
assert.doesNotMatch(hostilePrompt, /Guaranteed compatibility certificate/);
assert.ok(hostilePrompt.includes("x".repeat(160)));
assert.ok(!hostilePrompt.includes("x".repeat(161)));
assert.ok(hostilePrompt.includes("y".repeat(240)));
assert.ok(!hostilePrompt.includes("y".repeat(241)));
assert.equal(
  getDistributorRfqReadiness({
    ...completeInput,
    buyerProfile: "Exclusive worldwide partner",
    productCategories: ["Unsupported certified product"],
    evidence: ["Guaranteed compatibility certificate"],
  }).completeCount,
  2,
);

const pageSource = readFileSync("app/distributor-supply/page.tsx", "utf8");
const componentSource = readFileSync(
  "components/distributor/DistributorRfqBuilder.tsx",
  "utf8",
);
const downloadsSource = readFileSync("app/downloads/page.tsx", "utf8");
const analyticsSource = readFileSync("components/AnalyticsTracker.tsx", "utf8");
const sitemapSource = readFileSync("app/sitemap.ts", "utf8");

assert.match(pageSource, /<DistributorRfqBuilder \/>/);
assert.match(pageSource, /id="distributor-rfq-builder"/);
assert.match(pageSource, /<a\s+href="\/downloads\/arcfort-distributor-sourcing-guide\.pdf"/);
assert.doesNotMatch(
  pageSource,
  /<Link\s+href="\/downloads\/arcfort-distributor-sourcing-guide\.pdf"/,
);
assert.match(componentSource, /data-hide-sticky-contact-when-visible/);
assert.match(componentSource, /distributor_rfq_builder_start/);
assert.match(componentSource, /distributor_rfq_builder_continue/);
assert.match(componentSource, /arcfort-distributor-rfq-workbook\.xlsx/);
assert.match(downloadsSource, /arcfort-distributor-rfq-workbook\.xlsx/);
assert.match(analyticsSource, /distributor_rfq_workbook/);
assert.match(sitemapSource, /arcfort-distributor-rfq-workbook\.xlsx/);

const workbookPath = "public/downloads/arcfort-distributor-rfq-workbook.xlsx";
const workbook = readFileSync(workbookPath);
assert.ok(statSync(workbookPath).size > 10_000);
assert.equal(workbook[0], 0x50);
assert.equal(workbook[1], 0x4b);
assert.match(workbook.toString("utf8"), /xl\/workbook\.xml/);

console.log("Distributor RFQ builder and workbook tests passed.");
