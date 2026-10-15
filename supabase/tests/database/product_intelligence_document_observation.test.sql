begin;
create extension if not exists pgtap with schema extensions;
set search_path=extensions,public;
set local timezone='UTC';
select plan(119);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('a8000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'document-observation-'||n||'@example.invalid',now() from generate_series(1,4) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'document-observation','document-observation','Synthetic','document-observation');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'document-observation',pg_temp.id(10),'Synthetic','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  values(pg_temp.id(12),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-9999','synthetic-document-observation',
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic observation');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create temporary table saved(label text primary key,result jsonb);
create function pg_temp.get(label text,key text) returns uuid language sql as $$
  select (result->>key)::uuid from saved where saved.label=get.label;
$$;
create function pg_temp.doc() returns uuid language sql as $$select pg_temp.get('doc','document_id');$$;
create function pg_temp.source_copy(basis text) returns jsonb language sql as $$
  select jsonb_build_object('assertion','supports','source_kind','company_record','source_level','A',
    'evidence_basis',basis,'evidence_date','2026-01-01','owner_name','Synthetic custodian',
    'source_reference','TEST-ONLY declaration','source_location','Synthetic page 1',
    'revision_label',null,'scope_note','TEST-ONLY scope','title','Synthetic source');
$$;
create function pg_temp.copy() returns jsonb language sql as $$
  select jsonb_build_object('scope_note','Synthetic whole-document review',
    'sources',jsonb_build_array(pg_temp.get('rights','source_id'),pg_temp.get('scope','source_id')));
$$;
create function pg_temp.propose(n integer,rev bigint) returns jsonb language sql as $$
  select public.pi_propose_document_review(pg_temp.id(n),pg_temp.id(12),pg_temp.doc(),rev,pg_temp.copy(),'Synthetic proposal');
$$;
create function pg_temp.submit(n integer,label text) returns jsonb language sql as $$
  select public.pi_submit_document_review(pg_temp.id(n),(result->>'candidate_id')::uuid,(result->>'revision')::bigint,result->>'digest')
  from saved where saved.label=submit.label;
$$;
create function pg_temp.snapshot(label text default 'first') returns jsonb language sql as $$
  select public.pi_document_review_snapshot((result->>'candidate_id')::uuid,(result->>'revision')::bigint,result->>'digest',pg_temp.id(80))
  from saved where saved.label=snapshot.label;
$$;
create function pg_temp.token(label text default 'first',changes jsonb default '{}') returns text language plpgsql as $$
declare data jsonb:=pg_temp.snapshot(label); payload text; epoch bigint:=floor(extract(epoch from clock_timestamp()));
begin
  data:=data||jsonb_build_object('domain','document-v1','key',pg_temp.id(80),'actor',auth.uid(),
    'issued',epoch,'expires',epoch+300,'nonce',extensions.gen_random_uuid())||changes;
  payload:=array_to_string(array[data->>'domain',data->>'key',data->>'actor',data->>'adoption_id',
    data->>'candidate_id',data->>'document_id',data->>'variant_id',data->>'revision',data->>'digest',
    data->>'original_digest',data->>'evidence_digest',data->>'issued',data->>'expires',data->>'nonce'],'|');
  return payload||'|'||encode(extensions.hmac(convert_to(payload,'UTF8'),decode(repeat('07',32),'hex'),'sha256'),'hex');
end $$;
create function pg_temp.decide(n integer,label text,token text,decision text default 'APPROVE',replacement jsonb default null)
returns jsonb language sql as $$
  select public.pi_review_document(pg_temp.id(n),candidate.id,candidate.sequence,candidate.proposal_digest,
    decision,'Synthetic human review',case when decision='APPROVE' then jsonb_build_object('original_digest',candidate.original_digest,
      'original_inspected',true,'usage_rights_confirmed',true,'exact_scope_confirmed',true) else '{}'::jsonb end,
    case when decision='APPROVE' then pg_temp.get('rights','source_id') else null end,
    case when decision='APPROVE' then pg_temp.get('scope','source_id') else null end,'',replacement,token)
  from document_review_candidates candidate where candidate.id=pg_temp.get(label,'candidate_id');
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
create temporary table document_guard_probe(id uuid,lifecycle_state public.pi_product_lifecycle);
create trigger document_guard before insert or update on document_guard_probe
  for each row execute function private.pi_guard_current_documents();
insert into saved values('baseline',jsonb_build_object('blockers',(select blocker_count from pi_variant_readiness where id=pg_temp.id(12))));
create function pg_temp.document_counts() returns jsonb language sql as $$
  select to_jsonb(readiness)-'product_variant_id' from pi_document_readiness readiness where product_variant_id=pg_temp.id(12);
$$;
create function pg_temp.expected_counts(total integer,reviewed integer,unresolved integer,unavailable integer,open integer,invalid integer,conflicts integer)
returns jsonb language sql as $$
  select jsonb_build_object('document_count',total,'reviewed_document_count',reviewed,'unresolved_document_count',unresolved,
    'unavailable_original_count',unavailable,'open_document_review_count',open,'invalid_document_approval_count',invalid,'document_conflict_count',conflicts);
$$;
select is(pg_temp.document_counts(),pg_temp.expected_counts(0,0,0,0,0,0,0),'no registered documents is explicit zero, not a missing-document policy');
select lives_ok($$insert into document_guard_probe values(pg_temp.id(12),'VERIFIED')$$,'no documents adds no document guard failure');
select ok(not public.pi_document_original_current(null) and not public.pi_document_approval_valid(null),'null document and approval fail closed');
select is((select count(*)::int from information_schema.columns where table_schema='public' and table_name='pi_variant_readiness'),20,'legacy readiness contract retains twenty columns');
select is((select count(*)::int from pi_dashboard_metrics),9,'dashboard retains nine metrics');
insert into saved values('doc',public.pi_add_document_reference(pg_temp.id(100),pg_temp.id(12),jsonb_build_object(
  'source_level','A','source_kind','company_record','document_type','drawing','issued_date',null,
  'owner_name','Synthetic custodian','source_reference','TEST-ONLY','source_location','Page 1',
  'revision_label',null,'scope_note','Synthetic scope','title','Synthetic drawing')));
select is(pg_temp.document_counts(),pg_temp.expected_counts(1,0,1,1,0,0,0),'reference without original is unresolved and unavailable');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),
  (select (result->>'blockers')::int+1 from saved where label='baseline'),'documents add exactly one blocker family');
