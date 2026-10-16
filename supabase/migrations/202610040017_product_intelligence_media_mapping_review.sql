-- M4-B13: human decisions are exact-SKU evidence, not global asset/publication approval.
alter table public.media_mapping_revisions drop constraint media_mapping_revisions_review_state_check;
alter table public.media_mapping_revisions add constraint media_mapping_revisions_review_state_check
  check (review_state in ('proposed','pending','approved','rejected','superseded'));

create table public.media_mapping_decisions (
  mapping_id uuid primary key references public.media_mapping_revisions(id),
  event_id uuid not null unique references public.verification_events(id),
  decision public.pi_review_decision not null,
  submitted_digest text not null check (submitted_digest ~ '^[a-f0-9]{64}$'),
  observed_digest text not null check (observed_digest ~ '^[a-f0-9]{64}$'),
  confirmation jsonb not null,
  rights_source_id uuid references public.media_source_bindings(evidence_source_id),
  match_source_id uuid references public.media_source_bindings(evidence_source_id),
  conflict_resolution text not null check (length(conflict_resolution)<=2000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.media_mapping_currents (
  head_id uuid primary key references public.media_mapping_heads(id),
  mapping_id uuid not null unique references public.media_mapping_revisions(id),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);
do $$ declare name text; begin
  foreach name in array array['media_mapping_decisions','media_mapping_currents'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('alter table public.%I force row level security',name);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',name);
    execute format('grant select on public.%I to authenticated',name);
    execute format('create policy console_read on public.%I for select to authenticated using (public.pi_can_view_console())',name);
    execute format('create trigger working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()',name);
    execute format('create trigger immutable_mapping_table before truncate on public.%I for each statement execute function public.pi_prevent_immutable_change()',name);
    execute format('create trigger audit_change after insert or update on public.%I for each row execute function public.pi_audit_row_change()',name);
  end loop;
end $$;
create trigger immutable_mapping_decision before update or delete on public.media_mapping_decisions
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_mapping_current before delete on public.media_mapping_currents
for each row execute function public.pi_prevent_immutable_change();

create function private.pi_media_mapping_source_selected(mapping_uuid uuid,source_uuid uuid,dimension text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.media_mapping_revisions candidate
    join public.media_mapping_heads head on head.id=candidate.head_id
    join public.media_mapping_evidence link on link.revision_id=candidate.id
    where candidate.id=mapping_uuid and link.evidence_source_id=source_uuid
      and private.pi_media_source_can_support_review(source_uuid,head.product_variant_id,
        candidate.media_asset_id,head.media_role,dimension));
$$;

-- This validates the stored HUMAN declaration and its evidence; it never attests raster bytes.
create function private.pi_media_mapping_approval_valid(mapping_uuid uuid)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists(select 1 from public.media_mapping_revisions candidate
    join public.media_mapping_heads head on head.id=candidate.head_id
    join public.media_mapping_decisions review on review.mapping_id=candidate.id
    join public.verification_events event on event.id=review.event_id
    where candidate.id=mapping_uuid and review.decision='APPROVE'
      and candidate.submitted_digest=candidate.proposal_digest
      and review.submitted_digest=candidate.submitted_digest
      and review.observed_digest=private.pi_media_mapping_digest(candidate.id)
      and review.observed_digest=review.submitted_digest
      and candidate.original_digest=private.pi_media_original_digest(head.product_variant_id,candidate.media_asset_id)
      and review.confirmation=jsonb_build_object('original_digest',candidate.original_digest,
        'original_inspected',true,'usage_rights_confirmed',true,'exact_product_confirmed',true)
      and private.pi_media_mapping_source_selected(candidate.id,review.rights_source_id,'usage_rights')
      and private.pi_media_mapping_source_selected(candidate.id,review.match_source_id,'product_match')
      and (candidate.verification_status<>'DATA_CONFLICT'
        or length(regexp_replace(review.conflict_resolution,'[[:space:]]','','g'))>=3)
      and event.entity_type='media_mapping' and event.entity_id=candidate.id and event.field_key=head.media_role
      and event.decision='APPROVE' and event.actor_id=review.created_by
      and event.before_value->>'digest'=review.submitted_digest
      and event.before_value->'candidate'=jsonb_set(to_jsonb(candidate),'{review_state}','"pending"')
      and event.after_value=jsonb_build_object('decision','APPROVE','digest',review.submitted_digest,
        'observed_digest',review.observed_digest,'confirmation',review.confirmation,
        'rights_source_id',review.rights_source_id,'match_source_id',review.match_source_id,
        'conflict_resolution',review.conflict_resolution,'replacement',null)
      and event.evidence_source_ids=array(select evidence_source_id from public.media_mapping_evidence
        where revision_id=candidate.id order by evidence_source_id));
$$;

create function private.pi_guard_media_mapping_decision()
returns trigger language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.media_mapping_revisions%rowtype; head public.media_mapping_heads%rowtype;
  event public.verification_events%rowtype;
begin
  select * into candidate from public.media_mapping_revisions where id=new.mapping_id;
  select * into head from public.media_mapping_heads where id=candidate.head_id;
  select * into event from public.verification_events where id=new.event_id;
  if not public.pi_has_console_role(array['owner','reviewer']::public.pi_console_role[])
    or coalesce(private.pi_request_jwt_role(),'')<>'authenticated' or new.created_by is distinct from auth.uid()
    or candidate.review_state is distinct from 'pending' or candidate.sequence is distinct from head.revision
    or new.submitted_digest is distinct from candidate.proposal_digest
    or new.submitted_digest is distinct from candidate.submitted_digest
    or new.observed_digest is distinct from private.pi_media_mapping_digest(candidate.id)
    or event.entity_type is distinct from 'media_mapping' or event.entity_id is distinct from candidate.id
    or event.field_key is distinct from head.media_role or event.decision is distinct from new.decision
    or event.actor_id is distinct from auth.uid() or event.created_at is distinct from new.created_at
    or event.before_value->'candidate' is distinct from to_jsonb(candidate)
    or event.before_value->>'digest' is distinct from new.submitted_digest
    or event.after_value is distinct from jsonb_build_object('decision',new.decision,'digest',new.submitted_digest,
      'observed_digest',new.observed_digest,'confirmation',new.confirmation,'rights_source_id',new.rights_source_id,
      'match_source_id',new.match_source_id,'conflict_resolution',new.conflict_resolution,
      'replacement',event.after_value->'replacement')
    or event.evidence_source_ids is distinct from array(select evidence_source_id from public.media_mapping_evidence
      where revision_id=candidate.id order by evidence_source_id) then
    raise exception 'A mapping decision requires the exact pending snapshot and current human actor.' using errcode='23514';
  end if;
  if new.decision='APPROVE' then
    if new.observed_digest<>new.submitted_digest
      or candidate.original_digest is distinct from private.pi_media_original_digest(head.product_variant_id,candidate.media_asset_id)
      or new.confirmation<>jsonb_build_object('original_digest',candidate.original_digest,
        'original_inspected',true,'usage_rights_confirmed',true,'exact_product_confirmed',true)
      or not private.pi_media_mapping_source_selected(candidate.id,new.rights_source_id,'usage_rights')
      or not private.pi_media_mapping_source_selected(candidate.id,new.match_source_id,'product_match')
      or event.after_value->'replacement' is distinct from 'null'::jsonb
      or (candidate.verification_status='DATA_CONFLICT'
        and length(regexp_replace(new.conflict_resolution,'[[:space:]]','','g'))<3) then
      raise exception 'Approval requires both exact evidence dimensions, explicit inspection and conflict resolution.' using errcode='23514';
    end if;
  elsif new.confirmation<>'{}'::jsonb or new.rights_source_id is not null or new.match_source_id is not null
    or new.conflict_resolution<>'' then
    raise exception 'EDIT or REJECT cannot manufacture a confirmation.' using errcode='22023';
  end if;
  return new;
end;
$$;
create trigger exact_mapping_decision before insert on public.media_mapping_decisions
for each row execute function private.pi_guard_media_mapping_decision();

create or replace function private.pi_guard_media_mapping_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='UPDATE' and old.proposal_digest=repeat('0',64) and old.review_state='proposed'
    and old.created_by=auth.uid() and new.proposal_digest=private.pi_media_mapping_digest(old.id)
    and (to_jsonb(new)-'proposal_digest')=(to_jsonb(old)-'proposal_digest') then return new; end if;
  if tg_op='DELETE' or (to_jsonb(new)-array['review_state','submitted_digest']) is distinct from
    (to_jsonb(old)-array['review_state','submitted_digest']) then
    raise exception 'Mapping content is immutable; append a new proposal.' using errcode='55000';
  end if;
  if old.review_state='pending' and new.submitted_digest=old.submitted_digest and exists(
    select 1 from public.media_mapping_decisions review join public.verification_events event on event.id=review.event_id
    where review.mapping_id=old.id and review.created_by=auth.uid() and event.actor_id=auth.uid()
      and review.submitted_digest=old.submitted_digest
      and event.before_value->'candidate'=to_jsonb(old)
      and new.review_state=case review.decision when 'APPROVE' then 'approved' when 'REJECT' then 'rejected' else 'superseded' end
      and (review.decision<>'APPROVE' or private.pi_media_mapping_approval_valid(old.id))) then return new; end if;
  if old.review_state<>'proposed' or new.review_state not in ('pending','superseded')
    or (new.review_state='pending' and (new.submitted_digest is distinct from old.proposal_digest
      or new.submitted_digest is distinct from private.pi_media_mapping_digest(old.id)))
    or (new.review_state='superseded' and new.submitted_digest is distinct from old.submitted_digest) then
    raise exception 'Invalid mapping submission or supersession.' using errcode='40001';
  end if;
  return new;
end;
$$;

create function private.pi_guard_media_mapping_current()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(private.pi_request_jwt_role(),'')<>'authenticated'
    or not public.pi_has_console_role(array['owner','reviewer']::public.pi_console_role[])
    or (tg_op='UPDATE' and new.head_id is distinct from old.head_id) or new.updated_by is distinct from auth.uid()
    or new.updated_at is distinct from now() or not exists(
      select 1 from public.media_mapping_revisions candidate join public.media_mapping_heads head on head.id=candidate.head_id
      join public.media_mapping_decisions review on review.mapping_id=candidate.id
      where candidate.id=new.mapping_id and candidate.head_id=new.head_id and candidate.sequence=head.revision
        and candidate.review_state='approved' and review.created_by=auth.uid()
        and private.pi_media_mapping_approval_valid(candidate.id)) then
    raise exception 'Current mapping requires an exact current APPROVE decision.' using errcode='23514';
  end if;
  return new;
end;
$$;
create trigger exact_mapping_current before insert or update on public.media_mapping_currents
for each row execute function private.pi_guard_media_mapping_current();

-- Caller holds authority/role locks and the appropriate mapping capability.
create function private.pi_append_media_mapping(
  variant_uuid uuid,asset_uuid uuid,requested_role text,requested_slot integer,expected_revision bigint,
  mapping_copy jsonb,source_uuids uuid[],proposal_reason text,head_uuid uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare head public.media_mapping_heads%rowtype; previous public.media_mapping_revisions%rowtype;
  candidate_uuid uuid:=extensions.gen_random_uuid(); source_uuid uuid; binding public.media_source_bindings%rowtype;
  original_hash text; candidate_hash text; conflicting boolean;
begin
  perform private.pi_check_media_source_target(variant_uuid,asset_uuid,requested_role,'product_match');
  perform private.pi_require_review_reason(proposal_reason);
  if requested_slot is null or requested_slot not between 0 and 99
    or (requested_role='main' and requested_slot<>0) or expected_revision is null or expected_revision<0
    or mapping_copy is null or jsonb_typeof(mapping_copy)<>'object'
    or (select array_agg(key order by key) from jsonb_object_keys(mapping_copy) key) is distinct from array['alt_text']::text[]
    or jsonb_typeof(mapping_copy->'alt_text')<>'string' or length(mapping_copy->>'alt_text') not between 1 and 500
    or mapping_copy->>'alt_text'<>btrim(mapping_copy->>'alt_text')
    or regexp_replace(mapping_copy->>'alt_text','[[:space:]]','','g')='' or mapping_copy->>'alt_text' ~ '[[:cntrl:]]'
    or source_uuids is null or cardinality(source_uuids)>20 or coalesce(array_ndims(source_uuids),1)<>1
    or exists(select 1 from unnest(source_uuids) source where source is null)
    or (select count(*)<>count(distinct source) from unnest(source_uuids) source) then
    raise exception 'Invalid mapping copy, role slot, revision or evidence.' using errcode='22023';
  end if;
  original_hash:=private.pi_media_original_digest(variant_uuid,asset_uuid);
  if original_hash is null then raise exception 'A current completed original for this exact SKU is required.' using errcode='55000'; end if;
  if head_uuid is null then
    if exists(select 1 from public.media_mapping_heads where product_variant_id=variant_uuid
      and media_role=requested_role and slot=requested_slot) or expected_revision<>0 then
      raise exception 'A mapping slot already exists or its revision changed.' using errcode='40001';
    end if;
    head.id:=extensions.gen_random_uuid(); head.revision:=0;
  else
    select * into head from public.media_mapping_heads where id=head_uuid for update;
    if not found or head.product_variant_id<>variant_uuid or head.media_role<>requested_role or head.slot<>requested_slot then
      raise exception 'Mapping scope cannot change.' using errcode='22023'; end if;
    if head.revision<>expected_revision then raise exception 'Mapping revision changed; reload and compare.' using errcode='40001'; end if;
    select * into previous from public.media_mapping_revisions where head_id=head.id and sequence=head.revision;
    if previous.review_state='pending' or (previous.review_state='proposed' and previous.verification_status='DATA_CONFLICT') then
      raise exception 'Pending or conflicting mapping needs an explicit human decision.' using errcode='55000';
    end if;
  end if;
  foreach source_uuid in array source_uuids loop
    select * into binding from public.media_source_bindings where evidence_source_id=source_uuid;
    if not found or not coalesce(private.pi_media_source_matches(source_uuid,variant_uuid,asset_uuid,
      requested_role,binding.evidence_dimension),false) then
      raise exception 'Media evidence does not match this exact SKU, asset, role or revision.' using errcode='22023'; end if;
    perform 1 from public.evidence_sources where id=source_uuid for share;
  end loop;
  conflicting:=exists(select 1 from public.media_source_bindings where product_variant_id=variant_uuid
    and media_asset_id=asset_uuid and media_role=requested_role and assertion='contradicts')
    or (previous.verification_status='DATA_CONFLICT' and exists(select 1 from public.media_mapping_decisions
      where mapping_id=previous.id and decision='EDIT'));
  if head_uuid is null then
    insert into public.media_mapping_heads values(head.id,variant_uuid,requested_role,requested_slot,1,auth.uid(),now());
  else
    if previous.review_state='proposed' then update public.media_mapping_revisions set review_state='superseded' where id=previous.id; end if;
    update public.media_mapping_heads set revision=revision+1 where id=head.id;
  end if;
  insert into public.media_mapping_revisions(id,head_id,predecessor_id,sequence,media_asset_id,original_intent_id,
    alt_text,variant_digest,asset_digest,original_digest,verification_status,review_state,proposal_digest,reason,created_by)
  values(candidate_uuid,head.id,previous.id,head.revision+1,asset_uuid,
    (select id from public.media_upload_intents where media_asset_id=asset_uuid),mapping_copy->>'alt_text',
    private.pi_media_variant_digest(variant_uuid),private.pi_media_asset_digest(asset_uuid),original_hash,
    case when coalesce(conflicting,false) then 'DATA_CONFLICT'::public.pi_verification_status else 'NEEDS_FACTORY_CONFIRMATION' end,
    'proposed',repeat('0',64),btrim(proposal_reason),auth.uid());
  insert into public.media_mapping_evidence select candidate_uuid,source from unnest(source_uuids) source;
  candidate_hash:=private.pi_media_mapping_digest(candidate_uuid);
  update public.media_mapping_revisions set proposal_digest=candidate_hash where id=candidate_uuid;
  return jsonb_build_object('mapping_id',candidate_uuid,'head_id',head.id,'revision',head.revision+1,'digest',candidate_hash);
end;
$$;
create or replace function private.pi_propose_media_mapping(
  request_uuid uuid,variant_uuid uuid,asset_uuid uuid,requested_role text,requested_slot integer,
  expected_revision bigint,mapping_copy jsonb,source_uuids uuid[],proposal_reason text,head_uuid uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare result jsonb; payload jsonb:=jsonb_build_object('variant',variant_uuid,'asset',asset_uuid,'role',requested_role,
  'slot',requested_slot,'revision',expected_revision,'copy',mapping_copy,'sources',source_uuids,'reason',proposal_reason,'head',head_uuid);
begin
  perform private.pi_begin_technical_command(array['owner','editor']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('propose_media_mapping',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_media_mapping_capability();
  result:=private.pi_append_media_mapping(variant_uuid,asset_uuid,requested_role,requested_slot,
    expected_revision,mapping_copy,source_uuids,proposal_reason,head_uuid);
  return private.pi_finish_technical_command('propose_media_mapping',request_uuid,payload,result);
end;
$$;

create function private.pi_media_mapping_review_capability()
returns void language sql security definer set search_path = '' as $$
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['media_mapping_heads','media_mapping_revisions','media_mapping_evidence','media_mapping_decisions',
      'media_mapping_currents','verification_events']);
$$;
create function private.pi_review_media_mapping(
  request_uuid uuid,mapping_uuid uuid,expected_revision bigint,expected_digest text,decision text,review_reason text,
  confirmation jsonb,rights_source_uuid uuid,match_source_uuid uuid,conflict_resolution text,replacement jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.media_mapping_revisions%rowtype; head public.media_mapping_heads%rowtype;
  event_uuid uuid:=extensions.gen_random_uuid(); observed_hash text; result jsonb; sources uuid[];
  payload jsonb:=jsonb_build_object('mapping',mapping_uuid,'revision',expected_revision,'digest',expected_digest,
    'decision',decision,'reason',review_reason,'confirmation',confirmation,'rights_source',rights_source_uuid,
    'match_source',match_source_uuid,'resolution',conflict_resolution,'replacement',replacement);
begin
  perform private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('review_media_mapping',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_require_review_reason(review_reason);
  if decision is null or decision not in ('APPROVE','EDIT','REJECT') or confirmation is null
    or jsonb_typeof(confirmation)<>'object' or conflict_resolution is null or length(conflict_resolution)>2000
    or (decision<>'EDIT' and replacement is not null) or (decision='EDIT' and replacement is null) then
    raise exception 'Invalid media review fields.' using errcode='22023'; end if;
  select * into candidate from public.media_mapping_revisions where id=mapping_uuid;
  if not found then raise exception 'Mapping candidate is unavailable.' using errcode='55000'; end if;
  select * into head from public.media_mapping_heads where id=candidate.head_id for update;
  perform private.pi_check_media_source_target(head.product_variant_id,candidate.media_asset_id,head.media_role,'product_match');
  if expected_revision is null or head.revision<>expected_revision or candidate.sequence<>head.revision
    or candidate.review_state<>'pending' or expected_digest is distinct from candidate.proposal_digest
    or expected_digest is distinct from candidate.submitted_digest then
    raise exception 'Pending mapping or submitted revision changed; reload and compare.' using errcode='40001'; end if;
  observed_hash:=private.pi_media_mapping_digest(candidate.id);
  if decision='EDIT' then
    if jsonb_typeof(replacement)<>'object' or
      (select array_agg(key order by key) from jsonb_object_keys(replacement) key) is distinct from array['asset_id','copy','sources']::text[]
      or jsonb_typeof(replacement->'asset_id')<>'string' or replacement->>'asset_id' !~
        '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
      or jsonb_typeof(replacement->'sources')<>'array' or jsonb_array_length(replacement->'sources')>20 then
      raise exception 'Invalid mapping replacement fields.' using errcode='22023'; end if;
    if exists(select 1 from jsonb_array_elements(replacement->'sources') source where jsonb_typeof(source)<>'string'
      or source #>> '{}' !~ '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$') then
      raise exception 'Invalid replacement sources.' using errcode='22023'; end if;
    sources:=array(select (source #>> '{}')::uuid from jsonb_array_elements(replacement->'sources') source);
  end if;
  perform private.pi_media_mapping_review_capability();
  insert into public.verification_events(id,entity_type,entity_id,field_key,decision,reason,before_value,after_value,evidence_source_ids,actor_id)
  values(event_uuid,'media_mapping',candidate.id,head.media_role,decision::public.pi_review_decision,btrim(review_reason),
    jsonb_build_object('candidate',to_jsonb(candidate),'digest',expected_digest),
    jsonb_build_object('decision',decision,'digest',expected_digest,'observed_digest',observed_hash,'confirmation',confirmation,
      'rights_source_id',rights_source_uuid,'match_source_id',match_source_uuid,'conflict_resolution',conflict_resolution,'replacement',replacement),
    array(select evidence_source_id from public.media_mapping_evidence where revision_id=candidate.id order by evidence_source_id),auth.uid());
  insert into public.media_mapping_decisions values(candidate.id,event_uuid,decision::public.pi_review_decision,
    expected_digest,observed_hash,confirmation,rights_source_uuid,match_source_uuid,conflict_resolution,auth.uid(),now());
  update public.media_mapping_revisions set review_state=case decision when 'APPROVE' then 'approved'
    when 'REJECT' then 'rejected' else 'superseded' end where id=candidate.id;
  if decision='APPROVE' then
    insert into public.media_mapping_currents values(head.id,candidate.id,auth.uid(),now())
      on conflict(head_id) do update set mapping_id=excluded.mapping_id,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
  elsif decision='EDIT' then
    result:=private.pi_append_media_mapping(head.product_variant_id,(replacement->>'asset_id')::uuid,head.media_role,
      head.slot,head.revision,replacement->'copy',sources,review_reason,head.id);
  end if;
  result:=coalesce(result,jsonb_build_object('mapping_id',candidate.id,'head_id',head.id,'revision',head.revision))
    || jsonb_build_object('event_id',event_uuid);
  return private.pi_finish_technical_command('review_media_mapping',request_uuid,payload,result);
end;
$$;

-- A guarded read wrapper, not a mutation grant or an anonymous Storage oracle.
create function public.pi_media_mapping_approval_valid(mapping_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select case when private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console()
    then private.pi_media_mapping_approval_valid(mapping_uuid) else false end;
$$;
revoke all on function public.pi_media_mapping_approval_valid(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_media_mapping_approval_valid(uuid) to authenticated;

create view public.pi_effective_media_mappings with (security_invoker=true) as
select mapping.id as mapping_id,null::uuid as head_id,mapping.product_variant_id,mapping.media_asset_id,
  mapping.role,case when mapping.role='main' then 0 else mapping.sort_order end as slot,mapping.alt_text,
  'legacy'::text as mapping_origin,'legacy'::text as review_state,'NEEDS_FACTORY_CONFIRMATION'::public.pi_verification_status as verification_status,
  false as review_valid,(asset.publication_status='search_eligible' and asset.usage_rights_status='approved'
    and asset.content_match_status='exact_product') as publication_ready
from public.product_media mapping join public.media_assets asset on asset.id=mapping.media_asset_id
where not exists(select 1 from public.media_mapping_heads head join public.media_mapping_currents current on current.head_id=head.id
  where head.product_variant_id=mapping.product_variant_id and head.media_role=mapping.role
    and head.slot=case when mapping.role='main' then 0 else mapping.sort_order end)
union all
select candidate.id,head.id,head.product_variant_id,candidate.media_asset_id,head.media_role,head.slot,candidate.alt_text,
  case when current.mapping_id=candidate.id then 'current' else 'open' end,candidate.review_state,
  case when current.mapping_id=candidate.id then case when public.pi_media_mapping_approval_valid(candidate.id)
    then 'CONFIRMED'::public.pi_verification_status else 'DATA_CONFLICT'::public.pi_verification_status end
    else candidate.verification_status end,
  public.pi_media_mapping_approval_valid(candidate.id),false
from public.media_mapping_revisions candidate join public.media_mapping_heads head on head.id=candidate.head_id
left join public.media_mapping_currents current on current.head_id=head.id
where current.mapping_id=candidate.id or candidate.review_state in ('proposed','pending');
revoke all on public.pi_effective_media_mappings from public,anon,authenticated,service_role;
grant select on public.pi_effective_media_mappings to authenticated;

create view public.pi_media_mapping_readiness with (security_invoker=true) as
select product_variant_id,
  count(*) filter(where mapping_origin='open')::int as open_media_mapping_count,
  count(*) filter(where mapping_origin='current' and not review_valid)::int as invalid_current_media_mapping_count,
  count(*) filter(where mapping_origin='current' and review_valid)::int as reviewed_media_mapping_count
from public.pi_effective_media_mappings group by product_variant_id;
revoke all on public.pi_media_mapping_readiness from public,anon,authenticated,service_role;
grant select on public.pi_media_mapping_readiness to authenticated;

create view public.pi_media_mapping_metrics with (security_invoker=true) as
select 'open_media_mappings'::text as metric,count(*)::bigint as value
  from public.pi_effective_media_mappings where mapping_origin='open'
union all select 'invalid_media_approvals',count(*) from public.pi_effective_media_mappings
  where mapping_origin='current' and not review_valid;
revoke all on public.pi_media_mapping_metrics from public,anon,authenticated,service_role;
grant select on public.pi_media_mapping_metrics to authenticated;

create or replace view public.pi_variant_readiness with (security_invoker=true) as
with technical as (
  select product_variant_id,count(*) as technical_value_count,
    count(*) filter(where verification_status='CONFIRMED') as confirmed_technical_count,
    count(*) filter(where verification_status='DATA_CONFLICT') as technical_conflict_count,
    count(*) filter(where verification_status in ('NEEDS_FACTORY_CONFIRMATION','DATA_CONFLICT') or exists(
      select 1 from public.technical_revisions candidate where candidate.value_id=pi_effective_technical_values.id
        and candidate.review_state in ('proposed','pending'))) as unresolved_technical_count
  from public.pi_effective_technical_values where product_variant_id is not null group by product_variant_id
), compatibility as (
  select entity.product_variant_id,count(relationship.id) as compatibility_count,
    count(relationship.id) filter(where relationship.verification_status='CONFIRMED') as confirmed_compatibility_count,
    count(relationship.id) filter(where relationship.verification_status='DATA_CONFLICT') as compatibility_conflict_count
  from public.compatibility_entities entity left join public.pi_effective_compatibility_relationships relationship
    on relationship.subject_entity_id=entity.id where entity.product_variant_id is not null group by entity.product_variant_id
), media as (
  select mapping.product_variant_id,count(*) as media_count,
    count(*) filter(where mapping.role='main' and mapping.publication_ready) as eligible_main_image_count,
    count(*) filter(where mapping.role='main' and mapping.mapping_origin='legacy' and asset.publication_status='legacy_reference') as legacy_main_image_count,
    count(*) filter(where mapping.mapping_origin='open') as open_media_mapping_count,
    count(*) filter(where mapping.mapping_origin='current' and not mapping.review_valid) as invalid_current_media_mapping_count,
    count(*) filter(where mapping.mapping_origin='current' and mapping.review_valid) as reviewed_media_mapping_count
  from public.pi_effective_media_mappings mapping join public.media_assets asset on asset.id=mapping.media_asset_id
  group by mapping.product_variant_id
), seo as (
  select product_variant_id,count(*) as seo_record_count,
    count(*) filter(where publication_status in ('approved','published')) as approved_seo_count
  from public.seo_records where product_variant_id is not null group by product_variant_id
)
select variant.id,variant.sku,variant.public_slug,variant.lifecycle_state,variant.is_shadow,variant.legacy_status,variant.legacy_data_status,
  coalesce(technical.technical_value_count,0)::int as technical_value_count,
  coalesce(technical.confirmed_technical_count,0)::int as confirmed_technical_count,
  coalesce(technical.technical_conflict_count,0)::int as technical_conflict_count,
  coalesce(technical.unresolved_technical_count,0)::int as unresolved_technical_count,
  coalesce(compatibility.compatibility_count,0)::int as compatibility_count,
  coalesce(compatibility.confirmed_compatibility_count,0)::int as confirmed_compatibility_count,
  coalesce(compatibility.compatibility_conflict_count,0)::int as compatibility_conflict_count,
  coalesce(media.media_count,0)::int as media_count,coalesce(media.eligible_main_image_count,0)::int as eligible_main_image_count,
  coalesce(media.legacy_main_image_count,0)::int as legacy_main_image_count,
  coalesce(seo.seo_record_count,0)::int as seo_record_count,coalesce(seo.approved_seo_count,0)::int as approved_seo_count,
  ((variant.legacy_data_status<>'confirmed')::int+(coalesce(technical.confirmed_technical_count,0)=0)::int
    +(coalesce(technical.unresolved_technical_count,0)>0)::int+(coalesce(compatibility.compatibility_conflict_count,0)>0)::int
    +(coalesce(compatibility.compatibility_count,0)>coalesce(compatibility.confirmed_compatibility_count,0))::int
    +(coalesce(media.eligible_main_image_count,0)=0)::int+(coalesce(seo.approved_seo_count,0)=0)::int
    +(coalesce(media.open_media_mapping_count,0)>0)::int+(coalesce(media.invalid_current_media_mapping_count,0)>0)::int) as blocker_count
from public.product_variants variant left join technical on technical.product_variant_id=variant.id
left join compatibility on compatibility.product_variant_id=variant.id left join media on media.product_variant_id=variant.id
left join seo on seo.product_variant_id=variant.id;

create or replace view public.pi_dashboard_metrics with (security_invoker=true) as
select 'total_products'::text as metric,count(*)::bigint as value from public.product_variants
union all select 'shadow_products',count(*) from public.product_variants where is_shadow
union all select 'verified_products',count(*) from public.pi_variant_readiness variant
  where lifecycle_state='VERIFIED' and not exists(select 1 from public.pi_media_mapping_readiness media
    where media.product_variant_id=variant.id and (media.open_media_mapping_count>0 or media.invalid_current_media_mapping_count>0))
union all select 'ready_for_publish',count(*) from public.pi_variant_readiness where lifecycle_state='READY_FOR_PUBLISH' and blocker_count=0
union all select 'published_products',count(*) from public.product_variants where lifecycle_state='PUBLISHED'
union all select 'needs_factory_confirmation',count(*) from public.pi_effective_technical_values where verification_status='NEEDS_FACTORY_CONFIRMATION'
union all select 'data_conflicts',count(*) from public.pi_effective_technical_values where verification_status='DATA_CONFLICT'
union all select 'missing_eligible_main_images',count(*) from public.pi_variant_readiness where eligible_main_image_count=0
union all select 'unconfirmed_compatibility',count(*) from public.pi_effective_compatibility_relationships where verification_status<>'CONFIRMED';

create function private.pi_guard_current_media_mapping()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.lifecycle_state in ('VERIFIED','READY_FOR_PUBLISH','QA_PASSED','PUBLISHED') and exists(
    select 1 from public.media_mapping_heads head join public.media_mapping_currents current on current.head_id=head.id
    where head.product_variant_id=new.id and not private.pi_media_mapping_approval_valid(current.mapping_id)) then
    raise exception 'Invalid current media approval blocks publishable lifecycle states.' using errcode='23514'; end if;
  return new;
end;
$$;
create trigger product_variants_01_current_media_guard before insert or update on public.product_variants
for each row execute function private.pi_guard_current_media_mapping();
revoke all on all functions in schema private from public,anon,authenticated,service_role;
