begin;
create extension if not exists pgtap with schema extensions;
set search_path=extensions,public;
set local timezone='UTC';
select plan(88);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('a7000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'document-review-'||n||'@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'document-review','document-review','Synthetic','document-review');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'document-review',pg_temp.id(10),'Synthetic','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  values(pg_temp.id(12),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-9999','synthetic-document-review',
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic document review');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create temporary table saved(label text primary key,result jsonb);
create function pg_temp.get(label text,key text) returns uuid language sql as $$
  select (result->>key)::uuid from saved where saved.label=get.label;
$$;
create function pg_temp.doc(n integer default 1) returns uuid language sql as $$
  select pg_temp.get('document-'||n,'document_id');
$$;
create function pg_temp.source_copy(basis text,assertion text default 'supports') returns jsonb language sql as $$
  select jsonb_build_object('assertion',assertion,'source_kind','company_record','source_level','A',
    'evidence_basis',basis,'evidence_date','2026-01-01','owner_name','Synthetic custodian',
    'source_reference','TEST-ONLY declaration','source_location','Synthetic page 1',
    'revision_label',null,'scope_note','TEST-ONLY scope','title','Synthetic source');
$$;
create function pg_temp.copy() returns jsonb language sql as $$
  select jsonb_build_object('scope_note','Synthetic whole-document rights and SKU scope',
    'sources',jsonb_build_array(pg_temp.get('rights','source_id'),pg_temp.get('scope','source_id')));
$$;
create function pg_temp.propose(n integer,rev bigint,copy jsonb default pg_temp.copy()) returns jsonb language sql as $$
  select private.pi_propose_document_review(pg_temp.id(n),pg_temp.id(12),pg_temp.doc(),rev,copy,'Synthetic proposal');
$$;
create function pg_temp.submit(n integer,label text) returns jsonb language sql as $$
  select private.pi_submit_document_review(pg_temp.id(n),(result->>'candidate_id')::uuid,(result->>'revision')::bigint,result->>'digest')
  from saved where saved.label=submit.label;
$$;
create function pg_temp.confirm(label text) returns jsonb language sql as $$
  select jsonb_build_object('original_digest',original_digest,'original_inspected',true,
    'usage_rights_confirmed',true,'exact_scope_confirmed',true)
  from document_review_candidates where id=pg_temp.get(label,'candidate_id');
$$;
create function pg_temp.decide(n integer,label text,decision text default 'APPROVE',resolution text default '',
  replacement jsonb default null,confirmation jsonb default null,rights uuid default pg_temp.get('rights','source_id'),
  scope uuid default pg_temp.get('scope','source_id')) returns jsonb language sql as $$
  select private.pi_review_document(pg_temp.id(n),(result->>'candidate_id')::uuid,(result->>'revision')::bigint,
    result->>'digest',decision,'Synthetic human review',coalesce(confirmation,case when decision='APPROVE'
      then pg_temp.confirm(label) else '{}'::jsonb end),case when decision='APPROVE' then rights else null end,
    case when decision='APPROVE' then scope else null end,resolution,replacement)
  from saved where saved.label=decide.label;
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
do $$ declare n integer; document jsonb; intent jsonb; begin
  for n in 1..2 loop
    document:=public.pi_add_document_reference(pg_temp.id(100+n),pg_temp.id(12),jsonb_build_object(
      'source_level','A','source_kind','company_record','document_type','drawing','issued_date',null,
      'owner_name','Synthetic custodian','source_reference','TEST-ONLY','source_location','Page 1',
      'revision_label',null,'scope_note','Synthetic scope','title','Synthetic drawing'));
    insert into saved values('document-'||n,document);
    intent:=public.pi_begin_document_upload(pg_temp.id(110+n),(document->>'document_id')::uuid,
      jsonb_build_object('filename','synthetic.pdf','file_hash',repeat('a',64),'byte_size',60,'mime_type','application/pdf','page_count',1));
    insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
      values(pg_temp.id(60+n),'pi-technical-evidence',intent->>'storage_path',pg_temp.id(1)::text,
        '{"size":60,"mimetype":"application/pdf"}','synthetic-only');
    perform public.pi_complete_document_upload(pg_temp.id(120+n),(intent->>'intent_id')::uuid);
  end loop;
end $$;
insert into saved values('rights',private.pi_add_document_source(pg_temp.id(200),pg_temp.id(12),pg_temp.doc(),
  'usage_rights',pg_temp.source_copy('company_ownership')));
