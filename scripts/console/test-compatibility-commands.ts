import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { consoleCompatibilityEnabled } from "../../lib/console/working-config.ts";
import { canRunConsoleCommand, executeConsoleCommand } from "../../lib/console/commands.ts";
import { consoleRoles, type ConsoleRole } from "../../lib/console/access.ts";
import { CommandInputError, parseConsoleCommand } from "../../lib/domain/catalog/commands.ts";
import { compatibilityRelationshipTypes } from "../../lib/domain/catalog/compatibility.ts";

const id = "9b000000-0000-4000-8000-000000000001";
const targetId = "9b000000-0000-4000-8000-000000000002";
const digest = "a".repeat(64);
const local = {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_COMPATIBILITY_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_test_value",
};
const target = {
  subject_id: id,
  target_id: targetId,
  relationship_type: "product_to_torch",
  scope: "Standard assembly",
};
const source = {
  source_kind: "company_record",
  source_level: "A",
  title: "Synthetic drawing",
  source_reference: "TEST-R1",
  evidence_basis: "drawing",
  evidence_date: "2026-01-01",
  owner_name: "Synthetic custodian",
  revision_label: "TEST-1",
  source_location: "Callout 1",
  assertion: "supports",
};
const copy = { role: "Tip holder", confirmation_requirements: ["Exact assembly drawing"] };
const evidence = [{ source_id: id, role: "supporting" }];
const commands = [
  { action: "compatibility_entity", request_id: id, variant_id: id },
  { action: "compatibility_source", request_id: id, ...target, role: copy.role, source },
  {
    action: "compatibility_propose",
    request_id: id,
    ...target,
    root_id: id,
    revision: 2,
    copy,
    evidence,
    reason: "Synthetic proposal",
  },
  { action: "compatibility_submit", request_id: id, relationship_id: id, revision: 3, digest },
  {
    action: "compatibility_review",
    request_id: id,
    relationship_id: id,
    revision: 4,
    digest,
    decision: "APPROVE",
    reason: "Synthetic decision",
    resolution: "",
    replacement: null,
    evidence: null,
  },
];
const completeResult = {
  entity_id: id,
  product_variant_id: id,
  source_id: id,
  relationship_id: id,
  root_relationship_id: id,
  event_id: id,
  revision: 5,
  digest,
  raw_snapshot: "PRIVATE_SENTINEL",
  source_digest: "PRIVATE_SENTINEL",
};

function transport() {
  const state = {
    roles: ["owner"] as ConsoleRole[],
    signedIn: true,
    confirmed: true,
    roleError: false,
    authReads: 0,
    roleReads: 0,
    calls: [] as { name: string; args: unknown }[],
    data: completeResult as unknown,
    error: null as null | { code: string; message: string },
    fail: false,
  };
  const provider = createClient<Database>(
    local.CONSOLE_SUPABASE_URL,
    local.CONSOLE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (input, init) => {
          const url = new URL(String(input));
          if (url.pathname === "/rest/v1/console_user_roles") {
            state.roleReads++;
            assert.equal(url.searchParams.get("select"), "role");
            assert.equal(url.searchParams.get("user_id"), `eq.${id}`);
            assert.equal(url.searchParams.get("revoked_at"), "is.null");
            return Response.json(
              state.roleError
                ? { message: "PRIVATE_SENTINEL" }
                : state.roles.map((role) => ({ role })),
              { status: state.roleError ? 500 : 200 },
            );
          }
          assert.ok(url.pathname.startsWith("/rest/v1/rpc/pi_"));
          assert.equal(init?.method, "POST");
          state.calls.push({
            name: url.pathname.split("/").at(-1)!,
            args: JSON.parse(String(init?.body)),
          });
          if (state.fail) throw new Error("PRIVATE_SENTINEL");
          return Response.json(state.error ?? state.data, { status: state.error ? 400 : 200 });
        },
      },
    },
  );
  const client = {
    from: provider.from.bind(provider),
    rpc: provider.rpc.bind(provider),
    auth: {
      getUser: async () => {
        state.authReads++;
        return {
          error: null,
          data: {
            user: state.signedIn
              ? {
                  id,
                  email_confirmed_at: state.confirmed ? "2026-01-01" : null,
                  user_metadata: { role: "owner" },
                }
              : null,
          },
        };
      },
    },
  } as unknown as ConsoleClient;
  return { client, state };
}

