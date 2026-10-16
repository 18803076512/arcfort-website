import { MediaWorkspace } from "@/components/console/MediaWorkspace";
import { requireConsoleAccess } from "@/lib/console/server";
import { mediaFilters, readMediaAssets, readMediaCoverage } from "@/lib/console/media";
import type { SearchParams } from "@/lib/console/catalog";

export const metadata = { title: "Product Media" };
export default async function MediaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { client } = await requireConsoleAccess();
  const params = await searchParams;
  const filter = mediaFilters(params);
  const data =
    filter.view === "assets"
      ? await readMediaAssets(client, filter)
      : await readMediaCoverage(client, filter);
  return <MediaWorkspace data={data} filter={filter} params={params} />;
}
