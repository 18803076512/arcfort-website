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
    <section className="border-b border-slate-200 bg-arc-frost">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1.05fr_1.2fr_0.75fr] lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
            Industrial B2B Supply
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {productCount} RFQ-ready product records across {categoryCount} categories for welding
            and cutting buyers.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-4">
          {serviceSignals.map((item) => (
            <div key={item.label} className="bg-white px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {item.label}
              </div>
              <div className="mt-1 text-sm font-black text-arc-midnight">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
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
