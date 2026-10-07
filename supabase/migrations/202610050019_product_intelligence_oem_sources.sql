-- M4-C1: declared OEM/reference evidence, not a confirmed number or fitment relationship.
-- Original OEM records, product facts, compatibility and publication remain unchanged.

create table public.oem_source_bindings (
  evidence_source_id uuid primary key references public.evidence_sources(id),
  product_variant_id uuid not null references public.product_variants(id),
  manufacturer_name text not null check (length(manufacturer_name) between 1 and 120),
  reference_number text not null check (length(reference_number) between 1 and 100),
  assertion text not null check (assertion in ('supports','contradicts','reference_only')),
  source_kind text not null check (source_kind in
    ('company_record','official_manufacturer','technical_standard','secondary_reference')),
  evidence_basis text not null check (evidence_basis in
    ('factory_record','controlled_drawing','approved_sample','verified_reference',
      'company_catalog','manufacturer_catalog','standard_reference','secondary_reference')),
  revision_label text not null,
  source_location text not null,
  source_digest text not null check (source_digest ~ '^[a-f0-9]{64}$'),
  variant_digest text not null check (variant_digest ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint oem_source_target_text_check check (
    manufacturer_name=btrim(manufacturer_name) and reference_number=btrim(reference_number)
    and manufacturer_name !~ '[[:cntrl:]]' and reference_number !~ '[[:cntrl:]]'
    and regexp_replace(manufacturer_name,'[[:space:]]','','g')<>''
    and regexp_replace(reference_number,'[[:space:]]','','g')<>'')
);
create index oem_source_bindings_scope_idx on public.oem_source_bindings
  (product_variant_id,manufacturer_name,reference_number);
alter table public.oem_source_bindings enable row level security;
alter table public.oem_source_bindings force row level security;
revoke all on public.oem_source_bindings from public,anon,authenticated,service_role;
grant select on public.oem_source_bindings to authenticated;
create policy console_read on public.oem_source_bindings for select to authenticated
  using (public.pi_can_view_console());
create trigger working_authority_guard before insert or update or delete or truncate
on public.oem_source_bindings for each statement
execute function private.pi_guard_working_catalog_write();
create trigger immutable_oem_binding before update or delete on public.oem_source_bindings
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_oem_binding_table before truncate on public.oem_source_bindings
for each statement execute function public.pi_prevent_immutable_change();
create trigger audit_change after insert on public.oem_source_bindings
for each row execute function public.pi_audit_row_change();

create function private.pi_oem_variant_digest(variant_uuid uuid)
returns text language sql stable security definer set search_path = '' as $$
  select encode(extensions.digest(jsonb_build_object('id',id,'product_id',product_id,
    'category_id',category_id,'sku',sku,'model',model)::text,'sha256'),'hex')
  from public.product_variants where id=variant_uuid;
$$;

create function private.pi_check_oem_source_target(
  variant_uuid uuid, requested_manufacturer text, requested_reference text
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if variant_uuid is null or requested_manufacturer is null or requested_reference is null
    or length(requested_manufacturer) not between 1 and 120
    or length(requested_reference) not between 1 and 100
    or requested_manufacturer<>btrim(requested_manufacturer)
    or requested_reference<>btrim(requested_reference)
    or requested_manufacturer ~ '[[:cntrl:]]' or requested_reference ~ '[[:cntrl:]]'
    or regexp_replace(requested_manufacturer,'[[:space:]]','','g')=''
    or regexp_replace(requested_reference,'[[:space:]]','','g')='' then
    raise exception 'Exact bounded manufacturer and reference labels are required.' using errcode='22023';
  end if;
  if not coalesce(private.pi_is_working_variant(variant_uuid),false) then
    raise exception 'This OEM subject is outside the editable pilot.' using errcode='55000';
  end if;
  perform 1 from public.product_variants where id=variant_uuid for share;
  if not found then raise exception 'The OEM subject is unavailable.' using errcode='55000'; end if;
end;
$$;

create function private.pi_add_oem_source(
  request_uuid uuid, variant_uuid uuid, requested_manufacturer text,
  requested_reference text, source_copy jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare source_uuid uuid:=extensions.gen_random_uuid(); item text; source_date date;
  source_hash text; result jsonb; payload jsonb:=jsonb_build_object('variant',variant_uuid,
    'manufacturer',requested_manufacturer,'reference',requested_reference,'source',source_copy);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  perform private.pi_check_oem_source_target(variant_uuid,requested_manufacturer,requested_reference);
  result:=private.pi_draft_receipt('add_oem_source',request_uuid,payload);
  if result is not null then return result; end if;
  if source_copy is null or jsonb_typeof(source_copy)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(source_copy) key) is distinct from
    array['assertion','evidence_basis','evidence_date','owner_name','revision_label','source_kind',
      'source_level','source_location','source_reference','title']::text[] then
    raise exception 'Invalid OEM source fields.' using errcode='22023';
  end if;
  for item in select jsonb_object_keys(source_copy) loop
    if jsonb_typeof(source_copy->item)<>'string' or length(source_copy->>item)>2000
      or source_copy->>item<>btrim(source_copy->>item)
      or regexp_replace(source_copy->>item,'[[:space:]]','','g')='' then
      raise exception 'Invalid or oversized OEM source field.' using errcode='22023';
    end if;
  end loop;
  if source_copy->>'assertion' not in ('supports','contradicts','reference_only')
    or not ((source_copy->>'source_kind'='company_record' and source_copy->>'source_level'='A'
        and source_copy->>'evidence_basis' in ('factory_record','controlled_drawing','approved_sample',
          'verified_reference','company_catalog'))
      or (source_copy->>'source_kind'='official_manufacturer' and source_copy->>'source_level'='B'
        and source_copy->>'evidence_basis'='manufacturer_catalog')
      or (source_copy->>'source_kind'='technical_standard' and source_copy->>'source_level'='C'
        and source_copy->>'evidence_basis'='standard_reference')
      or (source_copy->>'source_kind'='secondary_reference' and source_copy->>'source_level'='D'
        and source_copy->>'evidence_basis'='secondary_reference'))
    or source_copy->>'evidence_date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'OEM source assertion, classification, basis or date is invalid.' using errcode='22023';
  end if;
  begin source_date:=(source_copy->>'evidence_date')::date;
  exception when datetime_field_overflow or invalid_datetime_format then
    raise exception 'OEM source date is invalid.' using errcode='22023';
  end;
  if source_date>current_date then
    raise exception 'OEM source date cannot be in the future.' using errcode='22023'; end if;
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['evidence_sources','oem_source_bindings']);
  insert into public.evidence_sources(id,external_key,source_type,source_level,title,source_reference,
    exact_subject,evidence_date,owner_name,raw_snapshot)
  values(source_uuid,'working-oem-source:' || source_uuid,source_copy->>'source_kind',
    (source_copy->>'source_level')::public.pi_source_level,source_copy->>'title',
    source_copy->>'source_reference',true,source_date,source_copy->>'owner_name',
    jsonb_build_object('evidence_basis',jsonb_build_array(source_copy->>'evidence_basis')));
  select encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex') into source_hash
    from public.evidence_sources source where id=source_uuid;
  insert into public.oem_source_bindings values(source_uuid,variant_uuid,requested_manufacturer,
    requested_reference,source_copy->>'assertion',source_copy->>'source_kind',source_copy->>'evidence_basis',
    source_copy->>'revision_label',source_copy->>'source_location',source_hash,
    private.pi_oem_variant_digest(variant_uuid),auth.uid(),now());
  return private.pi_finish_technical_command('add_oem_source',request_uuid,payload,
    jsonb_build_object('source_id',source_uuid,'source_digest',source_hash));
end;
$$;

create function private.pi_oem_source_matches(
  source_uuid uuid, variant_uuid uuid, requested_manufacturer text, requested_reference text
)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists(select 1 from public.oem_source_bindings binding
    join public.evidence_sources source on source.id=binding.evidence_source_id
    where source.id=source_uuid and binding.product_variant_id=variant_uuid
      and binding.manufacturer_name=requested_manufacturer and binding.reference_number=requested_reference
      and binding.variant_digest=private.pi_oem_variant_digest(variant_uuid)
      and binding.source_digest=encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex'));
$$;

-- Declared source eligibility only: not reference verification, human approval or compatibility.
create function private.pi_oem_source_can_support_review(
  source_uuid uuid, variant_uuid uuid, requested_manufacturer text, requested_reference text
)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.pi_oem_source_matches(source_uuid,variant_uuid,requested_manufacturer,requested_reference)
    and exists(select 1 from public.oem_source_bindings binding
      join public.evidence_sources source on source.id=binding.evidence_source_id
      where source.id=source_uuid and source.source_level='A' and source.exact_subject
        and binding.source_kind='company_record' and binding.assertion='supports'
        and binding.evidence_basis in ('factory_record','controlled_drawing','approved_sample','verified_reference'));
$$;

create function private.pi_guard_bound_oem_source()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists(select 1 from public.oem_source_bindings where evidence_source_id=old.id) then
    raise exception 'Bound OEM sources are immutable; append a new source revision.' using errcode='55000';
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
create trigger oem_source_immutable before update or delete on public.evidence_sources
for each row execute function private.pi_guard_bound_oem_source();

revoke all on all functions in schema private from public,anon,authenticated,service_role;
