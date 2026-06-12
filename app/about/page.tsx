import type { Metadata } from "next";
import Link from "next/link";

const supplyItems = [
  "MIG Torch Parts",
  "TIG Torch Parts",
  "Plasma Cutting Parts",
  "Welding Consumables",
  "Welding Machines",
  "OEM Solutions",
] as const;

const advantages = [
  "Stable Quality",
  "Factory Direct Supply",
  "OEM & Customization",
  "Fast Delivery",
  "Global Support",
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

export const metadata: Metadata = {
  title: "About ARCFORT",
  description:
    "Learn about ARCFORT Welding & Cutting Solutions, a reliable supplier of industrial welding and cutting solutions for global distributors and industrial users.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-arc-midnight py-14 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              ARCFORT Welding & Cutting Solutions
            </p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight sm:text-5xl">
              About ARCFORT
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              A reliable supplier of industrial welding and cutting solutions for global
              distributors and industrial users.
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
              ARCFORT Welding & Cutting Solutions focuses on industrial welding and cutting product
              supply, including MIG, TIG, Plasma, welding consumables and industrial accessories.
            </p>
            <p>
              The brand is built for global distributors, importers, OEM buyers, industrial users
              and repair workshops that need reliable product categories, clear inquiry handling and
              repeatable supply support.
            </p>
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

      <section className="bg-arc-midnight py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Work With ARCFORT
            </p>
            <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">
              Need a welding parts supplier?
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-white/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10"
            >
              Contact Us
            </Link>
            <Link
              href="/rfq"
              className="inline-flex items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
