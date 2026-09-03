import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerPathList } from "@/components/content/BuyerPathList";
import { FaqSection } from "@/components/content/FaqSection";
import { PageSectionNav } from "@/components/content/PageSectionNav";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  companyBuyerProfiles,
  companyEvidenceBoundaries,
  companyFaq,
  companyInquiryStages,
  companyResourceLinks,
  companyRfqPrompt,
} from "@/lib/content/company-profile";
import { getAllProductCategories } from "@/lib/content/categories";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const aboutImage = "/images/site/arcfort-oem-consumables-workbench.png";

const sectionLinks = [
  { href: "#company", label: "Company" },
  { href: "#product-scope", label: "Product Systems" },
  { href: "#buyer-paths", label: "Buyer Programs" },
  { href: "#order-basis", label: "Order Process" },
  { href: "#evidence", label: "Evidence" },
] as const;

export const metadata = buildMetadata({
  title: "Renqiu Ailesen Welding Technology Co., Ltd.",
  description:
    "Learn how Renqiu Ailesen Welding Technology Co., Ltd. operates ArcFort Weld for welding parts, plasma consumables, machines, OEM and export RFQs.",
  path: "/about",
  image: aboutImage,
  keywords: [
    "Renqiu Ailesen Welding Technology",
    "ArcFort Weld company",
    "welding and cutting supplier China",
    "OEM welding product supplier",
  ],
});

