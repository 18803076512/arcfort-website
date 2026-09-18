import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

export const localProject = "arcfort-product-intelligence";
const container = `supabase_db_${localProject}`;
const apiUrl = "http://127.0.0.1:54321";

export function assertAcceptanceInvocation(
  args: string[],
  env: Record<string, string | undefined>,
) {
  assert.deepEqual(args, ["--local"], "Exactly --local is required.");
  assert.equal(env.CI, "true", "Disposable CI only.");
  for (const [key, value] of Object.entries(env)) {
    if (!value || key === "SUPABASE_TELEMETRY_DISABLED") continue;
    assert.ok(
      !/^(CONSOLE_|PRODUCT_INTELLIGENCE_|SUPABASE_|NEXT_PUBLIC_SUPABASE_|DATABASE_URL$|PGHOST$|PGSERVICE|PGPASSWORD$|PGPASSFILE$|DOCKER_HOST$|DOCKER_CONTEXT$|DOCKER_TLS|VERCEL|NODE_OPTIONS$|NODE_USE_ENV_PROXY$)/i.test(
        key,
      ),
      "Remove provider, database, application and Docker overrides before isolated acceptance.",
    );
  }
}

export function assertLocalDocker(endpoint: string) {
  assert.ok(
    /^unix:\/\/\/[^\r\n]+$/.test(endpoint) ||
      /^npipe:\/\/\/\/\.\/pipe\/[a-zA-Z0-9_.-]+$/.test(endpoint),
    "Acceptance requires a local Docker socket, never TCP or SSH.",
  );
}

export function assertLocalContainer(value: unknown) {
  assert.ok(Array.isArray(value) && value.length === 1);
  const state = value[0];
  assert.equal(state?.Name, `/${container}`);
  assert.equal(state?.Config?.Labels?.["com.supabase.cli.project"], localProject);
  assert.equal(state?.State?.Running, true);
  assert.ok(
    state?.NetworkSettings?.Ports?.["5432/tcp"]?.some(
      (port: { HostPort: string }) => port.HostPort === "54322",
    ),
    "Expected local database port is absent.",
  );
}

export function readLocalStatus(value: unknown) {
  assert.ok(value && typeof value === "object" && !Array.isArray(value));
  const status = value as Record<string, unknown>;
  assert.equal(status.API_URL ?? status.api_url, apiUrl);
  const database = new URL(String(status.DB_URL ?? status.db_url));
  assert.equal(database.protocol, "postgresql:");
  assert.equal(database.hostname, "127.0.0.1");
  assert.equal(database.port, "54322");
  assert.equal(database.username, "postgres");
  assert.equal(database.pathname, "/postgres");
  assert.equal(database.search, "");
  assert.equal(database.hash, "");
  const key = status.ANON_KEY ?? status.anon_key;
  const adminKey = status.SERVICE_ROLE_KEY ?? status.service_role_key;
  assert.ok(typeof key === "string" && key.length > 20);
  assert.ok(typeof adminKey === "string" && adminKey.length > 20 && adminKey !== key);
  return { url: apiUrl, key, adminKey };
}

export function sqlLiteral(value: string) {
  assert.ok(!value.includes("\0"));
  return `'${value.replaceAll("'", "''")}'`;
}

export function assertPristineBaseline(value: unknown) {
  assert.deepEqual(
    value,
    {
      users: 0,
      roles: 0,
      adoptions: 0,
      drafts: 0,
      events: 0,
      products: 43,
    },
    "A fresh imported disposable database is required; this runner never resets existing work.",
  );
}

const psqlArgs = [
  "exec",
  "--interactive",
  "--user",
  "postgres",
  container,
  "psql",
  "--username",
  "postgres",
  "--dbname",
  "postgres",
  "--no-psqlrc",
  "--tuples-only",
  "--no-align",
  "--quiet",
  "--set",
  "ON_ERROR_STOP=1",
];
const sqlSettings =
  "set standard_conforming_strings=on; set statement_timeout='15s'; set lock_timeout='10s';\n";

