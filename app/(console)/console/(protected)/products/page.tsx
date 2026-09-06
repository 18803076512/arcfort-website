import { ConsoleLink } from "@/components/console/ConsoleLink";

import { requireConsoleAccess } from "@/lib/console/server";
import { filters, lifecycleStates, readProducts, type SearchParams } from "@/lib/console/catalog";
import { DataTable, EmptyState, Pagination, Status } from "@/components/console/CatalogViews";

export const metadata = { title: "Products" };
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  const params = await searchParams;
  const filter = filters(params);
  const data = await readProducts(client, filter);
  return (
    <>
      <h1>Products</h1>
      <form className="console-toolbar" method="get">
        <label className="console-search">
          Search
          <input name="q" defaultValue={filter.q} maxLength={80} type="search" />
        </label>
        <label>
          Search by
          <select name="searchBy" defaultValue={filter.searchBy}>
            <option value="sku">SKU</option>
            <option value="name">Product name</option>
          </select>
        </label>
        <label>
          Category
          <select name="category" defaultValue={filter.category}>
            <option value="">All Categories</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_en}
              </option>
            ))}
          </select>
        </label>
        <label>
          Lifecycle
          <select name="lifecycle" defaultValue={filter.lifecycle}>
            <option value="">All States</option>
            {lifecycleStates.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </label>
        <button className="console-button">Apply Filters</button>
        <ConsoleLink href="/console/products">Clear</ConsoleLink>
      </form>
      <p className="mb-6">
        <ConsoleLink href="/console/readiness">Readiness Blockers</ConsoleLink>
      </p>
      {data.items.length ? (
        <DataTable
          label="Product catalog"
          columns={["SKU / Product", "Category", "Lifecycle", "Website Baseline"]}
        >
          {data.items.map((item) => (
            <tr key={item.id}>
              <td>
                <ConsoleLink href={`/console/products/${item.id}`}>{item.sku}</ConsoleLink>
                <small>{item.products.name_en}</small>
              </td>
              <td>{item.product_categories.name_en}</td>
              <td>
                <Status value={item.lifecycle_state} />
                <small>{item.is_shadow ? "Shadow record" : "Governed record"}</small>
              </td>
              <td>
                <Status value={item.legacy_status} />
                <small>{item.legacy_data_status}</small>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState />
      )}
      <Pagination data={data} params={params} path="/console/products" />
    </>
  );
}
