begin;

create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;

select plan(5);

select ok(
  has_function_privilege(
    'service_role',
    'public.pi_is_valid_lifecycle_transition(public.pi_product_lifecycle,public.pi_product_lifecycle)',
    'EXECUTE'
  ),
  'service role can execute lifecycle validation during idempotent product upserts'
);

insert into public.import_batches (
  id,
  source_revision,
  source_kind,
  source_files,
  expected_counts,
  status,
  is_shadow
) values (
  '40000000-0000-4000-8000-000000000001',
  'service-job-test-revision',
  'synthetic_test',
  '[]'::jsonb,
  public.pi_current_shadow_counts(),
  'IMPORTED',
  true
);

select set_config('request.jwt.claim.role', '', true);
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
select results_eq(
  $$ select private.pi_request_jwt_role() $$,
  $$ values ('service_role'::text) $$,
  'the current JSON JWT claims setting resolves the service role'
);
select lives_ok(
  $$
    select public.pi_reconcile_shadow_batch(
      '40000000-0000-4000-8000-000000000001'::uuid
    )
  $$,
  'service job can reconcile a shadow batch using the current JSON JWT claims setting'
);

select results_eq(
  $$
    select status
    from public.import_batches
    where id = '40000000-0000-4000-8000-000000000001'
  $$,
  $$ values ('RECONCILED'::public.pi_import_status) $$,
  'service reconciliation records the batch as RECONCILED'
);

select set_config('request.jwt.claim.role', '', true);
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","sub":"40000000-0000-4000-8000-000000000099"}',
  true
);
select results_eq(
  $$ select private.pi_request_jwt_role() $$,
  $$ values ('authenticated'::text) $$,
  'the JSON JWT claims parser does not misclassify an authenticated user as service role'
);

select * from finish();
rollback;
