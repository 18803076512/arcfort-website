import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const documentTypes = [
  {
    title: "Product Catalog Request",
    description:
      "Send the product category, target market and item list. ArcFort Weld can prepare suitable catalog references for quotation discussion.",
  },
  {
    title: "Product Data Sheet Request",
    description:
      "For exact dimensions or technical details, send the product model, reference part or drawing so the data can be confirmed before use.",
  },
  {
    title: "OEM Packaging Information",
    description:
      "Private label packaging, carton marks and label layouts can be reviewed after artwork, quantity and product list are confirmed.",
  },
  {
    title: "RFQ Product List",
    description:
      "Buyers can send Excel, CSV, PDF, Word documents, product photos or drawings through the RFQ form or by email.",
  },
] as const;

const quickLinks = [
  { href: "/products", label: "Browse Products" },
  { href: "/rfq", label: "Upload Product List" },
  { href: "/oem-service", label: "OEM Service" },
  { href: "/contact", label: "Contact Sales" },
] as const;

const faq = [
  {
    question: "Are public PDF catalogs available on the website?",
    answer:
      "Catalog documents should match confirmed product scope. Buyers can request product catalogs by category or send an item list for targeted catalog support.",
  },
  {
    question: "Can ArcFort Weld provide exact product data sheets?",
    answer:
      "Exact data sheets require confirmed product model, drawing, sample or reference part information. Unconfirmed specifications are not published as final technical data.",
  },
  {
    question: "What file types can buyers send for RFQ?",
    answer:
      "The RFQ form accepts PDF, Excel, CSV, Word, JPG and PNG files. Large files can also be sent by email or WhatsApp after initial contact.",
  },
] as const;

export const metadata = buildMetadata({
  title: "Download Center for Welding Product Buyers",
  description:
    "Request ArcFort Weld product catalogs, data sheets, OEM packaging information and RFQ documents for welding and cutting product sourcing.",
  path: "/downloads",
  keywords: [
    "welding product catalog",
    "welding consumables data sheet",
    "plasma cutting consumables catalog",
    "welding RFQ product list",
  ],
});

export default function DownloadsPage() {
  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Downloads", path: "/downloads" },
          ]),
          faqJsonLd([...faq]),
        ]}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Downloads" }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Download Center
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                Catalog and RFQ documents for welding product sourcing.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Request product catalogs, data sheets and OEM packaging information for ArcFort
                Weld welding machines, cutting machines, torch consumables and welding accessories.
              </p>
            </div>
            <div className="border-l-4 border-arc-signal bg-arc-frost p-6">
              <h2 className="font-display text-2xl font-black text-arc-midnight">
                Accurate documents need confirmed data
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                ArcFort Weld does not publish unverified technical specifications as final data.
                Send product model, sample photo, drawing or reference part details to request
                suitable documents for your RFQ.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {documentTypes.map((item) => (
              <article key={item.title} className="border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-2xl font-black text-arc-midnight">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                <Link
                  href="/rfq"
                  className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue hover:text-arc-copper"
                >
                  Request Document
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Shortcuts
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Move from document request to RFQ faster.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              For urgent sourcing, email {siteConfig.email} or send product photos by WhatsApp at{" "}
              {siteConfig.whatsapp}.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-slate-200 bg-arc-frost p-5 font-semibold text-arc-midnight transition hover:border-arc-blue hover:text-arc-blue"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <FaqSection items={[...faq]} />
          <RfqCta
            title="Need product documents for quotation?"
            description="Send category, model, quantity, drawing or sample photo. ArcFort Weld will review the requested documents and RFQ information."
          />
        </div>
      </section>
    </>
  );
}
