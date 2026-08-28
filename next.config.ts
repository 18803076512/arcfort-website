import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";
import {
  heldProductSeriesRedirects,
  legacyCategoryRedirects,
  legacyProductRedirects,
} from "./lib/content/product-redirects";
import { siteConfig } from "./lib/content/site";

const isDevelopment = process.env.NODE_ENV === "development";
const analyticsScriptOrigin = "https://www.googletagmanager.com";
const analyticsCollectionOrigins = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
];
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} ${analyticsScriptOrigin}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${analyticsScriptOrigin} ${analyticsCollectionOrigins[0]}`,
  "font-src 'self' data:",
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""} ${analyticsScriptOrigin} ${analyticsCollectionOrigins.join(" ")}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "X-XSS-Protection",
    value: "0",
  },
] as const;

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    deviceSizes: [
      384, 390, 430, 640, 750, 828, 1080, 1200, 1440, 1600, 1920, 2048, 2560, 2880, 3840,
    ],
    formats: ["image/avif", "image/webp"],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    qualities: [75, 88, 90],
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
      ...heldProductSeriesRedirects.map(({ categorySlug, seriesSlug, destination }) => ({
        source: `/products/${categorySlug}/series/${seriesSlug}`,
        destination,
        permanent: false,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders.map((header) => ({ ...header })),
      },
      {
        source: "/downloads/arcfort-distributor-sourcing-guide.pdf",
        headers: [
          {
            key: "Link",
            value: `<${siteConfig.url}/downloads/arcfort-distributor-sourcing-guide.pdf>; rel="canonical"`,
          },
        ],
      },
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
      {
        source: "/downloads/arcfort-tig-torch-switch-identification.csv",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default withBotId(nextConfig);
