begin;

create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;

select plan(10);

select results_eq(
  $$
    select count(*)::bigint
    from pg_class
    join pg_namespace on pg_namespace.oid = pg_class.relnamespace
    where pg_namespace.nspname = 'public'
      and pg_class.relname in (
        'console_user_roles', 'product_categories', 'product_series', 'products',
        'product_variants', 'series_components', 'technical_field_definitions',
        'evidence_sources', 'technical_values', 'technical_value_evidence',
        'oem_references', 'packaging_records', 'compatibility_entities',
        'compatibility_relationships', 'compatibility_evidence', 'media_assets',
        'product_media', 'technical_documents', 'entity_documents', 'seo_records',
        'import_batches', 'import_rows', 'verification_events', 'release_candidates',
        'release_items', 'release_qa_results', 'publish_records', 'audit_events'
      )
      and pg_class.relrowsecurity
      and pg_class.relforcerowsecurity
  $$,
  $$ values (28::bigint) $$,
  'all Product Intelligence tables enable and force RLS'
);

select is_empty(
  $$
    select 1
    from pg_policies
    where schemaname in ('public', 'storage')
      and (
        tablename in (
          'console_user_roles', 'product_categories', 'product_series', 'products',
          'product_variants', 'series_components', 'technical_field_definitions',
          'evidence_sources', 'technical_values', 'compatibility_relationships',
          'media_assets', 'seo_records', 'import_batches', 'verification_events',
          'release_candidates', 'audit_events'
        )
        or policyname like 'pi_private_assets_%'
      )
      and 'anon' = any(roles)
  $$,
  'no Product Intelligence policy grants anon access'
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
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'viewer@example.invalid',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'editor@example.invalid',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.console_user_roles (user_id, role)
values
  ('20000000-0000-4000-8000-000000000001', 'viewer'),
  ('20000000-0000-4000-8000-000000000002', 'editor');

insert into public.product_categories (
  id, external_key, slug, name_en, route_slug
) values (
  '20000000-0000-4000-8000-000000000010',
  'rls-fixture',
  'rls-fixture',
  'RLS Fixture',
  'rls-fixture'
);

set local role anon;
select throws_ok(
  $$ select * from public.product_categories $$,
  '42501',
  null,
  'anon cannot read Product Intelligence tables'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000099', true);
select results_eq(
  $$ select count(*)::bigint from public.product_categories $$,
  $$ values (0::bigint) $$,
  'authenticated user without a console role sees no catalog rows'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
select results_eq(
  $$ select count(*)::bigint from public.product_categories $$,
  $$ values (1::bigint) $$,
  'viewer can read catalog rows'
);
select throws_ok(
  $$
    insert into public.product_categories (
      external_key, slug, name_en, route_slug
    ) values ('viewer-write', 'viewer-write', 'Viewer Write', 'viewer-write')
  $$,
  '42501',
  null,
  'viewer cannot create catalog identity'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
select lives_ok(
  $$
    insert into public.product_categories (
      external_key, slug, name_en, route_slug
    ) values ('editor-write', 'editor-write', 'Editor Write', 'editor-write')
  $$,
  'editor can create catalog identity in the shadow workspace'
);
select throws_ok(
  $$
    insert into public.console_user_roles (user_id, role)
    values ('20000000-0000-4000-8000-000000000002', 'owner')
  $$,
  '42501',
  null,
  'editor cannot grant owner role'
);
reset role;

select results_eq(
  $$ select public from storage.buckets where id = 'pi-product-originals' $$,
  $$ values (false) $$,
  'product originals bucket is private'
);
select results_eq(
  $$ select public from storage.buckets where id = 'pi-technical-evidence' $$,
  $$ values (false) $$,
  'technical evidence bucket is private'
);

select * from finish();
rollback;
