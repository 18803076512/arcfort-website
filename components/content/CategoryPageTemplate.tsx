import Link from "next/link";
import type { Product, ProductCategory } from "@/lib/content/schemas";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";

type CategoryPageTemplateProps = {
  category: ProductCategory;
  products: Product[];
  relatedCategories: ProductCategory[];
};

export function CategoryPageTemplate({
  category,
  products,
  relatedCategories,
}: CategoryPageTemplateProps) {
  return (
    <>
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: category.title },
            ]}
          />
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                {category.code} Category
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                {category.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{category.description}</p>
            </div>
            <div className="border-l-4 border-arc-signal bg-arc-frost p-6">
              <h2 className="font-display text-2xl font-black text-arc-midnight">SEO Overview</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">{category.seoIntro}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Grid
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                RFQ-ready product samples
              </h2>
            </div>
            <Link
              href="/rfq"
              className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
            >
              Request Quote
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Guide
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              How to prepare a clear inquiry
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Industrial buyers usually compare fit, packaging, quantity and delivery before
              quotation. These checks help reduce wrong samples and repeated communication.
            </p>
          </div>
          <div className="grid gap-4">
            {category.buyerGuide.map((item) => (
              <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-5">
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
          <FaqSection items={category.faq} />
          <div className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Related Categories
            </h2>
            <div className="mt-5 grid gap-3">
              {relatedCategories.map((relatedCategory) => (
                <Link
                  key={relatedCategory.slug}
                  href={`/products/${relatedCategory.slug}`}
                  className="border border-slate-100 p-4 transition hover:border-arc-blue hover:bg-arc-frost"
                >
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                    {relatedCategory.code}
                  </div>
                  <div className="mt-2 font-display text-xl font-black text-arc-midnight">
                    {relatedCategory.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {relatedCategory.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta title={`Need ${category.shortTitle}?`} />
        </div>
      </section>
    </>
  );
}
