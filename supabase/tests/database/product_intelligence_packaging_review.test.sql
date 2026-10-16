begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions,public;
set local timezone = 'UTC';
select plan(94);
create function pg_temp.id(n integer) returns uuid language sql immutable as $$
  select ('99000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
$$;
insert into auth.users(id,email,email_confirmed_at)
  select pg_temp.id(n),'packaging-review-' || n || '@example.invalid',now() from generate_series(1,6) n;
insert into console_user_roles(user_id,role) values(pg_temp.id(1),'owner'),(pg_temp.id(2),'editor'),
  (pg_temp.id(3),'reviewer'),(pg_temp.id(4),'viewer'),(pg_temp.id(5),'publisher');
insert into product_categories(id,external_key,slug,name_en,route_slug)
  values(pg_temp.id(10),'packaging-review-category','synthetic-packaging-review','Synthetic category','synthetic-packaging-review');
insert into products(id,external_key,category_id,name_en,product_type,source_type)
  values(pg_temp.id(11),'packaging-review-product',pg_temp.id(10),'Synthetic product','welding-consumable','test');
insert into product_variants(id,product_id,category_id,sku,public_slug,legacy_status,legacy_data_status,
  legacy_image_status,legacy_compatibility_status,legacy_oem_status,lifecycle_state)
  select pg_temp.id(n),pg_temp.id(11),pg_temp.id(10),'AF-MIG-TEST-' || lpad(n::text,4,'0'),
    'synthetic-packaging-review-' || n,'draft','needs_review','needs_photo','unverified','unknown','INGESTED'
    from generate_series(12,15) n;
insert into packaging_records(id,external_key,product_variant_id,package_description,moq_note,lead_time_note,verification_status)
  values(pg_temp.id(41),'packaging-review-original',pg_temp.id(12),'TEST-ONLY original bag','Preserved MOQ','Preserved lead time','NEEDS_FACTORY_CONFIRMATION'),
    (pg_temp.id(42),'packaging-review-conflict',pg_temp.id(13),'TEST-ONLY original carton','Other MOQ','Other lead time','DATA_CONFLICT');
create temporary table original_rows as select
  (select jsonb_agg(to_jsonb(t) order by id) from packaging_records t) packaging,
  (select jsonb_agg(to_jsonb(t) order by id) from product_variants t) variants,
  (select blocker_count from pi_variant_readiness where id=pg_temp.id(12)) blockers;
create temporary table sources(label text primary key,id uuid);
create temporary table results(label text primary key,result jsonb);
grant select on results to authenticated;
create function pg_temp.actor(n integer) returns void language sql as $$
  select set_config('request.jwt.claim.sub',pg_temp.id(n)::text,true);
$$;
create function pg_temp.copy(qty integer default 10,description text default 'TEST-ONLY sealed inner bag')
returns jsonb language sql as $$ select jsonb_build_object('package_description',description,'quantity',qty,
  'quantity_unit',case when qty is null then null else 'pieces' end); $$;
create function pg_temp.source(n integer,qty integer default 10,level text default 'A',assertion text default 'supports',
  basis text default 'packaging_record',variant uuid default pg_temp.id(12),original uuid default pg_temp.id(41))
returns uuid language sql as $$
  select (private.pi_add_packaging_source(pg_temp.id(n),variant,pg_temp.copy(qty),jsonb_build_object(
    'source_level',level,'source_kind',case level when 'A' then 'company_record' when 'B' then 'official_manufacturer'
      when 'C' then 'technical_standard' else 'secondary_reference' end,'assertion',assertion,'evidence_basis',basis,
    'evidence_date','2026-01-01','owner_name','Synthetic custodian','source_reference','TEST-ONLY packaging record',
    'source_location','Synthetic page 1','revision_label','TEST-REVIEW-1','title','Synthetic packaging source'),original)->>'source_id')::uuid;
$$;
create function pg_temp.sid(label text) returns uuid language sql as $$ select id from sources where sources.label=sid.label; $$;
create function pg_temp.r(label text) returns jsonb language sql as $$ select result from results where results.label=r.label; $$;
create function pg_temp.propose(n integer,copy jsonb default pg_temp.copy(),evidence uuid[] default array[pg_temp.sid('record')],
  head uuid default null,revision bigint default 0,slot integer default 0,original uuid default pg_temp.id(41),variant uuid default pg_temp.id(12))
returns jsonb language sql as $$
  select private.pi_propose_packaging_revision(pg_temp.id(n),variant,slot,revision,copy,evidence,
    'Synthetic packaging proposal; no real evidence',head,original);
$$;
create function pg_temp.submit(n integer,label text) returns jsonb language sql as $$
  select private.pi_submit_packaging_revision(pg_temp.id(n),(pg_temp.r(label)->>'revision_id')::uuid,
    (pg_temp.r(label)->>'revision')::bigint,pg_temp.r(label)->>'digest');
$$;
create function pg_temp.confirm(status public.pi_verification_status default 'CONFIRMED') returns jsonb language sql as $$
  select jsonb_build_object('source_checked',true,'packaging_checked',true,'commercial_terms_unchanged',true,
    'arcfort_packaging_confirmed',status='CONFIRMED');
$$;
create function pg_temp.review(n integer,label text,decision text default 'APPROVE',status public.pi_verification_status default 'CONFIRMED',
  source uuid default pg_temp.sid('record'),confirmation jsonb default pg_temp.confirm(),resolution text default '',replacement jsonb default null)
returns jsonb language sql as $$
  select private.pi_review_packaging_revision(pg_temp.id(n),(pg_temp.r(label)->>'revision_id')::uuid,
    (pg_temp.r(label)->>'revision')::bigint,pg_temp.r(label)->>'digest',decision,'Synthetic human QA decision; no real confirmation',
    status,confirmation,source,resolution,replacement);
$$;
create function pg_temp.valid(label text) returns boolean language sql as $$
  select private.pi_packaging_approval_valid((pg_temp.r(label)->>'revision_id')::uuid);
$$;
create function pg_temp.forge(label text) returns void language sql as $$
  insert into verification_events(id,entity_type,entity_id,field_key,decision,reason,before_value,after_value,actor_id)
  values(pg_temp.id(800),'packaging_revision',(pg_temp.r(label)->>'revision_id')::uuid,'packaging','APPROVE',
    'Synthetic forged snapshot','{}','{}',auth.uid());
  insert into packaging_revision_decisions select candidate.id,pg_temp.id(800),'APPROVE',candidate.submitted_digest,
    private.pi_packaging_revision_digest(candidate.id),'CONFIRMED',pg_temp.confirm(),pg_temp.sid('record'),'',auth.uid(),now()
    from packaging_revisions candidate where candidate.id=(pg_temp.r(label)->>'revision_id')::uuid;
$$;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.actor(4);
select throws_ok($$select pg_temp.propose(100)$$,'42501',null,'viewer cannot discover adoption through proposal');
select pg_temp.actor(1);
select throws_ok($$select pg_temp.propose(100)$$,'55000',null,'proposal requires adoption');
insert into private.pi_working_adoptions(id,scope,source_revision,repository_commit,source_files,baseline,baseline_hash,
  pilot_variant_ids,actor_id,reason) values(pg_temp.id(50),'15ak-v1',repeat('a',64),repeat('b',40),'[]','{}',repeat('c',64),
    array[pg_temp.id(12),pg_temp.id(13),pg_temp.id(14),pg_temp.id(17)],pg_temp.id(1),'Synthetic isolated packaging review');
update private.pi_working_authority_control set adoption_id=pg_temp.id(50);
create temporary table lifecycle_probe (like public.product_variants including defaults);
create trigger packaging_guard before insert or update on lifecycle_probe
for each row execute function private.pi_guard_current_packaging();
insert into lifecycle_probe select * from product_variants where id=pg_temp.id(12);
select throws_ok($$update lifecycle_probe set lifecycle_state='VERIFIED'$$,'23514',null,'actual packaging trigger blocks unresolved original');
insert into lifecycle_probe select * from product_variants where id=pg_temp.id(14);
select is((select packaging_count from pi_packaging_readiness where product_variant_id=pg_temp.id(14)),0,'SKU without packaging remains visible with zero records');
select is((select missing_packaging_quantity_count from pi_packaging_readiness where product_variant_id=pg_temp.id(14)),0,'absent record does not fabricate an unknown-quantity row');
select is((select unresolved_packaging_count from pi_packaging_readiness where product_variant_id=pg_temp.id(14)),1,'absent packaging contributes one missing-record blocker');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(14)),(select blockers from original_rows),'missing packaging blocks shared readiness like an unresolved original');
select throws_ok($$update lifecycle_probe set lifecycle_state='VERIFIED' where id=pg_temp.id(14)$$,'23514',null,'missing packaging blocks VERIFIED');
select throws_ok($$update lifecycle_probe set lifecycle_state='READY_FOR_PUBLISH' where id=pg_temp.id(14)$$,'23514',null,'missing packaging blocks READY_FOR_PUBLISH');
select throws_ok($$update lifecycle_probe set lifecycle_state='QA_PASSED' where id=pg_temp.id(14)$$,'23514',null,'missing packaging blocks QA_PASSED');
select throws_ok($$update lifecycle_probe set lifecycle_state='PUBLISHED' where id=pg_temp.id(14)$$,'23514',null,'missing packaging blocks PUBLISHED');
delete from lifecycle_probe where id=pg_temp.id(14);
select ok((select bool_and(relrowsecurity and relforcerowsecurity) from pg_class where relname in
  ('packaging_revision_heads','packaging_revisions','packaging_revision_evidence','packaging_revision_decisions','packaging_revision_currents')),'all review tables force RLS');
