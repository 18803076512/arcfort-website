begin;

create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;

select plan(20);

select ok((select adoption_id is null from private.pi_working_authority_control where singleton),
  'migration does not adopt a working scope');
select is((select count(*)::int from private.pi_working_adoptions), 0,
  'migration creates no authority or baseline records');
select is((select count(*)::int from jsonb_object_keys(private.pi_shadow_source_columns())), 17,
  'exact parity contract includes seventeen tables');
select ok(not has_schema_privilege('authenticated','private','usage'),
  'authenticated clients cannot access private operational schema');
select ok(not has_table_privilege('service_role','private.pi_working_adoptions','insert'),
  'service role cannot create an adoption');
select ok(not has_table_privilege('authenticated','private.pi_working_authority_control','update'),
  'authenticated clients cannot flip authority');
select ok(not has_function_privilege('authenticated',
  'private.pi_adopt_15ak_working_scope(text,jsonb,text,text)','execute'),
  'adoption is not exposed to ordinary Console forms');
select ok(not has_function_privilege('service_role',
  'private.pi_adopt_15ak_working_scope(text,jsonb,text,text)','execute'),
  'import service cannot call adoption');
select ok(not has_function_privilege('anon',
  'private.pi_adopt_15ak_working_scope(text,jsonb,text,text)','execute'),
  'anonymous clients cannot call adoption');
select is((select count(*)::int from pg_trigger
  where tgname = 'pi_working_authority_guard' and not tgisinternal), 26,
  'all catalog, batch and publication statements use the barrier');
select ok(not exists (select 1 from pg_trigger where tgname = 'pi_working_authority_guard'
  and (tgtype & 1) <> 0), 'authority barrier is statement-level, including empty updates');
select ok(not exists (select 1 from pg_trigger where tgname = 'pi_working_authority_guard'
  and (tgtype & 32) = 0), 'authority barrier covers truncate');
select ok((select relrowsecurity and relforcerowsecurity from pg_class
  where oid = 'private.pi_working_adoptions'::regclass), 'baseline ledger forces RLS');
select ok((select relrowsecurity and relforcerowsecurity from pg_class
  where oid = 'private.pi_working_authority_control'::regclass), 'authority state forces RLS');
select throws_ok($$select private.pi_adopt_15ak_working_scope(repeat('a',64),'{}',repeat('b',40),'test operation')$$,
  '42501', null, 'database identity alone is not human owner approval');
select throws_ok($$delete from private.pi_working_authority_control$$,
  '55000', null, 'authority row cannot be deleted');
select throws_ok($$truncate private.pi_working_adoptions cascade$$,
  '55000', null, 'baseline ledger cannot be truncated');
select throws_ok($$update private.pi_working_authority_control set adoption_id = null$$,
  '55000', null, 'a nullable flag cannot be used to reset authority');
select lives_ok($$update public.products set name_en = name_en where false$$,
  'pre-adoption catalog behavior remains available');
select is((select count(*)::int from public.publish_records), 0,
  'no product or release was published');

select * from finish();
rollback;
