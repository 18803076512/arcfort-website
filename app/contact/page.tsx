import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { breadcrumbJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const contactItems = [
  {
    label: "Email",
    value: siteConfig.email,
    href: siteConfig.emailHref,
    note: "Send product lists, drawings, photos or RFQ details for quotation follow-up.",
  },
  {
    label: "WhatsApp",
    value: siteConfig.whatsapp,
    href: siteConfig.whatsappHref,
    note: "Available for quick product discussion and inquiry confirmation.",
  },
  {
    label: "Company",
    value: siteConfig.legalName,
    note: siteConfig.chineseName,
  },
  {
    label: "Address",
    value: siteConfig.address,
    note: "Renqiu City, Cangzhou, Hebei Province, China.",
  },
];

const tradeItems = [
  { label: "Main Port", value: `${siteConfig.mainPort}. ${siteConfig.alternativePorts}` },
  { label: "Payment Terms", value: siteConfig.paymentTerms },
  { label: "MOQ Policy", value: siteConfig.moqPolicy },
  { label: "Lead Time", value: siteConfig.leadTime },
];

const inquiryTopics = [
  "MIG/MAG torch parts and contact tips",
  "TIG torch parts, ceramic cups and gas lens parts",
  "Plasma cutting electrodes, nozzles and consumables",
  "Welding machines, accessories and OEM welding product requirements",
];

const buyerChecklist = [
  "Product name, model, size, material or compatible reference",
  "Drawing, product photo, reference part details or existing supplier part number",
  "Required quantity, packaging requirement and destination country",
  "Target delivery schedule and any distributor or OEM requirements",
];

const responseSteps = [
  "Receive inquiry",
  "Confirm technical details",
  "Prepare quotation options",
  "Discuss MOQ and delivery",
];

export const metadata = buildMetadata({
  title: "Contact ArcFort Weld",
  description:
    "Contact ArcFort Weld for industrial welding parts, plasma cutting consumables, OEM welding accessories and export RFQ support.",
  path: "/contact",
  keywords: [
    "contact welding parts supplier",
    "welding consumables RFQ",
    "plasma cutting parts inquiry",
    "industrial welding supplier",
  ],
});

export default function ContactPage() {
  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Contact
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                Talk with ArcFort Weld about welding and cutting sourcing.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Send product names, models, sizes, material requirements, drawings, product photos,
                quantities, packaging needs and destination country. ArcFort Weld will use the
                confirmed information to prepare a clear RFQ follow-up.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/rfq"
                  className="inline-flex items-center justify-center bg-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-arc-midnight"
                >
                  Request a Quote
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center border border-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
                >
                  View Products
                </Link>
              </div>
            </div>

            <div className="border border-slate-200 bg-arc-frost p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl font-black text-arc-midnight">
                Contact Details
              </h2>
              <div className="mt-6 divide-y divide-slate-200">
                {contactItems.map((item) => (
                  <div key={item.label} className="py-5 first:pt-0 last:pb-0">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
                      {item.label}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-2 block text-base font-semibold leading-7 text-arc-midnight hover:text-arc-blue"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className="mt-2 text-base font-semibold leading-7 text-arc-midnight">
                        {item.value}
                      </div>
                    )}
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.note}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-l-4 border-arc-signal bg-white p-4 text-sm font-semibold leading-6 text-slate-700">
                Main export port: {siteConfig.mainPort}. {siteConfig.alternativePorts}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Trade Information
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Commercial terms for export inquiries
            </h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {tradeItems.map((item) => (
              <article key={item.label} className="border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
                  {item.label}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{item.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Inquiry Topics
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              What buyers can contact us about
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The contact flow is designed for product sourcing, distributor programs, OEM
              discussions and industrial repeat purchasing.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{siteConfig.oemService}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {inquiryTopics.map((item) => (
              <div key={item} className="border-l-4 border-arc-signal bg-white p-5 shadow-sm">
                <p className="font-semibold leading-7 text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Prepare a Clear Inquiry
            </h2>
            <ul className="mt-5 grid gap-4">
              {buyerChecklist.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-arc-signal" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              RFQ Response Flow
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {responseSteps.map((step, index) => (
                <div key={step} className="border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                    Step {index + 1}
                  </div>
                  <div className="mt-2 font-semibold text-arc-midnight">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta
            title="Ready to send your product list?"
            description="Use the RFQ form for drawings, part numbers, quantities, packaging requirements and delivery details. This helps ArcFort Weld confirm the information needed for quotation."
          />
        </div>
      </section>
    </>
  );
}
