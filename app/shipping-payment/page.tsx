import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
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

      <section className="bg-white py-5 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shipping & Payment" }]} />
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase leading-6 tracking-[0.14em] text-arc-signal sm:tracking-[0.2em]">
              Export Order Terms
            </p>
            <h1 className="mt-4 max-w-4xl break-words font-display text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Welding Product Shipping, Payment and Order Terms
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Review the confirmed commercial basis for welding torch parts, plasma consumables,
              welding accessories, machines and OEM orders, then send the product and destination
              details needed for an order-specific quotation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={rfqHref}
                className="inline-flex min-h-12 w-full items-center justify-center bg-arc-signal px-6 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white sm:w-auto"
              >
                Prepare Export RFQ
              </Link>
              <a
                href="#export-order-workflow"
                className="inline-flex min-h-12 w-full items-center justify-center border border-white/30 px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Review Order Flow
              </a>
            </div>
          </div>
          <aside className="border border-white/10 bg-white/5 p-5 shadow-industrial sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              Confirmed Commercial Basis
            </p>
            <dl className="mt-5 divide-y divide-white/10">
              {[
                ["Payment", siteConfig.paymentTerms],
                ["Regular lead time", siteConfig.regularLeadTime],
                ["Trial orders", siteConfig.moqPolicy],
                ["Main port", siteConfig.mainPort],
              ].map(([label, value]) => (
                <div key={label} className="py-4 first:pt-0 last:pb-0">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-6 text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
            {exportTradeCards.map((item) => (
              <article key={item.title} className="min-w-0 bg-white p-5 sm:p-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                  {item.title}
                </h2>
                <p className="mt-3 break-words text-sm leading-7 text-slate-700">{item.value}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 border-l-4 border-arc-signal bg-arc-frost p-4 text-sm leading-7 text-slate-700 sm:p-5">
            Freight, insurance, Incoterms and shipment dates depend on destination, shipment size,
            transport method and quotation timing. These items are confirmed in the order-specific
            quotation rather than fixed on the website.
          </p>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Lead-Time Basis
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl">
                Match the schedule to the order type.
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              Lead time starts from the basis stated in the quotation, normally after deposit and
              order-detail confirmation. Artwork, packing approvals, materials and technical review
              can change the applicable schedule.
            </p>
          </div>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {exportLeadTimeRows.map((row) => (
              <article
                key={row.orderType}
                className="grid gap-4 px-5 py-6 md:grid-cols-[0.55fr_0.85fr_1.2fr] md:gap-6"
              >
                <h3 className="font-display text-xl font-black text-arc-midnight">
                  {row.orderType}
                </h3>
                <p className="text-sm font-bold leading-6 text-arc-blue">{row.timing}</p>
                <p className="text-sm leading-6 text-slate-600">{row.confirmation}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="export-order-workflow"
        className="scroll-mt-28 bg-arc-midnight py-14 text-white sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Export Order Workflow
            </p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">
              Control product, packing, payment and shipment as one order record.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              A clear order sequence keeps buyer requirements separate from supplier-confirmed
              details and reduces changes after production planning begins.
            </p>
          </div>
          <ol className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {exportOrderStages.map((stage) => (
              <li key={stage.step} className="border border-white/15 bg-white/5 p-5">
                <span className="font-display text-3xl font-black text-arc-signal">
                  {stage.step}
                </span>
                <h3 className="mt-4 font-display text-xl font-black leading-tight text-white">
                  {stage.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{stage.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Quotation Preparation
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl">
                Make every commercial condition traceable.
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              Send the buyer inputs below and compare the supplier response line by line. Unknown
              product, freight or document details should remain open until confirmed in writing.
            </p>
          </div>
          <div className="mt-8 border-y border-slate-200">
            <div className="hidden grid-cols-[0.55fr_1fr_1fr] gap-6 bg-arc-midnight px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white lg:grid">
              <span>Quotation area</span>
              <span>Buyer should send</span>
              <span>Quotation should confirm</span>
            </div>
            <div className="divide-y divide-slate-200">
              {exportQuotationInputs.map((item, index) => (
                <article
                  key={item.title}
                  className="grid gap-5 px-1 py-6 sm:px-5 lg:grid-cols-[0.55fr_1fr_1fr]"
                >
                  <div>
                    <span className="text-xs font-black text-arc-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-black text-arc-midnight">
                      {item.title}
                    </h3>
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
                      Quotation should confirm
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 lg:mt-0">
                      {item.quotationShouldConfirm}
                    </p>
                  </div>
                </article>
              ))}
            </div>
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
              Connect the trade terms to the product decision.
            </h2>
          </div>
          <nav
            aria-label="Export order buyer paths"
            className="mt-8 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4"
          >
            {exportBuyerPaths.map((item) => (
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
          <FaqSection items={[...exportOrderFaq]} />
          <RfqCta
            title="Prepare an order-specific shipping quotation."
            description="Send the itemized product list, quantity, packing or OEM scope, destination, requested transport basis and target schedule. ArcFort Weld will confirm the applicable terms in the quotation."
            productName="Export welding and cutting product order"
            rfqPrompt={exportRfqPrompt}
          />
        </div>
      </section>
    </>
  );
}
