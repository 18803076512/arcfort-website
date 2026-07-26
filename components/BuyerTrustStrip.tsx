import Link from "next/link";
import { getAllProductCategories } from "@/lib/content/categories";
import { getAllProducts } from "@/lib/content/products";
import { siteConfig } from "@/lib/content/site";

const serviceSignals = [
  { label: "Main Port", value: "Tianjin Port" },
  { label: "OEM", value: "Logo & packaging" },
  { label: "MOQ", value: "Small trial orders" },
  { label: "Lead Time", value: "7-20 working days" },
] as const;

export function BuyerTrustStrip() {
  const productCount = getAllProducts().length;
  const categoryCount = getAllProductCategories().length;

  return (
    <section className="w-full max-w-[100vw] overflow-hidden border-b border-slate-200 bg-arc-frost">
      <div className="mx-auto grid w-full max-w-[100vw] gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:max-w-7xl lg:grid-cols-[1.05fr_1.2fr_0.75fr] lg:items-center lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
            Industrial B2B Supply
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-700 sm:hidden">
            {productCount} products · {categoryCount} categories · Trial orders · 7-20 working days
          </p>
          <p className="mt-1 hidden text-sm leading-6 text-slate-700 sm:block">
            {productCount} sourcing items across {categoryCount} product categories for welding and
            cutting buyers.
          </p>
        </div>
        <div className="hidden grid-cols-[repeat(4,minmax(0,1fr))] gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid">
          {serviceSignals.map((item) => (
            <div key={item.label} className="min-w-0 bg-white px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {item.label}
              </div>
              <div className="mt-1 break-words text-sm font-black text-arc-midnight">
                {item.value}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row lg:flex-col">
          <Link
            href="/rfq"
            className="inline-flex min-h-11 items-center justify-center bg-arc-blue px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
          >
            Send RFQ
          </Link>
          <a
            href={siteConfig.whatsappHref}
            className="inline-flex min-h-11 items-center justify-center border border-arc-blue px-4 text-xs font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
