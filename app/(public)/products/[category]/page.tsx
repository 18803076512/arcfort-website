import { notFound } from "next/navigation";
import { CategoryPageTemplate } from "@/components/content/CategoryPageTemplate";
import { StructuredData } from "@/components/content/StructuredData";
import { getApplicationsByCategory } from "@/lib/content/applications";
import {
  getAllProductCategories,
  getProductCategoryBySlug,
  getRelatedCategories,
} from "@/lib/content/categories";
import { breadcrumbJsonLd, collectionPageJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { getProductsByCategory } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { getPreferredSeoImage } from "@/lib/content/seo-images";
import { siteConfig } from "@/lib/content/site";

type CategoryRouteProps = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return getAllProductCategories().map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryRouteProps) {
  const { category: categorySlug } = await params;
  const category = getProductCategoryBySlug(categorySlug);

  if (!category) {
    return {};
  }

  const products = getProductsByCategory(category.slug);

  return buildMetadata({
    title: category.seoTitle,
    description: category.seoDescription,
    path: `/products/${category.slug}`,
    keywords: category.keywords,
    image: getPreferredSeoImage(products),
  });
}

export default async function ProductCategoryPage({ params }: CategoryRouteProps) {
  const { category: categorySlug } = await params;
  const category = getProductCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(category.slug);
  const seoImage = getPreferredSeoImage(products);
  const relatedCategories = getRelatedCategories(category.relatedCategorySlugs);
  const relatedApplications = getApplicationsByCategory(category.slug);

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: category.title, path: `/products/${category.slug}` },
          ]),
          collectionPageJsonLd({
            name: category.title,
            description: category.seoDescription,
            path: `/products/${category.slug}`,
            image: seoImage,
            dateModified: siteConfig.contentLastModified,
            items: products.map((product) => ({
              name: product.title,
              path: `/products/${category.slug}/${product.slug}`,
            })),
          }),
          faqJsonLd(category.faq),
        ]}
      />
      <CategoryPageTemplate
        category={category}
        products={products}
        relatedCategories={relatedCategories}
        relatedApplications={relatedApplications}
      />
    </>
  );
}
