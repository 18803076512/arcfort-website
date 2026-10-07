import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import {
  assertAcceptanceInvocation,
  assertLocalContainer,
  assertLocalDocker,
  assertPristineBaseline,
  readLocalStatus,
  sqlLiteral,
} from "./local-acceptance.ts";

test("isolated acceptance requires exact CI/local invocation", () => {
  assert.deepEqual(assertAcceptanceInvocation(["--local"], { CI: "true" }), {
    oem: false,
    packaging: false,
  });
  assert.deepEqual(assertAcceptanceInvocation(["--local", "--oem"], { CI: "true" }), {
    oem: true,
    packaging: false,
  });
  assert.deepEqual(assertAcceptanceInvocation(["--local", "--packaging"], { CI: "true" }), {
    oem: false,
    packaging: true,
  });
  for (const switches of [
    ["--oem", "--packaging"],
    ["--packaging", "--oem"],
  ])
    assert.deepEqual(assertAcceptanceInvocation(["--local", ...switches], { CI: "true" }), {
      oem: true,
      packaging: true,
    });
  for (const args of [
    [],
    ["--staging"],
    ["--local", "--staging"],
    ["--local", "--local"],
    ["--local", "--linked"],
    ["--oem"],
    ["--oem", "--local"],
    ["--local", "--oem", "--oem"],
    ["--local", "--oem=true"],
    ["--local", "--oem", "--staging"],
    ["--packaging"],
    ["--packaging", "--local"],
    ["--local", "--packaging=true"],
    ["--local", "--packaging", "--packaging"],
    ["--local", "--packaging", "--staging"],
  ])
    assert.throws(() => assertAcceptanceInvocation(args, { CI: "true" }));
  for (const CI of [undefined, "false", "1"])
    assert.throws(() => assertAcceptanceInvocation(["--local"], { CI }));
});

test("the integrated runner refuses a non-local target before host or provider access", () => {
  for (const args of [
    ["--staging"],
    ["--local", "--oem", "--staging"],
    ["--oem", "--local"],
    ["--local", "--packaging", "--staging"],
    ["--packaging", "--local"],
  ]) {
    const result = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "scripts/console/test-working-isolated.ts", ...args],
      {
        env: {
          NODE_ENV: "test",
          CI: "true",
          SystemRoot: process.env.SystemRoot,
          PATH: process.env.PATH,
        },
        encoding: "utf8",
        timeout: 20_000,
        windowsHide: true,
      },
    );
    assert.equal(result.error, undefined);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(
      result.stderr,
      /Working Console isolated acceptance failed at: local target preflight/,
    );
  }
});

test("ambient provider, database, Docker and runtime overrides fail closed", () => {
  for (const key of [
    "CONSOLE_SUPABASE_URL",
    "CONSOLE_ENVIRONMENT",
    "CONSOLE_OEM_ENABLED",
    "CONSOLE_PACKAGING_ENABLED",
    "PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ACCESS_TOKEN",
    "NEXT_PUBLIC_SUPABASE_URL",
    "DATABASE_URL",
    "PGHOST",
    "PGSERVICEFILE",
    "PGPASSFILE",
    "DOCKER_HOST",
    "DOCKER_CONTEXT",
    "DOCKER_TLS_VERIFY",
    "VERCEL",
    "NODE_OPTIONS",
    "NODE_USE_ENV_PROXY",
  ])
    assert.throws(() =>
      assertAcceptanceInvocation(["--local"], { CI: "true", [key]: "synthetic-override" }),
    );
  assert.throws(() =>
    assertAcceptanceInvocation(["--local", "--oem"], {
      CI: "true",
      CONSOLE_OEM_ENABLED: "true",
    }),
  );
  assertAcceptanceInvocation(["--local"], {
    CI: "true",
    SUPABASE_TELEMETRY_DISABLED: "1",
    PATH: "synthetic-path",
  });
});

test("Docker context must use a local Unix socket or Windows named pipe", () => {
  for (const endpoint of [
    "unix:///var/run/docker.sock",
    "unix:///home/runner/.docker/run/docker.sock",
    "npipe:////./pipe/docker_engine",
  ])
    assertLocalDocker(endpoint);
  for (const endpoint of [
    "",
    "tcp://127.0.0.1:2375",
    "tcp://remote.example.invalid:2376",
    "ssh://remote.example.invalid",
    "http://localhost",
    "unix://remote/socket",
    "unix:///socket\nssh://host",
  ])
    assert.throws(() => assertLocalDocker(endpoint));
});

