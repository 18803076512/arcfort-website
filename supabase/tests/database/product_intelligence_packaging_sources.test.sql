begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
set local timezone = 'UTC';
select plan(108);

create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('98000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'packaging-source-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values (pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'packaging-source-category','synthetic-packaging-source','Synthetic category','synthetic-packaging-source');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'packaging-source-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),
    'synthetic-packaging-source-' || n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED'
    from generate_series(12,15) n;
insert into packaging_records(id,external_key,product_variant_id,package_description,moq_note,lead_time_note,
  verification_status) values
  (pg_temp.id(40),'packaging-original-one',pg_temp.id(12),'Synthetic original package',
    'TEST-ONLY preserved MOQ','TEST-ONLY preserved lead time','NEEDS_FACTORY_CONFIRMATION'),
  (pg_temp.id(41),'packaging-original-two',pg_temp.id(13),'Synthetic second original package',
    'TEST-ONLY other MOQ','TEST-ONLY other lead time','NEEDS_FACTORY_CONFIRMATION');
create temporary table originals as select
  (select jsonb_agg(to_jsonb(t) order by id) from packaging_records t) packaging,
  (select jsonb_agg(to_jsonb(t) order by id) from product_variants t) variants;
create temporary table results(label text primary key,result jsonb);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.pack(quantity integer default 10,unit text default 'pieces')
returns jsonb language sql as $$
  select jsonb_build_object('package_description','TEST-ONLY sealed inner bag','quantity',quantity,'quantity_unit',unit);
$$;
create function pg_temp.copy(level text default 'A', assertion text default 'supports', basis text default 'packaging_record')
returns jsonb language sql as $$
  select jsonb_build_object('source_level',level,'source_kind',case level when 'A' then 'company_record'
    when 'B' then 'official_manufacturer' when 'C' then 'technical_standard' else 'secondary_reference' end,
    'assertion',assertion,'evidence_basis',basis,'evidence_date','2026-01-01','owner_name','Synthetic custodian',
    'source_reference','TEST-ONLY physical packaging; no actual product or commercial approval',
    'source_location','Synthetic page 1','revision_label','TEST-PACK-1','title','Synthetic packaging source');
$$;
create function pg_temp.add_source(n integer, packaging_copy jsonb default pg_temp.pack(),
  source_copy jsonb default pg_temp.copy(), variant_uuid uuid default pg_temp.id(12),
  original_uuid uuid default pg_temp.id(40))
returns jsonb language sql as $$
  select private.pi_add_packaging_source(pg_temp.id(n),variant_uuid,packaging_copy,source_copy,original_uuid);
$$;
create function pg_temp.matches(label text, packaging_copy jsonb default pg_temp.pack(),
  variant_uuid uuid default pg_temp.id(12), original_uuid uuid default pg_temp.id(40))
returns boolean language sql as $$
  select private.pi_packaging_source_matches((result->>'source_id')::uuid,variant_uuid,packaging_copy,original_uuid)
    from results where results.label=matches.label;
$$;
create function pg_temp.qualifies(label text) returns boolean language sql as $$
  select private.pi_packaging_source_can_support_review((result->>'source_id')::uuid,pg_temp.id(12),
    pg_temp.pack(),pg_temp.id(40)) from results where results.label=qualifies.label;
$$;

select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_source(100)$$,'42501',null,'viewer cannot learn adoption state through packaging intake');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.add_source(100)$$,'55000',null,'packaging intake requires adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(16)],pg_temp.id(1),'Synthetic isolated packaging fixture');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='packaging_source_bindings'::regclass),'bindings force RLS');
select ok(not has_table_privilege('authenticated','packaging_source_bindings','insert,update,delete'),'authenticated cannot directly mutate');
select ok(not has_table_privilege('service_role','packaging_source_bindings','insert,update,delete,select'),'service role has no binding grant');
select ok(not has_table_privilege('anon','packaging_source_bindings','select'),'anonymous cannot read');
select ok(not has_function_privilege('authenticated','private.pi_add_packaging_source(uuid,uuid,jsonb,jsonb,uuid)','execute'),'no authenticated private command grant');
select ok(not has_function_privilege('service_role','private.pi_add_packaging_source(uuid,uuid,jsonb,jsonb,uuid)','execute'),'no service private command grant');
select ok(not has_function_privilege('anon','public.pi_add_packaging_source(uuid,uuid,jsonb,jsonb,uuid)','execute')
  and not has_function_privilege('service_role','public.pi_add_packaging_source(uuid,uuid,jsonb,jsonb,uuid)','execute'),
  'D3 source wrapper adds no anonymous or service grant');

