begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
select plan(73);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('95000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'original-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'original-category','original-category','Synthetic category','original-category');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'original-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),'synthetic-original-' || n,
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED' from generate_series(12,16) n;
create temporary table results(label text primary key,result jsonb);
grant select on results to authenticated;
grant usage on schema storage to authenticated;
grant select,insert,update,delete on storage.objects to authenticated;
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.manifest() returns jsonb language sql as $$
  select jsonb_build_object('filename','original-test.jpg','file_hash',repeat('a',64),'byte_size',60,
    'mime_type','image/jpeg','width',20,'height',10,'source_kind','own_photo',
    'source_owner','Synthetic custodian','source_reference','Synthetic source TEST-ORIGINAL-1');
$$;
create function pg_temp.start(n integer,manifest jsonb default pg_temp.manifest(),variant_uuid uuid default pg_temp.id(12))
returns jsonb language sql as $$ select private.pi_begin_media_upload(pg_temp.id(n),variant_uuid,manifest); $$;
create function pg_temp.complete(n integer,label text) returns jsonb language sql as $$
  select private.pi_complete_media_upload(pg_temp.id(n),(result->>'intent_id')::uuid) from results where results.label=complete.label;
$$;
create function pg_temp.object_name(label text) returns text language sql as $$
  select result->>'storage_path' from results where results.label=object_name.label;
$$;
create function pg_temp.put(n integer,label text,owner text default auth.uid()::text,metadata jsonb default '{"size":60,"mimetype":"image/jpeg"}')
returns void language sql as $$
  insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
    values(pg_temp.id(n),'pi-product-originals',pg_temp.object_name(label),owner,metadata,'synthetic-v1');
$$;
create function pg_temp.move(n integer,new_name text) returns integer language sql as $$
  with changed as (update storage.objects set name=new_name where id=pg_temp.id(n) returning id)
  select count(*)::int from changed;
$$;
-- SQL-only fixture models the Storage service operation; function-local setting always restores.
create function pg_temp.remove(n integer) returns integer language sql
set storage.allow_delete_query='true' as $$
  with changed as (delete from storage.objects where id=pg_temp.id(n) returning id)
  select count(*)::int from changed;
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(1);
select throws_ok($$select pg_temp.start(100)$$,'55000',null,'intake requires adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(15)],pg_temp.id(1),'Synthetic original fixture');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
select is((select count(*)::int from pg_class where relname in ('media_upload_intents','media_upload_completions')
  and relrowsecurity and relforcerowsecurity),2,'both intake ledgers force RLS');
select ok(not has_table_privilege('authenticated','media_upload_intents','insert,update,delete'),'no direct intent writes');
select ok(not has_table_privilege('service_role','media_upload_completions','insert,update,delete'),'no service completion writes');
select ok(not has_function_privilege('authenticated','private.pi_begin_media_upload(uuid,uuid,jsonb)','execute'),'intake remains private');
select ok(not has_function_privilege('service_role','private.pi_complete_media_upload(uuid,uuid)','execute'),'service cannot finalize');
select ok(not has_function_privilege('anon','public.pi_can_upload_original(text)','execute'),'anonymous cannot inspect intents');

insert into results values('first',pg_temp.start(100));
select is(pg_temp.start(100),(select result from results where label='first'),'retry returns same intent and generated path');
select throws_ok($$select pg_temp.start(100,pg_temp.manifest() || '{"source_reference":"Changed"}')$$,'40001',null,'changed retry payload rejected');
select is((select count(*)::int from media_upload_intents),1,'retry adds no duplicate');
select ok(pg_temp.object_name('first') ~ ('^working-originals/' || pg_temp.id(1) || '/[a-f0-9-]{36}/original.jpg$'),'storage path is generated, not supplied filename');
select throws_ok($$select pg_temp.complete(200,'first')$$,'23514',null,'missing object cannot finalize');
select is((select count(*)::int from media_assets),0,'failed completion leaves no asset');
select throws_ok($$select pg_temp.start(101,variant_uuid=>pg_temp.id(16))$$,'55000',null,'nonpilot subject denied');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"approved_by":"forged"}')$$,'22023',null,'approval fields rejected');
select throws_ok($$select pg_temp.start(101,null)$$,'22023',null,'null manifest rejected');
select throws_ok($$select private.pi_begin_media_upload(null,pg_temp.id(12),pg_temp.manifest())$$,'22023',null,'request identity is mandatory');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"filename":"../original.jpg"}')$$,'22023',null,'path traversal filename rejected');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"filename":"dir\\original.jpg"}')$$,'22023',null,'Windows path filename rejected');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"filename":"original.png"}')$$,'22023',null,'extension and MIME mismatch rejected');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"byte_size":26214401}')$$,'22023',null,'oversized object denied');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"width":16000,"height":16000}')$$,'22023',null,'pixel bound enforced');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"width":1.5}')$$,'22023',null,'fractional dimensions rejected');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"file_hash":"invalid"}')$$,'22023',null,'invalid hash rejected');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"source_owner":" "}')$$,'22023',null,'missing source custodian rejected');
select throws_ok($$select pg_temp.start(101,pg_temp.manifest() || '{"source_kind":"verified_factory"}')$$,'22023',null,'unsupported source classification rejected');

