import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getProductSeriesPath } from "@/lib/content/product-series";
import type { ProductSeries } from "@/lib/content/schemas";

type ProductSeriesLinkBandProps = {
  series: ProductSeries[];
};

export function ProductSeriesLinkBand({ series }: ProductSeriesLinkBandProps) {
  if (series.length === 0) {
    return null;
  }

  return (
    <section aria-label="Related product series" className="border-y border-arc-line bg-arc-frost">
      <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-eyebrow">Company Catalog Series</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Review the related torch-front group and the evidence required before compatibility is
            approved.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {series.map((item) => (
            <Link
              key={item.slug}
              href={getProductSeriesPath(item)}
              className="inline-flex min-h-11 items-center font-bold text-arc-blue transition hover:text-arc-copper"
            >
              View {item.shortName}{" "}
              <span className="ml-2" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