// Only constructed after local socket, container, CLI status and project checks pass.
export function openLocalAcceptance(args = process.argv.slice(2), env = process.env) {
  assertAcceptanceInvocation(args, env);
  const cliEnv = { ...env, SUPABASE_TELEMETRY_DISABLED: "1" };
  function command(file: string, args: string[], input?: string) {
    try {
      return execFileSync(file, args, {
        env: cliEnv,
        encoding: "utf8",
        input,
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 20_000,
        maxBuffer: 4 * 1024 * 1024,
      }).trim();
    } catch {
      throw new Error("Isolated command failed; provider output is suppressed.");
    }
  }
  const config = readFileSync("supabase/config.toml", "utf8");
  assert.match(config, /^project_id\s*=\s*"arcfort-product-intelligence"\s*$/m);
  assert.doesNotMatch(config.replace(/^\s*#.*$/gm, ""), /\bsmtp\b|\bsmtp_[a-z_]+\b|env\(/i);
  assert.match(config, /^\[local_smtp\]\s+enabled = true\s+port = 54324\s*(?=\[|$)/m);
  assertLocalDocker(
    command("docker", ["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"]),
  );
  assertLocalContainer(JSON.parse(command("docker", ["inspect", container])));
  const raw = command(process.execPath, [
    path.resolve("node_modules/supabase/dist/supabase.js"),
    "status",
    "--output",
    "json",
  ]);
  const credentials = readLocalStatus(JSON.parse(raw.slice(raw.indexOf("{"))));
  const sql = (query: string) => command("docker", psqlArgs, sqlSettings + query);
  const json = <T = unknown>(query: string): T => JSON.parse(sql(query)) as T;

  function connection(initial: string, keepOpen = false) {
    const child = spawn("docker", psqlArgs, { env: cliEnv, windowsHide: true, stdio: "pipe" });
    let output = "";
    let settled = false;
    let held = false;
    let readyResolve: () => void;
    let readyReject: (error: Error) => void;
    const ready = new Promise<void>((resolve, reject) => {
      readyResolve = resolve;
      readyReject = reject;
    });
    // A failed connection must not become an unhandled rejection while another one is releasing.
    void ready.catch(() => undefined);
    const done = new Promise<{ ok: boolean; output: string }>((resolve) => {
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (!held) readyReject(new Error("Lock holder was not established."));
        resolve({ ok, output: ok ? output.trim() : "" });
      };
      child.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString("utf8");
        if (output.length > 4 * 1024 * 1024) {
          child.kill();
          finish(false);
        }
        if (!held && output.includes("ARCFORT_LOCK_HELD\n")) {
          held = true;
          readyResolve();
        }
      });
      child.stderr.resume();
      child.stdin.on("error", () => finish(false));
      child.on("error", () => finish(false));
      child.on("close", (code) => finish(code === 0));
      const timer = setTimeout(() => {
        child.kill();
        finish(false);
      }, 20_000);
    });
    child.stdin.write(sqlSettings + initial + "\n");
    if (!keepOpen) child.stdin.end();
    return { done, ready, release: () => child.stdin.end("rollback;\n") };
  }

  async function asyncSql(query: string) {
    const result = await connection(query).done;
    assert.ok(result.ok, "Concurrent SQL connection failed; output suppressed.");
    return result.output;
  }

  async function withAuthorityLock<T>(
    operations: () => Promise<T>,
    waiters: number,
    legacyImport = false,
  ) {
    // An empty legacy write still takes the import barrier. Observe actual PostgreSQL
    // blockers before release; mere simultaneous Promise creation is not race evidence.
    const lock = legacyImport
      ? "update public.products set name_en=name_en where false;"
      : "select singleton from private.pi_working_authority_control where singleton for update;";
    const holder = connection(
      `begin; set idle_in_transaction_session_timeout='15s'; set application_name='arcfort-m3-lock-holder'; ${lock}\n\\echo ARCFORT_LOCK_HELD`,
      true,
    );
    let operation: Promise<{ value: T } | { failure: true }> | undefined;
    try {
      await holder.ready;
      operation = operations().then(
        (value) => ({ value }),
        () => ({ failure: true as const }),
      );
      const deadline = Date.now() + 6500;
      let blocked = false;
      while (Date.now() < deadline) {
        // Later row-lock waiters can be blocked by an earlier waiter, not directly by our holder.
        const count = Number(
          sql(
            `with recursive activity as materialized (
              select pid, application_name, pg_blocking_pids(pid) as blockers
              from pg_stat_activity where datname=current_database()
            ), blocked(pid) as (
              select pid from activity where application_name='arcfort-m3-lock-holder'
              union
              select waiter.pid from activity waiter join blocked holder
                on holder.pid=any(waiter.blockers)
            )
            select count(*) from blocked join activity using(pid)
            where application_name<>'arcfort-m3-lock-holder';`,
          ).trim(),
        );
        if (count >= waiters) {
          blocked = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 75));
      }
      assert.ok(blocked, "Required transactions were not observed waiting on the authority lock.");
    } finally {
      holder.release();
      const released = await holder.done;
      // Drain every caller even when the lock observation itself fails.
      await operation;
      assert.ok(released.ok, "Authority lock holder failed.");
    }
    const result = await operation;
    assert.ok(result && "value" in result, "Concurrent operation failed.");
    return result.value;
  }

  return { ...credentials, sql, json, asyncSql, withAuthorityLock };
}
