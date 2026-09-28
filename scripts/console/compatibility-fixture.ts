import type {
  CompatibilityHistory,
  CompatibilityWorkbenchData,
} from "../../lib/console/compatibility.ts";
import { compatibilityFilters } from "../../lib/console/compatibility.ts";

export const compatibilityIds = {
  variant: "10000000-0000-4000-8000-000000000001",
  subject: "20000000-0000-4000-8000-000000000001",
  target: "30000000-0000-4000-8000-000000000001",
  root: "40000000-0000-4000-8000-000000000001",
  candidate: "50000000-0000-4000-8000-000000000001",
  source: "60000000-0000-4000-8000-000000000001",
};

// Synthetic interface data only. It is never imported into a catalog or an Auth session.
export function compatibilityFixture(query: Record<string, string>) {
  const filter = compatibilityFilters(query);
  const ids = compatibilityIds;
  const source = {
    id: ids.source,
    title: "Synthetic assembly drawing",
    reference: "QA-DRAWING-ONLY",
    level: "A",
    assertion: "supports",
    basis: query.basis === "catalog" ? "company_catalog" : "drawing",
    version: "QA-1",
    location: "Callout 1",
    subjectId: ids.subject,
    targetId: ids.target,
    type: "product_to_series" as const,
    scope: "Synthetic assembly A",
    role: "Tip holder",
  };
  const fact = {
    id: ids.root,
    role: source.role,
    status: "NEEDS_FACTORY_CONFIRMATION" as const,
    relationshipStatus: "reference_only",
    requirements: ["Exact assembly drawing required"],
    evidence: [{ ...source, linkRole: "supporting" }],
  };
  const data: CompatibilityWorkbenchData = {
    variantId: ids.variant,
    sku: "AF-MIG-QA-9999",
    subjectId: query.identity === "missing" ? null : ids.subject,
    canEdit: !["viewer", "reviewer"].includes(query.role),
    canReview: !["viewer", "editor"].includes(query.role),
    sources: query.evidence === "unbound" ? [] : [source],
    scopes: [
      {
        id: ids.root,
        targetId: ids.target,
        targetLabel: "Synthetic 15AK reference",
        type: "product_to_series",
        scope: source.scope,
        revision: 2,
        original: fact,
        current: fact,
        candidate: {
          ...fact,
          id: ids.candidate,
          state: query.state ?? "proposed",
          digest: "a".repeat(64),
          status: query.conflict === "1" ? "DATA_CONFLICT" : fact.status,
        },
      },
    ],
  };
  const allTargets = Array.from({ length: 27 }, (_, index) => ({
    id: index ? `30000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}` : ids.target,
    label: index
      ? `Synthetic ${filter.kind} ${String(index + 1).padStart(2, "0")}`
      : "Synthetic 15AK reference",
    type: filter.kind,
  })).filter((target) => target.label.toLowerCase().includes(filter.q.toLowerCase()));
  const targets = {
    items: allTargets.slice((filter.targetPage - 1) * 25, filter.targetPage * 25),
    page: filter.targetPage,
    pageSize: 25,
    total: allTargets.length,
  };
  const history: CompatibilityHistory = {
    rootId: ids.root,
    page: filter.historyPage,
    pageSize: 25,
    total: 26,
    items:
      filter.historyPage === 1
        ? [
            {
              id: ids.candidate,
              sequence: 2,
              state: query.state ?? "proposed",
              reason: "Synthetic review trail",
              createdAt: "2026-09-25T00:00:00Z",
              role: fact.role,
              status: fact.status,
              decision: null,
              decisionReason: null,
            },
          ]
        : [
            {
              id: ids.root,
              sequence: 1,
              state: "rejected",
              reason: "Synthetic earlier proposal",
              createdAt: "2026-09-24T00:00:00Z",
              role: fact.role,
              status: fact.status,
              decision: "REJECT",
              decisionReason: "Synthetic rejection",
            },
          ],
  };
  return {
    data,
    targets,
    filter,
    history,
    selectedId: filter.root === "new" ? "" : filter.root || ids.root,
  };
}
