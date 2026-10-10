-- Human verification, release integrity and lifecycle publication guards.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public;

alter table public.verification_events
  add constraint verification_events_reason_check check (length(btrim(reason)) > 0);

alter table public.release_candidates
  add column current_qa_run_id uuid;

alter table public.release_qa_results
  add column qa_run_id uuid not null;

alter table public.release_qa_results
  add constraint release_qa_results_run_check
    unique (release_candidate_id, qa_run_id, check_name);

create or replace function private.pi_actor_has_role(
  required_roles public.pi_console_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and public.pi_has_console_role(required_roles);
$$;

create or replace function private.pi_is_controlled_service_job()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.pi_request_jwt_role(), '') = 'service_role'
    or session_user = 'postgres';
$$;

create or replace function private.pi_evidence_source_qualifies(source_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.evidence_sources as source
    where source.id = source_id
      and source.source_level = 'A'
      and source.exact_subject
      and (
        source.raw_snapshot @> '{"evidence_basis":["factory_confirmation"]}'::jsonb
        or source.raw_snapshot @> '{"evidence_basis":["factory_specification"]}'::jsonb
        or source.raw_snapshot @> '{"evidence_basis":["drawing"]}'::jsonb
        or source.raw_snapshot @> '{"evidence_basis":["approved_sample"]}'::jsonb
        or source.raw_snapshot @> '{"evidence_basis":["verified_reference_number"]}'::jsonb
        or source.raw_snapshot @> '{"evidence_basis":["confirmed_dimensions"]}'::jsonb
        or source.raw_snapshot @> '{"evidence_basis":["measurement_record"]}'::jsonb
        or source.raw_snapshot @> '{"evidence_basis":["packaging_record"]}'::jsonb
      )
  );
$$;

create or replace function private.pi_has_approval_event(
  required_entity_type text,
  required_entity_id uuid,
  changed_since timestamptz,
  required_actor uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.verification_events as event
    where event.entity_type = required_entity_type
      and event.entity_id = required_entity_id
      and event.decision in ('APPROVE', 'EDIT')
      and event.created_at >= changed_since
      and (required_actor is null or event.actor_id = required_actor)
  );
$$;

create or replace function private.pi_guard_technical_value_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  has_evidence boolean;
begin
  if new.verification_status = 'CONFIRMED' then
    if tg_op = 'INSERT' then
      raise exception 'Technical values must be proposed and reviewed before confirmation.'
        using errcode = '23514';
    end if;

    if old.verification_status is distinct from 'CONFIRMED' then
      if not private.pi_actor_has_role(
        array['owner', 'reviewer']::public.pi_console_role[]
      ) then
        raise exception 'Only an authenticated owner or reviewer may confirm technical data.'
          using errcode = '42501';
      end if;

      select exists (
        select 1
        from public.technical_value_evidence as link
        where link.technical_value_id = new.id
          and link.evidence_role = 'supporting'
          and private.pi_evidence_source_qualifies(link.evidence_source_id)
      ) into has_evidence;

      if not has_evidence then
        raise exception 'CONFIRMED technical data requires qualifying exact-product Level A evidence.'
          using errcode = '23514';
      end if;

      if not private.pi_has_approval_event(
        'technical_value',
        new.id,
        old.updated_at,
        auth.uid()
      ) then
        raise exception 'CONFIRMED technical data requires a new approve/edit verification event.'
          using errcode = '23514';
      end if;

      new.confirmed_by := auth.uid();
      new.confirmed_at := now();
    else
      if (to_jsonb(new) - array['confirmed_by', 'confirmed_at', 'updated_at'])
        is distinct from
        (to_jsonb(old) - array['confirmed_by', 'confirmed_at', 'updated_at'])
      then
        raise exception 'A confirmed technical value is immutable; create a new candidate revision.'
          using errcode = '55000';
      end if;

      new.confirmed_by := old.confirmed_by;
      new.confirmed_at := old.confirmed_at;
    end if;
  elsif tg_op = 'UPDATE' and old.verification_status = 'CONFIRMED' then
    if not private.pi_actor_has_role(
      array['owner', 'reviewer']::public.pi_console_role[]
    ) then
      raise exception 'Only an authenticated owner or reviewer may withdraw confirmation.'
        using errcode = '42501';
    end if;
    new.confirmed_by := null;
    new.confirmed_at := null;
  elsif new.confirmed_by is not null or new.confirmed_at is not null then
    raise exception 'Unconfirmed technical data cannot carry confirmation attribution.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger technical_values_confirmation_guard
