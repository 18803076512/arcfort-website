import { siteConfig } from "../lib/content/site.ts";
import { readJourneyRobots } from "./buyer-journey-audit.ts";
import { fetchReadOnlyWithRetry } from "./live-audit-fetch.ts";
import { parseRobotsPolicy } from "./robots-policy.ts";

export const indexNowEndpoint = "https://api.indexnow.org/indexnow";
const defaultKey = "e6b4f4d8a1c24d11a9c94af9170c2b58";
export type IndexNowOptions = {
  submit: boolean;
  sitemap: string;
  urlsFile?: string;
  limit?: number;
  key: string;
  keyLocation: string;
};

export function canonicalSubmissionUrl(value: string) {
  const url = new URL(value);
  if (
    url.origin !== siteConfig.url ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.href !== value
  ) {
    throw new Error(`Expected an exact canonical HTTPS URL without parameters: ${value}`);
  }
  return url.href;
}

export function parseIndexNowOptions(
  args: string[],
  env: Record<string, string | undefined> = {},
): IndexNowOptions {
  const values = new Map<string, string>();
  const switches = new Set<string>();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (values.has(flag) || switches.has(flag)) throw new Error(`Repeated option: ${flag}`);
    if (["--submit", "--dry-run"].includes(flag)) switches.add(flag);
    else if (["--sitemap", "--urls-file", "--limit", "--key", "--key-location"].includes(flag)) {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${flag}`);
      values.set(flag, value);
    } else throw new Error(`Unknown option: ${flag}`);
  }
  const submit = switches.has("--submit");
  if (submit && switches.has("--dry-run"))
    throw new Error("Choose --submit or --dry-run, not both.");
  const limit = values.has("--limit") ? Number(values.get("--limit")) : undefined;
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1))
    throw new Error("--limit must be a positive integer.");
  const urlsFile = values.get("--urls-file");
  if (submit && !urlsFile) throw new Error("--submit requires an explicitly reviewed --urls-file.");
  if (submit && limit !== undefined)
    throw new Error("--limit is preview-only; review an exact URL file for submission.");
  const sitemap = values.get("--sitemap") ?? `${siteConfig.url}/sitemap.xml`;
  if (submit && sitemap !== `${siteConfig.url}/sitemap.xml`)
    throw new Error("Submission requires the live canonical sitemap.");
  if (env.INDEXNOW_ENDPOINT && env.INDEXNOW_ENDPOINT !== indexNowEndpoint)
    throw new Error("Only the configured IndexNow endpoint is supported.");
  const key = values.get("--key") ?? env.INDEXNOW_KEY ?? defaultKey;
  if (!/^[a-z0-9-]{8,128}$/i.test(key)) throw new Error("Invalid IndexNow key format.");
  const keyLocation = canonicalSubmissionUrl(
    values.get("--key-location") ?? env.INDEXNOW_KEY_LOCATION ?? `${siteConfig.url}/${key}.txt`,
  );
  return { submit, sitemap, urlsFile, limit, key, keyLocation };
}

function decodeXml(value: string) {
  return value.replace(/&(amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/gi, (_, entity: string) => {
    const named: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
    if (!entity.startsWith("#")) return named[entity.toLowerCase()];
    return String.fromCodePoint(
      entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)),
    );
  });
}

export function readSubmissionSitemap(xml: string) {
  const source = xml.replace(/<!--[\s\S]*?-->/g, "");
  if (!/<urlset(?:\s|>)/i.test(source) || !/<\/urlset>/i.test(source) || /<!DOCTYPE/i.test(source))
    throw new Error("Expected a URL sitemap, not an index or HTML response.");
  const urls = [...source.matchAll(/<url(?:\s[^>]*)?>([\s\S]*?)<\/url>/gi)].map((match) => {
    const locations = [...match[1].matchAll(/<loc>([\s\S]*?)<\/loc>/gi)];
    if (locations.length !== 1) throw new Error("Each sitemap URL must have exactly one loc.");
    return canonicalSubmissionUrl(decodeXml(locations[0][1].trim()));
  });
  if (!urls.length || new Set(urls).size !== urls.length)
    throw new Error("Sitemap URLs must be nonempty and unique.");
  return urls;
}

export function selectSubmissionUrls(
  sitemapUrls: string[],
  options: IndexNowOptions,
  file?: string,
) {
  const urls = options.urlsFile
    ? (file ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
    : sitemapUrls;
  if (!urls.length || new Set(urls).size !== urls.length)
    throw new Error("Selected URLs must be nonempty and unique.");
  for (const value of urls) {
    canonicalSubmissionUrl(value);
    if (!sitemapUrls.includes(value))
      throw new Error(`Selected URL is not in the current sitemap: ${value}`);
    const directory = new URL(".", options.keyLocation).pathname;
    if (!new URL(value).pathname.startsWith(directory))
      throw new Error(`Key location does not cover URL: ${value}`);
  }
  if (options.submit && urls.length > 100)
    throw new Error("Review submission batches of at most 100 URLs.");
  return options.limit ? urls.slice(0, options.limit) : urls;
}

export async function readIndexNowResource(url: string, fetchImpl: typeof fetch = fetch) {
  const result = await fetchReadOnlyWithRetry(
    url,
    { redirect: "manual" },
    { fetchImpl, read: (response) => response.text() },
  );
  if (result.response.status !== 200)
    throw new Error(`Preflight requires direct HTTP 200: ${url} (${result.response.status}).`);
  return result;
}

function attribute(tag: string, name: string) {
  const value = tag.match(
    new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return value ? decodeXml(value[1] ?? value[2] ?? value[3]) : undefined;
}

export function checkSubmissionTarget(url: string, response: Response, body: string) {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const policies = [response.headers.get("x-robots-tag") ?? ""];
  if (contentType.includes("text/html")) {
    const head = body
      .replace(/<!--[\s\S]*?-->|<(script|template)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      .split(/<body\b/i)[0];
    for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
      if (["robots", "googlebot", "bingbot"].includes(attribute(tag, "name")?.toLowerCase() ?? ""))
        policies.push(attribute(tag, "content") ?? "");
    }
    const canonicals = (head.match(/<link\b[^>]*>/gi) ?? [])
      .filter((tag) => attribute(tag, "rel")?.toLowerCase().split(/\s+/).includes("canonical"))
      .map((tag) => attribute(tag, "href"));
    if (canonicals.length !== 1 || canonicals[0] !== url)
      throw new Error(`Submission target is not uniquely self-canonical: ${url}`);
  } else if (
    !contentType.includes("application/pdf") &&
    !contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  ) {
    throw new Error(`Unexpected submission content type: ${url} (${contentType}).`);
  }
  if (readJourneyRobots(policies.join(",")).noIndex)
    throw new Error(`Submission target is noindex: ${url}`);
}

export async function runIndexNowPreflight(
  options: IndexNowOptions,
  urls: string[],
  fetchImpl: typeof fetch = fetch,
) {
  const keyFile = await readIndexNowResource(options.keyLocation, fetchImpl);
  if (keyFile.data.trim() !== options.key)
    throw new Error("Live IndexNow key file does not match the configured key.");
  const robots = parseRobotsPolicy(
    (await readIndexNowResource(`${siteConfig.url}/robots.txt`, fetchImpl)).data,
  );
  for (const url of urls) {
    if (!robots.allows(url, "Bingbot"))
      throw new Error(`robots.txt blocks Bingbot submission target: ${url}`);
  }
  if (options.submit) {
    // Finish every read before the first write. Failed preflight sends no notification.
    for (const url of urls) {
      const target = await readIndexNowResource(url, fetchImpl);
      checkSubmissionTarget(url, target.response, target.data);
    }
  }
}

export async function sendIndexNowNotification(
  options: IndexNowOptions,
  urls: string[],
  fetchImpl: typeof fetch = fetch,
) {
  if (!options.submit) throw new Error("Notification requires explicit --submit.");
  await runIndexNowPreflight(options, urls, fetchImpl);
  const response = await fetchImpl(indexNowEndpoint, {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(siteConfig.url).host,
      key: options.key,
      keyLocation: options.keyLocation,
      urlList: urls,
    }),
  });
  await response.body?.cancel();
  if (response.status !== 200 && response.status !== 202)
    throw new Error(
      `IndexNow returned HTTP ${response.status}; no automatic POST retry was attempted.`,
    );
  return response.status === 202
    ? "HTTP 202: received; key validation pending. This is not proof of indexing."
    : "HTTP 200: notification received. This is not proof of indexing.";
}
