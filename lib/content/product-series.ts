import { productSeries } from "@/lib/data/product-series";
import { getCompatibilityRelationshipsForProduct } from "@/lib/content/compatibility";
import { getAllProducts } from "@/lib/content/products";
import type { Product, ProductSeries } from "@/lib/content/schemas";

export type ResolvedProductSeriesReference = ProductSeries["productReferences"][number] & {
  product: Product;
};

export function getAllProductSeries() {
  return productSeries;
}

export function getProductSeriesBySlug(categorySlug: string, seriesSlug: string) {
  return productSeries.find(
    (series) => series.categorySlug === categorySlug && series.slug === seriesSlug,
  );
}

export function getProductSeriesByCategory(categorySlug: string) {
  return productSeries.filter((series) => series.categorySlug === categorySlug);
}

export function getProductSeriesForProduct(productSlug: string) {
  const relatedSeriesEvidenceIds = new Set(
    getCompatibilityRelationshipsForProduct(productSlug)
      .filter(
        (relationship) =>
          relationship.relationshipType === "product_to_series" &&
          relationship.target.type === "series" &&
          relationship.relationshipStatus !== "unverified" &&
          relationship.verificationStatus !== "DATA_CONFLICT",
      )
      .map((relationship) => relationship.target.id),
  );

  return productSeries.filter((series) => relatedSeriesEvidenceIds.has(series.evidenceId));
}

export function getResolvedProductSeriesReferences(series: ProductSeries) {
  const productsBySlug = new Map(getAllProducts().map((product) => [product.slug, product]));

  return series.productReferences
    .map((reference) => {
      const product = productsBySlug.get(reference.productSlug);

      return product ? { ...reference, product } : null;
    })
    .filter((reference): reference is ResolvedProductSeriesReference =>
      Boolean(reference?.product),
    );
}

export function getProductSeriesPath(series: ProductSeries) {
  return `/products/${series.categorySlug}/series/${series.slug}`;
}

export function getProductSeriesStaticParams() {
  return productSeries.map((series) => ({
    category: series.categorySlug,
    series: series.slug,
  }));
}
