import type { Metadata } from "next";
import Link from "next/link";

const contactItems = [
  {
    label: "Sales Inquiry",
    value: "sales@example.com",
  },
  {
    label: "RFQ Documents",
    value: "Attach drawings, model references, and quantity targets.",
  },
  {
    label: "Markets",
    value: "Global distributors, importers, OEM buyers, and industrial users.",
  },
];

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact ARCFORT for industrial welding and cutting product inquiries, RFQs, and distributor cooperation.",
};

export default function ContactPage() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-black text-arc-midnight sm:text-5xl">
            Talk with ARCFORT about your welding and cutting sourcing needs.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Share the product category, target models, quantities, destination market, and any
            technical references. The team can then prepare a clear follow-up for your sourcing
            process.
          </p>
          <div className="mt-8">
            <Link
              href="/rfq"
              className="inline-flex bg-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-arc-midnight"
            >
              Go to RFQ
            </Link>
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl font-black text-arc-midnight">Contact Details</h2>
          <div className="mt-6 divide-y divide-slate-200">
            {contactItems.map((item) => (
              <div key={item.label} className="py-5 first:pt-0 last:pb-0">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
                  {item.label}
                </div>
                <div className="mt-2 text-base leading-7 text-slate-700">{item.value}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 border-l-4 border-arc-signal bg-arc-frost p-4 text-sm leading-6 text-slate-700">
            Placeholder email is used intentionally. Replace it with an official business address
            before launch.
          </p>
        </div>
      </div>
    </section>
  );
}
