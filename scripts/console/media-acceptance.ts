import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { assertPristineBaseline, pristineBaselineQuery, sqlLiteral } from "./local-acceptance.ts";
import { originalUuid } from "../../lib/domain/catalog/originals.ts";

export type DisposableMediaObserver = { id: string; secretHex: string };
type Database = { json: (query: string) => unknown; sql: (query: string) => string };

export function disposableObserverInsertSql(observer: DisposableMediaObserver) {
  assert.match(observer.id, originalUuid);
  assert.match(observer.secretHex, /^[a-f0-9]{64}$/);
  return `insert into private.pi_media_observation_keys(id,secret,valid_from,valid_until,enabled)
    values(${sqlLiteral(observer.id)},decode(${sqlLiteral(observer.secretHex)},'hex'),
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '1 hour',true);`;
}
export function disposableObserverDisableSql(id: string) {
  assert.match(id, originalUuid);
  return `update private.pi_media_observation_keys set enabled=false
    where id=${sqlLiteral(id)} returning id;`;
}

// The caller has already verified the CI invocation, local socket/container and CLI target.
// Re-read the entire pristine baseline before generating or writing any signing material.
export function provisionDisposableMediaObserver(local: Database) {
  assert.equal(process.env.CI, "true", "Disposable CI only.");
  assertPristineBaseline(local.json(pristineBaselineQuery));
  const secret = randomBytes(32);
  const observer = { id: randomUUID(), secretHex: secret.toString("hex") };
  secret.fill(0);
  try {
    // SQL is sent on psql stdin by openLocalAcceptance, never in arguments or printed output.
    local.sql(`begin; set local log_statement='none'; set local log_min_error_statement='panic';
      ${disposableObserverInsertSql(observer)} commit;`);
  } catch {
    observer.secretHex = "";
    try {
      local.sql(disposableObserverDisableSql(observer.id));
    } catch {
      throw new Error(
        "Disposable observer provisioning failed; owned key disable is unverified; private output suppressed.",
      );
    }
    throw new Error("Disposable observer provisioning failed; private output suppressed.");
  }
  return {
    observer,
    disable() {
      try {
        const result = local.sql(disposableObserverDisableSql(observer.id));
        assert.equal(result, observer.id, "The owned disposable observer was not disabled.");
      } finally {
        observer.secretHex = "";
      }
    },
  };
}
