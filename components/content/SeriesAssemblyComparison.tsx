import Link from "next/link";
import type { ProductSeriesAssemblyReference } from "@/lib/content/schemas";

type SeriesAssemblyComparisonProps = {
  seriesName: string;
  references: ProductSeriesAssemblyReference[];
};

function buildArrangementRfqHref(seriesName: string, reference: ProductSeriesAssemblyReference) {
  const product = [
    seriesName,
    `Documented arrangement: ${reference.name}`,
    "Relationship status: catalog reference only; final fit requires evidence",
    "Required component / catalog position:",
    "Quantity:",
    "Torch label / model:",
    "Available photo, drawing or sample evidence:",
  ].join("\n");

  return `/rfq?${new URLSearchParams({ product }).toString()}`;
}

export function SeriesAssemblyComparison({
  seriesName,
  references,
}: SeriesAssemblyComparisonProps) {
  return (
    <div className="mt-10 grid border-y border-arc-line lg:grid-cols-2">
      {references.map((reference, index) => (
        <article
          key={reference.id}
          className="border-t border-arc-line py-7 first:border-t-0 lg:border-l lg:border-t-0 lg:px-8 lg:py-9 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
        >
          <div className="flex items-start justify-between gap-5">
            <span className="font-display text-2xl font-black text-arc-blue" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="text-right text-xs font-semibold leading-5 text-slate-500">
              {reference.sourceLabel}
            </p>
          </div>

          <h3 className="mt-5 font-display text-2xl font-black leading-tight text-arc-midnight">
            {reference.name}
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">{reference.description}</p>

          <p className="mt-7 text-xs font-bold uppercase text-slate-500">Documented groups</p>
          <ul className="mt-3 divide-y divide-arc-line border-y border-arc-line">
            {reference.componentGroups.map((component) => (
              <li
                key={component}
                className="grid grid-cols-[0.75rem_1fr] gap-3 py-3 text-sm font-semibold leading-6 text-arc-midnight"
              >
                <span className="mt-[0.65rem] h-1.5 w-1.5 bg-arc-blue" aria-hidden="true" />
                {component}
              </li>
            ))}
          </ul>

          <p className="mt-6 border-l-2 border-arc-signal pl-4 text-sm leading-7 text-slate-600">
            {reference.buyerCheck}
          </p>

          <Link
            href={buildArrangementRfqHref(seriesName, reference)}
            className="mt-6 inline-flex min-h-11 items-center font-bold text-arc-blue transition hover:text-arc-copper"
          >
            Prepare RFQ for this arrangement
            <span className="ml-2" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </article>
      ))}
    </div>
  );
}
