import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash, createHmac } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { inspectStoredDocument } from "../../lib/console/document-inspection.ts";
import {
  documentInspectionFailure,
  parseDocumentInspection,
  parseDocumentDownload,
} from "../../lib/domain/catalog/document-inspection.ts";
import { claimOriginalWork } from "../../lib/console/original-work.ts";
import {
  documentObservationKey,
  parseDocumentReviewSnapshot,
  signDocumentObservation,
} from "../../lib/console/document-observation.ts";

const id = (n: number) => `a5100000-0000-4000-8000-${String(n).padStart(12, "0")}`;
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
const input = { variant_id: id(2), document_id: id(3) };
const reviewInput = { candidate_id: id(5), revision: 1, digest: "b".repeat(64) };
const reviewSnapshot = {
  ...input,
  ...reviewInput,
  adoption_id: id(6),
  original_digest: "a".repeat(64),
  evidence_digest: "c".repeat(64),
};
const observedEnv = {
  ...local,
  CONSOLE_DOCUMENT_REVIEW_ENABLED: "true",
  CONSOLE_DOCUMENT_OBSERVATION_KEY_ID: id(7),
  CONSOLE_DOCUMENT_OBSERVATION_SECRET_HEX: "07".repeat(32),
};
const download = {
  document_id: id(3),
  filename: "synthetic.pdf",
  byte_size: pdf.length,
  page_count: 1,
};
function request(
  body: unknown = input,
  headers: Record<string, string> = {},
  signal?: AbortSignal,
) {
  return new Request(`${local.CONSOLE_ORIGIN}/console/documents/inspect`, {
    method: "POST",
    headers: {
      host: "127.0.0.1:3000",
      origin: local.CONSOLE_ORIGIN,
      "sec-fetch-site": "same-origin",
      "x-console-command": "1",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
    signal,
  });
}
function transport() {
  const state = {
    roles: ["owner"],
    signedIn: true,
    confirmed: true,
    actor: id(1),
    authReads: 0,
    reads: 0,
    snapshots: 0,
    reviewSnapshots: 0,
    reviewChange: (() => {}) as (value: Record<string, unknown>, number: number) => void,
    reviewError: "",
    rpcError: "",
    secondError: "",
    storageError: false,
    bytes: pdf,
    onRead: () => {},
    change: (() => {}) as (value: Record<string, unknown>, number: number) => void,
  };
  const path = `working-documents/${id(1)}/${id(4)}/original.pdf`;
  const provider = createClient<Database>(
    local.CONSOLE_SUPABASE_URL,
    local.CONSOLE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: async (url, options) => {
          const parsed = new URL(String(url));
          assert.equal(parsed.origin, local.CONSOLE_SUPABASE_URL, "No live provider requests");
          if (parsed.pathname === "/rest/v1/console_user_roles")
            return Response.json(state.roles.map((role) => ({ role })));
          if (parsed.pathname === "/rest/v1/rpc/pi_document_review_snapshot") {
            assert.deepEqual(JSON.parse(String(options?.body)), {
              candidate_uuid: reviewInput.candidate_id,
              expected_revision: 1,
              expected_digest: reviewInput.digest,
              observer_key_uuid: id(7),
            });
            state.reviewSnapshots++;
            if (state.reviewError)
              return Response.json(
                { code: state.reviewError, message: "PRIVATE_SENTINEL" },
                { status: 400 },
              );
            const value = { ...reviewSnapshot };
            state.reviewChange(value, state.reviewSnapshots);
            return Response.json(value);
          }
          if (parsed.pathname === "/rest/v1/rpc/pi_document_original_snapshot") {
            assert.deepEqual(JSON.parse(String(options?.body)), {
              variant_uuid: input.variant_id,
              document_uuid: input.document_id,
            });
            state.snapshots++;
            const code = state.snapshots === 1 ? state.rpcError : state.secondError;
            if (code) return Response.json({ code, message: "PRIVATE_SENTINEL" }, { status: 400 });
            const value = {
              ...input,
              intent_id: id(4),
              actor_id: id(1),
              storage_path: path,
              snapshot_digest: "a".repeat(64),
              manifest: {
                filename: download.filename,
                byte_size: state.bytes.length,
                page_count: 1,
                mime_type: "application/pdf",
                file_hash: createHash("sha256").update(state.bytes).digest("hex"),
              },
            };
            state.change(value, state.snapshots);
            return Response.json(value);
          }
          assert.equal(
            decodeURIComponent(parsed.pathname),
            `/storage/v1/object/pi-technical-evidence/${path}`,
          );
          assert.equal(options?.method, "GET");
          assert.equal(options?.cache, "no-store");
          assert.ok(options?.signal instanceof AbortSignal);
          state.reads++;
          state.onRead();
          if (state.storageError)
            return Response.json({ message: "PRIVATE_SENTINEL" }, { status: 404 });
          return new Response(Uint8Array.from(state.bytes), {
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
          data: {
            user: state.signedIn
              ? {
                  id: state.actor,
                  email_confirmed_at: state.confirmed ? "2026-10-12" : null,
                }
              : null,
          },
        };
      },
    },
  } as unknown as ConsoleClient;
  return { client, state };
}
test("document inspection: default-off, local boundary, origin, strict body before private read", async () => {
  for (const change of [
    { CONSOLE_DOCUMENTS_ENABLED: undefined },
    { CONSOLE_ENVIRONMENT: "staging" },
    { VERCEL: "1" },
    { CONSOLE_WORKING_ENABLED: "false" },
  ]) {
    const { client, state } = transport();
    assert.deepEqual(
      await inspectStoredDocument(client, request(), { ...local, ...change }),
      documentInspectionFailure("42501"),
    );
    assert.equal(state.authReads, 0);
  }
  for (const headers of [
    { origin: "https://example.invalid" },
    { host: "localhost:3000" },
    { "x-console-command": "0" },
    { "sec-fetch-site": "cross-site" },
  ] as Record<string, string>[]) {
    const { client, state } = transport();
    assert.equal(
      (
        await inspectStoredDocument(
          client,
          request(input, headers as Record<string, string>),
          local,
        )
      ).ok,
      false,
    );
    assert.equal(state.authReads, 0);
  }
  for (const body of [null, [], { ...input, approved: true }, { ...input, variant_id: "bad" }]) {
    assert.throws(() => parseDocumentInspection(body));
    const { client, state } = transport();
    assert.deepEqual(
      await inspectStoredDocument(client, request(body), local),
      documentInspectionFailure("22023"),
    );
    assert.equal(state.snapshots, 0);
  }
});
test("document inspection: all current reader roles, two snapshots, unchanged bytes, no private receipt fields", async () => {
  for (const role of ["owner", "editor", "reviewer", "publisher", "viewer"]) {
    const { client, state } = transport();
    state.roles = [role];
    const result = await inspectStoredDocument(client, request(), local);
    assert.deepEqual(result, { ok: true, bytes: pdf, download });
    assert.equal(state.snapshots, 2);
    assert.equal(state.reads, 1);
    assert.equal(state.authReads, 2);
    assert.doesNotMatch(
      JSON.stringify(result),
      /storage_path|file_hash|actor_id|snapshot_digest|PRIVATE_SENTINEL/,
    );
  }
});
test("document inspection: initial and mid-read access revocation, changed actor, sanitized errors", async () => {
  for (const phase of ["before", "during"])
    for (const mode of ["roles", "signedIn", "confirmed", "actor"] as const) {
      if (phase === "before" && mode === "actor") continue;
      const { client, state } = transport();
      const change = () => {
        if (mode === "roles") state.roles = [];
        else if (mode === "actor") state.actor = id(99);
        else state[mode] = false;
      };
      if (phase === "before") change();
      else state.onRead = change;
      assert.deepEqual(
        await inspectStoredDocument(client, request(), local),
        documentInspectionFailure("42501"),
      );
      assert.equal(state.snapshots, phase === "before" ? 0 : 1);
    }
  for (const code of ["42501", "40001", "PRIVATE_SENTINEL"])
    for (const field of ["rpcError", "secondError"] as const) {
      const { client, state } = transport();
      state[field] = code;
      assert.deepEqual(
        await inspectStoredDocument(client, request(), local),
        documentInspectionFailure(code),
      );
    }
});
test("document inspection: exact scope, snapshot, manifest and download contract", async () => {
  for (const change of [
    { document_id: id(99) },
    { storage_path: "private/elsewhere" },
    { actor_id: "bad" },
    { snapshot_digest: "bad" },
    { extra: true },
    { manifest: {} },
  ]) {
    const { client, state } = transport();
    state.change = (value) => Object.assign(value, change);
    assert.equal((await inspectStoredDocument(client, request(), local)).ok, false);
    assert.equal(state.reads, 0);
  }
  for (const field of ["snapshot_digest", "intent_id", "variant_id"]) {
    const { client, state } = transport();
    state.change = (value, n) => {
      if (n === 2) value[field] = field === "snapshot_digest" ? "b".repeat(64) : id(99);
    };
    assert.equal((await inspectStoredDocument(client, request(), local)).ok, false);
  }
  for (const change of [
    { filename: "CON.pdf" },
    { filename: "../x.pdf" },
    { filename: "x\u202e.pdf" },
    { byte_size: 26214401 },
    { byte_size: 0 },
    { page_count: 201 },
    { page_count: 0 },
    { approved: true },
  ])
    assert.throws(() => parseDocumentDownload({ ...download, ...change }));
});
test("document inspection: actual hash, pages, size, parse and missing object fail closed", async () => {
  for (const change of [
    { file_hash: "b".repeat(64) },
    { page_count: 2 },
    { byte_size: pdf.length + 1 },
  ]) {
    const { client, state } = transport();
    state.change = (value) => Object.assign(value.manifest as object, change);
    assert.equal((await inspectStoredDocument(client, request(), local)).ok, false);
    assert.equal(state.snapshots, 1);
  }
  for (const mode of ["corrupt", "missing", "active"]) {
    const { client, state } = transport();
    if (mode === "corrupt") state.bytes = Buffer.alloc(pdf.length);
    if (mode === "missing") state.storageError = true;
    if (mode === "active") {
      const active = await PDFDocument.create();
      active.addPage();
      active.addJavaScript("test", "void 0");
      state.bytes = Buffer.from(await active.save());
    }
    assert.equal((await inspectStoredDocument(client, request(), local)).ok, false);
    assert.equal(state.snapshots, 1);
  }
});
test("document inspection: cancellation and shared slots release on failure", async () => {
  const { client, state } = transport();
  const release = claimOriginalWork(id(1));
  assert.ok(release);
  try {
    assert.deepEqual(
      await inspectStoredDocument(client, request(), local),
      documentInspectionFailure("54000"),
    );
  } finally {
    release();
  }
  for (const phase of ["before", "during"]) {
    const controller = new AbortController();
    if (phase === "before") controller.abort();
    else state.onRead = () => controller.abort();
    assert.equal(
      (await inspectStoredDocument(client, request(input, {}, controller.signal), local)).ok,
      false,
    );
  }
  state.onRead = () => {};
  assert.equal((await inspectStoredDocument(client, request(), local)).ok, true);
});
test("document inspection: greater-than-10-MiB original is returned unchanged", async () => {
  const base = Buffer.from(await doc.save({ useObjectStreams: false }));
  const marker = base.lastIndexOf("%%EOF");
  const bytes = Buffer.concat([
    base.subarray(0, marker),
    Buffer.from("%"),
    Buffer.alloc(11 * 1024 * 1024, 65),
    Buffer.from("\n"),
    base.subarray(marker),
  ]);
  const { client, state } = transport();
  state.bytes = bytes;
  assert.deepEqual(await inspectStoredDocument(client, request(), local), {
    ok: true,
    bytes,
    download: { ...download, byte_size: bytes.length },
  });
});

test("document observation: owner/reviewer get a domain-bound signature only after both snapshots and actual PDF", async () => {
  for (const role of ["owner", "reviewer"]) {
    const { client, state } = transport();
    state.roles = [role];
    const result = await inspectStoredDocument(client, request(reviewInput), observedEnv);
    assert.equal(result.ok, true);
    assert.ok(result.ok && result.observation);
    assert.deepEqual(result.bytes, pdf);
    assert.deepEqual(result.download, download);
    const parts = result.observation.split("|");
    assert.equal(parts.length, 15);
    assert.deepEqual(parts.slice(0, 11), [
      "document-v1",
      id(7),
      id(1),
      id(6),
      id(5),
      id(3),
      id(2),
      "1",
      "b".repeat(64),
      "a".repeat(64),
      "c".repeat(64),
    ]);
    assert.equal(Number(parts[12]) - Number(parts[11]), 300);
    assert.match(parts[13], /^[a-f0-9-]{36}$/);
    assert.equal(
      parts[14],
      createHmac("sha256", Buffer.alloc(32, 7)).update(parts.slice(0, 14).join("|")).digest("hex"),
    );
    assert.equal(state.reviewSnapshots, 2);
    assert.equal(state.snapshots, 2);
    assert.equal(state.reads, 1);
    assert.ok(!JSON.stringify(result.download).includes("digest"));
  }
  const { client } = transport();
  const ordinary = await inspectStoredDocument(client, request(input), observedEnv);
  assert.ok(
    ordinary.ok && !("observation" in ordinary),
    "Ordinary download never issues an approval token.",
  );
});

test("document observation: separate flag, secret and current reviewer role precede any private snapshot", async () => {
  for (const change of [
    { CONSOLE_DOCUMENT_REVIEW_ENABLED: undefined },
    { CONSOLE_DOCUMENT_OBSERVATION_KEY_ID: undefined },
    { CONSOLE_DOCUMENT_OBSERVATION_SECRET_HEX: undefined },
    { CONSOLE_DOCUMENT_OBSERVATION_SECRET_HEX: "bad" },
    { CONSOLE_DOCUMENTS_ENABLED: "false" },
  ]) {
    const { client, state } = transport();
    assert.deepEqual(
      await inspectStoredDocument(client, request(reviewInput), { ...observedEnv, ...change }),
      documentInspectionFailure("42501"),
    );
    assert.equal(state.reads + state.snapshots + state.reviewSnapshots, 0);
  }
  for (const role of ["editor", "viewer", "publisher"]) {
    const { client, state } = transport();
    state.roles = [role];
    assert.deepEqual(
      await inspectStoredDocument(client, request(reviewInput), observedEnv),
      documentInspectionFailure("42501"),
    );
    assert.equal(state.reads + state.snapshots + state.reviewSnapshots, 0);
  }
});

test("document observation: strict input/snapshot identity and bounded signing fields", async () => {
  for (const value of [
    { ...reviewInput, approved: true },
    { ...reviewInput, revision: 0 },
    { ...reviewInput, revision: 1e15 },
    { ...reviewInput, digest: "bad" },
    { ...reviewInput, candidate_id: "bad" },
  ]) {
    assert.throws(() => parseDocumentInspection(value));
    const { client, state } = transport();
    assert.deepEqual(
      await inspectStoredDocument(client, request(value), observedEnv),
      documentInspectionFailure("22023"),
    );
    assert.equal(state.reviewSnapshots + state.reads, 0);
  }
  for (const change of [
    { candidate_id: id(9) },
    { revision: 2 },
    { digest: "d".repeat(64) },
    { original_digest: "d".repeat(64) },
    { evidence_digest: "bad" },
    { storage_path: "private" },
    { adoption_id: "bad" },
  ]) {
    const { client, state } = transport();
    state.reviewChange = (value) => Object.assign(value, change);
    assert.deepEqual(
      await inspectStoredDocument(client, request(reviewInput), observedEnv),
      documentInspectionFailure("40001"),
    );
    assert.equal(state.reads, 0);
  }
  assert.equal(parseDocumentReviewSnapshot(null), null);
  assert.equal(
    documentObservationKey({
      CONSOLE_MEDIA_OBSERVATION_KEY_ID: id(7),
      CONSOLE_MEDIA_OBSERVATION_SECRET_HEX: "07".repeat(32),
    }),
    null,
  );
  const key = documentObservationKey(observedEnv)!;
  for (const now of [0, -1, NaN, 1.5, 9999999700])
    assert.throws(() => signDocumentObservation(reviewSnapshot, id(1), key, now));
  assert.throws(() => signDocumentObservation(reviewSnapshot, "bad", key));
  assert.throws(() =>
    signDocumentObservation(reviewSnapshot, id(1), { id: id(7), secret: Buffer.alloc(31) }),
  );
});

test("document observation: mid-read role, candidate, evidence, original and configuration changes release no token", async () => {
  for (const field of [
    "candidate_id",
    "document_id",
    "variant_id",
    "adoption_id",
    "revision",
    "digest",
    "original_digest",
    "evidence_digest",
  ]) {
    const { client, state } = transport();
    state.reviewChange = (value, count) => {
      if (count === 2)
        value[field] = field.endsWith("_id") ? id(99) : field === "revision" ? 2 : "d".repeat(64);
    };
    assert.deepEqual(
      await inspectStoredDocument(client, request(reviewInput), observedEnv),
      documentInspectionFailure("40001"),
    );
  }
  for (const change of ["role", "actor", "key", "object", "abort", "bytes"] as const) {
    const { client, state } = transport();
    const controller = new AbortController();
    state.onRead = () => {
      if (change === "role") state.roles = ["viewer"];
      if (change === "actor") state.actor = id(99);
      if (change === "key") state.reviewError = "55000";
      if (change === "object") state.secondError = "40001";
      if (change === "abort") controller.abort();
    };
    if (change === "bytes") state.bytes = Buffer.from("not an actual PDF");
    const result = await inspectStoredDocument(
      client,
      request(reviewInput, {}, controller.signal),
      observedEnv,
    );
    assert.equal(result.ok, false);
    assert.ok(!JSON.stringify(result).includes("PRIVATE_SENTINEL"));
    assert.ok(!("observation" in result));
    const release = claimOriginalWork(id(1));
    assert.ok(release, "Failure releases the shared work slot.");
    release();
  }
});
