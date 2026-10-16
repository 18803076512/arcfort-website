-- Bounded private library projection; no file bytes, Storage paths or approval fields.
create index technical_document_bindings_subject_page_idx
  on public.technical_document_bindings(product_variant_id,created_at desc,technical_document_id desc);
create function public.pi_read_document_references(variant_uuid uuid,page_number integer)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare result jsonb;
begin
  perform private.pi_require_console_reader();
  if page_number is null or page_number not between 1 and 10000 then
    raise exception 'Invalid document page.' using errcode='22023'; end if;
  with scoped as materialized (
    select binding.* from public.technical_document_bindings binding
    where (variant_uuid is null or binding.product_variant_id=variant_uuid)
      and private.pi_is_working_variant(binding.product_variant_id)
  ), page as (
    select * from scoped order by created_at desc,technical_document_id desc
    limit 25 offset (page_number-1)*25
  ), rows as (
    select page.created_at,page.technical_document_id,
      jsonb_build_object(
        'document_id',page.technical_document_id,'variant_id',page.product_variant_id,'sku',variant.sku,
        'title',document.title,'document_type',document.document_type,'source_kind',document.source_type,
        'source_level',document.source_level,'source_reference',document.source_reference,
        'owner_name',page.owner_name,'source_location',page.source_location,'scope_note',page.scope_note,
        'issued_date',page.issued_date,'revision_label',page.revision_label,
        'prior_document_id',page.prior_document_id,'created_at',page.created_at,
        'subject_current',private.pi_document_reference_matches(page.technical_document_id,page.product_variant_id),
        'upload_state',case when done.intent_id is not null then 'recorded'
          when intent.id is not null then 'pending' else 'missing' end,
        'filename',intent.manifest->>'filename','byte_size',(intent.manifest->>'byte_size')::bigint,
        'page_count',(intent.manifest->>'page_count')::integer,
        'upload_request_id',case when done.intent_id is null and intent.actor_id=auth.uid()
          and public.pi_has_console_role(array['owner','editor','reviewer']::public.pi_console_role[])
          then receipt.request_id else null end
      ) value
    from page join public.technical_documents document on document.id=page.technical_document_id
      join public.product_variants variant on variant.id=page.product_variant_id
      left join public.document_upload_intents intent on intent.technical_document_id=page.technical_document_id
      left join public.document_upload_completions done on done.intent_id=intent.id
      left join lateral (
        select command.request_id from private.pi_command_receipts command
        where command.actor_id=auth.uid() and command.command='begin_document_upload'
          and command.result->>'intent_id'=intent.id::text limit 1
      ) receipt on true
  ) select jsonb_build_object('total',(select count(*) from scoped),
      'items',coalesce((select jsonb_agg(value order by created_at desc,technical_document_id desc) from rows),'[]'::jsonb))
    into result;
  return result;
end;
$$;
revoke all on function public.pi_read_document_references(uuid,integer) from public,anon,authenticated,service_role;
grant execute on function public.pi_read_document_references(uuid,integer) to authenticated;
