import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import {
  getAllApplications,
  getApplicationBySlug,
} from "@/lib/content/applications";
import { getAllProductCategories, getRelatedCategories } from "@/lib/content/categories";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import type { Product, ProductCategory } from "@/lib/content/schemas";

type ApplicationRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const rfqPack = [
  "Application and working environment",
  "Product list, model, size or reference number",
  "Drawing, sample photo or current part details",
  "Quantity, packaging requirement and destination country",
] as const;

const sourcingFlow = [
  "Confirm product family",
  "Check model or reference part",
  "Review packaging and MOQ",
  "Send RFQ for quotation",
] as const;

export function generateStaticParams() {
  return getAllApplications().map((application) => ({
    slug: application.slug,
  }));
}

export async function generateMetadata({ params }: ApplicationRouteProps) {
  const { slug } = await params;
  const application = getApplicationBySlug(slug);

  if (!application) {
    return {};
  }

  return buildMetadata({
    title: application.seoTitle,
    description: application.seoDescription,
    path: `/applications/${application.slug}`,
    keywords: application.keywords,
  });
}

export default async function ApplicationDetailPage({ params }: ApplicationRouteProps) {
  const { slug } = await params;
  const application = getApplicationBySlug(slug);

  if (!application) {
    notFound();
  }

  const categoryMap = new Map(getAllProductCategories().map((category) => [category.slug, category]));
  const relatedCategories = getRelatedCategories(application.relatedCategorySlugs);
  const relatedProducts = getAllProducts()
    .filter((product) => application.relatedProductSlugs.includes(product.slug))
    .map((product) => {
      const category = categoryMap.get(product.categorySlug);

      if (!category) {
        return null;
      }

      return { product, category };
    })
    .filter((item): item is { product: Product; category: ProductCategory } => Boolean(item));

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Applications", path: "/applications" },
            { name: application.title, path: `/applications/${application.slug}` },
          ]),
          faqJsonLd(application.faq),
        ]}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Applications", href: "/applications" },
              { label: application.title },
            ]}
          />
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Application
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {application.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {application.description}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
              {application.overview}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#application-rfq"
                className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white"
              >
                Prepare RFQ
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10"
              >
                View Products
              </Link>
            </div>
          </div>
          <aside className="border border-white/10 bg-white/5 p-5 shadow-industrial">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              Related sourcing paths
            </p>
            <div className="mt-5 grid gap-3">
              {relatedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products/${category.slug}`}
                  className="border border-white/10 bg-white/5 p-4 transition hover:border-arc-signal hover:bg-white/10"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-arc-signal">
                    {category.code}
                  </span>
                  <span className="mt-2 block font-display text-xl font-black text-white">
                    {category.title}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Needs
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Common sourcing requirements
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Use these needs to prepare a product list before requesting quotation. Exact fit
              details should be confirmed by sample, drawing or model number.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {application.buyerNeeds.map((need) => (
              <div key={need} className="border-l-4 border-arc-signal bg-white p-5 shadow-sm">
                <p className="font-semibold leading-7 text-slate-800">{need}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="application-rfq" className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <article className="border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              RFQ Information Pack
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Buyers can send partial information first, but final quotation depends on confirmed
              product details.
            </p>
            <div className="mt-5 grid gap-3">
              {rfqPack.map((item) => (
                <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-4">
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Sourcing Flow
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {sourcingFlow.map((step, index) => (
                <div key={step} className="border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                    Step {index + 1}
                  </div>
                  <div className="mt-2 font-semibold text-arc-midnight">{step}</div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="bg-arc-midnight py-14 text-white sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Related Industries
            </p>
            <h2 className="mt-3 font-display text-3xl font-black">
              Where this application content fits
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {application.industries.map((industry) => (
              <div key={industry} className="border-l-4 border-arc-signal bg-white/5 p-5">
                <p className="font-semibold leading-7 text-slate-100">{industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="bg-arc-frost py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Related Products
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Products buyers may compare
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.product.slug} product={item.product} category={item.category} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <FaqSection items={application.faq} title="Application FAQ" />
          <RfqCta title={`Need sourcing support for ${application.title}?`} />
        </div>
      </section>
    </>
  );
}
