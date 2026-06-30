import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllGuides } from "@/lib/content/guides";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";

const guideSignals = [
  "RFQ preparation",
  "Compatibility confirmation",
  "Product family comparison",
  "Packaging and MOQ planning",
] as const;

const buyerChecklist = [
  "Keep unknown product data visible instead of guessing.",
  "Confirm compatibility by torch model, drawing, photo or sample.",
  "Prepare quantity, destination country and packaging requirement before quotation.",
] as const;

export const metadata = buildMetadata({
  title: "Welding Buyer Guides",
  description:
    "Read ArcFort Weld welding and cutting buyer guides for RFQ preparation, MIG/MAG and TIG consumables, and plasma cutting consumables sourcing.",
  path: "/guides",
  keywords: [
    "welding buyer guide",
    "welding parts RFQ guide",
    "MIG TIG consumables guide",
    "plasma consumables guide",
  ],
});

export default function GuidesPage() {
  const guides = getAllGuides();

  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
      <StructuredData
        data={collectionPageJsonLd({
          name: "ArcFort Weld Welding Buyer Guides",
          description:
            "Buyer guides for welding and cutting product RFQs, compatibility confirmation and B2B sourcing preparation.",
          path: "/guides",
          items: guides.map((guide) => ({
            name: guide.title,
            path: `/guides/${guide.slug}`,
          })),
        })}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Buyer Guides
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Welding and cutting sourcing guides for B2B buyers.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Practical articles for buyers preparing product lists, compatibility details,
              packaging requirements and RFQs for welding torch parts and cutting consumables.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#guide-list"
                className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white"
              >
                Read Guides
              </Link>
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10"
              >
                Send RFQ
              </Link>
            </div>
          </div>
          <aside className="border border-white/10 bg-white/5 p-5 shadow-industrial">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              Guide Topics
            </p>
            <div className="mt-5 grid gap-3">
              {guideSignals.map((signal) => (
                <div key={signal} className="border-l-4 border-arc-signal bg-white/5 p-4">
                  <p className="text-sm font-semibold leading-6 text-slate-200">{signal}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Rules
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Professional sourcing starts with confirmed details.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {buyerChecklist.map((item) => (
              <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-5">
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="guide-list" className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Guide Library
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Buyer articles for RFQ preparation
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
            >
              Product Center
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">Guide</p>
                <h2 className="mt-4 font-display text-2xl font-black leading-tight text-arc-midnight">
                  {guide.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{guide.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {guide.keywords.slice(0, 2).map((keyword) => (
                    <span
                      key={keyword}
                      className="border border-slate-200 bg-arc-frost px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                  Read Guide
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta
            title="Have a product list ready?"
            description="Send your item list, drawings, sample photos, required quantity and destination country. ArcFort Weld will review the details before quotation."
          />
        </div>
      </section>
    </>
  );
}
