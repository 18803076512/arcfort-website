-- Product Intelligence Console V1 security, RLS and immutable audit controls.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.pi_request_jwt_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role'
  );
$$;

create or replace function public.pi_has_console_role(required_roles public.pi_console_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.console_user_roles as role_assignment
    where role_assignment.user_id = auth.uid()
      and role_assignment.revoked_at is null
      and role_assignment.role = any(required_roles)
  );
$$;

create or replace function public.pi_can_view_console()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.pi_has_console_role(
    array['owner', 'editor', 'reviewer', 'publisher', 'viewer']::public.pi_console_role[]
  );
$$;

create or replace function public.pi_audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  before_row jsonb;
  after_row jsonb;
  entity_uuid uuid;
  jwt_role text;
begin
  if tg_op = 'INSERT' then
    after_row := to_jsonb(new);
    entity_uuid := nullif(after_row ->> 'id', '')::uuid;
  elsif tg_op = 'UPDATE' then
    before_row := to_jsonb(old);
    after_row := to_jsonb(new);
    entity_uuid := nullif(after_row ->> 'id', '')::uuid;
  else
    before_row := to_jsonb(old);
    entity_uuid := nullif(before_row ->> 'id', '')::uuid;
  end if;

  jwt_role := private.pi_request_jwt_role();

  insert into public.audit_events (
    table_name,
    operation,
    entity_id,
    actor_id,
    actor_kind,
    before_value,
    after_value
  )
  values (
    tg_table_name,
    tg_op,
    entity_uuid,
    auth.uid(),
    case
      when auth.uid() is not null then 'authenticated'
      when jwt_role = 'service_role' then 'service_role'
      else 'database'
    end,
    before_row,
    after_row
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function public.pi_prevent_immutable_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is append-only and cannot be %', tg_table_name, lower(tg_op)
    using errcode = '55000';
end;
$$;

create trigger audit_events_immutable
before update or delete on public.audit_events
for each row execute function public.pi_prevent_immutable_change();

create trigger verification_events_immutable
before update or delete on public.verification_events
for each row execute function public.pi_prevent_immutable_change();

create trigger release_qa_results_immutable
before update or delete on public.release_qa_results
for each row execute function public.pi_prevent_immutable_change();

create trigger publish_records_immutable
before update or delete on public.publish_records
for each row execute function public.pi_prevent_immutable_change();

do $$
declare
  relation_name text;
begin
  foreach relation_name in array array[
    'console_user_roles',
    'product_categories',
    'product_series',
    'products',
    'product_variants',
    'series_components',
    'technical_field_definitions',
    'evidence_sources',
    'technical_values',
    'technical_value_evidence',
    'oem_references',
    'packaging_records',
    'compatibility_entities',
    'compatibility_relationships',
    'compatibility_evidence',
    'media_assets',
    'product_media',
    'technical_documents',
    'entity_documents',
    'seo_records',
    'import_batches',
    'import_rows',
    'verification_events',
    'release_candidates',
    'release_items',
    'release_qa_results',
    'publish_records'
  ]
  loop
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each row execute function public.pi_audit_row_change()',
      relation_name || '_audit',
      relation_name
    );
  end loop;
end;
$$;

do $$
declare
  relation_name text;
begin
  foreach relation_name in array array[
    'console_user_roles',
    'product_categories',
    'product_series',
    'products',
    'product_variants',
    'series_components',
    'technical_field_definitions',
    'evidence_sources',
    'technical_values',
    'technical_value_evidence',
    'oem_references',
    'packaging_records',
    'compatibility_entities',
    'compatibility_relationships',
    'compatibility_evidence',
    'media_assets',
    'product_media',
    'technical_documents',
    'entity_documents',
    'seo_records',
    'import_batches',
    'import_rows',
    'verification_events',
    'release_candidates',
    'release_items',
    'release_qa_results',
    'publish_records',
    'audit_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', relation_name);
    execute format('alter table public.%I force row level security', relation_name);
  end loop;
end;
$$;

create policy console_user_roles_select_self_or_owner
on public.console_user_roles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.pi_has_console_role(array['owner']::public.pi_console_role[])
);

