import Link from "next/link";
import { ProductCatalogTracker } from "@/components/analytics/ProductCatalogTracker";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductGrid } from "@/components/content/ProductGrid";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { ProductSystemCard } from "@/components/home/ProductSystemCard";
import { ProductFinderForm } from "@/components/products/ProductFinderForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homepageProductSystems } from "@/content/homepage";
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

type ProductsPageProps = {
  searchParams: Promise<ProductCatalogSearchParams>;
};

const productListMessage =
  "Hello ArcFort Weld, I would like to send a welding and cutting product list for quotation.\n\nProduct categories:\nQuantity by item:\nDestination country:\nDrawing, model or sample references:\nPackaging requirements:";

const productListEmailHref = buildEmailHref({
  subject: "Welding and cutting product list inquiry",
  message: productListMessage,
});

const productListWhatsAppHref = buildWhatsAppHref({ message: productListMessage });

const procurementSteps = [
  {
    step: "01",
    title: "Identify the product",
    description:
      "Use the product name, SKU, torch or machine model, and an existing part reference where available.",
  },
  {
    step: "02",
    title: "Confirm the technical fit",
    description:
      "Share dimensions, thread, material, drawings, sample photos or an approved reference part.",
  },
  {
    step: "03",
    title: "Define the order",
    description:
      "Add quantity by item, packaging or OEM requirements, destination country and delivery target.",
  },
] as const;

const buyerServiceLinks = [
  { href: "/products/welding-machines", label: "Welding Machines" },
  {
    href: "/guides/welding-machine-sourcing-checklist",
    label: "Machine Sourcing Checklist",
  },
  { href: "/oem-service", label: "OEM / ODM" },
  { href: "/quality-control", label: "Quality Control" },
  { href: "/shipping-payment", label: "Shipping & Payment" },
  { href: "/downloads", label: "Catalogs & RFQ Tools" },
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

  if (query) params.set("q", query);
  if (categorySlug) params.set("category", categorySlug);
  if (page > 1) params.set("page", String(page));

  const queryString = params.toString();
  return `${queryString ? `/products?${queryString}` : "/products"}#product-catalog`;
}

