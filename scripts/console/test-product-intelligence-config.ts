import assert from "node:assert/strict";

import { getProductIntelligenceAdminConfig } from "../../lib/supabase/product-intelligence-config.ts";

const variableNames = [
  "PRODUCT_INTELLIGENCE_SUPABASE_URL",
  "PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY",
  "PRODUCT_INTELLIGENCE_ENVIRONMENT",
  "PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE",
  "PRODUCT_INTELLIGENCE_STAGING_PROJECT_REF",
] as const;

function configure(values: Partial<Record<(typeof variableNames)[number], string>>) {
  for (const name of variableNames) delete process.env[name];
  for (const [name, value] of Object.entries(values)) process.env[name] = value;
}

const base = {
  PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE: "true",
} as const;

configure({
  ...base,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "production",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "https://production-ref.supabase.co",
});
assert.throws(getProductIntelligenceAdminConfig, /must be local or staging/);

configure({
  ...base,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "staging",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "https://staging-ref.supabase.co",
});
assert.throws(getProductIntelligenceAdminConfig, /STAGING_PROJECT_REF is required/);

configure({
  ...base,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "staging",
  PRODUCT_INTELLIGENCE_STAGING_PROJECT_REF: "authorized-staging-ref",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "https://different-project.supabase.co",
});
assert.throws(getProductIntelligenceAdminConfig, /does not match/);

configure({
  ...base,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "staging",
  PRODUCT_INTELLIGENCE_STAGING_PROJECT_REF: "authorized-staging-ref",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "http://authorized-staging-ref.supabase.co",
});
assert.throws(getProductIntelligenceAdminConfig, /does not match/);

configure({
  ...base,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "staging",
  PRODUCT_INTELLIGENCE_STAGING_PROJECT_REF: "authorized-staging-ref",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "https://authorized-staging-ref.supabase.co/",
});
assert.deepEqual(getProductIntelligenceAdminConfig(), {
  environment: "staging",
  serviceRoleKey: "test-service-role-key",
  url: "https://authorized-staging-ref.supabase.co",
});

configure({
  ...base,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "local",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "https://production-ref.supabase.co",
});
assert.throws(getProductIntelligenceAdminConfig, /must use an HTTP loopback URL/);

configure({
  ...base,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "local",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "http://192.0.2.10:54321",
});
assert.throws(getProductIntelligenceAdminConfig, /must use an HTTP loopback URL/);

configure({
  ...base,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "local",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "http://127.0.0.1:54321/",
});
assert.deepEqual(getProductIntelligenceAdminConfig(), {
  environment: "local",
  serviceRoleKey: "test-service-role-key",
  url: "http://127.0.0.1:54321",
});

configure({
  ...base,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "local",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "http://localhost:54321/",
});
assert.deepEqual(getProductIntelligenceAdminConfig(), {
  environment: "local",
  serviceRoleKey: "test-service-role-key",
  url: "http://localhost:54321",
});

for (const name of variableNames) delete process.env[name];
console.log("Product Intelligence destination guard tests passed.");
