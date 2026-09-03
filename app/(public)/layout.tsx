import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { StructuredData } from "@/components/content/StructuredData";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SourceAttributionTracker } from "@/components/SourceAttributionTracker";
import { StickyContactBar } from "@/components/StickyContactBar";
import { organizationJsonLd, websiteJsonLd } from "@/lib/content/jsonld";
import { siteConfig } from "@/lib/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName, url: siteConfig.url }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  category: "Industrial welding and cutting products",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  title: {
    default: siteConfig.name,
    template: "%s | ArcFort Weld",
  },
  description:
    "ArcFort Weld provides industrial welding and cutting solutions for global distributors, importers, OEM buyers, industrial users, and repair workshops.",
  keywords: [
    "ArcFort Weld",
    "welding torch parts",
    "cutting consumables",
    "MIG torch parts",
    "TIG torch parts",
    "plasma cutting parts",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: siteConfig.name,
    description:
      "Industrial welding and cutting product supplier for global distributors, importers, OEM buyers and repair workshops.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteConfig.defaultSeoImage,
        width: 1568,
        height: 1003,
        alt: "ArcFort Weld industrial welding and cutting products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: "Industrial welding and cutting solutions for global B2B buyers and RFQ programs.",
    images: [siteConfig.defaultSeoImage],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-arc-signal focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <StructuredData data={[organizationJsonLd(), websiteJsonLd()]} />
      <SourceAttributionTracker />
      <AnalyticsTracker />
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <StickyContactBar />
    </>
  );
}
