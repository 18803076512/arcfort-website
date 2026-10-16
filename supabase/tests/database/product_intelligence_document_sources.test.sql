begin;
create extension if not exists pgtap with schema extensions;
set search_path=extensions,public;
set local timezone='UTC';
select plan(65);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('a6000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'document-source-'||n||'@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'document-source','document-source','Synthetic','document-source');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'document-source',pg_temp.id(10),'Synthetic','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  values(pg_temp.id(12),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-9999','synthetic-document-source',
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic document sources');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create temporary table saved(label text primary key,result jsonb);
create function pg_temp.doc() returns uuid language sql as $$
  select (result->>'document_id')::uuid from saved where label='reference';
$$;
create function pg_temp.copy() returns jsonb language sql as $$
  select jsonb_build_object('assertion','supports','source_kind','company_record','source_level','A',
    'evidence_basis','company_ownership','evidence_date','2026-01-01','owner_name','Synthetic custodian',
    'source_reference','TEST-ONLY rights declaration','source_location','Synthetic page 1',
    'revision_label',null,'scope_note','TEST-ONLY exact original scope','title','Synthetic source');
$$;
create function pg_temp.add_source(n integer,copy jsonb default pg_temp.copy(),dimension text default 'usage_rights',
  variant_uuid uuid default pg_temp.id(12),document_uuid uuid default pg_temp.doc()) returns jsonb language sql as $$
  select private.pi_add_document_source(pg_temp.id(n),variant_uuid,document_uuid,dimension,copy);
$$;
create function pg_temp.source(label text) returns uuid language sql as $$
  select (result->>'source_id')::uuid from saved where saved.label=source.label;
$$;
create function pg_temp.eligible(label text,dimension text default 'usage_rights') returns boolean language sql as $$
  select private.pi_document_source_can_support_review(pg_temp.source(label),pg_temp.id(12),pg_temp.doc(),dimension);
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
insert into saved values('reference',public.pi_add_document_reference(pg_temp.id(100),pg_temp.id(12),jsonb_build_object(
  'source_level','A','source_kind','company_record','document_type','drawing','issued_date',null,
  'owner_name','Synthetic custodian','source_reference','TEST-ONLY','source_location','Page 1',
  'revision_label',null,'scope_note','Synthetic scope','title','Synthetic drawing')));
insert into saved values('intent',public.pi_begin_document_upload(pg_temp.id(101),pg_temp.doc(),
  jsonb_build_object('filename','synthetic.pdf','file_hash',repeat('a',64),'byte_size',60,'mime_type','application/pdf','page_count',1)));
select throws_ok($$select pg_temp.add_source(200)$$,'40001',null,'source cannot bind incomplete upload');
insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
  select pg_temp.id(60),'pi-technical-evidence',result->>'storage_path',pg_temp.id(1)::text,
    '{"size":60,"mimetype":"application/pdf"}','synthetic-only' from saved where label='intent';
select public.pi_complete_document_upload(pg_temp.id(102),(result->>'intent_id')::uuid) from saved where label='intent';
create temporary table original_documents as select to_jsonb(t) row from technical_documents t;
select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='document_source_bindings'::regclass),'source bindings force RLS');
select ok(not has_table_privilege('authenticated','document_source_bindings','insert,update,delete'),'no caller mutation grant');
select ok(not has_table_privilege('service_role','document_source_bindings','select,insert,update,delete'),'no service table grant');
select ok(not has_table_privilege('anon','document_source_bindings','select'),'no anonymous table grant');
select ok(not has_function_privilege('authenticated','private.pi_add_document_source(uuid,uuid,uuid,text,jsonb)','execute'),'no caller command exposure');
select ok(not has_function_privilege('service_role','private.pi_add_document_source(uuid,uuid,uuid,text,jsonb)','execute'),'no service command exposure');

