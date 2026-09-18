#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { isSearchEligibleProductImageAsset } from "../lib/content/product-image-evidence.ts";
import { productImageAssets } from "../lib/data/product-image-assets.ts";
import { arcfortProducts } from "../lib/data/products.ts";

const buildRoot = path.resolve(".next", "server", "app");
const sitemapPath = path.join(buildRoot, "sitemap.xml.body");
const errors: string[] = [];
const productBySku = new Map(arcfortProducts.map((product) => [product.sku, product]));

function readRequiredFile(filePath: string) {
  if (!existsSync(filePath)) {
    errors.push(`Missing built file: ${path.relative(process.cwd(), filePath)}.`);
    return "";
  }

  return readFileSync(filePath, "utf8");
}

function getSearchImageMetaTags(html: string) {
  return Array.from(html.matchAll(/<meta\b[^>]*>/g), ([tag]) => tag).filter((tag) =>
    /(?:property|name)="(?:og:image|twitter:image)"/.test(tag),
  );
}

function getStructuredDataScripts(html: string) {
  return Array.from(
    html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    (match) => match[1],
  );
}

const sitemap = readRequiredFile(sitemapPath);
let publicAssetsChecked = 0;
let publicReferenceAssetsChecked = 0;
let exactSearchAssetsChecked = 0;

for (const asset of productImageAssets) {
  const product = productBySku.get(asset.sku);

  if (!product || product.status !== "active") {
    continue;
  }

  const htmlPath = path.join(buildRoot, "products", product.categorySlug, `${product.slug}.html`);
  const html = readRequiredFile(htmlPath);

  if (!html) {
    continue;
  }

  publicAssetsChecked += 1;
  const searchImageMeta = getSearchImageMetaTags(html).join("\n");
  const structuredData = getStructuredDataScripts(html).join("\n");
  const isSearchEligible = isSearchEligibleProductImageAsset(asset);

  if (isSearchEligible) {
    exactSearchAssetsChecked += 1;

    if (!searchImageMeta.includes(asset.publicPath)) {
      errors.push(`${asset.assetId} is search eligible but absent from product social metadata.`);
    }
    if (!structuredData.includes(asset.publicPath)) {
      errors.push(`${asset.assetId} is search eligible but absent from product structured data.`);
    }
    if (!sitemap.includes(asset.publicPath)) {
      errors.push(`${asset.assetId} is search eligible but absent from the image sitemap.`);
    }
    continue;
  }

  if (searchImageMeta.includes(asset.publicPath)) {
    errors.push(`${asset.assetId} is not search eligible but appears in product social metadata.`);
  }
  if (structuredData.includes(asset.publicPath)) {
    errors.push(`${asset.assetId} is not search eligible but appears in product structured data.`);
  }
  if (sitemap.includes(asset.publicPath)) {
    errors.push(`${asset.assetId} is not search eligible but appears in the image sitemap.`);
  }

  if (asset.publicationStatus === "legacy_reference") {
    publicReferenceAssetsChecked += 1;
    const expectedDisclosure =
      asset.role === "main"
        ? "Main product-family reference image"
        : `${asset.role.replaceAll("_", " ")} product-family reference image`;

    if (!html.toLowerCase().includes(expectedDisclosure.toLowerCase())) {
      errors.push(`${asset.assetId} is public without its product-family reference disclosure.`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Built product-image evidence audit failed (${errors.length}):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Built product-image evidence audit passed.");
console.log(`Public image assets checked: ${publicAssetsChecked}`);
console.log(
  `Public legacy references disclosed and excluded from search: ${publicReferenceAssetsChecked}`,
);
console.log(`Rights-approved exact search images projected: ${exactSearchAssetsChecked}`);
