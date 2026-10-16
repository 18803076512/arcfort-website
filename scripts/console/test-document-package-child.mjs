import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createHash, createHmac } from "node:crypto";
import path from "node:path";

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const fixture = JSON.parse(Buffer.concat(chunks).toString("utf8"));
const pdf = Buffer.from(fixture.pdf, "base64");
const inspection = fixture.mode === "inspect";
const require = createRequire(import.meta.url);
assert.ok(
  require.resolve("pdf-lib").startsWith(process.cwd() + path.sep),
  "No ancestor PDF dependency fallback.",
);
const { routeModule } = require(path.resolve(fixture.route));
const { POST, GET, HEAD, OPTIONS, PUT, PATCH, DELETE } = routeModule.userland;
const id = (n) => `a3200000-0000-4000-8000-${String(n).padStart(12, "0")}`;
Object.assign(process.env, {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_DOCUMENTS_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_package_check",
});
const input = {
  request_id: id(10),
  completion_id: id(11),
  document_id: id(12),
  filename: "synthetic.pdf",
  byte_size: pdf.length,
};
const objectPath = `working-documents/${id(1)}/${id(3)}/original.pdf`;
const user = {
  id: id(1),
  email: "synthetic@example.invalid",
  email_confirmed_at: "2026-10-11T00:00:00Z",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
};
const token =
  [
    { alg: "HS256", typ: "JWT" },
    {
      sub: id(1),
      role: "authenticated",
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
  ]
    .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
    .join(".") + ".synthetic_signature";
const session = {
  access_token: token,
  refresh_token: "synthetic_refresh_only",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: "bearer",
  user,
};
let calls = 0;
let refreshes = 0;
let role = "owner";
let completionError = "";
let stored = inspection ? pdf : undefined;
let complete = 0;
let badProvider = false;
let badReadback = false;
let providerThrow = false;
globalThis.fetch = async (url, options) => {
  calls++;
  const parsed = new URL(String(url));
  assert.equal(parsed.origin, "http://127.0.0.1:54321", "Unexpected provider destination.");
  assert.equal(options.cache, "no-store");
  assert.ok(options.signal, "Provider requests must have a deadline.");
  if (providerThrow) throw new Error("PRIVATE_SENTINEL");
  if (parsed.pathname === "/auth/v1/settings")
    return Response.json({
      disable_signup: !badProvider,
      mailer_autoconfirm: false,
      external: { email: true },
    });
  if (parsed.pathname === "/auth/v1/token") {
    refreshes++;
    return Response.json(session);
  }
  if (parsed.pathname === "/auth/v1/user") return Response.json(user);
  if (parsed.pathname === "/rest/v1/console_user_roles") return Response.json([{ role }]);
  if (parsed.pathname === "/rest/v1/rpc/pi_document_review_snapshot") {
    assert.ok(inspection);
    assert.deepEqual(JSON.parse(options.body), {
      candidate_uuid: id(21),
      expected_revision: 1,
      expected_digest: "b".repeat(64),
      observer_key_uuid: id(23),
    });
    return Response.json({
      candidate_id: id(21),
      document_id: id(12),
      variant_id: id(20),
      adoption_id: id(22),
      revision: 1,
      digest: "b".repeat(64),
      original_digest: "a".repeat(64),
      evidence_digest: "c".repeat(64),
    });
  }
  if (parsed.pathname === "/rest/v1/rpc/pi_document_original_snapshot") {
    assert.ok(inspection);
    assert.deepEqual(JSON.parse(options.body), { variant_uuid: id(20), document_uuid: id(12) });
    if (completionError)
      return Response.json({ code: completionError, message: "PRIVATE_SENTINEL" }, { status: 400 });
    return Response.json({
      variant_id: id(20),
      document_id: id(12),
      actor_id: id(1),
      intent_id: id(3),
      storage_path: objectPath,
      snapshot_digest: "a".repeat(64),
      manifest: {
        filename: input.filename,
        byte_size: pdf.length,
        page_count: 1,
        mime_type: "application/pdf",
        file_hash: createHash("sha256").update(pdf).digest("hex"),
      },
    });
  }
  if (parsed.pathname === "/rest/v1/rpc/pi_begin_document_upload") {
    const body = JSON.parse(options.body);
    assert.equal(body.document_uuid, id(12));
    assert.equal(body.manifest.page_count, 1);
    assert.equal(body.manifest.byte_size, pdf.length);
    assert.equal(body.manifest.mime_type, "application/pdf");
    return Response.json({ intent_id: id(3), document_id: id(12), storage_path: objectPath });
  }
  if (parsed.pathname === "/rest/v1/rpc/pi_complete_document_upload") {
    complete++;
    if (completionError)
      return Response.json({ code: completionError, message: "PRIVATE_SENTINEL" }, { status: 400 });
    return Response.json({ intent_id: id(3), document_id: id(12), secret: "PRIVATE_SENTINEL" });
  }
  assert.equal(
    decodeURIComponent(parsed.pathname),
    `/storage/v1/object/pi-technical-evidence/${objectPath}`,
  );
  if (options.method === "POST") {
    const headers = new Headers(options.headers);
    assert.equal(headers.get("x-upsert"), "false");
    assert.equal(headers.get("content-type"), "application/pdf");
    assert.deepEqual(Buffer.from(options.body), pdf);
    if (stored)
      return Response.json(
        { statusCode: "409", message: "Exists", error: "Duplicate" },
        { status: 409 },
      );
    stored = Buffer.from(options.body);
    return Response.json({ Id: id(2), Key: objectPath });
  }
  assert.equal(options.method, "GET");
  assert.ok(stored);
  return new Response(Uint8Array.from(badReadback ? Buffer.alloc(pdf.length) : stored));
};
function request({
  cookies = true,
  expired = false,
  headers = {},
  body = inspection
    ? Buffer.from(JSON.stringify({ variant_id: id(20), document_id: id(12) }))
    : pdf,
} = {}) {
  const cookieSession = expired ? { ...session, expires_at: 1 } : session;
  const request = new Request(`http://127.0.0.1:3000/console/documents/${fixture.mode}`, {
    method: "POST",
    headers: {
      host: "127.0.0.1:3000",
      origin: "http://127.0.0.1:3000",
      "sec-fetch-site": "same-origin",
      "x-console-command": "1",
      "content-type": inspection ? "application/json" : "application/pdf",
      "x-console-document": encodeURIComponent(JSON.stringify(input)),
      ...(cookies
        ? {
            cookie: `sb-127-auth-token=base64-${Buffer.from(JSON.stringify(cookieSession)).toString("base64url")}`,
          }
        : {}),
      ...headers,
    },
    body: Uint8Array.from(body),
  });
  // Direct handler harness, not a Next HTTP server: provide its request-cookie interface.
  const jar = new Map(
    cookies
      ? [
          [
            "sb-127-auth-token",
            `base64-${Buffer.from(JSON.stringify(cookieSession)).toString("base64url")}`,
          ],
        ]
      : [],
  );
  return Object.assign(request, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      set: (name, value) => jar.set(name, value),
    },
  });
}
async function check(response, status) {
  assert.equal(response.status, status);
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  assert.match(response.headers.get("x-robots-tag"), /noindex.*nofollow/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  if (status !== 200) assert.equal(response.headers.has("x-console-document-observation"), false);
  if (inspection && status === 200) {
    assert.equal(response.headers.get("content-type"), "application/pdf");
    assert.equal(response.headers.get("content-length"), String(pdf.length));
    assert.equal(response.headers.get("content-security-policy"), "sandbox; default-src 'none'");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("cross-origin-resource-policy"), "same-origin");
    assert.match(
      response.headers.get("content-disposition"),
      /^attachment;.*filename\*=UTF-8''synthetic.pdf$/,
    );
    assert.deepEqual(JSON.parse(decodeURIComponent(response.headers.get("x-console-document"))), {
      document_id: id(12),
      filename: input.filename,
      byte_size: pdf.length,
      page_count: 1,
    });
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), pdf);
    return null;
  }
  const text = await response.text();
  assert.doesNotMatch(
    text,
    /PRIVATE_SENTINEL|storage_path|file_hash|working-documents|synthetic_refresh|synthetic_signature/,
  );
  return text ? JSON.parse(text) : null;
}
for (const handler of [GET, HEAD, OPTIONS, PUT, PATCH, DELETE]) {
  const result = handler();
  assert.equal(result.headers.get("allow"), "POST");
  await check(result, 405);
}
process.env.CONSOLE_DOCUMENTS_ENABLED = "false";
await check(await POST(request()), 403);
assert.equal(calls, 0);
process.env.CONSOLE_DOCUMENTS_ENABLED = "true";
await check(await POST(request({ headers: { origin: "https://invalid.example" } })), 403);
assert.equal(calls, 0);
await check(await POST(request({ cookies: false })), 403);
role = "viewer";
await check(await POST(request()), inspection ? 200 : 403);
role = "owner";
badProvider = true;
await check(await POST(request()), 503);
badProvider = false;
providerThrow = true;
await check(await POST(request()), 503);
providerThrow = false;
await check(
  await POST(
    request(inspection ? { body: Buffer.from("{}") } : { headers: { "x-console-document": "%" } }),
  ),
  422,
);
const result = await POST(request({ expired: true }));
assert.ok(refreshes > 0, "Actual SSR refresh branch must run.");
const refreshed = result.headers.getSetCookie();
assert.ok(refreshed.some((cookie) => /sb-127-auth-token=/.test(cookie)));
for (const cookie of refreshed) {
  assert.match(cookie, /Path=\/console(?:;|$)/i);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=lax/i);
}
assert.deepEqual(
  await check(result, 200),
  inspection ? null : { ok: true, intent_id: id(3), document_id: id(12) },
);
assert.deepEqual(stored, pdf);
assert.equal(complete, inspection ? 0 : 1);
await check(await POST(request()), 200);
assert.equal(complete, inspection ? 0 : 2);
badReadback = true;
await check(await POST(request()), 503);
assert.equal(complete, inspection ? 0 : 2);
badReadback = false;
completionError = "42501";
await check(await POST(request()), 403);
completionError = "54000";
await check(await POST(request()), 429);
completionError = "40001";
await check(await POST(request()), 409);
completionError = "unknown_private_failure";
await check(await POST(request()), 503);
if (inspection) {
  completionError = "";
  const body = Buffer.from(
    JSON.stringify({ candidate_id: id(21), revision: 1, digest: "b".repeat(64) }),
  );
  await check(await POST(request({ body })), 403);
  Object.assign(process.env, {
    CONSOLE_DOCUMENT_REVIEW_ENABLED: "true",
    CONSOLE_DOCUMENT_OBSERVATION_KEY_ID: id(23),
    CONSOLE_DOCUMENT_OBSERVATION_SECRET_HEX: "07".repeat(32),
  });
  role = "viewer";
  await check(await POST(request({ body })), 403);
  role = "reviewer";
  const observed = await POST(request({ body }));
  const parts = observed.headers.get("x-console-document-observation")?.split("|");
  assert.equal(parts?.length, 15);
  assert.deepEqual(parts.slice(0, 11), [
    "document-v1",
    id(23),
    id(1),
    id(22),
    id(21),
    id(12),
    id(20),
    "1",
    "b".repeat(64),
    "a".repeat(64),
    "c".repeat(64),
  ]);
  assert.equal(
    parts[14],
    createHmac("sha256", Buffer.alloc(32, 7)).update(parts.slice(0, 14).join("|")).digest("hex"),
  );
  await check(observed, 200);
  const ordinary = await POST(request());
  assert.equal(ordinary.headers.get("x-console-document-observation"), null);
  await check(ordinary, 200);
  console.log(
    "PASS traced document observation header: explicit flag/key/reviewer, actual PDF validation, domain-bound HMAC and unchanged ordinary download.",
  );
}
console.log(
  `PASS traced ${fixture.mode} route: isolated PDF child/dependencies, >10-MiB unchanged bytes, SSR refresh cookies, all seven response statuses and private errors. Mock provider only.`,
);
