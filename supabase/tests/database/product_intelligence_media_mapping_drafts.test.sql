begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions,public;
set local timezone='UTC';
select plan(92);

create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('99000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'mapping-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'mapping-category','synthetic-mapping','Synthetic mapping category','synthetic-mapping');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'mapping-product',pg_temp.id(10),'Synthetic mapping product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),
    'synthetic-mapping-' || n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED'
    from generate_series(12,16) n;
insert into media_assets(id,external_key,source_kind,source_reference,ownership_status,usage_rights_status,
  content_match_status,publication_status)
  values(pg_temp.id(20),'mapping-legacy','company_catalog','Synthetic legacy reference','unconfirmed',
    'needs_confirmation','product_family_reference','legacy_reference');
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
create function pg_temp.revision(label text) returns bigint language sql as $$
  select (result->>'revision')::bigint from results where results.label=revision.label;
$$;
create function pg_temp.manifest() returns jsonb language sql as $$
  select jsonb_build_object('filename','synthetic-original.png','byte_size',100,'mime_type','image/png',
    'file_hash',repeat('a',64),'width',32,'height',24,'source_kind','other_reference',
    'source_owner','Synthetic custodian','source_reference','TEST-MAPPING original');
$$;
create function pg_temp.original(n integer,variant_uuid uuid default pg_temp.id(12))
returns jsonb language sql as $$
  insert into results values('intake-' || n,private.pi_begin_media_upload(pg_temp.id(n),variant_uuid,pg_temp.manifest()));
  insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
    select pg_temp.id(n+1000),'pi-product-originals',result->>'storage_path',auth.uid()::text,
      '{"size":100,"mimetype":"image/png"}','synthetic-version' from results where label='intake-' || n;
  select private.pi_complete_media_upload(pg_temp.id(n+2000),(result->>'intent_id')::uuid)
    from results where label='intake-' || n;
$$;
create function pg_temp.source(n integer,dimension text default 'usage_rights',assertion text default 'supports',
  asset_uuid uuid default pg_temp.result('original','asset_id'),role text default 'main',variant_uuid uuid default pg_temp.id(12))
returns jsonb language sql as $$
  select private.pi_add_media_source(pg_temp.id(n),variant_uuid,asset_uuid,role,dimension,
    jsonb_build_object('source_kind','company_record','source_level','A','assertion',assertion,
      'evidence_basis',case dimension when 'usage_rights' then 'supplier_authorization' else 'sku_label' end,
      'evidence_date','2026-01-01','owner_name','Synthetic custodian','source_reference','TEST-MAPPING source',
      'source_location','Synthetic page 1','revision_label','TEST-1','title','Synthetic mapping evidence'));
$$;
create function pg_temp.propose(n integer,head_uuid uuid default null,expected bigint default 0,
  copy jsonb default '{"alt_text":"Synthetic original image"}',sources uuid[] default '{}',
  asset_uuid uuid default pg_temp.result('original','asset_id'),role text default 'main',slot integer default 0,
  variant_uuid uuid default pg_temp.id(12),reason text default 'Synthetic proposal only')
returns jsonb language sql as $$
  select private.pi_propose_media_mapping(pg_temp.id(n),variant_uuid,asset_uuid,role,slot,expected,copy,sources,reason,head_uuid);
$$;
create function pg_temp.submit(n integer,label text,revision bigint default null,digest text default null)
returns jsonb language sql as $$
  select private.pi_submit_media_mapping(pg_temp.id(n),(result->>'mapping_id')::uuid,
    coalesce(revision,(result->>'revision')::bigint),coalesce(digest,result->>'digest'))
  from results where results.label=submit.label;
$$;
create function pg_temp.change_model(value text) returns void language sql as $$
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),array['product_variants']);
  update product_variants set model=value where id=pg_temp.id(12);
  delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
$$;
create function pg_temp.lifecycle(state public.pi_product_lifecycle) returns void language sql as $$
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),array['product_variants']);
  update product_variants set lifecycle_state=state where id=pg_temp.id(12);
  delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