test("compatibility needs its own flag and the exact complete local working boundary", async () => {
  assert.equal(consoleCompatibilityEnabled({}), false);
  assert.equal(consoleCompatibilityEnabled(local), true);
  for (const change of [
    { CONSOLE_COMPATIBILITY_ENABLED: undefined },
    { CONSOLE_COMPATIBILITY_ENABLED: "false" },
    { CONSOLE_WORKING_ENABLED: "false" },
    { CONSOLE_ENABLED: "false" },
    { CONSOLE_ENVIRONMENT: "staging" },
    { CONSOLE_ORIGIN: "http://localhost:3000" },
    { CONSOLE_ORIGIN: "http://127.0.0.1:3001" },
    { CONSOLE_SUPABASE_URL: "https://fdsvzuqixppsakukkrsf.supabase.co" },
    { CONSOLE_DEPLOYMENT: "access-tunnel" },
    { VERCEL: "1" },
    { PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE: "true" },
  ]) {
    const env = { ...local, ...change };
    assert.equal(consoleCompatibilityEnabled(env), false);
    const { client, state } = transport();
    for (const command of commands)
      assert.equal((await executeConsoleCommand(client, command, env)).ok, false);
    assert.equal(state.calls.length, 0);
  }
});

test("five exact contracts reject authority injection, wrong endpoints and invalid reference data", () => {
  const reject = (input: unknown) =>
    assert.throws(() => parseConsoleCommand(input), CommandInputError);
  for (const command of commands) {
    assert.deepEqual(parseConsoleCommand(command), command);
    for (const field of [
      "actor_id",
      "confirmed_by",
      "verification_status",
      "is_shadow",
      "raw_snapshot",
    ])
      reject({ ...command, [field]: "PRIVATE_SENTINEL" });
    reject({ ...command, request_id: "../../private" });
  }
  for (const relationship_type of compatibilityRelationshipTypes)
    assert.equal(
      parseConsoleCommand({ ...commands[1], relationship_type }).action,
      "compatibility_source",
    );
  for (const change of [
    { subject_id: "" },
    { target_id: id.toUpperCase() },
    { relationship_type: "torch_to_machine" },
    { scope: " " },
    { scope: " scope " },
    { scope: "x".repeat(201) },
  ])
    reject({ ...commands[1], ...change });
  for (const change of [
    { assertion: "CONFIRMED" },
    { evidence_basis: "appearance" },
    { source_kind: "secondary_reference" },
    { source_kind: "constructor" },
    { title: " title " },
    { source_reference: " " },
    { owner_name: "x".repeat(2001) },
    { evidence_date: "2026-02-30" },
    { evidence_date: "9999-01-01" },
    { source_location: null },
    { confirmed: true },
  ])
    reject({ ...commands[1], source: { ...source, ...change } });
  for (const assertion of ["supports", "contradicts", "catalog_grouping"])
    assert.equal(
      parseConsoleCommand({ ...commands[1], source: { ...source, assertion } }).action,
      "compatibility_source",
    );
  for (const change of [
    { root_id: undefined },
    { root_id: "bad" },
    { root_id: null, revision: 1 },
    { revision: Number.MAX_SAFE_INTEGER + 1 },
    { revision: -1 },
    { revision: "1" },
    { copy: { ...copy, role: " " } },
    { copy: { ...copy, confirmation_requirements: [] } },
    { copy: { ...copy, confirmation_requirements: [" "] } },
    { copy: { ...copy, confirmation_requirements: ["x".repeat(501)] } },
    { copy: { ...copy, confirmation_requirements: Array(21).fill("Drawing") } },
    { copy: { ...copy, verification_status: "CONFIRMED" } },
    { evidence: [...evidence, ...evidence] },
    { evidence: [{ source_id: id, role: "approved" }] },
    { reason: " a " },
  ])
    reject({ ...commands[2], ...change });
  assert.equal(
    parseConsoleCommand({ ...commands[2], root_id: null, revision: 0 }).action,
    "compatibility_propose",
  );
  for (const change of [{ digest: "A".repeat(64) }, { relationship_id: "bad" }, { revision: 1.5 }])
    reject({ ...commands[3], ...change });
  for (const change of [
    { decision: "PUBLISH" },
    { decision: ["APPROVE"] },
    { replacement: copy },
    { decision: "EDIT" },
    { resolution: "x".repeat(2001) },
    { reason: " " },
  ])
    reject({ ...commands[4], ...change });
  assert.equal(
    parseConsoleCommand({ ...commands[4], decision: "EDIT", replacement: copy, evidence }).action,
    "compatibility_review",
  );
  assert.equal(
    parseConsoleCommand({ ...commands[4], decision: "REJECT" }).action,
    "compatibility_review",
  );
});

test("compatibility role matrix matches the independent SQL command roles", () => {
  for (const role of consoleRoles)
    for (const command of commands) {
      const expected =
        role === "owner" ||
        (role === "editor" && command.action !== "compatibility_review") ||
        (role === "reviewer" &&
          ["compatibility_source", "compatibility_submit", "compatibility_review"].includes(
            command.action,
          ));
      assert.equal(
        canRunConsoleCommand([role], parseConsoleCommand(command).action),
        expected,
        `${role}/${command.action}`,
      );
    }
});

