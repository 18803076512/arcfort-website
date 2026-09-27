begin;
create extension if not exists pgtap with schema extensions;
set search_path=extensions,public;
set local timezone='UTC';
select plan(92);

create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('8a000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'compat-review-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'compat-review-category','synthetic-compat-review','Synthetic category','synthetic-compat-review');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'compat-review-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),'synthetic-review-' || n,
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED' from generate_series(12,14) n;
insert into compatibility_entities(id,external_key,entity_type,label,product_variant_id) values
  (pg_temp.id(20),'review-subject','product','Synthetic SKU 12',pg_temp.id(12)),
  (pg_temp.id(21),'review-other-subject','product','Synthetic SKU 13',pg_temp.id(13));
insert into compatibility_entities(id,external_key,entity_type,label) values
  (pg_temp.id(30),'review-torch','torch','Synthetic torch A'),
  (pg_temp.id(31),'review-other-torch','torch','Synthetic torch B');
insert into compatibility_relationships(id,external_key,subject_entity_id,target_entity_id,relationship_type,role,
  relationship_status,source_type,source_level,verification_status,confirmation_requirements)
  values(pg_temp.id(40),'review-original',pg_temp.id(20),pg_temp.id(30),'product_to_torch','Tip holder',
    'reference_only','company_catalog','A','NEEDS_FACTORY_CONFIRMATION',array['Exact assembly drawing']);
insert into evidence_sources(id,external_key,source_type,source_level,title,source_reference,exact_subject,raw_snapshot)
  values(pg_temp.id(41),'review-unbound','company_record','A','Synthetic generic evidence','Synthetic reference',true,
    '{"evidence_basis":["drawing"]}');
create temporary table original_relationship as select to_jsonb(r) value from compatibility_relationships r;
create temporary table results(label text primary key,result jsonb);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.copy(role text default 'Tip holder') returns jsonb language sql as $$
  select jsonb_build_object('role',role,'confirmation_requirements',jsonb_build_array('Exact assembly drawing'));
$$;
create function pg_temp.add_source(n integer, level text default 'A', assertion text default 'supports',
  scope_label text default 'Standard assembly', role text default 'Tip holder',
  subject_uuid uuid default pg_temp.id(20), target_uuid uuid default pg_temp.id(30), basis text default 'drawing')
returns jsonb language sql as $$
  select private.pi_add_compatibility_source(pg_temp.id(n),subject_uuid,target_uuid,'product_to_torch',scope_label,role,
    jsonb_build_object('source_kind',case level when 'A' then 'company_record' when 'B' then 'official_manufacturer'
      when 'C' then 'technical_standard' else 'secondary_reference' end,'source_level',level,'assertion',assertion,
      'evidence_basis',basis,'evidence_date','2026-01-01','owner_name','Synthetic custodian',
      'source_reference','Synthetic drawing TEST-REVIEW','source_location','Page 1, callout 2',
      'revision_label','TEST-rev-1','title','Synthetic review evidence'));
$$;
create function pg_temp.links(label text, role text default 'supporting') returns jsonb language sql as $$
  select jsonb_build_array(jsonb_build_object('source_id',result ->> 'source_id','role',role)) from results where results.label=links.label;
$$;
create function pg_temp.propose(n integer,evidence jsonb,root_uuid uuid default pg_temp.id(40),
  scope_label text default 'Standard assembly',copy jsonb default pg_temp.copy(),target_uuid uuid default pg_temp.id(30))
returns jsonb language sql as $$
  select private.pi_propose_compatibility_revision(pg_temp.id(n),root_uuid,pg_temp.id(20),target_uuid,'product_to_torch',scope_label,
    coalesce((select revision from compatibility_revision_heads where root_relationship_id=root_uuid),0),copy,evidence,'Synthetic proposal');
$$;
create function pg_temp.submit(n integer,label text) returns jsonb language sql as $$
  select private.pi_submit_compatibility_review(pg_temp.id(n),(result ->> 'relationship_id')::uuid,
    (result ->> 'revision')::bigint,result ->> 'digest') from results where results.label=submit.label;
$$;
create function pg_temp.review(n integer,label text,decision text default 'APPROVE',resolution text default '',
  replacement jsonb default null,evidence jsonb default null) returns jsonb language sql as $$
  select private.pi_review_compatibility_revision(pg_temp.id(n),(result ->> 'relationship_id')::uuid,
    (result ->> 'revision')::bigint,result ->> 'digest',decision,'Synthetic human review',resolution,replacement,evidence)
  from results where results.label=review.label;
