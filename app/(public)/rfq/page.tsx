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

      <div className="bg-white py-5 sm:py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request a Quote" }]} />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="grid gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-16 lg:py-20">
          <div>
            <p className="section-eyebrow !text-arc-signal">RFQ Center</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Request a welding and cutting product quotation.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Send your product list, model or reference, quantity, destination and available
              drawing, photo or sample evidence. ArcFort Weld will review the technical and
              commercial basis before quotation.
            </p>
          </div>
          <div className="border-l-4 border-arc-signal pl-6">
            <p className="text-xs font-bold uppercase text-slate-400">Direct Alternatives</p>
            <a
              href={emailHref}
              className="mt-4 block break-all text-base font-bold text-white transition hover:text-arc-signal"
            >
              {siteConfig.email}
            </a>
            <a
              href={whatsappHref}
              className="mt-3 block text-base font-bold text-white transition hover:text-arc-signal"
            >
              WhatsApp {siteConfig.whatsapp}
            </a>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Use email or WhatsApp for files above the website upload limit or for follow-up on an
              existing RFQ reference.
            </p>
          </div>
        </Container>
      </section>

      <section
        data-disable-sticky-contact-bar
        className="section-space bg-arc-frost"
        aria-labelledby="rfq-form-title"
      >
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1.32fr)_minmax(19rem,0.68fr)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <div className="mb-7">
              <p className="section-eyebrow">Submit Your Requirements</p>
              <h2 id="rfq-form-title" className="section-title mt-3">
                One form for product, quantity and evidence.
              </h2>
              <p className="body-large mt-4 max-w-3xl">
                Selected product pages are carried into the form automatically. You can also enter a
                general requirement or upload a completed product list.
              </p>
            </div>
            <RfqForm initialProduct={initialProduct} initialQuantity={initialQuantity} />
          </div>

          <aside className="lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              What makes an RFQ reviewable
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
                Compatibility needs evidence
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
            title="A clear path from inquiry to approved order basis."
            description="The workflow keeps buyer-supplied evidence, open questions and supplier-confirmed terms separate."
          />
          <ProcessSteps items={processSteps} />
        </Container>
      </Section>

      <Section className="border-t border-arc-line bg-arc-frost">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            eyebrow="Supporting Information"
            title="Prepare the evidence behind the RFQ."
            description="Use the available working files and company pages when the inquiry needs more structure or supplier review."
          />
          <BuyerPathList items={relatedResources} ariaLabel="RFQ supporting resources" />
        </Container>
      </Section>
    </>
  );
}
