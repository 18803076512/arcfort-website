import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { documentUuid } from "../domain/catalog/documents.ts";

export const documentObservationSeconds = 300;
export type DocumentReviewSnapshot = {
  candidate_id: string;
  document_id: string;
  variant_id: string;
  adoption_id: string;
  revision: number;
  digest: string;
  original_digest: string;
  evidence_digest: string;
};
export function documentObservationKey(env: Record<string, string | undefined> = process.env) {
  const id = env.CONSOLE_DOCUMENT_OBSERVATION_KEY_ID;
  const secret = env.CONSOLE_DOCUMENT_OBSERVATION_SECRET_HEX;
  if (!id || !documentUuid.test(id) || !secret || !/^[a-f0-9]{64}$/.test(secret)) return null;
  return { id: id.toLowerCase(), secret: Buffer.from(secret, "hex") };
}
export function parseDocumentReviewSnapshot(value: unknown): DocumentReviewSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    Object.keys(row).sort().join(",") !==
    "adoption_id,candidate_id,digest,document_id,evidence_digest,original_digest,revision,variant_id"
  )
    return null;
  for (const field of ["candidate_id", "document_id", "variant_id", "adoption_id"])
    if (typeof row[field] !== "string" || !documentUuid.test(row[field])) return null;
  for (const field of ["digest", "original_digest", "evidence_digest"])
    if (typeof row[field] !== "string" || !/^[a-f0-9]{64}$/.test(row[field])) return null;
  if (
    !Number.isSafeInteger(row.revision) ||
    Number(row.revision) < 1 ||
    Number(row.revision) > 999999999999999
  )
    return null;
  return {
    candidate_id: (row.candidate_id as string).toLowerCase(),
    document_id: (row.document_id as string).toLowerCase(),
    variant_id: (row.variant_id as string).toLowerCase(),
    adoption_id: (row.adoption_id as string).toLowerCase(),
    revision: row.revision as number,
    digest: row.digest as string,
    original_digest: row.original_digest as string,
    evidence_digest: row.evidence_digest as string,
  };
}
export function signDocumentObservation(
  value: DocumentReviewSnapshot,
  actor: string,
  key: NonNullable<ReturnType<typeof documentObservationKey>>,
  now = Math.floor(Date.now() / 1000),
) {
  const snapshot = parseDocumentReviewSnapshot(value);
  if (
    !snapshot ||
    !documentUuid.test(actor) ||
    !documentUuid.test(key.id) ||
    !Buffer.isBuffer(key.secret) ||
    key.secret.length !== 32 ||
    !Number.isSafeInteger(now) ||
    now < 1 ||
    now > 9999999699
  )
    throw new Error("Invalid document observation.");
  const payload = [
    "document-v1",
    key.id.toLowerCase(),
    actor.toLowerCase(),
    snapshot.adoption_id,
    snapshot.candidate_id,
    snapshot.document_id,
    snapshot.variant_id,
    snapshot.revision,
    snapshot.digest,
    snapshot.original_digest,
    snapshot.evidence_digest,
    now,
    now + documentObservationSeconds,
    randomUUID(),
  ].join("|");
  return `${payload}|${createHmac("sha256", key.secret).update(payload, "utf8").digest("hex")}`;
}
