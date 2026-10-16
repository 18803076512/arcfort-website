begin;
create extension if not exists pgtap with schema extensions;
set search_path=extensions,public;
set local timezone='UTC';
select plan(61);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('97000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'media-command-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'media-command-category','media-command','Synthetic media command category','media-command');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'media-command-product',pg_temp.id(10),'Synthetic media command product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),'media-command-test-' || n,
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED' from generate_series(12,15) n;
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,
  pilot_variant_ids,actor_id,reason) values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic observed-review fixture');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
-- Synthetic test-only key; there is no Storage byte attestation in this SQL fixture.
insert into private.pi_media_observation_keys values(pg_temp.id(80),decode(repeat('ab',32),'hex'),
  now()-interval '1 day',now()+interval '1 day',true);
create temporary table results(label text primary key,result jsonb);
grant select on results to authenticated;
create function pg_temp.result(label text,key text) returns uuid language sql as $$
  select (result->>key)::uuid from results where results.label=result.label;
$$;
insert into results values('original',public.pi_begin_media_upload(pg_temp.id(100),pg_temp.id(12),
  jsonb_build_object('filename','synthetic-observed.png','byte_size',100,'mime_type','image/png',
    'file_hash',repeat('a',64),'width',32,'height',24,'source_kind','other_reference',
    'source_owner','Synthetic custodian','source_reference','TEST-ONLY metadata')));
insert into storage.objects(id,bucket_id,name,owner_id,metadata,version) select pg_temp.id(1000),
  'pi-product-originals',result->>'storage_path',auth.uid()::text,'{"size":100,"mimetype":"image/png"}','synthetic-version'
  from results where label='original';
select public.pi_complete_media_upload(pg_temp.id(101),pg_temp.result('original','intent_id'));
create function pg_temp.source(n integer,dimension text,assertion text default 'supports') returns jsonb language sql as $$
  select public.pi_add_media_source(pg_temp.id(n),pg_temp.id(12),pg_temp.result('original','asset_id'),'main',dimension,
    jsonb_build_object('source_kind','company_record','source_level','A','assertion',assertion,
      'evidence_basis',case dimension when 'usage_rights' then 'supplier_authorization' else 'sku_label' end,
      'evidence_date','2026-01-01','owner_name','Synthetic custodian','source_reference','TEST-ONLY declaration',
      'source_location','Synthetic page 1','revision_label','TEST-OBS-1','title','Synthetic media evidence'));
$$;
insert into results values('rights',pg_temp.source(200,'usage_rights')),('match',pg_temp.source(201,'product_match'));
create function pg_temp.propose(n integer,previous text default null) returns jsonb language sql as $$
  select public.pi_propose_media_mapping(pg_temp.id(n),pg_temp.id(12),pg_temp.result('original','asset_id'),'main',0,
    coalesce((select (result->>'revision')::bigint from results where label=previous),0),
    '{"alt_text":"Synthetic observed-review image"}',array[pg_temp.result('rights','source_id'),pg_temp.result('match','source_id')],
    'Synthetic proposal only',pg_temp.result(previous,'head_id'));
$$;
create function pg_temp.submit(n integer,label text) returns jsonb language sql as $$
  select public.pi_submit_media_mapping(pg_temp.id(n),(result->>'mapping_id')::uuid,(result->>'revision')::bigint,
    result->>'digest') from results where results.label=submit.label;
$$;
create function pg_temp.snapshot(label text) returns jsonb language sql as $$
  select public.pi_media_review_snapshot((result->>'mapping_id')::uuid,(result->>'revision')::bigint,
    result->>'digest',pg_temp.id(80)) from results where results.label=snapshot.label;
$$;
create function pg_temp.token(label text,changes jsonb default '{}',bad_signature boolean default false)
returns text language sql security definer set search_path=extensions,public as $$
  with snapshot as (select pg_temp.snapshot(label) value), parts as (
  select array['v1',pg_temp.id(80)::text,auth.uid()::text,value->>'adoption_id',value->>'mapping_id',
    value->>'revision',value->>'digest',value->>'original_digest',
    floor(extract(epoch from clock_timestamp()))::bigint::text,
    (floor(extract(epoch from clock_timestamp()))::bigint+300)::text,extensions.gen_random_uuid()::text] value from snapshot),
  payload as (select array_to_string(array(select coalesce(changes->>position::text,part)
    from unnest(value) with ordinality item(part,position) order by position),'|') value from parts)
  select value || '|' || case when bad_signature then repeat('0',64) else encode(extensions.hmac(convert_to(value,'UTF8'),
    (select secret from private.pi_media_observation_keys where id=pg_temp.id(80)),'sha256'),'hex') end from payload;
