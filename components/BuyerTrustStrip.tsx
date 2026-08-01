import { getAllProductCategories } from "@/lib/content/categories";
import { getAllProducts } from "@/lib/content/products";

const serviceSignals = [
  { label: "Main Port", value: "Tianjin Port" },
  { label: "MOQ", value: "Trial orders accepted" },
  { label: "Lead Time", value: "7-20 working days" },
  { label: "OEM", value: "Logo & private label" },
] as const;

export function BuyerTrustStrip() {
  const productCount = getAllProducts().length;
  const categoryCount = getAllProductCategories().length;

  return (
    <section className="w-full max-w-[100vw] overflow-hidden border-b border-slate-200 bg-arc-frost">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="flex min-h-10 items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700 sm:hidden">
          <span className="text-arc-blue">{productCount} products</span>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span>{categoryCount} categories</span>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span>Trial orders</span>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span>7-20 workdays</span>
        </p>

        <div className="hidden grid-cols-4 divide-x divide-slate-200 sm:grid lg:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))]">
          <div className="hidden min-w-0 py-3 pr-5 lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
              Industrial B2B Supply
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {productCount} products across {categoryCount} categories
            </p>
          </div>
          {serviceSignals.map((item) => (
            <div key={item.label} className="min-w-0 px-3 py-3 lg:px-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                {item.label}
              </div>
              <div className="mt-1 break-words text-xs font-black leading-5 text-arc-midnight">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