test("container identity, running state and expected port are required", () => {
  const good = {
    Name: "/supabase_db_arcfort-product-intelligence",
    Config: { Labels: { "com.supabase.cli.project": "arcfort-product-intelligence" } },
    State: { Running: true },
    NetworkSettings: { Ports: { "5432/tcp": [{ HostPort: "54322" }] } },
  };
  assertLocalContainer([good]);
  for (const bad of [
    null,
    [],
    [good, good],
    [{ ...good, Name: "/other" }],
    [{ ...good, Config: {} }],
    [{ ...good, State: { Running: false } }],
    [{ ...good, NetworkSettings: { Ports: {} } }],
  ])
    assert.throws(() => assertLocalContainer(bad));
});

test("CLI status cannot redirect either HTTP or database connections", () => {
  const good = {
    API_URL: "http://127.0.0.1:54321",
    DB_URL: "postgresql://postgres:synthetic@127.0.0.1:54322/postgres",
    ANON_KEY: "synthetic-anonymous-key-for-tests",
    SERVICE_ROLE_KEY: "synthetic-service-key-for-tests",
  };
  assert.equal(readLocalStatus(good).url, good.API_URL);
  for (const API_URL of [
    "http://localhost:54321",
    "https://hosted.example.invalid",
    "http://127.0.0.1:54321/",
    "http://127.0.0.1:54321@remote.example.invalid",
  ])
    assert.throws(() => readLocalStatus({ ...good, API_URL }));
  for (const DB_URL of [
    "postgresql://postgres@remote.example.invalid:54322/postgres",
    "postgresql://postgres@127.0.0.1:6543/postgres",
    "postgresql://other@127.0.0.1:54322/postgres",
    "postgresql://postgres@127.0.0.1:54322/other",
    good.DB_URL + "?host=remote.example.invalid",
    good.DB_URL + "#remote",
  ])
    assert.throws(() => readLocalStatus({ ...good, DB_URL }));
  assert.throws(() => readLocalStatus({ ...good, SERVICE_ROLE_KEY: good.ANON_KEY }));
  assert.throws(() => readLocalStatus({ ...good, ANON_KEY: undefined }));
});

test("SQL literals preserve JSON and quoted synthetic source values", () => {
  assert.equal(sqlLiteral("owner's value"), "'owner''s value'");
  assert.equal(sqlLiteral("a\\b"), "'a\\b'");
  assert.equal(sqlLiteral("'; commit; --"), "'''; commit; --'");
  assert.throws(() => sqlLiteral("bad\0value"));
});

test("existing accounts, working records and M2 pagination fixtures are never reset", () => {
  const good = {
    users: 0,
    roles: 0,
    adoptions: 0,
    drafts: 0,
    events: 0,
    products: 43,
    compatibilityHeads: 0,
    compatibilityRevisions: 0,
    compatibilitySources: 0,
    mediaSources: 0,
    packagingSources: 0,
    packagingHeads: 0,
    packagingRevisions: 0,
    packagingEvidence: 0,
    packagingDecisions: 0,
    packagingCurrents: 0,
    oemSources: 0,
    oemHeads: 0,
    oemRevisions: 0,
    oemEvidence: 0,
    oemDecisions: 0,
    oemCurrents: 0,
    uploadIntents: 0,
    uploadCompletions: 0,
    mediaMappingHeads: 0,
    mediaMappingRevisions: 0,
    mediaMappingEvidence: 0,
    mediaMappingDecisions: 0,
    mediaMappingCurrents: 0,
    mediaObservationKeys: 0,
    mediaReviewObservations: 0,
    storageObjects: 0,
  };
  assertPristineBaseline(good);
  for (const key of [
    "users",
    "roles",
    "adoptions",
    "drafts",
    "events",
    "compatibilityHeads",
    "compatibilityRevisions",
    "compatibilitySources",
    "mediaSources",
    "packagingSources",
    "packagingHeads",
    "packagingRevisions",
    "packagingEvidence",
    "packagingDecisions",
    "packagingCurrents",
    "oemSources",
    "oemHeads",
    "oemRevisions",
    "oemEvidence",
    "oemDecisions",
    "oemCurrents",
    "uploadIntents",
    "uploadCompletions",
    "mediaMappingHeads",
    "mediaMappingRevisions",
    "mediaMappingEvidence",
    "mediaMappingDecisions",
    "mediaMappingCurrents",
    "mediaObservationKeys",
    "mediaReviewObservations",
    "storageObjects",
  ])
    assert.throws(() => assertPristineBaseline({ ...good, [key]: 1 }));
  const { compatibilitySources: _omitted, ...incomplete } = good;
  assert.equal(_omitted, 0);
  assert.throws(() => assertPristineBaseline(incomplete));
  const { packagingSources: _omittedPackaging, ...withoutPackaging } = good;
  assert.equal(_omittedPackaging, 0);
  assert.throws(() => assertPristineBaseline(withoutPackaging));
  for (const products of [0, 42, 44, 1146])
    assert.throws(() => assertPristineBaseline({ ...good, products }));
});
