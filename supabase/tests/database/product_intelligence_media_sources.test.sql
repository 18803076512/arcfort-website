begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
set local timezone = 'UTC';
select plan(80);

create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('91000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'media-source-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values (pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'media-source-category','synthetic-media-source','Synthetic media category','synthetic-media-source');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'media-source-product',pg_temp.id(10),'Synthetic media product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),
    'synthetic-media-source-' || n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED'
    from generate_series(12,15) n;
insert into media_assets(id,external_key,storage_bucket,storage_path,file_hash,mime_type,width,height,
  source_kind,source_reference,source_file,source_owner,ownership_status,usage_rights_status,
  content_match_status,publication_status)
  select pg_temp.id(n),'synthetic-media-' || n,'pi-product-originals','synthetic/' || n || '.png',
    repeat('a',64),'image/png',100,100,'company_catalog','Synthetic recorded reference','original.png',
    'Synthetic custodian','unconfirmed','needs_confirmation','needs_review','blocked'
    from generate_series(20,22) n;
insert into product_media(id,product_variant_id,media_asset_id,role,alt_text)
  values(pg_temp.id(30),pg_temp.id(12),pg_temp.id(20),'main','Synthetic image reference');
insert into technical_field_definitions(id,field_key,label,is_critical)
  values(pg_temp.id(40),'synthetic_media_field','Synthetic field',true);
insert into technical_values(id,external_key,field_definition_id,product_variant_id,value_text,
  source_type,source_level,verification_status)
  values(pg_temp.id(41),'synthetic-media-cross-domain',pg_temp.id(40),pg_temp.id(12),'Synthetic value',
    'catalog','A','NEEDS_FACTORY_CONFIRMATION');
insert into compatibility_entities(id,external_key,entity_type,label,product_variant_id)
  values(pg_temp.id(42),'synthetic-media-subject','product','Synthetic subject',pg_temp.id(12)),
    (pg_temp.id(43),'synthetic-media-target','product','Synthetic target',pg_temp.id(13));
create temporary table originals as select
  (select jsonb_agg(to_jsonb(t) order by id) from media_assets t) assets,
  (select jsonb_agg(to_jsonb(t) order by id) from product_media t) mappings,
  (select jsonb_agg(to_jsonb(t) order by id) from product_variants t) variants;
create temporary table results(label text primary key,result jsonb);
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.copy(level text default 'A', assertion text default 'supports', basis text default 'supplier_authorization')
returns jsonb language sql as $$
  select jsonb_build_object('source_level',level,'source_kind',case level when 'A' then 'company_record'
    when 'B' then 'official_manufacturer' when 'C' then 'technical_standard' else 'secondary_reference' end,
    'assertion',assertion,'evidence_basis',basis,'evidence_date','2026-01-01','owner_name','Synthetic custodian',
    'source_reference','Synthetic media record TEST-MEDIA-001','source_location','Synthetic record page 1',
    'revision_label','TEST-1','title','Synthetic media source');
$$;
create function pg_temp.add_source(n integer, source_copy jsonb default pg_temp.copy(),
  variant_uuid uuid default pg_temp.id(12), asset_uuid uuid default pg_temp.id(20),
  requested_role text default 'main', dimension text default 'usage_rights')
returns jsonb language sql as $$
  select private.pi_add_media_source(pg_temp.id(n),variant_uuid,asset_uuid,requested_role,dimension,source_copy);
$$;
create function pg_temp.matches(label text, variant_uuid uuid default pg_temp.id(12),
  asset_uuid uuid default pg_temp.id(20), requested_role text default 'main', dimension text default 'usage_rights')
returns boolean language sql as $$
  select private.pi_media_source_matches((result ->> 'source_id')::uuid,variant_uuid,asset_uuid,requested_role,dimension)
    from results where results.label=matches.label;
$$;
create function pg_temp.qualifies(label text, dimension text default 'usage_rights')
returns boolean language sql as $$
  select private.pi_media_source_can_support_review((result ->> 'source_id')::uuid,pg_temp.id(12),pg_temp.id(20),'main',dimension)
    from results where results.label=qualifies.label;
$$;

select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_source(100)$$,'42501',null,'viewer cannot learn adoption status through intake');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.add_source(100)$$,'55000',null,'media intake requires adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,
  baseline_hash,pilot_variant_ids,actor_id,reason)
  values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(16)],pg_temp.id(1),'Synthetic isolated media fixture');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid='media_source_bindings'::regclass),'media source bindings force RLS');
select ok(not has_table_privilege('authenticated','media_source_bindings','insert,update,delete'),'authenticated callers cannot mutate bindings directly');
select ok(not has_table_privilege('service_role','media_source_bindings','insert,update,delete'),'service role has no binding write grant');
select ok(not has_table_privilege('anon','media_source_bindings','select'),'anonymous cannot read bindings');
select ok(not has_function_privilege('authenticated','private.pi_add_media_source(uuid,uuid,uuid,text,text,jsonb)','execute'),'intake is not publicly callable');
select ok(not has_function_privilege('service_role','private.pi_add_media_source(uuid,uuid,uuid,text,text,jsonb)','execute'),'service role has no private intake grant');

