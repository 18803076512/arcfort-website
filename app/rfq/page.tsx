import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { StructuredData } from "@/components/content/StructuredData";
import { breadcrumbJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";
import { RfqForm } from "./RfqForm";

type RfqPageProps = {
  searchParams: Promise<{
    product?: string;
  }>;
};

const inquiryChecklist = [
  "Product name, part number, drawing or sample details",
  "Material, size, thread, compatible brand or OEM number when available",
  "Required quantity, package requirement and destination country",
  "Expected delivery schedule or distributor program details",
];

const processSteps = [
  "Submit product list",
  "Confirm technical details",
  "Receive quotation options",
  "Discuss MOQ and delivery",
];

const rfqBusinessInfo = [
  { label: "Business Email", value: siteConfig.email, href: siteConfig.emailHref },
  { label: "WhatsApp", value: siteConfig.whatsapp, href: siteConfig.whatsappHref },
  { label: "Main Port", value: siteConfig.mainPort },
  { label: "MOQ Policy", value: siteConfig.moqPolicy },
  { label: "Lead Time", value: siteConfig.leadTime },
  { label: "Payment Terms", value: siteConfig.paymentTerms },
];

export const metadata = buildMetadata({
  title: "Request a Quote",
  description:
    "Submit an RFQ to ArcFort Weld for MIG/MAG torch parts, TIG torch parts, plasma cutting consumables, welding accessories and industrial sourcing programs.",
  path: "/rfq",
  keywords: [
    "welding RFQ",
    "welding parts quotation",
    "plasma consumables inquiry",
    "MIG torch parts supplier",
  ],
});

export default async function RfqPage({ searchParams }: RfqPageProps) {
  const params = await searchParams;
  const initialProduct = typeof params.product === "string" ? params.product : "";

  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Request a Quote", path: "/rfq" },
        ])}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request a Quote" }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                RFQ Center
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                Request a Quote
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Send us your product list, drawings or sample details. ArcFort Weld will provide
                quotation, MOQ and delivery options after technical confirmation.
              </p>

              <div className="mt-8 border-l-4 border-arc-signal bg-arc-frost p-5">
                <h2 className="font-display text-2xl font-black text-arc-midnight">
                  What to include
                </h2>
                <ul className="mt-4 grid gap-3">
                  {inquiryChecklist.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-arc-signal" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {processSteps.map((step, index) => (
                  <div key={step} className="border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                      Step {index + 1}
                    </div>
                    <div className="mt-2 font-semibold text-arc-midnight">{step}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-display text-2xl font-black text-arc-midnight">
                  Business Information
                </h2>
                <div className="mt-5 grid gap-4">
                  {rfqBusinessInfo.map((item) => (
                    <div key={item.label} className="border-l-4 border-arc-signal bg-arc-frost p-4">
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                        {item.label}
                      </div>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-2 block text-sm font-semibold leading-6 text-arc-midnight hover:text-arc-blue"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-slate-700">{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <RfqForm initialProduct={initialProduct} />
          </div>
        </div>
      </section>
    </>
  );
}
