-- M3.1c: exact-subject, immutable proposals and atomic human decisions.
-- Commands remain private. Applying this migration neither adopts nor confirms real data.

create table public.technical_revision_heads (
  root_value_id uuid primary key references public.technical_values(id),
  product_variant_id uuid not null references public.product_variants(id),
  field_definition_id uuid not null references public.technical_field_definitions(id),
  scope_label text not null default '',
  current_value_id uuid references public.technical_values(id),
  revision bigint not null check (revision >= 0),
  unique (product_variant_id, field_definition_id, scope_label)
);

create table public.technical_revisions (
  value_id uuid primary key references public.technical_values(id),
  root_value_id uuid not null references public.technical_revision_heads(root_value_id),
  predecessor_id uuid references public.technical_values(id),
  sequence bigint not null check (sequence > 0),
  review_state text not null check (review_state in ('proposed','pending','approved','rejected','superseded')),
  proposal_digest text not null check (proposal_digest ~ '^[a-f0-9]{64}$'),
  submitted_digest text check (submitted_digest ~ '^[a-f0-9]{64}$'),
  reason text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  decision_event_id uuid references public.verification_events(id),
  unique (root_value_id, sequence)
);

create unique index technical_revisions_one_open on public.technical_revisions(root_value_id)
  where review_state in ('proposed','pending');