$$;
create function pg_temp.candidate(label text) returns uuid language sql as $$
  select (result ->> 'relationship_id')::uuid from results where results.label=candidate.label;
$$;

select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
select throws_ok($$select pg_temp.propose(200,'[]')$$,'55000',null,'review commands require adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,
  pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(15),pg_temp.id(16)],pg_temp.id(1),'Synthetic SQL review fixture only');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
select is((select count(*)::int from pg_class where relname in ('compatibility_revision_heads','compatibility_revisions')
  and relrowsecurity and relforcerowsecurity),2,'all revision metadata forces RLS');
select ok(not has_table_privilege('authenticated','compatibility_revisions','insert,update,delete'),'caller cannot write review state');
select ok(not has_function_privilege('authenticated','private.pi_submit_compatibility_review(uuid,uuid,bigint,text)','execute'),'no public command exposure');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where relname='pi_effective_compatibility_relationships'),'effective view retains caller RLS');
select ok(not has_table_privilege('anon','pi_effective_compatibility_relationships','select'),'anonymous cannot read effective relationships');

insert into results values('source-a',pg_temp.add_source(100)),('source-b',pg_temp.add_source(101,'B')),
  ('source-c',pg_temp.add_source(102,'C')),('source-d',pg_temp.add_source(103,'D')),
  ('source-conflict',pg_temp.add_source(104,'A','contradicts')),
  ('source-catalog',pg_temp.add_source(105,'A','catalog_grouping','Standard assembly','Tip holder',pg_temp.id(20),pg_temp.id(30),'company_catalog')),
  ('source-scope',pg_temp.add_source(106,'A','supports','Air-valve assembly')),
  ('source-role',pg_temp.add_source(107,'A','supports','Standard assembly','Gas nozzle')),
  ('source-other-sku',pg_temp.add_source(108,'A','supports','Standard assembly','Tip holder',pg_temp.id(21))),
  ('source-other-target',pg_temp.add_source(109,'A','supports','Standard assembly','Tip holder',pg_temp.id(20),pg_temp.id(31)));
select throws_ok($$select pg_temp.propose(200,pg_temp.links('source-other-sku'))$$,'22023',null,'cross-SKU binding rejected');
select throws_ok($$select pg_temp.propose(200,pg_temp.links('source-other-target'))$$,'22023',null,'cross-target binding rejected');
select throws_ok($$select pg_temp.propose(200,pg_temp.links('source-scope'))$$,'22023',null,'cross-assembly binding rejected');
select throws_ok($$select pg_temp.propose(200,pg_temp.links('source-role'))$$,'22023',null,'cross-role binding rejected');
select throws_ok($$select pg_temp.propose(200,pg_temp.links('source-a') || pg_temp.links('source-a'))$$,'22023',null,'duplicate sources rejected');
select throws_ok($$select pg_temp.propose(200,'[]',copy=>pg_temp.copy() || '{"verification_status":"CONFIRMED"}')$$,'22023',null,'payload cannot self-confirm');
select throws_ok($$select pg_temp.propose(200,'[]',copy=>'{"role":"Tip holder","confirmation_requirements":[]}')$$,'22023',null,'unconfirmed proposal retains confirmation requirements');
select throws_ok($$select pg_temp.propose(200,'[]',root_uuid=>null)$$,'55000',null,'existing baseline must be selected explicitly');
select is((select count(*)::int from compatibility_relationships),1,'invalid proposals are atomic');

