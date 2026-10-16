-- Human document review only. No public command, byte attestation or publication permission.
create table public.document_review_heads (
  technical_document_id uuid primary key references public.technical_document_bindings(technical_document_id),
  product_variant_id uuid not null references public.product_variants(id),
  revision bigint not null check (revision>0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.document_review_candidates (
  id uuid primary key,
  technical_document_id uuid not null references public.document_review_heads(technical_document_id),
  predecessor_id uuid references public.document_review_candidates(id),
  sequence bigint not null check (sequence>0),
  scope_note text not null check (length(scope_note) between 1 and 2000),
  evidence_source_ids uuid[] not null,
  original_digest text not null check (original_digest ~ '^[a-f0-9]{64}$'),
  evidence_digest text not null check (evidence_digest ~ '^[a-f0-9]{64}$'),
  proposal_digest text not null check (proposal_digest ~ '^[a-f0-9]{64}$'),
  verification_status public.pi_verification_status not null check
    (verification_status in ('NEEDS_FACTORY_CONFIRMATION','DATA_CONFLICT')),
  reason text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(technical_document_id,sequence)
);
create table public.document_review_submissions (
  candidate_id uuid primary key references public.document_review_candidates(id),
  submitted_digest text not null check (submitted_digest ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.document_review_decisions (
  candidate_id uuid primary key references public.document_review_submissions(candidate_id),
  event_id uuid not null unique references public.verification_events(id),
  decision public.pi_review_decision not null,
  observed_original_digest text check (observed_original_digest ~ '^[a-f0-9]{64}$'),
  observed_evidence_digest text not null check (observed_evidence_digest ~ '^[a-f0-9]{64}$'),
  confirmation jsonb not null,
  rights_source_id uuid references public.document_source_bindings(evidence_source_id),
  scope_source_id uuid references public.document_source_bindings(evidence_source_id),
  conflict_resolution text not null check (length(conflict_resolution)<=2000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.document_review_currents (
  technical_document_id uuid primary key references public.document_review_heads(technical_document_id),
  candidate_id uuid not null unique references public.document_review_decisions(candidate_id),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);
create index document_review_heads_variant_idx on public.document_review_heads(product_variant_id);

do $$ declare name text; begin
  foreach name in array array['document_review_heads','document_review_candidates','document_review_submissions',
    'document_review_decisions','document_review_currents'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('alter table public.%I force row level security',name);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',name);
    execute format('grant select on public.%I to authenticated',name);
    execute format('create policy console_read on public.%I for select to authenticated using (public.pi_can_view_console())',name);
    execute format('create trigger working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()',name);
    execute format('create trigger immutable_document_review_table before truncate on public.%I for each statement execute function public.pi_prevent_immutable_change()',name);
    execute format('create trigger audit_change after insert or update on public.%I for each row execute function public.pi_audit_row_change()',name);
    if name in ('document_review_candidates','document_review_submissions','document_review_decisions') then
      execute format('create trigger immutable_document_review before update or delete on public.%I for each row execute function public.pi_prevent_immutable_change()',name);
    end if;
  end loop;
end $$;

create function private.pi_document_review_original_digest(variant_uuid uuid,document_uuid uuid)
returns text language plpgsql security definer set search_path = '' as $$
begin
  return public.pi_document_original_snapshot(variant_uuid,document_uuid)->>'snapshot_digest';
exception when serialization_failure then return null;
end;
$$;
-- Include ALL known evidence, not only the selected supporting records. Omission cannot hide conflict.
create function private.pi_document_review_evidence_digest(document_uuid uuid)
returns text language sql security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(coalesce(jsonb_agg(jsonb_build_object('binding',to_jsonb(binding),
    'source',to_jsonb(source)) order by binding.evidence_source_id),'[]'::jsonb)::text,'sha256'),'hex')
  from public.document_source_bindings binding join public.evidence_sources source on source.id=binding.evidence_source_id
  where binding.technical_document_id=document_uuid;
$$;

create function private.pi_check_document_review_copy(review_copy jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if review_copy is null or jsonb_typeof(review_copy)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(review_copy) key) is distinct from array['scope_note','sources']::text[]
    or jsonb_typeof(review_copy->'scope_note')<>'string' or length(review_copy->>'scope_note') not between 1 and 2000
    or review_copy->>'scope_note'<>btrim(review_copy->>'scope_note') or review_copy->>'scope_note' ~ '[[:cntrl:]]'
    or regexp_replace(review_copy->>'scope_note','[[:space:]]','','g')=''
    or jsonb_typeof(review_copy->'sources')<>'array' then
    raise exception 'Only bounded document review scope and source selections are permitted.' using errcode='22023'; end if;
  if jsonb_array_length(review_copy->'sources')>20 or exists(
    select 1 from jsonb_array_elements(review_copy->'sources') source where jsonb_typeof(source)<>'string'
      or source #>> '{}' !~ '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$') then
    raise exception 'Invalid document source selections.' using errcode='22023'; end if;
  if (select count(*)<>count(distinct (source #>> '{}')::uuid) from jsonb_array_elements(review_copy->'sources') source) then
    raise exception 'Duplicate document source selections.' using errcode='22023'; end if;
end;
$$;

create function private.pi_document_review_capability()
returns void language sql security definer set search_path = '' as $$
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['document_review_heads','document_review_candidates','document_review_submissions',
      'document_review_decisions','document_review_currents','verification_events']);
$$;

create function private.pi_guard_document_review_head()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='DELETE' then raise exception 'Document review history cannot be deleted.' using errcode='55000'; end if;
  if tg_op='INSERT' then
    if new.revision<>1 or new.created_by is distinct from auth.uid() or not exists(
      select 1 from public.technical_document_bindings where technical_document_id=new.technical_document_id
        and product_variant_id=new.product_variant_id) then
      raise exception 'Invalid document review identity.' using errcode='23514'; end if;
  elsif (to_jsonb(new)-'revision') is distinct from (to_jsonb(old)-'revision') or new.revision<>old.revision+1
    or exists(select 1 from public.document_review_candidates candidate
      join public.document_review_submissions submission on submission.candidate_id=candidate.id
      where candidate.technical_document_id=old.technical_document_id and candidate.sequence=old.revision
        and not exists(select 1 from public.document_review_decisions where candidate_id=candidate.id)) then
    raise exception 'Document scope is immutable; pending review needs a human decision.' using errcode='55000';
  end if;
  return new;
end;
$$;
create trigger exact_document_review_head before insert or update or delete on public.document_review_heads
for each row execute function private.pi_guard_document_review_head();

create function private.pi_guard_document_review_candidate()
returns trigger language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare head public.document_review_heads%rowtype; previous public.document_review_candidates%rowtype;
  source_uuid uuid; dimension text; conflicting boolean;
begin
  select * into head from public.document_review_heads where technical_document_id=new.technical_document_id;
  select * into previous from public.document_review_candidates where technical_document_id=new.technical_document_id
    and sequence=new.sequence-1;
  perform private.pi_require_review_reason(new.reason);
  perform private.pi_check_document_review_copy(jsonb_build_object('scope_note',new.scope_note,'sources',new.evidence_source_ids));
  if coalesce(private.pi_request_jwt_role(),'')<>'authenticated'
    or not public.pi_has_console_role(array['owner','editor','reviewer']::public.pi_console_role[])
    or new.created_by is distinct from auth.uid() or new.created_at is distinct from now()
    or new.sequence is distinct from head.revision or new.predecessor_id is distinct from previous.id
    or new.original_digest is distinct from private.pi_document_review_original_digest(head.product_variant_id,new.technical_document_id)
    or new.evidence_digest is distinct from private.pi_document_review_evidence_digest(new.technical_document_id)
    or new.evidence_source_ids is distinct from array(select unnest(new.evidence_source_ids) order by 1)
    or new.proposal_digest is distinct from encode(extensions.digest((to_jsonb(new)-'proposal_digest')::text,'sha256'),'hex') then
    raise exception 'Document candidate requires exact current scope, evidence and attribution.' using errcode='23514'; end if;
  foreach source_uuid in array new.evidence_source_ids loop
    select binding.dimension into dimension from public.document_source_bindings binding where evidence_source_id=source_uuid;
    if not coalesce(private.pi_document_source_matches(source_uuid,head.product_variant_id,new.technical_document_id,dimension),false) then
      raise exception 'Source does not match this exact document and SKU.' using errcode='22023'; end if;
  end loop;
  conflicting:=exists(select 1 from public.document_source_bindings
    where technical_document_id=new.technical_document_id and assertion='contradicts')
    or previous.verification_status='DATA_CONFLICT';
  if new.verification_status is distinct from (case when coalesce(conflicting,false)
    then 'DATA_CONFLICT'::public.pi_verification_status else 'NEEDS_FACTORY_CONFIRMATION'::public.pi_verification_status end) then
    raise exception 'Known or inherited conflict cannot be silently cleared.' using errcode='23514'; end if;
  return new;
end;
$$;
create trigger exact_document_review_candidate before insert on public.document_review_candidates
for each row execute function private.pi_guard_document_review_candidate();

create function private.pi_append_document_review(variant_uuid uuid,document_uuid uuid,expected_revision bigint,
  review_copy jsonb,proposal_reason text)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare head public.document_review_heads%rowtype; previous public.document_review_candidates%rowtype;
  candidate public.document_review_candidates%rowtype;
begin
  perform private.pi_check_document_review_copy(review_copy);
  perform private.pi_require_review_reason(proposal_reason);
  select * into head from public.document_review_heads where technical_document_id=document_uuid for update;
  if expected_revision is null or expected_revision<>coalesce(head.revision,0) then
    raise exception 'Document review revision changed; reload and compare.' using errcode='40001'; end if;
  if head.technical_document_id is not null and head.product_variant_id<>variant_uuid then
    raise exception 'Document review SKU cannot change.' using errcode='22023'; end if;
  candidate.original_digest:=public.pi_document_original_snapshot(variant_uuid,document_uuid)->>'snapshot_digest';
  select * into previous from public.document_review_candidates where technical_document_id=document_uuid and sequence=head.revision;
  if head.technical_document_id is null then
    insert into public.document_review_heads values(document_uuid,variant_uuid,1,auth.uid(),now());
  else
    update public.document_review_heads set revision=revision+1 where technical_document_id=document_uuid;
  end if;
  candidate.id:=extensions.gen_random_uuid(); candidate.technical_document_id:=document_uuid;
  candidate.predecessor_id:=previous.id; candidate.sequence:=expected_revision+1;
  candidate.scope_note:=review_copy->>'scope_note';
  candidate.evidence_source_ids:=array(select (source #>> '{}')::uuid from jsonb_array_elements(review_copy->'sources') source order by 1);
  candidate.evidence_digest:=private.pi_document_review_evidence_digest(document_uuid);
  candidate.verification_status:=case when previous.verification_status='DATA_CONFLICT' or exists(
    select 1 from public.document_source_bindings where technical_document_id=document_uuid and assertion='contradicts')
    then 'DATA_CONFLICT'::public.pi_verification_status else 'NEEDS_FACTORY_CONFIRMATION'::public.pi_verification_status end;
  candidate.reason:=btrim(proposal_reason); candidate.created_by:=auth.uid(); candidate.created_at:=now();
  candidate.proposal_digest:=encode(extensions.digest((to_jsonb(candidate)-'proposal_digest')::text,'sha256'),'hex');
  insert into public.document_review_candidates select candidate.*;
  return jsonb_build_object('candidate_id',candidate.id,'document_id',document_uuid,'revision',candidate.sequence,'digest',candidate.proposal_digest);
end;
$$;
create function private.pi_propose_document_review(request_uuid uuid,variant_uuid uuid,document_uuid uuid,
  expected_revision bigint,review_copy jsonb,proposal_reason text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; payload jsonb:=jsonb_build_object('variant',variant_uuid,'document',document_uuid,
  'revision',expected_revision,'copy',review_copy,'reason',proposal_reason);
begin
  perform private.pi_begin_technical_command(array['owner','editor']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('propose_document_review',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_document_review_capability();
  result:=private.pi_append_document_review(variant_uuid,document_uuid,expected_revision,review_copy,proposal_reason);
  return private.pi_finish_technical_command('propose_document_review',request_uuid,payload,result);
end;
$$;

create function private.pi_guard_document_review_submission()
returns trigger language plpgsql security definer set search_path = '' as $$
declare candidate public.document_review_candidates%rowtype; head public.document_review_heads%rowtype;
begin
  select * into candidate from public.document_review_candidates where id=new.candidate_id;
  select * into head from public.document_review_heads where technical_document_id=candidate.technical_document_id;
  if coalesce(private.pi_request_jwt_role(),'')<>'authenticated'
    or not public.pi_has_console_role(array['owner','editor','reviewer']::public.pi_console_role[])
    or new.created_by is distinct from auth.uid() or new.created_at is distinct from now()
    or candidate.sequence is distinct from head.revision or new.submitted_digest is distinct from candidate.proposal_digest
    or candidate.original_digest is distinct from private.pi_document_review_original_digest(head.product_variant_id,head.technical_document_id)
    or candidate.evidence_digest is distinct from private.pi_document_review_evidence_digest(head.technical_document_id) then
    raise exception 'Document candidate, original or known evidence changed before submission.' using errcode='40001'; end if;
  return new;
end;
$$;
create trigger exact_document_review_submission before insert on public.document_review_submissions
for each row execute function private.pi_guard_document_review_submission();
create function private.pi_submit_document_review(request_uuid uuid,candidate_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare candidate public.document_review_candidates%rowtype; result jsonb;
  payload jsonb:=jsonb_build_object('candidate',candidate_uuid,'revision',expected_revision,'digest',expected_digest);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('submit_document_review',request_uuid,payload);
  if result is not null then return result; end if;
  select * into candidate from public.document_review_candidates where id=candidate_uuid;
  if not found or expected_revision is distinct from candidate.sequence or expected_digest is distinct from candidate.proposal_digest then
    raise exception 'Document candidate or revision changed.' using errcode='40001'; end if;
  perform 1 from public.document_review_heads where technical_document_id=candidate.technical_document_id for update;
  perform private.pi_document_review_capability();
  insert into public.document_review_submissions values(candidate_uuid,expected_digest,auth.uid(),now());
  return private.pi_finish_technical_command('submit_document_review',request_uuid,payload,
    jsonb_build_object('candidate_id',candidate_uuid,'document_id',candidate.technical_document_id,'revision',candidate.sequence,'digest',expected_digest));
end;
$$;

create function private.pi_document_review_source_selected(candidate_uuid uuid,source_uuid uuid,dimension text)
returns boolean language sql security definer set search_path = '' as $$
  select exists(select 1 from public.document_review_candidates candidate
    join public.document_review_heads head on head.technical_document_id=candidate.technical_document_id
    where candidate.id=candidate_uuid and source_uuid=any(candidate.evidence_source_ids)
      and private.pi_document_source_can_support_review(source_uuid,head.product_variant_id,head.technical_document_id,dimension));
$$;
create function private.pi_guard_document_review_decision()
returns trigger language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.document_review_candidates%rowtype; head public.document_review_heads%rowtype;
  event public.verification_events%rowtype;
begin
  select * into candidate from public.document_review_candidates where id=new.candidate_id;
  select * into head from public.document_review_heads where technical_document_id=candidate.technical_document_id;
  select * into event from public.verification_events where id=new.event_id;
  if coalesce(private.pi_request_jwt_role(),'')<>'authenticated'
    or not public.pi_has_console_role(array['owner','reviewer']::public.pi_console_role[])
    or new.created_by is distinct from auth.uid() or new.created_at is distinct from now()
    or candidate.sequence is distinct from head.revision
    or not exists(select 1 from public.document_review_submissions where candidate_id=candidate.id and submitted_digest=candidate.proposal_digest)
    or new.observed_original_digest is distinct from private.pi_document_review_original_digest(head.product_variant_id,head.technical_document_id)
    or new.observed_evidence_digest is distinct from private.pi_document_review_evidence_digest(head.technical_document_id)
    or event.entity_type is distinct from 'document_review' or event.entity_id is distinct from candidate.id
    or event.field_key is distinct from 'rights_and_scope' or event.decision is distinct from new.decision
    or event.actor_id is distinct from new.created_by or event.created_at is distinct from new.created_at
    or event.before_value is distinct from to_jsonb(candidate) or event.evidence_source_ids is distinct from candidate.evidence_source_ids
    or event.after_value is distinct from jsonb_build_object('decision',new.decision,
      'observed_original_digest',new.observed_original_digest,'observed_evidence_digest',new.observed_evidence_digest,
      'confirmation',new.confirmation,'rights_source_id',new.rights_source_id,'scope_source_id',new.scope_source_id,
      'conflict_resolution',new.conflict_resolution,'replacement',event.after_value->'replacement') then
    raise exception 'Document decision requires the exact submitted snapshot and current reviewer.' using errcode='23514'; end if;
  perform private.pi_require_review_reason(event.reason);
  if new.decision='APPROVE' then
    if new.observed_original_digest is distinct from candidate.original_digest or new.observed_evidence_digest<>candidate.evidence_digest
      or new.confirmation<>jsonb_build_object('original_digest',candidate.original_digest,
        'original_inspected',true,'usage_rights_confirmed',true,'exact_scope_confirmed',true)
      or not private.pi_document_review_source_selected(candidate.id,new.rights_source_id,'usage_rights')
      or not private.pi_document_review_source_selected(candidate.id,new.scope_source_id,'exact_scope')
      or event.after_value->'replacement' is distinct from 'null'::jsonb then
      raise exception 'Document approval requires unchanged evidence and explicit rights/scope declarations.' using errcode='23514'; end if;
    if candidate.verification_status='DATA_CONFLICT' then perform private.pi_require_review_reason(new.conflict_resolution); end if;
  elsif new.confirmation<>'{}'::jsonb or new.rights_source_id is not null or new.scope_source_id is not null or new.conflict_resolution<>'' then
    raise exception 'EDIT and REJECT cannot carry a confirmation.' using errcode='22023';
  end if;
  if new.decision='EDIT' then perform private.pi_check_document_review_copy(event.after_value->'replacement');
  elsif event.after_value->'replacement' is distinct from 'null'::jsonb then
    raise exception 'Only EDIT accepts a replacement.' using errcode='22023'; end if;
  return new;
end;
$$;
create trigger exact_document_review_decision before insert on public.document_review_decisions
for each row execute function private.pi_guard_document_review_decision();

-- Human-evidence validity only, not signed byte observation or publication readiness.
create function private.pi_document_review_approval_valid(candidate_uuid uuid)
returns boolean language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.document_review_candidates%rowtype; head public.document_review_heads%rowtype;
begin
  select * into candidate from public.document_review_candidates where id=candidate_uuid;
  if not found then return false; end if;
  select * into head from public.document_review_heads where technical_document_id=candidate.technical_document_id;
  return candidate.original_digest is not distinct from private.pi_document_review_original_digest(head.product_variant_id,head.technical_document_id)
    and candidate.evidence_digest=private.pi_document_review_evidence_digest(head.technical_document_id)
    and exists(select 1 from public.document_review_decisions review join public.verification_events event on event.id=review.event_id
      join public.document_review_submissions submission on submission.candidate_id=review.candidate_id
      where review.candidate_id=candidate.id and review.decision='APPROVE'
        and submission.submitted_digest=candidate.proposal_digest
        and review.observed_original_digest=candidate.original_digest and review.observed_evidence_digest=candidate.evidence_digest
        and review.confirmation=jsonb_build_object('original_digest',candidate.original_digest,
          'original_inspected',true,'usage_rights_confirmed',true,'exact_scope_confirmed',true)
        and private.pi_document_review_source_selected(candidate.id,review.rights_source_id,'usage_rights')
        and private.pi_document_review_source_selected(candidate.id,review.scope_source_id,'exact_scope')
        and (candidate.verification_status<>'DATA_CONFLICT' or length(regexp_replace(review.conflict_resolution,'[[:space:]]','','g'))>=3)
        and event.entity_type='document_review' and event.entity_id=candidate.id and event.field_key='rights_and_scope'
        and event.actor_id=review.created_by and event.created_at=review.created_at and event.decision='APPROVE'
        and event.before_value=to_jsonb(candidate) and event.evidence_source_ids=candidate.evidence_source_ids
        and event.after_value=jsonb_build_object('decision','APPROVE','observed_original_digest',review.observed_original_digest,
          'observed_evidence_digest',review.observed_evidence_digest,'confirmation',review.confirmation,
          'rights_source_id',review.rights_source_id,'scope_source_id',review.scope_source_id,
          'conflict_resolution',review.conflict_resolution,'replacement',null));
end;
$$;
create function private.pi_guard_document_review_current()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='DELETE' then raise exception 'Document review history cannot be deleted.' using errcode='55000'; end if;
  if coalesce(private.pi_request_jwt_role(),'')<>'authenticated'
    or not public.pi_has_console_role(array['owner','reviewer']::public.pi_console_role[])
    or new.updated_by is distinct from auth.uid() or new.updated_at is distinct from now()
    or (tg_op='UPDATE' and new.technical_document_id<>old.technical_document_id)
    or not exists(select 1 from public.document_review_candidates candidate
      join public.document_review_heads head on head.technical_document_id=candidate.technical_document_id
      join public.document_review_decisions review on review.candidate_id=candidate.id
      where candidate.id=new.candidate_id and candidate.technical_document_id=new.technical_document_id
        and candidate.sequence=head.revision and review.created_by=auth.uid()
        and private.pi_document_review_approval_valid(candidate.id)) then
    raise exception 'Current document pointer requires its exact human approval.' using errcode='23514'; end if;
  return new;
end;
$$;
create trigger exact_document_review_current before insert or update or delete on public.document_review_currents
for each row execute function private.pi_guard_document_review_current();

create function private.pi_review_document(request_uuid uuid,candidate_uuid uuid,expected_revision bigint,expected_digest text,
  decision text,review_reason text,confirmation jsonb,rights_source_uuid uuid,scope_source_uuid uuid,
  conflict_resolution text,replacement jsonb)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.document_review_candidates%rowtype; head public.document_review_heads%rowtype;
  event_uuid uuid:=extensions.gen_random_uuid(); original_hash text; evidence_hash text; result jsonb;
  payload jsonb:=jsonb_build_object('candidate',candidate_uuid,'revision',expected_revision,'digest',expected_digest,
    'decision',decision,'reason',review_reason,'confirmation',confirmation,'rights_source',rights_source_uuid,
    'scope_source',scope_source_uuid,'resolution',conflict_resolution,'replacement',replacement);
begin
  perform private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('review_document',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_require_review_reason(review_reason);
  if decision is null or decision not in ('APPROVE','EDIT','REJECT') or confirmation is null or jsonb_typeof(confirmation)<>'object'
    or conflict_resolution is null or length(conflict_resolution)>2000
    or (decision='EDIT' and replacement is null) or (decision<>'EDIT' and replacement is not null) then
    raise exception 'Invalid document review decision fields.' using errcode='22023'; end if;
  select * into candidate from public.document_review_candidates where id=candidate_uuid;
  if not found then raise exception 'Document candidate is unavailable.' using errcode='40001'; end if;
  select * into head from public.document_review_heads where technical_document_id=candidate.technical_document_id for update;
  if expected_revision is distinct from head.revision or candidate.sequence<>head.revision
    or expected_digest is distinct from candidate.proposal_digest
    or not exists(select 1 from public.document_review_submissions where candidate_id=candidate.id)
    or exists(select 1 from public.document_review_decisions where candidate_id=candidate.id) then
    raise exception 'Pending document review changed; reload and compare.' using errcode='40001'; end if;
  original_hash:=private.pi_document_review_original_digest(head.product_variant_id,head.technical_document_id);
  evidence_hash:=private.pi_document_review_evidence_digest(head.technical_document_id);
  perform private.pi_document_review_capability();
  insert into public.verification_events(id,entity_type,entity_id,field_key,decision,reason,before_value,after_value,evidence_source_ids,actor_id)
  values(event_uuid,'document_review',candidate.id,'rights_and_scope',decision::public.pi_review_decision,btrim(review_reason),to_jsonb(candidate),
    jsonb_build_object('decision',decision,'observed_original_digest',original_hash,'observed_evidence_digest',evidence_hash,
      'confirmation',confirmation,'rights_source_id',rights_source_uuid,'scope_source_id',scope_source_uuid,
      'conflict_resolution',conflict_resolution,'replacement',replacement),candidate.evidence_source_ids,auth.uid());
  insert into public.document_review_decisions values(candidate.id,event_uuid,decision::public.pi_review_decision,
    original_hash,evidence_hash,confirmation,rights_source_uuid,scope_source_uuid,conflict_resolution,auth.uid(),now());
  if decision='APPROVE' then
    insert into public.document_review_currents values(head.technical_document_id,candidate.id,auth.uid(),now())
      on conflict(technical_document_id) do update set candidate_id=excluded.candidate_id,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
  elsif decision='EDIT' then
    result:=private.pi_append_document_review(head.product_variant_id,head.technical_document_id,head.revision,replacement,review_reason);
  end if;
  result:=coalesce(result,jsonb_build_object('candidate_id',candidate.id,'document_id',head.technical_document_id,'revision',head.revision))
    || jsonb_build_object('event_id',event_uuid);
  return private.pi_finish_technical_command('review_document',request_uuid,payload,result);
end;
$$;
revoke all on all functions in schema private from public,anon,authenticated,service_role;
