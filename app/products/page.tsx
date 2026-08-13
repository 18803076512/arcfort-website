import Link from "next/link";
import { ProductCatalogTracker } from "@/components/analytics/ProductCatalogTracker";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { ProductFinderForm } from "@/components/products/ProductFinderForm";
import { getAllProductCategories } from "@/lib/content/categories";
import { breadcrumbJsonLd, collectionPageJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import {
  getProductCatalogPage,
  hasProductCatalogParameters,
  type ProductCatalogSearchParams,
} from "@/lib/content/product-search";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";

const productListEmailHref = buildEmailHref({
  subject: "Welding and cutting product list inquiry",
  message:
    "Hello ArcFort Weld, I would like to send a welding and cutting product list for quotation.\n\nProduct categories:\nQuantity by item:\nDestination country:\nDrawing, model or sample references:\nPackaging requirements:",
});

const productListWhatsAppHref = buildWhatsAppHref({
  message:
    "Hello ArcFort Weld, I would like to send a welding and cutting product list for quotation.\n\nProduct categories:\nQuantity by item:\nDestination country:\nDrawing, model or sample references:\nPackaging requirements:",
});

type ProductsPageProps = {
  searchParams: Promise<ProductCatalogSearchParams>;
};

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
    description:
      "Logo, packaging and model customization reviewed after product details are confirmed.",
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

const quickCategoryLinks = [
  {
    label: "MIG/MAG Torch Parts",
    href: "/products/mig-mag-torch-parts",
    scope: "Contact tips, nozzles, diffusers and liners",
    guideHref: "/guides/mig-contact-tip-size-thread-selection",
    guideLabel: "Contact Tip Selection Guide",
  },
  {
    label: "TIG Torch Parts",
    href: "/products/tig-torch-parts",
    scope: "Ceramic cups, collets, gas lenses and torch parts",
    guideHref: "/guides/tig-torch-parts-names-identification-guide",
    guideLabel: "TIG Parts Identification Guide",
  },
  {
    label: "Plasma Cutter Consumables",
    href: "/products/plasma-cutting-consumables",
    scope: "Electrodes, nozzles, shields and swirl rings",
    guideHref: "/guides/plasma-cutter-consumables-parts-guide",
    guideLabel: "Plasma Consumables Parts Guide",
  },
] as const;

const productCenterFaq = [
  {
    question: "What product reference should I provide for a welding or cutting inquiry?",
    answer:
      "Provide the product or component name, ArcFort SKU when available, torch or machine model, and any existing part number. A clear photo, drawing or reference part helps the team review items that use different market terminology.",
  },
  {
    question: "Can I request several product categories in one RFQ?",
    answer:
      "Yes. Distributors and importers can send mixed product lists covering MIG/MAG torch parts, TIG torch parts, plasma cutting consumables, welding consumables, machines and accessories. Include quantity by item and the destination country.",
  },
  {
    question: "How does ArcFort Weld confirm product compatibility?",
    answer:
      "Compatibility is reviewed from the torch or machine model, existing part number, drawing, approved sample or clear product photos. Similar product names do not by themselves confirm fit.",
  },
  {
    question: "Are OEM packaging and small trial orders available?",
    answer:
      "Small trial orders are accepted for standard products. Logo, private label and customized packaging can be discussed after the product list, artwork, quantities and packing requirements are confirmed.",
  },
] as const;

const productCenterMetadata = {
  title: "Welding & Cutting Product Catalog",
  description:
    "Source MIG/MAG and TIG torch parts, plasma cutter consumables, welding machines and accessories. Search ArcFort Weld products or send a mixed B2B RFQ.",
  path: "/products",
  keywords: [
    "welding products",
    "MIG/MAG torch parts",
    "TIG torch parts",
    "plasma cutting consumables",
  ],
} as const;

function buildCatalogHref({
  query,
  categorySlug,
  page,
}: {
  query: string;
  categorySlug: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (categorySlug) {
    params.set("category", categorySlug);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return `${queryString ? `/products?${queryString}` : "/products"}#product-catalog`;
}

function getPaginationPages(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages]);

  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return [...pages].sort((left, right) => left - right);
}

export async function generateMetadata({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;

  return buildMetadata({
    ...productCenterMetadata,
    noIndex: hasProductCatalogParameters(resolvedSearchParams),
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const categories = getAllProductCategories();
  const products = getAllProducts();
  const productsByCategory = new Map(
    categories.map((category) => [
      category.slug,
      products.filter((product) => product.categorySlug === category.slug),
    ]),
  );
  const catalog = getProductCatalogPage({
    products,
    categories,
    searchParams: resolvedSearchParams,
  });
  const paginationPages = getPaginationPages(catalog.currentPage, catalog.totalPages);
  const productCount = products.length;
  const categoryCount = categories.length;
  const hasCatalogParameters = hasProductCatalogParameters(resolvedSearchParams);

  return (
    <>
      {hasCatalogParameters ? (
        <ProductCatalogTracker
          hasQuery={Boolean(catalog.query)}
          queryLength={catalog.query.length}
          categorySlug={catalog.categorySlug}
          resultCount={catalog.totalMatches}
          pageNumber={catalog.currentPage}
        />
      ) : null}
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ])}
      />
      <StructuredData
        data={collectionPageJsonLd({
          name: "ArcFort Weld Welding and Cutting Products",
          description:
            "MIG/MAG and TIG torch parts, plasma cutter consumables, welding machines, consumables and accessories for distributors, importers, repair workshops and OEM buyers.",
          path: "/products",
          image: siteConfig.defaultSeoImage,
          dateModified: siteConfig.contentLastModified,
          items: categories.map((category) => ({
            name: category.title,
            path: `/products/${category.slug}`,
          })),
        })}
      />
      <StructuredData data={faqJsonLd([...productCenterFaq])} />

      <section className="bg-white py-5 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase leading-6 tracking-[0.14em] text-arc-signal sm:tracking-[0.2em]">
              Industrial Product Supply
            </p>
            <h1 className="mt-4 max-w-4xl break-words font-display text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Welding Torch Parts, Plasma Consumables & Equipment
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Search MIG/MAG and TIG torch parts, plasma cutter consumables, welding consumables,
              machines and accessories for distributor, importer, repair and OEM purchasing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#product-finder"
                className="inline-flex w-full items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white sm:w-auto"
              >
                Find Products
              </Link>
              <Link
                href="/rfq"
                className="inline-flex w-full items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Request a Quote
              </Link>
            </div>
          </div>

          <aside className="hidden border border-white/10 bg-white/5 p-5 shadow-industrial lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              Current Supply Scope
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
                  Product items
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

      <section id="product-finder" className="scroll-mt-28 bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Finder
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Welding and cutting product finder
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                ArcFort Weld product records cover common component names, category references and
                SKUs used in distributor purchase lists. Include the torch or machine model and a
                sample photo when market terminology or compatibility is uncertain.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                <a
                  href={productListEmailHref}
                  className="inline-flex min-h-11 flex-1 items-center justify-center border border-arc-blue px-4 text-xs font-bold uppercase tracking-[0.12em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
                >
                  Email Product List
                </a>
                <a
                  href={productListWhatsAppHref}
                  className="inline-flex min-h-11 flex-1 items-center justify-center border border-slate-300 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:border-arc-blue hover:text-arc-blue"
                >
                  WhatsApp Product List
                </a>
              </div>
            </div>

            <ProductFinderForm
              categories={categories.map((category) => ({
                slug: category.slug,
                title: category.title,
                count: productsByCategory.get(category.slug)?.length ?? 0,
              }))}
              categorySlug={catalog.categorySlug}
              hasParameters={hasCatalogParameters}
              productCount={productCount}
              query={catalog.query}
            />
          </div>

          <nav
            aria-label="Welding torch parts and plasma consumables sourcing paths"
            className="mt-8 grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-3"
          >
            {quickCategoryLinks.map((item) => (
              <article
                key={item.href}
                className="flex min-w-0 flex-col bg-white p-5 transition hover:bg-arc-frost"
              >
                <Link
                  href={item.href}
                  className="font-display text-lg font-black text-arc-midnight transition hover:text-arc-blue"
                >
                  {item.label}
                </Link>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{item.scope}</p>
                <div className="mt-5 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center justify-center bg-arc-blue px-3 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-arc-midnight"
                  >
                    View Category
                  </Link>
                  <Link
                    href={item.guideHref}
                    className="inline-flex min-h-11 items-center justify-center border border-arc-blue px-3 text-center text-[11px] font-bold uppercase leading-4 tracking-[0.08em] text-arc-blue transition hover:bg-white"
                  >
                    {item.guideLabel}
                  </Link>
                </div>
              </article>
            ))}
          </nav>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {procurementSteps.map((item) => (
              <article key={item.step} className="border border-slate-200 bg-white p-6 shadow-sm">
                <div className="font-display text-4xl font-black text-arc-blue">{item.step}</div>
                <h3 className="mt-4 font-display text-2xl font-black text-arc-midnight">
                  {item.title}
                </h3>
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
                className="mt-6 inline-flex w-full items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight sm:w-auto"
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
                      <span className="text-right text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
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
              Welding torch consumables and cutting parts often depend on small fit details. A clear
              RFQ helps avoid wrong parts and speeds up quotation review.
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

      <section id="product-catalog" className="scroll-mt-28 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Records
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Available welding and cutting products
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Review published products and add relevant items to your RFQ shortlist. Technical
                fit is confirmed from a model, drawing, sample or reference part before quotation.
              </p>
            </div>
            <Link
              href="#product-finder"
              className="inline-flex w-full items-center justify-center border border-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white sm:w-auto"
            >
              Change Search
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-arc-midnight">
                {catalog.totalMatches === 0
                  ? "No matching products"
                  : `Showing ${catalog.startIndex}-${catalog.endIndex} of ${catalog.totalMatches} products`}
              </p>
              {catalog.query || catalog.selectedCategory ? (
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {catalog.query ? `Search: "${catalog.query}"` : "All product names"}
                  {catalog.selectedCategory
                    ? ` | Category: ${catalog.selectedCategory.title}`
                    : " | All categories"}
                </p>
              ) : (
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  All active product records
                </p>
              )}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
              Page {catalog.currentPage} of {catalog.totalPages}
            </p>
          </div>

          {catalog.items.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.items.map(({ product, category }) => (
                <ProductCard key={product.slug} product={product} category={category} />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid gap-6 border border-slate-200 bg-arc-frost p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h3 className="font-display text-2xl font-black text-arc-midnight">
                  Send the product reference for review
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  The requested item may use a different market name or may not be published yet.
                  Send the SKU, drawing, current part photo, model reference and quantity for
                  quotation review.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href={`/rfq?product=${encodeURIComponent(
                    catalog.query || catalog.selectedCategory?.title || "Product reference",
                  )}`}
                  className="inline-flex min-h-12 items-center justify-center bg-arc-blue px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
                >
                  Send Product RFQ
                </Link>
                <Link
                  href="/products#product-catalog"
                  className="inline-flex min-h-12 items-center justify-center border border-arc-blue px-6 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
                >
                  View All Products
                </Link>
              </div>
            </div>
          )}

          {catalog.totalPages > 1 ? (
            <nav
              aria-label="Product catalog pagination"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              {catalog.currentPage > 1 ? (
                <Link
                  href={buildCatalogHref({
                    query: catalog.query,
                    categorySlug: catalog.categorySlug,
                    page: catalog.currentPage - 1,
                  })}
                  rel="prev"
                  className="inline-flex min-h-11 items-center justify-center border border-slate-300 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:border-arc-blue hover:text-arc-blue"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex min-h-11 items-center justify-center border border-slate-200 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Previous
                </span>
              )}

              {paginationPages.map((page, index) => [
                index > 0 && page - paginationPages[index - 1] > 1 ? (
                  <span
                    key={`gap-${page}`}
                    className="inline-flex h-11 w-8 items-center justify-center text-slate-400"
                  >
                    ...
                  </span>
                ) : null,
                <Link
                  key={page}
                  href={buildCatalogHref({
                    query: catalog.query,
                    categorySlug: catalog.categorySlug,
                    page,
                  })}
                  aria-current={page === catalog.currentPage ? "page" : undefined}
                  aria-label={`Product page ${page}`}
                  className={
                    page === catalog.currentPage
                      ? "inline-flex h-11 w-11 items-center justify-center bg-arc-midnight text-sm font-black text-white"
                      : "inline-flex h-11 w-11 items-center justify-center border border-slate-300 text-sm font-bold text-slate-700 transition hover:border-arc-blue hover:text-arc-blue"
                  }
                >
                  {page}
                </Link>,
              ])}

              {catalog.currentPage < catalog.totalPages ? (
                <Link
                  href={buildCatalogHref({
                    query: catalog.query,
                    categorySlug: catalog.categorySlug,
                    page: catalog.currentPage + 1,
                  })}
                  rel="next"
                  className="inline-flex min-h-11 items-center justify-center border border-slate-300 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:border-arc-blue hover:text-arc-blue"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex min-h-11 items-center justify-center border border-slate-200 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Next
                </span>
              )}
            </nav>
          ) : null}
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <FaqSection items={[...productCenterFaq]} title="Product Sourcing FAQ" />
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
