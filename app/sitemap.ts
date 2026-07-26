import type { MetadataRoute } from "next";
import { getAllApplications } from "@/lib/content/applications";
import { getAllProductCategories } from "@/lib/content/categories";
import { getAllGuides } from "@/lib/content/guides";
import { getAllProducts } from "@/lib/content/products";
import { getSearchEligibleProductImages } from "@/lib/content/product-images";
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
  const applicationRoutes = getAllApplications().map(
    (application) => `/applications/${application.slug}`,
  );
  const guideRoutes = getAllGuides();

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
    })),
    ...downloadableRoutes.map((route) => ({ url: absoluteUrl(route) })),
    ...categoryRoutes.map((route) => ({ url: absoluteUrl(route) })),
    ...getAllProducts().map((product) => {
      const route = `/products/${product.categorySlug}/${product.slug}`;
      const images = getSearchEligibleProductImages(product).map(absoluteUrl);

      return {
        url: absoluteUrl(route),
        ...(images.length > 0 ? { images } : {}),
      };
    }),
    ...applicationRoutes.map((route) => ({ url: absoluteUrl(route) })),
    ...guideRoutes.map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: guide.modifiedDate,
    })),
  ];
}
