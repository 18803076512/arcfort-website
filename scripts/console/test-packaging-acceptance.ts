import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  assertPackagingLedger,
  packagingLedgerQuery,
  packagingNonInterferenceTables,
  packagingTestCopies,
  packagingTestSource,
} from "./packaging-acceptance.ts";
import { parseConsoleCommand } from "../../lib/domain/catalog/commands.ts";

test("packaging fixtures retain explicit unknown and corrected counts without actual confirmation", () => {
  for (const copy of Object.values(packagingTestCopies))
    for (const kind of ["reference", "factory", "contradiction"] as const) {
      const command = parseConsoleCommand({
        action: "packaging_source",
        request_id: "a3000000-0000-4000-8000-000000000001",
        variant_id: "a3000000-0000-4000-8000-000000000002",
        original_id: null,
        copy,
        source: packagingTestSource(kind, copy),
      });
      assert.equal(command.action, "packaging_source");
      assert.match(JSON.stringify(command), /TEST-ONLY/);
      assert.doesNotMatch(JSON.stringify(command), /"CONFIRMED"|moq|lead_time/);
    }
  assert.deepEqual(packagingTestCopies.unknown, {
    package_description: "TEST-ONLY inner bag",
    quantity: null,
    quantity_unit: null,
  });
  assert.equal(packagingTestCopies.known.quantity, 10);
  assert.equal(packagingTestCopies.corrected.quantity, 12);
  assert.equal(
    packagingTestSource("reference", packagingTestCopies.unknown).assertion,
    "reference_only",
  );
  assert.equal(
    packagingTestSource("factory", packagingTestCopies.known).evidence_date,
    new Date().toISOString().slice(0, 10),
  );
});

test("packaging ledger rejects altered counts, actors, physical history and publication", () => {
  const ledger = {
    sources: 5,
    heads: 1,
    revisions: 5,
    evidence: 6,
    decisions: 4,
    currents: 1,
    scopedHeads: 1,
    scopedSources: 5,
    reviewerDecisions: 4,
    history: [
      [1, "approved", "APPROVE", "OEM_REFERENCE", null, null],
      [2, "superseded", "EDIT", null, 10, "pieces"],
      [3, "rejected", "REJECT", null, 12, "pieces"],
      [4, "approved", "APPROVE", "CONFIRMED", 12, "pieces"],
      [5, "pending", null, null, 12, "pieces"],
    ],
    validCurrent: 1,
    publicationReady: 0,
    publications: 0,
  };
  assertPackagingLedger(ledger);
  for (const key of Object.keys(ledger).filter((key) => key !== "history"))
    assert.throws(() => assertPackagingLedger({ ...ledger, [key]: 99 }));
  for (const history of [
    ledger.history.slice(1),
    [...ledger.history].reverse(),
    ledger.history.map((row, i) => (i === 0 ? [...row.slice(0, 4), 0, "pieces"] : row)),
    ledger.history.map((row, i) => (i === 3 ? [...row.slice(0, 4), 10, "pieces"] : row)),
  ])
    assert.throws(() => assertPackagingLedger({ ...ledger, history }));
  assert.throws(() => assertPackagingLedger({ ...ledger, extra: true }));
  assert.throws(() => assertPackagingLedger(null));
});

test("packaging ledger and retention read exact originals and other domains without mutation", () => {
  const id = "a3000000-0000-4000-8000-000000000001";
  const query = packagingLedgerQuery(id, id);
  assert.match(query, /AF-MIG-TS-9998/);
  assert.match(query, /synthetic-browser-m3-item/);
  assert.match(query, /private\.pi_packaging_approval_valid/);
  assert.match(query, /r\.quantity=12/);
  assert.doesNotMatch(query, /\b(update|delete|truncate|insert|commit)\b/i);
  for (const invalid of ["", "';delete from packaging_records;--", id + "\n"])
    assert.throws(() => packagingLedgerQuery(invalid, id));
  assert.throws(() => packagingLedgerQuery(id, "invalid"));
  for (const table of [
    "packaging_records",
    "product_variants",
    "oem_references",
    "oem_revisions",
    "technical_values",
    "compatibility_relationships",
    "media_assets",
    "product_media",
    "publish_records",
  ])
    assert.ok((packagingNonInterferenceTables as readonly string[]).includes(table));
});

test("authorized disposable CI explicitly opts into packaging while normal entrypoints stay off", () => {
  const workflow = readFileSync(".github/workflows/quality.yml", "utf8");
  const yaml = createRequire(import.meta.url)("js-yaml");
  const jobs = yaml.load(workflow).jobs;
  const runs = jobs["product-intelligence-database"].steps
    .map((step: { run?: string }) => step.run)
    .filter((run: string | undefined) => run?.includes("--packaging"));
  assert.deepEqual(runs, ["npm run console:working:test:local -- --oem --packaging"]);
  assert.doesNotMatch(JSON.stringify(jobs.quality), /--oem|--packaging/);
  const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
  assert.doesNotMatch(workflow, /CONSOLE_OEM_ENABLED|CONSOLE_PACKAGING_ENABLED/);
  assert.doesNotMatch(
    scripts["console:working:test:local"],
    /--packaging|CONSOLE_PACKAGING_ENABLED/,
  );
});
