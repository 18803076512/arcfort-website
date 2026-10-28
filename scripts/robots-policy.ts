// Read-only REP checks for the site's Googlebot and Bingbot crawl policy.
// This does not simulate search-engine fetching, indexing or cached robots state.
type Rule = { allow: boolean; path: string };
type Group = { agents: string[]; rules: Rule[] };

function agentToken(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .match(/^(?:\*|[a-z0-9_-]+)/)?.[0] ?? ""
  );
}

function encodedPath(value: string) {
  // Compare UTF-8 octets, decoding only percent-encoded unreserved characters.
  return value
    .replace(/[^\x00-\x7f]/gu, (character) => encodeURIComponent(character))
    .replace(/%[0-9a-f]{2}/gi, (escape) => {
      const character = String.fromCharCode(parseInt(escape.slice(1), 16));
      return /[a-z0-9._~-]/i.test(character) ? character : escape.toUpperCase();
    });
}

export function parseRobotsPolicy(text: string) {
  const groups: Group[] = [];
  const sitemaps: string[] = [];
  let group: Group | undefined;
  let hasRules = false;
  for (const raw of text.replace(/^\uFEFF/, "").split(/\r\n|\r|\n/)) {
    const line = raw.split("#", 1)[0].trim();
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (name === "sitemap" && value) sitemaps.push(value);
    if (name === "user-agent") {
      const agent = agentToken(value);
      if (!agent) continue;
      if (!group || hasRules) {
        group = { agents: [], rules: [] };
        groups.push(group);
        hasRules = false;
      }
      group.agents.push(agent);
    } else if ((name === "allow" || name === "disallow") && group) {
      hasRules = true;
      if (value.startsWith("/")) group.rules.push({ allow: name === "allow", path: value });
    }
  }

  function allows(url: string, userAgent: string) {
    const token = agentToken(userAgent);
    const specific = groups.filter((entry) => entry.agents.includes(token));
    const applicable = specific.length
      ? specific
      : groups.filter((entry) => entry.agents.includes("*"));
    const location = new URL(url);
    const path = encodedPath(`${location.pathname}${location.search}`);
    let longest = -1;
    let allowed = true;
    for (const rule of applicable.flatMap((entry) => entry.rules)) {
      const normalized = encodedPath(rule.path);
      const anchored = normalized.endsWith("$");
      const pattern = anchored ? normalized.slice(0, -1) : normalized;
      const expression = pattern
        .split("*")
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*");
      if (!new RegExp(`^${expression}${anchored ? "$" : ""}`).test(path)) continue;
      const length = pattern.replace(/\*/g, "").replace(/%[0-9A-F]{2}/g, "x").length;
      if (length > longest || (length === longest && rule.allow)) {
        longest = length;
        allowed = rule.allow;
      }
    }
    return allowed;
  }

  return { sitemaps, allows };
}

export function auditRobotsPolicy(text: string, publicUrls: string[], siteUrl: string) {
  const policy = parseRobotsPolicy(text);
  const errors: string[] = [];
  const crawlers = ["Googlebot", "Bingbot"];
  const sitemapUrl = new URL("/sitemap.xml", siteUrl).href;
  if (!policy.sitemaps.includes(sitemapUrl))
    errors.push("robots.txt does not reference the canonical sitemap URL.");
  for (const crawler of crawlers) {
    for (const url of new Set([sitemapUrl, ...publicUrls])) {
      if (!policy.allows(url, crawler)) errors.push(`robots.txt blocks ${crawler}: ${url}.`);
    }
    for (const path of ["/api/rfq", "/api/rfq/status", "/console", "/console/products"]) {
      if (policy.allows(new URL(path, siteUrl).href, crawler)) {
        errors.push(`robots.txt must exclude the internal path for ${crawler}: ${path}.`);
      }
    }
  }
  return { errors, crawlers, publicUrlsChecked: new Set(publicUrls).size };
}