before insert or update on public.technical_values
for each row execute function private.pi_guard_technical_value_confirmation();

create or replace function private.pi_guard_direct_evidence_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  entity_kind text;
begin
  entity_kind := case tg_table_name
    when 'oem_references' then 'oem_reference'
    when 'packaging_records' then 'packaging_record'
    else null
  end;

  if entity_kind is null then
    raise exception 'Unsupported confirmation table: %', tg_table_name using errcode = '0A000';
  end if;

  if new.verification_status = 'CONFIRMED' then
    if tg_op = 'INSERT' then
      raise exception '% must be proposed and reviewed before confirmation.', tg_table_name
        using errcode = '23514';
    end if;

    if old.verification_status is distinct from 'CONFIRMED' then
      if not private.pi_actor_has_role(
        array['owner', 'reviewer']::public.pi_console_role[]
      ) then
        raise exception 'Only an authenticated owner or reviewer may confirm governed data.'
          using errcode = '42501';
      end if;

      if not private.pi_evidence_source_qualifies(new.evidence_source_id) then
        raise exception 'Confirmation requires qualifying exact-product Level A evidence.'
          using errcode = '23514';
      end if;

      if not private.pi_has_approval_event(entity_kind, new.id, old.updated_at, auth.uid()) then
        raise exception 'Confirmation requires a new approve/edit verification event.'
          using errcode = '23514';
      end if;

      new.confirmed_by := auth.uid();
      new.confirmed_at := now();
    else
      if (to_jsonb(new) - array['confirmed_by', 'confirmed_at', 'updated_at'])
        is distinct from
        (to_jsonb(old) - array['confirmed_by', 'confirmed_at', 'updated_at'])
      then
        raise exception 'Confirmed governed data is immutable; create a new candidate revision.'
          using errcode = '55000';
      end if;

      new.confirmed_by := old.confirmed_by;
      new.confirmed_at := old.confirmed_at;
    end if;
  elsif tg_op = 'UPDATE' and old.verification_status = 'CONFIRMED' then
    if not private.pi_actor_has_role(
      array['owner', 'reviewer']::public.pi_console_role[]
    ) then
      raise exception 'Only an authenticated owner or reviewer may withdraw confirmation.'
        using errcode = '42501';
    end if;
    new.confirmed_by := null;
    new.confirmed_at := null;
  elsif new.confirmed_by is not null or new.confirmed_at is not null then
    raise exception 'Unconfirmed governed data cannot carry confirmation attribution.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger oem_references_confirmation_guard
before insert or update on public.oem_references
for each row execute function private.pi_guard_direct_evidence_confirmation();

create trigger packaging_records_confirmation_guard
before insert or update on public.packaging_records
for each row execute function private.pi_guard_direct_evidence_confirmation();

