-- M3.1b: private, atomic draft commands. No HTTP endpoint or public-source cutover.

create table private.pi_product_draft_heads (
  product_variant_id uuid primary key references public.product_variants(id),
  adoption_id uuid not null references private.pi_working_adoptions(id),
  origin text not null check (origin in ('adopted', 'created')),
  revision bigint not null check (revision >= 0)
);

create table private.pi_product_draft_revisions (
  product_variant_id uuid not null references private.pi_product_draft_heads(product_variant_id),
  revision bigint not null check (revision >= 0),
  name_en text not null check (length(btrim(name_en)) between 1 and 200),
  name_zh text not null check (length(name_zh) <= 200),
  model text not null check (length(model) <= 200),
  summary text not null check (length(summary) <= 1000),
  description text not null check (length(description) <= 10000),
  applications text not null check (length(applications) <= 2000),
  actor_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (product_variant_id, revision)
);

create table private.pi_command_receipts (
  actor_id uuid not null references auth.users(id),
  command text not null,
  request_id uuid not null,
  payload_digest text not null check (payload_digest ~ '^[a-f0-9]{64}$'),
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (actor_id, command, request_id)
);

-- A private transaction-scoped capability, never a caller-settable GUC/boolean.
create table private.pi_mutation_context (
  backend_pid integer not null,
  transaction_id bigint not null,
  actor_id uuid not null,
  allowed_tables text[] not null,
  primary key (backend_pid, transaction_id)
);

do $$
declare relation_name text;
begin
  foreach relation_name in array array[
    'pi_product_draft_heads', 'pi_product_draft_revisions',
    'pi_command_receipts', 'pi_mutation_context'
  ] loop
    execute format('alter table private.%I enable row level security', relation_name);
    execute format('alter table private.%I force row level security', relation_name);
    execute format('revoke all on private.%I from public, anon, authenticated, service_role', relation_name);
  end loop;
  foreach relation_name in array array['pi_product_draft_revisions', 'pi_command_receipts'] loop
    execute format('create trigger immutable_rows before update or delete on private.%I for each row execute function public.pi_prevent_immutable_change()', relation_name);
    execute format('create trigger immutable_table before truncate on private.%I for each statement execute function public.pi_prevent_immutable_change()', relation_name);
  end loop;
end;
$$;

create trigger pi_product_draft_revisions_audit
after insert on private.pi_product_draft_revisions
for each row execute function public.pi_audit_row_change();

create or replace function private.pi_guard_working_catalog_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare active_adoption uuid;
begin
  select adoption_id into active_adoption
  from private.pi_working_authority_control where singleton for update;
  if not found then
    raise exception 'Working authority state is unavailable.' using errcode = '55000';
  end if;
  if active_adoption is not null and not exists (
    select 1 from private.pi_mutation_context context
    where context.backend_pid = pg_backend_pid()
      and context.transaction_id = txid_current()
      and context.actor_id = auth.uid()
      and tg_table_name = any(context.allowed_tables)
      and tg_op in ('INSERT', 'UPDATE')
  ) then
    raise exception 'Catalog replay/direct writes are frozen after working adoption.' using errcode = '55000';
  end if;
  return null;
end;
$$;

create function private.pi_begin_draft_command()
returns uuid language plpgsql security definer set search_path = '' as $$
declare active_adoption uuid;
begin
  -- Reject unauthorized callers before disclosing or locking adoption state.
  -- The role is checked again under a lock below to serialize concurrent revocation.
  if auth.uid() is null or coalesce(private.pi_request_jwt_role(), '') <> 'authenticated'
    or not public.pi_has_console_role(array['owner','editor']::public.pi_console_role[]) then
    raise exception 'An authenticated operator is required.' using errcode = '42501';
  end if;
  select adoption_id into active_adoption from private.pi_working_authority_control
    where singleton for update;
  if not found or active_adoption is null then
    raise exception 'Working adoption is required before draft editing.' using errcode = '55000';
  end if;
  perform 1 from public.console_user_roles
    where user_id = auth.uid() and role in ('owner','editor') and revoked_at is null for share;
  if not found then
    raise exception 'Only a current owner or editor may save product drafts.' using errcode = '42501';
  end if;
  return active_adoption;
end;
$$;

