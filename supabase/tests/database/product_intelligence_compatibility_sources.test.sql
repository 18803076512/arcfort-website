begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
set local timezone = 'UTC';
select plan(79);

create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('89000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'compatibility-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values (pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values (pg_temp.id(10),'compat-category','synthetic-compat-category','Synthetic category','synthetic-compat-category');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values (pg_temp.id(11),'compat-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),'synthetic-compat-' || n,
    'draft','needs_review','needs_photo','unverified','unknown','INGESTED' from generate_series(12,15) n;
insert into compatibility_entities(id,external_key,entity_type,label,product_variant_id) values
  (pg_temp.id(20),'compat-subject','product','Synthetic SKU 12',pg_temp.id(12)),
  (pg_temp.id(21),'compat-other','product','Synthetic SKU 13',pg_temp.id(13)),
  (pg_temp.id(22),'compat-outside','product','Synthetic outside SKU',pg_temp.id(15));
insert into compatibility_entities(id,external_key,entity_type,label) values
  (pg_temp.id(30),'compat-torch','torch','Synthetic torch A'),
  (pg_temp.id(31),'compat-other-torch','torch','Synthetic torch B'),
  (pg_temp.id(32),'compat-machine','machine','Synthetic machine'),
  (pg_temp.id(33),'compat-oem','oem_reference','Synthetic reference'),
  (pg_temp.id(34),'compat-broken-series','series','Synthetic series without canonical ID');
insert into compatibility_relationships(id,external_key,subject_entity_id,target_entity_id,relationship_type,
  role,relationship_status,source_type,source_level,verification_status)
  values (pg_temp.id(40),'compat-original',pg_temp.id(20),pg_temp.id(30),'product_to_torch',
    'Tip holder','reference_only','company_catalog','A','NEEDS_FACTORY_CONFIRMATION');
create temporary table original_relationship as select to_jsonb(r) value from compatibility_relationships r;
create temporary table results(label text primary key,result jsonb);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.copy(level text default 'A', assertion text default 'supports', basis text default 'drawing')
returns jsonb language sql as $$
  select jsonb_build_object('source_level',level,'source_kind',case level when 'A' then 'company_record'
    when 'B' then 'official_manufacturer' when 'C' then 'technical_standard' else 'secondary_reference' end,
    'assertion',assertion,'evidence_basis',basis,'evidence_date','2026-01-01','owner_name','Synthetic custodian',
    'source_reference','Synthetic drawing TEST-COMPAT-001','source_location','Page 1, connection callout 2',
    'revision_label','TEST-rev-1','title','Synthetic compatibility source');
$$;
create function pg_temp.add_source(n integer, source_copy jsonb default pg_temp.copy(),
  subject_uuid uuid default pg_temp.id(20), target_uuid uuid default pg_temp.id(30),
  relation_type text default 'product_to_torch', scope_label text default 'Standard assembly',
  asserted_role text default 'Tip holder') returns jsonb language sql as $$
  select private.pi_add_compatibility_source(pg_temp.id(n),subject_uuid,target_uuid,relation_type,
    scope_label,asserted_role,source_copy);
$$;
create function pg_temp.matches(label text, subject_uuid uuid default pg_temp.id(20),
  target_uuid uuid default pg_temp.id(30), relation_type text default 'product_to_torch',
  scope_label text default 'Standard assembly', asserted_role text default 'Tip holder')
returns boolean language sql as $$
  select private.pi_compatibility_source_matches((result ->> 'source_id')::uuid,subject_uuid,target_uuid,
    relation_type,scope_label,asserted_role) from results where results.label=matches.label;
$$;
create function pg_temp.qualifies(label text) returns boolean language sql as $$
  select private.pi_compatibility_source_can_support_confirmation((result ->> 'source_id')::uuid,
    pg_temp.id(20),pg_temp.id(30),'product_to_torch','Standard assembly','Tip holder')
    from results where results.label=qualifies.label;
$$;

select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_source(100)$$,'42501',null,'unauthorized actor cannot learn adoption status');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.add_source(100)$$,'55000',null,'source intake requires working adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values (pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(16)],pg_temp.id(1),'Synthetic isolated fixture only');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='compatibility_source_bindings'::regclass),'source bindings force RLS');
select ok(not has_table_privilege('authenticated','compatibility_source_bindings','insert,update,delete'),'caller cannot mutate source bindings');
select ok(not has_table_privilege('service_role','compatibility_source_bindings','insert,update,delete'),'service role cannot mutate source bindings');
select ok(not has_table_privilege('anon','compatibility_source_bindings','select'),'anonymous cannot read source bindings');
select ok(not has_function_privilege('authenticated','private.pi_add_compatibility_source(uuid,uuid,uuid,text,text,text,jsonb)','execute'),'source command has no direct caller grant');
select ok(not has_function_privilege('service_role','private.pi_ensure_product_compatibility_entity(uuid,uuid)','execute'),'identity command has no service grant');

insert into results values ('source-a',pg_temp.add_source(100));
select is(pg_temp.add_source(100),(select result from results where label='source-a'),'source retry returns exact receipt');
select throws_ok($$select pg_temp.add_source(100,pg_temp.copy('B'))$$,'40001',null,'request identity cannot change payload');
select is((select count(*)::int from evidence_sources),1,'retry did not duplicate source');
select is((select created_by from compatibility_source_bindings),pg_temp.id(1),'binding actor is assigned from current session');
select ok(pg_temp.matches('source-a'),'exact directed scope matches');
select ok(pg_temp.qualifies('source-a'),'exact Level A drawing can support later human approval');
select ok(not pg_temp.matches('source-a',pg_temp.id(21)),'cannot borrow evidence from another SKU');
select ok(not pg_temp.matches('source-a',pg_temp.id(30),pg_temp.id(20)),'reverse direction is not equivalent');
select ok(not pg_temp.matches('source-a',target_uuid=>pg_temp.id(31)),'other torch target is not equivalent');
select ok(not pg_temp.matches('source-a',relation_type=>'product_to_series'),'other relationship type is not equivalent');
select ok(not pg_temp.matches('source-a',scope_label=>'Air-valve assembly'),'other assembly scope is not equivalent');
select ok(not pg_temp.matches('source-a',asserted_role=>'Gas nozzle'),'other component role is not equivalent');
select is(private.pi_check_compatibility_target(pg_temp.id(20),pg_temp.id(32),'product_to_machine',
  'Standard assembly','Tip holder'),pg_temp.id(12),'machine relationship retains exact SKU subject');
select is(private.pi_check_compatibility_target(pg_temp.id(20),pg_temp.id(33),'product_to_oem_reference',
  'Standard assembly','Tip holder'),pg_temp.id(12),'OEM-reference relationship retains exact SKU subject');
select set_config('timezone','Asia/Shanghai',true);
select ok(pg_temp.matches('source-a'),'source and endpoint hashes are timezone invariant');
select set_config('timezone','UTC',true);

insert into results values ('source-b',pg_temp.add_source(101,pg_temp.copy('B'))),
  ('source-c',pg_temp.add_source(102,pg_temp.copy('C','supports','standard'))),
  ('source-d',pg_temp.add_source(103,pg_temp.copy('D','supports','secondary_reference'))),
  ('source-catalog',pg_temp.add_source(104,pg_temp.copy('A','catalog_grouping','drawing'))),
  ('source-catalog-basis',pg_temp.add_source(105,pg_temp.copy('A','supports','company_catalog'))),
  ('source-conflict',pg_temp.add_source(106,pg_temp.copy('A','contradicts')));
select ok(not pg_temp.qualifies('source-b'),'Level B is not ArcFort confirmation');
select ok(not pg_temp.qualifies('source-c'),'Level C is not ArcFort confirmation');
select ok(not pg_temp.qualifies('source-d'),'secondary reference cannot confirm');
select ok(not pg_temp.qualifies('source-catalog'),'catalog grouping assertion cannot confirm even with a drawing');
select ok(not pg_temp.qualifies('source-catalog-basis'),'company catalog cannot confirm even if labelled supporting');
select ok(not pg_temp.qualifies('source-conflict'),'contradicting evidence cannot support confirmation');
select is((select assertion from compatibility_source_bindings where evidence_source_id=
  (select (result ->> 'source_id')::uuid from results where label='source-conflict')),'contradicts','conflicting evidence is retained explicitly');

select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"confirmed_by":"forged"}')$$,'22023',null,'forged attribution rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"source_kind":"secondary_reference"}')$$,'22023',null,'secondary source cannot claim Level A');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"evidence_basis":"appearance"}')$$,'22023',null,'appearance is not an accepted compatibility basis');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"evidence_date":"2026-02-30"}')$$,'22023',null,'invalid date rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"evidence_date":"2099-01-01"}')$$,'22023',null,'future date rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || jsonb_build_object('title',repeat('x',2001)))$$,'22023',null,'oversized source rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"assertion":null}')$$,'22023',null,'null assertion rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"revision_label":" "}')$$,'22023',null,'blank revision rejected');
select throws_ok($$select pg_temp.add_source(110,'[]')$$,'22023',null,'array is not a source record');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() - 'source_location')$$,'22023',null,'exact source location is required');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"assertion":"confirmed"}')$$,'22023',null,'intake cannot request confirmed assertion');
select throws_ok($$select pg_temp.add_source(110,scope_label=>'')$$,'22023',null,'unscoped evidence rejected');
select throws_ok($$select pg_temp.add_source(110,subject_uuid=>pg_temp.id(22))$$,'55000',null,'outside pilot subject rejected');
select throws_ok($$select pg_temp.add_source(110,target_uuid=>pg_temp.id(20))$$,'22023',null,'self relationship rejected');
select throws_ok($$select pg_temp.add_source(110,target_uuid=>pg_temp.id(999))$$,'22023',null,'missing target rejected');
select throws_ok($$select pg_temp.add_source(110,target_uuid=>pg_temp.id(32))$$,'22023',null,'machine cannot be passed as torch');
select throws_ok($$select pg_temp.add_source(110,target_uuid=>pg_temp.id(34),relation_type=>'product_to_series')$$,'22023',null,'series requires canonical series identity');
select throws_ok($$select pg_temp.add_source(110,relation_type=>'torch_to_machine')$$,'22023',null,'non-SKU relationship is outside this pilot command');
select is((select count(*)::int from evidence_sources),7,'invalid operations leave no partial source');
select is((select count(*)::int from private.pi_mutation_context),0,'commands clear transaction capability');

