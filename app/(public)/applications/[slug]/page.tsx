import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerResourceLinks } from "@/components/content/BuyerResourceLinks";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductGrid } from "@/components/content/ProductGrid";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllApplications, getApplicationBySlug } from "@/lib/content/applications";
import { getAllProductCategories, getRelatedCategories } from "@/lib/content/categories";
import { applicationWebPageJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { getDisplayEligibleProductImageAssets } from "@/lib/content/product-images";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { getPreferredSeoImage } from "@/lib/content/seo-images";
import type { Product, ProductCategory } from "@/lib/content/schemas";

type ApplicationRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const sectionLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Product Systems", href: "#product-systems" },
  { label: "Selection & RFQ", href: "#selection" },
  { label: "Products", href: "#related-products" },
  { label: "FAQ", href: "#faq" },
] as const;

export function generateStaticParams() {
  return getAllApplications().map((application) => ({
    slug: application.slug,
  }));
}

export async function generateMetadata({ params }: ApplicationRouteProps) {
  const { slug } = await params;
  const application = getApplicationBySlug(slug);

  if (!application) {
    return {};
  }

  const relatedProducts = getAllProducts().filter((product) =>
    application.relatedProductSlugs.includes(product.slug),
  );

  return buildMetadata({
    title: application.seoTitle,
    description: application.seoDescription,
    path: `/applications/${application.slug}`,
    keywords: application.keywords,
    image: getPreferredSeoImage(relatedProducts),
  });
}

