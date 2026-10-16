-- Application approval requires a server-signed observation of the exact stored original.
-- No key is provisioned, no existing mapping is changed and no original becomes public.
create table private.pi_media_observation_keys (
  id uuid primary key,
  secret bytea not null check (octet_length(secret)=32),
  valid_from timestamptz not null,
  valid_until timestamptz not null check (valid_until>valid_from),
  enabled boolean not null default false
);
alter table private.pi_media_observation_keys enable row level security;
alter table private.pi_media_observation_keys force row level security;
revoke all on private.pi_media_observation_keys from public,anon,authenticated,service_role;

create table private.pi_media_review_observations (
  event_id uuid primary key references public.verification_events(id),
  mapping_id uuid unique not null references public.media_mapping_decisions(mapping_id),
  observer_key_id uuid not null references private.pi_media_observation_keys(id),
  actor_id uuid not null references auth.users(id),
  adoption_id uuid not null references private.pi_working_adoptions(id),
  nonce uuid unique not null,
  submitted_digest text not null check (submitted_digest ~ '^[a-f0-9]{64}$'),
  original_digest text not null check (original_digest ~ '^[a-f0-9]{64}$'),
  token_digest text not null check (token_digest ~ '^[a-f0-9]{64}$'),
  observed_at timestamptz not null,
  expires_at timestamptz not null,
  recorded_at timestamptz not null default clock_timestamp(),
  check (expires_at>observed_at and expires_at<=observed_at+interval '5 minutes')
);
alter table private.pi_media_review_observations enable row level security;
alter table private.pi_media_review_observations force row level security;
revoke all on private.pi_media_review_observations from public,anon,authenticated,service_role;
create trigger immutable_media_observation before update or delete on private.pi_media_review_observations
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_media_observation_table before truncate on private.pi_media_review_observations
for each statement execute function public.pi_prevent_immutable_change();

