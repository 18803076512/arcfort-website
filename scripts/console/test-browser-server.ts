import assert from "node:assert/strict";
import { mkdtemp, rm, rmdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createServer } from "node:net";
import path from "node:path";
import { test } from "node:test";
import {
  assertNoRuntimeEnvFiles,
  assertPortAvailable,
  browserServerEnvironment,
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
    HTTP_PROXY: "do-not-pass",
  });
  assert.equal(env.CONSOLE_SUPABASE_URL, "http://127.0.0.1:54321");
  assert.equal(env.NODE_ENV, "production");
  assert.equal(env.PATH, "synthetic-path");
  assert.equal(env.SystemRoot, "synthetic-root");
  assert.ok(!JSON.stringify(env).includes("do-not-pass"));
  assert.throws(() => browserServerEnvironment("sb_secret_synthetic", { CI: "true" }));
  assert.throws(() => browserServerEnvironment("sb_publishable_synthetic", {}));
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

test("private response checks fail on cache, indexing or referrer regression", () => {
  const good = {
    "cache-control": "private, no-store, max-age=0",
    "x-robots-tag": "noindex, nofollow",
    "referrer-policy": "no-referrer",
  };
  privateResponse(good);
  for (const key of Object.keys(good)) assert.throws(() => privateResponse({ ...good, [key]: "" }));
});
