-- M4-B2: private compatibility revisions and explicit human decisions.
-- No adoption, HTTP command grant or public catalog cutover occurs here.

create table public.compatibility_revision_heads (
  root_relationship_id uuid primary key references public.compatibility_relationships(id),
  subject_entity_id uuid not null references public.compatibility_entities(id),
  target_entity_id uuid not null references public.compatibility_entities(id),
  relationship_type text not null,
  scope_label text not null,
  current_relationship_id uuid references public.compatibility_relationships(id),
  revision bigint not null check (revision >= 0),
  unique(subject_entity_id,target_entity_id,relationship_type,scope_label)
);
create table public.compatibility_revisions (
  relationship_id uuid primary key references public.compatibility_relationships(id),
  root_relationship_id uuid not null references public.compatibility_revision_heads(root_relationship_id),
  predecessor_id uuid references public.compatibility_relationships(id),
  sequence bigint not null check (sequence > 0),
  review_state text not null check (review_state in ('proposed','pending','approved','rejected','superseded')),
  proposal_digest text not null check (proposal_digest ~ '^[a-f0-9]{64}$'),
  submitted_digest text check (submitted_digest ~ '^[a-f0-9]{64}$'),
  reason text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  decision_event_id uuid references public.verification_events(id),
  unique(root_relationship_id,sequence)
);
create unique index compatibility_revisions_one_open on public.compatibility_revisions(root_relationship_id)
  where review_state in ('proposed','pending');
create index compatibility_revision_heads_current_idx on public.compatibility_revision_heads(current_relationship_id)
  where current_relationship_id is not null;
do $$
declare relation_name text;
begin
  foreach relation_name in array array['compatibility_revision_heads','compatibility_revisions'] loop
    execute format('alter table public.%I enable row level security',relation_name);
    execute format('alter table public.%I force row level security',relation_name);
    execute format('revoke all on public.%I from public, anon, authenticated, service_role',relation_name);
    execute format('grant select on public.%I to authenticated',relation_name);
    execute format('create policy console_read on public.%I for select to authenticated using (public.pi_can_view_console())',relation_name);
    execute format('create trigger working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()',relation_name);
    execute format('create trigger audit_change after insert or update on public.%I for each row execute function public.pi_audit_row_change()',relation_name);
  end loop;
end;
$$;

create function private.pi_compatibility_capability()
returns void language sql security definer set search_path = '' as $$
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['compatibility_relationships','compatibility_evidence','compatibility_revision_heads',
      'compatibility_revisions','verification_events']);
$$;

create function private.pi_compatibility_digest(relationship_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(jsonb_build_object('relationship',to_jsonb(relationship),
    'scope',head.scope_label,'subject',private.pi_compatibility_entity_digest(relationship.subject_entity_id),
    'target',private.pi_compatibility_entity_digest(relationship.target_entity_id),
    'evidence',coalesce((select jsonb_agg(jsonb_build_object('link',to_jsonb(link),
      'source',to_jsonb(source),'binding',to_jsonb(binding)) order by link.evidence_source_id)
      from public.compatibility_evidence link join public.evidence_sources source on source.id=link.evidence_source_id
      left join public.compatibility_source_bindings binding on binding.evidence_source_id=source.id
      where link.compatibility_relationship_id=relationship.id),'[]'::jsonb))::text,'sha256'),'hex')
  from public.compatibility_relationships relationship
  join public.compatibility_revisions revision on revision.relationship_id=relationship.id
  join public.compatibility_revision_heads head on head.root_relationship_id=revision.root_relationship_id
  where relationship.id=relationship_uuid;
$$;