select ok(not has_table_privilege('authenticated','packaging_revisions','insert,update,delete'),'no direct authenticated writes');
select ok(not has_table_privilege('anon','packaging_revisions','select'),'no anonymous read');
select ok(not has_table_privilege('service_role','packaging_revision_currents','select,insert,update,delete'),'no service grant');
select ok(not has_function_privilege('authenticated','private.pi_propose_packaging_revision(uuid,uuid,integer,bigint,jsonb,uuid[],text,uuid,uuid)','execute'),'no application mutation grant');
select is((select count(*)::int from information_schema.columns where table_name='pi_variant_readiness'),20,'shared readiness columns preserved');
select is((select count(*)::int from pi_dashboard_metrics),9,'dashboard metric contract preserved');
insert into sources values('record',pg_temp.source(60)),('official',pg_temp.source(61,level=>'B',assertion=>'reference_only',basis=>'manufacturer_catalog')),
  ('catalog',pg_temp.source(62,basis=>'company_catalog')),('next',pg_temp.source(63,qty=>12)),
  ('other',pg_temp.source(64,variant=>pg_temp.id(13),original=>pg_temp.id(42))),('unknown',pg_temp.source(65,qty=>null));
select throws_ok($$select pg_temp.propose(100,copy=>pg_temp.copy() || '{"moq_note":"Changed"}')$$,'22023',null,'proposal cannot change commercial MOQ');
select throws_ok($$select pg_temp.propose(100,copy=>pg_temp.copy() || '{"lead_time_note":"Changed"}')$$,'22023',null,'proposal cannot change commercial lead time');
select throws_ok($$select pg_temp.propose(100,copy=>pg_temp.copy(11))$$,'22023',null,'source cannot transfer quantity');
select throws_ok($$select pg_temp.propose(100,evidence=>array[pg_temp.sid('other')])$$,'22023',null,'source cannot cross SKU');
select throws_ok($$select pg_temp.propose(100,evidence=>array[pg_temp.sid('record'),pg_temp.sid('record')])$$,'22023',null,'duplicate evidence rejected');
select throws_ok($$select pg_temp.propose(100,original=>null)$$,'22023',null,'source cannot detach original lineage');
select throws_ok($$select pg_temp.propose(100,variant=>pg_temp.id(15))$$,'55000',null,'outside-pilot proposal rejected');
select pg_temp.actor(2);
insert into results values('first',pg_temp.propose(100,evidence=>array[pg_temp.sid('record'),pg_temp.sid('official'),pg_temp.sid('catalog')]));
select is(pg_temp.propose(100,evidence=>array[pg_temp.sid('record'),pg_temp.sid('official'),pg_temp.sid('catalog')]),pg_temp.r('first'),'exact proposal receipt replays');
select throws_ok($$select pg_temp.propose(100)$$,'40001',null,'changed receipt rejected');
select is((select verification_status::text from packaging_revisions),'NEEDS_FACTORY_CONFIRMATION','proposal remains unconfirmed');
select is((select created_by from packaging_revisions),pg_temp.id(2),'proposal actor comes from current session');
select is((select unresolved_packaging_count from pi_packaging_readiness where product_variant_id=pg_temp.id(12)),2,'original and open copy both visible before approval');
select throws_ok($$select pg_temp.propose(101,slot=>1)$$,'22023',null,'same physical package cannot duplicate a current or open slot');
select throws_ok($$select private.pi_submit_packaging_revision(pg_temp.id(101),(pg_temp.r('first')->>'revision_id')::uuid,2,pg_temp.r('first')->>'digest')$$,'40001',null,'stale revision refused');
select lives_ok($$select pg_temp.submit(101,'first')$$,'editor freezes proposal');
select throws_ok($$select pg_temp.propose(102,head=>(pg_temp.r('first')->>'head_id')::uuid,revision=>1)$$,'55000',null,'pending snapshot cannot be overwritten');
select throws_ok($$select pg_temp.review(102,'first')$$,'42501',null,'editor cannot approve');
select pg_temp.actor(3);
select throws_ok($$select pg_temp.review(102,'first',source=>pg_temp.sid('official'))$$,'23514',null,'manufacturer packaging cannot confirm supplied packaging');
select throws_ok($$select pg_temp.review(102,'first',source=>pg_temp.sid('catalog'))$$,'23514',null,'company catalog cannot confirm supplied packaging');
select throws_ok($$select pg_temp.review(102,'first',source=>pg_temp.sid('next'))$$,'23514',null,'unselected source cannot approve');
select throws_ok($$select pg_temp.review(102,'first',confirmation=>'{}')$$,'23514',null,'explicit human declaration required');
select throws_ok($$select pg_temp.review(102,'first',confirmation=>pg_temp.confirm() || '{"commercial_terms_unchanged":false}')$$,'23514',null,'physical review cannot approve commercial changes');
select lives_ok($$select pg_temp.review(102,'first')$$,'reviewer approves exact synthetic A source');
select ok(pg_temp.valid('first'),'exact stored approval is valid');
select lives_ok($$select pg_temp.review(102,'first')$$,'approval receipt is idempotent');
select is((select count(*)::int from verification_events),1,'receipt replay creates no duplicate event');
select is((select verification_status::text from pi_effective_packaging_records where packaging_origin='current'),'CONFIRMED','current reflects human status');
select is((select count(*)::int from pi_effective_packaging_records where original_packaging_id=pg_temp.id(41)),1,'approved original overlay does not duplicate legacy row');
select is((select unresolved_packaging_count from pi_packaging_readiness where product_variant_id=pg_temp.id(12)),0,'valid known quantity resolves packaging blocker');
select is((select blocker_count from pi_variant_readiness where id=pg_temp.id(12)),(select blockers-1 from original_rows),'packaging blocker clears without clearing other gates');
select lives_ok($$update lifecycle_probe set lifecycle_state='VERIFIED'$$,'packaging trigger accepts resolved known quantity independently of other product gates');
select ok(not exists(select 1 from pi_effective_packaging_records where publication_ready),'no packaging review grants publication');
update console_user_roles set revoked_at=now() where user_id=pg_temp.id(3);
select ok(pg_temp.valid('first'),'historical validity survives later reviewer revocation');
select throws_ok($$select pg_temp.review(102,'first')$$,'42501',null,'revoked reviewer cannot replay');
update console_user_roles set revoked_at=null where user_id=pg_temp.id(3);
select set_config('timezone','Asia/Shanghai',true);
select ok(pg_temp.valid('first'),'approval digest is timezone invariant');
select set_config('timezone','UTC',true);

