import Image from "next/image";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerPathList } from "@/components/content/BuyerPathList";
import { FaqSection } from "@/components/content/FaqSection";
import { PageSectionNav } from "@/components/content/PageSectionNav";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
import {
  qualityBuyerSupplierControls,
  qualityEvidenceOptions,
  qualityFaq,
  qualityInspectionStages,
  qualityProductReviewMatrix,
  qualityResourceLinks,
  qualityRfqPrompt,
} from "@/lib/content/quality-control";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const qualityImage = "/images/site/arcfort-oem-consumables-workbench.png";

const sectionLinks = [
  { href: "#inspection-workflow", label: "Inspection Workflow" },
  { href: "#product-review-matrix", label: "Product Review" },
  { href: "#order-controls", label: "Order Controls" },
  { href: "#quality-evidence", label: "Evidence" },
  { href: "#quality-faq", label: "FAQ" },
] as const;

export const metadata = buildMetadata({
  title: "Welding Parts Quality Control & Inspection",
  description:
    "Review ArcFort Weld product-reference, compatibility, packing and pre-shipment control points for welding parts, machines and plasma consumables.",
  path: "/quality-control",
  image: qualityImage,
  keywords: [
    "welding product quality control",
    "welding parts inspection",
    "export packing inspection",
    "plasma consumables supplier quality",
  ],
});