export default async function ApplicationDetailPage({ params }: ApplicationRouteProps) {
  const { slug } = await params;
  const application = getApplicationBySlug(slug);

  if (!application) {
    notFound();
  }

  const categoryMap = new Map(
    getAllProductCategories().map((category) => [category.slug, category]),
  );
  const relatedCategories = getRelatedCategories(application.relatedCategorySlugs);
  const relatedProducts = getAllProducts()
    .filter((product) => application.relatedProductSlugs.includes(product.slug))
    .map((product) => {
      const category = categoryMap.get(product.categorySlug);

      if (!category) {
        return null;
      }

      return { product, category };
    })
    .filter((item): item is { product: Product; category: ProductCategory } => Boolean(item));
  const seoImage = getPreferredSeoImage(relatedProducts.map((item) => item.product));
  const heroVisual = relatedProducts
    .map(({ product }) => ({
      product,
      asset: getDisplayEligibleProductImageAssets(product)[0],
    }))
    .find(({ asset }) => Boolean(asset));
  const rfqPrompt = [
    `Application: ${application.title}`,
    "Working process / equipment:",
    "Product or current part reference:",
    "Quantity:",
    "Packaging requirement:",
    "Destination country:",
  ].join("\n");
  const rfqHref = `/rfq?product=${encodeURIComponent(rfqPrompt)}`;

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Applications", path: "/applications" },
            { name: application.title, path: `/applications/${application.slug}` },
          ]),
          applicationWebPageJsonLd(application, seoImage),
          faqJsonLd(application.faq),
        ]}
      />

      <div className="border-b border-arc-line bg-white py-4">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Applications", href: "/applications" },
              { label: application.title },
            ]}
          />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="grid min-h-[610px] gap-10 py-14 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
          <div>
            <p className="section-eyebrow !text-slate-300">Industrial Application</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-[1.06] text-white sm:text-5xl lg:text-6xl">
              {application.title}
            </h1>
            <p className="body-large mt-6 max-w-2xl text-slate-200">{application.description}</p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
              {application.overview}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={rfqHref}>Prepare an Application RFQ</ButtonLink>
              <ButtonLink href="#product-systems" variant="onDark">
                View Product Systems
              </ButtonLink>
            </div>
          </div>

          <div className="relative aspect-[5/4] overflow-hidden bg-white">
            {heroVisual?.asset ? (
              <Image
                src={heroVisual.asset.publicPath}
                alt={`${heroVisual.product.title} product reference for ${application.title}`}
                fill
                priority
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-contain p-8 sm:p-12"
                quality={90}
              />
            ) : (
              <div
                data-nosnippet
                className="flex h-full items-center justify-center bg-arc-frost p-8 text-center text-arc-midnight"
              >
                <div>
                  <span className="mx-auto flex h-14 w-14 items-center justify-center border border-arc-midnight bg-white font-display text-xl font-black">
                    AF
                  </span>
                  <p className="mt-4 text-sm font-semibold">
                    Product reference available on request
                  </p>
                </div>
              </div>
            )}
            <p
              data-nosnippet
              className="absolute bottom-0 left-0 right-0 bg-arc-midnight/90 px-4 py-3 text-xs font-semibold text-slate-200"
            >
              Related product reference for application sourcing
            </p>
          </div>
        </Container>
      </section>

      <nav
        data-nosnippet
        aria-label="Application page sections"
        className="sticky top-[var(--header-height)] z-30 border-b border-arc-line bg-white/95 backdrop-blur"
      >
        <Container className="overflow-x-auto">
          <div className="flex min-w-max gap-7 py-4">
            {sectionLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-slate-600 transition hover:text-arc-blue"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </Container>
      </nav>

      <Section id="overview" labelledBy="overview-title" className="scroll-mt-32 bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
          <div>
            <SectionHeading
              id="overview-title"
              eyebrow="Operating Context"
              title="Define the work before selecting the part."
              description="Application requirements help narrow the product family. Exact fit still depends on the installed equipment, current component and buyer evidence."
            />
            <p className="mt-7 text-sm font-semibold text-arc-midnight">
              Typical environments: {application.industries.join(" / ")}
            </p>
          </div>
          <ol className="divide-y divide-arc-line border-y border-arc-line">
            {application.operatingContext.map((context, index) => (
              <li key={context} className="grid gap-3 py-6 sm:grid-cols-[64px_1fr] sm:gap-6">
                <span className="font-display text-2xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-base font-semibold leading-7 text-slate-700">{context}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {application.buyerResourceSection ? (
        <BuyerResourceLinks
          id="application-buyer-resources"
          {...application.buyerResourceSection}
        />
      ) : null}

      <Section
        id="product-systems"
        labelledBy="product-systems-title"
        className="scroll-mt-32 border-y border-arc-line bg-arc-frost"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <SectionHeading
              id="product-systems-title"
              eyebrow="Product Systems"
              title="Relevant product families for this application."
              description="Use the category references to compare product types and prepare a line-by-line inquiry. Compatibility is reviewed from model, drawing, sample or measured reference."
            />
            <div className="divide-y divide-arc-line border-y border-arc-line">
              {relatedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products/${category.slug}`}
                  className="group grid gap-3 py-6 sm:grid-cols-[96px_1fr_auto] sm:items-center sm:gap-6"
                >
                  <span className="caption text-arc-blue">{category.code}</span>
                  <div>
                    <h2 className="font-display text-xl font-black text-arc-midnight group-hover:text-arc-blue">
                      {category.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                  </div>
                  <span className="text-sm font-bold text-arc-blue" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section id="selection" labelledBy="selection-title" className="scroll-mt-32 bg-white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <SectionHeading
              id="selection-title"
              eyebrow="Selection & Evidence"
              title="Control the details that affect quotation accuracy."
              description="These are purchasing checkpoints, not product specifications. Send the available evidence and leave uncertain technical values for review."
            />
            <dl className="divide-y divide-arc-line border-y border-arc-line">
              {application.selectionConsiderations.map((item) => (
                <div key={item.label} className="grid gap-2 py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
                  <dt className="font-bold text-arc-midnight">{item.label}</dt>
                  <dd className="text-sm leading-7 text-slate-600">{item.guidance}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-14 grid overflow-hidden border border-arc-line lg:grid-cols-[1.25fr_0.75fr]">
            <div className="bg-arc-frost p-6 sm:p-8">
              <p className="section-eyebrow">Application RFQ Checklist</p>
              <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight sm:text-3xl">
                Information to include with your inquiry
              </h2>
              <ol className="mt-7 divide-y divide-arc-line border-y border-arc-line">
                {application.rfqFields.map((field, index) => (
                  <li key={field} className="grid grid-cols-[36px_1fr] gap-3 py-4">
                    <span className="font-display font-black text-arc-blue">{index + 1}</span>
                    <span className="text-sm font-semibold leading-6 text-slate-700">{field}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col justify-between bg-arc-midnight p-6 text-white sm:p-8">
              <div>
                <p className="caption text-slate-300">Quotation Preparation</p>
                <h2 className="mt-3 font-display text-2xl font-black">
                  Partial information is welcome for an initial review.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Final product fit, commercial terms and delivery schedule depend on the confirmed
                  line items and order requirements.
                </p>
              </div>
              <ButtonLink href={rfqHref} className="mt-8 w-full">
                Send Application RFQ
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <Section
        id="related-products"
        labelledBy="related-products-title"
        className="scroll-mt-32 border-y border-arc-line bg-arc-frost"
      >
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              id="related-products-title"
              eyebrow="Product References"
              title="Related welding and cutting products"
              description="Use these records as product-family references. Confirm the exact model, size and fit before ordering."
            />
            <ButtonLink href="/products" variant="secondary" className="shrink-0">
              View Product Center
            </ButtonLink>
          </div>
          <ProductGrid items={relatedProducts} className="mt-10" />
        </Container>
      </Section>

      <Section id="faq" className="scroll-mt-32 bg-white">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <FaqSection items={application.faq} title={`${application.title} FAQ`} />
          <RfqCta
            title={`Discuss your ${application.title.toLowerCase()} requirements.`}
            description="Send the application, equipment or current part reference, quantity, packing requirement and destination for review."
            productName={application.title}
            rfqPrompt={rfqPrompt}
          />
        </Container>
      </Section>
    </>
  );
}
