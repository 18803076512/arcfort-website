import type { SpecRow } from "@/lib/content/schemas";

type SpecificationTableProps = {
  rows: SpecRow[];
  title?: string;
};

export function SpecificationTable({ rows, title = "Specification Table" }: SpecificationTableProps) {
  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-2xl font-black text-arc-midnight">{title}</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-slate-100 last:border-0">
                <th className="w-48 bg-slate-50 px-4 py-3 font-bold text-arc-midnight">
                  {row.label}
                </th>
                <td className="px-4 py-3 text-slate-700">
                  {row.value}
                  {row.note ? <span className="ml-2 text-slate-400">{row.note}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
