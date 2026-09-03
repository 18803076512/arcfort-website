import Image from "next/image";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { IndustrySolutionCard } from "@/components/content/IndustrySolutionCard";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllApplications } from "@/lib/content/applications";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/content/jsonld";
import { getDisplayEligibleProductImageAssets } from "@/lib/content/product-images";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";

const sourcingSteps = [
  {
    title: "Define the working context",
    description:
      "Tell us the industry, welding or cutting process, installed equipment and replacement objective.",
  },
  {
    title: "Document the product reference",
    description:
      "Share the model, drawing, current part, assembly photos or verified dimensions needed for review.",
  },
  {
    title: "Prepare a quote-ready list",
    description:
      "Separate each product, quantity, packing requirement and destination so the quotation scope is clear.",
  },
] as const;

export const metadata = buildMetadata({
  title: "Applications",
  description:
    "Explore industrial welding and cutting application pages for shipbuilding, automotive, pipeline, fabrication, construction and repair workshops.",
  path: "/applications",
  keywords: [
    "welding applications",
    "industrial welding parts",
    "plasma cutting applications",
    "welding consumables by industry",
  ],
});

export default function ApplicationsPage() {
  const applications = getAllApplications();
  const productsBySlug = new Map(getAllProducts().map((product) => [product.slug, product]));
  const usedVisualPaths = new Set<string>();
  const applicationCards = applications.map((application) => {
    const visualCandidates = application.relatedProductSlugs
      .map((slug) => productsBySlug.get(slug))
      .filter((product) => Boolean(product))
      .map((product) => ({
        product,
        asset: product ? getDisplayEligibleProductImageAssets(product)[0] : undefined,
      }));
    const visual =
      visualCandidates.find((item) => item.asset && !usedVisualPaths.has(item.asset.publicPath)) ??
      visualCandidates.find((item) => item.asset);

    if (visual?.asset) {
      usedVisualPaths.add(visual.asset.publicPath);
    }

    return {
      application,
      image:
        visual?.product && visual.asset
          ? {
              src: visual.asset.publicPath,
              alt: `${visual.product.title} product reference for ${application.title}`,
            }
          : undefined,
    };
  });

  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Applications", path: "/applications" },
        ])}
      />
      <StructuredData
        data={collectionPageJsonLd({
          name: "ArcFort Weld Applications",
          description:
            "Industrial welding and cutting application pages for B2B product sourcing and RFQ preparation.",
          path: "/applications",
          items: applications.map((application) => ({
            name: application.title,
            path: `/applications/${application.slug}`,
          })),
        })}
      />

      <div className="border-b border-arc-line bg-white py-4">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Applications" }]} />
        </Container>
      </div>

      <section className="relative isolate min-h-[620px] overflow-hidden bg-arc-midnight text-white sm:min-h-[680px]">
        <Image
          src="/images/site/arcfort-hero-welding-workshop.png"
          alt="Representative welding and cutting workshop application"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          quality={90}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,51,0.97)_0%,rgba(11,31,51,0.88)_42%,rgba(11,31,51,0.32)_76%,rgba(11,31,51,0.16)_100%)]" />
        <Container className="relative flex min-h-[620px] items-center py-16 sm:min-h-[680px] sm:py-20">
          <div className="max-w-3xl">
            <p className="section-eyebrow !text-slate-300">Industrial Applications</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-[1.06] text-white sm:text-5xl lg:text-6xl">
              Welding and cutting supply built around real working conditions.
            </h1>
            <p className="body-large mt-6 max-w-2xl text-slate-200">
              Match MIG/MAG, TIG, plasma cutting and workshop product families to the equipment,
              replacement cycle and purchasing requirements of your industry.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#industry-solutions">Explore Applications</ButtonLink>
              <ButtonLink href="/rfq" variant="onDark">
                Request Application Review
              </ButtonLink>
            </div>
          </div>
        </Container>
        <p
          data-nosnippet
          className="absolute bottom-4 right-4 max-w-xs bg-arc-midnight/80 px-3 py-2 text-right text-xs font-semibold text-slate-200 sm:bottom-6 sm:right-6"
        >
          Representative industrial application visual
        </p>
      </section>

      <Section id="industry-solutions" labelledBy="industry-solutions-title" className="bg-white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <SectionHeading
              id="industry-solutions-title"
              eyebrow="Industry Solutions"
              title="Start with the way the product will be used."
            />
            <p className="body-large max-w-2xl lg:justify-self-end">
              Each application path connects operating context with relevant product systems,
              selection risks and the evidence buyers should provide before quotation.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {applicationCards.map(({ application, image }) => (
              <IndustrySolutionCard
                key={application.slug}
                application={application}
                image={image}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section labelledBy="application-rfq-title" className="border-y border-arc-line bg-arc-frost">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <SectionHeading
              id="application-rfq-title"
              eyebrow="From Application to RFQ"
              title="Give the quotation team evidence, not assumptions."
              description="A useful RFQ identifies the working context, the current part or equipment, and the commercial scope of every line item."
            />
            <ol className="divide-y divide-arc-line border-y border-arc-line">
              {sourcingSteps.map((step, index) => (
                <li key={step.title} className="grid gap-3 py-6 sm:grid-cols-[72px_1fr] sm:gap-6">
                  <span className="font-display text-3xl font-black text-arc-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-black text-arc-midnight">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <RfqCta
            title="Need application-based product support?"
            description="Send the working process, installed equipment, current part references, quantity and destination. ArcFort Weld will review the relevant product systems before quotation."
            rfqPrompt="Industrial application sourcing request"
          />
        </Container>
      </Section>
    </>
  );
}