insert into results values('rights',pg_temp.add_source(100));
select is(pg_temp.add_source(100),(select result from results where label='rights'),'identical retry returns the same receipt');
select throws_ok($$select pg_temp.add_source(100,pg_temp.copy('B'))$$,'40001',null,'changed request payload cannot reuse receipt');
select throws_ok($$select pg_temp.add_source(100,requested_role=>'packaging')$$,'40001',null,'receipt cannot move an existing source to another role');
select is((select count(*)::int from evidence_sources),1,'retry creates no duplicate source');
select is((select created_by from media_source_bindings),pg_temp.id(1),'actor attribution comes from the current session');
select ok(pg_temp.matches('rights'),'exact asset/SKU/role/rights scope matches');
select ok(pg_temp.qualifies('rights'),'exact Level A authorization metadata can support later rights review');
select ok(not pg_temp.matches('rights',variant_uuid=>pg_temp.id(13)),'same photo cannot transfer evidence to another SKU');
select ok(not pg_temp.matches('rights',asset_uuid=>pg_temp.id(21)),'same recorded file hash does not merge asset identities');
select ok(not pg_temp.matches('rights',requested_role=>'packaging'),'main-view evidence is not packaging evidence');
select ok(not pg_temp.matches('rights',dimension=>'product_match'),'usage permission does not establish exact-product match');
select set_config('timezone','Asia/Shanghai',true);
select ok(pg_temp.matches('rights'),'metadata digests are timezone invariant');
select set_config('timezone','UTC',true);

insert into results values
  ('match',pg_temp.add_source(101,pg_temp.copy(basis=>'sku_label'),dimension=>'product_match')),
  ('b',pg_temp.add_source(102,pg_temp.copy('B'))),
  ('c',pg_temp.add_source(103,pg_temp.copy('C'))),
  ('d',pg_temp.add_source(104,pg_temp.copy('D'))),
  ('reference',pg_temp.add_source(105,pg_temp.copy(assertion=>'reference_only'))),
  ('catalog',pg_temp.add_source(106,pg_temp.copy(basis=>'catalog_reference'))),
  ('conflict',pg_temp.add_source(107,pg_temp.copy(assertion=>'contradicts')));
select ok(pg_temp.qualifies('match','product_match'),'exact Level A label metadata can support later match review');
select ok(not pg_temp.qualifies('match'),'product match does not establish website-use permission');
select ok(not pg_temp.qualifies('b'),'manufacturer source is not company confirmation');
select ok(not pg_temp.qualifies('c'),'standard is not permission to use this image');
select ok(not pg_temp.qualifies('d'),'secondary source cannot confirm rights');
select ok(not pg_temp.qualifies('reference'),'reference-only assertion cannot support approval');
select ok(not pg_temp.qualifies('catalog'),'catalog inclusion does not grant usage rights');
select ok(not pg_temp.qualifies('conflict'),'contradictory evidence cannot support approval');
select is((select assertion from media_source_bindings where evidence_source_id=(select (result->>'source_id')::uuid from results where label='conflict')),
  'contradicts','contradiction is retained explicitly');
select ok(not private.pi_technical_source_matches((select (result->>'source_id')::uuid from results where label='match'),pg_temp.id(41)),
  'media source cannot confirm an existing technical value of the same SKU');
select ok(not private.pi_compatibility_source_matches((select (result->>'source_id')::uuid from results where label='match'),
  pg_temp.id(42),pg_temp.id(43),'component_of','Synthetic fit scope','Synthetic part'),
  'media match is not compatibility evidence between existing product identities');

select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"approved_by":"forged"}')$$,'22023',null,'forged approval attribution rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"source_kind":"secondary_reference"}')$$,'22023',null,'source level cannot contradict source class');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy(basis=>'appearance'))$$,'22023',null,'appearance is not evidence');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy(basis=>'sku_label'))$$,'22023',null,'SKU label is not a rights basis');
select throws_ok($$select pg_temp.add_source(110,dimension=>'product_match')$$,'22023',null,'authorization is not an exact-product basis');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"evidence_date":"2026-02-30"}')$$,'22023',null,'invalid date rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"evidence_date":"2099-01-01"}')$$,'22023',null,'future evidence rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || jsonb_build_object('title',repeat('x',2001)))$$,'22023',null,'oversized source rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"assertion":null}')$$,'22023',null,'null assertion rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() || '{"owner_name":" "}')$$,'22023',null,'blank custodian rejected');
select throws_ok($$select pg_temp.add_source(110,'[]')$$,'22023',null,'source array rejected');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy() - 'source_location')$$,'22023',null,'source location is required');
select throws_ok($$select pg_temp.add_source(110,pg_temp.copy(assertion=>'confirmed'))$$,'22023',null,'intake cannot assert approval');
select throws_ok($$select pg_temp.add_source(110,requested_role=>'factory')$$,'22023',null,'company media role is not a SKU role');
select throws_ok($$select pg_temp.add_source(110,variant_uuid=>pg_temp.id(15))$$,'55000',null,'outside-pilot SKU rejected');
select throws_ok($$select pg_temp.add_source(110,variant_uuid=>pg_temp.id(16))$$,'55000',null,'missing SKU cannot inherit an adoption-list identifier');
select throws_ok($$select pg_temp.add_source(110,asset_uuid=>pg_temp.id(999))$$,'22023',null,'missing asset rejected');
select throws_ok($$select pg_temp.add_source(110,dimension=>'approval')$$,'22023',null,'invented evidence dimension rejected');
select throws_ok($$select pg_temp.add_source(110,dimension=>null)$$,'22023',null,'null dimension rejected');
select is((select count(*)::int from evidence_sources),8,'invalid operations leave no partial sources');
select is((select count(*)::int from private.pi_mutation_context),0,'no capability survives a successful intake');

