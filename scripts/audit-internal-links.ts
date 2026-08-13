#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { siteConfig } from "../lib/content/site.ts";

type PriorityTarget = {
  path: string;
  label: string;
  minimumInboundSources: number;
  requiredSources: string[];
};

type DynamicSource = {
  route: string;
  sourceFile: string;
};

const appBuildDir = path.resolve(".next/server/app");
const errors: string[] = [];
const inboundSources = new Map<string, Set<string>>();
const sourceLinks = new Map<string, Set<string>>();
const dynamicSources: DynamicSource[] = [
  {
    route: "/products",
    sourceFile: path.resolve("app/products/page.tsx"),
  },
];
const priorityTargets: PriorityTarget[] = [
  {
    path: "/products/welding-accessories/robot-welding-torch",
    label: "Robotic MIG/MAG welding torch product",
    minimumInboundSources: 4,
    requiredSources: [
      "/products/welding-accessories",
      "/products/mig-mag-torch-parts",
      "/applications/automotive",
      "/guides/robotic-mig-welding-torch-replacement-guide",
    ],
  },
  {
    path: "/guides/robotic-mig-welding-torch-replacement-guide",
    label: "Robotic MIG/MAG welding torch replacement guide",
    minimumInboundSources: 4,
    requiredSources: [
      "/guides",
      "/products/mig-mag-torch-parts",
      "/applications/automotive",
      "/products/welding-accessories/robot-welding-torch",
    ],
  },
  {
    path: "/guides/welding-machine-sourcing-checklist",
    label: "Welding machine sourcing checklist",
    minimumInboundSources: 5,
    requiredSources: [
      "/guides",
      "/products",
      "/products/welding-machines",
      "/products/welding-machines/wire-feeder",
    ],
  },
];

function walkHtmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkHtmlFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  });
}

function routeFromHtmlFile(filePath: string) {
  const relativePath = path.relative(appBuildDir, filePath).replaceAll(path.sep, "/");
  const withoutExtension = relativePath.replace(/\.html$/, "");

  if (withoutExtension === "index") {
    return "/";
  }

  return `/${withoutExtension.replace(/\/index$/, "")}`;
}

function decodeAttribute(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'");
}

function normalizeInternalPath(href: string) {
  try {
    const url = new URL(decodeAttribute(href), siteConfig.url);

    if (url.origin !== new URL(siteConfig.url).origin) {
      return null;
    }

    const normalizedPath = url.pathname.replace(/\/+$/, "");
    return normalizedPath || "/";
  } catch {
    return null;
  }
}

function getInternalLinks(html: string) {
  const links = new Set<string>();

  for (const match of html.matchAll(/<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/gi)) {
    const normalizedPath = normalizeInternalPath(match[1] ?? match[2] ?? "");

    if (normalizedPath) {
      links.add(normalizedPath);
    }
  }

  return links;
}

function getSourceInternalLinks(source: string) {
  const links = new Set<string>();

  for (const match of source.matchAll(/["'`]((?:\/)[a-z0-9][a-z0-9\-./]*)["'`]/gi)) {
    const normalizedPath = normalizeInternalPath(match[1] ?? "");

    if (normalizedPath) {
      links.add(normalizedPath);
    }
  }

  return links;
}

if (!existsSync(appBuildDir)) {
  throw new Error("Built App Router HTML is missing. Run npm run build before npm run seo:links.");
}

const htmlFiles = walkHtmlFiles(appBuildDir).filter(
  (filePath) => !filePath.endsWith(`${path.sep}_not-found.html`),
);

for (const filePath of htmlFiles) {
  const sourcePath = routeFromHtmlFile(filePath);
  const links = getInternalLinks(readFileSync(filePath, "utf8"));
  sourceLinks.set(sourcePath, links);

  for (const targetPath of links) {
    if (targetPath === sourcePath) {
      continue;
    }

    const sources = inboundSources.get(targetPath) ?? new Set<string>();
    sources.add(sourcePath);
    inboundSources.set(targetPath, sources);
  }
}

for (const dynamicSource of dynamicSources) {
  const links = getSourceInternalLinks(readFileSync(dynamicSource.sourceFile, "utf8"));
  sourceLinks.set(dynamicSource.route, links);

  for (const targetPath of links) {
    if (targetPath === dynamicSource.route) {
      continue;
    }

    const sources = inboundSources.get(targetPath) ?? new Set<string>();
    sources.add(dynamicSource.route);
    inboundSources.set(targetPath, sources);
  }
}

for (const target of priorityTargets) {
  const sources = inboundSources.get(target.path) ?? new Set<string>();

  if (sources.size < target.minimumInboundSources) {
    errors.push(
      `${target.label} has ${sources.size} distinct inbound source pages; expected at least ${target.minimumInboundSources}.`,
    );
  }

  for (const requiredSource of target.requiredSources) {
    if (!sourceLinks.get(requiredSource)?.has(target.path)) {
      errors.push(`${requiredSource} must link to ${target.path}.`);
    }
  }
}

console.log("ArcFort Weld built internal link audit");
console.log(`HTML pages checked: ${htmlFiles.length}`);
console.log(`Dynamic source pages checked: ${dynamicSources.length}`);

for (const target of priorityTargets) {
  const sources = [...(inboundSources.get(target.path) ?? [])].sort();
  console.log(`${target.path}: ${sources.length} inbound source pages`);
  console.log(`  ${sources.join(" | ")}`);
}

if (errors.length > 0) {
  console.error(`\nInternal link errors (${errors.length})`);

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exitCode = 1;
} else {
  console.log("Internal link audit passed with no blocking errors.");
}
