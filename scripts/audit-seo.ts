#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import { applications } from "../content/applications.ts";
import { productCategories } from "../content/categories.ts";
import { guides } from "../content/guides.ts";
import { homepageFeaturedProductSlugs } from "../lib/content/featured-products.ts";
import {
  isLegacyProductPath,
  legacyCategoryRedirects,
  legacyProductRedirects,
} from "../lib/content/product-redirects.ts";
import { composeSeoTitle, SEO_TITLE_MAX_LENGTH } from "../lib/content/seo-title.ts";
import { organizationIdentity, siteConfig } from "../lib/content/site.ts";
import { productBuyingProfiles } from "../lib/content/product-buying-profiles.ts";
import { arcfortProducts } from "../lib/data/products.ts";

type SeoRecord = {
  sku: string;
  slug: string;
  categorySlug: string;
  metaTitle: string;
  metaDescription: string;
  mainImage: string;
  imageStatus?: string;
  verifiedDate?: string;
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
const legacyCategorySources = new Set<string>();
const legacyProductSources = new Set<string>();
const confirmedBusinessIdentity = {
  legalName: "Renqiu Ailesen Welding Technology Co., Ltd.",
  chineseName: "任丘市埃勒森焊接科技有限公司",
  brandName: "ArcFort Weld",
  email: "arcfortweld@outlook.com",
  whatsapp: "+86-18803076512",
  address: "Renqiu City, Cangzhou, Hebei Province, China",
  url: "https://www.arcfortweld.com",
} as const;

function checkMetadataLength(owner: string, title: string, description: string) {
  const renderedTitle = composeSeoTitle(title, siteConfig.shortName);

  if (renderedTitle.length > SEO_TITLE_MAX_LENGTH) {
    warnings.push(`${owner} rendered SEO title is ${renderedTitle.length} characters.`);
  }

  if (description.length > 160) {
    warnings.push(`${owner} meta description is ${description.length} characters.`);
  }
}

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

function checkBuyerTool(owner: string, href?: string) {
  if (!href) {
    return;
  }

  if (!href.startsWith("/downloads/") || href.includes("..")) {
    errors.push(`${owner} buyer tool must use a safe local /downloads/ path.`);
    return;
  }

  const filePath = path.resolve("public", href.replace(/^\/+/, ""));

  if (!existsSync(filePath)) {
    errors.push(`${owner} buyer tool does not exist: ${href}.`);
  }
}

function checkBuyerResourceLinks(
  owner: string,
  links: Array<{ href: string; title: string; description: string; actionLabel: string }> = [],
) {
  const seenHrefs = new Set<string>();

  for (const link of links) {
    if (!link.href.startsWith("/") || link.href.startsWith("//") || /[?#]/.test(link.href)) {
      errors.push(`${owner} buyer resource must use a canonical internal path: ${link.href}.`);
    }

    if (seenHrefs.has(link.href)) {
      errors.push(`${owner} has a duplicate buyer resource: ${link.href}.`);
    }

    if (link.title.length < 12 || link.description.length < 60 || link.actionLabel.length < 4) {
      errors.push(`${owner} buyer resource copy is too thin: ${link.href}.`);
    }

    seenHrefs.add(link.href);
  }
}

for (const [label, value] of [
  ["contentLastModified", siteConfig.contentLastModified],
  ["aboutLastModified", siteConfig.aboutLastModified],
  ["distributorLandingLastModified", siteConfig.distributorLandingLastModified],
  ["contactLastModified", siteConfig.contactLastModified],
  ["productTemplateLastModified", siteConfig.productTemplateLastModified],
  ["catalogLastModified", siteConfig.catalogLastModified],
] as const) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value))) {
    errors.push(`Site config ${label} has an invalid date "${value}".`);
  } else if (Date.parse(value) > Date.now() + 86_400_000) {
    errors.push(`Site config ${label} has a future date "${value}".`);
  }
}

for (const [field, actual, expected] of [
  ["legalName", siteConfig.legalName, confirmedBusinessIdentity.legalName],
  ["chineseName", siteConfig.chineseName, confirmedBusinessIdentity.chineseName],
  ["name", siteConfig.name, confirmedBusinessIdentity.brandName],
  ["email", siteConfig.email, confirmedBusinessIdentity.email],
  ["whatsapp", siteConfig.whatsapp, confirmedBusinessIdentity.whatsapp],
  ["address", siteConfig.address, confirmedBusinessIdentity.address],
  ["url", siteConfig.url, confirmedBusinessIdentity.url],
] as const) {
  if (actual !== expected) {
    errors.push(`Confirmed business identity mismatch for ${field}: "${actual}".`);
  }
}

