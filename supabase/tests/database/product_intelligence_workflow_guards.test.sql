begin;

create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;

select plan(22);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'owner@example.invalid',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'editor@example.invalid',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'reviewer@example.invalid',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'publisher@example.invalid',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.console_user_roles (user_id, role)
values
  ('30000000-0000-4000-8000-000000000001', 'owner'),
  ('30000000-0000-4000-8000-000000000002', 'editor'),
  ('30000000-0000-4000-8000-000000000003', 'reviewer'),
  ('30000000-0000-4000-8000-000000000004', 'publisher');

insert into public.product_categories (
  id, external_key, slug, name_en, route_slug
) values (
  '30000000-0000-4000-8000-000000000010',
  'workflow-category',
  'workflow-category',
  'Workflow Category',
  'workflow-category'
);

insert into public.products (
  id, external_key, category_id, name_en, product_type, source_type
) values (
  '30000000-0000-4000-8000-000000000011',
  'AF-MIG-WG-9999',
  '30000000-0000-4000-8000-000000000010',
  'Workflow Guard Product',
  'welding-consumable',
  'factory'
);

insert into public.product_variants (
  id, product_id, category_id, sku, public_slug, lifecycle_state, is_shadow,
  legacy_status, legacy_data_status, legacy_image_status,
  legacy_compatibility_status, legacy_oem_status
) values (
  '30000000-0000-4000-8000-000000000012',
  '30000000-0000-4000-8000-000000000011',
  '30000000-0000-4000-8000-000000000010',
  'AF-MIG-WG-9999',
  'workflow-guard-product',
  'DRAFT',
  false,
  'draft',
  'needs_review',
  'needs_photo',
  'unverified',
  'unknown'
);

insert into public.technical_field_definitions (
  id, field_key, label
) values (
  '30000000-0000-4000-8000-000000000013',
  'workflow_material',
  'Workflow Material'
);

insert into public.evidence_sources (
  id, external_key, source_type, source_level, title, source_reference,
  exact_subject, raw_snapshot
) values (
  '30000000-0000-4000-8000-000000000014',
  'workflow-factory-specification',
  'factory_specification',
  'A',
  'Workflow Factory Specification',
  'workflow-test-only',
  true,
  '{"evidence_basis":["factory_specification"]}'::jsonb
);

insert into public.technical_values (
  id, external_key, field_definition_id, product_variant_id, value_text,
  source_type, source_level, verification_status
) values (
  '30000000-0000-4000-8000-000000000015',
  'workflow-technical-value',
  '30000000-0000-4000-8000-000000000013',
  '30000000-0000-4000-8000-000000000012',
  'Test value',
  'factory_specification',
  'A',
  'NEEDS_FACTORY_CONFIRMATION'
);

insert into public.technical_value_evidence (
  technical_value_id, evidence_source_id, evidence_role
) values (
  '30000000-0000-4000-8000-000000000015',
  '30000000-0000-4000-8000-000000000014',
  'supporting'
);

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000002', true);
select throws_ok(
  $$
    update public.technical_values
    set verification_status = 'CONFIRMED'
    where id = '30000000-0000-4000-8000-000000000015'
  $$,
  '42501',
  null,
  'editor cannot confirm a technical value'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);

update public.product_variants
set lifecycle_state = 'INGESTED'
where id = '30000000-0000-4000-8000-000000000012';

update public.product_variants
set lifecycle_state = 'NEEDS_VERIFICATION'
where id = '30000000-0000-4000-8000-000000000012';

insert into public.verification_events (
  entity_type, entity_id, decision, reason, actor_id
) values (
  'product_variant',
  '30000000-0000-4000-8000-000000000012',
  'APPROVE',
  'Variant identity reviewed for the readiness test.',
  '30000000-0000-4000-8000-000000000001'
);

select throws_ok(
  $$
    update public.product_variants
    set lifecycle_state = 'VERIFIED'
    where id = '30000000-0000-4000-8000-000000000012'
  $$,
  '23514',
  null,
  'VERIFIED is blocked when no applicable critical field definition exists'
);

update public.technical_field_definitions
set is_critical = true
where id = '30000000-0000-4000-8000-000000000013';

reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000003', true);
select throws_ok(
  $$
    update public.technical_values
    set verification_status = 'CONFIRMED'
    where id = '30000000-0000-4000-8000-000000000015'
  $$,
  '23514',
  null,
  'reviewer cannot confirm without an approval event'
);

insert into public.verification_events (
  entity_type, entity_id, field_key, decision, reason, actor_id
) values (
  'technical_value',
  '30000000-0000-4000-8000-000000000015',
  'workflow_material',
  'APPROVE',
  'Exact-product factory specification reviewed for this test.',
  '30000000-0000-4000-8000-000000000003'
);

select lives_ok(
  $$
    update public.technical_values
    set verification_status = 'CONFIRMED'
    where id = '30000000-0000-4000-8000-000000000015'
  $$,
  'reviewer can confirm after qualifying evidence and an approval event'
);
select results_eq(
  $$
    select confirmed_by
    from public.technical_values
    where id = '30000000-0000-4000-8000-000000000015'
  $$,
  $$ values ('30000000-0000-4000-8000-000000000003'::uuid) $$,
  'confirmation attribution is taken from the authenticated reviewer'
);
select throws_ok(
  $$
    update public.technical_values
    set value_text = 'Silently changed value'
    where id = '30000000-0000-4000-8000-000000000015'
  $$,
  '55000',
  null,
  'confirmed technical value cannot be edited in place'
);
select throws_ok(
  $$
    delete from public.technical_value_evidence
    where technical_value_id = '30000000-0000-4000-8000-000000000015'
  $$,
  '42501',
  null,
  'reviewer cannot delete technical evidence links'
);
reset role;
select throws_ok(
  $$
    delete from public.technical_value_evidence
    where technical_value_id = '30000000-0000-4000-8000-000000000015'
  $$,
  '55000',
  null,
  'evidence linked to confirmed data cannot be removed'
);

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);

select lives_ok(
  $$
    update public.product_variants
    set lifecycle_state = 'VERIFIED'
    where id = '30000000-0000-4000-8000-000000000012'
  $$,
  'VERIFIED succeeds after the applicable critical field is confirmed'
);

update public.product_variants
set legacy_data_status = 'confirmed'
where id = '30000000-0000-4000-8000-000000000012';

insert into public.media_assets (
  id, external_key, public_path, source_kind, source_reference, source_owner,
  ownership_status, usage_rights_status, content_match_status, publication_status
) values (
  '30000000-0000-4000-8000-000000000016',
  'workflow-main-image',
  '/images/products/workflow-main-image.jpg',
  'own_photo',
  'synthetic-test',
  'ArcFort Weld test fixture',
  'company_owned',
  'approved',
  'exact_product',
  'display_only'
);

insert into public.product_media (
  id, product_variant_id, media_asset_id, role, alt_text
) values (
  '30000000-0000-4000-8000-000000000017',
  '30000000-0000-4000-8000-000000000012',
  '30000000-0000-4000-8000-000000000016',
  'main',
  'Synthetic workflow product image'
);

insert into public.verification_events (
  entity_type, entity_id, decision, reason, actor_id
) values (
  'media_asset',
  '30000000-0000-4000-8000-000000000016',
  'APPROVE',
  'Synthetic exact-product media reviewed for the readiness test.',
  '30000000-0000-4000-8000-000000000001'
);

update public.media_assets
set publication_status = 'search_eligible'
where id = '30000000-0000-4000-8000-000000000016';

insert into public.seo_records (
  id, external_key, entity_type, product_variant_id, search_intent,
  title, meta_description, canonical_path, publication_status
) values (
  '30000000-0000-4000-8000-000000000018',
  'workflow-seo-record',
  'product',
  '30000000-0000-4000-8000-000000000012',
  'commercial_product',
  'Workflow Product',
  'Synthetic SEO record used only for Product Intelligence workflow testing.',
  '/products/workflow-category/workflow-guard-product',
  'shadow'
);