create policy console_user_roles_owner_insert
on public.console_user_roles
for insert
to authenticated
with check (public.pi_has_console_role(array['owner']::public.pi_console_role[]));

create policy console_user_roles_owner_update
on public.console_user_roles
for update
to authenticated
using (public.pi_has_console_role(array['owner']::public.pi_console_role[]))
with check (public.pi_has_console_role(array['owner']::public.pi_console_role[]));

create policy console_user_roles_owner_delete
on public.console_user_roles
for delete
to authenticated
using (public.pi_has_console_role(array['owner']::public.pi_console_role[]));

do $$
declare
  relation_name text;
begin
  foreach relation_name in array array[
    'product_categories',
    'product_series',
    'products',
    'product_variants',
    'series_components',
    'technical_field_definitions',
    'evidence_sources',
    'technical_values',
    'technical_value_evidence',
    'oem_references',
    'packaging_records',
    'compatibility_entities',
    'compatibility_relationships',
    'compatibility_evidence',
    'media_assets',
    'product_media',
    'technical_documents',
    'entity_documents',
    'seo_records',
    'import_batches',
    'import_rows',
    'verification_events',
    'release_candidates',
    'release_items',
    'release_qa_results',
    'publish_records',
    'audit_events'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.pi_can_view_console())',
      relation_name || '_console_select',
      relation_name
    );
  end loop;
end;
$$;

do $$
declare
  relation_name text;
begin
  foreach relation_name in array array[
    'product_categories',
    'product_series',
    'products',
    'product_variants',
    'series_components',
    'technical_field_definitions',
    'import_batches',
    'import_rows'
  ]
  loop
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.pi_has_console_role(array[''owner'', ''editor'']::public.pi_console_role[]))',
      relation_name || '_identity_insert',
      relation_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.pi_has_console_role(array[''owner'', ''editor'']::public.pi_console_role[])) with check (public.pi_has_console_role(array[''owner'', ''editor'']::public.pi_console_role[]))',
      relation_name || '_identity_update',
      relation_name
    );
  end loop;
end;
$$;

do $$
declare
  relation_name text;
begin
  foreach relation_name in array array[
    'evidence_sources',
    'technical_values',
    'technical_value_evidence',
    'oem_references',
    'packaging_records',
    'compatibility_entities',
    'compatibility_relationships',
    'compatibility_evidence',
    'media_assets',
    'product_media',
    'technical_documents',
    'entity_documents',
    'seo_records'
  ]
  loop
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.pi_has_console_role(array[''owner'', ''editor'', ''reviewer'']::public.pi_console_role[]))',
      relation_name || '_governed_insert',
      relation_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.pi_has_console_role(array[''owner'', ''editor'', ''reviewer'']::public.pi_console_role[])) with check (public.pi_has_console_role(array[''owner'', ''editor'', ''reviewer'']::public.pi_console_role[]))',
      relation_name || '_governed_update',
      relation_name
    );
  end loop;
end;
$$;

create policy verification_events_reviewer_insert
on public.verification_events
for insert
to authenticated
with check (
  actor_id = auth.uid()
  and public.pi_has_console_role(array['owner', 'reviewer']::public.pi_console_role[])
);

do $$
declare
  relation_name text;
begin
  foreach relation_name in array array[
    'release_candidates',
    'release_items',
    'release_qa_results'
  ]
  loop
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.pi_has_console_role(array[''owner'', ''publisher'']::public.pi_console_role[]))',
      relation_name || '_release_insert',
      relation_name
    );
  end loop;
end;
$$;

create policy release_candidates_release_update
on public.release_candidates
for update
to authenticated
using (public.pi_has_console_role(array['owner', 'publisher']::public.pi_console_role[]))
with check (public.pi_has_console_role(array['owner', 'publisher']::public.pi_console_role[]));

create policy release_items_release_update
on public.release_items
for update
to authenticated
using (public.pi_has_console_role(array['owner', 'publisher']::public.pi_console_role[]))
with check (public.pi_has_console_role(array['owner', 'publisher']::public.pi_console_role[]));