set local role authenticated;
select ok(public.pi_can_upload_original(pg_temp.object_name('first')),'creator can upload original to reserved path');
select throws_ok($$select pg_temp.put(300,'first','wrong-owner')$$,'42501',null,'forged object owner denied');
select pg_temp.actor(2);
select ok(not public.pi_can_upload_original(pg_temp.object_name('first')),'another editor cannot use owner intent');
select throws_ok($$select pg_temp.put(300,'first')$$,'42501',null,'another editor cannot upload to owner path');
select pg_temp.actor(1);
select lives_ok($$select pg_temp.put(300,'first')$$,'creator inserts only at the reserved path');
select is(pg_temp.move(300,'unmanaged.jpg'),0,'managed object cannot move out of protected namespace');
select throws_ok($$delete from storage.objects where id=pg_temp.id(300)$$,'42501',null,'platform blocks raw deletion before RLS');
select is(pg_temp.remove(300),0,'even owner cannot delete managed original');
insert into storage.objects(id,bucket_id,name,owner_id) values(pg_temp.id(301),'pi-product-originals','legacy-test.jpg',auth.uid()::text);
select throws_ok($$select pg_temp.move(301,'working-originals/forged/original.jpg')$$,'42501',null,'unmanaged object cannot move into protected namespace');
select is(pg_temp.move(301,'legacy-renamed.jpg'),1,'legacy object policy remains unchanged');
select throws_ok($$delete from storage.objects where id=pg_temp.id(301)$$,'42501',null,'platform also blocks raw legacy deletion');
select is(pg_temp.remove(301),1,'legacy owner policy remains unchanged');
select throws_ok($$delete from storage.objects where id=pg_temp.id(300)$$,'42501',null,'service probe restores the platform guard');
reset role;
insert into results values('completed',pg_temp.complete(200,'first'));
select is(pg_temp.complete(200,'first'),(select result from results where label='completed'),'completion retry returns same asset');
select throws_ok($$select pg_temp.complete(201,'first')$$,'40001',null,'second completion request cannot add asset');
select is((select count(*)::int from media_assets),1,'exactly one asset created');
select ok((select usage_rights_status='needs_confirmation' and content_match_status='needs_review'
  and publication_status='blocked' and approved_by is null and public_path is null from media_assets),'original remains private and unapproved');
select is((select raw_snapshot->>'byte_verification' from media_assets),'not_attested','storage metadata never becomes byte attestation');
select is((select count(*)::int from product_media),0,'intake does not map or replace a product image');
select ok(not public.pi_can_upload_original(pg_temp.object_name('first')),'completed intent cannot upload again');

