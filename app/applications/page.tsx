import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { RfqCta } from "@/components/content/RfqCta";
import { StructuredData } from "@/components/content/StructuredData";
import { getAllApplications } from "@/lib/content/applications";
import { breadcrumbJsonLd } from "@/lib/content/jsonld";
import { buildMetadata } from "@/lib/content/seo";

export const metadata = buildMetadata({
  title: "Applications",
  description:
    "Explore industrial welding and cutting application pages for shipbuilding, automotive, pipeline, fabrication, construction and repair workshops.",
  path: "/applications",
  keywords: [
    "welding applications",
    "industrial welding parts",
    "plasma cutting applications",
    "welding consumables by industry",
  ],
});

export default function ApplicationsPage() {
  const applications = getAllApplications();

  return (
    <>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Applications", path: "/applications" },
        ])}
      />

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Applications" }]} />
          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Applications
            </p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
              Welding and cutting supply by industrial use case.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Application pages help global buyers prepare clearer RFQs by industry, product family,
              replacement need and purchasing workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <Link
                key={application.slug}
                href={`/applications/${application.slug}`}
                className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
              >
                <div className="h-1 w-16 bg-arc-signal" />
                <h2 className="mt-5 font-display text-2xl font-black text-arc-midnight">
                  {application.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{application.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                  View Application
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta title="Need application-based sourcing support?" />
        </div>
      </section>
    </>
  );
}
