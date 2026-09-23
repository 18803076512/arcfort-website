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
const oemSource = readFileSync(new URL("../app/(public)/oem-service/page.tsx", import.meta.url), "utf8");

assert.match(pageSource, /Welding Product Shipping, Payment and Order Terms/);
assert.match(pageSource, /export-order-workflow/);
assert.match(pageSource, /exportRfqPrompt/);
assert.match(distributorSource, /\/shipping-payment#export-order-workflow/);
assert.match(oemSource, /\/shipping-payment#export-order-workflow/);

console.log("Export order terms and conversion path tests passed.");
