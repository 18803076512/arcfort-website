import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllProductCategories } from "@/lib/content/categories";
import { breadcrumbJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";

const rfqChecklist = [
  "Product name, SKU, model or reference part",
  "Size, thread, material and package requirement",
  "Compatible torch, machine model or drawing when available",
  "Quantity, destination country and expected delivery schedule",
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
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Center
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                Industrial welding product supply for B2B buyers.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                ArcFort Weld organizes welding consumables and cutting parts for distributors,
                importers, OEM buyers and industrial users that need clear RFQ communication.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="border border-slate-200 bg-arc-frost p-4">
                  <div className="font-display text-3xl font-black text-arc-blue">
                    {categoryCount}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Product Categories
                  </div>
                </div>
                <div className="border border-slate-200 bg-arc-frost p-4">
                  <div className="font-display text-3xl font-black text-arc-blue">
                    {productCount}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Current RFQ Products
                  </div>
                </div>
              </div>
            </div>
            <div className="border-l-4 border-arc-signal bg-arc-frost p-6">
              <h2 className="font-display text-2xl font-black text-arc-midnight">
                Welding Torch Consumables and Cutting Parts
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                The product center helps buyers compare categories, review specification fields,
                confirm compatibility information and submit clear RFQs for quotation follow-up.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
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
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Categories
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Product Categories
              </h2>
            </div>
            <Link
              href="/rfq"
              className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
            >
              Send RFQ
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products/${category.slug}`}
                className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center bg-arc-midnight font-display text-lg font-black text-arc-signal">
                    {category.code}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Category
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                  View Products
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Support
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Service pages that help buyers qualify the supplier.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {buyerServiceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <div className="h-1 w-16 bg-arc-signal" />
                <h3 className="mt-5 font-display text-xl font-black text-arc-midnight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                  View Details
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
            Featured Products
          </p>
          <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
            Welding and cutting products for RFQ review
          </h2>
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
