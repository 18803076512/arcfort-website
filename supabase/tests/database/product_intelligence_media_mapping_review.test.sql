begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions,public;
set local timezone='UTC';
select plan(109);

create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('98000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'mapping-review-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'mapping-review-category','synthetic-review','Synthetic review category','synthetic-review');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'mapping-review-product',pg_temp.id(10),'Synthetic review product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),
    'synthetic-review-' || n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED' from generate_series(12,15) n;
insert into media_assets(id,external_key,source_kind,source_reference,ownership_status,usage_rights_status,
  content_match_status,publication_status) values(pg_temp.id(20),'review-legacy','company_catalog','Synthetic legacy reference',
    'unconfirmed','needs_confirmation','product_family_reference','legacy_reference');
insert into product_media(id,product_variant_id,media_asset_id,role,alt_text)
  values(pg_temp.id(21),pg_temp.id(12),pg_temp.id(20),'main','Synthetic legacy image');
create temporary table results(label text primary key,result jsonb);
grant select on results to authenticated;
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.result(label text,key text) returns uuid language sql as $$
  select (result->>key)::uuid from results where results.label=result.label;
$$;
create function pg_temp.original(n integer) returns jsonb language sql as $$
  insert into results values('intent-' || n,private.pi_begin_media_upload(pg_temp.id(n),pg_temp.id(12),
    jsonb_build_object('filename','synthetic-review.png','byte_size',100,'mime_type','image/png','file_hash',repeat('a',64),
      'width',32,'height',24,'source_kind','other_reference','source_owner','Synthetic custodian','source_reference','TEST-ONLY metadata')));
  insert into storage.objects(id,bucket_id,name,owner_id,metadata,version) select pg_temp.id(n+1000),
    'pi-product-originals',result->>'storage_path',auth.uid()::text,'{"size":100,"mimetype":"image/png"}','synthetic-version'
    from results where label='intent-' || n;
  select private.pi_complete_media_upload(pg_temp.id(n+2000),(result->>'intent_id')::uuid) from results where label='intent-' || n;
$$;
create function pg_temp.source(n integer,dimension text default 'usage_rights',assertion text default 'supports',
  role text default 'main',asset_uuid uuid default pg_temp.result('original','asset_id'),basis text default null)
returns jsonb language sql as $$
  select private.pi_add_media_source(pg_temp.id(n),pg_temp.id(12),asset_uuid,role,dimension,jsonb_build_object(
    'source_kind','company_record','source_level','A','assertion',assertion,'evidence_basis',coalesce(basis,
      case dimension when 'usage_rights' then 'supplier_authorization' else 'sku_label' end),'evidence_date','2026-01-01',
    'owner_name','Synthetic custodian','source_reference','TEST-ONLY no actual rights or product approval',
    'source_location','Synthetic page 1','revision_label','TEST-REVIEW-1','title','Synthetic review evidence'));
$$;
create function pg_temp.propose(n integer,role text default 'main',head_label text default null,
  asset_uuid uuid default pg_temp.result('original','asset_id'),source_labels text[] default array['rights','match'])
returns jsonb language sql as $$
  select private.pi_propose_media_mapping(pg_temp.id(n),pg_temp.id(12),asset_uuid,role,0,
    coalesce((select (result->>'revision')::bigint from results where label=head_label),0),
    '{"alt_text":"Synthetic internal image; not actual product evidence"}',
    array(select (result->>'source_id')::uuid from results where label=any(source_labels) order by label),
    'Synthetic isolated proposal only',pg_temp.result(head_label,'head_id'));
$$;
create function pg_temp.submit(n integer,label text) returns jsonb language sql as $$
  select private.pi_submit_media_mapping(pg_temp.id(n),(result->>'mapping_id')::uuid,(result->>'revision')::bigint,result->>'digest')
    from results where results.label=submit.label;
$$;
create function pg_temp.confirmation(label text) returns jsonb language sql as $$
  select jsonb_build_object('original_digest',candidate.original_digest,'original_inspected',true,
    'usage_rights_confirmed',true,'exact_product_confirmed',true) from media_mapping_revisions candidate
    where candidate.id=pg_temp.result(label,'mapping_id');
