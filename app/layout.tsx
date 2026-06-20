import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StructuredData } from "@/components/content/StructuredData";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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
    description:
      "Industrial welding and cutting solutions for global B2B buyers and RFQ programs.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <StructuredData data={organizationJsonLd()} />
        <Header />
        <main>{children}</main>
        <Footer />
        <StickyContactBar />
      </body>
    </html>
  );
}
