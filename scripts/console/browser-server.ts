import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { consoleWorkingEnabled } from "../../lib/console/working-config.ts";

export const browserOrigin = "http://127.0.0.1:3000";
export const runtimeEnvFiles = [".env", ".env.local", ".env.production", ".env.production.local"];

export function browserServerEnvironment(
  publicKey: string,
  ambient: Record<string, string | undefined>,
) {
  assert.equal(ambient.CI, "true", "Disposable CI only.");
  const env: NodeJS.ProcessEnv = { NODE_ENV: "production" };
  for (const [key, value] of Object.entries(ambient)) {
    if (
      value &&
      /^(PATH|SYSTEMROOT|WINDIR|TEMP|TMP|TMPDIR|HOME|USERPROFILE|COMSPEC|PATHEXT)$/i.test(key)
    )
      env[key] = value;
  }
  Object.assign(env, {
    CI: "true",
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
    CONSOLE_ENABLED: "true",
    CONSOLE_WORKING_ENABLED: "true",
    CONSOLE_ENVIRONMENT: "local",
    CONSOLE_ORIGIN: browserOrigin,
    CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
    CONSOLE_SUPABASE_PUBLISHABLE_KEY: publicKey,
  });
  assert.equal(consoleWorkingEnabled(env), true, "A local public key is required.");
  return env;
}

export function assertNoRuntimeEnvFiles(root: string) {
  assert.ok(
    runtimeEnvFiles.every((name) => !existsSync(path.join(root, name))),
    "Runtime .env files are present; refusing to load credentials into a test server.",
  );
}

export async function assertPortAvailable(port = 3000) {
  const probe = createServer();
  await new Promise<void>((resolve, reject) => {
    probe.once("error", () => reject(new Error("The local acceptance port is already in use.")));
    probe.listen({ host: "127.0.0.1", port, exclusive: true }, () => probe.close(() => resolve()));
  });
}

export function privateResponse(headers: Record<string, string>) {
  assert.match(headers["cache-control"] ?? "", /private/i);
  assert.match(headers["cache-control"] ?? "", /no-store/i);
  assert.match(headers["x-robots-tag"] ?? "", /noindex/i);
  assert.match(headers["x-robots-tag"] ?? "", /nofollow/i);
  assert.equal(headers["referrer-policy"], "no-referrer");
}

export async function startBrowserServer(publicKey: string) {
  const root = process.cwd();
  assertNoRuntimeEnvFiles(root);
  const env = browserServerEnvironment(publicKey, process.env);
  await assertPortAvailable();
  function next(args: string[]) {
    const child = spawn(
      process.execPath,
      [path.join(root, "node_modules/next/dist/bin/next"), ...args],
      {
        cwd: root,
        env,
        windowsHide: true,
        stdio: "ignore",
      },
    );
    const closed = new Promise<number | null>((resolve) => {
      child.once("error", () => resolve(null));
      child.once("close", resolve);
    });
    return { child, closed };
  }
  const build = next(["build"]);
  const buildTimeout = setTimeout(() => build.child.kill(), 300_000);
  const built = await build.closed;
  clearTimeout(buildTimeout);
  assert.equal(built, 0, "Current isolated production build failed; output suppressed.");
  assertNoRuntimeEnvFiles(root);
  await assertPortAvailable();
  const server = next(["start", "-H", "127.0.0.1", "-p", "3000"]);
  let exited = false;
  void server.closed.then(() => {
    exited = true;
  });
  async function stop() {
    if (!exited) server.child.kill();
    const kill = setTimeout(() => {
      if (!exited) server.child.kill("SIGKILL");
    }, 5000);
    await server.closed;
    clearTimeout(kill);
  }
  try {
    const deadline = Date.now() + 30_000;
    while (!exited && Date.now() < deadline) {
      try {
        const response = await fetch(`${browserOrigin}/console/login`, {
          redirect: "manual",
          signal: AbortSignal.timeout(2000),
        });
        if (response.status === 200) {
          privateResponse(Object.fromEntries(response.headers));
          assert.ok(!exited, "Acceptance server exited during readiness.");
          return { stop };
        }
      } catch {
        /* Readiness can briefly fail while Next binds its socket. */
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("The owned local acceptance server did not become ready.");
  } catch (error) {
    await stop();
    throw error;
  }
}
