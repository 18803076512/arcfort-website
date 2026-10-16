import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { pristineBaselineQuery } from "./local-acceptance.ts";
import {
  disposableObserverDisableSql,
  disposableObserverInsertSql,
  provisionDisposableMediaObserver,
  provisionDisposableObservers,
  disposableDocumentObserverInsertSql,
  disposableDocumentObserverDisableSql,
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
  documents: 0,
  documentLinks: 0,
  documentBindings: 0,
  documentUploadIntents: 0,
  documentUploadCompletions: 0,
  documentSources: 0,
  documentReviewHeads: 0,
  documentReviewCandidates: 0,
  documentReviewSubmissions: 0,
  documentReviewDecisions: 0,
  documentReviewCurrents: 0,
  documentObservationKeys: 0,
  documentReviewObservations: 0,
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

test("document key builders are domain-specific and never report malformed material", () => {
  const id = "96000000-0000-4000-8000-000000000002";
  const secretHex = "b".repeat(64);
  const insert = disposableDocumentObserverInsertSql({ id, secretHex });
  const disable = disposableDocumentObserverDisableSql(id);
  assert.match(insert, /^insert into private\.pi_document_observation_keys/);
  assert.match(disable, /^update private\.pi_document_observation_keys set enabled=false/);
  assert.ok(disable.includes(id));
  assert.doesNotMatch(
    insert + disable,
    /pi_media_|\b(begin|commit|rollback|delete|truncate|drop)\b/i,
  );
  assert.equal(disable.includes(secretHex), false);
  for (const invalid of ["", "not-a-uuid", `${id}';select 1;--`]) {
    assert.throws(() => disposableDocumentObserverInsertSql({ id: invalid, secretHex }));
    assert.throws(() => disposableDocumentObserverDisableSql(invalid));
  }
  for (const builder of [disposableObserverInsertSql, disposableDocumentObserverInsertSql]) {
    for (const invalid of ["", "a".repeat(63), "A".repeat(64), "PRIVATE_SENTINEL"]) {
      assert.throws(
        () => builder({ id, secretHex: invalid }),
        (error) =>
          error instanceof Error && error.message === "Invalid disposable observer material.",
      );
    }
  }
});

test("joint provisioning checks one full baseline and creates independent domains atomically", () =>
  withCI(() => {
    let reads = 0;
    const writes: string[] = [];
    const owned = provisionDisposableObservers(
      {
        json: (query) => {
          assert.equal(query, pristineBaselineQuery);
          reads++;
          return baseline;
        },
        sql: (query) => {
          writes.push(query);
          if (query.startsWith("update")) return query.match(/where id='([a-f0-9-]+)'/)![1];
          return "";
        },
      },
      { documents: true },
    );
    assert.equal(reads, 1);
    assert.equal(writes.length, 1);
    assert.ok(owned.documentObserver);
    assert.ok(owned.documentObserver.id !== owned.observer.id);
    assert.ok(owned.documentObserver.secretHex !== owned.observer.secretHex);
    assert.equal((writes[0].match(/\bbegin;/g) ?? []).length, 1);
    assert.equal((writes[0].match(/\bcommit;/g) ?? []).length, 1);
    assert.equal((writes[0].match(/insert into/g) ?? []).length, 2);
    assert.ok(writes[0].includes(disposableObserverInsertSql(owned.observer)));
    assert.ok(writes[0].includes(disposableDocumentObserverInsertSql(owned.documentObserver)));
    owned.disable();
    assert.equal(writes.length, 3);
    assert.equal(owned.observer.secretHex, "");
    assert.equal(owned.documentObserver.secretHex, "");
    assert.equal(writes[1], disposableObserverDisableSql(owned.observer.id));
    assert.equal(writes[2], disposableDocumentObserverDisableSql(owned.documentObserver.id));
  }));

test("joint provisioning fails closed for every changed or missing baseline field", () =>
  withCI(() => {
    for (const key of Object.keys(baseline)) {
      const missing = Object.fromEntries(Object.entries(baseline).filter(([name]) => name !== key));
      for (const invalid of [missing, { ...baseline, [key]: key === "products" ? 44 : 1 }]) {
        let writes = 0;
        assert.throws(() =>
          provisionDisposableObservers(
            {
              json: () => invalid,
              sql: () => {
                writes++;
                return "";
              },
            },
            { documents: true },
          ),
        );
        assert.equal(writes, 0);
      }
    }
    let reads = 0;
    assert.throws(() =>
      provisionDisposableObservers(
        {
          json: () => {
            reads++;
            return baseline;
          },
          sql: () => "",
        },
        { documents: "true" as unknown as boolean },
      ),
    );
    assert.equal(reads, 0);
  }));

test("joint cleanup attempts both owned domains after either disable fails and clears all material", () =>
  withCI(() => {
    for (const domain of ["media", "document"]) {
      for (const failure of ["throw", "missing"]) {
        const writes: string[] = [];
        const owned = provisionDisposableObservers(
          {
            json: () => baseline,
            sql: (query) => {
              writes.push(query);
              if (!query.startsWith("update")) return "";
              if (query.includes(`pi_${domain}_`)) {
                if (failure === "throw") throw new Error("PRIVATE_SENTINEL");
                return "";
              }
              return query.match(/where id='([a-f0-9-]+)'/)![1];
            },
          },
          { documents: true },
        );
        assert.throws(
          () => owned.disable(),
          (error) =>
            error instanceof Error &&
            error.message ===
              "Owned disposable key disable is unverified; private output suppressed.",
        );
        assert.equal(writes.length, 3);
        assert.equal(owned.observer.secretHex, "");
        assert.equal(owned.documentObserver?.secretHex, "");
      }
    }
  }));

test("failed atomic provisioning attempts both disables without reporting provider output", () =>
  withCI(() => {
    for (const failDisable of [false, true]) {
      const writes: string[] = [];
      assert.throws(
        () =>
          provisionDisposableObservers(
            {
              json: () => baseline,
              sql: (query) => {
                writes.push(query);
                if (writes.length === 1 || (failDisable && writes.length === 2))
                  throw new Error("PRIVATE_SENTINEL");
                return "";
              },
            },
            { documents: true },
          ),
        (error) =>
          error instanceof Error &&
          error.message ===
            (failDisable
              ? "Disposable observer provisioning failed; owned key disable is unverified; private output suppressed."
              : "Disposable observer provisioning failed; private output suppressed."),
      );
      assert.equal(writes.length, 3);
      assert.match(writes[1], /^update private\.pi_media_observation_keys/);
      assert.match(writes[2], /^update private\.pi_document_observation_keys/);
      assert.doesNotMatch(writes.slice(1).join("\n"), /secret|decode|delete|truncate/);
    }
  }));

test("the compatibility wrapper stays media-only by default", () =>
  withCI(() => {
    const writes: string[] = [];
    const owned = provisionDisposableMediaObserver({
      json: () => baseline,
      sql: (query) => {
        writes.push(query);
        return query.match(/where id='([a-f0-9-]+)'/)?.[1] ?? "";
      },
    });
    assert.equal(owned.documentObserver, undefined);
    owned.disable();
    assert.equal(writes.length, 2);
    assert.doesNotMatch(writes.join("\n"), /pi_document_/);
  }));

test("failed provisioning does not mistake an unexpected cleanup receipt for verification", () =>
  withCI(() => {
    let writes = 0;
    assert.throws(
      () =>
        provisionDisposableObservers(
          {
            json: () => baseline,
            sql: () => {
              writes++;
              if (writes === 1) throw new Error("PRIVATE_SENTINEL");
              return "unexpected receipt";
            },
          },
          { documents: true },
        ),
      (error) =>
        error instanceof Error &&
        error.message ===
          "Disposable observer provisioning failed; owned key disable is unverified; private output suppressed.",
    );
    assert.equal(writes, 3);
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
      runner.indexOf(
        "observer = provisionDisposableObservers(local, { documents: local.documents })",
      ),
  );
  assert.doesNotMatch(runner, /CONSOLE_(MEDIA|DOCUMENT)_OBSERVATION_(SECRET_HEX|KEY_ID)/);
});
