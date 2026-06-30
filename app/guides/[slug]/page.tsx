import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllProductCategories, getRelatedCategories } from "@/lib/content/categories";
import { getAllGuides, getGuideBySlug } from "@/lib/content/guides";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import type { Product, ProductCategory } from "@/lib/content/schemas";

type GuideRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const rfqReviewPoints = [
  "Do not guess unknown technical values",
  "Confirm compatibility by model, drawing, sample or reference part",
  "Include quantity, packaging and destination country",
  "Keep OEM, certification and exact rating claims document-based",
] as const;

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuideRouteProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {};
  }

  return buildMetadata({
    title: guide.seoTitle,
    description: guide.seoDescription,
    path: `/guides/${guide.slug}`,
    keywords: guide.keywords,
    type: "article",
  });
}

export default async function GuideDetailPage({ params }: GuideRouteProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const categoryMap = new Map(
    getAllProductCategories().map((category) => [category.slug, category]),
  );
  const relatedCategories = getRelatedCategories(guide.categorySlugs);
  const relatedProducts = getAllProducts()
    .filter((product) => guide.productSlugs.includes(product.slug))
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
            { name: "Guides", path: "/guides" },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
          articleJsonLd(guide),
          faqJsonLd(guide.faq),
        ]}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: guide.title },
            ]}
          />
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Buyer Guide
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {guide.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{guide.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#guide-content"
                className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white"
              >
                Read Guide
              </Link>
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10"
              >
                Send RFQ
              </Link>
            </div>
          </div>
          <aside className="border border-white/10 bg-white/5 p-5 shadow-industrial">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              RFQ review principles
            </p>
            <div className="mt-5 grid gap-3">
              {rfqReviewPoints.map((point) => (
                <div key={point} className="border-l-4 border-arc-signal bg-white/5 p-4">
                  <p className="text-sm font-semibold leading-6 text-slate-200">{point}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="guide-content" className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            {guide.sections.map((section, index) => (
              <article
                key={section.title}
                className="grid gap-5 border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[5rem_1fr] sm:items-start"
              >
                <div className="font-display text-4xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-black text-arc-midnight">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Related Categories
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use these categories to compare product families before sending an RFQ.
            </p>
            <div className="mt-5 grid gap-3">
              {relatedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products/${category.slug}`}
                  className="border border-slate-100 p-4 transition hover:border-arc-blue hover:bg-arc-frost"
                >
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                    {category.code}
                  </div>
                  <div className="mt-2 font-display text-xl font-black text-arc-midnight">
                    {category.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Related Products
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Product pages to compare
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.product.slug}
                  product={item.product}
                  category={item.category}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <FaqSection items={guide.faq} title="Guide FAQ" />
          <RfqCta
            title="Ready to prepare your RFQ?"
            description="Send product names, photos, drawings, quantity, packaging requirements and destination country. ArcFort Weld will review confirmed details before quotation."
          />
        </div>
      </section>
    </>
  );
}
