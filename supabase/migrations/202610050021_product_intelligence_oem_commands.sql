-- M4-C3 application contracts. No adoption, activation, account change or public confirmation.
create function public.pi_add_oem_source(request_uuid uuid,variant_uuid uuid,requested_manufacturer text,
  requested_reference text,source_copy jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_add_oem_source(request_uuid,variant_uuid,requested_manufacturer,requested_reference,source_copy);
$$;
revoke all on function public.pi_add_oem_source(uuid,uuid,text,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.pi_add_oem_source(uuid,uuid,text,text,jsonb) to authenticated;
create function public.pi_propose_oem_revision(request_uuid uuid,variant_uuid uuid,requested_slot integer,
  expected_revision bigint,reference_copy jsonb,source_uuids uuid[],proposal_reason text,
  head_uuid uuid default null,original_uuid uuid default null)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_propose_oem_revision(request_uuid,variant_uuid,requested_slot,expected_revision,
    reference_copy,source_uuids,proposal_reason,head_uuid,original_uuid);
$$;
revoke all on function public.pi_propose_oem_revision(uuid,uuid,integer,bigint,jsonb,uuid[],text,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_propose_oem_revision(uuid,uuid,integer,bigint,jsonb,uuid[],text,uuid,uuid) to authenticated;
create function public.pi_submit_oem_revision(request_uuid uuid,revision_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_submit_oem_revision(request_uuid,revision_uuid,expected_revision,expected_digest);
$$;
revoke all on function public.pi_submit_oem_revision(uuid,uuid,bigint,text) from public,anon,authenticated,service_role;
grant execute on function public.pi_submit_oem_revision(uuid,uuid,bigint,text) to authenticated;
create function public.pi_review_oem_revision(request_uuid uuid,revision_uuid uuid,expected_revision bigint,expected_digest text,
  decision text,review_reason text,approved_status public.pi_verification_status,confirmation jsonb,
  source_uuid uuid,conflict_resolution text,replacement jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_review_oem_revision(request_uuid,revision_uuid,expected_revision,expected_digest,
    decision,review_reason,approved_status,confirmation,source_uuid,conflict_resolution,replacement);
$$;
revoke all on function public.pi_review_oem_revision(uuid,uuid,bigint,text,text,text,public.pi_verification_status,jsonb,uuid,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.pi_review_oem_revision(uuid,uuid,bigint,text,text,text,public.pi_verification_status,jsonb,uuid,text,jsonb) to authenticated;

create function public.pi_oem_source_current(source_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select case when private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console() then
    exists(select 1 from public.oem_source_bindings binding where binding.evidence_source_id=source_uuid
      and private.pi_oem_source_matches(source_uuid,binding.product_variant_id,binding.manufacturer_name,binding.reference_number))
    else false end;
$$;
create function public.pi_oem_revision_fresh(revision_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select case when private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console() then
    exists(select 1 from public.oem_revisions candidate where candidate.id=revision_uuid
      and candidate.proposal_digest=private.pi_oem_revision_digest(candidate.id)) else false end;
$$;
revoke all on function public.pi_oem_source_current(uuid),public.pi_oem_revision_fresh(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_oem_source_current(uuid),public.pi_oem_revision_fresh(uuid) to authenticated;
create view public.pi_oem_source_states with (security_invoker=true) as
select binding.evidence_source_id,binding.product_variant_id,binding.manufacturer_name,binding.reference_number,
  binding.source_kind,binding.assertion,binding.evidence_basis,binding.revision_label,binding.source_location,
  source.source_level,source.title,source.source_reference,source.evidence_date,source.owner_name,
  public.pi_oem_source_current(binding.evidence_source_id) as source_current
from public.oem_source_bindings binding join public.evidence_sources source on source.id=binding.evidence_source_id;
create view public.pi_oem_revision_states with (security_invoker=true) as
select head.id as head_id,head.product_variant_id,head.slot,head.source_oem_reference_id,head.revision,
  candidate.id as revision_id,candidate.manufacturer_name,candidate.reference_number,candidate.review_state,
  candidate.verification_status,candidate.proposal_digest,candidate.submitted_digest,candidate.reason,candidate.created_at,
  public.pi_oem_revision_fresh(candidate.id) as proposal_fresh
from public.oem_revision_heads head join public.oem_revisions candidate on candidate.head_id=head.id and candidate.sequence=head.revision;
revoke all on public.pi_oem_source_states,public.pi_oem_revision_states from public,anon,authenticated,service_role;
grant select on public.pi_oem_source_states,public.pi_oem_revision_states to authenticated;
revoke all on all functions in schema private from public,anon,authenticated,service_role;
