-- M4-C2: frozen human OEM decisions. Designations never imply compatibility or publication.
create table public.oem_revision_heads (
  id uuid primary key,
  product_variant_id uuid not null references public.product_variants(id),
  slot integer not null check (slot between 0 and 99),
  source_oem_reference_id uuid unique references public.oem_references(id),
  revision bigint not null check (revision>0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(product_variant_id,slot)
);
create table public.oem_revisions (
  id uuid primary key,
  head_id uuid not null references public.oem_revision_heads(id),
  predecessor_id uuid references public.oem_revisions(id),
  sequence bigint not null check (sequence>0),
  manufacturer_name text not null,
  reference_number text not null,
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
  check (length(manufacturer_name) between 1 and 120 and manufacturer_name=btrim(manufacturer_name)
    and manufacturer_name !~ '[[:cntrl:]]' and regexp_replace(manufacturer_name,'[[:space:]]','','g')<>''
    and length(reference_number) between 1 and 100 and reference_number=btrim(reference_number)
    and reference_number !~ '[[:cntrl:]]' and regexp_replace(reference_number,'[[:space:]]','','g')<>'')
);
create unique index oem_one_open on public.oem_revisions(head_id) where review_state in ('proposed','pending');
create table public.oem_revision_evidence (
  revision_id uuid not null references public.oem_revisions(id),
  evidence_source_id uuid not null references public.oem_source_bindings(evidence_source_id),
  primary key(revision_id,evidence_source_id)
);
create table public.oem_revision_decisions (
  revision_id uuid primary key references public.oem_revisions(id),
  event_id uuid not null unique references public.verification_events(id),
  decision public.pi_review_decision not null,
  submitted_digest text not null check (submitted_digest ~ '^[a-f0-9]{64}$'),
  observed_digest text not null check (observed_digest ~ '^[a-f0-9]{64}$'),
  approved_status public.pi_verification_status check (approved_status in ('CONFIRMED','OEM_REFERENCE')),
  confirmation jsonb not null,
  source_id uuid references public.oem_source_bindings(evidence_source_id),
  conflict_resolution text not null check (length(conflict_resolution)<=2000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.oem_revision_currents (
  head_id uuid primary key references public.oem_revision_heads(id),
  revision_id uuid not null unique references public.oem_revisions(id),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);
do $$ declare name text; begin
  foreach name in array array['oem_revision_heads','oem_revisions','oem_revision_evidence',
    'oem_revision_decisions','oem_revision_currents'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('alter table public.%I force row level security',name);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',name);
    execute format('grant select on public.%I to authenticated',name);
    execute format('create policy console_read on public.%I for select to authenticated using (public.pi_can_view_console())',name);
    execute format('create trigger working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()',name);
    execute format('create trigger immutable_oem_table before truncate on public.%I for each statement execute function public.pi_prevent_immutable_change()',name);
    execute format('create trigger audit_change after insert or update on public.%I for each row execute function public.pi_audit_row_change()',name);
  end loop;
end $$;
create trigger immutable_oem_evidence before update or delete on public.oem_revision_evidence
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_oem_decision before update or delete on public.oem_revision_decisions
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_oem_current before delete on public.oem_revision_currents
for each row execute function public.pi_prevent_immutable_change();

create function private.pi_oem_original_digest(original_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(to_jsonb(original)::text,'sha256'),'hex')
  from public.oem_references original where id=original_uuid;
$$;
create function private.pi_oem_revision_digest(revision_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(jsonb_build_object('head',to_jsonb(head)-'revision',
    'revision',to_jsonb(candidate)-array['review_state','proposal_digest','submitted_digest'],
    'variant',private.pi_oem_variant_digest(head.product_variant_id),
    'original',private.pi_oem_original_digest(head.source_oem_reference_id),
    'evidence',coalesce((select jsonb_agg(jsonb_build_object('binding',to_jsonb(binding),'source',to_jsonb(source))
      order by source.id) from public.oem_revision_evidence link
      join public.oem_source_bindings binding on binding.evidence_source_id=link.evidence_source_id
      join public.evidence_sources source on source.id=binding.evidence_source_id
      where link.revision_id=candidate.id),'[]'::jsonb),
    'known_conflicts',coalesce((select jsonb_agg(to_jsonb(binding) order by binding.evidence_source_id)
      from public.oem_source_bindings binding where binding.product_variant_id=head.product_variant_id
        and binding.manufacturer_name=candidate.manufacturer_name and binding.reference_number=candidate.reference_number
        and binding.assertion='contradicts'),'[]'::jsonb))::text,'sha256'),'hex')
  from public.oem_revisions candidate join public.oem_revision_heads head on head.id=candidate.head_id
  where candidate.id=revision_uuid;
$$;
create function private.pi_oem_review_source_selected(revision_uuid uuid,source_uuid uuid,approved_status public.pi_verification_status)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.oem_revisions candidate
    join public.oem_revision_heads head on head.id=candidate.head_id
    join public.oem_revision_evidence link on link.revision_id=candidate.id
    join public.oem_source_bindings binding on binding.evidence_source_id=link.evidence_source_id
    join public.evidence_sources source on source.id=binding.evidence_source_id
    where candidate.id=revision_uuid and link.evidence_source_id=source_uuid
      and private.pi_oem_source_matches(source_uuid,head.product_variant_id,candidate.manufacturer_name,candidate.reference_number)
      and ((approved_status='CONFIRMED' and private.pi_oem_source_can_support_review(source_uuid,
        head.product_variant_id,candidate.manufacturer_name,candidate.reference_number))
        or (approved_status='OEM_REFERENCE' and source.source_level='B' and source.exact_subject
          and binding.source_kind='official_manufacturer' and binding.evidence_basis='manufacturer_catalog'
          and binding.assertion in ('supports','reference_only'))));
$$;
create function private.pi_oem_approval_valid(revision_uuid uuid)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists(select 1 from public.oem_revisions candidate
    join public.oem_revision_heads head on head.id=candidate.head_id
    join public.oem_revision_decisions review on review.revision_id=candidate.id
    join public.verification_events event on event.id=review.event_id
    where candidate.id=revision_uuid and candidate.review_state in ('pending','approved') and review.decision='APPROVE'
      and candidate.submitted_digest=candidate.proposal_digest and review.submitted_digest=candidate.submitted_digest
      and review.observed_digest=private.pi_oem_revision_digest(candidate.id)
      and review.observed_digest=review.submitted_digest
      and candidate.original_digest is not distinct from private.pi_oem_original_digest(head.source_oem_reference_id)
      and review.confirmation=jsonb_build_object('source_checked',true,'reference_checked',true,
        'compatibility_not_asserted',true,'arcfort_reference_confirmed',review.approved_status='CONFIRMED')
      and private.pi_oem_review_source_selected(candidate.id,review.source_id,review.approved_status)
      and (candidate.verification_status<>'DATA_CONFLICT'
        or length(regexp_replace(review.conflict_resolution,'[[:space:]]','','g'))>=3)
      and event.entity_type='oem_revision' and event.entity_id=candidate.id and event.field_key='reference_number'
      and event.decision='APPROVE' and event.actor_id=review.created_by and event.created_at=review.created_at
      and event.before_value=jsonb_build_object('candidate',jsonb_set(to_jsonb(candidate),'{review_state}','"pending"'),
        'digest',review.submitted_digest)
      and event.after_value=jsonb_build_object('decision','APPROVE','digest',review.submitted_digest,
        'observed_digest',review.observed_digest,'approved_status',review.approved_status,'confirmation',review.confirmation,
        'source_id',review.source_id,'conflict_resolution',review.conflict_resolution,'replacement',null)
      and event.evidence_source_ids=array(select evidence_source_id from public.oem_revision_evidence
        where revision_id=candidate.id order by evidence_source_id));
$$;
create function private.pi_guard_oem_decision()
returns trigger language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.oem_revisions%rowtype; head public.oem_revision_heads%rowtype;
  event public.verification_events%rowtype;
begin
  select * into candidate from public.oem_revisions where id=new.revision_id;
  select * into head from public.oem_revision_heads where id=candidate.head_id;
  select * into event from public.verification_events where id=new.event_id;
  perform private.pi_require_review_reason(event.reason);
  if not public.pi_has_console_role(array['owner','reviewer']::public.pi_console_role[])
    or coalesce(private.pi_request_jwt_role(),'')<>'authenticated' or new.created_by is distinct from auth.uid()
    or candidate.review_state is distinct from 'pending' or candidate.sequence is distinct from head.revision
    or new.submitted_digest is distinct from candidate.proposal_digest
    or new.submitted_digest is distinct from candidate.submitted_digest
    or new.observed_digest is distinct from private.pi_oem_revision_digest(candidate.id)
    or event.entity_type is distinct from 'oem_revision' or event.entity_id is distinct from candidate.id
    or event.field_key is distinct from 'reference_number' or event.decision is distinct from new.decision
    or event.actor_id is distinct from auth.uid() or event.created_at is distinct from new.created_at
    or event.before_value is distinct from jsonb_build_object('candidate',to_jsonb(candidate),'digest',new.submitted_digest)
    or event.after_value is distinct from jsonb_build_object('decision',new.decision,'digest',new.submitted_digest,
      'observed_digest',new.observed_digest,'approved_status',new.approved_status,'confirmation',new.confirmation,
      'source_id',new.source_id,'conflict_resolution',new.conflict_resolution,'replacement',event.after_value->'replacement')
    or event.evidence_source_ids is distinct from array(select evidence_source_id from public.oem_revision_evidence
      where revision_id=candidate.id order by evidence_source_id) then
    raise exception 'OEM decision requires the exact pending snapshot and current human actor.' using errcode='23514';
  end if;
  if new.decision='APPROVE' then
    if new.approved_status is null or new.observed_digest<>new.submitted_digest
      or new.confirmation<>jsonb_build_object('source_checked',true,'reference_checked',true,
        'compatibility_not_asserted',true,'arcfort_reference_confirmed',new.approved_status='CONFIRMED')
      or not private.pi_oem_review_source_selected(candidate.id,new.source_id,new.approved_status)
      or event.after_value->'replacement' is distinct from 'null'::jsonb
      or (candidate.verification_status='DATA_CONFLICT'
        and length(regexp_replace(new.conflict_resolution,'[[:space:]]','','g'))<3) then
      raise exception 'OEM approval requires explicit human review, qualifying exact evidence and conflict resolution.' using errcode='23514';
    end if;
  elsif new.approved_status is not null or new.confirmation<>'{}'::jsonb or new.source_id is not null
    or new.conflict_resolution<>'' then
    raise exception 'EDIT or REJECT cannot manufacture an OEM confirmation.' using errcode='22023';
  end if;
  return new;
end;
$$;
create trigger exact_oem_decision before insert on public.oem_revision_decisions
for each row execute function private.pi_guard_oem_decision();
create function private.pi_guard_oem_head()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='DELETE' or (to_jsonb(new)-'revision') is distinct from (to_jsonb(old)-'revision')
    or new.revision<>old.revision+1 then
    raise exception 'OEM scope is immutable and revisions must advance once.' using errcode='55000'; end if;
  return new;
end;
$$;
create trigger immutable_oem_head before update or delete on public.oem_revision_heads
for each row execute function private.pi_guard_oem_head();
create function private.pi_guard_oem_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='UPDATE' and old.proposal_digest=repeat('0',64) and old.review_state='proposed'
    and old.created_by=auth.uid() and new.proposal_digest=private.pi_oem_revision_digest(old.id)
    and (to_jsonb(new)-'proposal_digest')=(to_jsonb(old)-'proposal_digest') then return new; end if;
  if tg_op='DELETE' or (to_jsonb(new)-array['review_state','submitted_digest']) is distinct from
    (to_jsonb(old)-array['review_state','submitted_digest']) then
    raise exception 'OEM content is immutable; append a new proposal.' using errcode='55000'; end if;
  if old.review_state='pending' and new.submitted_digest=old.submitted_digest and exists(
    select 1 from public.oem_revision_decisions review join public.verification_events event on event.id=review.event_id
    where review.revision_id=old.id and review.created_by=auth.uid() and event.actor_id=auth.uid()
      and event.before_value->'candidate'=to_jsonb(old)
      and new.review_state=case review.decision when 'APPROVE' then 'approved' when 'REJECT' then 'rejected' else 'superseded' end
      and (review.decision<>'APPROVE' or private.pi_oem_approval_valid(old.id))) then return new; end if;
  if old.review_state<>'proposed' or new.review_state not in ('pending','superseded')
    or (new.review_state='pending' and (new.submitted_digest is distinct from old.proposal_digest
      or new.submitted_digest is distinct from private.pi_oem_revision_digest(old.id)))
    or (new.review_state='superseded' and (new.submitted_digest is distinct from old.submitted_digest
      or old.verification_status='DATA_CONFLICT')) then
    raise exception 'Invalid OEM submission or supersession.' using errcode='40001'; end if;
  return new;
end;
$$;
create trigger immutable_oem_revision before update or delete on public.oem_revisions
for each row execute function private.pi_guard_oem_revision();
create function private.pi_guard_oem_current()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(private.pi_request_jwt_role(),'')<>'authenticated'
    or not public.pi_has_console_role(array['owner','reviewer']::public.pi_console_role[])
    or (tg_op='UPDATE' and new.head_id is distinct from old.head_id) or new.updated_by is distinct from auth.uid()
    or new.updated_at is distinct from now() or not exists(
      select 1 from public.oem_revisions candidate join public.oem_revision_heads head on head.id=candidate.head_id
      join public.oem_revision_decisions review on review.revision_id=candidate.id
      where candidate.id=new.revision_id and candidate.head_id=new.head_id and candidate.sequence=head.revision
        and candidate.review_state='approved' and review.created_by=auth.uid()
        and private.pi_oem_approval_valid(candidate.id)) then
    raise exception 'Current OEM reference requires an exact current APPROVE decision.' using errcode='23514'; end if;
  return new;
end;
$$;
create trigger exact_oem_current before insert or update on public.oem_revision_currents
for each row execute function private.pi_guard_oem_current();
create function private.pi_oem_revision_capability()
returns void language sql security definer set search_path = '' as $$
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['oem_revision_heads','oem_revisions','oem_revision_evidence','oem_revision_decisions','oem_revision_currents','verification_events']);
$$;
create function private.pi_guard_oem_evidence_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.oem_revisions candidate
    join public.oem_revision_heads head on head.id=candidate.head_id where candidate.id=new.revision_id
      and candidate.review_state='proposed' and candidate.proposal_digest=repeat('0',64)
      and candidate.sequence=head.revision and candidate.created_by=auth.uid()
      and private.pi_oem_source_matches(new.evidence_source_id,head.product_variant_id,
        candidate.manufacturer_name,candidate.reference_number)) then
    raise exception 'OEM evidence can only bind during creation of an exact unfrozen proposal.' using errcode='55000'; end if;
  return new;
end;
$$;
create trigger exact_oem_evidence before insert on public.oem_revision_evidence
for each row execute function private.pi_guard_oem_evidence_insert();
create function private.pi_append_oem_revision(
  variant_uuid uuid,requested_slot integer,expected_revision bigint,reference_copy jsonb,source_uuids uuid[],
  proposal_reason text,head_uuid uuid default null,original_uuid uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare head public.oem_revision_heads%rowtype; previous public.oem_revisions%rowtype;
  candidate_uuid uuid:=extensions.gen_random_uuid(); source_uuid uuid; conflicting boolean; candidate_hash text;
begin
  perform private.pi_require_review_reason(proposal_reason);
  if reference_copy is null or jsonb_typeof(reference_copy)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(reference_copy) key) is distinct from
      array['manufacturer_name','reference_number']::text[]
    or jsonb_typeof(reference_copy->'manufacturer_name')<>'string' or jsonb_typeof(reference_copy->'reference_number')<>'string'
    or requested_slot is null or requested_slot not between 0 and 99 or expected_revision is null or expected_revision<0
    or source_uuids is null or cardinality(source_uuids)>20 or coalesce(array_ndims(source_uuids),1)<>1
    or exists(select 1 from unnest(source_uuids) source where source is null)
    or (select count(*)<>count(distinct source) from unnest(source_uuids) source) then
    raise exception 'Invalid OEM copy, slot, revision or evidence.' using errcode='22023'; end if;
  perform private.pi_check_oem_source_target(variant_uuid,reference_copy->>'manufacturer_name',reference_copy->>'reference_number');
  if head_uuid is null then
    if expected_revision<>0 or exists(select 1 from public.oem_revision_heads
      where product_variant_id=variant_uuid and slot=requested_slot) then
      raise exception 'An OEM slot already exists or its revision changed.' using errcode='40001'; end if;
    if original_uuid is not null and not exists(select 1 from public.oem_references
      where id=original_uuid and product_variant_id=variant_uuid) then
      raise exception 'OEM lineage must belong to this exact SKU.' using errcode='22023'; end if;
    if exists(select 1 from public.oem_references original where original.product_variant_id=variant_uuid
      and original.manufacturer_name=reference_copy->>'manufacturer_name' and original.reference_number=reference_copy->>'reference_number'
      and original.id is distinct from original_uuid) then
      raise exception 'An existing OEM reference requires explicit original lineage.' using errcode='22023'; end if;
    head.id:=extensions.gen_random_uuid(); head.revision:=0; head.source_oem_reference_id:=original_uuid;
  else
    select * into head from public.oem_revision_heads where id=head_uuid for update;
    if not found or head.product_variant_id<>variant_uuid or head.slot<>requested_slot
      or head.source_oem_reference_id is distinct from original_uuid then
      raise exception 'OEM scope and original lineage cannot change.' using errcode='22023'; end if;
    if head.revision<>expected_revision then raise exception 'OEM revision changed; reload and compare.' using errcode='40001'; end if;
    select * into previous from public.oem_revisions where head_id=head.id and sequence=head.revision;
    if previous.review_state='pending' or (previous.review_state='proposed' and previous.verification_status='DATA_CONFLICT') then
      raise exception 'Pending or conflicting OEM proposals need an explicit human decision.' using errcode='55000'; end if;
  end if;
  if exists(select 1 from public.oem_revisions candidate join public.oem_revision_heads other on other.id=candidate.head_id
    left join public.oem_revision_currents current on current.head_id=other.id
    where other.product_variant_id=variant_uuid and other.id<>head.id
      and candidate.manufacturer_name=reference_copy->>'manufacturer_name' and candidate.reference_number=reference_copy->>'reference_number'
      and (candidate.review_state in ('proposed','pending') or current.revision_id=candidate.id)) then
    raise exception 'This exact OEM designation already has an open or current slot.' using errcode='22023'; end if;
  foreach source_uuid in array source_uuids loop
    if not private.pi_oem_source_matches(source_uuid,variant_uuid,reference_copy->>'manufacturer_name',reference_copy->>'reference_number') then
      raise exception 'OEM evidence does not match this exact SKU, manufacturer or number.' using errcode='22023'; end if;
    perform 1 from public.evidence_sources where id=source_uuid for share;
  end loop;
  conflicting:=exists(select 1 from public.oem_source_bindings where product_variant_id=variant_uuid
    and manufacturer_name=reference_copy->>'manufacturer_name' and reference_number=reference_copy->>'reference_number' and assertion='contradicts')
    or exists(select 1 from public.oem_references where id=original_uuid and verification_status='DATA_CONFLICT')
    or (previous.verification_status='DATA_CONFLICT' and exists(select 1 from public.oem_revision_decisions
      where revision_id=previous.id and decision='EDIT'));
  if head_uuid is null then
    insert into public.oem_revision_heads values(head.id,variant_uuid,requested_slot,original_uuid,1,auth.uid(),now());
  else
    if previous.review_state='proposed' then update public.oem_revisions set review_state='superseded' where id=previous.id; end if;
    update public.oem_revision_heads set revision=revision+1 where id=head.id;
  end if;
  insert into public.oem_revisions(id,head_id,predecessor_id,sequence,manufacturer_name,reference_number,variant_digest,
    original_digest,verification_status,review_state,proposal_digest,reason,created_by)
  values(candidate_uuid,head.id,previous.id,head.revision+1,reference_copy->>'manufacturer_name',reference_copy->>'reference_number',
    private.pi_oem_variant_digest(variant_uuid),private.pi_oem_original_digest(original_uuid),
    case when coalesce(conflicting,false) then 'DATA_CONFLICT'::public.pi_verification_status else 'NEEDS_FACTORY_CONFIRMATION' end,
    'proposed',repeat('0',64),btrim(proposal_reason),auth.uid());
  insert into public.oem_revision_evidence select candidate_uuid,source from unnest(source_uuids) source;
  candidate_hash:=private.pi_oem_revision_digest(candidate_uuid);
  update public.oem_revisions set proposal_digest=candidate_hash where id=candidate_uuid;
  return jsonb_build_object('revision_id',candidate_uuid,'head_id',head.id,'revision',head.revision+1,'digest',candidate_hash);
end;
$$;
create function private.pi_propose_oem_revision(
  request_uuid uuid,variant_uuid uuid,requested_slot integer,expected_revision bigint,reference_copy jsonb,source_uuids uuid[],
  proposal_reason text,head_uuid uuid default null,original_uuid uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare result jsonb; payload jsonb:=jsonb_build_object('variant',variant_uuid,'slot',requested_slot,'revision',expected_revision,
  'copy',reference_copy,'sources',source_uuids,'reason',proposal_reason,'head',head_uuid,'original',original_uuid);
begin
  perform private.pi_begin_technical_command(array['owner','editor']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('propose_oem_revision',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_oem_revision_capability();
  result:=private.pi_append_oem_revision(variant_uuid,requested_slot,expected_revision,reference_copy,source_uuids,proposal_reason,head_uuid,original_uuid);
  return private.pi_finish_technical_command('propose_oem_revision',request_uuid,payload,result);
end;
$$;
create function private.pi_submit_oem_revision(request_uuid uuid,revision_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.oem_revisions%rowtype; head public.oem_revision_heads%rowtype; result jsonb;
  payload jsonb:=jsonb_build_object('candidate',revision_uuid,'revision',expected_revision,'digest',expected_digest);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('submit_oem_revision',request_uuid,payload);
  if result is not null then return result; end if;
  select * into candidate from public.oem_revisions where id=revision_uuid;
  if not found then raise exception 'OEM proposal is unavailable.' using errcode='55000'; end if;
  select * into head from public.oem_revision_heads where id=candidate.head_id for update;
  perform private.pi_check_oem_source_target(head.product_variant_id,candidate.manufacturer_name,candidate.reference_number);
  if expected_revision is null or head.revision<>expected_revision or candidate.sequence<>head.revision
    or candidate.review_state<>'proposed' or expected_digest is distinct from candidate.proposal_digest
    or expected_digest is distinct from private.pi_oem_revision_digest(candidate.id) then
    raise exception 'OEM proposal or evidence changed; reload and compare.' using errcode='40001'; end if;
  perform private.pi_oem_revision_capability();
  update public.oem_revisions set review_state='pending',submitted_digest=expected_digest where id=candidate.id;
  return private.pi_finish_technical_command('submit_oem_revision',request_uuid,payload,
    jsonb_build_object('revision_id',candidate.id,'head_id',head.id,'revision',head.revision,'digest',expected_digest));
end;
$$;
create function private.pi_review_oem_revision(
  request_uuid uuid,revision_uuid uuid,expected_revision bigint,expected_digest text,decision text,review_reason text,
  approved_status public.pi_verification_status,confirmation jsonb,source_uuid uuid,conflict_resolution text,replacement jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.oem_revisions%rowtype; head public.oem_revision_heads%rowtype;
  event_uuid uuid:=extensions.gen_random_uuid(); observed_hash text; result jsonb; sources uuid[];
  payload jsonb:=jsonb_build_object('candidate',revision_uuid,'revision',expected_revision,'digest',expected_digest,'decision',decision,
    'reason',review_reason,'status',approved_status,'confirmation',confirmation,'source',source_uuid,'resolution',conflict_resolution,'replacement',replacement);
begin
  perform private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('review_oem_revision',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_require_review_reason(review_reason);
  if decision is null or decision not in ('APPROVE','EDIT','REJECT') or confirmation is null or jsonb_typeof(confirmation)<>'object'
    or conflict_resolution is null or length(conflict_resolution)>2000 or (decision<>'EDIT' and replacement is not null)
    or (decision='EDIT' and replacement is null) then
    raise exception 'Invalid OEM review fields.' using errcode='22023'; end if;
  select * into candidate from public.oem_revisions where id=revision_uuid;
  if not found then raise exception 'OEM proposal is unavailable.' using errcode='55000'; end if;
  select * into head from public.oem_revision_heads where id=candidate.head_id for update;
  perform private.pi_check_oem_source_target(head.product_variant_id,candidate.manufacturer_name,candidate.reference_number);
  if expected_revision is null or head.revision<>expected_revision or candidate.sequence<>head.revision or candidate.review_state<>'pending'
    or expected_digest is distinct from candidate.proposal_digest or expected_digest is distinct from candidate.submitted_digest then
    raise exception 'Pending OEM proposal or submitted revision changed; reload and compare.' using errcode='40001'; end if;
  observed_hash:=private.pi_oem_revision_digest(candidate.id);
  if decision='EDIT' then
    if jsonb_typeof(replacement)<>'object' or
      (select array_agg(key order by key) from jsonb_object_keys(replacement) key) is distinct from array['copy','sources']::text[]
      or jsonb_typeof(replacement->'sources')<>'array' or jsonb_array_length(replacement->'sources')>20 then
      raise exception 'Invalid OEM replacement fields.' using errcode='22023'; end if;
    if exists(select 1 from jsonb_array_elements(replacement->'sources') source where jsonb_typeof(source)<>'string'
      or source #>> '{}' !~ '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$') then
      raise exception 'Invalid OEM replacement sources.' using errcode='22023'; end if;
    sources:=array(select (source #>> '{}')::uuid from jsonb_array_elements(replacement->'sources') source);
  end if;
  perform private.pi_oem_revision_capability();
  insert into public.verification_events(id,entity_type,entity_id,field_key,decision,reason,before_value,after_value,evidence_source_ids,actor_id)
  values(event_uuid,'oem_revision',candidate.id,'reference_number',decision::public.pi_review_decision,btrim(review_reason),
    jsonb_build_object('candidate',to_jsonb(candidate),'digest',expected_digest),
    jsonb_build_object('decision',decision,'digest',expected_digest,'observed_digest',observed_hash,'approved_status',approved_status,
      'confirmation',confirmation,'source_id',source_uuid,'conflict_resolution',conflict_resolution,'replacement',replacement),
    array(select evidence_source_id from public.oem_revision_evidence where revision_id=candidate.id order by evidence_source_id),auth.uid());
  insert into public.oem_revision_decisions values(candidate.id,event_uuid,decision::public.pi_review_decision,expected_digest,
    observed_hash,approved_status,confirmation,source_uuid,conflict_resolution,auth.uid(),now());
  update public.oem_revisions set review_state=case decision when 'APPROVE' then 'approved' when 'REJECT' then 'rejected' else 'superseded' end
    where id=candidate.id;
  if decision='APPROVE' then
    insert into public.oem_revision_currents values(head.id,candidate.id,auth.uid(),now())
      on conflict(head_id) do update set revision_id=excluded.revision_id,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
  elsif decision='EDIT' then
    result:=private.pi_append_oem_revision(head.product_variant_id,head.slot,head.revision,replacement->'copy',sources,review_reason,head.id,head.source_oem_reference_id);
  end if;
  result:=coalesce(result,jsonb_build_object('revision_id',candidate.id,'head_id',head.id,'revision',head.revision))
    || jsonb_build_object('event_id',event_uuid);
  return private.pi_finish_technical_command('review_oem_revision',request_uuid,payload,result);
end;
$$;

-- Guarded read only. Private commands have no application mutation grants in C2.
create function public.pi_oem_approval_valid(revision_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select case when private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console()
    then private.pi_oem_approval_valid(revision_uuid) else false end;
$$;
revoke all on function public.pi_oem_approval_valid(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_oem_approval_valid(uuid) to authenticated;
create view public.pi_effective_oem_references with (security_invoker=true) as
select original.id as reference_id,null::uuid as head_id,original.product_variant_id,original.id as source_oem_reference_id,
  null::integer as slot,original.manufacturer_name,original.reference_number,'legacy'::text as reference_origin,
  'legacy'::text as review_state,original.verification_status,false as review_valid,false as publication_ready
from public.oem_references original where original.product_variant_id is not null and not exists(
  select 1 from public.oem_revision_heads head join public.oem_revision_currents current on current.head_id=head.id
    where head.source_oem_reference_id=original.id)
union all
select candidate.id,head.id,head.product_variant_id,head.source_oem_reference_id,head.slot,candidate.manufacturer_name,candidate.reference_number,
  case when current.revision_id=candidate.id then 'current' else 'open' end,candidate.review_state,
  case when current.revision_id=candidate.id then case when public.pi_oem_approval_valid(candidate.id)
    then review.approved_status else 'DATA_CONFLICT'::public.pi_verification_status end else candidate.verification_status end,
  public.pi_oem_approval_valid(candidate.id),false
from public.oem_revisions candidate join public.oem_revision_heads head on head.id=candidate.head_id
left join public.oem_revision_currents current on current.head_id=head.id
left join public.oem_revision_decisions review on review.revision_id=candidate.id
where current.revision_id=candidate.id or candidate.review_state in ('proposed','pending');
create view public.pi_oem_readiness with (security_invoker=true) as
select product_variant_id,count(*) filter(where reference_origin='open')::int as open_oem_count,
  count(*) filter(where reference_origin='current' and not review_valid)::int as invalid_current_oem_count,
  count(*) filter(where verification_status='DATA_CONFLICT')::int as oem_conflict_count,
  count(*) filter(where reference_origin='open' or verification_status in ('NEEDS_FACTORY_CONFIRMATION','DATA_CONFLICT'))::int as unresolved_oem_count
from public.pi_effective_oem_references group by product_variant_id;
revoke all on public.pi_effective_oem_references,public.pi_oem_readiness from public,anon,authenticated,service_role;
grant select on public.pi_effective_oem_references,public.pi_oem_readiness to authenticated;

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
    +(coalesce(oem.unresolved_oem_count,0)>0)::int) as blocker_count
from public.product_variants variant left join technical on technical.product_variant_id=variant.id
left join compatibility on compatibility.product_variant_id=variant.id left join media on media.product_variant_id=variant.id
left join seo on seo.product_variant_id=variant.id left join public.pi_oem_readiness oem on oem.product_variant_id=variant.id;
create or replace view public.pi_dashboard_metrics with (security_invoker=true) as
select 'total_products'::text as metric,count(*)::bigint as value from public.product_variants
union all select 'shadow_products',count(*) from public.product_variants where is_shadow
union all select 'verified_products',count(*) from public.pi_variant_readiness variant
  where lifecycle_state='VERIFIED' and not exists(select 1 from public.pi_media_mapping_readiness media
    where media.product_variant_id=variant.id and (media.open_media_mapping_count>0 or media.invalid_current_media_mapping_count>0))
    and not exists(select 1 from public.pi_oem_readiness oem where oem.product_variant_id=variant.id and oem.unresolved_oem_count>0)
union all select 'ready_for_publish',count(*) from public.pi_variant_readiness where lifecycle_state='READY_FOR_PUBLISH' and blocker_count=0
union all select 'published_products',count(*) from public.product_variants where lifecycle_state='PUBLISHED'
union all select 'needs_factory_confirmation',count(*) from public.pi_effective_technical_values where verification_status='NEEDS_FACTORY_CONFIRMATION'
union all select 'data_conflicts',count(*) from public.pi_effective_technical_values where verification_status='DATA_CONFLICT'
union all select 'missing_eligible_main_images',count(*) from public.pi_variant_readiness where eligible_main_image_count=0
union all select 'unconfirmed_compatibility',count(*) from public.pi_effective_compatibility_relationships where verification_status<>'CONFIRMED';

create function private.pi_guard_current_oem()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.lifecycle_state in ('VERIFIED','READY_FOR_PUBLISH','QA_PASSED','PUBLISHED') and (
    exists(select 1 from public.oem_revision_heads head join public.oem_revisions candidate on candidate.head_id=head.id
      left join public.oem_revision_currents current on current.head_id=head.id where head.product_variant_id=new.id
      and (candidate.review_state in ('proposed','pending') or (current.revision_id=candidate.id and not private.pi_oem_approval_valid(candidate.id))))
    or exists(select 1 from public.oem_references original where original.product_variant_id=new.id
      and original.verification_status in ('NEEDS_FACTORY_CONFIRMATION','DATA_CONFLICT') and not exists(
        select 1 from public.oem_revision_heads head join public.oem_revision_currents current on current.head_id=head.id
        where head.source_oem_reference_id=original.id))) then
    raise exception 'Unresolved or invalid OEM review blocks publishable lifecycle states.' using errcode='23514'; end if;
  return new;
end;
$$;
create trigger product_variants_01_oem_guard before insert or update on public.product_variants
for each row execute function private.pi_guard_current_oem();
revoke all on all functions in schema private from public,anon,authenticated,service_role;
