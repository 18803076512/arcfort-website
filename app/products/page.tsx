import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllProductCategories } from "@/lib/content/categories";
import { breadcrumbJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";

export const metadata = buildMetadata({
  title: "Product Center",
  description:
    "Explore ArcFort Weld welding and cutting product categories, sample product detail pages and RFQ-ready sourcing content for industrial B2B buyers.",
  path: "/products",
  keywords: [
    "welding products",
    "MIG/MAG torch parts",
    "TIG torch parts",
    "plasma cutting consumables",
  ],
});

export default function ProductsPage() {
  const categories = getAllProductCategories();
  const products = getAllProducts();
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ])}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Center
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                Welding and cutting products built for B2B inquiry.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                ArcFort Weld organizes welding consumables and cutting parts into scalable category and
                product pages for distributors, importers, OEM buyers and industrial users.
              </p>
            </div>
            <div className="border-l-4 border-arc-signal bg-arc-frost p-6">
              <h2 className="font-display text-2xl font-black text-arc-midnight">
                Content Architecture
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                The product system supports category SEO text, product grids, specification tables,
                compatibility information, FAQ content, related products and RFQ conversion paths.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Categories
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Sample category pages
              </h2>
            </div>
            <Link
              href="/rfq"
              className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
            >
              Send RFQ
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products/${category.slug}`}
                className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center bg-arc-midnight font-display text-lg font-black text-arc-signal">
                    {category.code}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Category
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                  View Products
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
            Sample Products
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
            Product detail templates ready for SKU expansion
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const category = categoryMap.get(product.categorySlug);

              if (!category) {
                return null;
              }

              return <ProductCard key={product.slug} product={product} category={category} />;
            })}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta />
        </div>
      </section>
    </>
  );
}