select pg_temp.actor(1);
insert into results values('second',pg_temp.propose(110,head=>(pg_temp.r('first')->>'head_id')::uuid,revision=>1));
select pg_temp.submit(111,'second');
insert into sources values('conflict',pg_temp.source(66,qty=>15,assertion=>'contradicts'));
select ok(not pg_temp.valid('first'),'new omitted contradiction within original lineage invalidates current');
select is((select verification_status::text from pi_effective_packaging_records where packaging_origin='current'),'DATA_CONFLICT','invalid current remains visible without original fallback');
select throws_ok($$select pg_temp.review(112,'second')$$,'23514',null,'late conflicting source blocks stale approval');
insert into results values('edit',pg_temp.review(112,'second','EDIT',null,null,'{}','',jsonb_build_object('copy',pg_temp.copy(12),'sources',jsonb_build_array(pg_temp.sid('next')))));
select is((select verification_status::text from packaging_revisions where id=(pg_temp.r('edit')->>'revision_id')::uuid),'DATA_CONFLICT','EDIT inherits conflict despite changed count and omitted contradiction');
select is((select review_state from packaging_revisions where id=(pg_temp.r('edit')->>'revision_id')::uuid),'proposed','EDIT creates an unapproved correction');
select pg_temp.submit(113,'edit');
select throws_ok($$select pg_temp.review(114,'edit',source=>pg_temp.sid('next'))$$,'23514',null,'conflict requires explicit resolution');
select lives_ok($$select pg_temp.review(114,'edit','REJECT',null,null,'{}')$$,'REJECT closes correction');
select is((select revision_id from packaging_revision_currents),(pg_temp.r('first')->>'revision_id')::uuid,'REJECT preserves prior current');
insert into results values('resolved',pg_temp.propose(115,pg_temp.copy(12),array[pg_temp.sid('next')],(pg_temp.r('first')->>'head_id')::uuid,3));
select pg_temp.submit(116,'resolved');
select lives_ok($$select pg_temp.review(117,'resolved',source=>pg_temp.sid('next'),resolution=>'TEST-ONLY reconciliation of preserved original-count conflict')$$,'explicit qualified correction can resolve conflict');
select ok(pg_temp.valid('resolved'),'resolved correction is valid');
select is((select quantity from pi_effective_packaging_records where packaging_origin='current'),12,'current physical count changes through reviewed revision only');