insert into saved values('scope',private.pi_add_document_source(pg_temp.id(201),pg_temp.id(12),pg_temp.doc(),
  'exact_scope',pg_temp.source_copy('controlled_drawing')));
insert into saved values('foreign',private.pi_add_document_source(pg_temp.id(202),pg_temp.id(12),pg_temp.doc(2),
  'exact_scope',pg_temp.source_copy('controlled_drawing')));
create temporary table original_documents as select to_jsonb(t) row from technical_documents t;
create temporary table original_sources as select to_jsonb(t) row from evidence_sources t;

select is((select count(*)::int from pg_class where relname like 'document_review_%' and relkind='r'
  and relrowsecurity and relforcerowsecurity),5,'all five review tables force RLS');
select ok(not exists(select 1 from unnest(array['document_review_heads','document_review_candidates',
  'document_review_submissions','document_review_decisions','document_review_currents']) name
  where has_table_privilege('authenticated',name,'insert,update,delete') or has_table_privilege('anon',name,'select')
    or has_table_privilege('service_role',name,'select,insert,update,delete')),'tables deny direct mutations and anon/service access');
select ok(not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and (p.proname like '%document_review%' or p.proname='pi_review_document')
  and (has_function_privilege('authenticated',p.oid,'execute') or has_function_privilege('service_role',p.oid,'execute')
    or has_function_privilege('anon',p.oid,'execute'))),'no caller may execute private review contracts');
