import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerPathList } from "@/components/content/BuyerPathList";
import {
  ComponentReferenceTable,
  type ComponentReferenceRow,
} from "@/components/content/ComponentReferenceTable";
import { DownloadCard } from "@/components/content/DownloadCard";
import { FaqSection } from "@/components/content/FaqSection";
import { GuideContents } from "@/components/content/GuideContents";
import { PageSectionNav } from "@/components/content/PageSectionNav";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { ProductGrid } from "@/components/content/ProductGrid";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WeldingMachineRfqBuilder } from "@/components/products/WeldingMachineRfqBuilder";
import { getAllProductCategories, getRelatedCategories } from "@/lib/content/categories";
import { getAllGuides, getGuideBySlug } from "@/lib/content/guides";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import type { Product, ProductCategory } from "@/lib/content/schemas";
import { buildMetadata } from "@/lib/content/seo";
import { getPreferredSeoImage } from "@/lib/content/seo-images";
import { absoluteUrl, siteConfig } from "@/lib/content/site";

type GuideRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
  const buyerToolType = buyerTool.href.split(".").pop()?.toUpperCase() ?? "FILE";
  const hasWeldingMachineRfqBuilder = guide.slug === "welding-machine-sourcing-checklist";
  const contentsItems = guide.sections.map((section) => ({
    href: `#${getSectionId(section.title)}` as `#${string}`,
    label: section.title,
  }));
  const pageSectionLinks: Array<{ href: `#${string}`; label: string }> = [];

  if (guide.componentReference) {
    pageSectionLinks.push({ href: "#component-reference", label: "Component Reference" });
  }
  pageSectionLinks.push({ href: "#guide-content", label: "Guide" });
  if (guide.buyerChecklist) {
    pageSectionLinks.push({ href: "#buyer-checklist", label: "Buyer Checklist" });
  }
  pageSectionLinks.push(
    { href: "#guide-rfq-tool", label: "RFQ Tool" },
    { href: "#related-products", label: "Related Products" },
  );

  const componentRows: ComponentReferenceRow[] =
    guide.componentReference?.rows.map((row) => {
      const relatedProduct = row.productSlug ? relatedProductMap.get(row.productSlug) : undefined;

      return {
        name: row.name,
        assemblyArea: row.assemblyArea,
        role: row.role,
        buyerCheck: row.buyerCheck,
        href: relatedProduct
          ? `/products/${relatedProduct.category.slug}/${relatedProduct.product.slug}`
          : undefined,
      };
    }) ?? [];

  const categoryPaths = relatedCategories.map((category) => ({
    href: `/products/${category.slug}`,
    title: category.title,
    description: category.description,
  }));
  const guidePaths = relatedGuides.map((relatedGuide) => ({
    href: `/guides/${relatedGuide.slug}`,
    title: relatedGuide.title,
    description: relatedGuide.description,
  }));
  const rfqToolSteps = [
    {
      step: "01",
      title: "Download",
      description: `Open the ${buyerTool.title} and keep each requested item or variant on a separate row.`,
    },
    {
      step: "02",
      title: "Complete",
      description:
        "Add quantity, available product references, packing needs and destination country.",
    },
    {
      step: "03",
      title: "Upload",
      description:
        "Attach the completed file with product photos, drawings or reference documents in the RFQ form.",
    },
  ] as const;

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

      <div className="bg-white py-5 sm:py-6">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: guide.title },
            ]}
          />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="py-14 sm:py-16 lg:py-20">
          <div className="max-w-5xl">
            <p className="section-eyebrow !text-arc-signal">Technical Buyer Guide</p>
            <h1 className="mt-4 max-w-5xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {guide.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{guide.description}</p>
            <div
              data-nosnippet
              className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase text-slate-400"
            >
              <time dateTime={guide.publishedDate}>
                Published {formatGuideDate(guide.publishedDate)}
              </time>
              <time dateTime={guide.modifiedDate}>
                Updated {formatGuideDate(guide.modifiedDate)}
              </time>
              <Link href="/about" className="transition hover:text-arc-signal">
                Published by {siteConfig.legalName}
              </Link>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#guide-content">Read Guide</ButtonLink>
              <ButtonLink href={guideRfqHref} variant="onDark">
                Request a Quote
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <PageSectionNav ariaLabel="Guide detail sections" items={pageSectionLinks} />

      {guide.componentReference ? (
        <Section
          id="component-reference"
          labelledBy="component-reference-title"
          className="scroll-mt-36 bg-white"
        >
          <Container>
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-16">
              <SectionHeading
                id="component-reference-title"
                eyebrow="Component Reference"
                title={guide.componentReference.title}
              />
              <p className="text-sm leading-7 text-slate-600">
                {guide.componentReference.description}
              </p>
            </div>
            <div className="mt-8">
              <ComponentReferenceTable rows={componentRows} />
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500">
              This reference explains product families and assembly roles. It does not confirm fit,
              dimensions, electrical ratings or interchangeability for a specific torch.
            </p>
          </Container>
        </Section>
      ) : null}

      <Section
        id="guide-content"
        labelledBy="guide-content-title"
        className="scroll-mt-36 bg-arc-frost"
      >
        <Container>
          <div className="mb-10 max-w-4xl">
            <p className="section-eyebrow">Technical Guidance</p>
            <h2 id="guide-content-title" className="section-title mt-3">
              Read the selection and sourcing process in order.
            </h2>
            <p className="body-large mt-5">
              Use the article to identify the evidence needed for review. Confirm the exact supplied
              product separately through quotation, drawing, sample or approved reference.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
            <GuideContents items={contentsItems} />
            <div className="divide-y divide-arc-line border-y border-arc-line bg-white px-5 sm:px-8">
              {guide.sections.map((section, index) => (
                <article
                  key={section.title}
                  id={getSectionId(section.title)}
                  className="scroll-mt-36 grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:py-10"
                >
                  <span className="font-display text-3xl font-black text-arc-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-black leading-tight text-arc-midnight sm:text-3xl">
                      {section.title}
                    </h3>
                    <p className="mt-4 text-base leading-8 text-slate-600">{section.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {guide.buyerChecklist ? (
        <Section
          id="buyer-checklist"
          labelledBy="buyer-checklist-title"
          className="scroll-mt-36 bg-white"
        >
          <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <SectionHeading
                id="buyer-checklist-title"
                eyebrow="Buyer Checklist"
                title={guide.buyerChecklist.title}
                description={guide.buyerChecklist.description}
              />
              <ButtonLink href={guideRfqHref} className="mt-7 w-full sm:w-auto">
                Start This RFQ
              </ButtonLink>
            </div>
            <ol className="divide-y divide-arc-line border-y border-arc-line">
              {guide.buyerChecklist.items.map((item, index) => (
                <li
                  key={item}
                  className="grid grid-cols-[2.5rem_1fr] gap-4 py-5 text-sm font-semibold leading-7 text-slate-700"
                >
                  <span className="font-display text-xl font-black text-arc-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </Container>
        </Section>
      ) : null}

      {hasWeldingMachineRfqBuilder ? (
        <section
          data-nosnippet
          data-snippet-region="machine-guide-rfq-builder"
          className="section-space bg-arc-frost"
        >
          <Container>
            <WeldingMachineRfqBuilder />
          </Container>
        </section>
      ) : null}

      <section
        id="guide-rfq-tool"
        data-nosnippet
        data-snippet-region="guide-rfq-workflow"
        className="scroll-mt-36 border-y border-arc-line bg-white py-14 sm:py-16"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-16">
            <SectionHeading
              eyebrow="Buyer RFQ Tool"
              title="Turn this guide into a quotation-ready product list."
              description="Complete only documented values, then attach the available photos, drawings or reference files for technical review."
            />
            <DownloadCard
              title={buyerTool.title}
              type={buyerToolType}
              href={buyerTool.href}
              description={buyerTool.description}
              note="Keep each requested item or variant on a separate line and leave unknown technical values open for confirmation."
              actionLabel={buyerTool.buttonLabel}
            />
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <ProcessSteps items={rfqToolSteps} />
            <ButtonLink href={guideRfqHref} className="w-full lg:w-auto">
              Upload and Request Quote
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Section
        id="related-products"
        labelledBy="related-products-title"
        className="scroll-mt-36 bg-arc-frost"
      >
        <Container>
          <SectionHeading
            id="related-products-title"
            eyebrow="Product Research"
            title="Compare the product families behind this guide."
            description="Use category pages for range-level selection and product pages for the currently published item records."
            className="max-w-4xl"
          />
          <div className="mt-10 grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <h3 className="font-display text-2xl font-black text-arc-midnight">
                Related Categories
              </h3>
              <div className="mt-4">
                <BuyerPathList items={categoryPaths} ariaLabel="Related product categories" />
              </div>
            </div>
            <div>
              <h3 className="font-display text-2xl font-black text-arc-midnight">
                Related Products
              </h3>
              <ProductGrid items={relatedProducts} className="mt-5" />
            </div>
          </div>
        </Container>
      </Section>

      {guidePaths.length > 0 ? (
        <Section className="bg-arc-midnight text-white">
          <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <SectionHeading
              eyebrow="Continue Research"
              title="Related buyer guides"
              description="Continue with another guide that shares the same product or compatibility context."
              inverse
            />
            <BuyerPathList items={guidePaths} inverse ariaLabel="Related buyer guides" />
          </Container>
        </Section>
      ) : null}

      <Section className="bg-white">
        <Container className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
          <FaqSection items={guide.faq} title="Guide FAQ" />
          <RfqCta
            title="Ready to prepare your RFQ?"
            description="Send product names, photos, drawings, quantity, packaging requirements and destination country. ArcFort Weld will review confirmed details before quotation."
            productName={guideRfqPrompt}
          />
        </Container>
      </Section>
    </>
  );
}
