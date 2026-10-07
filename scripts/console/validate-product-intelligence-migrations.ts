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
  "202609240010_product_intelligence_compatibility_sources.sql",
  "202609240011_product_intelligence_compatibility_review.sql",
  "202609250012_product_intelligence_compatibility_commands.sql",
  "202609260013_product_intelligence_media_sources.sql",
  "202609260014_product_intelligence_original_intake.sql",
  "202609270015_product_intelligence_original_commands.sql",
  "202610040016_product_intelligence_media_mapping_drafts.sql",
  "202610040017_product_intelligence_media_mapping_review.sql",
  "202610040018_product_intelligence_media_review_commands.sql",
  "202610050019_product_intelligence_oem_sources.sql",
  "202610050020_product_intelligence_oem_review.sql",
  "202610050021_product_intelligence_oem_commands.sql",
  "202610050022_product_intelligence_packaging_sources.sql",
  "202610050023_product_intelligence_packaging_review.sql",
  "202610050024_product_intelligence_packaging_commands.sql",
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
const compatibilitySources = migrations[9].content;
const compatibilityReview = migrations[10].content;
const compatibilityCommands = migrations[11].content;
const mediaSources = migrations[12].content;
const originalIntake = migrations[13].content;
const originalCommands = migrations[14].content;
const mediaMappingDrafts = migrations[15].content;
const mediaMappingReview = migrations[16].content;
const mediaReviewCommands = migrations[17].content;
const oemSources = migrations[18].content;
const oemReview = migrations[19].content;
const oemCommands = migrations[20].content;
const packagingSources = migrations[21].content;
const packagingReview = migrations[22].content;
const packagingCommands = migrations[23].content;
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
for (const required of [
  "public.compatibility_source_bindings",
  "private.pi_ensure_product_compatibility_entity",
  "private.pi_add_compatibility_source",
  "private.pi_compatibility_source_matches",
  "binding.assertion = 'supports'",
  "binding.scope_label = pi_compatibility_source_matches.scope_label",
  "binding.target_digest = private.pi_compatibility_entity_digest(target_uuid)",
  "compatibility_source_immutable",
  "force row level security",
  "revoke all on all functions in schema private from public, anon, authenticated, service_role",
]) {
  if (!compatibilitySources.includes(required))
    errors.push(`Compatibility source contract missing: ${required}.`);
}
if (
  allSql.includes("SUPABASE_SERVICE_ROLE_KEY") ||
  allSql.includes("PRODUCT_INTELLIGENCE_SUPABASE")
) {
  errors.push("A migration contains an environment-variable name or credential contract.");
}
for (const required of [
  "public.compatibility_revision_heads",
  "public.compatibility_revisions",
  "private.pi_propose_compatibility_revision",
  "private.pi_submit_compatibility_review",
  "private.pi_review_compatibility_revision",
  "private.pi_guard_exact_compatibility_approval",
  "candidate.submitted_digest=private.pi_compatibility_digest(old.id)",
  "event.decision='APPROVE'",
  "public.pi_effective_compatibility_relationships with (security_invoker=true)",
  "Open compatibility proposals must be reviewed before VERIFIED",
  "revoke all on all functions in schema private from public, anon, authenticated, service_role",
]) {
  if (!compatibilityReview.includes(required))
    errors.push(`Compatibility review contract missing: ${required}.`);
}

for (const [name, args] of [
  ["pi_ensure_product_compatibility_entity", "uuid,uuid"],
  ["pi_add_compatibility_source", "uuid,uuid,uuid,text,text,text,jsonb"],
  ["pi_propose_compatibility_revision", "uuid,uuid,uuid,text,text,bigint,jsonb,jsonb,text,uuid"],
  ["pi_submit_compatibility_review", "uuid,uuid,bigint,text"],
  ["pi_review_compatibility_revision", "uuid,uuid,bigint,text,text,text,text,jsonb,jsonb"],
]) {
  if (
    !compatibilityCommands.includes(`create function public.${name}(`) ||
    !compatibilityCommands.includes(`select private.${name}(`) ||
    !compatibilityCommands.includes(
      `revoke all on function public.${name}(${args}) from public,anon,authenticated,service_role;`,
    ) ||
    !compatibilityCommands.includes(
      `grant execute on function public.${name}(${args}) to authenticated;`,
    )
  )
    errors.push(`Narrow compatibility command wrapper missing: ${name}.`);
}

