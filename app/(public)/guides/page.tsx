import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { BuyerPathList } from "@/components/content/BuyerPathList";
import { PageSectionNav } from "@/components/content/PageSectionNav";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllGuides } from "@/lib/content/guides";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";

const sourcingGuideSlugs = new Set([
  "how-to-prepare-a-welding-parts-rfq",
  "welding-electrode-wire-rfq-guide",
  "welding-machine-sourcing-checklist",
  "oem-welding-products-private-label-guide",
]);

const identificationGuideSlugs = new Set([
  "tig-torch-switch-replacement-compatibility",
  "mig-vs-tig-torch-consumables",
  "identify-welding-torch-consumables-from-photos-samples",
  "tig-torch-parts-names-identification-guide",
  "mig-torch-front-end-parts-identification",
]);

const sectionLinks = [
  { href: "#method", label: "How to Use These Guides" },
  { href: "#guide-library", label: "Guide Library" },
  { href: "#buyer-resources", label: "Buyer Resources" },
] as const;

const buyerPrinciples = [
  {
    title: "Identify before selecting",
    description:
      "Record the complete torch, machine, installed assembly and current part before comparing individual components.",
  },
  {
    title: "Separate evidence from assumptions",
    description:
      "Use drawings, samples, labels, measured details and documented references; keep unknown values open for review.",
  },
  {
    title: "Prepare a quote-ready request",
    description:
      "Add quantity by item, destination country, packing needs and the evidence available for compatibility review.",
  },
] as const;

const resourceLinks = [
  {
    href: "/downloads",
    title: "Catalogs & RFQ Workbooks",
    description: "Download product references and structured files for buyer-side preparation.",
  },
  {
    href: "/products",
    title: "Product Systems",
    description: "Browse MIG/MAG, TIG, plasma, consumables, machines and accessories.",
  },
  {
    href: "/applications",
    title: "Industry Applications",
    description: "Review sourcing considerations by operating environment and purchasing context.",
  },
  {
    href: "/quality-control",
    title: "Quality Coordination",
    description: "Understand evidence, approval and inspection points before order confirmation.",
  },
] as const;

const guideDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