create or replace function private.pi_guard_compatibility_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  has_evidence boolean;
begin
  if new.relationship_status = 'confirmed' or new.verification_status = 'CONFIRMED' then
    if new.relationship_status <> 'confirmed' or new.verification_status <> 'CONFIRMED' then
      raise exception 'Confirmed compatibility requires aligned relationship and verification states.'
        using errcode = '23514';
    end if;

    if tg_op = 'INSERT' then
      raise exception 'Compatibility must be proposed and reviewed before confirmation.'
        using errcode = '23514';
    end if;

    if old.relationship_status is distinct from 'confirmed'
      or old.verification_status is distinct from 'CONFIRMED'
    then
      if not private.pi_actor_has_role(
        array['owner', 'reviewer']::public.pi_console_role[]
      ) then
        raise exception 'Only an authenticated owner or reviewer may confirm compatibility.'
          using errcode = '42501';
      end if;

      select exists (
        select 1
        from public.compatibility_evidence as link
        where link.compatibility_relationship_id = new.id
          and link.evidence_role = 'supporting'
          and private.pi_evidence_source_qualifies(link.evidence_source_id)
      ) into has_evidence;

      if not has_evidence then
        raise exception 'Confirmed compatibility requires qualifying exact-subject Level A evidence.'
          using errcode = '23514';
      end if;

      if not private.pi_has_approval_event(
        'compatibility_relationship',
        new.id,
        old.updated_at,
        auth.uid()
      ) then
        raise exception 'Confirmed compatibility requires a new approve/edit verification event.'
          using errcode = '23514';
      end if;

      new.confirmed_by := auth.uid();
      new.confirmed_at := now();
    else
      if (to_jsonb(new) - array['confirmed_by', 'confirmed_at', 'updated_at'])
        is distinct from
        (to_jsonb(old) - array['confirmed_by', 'confirmed_at', 'updated_at'])
      then
        raise exception 'Confirmed compatibility is immutable; create a new candidate relationship.'
          using errcode = '55000';
      end if;

      new.confirmed_by := old.confirmed_by;
      new.confirmed_at := old.confirmed_at;
    end if;
  elsif tg_op = 'UPDATE'
    and (old.relationship_status = 'confirmed' or old.verification_status = 'CONFIRMED')
  then
    if not private.pi_actor_has_role(
      array['owner', 'reviewer']::public.pi_console_role[]
    ) then
      raise exception 'Only an authenticated owner or reviewer may withdraw compatibility.'
        using errcode = '42501';
    end if;
    new.confirmed_by := null;
    new.confirmed_at := null;
  elsif new.confirmed_by is not null or new.confirmed_at is not null then
    raise exception 'Unconfirmed compatibility cannot carry confirmation attribution.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger compatibility_relationships_confirmation_guard
before insert or update on public.compatibility_relationships
for each row execute function private.pi_guard_compatibility_confirmation();

create or replace function private.pi_protect_confirmed_evidence_link()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_is_confirmed boolean;
  parent_id uuid;
begin
  if tg_table_name = 'technical_value_evidence' then
    parent_id := case when tg_op = 'DELETE'
      then old.technical_value_id
      else new.technical_value_id
    end;
    select value.verification_status = 'CONFIRMED'
    into parent_is_confirmed
    from public.technical_values as value
    where value.id = parent_id;
  elsif tg_table_name = 'compatibility_evidence' then
    parent_id := case when tg_op = 'DELETE'
      then old.compatibility_relationship_id
      else new.compatibility_relationship_id
    end;
    select relationship.verification_status = 'CONFIRMED'
      or relationship.relationship_status = 'confirmed'
    into parent_is_confirmed
    from public.compatibility_relationships as relationship
    where relationship.id = parent_id;
  else
    raise exception 'Unsupported evidence-link table: %', tg_table_name using errcode = '0A000';
  end if;

  if coalesce(parent_is_confirmed, false) then
    raise exception 'Evidence linked to confirmed data is immutable; withdraw confirmation first.'
      using errcode = '55000';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger technical_value_evidence_confirmation_guard
before insert or update or delete on public.technical_value_evidence
for each row execute function private.pi_protect_confirmed_evidence_link();

create trigger compatibility_evidence_confirmation_guard
before insert or update or delete on public.compatibility_evidence
for each row execute function private.pi_protect_confirmed_evidence_link();

