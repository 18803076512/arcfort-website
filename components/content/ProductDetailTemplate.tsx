import Link from "next/link";
import type { Product, ProductCategory } from "@/lib/content/schemas";
import { TO_BE_CONFIRMED } from "@/lib/content/schemas";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { CompatibilityTable } from "@/components/content/CompatibilityTable";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductCard } from "@/components/content/ProductCard";
import { ProductVisual } from "@/components/content/ProductVisual";
import { RfqCta } from "@/components/content/RfqCta";
import { SpecificationTable } from "@/components/content/SpecificationTable";

type RelatedProduct = {
  product: Product;
  category: ProductCategory;
};

type ProductDetailTemplateProps = {
  product: Product;
  category: ProductCategory;
  relatedProducts: RelatedProduct[];
};

export function ProductDetailTemplate({
  product,
  category,
  relatedProducts,
}: ProductDetailTemplateProps) {
  const rfqHref = `/rfq?product=${encodeURIComponent(product.title)}`;

  return (
    <>
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: category.title, href: `/products/${category.slug}` },
              { label: product.title },
            ]}
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <ProductVisual label={product.imageLabel} title={product.title} category={category.code} />

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                {category.title}
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                {product.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{product.shortDescription}</p>

              <div className="mt-6 grid gap-3 border border-slate-200 bg-arc-frost p-5 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    SKU
                  </div>
                  <div className="mt-1 font-semibold text-arc-midnight">{product.sku}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Category
                  </div>
                  <div className="mt-1 font-semibold text-arc-midnight">{category.title}</div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={rfqHref}
                  className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
                >
                  Request Quote
                </Link>
                <Link
                  href={rfqHref}
                  className="inline-flex items-center justify-center border border-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
                >
                  Add to RFQ
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center border border-slate-300 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:border-arc-midnight hover:bg-arc-midnight hover:text-white"
                >
                  WhatsApp
                </Link>
              </div>

              {product.missingFields.length > 0 ? (
                <div className="mt-6 border-l-4 border-arc-signal bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    Missing data: {product.missingFields.join(", ")}. These fields are marked as{" "}
                    {TO_BE_CONFIRMED} until confirmed by drawing, sample or model reference.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <SpecificationTable rows={product.specifications} />
          <CompatibilityTable rows={product.compatibility} />
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Product Description
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
            <h3 className="mt-6 font-display text-xl font-black text-arc-midnight">
              Product Features
            </h3>
            <ul className="mt-4 grid gap-3">
              {product.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-arc-signal" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Packaging & Delivery
            </h2>
            <div className="mt-5 grid gap-3">
              <div className="border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Package
                </div>
                <div className="mt-1 text-sm font-semibold text-arc-midnight">
                  {product.packaging}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    MOQ
                  </div>
                  <div className="mt-1 text-sm font-semibold text-arc-midnight">{product.moq}</div>
                </div>
                <div className="border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Lead Time
                  </div>
                  <div className="mt-1 text-sm font-semibold text-arc-midnight">
                    {product.leadTime}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-6 inline-flex cursor-not-allowed items-center justify-center bg-slate-200 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-500"
            >
              PDF Catalog To be confirmed
            </button>
          </article>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Applications
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Common industrial use
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.applications.map((application) => (
              <div key={application} className="border-l-4 border-arc-signal bg-white p-5 shadow-sm">
                <p className="font-semibold text-slate-800">{application}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <FaqSection items={product.faq} title="Product FAQ" />
          <RfqCta title={`Request quotation for ${product.title}`} productName={product.title} />
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="bg-arc-frost py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Related Products
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Products buyers also compare
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.product.slug}
                  product={relatedProduct.product}
                  category={relatedProduct.category}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
