import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { ConsoleReadError } from "../../lib/console/catalog.ts";
import { readMediaMappings, readMediaMappingHistory } from "../../lib/console/media-mapping.ts";
import {
  readMediaObservation,
  qualifyingMediaSource,
} from "../../lib/domain/catalog/media-review.ts";
import { mediaMappingFixture, mediaMappingIds as id } from "./media-mapping-fixture.ts";

const saved = { ...process.env };
for (const key of Object.keys(process.env))
  if (/^(CONSOLE_|VERCEL|PRODUCT_INTELLIGENCE_)/.test(key)) delete process.env[key];
Object.assign(process.env, {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_ORIGINALS_ENABLED: "true",
  CONSOLE_MEDIA_REVIEW_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_test",
});
type Row = Record<string, unknown>;
const seed = mediaMappingFixture({ conflict: "1" });
const original = seed.data.originals[0];
const fact = {
  id: id.mapping,
  head_id: id.head,
  media_asset_id: id.asset,
  original_intent_id: id.intent,
  sequence: 2,
  alt_text: "Synthetic test-only original",
  review_state: "pending",
  verification_status: "DATA_CONFLICT",
  proposal_digest: "a".repeat(64),
  submitted_digest: "a".repeat(64),
  original_digest: "b".repeat(64),
  reason: "Synthetic reason",
  created_at: "2026-10-04T00:00:00Z",
};
const head = {
  id: id.head,
  product_variant_id: id.variant,
  media_role: "main",
  slot: 0,
  revision: 2,
};
const defaults: Record<string, Row[]> = {
  media_mapping_heads: [head],
  media_mapping_revisions: [fact],
  media_mapping_decisions: [],
  verification_events: [],
  pi_media_mapping_states: [
    {
      ...head,
      head_id: id.head,
      mapping_id: id.mapping,
      media_asset_id: id.asset,
      alt_text: fact.alt_text,
      review_state: "pending",
      verification_status: fact.verification_status,
      proposal_digest: fact.proposal_digest,
      submitted_digest: fact.submitted_digest,
    },
  ],
  pi_effective_media_mappings: [
    {
      mapping_id: id.mapping,
      head_id: id.head,
      product_variant_id: id.variant,
      media_asset_id: id.asset,
      role: "main",
      slot: 0,
      alt_text: fact.alt_text,
      mapping_origin: "open",
      review_state: "pending",
      verification_status: fact.verification_status,
      review_valid: false,
      publication_ready: false,
    },
  ],
  media_mapping_evidence: [id.rights, id.match].map((source) => ({
    revision_id: id.mapping,
    evidence_source_id: source,
  })),
  media_source_bindings: seed.data.sources.map((source) => ({
    evidence_source_id: source.id,
    product_variant_id: id.variant,
    media_asset_id: id.asset,
    media_role: "main",
    evidence_dimension: source.dimension,
    assertion: source.assertion,
    evidence_basis: source.basis,
    revision_label: source.version,
    source_location: source.location,
  })),
  evidence_sources: seed.data.sources.map((source) => ({
    id: source.id,
    title: source.title,
    source_reference: source.reference,
    source_level: source.level,
    evidence_date: source.date,
    owner_name: source.owner,
  })),
};
function fixture(
  overrides: Partial<Record<string, Row[]>> = {},
  role = "owner",
  cap = 250,
  drift = false,
  observed = false,
  change: "states" | "effective" | "role" | "" = "",
) {
  const calls: URL[] = [];
  let headReads = 0;
  const reads = new Map<string, number>();
  const response = (data: unknown, count?: number) =>
    new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
        ...(count === undefined ? {} : { "content-range": `0-0/${count}` }),
      },
    });
  const client = createClient<Database>("https://media-fixture.example.invalid", "synthetic-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: async (input, init) => {
        const url = new URL(String(input));
        calls.push(url);
        const table = url.pathname.split("/").at(-1)!;
        reads.set(table, (reads.get(table) ?? 0) + 1);
        assert.doesNotMatch(
          url.searchParams.get("select") ?? "",
          /\*|raw_snapshot|private_storage_path|file_hash|created_by|actor_id|confirmation/,
        );
        // Only the current mapping's non-secret original binding digest is required by review.
        if (table === "media_mapping_revisions")
          assert.match(url.searchParams.get("select")!, /original_digest/);
        else assert.doesNotMatch(url.searchParams.get("select") ?? "", /original_digest/);
        if (table === "pi_product_working_states")
          return response([{ product_variant_id: id.variant }]);
        if (table === "pi_read_original_intakes") {
          const page = JSON.parse(String(init?.body)).page_number;
          return response((overrides.originals ?? [original]).slice((page - 1) * 25, page * 25));
        }
        if (table === "pi_media_review_observed") return response(observed);
        assert.equal(init?.method, "GET", "No mutation transport permitted");
        if (table === "console_user_roles")
          return response(role && !(change === "role" && headReads > 1) ? [{ role }] : []);
        if (table === "product_variants") return response({ sku: seed.data.sku });
        let rows = overrides[table] ?? defaults[table];
        assert.ok(rows, table);
        if (change === "states" && table === "pi_media_mapping_states" && reads.get(table)! > 1)
          rows = rows.map((row) => ({ ...row, review_state: "rejected" }));
        if (
          change === "effective" &&
          table === "pi_effective_media_mappings" &&
          reads.get(table)! > 1
        )
          rows = rows.map((row) => ({
            ...row,
            verification_status:
              "DATA_CONFLICT" === row.verification_status
                ? "NEEDS_FACTORY_CONFIRMATION"
                : "DATA_CONFLICT",
          }));
        if (table === "media_mapping_heads" && ++headReads > 1 && drift)
          rows = [{ ...head, revision: 3 }];
        for (const [field, filter] of url.searchParams) {
          if (filter.startsWith("eq.")) rows = rows.filter((row) => row[field] === filter.slice(3));
          if (filter.startsWith("in.("))
            rows = rows.filter((row) =>
              filter.slice(4, -1).split(",").includes(String(row[field])),
            );
        }
        if (init?.headers && new Headers(init.headers).get("accept")?.includes("object+json"))
          return response(rows[0] ?? null);
        const start = Number(url.searchParams.get("offset") ?? 0),
          requested = Number(url.searchParams.get("limit") ?? 250);
        return response(rows.slice(start, start + Math.min(cap, requested)), rows.length);
      },
    },
  });
  client.auth.getUser = async () =>
    ({
      data: { user: { id: id.actor, email_confirmed_at: "2026-10-01" } },
      error: null,
    }) as Awaited<ReturnType<typeof client.auth.getUser>>;
  return { client: client as ConsoleClient, calls };
}
let groups = 0;
try {
  // The test inspects query columns separately below; allow only the explicitly scoped original digest.
  const owner = fixture({}, "owner", 1);
  const result = await readMediaMappings(owner.client, id.variant);
  assert.ok(result);
  assert.equal(result.sources.length, 3);
  assert.equal(result.scopes[0].candidate!.sourceIds.length, 2);
  assert.equal(
    result.sources.find((source) => source.id === id.contradiction)?.assertion,
    "contradicts",
  );
  assert.equal(result.canPropose, true);
  assert.equal(result.canReview, true);
  assert.doesNotMatch(
    JSON.stringify(result),
    /raw_snapshot|private_storage_path|secret|observation_token/,
  );
  groups++;
  for (const role of ["editor", "reviewer", "viewer", "publisher"]) {
    const result = await readMediaMappings(fixture({}, role).client, id.variant);
    assert.ok(result);
    assert.equal(result.canPropose, role === "editor");
    assert.equal(result.canSubmit, ["editor", "reviewer"].includes(role));
    assert.equal(result.canReview, role === "reviewer");
  }
  await assert.rejects(
    () => readMediaMappings(fixture({}, "").client, id.variant),
    ConsoleReadError,
  );
  process.env.CONSOLE_MEDIA_REVIEW_ENABLED = "false";
  const disabled = fixture();
  await assert.rejects(() => readMediaMappings(disabled.client, id.variant), ConsoleReadError);
  assert.equal(disabled.calls.length, 0);
  process.env.CONSOLE_MEDIA_REVIEW_ENABLED = "true";
  groups++;
  const sourceId = (value: number) => `20000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
  const manySources = fixture(
    {
      media_source_bindings: [
        ...defaults.media_source_bindings,
        ...Array.from({ length: 1001 }, (_, index) => ({
          ...defaults.media_source_bindings[0],
          evidence_source_id: sourceId(index),
        })),
      ],
      evidence_sources: [
        ...defaults.evidence_sources,
        ...Array.from({ length: 1001 }, (_, index) => ({
          ...defaults.evidence_sources[0],
          id: sourceId(index),
        })),
      ],
    },
    "owner",
    17,
  );
  assert.equal((await readMediaMappings(manySources.client, id.variant))!.sources.length, 1004);
  assert.ok(
    manySources.calls.filter((call) => call.pathname.endsWith("evidence_sources")).length > 11,
  );
  const manyOriginals = Array.from({ length: 26 }, (_, index) =>
    index === 0
      ? { ...original, total_count: 26 }
      : {
          ...original,
          intent_id: sourceId(index + 1100),
          asset_id: sourceId(index + 2100),
          total_count: 26,
        },
  );
  assert.equal(
    (await readMediaMappings(fixture({ originals: manyOriginals }).client, id.variant))!.originals
      .length,
    26,
  );
  await assert.rejects(
    () =>
      readMediaMappings(
        fixture({ originals: manyOriginals.map((row) => ({ ...row, intent_id: id.intent })) })
          .client,
        id.variant,
      ),
    ConsoleReadError,
  );
  const truncatedHistory = fixture(
    {
      media_mapping_heads: [{ ...head, revision: 30 }],
      media_mapping_revisions: [fact, { ...fact, id: sourceId(3000), sequence: 3 }],
    },
    "owner",
    1,
  );
  await assert.rejects(
    () => readMediaMappingHistory(truncatedHistory.client, id.variant, id.head, 1),
    ConsoleReadError,
  );
  groups++;
  for (const changes of [
    { evidence_sources: [] },
    { media_mapping_revisions: [] },
    { pi_media_mapping_states: [] },
    { originals: [] },
    { media_mapping_evidence: [{ revision_id: id.mapping, evidence_source_id: id.actor }] },
    {
      media_source_bindings: defaults.media_source_bindings.map((row) => ({
        ...row,
        media_role: "gallery",
      })),
    },
    {
      pi_effective_media_mappings: defaults.pi_effective_media_mappings.map((row) => ({
        ...row,
        publication_ready: true,
      })),
    },
    { media_mapping_revisions: [{ ...fact, submitted_digest: "c".repeat(64) }] },
  ])
    await assert.rejects(
      () => readMediaMappings(fixture(changes).client, id.variant),
      ConsoleReadError,
    );
  await assert.rejects(
    () => readMediaMappings(fixture({}, "owner", 250, true).client, id.variant),
    ConsoleReadError,
  );
  for (const change of ["states", "effective", "role"] as const)
    await assert.rejects(
      () => readMediaMappings(fixture({}, "owner", 250, false, false, change).client, id.variant),
      ConsoleReadError,
    );
  groups++;
  const approved = {
    media_mapping_revisions: [{ ...fact, review_state: "approved" }],
    pi_media_mapping_states: defaults.pi_media_mapping_states.map((row) => ({
      ...row,
      review_state: "approved",
    })),
    pi_effective_media_mappings: defaults.pi_effective_media_mappings.map((row) => ({
      ...row,
      mapping_origin: "current",
      review_state: "approved",
      verification_status: "CONFIRMED",
      review_valid: true,
    })),
  };
  for (const observed of [false, true]) {
    const result = await readMediaMappings(
      fixture(approved, "owner", 250, false, observed).client,
      id.variant,
    );
    assert.equal(result!.scopes[0].current!.observed, observed);
    assert.equal(result!.scopes[0].current!.valid, true);
  }
  groups++;
  const history = await readMediaMappingHistory(fixture().client, id.variant, id.head, 1);
  assert.equal(history.items.length, 1);
  assert.equal(history.items[0].sourceIds.length, 2);
  await assert.rejects(
    () => readMediaMappingHistory(fixture({}, "owner", 1).client, id.actor, id.head, 1),
    ConsoleReadError,
  );
  const decision = {
    mapping_id: id.mapping,
    event_id: id.event,
    decision: "APPROVE",
    conflict_resolution: "Synthetic resolution",
  };
  const event = {
    id: id.event,
    entity_type: "media_mapping",
    entity_id: id.mapping,
    decision: "APPROVE",
    reason: "Synthetic review",
  };
  const withDecision = {
    ...approved,
    media_mapping_decisions: [decision],
    verification_events: [event],
  };
  assert.equal(
    (await readMediaMappingHistory(fixture(withDecision).client, id.variant, id.head, 1)).items[0]
      .reviewReason,
    event.reason,
  );
  await assert.rejects(
    () =>
      readMediaMappingHistory(
        fixture({ ...withDecision, verification_events: [{ ...event, entity_id: id.actor }] })
          .client,
        id.variant,
        id.head,
        1,
      ),
    ConsoleReadError,
  );
  groups++;
  const now = 1791072000000;
  const expires = Math.floor(now / 1000) + 300;
  const context = {
    mapping_id: id.mapping,
    revision: 2,
    digest: "a".repeat(64),
    original_digest: "b".repeat(64),
  };
  const token = `v1|${id.key}|${id.actor}|${id.adoption}|${id.mapping}|2|${context.digest}|${context.original_digest}|${Math.floor(now / 1000)}|${expires}|${id.nonce}|${"c".repeat(64)}`;
  assert.equal(readMediaObservation(token, context, now)?.expiresAt, expires * 1000);
  assert.equal(readMediaObservation(token, context, expires * 1000), null);
  for (const changed of [
    { ...context, revision: 3 },
    { ...context, mapping_id: id.actor },
    { ...context, original_digest: "d".repeat(64) },
    { ...context, digest: "e".repeat(64) },
  ])
    assert.equal(readMediaObservation(token, changed, now), null);
  for (const malformed of [
    "",
    token + "|extra",
    token.replace(`|${expires}|`, `|${expires + 1}|`),
    token.replace("v1|", "v2|"),
  ])
    assert.equal(readMediaObservation(malformed, context, now), null);
  assert.equal(qualifyingMediaSource(seed.data.sources[0]), true);
  assert.equal(qualifyingMediaSource(seed.data.sources[2]), false);
  assert.equal(
    qualifyingMediaSource({ ...seed.data.sources[0], basis: "catalog_reference" }),
    false,
  );
  groups++;
  console.log(
    `PASS: ${groups} media-mapping read/observation groups; SDK transport mocked, no live provider.`,
  );
} finally {
  for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
  Object.assign(process.env, saved);
}
