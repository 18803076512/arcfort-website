import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/content/site";

type SeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
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
  const normalizedTitle = title.replace(/\s*\|\s*ArcFort Weld\s*$/i, "");
  const seoImage = image
    ? {
        url: absoluteUrl(image),
        alt: `${normalizedTitle} - ${siteConfig.name}`,
      }
    : defaultSeoImage;

  return {
    title: normalizedTitle,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: normalizedTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      type,
      images: [seoImage],
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedTitle,
      description,
      images: [seoImage.url],
    },
  };
}
