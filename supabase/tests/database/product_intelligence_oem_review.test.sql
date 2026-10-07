begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions,public;
set local timezone = 'UTC';
select plan(110);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('98000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'oem-review-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'oem-review-category','synthetic-oem-review','Synthetic category','synthetic-oem-review');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'oem-review-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),
    'synthetic-oem-review-' || n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED'
    from generate_series(12,15) n;
insert into evidence_sources(id,external_key,source_type,source_level,title,source_reference)
  values(pg_temp.id(40),'oem-review-legacy','manufacturer','B','Synthetic legacy source','TEST-ONLY original');
insert into oem_references(id,external_key,product_variant_id,manufacturer_name,reference_number,source_level,verification_status,evidence_source_id)
  values(pg_temp.id(41),'oem-review-original',pg_temp.id(12),'Synthetic manufacturer','TEST-ONLY-LEGACY','B','OEM_REFERENCE',pg_temp.id(40)),
    (pg_temp.id(42),'oem-review-conflict',pg_temp.id(13),'Synthetic manufacturer','TEST-ONLY-CONFLICT','A','DATA_CONFLICT',pg_temp.id(40));
create temporary table original_rows as select
  (select jsonb_agg(to_jsonb(t) order by id) from oem_references t) refs,
  (select jsonb_agg(to_jsonb(t) order by id) from product_variants t) variants,
  (select blocker_count from pi_variant_readiness where id=pg_temp.id(12)) blockers;
create temporary table sources(label text primary key,id uuid);
create temporary table results(label text primary key,result jsonb);
grant select on results to authenticated;
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.copy(ref text default 'TEST-ONLY-001',manufacturer text default 'Synthetic manufacturer')
returns jsonb language sql as $$ select jsonb_build_object('manufacturer_name',manufacturer,'reference_number',ref); $$;
create function pg_temp.source(n integer,level text default 'A',assertion text default 'supports',basis text default 'factory_record',
  ref text default 'TEST-ONLY-001',variant uuid default pg_temp.id(12)) returns uuid language sql as $$
  select (private.pi_add_oem_source(pg_temp.id(n),variant,'Synthetic manufacturer',ref,jsonb_build_object(
    'source_level',level,'source_kind',case level when 'A' then 'company_record' when 'B' then 'official_manufacturer'
      when 'C' then 'technical_standard' else 'secondary_reference' end,'assertion',assertion,'evidence_basis',basis,
    'evidence_date','2026-01-01','owner_name','Synthetic custodian','source_reference','TEST-ONLY source',
    'source_location','Synthetic page 1','revision_label','TEST-REVIEW-1','title','Synthetic OEM source'))->>'source_id')::uuid;
$$;
create function pg_temp.sid(label text) returns uuid language sql as $$ select id from sources where sources.label=sid.label; $$;
create function pg_temp.r(label text) returns jsonb language sql as $$ select result from results where results.label=r.label; $$;
create function pg_temp.propose(n integer,slot integer default 0,copy jsonb default pg_temp.copy(),
  evidence uuid[] default array[pg_temp.sid('factory')],head uuid default null,revision bigint default 0,
  original uuid default null,variant uuid default pg_temp.id(12)) returns jsonb language sql as $$
  select private.pi_propose_oem_revision(pg_temp.id(n),variant,slot,revision,copy,evidence,
    'Synthetic OEM proposal; not real evidence',head,original);
$$;
create function pg_temp.submit(n integer,label text) returns jsonb language sql as $$
  select private.pi_submit_oem_revision(pg_temp.id(n),(pg_temp.r(label)->>'revision_id')::uuid,
    (pg_temp.r(label)->>'revision')::bigint,pg_temp.r(label)->>'digest');
$$;
create function pg_temp.confirm(status public.pi_verification_status default 'CONFIRMED') returns jsonb language sql as $$
  select jsonb_build_object('source_checked',true,'reference_checked',true,'compatibility_not_asserted',true,
    'arcfort_reference_confirmed',status='CONFIRMED');
$$;
create function pg_temp.review(n integer,label text,decision text default 'APPROVE',status public.pi_verification_status default 'CONFIRMED',
  source uuid default pg_temp.sid('factory'),confirmation jsonb default pg_temp.confirm(),resolution text default '',replacement jsonb default null)
returns jsonb language sql as $$
  select private.pi_review_oem_revision(pg_temp.id(n),(pg_temp.r(label)->>'revision_id')::uuid,
    (pg_temp.r(label)->>'revision')::bigint,pg_temp.r(label)->>'digest',decision,'Synthetic human QA decision; no real confirmation',
    status,confirmation,source,resolution,replacement);
