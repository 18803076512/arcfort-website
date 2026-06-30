import Link from "next/link";
import { siteConfig } from "@/lib/content/site";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/applications", label: "Applications" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const buyerServiceNavigation = [
  { href: "/oem-service", label: "OEM Service" },
  { href: "/quality-control", label: "Quality Control" },
  { href: "/shipping-payment", label: "Shipping & Payment" },
  { href: "/downloads", label: "Downloads" },
] as const;

const mobileNavigationGroups = [
  { title: "Main", items: navigation },
  { title: "Buyer Services", items: buyerServiceNavigation },
  { title: "Inquiry", items: [{ href: "/rfq", label: "Request a Quote" }] },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full max-w-[100vw] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="hidden bg-arc-midnight text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-8 py-2 text-xs font-semibold uppercase tracking-[0.12em]">
          <span className="text-slate-300">{siteConfig.legalName}</span>
          <div className="flex items-center gap-5 text-slate-200">
            <span className="text-slate-400">Main Port: Tianjin Port</span>
            <a href={siteConfig.emailHref} className="hover:text-arc-signal">
              {siteConfig.email}
            </a>
            <a href={siteConfig.whatsappHref} className="hover:text-arc-signal">
              {siteConfig.whatsapp}
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto grid min-h-16 w-full max-w-[100vw] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:min-h-20 sm:gap-4 sm:px-6 sm:py-4 lg:max-w-7xl lg:flex lg:justify-between lg:px-8">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:flex-none">
          <span className="flex h-10 w-10 items-center justify-center bg-arc-midnight font-display text-base font-black text-arc-signal sm:h-11 sm:w-11 sm:text-lg">
            AF
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-xl font-black tracking-normal text-arc-midnight sm:text-2xl">
              {siteConfig.shortName}
            </span>
            <span className="block truncate text-[11px] font-bold uppercase tracking-[0.12em] text-arc-blue sm:text-xs sm:tracking-[0.18em]">
              Welding & Cutting
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-arc-frost hover:text-arc-blue"
            >
              {item.label}
            </Link>
          ))}
          <details className="group relative">
            <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-arc-frost hover:text-arc-blue marker:hidden">
              Buyer Services
            </summary>
            <div className="absolute right-0 top-10 z-50 grid w-64 gap-1 border border-slate-200 bg-white p-3 shadow-industrial">
              {buyerServiceNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-3 text-sm font-bold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-arc-frost hover:text-arc-blue"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
          <Link
            href="/rfq"
            className="ml-2 inline-flex items-center justify-center bg-arc-blue px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-arc-midnight"
          >
            Send RFQ
          </Link>
        </nav>

        <details className="group relative shrink-0 lg:hidden">
          <summary className="flex min-h-11 w-20 cursor-pointer list-none items-center justify-center bg-arc-blue px-3 text-xs font-bold uppercase tracking-[0.08em] text-white marker:hidden">
            Menu
          </summary>
          <nav className="fixed left-3 right-3 top-[4.5rem] z-50 hidden max-h-[calc(100vh-6rem)] gap-1 overflow-y-auto border border-slate-200 bg-white p-2 shadow-industrial group-open:grid sm:left-4 sm:right-4 sm:top-24 sm:max-h-[calc(100vh-8rem)] sm:p-3">
            {mobileNavigationGroups.map((group) => (
              <div key={group.title} className="border-b border-slate-100 pb-2 last:border-b-0">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {group.title}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex min-h-11 items-center px-3 text-sm font-bold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-arc-frost hover:text-arc-blue"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600 sm:grid-cols-2">
              <a
                href={siteConfig.emailHref}
                className="block min-w-0 border border-slate-100 bg-arc-frost p-3 font-semibold text-arc-midnight"
              >
                {siteConfig.email}
              </a>
              <a
                href={siteConfig.whatsappHref}
                className="block min-w-0 border border-slate-100 bg-arc-frost p-3 font-semibold text-arc-blue"
              >
                {siteConfig.whatsapp}
              </a>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
