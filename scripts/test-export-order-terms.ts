#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  exportBuyerPaths,
  exportLeadTimeRows,
  exportOrderFaq,
  exportOrderStages,
  exportQuotationInputs,
  exportRfqPrompt,
  exportTradeCards,
} from "../lib/content/export-order-terms.ts";
import { siteConfig } from "../lib/content/site.ts";
import { getPublicProductCommercialTerms } from "../lib/content/public-commercial-terms.ts";
import { validateCompanyEvidence } from "./company-evidence-utils.ts";
import { parseCsv } from "./product-import-utils.ts";

const companyEvidence = validateCompanyEvidence();
assert.equal(companyEvidence.errors.length, 0);
const approvedMoq = companyEvidence.claimRows.find((row) => row.claim_key === "moq_policy");
const approvedLeadTime = companyEvidence.claimRows.find(
  (row) => row.claim_key === "regular_lead_time",
);
for (const claim of [approvedMoq, approvedLeadTime]) {
  assert.ok(claim);
  assert.equal(claim.source_level, "A");
  assert.equal(claim.verification_status, "CONFIRMED");
  assert.equal(claim.publication_status, "approved");
  assert.ok(claim.source_reference && claim.reviewed_by && claim.reviewed_date);
}
assert.equal(siteConfig.moqPolicy, approvedMoq!.public_value);
assert.match(approvedMoq!.public_value, /selected standard products/);
assert.match(
  approvedLeadTime!.public_value,
  /normally.*7-20 working days after deposit confirmation/,
);
assert.match(siteConfig.regularLeadTime, /Usually.*7-20 working days after deposit confirmation/);
assert.equal(siteConfig.leadTime, siteConfig.regularLeadTime);

assert.deepEqual(
  getPublicProductCommercialTerms({
    moq: "Small trial orders accepted",
    leadTime: "7-20 working days for regular orders",
  }),
  { moq: approvedMoq!.public_value, leadTime: siteConfig.regularLeadTime },
);
for (const customTerms of [
  { moq: "200 pcs per quoted model", leadTime: "Schedule confirmed after sample approval" },
  { moq: "", leadTime: "" },
  { moq: "Small trial orders accepted ", leadTime: "7-20 working days for regular orders " },
  { moq: siteConfig.moqPolicy, leadTime: siteConfig.regularLeadTime },
]) {
  assert.deepEqual(getPublicProductCommercialTerms(customTerms), customTerms);
}
assert.deepEqual(
  getPublicProductCommercialTerms({
    moq: "100 pcs per approved variant",
    leadTime: "7-20 working days for regular orders",
  }),
  { moq: "100 pcs per approved variant", leadTime: siteConfig.regularLeadTime },
);
assert.deepEqual(
  getPublicProductCommercialTerms({
    moq: "Small trial orders accepted",
    leadTime: "Timing requires drawing approval",
  }),
  { moq: siteConfig.moqPolicy, leadTime: "Timing requires drawing approval" },
);

function readCsvRecords(relativePath: string) {
  const [headers, ...rows] = parseCsv(readFileSync(new URL(relativePath, import.meta.url), "utf8"));
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index]])),
  );
}

const activeSourceProducts = readCsvRecords("../data/import/products.csv").filter(
  (row) => row.status === "active",
);
const downloadedProducts = readCsvRecords("../public/downloads/arcfort-public-product-list.csv");
assert.equal(downloadedProducts.length, activeSourceProducts.length);
for (const sourceProduct of activeSourceProducts) {
  const downloadedProduct = downloadedProducts.find((row) => row.sku === sourceProduct.sku);
  assert.ok(downloadedProduct, `Missing public CSV product: ${sourceProduct.sku}`);
  const publicTerms = getPublicProductCommercialTerms({
    moq: sourceProduct.moq,
    leadTime: sourceProduct.lead_time,
  });
  assert.equal(downloadedProduct.moq, publicTerms.moq, sourceProduct.sku);
  assert.equal(downloadedProduct.lead_time, publicTerms.leadTime, sourceProduct.sku);
}

assert.equal(
  siteConfig.paymentTerms,
  "T/T, 30% deposit before production, 70% balance before shipment",
);
assert.equal(
  siteConfig.regularLeadTime,
  "Usually 7-20 working days after deposit confirmation for regular orders",
);
assert.equal(siteConfig.sampleLeadTime, "Usually 3-7 working days when materials are available");
assert.match(siteConfig.oemLeadTime, /^Usually 20-35 working days/);
assert.match(siteConfig.paymentAlternatives, /L\/C at sight can be discussed for large orders/);

assert.equal(exportTradeCards.length, 6);
assert.equal(exportLeadTimeRows.length, 3);
assert.equal(exportOrderStages.length, 5);
assert.equal(exportQuotationInputs.length, 6);
assert.ok(exportOrderFaq.length >= 6);
assert.deepEqual(
  exportBuyerPaths.map((path) => path.href),
  ["/products", "/distributor-supply", "/oem-service", "/quality-control"],
);
assert.match(exportRfqPrompt, /Destination country and city \/ port:/);
assert.match(exportRfqPrompt, /Preferred transport method or Incoterm request:/);

const publicCopy = [
  ...exportTradeCards.map((item) => `${item.title} ${item.value}`),
  ...exportOrderStages.map((item) => `${item.title} ${item.description}`),
  ...exportLeadTimeRows.map((item) => `${item.orderType} ${item.timing} ${item.confirmation}`),
  ...exportQuotationInputs.map(
    (item) => `${item.title} ${item.buyerShouldSend} ${item.quotationShouldConfirm}`,
  ),
  ...exportOrderFaq.map((item) => `${item.question} ${item.answer}`),
].join("\n");

for (const unsupportedClaim of [
  /free shipping/i,
  /guaranteed delivery/i,
  /fixed freight/i,
  /certified products/i,
  /FOB Tianjin is standard/i,
]) {
  assert.doesNotMatch(publicCopy, unsupportedClaim);
}

assert.match(publicCopy, /order-specific quotation/);
assert.match(publicCopy, /certification is never assumed/);

const pageSource = readFileSync(
  new URL("../app/(public)/shipping-payment/page.tsx", import.meta.url),
  "utf8",
);
const distributorSource = readFileSync(
  new URL("../app/(public)/distributor-supply/page.tsx", import.meta.url),
  "utf8",
);
const oemSource = readFileSync(
  new URL("../app/(public)/oem-service/page.tsx", import.meta.url),
  "utf8",
);

assert.match(pageSource, /Welding Product Shipping, Payment and Order Terms/);
assert.match(pageSource, /export-order-workflow/);
assert.match(pageSource, /exportRfqPrompt/);
assert.match(distributorSource, /\/shipping-payment#export-order-workflow/);
assert.match(oemSource, /\/shipping-payment#export-order-workflow/);

console.log("Export order terms and conversion path tests passed.");
