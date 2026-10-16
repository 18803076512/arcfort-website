import Link from "next/link";
import { getProductOverviewSpecificationRows } from "@/lib/content/product-presentation";
import type { ProductCategory } from "@/lib/content/schemas";
import type { ResolvedProductSeriesReference } from "@/lib/content/product-series";

type SeriesReferenceTableProps = {
  category: ProductCategory;
  references: ResolvedProductSeriesReference[];
};

const relationshipLabels = {
  confirmed: "Confirmed relationship",
  reference_only: "Catalog reference",
  unverified: "Needs confirmation",
} as const;

export function SeriesReferenceTable({ category, references }: SeriesReferenceTableProps) {
  return (
    <div className="overflow-hidden border border-arc-line bg-white">
      <div className="hidden grid-cols-[0.8fr_0.9fr_1.35fr_0.65fr] bg-arc-midnight text-xs font-bold text-white md:grid">
        <div className="p-4">Product</div>
        <div className="border-l border-white/10 p-4">Role</div>
        <div className="border-l border-white/10 p-4">Documented selection cues</div>
        <div className="border-l border-white/10 p-4">Relationship</div>
      </div>

      <div className="divide-y divide-arc-line">
        {references.map((reference) => {
          const href = `/products/${category.slug}/${reference.product.slug}`;
          const specificationRows = getProductOverviewSpecificationRows(reference.product).slice(
            0,
            3,
          );

          return (
            <article
              key={reference.product.slug}
              className="grid gap-5 p-5 md:grid-cols-[0.8fr_0.9fr_1.35fr_0.65fr] md:gap-0 md:p-0"
            >
              <div className="md:p-4">
                <p className="text-xs font-semibold text-slate-500 md:hidden">Product</p>
                <Link
                  href={href}
                  className="mt-1 block font-display text-lg font-black leading-tight text-arc-midnight transition hover:text-arc-blue md:mt-0"
                >
                  {reference.product.title}
                </Link>
                <p className="mt-2 text-xs font-semibold text-slate-500">{reference.product.sku}</p>
              </div>

              <div className="md:border-l md:border-arc-line md:p-4">
                <p className="text-xs font-semibold text-slate-500 md:hidden">Role</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 md:mt-0">
                  {reference.role}
                </p>
              </div>

              <div className="md:border-l md:border-arc-line md:p-4">
                <p className="text-xs font-semibold text-slate-500 md:hidden">
                  Documented selection cues
                </p>
                {specificationRows.length > 0 ? (
                  <dl className="mt-2 grid gap-2 md:mt-0">
                    {specificationRows.map((row) => (
                      <div key={row.label} className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-3">
                        <dt className="text-xs font-semibold text-slate-500">{row.label}</dt>
                        <dd className="text-xs font-semibold leading-5 text-slate-700">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-1 text-sm leading-6 text-slate-600 md:mt-0">
                    Review against the requested model, drawing or approved sample.
                  </p>
                )}
              </div>

              <div className="md:border-l md:border-arc-line md:p-4">
                <p className="text-xs font-semibold text-slate-500 md:hidden">Relationship</p>
                <p className="mt-1 text-sm font-bold leading-6 text-arc-blue md:mt-0">
                  {relationshipLabels[reference.relationshipStatus]}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Confirm final fit before ordering.
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
