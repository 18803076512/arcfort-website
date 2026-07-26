import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/content/site";
import { composeSeoTitle } from "@/lib/content/seo-title";

type SeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
};

const defaultSeoImage = {
  url: absoluteUrl(siteConfig.defaultSeoImage),
  width: 1568,
  height: 1003,
  alt: `${siteConfig.name} industrial welding and cutting products`,
};

export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
  type = "website",
  noIndex = false,
}: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const normalizedTitle = title.replace(/\s*\|\s*ArcFort Weld\s*$/i, "").trim();
  const seoTitle = composeSeoTitle(normalizedTitle, siteConfig.shortName);
  const seoImage = image
    ? {
        url: absoluteUrl(image),
        alt: `${normalizedTitle} - ${siteConfig.name}`,
      }
    : defaultSeoImage;

  return {
    title: {
      absolute: seoTitle,
    },
    description,
    keywords: [...keywords],
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: seoTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      type,
      images: [seoImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: [seoImage.url],
    },
  };
}
