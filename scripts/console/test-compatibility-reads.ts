import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { ConsoleInputError, ConsoleReadError } from "../../lib/console/catalog.ts";
import {
  compatibilityFilters,
  readCompatibilityHistory,
  readCompatibilityTargets,
  readCompatibilityWorkbench,
} from "../../lib/console/compatibility.ts";
import { readAllConsoleRows } from "../../lib/console/read-pages.ts";
import { compatibilityIds as ids } from "./compatibility-fixture.ts";

const savedEnv = { ...process.env };
for (const key of Object.keys(process.env))
  if (/^(CONSOLE_|VERCEL|PRODUCT_INTELLIGENCE_)/.test(key)) delete process.env[key];
Object.assign(process.env, {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_COMPATIBILITY_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_test",
});
type Row = Record<string, unknown>;
type Overrides = Partial<Record<string, Row[]>>;
function response(data: unknown, count?: number, offset = 0) {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
      ...(count === undefined ? {} : { "content-range": `${offset}-${offset}/${count}` }),
    },
  });
}
const original = {
  id: ids.root,
  external_key: "source:synthetic",
  subject_entity_id: ids.subject,
  target_entity_id: ids.target,
  relationship_type: "product_to_series",
  role: "Tip holder",
  verification_status: "NEEDS_FACTORY_CONFIRMATION",
  relationship_status: "reference_only",
  confirmation_requirements: ["Exact drawing"],
};
const candidate = {
  ...original,
  id: ids.candidate,
  external_key: "working-relationship:synthetic",
  verification_status: "DATA_CONFLICT",
};
const head = {
  root_relationship_id: ids.root,
  current_relationship_id: ids.root,
  target_entity_id: ids.target,
  relationship_type: "product_to_series",
  scope_label: "Assembly A",
  revision: 2,
};
const binding = {
  evidence_source_id: ids.source,
  subject_entity_id: ids.subject,
  target_entity_id: ids.target,
  relationship_type: "product_to_series",
  scope_label: "Assembly A",
  asserted_role: "Tip holder",
  assertion: "supports",
  evidence_basis: "drawing",
  revision_label: "QA-1",
  source_location: "Callout 1",
};
function fixture(overrides: Overrides = {}, role: string | null = "owner", cap = 250) {
  const calls: URL[] = [];
  const defaults: Record<string, Row[]> = {
    subjects: [{ id: ids.subject, entity_type: "product", product_series_id: null }],
    compatibility_entities: [{ id: ids.target, label: "Synthetic target", entity_type: "series" }],
    compatibility_revision_heads: [head],
    pi_effective_compatibility_relationships: [original, candidate],
    compatibility_relationships: [original],
    compatibility_revisions: [
      {
        relationship_id: ids.candidate,
        root_relationship_id: ids.root,
        review_state: "pending",
        proposal_digest: "a".repeat(64),
      },
    ],
    compatibility_source_bindings: [binding],
    compatibility_evidence: [ids.root, ids.candidate].map((id) => ({
      compatibility_relationship_id: id,
      evidence_source_id: ids.source,
      evidence_role: "supporting",
    })),
    evidence_sources: [
      {
        id: ids.source,
        title: "Synthetic drawing",
        source_reference: "QA-ONLY",
        source_level: "A",
      },
    ],
  };
  const client = createClient<Database>(
    "https://compatibility-fixture.example.invalid",
    "synthetic-key",
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (input, init) => {
          const url = new URL(String(input));
          calls.push(url);
          const table = url.pathname.split("/").at(-1)!;
          assert.doesNotMatch(
            url.searchParams.get("select") ?? "",
            /raw_snapshot|owner_name|source_digest|endpoint_digest|actor_id|\*/,
          );
          if (table === "pi_working_status" || table === "pi_product_working_states") {
            assert.equal(init?.method, "POST");
            return response(
              table === "pi_working_status"
                ? [
                    {
                      adopted: true,
                      can_edit: role === "owner" || role === "editor",
                      can_review: role === "owner" || role === "reviewer",
                    },
                  ]
                : (overrides.states ?? [{ product_variant_id: ids.variant }]),
            );
          }
          assert.equal(init?.method, "GET", "No mutation transport permitted");
          if (table === "console_user_roles") return response(role ? [{ role }] : []);
          if (table === "product_variants") {
            assert.equal(url.searchParams.get("id"), `eq.${ids.variant}`);
            return response({ sku: "AF-QA-ONLY" });
          }
          const key =
            table === "compatibility_entities" &&
            url.searchParams.get("product_variant_id") === `eq.${ids.variant}`
              ? "subjects"
              : table;
          let rows = overrides[key] ?? defaults[key];
          assert.ok(rows, `Unexpected table ${table}`);
          const identifier =
            url.searchParams.get("id") ??
            url.searchParams.get("compatibility_relationship_id") ??
            url.searchParams.get("root_relationship_id");
          if (identifier?.startsWith("in.(")) {
            const wanted = identifier.slice(4, -1).split(",");
            rows = rows.filter((row) =>
              wanted.includes(
                String(row.id ?? row.compatibility_relationship_id ?? row.root_relationship_id),
              ),
            );
          }
          if (
            [
              "compatibility_revision_heads",
              "pi_effective_compatibility_relationships",
              "compatibility_source_bindings",
            ].includes(table)
          )
            assert.equal(url.searchParams.get("subject_entity_id"), `eq.${ids.subject}`);
          if (table === "compatibility_source_bindings")
            assert.equal(url.searchParams.get("product_variant_id"), `eq.${ids.variant}`);
          const offset = Number(url.searchParams.get("offset") ?? 0);
          const limit = Math.min(cap, Number(url.searchParams.get("limit") ?? 250));
          return response(rows.slice(offset, offset + limit), rows.length, offset);
        },
      },
    },
  );
  Object.assign(client.auth, {
    getUser: async () => ({
      error: null,
      data: { user: { id: ids.variant, email_confirmed_at: "2026-09-25" } },
    }),
  });
  return { client: client as unknown as ConsoleClient, calls };
}
try {
  for (const invalid of [
    { root: [ids.root] },
    { root: "../" },
    { kind: "product" },
    { q: "x".repeat(101) },
    { targetPage: "0" },
    { historyPage: "10001" },
    { historyPage: ["1"] },
  ])
    assert.throws(() => compatibilityFilters(invalid), ConsoleInputError);
  assert.equal(compatibilityFilters({ root: "new" }).root, "new");
  const transport = fixture({}, "owner", 1);
  const data = await readCompatibilityWorkbench(transport.client, ids.variant);
  assert.equal(data?.scopes.length, 1);
  assert.equal(data?.scopes[0].original?.id, ids.root);
  assert.equal(data?.scopes[0].current?.id, ids.root);
  assert.equal(data?.scopes[0].candidate?.status, "DATA_CONFLICT");
  assert.equal(data?.scopes[0].candidate?.evidence[0].version, "QA-1");
  assert.equal(data?.sources[0].scope, "Assembly A");
  assert.doesNotMatch(
    JSON.stringify(data),
    /raw_snapshot|owner_name|source_digest|endpoint_digest|actor_id/,
  );
  console.log(
    "PASS strict filters, scoped current/original/proposal reads, lower provider cap and minimal DTO",
  );

  for (const overrides of [
    { compatibility_relationships: [] },
    { evidence_sources: [] },
    { compatibility_entities: [] },
    { pi_effective_compatibility_relationships: [candidate] },
    { pi_effective_compatibility_relationships: [original] },
    {
      pi_effective_compatibility_relationships: [
        original,
        { ...candidate, target_entity_id: ids.subject },
      ],
    },
    { subjects: [{ id: ids.subject, entity_type: "torch", product_series_id: null }] },
    {
      compatibility_revisions: [
        {
          relationship_id: ids.candidate,
          root_relationship_id: ids.root,
          review_state: "pending",
          proposal_digest: "bad",
        },
      ],
    },
  ])
    await assert.rejects(
      readCompatibilityWorkbench(fixture(overrides).client, ids.variant),
      ConsoleReadError,
    );
  assert.equal(await readCompatibilityWorkbench(fixture({ states: [] }).client, ids.variant), null);
  assert.equal(
    (await readCompatibilityWorkbench(fixture({ subjects: [] }).client, ids.variant))?.subjectId,
    null,
  );
  for (const role of ["viewer", "editor", "reviewer"])
    assert.equal(
      (await readCompatibilityWorkbench(fixture({}, role).client, ids.variant))?.canReview,
      role === "reviewer",
    );
  const denied = fixture({}, null);
  await assert.rejects(readCompatibilityWorkbench(denied.client, ids.variant), ConsoleReadError);
  assert.equal(denied.calls.length, 1);
  process.env.CONSOLE_COMPATIBILITY_ENABLED = "false";
  const disabled = fixture();
  await assert.rejects(
    readCompatibilityTargets(disabled.client, compatibilityFilters({})),
    ConsoleReadError,
  );
  assert.equal(disabled.calls.length, 0);
  process.env.CONSOLE_COMPATIBILITY_ENABLED = "true";
  console.log(
    "PASS missing identity, current-pointer/target/source failures, current roles and disabled gate",
  );

  const many = Array.from({ length: 1103 }, (_, n) => ({
    ...original,
    id: `70000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
  }));
  const large = fixture(
    {
      compatibility_revision_heads: [],
      pi_effective_compatibility_relationships: many,
      compatibility_source_bindings: [],
      compatibility_evidence: [],
    },
    "viewer",
    100,
  );
  assert.equal((await readCompatibilityWorkbench(large.client, ids.variant))?.scopes.length, 1103);
  assert.equal(
    large.calls.filter((url) => url.pathname.endsWith("pi_effective_compatibility_relationships"))
      .length,
    12,
  );
  for (const mode of ["duplicate", "drift", "empty", "excess", "negative"])
    await assert.rejects(
      readAllConsoleRows(
        async (start) => ({
          error: null,
          count:
            mode === "excess"
              ? 10001
              : mode === "negative"
                ? -1
                : mode === "drift" && start
                  ? 3
                  : 2,
          data:
            start && mode === "empty"
              ? []
              : [{ id: mode === "duplicate" ? "same" : String(start) }],
        }),
        (row) => row.id,
      ),
      ConsoleReadError,
    );
  console.log(
    "PASS 1,103-reference pagination and counted-reader duplicate, drift, empty and bound failures",
  );

  const targets = fixture({
    compatibility_entities: Array.from({ length: 1001 }, (_, n) => ({
      id: String(n),
      label: "Target",
      entity_type: "torch",
    })),
  });
  const page = await readCompatibilityTargets(
    targets.client,
    compatibilityFilters({ targetPage: "41", kind: "torch", q: "50%_" }),
  );
  assert.equal(page.items.length, 1);
  assert.equal(page.total, 1001);
  const query = targets.calls.at(-1)!.searchParams;
  assert.equal(query.get("offset"), "1000");
  assert.equal(query.get("entity_type"), "eq.torch");
  assert.equal(query.get("label"), "ilike.%50\\%\\_%");
  assert.equal(query.get("product_variant_id"), "is.null");
  const historyRow = {
    relationship_id: ids.candidate,
    sequence: 2,
    review_state: "rejected",
    reason: "Synthetic reason",
    created_at: "2026-09-25",
    compatibility_revision_heads: {},
    compatibility_relationships: { role: "Tip holder", verification_status: "DATA_CONFLICT" },
    verification_events: { decision: "REJECT", reason: "Synthetic rejection" },
  };
  const trail = fixture({ compatibility_revisions: [historyRow] });
  const history = await readCompatibilityHistory(trail.client, ids.variant, ids.root, 1);
  assert.equal(history.items[0].decision, "REJECT");
  assert.equal(trail.calls.at(-1)!.searchParams.get("root_relationship_id"), `eq.${ids.root}`);
  assert.equal(
    trail.calls
      .at(-1)!
      .searchParams.get("compatibility_revision_heads.compatibility_entities.product_variant_id"),
    `eq.${ids.variant}`,
  );
  assert.doesNotMatch(JSON.stringify(history), /compatibility_revision_heads|actor_id/);
  console.log("PASS target/history pages, literal search and exact SKU/root query restrictions");
} finally {
  for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
  Object.assign(process.env, savedEnv);
}
