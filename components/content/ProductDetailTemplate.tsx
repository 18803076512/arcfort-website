import Link from "next/link";
import { type Product, type ProductCategory } from "@/lib/content/schemas";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { CompatibilityTable } from "@/components/content/CompatibilityTable";
import { FaqSection } from "@/components/content/FaqSection";
import { ProductCard } from "@/components/content/ProductCard";
import { ProductVisual } from "@/components/content/ProductVisual";
import { RfqCta } from "@/components/content/RfqCta";
import { SpecificationTable } from "@/components/content/SpecificationTable";
import { displayConfirmedValue, isLowSignalSpecificationValue } from "@/lib/content/display";
import { siteConfig } from "@/lib/content/site";

type RelatedProduct = {
  product: Product;
  category: ProductCategory;
};

type ProductDetailTemplateProps = {
  product: Product;
  category: ProductCategory;
  relatedProducts: RelatedProduct[];
};

function isPublicDetailRow(row: { label: string; value: string }) {
  return row.label !== "Image Name" && !isLowSignalSpecificationValue(row.value);
}

const confirmationWorkflow = [
  {
    step: "01",
    title: "Check product reference",
    description:
      "Send the current part photo, drawing, sample or item list so the requested consumable can be reviewed.",
  },
  {
    step: "02",
    title: "Confirm technical fields",
    description:
      "Material, size, thread, compatible model and package details are confirmed before quotation.",
  },
  {
    step: "03",
    title: "Review trade details",
    description:
      "Quantity, MOQ, lead time, destination country and OEM packaging request are checked together.",
  },
  {
    step: "04",
    title: "Receive quotation",
    description:
      "ArcFort Weld responds with quotation details after the product and buyer requirements are clear.",
  },
] as const;

