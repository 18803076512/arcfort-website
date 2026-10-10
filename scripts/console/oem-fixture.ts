import type { OemData, OemFact, OemHistory } from "../../lib/console/oem.ts";
export const oemId = (n: number) => `a1000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const oemEnv = {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_OEM_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_oem",
};
export function oemFixture(query: Record<string, string> = {}): {
  data: OemData;
  selectedId: string;
  history: OemHistory | null;
} {
  const role = query.role ?? "owner";
  const state = query.state ?? "pending";
  const manufacturer =
    query.long === "1"
      ? "Synthetic TEST-ONLY manufacturer ".repeat(3).trim()
      : "Synthetic manufacturer";
  const reference = query.long === "1" ? "TEST-ONLY-".repeat(8) : "TEST-ONLY-001";
  const latest: OemFact = {
    id: oemId(3),
    manufacturer,
    reference,
    revision: 2,
    state,
    status: query.conflict === "1" ? "DATA_CONFLICT" : "NEEDS_FACTORY_CONFIRMATION",
    digest: "a".repeat(64),
    reason: "Synthetic OEM proposal; no real product confirmation",
    sources: [oemId(5), oemId(6)],
    fresh: query.stale !== "1",
    valid: false,
  };
  const sources: OemData["sources"] = [
    {
      id: oemId(5),
      manufacturer,
      reference,
      kind: "company_record",
      level: "A",
      basis: "factory_record",
      assertion: "supports",
      title: "Synthetic factory record",
      document: "TEST-ONLY-A",
      location: "Synthetic page 1",
      version: "QA-1",
      date: "2026-01-01",
      owner: "Synthetic custodian",
      current: query.staleSource !== "1",
    },
    {
      id: oemId(6),
      manufacturer,
      reference,
      kind: "official_manufacturer",
      level: "B",
      basis: "manufacturer_catalog",
      assertion: "reference_only",
      title: "Synthetic official reference",
      document: "TEST-ONLY-B",
      location: "Synthetic page 2",
      version: "QA-1",
      date: "2026-01-01",
      owner: "Synthetic custodian",
      current: true,
    },
  ];
  if (query.conflict === "1")
    sources.push({
      ...sources[0],
      id: oemId(7),
      assertion: "contradicts",
      title: "Synthetic contradiction",
    });
  const data: OemData = {
    variantId: oemId(1),
    sku: "AF-MIG-QA-9998",
    canPropose: ["owner", "editor"].includes(role),
    canSource: ["owner", "editor", "reviewer"].includes(role),
    canSubmit: ["owner", "editor", "reviewer"].includes(role),
    canReview: ["owner", "reviewer"].includes(role),
    sources,
    scopes: [
      {
        id: oemId(2),
        slot: 0,
        originalId: oemId(4),
        revision: 2,
        latest,
        current: {
          ...latest,
          id: oemId(8),
          revision: 1,
          state: "approved",
          status: query.staleCurrent === "1" ? "DATA_CONFLICT" : "OEM_REFERENCE",
          reason: "Synthetic preceding reference decision",
          fresh: query.staleCurrent !== "1",
          valid: query.staleCurrent !== "1",
          sources: [oemId(6)],
        },
      },
    ],
    originals: [
      {
        id: oemId(4),
        manufacturer,
        reference: "TEST-ONLY-ORIGINAL",
        status: "OEM_REFERENCE",
        level: "B",
      },
    ],
  };
  if (query.unlinked === "1")
    data.originals.push({
      id: oemId(13),
      manufacturer,
      reference: "TEST-ONLY-UNLINKED",
      status: "OEM_REFERENCE",
      level: "B",
    });
  if (query.state === "empty") data.scopes = [];
  const selectedId = query.head === "new" || query.state === "empty" ? "" : data.scopes[0].id;
  const page = Number(query.historyPage ?? 1);
  const history: OemHistory | null = selectedId
    ? {
        page,
        pageSize: 25,
        total: 26,
        items: [
          {
            id: oemId(8),
            revision: 1,
            manufacturer,
            reference: "TEST-ONLY-ORIGINAL",
            state: "approved",
            status: "NEEDS_FACTORY_CONFIRMATION",
            reason: "Synthetic historical proposal",
            createdAt: "2026-01-01T00:00:00Z",
            decision: "APPROVE",
            reviewReason: "Synthetic human QA declaration only",
            resolution: "",
            approvedStatus: "OEM_REFERENCE",
          },
        ],
      }
    : null;
  return { data, selectedId, history };
}
