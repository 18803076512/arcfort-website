import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import {
  ConsoleInputError,
  ConsoleReadError,
  filters,
  readReadiness,
  readDocumentReadiness,
} from "../../lib/console/catalog.ts";
import { parseDocumentReadiness } from "../../lib/domain/catalog/document-readiness.ts";
import { documentId as id, documentEnv } from "./document-fixture.ts";
import { documentReadinessFixture, readinessFixture } from "./document-readiness-fixture.ts";
const env = { ...documentEnv, CONSOLE_DOCUMENT_REVIEW_ENABLED: "true" };
const counts = documentReadinessFixture();
const row = { ...readinessFixture(filters({})).items[1], ...counts };
function fixture() {
  const state = {
    roles: ["owner"],
    signedIn: true,
    confirmed: true,
    revoke: false,
    error: false,
    total: "1",
    items: [row] as unknown,
    detail: { ...counts, product_variant_id: id(1) } as unknown,
    calls: [] as URL[],
    working: null as unknown,
  };
  const sdk = createClient<Database>(
    env.CONSOLE_SUPABASE_URL,
    env.CONSOLE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (input, init) => {
          const url = new URL(String(input));
          assert.equal(url.origin, env.CONSOLE_SUPABASE_URL);
          const name = url.pathname.split("/").at(-1);
          if (name === "pi_product_working_states") {
            assert.equal(init?.method, "POST");
            const ids = JSON.parse(String(init?.body)).variant_ids as string[];
            return Response.json(
              state.working ??
                ids.map((product_variant_id) => ({
                  product_variant_id,
                  revision: 0,
                  origin: "adopted",
                })),
            );
          }
          assert.equal(init?.method, "GET");
          if (name === "console_user_roles")
            return Response.json(state.roles.map((role) => ({ role })));
          state.calls.push(url);
          if (state.revoke) state.roles = [];
          if (state.error) return Response.json({ message: "PRIVATE_SENTINEL" }, { status: 500 });
          if (name === "pi_document_readiness") return Response.json(state.detail);
          assert.ok(["pi_variant_document_readiness", "pi_variant_readiness"].includes(name!));
          return Response.json(state.items, {
            headers: { "content-range": `0-24/${state.total}` },
          });
        },
      },
    },
  );
  const client = {
    from: sdk.from.bind(sdk),
    rpc: sdk.rpc.bind(sdk),
    auth: {
      getUser: async () => ({
        error: null,
        data: {
          user: state.signedIn
            ? { id: id(50), email_confirmed_at: state.confirmed ? "2026-01-01" : null }
            : null,
        },
      }),
    },
  } as unknown as ConsoleClient;
  return { state, client };
}
test("counts distinguish zero, reviewed and overlapping unresolved causes without leaking extra fields", () => {
  for (const state of ["empty", "reviewed", "unresolved"]) {
    const expected = documentReadinessFixture(state);
    assert.deepEqual(
      parseDocumentReadiness({ ...expected, private_note: "PRIVATE_SENTINEL" }),
      expected,
    );
  }
  for (const input of [
    null,
    [],
    {},
    { ...counts, document_count: 0 },
    { ...counts, reviewed_document_count: 2 },
  ])
    assert.equal(parseDocumentReadiness(input), null);
  for (const key of Object.keys(counts))
    for (const value of [null, undefined, "1", -1, 0.5, Infinity, NaN, 2147483648])
      assert.equal(parseDocumentReadiness({ ...counts, [key]: value }), null, `${key}: ${value}`);
  for (const key of [
    "unavailable_original_count",
    "open_document_review_count",
    "invalid_document_approval_count",
    "document_conflict_count",
  ])
    assert.equal(parseDocumentReadiness({ ...counts, [key]: 5 }), null);
});
test("document readiness is default-off and exact local opt-in; legacy list stays compatible", async () => {
  for (const patch of [
    { CONSOLE_DOCUMENT_REVIEW_ENABLED: "false" },
    { CONSOLE_DOCUMENTS_ENABLED: "false" },
    { CONSOLE_WORKING_ENABLED: "false" },
    { CONSOLE_ENVIRONMENT: "production" },
    { CONSOLE_ORIGIN: "http://localhost:3000" },
  ]) {
    const { client, state } = fixture();
    assert.equal(await readDocumentReadiness(client, id(1), { ...env, ...patch }), null);
    await assert.rejects(
      readReadiness(client, filters({ blocker: "documents" }), { ...env, ...patch }),
      ConsoleInputError,
    );
    assert.equal(state.calls.length, 0);
  }
  const { client, state } = fixture();
  const result = await readReadiness(client, filters({}), {});
  assert.equal(result.documentsEnabled, false);
  assert.equal(result.items[0].documents, null);
  assert.equal(state.calls[0].pathname, "/rest/v1/pi_variant_readiness");
  assert.ok(!state.calls[0].searchParams.get("select")!.includes("document"));
});
test("exact SKU read refuses wrong identity, malformed data, denied roles and post-read revocation", async () => {
  for (const role of ["owner", "editor", "reviewer", "publisher", "viewer"]) {
    const { client, state } = fixture();
    state.roles = [role];
    assert.deepEqual(await readDocumentReadiness(client, id(1), env), counts);
    assert.equal(state.calls[0].searchParams.get("product_variant_id"), `eq.${id(1)}`);
  }
  for (const patch of [
    { roles: [] },
    { signedIn: false },
    { confirmed: false },
    { revoke: true },
    { error: true },
    { detail: null },
    { detail: { ...counts, product_variant_id: id(2) } },
    { detail: { ...counts, product_variant_id: id(1), document_count: 0 } },
  ]) {
    const { client, state } = fixture();
    Object.assign(state, patch);
    await assert.rejects(readDocumentReadiness(client, id(1), env), ConsoleReadError);
  }
  const { client } = fixture();
  await assert.rejects(readDocumentReadiness(client, "invalid", env), ConsoleInputError);
});
test("document list uses exact server count/filter/order/range and escaped SKU search", async () => {
  const { client, state } = fixture();
  state.total = "27";
  state.items = [row, { ...row, id: id(3) }];
  const result = await readReadiness(
    client,
    filters({ blocker: "documents", page: "2", q: "%_" }),
    env,
  );
  assert.equal(result.total, 27);
  assert.equal(result.items.length, 2);
  assert.deepEqual(result.items[0].documents, counts);
  const query = state.calls[0];
  assert.equal(query.pathname, "/rest/v1/pi_variant_document_readiness");
  assert.equal(query.searchParams.get("unresolved_document_count"), "gt.0");
  assert.equal(query.searchParams.get("sku"), "ilike.%\\%\\_%");
  assert.equal(query.searchParams.get("offset"), "25");
  assert.equal(query.searchParams.get("limit"), "25");
  assert.equal(query.searchParams.get("order"), "sku.asc,id.asc");
  state.items = [];
  state.total = "0";
  assert.deepEqual((await readReadiness(client, filters({ page: "2" }), env)).items, []);
});
test("document list rejects missing counts, partial pages, duplicates, contradictory filters and revoked access", async () => {
  for (const patch of [
    { total: "*" },
    { total: "2" },
    { items: [] },
    { items: [{ ...row, reviewed_document_count: null }] },
    { total: "2", items: [row, row] },
    { items: [{ ...row, blocker_count: 0 }] },
    { items: [{ ...row, ...documentReadinessFixture("reviewed") }] },
    { revoke: true },
    { error: true },
    { roles: [] },
  ]) {
    const { client, state } = fixture();
    Object.assign(state, patch);
    await assert.rejects(
      readReadiness(client, filters({ blocker: "documents" }), env),
      ConsoleReadError,
    );
  }
});
test("all existing blocker queries remain server-side when document counts are enabled", async () => {
  for (const [blocker, key, value] of [
    ["all", "blocker_count", "gt.0"],
    ["technical", "unresolved_technical_count", "gt.0"],
    ["image", "eligible_main_image_count", "eq.0"],
    ["seo", "approved_seo_count", "eq.0"],
    ["compatibility", "confirmed_compatibility_count", "eq.0"],
  ]) {
    const { client, state } = fixture();
    await readReadiness(client, filters({ blocker }), env);
    assert.equal(state.calls[0].searchParams.get(key), value);
  }
  assert.throws(() => filters({ blocker: ["documents", "all"] }), ConsoleInputError);
  assert.throws(() => filters({ blocker: "unknown" }), ConsoleInputError);
});
test("readiness links require a current working SKU; out-of-scope and duplicate states fail closed", async () => {
  const { client, state } = fixture();
  assert.equal(
    (await readReadiness(client, filters({}), env)).items[0].documentReviewAvailable,
    true,
  );
  state.working = [];
  const record = (await readReadiness(client, filters({}), env)).items[0];
  assert.equal(record.documentReviewAvailable, false);
  assert.deepEqual(record.documents, counts);
  for (const working of [
    [{ product_variant_id: id(999) }],
    [{ product_variant_id: row.id }, { product_variant_id: row.id }],
  ]) {
    state.working = working;
    await assert.rejects(readReadiness(client, filters({}), env), ConsoleReadError);
  }
});
