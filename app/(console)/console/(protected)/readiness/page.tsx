import { ReadinessWorkspace } from "@/components/console/ReadinessWorkspace";
import { requireConsoleAccess } from "@/lib/console/server";
import { filters, readReadiness, type SearchParams } from "@/lib/console/catalog";

export const metadata = { title: "Readiness Blockers" };
export default async function ReadinessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  const params = await searchParams;
  const filter = filters(params);
  const data = await readReadiness(client, filter);
  return <ReadinessWorkspace data={data} filter={filter} params={params} />;
}
