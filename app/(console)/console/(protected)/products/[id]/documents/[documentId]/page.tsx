import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import { consoleDocumentReviewEnabled } from "@/lib/console/working-config";
import { readDocumentReview } from "@/lib/console/document-review";
import { DocumentReviewWorkbench } from "@/components/console/DocumentReviewWorkbench";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";
import type { SearchParams } from "@/lib/console/catalog";
export const metadata = { title: "Document Review" };
export default async function DocumentReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; documentId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  if (!consoleDocumentReviewEnabled()) notFound();
  const { id, documentId } = await params;
  const query = await searchParams;
  const page = (value: string | string[] | undefined) =>
    typeof value === "string" && /^[1-9][0-9]{0,4}$/.test(value) ? Number(value) : 1;
  const data = await readDocumentReview(
    client,
    id,
    documentId,
    page(query.source_page),
    page(query.history_page),
  );
  if (!data) notFound();
  return (
    <>
      <h1>Document review</h1>
      <ProductWorkingNav id={id} active="documents" documents />
      <DocumentReviewWorkbench
        key={`${documentId}:${data.revision}:${data.evidenceDigest}:${data.latest?.decision}:${data.current?.human_valid}:${data.originalCurrent}`}
        data={data}
      />
    </>
  );
}
