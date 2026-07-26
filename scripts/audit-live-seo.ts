#!/usr/bin/env node

import { siteConfig } from "../lib/content/site.ts";

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
  twitterCard?: string;
  imagesMissingAlt?: number;
  imagesMissingSrc?: number;
  jsonLdCount?: number;
  invalidJsonLdCount?: number;
  internalLinks?: string[];
};

type SitemapEntry = {
  url: string;
  lastModified?: string;
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

  for (const script of scripts) {
    try {
      JSON.parse(script[1]);
    } catch {
      invalidCount += 1;
    }
  }

  return {
    count: scripts.length,
    invalidCount,
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
  const canonicalLocation = new URL(canonicalUrl);
  const requestedUrl = new URL(
    `${canonicalLocation.pathname}${canonicalLocation.search}`,
    `${fetchBaseUrl}/`,
  ).toString();
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
    twitterCard: getMetaContent(html, "twitter:card"),
    imagesMissingAlt: imageTags.filter((tag) => getAttribute(tag, "alt") === undefined).length,
    imagesMissingSrc: imageTags.filter((tag) => !getAttribute(tag, "src")).length,
    jsonLdCount: jsonLd.count,
    invalidJsonLdCount: jsonLd.invalidCount,
    internalLinks: getInternalLinks(html, canonicalUrl),
  };
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

function checkHtmlPage(row: PageAudit) {
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

      return {
        url: url ? decodeHtml(url[1].trim()) : "",
        lastModified: lastModified ? decodeHtml(lastModified[1].trim()) : undefined,
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
  }

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

  const htmlAudits = audits.filter((row) => row.contentType.includes("text/html"));
  const linkedUrls = new Set(htmlAudits.flatMap((row) => row.internalLinks ?? []));

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

  console.log("ArcFort Weld live SEO audit");
  console.log(`Canonical base URL: ${canonicalBaseUrl}`);
  console.log(`Fetch base URL: ${fetchBaseUrl}`);
  console.log(`Sitemap URLs: ${urls.length}`);
  console.log(
    `Sitemap URLs with lastmod: ${sitemapEntries.filter((entry) => entry.lastModified).length}`,
  );
  console.log(`HTML pages checked: ${htmlAudits.length}`);
  console.log(`Non-HTML files checked: ${audits.length - htmlAudits.length}`);

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
