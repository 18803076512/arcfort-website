import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllProductCategories } from "@/lib/content/categories";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

const buyerProfiles = [
  "Welding and cutting product distributors",
  "Importers and regional wholesalers",
  "Welding equipment and consumable suppliers",
  "Repair-shop and industrial supply networks",
] as const;

const distributorSupport = [
  {
    title: "Mixed Product Lists",
    description:
      "Combine MIG/MAG, TIG, plasma cutting, welding consumables, machines and accessories in one itemized RFQ.",
  },
  {
    title: "Product Reference Review",
    description:
      "Use model numbers, drawings, current-part photos or samples when dimensions and compatibility require confirmation.",
  },
  {
    title: "Trial Order Discussion",
    description:
      "Small trial orders are accepted for standard products, subject to product type and current order requirements.",
  },
  {
    title: "OEM & Private Label",
    description:
      "Logo, label, packaging, carton and model customization can be reviewed with quantity and artwork requirements.",
  },
  {
    title: "Export Packing",
    description:
      "Standard export packing or customized packaging can be discussed by product family, quantity and destination.",
  },
] as const;

const inquiryChecklist = [
  "Target product families, product names, SKUs or current supplier references",
  "Required model, size, thread, material or application details when available",
  "Quantity for each item and expected repeat purchasing volume",
  "Current-part photos, drawings, samples or product labels for matching work",
  "Standard packing, private label, logo, barcode or carton requirements",
  "Destination country, requested delivery schedule and preferred shipping method",
] as const;

const sourcingSteps = [
  {
    step: "01",
    title: "Send the product list",
    description: "Share item references, quantities, destination and available technical evidence.",
  },
  {
    step: "02",
    title: "Confirm product details",
    description: "Review compatibility, dimensions, packing and any fields that remain uncertain.",
  },
  {
    step: "03",
    title: "Review quotation options",
    description: "Confirm quoted items, MOQ, lead time, payment basis and delivery plan.",
  },
  {
    step: "04",
    title: "Plan trial or repeat orders",
    description: "Keep approved references and packaging details organized for future purchasing.",
  },
] as const;

const resourceLinks = [
  {
    href: "/downloads",
    title: "Catalog & RFQ Files",
    description: "Download the welding catalog, public product list and RFQ worksheet.",
  },
  {
    href: "/oem-service",
    title: "OEM Service",
    description: "Review logo, private label, carton and model customization requirements.",
  },
  {
    href: "/quality-control",
    title: "Quality Control",
    description: "See the incoming, production, packaging and outgoing inspection workflow.",
  },
  {
    href: "/shipping-payment",
    title: "Shipping & Payment",
    description: "Review port, payment, MOQ and regular lead-time information before RFQ.",
  },
  {
    href: "/guides/how-to-prepare-a-welding-parts-rfq",
    title: "RFQ Preparation Guide",
    description: "Prepare traceable line items, compatibility evidence and packaging details.",
  },
] as const;

const faq = [
  {
    question: "Can distributors combine several welding product families in one RFQ?",
    answer:
      "Yes. Keep each model, size and quantity on a separate line, then group the items by MIG/MAG, TIG, plasma cutting, welding consumables, machines or accessories.",
  },
  {
    question: "Are small trial orders accepted?",
    answer:
      "Small trial orders are accepted for standard products when available. MOQ for OEM products, customized packaging or special models depends on the item and production requirements.",
  },
  {
    question: "Can ArcFort Weld prepare private label packaging?",
    answer:
      "Logo printing, private label packaging, carton design and model customization are available after product details, quantity and artwork requirements are reviewed.",
  },
  {
    question: "How is product compatibility confirmed?",
    answer:
      "Compatibility can be reviewed using the torch or machine model, current-part reference, drawing, product photo or physical sample. A family name alone does not confirm exact fit.",
  },
  {
    question: "Does an inquiry create an exclusive distributor appointment?",
    answer:
      "No. A website inquiry starts product and commercial review only. Any territory or distributor arrangement would require separate written commercial agreement.",
  },
] as const;

export const metadata = buildMetadata({
  title: "Welding Products for Distributors & Importers",
  description:
    "Source ArcFort Weld welding and cutting products for distribution, wholesale and import programs. Send mixed SKU lists, drawings and packaging requirements for RFQ review.",
  path: "/distributor-supply",
  keywords: [
    "welding products distributor supply",
    "welding consumables importer",
    "wholesale welding torch parts",
    "OEM welding accessories supplier",
  ],
});

