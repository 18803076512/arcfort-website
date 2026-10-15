-- A read-only current snapshot for byte inspection, never a rights/technical approval.
create function public.pi_document_original_snapshot(variant_uuid uuid,document_uuid uuid)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare result jsonb;
begin
  perform private.pi_require_console_reader();
  select jsonb_build_object(
    'variant_id',binding.product_variant_id,'document_id',binding.technical_document_id,
    'intent_id',intent.id,'actor_id',intent.actor_id,'storage_path',intent.storage_path,
    'manifest',intent.manifest,
    'snapshot_digest',encode(extensions.digest(jsonb_build_object(
      'binding',to_jsonb(binding),'intent',to_jsonb(intent),'completion',to_jsonb(done),
      'object_id',object_row.id,'version',object_row.version,'metadata',object_row.metadata,
      'bucket',object_row.bucket_id,'path',object_row.name,'owner',object_row.owner_id
    )::text,'sha256'),'hex')
  ) into result
  from public.technical_document_bindings binding
    join public.document_upload_intents intent on intent.technical_document_id=binding.technical_document_id
    join public.document_upload_completions done on done.intent_id=intent.id
    join storage.objects object_row on object_row.id=done.storage_object_id
  where binding.product_variant_id=variant_uuid and binding.technical_document_id=document_uuid
    and private.pi_document_upload_current(intent.id)
    and intent.storage_path='working-documents/' || intent.actor_id || '/' || intent.id || '/original.pdf'
    and object_row.bucket_id='pi-technical-evidence' and object_row.name=intent.storage_path
    and object_row.owner_id=intent.actor_id::text
    and object_row.version is not distinct from done.storage_version
    and object_row.metadata=done.storage_metadata
    and object_row.metadata->>'size'=intent.manifest->>'byte_size'
    and object_row.metadata->>'mimetype'='application/pdf';
  if result is null then raise exception 'The stored document snapshot is unavailable or changed.' using errcode='40001'; end if;
  return result;
end;
$$;
revoke all on function public.pi_document_original_snapshot(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_document_original_snapshot(uuid,uuid) to authenticated;