select throws_ok(format('insert into document_guard_probe values(%L,%L)',pg_temp.id(12),state),
  '23514','Unresolved or invalid document review blocks publishable lifecycle states.','unreviewed document blocks '||state)
from unnest(array['VERIFIED','READY_FOR_PUBLISH','QA_PASSED','PUBLISHED']) state;
select lives_ok($$insert into document_guard_probe values(pg_temp.id(12),'NEEDS_UPDATE')$$,'blocked document permits return to remediation');
insert into saved values('intent',public.pi_begin_document_upload(pg_temp.id(101),pg_temp.doc(),
  jsonb_build_object('filename','synthetic.pdf','file_hash',repeat('a',64),'byte_size',60,'mime_type','application/pdf','page_count',1)));
insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
  select pg_temp.id(60),'pi-technical-evidence',result->>'storage_path',pg_temp.id(1)::text,
    '{"size":60,"mimetype":"application/pdf"}','synthetic-only' from saved where label='intent';
select public.pi_complete_document_upload(pg_temp.id(102),(result->>'intent_id')::uuid) from saved where label='intent';
insert into saved values('rights',public.pi_add_document_source(pg_temp.id(200),pg_temp.id(12),pg_temp.doc(),
  'usage_rights',pg_temp.source_copy('company_ownership')));
insert into saved values('scope',public.pi_add_document_source(pg_temp.id(201),pg_temp.id(12),pg_temp.doc(),
  'exact_scope',pg_temp.source_copy('controlled_drawing')));
