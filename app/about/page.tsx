import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import {
  companyBuyerProfiles,
  companyEvidenceBoundaries,
  companyFaq,
  companyInquiryStages,
  companyResourceLinks,
  companyRfqPrompt,
} from "@/lib/content/company-profile";
import { getAllProductCategories } from "@/lib/content/categories";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";

const aboutImage = "/images/site/arcfort-oem-consumables-workbench.png";

export const metadata = buildMetadata({
  title: "Renqiu Ailesen Welding Technology Co., Ltd.",
  description:
    "Learn how Renqiu Ailesen Welding Technology Co., Ltd. operates ArcFort Weld for welding parts, plasma consumables, machines, OEM and export RFQs.",
  path: "/about",
  image: aboutImage,
  keywords: [
    "Renqiu Ailesen Welding Technology",
    "ArcFort Weld company",
    "welding and cutting supplier China",
    "OEM welding product supplier",
  ],
});

export default function AboutPage() {
  const categories = getAllProductCategories();
  const products = getAllProducts();
  const categoryCounts = new Map(
    categories.map((category) => [
      category.slug,
      products.filter((product) => product.categorySlug === category.slug).length,
    ]),
  );
  const rfqHref = `/rfq?product=${encodeURIComponent(companyRfqPrompt)}`;

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
          webPageJsonLd({
            name: "Renqiu Ailesen Welding Technology Co., Ltd. | ArcFort Weld",
            description:
              "Legal company identity, welding and cutting product scope, buyer services and export RFQ information for ArcFort Weld.",
            path: "/about",
            pageType: "AboutPage",
            image: aboutImage,
            dateModified: siteConfig.aboutLastModified,
          }),
          faqJsonLd([...companyFaq]),
        ]}
      />

      <section className="bg-white py-5 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-arc-midnight text-white">
        <Image
          src={aboutImage}
          alt="Representative welding torch parts, plasma cutting consumables and welding accessories arranged on a workbench"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,15,28,0.98)_0%,rgba(7,21,36,0.92)_48%,rgba(7,21,36,0.56)_100%)]" />
        <div className="mx-auto flex min-h-[34rem] max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase leading-6 tracking-[0.14em] text-arc-signal sm:tracking-[0.2em]">
              Legal Company Behind {siteConfig.name}
            </p>
            <h1 className="mt-4 max-w-4xl break-words font-display text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {siteConfig.legalName}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
              An industrial welding and cutting product supplier in {siteConfig.address}, serving
              distributors, importers, welding equipment suppliers, repair workshops, industrial
              users and OEM buyers through the {siteConfig.name} website brand.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="inline-flex min-h-12 w-full items-center justify-center bg-arc-signal px-6 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white sm:w-auto"
              >
                Review Product Range
              </Link>
              <Link
                href={rfqHref}
                className="inline-flex min-h-12 w-full items-center justify-center border border-white/35 px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Send Company RFQ
              </Link>
            </div>
            <div className="mt-5 flex flex-col gap-1 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:gap-5">
              <a
                href={buildEmailHref({ subject: "ArcFort Weld company and product inquiry" })}
                className="inline-flex min-h-8 min-w-0 items-center break-all font-semibold hover:text-white sm:break-normal"
              >
                {siteConfig.email}
              </a>
              <a
                href={buildWhatsAppHref()}
                className="inline-flex min-h-8 items-center font-semibold hover:text-white"
              >
                WhatsApp: {siteConfig.whatsapp}
              </a>
            </div>
          </div>
        </div>
        <p
          data-nosnippet
          className="absolute bottom-3 right-4 max-w-xs bg-arc-midnight/80 px-3 py-2 text-right text-[10px] leading-4 text-slate-300 sm:bottom-5 sm:right-6 sm:text-xs"
        >
          Representative product-range image. Exact items are confirmed by quotation.
        </p>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <dl className="mx-auto grid max-w-7xl gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Legal Company", siteConfig.legalName],
            ["Website Brand", siteConfig.name],
            ["Location", siteConfig.address],
            ["Business Role", "Industrial welding and cutting product supplier"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 bg-white px-5 py-6 sm:px-6">
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-arc-blue">
                {label}
              </dt>
              <dd className="mt-2 break-words text-sm font-semibold leading-6 text-arc-midnight">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16" aria-labelledby="company-overview">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Company Overview
            </p>
            <h2
              id="company-overview"
              className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl"
            >
              One legal company, one export-facing website brand.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-700">
            <p>
              {siteConfig.legalName} is the legal company behind {siteConfig.name}. The company is
              based in {siteConfig.address}, while {siteConfig.name} is the brand used on this
              website to organize product information, buyer resources and international RFQs.
            </p>
            <p>
              The business scope covers welding machines, cutting machines, MIG/MAG and TIG torch
              consumables, plasma cutting consumables, welding consumables, industrial accessories
              and OEM welding products. Product-specific details are confirmed against the
              buyer&apos;s model, drawing, sample or documented requirement before quotation.
            </p>
            <div className="border-l-4 border-arc-signal bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-display text-2xl font-black text-arc-midnight">
                Company identity for purchasing records
              </h3>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
                    English Name
                  </dt>
                  <dd className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {siteConfig.legalName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
                    Chinese Name
                  </dt>
                  <dd className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {siteConfig.chineseName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
                    Business Email
                  </dt>
                  <dd className="mt-2 break-all text-sm font-semibold leading-6 text-slate-700">
                    {siteConfig.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue">
                    WhatsApp
                  </dt>
                  <dd className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {siteConfig.whatsapp}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16" aria-labelledby="company-product-range">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Supply Scope
              </p>
              <h2
                id="company-product-range"
                className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl"
              >
                Welding and cutting products organized for B2B sourcing.
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              Browse the currently published product range by category. Exact dimensions, materials,
              compatibility, certification and packing are confirmed for the requested item rather
              than assumed from a product family name.
            </p>
          </div>
          <div className="mt-9 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products/${category.slug}`}
                className="group min-w-0 bg-white p-5 transition hover:bg-arc-midnight sm:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-signal">
                    {category.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300">
                    {categoryCounts.get(category.slug) ?? 0} listed products
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-black text-arc-midnight group-hover:text-white">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 group-hover:text-slate-300">
                  {category.description}
                </p>
                <span className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-signal">
                  View Product Range
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Programs
            </p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl">
              Start with the purchasing path that matches your business.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {companyBuyerProfiles.map((profile) => (
              <Link
                key={profile.title}
                href={profile.href}
                className="group border-l-4 border-arc-signal bg-white p-5 shadow-sm transition hover:bg-arc-midnight sm:p-6"
              >
                <h3 className="font-display text-2xl font-black text-arc-midnight group-hover:text-white">
                  {profile.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 group-hover:text-slate-300">
                  {profile.description}
                </p>
                <span className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-signal">
                  Review Buyer Route
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-midnight py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Inquiry to Order Basis
            </p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">
              Keep every product and commercial detail traceable.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              The workflow separates buyer-provided references from supplier-confirmed details so
              open technical fields remain visible until both sides approve them.
            </p>
          </div>
          <ol className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {companyInquiryStages.map((stage) => (
              <li key={stage.step} className="border border-white/15 bg-white/5 p-5 sm:p-6">
                <span className="font-display text-3xl font-black text-arc-signal">
                  {stage.step}
                </span>
                <h3 className="mt-4 font-display text-xl font-black leading-tight text-white">
                  {stage.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{stage.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Confirmed Company Information
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight">
                Facts buyers can use for initial supplier review.
              </h2>
              <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                {companyEvidenceBoundaries.confirmed.map((item) => (
                  <li key={item} className="flex gap-3 py-4 text-sm leading-6 text-slate-700">
                    <span className="font-display font-black text-arc-blue">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product-Specific Confirmation
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight">
                Details that require quotation evidence.
              </h2>
              <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                {companyEvidenceBoundaries.productSpecific.map((item) => (
                  <li key={item} className="flex gap-3 py-4 text-sm leading-6 text-slate-700">
                    <span className="font-display font-black text-arc-signal">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-8 border-l-4 border-arc-signal bg-arc-frost p-5 text-sm leading-7 text-slate-700">
            ArcFort Weld does not publish unsupported certification, production-capacity, customer,
            price or compatibility claims. Product and order evidence is reviewed for the specific
            RFQ before those details are used commercially.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Due Diligence
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              Continue reviewing the supply and order process.
            </h2>
          </div>
          <nav
            aria-label="Company due diligence resources"
            className="mt-8 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4"
          >
            {companyResourceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group min-w-0 bg-white p-5 transition hover:bg-arc-midnight sm:p-6"
              >
                <h3 className="font-display text-xl font-black text-arc-midnight group-hover:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 group-hover:text-slate-300">
                  {item.description}
                </p>
                <span className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-signal">
                  Review Details
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <FaqSection items={[...companyFaq]} />
          <RfqCta
            title="Discuss a welding and cutting product program."
            description="Send the product category, itemized references, quantity, destination and any drawing, label, sample photo or OEM packaging requirement available for review."
            productName="Company and product sourcing inquiry"
            rfqPrompt={companyRfqPrompt}
          />
        </div>
      </section>
    </>
  );
}