$$;
create function pg_temp.review(n integer,label text,decision text default 'APPROVE',confirmation jsonb default null,
  rights_label text default 'rights',match_label text default 'match',resolution text default '',replacement jsonb default null,
  expected bigint default null,digest text default null,reason text default 'Synthetic human review fixture only')
returns jsonb language sql as $$
  select private.pi_review_media_mapping(pg_temp.id(n),(result->>'mapping_id')::uuid,
    coalesce(expected,(result->>'revision')::bigint),coalesce(digest,result->>'digest'),decision,reason,
    coalesce(confirmation,case decision when 'APPROVE' then pg_temp.confirmation(label) else '{}'::jsonb end),
    case when decision='APPROVE' then pg_temp.result(rights_label,'source_id') end,
    case when decision='APPROVE' then pg_temp.result(match_label,'source_id') end,resolution,replacement)
    from results where results.label=review.label;
$$;
create function pg_temp.lifecycle(state public.pi_product_lifecycle) returns void language sql as $$
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),array['product_variants']);
  update product_variants set lifecycle_state=state where id=pg_temp.id(12);
  delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
$$;
create function pg_temp.fake_decision() returns void language sql as $$
  insert into verification_events(id,entity_type,entity_id,field_key,decision,reason,before_value,after_value,actor_id)
    values(pg_temp.id(999),'media_mapping',pg_temp.result('pending-forgery','mapping_id'),'main','APPROVE','Synthetic forged event',
      '{}','{}',auth.uid());
  insert into media_mapping_decisions select candidate.id,pg_temp.id(999),'APPROVE',candidate.submitted_digest,
    private.pi_media_mapping_digest(candidate.id),'{}',null,null,'',auth.uid(),now()
    from media_mapping_revisions candidate where id=pg_temp.result('pending-forgery','mapping_id');
$$;

select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,
  pilot_variant_ids,actor_id,reason) values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic isolated review fixture');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
insert into results values('original',pg_temp.original(100)),('replacement',pg_temp.original(101));
insert into results values('rights',pg_temp.source(200)),('match',pg_temp.source(201,'product_match')),
  ('reference',pg_temp.source(202,assertion=>'reference_only',basis=>'catalog_reference')),
  ('unselected',pg_temp.source(203)),('wrong-role',pg_temp.source(204,role=>'gallery'));
create temporary table originals as select
  (select jsonb_agg(to_jsonb(row) order by id) from product_media row) mappings,
  (select jsonb_agg(to_jsonb(row) order by id) from media_assets row) assets,
  (select jsonb_agg(to_jsonb(row) order by id) from product_variants row) variants,
  (select blocker_count from pi_variant_readiness where id=pg_temp.id(12)) readiness_blockers;

select is((select count(*)::int from pg_class where relname in ('media_mapping_decisions','media_mapping_currents')
  and relrowsecurity and relforcerowsecurity),2,'decision and current tables force RLS');
select ok(not has_table_privilege('authenticated','media_mapping_currents','insert,update,delete'),'callers cannot set current mappings');
select ok(not has_table_privilege('service_role','media_mapping_decisions','insert,update,delete'),'service has no decision write grant');
select ok(not has_function_privilege('authenticated','private.pi_review_media_mapping(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb)','execute'),'review command remains private');
select ok(not has_function_privilege('anon','public.pi_media_mapping_approval_valid(uuid)','execute'),'approval read wrapper is not anonymous');
select ok(not has_function_privilege('service_role','public.pi_media_mapping_approval_valid(uuid)','execute'),'approval read wrapper has no service grant');
select is((select count(*)::int from pi_dashboard_metrics),9,'existing dashboard keeps its nine-metric contract');
select is((select count(*)::int from information_schema.columns where table_schema='public' and table_name='pi_variant_readiness'),20,'existing readiness column contract is unchanged');
select is((select count(*)::int from pi_effective_media_mappings where mapping_origin='legacy'),1,'original mapping is effective before approval');
insert into results values('first',pg_temp.propose(300));
select throws_ok($$select pg_temp.review(400,'first')$$,'40001',null,'unsubmitted proposal cannot approve');
select pg_temp.submit(350,'first');
select pg_temp.actor(2);
select throws_ok($$select pg_temp.review(400,'first')$$,'42501',null,'editor cannot approve');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.review(400,'first')$$,'42501',null,'viewer cannot approve');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.review(400,'first')$$,'42501',null,'publisher cannot approve');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.review(400,'first')$$,'42501',null,'unassigned cannot approve');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.review(400,'first',expected=>2)$$,'40001',null,'stale review sequence refused');
select throws_ok($$select pg_temp.review(400,'first',digest=>repeat('b',64))$$,'40001',null,'changed submitted digest refused');
select throws_ok($$select pg_temp.review(400,'first',decision=>'AUTO')$$,'22023',null,'unknown decision refused');
select throws_ok($$select pg_temp.review(400,'first',reason=>' ')$$,'22023',null,'meaningful review reason required');
select throws_ok($$select pg_temp.review(400,'first',confirmation=>'{}')$$,'23514',null,'approval requires explicit human declaration');
select throws_ok($$select pg_temp.review(400,'first',confirmation=>jsonb_set(pg_temp.confirmation('first'),'{original_inspected}','false'))$$,
  '23514',null,'uninspected original cannot approve');
