#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import { productCategories } from "../content/categories.ts";
import { guides } from "../content/guides.ts";
import { composeSeoTitle, SEO_TITLE_MAX_LENGTH } from "../lib/content/seo-title.ts";
import { siteConfig } from "../lib/content/site.ts";
import { productSeries } from "../lib/data/product-series.ts";
import { arcfortProducts } from "../lib/data/products.ts";

const errors: string[] = [];
const routes = new Set<string>();
const names = new Set<string>();
const categorySlugs = new Set(productCategories.map((category) => category.slug));
const guideSlugs = new Set(guides.map((guide) => guide.slug));
const productsBySlug = new Map(arcfortProducts.map((product) => [product.slug, product]));
let relationshipCount = 0;

for (const series of productSeries) {
  const route = `${series.categorySlug}/${series.slug}`;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(series.slug)) {
    errors.push(`${series.name} has an invalid lowercase route slug: ${series.slug}.`);
  }

  if (routes.has(route)) {
    errors.push(`Duplicate product-series route: ${route}.`);
  }

  if (names.has(series.name.toLowerCase())) {
    errors.push(`Duplicate product-series name: ${series.name}.`);
  }

  routes.add(route);
  names.add(series.name.toLowerCase());

  if (!categorySlugs.has(series.categorySlug)) {
    errors.push(`${series.name} references missing category ${series.categorySlug}.`);
  }

  const category = productCategories.find((item) => item.slug === series.categorySlug);
  const categoryReference = category?.referenceFamilies?.find(
    (family) => family.seriesSlug === series.slug,
  );

  if (!categoryReference) {
    errors.push(`${series.name} is not linked from its category reference-family record.`);
  } else if (categoryReference.name !== series.referenceFamilyName) {
    errors.push(`${series.name} category reference-family name does not match the series record.`);
  }

  if (series.productReferences.length < 3) {
    errors.push(`${series.name} needs at least three reviewed product relationships.`);
  }

  if (series.documentedComponents.length < 3) {
    errors.push(`${series.name} needs a documented component stack.`);
  }

  if (series.selectionVariables.length < 4 || series.confirmationChecklist.length < 4) {
    errors.push(`${series.name} needs a complete selection and compatibility workflow.`);
  }

  if (series.rfqFields.length < 4 || series.faq.length < 3) {
    errors.push(`${series.name} needs complete RFQ guidance and FAQ content.`);
  }

  if (series.verificationStatus === "DATA_CONFLICT") {
    errors.push(
      `${series.name} cannot be published while its verification status is DATA_CONFLICT.`,
    );
  }

  if (series.sourceType === "unknown" || series.sourceReference.length < 30) {
    errors.push(`${series.name} needs a governed evidence source and source reference.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(series.reviewedDate)) {
    errors.push(`${series.name} has an invalid reviewed date: ${series.reviewedDate}.`);
  }

  if (composeSeoTitle(series.seoTitle, siteConfig.shortName).length > SEO_TITLE_MAX_LENGTH) {
    errors.push(`${series.name} rendered SEO title exceeds ${SEO_TITLE_MAX_LENGTH} characters.`);
  }

  if (series.seoDescription.length > 160 || series.seoDescription.length < 80) {
    errors.push(`${series.name} meta description must contain 80-160 characters.`);
  }

  if (!series.catalogUrl.startsWith("/downloads/") || series.catalogUrl.includes("..")) {
    errors.push(`${series.name} catalog URL is not a safe local download path.`);
  } else if (!existsSync(path.resolve("public", series.catalogUrl.replace(/^\/+/, "")))) {
    errors.push(`${series.name} catalog file does not exist: ${series.catalogUrl}.`);
  }

  const relationshipSlugs = new Set<string>();

  for (const reference of series.productReferences) {
    relationshipCount += 1;

    if (relationshipSlugs.has(reference.productSlug)) {
      errors.push(`${series.name} repeats product relationship ${reference.productSlug}.`);
      continue;
    }

    relationshipSlugs.add(reference.productSlug);
    const product = productsBySlug.get(reference.productSlug);

    if (!product) {
      errors.push(`${series.name} references missing product ${reference.productSlug}.`);
      continue;
    }

    if (product.status !== "active") {
      errors.push(`${series.name} references non-active product ${product.sku}.`);
    }

    if (product.categorySlug !== series.categorySlug) {
      errors.push(`${series.name} product ${product.sku} belongs to a different category.`);
    }

    if (product.imageStatus !== "own_photo" && product.imageStatus !== "supplier_photo") {
      errors.push(`${series.name} product ${product.sku} does not have a reviewed image status.`);
    }

    if (!product.mainImage.startsWith("/images/products/")) {
      errors.push(`${series.name} product ${product.sku} has an invalid main-image path.`);
    } else if (!existsSync(path.resolve("public", product.mainImage.replace(/^\/+/, "")))) {
      errors.push(`${series.name} product image does not exist: ${product.mainImage}.`);
    }

    if (
      reference.relationshipStatus === "confirmed" &&
      product.compatibilityStatus !== "confirmed"
    ) {
      errors.push(
        `${series.name} cannot mark ${product.sku} confirmed while the product compatibility status is ${product.compatibilityStatus}.`,
      );
    }

    if (reference.relationshipStatus === "unverified") {
      errors.push(`${series.name} cannot publish unverified relationship ${product.sku}.`);
    }
  }

  if (!relationshipSlugs.has(series.heroProductSlug)) {
    errors.push(`${series.name} hero product is not part of the governed series relationships.`);
  }

  for (const guideSlug of series.relatedGuideSlugs) {
    if (!guideSlugs.has(guideSlug)) {
      errors.push(`${series.name} references missing guide ${guideSlug}.`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Product-series errors (${errors.length})`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Product-series data tests passed.");
console.log(`Series checked: ${productSeries.length}`);
console.log(`Governed product relationships checked: ${relationshipCount}`);