$$;

select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select throws_ok($$select pg_temp.propose(500,asset_uuid=>pg_temp.id(20))$$,'42501',null,'viewer cannot learn adoption state');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.propose(500,asset_uuid=>pg_temp.id(20))$$,'55000',null,'mapping requires working adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic isolated mapping fixture');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
insert into results values('original',pg_temp.original(100)),('replacement',pg_temp.original(101)),
  ('other-sku',pg_temp.original(102,pg_temp.id(13)));
insert into results values('incomplete',private.pi_begin_media_upload(pg_temp.id(103),pg_temp.id(12),pg_temp.manifest()));
insert into results values('rights',pg_temp.source(200)),('match',pg_temp.source(201,'product_match')),
  ('wrong-role',pg_temp.source(202,role=>'packaging')),
  ('wrong-sku',pg_temp.source(203,variant_uuid=>pg_temp.id(13)));
create temporary table originals as select
  (select jsonb_agg(to_jsonb(row) order by id) from product_media row) mappings,
  (select jsonb_agg(to_jsonb(row) order by id) from media_assets row) assets,
  (select jsonb_agg(to_jsonb(row) order by id) from product_variants row) variants,
  (select jsonb_agg(to_jsonb(row) order by id) from media_upload_intents row) intents,
  (select jsonb_agg(to_jsonb(row) order by intent_id) from media_upload_completions row) completions;
select is((select count(*)::int from pg_class where relname in ('media_mapping_heads','media_mapping_revisions','media_mapping_evidence')
  and relrowsecurity and relforcerowsecurity),3,'all mapping tables force RLS');
select ok(not has_table_privilege('authenticated','media_mapping_revisions','insert,update,delete'),'callers cannot mutate revisions directly');
select ok(not has_table_privilege('service_role','media_mapping_evidence','insert,update,delete'),'service role has no mapping write grant');
select ok(not has_table_privilege('anon','media_mapping_heads','select'),'anonymous cannot read mapping heads');
select ok(not has_function_privilege('authenticated','private.pi_propose_media_mapping(uuid,uuid,uuid,text,integer,bigint,jsonb,uuid[],text,uuid)','execute'),'proposal remains private');
select ok(not has_function_privilege('service_role','private.pi_submit_media_mapping(uuid,uuid,bigint,text)','execute'),'service has no private submission grant');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where oid='pi_media_mapping_states'::regclass),'read view uses invoker RLS');

