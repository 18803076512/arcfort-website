import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { test } from "node:test";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { createConsoleClient } from "../../lib/console/client.ts";
import { getConsoleConfig } from "../../lib/console/config.ts";
import { inspectStoredOriginal } from "../../lib/console/original-inspection.ts";
import { claimOriginalWork } from "../../lib/console/original-work.ts";
import { originalInspectionPath } from "../../lib/domain/catalog/original-inspection.ts";

const id = (n: number) => `98000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const env = {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_ORIGINALS_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_inspection",
};
const bytes = await sharp({ create: { width: 32, height: 24, channels: 3, background: "#18705f" } })
  .png()
  .toBuffer();
function request(
  body: unknown = { variant_id: id(1), asset_id: id(2) },
  headers = {},
  method = "POST",
) {
  return new Request(env.CONSOLE_ORIGIN + originalInspectionPath, {
    method,
    headers: {
      host: "127.0.0.1:3000",
      origin: env.CONSOLE_ORIGIN,
      "sec-fetch-site": "same-origin",
      "x-console-command": "1",
      "content-type": "application/json",
      ...headers,
    },
    ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
  });
}
function fixture() {
  const path = `working-originals/${id(3)}/${id(2)}/original.png`;
  const manifest = {
    filename: "synthetic.png",
    byte_size: bytes.length,
    mime_type: "image/png",
    file_hash: createHash("sha256").update(bytes).digest("hex"),
    width: 32,
    height: 24,
  };
  const state = {
    authReads: 0,
    roles: ["reviewer"],
    signedIn: true,
    working: true,
    intent: { id: id(4), actor_id: id(3), media_asset_id: id(2), storage_path: path, manifest },
    completion: { intent_id: id(4), media_asset_id: id(2) },
    asset: {
      storage_bucket: "pi-product-originals",
      storage_path: path,
      file_hash: manifest.file_hash,
      mime_type: "image/png",
      width: 32,
      height: 24,
    },
    unavailable: "",
    downloads: 0,
    methods: [] as string[],
    queries: [] as string[],
    stored: bytes,
    downloadError: false,
    revokeDuringRead: false,
    changeUser: false,
    beforeRead: () => {},
    wait: undefined as Promise<void> | undefined,
    snapshotReads: 0,
    snapshotError: "",
    snapshot: {
      mapping_id: id(10),
      variant_id: id(1),
      asset_id: id(2),
      adoption_id: id(11),
      revision: 1,
      digest: "a".repeat(64),
      original_digest: "b".repeat(64),
    } as Record<string, unknown>,
    changeSnapshotAfterRead: false,
    downgradeDuringRead: false,
  };
  const provider = createClient<Database>(
    env.CONSOLE_SUPABASE_URL,
    env.CONSOLE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (url, options) => {
          const target = new URL(String(url));
          assert.equal(target.origin, env.CONSOLE_SUPABASE_URL);
          const table = target.pathname.split("/").at(-1)!;
          state.methods.push(options?.method ?? "GET");
          state.queries.push(target.pathname);
          if (table === "console_user_roles")
            return Response.json(state.roles.map((role) => ({ role })));
          if (table === "pi_product_working_states") {
            assert.deepEqual(JSON.parse(String(options?.body)), { variant_ids: [id(1)] });
            return Response.json(state.working ? [{ product_variant_id: id(1) }] : []);
          }
          if (table === "pi_media_review_snapshot") {
            assert.deepEqual(JSON.parse(String(options?.body)), {
              mapping_uuid: id(10),
              expected_revision: 1,
              expected_digest: "a".repeat(64),
              observer_key_uuid: id(12),
            });
            state.snapshotReads++;
            if (state.snapshotError)
              return Response.json(
                { code: state.snapshotError, message: "PRIVATE_SENTINEL" },
                { status: 400 },
              );
            return Response.json(
              state.snapshotReads > 1 && state.changeSnapshotAfterRead
                ? { ...state.snapshot, original_digest: "c".repeat(64) }
                : state.snapshot,
            );
          }
          if (state.unavailable === table)
            return Response.json(
              { message: "PRIVATE_SENTINEL", code: "PGRST116" },
              { status: 406 },
            );
          if (table === "media_upload_intents") {
            assert.equal(target.searchParams.get("product_variant_id"), `eq.${id(1)}`);
            assert.equal(target.searchParams.get("media_asset_id"), `eq.${id(2)}`);
            return Response.json(state.intent);
          }
          if (table === "media_upload_completions") {
            assert.equal(target.searchParams.get("intent_id"), `eq.${id(4)}`);
            assert.equal(target.searchParams.get("media_asset_id"), `eq.${id(2)}`);
            return Response.json(state.completion);
          }
          if (table === "media_assets") {
            assert.equal(target.searchParams.get("id"), `eq.${id(2)}`);
            return Response.json(state.asset);
          }
          assert.equal(
            decodeURIComponent(target.pathname),
            `/storage/v1/object/pi-product-originals/${path}`,
          );
          assert.equal(options?.method, "GET");
          assert.equal(options?.cache, "no-store");
          assert.ok(options?.signal);
          state.downloads++;
          state.beforeRead();
          await state.wait;
          if (state.revokeDuringRead) state.roles = [];
          if (state.downgradeDuringRead) state.roles = ["editor"];
          if (state.downloadError)
            return Response.json({ message: "PRIVATE_SENTINEL" }, { status: 403 });
          return new Response(Uint8Array.from(state.stored));
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
          data: {
            user: state.signedIn
              ? {
                  id: state.changeUser && state.authReads > 1 ? id(8) : id(9),
                  email_confirmed_at: "2026-10-03",
                }
              : null,
          },
        };
      },
    },
  } as unknown as ConsoleClient;
  return { state, client };
}

const observationEnv = {
  ...env,
  CONSOLE_MEDIA_REVIEW_ENABLED: "true",
  CONSOLE_MEDIA_OBSERVATION_KEY_ID: id(12),
  CONSOLE_MEDIA_OBSERVATION_SECRET_HEX: Buffer.alloc(32, 7).toString("hex"),
};
const pending = { mapping_id: id(10), revision: 1, digest: "a".repeat(64) };
test("actual decoded private bytes bind a short-lived exact review observation", async () => {
  const { client, state } = fixture();
  const result = await inspectStoredOriginal(client, request(pending), observationEnv);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("Unexpected refusal");
  assert.deepEqual(result.bytes, bytes);
  assert.ok(result.observation);
  const parts = result.observation.split("|");
  assert.equal(parts.length, 12);
  assert.deepEqual(parts.slice(0, 8), [
    "v1",
    id(12),
    id(9),
    id(11),
    id(10),
    "1",
    pending.digest,
    "b".repeat(64),
  ]);
  assert.equal(Number(parts[9]) - Number(parts[8]), 300);
  assert.equal(
    parts[11],
    createHmac("sha256", Buffer.alloc(32, 7)).update(parts.slice(0, 11).join("|")).digest("hex"),
  );
  assert.equal(state.snapshotReads, 2);
  assert.equal(state.downloads, 1);
  assert.doesNotMatch(result.observation, /working-originals|synthetic\.png|PRIVATE_SENTINEL/);
});
test("review observation is separately disabled and limited to current owner/reviewer", async () => {
  for (const roles of [["editor"], ["publisher"], ["viewer"]]) {
    const { client, state } = fixture();
    state.roles = roles;
    denied(await inspectStoredOriginal(client, request(pending), observationEnv), "42501");
    assert.equal(state.downloads, 0);
    assert.equal(state.snapshotReads, 0);
  }
  for (const overrides of [
    { CONSOLE_MEDIA_REVIEW_ENABLED: "false" },
    { CONSOLE_ORIGINALS_ENABLED: "false" },
  ]) {
    const { client, state } = fixture();
    denied(
      await inspectStoredOriginal(client, request(pending), { ...observationEnv, ...overrides }),
      "42501",
    );
    assert.equal(state.downloads, 0);
  }
  const { client, state } = fixture();
  denied(
    await inspectStoredOriginal(client, request(pending), {
      ...observationEnv,
      CONSOLE_MEDIA_OBSERVATION_SECRET_HEX: undefined,
    }),
    "unavailable",
  );
  assert.equal(state.snapshotReads, 0);
});
test("observation cannot survive corrupt bytes, changed snapshots or reviewer downgrade", async () => {
  for (const scenario of ["bytes", "snapshot", "role", "provider", "malformed"] as const) {
    const { client, state } = fixture();
    if (scenario === "bytes") state.stored = Buffer.from("Invalid raster");
    if (scenario === "snapshot") state.changeSnapshotAfterRead = true;
    if (scenario === "role") state.downgradeDuringRead = true;
    if (scenario === "provider") state.snapshotError = "40001";
    if (scenario === "malformed")
      state.snapshot = { ...state.snapshot, raw_snapshot: "PRIVATE_SENTINEL" };
    denied(await inspectStoredOriginal(client, request(pending), observationEnv));
  }
});
function denied(result: Awaited<ReturnType<typeof inspectStoredOriginal>>, code?: string) {
  assert.equal(result.ok, false);
  if (result.ok) throw new Error("Unexpected success");
  if (code) assert.equal(result.code, code);
  assert.deepEqual(Object.keys(result).sort(), ["code", "message", "ok"]);
  assert.doesNotMatch(
    JSON.stringify(result),
    /PRIVATE_SENTINEL|storage_path|working-originals|file_hash|access_token/,
  );
}

test("cookie-scoped client preserves Storage cancellation and the private fetch boundary", async () => {
  const settings = getConsoleConfig(env);
  assert.equal(settings.status, "ready");
  if (settings.status !== "ready") throw new Error("Invalid synthetic settings");
  const originalFetch = globalThis.fetch;
  const controller = new AbortController();
  let observed: AbortSignal | null | undefined;
  globalThis.fetch = async (url, init) => {
    assert.equal(new URL(String(url)).origin, env.CONSOLE_SUPABASE_URL);
    assert.equal(init?.cache, "no-store");
    observed = init?.signal;
    assert.ok(observed);
    controller.abort();
    assert.equal(observed.aborted, true);
    return new Response(Uint8Array.from(bytes));
  };
  try {
    const client = createConsoleClient(settings.config, { getAll: () => [], setAll: () => {} });
    await client.storage
      .from("pi-product-originals")
      .download("synthetic.png", {}, { signal: controller.signal })
      .asStream();
    assert.ok(observed, "The real SDK must reach the configured fetch adapter.");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("inspection checks enabled local host, POST and origin before Auth or Storage", async () => {
  for (const change of [
    { CONSOLE_ORIGINALS_ENABLED: "false" },
    { CONSOLE_WORKING_ENABLED: "false" },
    { CONSOLE_ENVIRONMENT: "staging" },
    { VERCEL: "1" },
  ]) {
    const { client, state } = fixture();
    denied(await inspectStoredOriginal(client, request(), { ...env, ...change }), "42501");
    assert.equal(state.authReads, 0);
  }
  for (const headers of [
    { origin: "https://invalid.example" },
    { host: "localhost:3000" },
    { "x-console-command": "0" },
    { "sec-fetch-site": "cross-site" },
  ]) {
    const { client, state } = fixture();
    denied(await inspectStoredOriginal(client, request(undefined, headers), env), "42501");
    assert.equal(state.authReads, 0);
  }
  const { client, state } = fixture();
  denied(await inspectStoredOriginal(client, request(undefined, {}, "GET"), env), "42501");
  assert.equal(state.authReads, 0);
});
test("inspection requires current confirmed membership and strict bounded IDs", async () => {
  for (const change of [{ roles: [] }, { signedIn: false }]) {
    const { client, state } = fixture();
    Object.assign(state, change);
    denied(await inspectStoredOriginal(client, request(), env), "42501");
    assert.equal(state.downloads, 0);
  }
  for (const input of [
    null,
    [],
    {},
    { variant_id: id(1), asset_id: "bad" },
    { variant_id: id(1), asset_id: id(2), path: "secret" },
    { text: "x".repeat(131073) },
  ]) {
    const { client, state } = fixture();
    denied(await inspectStoredOriginal(client, request(input), env), "22023");
    assert.equal(state.downloads, 0);
  }
});
test("all current Console roles may inspect exact unchanged bytes without mutations", async () => {
  for (const role of ["owner", "editor", "reviewer", "viewer", "publisher"]) {
    const { client, state } = fixture();
    state.roles = [role];
    const result = await inspectStoredOriginal(client, request(), env);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.bytes, bytes);
      assert.equal(result.mime, "image/png");
    }
    assert.equal(state.authReads, 2);
    assert.equal(state.downloads, 1);
    assert.equal(state.methods.filter((method) => method !== "GET").length, 1);
    assert.equal(state.queries.filter((query) => query.includes("/rpc/")).length, 1);
  }
});
test("out-of-pilot, missing intent, incomplete and mismatched manifests never read Storage", async () => {
  const edits = [
    (s: ReturnType<typeof fixture>["state"]) => {
      s.working = false;
    },
    ...["media_upload_intents", "media_upload_completions", "media_assets"].map(
      (name) => (s: ReturnType<typeof fixture>["state"]) => {
        s.unavailable = name;
      },
    ),
    (s: ReturnType<typeof fixture>["state"]) => {
      s.intent.storage_path = "other/path";
    },
    (s: ReturnType<typeof fixture>["state"]) => {
      s.asset.storage_bucket = "another-bucket";
    },
    (s: ReturnType<typeof fixture>["state"]) => {
      s.asset.file_hash = "b".repeat(64);
    },
    (s: ReturnType<typeof fixture>["state"]) => {
      s.asset.width = 20;
    },
    (s: ReturnType<typeof fixture>["state"]) => {
      s.intent.manifest.byte_size = 26214401;
    },
    (s: ReturnType<typeof fixture>["state"]) => {
      s.intent.manifest.mime_type = "text/html";
    },
    (s: ReturnType<typeof fixture>["state"]) => {
      s.completion.media_asset_id = id(8);
    },
  ];
  for (const edit of edits) {
    const { client, state } = fixture();
    edit(state);
    denied(await inspectStoredOriginal(client, request(), env));
    assert.equal(state.downloads, 0);
  }
});
test("Storage failure, corrupt bytes, size mismatch and hash mismatch fail closed", async () => {
  for (const change of [
    { downloadError: true },
    { stored: Buffer.alloc(bytes.length) },
    { stored: bytes.subarray(0, bytes.length - 1) },
  ]) {
    const { client, state } = fixture();
    Object.assign(state, change);
    denied(await inspectStoredOriginal(client, request(), env));
  }
  const { client, state } = fixture();
  state.intent.manifest.file_hash = "b".repeat(64);
  state.asset.file_hash = "b".repeat(64);
  denied(await inspectStoredOriginal(client, request(), env), "40001");
});
test("revocation and session changes during download cannot release original bytes", async () => {
  for (const change of [{ revokeDuringRead: true }, { changeUser: true }]) {
    const { client, state } = fixture();
    Object.assign(state, change);
    denied(await inspectStoredOriginal(client, request(), env), "42501");
    assert.equal(state.downloads, 1);
    assert.equal(state.authReads, 2);
  }
  const { client, state } = fixture();
  const controller = new AbortController();
  state.beforeRead = () => controller.abort();
  denied(
    await inspectStoredOriginal(client, new Request(request(), { signal: controller.signal }), env),
    "42501",
  );
});
test("inspection shares upload decoder limits and releases its claim after failure", async () => {
  const release = claimOriginalWork(id(9));
  assert.ok(release);
  const { client, state } = fixture();
  try {
    denied(await inspectStoredOriginal(client, request(), env), "54000");
  } finally {
    release();
  }
  assert.equal(state.downloads, 0);
  const first = claimOriginalWork(id(20));
  const second = claimOriginalWork(id(21));
  assert.ok(first);
  assert.ok(second);
  try {
    denied(await inspectStoredOriginal(client, request(), env), "54000");
  } finally {
    first();
    second();
  }
  state.downloadError = true;
  denied(await inspectStoredOriginal(client, request(), env));
  state.downloadError = false;
  assert.equal((await inspectStoredOriginal(client, request(), env)).ok, true);
});
