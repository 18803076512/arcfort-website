import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { executeConsoleCommand, canRunConsoleCommand } from "../../lib/console/commands.ts";
import { consoleMediaReviewEnabled } from "../../lib/console/working-config.ts";
import { parseConsoleCommand, CommandInputError } from "../../lib/domain/catalog/commands.ts";
const id = (n: number) => `96000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const digest = "a".repeat(64);
const env = {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_ORIGINALS_ENABLED: "true",
  CONSOLE_MEDIA_REVIEW_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_media",
};
const source = {
  source_kind: "company_record",
  source_level: "A",
  title: "Synthetic rights record",
  source_reference: "TEST-MEDIA",
  evidence_basis: "supplier_authorization",
  evidence_date: "2026-01-01",
  owner_name: "Synthetic custodian",
  revision_label: "TEST-1",
  source_location: "Synthetic page 1",
  assertion: "supports",
};
const proposal = {
  action: "media_propose",
  request_id: id(1),
  variant_id: id(2),
  asset_id: id(3),
  role: "main",
  slot: 0,
  revision: 0,
  head_id: null,
  copy: { alt_text: "Synthetic draft image" },
  sources: [id(4), id(5)],
  reason: "Synthetic proposal",
};
const confirmation = {
  original_digest: digest,
  original_inspected: true,
  usage_rights_confirmed: true,
  exact_product_confirmed: true,
};
const review = {
  action: "media_review",
  request_id: id(1),
  mapping_id: id(6),
  revision: 1,
  digest,
  decision: "APPROVE",
  reason: "Synthetic review",
  resolution: "",
  confirmation,
  rights_source_id: id(4),
  match_source_id: id(5),
  observation: "Synthetic opaque observation",
  replacement: null,
};
const commands = [
  {
    action: "media_source",
    request_id: id(1),
    variant_id: id(2),
    asset_id: id(3),
    role: "main",
    dimension: "usage_rights",
    source,
  },
  proposal,
  { action: "media_submit", request_id: id(1), mapping_id: id(6), revision: 1, digest },
  review,
  {
    ...review,
    decision: "REJECT",
    confirmation: null,
    rights_source_id: null,
    match_source_id: null,
    observation: null,
  },
  {
    ...review,
    decision: "EDIT",
    confirmation: null,
    rights_source_id: null,
    match_source_id: null,
    observation: null,
    replacement: { asset_id: id(3), copy: proposal.copy, sources: proposal.sources },
  },
];
function fixture() {
  const state = {
    roles: ["owner"],
    calls: [] as { name: string; args: unknown }[],
    result: {
      mapping_id: id(6),
      head_id: id(7),
      source_id: id(4),
      event_id: id(8),
      revision: 2,
      digest,
      observation_token: "PRIVATE_SENTINEL",
      storage_path: "PRIVATE_SENTINEL",
    } as unknown,
    error: "",
    signedIn: true,
  };
  const sdk = createClient<Database>(
    env.CONSOLE_SUPABASE_URL,
    env.CONSOLE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (url, init) => {
          const target = new URL(String(url));
          assert.equal(target.origin, env.CONSOLE_SUPABASE_URL);
          if (target.pathname.endsWith("console_user_roles"))
            return Response.json(state.roles.map((role) => ({ role })));
          state.calls.push({
            name: target.pathname.split("/").at(-1)!,
            args: JSON.parse(String(init?.body)),
          });
          return state.error
            ? Response.json({ code: state.error, message: "PRIVATE_SENTINEL" }, { status: 400 })
            : Response.json(state.result);
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
        data: { user: state.signedIn ? { id: id(9), email_confirmed_at: "2026-01-01" } : null },
      }),
    },
  } as unknown as ConsoleClient;
  return { client, state };
}
test("six exact media command forms parse without automatic evidence approval", () => {
  for (const command of commands) assert.deepEqual(parseConsoleCommand(command), command);
  for (const bad of [
    { ...proposal, slot: 1 },
    { ...proposal, sources: [id(4), id(4).toUpperCase()] },
    { ...proposal, copy: { alt_text: " Synthetic image" } },
    { ...proposal, revision: 1 },
    { ...commands[0], source: { ...source, evidence_basis: "sku_label" } },
    { ...review, confirmation: { ...confirmation, exact_product_confirmed: false } },
    { ...review, observation: "" },
    { ...review, observation: "x".repeat(801) },
    { ...review, rights_source_id: null },
    { ...review, extra: true },
    { ...commands[4], observation: "unexpected" },
    { ...commands[5], replacement: { ...proposal, asset_id: id(3) } },
  ])
    assert.throws(() => parseConsoleCommand(bad), CommandInputError);
});
test("media mutations have independent default-off exact loopback configuration", async () => {
  assert.ok(consoleMediaReviewEnabled(env));
  for (const override of [
    { CONSOLE_MEDIA_REVIEW_ENABLED: undefined },
    { CONSOLE_WORKING_ENABLED: "false" },
    { CONSOLE_ORIGINALS_ENABLED: "false" },
    { CONSOLE_ENVIRONMENT: "staging" },
    { CONSOLE_ORIGIN: "http://localhost:3000" },
    { CONSOLE_SUPABASE_URL: "https://example.invalid" },
  ]) {
    const { client, state } = fixture();
    assert.equal((await executeConsoleCommand(client, review, { ...env, ...override })).ok, false);
    assert.equal(state.calls.length, 0);
  }
});
test("current command roles separate proposing, evidence intake and human decisions", () => {
  for (const role of ["owner", "editor", "reviewer", "publisher", "viewer"] as const) {
    assert.equal(
      canRunConsoleCommand([role], "media_review"),
      ["owner", "reviewer"].includes(role),
    );
    assert.equal(canRunConsoleCommand([role], "media_propose"), ["owner", "editor"].includes(role));
    for (const action of ["media_source", "media_submit"] as const)
      assert.equal(
        canRunConsoleCommand([role], action),
        ["owner", "editor", "reviewer"].includes(role),
      );
  }
});
test("SDK transport passes exact signed observation and explicit nulls without echoing private results", async () => {
  const expectedNames = [
    "pi_add_media_source",
    "pi_propose_media_mapping",
    "pi_submit_media_mapping",
    "pi_review_media_mapping",
    "pi_review_media_mapping",
    "pi_review_media_mapping",
  ];
  for (const [index, command] of commands.entries()) {
    const parsed = parseConsoleCommand(command);
    const { client, state } = fixture();
    const result = await executeConsoleCommand(client, command, env);
    assert.ok(result.ok);
    assert.equal(state.calls[0].name, expectedNames[index]);
    assert.doesNotMatch(
      JSON.stringify(result),
      /PRIVATE_SENTINEL|observation|storage_path|source_digest/,
    );
    if (parsed.action === "media_review") {
      const args = state.calls[0].args as Record<string, unknown>;
      assert.equal(args.observation_token, parsed.observation);
      assert.deepEqual(args.confirmation, parsed.confirmation ?? {});
      assert.equal(args.rights_source_uuid, parsed.rights_source_id);
      assert.equal(args.match_source_uuid, parsed.match_source_id);
      assert.deepEqual(args.replacement, parsed.replacement);
    }
  }
});
test("invalid current roles, malformed results and provider details fail closed", async () => {
  for (const roles of [["editor"], ["viewer"], ["publisher"], []]) {
    const { client, state } = fixture();
    state.roles = roles;
    assert.equal((await executeConsoleCommand(client, review, env)).ok, false);
    assert.equal(state.calls.length, 0);
  }
  for (const data of [
    null,
    {},
    { mapping_id: "bad" },
    { mapping_id: id(6), head_id: id(7), event_id: id(8), revision: -1 },
    { mapping_id: id(6), head_id: id(7), event_id: id(8), revision: 0 },
    { mapping_id: id(10), head_id: id(7), event_id: id(8), revision: 1 },
  ]) {
    const { client, state } = fixture();
    state.result = data;
    assert.equal((await executeConsoleCommand(client, review, env)).ok, false);
  }
  for (const error of ["23514", "40001", "PRIVATE_SENTINEL"]) {
    const { client, state } = fixture();
    state.error = error;
    const result = await executeConsoleCommand(client, review, env);
    assert.equal(result.ok, false);
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL/);
  }
});
