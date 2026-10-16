-- Original intake is not approval or trusted byte attestation. User-session commands only.
create function public.pi_begin_media_upload(request_uuid uuid,variant_uuid uuid,manifest jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  if not exists(select 1 from private.pi_command_receipts where actor_id=auth.uid()
      and command='begin_media_upload' and request_id=request_uuid)
    and (select count(*) from public.media_upload_intents where actor_id=auth.uid()
      and created_at>now()-interval '24 hours')>=100 then
    raise exception 'Original intake limit reached.' using errcode='54000';
  end if;
  return private.pi_begin_media_upload(request_uuid,variant_uuid,manifest);
end;
$$;
create function public.pi_complete_media_upload(request_uuid uuid,intent_uuid uuid)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_complete_media_upload(request_uuid,intent_uuid);
$$;
create function public.pi_read_original_intakes(variant_uuid uuid,page_number integer)
returns table(intent_id uuid,asset_id uuid,filename text,byte_size bigint,mime_type text,
  width integer,height integer,source_kind text,source_owner text,source_reference text,
  created_at timestamptz,completed boolean,subject_current boolean,total_count bigint)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.pi_require_console_reader();
  if variant_uuid is null or page_number is null or page_number not between 1 and 10000 then
    raise exception 'Invalid intake page.' using errcode='22023';
  end if;
  if not coalesce(private.pi_is_working_variant(variant_uuid),false) then return; end if;
  return query select intent.id,intent.media_asset_id,intent.manifest->>'filename',
    (intent.manifest->>'byte_size')::bigint,intent.manifest->>'mime_type',
    (intent.manifest->>'width')::int,(intent.manifest->>'height')::int,
    intent.manifest->>'source_kind',intent.manifest->>'source_owner',intent.manifest->>'source_reference',
    intent.created_at,done.intent_id is not null,
    intent.variant_digest=private.pi_media_variant_digest(variant_uuid),count(*) over()
  from public.media_upload_intents intent
  left join public.media_upload_completions done on done.intent_id=intent.id
  where intent.product_variant_id=variant_uuid
  order by intent.created_at desc,intent.id desc limit 25 offset (page_number-1)*25;
end;
$$;
revoke all on function public.pi_begin_media_upload(uuid,uuid,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.pi_complete_media_upload(uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.pi_read_original_intakes(uuid,integer) from public,anon,authenticated,service_role;
grant execute on function public.pi_begin_media_upload(uuid,uuid,jsonb) to authenticated;
grant execute on function public.pi_complete_media_upload(uuid,uuid) to authenticated;
grant execute on function public.pi_read_original_intakes(uuid,integer) to authenticated;
