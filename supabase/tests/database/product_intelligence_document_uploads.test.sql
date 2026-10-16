begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
set local timezone = 'UTC';
select plan(69);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('a2000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'document-upload-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values (pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'document-upload-category','synthetic-upload','Synthetic category','synthetic-upload');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'document-upload-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),
    'synthetic-upload-' || n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED'
    from generate_series(12,15) n;
create temporary table results(label text primary key,result jsonb);
grant select on results to authenticated;
grant usage on schema storage to authenticated;
grant select,insert,update,delete on storage.objects to authenticated;
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.reference(n integer) returns uuid language sql as $$
  select (private.pi_add_document_reference(pg_temp.id(n),pg_temp.id(12),jsonb_build_object(
    'source_level','A','source_kind','company_record','document_type','catalog','issued_date',null,
    'owner_name','Synthetic custodian','source_reference','TEST-ONLY no actual document',
    'source_location','Synthetic page 1','revision_label',null,'scope_note','Synthetic exact-SKU scope',
    'title','Synthetic document'))->>'document_id')::uuid;
$$;
create function pg_temp.manifest() returns jsonb language sql as $$
  select jsonb_build_object('filename','synthetic.pdf','file_hash',repeat('a',64),
    'byte_size',60,'mime_type','application/pdf','page_count',2);
$$;
create function pg_temp.start(n integer,manifest jsonb default pg_temp.manifest()) returns jsonb language sql as $$
  select private.pi_begin_document_upload(pg_temp.id(n),pg_temp.reference(100),manifest);
$$;
create function pg_temp.complete(n integer,label text) returns jsonb language sql as $$
  select private.pi_complete_document_upload(pg_temp.id(n),(result->>'intent_id')::uuid)
    from results where results.label=complete.label;
$$;
create function pg_temp.object_name(label text) returns text language sql as $$
  select result->>'storage_path' from results where results.label=object_name.label;
$$;
create function pg_temp.put(n integer,label text,owner text default auth.uid()::text,
  metadata jsonb default '{"size":60,"mimetype":"application/pdf"}') returns void language sql as $$
  insert into storage.objects(id,bucket_id,name,owner_id,metadata,version)
    values(pg_temp.id(n),'pi-technical-evidence',pg_temp.object_name(label),owner,metadata,'synthetic-v1');
$$;
create function pg_temp.move(n integer,new_name text) returns integer language sql as $$
  with changed as (update storage.objects set name=new_name where id=pg_temp.id(n) returning id)
  select count(*)::int from changed;
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select throws_ok($$select private.pi_begin_document_upload(pg_temp.id(200),null,pg_temp.manifest())$$,'42501',null,'viewer denied before adoption disclosure');
select pg_temp.actor(1);
select throws_ok($$select private.pi_begin_document_upload(pg_temp.id(200),null,pg_temp.manifest())$$,'55000',null,'intake requires working adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(16)],pg_temp.id(1),'Synthetic document upload fixture');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
select is((select count(*)::int from pg_class where relname in ('document_upload_intents','document_upload_completions')
  and relrowsecurity and relforcerowsecurity),2,'both ledgers force RLS');
select ok(not has_table_privilege('authenticated','document_upload_intents','insert,update,delete'),'no authenticated direct intent writes');
select ok(not has_table_privilege('service_role','document_upload_completions','insert,update,delete'),'no service completion writes');
select ok(not has_function_privilege('authenticated','private.pi_begin_document_upload(uuid,uuid,jsonb)','execute'),'begin remains private');
select ok(not has_function_privilege('service_role','private.pi_complete_document_upload(uuid,uuid)','execute'),'service cannot complete');
select ok(not has_function_privilege('anon','public.pi_can_upload_document(text)','execute'),'anonymous cannot inspect write intent');
select ok(not has_function_privilege('anon','public.pi_begin_document_upload(uuid,uuid,jsonb)','execute'),'upload wrapper has no anonymous grant');
insert into results values('first',pg_temp.start(200));
create temporary table originals as select
  (select jsonb_agg(to_jsonb(d) order by id) from technical_documents d) documents,
  (select jsonb_agg(to_jsonb(d) order by id) from entity_documents d) links,
  (select jsonb_agg(to_jsonb(v) order by id) from product_variants v) variants;
select is(pg_temp.start(200),(select result from results where label='first'),'retry keeps one generated path and intent');
select throws_ok($$select pg_temp.start(200,pg_temp.manifest() || '{"page_count":3}')$$,'40001',null,'changed manifest retry rejected');
select throws_ok($$select pg_temp.start(201)$$,'40001',null,'new request cannot replace reserved original');
select ok(pg_temp.object_name('first') ~ ('^working-documents/' || pg_temp.id(1) || '/[a-f0-9-]{36}/original.pdf$'),'path is generated not supplied filename');
select throws_ok($$select pg_temp.complete(300,'first')$$,'23514',null,'missing stored object cannot complete');
select throws_ok($$select private.pi_begin_document_upload(pg_temp.id(201),pg_temp.id(90),pg_temp.manifest())$$,'55000',null,'unregistered document cannot receive upload');
select throws_ok($$select pg_temp.start(null)$$,'22023',null,'request required');
select throws_ok($$select pg_temp.start(201,null)$$,'22023',null,'null manifest rejected');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"approved_by":"forged"}')$$,'22023',null,'forged approval field rejected');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"filename":"../x.pdf"}')$$,'22023',null,'path traversal rejected');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"filename":"CON.pdf"}')$$,'22023',null,'device filename rejected');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"filename":"x.pdf "}')$$,'22023',null,'whitespace not silently trimmed');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"mime_type":"image/png"}')$$,'22023',null,'nonPDF type rejected');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"filename":"x.png"}')$$,'22023',null,'extension mismatch rejected');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"byte_size":26214401}')$$,'22023',null,'byte bound enforced');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"page_count":201}')$$,'22023',null,'page bound enforced');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"page_count":0}')$$,'22023',null,'empty page count refused');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"page_count":1.5}')$$,'22023',null,'fractional pages refused');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"byte_size":"60"}')$$,'22023',null,'string size refused');
select throws_ok($$select pg_temp.start(201,pg_temp.manifest() || '{"file_hash":"bad"}')$$,'22023',null,'invalid digest refused');

