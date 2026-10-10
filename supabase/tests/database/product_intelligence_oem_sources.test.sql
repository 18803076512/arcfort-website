begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
set local timezone = 'UTC';
select plan(80);

create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('97000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'oem-source-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values (pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'oem-source-category','synthetic-oem-source','Synthetic category','synthetic-oem-source');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'oem-source-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),
    'synthetic-oem-source-' || n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED'
    from generate_series(12,15) n;
insert into evidence_sources(id,external_key,source_type,source_level,title,source_reference)
  values(pg_temp.id(40),'oem-source-legacy','manufacturer','B','Synthetic legacy source','TEST-ONLY original');
insert into oem_references(id,external_key,product_variant_id,manufacturer_name,reference_number,
  source_level,verification_status,evidence_source_id)
  values(pg_temp.id(41),'oem-original-reference',pg_temp.id(12),'Synthetic original manufacturer',
    'TEST-ONLY-LEGACY','B','OEM_REFERENCE',pg_temp.id(40));
create temporary table originals as select
  (select jsonb_agg(to_jsonb(t) order by id) from oem_references t) refs,
  (select jsonb_agg(to_jsonb(t) order by id) from product_variants t) variants;
create temporary table results(label text primary key,result jsonb);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.copy(level text default 'A', assertion text default 'supports', basis text default 'factory_record')
returns jsonb language sql as $$
  select jsonb_build_object('source_level',level,'source_kind',case level when 'A' then 'company_record'
    when 'B' then 'official_manufacturer' when 'C' then 'technical_standard' else 'secondary_reference' end,
    'assertion',assertion,'evidence_basis',basis,'evidence_date','2026-01-01','owner_name','Synthetic custodian',
    'source_reference','TEST-ONLY source; no real OEM approval','source_location','Synthetic page 1',
    'revision_label','TEST-OEM-1','title','Synthetic OEM source');
$$;
create function pg_temp.add_source(n integer, source_copy jsonb default pg_temp.copy(),
  variant_uuid uuid default pg_temp.id(12), manufacturer text default 'Synthetic manufacturer',
  reference_number text default 'TEST-ONLY-001')
returns jsonb language sql as $$
  select private.pi_add_oem_source(pg_temp.id(n),variant_uuid,manufacturer,reference_number,source_copy);
$$;
create function pg_temp.matches(label text, variant_uuid uuid default pg_temp.id(12),
  manufacturer text default 'Synthetic manufacturer', reference_number text default 'TEST-ONLY-001')
returns boolean language sql as $$
  select private.pi_oem_source_matches((result->>'source_id')::uuid,variant_uuid,manufacturer,reference_number)
    from results where results.label=matches.label;
$$;
create function pg_temp.qualifies(label text) returns boolean language sql as $$
  select private.pi_oem_source_can_support_review((result->>'source_id')::uuid,pg_temp.id(12),
    'Synthetic manufacturer','TEST-ONLY-001') from results where results.label=qualifies.label;
$$;

select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_source(100)$$,'42501',null,'viewer cannot learn adoption state through intake');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.add_source(100)$$,'55000',null,'source intake requires adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(16)],pg_temp.id(1),'Synthetic isolated OEM fixture');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='oem_source_bindings'::regclass),'bindings force RLS');
select ok(not has_table_privilege('authenticated','oem_source_bindings','insert,update,delete'),'authenticated cannot directly mutate');
select ok(not has_table_privilege('service_role','oem_source_bindings','insert,update,delete,select'),'service role has no binding grant');
select ok(not has_table_privilege('anon','oem_source_bindings','select'),'anonymous cannot read');
select ok(not has_function_privilege('authenticated','private.pi_add_oem_source(uuid,uuid,text,text,jsonb)','execute'),'no authenticated private RPC grant');
select ok(not has_function_privilege('service_role','private.pi_add_oem_source(uuid,uuid,text,text,jsonb)','execute'),'no service private RPC grant');

