#!/usr/bin/env node

import { siteConfig } from "../lib/content/site.ts";
import {
  isLegacyProductPath,
  legacyCategoryRedirects,
  legacyProductRedirects,
} from "../lib/content/product-redirects.ts";
import { arcfortProducts } from "../lib/data/products.ts";

type PageAudit = {
  canonicalUrl: string;
  requestedUrl: string;
  finalUrl: string;
  status: number;
  contentType: string;
  title?: string;
  description?: string;
  canonical?: string;
  htmlLang?: string;
  h1Count?: number;
  noIndex?: boolean;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
  openGraphImageWidth?: string;
  openGraphImageHeight?: string;
  openGraphImageAlt?: string;
  twitterCard?: string;
  twitterImage?: string;
  twitterImageWidth?: string;
  twitterImageHeight?: string;
  twitterImageAlt?: string;
  imagesMissingAlt?: number;
  imagesMissingSrc?: number;
  jsonLdCount?: number;
  invalidJsonLdCount?: number;
  jsonLdTypes?: string[];
  incompleteProductJsonLdCount?: number;
  brokenFragmentLinks?: string[];
  duplicateIdCount?: number;
  internalLinks?: string[];
  googleVerificationTagPresent?: boolean;
  analyticsAvailable?: boolean;
};

type SitemapEntry = {
  url: string;
  lastModified?: string;
  images: string[];
};

const args = process.argv.slice(2);
const canonicalBaseUrl = normalizeBaseUrl(getArgValue("--canonical-base-url") ?? siteConfig.url);
const fetchBaseUrl = normalizeBaseUrl(getArgValue("--fetch-base-url") ?? canonicalBaseUrl);
const batchSize = 8;
const errors: string[] = [];
const warnings: string[] = [];

function getArgValue(flag: string) {
  const index = args.indexOf(flag);

  if (index >= 0) {
    return args[index + 1];
  }

  const inlineValue = args.find((argument) => argument.startsWith(`${flag}=`));
  return inlineValue?.slice(flag.length + 1);
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function toFetchUrl(canonicalUrl: string) {
  const canonicalLocation = new URL(canonicalUrl);
  return new URL(
    `${canonicalLocation.pathname}${canonicalLocation.search}`,
    `${fetchBaseUrl}/`,
  ).toString();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function getAttribute(tag: string, attribute: string) {
  const match = tag.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decodeHtml(match[1].trim()) : undefined;
}

function getMetaContent(html: string, name: string) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of metaTags) {
    if (getAttribute(tag, "name")?.toLowerCase() === name.toLowerCase()) {
      return getAttribute(tag, "content");
    }
  }

  return undefined;
}

function getPropertyMetaContent(html: string, property: string) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of metaTags) {
    if (getAttribute(tag, "property")?.toLowerCase() === property.toLowerCase()) {
      return getAttribute(tag, "content");
    }
  }

  return undefined;
}

function getCanonical(html: string) {
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];

  for (const tag of linkTags) {
    const rel = getAttribute(tag, "rel")?.toLowerCase().split(/\s+/) ?? [];

    if (rel.includes("canonical")) {
      return getAttribute(tag, "href");
    }
  }

  return undefined;
}

function getTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1].replace(/\s+/g, " ").trim()) : undefined;
}

function auditJsonLd(html: string) {
  const scripts = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  let invalidCount = 0;
  let incompleteProductCount = 0;
  const types = new Set<string>();

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1]) as unknown;
      const entities = getTopLevelJsonLdEntities(parsed);

      for (const entity of entities) {
        const rawType = entity["@type"];
        const entityTypes = Array.isArray(rawType) ? rawType : [rawType];

        for (const type of entityTypes) {
          if (typeof type === "string") {
            types.add(type);
          }
        }

        if (
          entityTypes.includes("Product") &&
          !entity.offers &&
          !entity.review &&
          !entity.aggregateRating
        ) {
          incompleteProductCount += 1;
        }
      }
    } catch {
      invalidCount += 1;
    }
  }

  return {
    count: scripts.length,
    invalidCount,
    types: [...types],
    incompleteProductCount,
  };
}

