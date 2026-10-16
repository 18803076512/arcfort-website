-- M3.1a: fail-closed working adoption barrier. No editor or publication is enabled.
-- Private operational commands are intentionally not exposed through PostgREST.

create table private.pi_working_adoptions (
  id uuid primary key default extensions.gen_random_uuid(),
  scope text not null unique check (scope = '15ak-v1'),
  source_revision text not null check (source_revision ~ '^[a-f0-9]{64}$'),
  repository_commit text not null check (repository_commit ~ '^[a-f0-9]{40}$'),
  source_files jsonb not null,
  baseline jsonb not null,
  baseline_hash text not null,
  pilot_variant_ids uuid[] not null check (cardinality(pilot_variant_ids) = 4),
  actor_id uuid not null references auth.users (id),
  reason text not null check (length(btrim(reason)) between 10 and 2000),
  created_at timestamptz not null default now()
);

create table private.pi_working_authority_control (
  singleton boolean primary key default true check (singleton),
  adoption_id uuid references private.pi_working_adoptions (id)
);
insert into private.pi_working_authority_control (singleton) values (true);

alter table private.pi_working_adoptions enable row level security;
alter table private.pi_working_adoptions force row level security;
alter table private.pi_working_authority_control enable row level security;
alter table private.pi_working_authority_control force row level security;
revoke all on private.pi_working_adoptions, private.pi_working_authority_control
  from public, anon, authenticated, service_role;

create trigger pi_working_adoptions_immutable
before update or delete on private.pi_working_adoptions
for each row execute function public.pi_prevent_immutable_change();
create trigger pi_working_adoptions_no_truncate
before truncate on private.pi_working_adoptions
for each statement execute function public.pi_prevent_immutable_change();
create trigger pi_working_adoptions_audit
after insert on private.pi_working_adoptions
for each row execute function public.pi_audit_row_change();

create function private.pi_prevent_authority_reversal()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op <> 'UPDATE' then
    raise exception 'Working authority cannot be deleted or truncated.' using errcode = '55000';
  end if;
  if old.adoption_id is not null or new.adoption_id is null or not new.singleton then
    raise exception 'Working authority cannot be reset or reassigned.' using errcode = '55000';
  end if;
  return new;
end;
$$;
create trigger pi_working_authority_no_reversal
before update or delete on private.pi_working_authority_control
for each row execute function private.pi_prevent_authority_reversal();
create trigger pi_working_authority_no_truncate
before truncate on private.pi_working_authority_control
for each statement execute function private.pi_prevent_authority_reversal();

-- Keep the source-column projection explicit. A caller cannot omit a field to hide drift.
create function private.pi_shadow_source_columns()
returns jsonb language sql immutable set search_path = '' as $$
  select '{
    "product_categories": ["id","external_key","slug","name_en","name_zh","route_slug","raw_snapshot"],
    "product_series": ["id","external_key","category_id","name","slug","process","source_type","source_level","verification_status","publication_status","image_evidence_status","source_reference","raw_snapshot"],
    "products": ["id","external_key","category_id","name_en","name_zh","product_type","source_type","source_reference","raw_snapshot"],
    "product_variants": ["id","product_id","category_id","sku","public_slug","model","lifecycle_state","is_shadow","legacy_status","legacy_data_status","legacy_image_status","legacy_compatibility_status","legacy_oem_status","raw_snapshot"],
    "series_components": ["id","external_key","series_id","scope","component_key","component_name","variant_key","variant_label","lifecycle_status","target_variant_id","raw_snapshot"],
    "technical_field_definitions": ["id","field_key","label","value_type","default_unit","applies_to"],
    "evidence_sources": ["id","external_key","source_type","source_level","title","source_reference","exact_subject","raw_snapshot"],
    "technical_values": ["id","external_key","field_definition_id","product_variant_id","series_component_id","value_text","unit","variant_label","source_type","source_level","verification_status","public_note","confirmation_requirements","legacy_reviewed_by","legacy_reviewed_date","raw_snapshot"],
    "technical_value_evidence": ["technical_value_id","evidence_source_id","evidence_role"],
    "packaging_records": ["id","external_key","product_variant_id","package_description","moq_note","lead_time_note","source_level","verification_status","raw_snapshot"],
    "compatibility_entities": ["id","external_key","entity_type","label","product_variant_id","product_series_id","raw_snapshot"],
    "compatibility_relationships": ["id","external_key","subject_entity_id","target_entity_id","relationship_type","role","relationship_status","source_type","source_level","verification_status","buyer_confirmation_required","confirmation_requirements","legacy_reviewed_by","legacy_reviewed_date","raw_snapshot"],
    "compatibility_evidence": ["compatibility_relationship_id","evidence_source_id","evidence_role"],
    "media_assets": ["id","external_key","storage_bucket","storage_path","public_path","source_kind","source_reference","source_file","source_owner","ownership_status","usage_rights_status","content_match_status","publication_status","legacy_reviewed_by","legacy_reviewed_date","raw_snapshot"],
    "product_media": ["id","product_variant_id","media_asset_id","role","sort_order","alt_text","raw_snapshot"],
    "seo_records": ["id","external_key","entity_type","product_variant_id","locale","search_intent","title","meta_description","canonical_path","publication_status","raw_snapshot"],
    "import_rows": ["id","import_batch_id","row_number","source_record_key","raw_payload","normalized_payload","errors","warnings"]
  }'::jsonb;
