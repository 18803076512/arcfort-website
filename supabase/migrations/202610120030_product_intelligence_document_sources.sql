-- Document review sources bind a declared assertion to one unchanged completed original.
-- Intake is neither byte observation nor human approval, and never changes a technical fact.
create table public.document_source_bindings (
  evidence_source_id uuid primary key references public.evidence_sources(id),
  technical_document_id uuid not null references public.technical_document_bindings(technical_document_id),
  product_variant_id uuid not null references public.product_variants(id),
  dimension text not null check (dimension in ('usage_rights','exact_scope')),
  assertion text not null check (assertion in ('supports','contradicts','reference_only')),
  source_kind text not null check (source_kind in
    ('company_record','official_manufacturer','technical_standard','secondary_reference')),
  evidence_basis text not null check (evidence_basis in
    ('company_ownership','supplier_authorization','license_record','controlled_drawing',
      'approved_sample','inspection_record','sku_record','company_catalog',
      'manufacturer_catalog','standard_reference','secondary_reference')),
  revision_label text check (length(revision_label) between 1 and 200),
  source_location text not null check (length(source_location) between 1 and 2000),
  scope_note text not null check (length(scope_note) between 1 and 2000),
  original_digest text not null check (original_digest ~ '^[a-f0-9]{64}$'),
  source_digest text not null check (source_digest ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index document_source_bindings_scope_idx on public.document_source_bindings
  (product_variant_id,technical_document_id,dimension,created_at,evidence_source_id);
alter table public.document_source_bindings enable row level security;
alter table public.document_source_bindings force row level security;
revoke all on public.document_source_bindings from public,anon,authenticated,service_role;
grant select on public.document_source_bindings to authenticated;
create policy console_read on public.document_source_bindings for select to authenticated
  using (public.pi_can_view_console());
create trigger working_authority_guard before insert or update or delete or truncate
on public.document_source_bindings for each statement execute function private.pi_guard_working_catalog_write();
create trigger immutable_document_source_binding before update or delete on public.document_source_bindings
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_document_source_binding_table before truncate on public.document_source_bindings
for each statement execute function public.pi_prevent_immutable_change();
create trigger audit_change after insert on public.document_source_bindings
for each row execute function public.pi_audit_row_change();

create function private.pi_check_document_source_copy(requested_dimension text,source_copy jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare item text; evidence_date date;
begin
  if requested_dimension is null or requested_dimension not in ('usage_rights','exact_scope')
    or source_copy is null or jsonb_typeof(source_copy)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(source_copy) key) is distinct from
    array['assertion','evidence_basis','evidence_date','owner_name','revision_label','scope_note',
      'source_kind','source_level','source_location','source_reference','title']::text[] then
    raise exception 'Only exact document evidence fields and dimensions are permitted.' using errcode='22023';
  end if;
  for item in select jsonb_object_keys(source_copy) loop
    if item in ('revision_label','evidence_date') and source_copy->item='null'::jsonb then continue; end if;
    if jsonb_typeof(source_copy->item)<>'string' or length(source_copy->>item)>2000
      or source_copy->>item<>btrim(source_copy->>item) or source_copy->>item ~ '[[:cntrl:]]'
      or regexp_replace(source_copy->>item,'[[:space:]]','','g')='' then
      raise exception 'Invalid or oversized document evidence field.' using errcode='22023';
    end if;
  end loop;
  if length(source_copy->>'title')>500 or length(source_copy->>'revision_label')>200
    or source_copy->>'assertion' not in ('supports','contradicts','reference_only')
    or not ((source_copy->>'source_kind'='company_record' and source_copy->>'source_level'='A'
      and (source_copy->>'evidence_basis'='company_catalog'
        or (requested_dimension='usage_rights' and source_copy->>'evidence_basis' in
          ('company_ownership','supplier_authorization','license_record'))
        or (requested_dimension='exact_scope' and source_copy->>'evidence_basis' in
          ('controlled_drawing','approved_sample','inspection_record','sku_record'))))
      or (source_copy->>'source_kind'='official_manufacturer' and source_copy->>'source_level'='B'
        and source_copy->>'evidence_basis'='manufacturer_catalog')
      or (source_copy->>'source_kind'='technical_standard' and source_copy->>'source_level'='C'
        and source_copy->>'evidence_basis'='standard_reference')
      or (source_copy->>'source_kind'='secondary_reference' and source_copy->>'source_level'='D'
        and source_copy->>'evidence_basis'='secondary_reference')) then
    raise exception 'Document source classification, assertion or dimension basis is invalid.' using errcode='22023';
  end if;
  if source_copy->'evidence_date'<>'null'::jsonb then
    if source_copy->>'evidence_date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      raise exception 'Document evidence date must be an ISO date or explicitly unknown.' using errcode='22023'; end if;
    begin evidence_date:=(source_copy->>'evidence_date')::date;
    exception when datetime_field_overflow or invalid_datetime_format then
      raise exception 'Document evidence date is invalid.' using errcode='22023'; end;
    if evidence_date>current_date then
      raise exception 'Document evidence date cannot be in the future.' using errcode='22023'; end if;
  end if;
end;
$$;

create function private.pi_add_document_source(
  request_uuid uuid,variant_uuid uuid,document_uuid uuid,requested_dimension text,source_copy jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare source_uuid uuid:=extensions.gen_random_uuid(); original jsonb; source_hash text; result jsonb;
  payload jsonb:=jsonb_build_object('variant',variant_uuid,'document',document_uuid,
    'dimension',requested_dimension,'source',source_copy);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  -- Replay only after current authority, role and exact original checks, never into a changed scope.
  original:=public.pi_document_original_snapshot(variant_uuid,document_uuid);
  result:=private.pi_draft_receipt('add_document_source',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_check_document_source_copy(requested_dimension,source_copy);
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['evidence_sources','document_source_bindings']);
  insert into public.evidence_sources(id,external_key,source_type,source_level,title,source_reference,
    exact_subject,evidence_date,owner_name,raw_snapshot)
  values(source_uuid,'working-document-source:' || source_uuid,source_copy->>'source_kind',
    (source_copy->>'source_level')::public.pi_source_level,source_copy->>'title',
    source_copy->>'source_reference',true,(source_copy->>'evidence_date')::date,source_copy->>'owner_name',
    jsonb_build_object('evidence_basis',jsonb_build_array(source_copy->>'evidence_basis')));
  select encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex') into source_hash
    from public.evidence_sources source where id=source_uuid;
  insert into public.document_source_bindings(evidence_source_id,technical_document_id,product_variant_id,
    dimension,assertion,source_kind,evidence_basis,revision_label,source_location,scope_note,
    original_digest,source_digest,created_by)
  values(source_uuid,document_uuid,variant_uuid,requested_dimension,source_copy->>'assertion',
    source_copy->>'source_kind',source_copy->>'evidence_basis',source_copy->>'revision_label',
    source_copy->>'source_location',source_copy->>'scope_note',original->>'snapshot_digest',source_hash,auth.uid());
  return private.pi_finish_technical_command('add_document_source',request_uuid,payload,
    jsonb_build_object('source_id',source_uuid,'source_digest',source_hash));
end;
$$;

create function private.pi_document_source_matches(
  source_uuid uuid,variant_uuid uuid,document_uuid uuid,requested_dimension text
)
returns boolean language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare original jsonb;
begin
  begin original:=public.pi_document_original_snapshot(variant_uuid,document_uuid);
  exception when serialization_failure then return false; end;
  return exists(select 1 from public.document_source_bindings binding
    join public.evidence_sources source on source.id=binding.evidence_source_id
    where source.id=source_uuid and binding.product_variant_id=variant_uuid
      and binding.technical_document_id=document_uuid and binding.dimension=requested_dimension
      and binding.original_digest=original->>'snapshot_digest'
      and binding.source_digest=encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex'));
end;
$$;

-- Eligibility for human rights/scope review only; never a technical value or publication approval.
create function private.pi_document_source_can_support_review(
  source_uuid uuid,variant_uuid uuid,document_uuid uuid,requested_dimension text
)
returns boolean language sql security definer set search_path = '' as $$
  select private.pi_document_source_matches(source_uuid,variant_uuid,document_uuid,requested_dimension)
    and exists(select 1 from public.document_source_bindings binding
      join public.evidence_sources source on source.id=binding.evidence_source_id
      where source.id=source_uuid and source.source_level='A' and source.exact_subject
        and source.evidence_date is not null and binding.source_kind='company_record' and binding.assertion='supports'
        and ((binding.dimension='usage_rights' and binding.evidence_basis in
          ('company_ownership','supplier_authorization','license_record'))
          or (binding.dimension='exact_scope' and binding.evidence_basis in
            ('controlled_drawing','approved_sample','inspection_record','sku_record'))));
$$;

create function private.pi_guard_bound_document_source()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists(select 1 from public.document_source_bindings where evidence_source_id=old.id) then
    raise exception 'Bound document evidence is immutable; append a new source revision.' using errcode='55000'; end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
create trigger document_source_immutable before update or delete on public.evidence_sources
for each row execute function private.pi_guard_bound_document_source();
revoke all on all functions in schema private from public,anon,authenticated,service_role;