create or replace function private.pi_guard_media_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.publication_status = 'search_eligible' then
    if tg_op = 'INSERT' then
      raise exception 'Media must be reviewed before becoming search eligible.'
        using errcode = '23514';
    end if;

    if old.publication_status is distinct from 'search_eligible' then
      if not private.pi_actor_has_role(
        array['owner', 'reviewer']::public.pi_console_role[]
      ) then
        raise exception 'Only an authenticated owner or reviewer may approve product media.'
          using errcode = '42501';
      end if;

      if not private.pi_has_approval_event('media_asset', new.id, old.updated_at, auth.uid()) then
        raise exception 'Search-eligible media requires a new approve/edit verification event.'
          using errcode = '23514';
      end if;

      new.approved_by := auth.uid();
      new.approved_at := now();
    else
      if (to_jsonb(new) - array['approved_by', 'approved_at', 'updated_at'])
        is distinct from
        (to_jsonb(old) - array['approved_by', 'approved_at', 'updated_at'])
      then
        raise exception 'Approved media evidence is immutable; withdraw eligibility before editing.'
          using errcode = '55000';
      end if;

      new.approved_by := old.approved_by;
      new.approved_at := old.approved_at;
    end if;
  elsif tg_op = 'UPDATE' and old.publication_status = 'search_eligible' then
    if not private.pi_actor_has_role(
      array['owner', 'reviewer']::public.pi_console_role[]
    ) then
      raise exception 'Only an authenticated owner or reviewer may withdraw media eligibility.'
        using errcode = '42501';
    end if;
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  elsif tg_op = 'INSERT' and (new.approved_by is not null or new.approved_at is not null) then
    raise exception 'Unreviewed media cannot carry approval attribution.' using errcode = '23514';
  elsif tg_op = 'UPDATE'
    and (
      new.approved_by is distinct from old.approved_by
      or new.approved_at is distinct from old.approved_at
    )
  then
    raise exception 'Media approval attribution cannot be edited directly.' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger media_assets_approval_guard
before insert or update on public.media_assets
for each row execute function private.pi_guard_media_approval();

create or replace function private.pi_guard_series_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.publication_status = 'published' then
    if tg_op = 'INSERT' then
      raise exception 'Product series must be reviewed before publication.' using errcode = '23514';
    end if;

    if old.publication_status is distinct from 'published' then
      if not private.pi_actor_has_role(array['owner']::public.pi_console_role[]) then
        raise exception 'Only an authenticated owner may publish a product series.'
          using errcode = '42501';
      end if;

      if not private.pi_has_approval_event('product_series', new.id, old.updated_at, auth.uid()) then
        raise exception 'Published product series requires a new approve/edit verification event.'
          using errcode = '23514';
      end if;

      new.approved_by := auth.uid();
      new.approved_at := now();
    else
      if (to_jsonb(new) - array['approved_by', 'approved_at', 'updated_at'])
        is distinct from
        (to_jsonb(old) - array['approved_by', 'approved_at', 'updated_at'])
      then
        raise exception 'Published series evidence is immutable; withdraw publication before editing.'
          using errcode = '55000';
      end if;
      new.approved_by := old.approved_by;
      new.approved_at := old.approved_at;
    end if;
  elsif tg_op = 'UPDATE' and old.publication_status = 'published' then
    if not private.pi_actor_has_role(array['owner']::public.pi_console_role[]) then
      raise exception 'Only an authenticated owner may withdraw a published product series.'
        using errcode = '42501';
    end if;
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  elsif tg_op = 'INSERT' and (new.approved_by is not null or new.approved_at is not null) then
    raise exception 'Unpublished series cannot carry approval attribution.' using errcode = '23514';
  elsif tg_op = 'UPDATE'
    and (
      new.approved_by is distinct from old.approved_by
      or new.approved_at is distinct from old.approved_at
    )
  then
    raise exception 'Series approval attribution cannot be edited directly.' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger product_series_publication_guard
before insert or update on public.product_series
for each row execute function private.pi_guard_series_publication();