insert into saved values('first',pg_temp.propose(300,0));
select pg_temp.submit(301,'first');
select is(pg_temp.document_counts(),pg_temp.expected_counts(1,0,1,0,1,0,0),'uploaded pending review stays unresolved');
select ok(not (select publication_ready from pi_effective_document_reviews),'document review never asserts publication readiness');
select is((public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'sources'->>'total')::int,2,'review sources counted');
select is((public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'history'->>'total')::int,1,'review history counted');
select ok(public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'latest'->'decision'='null'::jsonb,'pending decision explicit');
select ok(public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)::text !~ 'storage_path|raw_snapshot|token_digest|secret|working-documents','workbench excludes private storage and signing material');
select is((select count(*)::int from private.pi_document_observation_keys),0,'migration provisions no key');
select ok(not private.pi_document_observation_signature_matches('payload','bad',decode(repeat('07',32),'hex')),'malformed signature rejected safely');
select ok(not private.pi_document_observation_signature_matches('payload',repeat('0',64),decode(repeat('07',32),'hex')),'all signature bytes must match');
select ok(not private.pi_document_observation_signature_matches('payload',null,decode(repeat('07',32),'hex')),'null signature rejected safely');
select throws_ok($$select pg_temp.snapshot()$$,'55000',null,'snapshot unavailable without configured key');
insert into private.pi_document_observation_keys values(pg_temp.id(80),decode(repeat('07',32),'hex'),
  clock_timestamp()-interval '1 hour',clock_timestamp()+interval '1 hour',false);
select throws_ok($$select pg_temp.snapshot()$$,'55000',null,'disabled key refused');
update private.pi_document_observation_keys set enabled=true;
select lives_ok($$select pg_temp.snapshot()$$,'current pending snapshot with active key');
select is((select count(*)::int from pg_class where oid in ('private.pi_document_observation_keys'::regclass,
  'private.pi_document_review_observations'::regclass) and relrowsecurity and relforcerowsecurity),2,'key and ledger force RLS');
select ok(not has_table_privilege('authenticated','private.pi_document_observation_keys','select,insert,update,delete')
  and not has_table_privilege('service_role','private.pi_document_review_observations','select,insert,update,delete'),'private key/ledger grants absent');
select ok(has_function_privilege('authenticated','public.pi_review_document(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb,text)','execute')
  and not has_function_privilege('anon','public.pi_review_document(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb,text)','execute')
  and not has_function_privilege('service_role','public.pi_document_review_snapshot(uuid,bigint,text,uuid)','execute'),'public wrappers authenticated only');
select ok(not has_function_privilege('authenticated','private.pi_review_document(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb)','execute'),'human-only bypass not granted');
select throws_ok($$select pg_temp.decide(310,'first',null)$$,'23514',null,'approval needs signed observation');
select throws_ok($$select pg_temp.decide(310,'first','unsigned')$$,'23514',null,'unsigned token refused');
select throws_ok($$select pg_temp.decide(310,'first',repeat('x',1201))$$,'23514',null,'oversized token refused');
select throws_ok($$select pg_temp.decide(310,'first',pg_temp.token()||'|extra')$$,'23514',null,'extra token field refused');
select throws_ok($$select pg_temp.decide(310,'first',left(pg_temp.token(),length(pg_temp.token())-64)||repeat('0',64))$$,'23514',null,'tampered HMAC refused');
select throws_ok(format('select pg_temp.decide(310,%L,pg_temp.token(%L,%L::jsonb))','first','first',change),
  '23514',null,'signed wrong binding refused: '||label)