insert into results values('unknown',pg_temp.propose(120,pg_temp.copy(null),array[pg_temp.sid('unknown')],(pg_temp.r('first')->>'head_id')::uuid,4));
select pg_temp.submit(121,'unknown');
select throws_ok($$select pg_temp.review(122,'unknown',source=>pg_temp.sid('unknown'),resolution=>'TEST-ONLY source inspection')$$,'23514',null,'unknown count cannot become confirmed packaging');
select lives_ok($$select pg_temp.review(122,'unknown','REJECT',null,null,'{}')$$,'unknown correction can be rejected');
insert into results values('reference',pg_temp.propose(123,evidence=>array[pg_temp.sid('official')],head=>(pg_temp.r('first')->>'head_id')::uuid,revision=>5));
select pg_temp.submit(124,'reference');
select lives_ok($$select pg_temp.review(125,'reference',status=>'OEM_REFERENCE',source=>pg_temp.sid('official'),confirmation=>pg_temp.confirm('OEM_REFERENCE'),resolution=>'TEST-ONLY manufacturer reference retained separately from actual packaging')$$,'explicit official reference review is distinct');
select is((select verification_status::text from pi_effective_packaging_records where packaging_origin='current'),'OEM_REFERENCE','official reference remains reference');
select is((select unresolved_packaging_count from pi_packaging_readiness where product_variant_id=pg_temp.id(12)),1,'reference review does not resolve supplied-packaging gate');
select throws_ok($$update lifecycle_probe set legacy_data_status='confirmed'$$,'23514',null,'reference-only current cannot pass packaging lifecycle guard');
select is((select missing_packaging_quantity_count from pi_packaging_readiness where product_variant_id=pg_temp.id(13)),1,'unknown original quantity remains a visible metric');

