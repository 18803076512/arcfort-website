begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions,public;
set local timezone = 'UTC';
select plan(52);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('a4000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'packaging-command-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'packaging-command-category','synthetic-packaging-command','Synthetic category','synthetic-packaging-command');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'packaging-command-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),'synthetic-packaging-command-' || n,
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED' from generate_series(12,15) n;
insert into evidence_sources(id,external_key,source_type,source_level,title,source_reference)
  values(pg_temp.id(40),'packaging-command-legacy','manufacturer','B','Synthetic legacy','TEST-ONLY source');
insert into packaging_records(id,external_key,product_variant_id,package_description,quantity,quantity_unit,moq_note,lead_time_note,source_level,verification_status,evidence_source_id)
  values(pg_temp.id(41),'packaging-command-original',pg_temp.id(12),'TEST-ONLY bag',null,null,'Preserved MOQ','Preserved lead time','B','OEM_REFERENCE',pg_temp.id(40));
create temporary table original_rows as select to_jsonb(t) original from packaging_records t where id=pg_temp.id(41);
create temporary table results(label text primary key,result jsonb);
grant select,insert on results to authenticated;
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.r(label text) returns jsonb language sql as $$ select result from results where results.label=r.label; $$;
create function pg_temp.source(n integer,level text default 'B',assertion text default 'reference_only',basis text default 'manufacturer_catalog')
returns jsonb language sql as $$
  select public.pi_add_packaging_source(pg_temp.id(n),pg_temp.id(12),'{"package_description":"TEST-ONLY bag","quantity":10,"quantity_unit":"pieces"}',jsonb_build_object(
    'source_level',level,'source_kind',case level when 'A' then 'company_record' else 'official_manufacturer' end,
    'assertion',assertion,'evidence_basis',basis,'evidence_date','2026-01-01','owner_name','Synthetic custodian',
    'source_reference','TEST-ONLY source','source_location','Synthetic page 1','revision_label','QA-1','title','Synthetic source'),pg_temp.id(41));
$$;
create function pg_temp.propose(n integer,revision bigint default 0,head uuid default null) returns jsonb language sql as $$
  select public.pi_propose_packaging_revision(pg_temp.id(n),pg_temp.id(12),0,revision,
    '{"package_description":"TEST-ONLY bag","quantity":10,"quantity_unit":"pieces"}',
    array[(pg_temp.r('official')->>'source_id')::uuid],'Synthetic proposal only',head,pg_temp.id(41));
$$;
create function pg_temp.submit(n integer,label text) returns jsonb language sql as $$
  select public.pi_submit_packaging_revision(pg_temp.id(n),(pg_temp.r(label)->>'revision_id')::uuid,
    (pg_temp.r(label)->>'revision')::bigint,pg_temp.r(label)->>'digest');
$$;
create function pg_temp.review(n integer,label text,decision text default 'APPROVE',status public.pi_verification_status default 'OEM_REFERENCE')
returns jsonb language sql as $$
  select public.pi_review_packaging_revision(pg_temp.id(n),(pg_temp.r(label)->>'revision_id')::uuid,
    (pg_temp.r(label)->>'revision')::bigint,pg_temp.r(label)->>'digest',decision,'Synthetic human decision only',status,
    case when decision='APPROVE' then jsonb_build_object('source_checked',true,'packaging_checked',true,
      'commercial_terms_unchanged',true,'arcfort_packaging_confirmed',status='CONFIRMED') else '{}' end,
    case when decision='APPROVE' then (pg_temp.r('official')->>'source_id')::uuid else null end,'',null);
$$;
select ok(has_function_privilege('authenticated','public.pi_add_packaging_source(uuid,uuid,jsonb,jsonb,uuid)','execute'),'source wrapper granted only to authenticated');
select ok(has_function_privilege('authenticated','public.pi_propose_packaging_revision(uuid,uuid,integer,bigint,jsonb,uuid[],text,uuid,uuid)','execute'),'proposal wrapper granted');
select ok(has_function_privilege('authenticated','public.pi_submit_packaging_revision(uuid,uuid,bigint,text)','execute'),'submit wrapper granted');
select ok(has_function_privilege('authenticated','public.pi_review_packaging_revision(uuid,uuid,bigint,text,text,text,public.pi_verification_status,jsonb,uuid,text,jsonb)','execute'),'review wrapper granted');
select ok(not has_function_privilege('anon','public.pi_add_packaging_source(uuid,uuid,jsonb,jsonb,uuid)','execute'),'anonymous has no wrapper grant');
select ok(not has_function_privilege('service_role','public.pi_review_packaging_revision(uuid,uuid,bigint,text,text,text,public.pi_verification_status,jsonb,uuid,text,jsonb)','execute'),'service has no review grant');
select ok(not has_function_privilege('authenticated','private.pi_add_packaging_source(uuid,uuid,jsonb,jsonb,uuid)','execute'),'private implementation inaccessible');
select ok(not has_table_privilege('authenticated','packaging_revisions','insert,update,delete'),'no direct mutation grant');
select ok(not has_table_privilege('anon','pi_packaging_source_states','select'),'source states private');
select ok(not has_table_privilege('service_role','pi_packaging_revision_states','select'),'revision states private');
select ok((select bool_and('security_invoker=true'=any(reloptions)) from pg_class where relname in ('pi_packaging_source_states','pi_packaging_revision_states')),'both views invoker scoped');
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
select throws_ok($$select pg_temp.source(60)$$,'55000',null,'source wrapper requires adopted authority');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,
  pilot_variant_ids,actor_id,reason) values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic isolated OEM commands');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