select pg_temp.actor(2);
insert into results values('missing',pg_temp.propose(201,'[]'));
select is((select verification_status::text from compatibility_relationships where id=pg_temp.candidate('missing')),'NEEDS_FACTORY_CONFIRMATION','missing evidence never confirms');
select is((select current_relationship_id from compatibility_revision_heads),pg_temp.id(40),'proposal retains original current relationship');
select is((select count(*)::int from verification_events),0,'saving is not a human decision');
insert into results values('missing-pending',pg_temp.submit(202,'missing'));
select is(pg_temp.submit(202,'missing'),(select result from results where label='missing-pending'),'submit retry is idempotent');
select throws_ok($$select pg_temp.propose(203,pg_temp.links('source-a'))$$,'55000',null,'ordinary save cannot overwrite pending review');
select throws_ok($$select pg_temp.review(204,'missing-pending')$$,'42501',null,'editor cannot approve');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(204,'missing-pending')$$,'23514',null,'missing evidence cannot approve');
select throws_ok($$select pg_temp.review(205,'missing-pending','EDIT','',pg_temp.copy(),pg_temp.links('source-other-sku'))$$,'22023',null,'invalid edit rolls back decision');
select is((select review_state from compatibility_revisions where relationship_id=pg_temp.candidate('missing')),'pending','failed edit retains pending state');
select is((select count(*)::int from verification_events),0,'failed decisions leave no event');
insert into results values('edited',pg_temp.review(206,'missing-pending','EDIT','',pg_temp.copy(),pg_temp.links('source-a')));
select is((select verification_status::text from compatibility_relationships where id=pg_temp.candidate('edited')),'NEEDS_FACTORY_CONFIRMATION','EDIT appends an unconfirmed revision');
select is((select count(*)::int from pi_effective_compatibility_relationships),2,'effective projection excludes superseded proposal');
select throws_ok($$select pg_temp.review(207,'missing-pending')$$,'40001',null,'superseded submission cannot approve');
insert into results values('edited-pending',pg_temp.submit(208,'edited'));
select lives_ok($$select pg_temp.review(209,'edited-pending')$$,'exact Level A plus human approval succeeds');
select lives_ok($$select pg_temp.review(209,'edited-pending')$$,'approval retry returns receipt');
select throws_ok($$select pg_temp.review(209,'edited-pending','REJECT')$$,'40001',null,'approval receipt cannot change decision');
select is((select relationship_status from compatibility_relationships where id=pg_temp.candidate('edited')),'confirmed','explicit approval aligns relationship status');
select is((select confirmed_by from compatibility_relationships where id=pg_temp.candidate('edited')),pg_temp.id(3),'reviewer attribution is server assigned');
select is((select count(*)::int from pi_effective_compatibility_relationships),1,'only approved current relationship remains effective');
select is((select compatibility_count from pi_variant_readiness where id=pg_temp.id(12)),1,'readiness excludes original and superseded history');
select is((select confirmed_compatibility_count from pi_variant_readiness where id=pg_temp.id(12)),1,'current approval counts once');

select pg_temp.actor(1);
insert into results values('unbound',pg_temp.propose(210,jsonb_build_array(jsonb_build_object('source_id',pg_temp.id(41),'role','supporting'))));
create temporary table blocked_readiness as select blocker_count from pi_variant_readiness where id=pg_temp.id(12);
insert into results values('unbound-pending',pg_temp.submit(211,'unbound'));
select throws_ok($$select pg_temp.review(212,'unbound-pending')$$,'23514',null,'generic exact-subject flag cannot replace directed binding');
select lives_ok($$select pg_temp.review(213,'unbound-pending','REJECT')$$,'explicit reject retains prior confirmed current');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),(select blocker_count-1 from blocked_readiness),'open proposal blocks readiness despite a prior approval');
select is((select current_relationship_id from compatibility_revision_heads),pg_temp.candidate('edited'),'rejection does not withdraw prior current');

insert into results values('conflict',pg_temp.propose(214,pg_temp.links('source-a') || pg_temp.links('source-conflict')));
select is((select verification_status::text from compatibility_relationships where id=pg_temp.candidate('conflict')),'DATA_CONFLICT','contradicting binding cannot be relabelled supporting');
select throws_ok($$select pg_temp.propose(215,pg_temp.links('source-a'))$$,'55000',null,'ordinary save cannot silently remove conflict');
insert into results values('conflict-pending',pg_temp.submit(216,'conflict'));
select throws_ok($$select pg_temp.review(217,'conflict-pending')$$,'22023',null,'conflict requires an explicit resolution reason');
insert into results values('conflict-edited',pg_temp.review(218,'conflict-pending','EDIT','',pg_temp.copy(),pg_temp.links('source-a')));
select is((select verification_status::text from compatibility_relationships where id=pg_temp.candidate('conflict-edited')),'DATA_CONFLICT','EDIT cannot erase unresolved conflict');
insert into results values('conflict-edited-pending',pg_temp.submit(219,'conflict-edited'));
select lives_ok($$select pg_temp.review(220,'conflict-edited-pending','APPROVE','Synthetic drawing resolves the earlier counterexample')$$,'explicit resolved approval succeeds');
select is((select count(*)::int from pi_effective_compatibility_relationships),1,'old confirmed revision becomes history without modification');
select is((select relationship_status from compatibility_relationships where id=pg_temp.candidate('edited')),'confirmed','historical confirmation row retained unchanged');
select is((select compatibility_conflict_count from pi_variant_readiness where id=pg_temp.id(12)),0,'resolved historical conflicts do not block readiness');
select is((select value from pi_dashboard_metrics where metric='unconfirmed_compatibility'),0::bigint,'dashboard excludes rejected and historical revisions');