export default function AboutPage() {
  const categories = getAllProductCategories();
  const rfqHref = `/rfq?product=${encodeURIComponent(companyRfqPrompt)}`;

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
          webPageJsonLd({
            name: "Renqiu Ailesen Welding Technology Co., Ltd. | ArcFort Weld",
            description:
              "Legal company identity, welding and cutting product scope, buyer services and export RFQ information for ArcFort Weld.",
            path: "/about",
            pageType: "AboutPage",
            image: aboutImage,
            dateModified: siteConfig.aboutLastModified,
          }),
          faqJsonLd([...companyFaq]),
        ]}
      />

      <div className="bg-white py-5 sm:py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        </Container>
      </div>

      <section className="relative isolate overflow-hidden bg-arc-midnight text-white">
        <Image
          src={aboutImage}
          alt="Representative welding torch parts, plasma cutting consumables and welding accessories arranged on a workbench"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,15,28,0.98)_0%,rgba(7,21,36,0.92)_52%,rgba(7,21,36,0.52)_100%)]" />
        <Container className="flex min-h-[32rem] items-center py-14 sm:py-16">
          <div className="max-w-4xl">
            <p className="section-eyebrow !text-arc-signal">The Company Behind ArcFort Weld</p>
            <h1 className="mt-4 max-w-4xl break-words font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {siteConfig.legalName}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
              An industrial welding and cutting product supplier in {siteConfig.address}, serving
              distributors, importers, welding equipment suppliers, repair workshops, industrial
              users and OEM buyers through the {siteConfig.name} website brand.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/products">Review Product Range</ButtonLink>
              <ButtonLink href={rfqHref} variant="onDark">
                Send Company RFQ
              </ButtonLink>
            </div>
          </div>
        </Container>
        <p
          data-nosnippet
          className="absolute bottom-3 right-4 max-w-xs bg-arc-midnight/85 px-3 py-2 text-right text-[10px] leading-4 text-slate-300 sm:bottom-5 sm:right-6 sm:text-xs"
        >
          Representative product-range image. Exact items are confirmed by quotation.
        </p>
      </section>

      <PageSectionNav ariaLabel="About page sections" items={sectionLinks} />

      <Section id="company" labelledBy="company-title" className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <SectionHeading
            id="company-title"
            eyebrow="Company & Brand"
            title="One legal company, one buyer-facing product brand."
            description={`${siteConfig.legalName} is the legal business behind ${siteConfig.name}. The brand organizes product information, buyer resources and international RFQs; the legal company remains the commercial identity used for supplier review and order discussion.`}
          />
          <div>
            <div className="space-y-5 text-base leading-8 text-slate-700">
              <p>
                The supply scope covers welding machines, cutting machines, MIG/MAG and TIG torch
                consumables, plasma cutting consumables, welding consumables, industrial accessories
                and OEM welding products.
              </p>
              <p>
                Product-specific details are reviewed against the buyer&apos;s model, drawing,
                sample, product photo or documented requirement before quotation. A category or
                family name alone is not treated as proof of exact fit.
              </p>
            </div>
            <dl className="mt-8 divide-y divide-white/15 bg-arc-midnight px-6 text-white sm:px-8">
              {[
                ["Legal English Name", siteConfig.legalName],
                ["Legal Chinese Name", siteConfig.chineseName],
                ["Website Brand", siteConfig.name],
                ["Business Location", siteConfig.address],
                ["Business Email", siteConfig.email],
                ["WhatsApp", siteConfig.whatsapp],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="text-xs font-bold uppercase text-slate-400">{label}</dt>
                  <dd className="break-words text-sm font-semibold leading-6 text-white">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      <Section id="product-scope" labelledBy="product-scope-title" className="bg-arc-frost">
        <Container>
          <SectionHeading
            id="product-scope-title"
            eyebrow="Product Systems"
            title="Welding and cutting products organized for B2B sourcing."
            description="Browse the published range by product system. Exact material, dimensions, thread, compatibility, packing and compliance documents remain item-specific quotation details."
            className="max-w-3xl"
          />
          <div className="mt-10 grid border-y border-arc-line md:grid-cols-2">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/products/${category.slug}`}
                className={`group grid gap-3 border-arc-line py-6 transition hover:text-arc-blue md:px-6 ${
                  index % 2 === 0 ? "md:border-r" : ""
                } ${index >= 2 ? "border-t" : index === 1 ? "border-t md:border-t-0" : ""}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase text-arc-blue">
                    {category.code}
                  </span>
                  <span className="text-arc-blue" aria-hidden="true">
                    &rarr;
                  </span>
                </div>
                <h3 className="font-display text-2xl font-black leading-tight text-arc-midnight group-hover:text-arc-blue">
                  {category.title}
                </h3>
                <p className="text-sm leading-6 text-slate-600">{category.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="buyer-paths" labelledBy="buyer-paths-title" className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            id="buyer-paths-title"
            eyebrow="Buyer Programs"
            title="A practical route for each purchasing context."
            description="Start with the path that matches the way your company buys, verifies and repeats welding products."
          />
          <BuyerPathList
            items={companyBuyerProfiles}
            ariaLabel="Buyer programs and sourcing routes"
          />
        </Container>
      </Section>

      <Section
        id="order-basis"
        labelledBy="order-basis-title"
        className="bg-arc-midnight text-white"
      >
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            id="order-basis-title"
            eyebrow="Inquiry to Order Basis"
            title="Keep buyer references and confirmed order details traceable."
            description="Open technical fields remain visible until both parties review the same product evidence and commercial basis."
            inverse
          />
          <ProcessSteps items={companyInquiryStages} inverse />
        </Container>
      </Section>

      <Section id="evidence" labelledBy="evidence-title" className="bg-white">
        <Container>
          <SectionHeading
            id="evidence-title"
            eyebrow="Evidence Boundaries"
            title="Know what is confirmed and what remains product-specific."
            description="Company identity and standard commercial policies can support initial supplier review. Technical fit, compliance and order execution still depend on the requested product and destination."
            className="max-w-4xl"
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
            {[
              {
                title: "Confirmed company information",
                items: companyEvidenceBoundaries.confirmed,
              },
              {
                title: "Confirm for each product or order",
                items: companyEvidenceBoundaries.productSpecific,
              },
            ].map((group) => (
              <div key={group.title}>
                <h3 className="font-display text-2xl font-black text-arc-midnight">
                  {group.title}
                </h3>
                <ul className="mt-5 divide-y divide-arc-line border-y border-arc-line">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="grid grid-cols-[1rem_1fr] gap-3 py-4 text-sm leading-6 text-slate-700"
                    >
                      <span className="font-black text-arc-blue" aria-hidden="true">
                        +
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-y border-arc-line bg-arc-frost">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            eyebrow="Buyer Resources"
            title="Continue supplier review with the right evidence."
            description="Review quality coordination, commercial terms and working files before sending an itemized RFQ."
          />
          <BuyerPathList items={companyResourceLinks} ariaLabel="Company review resources" />
        </Container>
      </Section>

      <Section className="bg-white">
        <Container className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <FaqSection items={[...companyFaq]} title="Company FAQ" />
          <RfqCta
            title="Ready to discuss a welding product requirement?"
            description="Send an itemized product list, target model or reference, quantity, destination and any drawing, photo or sample details available for review."
            rfqPrompt={companyRfqPrompt}
          />
        </Container>
      </Section>
    </>
  );
}
