begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
select plan(30);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('a3000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'document-command-' || n || '@example.invalid',now() from generate_series(1,5) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'document-command','document-command','Synthetic','document-command');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'document-command',pg_temp.id(10),'Synthetic','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  values(pg_temp.id(12),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-0012','synthetic-document-command',
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED');
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.ref(n integer) returns jsonb language sql as $$
  select public.pi_add_document_reference(pg_temp.id(n),pg_temp.id(12),jsonb_build_object(
    'source_level','A','source_kind','company_record','document_type','drawing','issued_date',null,
    'owner_name','Synthetic custodian','source_reference','TEST-ONLY no actual document',
    'source_location','Synthetic page 1','revision_label',null,'scope_note','Synthetic exact-SKU scope',
    'title','Synthetic document'));
$$;
create function pg_temp.manifest() returns jsonb language sql as $$
  select jsonb_build_object('filename','synthetic.pdf','file_hash',repeat('a',64),
    'byte_size',60,'mime_type','application/pdf','page_count',2);
$$;
create temporary table results(label text primary key,result jsonb);
grant select,insert on results to authenticated;
create function pg_temp.start(n integer) returns jsonb language sql as $$
  select public.pi_begin_document_upload(pg_temp.id(n),(result->>'document_id')::uuid,pg_temp.manifest())
    from results where label='reference';
$$;
create function pg_temp.complete(n integer) returns jsonb language sql as $$
  select public.pi_complete_document_upload(pg_temp.id(n),(result->>'intent_id')::uuid)
    from results where label='upload';
$$;
select ok(has_function_privilege('authenticated','public.pi_add_document_reference(uuid,uuid,jsonb,uuid)','execute'),'reference command exposed to user sessions');
select ok(has_function_privilege('authenticated','public.pi_begin_document_upload(uuid,uuid,jsonb)','execute'),'begin command exposed to user sessions');
select ok(has_function_privilege('authenticated','public.pi_complete_document_upload(uuid,uuid)','execute'),'complete command exposed to user sessions');
select ok(not has_function_privilege('anon','public.pi_add_document_reference(uuid,uuid,jsonb,uuid)','execute'),'no anonymous reference command');
select ok(not has_function_privilege('anon','public.pi_begin_document_upload(uuid,uuid,jsonb)','execute'),'no anonymous upload command');
select ok(not has_function_privilege('service_role','public.pi_complete_document_upload(uuid,uuid)','execute'),'no service completion command');
select ok(not has_function_privilege('authenticated','private.pi_begin_document_upload(uuid,uuid,jsonb)','execute'),'no private bypass');
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
select throws_ok($$select pg_temp.ref(100)$$,'55000',null,'reference wrapper requires adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic document command test');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
set local role authenticated;
insert into results values('reference',pg_temp.ref(100));
select is(pg_temp.ref(100),(select result from results where label='reference'),'reference retry is immutable');
insert into results values('upload',pg_temp.start(200));
select is(pg_temp.start(200),(select result from results where label='upload'),'upload retry preserves intent');
select throws_ok($$select pg_temp.start(201)$$,'40001',null,'different request cannot replace original');
select throws_ok($$select pg_temp.complete(300)$$,'23514',null,'missing object cannot complete');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.ref(101)$$,'42501',null,'viewer cannot add reference');
select throws_ok($$select pg_temp.start(201)$$,'42501',null,'viewer cannot upload');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.ref(101)$$,'42501',null,'publisher cannot add reference');
select throws_ok($$select pg_temp.complete(300)$$,'42501',null,'publisher cannot complete');
select pg_temp.actor(2);
select lives_ok($$select pg_temp.ref(101)$$,'editor can add scoped reference');
select throws_ok($$select pg_temp.complete(300)$$,'42501',null,'editor cannot complete another actor intent');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.ref(101)$$,'reviewer can add scoped reference');
reset role;
insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
  select pg_temp.id(60),'pi-technical-evidence',result->>'storage_path',pg_temp.id(1)::text,
    '{"size":60,"mimetype":"application/pdf"}','synthetic-only' from results where label='upload';
select pg_temp.actor(1);
set local role authenticated;
insert into results values('done',pg_temp.complete(300));
select is(pg_temp.complete(300),(select result from results where label='done'),'completion retry is immutable');
select is((select byte_verification from document_upload_completions),'not_attested','direct wrapper cannot attest bytes');
select ok((select bool_and(publication_status='private' and usage_rights_status='needs_confirmation' and file_hash is null and storage_path is null) from technical_documents),'references remain private and unapproved');
select is((select count(*)::int from evidence_sources),0,'no new technical evidence');
select is((select count(*)::int from verification_events),0,'no human verification created');
select is((select count(*)::int from publish_records),0,'no publication created');
select is((select count(*)::int from technical_document_bindings),3,'all scoped references retained');
reset role;
select is((select count(*)::int from private.pi_mutation_context),0,'mutation capability cleared');
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(1);
set local role authenticated;
select throws_ok($$select pg_temp.ref(100)$$,'42501',null,'revoked reference retry refused');
select throws_ok($$select pg_temp.start(200)$$,'42501',null,'revoked upload retry refused');
select throws_ok($$select pg_temp.complete(300)$$,'42501',null,'revoked completion retry refused');
reset role;
select * from finish();
rollback;