create or replace function private.pi_guard_seo_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.publication_status in ('approved', 'published') then
    if tg_op = 'INSERT' then
      raise exception 'SEO records must be drafted before approval or publication.'
        using errcode = '23514';
    end if;

    if old.publication_status not in ('approved', 'published') then
      if not private.pi_actor_has_role(
        array['owner', 'publisher']::public.pi_console_role[]
      ) then
        raise exception 'Only an authenticated owner or publisher may approve SEO records.'
          using errcode = '42501';
      end if;
      new.approved_by := auth.uid();
      new.approved_at := now();
    elsif old.publication_status = 'approved' and new.publication_status = 'published' then
      if not private.pi_actor_has_role(array['owner']::public.pi_console_role[]) then
        raise exception 'Only an authenticated owner may mark SEO records published.'
          using errcode = '42501';
      end if;
      new.approved_by := old.approved_by;
      new.approved_at := old.approved_at;
    elsif (to_jsonb(new) - array['publication_status', 'approved_by', 'approved_at', 'updated_at'])
      is distinct from
      (to_jsonb(old) - array['publication_status', 'approved_by', 'approved_at', 'updated_at'])
    then
      raise exception 'Approved SEO is immutable; return it to draft before editing.'
        using errcode = '55000';
    else
      new.approved_by := old.approved_by;
      new.approved_at := old.approved_at;
    end if;
  elsif tg_op = 'UPDATE' and old.publication_status in ('approved', 'published') then
    if not private.pi_actor_has_role(
      array['owner', 'publisher']::public.pi_console_role[]
    ) then
      raise exception 'Only an authenticated owner or publisher may withdraw SEO approval.'
        using errcode = '42501';
    end if;
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  elsif tg_op = 'INSERT' and (new.approved_by is not null or new.approved_at is not null) then
    raise exception 'Draft SEO cannot carry approval attribution.' using errcode = '23514';
  elsif tg_op = 'UPDATE'
    and (
      new.approved_by is distinct from old.approved_by
      or new.approved_at is distinct from old.approved_at
    )
  then
    raise exception 'SEO approval attribution cannot be edited directly.' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger seo_records_approval_guard
before insert or update on public.seo_records
for each row execute function private.pi_guard_seo_approval();

