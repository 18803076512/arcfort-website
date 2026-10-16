import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import {
  ConsoleInputError,
  ConsoleReadError,
  literalPattern,
  uuid,
  type SearchParams,
} from "./catalog.ts";
import { consoleCompatibilityEnabled } from "./working-config.ts";
import { readWorkingStates, readWorkingStatus } from "./working.ts";
import { readAllConsoleRows, type CountedRows } from "./read-pages.ts";
import {
  compatibilityRelationshipTypes,
  type CompatibilityRelationshipType,
} from "../domain/catalog/compatibility.ts";

export type CompatibilityEvidence = {
  id: string;
  title: string;
  reference: string;
  level: string;
  linkRole: string;
  assertion: string | null;
  basis: string | null;
  version: string | null;
  location: string | null;
};
export type CompatibilityFact = {
  id: string;
  role: string;
  status: string;
  relationshipStatus: string;
  requirements: string[];
  evidence: CompatibilityEvidence[];
};
export type CompatibilitySource = Omit<CompatibilityEvidence, "linkRole"> & {
  subjectId: string;
  targetId: string;
  type: CompatibilityRelationshipType;
  scope: string;
  role: string;
};
export type CompatibilityScope = {
  id: string;
  targetId: string;
  targetLabel: string;
  type: CompatibilityRelationshipType;
  scope: string;
  revision: number;
  original: CompatibilityFact | null;
  current: CompatibilityFact | null;
  candidate: (CompatibilityFact & { state: string; digest: string }) | null;
};
export type CompatibilityWorkbenchData = {
  variantId: string;
  sku: string;
  subjectId: string | null;
  canEdit: boolean;
  canReview: boolean;
  scopes: CompatibilityScope[];
  sources: CompatibilitySource[];
};
export type CompatibilityTarget = { id: string; label: string; type: string };

export function compatibilityFilters(params: SearchParams) {
  const root = params.root ?? "";
  const kind = params.kind ?? "series";
  const q = params.q ?? "";
  if (
    typeof root !== "string" ||
    typeof kind !== "string" ||
    typeof q !== "string" ||
    q.length > 100 ||
    !["series", "torch", "machine", "oem_reference"].includes(kind)
  )
    throw new ConsoleInputError();
  if (root && root !== "new") uuid(root);
  function page(key: string) {
    const value = params[key] ?? "1";
    if (typeof value !== "string" || !/^[1-9][0-9]{0,4}$/.test(value) || Number(value) > 10000)
      throw new ConsoleInputError();
    return Number(value);
  }
  return { root, kind, q, targetPage: page("targetPage"), historyPage: page("historyPage") };
}
export type CompatibilityFilters = ReturnType<typeof compatibilityFilters>;

async function authorize(client: ConsoleClient) {
  if (!consoleCompatibilityEnabled() || (await checkConsoleAccess(client)).status !== "authorized")
    throw new ConsoleReadError();
}
function relationType(value: string | null): CompatibilityRelationshipType {
  if (!compatibilityRelationshipTypes.some((type) => type === value)) throw new ConsoleReadError();
  return value as CompatibilityRelationshipType;
}
async function byIds<T>(
  ids: string[],
  fetch: (ids: string[], start: number, end: number) => PromiseLike<CountedRows<T>>,
  key: (row: T) => string,
) {
  const result: T[] = [];
  const unique = [...new Set(ids)];
  for (let start = 0; start < unique.length; start += 100) {
    result.push(
      ...(await readAllConsoleRows(
        (from, to) => fetch(unique.slice(start, start + 100), from, to),
        key,
      )),
    );
    if (result.length > 10000) throw new ConsoleReadError();
  }
  if (new Set(result.map(key)).size !== result.length) throw new ConsoleReadError();
  return result;
}
const factColumns =
  "id,external_key,subject_entity_id,target_entity_id,relationship_type,role,verification_status,relationship_status,confirmation_requirements" as const;

