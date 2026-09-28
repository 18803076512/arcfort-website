import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { startBrowserServer, assertPortAvailable } from "./browser-server.ts";

assert.equal(process.env.CI, "true", "Explicit local QA invocation required.");
const server = await startBrowserServer("sb_publishable_synthetic_http_boundary_only");
try {
  const matchers = spawn(
    process.execPath,
    ["--experimental-strip-types", "scripts/console/test-middleware-matchers.ts", "--built"],
    { stdio: "inherit", windowsHide: true },
  );
  assert.equal(
    await new Promise<number | null>((resolve, reject) => {
      matchers.once("error", reject);
      matchers.once("close", resolve);
    }),
    0,
    "Production middleware coverage failed.",
  );
  const child = spawn(
    process.execPath,
    ["--experimental-strip-types", "scripts/console/test-console-http.ts"],
    {
      stdio: "inherit",
      windowsHide: true,
    },
  );
  const code = await new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  assert.equal(code, 0, "Current HTTP boundary checks failed.");
} finally {
  await server.stop();
}
await assertPortAvailable();
console.log(
  "PASS current production build and owned-server HTTP boundaries; no authenticated upload or database acceptance implied.",
);
