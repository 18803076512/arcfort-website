import type { Metadata } from "next";
import Link from "next/link";
import { productCategories } from "@/lib/product-categories";

export const metadata: Metadata = {
  title: "Industrial Welding & Cutting Solutions",
  description:
    "Reliable MIG, TIG and plasma cutting parts for global distributors, OEM buyers, industrial users, and repair workshops.",
};

const whyChooseItems = [
  "Factory Direct Supply",
  "OEM Available",
  "Stable Quality",
  "Fast Delivery",
  "Global Support",
] as const;

const hotProducts = [
  {
    name: "MIG Contact Tip M6",
    category: "MIG Torch Parts",
    sku: "AF-MIG-CT-M6",
    detail: "Copper alloy tip for common MIG torch replacement programs.",
  },
  {
    name: "MIG Gas Nozzle 15AK",
    category: "MIG Torch Parts",
    sku: "AF-MIG-NZ-15AK",
    detail: "Durable nozzle option for distributor stock and repair kits.",
  },
  {
    name: "TIG Ceramic Cup No. 6",
    category: "TIG Torch Parts",
    sku: "AF-TIG-CUP-06",
    detail: "Standard TIG cup for fabrication, maintenance, and workshop use.",
  },
  {
    name: "TIG Collet Body 2.4 mm",
    category: "TIG Torch Parts",
    sku: "AF-TIG-CB-24",
    detail: "Precision consumable for stable tungsten holding and repeat orders.",
  },
  {
    name: "Plasma Cutting Electrode",
    category: "Plasma Cutting Parts",
    sku: "AF-PLA-EL-100",
    detail: "High-demand plasma consumable for cutting service channels.",
  },
  {
    name: "Plasma Nozzle 1.1 mm",
    category: "Plasma Cutting Parts",
    sku: "AF-PLA-NZ-11",
    detail: "Replacement nozzle for clean cutting and regular maintenance.",
  },
  {
    name: "Welding Ground Clamp",
    category: "Welding Accessories",
    sku: "AF-ACC-GC-300",
    detail: "Workshop-ready accessory for industrial welding setups.",
  },
  {
    name: "Inverter Welding Machine",
    category: "Welding Machines",
    sku: "AF-MAC-INV-200",
    detail: "Compact machine option for channel development and light industry.",
  },
] as const;

const applications = [
  "Shipbuilding",
  "Automotive",
  "Pipeline",
  "Metal Fabrication",
  "Construction",
  "Repair Workshop",
] as const;

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-arc-midnight text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(7,21,36,0.98)_0%,rgba(11,35,65,0.94)_48%,rgba(15,76,129,0.88)_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex border-l-4 border-arc-signal bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              ARCFORT Welding & Cutting Solutions
            </p>
            <h1 className="font-display text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
              Industrial Welding & Cutting Solutions
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">
              Reliable MIG, TIG and Plasma Cutting Parts for Global Distributors and Industrial
              Users.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white"
              >
                View Products
              </Link>
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center border border-white/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10"
              >
                Request a Quote
              </Link>
            </div>
          </div>

          <div className="border border-white/15 bg-white/10 p-5 shadow-industrial backdrop-blur">
            <div className="grid aspect-[4/3] grid-cols-6 grid-rows-6 overflow-hidden border border-white/10 bg-arc-navy">
              <div className="col-span-4 row-span-4 bg-[linear-gradient(135deg,#dce8f3_0%,#66829f_48%,#102943_100%)]" />
              <div className="col-span-2 row-span-2 border-l border-b border-white/10 bg-arc-signal" />
              <div className="col-span-2 row-span-2 border-l border-white/10 bg-[#1f5f95]" />
              <div className="col-span-2 row-span-2 border-t border-white/10 bg-[#203952]" />
              <div className="col-span-4 row-span-2 border-t border-white/10 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.18)_0,rgba(255,255,255,0.18)_1px,transparent_1px,transparent_12px)]" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {["MIG", "TIG", "CUT"].map((item) => (
                <div key={item} className="border border-white/10 bg-white/10 p-4 text-center">
                  <div className="font-display text-2xl font-black text-white">{item}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-300">
                    Parts Supply
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="product-categories">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Categories
              </p>
              <h2
                id="product-categories"
                className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
              >
                Core welding and cutting categories for B2B sourcing.
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold uppercase tracking-[0.16em] text-arc-blue hover:text-arc-copper"
            >
              View Products
            </Link>
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20" aria-labelledby="why-choose">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Why Choose ARCFORT
            </p>
            <h2
              id="why-choose"
              className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
            >
              Built for importers, distributors, and industrial procurement teams.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              ARCFORT focuses on reliable category coverage, export-ready communication, and
              consistent product programs for welding and cutting supply channels.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {whyChooseItems.map((item, index) => (
              <div key={item} className="border-l-4 border-arc-signal bg-white p-5 shadow-sm">
                <div className="font-display text-2xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 text-lg font-black text-arc-midnight">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="hot-products">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Hot Products
            </p>
            <h2
              id="hot-products"
              className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
            >
              High-demand items for repeat welding parts orders.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {hotProducts.map((product) => (
              <article
                key={product.sku}
                className="group border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-[linear-gradient(135deg,#eef3f8_0%,#c9d7e5_52%,#6f879f_100%)] p-5">
                  <div className="flex h-full w-full items-center justify-center border border-white/60 bg-white/35">
                    <span className="font-display text-3xl font-black text-arc-navy">
                      {product.category.split(" ")[0]}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                    {product.category}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-black text-arc-midnight">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {product.sku}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{product.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20" aria-labelledby="applications">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Applications
            </p>
            <h2
              id="applications"
              className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
            >
              Welding and cutting supply for demanding industrial environments.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <div
                key={application}
                className="border border-slate-200 bg-white p-6 shadow-sm transition hover:border-arc-blue"
              >
                <div className="h-1 w-16 bg-arc-signal" />
                <h3 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                  {application}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Practical parts support for procurement, maintenance, and repair workflows.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-midnight py-16 text-white sm:py-20" aria-labelledby="rfq">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">RFQ</p>
            <h2 id="rfq" className="mt-3 font-display text-3xl font-black sm:text-4xl">
              Need a Reliable Welding Parts Supplier?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Send your target parts, torch models, drawings, quantity plan, and destination market.
            </p>
          </div>
          <Link
            href="/rfq"
            className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white"
          >
            Send Your Inquiry
          </Link>
        </div>
      </section>
    </>
  );
}
