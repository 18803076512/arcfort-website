import { ConsoleLink } from "@/components/console/ConsoleLink";

import { requireConsoleAccess } from "@/lib/console/server";
import { filters, readSeries, type SearchParams } from "@/lib/console/catalog";
import { DataTable, EmptyState, Pagination, Status } from "@/components/console/CatalogViews";

export const metadata = { title: "Product Series" };
export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  const params = await searchParams;
  const filter = filters(params);
  const data = await readSeries(client, filter);
  return (
    <>
      <h1>Product Series</h1>
      <form method="get" className="console-toolbar">
        <label className="console-search">
          Series name
          <input name="q" defaultValue={filter.q} maxLength={80} type="search" />
        </label>
        <button className="console-button">Search</button>
      </form>
      {data.items.length ? (
        <DataTable
          label="Product series"
          columns={["Series", "Process", "Component Candidates", "Verification", "Publication"]}
        >
          {data.items.map((item) => (
            <tr key={item.id}>
              <td>
                <ConsoleLink href={`/console/series/${item.id}`}>{item.name}</ConsoleLink>
              </td>
              <td>{item.process}</td>
              <td>{item.series_components[0]?.count ?? 0}</td>
              <td>
                <Status value={item.verification_status} />
                <small>Source level {item.source_level}</small>
              </td>
              <td>
                <Status value={item.publication_status} />
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState />
      )}
      <Pagination data={data} params={params} path="/console/series" />
    </>
  );
}
