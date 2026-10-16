import { notFound } from "next/navigation";
import { ProductSeriesPageTemplate } from "@/components/content/ProductSeriesPageTemplate";
import { StructuredData } from "@/components/content/StructuredData";
import { getProductCategoryBySlug } from "@/lib/content/categories";
import { getGuideBySlug } from "@/lib/content/guides";
import { breadcrumbJsonLd, collectionPageJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { getSearchEligibleProductImages } from "@/lib/content/product-images";
import {
  getProductSeriesBySlug,
  getProductSeriesPath,
  getProductSeriesStaticParams,
  getResolvedProductSeriesReferences,
} from "@/lib/content/product-series";
import { buildMetadata } from "@/lib/content/seo";

type ProductSeriesRouteProps = {
  params: Promise<{
    category: string;
    series: string;
  }>;
};

export function generateStaticParams() {
  return getProductSeriesStaticParams();
}

export async function generateMetadata({ params }: ProductSeriesRouteProps) {
  const { category: categorySlug, series: seriesSlug } = await params;
  const series = getProductSeriesBySlug(categorySlug, seriesSlug);

  if (!series) {
    return {};
  }

  const references = getResolvedProductSeriesReferences(series);
  const heroProduct = references.find(
    (reference) => reference.product.slug === series.heroProductSlug,
  )?.product;
  const [heroImage] = heroProduct ? getSearchEligibleProductImages(heroProduct) : [];

  return buildMetadata({
    title: series.seoTitle,
    description: series.seoDescription,
    path: getProductSeriesPath(series),
    keywords: series.keywords,
    image: heroImage,
  });
}

export default async function ProductSeriesPage({ params }: ProductSeriesRouteProps) {
  const { category: categorySlug, series: seriesSlug } = await params;
  const series = getProductSeriesBySlug(categorySlug, seriesSlug);
  const category = getProductCategoryBySlug(categorySlug);

  if (!series || !category) {
    notFound();
  }

  const path = getProductSeriesPath(series);
  const references = getResolvedProductSeriesReferences(series);
  const heroProduct = references.find(
    (reference) => reference.product.slug === series.heroProductSlug,
  )?.product;
  const [heroImage] = heroProduct ? getSearchEligibleProductImages(heroProduct) : [];
  const relatedGuides = series.relatedGuideSlugs
    .map(getGuideBySlug)
    .filter((guide): guide is NonNullable<typeof guide> => Boolean(guide));

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: category.title, path: `/products/${category.slug}` },
            { name: series.name, path },
          ]),
          collectionPageJsonLd({
            name: series.name,
            description: series.seoDescription,
            path,
            image: heroImage,
            dateModified: series.reviewedDate,
            items: references.map((reference) => ({
              name: reference.product.title,
              path: `/products/${category.slug}/${reference.product.slug}`,
            })),
          }),
          faqJsonLd(series.faq),
        ]}
      />
      <ProductSeriesPageTemplate
        series={series}
        category={category}
        references={references}
        relatedGuides={relatedGuides}
        heroImage={heroImage}
      />
    </>
  );
}
