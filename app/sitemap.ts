import type { MetadataRoute } from "next";
import { getAllApplications } from "@/lib/content/applications";
import { getAllProductCategories } from "@/lib/content/categories";
import { getAllGuides } from "@/lib/content/guides";
import { getAllProducts } from "@/lib/content/products";
import { getSearchEligibleProductImages } from "@/lib/content/product-images";
import { absoluteUrl, siteConfig } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/products",
    "/applications",
    "/guides",
    "/about",
    "/distributor-supply",
    "/oem-service",
    "/quality-control",
    "/shipping-payment",
    "/downloads",
    "/contact",
    "/privacy",
    "/rfq",
  ];
  const downloadableRoutes = [
    {
      path: "/downloads/arcfort-distributor-rfq-workbook.xlsx",
      lastModified: siteConfig.distributorLandingLastModified,
    },
    {
      path: "/downloads/arcfort-welding-machine-rfq.xlsx",
      lastModified: siteConfig.contentLastModified,
    },
    {
      path: "/downloads/arcfort-plasma-consumables-rfq.xlsx",
      lastModified: siteConfig.contentLastModified,
    },
    {
      path: "/downloads/arcfort-oem-project-brief.xlsx",
      lastModified: siteConfig.contentLastModified,
    },
    {
      path: "/downloads/arcfort-distributor-sourcing-guide.pdf",
      lastModified: siteConfig.contentLastModified,
    },
    {
      path: "/downloads/renqiu-ailesen-welding-catalog.pdf",
      lastModified: siteConfig.catalogLastModified,
    },
  ];
  const categoryRoutes = getAllProductCategories().map((category) => `/products/${category.slug}`);
  const applicationRoutes = getAllApplications().map(
    (application) => `/applications/${application.slug}`,
  );
  const guideRoutes = getAllGuides();

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified:
        route === "/distributor-supply"
          ? siteConfig.distributorLandingLastModified
          : route === "/oem-service"
            ? siteConfig.oemLastModified
            : route === "/guides"
              ? siteConfig.guidesLastModified
              : route === "/about"
                ? siteConfig.aboutLastModified
                : route === "/contact"
                  ? siteConfig.contactLastModified
                  : siteConfig.contentLastModified,
    })),
    ...downloadableRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: route.lastModified,
    })),
    ...categoryRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: siteConfig.contentLastModified,
    })),
    ...getAllProducts().map((product) => {
      const route = `/products/${product.categorySlug}/${product.slug}`;
      const images = getSearchEligibleProductImages(product).map(absoluteUrl);

      return {
        url: absoluteUrl(route),
        lastModified: product.modifiedDate,
        ...(images.length > 0 ? { images } : {}),
      };
    }),
    ...applicationRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: siteConfig.contentLastModified,
    })),
    ...guideRoutes.map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: guide.modifiedDate,
    })),
  ];
}
