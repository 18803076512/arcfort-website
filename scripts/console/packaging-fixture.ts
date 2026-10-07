import type {
  PackagingData,
  PackagingFact,
  PackagingHistory,
} from "../../lib/console/packaging.ts";
export const packagingId = (n: number) => `a3000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const packagingEnv = {
  CONSOLE_ENABLED: "true",
  CONSOLE_WORKING_ENABLED: "true",
  CONSOLE_PACKAGING_ENABLED: "true",
  CONSOLE_ENVIRONMENT: "local",
  CONSOLE_ORIGIN: "http://127.0.0.1:3000",
  CONSOLE_SUPABASE_URL: "http://127.0.0.1:54321",
  CONSOLE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_packaging",
};
export function packagingFixture(query: Record<string, string> = {}): {
  data: PackagingData;
  selectedId: string;
  history: PackagingHistory | null;
} {
  const id = packagingId,
    role = query.role ?? "owner",
    state = query.state ?? "pending";
  const copy = {
    package_description:
      query.long === "1"
        ? "TEST-ONLY-Synthetic-package-description-".repeat(15)
        : "TEST-ONLY sealed inner bag",
    quantity: query.unknown === "1" ? null : 10,
    quantity_unit: query.unknown === "1" ? null : "pieces",
  };
  const latest: PackagingFact = {
    id: id(3),
    copy,
    revision: 2,
    state,
    status: query.conflict === "1" ? "DATA_CONFLICT" : "NEEDS_FACTORY_CONFIRMATION",
    digest: "a".repeat(64),
    reason: "Synthetic packaging proposal; no real supply confirmation",
    sources: [id(5), id(6)],
    fresh: query.stale !== "1",
    valid: false,
  };
  const sources: PackagingData["sources"] = [
    {
      id: id(5),
      copy,
      originalId: id(4),
      kind: "company_record",
      level: "A",
      basis: "packaging_record",
      assertion: "supports",
      title: "Synthetic packaging record",
      document: "TEST-ONLY-A",
      location: "Synthetic page 1",
      version: "QA-1",
      date: "2026-01-01",
      owner: "Synthetic custodian",
      current: query.staleSource !== "1",
    },
    {
      id: id(6),
      copy,
      originalId: id(4),
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
      id: id(7),
      copy: { ...copy, quantity: 15, quantity_unit: "pieces" },
      assertion: "contradicts",
      title: "Synthetic historical-count contradiction",
    });
  const data: PackagingData = {
    variantId: id(1),
    sku: "AF-MIG-QA-9996",
    canSource: ["owner", "editor", "reviewer"].includes(role),
    canPropose: ["owner", "editor"].includes(role),
    canSubmit: ["owner", "editor", "reviewer"].includes(role),
    canReview: ["owner", "reviewer"].includes(role),
    sources,
    scopes: [
      {
        id: id(2),
        slot: 0,
        originalId: id(4),
        revision: 2,
        latest,
        conflicts: query.conflict === "1" ? [id(7)] : [],
        current: {
          ...latest,
          id: id(8),
          revision: 1,
          state: "approved",
          status: query.staleCurrent === "1" ? "DATA_CONFLICT" : "OEM_REFERENCE",
          sources: [id(6)],
          fresh: query.staleCurrent !== "1",
          valid: query.staleCurrent !== "1",
        },
      },
    ],
    originals: [
      {
        id: id(4),
        copy: {
          package_description: "TEST-ONLY original carton",
          quantity: null,
          quantity_unit: null,
        },
        status: "NEEDS_FACTORY_CONFIRMATION",
        level: null,
        moq: "TEST-ONLY MOQ retained",
        leadTime: "TEST-ONLY lead time retained",
      },
    ],
    readiness: {
      count: 2,
      unknown: query.unknown === "1" ? 2 : 0,
      unresolved: 2,
      conflicts: Number(query.conflict === "1") + Number(query.staleCurrent === "1"),
    },
  };
  const history: PackagingHistory = {
    page: Number(query.historyPage ?? 1),
    pageSize: 25,
    total: 30,
    items: [
      {
        id: latest.id,
        revision: 2,
        copy,
        state,
        status: latest.status,
        reason: latest.reason,
        createdAt: "2026-10-05T00:00:00Z",
        decision: null,
        reviewReason: null,
        resolution: null,
        approvedStatus: null,
      },
    ],
  };
  if (query.head === "new") {
    data.scopes = [];
    data.sources = [];
    data.readiness = { count: 1, unknown: 1, unresolved: 1, conflicts: 0 };
  }
  if (query.empty === "1") {
    data.scopes = [];
    data.sources = [];
    data.originals = [];
    data.readiness = { count: 0, unknown: 0, unresolved: 1, conflicts: 0 };
  }
  return {
    data,
    selectedId: data.scopes[0]?.id ?? "",
    history: data.scopes.length ? history : null,
  };
}
