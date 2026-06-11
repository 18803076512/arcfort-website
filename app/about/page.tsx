import type { Metadata } from "next";

const strengths = [
  "Industrial product focus across welding and plasma cutting categories",
  "Buyer-oriented communication for distributor and OEM sourcing teams",
  "Practical support for repair workshops and maintenance supply needs",
  "Export-minded structure for repeat inquiries and product expansion",
];

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about ARCFORT Welding & Cutting Solutions and its industrial welding and cutting brand positioning.",
};

export default function AboutPage() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">About Us</p>
          <h1 className="mt-3 font-display text-4xl font-black text-arc-midnight sm:text-5xl">
            ARCFORT builds industrial welding and cutting supply confidence.
          </h1>
        </div>
        <div className="space-y-6 text-lg leading-8 text-slate-600">
          <p>
            ARCFORT Welding & Cutting Solutions is positioned for global distributors, importers,
            OEM buyers, industrial users, and repair workshops that need a focused product partner
            across welding torch parts, plasma cutting parts, consumables, machines, and accessories.
          </p>
          <p>
            The brand is designed around clear category structure, export-ready inquiry handling,
            and practical product coverage for channels that require reliable replenishment and
            technical matching.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {strengths.map((strength, index) => (
            <div key={strength} className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="font-display text-3xl font-black text-arc-signal">
                {String(index + 1).padStart(2, "0")}
              </div>
              <p className="mt-4 font-semibold leading-7 text-slate-800">{strength}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
