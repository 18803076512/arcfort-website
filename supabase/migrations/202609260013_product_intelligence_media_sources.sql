-- M4-B6: exact-SKU media evidence intake, not image assignment or approval.
-- Existing media, mapping, storage and publication states remain unchanged.

create table public.media_source_bindings (
  evidence_source_id uuid primary key references public.evidence_sources(id),
  product_variant_id uuid not null references public.product_variants(id),
  media_asset_id uuid not null references public.media_assets(id),
  media_role text not null check (media_role in ('main','gallery','technical','dimension','packaging',
    'bulk','front','45_degree','thread_detail','hole_detail','surface_detail','application')),
  evidence_dimension text not null check (evidence_dimension in ('usage_rights','product_match')),
  assertion text not null check (assertion in ('supports','contradicts','reference_only')),
  source_kind text not null check (source_kind in
    ('company_record','official_manufacturer','technical_standard','secondary_reference')),
  evidence_basis text not null,
  revision_label text not null,
  source_location text not null,
  source_digest text not null check (source_digest ~ '^[a-f0-9]{64}$'),
  variant_digest text not null check (variant_digest ~ '^[a-f0-9]{64}$'),
  asset_digest text not null check (asset_digest ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index media_source_bindings_scope_idx on public.media_source_bindings
  (product_variant_id,media_asset_id,media_role,evidence_dimension);
alter table public.media_source_bindings enable row level security;
alter table public.media_source_bindings force row level security;
revoke all on public.media_source_bindings from public, anon, authenticated, service_role;
grant select on public.media_source_bindings to authenticated;
create policy console_read on public.media_source_bindings for select to authenticated
  using (public.pi_can_view_console());
create trigger working_authority_guard before insert or update or delete or truncate
on public.media_source_bindings for each statement
execute function private.pi_guard_working_catalog_write();
create trigger immutable_media_binding before update or delete on public.media_source_bindings
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_media_binding_table before truncate on public.media_source_bindings
for each statement execute function public.pi_prevent_immutable_change();
create trigger audit_change after insert on public.media_source_bindings
for each row execute function public.pi_audit_row_change();

create function private.pi_media_asset_digest(asset_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(to_jsonb(asset)::text,'sha256'),'hex')
  from public.media_assets asset where id=asset_uuid;
$$;

create function private.pi_media_variant_digest(variant_uuid uuid)
returns text language sql stable security definer set search_path = '' as $$
  select encode(extensions.digest(jsonb_build_object('id',id,'product_id',product_id,
    'category_id',category_id,'sku',sku,'model',model)::text,'sha256'),'hex')
  from public.product_variants where id=variant_uuid;
$$;

create function private.pi_check_media_source_target(
  variant_uuid uuid, asset_uuid uuid, requested_role text, dimension text
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if variant_uuid is null or asset_uuid is null or requested_role is null
    or requested_role not in ('main','gallery','technical','dimension','packaging','bulk','front',
      '45_degree','thread_detail','hole_detail','surface_detail','application')
    or dimension is null or dimension not in ('usage_rights','product_match') then
    raise exception 'Invalid media subject, role or evidence dimension.' using errcode='22023';
  end if;
  if not coalesce(private.pi_is_working_variant(variant_uuid),false) then
    raise exception 'This media subject is outside the editable pilot.' using errcode='55000';
  end if;
  perform 1 from public.product_variants where id=variant_uuid for share;
  if not found then raise exception 'The media subject is unavailable.' using errcode='55000'; end if;
  perform 1 from public.media_assets where id=asset_uuid for share;
  if not found then raise exception 'Recorded media asset is unavailable.' using errcode='22023'; end if;
end;
$$;

create function private.pi_add_media_source(
  request_uuid uuid, variant_uuid uuid, asset_uuid uuid, requested_role text,
  dimension text, source_copy jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare source_uuid uuid := extensions.gen_random_uuid(); item text; source_date date;
  source_hash text; result jsonb; payload jsonb := jsonb_build_object('variant',variant_uuid,
    'asset',asset_uuid,'role',requested_role,'dimension',dimension,'source',source_copy);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  perform private.pi_check_media_source_target(variant_uuid,asset_uuid,requested_role,dimension);
  result := private.pi_draft_receipt('add_media_source',request_uuid,payload);
  if result is not null then return result; end if;
  if source_copy is null or jsonb_typeof(source_copy) <> 'object' or
    (select array_agg(key order by key) from jsonb_object_keys(source_copy) key) is distinct from
      array['assertion','evidence_basis','evidence_date','owner_name','revision_label','source_kind',
        'source_level','source_location','source_reference','title']::text[] then
    raise exception 'Invalid media source fields.' using errcode='22023';
  end if;
  for item in select jsonb_object_keys(source_copy) loop
    if jsonb_typeof(source_copy -> item) <> 'string' or length(source_copy ->> item) > 2000
      or source_copy ->> item <> btrim(source_copy ->> item)
      or regexp_replace(source_copy ->> item,'[[:space:]]','','g') = '' then
      raise exception 'Invalid or oversized media source field.' using errcode='22023';
    end if;
  end loop;
  if source_copy ->> 'assertion' not in ('supports','contradicts','reference_only')
    or not ((source_copy ->> 'source_kind'='company_record' and source_copy ->> 'source_level'='A')
      or (source_copy ->> 'source_kind'='official_manufacturer' and source_copy ->> 'source_level'='B')
      or (source_copy ->> 'source_kind'='technical_standard' and source_copy ->> 'source_level'='C')
      or (source_copy ->> 'source_kind'='secondary_reference' and source_copy ->> 'source_level'='D'))
    or not ((dimension='usage_rights' and source_copy ->> 'evidence_basis' in
      ('company_ownership','supplier_authorization','license_record','catalog_reference','secondary_reference'))
      or (dimension='product_match' and source_copy ->> 'evidence_basis' in
      ('sku_label','controlled_drawing','approved_sample','inspection_record','catalog_reference','secondary_reference')))
    or source_copy ->> 'evidence_date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'Media source assertion, classification, basis or date is invalid.' using errcode='22023';
  end if;
  begin source_date := (source_copy ->> 'evidence_date')::date;
  exception when datetime_field_overflow or invalid_datetime_format then
    raise exception 'Media source date is invalid.' using errcode='22023';
  end;
  if source_date > current_date then raise exception 'Media source date cannot be in the future.' using errcode='22023'; end if;
  insert into private.pi_mutation_context values (pg_backend_pid(),txid_current(),auth.uid(),
    array['evidence_sources','media_source_bindings']);
  insert into public.evidence_sources(id,external_key,source_type,source_level,title,source_reference,
    exact_subject,evidence_date,owner_name,raw_snapshot)
  values(source_uuid,'working-media-source:' || source_uuid,source_copy ->> 'source_kind',
    (source_copy ->> 'source_level')::public.pi_source_level,source_copy ->> 'title',
    source_copy ->> 'source_reference',true,source_date,source_copy ->> 'owner_name',
    jsonb_build_object('evidence_basis',jsonb_build_array(source_copy ->> 'evidence_basis')));
  select encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex') into source_hash
    from public.evidence_sources source where id=source_uuid;
  insert into public.media_source_bindings values(source_uuid,variant_uuid,asset_uuid,requested_role,
    dimension,source_copy ->> 'assertion',source_copy ->> 'source_kind',source_copy ->> 'evidence_basis',
    source_copy ->> 'revision_label',source_copy ->> 'source_location',source_hash,
    private.pi_media_variant_digest(variant_uuid),private.pi_media_asset_digest(asset_uuid),auth.uid(),now());
  return private.pi_finish_technical_command('add_media_source',request_uuid,payload,
    jsonb_build_object('source_id',source_uuid,'source_digest',source_hash));
end;
$$;

create function private.pi_media_source_matches(
  source_uuid uuid, variant_uuid uuid, asset_uuid uuid, requested_role text, dimension text
)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists(select 1 from public.media_source_bindings binding
    join public.evidence_sources source on source.id=binding.evidence_source_id
    where source.id=source_uuid and binding.product_variant_id=variant_uuid
      and binding.media_asset_id=asset_uuid and binding.media_role=requested_role
      and binding.evidence_dimension=dimension
      and binding.variant_digest=private.pi_media_variant_digest(variant_uuid)
      and binding.asset_digest=private.pi_media_asset_digest(asset_uuid)
      and binding.source_digest=encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex'));
$$;

-- This checks declared source metadata only. It does not verify image bytes, rights or SKU match.
-- Future review must inspect the actual image and bind BOTH evidence dimensions to its revision.
create function private.pi_media_source_can_support_review(
  source_uuid uuid, variant_uuid uuid, asset_uuid uuid, requested_role text, dimension text
)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.pi_media_source_matches(source_uuid,variant_uuid,asset_uuid,requested_role,dimension)
    and exists(select 1 from public.media_source_bindings binding
      join public.evidence_sources source on source.id=binding.evidence_source_id
      where source.id=source_uuid and source.source_level='A' and source.exact_subject
        and binding.source_kind='company_record' and binding.assertion='supports'
        and ((dimension='usage_rights' and binding.evidence_basis in
          ('company_ownership','supplier_authorization','license_record'))
          or (dimension='product_match' and binding.evidence_basis in
          ('sku_label','controlled_drawing','approved_sample','inspection_record'))));
$$;

create function private.pi_guard_bound_media_source()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists(select 1 from public.media_source_bindings where evidence_source_id=old.id) then
    raise exception 'Bound media sources are immutable; append a new source revision.' using errcode='55000';
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
create trigger media_source_immutable before update or delete on public.evidence_sources
for each row execute function private.pi_guard_bound_media_source();

revoke all on all functions in schema private from public, anon, authenticated, service_role;
