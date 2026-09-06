-- ArcFort Weld Product Intelligence Console V1 - Milestone 1 data foundation.
-- This schema is a shadow authority. It must not feed public pages directly.

create extension if not exists pgcrypto with schema extensions;

create type public.pi_console_role as enum ('owner', 'editor', 'reviewer', 'publisher', 'viewer');
create type public.pi_source_level as enum ('A', 'B', 'C', 'D');
create type public.pi_verification_status as enum (
  'CONFIRMED',
  'OEM_REFERENCE',
  'STANDARD_REFERENCE',
  'NEEDS_FACTORY_CONFIRMATION',
  'DATA_CONFLICT'
);
create type public.pi_product_lifecycle as enum (
  'DRAFT',
  'INGESTED',
  'DATA_INCOMPLETE',
  'NEEDS_VERIFICATION',
  'VERIFIED',
  'READY_FOR_PUBLISH',
  'QA_PASSED',
  'PUBLISHED',
  'NEEDS_UPDATE'
);
create type public.pi_review_decision as enum ('APPROVE', 'EDIT', 'REJECT');
create type public.pi_import_status as enum (
  'PREPARED',
  'IMPORTING',
  'IMPORTED',
  'RECONCILED',
  'FAILED'
);
create type public.pi_release_status as enum (
  'DRAFT',
  'FROZEN',
  'QA_RUNNING',
  'PASS',
  'PASS_WITH_WARNINGS',
  'BLOCKED',
  'APPROVED',
  'PUBLISHED',
  'SUPERSEDED'
);
create type public.pi_qa_result as enum ('PASS', 'PASS_WITH_WARNINGS', 'BLOCKED');

create table public.console_user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.pi_console_role not null,
  granted_by uuid references auth.users (id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (user_id, role),
  constraint console_user_roles_active_dates_check
    check (revoked_at is null or revoked_at >= granted_at)
);

create table public.product_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  slug text not null unique,
  name_en text not null,
  name_zh text,
  route_slug text not null unique,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_categories_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint product_categories_route_slug_check
    check (route_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.product_series (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  category_id uuid not null references public.product_categories (id),
  name text not null,
  slug text not null unique,
  process text not null,
  source_type text not null,
  source_level public.pi_source_level not null,
  verification_status public.pi_verification_status not null,
  publication_status text not null default 'evidence_review',
  image_evidence_status text not null default 'needs_photos',
  source_reference text not null,
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_series_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint product_series_publication_status_check
    check (publication_status in ('published', 'evidence_review', 'blocked')),
  constraint product_series_image_status_check
    check (image_evidence_status in ('reviewed_product_images', 'catalog_page_only', 'needs_photos')),
  constraint product_series_approval_pair_check
    check ((approved_by is null) = (approved_at is null)),
  constraint product_series_published_gate_check
    check (
      publication_status <> 'published'
      or (
        verification_status = 'CONFIRMED'
        and approved_by is not null
        and approved_at is not null
        and image_evidence_status = 'reviewed_product_images'
      )
    )
);

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  category_id uuid not null references public.product_categories (id),
  name_en text not null,
  name_zh text,
  product_type text not null,
  source_type text not null,
  source_reference text,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_product_type_check
    check (product_type in ('welding-consumable', 'welding-equipment'))
);

