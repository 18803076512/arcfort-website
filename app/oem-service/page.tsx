import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerPathList } from "@/components/content/BuyerPathList";
import { FaqSection } from "@/components/content/FaqSection";
import { PageSectionNav } from "@/components/content/PageSectionNav";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { OemRfqBuilder } from "@/components/oem/OemRfqBuilder";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const oemPrograms = [
  {
    title: "Product customization",
    description:
      "Review product and model requirements from buyer samples, drawings, photos or technical documents.",
  },
  {
    title: "Logo and private label",
    description:
      "Discuss logo position, label content and private-label presentation for selected product families.",
  },
  {
    title: "Packaging development",
    description:
      "Coordinate packing unit, label, barcode, inner packaging, carton artwork and shipping marks.",
  },
  {
    title: "Approval records",
    description:
      "Keep the approved product reference, artwork version, packing basis and order details traceable.",
  },
] as const;

const productScope = [
  { href: "/products/mig-mag-torch-parts", label: "MIG/MAG torch parts" },
  { href: "/products/tig-torch-parts", label: "TIG torch parts" },
  { href: "/products/plasma-cutting-consumables", label: "Plasma cutting consumables" },
  { href: "/products/welding-consumables", label: "Welding consumables" },
  { href: "/products/welding-accessories", label: "Welding accessories" },
] as const;

const rfqChecklist = [
  "Target product name, model, size, material and quantity",
  "Sample photo, drawing, reference part or current product label",
  "Logo file, label size, carton style and private-label requirement",
  "Destination country, shipping plan and expected delivery schedule",
] as const;

const processSteps = [
  {
    step: "01",
    title: "Review the project brief",
    description:
      "Separate each product line and record customization, quantity, destination and available evidence.",
  },
  {
    step: "02",
    title: "Confirm the product basis",
    description:
      "Review the sample, drawing, current part or documented reference before approving customization.",
  },
  {
    step: "03",
    title: "Approve artwork and packing",
    description:
      "Lock the logo, label, barcode, packing unit, carton artwork and shipping-mark versions in writing.",
  },
  {
    step: "04",
    title: "Confirm quotation and order",
    description:
      "Review MOQ, lead-time basis, sample requirements, payment terms and export preparation for the quoted scope.",
  },
] as const;

const oemSupportLinks = [
  {
    href: "/about",
    title: "Company Profile",
    description: "Verify the legal company, ArcFort Weld brand and confirmed business identity.",
  },
  {
    href: "/guides/oem-welding-products-private-label-guide",
    title: "OEM Buyer Guide",
    description: "Plan product approval, artwork control, packing and repeat-order records.",
  },
  {
    href: "/quality-control",
    title: "Quality Coordination",
    description: "Review product-reference, packing and pre-shipment control points.",
  },
  {
    href: "/shipping-payment#export-order-workflow",
    title: "Shipping & Payment",
    description: "Check payment stages, lead-time basis and the export-order workflow.",
  },
  {
    href: "/downloads",
    title: "Catalogs & RFQ Files",
    description: "Use the company catalog and worksheets to prepare an itemized request.",
  },
] as const;

const faq = [
  {
    question: "Can ArcFort Weld support private label welding products?",
    answer:
      "Yes. Private label packaging can be discussed for selected welding torch parts, consumables and accessories after product details, artwork and quantity are confirmed.",
  },
  {
    question: "Can OEM models be produced from samples or drawings?",
    answer:
      "Buyers can send samples, drawings, product photos or technical requirements. ArcFort Weld will review the details before quotation and production confirmation.",
  },
  {
    question: "Is there a fixed OEM MOQ?",
    answer:
      "OEM MOQ depends on product type, model, packaging requirement and customization scope. Standard products can support small trial orders when available.",
  },
] as const;

const sectionLinks = [
  { href: "#oem-scope", label: "OEM Scope" },
  { href: "#oem-process", label: "Approval Process" },
  { href: "#oem-rfq-builder", label: "RFQ Builder" },
  { href: "#oem-project-files", label: "Project Files" },
  { href: "#oem-faq", label: "FAQ" },
] as const;

const oemProjectBriefHref = "/downloads/arcfort-oem-project-brief.xlsx";

export const metadata = buildMetadata({
  title: "OEM Welding Products and Private Label Service",
  description:
    "ArcFort Weld supports OEM welding products, logo printing, private label packaging, carton design and model customization for global distributors and importers.",
  path: "/oem-service",
  keywords: [
    "OEM welding products",
    "private label welding accessories",
    "custom welding consumables",
    "welding parts OEM supplier",
  ],
});