export default function DistributorSupplyPage() {
  const categories = getAllProductCategories();
  const products = getAllProducts();
  const productCounts = new Map(
    categories.map((category) => [
      category.slug,
      products.filter((product) => product.categorySlug === category.slug).length,
    ]),
  );
  const tradeDetails = [
    { label: "Company", value: siteConfig.legalName },
    { label: "Main Port", value: siteConfig.mainPort },
    { label: "Payment", value: siteConfig.paymentTerms },
    { label: "MOQ", value: siteConfig.moqPolicy },
    { label: "Regular Lead Time", value: siteConfig.leadTime },
    { label: "OEM Service", value: siteConfig.oemService },
  ] as const;

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Distributor Supply", path: "/distributor-supply" },
          ]),
          webPageJsonLd({
            name: "Welding Products for Distributors and Importers",
            description:
              "Welding and cutting product supply information for distributors, importers, wholesalers and industrial supply networks.",
            path: "/distributor-supply",
            image: "/images/site/arcfort-oem-consumables-workbench.png",
            dateModified: siteConfig.contentLastModified,
          }),
          faqJsonLd([...faq]),
        ]}
      />

      <section className="relative isolate overflow-hidden bg-arc-midnight text-white">
        <Image
          src="/images/site/arcfort-oem-consumables-workbench.png"
          alt="Welding torch consumables arranged for distributor product sourcing"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-arc-midnight/90" />
        <div className="mx-auto flex min-h-[34rem] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Distributor Supply" }]}
            inverse
          />
          <div className="mt-8 max-w-4xl">
            <p className="text-sm font-bold uppercase leading-6 tracking-[0.14em] text-arc-signal sm:tracking-[0.2em]">
              Distributor & Importer Supply
            </p>
            <h1 className="mt-4 break-words font-display text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Welding products for distributors, importers and wholesalers.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              Build a mixed welding and cutting product inquiry with traceable SKU references,
              compatibility evidence, quantities and packaging requirements. ArcFort Weld reviews
              the details before quotation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/rfq?product=Distributor%20welding%20product%20program"
                className="inline-flex min-h-12 w-full items-center justify-center bg-arc-signal px-6 text-sm font-bold uppercase tracking-[0.14em] text-arc-midnight transition hover:bg-white sm:w-auto"
              >
                Build Distributor RFQ
              </Link>
              <Link
                href="/downloads"
                className="inline-flex min-h-12 w-full items-center justify-center border border-white/35 px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Download Product Files
              </Link>
            </div>
            <div className="mt-8 flex flex-col gap-2 border-t border-white/15 pt-5 text-sm text-slate-300 sm:flex-row sm:gap-6">
              <a href={siteConfig.emailHref} className="break-words font-semibold hover:text-white">
                {siteConfig.email}
              </a>
              <a href={siteConfig.whatsappHref} className="font-semibold hover:text-white">
                WhatsApp {siteConfig.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Profile
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              A sourcing route for resale and repeat purchasing.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This page brings together the information an overseas buyer normally needs before
              requesting a mixed-product quotation. It is not a claim of exclusive appointment or
              guaranteed territory.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {buyerProfiles.map((profile) => (
              <div key={profile} className="border-l-4 border-arc-signal bg-arc-frost p-5">
                <p className="text-sm font-semibold leading-6 text-slate-700">{profile}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16" id="product-families">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Product Families
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              Build one RFQ across six welding and cutting categories.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Open a category to review current SKU pages, buyer guides and the technical fields
              that should be confirmed before ordering.
            </p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category.slug}
                className="border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-arc-midnight font-display text-base font-black text-arc-signal">
                    {category.code}
                  </span>
                  <span className="text-right text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {productCounts.get(category.slug) ?? 0} products
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>
                <Link
                  href={`/products/${category.slug}`}
                  className="mt-5 inline-flex min-h-11 items-center text-sm font-bold uppercase tracking-[0.14em] text-arc-blue hover:text-arc-copper"
                >
                  Review Category
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-midnight py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Distributor RFQ Support
            </p>
            <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">
              Practical support for item selection, packing and repeat purchasing.
            </h2>
          </div>
          <div className="mt-9 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-5">
            {distributorSupport.map((item) => (
              <article key={item.title} className="bg-arc-midnight p-5">
                <div className="h-1 w-14 bg-arc-signal" />
                <h3 className="mt-5 font-display text-xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Inquiry Checklist
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              Send enough information to make every line item traceable.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Exact dimensions, material grades, compatibility and certifications should come from
              verified records. Unknown details can remain open for sample or drawing review.
            </p>
            <Link
              href="/downloads/arcfort-rfq-template.csv"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center border border-arc-blue px-5 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white sm:w-auto"
            >
              Download RFQ Worksheet
            </Link>
          </div>
          <ul className="grid gap-3">
            {inquiryChecklist.map((item) => (
              <li
                key={item}
                className="flex gap-3 border-l-4 border-arc-signal bg-arc-frost p-4 text-sm leading-6 text-slate-700"
              >
                <span className="font-display font-black text-arc-blue">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Commercial Reference
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                Confirm trade details with the requested product list.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                These are current company policies for RFQ planning. Final terms depend on the
                product, quantity, packaging and cooperation requirements.
              </p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              {tradeDetails.map((item) => (
                <div key={item.label} className="border border-slate-200 bg-white p-5 shadow-sm">
                  <dt className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Sourcing Process
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight sm:text-4xl">
              Move from a mixed item list to a reviewed quotation.
            </h2>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {sourcingSteps.map((item) => (
              <article key={item.step} className="border-t-4 border-arc-signal bg-arc-frost p-5">
                <div className="font-display text-4xl font-black text-arc-blue">{item.step}</div>
                <h3 className="mt-4 font-display text-xl font-black text-arc-midnight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-midnight py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Buyer Resources
            </p>
            <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">
              Check product, inspection and delivery information before inquiry.
            </h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {resourceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-white/15 p-5 transition hover:border-arc-signal hover:bg-white/5"
              >
                <h3 className="font-display text-xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                <span className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-arc-signal group-hover:text-white">
                  Open Resource
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <FaqSection items={[...faq]} title="Distributor Supply FAQ" />
          <RfqCta
            title="Preparing a distributor product list?"
            description="Send item references, quantities, destination, drawings or current-part photos. ArcFort Weld will review technical and commercial details before quotation."
            productName="Distributor welding product program"
          />
        </div>
      </section>
    </>
  );
}
