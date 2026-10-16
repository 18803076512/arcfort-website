begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
set local timezone = 'UTC';
select plan(79);

create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('a1000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'document-reference-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values (pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'document-category','synthetic-document','Synthetic category','synthetic-document');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'document-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),
    'synthetic-document-' || n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED'
    from generate_series(12,15) n;
create temporary table originals as select jsonb_agg(to_jsonb(v) order by id) variants from product_variants v;
create temporary table results(label text primary key,result jsonb);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.copy(level text default 'A') returns jsonb language sql as $$
  select jsonb_build_object('source_level',level,'source_kind',case level when 'A' then 'company_record'
    when 'B' then 'official_manufacturer' when 'C' then 'technical_standard' else 'secondary_reference' end,
    'document_type','catalog','issued_date','2026-01-01','owner_name','Synthetic custodian',
    'source_reference','TEST-ONLY declaration; no actual document or product evidence',
    'source_location','Synthetic page 1','revision_label','TEST-DOC-1',
    'scope_note','TEST-ONLY exact SKU reference, not verified fit or values','title','Synthetic document');
$$;
create function pg_temp.add_doc(n integer,copy jsonb default pg_temp.copy(),
  variant_uuid uuid default pg_temp.id(12),prior_uuid uuid default null)
returns jsonb language sql as $$
  select private.pi_add_document_reference(pg_temp.id(n),variant_uuid,copy,prior_uuid);
$$;
create function pg_temp.doc(label text) returns uuid language sql as $$
  select (result->>'document_id')::uuid from results where results.label=doc.label;
$$;

select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_doc(100)$$,'42501',null,'viewer cannot learn adoption state');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.add_doc(100)$$,'55000',null,'document intake requires adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(16)],pg_temp.id(1),'Synthetic isolated document fixture');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='technical_document_bindings'::regclass),'bindings force RLS');
select ok(not has_table_privilege('authenticated','technical_document_bindings','insert,update,delete'),'authenticated has no binding mutation grant');
select ok(not has_table_privilege('service_role','technical_document_bindings','insert,update,delete,select'),'service has no binding grant');
select ok(not has_table_privilege('anon','technical_document_bindings','select'),'anonymous has no binding read');
select ok(not has_function_privilege('authenticated','private.pi_add_document_reference(uuid,uuid,jsonb,uuid)','execute'),'private command not exposed to authenticated');
select ok(not has_function_privilege('service_role','private.pi_add_document_reference(uuid,uuid,jsonb,uuid)','execute'),'private command not exposed to service');
select ok(not has_function_privilege('anon','public.pi_add_document_reference(uuid,uuid,jsonb,uuid)','execute'),'reference wrapper has no anonymous grant');

