import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { pgtap } from "@electric-sql/pglite-pgtap";
import { checkEmbeddedPublicTypes } from "./check-public-types.mjs";

import { buildShadowCatalog } from "../build-shadow-catalog.ts";
import {
  DatabaseSqlAssertionError,
  prepareDatabaseTest,
  readDatabaseTestReport,
} from "../database-test-report.ts";

// No env files, connection strings, external services or on-disk database are read.
const db = new PGlite({ extensions: { pgcrypto, pgtap } });
const root = path.resolve(import.meta.dirname, "../../..");
const suiteDirectory = path.join(root, "supabase/tests/database");
const migrationDirectory = path.join(root, "supabase/migrations");
let assertions = 0;

async function executeTest(name, source) {
  const test = prepareDatabaseTest(name, source);
  const results = await db.exec(test.sql);
  const reports = results
    .flatMap((result) => result.rows)
    .filter((row) => Object.hasOwn(row, "arcfort_test_report"));
  try {
    return readDatabaseTestReport(JSON.stringify(reports), test);
  } catch (error) {
    for (const row of results.flatMap((result) => result.rows)) {
      for (const value of Object.values(row)) {
        if (
          typeof value === "string" &&
          value.startsWith("not ok") &&
          !name.includes("embedded_fail")
        )
          console.error(value);
      }
    }
    throw error;
  }
}

async function publicContract() {
  return (
    await db.query(`select table_name, column_name, data_type, udt_name, is_nullable, column_default
    from information_schema.columns where table_schema = 'public'
    order by table_name, ordinal_position`)
  ).rows;
}

