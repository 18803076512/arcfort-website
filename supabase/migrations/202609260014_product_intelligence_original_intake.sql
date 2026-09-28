-- Private original intake. Storage metadata is NOT cryptographic byte attestation or approval.
create table public.media_upload_intents (
  id uuid primary key,
  actor_id uuid not null references auth.users(id),
  product_variant_id uuid not null references public.product_variants(id),
  variant_digest text not null check (variant_digest ~ '^[a-f0-9]{64}$'),
  media_asset_id uuid not null unique,
  storage_path text not null unique,
  manifest jsonb not null,
  created_at timestamptz not null default now()
);
create table public.media_upload_completions (
  intent_id uuid primary key references public.media_upload_intents(id),
  media_asset_id uuid not null unique references public.media_assets(id),
  storage_object_id uuid not null unique,
  storage_version text,
  storage_metadata jsonb not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index media_upload_intents_actor_idx on public.media_upload_intents(actor_id,created_at);
create index media_upload_intents_variant_idx on public.media_upload_intents(product_variant_id);

do $$ declare name text; begin
  foreach name in array array['media_upload_intents','media_upload_completions'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('alter table public.%I force row level security',name);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',name);
    execute format('grant select on public.%I to authenticated',name);
    execute format('create policy console_read on public.%I for select to authenticated using (public.pi_can_view_console())',name);
    execute format('create trigger working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()',name);
    execute format('create trigger immutable_upload_row before update or delete on public.%I for each row execute function public.pi_prevent_immutable_change()',name);
    execute format('create trigger immutable_upload_table before truncate on public.%I for each statement execute function public.pi_prevent_immutable_change()',name);
    execute format('create trigger audit_change after insert on public.%I for each row execute function public.pi_audit_row_change()',name);
  end loop;
end $$;

create function private.pi_validate_original_manifest(manifest jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare item text;
begin
  if manifest is null or jsonb_typeof(manifest)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(manifest) key) is distinct from
    array['byte_size','file_hash','filename','height','mime_type','source_kind','source_owner','source_reference','width']::text[] then
    raise exception 'Invalid original-file manifest.' using errcode='22023';
  end if;
  foreach item in array array['file_hash','filename','mime_type','source_kind','source_owner','source_reference'] loop
    if jsonb_typeof(manifest->item)<>'string' or length(manifest->>item)>2000
      or manifest->>item<>btrim(manifest->>item)
      or regexp_replace(manifest->>item,'[[:space:]]','','g')='' then
      raise exception 'Invalid original-file text field.' using errcode='22023';
    end if;
  end loop;
  foreach item in array array['width','height','byte_size'] loop
    if jsonb_typeof(manifest->item)<>'number' or (manifest->>item) !~ '^[1-9][0-9]{0,8}$' then
      raise exception 'Invalid original-file dimensions or size.' using errcode='22023';
    end if;
  end loop;
  if (manifest->>'file_hash') !~ '^[a-f0-9]{64}$'
    or (manifest->>'byte_size')::bigint>26214400
    or (manifest->>'width')::bigint>16000 or (manifest->>'height')::bigint>16000
    or (manifest->>'width')::bigint*(manifest->>'height')::bigint>40000000
    or length(manifest->>'filename')>180 or (manifest->>'filename') ~ '[[:cntrl:]/\\:*?"<>|]'
    or left(manifest->>'filename',1)='.'
    or (manifest->>'filename') ~* '^(con|prn|aux|nul|com[1-9]|lpt[1-9])\.'
    or (manifest->>'source_kind') not in ('own_photo','supplier_photo','company_catalog','other_reference')
    or not ((manifest->>'mime_type'='image/jpeg' and manifest->>'filename' ~* '\.jpe?g$')
      or (manifest->>'mime_type'='image/png' and manifest->>'filename' ~* '\.png$')
      or (manifest->>'mime_type'='image/webp' and manifest->>'filename' ~* '\.webp$')
      or (manifest->>'mime_type'='image/tiff' and manifest->>'filename' ~* '\.tiff?$')) then
    raise exception 'Unsupported original-file manifest.' using errcode='22023';
  end if;
end;
$$;

create function private.pi_begin_media_upload(request_uuid uuid,variant_uuid uuid,manifest jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; intent_uuid uuid:=extensions.gen_random_uuid(); asset_uuid uuid:=extensions.gen_random_uuid();
  object_path text; payload jsonb:=jsonb_build_object('variant',variant_uuid,'manifest',manifest);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  if variant_uuid is null or not coalesce(private.pi_is_working_variant(variant_uuid),false) then
    raise exception 'This original is outside the editable pilot.' using errcode='55000';
  end if;
  perform 1 from public.product_variants where id=variant_uuid for share;
  if not found then raise exception 'The original-file subject is unavailable.' using errcode='55000'; end if;
  perform private.pi_validate_original_manifest(manifest);
  result:=private.pi_draft_receipt('begin_media_upload',request_uuid,payload);
  if result is not null then
    if not exists(select 1 from public.media_upload_intents intent
      where intent.id=(result->>'intent_id')::uuid
        and intent.variant_digest=private.pi_media_variant_digest(variant_uuid)) then
      raise exception 'The original-file subject changed; start a new intake.' using errcode='40001';
    end if;
    return result;
  end if;
  object_path:='working-originals/' || auth.uid() || '/' || asset_uuid || '/original.' ||
    case manifest->>'mime_type' when 'image/jpeg' then 'jpg' when 'image/png' then 'png'
      when 'image/webp' then 'webp' else 'tiff' end;
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),array['media_upload_intents']);
  insert into public.media_upload_intents values(intent_uuid,auth.uid(),variant_uuid,
    private.pi_media_variant_digest(variant_uuid),asset_uuid,object_path,manifest,now());
  return private.pi_finish_technical_command('begin_media_upload',request_uuid,payload,
    jsonb_build_object('intent_id',intent_uuid,'asset_id',asset_uuid,'storage_path',object_path));
end;
$$;

-- Read-only RLS predicate. A caller may discover only whether its own current intent is writable.
create function public.pi_can_upload_original(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(private.pi_request_jwt_role()='authenticated',false)
    and public.pi_has_console_role(array['owner','editor','reviewer']::public.pi_console_role[])
    and exists(select 1 from public.media_upload_intents intent
      where intent.storage_path=object_name and intent.actor_id=auth.uid()
        and private.pi_is_working_variant(intent.product_variant_id)
        and intent.variant_digest=private.pi_media_variant_digest(intent.product_variant_id)
        and not exists(select 1 from public.media_upload_completions done where done.intent_id=intent.id));
$$;
revoke all on function public.pi_can_upload_original(text) from public,anon,authenticated,service_role;
grant execute on function public.pi_can_upload_original(text) to authenticated;

-- Keep all previous policies for legacy files/evidence. Restrictive policies seal ONLY this namespace.
create policy pi_managed_original_insert on storage.objects as restrictive for insert to authenticated
with check (bucket_id<>'pi-product-originals' or name not like 'working-originals/%'
  or (owner_id=auth.uid()::text and public.pi_can_upload_original(name)));
create policy pi_managed_original_update on storage.objects as restrictive for update to authenticated
using (bucket_id<>'pi-product-originals' or name not like 'working-originals/%')
with check (bucket_id<>'pi-product-originals' or name not like 'working-originals/%');
create policy pi_managed_original_delete on storage.objects as restrictive for delete to authenticated
using (bucket_id<>'pi-product-originals' or name not like 'working-originals/%');

create function private.pi_complete_media_upload(request_uuid uuid,intent_uuid uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare intent public.media_upload_intents%rowtype; object_row storage.objects%rowtype;
  result jsonb; payload jsonb:=jsonb_build_object('intent',intent_uuid);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  select * into intent from public.media_upload_intents where id=intent_uuid and actor_id=auth.uid();
  if not found then raise exception 'The original-file intent is unavailable.' using errcode='42501'; end if;
  if not coalesce(private.pi_is_working_variant(intent.product_variant_id),false)
    or intent.variant_digest is distinct from private.pi_media_variant_digest(intent.product_variant_id) then
    raise exception 'The original-file subject changed.' using errcode='40001';
  end if;
  result:=private.pi_draft_receipt('complete_media_upload',request_uuid,payload);
  if result is not null then return result; end if;
  if exists(select 1 from public.media_upload_completions where intent_id=intent_uuid) then
    raise exception 'This upload is already completed; reuse its original request.' using errcode='40001';
  end if;
  select * into object_row from storage.objects where bucket_id='pi-product-originals'
    and name=intent.storage_path for share;
  if not found or object_row.owner_id is distinct from auth.uid()::text
    or object_row.metadata->>'size' is distinct from intent.manifest->>'byte_size'
    or object_row.metadata->>'mimetype' is distinct from intent.manifest->>'mime_type' then
    raise exception 'The stored original is missing or does not match its manifest.' using errcode='23514';
  end if;
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['media_assets','media_upload_completions']);
  insert into public.media_assets(id,external_key,storage_bucket,storage_path,file_hash,mime_type,width,height,
    source_kind,source_reference,source_file,source_owner,ownership_status,usage_rights_status,
    content_match_status,publication_status,raw_snapshot)
  values(intent.media_asset_id,'working-original:' || intent.media_asset_id,'pi-product-originals',intent.storage_path,
    intent.manifest->>'file_hash',intent.manifest->>'mime_type',(intent.manifest->>'width')::int,
    (intent.manifest->>'height')::int,intent.manifest->>'source_kind',intent.manifest->>'source_reference',
    intent.manifest->>'filename',intent.manifest->>'source_owner','unconfirmed','needs_confirmation',
    'needs_review','blocked',jsonb_build_object('intake_id',intent.id,'byte_verification','not_attested'));
  insert into public.media_upload_completions values(intent.id,intent.media_asset_id,object_row.id,
    object_row.version,object_row.metadata,auth.uid(),now());
  return private.pi_finish_technical_command('complete_media_upload',request_uuid,payload,
    jsonb_build_object('asset_id',intent.media_asset_id,'intent_id',intent.id));
end;
$$;

create function private.pi_guard_original_asset_identity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists(select 1 from public.media_upload_completions where media_asset_id=old.id)
    and (tg_op='DELETE' or (to_jsonb(new)-array['ownership_status','usage_rights_status','content_match_status',
      'publication_status','approved_by','approved_at','updated_at']) is distinct from
      (to_jsonb(old)-array['ownership_status','usage_rights_status','content_match_status',
      'publication_status','approved_by','approved_at','updated_at'])) then
    raise exception 'Original identity and provenance are immutable; ingest a new original.' using errcode='55000';
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
create trigger original_asset_identity_guard before update or delete on public.media_assets
for each row execute function private.pi_guard_original_asset_identity();
revoke all on all functions in schema private from public,anon,authenticated,service_role;
