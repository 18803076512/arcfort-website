#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { productCategories } from "../content/categories.ts";
import { guides } from "../content/guides.ts";
import {
  buildWeldingMachineRfqHref,
  buildWeldingMachineRfqPrompt,
  weldingMachineAccessoryOptions,
  weldingMachineDocumentOptions,
} from "../lib/welding-machine-rfq-builder.ts";

const category = productCategories.find((candidate) => candidate.slug === "welding-machines");

assert.ok(category, "Welding machines category must exist.");
assert.ok(category.componentGuide && category.componentGuide.length >= 5);
assert.ok(category.selectionVariables && category.selectionVariables.length >= 5);
assert.equal(category.buyerTool?.href, "/downloads/arcfort-welding-machine-rfq.xlsx");

const guide = guides.find((candidate) => candidate.slug === "welding-machine-sourcing-checklist");
assert.ok(guide, "Welding machine sourcing checklist must exist.");
assert.equal(guide.title, "Welding Machine Sourcing Checklist and RFQ Guide");
assert.equal(guide.seoTitle, "Welding Machine Sourcing & RFQ Checklist");
assert.match(guide.seoDescription, /MIG\/MAG, TIG, MMA and plasma welding machines/);

const prompt = buildWeldingMachineRfqPrompt({
  processes: ["MIG/MAG welding", "MIG/MAG welding", "TIG welding", "invented process"],
  application: "  Distributor machines for workshop fabrication  ",
  electricalInput: "  Buyer site record: 400 V, 50 Hz, three phase  ",
  arrangement: "Machine with separate wire feeder",
  accessories: [
    "Welding torch or cutting torch",
    "Wire feeder",
    "Wire feeder",
    "invented accessory",
  ],
  documents: ["Product data sheet", "Available compliance documents for review"],
  destination: "Germany",
  quantity: "2 trial units",
  packing: "Distributor carton and label review",
});

assert.match(prompt, /Required process: MIG\/MAG welding, TIG welding/);
assert.doesNotMatch(prompt, /invented process/);
assert.match(prompt, /Application and work requirement: Distributor machines/);
assert.match(prompt, /Destination electrical input.*400 V, 50 Hz, three phase/);
assert.match(prompt, /Required accessories: Welding torch or cutting torch, Wire feeder/);
assert.doesNotMatch(prompt, /Wire feeder, Wire feeder/);
assert.doesNotMatch(prompt, /invented accessory/);
assert.match(prompt, /Available compliance documents for review/);
assert.match(prompt, /No unverified rating or certification should be assumed/);

const unknownPrompt = buildWeldingMachineRfqPrompt({
  processes: [],
  application: "",
  electricalInput: "",
  arrangement: "",
  accessories: [],
  documents: [],
  destination: "",
  quantity: "",
  packing: "",
});
assert.match(unknownPrompt, /Required process: Supplier recommendation requested/);
assert.match(unknownPrompt, /Not confirmed - supplier should request voltage/);
assert.match(unknownPrompt, /Please propose an itemized standard package/);
assert.match(unknownPrompt, /Please advise a suitable trial-order option/);

const href = buildWeldingMachineRfqHref({
  processes: ["Plasma cutting"],
  application: "Metal cutting workshop",
  electricalInput: "Buyer will provide site record",
  arrangement: "Compact or integrated equipment",
  accessories: [...weldingMachineAccessoryOptions.slice(0, 2)],
  documents: [...weldingMachineDocumentOptions.slice(0, 2)],
  destination: "Saudi Arabia",
  quantity: "3 units",
  packing: "Standard export packing",
});
assert.ok(href.startsWith("/rfq?product="));
const hrefUrl = new URL(href, "https://www.arcfortweld.com");
assert.match(hrefUrl.searchParams.get("product") ?? "", /Plasma cutting/);
assert.equal(hrefUrl.searchParams.get("quantity"), "3 units");

const categoryTemplateSource = readFileSync(
  new URL("../components/content/CategoryPageTemplate.tsx", import.meta.url),
  "utf8",
);
const builderSource = readFileSync(
  new URL("../components/products/WeldingMachineRfqBuilder.tsx", import.meta.url),
  "utf8",
);
const guideTemplateSource = readFileSync(
  new URL("../app/guides/[slug]/page.tsx", import.meta.url),
  "utf8",
);
const stickyContactSource = readFileSync(
  new URL("../components/StickyContactBar.tsx", import.meta.url),
  "utf8",
);
const productCenterSource = readFileSync(
  new URL("../app/products/page.tsx", import.meta.url),
  "utf8",
);

assert.match(categoryTemplateSource, /WeldingMachineRfqBuilder/);
assert.match(categoryTemplateSource, /hasWeldingMachineRfqBuilder/);
assert.match(builderSource, /machine_rfq_builder_start/);
assert.match(builderSource, /machine_rfq_builder_continue/);
assert.match(builderSource, /Continue to RFQ/);
assert.match(builderSource, /data-hide-sticky-contact-when-visible/);
assert.match(guideTemplateSource, /WeldingMachineRfqBuilder/);
assert.match(guideTemplateSource, /welding-machine-sourcing-checklist/);
assert.match(guideTemplateSource, /machine-guide-rfq-builder/);
assert.match(stickyContactSource, /IntersectionObserver/);
assert.match(stickyContactSource, /data-hide-sticky-contact-when-visible/);
assert.match(stickyContactSource, /usePathname/);
assert.match(productCenterSource, /Welding Machines/);
assert.match(productCenterSource, /Machine Sourcing Checklist/);
assert.match(productCenterSource, /\/guides\/welding-machine-sourcing-checklist/);

console.log("Welding machine RFQ builder tests passed.");
