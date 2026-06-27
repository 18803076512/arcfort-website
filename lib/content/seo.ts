import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/content/site";

type SeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function buildMetadata({ title, description, path, keywords = [] }: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const normalizedTitle = title.replace(/\s*\|\s*ArcFort Weld\s*$/i, "");

  return {
    title: normalizedTitle,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: normalizedTitle,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedTitle,
      description,
    },
  };
}