set local role authenticated;
select ok(public.pi_can_upload_document(pg_temp.object_name('first')),'current uploader can use its reserved path');
select throws_ok($$select pg_temp.put(400,'first','wrong-owner')$$,'42501',null,'forged storage owner refused');
select pg_temp.actor(2);
select ok(not public.pi_can_upload_document(pg_temp.object_name('first')),'other editor cannot use owner intent');
select throws_ok($$select pg_temp.put(400,'first')$$,'42501',null,'other editor cannot insert object');
select pg_temp.actor(1);
select lives_ok($$select pg_temp.put(400,'first')$$,'creator can insert the reserved object metadata');
select is(pg_temp.move(400,'unmanaged.pdf'),0,'managed document cannot move out');
select throws_ok($$delete from storage.objects where id=pg_temp.id(400)$$,'42501',null,'platform raw deletion guard remains');
insert into storage.objects(id,bucket_id,name,owner_id) values(pg_temp.id(401),'pi-technical-evidence','legacy-test.pdf',auth.uid()::text);
select throws_ok($$select pg_temp.move(401,'working-documents/forged/original.pdf')$$,'42501',null,'legacy object cannot move into managed namespace');
select is(pg_temp.move(401,'legacy-renamed.pdf'),1,'legacy evidence policy unchanged');
reset role;
insert into results values('done',pg_temp.complete(300,'first'));
select is(pg_temp.complete(300,'first'),(select result from results where label='done'),'completion receipt retries exactly');
select throws_ok($$select pg_temp.complete(301,'first')$$,'40001',null,'another completion request refused');
select ok(not public.pi_can_upload_document(pg_temp.object_name('first')),'completed intent cannot upload again');
select is((select byte_verification from document_upload_completions),'not_attested','metadata completion is not byte proof');
select is((select jsonb_agg(to_jsonb(d) order by id) from technical_documents d),(select documents from originals),'attachment never rewrites reference or rights');
select is((select jsonb_agg(to_jsonb(d) order by id) from entity_documents d),(select links from originals),'attachment never rewrites entity link');
select set_config('timezone','Asia/Shanghai',true);
select ok(private.pi_document_upload_current((select (result->>'intent_id')::uuid from results where label='first')),'reference digest is timezone invariant');
select set_config('timezone','UTC',true);

