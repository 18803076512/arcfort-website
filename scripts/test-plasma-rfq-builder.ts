#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { productCategories } from "../content/categories.ts";
import {
  buildPlasmaRfqHref,
  buildPlasmaRfqPrompt,
  plasmaConsumableOptions,
} from "../lib/plasma-rfq-builder.ts";

const plasmaCategory = productCategories.find(
  (category) => category.slug === "plasma-cutting-consumables",
);

assert.ok(plasmaCategory, "Plasma cutting consumables category must exist.");
assert.equal(plasmaCategory.referenceFamilies?.length, 9);
assert.deepEqual(
  plasmaCategory.referenceFamilies?.map((family) => family.name),
  [
    "SP-60",
    "A-81",
    "PT-31",
    "CB-50",
    "LT-50",
    "AG-60",
    "TongChang60",
    "SG-51",
    "P-80 reference series",
  ],
);
assert.ok(
  plasmaCategory.referenceFamilies?.every(
    (family) => family.documentedComponents.length >= 3 && family.buyerCheck.length >= 80,
  ),
  "Every catalog family needs a useful component list and buyer check.",
);

const prompt = buildPlasmaRfqPrompt({
  torchFamily: "PT-31",
  components: ["Electrode", "Nozzle or cutting tip", "Electrode"],
  existingReference: "  marking shown on used part  ",
  quantity: "100 electrodes / 200 nozzles",
  packing: "Individual labeled packing",
});

assert.match(prompt, /Torch family \/ model: PT-31/);
assert.match(prompt, /Requested components: Electrode, Nozzle or cutting tip/);
assert.doesNotMatch(prompt, /Electrode, Nozzle or cutting tip, Electrode/);
assert.match(prompt, /Existing part reference: marking shown on used part/);
assert.match(prompt, /Quantity: 100 electrodes \/ 200 nozzles/);
assert.match(prompt, /Compatibility evidence:/);

const unknownPrompt = buildPlasmaRfqPrompt({
  torchFamily: "",
  components: [],
  existingReference: "",
  quantity: "",
  packing: "",
});
assert.match(unknownPrompt, /Torch family \/ model: Unknown \/ other/);
assert.match(unknownPrompt, /Please help identify from photos or sample/);
assert.match(unknownPrompt, /Please advise suitable trial-order quantity/);

const href = buildPlasmaRfqHref({
  torchFamily: "A-81",
  components: [...plasmaConsumableOptions.slice(0, 3)],
  existingReference: "A-81 reference",
  quantity: "Trial order",
  packing: "Standard export packing",
});
assert.ok(href.startsWith("/rfq?product="));
assert.match(decodeURIComponent(href), /A-81/);
assert.match(decodeURIComponent(href), /quantity=Trial\+order/);

const categoryTemplateSource = readFileSync(
  new URL("../components/content/CategoryPageTemplate.tsx", import.meta.url),
  "utf8",
);
const builderSource = readFileSync(
  new URL("../components/products/PlasmaConsumablesRfqBuilder.tsx", import.meta.url),
  "utf8",
);

assert.match(categoryTemplateSource, /PlasmaConsumablesRfqBuilder/);
assert.match(categoryTemplateSource, /Company Catalog Reference/);
assert.match(categoryTemplateSource, /renqiu-ailesen-welding-catalog\.pdf/);
assert.match(builderSource, /plasma_rfq_builder_start/);
assert.match(builderSource, /plasma_rfq_builder_continue/);
assert.match(builderSource, /Continue to RFQ/);

console.log("Plasma consumables catalog reference and RFQ builder tests passed.");
