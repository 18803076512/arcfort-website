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
    sku: "AF-MIG-CT-0001",
    categorySlug: "mig-mag-torch-parts",
    shortDescription: "Contact tip for MIG/MAG welding torch front-end supply.",
    description: "MIG/MAG torch consumable for distributor and repair requirements.",
    applications: ["MIG/MAG welding"],
  },
  {
    slug: "tig-ceramic-cup",
    title: "TIG Ceramic Cup",
    sku: "AF-TIG-CC-0004",
    categorySlug: "tig-torch-parts",
    shortDescription: "Ceramic cup for TIG welding torch front-end supply.",
    description: "TIG torch part for GTAW equipment service and distributor requirements.",
    applications: ["TIG welding"],
  },
  {
    slug: "plasma-electrode",
    title: "Plasma Electrode",
    sku: "AF-PLA-EL-0007",
    categorySlug: "plasma-cutting-consumables",
    shortDescription: "Electrode for plasma cutting torch consumable supply.",
    description: "Plasma cutting consumable for industrial cutting equipment.",
    applications: ["Plasma cutting"],
  },
  {
    slug: "welding-cable-connector",
    title: "Welding Cable Connector",
    sku: "AF-ACC-CC-0012",
    categorySlug: "welding-accessories",
    shortDescription: "Cable connector for general welding equipment supply.",
    description: "Welding accessory for distributor and repair requirements.",
    applications: ["Welding equipment connection"],
  },
] as unknown as Product[];

function search(query: string) {
  return getProductCatalogPage({
    products,
    categories,
    searchParams: { q: query },
  }).items.map(({ product }) => product.slug);
}

assert.deepEqual(search("plasma cutter consumables"), ["plasma-electrode"]);
assert.deepEqual(search("TIG gun parts"), ["tig-ceramic-cup"]);
assert.deepEqual(search("GTAW torch components"), ["tig-ceramic-cup"]);
assert.deepEqual(search("parts of a TIG welding torch"), ["tig-ceramic-cup"]);
assert.equal(search("AF-MIG-CT-0001")[0], "mig-contact-tip");
assert.equal(search("welding accessories")[0], "welding-cable-connector");
assert.deepEqual(search("plasma electrodes"), ["plasma-electrode"]);
assert.deepEqual(search("plasma electrode suppliers"), ["plasma-electrode"]);
assert.deepEqual(search("OEM TIG torch parts"), ["tig-ceramic-cup"]);

const productCenterSource = readFileSync(
  new URL("../app/products/page.tsx", import.meta.url),
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

console.log("Product catalog search synonym tests passed.");
