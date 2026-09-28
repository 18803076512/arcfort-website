-- M3 application contract. No adoption is invoked and no role/account is created.
-- Public wrappers grant execution only to authenticated callers; private commands recheck current roles.
create function public.pi_create_product_draft(request_uuid uuid, identity jsonb, draft_copy jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_create_product_draft(request_uuid, identity, draft_copy);
$$;
revoke all on function public.pi_create_product_draft(uuid,jsonb,jsonb) from public, anon, authenticated, service_role;
grant execute on function public.pi_create_product_draft(uuid,jsonb,jsonb) to authenticated;

create function public.pi_save_product_draft(request_uuid uuid, variant_uuid uuid, expected_revision bigint, draft_copy jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_save_product_draft(request_uuid, variant_uuid, expected_revision, draft_copy);
$$;
revoke all on function public.pi_save_product_draft(uuid,uuid,bigint,jsonb) from public, anon, authenticated, service_role;
grant execute on function public.pi_save_product_draft(uuid,uuid,bigint,jsonb) to authenticated;

create function public.pi_add_technical_source(request_uuid uuid, variant_uuid uuid, field_uuid uuid, scope_label text, source_copy jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_add_technical_source(request_uuid, variant_uuid, field_uuid, scope_label, source_copy);
$$;
revoke all on function public.pi_add_technical_source(uuid,uuid,uuid,text,jsonb) from public, anon, authenticated, service_role;
grant execute on function public.pi_add_technical_source(uuid,uuid,uuid,text,jsonb) to authenticated;

create function public.pi_propose_technical_revision(request_uuid uuid, variant_uuid uuid, field_uuid uuid, scope_label text, expected_revision bigint, value_copy jsonb, evidence_links jsonb, proposal_reason text)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_propose_technical_revision(request_uuid, variant_uuid, field_uuid, scope_label, expected_revision, value_copy, evidence_links, proposal_reason);
$$;
revoke all on function public.pi_propose_technical_revision(uuid,uuid,uuid,text,bigint,jsonb,jsonb,text) from public, anon, authenticated, service_role;
grant execute on function public.pi_propose_technical_revision(uuid,uuid,uuid,text,bigint,jsonb,jsonb,text) to authenticated;

create function public.pi_submit_technical_review(request_uuid uuid, value_uuid uuid, expected_revision bigint, expected_digest text)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_submit_technical_review(request_uuid, value_uuid, expected_revision, expected_digest);
$$;
revoke all on function public.pi_submit_technical_review(uuid,uuid,bigint,text) from public, anon, authenticated, service_role;
grant execute on function public.pi_submit_technical_review(uuid,uuid,bigint,text) to authenticated;

create function public.pi_review_technical_revision(request_uuid uuid, value_uuid uuid, expected_revision bigint, expected_digest text, decision text, review_reason text, conflict_resolution text, replacement_value jsonb, replacement_evidence jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_review_technical_revision(request_uuid, value_uuid, expected_revision, expected_digest, decision, review_reason, conflict_resolution, replacement_value, replacement_evidence);
$$;
revoke all on function public.pi_review_technical_revision(uuid,uuid,bigint,text,text,text,text,jsonb,jsonb) from public, anon, authenticated, service_role;
grant execute on function public.pi_review_technical_revision(uuid,uuid,bigint,text,text,text,text,jsonb,jsonb) to authenticated;

create function private.pi_require_console_reader()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or coalesce(private.pi_request_jwt_role(),'') <> 'authenticated'
    or not public.pi_can_view_console()
  then raise exception 'An authorized reader is required.' using errcode = '42501'; end if;
end;
$$;

create function private.pi_is_working_variant(variant_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from private.pi_working_authority_control control
    join private.pi_working_adoptions adoption on adoption.id = control.adoption_id
    where variant_uuid = any(adoption.pilot_variant_ids) or exists (
      select 1 from private.pi_product_draft_heads head where head.product_variant_id = variant_uuid
        and head.adoption_id = adoption.id and head.origin = 'created')
  );
$$;

create function public.pi_working_status()
returns table(adopted boolean, can_edit boolean, can_review boolean)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.pi_require_console_reader();
  return query select control.adoption_id is not null,
    control.adoption_id is not null and public.pi_has_console_role(array['owner','editor']::public.pi_console_role[]),
    control.adoption_id is not null and public.pi_has_console_role(array['owner','reviewer']::public.pi_console_role[])
  from private.pi_working_authority_control control where singleton;
end;
$$;

create function public.pi_product_working_states(variant_ids uuid[])
returns table(product_variant_id uuid, revision bigint, origin text)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.pi_require_console_reader();
  if variant_ids is null or cardinality(variant_ids) > 100 then
    raise exception 'Invalid product selection.' using errcode = '22023';
  end if;
  return query select variant.id, coalesce(head.revision,0),coalesce(head.origin,'adopted')
    from public.product_variants variant
    left join private.pi_product_draft_heads head on head.product_variant_id = variant.id
    where variant.id = any(variant_ids) and private.pi_is_working_variant(variant.id);
end;
$$;

create function public.pi_read_product_draft(variant_uuid uuid)
returns table(product_variant_id uuid, sku text, public_slug text, revision bigint, editable boolean,
  name_en text, name_zh text, model text, summary text, description text, applications text)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.pi_require_console_reader();
  return query select variant.id,variant.sku,variant.public_slug,coalesce(head.revision,0),
    private.pi_is_working_variant(variant.id) and public.pi_has_console_role(array['owner','editor']::public.pi_console_role[]),
    coalesce(copy.name_en,product.name_en),coalesce(copy.name_zh,product.name_zh,''),
    coalesce(copy.model,variant.model,''),coalesce(copy.summary,product.raw_snapshot ->> 'shortDescription',''),
    coalesce(copy.description,product.raw_snapshot ->> 'description',''),
    coalesce(copy.applications,product.raw_snapshot ->> 'application','')
  from public.product_variants variant join public.products product on product.id = variant.product_id
  left join private.pi_product_draft_heads head on head.product_variant_id = variant.id
  left join private.pi_product_draft_revisions copy on copy.product_variant_id = variant.id and copy.revision = head.revision
  where variant.id = variant_uuid;
end;
$$;

create function public.pi_read_product_draft_history(variant_uuid uuid, page_number integer)
returns table(revision bigint, name_en text, name_zh text, model text, summary text, description text,
  applications text, actor_id uuid, created_at timestamptz, total_count bigint)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.pi_require_console_reader();
  if page_number is null or page_number not between 1 and 10000 then
    raise exception 'Invalid history page.' using errcode = '22023';
  end if;
  return query select copy.revision,copy.name_en,copy.name_zh,copy.model,copy.summary,copy.description,
    copy.applications,copy.actor_id,copy.created_at,count(*) over()
    from private.pi_product_draft_revisions copy where copy.product_variant_id = variant_uuid
    order by copy.revision desc limit 25 offset (page_number - 1) * 25;
end;
$$;

revoke all on function public.pi_working_status() from public, anon, authenticated, service_role;
revoke all on function public.pi_product_working_states(uuid[]) from public, anon, authenticated, service_role;
revoke all on function public.pi_read_product_draft(uuid) from public, anon, authenticated, service_role;
revoke all on function public.pi_read_product_draft_history(uuid,integer) from public, anon, authenticated, service_role;
grant execute on function public.pi_working_status() to authenticated;
grant execute on function public.pi_product_working_states(uuid[]) to authenticated;
grant execute on function public.pi_read_product_draft(uuid) to authenticated;
grant execute on function public.pi_read_product_draft_history(uuid,integer) to authenticated;
revoke all on all functions in schema private from public, anon, authenticated, service_role;
