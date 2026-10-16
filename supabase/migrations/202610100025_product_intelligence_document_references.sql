-- M4-E1: immutable private document references, not uploaded or reviewed evidence.
-- Reuse the document/link tables; source metadata never confirms a technical fact.

create table public.technical_document_bindings (
  technical_document_id uuid primary key references public.technical_documents(id),
  entity_document_id uuid not null unique references public.entity_documents(id),
  product_variant_id uuid not null references public.product_variants(id),
  prior_document_id uuid references public.technical_document_bindings(technical_document_id),
  revision_label text check (length(revision_label) between 1 and 200),
  issued_date date,
  owner_name text not null check (length(owner_name) between 1 and 2000),
  source_location text not null check (length(source_location) between 1 and 2000),
  scope_note text not null check (length(scope_note) between 1 and 2000),
  document_digest text not null check (document_digest ~ '^[a-f0-9]{64}$'),
  link_digest text not null check (link_digest ~ '^[a-f0-9]{64}$'),
  variant_digest text not null check (variant_digest ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint document_reference_no_self_lineage check (prior_document_id<>technical_document_id)
);
create index technical_document_bindings_variant_idx on public.technical_document_bindings
  (product_variant_id,created_at,technical_document_id);
create index technical_document_bindings_prior_idx on public.technical_document_bindings(prior_document_id);
alter table public.technical_document_bindings enable row level security;
alter table public.technical_document_bindings force row level security;
revoke all on public.technical_document_bindings from public,anon,authenticated,service_role;
grant select on public.technical_document_bindings to authenticated;
create policy console_read on public.technical_document_bindings for select to authenticated
  using (public.pi_can_view_console());
create trigger working_authority_guard before insert or update or delete or truncate
on public.technical_document_bindings for each statement
execute function private.pi_guard_working_catalog_write();
create trigger immutable_document_binding before update or delete on public.technical_document_bindings
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_document_binding_table before truncate on public.technical_document_bindings
for each statement execute function public.pi_prevent_immutable_change();
create trigger audit_change after insert on public.technical_document_bindings
for each row execute function public.pi_audit_row_change();

create function private.pi_document_variant_digest(variant_uuid uuid)
returns text language sql stable security definer set search_path = '' as $$
  select encode(extensions.digest(jsonb_build_object('id',id,'product_id',product_id,
    'category_id',category_id,'sku',sku,'model',model)::text,'sha256'),'hex')
  from public.product_variants where id=variant_uuid;
$$;

create function private.pi_document_reference_matches(document_uuid uuid,variant_uuid uuid)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists(select 1 from public.technical_document_bindings binding
    join public.technical_documents document on document.id=binding.technical_document_id
    join public.entity_documents link on link.id=binding.entity_document_id
    where document.id=document_uuid and binding.product_variant_id=variant_uuid
      and link.technical_document_id=document.id and link.product_variant_id=variant_uuid
      and link.product_series_id is null and link.series_component_id is null
      and link.relationship_role='reference_only'
      and document.publication_status='private' and document.usage_rights_status='needs_confirmation'
      and document.storage_bucket is null and document.storage_path is null
      and document.public_url is null and document.file_hash is null
      and binding.document_digest=encode(extensions.digest(to_jsonb(document)::text,'sha256'),'hex')
      and binding.link_digest=encode(extensions.digest(to_jsonb(link)::text,'sha256'),'hex')
      and binding.variant_digest=private.pi_document_variant_digest(variant_uuid));
$$;

create function private.pi_check_document_reference_copy(document_copy jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare item text; issued date;
begin
  if document_copy is null or jsonb_typeof(document_copy)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(document_copy) key) is distinct from
    array['document_type','issued_date','owner_name','revision_label','scope_note','source_kind',
      'source_level','source_location','source_reference','title']::text[] then
    raise exception 'Only exact document reference metadata is permitted.' using errcode='22023';
  end if;
  for item in select jsonb_object_keys(document_copy) loop
    if item in ('revision_label','issued_date') and document_copy->item='null'::jsonb then
      continue;
    end if;
    if jsonb_typeof(document_copy->item)<>'string' or length(document_copy->>item)>2000
      or document_copy->>item<>btrim(document_copy->>item)
      or document_copy->>item ~ '[[:cntrl:]]'
      or regexp_replace(document_copy->>item,'[[:space:]]','','g')='' then
      raise exception 'Invalid or oversized document reference field.' using errcode='22023';
    end if;
  end loop;
  if length(document_copy->>'title')>500 or length(document_copy->>'revision_label')>200
    or document_copy->>'document_type' not in ('catalog','drawing','measurement_record',
      'inspection_record','manual','packaging_record','supplier_record','standard','other')
    or not ((document_copy->>'source_kind'='company_record' and document_copy->>'source_level'='A')
      or (document_copy->>'source_kind'='official_manufacturer' and document_copy->>'source_level'='B')
      or (document_copy->>'source_kind'='technical_standard' and document_copy->>'source_level'='C')
      or (document_copy->>'source_kind'='secondary_reference' and document_copy->>'source_level'='D')) then
    raise exception 'Document classification or bounded revision/title is invalid.' using errcode='22023';
  end if;
  if document_copy->'issued_date'<>'null'::jsonb then
    if document_copy->>'issued_date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      raise exception 'Document issue date must be an ISO date or explicitly unknown.' using errcode='22023';
    end if;
    begin issued:=(document_copy->>'issued_date')::date;
    exception when datetime_field_overflow or invalid_datetime_format then
      raise exception 'Document issue date is invalid.' using errcode='22023';
    end;
    if issued>current_date then
      raise exception 'Document issue date cannot be in the future.' using errcode='22023'; end if;
  end if;
end;
$$;

create function private.pi_add_document_reference(
  request_uuid uuid,variant_uuid uuid,document_copy jsonb,prior_document_uuid uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare document_uuid uuid:=extensions.gen_random_uuid(); link_uuid uuid:=extensions.gen_random_uuid();
  document_hash text; link_hash text; result jsonb;
  payload jsonb:=jsonb_build_object('variant',variant_uuid,'document',document_copy,'prior',prior_document_uuid);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  if variant_uuid is null or not coalesce(private.pi_is_working_variant(variant_uuid),false) then
    raise exception 'This document subject is outside the editable pilot.' using errcode='55000';
  end if;
  perform 1 from public.product_variants where id=variant_uuid for share;
  if not found then raise exception 'The document subject is unavailable.' using errcode='55000'; end if;
  if prior_document_uuid is not null
    and not private.pi_document_reference_matches(prior_document_uuid,variant_uuid) then
    raise exception 'Prior document must retain its unchanged exact SKU binding.' using errcode='22023';
  end if;
  result:=private.pi_draft_receipt('add_document_reference',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_check_document_reference_copy(document_copy);
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['technical_documents','entity_documents','technical_document_bindings']);
  insert into public.technical_documents(id,external_key,title,document_type,source_type,source_level,
    source_reference,usage_rights_status,publication_status,raw_snapshot)
  values(document_uuid,'working-document-reference:' || document_uuid,document_copy->>'title',
    document_copy->>'document_type',document_copy->>'source_kind',
    (document_copy->>'source_level')::public.pi_source_level,document_copy->>'source_reference',
    'needs_confirmation','private',jsonb_build_object('intake_kind','reference_only','file_inspection','not_performed'));
  insert into public.entity_documents(id,technical_document_id,product_variant_id,relationship_role)
  values(link_uuid,document_uuid,variant_uuid,'reference_only');
  select encode(extensions.digest(to_jsonb(document)::text,'sha256'),'hex') into document_hash
    from public.technical_documents document where id=document_uuid;
  select encode(extensions.digest(to_jsonb(link)::text,'sha256'),'hex') into link_hash
    from public.entity_documents link where id=link_uuid;
  insert into public.technical_document_bindings(technical_document_id,entity_document_id,product_variant_id,
    prior_document_id,revision_label,issued_date,owner_name,source_location,scope_note,document_digest,
    link_digest,variant_digest,created_by)
  values(document_uuid,link_uuid,variant_uuid,prior_document_uuid,document_copy->>'revision_label',
    (document_copy->>'issued_date')::date,document_copy->>'owner_name',document_copy->>'source_location',
    document_copy->>'scope_note',document_hash,link_hash,private.pi_document_variant_digest(variant_uuid),auth.uid());
  return private.pi_finish_technical_command('add_document_reference',request_uuid,payload,
    jsonb_build_object('document_id',document_uuid,'link_id',link_uuid,'document_digest',document_hash));
end;
$$;

create function private.pi_guard_document_reference()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists(select 1 from public.technical_document_bindings where technical_document_id=old.id) then
    raise exception 'Bound document references are immutable; append a new version.' using errcode='55000';
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
create trigger document_reference_immutable before update or delete on public.technical_documents
for each row execute function private.pi_guard_document_reference();

create function private.pi_guard_document_reference_link()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op<>'INSERT' then
    if exists(select 1 from public.technical_document_bindings
      where entity_document_id=old.id or technical_document_id=old.technical_document_id) then
      raise exception 'Bound document links are immutable.' using errcode='55000';
    end if;
  end if;
  if tg_op<>'DELETE' then
    if exists(select 1 from public.technical_document_bindings where technical_document_id=new.technical_document_id) then
      raise exception 'A bound reference cannot acquire another subject; register a separate reference.' using errcode='55000';
    end if;
    return new;
  end if;
  return old;
end;
$$;
create trigger document_reference_link_immutable before insert or update or delete on public.entity_documents
for each row execute function private.pi_guard_document_reference_link();

revoke all on all functions in schema private from public,anon,authenticated,service_role;
