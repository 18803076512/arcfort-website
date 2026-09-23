import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import { readProductHistory, readTechnicalHistory, readWorkingStates } from "@/lib/console/working";
import { consoleWorkingEnabled } from "@/lib/console/working-config";
import { filters, type SearchParams } from "@/lib/console/catalog";
import { ProductWorkingNav } from "@/components/console/ProductWorkingNav";
import { ConsoleLink } from "@/components/console/ConsoleLink";
import { Pagination, EmptyState, Status } from "@/components/console/CatalogViews";

export const metadata = { title: "Product Change History" };
export default async function ProductHistoryPage({
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
  const filter = filters(query);
  if (!(await readWorkingStates(client, [id])).length) notFound();
  const technical = query.kind === "technical";
  const data = technical
    ? await readTechnicalHistory(client, id, filter.page)
    : await readProductHistory(client, id, filter.page);
  return (
    <>
      <h1>Product change history</h1>
      <ProductWorkingNav id={id} active="history" />
      <nav className="console-working-nav" aria-label="History type">
        <ConsoleLink
          href={`/console/products/${id}/history`}
          aria-current={!technical ? "page" : undefined}
        >
          Product copy
        </ConsoleLink>
        <ConsoleLink
          href={`/console/products/${id}/history?kind=technical`}
          aria-current={technical ? "page" : undefined}
        >
          Technical revisions
        </ConsoleLink>
      </nav>
      {!data.items.length && <EmptyState />}
      <div className="console-history">
        {data.items.map((item) =>
          "sequence" in item ? (
            <article key={item.value_id}>
              <h2>
                {item.technical_values?.technical_field_definitions?.label} /{" "}
                {item.technical_revision_heads.scope_label || "Default scope"}
              </h2>
              <p>
                <strong>
                  {item.technical_values?.value_text} {item.technical_values?.unit}
                </strong>{" "}
                / <Status value={item.review_state} />
              </p>
              <p className="console-caption">
                Revision {item.sequence} / {item.created_at.slice(0, 10)} / {item.created_by}
              </p>
              <p>{item.reason}</p>
              {item.technical_values?.technical_value_evidence.map(
                (link) =>
                  link.evidence_sources && (
                    <div className="console-source-note" key={link.evidence_sources.id}>
                      <p>
                        {link.evidence_sources.title} / Level {link.evidence_sources.source_level} /{" "}
                        {link.evidence_role}
                      </p>
                      <p className="console-caption">{link.evidence_sources.source_reference}</p>
                      {link.evidence_sources.technical_source_bindings && (
                        <p className="console-caption">
                          Revision {link.evidence_sources.technical_source_bindings.revision_label}{" "}
                          / {link.evidence_sources.technical_source_bindings.source_location} /
                          Source value:{" "}
                          {link.evidence_sources.technical_source_bindings.asserted_value}{" "}
                          {link.evidence_sources.technical_source_bindings.asserted_unit}
                        </p>
                      )}
                    </div>
                  ),
              )}
              {item.verification_events && (
                <p>
                  {item.verification_events.decision}: {item.verification_events.reason}
                  <span className="console-caption"> / {item.verification_events.actor_id}</span>
                </p>
              )}
            </article>
          ) : (
            <article key={item.revision}>
              <h2>
                Revision {item.revision} / {item.name_en}
              </h2>
              <p className="console-caption">
                {item.created_at.slice(0, 10)} / {item.actor_id}
              </p>
              <dl className="console-history-copy">
                {[
                  ["Chinese name", item.name_zh],
                  ["Model", item.model],
                  ["Summary", item.summary],
                  ["Description", item.description],
                  ["Applications", item.applications],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || "Not recorded"}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ),
        )}
      </div>
      <Pagination data={data} params={query} path={`/console/products/${id}/history`} />
    </>
  );
}