for (const required of [
  "public.media_source_bindings",
  "private.pi_add_media_source",
  "private.pi_media_source_matches",
  "private.pi_media_source_can_support_review",
  "binding.evidence_dimension=dimension",
  "binding.variant_digest=private.pi_media_variant_digest(variant_uuid)",
  "binding.asset_digest=private.pi_media_asset_digest(asset_uuid)",
  "media_source_immutable",
  "force row level security",
  "revoke all on all functions in schema private from public, anon, authenticated, service_role",
]) {
  if (!mediaSources.includes(required)) errors.push(`Media source contract missing: ${required}.`);
}

for (const required of [
  "public.media_upload_intents",
  "public.media_upload_completions",
  "private.pi_begin_media_upload",
  "private.pi_complete_media_upload",
  "public.pi_can_upload_original",
  "as restrictive for insert",
  "as restrictive for update",
  "as restrictive for delete",
  "'byte_verification','not_attested'",
  "original_asset_identity_guard",
]) {
  if (!originalIntake.includes(required))
    errors.push(`Original intake contract missing: ${required}.`);
}

for (const [name, args] of [
  ["pi_begin_media_upload", "uuid,uuid,jsonb"],
  ["pi_complete_media_upload", "uuid,uuid"],
  ["pi_read_original_intakes", "uuid,integer"],
]) {
  if (
    !originalCommands.includes(`create function public.${name}(`) ||
    !originalCommands.includes(
      `revoke all on function public.${name}(${args}) from public,anon,authenticated,service_role;`,
    ) ||
    !originalCommands.includes(
      `grant execute on function public.${name}(${args}) to authenticated;`,
    )
  )
    errors.push(`Original command wrapper missing: ${name}.`);
}

for (const required of [
  "public.media_mapping_heads",
  "public.media_mapping_revisions",
  "public.media_mapping_evidence",
  "private.pi_propose_media_mapping",
  "private.pi_submit_media_mapping",
  "private.pi_media_original_digest",
  "private.pi_media_mapping_digest",
  "public.pi_media_mapping_states with (security_invoker=true)",
  "immutable_mapping_revision",
  "immutable_mapping_evidence",
  "Open media mappings require human review",
  "force row level security",
  "revoke all on all functions in schema private from public,anon,authenticated,service_role",
]) {
  if (!mediaMappingDrafts.includes(required))
    errors.push(`Media mapping draft contract missing: ${required}.`);
}
if (
  /disable\s+trigger|create\s+function\s+public\.pi_(?:propose|submit)_media_mapping/i.test(
    mediaMappingDrafts,
  )
) {
  errors.push("Media mapping drafts must not disable guards or expose mutation wrappers.");
}

for (const required of [
  "public.media_mapping_decisions",
  "public.media_mapping_currents",
  "private.pi_review_media_mapping",
  "private.pi_append_media_mapping",
  "private.pi_media_mapping_approval_valid",
  "private.pi_guard_media_mapping_decision",
  "private.pi_guard_media_mapping_current",
  "public.pi_effective_media_mappings with (security_invoker=true)",
  "public.pi_media_mapping_readiness with (security_invoker=true)",
  "public.pi_media_mapping_metrics with (security_invoker=true)",
  "'usage_rights_confirmed',true,'exact_product_confirmed',true",
  "Invalid current media approval blocks publishable lifecycle states.",
  "force row level security",
  "revoke all on all functions in schema private from public,anon,authenticated,service_role",
]) {
  if (!mediaMappingReview.includes(required))
    errors.push(`Media mapping review contract missing: ${required}.`);
}
if (
  /disable\s+trigger|create\s+(?:or\s+replace\s+)?function\s+public\.pi_(?:propose|submit|review)_media_mapping/i.test(
    mediaMappingReview,
  )
) {
  errors.push("Media review must retain guards and private mutations at this checkpoint.");
}

