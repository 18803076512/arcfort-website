import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { pristineBaselineQuery } from "./local-acceptance.ts";
import {
  disposableObserverDisableSql,
  disposableObserverInsertSql,
  provisionDisposableMediaObserver,
} from "./media-acceptance.ts";

const baseline = {
  users: 0,
  roles: 0,
  adoptions: 0,
  drafts: 0,
  events: 0,
  products: 43,
  compatibilityHeads: 0,
  compatibilityRevisions: 0,
  compatibilitySources: 0,
  mediaSources: 0,
  packagingSources: 0,
  packagingHeads: 0,
  packagingRevisions: 0,
  packagingEvidence: 0,
  packagingDecisions: 0,
  packagingCurrents: 0,
  oemSources: 0,
  oemHeads: 0,
  oemRevisions: 0,
  oemEvidence: 0,
  oemDecisions: 0,
  oemCurrents: 0,
  uploadIntents: 0,
  uploadCompletions: 0,
  mediaMappingHeads: 0,
  mediaMappingRevisions: 0,
  mediaMappingEvidence: 0,
  mediaMappingDecisions: 0,
  mediaMappingCurrents: 0,
  mediaObservationKeys: 0,
  mediaReviewObservations: 0,
  storageObjects: 0,
};
function withCI<T>(operation: () => T) {
  const previous = process.env.CI;
  process.env.CI = "true";
  try {
    return operation();
  } finally {
    if (previous === undefined) delete process.env.CI;
    else process.env.CI = previous;
  }
}
test("shared key SQL builders reject malformed input and preserve transaction ownership", () => {
  const id = "96000000-0000-4000-8000-000000000001";
  const secretHex = "a".repeat(64);
  for (const invalid of ["", "not-a-uuid", `${id}';select 1;--`]) {
    assert.throws(() => disposableObserverInsertSql({ id: invalid, secretHex }));
    assert.throws(() => disposableObserverDisableSql(invalid));
  }
  for (const invalid of ["", "a".repeat(63), "a".repeat(65), "A".repeat(64), "';select 1;--"])
    assert.throws(() => disposableObserverInsertSql({ id, secretHex: invalid }));
  const insert = disposableObserverInsertSql({ id, secretHex });
  const disable = disposableObserverDisableSql(id);
  assert.match(insert, /^insert into private\.pi_media_observation_keys/);
  assert.match(disable, /^update private\.pi_media_observation_keys set enabled=false/);
  assert.ok(disable.includes(id));
  assert.equal(disable.includes(secretHex), false);
  assert.doesNotMatch(insert + disable, /\b(begin|commit|rollback|delete|truncate|drop)\b/i);
});
test("no observer write precedes full fresh-baseline and CI checks", () => {
  const previous = process.env.CI;
  delete process.env.CI;
  try {
    assert.throws(() =>
      provisionDisposableMediaObserver({
        json: () => {
          throw new Error("Should not read");
        },
        sql: () => {
          throw new Error("Should not write");
        },
      }),
    );
  } finally {
    if (previous !== undefined) process.env.CI = previous;
  }
  withCI(() => {
    for (const key of Object.keys(baseline)) {
      let writes = 0;
      assert.throws(() =>
        provisionDisposableMediaObserver({
          json: (query) => {
            assert.equal(query, pristineBaselineQuery);
            return { ...baseline, [key]: key === "products" ? 46 : 1 };
          },
          sql: () => {
            writes++;
            return "";
          },
        }),
      );
      assert.equal(writes, 0);
    }
    const { mediaReviewObservations: _missing, ...incomplete } = baseline;
    assert.equal(_missing, 0);
    assert.throws(() =>
      provisionDisposableMediaObserver({
        json: () => incomplete,
        sql: () => {
          throw new Error("Should not write");
        },
      }),
    );
  });
});
test("each disposable observer is random, scoped and cleared after key disable", () =>
  withCI(() => {
    const generated = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const writes: string[] = [];
      let id = "";
      const local = {
        json: () => baseline,
        sql: (query: string) => {
          writes.push(query);
          if (query.startsWith("update")) return id;
          return "";
        },
      };
      const owned = provisionDisposableMediaObserver(local);
      id = owned.observer.id;
      assert.match(id, /^[a-f0-9-]{36}$/);
      assert.match(owned.observer.secretHex, /^[a-f0-9]{64}$/);
      assert.equal(generated.has(owned.observer.secretHex), false);
      generated.add(owned.observer.secretHex);
      assert.equal(writes.length, 1);
      assert.match(
        writes[0],
        /set local log_statement='none'; set local log_min_error_statement='panic'/,
      );
      assert.match(writes[0], /interval '1 hour',true/);
      assert.ok(writes[0].includes(id));
      const secret = owned.observer.secretHex;
      owned.disable();
      assert.equal(owned.observer.secretHex, "");
      assert.equal(writes.length, 2);
      assert.ok(writes[1].includes(id));
      assert.equal(writes[1].includes(secret), false);
      assert.doesNotMatch(writes.join("\n"), /delete|truncate|drop|alter table/i);
    }
  }));
test("private provider errors are sanitized, not reported with signing material", () =>
  withCI(() => {
    const writes: string[] = [];
    assert.throws(
      () =>
        provisionDisposableMediaObserver({
          json: () => baseline,
          sql: (query) => {
            writes.push(query);
            if (writes.length === 1) throw new Error("PRIVATE_SENTINEL secret provider output");
            return "";
          },
        }),
      (error) =>
        error instanceof Error &&
        error.message === "Disposable observer provisioning failed; private output suppressed.",
    );
    assert.equal(writes.length, 2);
    assert.match(
      writes[1],
      /^update private\.pi_media_observation_keys set enabled=false\s+where id='/,
    );
    assert.doesNotMatch(writes[1], /decode|secret|delete|truncate/);
    assert.throws(
      () =>
        provisionDisposableMediaObserver({
          json: () => baseline,
          sql: () => {
            throw new Error("PRIVATE_SENTINEL");
          },
        }),
      (error) =>
        error instanceof Error &&
        error.message.includes("owned key disable is unverified") &&
        !error.message.includes("PRIVATE_SENTINEL"),
    );
  }));
test("failed disable cannot retain observer material or report success", () =>
  withCI(() => {
    const owned = provisionDisposableMediaObserver({
      json: () => baseline,
      sql: () => "",
    });
    assert.throws(() => owned.disable());
    assert.equal(owned.observer.secretHex, "");
  }));
test("provisioning uses stdin SQL and owned-server environment, never a CLI secret argument", () => {
  const local = readFileSync(new URL("./local-acceptance.ts", import.meta.url), "utf8");
  assert.match(local, /command\("docker", psqlArgs, sqlSettings \+ query\)/);
  const browser = readFileSync(new URL("./browser-server.ts", import.meta.url), "utf8");
  assert.match(browser, /next\(\["build"\], browserBuildEnvironment\(env\)\)/);
  assert.match(browser, /stdio: "ignore"/);
  const runner = readFileSync(new URL("./test-working-isolated.ts", import.meta.url), "utf8");
  assert.ok(
    runner.indexOf("assertPristineBaseline(pristine)") <
      runner.indexOf("observer = provisionDisposableMediaObserver(local)"),
  );
  assert.doesNotMatch(
    runner,
    /CONSOLE_MEDIA_OBSERVATION_SECRET_HEX|CONSOLE_MEDIA_OBSERVATION_KEY_ID/,
  );
});