from (values
  ('media domain','{"domain":"v1"}'),
  ('key',jsonb_build_object('key',pg_temp.id(81))::text),
  ('actor',jsonb_build_object('actor',pg_temp.id(3))::text),
  ('adoption',jsonb_build_object('adoption_id',pg_temp.id(51))::text),
  ('candidate',jsonb_build_object('candidate_id',pg_temp.id(999))::text),
  ('document',jsonb_build_object('document_id',pg_temp.id(999))::text),
  ('SKU',jsonb_build_object('variant_id',pg_temp.id(13))::text),
  ('revision','{"revision":2}'),
  ('candidate digest',jsonb_build_object('digest',repeat('b',64))::text),
  ('original digest',jsonb_build_object('original_digest',repeat('b',64))::text),
  ('evidence digest',jsonb_build_object('evidence_digest',repeat('b',64))::text),
  ('malformed UUID','{"nonce":"not-a-uuid"}'),
  ('expired',jsonb_build_object('issued',floor(extract(epoch from clock_timestamp()))-310,'expires',floor(extract(epoch from clock_timestamp()))-10)::text),
  ('future',jsonb_build_object('issued',floor(extract(epoch from clock_timestamp()))+10,'expires',floor(extract(epoch from clock_timestamp()))+310)::text),
  ('excessive TTL',jsonb_build_object('expires',floor(extract(epoch from clock_timestamp()))+600)::text)
) changes(label,change);
select is((select count(*)::int from verification_events),0,'invalid observations create no decision event');
select throws_ok($$select public.pi_review_document(pg_temp.id(310),candidate.id,candidate.sequence,candidate.proposal_digest,
  'APPROVE','Synthetic missing declaration','{}',pg_temp.get('rights','source_id'),pg_temp.get('scope','source_id'),'',null,pg_temp.token())
  from document_review_candidates candidate where candidate.id=pg_temp.get('first','candidate_id')$$,
  '23514',null,'valid signature cannot substitute for human declarations');
insert into saved values('token',jsonb_build_object('token',pg_temp.token('first',jsonb_build_object('nonce',pg_temp.id(90)))));
update private.pi_document_observation_keys set secret=decode(repeat('08',32),'hex');
select throws_ok($$select pg_temp.decide(310,'first',(select result->>'token' from saved where label='token'))$$,'23514',null,'rotated secret rejects old token');
update private.pi_document_observation_keys set secret=decode(repeat('07',32),'hex'),valid_until=clock_timestamp()+interval '1 minute';
select throws_ok($$select pg_temp.snapshot()$$,'55000',null,'snapshot requires full signing lifetime');
select throws_ok($$select pg_temp.decide(310,'first',(select result->>'token' from saved where label='token'))$$,'23514',null,'token cannot exceed key lifetime');
update private.pi_document_observation_keys set valid_until=clock_timestamp()+interval '1 hour';
select pg_temp.actor(2);
select throws_ok($$select pg_temp.snapshot()$$,'42501',null,'editor cannot obtain reviewer snapshot');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.decide(310,'first',(select result->>'token' from saved where label='token'))$$,'42501',null,'viewer cannot approve');
select pg_temp.actor(1);
select lives_ok($$select pg_temp.decide(310,'first',(select result->>'token' from saved where label='token'))$$,'valid observation plus human evidence approves synthetic candidate');
select is(pg_temp.document_counts(),pg_temp.expected_counts(1,1,0,0,0,0,0),'signed human approval clears document blocker');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),
  (select (result->>'blockers')::int from saved where label='baseline'),'document approval never clears other blocker families');
select lives_ok($$insert into document_guard_probe values(pg_temp.id(12),'VERIFIED')$$,'current signed approval passes only document lifecycle guard');
select ok(public.pi_document_approval_valid(pg_temp.get('first','candidate_id')),'effective approval requires current evidence and observation');
select ok((public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'current'->>'human_valid')::boolean,'current human evidence valid');
select ok((public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'current'->>'observed')::boolean,'current signed observation projected');
select is(public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'current',public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'latest','latest approval and current agree');
select ok(public.pi_document_review_observed(pg_temp.get('first','candidate_id')),'historical observation exists');
select is((select count(*)::int from private.pi_document_review_observations),1,'single immutable observation');
select is((select token_digest from private.pi_document_review_observations),
  (select encode(extensions.digest(result->>'token','sha256'),'hex') from saved where label='token'),'only token digest retained');
select ok(not exists(select 1 from private.pi_command_receipts where to_jsonb(pi_command_receipts)::text like
  '%'||(select result->>'token' from saved where label='token')||'%') and not exists(select 1 from audit_events where
  to_jsonb(audit_events)::text like '%'||(select result->>'token' from saved where label='token')||'%'),'raw token absent from receipts/audit');
select ok(not exists(select 1 from verification_events where to_jsonb(verification_events)::text like
  '%'||(select result->>'token' from saved where label='token')||'%' or to_jsonb(verification_events)::text like
  '%'||repeat('07',32)||'%'),'event stores neither raw token nor signing key');
