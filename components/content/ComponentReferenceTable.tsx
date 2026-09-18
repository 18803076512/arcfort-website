import Link from "next/link";

export type ComponentReferenceRow = {
  name: string;
  assemblyArea: string;
  role: string;
  buyerCheck: string;
  href?: string;
};

type ComponentReferenceTableProps = {
  rows: readonly ComponentReferenceRow[];
};

export function ComponentReferenceTable({ rows }: ComponentReferenceTableProps) {
  return (
    <div className="border-y border-arc-line">
      <div className="hidden grid-cols-[0.7fr_0.7fr_1fr_1.35fr] gap-6 bg-arc-midnight px-5 py-4 text-xs font-bold uppercase text-white lg:grid">
        <span>Part name</span>
        <span>Assembly area</span>
        <span>Function</span>
        <span>Buyer should confirm</span>
      </div>
      <div className="divide-y divide-arc-line">
        {rows.map((row, index) => (
          <article
            key={row.name}
            className="grid gap-5 py-6 sm:px-5 lg:grid-cols-[0.7fr_0.7fr_1fr_1.35fr] lg:items-start lg:gap-6"
          >
            <div>
              <span className="text-xs font-black text-arc-blue">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-display text-xl font-black leading-tight text-arc-midnight">
                {row.href ? (
                  <Link href={row.href} className="transition hover:text-arc-blue">
                    {row.name}
                  </Link>
                ) : (
                  row.name
                )}
              </h3>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-500 lg:hidden">
                Assembly area
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 lg:mt-0">
                {row.assemblyArea}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-500 lg:hidden">Function</p>
              <p className="mt-1 text-sm leading-6 text-slate-600 lg:mt-0">{row.role}</p>
            </div>
            <div className="border-l-4 border-arc-signal pl-4">
              <p className="text-[11px] font-bold uppercase text-arc-blue">Buyer should confirm</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{row.buyerCheck}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