create or replace function private.pi_is_valid_release_transition(
  old_state public.pi_release_status,
  new_state public.pi_release_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select old_state = new_state or (old_state, new_state) in (
    ('DRAFT', 'FROZEN'),
    ('DRAFT', 'SUPERSEDED'),
    ('FROZEN', 'DRAFT'),
    ('FROZEN', 'QA_RUNNING'),
    ('FROZEN', 'SUPERSEDED'),
    ('QA_RUNNING', 'PASS'),
    ('QA_RUNNING', 'PASS_WITH_WARNINGS'),
    ('QA_RUNNING', 'BLOCKED'),
    ('QA_RUNNING', 'SUPERSEDED'),
    ('PASS', 'QA_RUNNING'),
    ('PASS', 'APPROVED'),
    ('PASS', 'SUPERSEDED'),
    ('PASS_WITH_WARNINGS', 'QA_RUNNING'),
    ('PASS_WITH_WARNINGS', 'APPROVED'),
    ('PASS_WITH_WARNINGS', 'SUPERSEDED'),
    ('BLOCKED', 'DRAFT'),
    ('BLOCKED', 'QA_RUNNING'),
    ('BLOCKED', 'SUPERSEDED'),
    ('APPROVED', 'PUBLISHED'),
    ('APPROVED', 'SUPERSEDED'),
    ('PUBLISHED', 'SUPERSEDED')
  );
$$;

create or replace function private.pi_guard_release_candidate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  qa_total integer;
  qa_warning integer;
  qa_blocked integer;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'DRAFT' then
      raise exception 'A release candidate must begin in DRAFT.' using errcode = '23514';
    end if;
    if not private.pi_actor_has_role(
      array['owner', 'publisher']::public.pi_console_role[]
    ) then
      raise exception 'Only an authenticated owner or publisher may create a release candidate.'
        using errcode = '42501';
    end if;
    new.created_by := auth.uid();
    new.approved_by := null;
    new.approved_at := null;
    new.current_qa_run_id := null;
    return new;
  end if;

  if new.created_by is distinct from old.created_by then
    raise exception 'Release creator attribution is immutable.' using errcode = '55000';
  end if;

  if not private.pi_is_valid_release_transition(old.status, new.status) then
    raise exception 'Invalid release transition: % -> %', old.status, new.status
      using errcode = '23514';
  end if;

  if old.status <> 'DRAFT'
    and row(new.source_revision, new.intended_destination, new.frozen_snapshot_hash)
      is distinct from
      row(old.source_revision, old.intended_destination, old.frozen_snapshot_hash)
  then
    raise exception 'A frozen release identity cannot be edited.' using errcode = '55000';
  end if;

  if old.status = 'DRAFT' and new.status = 'FROZEN' then
    if new.frozen_snapshot_hash is null or length(btrim(new.frozen_snapshot_hash)) = 0 then
      raise exception 'A frozen release requires a snapshot hash.' using errcode = '23514';
    end if;
    if not exists (
      select 1 from public.release_items where release_candidate_id = new.id
    ) then
      raise exception 'A frozen release requires at least one release item.' using errcode = '23514';
    end if;
  end if;

  if new.status = 'QA_RUNNING' and old.status is distinct from 'QA_RUNNING' then
    new.current_qa_run_id := extensions.gen_random_uuid();
  elsif new.current_qa_run_id is distinct from old.current_qa_run_id then
    raise exception 'The active QA run is managed by the release workflow.' using errcode = '55000';
  end if;

  if new.status in ('PASS', 'PASS_WITH_WARNINGS', 'BLOCKED')
    and old.status is distinct from new.status
  then
    select
      count(*),
      count(*) filter (where result = 'PASS_WITH_WARNINGS'),
      count(*) filter (where result = 'BLOCKED')
    into qa_total, qa_warning, qa_blocked
    from public.release_qa_results
    where release_candidate_id = new.id
      and qa_run_id = new.current_qa_run_id;

    if qa_total = 0 then
      raise exception 'A QA outcome requires results from the active QA run.' using errcode = '23514';
    elsif new.status = 'PASS' and (qa_warning > 0 or qa_blocked > 0) then
      raise exception 'PASS requires an active QA run with no warnings or blockers.'
        using errcode = '23514';
    elsif new.status = 'PASS_WITH_WARNINGS' and (qa_warning = 0 or qa_blocked > 0) then
      raise exception 'PASS_WITH_WARNINGS requires warnings and no blockers.'
        using errcode = '23514';
    elsif new.status = 'BLOCKED' and qa_blocked = 0 then
      raise exception 'BLOCKED requires at least one blocking QA result.' using errcode = '23514';
    end if;
  end if;

  if new.status = 'APPROVED' and old.status is distinct from 'APPROVED' then
    if not private.pi_actor_has_role(array['owner']::public.pi_console_role[]) then
      raise exception 'Only an authenticated owner may approve a release.' using errcode = '42501';
    end if;
    if old.status not in ('PASS', 'PASS_WITH_WARNINGS') then
      raise exception 'Only a passing release may be approved.' using errcode = '23514';
    end if;
    if exists (
      select 1 from public.release_items
      where release_candidate_id = new.id and blocker_count > 0
    ) then
      raise exception 'A release with blocked items cannot be approved.' using errcode = '23514';
    end if;
    if exists (
      select 1 from public.release_qa_results
      where release_candidate_id = new.id
        and qa_run_id = new.current_qa_run_id
        and result = 'BLOCKED'
    ) then
      raise exception 'A release with blocked QA cannot be approved.' using errcode = '23514';
    end if;
    new.approved_by := auth.uid();
    new.approved_at := now();
  elsif new.status = 'PUBLISHED' and old.status is distinct from 'PUBLISHED' then
    if not exists (
      select 1 from public.publish_records where release_candidate_id = new.id
    ) then
      raise exception 'PUBLISHED requires an immutable publish record.' using errcode = '23514';
    end if;
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  elsif new.status not in ('APPROVED', 'PUBLISHED')
    and (
      new.approved_by is distinct from old.approved_by
      or new.approved_at is distinct from old.approved_at
    )
  then
    raise exception 'Release approval attribution cannot be edited directly.' using errcode = '23514';
  elsif old.status in ('APPROVED', 'PUBLISHED') then
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
  end if;

  return new;
end;
$$;

create trigger release_candidates_workflow_guard
before insert or update on public.release_candidates
for each row execute function private.pi_guard_release_candidate();

create or replace function private.pi_guard_release_item_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_id uuid;
  candidate_status public.pi_release_status;
begin
  candidate_id := case when tg_op = 'DELETE'
    then old.release_candidate_id
    else new.release_candidate_id
  end;

  select status into candidate_status
  from public.release_candidates
  where id = candidate_id;

  if candidate_status is distinct from 'DRAFT' then
    raise exception 'Release items are immutable after the candidate leaves DRAFT.'
      using errcode = '55000';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger release_items_freeze_guard
before insert or update or delete on public.release_items
for each row execute function private.pi_guard_release_item_change();

create or replace function private.pi_guard_release_qa_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate public.release_candidates%rowtype;
begin
  select * into candidate
  from public.release_candidates
  where id = new.release_candidate_id;

  if not found or candidate.status <> 'QA_RUNNING' or candidate.current_qa_run_id is null then
    raise exception 'QA results may only be added to the active QA run.' using errcode = '23514';
  end if;

  new.qa_run_id := candidate.current_qa_run_id;

  if auth.uid() is not null then
    if not private.pi_actor_has_role(
      array['owner', 'publisher']::public.pi_console_role[]
    ) then
      raise exception 'Only an owner or publisher may record QA results.' using errcode = '42501';
    end if;
    new.executed_by := auth.uid();
  elsif not private.pi_is_controlled_service_job() then
    raise exception 'QA results require an authenticated operator or controlled service job.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger release_qa_results_run_guard
before insert on public.release_qa_results
for each row execute function private.pi_guard_release_qa_insert();

create or replace function private.pi_guard_publish_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate public.release_candidates%rowtype;
begin
  if not private.pi_actor_has_role(array['owner']::public.pi_console_role[]) then
    raise exception 'Only an authenticated owner may create a publish record.'
      using errcode = '42501';
  end if;

  select * into candidate
  from public.release_candidates
  where id = new.release_candidate_id;

  if not found or candidate.status <> 'APPROVED' then
    raise exception 'Only an approved release can be published.' using errcode = '23514';
  end if;
  if candidate.frozen_snapshot_hash is null
    or new.snapshot_hash <> candidate.frozen_snapshot_hash
  then
    raise exception 'Publish snapshot hash must match the approved frozen release.'
      using errcode = '23514';
  end if;
  if not exists (
    select 1 from public.release_items where release_candidate_id = candidate.id
  ) or exists (
    select 1 from public.release_items
    where release_candidate_id = candidate.id and blocker_count > 0
  ) then
    raise exception 'A publishable release requires items with zero blockers.'
      using errcode = '23514';
  end if;
  if not exists (
    select 1 from public.release_qa_results
    where release_candidate_id = candidate.id
      and qa_run_id = candidate.current_qa_run_id
  ) or exists (
    select 1 from public.release_qa_results
    where release_candidate_id = candidate.id
      and qa_run_id = candidate.current_qa_run_id
      and result = 'BLOCKED'
  ) then
    raise exception 'A publishable release requires non-blocking QA evidence.'
      using errcode = '23514';
  end if;
  if new.live_verification is null
    or jsonb_typeof(new.live_verification) <> 'object'
    or coalesce(new.live_verification ->> 'status', '') <> 'verified'
  then
    raise exception 'Publish records require external live verification evidence.'
      using errcode = '23514';
  end if;

  new.published_by := auth.uid();
  new.published_at := now();
  return new;
end;
$$;

create trigger publish_records_release_guard
before insert on public.publish_records
for each row execute function private.pi_guard_publish_record();

create or replace function private.pi_finalize_published_release()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.release_candidates
  set status = 'PUBLISHED'
  where id = new.release_candidate_id;
  return new;
end;
$$;

create trigger publish_records_finalize_release
after insert on public.publish_records
for each row execute function private.pi_finalize_published_release();

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
      select 1 from public.technical_values
      where product_variant_id = new.id and verification_status = 'DATA_CONFLICT'
    ) or exists (
      select 1
      from public.compatibility_entities as entity
      join public.compatibility_relationships as relationship
        on relationship.subject_entity_id = entity.id
      where entity.product_variant_id = new.id
        and relationship.verification_status = 'DATA_CONFLICT'
    ) then
      raise exception 'A variant with unresolved data conflicts cannot be VERIFIED.'
        using errcode = '23514';
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
          from public.technical_values as value
          where value.product_variant_id = new.id
            and value.field_definition_id = field.id
            and value.verification_status = 'CONFIRMED'
        )
    ) then
      raise exception 'VERIFIED requires every applicable critical field to be confirmed.'
        using errcode = '23514';
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

