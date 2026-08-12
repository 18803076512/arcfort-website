#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { productCategories } from "../content/categories.ts";
import { buildTigRfqHref, buildTigRfqPrompt, tigPartOptions } from "../lib/tig-rfq-builder.ts";

const tigCategory = productCategories.find((category) => category.slug === "tig-torch-parts");

assert.ok(tigCategory, "TIG torch parts category must exist.");
assert.equal(tigCategory.referenceFamilies?.length, 3);
assert.deepEqual(
  tigCategory.referenceFamilies?.map((family) => family.name),
  [
    "WP-9 / WP-20 reference group",
    "WP-17 / WP-18 / WP-26 reference group",
    "WP-27 reference group",
  ],
);
assert.ok(
  tigCategory.referenceFamilies?.every(
    (family) => family.documentedComponents.length >= 6 && family.buyerCheck.length >= 120,
  ),
  "Every TIG catalog reference group needs useful components and a buyer confirmation boundary.",
);

const prompt = buildTigRfqPrompt({
  torchFamily: "WP-17 / WP-18 / WP-26 reference group",
  assemblyArrangement: "Gas-lens arrangement",
  components: ["Ceramic cup or nozzle", "Gas lens", "Gas lens"],
  tungstenReference: "  1.6 mm from package label  ",
  partReference: "  cup marked #6  ",
  quantity: "100 cups / 50 gas lenses",
  packing: "Individual labeled packing",
});

assert.match(prompt, /Torch series \/ model: WP-17 \/ WP-18 \/ WP-26 reference group/);
assert.match(prompt, /Assembly arrangement: Gas-lens arrangement/);
assert.match(prompt, /Requested components: Ceramic cup or nozzle, Gas lens/);
assert.doesNotMatch(prompt, /Gas lens, Gas lens/);
assert.match(prompt, /Tungsten diameter \(if documented\): 1.6 mm from package label/);
assert.match(prompt, /Cup number \/ visible part reference: cup marked #6/);
assert.match(prompt, /Compatibility evidence:/);

const unknownPrompt = buildTigRfqPrompt({
  torchFamily: "",
  assemblyArrangement: "",
  components: [],
  tungstenReference: "",
  partReference: "",
  quantity: "",
  packing: "",
});
assert.match(unknownPrompt, /Torch series \/ model: Unknown \/ other/);
assert.match(unknownPrompt, /Please help identify from photos or sample/);
assert.match(unknownPrompt, /Please advise suitable trial-order quantity/);

const href = buildTigRfqHref({
  torchFamily: "WP-9 / WP-20 reference group",
  assemblyArrangement: "Standard collet-body arrangement",
  components: [...tigPartOptions.slice(0, 3)],
  tungstenReference: "Drawing reference: 2.4 mm",
  partReference: "#7 cup",
  quantity: "Trial order",
  packing: "Standard export packing",
});
assert.ok(href.startsWith("/rfq?product="));
const hrefUrl = new URL(href, "https://www.arcfortweld.com");
assert.match(hrefUrl.searchParams.get("product") ?? "", /WP-9 \/ WP-20 reference group/);
assert.equal(hrefUrl.searchParams.get("quantity"), "Trial order");

const categoryTemplateSource = readFileSync(
  new URL("../components/content/CategoryPageTemplate.tsx", import.meta.url),
  "utf8",
);
const builderSource = readFileSync(
  new URL("../components/products/TigTorchPartsRfqBuilder.tsx", import.meta.url),
  "utf8",
);

assert.match(categoryTemplateSource, /TigTorchPartsRfqBuilder/);
assert.match(categoryTemplateSource, /Company Catalog Reference/);
assert.match(categoryTemplateSource, /renqiu-ailesen-welding-catalog\.pdf/);
assert.match(builderSource, /tig_rfq_builder_start/);
assert.match(builderSource, /tig_rfq_builder_continue/);
assert.match(builderSource, /Continue to RFQ/);

console.log("TIG torch parts catalog reference and RFQ builder tests passed.");
