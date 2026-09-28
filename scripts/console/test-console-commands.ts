import assert from "node:assert/strict";
import { test } from "node:test";
import { consoleWorkingEnabled } from "../../lib/console/working-config.ts";
import {
  canRunConsoleCommand,
  executeConsoleCommand,
  isConsoleCommandOrigin,
  readConsoleCommand,
} from "../../lib/console/commands.ts";
import { CommandInputError, parseConsoleCommand } from "../../lib/domain/catalog/commands.ts";
import { consoleRoles, type ConsoleRole } from "../../lib/console/access.ts";
import { isConsoleOrigin } from "../../lib/console/security.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";

const id = "10000000-0000-4000-8000-000000000001";
const sourceId = "10000000-0000-4000-8000-000000000002";
const digest = "a".repeat(64);
const copy = {
  name_en: "Synthetic draft",
  name_zh: "",
  model: "",
  summary: "",
  description: "",
  applications: "",
};
const identity = {
  sku: "AF-MIG-QA-9999",
  slug: "synthetic-draft",
  source_reference: "Synthetic test fixture",
};
const source = {
  source_kind: "company_record",
  source_level: "A",
  title: "Synthetic record",
  source_reference: "QA fixture",
  evidence_basis: "drawing",
  evidence_date: "2026-01-01",
  owner_name: "Synthetic custodian",
  revision_label: "QA-1",
  source_location: "Callout 1",
  asserted_value: "12",
  asserted_unit: "mm",
};
const target = { variant_id: id, field_id: id, scope: "connection side A" };
const value = { value_text: "12", unit: "mm" };
const evidence = [{ source_id: sourceId, role: "supporting" }];
const common = { request_id: id };
const commands = [
  { ...common, action: "create", identity, copy },
  { ...common, action: "save", variant_id: id, revision: 1, copy },
  { ...common, action: "source", ...target, source },
  {
    ...common,
    action: "propose",
    ...target,
    revision: 1,
    value,
    evidence,
    reason: "Synthetic revision",
  },
  { ...common, action: "submit", value_id: id, revision: 2, digest },
  {
    ...common,
    action: "review",
    value_id: id,
    revision: 3,
    digest,
    decision: "APPROVE",
    reason: "Synthetic decision",
    resolution: "",
    replacement: null,
    evidence: null,
  },
];
const local = {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_test_value",
};

