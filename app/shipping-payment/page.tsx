import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const tradeCards = [
  { title: "Main Port", value: siteConfig.mainPort },
  { title: "Other Ports", value: siteConfig.alternativePorts },
  { title: "Payment Terms", value: siteConfig.paymentTerms },
  { title: "MOQ Policy", value: siteConfig.moqPolicy },
  { title: "Lead Time", value: siteConfig.leadTime },
  { title: "OEM Service", value: siteConfig.oemService },
] as const;

const shipmentChecklist = [
  "Product list, quantity and packaging requirement",
  "Destination country and preferred port or shipping method",
  "Carton marks, label requirements and private label details when needed",
  "Expected delivery schedule and whether samples are required first",
] as const;

const faq = [
  {
    question: "What is the main export port?",
    answer:
      "The main port is Tianjin Xingang Port / Tianjin Port, China. Qingdao Port or Ningbo Port can be discussed upon request.",
  },
  {
    question: "What payment term is preferred?",
    answer:
      "T/T is preferred, with 30% deposit before production and 70% balance before shipment. L/C at sight can be discussed for large orders.",
  },
  {
    question: "How long is the regular lead time?",
    answer:
      "Regular orders are usually 7-20 working days after deposit confirmation, depending on product type, quantity and packaging requirements.",
  },
] as const;

export const metadata = buildMetadata({
  title: "Shipping and Payment for Welding Product Orders",
  description:
    "Shipping, port, payment, MOQ and lead time information for ArcFort Weld welding products, cutting consumables and OEM export orders.",
  path: "/shipping-payment",
  keywords: [
    "welding products shipping",
    "welding parts payment terms",
    "Tianjin Port welding supplier",
    "welding consumables MOQ",
  ],
});

export default function ShippingPaymentPage() {
  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shipping and Payment", path: "/shipping-payment" },
          ]),
          faqJsonLd([...faq]),
        ]}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shipping & Payment" }]} />
          <div className="mt-8 max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Shipping & Payment
            </p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
              Clear export terms for welding and cutting product buyers.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Use this page to prepare RFQ information for welding torch parts, plasma cutting
              consumables, welding accessories, welding machines and OEM packaging orders.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tradeCards.map((item) => (
              <article key={item.title} className="border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">{item.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              RFQ Preparation
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Send complete shipping details for faster quotation.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Clear shipment and packaging information helps ArcFort Weld review MOQ, lead time and
              export packing options before quotation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {shipmentChecklist.map((item) => (
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
            title="Need a shipping quotation basis?"
            description="Send product list, quantity, destination country, packaging requirements and preferred port. ArcFort Weld will review the RFQ details before quotation."
          />
        </div>
      </section>
    </>
  );
}