insert into saved values('rights',pg_temp.add_source(200));
select is(pg_temp.add_source(200),(select result from saved where label='rights'),'same actor exact retry preserves receipt');
select is((select count(*)::int from document_source_bindings),1,'retry creates no extra source binding');
select is((select count(*)::int from evidence_sources),1,'retry creates no extra source');
select is((select created_by from document_source_bindings),pg_temp.id(1),'actor is current session');
select ok((select revision_label is null from document_source_bindings),'unknown source revision retained');
select ok(pg_temp.eligible('rights'),'dated Level A ownership can support later human review');
select ok(not pg_temp.eligible('rights','exact_scope'),'rights cannot substitute for exact scope');
select ok(not private.pi_document_source_matches(pg_temp.source('rights'),pg_temp.id(13),pg_temp.doc(),'usage_rights'),'source cannot transfer SKU');
select ok(not private.pi_document_source_matches(pg_temp.source('rights'),pg_temp.id(12),pg_temp.id(99),'usage_rights'),'source cannot transfer document');
set local timezone='Asia/Shanghai';
select ok(pg_temp.eligible('rights'),'source digest is timezone invariant');
set local timezone='UTC';
select throws_ok($$select pg_temp.add_source(200,pg_temp.copy()||'{"scope_note":"changed"}')$$,'40001',null,'receipt cannot change scope');
insert into saved values('scope',pg_temp.add_source(201,pg_temp.copy()||'{"evidence_basis":"controlled_drawing"}','exact_scope'));
select ok(pg_temp.eligible('scope','exact_scope'),'controlled drawing may support exact scope only');
insert into saved values('unknown',pg_temp.add_source(202,pg_temp.copy()||'{"evidence_date":null}'));
select ok((select evidence_date is null from evidence_sources where id=pg_temp.source('unknown')),'unknown evidence date stays null');
select ok(not pg_temp.eligible('unknown'),'unknown date cannot pass qualifying evidence gate');
insert into saved values('conflict',pg_temp.add_source(203,pg_temp.copy()||'{"assertion":"contradicts"}'));
select ok(not pg_temp.eligible('conflict'),'contradiction cannot be positive support');
insert into saved values('declared-reference',pg_temp.add_source(204,pg_temp.copy()||'{"assertion":"reference_only"}'));
select ok(not pg_temp.eligible('declared-reference'),'reference-only assertion cannot qualify');
insert into saved values('catalog',pg_temp.add_source(205,pg_temp.copy()||'{"evidence_basis":"company_catalog"}'));
select ok(not pg_temp.eligible('catalog'),'company catalog cannot qualify as rights evidence');
insert into saved values('manufacturer',pg_temp.add_source(206,pg_temp.copy()||'{"source_kind":"official_manufacturer","source_level":"B","evidence_basis":"manufacturer_catalog"}'));
select ok(not pg_temp.eligible('manufacturer'),'manufacturer reference not Level A company approval');
insert into saved values('standard',pg_temp.add_source(207,pg_temp.copy()||'{"source_kind":"technical_standard","source_level":"C","evidence_basis":"standard_reference"}'));
select ok(not pg_temp.eligible('standard'),'standard reference cannot establish rights');
insert into saved values('secondary',pg_temp.add_source(208,pg_temp.copy()||'{"source_kind":"secondary_reference","source_level":"D","evidence_basis":"secondary_reference"}'));
select ok(not pg_temp.eligible('secondary'),'secondary reference cannot qualify');

