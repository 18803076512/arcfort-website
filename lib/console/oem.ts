import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { ConsoleReadError, uuid } from "./catalog.ts";
import { readAllConsoleRows } from "./read-pages.ts";
import { consoleOemEnabled } from "./working-config.ts";
import { oemSourceClasses, type OemApprovedStatus } from "../domain/catalog/oem.ts";

export type OemSource = {
  id: string;
  manufacturer: string;
  reference: string;
  kind: string;
  level: string;
  basis: string;
  assertion: string;
  title: string;
  document: string;
  location: string;
  version: string;
  date: string;
  owner: string;
  current: boolean;
};
export type OemFact = {
  id: string;
  manufacturer: string;
  reference: string;
  revision: number;
  state: string;
  status: string;
  digest: string;
  reason: string;
  sources: string[];
  fresh: boolean;
  valid: boolean;
};
export type OemScope = {
  id: string;
  slot: number;
  originalId: string | null;
  revision: number;
  latest: OemFact;
  current: OemFact | null;
};
export type OemData = {
  variantId: string;
  sku: string;
  canSource: boolean;
  canPropose: boolean;
  canSubmit: boolean;
  canReview: boolean;
  sources: OemSource[];
  scopes: OemScope[];
  originals: {
    id: string;
    manufacturer: string | null;
    reference: string;
    status: string;
    level: string;
  }[];
};
export type OemHistory = {
  page: number;
  pageSize: number;
  total: number;
  items: {
    id: string;
    revision: number;
    manufacturer: string;
    reference: string;
    state: string;
    status: string;
    reason: string;
    createdAt: string;
    decision: string | null;
    reviewReason: string | null;
    resolution: string | null;
    approvedStatus: OemApprovedStatus | null;
  }[];
};
function ensure(condition: unknown): asserts condition {
  if (!condition) throw new ConsoleReadError();
}
function required<T>(value: T | null | undefined): T {
  ensure(value !== null && value !== undefined);
  return value;
}
async function authorize(client: ConsoleClient, env: Record<string, string | undefined>) {
  ensure(consoleOemEnabled(env));
  const access = await checkConsoleAccess(client);
  ensure(access.status === "authorized");
  return access;
}
function states(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("pi_oem_revision_states")
        .select("*", { count: "exact" })
        .eq("product_variant_id", id)
        .order("head_id")
        .range(start, end),
    (row) => required(row.head_id),
    100,
  );
}
const factColumns =
  "id,head_id,sequence,manufacturer_name,reference_number,review_state,verification_status,proposal_digest,reason,created_at" as const;