for (const required of [
  "private.pi_media_observation_keys",
  "private.pi_media_review_observations",
  "private.pi_validate_media_observation",
  "private.pi_media_observation_signature_matches",
  "public.pi_media_review_snapshot",
  "public.pi_add_media_source",
  "public.pi_propose_media_mapping",
  "public.pi_submit_media_mapping",
  "public.pi_review_media_mapping",
  "public.pi_media_review_observed",
  "parts[3] is distinct from auth.uid()::text",
  "parts[4] is distinct from snapshot->>'adoption_id'",
  "parts[10]::bigint<=current_second",
  "parts[10]::bigint-parts[9]::bigint not between 1 and 300",
  "extensions.hmac",
  "immutable_media_observation",
  "force row level security",
  "'observation_digest',encode(extensions.digest(observation_token,'sha256'),'hex')",
  "revoke all on all functions in schema private from public,anon,authenticated,service_role",
])
  if (!mediaReviewCommands.includes(required))
    errors.push(`Observed media command contract missing: ${required}.`);
if (
  /disable\s+trigger|insert\s+into\s+private\.pi_media_observation_keys/i.test(mediaReviewCommands)
)
  errors.push("Observed media commands cannot disable guards or provision a real observer key.");

for (const required of [
  "create table public.oem_source_bindings",
  "force row level security",
  "immutable_oem_binding",
  "private.pi_add_oem_source",
  "private.pi_check_oem_source_target",
  "private.pi_oem_source_matches",
  "private.pi_oem_source_can_support_review",
  "private.pi_guard_bound_oem_source",
  "private.pi_begin_technical_command",
  "private.pi_finish_technical_command",
  "binding.manufacturer_name=requested_manufacturer",
  "binding.reference_number=requested_reference",
  "binding.source_digest=encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex')",
  "'factory_record','controlled_drawing','approved_sample','verified_reference'",
  "revoke all on all functions in schema private from public,anon,authenticated,service_role",
])
  if (!oemSources.includes(required)) errors.push(`OEM source contract missing: ${required}.`);
if (
  /create\s+(?:or\s+replace\s+)?function\s+public\.|insert\s+into\s+public\.oem_references|disable\s+trigger/i.test(
    oemSources,
  )
)
  errors.push(
    "OEM intake cannot expose mutation RPCs, modify current OEM records or disable guards.",
  );

for (const required of [
  "create table public.oem_revision_heads",
  "create table public.oem_revisions",
  "create table public.oem_revision_evidence",
  "create table public.oem_revision_decisions",
  "create table public.oem_revision_currents",
  "force row level security",
  "private.pi_propose_oem_revision",
  "private.pi_submit_oem_revision",
  "private.pi_review_oem_revision",
  "private.pi_oem_revision_digest",
  "private.pi_guard_oem_decision",
  "private.pi_guard_oem_current",
  "private.pi_guard_oem_evidence_insert",
  "'known_conflicts'",
  "'compatibility_not_asserted',true",
  "'arcfort_reference_confirmed'",
  "public.pi_effective_oem_references with (security_invoker=true)",
  "public.pi_oem_readiness with (security_invoker=true)",
  "private.pi_guard_current_oem",
  "revoke all on all functions in schema private from public,anon,authenticated,service_role",
])
  if (!oemReview.includes(required)) errors.push(`OEM review contract missing: ${required}.`);
if (
  /disable\s+trigger|(?:insert\s+into|update|delete\s+from)\s+public\.oem_references\b|create\s+(?:or\s+replace\s+)?function\s+public\.pi_(?:propose|submit|review)_oem/i.test(
    oemReview,
  )
)
  errors.push(
    "OEM review cannot overwrite original references, disable guards or expose application mutations.",
  );

for (const required of [
  "create function public.pi_add_oem_source",
  "create function public.pi_propose_oem_revision",
  "create function public.pi_submit_oem_revision",
  "create function public.pi_review_oem_revision",
  "public.pi_oem_source_states with (security_invoker=true)",
  "public.pi_oem_revision_states with (security_invoker=true)",
  "private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console()",
  "candidate.proposal_digest=private.pi_oem_revision_digest(candidate.id)",
  "revoke all on all functions in schema private from public,anon,authenticated,service_role",
])
  if (!oemCommands.includes(required))
    errors.push(`OEM application contract missing: ${required}.`);
if (
  /disable\s+trigger|(?:insert\s+into|update|delete\s+from)\s+public\.(?:oem_references|compatibility_relationships|publish_records)\b|grant\s+.*\s+to\s+(?:anon|service_role)\b/i.test(
    oemCommands,
  )
)
  errors.push(
    "OEM wrappers cannot overwrite source/fit/publication authority or grant anonymous/service access.",
  );

