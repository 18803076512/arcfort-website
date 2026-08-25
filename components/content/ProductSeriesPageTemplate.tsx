import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductGrid } from "@/components/content/ProductGrid";
import { SeriesReferenceTable } from "@/components/content/SeriesReferenceTable";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { GuideArticle, ProductCategory, ProductSeries } from "@/lib/content/schemas";
import type { ResolvedProductSeriesReference } from "@/lib/content/product-series";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";

type ProductSeriesPageTemplateProps = {
  series: ProductSeries;
  category: ProductCategory;
  references: ResolvedProductSeriesReference[];
  relatedGuides: GuideArticle[];
  heroImage?: string;
};

export function ProductSeriesPageTemplate({
  series,
  category,
  references,
  relatedGuides,
  heroImage,
}: ProductSeriesPageTemplateProps) {
  const rfqHref = `/rfq?product=${encodeURIComponent(series.name)}`;
  const directInquiryMessage = [
    `Hello ArcFort Weld, I would like a quotation for ${series.name}.`,
    "",
    "Torch label / model:",
    "Required parts and quantities:",
    "Wire size / visible markings:",
    "Drawing, sample or photo reference:",
    "Packaging requirement:",
    "Destination country:",
  ].join("\n");
  const emailHref = buildEmailHref({
    subject: `ArcFort Weld RFQ - ${series.name}`,
    message: directInquiryMessage,
  });
  const whatsappHref = buildWhatsAppHref({ message: directInquiryMessage });
  const pageSections = [
    { href: "#series-products", label: "Products" },
    { href: "#series-reference", label: "Reference" },
    { href: "#series-compatibility", label: "Compatibility" },
    { href: "#series-applications", label: "Applications" },
    { href: "#series-resources", label: "Resources" },
    { href: "#series-faq", label: "FAQ" },
  ] as const;

  return (
    <>
      <section className="bg-white py-8 sm:py-12 lg:py-16">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: category.title, href: `/products/${category.slug}` },
              { label: series.shortName },
            ]}
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-16">
            <div>
              <p className="section-eyebrow">{series.process} Catalog Reference Series</p>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-black leading-[1.08] text-arc-midnight sm:text-5xl lg:text-6xl">
                {series.name}
              </h1>
              <p className="body-large mt-6 max-w-2xl">{series.description}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={rfqHref} className="w-full sm:w-auto">
                  Request Series Quote
                </ButtonLink>
                <ButtonLink
                  href={`/products/${category.slug}`}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  View {category.shortTitle}
                </ButtonLink>
              </div>
            </div>

            <figure className="border border-arc-line bg-white lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <div className="relative aspect-[5/4] bg-arc-frost">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={`${series.name} catalog-reference product group`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain p-8 sm:p-12"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center text-sm font-semibold text-slate-500">
                    Reviewed series imagery is available with the linked product records.
                  </div>
                )}
              </div>
              <figcaption className="border-t border-arc-line px-5 py-4 text-sm leading-6 text-slate-600">
                Representative catalog-reference product image. Confirm the exact torch, component
                stack and required dimensions before ordering.
              </figcaption>
            </figure>

            <dl className="grid border-y border-arc-line sm:grid-cols-3 sm:divide-x sm:divide-arc-line lg:col-start-1 lg:row-start-2 lg:self-start">
              <div className="py-4 sm:pr-5">
                <dt className="text-sm font-semibold text-slate-500">Evidence source</dt>
                <dd className="mt-1 font-bold text-arc-midnight">Company catalog</dd>
              </div>
              <div className="border-t border-arc-line py-4 sm:border-t-0 sm:px-5">
                <dt className="text-sm font-semibold text-slate-500">Product relationship</dt>
                <dd className="mt-1 font-bold text-arc-midnight">Reference only</dd>
              </div>
              <div className="border-t border-arc-line py-4 sm:border-t-0 sm:pl-5">
                <dt className="text-sm font-semibold text-slate-500">Final fit</dt>
                <dd className="mt-1 font-bold text-arc-midnight">Evidence required</dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <nav
        aria-label={`${series.shortName} page sections`}
        className="border-y border-arc-line bg-white"
      >
        <Container className="overflow-x-auto">
          <ol className="flex min-w-max">
            {pageSections.map((section, index) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  className="flex min-h-12 items-center gap-2 px-4 text-sm font-bold text-slate-600 transition hover:bg-arc-frost hover:text-arc-blue"
                >
                  <span className="text-arc-blue">{String(index + 1).padStart(2, "0")}</span>
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </Container>
      </nav>

      <Section
        id="series-products"
        labelledBy="series-products-heading"
        className="scroll-mt-28 bg-arc-frost"
      >
        <Container>
          <SectionHeading
            eyebrow="Published Product References"
            title={`${series.shortName} torch-front parts available for RFQ review.`}
            description={`These active product pages are linked to the ${series.shortName} company-catalog reference group. The relationship remains reference-only until the requested torch and component stack are checked.`}
            id="series-products-heading"
            className="max-w-3xl"
          />
          <ProductGrid
            items={references.map((reference) => ({ product: reference.product, category }))}
            variant="featured"
            className="mt-10"
          />
        </Container>
      </Section>

      <Section className="bg-white" labelledBy="series-system-heading">
        <Container className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div>
            <p className="section-eyebrow">Documented Component Stack</p>
            <h2 id="series-system-heading" className="section-title mt-3">
              Review the complete torch front end, not one isolated part.
            </h2>
            <p className="body-large mt-5">{series.overview}</p>
            <p className="mt-5 text-sm leading-7 text-slate-600">{series.buyerCheck}</p>
            <p className="mt-5 border-l-2 border-arc-signal pl-4 text-sm leading-7 text-slate-600">
              {series.compatibilityStatement}
            </p>
          </div>
          <ol className="grid gap-x-8 border-t border-arc-line sm:grid-cols-2">
            {series.documentedComponents.map((component, index) => (
              <li
                key={component}
                className="grid grid-cols-[2.5rem_1fr] items-center gap-3 border-b border-arc-line py-5"
              >
                <span className="font-display text-xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-bold text-arc-midnight">{component}</span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section
        id="series-reference"
        labelledBy="series-reference-heading"
        className="scroll-mt-28 bg-arc-frost"
      >
        <Container>
          <SectionHeading
            eyebrow="Company Catalog Reference"
            title="Documented product cues and relationship status."
            description="Values below come from the linked product records and retain their catalog-reference wording. They are selection cues for quotation, not universal compatibility claims."
            id="series-reference-heading"
            className="max-w-3xl"
          />
          <div className="mt-10">
            <SeriesReferenceTable category={category} references={references} />
          </div>
          <div className="mt-5 flex flex-col gap-3 text-sm leading-6 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Source: {series.sourceReference} Review status: final product-to-torch fit requires
              confirmation.
            </p>
            <a
              href={series.catalogUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center font-bold text-arc-blue transition hover:text-arc-copper"
            >
              Open Company Catalog{" "}
              <span className="ml-2" aria-hidden="true">
                &rarr;
              </span>
            </a>
          </div>
        </Container>
      </Section>

      <Section
        id="series-compatibility"
        labelledBy="series-compatibility-heading"
        className="scroll-mt-28 bg-white"
      >
        <Container className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Selection Variables"
              title="Details that determine the requested match."
              description="Use these checks to prepare an evidence-based inquiry before selecting a replacement part."
              id="series-compatibility-heading"
            />
            <dl className="mt-8 border-t border-arc-line">
              {series.selectionVariables.map((variable) => (
                <div key={variable.label} className="border-b border-arc-line py-5">
                  <dt className="font-display text-xl font-black text-arc-midnight">
                    {variable.label}
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">{variable.whyItMatters}</dd>
                  <dd className="mt-2 text-sm font-semibold leading-6 text-arc-blue">
                    Confirm with: {variable.confirmationMethod}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="bg-arc-midnight p-6 text-white sm:p-8 lg:self-start">
            <p className="section-eyebrow !text-slate-300">Compatibility Workflow</p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight">
              Prepare evidence in five steps.
            </h2>
            <ol className="mt-7 divide-y divide-white/15 border-y border-white/15">
              {series.confirmationChecklist.map((item, index) => (
                <li key={item} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                  <span className="font-display text-lg font-black text-arc-signal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-6 text-slate-200">{item}</span>
                </li>
              ))}
            </ol>
            <ButtonLink href={rfqHref} className="mt-7 w-full">
              Send Evidence for Review
            </ButtonLink>
          </aside>
        </Container>
      </Section>

      <Section
        id="series-applications"
        labelledBy="series-applications-heading"
        className="scroll-mt-28 bg-arc-frost"
      >
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Applications"
              title="Supply paths for maintenance and repeat purchasing."
              description="The series group supports product identification and RFQ preparation for the following purchasing situations."
              id="series-applications-heading"
            />
            <ul className="mt-8 grid gap-x-8 border-t border-arc-line sm:grid-cols-2">
              {series.applications.map((application) => (
                <li
                  key={application}
                  className="border-b border-arc-line py-5 font-bold text-arc-midnight"
                >
                  {application}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="section-eyebrow">Ordering & OEM</p>
            <h2 className="section-title mt-3">
              Commercial details are confirmed with the product list.
            </h2>
            <dl className="mt-8 border-t border-arc-line">
              {[
                ["Trial orders", siteConfig.moqPolicy],
                ["Regular lead time", siteConfig.regularLeadTime],
                ["OEM support", siteConfig.oemService],
                ["Packing", "Standard export packing or customized packaging after confirmation."],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 border-b border-arc-line py-5 sm:grid-cols-[9rem_1fr] sm:gap-5"
                >
                  <dt className="text-sm font-semibold text-slate-500">{label}</dt>
                  <dd className="text-sm font-bold leading-6 text-arc-midnight">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      <Section
        id="series-resources"
        labelledBy="series-resources-heading"
        className="scroll-mt-28 bg-white"
      >
        <Container>
          <SectionHeading
            eyebrow="Technical Resources"
            title="Confirm the part before building a repeat order."
            description="Use the company catalog and focused buyer guides to identify the component stack, then send the supporting evidence with your RFQ."
            id="series-resources-heading"
            className="max-w-3xl"
          />
          <div className="mt-10 grid gap-8 border-t border-arc-line lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border-b border-arc-line py-7 lg:border-r lg:px-0 lg:pr-8">
              <p className="section-eyebrow">Primary Document</p>
              <h3 className="mt-3 font-display text-2xl font-black text-arc-midnight">
                Renqiu Ailesen Welding Catalog
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Review the company-catalog {series.shortName} reference drawing and product table.
                Use the PDF as a sourcing reference and confirm the required item before ordering.
              </p>
              <a
                href={series.catalogUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex min-h-11 items-center font-bold text-arc-blue transition hover:text-arc-copper"
              >
                Open PDF Catalog{" "}
                <span className="ml-2" aria-hidden="true">
                  &rarr;
                </span>
              </a>
            </div>
            <div className="divide-y divide-arc-line">
              {relatedGuides.map((guide) => (
                <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group block py-6">
                  <p className="text-xs font-semibold text-arc-blue">Buyer Guide</p>
                  <h3 className="mt-2 font-display text-xl font-black text-arc-midnight transition group-hover:text-arc-blue">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{guide.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section id="series-faq" className="scroll-mt-28 bg-arc-frost">
        <Container className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <FaqSection items={series.faq} title={`${series.shortName} FAQ`} />
          </div>
          <aside className="bg-arc-midnight p-6 text-white sm:p-8">
            <p className="section-eyebrow !text-slate-300">Series RFQ</p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight">
              Send one clear {series.shortName} parts inquiry.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Include the torch label, required parts, quantities, wire size, visible markings,
              connection photos and destination country. Add a drawing or approved sample reference
              when available.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <ButtonLink href={rfqHref} className="w-full">
                Request a Quote
              </ButtonLink>
              <a href={whatsappHref} className="button-base button-on-dark w-full">
                WhatsApp Sales
              </a>
            </div>
            <a
              href={emailHref}
              className="mt-5 inline-flex min-h-11 items-center break-all font-bold text-white transition hover:text-arc-signal"
            >
              {siteConfig.email}
            </a>
          </aside>
        </Container>
      </Section>
    </>
  );
}
