#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getProductCatalogPage } from "../lib/content/product-search.ts";
import type { Product, ProductCategory } from "../lib/content/schemas.ts";

const categories = [
  { slug: "mig-mag-torch-parts", title: "MIG/MAG Torch Parts" },
  { slug: "tig-torch-parts", title: "TIG Torch Parts" },
  { slug: "plasma-cutting-consumables", title: "Plasma Cutting Consumables" },
  { slug: "welding-accessories", title: "Welding Accessories" },
] as unknown as ProductCategory[];

const products = [
  {
    slug: "mig-contact-tip",
    title: "MIG Contact Tip",
    sku: "AF-MIG-CT-0005",
    categorySlug: "mig-mag-torch-parts",
    shortDescription: "Contact tip for MIG/MAG welding torch front-end supply.",
    description: "MIG/MAG torch consumable for distributor and repair requirements.",
    applications: ["MIG/MAG welding"],
    specifications: [
      {
        label: "Compatible Model",
        value: "15AK / MB15 reference family; confirm by sample, drawing or model number",
      },
    ],
    dataStatus: "needs_review",
    compatibilityStatus: "reference_only",
    sourceType: "official_catalog",
  },
  {
    slug: "tig-ceramic-cup",
    title: "TIG Ceramic Cup",
    sku: "AF-TIG-CC-0004",
    categorySlug: "tig-torch-parts",
    shortDescription: "Ceramic cup for TIG welding torch front-end supply.",
    description: "TIG torch part for GTAW equipment service and distributor requirements.",
    applications: ["TIG welding"],
    specifications: [],
  },
  {
    slug: "plasma-electrode",
    title: "Plasma Electrode",
    sku: "AF-PLA-EL-0007",
    categorySlug: "plasma-cutting-consumables",
    shortDescription: "Electrode for plasma cutting torch consumable supply.",
    description: "Plasma cutting consumable for industrial cutting equipment.",
    applications: ["Plasma cutting"],
    specifications: [],
  },
  {
    slug: "welding-cable-connector",
    title: "Welding Cable Connector",
    sku: "AF-ACC-CC-0012",
    categorySlug: "welding-accessories",
    shortDescription: "Cable connector for general welding equipment supply.",
    description: "Welding accessory for distributor and repair requirements.",
    applications: ["Welding equipment connection"],
    specifications: [],
  },
  {
    // Synthetic negative fixture: model names in hidden/internal data must not establish a match.
    slug: "general-contact-tip-test-fixture",
    title: "General Contact Tip",
    sku: "AF-TEST-CT-9006",
    categorySlug: "mig-mag-torch-parts",
    shortDescription: "General contact tip for torch maintenance.",
    description: "Separate sourcing reference with fit subject to sample or drawing review.",
    applications: ["MIG/MAG welding"],
    specifications: [
      {
        label: "Compatible Model",
        value: "General reference family; confirm by sample or drawing",
      },
      { label: "Image Name", value: "15AK MB15 hiddenimagesentinel" },
      { label: "Product Name", value: "hiddenproductnamesentinel" },
      { label: "SKU", value: "hiddenskusentinel" },
      { label: "Category", value: "hiddencategorysentinel" },
      { label: "Thread", value: "unknown" },
      { label: "OEM Reference", value: "TBD" },
      { label: "Technical Detail", value: "lowsignalsentinel details available upon request" },
      { label: "Packaging", value: "Standard export packing packagingsentinel" },
      { label: "publiclabelsentinel", value: "Selection reference; review by sample or drawing" },
    ],
    sourceReference: "15AK MB15 privatesourcesentinel",
    notes_internal: "privatenotessentinel",
  },
] as unknown as Product[];

const originalProducts = structuredClone(products);
const originalCategories = structuredClone(categories);

function search(query: string, category?: string) {
  return getProductCatalogPage({
    products,
    categories,
    searchParams: { q: query, category },
  }).items.map(({ product }) => product.slug);
}

assert.deepEqual(search("plasma cutter consumables"), ["plasma-electrode"]);
assert.deepEqual(search("TIG gun parts"), ["tig-ceramic-cup"]);
assert.deepEqual(search("GTAW torch components"), ["tig-ceramic-cup"]);
assert.deepEqual(search("parts of a TIG welding torch"), ["tig-ceramic-cup"]);
assert.deepEqual(search("AF-MIG-CT-0005"), ["mig-contact-tip"]);
assert.deepEqual(search("AFMIGCT0005"), ["mig-contact-tip"]);
assert.deepEqual(search("af mig ct 0005"), ["mig-contact-tip"]);
assert.deepEqual(search("AFMIGCT0005X"), []);
assert.equal(search("welding accessories")[0], "welding-cable-connector");
assert.deepEqual(search("plasma electrodes"), ["plasma-electrode"]);
assert.deepEqual(search("plasma electrode suppliers"), ["plasma-electrode"]);
assert.deepEqual(search("OEM TIG torch parts"), ["tig-ceramic-cup"]);

// Neither model appears in the reference product's title, SKU, descriptions or applications.
assert.deepEqual(search("15AK"), ["mig-contact-tip"]);
assert.deepEqual(search("MB15 contact tip"), ["mig-contact-tip"]);
assert.deepEqual(search("MB15 contact tips"), ["mig-contact-tip"]);
assert.deepEqual(search("15AK", "mig-mag-torch-parts"), ["mig-contact-tip"]);
assert.deepEqual(search("MB15 contact tip", "mig-mag-torch-parts"), ["mig-contact-tip"]);
assert.deepEqual(search("15AK", "tig-torch-parts"), []);
assert.deepEqual(search("MB15 contact tip", "tig-torch-parts"), []);

// Public specification values can match; row labels, hidden rows and private data cannot.
assert.deepEqual(search("Selection reference"), ["general-contact-tip-test-fixture"]);
for (const excludedQuery of [
  "hiddenimagesentinel",
  "hiddenproductnamesentinel",
  "hiddenskusentinel",
  "hiddencategorysentinel",
  "unknown",
  "TBD",
  "lowsignalsentinel",
  "packagingsentinel",
  "publiclabelsentinel",
  "privatesourcesentinel",
  "privatenotessentinel",
]) {
  assert.deepEqual(search(excludedQuery), [], `Excluded data matched query: ${excludedQuery}`);
}

assert.deepEqual(products[0].specifications, [
  {
    label: "Compatible Model",
    value: "15AK / MB15 reference family; confirm by sample, drawing or model number",
  },
]);
assert.equal(products[0].dataStatus, "needs_review");
assert.equal(products[0].compatibilityStatus, "reference_only");
assert.equal(products[0].sourceType, "official_catalog");
assert.deepEqual(products, originalProducts, "Search mutated its product input");
assert.deepEqual(categories, originalCategories, "Search mutated its category input");

const productCenterSource = readFileSync(
  new URL("../app/(public)/products/page.tsx", import.meta.url),
  "utf8",
);
const productFinderSource = readFileSync(
  new URL("../components/products/ProductFinderForm.tsx", import.meta.url),
  "utf8",
);

assert.match(productCenterSource, /id="product-finder"/);
assert.match(productCenterSource, /productListWhatsAppHref/);
assert.match(productCenterSource, /faqJsonLd\(\[\.\.\.productCenterFaq\]\)/);
assert.match(productFinderSource, /action="\/products#product-catalog"/);
assert.match(productFinderSource, /if \(nextCategory\) params\.set\("category", nextCategory\)/);

console.log("Product catalog search synonym and public specification tests passed.");