$$;
create function pg_temp.review(n integer,label text,token text,decision text default 'APPROVE',ack boolean default true)
returns jsonb language sql as $$
  select public.pi_review_media_mapping(pg_temp.id(n),(result->>'mapping_id')::uuid,(result->>'revision')::bigint,
    result->>'digest',decision,'Synthetic human review only',case when decision='APPROVE' then
    jsonb_build_object('original_digest',(select original_digest from media_mapping_revisions where id=(result->>'mapping_id')::uuid),
      'original_inspected',ack,'usage_rights_confirmed',true,'exact_product_confirmed',true) else '{}' end,
    case when decision='APPROVE' then pg_temp.result('rights','source_id') end,
    case when decision='APPROVE' then pg_temp.result('match','source_id') end,'',null,token)
    from results where results.label=review.label;
$$;
create temporary table originals as select (select jsonb_agg(to_jsonb(row) order by id) from media_assets row) assets,
  (select jsonb_agg(to_jsonb(row) order by id) from product_variants row) variants;

select is((select count(*)::int from private.pi_media_review_observations),0,'no observations are manufactured by upload');
select ok(not has_table_privilege('authenticated','private.pi_media_observation_keys','select,insert,update,delete'),'callers cannot read or provision signing keys');
select ok(not has_table_privilege('service_role','private.pi_media_observation_keys','select,insert,update,delete'),'service receives no key grant');
select ok(not has_table_privilege('authenticated','private.pi_media_review_observations','select,insert,update,delete'),'callers cannot forge observation rows');
select is((select count(*)::int from pg_class where relname in ('pi_media_observation_keys','pi_media_review_observations')
  and relrowsecurity and relforcerowsecurity),2,'both private observer tables force RLS');
select ok(not has_function_privilege('authenticated','private.pi_validate_media_observation(text,jsonb)','execute'),'token verifier remains private');
select ok(not has_function_privilege('anon','public.pi_review_media_mapping(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb,text)','execute'),'anonymous cannot decide');
select ok(not has_function_privilege('service_role','public.pi_review_media_mapping(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb,text)','execute'),'service has no review execution grant');
insert into results values('first',pg_temp.propose(300));
select throws_ok($$select pg_temp.snapshot('first')$$,'40001',null,'unsubmitted proposal cannot mint observation');
select pg_temp.submit(350,'first');
select is(jsonb_array_length((select jsonb_agg(key) from jsonb_object_keys(pg_temp.snapshot('first')) key)),7,'snapshot has only exact safe binding fields');
select ok(pg_temp.snapshot('first')::text !~ 'storage_path|file_hash|secret|working-originals','snapshot cannot disclose Storage paths or signing material');
insert into results values('token',jsonb_build_object('token',pg_temp.token('first')));
select pg_temp.actor(2);
select throws_ok($$select pg_temp.snapshot('first')$$,'42501',null,'editor cannot request review observation');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.snapshot('first')$$,'42501',null,'viewer cannot request review observation');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.review(400,'first','')$$,'42501',null,'publisher cannot decide');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(400,'first',(select result->>'token' from results where label='token'))$$,'23514',null,'another reviewer cannot reuse actor-bound observation');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.review(400,'first',null)$$,'23514',null,'checkboxes alone cannot approve through application RPC');
select throws_ok($$select pg_temp.review(400,'first','')$$,'23514',null,'empty observation cannot approve');
select throws_ok($$select pg_temp.review(400,'first',repeat('x',801))$$,'23514',null,'oversized observation refuses before parsing');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first',bad_signature=>true))$$,'23514',null,'bad HMAC cannot approve');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first','{"1":"v2"}'))$$,'23514',null,'unknown token version refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first',jsonb_build_object('2',pg_temp.id(81))))$$,'23514',null,'unknown signing key refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first',jsonb_build_object('4',pg_temp.id(51))))$$,'23514',null,'another database adoption refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first',jsonb_build_object('5',pg_temp.id(301))))$$,'23514',null,'another mapping refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first','{"6":"2"}'))$$,'23514',null,'another head sequence refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first',jsonb_build_object('7',repeat('b',64))))$$,'23514',null,'another submitted digest refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first',jsonb_build_object('8',repeat('b',64))))$$,'23514',null,'another original metadata digest refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first',jsonb_build_object('9',floor(extract(epoch from clock_timestamp()))::bigint-600,
  '10',floor(extract(epoch from clock_timestamp()))::bigint-300)))$$,'23514',null,'expired observation refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first',jsonb_build_object('9',floor(extract(epoch from clock_timestamp()))::bigint+60,
  '10',floor(extract(epoch from clock_timestamp()))::bigint+300)))$$,'23514',null,'future observation refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first',jsonb_build_object('10',floor(extract(epoch from clock_timestamp()))::bigint+900)))$$,'23514',null,'excessive lifetime refuses');
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first','{"11":"bad"}'))$$,'23514',null,'malformed nonce refuses');
update private.pi_media_observation_keys set enabled=false;
select throws_ok($$select pg_temp.snapshot('first')$$,'55000',null,'disabled observer cannot issue snapshots');
select throws_ok($$select pg_temp.review(400,'first',(select result->>'token' from results where label='token'))$$,'23514',null,'disabled signing key cannot approve');
update private.pi_media_observation_keys set enabled=true;
select throws_ok($$select pg_temp.review(400,'first',pg_temp.token('first'),ack=>false)$$,'23514',null,'machine observation cannot replace human confirmation');
select is((select count(*)::int from media_mapping_decisions),0,'all refused approvals are atomic');
select is((select count(*)::int from private.pi_media_review_observations),0,'refused approvals leave no observations');
set local role authenticated;
select lives_ok($$select pg_temp.review(400,'first',(select result->>'token' from results where label='token'))$$,'current authenticated owner can approve exact signed synthetic snapshot');
reset role;
select is((select count(*)::int from private.pi_media_review_observations),1,'one approval records one observation');
select ok(public.pi_media_review_observed(pg_temp.result('first','mapping_id')),'historical observation is readable without token or secret');
select ok((select token_digest=encode(extensions.digest((select result->>'token' from results where label='token'),'sha256'),'hex')
  from private.pi_media_review_observations),'only token digest is retained');
