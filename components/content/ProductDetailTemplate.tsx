import Link from "next/link";
import {
  type ApplicationPage,
  type Product,
  type ProductCategory,
  type ProductSeries,
} from "@/lib/content/schemas";
import { CompatibilityTable } from "@/components/content/CompatibilityTable";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductGrid } from "@/components/content/ProductGrid";
import { ProductOverview } from "@/components/content/ProductOverview";
import { ProductSeriesLinkBand } from "@/components/content/ProductSeriesLinkBand";
import { RfqCta } from "@/components/content/RfqCta";
import { SpecificationTable } from "@/components/content/SpecificationTable";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { displayConfirmedValue, isLowSignalSpecificationValue } from "@/lib/content/display";
import { getProductBuyingProfile } from "@/lib/content/product-buying-profiles";
import { getProductOverviewSpecificationRows } from "@/lib/content/product-presentation";
import { siteConfig } from "@/lib/content/site";
import { getBuyerGuideForProduct } from "@/lib/content/topic-links";

type RelatedProduct = {
  product: Product;
  category: ProductCategory;
};

type ProductDetailTemplateProps = {
  product: Product;
  category: ProductCategory;
  relatedProducts: RelatedProduct[];
  relatedApplications: ApplicationPage[];
  relatedSeries: ProductSeries[];
};

function isPublicDetailRow(row: { label: string; value: string }) {
  return row.label !== "Image Name" && !isLowSignalSpecificationValue(row.value);
}

function getTechnicalDataStatusLabel(product: Product) {
  if (product.dataStatus === "confirmed") return "Published fields confirmed";
  if (product.dataStatus === "pending") return "Final details reviewed before quotation";
  return "Published references reviewed before quotation";
}

function getCompatibilityStatusLabel(product: Product) {
  if (product.compatibilityStatus === "confirmed") {
    return "Compatibility confirmed for published references";
  }
  if (product.compatibilityStatus === "reference_only") {
    return "Reference only, confirm by model number";
  }
  return "Confirm by sample, drawing or model reference";
}

function getCategoryConfirmationPrompt(categorySlug: string, productSlug?: string) {
  if (productSlug === "robot-welding-torch") {
    return "Send the robot or welding-cell reference, installed torch label, photos of both connection ends, approved interface or neck drawing, cooling and cable-package references, and the current contact tip, holder or diffuser and nozzle stack in assembly order.";
  }
  if (categorySlug === "plasma-cutting-consumables") {
    return "Send the torch model, existing references and a photo of the electrode, nozzle, ring, cap and shield in assembly order. Include a documented cutting-current reference only when available.";
  }
  if (categorySlug === "tig-torch-parts") {
    return "Send the complete torch and label photo, torch series, tungsten diameter, cup number and the cup, collet, body or gas lens kept in assembly order.";
  }
  if (categorySlug === "mig-mag-torch-parts") {
    return "Send the torch model, wire size, thread or connection, overall length and a clear photo or sample of the current contact tip, holder, nozzle or liner.";
  }
  return "Send the model, drawing, reference part, dimensions and approved technical requirements available for this item.";
}

