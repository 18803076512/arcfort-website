import { createHash } from "node:crypto";

export type PreparedDatabaseTest = {
  name: string;
  sourceSha256: string;
  expectedAssertions: number;
  sql: string;
};

export type DatabaseTestReport = {
  suite: string;
  source_sha256: string;
  planned: number;
  executed: number;
  failed: number;
  diagnostics: string[];
  pgtap_version: string;
};

export class DatabaseSqlAssertionError extends Error {
  readonly report: DatabaseTestReport;

  constructor(report: DatabaseTestReport) {
    super(
      `${report.suite}: planned ${report.planned}, executed ${report.executed}, ` +
        `failed ${report.failed}, finish diagnostics ${report.diagnostics.length}.`,
    );
    this.name = "DatabaseSqlAssertionError";
    this.report = report;
  }
}

const footer = /\nselect \* from finish\(\);\s*rollback;\s*$/;

// This adapter accepts reviewed repository tests, not arbitrary user-supplied SQL.
export function prepareDatabaseTest(name: string, source: string): PreparedDatabaseTest {
  if (!/^product_intelligence_[a-z_]+\.test\.sql$/.test(name)) {
    throw new Error("Unexpected Product Intelligence database test filename.");
  }
  const normalized = source.replace(/\r\n/g, "\n");
  const plans = [...normalized.matchAll(/^select plan\((\d+)\);$/gm)];
  if (!normalized.startsWith("begin;\n") || !footer.test(normalized)) {
    throw new Error(`${name}: expected a BEGIN / finish() / ROLLBACK test envelope.`);
  }
  if (
    plans.length !== 1 ||
    Number(plans[0][1]) <= 0 ||
    !Number.isSafeInteger(Number(plans[0][1])) ||
    [...normalized.matchAll(/\brollback\b/gi)].length !== 1 ||
    [...normalized.matchAll(/\bbegin\s*;/gi)].length !== 1 ||
    /\b(?:commit|abort|savepoint)\b|\bend\s*(?:(?:work|transaction)\s*)?;|\b(?:start|prepare)\s+transaction\b/i.test(
      normalized,
    ) ||
    /\b(?:skip|todo|todo_start|todo_end|no_plan)\s*\(/i.test(normalized)
  ) {
    throw new Error(`${name}: requires one positive plan, no COMMIT and no skipped/TODO tests.`);
  }
  const sourceSha256 = createHash("sha256").update(normalized).digest("hex");

  // The hosted API returns only the last result set. Keep pgTAP's assertion engine
  // intact and report its counters before rolling back every fixture and extension.
  const reportSql = `select jsonb_build_object(
  'suite', '${name}',
  'source_sha256', '${sourceSha256}',
  'planned', extensions._get('plan'),
  'executed', extensions._get('curr_test'),
  'failed', extensions.num_failed(),
  'diagnostics', (
    select coalesce(jsonb_agg(message), '[]'::jsonb)
    from extensions.finish(false) as message
  ),
  'pgtap_version', (select extversion from pg_extension where extname = 'pgtap')
) as arcfort_test_report;
rollback;
`;

  return {
    name,
    sourceSha256,
    expectedAssertions: Number(plans[0][1]),
    sql: normalized.replace(footer, `\n${reportSql}`),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readDatabaseTestReport(
  output: string,
  test: PreparedDatabaseTest,
): DatabaseTestReport {
  let payload: unknown;
  try {
    payload = JSON.parse(output);
  } catch {
    throw new Error(`${test.name}: database response was not valid JSON.`);
  }
  const rows = Array.isArray(payload) ? payload : isRecord(payload) ? payload.rows : undefined;
  if (!Array.isArray(rows) || rows.length !== 1 || !isRecord(rows[0])) {
    throw new Error(`${test.name}: expected exactly one database test report.`);
  }
  const report = rows[0].arcfort_test_report;
  if (
    !isRecord(report) ||
    report.suite !== test.name ||
    report.source_sha256 !== test.sourceSha256 ||
    report.planned !== test.expectedAssertions ||
    typeof report.executed !== "number" ||
    !Number.isSafeInteger(report.executed) ||
    report.executed < 0 ||
    typeof report.failed !== "number" ||
    !Number.isSafeInteger(report.failed) ||
    report.failed < 0 ||
    report.failed > report.executed ||
    !Array.isArray(report.diagnostics) ||
    !report.diagnostics.every((value) => typeof value === "string") ||
    typeof report.pgtap_version !== "string" ||
    !/^\d+\.\d+(?:\.\d+)?$/.test(report.pgtap_version)
  ) {
    throw new Error(`${test.name}: invalid or mismatched database test report.`);
  }

  const result = report as DatabaseTestReport;
  if (
    result.executed !== result.planned ||
    result.failed !== 0 ||
    result.diagnostics.length !== 0
  ) {
    throw new DatabaseSqlAssertionError(result);
  }
  return result;
}