$$;

create function private.pi_guard_working_catalog_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare active_adoption uuid;
begin
  -- Lock the actual state row, not a cached flag. Adoption updates the same row.
  -- Waiting READ COMMITTED statements see the new value; older snapshots serialize-fail.
  select adoption_id into active_adoption
  from private.pi_working_authority_control where singleton for update;
  if not found then
    raise exception 'Working authority state is unavailable.' using errcode = '55000';
  end if;
  if active_adoption is not null then
    raise exception 'Catalog replay/direct writes are frozen after working adoption.'
      using errcode = '55000';
  end if;
  return null;
end;
$$;

do $$
declare relation_name text;
begin
  for relation_name in
    select jsonb_object_keys(private.pi_shadow_source_columns())
    union select unnest(array[
      'import_batches', 'oem_references', 'technical_documents', 'entity_documents',
      'verification_events', 'release_candidates', 'release_items', 'release_qa_results',
      'publish_records'
    ])
  loop
    execute format(
      'create trigger pi_working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()',
      relation_name
    );
  end loop;
end;
$$;

create function private.pi_adopt_15ak_working_scope(
  expected_source_revision text,
  expected_tables jsonb,
  repository_commit text,
  adoption_reason text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  active_adoption uuid;
  batch public.import_batches%rowtype;
  source_columns jsonb := private.pi_shadow_source_columns();
  table_name text;
  column_names jsonb;
  actual_rows jsonb;
  projected_rows jsonb;
  expected_rows jsonb;
  baseline jsonb := '{}'::jsonb;
  pilot_ids uuid[];
  adoption_uuid uuid;
begin
  if not private.pi_actor_has_role(array['owner']::public.pi_console_role[])
    or coalesce(private.pi_request_jwt_role(), '') <> 'authenticated'
  then
    raise exception 'Working adoption requires the authenticated owner.' using errcode = '42501';
  end if;
  if expected_source_revision is null or expected_source_revision !~ '^[a-f0-9]{64}$'
    or repository_commit is null or repository_commit !~ '^[a-f0-9]{40}$'
    or adoption_reason is null or length(btrim(adoption_reason)) not between 10 and 2000
    or expected_tables is null or jsonb_typeof(expected_tables) <> 'object'
    or octet_length(expected_tables::text) > 20971520
  then
    raise exception 'Invalid working adoption request.' using errcode = '22023';
  end if;
  select adoption_id into active_adoption
  from private.pi_working_authority_control where singleton for update;
  if not found or active_adoption is not null then
    raise exception 'Working adoption is unavailable or already recorded.' using errcode = '55000';
  end if;
  perform 1 from public.console_user_roles
    where user_id = auth.uid() and role = 'owner' and revoked_at is null for share;
  if not found then
    raise exception 'Working adoption requires a current owner role.' using errcode = '42501';
  end if;
  if exists (select 1 from public.import_batches where status in ('PREPARED','IMPORTING','IMPORTED')) then
    raise exception 'An unfinished import blocks working adoption.' using errcode = '55000';
  end if;
  select * into batch from public.import_batches
  where source_revision = expected_source_revision and status = 'RECONCILED' and is_shadow;
  if not found or batch.expected_counts is distinct from public.pi_current_shadow_counts()
    or batch.imported_counts is distinct from batch.expected_counts
    or batch.reconciliation ->> 'matches' is distinct from 'true'
  then
    raise exception 'A reconciled matching source revision is required.' using errcode = '23514';
  end if;
  if jsonb_typeof(batch.source_files) is distinct from 'array' then
    raise exception 'A source-file hash manifest is required.' using errcode = '23514';
  end if;
  if exists (select 1 from jsonb_array_elements(batch.source_files) f
    where coalesce(f ->> 'path', '') = '' or coalesce(f ->> 'sha256', '') !~ '^[a-f0-9]{64}$')
    or expected_source_revision is distinct from (
      select encode(extensions.digest(string_agg((f ->> 'path') || ':' || (f ->> 'sha256'), E'\n' order by ordinal), 'sha256'), 'hex')
      from jsonb_array_elements(batch.source_files) with ordinality as files(f, ordinal)
    )
  then
    raise exception 'Source-file hashes do not match the accepted revision.' using errcode = '23514';
  end if;
  if (select array_agg(key order by key) from jsonb_object_keys(expected_tables) as key)
    is distinct from
    (select array_agg(key order by key) from jsonb_object_keys(source_columns) as key)
  then
    raise exception 'All seventeen source tables must be compared.' using errcode = '23514';
  end if;
  for table_name, column_names in select key, value from jsonb_each(source_columns)
  loop
    if jsonb_typeof(expected_tables -> table_name) <> 'array' then
      raise exception 'Invalid table manifest.' using errcode = '22023';
    end if;
    execute format('select coalesce(jsonb_agg(to_jsonb(r) order by to_jsonb(r)::text), ''[]''::jsonb) from public.%I r', table_name)
      into actual_rows;
    select coalesce(jsonb_agg(projected order by projected::text), '[]'::jsonb)
      into projected_rows
    from (
      select (select jsonb_object_agg(k, r -> k)
        from jsonb_array_elements_text(column_names) as k) as projected
      from jsonb_array_elements(actual_rows) as r
    ) rows;
    select coalesce(jsonb_agg(r order by r::text), '[]'::jsonb) into expected_rows
      from jsonb_array_elements(expected_tables -> table_name) as r;
    if projected_rows is distinct from expected_rows then
      raise exception 'Exact source parity failed for %.', table_name using errcode = '23514';
    end if;
    baseline := baseline || jsonb_build_object(table_name, actual_rows);
  end loop;
  -- Preserve all non-shadow/source extension data too; refuse prior verification/publication.
  if exists (select 1 from public.product_variants where not is_shadow)
    or exists (select 1 from public.verification_events)
    or exists (select 1 from public.release_candidates)
    or exists (select 1 from public.publish_records)
    or exists (select 1 from public.technical_values where confirmed_by is not null)
    or exists (select 1 from public.oem_references)
    or exists (select 1 from public.technical_documents)
    or exists (select 1 from public.entity_documents)
  then
    raise exception 'Unexpected working/review state requires a separate adoption review.' using errcode = '23514';
  end if;
  select array_agg(v.id order by v.sku) into pilot_ids
  from public.product_variants v
  join public.products p on p.id = v.product_id
  join public.product_categories c on c.id = v.category_id and c.id = p.category_id
  join (values
    ('AF-MIG-CT-0004', 'mig-contact-tip-m6-0-8mm'),
    ('AF-MIG-CT-0005', 'mig-contact-tip-m6-1-0mm'),
    ('AF-MIG-TH-0007', 'mig-tip-holder-for-mb15'),
    ('AF-MIG-GN-0008', 'mig-gas-nozzle-for-mb15')
  ) pilot(sku, slug) on pilot.sku = v.sku and pilot.slug = v.public_slug
  where v.is_shadow and c.route_slug = 'mig-mag-torch-parts'
    and p.product_type = 'welding-consumable';
  if cardinality(pilot_ids) is distinct from 4 then
    raise exception 'The four exact 15AK pilot identities are required.' using errcode = '23514';
  end if;
  if (select count(*) from public.technical_values where product_variant_id = any(pilot_ids)) <> 15 then
    raise exception 'The fifteen original pilot technical references must be retained.' using errcode = '23514';
  end if;
  baseline := baseline || jsonb_build_object('import_batch', to_jsonb(batch));
  insert into private.pi_working_adoptions (
    scope, source_revision, repository_commit, source_files, baseline, baseline_hash,
    pilot_variant_ids, actor_id, reason
  ) values (
    '15ak-v1', expected_source_revision, repository_commit, batch.source_files, baseline,
    encode(extensions.digest(baseline::text, 'sha256'), 'hex'), pilot_ids, auth.uid(), btrim(adoption_reason)
  ) returning id into adoption_uuid;
  update private.pi_working_authority_control set adoption_id = adoption_uuid where singleton;
  return adoption_uuid;
end;
$$;

revoke all on all functions in schema private from public, anon, authenticated, service_role;
comment on table private.pi_working_adoptions is
  'Immutable owner-authorized baseline. No public-source cutover, confirmation or editor activation.';
comment on function private.pi_adopt_15ak_working_scope(text, jsonb, text, text) is
  'Private operational command. Requires separate target-specific approval, full source parity and an authenticated owner context. Never invoke as part of migration.';
