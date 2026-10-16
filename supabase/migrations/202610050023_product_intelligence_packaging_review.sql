-- M4-D2: frozen physical packaging decisions. Original commercial terms stay authoritative.
create table public.packaging_revision_heads (
  id uuid primary key,
  product_variant_id uuid not null references public.product_variants(id),
  slot integer not null check (slot between 0 and 99),
  original_packaging_id uuid unique references public.packaging_records(id),
  revision bigint not null check (revision>0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(product_variant_id,slot)
);
create table public.packaging_revisions (
  id uuid primary key,
  head_id uuid not null references public.packaging_revision_heads(id),
  predecessor_id uuid references public.packaging_revisions(id),
  sequence bigint not null check (sequence>0),
  package_description text not null,
  quantity integer check (quantity>0),
  quantity_unit text,
  variant_digest text not null check (variant_digest ~ '^[a-f0-9]{64}$'),
  original_digest text check (original_digest ~ '^[a-f0-9]{64}$'),
  verification_status public.pi_verification_status not null check
    (verification_status in ('NEEDS_FACTORY_CONFIRMATION','DATA_CONFLICT')),
  review_state text not null check (review_state in ('proposed','pending','approved','rejected','superseded')),
  proposal_digest text not null check (proposal_digest ~ '^[a-f0-9]{64}$'),
  submitted_digest text check (submitted_digest ~ '^[a-f0-9]{64}$'),
  reason text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(head_id,sequence),
  check ((quantity is null)=(quantity_unit is null)),
  check (length(package_description) between 1 and 1000 and package_description=btrim(package_description)
    and package_description !~ '[[:cntrl:]]' and regexp_replace(package_description,'[[:space:]]','','g')<>''
    and (quantity_unit is null or (length(quantity_unit) between 1 and 40 and quantity_unit=btrim(quantity_unit)
      and quantity_unit !~ '[[:cntrl:]]' and regexp_replace(quantity_unit,'[[:space:]]','','g')<>'')))
);
create unique index packaging_one_open on public.packaging_revisions(head_id) where review_state in ('proposed','pending');
create table public.packaging_revision_evidence (
  revision_id uuid not null references public.packaging_revisions(id),
  evidence_source_id uuid not null references public.packaging_source_bindings(evidence_source_id),
  primary key(revision_id,evidence_source_id)
);
create table public.packaging_revision_decisions (
  revision_id uuid primary key references public.packaging_revisions(id),
  event_id uuid not null unique references public.verification_events(id),
  decision public.pi_review_decision not null,
  submitted_digest text not null check (submitted_digest ~ '^[a-f0-9]{64}$'),
  observed_digest text not null check (observed_digest ~ '^[a-f0-9]{64}$'),
  approved_status public.pi_verification_status check (approved_status in ('CONFIRMED','OEM_REFERENCE')),
  confirmation jsonb not null,
  source_id uuid references public.packaging_source_bindings(evidence_source_id),
  conflict_resolution text not null check (length(conflict_resolution)<=2000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.packaging_revision_currents (
  head_id uuid primary key references public.packaging_revision_heads(id),
  revision_id uuid not null unique references public.packaging_revisions(id),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);
do $$ declare name text; begin
  foreach name in array array['packaging_revision_heads','packaging_revisions','packaging_revision_evidence',
    'packaging_revision_decisions','packaging_revision_currents'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('alter table public.%I force row level security',name);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',name);
    execute format('grant select on public.%I to authenticated',name);
    execute format('create policy console_read on public.%I for select to authenticated using (public.pi_can_view_console())',name);
    execute format('create trigger working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()',name);
    execute format('create trigger immutable_packaging_table before truncate on public.%I for each statement execute function public.pi_prevent_immutable_change()',name);
    execute format('create trigger audit_change after insert or update on public.%I for each row execute function public.pi_audit_row_change()',name);
  end loop;
end $$;
create trigger immutable_packaging_evidence before update or delete on public.packaging_revision_evidence
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_packaging_decision before update or delete on public.packaging_revision_decisions
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_packaging_current before delete on public.packaging_revision_currents
for each row execute function public.pi_prevent_immutable_change();

create function private.pi_packaging_revision_digest(revision_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(jsonb_build_object('head',to_jsonb(head)-'revision',
    'revision',to_jsonb(candidate)-array['review_state','proposal_digest','submitted_digest'],
    'variant',private.pi_packaging_variant_digest(head.product_variant_id),
    'original',private.pi_packaging_original_digest(head.original_packaging_id),
    'evidence',coalesce((select jsonb_agg(jsonb_build_object('binding',to_jsonb(binding),'source',to_jsonb(source))
      order by source.id) from public.packaging_revision_evidence link
      join public.packaging_source_bindings binding on binding.evidence_source_id=link.evidence_source_id
      join public.evidence_sources source on source.id=binding.evidence_source_id
      where link.revision_id=candidate.id),'[]'::jsonb),
    'known_conflicts',coalesce((select jsonb_agg(to_jsonb(binding) order by binding.evidence_source_id)
      from public.packaging_source_bindings binding where binding.product_variant_id=head.product_variant_id
        and binding.original_packaging_id is not distinct from head.original_packaging_id
        and (head.original_packaging_id is not null or exists(select 1 from public.packaging_revisions related
          where related.head_id=head.id and jsonb_build_object('package_description',binding.package_description,
            'quantity',binding.quantity,'quantity_unit',binding.quantity_unit)=jsonb_build_object('package_description',related.package_description,
              'quantity',related.quantity,'quantity_unit',related.quantity_unit)))
        and binding.assertion='contradicts'),'[]'::jsonb))::text,'sha256'),'hex')
  from public.packaging_revisions candidate join public.packaging_revision_heads head on head.id=candidate.head_id
  where candidate.id=revision_uuid;
$$;
create function private.pi_packaging_review_source_selected(revision_uuid uuid,source_uuid uuid,approved_status public.pi_verification_status)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.packaging_revisions candidate
    join public.packaging_revision_heads head on head.id=candidate.head_id
    join public.packaging_revision_evidence link on link.revision_id=candidate.id
    join public.packaging_source_bindings binding on binding.evidence_source_id=link.evidence_source_id
    join public.evidence_sources source on source.id=binding.evidence_source_id
    where candidate.id=revision_uuid and link.evidence_source_id=source_uuid
      and private.pi_packaging_source_matches(source_uuid,head.product_variant_id,jsonb_build_object('package_description',candidate.package_description,'quantity',candidate.quantity,'quantity_unit',candidate.quantity_unit),head.original_packaging_id)
      and ((approved_status='CONFIRMED' and candidate.quantity is not null and private.pi_packaging_source_can_support_review(source_uuid,
        head.product_variant_id,jsonb_build_object('package_description',candidate.package_description,'quantity',candidate.quantity,'quantity_unit',candidate.quantity_unit),head.original_packaging_id))
        or (approved_status='OEM_REFERENCE' and source.source_level='B' and source.exact_subject
          and binding.source_kind='official_manufacturer' and binding.evidence_basis='manufacturer_catalog'
          and binding.assertion in ('supports','reference_only'))));
$$;
create function private.pi_packaging_approval_valid(revision_uuid uuid)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists(select 1 from public.packaging_revisions candidate
    join public.packaging_revision_heads head on head.id=candidate.head_id
    join public.packaging_revision_decisions review on review.revision_id=candidate.id
    join public.verification_events event on event.id=review.event_id
    where candidate.id=revision_uuid and candidate.review_state in ('pending','approved') and review.decision='APPROVE'
      and candidate.submitted_digest=candidate.proposal_digest and review.submitted_digest=candidate.submitted_digest
      and review.observed_digest=private.pi_packaging_revision_digest(candidate.id)
      and review.observed_digest=review.submitted_digest
      and candidate.original_digest is not distinct from private.pi_packaging_original_digest(head.original_packaging_id)
      and review.confirmation=jsonb_build_object('source_checked',true,'packaging_checked',true,
        'commercial_terms_unchanged',true,'arcfort_packaging_confirmed',review.approved_status='CONFIRMED')
      and private.pi_packaging_review_source_selected(candidate.id,review.source_id,review.approved_status)
      and (candidate.verification_status<>'DATA_CONFLICT'
        or length(regexp_replace(review.conflict_resolution,'[[:space:]]','','g'))>=3)
      and event.entity_type='packaging_revision' and event.entity_id=candidate.id and event.field_key='packaging'
      and event.decision='APPROVE' and event.actor_id=review.created_by and event.created_at=review.created_at
      and event.before_value=jsonb_build_object('candidate',jsonb_set(to_jsonb(candidate),'{review_state}','"pending"'),
        'digest',review.submitted_digest)
      and event.after_value=jsonb_build_object('decision','APPROVE','digest',review.submitted_digest,
        'observed_digest',review.observed_digest,'approved_status',review.approved_status,'confirmation',review.confirmation,
        'source_id',review.source_id,'conflict_resolution',review.conflict_resolution,'replacement',null)
      and event.evidence_source_ids=array(select evidence_source_id from public.packaging_revision_evidence
        where revision_id=candidate.id order by evidence_source_id));
$$;
create function private.pi_guard_packaging_decision()
returns trigger language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.packaging_revisions%rowtype; head public.packaging_revision_heads%rowtype;
  event public.verification_events%rowtype;
begin
  select * into candidate from public.packaging_revisions where id=new.revision_id;
  select * into head from public.packaging_revision_heads where id=candidate.head_id;
  select * into event from public.verification_events where id=new.event_id;
  perform private.pi_require_review_reason(event.reason);
  if not public.pi_has_console_role(array['owner','reviewer']::public.pi_console_role[])
    or coalesce(private.pi_request_jwt_role(),'')<>'authenticated' or new.created_by is distinct from auth.uid()
    or candidate.review_state is distinct from 'pending' or candidate.sequence is distinct from head.revision
    or new.submitted_digest is distinct from candidate.proposal_digest
    or new.submitted_digest is distinct from candidate.submitted_digest
    or new.observed_digest is distinct from private.pi_packaging_revision_digest(candidate.id)
    or event.entity_type is distinct from 'packaging_revision' or event.entity_id is distinct from candidate.id
    or event.field_key is distinct from 'packaging' or event.decision is distinct from new.decision
    or event.actor_id is distinct from auth.uid() or event.created_at is distinct from new.created_at
    or event.before_value is distinct from jsonb_build_object('candidate',to_jsonb(candidate),'digest',new.submitted_digest)
    or event.after_value is distinct from jsonb_build_object('decision',new.decision,'digest',new.submitted_digest,
      'observed_digest',new.observed_digest,'approved_status',new.approved_status,'confirmation',new.confirmation,
      'source_id',new.source_id,'conflict_resolution',new.conflict_resolution,'replacement',event.after_value->'replacement')
    or event.evidence_source_ids is distinct from array(select evidence_source_id from public.packaging_revision_evidence
      where revision_id=candidate.id order by evidence_source_id) then
    raise exception 'packaging decision requires the exact pending snapshot and current human actor.' using errcode='23514';
  end if;
  if new.decision='APPROVE' then
    if new.approved_status is null or new.observed_digest<>new.submitted_digest
      or new.confirmation<>jsonb_build_object('source_checked',true,'packaging_checked',true,
        'commercial_terms_unchanged',true,'arcfort_packaging_confirmed',new.approved_status='CONFIRMED')
      or not private.pi_packaging_review_source_selected(candidate.id,new.source_id,new.approved_status)
      or event.after_value->'replacement' is distinct from 'null'::jsonb
      or (candidate.verification_status='DATA_CONFLICT'
        and length(regexp_replace(new.conflict_resolution,'[[:space:]]','','g'))<3) then
      raise exception 'packaging approval requires explicit human review, qualifying exact evidence and conflict resolution.' using errcode='23514';
    end if;
  elsif new.approved_status is not null or new.confirmation<>'{}'::jsonb or new.source_id is not null
    or new.conflict_resolution<>'' then
    raise exception 'EDIT or REJECT cannot manufacture a packaging confirmation.' using errcode='22023';
  end if;
  return new;
end;
$$;
create trigger exact_packaging_decision before insert on public.packaging_revision_decisions
for each row execute function private.pi_guard_packaging_decision();
create function private.pi_guard_packaging_head()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='DELETE' or (to_jsonb(new)-'revision') is distinct from (to_jsonb(old)-'revision')
    or new.revision<>old.revision+1 then
    raise exception 'packaging scope is immutable and revisions must advance once.' using errcode='55000'; end if;
  return new;
end;
$$;
create trigger immutable_packaging_head before update or delete on public.packaging_revision_heads
for each row execute function private.pi_guard_packaging_head();
create function private.pi_guard_packaging_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='UPDATE' and old.proposal_digest=repeat('0',64) and old.review_state='proposed'
    and old.created_by=auth.uid() and new.proposal_digest=private.pi_packaging_revision_digest(old.id)
    and (to_jsonb(new)-'proposal_digest')=(to_jsonb(old)-'proposal_digest') then return new; end if;
  if tg_op='DELETE' or (to_jsonb(new)-array['review_state','submitted_digest']) is distinct from
    (to_jsonb(old)-array['review_state','submitted_digest']) then
    raise exception 'packaging content is immutable; append a new proposal.' using errcode='55000'; end if;
  if old.review_state='pending' and new.submitted_digest=old.submitted_digest and exists(
    select 1 from public.packaging_revision_decisions review join public.verification_events event on event.id=review.event_id
    where review.revision_id=old.id and review.created_by=auth.uid() and event.actor_id=auth.uid()
      and event.before_value->'candidate'=to_jsonb(old)
      and new.review_state=case review.decision when 'APPROVE' then 'approved' when 'REJECT' then 'rejected' else 'superseded' end
      and (review.decision<>'APPROVE' or private.pi_packaging_approval_valid(old.id))) then return new; end if;
  if old.review_state<>'proposed' or new.review_state not in ('pending','superseded')
    or (new.review_state='pending' and (new.submitted_digest is distinct from old.proposal_digest
      or new.submitted_digest is distinct from private.pi_packaging_revision_digest(old.id)))
    or (new.review_state='superseded' and (new.submitted_digest is distinct from old.submitted_digest
      or old.verification_status='DATA_CONFLICT')) then
    raise exception 'Invalid packaging submission or supersession.' using errcode='40001'; end if;
  return new;
end;
$$;
create trigger immutable_packaging_revision before update or delete on public.packaging_revisions
for each row execute function private.pi_guard_packaging_revision();
create function private.pi_guard_packaging_current()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(private.pi_request_jwt_role(),'')<>'authenticated'
    or not public.pi_has_console_role(array['owner','reviewer']::public.pi_console_role[])
    or (tg_op='UPDATE' and new.head_id is distinct from old.head_id) or new.updated_by is distinct from auth.uid()
    or new.updated_at is distinct from now() or not exists(
      select 1 from public.packaging_revisions candidate join public.packaging_revision_heads head on head.id=candidate.head_id
      join public.packaging_revision_decisions review on review.revision_id=candidate.id
      where candidate.id=new.revision_id and candidate.head_id=new.head_id and candidate.sequence=head.revision
        and candidate.review_state='approved' and review.created_by=auth.uid()
        and private.pi_packaging_approval_valid(candidate.id)) then
    raise exception 'Current packaging reference requires an exact current APPROVE decision.' using errcode='23514'; end if;
  return new;
end;
$$;
create trigger exact_packaging_current before insert or update on public.packaging_revision_currents
for each row execute function private.pi_guard_packaging_current();
create function private.pi_packaging_revision_capability()
returns void language sql security definer set search_path = '' as $$
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['packaging_revision_heads','packaging_revisions','packaging_revision_evidence','packaging_revision_decisions','packaging_revision_currents','verification_events']);
$$;
create function private.pi_guard_packaging_evidence_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.packaging_revisions candidate
    join public.packaging_revision_heads head on head.id=candidate.head_id where candidate.id=new.revision_id
      and candidate.review_state='proposed' and candidate.proposal_digest=repeat('0',64)
      and candidate.sequence=head.revision and candidate.created_by=auth.uid()
      and private.pi_packaging_source_matches(new.evidence_source_id,head.product_variant_id,
        jsonb_build_object('package_description',candidate.package_description,'quantity',candidate.quantity,'quantity_unit',candidate.quantity_unit),head.original_packaging_id)) then
    raise exception 'packaging evidence can only bind during creation of an exact unfrozen proposal.' using errcode='55000'; end if;
  return new;
end;
$$;
create trigger exact_packaging_evidence before insert on public.packaging_revision_evidence
for each row execute function private.pi_guard_packaging_evidence_insert();
create function private.pi_append_packaging_revision(
  variant_uuid uuid,requested_slot integer,expected_revision bigint,packaging_copy jsonb,source_uuids uuid[],
  proposal_reason text,head_uuid uuid default null,original_uuid uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare head public.packaging_revision_heads%rowtype; previous public.packaging_revisions%rowtype;
  candidate_uuid uuid:=extensions.gen_random_uuid(); source_uuid uuid; conflicting boolean; candidate_hash text;
begin
  perform private.pi_require_review_reason(proposal_reason);
  perform private.pi_check_packaging_copy(packaging_copy);
  if requested_slot is null or requested_slot not between 0 and 99 or expected_revision is null or expected_revision<0
    or source_uuids is null or cardinality(source_uuids)>20 or coalesce(array_ndims(source_uuids),1)<>1
    or exists(select 1 from unnest(source_uuids) source where source is null)
    or (select count(*)<>count(distinct source) from unnest(source_uuids) source) then
    raise exception 'Invalid packaging copy, slot, revision or evidence.' using errcode='22023'; end if;
  perform private.pi_check_packaging_source_target(variant_uuid,packaging_copy,original_uuid);
  if head_uuid is null then
    if expected_revision<>0 or exists(select 1 from public.packaging_revision_heads
      where product_variant_id=variant_uuid and slot=requested_slot) then
      raise exception 'A packaging slot already exists or its revision changed.' using errcode='40001'; end if;
    if original_uuid is not null and not exists(select 1 from public.packaging_records
      where id=original_uuid and product_variant_id=variant_uuid) then
      raise exception 'packaging lineage must belong to this exact SKU.' using errcode='22023'; end if;
    if exists(select 1 from public.packaging_records original where original.product_variant_id=variant_uuid
      and jsonb_build_object('package_description',original.package_description,'quantity',original.quantity,'quantity_unit',original.quantity_unit)=packaging_copy
      and original.id is distinct from original_uuid) then
      raise exception 'An existing packaging reference requires explicit original lineage.' using errcode='22023'; end if;
    head.id:=extensions.gen_random_uuid(); head.revision:=0; head.original_packaging_id:=original_uuid;
  else
    select * into head from public.packaging_revision_heads where id=head_uuid for update;
    if not found or head.product_variant_id<>variant_uuid or head.slot<>requested_slot
      or head.original_packaging_id is distinct from original_uuid then
      raise exception 'packaging scope and original lineage cannot change.' using errcode='22023'; end if;
    if head.revision<>expected_revision then raise exception 'packaging revision changed; reload and compare.' using errcode='40001'; end if;
    select * into previous from public.packaging_revisions where head_id=head.id and sequence=head.revision;
    if previous.review_state='pending' or (previous.review_state='proposed' and previous.verification_status='DATA_CONFLICT') then
      raise exception 'Pending or conflicting packaging proposals need an explicit human decision.' using errcode='55000'; end if;
  end if;
  if exists(select 1 from public.packaging_revisions candidate join public.packaging_revision_heads other on other.id=candidate.head_id
    left join public.packaging_revision_currents current on current.head_id=other.id
    where other.product_variant_id=variant_uuid and other.id<>head.id
      and jsonb_build_object('package_description',candidate.package_description,'quantity',candidate.quantity,'quantity_unit',candidate.quantity_unit)=packaging_copy
      and (candidate.review_state in ('proposed','pending') or current.revision_id=candidate.id)) then
    raise exception 'This exact physical package already has an open or current slot.' using errcode='22023'; end if;
  foreach source_uuid in array source_uuids loop
    if not private.pi_packaging_source_matches(source_uuid,variant_uuid,packaging_copy,original_uuid) then
      raise exception 'packaging evidence does not match this exact SKU, physical packaging or original lineage.' using errcode='22023'; end if;
    perform 1 from public.evidence_sources where id=source_uuid for share;
  end loop;
  conflicting:=exists(select 1 from public.packaging_source_bindings binding where binding.product_variant_id=variant_uuid
    and binding.original_packaging_id is not distinct from original_uuid
    and (original_uuid is not null or jsonb_build_object('package_description',binding.package_description,
      'quantity',binding.quantity,'quantity_unit',binding.quantity_unit)=packaging_copy
      or exists(select 1 from public.packaging_revisions related where related.head_id=head.id
        and jsonb_build_object('package_description',related.package_description,'quantity',related.quantity,
          'quantity_unit',related.quantity_unit)=jsonb_build_object('package_description',binding.package_description,
            'quantity',binding.quantity,'quantity_unit',binding.quantity_unit))) and binding.assertion='contradicts')
    or exists(select 1 from public.packaging_records where id=original_uuid and verification_status='DATA_CONFLICT')
    or previous.proposal_digest<>private.pi_packaging_revision_digest(previous.id)
    or (previous.verification_status='DATA_CONFLICT' and not private.pi_packaging_approval_valid(previous.id));
  if head_uuid is null then
    insert into public.packaging_revision_heads values(head.id,variant_uuid,requested_slot,original_uuid,1,auth.uid(),now());
  else
    if previous.review_state='proposed' then update public.packaging_revisions set review_state='superseded' where id=previous.id; end if;
    update public.packaging_revision_heads set revision=revision+1 where id=head.id;
  end if;
  insert into public.packaging_revisions(id,head_id,predecessor_id,sequence,package_description,quantity,quantity_unit,variant_digest,
    original_digest,verification_status,review_state,proposal_digest,reason,created_by)
  values(candidate_uuid,head.id,previous.id,head.revision+1,packaging_copy->>'package_description',((packaging_copy->>'quantity')::numeric)::integer,packaging_copy->>'quantity_unit',
    private.pi_packaging_variant_digest(variant_uuid),private.pi_packaging_original_digest(original_uuid),
    case when coalesce(conflicting,false) then 'DATA_CONFLICT'::public.pi_verification_status else 'NEEDS_FACTORY_CONFIRMATION' end,
    'proposed',repeat('0',64),btrim(proposal_reason),auth.uid());
  insert into public.packaging_revision_evidence select candidate_uuid,source from unnest(source_uuids) source;
  candidate_hash:=private.pi_packaging_revision_digest(candidate_uuid);
  update public.packaging_revisions set proposal_digest=candidate_hash where id=candidate_uuid;
  return jsonb_build_object('revision_id',candidate_uuid,'head_id',head.id,'revision',head.revision+1,'digest',candidate_hash);
end;
$$;
create function private.pi_propose_packaging_revision(
  request_uuid uuid,variant_uuid uuid,requested_slot integer,expected_revision bigint,packaging_copy jsonb,source_uuids uuid[],
  proposal_reason text,head_uuid uuid default null,original_uuid uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare result jsonb; payload jsonb:=jsonb_build_object('variant',variant_uuid,'slot',requested_slot,'revision',expected_revision,
  'copy',packaging_copy,'sources',source_uuids,'reason',proposal_reason,'head',head_uuid,'original',original_uuid);
begin
  perform private.pi_begin_technical_command(array['owner','editor']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('propose_packaging_revision',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_packaging_revision_capability();
  result:=private.pi_append_packaging_revision(variant_uuid,requested_slot,expected_revision,packaging_copy,source_uuids,proposal_reason,head_uuid,original_uuid);
  return private.pi_finish_technical_command('propose_packaging_revision',request_uuid,payload,result);
end;
$$;
create function private.pi_submit_packaging_revision(request_uuid uuid,revision_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.packaging_revisions%rowtype; head public.packaging_revision_heads%rowtype; result jsonb;
  payload jsonb:=jsonb_build_object('candidate',revision_uuid,'revision',expected_revision,'digest',expected_digest);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('submit_packaging_revision',request_uuid,payload);
  if result is not null then return result; end if;
  select * into candidate from public.packaging_revisions where id=revision_uuid;
  if not found then raise exception 'packaging proposal is unavailable.' using errcode='55000'; end if;
  select * into head from public.packaging_revision_heads where id=candidate.head_id for update;
  perform private.pi_check_packaging_source_target(head.product_variant_id,jsonb_build_object('package_description',candidate.package_description,'quantity',candidate.quantity,'quantity_unit',candidate.quantity_unit),head.original_packaging_id);
  if expected_revision is null or head.revision<>expected_revision or candidate.sequence<>head.revision
    or candidate.review_state<>'proposed' or expected_digest is distinct from candidate.proposal_digest
    or expected_digest is distinct from private.pi_packaging_revision_digest(candidate.id) then
    raise exception 'packaging proposal or evidence changed; reload and compare.' using errcode='40001'; end if;
  perform private.pi_packaging_revision_capability();
  update public.packaging_revisions set review_state='pending',submitted_digest=expected_digest where id=candidate.id;
  return private.pi_finish_technical_command('submit_packaging_revision',request_uuid,payload,
    jsonb_build_object('revision_id',candidate.id,'head_id',head.id,'revision',head.revision,'digest',expected_digest));
end;
$$;
create function private.pi_review_packaging_revision(
  request_uuid uuid,revision_uuid uuid,expected_revision bigint,expected_digest text,decision text,review_reason text,
  approved_status public.pi_verification_status,confirmation jsonb,source_uuid uuid,conflict_resolution text,replacement jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.packaging_revisions%rowtype; head public.packaging_revision_heads%rowtype;
  event_uuid uuid:=extensions.gen_random_uuid(); observed_hash text; result jsonb; sources uuid[];
  payload jsonb:=jsonb_build_object('candidate',revision_uuid,'revision',expected_revision,'digest',expected_digest,'decision',decision,
    'reason',review_reason,'status',approved_status,'confirmation',confirmation,'source',source_uuid,'resolution',conflict_resolution,'replacement',replacement);
begin
  perform private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('review_packaging_revision',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_require_review_reason(review_reason);
  if decision is null or decision not in ('APPROVE','EDIT','REJECT') or confirmation is null or jsonb_typeof(confirmation)<>'object'
    or conflict_resolution is null or length(conflict_resolution)>2000 or (decision<>'EDIT' and replacement is not null)
    or (decision='EDIT' and replacement is null) then
    raise exception 'Invalid packaging review fields.' using errcode='22023'; end if;
  select * into candidate from public.packaging_revisions where id=revision_uuid;
  if not found then raise exception 'packaging proposal is unavailable.' using errcode='55000'; end if;
  select * into head from public.packaging_revision_heads where id=candidate.head_id for update;
  perform private.pi_check_packaging_source_target(head.product_variant_id,jsonb_build_object('package_description',candidate.package_description,'quantity',candidate.quantity,'quantity_unit',candidate.quantity_unit),head.original_packaging_id);
  if expected_revision is null or head.revision<>expected_revision or candidate.sequence<>head.revision or candidate.review_state<>'pending'
    or expected_digest is distinct from candidate.proposal_digest or expected_digest is distinct from candidate.submitted_digest then
    raise exception 'Pending packaging proposal or submitted revision changed; reload and compare.' using errcode='40001'; end if;
  observed_hash:=private.pi_packaging_revision_digest(candidate.id);
  if decision='EDIT' then
    if jsonb_typeof(replacement)<>'object' or
      (select array_agg(key order by key) from jsonb_object_keys(replacement) key) is distinct from array['copy','sources']::text[]
      or jsonb_typeof(replacement->'sources')<>'array' or jsonb_array_length(replacement->'sources')>20 then
      raise exception 'Invalid packaging replacement fields.' using errcode='22023'; end if;
    if exists(select 1 from jsonb_array_elements(replacement->'sources') source where jsonb_typeof(source)<>'string'
      or source #>> '{}' !~ '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$') then
      raise exception 'Invalid packaging replacement sources.' using errcode='22023'; end if;
    sources:=array(select (source #>> '{}')::uuid from jsonb_array_elements(replacement->'sources') source);
  end if;
  perform private.pi_packaging_revision_capability();
  insert into public.verification_events(id,entity_type,entity_id,field_key,decision,reason,before_value,after_value,evidence_source_ids,actor_id)
  values(event_uuid,'packaging_revision',candidate.id,'packaging',decision::public.pi_review_decision,btrim(review_reason),
    jsonb_build_object('candidate',to_jsonb(candidate),'digest',expected_digest),
    jsonb_build_object('decision',decision,'digest',expected_digest,'observed_digest',observed_hash,'approved_status',approved_status,
      'confirmation',confirmation,'source_id',source_uuid,'conflict_resolution',conflict_resolution,'replacement',replacement),
    array(select evidence_source_id from public.packaging_revision_evidence where revision_id=candidate.id order by evidence_source_id),auth.uid());
  insert into public.packaging_revision_decisions values(candidate.id,event_uuid,decision::public.pi_review_decision,expected_digest,
    observed_hash,approved_status,confirmation,source_uuid,conflict_resolution,auth.uid(),now());
  update public.packaging_revisions set review_state=case decision when 'APPROVE' then 'approved' when 'REJECT' then 'rejected' else 'superseded' end
    where id=candidate.id;
  if decision='APPROVE' then
    insert into public.packaging_revision_currents values(head.id,candidate.id,auth.uid(),now())
      on conflict(head_id) do update set revision_id=excluded.revision_id,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
  elsif decision='EDIT' then
    result:=private.pi_append_packaging_revision(head.product_variant_id,head.slot,head.revision,replacement->'copy',sources,review_reason,head.id,head.original_packaging_id);
  end if;
  result:=coalesce(result,jsonb_build_object('revision_id',candidate.id,'head_id',head.id,'revision',head.revision))
    || jsonb_build_object('event_id',event_uuid);
  return private.pi_finish_technical_command('review_packaging_revision',request_uuid,payload,result);
end;
$$;

-- Guarded read only. Private commands have no application mutation grants in D2.
create function public.pi_packaging_approval_valid(revision_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select case when private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console()
    then private.pi_packaging_approval_valid(revision_uuid) else false end;
$$;
revoke all on function public.pi_packaging_approval_valid(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_packaging_approval_valid(uuid) to authenticated;
create view public.pi_effective_packaging_records with (security_invoker=true) as
select original.id as packaging_id,null::uuid as head_id,original.product_variant_id,original.id as original_packaging_id,
  null::integer as slot,original.package_description,original.quantity,original.quantity_unit,'legacy'::text as packaging_origin,
  'legacy'::text as review_state,original.verification_status,false as review_valid,false as publication_ready
from public.packaging_records original where original.product_variant_id is not null and not exists(
  select 1 from public.packaging_revision_heads head join public.packaging_revision_currents current on current.head_id=head.id
    where head.original_packaging_id=original.id)
union all
select candidate.id,head.id,head.product_variant_id,head.original_packaging_id,head.slot,candidate.package_description,candidate.quantity,candidate.quantity_unit,
  case when current.revision_id=candidate.id then 'current' else 'open' end,candidate.review_state,
  case when current.revision_id=candidate.id then case when public.pi_packaging_approval_valid(candidate.id)
    then review.approved_status else 'DATA_CONFLICT'::public.pi_verification_status end else candidate.verification_status end,
  public.pi_packaging_approval_valid(candidate.id),false
from public.packaging_revisions candidate join public.packaging_revision_heads head on head.id=candidate.head_id
left join public.packaging_revision_currents current on current.head_id=head.id
left join public.packaging_revision_decisions review on review.revision_id=candidate.id
where current.revision_id=candidate.id or candidate.review_state in ('proposed','pending');
create view public.pi_packaging_readiness with (security_invoker=true) as
select variant.id as product_variant_id,count(packaging.packaging_id)::int as packaging_count,
  count(packaging.packaging_id) filter(where packaging.quantity is null)::int as missing_packaging_quantity_count,
  count(packaging.packaging_id) filter(where packaging.packaging_origin='open')::int as open_packaging_count,
  count(packaging.packaging_id) filter(where packaging.packaging_origin='current' and not packaging.review_valid)::int as invalid_current_packaging_count,
  count(packaging.packaging_id) filter(where packaging.verification_status='DATA_CONFLICT')::int as packaging_conflict_count,
  (count(packaging.packaging_id) filter(where packaging.packaging_origin='open' or packaging.verification_status<>'CONFIRMED'
    or packaging.quantity is null)+(count(packaging.packaging_id)=0)::int)::int as unresolved_packaging_count
from public.product_variants variant left join public.pi_effective_packaging_records packaging on packaging.product_variant_id=variant.id
group by variant.id;
revoke all on public.pi_effective_packaging_records,public.pi_packaging_readiness from public,anon,authenticated,service_role;
grant select on public.pi_effective_packaging_records,public.pi_packaging_readiness to authenticated;

-- Preserve the original twenty-column readiness and nine-metric dashboard contracts.
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
    count(*) filter(where mapping.mapping_origin='current' and not mapping.review_valid) as invalid_current_media_mapping_count
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
    +(coalesce(media.open_media_mapping_count,0)>0)::int+(coalesce(media.invalid_current_media_mapping_count,0)>0)::int
    +(coalesce(oem.unresolved_oem_count,0)>0)::int
    +(coalesce(packaging.unresolved_packaging_count,0)>0)::int) as blocker_count
from public.product_variants variant left join technical on technical.product_variant_id=variant.id
left join compatibility on compatibility.product_variant_id=variant.id left join media on media.product_variant_id=variant.id
left join seo on seo.product_variant_id=variant.id left join public.pi_oem_readiness oem on oem.product_variant_id=variant.id
left join public.pi_packaging_readiness packaging on packaging.product_variant_id=variant.id;
create or replace view public.pi_dashboard_metrics with (security_invoker=true) as
select 'total_products'::text as metric,count(*)::bigint as value from public.product_variants
union all select 'shadow_products',count(*) from public.product_variants where is_shadow
union all select 'verified_products',count(*) from public.pi_variant_readiness variant
  where lifecycle_state='VERIFIED' and not exists(select 1 from public.pi_media_mapping_readiness media
    where media.product_variant_id=variant.id and (media.open_media_mapping_count>0 or media.invalid_current_media_mapping_count>0))
    and not exists(select 1 from public.pi_oem_readiness oem where oem.product_variant_id=variant.id and oem.unresolved_oem_count>0)
    and not exists(select 1 from public.pi_packaging_readiness packaging where packaging.product_variant_id=variant.id and packaging.unresolved_packaging_count>0)
union all select 'ready_for_publish',count(*) from public.pi_variant_readiness where lifecycle_state='READY_FOR_PUBLISH' and blocker_count=0
union all select 'published_products',count(*) from public.product_variants where lifecycle_state='PUBLISHED'
union all select 'needs_factory_confirmation',count(*) from public.pi_effective_technical_values where verification_status='NEEDS_FACTORY_CONFIRMATION'
union all select 'data_conflicts',count(*) from public.pi_effective_technical_values where verification_status='DATA_CONFLICT'
union all select 'missing_eligible_main_images',count(*) from public.pi_variant_readiness where eligible_main_image_count=0
union all select 'unconfirmed_compatibility',count(*) from public.pi_effective_compatibility_relationships where verification_status<>'CONFIRMED';

create function private.pi_guard_current_packaging()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.lifecycle_state in ('VERIFIED','READY_FOR_PUBLISH','QA_PASSED','PUBLISHED') and (
    (not exists(select 1 from public.packaging_records original where original.product_variant_id=new.id)
      and not exists(select 1 from public.packaging_revision_heads head join public.packaging_revision_currents current on current.head_id=head.id
        where head.product_variant_id=new.id))
    or exists(select 1 from public.packaging_revision_heads head join public.packaging_revisions candidate on candidate.head_id=head.id
      left join public.packaging_revision_currents current on current.head_id=head.id where head.product_variant_id=new.id
      and (candidate.review_state in ('proposed','pending') or (current.revision_id=candidate.id and (not private.pi_packaging_approval_valid(candidate.id)
        or candidate.quantity is null or not exists(select 1 from public.packaging_revision_decisions review
          where review.revision_id=candidate.id and review.approved_status='CONFIRMED')))))
    or exists(select 1 from public.packaging_records original where original.product_variant_id=new.id
      and (original.verification_status<>'CONFIRMED' or original.quantity is null) and not exists(
        select 1 from public.packaging_revision_heads head join public.packaging_revision_currents current on current.head_id=head.id
        where head.original_packaging_id=original.id))) then
    raise exception 'Unresolved or invalid packaging review blocks publishable lifecycle states.' using errcode='23514'; end if;
  return new;
end;
$$;
create trigger product_variants_01_packaging_guard before insert or update on public.product_variants
for each row execute function private.pi_guard_current_packaging();
revoke all on all functions in schema private from public,anon,authenticated,service_role;