create function private.pi_read_media_review_snapshot(mapping_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare adoption_uuid uuid; candidate public.media_mapping_revisions%rowtype; head public.media_mapping_heads%rowtype;
begin
  adoption_uuid:=private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  select * into candidate from public.media_mapping_revisions where id=mapping_uuid;
  if not found then raise exception 'Mapping candidate is unavailable.' using errcode='55000'; end if;
  select * into head from public.media_mapping_heads where id=candidate.head_id for share;
  perform private.pi_check_media_source_target(head.product_variant_id,candidate.media_asset_id,head.media_role,'product_match');
  if expected_revision is null or head.revision<>expected_revision or candidate.sequence<>head.revision
    or candidate.review_state<>'pending' or expected_digest is distinct from candidate.submitted_digest
    or expected_digest is distinct from candidate.proposal_digest
    or expected_digest is distinct from private.pi_media_mapping_digest(candidate.id)
    or candidate.original_digest is distinct from private.pi_media_original_digest(head.product_variant_id,candidate.media_asset_id) then
    raise exception 'Pending mapping or original changed; reload and compare.' using errcode='40001'; end if;
  return jsonb_build_object('mapping_id',candidate.id,'variant_id',head.product_variant_id,
    'asset_id',candidate.media_asset_id,'revision',head.revision,'digest',expected_digest,
    'original_digest',candidate.original_digest,'adoption_id',adoption_uuid);
end;
$$;

create function public.pi_media_review_snapshot(mapping_uuid uuid,expected_revision bigint,expected_digest text,observer_key_uuid uuid)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare snapshot jsonb;
begin
  snapshot:=private.pi_read_media_review_snapshot(mapping_uuid,expected_revision,expected_digest);
  if not exists(select 1 from private.pi_media_observation_keys where id=observer_key_uuid and enabled
    and valid_from<=clock_timestamp() and valid_until>=clock_timestamp()+interval '5 minutes') then
    raise exception 'Original inspection is not configured.' using errcode='55000'; end if;
  return snapshot;
end;
$$;

-- Compare all 32 bytes rather than a prefix-sensitive string comparison.
create function private.pi_media_observation_signature_matches(payload text,signature text,secret bytea)
returns boolean language plpgsql immutable set search_path = '' as $$
declare expected bytea:=extensions.hmac(convert_to(payload,'UTF8'),secret,'sha256');
  actual bytea:=decode(signature,'hex'); difference integer:=0; position integer;
begin
  for position in 0..31 loop difference:=difference | (get_byte(expected,position) # get_byte(actual,position)); end loop;
  return difference=0;
end;
$$;
create function private.pi_validate_media_observation(token text,snapshot jsonb)
returns text[] language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare parts text[]:=string_to_array(token,'|'); key private.pi_media_observation_keys%rowtype;
  current_second bigint:=floor(extract(epoch from clock_timestamp()));
begin
  if token is null or length(token)>800 or cardinality(parts)<>12 or parts[1]<>'v1'
    or exists(select 1 from unnest(array[parts[2],parts[3],parts[4],parts[5],parts[11]]) part
      where part !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
    or parts[6] !~ '^[1-9][0-9]{0,14}$' or parts[7] !~ '^[a-f0-9]{64}$' or parts[8] !~ '^[a-f0-9]{64}$'
    or parts[9] !~ '^[1-9][0-9]{0,9}$' or parts[10] !~ '^[1-9][0-9]{0,9}$' or parts[12] !~ '^[a-f0-9]{64}$' then
    raise exception 'A valid original inspection is required.' using errcode='23514'; end if;
  select * into key from private.pi_media_observation_keys where id=parts[2]::uuid for share;
  if not found or not key.enabled or parts[3] is distinct from auth.uid()::text
    or parts[4] is distinct from snapshot->>'adoption_id' or parts[5] is distinct from snapshot->>'mapping_id'
    or parts[6] is distinct from snapshot->>'revision' or parts[7] is distinct from snapshot->>'digest'
    or parts[8] is distinct from snapshot->>'original_digest' or parts[9]::bigint>current_second+5
    or parts[10]::bigint<=current_second or parts[10]::bigint-parts[9]::bigint not between 1 and 300
    or key.valid_from>to_timestamp(parts[9]::bigint) or key.valid_until<to_timestamp(parts[10]::bigint)
    or not private.pi_media_observation_signature_matches(array_to_string(parts[1:11],'|'),parts[12],key.secret) then
    raise exception 'Original inspection expired or does not match this review.' using errcode='23514'; end if;
  return parts;
end;
$$;

create function public.pi_add_media_source(request_uuid uuid,variant_uuid uuid,asset_uuid uuid,requested_role text,
  requested_dimension text,source_copy jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_add_media_source(request_uuid,variant_uuid,asset_uuid,requested_role,requested_dimension,source_copy);
$$;
create function public.pi_propose_media_mapping(request_uuid uuid,variant_uuid uuid,asset_uuid uuid,requested_role text,
  requested_slot integer,expected_revision bigint,mapping_copy jsonb,source_uuids uuid[],proposal_reason text,head_uuid uuid default null)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_propose_media_mapping(request_uuid,variant_uuid,asset_uuid,requested_role,requested_slot,
    expected_revision,mapping_copy,source_uuids,proposal_reason,head_uuid);
$$;
create function public.pi_submit_media_mapping(request_uuid uuid,mapping_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_submit_media_mapping(request_uuid,mapping_uuid,expected_revision,expected_digest);
$$;
create function public.pi_review_media_mapping(request_uuid uuid,mapping_uuid uuid,expected_revision bigint,expected_digest text,
  decision text,review_reason text,confirmation jsonb,rights_source_uuid uuid,match_source_uuid uuid,
  conflict_resolution text,replacement jsonb,observation_token text)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare snapshot jsonb; parts text[]; result jsonb;
  payload jsonb:=jsonb_build_object('mapping',mapping_uuid,'revision',expected_revision,'digest',expected_digest,
    'decision',decision,'reason',review_reason,'confirmation',confirmation,'rights_source',rights_source_uuid,
    'match_source',match_source_uuid,'resolution',conflict_resolution,'replacement',replacement,
    'observation_digest',encode(extensions.digest(observation_token,'sha256'),'hex'));
begin
  -- Replay completed work after expiry, but never after authority/role revocation or with changed input.
  perform private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('observed_media_review',request_uuid,payload);
  if result is not null then return result; end if;
  if decision='APPROVE' then
    snapshot:=private.pi_read_media_review_snapshot(mapping_uuid,expected_revision,expected_digest);
    parts:=private.pi_validate_media_observation(observation_token,snapshot);
  elsif observation_token is not null then
    raise exception 'Only approval may carry an original observation.' using errcode='22023'; end if;
  result:=private.pi_review_media_mapping(request_uuid,mapping_uuid,expected_revision,expected_digest,decision,
    review_reason,confirmation,rights_source_uuid,match_source_uuid,conflict_resolution,replacement);
  if decision='APPROVE' then
    insert into private.pi_media_review_observations(event_id,mapping_id,observer_key_id,actor_id,adoption_id,
      nonce,submitted_digest,original_digest,token_digest,observed_at,expires_at)
    values((result->>'event_id')::uuid,mapping_uuid,parts[2]::uuid,auth.uid(),parts[4]::uuid,parts[11]::uuid,
      parts[7],parts[8],encode(extensions.digest(observation_token,'sha256'),'hex'),
      to_timestamp(parts[9]::bigint),to_timestamp(parts[10]::bigint));
  end if;
  return private.pi_finish_technical_command('observed_media_review',request_uuid,payload,result);
end;
$$;

-- Historical observation is separate from current evidence validity and does not expire with its token.
create function public.pi_media_review_observed(mapping_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console() and exists(
    select 1 from private.pi_media_review_observations observed
    join public.media_mapping_decisions decision on decision.mapping_id=observed.mapping_id
    join public.media_mapping_revisions candidate on candidate.id=decision.mapping_id
    where observed.mapping_id=mapping_uuid and decision.decision='APPROVE' and decision.event_id=observed.event_id
      and decision.created_by=observed.actor_id and decision.submitted_digest=observed.submitted_digest
      and candidate.original_digest=observed.original_digest),false);
$$;
revoke all on function public.pi_media_review_snapshot(uuid,bigint,text,uuid),
  public.pi_add_media_source(uuid,uuid,uuid,text,text,jsonb),
  public.pi_propose_media_mapping(uuid,uuid,uuid,text,integer,bigint,jsonb,uuid[],text,uuid),
  public.pi_submit_media_mapping(uuid,uuid,bigint,text),
  public.pi_review_media_mapping(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb,text),
  public.pi_media_review_observed(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_media_review_snapshot(uuid,bigint,text,uuid),
  public.pi_add_media_source(uuid,uuid,uuid,text,text,jsonb),
  public.pi_propose_media_mapping(uuid,uuid,uuid,text,integer,bigint,jsonb,uuid[],text,uuid),
  public.pi_submit_media_mapping(uuid,uuid,bigint,text),
  public.pi_review_media_mapping(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb,text),
  public.pi_media_review_observed(uuid) to authenticated;
revoke all on all functions in schema private from public,anon,authenticated,service_role;
