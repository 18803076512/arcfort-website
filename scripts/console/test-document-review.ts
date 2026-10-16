import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { executeConsoleCommand } from "../../lib/console/commands.ts";
import { parseConsoleCommand } from "../../lib/domain/catalog/commands.ts";
import { parseDocumentReview, readDocumentReview } from "../../lib/console/document-review.ts";
import {
  documentObservationParts,
  validDocumentSource,
} from "../../lib/domain/catalog/document-review.ts";
import { documentId as id, documentEnv } from "./document-fixture.ts";
import { documentReviewRaw, documentReviewFixture } from "./document-review-fixture.ts";
const env = { ...documentEnv, CONSOLE_DOCUMENT_REVIEW_ENABLED: "true" };
const raw = documentReviewRaw();
test("unconfirmed review fixture has no contradiction or invented conflict resolution", () => {
  const data = documentReviewFixture({ state: "unconfirmed" });
  assert.equal(data.latest?.verification_status, "NEEDS_FACTORY_CONFIRMATION");
  assert.equal(data.latest?.resolution, null);
  assert.equal(data.latest?.decision, null);
  assert.equal(data.sources.total, 2);
  assert.ok(data.sources.items.every((source) => source.assertion === "supports"));
});
const source = Object.fromEntries(
  Object.entries(raw.sources.items[0]).filter(
    ([field]) => !["source_id", "dimension", "current", "qualifies", "created_at"].includes(field),
  ),
);
const target = { candidate_id: id(201), revision: 1, digest: "b".repeat(64) };
const token = [
  "document-v1",
  id(900),
  id(20),
  id(901),
  id(201),
  id(103),
  id(1),
  "1",
  "b".repeat(64),
  "a".repeat(64),
  "c".repeat(64),
  "1700000000",
  "1700000300",
  id(902),
  "d".repeat(64),
].join("|");
const commands = [
  {
    action: "document_source",
    variant_id: id(1),
    document_id: id(103),
    dimension: "usage_rights",
    source,
  },
  {
    action: "document_propose",
    variant_id: id(1),
    document_id: id(103),
    revision: 0,
    copy: { scope_note: "Synthetic scope", sources: [id(300), id(301)] },
    reason: "Synthetic proposal",
  },
  { action: "document_submit", ...target },
  {
    action: "document_review",
    ...target,
    decision: "APPROVE",
    reason: "Synthetic approval",
    resolution: "Synthetic conflict resolution",
    confirmation: {
      original_digest: "a".repeat(64),
      original_inspected: true,
      usage_rights_confirmed: true,
      exact_scope_confirmed: true,
    },
    rights_source_id: id(300),
    scope_source_id: id(301),
    observation: token,
    replacement: null,
  },
  ...["EDIT", "REJECT"].map((decision) => ({
    action: "document_review",
    ...target,
    decision,
    reason: "Synthetic decision",
    resolution: "",
    confirmation: null,
    rights_source_id: null,
    scope_source_id: null,
    observation: null,
    replacement:
      decision === "EDIT" ? { scope_note: "Changed synthetic scope", sources: [id(300)] } : null,
  })),
].map((value) => ({ ...value, request_id: id(10) }));
function fixture() {
  const state = {
    roles: ["owner"],
    signedIn: true,
    actor: id(20),
    calls: [] as { name: string; args: Record<string, unknown> }[],
    receipt: null as unknown,
    data: structuredClone(raw) as unknown,
    second: null as unknown,
    reads: 0,
    roleReads: 0,
    revoke: false,
    error: "",
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
          const name = url.pathname.split("/").at(-1)!;
          if (name === "console_user_roles") {
            state.roleReads++;
            return Response.json(
              state.revoke && state.roleReads > 1 ? [] : state.roles.map((role) => ({ role })),
            );
          }
          const args = JSON.parse(String(init?.body));
          state.calls.push({ name, args });
          if (state.error)
            return Response.json(
              { code: state.error, message: "PRIVATE_SENTINEL" },
              { status: 400 },
            );
          if (name === "pi_read_document_review") {
            state.reads++;
            return Response.json(
              state.reads > 1 && state.second !== null ? state.second : state.data,
            );
          }
          return Response.json(
            state.receipt ??
              (name === "pi_add_document_source"
                ? { source_id: id(300), source_digest: "PRIVATE_SENTINEL" }
                : {
                    candidate_id: args.decision === "EDIT" ? id(202) : id(201),
                    document_id: id(103),
                    event_id: id(400),
                    revision: args.decision === "EDIT" ? 2 : 1,
                    digest: "b".repeat(64),
                    private: "PRIVATE_SENTINEL",
                  }),
          );
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
          user: state.signedIn ? { id: state.actor, email_confirmed_at: "2026-01-01" } : null,
        },
      }),
    },
  } as unknown as ConsoleClient;
  return { client, state };
}
test("document commands: all operations, unknown metadata and exact classification", () => {
  for (const command of commands) assert.deepEqual(parseConsoleCommand(command), command);
  assert.equal(
    validDocumentSource({ ...source, evidence_date: null, revision_label: null }, "usage_rights"),
    true,
  );
  for (const patch of [
    { evidence_date: "0000-01-01" },
    { evidence_date: "2026-02-30" },
    { evidence_date: "9999-01-01" },
    { evidence_date: "" },
    { revision_label: "" },
    { title: "\n" },
    { title: "x".repeat(501) },
    { scope_note: " x" },
    { source_level: "B" },
    { evidence_basis: "controlled_drawing" },
    { approved: true },
    { assertion: "confirmed" },
  ])
    assert.throws(() => parseConsoleCommand({ ...commands[0], source: { ...source, ...patch } }));
  for (const command of commands)
    assert.throws(() => parseConsoleCommand({ ...command, actor_id: id(20) }));
  for (const revision of [-1, 0, 1.5, 1e15])
    assert.throws(() => parseConsoleCommand({ ...commands[2], revision }));
  for (const sources of [
    [id(300), id(300)],
    ["bad"],
    Array.from({ length: 21 }, (_, n) => id(500 + n)),
  ])
    assert.throws(() =>
      parseConsoleCommand({ ...commands[1], copy: { scope_note: "Synthetic", sources } }),
    );
});
test("document commands: explicit declarations and bound tokens; historical expiry remains SQL-owned", () => {
  assert.ok(documentObservationParts(token));
  for (const observation of [
    null,
    "unsigned",
    token.replace("document-v1", "v1"),
    token.replace(id(201), id(999)),
    token + "|extra",
  ])
    assert.throws(() => parseConsoleCommand({ ...commands[3], observation }));
  for (const patch of [
    { confirmation: null },
    { confirmation: {} },
    { scope_source_id: id(300) },
    { replacement: {} },
  ])
    assert.throws(() => parseConsoleCommand({ ...commands[3], ...patch }));
  for (const command of commands.slice(4))
    for (const patch of [
      { observation: token },
      { confirmation: "confirmation" in commands[3] ? commands[3].confirmation : null },
      { resolution: "not allowed" },
    ])
      assert.throws(() => parseConsoleCommand({ ...command, ...patch }));
});
test("document commands: roles and independent default-off exact-local flag", async () => {
  for (const role of ["owner", "editor", "reviewer", "viewer", "publisher"])
    for (const command of commands) {
      const { client, state } = fixture();
      state.roles = [role];
      const allowed =
        role === "owner" ||
        (role === "editor" && command.action !== "document_review") ||
        (role === "reviewer" && command.action !== "document_propose");
      assert.equal(
        (await executeConsoleCommand(client, command, env)).ok,
        allowed,
        `${role}: ${command.action}`,
      );
      assert.equal(state.calls.length, allowed ? 1 : 0);
    }
  for (const change of [
    { CONSOLE_DOCUMENT_REVIEW_ENABLED: "false" },
    { CONSOLE_DOCUMENTS_ENABLED: "false" },
    { CONSOLE_ENVIRONMENT: "staging" },
    { CONSOLE_SUPABASE_URL: "https://example.invalid" },
  ]) {
    const { client, state } = fixture();
    assert.equal(
      (await executeConsoleCommand(client, commands[0], { ...env, ...change })).ok,
      false,
    );
    assert.equal(state.calls.length, 0);
  }
});
test("document commands: RPC mapping, exact response identities and private-error sanitization", async () => {
  const names = [
    "pi_add_document_source",
    "pi_propose_document_review",
    "pi_submit_document_review",
    "pi_review_document",
    "pi_review_document",
    "pi_review_document",
  ];
  for (const [index, command] of commands.entries()) {
    const { client, state } = fixture();
    const result = await executeConsoleCommand(client, command, env);
    assert.equal(result.ok, true);
    assert.equal(state.calls[0].name, names[index]);
    assert.equal(state.calls[0].args.request_uuid, id(10));
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL|source_digest|observation/);
    if (index === 3) {
      assert.equal(state.calls[0].args.observation_token, token);
      assert.equal(state.calls[0].args.scope_source_uuid, id(301));
    }
  }
  for (const receipt of [
    {},
    { candidate_id: id(999), document_id: id(103), revision: 1, digest: "b".repeat(64) },
    { candidate_id: id(201), document_id: id(103), revision: 0, digest: "b".repeat(64) },
    { candidate_id: id(201), document_id: id(103), revision: 1, digest: "a".repeat(64) },
  ]) {
    const { client, state } = fixture();
    state.receipt = receipt;
    assert.equal((await executeConsoleCommand(client, commands[2], env)).ok, false);
  }
  const { client, state } = fixture();
  state.error = "private_failure";
  assert.doesNotMatch(
    JSON.stringify(await executeConsoleCommand(client, commands[0], env)),
    /PRIVATE_SENTINEL|private_failure/,
  );
});
test("document projection: human validity AND observation, with separately visible open successors", () => {
  assert.equal(documentReviewFixture({ state: "approved" }).reviewed, true);
  assert.equal(documentReviewFixture({ state: "approved", unsigned: "1" }).reviewed, false);
  const next = documentReviewFixture({ state: "successor" });
  assert.equal(next.current?.human_valid, true);
  assert.equal(next.current?.observed, true);
  assert.equal(next.open, true);
  assert.equal(next.reviewed, false);
  assert.equal(documentReviewFixture({ state: "stale" }).originalCurrent, false);
  assert.equal(documentReviewFixture({ state: "missing" }).latest, null);
  const paged = documentReviewFixture({ many: "1", source_page: "2", history_page: "2" });
  assert.equal(paged.sources.items.length, 3);
  assert.equal(paged.history.items.length, 5);
  assert.equal(paged.latest?.revision, 30);
});
test("document projection: malformed, truncated, duplicate and inconsistent snapshot refusal", () => {
  const multiplePending = documentReviewRaw({ many: "1" });
  multiplePending.history.items[1].submitted = true;
  assert.throws(() => parseDocumentReview(multiplePending, id(1), id(103), 1, 1));
  for (const mutate of [
    (v: typeof raw) => {
      v.sources.total++;
    },
    (v: typeof raw) => {
      v.history.total++;
    },
    (v: typeof raw) => {
      v.latest!.revision = 2;
    },
    (v: typeof raw) => {
      v.document.variant_id = id(2);
    },
    (v: typeof raw) => {
      v.document.document_id = id(9);
    },
    (v: typeof raw) => {
      v.selected_sources.pop();
    },
    (v: typeof raw) => {
      v.selected_sources[0] = v.selected_sources[1];
    },
    (v: typeof raw) => {
      v.latest!.observed = true;
    },
    (v: typeof raw) => {
      v.latest!.evidence_digest = "e".repeat(64);
    },
    (v: typeof raw) => {
      v.original_current = false;
    },
    (v: typeof raw) => {
      v.sources.items[2].qualifies = true;
    },
  ]) {
    const changed = structuredClone(raw);
    mutate(changed);
    assert.throws(() => parseDocumentReview(changed, id(1), id(103), 1, 1));
  }
  const safe = parseDocumentReview(
    {
      ...raw,
      storage_path: "PRIVATE_SENTINEL",
      document: { ...raw.document, raw_snapshot: "PRIVATE_SENTINEL" },
    },
    id(1),
    id(103),
    1,
    1,
  );
  assert.doesNotMatch(JSON.stringify(safe), /PRIVATE_SENTINEL/);
});
test("document reads: exact scoped double read, current role recheck and drift denial", async () => {
  const { client, state } = fixture();
  const result = await readDocumentReview(client, id(1), id(103), 1, 1, env);
  assert.equal(result?.canReview, true);
  assert.equal(state.reads, 2);
  assert.deepEqual(state.calls[0].args, {
    variant_uuid: id(1),
    document_uuid: id(103),
    source_page: 1,
    history_page: 1,
  });
  for (const action of ["revoked", "drift", "missing", "provider"]) {
    const fixtureState = fixture();
    if (action === "revoked") fixtureState.state.revoke = true;
    if (action === "drift") fixtureState.state.second = documentReviewRaw({ state: "draft" });
    if (action === "missing") fixtureState.state.signedIn = false;
    if (action === "provider") fixtureState.state.error = "private_failure";
    await assert.rejects(readDocumentReview(fixtureState.client, id(1), id(103), 1, 1, env));
  }
  const denied = fixture();
  await assert.rejects(readDocumentReview(denied.client, id(1), id(103), 1, 1, documentEnv));
  assert.equal(denied.state.calls.length, 0);
});