$$;
create function pg_temp.valid(label text) returns boolean language sql as $$
  select private.pi_oem_approval_valid((pg_temp.r(label)->>'revision_id')::uuid);
$$;
create function pg_temp.forge(label text) returns void language sql as $$
  insert into public.verification_events(id,entity_type,entity_id,field_key,decision,reason,before_value,after_value,actor_id)
  values(pg_temp.id(800),'oem_revision',(pg_temp.r(label)->>'revision_id')::uuid,'reference_number','APPROVE','Synthetic forged snapshot',
    '{}','{}',auth.uid());
  insert into public.oem_revision_decisions select candidate.id,pg_temp.id(800),'APPROVE',candidate.submitted_digest,
    private.pi_oem_revision_digest(candidate.id),'CONFIRMED',pg_temp.confirm(),pg_temp.sid('factory'),'',auth.uid(),now()
    from public.oem_revisions candidate where candidate.id=(pg_temp.r(label)->>'revision_id')::uuid;
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select throws_ok($$select pg_temp.propose(100)$$,'42501',null,'viewer cannot discover adoption');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.propose(100)$$,'55000',null,'proposal requires adopted authority');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,
  pilot_variant_ids,actor_id,reason) values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(17)],pg_temp.id(1),'Synthetic isolated OEM review');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
select ok((select bool_and(relrowsecurity and relforcerowsecurity) from pg_class where relname in
  ('oem_revision_heads','oem_revisions','oem_revision_evidence','oem_revision_decisions','oem_revision_currents')),'all five tables force RLS');
select ok(not has_table_privilege('authenticated','oem_revisions','insert,update,delete'),'no direct authenticated writes');
select ok(not has_table_privilege('anon','oem_revisions','select'),'no anonymous read');
select ok(not has_table_privilege('service_role','oem_revision_currents','select,insert,update,delete'),'no service grant');
select ok(not has_function_privilege('authenticated','private.pi_propose_oem_revision(uuid,uuid,integer,bigint,jsonb,uuid[],text,uuid,uuid)','execute'),'no application proposal grant');
select is((select count(*)::int from information_schema.columns where table_name='pi_variant_readiness'),20,'readiness column contract preserved');
select is((select count(*)::int from pi_dashboard_metrics),9,'dashboard metric contract preserved');
insert into sources values('factory',pg_temp.source(60)),('official',pg_temp.source(61,'B','reference_only','manufacturer_catalog')),
  ('catalog',pg_temp.source(62,basis=>'company_catalog')),('secondary',pg_temp.source(63,'D','supports','secondary_reference')),
  ('next',pg_temp.source(64,ref=>'TEST-ONLY-002')),('other',pg_temp.source(65,variant=>pg_temp.id(13))),
  ('legacy',pg_temp.source(66,'B','reference_only','manufacturer_catalog','TEST-ONLY-LEGACY'));
select throws_ok($$select pg_temp.propose(100,copy=>pg_temp.copy() || '{"confirmed_by":"forged"}')$$,'22023',null,'copy cannot forge confirmation');
select throws_ok($$select pg_temp.propose(100,copy=>'{"manufacturer_name":null,"reference_number":"TEST"}')$$,'22023',null,'null manufacturer rejected');
select throws_ok($$select pg_temp.propose(100,copy=>pg_temp.copy('TEST-ONLY-01'))$$,'22023',null,'leading digit identity cannot transfer source');
select throws_ok($$select pg_temp.propose(100,evidence=>array[pg_temp.sid('other')])$$,'22023',null,'source cannot cross SKU');
select throws_ok($$select pg_temp.propose(100,evidence=>array[pg_temp.sid('factory'),pg_temp.sid('factory')])$$,'22023',null,'duplicate source rejected');
select throws_ok($$select pg_temp.propose(100,evidence=>array[null::uuid])$$,'22023',null,'null source rejected');
select throws_ok($$select pg_temp.propose(100,slot=>100)$$,'22023',null,'bounded slot required');
select throws_ok($$select pg_temp.propose(100,variant=>pg_temp.id(15))$$,'55000',null,'outside pilot refused');
select throws_ok($$select pg_temp.propose(100,original=>pg_temp.id(42))$$,'22023',null,'original lineage cannot cross SKU');
select throws_ok($$select pg_temp.propose(100,copy=>pg_temp.copy('TEST-ONLY-LEGACY'),evidence=>array[pg_temp.sid('legacy')])$$,'22023',null,'existing original requires explicit lineage');
select pg_temp.actor(2);
insert into results values('first',pg_temp.propose(100,evidence=>array[pg_temp.sid('factory'),pg_temp.sid('official'),pg_temp.sid('catalog'),pg_temp.sid('secondary')]));
select is(pg_temp.propose(100,evidence=>array[pg_temp.sid('factory'),pg_temp.sid('official'),pg_temp.sid('catalog'),pg_temp.sid('secondary')]),pg_temp.r('first'),'same actor receipt replays exactly');
select throws_ok($$select pg_temp.propose(100)$$,'40001',null,'receipt payload cannot change');
select is((select count(*)::int from oem_revisions),1,'retry creates one revision');
select is((select created_by from oem_revisions),pg_temp.id(2),'proposal actor is session editor');
select is((select verification_status::text from oem_revisions),'NEEDS_FACTORY_CONFIRMATION','proposal is not confirmation');
select is((select unresolved_oem_count from pi_oem_readiness where product_variant_id=pg_temp.id(12)),1,'open proposal is unresolved');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),
  (select blockers+1 from original_rows),'open OEM adds a shared readiness blocker');
