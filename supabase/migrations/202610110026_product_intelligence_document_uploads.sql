-- M4-E2: append-only private PDF attachment to an unchanged E1 document reference.
-- Storage metadata is not byte attestation, document review, rights or technical approval.
create table public.document_upload_intents (
  id uuid primary key,
  actor_id uuid not null references auth.users(id),
  technical_document_id uuid not null unique references public.technical_document_bindings(technical_document_id),
  reference_digest text not null check (reference_digest ~ '^[a-f0-9]{64}$'),
  storage_path text not null unique,
  manifest jsonb not null,
  created_at timestamptz not null default now()
);
create table public.document_upload_completions (
  intent_id uuid primary key references public.document_upload_intents(id),
  storage_object_id uuid not null unique,
  storage_version text,
  storage_metadata jsonb not null,
  byte_verification text not null default 'not_attested' check (byte_verification='not_attested'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index document_upload_intents_actor_idx on public.document_upload_intents(actor_id,created_at);
do $$ declare name text; begin
  foreach name in array array['document_upload_intents','document_upload_completions'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('alter table public.%I force row level security',name);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',name);
    execute format('grant select on public.%I to authenticated',name);
    execute format('create policy console_read on public.%I for select to authenticated using (public.pi_can_view_console())',name);
    execute format('create trigger working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()',name);
    execute format('create trigger immutable_document_upload_row before update or delete on public.%I for each row execute function public.pi_prevent_immutable_change()',name);
    execute format('create trigger immutable_document_upload_table before truncate on public.%I for each statement execute function public.pi_prevent_immutable_change()',name);
    execute format('create trigger audit_change after insert on public.%I for each row execute function public.pi_audit_row_change()',name);
  end loop;
end $$;

create function private.pi_document_reference_digest(document_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(to_jsonb(binding)::text,'sha256'),'hex')
  from public.technical_document_bindings binding where technical_document_id=document_uuid;
$$;

create function private.pi_validate_document_manifest(manifest jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare item text;
begin
  if manifest is null or jsonb_typeof(manifest)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(manifest) key) is distinct from
    array['byte_size','file_hash','filename','mime_type','page_count']::text[] then
    raise exception 'Invalid document-file manifest.' using errcode='22023';
  end if;
  foreach item in array array['file_hash','filename','mime_type'] loop
    if jsonb_typeof(manifest->item)<>'string' or length(manifest->>item)>180
      or manifest->>item<>btrim(manifest->>item) or manifest->>item ~ '[[:cntrl:]]'
      or regexp_replace(manifest->>item,'[[:space:]]','','g')='' then
      raise exception 'Invalid document-file text field.' using errcode='22023';
    end if;
  end loop;
  foreach item in array array['byte_size','page_count'] loop
    if jsonb_typeof(manifest->item)<>'number' or (manifest->>item) !~ '^[1-9][0-9]{0,8}$' then
      raise exception 'Invalid document-file size or page count.' using errcode='22023';
    end if;
  end loop;
  if manifest->>'file_hash' !~ '^[a-f0-9]{64}$'
    or (manifest->>'byte_size')::bigint>26214400 or (manifest->>'page_count')::int>200
    or manifest->>'mime_type'<>'application/pdf' or manifest->>'filename' !~* '\.pdf$'
    or manifest->>'filename' ~ '[/\\:*?"<>|]'
    or left(manifest->>'filename',1)='.'
    or manifest->>'filename' ~* '^(con|prn|aux|nul|com[1-9]|lpt[1-9])\.' then
    raise exception 'Unsupported document-file manifest.' using errcode='22023';
  end if;
end;
$$;

create function private.pi_document_upload_current(intent_uuid uuid)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists(select 1 from public.document_upload_intents intent
    join public.technical_document_bindings binding on binding.technical_document_id=intent.technical_document_id
    where intent.id=intent_uuid and private.pi_is_working_variant(binding.product_variant_id)
      and private.pi_document_reference_matches(binding.technical_document_id,binding.product_variant_id)
      and intent.reference_digest=private.pi_document_reference_digest(binding.technical_document_id));
$$;

create function private.pi_begin_document_upload(request_uuid uuid,document_uuid uuid,manifest jsonb)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare binding public.technical_document_bindings%rowtype; result jsonb;
  intent_uuid uuid:=extensions.gen_random_uuid(); object_path text;
  payload jsonb:=jsonb_build_object('document',document_uuid,'manifest',manifest);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  select * into binding from public.technical_document_bindings where technical_document_id=document_uuid;
  if not found or not coalesce(private.pi_is_working_variant(binding.product_variant_id),false)
    or not private.pi_document_reference_matches(document_uuid,binding.product_variant_id) then
    raise exception 'An unchanged working document reference is required.' using errcode='55000';
  end if;
  perform 1 from public.product_variants where id=binding.product_variant_id for share;
  perform private.pi_validate_document_manifest(manifest);
  result:=private.pi_draft_receipt('begin_document_upload',request_uuid,payload);
  if result is not null then
    if not private.pi_document_upload_current((result->>'intent_id')::uuid) then
      raise exception 'Document reference changed; create a new reference version.' using errcode='40001';
    end if;
    return result;
  end if;
  if exists(select 1 from public.document_upload_intents where technical_document_id=document_uuid) then
    raise exception 'This reference already reserves an original; reuse the request or create a new version.' using errcode='40001';
  end if;
  if (select count(*) from public.document_upload_intents
    where actor_id=auth.uid() and created_at>now()-interval '24 hours')>=100 then
    raise exception 'Daily document intake limit reached.' using errcode='54000';
  end if;
  object_path:='working-documents/' || auth.uid() || '/' || intent_uuid || '/original.pdf';
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),array['document_upload_intents']);
  insert into public.document_upload_intents values(intent_uuid,auth.uid(),document_uuid,
    private.pi_document_reference_digest(document_uuid),object_path,manifest,now());
  return private.pi_finish_technical_command('begin_document_upload',request_uuid,payload,
    jsonb_build_object('intent_id',intent_uuid,'document_id',document_uuid,'storage_path',object_path));
end;
$$;

create function public.pi_can_upload_document(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(private.pi_request_jwt_role()='authenticated',false)
    and public.pi_has_console_role(array['owner','editor','reviewer']::public.pi_console_role[])
    and exists(select 1 from public.document_upload_intents intent
      where intent.storage_path=object_name and intent.actor_id=auth.uid()
        and private.pi_document_upload_current(intent.id)
        and not exists(select 1 from public.document_upload_completions done where done.intent_id=intent.id));
$$;
revoke all on function public.pi_can_upload_document(text) from public,anon,authenticated,service_role;
grant execute on function public.pi_can_upload_document(text) to authenticated;

-- Seal only the managed document namespace; legacy evidence and image policies stay unchanged.
create policy pi_managed_document_insert on storage.objects as restrictive for insert to authenticated
with check (bucket_id<>'pi-technical-evidence' or name not like 'working-documents/%'
  or (owner_id=auth.uid()::text and public.pi_can_upload_document(name)));
create policy pi_managed_document_update on storage.objects as restrictive for update to authenticated
using (bucket_id<>'pi-technical-evidence' or name not like 'working-documents/%')
with check (bucket_id<>'pi-technical-evidence' or name not like 'working-documents/%');
create policy pi_managed_document_delete on storage.objects as restrictive for delete to authenticated
using (bucket_id<>'pi-technical-evidence' or name not like 'working-documents/%');

create function private.pi_complete_document_upload(request_uuid uuid,intent_uuid uuid)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare intent public.document_upload_intents%rowtype; object_row storage.objects%rowtype;
  result jsonb; payload jsonb:=jsonb_build_object('intent',intent_uuid);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  select * into intent from public.document_upload_intents where id=intent_uuid and actor_id=auth.uid();
  if not found then raise exception 'The document upload intent is unavailable.' using errcode='42501'; end if;
  if not private.pi_document_upload_current(intent.id) then
    raise exception 'The document reference changed.' using errcode='40001';
  end if;
  result:=private.pi_draft_receipt('complete_document_upload',request_uuid,payload);
  if result is not null then return result; end if;
  if exists(select 1 from public.document_upload_completions where intent_id=intent_uuid) then
    raise exception 'This upload is completed; reuse the original request.' using errcode='40001';
  end if;
  select * into object_row from storage.objects where bucket_id='pi-technical-evidence'
    and name=intent.storage_path for share;
  if not found or object_row.owner_id is distinct from auth.uid()::text
    or object_row.metadata->>'size' is distinct from intent.manifest->>'byte_size'
    or object_row.metadata->>'mimetype' is distinct from intent.manifest->>'mime_type' then
    raise exception 'The stored document is missing or does not match the manifest.' using errcode='23514';
  end if;
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),array['document_upload_completions']);
  insert into public.document_upload_completions(intent_id,storage_object_id,storage_version,storage_metadata,created_by)
    values(intent.id,object_row.id,object_row.version,object_row.metadata,auth.uid());
  return private.pi_finish_technical_command('complete_document_upload',request_uuid,payload,
    jsonb_build_object('intent_id',intent.id,'document_id',intent.technical_document_id));
end;
$$;
revoke all on all functions in schema private from public,anon,authenticated,service_role;