update private.pi_document_observation_keys set enabled=false;
select lives_ok($$select pg_temp.decide(310,'first',(select result->>'token' from saved where label='token'))$$,'completed exact receipt replay survives key disable');
select ok(public.pi_document_review_observed(pg_temp.get('first','candidate_id')),'key disable does not erase history');
select is(pg_temp.document_counts(),pg_temp.expected_counts(1,1,0,0,0,0,0),'historical signed approval survives key disable');
select throws_ok($$select pg_temp.decide(310,'first','changed')$$,'40001',null,'receipt replay cannot change observation');
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(1);
select throws_ok($$select pg_temp.decide(310,'first',(select result->>'token' from saved where label='token'))$$,'42501',null,'revoked owner cannot replay');
update console_user_roles set revoked_at=null where user_id=pg_temp.id(1);
update private.pi_document_observation_keys set enabled=true;
insert into saved values('second',pg_temp.propose(320,1));
select pg_temp.submit(321,'second');
select is(pg_temp.document_counts(),pg_temp.expected_counts(1,0,1,0,1,0,0),'open successor blocks despite still-valid current approval');
select ok(public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'latest'->'decision'='null'::jsonb
  and public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'current'->>'candidate_id'<>public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'latest'->>'candidate_id','old approval cannot hide new pending candidate');
select throws_ok($$select pg_temp.decide(322,'second',pg_temp.token('second',jsonb_build_object('nonce',pg_temp.id(90))))$$,
  '23505',null,'nonce cannot authorize a second candidate');
select is((select count(*)::int from document_review_decisions),1,'nonce collision rolls back new decision');
select is((select count(*)::int from verification_events),1,'nonce collision rolls back new event');
select is((select candidate_id from document_review_currents),pg_temp.get('first','candidate_id'),'nonce collision rolls back current advance');
select lives_ok($$select pg_temp.decide(322,'second',pg_temp.token('second'))$$,'fresh nonce permits exact second approval');
insert into saved values('third',pg_temp.propose(330,2));
select pg_temp.submit(331,'third');
insert into saved values('third-token',jsonb_build_object('token',pg_temp.token('third')));
update storage.objects set version='changed' where id=pg_temp.id(60);
select is(pg_temp.document_counts(),pg_temp.expected_counts(1,0,1,1,1,1,0),'original drift invalidates current approval and flags unavailable bytes');
select ok(not (public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->>'original_current')::boolean
  and not (public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'current'->>'fresh')::boolean,'changed original invalidates read state');
select throws_ok($$select pg_temp.decide(332,'third',(select result->>'token' from saved where label='third-token'))$$,
  '40001',null,'changed original refused before token acceptance');
select lives_ok($$select pg_temp.decide(332,'third',null,'REJECT')$$,'stale document rejection needs no observation');
select is(pg_temp.document_counts(),pg_temp.expected_counts(1,0,1,1,0,1,0),'rejecting new proposal does not repair stale current approval');
select ok(not public.pi_document_review_observed(pg_temp.get('third','candidate_id')),'rejection not marked observed');
update storage.objects set version='synthetic-only' where id=pg_temp.id(60);
insert into saved values('fourth',pg_temp.propose(340,3));
select pg_temp.submit(341,'fourth');
select throws_ok($$select pg_temp.decide(342,'fourth',pg_temp.token('fourth'),'EDIT',pg_temp.copy())$$,'22023',null,'EDIT cannot carry observation');
select lives_ok($$select pg_temp.decide(342,'fourth',null,'EDIT',pg_temp.copy())$$,'unsigned EDIT remains unconfirmed atomic replacement');
select is((select count(*)::int from private.pi_document_review_observations),2,'only approvals have observation rows');
select throws_ok($$update private.pi_document_review_observations set token_digest=repeat('b',64)$$,'55000',null,'observations immutable');
select throws_ok($$truncate private.pi_document_review_observations$$,'55000',null,'observation history cannot be cleared');
select pg_temp.actor(4);
select ok(public.pi_document_review_observed(pg_temp.get('second','candidate_id')),'current viewer may read historical observation boolean');
select ok(public.pi_document_approval_valid(pg_temp.get('second','candidate_id')),'current viewer may read evidence-valid prior approval');
select set_config('request.jwt.claim.role','service_role',true);
select ok(not public.pi_document_original_current(pg_temp.doc()) and not public.pi_document_approval_valid(pg_temp.get('second','candidate_id')),'service claim cannot query document readiness booleans');
select ok(not public.pi_document_review_observed(pg_temp.get('second','candidate_id')),'service claim cannot read private observation');
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
select is((select count(*)::int from private.pi_mutation_context),0,'no lingering mutation capability');
select is((select byte_verification from document_upload_completions),'not_attested','SQL observation does not mutate completion attestation');
select is((select count(*)::int from publish_records)+(select count(*)::int from technical_values)
  +(select count(*)::int from compatibility_relationships),0,'no publication, technical or compatibility mutation');