export async function readCompatibilityWorkbench(
  client: ConsoleClient,
  id: string,
): Promise<CompatibilityWorkbenchData | null> {
  await authorize(client);
  uuid(id);
  const status = await readWorkingStatus(client);
  if (!(await readWorkingStates(client, [id])).length) return null;
  const identity = await client.from("product_variants").select("sku").eq("id", id).maybeSingle();
  if (identity.error || !identity.data) throw new ConsoleReadError();
  const subjects = await readAllConsoleRows(
    (start, end) =>
      client
        .from("compatibility_entities")
        .select("id,entity_type,product_series_id", { count: "exact" })
        .eq("product_variant_id", id)
        .order("id")
        .range(start, end),
    (row) => row.id,
    1,
  );
  const subject = subjects[0];
  if (subject && (subject.entity_type !== "product" || subject.product_series_id))
    throw new ConsoleReadError();
  const base = {
    variantId: id,
    sku: identity.data.sku,
    subjectId: subject?.id ?? null,
    canEdit: status.can_edit,
    canReview: status.can_review,
  };
  if (!subject) return { ...base, scopes: [], sources: [] };
  const heads = await readAllConsoleRows(
    (start, end) =>
      client
        .from("compatibility_revision_heads")
        .select(
          "root_relationship_id,current_relationship_id,target_entity_id,relationship_type,scope_label,revision",
          { count: "exact" },
        )
        .eq("subject_entity_id", subject.id)
        .order("root_relationship_id")
        .range(start, end),
    (row) => row.root_relationship_id,
  );
  const effective = await readAllConsoleRows(
    (start, end) =>
      client
        .from("pi_effective_compatibility_relationships")
        .select(factColumns, { count: "exact" })
        .eq("subject_entity_id", subject.id)
        .order("id")
        .range(start, end),
    (row) => row.id ?? "",
  );
  const originals = await byIds(
    heads.map((head) => head.root_relationship_id),
    (ids, start, end) =>
      client
        .from("compatibility_relationships")
        .select(factColumns, { count: "exact" })
        .in("id", ids)
        .eq("subject_entity_id", subject.id)
        .order("id")
        .range(start, end),
    (row) => row.id,
  );
  if (originals.length !== heads.length) throw new ConsoleReadError();
  const pending = await byIds(
    heads.map((head) => head.root_relationship_id),
    (ids, start, end) =>
      client
        .from("compatibility_revisions")
        .select("relationship_id,root_relationship_id,review_state,proposal_digest", {
          count: "exact",
        })
        .in("root_relationship_id", ids)
        .in("review_state", ["proposed", "pending"])
        .order("relationship_id")
        .range(start, end),
    (row) => row.relationship_id,
  );
  const bindings = await readAllConsoleRows(
    (start, end) =>
      client
        .from("compatibility_source_bindings")
        .select(
          "evidence_source_id,subject_entity_id,target_entity_id,relationship_type,scope_label,asserted_role,assertion,evidence_basis,revision_label,source_location",
          { count: "exact" },
        )
        .eq("product_variant_id", id)
        .eq("subject_entity_id", subject.id)
        .order("evidence_source_id")
        .range(start, end),
    (row) => row.evidence_source_id,
  );
  const rows = [...new Map([...effective, ...originals].map((row) => [row.id, row])).values()];
  const links = await byIds(
    rows.map((row) => row.id!),
    (ids, start, end) =>
      client
        .from("compatibility_evidence")
        .select("compatibility_relationship_id,evidence_source_id,evidence_role", {
          count: "exact",
        })
        .in("compatibility_relationship_id", ids)
        .order("compatibility_relationship_id")
        .order("evidence_source_id")
        .range(start, end),
    (row) => `${row.compatibility_relationship_id}:${row.evidence_source_id}`,
  );
  const sourceIds = [
    ...new Set([
      ...bindings.map((row) => row.evidence_source_id),
      ...links.map((row) => row.evidence_source_id),
    ]),
  ];
  const sources = await byIds(
    sourceIds,
    (ids, start, end) =>
      client
        .from("evidence_sources")
        .select("id,title,source_reference,source_level", { count: "exact" })
        .in("id", ids)
        .order("id")
        .range(start, end),
    (row) => row.id,
  );
  if (sources.length !== sourceIds.length) throw new ConsoleReadError();
  const targetIds = [
    ...new Set([
      ...rows.map((row) => row.target_entity_id!),
      ...bindings.map((row) => row.target_entity_id),
    ]),
  ];
  const targets = await byIds(
    targetIds,
    (ids, start, end) =>
      client
        .from("compatibility_entities")
        .select("id,label,entity_type", { count: "exact" })
        .in("id", ids)
        .order("id")
        .range(start, end),
    (row) => row.id,
  );
  if (targets.length !== targetIds.length) throw new ConsoleReadError();
  const bindingMap = new Map(bindings.map((row) => [row.evidence_source_id, row]));
  const sourceMap = new Map(sources.map((row) => [row.id, row]));
  const targetMap = new Map(targets.map((row) => [row.id, row]));
  const originalMap = new Map(originals.map((row) => [row.id, row]));
  const effectiveMap = new Map(effective.map((row) => [row.id, row]));
  const linksByFact = new Map<string, typeof links>();
  for (const link of links) {
    const group = linksByFact.get(link.compatibility_relationship_id) ?? [];
    group.push(link);
    linksByFact.set(link.compatibility_relationship_id, group);
  }
  const pendingByRoot = new Map<string, (typeof pending)[number]>();
  for (const row of pending) {
    if (pendingByRoot.has(row.root_relationship_id)) throw new ConsoleReadError();
    pendingByRoot.set(row.root_relationship_id, row);
  }
  const source = (id: string) => {
    const row = sourceMap.get(id);
    if (!row) throw new ConsoleReadError();
    const binding = bindingMap.get(id);
    return {
      id,
      title: row.title,
      reference: row.source_reference,
      level: row.source_level ?? "Unknown",
      assertion: binding?.assertion ?? null,
      basis: binding?.evidence_basis ?? null,
      version: binding?.revision_label ?? null,
      location: binding?.source_location ?? null,
    };
  };
  const facts = new Map(
    rows.map((row) => {
      if (
        !row.id ||
        !row.role ||
        !row.verification_status ||
        !row.relationship_status ||
        !row.confirmation_requirements
      )
        throw new ConsoleReadError();
      const fact: CompatibilityFact = {
        id: row.id,
        role: row.role,
        status: row.verification_status,
        relationshipStatus: row.relationship_status,
        requirements: row.confirmation_requirements,
        evidence: (linksByFact.get(row.id) ?? []).map((link) => ({
          ...source(link.evidence_source_id),
          linkRole: link.evidence_role,
        })),
      };
      return [row.id, fact] as const;
    }),
  );
  const fact = (id: string | null) => {
    if (id === null) return null;
    const value = facts.get(id);
    if (!value) throw new ConsoleReadError();
    return value;
  };
  const target = (id: string) => {
    const value = targetMap.get(id);
    if (!value) throw new ConsoleReadError();
    return value;
  };
  const scopes: CompatibilityScope[] = heads.map((head) => {
    const candidate = pendingByRoot.get(head.root_relationship_id);
    const candidateFact = candidate ? fact(candidate.relationship_id) : null;
    const original = originalMap.get(head.root_relationship_id)!;
    for (const pointer of [head.current_relationship_id, candidate?.relationship_id]) {
      if (!pointer) continue;
      const row = effectiveMap.get(pointer);
      if (
        !row ||
        row.subject_entity_id !== subject.id ||
        row.target_entity_id !== head.target_entity_id ||
        row.relationship_type !== head.relationship_type
      )
        throw new ConsoleReadError();
    }
    if (
      original.target_entity_id !== head.target_entity_id ||
      original.relationship_type !== head.relationship_type ||
      !Number.isSafeInteger(head.revision) ||
      head.revision < 1 ||
      (candidate && !/^[a-f0-9]{64}$/.test(candidate.proposal_digest))
    )
      throw new ConsoleReadError();
    return {
      id: head.root_relationship_id,
      targetId: head.target_entity_id,
      targetLabel: target(head.target_entity_id).label,
      type: relationType(head.relationship_type),
      scope: head.scope_label,
      revision: head.revision,
      original: original.external_key.startsWith("working-relationship:")
        ? null
        : fact(original.id),
      current: fact(head.current_relationship_id),
      candidate:
        candidate && candidateFact
          ? { ...candidateFact, state: candidate.review_state, digest: candidate.proposal_digest }
          : null,
    };
  });
  const managed = new Set([
    ...heads.map((row) => row.root_relationship_id),
    ...heads.map((row) => row.current_relationship_id),
    ...pending.map((row) => row.relationship_id),
  ]);
  for (const row of effective) {
    if (managed.has(row.id)) continue;
    if (
      !row.id ||
      !row.target_entity_id ||
      row.subject_entity_id !== subject.id ||
      row.external_key?.startsWith("working-relationship:")
    )
      throw new ConsoleReadError();
    scopes.push({
      id: row.id,
      targetId: row.target_entity_id,
      targetLabel: target(row.target_entity_id).label,
      type: relationType(row.relationship_type),
      scope: "",
      revision: 0,
      original: fact(row.id),
      current: fact(row.id),
      candidate: null,
    });
  }
  return {
    ...base,
    scopes: scopes.sort(
      (a, b) => a.targetLabel.localeCompare(b.targetLabel) || a.id.localeCompare(b.id),
    ),
    sources: bindings.map((binding) => ({
      ...source(binding.evidence_source_id),
      subjectId: binding.subject_entity_id,
      targetId: binding.target_entity_id,
      type: relationType(binding.relationship_type),
      scope: binding.scope_label,
      role: binding.asserted_role,
    })),
  };
}

