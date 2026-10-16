import { originalUuid } from "./originals.ts";

export const mediaEvidenceBases = {
  usage_rights: [
    "company_ownership",
    "supplier_authorization",
    "license_record",
    "catalog_reference",
    "secondary_reference",
  ],
  product_match: [
    "sku_label",
    "controlled_drawing",
    "approved_sample",
    "inspection_record",
    "catalog_reference",
    "secondary_reference",
  ],
} as const;
export type MediaDimension = keyof typeof mediaEvidenceBases;
export function qualifyingMediaSource(source: {
  level: string;
  assertion: string;
  basis: string;
  dimension: string;
}) {
  return (
    source.level === "A" &&
    source.assertion === "supports" &&
    Object.hasOwn(mediaEvidenceBases, source.dimension) &&
    mediaEvidenceBases[source.dimension as MediaDimension]
      .slice(0, -2)
      .some((basis) => basis === source.basis)
  );
}
export type MediaObservation = { value: string; expiresAt: number };
export type MediaInspectionContext = {
  mapping_id: string;
  revision: number;
  digest: string;
  original_digest: string;
};

// UI binding/expiry check only. The server and database verify the HMAC and current actor.
export function readMediaObservation(
  value: string | null,
  expected: MediaInspectionContext,
  now = Date.now(),
): MediaObservation | null {
  if (!value || value.length > 800) return null;
  const parts = value.split("|");
  if (
    parts.length !== 12 ||
    parts[0] !== "v1" ||
    ![parts[1], parts[2], parts[3], parts[4], parts[10]].every((part) => originalUuid.test(part)) ||
    ![parts[6], parts[7], parts[11]].every((part) => /^[a-f0-9]{64}$/.test(part)) ||
    !/^[1-9][0-9]{0,14}$/.test(parts[5]) ||
    ![parts[8], parts[9]].every((part) => /^[0-9]{1,10}$/.test(part)) ||
    parts[4] !== expected.mapping_id ||
    Number(parts[5]) !== expected.revision ||
    parts[6] !== expected.digest ||
    parts[7] !== expected.original_digest
  )
    return null;
  const issued = Number(parts[8]) * 1000;
  const expiresAt = Number(parts[9]) * 1000;
  if (issued > now + 5000 || expiresAt <= now || expiresAt <= issued || expiresAt - issued > 300000)
    return null;
  return { value, expiresAt };
}
