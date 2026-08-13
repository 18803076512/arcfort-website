import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
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
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";

const qualityImage = "/images/site/arcfort-oem-consumables-workbench.png";

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

      <section className="bg-white py-5 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Quality Control" }]} />
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-arc-midnight text-white">
        <Image
          src={qualityImage}
          alt="Representative welding torch consumables and cutting parts arranged for product reference review"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,15,28,0.99)_0%,rgba(7,21,36,0.93)_48%,rgba(7,21,36,0.58)_100%)]" />
        <div className="mx-auto flex min-h-[34rem] max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase leading-6 tracking-[0.14em] text-arc-signal sm:tracking-[0.2em]">
              Order-Specific Quality Control
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Quality control starts with an approved product reference.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
              For welding torch parts, plasma consumables, machines and accessories, inspection is
              only useful when the item, critical details, compatibility basis and packing
              requirements are defined. This page shows what buyers should send and what should be
              recorded before production and shipment approval.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={`/rfq?product=${encodeURIComponent(qualityRfqPrompt)}`}
                className="inline-flex min-h-12 w-full items-center justify-center bg-arc-signal px-6 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white sm:w-auto"
              >
                Send Inspection RFQ
              </Link>
              <Link
                href="#product-review-matrix"
                className="inline-flex min-h-12 w-full items-center justify-center border border-white/35 px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Review Product Checks
              </Link>
            </div>
            <div className="mt-5 flex flex-col gap-1 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:gap-5">
              <a
                href={buildEmailHref({ subject: "ArcFort Weld quality and inspection inquiry" })}
                className="inline-flex min-h-8 min-w-0 items-center break-all font-semibold hover:text-white sm:break-normal"
              >
                {siteConfig.email}
              </a>
              <a
                href={buildWhatsAppHref({ message: qualityRfqPrompt })}
                className="inline-flex min-h-8 items-center font-semibold hover:text-white"
              >
                WhatsApp: {siteConfig.whatsapp}
              </a>
            </div>
          </div>
        </div>
        <p
          data-nosnippet
          className="absolute bottom-3 right-4 max-w-xs bg-arc-midnight/80 px-3 py-2 text-right text-[10px] leading-4 text-slate-300 sm:bottom-5 sm:right-6 sm:text-xs"
        >
          Representative product-review image. Inspection scope is confirmed by order.
        </p>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <dl className="mx-auto grid max-w-7xl gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Reference basis", "Model, sample, drawing, label or measured product"],
            ["Compatibility", "Confirmed, reference-only or unverified"],
            ["Packing control", "Unit, label, barcode, carton and shipping mark"],
            ["Evidence scope", "Defined in the quotation or approved order record"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 bg-white px-5 py-6 sm:px-6">
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-arc-blue">
                {label}
              </dt>
              <dd className="mt-2 text-sm font-semibold leading-6 text-arc-midnight">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16" aria-labelledby="inspection-workflow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Inspection Workflow
              </p>
              <h2
                id="inspection-workflow"
                className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl"
              >
                Four approval points tied to the order record.
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              The exact checks depend on the product and buyer requirement. Inspection photos,
              measurements, samples or reports should be requested during the RFQ so their scope,
              timing and availability can be confirmed before order approval.
            </p>
          </div>
          <ol className="mt-9 divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {qualityInspectionStages.map((stage) => (
              <li
                key={stage.step}
                className="grid gap-5 px-5 py-7 md:grid-cols-[0.42fr_0.9fr_1fr_1fr] md:gap-6 sm:px-6"
              >
                <div>
                  <span className="font-display text-3xl font-black text-arc-signal">
                    {stage.step}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-black leading-tight text-arc-midnight">
                    {stage.title}
                  </h3>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-arc-blue">
                    Buyer evidence
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{stage.buyerEvidence}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-arc-blue">
                    Review focus
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{stage.reviewFocus}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-arc-blue">
                    Order record
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{stage.orderRecord}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="product-review-matrix"
        className="scroll-mt-28 bg-white py-14 sm:py-16"
        aria-labelledby="product-review-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Product Review Matrix
            </p>
            <h2
              id="product-review-heading"
              className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl"
            >
              Different product families fail for different reasons.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Use this matrix to prepare evidence that distinguishes the requested item. It is a
              purchasing guide, not a claim that broad model names confirm exact compatibility.
            </p>
          </div>
          <div className="mt-8 border-y border-slate-200">
            <div className="hidden grid-cols-[0.6fr_1fr_1fr_1fr] gap-6 bg-arc-midnight px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white lg:grid">
              <span>Product family</span>
              <span>Common mismatch risk</span>
              <span>Buyer should send</span>
              <span>Lock before order</span>
            </div>
            <div className="divide-y divide-slate-200">
              {qualityProductReviewMatrix.map((item, index) => (
                <article
                  key={item.family}
                  className="grid gap-5 py-7 sm:px-5 lg:grid-cols-[0.6fr_1fr_1fr_1fr] lg:gap-6"
                >
                  <div>
                    <span className="text-xs font-black text-arc-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-black leading-tight text-arc-midnight">
                      {item.family}
                    </h3>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:hidden">
                      Common mismatch risk
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 lg:mt-0">
                      {item.commonRisk}
                    </p>
                  </div>
                  <div className="border-l-4 border-arc-signal bg-arc-frost p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-arc-blue lg:hidden">
                      Buyer should send
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700 lg:mt-0">
                      {item.buyerShouldSend}
                    </p>
                  </div>
                  <div className="border border-slate-200 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:hidden">
                      Lock before order
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 lg:mt-0">
                      {item.lockBeforeOrder}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-midnight py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
                Buyer and Supplier Controls
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">
                Compare every requirement with a written confirmation.
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-300">
              Unknown values should stay open. A clear order record is more useful than filling a
              specification table with assumptions that cannot be traced to a drawing, sample, label
              or reviewed document.
            </p>
          </div>
          <div className="mt-9 divide-y divide-white/10 border-y border-white/15">
            {qualityBuyerSupplierControls.map((item) => (
              <article
                key={item.area}
                className="grid gap-5 py-6 md:grid-cols-[0.5fr_1fr_1fr] md:gap-6"
              >
                <h3 className="font-display text-xl font-black text-white">{item.area}</h3>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-arc-signal">
                    Buyer input
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.buyerInput}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-arc-signal">
                    Supplier confirmation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.supplierConfirmation}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Evidence Options
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl">
                Ask for evidence before the order is approved.
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              Evidence requirements vary by SKU, order size and customization. State them in the RFQ
              so availability, timing, format and any cost can be confirmed in writing.
            </p>
          </div>
          <div className="mt-8 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            {qualityEvidenceOptions.map((item) => (
              <article key={item.title} className="min-w-0 bg-white p-5 sm:p-6">
                <h3 className="font-display text-xl font-black leading-tight text-arc-midnight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 border-l-4 border-arc-signal bg-arc-frost p-5 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Certification and Compliance Requests
            </p>
            <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-700">
              Certification is not assumed from a product family or similar model. Tell us the
              destination market, exact product and required document during quotation. ArcFort Weld
              will confirm only the documents available for the specific quoted item.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Continue the Buying Process
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              Connect inspection to product selection and order approval.
            </h2>
          </div>
          <nav
            aria-label="Quality control buyer paths"
            className="mt-8 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4"
          >
            {qualityResourceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group min-w-0 bg-white p-5 transition hover:bg-arc-midnight sm:p-6"
              >
                <h3 className="font-display text-xl font-black text-arc-midnight group-hover:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 group-hover:text-slate-300">
                  {item.description}
                </p>
                <span className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-signal">
                  Review Details
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <FaqSection items={[...qualityFaq]} />
          <RfqCta
            title="Define the inspection scope with the product RFQ."
            description="Send the itemized product list, model or existing reference, critical details, quantity, compatibility evidence, packing requirement and the inspection records you need."
            productName="Welding product quality and inspection review"
            rfqPrompt={qualityRfqPrompt}
          />
        </div>
      </section>
    </>
  );
}
