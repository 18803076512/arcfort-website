import Link from "next/link";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { getAllApplications } from "@/lib/content/applications";
import { getAllProductCategories } from "@/lib/content/categories";
import { getAllProducts } from "@/lib/content/products";

const advantages = [
  "Factory direct supply discussion",
  "OEM and private label support",
  "Stable quality control workflow",
  "Fast RFQ communication",
  "Global distributor support",
];

const supplyScope = [
  "MIG/MAG Torch Parts",
  "TIG Torch Parts",
  "Plasma Cutting Consumables",
  "Welding Consumables",
  "Welding Machines",
  "Welding Accessories",
];

export default function Home() {
  const categories = getAllProductCategories();
  const products = getAllProducts();
  const applications = getAllApplications();
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return (
    <>
      <section className="relative overflow-hidden bg-arc-midnight text-white">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(7,21,36,0.98)_0%,rgba(11,35,65,0.92)_45%,rgba(15,76,129,0.84)_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex border-l-4 border-arc-signal bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-arc-signal">
              ArcFort Weld | Welding & Cutting Solutions
            </p>
            <h1 className="font-display text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
              Industrial Welding & Cutting Solutions
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">
              Reliable MIG, TIG and plasma cutting parts for global distributors, importers, OEM
              buyers, industrial users and repair workshops.
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
                Request a Quote
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="border border-white/15 bg-white/10 p-5 shadow-industrial backdrop-blur">
              <div className="grid aspect-[4/3] grid-cols-6 grid-rows-6 overflow-hidden border border-white/10 bg-arc-navy">
                <div className="col-span-4 row-span-4 bg-[linear-gradient(135deg,#d9e6f2_0%,#69839c_48%,#132b46_100%)]" />
                <div className="col-span-2 row-span-2 border-b border-l border-white/10 bg-arc-signal" />
                <div className="col-span-2 row-span-2 border-l border-white/10 bg-[#1f5f95]" />
                <div className="col-span-2 row-span-2 border-t border-white/10 bg-[#203952]" />
                <div className="col-span-4 row-span-2 border-t border-white/10 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.18)_0,rgba(255,255,255,0.18)_1px,transparent_1px,transparent_12px)]" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {["RFQ", "OEM", "B2B"].map((item) => (
                  <div key={item} className="border border-white/10 bg-white/10 p-4">
                    <div className="font-display text-2xl font-black text-white">{item}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-300">
                      Supply ready
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
              Product Scope
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              A focused range for welding and cutting supply channels.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supplyScope.map((item) => (
              <div key={item} className="border border-slate-200 bg-slate-50 p-5">
                <div className="h-1 w-16 bg-arc-signal" />
                <h3 className="mt-4 font-display text-xl font-black text-arc-midnight">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Categories
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
                Organized product lines for international sourcing.
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
            >
              Product Center
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                href={`/products/${category.slug}`}
                key={category.slug}
                className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <span className="flex h-12 w-12 items-center justify-center bg-arc-navy font-display text-lg font-black text-arc-signal">
                  {category.code}
                </span>
                <h3 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                  Explore
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
            Hot Products
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
            Featured Welding & Cutting Products
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const category = categoryMap.get(product.categorySlug);

              if (!category) {
                return null;
              }

              return <ProductCard key={product.slug} product={product} category={category} />;
            })}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Why Choose ArcFort Weld
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              Built for buyers who compare, qualify and reorder.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {advantages.map((item) => (
              <div key={item} className="border-l-4 border-arc-signal bg-white p-5 shadow-sm">
                <p className="font-semibold leading-7 text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
            Applications
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
            Industrial use cases for welding and cutting supply.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <Link
                key={application.slug}
                href={`/applications/${application.slug}`}
                className="group bg-arc-midnight p-5 text-white transition hover:-translate-y-1 hover:shadow-industrial"
              >
                <div className="h-1 w-16 bg-arc-signal" />
                <h3 className="mt-5 font-display text-xl font-black">{application.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{application.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-signal group-hover:text-white">
                  View Application
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta
            title="Need a reliable welding parts supplier?"
            description="Send your product list, drawing or sample details. ArcFort Weld will respond with quotation, MOQ and delivery options after technical confirmation."
          />
        </div>
      </section>
    </>
  );
}
