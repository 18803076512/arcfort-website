import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import { readWorkingStatus } from "@/lib/console/working";
import { ProductDraftForm } from "@/components/console/ProductDraftForm";
import { ConsoleLink } from "@/components/console/ConsoleLink";

export const metadata = { title: "New Product Draft" };
export default async function NewProductPage() {
  const { client } = await requireConsoleAccess();
  if (!(await readWorkingStatus(client)).can_edit) notFound();
  return (
    <>
      <ConsoleLink href="/console/products" className="console-back">
        Products
      </ConsoleLink>
      <h1>New product draft</h1>
      <ProductDraftForm draft={null} />
    </>
  );
}
