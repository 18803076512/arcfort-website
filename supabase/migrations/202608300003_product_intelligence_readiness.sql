-- Read-only readiness projections and deterministic shadow reconciliation.

create view public.pi_variant_readiness
with (security_invoker = true)
as
with technical as (
  select
    product_variant_id,
    count(*) as technical_value_count,
    count(*) filter (where verification_status = 'CONFIRMED') as confirmed_technical_count,
    count(*) filter (where verification_status = 'DATA_CONFLICT') as technical_conflict_count,
    count(*) filter (
      where verification_status in ('NEEDS_FACTORY_CONFIRMATION', 'DATA_CONFLICT')
    ) as unresolved_technical_count
  from public.technical_values
  where product_variant_id is not null
  group by product_variant_id
), compatibility as (
  select
    entity.product_variant_id,
    count(relationship.id) as compatibility_count,
    count(relationship.id) filter (
      where relationship.verification_status = 'CONFIRMED'
    ) as confirmed_compatibility_count,
    count(relationship.id) filter (
      where relationship.verification_status = 'DATA_CONFLICT'
    ) as compatibility_conflict_count
  from public.compatibility_entities as entity
  left join public.compatibility_relationships as relationship
    on relationship.subject_entity_id = entity.id
  where entity.product_variant_id is not null
  group by entity.product_variant_id
), media as (
  select
    mapping.product_variant_id,
    count(asset.id) as media_count,
    count(asset.id) filter (
      where mapping.role = 'main'
        and asset.publication_status = 'search_eligible'
        and asset.usage_rights_status = 'approved'
        and asset.content_match_status = 'exact_product'
    ) as eligible_main_image_count,
    count(asset.id) filter (
      where mapping.role = 'main' and asset.publication_status = 'legacy_reference'
    ) as legacy_main_image_count
  from public.product_media as mapping
  join public.media_assets as asset on asset.id = mapping.media_asset_id
  group by mapping.product_variant_id
), seo as (
  select
    product_variant_id,
    count(*) as seo_record_count,
    count(*) filter (where publication_status in ('approved', 'published')) as approved_seo_count
  from public.seo_records
  where product_variant_id is not null
  group by product_variant_id
)
select
  variant.id,
  variant.sku,
  variant.public_slug,
  variant.lifecycle_state,
  variant.is_shadow,
  variant.legacy_status,
  variant.legacy_data_status,
  coalesce(technical.technical_value_count, 0)::integer as technical_value_count,
  coalesce(technical.confirmed_technical_count, 0)::integer as confirmed_technical_count,
  coalesce(technical.technical_conflict_count, 0)::integer as technical_conflict_count,
  coalesce(technical.unresolved_technical_count, 0)::integer as unresolved_technical_count,
  coalesce(compatibility.compatibility_count, 0)::integer as compatibility_count,
  coalesce(compatibility.confirmed_compatibility_count, 0)::integer
    as confirmed_compatibility_count,
  coalesce(compatibility.compatibility_conflict_count, 0)::integer
    as compatibility_conflict_count,
  coalesce(media.media_count, 0)::integer as media_count,
  coalesce(media.eligible_main_image_count, 0)::integer as eligible_main_image_count,
  coalesce(media.legacy_main_image_count, 0)::integer as legacy_main_image_count,
  coalesce(seo.seo_record_count, 0)::integer as seo_record_count,
  coalesce(seo.approved_seo_count, 0)::integer as approved_seo_count,
  (
    (variant.legacy_data_status <> 'confirmed')::integer
    + (coalesce(technical.confirmed_technical_count, 0) = 0)::integer
    + (coalesce(technical.unresolved_technical_count, 0) > 0)::integer
    + (coalesce(compatibility.compatibility_conflict_count, 0) > 0)::integer
    + (
      coalesce(compatibility.compatibility_count, 0) > 0
      and coalesce(compatibility.confirmed_compatibility_count, 0) = 0
    )::integer
    + (coalesce(media.eligible_main_image_count, 0) = 0)::integer
    + (coalesce(seo.approved_seo_count, 0) = 0)::integer
  ) as blocker_count
from public.product_variants as variant
left join technical on technical.product_variant_id = variant.id
left join compatibility on compatibility.product_variant_id = variant.id
left join media on media.product_variant_id = variant.id
left join seo on seo.product_variant_id = variant.id;

create view public.pi_dashboard_metrics
with (security_invoker = true)
as
select 'total_products'::text as metric, count(*)::bigint as value from public.product_variants
union all
select 'shadow_products', count(*) from public.product_variants where is_shadow
union all
select 'verified_products', count(*) from public.product_variants where lifecycle_state = 'VERIFIED'
union all
select 'ready_for_publish', count(*)
  from public.product_variants where lifecycle_state = 'READY_FOR_PUBLISH'
