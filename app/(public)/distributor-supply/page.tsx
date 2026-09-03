import Image from "next/image";
import Link from "next/link";
import { RfqForm } from "@/app/(public)/rfq/RfqForm";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerPathList } from "@/components/content/BuyerPathList";
import { FaqSection } from "@/components/content/FaqSection";
import { PageSectionNav } from "@/components/content/PageSectionNav";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { DistributorRfqBuilder } from "@/components/distributor/DistributorRfqBuilder";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllProductCategories } from "@/lib/content/categories";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { buildEmailHref, buildWhatsAppHref, siteConfig } from "@/lib/content/site";

const distributorEmailHref = buildEmailHref({
  subject: "Distributor and importer sourcing inquiry",
  message:
    "Hello ArcFort Weld, I would like to discuss a distributor, importer or private-label welding product program.\n\nTarget product categories:\nEstimated trial quantity:\nDestination country:\nPackaging or OEM requirements:",
});
const distributorWhatsAppHref = buildWhatsAppHref({
  message:
    "Hello ArcFort Weld, I would like to discuss a distributor or private-label welding product program. Product categories: [add details]. Quantity: [add details]. Destination: [add country].",
});

const buyerProfiles = [
  "Welding and cutting product distributors",
  "Importers and regional wholesalers",
  "Welding equipment and consumable suppliers",
  "Repair-shop and industrial supply networks",
] as const;

const distributorSupport = [
  {
    title: "Mixed product lists",
    description:
      "Combine MIG/MAG, TIG, plasma cutting, welding consumables, machines and accessories in one itemized RFQ.",
  },
  {
    title: "Product reference review",
    description:
      "Use model numbers, drawings, current-part photos or samples where dimensions and compatibility require confirmation.",
  },
  {
    title: "Trial and repeat planning",
    description:
      "Discuss small trial orders for standard products and retain approved references for repeat purchasing.",
  },
  {
    title: "OEM and private label",
    description:
      "Review logo, label, packaging, carton and model customization with quantity and artwork requirements.",
  },
  {
    title: "Export packing coordination",
    description:
      "Define packing unit, labeling and carton requirements by product family, quantity and destination.",
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
    title: "Submit the product list",
    description: "Share item references, quantities, destination and available technical evidence.",
  },
  {
    step: "02",
    title: "Confirm product details",
    description: "Review fit, dimensions, packing and any fields that remain uncertain.",
  },
  {
    step: "03",
    title: "Review quotation options",
    description: "Confirm quoted items, MOQ, lead time, payment basis and delivery plan.",
  },
  {
    step: "04",
    title: "Control repeat orders",
    description:
      "Keep approved product, image, packing and artwork references for future purchasing.",
  },
] as const;

const resourceLinks = [
  {
    href: "/about",
    title: "Company Profile",
    description: "Verify the legal company, ArcFort Weld brand, location and contact routes.",
  },
  {
    href: "/downloads/arcfort-distributor-sourcing-guide.pdf",
    title: "Distributor Sourcing Guide",
    description: "Download the product scope, sourcing process, trade terms and RFQ checklist.",
  },
  {
    href: "/downloads",
    title: "Catalogs & RFQ Files",
    description: "Download the company catalog, public product list and distributor workbook.",
  },
  {
    href: "/oem-service",
    title: "OEM / ODM",
    description: "Review logo, private-label packaging, carton and model customization inputs.",
  },
  {
    href: "/quality-control",
    title: "Quality Coordination",
    description: "Review product-reference, packing and pre-shipment control points by order.",
  },
  {
    href: "/shipping-payment#export-order-workflow",
    title: "Shipping & Payment",
    description: "Review payment stages, lead-time basis, port options and export-order workflow.",
  },
  {
    href: "/guides/how-to-prepare-a-welding-parts-rfq",
    title: "RFQ Preparation Guide",
    description: "Prepare traceable line items, compatibility evidence and packing details.",
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
      "No. A website inquiry starts product and commercial review only. Any territory or distributor arrangement would require a separate written commercial agreement.",
  },
] as const;

const sectionLinks = [
  { href: "#product-families", label: "Product Range" },
  { href: "#distributor-rfq-builder", label: "Sourcing Brief" },
  { href: "#distributor-rfq", label: "Direct Inquiry" },
  { href: "#program-support", label: "Program Support" },
  { href: "#distributor-faq", label: "FAQ" },
] as const;