create policy publish_records_owner_insert
on public.publish_records
for insert
to authenticated
with check (
  published_by = auth.uid()
  and public.pi_has_console_role(array['owner']::public.pi_console_role[])
);

do $$
declare
  relation_name text;
begin
  foreach relation_name in array array[
    'console_user_roles',
    'product_categories',
    'product_series',
    'products',
    'product_variants',
    'series_components',
    'technical_field_definitions',
    'evidence_sources',
    'technical_values',
    'technical_value_evidence',
    'oem_references',
    'packaging_records',
    'compatibility_entities',
    'compatibility_relationships',
    'compatibility_evidence',
    'media_assets',
    'product_media',
    'technical_documents',
    'entity_documents',
    'seo_records',
    'import_batches',
    'import_rows',
    'verification_events',
    'release_candidates',
    'release_items',
    'release_qa_results',
    'publish_records',
    'audit_events'
  ]
  loop
    execute format('revoke all on table public.%I from anon, authenticated', relation_name);
    execute format('grant select on table public.%I to authenticated', relation_name);
    execute format(
      'grant select, insert, update, delete on table public.%I to service_role',
      relation_name
    );
  end loop;
end;
$$;
revoke all on function public.pi_has_console_role(public.pi_console_role[]) from public;
revoke all on function public.pi_can_view_console() from public;
revoke all on function public.pi_is_valid_lifecycle_transition(
  public.pi_product_lifecycle,
  public.pi_product_lifecycle
) from public;

grant usage on schema public to authenticated, service_role;
grant usage on type public.pi_console_role to authenticated, service_role;
grant usage on type public.pi_source_level to authenticated, service_role;
grant usage on type public.pi_product_lifecycle to authenticated, service_role;
grant usage on type public.pi_verification_status to authenticated, service_role;
grant usage on type public.pi_review_decision to authenticated, service_role;
grant usage on type public.pi_import_status to authenticated, service_role;
grant usage on type public.pi_release_status to authenticated, service_role;
grant usage on type public.pi_qa_result to authenticated, service_role;
grant execute on function public.pi_has_console_role(public.pi_console_role[]) to authenticated;
grant execute on function public.pi_can_view_console() to authenticated;
grant execute on function public.pi_is_valid_lifecycle_transition(
  public.pi_product_lifecycle,
  public.pi_product_lifecycle
) to authenticated, service_role;

grant insert, update on public.product_categories to authenticated;
grant insert, update on public.product_series to authenticated;
grant insert, update on public.products to authenticated;
grant insert, update on public.product_variants to authenticated;
grant insert, update on public.series_components to authenticated;
grant insert, update on public.technical_field_definitions to authenticated;
grant insert, update on public.evidence_sources to authenticated;
grant insert, update on public.technical_values to authenticated;
grant insert, update on public.technical_value_evidence to authenticated;
grant insert, update on public.oem_references to authenticated;
grant insert, update on public.packaging_records to authenticated;
grant insert, update on public.compatibility_entities to authenticated;
grant insert, update on public.compatibility_relationships to authenticated;
grant insert, update on public.compatibility_evidence to authenticated;
grant insert, update on public.media_assets to authenticated;
grant insert, update on public.product_media to authenticated;
grant insert, update on public.technical_documents to authenticated;
grant insert, update on public.entity_documents to authenticated;
grant insert, update on public.seo_records to authenticated;
grant insert, update on public.import_batches to authenticated;
grant insert, update on public.import_rows to authenticated;
grant insert on public.verification_events to authenticated;
grant insert, update on public.release_candidates to authenticated;
grant insert, update on public.release_items to authenticated;
grant insert on public.release_qa_results to authenticated;
grant insert on public.publish_records to authenticated;
grant insert, update, delete on public.console_user_roles to authenticated;

grant usage, select on sequence public.audit_events_id_seq to service_role;

comment on function public.pi_has_console_role(public.pi_console_role[]) is
  'RLS helper. A hidden navigation item is not an authorization control.';
comment on function public.pi_audit_row_change() is
  'Security-definer append-only audit writer for Product Intelligence tables.';
