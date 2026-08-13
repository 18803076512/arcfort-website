import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { WeldingMachineRfqBuilder } from "@/components/products/WeldingMachineRfqBuilder";
import { getAllProductCategories, getRelatedCategories } from "@/lib/content/categories";
import { getAllGuides, getGuideBySlug } from "@/lib/content/guides";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { getPreferredSeoImage } from "@/lib/content/seo-images";
import { absoluteUrl, siteConfig } from "@/lib/content/site";
import type { Product, ProductCategory } from "@/lib/content/schemas";

type GuideRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const rfqReviewPoints = [
  "Do not guess unknown technical values",
  "Confirm compatibility by model, drawing, sample or reference part",
  "Include quantity, packaging and destination country",
  "Keep OEM, certification and exact rating claims document-based",
] as const;

const guideDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

function formatGuideDate(value: string) {
  return guideDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function getSectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuideRouteProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {};
  }

  const relatedProducts = getAllProducts().filter((product) =>
    guide.productSlugs.includes(product.slug),
  );

  return buildMetadata({
    title: guide.seoTitle,
    description: guide.seoDescription,
    path: `/guides/${guide.slug}`,
    keywords: guide.keywords,
    type: "article",
    image: getPreferredSeoImage(relatedProducts),
    publishedTime: guide.publishedDate,
    modifiedTime: guide.modifiedDate,
    authors: [absoluteUrl("/about")],
    section: "Welding and cutting buyer guides",
    tags: guide.keywords,
  });
}

