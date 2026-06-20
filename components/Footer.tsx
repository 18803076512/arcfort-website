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

export function Footer() {
  return (
    <footer className="bg-arc-midnight text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_0.75fr_0.9fr_0.8fr] lg:px-8">
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
            Navigation
          </h2>
          <div className="mt-4 grid gap-2">
            {links.map((link) => (
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
