import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  assertOemLedger,
  oemLedgerQuery,
  oemNonInterferenceTables,
  oemTestCopy,
  oemTestSource,
} from "./oem-acceptance.ts";
import { parseConsoleCommand } from "../../lib/domain/catalog/commands.ts";

test("synthetic OEM source fixtures satisfy the actual strict parser without confirming anything", () => {
  for (const kind of ["reference", "factory", "contradiction"] as const) {
    const command = parseConsoleCommand({
      action: "oem_source",
      request_id: "a1000000-0000-4000-8000-000000000001",
      variant_id: "a1000000-0000-4000-8000-000000000002",
      copy: oemTestCopy,
      source: oemTestSource(kind),
    });
    assert.equal(command.action, "oem_source");
    assert.match(JSON.stringify(command), /TEST-ONLY/);
    assert.doesNotMatch(JSON.stringify(command), /"CONFIRMED"/);
  }
  assert.equal(oemTestSource("reference").assertion, "reference_only");
  assert.equal(oemTestSource("factory").assertion, "supports");
  assert.equal(oemTestSource("contradiction").assertion, "contradicts");
  assert.equal(oemTestSource("reference").evidence_date, new Date().toISOString().slice(0, 10));
});

test("OEM ledger rejects partial, extra or advanced states and verifies actor/history separately", () => {
  const ledger = {
    sources: 3,
    heads: 1,
    revisions: 5,
    evidence: 10,
    decisions: 4,
    currents: 1,
    scopedHeads: 1,
    scopedSources: 3,
    reviewerDecisions: 4,
    history: [
      [1, "approved", "APPROVE", "OEM_REFERENCE"],
      [2, "superseded", "EDIT", null],
      [3, "rejected", "REJECT", null],
      [4, "approved", "APPROVE", "CONFIRMED"],
      [5, "pending", null, null],
    ],
    validCurrent: 1,
    publicationReady: 0,
    publications: 0,
  };
  assertOemLedger(ledger);
  for (const key of [
    "sources",
    "heads",
    "revisions",
    "evidence",
    "decisions",
    "currents",
    "scopedHeads",
    "scopedSources",
    "reviewerDecisions",
    "validCurrent",
    "publicationReady",
    "publications",
  ])
    assert.throws(() => assertOemLedger({ ...ledger, [key]: 99 }));
  assert.throws(() => assertOemLedger({ ...ledger, history: ledger.history.slice(1) }));
  assert.throws(() => assertOemLedger({ ...ledger, history: [...ledger.history].reverse() }));
  assert.throws(() => assertOemLedger({ ...ledger, extra: true }));
  assert.throws(() => assertOemLedger(null));
});

test("the retained-record query is exact, local-only input and never destructive", () => {
  const id = "a1000000-0000-4000-8000-000000000001";
  const query = oemLedgerQuery(id, id);
  assert.match(query, /AF-MIG-TS-9998/);
  assert.match(query, /synthetic-browser-m3-item/);
  assert.match(query, /private\.pi_oem_approval_valid/);
  assert.doesNotMatch(query, /\b(update|delete|truncate|insert|commit)\b/i);
  for (const invalid of ["", "';delete from oem_references;--", id + "\n"])
    assert.throws(() => oemLedgerQuery(invalid, id));
  assert.throws(() => oemLedgerQuery(id, "invalid"));
  for (const table of [
    "product_variants",
    "oem_references",
    "technical_values",
    "compatibility_relationships",
    "media_assets",
    "product_media",
    "publish_records",
  ])
    assert.ok((oemNonInterferenceTables as readonly string[]).includes(table));
});

test("authorized disposable CI explicitly opts into OEM while normal entrypoints stay off", () => {
  const workflow = readFileSync(".github/workflows/quality.yml", "utf8");
  const yaml = createRequire(import.meta.url)("js-yaml");
  const jobs = yaml.load(workflow).jobs;
  const runs = jobs["product-intelligence-database"].steps
    .map((step: { run?: string }) => step.run)
    .filter((run: string | undefined) => run?.includes("--oem"));
  assert.deepEqual(runs, ["npm run console:working:test:local -- --oem --packaging"]);
  assert.doesNotMatch(JSON.stringify(jobs.quality), /--oem|--packaging/);
  const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
  assert.doesNotMatch(workflow, /CONSOLE_OEM_ENABLED|CONSOLE_PACKAGING_ENABLED/);
  assert.doesNotMatch(scripts["console:working:test:local"], /--oem|CONSOLE_OEM_ENABLED/);
});
