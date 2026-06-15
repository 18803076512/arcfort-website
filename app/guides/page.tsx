import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllGuides } from "@/lib/content/guides";
import { breadcrumbJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";

export const metadata = buildMetadata({
  title: "Welding Buyer Guides",
  description:
    "Read ArcFort Weld welding and cutting buyer guides for RFQ preparation, MIG/MAG and TIG consumables, and plasma cutting parts sourcing.",
  path: "/guides",
  keywords: [
    "welding buyer guide",
    "welding parts RFQ guide",
    "MIG TIG consumables guide",
    "plasma consumables guide",
  ],
});

export default function GuidesPage() {
  const guides = getAllGuides();

  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Buyer Guides
            </p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
              Welding and cutting sourcing guides.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Practical B2B articles for buyers preparing product lists, compatibility details,
              packaging requirements and RFQs.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">Guide</p>
              <h2 className="mt-4 font-display text-2xl font-black leading-tight text-arc-midnight">
                {guide.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{guide.description}</p>
              <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                Read Guide
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta title="Have a product list ready?" />
        </div>
      </section>
    </>
  );
}
