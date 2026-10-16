import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import {
  consoleOemEnabled,
  consoleCompatibilityEnabled,
  consoleOriginalsEnabled,
  consoleMediaReviewEnabled,
} from "@/lib/console/working-config";
import { readOemWorkbench, readOemHistory } from "@/lib/console/oem";
import type { SearchParams } from "@/lib/console/catalog";
import { originalUuid } from "@/lib/domain/catalog/originals";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";
import { OemWorkbench } from "@/components/console/OemWorkbench";

export const metadata = { title: "OEM Reference Review" };
export default async function ProductOemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  if (!consoleOemEnabled()) notFound();
  const { id } = await params;
  const query = await searchParams;
  if (
    (query.head !== undefined &&
      (typeof query.head !== "string" ||
        (query.head !== "new" && !originalUuid.test(query.head)))) ||
    (query.historyPage !== undefined &&
      (typeof query.historyPage !== "string" || !/^[1-9][0-9]{0,3}$/.test(query.historyPage)))
  )
    notFound();
  const data = await readOemWorkbench(client, id);
  if (!data) notFound();
  const selectedId = query.head === "new" ? "" : query.head || data.scopes[0]?.id || "";
  const selected = data.scopes.find((scope) => scope.id === selectedId);
  if (selectedId && !selected) notFound();
  const history = selected
    ? await readOemHistory(client, id, selected.id, Number(query.historyPage ?? 1))
    : null;
  return (
    <>
      <h1>OEM references</h1>
      <ProductWorkingNav
        id={id}
        active="oem"
        oem
        compatibility={consoleCompatibilityEnabled()}
        originals={consoleOriginalsEnabled()}
        media={consoleMediaReviewEnabled()}
      />
      <OemWorkbench
        key={`${selectedId}:${selected?.revision ?? 0}:${selected?.latest.state ?? "new"}`}
        data={data}
        selectedId={selectedId}
        history={history}
      />
    </>
  );
}
