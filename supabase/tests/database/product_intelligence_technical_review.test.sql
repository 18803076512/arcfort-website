begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
select plan(90);

create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('87000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at) select pg_temp.id(n), 'technical-' || n || '@example.invalid',now() from generate_series(1,5) n;
insert into console_user_roles(user_id,role) values (pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values (pg_temp.id(10),'tech-test','mig-mag-torch-parts','Synthetic category','mig-mag-torch-parts');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values (pg_temp.id(11),'tech-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  values (pg_temp.id(12),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TH-0007','mig-tip-holder-for-mb15',
  'active','needs_review','needs_photo','unverified','unknown','INGESTED');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  values (pg_temp.id(13),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TS-9999','synthetic-other-subject',
  'draft','needs_review','needs_photo','unverified','unknown','INGESTED');
insert into technical_field_definitions(id,field_key,label,is_critical) values
  (pg_temp.id(20),'thread','Thread',true),(pg_temp.id(21),'overall_length','Length',false);
insert into technical_values(id,external_key,field_definition_id,product_variant_id,value_text,variant_label,source_type,source_level,verification_status)
  values (pg_temp.id(30),'synthetic-original-tip-side',pg_temp.id(20),pg_temp.id(12),'M6','Contact-tip side','catalog','A','NEEDS_FACTORY_CONFIRMATION'),
    (pg_temp.id(31),'synthetic-original-neck-side',pg_temp.id(20),pg_temp.id(12),'M8','Torch-neck side','catalog','A','NEEDS_FACTORY_CONFIRMATION');
insert into evidence_sources(id,external_key,source_type,source_level,title,source_reference,exact_subject,raw_snapshot)
  values (pg_temp.id(40),'synthetic-unbound','test','A','Unbound legacy source','Synthetic source',true,'{"evidence_basis":["drawing"]}');

create temporary table results(label text primary key, result jsonb);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.copy(level text default 'A', value_text text default 'M6') returns jsonb language sql as $$
  select jsonb_build_object('source_level',level,'source_kind',case level when 'A' then 'company_record'
    when 'B' then 'official_manufacturer' when 'C' then 'technical_standard' else 'secondary_reference' end,
    'evidence_basis','drawing','evidence_date','2026-01-01','owner_name','Synthetic source custodian',
    'source_reference','Synthetic drawing TEST-001','source_location','Test page 1, callout 2',
    'revision_label','TEST-rev-1','title','Synthetic technical source','asserted_value',value_text,'asserted_unit','');
$$;
create function pg_temp.add_source(n integer, level text default 'A', value_text text default 'M6', side text default 'Contact-tip side')
returns jsonb language sql as $$
  select private.pi_add_technical_source(pg_temp.id(n),pg_temp.id(12),pg_temp.id(20),side,pg_temp.copy(level,value_text));
$$;
create function pg_temp.links(label text) returns jsonb language sql as $$
  select jsonb_build_array(jsonb_build_object('source_id',result ->> 'source_id','role','supporting')) from results where results.label = links.label;
$$;
create function pg_temp.propose(n integer, evidence jsonb, value_text text default 'M6', side text default 'Contact-tip side')
returns jsonb language sql as $$
  select private.pi_propose_technical_revision(pg_temp.id(n),pg_temp.id(12),pg_temp.id(20),side,
    coalesce((select revision from technical_revision_heads where product_variant_id=pg_temp.id(12)
      and field_definition_id=pg_temp.id(20) and scope_label=side),0),
    jsonb_build_object('value_text',value_text,'unit',''),evidence,'Synthetic proposal reason');
$$;
create function pg_temp.submit(n integer, label text) returns jsonb language sql as $$
  select private.pi_submit_technical_review(pg_temp.id(n),(result ->> 'value_id')::uuid,
    (result ->> 'revision')::bigint,result ->> 'digest') from results where results.label=submit.label;
$$;
create function pg_temp.review(n integer,label text,decision text default 'APPROVE',resolution text default '',replacement jsonb default null,links jsonb default null)
returns jsonb language sql as $$
  select private.pi_review_technical_revision(pg_temp.id(n),(result ->> 'value_id')::uuid,
    (result ->> 'revision')::bigint,result ->> 'digest',decision,'Synthetic human review',resolution,replacement,links)
  from results where results.label=review.label;
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
select throws_ok($$select pg_temp.add_source(100)$$,'55000',null,'technical commands require adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,pilot_variant_ids,actor_id,reason)
  values (pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic SQL review fixture only');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);

select is((select count(*)::int from pg_class where relname in ('technical_revision_heads','technical_revisions','technical_source_bindings') and relrowsecurity and relforcerowsecurity),3,'all review metadata forces RLS');
select ok(not has_table_privilege('authenticated','technical_revisions','insert,update,delete'),'caller cannot write review state directly');
select ok(not has_table_privilege('service_role','technical_source_bindings','insert,update,delete'),'service role cannot rewrite source bindings');
select ok(not has_function_privilege('authenticated','private.pi_submit_technical_review(uuid,uuid,bigint,text)','execute'),'commands not HTTP exposed in this batch');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where relname='pi_effective_technical_values'),'effective view retains caller RLS');

insert into results values ('source-a',pg_temp.add_source(100));
select is(pg_temp.add_source(100),(select result from results where label='source-a'),'source retry returns exact receipt');
select throws_ok($$select pg_temp.add_source(100,'A','M8')$$,'40001',null,'source request cannot change payload');
select throws_ok($$select private.pi_add_technical_source(pg_temp.id(101),pg_temp.id(12),pg_temp.id(20),'Contact-tip side',pg_temp.copy() || '{"confirmed_by":"forged"}')$$,'22023',null,'source rejects forged attribution');
select throws_ok($$select private.pi_add_technical_source(pg_temp.id(102),pg_temp.id(12),pg_temp.id(20),'Contact-tip side',pg_temp.copy() || '{"evidence_date":"2099-01-01"}')$$,'22023',null,'future source date denied');
select throws_ok($$select private.pi_add_technical_source(pg_temp.id(103),pg_temp.id(12),pg_temp.id(20),'Contact-tip side',pg_temp.copy() || '{"evidence_date":"2026-02-30"}')$$,'22023',null,'invalid source date denied');
select throws_ok($$select private.pi_add_technical_source(pg_temp.id(104),pg_temp.id(12),pg_temp.id(20),'Contact-tip side',pg_temp.copy() || '{"source_kind":"secondary_reference"}')$$,'22023',null,'secondary source cannot claim Level A');
select throws_ok($$select private.pi_add_technical_source(pg_temp.id(105),pg_temp.id(99),pg_temp.id(20),'',pg_temp.copy())$$,'55000',null,'non-pilot subject denied');
insert into results values ('source-side',pg_temp.add_source(106,'A','M6','Torch-neck side')),
  ('source-d',pg_temp.add_source(107,'D')),
  ('source-wrong-value',pg_temp.add_source(108,'A','M9')),
  ('source-b',pg_temp.add_source(109,'B')),
  ('source-c',pg_temp.add_source(110,'C'));
insert into results values ('other-sku-source',private.pi_add_technical_source(pg_temp.id(111),pg_temp.id(13),pg_temp.id(20),'Contact-tip side',pg_temp.copy())),
  ('other-field-source',private.pi_add_technical_source(pg_temp.id(112),pg_temp.id(12),pg_temp.id(21),'Contact-tip side',pg_temp.copy()));
select throws_ok($$select pg_temp.propose(113,pg_temp.links('other-sku-source'))$$,'22023',null,'same-looking value from another SKU is rejected');
select throws_ok($$select pg_temp.propose(114,pg_temp.links('other-field-source'))$$,'22023',null,'same SKU but different field evidence is rejected');
select throws_ok($$select pg_temp.propose(200,pg_temp.links('source-side'))$$,'22023',null,'other connection-side evidence cannot cross scope');
select is((select count(*)::int from technical_values),2,'wrong evidence causes no partial proposal');
select throws_ok($$select pg_temp.propose(201,jsonb_build_array(jsonb_build_object('source_id',pg_temp.id(999),'role','supporting')))$$,'22023',null,'missing evidence source rolls back');
select throws_ok($$select pg_temp.propose(202,pg_temp.links('source-a') || pg_temp.links('source-a'))$$,'22023',null,'duplicate source links rejected');

select pg_temp.actor(2);
insert into results values ('missing',pg_temp.propose(203,'[]'));
select is((select verification_status::text from technical_values where id=(select (result ->> 'value_id')::uuid from results where label='missing')),'NEEDS_FACTORY_CONFIRMATION','missing evidence remains unconfirmed');
select is((select current_value_id from technical_revision_heads where scope_label='Contact-tip side'),pg_temp.id(30),'proposal preserves original current value');
select is((select count(*)::int from verification_events),0,'proposal creates no fake human decision');
insert into results values ('missing-pending',pg_temp.submit(204,'missing'));
select is(pg_temp.submit(204,'missing'),(select result from results where label='missing-pending'),'submit retry is idempotent');
select throws_ok($$select pg_temp.review(205,'missing-pending')$$,'42501',null,'editor cannot approve');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(205,'missing-pending')$$,'23514',null,'missing evidence cannot approve');
select is((select count(*)::int from verification_events),0,'failed approval leaves no event');
select throws_ok($$select pg_temp.review(206,'missing-pending','EDIT','','{"value_text":"M6","unit":""}', '[{"source_id":"87000000-0000-4000-8000-000000000999","role":"supporting"}]')$$,'22023',null,'bad edit rolls back decision and revision together');
select is((select review_state from technical_revisions where value_id=(select (result ->> 'value_id')::uuid from results where label='missing')),'pending','failed edit preserves pending state');
select is((select count(*)::int from verification_events),0,'failed edit creates no event');
insert into results values ('edited',pg_temp.review(207,'missing-pending','EDIT','','{"value_text":"M6","unit":""}',pg_temp.links('source-a')));
select is((select verification_status::text from technical_values where id=(select (result ->> 'value_id')::uuid from results where label='edited')),'NEEDS_FACTORY_CONFIRMATION','review EDIT creates a new unconfirmed proposal');
select is((select decision::text from verification_events),'EDIT','EDIT is an explicit immutable decision');
select is((select count(*)::int from pi_effective_technical_values),3,'superseded proposal excluded; original two sides and new candidate retained');
select throws_ok($$select pg_temp.review(208,'missing-pending')$$,'40001',null,'superseded pending review cannot approve');
insert into results values ('edited-pending',pg_temp.submit(209,'edited'));
select lives_ok($$select pg_temp.review(210,'edited-pending')$$,'explicit approve with exact bound Level A succeeds');
select lives_ok($$select pg_temp.review(210,'edited-pending')$$,'approval retry returns receipt');
select throws_ok($$select pg_temp.review(210,'edited-pending','REJECT')$$,'40001',null,'decision cannot change under an approval receipt');
select is((select count(*)::int from verification_events),2,'duplicate approval adds no event');
select is((select confirmed_by from technical_values where id=(select (result ->> 'value_id')::uuid from results where label='edited')),pg_temp.id(3),'reviewer attribution is server derived');
select is((select verification_status::text from technical_values where id=pg_temp.id(30)),'NEEDS_FACTORY_CONFIRMATION','original catalog status remains unchanged');
select is((select count(*)::int from pi_effective_technical_values),2,'approved replacement supersedes original in effective data only');
select is((select confirmed_technical_count from pi_variant_readiness where id=pg_temp.id(12)),1,'readiness counts current confirmed value');

select pg_temp.actor(1);
insert into results values ('conflict',pg_temp.propose(211,pg_temp.links('source-wrong-value'),'M9'));
select is((select verification_status::text from technical_values where id=(select (result ->> 'value_id')::uuid from results where label='conflict')),'DATA_CONFLICT','different value creates an explicit conflict');
select is((select confirmed_technical_count from pi_variant_readiness where id=pg_temp.id(12)),1,'pending replacement does not erase current confirmation');
select is((select technical_conflict_count from pi_variant_readiness where id=pg_temp.id(12)),1,'pending conflict is a readiness blocker');
insert into results values ('conflict-pending',pg_temp.submit(212,'conflict'));
select throws_ok($$select pg_temp.review(213,'conflict-pending')$$,'22023',null,'conflict needs explicit human resolution reason');
select lives_ok($$select pg_temp.review(214,'conflict-pending','APPROVE','Synthetic exact-item drawing resolves the discrepancy')$$,'exact Level A and reason can resolve conflict');
select is((select confirmed_technical_count from pi_variant_readiness where id=pg_temp.id(12)),1,'historical confirmed revision does not double count');
select is((select technical_conflict_count from pi_variant_readiness where id=pg_temp.id(12)),0,'resolved conflict remains historical, not a current blocker');

insert into results values ('secondary',pg_temp.propose(215,pg_temp.links('source-d'),'M6'));
insert into results values ('secondary-pending',pg_temp.submit(216,'secondary'));
select throws_ok($$select pg_temp.review(217,'secondary-pending','APPROVE','A reason cannot replace evidence')$$,'23514',null,'Level D cannot confirm even with resolution prose');
select lives_ok($$select pg_temp.review(218,'secondary-pending','REJECT')$$,'human reject succeeds');
select is((select technical_conflict_count from pi_variant_readiness where id=pg_temp.id(12)),0,'rejected conflict no longer feeds readiness');
select is((select count(*)::int from technical_revisions where review_state='rejected'),1,'rejected evidence stays inspectable');
select throws_ok($$select pg_temp.review(219,'secondary-pending')$$,'40001',null,'rejected candidate cannot later be approved');
insert into results values ('unbound',pg_temp.propose(220,jsonb_build_array(jsonb_build_object('source_id',pg_temp.id(40),'role','supporting')),'M9'));
insert into results values ('unbound-pending',pg_temp.submit(221,'unbound'));
select throws_ok($$select pg_temp.review(222,'unbound-pending')$$,'23514',null,'generic exact_subject flag alone cannot qualify');
select pg_temp.review(223,'unbound-pending','REJECT');
insert into results values ('wrong-value',pg_temp.propose(224,pg_temp.links('source-a'),'M9'));
insert into results values ('wrong-value-pending',pg_temp.submit(225,'wrong-value'));
select throws_ok($$select pg_temp.review(226,'wrong-value-pending','APPROVE','Synthetic resolution')$$,'23514',null,'same SKU/field evidence asserting another value cannot approve');
select pg_temp.review(227,'wrong-value-pending','REJECT');

-- Stale submitted evidence fails even if an operational actor changes it outside the command path.
insert into results values ('stale-source',pg_temp.propose(228,pg_temp.links('source-d'),'M6'));
insert into results values ('stale-source-pending',pg_temp.submit(229,'stale-source'));
select private.pi_technical_capability();
update evidence_sources set title='Synthetic changed revision' where id=(select (result ->> 'source_id')::uuid from results where label='source-d');
delete from private.pi_mutation_context;
select throws_ok($$select pg_temp.review(230,'stale-source-pending','REJECT')$$,'40001',null,'evidence drift invalidates even a stale reject');
select private.pi_technical_capability();
update evidence_sources set title='Synthetic technical source' where id=(select (result ->> 'source_id')::uuid from results where label='source-d');
delete from private.pi_mutation_context;
select pg_temp.review(231,'stale-source-pending','REJECT');
select throws_ok($$select private.pi_propose_technical_revision(pg_temp.id(232),pg_temp.id(12),pg_temp.id(20),'Contact-tip side',0,'{"value_text":"M6","unit":""}','[]','Synthetic stale proposal')$$,'40001',null,'stale proposal revision fails');

select pg_temp.actor(4);
select throws_ok($$select pg_temp.propose(233,'[]')$$,'42501',null,'viewer cannot propose');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.add_source(234)$$,'42501',null,'publisher cannot add technical evidence');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.propose(235,'[]')$$,'42501',null,'reviewer must use explicit review EDIT');
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(3);
select throws_ok($$select pg_temp.review(210,'edited-pending')$$,'42501',null,'revoked reviewer cannot replay approval receipt');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.add_source(236)$$,'42501',null,'service JWT cannot impersonate owner');
select set_config('request.jwt.claim.role','authenticated',true);
select is((select count(*)::int from private.pi_mutation_context),0,'all failed/successful commands clear capabilities');
select throws_ok($$update technical_values set value_text='bypass'$$,'55000',null,'direct technical write remains frozen');
select throws_ok($$update technical_source_bindings set scope_label='other'$$,'55000',null,'source binding cannot be rewritten');
select throws_ok($$update technical_revisions set review_state='approved'$$,'55000',null,'direct review-state bypass denied');
select is((select count(*)::int from publish_records),0,'review commands never publish');
select is((select lifecycle_state::text from product_variants where id=pg_temp.id(12)),'INGESTED','review does not advance product lifecycle');