select throws_ok($$select pg_temp.review(400,'first',confirmation=>jsonb_set(pg_temp.confirmation('first'),'{usage_rights_confirmed}','false'))$$,
  '23514',null,'usage rights must be explicitly confirmed');
select throws_ok($$select pg_temp.review(400,'first',confirmation=>jsonb_set(pg_temp.confirmation('first'),'{exact_product_confirmed}','false'))$$,
  '23514',null,'exact product must be explicitly confirmed');
select throws_ok($$select pg_temp.review(400,'first',confirmation=>pg_temp.confirmation('first') || '{"approved_by":"forged"}')$$,
  '23514',null,'actor or extra confirmation injection refused');
select throws_ok($$select pg_temp.review(400,'first',confirmation=>jsonb_set(pg_temp.confirmation('first'),'{original_digest}',to_jsonb(repeat('f',64))))$$,
  '23514',null,'another original digest cannot approve');
select throws_ok($$select pg_temp.review(400,'first',rights_label=>'match')$$,'23514',null,'product evidence cannot replace rights evidence');
select throws_ok($$select pg_temp.review(400,'first',match_label=>'rights')$$,'23514',null,'rights evidence cannot replace exact product evidence');
select throws_ok($$select pg_temp.review(400,'first',rights_label=>'unselected')$$,'23514',null,'eligible but unsubmitted source cannot approve');
select throws_ok($$select pg_temp.review(400,'first',rights_label=>'wrong-role')$$,'23514',null,'source scope cannot transfer roles');
select throws_ok($$select pg_temp.review(400,'first',rights_label=>'reference')$$,'23514',null,'reference-only cannot approve');
select throws_ok($$select pg_temp.review(400,'first',replacement=>'{}')$$,'22023',null,'APPROVE cannot silently edit candidate');
select is((select count(*)::int from verification_events),0,'failed approval leaves no event');
select is((select count(*)::int from media_mapping_decisions),0,'failed approval leaves no decision');
select is((select count(*)::int from media_mapping_currents),0,'failed approval leaves no current pointer');
select is((select open_media_mapping_count from pi_media_mapping_readiness where product_variant_id=pg_temp.id(12)),1,'pending is independently counted');
select is((select value from pi_media_mapping_metrics where metric='open_media_mappings'),1::bigint,'media metrics expose pending count');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),
  (select readiness_blockers+1 from originals),'pending increases actual aggregate readiness blockers');
