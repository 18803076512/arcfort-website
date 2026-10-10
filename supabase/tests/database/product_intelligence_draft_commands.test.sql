begin;

create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;

select plan(32);

insert into auth.users(id,email,email_confirmed_at) values
  ('84000000-0000-4000-8000-000000000001','draft-owner@example.invalid',now()),
  ('84000000-0000-4000-8000-000000000002','draft-editor@example.invalid',now()),
  ('84000000-0000-4000-8000-000000000003','draft-reviewer@example.invalid',now());
insert into console_user_roles(user_id,role) values
  ('84000000-0000-4000-8000-000000000001','owner'),
  ('84000000-0000-4000-8000-000000000002','editor'),
  ('84000000-0000-4000-8000-000000000003','reviewer');
insert into product_categories(id,external_key,slug,name_en,route_slug) values
  ('84000000-0000-4000-8000-000000000010','draft-test-category','mig-mag-torch-parts','Draft test','mig-mag-torch-parts');
insert into products(id,external_key,category_id,name_en,product_type,source_type) values
  ('84000000-0000-4000-8000-000000000011','draft-original','84000000-0000-4000-8000-000000000010','Original test name','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state) values
  ('84000000-0000-4000-8000-000000000012','84000000-0000-4000-8000-000000000011','84000000-0000-4000-8000-000000000010',
   'AF-MIG-CT-0004','mig-contact-tip-m6-0-8mm','active','needs_review','needs_photo','unverified','unknown','INGESTED');

create function pg_temp.copy() returns jsonb language sql as $$
  select '{"name_en":"Updated test draft","name_zh":"","model":"Unconfirmed model wording","summary":"Draft summary","description":"Draft description","applications":"Draft application"}'::jsonb;
$$;
create function pg_temp.save(request_number integer, expected bigint) returns jsonb language sql as $$
  select private.pi_save_product_draft(
    ('85000000-0000-4000-8000-' || lpad(request_number::text,12,'0'))::uuid,
    '84000000-0000-4000-8000-000000000012',expected,pg_temp.copy());
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000001',true);
select throws_ok($$select pg_temp.save(1,0)$$,'55000',null,'editing requires working adoption');

-- Internal fixture only; real adoption parity is covered separately.
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,pilot_variant_ids,actor_id,reason)
values ('84000000-0000-4000-8000-000000000020','15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
  array['84000000-0000-4000-8000-000000000012','84000000-0000-4000-8000-000000000013','84000000-0000-4000-8000-000000000014','84000000-0000-4000-8000-000000000015']::uuid[],
  '84000000-0000-4000-8000-000000000001','Synthetic draft SQL test only');
update private.pi_working_authority_control set adoption_id='84000000-0000-4000-8000-000000000020';

select lives_ok($$select pg_temp.save(1,0)$$,'owner saves an adopted pilot');
select is((select revision::int from private.pi_product_draft_heads),1,'first save increments revision');
select is((select name_en from products),'Updated test draft','working name updated');
select is((select name_en from private.pi_product_draft_revisions where revision=0),'Original test name','original name retained');
select is((select lifecycle_state::text from product_variants),'INGESTED','adoption does not reset lifecycle');
select lives_ok($$select pg_temp.save(1,0)$$,'same request returns existing receipt');
select is((select count(*)::int from private.pi_product_draft_revisions),2,'duplicate request creates no revision');
select throws_ok($$select pg_temp.save(1,1)$$,'40001',null,'same request ID rejects changed expected revision');
select throws_ok($$select pg_temp.save(2,0)$$,'40001',null,'stale two-tab save rejected');
select throws_ok($$select private.pi_save_product_draft('85000000-0000-4000-8000-000000000003','84000000-0000-4000-8000-000000000012',1,
  pg_temp.copy() || '{"confirmed_by":"forged"}')$$,'22023',null,'confirmation attribution cannot enter copy');
select throws_ok($$select private.pi_validate_draft_copy(pg_temp.copy() || jsonb_build_object('name_en',E'\n\t'))$$,'22023',null,'whitespace name rejected');
select is((select count(*)::int from private.pi_mutation_context),0,'command capability cleared');
select throws_ok($$update products set name_en='bypass'$$,'55000',null,'no post-command direct write capability');
select throws_ok($$update private.pi_product_draft_revisions set summary='rewrite'$$,'55000',null,'old draft revisions are immutable');
select throws_ok($$delete from private.pi_command_receipts$$,'55000',null,'receipts are immutable');

select set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000003',true);
select throws_ok($$select pg_temp.save(4,1)$$,'42501',null,'reviewer cannot edit ordinary product drafts');
select set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000002',true);
select lives_ok($$select pg_temp.save(5,1)$$,'editor may save product drafts');
update console_user_roles set revoked_at=now() where role='editor';
select throws_ok($$select pg_temp.save(5,1)$$,'42501',null,'revocation also denies a previously successful receipt');
select set_config('request.jwt.claim.sub','84000000-0000-4000-8000-000000000001',true);

create function pg_temp.create_draft(request_number integer, slug text default 'synthetic-new-draft')
returns jsonb language sql as $$
  select private.pi_create_product_draft(
    ('86000000-0000-4000-8000-' || lpad(request_number::text,12,'0'))::uuid,
    jsonb_build_object('sku','AF-MIG-TS-9998','slug',slug,'source_reference','Synthetic identity source'),pg_temp.copy());
$$;
select lives_ok($$select pg_temp.create_draft(1)$$,'create atomically adds one product and variant');
select lives_ok($$select pg_temp.create_draft(1)$$,'duplicate create returns original identity');
select is((select count(*)::int from products),2,'duplicate create creates only one new product');
select is((select lifecycle_state::text from product_variants where sku='AF-MIG-TS-9998'),'DRAFT','new product starts in DRAFT');
select ok((select not is_shadow and legacy_data_status='needs_review' from product_variants where sku='AF-MIG-TS-9998'),'new product is unverified working data');
select throws_ok($$select pg_temp.create_draft(2,'different-slug')$$,'23505',null,'duplicate SKU across commands rejected');
select is((select count(*)::int from products),2,'failed create leaves no orphan product');
select throws_ok($$select private.pi_create_product_draft('86000000-0000-4000-8000-000000000003',
  '{"sku":"AF-MIG-TS-9997","slug":"mig-contact-tip-m6-0-8mm","source_reference":"Synthetic source"}',pg_temp.copy())$$,
  '23505',null,'duplicate slug rolls back after product insert');
select is((select count(*)::int from products),2,'failed variant insert rolls back its product');
select is((select count(*)::int from private.pi_mutation_context),0,'failed create leaves no write capability');
select is((select count(*)::int from private.pi_command_receipts),3,'only successful unique commands have receipts');
select ok(not has_function_privilege('service_role','private.pi_save_product_draft(uuid,uuid,bigint,jsonb)','execute'),'service job cannot invoke draft commands');
select is((select count(*)::int from publish_records),0,'draft commands never publish');

select * from finish();
rollback;
