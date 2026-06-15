import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { breadcrumbJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const privacySections = [
  {
    title: "Information we collect",
    body: "The RFQ form may collect buyer name, company, email, WhatsApp, country, product requirements, quantity, message details and uploaded product documents.",
  },
  {
    title: "How information is used",
    body: "Submitted information is used to review product requirements, confirm technical details, prepare quotation options and communicate about welding and cutting sourcing requests.",
  },
  {
    title: "Attachments",
    body: "Uploaded drawings, product lists, photos or PDF files should only include information needed for quotation. Do not upload unrelated confidential documents.",
  },
  {
    title: "Data storage",
    body: "RFQ storage can be connected through Supabase after environment variables are configured. Access should remain limited to authorized business users.",
  },
  {
    title: "Contact details",
    body: `For privacy or RFQ information questions, contact ${siteConfig.legalName} by email at ${siteConfig.email} or WhatsApp at ${siteConfig.whatsapp}.`,
  },
];

export const metadata = buildMetadata({
  title: "Privacy Notice",
  description:
    "Privacy notice for ArcFort Weld RFQ submissions, contact forms, buyer information and uploaded product documents.",
  path: "/privacy",
  keywords: ["ArcFort Weld privacy", "RFQ privacy", "welding supplier privacy notice"],
});

export default function PrivacyPage() {
  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Notice", path: "/privacy" },
        ])}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Notice" }]} />
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
            Privacy
          </p>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
            Privacy Notice
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            This page explains how {siteConfig.name} handles RFQ and contact information submitted
            through this website. Review with legal counsel before production launch if your market
            requires specific privacy language.
          </p>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5">
            {privacySections.map((section) => (
              <article key={section.title} className="border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-2xl font-black text-arc-midnight">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 border-l-4 border-arc-signal bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold leading-6 text-slate-700">
              Privacy contact:{" "}
              <a href={siteConfig.emailHref} className="font-bold text-arc-blue hover:text-arc-midnight">
                {siteConfig.email}
              </a>
              . Business address: {siteConfig.address}.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
            >
              Contact ArcFort Weld
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta title="Have a welding or cutting product inquiry?" />
        </div>
      </section>
    </>
  );
}