update storage.objects set version='changed-synthetic-version' where id=pg_temp.id(1100);
select throws_ok($$select pg_temp.review(400,'first')$$,'23514',null,'changed stored object metadata prevents approval');
select lives_ok($$select pg_temp.review(401,'first',decision=>'REJECT')$$,'stale original can be explicitly rejected without approval');
select is((select review_state from media_mapping_revisions where id=pg_temp.result('first','mapping_id')),'rejected','rejection retains closed candidate');
select is((select count(*)::int from media_mapping_currents),0,'reject first proposal creates no current');
select is((select count(*)::int from pi_effective_media_mappings where mapping_origin='legacy'),1,'rejection retains legacy mapping');
update storage.objects set version='synthetic-version' where id=pg_temp.id(1100);
insert into results values('second',pg_temp.propose(301,head_label=>'first'));
select pg_temp.submit(351,'second');
select pg_temp.actor(3);
insert into results values('approved',pg_temp.review(402,'second'));
select ok(public.pi_media_mapping_approval_valid(pg_temp.result('second','mapping_id')),'exact reviewer APPROVE is valid');
select set_config('timezone','Asia/Shanghai',true);
select ok(public.pi_media_mapping_approval_valid(pg_temp.result('second','mapping_id')),'historical approval proof is timezone-stable');
select set_config('timezone','UTC',true);
select is(pg_temp.review(402,'second'),(select result from results where label='approved'),'unchanged review retry is idempotent');
select throws_ok($$select pg_temp.review(402,'second',decision=>'REJECT')$$,'40001',null,'changed decision retry refused');
select throws_ok($$select pg_temp.review(403,'second')$$,'40001',null,'new request cannot reapprove closed candidate');
select is((select created_by from media_mapping_decisions where mapping_id=pg_temp.result('second','mapping_id')),pg_temp.id(3),'human reviewer is server-attributed');
select is((select mapping_id from media_mapping_currents),pg_temp.result('second','mapping_id'),'current pointer advances only on approval');
select is((select review_state from media_mapping_revisions where id=pg_temp.result('second','mapping_id')),'approved','approved revision remains immutable history');
select is((select verification_status from media_mapping_revisions where id=pg_temp.result('second','mapping_id')),
  'NEEDS_FACTORY_CONFIRMATION'::pi_verification_status,'original proposal status is not overwritten');
select is((select verification_status from pi_effective_media_mappings where mapping_origin='current'),
  'CONFIRMED'::pi_verification_status,'effective per-SKU approval is separate from original proposal');
select is((select count(*)::int from pi_effective_media_mappings where mapping_origin='legacy'),0,'approved slot replaces legacy only in effective projection');
select is((select reviewed_media_mapping_count from pi_media_mapping_readiness where product_variant_id=pg_temp.id(12)),1,'valid current approval is counted');
select is((select eligible_main_image_count from pi_variant_readiness where id=pg_temp.id(12)),0,'approved private original is not a public eligible main image');
select ok(not exists(select 1 from pi_effective_media_mappings where mapping_origin='current' and publication_ready),'no private original becomes publication ready');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),
  (select readiness_blockers from originals),'closed approval clears only the open blocker, not public image blockers');
select pg_temp.actor(1);
insert into results values('new-open',pg_temp.propose(302,head_label=>'second'));
select ok(public.pi_media_mapping_approval_valid(pg_temp.result('second','mapping_id')),'open replacement preserves previous exact approved history');
select is((select count(*)::int from pi_effective_media_mappings),2,'current and open candidate both remain effective');
select is((select open_media_mapping_count from pi_media_mapping_readiness where product_variant_id=pg_temp.id(12)),1,'historical approval cannot hide new draft');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),
  (select readiness_blockers+1 from originals),'historical approval cannot hide aggregate new draft blocker');
select throws_ok($$select pg_temp.lifecycle('VERIFIED')$$,'23514',null,'open replacement blocks verified');
select pg_temp.submit(352,'new-open');
select pg_temp.review(404,'new-open',decision=>'REJECT');
select is((select mapping_id from media_mapping_currents),pg_temp.result('second','mapping_id'),'rejection preserves preceding current approval');
select is((select count(*)::int from pi_effective_media_mappings),1,'rejected proposal is excluded from effective mapping');

insert into results values('gallery-rights',pg_temp.source(205,role=>'gallery')),
  ('gallery-match',pg_temp.source(206,'product_match',role=>'gallery')),
  ('gallery-conflict',pg_temp.source(207,assertion=>'contradicts',role=>'gallery')),
  ('replacement-rights',pg_temp.source(208,role=>'gallery',asset_uuid=>pg_temp.result('replacement','asset_id'))),
  ('replacement-match',pg_temp.source(209,'product_match',role=>'gallery',asset_uuid=>pg_temp.result('replacement','asset_id')));
