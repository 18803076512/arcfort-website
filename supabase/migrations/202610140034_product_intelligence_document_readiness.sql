-- Registered document versions remain independently governed; lineage never silently supersedes one.
create function public.pi_document_original_current(document_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console() and exists(
    select 1 from public.technical_document_bindings binding where binding.technical_document_id=document_uuid
      and private.pi_document_review_original_digest(binding.product_variant_id,document_uuid) is not null),false);
$$;
create function public.pi_document_approval_valid(candidate_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console()
    and private.pi_document_review_approval_valid(candidate_uuid)
    and public.pi_document_review_observed(candidate_uuid),false);
$$;
revoke all on function public.pi_document_original_current(uuid),public.pi_document_approval_valid(uuid)
  from public,anon,authenticated,service_role;
grant execute on function public.pi_document_original_current(uuid),public.pi_document_approval_valid(uuid) to authenticated;

create view public.pi_effective_document_reviews with (security_invoker=true) as
with latest as (
  select distinct on (technical_document_id) id,technical_document_id,sequence
    from public.document_review_candidates order by technical_document_id,sequence desc
), state as (
  select binding.technical_document_id as document_id,binding.product_variant_id,binding.prior_document_id,
    public.pi_document_original_current(binding.technical_document_id) as original_current,
    latest.id as latest_candidate_id,coalesce(latest.sequence,0) as revision,
    (latest.id is not null and decision.candidate_id is null) as open_review,
    current_row.candidate_id as current_candidate_id,
    public.pi_document_approval_valid(current_row.candidate_id) as current_valid,
    exists(select 1 from public.document_source_bindings source
      where source.technical_document_id=binding.technical_document_id and source.assertion='contradicts') as has_conflict
  from public.technical_document_bindings binding
    left join latest on latest.technical_document_id=binding.technical_document_id
    left join public.document_review_decisions decision on decision.candidate_id=latest.id
    left join public.document_review_currents current_row on current_row.technical_document_id=binding.technical_document_id
)
select *,original_current and current_valid and not open_review as reviewed,false as publication_ready from state;

create view public.pi_document_readiness with (security_invoker=true) as
select variant.id as product_variant_id,
  count(document.document_id)::int as document_count,
  count(document.document_id) filter(where document.reviewed)::int as reviewed_document_count,
  count(document.document_id) filter(where not document.reviewed)::int as unresolved_document_count,
  count(document.document_id) filter(where not document.original_current)::int as unavailable_original_count,
  count(document.document_id) filter(where document.open_review)::int as open_document_review_count,
  count(document.document_id) filter(where document.current_candidate_id is not null and not document.current_valid)::int as invalid_document_approval_count,
  count(document.document_id) filter(where document.has_conflict and not document.reviewed)::int as document_conflict_count
from public.product_variants variant left join public.pi_effective_document_reviews document on document.product_variant_id=variant.id
group by variant.id;
revoke all on public.pi_effective_document_reviews,public.pi_document_readiness from public,anon,authenticated,service_role;
grant select on public.pi_effective_document_reviews,public.pi_document_readiness to authenticated;

-- Retain the existing twenty-column and nine-metric contracts, adding only one document blocker family.
create or replace view public.pi_variant_readiness with (security_invoker=true) as
with technical as (
  select product_variant_id,count(*) as technical_value_count,
    count(*) filter(where verification_status='CONFIRMED') as confirmed_technical_count,
    count(*) filter(where verification_status='DATA_CONFLICT') as technical_conflict_count,
    count(*) filter(where verification_status in ('NEEDS_FACTORY_CONFIRMATION','DATA_CONFLICT') or exists(
      select 1 from public.technical_revisions candidate where candidate.value_id=pi_effective_technical_values.id
        and candidate.review_state in ('proposed','pending'))) as unresolved_technical_count
  from public.pi_effective_technical_values where product_variant_id is not null group by product_variant_id
), compatibility as (
  select entity.product_variant_id,count(relationship.id) as compatibility_count,
    count(relationship.id) filter(where relationship.verification_status='CONFIRMED') as confirmed_compatibility_count,
    count(relationship.id) filter(where relationship.verification_status='DATA_CONFLICT') as compatibility_conflict_count
  from public.compatibility_entities entity left join public.pi_effective_compatibility_relationships relationship
    on relationship.subject_entity_id=entity.id where entity.product_variant_id is not null group by entity.product_variant_id
), media as (
  select mapping.product_variant_id,count(*) as media_count,
    count(*) filter(where mapping.role='main' and mapping.publication_ready) as eligible_main_image_count,
    count(*) filter(where mapping.role='main' and mapping.mapping_origin='legacy' and asset.publication_status='legacy_reference') as legacy_main_image_count,
    count(*) filter(where mapping.mapping_origin='open') as open_media_mapping_count,
    count(*) filter(where mapping.mapping_origin='current' and not mapping.review_valid) as invalid_current_media_mapping_count
  from public.pi_effective_media_mappings mapping join public.media_assets asset on asset.id=mapping.media_asset_id
  group by mapping.product_variant_id
), seo as (
  select product_variant_id,count(*) as seo_record_count,
    count(*) filter(where publication_status in ('approved','published')) as approved_seo_count
  from public.seo_records where product_variant_id is not null group by product_variant_id
)
select variant.id,variant.sku,variant.public_slug,variant.lifecycle_state,variant.is_shadow,variant.legacy_status,variant.legacy_data_status,
  coalesce(technical.technical_value_count,0)::int as technical_value_count,
  coalesce(technical.confirmed_technical_count,0)::int as confirmed_technical_count,
  coalesce(technical.technical_conflict_count,0)::int as technical_conflict_count,
  coalesce(technical.unresolved_technical_count,0)::int as unresolved_technical_count,
  coalesce(compatibility.compatibility_count,0)::int as compatibility_count,
  coalesce(compatibility.confirmed_compatibility_count,0)::int as confirmed_compatibility_count,
  coalesce(compatibility.compatibility_conflict_count,0)::int as compatibility_conflict_count,
  coalesce(media.media_count,0)::int as media_count,coalesce(media.eligible_main_image_count,0)::int as eligible_main_image_count,
  coalesce(media.legacy_main_image_count,0)::int as legacy_main_image_count,
  coalesce(seo.seo_record_count,0)::int as seo_record_count,coalesce(seo.approved_seo_count,0)::int as approved_seo_count,
  ((variant.legacy_data_status<>'confirmed')::int+(coalesce(technical.confirmed_technical_count,0)=0)::int
    +(coalesce(technical.unresolved_technical_count,0)>0)::int+(coalesce(compatibility.compatibility_conflict_count,0)>0)::int
    +(coalesce(compatibility.compatibility_count,0)>coalesce(compatibility.confirmed_compatibility_count,0))::int
    +(coalesce(media.eligible_main_image_count,0)=0)::int+(coalesce(seo.approved_seo_count,0)=0)::int
    +(coalesce(media.open_media_mapping_count,0)>0)::int+(coalesce(media.invalid_current_media_mapping_count,0)>0)::int
    +(coalesce(oem.unresolved_oem_count,0)>0)::int
    +(coalesce(packaging.unresolved_packaging_count,0)>0)::int
    +(coalesce(documents.unresolved_document_count,0)>0)::int) as blocker_count
