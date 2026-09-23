import Link from "next/link";
import { AnalyticsConsentSettings } from "@/components/AnalyticsConsentSettings";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
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
    title: "RFQ delivery and storage",
    body: "RFQ information and attachments may be transmitted to the configured ArcFort Weld sales email and, when enabled, stored in protected server-side systems for quotation follow-up. Access is limited to authorized business users and service providers supporting the inquiry process.",
  },
  {
    title: "Inquiry source attribution",
    body: "To understand which business channels produce relevant inquiries, an RFQ may include the entry page path, the external referring website origin and validated UTM campaign labels. Unrelated query parameters, full referrer paths and invalid campaign values are discarded.",
  },
  {
    title: "Security and abuse prevention",
    body: "ArcFort Weld and its hosting and security provider, Vercel, may process limited request metadata and browser challenge signals to detect automated submissions, protect the RFQ service and investigate abuse. These security signals are not used to prepare quotations or added to public product records.",
  },
  {
    title: "Retention",
    body: "Inquiry records are retained only as long as reasonably needed for quotation follow-up, commercial records, dispute handling or applicable legal obligations.",
  },
  {
    title: "Your choices",
    body: "You may contact ArcFort Weld to request access, correction or deletion of submitted inquiry information where applicable. Optional analytics can be allowed or disabled separately below.",
  },
  {
    title: "Contact details",
    body: `For privacy or RFQ information questions, contact ${siteConfig.legalName} by email at ${siteConfig.email} or WhatsApp at ${siteConfig.whatsapp}.`,
  },
];

export const metadata = buildMetadata({
  title: "Privacy Notice",
  description:
    "Privacy notice for ArcFort Weld RFQ submissions, security checks, uploaded documents and optional website analytics preferences.",
  path: "/privacy",
  keywords: ["ArcFort Weld privacy", "RFQ privacy", "welding supplier privacy notice"],
});

export default function PrivacyPage() {
  const analyticsId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const analyticsAvailable = Boolean(analyticsId && /^G-[A-Z0-9]+$/i.test(analyticsId));

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Privacy Notice", path: "/privacy" },
          ]),
          webPageJsonLd({
            name: "ArcFort Weld Privacy Notice",
            description:
              "Privacy notice for RFQ information, security checks, uploaded documents and optional website analytics.",
            path: "/privacy",
            dateModified: siteConfig.contentLastModified,
          }),
        ]}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Notice" }]} />
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">Privacy</p>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
            Privacy Notice
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            This notice explains how {siteConfig.name} handles RFQ information, uploaded documents
            and optional website analytics for international B2B inquiries.
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Last updated August 9, 2026
          </p>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5">
            {privacySections.map((section) => (
              <article
                key={section.title}
                className="border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="font-display text-2xl font-black text-arc-midnight">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
              </article>
            ))}
            <article className="border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-black text-arc-midnight">
                Optional analytics
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                When analytics is configured, it remains disabled until you allow it. ArcFort Weld
                may then measure page paths, public product references, product-search result
                counts, catalog downloads, contact-channel clicks and RFQ completion status. Names,
                companies, email addresses, telephone numbers, WhatsApp numbers, countries,
                messages, uploaded files and search text are not sent to analytics.
              </p>
              <AnalyticsConsentSettings analyticsAvailable={analyticsAvailable} />
            </article>
          </div>
          <div className="mt-8 border-l-4 border-arc-signal bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold leading-6 text-slate-700">
              Privacy contact:{" "}
              <a
                href={siteConfig.emailHref}
                className="font-bold text-arc-blue hover:text-arc-midnight"
              >
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
