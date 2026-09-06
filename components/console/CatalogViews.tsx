import { ConsoleLink } from "@/components/console/ConsoleLink";

import type { ReactNode } from "react";
import type { readTechnicalData, SearchParams } from "@/lib/console/catalog";

export function Status({ value }: { value: string | null | undefined }) {
  return (
    <span
      className={
        value === "DATA_CONFLICT" || value === "blocked"
          ? "console-status console-conflict"
          : "console-status"
      }
    >
      {value?.replaceAll("_", " ") ?? "Not recorded"}
    </span>
  );
}

export function DataTable({
  columns,
  children,
  label,
}: {
  columns: string[];
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="console-table-wrap" role="region" aria-label={label} tabIndex={0}>
      <table>
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Pagination({
  data,
  params,
  path,
}: {
  data: { total: number; page: number; pageSize: number };
  params: SearchParams;
  path: string;
}) {
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const href = (page: number) => {
    const query = new URLSearchParams();
    for (const key of [
      "q",
      "category",
      "lifecycle",
      "verification",
      "searchBy",
      "blocker",
      "variant",
      "component",
    ]) {
      if (typeof params[key] === "string") query.set(key, params[key]);
    }
    query.set("page", String(page));
    return `${path}?${query}`;
  };
  return (
    <nav className="console-pagination" aria-label="Pagination">
      <span className="console-caption console-number">
        {data.total} records / Page {data.page} of {totalPages}
      </span>
      {data.page > 1 && (
        <ConsoleLink href={href(Math.min(totalPages, data.page - 1))}>Previous Page</ConsoleLink>
      )}
      {data.page < totalPages && <ConsoleLink href={href(data.page + 1)}>Next Page</ConsoleLink>}
    </nav>
  );
}

export function EmptyState() {
  return <p className="console-empty">No records match this view.</p>;
}

export function TechnicalTable({ data }: { data: Awaited<ReturnType<typeof readTechnicalData>> }) {
  if (!data.items.length) return <EmptyState />;
  return (
    <DataTable
      label="Technical evidence"
      columns={["Subject / Field", "Recorded Value", "Verification", "Source Evidence"]}
    >
      {data.items.map((item) => (
        <tr key={item.id}>
          <td>
            {item.product_variants ? (
              <ConsoleLink href={`/console/products/${item.product_variants.id}`}>
                {item.product_variants.sku}
              </ConsoleLink>
            ) : item.series_components ? (
              <ConsoleLink href={`/console/series/${item.series_components.series_id}`}>
                {item.series_components.component_name}
              </ConsoleLink>
            ) : (
              "Unassigned"
            )}
            <small>{item.series_components?.variant_label}</small>
            <p>{item.technical_field_definitions?.label}</p>
            {item.technical_field_definitions?.is_critical && <small>Critical field</small>}
          </td>
          <td>
            {item.value_text} {item.unit}
            <small>{item.public_note}</small>
          </td>
          <td>
            <Status value={item.verification_status} />
            <small>Source level {item.source_level}</small>
            <small>
              {item.confirmed_at
                ? `Confirmed: ${item.confirmed_at.slice(0, 10)}`
                : item.legacy_reviewed_date
                  ? `Legacy review: ${item.legacy_reviewed_date}`
                  : "No confirmation recorded"}
            </small>
            {item.confirmation_requirements.length > 0 && (
              <small>{item.confirmation_requirements.join("; ")}</small>
            )}
          </td>
          <td>
            {item.technical_value_evidence.length
              ? item.technical_value_evidence.map((link, index) => (
                  <p key={index}>
                    {link.evidence_sources?.title}
                    <small>{link.evidence_sources?.source_reference}</small>
                  </p>
                ))
              : "No source linked"}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