export default async function GuideDetailPage({ params }: GuideRouteProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const categoryMap = new Map(
    getAllProductCategories().map((category) => [category.slug, category]),
  );
  const allGuides = getAllGuides();
  const relatedCategories = getRelatedCategories(guide.categorySlugs);
  const guideCategorySlugs = new Set(guide.categorySlugs);
  const relatedGuides = allGuides
    .filter((candidate) => candidate.slug !== guide.slug)
    .map((candidate) => ({
      guide: candidate,
      sharedCategoryCount: candidate.categorySlugs.filter((categorySlug) =>
        guideCategorySlugs.has(categorySlug),
      ).length,
    }))
    .filter((candidate) => candidate.sharedCategoryCount > 0)
    .sort((left, right) => right.sharedCategoryCount - left.sharedCategoryCount)
    .slice(0, 3)
    .map((candidate) => candidate.guide);
  const relatedProducts = getAllProducts()
    .filter((product) => guide.productSlugs.includes(product.slug))
    .map((product) => {
      const category = categoryMap.get(product.categorySlug);

      if (!category) {
        return null;
      }

      return { product, category };
    })
    .filter((item): item is { product: Product; category: ProductCategory } => Boolean(item));
  const relatedProductMap = new Map(relatedProducts.map((item) => [item.product.slug, item]));
  const seoImage = getPreferredSeoImage(relatedProducts.map((item) => item.product));
  const guideRfqPrompt = [
    `Reference guide: ${guide.title}`,
    ...(guide.rfqFields ?? ["Products or parts requested:"]),
  ].join("\n");
  const guideRfqHref = `/rfq?product=${encodeURIComponent(guideRfqPrompt)}`;
  const buyerTool =
    guide.buyerTool ??
    ({
      href: "/downloads/arcfort-rfq-template.csv",
      title: "RFQ Product List Worksheet",
      description:
        "Use the CSV worksheet to keep each requested product or variant on a separate quotation line.",
      buttonLabel: "Download RFQ Worksheet",
    } as const);
  const hasWeldingMachineRfqBuilder = guide.slug === "welding-machine-sourcing-checklist";

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
          articleJsonLd(guide, seoImage),
          faqJsonLd(guide.faq),
        ]}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: guide.title },
            ]}
          />
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Buyer Guide
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {guide.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{guide.description}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <time dateTime={guide.publishedDate}>
                Published {formatGuideDate(guide.publishedDate)}
              </time>
              <time dateTime={guide.modifiedDate}>
                Updated {formatGuideDate(guide.modifiedDate)}
              </time>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="#guide-content"
                className="inline-flex min-h-12 items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white"
              >
                Read Guide
              </Link>
              <Link
                href={guideRfqHref}
                className="inline-flex min-h-12 items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10"
              >
                Send RFQ
              </Link>
              <a
                href={buyerTool.href}
                download
                className="inline-flex min-h-12 items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-arc-signal hover:text-arc-signal"
              >
                {buyerTool.buttonLabel}
              </a>
            </div>
          </div>
          <aside className="border border-white/10 bg-white/5 p-5 shadow-industrial">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              Quotation preparation principles
            </p>
            <div className="mt-5 grid gap-3">
              {rfqReviewPoints.map((point) => (
                <div key={point} className="border-l-4 border-arc-signal bg-white/5 p-4">
                  <p className="text-sm font-semibold leading-6 text-slate-200">{point}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Published by
              </p>
              <Link
                href="/about"
                className="mt-2 block text-sm font-semibold leading-6 text-white hover:text-arc-signal"
              >
                {siteConfig.legalName}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Guide contents">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
              Guide Contents
            </p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {guide.componentReference ? (
                <li>
                  <a
                    href="#component-reference"
                    className="group flex min-h-14 items-center gap-4 border border-slate-200 bg-arc-frost px-4 py-3 transition hover:border-arc-blue hover:bg-white"
                  >
                    <span className="font-display text-lg font-black text-arc-blue">REF</span>
                    <span className="text-sm font-bold leading-6 text-arc-midnight group-hover:text-arc-blue">
                      {guide.componentReference.title}
                    </span>
                  </a>
                </li>
              ) : null}
              {guide.sections.map((section, index) => (
                <li key={section.title}>
                  <a
                    href={`#${getSectionId(section.title)}`}
                    className="group flex min-h-14 items-center gap-4 border border-slate-200 bg-arc-frost px-4 py-3 transition hover:border-arc-blue hover:bg-white"
                  >
                    <span className="font-display text-lg font-black text-arc-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-bold leading-6 text-arc-midnight group-hover:text-arc-blue">
                      {section.title}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {guide.componentReference ? (
        <section
          id="component-reference"
          className="scroll-mt-28 border-b border-slate-200 bg-white py-14 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                  Component Reference
                </p>
                <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl">
                  {guide.componentReference.title}
                </h2>
              </div>
              <p className="text-sm leading-7 text-slate-600">
                {guide.componentReference.description}
              </p>
            </div>

            <div className="mt-8 border-y border-slate-200">
              <div className="hidden grid-cols-[0.7fr_0.7fr_1fr_1.35fr] gap-5 bg-arc-midnight px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white lg:grid">
                <span>Part name</span>
                <span>Assembly area</span>
                <span>Function</span>
                <span>Buyer should confirm</span>
              </div>
              <div className="divide-y divide-slate-200">
                {guide.componentReference.rows.map((row, index) => {
                  const relatedProduct = row.productSlug
                    ? relatedProductMap.get(row.productSlug)
                    : undefined;

                  return (
                    <article
                      key={row.name}
                      className="grid gap-5 px-1 py-6 sm:px-5 lg:grid-cols-[0.7fr_0.7fr_1fr_1.35fr] lg:items-start"
                    >
                      <div>
                        <span className="text-xs font-black text-arc-blue">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="mt-2 font-display text-xl font-black text-arc-midnight">
                          {relatedProduct ? (
                            <Link
                              href={`/products/${relatedProduct.category.slug}/${relatedProduct.product.slug}`}
                              className="transition hover:text-arc-blue"
                            >
                              {row.name}
                            </Link>
                          ) : (
                            row.name
                          )}
                        </h3>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:hidden">
                          Assembly area
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 lg:mt-0">
                          {row.assemblyArea}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:hidden">
                          Function
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600 lg:mt-0">{row.role}</p>
                      </div>
                      <div className="border-l-4 border-arc-signal bg-arc-frost p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-arc-blue">
                          Buyer should confirm
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{row.buyerCheck}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              This reference explains product families and assembly roles. It does not confirm fit,
              dimensions, electrical ratings or interchangeability for a specific torch.
            </p>
          </div>
        </section>
      ) : null}

      <section id="guide-content" className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            {guide.sections.map((section, index) => (
              <article
                key={section.title}
                id={getSectionId(section.title)}
                className="scroll-mt-28 grid gap-5 border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[5rem_1fr] sm:items-start"
              >
                <div className="font-display text-4xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-black text-arc-midnight">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {guide.buyerChecklist ? (
        <section className="border-y border-slate-200 bg-white py-14 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Buyer Checklist
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight">
                {guide.buyerChecklist.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {guide.buyerChecklist.description}
              </p>
              <Link
                href={guideRfqHref}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-arc-blue px-5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight sm:w-auto"
              >
                Start This RFQ
              </Link>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2">
              {guide.buyerChecklist.items.map((item, index) => (
                <li
                  key={item}
                  className="grid grid-cols-[2.5rem_1fr] gap-3 border border-slate-200 bg-arc-frost p-5"
                >
                  <span className="font-display text-xl font-black text-arc-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {hasWeldingMachineRfqBuilder ? (
        <section
          data-nosnippet
          data-snippet-region="machine-guide-rfq-builder"
          className="scroll-mt-28 bg-arc-frost py-14 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <WeldingMachineRfqBuilder />
          </div>
        </section>
      ) : null}

      <section
        data-nosnippet
        data-snippet-region="guide-rfq-workflow"
        className="border-y border-slate-200 bg-white py-14 sm:py-16"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer RFQ Tool
            </p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight">
              Turn this guide into a quotation-ready product list.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              {buyerTool.description} Upload the completed file with photos, drawings or reference
              documents. The RFQ form will carry this guide topic into the inquiry for faster sales
              review.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={buyerTool.href}
                download
                className="inline-flex min-h-12 w-full items-center justify-center bg-arc-blue px-5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight sm:w-auto"
              >
                {buyerTool.buttonLabel}
              </a>
              <Link
                href={guideRfqHref}
                className="inline-flex min-h-12 w-full items-center justify-center border border-arc-blue px-5 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-frost hover:text-arc-midnight sm:w-auto"
              >
                Upload and Request Quote
              </Link>
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Download",
                text: `Open the ${buyerTool.title} and keep one requested item, size or model on each row.`,
              },
              {
                title: "Complete",
                text: "Add quantity, available references, packaging needs and destination country.",
              },
              {
                title: "Upload",
                text: "Attach the worksheet, product photos or drawings through the secure RFQ form.",
              },
            ].map((step, index) => (
              <li key={step.title} className="border-l-4 border-arc-signal bg-arc-frost p-5">
                <span className="font-display text-2xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-black text-arc-midnight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Related Categories
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use these categories to compare product families before sending an RFQ.
            </p>
            <div className="mt-5 grid gap-3">
              {relatedCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products/${category.slug}`}
                  className="border border-slate-100 p-4 transition hover:border-arc-blue hover:bg-arc-frost"
                >
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                    {category.code}
                  </div>
                  <div className="mt-2 font-display text-xl font-black text-arc-midnight">
                    {category.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Related Products
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Product pages to compare
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.product.slug}
                  product={item.product}
                  category={item.category}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {relatedGuides.length > 0 ? (
        <section className="bg-arc-midnight py-14 text-white sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Continue Research
            </p>
            <h2 className="mt-3 font-display text-3xl font-black">Related buyer guides</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {relatedGuides.map((relatedGuide) => (
                <Link
                  key={relatedGuide.slug}
                  href={`/guides/${relatedGuide.slug}`}
                  className="border border-white/15 bg-white/5 p-5 transition hover:border-arc-signal hover:bg-white/10"
                >
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-signal">
                    Buyer Guide
                  </div>
                  <h3 className="mt-3 font-display text-xl font-black leading-tight text-white">
                    {relatedGuide.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {relatedGuide.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <FaqSection items={guide.faq} title="Guide FAQ" />
          <RfqCta
            title="Ready to prepare your RFQ?"
            description="Send product names, photos, drawings, quantity, packaging requirements and destination country. ArcFort Weld will review confirmed details before quotation."
            productName={guideRfqPrompt}
          />
        </div>
      </section>
    </>
  );
}
