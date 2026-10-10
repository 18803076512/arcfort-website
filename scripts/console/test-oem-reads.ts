import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { readOemWorkbench, readOemHistory } from "../../lib/console/oem.ts";
import { ConsoleReadError } from "../../lib/console/catalog.ts";
import { oemId as id, oemEnv as env, oemFixture } from "./oem-fixture.ts";
type Row = Record<string, unknown>;
const seed = oemFixture().data,
  scope = seed.scopes[0];
const fact = (n: number, revision: number, state = "pending") => ({
  id: id(n),
  head_id: id(2),
  sequence: revision,
  manufacturer_name: scope.latest.manufacturer,
  reference_number: scope.latest.reference,
  review_state: state,
  verification_status: "NEEDS_FACTORY_CONFIRMATION",
  proposal_digest: "a".repeat(64),
  reason: "Synthetic reason",
  created_at: "2026-01-01T00:00:00Z",
});
const head = {
  head_id: id(2),
  product_variant_id: id(1),
  slot: 0,
  source_oem_reference_id: id(4),
  revision: 2,
  revision_id: id(3),
  manufacturer_name: scope.latest.manufacturer,
  reference_number: scope.latest.reference,
  review_state: "pending",
  verification_status: "NEEDS_FACTORY_CONFIRMATION",
  proposal_digest: "a".repeat(64),
  submitted_digest: "a".repeat(64),
  proposal_fresh: true,
  reason: "Synthetic reason",
  created_at: "2026-01-01T00:00:00Z",
};
const effective = (n: number, origin: string) => ({
  reference_id: id(n),
  head_id: id(2),
  product_variant_id: id(1),
  slot: 0,
  source_oem_reference_id: id(4),
  manufacturer_name: scope.latest.manufacturer,
  reference_number: scope.latest.reference,
  reference_origin: origin,
  review_state: origin === "current" ? "approved" : "pending",
  verification_status: origin === "current" ? "OEM_REFERENCE" : "NEEDS_FACTORY_CONFIRMATION",
  review_valid: origin === "current",
  publication_ready: false,
});
const sourceRows = seed.sources.map((source) => ({
  evidence_source_id: source.id,
  product_variant_id: id(1),
  manufacturer_name: source.manufacturer,
  reference_number: source.reference,
  source_kind: source.kind,
  source_level: source.level,
  evidence_basis: source.basis,
  assertion: source.assertion,
  revision_label: source.version,
  source_location: source.location,
  title: source.title,
  source_reference: source.document,
  evidence_date: source.date,
  owner_name: source.owner,
  source_current: source.current,
}));
const defaults: Record<string, Row[]> = {
  product_variants: [{ id: id(1), sku: seed.sku }],
  oem_revision_heads: [{ id: id(2), product_variant_id: id(1) }],
  pi_oem_revision_states: [head],
  pi_effective_oem_references: [effective(3, "open"), effective(8, "current")],
  pi_oem_source_states: sourceRows,
  oem_references: seed.originals.map((row) => ({
    id: row.id,
    product_variant_id: id(1),
    manufacturer_name: row.manufacturer,
    reference_number: row.reference,
    verification_status: row.status,
    source_level: row.level,
  })),
  oem_revisions: [fact(3, 2), fact(8, 1, "approved")],
  oem_revision_evidence: [
    { revision_id: id(3), evidence_source_id: id(5) },
    { revision_id: id(3), evidence_source_id: id(6) },
    { revision_id: id(8), evidence_source_id: id(6) },
  ],
  oem_revision_decisions: [
    {
      revision_id: id(8),
      decision: "APPROVE",
      approved_status: "OEM_REFERENCE",
      conflict_resolution: "",
      event: { reason: "Synthetic human decision", created_at: "2026-01-01T00:00:00Z" },
    },
  ],
};
function fixture(
  options: {
    overrides?: Partial<Record<string, Row[]>>;
    cap?: number;
    role?: string;
    drift?: string;
    missingCount?: string;
    changedCount?: string;
    ignoreFilters?: string;
    providerError?: string;
    unconfirmed?: boolean;
  } = {},
) {
  const calls: URL[] = [],
    reads = new Map<string, number>();
  const client = createClient<Database>(
    env.CONSOLE_SUPABASE_URL,
    env.CONSOLE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (input, init) => {
          const url = new URL(String(input)),
            table = url.pathname.split("/").at(-1)!;
          calls.push(url);
          reads.set(table, (reads.get(table) ?? 0) + 1);
          assert.equal(url.origin, env.CONSOLE_SUPABASE_URL);
          assert.equal(init?.method, "GET");
          assert.doesNotMatch(
            url.searchParams.get("select") ?? "",
            /raw_snapshot|source_digest|variant_digest|actor_id|created_by|confirmation|storage/,
          );
          if (table === options.providerError)
            return Response.json({ message: "PRIVATE_SENTINEL", code: "42501" }, { status: 403 });
          let rows =
            table === "console_user_roles"
              ? options.role === "" || (options.drift === "role" && reads.get(table)! > 1)
                ? []
                : [{ role: options.role ?? "owner", user_id: id(20) }]
              : (options.overrides?.[table] ?? defaults[table]);
          assert.ok(rows, table);
          if (options.drift === table && reads.get(table)! > 1)
            rows = rows.map((row) => ({
              ...row,
              ...(table === "pi_oem_source_states"
                ? { source_current: false }
                : table === "pi_effective_oem_references"
                  ? { review_valid: false, verification_status: "DATA_CONFLICT" }
                  : { revision: 3 }),
            }));
          if (options.ignoreFilters !== table)
            for (const [key, filter] of url.searchParams) {
              if (filter.startsWith("eq."))
                rows = rows.filter((row) => String(row[key]) === filter.slice(3));
              if (filter.startsWith("in.("))
                rows = rows.filter((row) =>
                  filter.slice(4, -1).split(",").includes(String(row[key])),
                );
            }
          if (new Headers(init?.headers).get("accept")?.includes("object+json"))
            return Response.json(rows[0] ?? null);
          const offset = Number(url.searchParams.get("offset") ?? 0),
            limit = Number(url.searchParams.get("limit") ?? 250);
          return new Response(
            JSON.stringify(rows.slice(offset, offset + Math.min(limit, options.cap ?? 250))),
            {
              headers: {
                "content-type": "application/json",
                ...(options.missingCount === table
                  ? {}
                  : {
                      "content-range": `0-0/${rows.length + (options.changedCount === table && offset > 0 ? 1 : 0)}`,
                    }),
              },
            },
          );
        },
      },
    },
  );
  client.auth.getUser = async () =>
    ({
      error: null,
      data: { user: { id: id(20), email_confirmed_at: options.unconfirmed ? null : "2026-01-01" } },
    }) as Awaited<ReturnType<typeof client.auth.getUser>>;
  return { client: client as ConsoleClient, calls };
}
test("OEM workbench combines retained originals, fresh sources, current and pending exact scopes", async () => {
  const { client, calls } = fixture({ cap: 1 });
  const data = await readOemWorkbench(client, id(1).toUpperCase(), env);
  assert.ok(data);
  assert.equal(data.variantId, id(1));
  assert.equal(data.sources.length, 2);
  assert.equal(data.scopes.length, 1);
  assert.equal(data.scopes[0].current?.status, "OEM_REFERENCE");
  assert.equal(data.scopes[0].latest.state, "pending");
  assert.equal(data.scopes[0].originalId, id(4));
  assert.equal(data.originals[0].reference, "TEST-ONLY-ORIGINAL");
  assert.ok(data.canSource && data.canPropose && data.canSubmit && data.canReview);
  assert.ok(calls.some((url) => url.searchParams.get("offset") === "1"));
  assert.doesNotMatch(JSON.stringify(data), /PRIVATE_SENTINEL|source_digest|submitted_digest/);
});
test("invalid current approval is visibly conflicted without resurrecting an original", async () => {
  const rows = [
    effective(3, "open"),
    { ...effective(8, "current"), review_valid: false, verification_status: "DATA_CONFLICT" },
  ];
  const data = await readOemWorkbench(
    fixture({ overrides: { pi_effective_oem_references: rows } }).client,
    id(1),
    env,
  );
  assert.equal(data?.scopes[0].current?.valid, false);
  assert.equal(data?.scopes[0].current?.status, "DATA_CONFLICT");
  assert.equal(data?.originals.length, 1);
});
test("OEM reads preserve current role separation and deny unassigned or disabled access", async () => {
  for (const role of ["editor", "reviewer", "viewer", "publisher"]) {
    const data = await readOemWorkbench(fixture({ role }).client, id(1), env);
    assert.ok(data);
    assert.equal(data.canReview, role === "reviewer");
    assert.equal(data.canPropose, role === "editor");
    assert.equal(data.canSource, ["editor", "reviewer"].includes(role));
  }
  for (const options of [{ role: "" }, { unconfirmed: true }])
    await assert.rejects(readOemWorkbench(fixture(options).client, id(1), env), ConsoleReadError);
  const { client, calls } = fixture();
  await assert.rejects(
    readOemWorkbench(client, id(1), { ...env, CONSOLE_OEM_ENABLED: "false" }),
    ConsoleReadError,
  );
  assert.equal(calls.length, 0);
  assert.equal(
    await readOemWorkbench(fixture({ overrides: { product_variants: [] } }).client, id(1), env),
    null,
  );
});
test("counted pagination rejects absent or drifting totals, duplicate and detached evidence", async () => {
  for (const options of [
    { missingCount: "pi_oem_source_states" },
    { changedCount: "pi_oem_source_states", cap: 1 },
    { overrides: { pi_oem_revision_states: [head, head] } },
    { overrides: { oem_revision_evidence: [{ revision_id: id(3), evidence_source_id: id(99) }] } },
    {
      overrides: { oem_revision_evidence: [{ revision_id: id(99), evidence_source_id: id(5) }] },
      ignoreFilters: "oem_revision_evidence",
    },
    { overrides: { oem_revisions: [] } },
    {
      overrides: {
        pi_oem_source_states: sourceRows.map((row) => ({
          ...row,
          manufacturer_name: "Other manufacturer",
        })),
      },
    },
    {
      overrides: { pi_oem_source_states: sourceRows.map((row) => ({ ...row, source_level: "D" })) },
    },
    { overrides: { pi_effective_oem_references: [effective(8, "current")] } },
    {
      overrides: {
        pi_effective_oem_references: [
          { ...effective(3, "open"), publication_ready: true },
          effective(8, "current"),
        ],
      },
    },
    { overrides: { pi_oem_revision_states: [{ ...head, source_oem_reference_id: id(99) }] } },
  ])
    await assert.rejects(readOemWorkbench(fixture(options).client, id(1), env), ConsoleReadError);
});
test("detectable head, effective source and permission drift fails instead of returning mixed states", async () => {
  for (const drift of [
    "pi_oem_revision_states",
    "pi_effective_oem_references",
    "pi_oem_source_states",
    "role",
  ])
    await assert.rejects(readOemWorkbench(fixture({ drift }).client, id(1), env), ConsoleReadError);
  for (const providerError of ["pi_oem_revision_states", "oem_revisions", "pi_oem_source_states"])
    await assert.rejects(
      readOemWorkbench(fixture({ providerError }).client, id(1), env),
      (error) => error instanceof ConsoleReadError && !error.message.includes("PRIVATE_SENTINEL"),
    );
});
test("history pages retain proposal versus actual human approved status", async () => {
  const { client, calls } = fixture();
  const data = await readOemHistory(client, id(1), id(2), 1, env);
  assert.equal(data.total, 2);
  assert.equal(data.items[1].status, "NEEDS_FACTORY_CONFIRMATION");
  assert.equal(data.items[1].approvedStatus, "OEM_REFERENCE");
  assert.equal(data.items[1].reviewReason, "Synthetic human decision");
  assert.ok(calls.some((url) => url.searchParams.get("head_id") === `eq.${id(2)}`));
  const revisions = Array.from({ length: 26 }, (_, n) => fact(100 + n, 26 - n, "proposed"));
  const page = await readOemHistory(
    fixture({ overrides: { oem_revisions: revisions, oem_revision_decisions: [] } }).client,
    id(1),
    id(2),
    2,
    env,
  );
  assert.equal(page.total, 26);
  assert.equal(page.items.length, 1);
  assert.equal(page.items[0].revision, 1);
});
test("history rejects missing decisions, wrong scope, partial pages, reordered sequences and revocation", async () => {
  for (const options of [
    { overrides: { oem_revision_heads: [] } },
    { overrides: { oem_revision_decisions: [] } },
    { cap: 1 },
    { missingCount: "oem_revisions" },
    { drift: "role" },
    { overrides: { oem_revisions: [fact(8, 1, "approved"), fact(3, 2)] } },
    {
      overrides: { oem_revisions: [{ ...fact(3, 2), head_id: id(99) }] },
      ignoreFilters: "oem_revisions",
    },
    {
      overrides: {
        oem_revision_decisions: [{ ...defaults.oem_revision_decisions[0], decision: "REJECT" }],
      },
    },
  ])
    await assert.rejects(
      readOemHistory(fixture(options).client, id(1), id(2), 1, env),
      ConsoleReadError,
    );
  for (const page of [0, -1, 1.1, 10001])
    await assert.rejects(
      readOemHistory(fixture().client, id(1), id(2), page, env),
      ConsoleReadError,
    );
});
