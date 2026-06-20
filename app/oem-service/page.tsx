import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const oemPrograms = [
  "Logo printing for selected welding consumables, torch parts and accessories",
  "Private label packaging for distributor and importer programs",
  "Carton design and export packing review after artwork and quantity are confirmed",
  "Product model customization based on sample, drawing, photo or technical requirement",
] as const;

const productScope = [
  { href: "/products/mig-mag-torch-parts", label: "MIG/MAG torch parts" },
  { href: "/products/tig-torch-parts", label: "TIG torch parts" },
  { href: "/products/plasma-cutting-consumables", label: "Plasma cutting consumables" },
  { href: "/products/welding-consumables", label: "Welding consumables" },
  { href: "/products/welding-accessories", label: "Welding accessories" },
] as const;

const rfqChecklist = [
  "Target product name, model, size, material and quantity",
  "Sample photo, drawing, reference part or current product label",
  "Logo file, label size, carton style and private label requirement",
  "Destination country, shipping plan and expected delivery schedule",
] as const;

const processSteps = [
  "Review buyer product list and customization request",
  "Confirm technical details, packaging artwork and quantity",
  "Prepare quotation, MOQ and lead time options",
  "Confirm sample, production and export packing details before shipment",
] as const;

const faq = [
  {
    question: "Can ArcFort Weld support private label welding products?",
    answer:
      "Yes. Private label packaging can be discussed for selected welding torch parts, consumables and accessories after product details, artwork and quantity are confirmed.",
  },
  {
    question: "Can OEM models be produced from samples or drawings?",
    answer:
      "Buyers can send samples, drawings, product photos or technical requirements. ArcFort Weld will review the details before quotation and production confirmation.",
  },
  {
    question: "Is there a fixed OEM MOQ?",
    answer:
      "OEM MOQ depends on product type, model, packaging requirement and customization scope. Standard products can support small trial orders when available.",
  },
] as const;

export const metadata = buildMetadata({
  title: "OEM Welding Products and Private Label Service",
  description:
    "ArcFort Weld supports OEM welding products, logo printing, private label packaging, carton design and model customization for global distributors and importers.",
  path: "/oem-service",
  keywords: [
    "OEM welding products",
    "private label welding accessories",
    "custom welding consumables",
    "welding parts OEM supplier",
  ],
});

export default function OemServicePage() {
  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "OEM Service", path: "/oem-service" },
          ]),
          faqJsonLd([...faq]),
        ]}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "OEM Service" }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                OEM Service
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                OEM welding products for distributors and importers.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {siteConfig.legalName} supports the {siteConfig.name} brand website for practical
                OEM sourcing, private label packaging and welding product customization.
              </p>
            </div>
            <div className="border-l-4 border-arc-signal bg-arc-frost p-6">
              <h2 className="font-display text-2xl font-black text-arc-midnight">
                What OEM means here
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                OEM service is reviewed after product details are confirmed. ArcFort Weld does not
                claim unverified compatibility, certifications or technical ratings. Buyers can send
                samples, drawings, photos or packaging artwork for quotation review.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              OEM Programs
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Customization that supports repeat B2B orders
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {oemPrograms.map((item) => (
              <div key={item} className="border-l-4 border-arc-signal bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Product Scope for OEM Discussion
            </h2>
            <div className="mt-5 grid gap-3">
              {productScope.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:border-arc-blue hover:text-arc-blue"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </article>

          <article className="border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              What Buyers Should Send
            </h2>
            <ul className="mt-5 grid gap-4">
              {rfqChecklist.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-arc-signal" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              OEM Process
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              From product list to export-ready quotation
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {processSteps.map((step, index) => (
              <div key={step} className="border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                  Step {index + 1}
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <FaqSection items={[...faq]} />
          <RfqCta
            title="Need OEM welding products?"
            description="Send product list, sample photos, drawings, logo artwork and packaging requirements. ArcFort Weld will review the details before quotation."
          />
        </div>
      </section>
    </>
  );
}