export function ProductDetailTemplate({
  product,
  category,
  relatedProducts,
}: ProductDetailTemplateProps) {
  const rfqHref = `/rfq?product=${encodeURIComponent(product.title)}`;
  const whatsappProductHref = `${siteConfig.whatsappHref}?text=${encodeURIComponent(
    `Hello ArcFort Weld, I would like to request a quotation for ${product.title} (${product.sku}).`,
  )}`;
  const publicSpecifications = product.specifications.filter(isPublicDetailRow);
  const publicCompatibility = product.compatibility.filter(isPublicDetailRow);
  const technicalDetailsToConfirm = Array.from(new Set(product.missingFields));
  const productFamily =
    product.kind === "welding-consumable" ? product.consumableFamily : product.equipmentFamily;
  const processLabel =
    product.kind === "welding-consumable"
      ? product.process
      : product.supportedProcesses.join(", ");
  const productSummary = [
    { label: "Product Family", value: productFamily },
    { label: "Process", value: processLabel },
    { label: "Supply Type", value: "B2B RFQ review" },
  ] as const;
  const productInquiryChecklist = [
    `Product: ${product.title}`,
    `SKU: ${displayConfirmedValue(product.sku, "Confirm with product details")}`,
    `Category: ${category.title}`,
    "Send quantity, destination country, drawing or reference part for quotation.",
  ];
  const tradeDetails = [
    { label: "Main Port", value: siteConfig.mainPort },
    { label: "Payment", value: siteConfig.paymentTerms },
    { label: "MOQ Policy", value: siteConfig.moqPolicy },
    { label: "Regular Lead Time", value: siteConfig.leadTime },
  ];

  return (
    <>
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: category.title, href: `/products/${category.slug}` },
              { label: product.title },
            ]}
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <ProductVisual
              label={product.imageLabel}
              title={product.title}
              category={category.code}
              mainImage={product.mainImage}
            />

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
                {category.title}
              </p>
              <h1 className="mt-3 font-display text-4xl font-black leading-tight text-arc-midnight sm:text-5xl">
                {product.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{product.shortDescription}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {productSummary.map((item) => (
                  <div key={item.label} className="border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      {item.label}
                    </div>
                    <div className="mt-1 text-sm font-black text-arc-midnight">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 border border-slate-200 bg-arc-frost p-5 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    SKU
                  </div>
                  <div className="mt-1 font-semibold text-arc-midnight">
                    {displayConfirmedValue(product.sku, "Confirm with product details")}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Category
                  </div>
                  <div className="mt-1 font-semibold text-arc-midnight">{category.title}</div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={rfqHref}
                  className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
                >
                  Request Quote
                </Link>
                <Link
                  href={rfqHref}
                  className="inline-flex items-center justify-center border border-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
                >
                  Add to RFQ
                </Link>
                <Link
                  href={whatsappProductHref}
                  className="inline-flex items-center justify-center border border-slate-300 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:border-arc-midnight hover:bg-arc-midnight hover:text-white"
                >
                  WhatsApp
                </Link>
              </div>

              <div className="mt-6 border border-slate-200 bg-arc-frost p-5">
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                  RFQ details for this product
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {productInquiryChecklist.map((item) => (
                    <div key={item} className="border-l-4 border-arc-signal bg-white p-3">
                      <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {technicalDetailsToConfirm.length > 0 ? (
                <div className="mt-6 border-l-4 border-arc-signal bg-white p-4 shadow-sm">
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                    Technical details available upon request
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    These items can be checked by drawing, reference part, product list or model
                    reference before quotation.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {technicalDetailsToConfirm.map((field) => (
                      <span
                        key={field}
                        className="border border-slate-200 bg-arc-frost px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-midnight py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-signal">
                Buyer Confirmation Workflow
              </p>
              <h2 className="mt-3 font-display text-3xl font-black">
                Confirm the product before price discussion.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Welding torch consumables and cutting parts may look similar but differ by thread,
                size, material, model or packaging. This workflow keeps quotation communication
                clear for distributors and OEM buyers.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {confirmationWorkflow.map((item) => (
                <article key={item.step} className="border border-white/10 bg-white/5 p-5">
                  <div className="font-display text-3xl font-black text-arc-signal">
                    {item.step}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <SpecificationTable rows={publicSpecifications} />
          <CompatibilityTable rows={publicCompatibility} />
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Product Description
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
            <h3 className="mt-6 font-display text-xl font-black text-arc-midnight">
              Product Features
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

          <article className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-2xl font-black text-arc-midnight">
              Packaging & Delivery
            </h2>
            <div className="mt-5 grid gap-3">
              <div className="border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Package
                </div>
                <div className="mt-1 text-sm font-semibold text-arc-midnight">
                  {displayConfirmedValue(product.packaging)}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    MOQ
                  </div>
                  <div className="mt-1 text-sm font-semibold text-arc-midnight">
                    {displayConfirmedValue(product.moq)}
                  </div>
                </div>
                <div className="border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Lead Time
                  </div>
                  <div className="mt-1 text-sm font-semibold text-arc-midnight">
                    {displayConfirmedValue(product.leadTime)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 border-l-4 border-arc-signal bg-arc-frost p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
                OEM Service Note
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Logo printing, private label packaging, carton design and product model
                customization are available after product details, quantity and artwork
                requirements are confirmed.
              </p>
            </div>

            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
              {tradeDetails.map((item) => (
                <div key={item.label} className="border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </div>
                  <p className="mt-1 text-sm font-semibold leading-6 text-arc-midnight">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/downloads"
                className="inline-flex items-center justify-center border border-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:bg-arc-blue hover:text-white"
              >
                Request Datasheet
              </Link>
              <Link
                href={rfqHref}
                className="inline-flex items-center justify-center bg-arc-blue px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-arc-midnight"
              >
                Send Product RFQ
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-arc-frost py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Applications
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Common industrial use
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.applications.map((application) => (
              <div key={application} className="border-l-4 border-arc-signal bg-white p-5 shadow-sm">
                <p className="font-semibold text-slate-800">{application}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <FaqSection items={product.faq} title="Product FAQ" />
          <RfqCta title={`Request quotation for ${product.title}`} productName={product.title} />
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="bg-arc-frost py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-arc-blue">
              Related Products
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-arc-midnight">
              Products buyers also compare
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.product.slug}
                  product={relatedProduct.product}
                  category={relatedProduct.category}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