select throws_ok($$select pg_temp.propose(500,asset_uuid=>pg_temp.id(20))$$,'55000',null,'legacy metadata is not a completed original');
select throws_ok($$select pg_temp.propose(500,asset_uuid=>pg_temp.result('incomplete','asset_id'))$$,'22023',null,'incomplete intake has no mappable asset');
select throws_ok($$select pg_temp.propose(500,asset_uuid=>pg_temp.result('other-sku','asset_id'))$$,'55000',null,'another exact SKU intake cannot transfer');
select throws_ok($$select pg_temp.propose(500,variant_uuid=>pg_temp.id(16))$$,'55000',null,'outside-pilot variant refused');
select throws_ok($$select pg_temp.propose(500,copy=>'{}')$$,'22023',null,'alt text is required');
select throws_ok($$select pg_temp.propose(500,copy=>'{"alt_text":" "}')$$,'22023',null,'blank alt text refused');
select throws_ok($$select pg_temp.propose(500,copy=>jsonb_build_object('alt_text',repeat('x',501)))$$,'22023',null,'oversized alt text refused');
select throws_ok($$select pg_temp.propose(500,copy=>'{"alt_text":"Synthetic","approved_by":"forged"}')$$,'22023',null,'approval injection refused');
select throws_ok($$select pg_temp.propose(500,slot=>1)$$,'22023',null,'main has only one stable slot');
select throws_ok($$select pg_temp.propose(500,slot=>100,role=>'gallery')$$,'22023',null,'unbounded slot refused');
select throws_ok($$select pg_temp.propose(500,role=>'factory')$$,'22023',null,'company imagery cannot become a SKU role');
select throws_ok($$select pg_temp.propose(500,sources=>array[null]::uuid[])$$,'22023',null,'null source refused');
select throws_ok($$select pg_temp.propose(500,sources=>array_fill(pg_temp.result('rights','source_id'),array[21]))$$,'22023',null,'oversized evidence refused');
select throws_ok($$select pg_temp.propose(500,sources=>array[pg_temp.result('rights','source_id'),pg_temp.result('rights','source_id')])$$,'22023',null,'duplicate evidence refused');
select throws_ok($$select pg_temp.propose(500,sources=>array[pg_temp.id(999)])$$,'22023',null,'unbound source refused');
select throws_ok($$select pg_temp.propose(500,sources=>array[pg_temp.result('wrong-role','source_id')])$$,'22023',null,'evidence cannot transfer roles');
select throws_ok($$select pg_temp.propose(500,sources=>array[pg_temp.result('wrong-sku','source_id')])$$,'22023',null,'evidence cannot transfer SKU');
select throws_ok($$select pg_temp.propose(500,asset_uuid=>pg_temp.result('replacement','asset_id'),sources=>array[pg_temp.result('rights','source_id')])$$,'22023',null,'same recorded file hash cannot merge asset evidence');
select throws_ok($$select pg_temp.propose(500,reason=>' ')$$,'22023',null,'meaningful reason required');
select is((select count(*)::int from media_mapping_revisions),0,'failed commands leave no partial mapping');
select is((select count(*)::int from private.pi_command_receipts where command='propose_media_mapping'),0,'failed commands leave no receipts');

insert into results values('first',pg_temp.propose(500,sources=>array[pg_temp.result('rights','source_id'),pg_temp.result('match','source_id')]));
select is(pg_temp.propose(500,sources=>array[pg_temp.result('rights','source_id'),pg_temp.result('match','source_id')]),
  (select result from results where label='first'),'unchanged proposal retry returns exact receipt');
select throws_ok($$select pg_temp.propose(500,copy=>'{"alt_text":"Changed"}')$$,'40001',null,'changed retry payload refused');
select is((select count(*)::int from media_mapping_revisions),1,'retry creates no duplicate revision');
select ok((select created_by=pg_temp.id(1) and review_state='proposed' and verification_status='NEEDS_FACTORY_CONFIRMATION'
  and submitted_digest is null from media_mapping_revisions),'actor is current session and sources do not approve');
select is((select rights_evidence_count from pi_media_mapping_states),1,'rights evidence is counted separately');
select is((select match_evidence_count from pi_media_mapping_states),1,'product-match evidence is counted separately');
select is((select array_agg(key order by key) from results,jsonb_object_keys(result) key where label='first'),
  array['digest','head_id','mapping_id','revision']::text[],'receipt omits original paths, hashes and provider payloads');
select set_config('timezone','Asia/Shanghai',true);
select is(private.pi_media_mapping_digest(pg_temp.result('first','mapping_id')),(select result->>'digest' from results where label='first'),'digest is timezone invariant');
select set_config('timezone','UTC',true);
select throws_ok($$select pg_temp.propose(501)$$,'40001',null,'same slot must use its explicit head');
select throws_ok($$select pg_temp.propose(501,head_uuid=>pg_temp.result('first','head_id'),expected=>0)$$,'40001',null,'stale save refused');
select throws_ok($$select pg_temp.propose(501,head_uuid=>pg_temp.result('first','head_id'),expected=>1,role=>'gallery')$$,'22023',null,'mapping head scope cannot change');
insert into results values('second',pg_temp.propose(501,head_uuid=>pg_temp.result('first','head_id'),expected=>1,
  copy=>'{"alt_text":"Revised synthetic alt"}'));
