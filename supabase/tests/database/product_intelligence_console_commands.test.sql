begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
select plan(30);

insert into auth.users(id,email,email_confirmed_at) values
  ('88000000-0000-4000-8000-000000000001','rpc-owner@example.invalid',now()),
  ('88000000-0000-4000-8000-000000000002','rpc-viewer@example.invalid',now());
insert into console_user_roles(user_id,role) values
  ('88000000-0000-4000-8000-000000000001','owner'),
  ('88000000-0000-4000-8000-000000000002','viewer');
insert into product_categories(id,external_key,slug,name_en,route_slug) values
  ('88000000-0000-4000-8000-000000000010','rpc-category','mig-mag-torch-parts','Synthetic category','mig-mag-torch-parts');
create function pg_temp.copy() returns jsonb language sql as $$
  select '{"name_en":"Synthetic draft","name_zh":"","model":"","summary":"Test summary","description":"Test description","applications":""}'::jsonb;
$$;
create function pg_temp.create_draft() returns jsonb language sql as $$
  select public.pi_create_product_draft('88000000-0000-4000-8000-000000000020',
    '{"sku":"AF-MIG-TS-9988","slug":"synthetic-rpc-draft","source_reference":"Synthetic source"}',pg_temp.copy());
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','88000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select ok(not (select adopted from public.pi_working_status()),'wrapper exposes default-off adoption state');
select throws_ok($$select pg_temp.create_draft()$$,'55000',null,'public create wrapper cannot bypass adoption');
select set_config('request.jwt.claim.sub','88000000-0000-4000-8000-000000000002',true);
select throws_ok($$select pg_temp.create_draft()$$,'42501',null,'pre-adoption viewer cannot create or inspect adoption through commands');
select throws_ok($$select public.pi_save_product_draft('88000000-0000-4000-8000-000000000020','88000000-0000-4000-8000-000000000011',0,pg_temp.copy())$$,'42501',null,'pre-adoption viewer cannot save');
select throws_ok($$select public.pi_add_technical_source('88000000-0000-4000-8000-000000000020','88000000-0000-4000-8000-000000000011','88000000-0000-4000-8000-000000000012','','{}')$$,'42501',null,'pre-adoption viewer cannot add evidence');
select throws_ok($$select public.pi_propose_technical_revision('88000000-0000-4000-8000-000000000020','88000000-0000-4000-8000-000000000011','88000000-0000-4000-8000-000000000012','',0,'{}','[]','Synthetic denial')$$,'42501',null,'pre-adoption viewer cannot propose');
select throws_ok($$select public.pi_submit_technical_review('88000000-0000-4000-8000-000000000020','88000000-0000-4000-8000-000000000011',1,repeat('a',64))$$,'42501',null,'pre-adoption viewer cannot submit');
select throws_ok($$select public.pi_review_technical_revision('88000000-0000-4000-8000-000000000020','88000000-0000-4000-8000-000000000011',1,repeat('a',64),'APPROVE','Synthetic denial','','{}','[]')$$,'42501',null,'pre-adoption viewer cannot review');
select set_config('request.jwt.claim.sub','88000000-0000-4000-8000-000000000001',true);
reset role;
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,pilot_variant_ids,actor_id,reason)
  values ('88000000-0000-4000-8000-000000000050','15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array['88000000-0000-4000-8000-000000000011','88000000-0000-4000-8000-000000000012','88000000-0000-4000-8000-000000000013','88000000-0000-4000-8000-000000000014']::uuid[],
    '88000000-0000-4000-8000-000000000001','Synthetic wrapper fixture only');
update private.pi_working_authority_control set adoption_id='88000000-0000-4000-8000-000000000050';
set local role authenticated;
select ok((select adopted and can_edit and can_review from public.pi_working_status()),'owner sees current working permissions');
select lives_ok($$select pg_temp.create_draft()$$,'authenticated wrapper delegates atomic create');
select lives_ok($$select pg_temp.create_draft()$$,'public create retry returns original result');
select is((select count(*)::int from product_variants),1,'public retry creates one variant');
select is((select name_en from public.pi_read_product_draft((select id from product_variants))),'Synthetic draft','safe reader returns typed copy');
select is((select revision::int from public.pi_read_product_draft((select id from product_variants))),1,'safe reader carries concurrency revision');
select ok((select editable from public.pi_read_product_draft((select id from product_variants))),'current owner may edit created scope');
select is((select origin from public.pi_product_working_states(array(select id from product_variants))),'created','bounded list projection identifies working origin');
select lives_ok($$select public.pi_save_product_draft('88000000-0000-4000-8000-000000000021',(select id from product_variants),1,pg_temp.copy() || '{"summary":"Changed summary"}')$$,'public save uses expected revision');
select throws_ok($$select public.pi_save_product_draft('88000000-0000-4000-8000-000000000022',(select id from product_variants),1,pg_temp.copy())$$,'40001',null,'public stale save rejected');
select is((select count(*)::int from public.pi_read_product_draft_history((select id from product_variants),1)),2,'history retains both revisions');
select is((select total_count::int from public.pi_read_product_draft_history((select id from product_variants),1) limit 1),2,'history count supports pagination');
select ok(not (select to_jsonb(record) ?| array['raw_snapshot','private_storage_path','payload_digest'] from public.pi_read_product_draft((select id from product_variants)) record),'read projection excludes raw/private fields');
select throws_ok($$select public.pi_read_product_draft_history((select id from product_variants),0)$$,'22023',null,'history page bound enforced');
reset role;
select set_config('request.jwt.claim.sub','88000000-0000-4000-8000-000000000002',true);
set local role authenticated;
select ok((select adopted and not can_edit and not can_review from public.pi_working_status()),'viewer sees read-only working state');
select ok(not (select editable from public.pi_read_product_draft((select id from product_variants))),'viewer cannot edit through read metadata');
select throws_ok($$select pg_temp.create_draft()$$,'42501',null,'viewer rejected by command, not only UI');
reset role;
update console_user_roles set revoked_at=now() where user_id='88000000-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok($$select public.pi_working_status()$$,'42501',null,'revoked role cannot read working status');
reset role;
select ok(not has_function_privilege('anon','public.pi_create_product_draft(uuid,jsonb,jsonb)','execute'),'anonymous cannot execute wrapper');
select ok(not has_function_privilege('service_role','public.pi_save_product_draft(uuid,uuid,bigint,jsonb)','execute'),'service role cannot execute application wrapper');
select ok(not has_function_privilege('authenticated','private.pi_save_product_draft(uuid,uuid,bigint,jsonb)','execute'),'private helper remains inaccessible');
select is((select count(*)::int from publish_records),0,'public command family adds no publication');

select * from finish();
rollback;
