import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BuyerTrustStrip } from "@/components/BuyerTrustStrip";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { StructuredData } from "@/components/content/StructuredData";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SourceAttributionTracker } from "@/components/SourceAttributionTracker";
import { StickyContactBar } from "@/components/StickyContactBar";
import { organizationJsonLd } from "@/lib/content/jsonld";
import { siteConfig } from "@/lib/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
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
  openGraph: {
    title: siteConfig.name,
    description:
      "Industrial welding and cutting product supplier for global distributors, importers, OEM buyers and repair workshops.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: "Industrial welding and cutting solutions for global B2B buyers and RFQ programs.",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-arc-signal focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.12em] focus:text-arc-midnight"
        >
          Skip to content
        </a>
        <StructuredData data={organizationJsonLd()} />
        <SourceAttributionTracker />
        <AnalyticsTracker />
        <Header />
        <BuyerTrustStrip />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <StickyContactBar />
      </body>
    </html>
  );
}
