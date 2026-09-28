begin;
create extension if not exists pgtap with schema extensions;
set search_path=extensions,public;
select plan(31);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('9c000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'compat-command-' || n || '@example.invalid',now() from generate_series(1,5) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'compat-command-category','synthetic-compat-command','Synthetic category','synthetic-compat-command');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'compat-command-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  values(pg_temp.id(12),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-0012','synthetic-compat-command',
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED');
insert into compatibility_entities(id,external_key,entity_type,label)
  values(pg_temp.id(30),'compat-command-target','torch','Synthetic torch');
create temporary table results(label text primary key,result jsonb);
grant all on results to authenticated;
create function pg_temp.entity() returns uuid language sql as $$
  select (result ->> 'entity_id')::uuid from results where label='entity';
$$;
create function pg_temp.copy() returns jsonb language sql as $$
  select '{"role":"Tip holder","confirmation_requirements":["Exact assembly drawing"]}'::jsonb;
$$;
create function pg_temp.links() returns jsonb language sql as $$
  select jsonb_build_array(jsonb_build_object('source_id',result ->> 'source_id','role','supporting'))
  from results where label='source';
$$;
create function pg_temp.submit(n integer,label text) returns jsonb language sql as $$
  select public.pi_submit_compatibility_review(pg_temp.id(n),(result ->> 'relationship_id')::uuid,
    (result ->> 'revision')::bigint,result ->> 'digest') from results where results.label=submit.label;
$$;
create function pg_temp.review(n integer,label text,decision text) returns jsonb language sql as $$
  select public.pi_review_compatibility_revision(pg_temp.id(n),(result ->> 'relationship_id')::uuid,
    (result ->> 'revision')::bigint,result ->> 'digest',decision,'Synthetic wrapper decision','',
    case when decision='EDIT' then pg_temp.copy() else null end,
    case when decision='EDIT' then pg_temp.links() else null end) from results where results.label=review.label;
$$;
create temporary table signatures(signature text);
insert into signatures values
  ('pi_ensure_product_compatibility_entity(uuid,uuid)'),
  ('pi_add_compatibility_source(uuid,uuid,uuid,text,text,text,jsonb)'),
  ('pi_propose_compatibility_revision(uuid,uuid,uuid,text,text,bigint,jsonb,jsonb,text,uuid)'),
  ('pi_submit_compatibility_review(uuid,uuid,bigint,text)'),
  ('pi_review_compatibility_revision(uuid,uuid,bigint,text,text,text,text,jsonb,jsonb)');
select ok((select bool_and(has_function_privilege('authenticated','public.' || signature,'execute')) from signatures),'authenticated has each narrow wrapper');
select ok((select bool_and(not has_function_privilege('anon','public.' || signature,'execute')) from signatures),'anonymous has no wrapper grants');
select ok((select bool_and(not has_function_privilege('service_role','public.' || signature,'execute')) from signatures),'service has no wrapper grants');
select ok((select bool_and(not has_function_privilege('authenticated',p.oid,'execute')) from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname like '%compatibility%'),'private commands remain unavailable directly');
select ok((select bool_and(p.prosecdef and p.proconfig @> array['search_path=""']) from pg_proc p
  where p.oid in (select ('public.' || signature)::regprocedure from signatures)),'wrappers pin search path');

select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
set local role authenticated;
select throws_ok($$select public.pi_ensure_product_compatibility_entity(pg_temp.id(100),pg_temp.id(12))$$,'55000',null,'wrapper cannot skip adoption');
reset role;
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,
  pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic wrapper test');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
select pg_temp.actor(4);
set local role authenticated;
select throws_ok($$select public.pi_ensure_product_compatibility_entity(pg_temp.id(100),pg_temp.id(12))$$,'42501',null,'viewer wrapper denied');
reset role;
select pg_temp.actor(1);
set local role anon;
select throws_ok($$select public.pi_ensure_product_compatibility_entity(pg_temp.id(100),pg_temp.id(12))$$,'42501',null,'anonymous execution denied even with owner subject');
reset role;
set local role service_role;
select throws_ok($$select public.pi_ensure_product_compatibility_entity(pg_temp.id(100),pg_temp.id(12))$$,'42501',null,'service execution denied even with owner subject');
reset role;
select pg_temp.actor(5);
set local role authenticated;
select throws_ok($$select public.pi_ensure_product_compatibility_entity(pg_temp.id(100),pg_temp.id(12))$$,'42501',null,'unprivileged authenticated wrapper denied');
select pg_temp.actor(2);
select lives_ok($$insert into results values('entity',public.pi_ensure_product_compatibility_entity(pg_temp.id(100),pg_temp.id(12)))$$,'editor creates exact product identity through wrapper');
select is((select product_variant_id from compatibility_entities where id=pg_temp.entity()),pg_temp.id(12),'wrapper identity matches exact SKU');
select lives_ok($$insert into results values('source',public.pi_add_compatibility_source(pg_temp.id(101),pg_temp.entity(),pg_temp.id(30),
  'product_to_torch','Standard assembly','Tip holder',
  '{"source_kind":"company_record","source_level":"A","title":"Synthetic drawing","source_reference":"TEST-1","assertion":"supports",
    "evidence_basis":"drawing","evidence_date":"2026-01-01","owner_name":"Synthetic custodian","revision_label":"R1","source_location":"Callout 1"}'))$$,
  'editor saves bound evidence through wrapper');
select is((select count(*)::int from verification_events),0,'source intake creates no approval');
select lives_ok($$insert into results values('proposal',public.pi_propose_compatibility_revision(pg_temp.id(102),pg_temp.entity(),pg_temp.id(30),
  'product_to_torch','Standard assembly',0,pg_temp.copy(),pg_temp.links(),'Synthetic wrapper proposal'))$$,'omitted root creates a new proposal');
select is((select current_relationship_id from compatibility_revision_heads),null::uuid,'new wrapper proposal has no implicit current');
select throws_ok($$select public.pi_propose_compatibility_revision(pg_temp.id(103),pg_temp.entity(),pg_temp.id(30),'product_to_torch',
  'Standard assembly',0,pg_temp.copy(),pg_temp.links(),'Synthetic wrapper proposal',(select (result ->> 'root_relationship_id')::uuid from results where label='proposal'))$$,
  '40001',null,'stale root revision rejected through wrapper');
select lives_ok($$insert into results values('pending',pg_temp.submit(104,'proposal'))$$,'editor submits exact proposal');
select throws_ok($$select public.pi_propose_compatibility_revision(pg_temp.id(105),pg_temp.entity(),pg_temp.id(30),'product_to_torch',
  'Standard assembly',2,pg_temp.copy(),pg_temp.links(),'Synthetic wrapper proposal',(select (result ->> 'root_relationship_id')::uuid from results where label='proposal'))$$,
  '55000',null,'pending proposal cannot be overwritten');
select throws_ok($$select pg_temp.review(106,'pending','APPROVE')$$,'42501',null,'editor cannot approve through wrapper');
select pg_temp.actor(3);
select lives_ok($$insert into results values('edited',pg_temp.review(107,'pending','EDIT'))$$,'reviewer EDIT appends successor through wrapper');
select is((select review_state from compatibility_revisions where relationship_id=(select (result ->> 'relationship_id')::uuid from results where label='proposal')),
  'superseded','wrapper EDIT retains prior revision');
select lives_ok($$insert into results values('edited-pending',pg_temp.submit(108,'edited'))$$,'reviewer submits edited candidate');
select lives_ok($$insert into results values('approved',pg_temp.review(109,'edited-pending','APPROVE'))$$,'explicit exact evidence approval through wrapper');
select is((select confirmed_by from compatibility_relationships where id=(select (result ->> 'relationship_id')::uuid from results where label='edited')),
  pg_temp.id(3),'wrapper approval attributed to current reviewer');
select is(pg_temp.review(109,'edited-pending','APPROVE'),(select result from results where label='approved'),'wrapper retry returns same decision receipt');
select pg_temp.actor(1);
insert into results values('second',public.pi_propose_compatibility_revision(pg_temp.id(110),pg_temp.entity(),pg_temp.id(30),'product_to_torch',
  'Standard assembly',5,pg_temp.copy(),pg_temp.links(),'Synthetic wrapper replacement',(select (result ->> 'root_relationship_id')::uuid from results where label='proposal')));
insert into results values('second-pending',pg_temp.submit(111,'second'));
select lives_ok($$select pg_temp.review(112,'second-pending','REJECT')$$,'owner can reject replacement through wrapper');
select is((select current_relationship_id from compatibility_revision_heads),(select (result ->> 'relationship_id')::uuid from results where label='edited'),
  'rejected replacement keeps previous current approval');
reset role;
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(3);
select pg_temp.actor(3);
set local role authenticated;
select throws_ok($$select pg_temp.review(109,'edited-pending','APPROVE')$$,'42501',null,'revoked reviewer cannot replay wrapper approval');
reset role;
select is((select count(*)::int from private.pi_mutation_context),0,'wrapper commands leave no mutation capability');
select is((select count(*)::int from publish_records),0,'compatibility command wrappers do not publish');
select * from finish();
rollback;