select pg_temp.actor(2);
select lives_ok($$select pg_temp.add_source(120)$$,'editor may record unapproved evidence');
insert into results values ('entity',private.pi_ensure_product_compatibility_entity(pg_temp.id(121),pg_temp.id(14)));
select is(private.pi_ensure_product_compatibility_entity(pg_temp.id(121),pg_temp.id(14)),
  (select result from results where label='entity'),'product identity retry is idempotent');
select is(private.pi_ensure_product_compatibility_entity(pg_temp.id(122),pg_temp.id(14)),
  (select result from results where label='entity'),'different request reuses existing product entity');
select is((select label from compatibility_entities where product_variant_id=pg_temp.id(14)),'AF-MIG-TEST-0014','new product entity uses canonical SKU, not inferred fit');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.add_source(120)$$,'reviewer may record evidence under separate actor receipt');
select throws_ok($$select private.pi_ensure_product_compatibility_entity(pg_temp.id(123),pg_temp.id(14))$$,'42501',null,'reviewer alone cannot create product identities');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_source(124)$$,'42501',null,'viewer cannot add evidence');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.add_source(124)$$,'42501',null,'publisher cannot add evidence');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.add_source(124)$$,'42501',null,'user without role cannot add evidence');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.add_source(124)$$,'42501',null,'service JWT with owner subject cannot impersonate human intake');
select set_config('request.jwt.claim.role','authenticated',true);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(2);
select pg_temp.actor(2);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'revoked editor cannot replay a previous receipt');
select pg_temp.actor(1);
select is((select count(*)::int from private.pi_command_receipts where command='add_compatibility_source'),9,'only successful intake commands create receipts');