create table public.product_variants (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null references public.products (id),
  category_id uuid not null references public.product_categories (id),
  sku text not null unique,
  public_slug text not null unique,
  model text,
  lifecycle_state public.pi_product_lifecycle not null default 'DRAFT',
  is_shadow boolean not null default true,
  legacy_status text not null,
  legacy_data_status text not null,
  legacy_image_status text not null,
  legacy_compatibility_status text not null,
  legacy_oem_status text not null,
  lifecycle_changed_at timestamptz not null default now(),
  lifecycle_changed_by uuid references auth.users (id),
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_sku_check check (sku ~ '^AF-[A-Z]{3}-[A-Z0-9]{2,4}-[0-9]{4}$'),
  constraint product_variants_slug_check
    check (public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint product_variants_legacy_status_check
    check (legacy_status in ('active', 'draft', 'archived')),
  constraint product_variants_legacy_data_status_check
    check (legacy_data_status in ('confirmed', 'pending', 'needs_review')),
  constraint product_variants_shadow_lifecycle_check
    check (
      not is_shadow
      or lifecycle_state in ('DRAFT', 'INGESTED', 'DATA_INCOMPLETE', 'NEEDS_VERIFICATION')
    )
);

create table public.series_components (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  series_id uuid not null references public.product_series (id),
  scope text not null,
  component_key text not null,
  component_name text not null,
  variant_key text not null,
  variant_label text not null,
  lifecycle_status text not null default 'evidence_only',
  target_variant_id uuid references public.product_variants (id),
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint series_components_scope_check check (scope in ('series', 'family', 'variant')),
  constraint series_components_lifecycle_check
    check (lifecycle_status in ('evidence_only', 'ready_for_sku', 'mapped_to_sku', 'blocked')),
  constraint series_components_mapping_check
    check ((lifecycle_status = 'mapped_to_sku') = (target_variant_id is not null))
);

create table public.technical_field_definitions (
  id uuid primary key default extensions.gen_random_uuid(),
  field_key text not null unique,
  label text not null,
  value_type text not null default 'text',
  default_unit text,
  applies_to text[] not null default '{}'::text[],
  is_critical boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint technical_field_value_type_check
    check (value_type in ('text', 'number', 'boolean', 'range', 'list'))
);

create table public.evidence_sources (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  source_type text not null,
  source_level public.pi_source_level,
  title text not null,
  source_reference text not null,
  exact_subject boolean not null default false,
  evidence_date date,
  owner_name text,
  private_storage_path text,
  file_hash text,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.technical_values (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  field_definition_id uuid not null references public.technical_field_definitions (id),
  product_variant_id uuid references public.product_variants (id),
  series_component_id uuid references public.series_components (id),
  value_text text not null,
  unit text,
  variant_label text,
  source_type text not null,
  source_level public.pi_source_level not null,
  verification_status public.pi_verification_status not null,
  public_note text,
  confirmation_requirements text[] not null default '{}'::text[],
  legacy_reviewed_by text,
  legacy_reviewed_date date,
  confirmed_by uuid references auth.users (id),
  confirmed_at timestamptz,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint technical_values_subject_check
    check (num_nonnulls(product_variant_id, series_component_id) = 1),
  constraint technical_values_confirmation_pair_check
    check ((confirmed_by is null) = (confirmed_at is null)),
  constraint technical_values_confirmation_gate_check
    check (
      verification_status <> 'CONFIRMED'
      or (source_level = 'A' and confirmed_by is not null and confirmed_at is not null)
    )
);

create table public.technical_value_evidence (
  technical_value_id uuid not null references public.technical_values (id) on delete cascade,
  evidence_source_id uuid not null references public.evidence_sources (id),
  evidence_role text not null default 'supporting',
  created_at timestamptz not null default now(),
  primary key (technical_value_id, evidence_source_id),
  constraint technical_value_evidence_role_check
    check (evidence_role in ('supporting', 'conflicting'))
);

create table public.oem_references (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  product_variant_id uuid references public.product_variants (id),
  series_component_id uuid references public.series_components (id),
  manufacturer_name text,
  reference_number text not null,
  source_level public.pi_source_level not null,
  verification_status public.pi_verification_status not null,
  evidence_source_id uuid references public.evidence_sources (id),
  confirmed_by uuid references auth.users (id),
  confirmed_at timestamptz,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oem_references_subject_check
    check (num_nonnulls(product_variant_id, series_component_id) = 1),
  constraint oem_references_confirmation_pair_check
    check ((confirmed_by is null) = (confirmed_at is null)),
  constraint oem_references_confirmation_gate_check
    check (
      verification_status <> 'CONFIRMED'
      or (
        source_level = 'A'
        and evidence_source_id is not null
        and confirmed_by is not null
        and confirmed_at is not null
      )
    )
);

create table public.packaging_records (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  product_variant_id uuid not null references public.product_variants (id),
  package_description text not null,
  quantity integer,
  quantity_unit text,
  moq_note text not null,
  lead_time_note text not null,
  source_level public.pi_source_level,
  verification_status public.pi_verification_status not null,
  evidence_source_id uuid references public.evidence_sources (id),
  confirmed_by uuid references auth.users (id),
  confirmed_at timestamptz,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packaging_quantity_check check (quantity is null or quantity > 0),
  constraint packaging_confirmation_pair_check
    check ((confirmed_by is null) = (confirmed_at is null)),
  constraint packaging_confirmation_gate_check
    check (
      verification_status <> 'CONFIRMED'
      or (
        source_level = 'A'
        and evidence_source_id is not null
        and confirmed_by is not null
        and confirmed_at is not null
      )
    )
);

create table public.compatibility_entities (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  entity_type text not null,
  label text not null,
  product_variant_id uuid references public.product_variants (id),
  product_series_id uuid references public.product_series (id),
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compatibility_entities_type_check
    check (entity_type in ('product', 'series', 'torch', 'machine', 'oem_reference')),
  constraint compatibility_entities_subject_check
    check (num_nonnulls(product_variant_id, product_series_id) <= 1)
);

create table public.compatibility_relationships (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  subject_entity_id uuid not null references public.compatibility_entities (id),
  target_entity_id uuid not null references public.compatibility_entities (id),
  relationship_type text not null,
  role text not null,
  relationship_status text not null,
  source_type text not null,
  source_level public.pi_source_level not null,
  verification_status public.pi_verification_status not null,
  buyer_confirmation_required boolean not null default true,
  confirmation_requirements text[] not null default '{}'::text[],
  legacy_reviewed_by text,
  legacy_reviewed_date date,
  confirmed_by uuid references auth.users (id),
  confirmed_at timestamptz,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint compatibility_relationships_endpoints_check
    check (subject_entity_id <> target_entity_id),
  constraint compatibility_relationships_status_check
    check (relationship_status in ('confirmed', 'reference_only', 'unverified')),
  constraint compatibility_confirmation_pair_check
    check ((confirmed_by is null) = (confirmed_at is null)),
  constraint compatibility_confirmation_gate_check
    check (
      relationship_status <> 'confirmed'
      or (
        verification_status = 'CONFIRMED'
        and source_level = 'A'
        and buyer_confirmation_required = false
        and confirmed_by is not null
        and confirmed_at is not null
      )
    )
);

create table public.compatibility_evidence (
  compatibility_relationship_id uuid not null
    references public.compatibility_relationships (id) on delete cascade,
  evidence_source_id uuid not null references public.evidence_sources (id),
  evidence_role text not null default 'supporting',
  created_at timestamptz not null default now(),
  primary key (compatibility_relationship_id, evidence_source_id),
  constraint compatibility_evidence_role_check
    check (evidence_role in ('supporting', 'conflicting'))
);

create table public.media_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  storage_bucket text,
  storage_path text,
  public_path text,
  file_hash text,
  mime_type text,
  width integer,
  height integer,
  source_kind text not null,
  source_reference text not null,
  source_file text,
  source_owner text,
  ownership_status text not null,
  usage_rights_status text not null,
  content_match_status text not null,
  publication_status text not null,
  legacy_reviewed_by text,
  legacy_reviewed_date date,
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_dimensions_check
    check ((width is null and height is null) or (width > 0 and height > 0)),
  constraint media_rights_status_check
    check (usage_rights_status in ('approved', 'needs_confirmation', 'restricted')),
  constraint media_match_status_check
    check (content_match_status in ('exact_product', 'product_family_reference', 'needs_review', 'rejected')),
  constraint media_publication_status_check
    check (publication_status in ('search_eligible', 'legacy_reference', 'display_only', 'blocked')),
  constraint media_approval_pair_check check ((approved_by is null) = (approved_at is null)),
  constraint media_search_eligible_gate_check
    check (
      publication_status <> 'search_eligible'
      or (
        usage_rights_status = 'approved'
        and content_match_status = 'exact_product'
        and source_owner is not null
        and approved_by is not null
        and approved_at is not null
      )
    )
);

create table public.product_media (
  id uuid primary key default extensions.gen_random_uuid(),
  product_variant_id uuid not null references public.product_variants (id),
  media_asset_id uuid not null references public.media_assets (id),
  role text not null,
  sort_order integer not null default 0,
  alt_text text not null,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_variant_id, media_asset_id),
  constraint product_media_role_check
    check (
      role in (
        'main', 'gallery', 'technical', 'dimension', 'packaging', 'bulk', 'front',
        '45_degree', 'thread_detail', 'hole_detail', 'surface_detail', 'application'
      )
    ),
  constraint product_media_sort_order_check check (sort_order >= 0)
);