select throws_ok($$select pg_temp.propose(101,slot=>1)$$,'22023',null,'duplicate open designation refused');
select throws_ok($$select private.pi_submit_oem_revision(pg_temp.id(101),(pg_temp.r('first')->>'revision_id')::uuid,2,pg_temp.r('first')->>'digest')$$,'40001',null,'stale expected sequence refused');
select throws_ok($$select private.pi_submit_oem_revision(pg_temp.id(101),(pg_temp.r('first')->>'revision_id')::uuid,1,repeat('a',64))$$,'40001',null,'stale digest refused');
select lives_ok($$select pg_temp.submit(101,'first')$$,'editor freezes proposal');
select is((select review_state from oem_revisions),'pending','submitted snapshot is pending');
select throws_ok($$select pg_temp.propose(102,head=>(pg_temp.r('first')->>'head_id')::uuid,revision=>1)$$,'55000',null,'pending cannot be overwritten');
select throws_ok($$select pg_temp.review(102,'first')$$,'42501',null,'editor cannot approve');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(102,'first',source=>pg_temp.sid('official'))$$,'23514',null,'official reference cannot confirm ArcFort');
select throws_ok($$select pg_temp.review(102,'first',source=>pg_temp.sid('catalog'))$$,'23514',null,'company catalog cannot confirm ArcFort');
select throws_ok($$select pg_temp.review(102,'first',source=>pg_temp.sid('secondary'))$$,'23514',null,'secondary source cannot confirm');
select throws_ok($$select pg_temp.review(102,'first',source=>pg_temp.sid('next'))$$,'23514',null,'unselected source cannot confirm');
select throws_ok($$select pg_temp.review(102,'first',confirmation=>'{}')$$,'23514',null,'explicit human declaration required');
select throws_ok($$select pg_temp.review(102,'first',confirmation=>pg_temp.confirm() || '{"compatibility_not_asserted":false}')$$,'23514',null,'OEM decision must disclaim compatibility');
select lives_ok($$select pg_temp.review(102,'first')$$,'reviewer approves exact synthetic Level A declaration');
select ok(pg_temp.valid('first'),'stored exact approval is valid');
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(3);
select ok(pg_temp.valid('first'),'historical human approval survives later reviewer revocation');
select throws_ok($$select pg_temp.review(102,'first')$$,'42501',null,'revocation precedes completed receipt replay');
update console_user_roles set revoked_at=null where user_id=pg_temp.id(3);
select set_config('timezone','Asia/Shanghai',true);
select ok(pg_temp.valid('first'),'approval proof is timezone invariant');
select is(private.pi_oem_revision_digest((pg_temp.r('first')->>'revision_id')::uuid),pg_temp.r('first')->>'digest','frozen digest is timezone invariant');
select set_config('timezone','UTC',true);
select lives_ok($$select pg_temp.review(102,'first')$$,'completed review receipt replays');
select is((select count(*)::int from verification_events),1,'approval event records once');
select is((select count(*)::int from oem_revision_currents),1,'one current pointer');
select is((select verification_status::text from pi_effective_oem_references where reference_origin='current'),'CONFIRMED','effective current distinguishes confirmed decision');
select ok(not exists(select 1 from pi_effective_oem_references where publication_ready),'internal approval does not authorize publication');
select is((select count(*)::int from compatibility_relationships),0,'designation creates no compatibility');
select pg_temp.actor(1);
insert into sources values('contradiction',pg_temp.source(67,assertion=>'contradicts'));
select ok(not pg_temp.valid('first'),'new omitted contradiction invalidates current');
select is((select verification_status::text from pi_effective_oem_references where reference_origin='current'),'DATA_CONFLICT','invalid current remains visible as conflict');
select is((select invalid_current_oem_count from pi_oem_readiness where product_variant_id=pg_temp.id(12)),1,'readiness counts invalid approval');
insert into results values('second',pg_temp.propose(110,head=>(pg_temp.r('first')->>'head_id')::uuid,revision=>1));
select is((select verification_status::text from oem_revisions where id=(pg_temp.r('second')->>'revision_id')::uuid),'DATA_CONFLICT','omitted contradiction still taints new proposal');
select private.pi_oem_revision_capability();
select throws_ok($$update oem_revisions set review_state='superseded' where id=(pg_temp.r('second')->>'revision_id')::uuid$$,
  '40001',null,'transaction capability cannot silently supersede conflicted draft');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
