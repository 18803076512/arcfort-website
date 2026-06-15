import { RfqCta } from "@/components/content/RfqCta";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const supplyItems = [
  "Welding Machines",
  "Cutting Machines",
  "Welding Torch Consumables",
  "Plasma Cutting Consumables",
  "Welding Consumables",
  "OEM Welding Accessories",
] as const;

const advantages = [
  "Stable supply for repeat orders",
  "OEM support and private label packaging",
  "Export packing for overseas shipments",
  "Fast response for RFQ confirmation",
  "Product customization by buyer requirement",
] as const;

const targetCustomers = [
  "International distributors",
  "Importers and wholesalers",
  "Welding equipment suppliers",
  "Repair workshops",
  "Industrial users",
  "OEM buyers",
] as const;

const companyFacts = [
  { label: "English Name", value: siteConfig.legalName },
  { label: "Chinese Name", value: siteConfig.chineseName },
  { label: "Website Brand", value: siteConfig.name },
  { label: "Address", value: siteConfig.address },
] as const;

const exportServiceItems = [
  { title: "Main Port", description: `${siteConfig.mainPort}. ${siteConfig.alternativePorts}` },
  { title: "Payment Terms", description: siteConfig.paymentTerms },
  { title: "MOQ Policy", description: siteConfig.moqPolicy },
  { title: "Lead Time", description: siteConfig.leadTime },
  { title: "OEM Service", description: siteConfig.oemService },
] as const;

const qualitySteps = [
  {
    title: "Incoming Inspection",
    description:
      "Materials and components are checked before production to support stable welding and cutting product quality.",
  },
  {
    title: "Production Inspection",
    description:
      "Key production stages are monitored to keep dimensions, finish and product consistency under control.",
  },
  {
    title: "Packaging Inspection",
    description:
      "Packaging is reviewed before shipment to reduce damage risk and support distributor-ready delivery.",
  },
  {
    title: "Outgoing Inspection",
    description:
      "Final checks are completed before loading so buyers receive products that match confirmed RFQ details.",
  },
] as const;

export const metadata = buildMetadata({
  title: "About ArcFort Weld",
  description:
    "Learn about ArcFort Weld and Renqiu Ailesen Welding Technology Co., Ltd., a supplier of industrial welding and cutting solutions for global distributors and industrial users.",
  path: "/about",
  keywords: [
    "ArcFort Weld company",
    "welding parts supplier China",
    "industrial welding supplier",
    "OEM welding accessories",
  ],
});

export default function AboutPage() {
  return (
    <>
      <section className="bg-arc-midnight py-14 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              {siteConfig.name}
            </p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight sm:text-5xl">
              About ArcFort Weld
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              A practical industrial welding and cutting supplier for distributors, importers,
              wholesalers, repair workshops and OEM buyers.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="company-overview">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Company Overview
            </p>
            <h2
              id="company-overview"
              className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
            >
              Focused on practical welding and cutting supply for B2B buyers.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-600">
            <p>
              {siteConfig.legalName} is located in {siteConfig.address}. The company operates the{" "}
              {siteConfig.name} website brand for industrial welding and cutting product supply.
            </p>
            <p>
              The business scope covers welding machines, cutting machines, welding torch
              consumables, plasma cutting consumables, welding consumables and OEM welding
              accessories for overseas B2B sourcing programs.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {companyFacts.map((fact) => (
                <div key={fact.label} className="border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                    {fact.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-arc-midnight">{fact.value}</div>
                </div>
              ))}
            </div>
            <div className="border-l-4 border-arc-signal bg-arc-frost p-5">
              <h3 className="font-display text-2xl font-black text-arc-midnight">
                Who We Serve
              </h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {targetCustomers.map((customer) => (
                  <div key={customer} className="text-sm font-semibold text-slate-700">
                    {customer}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20" aria-labelledby="what-we-supply">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              What We Supply
            </p>
            <h2
              id="what-we-supply"
              className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
            >
              Product programs for welding, cutting and OEM sourcing.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supplyItems.map((item) => (
              <div key={item} className="border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-1 w-16 bg-arc-signal" />
                <h3 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                  {item}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="advantages">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Our Advantages
            </p>
            <h2
              id="advantages"
              className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
            >
              Built around stable supply and export-ready service.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {advantages.map((advantage, index) => (
              <div key={advantage} className="border-l-4 border-arc-signal bg-arc-frost p-5">
                <div className="font-display text-2xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 text-lg font-black text-arc-midnight">{advantage}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20" aria-labelledby="quality-control">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Quality Control
            </p>
            <h2
              id="quality-control"
              className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
            >
              Inspection steps for dependable industrial supply.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {qualitySteps.map((step) => (
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

      <section className="bg-white py-16 sm:py-20" aria-labelledby="export-service">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Export Service
            </p>
            <h2
              id="export-service"
              className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl"
            >
              Clear trade terms for overseas B2B buyers.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {exportServiceItems.map((item) => (
              <article key={item.title} className="border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-display text-xl font-black text-arc-midnight">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta
            title="Need a welding parts supplier?"
            description="Send product lists, drawings, reference part photos or packaging requirements. ArcFort Weld will review the details and respond with quotation, MOQ and delivery options."
          />
        </div>
      </section>
    </>
  );
}
