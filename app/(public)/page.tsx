import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/content/ProductGrid";
import { StructuredData } from "@/components/content/StructuredData";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeInquiryCta } from "@/components/home/HomeInquiryCta";
import { ProductSystemCard } from "@/components/home/ProductSystemCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  homepageAdvantages,
  homepageIndustrySolutions,
  homepageProductSystems,
  homepageQualitySteps,
  homepageResources,
} from "@/content/homepage";
import { getAllApplications } from "@/lib/content/applications";
import { getAllProductCategories } from "@/lib/content/categories";
import { selectHomepageFeaturedProducts } from "@/lib/content/featured-products";
import { webPageJsonLd } from "@/lib/content/jsonld";
import { getAllProducts } from "@/lib/content/products";
import { buildMetadata } from "@/lib/content/seo";
import { siteConfig } from "@/lib/content/site";

export const metadata = buildMetadata({
  title: "Industrial Welding & Cutting Solutions",
  description:
    "Source MIG/MAG and TIG torch parts, plasma cutter consumables, welding machines and OEM accessories from ArcFort Weld for distributor and industrial RFQs.",
  path: "/",
  keywords: [
    "industrial welding solutions",
    "welding torch parts supplier",
    "plasma cutting consumables",
    "MIG MAG torch parts",
    "TIG torch parts",
  ],
});