export default function QualityControlPage() {
  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Quality Control", path: "/quality-control" },
          ]),
          webPageJsonLd({
            name: "Welding Parts Quality Control and Inspection",
            description:
              "Order-specific product-reference, compatibility, packing and pre-shipment review for welding and cutting product supply.",
            path: "/quality-control",
            image: qualityImage,
            dateModified: siteConfig.qualityLastModified,
          }),
          faqJsonLd([...qualityFaq]),
        ]}
      />

      <div className="border-b border-arc-line bg-white py-4">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Quality Control" }]} />
        </Container>
      </div>

      <section className="relative isolate overflow-hidden bg-arc-midnight text-white">
        <Image
          src={qualityImage}
          alt="Representative welding products arranged for reference and packing review"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
          quality={90}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,31,51,0.99)_0%,rgba(11,31,51,0.92)_50%,rgba(11,31,51,0.56)_100%)]" />
        <Container className="flex min-h-[620px] items-center py-14 sm:py-16 lg:py-20">
          <div className="max-w-4xl">
            <p className="section-eyebrow !text-slate-300">Order-Specific Quality Coordination</p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-black leading-[1.06] text-white sm:text-5xl lg:text-6xl">
              Quality control starts with an approved product reference.
            </h1>
            <p className="body-large mt-6 max-w-3xl text-slate-200">
              Define the item, compatibility basis, critical details, packing and required evidence
              before production planning and shipment approval.
            </p>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">
              The inspection scope varies by product and order. Requested photos, measurements,
              samples or records must be confirmed in the quotation or approved order details.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`/rfq?product=${encodeURIComponent(qualityRfqPrompt)}`}>
                Define Inspection Requirements
              </ButtonLink>
              <ButtonLink href="#product-review-matrix" variant="onDark">
                Review Product Checks
              </ButtonLink>
            </div>
          </div>
        </Container>
        <p
          data-nosnippet
          className="absolute bottom-4 right-4 max-w-xs bg-arc-midnight/85 px-3 py-2 text-right text-xs font-semibold text-slate-200 sm:bottom-6 sm:right-6"
        >
          Representative product-review image; inspection scope is confirmed by order
        </p>
      </section>

      <PageSectionNav ariaLabel="Quality control page sections" items={sectionLinks} />

      <Section
        id="inspection-workflow"
        labelledBy="inspection-workflow-title"
        className="scroll-mt-32 bg-white"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
            <SectionHeading
              id="inspection-workflow-title"
              eyebrow="Inspection Workflow"
              title="Four approval points tied to the order record."
            />
            <p className="body-large max-w-3xl lg:justify-self-end">
              Buyer evidence defines what can be reviewed, when approval is required and which
              record should be retained for the quoted item.
            </p>
          </div>
          <ol className="mt-10 divide-y divide-arc-line border-y border-arc-line">
            {qualityInspectionStages.map((stage) => (
              <li
                key={stage.step}
                className="grid gap-5 py-7 md:grid-cols-[0.42fr_0.9fr_1fr_1fr] md:gap-6"
              >
                <div>
                  <span className="font-display text-3xl font-black text-arc-blue">
                    {stage.step}
                  </span>
                  <h2 className="mt-2 font-display text-xl font-black leading-tight text-arc-midnight">
                    {stage.title}
                  </h2>
                </div>
                <div>
                  <p className="caption text-arc-blue">Buyer evidence</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{stage.buyerEvidence}</p>
                </div>
                <div>
                  <p className="caption text-arc-blue">Review focus</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{stage.reviewFocus}</p>
                </div>
                <div>
                  <p className="caption text-arc-blue">Order record</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{stage.orderRecord}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section
        id="product-review-matrix"
        labelledBy="product-review-heading"
        className="scroll-mt-32 border-y border-arc-line bg-arc-frost"
      >
        <Container>
          <SectionHeading
            id="product-review-heading"
            eyebrow="Product Review Matrix"
            title="Different product families fail for different reasons."
            description="This matrix prepares the evidence needed to distinguish the requested item. It does not treat a broad model name or similar appearance as confirmed compatibility."
            className="max-w-4xl"
          />
          <div className="mt-10 border-y border-arc-line bg-white">
            <div className="hidden grid-cols-[0.6fr_1fr_1fr_1fr] gap-6 bg-arc-midnight px-5 py-4 text-xs font-bold uppercase text-white lg:grid">
              <span>Product family</span>
              <span>Common mismatch risk</span>
              <span>Buyer should send</span>
              <span>Lock before order</span>
            </div>
            <div className="divide-y divide-arc-line">
              {qualityProductReviewMatrix.map((item, index) => (
                <article
                  key={item.family}
                  className="grid gap-5 px-5 py-7 lg:grid-cols-[0.6fr_1fr_1fr_1fr] lg:gap-6"
                >
                  <div>
                    <span className="caption text-arc-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-2 font-display text-xl font-black leading-tight text-arc-midnight">
                      {item.family}
                    </h2>
                  </div>
                  <div>
                    <p className="caption text-slate-500 lg:hidden">Common mismatch risk</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 lg:mt-0">
                      {item.commonRisk}
                    </p>
                  </div>
                  <div>
                    <p className="caption text-arc-blue lg:hidden">Buyer should send</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700 lg:mt-0">
                      {item.buyerShouldSend}
                    </p>
                  </div>
                  <div>
                    <p className="caption text-slate-500 lg:hidden">Lock before order</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 lg:mt-0">
                      {item.lockBeforeOrder}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section
        id="order-controls"
        labelledBy="order-controls-title"
        className="scroll-mt-32 bg-arc-midnight text-white"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
            <SectionHeading
              id="order-controls-title"
              eyebrow="Buyer and Supplier Controls"
              title="Compare each requirement with a written confirmation."
              inverse
            />
            <p className="body-large max-w-3xl text-slate-300 lg:justify-self-end">
              Unknown values stay open until they can be traced to a drawing, sample, label,
              measurement or reviewed document.
            </p>
          </div>
          <div className="mt-10 divide-y divide-white/15 border-y border-white/20">
            {qualityBuyerSupplierControls.map((item) => (
              <article
                key={item.area}
                className="grid gap-5 py-6 md:grid-cols-[0.5fr_1fr_1fr] md:gap-6"
              >
                <h2 className="font-display text-xl font-black text-white">{item.area}</h2>
                <div>
                  <p className="caption text-arc-signal">Buyer input</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.buyerInput}</p>
                </div>
                <div>
                  <p className="caption text-arc-signal">Supplier confirmation</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.supplierConfirmation}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section
        id="quality-evidence"
        labelledBy="quality-evidence-title"
        className="scroll-mt-32 bg-white"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <SectionHeading
              id="quality-evidence-title"
              eyebrow="Evidence Options"
              title="Ask for the required record before order approval."
              description="Availability, format, timing and cost vary by SKU and order. State the requirement in the RFQ so it can be confirmed in writing."
            />
            <dl className="divide-y divide-arc-line border-y border-arc-line">
              {qualityEvidenceOptions.map((item) => (
                <div key={item.title} className="grid gap-2 py-6 sm:grid-cols-[210px_1fr] sm:gap-8">
                  <dt className="font-display text-xl font-black text-arc-midnight">
                    {item.title}
                  </dt>
                  <dd className="text-sm leading-7 text-slate-600">{item.description}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-12 border-l-4 border-arc-signal bg-arc-frost p-5 sm:p-6">
            <p className="caption text-arc-blue">Certification and Compliance Requests</p>
            <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-700">
              Certification is not assumed from a product family or similar model. State the
              destination market, exact product and required document during quotation. ArcFort Weld
              will confirm only the documents available for the specific quoted item.
            </p>
          </div>

          <div className="mt-14">
            <SectionHeading
              eyebrow="Continue the Buying Process"
              title="Connect product review to order approval."
            />
            <BuyerPathList items={qualityResourceLinks} ariaLabel="Quality control buyer paths" />
          </div>
        </Container>
      </Section>

      <Section id="quality-faq" className="scroll-mt-32 border-t border-arc-line bg-arc-frost">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <FaqSection items={[...qualityFaq]} title="Quality Coordination FAQ" />
          <RfqCta
            title="Define the inspection scope with the product RFQ."
            description="Send the itemized list, model or current reference, critical details, quantity, compatibility evidence, packing requirement and the inspection records you need."
            productName="Welding product quality and inspection review"
            rfqPrompt={qualityRfqPrompt}
          />
        </Container>
      </Section>
    </>
  );
}
