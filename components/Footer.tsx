import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { Container } from "@/components/ui/Container";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";
import { productNavigationGroups } from "@/lib/content/site-navigation";

const cooperationLinks = [
  { href: "/distributor-supply", label: "Distributor Cooperation" },
  { href: "/oem-service", label: "OEM / ODM" },
  { href: "/quality-control", label: "Quality Coordination" },
  { href: "/shipping-payment", label: "Order & Shipping" },
] as const;

const resourceLinks = [
  { href: "/applications", label: "Industry Solutions" },
  { href: "/guides", label: "Technical Guides" },
  { href: "/downloads", label: "Catalogs & Downloads" },
  { href: "/about", label: "About ArcFort Weld" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
] as const;

const footerLinkClass =
  "inline-flex min-h-9 items-center text-sm leading-6 text-slate-300 transition hover:text-white";

export function Footer() {
  return (
    <footer className="bg-arc-midnight text-white">
      <div data-nosnippet data-snippet-region="site-footer-links">
        <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.25fr_repeat(4,0.75fr)] lg:py-16">
          <div className="max-w-sm">
            <Link href="/" aria-label="ArcFort Weld homepage">
              <BrandLockup inverse />
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Welding equipment, torch parts, cutting consumables and industrial accessories for
              distributors, OEM buyers and industrial users.
            </p>
            <p className="mt-4 text-xs leading-5 text-slate-400">{siteConfig.legalName}</p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase text-slate-400">Products</h2>
            <div className="mt-4 grid gap-1">
              {productNavigationGroups.map((group) => (
                <Link key={group.href} href={group.href} className={footerLinkClass}>
                  {group.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase text-slate-400">Cooperation</h2>
            <div className="mt-4 grid gap-1">
              {cooperationLinks.map((item) => (
                <Link key={item.href} href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase text-slate-400">Resources</h2>
            <div className="mt-4 grid gap-1">
              {resourceLinks.map((item) => (
                <Link key={item.href} href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase text-slate-400">Contact Sales</h2>
            <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
              <a
                href={buildEmailHref({ subject: "ArcFort Weld product inquiry" })}
                className="break-all transition hover:text-white"
              >
                {siteConfig.email}
              </a>
              <a href={buildWhatsAppHref()} className="transition hover:text-white">
                {siteConfig.whatsapp}
              </a>
              <p className="mt-2 text-slate-400">{siteConfig.address}</p>
            </div>
          </div>
        </Container>
      </div>

      <div
        data-nosnippet
        data-snippet-region="site-footer-legal"
        className="border-t border-white/10"
      >
        <Container className="flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>(c) 2026 {siteConfig.name}. All rights reserved.</p>
          <p>Industrial welding and cutting solutions</p>
        </Container>
      </div>
    </footer>
  );
}
