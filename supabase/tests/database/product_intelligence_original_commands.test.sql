begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
select plan(29);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('96000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'original-command-' || n || '@example.invalid',now() from generate_series(1,5) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'original-command','original-command','Synthetic','original-command');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'original-command',pg_temp.id(10),'Synthetic','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  values(pg_temp.id(12),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-0012','synthetic-original-command',
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED');
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.start(n integer) returns jsonb language sql as $$
  select public.pi_begin_media_upload(pg_temp.id(n),pg_temp.id(12),jsonb_build_object(
    'filename','synthetic.jpg','file_hash',repeat('a',64),'byte_size',60,'mime_type','image/jpeg',
    'width',20,'height',10,'source_kind','own_photo','source_owner','Synthetic custodian','source_reference','TEST-ONLY'));
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
select ok(has_function_privilege('authenticated','public.pi_begin_media_upload(uuid,uuid,jsonb)','execute'),'authenticated begin wrapper');
select ok(has_function_privilege('authenticated','public.pi_complete_media_upload(uuid,uuid)','execute'),'authenticated completion wrapper');
select ok(has_function_privilege('authenticated','public.pi_read_original_intakes(uuid,integer)','execute'),'authenticated read wrapper');
select ok(not has_function_privilege('anon','public.pi_begin_media_upload(uuid,uuid,jsonb)','execute'),'no anonymous begin grant');
select ok(not has_function_privilege('service_role','public.pi_complete_media_upload(uuid,uuid)','execute'),'no service completion grant');
select ok(not has_function_privilege('authenticated','private.pi_begin_media_upload(uuid,uuid,jsonb)','execute'),'no private bypass grant');
select throws_ok($$select pg_temp.start(100)$$,'55000',null,'wrapper requires adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic wrapper test');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
create temporary table result(value jsonb);
grant select,insert on result to authenticated;
set local role authenticated;
insert into result values(pg_temp.start(100));
select is(pg_temp.start(100),(select value from result),'wrapper retry retains intent');
select is((select count(*)::int from public.pi_read_original_intakes(pg_temp.id(12),1)),1,'exact SKU intake read');
select ok((select not completed and subject_current from public.pi_read_original_intakes(pg_temp.id(12),1)),'pending current intake is explicit');
select ok((select not (to_jsonb(row) ?| array['storage_path','actor_id','storage_metadata','file_hash']) from public.pi_read_original_intakes(pg_temp.id(12),1) row),'read DTO omits private path and raw storage fields');
select throws_ok($$select public.pi_read_original_intakes(pg_temp.id(12),0)$$,'22023',null,'invalid page denied');
select throws_ok($$select public.pi_read_original_intakes(null,1)$$,'22023',null,'null identity denied');
select is((select count(*)::int from public.pi_read_original_intakes(pg_temp.id(99),1)),0,'unadopted SKU has no intake');
reset role;
insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
  select pg_temp.id(60),'pi-product-originals',value->>'storage_path',pg_temp.id(1)::text,
    '{"size":60,"mimetype":"image/jpeg"}','synthetic-only' from result;
set local role authenticated;
select lives_ok($$select public.pi_complete_media_upload(pg_temp.id(200),(select (value->>'intent_id')::uuid from result))$$,'wrapper completes matching metadata');
select ok((select completed from public.pi_read_original_intakes(pg_temp.id(12),1)),'completed metadata state visible');
select is((select raw_snapshot->>'byte_verification' from media_assets),'not_attested','wrapper cannot assert trusted byte attestation');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.start(101)$$,'42501',null,'viewer cannot upload');
select is((select count(*)::int from public.pi_read_original_intakes(pg_temp.id(12),1)),1,'viewer can inspect intake metadata');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.start(101)$$,'42501',null,'publisher cannot upload');
select pg_temp.actor(2);
select lives_ok($$select pg_temp.start(101)$$,'editor may upload');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.start(101)$$,'reviewer may upload');
select pg_temp.actor(1);
select pg_temp.start(n) from generate_series(1001,1099) n;
select throws_ok($$select pg_temp.start(1100)$$,'54000',null,'100 intents per actor per 24 hours enforced');
select is(pg_temp.start(100),(select value from result),'quota does not block unchanged retry');
select is((select count(*)::int from public.pi_read_original_intakes(pg_temp.id(12),1)),25,'intake page size bounded');
select is((select max(total_count) from public.pi_read_original_intakes(pg_temp.id(12),1)),102::bigint,'count includes other operators without truncation');
select is((select count(*)::int from public.pi_read_original_intakes(pg_temp.id(12),5)),2,'last page retains remaining intakes');
reset role;
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(1);
set local role authenticated;
select throws_ok($$select pg_temp.start(100)$$,'42501',null,'revoked retry denied');
select throws_ok($$select public.pi_read_original_intakes(pg_temp.id(12),1)$$,'42501',null,'revoked read denied');
reset role;
select * from finish();
rollback;