union all
select 'published_products', count(*) from public.product_variants where lifecycle_state = 'PUBLISHED'
union all
select 'needs_factory_confirmation', count(*)
  from public.technical_values where verification_status = 'NEEDS_FACTORY_CONFIRMATION'
union all
select 'data_conflicts', count(*)
  from public.technical_values where verification_status = 'DATA_CONFLICT'
union all
select 'missing_eligible_main_images', count(*)
  from public.pi_variant_readiness where eligible_main_image_count = 0
union all
select 'unconfirmed_compatibility', count(*)
  from public.compatibility_relationships where verification_status <> 'CONFIRMED';

create or replace function public.pi_current_shadow_counts()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'products', (select count(*) from public.product_variants),
    'activeProducts', (
      select count(*) from public.product_variants where legacy_status = 'active'
    ),
    'draftProducts', (
      select count(*) from public.product_variants where legacy_status = 'draft'
    ),
    'needsReviewProducts', (
      select count(*) from public.product_variants where legacy_data_status = 'needs_review'
    ),
    'categories', (select count(*) from public.product_categories),
    'series', (select count(*) from public.product_series),
    'seriesComponents', (select count(*) from public.series_components),
    'seriesComponentCandidates', (
      select count(*) from public.series_components where scope = 'variant'
    ),
    'seriesComponentFacts', (
      select count(*) from public.technical_values where series_component_id is not null
    ),
    'seriesComponentConflicts', (
      select count(*)
      from public.technical_values
      where series_component_id is not null and verification_status = 'DATA_CONFLICT'
    ),
    'technicalFacts', (
      select count(*) from public.technical_values where product_variant_id is not null
    ),
    'confirmedTechnicalFacts', (
      select count(*)
      from public.technical_values
      where product_variant_id is not null and verification_status = 'CONFIRMED'
    ),
    'compatibilityRelationships', (select count(*) from public.compatibility_relationships),
    'confirmedCompatibilityRelationships', (
      select count(*)
      from public.compatibility_relationships
      where verification_status = 'CONFIRMED'
    ),
    'mediaAssets', (select count(*) from public.media_assets),
    'searchEligibleMediaAssets', (
      select count(*) from public.media_assets where publication_status = 'search_eligible'
    )
  );
$$;

create or replace function public.pi_reconcile_shadow_batch(batch_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  batch public.import_batches%rowtype;
  actual_counts jsonb;
  result jsonb;
  is_match boolean;
  jwt_role text;
begin
  jwt_role := private.pi_request_jwt_role();
  if coalesce(jwt_role, '') <> 'service_role'
    and session_user <> 'postgres'
    and not public.pi_has_console_role(array['owner']::public.pi_console_role[])
  then
    raise exception 'Only the owner or a controlled service job may reconcile a shadow batch.'
      using errcode = '42501';
  end if;

  select * into batch from public.import_batches where id = batch_id for update;
  if not found then
    raise exception 'Shadow import batch % does not exist.', batch_id using errcode = 'P0002';
  end if;

  if not batch.is_shadow then
    raise exception 'Batch % is not a shadow import.', batch_id using errcode = '23514';
  end if;

  actual_counts := public.pi_current_shadow_counts();
  is_match := actual_counts = batch.expected_counts;
  result := jsonb_build_object(
    'matches', is_match,
    'expected', batch.expected_counts,
    'actual', actual_counts,
    'sourceRevision', batch.source_revision
  );

  update public.import_batches
  set imported_counts = actual_counts,
      reconciliation = result,
      status = (
        case when is_match then 'RECONCILED' else 'FAILED' end
      )::public.pi_import_status,
      completed_at = now(),
      failure_message = case when is_match then null else 'Shadow count reconciliation failed.' end
  where id = batch_id;

  return result;
end;
$$;

revoke all on function public.pi_current_shadow_counts() from public;
revoke all on function public.pi_reconcile_shadow_batch(uuid) from public;
grant execute on function public.pi_current_shadow_counts() to authenticated, service_role;
grant execute on function public.pi_reconcile_shadow_batch(uuid) to authenticated, service_role;

revoke all on public.pi_variant_readiness from anon;
revoke all on public.pi_dashboard_metrics from anon;
grant select on public.pi_variant_readiness to authenticated;
grant select on public.pi_dashboard_metrics to authenticated;

comment on view public.pi_variant_readiness is
  'Read-only blocker projection. It never changes lifecycle or verification state.';
comment on function public.pi_reconcile_shadow_batch(uuid) is
  'Compares a complete dedicated shadow database with the deterministic repository manifest.';
