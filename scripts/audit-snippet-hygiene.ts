#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { guides } from "../content/guides.ts";

const buildRoot = path.resolve(".next/server/app");
const errors: string[] = [];

type RegionRequirement = {
  page: string;
  region: string;
  minimum: number;
};

const regionRequirements: RegionRequirement[] = [
  { page: "index.html", region: "site-header-utility", minimum: 1 },
  { page: "index.html", region: "site-header-navigation", minimum: 1 },
  { page: "index.html", region: "site-trust-strip", minimum: 1 },
  { page: "index.html", region: "homepage-category-code", minimum: 6 },
  { page: "index.html", region: "product-visual", minimum: 1 },
  { page: "index.html", region: "product-card-actions", minimum: 1 },
  { page: "index.html", region: "site-footer-cta", minimum: 1 },
  { page: "index.html", region: "site-footer-links", minimum: 1 },
  { page: "index.html", region: "site-footer-legal", minimum: 1 },
  { page: "index.html", region: "sticky-contact", minimum: 1 },
  {
    page: "products/mig-mag-torch-parts.html",
    region: "related-category-code",
    minimum: 1,
  },
];

function readBuiltPage(relativePath: string) {
  const filePath = path.join(buildRoot, relativePath);

  if (!existsSync(filePath)) {
    throw new Error(`Built page is missing: ${filePath}`);
  }

  return readFileSync(filePath, "utf8");
}

function getAttribute(tag: string, name: string) {
  const quoted = tag.match(new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));

  if (quoted) {
    return quoted[2];
  }

  const unquoted = tag.match(new RegExp(`${name}\\s*=\\s*([^\\s>]+)`, "i"));
  return unquoted?.[1];
}

function getMetaContent(html: string, selectorName: "name" | "property", selectorValue: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of tags) {
    if (getAttribute(tag, selectorName)?.toLowerCase() === selectorValue.toLowerCase()) {
      return getAttribute(tag, "content");
    }
  }

  return undefined;
}

const pages = new Map<string, string>();

for (const requirement of regionRequirements) {
  const html = pages.get(requirement.page) ?? readBuiltPage(requirement.page);
  pages.set(requirement.page, html);
  const openingTags = html.match(/<(?:div|span|section)\b[^>]*>/gi) ?? [];
  const matchingTags = openingTags.filter(
    (tag) => getAttribute(tag, "data-snippet-region") === requirement.region,
  );

  if (matchingTags.length < requirement.minimum) {
    errors.push(
      `${requirement.page} requires at least ${requirement.minimum} ${requirement.region} region(s); found ${matchingTags.length}.`,
    );
    continue;
  }

  if (matchingTags.some((tag) => !/\sdata-nosnippet(?:\s|=|>)/i.test(tag))) {
    errors.push(`${requirement.page} has an unprotected ${requirement.region} region.`);
  }
}

for (const [relativePath, html] of pages) {
  const tags = html.match(/<([a-z][a-z0-9-]*)\b[^>]*\sdata-nosnippet(?:\s|=|>)[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const tagName = tag.match(/^<([a-z][a-z0-9-]*)/i)?.[1]?.toLowerCase();

    if (tagName && !["div", "section", "span"].includes(tagName)) {
      errors.push(`${relativePath} uses data-nosnippet on unsupported <${tagName}>.`);
    }
  }

  if (/<(?:main|h1)\b[^>]*\sdata-nosnippet(?:\s|=|>)/i.test(html)) {
    errors.push(`${relativePath} hides primary page content from search snippets.`);
  }
}

for (const guide of guides) {
  const relativePath = `guides/${guide.slug}.html`;
  const html = readBuiltPage(relativePath);
  const rfqPrompt = `Reference guide: ${guide.title}\nProducts or parts requested:`;
  const rfqHref = `/rfq?product=${encodeURIComponent(rfqPrompt)}`;
  const workflowTags = (html.match(/<section\b[^>]*>/gi) ?? []).filter(
    (tag) => getAttribute(tag, "data-snippet-region") === "guide-rfq-workflow",
  );

  if (workflowTags.length !== 1) {
    errors.push(
      `${relativePath} requires one guide-rfq-workflow region; found ${workflowTags.length}.`,
    );
  } else if (!/\sdata-nosnippet(?:\s|=|>)/i.test(workflowTags[0])) {
    errors.push(`${relativePath} has an unprotected guide-rfq-workflow region.`);
  }

  if (!html.includes("/downloads/arcfort-rfq-template.csv")) {
    errors.push(`${relativePath} is missing the RFQ worksheet download.`);
  }

  if (!html.includes(rfqHref)) {
    errors.push(`${relativePath} is missing its topic-prefilled RFQ link.`);
  }
}

const distributorHtml = readBuiltPage("distributor-supply.html");
const socialMetadata = [
  {
    label: "Open Graph",
    image: getMetaContent(distributorHtml, "property", "og:image"),
    width: getMetaContent(distributorHtml, "property", "og:image:width"),
    height: getMetaContent(distributorHtml, "property", "og:image:height"),
    alt: getMetaContent(distributorHtml, "property", "og:image:alt"),
    expectedPath: "/distributor-supply/opengraph-image",
  },
  {
    label: "Twitter",
    image: getMetaContent(distributorHtml, "name", "twitter:image"),
    width: getMetaContent(distributorHtml, "name", "twitter:image:width"),
    height: getMetaContent(distributorHtml, "name", "twitter:image:height"),
    alt: getMetaContent(distributorHtml, "name", "twitter:image:alt"),
    expectedPath: "/distributor-supply/twitter-image",
  },
];

for (const metadata of socialMetadata) {
  if (!metadata.image?.includes(metadata.expectedPath)) {
    errors.push(`${metadata.label} image does not use the distributor campaign image route.`);
  }

  if (metadata.width !== "1200" || metadata.height !== "630") {
    errors.push(
      `${metadata.label} image dimensions must be 1200x630; received ${metadata.width ?? "missing"}x${metadata.height ?? "missing"}.`,
    );
  }

  if (!metadata.alt?.includes("distributors and importers")) {
    errors.push(`${metadata.label} image alt text is missing the distributor context.`);
  }
}

console.log("ArcFort Weld search snippet and social preview audit");
console.log(`Snippet regions checked: ${regionRequirements.length}`);
console.log(`Guide RFQ workflows checked: ${guides.length}`);
console.log("Distributor social preview: 1200x630 Open Graph and Twitter routes");

if (errors.length > 0) {
  console.error("\nErrors:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Snippet hygiene and social preview audit passed.");