insert into results values('conflict',pg_temp.propose(303,role=>'gallery',source_labels=>array['gallery-rights','gallery-match']));
select pg_temp.submit(353,'conflict');
select throws_ok($$select pg_temp.review(405,'conflict',decision=>'EDIT')$$,'22023',null,'EDIT requires exact replacement');
select throws_ok($$select pg_temp.review(405,'conflict',decision=>'EDIT',replacement=>'{"asset_id":"bad","copy":{},"sources":[]}')$$,
  '22023',null,'malformed replacement identity refused');
select throws_ok($$select pg_temp.review(405,'conflict',decision=>'EDIT',replacement=>jsonb_build_object('asset_id',pg_temp.result('replacement','asset_id'),
  'copy','{}'::jsonb,'sources','[]'::jsonb))$$,'22023',null,'invalid replacement copy rolls back entire EDIT');
select is((select count(*)::int from media_mapping_decisions where mapping_id=pg_temp.result('conflict','mapping_id')),0,'failed EDIT creates no partial decision');
insert into results values('edited',pg_temp.review(405,'conflict',decision=>'EDIT',replacement=>jsonb_build_object(
  'asset_id',pg_temp.result('replacement','asset_id'),'copy','{"alt_text":"Synthetic corrected original"}'::jsonb,
  'sources',jsonb_build_array(pg_temp.result('replacement-rights','source_id'),pg_temp.result('replacement-match','source_id')))));
select is((select review_state from media_mapping_revisions where id=pg_temp.result('conflict','mapping_id')),'superseded','EDIT retains original candidate as history');
select is((select predecessor_id from media_mapping_revisions where id=pg_temp.result('edited','mapping_id')),
  pg_temp.result('conflict','mapping_id'),'EDIT appends a linked candidate');
select is((select verification_status from media_mapping_revisions where id=pg_temp.result('edited','mapping_id')),
  'DATA_CONFLICT'::pi_verification_status,'EDIT does not erase inherited unresolved conflict');
select is((select count(*)::int from media_mapping_currents),1,'EDIT cannot produce effective approval');
select pg_temp.submit(354,'edited');
select throws_ok($$select pg_temp.review(406,'edited',rights_label=>'replacement-rights',match_label=>'replacement-match')$$,
  '23514',null,'conflict approval requires explicit resolution reason');
select pg_temp.review(406,'edited',rights_label=>'replacement-rights',match_label=>'replacement-match',resolution=>'Synthetic resolution only; not actual product evidence');
select is((select count(*)::int from media_mapping_currents),2,'resolved human decision adds the exact gallery current');
select ok(public.pi_media_mapping_approval_valid(pg_temp.result('edited','mapping_id')),'explicit resolved approval retains separate exact proof');

insert into results values('new-main-conflict',pg_temp.source(210,assertion=>'contradicts'));
select ok(not public.pi_media_mapping_approval_valid(pg_temp.result('second','mapping_id')),'new unselected contradiction invalidates current approval');
select is((select invalid_current_media_mapping_count from pi_media_mapping_readiness where product_variant_id=pg_temp.id(12)),1,'invalid historical approval is a readiness blocker');
select is((select value from pi_media_mapping_metrics where metric='invalid_media_approvals'),1::bigint,'invalid approval is visible in media metrics');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),
  (select readiness_blockers+1 from originals),'invalid current approval increases actual aggregate blocker count');
select is((select verification_status from pi_effective_media_mappings where mapping_id=pg_temp.result('second','mapping_id')),
  'DATA_CONFLICT'::pi_verification_status,'effective projection exposes current invalidity');
select throws_ok($$select pg_temp.lifecycle('VERIFIED')$$,'23514','Invalid current media approval blocks publishable lifecycle states.','invalid approval blocks VERIFIED');
select throws_ok($$select pg_temp.lifecycle('READY_FOR_PUBLISH')$$,'23514',null,'invalid approval blocks readiness promotion');
select throws_ok($$select pg_temp.lifecycle('QA_PASSED')$$,'23514',null,'invalid approval blocks QA promotion');
select throws_ok($$select pg_temp.lifecycle('PUBLISHED')$$,'23514',null,'invalid approval blocks publication');

