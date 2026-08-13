#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { guides } from "../content/guides.ts";
import { getProductBuyingProfile } from "../lib/content/product-buying-profiles.ts";
import { arcfortProducts } from "../lib/data/products.ts";

const data = arcfortProducts.find((product) => product.sku === "AF-ACC-RT-0039");
assert.ok(data, "Robotic welding torch product data must exist.");
assert.equal(data.slug, "robot-welding-torch");
assert.equal(data.categorySlug, "welding-accessories");
assert.equal(data.name, "Robotic MIG/MAG Welding Torch Front End");
assert.match(data.metaTitle, /^Robotic MIG\/MAG Welding Torch/);
assert.ok(data.metaDescription.length <= 160);
assert.equal(data.status, "active");
assert.equal(data.dataStatus, "needs_review");
assert.equal(data.compatibilityStatus, "unverified");
assert.equal(data.sourceType, "official_catalog");
assert.match(data.description, /does not confirm a complete robot flange/);
assert.match(data.description, /not assumed from appearance/);

const profile = getProductBuyingProfile("robot-welding-torch");
assert.ok(profile, "Robotic welding torch buying profile must exist.");
assert.ok(profile.selectionVariables.length >= 6);
assert.ok(profile.confirmationChecklist.length >= 6);
assert.ok(profile.rfqFields.length >= 8);
assert.equal(profile.buyerTool?.href, "/downloads/arcfort-distributor-rfq-workbook.xlsx");

const guide = guides.find(
  (candidate) => candidate.slug === "robotic-mig-welding-torch-replacement-guide",
);
assert.ok(guide, "Robotic MIG/MAG replacement guide must exist.");
assert.deepEqual(guide.productSlugs, ["robot-welding-torch"]);
assert.ok(guide.categorySlugs.includes("welding-accessories"));
assert.ok(guide.categorySlugs.includes("mig-mag-torch-parts"));
assert.ok(guide.sections.length >= 7);
assert.ok((guide.buyerChecklist?.items.length ?? 0) >= 7);
assert.ok((guide.rfqFields?.length ?? 0) >= 8);
assert.ok(guide.faq.length >= 5);

const publicCopy = [
  data.shortDescription,
  data.description,
  data.metaDescription,
  profile.description,
  ...(profile.features ?? []),
  ...(profile.faq ?? []).map((item) => item.answer),
  ...guide.sections.map((section) => section.body),
  ...guide.faq.map((item) => item.answer),
].join("\n");

for (const unsupportedClaim of [
  /compatible with (?:ABB|FANUC|KUKA|Yaskawa)/i,
  /\b\d+\s*A\b/,
  /\b\d+\s*% duty cycle\b/i,
  /CE certified|ISO certified|RoHS certified|UL certified/i,
  /guaranteed (?:fit|compatibility)/i,
]) {
  assert.doesNotMatch(publicCopy, unsupportedClaim);
}

const templateSource = readFileSync(
  new URL("../components/content/ProductDetailTemplate.tsx", import.meta.url),
  "utf8",
);
assert.match(templateSource, /productSlug === "robot-welding-torch"/);
assert.match(templateSource, /installed torch label/);

const productAdapterSource = readFileSync(
  new URL("../content/products.ts", import.meta.url),
  "utf8",
);
assert.match(productAdapterSource, /product\.slug === "robot-welding-torch"/);
assert.match(productAdapterSource, /return "MIG\/MAG"/);
assert.match(productAdapterSource, /process: getConsumableProcess\(product\)/);

console.log("Robotic MIG/MAG welding torch content tests passed.");
