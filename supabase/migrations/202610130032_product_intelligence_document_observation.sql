-- Domain-separated byte observations. This migration provisions no key or active environment.
create table private.pi_document_observation_keys (
  id uuid primary key,
  secret bytea not null check (octet_length(secret)=32),
  valid_from timestamptz not null,
  valid_until timestamptz not null check (valid_until>valid_from),
  enabled boolean not null default false
);
alter table private.pi_document_observation_keys enable row level security;
alter table private.pi_document_observation_keys force row level security;
revoke all on private.pi_document_observation_keys from public,anon,authenticated,service_role;
create table private.pi_document_review_observations (
  event_id uuid primary key references public.verification_events(id),
  candidate_id uuid unique not null references public.document_review_decisions(candidate_id),
  observer_key_id uuid not null references private.pi_document_observation_keys(id),
  actor_id uuid not null references auth.users(id),
  adoption_id uuid not null references private.pi_working_adoptions(id),
  nonce uuid unique not null,
  submitted_digest text not null check (submitted_digest ~ '^[a-f0-9]{64}$'),
  original_digest text not null check (original_digest ~ '^[a-f0-9]{64}$'),
  evidence_digest text not null check (evidence_digest ~ '^[a-f0-9]{64}$'),
  token_digest text not null check (token_digest ~ '^[a-f0-9]{64}$'),
  observed_at timestamptz not null,
  expires_at timestamptz not null,
  recorded_at timestamptz not null default clock_timestamp(),
  check (expires_at>observed_at and expires_at<=observed_at+interval '5 minutes')
);
alter table private.pi_document_review_observations enable row level security;
alter table private.pi_document_review_observations force row level security;
revoke all on private.pi_document_review_observations from public,anon,authenticated,service_role;
create trigger immutable_document_observation before update or delete on private.pi_document_review_observations
for each row execute function public.pi_prevent_immutable_change();
create trigger immutable_document_observation_table before truncate on private.pi_document_review_observations
for each statement execute function public.pi_prevent_immutable_change();

