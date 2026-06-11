import Link from "next/link";
import { productCategories } from "@/lib/product-categories";

const stats = [
  { value: "6", label: "Core product lines" },
  { value: "OEM", label: "Buyer-ready supply" },
  { value: "Global", label: "Distributor focus" },
];

const capabilities = [
  "Stable consumable sourcing for repeat orders",
  "Parts coverage for welding and plasma systems",
  "Export-ready communication and RFQ workflow",
  "Support for distributors, importers, and repair channels",
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-arc-midnight text-white">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(7,21,36,0.95)_0%,rgba(11,35,65,0.88)_44%,rgba(15,76,129,0.82)_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex border-l-4 border-arc-signal bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-arc-signal">
              Industrial Welding & Cutting Solutions
            </p>
            <h1 className="font-display text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">
              ARCFORT Welding & Cutting Solutions
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">
              Built for global distributors, importers, OEM buyers, industrial users, and repair
              workshops that need dependable welding and cutting product supply.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white"
              >
                View Products
              </Link>
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center border border-white/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10"
              >
                Send RFQ
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="border border-white/15 bg-white/10 p-5 shadow-industrial backdrop-blur">
              <div className="grid aspect-[4/3] grid-cols-6 grid-rows-6 overflow-hidden border border-white/10 bg-arc-navy">
                <div className="col-span-4 row-span-4 bg-[linear-gradient(135deg,#d9e6f2_0%,#69839c_48%,#132b46_100%)]" />
                <div className="col-span-2 row-span-2 border-l border-b border-white/10 bg-arc-signal" />
                <div className="col-span-2 row-span-2 border-l border-white/10 bg-[#1f5f95]" />
                <div className="col-span-2 row-span-2 border-t border-white/10 bg-[#203952]" />
                <div className="col-span-4 row-span-2 border-t border-white/10 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.18)_0,rgba(255,255,255,0.18)_1px,transparent_1px,transparent_12px)]" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="border border-white/10 bg-white/10 p-4">
                    <div className="font-display text-2xl font-black text-white">{stat.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-300">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Product Center
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              A focused range for welding and cutting channels.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productCategories.map((category) => (
              <Link
                href="/products"
                key={category.name}
                className="group border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-arc-blue hover:bg-white hover:shadow-industrial"
              >
                <div className="flex h-12 w-12 items-center justify-center bg-arc-navy text-lg font-black text-arc-signal">
                  {category.code}
                </div>
                <h3 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                  {category.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.16em] text-arc-blue group-hover:text-arc-copper">
                  Explore
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Supply Capability
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              Prepared for industrial buyers who compare, qualify, and reorder.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((item) => (
              <div key={item} className="border-l-4 border-arc-signal bg-white p-5 shadow-sm">
                <p className="font-semibold leading-7 text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
