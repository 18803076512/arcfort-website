import type { Metadata } from "next";
import Link from "next/link";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";

const recoveryEmailHref = buildEmailHref({
  subject: "ArcFort Weld product inquiry",
  message:
    "Hello ArcFort Weld, I could not find the product page I needed. Please help review this inquiry.\n\nProduct or model:\nQuantity:\nDestination country:\nPhoto, drawing or reference:",
});
const recoveryWhatsAppHref = buildWhatsAppHref({
  message:
    "Hello ArcFort Weld, I could not find the product page I needed. Product/model: [add details]. Quantity: [add details]. Destination: [add country].",
});

const recoveryLinks = [
  {
    href: "/products",
    title: "Browse Product Center",
    description: "Search current welding and cutting product categories and SKU pages.",
  },
  {
    href: "/distributor-supply",
    title: "Distributor Supply",
    description: "Review mixed product sourcing, OEM packaging and trade information.",
  },
  {
    href: "/rfq",
    title: "Prepare an RFQ",
    description: "Send product names, references, quantities, drawings or product photos.",
  },
] as const;

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <>
      <section className="bg-arc-midnight py-16 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">404</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-black leading-tight sm:text-6xl">
            We could not find that page.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            The address may have changed, or the requested product reference may not be published.
            Continue through a current product category or send the reference for quotation review.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center bg-arc-signal px-6 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white sm:w-auto"
          >
            Return Home
          </Link>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {recoveryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border-t-4 border-arc-signal bg-white p-6 shadow-sm transition hover:border-arc-blue"
              >
                <h2 className="font-display text-2xl font-black text-arc-midnight group-hover:text-arc-blue">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                <span className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
                  Continue
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 border-l-4 border-arc-signal bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
              Product reference not listed?
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
              Send the existing part number, drawing, product photo, torch or machine model and
              required quantity. Compatibility will be reviewed before quotation.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={recoveryEmailHref}
                className="inline-flex min-h-12 w-full items-center justify-center border border-arc-blue px-5 text-sm font-bold text-arc-blue transition hover:bg-arc-blue hover:text-white sm:w-auto"
              >
                {siteConfig.email}
              </a>
              <a
                href={recoveryWhatsAppHref}
                className="inline-flex min-h-12 w-full items-center justify-center border border-arc-blue px-5 text-sm font-bold text-arc-blue transition hover:bg-arc-blue hover:text-white sm:w-auto"
              >
                WhatsApp {siteConfig.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