insert into results values('factory',pg_temp.add_source(100));
select is(pg_temp.add_source(100),(select result from results where label='factory'),'exact retry returns one immutable receipt');
select throws_ok($$select pg_temp.add_source(100,reference_number=>'TEST-ONLY-002')$$,'40001',null,'receipt cannot transfer number');
select throws_ok($$select pg_temp.add_source(100,manufacturer=>'Another synthetic manufacturer')$$,'40001',null,'receipt cannot transfer manufacturer');
select throws_ok($$select pg_temp.add_source(100,variant_uuid=>pg_temp.id(13))$$,'40001',null,'receipt cannot transfer SKU');
select throws_ok($$select pg_temp.add_source(100,pg_temp.copy(basis=>'company_catalog'))$$,'40001',null,'receipt cannot replace source');
select is((select count(*)::int from oem_source_bindings),1,'retry creates one binding');
select is((select count(*)::int from evidence_sources),2,'retry creates one additional source');
select is((select created_by from oem_source_bindings),pg_temp.id(1),'source actor comes from session');
select ok(pg_temp.matches('factory'),'exact SKU/manufacturer/number/source matches');
select ok(pg_temp.qualifies('factory'),'declared exact Level A basis is eligible for later human review only');
select ok(not pg_temp.matches('factory',variant_uuid=>pg_temp.id(13)),'source cannot transfer across SKUs');
select ok(not pg_temp.matches('factory',manufacturer=>'SYNTHETIC manufacturer'),'manufacturer aliases are not inferred');
select ok(not pg_temp.matches('factory',reference_number=>'TEST-ONLY-01'),'number punctuation/digits are not inferred');
select ok(not private.pi_oem_source_matches(null,pg_temp.id(12),'Synthetic manufacturer','TEST-ONLY-001'),'missing source never matches');
select set_config('timezone','Asia/Shanghai',true);
select ok(pg_temp.matches('factory'),'full source digest is timezone invariant');
select set_config('timezone','UTC',true);

insert into results values
  ('drawing',pg_temp.add_source(101,pg_temp.copy(basis=>'controlled_drawing'))),
  ('sample',pg_temp.add_source(102,pg_temp.copy(basis=>'approved_sample'))),
  ('verified',pg_temp.add_source(103,pg_temp.copy(basis=>'verified_reference'))),
  ('catalog',pg_temp.add_source(104,pg_temp.copy(basis=>'company_catalog'))),
  ('official',pg_temp.add_source(105,pg_temp.copy('B',basis=>'manufacturer_catalog'))),
  ('standard',pg_temp.add_source(106,pg_temp.copy('C',basis=>'standard_reference'))),
  ('secondary',pg_temp.add_source(107,pg_temp.copy('D',basis=>'secondary_reference'))),
  ('reference',pg_temp.add_source(108,pg_temp.copy(assertion=>'reference_only'))),
  ('conflict',pg_temp.add_source(109,pg_temp.copy(assertion=>'contradicts')));
select ok(pg_temp.qualifies('drawing'),'declared controlled drawing can support review');
select ok(pg_temp.qualifies('sample'),'declared sample can support review');
select ok(pg_temp.qualifies('verified'),'declared verified reference can support review');
select ok(not pg_temp.qualifies('catalog'),'company catalog cannot confirm ArcFort reference');
select ok(not pg_temp.qualifies('official'),'official manufacturer remains reference, not ArcFort confirmation');
select ok(not pg_temp.qualifies('standard'),'standard reference cannot confirm SKU reference');
select ok(not pg_temp.qualifies('secondary'),'secondary source cannot confirm exact reference');
select ok(not pg_temp.qualifies('reference'),'reference-only assertion cannot confirm');
select ok(not pg_temp.qualifies('conflict'),'contradiction cannot be used as supporting confirmation');
select is((select count(*)::int from oem_source_bindings where assertion='contradicts'),1,'contradiction is retained');

