import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllProductCategories } from "@/lib/content/categories";
import { breadcrumbJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const rfqChecklist = [
  "Product name, SKU, model or reference part",
  "Size, thread, material and package requirement",
  "Compatible torch, machine model or drawing when available",
  "Quantity, destination country and expected delivery schedule",
] as const;

const procurementSteps = [
  {
    step: "01",
    title: "Choose product family",
    description:
      "Start from MIG/MAG, TIG, plasma cutting, welding consumables, machines or accessories.",
  },
  {
    step: "02",
    title: "Confirm technical fit",
    description:
      "Use sample photos, drawings, model numbers or reference parts to avoid wrong consumables.",
  },
  {
    step: "03",
    title: "Send RFQ details",
    description:
      "Share quantity, packaging, destination country and delivery expectation for quotation review.",
  },
] as const;

const buyerServiceLinks = [
  {
    href: "/oem-service",
    title: "OEM & Private Label",
    description: "Logo, packaging and model customization reviewed after product details are confirmed.",
  },
  {
    href: "/quality-control",
    title: "Quality Control",
    description: "Inspection flow for materials, production, packaging and outgoing shipment.",
  },
  {
    href: "/shipping-payment",
    title: "Shipping & Payment",
    description: "Main port, payment term, MOQ policy and lead time for export RFQs.",
  },
  {
    href: "/downloads",
    title: "Catalog Request",
    description: "Request category catalogs or product data sheets based on confirmed models.",
  },
] as const;

const buyerSignals = [
  { label: "Main Port", value: "Tianjin Port" },
  { label: "Payment", value: "T/T payment terms" },
  { label: "OEM", value: "Logo and packaging" },
  { label: "Lead Time", value: "7-20 working days" },
] as const;

export const metadata = buildMetadata({
  title: "Product Center",
  description:
    "Explore ArcFort Weld welding and cutting product categories for industrial B2B buyers, distributors, importers and repair workshops.",
  path: "/products",
  keywords: [
    "welding products",
    "MIG/MAG torch parts",
    "TIG torch parts",
    "plasma cutting consumables",
  ],
});

export default function ProductsPage() {
  const categories = getAllProductCategories();
  const products = getAllProducts();
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const productsByCategory = new Map(
    categories.map((category) => [
      category.slug,
      products.filter((product) => product.categorySlug === category.slug),
    ]),
  );
  const productCount = products.length;
  const categoryCount = categories.length;

  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ])}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Product Center
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Welding and cutting products organized for overseas B2B sourcing.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              ArcFort Weld helps distributors, importers, wholesalers, repair workshops and OEM
              buyers review welding torch consumables, cutting parts, machines and accessories
              before sending a clear RFQ.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#product-categories"
                className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white"
              >
                View Categories
              </Link>
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10"
              >
                Request a Quote
              </Link>
            </div>
          </div>

          <aside className="border border-white/10 bg-white/5 p-5 shadow-industrial">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              RFQ-ready scope
            </p>
            <div className="mt-5 grid grid-cols-2 gap-px border border-white/10 bg-white/10">
              <div className="bg-arc-midnight p-4">
                <div className="font-display text-4xl font-black text-arc-signal">
                  {categoryCount}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
                  Categories
                </div>
              </div>
              <div className="bg-arc-midnight p-4">
                <div className="font-display text-4xl font-black text-arc-signal">
                  {productCount}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
                  Product records
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {buyerSignals.map((item) => (
                <div key={item.label} className="border-l-4 border-arc-signal bg-white/5 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {procurementSteps.map((item) => (
              <article key={item.step} className="border border-slate-200 bg-white p-6 shadow-sm">
                <div className="font-display text-4xl font-black text-arc-blue">{item.step}</div>
                <h2 className="mt-4 font-display text-2xl font-black text-arc-midnight">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product-categories" className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Category Selection
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Product Categories
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Choose the closest category first. If compatibility or dimensions are not confirmed,
                send a photo, drawing or sample detail and the product can be reviewed before quote.
              </p>
              <Link
                href="/rfq"
                className="mt-6 inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
              >
                Send Mixed RFQ
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {categories.map((category) => {
                const categoryProducts = productsByCategory.get(category.slug) ?? [];

                return (
                  <article
                    key={category.slug}
                    className="border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-12 w-12 items-center justify-center bg-arc-midnight font-display text-lg font-black text-arc-signal">
                        {category.code}
                      </span>
                      <span className="text-right text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        {categoryProducts.length} products
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                      {category.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                    <div className="mt-5 grid gap-2">
                      {category.productRange.slice(0, 2).map((item) => (
                        <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-3">
                          <p className="text-xs font-semibold leading-5 text-slate-700">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/products/${category.slug}`}
                        className="inline-flex flex-1 items-center justify-center bg-arc-blue px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
                      >
                        View Products
                      </Link>
                      <Link
                        href={`/rfq?product=${encodeURIComponent(category.title)}`}
                        className="inline-flex flex-1 items-center justify-center border border-arc-blue px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
                      >
                        Category RFQ
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              RFQ Checklist
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Prepare these details for faster quotation.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Welding torch consumables and cutting parts often depend on small fit details. A
              clear RFQ helps avoid wrong parts and speeds up quotation review.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {rfqChecklist.map((item) => (
              <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-5">
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-midnight py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Buyer Support
            </p>
            <h2 className="mt-3 font-display text-3xl font-black">
              Service pages that help buyers qualify the supplier.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Export buyers usually check OEM support, inspection steps, shipping terms and
              available documents before starting repeat purchasing.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {buyerServiceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-arc-signal hover:bg-white/10"
              >
                <div className="h-1 w-16 bg-arc-signal" />
                <h3 className="mt-5 font-display text-xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-signal group-hover:text-white">
                  View Details
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Records
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Current welding and cutting products for RFQ review
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Product pages use confirmed fields where available and keep unconfirmed technical
                data buyer-friendly until samples, drawings or model references are reviewed.
              </p>
            </div>
            <a
              href={siteConfig.emailHref}
              className="inline-flex items-center justify-center border border-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
            >
              Email Product List
            </a>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta />
        </div>
      </section>
    </>
  );
}
