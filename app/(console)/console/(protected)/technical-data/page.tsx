import { ConsoleLink } from "@/components/console/ConsoleLink";

import { requireConsoleAccess } from "@/lib/console/server";
import {
  filters,
  readTechnicalData,
  verificationStates,
  type SearchParams,
  ConsoleInputError,
} from "@/lib/console/catalog";
import { Pagination, TechnicalTable } from "@/components/console/CatalogViews";

export const metadata = { title: "Technical Evidence" };
export default async function TechnicalDataPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  const params = await searchParams;
  const filter = filters(params);
  if (Array.isArray(params.variant) || Array.isArray(params.component))
    throw new ConsoleInputError();
  const data = await readTechnicalData(client, filter, {
    variantId: params.variant,
    componentId: params.component,
  });
  return (
    <>
      <h1>Technical Evidence</h1>
      <form method="get" className="console-toolbar">
        {params.variant && <input type="hidden" name="variant" value={params.variant} />}
        {params.component && <input type="hidden" name="component" value={params.component} />}
        <label className="console-search">
          Recorded value
          <input type="search" name="q" defaultValue={filter.q} maxLength={80} />
        </label>
        <label>
          Verification
          <select name="verification" defaultValue={filter.verification}>
            <option value="">All Statuses</option>
            {verificationStates.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </label>
        <button className="console-button">Apply Filters</button>
        <ConsoleLink href="/console/technical-data">Clear</ConsoleLink>
      </form>
      <TechnicalTable data={data} />
      <Pagination data={data} params={params} path="/console/technical-data" />
    </>
  );
}
