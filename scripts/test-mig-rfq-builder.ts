#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { productCategories } from "../content/categories.ts";
import { buildMigRfqHref, buildMigRfqPrompt, migPartOptions } from "../lib/mig-rfq-builder.ts";

const migCategory = productCategories.find((category) => category.slug === "mig-mag-torch-parts");

assert.ok(migCategory, "MIG/MAG torch parts category must exist.");
assert.equal(migCategory.referenceFamilies?.length, 9);
assert.deepEqual(
  migCategory.referenceFamilies?.map((family) => family.name),
  [
    "15AK catalog reference group",
    "24KD catalog reference group",
    "25AK catalog reference group",
    "36KD catalog reference group",
    "40KD catalog reference group",
    "501D catalog reference group",
    "ORK 200A catalog reference group",
    "ORK 350A catalog reference group",
    "ORK 500A catalog reference group",
  ],
);
assert.ok(
  !migCategory.referenceFamilies?.some((family) => family.name === "602 catalog reference group"),
  "The blocked 602 catalog identity conflict must stay out of the public RFQ builder.",
);
assert.ok(
  migCategory.referenceFamilies?.every(
    (family) => family.documentedComponents.length >= 6 && family.buyerCheck.length >= 180,
  ),
  "Every MIG/MAG catalog reference group needs useful components and a buyer confirmation boundary.",
);

const prompt = buildMigRfqPrompt({
  torchFamily: "24KD catalog reference group",
  torchArrangement: "Air-cooled torch or parts",
  components: ["Contact tip", "Gas nozzle", "Gas nozzle"],
  wireReference: "  1.0 mm shown on the current tip  ",
  partReference: "  drawing reference MIG-24-01  ",
  quantity: "1,000 tips / 200 nozzles",
  packing: "Individual labeled packing",
});

assert.match(prompt, /Catalog series \/ torch model: 24KD catalog reference group/);
assert.match(prompt, /Torch arrangement: Air-cooled torch or parts/);
assert.match(prompt, /Requested components: Contact tip, Gas nozzle/);
assert.doesNotMatch(prompt, /Gas nozzle, Gas nozzle/);
assert.match(prompt, /Welding wire diameter \(if documented\): 1.0 mm shown on the current tip/);
assert.match(prompt, /Visible part, drawing or OEM reference: drawing reference MIG-24-01/);
assert.match(prompt, /Compatibility evidence:/);

const unknownPrompt = buildMigRfqPrompt({
  torchFamily: "",
  torchArrangement: "",
  components: [],
  wireReference: "",
  partReference: "",
  quantity: "",
  packing: "",
});
assert.match(unknownPrompt, /Catalog series \/ torch model: Unknown \/ other/);
assert.match(unknownPrompt, /Please help identify from photos or sample/);
assert.match(unknownPrompt, /Please advise suitable trial-order quantity/);

const href = buildMigRfqHref({
  torchFamily: "15AK catalog reference group",
  torchArrangement: "Complete torch or cable assembly",
  components: [...migPartOptions.slice(0, 4)],
  wireReference: "0.8 mm from tip marking",
  partReference: "Approved sample available",
  quantity: "Trial order",
  packing: "Standard export packing",
});
assert.ok(href.startsWith("/rfq?product="));
const hrefUrl = new URL(href, "https://www.arcfortweld.com");
assert.match(hrefUrl.searchParams.get("product") ?? "", /15AK catalog reference group/);
assert.equal(hrefUrl.searchParams.get("quantity"), "Trial order");

const categoryTemplateSource = readFileSync(
  new URL("../components/content/CategoryPageTemplate.tsx", import.meta.url),
  "utf8",
);
const builderSource = readFileSync(
  new URL("../components/products/MigTorchPartsRfqBuilder.tsx", import.meta.url),
  "utf8",
);

assert.match(categoryTemplateSource, /MigTorchPartsRfqBuilder/);
assert.match(categoryTemplateSource, /hasMigRfqBuilder/);
assert.match(builderSource, /mig_rfq_builder_start/);
assert.match(builderSource, /mig_rfq_builder_continue/);
assert.match(builderSource, /Continue to RFQ/);

console.log("MIG/MAG torch parts catalog reference and RFQ builder tests passed.");