export const metadata = buildMetadata({
  title: "Welding Products for Distributors & Importers",
  description:
    "Source ArcFort Weld welding and cutting products for distributors and importers. Send SKU lists, drawings and packaging requirements for quotation preparation.",
  path: "/distributor-supply",
  useRouteSocialImages: true,
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
            dateModified: siteConfig.distributorLandingLastModified,
          }),
          faqJsonLd([...faq]),
        ]}
      />

      <section className="relative isolate overflow-hidden bg-arc-midnight text-white">
        <Image
          src="/images/site/arcfort-oem-consumables-workbench.png"
          alt="Representative welding product references for distributor sourcing"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
          quality={90}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,31,51,0.98)_0%,rgba(11,31,51,0.92)_48%,rgba(11,31,51,0.55)_100%)]" />
        <Container className="flex min-h-[650px] flex-col justify-center py-14 sm:py-16 lg:py-20">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Distributor Supply" }]}
            inverse
          />
          <div className="mt-10 max-w-4xl">
            <p className="section-eyebrow !text-slate-300">Distributor & Importer Supply</p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-black leading-[1.06] text-white sm:text-5xl lg:text-6xl">
              Build a welding product range for resale and repeat purchasing.
            </h1>
            <p className="body-large mt-6 max-w-3xl text-slate-200">
              Prepare mixed MIG/MAG, TIG, plasma cutting, welding consumable, machine and accessory
              inquiries with traceable item references, quantities and packing requirements.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#distributor-rfq-builder">Start a Sourcing Brief</ButtonLink>
              <a
                href="/downloads/arcfort-distributor-sourcing-guide.pdf"
                download
                className="button-base button-on-dark"
              >
                Download Sourcing Guide
              </a>
            </div>
          </div>
        </Container>
        <p
          data-nosnippet
          className="absolute bottom-4 right-4 max-w-xs bg-arc-midnight/85 px-3 py-2 text-right text-xs font-semibold text-slate-200 sm:bottom-6 sm:right-6"
        >
          Representative product sourcing visual; exact products require line-item review
        </p>
      </section>

      <PageSectionNav ariaLabel="Distributor supply page sections" items={sectionLinks} />

      <Section
        id="product-families"
        labelledBy="product-families-title"
        className="scroll-mt-32 bg-white"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <div>
              <SectionHeading
                id="product-families-title"
                eyebrow="Product Range"
                title="Source across six welding and cutting systems."
                description="Use one quotation list, but keep every model, size, quantity and current reference on a separate line."
              />
              <p className="mt-8 caption text-arc-blue">Suitable Buyer Profiles</p>
              <ul className="mt-3 divide-y divide-arc-line border-y border-arc-line">
                {buyerProfiles.map((profile) => (
                  <li key={profile} className="py-3 text-sm font-semibold text-slate-700">
                    {profile}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-x-10 sm:grid-cols-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products/${category.slug}`}
                  className="group border-t border-arc-line py-6"
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="caption text-arc-blue">{category.code}</span>
                    <span data-nosnippet className="text-xs font-semibold text-slate-500">
                      {productCounts.get(category.slug) ?? 0} published references
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-xl font-black text-arc-midnight group-hover:text-arc-blue">
                    {category.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section
        id="distributor-rfq-builder"
        labelledBy="sourcing-brief-title"
        className="scroll-mt-32 border-y border-arc-line bg-arc-frost"
      >
        <Container>
          <SectionHeading
            id="sourcing-brief-title"
            eyebrow="Sourcing Brief"
            title="Organize the commercial scope before sending line items."
            description="Use the guided brief for a fast inquiry, or use the distributor workbook when the product list contains many SKUs and reference files."
            className="mb-9 max-w-4xl"
          />
          <DistributorRfqBuilder />
        </Container>
      </Section>

      <Section
        id="distributor-rfq"
        labelledBy="distributor-rfq-title"
        className="scroll-mt-32 bg-white"
      >
        <Container className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
          <div className="lg:sticky lg:top-36">
            <SectionHeading
              id="distributor-rfq-title"
              eyebrow="Direct Inquiry"
              title="Send one product group or a mixed sourcing list."
              description="Attach drawings, product lists or clear current-part photos when dimensions or compatibility require review."
            />
            <div className="mt-7 border-t border-arc-line pt-5 text-sm leading-7 text-slate-600">
              <a
                href={distributorEmailHref}
                className="block break-words font-bold text-arc-blue hover:text-arc-midnight"
              >
                {siteConfig.email}
              </a>
              <a
                href={distributorWhatsAppHref}
                className="mt-1 block font-bold text-arc-blue hover:text-arc-midnight"
              >
                WhatsApp {siteConfig.whatsapp}
              </a>
            </div>
          </div>
          <div id="distributor-rfq-form" className="scroll-mt-32">
            <RfqForm
              initialProduct="Distributor mixed welding and cutting product inquiry"
              formPlacement="distributor_landing"
            />
          </div>
        </Container>
      </Section>

      <Section
        id="program-support"
        labelledBy="program-support-title"
        className="scroll-mt-32 border-y border-arc-line bg-arc-frost"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <SectionHeading
              id="program-support-title"
              eyebrow="Program Support"
              title="Keep product decisions and commercial terms traceable."
              description="ArcFort Weld reviews product scope, evidence, packing and order conditions before quotation; an inquiry does not create territory exclusivity."
            />
            <dl className="divide-y divide-arc-line border-y border-arc-line">
              {distributorSupport.map((item) => (
                <div key={item.title} className="grid gap-2 py-6 sm:grid-cols-[190px_1fr] sm:gap-8">
                  <dt className="font-display text-xl font-black text-arc-midnight">
                    {item.title}
                  </dt>
                  <dd className="text-sm leading-7 text-slate-600">{item.description}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-14 grid overflow-hidden border border-arc-line lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-white p-6 sm:p-8">
              <p className="section-eyebrow">Inquiry Checklist</p>
              <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight sm:text-3xl">
                Make every line item identifiable and quotable.
              </h2>
              <ol className="mt-7 divide-y divide-arc-line border-y border-arc-line">
                {inquiryChecklist.map((item, index) => (
                  <li key={item} className="grid grid-cols-[36px_1fr] gap-3 py-4">
                    <span className="font-display font-black text-arc-blue">{index + 1}</span>
                    <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
                  </li>
                ))}
              </ol>
              <a
                href="/downloads/arcfort-distributor-rfq-workbook.xlsx"
                download
                className="button-base button-secondary mt-7"
              >
                Download Distributor Workbook
              </a>
            </div>
            <div className="bg-arc-midnight p-6 text-white sm:p-8">
              <p className="caption text-slate-300">Commercial Basis</p>
              <dl className="mt-5 divide-y divide-white/15 border-y border-white/15">
                {tradeDetails.map((item) => (
                  <div key={item.label} className="py-4">
                    <dt className="text-xs font-bold uppercase text-slate-400">{item.label}</dt>
                    <dd className="mt-2 text-sm font-semibold leading-6 text-white">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <ButtonLink href="/shipping-payment" variant="onDark" className="mt-7 w-full">
                Review Order Terms
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <Section labelledBy="sourcing-process-title" className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
          <SectionHeading
            id="sourcing-process-title"
            eyebrow="Sourcing Process"
            title="Move from a mixed list to a reviewed quotation."
            description="Approved references and packing details become the control points for later repeat orders."
          />
          <ProcessSteps items={sourcingSteps} />
        </Container>
      </Section>

      <Section labelledBy="distributor-resources-title" className="bg-arc-midnight text-white">
        <Container>
          <SectionHeading
            id="distributor-resources-title"
            eyebrow="Buyer Resources"
            title="Verify the company, products and order process."
            description="Use the supporting pages and controlled downloads before sending a large or customized sourcing request."
            inverse
          />
          <BuyerPathList items={resourceLinks} inverse ariaLabel="Distributor buyer resources" />
        </Container>
      </Section>

      <Section id="distributor-faq" className="scroll-mt-32 bg-white">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <FaqSection items={[...faq]} title="Distributor Supply FAQ" />
          <RfqCta
            title="Preparing a distributor product list?"
            description="Send item references, quantities, destination, drawings or current-part photos for technical and commercial review."
            productName="Distributor welding product program"
          />
        </Container>
      </Section>
    </>
  );
}