const statuses = [
  "CONFIRMED",
  "OEM_REFERENCE",
  "STANDARD_REFERENCE",
  "NEEDS_FACTORY_CONFIRMATION",
  "DATA_CONFLICT",
];
const reviewStates = ["proposed", "pending", "approved", "rejected", "superseded"];
function designation(manufacturer: unknown, reference: unknown) {
  ensure(
    typeof manufacturer === "string" &&
      manufacturer.length > 0 &&
      manufacturer.length <= 120 &&
      manufacturer.trim() === manufacturer,
  );
  ensure(
    typeof reference === "string" &&
      reference.length > 0 &&
      reference.length <= 100 &&
      reference.trim() === reference,
  );
  ensure(!/[\u0000-\u001f\u007f]/.test(manufacturer + reference));
}
function effectiveRows(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("pi_effective_oem_references")
        .select("*", { count: "exact" })
        .eq("product_variant_id", id)
        .order("reference_id")
        .range(start, end),
    (row) => required(row.reference_id),
  );
}
function sourceRows(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("pi_oem_source_states")
        .select("*", { count: "exact" })
        .eq("product_variant_id", id)
        .order("evidence_source_id")
        .range(start, end),
    (row) => required(row.evidence_source_id),
  );
}
async function links(client: ConsoleClient, ids: string[]) {
  const result: { revision_id: string; evidence_source_id: string }[] = [];
  const unique = [...new Set(ids)].sort();
  for (let offset = 0; offset < unique.length; offset += 100)
    result.push(
      ...(await readAllConsoleRows(
        (start, end) =>
          client
            .from("oem_revision_evidence")
            .select("revision_id,evidence_source_id", { count: "exact" })
            .in("revision_id", unique.slice(offset, offset + 100))
            .order("revision_id")
            .order("evidence_source_id")
            .range(start, end),
        (row) => `${row.revision_id}:${row.evidence_source_id}`,
      )),
    );
  ensure(
    new Set(result.map((row) => `${row.revision_id}:${row.evidence_source_id}`)).size ===
      result.length,
  );
  return result;
}
export async function readOemWorkbench(
  client: ConsoleClient,
  input: string,
  env: Record<string, string | undefined> = process.env,
): Promise<OemData | null> {
  const access = await authorize(client, env);
  const id = uuid(input).toLowerCase();
  const variant = await client.from("product_variants").select("id,sku").eq("id", id).maybeSingle();
  ensure(!variant.error);
  if (!variant.data) return null;
  ensure(variant.data.id === id && typeof variant.data.sku === "string");
  const heads = await states(client, id);
  const effective = await effectiveRows(client, id);
  const sources = await sourceRows(client, id);
  const originals = await readAllConsoleRows(
    (start, end) =>
      client
        .from("oem_references")
        .select("id,manufacturer_name,reference_number,verification_status,source_level", {
          count: "exact",
        })
        .eq("product_variant_id", id)
        .order("id")
        .range(start, end),
    (row) => row.id,
  );
  const currents = effective.filter((row) => row.reference_origin === "current");
  ensure(
    effective.every(
      (row) =>
        row.product_variant_id === id &&
        row.publication_ready === false &&
        typeof row.review_valid === "boolean" &&
        statuses.includes(required(row.verification_status)) &&
        ["legacy", "open", "current"].includes(required(row.reference_origin)) &&
        (row.reference_origin === "legacy"
          ? originals.some((original) => original.id === row.reference_id)
          : heads.some((head) => head.head_id === row.head_id && head.slot === row.slot)),
    ),
  );
  ensure(
    currents.length <= 100 && new Set(currents.map((row) => row.head_id)).size === currents.length,
  );
  const currentRows = currents.length
    ? await readAllConsoleRows(
        (start, end) =>
          client
            .from("oem_revisions")
            .select(factColumns, { count: "exact" })
            .in(
              "id",
              currents.map((row) => required(row.reference_id)),
            )
            .order("id")
            .range(start, end),
        (row) => row.id,
        100,
      )
    : [];
  ensure(currentRows.length === currents.length);
  const evidence = await links(client, [
    ...heads.map((row) => required(row.revision_id)),
    ...currentRows.map((row) => row.id),
  ]);
  const sourceIds = new Set(sources.map((row) => row.evidence_source_id));
  ensure(
    evidence.every((link) => {
      const fact =
        heads.find((head) => head.revision_id === link.revision_id) ??
        currentRows.find((row) => row.id === link.revision_id);
      const source = sources.find((row) => row.evidence_source_id === link.evidence_source_id);
      return (
        sourceIds.has(link.evidence_source_id) &&
        fact &&
        source &&
        source.manufacturer_name === fact.manufacturer_name &&
        source.reference_number === fact.reference_number
      );
    }),
  );
  const scopes: OemScope[] = heads.map((head) => {
    ensure(
      head.product_variant_id === id &&
        Number.isSafeInteger(head.revision) &&
        head.revision! > 0 &&
        Number.isSafeInteger(head.slot) &&
        head.slot! >= 0 &&
        head.slot! <= 99 &&
        typeof head.proposal_fresh === "boolean",
    );
    designation(head.manufacturer_name, head.reference_number);
    ensure(
      reviewStates.includes(required(head.review_state)) &&
        statuses.includes(required(head.verification_status)) &&
        /^[a-f0-9]{64}$/.test(required(head.proposal_digest)) &&
        (head.source_oem_reference_id === null ||
          originals.some((row) => row.id === head.source_oem_reference_id)),
    );
    const current = currents.find((row) => row.head_id === head.head_id);
    const row = currentRows.find((row) => row.id === current?.reference_id);
    if (current)
      ensure(
        row &&
          row.head_id === head.head_id &&
          current.publication_ready === false &&
          typeof current.review_valid === "boolean" &&
          row.review_state === "approved",
      );
    if (current && row) {
      designation(row.manufacturer_name, row.reference_number);
      ensure(
        current.manufacturer_name === row.manufacturer_name &&
          current.reference_number === row.reference_number &&
          current.source_oem_reference_id === head.source_oem_reference_id &&
          row.sequence > 0 &&
          row.sequence <= head.revision! &&
          (current.review_valid === true
            ? ["CONFIRMED", "OEM_REFERENCE"].includes(required(current.verification_status))
            : current.verification_status === "DATA_CONFLICT"),
      );
    }
    const open = effective.find(
      (row) => row.reference_origin === "open" && row.head_id === head.head_id,
    );
    ensure(
      ["proposed", "pending"].includes(required(head.review_state))
        ? open?.reference_id === head.revision_id &&
            open.manufacturer_name === head.manufacturer_name &&
            open.reference_number === head.reference_number &&
            open.verification_status === head.verification_status &&
            !open.review_valid
        : !open,
    );
    const ids = (candidate: string) =>
      evidence.filter((row) => row.revision_id === candidate).map((row) => row.evidence_source_id);
    return {
      id: required(head.head_id),
      slot: required(head.slot),
      originalId: head.source_oem_reference_id,
      revision: required(head.revision),
      latest: {
        id: required(head.revision_id),
        manufacturer: required(head.manufacturer_name),
        reference: required(head.reference_number),
        revision: required(head.revision),
        state: required(head.review_state),
        status: required(
          current?.reference_id === head.revision_id
            ? current.verification_status
            : head.verification_status,
        ),
        digest: required(head.proposal_digest),
        reason: required(head.reason),
        sources: ids(required(head.revision_id)),
        fresh: head.proposal_fresh,
        valid: current?.reference_id === head.revision_id && current.review_valid === true,
      },
      current:
        row && current
          ? {
              id: row.id,
              manufacturer: row.manufacturer_name,
              reference: row.reference_number,
              revision: row.sequence,
              state: row.review_state,
              status: required(current.verification_status),
              digest: row.proposal_digest,
              reason: row.reason,
              sources: ids(row.id),
              fresh: current.review_valid === true,
              valid: current.review_valid === true,
            }
          : null,
    };
  });
  ensure(currents.every((current) => scopes.some((scope) => scope.id === current.head_id)));
  const mappedSources: OemSource[] = sources.map((source) => {
    ensure(
      source.product_variant_id === id &&
        typeof source.source_current === "boolean" &&
        Object.hasOwn(oemSourceClasses, required(source.source_kind)),
    );
    designation(source.manufacturer_name, source.reference_number);
    const classification =
      oemSourceClasses[required(source.source_kind) as keyof typeof oemSourceClasses];
    ensure(
      source.source_level === classification.level &&
        (classification.bases as readonly string[]).includes(required(source.evidence_basis)) &&
        ["supports", "contradicts", "reference_only"].includes(required(source.assertion)),
    );
    return {
      id: required(source.evidence_source_id),
      manufacturer: required(source.manufacturer_name),
      reference: required(source.reference_number),
      kind: required(source.source_kind),
      level: required(source.source_level),
      basis: required(source.evidence_basis),
      assertion: required(source.assertion),
      title: required(source.title),
      document: required(source.source_reference),
      location: required(source.source_location),
      version: required(source.revision_label),
      date: required(source.evidence_date),
      owner: required(source.owner_name),
      current: source.source_current,
    };
  });
  ensure(JSON.stringify(await states(client, id)) === JSON.stringify(heads));
  ensure(JSON.stringify(await effectiveRows(client, id)) === JSON.stringify(effective));
  ensure(JSON.stringify(await sourceRows(client, id)) === JSON.stringify(sources));
  const currentAccess = await authorize(client, env);
  ensure(
    access.userId === currentAccess.userId &&
      [...access.roles].sort().join() === [...currentAccess.roles].sort().join(),
  );
  const has = (roles: string[]) => access.roles.some((role) => roles.includes(role));
  return {
    variantId: id,
    sku: variant.data.sku,
    canSource: has(["owner", "editor", "reviewer"]),
    canPropose: has(["owner", "editor"]),
    canSubmit: has(["owner", "editor", "reviewer"]),
    canReview: has(["owner", "reviewer"]),
    sources: mappedSources,
    scopes,
    originals: originals.map((row) => ({
      id: row.id,
      manufacturer: row.manufacturer_name,
      reference: row.reference_number,
      status: row.verification_status,
      level: row.source_level,
    })),
  };
}
export async function readOemHistory(
  client: ConsoleClient,
  variantId: string,
  headId: string,
  page: number,
  env: Record<string, string | undefined> = process.env,
): Promise<OemHistory> {
  const access = await authorize(client, env);
  const id = uuid(headId).toLowerCase();
  ensure(Number.isSafeInteger(page) && page > 0 && page <= 10000);
  const head = await client
    .from("oem_revision_heads")
    .select("id")
    .eq("id", id)
    .eq("product_variant_id", uuid(variantId).toLowerCase())
    .maybeSingle();
  ensure(!head.error && head.data?.id === id);
  const size = 25;
  const rows = await client
    .from("oem_revisions")
    .select(factColumns, { count: "exact" })
    .eq("head_id", id)
    .order("sequence", { ascending: false })
    .range((page - 1) * size, page * size - 1);
  ensure(
    !rows.error &&
      rows.data &&
      Number.isSafeInteger(rows.count) &&
      rows.count! >= 0 &&
      rows.data.length === Math.min(size, Math.max(0, rows.count! - (page - 1) * size)) &&
      new Set(rows.data.map((row) => row.id)).size === rows.data.length,
  );
  const decisions = rows.data.length
    ? await readAllConsoleRows(
        (start, end) =>
          client
            .from("oem_revision_decisions")
            .select(
              "revision_id,decision,approved_status,conflict_resolution,event:verification_events(reason,created_at)",
              { count: "exact" },
            )
            .in(
              "revision_id",
              rows.data!.map((row) => row.id),
            )
            .order("revision_id")
            .range(start, end),
        (row) => row.revision_id,
        size,
      )
    : [];
  const currentAccess = await authorize(client, env);
  ensure(
    access.userId === currentAccess.userId &&
      [...access.roles].sort().join() === [...currentAccess.roles].sort().join(),
  );
  ensure(decisions.every((decision) => rows.data!.some((row) => row.id === decision.revision_id)));
  return {
    page,
    pageSize: size,
    total: rows.count!,
    items: rows.data.map((row, index) => {
      ensure(
        row.head_id === id &&
          Number.isSafeInteger(row.sequence) &&
          row.sequence > 0 &&
          (index === 0 || rows.data![index - 1].sequence > row.sequence) &&
          reviewStates.includes(row.review_state),
      );
      designation(row.manufacturer_name, row.reference_number);
      const decision = decisions.find((item) => item.revision_id === row.id);
      ensure(!["approved", "rejected"].includes(row.review_state) || decision);
      if (decision)
        ensure(
          decision.event &&
            typeof decision.event.reason === "string" &&
            ["APPROVE", "EDIT", "REJECT"].includes(decision.decision) &&
            (decision.decision === "APPROVE"
              ? row.review_state === "approved" && decision.approved_status !== null
              : row.review_state === (decision.decision === "EDIT" ? "superseded" : "rejected") &&
                decision.approved_status === null) &&
            (decision.approved_status === null ||
              ["CONFIRMED", "OEM_REFERENCE"].includes(decision.approved_status)),
        );
      return {
        id: row.id,
        revision: row.sequence,
        manufacturer: row.manufacturer_name,
        reference: row.reference_number,
        state: row.review_state,
        status: row.verification_status,
        reason: row.reason,
        createdAt: row.created_at,
        decision: decision?.decision ?? null,
        reviewReason: decision?.event?.reason ?? null,
        resolution: decision?.conflict_resolution ?? null,
        approvedStatus: (decision?.approved_status ?? null) as OemApprovedStatus | null,
      };
    }),
  };
}