select is(pg_temp.revision('second'),2::bigint,'new proposal advances once');
select is((select review_state from media_mapping_revisions where id=pg_temp.result('first','mapping_id')),'superseded','prior draft retained as superseded');
select is((select predecessor_id from media_mapping_revisions where id=pg_temp.result('second','mapping_id')),pg_temp.result('first','mapping_id'),'predecessor preserves mapping history');
select throws_ok($$select pg_temp.submit(600,'first')$$,'40001',null,'superseded revision cannot submit');
select throws_ok($$select pg_temp.submit(600,'second',digest=>repeat('b',64))$$,'40001',null,'changed digest cannot submit');
select pg_temp.change_model('Changed synthetic identity');
select throws_ok($$select pg_temp.submit(600,'second')$$,'40001',null,'changed SKU identity invalidates original and submission');
select pg_temp.change_model(null);
update storage.objects set version='changed-test-version' where id=(select storage_object_id from media_upload_completions where media_asset_id=pg_temp.result('original','asset_id'));
select throws_ok($$select pg_temp.submit(600,'second')$$,'40001',null,'changed recorded object version invalidates submission');
update storage.objects set version='synthetic-version' where id=(select storage_object_id from media_upload_completions where media_asset_id=pg_temp.result('original','asset_id'));
select pg_temp.actor(3);
insert into results values('submitted',pg_temp.submit(600,'second'));
select is((select review_state from media_mapping_revisions where id=pg_temp.result('second','mapping_id')),'pending','reviewer may submit a current proposal');
select is(pg_temp.submit(600,'second'),(select result from results where label='submitted'),'unchanged submit returns same receipt');
select throws_ok($$select pg_temp.submit(601,'second')$$,'40001',null,'different request cannot submit twice');
select throws_ok($$select pg_temp.propose(502,role=>'gallery')$$,'42501',null,'reviewer cannot author mapping proposals');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.propose(502,head_uuid=>pg_temp.result('second','head_id'),expected=>2)$$,'55000',null,'pending mapping cannot be silently overwritten');
select throws_ok($$select pg_temp.lifecycle('VERIFIED')$$,'23514','Open media mappings require human review before publishable lifecycle states.','open mapping blocks VERIFIED');
select throws_ok($$select pg_temp.lifecycle('READY_FOR_PUBLISH')$$,'23514','Open media mappings require human review before publishable lifecycle states.','open mapping blocks ready-for-publish');
select throws_ok($$select pg_temp.lifecycle('QA_PASSED')$$,'23514','Open media mappings require human review before publishable lifecycle states.','open mapping blocks QA promotion');
select throws_ok($$select pg_temp.lifecycle('PUBLISHED')$$,'23514','Open media mappings require human review before publishable lifecycle states.','open mapping blocks direct publication');

select pg_temp.actor(2);
insert into results values('editor',pg_temp.propose(500,role=>'gallery'));
select is((select created_by from media_mapping_revisions where id=pg_temp.result('editor','mapping_id')),pg_temp.id(2),'editor authors with actor-scoped receipt identity');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.submit(600,'editor')$$,'42501',null,'viewer cannot submit');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.propose(500,role=>'packaging')$$,'42501',null,'publisher cannot propose');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.propose(500,role=>'packaging')$$,'42501',null,'unassigned session cannot propose');
select pg_temp.actor(1);
insert into results values('gallery-conflict',pg_temp.source(204,assertion=>'contradicts',role=>'gallery'));
select throws_ok($$select pg_temp.submit(602,'editor')$$,'40001',null,'new unselected contradiction invalidates submitted digest');
insert into results values('conflict',pg_temp.propose(502,head_uuid=>pg_temp.result('editor','head_id'),expected=>1,
  role=>'gallery',sources=>'{}'));
select is((select verification_status from media_mapping_revisions where id=pg_temp.result('conflict','mapping_id')),
  'DATA_CONFLICT'::pi_verification_status,'omitted known contradiction remains conflict');
