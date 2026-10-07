import assert from "node:assert/strict";
import { mkdtemp, rm, rmdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createServer } from "node:net";
import path from "node:path";
import { test } from "node:test";
import {
  assertNoRuntimeEnvFiles,
  assertPortAvailable,
  assertProviderAbsent,
  browserServerEnvironment,
  browserBuildEnvironment,
  privateResponse,
  runtimeEnvFiles,
} from "./browser-server.ts";

test("browser server receives only system paths and local public configuration", () => {
  const env = browserServerEnvironment("sb_publishable_synthetic", {
    CI: "true",
    PATH: "synthetic-path",
    SystemRoot: "synthetic-root",
    SUPABASE_SERVICE_ROLE_KEY: "placeholder-do-not-pass",
    RESEND_API_KEY: "placeholder-do-not-pass",
    DATABASE_URL: "placeholder-do-not-pass",
    NODE_OPTIONS: "do-not-pass",
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "do-not-pass",
    CONSOLE_SUPABASE_URL: "https://hosted.example.invalid",
    CONSOLE_COMPATIBILITY_ENABLED: "true",
    CONSOLE_ORIGINALS_ENABLED: "true",
    CONSOLE_MEDIA_REVIEW_ENABLED: "true",
    CONSOLE_OEM_ENABLED: "true",
    CONSOLE_MEDIA_OBSERVATION_KEY_ID: "do-not-pass",
    CONSOLE_MEDIA_OBSERVATION_SECRET_HEX: "do-not-pass",
    HTTP_PROXY: "do-not-pass",
  });
  assert.equal(env.CONSOLE_SUPABASE_URL, "http://127.0.0.1:54321");
  assert.equal(env.NODE_ENV, "production");
  assert.equal(env.CONSOLE_COMPATIBILITY_ENABLED, undefined);
  assert.equal(env.CONSOLE_ORIGINALS_ENABLED, undefined);
  assert.equal(env.CONSOLE_MEDIA_REVIEW_ENABLED, undefined);
  assert.equal(env.CONSOLE_OEM_ENABLED, undefined);
  assert.equal(env.CONSOLE_MEDIA_OBSERVATION_KEY_ID, undefined);
  assert.equal(env.CONSOLE_MEDIA_OBSERVATION_SECRET_HEX, undefined);
  assert.equal(env.PATH, "synthetic-path");
  assert.equal(env.SystemRoot, "synthetic-root");
  assert.ok(!JSON.stringify(env).includes("do-not-pass"));
  assert.throws(() => browserServerEnvironment("sb_secret_synthetic", { CI: "true" }));
  assert.throws(() => browserServerEnvironment("sb_publishable_synthetic", {}));
});

test("packaging requires a separate explicit local option and strips ambient activation", () => {
  const ambient = { CI: "true", CONSOLE_PACKAGING_ENABLED: "true" };
  assert.equal(
    browserServerEnvironment("sb_publishable_synthetic", ambient).CONSOLE_PACKAGING_ENABLED,
    undefined,
  );
  const env = browserServerEnvironment("sb_publishable_synthetic", ambient, { packaging: true });
  assert.equal(env.CONSOLE_PACKAGING_ENABLED, "true");
  assert.equal(env.CONSOLE_OEM_ENABLED, undefined);
  assert.equal(env.CONSOLE_ORIGINALS_ENABLED, undefined);
  assert.equal(browserBuildEnvironment(env).CONSOLE_PACKAGING_ENABLED, "true");
  assert.throws(() =>
    browserServerEnvironment("sb_secret_synthetic", ambient, { packaging: true }),
  );
  assert.throws(() =>
    browserServerEnvironment("sb_publishable_synthetic", {}, { packaging: true }),
  );
});

test("OEM requires a separate explicit local option and preserves build isolation", () => {
  const ambient = { CI: "true", CONSOLE_OEM_ENABLED: "true" };
  assert.equal(
    browserServerEnvironment("sb_publishable_synthetic", ambient).CONSOLE_OEM_ENABLED,
    undefined,
  );
  const env = browserServerEnvironment("sb_publishable_synthetic", ambient, { oem: true });
  assert.equal(env.CONSOLE_OEM_ENABLED, "true");
  assert.equal(env.CONSOLE_COMPATIBILITY_ENABLED, undefined);
  assert.equal(env.CONSOLE_ORIGINALS_ENABLED, undefined);
  assert.equal(env.CONSOLE_MEDIA_REVIEW_ENABLED, undefined);
  assert.equal(browserBuildEnvironment(env).CONSOLE_OEM_ENABLED, "true");
  assert.equal(browserBuildEnvironment(env).CONSOLE_MEDIA_OBSERVATION_SECRET_HEX, undefined);
  assert.throws(() => browserServerEnvironment("sb_secret_synthetic", ambient, { oem: true }));
  assert.throws(() => browserServerEnvironment("sb_publishable_synthetic", {}, { oem: true }));
});

