import { readFile } from "node:fs/promises";
import path from "node:path";

import { PRODUCT_INTELLIGENCE_TABLES } from "../../lib/supabase/product-intelligence.types.ts";
import { repositoryRoot } from "./build-shadow-catalog.ts";

const migrationDirectory = path.join(repositoryRoot, "supabase", "migrations");
const legacyCatalogDraft = await readFile(
  path.join(repositoryRoot, "supabase", "product-catalog-schema.sql"),
  "utf8",
);
const migrationNames = [
  "202608300001_product_intelligence_foundation.sql",
  "202608300002_product_intelligence_security.sql",
  "202608300003_product_intelligence_readiness.sql",
  "202608300004_product_intelligence_private_storage.sql",
  "202608310005_product_intelligence_workflow_guards.sql",
] as const;
const migrations = await Promise.all(
  migrationNames.map(async (name) => ({
    name,
    content: await readFile(path.join(migrationDirectory, name), "utf8"),
  })),
);
const allSql = migrations.map((migration) => migration.content).join("\n");
const foundation = migrations[0].content;
const security = migrations[1].content;
const readiness = migrations[2].content;
const storage = migrations[3].content;
const workflowGuards = migrations[4].content;
const errors: string[] = [];

const requiredTables = [
  ...PRODUCT_INTELLIGENCE_TABLES,
  "console_user_roles",
  "oem_references",
  "technical_documents",
  "entity_documents",
  "verification_events",
  "release_candidates",
  "release_items",
  "release_qa_results",
  "publish_records",
  "audit_events",
] as const;

for (const table of requiredTables) {
  if (!foundation.includes(`create table public.${table}`)) {
    errors.push(`Foundation migration is missing table ${table}.`);
  }
  if (!security.includes(`'${table}'`)) {
    errors.push(`Security migration does not enumerate ${table} for RLS review.`);
  }
}

const requiredVerificationStates = [
  "CONFIRMED",
  "OEM_REFERENCE",
  "STANDARD_REFERENCE",
  "NEEDS_FACTORY_CONFIRMATION",
  "DATA_CONFLICT",
] as const;
for (const state of requiredVerificationStates) {
  if (!foundation.includes(`'${state}'`)) errors.push(`Missing verification state ${state}.`);
}

const requiredLifecycleStates = [
  "DRAFT",
  "INGESTED",
  "DATA_INCOMPLETE",
  "NEEDS_VERIFICATION",
  "VERIFIED",
  "READY_FOR_PUBLISH",
  "QA_PASSED",
  "PUBLISHED",
  "NEEDS_UPDATE",
] as const;
for (const state of requiredLifecycleStates) {
  if (!foundation.includes(`'${state}'`)) errors.push(`Missing lifecycle state ${state}.`);
}

if (!security.includes("alter table public.%I enable row level security")) {
  errors.push("Security migration does not enable RLS for its enumerated tables.");
}
if (!security.includes("alter table public.%I force row level security")) {
  errors.push("Security migration does not force RLS for its enumerated tables.");
}
if (/create\s+policy[\s\S]*?\bto\s+anon\b/i.test(security)) {
  errors.push("A Product Intelligence policy grants access to anon.");
}
if (/grant\s+(?![^;]*\brevoke\b)[^;]*\bto\s+anon\b/i.test(security)) {
  errors.push("A Product Intelligence grant gives privileges to anon.");
}
if (!security.includes("pi_prevent_immutable_change")) {
  errors.push("Append-only audit/review protection is missing.");
}
if (
  !/grant\s+execute\s+on\s+function\s+public\.pi_is_valid_lifecycle_transition\([\s\S]*?\)\s+to\s+authenticated\s*,\s*service_role\s*;/i.test(
    security,
  )
) {
  errors.push("Service-role lifecycle validation permission is missing for idempotent imports.");
}
if (!foundation.includes("pi_enforce_lifecycle_transition")) {
  errors.push("Database lifecycle transition enforcement is missing.");
}
if (!foundation.includes("product_variants_shadow_lifecycle_check")) {
  errors.push("Shadow variants are not prevented from reaching publishable states.");
}
if (!readiness.includes("pi_reconcile_shadow_batch")) {
  errors.push("Deterministic shadow reconciliation function is missing.");
}
if (!readiness.includes("with (security_invoker = true)")) {
  errors.push("Readiness views are not declared as security-invoker views.");
}
if (!readiness.includes("coalesce(technical.confirmed_technical_count, 0) = 0")) {
  errors.push("Readiness does not block products without confirmed technical data.");
}
if (!readiness.includes("coalesce(seo.approved_seo_count, 0) = 0")) {
  errors.push("Readiness does not require approved SEO data.");
}
if (!storage.includes("'pi-product-originals'")) {
  errors.push("Private product-originals bucket is missing.");
}
if (!storage.includes("'pi-technical-evidence'")) {
  errors.push("Private technical-evidence bucket is missing.");
}
if (/\btrue\s*,\s*26214400/.test(storage)) {
  errors.push("A Product Intelligence storage bucket appears public.");
}
if (!workflowGuards.includes("create schema if not exists private")) {
  errors.push("Non-exposed workflow guard schema is missing.");
}
if (
  !security.includes("create or replace function private.pi_request_jwt_role()") ||
  !security.includes("request.jwt.claims") ||
  !readiness.includes("private.pi_request_jwt_role()") ||
  !workflowGuards.includes("private.pi_request_jwt_role()")
) {
  errors.push("Service-role checks do not support the current JSON JWT claims setting.");
}
if (!workflowGuards.includes("technical_values_confirmation_guard")) {
  errors.push("Human technical-confirmation guard is missing.");
}
if (!workflowGuards.includes("release_candidates_workflow_guard")) {
  errors.push("Release lifecycle guard is missing.");
}
if (!workflowGuards.includes("publish_records_release_guard")) {
  errors.push("Publish-record QA and live-verification guard is missing.");
}
if (!workflowGuards.includes("product_variants_readiness_guard")) {
  errors.push("Product readiness and publication guard is missing.");
}
if (
  !workflowGuards.includes("VERIFIED requires at least one applicable critical field definition")
) {
  errors.push("Product verification can pass without an applicable critical field definition.");
}
if (!workflowGuards.includes("seo_records_governed_update")) {
  errors.push("SEO publisher updates are not aligned with the approval trigger.");
}
if (!workflowGuards.includes("current_qa_run_id") || !workflowGuards.includes("qa_run_id")) {
  errors.push("Release QA runs are not versioned independently.");
}
if (!workflowGuards.includes("revoke all on all functions in schema private")) {
  errors.push("Private workflow helpers do not explicitly revoke direct execution.");
}
if (
  !legacyCatalogDraft.includes("DEPRECATED PRODUCT CATALOG DRAFT - DO NOT APPLY") ||
  !legacyCatalogDraft.includes("Deprecated schema blocked") ||
  !legacyCatalogDraft.includes("/* Historical non-executable draft follows.")
) {
  errors.push("The incompatible legacy product-catalog draft is not fail-closed.");
}
if (
  allSql.includes("SUPABASE_SERVICE_ROLE_KEY") ||
  allSql.includes("PRODUCT_INTELLIGENCE_SUPABASE")
) {
  errors.push("A migration contains an environment-variable name or credential contract.");
}

if (errors.length > 0) {
  console.error("Product Intelligence migration validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Product Intelligence migration validation passed (${migrationNames.length} migrations, ${requiredTables.length} governed tables).`,
  );
}