insert into results values('catalog',pg_temp.propose(221,pg_temp.links('source-catalog'))),
  ('catalog-pending',null);
update results set result=pg_temp.submit(222,'catalog') where label='catalog-pending';
select throws_ok($$select pg_temp.review(223,'catalog-pending')$$,'23514',null,'company catalog grouping cannot confirm');
select pg_temp.review(224,'catalog-pending','REJECT');
insert into results values('oem',pg_temp.propose(225,pg_temp.links('source-b')));
select is((select verification_status::text from compatibility_relationships where id=pg_temp.candidate('oem')),'OEM_REFERENCE','official manufacturer stays reference');
insert into results values('oem-pending',pg_temp.submit(226,'oem'));
select throws_ok($$select pg_temp.review(227,'oem-pending')$$,'23514',null,'Level B cannot confirm ArcFort fit');
select pg_temp.review(228,'oem-pending','REJECT');
insert into results values('standard',pg_temp.propose(229,pg_temp.links('source-c')));
select is((select verification_status::text from compatibility_relationships where id=pg_temp.candidate('standard')),'STANDARD_REFERENCE','standard stays reference');
insert into results values('standard-pending',pg_temp.submit(230,'standard'));
select pg_temp.review(231,'standard-pending','REJECT');
insert into results values('secondary',pg_temp.propose(232,pg_temp.links('source-d')));
select is((select verification_status::text from compatibility_relationships where id=pg_temp.candidate('secondary')),'NEEDS_FACTORY_CONFIRMATION','secondary reference never becomes confirmed');
insert into results values('secondary-pending',pg_temp.submit(233,'secondary'));
select throws_ok($$select pg_temp.review(234,'secondary-pending')$$,'23514',null,'Level D cannot confirm');
select pg_temp.review(235,'secondary-pending','REJECT');

select pg_temp.actor(2);
select is(private.pi_propose_compatibility_revision(pg_temp.id(201),pg_temp.id(40),pg_temp.id(20),pg_temp.id(30),
  'product_to_torch','Standard assembly',0,pg_temp.copy(),'[]','Synthetic proposal'),
  (select result from results where label='missing'),'original proposal retry retains exact actor receipt');
select throws_ok($$select private.pi_propose_compatibility_revision(pg_temp.id(201),pg_temp.id(40),pg_temp.id(20),pg_temp.id(30),
  'product_to_torch','Standard assembly',0,pg_temp.copy(),pg_temp.links('source-a'),'Synthetic proposal')$$,'40001',null,'proposal receipt rejects changed evidence');
select throws_ok($$select private.pi_propose_compatibility_revision(pg_temp.id(240),pg_temp.id(40),pg_temp.id(20),pg_temp.id(30),
  'product_to_torch','Standard assembly',0,pg_temp.copy(),'[]','Synthetic proposal')$$,'40001',null,'stale revision cannot save');
select throws_ok($$select pg_temp.propose(240,pg_temp.links('source-scope'),scope_label=>'Air-valve assembly')$$,'22023',null,'existing revision root cannot move assembly scope');
select throws_ok($$select pg_temp.propose(240,pg_temp.links('source-a'),root_uuid=>pg_temp.candidate('edited'))$$,'22023',null,'historical candidate cannot masquerade as original root');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.propose(240,pg_temp.links('source-a'))$$,'42501',null,'reviewer alone cannot make ordinary proposals');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.propose(240,pg_temp.links('source-a'))$$,'42501',null,'viewer cannot propose');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.propose(240,pg_temp.links('source-a'))$$,'42501',null,'publisher cannot propose');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.propose(240,pg_temp.links('source-a'))$$,'42501',null,'unprivileged actor cannot propose');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.propose(240,pg_temp.links('source-a'))$$,'42501',null,'service claim cannot impersonate owner');
select set_config('request.jwt.claim.role','authenticated',true);

