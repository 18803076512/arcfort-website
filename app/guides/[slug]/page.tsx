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
  });
}

export default async function GuideDetailPage({ params }: GuideRouteProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const categoryMap = new Map(getAllProductCategories().map((category) => [category.slug, category]));
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: guide.title },
            ]}
          />
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
            Buyer Guide
          </p>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{guide.description}</p>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            {guide.sections.map((section) => (
              <article key={section.title} className="border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-2xl font-black text-arc-midnight">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
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
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Related Products
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.product.slug} product={item.product} category={item.category} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <FaqSection items={guide.faq} title="Guide FAQ" />
          <RfqCta title="Ready to prepare your RFQ?" />
        </div>
      </section>
    </>
  );
}