select results_eq(
  $$
    select blocker_count
    from public.pi_variant_readiness
    where id = '30000000-0000-4000-8000-000000000012'
  $$,
  $$ values (1) $$,
  'a shadow SEO record does not satisfy the publish-readiness gate'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000004', true);

select lives_ok(
  $$
    update public.seo_records
    set publication_status = 'approved'
    where id = '30000000-0000-4000-8000-000000000018'
  $$,
  'publisher can approve a governed SEO record'
);

select results_eq(
  $$
    select blocker_count
    from public.pi_variant_readiness
    where id = '30000000-0000-4000-8000-000000000012'
  $$,
  $$ values (0) $$,
  'approved SEO clears the final publish-readiness blocker'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);

select lives_ok(
  $$
    update public.product_variants
    set lifecycle_state = 'READY_FOR_PUBLISH'
    where id = '30000000-0000-4000-8000-000000000012'
  $$,
  'READY_FOR_PUBLISH succeeds only after the readiness blockers are cleared'
);

reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000004', true);

insert into public.release_candidates (
  id, release_key, source_revision, intended_destination, created_by
) values (
  '30000000-0000-4000-8000-000000000020',
  'workflow-release',
  'workflow-revision',
  'staging',
  '30000000-0000-4000-8000-000000000004'
);

insert into public.release_items (
  id, release_candidate_id, entity_type, entity_key, frozen_snapshot
) values (
  '30000000-0000-4000-8000-000000000021',
  '30000000-0000-4000-8000-000000000020',
  'product_variant',
  'AF-MIG-WG-9999',
  '{"sku":"AF-MIG-WG-9999"}'::jsonb
);

select lives_ok(
  $$
    update public.release_candidates
    set status = 'FROZEN', frozen_snapshot_hash = 'workflow-snapshot-hash'
    where id = '30000000-0000-4000-8000-000000000020'
  $$,
  'release with an item and snapshot hash can be frozen'
);
select lives_ok(
  $$
    update public.release_candidates
    set status = 'QA_RUNNING'
    where id = '30000000-0000-4000-8000-000000000020'
  $$,
  'frozen release can start a governed QA run'
);
select lives_ok(
  $$
    insert into public.release_qa_results (
      release_candidate_id, result, check_name, evidence, executed_by
    ) values (
      '30000000-0000-4000-8000-000000000020',
      'PASS',
      'workflow-guard-test',
      '{"status":"passed"}'::jsonb,
      '30000000-0000-4000-8000-000000000004'
    )
  $$,
  'publisher can record a result in the active QA run'
);
select lives_ok(
  $$
    update public.release_candidates
    set status = 'PASS'
    where id = '30000000-0000-4000-8000-000000000020'
  $$,
  'release can pass only after its active QA run passes'
);
select throws_ok(
  $$
    update public.release_candidates
    set status = 'APPROVED'
    where id = '30000000-0000-4000-8000-000000000020'
  $$,
  '42501',
  null,
  'publisher cannot approve a passing release'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$
    update public.release_candidates
    set status = 'APPROVED'
    where id = '30000000-0000-4000-8000-000000000020'
  $$,
  'owner can approve a passing release with zero item blockers'
);
select throws_ok(
  $$
    insert into public.publish_records (
      release_candidate_id, destination, snapshot_hash, live_verification, published_by
    ) values (
      '30000000-0000-4000-8000-000000000020',
      'staging',
      'workflow-snapshot-hash',
      '{"status":"pending"}'::jsonb,
      '30000000-0000-4000-8000-000000000001'
    )
  $$,
  '23514',
  null,
  'publish record is blocked without verified live evidence'
);
select lives_ok(
  $$
    insert into public.publish_records (
      release_candidate_id, destination, snapshot_hash, live_verification, published_by
    ) values (
      '30000000-0000-4000-8000-000000000020',
      'staging',
      'workflow-snapshot-hash',
      '{"status":"verified","scope":"synthetic-test"}'::jsonb,
      '30000000-0000-4000-8000-000000000001'
    )
  $$,
  'approved release can publish with matching snapshot and verified live evidence'
);
select results_eq(
  $$
    select status
    from public.release_candidates
    where id = '30000000-0000-4000-8000-000000000020'
  $$,
  $$ values ('PUBLISHED'::public.pi_release_status) $$,
  'publish record finalizes the release candidate as PUBLISHED'
);
reset role;

select * from finish();
rollback;
