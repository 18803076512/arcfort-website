import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { assertPristineBaseline, pristineBaselineQuery, sqlLiteral } from "./local-acceptance.ts";
import { originalUuid } from "../../lib/domain/catalog/originals.ts";

export type DisposableMediaObserver = { id: string; secretHex: string };
type Database = { json: (query: string) => unknown; sql: (query: string) => string };

export function disposableObserverInsertSql(observer: DisposableMediaObserver) {
  assert.match(observer.id, originalUuid);
  assert.ok(/^[a-f0-9]{64}$/.test(observer.secretHex), "Invalid disposable observer material.");
  return `insert into private.pi_media_observation_keys(id,secret,valid_from,valid_until,enabled)
    values(${sqlLiteral(observer.id)},decode(${sqlLiteral(observer.secretHex)},'hex'),
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '1 hour',true);`;
}
export function disposableObserverDisableSql(id: string) {
  assert.match(id, originalUuid);
  return `update private.pi_media_observation_keys set enabled=false
    where id=${sqlLiteral(id)} returning id;`;
}

export function disposableDocumentObserverInsertSql(observer: DisposableMediaObserver) {
  assert.match(observer.id, originalUuid);
  assert.ok(/^[a-f0-9]{64}$/.test(observer.secretHex), "Invalid disposable observer material.");
  return `insert into private.pi_document_observation_keys(id,secret,valid_from,valid_until,enabled)
    values(${sqlLiteral(observer.id)},decode(${sqlLiteral(observer.secretHex)},'hex'),
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '1 hour',true);`;
}
export function disposableDocumentObserverDisableSql(id: string) {
  assert.match(id, originalUuid);
  return `update private.pi_document_observation_keys set enabled=false
    where id=${sqlLiteral(id)} returning id;`;
}

function freshObserver(): DisposableMediaObserver {
  const secret = randomBytes(32);
  try {
    return { id: randomUUID(), secretHex: secret.toString("hex") };
  } finally {
    secret.fill(0);
  }
}

// The caller has already verified the CI invocation, local socket/container and CLI target.
// Re-read the entire pristine baseline before generating or writing any signing material.
export function provisionDisposableMediaObserver(local: Database) {
  return provisionDisposableObservers(local);
}

export function provisionDisposableObservers(
  local: Database,
  options: { documents?: boolean } = {},
) {
  assert.equal(process.env.CI, "true", "Disposable CI only.");
  assert.ok(options.documents === undefined || typeof options.documents === "boolean");
  assertPristineBaseline(local.json(pristineBaselineQuery));
  const observer = freshObserver();
  const documentObserver = options.documents ? freshObserver() : undefined;
  const owned = [
    { key: observer, disableSql: disposableObserverDisableSql },
    ...(documentObserver
      ? [{ key: documentObserver, disableSql: disposableDocumentObserverDisableSql }]
      : []),
  ];
  function disable(requireExisting: boolean) {
    let failed = false;
    // Always attempt every owned key, even if one provider operation fails.
    for (const { key, disableSql } of owned) {
      try {
        const result = local.sql(disableSql(key.id));
        if (result !== key.id && (requireExisting || result !== "")) failed = true;
      } catch {
        failed = true;
      } finally {
        key.secretHex = "";
      }
    }
    return !failed;
  }
  try {
    // SQL is sent on psql stdin by openLocalAcceptance, never in arguments or printed output.
    local.sql(`begin; set local log_statement='none'; set local log_min_error_statement='panic';
      ${disposableObserverInsertSql(observer)}
      ${documentObserver ? disposableDocumentObserverInsertSql(documentObserver) : ""} commit;`);
  } catch {
    if (!disable(false)) {
      throw new Error(
        "Disposable observer provisioning failed; owned key disable is unverified; private output suppressed.",
      );
    }
    throw new Error("Disposable observer provisioning failed; private output suppressed.");
  }
  return {
    observer,
    documentObserver,
    disable() {
      assert.ok(
        disable(true),
        "Owned disposable key disable is unverified; private output suppressed.",
      );
    },
  };
}
