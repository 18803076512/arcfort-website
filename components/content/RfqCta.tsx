import Link from "next/link";

type RfqCtaProps = {
  title?: string;
  description?: string;
  productName?: string;
};

export function RfqCta({
  title = "Need a reliable welding parts supplier?",
  description = "Send your product list, drawings or sample details. ARCFORT will respond with quotation, MOQ and delivery options after confirmation.",
  productName,
}: RfqCtaProps) {
  const rfqHref = productName ? `/rfq?product=${encodeURIComponent(productName)}` : "/rfq";

  return (
    <section className="overflow-hidden bg-arc-midnight text-white shadow-industrial">
      <div className="relative px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-arc-signal">RFQ</p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={rfqHref}
              className="inline-flex items-center justify-center bg-arc-signal px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white"
            >
              Send Inquiry
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-white/30 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
