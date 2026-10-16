begin;

create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;

select plan(12);

select ok(
  public.pi_is_valid_lifecycle_transition('DRAFT', 'INGESTED'),
  'DRAFT can move to INGESTED'
);
select ok(
  not public.pi_is_valid_lifecycle_transition('INGESTED', 'VERIFIED'),
  'INGESTED cannot skip to VERIFIED'
);
select ok(
  not public.pi_is_valid_lifecycle_transition('NEEDS_VERIFICATION', 'PUBLISHED'),
  'NEEDS_VERIFICATION cannot skip to PUBLISHED'
);
select ok(
  public.pi_is_valid_lifecycle_transition('PUBLISHED', 'NEEDS_UPDATE'),
  'PUBLISHED can move to NEEDS_UPDATE'
);

insert into public.product_categories (
  id, external_key, slug, name_en, route_slug
) values (
  '10000000-0000-4000-8000-000000000001',
  'test-category',
  'test-category',
  'Test Category',
  'test-category'
);

insert into public.products (
  id, external_key, category_id, name_en, product_type, source_type
) values (
  '10000000-0000-4000-8000-000000000002',
  'AF-MIG-TS-9998',
  '10000000-0000-4000-8000-000000000001',
  'Lifecycle Test Product',
  'welding-consumable',
  'unknown'
);

select throws_ok(
  $$
    insert into public.product_variants (
      id, product_id, category_id, sku, public_slug, lifecycle_state, is_shadow,
      legacy_status, legacy_data_status, legacy_image_status,
      legacy_compatibility_status, legacy_oem_status
    ) values (
      '10000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000001',
      'AF-MIG-TS-9998',
      'lifecycle-test-product',
      'VERIFIED',
      true,
      'draft',
      'needs_review',
      'needs_photo',
      'unverified',
      'unknown'
    )
  $$,
  '23514',
  null,
  'shadow record cannot enter VERIFIED on insert'
);

select lives_ok(
  $$
    insert into public.product_variants (
      id, product_id, category_id, sku, public_slug, lifecycle_state, is_shadow,
      legacy_status, legacy_data_status, legacy_image_status,
      legacy_compatibility_status, legacy_oem_status
    ) values (
      '10000000-0000-4000-8000-000000000004',
      '10000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000001',
      'AF-MIG-TS-9999',
      'valid-lifecycle-test-product',
      'INGESTED',
      true,
      'draft',
      'needs_review',
      'needs_photo',
      'unverified',
      'unknown'
    )
  $$,
  'shadow record can enter INGESTED'
);

select throws_ok(
  $$
    update public.product_variants
    set lifecycle_state = 'PUBLISHED'
    where id = '10000000-0000-4000-8000-000000000004'
  $$,
  '23514',
  null,
  'lifecycle trigger blocks INGESTED to PUBLISHED'
);

insert into public.technical_field_definitions (
  id, field_key, label
) values (
  '10000000-0000-4000-8000-000000000005',
  'test_dimension',
  'Test Dimension'
);

select throws_ok(
  $$
    insert into public.technical_values (
      id, external_key, field_definition_id, product_variant_id, value_text,
      source_type, source_level, verification_status
    ) values (
      '10000000-0000-4000-8000-000000000006',
      'invalid-confirmed-value',
      '10000000-0000-4000-8000-000000000005',
      '10000000-0000-4000-8000-000000000004',
      '10',
      'company_catalog',
      'A',
      'CONFIRMED'
    )
  $$,
  '23514',
  null,
  'CONFIRMED value requires an authenticated confirmation record'
);

select lives_ok(
  $$
    insert into public.technical_values (
      id, external_key, field_definition_id, product_variant_id, value_text,
      source_type, source_level, verification_status
    ) values (
      '10000000-0000-4000-8000-000000000007',
      'review-required-value',
      '10000000-0000-4000-8000-000000000005',
      '10000000-0000-4000-8000-000000000004',
      '10',
      'company_catalog',
      'A',
      'NEEDS_FACTORY_CONFIRMATION'
    )
  $$,
  'unconfirmed reference value remains review-required'
);

select throws_ok(
  $$
    insert into public.media_assets (
      id, external_key, public_path, source_kind, source_reference,
      ownership_status, usage_rights_status, content_match_status, publication_status
    ) values (
      '10000000-0000-4000-8000-000000000008',
      'unsafe-search-image',
      '/images/products/unsafe.jpg',
      'unknown',
      'test',
      'unknown',
      'needs_confirmation',
      'product_family_reference',
      'search_eligible'
    )
  $$,
  '23514',
  null,
  'search-eligible media requires rights and exact-product approval'
);

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
) values (
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-4000-8000-000000000009',
  'authenticated',
  'authenticated',
  'lifecycle-reviewer@example.invalid',
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.verification_events (
  entity_type, entity_id, field_key, decision, reason, actor_id
) values (
  'technical_value',
  '10000000-0000-4000-8000-000000000007',
  'test_dimension',
  'REJECT',
  'Lifecycle immutability test event.',
  '10000000-0000-4000-8000-000000000009'
);

select throws_ok(
  $$ update public.audit_events set actor_kind = 'database' $$,
  '55000',
  null,
  'audit events are immutable'
);

select throws_ok(
  $$ delete from public.verification_events $$,
  '55000',
  null,
  'verification events are immutable'
);

select * from finish();
rollback;