function getPaginationPages(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages]);

  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) pages.add(page);
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
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
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

      <div className="border-b border-arc-line bg-white py-5">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="py-12 sm:py-16 lg:py-20">
          <p className="section-eyebrow !text-slate-300">Industrial Product Supply</p>
          <h1 className="mt-4 max-w-5xl font-display text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
            Welding Torch Parts, Cutting Consumables & Equipment
          </h1>
          <p className="body-large mt-6 max-w-3xl !text-slate-300">
            Source MIG/MAG and TIG torch parts, plasma cutting consumables, welding machines,
            consumables and workshop accessories for distribution, repair, industrial use and OEM
            purchasing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#product-finder" className="w-full sm:w-auto">
              Find Products
            </ButtonLink>
            <ButtonLink href="/rfq" variant="onDark" className="w-full sm:w-auto">
              Request a Quote
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Section id="product-finder" labelledBy="product-finder-title" className="bg-white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <SectionHeading
                id="product-finder-title"
                eyebrow="Product Finder"
                title="Search by product, component or SKU."
                description="Use the closest known reference. A torch label, drawing, sample photo or existing part helps confirm products that use different market names."
              />
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
                <a href={productListEmailHref} className="text-arc-blue hover:text-arc-copper">
                  Email a product list
                </a>
                <a href={productListWhatsAppHref} className="text-arc-blue hover:text-arc-copper">
                  Send by WhatsApp
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
              productCount={products.length}
              query={catalog.query}
            />
          </div>
        </Container>
      </Section>

      <Section
        id="product-categories"
        labelledBy="product-categories-title"
        className="bg-arc-frost"
      >
        <Container>
          <SectionHeading
            id="product-categories-title"
            eyebrow="Product Systems"
            title="Browse by welding and cutting process."
            description="Move from equipment and torch assemblies to front-end parts, replacement consumables and workshop accessories."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {homepageProductSystems.map((system) => {
              const category = categoryMap.get(system.categorySlug);
              if (!category) return null;

              return (
                <ProductSystemCard
                  key={system.categorySlug}
                  href={`/products/${system.categorySlug}`}
                  title={system.systemName}
                  range={system.range}
                  image={system.image}
                  alt={`${system.systemName} product range from ArcFort Weld`}
                />
              );
            })}
          </div>
        </Container>
      </Section>

      <Section id="product-catalog" labelledBy="product-catalog-title" className="bg-white">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="product-catalog-title"
              eyebrow="Product Catalog"
              title="Published products available for inquiry."
              description="Review current product records and add relevant items to an RFQ. Final fit is checked from the requested model, drawing, sample or reference part."
            />
            <ButtonLink href="#product-finder" variant="secondary" className="w-full lg:w-auto">
              Change Search
            </ButtonLink>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-y border-arc-line py-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-bold text-arc-midnight">
                {catalog.totalMatches === 0
                  ? "No matching products"
                  : `Showing ${catalog.startIndex}-${catalog.endIndex} of ${catalog.totalMatches} products`}
              </p>
              {catalog.query || catalog.selectedCategory ? (
                <p className="mt-1 text-sm text-slate-500">
                  {catalog.query ? `Search: “${catalog.query}”` : "All product names"}
                  {catalog.selectedCategory
                    ? ` | Category: ${catalog.selectedCategory.title}`
                    : " | All categories"}
                </p>
              ) : null}
            </div>
            <p className="caption">
              Page {catalog.currentPage} of {catalog.totalPages}
            </p>
          </div>

          {catalog.items.length > 0 ? (
            <ProductGrid items={catalog.items} className="mt-8" />
          ) : (
            <div className="mt-8 border-l-4 border-arc-signal bg-arc-frost p-6 sm:p-8">
              <h3 className="font-display text-2xl font-black text-arc-midnight">
                Send the product reference for review
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                The item may use another market name or may not be published yet. Send the SKU,
                drawing, current part photo, model reference and quantity for quotation review.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href={`/rfq?product=${encodeURIComponent(
                    catalog.query || catalog.selectedCategory?.title || "Product reference",
                  )}`}
                  className="w-full sm:w-auto"
                >
                  Send Product RFQ
                </ButtonLink>
                <ButtonLink
                  href="/products#product-catalog"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  View All Products
                </ButtonLink>
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
                  className="button-base button-secondary min-h-11 px-4"
                >
                  Previous
                </Link>
              ) : null}

              {paginationPages.map((page, index) => [
                index > 0 && page - paginationPages[index - 1] > 1 ? (
                  <span
                    key={`gap-${page}`}
                    className="flex h-11 w-8 items-center justify-center text-slate-400"
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
                      ? "flex h-11 w-11 items-center justify-center bg-arc-midnight text-sm font-black text-white"
                      : "flex h-11 w-11 items-center justify-center border border-arc-line text-sm font-bold text-slate-700 hover:border-arc-blue hover:text-arc-blue"
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
                  className="button-base button-secondary min-h-11 px-4"
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </Container>
      </Section>

      <Section labelledBy="rfq-preparation-title" className="border-y border-arc-line bg-arc-frost">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <SectionHeading
              id="rfq-preparation-title"
              eyebrow="RFQ Preparation"
              title="Provide enough detail for a useful quotation."
              description="Small fit differences matter in torch and cutting consumables. These three checks reduce avoidable product mismatches."
            />
            <ol className="border-t-2 border-arc-midnight">
              {procurementSteps.map((item) => (
                <li
                  key={item.step}
                  className="grid gap-3 border-b border-arc-line py-5 sm:grid-cols-[3rem_12rem_1fr] sm:items-start"
                >
                  <span className="font-display text-xl font-black text-arc-blue">{item.step}</span>
                  <h3 className="font-display text-lg font-black text-arc-midnight">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
          <nav
            aria-label="Product sourcing support"
            className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-arc-line pt-6"
          >
            {buyerServiceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-arc-blue hover:text-arc-copper"
              >
                {item.label} <span aria-hidden="true">&rarr;</span>
              </Link>
            ))}
          </nav>
        </Container>
      </Section>

      <Section labelledBy="product-faq-title" className="bg-white">
        <Container className="max-w-5xl">
          <FaqSection items={[...productCenterFaq]} title="Product Sourcing FAQ" />
        </Container>
      </Section>

      <Section className="bg-arc-frost">
        <Container>
          <RfqCta />
        </Container>
      </Section>
    </>
  );
}
