-- M4 application contract. No adoption, account change or factual confirmation occurs here.
-- The private commands independently enforce current actors, adopted scope and exact evidence.
create function public.pi_ensure_product_compatibility_entity(request_uuid uuid, variant_uuid uuid)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_ensure_product_compatibility_entity(request_uuid,variant_uuid);
$$;
revoke all on function public.pi_ensure_product_compatibility_entity(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_ensure_product_compatibility_entity(uuid,uuid) to authenticated;

create function public.pi_add_compatibility_source(
  request_uuid uuid, subject_uuid uuid, target_uuid uuid, relation_type text, scope_label text,
  asserted_role text, source_copy jsonb
)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_add_compatibility_source(request_uuid,subject_uuid,target_uuid,relation_type,scope_label,asserted_role,source_copy);
$$;
revoke all on function public.pi_add_compatibility_source(uuid,uuid,uuid,text,text,text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.pi_add_compatibility_source(uuid,uuid,uuid,text,text,text,jsonb) to authenticated;

create function public.pi_propose_compatibility_revision(
  request_uuid uuid, subject_uuid uuid, target_uuid uuid, relation_type text, scope_label text,
  expected_revision bigint, relation_copy jsonb, evidence_links jsonb, proposal_reason text, root_uuid uuid default null
)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_propose_compatibility_revision(request_uuid,root_uuid,subject_uuid,target_uuid,relation_type,
    scope_label,expected_revision,relation_copy,evidence_links,proposal_reason);
$$;
revoke all on function public.pi_propose_compatibility_revision(uuid,uuid,uuid,text,text,bigint,jsonb,jsonb,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_propose_compatibility_revision(uuid,uuid,uuid,text,text,bigint,jsonb,jsonb,text,uuid) to authenticated;

create function public.pi_submit_compatibility_review(request_uuid uuid, relationship_uuid uuid, expected_revision bigint, expected_digest text)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_submit_compatibility_review(request_uuid,relationship_uuid,expected_revision,expected_digest);
$$;
revoke all on function public.pi_submit_compatibility_review(uuid,uuid,bigint,text) from public,anon,authenticated,service_role;
grant execute on function public.pi_submit_compatibility_review(uuid,uuid,bigint,text) to authenticated;

create function public.pi_review_compatibility_revision(
  request_uuid uuid, relationship_uuid uuid, expected_revision bigint, expected_digest text,
  decision text, review_reason text, conflict_resolution text, replacement_copy jsonb, replacement_evidence jsonb
)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_review_compatibility_revision(request_uuid,relationship_uuid,expected_revision,expected_digest,
    decision,review_reason,conflict_resolution,replacement_copy,replacement_evidence);
$$;
revoke all on function public.pi_review_compatibility_revision(uuid,uuid,bigint,text,text,text,text,jsonb,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.pi_review_compatibility_revision(uuid,uuid,bigint,text,text,text,text,jsonb,jsonb) to authenticated;
revoke all on all functions in schema private from public,anon,authenticated,service_role;