test("working mode is disabled unless the complete isolated destination matches", () => {
  assert.equal(consoleWorkingEnabled({}), false);
  assert.equal(consoleWorkingEnabled(local), true);
  for (const override of [
    { CONSOLE_WORKING_ENABLED: "false" },
    { CONSOLE_ENABLED: "false" },
    { CONSOLE_ENVIRONMENT: "staging" },
    { CONSOLE_SUPABASE_URL: "https://fdsvzuqixppsakukkrsf.supabase.co" },
    { CONSOLE_ORIGIN: "http://localhost:3000" },
    { CONSOLE_ORIGIN: "http://127.0.0.1:3001" },
    { CONSOLE_DEPLOYMENT: "access-tunnel" },
    { VERCEL: "1" },
    { VERCEL_ENV: "preview" },
    { PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE: "true" },
    { PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY: "synthetic" },
    { CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_synthetic" },
  ])
    assert.equal(
      consoleWorkingEnabled({ ...local, ...override }),
      false,
      JSON.stringify(Object.keys(override)),
    );
});

test("JSON CSRF guard requires the custom header and opaque browser metadata; native guard is unchanged", () => {
  const exact = new Headers({
    host: "127.0.0.1:3000",
    origin: local.CONSOLE_ORIGIN,
    "x-console-command": "1",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
  });
  const opaque = new Headers(exact);
  opaque.set("origin", "null");
  assert.equal(isConsoleCommandOrigin(exact, local.CONSOLE_ORIGIN), true);
  assert.equal(isConsoleCommandOrigin(opaque, local.CONSOLE_ORIGIN), true);
  assert.equal(isConsoleOrigin(opaque, local.CONSOLE_ORIGIN, true), false);
  for (const [key, bad] of Object.entries({
    host: "localhost:3000",
    origin: "https://attacker.invalid",
    "x-console-command": "0",
    "sec-fetch-site": "same-site",
    "sec-fetch-mode": "navigate",
    "sec-fetch-dest": "document",
  })) {
    const headers = new Headers(opaque);
    headers.set(key, bad);
    assert.equal(isConsoleCommandOrigin(headers, local.CONSOLE_ORIGIN), false, key);
  }
  for (const key of [...opaque.keys()]) {
    const headers = new Headers(opaque);
    headers.delete(key);
    assert.equal(isConsoleCommandOrigin(headers, local.CONSOLE_ORIGIN), false, `missing ${key}`);
  }
  for (const site of ["cross-site", "same-site", "none"]) {
    const headers = new Headers(exact);
    headers.set("sec-fetch-site", site);
    assert.equal(isConsoleCommandOrigin(headers, local.CONSOLE_ORIGIN), false);
  }
});

test("body parsing is JSON-only, UTF-8 strict and byte bounded even without Content-Length", async () => {
  const request = (body: BodyInit, type = "application/json") =>
    new Request("http://127.0.0.1:3000/console/commands", {
      method: "POST",
      headers: { "content-type": type },
      body,
    });
  assert.deepEqual(
    await readConsoleCommand(
      request(JSON.stringify(commands[0]), "application/json; charset=utf-8"),
    ),
    commands[0],
  );
  for (const body of ["", "{", " ".repeat(131073), '"' + "x".repeat(131071) + '"'])
    await assert.rejects(readConsoleCommand(request(body)), CommandInputError);
  await assert.rejects(readConsoleCommand(request("{}", "text/plain")), CommandInputError);
  await assert.rejects(
    readConsoleCommand(request(new Uint8Array([0xff, 0xfe]))),
    CommandInputError,
  );
  await assert.rejects(readConsoleCommand(new Request("http://127.0.0.1")), CommandInputError);
  assert.equal(
    ((await readConsoleCommand(request('"' + "x".repeat(131070) + '"'))) as string).length,
    131070,
  );
});

test("six command contracts accept exact typed inputs and reject authority/status injection", () => {
  for (const command of commands) {
    assert.deepEqual(parseConsoleCommand(command), command);
    for (const field of [
      "actor_id",
      "confirmed_by",
      "verification_status",
      "is_shadow",
      "lifecycle_status",
      "raw_snapshot",
    ])
      assert.throws(
        () => parseConsoleCommand({ ...command, [field]: "forged" }),
        CommandInputError,
      );
    assert.throws(
      () => parseConsoleCommand({ ...command, request_id: "../../private" }),
      CommandInputError,
    );
  }
  const reject = (item: unknown) =>
    assert.throws(() => parseConsoleCommand(item), CommandInputError);
  for (const invalid of [null, [], {}, "create"]) reject(invalid);
  reject({ ...commands[0], identity: { ...identity, sku: "AF-TIG-QA-9999" } });
  reject({ ...commands[0], identity: { ...identity, slug: "../private" } });
  reject({ ...commands[0], copy: { ...copy, name_en: " " } });
  reject({ ...commands[0], copy: { ...copy, description: "x".repeat(10001) } });
  for (const revision of [-1, 1.5, "1", Number.MAX_SAFE_INTEGER + 1])
    reject({ ...commands[1], revision });
  for (const date of ["2026-02-30", "9999-01-01", "2026-1-1", ""])
    reject({ ...commands[2], source: { ...source, evidence_date: date } });
  reject({ ...commands[2], source: { ...source, source_kind: "secondary_reference" } });
  reject({ ...commands[2], source: { ...source, confirmed: true } });
  reject({ ...commands[3], scope: " side " });
  reject({ ...commands[3], value: { ...value, verification_status: "CONFIRMED" } });
  reject({ ...commands[3], value: { ...value, value_text: " " } });
  reject({ ...commands[3], reason: " a " });
  reject({ ...commands[3], evidence: [...evidence, ...evidence] });
  reject({ ...commands[3], evidence: [{ source_id: sourceId, role: "approved" }] });
  reject({
    ...commands[3],
    evidence: Array.from({ length: 21 }, (_, i) => ({
      source_id: `20000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      role: "supporting",
    })),
  });
  for (const hash of ["A".repeat(64), "a".repeat(63), null])
    reject({ ...commands[4], digest: hash });
  reject({ ...commands[5], decision: "EDIT" });
  reject({ ...commands[5], replacement: value });
  assert.equal(parseConsoleCommand({ ...commands[5], decision: "REJECT" }).action, "review");
  assert.equal(
    parseConsoleCommand({ ...commands[5], decision: "EDIT", replacement: value, evidence }).action,
    "review",
  );
});

test("role matrix never grants editorial or review powers to publisher/viewer", () => {
  for (const role of consoleRoles)
    for (const command of commands) {
      const expected =
        role === "owner" ||
        (role === "editor" && command.action !== "review") ||
        (role === "reviewer" && ["review", "submit", "source"].includes(command.action));
      assert.equal(
        canRunConsoleCommand([role], parseConsoleCommand(command).action),
        expected,
        `${role}/${command.action}`,
      );
    }
});

function fakeClient() {
  const state = {
    roles: ["owner"] as ConsoleRole[],
    auth: true,
    confirmed: true,
    roleError: false,
    authReads: 0,
    roleReads: 0,
    calls: [] as { name: string; args: unknown }[],
    response: {
      data: {
        variant_id: id,
        value_id: id,
        root_value_id: id,
        source_id: sourceId,
        event_id: id,
        revision: 4,
        digest,
        raw_snapshot: "PRIVATE_SENTINEL",
        source_digest: "PRIVATE_SENTINEL",
      } as unknown,
      error: null as null | { code: string; message: string },
    },
    throws: false,
  };
  const client = {
    auth: {
      getUser: async () => {
        state.authReads++;
        return {
          error: null,
          data: {
            user: state.auth
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
    from: (table: string) => {
      assert.equal(table, "console_user_roles");
      return {
        select: (columns: string) => {
          assert.equal(columns, "role");
          return {
            eq: (key: string, actor: string) => {
              assert.equal(key, "user_id");
              assert.equal(actor, id);
              return {
                is: async (key: string, val: null) => {
                  assert.equal(key, "revoked_at");
                  assert.equal(val, null);
                  state.roleReads++;
                  return {
                    data: state.roles.map((role) => ({ role })),
                    error: state.roleError ? {} : null,
                  };
                },
              };
            },
          };
        },
      };
    },
    rpc: async (name: string, args: unknown) => {
      state.calls.push({ name, args });
      if (state.throws) throw new Error("PRIVATE_SENTINEL");
      return state.response;
    },
  } as unknown as ConsoleClient;
  return { client, state };
}

test("typed RPC argument mapping and minimal results preserve exact subject/revision bindings", async () => {
  const { client, state } = fakeClient();
  const expected = [
    ["pi_create_product_draft", { request_uuid: id, identity, draft_copy: copy }],
    [
      "pi_save_product_draft",
      { request_uuid: id, variant_uuid: id, expected_revision: 1, draft_copy: copy },
    ],
    [
      "pi_add_technical_source",
      {
        request_uuid: id,
        variant_uuid: id,
        field_uuid: id,
        scope_label: target.scope,
        source_copy: source,
      },
    ],
    [
      "pi_propose_technical_revision",
      {
        request_uuid: id,
        variant_uuid: id,
        field_uuid: id,
        scope_label: target.scope,
        expected_revision: 1,
        value_copy: value,
        evidence_links: evidence,
        proposal_reason: "Synthetic revision",
      },
    ],
    [
      "pi_submit_technical_review",
      { request_uuid: id, value_uuid: id, expected_revision: 2, expected_digest: digest },
    ],
    [
      "pi_review_technical_revision",
      {
        request_uuid: id,
        value_uuid: id,
        expected_revision: 3,
        expected_digest: digest,
        decision: "APPROVE",
        review_reason: "Synthetic decision",
        conflict_resolution: "",
        replacement_value: null,
        replacement_evidence: null,
      },
    ],
  ];
  const results = [
    { variant_id: id, revision: 4 },
    { variant_id: id, revision: 4 },
    { source_id: sourceId },
    { value_id: id, root_value_id: id, revision: 4, digest },
    { value_id: id, revision: 4, digest },
    { value_id: id, event_id: id, revision: 4 },
  ];
  for (let i = 0; i < commands.length; i++) {
    assert.deepEqual(await executeConsoleCommand(client, commands[i]), {
      ok: true,
      result: results[i],
    });
    assert.deepEqual(state.calls[i], { name: expected[i][0], args: expected[i][1] });
  }
  assert.equal(state.authReads, 6);
  assert.equal(state.roleReads, 6);
  const edit = await executeConsoleCommand(client, {
    ...commands[5],
    decision: "EDIT",
    replacement: value,
    evidence,
  });
  assert.deepEqual(edit, {
    ok: true,
    result: { value_id: id, root_value_id: id, event_id: id, revision: 4, digest },
  });
});

test("current role and verified identity are rechecked on every call, including retries", async () => {
  const { client, state } = fakeClient();
  assert.equal((await executeConsoleCommand(client, commands[0])).ok, true);
  for (const roles of [[], ["viewer"], ["publisher"], ["reviewer"]] as ConsoleRole[][]) {
    state.roles = roles;
    assert.equal((await executeConsoleCommand(client, commands[0])).ok, false);
  }
  state.roles = ["owner"];
  state.auth = false;
  assert.equal((await executeConsoleCommand(client, commands[0])).ok, false);
  state.auth = true;
  state.confirmed = false;
  assert.equal((await executeConsoleCommand(client, commands[0])).ok, false);
  state.confirmed = true;
  state.roleError = true;
  assert.equal((await executeConsoleCommand(client, commands[0])).ok, false);
  state.roleError = false;
  state.roles = ["editor"];
  assert.equal((await executeConsoleCommand(client, commands[5])).ok, false);
  assert.equal(state.calls.length, 1);
});

test("malformed results, SQL errors and input keys never expose private payloads", async () => {
  const { client, state } = fakeClient();
  for (const code of ["42501", "22023", "23505", "23514", "40001", "55000", "XX000"]) {
    state.response.error = { code, message: "PRIVATE_SENTINEL" };
    const result = await executeConsoleCommand(client, commands[0]);
    assert.equal(result.ok, false);
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL/);
  }
  state.response.error = null;
  for (const data of [
    null,
    [],
    {},
    { variant_id: id },
    { variant_id: "PRIVATE_SENTINEL", revision: 1 },
    { variant_id: id, revision: -1 },
  ]) {
    state.response.data = data;
    assert.equal((await executeConsoleCommand(client, commands[0])).ok, false);
  }
  state.response.data = {
    variant_id: id,
    revision: 2,
    event_id: "PRIVATE_SENTINEL",
    digest: "PRIVATE_SENTINEL",
  };
  assert.deepEqual(await executeConsoleCommand(client, commands[0]), {
    ok: true,
    result: { variant_id: id, revision: 2 },
  });
  state.response.data = {
    value_id: id,
    root_value_id: id,
    revision: 1,
    digest: "PRIVATE_SENTINEL",
  };
  assert.equal((await executeConsoleCommand(client, commands[3])).ok, false);
  const invalid = await executeConsoleCommand(client, {
    ...commands[0],
    copy: { ...copy, PRIVATE_SENTINEL: "anything" },
  });
  assert.doesNotMatch(JSON.stringify(invalid), /PRIVATE_SENTINEL/);
  state.throws = true;
  assert.equal((await executeConsoleCommand(client, commands[0])).ok, false);
});