function getTopLevelJsonLdEntities(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value.flatMap(getTopLevelJsonLdEntities);
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const entity = value as Record<string, unknown>;
  const graphEntities = Array.isArray(entity["@graph"])
    ? entity["@graph"].flatMap(getTopLevelJsonLdEntities)
    : [];

  return [...(entity["@type"] ? [entity] : []), ...graphEntities];
}

function auditFragmentLinks(html: string) {
  const idTags = html.match(/<[^>]+\bid\s*=\s*["'][^"']+["'][^>]*>/gi) ?? [];
  const ids = idTags
    .map((tag) => getAttribute(tag, "id"))
    .filter((id): id is string => Boolean(id));
  const idSet = new Set(ids);
  const fragmentLinks = (html.match(/<a\b[^>]*>/gi) ?? [])
    .map((tag) => getAttribute(tag, "href"))
    .filter((href): href is string => Boolean(href?.startsWith("#") && href.length > 1))
    .map((href) => decodeURIComponent(href.slice(1)));

  return {
    brokenLinks: [...new Set(fragmentLinks.filter((fragment) => !idSet.has(fragment)))],
    duplicateIdCount: ids.length - idSet.size,
  };
}

function getInternalLinks(html: string, pageUrl: string) {
  const canonicalOrigin = new URL(canonicalBaseUrl).origin;
  const anchorTags = html.match(/<a\b[^>]*>/gi) ?? [];
  const links = new Set<string>();

  for (const tag of anchorTags) {
    const href = getAttribute(tag, "href");

    if (!href || href.startsWith("#")) {
      continue;
    }

    try {
      const url = new URL(href, pageUrl);

      if (url.origin !== canonicalOrigin || !["http:", "https:"].includes(url.protocol)) {
        continue;
      }

      url.hash = "";
      url.search = "";
      links.add(normalizeComparableUrl(url.toString()));
    } catch {
      warnings.push(`Invalid internal link "${href}" on ${pageUrl}.`);
    }
  }

  return [...links];
}

function normalizeComparableUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  return url.toString();
}