insert into results values ('oem-source',pg_temp.add_source(300,'B','7','Cylindrical'));
insert into results values ('oem-proposal',pg_temp.propose(301,pg_temp.links('oem-source'),'7','Cylindrical'));
select is((select verification_status::text from technical_values where id=(select (result ->> 'value_id')::uuid from results where label='oem-proposal')),'OEM_REFERENCE','bounded official manufacturer source retains reference classification');
select ok((select current_value_id is null from technical_revision_heads where scope_label='Cylindrical'),'new scoped field has no current value before approval');
select ok((select unresolved_technical_count >= 2 from pi_variant_readiness where id=pg_temp.id(12)),'pending official reference is still a review blocker');
insert into results values ('oem-pending',pg_temp.submit(302,'oem-proposal'));
select throws_ok($$select pg_temp.review(303,'oem-pending')$$,'23514',null,'official reference cannot be promoted without Level A');
select pg_temp.review(304,'oem-pending','REJECT');
select is((select count(*)::int from pi_effective_technical_values where variant_label='Cylindrical'),0,'rejected first revision cannot become an implicit current value');
insert into results values ('standard-source',pg_temp.add_source(305,'C','8','Conical'));
insert into results values ('standard-proposal',pg_temp.propose(306,pg_temp.links('standard-source'),'8','Conical'));
select is((select verification_status::text from technical_values where id=(select (result ->> 'value_id')::uuid from results where label='standard-proposal')),'STANDARD_REFERENCE','bounded standard source retains reference classification');
select throws_ok($$select pg_temp.propose(307,pg_temp.links('standard-source'),'8','Cylindrical')$$,'22023',null,'profile labels cannot share exact-value evidence');
select lives_ok($$select pg_temp.propose(308,pg_temp.links('standard-source'),'8','Conical')$$,'a nonconflicting unsent proposal may be revised');
select throws_ok($$select pg_temp.submit(309,'standard-proposal')$$,'40001',null,'superseded draft cannot be submitted');

