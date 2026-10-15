begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
select plan(23);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('a4000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'document-read-' || n || '@example.invalid',now() from generate_series(1,4) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),(pg_temp.id(3),'viewer');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'document-read','document-read','Synthetic','document-read');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'document-read',pg_temp.id(10),'Synthetic','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-'||lpad(n::text,4,'0'),
    'synthetic-document-read-'||n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED' from generate_series(12,13) n;
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic document read test');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.ref(n integer,subject integer default 12) returns jsonb language sql as $$
  select public.pi_add_document_reference(pg_temp.id(n),pg_temp.id(subject),jsonb_build_object(
    'source_level','A','source_kind','company_record','document_type','drawing','issued_date',null,
    'owner_name','Synthetic custodian','source_reference','TEST-ONLY', 'source_location','Page 1',
    'revision_label',null,'scope_note','Synthetic scope','title','Synthetic drawing'));
$$;
create temporary table saved(label text,result jsonb);
grant select,insert on saved to authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
select ok(has_function_privilege('authenticated','public.pi_read_document_references(uuid,integer)','execute'),'authenticated library read');
select ok(not has_function_privilege('anon','public.pi_read_document_references(uuid,integer)','execute'),'no anonymous library read');
select ok(not has_function_privilege('service_role','public.pi_read_document_references(uuid,integer)','execute'),'no service library read');
set local role authenticated;
select is(public.pi_read_document_references(null,1),'{"items":[],"total":0}'::jsonb,'empty library has explicit zero count');
insert into saved values('reference',pg_temp.ref(100));
select pg_temp.ref(n) from generate_series(101,126) n;
insert into saved values('upload-reference',pg_temp.ref(127,13));
select is((public.pi_read_document_references(null,1)->>'total')::int,28,'global total includes both working SKUs');
select is((public.pi_read_document_references(pg_temp.id(12),1)->>'total')::int,27,'SKU total is exact');
select is(jsonb_array_length(public.pi_read_document_references(pg_temp.id(12),1)->'items'),25,'bounded first page');
select is(jsonb_array_length(public.pi_read_document_references(pg_temp.id(12),2)->'items'),2,'last page is not truncated');
select is(public.pi_read_document_references(pg_temp.id(12),3),'{"items":[],"total":27}'::jsonb,'out-of-range page retains total');
select is(public.pi_read_document_references(pg_temp.id(99),1),'{"items":[],"total":0}'::jsonb,'unadopted SKU stays empty');
select throws_ok($$select public.pi_read_document_references(null,0)$$,'22023',null,'zero page denied');
select throws_ok($$select public.pi_read_document_references(null,10001)$$,'22023',null,'oversized page denied');
select ok(not (public.pi_read_document_references(null,1)::text ~ 'storage_path|file_hash|document_digest|actor_id|raw_snapshot|storage_metadata'),'library DTO does not leak internal fields');
select ok((public.pi_read_document_references(pg_temp.id(13),1)->'items'->0->'issued_date')='null'::jsonb,'unknown issue date stays null');
insert into saved select 'intent',public.pi_begin_document_upload(pg_temp.id(200),(result->>'document_id')::uuid,
  jsonb_build_object('filename','synthetic.pdf','file_hash',repeat('a',64),'byte_size',60,'mime_type','application/pdf','page_count',1)) from saved where label='upload-reference';
select is((select item->>'upload_request_id' from jsonb_array_elements(public.pi_read_document_references(pg_temp.id(13),1)->'items') item
  where item->>'document_id'=(select result->>'document_id' from saved where label='upload-reference')),
  pg_temp.id(200)::text,'own pending receipt can resume after refresh');
select pg_temp.actor(2);
select ok(not (public.pi_read_document_references(pg_temp.id(13),1)::text like '%'||pg_temp.id(200)||'%'),'another editor cannot obtain resume nonce');
select pg_temp.actor(3);
select is((public.pi_read_document_references(null,1)->>'total')::int,28,'viewer reads library');
select ok(not (public.pi_read_document_references(pg_temp.id(13),1)::text like '%'||pg_temp.id(200)||'%'),'viewer cannot obtain resume nonce');
select pg_temp.actor(4);
select throws_ok($$select public.pi_read_document_references(null,1)$$,'42501',null,'unassigned reader refused');
reset role;
insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
  select pg_temp.id(60),'pi-technical-evidence',result->>'storage_path',pg_temp.id(1)::text,
    '{"size":60,"mimetype":"application/pdf"}','synthetic-only' from saved where label='intent';
select pg_temp.actor(1);
set local role authenticated;
select public.pi_complete_document_upload(pg_temp.id(300),(result->>'intent_id')::uuid) from saved where label='intent';
select ok(not (public.pi_read_document_references(pg_temp.id(13),1)::text like '%'||pg_temp.id(200)||'%'),'completed upload no longer exposes resume nonce');
select ok(public.pi_read_document_references(pg_temp.id(13),1)::text like '%recorded%','metadata-only completion visible');
reset role;
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(1);
set local role authenticated;
select throws_ok($$select public.pi_read_document_references(null,1)$$,'42501',null,'revoked reader refused');
reset role;
select is((select count(*)::int from publish_records),0,'library reads create no publication');
select * from finish();
rollback;
