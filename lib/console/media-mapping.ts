import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { ConsoleReadError, uuid } from "./catalog.ts";
import { readAllConsoleRows, type CountedRows } from "./read-pages.ts";
import { readOriginalIntakes, type OriginalIntakeRow } from "./originals.ts";
import { consoleMediaReviewEnabled } from "./working-config.ts";
import { mediaMappingRoles, type MediaMappingRole } from "../domain/catalog/media-commands.ts";
import type { MediaDimension } from "../domain/catalog/media-review.ts";

export type MediaSource = {
  id: string;
  assetId: string;
  role: MediaMappingRole;
  dimension: MediaDimension;
  title: string;
  reference: string;
  level: string;
  assertion: string;
  basis: string;
  version: string;
  location: string;
  date: string | null;
  owner: string | null;
};
export type MediaMappingFact = {
  id: string;
  assetId: string;
  originalIntentId: string;
  altText: string;
  revision: number;
  state: string;
  status: string;
  digest: string;
  originalDigest: string;
  reason: string;
  sourceIds: string[];
  valid: boolean;
  observed: boolean;
};
export type MediaMappingScope = {
  id: string;
  role: MediaMappingRole;
  slot: number;
  revision: number;
  candidate: MediaMappingFact | null;
  current: MediaMappingFact | null;
};
export type MediaMappingData = {
  variantId: string;
  sku: string;
  canPropose: boolean;
  canSubmit: boolean;
  canReview: boolean;
  originals: OriginalIntakeRow[];
  sources: MediaSource[];
  scopes: MediaMappingScope[];
  legacy: {
    id: string;
    assetId: string;
    role: string;
    slot: number;
    altText: string;
    publicationReady: boolean;
  }[];
};
export type MediaMappingHistory = {
  items: {
    id: string;
    revision: number;
    assetId: string;
    altText: string;
    state: string;
    status: string;
    reason: string;
    createdAt: string;
    decision: string | null;
    reviewReason: string | null;
    resolution: string | null;
    sourceIds: string[];
  }[];
  total: number;
  page: number;
  pageSize: number;
};
const factColumns =
  "id,head_id,media_asset_id,original_intent_id,sequence,alt_text,review_state,verification_status,proposal_digest,submitted_digest,original_digest,reason,created_at" as const;
