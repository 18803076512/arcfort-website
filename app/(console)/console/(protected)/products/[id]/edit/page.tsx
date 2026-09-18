import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import { readProductDraft, readWorkingStates } from "@/lib/console/working";
import { consoleWorkingEnabled } from "@/lib/console/working-config";
import { ProductDraftForm } from "@/components/console/ProductDraftForm";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";

export const metadata = { title: "Product Working Copy" };
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { client } = await requireConsoleAccess();
  if (!consoleWorkingEnabled()) notFound();
  const { id } = await params;
  if (!(await readWorkingStates(client, [id])).length) notFound();
  const draft = await readProductDraft(client, id);
  if (!draft) notFound();
  return (
    <>
      <h1>{draft.name_en}</h1>
      <ProductWorkingNav id={id} active="edit" />
      <ProductDraftForm draft={draft} />
    </>
  );
}
