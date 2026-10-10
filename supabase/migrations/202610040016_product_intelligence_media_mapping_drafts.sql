-- M4-B12: immutable mapping proposals, not effective images or human approval.
-- Original bytes and all existing product_media rows remain unchanged.
create table public.media_mapping_heads (
  id uuid primary key,
  product_variant_id uuid not null references public.product_variants(id),
  media_role text not null check (media_role in ('main','gallery','technical','dimension','packaging',
    'bulk','front','45_degree','thread_detail','hole_detail','surface_detail','application')),
  slot integer not null check (slot between 0 and 99 and (media_role <> 'main' or slot=0)),
  revision bigint not null check (revision > 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(product_variant_id,media_role,slot)
);
create table public.media_mapping_revisions (
  id uuid primary key,
  head_id uuid not null references public.media_mapping_heads(id),
  predecessor_id uuid references public.media_mapping_revisions(id),
  sequence bigint not null check (sequence > 0),
  media_asset_id uuid not null references public.media_assets(id),
  original_intent_id uuid not null references public.media_upload_intents(id),
  alt_text text not null check (length(alt_text) between 1 and 500),
  variant_digest text not null check (variant_digest ~ '^[a-f0-9]{64}$'),
  asset_digest text not null check (asset_digest ~ '^[a-f0-9]{64}$'),
  original_digest text not null check (original_digest ~ '^[a-f0-9]{64}$'),
  verification_status public.pi_verification_status not null check
    (verification_status in ('NEEDS_FACTORY_CONFIRMATION','DATA_CONFLICT')),
  review_state text not null check (review_state in ('proposed','pending','superseded')),
  proposal_digest text not null check (proposal_digest ~ '^[a-f0-9]{64}$'),
  submitted_digest text check (submitted_digest ~ '^[a-f0-9]{64}$'),
  reason text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(head_id,sequence)
);
create unique index media_mapping_one_open on public.media_mapping_revisions(head_id)
  where review_state in ('proposed','pending');
create index media_mapping_revisions_asset_idx on public.media_mapping_revisions(media_asset_id);
create table public.media_mapping_evidence (
  revision_id uuid not null references public.media_mapping_revisions(id),
  evidence_source_id uuid not null references public.media_source_bindings(evidence_source_id),
  primary key(revision_id,evidence_source_id)
);
create index media_mapping_evidence_source_idx on public.media_mapping_evidence(evidence_source_id);

do $$ declare name text; begin
  foreach name in array array['media_mapping_heads','media_mapping_revisions','media_mapping_evidence'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('alter table public.%I force row level security',name);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',name);
    execute format('grant select on public.%I to authenticated',name);
    execute format('create policy console_read on public.%I for select to authenticated using (public.pi_can_view_console())',name);
    execute format('create trigger working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()',name);
    execute format('create trigger immutable_mapping_table before truncate on public.%I for each statement execute function public.pi_prevent_immutable_change()',name);
    execute format('create trigger audit_change after insert or update on public.%I for each row execute function public.pi_audit_row_change()',name);
  end loop;
end $$;
create trigger immutable_mapping_evidence before update or delete on public.media_mapping_evidence
for each row execute function public.pi_prevent_immutable_change();

-- This validates recorded object identity/metadata, never the actual raster bytes.
create function private.pi_media_original_digest(variant_uuid uuid,asset_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(jsonb_build_object('intent',to_jsonb(intent),'completion',to_jsonb(done),
    'object',jsonb_build_object('id',object.id,'bucket',object.bucket_id,'name',object.name,
      'owner',object.owner_id,'version',object.version,'metadata',object.metadata))::text,'sha256'),'hex')
  from public.media_upload_intents intent
  join public.media_upload_completions done on done.intent_id=intent.id and done.media_asset_id=intent.media_asset_id
  join public.media_assets asset on asset.id=done.media_asset_id
  join storage.objects object on object.id=done.storage_object_id
  where intent.product_variant_id=variant_uuid and asset.id=asset_uuid
    and intent.variant_digest=private.pi_media_variant_digest(variant_uuid)
    and asset.storage_bucket='pi-product-originals' and object.bucket_id=asset.storage_bucket
    and asset.storage_path=intent.storage_path and object.name=intent.storage_path
    and object.owner_id=intent.actor_id::text and object.version is not distinct from done.storage_version
    and object.metadata=done.storage_metadata
    and object.metadata->>'size'=intent.manifest->>'byte_size'
    and object.metadata->>'mimetype'=intent.manifest->>'mime_type'
    and asset.file_hash=intent.manifest->>'file_hash' and asset.mime_type=intent.manifest->>'mime_type'
    and asset.width::text=intent.manifest->>'width' and asset.height::text=intent.manifest->>'height';
$$;

create function private.pi_media_mapping_digest(revision_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(jsonb_build_object(
    'head',to_jsonb(head)-'revision',
    'revision',to_jsonb(candidate)-array['review_state','proposal_digest','submitted_digest'],
    'variant',private.pi_media_variant_digest(head.product_variant_id),
    'asset',private.pi_media_asset_digest(candidate.media_asset_id),
    'original',private.pi_media_original_digest(head.product_variant_id,candidate.media_asset_id),
    'evidence',coalesce((select jsonb_agg(jsonb_build_object('binding',to_jsonb(binding),'source',to_jsonb(source))
      order by source.id) from public.media_mapping_evidence link
      join public.media_source_bindings binding on binding.evidence_source_id=link.evidence_source_id
      join public.evidence_sources source on source.id=binding.evidence_source_id
      where link.revision_id=candidate.id),'[]'::jsonb),
    'known_conflicts',coalesce((select jsonb_agg(to_jsonb(binding) order by binding.evidence_source_id)
      from public.media_source_bindings binding where binding.product_variant_id=head.product_variant_id
      and binding.media_asset_id=candidate.media_asset_id and binding.media_role=head.media_role
      and binding.assertion='contradicts'),'[]'::jsonb))::text,'sha256'),'hex')
  from public.media_mapping_revisions candidate join public.media_mapping_heads head on head.id=candidate.head_id
  where candidate.id=revision_uuid;
$$;

create function private.pi_media_mapping_capability()
returns void language sql security definer set search_path = '' as $$
  insert into private.pi_mutation_context values(pg_backend_pid(),txid_current(),auth.uid(),
    array['media_mapping_heads','media_mapping_revisions','media_mapping_evidence']);
$$;

create function private.pi_guard_media_mapping_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- The creating transaction fills the initial digest after immutable evidence links exist.
  if tg_op='UPDATE' and old.proposal_digest=repeat('0',64) and old.review_state='proposed'
    and old.created_by=auth.uid() and new.proposal_digest=private.pi_media_mapping_digest(old.id)
    and (to_jsonb(new)-'proposal_digest')=(to_jsonb(old)-'proposal_digest') then
    return new;
  end if;
  if tg_op='DELETE' or (to_jsonb(new)-array['review_state','submitted_digest']) is distinct from
    (to_jsonb(old)-array['review_state','submitted_digest']) then
    raise exception 'Mapping content is immutable; append a new proposal.' using errcode='55000';
  end if;
  if old.review_state<>'proposed' or new.review_state not in ('pending','superseded')
    or (new.review_state='pending' and (new.submitted_digest is distinct from old.proposal_digest
      or new.submitted_digest is distinct from private.pi_media_mapping_digest(old.id)))
    or (new.review_state='superseded' and new.submitted_digest is distinct from old.submitted_digest) then
    raise exception 'Invalid mapping submission or supersession.' using errcode='40001';
  end if;
  return new;
end;
$$;
create trigger immutable_mapping_revision before update or delete on public.media_mapping_revisions
for each row execute function private.pi_guard_media_mapping_revision();
create function private.pi_guard_media_mapping_head()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='DELETE' or (to_jsonb(new)-'revision') is distinct from (to_jsonb(old)-'revision')
    or new.revision<>old.revision+1 then
    raise exception 'Mapping scope is immutable and revisions must advance once.' using errcode='55000';
  end if;
  return new;
end;
$$;
create trigger immutable_mapping_head before update or delete on public.media_mapping_heads
for each row execute function private.pi_guard_media_mapping_head();

create function private.pi_propose_media_mapping(
  request_uuid uuid,variant_uuid uuid,asset_uuid uuid,requested_role text,requested_slot integer,
  expected_revision bigint,mapping_copy jsonb,source_uuids uuid[],proposal_reason text,head_uuid uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare head public.media_mapping_heads%rowtype; previous public.media_mapping_revisions%rowtype;
  candidate_uuid uuid:=extensions.gen_random_uuid(); source_uuid uuid; binding public.media_source_bindings%rowtype;
  original_hash text; candidate_hash text; conflicting boolean; result jsonb;
  payload jsonb:=jsonb_build_object('variant',variant_uuid,'asset',asset_uuid,'role',requested_role,
    'slot',requested_slot,'revision',expected_revision,'copy',mapping_copy,'sources',source_uuids,
    'reason',proposal_reason,'head',head_uuid);
begin
  perform private.pi_begin_technical_command(array['owner','editor']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('propose_media_mapping',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_check_media_source_target(variant_uuid,asset_uuid,requested_role,'product_match');
  perform private.pi_require_review_reason(proposal_reason);
  if requested_slot is null or requested_slot not between 0 and 99
    or (requested_role='main' and requested_slot<>0) or expected_revision is null or expected_revision<0
    or mapping_copy is null or jsonb_typeof(mapping_copy)<>'object'
    or (select array_agg(key order by key) from jsonb_object_keys(mapping_copy) key) is distinct from array['alt_text']::text[]
    or jsonb_typeof(mapping_copy->'alt_text')<>'string' or length(mapping_copy->>'alt_text') not between 1 and 500
    or mapping_copy->>'alt_text'<>btrim(mapping_copy->>'alt_text')
    or regexp_replace(mapping_copy->>'alt_text','[[:space:]]','','g')=''
    or mapping_copy->>'alt_text' ~ '[[:cntrl:]]'
    or source_uuids is null or cardinality(source_uuids)>20 or coalesce(array_ndims(source_uuids),1)<>1
    or exists(select 1 from unnest(source_uuids) source where source is null)
    or (select count(*)<>count(distinct source) from unnest(source_uuids) source) then
    raise exception 'Invalid mapping copy, role slot, revision or evidence.' using errcode='22023';
  end if;
  original_hash:=private.pi_media_original_digest(variant_uuid,asset_uuid);
  if original_hash is null then
    raise exception 'A current completed original for this exact SKU is required.' using errcode='55000';
  end if;
  if head_uuid is null then
    if exists(select 1 from public.media_mapping_heads where product_variant_id=variant_uuid
      and media_role=requested_role and slot=requested_slot) or expected_revision<>0 then
      raise exception 'A mapping slot already exists or its revision changed.' using errcode='40001';
    end if;
    head.id:=extensions.gen_random_uuid(); head.revision:=0;
  else
    select * into head from public.media_mapping_heads where id=head_uuid for update;
    if not found or head.product_variant_id<>variant_uuid or head.media_role<>requested_role
      or head.slot<>requested_slot then
      raise exception 'Mapping scope cannot change.' using errcode='22023';
    end if;
    if head.revision<>expected_revision then
      raise exception 'Mapping revision changed; reload and compare.' using errcode='40001';
    end if;
    select * into previous from public.media_mapping_revisions where head_id=head.id and sequence=head.revision;
    if previous.review_state<>'proposed' or previous.verification_status='DATA_CONFLICT' then
      raise exception 'Pending or conflicting mapping needs an explicit human decision.' using errcode='55000';
    end if;
  end if;
  foreach source_uuid in array source_uuids loop
    select * into binding from public.media_source_bindings where evidence_source_id=source_uuid;
    if not found or not coalesce(private.pi_media_source_matches(source_uuid,variant_uuid,asset_uuid,
      requested_role,binding.evidence_dimension),false) then
      raise exception 'Media evidence does not match this exact SKU, asset, role or revision.' using errcode='22023';
    end if;
    perform 1 from public.evidence_sources where id=source_uuid for share;
  end loop;
  -- Unselected known contradictions remain conflicts; omission is not a human resolution.
  conflicting:=exists(select 1 from public.media_source_bindings where product_variant_id=variant_uuid
    and media_asset_id=asset_uuid and media_role=requested_role and assertion='contradicts');
  perform private.pi_media_mapping_capability();
  if head_uuid is null then
    insert into public.media_mapping_heads values(head.id,variant_uuid,requested_role,requested_slot,1,auth.uid(),now());
  else
    update public.media_mapping_revisions set review_state='superseded' where id=previous.id;
    update public.media_mapping_heads set revision=revision+1 where id=head.id;
  end if;
  insert into public.media_mapping_revisions(id,head_id,predecessor_id,sequence,media_asset_id,original_intent_id,
    alt_text,variant_digest,asset_digest,original_digest,verification_status,review_state,proposal_digest,reason,created_by)
  values(candidate_uuid,head.id,previous.id,head.revision+1,asset_uuid,
    (select id from public.media_upload_intents where media_asset_id=asset_uuid),mapping_copy->>'alt_text',
    private.pi_media_variant_digest(variant_uuid),private.pi_media_asset_digest(asset_uuid),original_hash,
    case when conflicting then 'DATA_CONFLICT'::public.pi_verification_status else 'NEEDS_FACTORY_CONFIRMATION' end,
    'proposed',repeat('0',64),btrim(proposal_reason),auth.uid());
  insert into public.media_mapping_evidence select candidate_uuid,source from unnest(source_uuids) source;
  candidate_hash:=private.pi_media_mapping_digest(candidate_uuid);
  -- Initial digest is filled before this transaction exposes the revision to other readers.
  update public.media_mapping_revisions set proposal_digest=candidate_hash where id=candidate_uuid;
  return private.pi_finish_technical_command('propose_media_mapping',request_uuid,payload,
    jsonb_build_object('mapping_id',candidate_uuid,'head_id',head.id,'revision',head.revision+1,'digest',candidate_hash));
end;
$$;

create function private.pi_submit_media_mapping(request_uuid uuid,mapping_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare candidate public.media_mapping_revisions%rowtype; head public.media_mapping_heads%rowtype; result jsonb;
  payload jsonb:=jsonb_build_object('mapping',mapping_uuid,'revision',expected_revision,'digest',expected_digest);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('submit_media_mapping',request_uuid,payload);
  if result is not null then return result; end if;
  select * into candidate from public.media_mapping_revisions where id=mapping_uuid;
  if not found then raise exception 'Mapping candidate is unavailable.' using errcode='55000'; end if;
  select * into head from public.media_mapping_heads where id=candidate.head_id for update;
  perform private.pi_check_media_source_target(head.product_variant_id,candidate.media_asset_id,head.media_role,'product_match');
  if expected_revision is null or head.revision<>expected_revision or candidate.sequence<>head.revision
    or candidate.review_state<>'proposed' or expected_digest is distinct from candidate.proposal_digest
    or expected_digest is distinct from private.pi_media_mapping_digest(mapping_uuid)
    or candidate.original_digest is distinct from private.pi_media_original_digest(head.product_variant_id,candidate.media_asset_id) then
    raise exception 'Mapping content, original, evidence or revision changed; reload and compare.' using errcode='40001';
  end if;
  perform private.pi_media_mapping_capability();
  update public.media_mapping_revisions set review_state='pending',submitted_digest=expected_digest where id=mapping_uuid;
  return private.pi_finish_technical_command('submit_media_mapping',request_uuid,payload,
    jsonb_build_object('mapping_id',mapping_uuid,'head_id',head.id,'revision',head.revision,'digest',expected_digest));
end;
$$;

create view public.pi_media_mapping_states with (security_invoker=true) as
select head.id as head_id,head.product_variant_id,head.media_role,head.slot,head.revision,
  revision.id as mapping_id,revision.media_asset_id,revision.alt_text,revision.review_state,
  revision.verification_status,revision.proposal_digest,revision.submitted_digest,
  (select count(*)::int from public.media_mapping_evidence link join public.media_source_bindings binding
    on binding.evidence_source_id=link.evidence_source_id where link.revision_id=revision.id
    and binding.evidence_dimension='usage_rights') as rights_evidence_count,
  (select count(*)::int from public.media_mapping_evidence link join public.media_source_bindings binding
    on binding.evidence_source_id=link.evidence_source_id where link.revision_id=revision.id
    and binding.evidence_dimension='product_match') as match_evidence_count
from public.media_mapping_heads head join public.media_mapping_revisions revision
  on revision.head_id=head.id and revision.sequence=head.revision;
revoke all on public.pi_media_mapping_states from public,anon,authenticated,service_role;
grant select on public.pi_media_mapping_states to authenticated;

create function private.pi_guard_open_media_mapping()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.lifecycle_state in ('VERIFIED','READY_FOR_PUBLISH','QA_PASSED','PUBLISHED') and exists(
    select 1 from public.media_mapping_heads head join public.media_mapping_revisions revision on revision.head_id=head.id
    where head.product_variant_id=new.id and revision.review_state in ('proposed','pending')) then
    raise exception 'Open media mappings require human review before publishable lifecycle states.' using errcode='23514';
  end if;
  return new;
end;
$$;
create trigger product_variants_00_media_mapping_guard before insert or update on public.product_variants
for each row execute function private.pi_guard_open_media_mapping();
revoke all on all functions in schema private from public,anon,authenticated,service_role;
