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

const rfqEssentials = [
  "Product name, model, drawing or reference part",
  "Size, thread, material, quantity and packaging requirement",
  "Destination country, expected lead time and OEM request",
] as const;

export function CategoryPageTemplate({
  category,
  products,
  relatedCategories,
}: CategoryPageTemplateProps) {
  const categoryStats = [
    { label: "Products", value: `${products.length}` },
    { label: "OEM support", value: "Available" },
    { label: "Trial orders", value: "Accepted" },
  ] as const;

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
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              {category.code} Category
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {category.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {category.description}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
              {category.seoIntro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#category-products"
                className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white"
              >
                View Products
              </Link>
              <Link
                href={`/rfq?product=${encodeURIComponent(category.title)}`}
                className="inline-flex items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10"
              >
                Send Category RFQ
              </Link>
            </div>
          </div>

          <aside className="border border-white/10 bg-white/5 p-5 shadow-industrial">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              Buyer confirmation
            </p>
            <div className="mt-5 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
              {categoryStats.map((item) => (
                <div key={item.label} className="bg-arc-midnight p-4">
                  <div className="font-display text-2xl font-black text-arc-signal">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              {rfqEssentials.map((item) => (
                <div key={item} className="border-l-4 border-arc-signal bg-white/5 p-4">
                  <p className="text-sm font-semibold leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="category-products" className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Range
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                {category.shortTitle} available for RFQ review
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Product listings show current sourcing references. Missing dimensions or
                compatibility fields should be confirmed by sample, drawing or model number.
              </p>
            </div>
            <Link
              href={`/rfq?product=${encodeURIComponent(category.title)}`}
              className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
            >
              Request Quote
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} category={category} />
            ))}
            {products.length === 0
              ? category.productRange.map((item) => (
                  <Link
                    key={item}
                    href={`/rfq?product=${encodeURIComponent(`${category.title} - ${item}`)}`}
                    className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                      RFQ Product Group
                    </div>
                    <h3 className="mt-3 font-display text-xl font-black leading-tight text-arc-midnight">
                      {item}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Send model, quantity, drawing, photo or package requirement for quotation
                      confirmation.
                    </p>
                    <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                      Send RFQ
                    </span>
                  </Link>
                ))
              : null}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Category Buyer Guide
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              How buyers should choose {category.shortTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Industrial purchasing is safer when each small fit detail is checked before
              quotation. Use this section as a sourcing checklist, not as a substitute for confirmed
              drawings or samples.
            </p>
          </div>
          <div className="grid gap-5">
            {category.buyerGuide.map((item, index) => (
              <article key={item} className="grid gap-4 border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[4rem_1fr] sm:items-start">
                <div className="font-display text-4xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              What Buyers Can Source
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Product range
            </h2>
            <div className="mt-5 grid gap-3">
              {category.productRange.map((item) => (
                <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-4">
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Details To Confirm
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Common specifications
            </h2>
            <div className="mt-5 grid gap-3">
              {category.commonSpecifications.map((item) => (
                <div key={item} className="border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Compatibility
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Fit and model confirmation
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{category.compatibilityNote}</p>
          </article>

          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              OEM Service
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Packaging and brand support
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{category.oemServiceNote}</p>
          </article>

          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Packaging & MOQ
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Trial order and export packing
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{category.packagingMoqNote}</p>
            <Link
              href={`/rfq?product=${encodeURIComponent(category.title)}`}
              className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue hover:text-arc-copper"
            >
              Send Category RFQ
            </Link>
          </article>
        </div>
      </section>

      <section className="bg-arc-midnight py-14 text-white sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Applications
            </p>
            <h2 className="mt-3 font-display text-3xl font-black">
              Industrial sourcing scenarios
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              These products support repeat purchasing, maintenance supply and overseas B2B
              distributor programs.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {category.applications.map((application) => (
              <div key={application} className="border-l-4 border-arc-signal bg-white/5 p-5">
                <p className="font-semibold leading-7 text-slate-100">{application}</p>
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
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Buyers often compare related consumables, accessories and machine categories when
              preparing mixed RFQ lists.
            </p>
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
