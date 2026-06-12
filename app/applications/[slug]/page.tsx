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
import type { Product } from "@/lib/content/schemas";

type ApplicationRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
    .filter((item): item is { product: Product; category: NonNullable<ReturnType<typeof categoryMap.get>> } =>
      Boolean(item),
    );

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
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Application
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                {application.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{application.description}</p>
            </div>
            <div className="border-l-4 border-arc-signal bg-arc-frost p-6">
              <h2 className="font-display text-2xl font-black text-arc-midnight">Overview</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">{application.overview}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Needs
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Common sourcing requirements
            </h2>
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

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Related Industries
            </h2>
            <div className="mt-5 grid gap-3">
              {application.industries.map((industry) => (
                <div key={industry} className="bg-arc-frost p-4 text-sm font-semibold text-slate-800">
                  {industry}
                </div>
              ))}
            </div>
          </div>
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
