import Image from "next/image";
import { Search } from "lucide-react";
import { ConsoleLink } from "./ConsoleLink";
import { DataTable, EmptyState, Pagination, Status } from "./CatalogViews";
import type { SearchParams } from "../../lib/console/catalog";
import {
  mediaMatches,
  mediaPublications,
  mediaRights,
  type MediaData,
  type MediaFilters,
} from "../../lib/console/media";

export function MediaWorkspace({
  data,
  filter,
  params,
}: {
  data: MediaData;
  filter: MediaFilters;
  params: SearchParams;
}) {
  const viewLink = (view: string) =>
    `/console/media?${new URLSearchParams({ view, ...(filter.variant ? { variant: filter.variant } : {}) })}`;
  return (
    <>
      <h1>Product Media</h1>
      <nav className="console-working-nav" aria-label="Media views">
        <ConsoleLink
          href={viewLink("coverage")}
          aria-current={data.view === "coverage" ? "page" : undefined}
        >
          SKU Coverage
        </ConsoleLink>
        <ConsoleLink
          href={viewLink("assets")}
          aria-current={data.view === "assets" ? "page" : undefined}
        >
          Asset Inventory
        </ConsoleLink>
      </nav>
      {filter.variant && (
        <p>
          <ConsoleLink href={`/console/products/${filter.variant}`}>Product evidence</ConsoleLink>
          {" / "}
          <ConsoleLink href={`/console/media?view=${data.view}`}>All products</ConsoleLink>
        </p>
      )}
      <form method="get" action="/console/media" className="console-toolbar">
        <input type="hidden" name="view" value={data.view} />
        {filter.variant && <input type="hidden" name="variant" value={filter.variant} />}
        <label className="console-search">
          {data.view === "coverage" ? "SKU or product name" : "Asset reference"}
          <input type="search" name="q" defaultValue={filter.q} maxLength={80} />
        </label>
        {data.view === "coverage" ? (
          <>
            <label>
              Search field
              <select aria-label="Search field" name="searchBy" defaultValue={filter.searchBy}>
                <option value="sku">SKU</option>
                <option value="name">Product name</option>
              </select>
            </label>
            <label>
              Missing mapping
              <select
                aria-label="Missing mapping"
                name="missingView"
                defaultValue={filter.missingView}
              >
                <option value="">All products</option>
                <option value="main">Main image</option>
                <option value="detail">Detail view</option>
                <option value="packaging">Packaging image</option>
              </select>
            </label>
          </>
        ) : (
          <>
            <label>
              Publication
              <select aria-label="Publication" name="publication" defaultValue={filter.publication}>
                <option value="">All states</option>
                {mediaPublications.map((state) => (
                  <option key={state} value={state}>
                    {state.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Usage rights
              <select aria-label="Usage rights" name="rights" defaultValue={filter.rights}>
                <option value="">All rights</option>
                {mediaRights.map((state) => (
                  <option key={state} value={state}>
                    {state.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Product match
              <select aria-label="Product match" name="match" defaultValue={filter.match}>
                <option value="">All matches</option>
                {mediaMatches.map((state) => (
                  <option key={state} value={state}>
                    {state.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            {!filter.variant && (
              <label>
                Assignment
                <select aria-label="Assignment" name="assignment" defaultValue={filter.assignment}>
                  <option value="all">All assets</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </label>
            )}
          </>
        )}
        <button
          className="console-button console-media-search"
          type="submit"
          aria-label="Apply media filters"
          title="Apply media filters"
        >
          <Search aria-hidden="true" size={20} />
        </button>
        <ConsoleLink href={viewLink(data.view)}>Clear</ConsoleLink>
      </form>
      {!data.items.length ? (
        <EmptyState />
      ) : data.view === "coverage" ? (
        <DataTable
          label="Media coverage by SKU"
          columns={["Product", "Main Image", "Detail Views", "Packaging"]}
        >
          {data.items.map((item) => (
            <tr key={item.id}>
              <td>
                <ConsoleLink href={`/console/media?view=assets&variant=${item.id}`}>
                  {item.sku}
                </ConsoleLink>
                <small>{item.name}</small>
                <ConsoleLink href={`/console/products/${item.id}`}>Product evidence</ConsoleLink>
              </td>
              {(["main", "detail", "packaging"] as const).map((role) => (
                <td key={role}>
                  {item.coverage[role].mapped ? (
                    <>
                      {item.coverage[role].mapped} mapped
                      <small>{item.coverage[role].recordedApproval} asset approvals recorded</small>
                    </>
                  ) : (
                    <span className="console-media-missing">Missing</span>
                  )}
                  {role === "main" && item.coverage.main.mapped > 1 && (
                    <small>Multiple main assignments</small>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </DataTable>
      ) : (
        <DataTable
          label="Media asset inventory"
          columns={["Asset", "SKU / Role", "Evidence", "File Checks"]}
        >
          {data.items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.thumbnail ? (
                  <ConsoleLink
                    href={item.thumbnail}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open image: ${item.key}`}
                    title="Open recorded image"
                  >
                    <Image
                      src={item.thumbnail}
                      alt="Recorded product reference"
                      width={144}
                      height={108}
                      unoptimized
                      className="console-media-thumb"
                    />
                  </ConsoleLink>
                ) : (
                  <div className="console-media-thumb console-media-unavailable">
                    Preview unavailable
                  </div>
                )}
                <p>{item.key}</p>
                <small>{item.sourceKind.replaceAll("_", " ")}</small>
              </td>
              <td>
                {item.assignments.length ? (
                  item.assignments.map((assignment) => (
                    <p key={assignment.id}>
                      {assignment.variantId ? (
                        <ConsoleLink href={`/console/products/${assignment.variantId}`}>
                          {assignment.sku}
                        </ConsoleLink>
                      ) : (
                        "Product unavailable"
                      )}
                      <small>{assignment.role.replaceAll("_", " ")}</small>
                    </p>
                  ))
                ) : (
                  <span className="console-media-missing">Unassigned</span>
                )}
                {new Set(item.assignments.map((assignment) => assignment.variantId)).size > 1 && (
                  <small>Shared across SKUs; exact match needs per-SKU review</small>
                )}
              </td>
              <td>
                <Status value={item.publication} />
                <small>Rights: {item.rights.replaceAll("_", " ")}</small>
                <small>Match: {item.match.replaceAll("_", " ")}</small>
                <small>
                  {item.recordedApproval ? "Asset approval recorded" : "Approval incomplete"}
                </small>
              </td>
              <td>
                {item.sameHashAssets && item.sameHashAssets > 1 ? (
                  <span className="console-media-missing">
                    Same recorded hash: {item.sameHashAssets} assets
                  </span>
                ) : item.hashState === "recorded" ? (
                  "No recorded hash duplicate"
                ) : item.hashState === "invalid" ? (
                  "Invalid recorded hash"
                ) : (
                  "Hash not recorded"
                )}
                {item.invalidPublicPath && (
                  <small className="console-media-missing">Public filename/path needs review</small>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      )}
      <Pagination data={data} params={params} path="/console/media" />
    </>
  );
}
