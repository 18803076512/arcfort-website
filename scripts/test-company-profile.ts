#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  companyBuyerProfiles,
  companyEvidenceBoundaries,
  companyFaq,
  companyInquiryStages,
  companyResourceLinks,
  companyRfqPrompt,
} from "../lib/content/company-profile.ts";
import { productCategories } from "../content/categories.ts";
import { siteConfig } from "../lib/content/site.ts";

assert.equal(siteConfig.legalName, "Renqiu Ailesen Welding Technology Co., Ltd.");
assert.equal(siteConfig.name, "ArcFort Weld");
assert.equal(siteConfig.email, "arcfortweld@outlook.com");
assert.equal(siteConfig.whatsapp, "+86-18803076512");
assert.equal(siteConfig.address, "Renqiu City, Cangzhou, Hebei Province, China");
assert.equal(siteConfig.aboutLastModified, "2026-08-13");

assert.equal(productCategories.length, 6);
assert.equal(companyBuyerProfiles.length, 4);
assert.equal(companyInquiryStages.length, 4);
assert.equal(companyEvidenceBoundaries.confirmed.length, 6);
assert.equal(companyEvidenceBoundaries.productSpecific.length, 6);
assert.ok(companyFaq.length >= 6);
assert.deepEqual(
  companyResourceLinks.map((item) => item.href),
  ["/quality-control", "/shipping-payment#export-order-workflow", "/downloads", "/contact"],
);
assert.match(companyRfqPrompt, /Buyer company and country:/);
assert.match(companyRfqPrompt, /Packing or OEM requirement:/);

const publicCopy = [
  ...companyBuyerProfiles.map((item) => `${item.title} ${item.description}`),
  ...companyInquiryStages.map((item) => `${item.title} ${item.description}`),
  ...companyEvidenceBoundaries.confirmed,
  ...companyEvidenceBoundaries.productSpecific,
  ...companyResourceLinks.map((item) => `${item.title} ${item.description}`),
  ...companyFaq.map((item) => `${item.question} ${item.answer}`),
].join("\n");

for (const unsupportedClaim of [
  /certified manufacturer/i,
  /factory owner/i,
  /authorized distributor/i,
  /ISO certified/i,
  /CE certified/i,
  /guaranteed compatibility/i,
  /global customer cases/i,
]) {
  assert.doesNotMatch(publicCopy, unsupportedClaim);
}

const sourceFiles = {
  about: readFileSync(new URL("../app/about/page.tsx", import.meta.url), "utf8"),
  home: readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8"),
  contact: readFileSync(new URL("../app/contact/page.tsx", import.meta.url), "utf8"),
  distributor: readFileSync(new URL("../app/distributor-supply/page.tsx", import.meta.url), "utf8"),
  oem: readFileSync(new URL("../app/oem-service/page.tsx", import.meta.url), "utf8"),
  rfq: readFileSync(new URL("../app/rfq/page.tsx", import.meta.url), "utf8"),
};

assert.match(sourceFiles.about, /Renqiu Ailesen Welding Technology Co\., Ltd\./);
assert.match(sourceFiles.about, /faqJsonLd\(\[\.\.\.companyFaq\]\)/);
assert.match(sourceFiles.about, /getAllProductCategories/);
assert.match(sourceFiles.about, /Representative product-range image/);
assert.match(sourceFiles.about, /companyRfqPrompt/);

for (const [route, source] of Object.entries(sourceFiles)) {
  if (route === "about") continue;
  assert.ok(
    source.includes('href: "/about"') || source.includes('href="/about"'),
    `${route} must include a contextual link to /about`,
  );
}

console.log("Company profile, evidence boundary and conversion path tests passed.");