try {
  await db.exec(await readFile(new URL("./bootstrap.sql", import.meta.url), "utf8"));
  const migrations = (await readdir(migrationDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  let oldContract;
  for (const name of migrations) {
    if (name.startsWith("202609090006")) oldContract = await publicContract();
    await db.exec(await readFile(path.join(migrationDirectory, name), "utf8"));
    console.log(`Applied isolated migration: ${name}`);
  }
  const originalRelations = new Set(oldContract.map((column) => column.table_name));
  assert.deepEqual(
    (await publicContract()).filter((column) => originalRelations.has(column.table_name)),
    oldContract,
    "M3 preserves every original public relation column contract",
  );
  await checkEmbeddedPublicTypes(db, root, {
    write: process.argv.includes("--write-public-types"),
  });

  const probe = (
    count,
    value,
  ) => `begin;\ncreate extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
select plan(${count});
select ok(${value}, 'Embedded runner negative control');
select * from finish();
rollback;
`;
  await executeTest("product_intelligence_embedded_pass.test.sql", probe(1, "true"));
  await assert.rejects(
    executeTest("product_intelligence_embedded_fail.test.sql", probe(1, "false")),
    DatabaseSqlAssertionError,
  );
  await assert.rejects(
    executeTest("product_intelligence_embedded_count.test.sql", probe(2, "true")),
    DatabaseSqlAssertionError,
  );
  for (const name of (await readdir(suiteDirectory))
    .filter((name) => name.endsWith(".test.sql"))
    .sort()) {
    const report = await executeTest(name, await readFile(path.join(suiteDirectory, name), "utf8"));
    assertions += report.executed;
    console.log(`${name}: ${report.executed}/${report.planned} passed`);
  }

  // Exercise the real source projection, not only synthetic table counts.
  const catalog = await buildShadowCatalog();
  const tables = {
    ...catalog.tables,
    import_rows: catalog.tables.import_rows.map((row) => ({
      ...row,
      import_batch_id: catalog.batchId,
      raw_payload: row.normalized_payload,
    })),
  };
  const conflicts = {
    product_variants: "sku",
    technical_field_definitions: "field_key",
    technical_value_evidence: "technical_value_id,evidence_source_id",
    compatibility_evidence: "compatibility_relationship_id,evidence_source_id",
    product_media: "id",
    import_rows: "id",
  };
  const batch = {
    id: catalog.batchId,
    source_revision: catalog.sourceRevision,
    source_kind: "repository_shadow",
    source_files: catalog.sourceFiles,
    expected_counts: catalog.counts,
    is_shadow: true,
    status: "IMPORTING",
    imported_counts: null,
    reconciliation: null,
    completed_at: null,
    failure_message: null,
  };
  async function upsert(table, rows, conflict) {
    if (!rows.length) return;
    assert.match(table, /^[a-z_]+$/);
    const columns = Object.keys(rows[0]);
    assert.ok(columns.every((column) => /^[a-z_]+$/.test(column)));
    const setters = columns
      .filter((column) => !conflict.split(",").includes(column))
      .map((column) => `${column}=excluded.${column}`)
      .join(",");
    await db.query(
      `insert into public.${table} (${columns.join(",")})
      select ${columns.join(",")} from jsonb_populate_recordset(null::public.${table}, $1::jsonb)
      on conflict (${conflict}) do update set ${setters}`,
      [JSON.stringify(rows)],
    );
  }
  for (let pass = 1; pass <= 2; pass++) {
    await upsert("import_batches", [batch], "source_revision");
    for (const [table, rows] of Object.entries(tables))
      await upsert(table, rows, conflicts[table] ?? "external_key");
    const reconciliation = await db.query("select public.pi_reconcile_shadow_batch($1) as result", [
      catalog.batchId,
    ]);
    assert.equal(reconciliation.rows[0].result.matches, true);
    const {
      rows: [{ columns }],
    } = await db.query("select private.pi_shadow_source_columns() as columns");
    assert.deepEqual(Object.keys(columns).sort(), Object.keys(tables).sort());
    for (const [table, sourceRows] of Object.entries(tables)) {
      assert.deepEqual([...columns[table]].sort(), Object.keys(sourceRows[0]).sort());
      const actual = (
        await db.query(`select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) as records
        from (select ${columns[table].join(",")} from public.${table}) r`)
      ).rows[0].records;
      assert.equal(actual.length, sourceRows.length);
      const parity = await db.query(
        `select (select jsonb_agg(r order by r::text) from jsonb_array_elements($1::jsonb) r)
        = (select jsonb_agg(r order by r::text) from jsonb_array_elements($2::jsonb) r) as matches`,
        [JSON.stringify(actual), JSON.stringify(sourceRows)],
      );
      assert.equal(parity.rows[0].matches, true, `Pass ${pass}: ${table} exact parity`);
    }
    console.log(`Real-source shadow replay ${pass}: all 17 source tables match.`);
  }

  const ownerId = "90000000-0000-4000-8000-000000000001";
  await db.query("insert into auth.users(id,email) values ($1,'authority-owner@example.invalid')", [
    ownerId,
  ]);
  await db.query("insert into public.console_user_roles(user_id,role) values ($1,'owner')", [
    ownerId,
  ]);
  await db.query(
    "select set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claim.role','authenticated',false)",
    [ownerId],
  );
  const adopt = (manifest = tables, revision = catalog.sourceRevision) =>
    db.query("select private.pi_adopt_15ak_working_scope($1,$2::jsonb,$3,$4)", [
      revision,
      JSON.stringify(manifest),
      "a".repeat(40),
      "Synthetic isolated authority acceptance only",
    ]);
  const denies = async (operation, code, label) => {
    await assert.rejects(operation, (error) => error.code === code, label);
    assert.equal(
      (await db.query("select count(*)::int as count from private.pi_working_adoptions")).rows[0]
        .count,
      0,
    );
    assert.equal(
      (await db.query("select adoption_id from private.pi_working_authority_control")).rows[0]
        .adoption_id,
      null,
    );
    console.log(`Blocked without partial adoption: ${label}`);
  };
  const changedValue = structuredClone(tables);
  changedValue.technical_values[0].value_text = "altered test reference";
  await denies(() => adopt(changedValue), "23514", "changed reference value");
  const missingField = structuredClone(tables);
  delete missingField.products[0].source_reference;
  await denies(() => adopt(missingField), "23514", "omitted source field");
  const missingTable = structuredClone(tables);
  delete missingTable.product_media;
  await denies(() => adopt(missingTable), "23514", "omitted table");
  await denies(() => adopt(tables, "b".repeat(64)), "23514", "wrong source revision");

  await upsert("import_batches", [batch], "source_revision");
  await denies(() => adopt(), "55000", "unfinished import");
  await db.query("select public.pi_reconcile_shadow_batch($1)", [catalog.batchId]);
  await db.query("update import_batches set source_files = '[]'::jsonb where id = $1", [
    catalog.batchId,
  ]);
  await denies(() => adopt(), "23514", "changed source-file hash manifest");
  await db.query("update import_batches set source_files = $1 where id = $2", [
    JSON.stringify(catalog.sourceFiles),
    catalog.batchId,
  ]);

  for (const role of ["editor", "reviewer", "publisher", "viewer"]) {
    await db.query("update console_user_roles set role = $1 where user_id = $2", [role, ownerId]);
    await denies(() => adopt(), "42501", `${role} cannot adopt`);
  }
  await db.query(
    "update console_user_roles set role = 'owner', revoked_at = now() where user_id = $1",
    [ownerId],
  );
  await denies(() => adopt(), "42501", "revoked owner cannot adopt");
  await db.query("update console_user_roles set revoked_at = null where user_id = $1", [ownerId]);
  await db.exec("select set_config('request.jwt.claim.role','service_role',false)");
  await denies(() => adopt(), "42501", "service claim cannot impersonate owner");
  await db.exec("select set_config('request.jwt.claim.role','authenticated',false)");

  const beforeAudit = (await db.query("select count(*)::int as count from audit_events")).rows[0]
    .count;
  await adopt();
  await assert.rejects(
    adopt(),
    (error) => error.code === "55000",
    "repeat adoption cannot reset baseline",
  );
  assert.equal(
    (await db.query("select count(*)::int as count from audit_events")).rows[0].count,
    beforeAudit + 1,
  );
  await db.exec("set role service_role");
  await assert.rejects(
    upsert("import_batches", [batch], "source_revision"),
    (error) => error.code === "55000",
  );
  for (const [table, rows] of Object.entries(tables)) {
    const column = Object.keys(rows[0])[0];
    await assert.rejects(
      db.exec(`update public.${table} set ${column} = ${column}`),
      (error) => error.code === "55000",
      table,
    );
    await assert.rejects(
      db.exec(`delete from public.${table} where false`),
      (error) => error.code === "55000",
      `${table} empty delete`,
    );
  }
  await db.exec("reset role");
  await assert.rejects(db.exec("truncate products cascade"), (error) => error.code === "55000");
  await assert.rejects(
    db.exec("update private.pi_working_authority_control set adoption_id = null"),
    (error) => error.code === "55000",
  );
  await assert.rejects(
    db.exec("delete from private.pi_working_adoptions"),
    (error) => error.code === "55000",
  );
  assert.equal(
    (await db.query("select count(*)::int as count from private.pi_working_adoptions")).rows[0]
      .count,
    1,
  );
  const ledger = (
    await db.query(
      "select baseline, baseline_hash, actor_id, pilot_variant_ids from private.pi_working_adoptions",
    )
  ).rows[0];
  assert.equal(ledger.actor_id, ownerId);
  assert.equal(ledger.pilot_variant_ids.length, 4);
  for (const table of Object.keys(tables)) {
    const unchanged = await db.query(
      `select $1::jsonb =
      (select jsonb_agg(to_jsonb(r) order by to_jsonb(r)::text) from public.${table} r) as matches`,
      [JSON.stringify(ledger.baseline[table])],
    );
    assert.equal(
      unchanged.rows[0].matches,
      true,
      `${table} retains complete pre-adoption baseline`,
    );
  }
  assert.equal(
    (
      await db.query(
        "select baseline_hash = encode(extensions.digest(baseline::text,'sha256'),'hex') as valid from private.pi_working_adoptions",
      )
    ).rows[0].valid,
    true,
  );
  assert.equal(
    (await db.query("select count(*)::int as count from publish_records")).rows[0].count,
    0,
  );
  const pilotFacts = tables.technical_values.filter((value) =>
    ledger.pilot_variant_ids.includes(value.product_variant_id),
  );
  assert.equal(pilotFacts.length, 15);
  for (const [index, fact] of pilotFacts.entries()) {
    const links = tables.technical_value_evidence
      .filter((link) => link.technical_value_id === fact.id)
      .map((link) => ({ source_id: link.evidence_source_id, role: link.evidence_role }));
    const {
      rows: [{ result }],
    } = await db.query(
      "select private.pi_propose_technical_revision($1,$2,$3,$4,0,$5::jsonb,$6::jsonb,$7) as result",
      [
        `91000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
        fact.product_variant_id,
        fact.field_definition_id,
        fact.variant_label ?? "",
        JSON.stringify({ value_text: fact.value_text, unit: fact.unit ?? "" }),
        JSON.stringify(links),
        "Isolated original-reference lineage test; not factory confirmation",
      ],
    );
    assert.equal(result.root_value_id, fact.id, "Exact source scope selects its own original root");
    const {
      rows: [candidate],
    } = await db.query(
      "select verification_status, confirmed_by, variant_label from technical_values where id=$1",
      [result.value_id],
    );
    assert.equal(candidate.verification_status, "NEEDS_FACTORY_CONFIRMATION");
    assert.equal(candidate.confirmed_by, null);
    assert.equal(candidate.variant_label, fact.variant_label);
    assert.equal(
      (
        await db.query(
          "select to_jsonb(value) = $2::jsonb as unchanged from technical_values value where id=$1",
          [
            fact.id,
            JSON.stringify(ledger.baseline.technical_values.find((value) => value.id === fact.id)),
          ],
        )
      ).rows[0].unchanged,
      true,
      "Full original technical row remains unchanged",
    );
  }
  assert.equal(
    (await db.query("select count(*)::int as count from verification_events")).rows[0].count,
    0,
  );
  console.log(
    "All 15 real-source pilot scopes retain their exact original root, immutable reference and unconfirmed status.",
  );
  console.log(
    `Embedded SQL PASS: ${assertions} pgTAP assertions, negative controls, two real-source replays and post-adoption service-role denial.`,
  );
  console.log(
    "Not proven here: actual Supabase Auth/PostgREST, multi-connection races or hosted behavior. No remote access performed.",
  );
} catch (error) {
  // The in-memory fixture has no secrets; concise SQL errors are useful for local development.
  console.error(error instanceof Error ? error.message : "Isolated SQL test failed.");
  process.exitCode = 1;
} finally {
  await db.close();
}
