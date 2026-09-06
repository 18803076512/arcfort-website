import { RfqForm } from "@/app/(public)/rfq/RfqForm";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerPathList } from "@/components/content/BuyerPathList";
import { PageSectionNav } from "@/components/content/PageSectionNav";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { StructuredData } from "@/components/content/StructuredData";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";

const contactItems = [
  {
    label: "Business Email",
    value: siteConfig.email,
    href: buildEmailHref({ subject: "ArcFort Weld product inquiry" }),
    note: "Product lists, drawings, workbooks and detailed quotation requests.",
  },
  {
    label: "WhatsApp",
    value: siteConfig.whatsapp,
    href: buildWhatsAppHref(),
    note: "Product photos, model references and quotation follow-up.",
  },
  {
    label: "Legal Company",
    value: siteConfig.legalName,
    href: undefined,
    note: siteConfig.chineseName,
  },
  {
    label: "Business Location",
    value: siteConfig.address,
    href: undefined,
    note: `Main export port: ${siteConfig.mainPort}.`,
  },
] as const;

const buyerChecklist = [
  "Product name, torch or machine model, size and material requirement",
  "Existing part number, drawing, product photo, label or reference sample",
  "Required quantity by item and standard or customized packing needs",
  "Destination country, target schedule and any market-document requirement",
] as const;

const responseSteps = [
  {
    step: "01",
    title: "Receive the inquiry",
    description: "The submitted item list, buyer details and attachments form one RFQ record.",
  },
  {
    step: "02",
    title: "Review open details",
    description:
      "Model, compatibility, dimensions, packing or documentation questions are identified for follow-up.",
  },
  {
    step: "03",
    title: "Prepare the quotation basis",
    description:
      "Quoted products, MOQ, lead-time basis, packing and payment terms are presented for review.",
  },
  {
    step: "04",
    title: "Confirm the next action",
    description:
      "Both parties align on samples, drawings, artwork, order details or further technical evidence.",
  },
] as const;

const resourceLinks = [
  {
    href: "/about",
    title: "Verify Company Identity",
    description: "Review the legal company, ArcFort Weld brand and confirmed business information.",
  },
  {
    href: "/quality-control",
    title: "Review Quality Coordination",
    description: "Understand product evidence, approval and inspection points.",
  },
  {
    href: "/shipping-payment#export-order-workflow",
    title: "Review Export Order Terms",
    description: "Check payment, MOQ, lead-time and shipping information before quotation.",
  },
  {
    href: "/downloads",
    title: "Download RFQ Workbooks",
    description: "Prepare distributor, machine, plasma or OEM requirements in a structured file.",
  },
] as const;

const sectionLinks = [
  { href: "#contact-channels", label: "Contact Details" },
  { href: "#contact-inquiry-form", label: "Send Inquiry" },
  { href: "#response-process", label: "Response Process" },
] as const;

export const metadata = buildMetadata({
  title: "Contact Renqiu Ailesen | ArcFort Weld",
  description:
    "Contact Renqiu Ailesen Welding Technology Co., Ltd. through ArcFort Weld for welding parts, cutting consumables, OEM supply and export RFQs.",
  path: "/contact",
  keywords: [
    "contact welding parts supplier",
    "welding consumables RFQ",
    "plasma cutting consumables inquiry",
    "industrial welding supplier",
  ],
});

export default function ContactPage() {
  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          webPageJsonLd({
            name: "Contact Renqiu Ailesen Welding Technology Co., Ltd.",
            description:
              "Contact Renqiu Ailesen Welding Technology Co., Ltd. through ArcFort Weld for welding and cutting product RFQs and export sourcing support.",
            path: "/contact",
            pageType: "ContactPage",
          }),
        ]}
      />

      <div className="bg-white py-5 sm:py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        </Container>
      </div>

      <section id="contact-channels" className="scroll-mt-32 bg-arc-midnight text-white">
        <Container className="grid gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_0.82fr] lg:items-end lg:gap-16 lg:py-20">
          <div>
            <p className="section-eyebrow !text-arc-signal">Company Contact</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Contact ArcFort Weld for welding and cutting product sourcing.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Send the product reference, quantity, destination and available drawing, photo or
              sample evidence. The inquiry will be reviewed under {siteConfig.legalName}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#contact-inquiry-form">Send Product Inquiry</ButtonLink>
              <ButtonLink href="/products" variant="onDark">
                Browse Product Systems
              </ButtonLink>
            </div>
          </div>
          <dl className="divide-y divide-white/15 border-y border-white/20">
            {contactItems.map((item) => (
              <div key={item.label} className="py-4">
                <dt className="text-xs font-bold uppercase text-slate-400">{item.label}</dt>
                <dd className="mt-2">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="break-words text-base font-bold leading-7 text-white transition hover:text-arc-signal"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="break-words text-base font-bold leading-7 text-white">
                      {item.value}
                    </span>
                  )}
                  <span className="mt-1 block text-xs leading-5 text-slate-400">{item.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <PageSectionNav ariaLabel="Contact page sections" items={sectionLinks} />

      <Section
        id="contact-inquiry-form"
        labelledBy="contact-inquiry-title"
        className="scroll-mt-36 bg-arc-frost"
      >
        <Container className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-36">
            <SectionHeading
              id="contact-inquiry-title"
              eyebrow="Direct Inquiry"
              title="Send enough detail for a useful first response."
              description="Use the website form for a structured RFQ. Email and WhatsApp remain available for large files or follow-up."
            />
            <ul className="mt-7 divide-y divide-arc-line border-y border-arc-line">
              {buyerChecklist.map((item) => (
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
            <p className="mt-5 text-xs leading-5 text-slate-500">
              Technical details and compatibility are confirmed against the exact requested product;
              the form does not treat a family name as proof of fit.
            </p>
          </div>
          <div data-disable-sticky-contact-bar>
            <RfqForm
              initialProduct="General welding and cutting product inquiry"
              formPlacement="contact_page"
            />
          </div>
        </Container>
      </Section>

      <Section id="response-process" labelledBy="response-process-title" className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            id="response-process-title"
            eyebrow="Response Process"
            title="From buyer evidence to quotation review."
            description="Each step keeps the requested item, open questions and commercial basis visible."
          />
          <ProcessSteps items={responseSteps} />
        </Container>
      </Section>

      <Section className="border-t border-arc-line bg-arc-frost">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            eyebrow="Before You Submit"
            title="Review the information relevant to your order."
            description="Use the supporting pages when company verification, quality evidence, trade terms or a structured workbook is required."
          />
          <BuyerPathList items={resourceLinks} ariaLabel="Contact page buyer resources" />
        </Container>
      </Section>
    </>
  );
}
