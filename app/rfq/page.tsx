import type { Metadata } from "next";
import Link from "next/link";
import { RfqForm } from "./RfqForm";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Send ARCFORT your product list, drawings or sample details for welding and cutting parts quotation, MOQ and delivery options.",
};

const rfqHighlights = [
  "MIG, TIG and plasma cutting parts",
  "OEM and distributor inquiry support",
  "Quotation, MOQ and lead time review",
] as const;

export default function RfqPage() {
  return (
    <>
      <section className="bg-arc-midnight py-14 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm font-semibold text-slate-300">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li className="text-arc-signal">/</li>
              <li aria-current="page" className="text-white">
                RFQ
              </li>
            </ol>
          </nav>

          <div className="mt-10 max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              ARCFORT RFQ
            </p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight sm:text-5xl">
              Request a Quote
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Send us your product list, drawings or sample details. ARCFORT will provide
              quotation, MOQ and delivery options.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <aside>
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-black text-arc-midnight">
                Inquiry Details Help Us Quote Faster
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Share part numbers, drawings, samples, target quantity and destination country. The
                current form shows a front-end success message only and does not send data to a real
                backend yet.
              </p>
              <div className="mt-6 grid gap-3">
                {rfqHighlights.map((item) => (
                  <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-4">
                    <p className="text-sm font-bold text-arc-midnight">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 border-l-4 border-arc-signal bg-arc-midnight p-5 text-white">
              <p className="text-sm font-semibold leading-6">
                No real email password, API key, database password or submission secret is included.
              </p>
            </div>
          </aside>

          <RfqForm />
        </div>
      </section>
    </>
  );
}
