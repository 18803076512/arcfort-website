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
  exportBuyerPaths,
  exportLeadTimeRows,
  exportOrderFaq,
  exportOrderStages,
  exportQuotationInputs,
  exportRfqPrompt,
  exportTradeCards,
} from "@/lib/content/export-order-terms";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const sectionLinks = [
  { href: "#commercial-basis", label: "Commercial Basis" },
  { href: "#lead-times", label: "Lead Times" },
  { href: "#export-order-workflow", label: "Order Workflow" },
  { href: "#quotation-preparation", label: "Quotation Inputs" },
  { href: "#shipping-faq", label: "FAQ" },
] as const;

export const metadata = buildMetadata({
  title: "Welding Product Shipping & Payment Terms",
  description:
    "Review ArcFort Weld payment terms, MOQ, lead times, Tianjin Port options, export packing and RFQ details for welding and cutting product orders.",
  path: "/shipping-payment",
  keywords: [
    "welding products shipping",
    "welding parts payment terms",
    "Tianjin Port welding supplier",
    "welding consumables MOQ",
    "welding products export packing",
  ],
});

export default function ShippingPaymentPage() {
  const rfqHref = `/rfq?product=${encodeURIComponent(exportRfqPrompt)}`;

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shipping and Payment", path: "/shipping-payment" },
          ]),
          webPageJsonLd({
            name: "Welding Product Shipping and Payment Terms",
            description:
              "Confirmed payment, MOQ, lead-time, port and export-order information for ArcFort Weld welding and cutting product RFQs.",
            path: "/shipping-payment",
            dateModified: siteConfig.contentLastModified,
          }),
          faqJsonLd([...exportOrderFaq]),
        ]}
      />

      <div className="border-b border-arc-line bg-white py-4">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shipping & Payment" }]} />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="grid min-h-[600px] gap-10 py-14 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
          <div>
            <p className="section-eyebrow !text-slate-300">Export Order Terms</p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-black leading-[1.06] text-white sm:text-5xl lg:text-6xl">
              Welding Product Shipping, Payment and Order Terms
            </h1>
            <p className="body-large mt-6 max-w-3xl text-slate-200">
              Review the confirmed commercial basis, then provide the itemized product, packing and
              destination details needed for an order-specific quotation.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={rfqHref}>Prepare an Export RFQ</ButtonLink>
              <ButtonLink href="#export-order-workflow" variant="onDark">
                Review Order Workflow
              </ButtonLink>
            </div>
          </div>
          <aside className="border-y border-white/20 py-2">
            <p className="caption py-4 text-arc-signal">Confirmed Commercial Basis</p>
            <dl className="divide-y divide-white/15 border-t border-white/15">
              {[
                ["Payment", siteConfig.paymentTerms],
                ["Regular lead time", siteConfig.regularLeadTime],
                ["Trial orders", siteConfig.moqPolicy],
                ["Main port", siteConfig.mainPort],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-2 py-4 sm:grid-cols-[145px_1fr] sm:gap-6">
                  <dt className="text-xs font-bold uppercase text-slate-400">{label}</dt>
                  <dd className="text-sm font-semibold leading-6 text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </Container>
      </section>

      <PageSectionNav ariaLabel="Shipping and payment page sections" items={sectionLinks} />

      <Section
        id="commercial-basis"
        labelledBy="commercial-basis-title"
        className="scroll-mt-32 bg-white"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <SectionHeading
              id="commercial-basis-title"
              eyebrow="Commercial Basis"
              title="Separate company policy from order-specific terms."
              description="The product, quantity, packing, destination and quotation timing determine the final commercial and shipment scope."
            />
            <dl className="divide-y divide-arc-line border-y border-arc-line">
              {exportTradeCards.map((item) => (
                <div key={item.title} className="grid gap-2 py-5 sm:grid-cols-[180px_1fr] sm:gap-8">
                  <dt className="font-bold text-arc-midnight">{item.title}</dt>
                  <dd className="break-words text-sm leading-7 text-slate-600">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-10 border-l-4 border-arc-signal bg-arc-frost p-5 text-sm leading-7 text-slate-700">
            Freight, insurance, Incoterms and shipment dates depend on destination, shipment size,
            transport method and quotation timing. They are confirmed in the order-specific
            quotation rather than fixed on the website.
          </p>
        </Container>
      </Section>

      <Section
        id="lead-times"
        labelledBy="lead-times-title"
        className="scroll-mt-32 border-y border-arc-line bg-arc-frost"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
            <SectionHeading
              id="lead-times-title"
              eyebrow="Lead-Time Basis"
              title="Match the schedule to the order type."
            />
            <p className="body-large max-w-3xl lg:justify-self-end">
              Lead time normally begins after deposit and order-detail confirmation. Product,
              materials, artwork and packing approvals can change the applicable schedule.
            </p>
          </div>
          <div className="mt-10 divide-y divide-arc-line border-y border-arc-line bg-white">
            {exportLeadTimeRows.map((row) => (
              <article
                key={row.orderType}
                className="grid gap-4 px-5 py-6 md:grid-cols-[0.55fr_0.85fr_1.2fr] md:gap-6"
              >
                <h2 className="font-display text-xl font-black text-arc-midnight">
                  {row.orderType}
                </h2>
                <p className="text-sm font-bold leading-6 text-arc-blue">{row.timing}</p>
                <p className="text-sm leading-6 text-slate-600">{row.confirmation}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section
        id="export-order-workflow"
        labelledBy="export-order-workflow-title"
        className="scroll-mt-32 bg-arc-midnight text-white"
      >
        <Container className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
          <SectionHeading
            id="export-order-workflow-title"
            eyebrow="Export Order Workflow"
            title="Control product, packing, payment and shipment in one record."
            description="The order sequence keeps buyer requirements separate from the details confirmed by ArcFort Weld."
            inverse
          />
          <ProcessSteps items={exportOrderStages} inverse />
        </Container>
      </Section>

      <Section
        id="quotation-preparation"
        labelledBy="quotation-preparation-title"
        className="scroll-mt-32 bg-white"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
            <SectionHeading
              id="quotation-preparation-title"
              eyebrow="Quotation Preparation"
              title="Make every commercial condition traceable."
            />
            <p className="body-large max-w-3xl lg:justify-self-end">
              Compare the buyer input and supplier response line by line. Unknown product, freight
              or document details stay open until confirmed in writing.
            </p>
          </div>
          <div className="mt-10 border-y border-arc-line">
            <div className="hidden grid-cols-[0.55fr_1fr_1fr] gap-6 bg-arc-midnight px-5 py-4 text-xs font-bold uppercase text-white lg:grid">
              <span>Quotation area</span>
              <span>Buyer should send</span>
              <span>Quotation should confirm</span>
            </div>
            <div className="divide-y divide-arc-line">
              {exportQuotationInputs.map((item, index) => (
                <article
                  key={item.title}
                  className="grid gap-5 px-1 py-6 sm:px-5 lg:grid-cols-[0.55fr_1fr_1fr]"
                >
                  <div>
                    <span className="caption text-arc-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-2 font-display text-xl font-black text-arc-midnight">
                      {item.title}
                    </h2>
                  </div>
                  <div>
                    <p className="caption text-arc-blue lg:hidden">Buyer should send</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700 lg:mt-0">
                      {item.buyerShouldSend}
                    </p>
                  </div>
                  <div>
                    <p className="caption text-slate-500 lg:hidden">Quotation should confirm</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 lg:mt-0">
                      {item.quotationShouldConfirm}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-14">
            <SectionHeading
              eyebrow="Continue the Buying Process"
              title="Connect trade terms to the product decision."
            />
            <BuyerPathList items={exportBuyerPaths} ariaLabel="Export order buyer paths" />
          </div>
        </Container>
      </Section>

      <Section id="shipping-faq" className="scroll-mt-32 border-t border-arc-line bg-arc-frost">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <FaqSection items={[...exportOrderFaq]} title="Shipping & Payment FAQ" />
          <RfqCta
            title="Prepare an order-specific shipping quotation."
            description="Send the itemized product list, quantity, packing or OEM scope, destination, requested transport basis and target schedule."
            productName="Export welding and cutting product order"
            rfqPrompt={exportRfqPrompt}
          />
        </Container>
      </Section>
    </>
  );
}