insert into results values('wrong-size',pg_temp.start(110)),('wrong-type',pg_temp.start(111)),('wrong-owner',pg_temp.start(112));
select pg_temp.put(310,'wrong-size',pg_temp.id(1)::text,'{"size":59,"mimetype":"image/jpeg"}');
select pg_temp.put(311,'wrong-type',pg_temp.id(1)::text,'{"size":60,"mimetype":"image/png"}');
select pg_temp.put(312,'wrong-owner',pg_temp.id(2)::text);
select throws_ok($$select pg_temp.complete(210,'wrong-size')$$,'23514',null,'wrong stored size denied');
select throws_ok($$select pg_temp.complete(211,'wrong-type')$$,'23514',null,'wrong stored MIME denied');
select throws_ok($$select pg_temp.complete(212,'wrong-owner')$$,'23514',null,'wrong stored owner denied');
select is((select count(*)::int from media_assets),1,'invalid stored objects leave no partial assets');
select pg_temp.actor(2);
select lives_ok($$select pg_temp.start(120)$$,'editor may prepare original');
select throws_ok($$select pg_temp.complete(220,'first')$$,'42501',null,'editor cannot finish another actor intent');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.start(120)$$,'reviewer may prepare original');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.start(120)$$,'42501',null,'viewer cannot prepare original');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.start(120)$$,'42501',null,'publisher cannot prepare original');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.start(120)$$,'42501',null,'unassigned session denied');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.start(125)$$,'42501',null,'service claim cannot impersonate owner');
select ok(not public.pi_can_upload_original(pg_temp.object_name('wrong-size')),'service claim cannot use a user intent');
select set_config('request.jwt.claim.role','authenticated',true);
insert into results values('identity-drift',pg_temp.start(130,variant_uuid=>pg_temp.id(13)));
select pg_temp.put(330,'identity-drift');
select ok(public.pi_can_upload_original(pg_temp.object_name('identity-drift')),'identity drift probe begins with matching scope');
insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
  array['media_assets','media_upload_intents','media_upload_completions','product_variants']);
select throws_ok($$update media_assets set file_hash=repeat('b',64)$$,'55000',null,'original hash cannot be replaced');
select throws_ok($$delete from media_assets$$,'55000',null,'completed original cannot be deleted through a capability');
select throws_ok($$update media_upload_intents set manifest='{}'$$,'55000',null,'intent manifest immutable');
select throws_ok($$delete from media_upload_completions$$,'55000',null,'completion cannot be deleted');
select throws_ok($$truncate media_upload_completions$$,'55000',null,'completion cannot be truncated');
update product_variants set model='Changed synthetic identity' where id=pg_temp.id(13);
select ok(not public.pi_can_upload_original(pg_temp.object_name('identity-drift')),'changed SKU identity disables its upload path');
select throws_ok($$select pg_temp.start(130,variant_uuid=>pg_temp.id(13))$$,'40001',null,'changed SKU cannot replay a stale intake path');
select throws_ok($$select pg_temp.complete(230,'identity-drift')$$,'40001',null,'changed SKU identity cannot finalize old intent');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(1);
select ok(not public.pi_can_upload_original(pg_temp.object_name('wrong-size')),'revoked role cannot upload through old intent');
select throws_ok($$select pg_temp.complete(200,'first')$$,'42501',null,'revoked role cannot replay completed receipt');
set local role authenticated;
select is((select count(*)::int from media_upload_intents),0,'revoked actor cannot read ledger');
reset role;
select is((select count(*)::int from verification_events),0,'no human approval manufactured');
select is((select count(*)::int from publish_records),0,'no publication manufactured');
select is((select count(*)::int from private.pi_mutation_context),0,'no capability survives');
select * from finish();
rollback;