async function auditUrl(canonicalUrl: string): Promise<PageAudit> {
  const requestedUrl = toFetchUrl(canonicalUrl);
  const response = await fetch(requestedUrl, {
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  const contentType = response.headers.get("content-type") ?? "";
  const baseAudit = {
    canonicalUrl,
    requestedUrl,
    finalUrl: response.url,
    status: response.status,
    contentType,
  };

  if (!contentType.includes("text/html")) {
    return baseAudit;
  }

  const html = await response.text();
  const robots = [
    response.headers.get("x-robots-tag") ?? undefined,
    getMetaContent(html, "robots"),
    getMetaContent(html, "googlebot"),
  ]
    .filter(Boolean)
    .join(",");
  const jsonLd = auditJsonLd(html);
  const fragments = auditFragmentLinks(html);
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0];
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];

  return {
    ...baseAudit,
    title: getTitle(html),
    description: getMetaContent(html, "description"),
    canonical: getCanonical(html),
    htmlLang: htmlTag ? getAttribute(htmlTag, "lang") : undefined,
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    noIndex: robots.toLowerCase().includes("noindex"),
    openGraphTitle: getPropertyMetaContent(html, "og:title"),
    openGraphDescription: getPropertyMetaContent(html, "og:description"),
    openGraphImage: getPropertyMetaContent(html, "og:image"),
    openGraphImageWidth: getPropertyMetaContent(html, "og:image:width"),
    openGraphImageHeight: getPropertyMetaContent(html, "og:image:height"),
    openGraphImageAlt: getPropertyMetaContent(html, "og:image:alt"),
    twitterCard: getMetaContent(html, "twitter:card"),
    twitterImage: getMetaContent(html, "twitter:image"),
    twitterImageWidth: getMetaContent(html, "twitter:image:width"),
    twitterImageHeight: getMetaContent(html, "twitter:image:height"),
    twitterImageAlt: getMetaContent(html, "twitter:image:alt"),
    imagesMissingAlt: imageTags.filter((tag) => getAttribute(tag, "alt") === undefined).length,
    imagesMissingSrc: imageTags.filter((tag) => !getAttribute(tag, "src")).length,
    jsonLdCount: jsonLd.count,
    invalidJsonLdCount: jsonLd.invalidCount,
    jsonLdTypes: jsonLd.types,
    incompleteProductJsonLdCount: jsonLd.incompleteProductCount,
    brokenFragmentLinks: fragments.brokenLinks,
    duplicateIdCount: fragments.duplicateIdCount,
    internalLinks: getInternalLinks(html, canonicalUrl),
    googleVerificationTagPresent: Boolean(getMetaContent(html, "google-site-verification")),
    analyticsAvailable: /data-analytics-available\s*=\s*["']true["']/i.test(html),
  };
}

async function auditImage(canonicalUrl: string) {
  const requestedUrl = toFetchUrl(canonicalUrl);
  const response = await fetch(requestedUrl, {
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });

  return {
    canonicalUrl,
    requestedUrl,
    finalUrl: response.url,
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
  };
}

async function auditCampaignSocialImage(canonicalUrl: string, label: string) {
  const response = await fetch(toFetchUrl(canonicalUrl), {
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (response.status !== 200) {
    errors.push(`${label} returned HTTP ${response.status}: ${canonicalUrl}.`);
    return;
  }

  if (!contentType.toLowerCase().startsWith("image/png")) {
    errors.push(`${label} is not served as image/png: ${canonicalUrl}.`);
    return;
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const isPng =
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;

  if (!isPng) {
    errors.push(`${label} does not contain a valid PNG signature: ${canonicalUrl}.`);
    return;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);

  if (width !== 1200 || height !== 630) {
    errors.push(`${label} dimensions are ${width}x${height}; expected 1200x630.`);
  }
}

async function auditPermanentRedirect(sourcePath: string, destinationPath: string) {
  const requestedUrl = new URL(sourcePath, `${fetchBaseUrl}/`).toString();
  const response = await fetch(requestedUrl, {
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
  });
  const location = response.headers.get("location");
  const resolvedLocation = location ? new URL(location, requestedUrl) : null;
  const expectedLocation = new URL(destinationPath, `${fetchBaseUrl}/`);

  if (![301, 308].includes(response.status)) {
    errors.push(`Expected permanent redirect for ${sourcePath}, received HTTP ${response.status}.`);
  }

  if (
    !resolvedLocation ||
    resolvedLocation.pathname !== expectedLocation.pathname ||
    resolvedLocation.search !== expectedLocation.search
  ) {
    errors.push(
      `Redirect mismatch: ${sourcePath} -> ${location ?? "missing Location header"}; expected ${destinationPath}.`,
    );
  }
}

function checkDuplicates(rows: PageAudit[], field: "title" | "description") {
  const seen = new Map<string, string>();

  for (const row of rows) {
    const value = row[field];

    if (!value) {
      continue;
    }

    const previousUrl = seen.get(value);

    if (previousUrl) {
      errors.push(`Duplicate ${field}: ${previousUrl} and ${row.canonicalUrl}.`);
    } else {
      seen.set(value, row.canonicalUrl);
    }
  }
}

function requireJsonLdType(row: PageAudit, type: string) {
  if (!row.jsonLdTypes?.includes(type)) {
    errors.push(`Missing ${type} JSON-LD: ${row.canonicalUrl}.`);
  }
}

function checkHtmlPage(row: PageAudit) {
  const pathname = new URL(row.canonicalUrl).pathname;
  const pathSegments = pathname.split("/").filter(Boolean);

  if (!row.title) {
    errors.push(`Missing title: ${row.canonicalUrl}.`);
  } else if (row.title.length > 60) {
    warnings.push(`Title is ${row.title.length} characters: ${row.canonicalUrl}.`);
  }

  if (!row.description) {
    errors.push(`Missing meta description: ${row.canonicalUrl}.`);
  } else if (row.description.length > 160) {
    warnings.push(`Meta description is ${row.description.length} characters: ${row.canonicalUrl}.`);
  } else if (row.description.length < 70) {
    warnings.push(
      `Meta description is only ${row.description.length} characters: ${row.canonicalUrl}.`,
    );
  }

  if (!row.canonical) {
    errors.push(`Missing canonical: ${row.canonicalUrl}.`);
  } else if (normalizeComparableUrl(row.canonical) !== normalizeComparableUrl(row.canonicalUrl)) {
    errors.push(`Canonical mismatch: ${row.canonicalUrl} -> ${row.canonical}.`);
  }

  if (!row.htmlLang?.toLowerCase().startsWith("en")) {
    errors.push(`Expected an English html lang attribute: ${row.canonicalUrl}.`);
  }

  if (row.h1Count !== 1) {
    errors.push(`Expected one H1, found ${row.h1Count ?? 0}: ${row.canonicalUrl}.`);
  }

  if (row.noIndex) {
    errors.push(`Sitemap URL is noindex: ${row.canonicalUrl}.`);
  }

  if (!row.jsonLdCount) {
    errors.push(`Missing JSON-LD: ${row.canonicalUrl}.`);
  }

  if (row.invalidJsonLdCount) {
    errors.push(`Invalid JSON-LD block count ${row.invalidJsonLdCount}: ${row.canonicalUrl}.`);
  }

  if (row.incompleteProductJsonLdCount) {
    errors.push(
      `Product JSON-LD is missing offers, review or aggregateRating: ${row.canonicalUrl}.`,
    );
  }

  requireJsonLdType(row, "Organization");
  requireJsonLdType(row, "WebSite");

  if (pathname === "/") {
    requireJsonLdType(row, "WebPage");
  } else {
    requireJsonLdType(row, "BreadcrumbList");
  }

  if (["/products", "/applications", "/guides", "/downloads"].includes(pathname)) {
    requireJsonLdType(row, "CollectionPage");
  } else if (pathname === "/about") {
    requireJsonLdType(row, "AboutPage");
  } else if (pathname === "/contact") {
    requireJsonLdType(row, "ContactPage");
  } else if (pathSegments[0] === "guides" && pathSegments.length === 2) {
    requireJsonLdType(row, "Article");
    requireJsonLdType(row, "FAQPage");
  } else if (pathSegments[0] === "products" && pathSegments.length === 2) {
    requireJsonLdType(row, "CollectionPage");
    requireJsonLdType(row, "FAQPage");
  } else if (pathSegments[0] === "products" && pathSegments.length === 3) {
    requireJsonLdType(row, "WebPage");
    requireJsonLdType(row, "FAQPage");
  } else {
    requireJsonLdType(row, "WebPage");
  }

  if (row.brokenFragmentLinks?.length) {
    errors.push(
      `Broken same-page fragment links (${row.brokenFragmentLinks.join(", ")}): ${row.canonicalUrl}.`,
    );
  }

  if (row.duplicateIdCount) {
    errors.push(`Duplicate HTML id count ${row.duplicateIdCount}: ${row.canonicalUrl}.`);
  }

  if (!row.openGraphTitle || !row.openGraphDescription || !row.openGraphImage) {
    errors.push(`Incomplete Open Graph metadata: ${row.canonicalUrl}.`);
  }

  if (
    row.openGraphImage &&
    new URL(row.openGraphImage, row.canonicalUrl).origin !== new URL(canonicalBaseUrl).origin
  ) {
    warnings.push(`Open Graph image uses an external host: ${row.canonicalUrl}.`);
  }

  if (row.twitterCard !== "summary_large_image") {
    errors.push(`Missing summary_large_image Twitter card: ${row.canonicalUrl}.`);
  }

  if (pathname === "/distributor-supply") {
    const campaignImages = [
      {
        label: "Distributor Open Graph image",
        image: row.openGraphImage,
        width: row.openGraphImageWidth,
        height: row.openGraphImageHeight,
        alt: row.openGraphImageAlt,
        expectedPath: "/distributor-supply/opengraph-image",
      },
      {
        label: "Distributor Twitter image",
        image: row.twitterImage,
        width: row.twitterImageWidth,
        height: row.twitterImageHeight,
        alt: row.twitterImageAlt,
        expectedPath: "/distributor-supply/twitter-image",
      },
    ];

    for (const image of campaignImages) {
      if (!image.image?.includes(image.expectedPath)) {
        errors.push(`${image.label} metadata is missing its campaign route.`);
      }

      if (image.width !== "1200" || image.height !== "630") {
        errors.push(
          `${image.label} metadata must be 1200x630; received ${image.width ?? "missing"}x${image.height ?? "missing"}.`,
        );
      }

      if (!image.alt?.includes("distributors and importers")) {
        errors.push(`${image.label} metadata is missing distributor-focused alt text.`);
      }
    }
  }

  if (row.imagesMissingAlt) {
    errors.push(`${row.imagesMissingAlt} images are missing alt attributes: ${row.canonicalUrl}.`);
  }

  if (row.imagesMissingSrc) {
    errors.push(
      `${row.imagesMissingSrc} images are missing crawlable src values: ${row.canonicalUrl}.`,
    );
  }
}

async function main() {
  const sitemapUrl = `${fetchBaseUrl}/sitemap.xml`;
  const sitemapResponse = await fetch(sitemapUrl, {
    signal: AbortSignal.timeout(20_000),
  });

  if (!sitemapResponse.ok) {
    throw new Error(`Sitemap returned HTTP ${sitemapResponse.status}: ${sitemapUrl}`);
  }

  const sitemapXml = await sitemapResponse.text();
  const sitemapEntries: SitemapEntry[] = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map(
    (match) => {
      const block = match[1];
      const url = block.match(/<loc>([\s\S]*?)<\/loc>/i);
      const lastModified = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i);
      const images = [...block.matchAll(/<image:loc>([\s\S]*?)<\/image:loc>/gi)].map((image) =>
        decodeHtml(image[1].trim()),
      );

      return {
        url: url ? decodeHtml(url[1].trim()) : "",
        lastModified: lastModified ? decodeHtml(lastModified[1].trim()) : undefined,
        images,
      };
    },
  );
  const urls = sitemapEntries.map((entry) => entry.url).filter(Boolean);

  if (urls.length === 0) {
    throw new Error(`No URLs found in sitemap: ${sitemapUrl}`);
  }

  const sitemapUrls = new Set<string>();
  const now = Date.now();

  for (const entry of sitemapEntries) {
    if (!entry.url) {
      errors.push("Sitemap entry is missing a URL.");
      continue;
    }

    const normalizedUrl = normalizeComparableUrl(entry.url);

    if (sitemapUrls.has(normalizedUrl)) {
      errors.push(`Duplicate sitemap URL: ${entry.url}.`);
    }

    sitemapUrls.add(normalizedUrl);

    if (new URL(entry.url).origin !== new URL(canonicalBaseUrl).origin) {
      errors.push(`Sitemap URL uses an unexpected host: ${entry.url}.`);
    }

    if (!entry.lastModified) {
      errors.push(`Sitemap URL is missing lastmod: ${entry.url}.`);
    } else {
      const parsedDate = Date.parse(entry.lastModified);

      if (!Number.isFinite(parsedDate)) {
        errors.push(`Sitemap URL has an invalid lastmod value: ${entry.url}.`);
      } else if (parsedDate > now + 86_400_000) {
        errors.push(`Sitemap URL has a future lastmod value: ${entry.url}.`);
      }
    }

    const entryImages = new Set<string>();

    for (const imageUrl of entry.images) {
      const normalizedImageUrl = normalizeComparableUrl(imageUrl);

      if (entryImages.has(normalizedImageUrl)) {
        errors.push(`Duplicate image URL in sitemap entry ${entry.url}: ${imageUrl}.`);
      }

      if (new URL(imageUrl).origin !== new URL(canonicalBaseUrl).origin) {
        errors.push(`Sitemap image uses an unexpected host: ${imageUrl}.`);
      }

      entryImages.add(normalizedImageUrl);
    }
  }

  const sitemapImageUrls = [
    ...new Set(sitemapEntries.flatMap((entry) => entry.images).map(normalizeComparableUrl)),
  ];
  const audits: PageAudit[] = [];

  for (let index = 0; index < urls.length; index += batchSize) {
    const batch = urls.slice(index, index + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        try {
          return await auditUrl(url);
        } catch (error) {
          errors.push(
            `Request failed: ${url} (${error instanceof Error ? error.message : String(error)}).`,
          );
          return null;
        }
      }),
    );

    audits.push(...batchResults.filter((row): row is PageAudit => Boolean(row)));
  }

  for (const row of audits) {
    if (row.status !== 200) {
      errors.push(`HTTP ${row.status}: ${row.requestedUrl}.`);
    }

    if (normalizeComparableUrl(row.finalUrl) !== normalizeComparableUrl(row.requestedUrl)) {
      errors.push(`Unexpected redirect: ${row.requestedUrl} -> ${row.finalUrl}.`);
    }

    if (row.contentType.includes("text/html")) {
      checkHtmlPage(row);
    }
  }

  const distributorAudit = audits.find(
    (row) => new URL(row.canonicalUrl).pathname === "/distributor-supply",
  );

  if (distributorAudit?.openGraphImage) {
    await auditCampaignSocialImage(distributorAudit.openGraphImage, "Distributor Open Graph image");
  }

  if (distributorAudit?.twitterImage) {
    await auditCampaignSocialImage(distributorAudit.twitterImage, "Distributor Twitter image");
  }

  for (let index = 0; index < sitemapImageUrls.length; index += batchSize) {
    const batch = sitemapImageUrls.slice(index, index + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        try {
          return await auditImage(url);
        } catch (error) {
          errors.push(
            `Image request failed: ${url} (${error instanceof Error ? error.message : String(error)}).`,
          );
          return null;
        }
      }),
    );

    for (const image of batchResults.filter((result): result is NonNullable<typeof result> =>
      Boolean(result),
    )) {
      if (image.status !== 200) {
        errors.push(`Image returned HTTP ${image.status}: ${image.canonicalUrl}.`);
      }

      if (!image.contentType.toLowerCase().startsWith("image/")) {
        errors.push(
          `Sitemap image has non-image content type "${image.contentType}": ${image.canonicalUrl}.`,
        );
      }

      if (normalizeComparableUrl(image.finalUrl) !== normalizeComparableUrl(image.requestedUrl)) {
        errors.push(`Sitemap image redirects: ${image.requestedUrl} -> ${image.finalUrl}.`);
      }
    }
  }

  const htmlAudits = audits.filter((row) => row.contentType.includes("text/html"));
  const linkedUrls = new Set(htmlAudits.flatMap((row) => row.internalLinks ?? []));
  const homeAudit = htmlAudits.find((row) => new URL(row.canonicalUrl).pathname === "/");
  const privacyAudit = htmlAudits.find((row) => new URL(row.canonicalUrl).pathname === "/privacy");

  if (!homeAudit?.googleVerificationTagPresent) {
    warnings.push(
      "Google Search Console HTML verification tag is absent; confirm DNS-based ownership verification separately.",
    );
  }

  if (!privacyAudit?.analyticsAvailable) {
    warnings.push(
      "GA4 is not configured; set NEXT_PUBLIC_GA_ID after creating a GA4 web data stream.",
    );
  }

  for (const entry of sitemapEntries) {
    const normalizedUrl = normalizeComparableUrl(entry.url);

    if (
      normalizedUrl !== normalizeComparableUrl(`${canonicalBaseUrl}/`) &&
      !linkedUrls.has(normalizedUrl)
    ) {
      errors.push(`Sitemap URL has no crawlable internal link: ${entry.url}.`);
    }
  }

  checkDuplicates(htmlAudits, "title");
  checkDuplicates(htmlAudits, "description");

  const robotsResponse = await fetch(`${fetchBaseUrl}/robots.txt`, {
    signal: AbortSignal.timeout(20_000),
  });
  const robotsText = await robotsResponse.text();

  if (!robotsResponse.ok) {
    errors.push(`robots.txt returned HTTP ${robotsResponse.status}.`);
  }

  if (!robotsText.includes(`Sitemap: ${canonicalBaseUrl}/sitemap.xml`)) {
    errors.push("robots.txt does not reference the canonical sitemap URL.");
  }

  if (!/Disallow:\s*\/api\//i.test(robotsText)) {
    errors.push("robots.txt does not disallow the RFQ API path.");
  }

  const filteredCatalogAudit = await auditUrl(
    `${canonicalBaseUrl}/products?q=seo-audit&category=mig-mag-torch-parts`,
  );
  const expectedCatalogCanonical = `${canonicalBaseUrl}/products`;

  if (filteredCatalogAudit.status !== 200) {
    errors.push(`Filtered product catalog returned HTTP ${filteredCatalogAudit.status}.`);
  }

  if (!filteredCatalogAudit.noIndex) {
    errors.push("Filtered product catalog must be noindex.");
  }

  if (
    !filteredCatalogAudit.canonical ||
    normalizeComparableUrl(filteredCatalogAudit.canonical) !==
      normalizeComparableUrl(expectedCatalogCanonical)
  ) {
    errors.push(
      `Filtered product catalog canonical mismatch: ${filteredCatalogAudit.canonical ?? "missing"}.`,
    );
  }

  for (const redirect of legacyCategoryRedirects) {
    const sourcePath = `/products/${redirect.sourceCategorySlug}`;
    const destinationPath = `/products/${redirect.destinationCategorySlug}`;

    await auditPermanentRedirect(sourcePath, destinationPath);

    const destinationProduct = arcfortProducts.find(
      (product) =>
        (product.status ?? "active") === "active" &&
        product.categorySlug === redirect.destinationCategorySlug &&
        !isLegacyProductPath(product.categorySlug, product.slug),
    );

    if (destinationProduct) {
      await auditPermanentRedirect(
        `${sourcePath}/${destinationProduct.slug}`,
        `${destinationPath}/${destinationProduct.slug}`,
      );
    }
  }

  for (const redirect of legacyProductRedirects) {
    await auditPermanentRedirect(
      `/products/${redirect.categorySlug}/${redirect.productSlug}`,
      redirect.destination,
    );
  }

  for (const pdfPath of [
    "/downloads/arcfort-distributor-sourcing-guide.pdf",
    "/downloads/renqiu-ailesen-welding-catalog.pdf",
  ]) {
    const pdfCanonicalUrl = `${canonicalBaseUrl}${pdfPath}`;
    const pdfResponse = await fetch(toFetchUrl(pdfCanonicalUrl), {
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
    const pdfCanonicalHeader = pdfResponse.headers.get("link") ?? "";

    if (pdfResponse.status !== 200) {
      errors.push(`${pdfPath} returned HTTP ${pdfResponse.status}.`);
    }

    if (!pdfCanonicalHeader.includes(`<${pdfCanonicalUrl}>; rel="canonical"`)) {
      errors.push(`${pdfPath} is missing its canonical Link header.`);
    }
  }

  for (const csvPath of [
    "/downloads/arcfort-public-product-list.csv",
    "/downloads/arcfort-rfq-template.csv",
    "/downloads/arcfort-tig-torch-switch-identification.csv",
  ]) {
    const response = await fetch(new URL(csvPath, `${fetchBaseUrl}/`), {
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });

    if (response.status !== 200) {
      errors.push(`${csvPath} returned HTTP ${response.status}.`);
    }

    if (!response.headers.get("x-robots-tag")?.toLowerCase().includes("noindex")) {
      errors.push(`${csvPath} is missing an X-Robots-Tag noindex header.`);
    }
  }

  console.log("ArcFort Weld live SEO audit");
  console.log(`Canonical base URL: ${canonicalBaseUrl}`);
  console.log(`Fetch base URL: ${fetchBaseUrl}`);
  console.log(`Sitemap URLs: ${urls.length}`);
  console.log(
    `Sitemap URLs with lastmod: ${sitemapEntries.filter((entry) => entry.lastModified).length}`,
  );
  console.log(`HTML pages checked: ${htmlAudits.length}`);
  console.log(`Non-HTML files checked: ${audits.length - htmlAudits.length}`);
  console.log(`Sitemap images checked: ${sitemapImageUrls.length}`);
  console.log(`Legacy category redirects checked: ${legacyCategoryRedirects.length}`);
  console.log(`Legacy product redirects checked: ${legacyProductRedirects.length}`);
  console.log(
    `Search Console HTML verification tag: ${homeAudit?.googleVerificationTagPresent ? "present" : "absent"}`,
  );
  console.log(`GA4 configuration: ${privacyAudit?.analyticsAvailable ? "configured" : "inactive"}`);

  if (errors.length > 0) {
    console.error(`\nErrors (${errors.length})`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length})`);
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    process.exit(1);
  }

  console.log("\nLive SEO audit passed with no blocking errors.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
