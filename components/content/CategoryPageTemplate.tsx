import Link from "next/link";
import type { ApplicationPage, Product, ProductCategory } from "@/lib/content/schemas";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductCard } from "@/components/content/ProductCard";
import { RfqCta } from "@/components/content/RfqCta";
import { MigTorchPartsRfqBuilder } from "@/components/products/MigTorchPartsRfqBuilder";
import { PlasmaConsumablesRfqBuilder } from "@/components/products/PlasmaConsumablesRfqBuilder";
import { TigTorchPartsRfqBuilder } from "@/components/products/TigTorchPartsRfqBuilder";
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
  "Destination country, expected lead time and OEM request",
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
  const hasCategoryRfqBuilder = hasPlasmaRfqBuilder || hasTigRfqBuilder || hasMigRfqBuilder;
  const categoryStats = [
    { label: "Products", value: `${products.length}` },
    { label: "OEM support", value: "Available" },
    { label: "Trial orders", value: "Accepted" },
  ] as const;
  const categoryPageSections = [
    { href: "#category-products", label: "Products" },
    ...(hasTechnicalGuide
      ? [{ href: "#category-component-guide", label: "Parts & Selection" }]
      : []),
    ...(hasCategoryRfqBuilder ? [{ href: "#category-rfq-builder", label: "Build RFQ" }] : []),
    { href: "#category-buyer-guide", label: "Buyer Guide" },
    { href: "#category-product-information", label: "Product Information" },
    { href: "#category-ordering-information", label: "Ordering & OEM" },
    { href: "#category-applications", label: "Applications" },
    { href: "#category-faq", label: "FAQ & Related" },
  ] as const;

  return (
    <>
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: category.title },
            ]}
          />
        </div>
      </section>

      <section className="bg-arc-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase leading-6 tracking-[0.14em] text-arc-signal sm:tracking-[0.2em]">
              Product Category
            </p>
            <h1 className="mt-4 max-w-4xl break-words font-display text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {category.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {category.description}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">{category.seoIntro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#category-products"
                className="inline-flex w-full items-center justify-center bg-arc-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-arc-midnight transition hover:bg-white sm:w-auto"
              >
                View Products
              </Link>
              <Link
                href={
                  hasCategoryRfqBuilder
                    ? "#category-rfq-builder"
                    : `/rfq?product=${encodeURIComponent(category.title)}`
                }
                className="inline-flex w-full items-center justify-center border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
              >
                {hasCategoryRfqBuilder ? "Build Product RFQ" : "Send Category RFQ"}
              </Link>
            </div>
          </div>

          <aside className="border border-white/10 bg-white/5 p-5 shadow-industrial">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
              Buyer confirmation
            </p>
            <div className="mt-5 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
              {categoryStats.map((item) => (
                <div key={item.label} className="bg-arc-midnight p-4">
                  <div className="font-display text-2xl font-black text-arc-signal">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              {rfqEssentials.map((item) => (
                <div key={item} className="border-l-4 border-arc-signal bg-white/5 p-4">
                  <p className="text-sm font-semibold leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <nav
        aria-label={`${category.title} page sections`}
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ol
            className={`grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-3 ${hasCategoryRfqBuilder ? "lg:grid-cols-4 xl:grid-cols-8" : hasTechnicalGuide ? "lg:grid-cols-7" : "lg:grid-cols-6"}`}
          >
            {categoryPageSections.map((section, index) => (
              <li key={section.href} className="bg-white">
                <a
                  href={section.href}
                  className="flex min-h-14 items-center justify-center gap-2 px-3 py-3 text-center text-xs font-bold uppercase leading-5 tracking-[0.1em] text-arc-midnight transition hover:bg-arc-frost hover:text-arc-blue"
                >
                  <span className="text-arc-blue">{String(index + 1).padStart(2, "0")}</span>
                  <span>{section.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <section id="category-products" className="scroll-mt-28 bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Product Range
              </p>
              <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
                {category.shortTitle} available for quotation
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Product listings show current sourcing references. Missing dimensions or
                compatibility fields should be confirmed by sample, drawing or model number.
              </p>
            </div>
            <Link
              href={`/rfq?product=${encodeURIComponent(category.title)}`}
              className="inline-flex w-full items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight sm:w-auto"
            >
              Request Quote
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} category={category} />
            ))}
            {products.length === 0
              ? category.productRange.map((item) => (
                  <Link
                    key={item}
                    href={`/rfq?product=${encodeURIComponent(`${category.title} - ${item}`)}`}
                    className="group border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                      RFQ Product Group
                    </div>
                    <h3 className="mt-3 font-display text-xl font-black leading-tight text-arc-midnight">
                      {item}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Send model, quantity, drawing, photo or package requirement for quotation
                      confirmation.
                    </p>
                    <span className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                      Send RFQ
                    </span>
                  </Link>
                ))
              : null}
          </div>
        </div>
      </section>

      {hasTechnicalGuide ? (
        <section
          id="category-component-guide"
          className="scroll-mt-28 border-y border-slate-200 bg-white py-14 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                Component Identification
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight text-arc-midnight sm:text-4xl">
                Understand the parts before confirming compatibility.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Similar-looking welding and cutting parts can use different dimensions, threads or
                assembly relationships. Use this component index to prepare an RFQ, then confirm the
                exact product from a torch model, drawing, sample or approved reference.
              </p>
            </div>

            {category.componentGuide?.length ? (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {category.componentGuide.map((component, index) => {
                  const linkedProduct = component.productSlug
                    ? products.find((product) => product.slug === component.productSlug)
                    : undefined;

                  return (
                    <article
                      key={component.name}
                      className="grid gap-4 border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[3.5rem_1fr]"
                    >
                      <div className="font-display text-3xl font-black text-arc-blue">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-black text-arc-midnight">
                          {linkedProduct ? (
                            <Link
                              href={`/products/${category.slug}/${linkedProduct.slug}`}
                              className="transition hover:text-arc-blue"
                            >
                              {component.name}
                            </Link>
                          ) : (
                            component.name
                          )}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-slate-700">{component.role}</p>
                        <div className="mt-4 border-l-4 border-arc-signal bg-arc-frost p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-arc-blue">
                            Buyer check
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {component.buyerCheck}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {category.referenceFamilies?.length ? (
              <div className="mt-10">
                <div className="max-w-4xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
                    Company Catalog Reference
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-black leading-tight text-arc-midnight sm:text-3xl">
                    Torch families and documented consumable stacks
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    The Renqiu Ailesen company catalog shows the following product-family
                    breakdowns. Use them to organize an inquiry; final compatibility still requires
                    the exact torch label, part reference, sample, drawing or approved stack.
                  </p>
                </div>
                <div className="mt-6 overflow-hidden border border-slate-200 bg-white shadow-sm">
                  <div className="hidden grid-cols-[0.55fr_1.05fr_1.4fr] bg-arc-midnight text-xs font-bold uppercase tracking-[0.14em] text-white md:grid">
                    <div className="p-4">Catalog family</div>
                    <div className="border-l border-white/10 p-4">Documented components</div>
                    <div className="border-l border-white/10 p-4">Buyer confirmation</div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {category.referenceFamilies.map((family) => (
                      <article
                        key={family.name}
                        className="grid gap-4 p-4 md:grid-cols-[0.55fr_1.05fr_1.4fr] md:gap-0 md:p-0"
                      >
                        <div className="md:p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 md:hidden">
                            Catalog family
                          </p>
                          <h4 className="mt-1 font-display text-xl font-black text-arc-midnight md:mt-0">
                            {family.name}
                          </h4>
                        </div>
                        <div className="md:border-l md:border-slate-200 md:p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 md:hidden">
                            Documented components
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700 md:mt-0">
                            {family.documentedComponents.join(", ")}
                          </p>
                        </div>
                        <div className="border-l-4 border-arc-signal bg-arc-frost p-4 md:border-y-0 md:border-l md:border-slate-200 md:bg-transparent">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 md:hidden">
                            Buyer confirmation
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-700 md:mt-0">
                            {family.buyerCheck}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-3 text-xs font-semibold leading-5 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Source: Renqiu Ailesen Welding Technology Co., Ltd. welding catalog,{" "}
                    {category.title}
                    section. Catalog family names are sourcing references and are not universal-fit
                    claims.
                  </p>
                  <a
                    href="/downloads/renqiu-ailesen-welding-catalog.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 shrink-0 items-center justify-center border border-arc-blue px-4 text-center font-bold uppercase tracking-[0.12em] text-arc-blue transition hover:bg-arc-frost"
                  >
                    Open Company Catalog
                  </a>
                </div>
              </div>
            ) : null}

            {hasPlasmaRfqBuilder && category.referenceFamilies ? (
              <div id="category-rfq-builder" className="scroll-mt-28 pt-8">
                <PlasmaConsumablesRfqBuilder torchFamilies={category.referenceFamilies} />
              </div>
            ) : null}

            {hasTigRfqBuilder && category.referenceFamilies ? (
              <div id="category-rfq-builder" className="scroll-mt-28 pt-8">
                <TigTorchPartsRfqBuilder torchFamilies={category.referenceFamilies} />
              </div>
            ) : null}

            {hasMigRfqBuilder && category.referenceFamilies ? (
              <div id="category-rfq-builder" className="scroll-mt-28 pt-8">
                <MigTorchPartsRfqBuilder torchFamilies={category.referenceFamilies} />
              </div>
            ) : null}

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              {category.selectionVariables?.length ? (
                <div className="border border-slate-200 bg-arc-frost p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-blue">
                    Selection Variables
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-black text-arc-midnight">
                    Details that change the product match
                  </h3>
                  <dl className="mt-5 grid gap-3">
                    {category.selectionVariables.map((variable) => (
                      <div key={variable.label} className="border border-slate-200 bg-white p-4">
                        <dt className="font-display text-lg font-black text-arc-midnight">
                          {variable.label}
                        </dt>
                        <dd className="mt-2 text-sm leading-6 text-slate-600">
                          {variable.whyItMatters}
                        </dd>
                        <dd className="mt-3 text-xs font-semibold leading-5 text-arc-blue">
                          Confirm with: {variable.confirmationMethod}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              {category.compatibilityChecklist?.length ? (
                <aside className="border border-slate-200 bg-arc-midnight p-5 text-white shadow-industrial sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-arc-signal">
                    Compatibility Workflow
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-black">
                    Prepare evidence before quotation
                  </h3>
                  <ol className="mt-5 grid gap-3">
                    {category.compatibilityChecklist.map((item, index) => (
                      <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 bg-white/5 p-4">
                        <span className="font-display font-black text-arc-signal">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm leading-6 text-slate-200">{item}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Link
                      href={buyerGuideLink.href}
                      className="inline-flex min-h-12 items-center justify-center bg-arc-signal px-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-arc-midnight transition hover:bg-white"
                    >
                      Read Identification Guide
                    </Link>
                    <Link
                      href={`/rfq?product=${encodeURIComponent(category.title)}`}
                      className="inline-flex min-h-12 items-center justify-center border border-white/30 px-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white/10"
                    >
                      Send Evidence for Review
                    </Link>
                  </div>
                </aside>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section id="category-buyer-guide" className="scroll-mt-28 bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Category Buyer Guide
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              How buyers should choose {category.shortTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Industrial purchasing is safer when each small fit detail is checked before quotation.
              Use this section as a sourcing checklist, not as a substitute for confirmed drawings
              or samples.
            </p>
          </div>
          <div className="grid gap-5">
            {category.buyerGuide.map((item, index) => (
              <article
                key={item}
                className="grid gap-4 border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[4rem_1fr] sm:items-start"
              >
                <div className="font-display text-4xl font-black text-arc-blue">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="text-sm font-semibold leading-7 text-slate-700">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="category-product-information"
        className="scroll-mt-28 bg-arc-frost py-14 sm:py-16"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              What Buyers Can Source
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Product range
            </h2>
            <div className="mt-5 grid gap-3">
              {category.productRange.map((item) => (
                <div key={item} className="border-l-4 border-arc-signal bg-arc-frost p-4">
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Details To Confirm
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Common specifications
            </h2>
            <div className="mt-5 grid gap-3">
              {category.commonSpecifications.map((item) => (
                <div key={item} className="border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="category-ordering-information" className="scroll-mt-28 bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Compatibility
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Fit and model confirmation
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{category.compatibilityNote}</p>
          </article>

          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              OEM Service
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Packaging and brand support
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{category.oemServiceNote}</p>
            <Link
              href="/oem-service"
              className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue hover:text-arc-copper"
            >
              Review OEM Service
            </Link>
          </article>

          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Packaging & MOQ
            </p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Trial order and export packing
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{category.packagingMoqNote}</p>
            <Link
              href={`/rfq?product=${encodeURIComponent(category.title)}`}
              className="mt-5 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue hover:text-arc-copper"
            >
              Send Category RFQ
            </Link>
          </article>
        </div>
      </section>

      <section
        id="category-applications"
        className="scroll-mt-28 bg-arc-midnight py-14 text-white sm:py-16"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
              Applications
            </p>
            <h2 className="mt-3 font-display text-3xl font-black">Industrial sourcing scenarios</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              These products support repeat purchasing, maintenance supply and overseas B2B
              distributor programs.
            </p>
          </div>
          <div className="grid gap-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {category.applications.map((application) => (
                <div key={application} className="border-l-4 border-arc-signal bg-white/5 p-5">
                  <p className="font-semibold leading-7 text-slate-100">{application}</p>
                </div>
              ))}
            </div>
            {relatedApplications.length > 0 ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-arc-signal">
                  Related Application Pages
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {relatedApplications.map((application) => (
                    <Link
                      key={application.slug}
                      href={`/applications/${application.slug}`}
                      className="border border-white/15 bg-white/5 p-4 transition hover:border-arc-signal hover:bg-white/10"
                    >
                      <h3 className="font-display text-lg font-black text-white">
                        {application.title}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-slate-300">
                        {application.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {category.buyerTool ? (
              <div className="border border-white/15 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-arc-signal">
                  Buyer RFQ Tool
                </p>
                <h3 className="mt-3 font-display text-xl font-black text-white">
                  {category.buyerTool.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {category.buyerTool.description}
                </p>
                <a
                  href={category.buyerTool.href}
                  download
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center bg-arc-signal px-5 text-center text-xs font-bold uppercase tracking-[0.12em] text-arc-midnight transition hover:bg-white sm:w-auto"
                >
                  {category.buyerTool.buttonLabel}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section id="category-faq" className="scroll-mt-28 bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
          <FaqSection items={category.faq} />
          <div className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Related Categories
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Buyers often compare related consumables, accessories and machine categories when
              preparing mixed RFQ lists.
            </p>
            <div className="mt-5 grid gap-3">
              {relatedCategories.map((relatedCategory) => (
                <Link
                  key={relatedCategory.slug}
                  href={`/products/${relatedCategory.slug}`}
                  className="border border-slate-100 p-4 transition hover:border-arc-blue hover:bg-arc-frost"
                >
                  <div
                    data-nosnippet
                    data-snippet-region="related-category-code"
                    className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue"
                  >
                    {relatedCategory.code}
                  </div>
                  <div className="mt-2 font-display text-xl font-black text-arc-midnight">
                    {relatedCategory.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {relatedCategory.description}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-slate-200 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                Related Buyer Guide
              </p>
              <Link href={buyerGuideLink.href} className="group mt-3 block">
                <h3 className="font-display text-xl font-black text-arc-midnight group-hover:text-arc-blue">
                  {buyerGuideLink.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {buyerGuideLink.description}
                </p>
                <span className="mt-4 inline-flex text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
                  Read Buyer Guide
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqCta title={`Need ${category.shortTitle}?`} />
        </div>
      </section>
    </>
  );
}