export default function Home() {
  const categories = getAllProductCategories();
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const products = getAllProducts();
  const featuredProducts = selectHomepageFeaturedProducts(products);
  const featuredProductItems = featuredProducts.flatMap((product) => {
    const category = categoryMap.get(product.categorySlug);

    return category ? [{ product, category }] : [];
  });
  const applicationSlugs = new Set(getAllApplications().map((application) => application.slug));
  const industrySolutions = homepageIndustrySolutions.filter((item) =>
    applicationSlugs.has(item.slug),
  );

  return (
    <>
      <StructuredData
        data={webPageJsonLd({
          name: "ArcFort Weld Industrial Welding & Cutting Solutions",
          description:
            "Industrial welding and cutting product supplier for distributors, importers, OEM buyers, industrial users and repair workshops.",
          path: "/",
          image: siteConfig.defaultSeoImage,
          dateModified: siteConfig.contentLastModified,
        })}
      />

      <HomeHero />

      <Section
        id="product-systems"
        labelledBy="product-systems-title"
        className="bg-white !py-12 lg:!py-20"
      >
        <Container>
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="product-systems-title"
              eyebrow="Product Systems"
              title="Welding & cutting product systems."
              description="Browse equipment, torch assemblies, front-end parts, cutting consumables and workshop accessories by process."
            />
            <ButtonLink href="/products" variant="secondary" className="w-full lg:w-auto">
              View Product Center
            </ButtonLink>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {homepageProductSystems.map((system) => {
              const category = categoryMap.get(system.categorySlug);

              if (!category) {
                return null;
              }

              return (
                <ProductSystemCard
                  key={system.categorySlug}
                  href={`/products/${system.categorySlug}`}
                  title={system.systemName}
                  range={system.range}
                  image={system.image}
                  alt={`${system.systemName} product range from ArcFort Weld`}
                />
              );
            })}
          </div>
        </Container>
      </Section>

      <Section labelledBy="featured-products-title" className="bg-arc-frost !py-12 lg:!py-20">
        <Container>
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="featured-products-title"
              eyebrow="Featured Products"
              title="Products for your next RFQ."
              description="Compare products and send the references you need to source."
            />
            <ButtonLink href="/products" variant="secondary" className="w-full lg:w-auto">
              Browse All Products
            </ButtonLink>
          </div>
          <ProductGrid items={featuredProductItems} variant="featured" className="mt-10" />
        </Container>
      </Section>

      <Section
        labelledBy="industry-solutions-title"
        className="bg-arc-midnight !py-12 text-white lg:!py-20"
      >
        <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <SectionHeading
              id="industry-solutions-title"
              eyebrow="Industries & Applications"
              title="Find products by application."
              description="Explore product families and selection guidance for your work."
              inverse
            />
            <ButtonLink href="/applications" variant="onDark" className="mt-8 w-full sm:w-auto">
              Explore All Industries
            </ButtonLink>
          </div>
          <div className="grid gap-x-10 md:grid-cols-2">
            {industrySolutions.map((solution) => (
              <Link
                key={solution.slug}
                href={`/applications/${solution.slug}`}
                className="group grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/20 py-4 transition hover:border-white/60"
              >
                <span className="text-xs font-bold text-slate-400">{solution.number}</span>
                <span>
                  <span className="block font-display text-xl font-black text-white transition group-hover:text-slate-200">
                    {solution.label}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-slate-300">
                    {solution.summary}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section labelledBy="why-arcfort-title" className="bg-white !py-12 lg:!py-20">
        <Container>
          <SectionHeading
            id="why-arcfort-title"
            eyebrow="Why ArcFort Weld"
            title="Source with the right details."
          />
          <div className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
            {homepageAdvantages.map((advantage, index) => (
              <article key={advantage.title} className="border-t-2 border-arc-midnight pt-5">
                <p className="text-xs font-bold text-arc-blue">0{index + 1}</p>
                <h3 className="mt-3 font-display text-xl font-black text-arc-midnight">
                  {advantage.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{advantage.description}</p>
              </article>
            ))}
          </div>
          <Link
            href="/about"
            className="mt-9 inline-flex min-h-11 items-center text-sm font-bold text-arc-blue transition hover:text-arc-copper"
          >
            Read the company profile{" "}
            <span className="ml-2" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </Container>
      </Section>

      <Section labelledBy="quality-title" className="bg-arc-mist !py-12 lg:!py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          <figure>
            <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-white shadow-industrial">
              <Image
                src="/images/site/arcfort-oem-consumables-workbench.png"
                alt="Representative welding consumables, measuring tool and packing preparation workbench"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs leading-5 text-slate-500">
              <span data-nosnippet>
                Representative product preparation visual. Order controls depend on the confirmed
                product and requirement.
              </span>
            </figcaption>
          </figure>
          <div>
            <SectionHeading
              id="quality-title"
              eyebrow="Product & Order Review"
              title="Confirm the details before ordering."
              description="Review product references, fit, packing and shipment requirements against the quotation and order scope."
            />
            <ol className="mt-8 grid gap-0 border-t border-slate-300">
              {homepageQualitySteps.map((step, index) => (
                <li
                  key={step}
                  className="grid grid-cols-[2.5rem_1fr] items-center gap-4 border-b border-slate-300 py-4"
                >
                  <span className="text-xs font-bold text-arc-blue">0{index + 1}</span>
                  <span className="font-semibold text-arc-midnight">{step}</span>
                </li>
              ))}
            </ol>
            <ButtonLink
              href="/quality-control"
              variant="secondary"
              className="mt-8 w-full sm:w-auto"
            >
              Review Quality Process
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section labelledBy="cooperation-title" className="bg-white !py-12 lg:!py-20">
        <Container>
          <SectionHeading
            id="cooperation-title"
            eyebrow="Cooperation"
            title="OEM & distributor supply."
            description="Prepare a private-label project or a mixed product list for your business."
          />
          <div className="mt-8 grid gap-8 border-y border-arc-line py-8 lg:grid-cols-2 lg:divide-x lg:divide-arc-line">
            <div className="lg:pr-12">
              <p className="section-eyebrow">OEM / ODM</p>
              <h3 className="mt-3 font-display text-2xl font-black text-arc-midnight sm:text-3xl">
                Product & packaging customization.
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Discuss logo printing, private label packaging, carton design and model
                customization using samples, drawings, photos or technical requirements.
              </p>
              <ButtonLink href="/oem-service" variant="secondary" className="mt-7 w-full sm:w-auto">
                Explore OEM / ODM
              </ButtonLink>
            </div>
            <div className="border-t border-arc-line pt-10 lg:border-t-0 lg:pl-12 lg:pt-0">
              <p className="section-eyebrow">Distributor Cooperation</p>
              <h3 className="mt-3 font-display text-2xl font-black text-arc-midnight sm:text-3xl">
                Distributor purchasing support.
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                We welcome qualified welding equipment, industrial supply and hardware partners who
                need mixed product lists, catalog support and repeat purchasing coordination.
              </p>
              <ButtonLink
                href="/distributor-supply"
                variant="secondary"
                className="mt-7 w-full sm:w-auto"
              >
                Distributor Cooperation
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <Section labelledBy="resources-title" className="bg-arc-frost !py-12 lg:!py-20">
        <Container className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <SectionHeading
              id="resources-title"
              eyebrow="Technical Support & Resources"
              title="Guides, catalogs & order support."
            />
            <div className="mt-8 border-t border-slate-300">
              {homepageResources.map((resource) => (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className="group grid gap-2 border-b border-slate-300 py-5 sm:grid-cols-[0.75fr_1.25fr] sm:gap-8"
                >
                  <span className="font-bold text-arc-midnight transition group-hover:text-arc-blue">
                    {resource.title}
                  </span>
                  <span className="text-sm leading-6 text-slate-600">{resource.description}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t-2 border-arc-midnight pt-6 lg:mt-0">
            <p className="section-eyebrow">Global Supply</p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight">
              China & international sourcing.
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <h3 className="font-display text-xl font-black text-arc-midnight">China Market</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Nationwide supply, distributor cooperation, technical support and OEM / ODM
                  inquiry coordination.
                </p>
              </div>
              <div>
                <h3 className="font-display text-xl font-black text-arc-midnight">
                  International Market
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Export-oriented RFQ, compatibility review, private-label packaging and shipment
                  preparation for distributors and OEM buyers.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <HomeInquiryCta />
    </>
  );
}
