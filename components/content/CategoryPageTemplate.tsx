import Link from "next/link";
import type { ApplicationPage, Product, ProductCategory } from "@/lib/content/schemas";
import { BuyerResourceLinks } from "@/components/content/BuyerResourceLinks";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductGrid } from "@/components/content/ProductGrid";
import { RfqCta } from "@/components/content/RfqCta";
import { MigTorchPartsRfqBuilder } from "@/components/products/MigTorchPartsRfqBuilder";
import { PlasmaConsumablesRfqBuilder } from "@/components/products/PlasmaConsumablesRfqBuilder";
import { TigTorchPartsRfqBuilder } from "@/components/products/TigTorchPartsRfqBuilder";
import { WeldingMachineRfqBuilder } from "@/components/products/WeldingMachineRfqBuilder";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getBuyerGuideForCategory } from "@/lib/content/topic-links";

type CategoryPageTemplateProps = {
  category: ProductCategory;
  products: Product[];
  relatedCategories: ProductCategory[];
  relatedApplications: ApplicationPage[];
};

const rfqEssentials = [
  "Product name, model, drawing or reference part",
  "Size, thread, material, quantity and packaging requirement",
  "Destination country, delivery target and OEM request",
] as const;

export function CategoryPageTemplate({
  category,
  products,
  relatedCategories,
  relatedApplications,
}: CategoryPageTemplateProps) {
  const buyerGuideLink = getBuyerGuideForCategory(category.slug);
  const hasTechnicalGuide = Boolean(
    category.componentGuide?.length ||
    category.referenceFamilies?.length ||
    category.selectionVariables?.length ||
    category.compatibilityChecklist?.length,
  );
  const hasPlasmaRfqBuilder =
    category.slug === "plasma-cutting-consumables" && Boolean(category.referenceFamilies?.length);
  const hasTigRfqBuilder =
    category.slug === "tig-torch-parts" && Boolean(category.referenceFamilies?.length);
  const hasMigRfqBuilder =
    category.slug === "mig-mag-torch-parts" && Boolean(category.referenceFamilies?.length);
  const hasWeldingMachineRfqBuilder = category.slug === "welding-machines";
  const hasCategoryRfqBuilder =
    hasPlasmaRfqBuilder || hasTigRfqBuilder || hasMigRfqBuilder || hasWeldingMachineRfqBuilder;
  const hasTechnicalSection = hasTechnicalGuide || hasCategoryRfqBuilder;
  const categoryPageSections = [
    { href: "#category-products", label: "Products" },
    ...(hasTechnicalSection
      ? [{ href: "#category-component-guide", label: "Parts & Selection" }]
      : []),
    { href: "#category-buyer-guide", label: "Buyer Guide" },
    { href: "#category-applications", label: "Applications" },
    { href: "#category-faq", label: "FAQ & Related" },
  ] as const;

  return (
    <>
      <div className="border-b border-arc-line bg-white py-5">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: category.title },
            ]}
          />
        </Container>
      </div>

      <section className="bg-arc-midnight text-white">
        <Container className="py-12 sm:py-16 lg:py-20">
          <p className="section-eyebrow !text-slate-300">Product Category</p>
          <h1 className="mt-4 max-w-5xl font-display text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
            {category.title}
          </h1>
          <p className="body-large mt-6 max-w-3xl !text-slate-300">{category.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#category-products" className="w-full sm:w-auto">
              View Products
            </ButtonLink>
            <ButtonLink
              href={
                hasCategoryRfqBuilder
                  ? "#category-rfq-builder"
                  : `/rfq?product=${encodeURIComponent(category.title)}`
              }
              variant="onDark"
              className="w-full sm:w-auto"
            >
              {hasCategoryRfqBuilder ? "Build Product RFQ" : "Send Category RFQ"}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <nav
        aria-label={`${category.title} page sections`}
        className="sticky top-[var(--header-height)] z-20 border-b border-arc-line bg-white/95 backdrop-blur"
      >
        <Container>
          <ol className="flex min-h-14 items-center gap-6 overflow-x-auto">
            {categoryPageSections.map((section) => (
              <li key={section.href} className="shrink-0">
                <a
                  href={section.href}
                  className="flex min-h-14 items-center text-xs font-bold uppercase tracking-[0.1em] text-arc-midnight transition hover:text-arc-blue"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </Container>
      </nav>

      <Section id="category-products" labelledBy="category-products-title" className="bg-arc-frost">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="category-products-title"
              eyebrow="Product Range"
              title={`${category.shortTitle} available for inquiry.`}
              description="Published products show current sourcing references. Dimensions and compatibility should be checked against the requested model, drawing or sample before quotation."
            />
            <ButtonLink
              href={`/rfq?product=${encodeURIComponent(category.title)}`}
              className="w-full lg:w-auto"
            >
              Request Category Quote
            </ButtonLink>
          </div>
          {products.length > 0 ? (
            <ProductGrid
              items={products.map((product) => ({ product, category }))}
              className="mt-10"
            />
          ) : (
            <div className="mt-10 grid gap-px border border-arc-line bg-arc-line md:grid-cols-2">
              {category.productRange.map((item) => (
                <Link
                  key={item}
                  href={`/rfq?product=${encodeURIComponent(`${category.title} - ${item}`)}`}
                  className="bg-white p-6 transition hover:bg-arc-frost"
                >
                  <h3 className="font-display text-xl font-black text-arc-midnight">{item}</h3>
                  <span className="mt-4 inline-flex text-sm font-bold text-arc-blue">
                    Send product reference{" "}
                    <span className="ml-2" aria-hidden="true">
                      &rarr;
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 grid gap-8 border-t border-arc-line pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <p className="section-eyebrow">Category Sourcing Overview</p>
              <h3 className="mt-3 font-display text-2xl font-black text-arc-midnight sm:text-3xl">
                Define the product before confirming supply.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{category.seoIntro}</p>
            </div>
            <div>
              <h3 className="font-display text-xl font-black text-arc-midnight sm:text-2xl">
                What to include in your inquiry
              </h3>
              <ol className="mt-4 border-t-2 border-arc-midnight">
                {rfqEssentials.map((item, index) => (
                  <li
                    key={item}
                    className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-arc-line py-4"
                  >
                    <span className="font-display font-black text-arc-copper">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      {category.buyerResourceSection ? (
        <BuyerResourceLinks id="category-buyer-resources" {...category.buyerResourceSection} />
      ) : null}

      {hasTechnicalSection ? (
        <Section
          id="category-component-guide"
          labelledBy="category-component-guide-title"
          className="border-y border-arc-line bg-white"
        >
          <Container>
            <SectionHeading
              id="category-component-guide-title"
              eyebrow="Parts & Selection"
              title="Identify the assembly before confirming fit."
              description="Similar-looking parts can use different dimensions, threads or assembly relationships. Use the product family as a sourcing reference, then confirm the exact item from evidence."
            />

            {category.componentGuide?.length ? (
              <div className="mt-10 grid border-t-2 border-arc-midnight lg:grid-cols-2 lg:gap-x-10">
                {category.componentGuide.map((component, index) => {
                  const linkedProduct = component.productSlug
                    ? products.find((product) => product.slug === component.productSlug)
                    : undefined;

                  return (
                    <article
                      key={component.name}
                      className="grid gap-3 border-b border-arc-line py-5 sm:grid-cols-[3rem_1fr]"
                    >
                      <span className="font-display text-xl font-black text-arc-blue">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-display text-xl font-black text-arc-midnight">
                          {linkedProduct ? (
                            <Link
                              href={`/products/${category.slug}/${linkedProduct.slug}`}
                              className="hover:text-arc-blue"
                            >
                              {component.name}
                            </Link>
                          ) : (
                            component.name
                          )}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{component.role}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          <strong className="text-arc-midnight">Buyer check:</strong>{" "}
                          {component.buyerCheck}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {category.referenceFamilies?.length ? (
              <details className="mt-10 border-y border-arc-line">
                <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-5 py-4 font-display text-xl font-black text-arc-midnight">
                  <span>
                    Company Catalog Reference: Product Families ({category.referenceFamilies.length}
                    )
                  </span>
                  <span className="text-arc-blue" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="border-t border-arc-line pb-6">
                  <p className="max-w-4xl py-5 text-sm leading-7 text-slate-600">
                    These company-catalog family names help organize an inquiry. They are not
                    universal-fit claims; confirm the torch label, part reference, sample, drawing
                    or approved component stack.
                  </p>
                  <div className="overflow-hidden border border-arc-line">
                    <div className="hidden grid-cols-[0.55fr_1.05fr_1.4fr] bg-arc-midnight text-xs font-bold uppercase tracking-[0.12em] text-white md:grid">
                      <div className="p-4">Catalog family</div>
                      <div className="border-l border-white/10 p-4">Documented components</div>
                      <div className="border-l border-white/10 p-4">Buyer confirmation</div>
                    </div>
                    <div className="divide-y divide-arc-line">
                      {category.referenceFamilies.map((family) => (
                        <article
                          key={family.name}
                          className="grid gap-3 p-4 md:grid-cols-[0.55fr_1.05fr_1.4fr] md:gap-0 md:p-0"
                        >
                          <div className="md:p-4">
                            <h4 className="font-display text-lg font-black text-arc-midnight">
                              {family.seriesSlug ? (
                                <Link
                                  href={`/products/${category.slug}/series/${family.seriesSlug}`}
                                  className="hover:text-arc-blue"
                                >
                                  {family.name}
                                </Link>
                              ) : (
                                family.name
                              )}
                            </h4>
                          </div>
                          <p className="text-sm font-semibold leading-6 text-slate-700 md:border-l md:border-arc-line md:p-4">
                            {family.documentedComponents.join(", ")}
                          </p>
                          <p className="text-sm leading-6 text-slate-600 md:border-l md:border-arc-line md:p-4">
                            {family.buyerCheck}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                  <a
                    href="/downloads/renqiu-ailesen-welding-catalog.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-arc-blue hover:text-arc-copper"
                  >
                    Open company catalog{" "}
                    <span className="ml-2" aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                </div>
              </details>
            ) : null}

            {hasPlasmaRfqBuilder && category.referenceFamilies ? (
              <div id="category-rfq-builder" className="scroll-mt-28 pt-10">
                <PlasmaConsumablesRfqBuilder torchFamilies={category.referenceFamilies} />
              </div>
            ) : null}
            {hasTigRfqBuilder && category.referenceFamilies ? (
              <div id="category-rfq-builder" className="scroll-mt-28 pt-10">
                <TigTorchPartsRfqBuilder torchFamilies={category.referenceFamilies} />
              </div>
            ) : null}
            {hasMigRfqBuilder && category.referenceFamilies ? (
              <div id="category-rfq-builder" className="scroll-mt-28 pt-10">
                <MigTorchPartsRfqBuilder torchFamilies={category.referenceFamilies} />
              </div>
            ) : null}
            {hasWeldingMachineRfqBuilder ? (
              <div id="category-rfq-builder" className="scroll-mt-28 pt-10">
                <WeldingMachineRfqBuilder />
              </div>
            ) : null}

            {category.selectionVariables?.length || category.compatibilityChecklist?.length ? (
              <div className="mt-10 grid gap-10 border-t border-arc-line pt-10 lg:grid-cols-2">
                {category.selectionVariables?.length ? (
                  <div>
                    <h3 className="font-display text-2xl font-black text-arc-midnight">
                      Selection variables
                    </h3>
                    <dl className="mt-5 border-t-2 border-arc-midnight">
                      {category.selectionVariables.map((variable) => (
                        <div key={variable.label} className="border-b border-arc-line py-4">
                          <dt className="font-bold text-arc-midnight">{variable.label}</dt>
                          <dd className="mt-2 text-sm leading-6 text-slate-600">
                            {variable.whyItMatters}
                          </dd>
                          <dd className="mt-2 text-sm font-semibold text-arc-blue">
                            Confirm with: {variable.confirmationMethod}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
                {category.compatibilityChecklist?.length ? (
                  <div className="bg-arc-midnight p-6 text-white sm:p-8">
                    <h3 className="font-display text-2xl font-black">Compatibility evidence</h3>
                    <ol className="mt-5 border-t border-white/15">
                      {category.compatibilityChecklist.map((item, index) => (
                        <li
                          key={item}
                          className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-white/15 py-4"
                        >
                          <span className="font-display font-black text-arc-signal">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm leading-6 text-slate-300">{item}</span>
                        </li>
                      ))}
                    </ol>
                    <Link
                      href={buyerGuideLink.href}
                      className="mt-6 inline-flex min-h-11 items-center font-bold text-arc-signal hover:text-white"
                    >
                      Read identification guide{" "}
                      <span className="ml-2" aria-hidden="true">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Container>
        </Section>
      ) : null}

      <Section
        id="category-buyer-guide"
        labelledBy="category-buyer-guide-title"
        className="bg-white"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <SectionHeading
              id="category-buyer-guide-title"
              eyebrow="Buyer Guide"
              title={`How to choose ${category.shortTitle}.`}
              description="Use these checks to prepare a sourcing request. Confirmed drawings, samples and approved references remain the basis for final product matching."
            />
            <ol className="border-t-2 border-arc-midnight">
              {category.buyerGuide.map((item, index) => (
                <li
                  key={item}
                  className="grid gap-3 border-b border-arc-line py-5 sm:grid-cols-[3rem_1fr]"
                >
                  <span className="font-display text-xl font-black text-arc-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 grid gap-8 border-t border-arc-line pt-10 lg:grid-cols-3">
            <article>
              <h3 className="font-display text-2xl font-black text-arc-midnight">Product range</h3>
              <ul className="mt-5 grid gap-3">
                {category.productRange.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-arc-blue pl-4 text-sm leading-6 text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article>
              <h3 className="font-display text-2xl font-black text-arc-midnight">
                Specifications to confirm
              </h3>
              <ul className="mt-5 grid gap-3">
                {category.commonSpecifications.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-arc-line pl-4 text-sm leading-6 text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article>
              <h3 className="font-display text-2xl font-black text-arc-midnight">
                Compatibility, packing & OEM
              </h3>
              <p className="mt-5 text-sm leading-7 text-slate-600">{category.compatibilityNote}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{category.packagingMoqNote}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{category.oemServiceNote}</p>
              <Link
                href="/oem-service"
                className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-arc-blue hover:text-arc-copper"
              >
                Review OEM service{" "}
                <span className="ml-2" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            </article>
          </div>

          {category.features.length > 0 ? (
            <div className="mt-10 border-y border-arc-line py-6">
              <p className="caption">Supply considerations</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-arc-signal" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </Section>

      <Section
        id="category-applications"
        labelledBy="category-applications-title"
        className="bg-arc-midnight text-white"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <SectionHeading
              id="category-applications-title"
              eyebrow="Applications"
              title="Industrial sourcing scenarios."
              description="Product families support distributor programs, repeat maintenance purchasing and industrial welding or cutting requirements."
              inverse
            />
            <div>
              <div className="grid border-t border-white/15 sm:grid-cols-2">
                {category.applications.map((application) => (
                  <p
                    key={application}
                    className="border-b border-white/15 py-4 text-sm font-semibold leading-7 text-slate-200 sm:odd:pr-5 sm:even:border-l sm:even:border-white/15 sm:even:pl-5"
                  >
                    {application}
                  </p>
                ))}
              </div>
              {relatedApplications.length > 0 ? (
                <div className="mt-8">
                  <p className="caption !text-slate-300">Related application pages</p>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                    {relatedApplications.map((application) => (
                      <Link
                        key={application.slug}
                        href={`/applications/${application.slug}`}
                        className="text-sm font-bold text-arc-signal hover:text-white"
                      >
                        {application.title} <span aria-hidden="true">&rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
              {category.buyerTool ? (
                <div className="mt-8 border-t border-white/15 pt-6">
                  <h3 className="font-display text-xl font-black">{category.buyerTool.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    {category.buyerTool.description}
                  </p>
                  <a
                    href={category.buyerTool.href}
                    download
                    className="mt-5 inline-flex min-h-11 items-center font-bold text-arc-signal hover:text-white"
                  >
                    {category.buyerTool.buttonLabel}{" "}
                    <span className="ml-2" aria-hidden="true">
                      &darr;
                    </span>
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      <Section id="category-faq" labelledBy="category-related-title" className="bg-arc-frost">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <FaqSection items={category.faq} />
            <aside>
              <h2
                id="category-related-title"
                className="font-display text-2xl font-black text-arc-midnight"
              >
                Related categories
              </h2>
              <div className="mt-5 border-t-2 border-arc-midnight">
                {relatedCategories.map((relatedCategory) => (
                  <Link
                    key={relatedCategory.slug}
                    href={`/products/${relatedCategory.slug}`}
                    className="group flex items-center justify-between gap-5 border-b border-arc-line py-4"
                  >
                    <span className="flex min-w-0 items-center gap-4">
                      <span
                        data-nosnippet
                        data-snippet-region="related-category-code"
                        className="shrink-0 text-xs font-bold uppercase text-arc-blue"
                      >
                        {relatedCategory.code}
                      </span>
                      <span className="font-display text-lg font-black text-arc-midnight group-hover:text-arc-blue">
                        {relatedCategory.title}
                      </span>
                    </span>
                    <span className="text-arc-blue" aria-hidden="true">
                      &rarr;
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-8 border-t border-arc-line pt-6">
                <p className="caption">Related buyer guide</p>
                <Link href={buyerGuideLink.href} className="group mt-3 block">
                  <h3 className="font-display text-xl font-black text-arc-midnight group-hover:text-arc-blue">
                    {buyerGuideLink.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {buyerGuideLink.description}
                  </p>
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section className="bg-white">
        <Container>
          <RfqCta title={`Need ${category.shortTitle}?`} />
        </Container>
      </Section>
    </>
  );
}
