import { displayConfirmedValue } from "@/lib/content/display";

export type TechnicalTableRow = {
  label: string;
  value: string;
  note?: string;
};

type TechnicalTableProps = {
  rows: TechnicalTableRow[];
  title: string;
  emptyMessage: string;
};

export function TechnicalTable({ rows, title, emptyMessage }: TechnicalTableProps) {
  return (
    <section className="border-t-2 border-arc-midnight bg-white px-5 py-6 sm:px-7 sm:py-8">
      <h2 className="font-display text-2xl font-black text-arc-midnight">{title}</h2>
      {rows.length > 0 ? (
        <dl className="mt-5 border-t border-arc-line">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-2 border-b border-arc-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
            >
              <dt className="technical-data font-bold text-arc-midnight">{row.label}</dt>
              <dd className="technical-data min-w-0 break-words text-slate-700">
                <span>{displayConfirmedValue(row.value)}</span>
                {row.note ? <span className="mt-1 block text-slate-500">{row.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">{emptyMessage}</p>
      )}
    </section>
  );
}