create function private.pi_read_document_review_snapshot(candidate_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare adoption_uuid uuid; candidate public.document_review_candidates%rowtype; head public.document_review_heads%rowtype;
begin
  adoption_uuid:=private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  select * into candidate from public.document_review_candidates where id=candidate_uuid;
  if not found then raise exception 'Document candidate is unavailable.' using errcode='40001'; end if;
  select * into head from public.document_review_heads where technical_document_id=candidate.technical_document_id for share;
  if expected_revision is distinct from head.revision or candidate.sequence<>head.revision
    or expected_digest is distinct from candidate.proposal_digest
    or not exists(select 1 from public.document_review_submissions where candidate_id=candidate.id and submitted_digest=expected_digest)
    or exists(select 1 from public.document_review_decisions where candidate_id=candidate.id)
    or candidate.original_digest is distinct from private.pi_document_review_original_digest(head.product_variant_id,head.technical_document_id)
    or candidate.evidence_digest is distinct from private.pi_document_review_evidence_digest(head.technical_document_id) then
    raise exception 'Pending document, original or evidence changed; reload and compare.' using errcode='40001'; end if;
  return jsonb_build_object('candidate_id',candidate.id,'document_id',head.technical_document_id,
    'variant_id',head.product_variant_id,'revision',head.revision,'digest',candidate.proposal_digest,
    'original_digest',candidate.original_digest,'evidence_digest',candidate.evidence_digest,'adoption_id',adoption_uuid);
end;
$$;
create function public.pi_document_review_snapshot(candidate_uuid uuid,expected_revision bigint,expected_digest text,observer_key_uuid uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare snapshot jsonb;
begin
  snapshot:=private.pi_read_document_review_snapshot(candidate_uuid,expected_revision,expected_digest);
  if not exists(select 1 from private.pi_document_observation_keys where id=observer_key_uuid and enabled
    and valid_from<=clock_timestamp() and valid_until>=clock_timestamp()+interval '5 minutes') then
    raise exception 'Document observation is not configured.' using errcode='55000'; end if;
  return snapshot;
end;
$$;
create function private.pi_document_observation_signature_matches(payload text,signature text,secret bytea)
returns boolean language plpgsql immutable set search_path = '' as $$
declare expected bytea; actual bytea; difference integer:=0; position integer;
begin
  if payload is null or signature is null or signature !~ '^[a-f0-9]{64}$' or secret is null or octet_length(secret)<>32 then return false; end if;
  expected:=extensions.hmac(convert_to(payload,'UTF8'),secret,'sha256'); actual:=decode(signature,'hex');
  for position in 0..31 loop difference:=difference | (get_byte(expected,position) # get_byte(actual,position)); end loop;
  return difference=0;
end;
$$;
create function private.pi_validate_document_observation(token text,snapshot jsonb)
returns text[] language plpgsql security definer set search_path = '' as $$
declare parts text[]:=string_to_array(token,'|'); key private.pi_document_observation_keys%rowtype;
  current_second bigint:=floor(extract(epoch from clock_timestamp()));
begin
  if token is null or length(token)>1200 or cardinality(parts)<>15 or parts[1]<>'document-v1'
    or exists(select 1 from unnest(array[parts[2],parts[3],parts[4],parts[5],parts[6],parts[7],parts[14]]) part
      where part !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
    or parts[8] !~ '^[1-9][0-9]{0,14}$'
    or exists(select 1 from unnest(array[parts[9],parts[10],parts[11],parts[15]]) part where part !~ '^[a-f0-9]{64}$')
    or parts[12] !~ '^[1-9][0-9]{0,9}$' or parts[13] !~ '^[1-9][0-9]{0,9}$' then
    raise exception 'A valid document observation is required.' using errcode='23514'; end if;
  select * into key from private.pi_document_observation_keys where id=parts[2]::uuid for share;
  if not found or not key.enabled or parts[3] is distinct from auth.uid()::text
    or parts[4] is distinct from snapshot->>'adoption_id' or parts[5] is distinct from snapshot->>'candidate_id'
    or parts[6] is distinct from snapshot->>'document_id' or parts[7] is distinct from snapshot->>'variant_id'
    or parts[8] is distinct from snapshot->>'revision' or parts[9] is distinct from snapshot->>'digest'
    or parts[10] is distinct from snapshot->>'original_digest' or parts[11] is distinct from snapshot->>'evidence_digest'
    or parts[12]::bigint>current_second+5 or parts[13]::bigint<=current_second
    or parts[13]::bigint-parts[12]::bigint not between 1 and 300
    or key.valid_from>to_timestamp(parts[12]::bigint) or key.valid_until<to_timestamp(parts[13]::bigint)
    or not private.pi_document_observation_signature_matches(array_to_string(parts[1:14],'|'),parts[15],key.secret) then
    raise exception 'Document observation expired or does not match this review.' using errcode='23514'; end if;
  return parts;
end;
$$;

create function public.pi_add_document_source(request_uuid uuid,variant_uuid uuid,document_uuid uuid,requested_dimension text,source_copy jsonb)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_add_document_source(request_uuid,variant_uuid,document_uuid,requested_dimension,source_copy);
$$;
create function public.pi_propose_document_review(request_uuid uuid,variant_uuid uuid,document_uuid uuid,expected_revision bigint,
  review_copy jsonb,proposal_reason text)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_propose_document_review(request_uuid,variant_uuid,document_uuid,expected_revision,review_copy,proposal_reason);
$$;
create function public.pi_submit_document_review(request_uuid uuid,candidate_uuid uuid,expected_revision bigint,expected_digest text)
returns jsonb language sql security definer set search_path = '' as $$
  select private.pi_submit_document_review(request_uuid,candidate_uuid,expected_revision,expected_digest);
$$;
create function public.pi_review_document(request_uuid uuid,candidate_uuid uuid,expected_revision bigint,expected_digest text,
  decision text,review_reason text,confirmation jsonb,rights_source_uuid uuid,scope_source_uuid uuid,
  conflict_resolution text,replacement jsonb,observation_token text)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare snapshot jsonb; parts text[]; result jsonb;
  payload jsonb:=jsonb_build_object('candidate',candidate_uuid,'revision',expected_revision,'digest',expected_digest,
    'decision',decision,'reason',review_reason,'confirmation',confirmation,'rights_source',rights_source_uuid,
    'scope_source',scope_source_uuid,'resolution',conflict_resolution,'replacement',replacement,
    'observation_digest',encode(extensions.digest(observation_token,'sha256'),'hex'));
begin
  perform private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  result:=private.pi_draft_receipt('observed_document_review',request_uuid,payload);
  if result is not null then return result; end if;
  if decision='APPROVE' then
    snapshot:=private.pi_read_document_review_snapshot(candidate_uuid,expected_revision,expected_digest);
    parts:=private.pi_validate_document_observation(observation_token,snapshot);
  elsif observation_token is not null then
    raise exception 'Only approval may carry a document observation.' using errcode='22023'; end if;
  result:=private.pi_review_document(request_uuid,candidate_uuid,expected_revision,expected_digest,decision,
    review_reason,confirmation,rights_source_uuid,scope_source_uuid,conflict_resolution,replacement);
  if decision='APPROVE' then
    insert into private.pi_document_review_observations(event_id,candidate_id,observer_key_id,actor_id,adoption_id,
      nonce,submitted_digest,original_digest,evidence_digest,token_digest,observed_at,expires_at)
    values((result->>'event_id')::uuid,candidate_uuid,parts[2]::uuid,auth.uid(),parts[4]::uuid,parts[14]::uuid,
      parts[9],parts[10],parts[11],encode(extensions.digest(observation_token,'sha256'),'hex'),
      to_timestamp(parts[12]::bigint),to_timestamp(parts[13]::bigint));
  end if;
  return private.pi_finish_technical_command('observed_document_review',request_uuid,payload,result);
end;
$$;
-- Historical observation is distinct from current human evidence validity, expiry and key rotation.
create function public.pi_document_review_observed(candidate_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(private.pi_request_jwt_role()='authenticated' and public.pi_can_view_console() and exists(
    select 1 from private.pi_document_review_observations observed
    join public.document_review_decisions decision on decision.candidate_id=observed.candidate_id
    join public.document_review_candidates candidate on candidate.id=observed.candidate_id
    where observed.candidate_id=candidate_uuid and decision.decision='APPROVE' and decision.event_id=observed.event_id
      and decision.created_by=observed.actor_id and candidate.proposal_digest=observed.submitted_digest
      and candidate.original_digest=observed.original_digest and candidate.evidence_digest=observed.evidence_digest
      and decision.observed_original_digest=observed.original_digest and decision.observed_evidence_digest=observed.evidence_digest),false);
$$;
revoke all on function public.pi_document_review_snapshot(uuid,bigint,text,uuid),
  public.pi_add_document_source(uuid,uuid,uuid,text,jsonb),
  public.pi_propose_document_review(uuid,uuid,uuid,bigint,jsonb,text),
  public.pi_submit_document_review(uuid,uuid,bigint,text),
  public.pi_review_document(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb,text),
  public.pi_document_review_observed(uuid) from public,anon,authenticated,service_role;
grant execute on function public.pi_document_review_snapshot(uuid,bigint,text,uuid),
  public.pi_add_document_source(uuid,uuid,uuid,text,jsonb),
  public.pi_propose_document_review(uuid,uuid,uuid,bigint,jsonb,text),
  public.pi_submit_document_review(uuid,uuid,bigint,text),
  public.pi_review_document(uuid,uuid,bigint,text,text,text,jsonb,uuid,uuid,text,jsonb,text),
  public.pi_document_review_observed(uuid) to authenticated;
revoke all on all functions in schema private from public,anon,authenticated,service_role;