insert into results values ('edit-conflict',pg_temp.propose(310,pg_temp.links('source-a'),'M6'));
select throws_ok($$select pg_temp.propose(311,pg_temp.links('source-wrong-value'),'M9')$$,'55000',null,'ordinary save cannot silently discard an unresolved conflict');
insert into results values ('edit-conflict-pending',pg_temp.submit(312,'edit-conflict'));
insert into results values ('edit-conflict-replacement',pg_temp.review(313,'edit-conflict-pending','EDIT','','{"value_text":"M9","unit":""}',pg_temp.links('source-wrong-value')));
select is((select verification_status::text from technical_values where id=(select (result ->> 'value_id')::uuid from results where label='edit-conflict-replacement')),'DATA_CONFLICT','EDIT carries conflict forward even when replacement matches current value');

-- A forged EDIT event is not an exact APPROVE. Only a test administrator can install this capability.
select private.pi_technical_capability();
insert into verification_events(entity_type,entity_id,decision,reason,actor_id)
  select 'technical_value',(result ->> 'value_id')::uuid,'EDIT','Synthetic bypass probe',pg_temp.id(1)
  from results where label='edit-conflict-replacement';
select throws_ok($$update technical_values set verification_status='CONFIRMED' where id=(select (result ->> 'value_id')::uuid from results where label='edit-conflict-replacement')$$,'23514',null,'timestamp-matching EDIT event cannot bypass exact approval guard');
delete from private.pi_mutation_context;
insert into results values ('edit-conflict-replacement-pending',pg_temp.submit(314,'edit-conflict-replacement'));
select throws_ok($$select pg_temp.review(315,'edit-conflict-replacement-pending')$$,'22023',null,'inherited conflict still needs human resolution');
select pg_temp.review(316,'edit-conflict-replacement-pending','REJECT');

