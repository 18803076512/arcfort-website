import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">404</p>
        <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          The page may have moved, or the product reference may not be available yet. Use the
          product center or RFQ page to continue your sourcing request.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-arc-midnight"
          >
            Product Center
          </Link>
          <Link
            href="/rfq"
            className="inline-flex items-center justify-center border border-arc-blue px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
          >
            Send RFQ
          </Link>
        </div>
      </div>
    </section>
  );
}