insert into results values('one',pg_temp.add_doc(100));
select is(pg_temp.add_doc(100),(select result from results where label='one'),'exact retry returns one immutable receipt');
select is((select count(*)::int from technical_document_bindings),1,'one binding after retry');
select is((select count(*)::int from technical_documents),1,'one document after retry');
select is((select count(*)::int from entity_documents),1,'one link after retry');
select is((select created_by from technical_document_bindings),pg_temp.id(1),'actor comes from current session');
select ok(private.pi_document_reference_matches(pg_temp.doc('one'),pg_temp.id(12)),'complete exact-SKU reference matches');
select ok(not private.pi_document_reference_matches(pg_temp.doc('one'),pg_temp.id(13)),'reference cannot transfer SKU');
select ok(not private.pi_document_reference_matches(null,pg_temp.id(12)),'missing reference never matches');
select set_config('timezone','Asia/Shanghai',true);
select ok(private.pi_document_reference_matches(pg_temp.doc('one'),pg_temp.id(12)),'full metadata hashes are timezone invariant');
select set_config('timezone','UTC',true);
select throws_ok($$select pg_temp.add_doc(100,pg_temp.copy() || '{"revision_label":"TEST-DOC-2"}')$$,'40001',null,'receipt cannot change revision');
select throws_ok($$select pg_temp.add_doc(100,variant_uuid=>pg_temp.id(13))$$,'40001',null,'receipt cannot change SKU');
select throws_ok($$select pg_temp.add_doc(100,prior_uuid=>pg_temp.doc('one'))$$,'40001',null,'receipt cannot change lineage');
insert into results values('two',pg_temp.add_doc(101,pg_temp.copy() || '{"revision_label":"TEST-DOC-2"}',prior_uuid=>pg_temp.doc('one')));
select is((select prior_document_id from technical_document_bindings where technical_document_id=pg_temp.doc('two')),pg_temp.doc('one'),'new version retains explicit prior reference');
select ok(private.pi_document_reference_matches(pg_temp.doc('one'),pg_temp.id(12)),'new version does not replace the prior record');
insert into results values('unknown',pg_temp.add_doc(102,pg_temp.copy() || '{"revision_label":null,"issued_date":null}'));
select ok((select revision_label is null and issued_date is null from technical_document_bindings where technical_document_id=pg_temp.doc('unknown')),'unknown date and revision remain null');
select lives_ok($$select pg_temp.add_doc(103,pg_temp.copy('B'))$$,'official manufacturer stays a private reference');
select lives_ok($$select pg_temp.add_doc(104,pg_temp.copy('C') || '{"document_type":"standard"}')$$,'standard stays a private reference');
select lives_ok($$select pg_temp.add_doc(105,pg_temp.copy('D'))$$,'secondary source can be retained without confirming facts');

select throws_ok($$select pg_temp.add_doc(120,null)$$,'22023',null,'null metadata rejected');
select throws_ok($$select pg_temp.add_doc(120,'[]')$$,'22023',null,'array metadata rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy()-'issued_date')$$,'22023',null,'unknown date must be explicit');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy()-'source_location')$$,'22023',null,'source location required');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"title":null}')$$,'22023',null,'null title rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"title":123}')$$,'22023',null,'numeric title rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"owner_name":" "}')$$,'22023',null,'blank custodian rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"revision_label":" v1"}')$$,'22023',null,'revision not silently trimmed');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || jsonb_build_object('source_location',E'page 1\npage 2'))$$,'22023',null,'control characters rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || jsonb_build_object('title',repeat('x',501)))$$,'22023',null,'oversized title rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || jsonb_build_object('revision_label',repeat('x',201)))$$,'22023',null,'oversized revision rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || jsonb_build_object('scope_note',repeat('x',2001)))$$,'22023',null,'oversized scope rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"source_kind":"secondary_reference"}')$$,'22023',null,'class cannot contradict level');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"document_type":"certificate_approved"}')$$,'22023',null,'unsupported document type rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"issued_date":"2026-02-30"}')$$,'22023',null,'invalid calendar date rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"issued_date":"2099-01-01"}')$$,'22023',null,'future date rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"issued_date":"2026-1-1"}')$$,'22023',null,'noncanonical date rejected');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"publication_status":"public"}')$$,'22023',null,'publication cannot be supplied');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"usage_rights_status":"approved"}')$$,'22023',null,'rights cannot be supplied');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"confirmed_by":"forged"}')$$,'22023',null,'approval cannot be forged');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"file_hash":"declared"}')$$,'22023',null,'metadata cannot attest file bytes');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"storage_path":"private/other.pdf"}')$$,'22023',null,'metadata cannot bind an uninspected stored object');
select throws_ok($$select pg_temp.add_doc(120,pg_temp.copy() || '{"public_url":"https://example.invalid/document.pdf"}')$$,'22023',null,'private reference cannot introduce a public download');
select throws_ok($$select pg_temp.add_doc(120,variant_uuid=>pg_temp.id(13),prior_uuid=>pg_temp.doc('one'))$$,'22023',null,'cross-SKU prior reference rejected');
select throws_ok($$select pg_temp.add_doc(120,prior_uuid=>pg_temp.id(90))$$,'22023',null,'missing prior reference rejected');
select throws_ok($$select pg_temp.add_doc(120,variant_uuid=>pg_temp.id(15))$$,'55000',null,'outside-pilot SKU rejected');
select throws_ok($$select pg_temp.add_doc(120,variant_uuid=>pg_temp.id(16))$$,'55000',null,'nonexistent pilot SKU rejected');
select throws_ok($$select pg_temp.add_doc(null)$$,'22023',null,'request ID required');
select is((select count(*)::int from technical_documents),6,'invalid commands create no partial document');
select is((select count(*)::int from private.pi_mutation_context),0,'success clears command capability');