insert into results values
  ('badsize',private.pi_begin_document_upload(pg_temp.id(210),pg_temp.reference(110),pg_temp.manifest())),
  ('badtype',private.pi_begin_document_upload(pg_temp.id(211),pg_temp.reference(111),pg_temp.manifest()));
select pg_temp.put(410,'badsize',metadata=>'{"size":61,"mimetype":"application/pdf"}');
select pg_temp.put(411,'badtype',metadata=>'{"size":60,"mimetype":"image/png"}');
select throws_ok($$select pg_temp.complete(310,'badsize')$$,'23514',null,'stored size mismatch refused');
select throws_ok($$select pg_temp.complete(311,'badtype')$$,'23514',null,'stored MIME mismatch refused');
select is((select count(*)::int from document_upload_completions),1,'invalid metadata creates no partial completion');

select pg_temp.actor(2);
select throws_ok($$select pg_temp.complete(300,'first')$$,'42501',null,'another editor cannot complete owner upload');
insert into results values('editor',pg_temp.start(200));
select pg_temp.actor(3);
select lives_ok($$select pg_temp.start(200)$$,'reviewer has separate actor receipt');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.start(200)$$,'42501',null,'viewer cannot begin');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.start(200)$$,'42501',null,'publisher cannot begin');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.start(200)$$,'42501',null,'unassigned user cannot begin');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.start(200)$$,'42501',null,'service JWT cannot impersonate owner');
select set_config('request.jwt.claim.role','authenticated',true);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(2);
select pg_temp.actor(2);
select throws_ok($$select pg_temp.start(200)$$,'42501',null,'revoked actor cannot replay begin');
select ok(not public.pi_can_upload_document(pg_temp.object_name('editor')),'revocation closes object write');
set local role authenticated;
select is((select count(*)::int from document_upload_intents),0,'revoked actor sees no intents');
select pg_temp.actor(4);
select is((select count(*)::int from document_upload_intents),5,'current viewer reads ledger');
reset role;
select pg_temp.actor(1);
insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
  array['document_upload_intents','document_upload_completions','product_variants']);
select throws_ok($$update document_upload_intents set manifest='{}'$$,'55000',null,'intent immutable with capability');
select throws_ok($$delete from document_upload_completions$$,'55000',null,'completion immutable with capability');
select throws_ok($$truncate document_upload_intents cascade$$,'55000',null,'truncate cannot erase upload history');
update product_variants set model='Changed identity' where id=pg_temp.id(12);
select ok(not private.pi_document_upload_current((select (result->>'intent_id')::uuid from results where label='first')),'identity drift invalidates receipt binding');
select throws_ok($$select pg_temp.complete(300,'first')$$,'40001',null,'stale completion retry refused');
update product_variants set model=null where id=pg_temp.id(12);
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
select is((select jsonb_agg(to_jsonb(v) order by id) from product_variants v),(select variants from originals),'original products and lifecycles retained');
select is((select count(*)::int from verification_events)+(select count(*)::int from publish_records)
  +(select count(*)::int from technical_values),0,'upload creates no facts, human decisions or publication');
select is((select count(*)::int from private.pi_mutation_context),0,'no capability survives');
do $$ declare n integer; begin
  for n in 1..97 loop
    perform private.pi_begin_document_upload(pg_temp.id(1000+n),pg_temp.reference(2000+n),pg_temp.manifest());
  end loop;
end $$;
select throws_ok($$select private.pi_begin_document_upload(pg_temp.id(4000),pg_temp.reference(4001),pg_temp.manifest())$$,
  '54000',null,'daily intent limit applies before further intake');
select is(pg_temp.start(200),(select result from results where label='first'),'unchanged current receipt retries at daily limit');
select is((select count(*)::int from document_upload_intents where actor_id=pg_temp.id(1)),100,'limit refusal creates no partial intent');
select * from finish();
rollback;
