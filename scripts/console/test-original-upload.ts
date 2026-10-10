import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { executeOriginalUpload } from "../../lib/console/original-upload.ts";
import { consoleOriginalsEnabled } from "../../lib/console/working-config.ts";
import { parseOriginalUpload } from "../../lib/domain/catalog/originals.ts";
import { readOriginalIntakes } from "../../lib/console/originals.ts";

const id = (n: number) => `97000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const local = {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_ORIGINALS_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_test_value",
};
const png = await sharp({ create: { width: 24, height: 16, channels: 3, background: "#219c67" } })
  .png()
  .toBuffer();
const input = {
  request_id: id(10),
  completion_id: id(11),
  variant_id: id(12),
  filename: "synthetic.png",
  byte_size: png.length,
  source_kind: "other_reference",
  source_owner: "Synthetic custodian",
  source_reference: "TEST-ONLY original",
};
const intakeRow = {
  intent_id: id(3),
  asset_id: id(2),
  filename: input.filename,
  byte_size: png.length,
  mime_type: "image/png",
  width: 24,
  height: 16,
  source_kind: input.source_kind,
  source_owner: input.source_owner,
  source_reference: input.source_reference,
  created_at: "2026-09-27T00:00:00Z",
  completed: true,
  subject_current: true,
  total_count: 1,
  storage_path: "PRIVATE_SENTINEL",
  actor_id: "PRIVATE_SENTINEL",
};
function request(
  bytes = png,
  changes: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) {
  return new Request(`${local.CONSOLE_ORIGIN}/console/originals`, {
    method: "POST",
    headers: {
      host: "127.0.0.1:3000",
      origin: local.CONSOLE_ORIGIN,
      "sec-fetch-site": "same-origin",
      "x-console-command": "1",
      "content-type": "image/png",
      "x-console-original": encodeURIComponent(
        JSON.stringify({ ...input, byte_size: bytes.length, ...changes }),
      ),
      ...headers,
    },
    body: Uint8Array.from(bytes),
  });
}
function transport(actor = id(1)) {
  const state = {
    roles: ["owner"],
    signedIn: true,
    authReads: 0,
    calls: [] as { name: string; body: Record<string, unknown> }[],
    uploads: 0,
    downloads: 0,
    stored: null as Buffer | null,
    readback: null as Buffer | null,
    beginError: "",
    completeError: "",
    badPath: false,
    badReceipt: false,
    uploadError: false,
    downloadError: false,
    uploadTimeout: false,
    beginWait: undefined as Promise<void> | undefined,
    onBegin: () => {},
    rows: [intakeRow] as unknown[],
    working: true,
  };
  const path = `working-originals/${actor}/${id(2)}/original.png`;
  const provider = createClient<Database>(
    local.CONSOLE_SUPABASE_URL,
    local.CONSOLE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (url, options) => {
          const parsed = new URL(String(url));
          assert.equal(parsed.origin, local.CONSOLE_SUPABASE_URL);
          if (parsed.pathname === "/rest/v1/console_user_roles")
            return Response.json(state.roles.map((role) => ({ role })));
          if (parsed.pathname === "/rest/v1/product_variants") {
            assert.equal(parsed.searchParams.get("select"), "sku");
            return Response.json({ sku: "AF-MIG-TEST-0012" });
          }
          if (parsed.pathname.startsWith("/rest/v1/rpc/")) {
            const name = parsed.pathname.split("/").at(-1)!;
            const body = JSON.parse(String(options?.body));
            state.calls.push({ name, body });
            if (name === "pi_product_working_states")
              return Response.json(
                state.working
                  ? [{ product_variant_id: id(12), revision: 1, origin: "adopted" }]
                  : [],
              );
            if (name === "pi_read_original_intakes") return Response.json(state.rows);
            const error = name === "pi_begin_media_upload" ? state.beginError : state.completeError;
            if (error)
              return Response.json({ code: error, message: "PRIVATE_SENTINEL" }, { status: 400 });
            if (name === "pi_begin_media_upload") {
              state.onBegin();
              await state.beginWait;
              return Response.json({
                intent_id: id(3),
                asset_id: id(2),
                storage_path: state.badPath ? "another/private/path" : path,
                secret: "PRIVATE_SENTINEL",
              });
            }
            assert.equal(name, "pi_complete_media_upload");
            return Response.json({
              intent_id: id(3),
              asset_id: state.badReceipt ? id(99) : id(2),
              secret: "PRIVATE_SENTINEL",
            });
          }
          assert.equal(
            decodeURIComponent(parsed.pathname),
            `/storage/v1/object/pi-product-originals/${path}`,
          );
          if (options?.method === "POST") {
            state.uploads++;
            const headers = new Headers(options.headers);
            assert.equal(headers.get("x-upsert"), "false");
            assert.equal(headers.get("content-type"), "image/png");
            if (state.uploadError)
              return Response.json(
                { statusCode: "403", message: "PRIVATE_SENTINEL", error: "Forbidden" },
                { status: 403 },
              );
            if (!state.stored) state.stored = Buffer.from(options.body as Uint8Array);
            if (state.uploadTimeout) throw new Error("PRIVATE_SENTINEL timeout after persistence");
            return Response.json({ Id: id(2), Key: `pi-product-originals/${path}` });
          }
          assert.equal(options?.method, "GET");
          state.downloads++;
          if (state.downloadError || !state.stored)
            return Response.json(
              { message: "PRIVATE_SENTINEL", statusCode: "404" },
              { status: 404 },
            );
          return new Response(Uint8Array.from(state.readback ?? state.stored), {
            headers: { "content-type": "image/png" },
          });
        },
      },
    },
  );
  const client = {
    from: provider.from.bind(provider),
    rpc: provider.rpc.bind(provider),
    storage: provider.storage,
    auth: {
      getUser: async () => {
        state.authReads++;
        return {
          error: null,
          data: { user: state.signedIn ? { id: actor, email_confirmed_at: "2026-09-27" } : null },
        };
      },
    },
  } as unknown as ConsoleClient;
  return { client, state };
}

test("original boundary: independent flag, exact local environment and same origin before reading bytes", async () => {
  assert.equal(consoleOriginalsEnabled(local), true);
  for (const change of [
    { CONSOLE_ORIGINALS_ENABLED: "false" },
    { CONSOLE_WORKING_ENABLED: "false" },
    { CONSOLE_ENVIRONMENT: "staging" },
    { VERCEL: "1" },
    { CONSOLE_SUPABASE_URL: "http://127.0.0.1:54322" },
  ]) {
    const { client, state } = transport();
    assert.equal(
      (await executeOriginalUpload(client, request(), { ...local, ...change })).ok,
      false,
    );
    assert.equal(state.authReads, 0);
  }
  for (const headers of [
    { origin: "https://example.invalid" },
    { "x-console-command": "0" },
    { host: "localhost:3000" },
    { "sec-fetch-site": "cross-site" },
  ] as Record<string, string>[]) {
    const { client, state } = transport();
    assert.equal((await executeOriginalUpload(client, request(png, {}, headers), local)).ok, false);
    assert.equal(state.authReads, 0);
  }
});
test("original identity: strict metadata and declared size/type before any RPC", async () => {
  for (const change of [
    { extra: "approval" },
    { source_owner: "" },
    { source_reference: "x\u202e" },
    { byte_size: 0 },
    { byte_size: 26214401 },
    { request_id: "invalid" },
  ])
    assert.throws(() =>
      parseOriginalUpload(encodeURIComponent(JSON.stringify({ ...input, ...change }))),
    );
  for (const [change, headers] of [
    [{ filename: "../file.png" }, {}],
    [{}, { "content-length": "1" }],
    [{}, { "content-type": "text/html" }],
    [{ byte_size: png.length - 1 }, {}],
  ] as const) {
    const { client, state } = transport();
    assert.equal(
      (await executeOriginalUpload(client, request(png, change, headers), local)).ok,
      false,
    );
    assert.equal(state.calls.length, 0);
  }
});
test("original authorization: current roles, unauthenticated denial and database refusal", async () => {
  for (const roles of [[], ["viewer"], ["publisher"]]) {
    const { client, state } = transport();
    state.roles = roles;
    assert.equal((await executeOriginalUpload(client, request(), local)).ok, false);
    assert.equal(state.calls.length, 0);
  }
  const anonymous = transport();
  anonymous.state.signedIn = false;
  assert.equal((await executeOriginalUpload(anonymous.client, request(), local)).ok, false);
  for (const role of ["owner", "editor", "reviewer"]) {
    const { client, state } = transport();
    state.roles = [role];
    assert.equal((await executeOriginalUpload(client, request(), local)).ok, true);
  }
  for (const code of ["42501", "54000", "40001"]) {
    const { client, state } = transport();
    state.beginError = code;
    const result = await executeOriginalUpload(client, request(), local);
    assert.equal(result.ok, false);
    assert.ok(JSON.stringify(result).includes(code));
    assert.equal(state.uploads, 0);
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL/);
  }
});
test("original roundtrip: exact buffer upload/readback, narrow receipts and no overwrite on retry", async () => {
  const { client, state } = transport();
  const result = await executeOriginalUpload(client, request(), local);
  assert.deepEqual(result, { ok: true, asset_id: id(2), intent_id: id(3) });
  assert.deepEqual(state.stored, png);
  assert.equal(state.downloads, 1);
  assert.equal(state.calls[0].body.request_uuid, input.request_id);
  assert.equal(state.calls[1].body.request_uuid, input.completion_id);
  const manifest = state.calls[0].body.manifest as Record<string, unknown>;
  assert.equal(manifest.byte_size, png.length);
  assert.match(String(manifest.file_hash), /^[a-f0-9]{64}$/);
  assert.equal(Object.hasOwn(manifest, "approved_by"), false);
  state.uploadError = true;
  assert.deepEqual(await executeOriginalUpload(client, request(), local), result);
  assert.equal(state.downloads, 2);
  const timeout = transport();
  timeout.state.uploadTimeout = true;
  assert.equal((await executeOriginalUpload(timeout.client, request(), local)).ok, true);
});
test("original reconciliation: invalid path, missing/corrupt/different stored bytes and revoked completion fail closed", async () => {
  const wrong = transport();
  wrong.state.badPath = true;
  assert.equal((await executeOriginalUpload(wrong.client, request(), local)).ok, false);
  assert.equal(wrong.state.uploads, 0);
  for (const mode of ["missing", "corrupt", "different"]) {
    const { client, state } = transport();
    state.downloadError = mode === "missing";
    if (mode === "corrupt") state.readback = Buffer.alloc(png.length);
    if (mode === "different") {
      const other = await sharp({
        create: { width: 24, height: 16, channels: 3, background: "#cc4422" },
      })
        .png()
        .toBuffer();
      state.readback = other;
    }
    assert.equal((await executeOriginalUpload(client, request(), local)).ok, false);
    assert.equal(
      state.calls.some((call) => call.name === "pi_complete_media_upload"),
      false,
    );
  }
  const revoked = transport();
  revoked.state.completeError = "42501";
  assert.equal((await executeOriginalUpload(revoked.client, request(), local)).ok, false);
  assert.deepEqual(revoked.state.stored, png);
  const bad = transport();
  bad.state.badReceipt = true;
  assert.equal((await executeOriginalUpload(bad.client, request(), local)).ok, false);
});
test("original resources: one in-flight request per actor and slots release after completion", async () => {
  const { client, state } = transport();
  let release!: () => void;
  let started!: () => void;
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  state.onBegin = started;
  state.beginWait = new Promise<void>((resolve) => {
    release = resolve;
  });
  const first = executeOriginalUpload(client, request(), local);
  await began;
  const denied = await executeOriginalUpload(client, request(), local);
  assert.equal(denied.ok, false);
  assert.match(JSON.stringify(denied), /54000/);
  release();
  assert.equal((await first).ok, true);
  assert.equal((await executeOriginalUpload(client, request(), local)).ok, true);
});
test("original large raster: greater-than-10-MiB bytes survive the service pipeline unchanged", async () => {
  const large = await sharp({
    create: { width: 2200, height: 1800, channels: 3, background: "#468fba" },
  })
    .png({ compressionLevel: 0 })
    .toBuffer();
  assert.ok(large.length > 10485760 && large.length < 26214400);
  const { client, state } = transport();
  assert.equal((await executeOriginalUpload(client, request(large), local)).ok, true);
  assert.deepEqual(state.stored, large);
});

test("original resources: two actors occupy the bounded process capacity", async () => {
  const first = transport(id(41));
  const second = transport(id(42));
  const third = transport(id(43));
  let release!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  let startedOne!: () => void;
  let startedTwo!: () => void;
  const oneReady = new Promise<void>((resolve) => {
    startedOne = resolve;
  });
  const twoReady = new Promise<void>((resolve) => {
    startedTwo = resolve;
  });
  first.state.beginWait = wait;
  second.state.beginWait = wait;
  first.state.onBegin = startedOne;
  second.state.onBegin = startedTwo;
  const one = executeOriginalUpload(first.client, request(), local);
  await oneReady;
  const two = executeOriginalUpload(second.client, request(), local);
  await twoReady;
  try {
    const result = await executeOriginalUpload(third.client, request(), local);
    assert.equal(result.ok, false);
    assert.match(JSON.stringify(result), /54000/);
    assert.equal(third.state.calls.length, 0);
  } finally {
    release();
  }
  assert.equal((await one).ok, true);
  assert.equal((await two).ok, true);
});

test("original reads: counted SKU scope, role-aware upload and projection without raw Storage fields", async () => {
  const { client, state } = transport();
  const data = await readOriginalIntakes(client, id(12), 1, local);
  assert.equal(data?.canUpload, true);
  assert.equal(data?.items.length, 1);
  assert.doesNotMatch(JSON.stringify(data), /PRIVATE_SENTINEL|storage_path|actor_id/);
  assert.deepEqual(state.calls.at(-1)?.body, { variant_uuid: id(12), page_number: 1 });
  state.roles = ["viewer"];
  assert.equal((await readOriginalIntakes(client, id(12), 1, local))?.canUpload, false);
  state.rows = [{ ...intakeRow, total_count: 26 }];
  await assert.rejects(readOriginalIntakes(client, id(12), 1, local));
  state.rows = [intakeRow, intakeRow];
  await assert.rejects(readOriginalIntakes(client, id(12), 1, local));
  state.rows = [{ ...intakeRow, created_at: "invalid" }];
  await assert.rejects(readOriginalIntakes(client, id(12), 1, local));
  state.working = false;
  assert.equal(await readOriginalIntakes(client, id(12), 1, local), null);
  state.roles = [];
  await assert.rejects(readOriginalIntakes(client, id(12), 1, local));
});