select throws_ok($$select pg_temp.add_source(250,null)$$,'22023',null,'null source rejected');
select throws_ok($$select pg_temp.add_source(250,'[]')$$,'22023',null,'array source rejected');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy()-'evidence_date')$$,'22023',null,'unknown date must be explicit');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy()||'{"approved":true}')$$,'22023',null,'approval cannot be supplied');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy()||'{"source_level":"B"}')$$,'22023',null,'source class must agree with level');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy(),'exact_scope')$$,'22023',null,'rights basis cannot be used for scope');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy(),'technical_confirmation')$$,'22023',null,'intake cannot become technical confirmation');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy()||'{"owner_name":" "}')$$,'22023',null,'blank owner rejected');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy()||jsonb_build_object('scope_note',repeat('x',2001)))$$,'22023',null,'oversized scope rejected');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy()||jsonb_build_object('source_location',E'page\n1'))$$,'22023',null,'control characters rejected');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy()||'{"evidence_date":"2026-02-30"}')$$,'22023',null,'invalid calendar date rejected');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy()||'{"evidence_date":"2099-01-01"}')$$,'22023',null,'future date rejected');
select throws_ok($$select pg_temp.add_source(250,pg_temp.copy()||'{"evidence_date":"0000-01-01"}')$$,'22023',null,'year zero rejected');
select throws_ok($$select pg_temp.add_source(null)$$,'22023',null,'request ID required');
select is((select count(*)::int from document_source_bindings),9,'invalid commands make no partial source');
select is((select count(*)::int from private.pi_mutation_context),0,'command capability cleared');

select pg_temp.actor(2);
select lives_ok($$select pg_temp.add_source(260)$$,'editor can add unapproved source');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.add_source(260)$$,'reviewer has independent actor receipt');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_source(260)$$,'42501',null,'viewer cannot add');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.add_source(260)$$,'42501',null,'publisher cannot add');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.add_source(260)$$,'42501',null,'unassigned cannot add');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.add_source(260)$$,'42501',null,'service cannot impersonate owner');
select set_config('request.jwt.claim.role','authenticated',true);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(2);
select pg_temp.actor(2);
select throws_ok($$select pg_temp.add_source(260)$$,'42501',null,'revoked editor cannot replay receipt');
select pg_temp.actor(1);
select throws_ok($$update document_source_bindings set scope_note='changed'$$,'55000',null,'unscoped mutation refused');
insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),array['evidence_sources','document_source_bindings','product_variants']);
select throws_ok($$update document_source_bindings set scope_note='changed'$$,'55000',null,'binding immutable even with capability');
select throws_ok($$delete from document_source_bindings$$,'55000',null,'binding cannot be deleted');
select throws_ok($$update evidence_sources set title='changed'$$,'55000',null,'bound source immutable');
select throws_ok($$delete from evidence_sources$$,'55000',null,'bound source cannot be deleted');
select throws_ok($$truncate document_source_bindings$$,'0A000',null,'review foreign keys prevent truncating bound evidence');
update product_variants set model='changed' where id=pg_temp.id(12);
select ok(not pg_temp.eligible('rights'),'SKU identity drift invalidates source');
update product_variants set model=null where id=pg_temp.id(12);
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
update storage.objects set version='changed' where id=pg_temp.id(60);
select ok(not pg_temp.eligible('rights'),'Storage version drift invalidates source');
select throws_ok($$select pg_temp.add_source(200)$$,'40001',null,'stale original cannot replay source receipt');
update storage.objects set version='synthetic-only' where id=pg_temp.id(60);
select ok(pg_temp.eligible('rights'),'restoring synthetic snapshot restores match only, not approval');
set local role authenticated;
select pg_temp.actor(4);
select is((select count(*)::int from document_source_bindings),11,'current viewer reads source history');
select pg_temp.actor(6);
select is((select count(*)::int from document_source_bindings),0,'unassigned reads no sources');
reset role;
select pg_temp.actor(1);
select is((select to_jsonb(t) from technical_documents t),(select row from original_documents),'document retained unchanged and unapproved');
select is((select byte_verification from document_upload_completions limit 1),'not_attested','source does not attest original bytes');
select is((select count(*)::int from verification_events)+(select count(*)::int from publish_records)
  +(select count(*)::int from technical_values)+(select count(*)::int from compatibility_relationships),0,'no decisions, facts, fitment or publication');
select * from finish();
rollback;
