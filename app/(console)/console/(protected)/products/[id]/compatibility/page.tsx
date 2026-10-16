import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import {
  consoleCompatibilityEnabled,
  consoleOriginalsEnabled,
  consoleMediaReviewEnabled,
} from "@/lib/console/working-config";
import {
  compatibilityFilters,
  readCompatibilityWorkbench,
  readCompatibilityTargets,
  readCompatibilityHistory,
} from "@/lib/console/compatibility";
import type { SearchParams } from "@/lib/console/catalog";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";
import { CompatibilityWorkbench } from "@/components/console/CompatibilityWorkbench";

export const metadata = { title: "Product Compatibility" };
export default async function ProductCompatibilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  if (!consoleCompatibilityEnabled()) notFound();
  const { id } = await params;
  const filter = compatibilityFilters(await searchParams);
  const data = await readCompatibilityWorkbench(client, id);
  if (!data) notFound();
  if (
    filter.root &&
    filter.root !== "new" &&
    !data.scopes.some((scope) => scope.id === filter.root)
  )
    notFound();
  const selectedId = filter.root === "new" ? "" : filter.root || data.scopes[0]?.id || "";
  const targets = await readCompatibilityTargets(client, filter);
  const history = selectedId
    ? await readCompatibilityHistory(client, id, selectedId, filter.historyPage)
    : null;
  return (
    <>
      <h1>Compatibility</h1>
      <ProductWorkingNav
        id={id}
        active="compatibility"
        compatibility
        media={consoleMediaReviewEnabled()}
        originals={consoleOriginalsEnabled()}
      />
      <CompatibilityWorkbench
        data={data}
        targets={targets}
        selectedId={selectedId}
        history={history}
        filter={filter}
      />
    </>
  );
}