select throws_ok($$select pg_temp.propose(300,null)$$,'40001',null,'missing expected revision refused');
select throws_ok($$select pg_temp.propose(300,1)$$,'40001',null,'stale initial revision refused');
select throws_ok($$select pg_temp.propose(300,0,pg_temp.copy()||'{"approved":true}')$$,'22023',null,'extra review copy keys refused');
select throws_ok($$select pg_temp.propose(300,0,pg_temp.copy()||'{"scope_note":" "}')$$,'22023',null,'blank scope refused');
select throws_ok($$select pg_temp.propose(300,0,pg_temp.copy()||'{"sources":[null]}')$$,'22023',null,'null source refused');
select throws_ok($$select pg_temp.propose(300,0,jsonb_set(pg_temp.copy(),'{sources}',jsonb_build_array(pg_temp.get('rights','source_id'),pg_temp.get('rights','source_id'))))$$,'22023',null,'duplicate source refused');
select throws_ok($$select pg_temp.propose(300,0,jsonb_set(pg_temp.copy(),'{sources}',jsonb_build_array(pg_temp.get('foreign','source_id'))))$$,'22023',null,'cross-document source refused');
select is((select count(*)::int from document_review_heads),0,'failed proposal rolls back head');
insert into saved values('first',pg_temp.propose(300,0));
select is(pg_temp.propose(300,0),(select result from saved where label='first'),'exact proposal retry returns receipt');
select is((select count(*)::int from document_review_candidates),1,'retry creates no new candidate');
select throws_ok($$select pg_temp.propose(300,0,pg_temp.copy()||'{"scope_note":"Changed"}')$$,'40001',null,'request reuse with altered payload refused');
select is((select verification_status::text from document_review_candidates),'NEEDS_FACTORY_CONFIRMATION','candidate remains unconfirmed');
select throws_ok($$select pg_temp.decide(310,'first')$$,'40001',null,'unsubmitted candidate cannot be approved');
select lives_ok($$select pg_temp.submit(301,'first')$$,'submission freezes current snapshot');
select is(pg_temp.submit(301,'first')->>'digest',(select result->>'digest' from saved where label='first'),'submission retry exact');
select throws_ok($$select pg_temp.propose(302,1)$$,'55000',null,'pending candidate cannot be overwritten');
select throws_ok($$select pg_temp.decide(310,'first','APPROVE','',null,'{}')$$,'23514',null,'empty confirmation refused');
select throws_ok($$select pg_temp.decide(310,'first','APPROVE','',null,pg_temp.confirm('first')||'{"extra":true}')$$,'23514',null,'extra confirmation fields refused');
select throws_ok($$select pg_temp.decide(310,'first','APPROVE','',null,null,pg_temp.get('scope','source_id'),pg_temp.get('rights','source_id'))$$,'23514',null,'evidence dimensions cannot swap');
select throws_ok($$select pg_temp.decide(310,'first','APPROVE','',null,null,null)$$,'23514',null,'missing rights source refused');
select is((select count(*)::int from verification_events),0,'failed decisions leave no event');
select pg_temp.actor(2);
select throws_ok($$select pg_temp.decide(310,'first')$$,'42501',null,'editor cannot approve');
select pg_temp.actor(3);
insert into saved values('approved',pg_temp.decide(310,'first'));
select is(pg_temp.decide(310,'first'),(select result from saved where label='approved'),'reviewer exact decision replay');
select ok(private.pi_document_review_approval_valid(pg_temp.get('first','candidate_id')),'human approval is valid for exact evidence');
select is((select candidate_id from document_review_currents),pg_temp.get('first','candidate_id'),'only approved candidate advances current');
select is((select created_by from document_review_decisions),pg_temp.id(3),'decision attributed to actual reviewer');
select is((select before_value from verification_events),(select to_jsonb(t) from document_review_candidates t),'event retains immutable candidate');
set local timezone='Asia/Shanghai';
select ok(private.pi_document_review_approval_valid(pg_temp.get('first','candidate_id')),'approval remains timezone-stable');
set local timezone='UTC';
select pg_temp.actor(1);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(3);
select ok(private.pi_document_review_approval_valid(pg_temp.get('first','candidate_id')),'role revocation does not erase historical approval');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.decide(310,'first')$$,'42501',null,'revoked reviewer cannot replay');
select pg_temp.actor(1);
update console_user_roles set revoked_at=null where user_id=pg_temp.id(3);
select throws_ok($$select pg_temp.decide(311,'first')$$,'40001',null,'new request cannot decide twice');
insert into saved values('second',pg_temp.propose(320,1));
select is((select predecessor_id from document_review_candidates where id=pg_temp.get('second','candidate_id')),pg_temp.get('first','candidate_id'),'new candidate retains predecessor');
select is((select candidate_id from document_review_currents),pg_temp.get('first','candidate_id'),'open candidate does not replace current');
select lives_ok($$select pg_temp.submit(321,'second')$$,'second candidate submitted');
select throws_ok($$select pg_temp.decide(322,'second','EDIT','',pg_temp.copy()||'{"scope_note":" "}')$$,'22023',null,'invalid edit refused');
select is((select count(*)::int from document_review_decisions),1,'failed edit leaves no decision');
select is((select count(*)::int from verification_events),1,'failed edit leaves no event');
select is((select revision::int from document_review_heads),2,'failed edit leaves head unchanged');
select throws_ok($$select pg_temp.decide(322,'second','EDIT','',pg_temp.copy(),' {"original_inspected":true}')$$,'22023',null,'edit cannot assert confirmation');
select throws_ok($$select pg_temp.decide(322,'second','REJECT','',pg_temp.copy())$$,'22023',null,'reject cannot include replacement');
select pg_temp.actor(3);
insert into saved values('edited',pg_temp.decide(322,'second','EDIT','',pg_temp.copy()||'{"scope_note":"Corrected synthetic scope"}'));
select is((select revision::int from document_review_heads),3,'edit atomically appends replacement');
select is((select sequence::int from document_review_candidates where id=pg_temp.get('edited','candidate_id')),3,'replacement has next sequence');
select is((select verification_status::text from document_review_candidates where sequence=3),'NEEDS_FACTORY_CONFIRMATION','edit does not confirm replacement');
select is((select count(*)::int from document_review_submissions),2,'edited replacement not submitted automatically');
select lives_ok($$select pg_temp.submit(323,'edited')$$,'reviewer can submit replacement');
select lives_ok($$select pg_temp.decide(324,'edited','REJECT')$$,'reviewer can reject');
select is((select candidate_id from document_review_currents),pg_temp.get('first','candidate_id'),'reject retains prior current');
select pg_temp.actor(1);
insert into saved values('fourth',pg_temp.propose(330,3));
insert into saved values('conflict',private.pi_add_document_source(pg_temp.id(203),pg_temp.id(12),pg_temp.doc(),
  'exact_scope',pg_temp.source_copy('controlled_drawing','contradicts')));