select set_config('TimeZone','Asia/Shanghai',true);
select ok(private.pi_technical_source_matches((select (result ->> 'source_id')::uuid from results where label='source-a'),
  (select (result ->> 'value_id')::uuid from results where label='edited')),'source digest is stable across session time zones');
select set_config('TimeZone','UTC',true);
select ok(not has_table_privilege('anon','pi_effective_technical_values','select'),'anonymous client cannot read effective technical facts');
select throws_ok($$select private.pi_propose_technical_revision(pg_temp.id(317),pg_temp.id(12),pg_temp.id(21),'',0,'{"value_text":"4","unit":"mm","verification_status":"CONFIRMED"}','[]','Synthetic forged status')$$,'22023',null,'technical value payload cannot self-confirm');
select is((select count(*)::int from technical_revision_heads where field_definition_id=pg_temp.id(21)),0,'invalid new field leaves no orphan head');
select is((select value_text from technical_values where id=pg_temp.id(31)),'M8','the other original connection side is unchanged');
insert into results values ('wrong-unit',private.pi_propose_technical_revision(pg_temp.id(318),pg_temp.id(12),pg_temp.id(20),
  'Contact-tip side',(select revision from technical_revision_heads where root_value_id=pg_temp.id(30)),
  '{"value_text":"M9","unit":"mm"}',pg_temp.links('source-wrong-value'),'Synthetic unit mismatch'));
insert into results values ('wrong-unit-pending',pg_temp.submit(319,'wrong-unit'));
select throws_ok($$select pg_temp.review(320,'wrong-unit-pending','APPROVE','Synthetic unit review')$$,'23514',null,'exact evidence must match unit as well as value');
select pg_temp.review(321,'wrong-unit-pending','REJECT');
select is((select count(*)::int from private.pi_mutation_context),0,'additional negative controls leave no capability');

-- Read-only client role can inspect safe relational history but cannot see another role's grants.
set local role authenticated;
select ok(exists(select 1 from technical_revision_heads where root_value_id=pg_temp.id(30)),'authorized operator can read working lineage');
reset role;
select pg_temp.actor(4);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(4);
set local role authenticated;
select is((select count(*)::int from pi_effective_technical_values),0,'revoked reader cannot read effective data');
reset role;

select * from finish();
rollback;
