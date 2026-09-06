import assert from "node:assert/strict";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import {
  consoleCookieOptions,
  getConsoleConfig,
  stagingConsoleOrigin,
  stagingProjectRef,
} from "../../lib/console/config.ts";
import {
  isConsoleEntrance,
  isStagingConsoleHost,
  stagingPathKind,
} from "../../lib/console/entrance.ts";

const env = {
  CONSOLE_ENABLED: "true",
  CONSOLE_DEPLOYMENT: "access-tunnel",
  CONSOLE_ENVIRONMENT: "staging",
  CONSOLE_ORIGIN: stagingConsoleOrigin,
  CONSOLE_SUPABASE_URL: `https://${stagingProjectRef}.supabase.co`,
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_test_value",
  CONSOLE_ACCESS_ISSUER: "https://offline-test.cloudflareaccess.com",
  CONSOLE_ACCESS_AUDIENCE: "a".repeat(64),
  CONSOLE_ACCESS_EMAIL: "arcfortweld1@outlook.com",
};
const result = getConsoleConfig(env);
assert.equal(result.status, "ready");
if (result.status !== "ready") throw new Error("Invalid fixture");
const config = result.config;
for (const override of [
  { CONSOLE_DEPLOYMENT: "loopback" },
  { CONSOLE_DEPLOYMENT: "" },
  { CONSOLE_ENVIRONMENT: "local" },
  { CONSOLE_ORIGIN: "https://www.arcfortweld.com" },
  { CONSOLE_ORIGIN: "https://arcfortweld.com" },
  { CONSOLE_ORIGIN: "http://console-staging.arcfortweld.com" },
  { CONSOLE_ORIGIN: stagingConsoleOrigin + "/" },
  { CONSOLE_ORIGIN: stagingConsoleOrigin + ":443" },
  { CONSOLE_ACCESS_AUDIENCE: "" },
  { CONSOLE_ACCESS_AUDIENCE: "not-an-audience" },
  { CONSOLE_ACCESS_ISSUER: "http://offline-test.cloudflareaccess.com" },
  { CONSOLE_ACCESS_ISSUER: "https://offline-test.cloudflareaccess.com.attacker.invalid" },
  { CONSOLE_ACCESS_ISSUER: "https://user@offline-test.cloudflareaccess.com" },
  { CONSOLE_ACCESS_ISSUER: "https://offline-test.cloudflareaccess.com/path" },
  { CONSOLE_ACCESS_EMAIL: "unknown@example.invalid" },
  { CONSOLE_ACCESS_EMAIL: "" },
  { VERCEL: "1" },
  { VERCEL_ENV: "preview" },
  { VERCEL_ENV: "production" },
  { PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE: "true" },
  { PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY: "synthetic" },
  { SUPABASE_SERVICE_ROLE_KEY: "synthetic-placeholder" },
  { RESEND_API_KEY: "synthetic-placeholder" },
  { SUPABASE_AUTH_SMTP_PASS: "synthetic" },
  { SUPABASE_ACCESS_TOKEN: "synthetic" },
  { CONSOLE_SUPABASE_URL: "https://bdaucwemujiunpyptkpq.supabase.co" },
])
  assert.equal(
    getConsoleConfig({ ...env, ...override }).status,
    "invalid",
    JSON.stringify(Object.keys(override)),
  );
assert.deepEqual(consoleCookieOptions(config), {
  secure: true,
  httpOnly: true,
  sameSite: "lax",
  path: "/console",
});
const local = getConsoleConfig({
  CONSOLE_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_offline",
});
assert.equal(local.status, "ready");
if (local.status !== "ready") throw new Error("Invalid local fixture");
assert.equal(consoleCookieOptions(local.config).secure, false);
assert.equal(await isConsoleEntrance(new Headers({ host: "127.0.0.1:3000" }), local.config), true);
for (const host of [
  "console-staging.arcfortweld.com",
  "console-staging.arcfortweld.com:443",
  "CONSOLE-STAGING.ARCFORTWELD.COM",
  "console-staging.arcfortweld.com.",
  "console-staging.arcfortweld.com.:443",
  "console-staging.arcfortweld.com:invalid",
])
  assert.equal(isStagingConsoleHost(host), true);
for (const host of [
  null,
  "",
  "www.arcfortweld.com",
  "console-staging.arcfortweld.com.evil.invalid",
  "console-stagingXarcfortweldXcom",
])
  assert.equal(isStagingConsoleHost(host), false);