function formatGuideDate(value: string) {
  return guideDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export const metadata = buildMetadata({
  title: "Welding Buyer Guides",
  description:
    "Read ArcFort Weld guides for welding RFQs, torch parts, plasma consumables, welding machines, electrodes, wire and OEM packaging.",
  path: "/guides",
  keywords: [
    "welding buyer guide",
    "welding parts RFQ guide",
    "MIG TIG consumables guide",
    "plasma consumables guide",
    "welding machine sourcing",
    "OEM welding products",
  ],
});

export default function GuidesPage() {
  const guides = getAllGuides();
  const guideGroups = [
    {
      title: "Identification & Compatibility",
      description:
        "Start here when a torch, connector, switch or consumable must be identified from an existing assembly, photo or sample.",
      items: guides.filter((guide) => identificationGuideSlugs.has(guide.slug)),
    },
    {
      title: "Product Selection",
      description:
        "Compare component roles and the buyer evidence needed to select MIG/MAG, TIG, plasma and cable-related product families.",
      items: guides.filter(
        (guide) => !identificationGuideSlugs.has(guide.slug) && !sourcingGuideSlugs.has(guide.slug),
      ),
    },
    {
      title: "RFQ, Equipment & OEM",
      description:
        "Prepare commercial and technical information for machines, filler materials, private-label projects and multi-item RFQs.",
      items: guides.filter((guide) => sourcingGuideSlugs.has(guide.slug)),
    },
  ];

  return (
    <>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
          collectionPageJsonLd({
            name: "ArcFort Weld Welding Buyer Guides",
            description:
              "Buyer guides for welding and cutting product RFQs, compatibility confirmation and B2B sourcing preparation.",
            path: "/guides",
            items: guides.map((guide) => ({
              name: guide.title,
              path: `/guides/${guide.slug}`,
            })),
          }),
        ]}
      />

      <div className="bg-white py-5 sm:py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="py-14 sm:py-16 lg:py-20">
          <div className="max-w-5xl">
            <p className="section-eyebrow !text-arc-signal">Technical Buyer Library</p>
            <h1 className="mt-4 max-w-5xl font-display text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Welding and cutting sourcing guides for B2B buyers.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Practical guidance for identifying parts, preparing technical evidence, comparing
              product families and sending RFQs that can be reviewed without assumed compatibility.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#guide-library">Read Buyer Guides</ButtonLink>
              <ButtonLink href="/downloads" variant="onDark">
                Open Download Center
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <PageSectionNav ariaLabel="Buyer guide page sections" items={sectionLinks} />

      <Section id="method" labelledBy="method-title" className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            id="method-title"
            eyebrow="How to Use These Guides"
            title="Move from identification to a traceable quotation basis."
            description="The library explains what to inspect and what to send. It does not replace confirmation for the exact supplied item."
          />
          <div className="divide-y divide-arc-line border-y border-arc-line">
            {buyerPrinciples.map((item, index) => (
              <article
                key={item.title}
                className="grid gap-3 py-6 sm:grid-cols-[3rem_13rem_1fr] sm:gap-6"
              >
                <span className="font-display text-2xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-black leading-tight text-arc-midnight">
                  {item.title}
                </h3>
                <p className="text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="guide-library" labelledBy="guide-library-title" className="bg-arc-frost">
        <Container>
          <SectionHeading
            id="guide-library-title"
            eyebrow="Guide Library"
            title="Choose the decision you need to make."
            description="Articles are grouped by purchasing intent so buyers can move from identification to product selection and RFQ preparation."
            className="max-w-4xl"
          />
          <div className="mt-12 space-y-14">
            {guideGroups.map((group) => (
              <section
                key={group.title}
                aria-labelledby={`guide-group-${group.title.replaceAll(" ", "-").toLowerCase()}`}
              >
                <div className="grid gap-3 border-b border-arc-line pb-5 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
                  <h2
                    id={`guide-group-${group.title.replaceAll(" ", "-").toLowerCase()}`}
                    className="font-display text-2xl font-black text-arc-midnight sm:text-3xl"
                  >
                    {group.title}
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600">{group.description}</p>
                </div>
                <div className="grid md:grid-cols-2">
                  {group.items.map((guide, index) => (
                    <Link
                      key={guide.slug}
                      href={`/guides/${guide.slug}`}
                      className={`group border-arc-line py-7 transition md:px-6 ${
                        index % 2 === 0 ? "md:border-r" : ""
                      } ${index >= 2 ? "border-t" : index === 1 ? "border-t md:border-t-0" : ""}`}
                    >
                      <h3 className="font-display text-xl font-black leading-tight text-arc-midnight transition group-hover:text-arc-blue sm:text-2xl">
                        {guide.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{guide.description}</p>
                      <div
                        data-nosnippet
                        className="mt-5 flex items-center justify-between gap-4 text-xs font-bold uppercase text-slate-500"
                      >
                        <time dateTime={guide.modifiedDate}>
                          Updated {formatGuideDate(guide.modifiedDate)}
                        </time>
                        <span className="text-arc-blue">Read Guide &rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="buyer-resources" labelledBy="buyer-resources-title" className="bg-white">
        <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionHeading
            id="buyer-resources-title"
            eyebrow="Buyer Resources"
            title="Continue from guidance to product evidence."
            description="Use category pages, application guidance, quality coordination and working files to prepare the next purchasing step."
          />
          <BuyerPathList items={resourceLinks} ariaLabel="Related buyer resources" />
        </Container>
      </Section>

      <Section className="border-t border-arc-line bg-arc-frost">
        <Container>
          <RfqCta
            title="Have a product list ready?"
            description="Send your item list, drawings, sample photos, required quantity and destination country. ArcFort Weld will review the details before quotation."
          />
        </Container>
      </Section>
    </>
  );
}
