import { ConsoleLink } from "./ConsoleLink";
import { DocumentReadinessCell } from "./DocumentReadiness";
import { DataTable, EmptyState, Pagination } from "./CatalogViews";
import type { Filters, readReadiness, SearchParams } from "@/lib/console/catalog";

export function ReadinessWorkspace({
  data,
  filter,
  params,
}: {
  data: Awaited<ReturnType<typeof readReadiness>>;
  filter: Filters;
  params: SearchParams;
}) {
  return (
    <>
      <ConsoleLink className="console-back" href="/console/products">
        Products
      </ConsoleLink>
      <h1>Readiness Blockers</h1>
      <form method="get" className="console-toolbar">
        <label>
          SKU
          <input name="q" defaultValue={filter.q} maxLength={80} type="search" />
        </label>
        <label>
          Blocker
          <select name="blocker" defaultValue={filter.blocker}>
            <option value="all">All Blockers</option>
            <option value="technical">Unresolved Technical Values</option>
            <option value="image">No Eligible Main Image</option>
            <option value="compatibility">Unconfirmed Compatibility</option>
            <option value="seo">Unapproved SEO</option>
            {data.documentsEnabled && <option value="documents">Unresolved Documents</option>}
          </select>
        </label>
        <button className="console-button">Apply Filters</button>
      </form>
      {data.items.length ? (
        <DataTable
          label="SKU readiness"
          columns={[
            "SKU",
            "Blockers",
            "Unresolved Values",
            "Conflicting Values",
            "Eligible Main Images",
            "Approved SEO Records",
            ...(data.documentsEnabled ? ["Documents"] : []),
          ]}
        >
          {data.items.map((item) => (
            <tr key={item.id}>
              <td>
                <ConsoleLink href={`/console/products/${item.id}`}>{item.sku}</ConsoleLink>
              </td>
              <td>{item.blocker_count}</td>
              <td>{item.unresolved_technical_count}</td>
              <td>{item.technical_conflict_count}</td>
              <td>{item.eligible_main_image_count}</td>
              <td>{item.approved_seo_count}</td>
              {data.documentsEnabled && (
                <td className="console-document-readiness-cell">
                  {item.documents && (
                    <DocumentReadinessCell
                      data={item.documents}
                      variantId={item.id!}
                      available={item.documentReviewAvailable}
                    />
                  )}
                </td>
              )}
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState />
      )}
      <Pagination data={data} params={params} path="/console/readiness" />
    </>
  );
}