select ok(not exists(select 1 from information_schema.columns where table_schema='private' and table_name='pi_media_review_observations'
  and column_name in ('secret','signature','token')),'observation ledger has no raw token or key column');
select lives_ok($$select pg_temp.review(400,'first',(select result->>'token' from results where label='token'))$$,'exact actor-scoped completed request replays');
select is((select count(*)::int from private.pi_media_review_observations),1,'replay cannot create duplicate observation');
update private.pi_media_observation_keys set enabled=false;
select lives_ok($$select pg_temp.review(400,'first',(select result->>'token' from results where label='token'))$$,'completed receipt replays even after key deactivation');
select throws_ok($$select pg_temp.review(402,'first',(select result->>'token' from results where label='token'))$$,'40001',null,'a new request cannot replay a closed candidate');
update private.pi_media_observation_keys set enabled=true;
select throws_ok($$select pg_temp.review(400,'first','different-token')$$,'40001',null,'same request cannot change observation');
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(1);
select throws_ok($$select pg_temp.review(400,'first',(select result->>'token' from results where label='token'))$$,'42501',null,'revoked role fails before receipt replay');
select ok(not public.pi_media_review_observed(pg_temp.result('first','mapping_id')),'revoked reader cannot query observation');
select pg_temp.actor(3);
update private.pi_media_observation_keys set enabled=false;
select ok(public.pi_media_review_observed(pg_temp.result('first','mapping_id')),'key rotation does not rewrite historical observation');
select throws_ok($$update private.pi_media_review_observations set token_digest=repeat('b',64)$$,'55000',null,'observation evidence is immutable');
select throws_ok($$delete from private.pi_media_review_observations$$,'55000',null,'observations cannot be deleted');
select throws_ok($$truncate private.pi_media_review_observations$$,'55000',null,'observations cannot be truncated');
select pg_temp.actor(2);
insert into results values('next',pg_temp.propose(301,'first'));
select pg_temp.submit(351,'next');
select pg_temp.actor(3);
update private.pi_media_observation_keys set enabled=true;
select throws_ok($$select pg_temp.review(401,'next',pg_temp.token('next',jsonb_build_object('11',
  split_part((select result->>'token' from results where label='token'),'|',11))))$$,'23505',null,'nonce cannot be reused for another decision');
select is((select review_state from media_mapping_revisions where id=pg_temp.result('next','mapping_id')),'pending','nonce collision rolls back the entire approval');
insert into results values('next-token',jsonb_build_object('token',pg_temp.token('next')));
insert into results values('conflict',pg_temp.source(202,'product_match','contradicts'));
select throws_ok($$select pg_temp.snapshot('next')$$,'40001',null,'new unselected conflict invalidates observation snapshot');
select throws_ok($$select pg_temp.review(401,'next',(select result->>'token' from results where label='next-token'))$$,'40001',null,'freshly signed token cannot hide newly known conflict');
select is((select count(*)::int from media_mapping_decisions),1,'all nonce and stale-evidence failures retain exactly the previous decision');
select lives_ok($$select pg_temp.review(401,'next',null,'REJECT')$$,'rejection does not require or manufacture byte observation');
select is((select count(*)::int from private.pi_media_review_observations),1,'rejection retains preceding observation');
select is((select jsonb_agg(to_jsonb(row) order by id) from media_assets row),(select assets from originals),'original assets are unchanged');
select is((select jsonb_agg(to_jsonb(row) order by id) from product_variants row),(select variants from originals),'original product rows are unchanged');
select is((select count(*)::int from publish_records),0,'no publication occurs');
select * from finish();
rollback;