-- Privileged corruption probes stay inside this rolled-back synthetic transaction.
insert into private.pi_mutation_context values (pg_backend_pid(),txid_current(),auth.uid(),
  array['evidence_sources','compatibility_entities','compatibility_source_bindings']);
select throws_ok($$update evidence_sources set title='Changed after binding' where id=
  (select (result ->> 'source_id')::uuid from results where label='source-a')$$,'55000',null,'bound source itself is immutable');
select throws_ok($$update compatibility_source_bindings set asserted_role='Other part'$$,'55000',null,'binding cannot be edited even with transaction capability');
select throws_ok($$delete from compatibility_source_bindings$$,'55000',null,'binding deletion rejected');
select throws_ok($$truncate compatibility_source_bindings$$,'55000',null,'binding truncation rejected');
insert into compatibility_entities(id,external_key,entity_type,label,product_variant_id)
  values (pg_temp.id(23),'compat-alias','product','Ambiguous SKU alias',pg_temp.id(12));
select throws_ok($$select pg_temp.add_source(125)$$,'55000',null,'ambiguous product aliases cannot accept evidence');
select throws_ok($$select private.pi_ensure_product_compatibility_entity(pg_temp.id(126),pg_temp.id(12))$$,'55000',null,'identity command does not silently choose an alias');
select ok(not pg_temp.qualifies('source-a'),'new ambiguous alias also invalidates confirmation eligibility');
update compatibility_entities set label='Changed target identity' where id=pg_temp.id(30);
select ok(not pg_temp.matches('source-a'),'changed endpoint invalidates old binding');
select ok(not pg_temp.qualifies('source-a'),'changed endpoint blocks confirmation eligibility');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();

set local role authenticated;
select pg_temp.actor(4);
select is((select count(*)::int from compatibility_source_bindings),9,'current viewer can read bindings through RLS');
select pg_temp.actor(6);
select is((select count(*)::int from compatibility_source_bindings),0,'unprivileged session sees no bindings');
select pg_temp.actor(2);
select is((select count(*)::int from compatibility_source_bindings),0,'revoked session sees no bindings');
reset role;
select pg_temp.actor(1);
select is((select to_jsonb(r) from compatibility_relationships r),(select value from original_relationship),'original relationship is byte-for-byte unchanged');
select is((select count(*)::int from verification_events),0,'intake is not a human approval');
select is((select count(*)::int from publish_records),0,'intake cannot publish');
select is((select count(*)::int from compatibility_relationships where verification_status='CONFIRMED'),0,'eligibility never confirms a relationship');
select is((select count(*)::int from private.pi_mutation_context),0,'no mutation capability survives intake checks');
select * from finish();
rollback;
