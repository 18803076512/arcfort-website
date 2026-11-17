import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerPathList } from "@/components/content/BuyerPathList";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { StructuredData } from "@/components/content/StructuredData";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";
import { RfqForm } from "./RfqForm";

type RfqPageProps = {
  searchParams: Promise<{
    product?: string;
    quantity?: string;
  }>;
};

const inquiryChecklist = [
  "Product name, model, size, thread or existing reference",
  "Drawing, product photo, label, sample details or part number",
  "Quantity by item and standard or customized packing requirement",
  "Destination country, target schedule and required market documents",
] as const;

const processSteps = [
  {
    step: "01",
    title: "Submit the product list",
    description:
      "Enter one item or a mixed-product requirement and attach the available evidence files.",
  },
  {
    step: "02",
    title: "Clarify technical details",
    description:
      "Open questions about model, dimensions, material, compatibility or documentation are reviewed.",
  },
  {
    step: "03",
    title: "Review quotation options",
    description:
      "Confirm the quoted item, quantity basis, packing, lead time, payment terms and open fields.",
  },
  {
    step: "04",
    title: "Approve the order basis",
    description:
      "Align product evidence, artwork, packing and shipment requirements before order execution.",
  },
] as const;

const relatedResources = [
  {
    href: "/downloads",
    title: "RFQ Workbooks",
    description: "Download a structured file for distributor, machine, plasma or OEM requirements.",
  },
  {
    href: "/quality-control#inspection-workflow",
    title: "Quality Coordination",
    description: "Review product evidence, approval points and order-specific inspection planning.",
  },
  {
    href: "/shipping-payment#export-order-workflow",
    title: "Shipping & Payment",
    description: "Review confirmed payment, lead-time, MOQ and export-order information.",
  },
  {
    href: "/about",
    title: "Company Profile",
    description: "Verify the legal company, business location, brand and supply scope.",
  },
] as const;

export const metadata = buildMetadata({
  title: "Request a Quote",
  description:
    "Submit an RFQ to ArcFort Weld for MIG/MAG torch parts, TIG torch parts, plasma cutting consumables, welding accessories and industrial sourcing programs.",
  path: "/rfq",
  keywords: [
    "welding RFQ",
    "welding parts quotation",
    "plasma consumables inquiry",
    "MIG/MAG torch parts supplier",
  ],
});

export default async function RfqPage({ searchParams }: RfqPageProps) {
  const params = await searchParams;
  const initialProduct = typeof params.product === "string" ? params.product : "";
  const initialQuantity = typeof params.quantity === "string" ? params.quantity : "";
  const emailHref = buildEmailHref({ subject: "ArcFort Weld RFQ by email" });
  const whatsappHref = buildWhatsAppHref();

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Request a Quote", path: "/rfq" },
          ]),
          webPageJsonLd({
            name: "Request a Quote",
            description:
              "RFQ form for ArcFort Weld welding torch parts, plasma cutting consumables, welding accessories and OEM sourcing programs.",
            path: "/rfq",
          }),
        ]}
      />

      <div className="bg-white py-3 sm:py-4">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request a Quote" }]} />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="grid gap-5 py-6 sm:py-8 lg:grid-cols-[1fr_0.7fr] lg:items-center lg:gap-12">
          <div>
            <h1 className="font-display text-3xl font-black leading-tight sm:text-4xl">
              Request a Quote
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Send your product reference, quantity and destination. Add a drawing or photo when
              available.
            </p>
          </div>
          <div className="hidden flex-wrap items-center gap-x-5 gap-y-1 border-l border-white/20 pl-6 lg:flex">
            <a
              href={emailHref}
              className="inline-flex min-h-11 items-center break-all text-sm font-bold text-white underline-offset-4 hover:underline"
            >
              {siteConfig.email}
            </a>
            <a
              href={whatsappHref}
              className="inline-flex min-h-11 items-center text-sm font-bold text-white underline-offset-4 hover:underline"
            >
              WhatsApp {siteConfig.whatsapp}
            </a>
          </div>
        </Container>
      </section>

      <section
        data-disable-sticky-contact-bar
        className="bg-arc-frost py-6 sm:py-8 lg:py-10"
        aria-labelledby="rfq-form-title"
      >
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1.32fr)_minmax(19rem,0.68fr)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <div className="mb-4">
              <h2
                id="rfq-form-title"
                className="font-display text-xl font-black text-arc-midnight sm:text-2xl"
              >
                Your requirements
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Use selected products, enter a requirement or upload your product list.
              </p>
            </div>
            <RfqForm initialProduct={initialProduct} initialQuantity={initialQuantity} />
          </div>

          <aside className="lg:sticky lg:top-28">
            <p className="mb-5 text-sm leading-6 text-slate-600">
              ArcFort Weld reviews the technical and commercial details before quotation. Use email
              or WhatsApp for larger files or follow-up on an existing RFQ reference.
            </p>
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Details that help us quote
            </h2>
            <ul className="mt-5 divide-y divide-arc-line border-y border-arc-line">
              {inquiryChecklist.map((item) => (
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
            <div className="mt-7 border-l-4 border-arc-signal bg-white p-5">
              <h3 className="font-display text-xl font-black text-arc-midnight">
                Check fit before ordering
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                A family name or visual similarity does not confirm fit. Send the torch or machine
                model, current part, drawing, sample or measured reference available for review.
              </p>
            </div>
          </aside>
        </Container>
      </section>

      <Section labelledBy="rfq-process-title" className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            id="rfq-process-title"
            eyebrow="After Submission"
            title="What happens next."
            description="Review the product reference, clarify the details and agree on the order requirements."
          />
          <ProcessSteps items={processSteps} />
        </Container>
      </Section>

      <Section className="border-t border-arc-line bg-arc-frost">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            eyebrow="Supporting Information"
            title="Useful before quotation."
            description="Find product-list templates, company information and order guidance."
          />
          <BuyerPathList items={relatedResources} ariaLabel="RFQ supporting resources" />
        </Container>
      </Section>
    </>
  );
}
