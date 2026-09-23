import assert from "node:assert/strict";
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
  assertAcceptanceInvocation(["--local"], { CI: "true" });
  for (const args of [
    [],
    ["--staging"],
    ["--local", "--staging"],
    ["--local", "--local"],
    ["--local", "--linked"],
  ])
    assert.throws(() => assertAcceptanceInvocation(args, { CI: "true" }));
  for (const CI of [undefined, "false", "1"])
    assert.throws(() => assertAcceptanceInvocation(["--local"], { CI }));
});

test("ambient provider, database, Docker and runtime overrides fail closed", () => {
  for (const key of [
    "CONSOLE_SUPABASE_URL",
    "CONSOLE_ENVIRONMENT",
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
  const good = { users: 0, roles: 0, adoptions: 0, drafts: 0, events: 0, products: 43 };
  assertPristineBaseline(good);
  for (const key of ["users", "roles", "adoptions", "drafts", "events"])
    assert.throws(() => assertPristineBaseline({ ...good, [key]: 1 }));
  for (const products of [0, 42, 44, 1146])
    assert.throws(() => assertPristineBaseline({ ...good, products }));
});
