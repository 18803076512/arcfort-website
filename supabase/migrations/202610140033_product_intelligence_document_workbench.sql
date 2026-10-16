-- Bounded exact-document review reads. No publication or technical-fact projection.
create function private.pi_document_review_source_json(source_uuid uuid)
returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object('source_id',source.id,'dimension',binding.dimension,
    'source_kind',binding.source_kind,'source_level',source.source_level,'title',source.title,
    'source_reference',source.source_reference,'owner_name',source.owner_name,
    'evidence_basis',binding.evidence_basis,'evidence_date',source.evidence_date,
    'revision_label',binding.revision_label,'source_location',binding.source_location,
    'scope_note',binding.scope_note,'assertion',binding.assertion,'created_at',binding.created_at,
    'current',private.pi_document_source_matches(source.id,binding.product_variant_id,binding.technical_document_id,binding.dimension),
    'qualifies',private.pi_document_source_can_support_review(source.id,binding.product_variant_id,binding.technical_document_id,binding.dimension))
  from public.document_source_bindings binding join public.evidence_sources source on source.id=binding.evidence_source_id
  where source.id=source_uuid;
$$;
create function private.pi_document_review_candidate_json(candidate_uuid uuid,original_hash text,evidence_hash text)
returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object('candidate_id',candidate.id,'revision',candidate.sequence,'digest',candidate.proposal_digest,
    'scope_note',candidate.scope_note,'sources',candidate.evidence_source_ids,
    'original_digest',candidate.original_digest,'evidence_digest',candidate.evidence_digest,
    'verification_status',candidate.verification_status,'reason',candidate.reason,'created_at',candidate.created_at,
    'submitted',submission.candidate_id is not null,'decision',decision.decision,
    'review_reason',event.reason,'resolution',decision.conflict_resolution,'decided_at',decision.created_at,
    'fresh',coalesce(candidate.original_digest=original_hash and candidate.evidence_digest=evidence_hash,false),
    'observed',public.pi_document_review_observed(candidate.id),
    'human_valid',private.pi_document_review_approval_valid(candidate.id))
  from public.document_review_candidates candidate
    left join public.document_review_submissions submission on submission.candidate_id=candidate.id
    left join public.document_review_decisions decision on decision.candidate_id=candidate.id
    left join public.verification_events event on event.id=decision.event_id
  where candidate.id=candidate_uuid;
$$;
create function public.pi_read_document_review(variant_uuid uuid,document_uuid uuid,source_page integer,history_page integer)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare original_hash text; evidence_hash text; result jsonb;
begin
  perform private.pi_require_console_reader();
  if variant_uuid is null or document_uuid is null or source_page is null or history_page is null
    or source_page not between 1 and 10000 or history_page not between 1 and 10000 then
    raise exception 'Invalid document review scope or page.' using errcode='22023'; end if;
  if not exists(select 1 from public.technical_document_bindings where technical_document_id=document_uuid
    and product_variant_id=variant_uuid and private.pi_is_working_variant(variant_uuid)) then return null; end if;
  original_hash:=private.pi_document_review_original_digest(variant_uuid,document_uuid);
  evidence_hash:=private.pi_document_review_evidence_digest(document_uuid);
  with sources as materialized (
    select * from public.document_source_bindings where technical_document_id=document_uuid and product_variant_id=variant_uuid
  ), candidates as materialized (
    select * from public.document_review_candidates where technical_document_id=document_uuid
  ), latest as materialized (
    select * from candidates order by sequence desc limit 1
  ), current_review as materialized (
    select candidate.* from candidates candidate join public.document_review_currents current_row on current_row.candidate_id=candidate.id
    where current_row.technical_document_id=document_uuid
  ), source_rows as (
    select * from sources order by created_at desc,evidence_source_id desc limit 25 offset (source_page-1)*25
  ), history_rows as (
    select * from candidates order by sequence desc limit 25 offset (history_page-1)*25
  ) select jsonb_build_object(
    'document',jsonb_build_object('document_id',document.id,'variant_id',binding.product_variant_id,'sku',variant.sku,
      'title',document.title,'document_type',document.document_type,'source_kind',document.source_type,
      'source_level',document.source_level,'source_reference',document.source_reference,'owner_name',binding.owner_name,
      'source_location',binding.source_location,'scope_note',binding.scope_note,'issued_date',binding.issued_date,
      'revision_label',binding.revision_label,'prior_document_id',binding.prior_document_id,'created_at',binding.created_at,
      'subject_current',private.pi_document_reference_matches(document.id,variant_uuid),
      'upload_state',case when done.intent_id is not null then 'recorded' when intent.id is not null then 'pending' else 'missing' end,
      'filename',intent.manifest->>'filename','byte_size',(intent.manifest->>'byte_size')::bigint,
      'page_count',(intent.manifest->>'page_count')::integer,'upload_request_id',null),
    'original_current',original_hash is not null,'evidence_digest',evidence_hash,
    'revision',coalesce((select revision from public.document_review_heads where technical_document_id=document_uuid),0),
    'latest',(select private.pi_document_review_candidate_json(id,original_hash,evidence_hash) from latest),
    'current',(select private.pi_document_review_candidate_json(id,original_hash,evidence_hash) from current_review),
    'sources',jsonb_build_object('total',(select count(*) from sources),
      'items',coalesce((select jsonb_agg(private.pi_document_review_source_json(evidence_source_id)
        order by created_at desc,evidence_source_id desc) from source_rows),'[]'::jsonb)),
    'selected_sources',coalesce((select jsonb_agg(private.pi_document_review_source_json(evidence_source_id) order by evidence_source_id)
      from sources where evidence_source_id in (select unnest(evidence_source_ids) from latest
        union select unnest(evidence_source_ids) from current_review)),'[]'::jsonb),
    'history',jsonb_build_object('total',(select count(*) from candidates),
      'items',coalesce((select jsonb_agg(private.pi_document_review_candidate_json(id,original_hash,evidence_hash)
        order by sequence desc) from history_rows),'[]'::jsonb))) into result
  from public.technical_document_bindings binding join public.technical_documents document on document.id=binding.technical_document_id
    join public.product_variants variant on variant.id=binding.product_variant_id
    left join public.document_upload_intents intent on intent.technical_document_id=document.id
    left join public.document_upload_completions done on done.intent_id=intent.id
  where binding.technical_document_id=document_uuid and binding.product_variant_id=variant_uuid;
  if original_hash is distinct from private.pi_document_review_original_digest(variant_uuid,document_uuid)
    or evidence_hash is distinct from private.pi_document_review_evidence_digest(document_uuid) then
    raise exception 'Document evidence changed during read.' using errcode='40001'; end if;
  perform private.pi_require_console_reader();
  return result;
end;
$$;
revoke all on function public.pi_read_document_review(uuid,uuid,integer,integer) from public,anon,authenticated,service_role;
grant execute on function public.pi_read_document_review(uuid,uuid,integer,integer) to authenticated;
revoke all on all functions in schema private from public,anon,authenticated,service_role;
