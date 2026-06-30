import { notFound } from "next/navigation";
import { ProductDetailTemplate } from "@/components/content/ProductDetailTemplate";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllProductCategories, getProductCategoryBySlug } from "@/lib/content/categories";
import { breadcrumbJsonLd, faqJsonLd, productWebPageJsonLd } from "@/lib/content/jsonld";
import {
  getProductBySlug,
  getProductStaticParams,
  getRelatedProducts,
} from "@/lib/content/products";
import { hasPublicProductImage } from "@/lib/content/product-images";
import { buildMetadata } from "@/lib/content/seo";

type ProductRouteProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getProductStaticParams();
}

export async function generateMetadata({ params }: ProductRouteProps) {
  const { category: categorySlug, slug } = await params;
  const category = getProductCategoryBySlug(categorySlug);
  const product = getProductBySlug(categorySlug, slug);

  if (!category || !product) {
    return {};
  }

  return buildMetadata({
    title: product.metaTitle,
    description: product.metaDescription,
    path: `/products/${category.slug}/${product.slug}`,
    keywords: product.keywords,
    image: hasPublicProductImage(product.mainImage) ? product.mainImage : undefined,
  });
}

export default async function ProductDetailPage({ params }: ProductRouteProps) {
  const { category: categorySlug, slug } = await params;
  const category = getProductCategoryBySlug(categorySlug);
  const product = getProductBySlug(categorySlug, slug);

  if (!category || !product) {
    notFound();
  }

  const categoryMap = new Map(getAllProductCategories().map((item) => [item.slug, item]));
  const relatedProducts = getRelatedProducts(product)
    .map((relatedProduct) => {
      const relatedCategory = categoryMap.get(relatedProduct.categorySlug);

      if (!relatedCategory) {
        return null;
      }

      return {
        product: relatedProduct,
        category: relatedCategory,
      };
    })
    .filter(
      (
        relatedProduct,
      ): relatedProduct is {
        product: typeof product;
        category: typeof category;
      } => Boolean(relatedProduct),
    );

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: category.title, path: `/products/${category.slug}` },
            { name: product.title, path: `/products/${category.slug}/${product.slug}` },
          ]),
          productWebPageJsonLd(product, category),
          faqJsonLd(product.faq),
        ]}
      />
      <ProductDetailTemplate
        product={product}
        category={category}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