select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"confirmed_by":"forged"}')$$,'22023',null,'forged confirmation attribution rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"source_kind":"secondary_reference"}')$$,'22023',null,'source class cannot contradict level');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy('D'))$$,'22023',null,'marketplace cannot declare factory basis');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy(basis=>'appearance'))$$,'22023',null,'appearance is not an OEM basis');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"evidence_date":"2026-02-30"}')$$,'22023',null,'invalid date rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"evidence_date":"2099-01-01"}')$$,'22023',null,'future date rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || jsonb_build_object('title',repeat('x',2001)))$$,'22023',null,'oversized source rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"assertion":null}')$$,'22023',null,'null assertion rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"owner_name":" "}')$$,'22023',null,'blank custodian rejected');
select throws_ok($$select pg_temp.add_source(110,'[]')$$,'22023',null,'array rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy()-'source_location')$$,'22023',null,'source location required');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy(assertion=>'confirmed'))$$,'22023',null,'intake cannot claim approved status');
select throws_ok($$select pg_temp.add_source(110,variant_uuid=>pg_temp.id(15))$$,'55000',null,'outside-pilot SKU rejected');
select throws_ok($$select pg_temp.add_source(110,variant_uuid=>pg_temp.id(16))$$,'55000',null,'missing adoption-list SKU rejected');
select throws_ok($$select pg_temp.add_source(110,manufacturer=>null)$$,'22023',null,'null manufacturer rejected');
select throws_ok($$select pg_temp.add_source(110,manufacturer=>' ')$$,'22023',null,'blank manufacturer rejected');
select throws_ok($$select pg_temp.add_source(110,manufacturer=>repeat('x',121))$$,'22023',null,'oversized manufacturer rejected');
select throws_ok($$select pg_temp.add_source(110,reference_number=>' TEST-ONLY-001')$$,'22023',null,'reference whitespace is not silently normalized');
select throws_ok($$select pg_temp.add_source(110,reference_number=>repeat('x',101))$$,'22023',null,'oversized number rejected');
select throws_ok($$select pg_temp.add_source(110,reference_number=>E'TEST\nONLY')$$,'22023',null,'control characters rejected');
select throws_ok($$select pg_temp.add_source(null)$$,'22023',null,'request ID is mandatory');
select is((select count(*)::int from evidence_sources),11,'invalid commands leave no partial source');
select is((select count(*)::int from private.pi_mutation_context),0,'success clears capability');

select pg_temp.actor(2);
select lives_ok($$select pg_temp.add_source(120)$$,'editor may record unapproved evidence');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.add_source(120)$$,'reviewer uses separate actor receipt');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'viewer cannot add');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'publisher cannot add');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'unassigned actor cannot add');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'service JWT cannot impersonate owner');
select set_config('request.jwt.claim.role','authenticated',true);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(2);
select pg_temp.actor(2);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'revoked editor cannot replay');
select pg_temp.actor(1);
select is((select jsonb_agg(to_jsonb(t) order by id) from oem_references t),(select refs from originals),'all original OEM references preserved');
select is((select jsonb_agg(to_jsonb(t) order by id) from product_variants t),(select variants from originals),'variant lifecycle/identity preserved');

select throws_ok($$update oem_references set reference_number='Changed'$$,'55000',null,'original OEM writes remain frozen');
insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
  array['evidence_sources','oem_source_bindings','product_variants']);
select throws_ok($$update evidence_sources set title='Tampered' where id=(select (result->>'source_id')::uuid from results where label='factory')$$,
  '55000',null,'bound source cannot mutate with transaction capability');
select throws_ok($$delete from evidence_sources where id=(select (result->>'source_id')::uuid from results where label='factory')$$,
  '55000',null,'bound source cannot be deleted');
select throws_ok($$update oem_source_bindings set reference_number='Other'$$,'55000',null,'binding cannot mutate with capability');
select throws_ok($$delete from oem_source_bindings$$,'55000',null,'binding cannot be deleted');
select throws_ok($$truncate oem_source_bindings cascade$$,'55000',null,'binding and dependent revisions cannot be truncated');
update product_variants set model='Changed identity' where id=pg_temp.id(12);
select ok(not pg_temp.matches('factory'),'changed SKU identity invalidates recorded evidence');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();

set local role authenticated;
select pg_temp.actor(4);
select is((select count(*)::int from oem_source_bindings),12,'current viewer reads bindings through RLS');
select pg_temp.actor(6);
select is((select count(*)::int from oem_source_bindings),0,'unassigned session reads no bindings');
select pg_temp.actor(2);
select is((select count(*)::int from oem_source_bindings),0,'revoked session reads no bindings');
reset role;
select pg_temp.actor(1);
select is((select count(*)::int from oem_references where verification_status='CONFIRMED'),0,'no confirmed OEM reference');
select is((select count(*)::int from compatibility_relationships),0,'reference evidence creates no compatibility');
select is((select count(*)::int from verification_events),0,'source intake creates no approval');
select is((select count(*)::int from publish_records),0,'source intake cannot publish');
select is((select count(*)::int from private.pi_mutation_context),0,'no capability survives');
select * from finish();
rollback;
