#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

type AppBuildManifest = {
  pages?: Record<string, string[]>;
};

type RouteBudget = {
  label: string;
  route: string;
  maxGzipBytes: number;
};

const projectRoot = process.cwd();
const nextRoot = path.join(projectRoot, ".next");
const manifestPath = path.join(nextRoot, "app-build-manifest.json");
const kibibyte = 1024;
const routeBudgets: RouteBudget[] = [
  { label: "Homepage", route: "/page", maxGzipBytes: 140 * kibibyte },
  { label: "Product Center", route: "/products/page", maxGzipBytes: 145 * kibibyte },
  {
    label: "Product Category",
    route: "/products/[category]/page",
    maxGzipBytes: 150 * kibibyte,
  },
  {
    label: "Distributor Landing",
    route: "/distributor-supply/page",
    maxGzipBytes: 150 * kibibyte,
  },
  { label: "Contact", route: "/contact/page", maxGzipBytes: 150 * kibibyte },
  { label: "RFQ", route: "/rfq/page", maxGzipBytes: 150 * kibibyte },
];
const maxCssGzipBytes = 15 * kibibyte;
const maxSingleJavaScriptGzipBytes = 65 * kibibyte;
const maxSiteImageSourceBytes = 3 * 1024 * 1024;
const sharedManifestRoutes = ["/layout", "/error", "/global-error"];

function formatBytes(bytes: number) {
  return `${(bytes / kibibyte).toFixed(1)} KiB`;
}

function getAssetPath(asset: string) {
  const normalizedAsset = asset.replaceAll("/", path.sep);
  const absolutePath = path.join(nextRoot, normalizedAsset);

  if (!absolutePath.startsWith(`${nextRoot}${path.sep}`)) {
    throw new Error(`Build asset resolved outside .next: ${asset}`);
  }

  return absolutePath;
}

function getGzipSize(asset: string) {
  const assetPath = getAssetPath(asset);

  if (!existsSync(assetPath)) {
    throw new Error(`Build asset is missing: ${asset}`);
  }

  return gzipSync(readFileSync(assetPath), { level: 9 }).byteLength;
}

function getRouteAssets(manifest: AppBuildManifest, route: string) {
  const pages = manifest.pages ?? {};
  const routeAssets = pages[route];

  if (!routeAssets) {
    throw new Error(`Route is missing from the app build manifest: ${route}`);
  }

  return new Set([
    ...sharedManifestRoutes.flatMap((sharedRoute) => pages[sharedRoute] ?? []),
    ...routeAssets,
  ]);
}

function getFilesRecursively(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? getFilesRecursively(entryPath) : [entryPath];
  });
}

function main() {
  if (!existsSync(manifestPath)) {
    console.error("Next.js build output is missing. Run npm run build before performance:budget.");
    process.exitCode = 1;
    return;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as AppBuildManifest;
  const errors: string[] = [];
  const allRouteAssets = new Set<string>();

  console.log("ArcFort Weld performance budget");

  for (const budget of routeBudgets) {
    const assets = getRouteAssets(manifest, budget.route);
    const javaScriptAssets = [...assets].filter((asset) => asset.endsWith(".js"));
    const gzipBytes = javaScriptAssets.reduce((total, asset) => total + getGzipSize(asset), 0);

    javaScriptAssets.forEach((asset) => allRouteAssets.add(asset));
    console.log(
      `${budget.label} JavaScript: ${formatBytes(gzipBytes)} / ${formatBytes(budget.maxGzipBytes)}`,
    );

    if (gzipBytes > budget.maxGzipBytes) {
      errors.push(
        `${budget.label} JavaScript exceeds its gzip budget by ${formatBytes(
          gzipBytes - budget.maxGzipBytes,
        )}.`,
      );
    }
  }

  const cssAssets = new Set(
    routeBudgets.flatMap((budget) =>
      [...getRouteAssets(manifest, budget.route)].filter((asset) => asset.endsWith(".css")),
    ),
  );
  const cssGzipBytes = [...cssAssets].reduce((total, asset) => total + getGzipSize(asset), 0);
  console.log(`Shared CSS: ${formatBytes(cssGzipBytes)} / ${formatBytes(maxCssGzipBytes)}`);

  if (cssGzipBytes > maxCssGzipBytes) {
    errors.push(
      `Shared CSS exceeds its gzip budget by ${formatBytes(cssGzipBytes - maxCssGzipBytes)}.`,
    );
  }

  for (const asset of allRouteAssets) {
    const gzipBytes = getGzipSize(asset);

    if (gzipBytes > maxSingleJavaScriptGzipBytes) {
      errors.push(
        `${asset} is ${formatBytes(gzipBytes)}, above the single JavaScript asset budget of ${formatBytes(
          maxSingleJavaScriptGzipBytes,
        )}.`,
      );
    }
  }

  const siteImageDirectory = path.join(projectRoot, "public", "images", "site");
  const siteImages = getFilesRecursively(siteImageDirectory);
  const largestSiteImage = siteImages
    .map((filePath) => ({ filePath, bytes: statSync(filePath).size }))
    .sort((left, right) => right.bytes - left.bytes)[0];

  if (largestSiteImage) {
    console.log(
      `Largest site image source: ${path.relative(projectRoot, largestSiteImage.filePath)} (${formatBytes(
        largestSiteImage.bytes,
      )}) / ${formatBytes(maxSiteImageSourceBytes)}`,
    );
  }

  for (const image of siteImages) {
    const bytes = statSync(image).size;

    if (bytes > maxSiteImageSourceBytes) {
      errors.push(
        `${path.relative(projectRoot, image)} is ${formatBytes(bytes)}, above the site image source budget of ${formatBytes(
          maxSiteImageSourceBytes,
        )}.`,
      );
    }
  }

  if (errors.length > 0) {
    console.error(`\nPerformance budget errors (${errors.length})`);

    for (const error of errors) {
      console.error(`- ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("Performance budget passed with no blocking errors.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
