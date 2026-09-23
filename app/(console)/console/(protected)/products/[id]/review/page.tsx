import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import { readTechnicalWorkbench } from "@/lib/console/working";
import { consoleWorkingEnabled } from "@/lib/console/working-config";
import { TechnicalWorkbench } from "@/components/console/TechnicalWorkbench";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";
import type { SearchParams } from "@/lib/console/catalog";

export const metadata = { title: "Technical Review" };
export default async function ReviewProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  if (!consoleWorkingEnabled()) notFound();
  const { id } = await params;
  const query = await searchParams;
  const data = await readTechnicalWorkbench(client, id);
  if (!data) notFound();
  return (
    <>
      <h1>Technical review</h1>
      <ProductWorkingNav id={id} active="review" />
      <TechnicalWorkbench
        data={data}
        selectedId={typeof query.scope === "string" ? query.scope : undefined}
      />
    </>
  );
}