create trigger product_variants_readiness_guard
before insert or update of lifecycle_state on public.product_variants
for each row execute function private.pi_guard_product_variant_readiness();

drop policy if exists release_candidates_release_insert on public.release_candidates;
drop policy if exists release_candidates_release_update on public.release_candidates;
drop policy if exists release_qa_results_release_insert on public.release_qa_results;

create policy release_candidates_owner_or_publisher_insert
on public.release_candidates
for insert
to authenticated
with check (
  created_by = auth.uid()
  and status = 'DRAFT'
  and public.pi_has_console_role(
    array['owner', 'publisher']::public.pi_console_role[]
  )
);

create policy release_candidates_owner_update
on public.release_candidates
for update
to authenticated
using (public.pi_has_console_role(array['owner']::public.pi_console_role[]))
with check (public.pi_has_console_role(array['owner']::public.pi_console_role[]));

create policy release_candidates_publisher_preapproval_update
on public.release_candidates
for update
to authenticated
using (
  status not in ('APPROVED', 'PUBLISHED')
  and public.pi_has_console_role(array['publisher']::public.pi_console_role[])
)
with check (
  status not in ('APPROVED', 'PUBLISHED')
  and approved_by is null
  and approved_at is null
  and public.pi_has_console_role(array['publisher']::public.pi_console_role[])
);

create policy release_qa_results_owner_or_publisher_insert
on public.release_qa_results
for insert
to authenticated
with check (
  executed_by = auth.uid()
  and public.pi_has_console_role(
    array['owner', 'publisher']::public.pi_console_role[]
  )
);

drop policy if exists seo_records_governed_update on public.seo_records;

create policy seo_records_governed_update
on public.seo_records
for update
to authenticated
using (
  public.pi_has_console_role(
    array['owner', 'editor', 'reviewer', 'publisher']::public.pi_console_role[]
  )
)
with check (
  public.pi_has_console_role(
    array['owner', 'editor', 'reviewer', 'publisher']::public.pi_console_role[]
  )
);

revoke all on all functions in schema private from public, anon, authenticated;

comment on schema private is
  'Non-exposed Product Intelligence trigger and authorization helpers.';
comment on function private.pi_guard_technical_value_confirmation() is
  'Requires a human review event and qualifying exact-product Level A evidence before confirmation.';
comment on function private.pi_guard_publish_record() is
  'Blocks publication unless the frozen snapshot, release items, QA and live verification all pass.';