insert into results values('fresh',pg_temp.propose(240,pg_temp.links('source-other-target'),root_uuid=>null,target_uuid=>pg_temp.id(31)));
select is((select current_relationship_id from compatibility_revision_heads where root_relationship_id=pg_temp.candidate('fresh')),null::uuid,'first proposal has no implicit current');
select throws_ok($$select pg_temp.propose(241,pg_temp.links('source-other-target'),root_uuid=>null,target_uuid=>pg_temp.id(31))$$,'40001',null,'new relationship cannot duplicate an existing working scope');
insert into results values('fresh-pending',pg_temp.submit(242,'fresh'));
select pg_temp.review(243,'fresh-pending','REJECT');
select is((select count(*)::int from pi_effective_compatibility_relationships where target_entity_id=pg_temp.id(31)),0,'rejected first proposal is not effective');
select is((select review_state from compatibility_revisions where relationship_id=pg_temp.candidate('fresh')),'rejected','rejection history is retained');

insert into results values('resave',pg_temp.propose(244,pg_temp.links('source-a')));
insert into results values('resaved',pg_temp.propose(245,pg_temp.links('source-a')));
select is((select review_state from compatibility_revisions where relationship_id=pg_temp.candidate('resave')),'superseded','new ordinary save preserves predecessor as history');
select throws_ok($$select pg_temp.submit(246,'resave')$$,'40001',null,'superseded proposal cannot submit');
select is((select predecessor_id from compatibility_revisions where relationship_id=pg_temp.candidate('resaved')),pg_temp.candidate('resave'),'new revision retains predecessor');
select set_config('timezone','Asia/Shanghai',true);
select is(private.pi_compatibility_digest(pg_temp.candidate('resaved')),(select result ->> 'digest' from results where label='resaved'),'proposal digest is stable across timezones');
select set_config('timezone','UTC',true);
insert into results values('resaved-pending',pg_temp.submit(247,'resaved'));

-- Prove the lifecycle guard rejects the open proposal before unrelated critical-field gates.
select private.pi_compatibility_capability();
update private.pi_mutation_context set allowed_tables=allowed_tables || array['product_variants'];
update product_variants set is_shadow=false,lifecycle_state='NEEDS_VERIFICATION' where id=pg_temp.id(12);
insert into verification_events(entity_type,entity_id,decision,reason,actor_id)
  values('product_variant',pg_temp.id(12),'APPROVE','Synthetic lifecycle guard probe',pg_temp.id(1));
select throws_ok($$update product_variants set lifecycle_state='VERIFIED' where id=pg_temp.id(12)$$,'23514',
  'Open compatibility proposals must be reviewed before VERIFIED.','open proposal prevents VERIFIED even with product approval event');
insert into verification_events(entity_type,entity_id,decision,reason,actor_id)
  values('compatibility_relationship',pg_temp.candidate('resaved'),'EDIT','Synthetic legacy timestamp probe',pg_temp.id(1));
select throws_ok($$update compatibility_relationships set relationship_status='confirmed',verification_status='CONFIRMED',
  source_level='A',buyer_confirmation_required=false where id=pg_temp.candidate('resaved')$$,'23514',null,'timestamp EDIT cannot bypass exact approval');
insert into verification_events(id,entity_type,entity_id,decision,reason,actor_id,before_value,after_value,evidence_source_ids)
  select pg_temp.id(900),'compatibility_relationship',r.id,'APPROVE','Synthetic forged digest probe',pg_temp.id(1),
    jsonb_build_object('candidate',to_jsonb(r),'digest',repeat('0',64)),jsonb_build_object('digest',repeat('0',64)),
    array(select evidence_source_id from compatibility_evidence where compatibility_relationship_id=r.id order by evidence_source_id)
  from compatibility_relationships r where id=pg_temp.candidate('resaved');
update compatibility_revisions set review_state='approved',decision_event_id=pg_temp.id(900) where relationship_id=pg_temp.candidate('resaved');
select throws_ok($$update compatibility_relationships set relationship_status='confirmed',verification_status='CONFIRMED',
  source_level='A',buyer_confirmation_required=false where id=pg_temp.candidate('resaved')$$,'23514',null,'APPROVE event for another digest cannot confirm');
