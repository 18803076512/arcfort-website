import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerPathList } from "@/components/content/BuyerPathList";
import { DownloadCard } from "@/components/content/DownloadCard";
import { FaqSection } from "@/components/content/FaqSection";
import { PageSectionNav } from "@/components/content/PageSectionNav";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { breadcrumbJsonLd, collectionPageJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";

const documentTypes = [
  {
    title: "Product Catalog Request",
    description:
      "Send the product category, target market and item list so suitable catalog references can be reviewed for the quotation.",
  },
  {
    title: "Product Data Sheet Request",
    description:
      "Send the product model, reference part, drawing or sample evidence when exact technical data is required.",
  },
  {
    title: "OEM Packaging Information",
    description:
      "Provide the product list, quantity, logo, label and carton requirements for private-label review.",
  },
  {
    title: "Custom RFQ Product List",
    description:
      "Upload an Excel, CSV, PDF or Word product list when the public worksheets do not match the project.",
  },
] as const;

const downloadFiles = [
  {
    title: "Distributor Mixed-Product RFQ Workbook",
    type: "XLSX",
    href: "/downloads/arcfort-distributor-rfq-workbook.xlsx",
    description:
      "Prepare buyer profile, mixed SKU lines, trial and repeat quantities, packing requirements, evidence references and supplier-review status.",
    note: "Use one row per product or variant and leave unverified technical details for written confirmation.",
  },
  {
    title: "TIG Torch Switch Identification Worksheet",
    type: "CSV",
    href: "/downloads/arcfort-tig-torch-switch-identification.csv",
    description:
      "Organize TIG torch, handle switch, control lead, connector and welding machine evidence before requesting a compatible replacement.",
    note: "Complete only documented fields and attach clear photos of the handle and both cable ends.",
  },
  {
    title: "Welding Machine RFQ Workbook",
    type: "XLSX",
    href: "/downloads/arcfort-welding-machine-rfq.xlsx",
    description:
      "Record welding process, destination electrical input, documented machine requirements, accessories, market documents and approval checkpoints.",
    note: "Separate buyer requirements from supplier-confirmed data and include supporting nameplate or specification references.",
  },
  {
    title: "Plasma Consumables RFQ Workbook",
    type: "XLSX",
    href: "/downloads/arcfort-plasma-consumables-rfq.xlsx",
    description:
      "Record plasma torch models, consumable stack line items, quantities, evidence files, compatibility review and packing requirements.",
    note: "Use one row per electrode, nozzle, swirl ring, retaining cap, shield, spacer or kit.",
  },
  {
    title: "OEM Welding Project Brief",
    type: "XLSX",
    href: "/downloads/arcfort-oem-project-brief.xlsx",
    description:
      "Define product lines, buyer references, logo, labels, private packaging, evidence files and commercial requirements.",
    note: "Complete one row for each product or variant and attach the available drawing or product photo.",
  },
  {
    title: "ArcFort Weld Distributor Sourcing Guide",
    type: "PDF",
    href: "/downloads/arcfort-distributor-sourcing-guide.pdf",
    description:
      "Review ArcFort Weld product families, sourcing workflow, confirmed trade terms and distributor RFQ preparation.",
    note: "Use the checklist to prepare references, quantities, drawings, packaging and destination details.",
  },
  {
    title: "Renqiu Ailesen Welding Catalog",
    type: "PDF",
    href: "/downloads/renqiu-ailesen-welding-catalog.pdf",
    description:
      "Review MIG/MAG, TIG, MMA, plasma cutting and welding accessory product references from the company catalog.",
    note: "Final quotation details are confirmed by model, sample, drawing, quantity and destination.",
  },
  {
    title: "Public Product List",
    type: "CSV",
    href: "/downloads/arcfort-public-product-list.csv",
    description:
      "Download the current ArcFort Weld list with SKU, category, product URL and RFQ preparation notes.",
    note: "Use this file to shortlist products before adding quantity, model and packaging details.",
  },
  {
    title: "RFQ Product List Worksheet",
    type: "CSV",
    href: "/downloads/arcfort-rfq-template.csv",
    description:
      "Organize product name, reference part, quantity, material, packaging and destination details.",
    note: "Complete the worksheet and upload it through the RFQ form for structured review.",
  },
] as const;

const sectionLinks = [
  { href: "#catalogs", label: "Catalogs" },
  { href: "#rfq-files", label: "RFQ Workbooks" },
  { href: "#document-requests", label: "Document Requests" },
  { href: "#download-faq", label: "FAQ" },
] as const;

const buyerShortcuts = [
  {
    href: "/products",
    title: "Browse Product Systems",
    description: "Review categories and published product records before building a shortlist.",
  },
  {
    href: "/rfq",
    title: "Upload a Completed File",
    description: "Send a workbook, product list, drawing or product photo through the RFQ form.",
  },
  {
    href: "/oem-service",
    title: "Prepare an OEM Project",
    description: "Define the base product, artwork, packaging and approval basis.",
  },
  {
    href: "/contact",
    title: "Contact Sales",
    description: "Use business email or WhatsApp when a file is too large for the website form.",
  },
] as const;

const faq = [
  {
    question: "Are public PDF catalogs available on the website?",
    answer:
      "Yes. Buyers can download the ArcFort Weld distributor sourcing guide and the Renqiu Ailesen welding catalog. Final product details are confirmed against the requested model, sample, drawing and quantity before quotation.",
  },
  {
    question: "Can ArcFort Weld provide exact product data sheets?",
    answer:
      "Exact data sheets require a confirmed product model, drawing, sample or reference part. Unverified specifications are not issued as final product data.",
  },
  {
    question: "What file types can buyers send for RFQ?",
    answer:
      "The RFQ form accepts PDF, Excel, CSV, Word, JPG and PNG files. Large files can also be sent by email or WhatsApp after initial contact.",
  },
  {
    question: "Which worksheet should a distributor use?",
    answer:
      "Use the Distributor Mixed-Product RFQ Workbook for multi-category product lists. Use a product-specific workbook when a machine, plasma consumable set or OEM project needs more focused fields.",
  },
] as const;

export const metadata = buildMetadata({
  title: "Download Center for Welding Product Buyers",
  description:
    "Download ArcFort Weld catalogs, product lists and RFQ workbooks for distributors, welding machines, plasma consumables and OEM sourcing.",
  path: "/downloads",
  keywords: [
    "welding product catalog",
    "distributor welding product RFQ workbook",
    "plasma consumables RFQ workbook",
    "welding machine RFQ workbook",
    "welding RFQ product list",
    "OEM welding project brief",
  ],
});

export default function DownloadsPage() {
  const catalogFiles = downloadFiles.filter((file) => file.type === "PDF");
  const rfqFiles = downloadFiles.filter((file) => file.type !== "PDF");
  const requestLinks = documentTypes.map((item) => ({
    href: `/rfq?product=${encodeURIComponent(
      `${item.title}\nRequested product category / model:\nDocument purpose:\nQuantity and destination:\nReference, drawing or sample available:`,
    )}`,
    title: item.title,
    description: item.description,
  }));

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Downloads", path: "/downloads" },
          ]),
          collectionPageJsonLd({
            name: "ArcFort Weld Download Center",
            description:
              "Catalog, product list, RFQ worksheet and OEM project brief downloads for welding and cutting product sourcing.",
            path: "/downloads",
            items: downloadFiles.map((file) => ({
              name: file.title,
              path: file.href,
            })),
          }),
          faqJsonLd([...faq]),
        ]}
      />

      <div className="bg-white py-5 sm:py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Downloads" }]} />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="grid gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:py-20">
          <div>
            <p className="section-eyebrow !text-arc-signal">Technical Resource Center</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Catalogs and RFQ files for welding product sourcing.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Download product references and structured buyer workbooks for torch consumables,
              plasma cutting parts, welding machines, distributor orders and OEM projects.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#catalogs">Open Catalogs</ButtonLink>
              <ButtonLink href="#rfq-files" variant="onDark">
                Find RFQ Worksheet
              </ButtonLink>
            </div>
          </div>
          <div className="border-l-4 border-arc-signal pl-6">
            <h2 className="font-display text-2xl font-black text-white">
              Use documents as a sourcing reference.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Exact dimensions, material, compatibility and compliance documents require a
              product-specific reference, drawing, sample or approved specification before use.
            </p>
          </div>
        </Container>
      </section>

      <PageSectionNav ariaLabel="Download center sections" items={sectionLinks} />

      <Section id="catalogs" labelledBy="catalogs-title" className="bg-white">
        <Container>
          <SectionHeading
            id="catalogs-title"
            eyebrow="Catalogs & Reference Guides"
            title="Start with the available product and sourcing references."
            description="These public PDFs support initial range review. Use the RFQ workbooks below to identify the exact items needed."
            className="max-w-4xl"
          />
          <div className="mt-8">
            {catalogFiles.map((file) => (
              <DownloadCard key={file.href} {...file} />
            ))}
          </div>
        </Container>
      </Section>

      <Section id="rfq-files" labelledBy="rfq-files-title" className="bg-arc-frost">
        <Container>
          <SectionHeading
            id="rfq-files-title"
            eyebrow="RFQ Workbooks & Worksheets"
            title="Prepare a cleaner line-item inquiry."
            description="Choose the workbook closest to the purchasing task, complete only documented values and attach the supporting product evidence."
            className="max-w-4xl"
          />
          <div className="mt-8">
            {rfqFiles.map((file) => (
              <DownloadCard key={file.href} {...file} />
            ))}
          </div>
        </Container>
      </Section>

      <Section id="document-requests" labelledBy="document-requests-title" className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            id="document-requests-title"
            eyebrow="Product-Specific Documents"
            title="Request what the public library cannot confirm."
            description="Tell the sales team which product, market and quotation decision the document must support."
          />
          <BuyerPathList items={requestLinks} ariaLabel="Product document request options" />
        </Container>
      </Section>

      <Section className="bg-arc-midnight text-white">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            eyebrow="Next Buyer Step"
            title="Move from a working file to technical review."
            description="Shortlist the product family, prepare the available evidence and send one itemized inquiry."
            inverse
          />
          <BuyerPathList
            items={buyerShortcuts}
            inverse
            ariaLabel="Download center buyer shortcuts"
          />
        </Container>
      </Section>

      <Section id="download-faq" className="bg-arc-frost">
        <Container className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <FaqSection items={[...faq]} title="Download Center FAQ" />
          </div>
          <RfqCta
            title="Need a product-specific document?"
            description="Send the category, model, quantity, drawing or sample photo and explain which purchasing decision the document must support."
          />
        </Container>
      </Section>
    </>
  );
}
