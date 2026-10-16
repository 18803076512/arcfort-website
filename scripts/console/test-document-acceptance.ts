import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { parseConsoleCommand } from "../../lib/domain/catalog/commands.ts";
import {
  assertDocumentLedger,
  documentLedgerQuery,
  documentNonInterferenceTables,
  documentTestCopy,
  documentTestSource,
} from "./document-acceptance.ts";

const id = "a9000000-0000-4000-8000-000000000001";
const valid = () => ({
  counts: {
    technical_documents: 2,
    entity_documents: 2,
    technical_document_bindings: 2,
    document_upload_intents: 1,
    document_upload_completions: 1,
    document_source_bindings: 3,
    document_review_heads: 1,
    document_review_candidates: 5,
    document_review_submissions: 5,
    document_review_decisions: 4,
    document_review_currents: 1,
    "private.pi_document_observation_keys": 1,
    "private.pi_document_review_observations": 2,
  },
  scopedReferences: 2,
  lineage: 1,
  originals: 1,
  sources: 3,
  heads: 1,
  reviewerDecisions: 4,
  observations: 2,
  history: [
    [1, true, "APPROVE", "NEEDS_FACTORY_CONFIRMATION"],
    [2, true, "EDIT", "DATA_CONFLICT"],
    [3, true, "REJECT", "DATA_CONFLICT"],
    [4, true, "APPROVE", "DATA_CONFLICT"],
    [5, true, null, "DATA_CONFLICT"],
  ],
  currentSequence: 4,
  rawTokens: 0,
  publications: 0,
});
test("synthetic native document fixtures satisfy the real command parser without inventing facts", () => {
  parseConsoleCommand({
    action: "document_reference",
    request_id: id,
    variant_id: id,
    prior_document_id: null,
    copy: documentTestCopy,
  });
  assert.equal(documentTestCopy.issued_date, null);
  assert.equal(documentTestCopy.revision_label, null);
  for (const kind of ["rights", "scope", "contradiction"] as const) {
    const source = documentTestSource(kind);
    parseConsoleCommand({
      action: "document_source",
      request_id: id,
      variant_id: id,
      document_id: id,
      dimension: kind === "rights" ? "usage_rights" : "exact_scope",
      source,
    });
    assert.match(source.source_reference, /^TEST-ONLY/);
    assert.equal(source.assertion, kind === "contradiction" ? "contradicts" : "supports");
  }
});
test("document ledger rejects every changed or omitted count, decision and publication boundary", () => {
  assertDocumentLedger(valid());
  for (const key of Object.keys(valid())) {
    const missing: Record<string, unknown> = valid();
    delete missing[key];
    assert.throws(() => assertDocumentLedger(missing));
    if (typeof missing[key] !== "object" && !["counts", "history"].includes(key))
      assert.throws(() => assertDocumentLedger({ ...valid(), [key]: 999 }));
  }
  for (const key of Object.keys(valid().counts)) {
    const value = valid();
    (value.counts as Record<string, number>)[key]++;
    assert.throws(() => assertDocumentLedger(value));
    const missing = valid();
    delete (missing.counts as Record<string, number>)[key];
    assert.throws(() => assertDocumentLedger(missing));
  }
  for (let index = 0; index < 5; index++) {
    const value = valid();
    value.history[index][2] = "APPROVE";
    value.history[index][3] = "CONFIRMED";
    assert.throws(() => assertDocumentLedger(value));
  }
  assert.throws(() => assertDocumentLedger({ ...valid(), extra: 1 }));
});
test("ledger SQL is read-only, UUID-scoped and independent of claimed browser success", () => {
  const sql = documentLedgerQuery(id, id);
  assert.match(sql, /^select jsonb_build_object/);
  assert.doesNotMatch(sql, /\b(insert|update|delete|truncate|drop|alter)\b/i);
  for (const invalid of ["", "bad-id", `${id}';select 1;--`]) {
    assert.throws(() => documentLedgerQuery(invalid, id));
    assert.throws(() => documentLedgerQuery(id, invalid));
  }
  for (const name of [
    "storage.objects",
    "verification_events",
    "private.pi_command_receipts",
    "document_review_currents",
    "publish_records",
  ])
    assert.ok(sql.includes(name));
  assert.equal(new Set(documentNonInterferenceTables).size, documentNonInterferenceTables.length);
  for (const name of [
    "product_variants",
    "technical_values",
    "compatibility_relationships",
    "media_assets",
    "oem_references",
    "packaging_records",
    "seo_records",
    "publish_records",
  ])
    assert.ok((documentNonInterferenceTables as readonly string[]).includes(name));
});
test("native document entry is opt-in and binds browser, ledger, cleanup and revocation", () => {
  const read = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");
  const runner = read("./test-working-isolated.ts"),
    browser = read("./test-working-browser.ts"),
    document = read("./test-document-working-browser.ts");
  assert.match(runner, /documents: local.documents/);
  assert.match(runner, /if \(local.documents\)/);
  assert.match(runner, /assertDocumentLedger/);
  assert.match(runner, /observer\.disable\(\)/);
  assert.match(browser, /runDocumentWorkingBrowser/);
  assert.match(browser, /documents\.assertRevoked/);
  assert.match(browser, /documents\.assertLoggedOut/);
  assert.doesNotMatch(document, /route\.fulfill|route\.abort|storageState|page\.reload\(/);
  assert.match(document, /withAuthorityLock/);
  assert.match(document, /input\.inspectionBody/);
  assert.match(document, /assertDocumentLedger/);
  assert.match(document, /documentNonInterferenceQueries/);
});

test("authorized document CI retains OEM and packaging without enabling normal entrypoints", () => {
  const workflow = readFileSync(".github/workflows/quality.yml", "utf8");
  const yaml = createRequire(import.meta.url)("js-yaml");
  const jobs = yaml.load(workflow).jobs;
  const runs = jobs["product-intelligence-database"].steps
    .map((step: { run?: string }) => step.run)
    .filter((run: string | undefined) => run?.includes("--documents"));
  assert.deepEqual(runs, ["npm run console:working:test:local -- --oem --packaging --documents"]);
  assert.doesNotMatch(JSON.stringify(jobs.quality), /--oem|--packaging|--documents/);
  assert.doesNotMatch(workflow, /CONSOLE_(DOCUMENTS|DOCUMENT_REVIEW)_ENABLED/);
  const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
  assert.doesNotMatch(scripts["console:working:test:local"], /--documents|CONSOLE_DOCUMENT/);
});