from public.product_variants variant left join technical on technical.product_variant_id=variant.id
left join compatibility on compatibility.product_variant_id=variant.id left join media on media.product_variant_id=variant.id
left join seo on seo.product_variant_id=variant.id left join public.pi_oem_readiness oem on oem.product_variant_id=variant.id
left join public.pi_packaging_readiness packaging on packaging.product_variant_id=variant.id
left join public.pi_document_readiness documents on documents.product_variant_id=variant.id;
create or replace view public.pi_dashboard_metrics with (security_invoker=true) as
select 'total_products'::text as metric,count(*)::bigint as value from public.product_variants
union all select 'shadow_products',count(*) from public.product_variants where is_shadow
union all select 'verified_products',count(*) from public.pi_variant_readiness variant
  where lifecycle_state='VERIFIED' and not exists(select 1 from public.pi_media_mapping_readiness media
    where media.product_variant_id=variant.id and (media.open_media_mapping_count>0 or media.invalid_current_media_mapping_count>0))
    and not exists(select 1 from public.pi_oem_readiness oem where oem.product_variant_id=variant.id and oem.unresolved_oem_count>0)
    and not exists(select 1 from public.pi_packaging_readiness packaging where packaging.product_variant_id=variant.id and packaging.unresolved_packaging_count>0)
    and not exists(select 1 from public.pi_document_readiness documents where documents.product_variant_id=variant.id and documents.unresolved_document_count>0)
union all select 'ready_for_publish',count(*) from public.pi_variant_readiness where lifecycle_state='READY_FOR_PUBLISH' and blocker_count=0
union all select 'published_products',count(*) from public.product_variants where lifecycle_state='PUBLISHED'
union all select 'needs_factory_confirmation',count(*) from public.pi_effective_technical_values where verification_status='NEEDS_FACTORY_CONFIRMATION'
union all select 'data_conflicts',count(*) from public.pi_effective_technical_values where verification_status='DATA_CONFLICT'
union all select 'missing_eligible_main_images',count(*) from public.pi_variant_readiness where eligible_main_image_count=0
union all select 'unconfirmed_compatibility',count(*) from public.pi_effective_compatibility_relationships where verification_status<>'CONFIRMED';

create view public.pi_variant_document_readiness with (security_invoker=true) as
select variant.*,documents.document_count,documents.reviewed_document_count,documents.unresolved_document_count,
  documents.unavailable_original_count,documents.open_document_review_count,documents.invalid_document_approval_count,
  documents.document_conflict_count
from public.pi_variant_readiness variant join public.pi_document_readiness documents on documents.product_variant_id=variant.id;
revoke all on public.pi_variant_document_readiness from public,anon,authenticated,service_role;
grant select on public.pi_variant_document_readiness to authenticated;

create function private.pi_guard_current_documents()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.lifecycle_state in ('VERIFIED','READY_FOR_PUBLISH','QA_PASSED','PUBLISHED') and exists(
    select 1 from public.pi_effective_document_reviews document where document.product_variant_id=new.id and not document.reviewed) then
    raise exception 'Unresolved or invalid document review blocks publishable lifecycle states.' using errcode='23514';
  end if;
  return new;
end;
$$;
create trigger product_variants_01_document_guard before insert or update on public.product_variants
for each row execute function private.pi_guard_current_documents();
revoke all on all functions in schema private from public,anon,authenticated,service_role;