if (
  organizationIdentity.name !== siteConfig.legalName ||
  organizationIdentity.legalName !== siteConfig.legalName
) {
  errors.push(
    "Organization structured data must use the registered company as its name and legalName.",
  );
}

if (
  organizationIdentity.brandName !== siteConfig.name ||
  !organizationIdentity.alternateNames.includes(siteConfig.name) ||
  !organizationIdentity.alternateNames.includes(siteConfig.chineseName)
) {
  errors.push(
    "Organization structured data must map ArcFort Weld and the Chinese company name to the legal entity.",
  );
}

if (
  !siteConfig.description.includes(siteConfig.legalName) ||
  !siteConfig.description.includes(siteConfig.name)
) {
  errors.push(
    "The organization description must identify both the legal company and website brand.",
  );
}

checkUnique(activeProducts, (product) => product.sku, "SKU");
checkUnique(
  activeProducts,
  (product) => `${product.categorySlug}/${product.slug}`,
  "product route",
);
checkUnique(activeProducts, (product) => product.metaTitle.toLowerCase(), "meta title");
checkUnique(activeProducts, (product) => product.metaDescription.toLowerCase(), "meta description");
checkUnique(
  activeProducts,
  (product) => product.shortDescription.toLowerCase(),
  "short description",
);
checkUnique(activeProducts, (product) => product.description.toLowerCase(), "description");

for (const product of activeProducts) {
  if (!categorySlugs.has(product.categorySlug)) {
    errors.push(`${product.sku} references missing category "${product.categorySlug}".`);
  }

  checkMetadataLength(product.sku, product.metaTitle, product.metaDescription);

  if (!product.mainImage.startsWith("/images/products/")) {
    warnings.push(`${product.sku} main image is outside /images/products/.`);
  } else {
    const imagePath = path.resolve("public", product.mainImage.replace(/^\/+/, ""));

    if (!existsSync(imagePath)) {
      warnings.push(`${product.sku} main image does not exist: ${product.mainImage}.`);
    }
  }

  if (product.verifiedDate && !/^\d{4}-\d{2}-\d{2}$/.test(product.verifiedDate)) {
    errors.push(`${product.sku} has an invalid verified date "${product.verifiedDate}".`);
  }
}

const profileSlugs = new Set<string>();

for (const profile of productBuyingProfiles) {
  if (profileSlugs.has(profile.productSlug)) {
    errors.push(`Duplicate product buying profile for "${profile.productSlug}".`);
  }
  profileSlugs.add(profile.productSlug);

  if (!productSlugs.has(profile.productSlug)) {
    errors.push(`Product buying profile references missing product "${profile.productSlug}".`);
  }

  if (profile.selectionVariables.length < 4) {
    errors.push(
      `Product buying profile ${profile.productSlug} has fewer than 4 selection variables.`,
    );
  }

  if (profile.confirmationChecklist.length < 4) {
    errors.push(
      `Product buying profile ${profile.productSlug} has fewer than 4 confirmation steps.`,
    );
  }

  if (profile.rfqFields.length < 4) {
    errors.push(`Product buying profile ${profile.productSlug} has fewer than 4 RFQ fields.`);
  }

  if (profile.faq && profile.faq.length < 3) {
    errors.push(`Product buying profile ${profile.productSlug} has fewer than 3 FAQ items.`);
  }

  checkBuyerTool(`Product buying profile ${profile.productSlug}`, profile.buyerTool?.href);
}

const featuredProductSlugs = new Set(homepageFeaturedProductSlugs);

if (featuredProductSlugs.size !== homepageFeaturedProductSlugs.length) {
  errors.push("Homepage featured product slugs contain duplicates.");
}

for (const slug of homepageFeaturedProductSlugs) {
  const product = activeProducts.find((candidate) => candidate.slug === slug);

  if (!product) {
    errors.push(`Homepage featured product "${slug}" is missing or not indexable.`);
  } else if (product.imageStatus !== "own_photo" && product.imageStatus !== "supplier_photo") {
    errors.push(`Homepage featured product "${slug}" does not have a reviewed product image.`);
  }
}

