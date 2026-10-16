import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { ConsoleReadError, uuid } from "./catalog.ts";
import { consoleWorkingEnabled } from "./working-config.ts";
import type { Database } from "../supabase/database.types.ts";

export type ProductDraft =
  Database["public"]["Functions"]["pi_read_product_draft"]["Returns"][number];
export type WorkingStatus = { adopted: boolean; can_edit: boolean; can_review: boolean };
export const readOnlyWorkingStatus: WorkingStatus = {
  adopted: false,
  can_edit: false,
  can_review: false,
};

async function authorize(client: ConsoleClient) {
  if (!consoleWorkingEnabled() || (await checkConsoleAccess(client)).status !== "authorized")
    throw new ConsoleReadError();
}
export async function readWorkingStatus(client: ConsoleClient): Promise<WorkingStatus> {
  if (!consoleWorkingEnabled()) return readOnlyWorkingStatus;
  await authorize(client);
  const result = await client.rpc("pi_working_status");
  if (result.error || result.data?.length !== 1) throw new ConsoleReadError();
  return result.data[0];
}
export async function readWorkingStates(client: ConsoleClient, ids: string[]) {
  if (!consoleWorkingEnabled()) return [];
  await authorize(client);
  ids.forEach(uuid);
  const result = await client.rpc("pi_product_working_states", { variant_ids: ids });
  if (result.error || !result.data) throw new ConsoleReadError();
  return result.data;
}
export async function readProductDraft(client: ConsoleClient, id: string) {
  await authorize(client);
  uuid(id);
  const result = await client.rpc("pi_read_product_draft", { variant_uuid: id });
  if (result.error || !result.data) throw new ConsoleReadError();
  return result.data[0] ?? null;
}
export async function readProductHistory(client: ConsoleClient, id: string, page: number) {
  await authorize(client);
  uuid(id);
  const result = await client.rpc("pi_read_product_draft_history", {
    variant_uuid: id,
    page_number: page,
  });
  if (result.error || !result.data) throw new ConsoleReadError();
  return { items: result.data, total: result.data[0]?.total_count ?? 0, page, pageSize: 25 };
}

export type WorkingEvidence = {
  id: string;
  role: string;
  title: string;
  reference: string;
  level: string;
  version?: string;
  location?: string;
  value?: string;
  unit?: string;
};
export type WorkingFact = {
  id: string;
  fieldId: string;
  scope: string;
  value: string;
  unit: string;
  status: string;
  evidence: WorkingEvidence[];
};
export type WorkingScope = {
  id: string;
  fieldId: string;
  label: string;
  scope: string;
  revision: number;
  original: WorkingFact | null;
  current: WorkingFact | null;
  candidate: (WorkingFact & { state: string; digest: string }) | null;
};
export type WorkingSource = {
  id: string;
  fieldId: string;
  scope: string;
  title: string;
  reference: string;
  level: string;
  value: string;
  unit: string;
  location: string;
  version: string;
};
export type TechnicalWorkbenchData = {
  variantId: string;
  sku: string;
  canEdit: boolean;
  canReview: boolean;
  fields: { id: string; label: string; critical: boolean }[];
  scopes: WorkingScope[];
  sources: WorkingSource[];
};

const factColumns =
  "id,external_key,field_definition_id,variant_label,value_text,unit,verification_status,technical_value_evidence(evidence_role,evidence_sources(id,title,source_reference,source_level,technical_source_bindings(revision_label,source_location,asserted_value,asserted_unit)))" as const;