select ok(has_function_privilege('authenticated','public.pi_read_document_review(uuid,uuid,integer,integer)','execute')
  and not has_function_privilege('anon','public.pi_read_document_review(uuid,uuid,integer,integer)','execute')
  and not has_function_privilege('service_role','public.pi_read_document_review(uuid,uuid,integer,integer)','execute'),'workbench read grants scoped');
select throws_ok($$select public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),0,1)$$,'22023',null,'invalid source page refused');
select is(public.pi_read_document_review(pg_temp.id(13),pg_temp.doc(),1,1),null::jsonb,'wrong SKU does not return document');
select set_config('request.jwt.claim.role','anon',true);
select throws_ok($$select public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)$$,'42501',null,'anonymous read denied');
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)$$,'42501',null,'service read denied');
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select lives_ok($$select public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)$$,'viewer may read bounded history');
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(4);
select throws_ok($$select public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)$$,'42501',null,'revoked viewer read denied');
select pg_temp.actor(1);
select public.pi_add_document_source(pg_temp.id(400+n),pg_temp.id(12),pg_temp.doc(),'usage_rights',
  pg_temp.source_copy('company_ownership')) from generate_series(1,26) n;
select is((public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),2,1)->'sources'->>'total')::int,28,'sources count exceeds one page');
select is(jsonb_array_length(public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),2,1)->'sources'->'items'),3,'source second page exact remainder');
select ok(not (public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'current'->>'human_valid')::boolean
  and (public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,1)->'current'->>'observed')::boolean,'new evidence invalidates human validity but retains observed history');
select is(pg_temp.document_counts(),pg_temp.expected_counts(1,0,1,0,1,1,0),'new source evidence invalidates readiness without deleting approval');
select public.pi_add_document_source(pg_temp.id(900),pg_temp.id(12),pg_temp.doc(),'exact_scope',
  pg_temp.source_copy('controlled_drawing')||'{"assertion":"contradicts"}'::jsonb);
select is(pg_temp.document_counts(),pg_temp.expected_counts(1,0,1,0,1,1,1),'known contradiction is visible as unresolved document conflict');
select pg_temp.propose(500+n,4+n) from generate_series(1,25) n;
select is((public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,2)->>'revision')::int,30,'latest revision retained independently of history page');
select is(jsonb_array_length(public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,2)->'history'->'items'),5,'history second page exact remainder');
select is((public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),1,2)->'history'->'items'->0->>'revision')::int,5,'history sequence order stable');
select is(jsonb_array_length(public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),2,2)->'selected_sources'),2,'selected sources independent of source page');
select is(jsonb_array_length(public.pi_read_document_review(pg_temp.id(12),pg_temp.doc(),10000,10000)->'history'->'items'),0,'empty page preserves bounded result');
select ok(has_table_privilege('authenticated','public.pi_variant_document_readiness','select')
  and not has_table_privilege('anon','public.pi_variant_document_readiness','select')
  and not has_table_privilege('service_role','public.pi_document_readiness','select'),'document readiness grants are authenticated reader only');
set local role authenticated;
select is((select count(*)::int from public.pi_document_readiness),1,'RLS-authorized reader sees scoped readiness');
reset role;
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(1);
set local role authenticated;
select is((select count(*)::int from public.pi_document_readiness),0,'revoked reader sees no readiness rows');
reset role;
select * from finish();
rollback;