select throws_ok($$select pg_temp.propose(111,head=>(pg_temp.r('first')->>'head_id')::uuid,revision=>2)$$,'55000',null,'conflicting draft cannot be overwritten');
select lives_ok($$select pg_temp.submit(111,'second')$$,'conflict can be frozen for human decision');
select throws_ok($$select pg_temp.review(112,'second')$$,'23514',null,'conflict requires explicit resolution');
select throws_ok($$select pg_temp.review(112,'second','EDIT',null,null,'{}','',jsonb_build_object('copy',pg_temp.copy('TEST-ONLY-002'),'sources',jsonb_build_array(pg_temp.sid('factory'))))$$,'22023',null,'bad replacement rolls back edit');
select is((select review_state from oem_revisions where id=(pg_temp.r('second')->>'revision_id')::uuid),'pending','failed edit retains pending original');
insert into results values('third',pg_temp.review(112,'second','EDIT',null,null,'{}','',
  jsonb_build_object('copy',pg_temp.copy('TEST-ONLY-002'),'sources',jsonb_build_array(pg_temp.sid('next')))));
select is((pg_temp.r('third')->>'revision')::int,3,'EDIT appends next sequence');
select is((select review_state from oem_revisions where id=(pg_temp.r('second')->>'revision_id')::uuid),'superseded','EDIT retains closed original');
select is((select verification_status::text from oem_revisions where id=(pg_temp.r('third')->>'revision_id')::uuid),'DATA_CONFLICT','changed number retains inherited conflict');
select is((select revision_id from oem_revision_currents),(pg_temp.r('first')->>'revision_id')::uuid,'EDIT leaves preceding current');
select lives_ok($$select pg_temp.submit(113,'third')$$,'edited proposal needs separate submission');
select throws_ok($$select pg_temp.review(114,'third',source=>pg_temp.sid('next'))$$,'23514',null,'changed reference cannot erase conflict without resolution');
select lives_ok($$select pg_temp.review(114,'third',source=>pg_temp.sid('next'),resolution=>'Synthetic discrepancy inspected and corrected; QA only')$$,'explicit review resolution can approve synthetic replacement');
select ok(pg_temp.valid('third'),'resolved replacement becomes valid current');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),
  (select blockers from original_rows),'review removes only the OEM blocker, not other incomplete data');
select is((select count(*)::int from oem_revisions),3,'history retains all three revisions');
insert into results values('fourth',pg_temp.propose(120,copy=>pg_temp.copy('TEST-ONLY-002'),evidence=>array[pg_temp.sid('next')],
  head=>(pg_temp.r('first')->>'head_id')::uuid,revision=>3));