insert into results values('record',pg_temp.add_source(100));
select is(pg_temp.add_source(100),(select result from results where label='record'),'exact retry returns one immutable receipt');
select throws_ok($$select pg_temp.add_source(100,pg_temp.pack(11))$$,'40001',null,'receipt cannot change quantity');
select throws_ok($$select pg_temp.add_source(100,pg_temp.pack(unit=>'sets'))$$,'40001',null,'receipt cannot change unit');
select throws_ok($$select pg_temp.add_source(100,pg_temp.pack() || '{"package_description":"Other bag"}')$$,'40001',null,'receipt cannot change physical packaging');
select throws_ok($$select pg_temp.add_source(100,original_uuid=>null)$$,'40001',null,'receipt cannot detach original lineage');
select throws_ok($$select pg_temp.add_source(100,variant_uuid=>pg_temp.id(13),original_uuid=>pg_temp.id(41))$$,'40001',null,'receipt cannot transfer SKU');
select throws_ok($$select pg_temp.add_source(100,source_copy=>pg_temp.copy(basis=>'company_catalog'))$$,'40001',null,'receipt cannot replace source');
select is((select count(*)::int from packaging_source_bindings),1,'retry creates one binding');
select is((select count(*)::int from evidence_sources),1,'retry creates one source');
select is((select created_by from packaging_source_bindings),pg_temp.id(1),'source actor comes from session');
select ok(pg_temp.matches('record'),'exact SKU physical copy and original lineage match');
select ok(pg_temp.qualifies('record'),'declared exact packaging record is eligible for later human review only');
select ok(not pg_temp.matches('record',variant_uuid=>pg_temp.id(13)),'source cannot transfer across SKUs');
select ok(not pg_temp.matches('record',pg_temp.pack(11)),'source cannot transfer to another count');
select ok(not pg_temp.matches('record',pg_temp.pack(unit=>'Pieces')),'unit aliases or case changes are not inferred');
select ok(not pg_temp.matches('record',pg_temp.pack() || '{"package_description":"TEST-ONLY carton"}'),'different package cannot reuse evidence');
select ok(not pg_temp.matches('record',original_uuid=>null),'original source cannot become an unrelated new package');
select ok(not pg_temp.matches('record',original_uuid=>pg_temp.id(41)),'source cannot change original record');
select ok(not private.pi_packaging_source_matches(null,pg_temp.id(12),pg_temp.pack(),pg_temp.id(40)),'missing source never matches');
select set_config('timezone','Asia/Shanghai',true);
select ok(pg_temp.matches('record'),'source and original full hashes are timezone invariant');
select set_config('timezone','UTC',true);

insert into results values
  ('factory',pg_temp.add_source(101,source_copy=>pg_temp.copy(basis=>'factory_record'))),
  ('drawing',pg_temp.add_source(102,source_copy=>pg_temp.copy(basis=>'controlled_drawing'))),
  ('sample',pg_temp.add_source(103,source_copy=>pg_temp.copy(basis=>'approved_sample'))),
  ('catalog',pg_temp.add_source(104,source_copy=>pg_temp.copy(basis=>'company_catalog'))),
  ('official',pg_temp.add_source(105,source_copy=>pg_temp.copy('B',basis=>'manufacturer_catalog'))),
  ('standard',pg_temp.add_source(106,source_copy=>pg_temp.copy('C',basis=>'standard_reference'))),
  ('secondary',pg_temp.add_source(107,source_copy=>pg_temp.copy('D',basis=>'secondary_reference'))),
  ('reference',pg_temp.add_source(108,source_copy=>pg_temp.copy(assertion=>'reference_only'))),
  ('conflict',pg_temp.add_source(109,source_copy=>pg_temp.copy(assertion=>'contradicts'))),
  ('unknown',pg_temp.add_source(110,pg_temp.pack(null,null))),
  ('new',pg_temp.add_source(111,original_uuid=>null));
