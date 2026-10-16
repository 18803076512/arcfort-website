import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import {
  consoleOriginalsEnabled,
  consoleCompatibilityEnabled,
  consoleMediaReviewEnabled,
} from "@/lib/console/working-config";
import { readOriginalIntakes } from "@/lib/console/originals";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";
import { OriginalIntake } from "@/components/console/OriginalIntake";
import { Pagination } from "@/components/console/CatalogViews";
import { filters, type SearchParams } from "@/lib/console/catalog";

export const metadata = { title: "Product Originals" };
export default async function ProductOriginalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  if (!consoleOriginalsEnabled()) notFound();
  const { id } = await params;
  const query = await searchParams;
  const data = await readOriginalIntakes(client, id, filters(query).page);
  if (!data) notFound();
  return (
    <>
      <h1>Original images</h1>
      <ProductWorkingNav
        id={id}
        active="originals"
        originals
        media={consoleMediaReviewEnabled()}
        compatibility={consoleCompatibilityEnabled()}
      />
      <OriginalIntake data={data} />
      <Pagination data={data} params={query} path={`/console/products/${id}/originals`} />
    </>
  );
}
