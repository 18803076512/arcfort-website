import { products } from "@/content/products";
import type { Product } from "@/lib/content/schemas";

export function getAllProducts() {
  return products;
}

export function getProductsByCategory(categorySlug: string) {
  return products.filter((product) => product.categorySlug === categorySlug);
}

export function getProductBySlug(categorySlug: string, productSlug: string) {
  return products.find(
    (product) => product.categorySlug === categorySlug && product.slug === productSlug,
  );
}

export function getRelatedProducts(product: Product, limit = 3) {
  const requestedProducts = product.relatedProductSlugs
    .map((slug) => products.find((relatedProduct) => relatedProduct.slug === slug))
    .filter((relatedProduct): relatedProduct is Product => Boolean(relatedProduct));

  if (requestedProducts.length >= limit) {
    return requestedProducts.slice(0, limit);
  }

  const fallbackProducts = products.filter(
    (relatedProduct) =>
      relatedProduct.slug !== product.slug &&
      relatedProduct.categorySlug === product.categorySlug &&
      !requestedProducts.some((requestedProduct) => requestedProduct.slug === relatedProduct.slug),
  );

  return [...requestedProducts, ...fallbackProducts].slice(0, limit);
}

export function getProductStaticParams() {
  return products.map((product) => ({
    category: product.categorySlug,
    slug: product.slug,
  }));
}