create function private.pi_validate_draft_copy(copy jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare field text; maximum integer; result jsonb := '{}'::jsonb;
begin
  if copy is null or jsonb_typeof(copy) <> 'object' or
    (select array_agg(key order by key) from jsonb_object_keys(copy) key) is distinct from
      array['applications','description','model','name_en','name_zh','summary']::text[]
  then
    raise exception 'Invalid product draft fields.' using errcode = '22023';
  end if;
  for field, maximum in select * from (values
    ('name_en',200),('name_zh',200),('model',200),('summary',1000),
    ('description',10000),('applications',2000)
  ) limits(field, maximum) loop
    if jsonb_typeof(copy -> field) <> 'string' or length(copy ->> field) > maximum then
      raise exception 'Invalid or oversized product draft field.' using errcode = '22023';
    end if;
    result := result || jsonb_build_object(field, btrim(copy ->> field));
  end loop;
  if regexp_replace(result ->> 'name_en', '[[:space:]]', '', 'g') = '' then
    raise exception 'An English product name is required.' using errcode = '22023';
  end if;
  return result;
end;
$$;

create function private.pi_draft_receipt(command_name text, request_uuid uuid, payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare receipt private.pi_command_receipts%rowtype;
begin
  if request_uuid is null then
    raise exception 'A command request ID is required.' using errcode = '22023';
  end if;
  select * into receipt from private.pi_command_receipts
    where actor_id = auth.uid() and command = command_name and request_id = request_uuid;
  if found then
    if receipt.payload_digest <> encode(extensions.digest(payload::text, 'sha256'), 'hex') then
      raise exception 'A request ID cannot be reused with a different payload.' using errcode = '40001';
    end if;
    return receipt.result;
  end if;
  return null;
end;
$$;

create function private.pi_record_draft_revision(variant_uuid uuid, revision_number bigint, copy jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into private.pi_product_draft_revisions (
    product_variant_id, revision, name_en, name_zh, model, summary, description, applications, actor_id
  ) values (
    variant_uuid, revision_number, copy ->> 'name_en', copy ->> 'name_zh', copy ->> 'model',
    copy ->> 'summary', copy ->> 'description', copy ->> 'applications', auth.uid()
  );
$$;

create function private.pi_save_product_draft(
  request_uuid uuid, variant_uuid uuid, expected_revision bigint, draft_copy jsonb
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  adoption_uuid uuid;
  variant public.product_variants%rowtype;
  product public.products%rowtype;
  current_revision bigint;
  result jsonb;
  normalized_copy jsonb;
  payload jsonb := jsonb_build_object('variant_id', variant_uuid, 'revision', expected_revision, 'copy', draft_copy);
begin
  adoption_uuid := private.pi_begin_draft_command();
  normalized_copy := private.pi_validate_draft_copy(draft_copy);
  result := private.pi_draft_receipt('save_product_draft', request_uuid, payload);
  if result is not null then return result; end if;
  if variant_uuid is null or expected_revision is null or expected_revision < 0 then
    raise exception 'Invalid product draft identity or revision.' using errcode = '22023';
  end if;
  select * into variant from public.product_variants where id = variant_uuid;
  if not found then raise exception 'Draft is unavailable.' using errcode = '55000'; end if;
  select revision into current_revision from private.pi_product_draft_heads
    where product_variant_id = variant_uuid and adoption_id = adoption_uuid;
  if not found then
    if not exists (select 1 from private.pi_working_adoptions
      where id = adoption_uuid and variant_uuid = any(pilot_variant_ids))
    then raise exception 'This product is outside the editable pilot.' using errcode = '55000'; end if;
    select * into product from public.products where id = variant.product_id;
    current_revision := 0;
    insert into private.pi_product_draft_heads values (variant_uuid, adoption_uuid, 'adopted', 0);
    perform private.pi_record_draft_revision(variant_uuid, 0, jsonb_build_object(
      'name_en', product.name_en, 'name_zh', coalesce(product.name_zh,''), 'model', coalesce(variant.model,''),
      'summary', coalesce(product.raw_snapshot ->> 'shortDescription',''),
      'description', coalesce(product.raw_snapshot ->> 'description',''),
      'applications', coalesce(product.raw_snapshot ->> 'application','')
    ));
  end if;
  if current_revision <> expected_revision then
    raise exception 'The draft revision changed; reload and compare.' using errcode = '40001';
  end if;
  insert into private.pi_mutation_context values (
    pg_backend_pid(), txid_current(), auth.uid(), array['products','product_variants']
  );
  update public.products set name_en = normalized_copy ->> 'name_en',
    name_zh = nullif(normalized_copy ->> 'name_zh','') where id = variant.product_id;
  update public.product_variants set model = nullif(normalized_copy ->> 'model','') where id = variant_uuid;
  perform private.pi_record_draft_revision(variant_uuid, current_revision + 1, normalized_copy);
  update private.pi_product_draft_heads set revision = current_revision + 1 where product_variant_id = variant_uuid;
  result := jsonb_build_object('variant_id', variant_uuid, 'revision', current_revision + 1);
  insert into private.pi_command_receipts values (
    auth.uid(), 'save_product_draft', request_uuid, encode(extensions.digest(payload::text, 'sha256'),'hex'), result, now()
  );
  delete from private.pi_mutation_context where backend_pid = pg_backend_pid() and transaction_id = txid_current();
  return result;
end;
$$;

create function private.pi_create_product_draft(request_uuid uuid, identity jsonb, draft_copy jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  adoption_uuid uuid;
  category_uuid uuid;
  product_uuid uuid := extensions.gen_random_uuid();
  variant_uuid uuid := extensions.gen_random_uuid();
  normalized_copy jsonb;
  result jsonb;
  payload jsonb := jsonb_build_object('identity',identity,'copy',draft_copy);
begin
  adoption_uuid := private.pi_begin_draft_command();
  normalized_copy := private.pi_validate_draft_copy(draft_copy);
  result := private.pi_draft_receipt('create_product_draft', request_uuid, payload);
  if result is not null then return result; end if;
  if identity is null or jsonb_typeof(identity) <> 'object' or
    (select array_agg(key order by key) from jsonb_object_keys(identity) key)
      is distinct from array['sku','slug','source_reference']::text[]
    or jsonb_typeof(identity -> 'sku') <> 'string'
    or jsonb_typeof(identity -> 'slug') <> 'string'
    or jsonb_typeof(identity -> 'source_reference') <> 'string'
    or (identity ->> 'sku') !~ '^AF-MIG-[A-Z0-9]{2,4}-[0-9]{4}$'
    or length(identity ->> 'slug') not between 3 and 160
    or (identity ->> 'slug') !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or length(btrim(identity ->> 'source_reference')) not between 3 and 1000
  then raise exception 'Invalid draft identity/source fields.' using errcode = '22023'; end if;
  select id into category_uuid from public.product_categories where route_slug = 'mig-mag-torch-parts';
  if not found then raise exception 'Pilot category is unavailable.' using errcode = '55000'; end if;
  insert into private.pi_mutation_context values (
    pg_backend_pid(), txid_current(), auth.uid(), array['products','product_variants']
  );
  insert into public.products (id, external_key, category_id, name_en, name_zh, product_type, source_type, source_reference)
  values (product_uuid, identity ->> 'sku', category_uuid, normalized_copy ->> 'name_en',
    nullif(normalized_copy ->> 'name_zh',''), 'welding-consumable', 'owner_intake', btrim(identity ->> 'source_reference'));
  insert into public.product_variants (
    id, product_id, category_id, sku, public_slug, model, lifecycle_state, is_shadow,
    legacy_status, legacy_data_status, legacy_image_status, legacy_compatibility_status, legacy_oem_status
  ) values (
    variant_uuid, product_uuid, category_uuid, identity ->> 'sku', identity ->> 'slug',
    nullif(normalized_copy ->> 'model',''), 'DRAFT', false, 'draft', 'needs_review', 'needs_photo', 'unverified', 'unknown'
  );
  insert into private.pi_product_draft_heads values (variant_uuid, adoption_uuid, 'created', 1);
  perform private.pi_record_draft_revision(variant_uuid, 1, normalized_copy);
  result := jsonb_build_object('variant_id', variant_uuid, 'revision', 1);
  insert into private.pi_command_receipts values (
    auth.uid(), 'create_product_draft', request_uuid, encode(extensions.digest(payload::text, 'sha256'),'hex'), result, now()
  );
  delete from private.pi_mutation_context where backend_pid = pg_backend_pid() and transaction_id = txid_current();
  return result;
end;
$$;

revoke all on all functions in schema private from public, anon, authenticated, service_role;