select pg_temp.actor(2);
select lives_ok($$select pg_temp.add_source(120)$$,'editor may record unapproved evidence');
select pg_temp.actor(3);
select lives_ok($$select pg_temp.add_source(120)$$,'reviewer may record evidence under a separate actor receipt');
select pg_temp.actor(4);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'viewer cannot add sources');
select pg_temp.actor(5);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'publisher cannot add sources');
select pg_temp.actor(6);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'unassigned actor cannot add sources');
select pg_temp.actor(1);
select set_config('request.jwt.claim.role','service_role',true);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'service JWT cannot impersonate the owner');
select set_config('request.jwt.claim.role','authenticated',true);
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(2);
select pg_temp.actor(2);
select throws_ok($$select pg_temp.add_source(120)$$,'42501',null,'revoked editor cannot replay receipt');
select pg_temp.actor(1);

insert into results values
  ('provenance-drift',pg_temp.add_source(130,asset_uuid=>pg_temp.id(21))),
  ('identity-drift',pg_temp.add_source(131,variant_uuid=>pg_temp.id(13),asset_uuid=>pg_temp.id(22)));
select is((select jsonb_agg(to_jsonb(t) order by id) from media_assets t),(select assets from originals),'all original assets are unchanged by source intake');
select is((select jsonb_agg(to_jsonb(t) order by id) from product_media t),(select mappings from originals),'all original assignments are unchanged by source intake');
select is((select jsonb_agg(to_jsonb(t) order by id) from product_variants t),(select variants from originals),'source intake preserves product lifecycle and identity');

-- Independent privileged drift probes, confined to this rolled-back fixture transaction.
select throws_ok($$update media_assets set source_reference='Unauthorized' where id=pg_temp.id(20)$$,
  '55000',null,'direct asset edits remain frozen after adoption');
insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
  array['evidence_sources','media_source_bindings','media_assets','product_variants']);
select throws_ok($$update evidence_sources set title='Tampered' where id=(select (result->>'source_id')::uuid from results where label='rights')$$,
  '55000',null,'bound source cannot change even with transaction capability');
select throws_ok($$update media_source_bindings set media_role='gallery'$$,'55000',null,'binding cannot be edited');
select throws_ok($$delete from media_source_bindings$$,'55000',null,'binding cannot be deleted');
select throws_ok($$truncate media_source_bindings$$,'55000',null,'binding cannot be truncated');
select throws_ok($$delete from evidence_sources where id=(select (result->>'source_id')::uuid from results where label='rights')$$,
  '55000',null,'bound source cannot be deleted even with transaction capability');
select ok(pg_temp.matches('rights'),'hash drift probe begins with matching evidence');
update media_assets set file_hash=repeat('b',64) where id=pg_temp.id(20);
select ok(not pg_temp.matches('rights'),'changed recorded file hash invalidates old evidence');
select ok(pg_temp.matches('provenance-drift',asset_uuid=>pg_temp.id(21)),'provenance probe independently begins with matching evidence');
update media_assets set source_reference='Changed provenance' where id=pg_temp.id(21);
select ok(not pg_temp.matches('provenance-drift',asset_uuid=>pg_temp.id(21)),'changed provenance invalidates old evidence');
select ok(pg_temp.matches('identity-drift',variant_uuid=>pg_temp.id(13),asset_uuid=>pg_temp.id(22)),'identity probe independently begins with matching evidence');
update product_variants set model='Changed variant identity' where id=pg_temp.id(13);
select ok(not pg_temp.matches('identity-drift',variant_uuid=>pg_temp.id(13),asset_uuid=>pg_temp.id(22)),'changed SKU identity invalidates old evidence');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();

set local role authenticated;
select pg_temp.actor(4);
select is((select count(*)::int from media_source_bindings),12,'current viewer can read through RLS');
select pg_temp.actor(6);
select is((select count(*)::int from media_source_bindings),0,'unassigned session sees no bindings');
select pg_temp.actor(2);
select is((select count(*)::int from media_source_bindings),0,'revoked session sees no bindings');
reset role;
select pg_temp.actor(1);
select is((select count(*)::int from verification_events),0,'source intake produces no approval');
select is((select count(*)::int from publish_records),0,'source intake cannot publish');
select is((select count(*)::int from private.pi_mutation_context),0,'no transaction capability remains');
select * from finish();
rollback;