test("actual RPC transport preserves directed bindings, nullable new roots and minimal receipts", async () => {
  const { client, state } = transport();
  const expected = [
    ["pi_ensure_product_compatibility_entity", { request_uuid: id, variant_uuid: id }],
    [
      "pi_add_compatibility_source",
      {
        request_uuid: id,
        subject_uuid: id,
        target_uuid: targetId,
        relation_type: target.relationship_type,
        scope_label: target.scope,
        asserted_role: copy.role,
        source_copy: source,
      },
    ],
    [
      "pi_propose_compatibility_revision",
      {
        request_uuid: id,
        root_uuid: id,
        subject_uuid: id,
        target_uuid: targetId,
        relation_type: target.relationship_type,
        scope_label: target.scope,
        expected_revision: 2,
        relation_copy: copy,
        evidence_links: evidence,
        proposal_reason: "Synthetic proposal",
      },
    ],
    [
      "pi_submit_compatibility_review",
      { request_uuid: id, relationship_uuid: id, expected_revision: 3, expected_digest: digest },
    ],
    [
      "pi_review_compatibility_revision",
      {
        request_uuid: id,
        relationship_uuid: id,
        expected_revision: 4,
        expected_digest: digest,
        decision: "APPROVE",
        review_reason: "Synthetic decision",
        conflict_resolution: "",
        replacement_copy: null,
        replacement_evidence: null,
      },
    ],
  ];
  const results = [
    { entity_id: id, product_variant_id: id },
    { source_id: id },
    { relationship_id: id, root_relationship_id: id, revision: 5, digest },
    { relationship_id: id, revision: 5, digest },
    { relationship_id: id, revision: 5, event_id: id },
  ];
  for (let index = 0; index < commands.length; index++) {
    assert.deepEqual(await executeConsoleCommand(client, commands[index], local), {
      ok: true,
      result: results[index],
    });
    assert.deepEqual(state.calls[index], { name: expected[index][0], args: expected[index][1] });
  }
  assert.equal(state.authReads, 5);
  assert.equal(state.roleReads, 5);
  assert.equal(
    (await executeConsoleCommand(client, { ...commands[0], variant_id: id.toUpperCase() }, local))
      .ok,
    true,
  );
  assert.equal(
    (await executeConsoleCommand(client, { ...commands[2], root_id: null, revision: 0 }, local)).ok,
    true,
  );
  assert.equal(Object.hasOwn(state.calls.at(-1)!.args as object, "root_uuid"), false);
  assert.deepEqual(
    await executeConsoleCommand(
      client,
      { ...commands[4], decision: "EDIT", replacement: copy, evidence },
      local,
    ),
    {
      ok: true,
      result: { relationship_id: id, root_relationship_id: id, event_id: id, revision: 5, digest },
    },
  );
});

test("current identity and roles are rechecked before every compatibility retry", async () => {
  const { client, state } = transport();
  assert.equal((await executeConsoleCommand(client, commands[4], local)).ok, true);
  for (const roles of [[], ["viewer"], ["publisher"], ["editor"]] as ConsoleRole[][]) {
    state.roles = roles;
    assert.equal((await executeConsoleCommand(client, commands[4], local)).ok, false);
  }
  state.roles = ["owner"];
  state.signedIn = false;
  assert.equal((await executeConsoleCommand(client, commands[4], local)).ok, false);
  state.signedIn = true;
  state.confirmed = false;
  assert.equal((await executeConsoleCommand(client, commands[4], local)).ok, false);
  state.confirmed = true;
  state.roleError = true;
  assert.equal((await executeConsoleCommand(client, commands[4], local)).ok, false);
  assert.equal(state.calls.length, 1);
});

test("wrong identity, malformed receipts and provider details fail closed without private output", async () => {
  const { client, state } = transport();
  for (const command of commands) {
    for (const data of [
      null,
      [],
      {},
      { ...completeResult, entity_id: "bad", source_id: "bad", relationship_id: "bad" },
    ]) {
      state.data = data;
      assert.equal((await executeConsoleCommand(client, command, local)).ok, false);
    }
    state.data = completeResult;
    for (const code of ["42501", "22023", "23514", "40001", "55000", "XX000"]) {
      state.error = { code, message: "PRIVATE_SENTINEL" };
      const result = await executeConsoleCommand(client, command, local);
      assert.equal(result.ok, false);
      assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL/);
    }
    state.error = null;
  }
  state.data = { ...completeResult, product_variant_id: targetId };
  assert.equal((await executeConsoleCommand(client, commands[0], local)).ok, false);
  for (const data of [
    { ...completeResult, revision: -1 },
    { ...completeResult, digest: "bad" },
    { ...completeResult, root_relationship_id: "bad" },
  ]) {
    state.data = data;
    assert.equal((await executeConsoleCommand(client, commands[2], local)).ok, false);
  }
  state.fail = true;
  const result = await executeConsoleCommand(client, commands[3], local);
  assert.equal(result.ok, false);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL/);
});