create table public.technical_documents (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  title text not null,
  document_type text not null,
  storage_bucket text,
  storage_path text,
  public_url text,
  source_type text not null,
  source_level public.pi_source_level,
  source_reference text not null,
  usage_rights_status text not null default 'needs_confirmation',
  publication_status text not null default 'private',
  file_hash text,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint technical_documents_publication_check
    check (publication_status in ('private', 'review', 'public', 'blocked'))
);

create table public.entity_documents (
  id uuid primary key default extensions.gen_random_uuid(),
  technical_document_id uuid not null references public.technical_documents (id) on delete cascade,
  product_variant_id uuid references public.product_variants (id),
  product_series_id uuid references public.product_series (id),
  series_component_id uuid references public.series_components (id),
  relationship_role text not null,
  created_at timestamptz not null default now(),
  constraint entity_documents_subject_check
    check (num_nonnulls(product_variant_id, product_series_id, series_component_id) = 1)
);

create table public.seo_records (
  id uuid primary key default extensions.gen_random_uuid(),
  external_key text not null unique,
  entity_type text not null,
  product_category_id uuid references public.product_categories (id),
  product_series_id uuid references public.product_series (id),
  product_variant_id uuid references public.product_variants (id),
  locale text not null default 'en',
  primary_keyword text,
  search_intent text not null,
  title text not null,
  meta_description text not null,
  canonical_path text not null,
  publication_status text not null default 'shadow',
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  raw_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, canonical_path, locale),
  constraint seo_records_subject_check
    check (num_nonnulls(product_category_id, product_series_id, product_variant_id) = 1),
  constraint seo_records_canonical_path_check check (canonical_path ~ '^/'),
  constraint seo_records_approval_pair_check check ((approved_by is null) = (approved_at is null)),
  constraint seo_records_publication_status_check
    check (publication_status in ('shadow', 'draft', 'approved', 'blocked', 'published'))
);

