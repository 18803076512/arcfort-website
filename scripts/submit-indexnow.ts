import { existsSync, readFileSync } from "node:fs";

const siteUrl = "https://www.arcfortweld.com";
const siteHost = new URL(siteUrl).host;
const defaultIndexNowKey = "e6b4f4d8a1c24d11a9c94af9170c2b58";
const defaultEndpoint = "https://api.indexnow.org/indexnow";
const defaultSitemapUrl = `${siteUrl}/sitemap.xml`;
const defaultKeyLocation = `${siteUrl}/${defaultIndexNowKey}.txt`;

type CliOptions = {
  dryRun: boolean;
  endpoint: string;
  key: string;
  keyLocation: string;
  limit?: number;
  sitemap: string;
};

function readArgValue(args: string[], name: string) {
  const index = args.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);
  const limitValue = readArgValue(args, "--limit");

  return {
    dryRun: args.includes("--dry-run"),
    endpoint: readArgValue(args, "--endpoint") || process.env.INDEXNOW_ENDPOINT || defaultEndpoint,
    key: readArgValue(args, "--key") || process.env.INDEXNOW_KEY || defaultIndexNowKey,
    keyLocation: readArgValue(args, "--key-location") || process.env.INDEXNOW_KEY_LOCATION || defaultKeyLocation,
    limit: limitValue ? Number(limitValue) : undefined,
    sitemap: readArgValue(args, "--sitemap") || defaultSitemapUrl,
  };
}

async function loadSitemap(source: string) {
  if (existsSync(source)) {
    return readFileSync(source, "utf8");
  }

  const response = await fetch(source);

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap ${source}: HTTP ${response.status}`);
  }

  return response.text();
}

function extractUrls(xml: string) {
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value))
    .filter((value, index, list) => list.indexOf(value) === index);

  return urls.filter((url) => {
    try {
      return new URL(url).host === siteHost;
    } catch {
      return false;
    }
  });
}

function chunkUrls(urls: string[], size: number) {
  const chunks: string[][] = [];

  for (let index = 0; index < urls.length; index += size) {
    chunks.push(urls.slice(index, index + size));
  }

  return chunks;
}

async function submitIndexNowBatch(options: CliOptions, urls: string[]) {
  const payload = {
    host: siteHost,
    key: options.key,
    keyLocation: options.keyLocation,
    urlList: urls,
  };

  const response = await fetch(options.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok && response.status !== 202) {
    const body = await response.text().catch(() => "");
    throw new Error(`IndexNow submit failed: HTTP ${response.status} ${body}`.trim());
  }

  return response.status;
}

async function main() {
  const options = parseCliOptions();
  const sitemapXml = await loadSitemap(options.sitemap);
  const allUrls = extractUrls(sitemapXml);
  const urls = options.limit ? allUrls.slice(0, options.limit) : allUrls;

  if (urls.length === 0) {
    throw new Error(`No ${siteHost} URLs found in sitemap: ${options.sitemap}`);
  }

  console.log(`IndexNow endpoint: ${options.endpoint}`);
  console.log(`Sitemap: ${options.sitemap}`);
  console.log(`Host: ${siteHost}`);
  console.log(`Key location: ${options.keyLocation}`);
  console.log(`URLs ready: ${urls.length}`);
  console.log(`First URL: ${urls[0]}`);

  if (options.dryRun) {
    console.log("Dry run only. No IndexNow request was sent.");
    return;
  }

  const batches = chunkUrls(urls, 10000);

  for (const [index, batch] of batches.entries()) {
    const status = await submitIndexNowBatch(options, batch);
    console.log(`Submitted batch ${index + 1}/${batches.length}: ${batch.length} URLs, HTTP ${status}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
