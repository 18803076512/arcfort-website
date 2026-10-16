"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProductFinderCategory = {
  slug: string;
  title: string;
  count: number;
};

type ProductFinderFormProps = {
  categories: ProductFinderCategory[];
  categorySlug: string;
  hasParameters: boolean;
  productCount: number;
  query: string;
};

export function ProductFinderForm({
  categories,
  categorySlug,
  hasParameters,
  productCount,
  query,
}: ProductFinderFormProps) {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const nextQuery = String(data.get("q") ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 100);
    const nextCategory = String(data.get("category") ?? "");
    const params = new URLSearchParams();

    if (nextQuery) params.set("q", nextQuery);
    if (nextCategory) params.set("category", nextCategory);

    const queryString = params.toString();
    router.push(`${queryString ? `/products?${queryString}` : "/products"}#product-catalog`);
  }

  return (
    <form
      action="/products#product-catalog"
      method="get"
      onSubmit={handleSubmit}
      className="grid gap-4 border border-arc-line bg-arc-frost p-5 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(13rem,0.75fr)]"
    >
      <div>
        <label
          htmlFor="product-finder-search"
          className="block text-xs font-bold uppercase text-slate-600"
        >
          Product name, component or SKU
        </label>
        <input
          id="product-finder-search"
          name="q"
          type="search"
          defaultValue={query}
          maxLength={100}
          placeholder="Plasma nozzle, TIG gun parts or AF-MIG-CT-0005"
          className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm text-arc-midnight placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
        />
      </div>
      <div>
        <label
          htmlFor="product-finder-category"
          className="block text-xs font-bold uppercase text-slate-600"
        >
          Product category
        </label>
        <select
          id="product-finder-category"
          name="category"
          defaultValue={categorySlug}
          className="mt-2 block min-h-12 w-full border-slate-300 bg-white text-sm font-semibold text-arc-midnight focus:border-arc-blue focus:ring-arc-blue"
        >
          <option value="">All categories ({productCount})</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title} ({category.count})
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row lg:col-span-2">
        <button
          type="submit"
          className="button-base bg-arc-blue text-white hover:bg-arc-midnight sm:w-auto"
        >
          Search Products
        </button>
        {hasParameters ? (
          <Link
            href="/products#product-finder"
            className="button-base button-secondary w-full sm:w-auto"
          >
            Clear Filters
          </Link>
        ) : (
          <Link
            href="#product-categories"
            className="button-base w-full border-slate-300 text-slate-700 hover:border-arc-blue hover:text-arc-blue sm:w-auto"
          >
            Browse Categories
          </Link>
        )}
      </div>
    </form>
  );
}