select ok(not private.pi_document_review_approval_valid(pg_temp.get('first','candidate_id')),'new contradiction invalidates historical current proof');
select throws_ok($$select pg_temp.submit(331,'fourth')$$,'40001',null,'new evidence makes unsubmitted snapshot stale');
insert into saved values('fifth',pg_temp.propose(332,4));
select is((select verification_status::text from document_review_candidates where sequence=5),'DATA_CONFLICT','omitted contradiction still forces conflict');
select lives_ok($$select pg_temp.submit(333,'fifth')$$,'conflicting candidate can enter human review');
select throws_ok($$select pg_temp.decide(334,'fifth')$$,'22023',null,'conflict approval needs resolution');
select throws_ok($$select pg_temp.decide(334,'fifth','APPROVE',' ')$$,'22023',null,'blank conflict resolution refused');
select lives_ok($$select pg_temp.decide(334,'fifth','APPROVE','TEST-ONLY reviewed conflicting scope')$$,'explicit human resolution can approve synthetic evidence');
select ok(private.pi_document_review_approval_valid(pg_temp.get('fifth','candidate_id')),'resolved conflict current proof valid');
select is((select count(*)::int from document_source_bindings where assertion='contradicts'),1,'contradiction is retained');
insert into saved values('sixth',pg_temp.propose(340,5));
select lives_ok($$select pg_temp.submit(341,'sixth')$$,'next immutable review submitted');
update storage.objects set version='changed' where id=pg_temp.id(61);
select ok(not private.pi_document_review_approval_valid(pg_temp.get('fifth','candidate_id')),'original drift invalidates current proof');
select throws_ok($$select pg_temp.decide(342,'sixth','APPROVE','TEST-ONLY resolution')$$,'23514',null,'stale original never approved');
select throws_ok($$select pg_temp.decide(342,'sixth','EDIT','',pg_temp.copy())$$,'40001',null,'stale original cannot produce replacement');
select is((select count(*)::int from document_review_decisions),4,'stale edit rolls back decision');
select lives_ok($$select pg_temp.decide(342,'sixth','REJECT')$$,'stale original can be rejected without approval');
select ok((select observed_original_digest is null from document_review_decisions where candidate_id=pg_temp.get('sixth','candidate_id')),'stale rejection records missing observed digest');
update storage.objects set version='synthetic-only' where id=pg_temp.id(61);
insert into saved values('seventh',pg_temp.propose(350,6,pg_temp.copy()||'{"sources":[]}'));
select is((select verification_status::text from document_review_candidates where sequence=7),'DATA_CONFLICT','new selection cannot clear inherited conflict');
select lives_ok($$select pg_temp.submit(351,'seventh')$$,'empty-source candidate may request review');
select throws_ok($$select pg_temp.decide(352,'seventh','APPROVE','TEST-ONLY resolution')$$,'23514',null,'unselected valid sources cannot authorize review');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.submit(351,'seventh')$$,'42501',null,'viewer cannot replay submit');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.propose(350,6,pg_temp.copy()||'{"sources":[]}')$$,'42501',null,'publisher cannot replay proposal');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.decide(352,'seventh','REJECT')$$,'42501',null,'unassigned cannot decide');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.decide(352,'seventh','REJECT')$$,'42501',null,'service cannot impersonate owner');
select set_config('request.jwt.claim.role','authenticated',true);
select is((select count(*)::int from private.pi_mutation_context),0,'capabilities cleaned after success and failure');
select throws_ok($$update document_review_candidates set scope_note='changed'$$,'55000',null,'unscoped write refused');
select private.pi_document_review_capability();
select throws_ok($$update document_review_candidates set scope_note='changed'$$,'55000',null,'candidate immutable with capability');
select throws_ok($$delete from document_review_submissions$$,'55000',null,'submission immutable');
select throws_ok($$delete from document_review_decisions$$,'55000',null,'decision immutable');
select throws_ok($$truncate document_review_currents$$,'55000',null,'current history cannot be truncated');
select throws_ok($$delete from document_review_currents$$,'55000',null,'current history cannot be deleted');
select throws_ok($$update document_review_heads set revision=revision+1$$,'55000',null,'capability cannot bypass pending decision');
select throws_ok($$update document_review_currents set candidate_id=pg_temp.get('seventh','candidate_id')$$,'23514',null,'capability cannot forge current approval');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
set local role authenticated;
select pg_temp.actor(4);
select is((select count(*)::int from document_review_candidates),7,'viewer can read immutable history');
select pg_temp.actor(6);
select is((select count(*)::int from document_review_candidates),0,'unassigned cannot read review history');
reset role;
select pg_temp.actor(1);
select results_eq($$select to_jsonb(t) from technical_documents t order by id$$,$$select row from original_documents order by row->>'id'$$,'review never changes document rights or publication flags');
select results_eq($$select to_jsonb(t) from evidence_sources t where id in (select (row->>'id')::uuid from original_sources) order by id$$,
  $$select row from original_sources order by row->>'id'$$,'original evidence retained exactly');
select ok((select bool_and(byte_verification='not_attested') from document_upload_completions),'human review does not attest file bytes');
select is((select count(*)::int from publish_records)+(select count(*)::int from technical_values)
  +(select count(*)::int from compatibility_relationships),0,'no technical, compatibility or publication mutation');
select * from finish();
rollback;