function checkedPage<T>(result: CountedRows<T>, page: number, key: (row: T) => string) {
  if (result.error || !result.data || !Number.isSafeInteger(result.count) || result.count! < 0)
    throw new ConsoleReadError();
  const expected = Math.min(25, Math.max(0, result.count! - (page - 1) * 25));
  if (result.data.length !== expected || new Set(result.data.map(key)).size !== expected)
    throw new ConsoleReadError();
  return { items: result.data, total: result.count!, page, pageSize: 25 };
}
export async function readCompatibilityTargets(
  client: ConsoleClient,
  filter: CompatibilityFilters,
) {
  await authorize(client);
  let query = client
    .from("compatibility_entities")
    .select("id,label,entity_type", { count: "exact" })
    .eq("entity_type", filter.kind)
    .is("product_variant_id", null);
  if (filter.q) query = query.ilike("label", literalPattern(filter.q));
  const result = checkedPage(
    await query
      .order("label")
      .order("id")
      .range((filter.targetPage - 1) * 25, filter.targetPage * 25 - 1),
    filter.targetPage,
    (row) => row.id,
  );
  return {
    ...result,
    items: result.items.map((row) => ({ id: row.id, label: row.label, type: row.entity_type })),
  };
}
export async function readCompatibilityHistory(
  client: ConsoleClient,
  variantId: string,
  rootId: string,
  page: number,
) {
  await authorize(client);
  uuid(variantId);
  uuid(rootId);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) throw new ConsoleInputError();
  const result = await client
    .from("compatibility_revisions")
    .select(
      "relationship_id,sequence,review_state,reason,created_at,compatibility_revision_heads!inner(subject_entity_id,compatibility_entities!compatibility_revision_heads_subject_entity_id_fkey!inner(product_variant_id)),compatibility_relationships!compatibility_revisions_relationship_id_fkey(role,verification_status),verification_events(decision,reason,created_at)",
      { count: "exact" },
    )
    .eq("root_relationship_id", rootId)
    .eq("compatibility_revision_heads.compatibility_entities.product_variant_id", variantId)
    .order("sequence", { ascending: false })
    .order("relationship_id")
    .range((page - 1) * 25, page * 25 - 1);
  const checked = checkedPage(result, page, (row) => row.relationship_id);
  return {
    ...checked,
    rootId,
    items: checked.items.map((row) => {
      if (!row.compatibility_relationships) throw new ConsoleReadError();
      return {
        id: row.relationship_id,
        sequence: row.sequence,
        state: row.review_state,
        reason: row.reason,
        createdAt: row.created_at,
        role: row.compatibility_relationships.role,
        status: row.compatibility_relationships.verification_status,
        decision: row.verification_events?.decision ?? null,
        decisionReason: row.verification_events?.reason ?? null,
      };
    }),
  };
}
export type CompatibilityTargets = Awaited<ReturnType<typeof readCompatibilityTargets>>;
export type CompatibilityHistory = Awaited<ReturnType<typeof readCompatibilityHistory>>;
