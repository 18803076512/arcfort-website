import type { Metadata } from "next";

const fields = [
  { label: "Company Name", type: "text", placeholder: "Your company" },
  { label: "Contact Email", type: "email", placeholder: "name@company.com" },
  { label: "Country / Region", type: "text", placeholder: "Destination market" },
  { label: "Product Category", type: "text", placeholder: "MIG, TIG, Plasma, Machines..." },
];

export const metadata: Metadata = {
  title: "RFQ",
  description:
    "Send an RFQ to ARCFORT for welding and cutting parts, consumables, machines, and accessories.",
};

export default function RfqPage() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">RFQ</p>
          <h1 className="mt-3 font-display text-4xl font-black text-arc-midnight sm:text-5xl">
            Request a quotation from ARCFORT.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Provide product references, quantities, target market, and any technical requirements.
            This static form is ready for future integration with your preferred CRM or email
            workflow.
          </p>
          <div className="mt-8 border-l-4 border-arc-signal bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold leading-6 text-slate-700">
              No real API keys or submission secrets are included in this project.
            </p>
          </div>
        </div>

        <form className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.label} className="block">
                <span className="text-sm font-bold text-arc-midnight">{field.label}</span>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
                />
              </label>
            ))}
          </div>
          <label className="mt-5 block">
            <span className="text-sm font-bold text-arc-midnight">RFQ Details</span>
            <textarea
              rows={7}
              placeholder="Part numbers, drawings, torch models, annual volume, packaging needs, and timeline."
              className="mt-2 w-full border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-arc-blue focus:ring-arc-blue"
            />
          </label>
          <button
            type="button"
            className="mt-6 w-full bg-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-arc-midnight sm:w-auto"
          >
            Submit RFQ
          </button>
        </form>
      </div>
    </section>
  );
}