for (const category of productCategories) {
  checkMetadataLength(`Category ${category.slug}`, category.seoTitle, category.seoDescription);
  checkReferences(
    `Category ${category.slug}`,
    category.relatedCategorySlugs,
    categorySlugs,
    "category",
  );
  checkBuyerTool(`Category ${category.slug}`, category.buyerTool?.href);
  checkBuyerResourceLinks(`Category ${category.slug}`, category.buyerResourceSection?.links);

  if (category.referenceFamilies) {
    const familyNames = new Set<string>();

    for (const family of category.referenceFamilies) {
      if (familyNames.has(family.name)) {
        errors.push(`Category ${category.slug} has duplicate reference family "${family.name}".`);
      }

      familyNames.add(family.name);

      if (family.documentedComponents.length < 2) {
        errors.push(
          `Category ${category.slug} reference family "${family.name}" has fewer than 2 documented components.`,
        );
      }

      if (family.buyerCheck.length < 60) {
        errors.push(
          `Category ${category.slug} reference family "${family.name}" needs a clearer buyer check.`,
        );
      }
    }
  }
}

for (const redirect of legacyCategoryRedirects) {
  if (categorySlugs.has(redirect.sourceCategorySlug)) {
    errors.push(
      `Legacy category redirect source "${redirect.sourceCategorySlug}" conflicts with an active category.`,
    );
  }

  if (legacyCategorySources.has(redirect.sourceCategorySlug)) {
    errors.push(`Duplicate legacy category redirect source "${redirect.sourceCategorySlug}".`);
  }

  if (!categorySlugs.has(redirect.destinationCategorySlug)) {
    errors.push(
      `Legacy category redirect "${redirect.sourceCategorySlug}" points to missing category "${redirect.destinationCategorySlug}".`,
    );
  }

  legacyCategorySources.add(redirect.sourceCategorySlug);
}

for (const redirect of legacyProductRedirects) {
  const source = `${redirect.categorySlug}/${redirect.productSlug}`;

  if (!categorySlugs.has(redirect.categorySlug)) {
    errors.push(`Legacy product redirect source uses missing category "${redirect.categorySlug}".`);
  }

  if (legacyProductSources.has(source)) {
    errors.push(`Duplicate legacy product redirect source "${source}".`);
  }

  if (!redirect.destination.startsWith("/") || redirect.destination.includes("..")) {
    errors.push(`Legacy product redirect "${source}" has an unsafe destination.`);
  }

  if (redirect.destination.startsWith("/guides/")) {
    const destinationGuide = redirect.destination.replace("/guides/", "");

    if (!guides.some((guide) => guide.slug === destinationGuide)) {
      errors.push(
        `Legacy product redirect "${source}" points to missing guide "${destinationGuide}".`,
      );
    }
  }

  legacyProductSources.add(source);
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

  checkMetadataLength(`Guide ${guide.slug}`, guide.seoTitle, guide.seoDescription);

  checkReferences(`Guide ${guide.slug}`, guide.categorySlugs, categorySlugs, "category");
  checkReferences(`Guide ${guide.slug}`, guide.productSlugs, productSlugs, "product");
  checkReferences(
    `Guide ${guide.slug} component reference`,
    guide.componentReference?.rows.flatMap((row) => (row.productSlug ? [row.productSlug] : [])) ??
      [],
    productSlugs,
    "product",
  );
  checkBuyerTool(`Guide ${guide.slug}`, guide.buyerTool?.href);

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
  checkMetadataLength(
    `Application ${application.slug}`,
    application.seoTitle,
    application.seoDescription,
  );
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
  checkBuyerResourceLinks(
    `Application ${application.slug}`,
    application.buyerResourceSection?.links,
  );
}

const placeholderImages = activeProducts.filter(
  (product) => product.imageStatus === "placeholder" || product.imageStatus === "needs_photo",
).length;
const genericShortDescriptions = activeProducts.filter((product) =>
  product.shortDescription.includes("sourcing and RFQ programs"),
).length;
const genericDescriptions = activeProducts.filter((product) =>
  [
    "prepared for industrial B2B sourcing",
    "added from the Renqiu Ailesen welding catalog for B2B sourcing reference",
  ].some((phrase) => product.description.includes(phrase)),
).length;
const thinDescriptions = activeProducts.filter(
  (product) => countWords(product.description) < 80,
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

if (thinDescriptions > 0) {
  warnings.push(`${thinDescriptions} products have descriptions shorter than 80 words.`);
}

console.log("ArcFort Weld SEO audit");
console.log(`Indexable product pages: ${activeProducts.length}`);
console.log(`Product categories: ${productCategories.length}`);
console.log(`Application pages: ${applications.length}`);
console.log(`Buyer guides: ${guides.length}`);
console.log(`Legacy category redirects: ${legacyCategoryRedirects.length}`);
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
