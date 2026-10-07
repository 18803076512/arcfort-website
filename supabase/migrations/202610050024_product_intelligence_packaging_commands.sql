-- M4-D3: narrow application commands and invoker reads. No database activation or data changes.
create function public.pi_add_packaging_source(request_uuid uuid,variant_uuid uuid,packaging_copy jsonb,source_copy jsonb,original_uuid uuid default null)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_add_packaging_source(request_uuid,variant_uuid,packaging_copy,source_copy,original_uuid);
$$;
revoke all on function public.pi_add_packaging_source(uuid,uuid,jsonb,jsonb,uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_add_packaging_source(uuid,uuid,jsonb,jsonb,uuid) to authenticated;
create function public.pi_propose_packaging_revision(request_uuid uuid,variant_uuid uuid,requested_slot integer,
  expected_revision bigint,packaging_copy jsonb,source_uuids uuid[],proposal_reason text,head_uuid uuid default null,original_uuid uuid default null)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_propose_packaging_revision(request_uuid,variant_uuid,requested_slot,expected_revision,packaging_copy,
    source_uuids,proposal_reason,head_uuid,original_uuid);
$$;
revoke all on function public.pi_propose_packaging_revision(uuid,uuid,integer,bigint,jsonb,uuid[],text,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_propose_packaging_revision(uuid,uuid,integer,bigint,jsonb,uuid[],text,uuid,uuid) to authenticated;
create function public.pi_submit_packaging_revision(request_uuid uuid,revision_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_submit_packaging_revision(request_uuid,revision_uuid,expected_revision,expected_digest);
$$;
revoke all on function public.pi_submit_packaging_revision(uuid,uuid,bigint,text) from public,anon,authenticated,service_role;
grant execute on function public.pi_submit_packaging_revision(uuid,uuid,bigint,text) to authenticated;
create function public.pi_review_packaging_revision(request_uuid uuid,revision_uuid uuid,expected_revision bigint,expected_digest text,
  decision text,review_reason text,approved_status public.pi_verification_status,confirmation jsonb,source_uuid uuid,conflict_resolution text,replacement jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_review_packaging_revision(request_uuid,revision_uuid,expected_revision,expected_digest,decision,review_reason,
    approved_status,confirmation,source_uuid,conflict_resolution,replacement);
$$;
revoke all on function public.pi_review_packaging_revision(uuid,uuid,bigint,text,text,text,public.pi_verification_status,jsonb,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.pi_review_packaging_revision(uuid,uuid,bigint,text,text,text,public.pi_verification_status,jsonb,uuid,text,jsonb) to authenticated;

create function public.pi_packaging_source_current(source_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select case when private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console() then
    exists(select 1 from public.packaging_source_bindings binding where binding.evidence_source_id=source_uuid
      and private.pi_packaging_source_matches(source_uuid,binding.product_variant_id,jsonb_build_object(
        'package_description',binding.package_description,'quantity',binding.quantity,'quantity_unit',binding.quantity_unit),binding.original_packaging_id))
    else false end;
$$;
create function public.pi_packaging_revision_fresh(revision_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select case when private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console() then
    exists(select 1 from public.packaging_revisions candidate where candidate.id=revision_uuid
      and candidate.proposal_digest=private.pi_packaging_revision_digest(candidate.id)) else false end;
$$;
revoke all on function public.pi_packaging_source_current(uuid),public.pi_packaging_revision_fresh(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_packaging_source_current(uuid),public.pi_packaging_revision_fresh(uuid) to authenticated;
create view public.pi_packaging_source_states with (security_invoker=true) as
select binding.evidence_source_id,binding.product_variant_id,binding.original_packaging_id,binding.package_description,binding.quantity,binding.quantity_unit,
  binding.source_kind,binding.assertion,binding.evidence_basis,binding.revision_label,binding.source_location,
  source.source_level,source.title,source.source_reference,source.evidence_date,source.owner_name,
  public.pi_packaging_source_current(binding.evidence_source_id) as source_current
from public.packaging_source_bindings binding join public.evidence_sources source on source.id=binding.evidence_source_id;
create view public.pi_packaging_revision_states with (security_invoker=true) as
select head.id as head_id,head.product_variant_id,head.slot,head.original_packaging_id,head.revision,
  candidate.id as revision_id,candidate.package_description,candidate.quantity,candidate.quantity_unit,candidate.review_state,
  candidate.verification_status,candidate.proposal_digest,candidate.submitted_digest,candidate.reason,candidate.created_at,
  public.pi_packaging_revision_fresh(candidate.id) as proposal_fresh,
  array(select binding.evidence_source_id from public.packaging_source_bindings binding
    where binding.product_variant_id=head.product_variant_id and binding.assertion='contradicts'
      and binding.original_packaging_id is not distinct from head.original_packaging_id
      and (head.original_packaging_id is not null or exists(select 1 from public.packaging_revisions related
        where related.head_id=head.id and related.package_description=binding.package_description
          and related.quantity is not distinct from binding.quantity and related.quantity_unit is not distinct from binding.quantity_unit))
    order by binding.evidence_source_id) as conflict_source_ids
from public.packaging_revision_heads head join public.packaging_revisions candidate on candidate.head_id=head.id and candidate.sequence=head.revision;
revoke all on public.pi_packaging_source_states,public.pi_packaging_revision_states from public,anon,authenticated,service_role;
grant select on public.pi_packaging_source_states,public.pi_packaging_revision_states to authenticated;
revoke all on all functions in schema private from public,anon,authenticated,service_role;
