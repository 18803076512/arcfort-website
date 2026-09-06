import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getConsoleConfig, stagingProjectRef } from "../../lib/console/config.ts";
import {
  consolePrivateHeaders,
  isConsoleOrigin,
  readConsoleForm,
  safeConsoleReturnPath,
} from "../../lib/console/security.ts";
import { filters, literalPattern, uuid } from "../../lib/console/catalog.ts";
import { checkConsoleAccess } from "../../lib/console/access.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";

// Fail closed on custom mail transport before a disposable Supabase stack starts.
// This deliberately accepts only the repository's simple local collector section.
function assertLocalMailIsolation(source: string) {
  const config = source.replace(/^\s*#.*$/gm, "");
  assert.doesNotMatch(
    config,
    /\bsmtp\b|\bsmtp_[a-z_]+\b|SUPABASE_AUTH_SMTP_PASS|smtp\.resend\.com/i,
  );
  assert.match(config, /^\[local_smtp\]\s+enabled = true\s+port = 54324\s*(?=\[|$)/m);
}
const localSupabaseConfig = readFileSync("supabase/config.toml", "utf8");
assertLocalMailIsolation(localSupabaseConfig);
for (const unsafe of [
  '\n[auth.email.smtp]\nenabled = true\nhost = "smtp.resend.com"\n',
  '\n[auth.email."smtp"]\nenabled = true\n',
  "\n[auth.email]\nsmtp = { enabled = true }\n",
  '\n[auth.email]\nsmtp_host = "mail.example.invalid"\n',
])
  assert.throws(() => assertLocalMailIsolation(localSupabaseConfig + unsafe));
assert.throws(() => assertLocalMailIsolation("[local_smtp]\nenabled = false\nport = 54324\n"));
assert.throws(() => assertLocalMailIsolation("[auth]\nenabled = true\n"));

const config = {
  CONSOLE_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "staging",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: `https://${stagingProjectRef}.supabase.co`,
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_test_value",
};
assert.equal(getConsoleConfig({}).status, "disabled");
assert.equal(getConsoleConfig(config).status, "ready");
for (const override of [
  { VERCEL: "1" },
  { VERCEL_ENV: "production" },
  { CONSOLE_ENVIRONMENT: "production" },
  { CONSOLE_ORIGIN: "https://www.arcfortweld.com" },
  { CONSOLE_ORIGIN: "http://evil.example:3000" },
  { CONSOLE_SUPABASE_URL: "https://another-project.supabase.co" },
  { PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE: "true" },
  { PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY: "synthetic-disallowed-value" },
  { CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_disallowed" },
])
  assert.equal(getConsoleConfig({ ...config, ...override }).status, "invalid");
const jwt = (claims: object) =>
  `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.synthetic`;
assert.equal(
  getConsoleConfig({
    ...config,
    CONSOLE_SUPABASE_PUBLISHABLE_KEY: jwt({ role: "service_role", ref: stagingProjectRef }),
  }).status,
  "invalid",
);
assert.equal(
  getConsoleConfig({
    ...config,
    CONSOLE_SUPABASE_PUBLISHABLE_KEY: jwt({ role: "anon", ref: "another" }),
  }).status,
  "invalid",
);
assert.equal(
  getConsoleConfig({
    ...config,
    CONSOLE_SUPABASE_PUBLISHABLE_KEY: jwt({ role: "anon", ref: stagingProjectRef }),
  }).status,
  "ready",
);

const validHeaders = new Headers({
  host: "127.0.0.1:3000",
  origin: config.CONSOLE_ORIGIN,
  "sec-fetch-site": "same-origin",
});
assert.equal(isConsoleOrigin(validHeaders, config.CONSOLE_ORIGIN, true), true);
for (const overrides of [
  { origin: "https://evil.example" },
  { host: "evil.example" },
  { "sec-fetch-site": "cross-site" },
]) {
  const headers = new Headers(validHeaders);
  Object.entries(overrides).forEach(([name, value]) => headers.set(name, value));
  assert.equal(isConsoleOrigin(headers, config.CONSOLE_ORIGIN, true), false);
}
assert.equal(
  isConsoleOrigin(new Headers({ host: "127.0.0.1:3000" }), config.CONSOLE_ORIGIN, true),
  false,
);
for (const unsafe of [
  "//evil.example",
  "/console//evil",
  "/console/auth/callback",
  "/console/products?next=https://evil.example",
  "/console/%2e%2e/rfq",
])
  assert.equal(safeConsoleReturnPath(unsafe), "/console/dashboard");
assert.equal(safeConsoleReturnPath("/console/products"), "/console/products");
const form = (body: string, contentType = "application/x-www-form-urlencoded") =>
  new Request("http://127.0.0.1:3000/console/auth/session", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
assert.equal(
  (await readConsoleForm(form("action=login&email=fixture%40example.invalid")))?.get("action"),
  "login",
);
assert.equal(await readConsoleForm(form("action=login&action=logout")), null);
assert.equal(await readConsoleForm(form("x=" + "x".repeat(9000))), null);
assert.equal(await readConsoleForm(form("{}", "application/json")), null);
assert.deepEqual(filters({}).page, 1);
assert.equal(filters({ page: "41" }).page, 41);
for (const invalid of [
  { page: "0" },
  { page: "1e3" },
  { q: "x".repeat(81) },
  { category: "not-a-uuid" },
  { lifecycle: "confirmed" },
  { verification: "approved" },
  { q: ["a", "b"] },
  { blocker: "sql" },
])
  assert.throws(() => filters(invalid));
assert.equal(literalPattern("50%_"), "%50\\%\\_%");
assert.throws(() => uuid("../../rfq"));
assert.equal(consolePrivateHeaders["Cache-Control"].includes("no-store"), true);

// These are application-boundary unit tests, not proof of hosted authentication/RLS.
function fakeClient(role: string | null, authFailure = false, databaseFailure = false) {
  return {
    auth: {
      getUser: async () => ({
        error: authFailure ? { status: 401 } : null,
        data: {
          user: {
            id: "synthetic-user",
            email_confirmed_at: "2026-09-03",
            user_metadata: { role: "owner" },
          },
        },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          is: async () => ({ error: databaseFailure ? {} : null, data: role ? [{ role }] : [] }),
        }),
      }),
    }),
  } as unknown as ConsoleClient;
}
assert.equal((await checkConsoleAccess(fakeClient("owner"))).status, "authorized");
assert.equal((await checkConsoleAccess(fakeClient("viewer"))).status, "authorized");
assert.equal((await checkConsoleAccess(fakeClient(null))).status, "no_role");
assert.equal((await checkConsoleAccess(fakeClient("owner", true))).status, "unauthenticated");
assert.equal((await checkConsoleAccess(fakeClient("owner", false, true))).status, "unavailable");
const root = readFileSync("app/layout.tsx", "utf8");
const publicLayout = readFileSync("app/(public)/layout.tsx", "utf8");
for (const marker of [
  "AnalyticsTracker",
  "SourceAttributionTracker",
  "organizationJsonLd",
  "StickyContactBar",
]) {
  assert.equal(root.includes(marker), false);
  assert.equal(publicLayout.includes(marker), true);
}
assert.equal(root.includes("next/headers"), false);
const middlewareSource = readFileSync("middleware.ts", "utf8");
assert.ok(middlewareSource.includes('"/console/:path*"'));
assert.ok(
  middlewareSource.includes('type: "host", value: "console-staging\\\\.arcfortweld\\\\.com\\\\.?"'),
);
assert.equal(readFileSync("app/sitemap.ts", "utf8").includes("/console"), false);
assert.match(readFileSync("app/robots.ts", "utf8"), /"\/console"/);
assert.equal(readFileSync("lib/console/catalog.ts", "utf8").includes("raw_snapshot"), false);
assert.equal(readFileSync("lib/console/catalog.ts", "utf8").includes("notes_internal"), false);
console.log(
  "Console local mail isolation, config, origin, form, filters, authorization and layout boundaries passed (unit scope).",
);