export function ProductDetailTemplate({
  product,
  category,
  relatedProducts,
  relatedApplications,
  relatedSeries,
}: ProductDetailTemplateProps) {
  const buyerGuideLink = getBuyerGuideForProduct(product.slug, category.slug);
  const buyingProfile = getProductBuyingProfile(product.slug);
  const productRfqPrompt = [
    `Product: ${product.title}`,
    `SKU: ${product.sku}`,
    `Category: ${category.title}`,
    ...(buyingProfile?.rfqFields ?? [
      "Required model / size / material:",
      "Drawing, sample photo or reference part:",
      "Quantity, packaging and destination country:",
    ]),
  ].join("\n");
  const rfqHref = `/rfq?product=${encodeURIComponent(productRfqPrompt)}`;
  const rfqListItem = {
    sku: product.sku,
    name: product.title,
    category: category.title,
    categorySlug: category.slug,
    slug: product.slug,
  };
  const productEmailSubject = encodeURIComponent(
    `ArcFort Weld RFQ - ${product.title} - ${product.sku}`,
  );
  const productEmailBody = encodeURIComponent(
    [
      `Product: ${product.title}`,
      `SKU: ${product.sku}`,
      `Category: ${category.title}`,
      "",
      ...(buyingProfile?.rfqFields ?? [
        "Quantity:",
        "Destination country:",
        "Required model / size / material:",
        "Packaging or OEM request:",
        "Drawing, sample photo or reference part:",
      ]),
      "",
      "Please confirm quotation, MOQ and lead time.",
    ].join("\n"),
  );
  const productEmailHref = `${siteConfig.emailHref}?subject=${productEmailSubject}&body=${productEmailBody}`;
  const whatsappProductHref = `${siteConfig.whatsappHref}?text=${encodeURIComponent(
    [
      "Hello ArcFort Weld, I would like to request a quotation.",
      `Product: ${product.title}`,
      `SKU: ${product.sku}`,
      `Category: ${category.title}`,
      ...(buyingProfile?.rfqFields.slice(0, 4) ?? [
        "Quantity:",
        "Destination country:",
        "Packaging or OEM request:",
      ]),
    ].join("\n"),
  )}`;
  const publicSpecifications = product.specifications.filter(isPublicDetailRow);
  const publicCompatibility = product.compatibility.filter(isPublicDetailRow);
  const overviewSpecifications = getProductOverviewSpecificationRows(product);
  const technicalDetailsToConfirm = Array.from(new Set(product.missingFields));
  const confirmationPrompt = getCategoryConfirmationPrompt(category.slug, product.slug);
  const productPageSections = [
    { href: "#product-specifications", label: "Specifications" },
    ...(buyingProfile ? [{ href: "#product-selection", label: "Selection" }] : []),
    { href: "#product-description", label: "Overview & Delivery" },
    { href: "#product-applications", label: "Applications" },
    { href: "#product-faq", label: "FAQ & RFQ" },
    ...(relatedProducts.length > 0 ? [{ href: "#related-products", label: "Related" }] : []),
  ];

  return (
    <>
      <ProductOverview
        product={product}
        category={category}
        keySpecifications={overviewSpecifications}
        technicalDetailsToConfirm={technicalDetailsToConfirm}
        technicalDataStatus={getTechnicalDataStatusLabel(product)}
        compatibilityStatus={getCompatibilityStatusLabel(product)}
        confirmationPrompt={confirmationPrompt}
        rfqHref={rfqHref}
        rfqListItem={rfqListItem}
        productEmailHref={productEmailHref}
        whatsappProductHref={whatsappProductHref}
      />

      <ProductSeriesLinkBand series={relatedSeries} />

      <nav
        aria-label={`${product.title} page sections`}
        className="sticky top-[var(--header-height)] z-20 border-b border-arc-line bg-white/95 backdrop-blur"
      >
        <Container>
          <ol className="flex min-h-14 items-center gap-6 overflow-x-auto">
            {productPageSections.map((section) => (
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

      <Section id="product-specifications" className="bg-arc-frost">
        <Container>
          <div className="grid items-start gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <SpecificationTable rows={publicSpecifications} />
            <CompatibilityTable rows={publicCompatibility} />
          </div>
        </Container>
      </Section>

      {buyingProfile ? (
        <Section id="product-selection" labelledBy="product-selection-title" className="bg-white">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
              <div>
                <SectionHeading
                  id="product-selection-title"
                  eyebrow={buyingProfile.eyebrow}
                  title={buyingProfile.title}
                  description={buyingProfile.description}
                />
                <dl className="mt-8 border-t-2 border-arc-midnight">
                  {buyingProfile.selectionVariables.map((variable, index) => (
                    <div
                      key={variable.label}
                      className="grid gap-3 border-b border-arc-line py-5 sm:grid-cols-[3rem_12rem_1fr]"
                    >
                      <span className="font-display text-xl font-black text-arc-blue">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <dt className="font-display text-lg font-black text-arc-midnight">
                        {variable.label}
                      </dt>
                      <dd>
                        <p className="text-sm leading-6 text-slate-600">{variable.whyItMatters}</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-arc-blue">
                          Confirm with: {variable.confirmationMethod}
                        </p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <aside className="self-start bg-arc-midnight p-6 text-white sm:p-8 lg:sticky lg:top-28">
                <p className="section-eyebrow !text-slate-300">Configuration Evidence</p>
                <h3 className="mt-3 font-display text-2xl font-black leading-tight">
                  Prepare these details before RFQ.
                </h3>
                <ol className="mt-5 border-t border-white/15">
                  {buyingProfile.confirmationChecklist.map((item, index) => (
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
                {buyingProfile.buyerTool ? (
                  <div className="mt-7 border-t border-white/15 pt-6">
                    <h4 className="font-display text-lg font-black">
                      {buyingProfile.buyerTool.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {buyingProfile.buyerTool.description}
                    </p>
                    <div className="mt-5 flex flex-col gap-3">
                      <a
                        href={buyingProfile.buyerTool.href}
                        download
                        className="button-base button-primary w-full"
                      >
                        {buyingProfile.buyerTool.buttonLabel}
                      </a>
                      <ButtonLink href={rfqHref} variant="onDark" className="w-full">
                        Start Product RFQ
                      </ButtonLink>
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>
          </Container>
        </Section>
      ) : null}

      <section className="border-y border-arc-line bg-white">
        <Container className="grid gap-6 py-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="section-eyebrow">Product Buyer Guide</p>
            <h2 className="mt-3 font-display text-2xl font-black text-arc-midnight">
              Confirm fit details before ordering.
            </h2>
          </div>
          <Link
            href={buyerGuideLink.href}
            className="group border-l-4 border-arc-signal bg-arc-frost p-5 transition hover:bg-slate-100"
          >
            <h3 className="font-display text-xl font-black text-arc-midnight group-hover:text-arc-blue">
              {buyerGuideLink.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{buyerGuideLink.description}</p>
          </Link>
        </Container>
      </section>

      <Section id="product-description" labelledBy="product-description-title" className="bg-white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <article>
              <h2
                id="product-description-title"
                className="font-display text-3xl font-black text-arc-midnight"
              >
                Product overview
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-600">{product.description}</p>
              <h3 className="mt-8 border-t border-arc-line pt-6 font-display text-xl font-black text-arc-midnight">
                Product features
              </h3>
              <ul className="mt-4 grid gap-3">
                {product.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-arc-signal" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <h2 className="font-display text-3xl font-black text-arc-midnight">
                Packaging & delivery
              </h2>
              <dl className="mt-5 border-t-2 border-arc-midnight">
                {[
                  { label: "Package", value: product.packaging },
                  { label: "MOQ", value: product.moq },
                  { label: "Lead time", value: product.leadTime },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="grid gap-2 border-b border-arc-line py-4 sm:grid-cols-[9rem_1fr]"
                  >
                    <dt className="technical-data font-bold text-arc-midnight">{item.label}</dt>
                    <dd className="technical-data text-slate-700">
                      {displayConfirmedValue(item.value)}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 border-l-4 border-arc-signal bg-arc-frost p-5">
                <h3 className="font-display text-xl font-black text-arc-midnight">
                  OEM / ODM support
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Logo printing, private-label packaging, carton design and model customization are
                  reviewed after the product, quantity and artwork requirements are confirmed.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {product.catalogUrl ? (
                  <a
                    href={product.catalogUrl}
                    download
                    className="button-base button-secondary w-full sm:w-auto"
                  >
                    Download Catalog
                  </a>
                ) : (
                  <ButtonLink href="/downloads" variant="secondary" className="w-full sm:w-auto">
                    Request Datasheet
                  </ButtonLink>
                )}
                <ButtonLink href={rfqHref} className="w-full sm:w-auto">
                  Send Product RFQ
                </ButtonLink>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-500">
                Review confirmed commercial terms on the{" "}
                <Link
                  href="/shipping-payment"
                  className="font-bold text-arc-blue hover:text-arc-copper"
                >
                  Shipping & Payment
                </Link>{" "}
                page.
              </p>
            </article>
          </div>
        </Container>
      </Section>

      <Section
        id="product-applications"
        labelledBy="product-applications-title"
        className="bg-arc-frost"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr]">
            <SectionHeading
              id="product-applications-title"
              eyebrow="Applications"
              title="Common industrial use."
              description="Confirm the requested product against the installed torch, machine or operating requirement before purchase."
            />
            <div>
              <div className="grid border-t-2 border-arc-midnight sm:grid-cols-2">
                {product.applications.map((application) => (
                  <p
                    key={application}
                    className="border-b border-arc-line py-4 text-sm font-semibold leading-6 text-slate-700 sm:odd:pr-5 sm:even:border-l sm:even:border-arc-line sm:even:pl-5"
                  >
                    {application}
                  </p>
                ))}
              </div>
              {relatedApplications.length > 0 ? (
                <div className="mt-7">
                  <p className="caption">Related application pages</p>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                    {relatedApplications.map((application) => (
                      <Link
                        key={application.slug}
                        href={`/applications/${application.slug}`}
                        className="text-sm font-bold text-arc-blue hover:text-arc-copper"
                      >
                        {application.title} <span aria-hidden="true">&rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      <Section id="product-faq" className="bg-white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <FaqSection items={product.faq} title="Product FAQ" />
            <RfqCta
              title={`Request quotation for ${product.title}`}
              description={
                buyingProfile
                  ? "Send the system references and buyer requirements listed above. ArcFort Weld will review the proposed configuration, included equipment, MOQ and delivery options before quotation."
                  : undefined
              }
              productName={product.title}
              rfqPrompt={productRfqPrompt}
            />
          </div>
        </Container>
      </Section>

      {relatedProducts.length > 0 ? (
        <Section id="related-products" labelledBy="related-products-title" className="bg-arc-frost">
          <Container>
            <SectionHeading
              id="related-products-title"
              eyebrow="Related Products"
              title="Products buyers also compare."
            />
            <ProductGrid items={relatedProducts} className="mt-8" />
          </Container>
        </Section>
      ) : null}
    </>
  );
}