const headColumns = "id,product_variant_id,media_role,slot,revision" as const;
function role(value: string): MediaMappingRole {
  if (!mediaMappingRoles.some((role) => role === value)) throw new ConsoleReadError();
  return value as MediaMappingRole;
}
function ensure(condition: unknown): asserts condition {
  if (!condition) throw new ConsoleReadError();
}
async function authorize(client: ConsoleClient) {
  ensure(consoleMediaReviewEnabled());
  const access = await checkConsoleAccess(client);
  ensure(access.status === "authorized");
  return access;
}
async function byIds<T>(
  ids: string[],
  fetch: (ids: string[], start: number, end: number) => PromiseLike<CountedRows<T>>,
  key: (row: T) => string,
) {
  const unique = [...new Set(ids)].sort();
  const result: T[] = [];
  for (let offset = 0; offset < unique.length; offset += 100)
    result.push(
      ...(await readAllConsoleRows(
        (start, end) => fetch(unique.slice(offset, offset + 100), start, end),
        key,
      )),
    );
  ensure(new Set(result.map(key)).size === result.length);
  return result;
}
async function evidence(client: ConsoleClient, ids: string[]) {
  return byIds(
    ids,
    (ids, start, end) =>
      client
        .from("media_mapping_evidence")
        .select("revision_id,evidence_source_id", { count: "exact" })
        .in("revision_id", ids)
        .order("revision_id")
        .order("evidence_source_id")
        .range(start, end),
    (row) => `${row.revision_id}:${row.evidence_source_id}`,
  );
}
function heads(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("media_mapping_heads")
        .select(headColumns, { count: "exact" })
        .eq("product_variant_id", id)
        .order("id")
        .range(start, end),
    (row) => row.id,
  );
}
function mappingStates(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("pi_media_mapping_states")
        .select(
          "head_id,mapping_id,product_variant_id,media_asset_id,media_role,slot,revision,alt_text,review_state,verification_status,proposal_digest,submitted_digest",
          { count: "exact" },
        )
        .eq("product_variant_id", id)
        .order("head_id")
        .range(start, end),
    (row) => row.head_id!,
  );
}
function effectiveMappings(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("pi_effective_media_mappings")
        .select(
          "mapping_id,head_id,product_variant_id,media_asset_id,role,slot,alt_text,mapping_origin,review_state,verification_status,review_valid,publication_ready",
          { count: "exact" },
        )
        .eq("product_variant_id", id)
        .order("mapping_id")
        .range(start, end),
    (row) => row.mapping_id!,
  );
}
export async function readMediaMappings(
  client: ConsoleClient,
  id: string,
): Promise<MediaMappingData | null> {
  const access = await authorize(client);
  uuid(id);
  const first = await readOriginalIntakes(client, id, 1);
  if (!first) return null;
  ensure(first.total <= 10000);
  const originals = [...first.items];
  for (let page = 2; originals.length < first.total; page++) {
    const next = await readOriginalIntakes(client, id, page);
    ensure(next && next.total === first.total && next.sku === first.sku && next.items.length);
    originals.push(...next.items);
  }
  ensure(
    originals.length === first.total &&
      new Set(originals.map((row) => row.intent_id)).size === originals.length &&
      new Set(originals.map((row) => row.asset_id)).size === originals.length,
  );
  const scopeRows = await heads(client, id);
  const states = await mappingStates(client, id);
  ensure(states.length === scopeRows.length);
  const effective = await effectiveMappings(client, id);
  const factIds = [
    ...new Set([
      ...states.map((row) => row.mapping_id!),
      ...effective.filter((row) => row.mapping_origin !== "legacy").map((row) => row.mapping_id!),
    ]),
  ];
  const facts = await byIds(
    factIds,
    (ids, start, end) =>
      client
        .from("media_mapping_revisions")
        .select(factColumns, { count: "exact" })
        .in("id", ids)
        .order("id")
        .range(start, end),
    (row) => row.id,
  );
  ensure(facts.length === factIds.length);
  const links = await evidence(client, factIds);
  // Read all same-SKU bindings, including contradictions omitted by the candidate.
  const bindings = await readAllConsoleRows(
    (start, end) =>
      client
        .from("media_source_bindings")
        .select(
          "evidence_source_id,product_variant_id,media_asset_id,media_role,evidence_dimension,assertion,evidence_basis,revision_label,source_location",
          { count: "exact" },
        )
        .eq("product_variant_id", id)
        .order("evidence_source_id")
        .range(start, end),
    (row) => row.evidence_source_id,
  );
  const sourceRows = await byIds(
    bindings.map((row) => row.evidence_source_id),
    (ids, start, end) =>
      client
        .from("evidence_sources")
        .select("id,title,source_reference,source_level,evidence_date,owner_name", {
          count: "exact",
        })
        .in("id", ids)
        .order("id")
        .range(start, end),
    (row) => row.id,
  );
  ensure(sourceRows.length === bindings.length);
  const sourceMap = new Map(sourceRows.map((row) => [row.id, row]));
  const sources: MediaSource[] = bindings.map((binding) => {
    const source = sourceMap.get(binding.evidence_source_id);
    ensure(
      source &&
        binding.product_variant_id === id &&
        ["usage_rights", "product_match"].includes(binding.evidence_dimension) &&
        ["supports", "contradicts", "reference_only"].includes(binding.assertion),
    );
    return {
      id: source.id,
      assetId: binding.media_asset_id,
      role: role(binding.media_role),
      dimension: binding.evidence_dimension as MediaDimension,
      title: source.title,
      reference: source.source_reference,
      level: source.source_level ?? "Unknown",
      assertion: binding.assertion,
      basis: binding.evidence_basis,
      version: binding.revision_label,
      location: binding.source_location,
      date: source.evidence_date,
      owner: source.owner_name,
    };
  });
  const bindingMap = new Map(sources.map((row) => [row.id, row]));
  const scopes: MediaMappingScope[] = [];
  const managed = new Set<string>();
  for (const head of scopeRows) {
    ensure(
      head.product_variant_id === id &&
        Number.isSafeInteger(head.revision) &&
        head.revision > 0 &&
        Number.isSafeInteger(head.slot) &&
        head.slot >= 0 &&
        head.slot <= 99 &&
        (head.media_role !== "main" || head.slot === 0),
    );
    const state = states.find((row) => row.head_id === head.id);
    ensure(
      state &&
        state.product_variant_id === id &&
        state.revision === head.revision &&
        state.media_role === head.media_role &&
        state.slot === head.slot,
    );
    const entries = effective.filter((row) => row.head_id === head.id);
    ensure(
      entries.filter((row) => row.mapping_origin === "open").length <= 1 &&
        entries.filter((row) => row.mapping_origin === "current").length <= 1,
    );
    const make = async (
      mappingId: string,
      origin: "open" | "current",
    ): Promise<MediaMappingFact> => {
      const row = facts.find((row) => row.id === mappingId);
      const view = entries.find(
        (row) => row.mapping_id === mappingId && row.mapping_origin === origin,
      );
      ensure(
        row &&
          view &&
          view.product_variant_id === id &&
          row.head_id === head.id &&
          view.role === head.media_role &&
          view.slot === head.slot &&
          view.media_asset_id === row.media_asset_id &&
          view.alt_text === row.alt_text &&
          view.review_state === row.review_state &&
          view.publication_ready === false &&
          typeof view.review_valid === "boolean" &&
          originals.some(
            (item) =>
              item.asset_id === row.media_asset_id &&
              item.intent_id === row.original_intent_id &&
              item.completed,
          ),
      );
      ensure(
        Number.isSafeInteger(row.sequence) &&
          row.sequence >= 1 &&
          row.sequence <= head.revision &&
          /^[a-f0-9]{64}$/.test(row.original_digest) &&
          /^[a-f0-9]{64}$/.test(row.proposal_digest),
      );
      if (origin === "open")
        ensure(
          row.sequence === head.revision &&
            ["proposed", "pending"].includes(row.review_state) &&
            state.mapping_id === row.id &&
            state.media_asset_id === row.media_asset_id &&
            state.alt_text === row.alt_text &&
            state.review_state === row.review_state &&
            state.verification_status === row.verification_status &&
            state.proposal_digest === row.proposal_digest &&
            state.submitted_digest === row.submitted_digest,
        );
      else ensure(row.review_state === "approved");
      if (row.review_state === "pending") ensure(row.submitted_digest === row.proposal_digest);
      const sourceIds = links
        .filter((link) => link.revision_id === row.id)
        .map((link) => link.evidence_source_id)
        .sort();
      ensure(
        sourceIds.length <= 20 &&
          sourceIds.every((sourceId) => {
            const source = bindingMap.get(sourceId);
            return source?.assetId === row.media_asset_id && source.role === head.media_role;
          }),
      );
      let observed = false;
      if (origin === "current") {
        const proof = await client.rpc("pi_media_review_observed", { mapping_uuid: row.id });
        ensure(!proof.error && typeof proof.data === "boolean");
        observed = proof.data;
      }
      managed.add(row.id);
      return {
        id: row.id,
        assetId: row.media_asset_id,
        originalIntentId: row.original_intent_id,
        altText: row.alt_text,
        revision: row.sequence,
        state: row.review_state,
        status: view.verification_status!,
        digest: row.submitted_digest ?? row.proposal_digest,
        originalDigest: row.original_digest,
        reason: row.reason,
        sourceIds,
        valid: view.review_valid,
        observed,
      };
    };
    const open = entries.find((row) => row.mapping_origin === "open");
    const current = entries.find((row) => row.mapping_origin === "current");
    scopes.push({
      id: head.id,
      role: role(head.media_role),
      slot: head.slot,
      revision: head.revision,
      candidate: open ? await make(open.mapping_id!, "open") : null,
      current: current ? await make(current.mapping_id!, "current") : null,
    });
  }
  ensure(
    effective
      .filter((row) => row.mapping_origin !== "legacy")
      .every((row) => managed.has(row.mapping_id!)),
  );
  const legacy = effective
    .filter((row) => row.mapping_origin === "legacy")
    .map((row) => {
      ensure(
        row.mapping_id &&
          row.media_asset_id &&
          row.role &&
          row.slot !== null &&
          row.alt_text !== null &&
          row.head_id === null &&
          row.product_variant_id === id &&
          typeof row.publication_ready === "boolean",
      );
      return {
        id: row.mapping_id,
        assetId: row.media_asset_id,
        role: row.role,
        slot: row.slot,
        altText: row.alt_text,
        publicationReady: row.publication_ready,
      };
    });
  // Review transitions do not always increment the head; compare both projections as well.
  ensure(
    JSON.stringify(await heads(client, id)) === JSON.stringify(scopeRows) &&
      JSON.stringify(await mappingStates(client, id)) === JSON.stringify(states) &&
      JSON.stringify(await effectiveMappings(client, id)) === JSON.stringify(effective),
  );
  const finalAccess = await authorize(client);
  ensure(
    finalAccess.userId === access.userId &&
      [...finalAccess.roles].sort().join() === [...access.roles].sort().join(),
  );
  return {
    variantId: id,
    sku: first.sku,
    canPropose: access.roles.some((role) => ["owner", "editor"].includes(role)),
    canSubmit: access.roles.some((role) => ["owner", "editor", "reviewer"].includes(role)),
    canReview: access.roles.some((role) => ["owner", "reviewer"].includes(role)),
    originals,
    sources,
    scopes,
    legacy,
  };
}