-- The caller owns the authority/role locks and transaction capability.
create function private.pi_append_compatibility_proposal(
  root_uuid uuid, subject_uuid uuid, target_uuid uuid, relation_type text, scope_label text,
  expected_revision bigint, relation_copy jsonb, evidence_links jsonb, proposal_reason text
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare
  head public.compatibility_revision_heads%rowtype; baseline public.compatibility_relationships%rowtype;
  source public.evidence_sources%rowtype; binding public.compatibility_source_bindings%rowtype;
  candidate_uuid uuid := extensions.gen_random_uuid(); link jsonb; requirement jsonb; source_uuid uuid;
  candidate_digest text; conflicting boolean := false; has_reference boolean := false;
  level public.pi_source_level := 'D'; status public.pi_verification_status := 'NEEDS_FACTORY_CONFIRMATION';
begin
  perform private.pi_require_review_reason(proposal_reason);
  if expected_revision is null or expected_revision < 0 or relation_copy is null or jsonb_typeof(relation_copy) <> 'object'
    or (select array_agg(key order by key) from jsonb_object_keys(relation_copy) key) is distinct from
      array['confirmation_requirements','role']::text[]
    or jsonb_typeof(relation_copy -> 'role') <> 'string'
    or jsonb_typeof(relation_copy -> 'confirmation_requirements') <> 'array'
    or evidence_links is null or jsonb_typeof(evidence_links) <> 'array'
  then raise exception 'Invalid compatibility proposal fields.' using errcode='22023'; end if;
  perform private.pi_check_compatibility_target(subject_uuid,target_uuid,relation_type,scope_label,relation_copy ->> 'role');
  if jsonb_array_length(relation_copy -> 'confirmation_requirements') not between 1 and 20
    or jsonb_array_length(evidence_links) > 20 then
    raise exception 'Bounded confirmation requirements and evidence are required.' using errcode='22023';
  end if;
  for requirement in select * from jsonb_array_elements(relation_copy -> 'confirmation_requirements') loop
    if jsonb_typeof(requirement) <> 'string' or length(requirement #>> '{}') > 500
      or regexp_replace(requirement #>> '{}','[[:space:]]','','g') = '' then
      raise exception 'Invalid confirmation requirement.' using errcode='22023';
    end if;
  end loop;
  if root_uuid is not null then
    select * into head from public.compatibility_revision_heads where root_relationship_id=root_uuid;
    if not found then
      select * into baseline from public.compatibility_relationships where id=root_uuid;
      if not found or exists(select 1 from public.compatibility_revisions where relationship_id=root_uuid)
        or baseline.subject_entity_id <> subject_uuid or baseline.target_entity_id <> target_uuid
        or baseline.relationship_type <> relation_type then
        raise exception 'The original compatibility relationship does not match.' using errcode='22023';
      end if;
      head.root_relationship_id := root_uuid; head.current_relationship_id := root_uuid; head.revision := 0;
      head.subject_entity_id := subject_uuid; head.target_entity_id := target_uuid;
      head.relationship_type := relation_type; head.scope_label := scope_label;
    end if;
    if head.subject_entity_id <> subject_uuid or head.target_entity_id <> target_uuid
      or head.relationship_type <> relation_type or head.scope_label <> scope_label then
      raise exception 'Compatibility revision scope cannot change.' using errcode='22023';
    end if;
  else
    if exists(select 1 from public.compatibility_revision_heads where subject_entity_id=subject_uuid
      and target_entity_id=target_uuid and relationship_type=relation_type
      and compatibility_revision_heads.scope_label=pi_append_compatibility_proposal.scope_label) then
      raise exception 'A working relationship already exists; reload its revision.' using errcode='40001';
    end if;
    if exists(select 1 from public.compatibility_relationships relationship
      where subject_entity_id=subject_uuid and target_entity_id=target_uuid and relationship_type=relation_type
      and not exists(select 1 from public.compatibility_revisions where relationship_id=relationship.id)
      and not exists(select 1 from public.compatibility_revision_heads where root_relationship_id=relationship.id)) then
      raise exception 'Select the original relationship explicitly before proposing a revision.' using errcode='55000';
    end if;
    head.root_relationship_id := candidate_uuid; head.revision := 0;
  end if;
  if head.revision <> expected_revision then raise exception 'Compatibility revision changed; reload and compare.' using errcode='40001'; end if;
  if exists(select 1 from public.compatibility_revisions where root_relationship_id=head.root_relationship_id and review_state='pending') then
    raise exception 'Pending compatibility needs an explicit edit or rejection.' using errcode='55000';
  end if;
  if exists(select 1 from public.compatibility_revisions revision join public.compatibility_relationships relationship
    on relationship.id=revision.relationship_id where revision.root_relationship_id=head.root_relationship_id
    and revision.review_state='proposed' and relationship.verification_status='DATA_CONFLICT') then
    raise exception 'A conflicting proposal needs an explicit human decision.' using errcode='55000';
  end if;
  select * into baseline from public.compatibility_relationships where id=head.current_relationship_id;
  conflicting := found and (baseline.verification_status='DATA_CONFLICT' or baseline.role <> relation_copy ->> 'role');
  conflicting := conflicting or exists(select 1 from public.compatibility_revisions revision
    join public.compatibility_relationships relationship on relationship.id=revision.relationship_id
    join public.verification_events event on event.id=revision.decision_event_id
    where revision.root_relationship_id=head.root_relationship_id and relationship.verification_status='DATA_CONFLICT'
      and event.decision='EDIT' and revision.sequence=(select max(sequence) from public.compatibility_revisions
        where root_relationship_id=head.root_relationship_id));
  for link in select * from jsonb_array_elements(evidence_links) loop
    if jsonb_typeof(link) <> 'object' or (select array_agg(key order by key) from jsonb_object_keys(link) key)
      is distinct from array['role','source_id']::text[] or jsonb_typeof(link -> 'source_id') <> 'string'
      or (link ->> 'source_id') !~ '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
      or coalesce(link ->> 'role','') not in ('supporting','conflicting') then
      raise exception 'Invalid compatibility evidence link.' using errcode='22023';
    end if;
    source_uuid := (link ->> 'source_id')::uuid;
    select * into source from public.evidence_sources where id=source_uuid;
    if not found then raise exception 'Evidence source is unavailable.' using errcode='22023'; end if;
    select * into binding from public.compatibility_source_bindings where evidence_source_id=source_uuid;
    if found and not private.pi_compatibility_source_matches(source_uuid,subject_uuid,target_uuid,relation_type,scope_label,relation_copy ->> 'role') then
      raise exception 'Compatibility source endpoints, scope or revision do not match.' using errcode='22023';
    end if;
    if exists(select 1 from public.technical_source_bindings where evidence_source_id=source_uuid) then
      raise exception 'A technical-field binding is not relationship evidence.' using errcode='22023';
    end if;
    conflicting := conflicting or link ->> 'role'='conflicting' or coalesce(binding.assertion='contradicts',false);
    if link ->> 'role'='supporting' and coalesce(binding.assertion,'supports') <> 'contradicts' then
      has_reference := true;
      if source.source_level < level then level := source.source_level; end if;
    end if;
  end loop;
  if (select count(*) <> count(distinct (element ->> 'source_id')::uuid) from jsonb_array_elements(evidence_links) element) then
    raise exception 'Evidence links must be unique.' using errcode='22023';
  end if;
  if conflicting then status := 'DATA_CONFLICT';
  elsif level in ('B','C') and exists(select 1 from jsonb_array_elements(evidence_links) element
    join public.compatibility_source_bindings bound on bound.evidence_source_id=(element ->> 'source_id')::uuid
    where element ->> 'role'='supporting' and bound.assertion in ('supports','catalog_grouping')
      and bound.source_kind=(case level when 'B' then 'official_manufacturer' else 'technical_standard' end)) then
    status := case level when 'B' then 'OEM_REFERENCE'::public.pi_verification_status else 'STANDARD_REFERENCE'::public.pi_verification_status end;
  end if;
  insert into public.compatibility_relationships(id,external_key,subject_entity_id,target_entity_id,relationship_type,
    role,relationship_status,source_type,source_level,verification_status,confirmation_requirements)
  values(candidate_uuid,'working-relationship:' || candidate_uuid,subject_uuid,target_uuid,relation_type,
    relation_copy ->> 'role',case when has_reference and not conflicting then 'reference_only' else 'unverified' end,
    'human_proposal',level,status,array(select jsonb_array_elements_text(relation_copy -> 'confirmation_requirements')));
  insert into public.compatibility_evidence(compatibility_relationship_id,evidence_source_id,evidence_role)
    select candidate_uuid,(element ->> 'source_id')::uuid,element ->> 'role' from jsonb_array_elements(evidence_links) element;
  insert into public.compatibility_revision_heads values(head.root_relationship_id,subject_uuid,target_uuid,relation_type,
    scope_label,head.current_relationship_id,head.revision+1)
    on conflict(root_relationship_id) do update set revision=excluded.revision;
  update public.compatibility_revisions set review_state='superseded'
    where root_relationship_id=head.root_relationship_id and review_state='proposed';
  insert into public.compatibility_revisions(relationship_id,root_relationship_id,predecessor_id,sequence,review_state,
    proposal_digest,reason,created_by)
  values(candidate_uuid,head.root_relationship_id,coalesce((select relationship_id from public.compatibility_revisions
    where root_relationship_id=head.root_relationship_id order by sequence desc limit 1),head.current_relationship_id),
    head.revision+1,'proposed',repeat('0',64),btrim(proposal_reason),auth.uid());
  candidate_digest := private.pi_compatibility_digest(candidate_uuid);
  update public.compatibility_revisions set proposal_digest=candidate_digest where relationship_id=candidate_uuid;
  return jsonb_build_object('relationship_id',candidate_uuid,'root_relationship_id',head.root_relationship_id,
    'revision',head.revision+1,'digest',candidate_digest);
end;
$$;

create function private.pi_propose_compatibility_revision(
  request_uuid uuid, root_uuid uuid, subject_uuid uuid, target_uuid uuid, relation_type text, scope_label text,
  expected_revision bigint, relation_copy jsonb, evidence_links jsonb, proposal_reason text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; payload jsonb := jsonb_build_object('root',root_uuid,'subject',subject_uuid,'target',target_uuid,
  'type',relation_type,'scope',scope_label,'revision',expected_revision,'copy',relation_copy,'evidence',evidence_links,'reason',proposal_reason);
begin
  perform private.pi_begin_technical_command(array['owner','editor']::public.pi_console_role[]);
  result := private.pi_draft_receipt('propose_compatibility_revision',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_compatibility_capability();
  result := private.pi_append_compatibility_proposal(root_uuid,subject_uuid,target_uuid,relation_type,scope_label,
    expected_revision,relation_copy,evidence_links,proposal_reason);
  return private.pi_finish_technical_command('propose_compatibility_revision',request_uuid,payload,result);
end;
$$;

create function private.pi_check_compatibility_revision(relationship_uuid uuid, expected_revision bigint, expected_digest text, required_state text)
returns public.compatibility_revisions language plpgsql security definer set search_path = '' as $$
declare candidate public.compatibility_revisions%rowtype; head public.compatibility_revision_heads%rowtype;
begin
  select * into candidate from public.compatibility_revisions where relationship_id=relationship_uuid;
  if not found then raise exception 'Compatibility candidate is unavailable.' using errcode='55000'; end if;
  select * into head from public.compatibility_revision_heads where root_relationship_id=candidate.root_relationship_id;
  perform private.pi_check_compatibility_target(head.subject_entity_id,head.target_entity_id,head.relationship_type,head.scope_label,
    (select role from public.compatibility_relationships where id=relationship_uuid));
  if expected_revision is null or head.revision <> expected_revision or candidate.review_state <> required_state
    or expected_digest is distinct from candidate.proposal_digest
    or expected_digest is distinct from private.pi_compatibility_digest(relationship_uuid)
    or (required_state='pending' and candidate.submitted_digest is distinct from expected_digest) then
    raise exception 'Compatibility value, evidence or review revision changed; reload and compare.' using errcode='40001';
  end if;
  return candidate;
end;
$$;

create function private.pi_submit_compatibility_review(request_uuid uuid, relationship_uuid uuid, expected_revision bigint, expected_digest text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare candidate public.compatibility_revisions%rowtype; result jsonb;
  payload jsonb := jsonb_build_object('relationship',relationship_uuid,'revision',expected_revision,'digest',expected_digest);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  result := private.pi_draft_receipt('submit_compatibility_review',request_uuid,payload);
  if result is not null then return result; end if;
  candidate := private.pi_check_compatibility_revision(relationship_uuid,expected_revision,expected_digest,'proposed');
  perform private.pi_compatibility_capability();
  update public.compatibility_revisions set review_state='pending',submitted_digest=expected_digest where relationship_id=relationship_uuid;
  update public.compatibility_revision_heads set revision=revision+1 where root_relationship_id=candidate.root_relationship_id;
  return private.pi_finish_technical_command('submit_compatibility_review',request_uuid,payload,
    jsonb_build_object('relationship_id',relationship_uuid,'revision',expected_revision+1,'digest',expected_digest));
end;
$$;

create function private.pi_review_compatibility_revision(
  request_uuid uuid, relationship_uuid uuid, expected_revision bigint, expected_digest text,
  decision text, review_reason text, conflict_resolution text, replacement_copy jsonb, replacement_evidence jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare candidate public.compatibility_revisions%rowtype; head public.compatibility_revision_heads%rowtype;
  relationship public.compatibility_relationships%rowtype; event_uuid uuid := extensions.gen_random_uuid(); result jsonb;
  payload jsonb := jsonb_build_object('relationship',relationship_uuid,'revision',expected_revision,'digest',expected_digest,
    'decision',decision,'reason',review_reason,'resolution',conflict_resolution,'replacement',replacement_copy,'evidence',replacement_evidence);
begin
  perform private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  perform private.pi_require_review_reason(review_reason);
  if decision is null or decision not in ('APPROVE','EDIT','REJECT')
    or (decision <> 'EDIT' and (replacement_copy is not null or replacement_evidence is not null))
    or conflict_resolution is null or length(conflict_resolution)>2000 then
    raise exception 'Invalid compatibility review decision fields.' using errcode='22023';
  end if;
  result := private.pi_draft_receipt('review_compatibility_revision',request_uuid,payload);
  if result is not null then return result; end if;
  candidate := private.pi_check_compatibility_revision(relationship_uuid,expected_revision,expected_digest,'pending');
  select * into head from public.compatibility_revision_heads where root_relationship_id=candidate.root_relationship_id;
  select * into relationship from public.compatibility_relationships where id=relationship_uuid;
  if decision='APPROVE' then
    if not exists(select 1 from public.compatibility_evidence link where compatibility_relationship_id=relationship_uuid
      and evidence_role='supporting' and private.pi_compatibility_source_can_support_confirmation(evidence_source_id,
        head.subject_entity_id,head.target_entity_id,head.relationship_type,head.scope_label,relationship.role)) then
      raise exception 'Approval requires immutable exact-relationship Level A supporting evidence.' using errcode='23514';
    end if;
    if relationship.verification_status='DATA_CONFLICT' then perform private.pi_require_review_reason(conflict_resolution); end if;
  end if;
  perform private.pi_compatibility_capability();
  insert into public.verification_events(id,entity_type,entity_id,field_key,decision,reason,before_value,after_value,evidence_source_ids,actor_id)
  values(event_uuid,'compatibility_relationship',relationship_uuid,head.relationship_type,decision::public.pi_review_decision,
    btrim(review_reason),jsonb_build_object('candidate',to_jsonb(relationship),'current_relationship_id',head.current_relationship_id,
      'revision',expected_revision,'digest',expected_digest,'scope',head.scope_label),
    jsonb_build_object('decision',decision,'digest',expected_digest,'conflict_resolution',btrim(conflict_resolution),
      'replacement_copy',replacement_copy,'replacement_evidence',replacement_evidence),
    array(select evidence_source_id from public.compatibility_evidence where compatibility_relationship_id=relationship_uuid order by evidence_source_id),auth.uid());
  update public.compatibility_revisions set review_state=case decision when 'APPROVE' then 'approved' when 'EDIT' then 'superseded' else 'rejected' end,
    decision_event_id=event_uuid where relationship_id=relationship_uuid;
  if decision='APPROVE' then
    update public.compatibility_relationships set relationship_status='confirmed',verification_status='CONFIRMED',
      source_level='A',buyer_confirmation_required=false where id=relationship_uuid;
    update public.compatibility_revision_heads set current_relationship_id=relationship_uuid,revision=revision+1
      where root_relationship_id=candidate.root_relationship_id;
  elsif decision='EDIT' then
    result := private.pi_append_compatibility_proposal(head.root_relationship_id,head.subject_entity_id,head.target_entity_id,
      head.relationship_type,head.scope_label,expected_revision,replacement_copy,replacement_evidence,review_reason);
  else
    update public.compatibility_revision_heads set revision=revision+1 where root_relationship_id=candidate.root_relationship_id;
  end if;
  result := coalesce(result,jsonb_build_object('relationship_id',relationship_uuid,'revision',expected_revision+1))
    || jsonb_build_object('event_id',event_uuid);
  return private.pi_finish_technical_command('review_compatibility_revision',request_uuid,payload,result);
end;
$$;

create function private.pi_guard_exact_compatibility_approval()
returns trigger language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
begin
  if new.verification_status='CONFIRMED' and old.verification_status <> 'CONFIRMED'
    and exists(select 1 from private.pi_working_authority_control where adoption_id is not null)
    and ((to_jsonb(new)-array['relationship_status','verification_status','source_level','buyer_confirmation_required','confirmed_by','confirmed_at','updated_at'])
      is distinct from (to_jsonb(old)-array['relationship_status','verification_status','source_level','buyer_confirmation_required','confirmed_by','confirmed_at','updated_at'])
    or not exists(select 1 from public.compatibility_revisions candidate
      join public.verification_events event on event.id=candidate.decision_event_id
      where candidate.relationship_id=old.id and candidate.review_state='approved'
        and candidate.submitted_digest=private.pi_compatibility_digest(old.id)
        and candidate.submitted_digest=candidate.proposal_digest
        and event.entity_type='compatibility_relationship' and event.entity_id=old.id
        and event.decision='APPROVE' and event.actor_id=auth.uid()
        and event.before_value ->> 'digest'=candidate.submitted_digest
        and event.after_value ->> 'digest'=candidate.submitted_digest
        and event.before_value -> 'candidate'=to_jsonb(old)
        and event.evidence_source_ids=array(select evidence_source_id from public.compatibility_evidence
          where compatibility_relationship_id=old.id order by evidence_source_id))
    or not exists(select 1 from public.compatibility_revisions candidate
      join public.compatibility_revision_heads head on head.root_relationship_id=candidate.root_relationship_id
      join public.compatibility_evidence link on link.compatibility_relationship_id=candidate.relationship_id
      where candidate.relationship_id=old.id and link.evidence_role='supporting'
        and private.pi_compatibility_source_can_support_confirmation(link.evidence_source_id,
          head.subject_entity_id,head.target_entity_id,head.relationship_type,head.scope_label,old.role))) then
    raise exception 'Compatibility confirmation requires the exact submitted revision and APPROVE event.' using errcode='23514';
  end if;
  return new;
end;
$$;
create trigger compatibility_exact_approval_guard before update on public.compatibility_relationships
for each row execute function private.pi_guard_exact_compatibility_approval();

create view public.pi_effective_compatibility_relationships with (security_invoker=true) as
select relationship.* from public.compatibility_relationships relationship
left join public.compatibility_revision_heads root on root.root_relationship_id=relationship.id
left join public.compatibility_revisions candidate on candidate.relationship_id=relationship.id
where (candidate.relationship_id is null and (root.root_relationship_id is null or root.current_relationship_id=relationship.id))
  or candidate.review_state in ('proposed','pending')
  or exists(select 1 from public.compatibility_revision_heads head where head.current_relationship_id=relationship.id);
revoke all on public.pi_effective_compatibility_relationships from public, anon, authenticated, service_role;
grant select on public.pi_effective_compatibility_relationships to authenticated;

-- Readiness uses only current and open revisions; historical approvals cannot mask an open proposal.
create or replace view public.pi_variant_readiness
with (security_invoker = true)
as
with technical as (
  select
    product_variant_id,
    count(*) as technical_value_count,
    count(*) filter (where verification_status = 'CONFIRMED') as confirmed_technical_count,
    count(*) filter (where verification_status = 'DATA_CONFLICT') as technical_conflict_count,
    count(*) filter (
      where verification_status in ('NEEDS_FACTORY_CONFIRMATION', 'DATA_CONFLICT')
        or exists (select 1 from public.technical_revisions candidate
          where candidate.value_id = pi_effective_technical_values.id and candidate.review_state in ('proposed','pending'))
    ) as unresolved_technical_count
  from public.pi_effective_technical_values
  where product_variant_id is not null
  group by product_variant_id
), compatibility as (
  select
    entity.product_variant_id,
    count(relationship.id) as compatibility_count,
    count(relationship.id) filter (
      where relationship.verification_status = 'CONFIRMED'
    ) as confirmed_compatibility_count,
    count(relationship.id) filter (
      where relationship.verification_status = 'DATA_CONFLICT'
    ) as compatibility_conflict_count
  from public.compatibility_entities as entity
  left join public.pi_effective_compatibility_relationships as relationship
    on relationship.subject_entity_id = entity.id
  where entity.product_variant_id is not null
  group by entity.product_variant_id
), media as (
  select
    mapping.product_variant_id,
    count(asset.id) as media_count,
    count(asset.id) filter (
      where mapping.role = 'main'
        and asset.publication_status = 'search_eligible'
        and asset.usage_rights_status = 'approved'
        and asset.content_match_status = 'exact_product'
    ) as eligible_main_image_count,
    count(asset.id) filter (
      where mapping.role = 'main' and asset.publication_status = 'legacy_reference'
    ) as legacy_main_image_count
  from public.product_media as mapping
  join public.media_assets as asset on asset.id = mapping.media_asset_id
  group by mapping.product_variant_id
), seo as (
  select
    product_variant_id,
    count(*) as seo_record_count,
    count(*) filter (where publication_status in ('approved', 'published')) as approved_seo_count
  from public.seo_records
  where product_variant_id is not null
  group by product_variant_id
)
select
  variant.id,
  variant.sku,
  variant.public_slug,
  variant.lifecycle_state,
  variant.is_shadow,
  variant.legacy_status,
  variant.legacy_data_status,
  coalesce(technical.technical_value_count, 0)::integer as technical_value_count,
  coalesce(technical.confirmed_technical_count, 0)::integer as confirmed_technical_count,
  coalesce(technical.technical_conflict_count, 0)::integer as technical_conflict_count,
  coalesce(technical.unresolved_technical_count, 0)::integer as unresolved_technical_count,
  coalesce(compatibility.compatibility_count, 0)::integer as compatibility_count,
  coalesce(compatibility.confirmed_compatibility_count, 0)::integer
    as confirmed_compatibility_count,
  coalesce(compatibility.compatibility_conflict_count, 0)::integer
    as compatibility_conflict_count,
  coalesce(media.media_count, 0)::integer as media_count,
  coalesce(media.eligible_main_image_count, 0)::integer as eligible_main_image_count,
  coalesce(media.legacy_main_image_count, 0)::integer as legacy_main_image_count,
  coalesce(seo.seo_record_count, 0)::integer as seo_record_count,
  coalesce(seo.approved_seo_count, 0)::integer as approved_seo_count,
  (
    (variant.legacy_data_status <> 'confirmed')::integer
    + (coalesce(technical.confirmed_technical_count, 0) = 0)::integer
    + (coalesce(technical.unresolved_technical_count, 0) > 0)::integer
    + (coalesce(compatibility.compatibility_conflict_count, 0) > 0)::integer
    + (
      coalesce(compatibility.compatibility_count, 0)
        > coalesce(compatibility.confirmed_compatibility_count, 0)
    )::integer
    + (coalesce(media.eligible_main_image_count, 0) = 0)::integer
    + (coalesce(seo.approved_seo_count, 0) = 0)::integer
  ) as blocker_count
from public.product_variants as variant
left join technical on technical.product_variant_id = variant.id
left join compatibility on compatibility.product_variant_id = variant.id
left join media on media.product_variant_id = variant.id
left join seo on seo.product_variant_id = variant.id;

create or replace view public.pi_dashboard_metrics
with (security_invoker = true)
as
select 'total_products'::text as metric, count(*)::bigint as value from public.product_variants
union all
select 'shadow_products', count(*) from public.product_variants where is_shadow
union all
select 'verified_products', count(*) from public.product_variants where lifecycle_state = 'VERIFIED'
union all
select 'ready_for_publish', count(*)
  from public.product_variants where lifecycle_state = 'READY_FOR_PUBLISH'
union all
select 'published_products', count(*) from public.product_variants where lifecycle_state = 'PUBLISHED'
union all
select 'needs_factory_confirmation', count(*)
  from public.pi_effective_technical_values where verification_status = 'NEEDS_FACTORY_CONFIRMATION'
union all
select 'data_conflicts', count(*)
  from public.pi_effective_technical_values where verification_status = 'DATA_CONFLICT'
union all
select 'missing_eligible_main_images', count(*)
  from public.pi_variant_readiness where eligible_main_image_count = 0
union all
select 'unconfirmed_compatibility', count(*)
  from public.pi_effective_compatibility_relationships where verification_status <> 'CONFIRMED';

create or replace function private.pi_guard_product_variant_readiness()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  product_type_value text;
  readiness_blockers integer;
begin
  if tg_op = 'INSERT' then
    if not new.is_shadow and new.lifecycle_state <> 'DRAFT' then
      raise exception 'A non-shadow product variant must begin in DRAFT.' using errcode = '23514';
    end if;
    return new;
  end if;

  if new.lifecycle_state is not distinct from old.lifecycle_state then
    return new;
  end if;

  if new.lifecycle_state = 'VERIFIED' then
    if not private.pi_has_approval_event('product_variant', new.id, old.updated_at) then
      raise exception 'VERIFIED requires a new human approve/edit event for the variant.'
        using errcode = '23514';
    end if;
    if exists (
      select 1 from public.pi_effective_technical_values
      where product_variant_id = new.id and verification_status = 'DATA_CONFLICT'
    ) or exists (
      select 1
      from public.compatibility_entities as entity
      join public.pi_effective_compatibility_relationships as relationship
        on relationship.subject_entity_id = entity.id
      where entity.product_variant_id = new.id
        and relationship.verification_status = 'DATA_CONFLICT'
    ) then
      raise exception 'A variant with unresolved data conflicts cannot be VERIFIED.'
        using errcode = '23514';
    end if;

    if exists (
      select 1 from public.compatibility_revisions revision
      join public.compatibility_revision_heads head on head.root_relationship_id=revision.root_relationship_id
      join public.compatibility_entities entity on entity.id=head.subject_entity_id
      where entity.product_variant_id=new.id and revision.review_state in ('proposed','pending')
    ) then
      raise exception 'Open compatibility proposals must be reviewed before VERIFIED.' using errcode='23514';
    end if;

    select product.product_type into product_type_value
    from public.products as product
    where product.id = new.product_id;

    if not exists (
      select 1
      from public.technical_field_definitions as field
      where field.is_critical
        and (
          cardinality(field.applies_to) = 0
          or 'product_variant' = any(field.applies_to)
          or product_type_value = any(field.applies_to)
        )
    ) then
      raise exception 'VERIFIED requires at least one applicable critical field definition.'
        using errcode = '23514';
    end if;

    if exists (
      select 1
      from public.technical_field_definitions as field
      where field.is_critical
        and (
          cardinality(field.applies_to) = 0
          or 'product_variant' = any(field.applies_to)
          or product_type_value = any(field.applies_to)
        )
        and not exists (
          select 1
          from public.pi_effective_technical_values as value
          where value.product_variant_id = new.id
            and value.field_definition_id = field.id
            and value.verification_status = 'CONFIRMED'
        )
    ) then
      raise exception 'VERIFIED requires every applicable critical field to be confirmed.'
        using errcode = '23514';
    end if;
    if exists (
      select 1 from public.pi_effective_technical_values value
      join public.technical_field_definitions field on field.id = value.field_definition_id
      where value.product_variant_id = new.id and field.is_critical and value.verification_status <> 'CONFIRMED'
    ) then
      raise exception 'Every known critical-field scope must be confirmed before VERIFIED.' using errcode = '23514';
    end if;
  elsif new.lifecycle_state = 'READY_FOR_PUBLISH' then
    select blocker_count into readiness_blockers
    from public.pi_variant_readiness
    where id = new.id;
    if readiness_blockers is null or readiness_blockers > 0 then
      raise exception 'READY_FOR_PUBLISH requires zero readiness blockers.' using errcode = '23514';
    end if;
  elsif new.lifecycle_state = 'QA_PASSED' then
    if not exists (
      select 1
      from public.release_items as item
      join public.release_candidates as candidate on candidate.id = item.release_candidate_id
      where item.entity_type = 'product_variant'
        and item.entity_key = new.sku
        and item.blocker_count = 0
        and candidate.status in ('PASS', 'PASS_WITH_WARNINGS', 'APPROVED', 'PUBLISHED')
        and not exists (
          select 1 from public.release_qa_results as result
          where result.release_candidate_id = candidate.id
            and result.qa_run_id = candidate.current_qa_run_id
            and result.result = 'BLOCKED'
        )
    ) then
      raise exception 'QA_PASSED requires a non-blocking release QA record for this SKU.'
        using errcode = '23514';
    end if;
  elsif new.lifecycle_state = 'PUBLISHED' then
    if not exists (
      select 1
      from public.release_items as item
      join public.release_candidates as candidate on candidate.id = item.release_candidate_id
      join public.publish_records as publication on publication.release_candidate_id = candidate.id
      where item.entity_type = 'product_variant'
        and item.entity_key = new.sku
        and candidate.status = 'PUBLISHED'
    ) then
      raise exception 'PUBLISHED requires a completed publish record for this SKU.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;


revoke all on all functions in schema private from public, anon, authenticated, service_role;
