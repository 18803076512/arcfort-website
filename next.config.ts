import type { NextConfig } from "next";
import { legacyCategoryRedirects, legacyProductRedirects } from "./lib/content/product-redirects";
import { siteConfig } from "./lib/content/site";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  async redirects() {
    return [
      ...legacyCategoryRedirects.flatMap(({ sourceCategorySlug, destinationCategorySlug }) => [
        {
          source: `/products/${sourceCategorySlug}`,
          destination: `/products/${destinationCategorySlug}`,
          permanent: true,
        },
        {
          source: `/products/${sourceCategorySlug}/:path+`,
          destination: `/products/${destinationCategorySlug}/:path+`,
          permanent: true,
        },
      ]),
      ...legacyProductRedirects.map(({ categorySlug, productSlug, destination }) => ({
        source: `/products/${categorySlug}/${productSlug}`,
        destination,
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/downloads/renqiu-ailesen-welding-catalog.pdf",
        headers: [
          {
            key: "Link",
            value: `<${siteConfig.url}/downloads/renqiu-ailesen-welding-catalog.pdf>; rel="canonical"`,
          },
        ],
      },
      {
        source: "/downloads/arcfort-public-product-list.csv",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/downloads/arcfort-rfq-template.csv",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
