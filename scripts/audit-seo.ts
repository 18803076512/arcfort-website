#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import { applications } from "../content/applications.ts";
import { productCategories } from "../content/categories.ts";
import { guides } from "../content/guides.ts";
import { isLegacyProductPath, legacyProductRedirects } from "../lib/content/product-redirects.ts";
import { arcfortProducts } from "../lib/data/products.ts";

type SeoRecord = {
  sku: string;
  slug: string;
  categorySlug: string;
  metaTitle: string;
  metaDescription: string;
  mainImage: string;
  imageStatus?: string;
  shortDescription: string;
  description: string;
};

const errors: string[] = [];
const warnings: string[] = [];
const categorySlugs = new Set(productCategories.map((category) => category.slug));
const guideSlugs = new Set<string>();
const guideSeoTitles = new Set<string>();
const guideSeoDescriptions = new Set<string>();
const activeProducts: SeoRecord[] = arcfortProducts
  .filter((product) => (product.status ?? "active") === "active")
  .filter((product) => !isLegacyProductPath(product.categorySlug, product.slug));
const productSlugs = new Set(activeProducts.map((product) => product.slug));

function checkUnique(records: SeoRecord[], getValue: (record: SeoRecord) => string, label: string) {
  const values = new Map<string, string>();

  for (const record of records) {
    const value = getValue(record);
    const existingSku = values.get(value);

    if (existingSku) {
      errors.push(`Duplicate ${label} "${value}" on ${existingSku} and ${record.sku}.`);
    } else {
      values.set(value, record.sku);
    }
  }
}

function checkReferences(
  owner: string,
  references: string[],
  validValues: Set<string>,
  label: string,
) {
  for (const reference of references) {
    if (!validValues.has(reference)) {
      errors.push(`${owner} references missing ${label} "${reference}".`);
    }
  }
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

checkUnique(activeProducts, (product) => product.sku, "SKU");
checkUnique(
  activeProducts,
  (product) => `${product.categorySlug}/${product.slug}`,
  "product route",
);
checkUnique(activeProducts, (product) => product.metaTitle.toLowerCase(), "meta title");
checkUnique(activeProducts, (product) => product.metaDescription.toLowerCase(), "meta description");

for (const product of activeProducts) {
  if (!categorySlugs.has(product.categorySlug)) {
    errors.push(`${product.sku} references missing category "${product.categorySlug}".`);
  }

  if (product.metaTitle.length > 60) {
    warnings.push(`${product.sku} meta title is ${product.metaTitle.length} characters.`);
  }

  if (product.metaDescription.length > 160) {
    warnings.push(
      `${product.sku} meta description is ${product.metaDescription.length} characters.`,
    );
  }

  if (!product.mainImage.startsWith("/images/products/")) {
    warnings.push(`${product.sku} main image is outside /images/products/.`);
  } else {
    const imagePath = path.resolve("public", product.mainImage.replace(/^\/+/, ""));

    if (!existsSync(imagePath)) {
      warnings.push(`${product.sku} main image does not exist: ${product.mainImage}.`);
    }
  }
}

for (const category of productCategories) {
  checkReferences(
    `Category ${category.slug}`,
    category.relatedCategorySlugs,
    categorySlugs,
    "category",
  );
}

for (const guide of guides) {
  const normalizedSeoTitle = guide.seoTitle.toLowerCase();
  const normalizedSeoDescription = guide.seoDescription.toLowerCase();

  if (guideSlugs.has(guide.slug)) {
    errors.push(`Duplicate guide slug "${guide.slug}".`);
  }

  if (guideSeoTitles.has(normalizedSeoTitle)) {
    errors.push(`Duplicate guide SEO title "${guide.seoTitle}".`);
  }

  if (guideSeoDescriptions.has(normalizedSeoDescription)) {
    errors.push(`Duplicate guide SEO description on ${guide.slug}.`);
  }

  guideSlugs.add(guide.slug);
  guideSeoTitles.add(normalizedSeoTitle);
  guideSeoDescriptions.add(normalizedSeoDescription);

  if (guide.seoTitle.length > 60) {
    warnings.push(`Guide ${guide.slug} SEO title is ${guide.seoTitle.length} characters.`);
  }

  if (guide.seoDescription.length > 160) {
    warnings.push(
      `Guide ${guide.slug} SEO description is ${guide.seoDescription.length} characters.`,
    );
  }

  checkReferences(`Guide ${guide.slug}`, guide.categorySlugs, categorySlugs, "category");
  checkReferences(`Guide ${guide.slug}`, guide.productSlugs, productSlugs, "product");

  const articleWordCount = guide.sections.reduce(
    (total, section) => total + countWords(`${section.title} ${section.body}`),
    0,
  );

  if (guide.sections.length < 5) {
    errors.push(`Guide ${guide.slug} has fewer than 5 content sections.`);
  }

  if (articleWordCount < 250) {
    errors.push(`Guide ${guide.slug} has only ${articleWordCount} section words.`);
  }

  if (guide.faq.length < 3) {
    errors.push(`Guide ${guide.slug} has fewer than 3 FAQ items.`);
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(guide.publishedDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(guide.modifiedDate)
  ) {
    errors.push(`Guide ${guide.slug} has an invalid publication or modification date.`);
  } else if (guide.modifiedDate < guide.publishedDate) {
    errors.push(`Guide ${guide.slug} has a modified date before its published date.`);
  }
}

for (const application of applications) {
  checkReferences(
    `Application ${application.slug}`,
    application.relatedCategorySlugs,
    categorySlugs,
    "category",
  );
  checkReferences(
    `Application ${application.slug}`,
    application.relatedProductSlugs,
    productSlugs,
    "product",
  );
}

const placeholderImages = activeProducts.filter(
  (product) => product.imageStatus === "placeholder" || product.imageStatus === "needs_photo",
).length;
const genericShortDescriptions = activeProducts.filter((product) =>
  product.shortDescription.includes("sourcing and RFQ programs"),
).length;
const genericDescriptions = activeProducts.filter((product) =>
  product.description.includes("prepared for industrial B2B sourcing"),
).length;

if (placeholderImages > 0) {
  warnings.push(
    `${placeholderImages} indexable products still use placeholder or needs-photo image status.`,
  );
}

if (genericShortDescriptions > 0 || genericDescriptions > 0) {
  warnings.push(
    `${Math.max(genericShortDescriptions, genericDescriptions)} products still use generic import copy and need product-specific editorial review.`,
  );
}

console.log("ArcFort Weld SEO audit");
console.log(`Indexable product pages: ${activeProducts.length}`);
console.log(`Product categories: ${productCategories.length}`);
console.log(`Application pages: ${applications.length}`);
console.log(`Buyer guides: ${guides.length}`);
console.log(`Legacy product redirects: ${legacyProductRedirects.length}`);

if (errors.length > 0) {
  console.error(`\nErrors (${errors.length})`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
}

if (warnings.length > 0) {
  console.warn(`\nWarnings (${warnings.length})`);
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (errors.length > 0) {
  process.exit(1);
}

console.log("\nSEO audit passed with no blocking errors.");