select ok(pg_temp.qualifies('factory'),'declared factory record can support review');
select ok(pg_temp.qualifies('drawing'),'declared controlled drawing can support review');
select ok(pg_temp.qualifies('sample'),'declared sample can support review');
select ok(not pg_temp.qualifies('catalog'),'company catalog cannot confirm actual packaging');
select ok(not pg_temp.qualifies('official'),'manufacturer package remains reference, not ArcFort confirmation');
select ok(not pg_temp.qualifies('standard'),'standard cannot confirm exact SKU packaging count');
select ok(not pg_temp.qualifies('secondary'),'secondary reference cannot confirm actual packaging');
select ok(not pg_temp.qualifies('reference'),'reference-only assertion cannot confirm');
select ok(not pg_temp.qualifies('conflict'),'contradiction cannot be supporting confirmation');
select is((select count(*)::int from packaging_source_bindings where assertion='contradicts'),1,'contradiction is retained');
select ok(pg_temp.matches('unknown',pg_temp.pack(null,null)),'unknown quantity remains explicitly null');
select ok(not pg_temp.matches('unknown'),'unknown quantity cannot evidence a guessed count');
select ok(pg_temp.matches('new',original_uuid=>null),'new package has explicitly separate lineage');
select ok(not pg_temp.matches('new'),'new package cannot silently acquire original lineage');

select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || '{"moq_note":"Changed MOQ"}')$$,'22023',null,'commercial MOQ is outside physical copy');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || '{"lead_time_note":"Changed lead time"}')$$,'22023',null,'commercial lead time is outside physical copy');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || '{"confirmed_by":"forged"}')$$,'22023',null,'physical copy cannot claim confirmation');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack()-'quantity')$$,'22023',null,'unknown quantity must be explicit not omitted');
select throws_ok($$select pg_temp.add_source(120,'[]')$$,'22023',null,'array physical copy rejected');
select throws_ok($$select pg_temp.add_source(120,null)$$,'22023',null,'null physical copy rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || '{"package_description":null}')$$,'22023',null,'null description rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || '{"package_description":" "}')$$,'22023',null,'blank description rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || jsonb_build_object('package_description',repeat('x',1001)))$$,'22023',null,'oversized description rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || jsonb_build_object('package_description',E'Bag\nCarton'))$$,'22023',null,'description control characters rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || '{"package_description":" Bag"}')$$,'22023',null,'description is not silently trimmed');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack(0))$$,'22023',null,'zero quantity rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack(-1))$$,'22023',null,'negative quantity rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || '{"quantity":1.5}')$$,'22023',null,'fractional count rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || '{"quantity":2147483648}')$$,'22023',null,'integer overflow rejected before insert');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack() || '{"quantity":"10"}')$$,'22023',null,'string quantity rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack(null,'pieces'))$$,'22023',null,'unit without quantity rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack(10,null))$$,'22023',null,'quantity without unit rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack(unit=>' '))$$,'22023',null,'blank unit rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack(unit=>repeat('x',41)))$$,'22023',null,'oversized unit rejected');
select throws_ok($$select pg_temp.add_source(120,pg_temp.pack(unit=>E'pieces\n'))$$,'22023',null,'unit control characters rejected');
select throws_ok($$select pg_temp.add_source(120,original_uuid=>pg_temp.id(41))$$,'22023',null,'foreign SKU original rejected');
select throws_ok($$select pg_temp.add_source(120,original_uuid=>pg_temp.id(42))$$,'22023',null,'missing original rejected');
select throws_ok($$select pg_temp.add_source(120,variant_uuid=>pg_temp.id(15),original_uuid=>null)$$,'55000',null,'outside-pilot SKU rejected');
select throws_ok($$select pg_temp.add_source(120,variant_uuid=>pg_temp.id(16),original_uuid=>null)$$,'55000',null,'missing adoption-list SKU rejected');
select throws_ok($$select pg_temp.add_source(null)$$,'22023',null,'request ID is required');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy() || '{"confirmed_by":"forged"}')$$,'22023',null,'source cannot claim approval attribution');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy() || '{"source_kind":"secondary_reference"}')$$,'22023',null,'source class cannot contradict level');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy('D'))$$,'22023',null,'marketplace cannot declare packaging-record basis');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy(basis=>'appearance'))$$,'22023',null,'appearance cannot evidence quantity');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy() || '{"evidence_date":"2026-02-30"}')$$,'22023',null,'invalid date rejected');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy() || '{"evidence_date":"2099-01-01"}')$$,'22023',null,'future date rejected');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy() || '{"assertion":null}')$$,'22023',null,'null source assertion rejected');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy()-'source_location')$$,'22023',null,'source location required');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy() || jsonb_build_object('title',repeat('x',2001)))$$,'22023',null,'oversized source field rejected');
select throws_ok($$select pg_temp.add_source(120,source_copy=>pg_temp.copy() || jsonb_build_object('revision_label',E'v1\nv2'))$$,'22023',null,'source control characters rejected');
select is((select count(*)::int from evidence_sources),12,'invalid commands leave no partial source');
select is((select count(*)::int from private.pi_mutation_context),0,'success clears capability');