for (const required of [
  "create table public.packaging_source_bindings",
  "private.pi_add_packaging_source",
  "private.pi_check_packaging_copy",
  "private.pi_packaging_source_matches",
  "private.pi_packaging_source_can_support_review",
  "private.pi_packaging_original_digest",
  "binding.original_packaging_id is not distinct from original_uuid",
  "binding.variant_digest=private.pi_packaging_variant_digest(variant_uuid)",
  "binding.source_digest=encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex')",
  "packaging_source_quantity_pair_check",
  "packaging_source_immutable",
  "force row level security",
  "'packaging_record','factory_record','controlled_drawing','approved_sample'",
  "revoke all on all functions in schema private from public,anon,authenticated,service_role",
])
  if (!packagingSources.includes(required))
    errors.push(`Packaging source contract missing: ${required}.`);
if (
  /create\s+(?:or\s+replace\s+)?function\s+public\.|(?:insert\s+into|update|delete\s+from)\s+public\.(?:packaging_records|product_variants|compatibility_relationships|publish_records)\b|disable\s+trigger|grant\s+.*\s+to\s+(?:anon|service_role)\b/i.test(
    packagingSources,
  )
)
  errors.push(
    "Packaging intake cannot expose mutation RPCs, modify original/commercial/public records or disable guards.",
  );

for (const required of [
  "create table public.packaging_revision_heads",
  "create table public.packaging_revisions",
  "create table public.packaging_revision_evidence",
  "create table public.packaging_revision_decisions",
  "create table public.packaging_revision_currents",
  "private.pi_propose_packaging_revision",
  "private.pi_submit_packaging_revision",
  "private.pi_review_packaging_revision",
  "private.pi_guard_packaging_decision",
  "private.pi_guard_packaging_current",
  "private.pi_guard_packaging_evidence_insert",
  "'known_conflicts'",
  "'commercial_terms_unchanged',true",
  "'arcfort_packaging_confirmed'",
  "candidate.quantity is not null",
  "public.pi_effective_packaging_records with (security_invoker=true)",
  "public.pi_packaging_readiness with (security_invoker=true)",
  "private.pi_guard_current_packaging",
  "coalesce(oem.unresolved_oem_count,0)",
  "coalesce(packaging.unresolved_packaging_count,0)",
  "force row level security",
  "revoke all on all functions in schema private from public,anon,authenticated,service_role",
])
  if (!packagingReview.includes(required))
    errors.push(`Packaging review contract missing: ${required}.`);
if (
  /disable\s+trigger|(?:insert\s+into|update|delete\s+from)\s+public\.packaging_records\b|create\s+(?:or\s+replace\s+)?function\s+public\.pi_(?:propose|submit|review)_packaging/i.test(
    packagingReview,
  )
)
  errors.push(
    "Packaging review cannot overwrite original commercial records, disable guards or expose application mutations.",
  );

for (const required of [
  "public.pi_add_packaging_source",
  "public.pi_propose_packaging_revision",
  "public.pi_submit_packaging_revision",
  "public.pi_review_packaging_revision",
  "private.pi_add_packaging_source",
  "private.pi_review_packaging_revision",
  "public.pi_packaging_source_current",
  "public.pi_packaging_revision_fresh",
  "conflict_source_ids",
  "public.pi_packaging_source_states with (security_invoker=true)",
  "public.pi_packaging_revision_states with (security_invoker=true)",
  "revoke all on all functions in schema private from public,anon,authenticated,service_role",
])
  if (!packagingCommands.includes(required))
    errors.push(`Packaging application contract missing: ${required}.`);
if (
  /disable\s+trigger|(?:insert\s+into|update|delete\s+from)\s+public\.(?:packaging_records|product_variants|publish_records)\b|grant\s+.*\s+to\s+(?:anon|service_role)\b/i.test(
    packagingCommands,
  )
)
  errors.push(
    "Packaging application cannot change original/public data, disable guards or grant anonymous/service writes.",
  );

if (errors.length > 0) {
  console.error("Product Intelligence migration validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Product Intelligence migration validation passed (${migrationNames.length} migrations, ${requiredTables.length} foundation tables and scoped working-review contracts).`,
  );
}
