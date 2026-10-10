import type { MediaData, MediaFilters } from "../../lib/console/media.ts";
import { mediaCoverage } from "../../lib/domain/catalog/media.ts";

export function mediaFixture(filter: MediaFilters): MediaData {
  const id = "10000000-0000-4000-8000-000000000001";
  const sku = "AF-MIG-QA-9999";
  const proof = {
    publication: "legacy_reference",
    rights: "needs_confirmation",
    match: "product_family_reference",
    hasOwner: false,
    hasSource: true,
    hasApproval: false,
  };
  if (filter.view === "coverage")
    return {
      view: "coverage",
      page: filter.page,
      pageSize: 25,
      total: filter.q === "empty" || filter.missingView === "main" ? 0 : 26,
      items:
        filter.q === "empty" || filter.missingView === "main"
          ? []
          : [
              {
                id,
                sku,
                name: "Synthetic media coverage product",
                coverage: mediaCoverage([{ role: "main", asset: proof }]),
              },
            ],
    };
  const common = {
    sourceKind: "synthetic_fixture",
    publication: proof.publication,
    rights: proof.rights,
    match: proof.match,
    recordedApproval: false,
    invalidPublicPath: false,
    hashState: "recorded",
    sameHashAssets: 2,
  };
  let items: Extract<MediaData, { view: "assets" }>["items"] = [
    {
      ...common,
      id: "asset-1",
      key: "Synthetic main reference",
      thumbnail: "/images/products/mig-tip-holder-for-mb15.jpg",
      assignments: [{ id: "mapping-1", variantId: id, sku, role: "main" }],
    },
    {
      ...common,
      id: "asset-2",
      key: "Synthetic unassigned reference",
      thumbnail: "/images/products/mig-torch-liner.jpg",
      assignments: [],
    },
    {
      ...common,
      id: "asset-3",
      key: "Synthetic unavailable private original",
      thumbnail: null,
      assignments: [],
      sameHashAssets: null,
      hashState: "missing",
    },
  ];
  if (filter.assignment === "unassigned") items = items.filter((item) => !item.assignments.length);
  if (filter.variant)
    items = items.filter((item) =>
      item.assignments.some((link) => link.variantId === filter.variant),
    );
  if (filter.q)
    items = items.filter((item) => item.key.toLowerCase().includes(filter.q.toLowerCase()));
  if (filter.rights) items = items.filter((item) => item.rights === filter.rights);
  if (filter.match) items = items.filter((item) => item.match === filter.match);
  if (filter.publication) items = items.filter((item) => item.publication === filter.publication);
  return { view: "assets", page: filter.page, pageSize: 25, total: items.length, items };
}