select pg_temp.actor(2);
select lives_ok($$select pg_temp.add_doc(130)$$,'editor records unapproved reference');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.add_doc(130)$$,'reviewer has actor-scoped receipt');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_doc(130)$$,'42501',null,'viewer cannot add');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.add_doc(130)$$,'42501',null,'publisher cannot add');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.add_doc(130)$$,'42501',null,'unassigned actor cannot add');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.add_doc(130)$$,'42501',null,'service JWT cannot impersonate owner');
select set_config('request.jwt.claim.role','authenticated',true);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(2);
select pg_temp.actor(2);
select throws_ok($$select pg_temp.add_doc(130)$$,'42501',null,'revoked editor cannot replay receipt');
select pg_temp.actor(1);
select throws_ok($$update technical_documents set title='Changed'$$,'55000',null,'direct writes remain frozen');
insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
  array['technical_documents','entity_documents','technical_document_bindings','product_variants']);
select throws_ok($$update technical_documents set title='Tampered'$$,'55000',null,'bound document immutable even with capability');
select throws_ok($$delete from technical_documents$$,'55000',null,'bound document cannot be deleted');
select throws_ok($$update entity_documents set product_variant_id=pg_temp.id(13)$$,'55000',null,'bound link cannot transfer');
select throws_ok($$delete from entity_documents$$,'55000',null,'bound link cannot be deleted');
select throws_ok($$insert into entity_documents(technical_document_id,product_variant_id,relationship_role)
  values(pg_temp.doc('one'),pg_temp.id(13),'reference_only')$$,'55000',null,'bound document cannot acquire another subject');
select throws_ok($$update technical_document_bindings set source_location='Tampered'$$,'55000',null,'binding cannot change');
select throws_ok($$truncate technical_documents cascade$$,'55000',null,'cascaded truncate cannot erase bound references');
update product_variants set model='Changed identity' where id=pg_temp.id(12);
select ok(not private.pi_document_reference_matches(pg_temp.doc('one'),pg_temp.id(12)),'changed identity invalidates document association');
update product_variants set model=null where id=pg_temp.id(12);
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
select is((select jsonb_agg(to_jsonb(v) order by id) from product_variants v),(select variants from originals),'all original product identities and lifecycles retained');

set local role authenticated;
select pg_temp.actor(4);
select is((select count(*)::int from technical_document_bindings),8,'current viewer reads bindings through RLS');
select pg_temp.actor(6);
select is((select count(*)::int from technical_document_bindings),0,'unassigned actor reads none');
select pg_temp.actor(2);
select is((select count(*)::int from technical_document_bindings),0,'revoked actor reads none');
reset role;
select pg_temp.actor(1);
select ok((select bool_and(publication_status='private' and usage_rights_status='needs_confirmation'
  and storage_bucket is null and storage_path is null and public_url is null and file_hash is null
  and raw_snapshot='{"intake_kind":"reference_only","file_inspection":"not_performed"}'::jsonb)
  from technical_documents),'all documents remain private, unapproved, without file claims');
select is((select count(*)::int from evidence_sources)+(select count(*)::int from technical_values)
  +(select count(*)::int from compatibility_relationships)+(select count(*)::int from verification_events)
  +(select count(*)::int from publish_records)+(select count(*)::int from storage.objects),0,
  'references create no technical evidence, values, compatibility, decisions, publications or files');
select * from finish();
rollback;