select pg_temp.actor(2);
select lives_ok($$select pg_temp.add_source(130)$$,'editor can record unapproved evidence');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.add_source(130)$$,'reviewer uses separate actor receipt');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_source(130)$$,'42501',null,'viewer cannot add');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.add_source(130)$$,'42501',null,'publisher cannot add');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.add_source(130)$$,'42501',null,'unassigned actor cannot add');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.add_source(130)$$,'42501',null,'service JWT cannot impersonate owner');
select set_config('request.jwt.claim.role','authenticated',true);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(2);
select pg_temp.actor(2);
select throws_ok($$select pg_temp.add_source(130)$$,'42501',null,'revoked editor cannot replay receipt');
select pg_temp.actor(1);
select is((select jsonb_agg(to_jsonb(t) order by id) from packaging_records t),(select packaging from originals),'original packaging including MOQ and lead time stays exact');
select is((select jsonb_agg(to_jsonb(t) order by id) from product_variants t),(select variants from originals),'all variant identities and lifecycles stay exact');
select throws_ok($$update packaging_records set moq_note='Changed'$$,'55000',null,'original commercial writes remain frozen');
insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
  array['evidence_sources','packaging_source_bindings','product_variants','packaging_records']);
select throws_ok($$update evidence_sources set title='Tampered' where id=(select (result->>'source_id')::uuid from results where label='record')$$,
  '55000',null,'bound source cannot mutate even with capability');
select throws_ok($$delete from evidence_sources where id=(select (result->>'source_id')::uuid from results where label='record')$$,
  '55000',null,'bound source cannot be deleted');
select throws_ok($$update packaging_source_bindings set quantity=11$$,'55000',null,'binding cannot mutate even with capability');
select throws_ok($$delete from packaging_source_bindings$$,'55000',null,'binding cannot be deleted');
select throws_ok($$truncate packaging_source_bindings cascade$$,'55000',null,'binding cannot be truncated');
update product_variants set model='Changed identity' where id=pg_temp.id(12);
select ok(not pg_temp.matches('record'),'changed identity invalidates source');
update product_variants set model=null where id=pg_temp.id(12);
select ok(pg_temp.matches('record'),'exact restored identity control passes');
update packaging_records set moq_note='TEST-ONLY drift probe' where id=pg_temp.id(40);
select ok(not pg_temp.matches('record'),'full original hash detects even commercial-note drift');
select ok(pg_temp.matches('new',original_uuid=>null),'new package does not inherit an unrelated original');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();

set local role authenticated;
select pg_temp.actor(4);
select is((select count(*)::int from packaging_source_bindings),14,'current viewer reads through RLS');
select pg_temp.actor(6);
select is((select count(*)::int from packaging_source_bindings),0,'unassigned session reads no bindings');
select pg_temp.actor(2);
select is((select count(*)::int from packaging_source_bindings),0,'revoked session reads no bindings');
reset role;
select pg_temp.actor(1);
select is((select count(*)::int from packaging_records where verification_status='CONFIRMED'),0,'no confirmed packaging is created');
select is((select count(*)::int from compatibility_relationships),0,'packaging source creates no compatibility');
select is((select count(*)::int from verification_events),0,'source intake creates no approval');
select is((select count(*)::int from publish_records),0,'source intake cannot publish');
select is((select count(*)::int from private.pi_mutation_context),0,'no capability survives');
select * from finish();
rollback;
