import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { ProductGallery } from "@/components/content/ProductGallery";
import { AddToRfqButton } from "@/components/rfq/AddToRfqButton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { getProductFamilyLabel, getProductProcessLabel } from "@/lib/content/product-presentation";
import type { Product, ProductCategory, SpecRow } from "@/lib/content/schemas";
import { siteConfig } from "@/lib/content/site";
import type { RfqListItem } from "@/lib/rfq-list";

type ProductOverviewProps = {
  product: Product;
  category: ProductCategory;
  keySpecifications: SpecRow[];
  technicalDetailsToConfirm: string[];
  technicalDataStatus: string;
  compatibilityStatus: string;
  confirmationPrompt: string;
  rfqHref: string;
  rfqListItem: RfqListItem;
  productEmailHref: string;
  whatsappProductHref: string;
};

export function ProductOverview({
  product,
  category,
  keySpecifications,
  technicalDetailsToConfirm,
  technicalDataStatus,
  compatibilityStatus,
  confirmationPrompt,
  rfqHref,
  rfqListItem,
  productEmailHref,
  whatsappProductHref,
}: ProductOverviewProps) {
  const productIdentity = [getProductProcessLabel(product), getProductFamilyLabel(product)].filter(
    (value, index, values) => value && values.indexOf(value) === index,
  );

  return (
    <section className="bg-white py-8 sm:py-12 lg:py-16">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: category.title, href: `/products/${category.slug}` },
            { label: product.title },
          ]}
        />

        <div className="mt-7 grid gap-9 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-14">
          <ProductGallery product={product} />

          <div className="min-w-0">
            <p className="section-eyebrow">{category.title}</p>
            <h1 className="mt-3 break-words font-display text-4xl font-black leading-[1.1] text-arc-midnight sm:text-5xl">
              {product.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {product.shortDescription}
            </p>

            <dl className="mt-7 grid border-y border-arc-line sm:grid-cols-3 sm:divide-x sm:divide-arc-line">
              <div className="py-4 sm:pr-5">
                <dt className="text-sm font-semibold text-slate-500">Series / Family</dt>
                <dd className="mt-1 font-bold text-arc-midnight">{productIdentity.join(" / ")}</dd>
              </div>
              <div className="border-t border-arc-line py-4 sm:border-t-0 sm:px-5">
                <dt className="text-sm font-semibold text-slate-500">Model / SKU</dt>
                <dd className="mt-1 break-words font-bold text-arc-midnight">{product.sku}</dd>
              </div>
              <div className="border-t border-arc-line py-4 sm:border-t-0 sm:pl-5">
                <dt className="text-sm font-semibold text-slate-500">Supply</dt>
                <dd className="mt-1 font-bold text-arc-midnight">Distributor & OEM inquiry</dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href={rfqHref} className="w-full sm:w-auto">
                Request a Quote
              </ButtonLink>
              <AddToRfqButton item={rfqListItem} />
              <a
                href={whatsappProductHref}
                className="button-base button-secondary w-full sm:w-auto"
              >
                Contact Sales
              </a>
            </div>

            <div className="mt-5 text-sm leading-6 text-slate-600">
              <p>For model checks, send a drawing, sample or clear product photo.</p>
              <a
                href={productEmailHref}
                className="mt-1 inline-flex break-all font-bold text-arc-blue transition hover:text-arc-copper"
              >
                {siteConfig.email}
              </a>
            </div>

            <div className="mt-7">
              <h2 className="font-display text-xl font-black text-arc-midnight">
                Key specifications
              </h2>
              {keySpecifications.length > 0 ? (
                <dl className="mt-4 border-t border-arc-line">
                  {keySpecifications.map((row) => (
                    <div
                      key={row.label}
                      className="grid gap-1 border-b border-arc-line py-3 sm:grid-cols-[9rem_1fr] sm:gap-5"
                    >
                      <dt className="text-sm font-semibold text-slate-500">{row.label}</dt>
                      <dd className="break-words text-sm font-bold leading-6 text-arc-midnight">
                        {row.value}
                        {row.note ? (
                          <span className="ml-2 font-normal text-slate-500">{row.note}</span>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Exact technical values are reviewed against the requested model, drawing or sample
                  before quotation.
                </p>
              )}
            </div>

            {technicalDetailsToConfirm.length > 0 ? (
              <details className="mt-5 border-y border-arc-line py-4">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-sm font-bold text-arc-blue">
                  Technical details available upon request
                  <span aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{confirmationPrompt}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Fields to review: {technicalDetailsToConfirm.join(", ")}.
                </p>
              </details>
            ) : null}

            <dl className="mt-7 border-l-2 border-arc-midnight bg-arc-frost px-5 py-4 text-sm">
              <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-5">
                <dt className="font-semibold text-slate-500">Technical data</dt>
                <dd className="font-bold text-arc-midnight">{technicalDataStatus}</dd>
              </div>
              <div className="mt-3 grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-5">
                <dt className="font-semibold text-slate-500">Compatibility</dt>
                <dd className="font-bold text-arc-midnight">{compatibilityStatus}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