export async function readTechnicalWorkbench(
  client: ConsoleClient,
  id: string,
): Promise<TechnicalWorkbenchData | null> {
  await authorize(client);
  uuid(id);
  const status = await readWorkingStatus(client);
  const states = await readWorkingStates(client, [id]);
  if (!states.length) return null;
  const identity = await client
    .from("product_variants")
    .select("sku,products!inner(product_type)")
    .eq("id", id)
    .maybeSingle();
  if (identity.error || !identity.data) throw new ConsoleReadError();
  const productType = identity.data.products.product_type;
  const fields = await client
    .from("technical_field_definitions")
    .select("id,label,is_critical,applies_to")
    .order("label")
    .limit(501);
  const heads = await client
    .from("technical_revision_heads")
    .select("root_value_id,current_value_id,field_definition_id,scope_label,revision")
    .eq("product_variant_id", id)
    .limit(201);
  const effective = await client
    .from("pi_effective_technical_values")
    .select(factColumns)
    .eq("product_variant_id", id)
    .limit(401);
  const pending = await client
    .from("technical_revisions")
    .select(
      "value_id,root_value_id,review_state,proposal_digest,technical_revision_heads!inner(product_variant_id)",
    )
    .eq("technical_revision_heads.product_variant_id", id)
    .in("review_state", ["proposed", "pending"])
    .limit(201);
  const sources = await client
    .from("technical_source_bindings")
    .select(
      "evidence_source_id,field_definition_id,scope_label,asserted_value,asserted_unit,source_location,revision_label,evidence_sources!inner(title,source_reference,source_level)",
    )
    .eq("product_variant_id", id)
    .order("created_at", { ascending: false })
    .limit(201);
  if (
    fields.error ||
    heads.error ||
    effective.error ||
    pending.error ||
    sources.error ||
    !fields.data ||
    !heads.data ||
    !effective.data ||
    !pending.data ||
    !sources.data ||
    fields.data.length > 500 ||
    heads.data.length > 200 ||
    effective.data.length > 400 ||
    pending.data.length > 200 ||
    sources.data.length > 200
  )
    throw new ConsoleReadError();
  const originals = heads.data.length
    ? await client
        .from("technical_values")
        .select(factColumns)
        .in(
          "id",
          heads.data.map((head) => head.root_value_id),
        )
    : { data: [], error: null };
  if (originals.error || !originals.data) throw new ConsoleReadError();
  const convert = (fact: (typeof effective.data)[number]): WorkingFact => {
    if (
      !fact.id ||
      !fact.field_definition_id ||
      fact.value_text === null ||
      !fact.verification_status
    )
      throw new ConsoleReadError();
    return {
      id: fact.id,
      fieldId: fact.field_definition_id,
      scope: fact.variant_label ?? "",
      value: fact.value_text,
      unit: fact.unit ?? "",
      status: fact.verification_status,
      evidence: fact.technical_value_evidence.flatMap((link) =>
        link.evidence_sources
          ? [
              {
                id: link.evidence_sources.id,
                role: link.evidence_role,
                title: link.evidence_sources.title,
                reference: link.evidence_sources.source_reference,
                level: link.evidence_sources.source_level ?? "Unknown",
                version: link.evidence_sources.technical_source_bindings?.revision_label,
                location: link.evidence_sources.technical_source_bindings?.source_location,
                value: link.evidence_sources.technical_source_bindings?.asserted_value,
                unit: link.evidence_sources.technical_source_bindings?.asserted_unit,
              },
            ]
          : [],
      ),
    };
  };
  const facts = new Map(
    [...effective.data, ...originals.data].map((fact) => {
      const item = convert(fact);
      return [item.id, item] as const;
    }),
  );
  const fieldLabels = new Map(fields.data.map((field) => [field.id, field.label]));
  const scopes: WorkingScope[] = heads.data.map((head) => {
    const candidate = pending.data.find((item) => item.root_value_id === head.root_value_id);
    const fact = candidate ? facts.get(candidate.value_id) : undefined;
    if (candidate && !fact) throw new ConsoleReadError();
    return {
      id: head.root_value_id,
      fieldId: head.field_definition_id,
      label: fieldLabels.get(head.field_definition_id) ?? "Technical field",
      scope: head.scope_label,
      revision: head.revision,
      original: originals.data
        .find((item) => item.id === head.root_value_id)
        ?.external_key.startsWith("working-value:")
        ? null
        : (facts.get(head.root_value_id) ?? null),
      current: head.current_value_id ? (facts.get(head.current_value_id) ?? null) : null,
      candidate:
        candidate && fact
          ? { ...fact, state: candidate.review_state, digest: candidate.proposal_digest }
          : null,
    };
  });
  for (const row of effective.data) {
    const fact = convert(row);
    if (!scopes.some((scope) => scope.fieldId === fact.fieldId && scope.scope === fact.scope))
      scopes.push({
        id: fact.id,
        fieldId: fact.fieldId,
        label: fieldLabels.get(fact.fieldId) ?? "Technical field",
        scope: fact.scope,
        revision: 0,
        original: fact,
        current: fact,
        candidate: null,
      });
  }
  return {
    variantId: id,
    sku: identity.data.sku,
    canEdit: status.can_edit,
    canReview: status.can_review,
    fields: fields.data
      .filter(
        (field) =>
          !field.applies_to.length ||
          field.applies_to.includes("product_variant") ||
          field.applies_to.includes(productType),
      )
      .map((field) => ({ id: field.id, label: field.label, critical: field.is_critical })),
    scopes: scopes.sort((a, b) => a.label.localeCompare(b.label) || a.scope.localeCompare(b.scope)),
    sources: sources.data.map((source) => ({
      id: source.evidence_source_id,
      fieldId: source.field_definition_id,
      scope: source.scope_label,
      value: source.asserted_value,
      unit: source.asserted_unit,
      location: source.source_location,
      version: source.revision_label,
      title: source.evidence_sources.title,
      reference: source.evidence_sources.source_reference,
      level: source.evidence_sources.source_level ?? "Unknown",
    })),
  };
}

export async function readTechnicalHistory(client: ConsoleClient, id: string, page: number) {
  await authorize(client);
  uuid(id);
  const result = await client
    .from("technical_revisions")
    .select(
      "value_id,sequence,review_state,reason,created_at,created_by,technical_revision_heads!inner(product_variant_id,scope_label),technical_values!technical_revisions_value_id_fkey(value_text,unit,verification_status,technical_field_definitions(label),technical_value_evidence(evidence_role,evidence_sources(id,title,source_reference,source_level,technical_source_bindings(revision_label,source_location,asserted_value,asserted_unit)))),verification_events(decision,reason,created_at,actor_id)",
      { count: "exact" },
    )
    .eq("technical_revision_heads.product_variant_id", id)
    .order("created_at", { ascending: false })
    .order("value_id")
    .range((page - 1) * 25, page * 25 - 1);
  if (result.error || !result.data || result.count === null) throw new ConsoleReadError();
  return { items: result.data, total: result.count, page, pageSize: 25 };
}