insert into sources values('new',pg_temp.source(70,variant=>pg_temp.id(14),original=>null)),
  ('new-next',pg_temp.source(71,qty=>12,variant=>pg_temp.id(14),original=>null));
insert into results values('new',pg_temp.propose(130,evidence=>array[pg_temp.sid('new')],original=>null,variant=>pg_temp.id(14)));
select pg_temp.submit(131,'new');
insert into sources values('new-conflict',pg_temp.source(72,assertion=>'contradicts',variant=>pg_temp.id(14),original=>null));
insert into results values('new-edit',pg_temp.review(132,'new','EDIT',null,null,'{}','',jsonb_build_object('copy',pg_temp.copy(12),'sources',jsonb_build_array(pg_temp.sid('new-next')))));
select is((select verification_status::text from packaging_revisions where id=(pg_temp.r('new-edit')->>'revision_id')::uuid),'DATA_CONFLICT','late omitted conflict survives changed count even without original lineage');
select pg_temp.submit(133,'new-edit');
select private.pi_packaging_revision_capability();
select throws_ok($$select pg_temp.forge('new-edit')$$,'23514',null,'forged event/decision fails independent trigger with capability');
select throws_ok($$update packaging_revision_currents set revision_id=(pg_temp.r('new-edit')->>'revision_id')::uuid$$,'23514',null,'current cannot point to unapproved revision');
select throws_ok($$update packaging_revisions set quantity=99$$,'55000',null,'frozen physical copy cannot mutate');
select throws_ok($$delete from packaging_revision_decisions$$,'55000',null,'human decisions are append-only');
select throws_ok($$truncate packaging_revisions cascade$$,'55000',null,'revision history cannot be truncated');
delete from private.pi_mutation_context where backend_pid=pg_backend_pid() and transaction_id=txid_current();
select lives_ok($$select pg_temp.review(134,'new-edit','REJECT',null,null,'{}')$$,'new packaging correction can be rejected without creating a current record');
select is((select unresolved_packaging_count from pi_packaging_readiness where product_variant_id=pg_temp.id(14)),1,'rejected-only history still has a missing-packaging blocker');
insert into results values('after-reject',pg_temp.propose(135,pg_temp.copy(12),array[pg_temp.sid('new-next')],
  (pg_temp.r('new')->>'head_id')::uuid,2,0,null,pg_temp.id(14)));
