import type { MetadataRoute } from "next";
import { getAllProductCategories } from "@/lib/content/categories";
import { getAllProducts } from "@/lib/content/products";
import { absoluteUrl } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/products", "/about", "/contact", "/rfq"];
  const categoryRoutes = getAllProductCategories().map((category) => `/products/${category.slug}`);
  const productRoutes = getAllProducts().map(
    (product) => `/products/${product.categorySlug}/${product.slug}`,
  );

  return [...staticRoutes, ...categoryRoutes, ...productRoutes].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/products") ? 0.8 : 0.6,
  }));
}
