import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import {
  consoleMediaReviewEnabled,
  consoleCompatibilityEnabled,
} from "@/lib/console/working-config";
import { readMediaMappings, readMediaMappingHistory } from "@/lib/console/media-mapping";
import type { SearchParams } from "@/lib/console/catalog";
import { originalUuid } from "@/lib/domain/catalog/originals";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";
import { MediaMappingWorkbench } from "@/components/console/MediaMappingWorkbench";

export const metadata = { title: "Product Image Mappings" };
export default async function ProductMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  if (!consoleMediaReviewEnabled()) notFound();
  const { id } = await params;
  const query = await searchParams;
  const data = await readMediaMappings(client, id);
  if (!data) notFound();
  if (
    (query.head !== undefined &&
      (typeof query.head !== "string" ||
        (query.head !== "new" && !originalUuid.test(query.head)))) ||
    (query.historyPage !== undefined &&
      (typeof query.historyPage !== "string" || !/^[1-9][0-9]{0,3}$/.test(query.historyPage)))
  )
    notFound();
  const selectedId = query.head === "new" ? "" : query.head || data.scopes[0]?.id || "";
  if (selectedId && !data.scopes.some((scope) => scope.id === selectedId)) notFound();
  const history = selectedId
    ? await readMediaMappingHistory(client, id, selectedId, Number(query.historyPage ?? 1))
    : null;
  return (
    <>
      <h1>Image mappings</h1>
      <ProductWorkingNav
        id={id}
        active="media"
        media
        originals
        compatibility={consoleCompatibilityEnabled()}
      />
      <MediaMappingWorkbench data={data} selectedId={selectedId} history={history} />
    </>
  );
}