select is((select verification_status::text from packaging_revisions where id=(pg_temp.r('after-reject')->>'revision_id')::uuid),'DATA_CONFLICT','reject then ordinary save cannot wash an unresolved predecessor conflict');
select pg_temp.submit(136,'after-reject');
insert into sources values('historical-conflict',pg_temp.source(73,assertion=>'contradicts',variant=>pg_temp.id(14),original=>null));
select throws_ok($$select pg_temp.review(137,'after-reject',source=>pg_temp.sid('new-next'),resolution=>'TEST-ONLY conflict resolution')$$,'23514',null,'late evidence against a prior count invalidates the current frozen proposal');
insert into results values('after-late-edit',pg_temp.review(137,'after-reject','EDIT',null,null,'{}','',
  jsonb_build_object('copy',pg_temp.copy(12),'sources',jsonb_build_array(pg_temp.sid('new-next')))));
select pg_temp.submit(138,'after-late-edit');
select throws_ok($$select pg_temp.review(139,'after-late-edit',source=>pg_temp.sid('new-next'))$$,'23514',null,'changed-count review still requires historical conflict resolution');
select lives_ok($$select pg_temp.review(139,'after-late-edit',source=>pg_temp.sid('new-next'),resolution=>'TEST-ONLY explicit reconciliation of historical counts')$$,'qualified review can explicitly reconcile original-free packaging history');
select ok(pg_temp.valid('after-late-edit'),'explicitly resolved original-free current is valid');
insert into sources values('historical-after-approval',pg_temp.source(74,assertion=>'contradicts',variant=>pg_temp.id(14),original=>null));
select ok(not pg_temp.valid('after-late-edit'),'new contradiction against historical count invalidates current approval');
select is((select jsonb_agg(to_jsonb(t) order by id) from packaging_records t),(select packaging from original_rows),'all original packaging and commercial terms remain exact');
select is((select jsonb_agg(to_jsonb(t) order by id) from product_variants t),(select variants from original_rows),'review does not promote or change product identity');
set local role authenticated;
select pg_temp.actor(4);
select ok((select count(*)>0 from packaging_revision_decisions),'current viewer can read history');
select pg_temp.actor(6);
select is((select count(*)::int from packaging_revisions),0,'unassigned session cannot read revisions');
select is((select count(*)::int from pi_packaging_readiness),0,'missing-packaging aggregation does not expose SKUs to unassigned readers');
select ok(not public.pi_packaging_approval_valid((pg_temp.r('reference')->>'revision_id')::uuid),'unassigned reader cannot use validity oracle');
reset role;
select pg_temp.actor(1);
select is((select count(*)::int from compatibility_relationships),0,'packaging review creates no compatibility');
select is((select count(*)::int from publish_records),0,'packaging review creates no publication');
select is((select count(*)::int from private.pi_mutation_context),0,'no mutation capability survives');
select * from finish();
rollback;
