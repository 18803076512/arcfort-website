#!/usr/bin/env node

import { readFileSync } from "node:fs";
import {
  qualityBuyerSupplierControls,
  qualityEvidenceOptions,
  qualityFaq,
  qualityInspectionStages,
  qualityProductReviewMatrix,
  qualityResourceLinks,
  qualityRfqPrompt,
} from "../lib/content/quality-control.ts";

const pageSource = readFileSync("app/(public)/quality-control/page.tsx", "utf8");
const rfqSource = readFileSync("app/(public)/rfq/page.tsx", "utf8");
const errors: string[] = [];

function expect(condition: boolean, message: string) {
  if (!condition) {
    errors.push(message);
  }
}

expect(qualityInspectionStages.length === 4, "Quality workflow must contain four order stages.");
expect(
  qualityProductReviewMatrix.length === 6,
  "Quality review matrix must cover all six public product families.",
);
expect(
  qualityBuyerSupplierControls.length >= 5,
  "Quality controls must compare at least five buyer and supplier confirmation areas.",
);
expect(qualityEvidenceOptions.length >= 4, "Quality page must explain usable evidence options.");
expect(qualityFaq.length >= 6, "Quality page must contain at least six buyer FAQs.");
expect(qualityResourceLinks.length >= 4, "Quality page must provide four next-step buyer paths.");
expect(
  qualityRfqPrompt.includes("Required inspection evidence:"),
  "Quality RFQ prompt must request the required inspection evidence.",
);
expect(
  qualityRfqPrompt.includes("Packing, label or OEM requirement:"),
  "Quality RFQ prompt must request packing and OEM requirements.",
);

for (const requiredText of [
  "qualityInspectionStages",
  "qualityProductReviewMatrix",
  "qualityBuyerSupplierControls",
  "qualityEvidenceOptions",
  "qualityResourceLinks",
  "qualityFaq",
  "qualityRfqPrompt",
  "faqJsonLd([...qualityFaq])",
  "siteConfig.qualityLastModified",
  "Representative product-review image",
]) {
  expect(
    pageSource.includes(requiredText),
    `Quality page is missing required content: ${requiredText}`,
  );
}

expect(
  rfqSource.includes("/quality-control#inspection-workflow"),
  "RFQ page must link buyers to the quality-control workflow.",
);

const publicContent = [
  pageSource,
  JSON.stringify(qualityInspectionStages),
  JSON.stringify(qualityProductReviewMatrix),
  JSON.stringify(qualityBuyerSupplierControls),
  JSON.stringify(qualityEvidenceOptions),
  JSON.stringify(qualityFaq),
].join("\n");

for (const unsupportedClaim of [
  "100% inspection",
  "zero defects",
  "ISO certified",
  "CE certified",
  "certified manufacturer",
  "guaranteed quality",
]) {
  expect(
    !publicContent.toLowerCase().includes(unsupportedClaim.toLowerCase()),
    `Quality content contains unsupported claim: ${unsupportedClaim}`,
  );
}

console.log("ArcFort Weld quality-control content test");
console.log(`Inspection stages: ${qualityInspectionStages.length}`);
console.log(`Product families: ${qualityProductReviewMatrix.length}`);
console.log(`Buyer/supplier controls: ${qualityBuyerSupplierControls.length}`);
console.log(`FAQ entries: ${qualityFaq.length}`);

if (errors.length > 0) {
  console.error(`\nQuality-control content errors (${errors.length})`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("Quality-control content passed with no blocking errors.");
}