update compatibility_revisions set review_state='pending',decision_event_id=null where relationship_id=pg_temp.candidate('resaved');
select throws_ok($$update compatibility_relationships set role='Other geometry' where id=pg_temp.candidate('edited')$$,'55000',null,'historical confirmed relationship is immutable');
delete from private.pi_mutation_context;
select pg_temp.review(248,'resaved-pending','REJECT');

-- An exact event/digest cannot upgrade an unbound generic source into fit evidence.
insert into results values('unbound-guard',pg_temp.propose(300,
  jsonb_build_array(jsonb_build_object('source_id',pg_temp.id(41),'role','supporting'))));
insert into results values('unbound-guard-pending',pg_temp.submit(301,'unbound-guard'));
select private.pi_compatibility_capability();
insert into verification_events(id,entity_type,entity_id,decision,reason,actor_id,before_value,after_value,evidence_source_ids)
  select pg_temp.id(901),'compatibility_relationship',r.id,'APPROVE','Synthetic unbound evidence probe',pg_temp.id(1),
    jsonb_build_object('candidate',to_jsonb(r),'digest',private.pi_compatibility_digest(r.id)),
    jsonb_build_object('digest',private.pi_compatibility_digest(r.id)),array[pg_temp.id(41)]
  from compatibility_relationships r where id=pg_temp.candidate('unbound-guard');
update compatibility_revisions set review_state='approved',decision_event_id=pg_temp.id(901)
  where relationship_id=pg_temp.candidate('unbound-guard');
select throws_ok($$update compatibility_relationships set relationship_status='confirmed',verification_status='CONFIRMED',
  source_level='A',buyer_confirmation_required=false where id=pg_temp.candidate('unbound-guard')$$,'23514',
  'Compatibility confirmation requires the exact submitted revision and APPROVE event.',
  'matching APPROVE event and digest still require immutable exact-relationship evidence');
update compatibility_revisions set review_state='pending',decision_event_id=null
  where relationship_id=pg_temp.candidate('unbound-guard');
delete from private.pi_mutation_context;
select pg_temp.review(302,'unbound-guard-pending','REJECT');

insert into results values('tamper',pg_temp.propose(249,pg_temp.links('source-a')));
insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),array['compatibility_entities']);
update compatibility_entities set label='Changed synthetic target' where id=pg_temp.id(30);
delete from private.pi_mutation_context;
select throws_ok($$select pg_temp.submit(250,'tamper')$$,'40001',null,'changed endpoint metadata makes submission stale');
select throws_ok($$select pg_temp.propose(251,pg_temp.links('source-a'))$$,'22023',null,'stale bound evidence cannot be reused after endpoint change');
select is((select review_state from compatibility_revisions where relationship_id=pg_temp.candidate('tamper')),'proposed','stale rejection does not advance candidate state');
select is((select count(*)::int from private.pi_mutation_context),0,'failed source recheck leaves no capability');

update console_user_roles set revoked_at=now() where user_id=pg_temp.id(2);
select pg_temp.actor(2);
select throws_ok($$select private.pi_propose_compatibility_revision(pg_temp.id(201),pg_temp.id(40),pg_temp.id(20),pg_temp.id(30),
  'product_to_torch','Standard assembly',0,pg_temp.copy(),'[]','Synthetic proposal')$$,'42501',null,'revoked editor cannot replay successful proposal');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(209,'edited-pending','APPROVE','','{}','[]')$$,'22023',null,'APPROVE cannot carry an unreviewed replacement');
select pg_temp.actor(1);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(3);
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(209,'edited-pending')$$,'42501',null,'revoked reviewer cannot replay approval');
select pg_temp.actor(4);
set local role authenticated;
select ok(exists(select 1 from compatibility_revision_heads),'current viewer can inspect lineage');
select ok(exists(select 1 from pi_effective_compatibility_relationships),'current viewer can inspect effective relationships');
reset role;
select pg_temp.actor(1);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(4);
select pg_temp.actor(4);
set local role authenticated;
select is((select count(*)::int from compatibility_revisions),0,'revoked viewer cannot read history');
select is((select count(*)::int from pi_effective_compatibility_relationships),0,'revoked viewer cannot read effective relationships');
reset role;
select pg_temp.actor(1);

select is((select to_jsonb(r) from compatibility_relationships r where id=pg_temp.id(40)),(select value from original_relationship),'full original relationship remains unchanged');
select is((select count(*)::int from private.pi_mutation_context),0,'commands leave no transaction capability');
select is((select count(*)::int from publish_records),0,'review does not publish');
select * from finish();
rollback;