create table public.import_batches (
  id uuid primary key,
  source_revision text not null unique,
  source_kind text not null,
  source_files jsonb not null,
  expected_counts jsonb not null,
  imported_counts jsonb,
  reconciliation jsonb,
  status public.pi_import_status not null default 'PREPARED',
  is_shadow boolean not null default true,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  failure_message text,
  constraint import_batches_shadow_check check (is_shadow),
  constraint import_batches_completion_check
    check (
      (status in ('RECONCILED', 'FAILED') and completed_at is not null)
      or (status not in ('RECONCILED', 'FAILED') and completed_at is null)
    )
);

create table public.import_rows (
  id uuid primary key,
  import_batch_id uuid not null references public.import_batches (id) on delete cascade,
  row_number integer not null,
  source_record_key text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  errors text[] not null default '{}'::text[],
  warnings text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  unique (import_batch_id, source_record_key),
  constraint import_rows_row_number_check check (row_number > 0)
);

create table public.verification_events (
  id uuid primary key default extensions.gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  field_key text,
  decision public.pi_review_decision not null,
  reason text not null,
  before_value jsonb,
  after_value jsonb,
  evidence_source_ids uuid[] not null default '{}'::uuid[],
  actor_id uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.release_candidates (
  id uuid primary key default extensions.gen_random_uuid(),
  release_key text not null unique,
  source_revision text not null,
  status public.pi_release_status not null default 'DRAFT',
  intended_destination text not null,
  frozen_snapshot_hash text,
  created_by uuid not null references auth.users (id),
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint release_candidates_approval_pair_check
    check ((approved_by is null) = (approved_at is null)),
  constraint release_candidates_approved_gate_check
    check (status not in ('APPROVED', 'PUBLISHED') or approved_by is not null)
);

create table public.release_items (
  id uuid primary key default extensions.gen_random_uuid(),
  release_candidate_id uuid not null references public.release_candidates (id) on delete cascade,
  entity_type text not null,
  entity_key text not null,
  frozen_snapshot jsonb not null,
  blocker_count integer not null default 0,
  warning_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (release_candidate_id, entity_type, entity_key),
  constraint release_items_counts_check check (blocker_count >= 0 and warning_count >= 0)
);

create table public.release_qa_results (
  id uuid primary key default extensions.gen_random_uuid(),
  release_candidate_id uuid not null references public.release_candidates (id) on delete cascade,
  result public.pi_qa_result not null,
  check_name text not null,
  evidence jsonb not null default '{}'::jsonb,
  executed_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.publish_records (
  id uuid primary key default extensions.gen_random_uuid(),
  release_candidate_id uuid not null unique references public.release_candidates (id),
  destination text not null,
  snapshot_hash text not null,
  commit_sha text,
  deployment_id text,
  live_verification jsonb,
  published_by uuid not null references auth.users (id),
  published_at timestamptz not null default now(),
  rollback_release_id uuid references public.release_candidates (id)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  table_name text not null,
  operation text not null,
  entity_id uuid,
  actor_id uuid references auth.users (id),
  actor_kind text not null,
  before_value jsonb,
  after_value jsonb,
  occurred_at timestamptz not null default now(),
  transaction_id bigint not null default txid_current(),
  constraint audit_events_operation_check check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  constraint audit_events_actor_kind_check
    check (actor_kind in ('authenticated', 'service_role', 'database'))
);

create index product_series_category_idx on public.product_series (category_id);
create index products_category_idx on public.products (category_id);
create index product_variants_product_idx on public.product_variants (product_id);
create index product_variants_lifecycle_idx on public.product_variants (lifecycle_state);
create index product_variants_shadow_idx on public.product_variants (is_shadow);
create index series_components_series_idx on public.series_components (series_id);
create index technical_values_variant_idx on public.technical_values (product_variant_id);
create index technical_values_component_idx on public.technical_values (series_component_id);
create index technical_values_status_idx on public.technical_values (verification_status);
create index evidence_sources_level_idx on public.evidence_sources (source_level);
create index compatibility_relationships_subject_idx
  on public.compatibility_relationships (subject_entity_id);
create index compatibility_relationships_target_idx
  on public.compatibility_relationships (target_entity_id);
create index compatibility_relationships_status_idx
  on public.compatibility_relationships (verification_status);
create index product_media_variant_role_idx
  on public.product_media (product_variant_id, role, sort_order);
create index media_assets_publication_idx on public.media_assets (publication_status);
create index seo_records_variant_idx on public.seo_records (product_variant_id);
create index import_rows_batch_idx on public.import_rows (import_batch_id);
create index verification_events_entity_idx
  on public.verification_events (entity_type, entity_id, created_at desc);
create index release_qa_results_candidate_idx
  on public.release_qa_results (release_candidate_id, created_at desc);
create index audit_events_entity_idx
  on public.audit_events (table_name, entity_id, occurred_at desc);

create or replace function public.pi_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.pi_is_valid_lifecycle_transition(
  old_state public.pi_product_lifecycle,
  new_state public.pi_product_lifecycle
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select old_state = new_state or (old_state, new_state) in (
    ('DRAFT', 'INGESTED'),
    ('INGESTED', 'DATA_INCOMPLETE'),
    ('INGESTED', 'NEEDS_VERIFICATION'),
    ('DATA_INCOMPLETE', 'NEEDS_VERIFICATION'),
    ('NEEDS_VERIFICATION', 'VERIFIED'),
    ('NEEDS_VERIFICATION', 'DATA_INCOMPLETE'),
    ('VERIFIED', 'READY_FOR_PUBLISH'),
    ('VERIFIED', 'NEEDS_UPDATE'),
    ('READY_FOR_PUBLISH', 'QA_PASSED'),
    ('READY_FOR_PUBLISH', 'NEEDS_UPDATE'),
    ('QA_PASSED', 'PUBLISHED'),
    ('QA_PASSED', 'NEEDS_UPDATE'),
    ('PUBLISHED', 'NEEDS_UPDATE'),
    ('NEEDS_UPDATE', 'NEEDS_VERIFICATION'),
    ('NEEDS_UPDATE', 'DATA_INCOMPLETE')
  );
$$;

create or replace function public.pi_enforce_lifecycle_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not public.pi_is_valid_lifecycle_transition(old.lifecycle_state, new.lifecycle_state) then
    raise exception 'Invalid product lifecycle transition: % -> %',
      old.lifecycle_state,
      new.lifecycle_state
      using errcode = '23514';
  end if;

  if old.lifecycle_state is distinct from new.lifecycle_state then
    new.lifecycle_changed_at = now();
    new.lifecycle_changed_by = auth.uid();
  end if;

  return new;
end;
$$;

create trigger product_variants_lifecycle_guard
before update of lifecycle_state on public.product_variants
for each row execute function public.pi_enforce_lifecycle_transition();

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
    'oem_references',
    'packaging_records',
    'compatibility_entities',
    'compatibility_relationships',
    'media_assets',
    'product_media',
    'technical_documents',
    'seo_records',
    'release_candidates'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.pi_set_updated_at()',
      relation_name || '_set_updated_at',
      relation_name
    );
  end loop;
end;
$$;

comment on schema public is 'ArcFort Weld application data. Product Intelligence tables are private console data.';
comment on table public.product_variants is
  'Sellable SKU variants. Shadow rows cannot progress beyond needs-verification states.';
comment on table public.technical_values is
  'Field-level technical candidates with source and verification status kept together.';
comment on table public.verification_events is
  'Append-only human approve/edit/reject decisions. Milestone 1 creates no confirmation events.';
comment on table public.audit_events is
  'Append-only material database changes generated by security-definer audit triggers.';