create table public.technical_source_bindings (
  evidence_source_id uuid primary key references public.evidence_sources(id),
  product_variant_id uuid not null references public.product_variants(id),
  field_definition_id uuid not null references public.technical_field_definitions(id),
  scope_label text not null default '',
  source_kind text not null check (source_kind in ('company_record','official_manufacturer','technical_standard','secondary_reference')),
  evidence_basis text not null,
  revision_label text not null,
  source_location text not null,
  asserted_value text not null,
  asserted_unit text not null,
  source_digest text not null check (source_digest ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

do $$
declare relation_name text;
begin
  foreach relation_name in array array['technical_revision_heads','technical_revisions','technical_source_bindings'] loop
    execute format('alter table public.%I enable row level security', relation_name);
    execute format('alter table public.%I force row level security', relation_name);
    execute format('revoke all on public.%I from public, anon, authenticated, service_role', relation_name);
    execute format('grant select on public.%I to authenticated', relation_name);
    execute format('create policy console_read on public.%I for select to authenticated using (public.pi_can_view_console())', relation_name);
    execute format('create trigger working_authority_guard before insert or update or delete or truncate on public.%I for each statement execute function private.pi_guard_working_catalog_write()', relation_name);
    execute format('create trigger audit_change after insert or update on public.%I for each row execute function public.pi_audit_row_change()', relation_name);
  end loop;
end;
$$;

create trigger immutable_source_binding before update or delete on public.technical_source_bindings
for each row execute function public.pi_prevent_immutable_change();

create function private.pi_begin_technical_command(required_roles public.pi_console_role[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare adoption_uuid uuid;
begin
  -- Preserve authority-then-role lock order, with an early non-locking permission check.
  if auth.uid() is null or coalesce(private.pi_request_jwt_role(),'') <> 'authenticated'
    or not public.pi_has_console_role(required_roles) then
    raise exception 'An authenticated operator is required.' using errcode = '42501';
  end if;
  select adoption_id into adoption_uuid from private.pi_working_authority_control where singleton for update;
  if not found or adoption_uuid is null then
    raise exception 'Working adoption is required.' using errcode = '55000';
  end if;
  perform 1 from public.console_user_roles where user_id = auth.uid()
    and role = any(required_roles) and revoked_at is null for share;
  if not found then raise exception 'A current authorized role is required.' using errcode = '42501'; end if;
  return adoption_uuid;
end;
$$;

create function private.pi_check_technical_target(variant_uuid uuid, field_uuid uuid, scope_label text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if variant_uuid is null or field_uuid is null or scope_label is null or length(scope_label) > 200
    or scope_label <> btrim(scope_label)
  then raise exception 'Invalid technical subject or scope.' using errcode = '22023'; end if;
  if not exists (
    select 1 from private.pi_working_authority_control control
    join private.pi_working_adoptions adoption on adoption.id = control.adoption_id
    where variant_uuid = any(adoption.pilot_variant_ids)
      or exists (select 1 from private.pi_product_draft_heads head
        where head.product_variant_id = variant_uuid and head.adoption_id = adoption.id and head.origin = 'created')
  ) then raise exception 'This subject is outside the editable pilot.' using errcode = '55000'; end if;
  if not exists (select 1 from public.technical_field_definitions field
    join public.product_variants variant on variant.id = variant_uuid
    join public.products product on product.id = variant.product_id
    where field.id = field_uuid and (cardinality(field.applies_to) = 0
      or 'product_variant' = any(field.applies_to) or product.product_type = any(field.applies_to)))
  then raise exception 'The technical field does not apply to this subject.' using errcode = '22023'; end if;
end;
$$;

create function private.pi_technical_capability()
returns void language sql security definer set search_path = '' as $$
  insert into private.pi_mutation_context values (pg_backend_pid(), txid_current(), auth.uid(),
    array['technical_values','technical_value_evidence','evidence_sources','verification_events',
      'technical_revision_heads','technical_revisions','technical_source_bindings']);
$$;

create function private.pi_finish_technical_command(command_name text, request_uuid uuid, payload jsonb, result jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  insert into private.pi_command_receipts values (auth.uid(), command_name, request_uuid,
    encode(extensions.digest(payload::text,'sha256'),'hex'), result, now());
  delete from private.pi_mutation_context where backend_pid = pg_backend_pid() and transaction_id = txid_current();
  return result;
end;
$$;

create function private.pi_require_review_reason(reason text)
returns void language plpgsql immutable set search_path = '' as $$
begin
  if reason is null or length(reason) > 2000 or length(regexp_replace(reason,'[[:space:]]','','g')) < 3 then
    raise exception 'A bounded, meaningful reason is required.' using errcode = '22023';
  end if;
end;
$$;

create function private.pi_add_technical_source(
  request_uuid uuid, variant_uuid uuid, field_uuid uuid, scope_label text, source_copy jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare
  source_uuid uuid := extensions.gen_random_uuid();
  item text;
  source_date date;
  source_hash text;
  result jsonb;
  payload jsonb := jsonb_build_object('variant',variant_uuid,'field',field_uuid,'scope',scope_label,'source',source_copy);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  perform private.pi_check_technical_target(variant_uuid,field_uuid,scope_label);
  result := private.pi_draft_receipt('add_technical_source',request_uuid,payload);
  if result is not null then return result; end if;
  if source_copy is null or jsonb_typeof(source_copy) <> 'object' or
    (select array_agg(key order by key) from jsonb_object_keys(source_copy) key) is distinct from
      array['asserted_unit','asserted_value','evidence_basis','evidence_date','owner_name','revision_label',
        'source_kind','source_level','source_location','source_reference','title']::text[]
  then raise exception 'Invalid technical source fields.' using errcode = '22023'; end if;
  for item in select jsonb_object_keys(source_copy) loop
    if jsonb_typeof(source_copy -> item) <> 'string' or length(source_copy ->> item) > 2000
      or (item <> 'asserted_unit' and regexp_replace(source_copy ->> item,'[[:space:]]','','g') = '')
    then raise exception 'Invalid or oversized technical source field.' using errcode = '22023'; end if;
  end loop;
  if not ((source_copy ->> 'source_kind' = 'company_record' and source_copy ->> 'source_level' = 'A')
    or (source_copy ->> 'source_kind' = 'official_manufacturer' and source_copy ->> 'source_level' = 'B')
    or (source_copy ->> 'source_kind' = 'technical_standard' and source_copy ->> 'source_level' = 'C')
    or (source_copy ->> 'source_kind' = 'secondary_reference' and source_copy ->> 'source_level' = 'D'))
    or (source_copy ->> 'evidence_date') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  then raise exception 'Source classification/date is invalid.' using errcode = '22023'; end if;
  begin source_date := (source_copy ->> 'evidence_date')::date;
  exception when datetime_field_overflow or invalid_datetime_format then
    raise exception 'Source date is invalid.' using errcode = '22023';
  end;
  if source_date > current_date then raise exception 'Source date cannot be in the future.' using errcode = '22023'; end if;
  perform private.pi_technical_capability();
  insert into public.evidence_sources(id,external_key,source_type,source_level,title,source_reference,
    exact_subject,evidence_date,owner_name,raw_snapshot)
  values (source_uuid,'working-source:' || source_uuid,source_copy ->> 'source_kind',
    (source_copy ->> 'source_level')::public.pi_source_level,btrim(source_copy ->> 'title'),
    btrim(source_copy ->> 'source_reference'),true,source_date,btrim(source_copy ->> 'owner_name'),
    jsonb_build_object('evidence_basis',jsonb_build_array(source_copy ->> 'evidence_basis')));
  select encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex') into source_hash
    from public.evidence_sources source where id = source_uuid;
  insert into public.technical_source_bindings values (source_uuid,variant_uuid,field_uuid,scope_label,
    source_copy ->> 'source_kind',source_copy ->> 'evidence_basis',btrim(source_copy ->> 'revision_label'),
    btrim(source_copy ->> 'source_location'),btrim(source_copy ->> 'asserted_value'),
    btrim(source_copy ->> 'asserted_unit'),source_hash,auth.uid(),now());
  return private.pi_finish_technical_command('add_technical_source',request_uuid,payload,
    jsonb_build_object('source_id',source_uuid,'source_digest',source_hash));
end;
$$;

create function private.pi_technical_digest(value_uuid uuid)
returns text language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select encode(extensions.digest(jsonb_build_object('value',to_jsonb(value),
    'evidence',coalesce((select jsonb_agg(jsonb_build_object('link',to_jsonb(link),
      'source',to_jsonb(source),'binding',to_jsonb(binding)) order by link.evidence_source_id)
      from public.technical_value_evidence link
      join public.evidence_sources source on source.id = link.evidence_source_id
      left join public.technical_source_bindings binding on binding.evidence_source_id = source.id
      where link.technical_value_id = value.id),'[]'::jsonb))::text,'sha256'),'hex')
  from public.technical_values value where value.id = value_uuid;
$$;

create function private.pi_technical_source_matches(source_uuid uuid, value_uuid uuid)
returns boolean language sql stable security definer set search_path = '' set timezone = 'UTC' as $$
  select exists (select 1 from public.technical_source_bindings binding
    join public.evidence_sources source on source.id = binding.evidence_source_id
    join public.technical_values value on value.id = value_uuid
    where source.id = source_uuid and binding.product_variant_id = value.product_variant_id
      and binding.field_definition_id = value.field_definition_id
      and binding.scope_label = coalesce(value.variant_label,'')
      and binding.asserted_value = value.value_text and binding.asserted_unit = coalesce(value.unit,'')
      and binding.source_digest = encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex'));
$$;

-- Called only inside the propose/edit command transaction. It never confirms a value.
create function private.pi_append_technical_proposal(
  variant_uuid uuid, field_uuid uuid, scope_label text, expected_revision bigint,
  value_copy jsonb, evidence_links jsonb, proposal_reason text
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare
  head public.technical_revision_heads%rowtype;
  baseline public.technical_values%rowtype;
  source public.evidence_sources%rowtype;
  link jsonb;
  source_uuid uuid;
  candidate_uuid uuid := extensions.gen_random_uuid();
  current_status public.pi_verification_status := 'NEEDS_FACTORY_CONFIRMATION';
  strongest_level public.pi_source_level := 'D';
  conflicting boolean := false;
  candidate_digest text;
  matched_ids uuid[];
begin
  perform private.pi_check_technical_target(variant_uuid,field_uuid,scope_label);
  perform private.pi_require_review_reason(proposal_reason);
  if expected_revision is null or expected_revision < 0 or value_copy is null or jsonb_typeof(value_copy) <> 'object'
    or (select array_agg(key order by key) from jsonb_object_keys(value_copy) key) is distinct from array['unit','value_text']::text[]
    or jsonb_typeof(value_copy -> 'unit') <> 'string' or jsonb_typeof(value_copy -> 'value_text') <> 'string'
    or length(value_copy ->> 'unit') > 80 or length(value_copy ->> 'value_text') > 1000
    or regexp_replace(value_copy ->> 'value_text','[[:space:]]','','g') = ''
    or evidence_links is null or jsonb_typeof(evidence_links) <> 'array'
  then raise exception 'Invalid technical proposal fields.' using errcode = '22023'; end if;
  if jsonb_array_length(evidence_links) > 20 then raise exception 'Too many evidence links.' using errcode = '22023'; end if;
  select * into head from public.technical_revision_heads h where h.product_variant_id = variant_uuid
    and h.field_definition_id = field_uuid and h.scope_label = pi_append_technical_proposal.scope_label;
  if not found then
    select array_agg(id) into matched_ids from public.technical_values
      where product_variant_id = variant_uuid and field_definition_id = field_uuid
        and coalesce(variant_label,'') = scope_label;
    if coalesce(cardinality(matched_ids),0) > 1 then raise exception 'Ambiguous original technical scope.' using errcode = '55000'; end if;
    head.root_value_id := coalesce(matched_ids[1],candidate_uuid);
    head.current_value_id := matched_ids[1];
    head.revision := 0;
  end if;
  if head.revision <> expected_revision then raise exception 'Technical revision changed; reload and compare.' using errcode = '40001'; end if;
  if exists (select 1 from public.technical_revisions where root_value_id = head.root_value_id and review_state = 'pending') then
    raise exception 'Pending review must be explicitly edited or rejected.' using errcode = '55000';
  end if;
  if exists (select 1 from public.technical_revisions candidate join public.technical_values value on value.id = candidate.value_id
    where candidate.root_value_id = head.root_value_id and candidate.review_state = 'proposed' and value.verification_status = 'DATA_CONFLICT')
  then raise exception 'A conflicting proposal needs an explicit human decision.' using errcode = '55000'; end if;
  select * into baseline from public.technical_values where id = head.current_value_id;
  conflicting := found and (baseline.verification_status = 'DATA_CONFLICT'
    or baseline.value_text <> btrim(value_copy ->> 'value_text') or coalesce(baseline.unit,'') <> btrim(value_copy ->> 'unit'));
  conflicting := conflicting or exists (
    select 1 from public.technical_revisions candidate
    join public.technical_values value on value.id = candidate.value_id
    join public.verification_events event on event.id = candidate.decision_event_id
    where candidate.root_value_id = head.root_value_id and value.verification_status = 'DATA_CONFLICT'
      and event.decision = 'EDIT' and candidate.sequence = (select max(sequence) from public.technical_revisions where root_value_id = head.root_value_id)
  );
  for link in select * from jsonb_array_elements(evidence_links) loop
    if jsonb_typeof(link) <> 'object' or (select array_agg(key order by key) from jsonb_object_keys(link) key)
      is distinct from array['role','source_id']::text[] or jsonb_typeof(link -> 'source_id') <> 'string'
      or (link ->> 'source_id') !~ '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
      or coalesce(link ->> 'role','') not in ('supporting','conflicting')
    then raise exception 'Invalid evidence link.' using errcode = '22023'; end if;
    source_uuid := (link ->> 'source_id')::uuid;
    select * into source from public.evidence_sources where id = source_uuid;
    if not found then raise exception 'Evidence source is unavailable.' using errcode = '22023'; end if;
    if exists (select 1 from public.technical_source_bindings binding where evidence_source_id = source_uuid
      and (binding.product_variant_id <> variant_uuid or binding.field_definition_id <> field_uuid
        or binding.scope_label <> pi_append_technical_proposal.scope_label
        or binding.source_digest <> encode(extensions.digest(to_jsonb(source)::text,'sha256'),'hex')))
    then raise exception 'Evidence subject, scope or revision does not match.' using errcode = '22023'; end if;
    conflicting := conflicting or link ->> 'role' = 'conflicting' or exists (
      select 1 from public.technical_source_bindings where evidence_source_id = source_uuid
      and (asserted_value <> btrim(value_copy ->> 'value_text') or asserted_unit <> btrim(value_copy ->> 'unit')));
    if link ->> 'role' = 'supporting' and source.source_level < strongest_level then strongest_level := source.source_level; end if;
  end loop;
  if (select count(*) <> count(distinct (element ->> 'source_id')::uuid) from jsonb_array_elements(evidence_links) element) then
    raise exception 'Evidence links must be unique.' using errcode = '22023';
  end if;
  insert into public.technical_values(id,external_key,field_definition_id,product_variant_id,value_text,unit,
    variant_label,source_type,source_level,verification_status)
  values (candidate_uuid,'working-value:' || candidate_uuid,field_uuid,variant_uuid,btrim(value_copy ->> 'value_text'),
    nullif(btrim(value_copy ->> 'unit'),''),nullif(scope_label,''),'human_proposal',strongest_level,current_status);
  insert into public.technical_value_evidence(technical_value_id,evidence_source_id,evidence_role)
    select candidate_uuid,(element ->> 'source_id')::uuid,element ->> 'role' from jsonb_array_elements(evidence_links) element;
  if conflicting then current_status := 'DATA_CONFLICT';
  elsif strongest_level in ('B','C') and exists (
    select 1 from public.technical_value_evidence link join public.technical_source_bindings binding
      on binding.evidence_source_id = link.evidence_source_id
    where link.technical_value_id = candidate_uuid and link.evidence_role = 'supporting'
      and private.pi_technical_source_matches(link.evidence_source_id,candidate_uuid)
      and binding.source_kind = case strongest_level when 'B' then 'official_manufacturer' else 'technical_standard' end
  ) then current_status := case strongest_level when 'B' then 'OEM_REFERENCE'::public.pi_verification_status else 'STANDARD_REFERENCE'::public.pi_verification_status end;
  end if;
  update public.technical_values set verification_status = current_status where id = candidate_uuid;
  candidate_digest := private.pi_technical_digest(candidate_uuid);
  insert into public.technical_revision_heads values (head.root_value_id,variant_uuid,field_uuid,scope_label,head.current_value_id,head.revision + 1)
    on conflict (root_value_id) do update set revision = excluded.revision;
  update public.technical_revisions set review_state = 'superseded' where root_value_id = head.root_value_id and review_state = 'proposed';
  insert into public.technical_revisions(value_id,root_value_id,predecessor_id,sequence,review_state,proposal_digest,reason,created_by)
    values (candidate_uuid,head.root_value_id,coalesce((select value_id from public.technical_revisions
      where root_value_id = head.root_value_id order by sequence desc limit 1),head.current_value_id),
      head.revision + 1,'proposed',candidate_digest,btrim(proposal_reason),auth.uid());
  return jsonb_build_object('value_id',candidate_uuid,'root_value_id',head.root_value_id,'revision',head.revision + 1,'digest',candidate_digest);
end;
$$;

create function private.pi_propose_technical_revision(
  request_uuid uuid, variant_uuid uuid, field_uuid uuid, scope_label text, expected_revision bigint,
  value_copy jsonb, evidence_links jsonb, proposal_reason text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; payload jsonb := jsonb_build_object('variant',variant_uuid,'field',field_uuid,'scope',scope_label,
  'revision',expected_revision,'value',value_copy,'evidence',evidence_links,'reason',proposal_reason);
begin
  perform private.pi_begin_technical_command(array['owner','editor']::public.pi_console_role[]);
  result := private.pi_draft_receipt('propose_technical_revision',request_uuid,payload);
  if result is not null then return result; end if;
  perform private.pi_technical_capability();
  result := private.pi_append_technical_proposal(variant_uuid,field_uuid,scope_label,expected_revision,value_copy,evidence_links,proposal_reason);
  return private.pi_finish_technical_command('propose_technical_revision',request_uuid,payload,result);
end;
$$;

create function private.pi_check_technical_revision(value_uuid uuid, expected_revision bigint, expected_digest text, required_state text)
returns public.technical_revisions language plpgsql security definer set search_path = '' as $$
declare candidate public.technical_revisions%rowtype; head public.technical_revision_heads%rowtype;
begin
  select * into candidate from public.technical_revisions where value_id = value_uuid;
  if not found then raise exception 'Technical candidate is unavailable.' using errcode = '55000'; end if;
  select * into head from public.technical_revision_heads where root_value_id = candidate.root_value_id;
  perform private.pi_check_technical_target(head.product_variant_id,head.field_definition_id,head.scope_label);
  if expected_revision is null or head.revision <> expected_revision
    or candidate.review_state <> required_state or expected_digest is distinct from candidate.proposal_digest
    or expected_digest is distinct from private.pi_technical_digest(value_uuid)
    or (required_state = 'pending' and candidate.submitted_digest is distinct from expected_digest)
  then raise exception 'Technical value, evidence or review revision changed; reload and compare.' using errcode = '40001'; end if;
  return candidate;
end;
$$;

create function private.pi_submit_technical_review(request_uuid uuid, value_uuid uuid, expected_revision bigint, expected_digest text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare candidate public.technical_revisions%rowtype; result jsonb;
  payload jsonb := jsonb_build_object('value',value_uuid,'revision',expected_revision,'digest',expected_digest);
begin
  perform private.pi_begin_technical_command(array['owner','editor','reviewer']::public.pi_console_role[]);
  result := private.pi_draft_receipt('submit_technical_review',request_uuid,payload);
  if result is not null then return result; end if;
  candidate := private.pi_check_technical_revision(value_uuid,expected_revision,expected_digest,'proposed');
  perform private.pi_technical_capability();
  update public.technical_revisions set review_state = 'pending', submitted_digest = expected_digest where value_id = value_uuid;
  update public.technical_revision_heads set revision = revision + 1 where root_value_id = candidate.root_value_id;
  return private.pi_finish_technical_command('submit_technical_review',request_uuid,payload,
    jsonb_build_object('value_id',value_uuid,'revision',expected_revision + 1,'digest',expected_digest));
end;
$$;

create function private.pi_review_technical_revision(
  request_uuid uuid, value_uuid uuid, expected_revision bigint, expected_digest text,
  decision text, review_reason text, conflict_resolution text, replacement_value jsonb, replacement_evidence jsonb
)
returns jsonb language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
declare
  candidate public.technical_revisions%rowtype; head public.technical_revision_heads%rowtype;
  value public.technical_values%rowtype; event_uuid uuid := extensions.gen_random_uuid(); result jsonb;
  payload jsonb := jsonb_build_object('value',value_uuid,'revision',expected_revision,'digest',expected_digest,
    'decision',decision,'reason',review_reason,'resolution',conflict_resolution,'replacement',replacement_value,'evidence',replacement_evidence);
begin
  perform private.pi_begin_technical_command(array['owner','reviewer']::public.pi_console_role[]);
  perform private.pi_require_review_reason(review_reason);
  if decision is null or decision not in ('APPROVE','EDIT','REJECT')
    or (decision <> 'EDIT' and (replacement_value is not null or replacement_evidence is not null))
    or conflict_resolution is null or length(conflict_resolution) > 2000
  then raise exception 'Invalid review decision fields.' using errcode = '22023'; end if;
  result := private.pi_draft_receipt('review_technical_revision',request_uuid,payload);
  if result is not null then return result; end if;
  candidate := private.pi_check_technical_revision(value_uuid,expected_revision,expected_digest,'pending');
  select * into head from public.technical_revision_heads where root_value_id = candidate.root_value_id;
  select * into value from public.technical_values where id = value_uuid;
  if decision = 'APPROVE' then
    if not exists (select 1 from public.technical_value_evidence link where technical_value_id = value_uuid
      and evidence_role = 'supporting' and private.pi_evidence_source_qualifies(evidence_source_id)
      and private.pi_technical_source_matches(evidence_source_id,value_uuid))
    then raise exception 'Approval requires matching value, scope and immutable exact-item Level A evidence.' using errcode = '23514'; end if;
    if value.verification_status = 'DATA_CONFLICT' then perform private.pi_require_review_reason(conflict_resolution); end if;
  end if;
  perform private.pi_technical_capability();
  insert into public.verification_events(id,entity_type,entity_id,field_key,decision,reason,before_value,after_value,evidence_source_ids,actor_id)
  values (event_uuid,'technical_value',value_uuid,(select field_key from public.technical_field_definitions where id = value.field_definition_id),
    decision::public.pi_review_decision,btrim(review_reason),
    jsonb_build_object('candidate',to_jsonb(value),'current_value_id',head.current_value_id,'revision',expected_revision,'digest',expected_digest),
    jsonb_build_object('decision',decision,'digest',expected_digest,'conflict_resolution',btrim(conflict_resolution),
      'replacement_value',replacement_value,'replacement_evidence',replacement_evidence),
    array(select evidence_source_id from public.technical_value_evidence where technical_value_id = value_uuid order by evidence_source_id),auth.uid());
  update public.technical_revisions set review_state = case decision when 'APPROVE' then 'approved' when 'EDIT' then 'superseded' else 'rejected' end,
    decision_event_id = event_uuid where value_id = value_uuid;
  if decision = 'APPROVE' then
    update public.technical_values set verification_status = 'CONFIRMED', source_level = 'A' where id = value_uuid;
    update public.technical_revision_heads set current_value_id = value_uuid, revision = revision + 1 where root_value_id = candidate.root_value_id;
  elsif decision = 'EDIT' then
    result := private.pi_append_technical_proposal(head.product_variant_id,head.field_definition_id,head.scope_label,
      expected_revision,replacement_value,replacement_evidence,review_reason);
  else
    update public.technical_revision_heads set revision = revision + 1 where root_value_id = candidate.root_value_id;
  end if;
  result := coalesce(result,jsonb_build_object('value_id',value_uuid,'revision',expected_revision + 1)) || jsonb_build_object('event_id',event_uuid);
  return private.pi_finish_technical_command('review_technical_revision',request_uuid,payload,result);
end;
$$;

-- Defense in depth: the original timestamp guard is still required, but no longer sufficient
-- for working revisions. EDIT cannot satisfy this exact APPROVE/event/digest binding.
create function private.pi_guard_exact_technical_approval()
returns trigger language plpgsql security definer set search_path = '' set timezone = 'UTC' as $$
begin
  if new.verification_status = 'CONFIRMED' and old.verification_status <> 'CONFIRMED'
    and exists (select 1 from private.pi_working_authority_control where adoption_id is not null)
    and ((to_jsonb(new) - array['verification_status','source_level','confirmed_by','confirmed_at','updated_at'])
      is distinct from (to_jsonb(old) - array['verification_status','source_level','confirmed_by','confirmed_at','updated_at'])
    or not exists (
      select 1 from public.technical_revisions candidate
      join public.verification_events event on event.id = candidate.decision_event_id
      where candidate.value_id = old.id and candidate.review_state = 'approved'
        and candidate.submitted_digest = private.pi_technical_digest(old.id)
        and candidate.submitted_digest = candidate.proposal_digest
        and event.entity_type = 'technical_value' and event.entity_id = old.id
        and event.decision = 'APPROVE' and event.actor_id = auth.uid()
        and event.before_value ->> 'digest' = candidate.submitted_digest
        and event.after_value ->> 'digest' = candidate.submitted_digest
        and event.before_value -> 'candidate' = to_jsonb(old)
        and event.evidence_source_ids = array(select evidence_source_id from public.technical_value_evidence
          where technical_value_id = old.id order by evidence_source_id)
    ))
  then raise exception 'Confirmation requires the exact submitted revision and APPROVE event.' using errcode = '23514'; end if;
  return new;
end;
$$;

create trigger technical_values_exact_approval_guard before update on public.technical_values
for each row execute function private.pi_guard_exact_technical_approval();

create view public.pi_effective_technical_values with (security_invoker = true) as
select value.* from public.technical_values value
left join public.technical_revision_heads root on root.root_value_id = value.id
left join public.technical_revisions candidate on candidate.value_id = value.id
where (candidate.value_id is null and (root.root_value_id is null or root.current_value_id = value.id))
  or candidate.review_state in ('proposed','pending')
  or exists (select 1 from public.technical_revision_heads head where head.current_value_id = value.id);

revoke all on public.pi_effective_technical_values from public, anon, authenticated, service_role;
grant select on public.pi_effective_technical_values to authenticated;

-- Read-only readiness projections and deterministic shadow reconciliation.

create or replace view public.pi_variant_readiness
with (security_invoker = true)
as
with technical as (
  select
    product_variant_id,
    count(*) as technical_value_count,
    count(*) filter (where verification_status = 'CONFIRMED') as confirmed_technical_count,
    count(*) filter (where verification_status = 'DATA_CONFLICT') as technical_conflict_count,
    count(*) filter (
      where verification_status in ('NEEDS_FACTORY_CONFIRMATION', 'DATA_CONFLICT')
        or exists (select 1 from public.technical_revisions candidate
          where candidate.value_id = pi_effective_technical_values.id and candidate.review_state in ('proposed','pending'))
    ) as unresolved_technical_count
  from public.pi_effective_technical_values
  where product_variant_id is not null
  group by product_variant_id
), compatibility as (
  select
    entity.product_variant_id,
    count(relationship.id) as compatibility_count,
    count(relationship.id) filter (
      where relationship.verification_status = 'CONFIRMED'
    ) as confirmed_compatibility_count,
    count(relationship.id) filter (
      where relationship.verification_status = 'DATA_CONFLICT'
    ) as compatibility_conflict_count
  from public.compatibility_entities as entity
  left join public.compatibility_relationships as relationship
    on relationship.subject_entity_id = entity.id
  where entity.product_variant_id is not null
  group by entity.product_variant_id
), media as (
  select
    mapping.product_variant_id,
    count(asset.id) as media_count,
    count(asset.id) filter (
      where mapping.role = 'main'
        and asset.publication_status = 'search_eligible'
        and asset.usage_rights_status = 'approved'
        and asset.content_match_status = 'exact_product'
    ) as eligible_main_image_count,
    count(asset.id) filter (
      where mapping.role = 'main' and asset.publication_status = 'legacy_reference'
    ) as legacy_main_image_count
  from public.product_media as mapping
  join public.media_assets as asset on asset.id = mapping.media_asset_id
  group by mapping.product_variant_id
), seo as (
  select
    product_variant_id,
    count(*) as seo_record_count,
    count(*) filter (where publication_status in ('approved', 'published')) as approved_seo_count
  from public.seo_records
  where product_variant_id is not null
  group by product_variant_id
)
select
  variant.id,
  variant.sku,
  variant.public_slug,
  variant.lifecycle_state,
  variant.is_shadow,
  variant.legacy_status,
  variant.legacy_data_status,
  coalesce(technical.technical_value_count, 0)::integer as technical_value_count,
  coalesce(technical.confirmed_technical_count, 0)::integer as confirmed_technical_count,
  coalesce(technical.technical_conflict_count, 0)::integer as technical_conflict_count,
  coalesce(technical.unresolved_technical_count, 0)::integer as unresolved_technical_count,
  coalesce(compatibility.compatibility_count, 0)::integer as compatibility_count,
  coalesce(compatibility.confirmed_compatibility_count, 0)::integer
    as confirmed_compatibility_count,
  coalesce(compatibility.compatibility_conflict_count, 0)::integer
    as compatibility_conflict_count,
  coalesce(media.media_count, 0)::integer as media_count,
  coalesce(media.eligible_main_image_count, 0)::integer as eligible_main_image_count,
  coalesce(media.legacy_main_image_count, 0)::integer as legacy_main_image_count,
  coalesce(seo.seo_record_count, 0)::integer as seo_record_count,
  coalesce(seo.approved_seo_count, 0)::integer as approved_seo_count,
  (
    (variant.legacy_data_status <> 'confirmed')::integer
    + (coalesce(technical.confirmed_technical_count, 0) = 0)::integer
    + (coalesce(technical.unresolved_technical_count, 0) > 0)::integer
    + (coalesce(compatibility.compatibility_conflict_count, 0) > 0)::integer
    + (
      coalesce(compatibility.compatibility_count, 0) > 0
      and coalesce(compatibility.confirmed_compatibility_count, 0) = 0
    )::integer
    + (coalesce(media.eligible_main_image_count, 0) = 0)::integer
    + (coalesce(seo.approved_seo_count, 0) = 0)::integer
  ) as blocker_count
from public.product_variants as variant
left join technical on technical.product_variant_id = variant.id
left join compatibility on compatibility.product_variant_id = variant.id
left join media on media.product_variant_id = variant.id
left join seo on seo.product_variant_id = variant.id;

create or replace view public.pi_dashboard_metrics
with (security_invoker = true)
as
select 'total_products'::text as metric, count(*)::bigint as value from public.product_variants
union all
select 'shadow_products', count(*) from public.product_variants where is_shadow
union all
select 'verified_products', count(*) from public.product_variants where lifecycle_state = 'VERIFIED'
union all
select 'ready_for_publish', count(*)
  from public.product_variants where lifecycle_state = 'READY_FOR_PUBLISH'
union all
select 'published_products', count(*) from public.product_variants where lifecycle_state = 'PUBLISHED'
union all
select 'needs_factory_confirmation', count(*)
  from public.pi_effective_technical_values where verification_status = 'NEEDS_FACTORY_CONFIRMATION'
union all
select 'data_conflicts', count(*)
  from public.pi_effective_technical_values where verification_status = 'DATA_CONFLICT'
union all
select 'missing_eligible_main_images', count(*)
  from public.pi_variant_readiness where eligible_main_image_count = 0
union all
select 'unconfirmed_compatibility', count(*)
  from public.compatibility_relationships where verification_status <> 'CONFIRMED';

create or replace function private.pi_guard_product_variant_readiness()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  product_type_value text;
  readiness_blockers integer;
begin
  if tg_op = 'INSERT' then
    if not new.is_shadow and new.lifecycle_state <> 'DRAFT' then
      raise exception 'A non-shadow product variant must begin in DRAFT.' using errcode = '23514';
    end if;
    return new;
  end if;

  if new.lifecycle_state is not distinct from old.lifecycle_state then
    return new;
  end if;

  if new.lifecycle_state = 'VERIFIED' then
    if not private.pi_has_approval_event('product_variant', new.id, old.updated_at) then
      raise exception 'VERIFIED requires a new human approve/edit event for the variant.'
        using errcode = '23514';
    end if;
    if exists (
      select 1 from public.pi_effective_technical_values
      where product_variant_id = new.id and verification_status = 'DATA_CONFLICT'
    ) or exists (
      select 1
      from public.compatibility_entities as entity
      join public.compatibility_relationships as relationship
        on relationship.subject_entity_id = entity.id
      where entity.product_variant_id = new.id
        and relationship.verification_status = 'DATA_CONFLICT'
    ) then
      raise exception 'A variant with unresolved data conflicts cannot be VERIFIED.'
        using errcode = '23514';
    end if;

    select product.product_type into product_type_value
    from public.products as product
    where product.id = new.product_id;

    if not exists (
      select 1
      from public.technical_field_definitions as field
      where field.is_critical
        and (
          cardinality(field.applies_to) = 0
          or 'product_variant' = any(field.applies_to)
          or product_type_value = any(field.applies_to)
        )
    ) then
      raise exception 'VERIFIED requires at least one applicable critical field definition.'
        using errcode = '23514';
    end if;

    if exists (
      select 1
      from public.technical_field_definitions as field
      where field.is_critical
        and (
          cardinality(field.applies_to) = 0
          or 'product_variant' = any(field.applies_to)
          or product_type_value = any(field.applies_to)
        )
        and not exists (
          select 1
          from public.pi_effective_technical_values as value
          where value.product_variant_id = new.id
            and value.field_definition_id = field.id
            and value.verification_status = 'CONFIRMED'
        )
    ) then
      raise exception 'VERIFIED requires every applicable critical field to be confirmed.'
        using errcode = '23514';
    end if;
    if exists (
      select 1 from public.pi_effective_technical_values value
      join public.technical_field_definitions field on field.id = value.field_definition_id
      where value.product_variant_id = new.id and field.is_critical and value.verification_status <> 'CONFIRMED'
    ) then
      raise exception 'Every known critical-field scope must be confirmed before VERIFIED.' using errcode = '23514';
    end if;
  elsif new.lifecycle_state = 'READY_FOR_PUBLISH' then
    select blocker_count into readiness_blockers
    from public.pi_variant_readiness
    where id = new.id;
    if readiness_blockers is null or readiness_blockers > 0 then
      raise exception 'READY_FOR_PUBLISH requires zero readiness blockers.' using errcode = '23514';
    end if;
  elsif new.lifecycle_state = 'QA_PASSED' then
    if not exists (
      select 1
      from public.release_items as item
      join public.release_candidates as candidate on candidate.id = item.release_candidate_id
      where item.entity_type = 'product_variant'
        and item.entity_key = new.sku
        and item.blocker_count = 0
        and candidate.status in ('PASS', 'PASS_WITH_WARNINGS', 'APPROVED', 'PUBLISHED')
        and not exists (
          select 1 from public.release_qa_results as result
          where result.release_candidate_id = candidate.id
            and result.qa_run_id = candidate.current_qa_run_id
            and result.result = 'BLOCKED'
        )
    ) then
      raise exception 'QA_PASSED requires a non-blocking release QA record for this SKU.'
        using errcode = '23514';
    end if;
  elsif new.lifecycle_state = 'PUBLISHED' then
    if not exists (
      select 1
      from public.release_items as item
      join public.release_candidates as candidate on candidate.id = item.release_candidate_id
      join public.publish_records as publication on publication.release_candidate_id = candidate.id
      where item.entity_type = 'product_variant'
        and item.entity_key = new.sku
        and candidate.status = 'PUBLISHED'
    ) then
      raise exception 'PUBLISHED requires a completed publish record for this SKU.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;


revoke all on all functions in schema private from public, anon, authenticated, service_role;
