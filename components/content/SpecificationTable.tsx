import type { SpecRow } from "@/lib/content/schemas";
import { displayConfirmedValue } from "@/lib/content/display";

type SpecificationTableProps = {
  rows: SpecRow[];
  title?: string;
};

export function SpecificationTable({ rows, title = "Specification Table" }: SpecificationTableProps) {
  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-2xl font-black text-arc-midnight">{title}</h2>
      <div className="mt-5 grid gap-3">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-2 border border-slate-100 bg-white p-4 sm:grid-cols-[12rem_1fr]">
            <div className="text-sm font-bold text-arc-midnight">{row.label}</div>
            <div className="min-w-0 break-words text-sm leading-6 text-slate-700">
              {displayConfirmedValue(row.value)}
              {row.note ? (
                <span className="block text-slate-400 sm:ml-2 sm:inline">{row.note}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
