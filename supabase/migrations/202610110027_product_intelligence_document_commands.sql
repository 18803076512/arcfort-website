-- User-session document commands. Completion remains metadata-only, never human approval.
create function public.pi_add_document_reference(request_uuid uuid,variant_uuid uuid,document_copy jsonb,
  prior_document_uuid uuid default null)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_add_document_reference(request_uuid,variant_uuid,document_copy,prior_document_uuid);
$$;
create function public.pi_begin_document_upload(request_uuid uuid,document_uuid uuid,manifest jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_begin_document_upload(request_uuid,document_uuid,manifest);
$$;
create function public.pi_complete_document_upload(request_uuid uuid,intent_uuid uuid)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_complete_document_upload(request_uuid,intent_uuid);
$$;
revoke all on function public.pi_add_document_reference(uuid,uuid,jsonb,uuid) from public,anon,authenticated,service_role;
revoke all on function public.pi_begin_document_upload(uuid,uuid,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.pi_complete_document_upload(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_add_document_reference(uuid,uuid,jsonb,uuid) to authenticated;
grant execute on function public.pi_begin_document_upload(uuid,uuid,jsonb) to authenticated;
grant execute on function public.pi_complete_document_upload(uuid,uuid) to authenticated;
