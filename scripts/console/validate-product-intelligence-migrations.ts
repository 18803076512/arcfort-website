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
  "202609090006_product_intelligence_working_authority.sql",
  "202609090007_product_intelligence_draft_commands.sql",
  "202609090008_product_intelligence_technical_review.sql",
  "202609090009_product_intelligence_console_commands.sql",
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
const workingAuthority = migrations[5].content;
const draftCommands = migrations[6].content;
const technicalReview = migrations[7].content;
const consoleCommands = migrations[8].content;
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
for (const required of [
  "private.pi_working_adoptions",
  "private.pi_working_authority_control",
  "private.pi_adopt_15ak_working_scope",
  "private.pi_guard_working_catalog_write",
  "for update",
  "for share",
  "All seventeen source tables must be compared",
  "Exact source parity failed",
  "before insert or update or delete or truncate",
  "revoke all on all functions in schema private from public, anon, authenticated, service_role",
]) {
  if (!workingAuthority.includes(required))
    errors.push(`Working authority contract missing: ${required}.`);
}
for (const required of [
  "private.pi_create_product_draft",
  "private.pi_save_product_draft",
  "private.pi_command_receipts",
  "private.pi_product_draft_revisions",
  "private.pi_mutation_context",
  "context.transaction_id = txid_current()",
  "context.actor_id = auth.uid()",
  "current_revision <> expected_revision",
  "payload_digest",
  "for share",
  "revoke all on all functions in schema private from public, anon, authenticated, service_role",
]) {
  if (!draftCommands.includes(required))
    errors.push(`Draft command contract missing: ${required}.`);
}
for (const required of [
  "public.technical_revision_heads",
  "public.technical_revisions",
  "public.technical_source_bindings",
  "private.pi_add_technical_source",
  "private.pi_propose_technical_revision",
  "private.pi_submit_technical_review",
  "private.pi_review_technical_revision",
  "private.pi_guard_exact_technical_approval",
  "candidate.submitted_digest = private.pi_technical_digest(old.id)",
  "event.decision = 'APPROVE'",
  "binding.scope_label = coalesce(value.variant_label,'')",
  "binding.asserted_value = value.value_text",
  "public.pi_effective_technical_values with (security_invoker = true)",
  "Every known critical-field scope must be confirmed",
  "revoke all on all functions in schema private from public, anon, authenticated, service_role",
]) {
  if (!technicalReview.includes(required))
    errors.push(`Technical review contract missing: ${required}.`);
}
for (const required of [
  "public.pi_create_product_draft",
  "public.pi_save_product_draft",
  "public.pi_review_technical_revision",
  "public.pi_working_status",
  "public.pi_read_product_draft_history",
  "private.pi_require_console_reader",
  "grant execute",
  "from public, anon, authenticated, service_role",
])
  if (!consoleCommands.includes(required))
    errors.push(`Console command contract missing: ${required}.`);
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
    `Product Intelligence migration validation passed (${migrationNames.length} migrations, ${requiredTables.length} foundation tables and 3 working-review tables).`,
  );
}
