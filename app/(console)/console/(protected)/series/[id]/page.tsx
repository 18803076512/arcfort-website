import { ConsoleLink } from "@/components/console/ConsoleLink";

import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import { filters, readSeriesDetail, type SearchParams } from "@/lib/console/catalog";
import { DataTable, EmptyState, Pagination, Status } from "@/components/console/CatalogViews";

export const metadata = { title: "Series Evidence" };
export default async function SeriesDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  const { id } = await params;
  const query = await searchParams;
  const data = await readSeriesDetail(client, id, filters(query));
  if (!data) notFound();
  return (
    <>
      <ConsoleLink className="console-back" href="/console/series">
        Product Series
      </ConsoleLink>
      <h1>{data.series.name}</h1>
      <dl className="console-facts">
        <div>
          <dt>Verification</dt>
          <dd>
            <Status value={data.series.verification_status} />
          </dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>
            Level {data.series.source_level}
            <p>{data.series.source_reference}</p>
          </dd>
        </div>
        <div>
          <dt>Publication</dt>
          <dd>
            <Status value={data.series.publication_status} />
          </dd>
        </div>
      </dl>
      <h2>Component Candidates</h2>
      <p className="mb-6">
        Catalog candidates are not published SKUs or confirmed compatibility relationships.
      </p>
      {data.components.items.length ? (
        <DataTable
          label="Series component candidates"
          columns={["Component", "Variant / Scope", "Review State", "Mapped SKU"]}
        >
          {data.components.items.map((item) => (
            <tr key={item.id}>
              <td>
                <ConsoleLink href={`/console/technical-data?component=${item.id}`}>
                  {item.component_name}
                </ConsoleLink>
              </td>
              <td>
                {item.variant_label}
                <small>{item.scope}</small>
              </td>
              <td>
                <Status value={item.lifecycle_status} />
              </td>
              <td>
                {item.target_variant_id ? (
                  <ConsoleLink href={`/console/products/${item.target_variant_id}`}>
                    View Mapped SKU
                  </ConsoleLink>
                ) : (
                  "Not mapped"
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState />
      )}
      <Pagination data={data.components} params={query} path={`/console/series/${id}`} />
    </>
  );
}
