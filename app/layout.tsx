import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcfortweld.com"),
  title: {
    default: "ARCFORT Welding & Cutting Solutions",
    template: "%s | ARCFORT",
  },
  description:
    "ARCFORT provides industrial welding and cutting solutions for global distributors, importers, OEM buyers, industrial users, and repair workshops.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ARCFORT Welding & Cutting Solutions",
    description:
      "Industrial welding and cutting solutions for global distributors, importers, OEM buyers, industrial users, and repair workshops.",
    url: "https://arcfortweld.com",
    siteName: "ARCFORT Welding & Cutting Solutions",
    type: "website",
  },
  keywords: [
    "ARCFORT",
    "welding torch parts",
    "cutting consumables",
    "MIG torch parts",
    "TIG torch parts",
    "plasma cutting parts",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
