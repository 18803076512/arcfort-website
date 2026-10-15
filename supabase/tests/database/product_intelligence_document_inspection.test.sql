begin;
create extension if not exists pgtap with schema extensions;
set search_path=extensions,public;
select plan(24);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('a5000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'document-inspect-'||n||'@example.invalid',now() from generate_series(1,5) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),(pg_temp.id(3),'viewer'),(pg_temp.id(4),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'document-inspection','document-inspection','Synthetic','document-inspection');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'document-inspection',pg_temp.id(10),'Synthetic','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  values(pg_temp.id(12),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-9999','synthetic-document-inspection',
  'draft','needs_review','needs_photo','unverified','unknown','INGESTED');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic document inspection');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create temporary table saved(label text,result jsonb);
grant select,insert on saved to authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
select ok(has_function_privilege('authenticated','public.pi_document_original_snapshot(uuid,uuid)','execute'),'authenticated snapshot');
select ok(not has_function_privilege('anon','public.pi_document_original_snapshot(uuid,uuid)','execute'),'no anonymous snapshot');
select ok(not has_function_privilege('service_role','public.pi_document_original_snapshot(uuid,uuid)','execute'),'no service snapshot');
set local role authenticated;
insert into saved values('reference',public.pi_add_document_reference(pg_temp.id(100),pg_temp.id(12),jsonb_build_object(
  'source_level','A','source_kind','company_record','document_type','drawing','issued_date',null,
  'owner_name','Synthetic custodian','source_reference','TEST-ONLY','source_location','Page 1',
  'revision_label',null,'scope_note','Synthetic scope','title','Synthetic drawing')));
insert into saved select 'intent',public.pi_begin_document_upload(pg_temp.id(101),(result->>'document_id')::uuid,
  jsonb_build_object('filename','synthetic.pdf','file_hash',repeat('a',64),'byte_size',60,'mime_type','application/pdf','page_count',1)) from saved where label='reference';
create function pg_temp.inspect(subject integer default 12) returns jsonb language sql as $$
  select public.pi_document_original_snapshot(pg_temp.id(subject),(result->>'document_id')::uuid) from saved where label='reference';
$$;
select throws_ok($$select pg_temp.inspect()$$,'40001',null,'incomplete upload refused');
reset role;
insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
  select pg_temp.id(60),'pi-technical-evidence',result->>'storage_path',pg_temp.id(1)::text,
    '{"size":60,"mimetype":"application/pdf"}','synthetic-only' from saved where label='intent';
set local role authenticated;
select public.pi_complete_document_upload(pg_temp.id(102),(result->>'intent_id')::uuid) from saved where label='intent';
insert into saved values('snapshot',pg_temp.inspect());
select lives_ok($$select pg_temp.inspect()$$,'owner reads completed original snapshot');
select is(pg_temp.inspect()->>'variant_id',pg_temp.id(12)::text,'exact SKU');
select ok(pg_temp.inspect()->>'snapshot_digest' ~ '^[a-f0-9]{64}$','bound snapshot digest');
select is(pg_temp.inspect(),(select result from saved where label='snapshot'),'repeated snapshot is stable');
set local timezone='Asia/Shanghai';
select is(pg_temp.inspect(),(select result from saved where label='snapshot'),'snapshot is timezone invariant');
select throws_ok($$select pg_temp.inspect(13)$$,'40001',null,'another SKU refused');
select pg_temp.actor(2);
select lives_ok($$select pg_temp.inspect()$$,'editor reads original');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.inspect()$$,'viewer reads original');
select pg_temp.actor(4);
select lives_ok($$select pg_temp.inspect()$$,'publisher reads original without editorial powers');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.inspect()$$,'42501',null,'unassigned session refused');
reset role;
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(4);
select pg_temp.actor(4);
set local role authenticated;
select throws_ok($$select pg_temp.inspect()$$,'42501',null,'revoked session refused');
reset role;
select pg_temp.actor(1);
update storage.objects set version='changed' where id=pg_temp.id(60);
select throws_ok($$select pg_temp.inspect()$$,'40001',null,'changed Storage version refused');
update storage.objects set version='synthetic-only',metadata='{"size":61,"mimetype":"application/pdf"}' where id=pg_temp.id(60);
select throws_ok($$select pg_temp.inspect()$$,'40001',null,'changed Storage metadata refused');
update storage.objects set metadata='{"size":60,"mimetype":"application/pdf"}',name='working-documents/wrong.pdf' where id=pg_temp.id(60);
select throws_ok($$select pg_temp.inspect()$$,'40001',null,'changed Storage path refused');
update storage.objects set name=(select result->>'storage_path' from saved where label='intent'),owner_id=pg_temp.id(2)::text where id=pg_temp.id(60);
select throws_ok($$select pg_temp.inspect()$$,'40001',null,'changed owner refused');
update storage.objects set owner_id=pg_temp.id(1)::text,bucket_id='pi-product-originals' where id=pg_temp.id(60);
select throws_ok($$select pg_temp.inspect()$$,'40001',null,'changed bucket refused');
update storage.objects set bucket_id='pi-technical-evidence' where id=pg_temp.id(60);
select is(pg_temp.inspect(),(select result from saved where label='snapshot'),'restored synthetic snapshot matches');
update storage.objects set id=pg_temp.id(61) where id=pg_temp.id(60);
select throws_ok($$select pg_temp.inspect()$$,'40001',null,'missing object refused');
select is((select byte_verification from document_upload_completions limit 1),'not_attested','inspection does not attest or approve documents');
select is((select count(*)::int from publish_records),0,'no publication');
select * from finish();
rollback;