set local role authenticated;
select pg_temp.actor(6);
select throws_ok($$select pg_temp.source(60)$$,'42501',null,'unassigned authenticated source denied');
select is((select count(*)::int from pi_packaging_source_states),0,'unassigned source view empty');
select is((select count(*)::int from pi_packaging_revision_states),0,'unassigned revision view empty');
select ok(not pi_packaging_source_current(pg_temp.id(40)),'unassigned helper hides source');
select ok(not pi_packaging_revision_fresh(pg_temp.id(40)),'unassigned helper hides revision');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.source(60)$$,'42501',null,'viewer cannot intake');
select throws_ok($$select pg_temp.propose(100)$$,'42501',null,'viewer cannot propose');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.source(60)$$,'42501',null,'publisher cannot intake');
select pg_temp.actor(3);
insert into results values('official',pg_temp.source(60));
select is(pg_temp.source(60),pg_temp.r('official'),'source receipt exact replay');
select ok(pi_packaging_source_current((pg_temp.r('official')->>'source_id')::uuid),'current source identity read');
select is((select source_level from pi_packaging_source_states),'B','source level retained');
select is((select assertion from pi_packaging_source_states),'reference_only','source assertion retained');
select throws_ok($$select pg_temp.propose(100)$$,'42501',null,'reviewer cannot propose');
select pg_temp.actor(2);
insert into results values('first',pg_temp.propose(100));
select is(pg_temp.propose(100),pg_temp.r('first'),'proposal receipt exact replay');
select is((select count(*)::int from pi_packaging_revision_states),1,'latest read one exact head');
select is((select original_packaging_id from pi_packaging_revision_states),pg_temp.id(41),'explicit imported lineage retained');
select is((select review_state from pi_packaging_revision_states),'proposed','proposal never automatically approved');
select ok(pi_packaging_revision_fresh((pg_temp.r('first')->>'revision_id')::uuid),'proposal helper fresh');
select pg_temp.actor(3);
insert into results values('pending',pg_temp.submit(101,'first'));
select is((select review_state from pi_packaging_revision_states),'pending','reviewer can freeze proposal');
select pg_temp.actor(2);
select throws_ok($$select pg_temp.review(102,'pending')$$,'42501',null,'editor cannot approve');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(102,'pending',status=>'CONFIRMED')$$,'23514',null,'official reference cannot confirm ArcFort SKU');
insert into results values('approved',pg_temp.review(102,'pending'));
select is((select verification_status::text from pi_effective_packaging_records where packaging_origin='current'),'OEM_REFERENCE','human approval remains reference only');
select ok((select review_valid from pi_effective_packaging_records where packaging_origin='current'),'current review valid');
select ok((select not publication_ready from pi_effective_packaging_records where packaging_origin='current'),'current is not publication');
select is((select count(*)::int from packaging_revision_decisions),1,'one immutable human decision');
select is((select count(*)::int from verification_events where entity_type='packaging_revision'),1,'one human audit event');
select is(pg_temp.review(102,'pending'),pg_temp.r('approved'),'review receipt replays without duplicate');
select pg_temp.actor(2);
insert into results values('next',pg_temp.propose(103,1,(pg_temp.r('first')->>'head_id')::uuid));
insert into results values('nextpending',pg_temp.submit(104,'next'));
select pg_temp.actor(3);
insert into results values('rejected',pg_temp.review(105,'nextpending','REJECT',null));
select is((select revision_id from packaging_revision_currents),(pg_temp.r('first')->>'revision_id')::uuid,'rejection retains preceding current');
select is((select review_state from pi_packaging_revision_states),'rejected','latest rejected history retained');
reset role;
select pg_temp.actor(1);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(3);
set local role authenticated;
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(102,'pending')$$,'42501',null,'revocation denies receipt replay');
select is((select count(*)::int from pi_packaging_revision_states),0,'revocation denies current read');
select ok(not pi_packaging_revision_fresh((pg_temp.r('first')->>'revision_id')::uuid),'revocation denies freshness oracle');
select pg_temp.actor(1);
select ok(pi_packaging_approval_valid((pg_temp.r('first')->>'revision_id')::uuid),'historical approval survives reviewer revocation');
reset role;
select is((select to_jsonb(t) from packaging_records t where id=pg_temp.id(41)),(select original from original_rows),'full original row unchanged');
select is((select count(*)::int from compatibility_relationships),0,'OEM approval creates no fitment');
select is((select count(*)::int from publish_records),0,'OEM approval publishes nothing');
set local role authenticated;
select pg_temp.actor(1);
insert into results values('conflict',pg_temp.source(70,'A','contradicts','packaging_record'));
select is((select conflict_source_ids from pi_packaging_revision_states),array[(pg_temp.r('conflict')->>'source_id')::uuid],'omitted conflict appears in counted read state');
select ok(not pi_packaging_revision_fresh((pg_temp.r('first')->>'revision_id')::uuid),'late conflict invalidates freshness helper');
select is((select quantity from pi_packaging_source_states where evidence_source_id=(pg_temp.r('official')->>'source_id')::uuid),10,'source physical quantity retained');
select is((select original_packaging_id from pi_packaging_source_states where evidence_source_id=(pg_temp.r('official')->>'source_id')::uuid),pg_temp.id(41),'source lineage retained');
reset role;
select * from finish();
rollback;
