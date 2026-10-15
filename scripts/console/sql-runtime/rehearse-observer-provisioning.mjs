import assert from "node:assert/strict";
import {
  disposableObserverInsertSql,
  disposableObserverDisableSql,
  disposableDocumentObserverInsertSql,
  disposableDocumentObserverDisableSql,
} from "../media-acceptance.ts";

// Synthetic material and an in-memory database only. This does not provision a provider key.
export async function rehearseObserverProvisioning(db) {
  const media = { id: "a8110000-0000-4000-8000-000000000001", secretHex: "a".repeat(64) };
  const document = { id: "a8110000-0000-4000-8000-000000000002", secretHex: "b".repeat(64) };
  const counts = async () =>
    (
      await db.query(`select
    (select count(*)::int from private.pi_media_observation_keys) as media,
    (select count(*)::int from private.pi_document_observation_keys) as document`)
    ).rows[0];
  assert.deepEqual(await counts(), { media: 0, document: 0 });

  await db.exec("begin");
  try {
    await db.exec(disposableObserverInsertSql(media));
    await db.exec(disposableDocumentObserverInsertSql(document));
    assert.deepEqual(await counts(), { media: 1, document: 1 });
    for (const [domain, key] of [
      ["media", media],
      ["document", document],
    ]) {
      const row = (
        await db.query(
          `select id,
        encode(secret,'hex')=$1 as material_matches, enabled,
        valid_from<=clock_timestamp() as already_valid,
        valid_until>clock_timestamp()+interval '59 minutes' as bounded_lifetime
        from private.pi_${domain}_observation_keys`,
          [key.secretHex],
        )
      ).rows[0];
      assert.deepEqual(row, {
        id: key.id,
        material_matches: true,
        enabled: true,
        already_valid: true,
        bounded_lifetime: true,
      });
    }
    for (const [sql, key] of [
      [disposableObserverDisableSql(media.id), media],
      [disposableDocumentObserverDisableSql(document.id), document],
    ])
      assert.deepEqual((await db.query(sql)).rows, [{ id: key.id }]);
    const disabled = (
      await db.query(`select
      (select count(*)::int from private.pi_media_observation_keys where enabled) as media,
      (select count(*)::int from private.pi_document_observation_keys where enabled) as document`)
    ).rows[0];
    assert.deepEqual(disabled, { media: 0, document: 0 });
    assert.deepEqual(await counts(), { media: 1, document: 1 });
  } finally {
    await db.exec("rollback");
  }
  assert.deepEqual(await counts(), { media: 0, document: 0 });

  // A late second-domain failure must not leave the first domain provisioned.
  await db.exec("begin");
  try {
    await db.exec(disposableDocumentObserverInsertSql(document));
    await db.exec(disposableObserverInsertSql(media));
    await assert.rejects(
      db.exec(disposableDocumentObserverInsertSql(document)),
      (error) => error.code === "23505",
    );
  } finally {
    await db.exec("rollback");
  }
  assert.deepEqual(await counts(), { media: 0, document: 0 });
  console.log(
    "Shared media/document observer SQL, owned disable and late-failure rollback passed in memory; zero keys retained.",
  );
}
