import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import {
  consolePackagingEnabled,
  consoleCompatibilityEnabled,
  consoleOriginalsEnabled,
  consoleMediaReviewEnabled,
} from "@/lib/console/working-config";
import { readPackagingWorkbench, readPackagingHistory } from "@/lib/console/packaging";
import type { SearchParams } from "@/lib/console/catalog";
import { originalUuid } from "@/lib/domain/catalog/originals";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";
import { PackagingWorkbench } from "@/components/console/PackagingWorkbench";

export const metadata = { title: "Packaging Review" };
export default async function ProductPackagingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  if (!consolePackagingEnabled()) notFound();
  const { id } = await params,
    query = await searchParams;
  if (
    (query.head !== undefined &&
      (typeof query.head !== "string" ||
        (query.head !== "new" && !originalUuid.test(query.head)))) ||
    (query.historyPage !== undefined &&
      (typeof query.historyPage !== "string" || !/^[1-9][0-9]{0,3}$/.test(query.historyPage)))
  )
    notFound();
  const data = await readPackagingWorkbench(client, id);
  if (!data) notFound();
  const selectedId = query.head === "new" ? "" : query.head || data.scopes[0]?.id || "",
    selected = data.scopes.find((scope) => scope.id === selectedId);
  if (selectedId && !selected) notFound();
  const history = selected
    ? await readPackagingHistory(client, id, selected.id, Number(query.historyPage ?? 1))
    : null;
  return (
    <>
      <h1>Packaging</h1>
      <ProductWorkingNav
        id={id}
        active="packaging"
        packaging
        compatibility={consoleCompatibilityEnabled()}
        originals={consoleOriginalsEnabled()}
        media={consoleMediaReviewEnabled()}
      />
      <PackagingWorkbench
        key={`${selectedId}:${selected?.revision ?? 0}:${selected?.latest.state ?? "new"}`}
        data={data}
        selectedId={selectedId}
        history={history}
      />
    </>
  );
}
