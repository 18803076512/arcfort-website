import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllApplications } from "@/lib/content/applications";
import { breadcrumbJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";

const applicationSignals = [
  { label: "Industry RFQ", value: "Product lists by use case" },
  { label: "Compatibility", value: "Confirmed by model or sample" },
  { label: "OEM", value: "Packaging and label support" },
  { label: "Supply Scope", value: "Welding and cutting products" },
] as const;

const sourcingSteps = [
  {
    title: "Identify the application",
    description:
      "Start from the buyer's industry, repair workflow or production use case before choosing parts.",
  },
  {
    title: "Map required product families",
    description:
      "Connect the application to MIG/MAG, TIG, plasma cutting, consumables, machines or accessories.",
  },
  {
    title: "Confirm product references",
    description:
      "Use drawings, photos, model numbers or samples to confirm compatibility before quotation.",
  },
] as const;

export const metadata = buildMetadata({
  title: "Applications",
  description:
    "Explore industrial welding and cutting application pages for shipbuilding, automotive, pipeline, fabrication, construction and repair workshops.",
  path: "/applications",
  keywords: [
    "welding applications",
    "industrial welding parts",
    "plasma cutting applications",
    "welding consumables by industry",
  ],
});

export default function ApplicationsPage() {
  const applications = getAllApplications();

  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Applications", path: "/applications" },
        ])}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Applications" }]} />
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.75fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Applications
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Welding and cutting supply by industrial use case.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Application pages help distributors, importers, repair workshops and OEM buyers
              connect real working scenarios with suitable welding torch parts, cutting consumables
              and workshop accessories.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#application-list"
                className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white"
              >
                View Applications
              </Link>
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10"
              >
                Send Application RFQ
              </Link>
            </div>
          </div>
          <aside className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            {applicationSignals.map((item) => (
              <div key={item.label} className="bg-arc-midnight p-5">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-signal">
                  {item.label}
                </div>
                <div className="mt-2 text-sm font-semibold leading-6 text-slate-200">
                  {item.value}
                </div>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {sourcingSteps.map((step, index) => (
            <article key={step.title} className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="font-display text-4xl font-black text-arc-blue">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h2 className="mt-4 font-display text-2xl font-black text-arc-midnight">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="application-list" className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Industry Paths
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Application pages for industrial sourcing
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Choose the closest industry scenario, then follow the related categories and product
                references to prepare a practical RFQ.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
            >
              Product Center
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <Link
                key={application.slug}
                href={`/applications/${application.slug}`}
                className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="h-1 w-16 bg-arc-signal" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Application
                  </span>
                </div>
                <h2 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                  {application.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{application.description}</p>
                <div className="mt-5 grid gap-2">
                  {application.buyerNeeds.slice(0, 2).map((need) => (
                    <div key={need} className="border-l-4 border-arc-signal bg-arc-frost p-3">
                      <p className="text-xs font-semibold leading-5 text-slate-700">{need}</p>
                    </div>
                  ))}
                </div>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                  View Application
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta
            title="Need application-based sourcing support?"
            description="Send the application, product list, current part photos, drawings, quantity and destination country. ArcFort Weld will help review suitable product categories for quotation."
          />
        </div>
      </section>
    </>
  );
}