insert into results values('pending-forgery',pg_temp.propose(304,role=>'packaging',source_labels=>'{}'));
select pg_temp.submit(355,'pending-forgery');
select private.pi_media_mapping_review_capability();
select throws_ok($$select pg_temp.fake_decision()$$,'23514',null,'fabricated event cannot establish an exact human decision');
select throws_ok($$update media_mapping_revisions set review_state='approved' where id=pg_temp.result('pending-forgery','mapping_id')$$,
  '40001',null,'transaction capability cannot approve without exact decision');
select throws_ok($$update media_mapping_currents set mapping_id=pg_temp.result('pending-forgery','mapping_id') where head_id=pg_temp.result('second','head_id')$$,
  '23514',null,'current pointer cannot adopt another scope or pending candidate');
select throws_ok($$update media_mapping_decisions set confirmation='{}'$$,'55000',null,'decisions remain immutable with capability');
select throws_ok($$delete from media_mapping_decisions$$,'55000',null,'human history cannot be deleted');
select throws_ok($$delete from media_mapping_currents$$,'55000',null,'current removal cannot silently restore legacy');
select throws_ok($$truncate media_mapping_decisions cascade$$,'55000',null,'decision history cannot be truncated');
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$update media_mapping_currents set updated_by=auth.uid(),updated_at=now()
  where head_id=pg_temp.result('edited','head_id')$$,'23514',null,'service claim cannot update a valid pointer even with capability');
select set_config('request.jwt.claim.role','authenticated',true);
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
select pg_temp.actor(4);
set local role authenticated;
select is((select count(*)::int from pi_media_mapping_metrics),2,'current viewer can read separate media metrics');
select is((select count(*)::int from media_mapping_currents),2,'viewer can inspect current mapping metadata');
select throws_ok($$insert into media_mapping_currents values(pg_temp.id(999),pg_temp.id(999),pg_temp.id(4),now())$$,
  '42501',null,'viewer has no direct pointer write');
reset role;
select pg_temp.actor(1);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(3);
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(402,'second')$$,'42501',null,'revoked reviewer cannot replay successful receipt');
set local role authenticated;
select is((select count(*)::int from media_mapping_decisions),0,'revoked reviewer loses decision RLS reads');
select ok(not public.pi_media_mapping_approval_valid(pg_temp.result('edited','mapping_id')),'revoked reader cannot use approval wrapper as metadata oracle');
reset role;
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.review(402,'second')$$,'42501',null,'service claim cannot impersonate human reviewer');
select ok(not public.pi_media_mapping_approval_valid(pg_temp.result('edited','mapping_id')),'service claim cannot read as a human owner');
select set_config('request.jwt.claim.role','authenticated',true);
select ok(public.pi_media_mapping_approval_valid(pg_temp.result('edited','mapping_id')),'authorized past decisions survive later reviewer role revocation');
select ok(not public.pi_media_mapping_approval_valid(pg_temp.id(999)),'unknown mapping has no approval proof');
select ok((select jsonb_agg(to_jsonb(row) order by id) from product_media row)=(select mappings from originals),'original product_media rows remain exact');
select ok((select jsonb_agg(to_jsonb(row) order by id) from media_assets row)=(select assets from originals),'global asset rights/match/publication metadata remain exact');
select ok((select jsonb_agg(to_jsonb(row) order by id) from product_variants row)=(select variants from originals),'original product lifecycle and metadata remain exact');
select ok(not exists(select 1 from media_assets where raw_snapshot ? 'intake_id' and raw_snapshot->>'byte_verification'<>'not_attested'),
  'human declaration never claims SQL actual-byte attestation');
select is((select count(*)::int from publish_records),0,'human mapping review never publishes');
select is((select count(*)::int from media_mapping_decisions),5,'refusals and retries leave exactly the five intended synthetic decisions');
select ok(exists(select 1 from audit_events where table_name='media_mapping_decisions'),'human decisions have audit history');
select ok(not exists(select 1 from private.pi_mutation_context),'finished commands leave no transaction capability');

select * from finish();
rollback;
