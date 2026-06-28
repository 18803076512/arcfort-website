import type { MetadataRoute } from "next";
import { getAllApplications } from "@/lib/content/applications";
import { getAllProductCategories } from "@/lib/content/categories";
import { getAllGuides } from "@/lib/content/guides";
import { getAllProducts } from "@/lib/content/products";
import { absoluteUrl } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/products",
    "/applications",
    "/guides",
    "/about",
    "/oem-service",
    "/quality-control",
    "/shipping-payment",
    "/downloads",
    "/contact",
    "/privacy",
    "/rfq",
  ];
  const downloadableRoutes = ["/downloads/renqiu-ailesen-welding-catalog.pdf"];
  const categoryRoutes = getAllProductCategories().map((category) => `/products/${category.slug}`);
  const productRoutes = getAllProducts().map(
    (product) => `/products/${product.categorySlug}/${product.slug}`,
  );
  const applicationRoutes = getAllApplications().map(
    (application) => `/applications/${application.slug}`,
  );
  const guideRoutes = getAllGuides().map((guide) => `/guides/${guide.slug}`);

  return [
    ...staticRoutes,
    ...downloadableRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...applicationRoutes,
    ...guideRoutes,
  ].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority:
      route === "/"
        ? 1
        : route.startsWith("/products") || route.startsWith("/applications")
          ? 0.8
          : route.endsWith(".pdf")
            ? 0.5
            : 0.6,
  }));
}
