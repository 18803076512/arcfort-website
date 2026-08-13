#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildOemRfqHref,
  buildOemRfqPrompt,
  getOemRfqReadiness,
  oemEvidenceOptions,
  oemProductScopeOptions,
  oemServiceOptions,
} from "../lib/oem-rfq-builder.ts";

const input = {
  productScopes: ["MIG/MAG torch parts", "MIG/MAG torch parts", "Plasma cutting consumables"],
  services: ["Logo printing", "Private label packaging"],
  evidence: ["Product list or SKU sheet", "Logo artwork"],
  projectStage: "Trial order planning",
  quantity: "Trial order followed by repeat quantities",
  destinationMarket: "European Union",
  packing: "Private label individual packaging",
};

const prompt = buildOemRfqPrompt(input);
assert.match(prompt, /Product scope: MIG\/MAG torch parts, Plasma cutting consumables/);
assert.doesNotMatch(prompt, /MIG\/MAG torch parts, MIG\/MAG torch parts/);
assert.match(prompt, /OEM services requested: Logo printing, Private label packaging/);
assert.match(prompt, /Buyer evidence available: Product list or SKU sheet, Logo artwork/);
assert.match(prompt, /Destination region: European Union/);
assert.match(prompt, /Files to review:/);
assert.match(prompt, /before quotation/);

const href = buildOemRfqHref(input);
assert.ok(href.startsWith("/rfq?product="));
const hrefUrl = new URL(href, "https://www.arcfortweld.com");
assert.match(hrefUrl.searchParams.get("product") ?? "", /Trial order planning/);
assert.equal(hrefUrl.searchParams.get("quantity"), input.quantity);
assert.equal(hrefUrl.searchParams.has("logo"), false);
assert.equal(hrefUrl.searchParams.has("drawing"), false);

const emptyReadiness = getOemRfqReadiness({
  productScopes: [],
  services: [],
  evidence: [],
  projectStage: "",
  quantity: "",
  destinationMarket: "",
  packing: "",
});
assert.equal(emptyReadiness.completeCount, 0);
assert.equal(emptyReadiness.totalCount, 5);
assert.equal(emptyReadiness.isComplete, false);

const fullReadiness = getOemRfqReadiness(input);
assert.equal(fullReadiness.completeCount, 5);
assert.equal(fullReadiness.isComplete, true);

const fallbackPrompt = buildOemRfqPrompt({
  productScopes: [],
  services: [],
  evidence: [],
  projectStage: "",
  quantity: "",
  destinationMarket: "",
  packing: "",
});
assert.match(fallbackPrompt, /Please help define the product range/);
assert.match(fallbackPrompt, /Please advise available OEM options/);
assert.match(fallbackPrompt, /Exact quantity will be entered on the RFQ form/);

const untrustedPrompt = buildOemRfqPrompt({
  ...input,
  productScopes: ["buyer@example.com"],
  quantity: "+86 188 0000 0000",
  destinationMarket: "Street address supplied by buyer",
});
assert.doesNotMatch(untrustedPrompt, /buyer@example\.com/);
assert.doesNotMatch(untrustedPrompt, /188 0000/);
assert.doesNotMatch(untrustedPrompt, /Street address/);

assert.equal(oemProductScopeOptions.length, 6);
assert.equal(oemServiceOptions.length, 6);
assert.equal(oemEvidenceOptions.length, 6);

const pageSource = readFileSync(new URL("../app/oem-service/page.tsx", import.meta.url), "utf8");
const sitemapSource = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
const builderSource = readFileSync(
  new URL("../components/oem/OemRfqBuilder.tsx", import.meta.url),
  "utf8",
);
assert.match(pageSource, /OemRfqBuilder/);
assert.match(pageSource, /id="oem-rfq-builder"/);
assert.match(pageSource, /siteConfig\.oemLastModified/);
assert.match(pageSource, /arcfort-oem-consumables-workbench\.png/);
assert.match(pageSource, /Representative product and packing reference/);
assert.match(pageSource, /not proof of an\s+exact SKU or production facility/);
assert.match(sitemapSource, /route === "\/oem-service"/);
assert.match(sitemapSource, /siteConfig\.oemLastModified/);
assert.match(builderSource, /oem_rfq_builder_start/);
assert.match(builderSource, /oem_rfq_builder_continue/);
assert.match(builderSource, /Continue to OEM RFQ/);

console.log("OEM RFQ builder tests passed.");