export async function readMediaMappingHistory(
  client: ConsoleClient,
  id: string,
  headId: string,
  page: number,
): Promise<MediaMappingHistory> {
  const access = await authorize(client);
  uuid(id);
  uuid(headId);
  ensure(Number.isSafeInteger(page) && page >= 1 && page <= 10000);
  const head = await client
    .from("media_mapping_heads")
    .select(headColumns)
    .eq("id", headId)
    .eq("product_variant_id", id)
    .single();
  ensure(!head.error && head.data);
  const result = await client
    .from("media_mapping_revisions")
    .select(factColumns, { count: "exact" })
    .eq("head_id", headId)
    .order("sequence", { ascending: false })
    .order("id")
    .range((page - 1) * 25, page * 25 - 1);
  ensure(
    !result.error &&
      result.data &&
      Number.isSafeInteger(result.count) &&
      result.count! >= 0 &&
      result.data.length === Math.min(25, Math.max(0, result.count! - (page - 1) * 25)) &&
      new Set(result.data.map((row) => row.id)).size === result.data.length,
  );
  const links = await evidence(
    client,
    result.data.map((row) => row.id),
  );
  const sourceIds = [...new Set(links.map((row) => row.evidence_source_id))];
  const bindings = await byIds(
    sourceIds,
    (ids, start, end) =>
      client
        .from("media_source_bindings")
        .select("evidence_source_id,product_variant_id,media_asset_id,media_role", {
          count: "exact",
        })
        .eq("product_variant_id", id)
        .in("evidence_source_id", ids)
        .order("evidence_source_id")
        .range(start, end),
    (row) => row.evidence_source_id,
  );
  ensure(bindings.length === sourceIds.length);
  const decisions = await byIds(
    result.data.map((row) => row.id),
    (ids, start, end) =>
      client
        .from("media_mapping_decisions")
        .select("mapping_id,event_id,decision,conflict_resolution", { count: "exact" })
        .in("mapping_id", ids)
        .order("mapping_id")
        .range(start, end),
    (row) => row.mapping_id,
  );
  const events = await byIds(
    decisions.map((row) => row.event_id),
    (ids, start, end) =>
      client
        .from("verification_events")
        .select("id,entity_type,entity_id,decision,reason", { count: "exact" })
        .in("id", ids)
        .order("id")
        .range(start, end),
    (row) => row.id,
  );
  ensure(events.length === decisions.length);
  const items = result.data.map((row) => {
    ensure(
      row.head_id === headId &&
        Number.isSafeInteger(row.sequence) &&
        row.sequence >= 1 &&
        row.sequence <= head.data!.revision,
    );
    ensure(
      links
        .filter((link) => link.revision_id === row.id)
        .every((link) => {
          const binding = bindings.find(
            (item) => item.evidence_source_id === link.evidence_source_id,
          );
          return (
            binding?.product_variant_id === id &&
            binding.media_asset_id === row.media_asset_id &&
            binding.media_role === head.data!.media_role
          );
        }),
    );
    const decision = decisions.find((item) => item.mapping_id === row.id);
    const event = decision ? events.find((item) => item.id === decision.event_id) : null;
    ensure(
      decision
        ? event?.entity_type === "media_mapping" &&
            event.entity_id === row.id &&
            event.decision === decision.decision &&
            row.review_state ===
              { APPROVE: "approved", EDIT: "superseded", REJECT: "rejected" }[decision.decision]
        : ["proposed", "pending", "superseded"].includes(row.review_state),
    );
    return {
      id: row.id,
      revision: row.sequence,
      assetId: row.media_asset_id,
      altText: row.alt_text,
      state: row.review_state,
      status: row.verification_status,
      reason: row.reason,
      createdAt: row.created_at,
      decision: decision?.decision ?? null,
      reviewReason: event?.reason ?? null,
      resolution: decision?.conflict_resolution ?? null,
      sourceIds: links
        .filter((link) => link.revision_id === row.id)
        .map((link) => link.evidence_source_id)
        .sort(),
    };
  });
  const latest = await client
    .from("media_mapping_heads")
    .select(headColumns)
    .eq("id", headId)
    .eq("product_variant_id", id)
    .single();
  ensure(!latest.error && JSON.stringify(latest.data) === JSON.stringify(head.data));
  const finalAccess = await authorize(client);
  ensure(finalAccess.userId === access.userId);
  return { items, total: result.count!, page, pageSize: 25 };
}
