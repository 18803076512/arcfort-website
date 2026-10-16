import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { canRunConsoleCommand, executeConsoleCommand } from "../../lib/console/commands.ts";
import { parseConsoleCommand, CommandInputError } from "../../lib/domain/catalog/commands.ts";
import { qualifyingOemSource } from "../../lib/domain/catalog/oem.ts";
import { consoleOemEnabled } from "../../lib/console/working-config.ts";
import { oemId as id, oemEnv as env } from "./oem-fixture.ts";

const copy = {
  manufacturer_name: "Synthetic TEST-ONLY manufacturer",
  reference_number: "TEST-ONLY-001.a",
};
const source = {
  source_kind: "company_record",
  source_level: "A",
  evidence_basis: "factory_record",
  assertion: "supports",
  evidence_date: "2026-01-01",
  title: "Synthetic source",
  source_reference: "TEST-ONLY record",
  owner_name: "Synthetic custodian",
  revision_label: "TEST-1",
  source_location: "Synthetic page 1",
};
const digest = "a".repeat(64);
const proposal = {
  action: "oem_propose",
  request_id: id(10),
  variant_id: id(1),
  slot: 0,
  revision: 0,
  head_id: null,
  original_id: null,
  copy,
  sources: [id(5)],
  reason: "Synthetic proposal only",
};
const review = {
  action: "oem_review",
  request_id: id(10),
  revision_id: id(3),
  revision: 2,
  digest,
  decision: "APPROVE",
  reason: "Synthetic human decision",
  status: "OEM_REFERENCE",
  source_id: id(6),
  resolution: "",
  confirmation: {
    source_checked: true,
    reference_checked: true,
    compatibility_not_asserted: true,
    arcfort_reference_confirmed: false,
  },
  replacement: null,
};
const commands = [
  { action: "oem_source", request_id: id(10), variant_id: id(1), copy, source },
  proposal,
  { action: "oem_submit", request_id: id(10), revision_id: id(3), revision: 2, digest },
  review,
  {
    ...review,
    status: "CONFIRMED",
    source_id: id(5),
    confirmation: { ...review.confirmation, arcfort_reference_confirmed: true },
  },
  {
    ...review,
    decision: "EDIT",
    status: null,
    source_id: null,
    confirmation: null,
    replacement: { copy, sources: [id(5)] },
  },
  { ...review, decision: "REJECT", status: null, source_id: null, confirmation: null },
];
function fixture(command: unknown = review) {
  const parsed = parseConsoleCommand(command);
  const state = {
    roles: ["owner"],
    signedIn: true,
    confirmed: true,
    error: "",
    calls: [] as { name: string; args: Record<string, unknown> }[],
    result: {
      revision_id: id(3),
      head_id: id(2),
      source_id: id(5),
      event_id: id(9),
      revision:
        parsed.action === "oem_propose" ||
        (parsed.action === "oem_review" && parsed.decision === "EDIT")
          ? parsed.revision + 1
          : 2,
      digest,
      raw_snapshot: "PRIVATE_SENTINEL",
      source_digest: "PRIVATE_SENTINEL",
    } as unknown,
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
          if (url.pathname.endsWith("console_user_roles"))
            return Response.json(state.roles.map((role) => ({ role })));
          state.calls.push({
            name: url.pathname.split("/").at(-1)!,
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
        data: {
          user: state.signedIn
            ? { id: id(20), email_confirmed_at: state.confirmed ? "2026-01-01" : null }
            : null,
        },
      }),
    },
  } as unknown as ConsoleClient;
  return { client, state };
}
test("seven OEM forms preserve exact designation and explicit reference versus confirmation", () => {
  for (const command of commands) assert.deepEqual(parseConsoleCommand(command), command);
  assert.deepEqual(
    parseConsoleCommand({ ...proposal, head_id: id(2), revision: 2, original_id: id(4) }),
    { ...proposal, head_id: id(2), revision: 2, original_id: id(4) },
  );
});
test("malformed OEM authority, identities, evidence classes, dates and acknowledgements fail closed", () => {
  for (const bad of [
    { ...proposal, extra: "CONFIRMED" },
    { ...proposal, original_id: "other" },
    { ...proposal, head_id: id(2), revision: 0 },
    { ...proposal, revision: 1 },
    { ...proposal, slot: 100 },
    { ...proposal, slot: -1 },
    { ...proposal, slot: 1.1 },
    { ...proposal, copy: { ...copy, manufacturer_name: " Synthetic" } },
    { ...proposal, copy: { ...copy, reference_number: "TEST\nONLY" } },
    { ...proposal, copy: { ...copy, reference_number: "a".repeat(101) } },
    { ...proposal, copy: { ...copy, verified: true } },
    { ...proposal, sources: [id(5), id(5).toUpperCase()] },
    { ...proposal, sources: [null] },
    { ...proposal, sources: Array.from({ length: 21 }, (_, n) => id(50 + n)) },
    { ...proposal, reason: " a " },
    ...[
      { source_level: "B" },
      { evidence_basis: "manufacturer_catalog" },
      { assertion: "confirmed" },
      { evidence_date: "2026-02-30" },
      { evidence_date: "2999-01-01" },
      { title: " " },
      { source_location: " page" },
      { reviewed_by: id(20) },
    ].map((override) => ({ ...commands[0], source: { ...source, ...override } })),
    { ...commands[2], revision: 0 },
    { ...commands[2], digest: "invalid" },
    { ...review, source_id: null },
    { ...review, status: "STANDARD_REFERENCE" },
    { ...review, confirmation: { ...review.confirmation, source_checked: false } },
    { ...review, confirmation: { ...review.confirmation, arcfort_reference_confirmed: true } },
    { ...review, replacement: { copy, sources: [] } },
    { ...commands[5], resolution: "unexpected approval" },
    { ...commands[5], replacement: { copy, sources: [], compatibility: "confirmed" } },
    { ...commands[6], status: "CONFIRMED" },
  ])
    assert.throws(() => parseConsoleCommand(bad), CommandInputError);
});
test("OEM opt-in is independent, default-off and confined to exact local working configuration", async () => {
  assert.ok(consoleOemEnabled(env));
  for (const override of [
    { CONSOLE_OEM_ENABLED: undefined },
    { CONSOLE_OEM_ENABLED: "TRUE" },
    { CONSOLE_WORKING_ENABLED: "false" },
    { CONSOLE_ENVIRONMENT: "staging" },
    { CONSOLE_ORIGIN: "http://localhost:3000" },
    { CONSOLE_SUPABASE_URL: "https://example.invalid" },
    { VERCEL: "1" },
    { CONSOLE_DEPLOYMENT: "access-tunnel" },
  ]) {
    const { client, state } = fixture();
    assert.equal((await executeConsoleCommand(client, review, { ...env, ...override })).ok, false);
    assert.equal(state.calls.length, 0);
  }
});
test("current roles distinguish intake, proposals, submission and human decision", async () => {
  for (const role of ["owner", "editor", "reviewer", "publisher", "viewer"] as const) {
    assert.equal(canRunConsoleCommand([role], "oem_review"), ["owner", "reviewer"].includes(role));
    assert.equal(canRunConsoleCommand([role], "oem_propose"), ["owner", "editor"].includes(role));
    for (const action of ["oem_source", "oem_submit"] as const)
      assert.equal(
        canRunConsoleCommand([role], action),
        ["owner", "editor", "reviewer"].includes(role),
      );
  }
  for (const stateChange of [
    { roles: [] },
    { roles: ["editor"] },
    { signedIn: false },
    { confirmed: false },
  ]) {
    const { client, state } = fixture();
    Object.assign(state, stateChange);
    assert.equal((await executeConsoleCommand(client, review, env)).ok, false);
    assert.equal(state.calls.length, 0);
  }
});
test("SDK sends exact public arguments and strips private provider data", async () => {
  const names = [
    "pi_add_oem_source",
    "pi_propose_oem_revision",
    "pi_submit_oem_revision",
    ...Array(4).fill("pi_review_oem_revision"),
  ];
  for (const [index, command] of commands.entries()) {
    const { client, state } = fixture(command);
    const result = await executeConsoleCommand(client, command, env);
    assert.ok(result.ok);
    assert.equal(state.calls[0].name, names[index]);
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL|source_digest|raw_snapshot/);
    const parsed = parseConsoleCommand(command),
      args = state.calls[0].args;
    assert.equal(args.request_uuid, id(10));
    if (parsed.action === "oem_source") {
      assert.equal(args.requested_reference, copy.reference_number);
      assert.deepEqual(args.source_copy, source);
    } else if (parsed.action === "oem_propose") {
      assert.deepEqual(args.reference_copy, copy);
      assert.deepEqual(args.source_uuids, [id(5)]);
      assert.equal(Object.hasOwn(args, "head_uuid"), false);
      assert.equal(Object.hasOwn(args, "original_uuid"), false);
    } else if (parsed.action === "oem_review") {
      assert.equal(args.approved_status, parsed.status);
      assert.equal(args.source_uuid, parsed.source_id);
      assert.deepEqual(args.confirmation, parsed.confirmation ?? {});
      assert.deepEqual(args.replacement, parsed.replacement);
    }
  }
  const command = { ...proposal, head_id: id(2), original_id: id(4), revision: 2 },
    { client, state } = fixture(command);
  assert.ok((await executeConsoleCommand(client, command, env)).ok);
  assert.equal(state.calls[0].args.head_uuid, id(2));
  assert.equal(state.calls[0].args.original_uuid, id(4));
});
test("OEM results require exact snapshot sequence and identity; provider errors never leak", async () => {
  for (const result of [
    null,
    [],
    {},
    { revision_id: id(3), head_id: id(2), event_id: id(9), revision: -1 },
    { revision_id: id(50), head_id: id(2), event_id: id(9), revision: 2 },
    { revision_id: id(3), head_id: id(2), event_id: id(9), revision: 3 },
  ]) {
    const { client, state } = fixture();
    state.result = result;
    assert.equal((await executeConsoleCommand(client, review, env)).ok, false);
  }
  for (const code of ["42501", "22023", "23505", "23514", "40001", "55000", "other"]) {
    const { client, state } = fixture();
    state.error = code;
    const result = await executeConsoleCommand(client, review, env);
    assert.equal(result.ok, false);
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL/);
  }
  const { client, state } = fixture();
  assert.ok((await executeConsoleCommand(client, review, env)).ok);
  state.roles = [];
  assert.equal((await executeConsoleCommand(client, review, env)).ok, false);
  assert.equal(state.calls.length, 1);
});
test("qualifying metadata never upgrades catalogs, contradictions, stale or secondary references", () => {
  const base = {
    kind: "company_record",
    level: "A",
    basis: "factory_record",
    assertion: "supports",
    current: true,
  };
  assert.ok(qualifyingOemSource(base, "CONFIRMED"));
  assert.equal(qualifyingOemSource(base, "OEM_REFERENCE"), false);
  for (const override of [
    { basis: "company_catalog" },
    { assertion: "reference_only" },
    { assertion: "contradicts" },
    { current: false },
    { kind: "secondary_reference", level: "D", basis: "secondary_reference" },
    { kind: "technical_standard", level: "C", basis: "standard_reference" },
  ])
    assert.equal(qualifyingOemSource({ ...base, ...override }, "CONFIRMED"), false);
  const official = {
    kind: "official_manufacturer",
    level: "B",
    basis: "manufacturer_catalog",
    assertion: "reference_only",
    current: true,
  };
  assert.ok(qualifyingOemSource(official, "OEM_REFERENCE"));
  assert.equal(qualifyingOemSource(official, "CONFIRMED"), false);
});
