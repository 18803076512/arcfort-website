import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { executeConsoleCommand } from "../../lib/console/commands.ts";
import { parseConsoleCommand } from "../../lib/domain/catalog/commands.ts";
import { validDocumentCopy, documentSources } from "../../lib/domain/catalog/documents.ts";
import { readDocumentLibrary, parseDocumentPage } from "../../lib/console/documents.ts";
import { documentId as id, documentEnv as env, documentFixture } from "./document-fixture.ts";
const sample = documentFixture().items[0];
const copy = Object.fromEntries(
  [
    "title",
    "document_type",
    "source_kind",
    "source_level",
    "owner_name",
    "source_reference",
    "source_location",
    "scope_note",
    "revision_label",
    "issued_date",
  ].map((k) => [k, sample[k as keyof typeof sample]]),
);
const command = {
  action: "document_reference",
  request_id: id(10),
  variant_id: id(1),
  prior_document_id: null,
  copy,
};
function fixture() {
  const state = {
    roles: ["owner"],
    signedIn: true,
    confirmed: true,
    error: "",
    calls: [] as { name: string; args: unknown }[],
    working: [{ product_variant_id: id(1) }] as unknown,
    page: { total: 4, items: documentFixture().items } as unknown,
    receipt: {
      document_id: id(100),
      link_id: id(101),
      document_digest: "PRIVATE_SENTINEL",
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
          const name = url.pathname.split("/").at(-1)!;
          if (name === "console_user_roles")
            return Response.json(state.roles.map((role) => ({ role })));
          state.calls.push({ name, args: init?.body ? JSON.parse(String(init.body)) : null });
          if (state.error)
            return Response.json(
              { code: state.error, message: "PRIVATE_SENTINEL" },
              { status: 400 },
            );
          if (name === "pi_product_working_states") return Response.json(state.working);
          if (name === "product_variants") return Response.json({ sku: sample.sku });
          if (name === "pi_read_document_references") return Response.json(state.page);
          assert.equal(name, "pi_add_document_reference");
          return Response.json(state.receipt);
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
  return { state, client };
}
test("reference commands preserve null unknowns, prior versions and all source pairs", () => {
  for (const [source_kind, source] of Object.entries(documentSources)) {
    const input = { ...command, copy: { ...copy, source_kind, source_level: source.level } };
    assert.deepEqual(parseConsoleCommand(input), input);
  }
  assert.deepEqual(parseConsoleCommand({ ...command, prior_document_id: id(2) }), {
    ...command,
    prior_document_id: id(2),
  });
  for (const patch of [
    { issued_date: "0000-01-01" },
    { issued_date: "2026-02-30" },
    { issued_date: "9999-01-01" },
    { issued_date: "" },
    { revision_label: "" },
    { title: "x\n" },
    { title: "x".repeat(501) },
    { source_level: "B" },
    { source_kind: "__proto__" },
    { document_type: "executable" },
    { confirmed: true },
    { title: " x" },
  ]) {
    assert.equal(validDocumentCopy({ ...copy, ...patch }), false);
    assert.throws(() => parseConsoleCommand({ ...command, copy: { ...copy, ...patch } }));
  }
  assert.throws(() => parseConsoleCommand({ ...command, prior_document_id: "invalid" }));
  assert.throws(() => parseConsoleCommand({ ...command, approved: true }));
});
test("document command uses exact RPC args and returns only document/link identities", async () => {
  const { client, state } = fixture();
  assert.deepEqual(await executeConsoleCommand(client, command, env), {
    ok: true,
    result: { document_id: id(100), link_id: id(101) },
  });
  assert.deepEqual(state.calls, [
    {
      name: "pi_add_document_reference",
      args: { request_uuid: id(10), variant_uuid: id(1), document_copy: copy },
    },
  ]);
  await executeConsoleCommand(client, { ...command, prior_document_id: id(2) }, env);
  assert.equal(
    (state.calls.at(-1)!.args as unknown as { prior_document_uuid: string }).prior_document_uuid,
    id(2),
  );
  for (const receipt of [
    null,
    {},
    { document_id: id(100) },
    { document_id: id(100), link_id: "invalid" },
  ]) {
    state.receipt = receipt;
    assert.equal((await executeConsoleCommand(client, command, env)).ok, false);
  }
  state.error = "private-error";
  assert.doesNotMatch(
    JSON.stringify(await executeConsoleCommand(client, command, env)),
    /PRIVATE_SENTINEL|private-error/,
  );
});
test("document command guards require current role, confirmed user and exact default-off local config", async () => {
  for (const role of ["owner", "editor", "reviewer", "publisher", "viewer"]) {
    const { client, state } = fixture();
    state.roles = [role];
    assert.equal(
      (await executeConsoleCommand(client, command, env)).ok,
      ["owner", "editor", "reviewer"].includes(role),
    );
  }
  for (const settings of [
    { ...env, CONSOLE_DOCUMENTS_ENABLED: "false" },
    { ...env, CONSOLE_ENVIRONMENT: "staging" },
    { ...env, VERCEL: "1" },
  ]) {
    const { client, state } = fixture();
    assert.equal((await executeConsoleCommand(client, command, settings)).ok, false);
    assert.equal(state.calls.length, 0);
  }
  for (const patch of [{ roles: [] }, { signedIn: false }, { confirmed: false }]) {
    const { client, state } = fixture();
    Object.assign(state, patch);
    assert.equal((await executeConsoleCommand(client, command, env)).ok, false);
    assert.equal(state.calls.length, 0);
    await assert.rejects(readDocumentLibrary(client, null, 1, env));
  }
});
test("counted projection rejects truncation, duplicate/wrong scope, malformed state and private fields", () => {
  assert.deepEqual(parseDocumentPage({ total: 27, items: [] }, 3, null), { total: 27, items: [] });
  const good = { total: 1, items: [{ ...sample, storage_path: "PRIVATE_SENTINEL" }] };
  assert.doesNotMatch(
    JSON.stringify(parseDocumentPage(good, 1, id(1))),
    /PRIVATE_SENTINEL|storage_path/,
  );
  for (const page of [0, -1, 1.5, 10001]) assert.throws(() => parseDocumentPage(good, page, null));
  for (const bad of [
    { total: 2, items: [sample] },
    { total: -1, items: [] },
    { total: 1.2, items: [] },
    { total: 2, items: [sample, sample] },
    ...[
      { variant_id: id(9) },
      { document_id: "bad" },
      { subject_current: "yes" },
      { upload_state: "approved" },
      { upload_request_id: id(8) },
      { filename: "unexpected.pdf" },
      { prior_document_id: sample.document_id },
      { upload_state: "pending", filename: "bad.exe", byte_size: 2, page_count: 1 },
      { upload_state: "recorded", filename: "a.pdf", byte_size: 2, page_count: 201 },
    ].map((patch) => ({ total: 1, items: [{ ...sample, ...patch }] })),
  ])
    assert.throws(() => parseDocumentPage(bad, 1, id(1)));
});
test("authenticated global and SKU reads carry exact scope, pagination and role capabilities", async () => {
  const { client, state } = fixture();
  assert.equal((await readDocumentLibrary(client, null, 1, env))!.total, 4);
  assert.deepEqual(state.calls, [
    { name: "pi_read_document_references", args: { variant_uuid: null, page_number: 1 } },
  ]);
  assert.equal((await readDocumentLibrary(client, id(1), 1, env))!.sku, sample.sku);
  state.roles = ["viewer"];
  assert.equal((await readDocumentLibrary(client, null, 1, env))!.canWrite, false);
  state.working = [];
  assert.equal(await readDocumentLibrary(client, id(1), 1, env), null);
  state.working = [{ product_variant_id: id(9) }];
  await assert.rejects(readDocumentLibrary(client, id(1), 1, env));
  await assert.rejects(readDocumentLibrary(client, null, 0, env));
  await assert.rejects(
    readDocumentLibrary(client, null, 1, { ...env, CONSOLE_DOCUMENTS_ENABLED: "false" }),
  );
  state.error = "42501";
  await assert.rejects(
    readDocumentLibrary(client, null, 1, env),
    (error: Error) => !error.message.includes("PRIVATE_SENTINEL"),
  );
});
