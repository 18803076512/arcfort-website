import type { Metadata } from "next";
import Link from "next/link";
import { productCategories } from "@/lib/product-categories";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore ARCFORT product categories including MIG torch parts, TIG torch parts, plasma cutting parts, welding consumables, machines, and accessories.",
};

export default function ProductsPage() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
            Product Center
          </p>
          <h1 className="mt-3 font-display text-4xl font-black text-arc-midnight sm:text-5xl">
            Welding and cutting products for industrial supply channels.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            ARCFORT focuses on practical product lines that help distributors, importers, OEM
            buyers, industrial users, and repair workshops build consistent purchasing programs.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {productCategories.map((category) => (
            <article key={category.name} className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-2xl font-black text-arc-midnight">
                  {category.name}
                </h2>
                <span className="bg-arc-frost px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                  {category.code}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{category.description}</p>
              <ul className="mt-5 space-y-3">
                {category.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-arc-signal" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 bg-arc-midnight px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-black">Need a matched product list?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Send your target models, references, annual volume, and destination market. The
                ARCFORT team will organize a clean RFQ response.
              </p>
            </div>
            <Link
              href="/rfq"
              className="inline-flex items-center justify-center bg-arc-signal px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white"
            >
              Request Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
