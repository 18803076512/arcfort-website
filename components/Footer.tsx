import Link from "next/link";
import { siteConfig } from "@/lib/content/site";
import { productCategories } from "@/lib/product-categories";

const links = [
  { href: "/products", label: "Products" },
  { href: "/applications", label: "Applications" },
  { href: "/guides", label: "Guides" },
  { href: "/products/mig-mag-torch-parts", label: "MIG/MAG Parts" },
  { href: "/products/plasma-cutting-consumables", label: "Plasma Consumables" },
  { href: "/oem-service", label: "OEM Service" },
  { href: "/quality-control", label: "Quality Control" },
  { href: "/shipping-payment", label: "Shipping & Payment" },
  { href: "/downloads", label: "Downloads" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/rfq", label: "RFQ" },
];

const buyerServiceLinks = [
  { href: "/oem-service", label: "OEM Service" },
  { href: "/quality-control", label: "Quality Control" },
  { href: "/shipping-payment", label: "Shipping & Payment" },
  { href: "/downloads", label: "Downloads" },
  { href: "/rfq", label: "Request a Quote" },
];

export function Footer() {
  return (
    <footer className="bg-arc-midnight text-white">
      <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(11,35,65,0.96),rgba(15,76,129,0.78))]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              Export RFQ Support
            </p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight">
              Send product lists, drawings or sample photos for quotation review.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              ArcFort Weld reviews welding and cutting product requirements for distributors,
              importers, repair workshops and OEM buyers before confirming quotation details.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Link
              href="/rfq"
              className="inline-flex min-h-12 items-center justify-center bg-arc-signal px-5 text-xs font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white"
            >
              Request a Quote
            </Link>
            <a
              href={siteConfig.emailHref}
              className="inline-flex min-h-12 items-center justify-center border border-white/25 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-arc-signal hover:text-arc-signal"
            >
              Email Sales
            </a>
            <a
              href={siteConfig.whatsappHref}
              className="inline-flex min-h-12 items-center justify-center border border-white/25 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-arc-signal hover:text-arc-signal"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.05fr_0.65fr_0.9fr_0.85fr_0.85fr] lg:px-8">
        <div>
          <div className="font-display text-3xl font-black">{siteConfig.shortName}</div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            {siteConfig.tagline} for distributors, importers, OEM buyers,
            industrial users, and repair workshops.
          </p>
          <p className="mt-4 text-xs leading-5 text-slate-400">{siteConfig.legalName}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Company
          </h2>
          <div className="mt-4 grid gap-2">
            {links
              .filter(
                (link) =>
                  !["/oem-service", "/quality-control", "/shipping-payment", "/downloads", "/rfq"].includes(
                    link.href,
                  ),
              )
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-300 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Buyer Services
          </h2>
          <div className="mt-4 grid gap-2">
            {buyerServiceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Product Lines
          </h2>
          <div className="mt-4 grid gap-2">
            {productCategories.map((category) => (
              <Link
                key={category.name}
                href={`/products/${category.slug}`}
                className="text-sm text-slate-300 hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">
            Contact
          </h2>
          <div className="mt-4 grid gap-2 text-sm text-slate-300">
            <a href={siteConfig.emailHref} className="hover:text-white">
              Email: {siteConfig.email}
            </a>
            <a href={siteConfig.whatsappHref} className="hover:text-white">
              WhatsApp: {siteConfig.whatsapp}
            </a>
            <p>Address: {siteConfig.address}</p>
            <p>Main Port: {siteConfig.mainPort}</p>
            <Link href="/rfq" className="font-semibold text-white hover:text-arc-signal">
              Send Inquiry
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs uppercase tracking-[0.16em] text-slate-400">
        (c) 2026 {siteConfig.name}
      </div>
    </footer>
  );
}
