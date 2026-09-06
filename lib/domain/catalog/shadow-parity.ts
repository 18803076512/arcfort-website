import { createHash } from "node:crypto";

export type ShadowParityRow = Readonly<Record<string, unknown>>;

export type ShadowParityDifference = {
  identifier: string;
  digest: string;
};

export type ShadowTableParity = {
  matches: boolean;
  expectedCount: number;
  actualCount: number;
  comparedColumns: string[];
  missing: ShadowParityDifference[];
  unexpected: ShadowParityDifference[];
};

type ParityEntry = ShadowParityDifference & {
  fingerprint: string;
};

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, normalize(nested)]),
    );
  }
  if (value === undefined) return { __shadow_parity_undefined: true };
  return value;
}

function identify(row: ShadowParityRow): string {
  for (const key of ["external_key", "sku", "source_record_key", "id"]) {
    const value = row[key];
    if (typeof value === "string" && value.length > 0) return `${key}:${value}`;
  }

  const compositeKeys = [
    "technical_value_id",
    "evidence_source_id",
    "compatibility_relationship_id",
    "product_variant_id",
    "media_asset_id",
  ];
  const parts = compositeKeys.flatMap((key) => {
    const value = row[key];
    return typeof value === "string" && value.length > 0 ? [`${key}:${value}`] : [];
  });
  return parts.join("|") || "unkeyed-row";
}

function toEntry(row: ShadowParityRow, columns: readonly string[]): ParityEntry {
  const projected = Object.fromEntries(columns.map((column) => [column, normalize(row[column])]));
  const fingerprint = JSON.stringify(projected);
  return {
    identifier: identify(row),
    digest: createHash("sha256").update(fingerprint).digest("hex").slice(0, 12),
    fingerprint,
  };
}

function multisetDifference(left: readonly ParityEntry[], right: readonly ParityEntry[]) {
  const remaining = new Map<string, number>();
  for (const entry of right) {
    remaining.set(entry.fingerprint, (remaining.get(entry.fingerprint) ?? 0) + 1);
  }

  const difference: ShadowParityDifference[] = [];
  for (const entry of left) {
    const count = remaining.get(entry.fingerprint) ?? 0;
    if (count > 0) {
      remaining.set(entry.fingerprint, count - 1);
    } else {
      difference.push({ identifier: entry.identifier, digest: entry.digest });
    }
  }
  return difference;
}

export function compareShadowTableRows(
  expectedRows: readonly ShadowParityRow[],
  actualRows: readonly ShadowParityRow[],
): ShadowTableParity {
  const comparedColumns = [...new Set(expectedRows.flatMap((row) => Object.keys(row)))].sort();
  const expectedEntries = expectedRows.map((row) => toEntry(row, comparedColumns));
  const actualEntries = actualRows.map((row) => toEntry(row, comparedColumns));
  const missing = multisetDifference(expectedEntries, actualEntries);
  const unexpected = multisetDifference(actualEntries, expectedEntries);

  return {
    matches:
      expectedRows.length === actualRows.length && missing.length === 0 && unexpected.length === 0,
    expectedCount: expectedRows.length,
    actualCount: actualRows.length,
    comparedColumns,
    missing,
    unexpected,
  };
}
