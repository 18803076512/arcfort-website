import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import {
  DatabaseSqlAssertionError,
  prepareDatabaseTest,
  readDatabaseTestReport,
} from "./database-test-report.ts";

const name = "product_intelligence_probe.test.sql";
const source = `begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
select plan(1);
select ok(true, 'synthetic assertion');
select * from finish();
rollback;
`;
const test = prepareDatabaseTest(name, source);
assert.equal(test.expectedAssertions, 1);
assert.match(test.sql, /select ok\(true, 'synthetic assertion'\);/);
assert.match(test.sql, /extensions\.finish\(false\)/);
assert.match(test.sql, /as arcfort_test_report;\nrollback;\n$/);
assert.equal(
  prepareDatabaseTest(name, source.replace(/\n/g, "\r\n")).sourceSha256,
  test.sourceSha256,
);
assert.notEqual(
  prepareDatabaseTest(name, source.replace("true", "false")).sourceSha256,
  test.sourceSha256,
);

for (const invalid of [
  source.replace("begin;", ""),
  source.replace("rollback;", "commit;"),
  source.replace("select plan(1);", "commit work;\nselect plan(1);"),
  source.replace("select plan(1);", "end transaction;\nselect plan(1);"),
  source.replace("select plan(1);", "abort;\nselect plan(1);"),
  source.replace("select plan(1);", "begin;\nselect plan(1);"),
  source.replace("select plan(1);", "rollback work;\nselect plan(1);"),
  source.replace("select plan(1);", "start transaction;\nselect plan(1);"),
  source + "select 1;\n",
  source.replace("select plan(1);", "select plan(0);"),
  source.replace("select plan(1);", "select plan(1);\nselect plan(1);"),
  source.replace("select plan(1);", "select plan(9007199254740992);"),
  source.replace("select plan(1);", "select no_plan();"),
  source.replace("select ok(true, 'synthetic assertion');", "select skip('missing', 1);"),
  source.replace("select ok(true, 'synthetic assertion');", "select todo('later');"),
  source.replace("select ok(true, 'synthetic assertion');", "rollback;\nselect ok(true);"),
]) {
  assert.throws(() => prepareDatabaseTest(name, invalid));
}
assert.throws(() => prepareDatabaseTest("../other.sql", source));
assert.throws(() => prepareDatabaseTest("x'; select 1;--.sql", source));

const report = {
  suite: name,
  source_sha256: test.sourceSha256,
  planned: 1,
  executed: 1,
  failed: 0,
  diagnostics: [],
  pgtap_version: "1.3.0",
};
const row = { arcfort_test_report: report };
assert.deepEqual(readDatabaseTestReport(JSON.stringify([row]), test), report);
assert.deepEqual(readDatabaseTestReport(JSON.stringify({ rows: [row] }), test), report);
for (const payload of [
  "",
  "ROLLBACK",
  "not json",
  "[]",
  "{}",
  "null",
  JSON.stringify([row, row]),
]) {
  assert.throws(() => readDatabaseTestReport(payload, test));
}
for (const override of [
  { suite: "different" },
  { source_sha256: "0".repeat(64) },
  { planned: 2 },
  { planned: "1" },
  { executed: "1" },
  { executed: null },
  { executed: -1 },
  { executed: 0.5 },
  { failed: -1 },
  { failed: "0" },
  { failed: 2 },
  { diagnostics: null },
  { diagnostics: [null] },
  { pgtap_version: null },
  { pgtap_version: "unknown" },
]) {
  assert.throws(() =>
    readDatabaseTestReport(
      JSON.stringify([{ arcfort_test_report: { ...report, ...override } }]),
      test,
    ),
  );
}
for (const override of [
  { executed: 0 },
  { executed: 2 },
  { failed: 1 },
  { diagnostics: ["# planned/executed mismatch"] },
]) {
  assert.throws(
    () =>
      readDatabaseTestReport(
        JSON.stringify([{ arcfort_test_report: { ...report, ...override } }]),
        test,
      ),
    DatabaseSqlAssertionError,
  );
}
try {
  readDatabaseTestReport("a private provider error", test);
  assert.fail("Invalid JSON should be rejected.");
} catch (error) {
  assert(error instanceof Error);
  assert(!error.message.includes("private provider error"));
}

const directory = path.resolve("supabase", "tests", "database");
const names = (await readdir(directory)).filter((file) => file.endsWith(".test.sql")).sort();
assert.equal(names.length, 5, "Review the QA coverage when adding or removing a database suite.");
let assertions = 0;
for (const suite of names) {
  const original = await readFile(path.join(directory, suite), "utf8");
  const prepared = prepareDatabaseTest(suite, original);
  const body = original.replace(/\r\n/g, "\n").split("\nselect * from finish();")[0];
  assert(
    prepared.sql.startsWith(body),
    `${suite}: original assertions and fixtures must stay intact`,
  );
  assertions += prepared.expectedAssertions;
}
assert.equal(
  assertions,
  74,
  "Review the expected PostgreSQL assertion baseline when tests change.",
);
const stagingEnvironment: NodeJS.ProcessEnv = {
  ...process.env,
  SUPABASE_ACCESS_TOKEN: undefined,
  PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY: undefined,
  PRODUCT_INTELLIGENCE_ENVIRONMENT: "staging",
  PRODUCT_INTELLIGENCE_STAGING_PROJECT_REF: "abcdefghijklmnopqrst",
  PRODUCT_INTELLIGENCE_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
  PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE: "false",
};
const runner = path.resolve("scripts", "console", "run-database-sql-tests.ts");
for (const [args, environment, expectedError] of [
  [[], stagingEnvironment, /Choose exactly one/],
  [["--local", "--staging"], stagingEnvironment, /Choose exactly one/],
  [["--staging"], stagingEnvironment, /ALLOW_SHADOW_WRITE=true/],
  [
    ["--staging"],
    { ...stagingEnvironment, PRODUCT_INTELLIGENCE_ENVIRONMENT: "production" },
    /must be local or staging/,
  ],
  [
    ["--staging"],
    {
      ...stagingEnvironment,
      PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE: "true",
      PRODUCT_INTELLIGENCE_SUPABASE_URL: "https://different-project.supabase.co",
    },
    /does not match/,
  ],
] as const) {
  const result = spawnSync(process.execPath, ["--experimental-strip-types", runner, ...args], {
    encoding: "utf8",
    env: environment,
    timeout: 10_000,
  });
  assert.equal(result.error, undefined);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, expectedError);
  assert.equal(result.stdout, "");
}
console.log(
  "Database SQL report tests passed: strict result validation and all 5 suites / 74 planned assertions.",
);