test("compatibility acceptance requires an explicit exact-local server option", () => {
  const env = browserServerEnvironment(
    "sb_publishable_synthetic",
    { CI: "true" },
    { compatibility: true },
  );
  assert.equal(env.CONSOLE_COMPATIBILITY_ENABLED, "true");
  assert.equal(env.CONSOLE_ENVIRONMENT, "local");
  assert.equal(env.CONSOLE_SUPABASE_URL, "http://127.0.0.1:54321");
  assert.equal(env.CONSOLE_ORIGINALS_ENABLED, undefined);
  assert.throws(() =>
    browserServerEnvironment("sb_secret_synthetic", { CI: "true" }, { compatibility: true }),
  );
  assert.throws(() =>
    browserServerEnvironment("sb_publishable_synthetic", {}, { compatibility: true }),
  );
});

test("original upload requires a separate exact-local server option", () => {
  const env = browserServerEnvironment(
    "sb_publishable_synthetic",
    { CI: "true" },
    { originals: true },
  );
  assert.equal(env.CONSOLE_ORIGINALS_ENABLED, "true");
  assert.equal(env.CONSOLE_COMPATIBILITY_ENABLED, undefined);
  assert.equal(env.CONSOLE_SUPABASE_URL, "http://127.0.0.1:54321");
  assert.throws(() =>
    browserServerEnvironment("sb_secret_synthetic", { CI: "true" }, { originals: true }),
  );
  assert.throws(() =>
    browserServerEnvironment("sb_publishable_synthetic", {}, { originals: true }),
  );
});

test("every Next production env filename is refused without reading or deleting it", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "arcfort-browser-env-"));
  try {
    assertNoRuntimeEnvFiles(directory);
    for (const name of runtimeEnvFiles) {
      await writeFile(path.join(directory, name), "SYNTHETIC_TEST_ONLY=1\n");
      assert.throws(() => assertNoRuntimeEnvFiles(directory));
      await rm(path.join(directory, name));
    }
  } finally {
    for (const name of runtimeEnvFiles) await rm(path.join(directory, name), { force: true });
    await rmdir(directory);
  }
});

test("media observation is explicit, original-dependent and runtime-only", () => {
  const observer = { id: "e8129259-514d-4e45-85cb-d8ea0ca198a5", secretHex: "a".repeat(64) };
  assert.throws(() =>
    browserServerEnvironment("sb_publishable_synthetic", { CI: "true" }, { observer }),
  );
  for (const invalid of [
    { ...observer, id: "invalid" },
    { ...observer, secretHex: "invalid" },
  ])
    assert.throws(() =>
      browserServerEnvironment(
        "sb_publishable_synthetic",
        { CI: "true" },
        { originals: true, observer: invalid },
      ),
    );
  const runtime = browserServerEnvironment(
    "sb_publishable_synthetic",
    { CI: "true" },
    { originals: true, observer },
  );
  assert.equal(runtime.CONSOLE_MEDIA_REVIEW_ENABLED, "true");
  assert.equal(runtime.CONSOLE_MEDIA_OBSERVATION_KEY_ID, observer.id);
  assert.equal(runtime.CONSOLE_MEDIA_OBSERVATION_SECRET_HEX, observer.secretHex);
  const build = browserBuildEnvironment(runtime);
  assert.equal(build.CONSOLE_MEDIA_REVIEW_ENABLED, "true");
  assert.equal(build.CONSOLE_MEDIA_OBSERVATION_KEY_ID, undefined);
  assert.equal(build.CONSOLE_MEDIA_OBSERVATION_SECRET_HEX, undefined);
  assert.equal(runtime.CONSOLE_MEDIA_OBSERVATION_SECRET_HEX, observer.secretHex);
});

test("a busy local port is refused and its existing owner is left running", async () => {
  const owner = createServer();
  await new Promise<void>((resolve) => owner.listen(0, "127.0.0.1", resolve));
  try {
    const address = owner.address();
    assert.ok(address && typeof address !== "string");
    await assert.rejects(() => assertPortAvailable(address.port));
    assert.equal(owner.listening, true);
  } finally {
    await new Promise<void>((resolve) => owner.close(() => resolve()));
  }
  await assertPortAvailable(0);
});

test("provider absence requires connection refusal, not a free bind, HTTP error or policy denial", async () => {
  const failure = (code: string) => new TypeError("synthetic network error", { cause: { code } });
  await assertProviderAbsent(async (url, init) => {
    assert.equal(url, "http://127.0.0.1:54321/auth/v1/settings");
    assert.equal(init?.cache, "no-store");
    assert.equal(
      new Headers(init?.headers).get("apikey"),
      "sb_publishable_synthetic_provider_absent",
    );
    throw failure("ECONNREFUSED");
  });
  for (const status of [200, 401, 403, 404, 500])
    await assert.rejects(() =>
      assertProviderAbsent(async () => new Response("SYNTHETIC", { status })),
    );
  for (const code of ["EACCES", "ETIMEDOUT", "ENETUNREACH", "ECONNRESET"])
    await assert.rejects(() =>
      assertProviderAbsent(async () => {
        throw failure(code);
      }),
    );
  await assert.rejects(() =>
    assertProviderAbsent(async () => {
      throw new Error("synthetic private details");
    }),
  );
});

test("private response checks fail on cache, indexing or referrer regression", () => {
  const good = {
    "cache-control": "private, no-store, max-age=0",
    "x-robots-tag": "noindex, nofollow",
    "referrer-policy": "no-referrer",
  };
  privateResponse(good);
  for (const key of Object.keys(good)) assert.throws(() => privateResponse({ ...good, [key]: "" }));
});
