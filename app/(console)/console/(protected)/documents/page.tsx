import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import { consoleDocumentsEnabled } from "@/lib/console/working-config";
import { readDocumentLibrary } from "@/lib/console/documents";
import { DocumentLibrary } from "@/components/console/DocumentLibrary";
import { Pagination } from "@/components/console/CatalogViews";
import { filters, type SearchParams } from "@/lib/console/catalog";
export const metadata = { title: "Technical Library" };
export default async function TechnicalLibraryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  if (!consoleDocumentsEnabled()) notFound();
  const query = await searchParams;
  const data = await readDocumentLibrary(client, null, filters(query).page);
  if (!data) notFound();
  return (
    <>
      <h1>Technical Library</h1>
      <DocumentLibrary data={data} />
      <Pagination data={data} params={query} path="/console/documents" />
    </>
  );
}
