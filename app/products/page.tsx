import type { Metadata } from "next";
import Link from "next/link";
import { productCategories } from "@/lib/product-categories";

export const metadata: Metadata = {
  title: "Product Center",
  description:
    "Explore ARCFORT MIG torch parts, TIG torch parts, plasma cutting parts, welding consumables, welding machines, and welding accessories for global B2B buyers.",
};

export default function ProductsPage() {
  return (
    <>
      <section className="bg-arc-midnight py-14 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm font-semibold text-slate-300">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li className="text-arc-signal">/</li>
              <li aria-current="page" className="text-white">
                Products
              </li>
            </ol>
          </nav>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
                Product Center
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight sm:text-5xl">
                Welding and cutting product categories for industrial sourcing.
              </h1>
            </div>
            <p className="text-lg leading-8 text-slate-300">
              ARCFORT supplies mock product category data for the first version of this B2B product
              center, prepared for distributors, importers, OEM buyers, industrial users, and repair
              workshops.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="product-categories">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Categories
            </p>
            <h2
              id="product-categories"
              className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
            >
              Product families for repeat B2B inquiry and procurement.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {productCategories.map((category) => (
              <article
                id={category.slug}
                key={category.name}
                className="group flex h-full flex-col border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <div className="flex aspect-[16/9] items-center justify-center bg-[linear-gradient(135deg,#eef3f8_0%,#c8d7e6_48%,#6c839a_100%)] p-5">
                  <div className="flex h-full w-full items-center justify-center border border-white/70 bg-white/35">
                    <span className="font-display text-4xl font-black text-arc-navy">
                      {category.code}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl font-black text-arc-midnight">
                      {category.name}
                    </h3>
                    <span className="bg-arc-frost px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                      {category.code}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{category.description}</p>
                  <div className="mt-6 flex-1 border-t border-slate-200 pt-5">
                    <ul className="space-y-3">
                      {category.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm text-slate-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-arc-signal" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={`/products#${category.slug}`}
                    className="mt-6 inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
                  >
                    View Products
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-arc-midnight px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-black">Need a matched product list?</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Send target part numbers, drawings, samples, quantity plans, and destination
                  market details. ARCFORT will respond with quotation and delivery options.
                </p>
              </div>
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center bg-arc-signal px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
