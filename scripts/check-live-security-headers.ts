#!/usr/bin/env node

export {};

const args = process.argv.slice(2);

function getOption(name: string) {
  const inlinePrefix = `--${name}=`;
  const inlineValue = args.find((argument) => argument.startsWith(inlinePrefix));

  if (inlineValue) {
    return inlineValue.slice(inlinePrefix.length).trim();
  }

  const optionIndex = args.indexOf(`--${name}`);
  return optionIndex >= 0 ? (args[optionIndex + 1] ?? "").trim() : "";
}

function normalizeBaseUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("The security audit base URL must use HTTP or HTTPS.");
  }

  return url.origin;
}

function parseContentSecurityPolicy(value: string) {
  const directives = new Map<string, string[]>();

  for (const rawDirective of value.split(";")) {
    const tokens = rawDirective.trim().split(/\s+/).filter(Boolean);
    const [name, ...sources] = tokens;

    if (name) {
      directives.set(name, sources);
    }
  }

  return directives;
}

function requireHeader(response: Response, name: string, expected: string, errors: string[]) {
  const actual = response.headers.get(name);

  if (actual !== expected) {
    errors.push(
      `${response.url}: ${name} expected "${expected}", received "${actual ?? "absent"}".`,
    );
  }
}

function requireHeaderIncludes(
  response: Response,
  name: string,
  expected: string,
  errors: string[],
) {
  const actual = response.headers.get(name);

  if (!actual?.includes(expected)) {
    errors.push(`${response.url}: ${name} must include "${expected}".`);
  }
}

const requiredCspSources = new Map<string, string[]>([
  ["default-src", ["'self'"]],
  ["script-src", ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"]],
  ["script-src-attr", ["'none'"]],
  ["style-src", ["'self'", "'unsafe-inline'"]],
  [
    "img-src",
    [
      "'self'",
      "blob:",
      "data:",
      "https://www.googletagmanager.com",
      "https://*.google-analytics.com",
    ],
  ],
  ["font-src", ["'self'", "data:"]],
  [
    "connect-src",
    [
      "'self'",
      "https://www.googletagmanager.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
    ],
  ],
  ["media-src", ["'self'"]],
  ["object-src", ["'none'"]],
  ["base-uri", ["'self'"]],
  ["form-action", ["'self'"]],
  ["frame-ancestors", ["'none'"]],
  ["frame-src", ["'none'"]],
  ["manifest-src", ["'self'"]],
  ["worker-src", ["'self'", "blob:"]],
]);

function validateContentSecurityPolicy(response: Response, errors: string[]) {
  const policy = response.headers.get("content-security-policy");

  if (!policy) {
    errors.push(`${response.url}: Content-Security-Policy is absent.`);
    return;
  }

  const directives = parseContentSecurityPolicy(policy);

  for (const [directive, requiredSources] of requiredCspSources) {
    const actualSources = directives.get(directive);

    if (!actualSources) {
      errors.push(`${response.url}: CSP directive ${directive} is absent.`);
      continue;
    }

    for (const source of requiredSources) {
      if (!actualSources.includes(source)) {
        errors.push(`${response.url}: CSP directive ${directive} must include ${source}.`);
      }
    }
  }

  if (!directives.has("upgrade-insecure-requests")) {
    errors.push(`${response.url}: CSP directive upgrade-insecure-requests is absent.`);
  }

  if (directives.get("script-src")?.includes("'unsafe-eval'")) {
    errors.push(`${response.url}: production CSP must not include 'unsafe-eval'.`);
  }
}

async function fetchForAudit(url: string) {
  return fetch(`${url}${url.includes("?") ? "&" : "?"}security_check=${Date.now()}`, {
    headers: {
      Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      "User-Agent": "ArcFort-Production-Security-Audit/1.0",
    },
    cache: "no-store",
    redirect: "follow",
  });
}

async function main() {
  const baseUrl = normalizeBaseUrl(getOption("base-url") || "https://www.arcfortweld.com");
  const errors: string[] = [];
  const pagePaths = ["/", "/rfq"];

  console.log("ArcFort Weld live security header audit");
  console.log(`Base URL: ${baseUrl}`);

  for (const path of pagePaths) {
    const response = await fetchForAudit(`${baseUrl}${path}`);

    console.log(`${path}: HTTP ${response.status}`);

    if (!response.ok) {
      errors.push(
        `${response.url}: expected a successful response, received HTTP ${response.status}.`,
      );
      continue;
    }

    requireHeader(response, "x-content-type-options", "nosniff", errors);
    requireHeader(response, "x-frame-options", "DENY", errors);
    requireHeader(response, "referrer-policy", "strict-origin-when-cross-origin", errors);
    requireHeader(response, "cross-origin-opener-policy", "same-origin", errors);
    requireHeader(response, "x-dns-prefetch-control", "on", errors);
    requireHeader(response, "x-permitted-cross-domain-policies", "none", errors);
    requireHeader(response, "x-xss-protection", "0", errors);
    requireHeaderIncludes(response, "permissions-policy", "camera=()", errors);
    requireHeaderIncludes(response, "permissions-policy", "microphone=()", errors);
    requireHeaderIncludes(response, "permissions-policy", "geolocation=()", errors);
    validateContentSecurityPolicy(response, errors);

    if (response.headers.has("x-powered-by")) {
      errors.push(`${response.url}: X-Powered-By should be disabled.`);
    }

    if (baseUrl.startsWith("https://")) {
      requireHeaderIncludes(response, "strict-transport-security", "max-age=", errors);
    }
  }

  const statusResponse = await fetchForAudit(`${baseUrl}/api/rfq/status`);
  console.log(`/api/rfq/status: HTTP ${statusResponse.status}`);

  if (!statusResponse.ok) {
    errors.push(
      `${statusResponse.url}: expected a successful RFQ status response, received HTTP ${statusResponse.status}.`,
    );
  }

  requireHeaderIncludes(statusResponse, "cache-control", "no-store", errors);

  if (errors.length > 0) {
    console.error(`\nSecurity header errors (${errors.length})`);

    for (const error of errors) {
      console.error(`- ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("Security header audit passed with no blocking errors.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
