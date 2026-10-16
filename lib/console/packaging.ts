import type { ConsoleClient } from "./client.ts";
import { checkConsoleAccess } from "./access.ts";
import { ConsoleReadError, uuid } from "./catalog.ts";
import { readAllConsoleRows } from "./read-pages.ts";
import { consolePackagingEnabled } from "./working-config.ts";
import {
  packagingSourceClasses,
  validPackagingCopy,
  samePackaging,
  type PackagingCopy,
  type PackagingApprovedStatus,
} from "../domain/catalog/packaging.ts";

export type PackagingSource = {
  id: string;
  copy: PackagingCopy;
  originalId: string | null;
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
export type PackagingFact = {
  id: string;
  copy: PackagingCopy;
  revision: number;
  state: string;
  status: string;
  digest: string;
  reason: string;
  sources: string[];
  fresh: boolean;
  valid: boolean;
};
export type PackagingScope = {
  id: string;
  slot: number;
  originalId: string | null;
  revision: number;
  latest: PackagingFact;
  current: PackagingFact | null;
  conflicts: string[];
};
export type PackagingData = {
  variantId: string;
  sku: string;
  canSource: boolean;
  canPropose: boolean;
  canSubmit: boolean;
  canReview: boolean;
  sources: PackagingSource[];
  scopes: PackagingScope[];
  originals: {
    id: string;
    copy: PackagingCopy;
    status: string;
    level: string | null;
    moq: string;
    leadTime: string;
  }[];
  readiness: { count: number; unknown: number; unresolved: number; conflicts: number };
};
export type PackagingHistory = {
  page: number;
  pageSize: number;
  total: number;
  items: {
    id: string;
    revision: number;
    copy: PackagingCopy;
    state: string;
    status: string;
    reason: string;
    createdAt: string;
    decision: string | null;
    reviewReason: string | null;
    resolution: string | null;
    approvedStatus: PackagingApprovedStatus | null;
  }[];
};
function ensure(condition: unknown): asserts condition {
  if (!condition) throw new ConsoleReadError();
}
function required<T>(value: T | null | undefined): T {
  ensure(value !== null && value !== undefined);
  return value;
}
function physical(row: {
  package_description: string | null;
  quantity: number | null;
  quantity_unit: string | null;
}): PackagingCopy {
  const copy = {
    package_description: required(row.package_description),
    quantity: row.quantity,
    quantity_unit: row.quantity_unit,
  };
  ensure(validPackagingCopy(copy));
  return copy;
}
const statuses = [
  "CONFIRMED",
  "OEM_REFERENCE",
  "STANDARD_REFERENCE",
  "NEEDS_FACTORY_CONFIRMATION",
  "DATA_CONFLICT",
];
const reviewStates = ["proposed", "pending", "approved", "rejected", "superseded"];
const factColumns =
  "id,head_id,sequence,package_description,quantity,quantity_unit,review_state,verification_status,proposal_digest,reason,created_at" as const;
async function authorize(client: ConsoleClient, env: Record<string, string | undefined>) {
  ensure(consolePackagingEnabled(env));
  const access = await checkConsoleAccess(client);
  ensure(access.status === "authorized");
  return access;
}
function states(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("pi_packaging_revision_states")
        .select("*", { count: "exact" })
        .eq("product_variant_id", id)
        .order("head_id")
        .range(start, end),
    (row) => required(row.head_id),
    100,
  );
}
function sourceRows(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("pi_packaging_source_states")
        .select("*", { count: "exact" })
        .eq("product_variant_id", id)
        .order("evidence_source_id")
        .range(start, end),
    (row) => required(row.evidence_source_id),
  );
}
function effectiveRows(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("pi_effective_packaging_records")
        .select("*", { count: "exact" })
        .eq("product_variant_id", id)
        .order("packaging_id")
        .range(start, end),
    (row) => required(row.packaging_id),
  );
}
function originalRows(client: ConsoleClient, id: string) {
  return readAllConsoleRows(
    (start, end) =>
      client
        .from("packaging_records")
        .select(
          "id,package_description,quantity,quantity_unit,verification_status,source_level,moq_note,lead_time_note",
          { count: "exact" },
        )
        .eq("product_variant_id", id)
        .order("id")
        .range(start, end),
    (row) => row.id,
  );
}
function readinessRow(client: ConsoleClient, id: string) {
  return client.from("pi_packaging_readiness").select("*").eq("product_variant_id", id).single();
}
export async function readPackagingWorkbench(
  client: ConsoleClient,
  input: string,
  env: Record<string, string | undefined> = process.env,
): Promise<PackagingData | null> {
  const access = await authorize(client, env),
    id = uuid(input).toLowerCase();
  const variant = await client.from("product_variants").select("id,sku").eq("id", id).maybeSingle();
  ensure(!variant.error);
  if (!variant.data) return null;
  ensure(variant.data.id === id && typeof variant.data.sku === "string");
  const heads = await states(client, id),
    effective = await effectiveRows(client, id),
    sources = await sourceRows(client, id),
    originals = await originalRows(client, id);
  const readiness = await readinessRow(client, id);
  ensure(!readiness.error && readiness.data?.product_variant_id === id);
  const metrics = readiness.data;
  for (const value of [
    metrics.packaging_count,
    metrics.missing_packaging_quantity_count,
    metrics.unresolved_packaging_count,
    metrics.packaging_conflict_count,
  ])
    ensure(Number.isSafeInteger(value) && value! >= 0);
  ensure(
    metrics.packaging_count === effective.length &&
      metrics.missing_packaging_quantity_count ===
        effective.filter((row) => row.quantity === null).length &&
      metrics.packaging_conflict_count ===
        effective.filter((row) => row.verification_status === "DATA_CONFLICT").length &&
      metrics.unresolved_packaging_count ===
        effective.filter(
          (row) =>
            row.packaging_origin === "open" ||
            row.verification_status !== "CONFIRMED" ||
            row.quantity === null,
        ).length +
          Number(effective.length === 0),
  );
  const currents = effective.filter((row) => row.packaging_origin === "current");
  ensure(
    currents.length <= 100 && new Set(currents.map((row) => row.head_id)).size === currents.length,
  );
  const currentRows = currents.length
    ? await readAllConsoleRows(
        (start, end) =>
          client
            .from("packaging_revisions")
            .select(factColumns, { count: "exact" })
            .in(
              "id",
              currents.map((row) => required(row.packaging_id)),
            )
            .order("id")
            .range(start, end),
        (row) => row.id,
        100,
      )
    : [];
  ensure(currentRows.length === currents.length);
  const ids = [
    ...new Set([
      ...heads.map((row) => required(row.revision_id)),
      ...currentRows.map((row) => row.id),
    ]),
  ].sort();
  const evidence: { revision_id: string; evidence_source_id: string }[] = [];
  for (let offset = 0; offset < ids.length; offset += 100)
    evidence.push(
      ...(await readAllConsoleRows(
        (start, end) =>
          client
            .from("packaging_revision_evidence")
            .select("revision_id,evidence_source_id", { count: "exact" })
            .in("revision_id", ids.slice(offset, offset + 100))
            .order("revision_id")
            .order("evidence_source_id")
            .range(start, end),
        (row) => `${row.revision_id}:${row.evidence_source_id}`,
      )),
    );
  ensure(
    new Set(evidence.map((row) => `${row.revision_id}:${row.evidence_source_id}`)).size ===
      evidence.length,
  );
  const mappedSources = sources.map((source) => {
    ensure(
      source.product_variant_id === id &&
        typeof source.source_current === "boolean" &&
        Object.hasOwn(packagingSourceClasses, required(source.source_kind)),
    );
    const classification =
      packagingSourceClasses[required(source.source_kind) as keyof typeof packagingSourceClasses];
    ensure(
      source.source_level === classification.level &&
        (classification.bases as readonly string[]).includes(required(source.evidence_basis)) &&
        ["supports", "contradicts", "reference_only"].includes(required(source.assertion)) &&
        (source.original_packaging_id === null ||
          originals.some((row) => row.id === source.original_packaging_id)),
    );
    return {
      id: required(source.evidence_source_id),
      copy: physical(source),
      originalId: source.original_packaging_id,
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
  ensure(
    effective.every(
      (row) =>
        row.product_variant_id === id &&
        row.publication_ready === false &&
        typeof row.review_valid === "boolean" &&
        statuses.includes(required(row.verification_status)) &&
        ["legacy", "open", "current"].includes(required(row.packaging_origin)) &&
        (row.packaging_origin === "legacy"
          ? originals.some(
              (original) =>
                original.id === row.packaging_id &&
                samePackaging(physical(original), physical(row)),
            )
          : heads.some(
              (head) =>
                head.head_id === row.head_id &&
                head.slot === row.slot &&
                head.original_packaging_id === row.original_packaging_id,
            )),
    ),
  );
  const scopes: PackagingScope[] = heads.map((head) => {
    ensure(
      head.product_variant_id === id &&
        Number.isSafeInteger(head.revision) &&
        head.revision! > 0 &&
        Number.isSafeInteger(head.slot) &&
        head.slot! >= 0 &&
        head.slot! <= 99 &&
        typeof head.proposal_fresh === "boolean" &&
        reviewStates.includes(required(head.review_state)) &&
        statuses.includes(required(head.verification_status)) &&
        /^[a-f0-9]{64}$/.test(required(head.proposal_digest)) &&
        (head.original_packaging_id === null ||
          originals.some((row) => row.id === head.original_packaging_id)),
    );
    const linked = (revisionId: string, copy: PackagingCopy) => {
      const selected = evidence
        .filter((row) => row.revision_id === revisionId)
        .map((row) => row.evidence_source_id);
      ensure(
        selected.length <= 20 &&
          selected.every((sourceId) =>
            mappedSources.some(
              (source) =>
                source.id === sourceId &&
                source.originalId === head.original_packaging_id &&
                samePackaging(source.copy, copy),
            ),
          ),
      );
      return selected;
    };
    const current = currents.find((row) => row.head_id === head.head_id),
      row = currentRows.find((row) => row.id === current?.packaging_id);
    if (current)
      ensure(
        row &&
          row.head_id === head.head_id &&
          row.review_state === "approved" &&
          row.sequence > 0 &&
          row.sequence <= head.revision! &&
          samePackaging(physical(row), physical(current)) &&
          (current.review_valid
            ? ["CONFIRMED", "OEM_REFERENCE"].includes(required(current.verification_status))
            : current.verification_status === "DATA_CONFLICT"),
      );
    const open = effective.filter(
      (row) => row.packaging_origin === "open" && row.head_id === head.head_id,
    );
    ensure(
      ["proposed", "pending"].includes(required(head.review_state))
        ? open.length === 1 &&
            open[0].packaging_id === head.revision_id &&
            samePackaging(physical(open[0]), physical(head)) &&
            open[0].verification_status === head.verification_status &&
            !open[0].review_valid
        : open.length === 0,
    );
    ensure(
      Array.isArray(head.conflict_source_ids) &&
        new Set(head.conflict_source_ids).size === head.conflict_source_ids.length &&
        head.conflict_source_ids.every((sourceId) =>
          mappedSources.some(
            (source) =>
              source.id === sourceId &&
              source.assertion === "contradicts" &&
              source.originalId === head.original_packaging_id,
          ),
        ),
    );
    return {
      id: required(head.head_id),
      slot: required(head.slot),
      originalId: head.original_packaging_id,
      revision: required(head.revision),
      conflicts: head.conflict_source_ids,
      latest: {
        id: required(head.revision_id),
        copy: physical(head),
        revision: required(head.revision),
        state: required(head.review_state),
        status: required(
          current?.packaging_id === head.revision_id
            ? current.verification_status
            : head.verification_status,
        ),
        digest: required(head.proposal_digest),
        reason: required(head.reason),
        sources: linked(required(head.revision_id), physical(head)),
        fresh: head.proposal_fresh,
        valid: current?.packaging_id === head.revision_id && current.review_valid === true,
      },
      current:
        row && current
          ? {
              id: row.id,
              copy: physical(row),
              revision: row.sequence,
              state: row.review_state,
              status: required(current.verification_status),
              digest: row.proposal_digest,
              reason: row.reason,
              sources: linked(row.id, physical(row)),
              fresh: current.review_valid === true,
              valid: current.review_valid === true,
            }
          : null,
    };
  });
  ensure(
    evidence.every((link) => ids.includes(link.revision_id)) &&
      currents.every((row) => scopes.some((scope) => scope.id === row.head_id)),
  );
  ensure(
    JSON.stringify(await states(client, id)) === JSON.stringify(heads) &&
      JSON.stringify(await effectiveRows(client, id)) === JSON.stringify(effective) &&
      JSON.stringify(await sourceRows(client, id)) === JSON.stringify(sources) &&
      JSON.stringify(await originalRows(client, id)) === JSON.stringify(originals),
  );
  const currentReadiness = await readinessRow(client, id);
  ensure(
    !currentReadiness.error && JSON.stringify(currentReadiness.data) === JSON.stringify(metrics),
  );
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
      copy: physical(row),
      status: row.verification_status,
      level: row.source_level,
      moq: row.moq_note,
      leadTime: row.lead_time_note,
    })),
    readiness: {
      count: required(metrics.packaging_count),
      unknown: required(metrics.missing_packaging_quantity_count),
      unresolved: required(metrics.unresolved_packaging_count),
      conflicts: required(metrics.packaging_conflict_count),
    },
  };
}
export async function readPackagingHistory(
  client: ConsoleClient,
  variantId: string,
  headId: string,
  page: number,
  env: Record<string, string | undefined> = process.env,
): Promise<PackagingHistory> {
  const access = await authorize(client, env),
    id = uuid(headId).toLowerCase();
  ensure(Number.isSafeInteger(page) && page > 0 && page <= 10000);
  const head = await client
    .from("packaging_revision_heads")
    .select("id,revision")
    .eq("id", id)
    .eq("product_variant_id", uuid(variantId).toLowerCase())
    .maybeSingle();
  ensure(!head.error && head.data?.id === id);
  const size = 25,
    rows = await client
      .from("packaging_revisions")
      .select(factColumns, { count: "exact" })
      .eq("head_id", id)
      .order("sequence", { ascending: false })
      .range((page - 1) * size, page * size - 1);
  ensure(
    !rows.error &&
      rows.data &&
      Number.isSafeInteger(rows.count) &&
      rows.count === head.data.revision &&
      rows.data.length === Math.min(size, Math.max(0, rows.count! - (page - 1) * size)) &&
      new Set(rows.data.map((row) => row.id)).size === rows.data.length,
  );
  const decisions = rows.data.length
    ? await readAllConsoleRows(
        (start, end) =>
          client
            .from("packaging_revision_decisions")
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
  const currentHead = await client
    .from("packaging_revision_heads")
    .select("id,revision")
    .eq("id", id)
    .eq("product_variant_id", uuid(variantId).toLowerCase())
    .maybeSingle();
  ensure(!currentHead.error && JSON.stringify(currentHead.data) === JSON.stringify(head.data));
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
          row.sequence === head.data!.revision - (page - 1) * size - index &&
          reviewStates.includes(row.review_state),
      );
      const decision = decisions.find((item) => item.revision_id === row.id);
      ensure(!["approved", "rejected"].includes(row.review_state) || decision);
      if (decision)
        ensure(
          decision.event &&
            typeof decision.event.reason === "string" &&
            ["APPROVE", "EDIT", "REJECT"].includes(decision.decision) &&
            (decision.decision === "APPROVE"
              ? row.review_state === "approved" &&
                ["CONFIRMED", "OEM_REFERENCE"].includes(required(decision.approved_status))
              : row.review_state === (decision.decision === "EDIT" ? "superseded" : "rejected") &&
                decision.approved_status === null),
        );
      return {
        id: row.id,
        revision: row.sequence,
        copy: physical(row),
        state: row.review_state,
        status: row.verification_status,
        reason: row.reason,
        createdAt: row.created_at,
        decision: decision?.decision ?? null,
        reviewReason: decision?.event?.reason ?? null,
        resolution: decision?.conflict_resolution ?? null,
        approvedStatus: (decision?.approved_status ?? null) as PackagingApprovedStatus | null,
      };
    }),
  };
}