select throws_ok($$select pg_temp.propose(503,head_uuid=>pg_temp.result('conflict','head_id'),expected=>2,role=>'gallery')$$,'55000',null,'ordinary save cannot erase a conflicting proposal');
select lives_ok($$select pg_temp.submit(603,'conflict')$$,'conflict may enter explicit human review without approval');

select pg_temp.actor(4);
set local role authenticated;
select is((select count(*)::int from pi_media_mapping_states),2,'current viewer-safe view excludes superseded drafts');
select throws_ok($$update media_mapping_revisions set alt_text='forged'$$,'42501',null,'authenticated cannot mutate frozen content');
select throws_ok($$delete from media_mapping_evidence$$,'42501',null,'authenticated cannot delete revision evidence');
reset role;
select pg_temp.actor(1);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(2);
select pg_temp.actor(2);
select throws_ok($$select pg_temp.propose(500,role=>'gallery')$$,'42501',null,'revoked editor cannot replay a receipt');
set local role authenticated;
select is((select count(*)::int from media_mapping_revisions),0,'revocation also denies RLS reads');
reset role;
select pg_temp.actor(1);
select private.pi_media_mapping_capability();
select throws_ok($$update media_mapping_revisions set alt_text='forged'$$,'55000',null,'content guard still rejects changes with transaction capability');
select throws_ok($$update media_mapping_revisions set proposal_digest=repeat('f',64)$$,'55000',null,'initial digest exception cannot rewrite a completed digest');
select throws_ok($$update media_mapping_revisions set review_state='approved'$$,'40001',null,'capability cannot manufacture human approval');
select throws_ok($$update media_mapping_heads set media_role='packaging'$$,'55000',null,'head identity remains immutable with capability');
select throws_ok($$update media_mapping_heads set revision=revision+2$$,'55000',null,'head cannot skip revisions');
select throws_ok($$delete from media_mapping_revisions$$,'55000',null,'revision history cannot be removed');
select throws_ok($$delete from media_mapping_heads$$,'55000',null,'head history cannot be removed');
select throws_ok($$delete from media_mapping_evidence$$,'55000',null,'frozen source links cannot be removed');
select throws_ok($$truncate media_mapping_heads cascade$$,'55000',null,'mapping history cannot be cleared with capability');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.propose(500)$$,'42501',null,'service claim cannot impersonate an owner or replay receipt');
select set_config('request.jwt.claim.role','anon',true);
select throws_ok($$select pg_temp.submit(600,'second')$$,'42501',null,'anonymous claim cannot replay submission');
select set_config('request.jwt.claim.role','authenticated',true);
select ok(not exists(select 1 from media_assets where raw_snapshot ? 'intake_id' and raw_snapshot->>'byte_verification'<>'not_attested'),
  'mapping never upgrades SQL completion to byte attestation');
select is((select count(*)::int from media_mapping_revisions where review_state='pending'),2,'guard refusals retain both submitted proposals');
select ok((select jsonb_agg(to_jsonb(row) order by id) from product_media row)=(select mappings from originals),'original public image mappings remain exact');
select ok((select jsonb_agg(to_jsonb(row) order by id) from media_assets row)=(select assets from originals),'original asset metadata and approval states remain exact');
select ok((select jsonb_agg(to_jsonb(row) order by id) from product_variants row)=(select variants from originals),'original variant states remain exact');
select ok((select jsonb_agg(to_jsonb(row) order by id) from media_upload_intents row)=(select intents from originals),'original intake ledgers remain exact');
select ok((select jsonb_agg(to_jsonb(row) order by intent_id) from media_upload_completions row)=(select completions from originals),'original completion ledgers remain exact');
select is((select count(*)::int from verification_events),0,'propose and submit create no human approval events');
select is((select count(*)::int from publish_records),0,'proposals never publish');
select ok(not exists(select 1 from media_assets where publication_status='search_eligible' or approved_by is not null),'sources and submission never upgrade global rights/match');
select ok(exists(select 1 from audit_events where table_name='media_mapping_revisions'),'mapping transitions retain audit history');

select * from finish();
rollback;
