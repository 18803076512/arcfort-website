import assert from "node:assert/strict";
import { test } from "node:test";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { executeDocumentUpload } from "../../lib/console/document-upload.ts";
import { claimOriginalWork } from "../../lib/console/original-work.ts";
import { consoleDocumentsEnabled } from "../../lib/console/working-config.ts";
import { documentUploadFailure, parseDocumentUpload } from "../../lib/domain/catalog/documents.ts";

const id = (n: number) => `a3100000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const local = {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_DOCUMENTS_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_test_value",
};
const doc = await PDFDocument.create();
doc.addPage([200, 200]);
const pdf = Buffer.from(await doc.save());
const input = {
  request_id: id(10),
  completion_id: id(11),
  document_id: id(12),
  filename: "synthetic.pdf",
  byte_size: pdf.length,
};
function request(
  bytes: Buffer = pdf,
  changes: Record<string, unknown> = {},
  headers: Record<string, string> = {},
  signal?: AbortSignal,
) {
  return new Request(`${local.CONSOLE_ORIGIN}/console/documents/upload`, {
    method: "POST",
    headers: {
      host: "127.0.0.1:3000",
      origin: local.CONSOLE_ORIGIN,
      "sec-fetch-site": "same-origin",
      "x-console-command": "1",
      "content-type": "application/pdf",
      "x-console-document": encodeURIComponent(
        JSON.stringify({ ...input, byte_size: bytes.length, ...changes }),
      ),
      ...headers,
    },
    body: Uint8Array.from(bytes),
    signal,
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
    badDocument: false,
    badReceipt: false,
    uploadError: false,
    downloadError: false,
    uploadTimeout: false,
    beginWait: undefined as Promise<void> | undefined,
    onBegin: () => {},
    onUpload: () => {},
  };
  const path = `working-documents/${actor}/${id(3)}/original.pdf`;
  const provider = createClient<Database>(
    local.CONSOLE_SUPABASE_URL,
    local.CONSOLE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (url, options) => {
          const parsed = new URL(String(url));
          assert.equal(
            parsed.origin,
            local.CONSOLE_SUPABASE_URL,
            "Never send a real provider request.",
          );
          if (parsed.pathname === "/rest/v1/console_user_roles")
            return Response.json(state.roles.map((role) => ({ role })));
          if (parsed.pathname.startsWith("/rest/v1/rpc/")) {
            const name = parsed.pathname.split("/").at(-1)!;
            const body = JSON.parse(String(options?.body));
            state.calls.push({ name, body });
            const error =
              name === "pi_begin_document_upload" ? state.beginError : state.completeError;
            if (error)
              return Response.json({ code: error, message: "PRIVATE_SENTINEL" }, { status: 400 });
            if (name === "pi_begin_document_upload") {
              state.onBegin();
              await state.beginWait;
              return Response.json({
                intent_id: id(3),
                document_id: state.badDocument ? id(99) : id(12),
                storage_path: state.badPath ? "another/private/path" : path,
                secret: "PRIVATE_SENTINEL",
              });
            }
            assert.equal(name, "pi_complete_document_upload");
            return Response.json({
              intent_id: state.badReceipt ? id(99) : id(3),
              document_id: id(12),
              secret: "PRIVATE_SENTINEL",
            });
          }
          assert.equal(
            decodeURIComponent(parsed.pathname),
            `/storage/v1/object/pi-technical-evidence/${path}`,
          );
          if (options?.method === "POST") {
            state.uploads++;
            const headers = new Headers(options.headers);
            assert.equal(headers.get("x-upsert"), "false");
            assert.equal(headers.get("content-type"), "application/pdf");
            if (state.uploadError)
              return Response.json(
                { statusCode: "403", message: "PRIVATE_SENTINEL", error: "Forbidden" },
                { status: 403 },
              );
            if (!state.stored) state.stored = Buffer.from(options.body as Uint8Array);
            state.onUpload();
            if (state.uploadTimeout) throw new Error("PRIVATE_SENTINEL timeout after persistence");
            return Response.json({ Id: id(2), Key: `pi-technical-evidence/${path}` });
          }
          assert.equal(options?.method, "GET");
          state.downloads++;
          if (state.downloadError || !state.stored)
            return Response.json(
              { message: "PRIVATE_SENTINEL", statusCode: "404" },
              { status: 404 },
            );
          return new Response(Uint8Array.from(state.readback ?? state.stored), {
            headers: { "content-type": "application/pdf" },
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
          data: { user: state.signedIn ? { id: actor, email_confirmed_at: "2026-10-11" } : null },
        };
      },
    },
  } as unknown as ConsoleClient;
  return { client, state };
}

test("document boundary: independent default-off flag and exact local/origin guards before Auth or bytes", async () => {
  assert.equal(consoleDocumentsEnabled(local), true);
  for (const change of [
    { CONSOLE_DOCUMENTS_ENABLED: undefined },
    { CONSOLE_DOCUMENTS_ENABLED: "false" },
    { CONSOLE_WORKING_ENABLED: "false" },
    { CONSOLE_ENVIRONMENT: "staging" },
    { VERCEL: "1" },
    { CONSOLE_SUPABASE_URL: "http://127.0.0.1:54322" },
  ]) {
    const { client, state } = transport();
    assert.equal(
      (await executeDocumentUpload(client, request(), { ...local, ...change })).ok,
      false,
    );
    assert.equal(state.authReads, 0);
  }
  for (const headers of [
    { origin: "https://example.invalid" },
    { origin: "null" },
    { "x-console-command": "0" },
    { host: "localhost:3000" },
    { "sec-fetch-site": "cross-site" },
  ] as Record<string, string>[]) {
    const { client, state } = transport();
    assert.equal((await executeDocumentUpload(client, request(pdf, {}, headers), local)).ok, false);
    assert.equal(state.authReads, 0);
  }
});
test("document input: exact metadata, safe names, MIME/size/encoding and malformed bytes before writes", async () => {
  for (const change of [
    { approved: true },
    { filename: "../x.pdf" },
    { filename: "CON.pdf" },
    { filename: "x\u202e.pdf" },
    { byte_size: 0 },
    { byte_size: 26214401 },
    { request_id: "invalid" },
    { completion_id: input.request_id },
  ])
    assert.throws(() =>
      parseDocumentUpload(encodeURIComponent(JSON.stringify({ ...input, ...change }))),
    );
  for (const header of [null, "[]", "%", "x".repeat(4097)])
    assert.throws(() => parseDocumentUpload(header));
  for (const [bytes, changes, headers] of [
    [pdf, {}, { "content-length": "1" }],
    [pdf, {}, { "content-type": "text/html" }],
    [pdf, {}, { "content-encoding": "gzip" }],
    [pdf, { byte_size: pdf.length - 1 }, {}],
    [Buffer.alloc(200), {}, {}],
  ] as [Buffer, Record<string, unknown>, Record<string, string>][]) {
    const { client, state } = transport();
    assert.equal(
      (await executeDocumentUpload(client, request(bytes, changes, headers), local)).ok,
      false,
    );
    assert.equal(state.calls.length, 0);
  }
});
test("document authorization: current roles, no session, changed reference and database denials", async () => {
  for (const roles of [[], ["viewer"], ["publisher"]]) {
    const { client, state } = transport();
    state.roles = roles;
    assert.equal((await executeDocumentUpload(client, request(), local)).ok, false);
    assert.equal(state.calls.length, 0);
  }
  const anon = transport();
  anon.state.signedIn = false;
  assert.equal((await executeDocumentUpload(anon.client, request(), local)).ok, false);
  for (const role of ["owner", "editor", "reviewer"]) {
    const { client, state } = transport();
    state.roles = [role];
    assert.equal((await executeDocumentUpload(client, request(), local)).ok, true);
  }
  for (const code of ["42501", "54000", "40001", "55000", "PRIVATE_SENTINEL"]) {
    const { client, state } = transport();
    state.beginError = code;
    assert.deepEqual(
      await executeDocumentUpload(client, request(), local),
      documentUploadFailure(code),
    );
    assert.equal(state.uploads, 0);
  }
});
test("document roundtrip: original bytes, narrow receipts, duplicate/timeout reconciliation without overwrite", async () => {
  const { client, state } = transport();
  const result = await executeDocumentUpload(client, request(), local);
  assert.deepEqual(result, { ok: true, document_id: id(12), intent_id: id(3) });
  assert.deepEqual(state.stored, pdf);
  assert.deepEqual(
    state.calls.map((c) => c.name),
    ["pi_begin_document_upload", "pi_complete_document_upload"],
  );
  assert.equal(state.calls[0].body.request_uuid, input.request_id);
  assert.equal(state.calls[1].body.request_uuid, input.completion_id);
  const manifest = state.calls[0].body.manifest as Record<string, unknown>;
  assert.deepEqual(Object.keys(manifest).sort(), [
    "byte_size",
    "file_hash",
    "filename",
    "mime_type",
    "page_count",
  ]);
  assert.equal(manifest.page_count, 1);
  state.uploadError = true;
  assert.deepEqual(await executeDocumentUpload(client, request(), local), result);
  assert.equal(state.downloads, 2);
  const timeout = transport();
  timeout.state.uploadTimeout = true;
  assert.equal((await executeDocumentUpload(timeout.client, request(), local)).ok, true);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL|storage_path|file_hash|approved/);
});
test("document reconciliation: wrong path/identity, missing/corrupt/different readback and bad completion", async () => {
  for (const field of ["badPath", "badDocument"] as const) {
    const { client, state } = transport();
    state[field] = true;
    assert.equal((await executeDocumentUpload(client, request(), local)).ok, false);
    assert.equal(state.uploads, 0);
  }
  for (const mode of ["missing", "corrupt", "different"]) {
    const { client, state } = transport();
    state.downloadError = mode === "missing";
    if (mode === "corrupt") state.readback = Buffer.alloc(pdf.length);
    // Still parses, is exactly the same size, but a page box differs.
    if (mode === "different") {
      const plain = Buffer.from(await doc.save({ useObjectStreams: false }));
      const changed = Buffer.from(plain.toString("latin1").replace("200 200", "201 200"), "latin1");
      assert.equal(changed.length, plain.length);
      assert.notDeepEqual(changed, plain);
      state.readback = changed;
      assert.equal((await executeDocumentUpload(client, request(plain), local)).ok, false);
    } else assert.equal((await executeDocumentUpload(client, request(), local)).ok, false);
    assert.equal(
      state.calls.some((c) => c.name === "pi_complete_document_upload"),
      false,
    );
  }
  for (const mode of ["revoked", "receipt"]) {
    const { client, state } = transport();
    state.completeError = mode === "revoked" ? "42501" : "";
    state.badReceipt = mode === "receipt";
    assert.equal((await executeDocumentUpload(client, request(), local)).ok, false);
    assert.deepEqual(state.stored, pdf);
  }
});
test("document resources: shared image/document slots, per-actor lock and cancellation retain original", async () => {
  const first = transport();
  const imageRelease = claimOriginalWork(id(1));
  assert.ok(imageRelease);
  try {
    assert.deepEqual(
      await executeDocumentUpload(first.client, request(), local),
      documentUploadFailure("54000"),
    );
    assert.equal(first.state.calls.length, 0);
  } finally {
    imageRelease();
  }
  const releaseOne = claimOriginalWork(id(41));
  const releaseTwo = claimOriginalWork(id(42));
  assert.ok(releaseOne);
  assert.ok(releaseTwo);
  try {
    assert.deepEqual(
      await executeDocumentUpload(first.client, request(), local),
      documentUploadFailure("54000"),
    );
  } finally {
    releaseOne();
    releaseTwo();
  }
  const controller = new AbortController();
  first.state.onUpload = () => controller.abort();
  assert.equal(
    (await executeDocumentUpload(first.client, request(pdf, {}, {}, controller.signal), local)).ok,
    false,
  );
  assert.equal(first.state.downloads, 0);
  assert.equal(first.state.calls.length, 1);
  assert.deepEqual(first.state.stored, pdf);
  const next = transport();
  assert.equal((await executeDocumentUpload(next.client, request(), local)).ok, true);
});
test("document body: greater-than-10-MiB PDF preserves the complete raw buffer", async () => {
  const base = Buffer.from(await doc.save({ useObjectStreams: false }));
  // A legal trailing comment before EOF is bounded input, not extra pages or a rewritten upload.
  const marker = base.lastIndexOf("%%EOF");
  const large = Buffer.concat([
    base.subarray(0, marker),
    Buffer.from("%"),
    Buffer.alloc(11 * 1024 * 1024, 65),
    Buffer.from("\n"),
    base.subarray(marker),
  ]);
  const { client, state } = transport();
  assert.equal((await executeDocumentUpload(client, request(large), local)).ok, true);
  assert.deepEqual(state.stored, large);
});
