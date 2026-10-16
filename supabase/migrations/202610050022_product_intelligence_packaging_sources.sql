-- M4-D1: physical packaging evidence only, never MOQ, lead time or a human approval.
-- Sources append separately; imported packaging and commercial notes stay unchanged.

create table public.packaging_source_bindings (
  evidence_source_id uuid primary key references public.evidence_sources(id),
  product_variant_id uuid not null references public.product_variants(id),
  original_packaging_id uuid references public.packaging_records(id),
  original_digest text check (original_digest ~ '^[a-f0-9]{64}$'),
  package_description text not null check (length(package_description) between 1 and 1000),
  quantity integer check (quantity > 0),
  quantity_unit text check (length(quantity_unit) between 1 and 40),
  assertion text not null check (assertion in ('supports','contradicts','reference_only')),
  source_kind text not null check (source_kind in
    ('company_record','official_manufacturer','technical_standard','secondary_reference')),
  evidence_basis text not null check (evidence_basis in
    ('packaging_record','factory_record','controlled_drawing','approved_sample',
      'company_catalog','manufacturer_catalog','standard_reference','secondary_reference')),
  revision_label text not null,
  source_location text not null,
  source_digest text not null check (source_digest ~ '^[a-f0-9]{64}$'),
  variant_digest text not null check (variant_digest ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint packaging_source_original_pair_check check
    ((original_packaging_id is null)=(original_digest is null)),
  constraint packaging_source_quantity_pair_check check
    ((quantity is null)=(quantity_unit is null)),
  constraint packaging_source_text_check check (
    package_description=btrim(package_description) and package_description !~ '[[:cntrl:]]'
    and regexp_replace(package_description,'[[:space:]]','','g')<>''
    and (quantity_unit is null or (quantity_unit=btrim(quantity_unit)
      and quantity_unit !~ '[[:cntrl:]]' and regexp_replace(quantity_unit,'[[:space:]]','','g')<>'')))
);
create index packaging_source_bindings_scope_idx on public.packaging_source_bindings
  (product_variant_id,original_packaging_id);
alter table public.packaging_source_bindings enable row level security;
alter table public.packaging_source_bindings force row level security;
revoke all on public.packaging_source_bindings from public,anon,authenticated,service_role;
grant select on public.packaging_source_bindings to authenticated;
create policy console_read on public.packaging_source_bindings for select to authenticated
  using (public.pi_can_view_console());
create trigger working_authority_guard before insert or update or delete or truncate
on public.packaging_source_bindings for each statement
execute function private.pi_guard_working_catalog_write();
create trigger immutable_packaging_binding before update or delete on public.packaging_source_bindings
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_packaging_binding_table before truncate on public.packaging_source_bindings
for each statement execute function public.pi_prevent_immutable_change();
create trigger audit_change after insert on public.packaging_source_bindings
for each row execute function public.pi_audit_row_change();

create function private.pi_packaging_variant_digest(variant_uuid uuid)
returns text language sql stable security definer set search_path = '' as $$
  select encode(extensions.digest(jsonb_build_object('id',id,'product_id',product_id,
    'category_id',category_id,'sku',sku,'model',model)::text,'sha256'),'hex')
  from public.product_variants where id=variant_uuid;
$$;

create function private.pi_packaging_original_digest(original_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(to_jsonb(original)::text,'sha256'),'hex')
  from public.packaging_records original where id=original_uuid;
$$;

create function private.pi_check_packaging_copy(packaging_copy jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if packaging_copy is null or jsonb_typeof(packaging_copy)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(packaging_copy) key) is distinct from
    array['package_description','quantity','quantity_unit']::text[] then
    raise exception 'Only exact physical packaging fields are permitted.' using errcode='22023';
  end if;
  if jsonb_typeof(packaging_copy->'package_description')<>'string'
    or length(packaging_copy->>'package_description') not between 1 and 1000
    or packaging_copy->>'package_description'<>btrim(packaging_copy->>'package_description')
    or packaging_copy->>'package_description' ~ '[[:cntrl:]]'
    or regexp_replace(packaging_copy->>'package_description','[[:space:]]','','g')='' then
    raise exception 'An exact bounded package description is required.' using errcode='22023';
  end if;
  if packaging_copy->'quantity'='null'::jsonb and packaging_copy->'quantity_unit'='null'::jsonb then
    return;
  end if;
  if jsonb_typeof(packaging_copy->'quantity')<>'number'
    or jsonb_typeof(packaging_copy->'quantity_unit')<>'string' then
    raise exception 'Quantity and its explicit unit must be supplied together or both unknown.' using errcode='22023';
  end if;
  if (packaging_copy->>'quantity')::numeric not between 1 and 2147483647
    or (packaging_copy->>'quantity')::numeric<>trunc((packaging_copy->>'quantity')::numeric)
    or length(packaging_copy->>'quantity_unit') not between 1 and 40
    or packaging_copy->>'quantity_unit'<>btrim(packaging_copy->>'quantity_unit')
    or packaging_copy->>'quantity_unit' ~ '[[:cntrl:]]'
    or regexp_replace(packaging_copy->>'quantity_unit','[[:space:]]','','g')='' then
    raise exception 'A positive integer quantity and bounded exact unit are required.' using errcode='22023';
  end if;
end;
$$;

create function private.pi_check_packaging_source_target(
  variant_uuid uuid, packaging_copy jsonb, original_uuid uuid
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.pi_check_packaging_copy(packaging_copy);
  if variant_uuid is null or not coalesce(private.pi_is_working_variant(variant_uuid),false) then
    raise exception 'This packaging subject is outside the editable pilot.' using errcode='55000';
  end if;
  perform 1 from public.product_variants where id=variant_uuid for share;
  if not found then raise exception 'The packaging subject is unavailable.' using errcode='55000'; end if;
  if original_uuid is not null then
    perform 1 from public.packaging_records where id=original_uuid and product_variant_id=variant_uuid for share;
    if not found then raise exception 'Original packaging must belong to this exact SKU.' using errcode='22023'; end if;
  end if;
end;
$$;

create function private.pi_add_packaging_source(
  request_uuid uuid, variant_uuid uuid, packaging_copy jsonb, source_copy jsonb,
  original_uuid uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare source_uuid uuid:=extensions.gen_random_uuid(); item text; source_date date;
  source_hash text; result jsonb; payload jsonb:=jsonb_build_object('variant',variant_uuid,
    'packaging',packaging_copy,'original',original_uuid,'source',source_copy);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  perform private.pi_check_packaging_source_target(variant_uuid,packaging_copy,original_uuid);
  result:=private.pi_draft_receipt('add_packaging_source',request_uuid,payload);
  if result is not null then return result; end if;
  if source_copy is null or jsonb_typeof(source_copy)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(source_copy) key) is distinct from
    array['assertion','evidence_basis','evidence_date','owner_name','revision_label','source_kind',
      'source_level','source_location','source_reference','title']::text[] then
    raise exception 'Invalid packaging source fields.' using errcode='22023';
  end if;
  for item in select jsonb_object_keys(source_copy) loop
    if jsonb_typeof(source_copy->item)<>'string' or length(source_copy->>item)>2000
      or source_copy->>item<>btrim(source_copy->>item)
      or source_copy->>item ~ '[[:cntrl:]]'
      or regexp_replace(source_copy->>item,'[[:space:]]','','g')='' then
      raise exception 'Invalid or oversized packaging source field.' using errcode='22023';
    end if;
  end loop;
  if source_copy->>'assertion' not in ('supports','contradicts','reference_only')
    or not ((source_copy->>'source_kind'='company_record' and source_copy->>'source_level'='A'
        and source_copy->>'evidence_basis' in ('packaging_record','factory_record','controlled_drawing',
          'approved_sample','company_catalog'))
      or (source_copy->>'source_kind'='official_manufacturer' and source_copy->>'source_level'='B'
        and source_copy->>'evidence_basis'='manufacturer_catalog')
      or (source_copy->>'source_kind'='technical_standard' and source_copy->>'source_level'='C'
        and source_copy->>'evidence_basis'='standard_reference')
      or (source_copy->>'source_kind'='secondary_reference' and source_copy->>'source_level'='D'
        and source_copy->>'evidence_basis'='secondary_reference'))
    or source_copy->>'evidence_date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'Packaging source assertion, classification, basis or date is invalid.' using errcode='22023';
  end if;
  begin source_date:=(source_copy->>'evidence_date')::date;
  exception when datetime_field_overflow or invalid_datetime_format then
    raise exception 'Packaging source date is invalid.' using errcode='22023';
  end;
  if source_date>current_date then
    raise exception 'Packaging source date cannot be in the future.' using errcode='22023'; end if;
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['evidence_sources','packaging_source_bindings']);
  insert into public.evidence_sources(id,external_key,source_type,source_level,title,source_reference,
    exact_subject,evidence_date,owner_name,raw_snapshot)
  values(source_uuid,'working-packaging-source:' || source_uuid,source_copy->>'source_kind',
    (source_copy->>'source_level')::public.pi_source_level,source_copy->>'title',
    source_copy->>'source_reference',true,source_date,source_copy->>'owner_name',
    jsonb_build_object('evidence_basis',jsonb_build_array(source_copy->>'evidence_basis')));
  select encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex') into source_hash
    from public.evidence_sources source where id=source_uuid;
  insert into public.packaging_source_bindings(evidence_source_id,product_variant_id,original_packaging_id,
    original_digest,package_description,quantity,quantity_unit,assertion,source_kind,evidence_basis,
    revision_label,source_location,source_digest,variant_digest,created_by)
  values(source_uuid,variant_uuid,original_uuid,private.pi_packaging_original_digest(original_uuid),
    packaging_copy->>'package_description',((packaging_copy->>'quantity')::numeric)::integer,
    packaging_copy->>'quantity_unit',source_copy->>'assertion',source_copy->>'source_kind',
    source_copy->>'evidence_basis',source_copy->>'revision_label',source_copy->>'source_location',source_hash,
    private.pi_packaging_variant_digest(variant_uuid),auth.uid());
  return private.pi_finish_technical_command('add_packaging_source',request_uuid,payload,
    jsonb_build_object('source_id',source_uuid,'source_digest',source_hash));
end;
$$;

create function private.pi_packaging_source_matches(
  source_uuid uuid, variant_uuid uuid, packaging_copy jsonb, original_uuid uuid default null
)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists(select 1 from public.packaging_source_bindings binding
    join public.evidence_sources source on source.id=binding.evidence_source_id
    where source.id=source_uuid and binding.product_variant_id=variant_uuid
      and binding.original_packaging_id is not distinct from original_uuid
      and binding.original_digest is not distinct from private.pi_packaging_original_digest(original_uuid)
      and jsonb_build_object('package_description',binding.package_description,'quantity',binding.quantity,
        'quantity_unit',binding.quantity_unit)=packaging_copy
      and binding.variant_digest=private.pi_packaging_variant_digest(variant_uuid)
      and binding.source_digest=encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex'));
$$;

-- Eligibility for later human review, not document inspection, a confirmation or a known quantity.
create function private.pi_packaging_source_can_support_review(
  source_uuid uuid, variant_uuid uuid, packaging_copy jsonb, original_uuid uuid default null
)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.pi_packaging_source_matches(source_uuid,variant_uuid,packaging_copy,original_uuid)
    and exists(select 1 from public.packaging_source_bindings binding
      join public.evidence_sources source on source.id=binding.evidence_source_id
      where source.id=source_uuid and source.source_level='A' and source.exact_subject
        and binding.source_kind='company_record' and binding.assertion='supports'
        and binding.evidence_basis in ('packaging_record','factory_record','controlled_drawing','approved_sample'));
$$;

create function private.pi_guard_bound_packaging_source()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists(select 1 from public.packaging_source_bindings where evidence_source_id=old.id) then
    raise exception 'Bound packaging sources are immutable; append a new source revision.' using errcode='55000';
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
create trigger packaging_source_immutable before update or delete on public.evidence_sources
for each row execute function private.pi_guard_bound_packaging_source();

revoke all on all functions in schema private from public,anon,authenticated,service_role;
