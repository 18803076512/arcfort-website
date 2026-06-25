import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { getAllApplications } from "@/lib/content/applications";
import { getAllProductCategories } from "@/lib/content/categories";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

export const metadata = buildMetadata({
  title: "Industrial Welding & Cutting Solutions",
  description:
    "ArcFort Weld supplies welding and cutting machines, MIG/MAG and TIG torch parts, plasma cutting consumables and OEM welding accessories for overseas buyers.",
  path: "/",
  keywords: [
    "industrial welding solutions",
    "welding torch parts supplier",
    "plasma cutting consumables",
    "MIG MAG torch parts",
    "TIG torch parts",
  ],
});

const advantages = [
  "Stable supply for repeat purchasing",
  "OEM, private label and packaging support",
  "Export packing for international shipments",
  "Fast response for technical RFQ review",
  "Product customization by drawing or reference part",
];

const supplyScope = [
  "MIG/MAG Torch Parts",
  "TIG Torch Parts",
  "Plasma Cutting Consumables",
  "Welding Consumables",
  "Welding & Cutting Machines",
  "Welding Accessories",
];

const heroSupplySignals = [
  "MIG/MAG Torch Parts",
  "TIG Torch Parts",
  "Plasma Cutting Consumables",
  "OEM Welding Accessories",
] as const;

const oemServiceItems = [
  "Logo printing and private label packaging",
  "Carton design for distributor programs",
  "Product model customization by buyer requirement",
  "Quotation by drawing, product photo or reference part",
] as const;

const tradeHighlights = [
  { label: "Main Port", value: siteConfig.mainPort },
  { label: "Payment", value: siteConfig.paymentTerms },
  { label: "MOQ", value: siteConfig.moqPolicy },
  { label: "Lead Time", value: siteConfig.leadTime },
] as const;

const rfqSignals = [
  "Product name, model, size and quantity",
  "Drawing, sample photo or reference part",
  "Packaging, label and destination country",
] as const;

const sourcingSystemLinks = [
  {
    href: "/oem-service",
    title: "OEM & Private Label",
    description:
      "Logo printing, private label packaging and model customization reviewed by confirmed product details.",
  },
  {
    href: "/quality-control",
    title: "Quality Control",
    description:
      "Incoming, production, packaging and outgoing inspection flow for stable export supply.",
  },
  {
    href: "/shipping-payment",
    title: "Shipping & Payment",
    description:
      "Main port, payment term, MOQ policy and lead time information for quotation planning.",
  },
  {
    href: "/downloads",
    title: "Catalog & RFQ Documents",
    description:
      "Request product catalogs, data sheets and RFQ document support based on confirmed product data.",
  },
] as const;

export default function Home() {
  const categories = getAllProductCategories();
  const products = getAllProducts();
  const applications = getAllApplications();
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return (
    <>
      <section className="relative isolate overflow-hidden bg-arc-midnight text-white">
        <Image
          src="/images/site/arcfort-hero-welding-workshop.png"
          alt="ArcFort Weld welding and cutting workshop with torch consumables"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,15,28,0.98)_0%,rgba(7,21,36,0.92)_42%,rgba(7,21,36,0.58)_72%,rgba(7,21,36,0.32)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_24%,rgba(56,189,248,0.22),transparent_34%),linear-gradient(180deg,rgba(7,21,36,0.1),rgba(7,21,36,0.82))]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex border-l-4 border-arc-signal bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-arc-signal">
              ArcFort Weld | Welding & Cutting Solutions
            </p>
            <h1 className="font-display text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
              Industrial Welding & Cutting Solutions
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">
              Renqiu Ailesen Welding Technology Co., Ltd. supplies welding and cutting machines,
              MIG/MAG torch parts, TIG torch parts, plasma cutting consumables and OEM welding
              accessories for distributors, importers and industrial users.
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
            <div className="mt-6 flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:gap-5">
              <a href={siteConfig.emailHref} className="font-semibold hover:text-white">
                Email: {siteConfig.email}
              </a>
              <a href={siteConfig.whatsappHref} className="font-semibold hover:text-white">
                WhatsApp: {siteConfig.whatsapp}
              </a>
            </div>
          </div>

          <div className="mt-12 grid gap-px border border-white/15 bg-white/15 shadow-industrial sm:grid-cols-2 lg:grid-cols-4">
            {heroSupplySignals.map((item) => (
              <div key={item} className="bg-arc-midnight/65 p-4 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
                  Supply Scope
                </p>
                <p className="mt-2 font-display text-lg font-black text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 border border-slate-200 bg-arc-frost p-5 shadow-sm sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Fast RFQ Preparation
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Send product lists, drawings or sample photos for quotation review.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                A clear RFQ helps ArcFort Weld confirm fit, packaging, MOQ and delivery options
                without unnecessary back-and-forth.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {rfqSignals.map((item) => (
                <div key={item} className="border-l-4 border-arc-signal bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
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
              Welding Torch Consumables and Cutting Parts
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
                Industrial Welding Product Supply
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
            Featured Products
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
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div className="relative min-h-[320px] overflow-hidden border border-slate-200 bg-arc-midnight shadow-industrial sm:min-h-[420px]">
            <Image
              src="/images/site/arcfort-oem-consumables-workbench.png"
              alt="Welding torch consumables arranged for OEM packaging and quotation review"
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,36,0.02),rgba(7,21,36,0.78))]" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
                OEM Review
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-100">
                Samples, drawings, product photos and packaging requirements help confirm
                quotation details before production.
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              OEM Service
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              OEM welding products and packaging support for overseas buyers.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              ArcFort Weld supports product customization, logo printing, private label packaging
              and carton design after product details, quantity and artwork requirements are
              confirmed.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {oemServiceItems.map((item) => (
              <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-5">
                <p className="text-sm font-semibold leading-6 text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-midnight py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Supplier System
            </p>
            <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">
              Built for industrial buyers who need clear information before inquiry.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Mature B2B sourcing depends on product scope, OEM options, quality checkpoints,
              shipping terms and accessible documents. ArcFort Weld keeps these paths visible so
              distributors and importers can qualify the supply fit quickly.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {sourcingSystemLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-arc-signal hover:bg-white/10"
              >
                <div className="h-1 w-16 bg-arc-signal" />
                <h3 className="mt-5 font-display text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-signal group-hover:text-white">
                  View Details
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Export Terms
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              Clear shipping and payment information for RFQ review.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {tradeHighlights.map((item) => (
              <article key={item.label} className="border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                  {item.label}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.value}</p>
              </article>
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
            description="Send your product list, drawing, product photo or reference part details. ArcFort Weld will respond with quotation, MOQ and delivery options after technical confirmation."
          />
        </div>
      </section>
    </>
  );
}