select lives_ok($$select pg_temp.submit(121,'fourth')$$,'new draft submits separately');
select throws_ok($$select pg_temp.review(122,'fourth','REJECT')$$,'22023',null,'REJECT cannot carry approval payload');
select lives_ok($$select pg_temp.review(122,'fourth','REJECT',null,null,'{}')$$,'human rejection recorded');
select is((select revision_id from oem_revision_currents),(pg_temp.r('third')->>'revision_id')::uuid,'REJECT retains current');
insert into results values('legacy',pg_temp.propose(130,slot=>1,copy=>pg_temp.copy('TEST-ONLY-LEGACY'),evidence=>array[pg_temp.sid('legacy')],original=>pg_temp.id(41)));
select lives_ok($$select pg_temp.submit(131,'legacy')$$,'linked original proposal submits');
select throws_ok($$select pg_temp.review(132,'legacy','APPROVE','OEM_REFERENCE',pg_temp.sid('legacy'),pg_temp.confirm())$$,'23514',null,'reference decision cannot declare ArcFort confirmation');
select lives_ok($$select pg_temp.review(132,'legacy','APPROVE','OEM_REFERENCE',pg_temp.sid('legacy'),pg_temp.confirm('OEM_REFERENCE'))$$,'official reference retained with separate human status');
select is((select verification_status::text from pi_effective_oem_references where reference_id=(pg_temp.r('legacy')->>'revision_id')::uuid),'OEM_REFERENCE','official source remains reference only');
select is((select count(*)::int from pi_effective_oem_references where reference_id=pg_temp.id(41)),0,'linked current overlays legacy without deleting it');
select is((select jsonb_agg(to_jsonb(t) order by id) from oem_references t),(select refs from original_rows),'all original OEM rows exact');
select is((select jsonb_agg(to_jsonb(t) order by id) from product_variants t),(select variants from original_rows),'all original variants exact');
select is((select unresolved_oem_count from pi_oem_readiness where product_variant_id=pg_temp.id(13)),1,'unreviewed original conflict remains blocked');
insert into results values('empty',pg_temp.propose(140,variant=>pg_temp.id(14),evidence=>'{}'));
select lives_ok($$select pg_temp.submit(141,'empty')$$,'missing source remains reviewable but not confirmed');
select throws_ok($$select pg_temp.review(142,'empty')$$,'23514',null,'empty evidence cannot confirm');
insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
  array['oem_revision_heads','oem_revisions','oem_revision_evidence','oem_revision_decisions','oem_revision_currents','product_variants','verification_events']);
select throws_ok($$update oem_revisions set reference_number='Forged'$$,'55000',null,'content immutable even with capability');
select throws_ok($$update oem_revision_heads set slot=9$$,'55000',null,'head scope immutable even with capability');
select throws_ok($$update oem_revisions set review_state='approved' where id=(pg_temp.r('empty')->>'revision_id')::uuid$$,'40001',null,'cannot approve without decision');
select throws_ok($$select pg_temp.forge('empty')$$,'23514',null,'decision trigger independently rejects fabricated event snapshot');
select is((select count(*)::int from verification_events where id=pg_temp.id(800)),0,'forged event and decision roll back atomically');
select throws_ok($$insert into oem_revision_evidence values((pg_temp.r('empty')->>'revision_id')::uuid,pg_temp.sid('factory'))$$,'55000',null,'frozen sources cannot append even with capability');
select throws_ok($$update oem_revision_currents set revision_id=(pg_temp.r('fourth')->>'revision_id')::uuid,updated_by=auth.uid(),updated_at=now()$$,'23514',null,'current pointer cannot select rejected revision');
select throws_ok($$delete from oem_revision_decisions$$,'55000',null,'decisions cannot delete');
select throws_ok($$truncate oem_revision_heads cascade$$,'55000',null,'revision history cannot truncate');
select throws_ok($$update product_variants set lifecycle_state='VERIFIED' where id=pg_temp.id(14)$$,'23514',null,'open OEM blocks verified lifecycle');
update product_variants set model='Drifted model' where id=pg_temp.id(12);
select ok(not pg_temp.valid('legacy'),'current SKU identity drift invalidates reference approval');
select is((select count(*)::int from pi_effective_oem_references where reference_origin='current' and not review_valid),2,'both current approvals visibly invalid after drift');
select is((select count(*)::int from pi_effective_oem_references where reference_id=pg_temp.id(41)),0,'invalid current never silently falls back to legacy');
select throws_ok($$update product_variants set lifecycle_state='READY_FOR_PUBLISH' where id=pg_temp.id(12)$$,'23514',null,'invalid current blocks readiness transition');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
select pg_temp.actor(3);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(3);
select throws_ok($$select pg_temp.review(102,'first')$$,'42501',null,'revoked reviewer cannot replay approval');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.submit(151,'empty')$$,'42501',null,'viewer cannot submit');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.propose(151)$$,'42501',null,'publisher cannot propose');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.review(152,'empty')$$,'42501',null,'service claim cannot impersonate owner');
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
select pg_temp.actor(4);
select is((select count(*)::int from oem_revisions),6,'viewer reads complete governed revision history');
select pg_temp.actor(6);
select is((select count(*)::int from oem_revisions),0,'unassigned reads no revisions');
select ok(not public.pi_oem_approval_valid((pg_temp.r('legacy')->>'revision_id')::uuid),'unassigned read wrapper is closed');
select pg_temp.actor(3);
select is((select count(*)::int from oem_revision_decisions),0,'revoked reviewer cannot read decision history');
select is((select count(*)::int from pi_effective_oem_references),0,'revoked reviewer cannot read effective view');
reset role;
select pg_temp.actor(1);
select is((select count(*)::int from publish_records),0,'zero publication records');
select is((select count(*)::int from private.pi_mutation_context),0,'no mutation capability survives command');
select * from finish();
rollback;