// Ephemeral fixture keys never reach hosted Auth, Cloudflare or a real mailbox.
const { privateKey, publicKey } = await generateKeyPair("RS256");
const jwk = await exportJWK(publicKey);
const resolveKey = createLocalJWKSet({ keys: [{ ...jwk, kid: "offline-fixture", alg: "RS256" }] });
const now = Math.floor(Date.now() / 1000);
async function token(overrides: Record<string, unknown> = {}, key = privateKey) {
  return new SignJWT({
    iss: env.CONSOLE_ACCESS_ISSUER,
    aud: env.CONSOLE_ACCESS_AUDIENCE,
    sub: "offline-user",
    email: env.CONSOLE_ACCESS_EMAIL,
    type: "app",
    iat: now,
    exp: now + 300,
    ...overrides,
  })
    .setProtectedHeader({ alg: "RS256", kid: "offline-fixture" })
    .sign(key);
}
const validToken = await token();
function headers(assertion = validToken, overrides: Record<string, string> = {}) {
  return new Headers({
    host: new URL(stagingConsoleOrigin).host,
    origin: stagingConsoleOrigin,
    "x-forwarded-proto": "https",
    "sec-fetch-site": "same-origin",
    "cf-access-jwt-assertion": assertion,
    ...overrides,
  });
}
assert.equal(await isConsoleEntrance(headers(), config, false, resolveKey), true);
assert.equal(await isConsoleEntrance(headers(), config, true, resolveKey), true);
for (const claims of [
  { iss: "https://different.cloudflareaccess.com" },
  { aud: "b".repeat(64) },
  { exp: now - 1 },
  { exp: undefined },
  { iat: now - 4000 },
  { iat: now + 60 },
  { iat: undefined },
  { sub: "" },
  { sub: undefined },
  { type: "service" },
  { type: "org" },
  { nbf: now + 60 },
  { email: "other@example.invalid" },
  { email: undefined },
])
  assert.equal(
    await isConsoleEntrance(headers(await token(claims)), config, false, resolveKey),
    false,
  );
const otherKeys = await generateKeyPair("RS256");
for (const assertion of [
  "",
  "not.a.token",
  "a".repeat(8193),
  await token({}, otherKeys.privateKey),
])
  assert.equal(await isConsoleEntrance(headers(assertion), config, false, resolveKey), false);
assert.equal(
  await isConsoleEntrance(
    headers("", { "cf-access-authenticated-user-email": env.CONSOLE_ACCESS_EMAIL }),
    config,
    false,
    resolveKey,
  ),
  false,
);
const transportOverrides: Record<string, string>[] = [
  { host: "www.arcfortweld.com" },
  { "x-forwarded-proto": "http" },
  { "x-forwarded-proto": "https,http" },
  { "x-forwarded-proto": "" },
];
for (const override of transportOverrides)
  assert.equal(
    await isConsoleEntrance(headers(validToken, override), config, false, resolveKey),
    false,
  );
const mutationOverrides: Record<string, string>[] = [
  { origin: "https://evil.invalid" },
  { origin: "" },
  { "sec-fetch-site": "cross-site" },
];
for (const override of mutationOverrides)
  assert.equal(
    await isConsoleEntrance(headers(validToken, override), config, true, resolveKey),
    false,
  );
assert.equal(
  await isConsoleEntrance(headers(), config, false, async () => {
    throw new Error("offline");
  }),
  false,
);

for (const path of [
  "/rfq",
  "/api/rfq",
  "/api/rfq/status",
  "/contact",
  "/products",
  "/sitemap.xml",
  "/downloads/catalog.pdf",
  "/_next/image",
  "/consolex",
  "/console/%2e%2e/api/rfq",
  "/console\\auth",
  "/console//auth",
])
  for (const method of ["GET", "POST"])
    assert.equal(stagingPathKind(path, method), "blocked", path);
for (const method of ["GET", "HEAD"]) {
  assert.equal(stagingPathKind("/robots.txt", method), "robots");
  assert.equal(stagingPathKind("/", method), "root");
  assert.equal(stagingPathKind("/console/login", method), "console");
  assert.equal(stagingPathKind("/_next/static/chunks/test.js", method), "asset");
}
assert.equal(stagingPathKind("/console/auth/session", "POST"), "console");
for (const path of ["/", "/robots.txt", "/console/products", "/_next/static/test.js"])
  assert.equal(stagingPathKind(path, "POST"), "blocked");
assert.equal(stagingPathKind("/console/auth/session", "DELETE"), "blocked");
console.log(
  "Staging entrance: strict configuration, signed JWT/identity/expiry, CSRF, secure cookies and route isolation passed offline. No live access or owner login is implied.",
);
