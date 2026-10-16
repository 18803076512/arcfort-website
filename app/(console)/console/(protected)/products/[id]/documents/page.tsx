import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import { consoleDocumentsEnabled } from "@/lib/console/working-config";
import { readDocumentLibrary } from "@/lib/console/documents";
import { DocumentLibrary } from "@/components/console/DocumentLibrary";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";
import { Pagination } from "@/components/console/CatalogViews";
import { filters, type SearchParams } from "@/lib/console/catalog";
export const metadata = { title: "Product Documents" };
export default async function ProductDocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  if (!consoleDocumentsEnabled()) notFound();
  const { id } = await params;
  const query = await searchParams;
  const data = await readDocumentLibrary(client, id, filters(query).page);
  if (!data) notFound();
  return (
    <>
      <h1>Technical documents</h1>
      <ProductWorkingNav id={id} active="documents" documents />
      <DocumentLibrary key={id} data={data} />
      <Pagination data={data} params={query} path={`/console/products/${id}/documents`} />
    </>
  );
}
