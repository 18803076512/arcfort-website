import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { originalUuid } from "../domain/catalog/originals.ts";
import type { MediaReviewSnapshot } from "../domain/catalog/media-commands.ts";

export const mediaObservationSeconds = 300;
export function mediaObservationKey(env: Record<string, string | undefined> = process.env) {
  const id = env.CONSOLE_MEDIA_OBSERVATION_KEY_ID;
  const secret = env.CONSOLE_MEDIA_OBSERVATION_SECRET_HEX;
  if (!id || !originalUuid.test(id) || !secret || !/^[a-f0-9]{64}$/.test(secret)) return null;
  return { id: id.toLowerCase(), secret: Buffer.from(secret, "hex") };
}
export function parseMediaReviewSnapshot(value: unknown): MediaReviewSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    Object.keys(row).sort().join(",") !==
    "adoption_id,asset_id,digest,mapping_id,original_digest,revision,variant_id"
  )
    return null;
  for (const field of ["mapping_id", "variant_id", "asset_id", "adoption_id"])
    if (typeof row[field] !== "string" || !originalUuid.test(row[field])) return null;
  if (
    !Number.isSafeInteger(row.revision) ||
    (row.revision as number) < 1 ||
    typeof row.digest !== "string" ||
    !/^[a-f0-9]{64}$/.test(row.digest) ||
    typeof row.original_digest !== "string" ||
    !/^[a-f0-9]{64}$/.test(row.original_digest)
  )
    return null;
  return row as MediaReviewSnapshot;
}
export function signMediaObservation(
  snapshot: MediaReviewSnapshot,
  actor: string,
  key: NonNullable<ReturnType<typeof mediaObservationKey>>,
  now = Math.floor(Date.now() / 1000),
) {
  if (
    !parseMediaReviewSnapshot(snapshot) ||
    !originalUuid.test(actor) ||
    !Number.isSafeInteger(now) ||
    now < 1
  )
    throw new Error("Invalid original observation.");
  const payload = [
    "v1",
    key.id,
    actor.toLowerCase(),
    snapshot.adoption_id.toLowerCase(),
    snapshot.mapping_id.toLowerCase(),
    snapshot.revision,
    snapshot.digest,
    snapshot.original_digest,
    now,
    now + mediaObservationSeconds,
    randomUUID(),
  ].join("|");
  return `${payload}|${createHmac("sha256", key.secret).update(payload, "utf8").digest("hex")}`;
}
