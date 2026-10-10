import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { getProductIntelligenceTargetConfig } from "../../lib/supabase/product-intelligence-config.ts";
import {
  DatabaseSqlAssertionError,
  prepareDatabaseTest,
  readDatabaseTestReport,
  type PreparedDatabaseTest,
} from "./database-test-report.ts";

const cliScript = path.resolve("node_modules", "supabase", "dist", "supabase.js");
const testDirectory = path.resolve("supabase", "tests", "database");
const options = process.argv.slice(2);
if (options.length !== 1 || !["--local", "--staging"].includes(options[0])) {
  throw new Error("Choose exactly one database test target: --local or --staging.");
}

let targetArgs = ["--local"];
let targetLabel = "local";
const localContainer = "supabase_db_arcfort-product-intelligence";
if (options[0] === "--staging") {
  const target = getProductIntelligenceTargetConfig();
  const projectRef = process.env.PRODUCT_INTELLIGENCE_STAGING_PROJECT_REF?.trim();
  if (target.environment !== "staging" || !projectRef || !/^[a-z]{20}$/.test(projectRef)) {
    throw new Error("Staging tests require staging mode and the exact 20-letter authorized ref.");
  }
  targetArgs = ["--linked", "--project-ref", projectRef];
  targetLabel = `staging ${projectRef}`;
} else {
  const config = await readFile(path.resolve("supabase", "config.toml"), "utf8");
  if (!/^project_id\s*=\s*"arcfort-product-intelligence"\s*$/m.test(config)) {
    throw new Error("Review the local test container after changing the Supabase project ID.");
  }
  const label = execFileSync(
    "docker",
    ["inspect", "--format", '{{index .Config.Labels "com.supabase.cli.project"}}', localContainer],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 15_000 },
  ).trim();
  if (label !== "arcfort-product-intelligence") {
    throw new Error("The running local database container does not match this project.");
  }
}

const cliEnvironment: NodeJS.ProcessEnv = { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" };
delete cliEnvironment.PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY;

const testNames = (await readdir(testDirectory))
  .filter((name) => name.endsWith(".test.sql"))
  .sort();
if (testNames.length === 0) throw new Error("No Product Intelligence database tests found.");
const tests: PreparedDatabaseTest[] = [];
for (const name of testNames) {
  tests.push(prepareDatabaseTest(name, await readFile(path.join(testDirectory, name), "utf8")));
}

function executeTest(test: PreparedDatabaseTest) {
  let output: string;
  try {
    const local = options[0] === "--local";
    // Local CLI queries use the extended protocol, which rejects multi-statement
    // tests. CI uses psql in its existing isolated container; staging uses the API.
    output = execFileSync(
      local ? "docker" : process.execPath,
      local
        ? [
            "exec",
            "--interactive",
            "--user",
            "postgres",
            localContainer,
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
          ]
        : [cliScript, "db", "query", ...targetArgs, "--output", "json", "--agent", "no"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        input: test.sql,
        env: cliEnvironment,
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 120_000,
        maxBuffer: 2 * 1024 * 1024,
      },
    );
    if (local) {
      const lastLine = output.trimEnd().split(/\r?\n/).at(-1);
      output = `[{"arcfort_test_report":${lastLine}}]`;
    }
  } catch {
    throw new Error(`${test.name}: database command failed; raw provider output is not logged.`);
  }
  return readDatabaseTestReport(output, test);
}

function probeSource(plan: number, assertion: string): string {
  return `begin;

create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;

select plan(${plan});
select ok(${assertion}, 'SQL runner self-check');

select * from finish();
rollback;
`;
}

// Transport errors must never count as proof that a failing assertion was detected.
executeTest(
  prepareDatabaseTest("product_intelligence_runner_pass.test.sql", probeSource(1, "true")),
);
assert.throws(
  () =>
    executeTest(
      prepareDatabaseTest("product_intelligence_runner_fail.test.sql", probeSource(1, "false")),
    ),
  (error: unknown) =>
    error instanceof DatabaseSqlAssertionError &&
    error.report.failed === 1 &&
    error.report.executed === 1,
);
assert.throws(
  () =>
    executeTest(
      prepareDatabaseTest("product_intelligence_runner_count.test.sql", probeSource(2, "true")),
    ),
  (error: unknown) =>
    error instanceof DatabaseSqlAssertionError &&
    error.report.failed === 0 &&
    error.report.executed === 1,
);
console.log(`Database SQL runner self-checks passed (${targetLabel}).`);

let assertions = 0;
for (const test of tests) {
  const report = executeTest(test);
  assertions += report.executed;
  console.log(
    `${test.name}: PASS ${report.executed}/${report.planned}, ` +
      `failed=${report.failed}, pgTAP=${report.pgtap_version}, source=${test.sourceSha256}`,
  );
}
console.log(
  `Database SQL QA PASS: ${testNames.length} files, ${assertions} assertions (${targetLabel}).`,
);
