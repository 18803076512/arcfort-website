import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";

const inspectionSteps = [
  {
    title: "Incoming Inspection",
    description:
      "Materials, purchased parts and packaging materials are checked against confirmed order requirements before production or packing.",
  },
  {
    title: "Production Inspection",
    description:
      "Key production stages are reviewed to support consistency in dimensions, surface finish, packing and product identification.",
  },
  {
    title: "Packaging Inspection",
    description:
      "Inner packing, labels, cartons and export packing are checked against buyer requirements before shipment preparation.",
  },
  {
    title: "Outgoing Inspection",
    description:
      "Final shipment details are reviewed so the delivered goods match confirmed RFQ information, packing requirements and quantity.",
  },
] as const;

const buyerControls = [
  "Confirm product drawings, samples or reference parts before production",
  "Use clear SKU, label and carton requirements for distributor programs",
  "Confirm packaging quantity, carton marks and destination country before shipment",
  "Keep unconfirmed specifications open until both sides approve the technical details",
] as const;

const faq = [
  {
    question: "Does ArcFort Weld list certificates without documents?",
    answer:
      "No. Certificates are not claimed unless official documents are provided and confirmed for the specific product or order.",
  },
  {
    question: "How can buyers reduce wrong-part risk?",
    answer:
      "Send samples, drawings, product photos, model numbers or reference part details before quotation and production confirmation.",
  },
  {
    question: "Can packaging be checked before shipment?",
    answer:
      "Packaging details can be reviewed against confirmed order requirements, including label, carton and export packing information.",
  },
] as const;

export const metadata = buildMetadata({
  title: "Quality Control for Welding and Cutting Products",
  description:
    "ArcFort Weld quality control content for welding torch parts, plasma cutting consumables, welding accessories and export packing inspection.",
  path: "/quality-control",
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
          faqJsonLd([...faq]),
        ]}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Quality Control" }]} />
          <div className="mt-8 max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Quality Control
            </p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
              Practical inspection for welding and cutting product supply.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              ArcFort Weld focuses on confirmed product information, packing consistency and clear
              RFQ communication for distributors, importers, repair workshops and OEM buyers.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Inspection Flow
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Four checkpoints before shipment
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {inspectionSteps.map((step) => (
              <article key={step.title} className="border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-display text-xl font-black text-arc-midnight">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Confirmation
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              The best quality control starts with confirmed product data.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              For welding consumables and torch parts, small differences in size, thread, model or
              packaging can affect fit. ArcFort Weld keeps uncertain fields open until the buyer
              confirms the reference.
            </p>
            <Link
              href="/rfq"
              className="mt-6 inline-flex bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
            >
              Send Technical RFQ
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {buyerControls.map((item) => (
              <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-5">
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <FaqSection items={[...faq]} />
          <RfqCta
            title="Need quality details for a product list?"
            description="Send product photos, drawings, sample details and packing requirements. ArcFort Weld will confirm available details before quotation."
          />
        </div>
      </section>
    </>
  );
}