export default function OemServicePage() {
  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "OEM Service", path: "/oem-service" },
          ]),
          webPageJsonLd({
            name: "OEM Welding Products and Private Label Service",
            description:
              "OEM welding product, logo, private label packaging and model customization support for overseas distributors and importers.",
            path: "/oem-service",
            dateModified: siteConfig.oemLastModified,
          }),
          faqJsonLd([...faq]),
        ]}
      />

      <div className="border-b border-arc-line bg-white py-4">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "OEM / ODM" }]} />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="grid min-h-[620px] gap-10 py-14 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
          <div>
            <p className="section-eyebrow !text-slate-300">OEM / ODM Welding Products</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-[1.06] text-white sm:text-5xl lg:text-6xl">
              Build a welding product range around an approved reference.
            </h1>
            <p className="body-large mt-6 max-w-2xl text-slate-200">
              ArcFort Weld supports product customization, logo application, private-label packing
              and carton development for distributors, importers and OEM buyers.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
              Feasibility, MOQ and timing depend on the product, evidence, artwork, quantity and
              packing scope reviewed for the project.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#oem-rfq-builder">Build an OEM Brief</ButtonLink>
              <a href={oemProjectBriefHref} download className="button-base button-on-dark">
                Download Project Brief
              </a>
            </div>
          </div>

          <div className="relative aspect-[5/4] overflow-hidden bg-white">
            <Image
              src="/images/site/arcfort-oem-consumables-workbench.png"
              alt="Representative welding product and packing references for OEM project discussion"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
              quality={90}
            />
            <p
              data-nosnippet
              className="absolute bottom-0 left-0 right-0 bg-arc-midnight/90 px-4 py-3 text-xs font-semibold text-slate-200"
            >
              {
                "Representative product and packing reference. This visual is not proof of an exact SKU or production facility."
              }
            </p>
          </div>
        </Container>
      </section>

      <PageSectionNav ariaLabel="OEM service page sections" items={sectionLinks} />

      <Section id="oem-scope" labelledBy="oem-scope-title" className="scroll-mt-32 bg-white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <SectionHeading
              id="oem-scope-title"
              eyebrow="OEM Scope"
              title="Control the product and presentation as one project."
              description="Customization should begin only after the base item and the buyer's commercial requirements are clearly separated."
            />
            <dl className="divide-y divide-arc-line border-y border-arc-line">
              {oemPrograms.map((item) => (
                <div key={item.title} className="grid gap-2 py-6 sm:grid-cols-[190px_1fr] sm:gap-8">
                  <dt className="font-display text-xl font-black text-arc-midnight">
                    {item.title}
                  </dt>
                  <dd className="text-sm leading-7 text-slate-600">{item.description}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-14 border-t border-arc-line pt-8">
            <p className="caption text-arc-blue">Product Families</p>
            <div className="mt-4 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {productScope.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-16 items-center justify-between border-b border-arc-line font-bold text-arc-midnight transition hover:text-arc-blue"
                >
                  {item.label}
                  <span className="text-arc-blue" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section
        id="oem-process"
        labelledBy="oem-process-title"
        className="scroll-mt-32 border-y border-arc-line bg-arc-frost"
      >
        <Container className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
          <SectionHeading
            id="oem-process-title"
            eyebrow="Approval Process"
            title="Move from buyer evidence to a controlled order record."
            description="Unknown product, artwork and packing details remain open until they are confirmed in the quotation or approval record."
          />
          <ProcessSteps items={processSteps} />
        </Container>
      </Section>

      <Section id="oem-rfq-builder" className="scroll-mt-32 bg-white">
        <Container>
          <OemRfqBuilder />
        </Container>
      </Section>

      <Section
        id="oem-project-files"
        labelledBy="oem-project-files-title"
        className="scroll-mt-32 border-y border-arc-line bg-arc-frost"
      >
        <Container>
          <div className="grid overflow-hidden border border-arc-line lg:grid-cols-[1.18fr_0.82fr]">
            <div className="p-6 sm:p-8">
              <p className="section-eyebrow">Project Inputs</p>
              <h2
                id="oem-project-files-title"
                className="mt-3 font-display text-3xl font-black text-arc-midnight"
              >
                Give every product and artwork file a clear reference.
              </h2>
              <ol className="mt-7 divide-y divide-arc-line border-y border-arc-line">
                {rfqChecklist.map((item, index) => (
                  <li key={item} className="grid grid-cols-[36px_1fr] gap-3 py-4">
                    <span className="font-display font-black text-arc-blue">{index + 1}</span>
                    <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col justify-between bg-arc-midnight p-6 text-white sm:p-8">
              <div>
                <p className="caption text-slate-300">OEM Project Brief</p>
                <h2 className="mt-3 font-display text-2xl font-black">
                  Organize multi-item projects before quotation.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  The workbook keeps product lines, source files, logo, label, packing and
                  destination requirements in one review record.
                </p>
              </div>
              <a href={oemProjectBriefHref} download className="button-base button-primary mt-8">
                Download OEM Project Brief
              </a>
            </div>
          </div>

          <div className="mt-14">
            <SectionHeading
              eyebrow="Supporting Decisions"
              title="Review quality, delivery and documentation with the OEM scope."
            />
            <BuyerPathList items={oemSupportLinks} ariaLabel="OEM project supporting buyer paths" />
          </div>
        </Container>
      </Section>

      <Section id="oem-faq" className="scroll-mt-32 bg-white">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <FaqSection items={[...faq]} title="OEM / ODM FAQ" />
          <RfqCta
            title="Planning an OEM welding product program?"
            description="Send the product list, sample or drawing, logo artwork, packing requirement, quantity and destination for project review."
            productName="OEM welding products and private-label project"
          />
        </Container>
      </Section>
    </>
  );
}
