-- M4-B1: immutable exact-SKU compatibility evidence intake. No relationship is confirmed here.
-- Private commands are not exposed to HTTP; applying this migration does not adopt a database.

create table public.compatibility_source_bindings (
  evidence_source_id uuid primary key references public.evidence_sources(id),
  product_variant_id uuid not null references public.product_variants(id),
  subject_entity_id uuid not null references public.compatibility_entities(id),
  target_entity_id uuid not null references public.compatibility_entities(id),
  relationship_type text not null check (relationship_type in
    ('product_to_series','product_to_torch','product_to_machine','product_to_oem_reference')),
  scope_label text not null check (length(btrim(scope_label)) between 1 and 200),
  asserted_role text not null check (length(btrim(asserted_role)) between 1 and 200),
  assertion text not null check (assertion in ('supports','contradicts','catalog_grouping')),
  source_kind text not null check (source_kind in
    ('company_record','official_manufacturer','technical_standard','secondary_reference')),
  evidence_basis text not null,
  revision_label text not null,
  source_location text not null,
  source_digest text not null check (source_digest ~ '^[a-f0-9]{64}$'),
  subject_digest text not null check (subject_digest ~ '^[a-f0-9]{64}$'),
  target_digest text not null check (target_digest ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  check (subject_entity_id <> target_entity_id)
);
create index compatibility_source_bindings_scope_idx on public.compatibility_source_bindings
  (subject_entity_id,target_entity_id,relationship_type,scope_label);
create index compatibility_entities_variant_identity_idx on public.compatibility_entities(product_variant_id)
  where product_variant_id is not null;
create index compatibility_entities_series_identity_idx on public.compatibility_entities(product_series_id)
  where product_series_id is not null;
alter table public.compatibility_source_bindings enable row level security;
alter table public.compatibility_source_bindings force row level security;
revoke all on public.compatibility_source_bindings from public, anon, authenticated, service_role;
grant select on public.compatibility_source_bindings to authenticated;
create policy console_read on public.compatibility_source_bindings for select to authenticated
  using (public.pi_can_view_console());
create trigger working_authority_guard before insert or update or delete or truncate
on public.compatibility_source_bindings for each statement
execute function private.pi_guard_working_catalog_write();
create trigger immutable_source_binding before update or delete on public.compatibility_source_bindings
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_source_table before truncate on public.compatibility_source_bindings
for each statement execute function public.pi_prevent_immutable_change();
create trigger audit_change after insert on public.compatibility_source_bindings
for each row execute function public.pi_audit_row_change();

create function private.pi_compatibility_entity_digest(entity_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(to_jsonb(entity)::text,'sha256'),'hex')
  from public.compatibility_entities entity where id = entity_uuid;
$$;

create function private.pi_check_compatibility_target(
  subject_uuid uuid, target_uuid uuid, relation_type text, scope_label text, asserted_role text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare subject public.compatibility_entities%rowtype; target public.compatibility_entities%rowtype;
begin
  if subject_uuid is null or target_uuid is null or subject_uuid = target_uuid
    or relation_type is null or relation_type not in
      ('product_to_series','product_to_torch','product_to_machine','product_to_oem_reference')
    or scope_label is null or scope_label <> btrim(scope_label) or length(scope_label) > 200
    or regexp_replace(scope_label,'[[:space:]]','','g') = ''
    or asserted_role is null or asserted_role <> btrim(asserted_role) or length(asserted_role) > 200
    or regexp_replace(asserted_role,'[[:space:]]','','g') = ''
  then raise exception 'Invalid compatibility endpoints, type or scope.' using errcode = '22023'; end if;
  select * into subject from public.compatibility_entities where id = subject_uuid;
  if not found or subject.entity_type <> 'product' or subject.product_variant_id is null
    or subject.product_series_id is not null
  then raise exception 'An exact product entity is required.' using errcode = '22023'; end if;
  if not private.pi_is_working_variant(subject.product_variant_id) then
    raise exception 'This compatibility subject is outside the editable pilot.' using errcode = '55000';
  end if;
  if (select count(*) from public.compatibility_entities where product_variant_id = subject.product_variant_id) <> 1 then
    raise exception 'Ambiguous product entity; resolve identity before intake.' using errcode = '55000';
  end if;
  select * into target from public.compatibility_entities where id = target_uuid;
  if not found or target.entity_type <> (case relation_type
      when 'product_to_series' then 'series' when 'product_to_torch' then 'torch'
      when 'product_to_machine' then 'machine' when 'product_to_oem_reference' then 'oem_reference' end)
    or target.product_variant_id is not null
    or (target.entity_type = 'series') <> (target.product_series_id is not null)
    or regexp_replace(target.label,'[[:space:]]','','g') = ''
  then raise exception 'Target identity does not match the relationship type.' using errcode = '22023'; end if;
  if target.entity_type = 'series' and
    (select count(*) from public.compatibility_entities where product_series_id = target.product_series_id) <> 1 then
    raise exception 'Ambiguous series entity; resolve identity before intake.' using errcode = '55000';
  end if;
  return subject.product_variant_id;
end;
$$;

create function private.pi_ensure_product_compatibility_entity(request_uuid uuid, variant_uuid uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare entity_uuid uuid; matches uuid[]; result jsonb; variant_sku text;
  payload jsonb := jsonb_build_object('variant',variant_uuid);
begin
  perform private.pi_begin_technical_command(array['owner','editor']::public.pi_console_role[]);
  if not coalesce(private.pi_is_working_variant(variant_uuid),false) then
    raise exception 'This compatibility subject is outside the editable pilot.' using errcode = '55000';
  end if;
  result := private.pi_draft_receipt('ensure_product_compatibility_entity',request_uuid,payload);
  if result is not null then return result; end if;
  select sku into variant_sku from public.product_variants where id = variant_uuid;
  if not found then raise exception 'Product identity is unavailable.' using errcode = '22023'; end if;
  select array_agg(id) into matches from public.compatibility_entities where product_variant_id = variant_uuid;
  if cardinality(matches) > 1 or exists (select 1 from public.compatibility_entities where id = matches[1]
    and (entity_type <> 'product' or product_series_id is not null)) then
    raise exception 'Ambiguous product entity; resolve identity before intake.' using errcode = '55000';
  end if;
  entity_uuid := matches[1];
  if entity_uuid is null then
    entity_uuid := extensions.gen_random_uuid();
    insert into private.pi_mutation_context values (pg_backend_pid(),txid_current(),auth.uid(),array['compatibility_entities']);
    insert into public.compatibility_entities(id,external_key,entity_type,label,product_variant_id)
      values (entity_uuid,'working-entity:product:' || variant_uuid,'product',variant_sku,variant_uuid);
  end if;
  return private.pi_finish_technical_command('ensure_product_compatibility_entity',request_uuid,payload,
    jsonb_build_object('entity_id',entity_uuid,'product_variant_id',variant_uuid));
end;
$$;

create function private.pi_add_compatibility_source(
  request_uuid uuid, subject_uuid uuid, target_uuid uuid, relation_type text, scope_label text,
  asserted_role text, source_copy jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare
  source_uuid uuid := extensions.gen_random_uuid(); variant_uuid uuid; item text;
  source_date date; source_hash text; result jsonb;
  payload jsonb := jsonb_build_object('subject',subject_uuid,'target',target_uuid,'type',relation_type,
    'scope',scope_label,'role',asserted_role,'source',source_copy);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  variant_uuid := private.pi_check_compatibility_target(subject_uuid,target_uuid,relation_type,scope_label,asserted_role);
  result := private.pi_draft_receipt('add_compatibility_source',request_uuid,payload);
  if result is not null then return result; end if;
  if source_copy is null or jsonb_typeof(source_copy) <> 'object' or
    (select array_agg(key order by key) from jsonb_object_keys(source_copy) key) is distinct from
      array['assertion','evidence_basis','evidence_date','owner_name','revision_label','source_kind',
        'source_level','source_location','source_reference','title']::text[]
  then raise exception 'Invalid compatibility source fields.' using errcode = '22023'; end if;
  for item in select jsonb_object_keys(source_copy) loop
    if jsonb_typeof(source_copy -> item) <> 'string' or length(source_copy ->> item) > 2000
      or (source_copy ->> item) <> btrim(source_copy ->> item)
      or regexp_replace(source_copy ->> item,'[[:space:]]','','g') = ''
    then raise exception 'Invalid or oversized compatibility source field.' using errcode = '22023'; end if;
  end loop;
  if source_copy ->> 'assertion' not in ('supports','contradicts','catalog_grouping')
    or not ((source_copy ->> 'source_kind' = 'company_record' and source_copy ->> 'source_level' = 'A')
      or (source_copy ->> 'source_kind' = 'official_manufacturer' and source_copy ->> 'source_level' = 'B')
      or (source_copy ->> 'source_kind' = 'technical_standard' and source_copy ->> 'source_level' = 'C')
      or (source_copy ->> 'source_kind' = 'secondary_reference' and source_copy ->> 'source_level' = 'D'))
    or source_copy ->> 'evidence_basis' not in ('company_catalog','factory_confirmation','drawing',
      'approved_sample','verified_reference_number','confirmed_dimensions','official_catalog','standard','secondary_reference')
    or (source_copy ->> 'evidence_date') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  then raise exception 'Source assertion, classification or date is invalid.' using errcode = '22023'; end if;
  begin source_date := (source_copy ->> 'evidence_date')::date;
  exception when datetime_field_overflow or invalid_datetime_format then
    raise exception 'Source date is invalid.' using errcode = '22023';
  end;
  if source_date > current_date then raise exception 'Source date cannot be in the future.' using errcode = '22023'; end if;
  insert into private.pi_mutation_context values (pg_backend_pid(),txid_current(),auth.uid(),
    array['evidence_sources','compatibility_source_bindings']);
  insert into public.evidence_sources(id,external_key,source_type,source_level,title,source_reference,
    exact_subject,evidence_date,owner_name,raw_snapshot)
  values (source_uuid,'working-compatibility-source:' || source_uuid,source_copy ->> 'source_kind',
    (source_copy ->> 'source_level')::public.pi_source_level,source_copy ->> 'title',
    source_copy ->> 'source_reference',true,source_date,source_copy ->> 'owner_name',
    jsonb_build_object('evidence_basis',jsonb_build_array(source_copy ->> 'evidence_basis')));
  select encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex') into source_hash
    from public.evidence_sources source where id = source_uuid;
  insert into public.compatibility_source_bindings values (source_uuid,variant_uuid,subject_uuid,target_uuid,
    relation_type,scope_label,asserted_role,source_copy ->> 'assertion',source_copy ->> 'source_kind',
    source_copy ->> 'evidence_basis',source_copy ->> 'revision_label',source_copy ->> 'source_location',
    source_hash,private.pi_compatibility_entity_digest(subject_uuid),private.pi_compatibility_entity_digest(target_uuid),auth.uid(),now());
  return private.pi_finish_technical_command('add_compatibility_source',request_uuid,payload,
    jsonb_build_object('source_id',source_uuid,'source_digest',source_hash));
end;
$$;

create function private.pi_compatibility_source_matches(
  source_uuid uuid, subject_uuid uuid, target_uuid uuid, relation_type text, scope_label text, asserted_role text
)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists (select 1 from public.compatibility_source_bindings binding
    join public.evidence_sources source on source.id = binding.evidence_source_id
    join public.compatibility_entities subject on subject.id = binding.subject_entity_id
    join public.compatibility_entities target on target.id = binding.target_entity_id
    where source.id = source_uuid and binding.subject_entity_id = subject_uuid
      and binding.target_entity_id = target_uuid and binding.relationship_type = relation_type
      and binding.scope_label = pi_compatibility_source_matches.scope_label
      and binding.asserted_role = pi_compatibility_source_matches.asserted_role
      and binding.product_variant_id = subject.product_variant_id
      and (select count(*) from public.compatibility_entities entity
        where entity.product_variant_id = subject.product_variant_id) = 1
      and (target.product_series_id is null or (select count(*) from public.compatibility_entities entity
        where entity.product_series_id = target.product_series_id) = 1)
      and binding.subject_digest = private.pi_compatibility_entity_digest(subject_uuid)
      and binding.target_digest = private.pi_compatibility_entity_digest(target_uuid)
      and binding.source_digest = encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex'));
$$;

-- Eligibility is only an input to the future exact-revision human APPROVE command, never approval.
create function private.pi_compatibility_source_can_support_confirmation(
  source_uuid uuid, subject_uuid uuid, target_uuid uuid, relation_type text, scope_label text, asserted_role text
)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.pi_compatibility_source_matches(source_uuid,subject_uuid,target_uuid,relation_type,scope_label,asserted_role)
    and exists (select 1 from public.compatibility_source_bindings binding
      join public.evidence_sources source on source.id = binding.evidence_source_id
      where source.id = source_uuid and source.source_level = 'A' and source.exact_subject
        and binding.source_kind = 'company_record' and binding.assertion = 'supports'
        and binding.evidence_basis in ('factory_confirmation','drawing','approved_sample',
          'verified_reference_number','confirmed_dimensions'));
$$;

create function private.pi_guard_bound_compatibility_source()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.compatibility_source_bindings where evidence_source_id = old.id) then
    raise exception 'Bound compatibility sources are immutable; append a new source revision.' using errcode = '55000';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger compatibility_source_immutable before update or delete on public.evidence_sources
for each row execute function private.pi_guard_bound_compatibility_source();

revoke all on all functions in schema private from public, anon, authenticated, service_role;
