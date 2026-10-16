import Link from "next/link";
import { ProductVisual } from "@/components/content/ProductVisual";
import { AddToRfqButton } from "@/components/rfq/AddToRfqButton";
import {
  getProductCardSpecificationRows,
  getProductFamilyLabel,
  getProductProcessLabel,
} from "@/lib/content/product-presentation";
import type { Product, ProductCategory } from "@/lib/content/schemas";

type ProductCardProps = {
  product: Product;
  category: ProductCategory;
  denseMobile?: boolean;
};

export function ProductCard({ product, category, denseMobile = false }: ProductCardProps) {
  const href = `/products/${category.slug}/${product.slug}`;
  const [selectionCue] = getProductCardSpecificationRows(product);
  const productContext = [getProductProcessLabel(product), getProductFamilyLabel(product)]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(" / ");

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-arc-line bg-white transition hover:border-slate-300 hover:shadow-industrial">
      <Link href={href} aria-label={`View ${product.title}`} className="block">
        <ProductVisual
          sku={product.sku}
          slug={product.slug}
          label={product.imageLabel}
          mainImage={product.mainImage}
          imageStatus={product.imageStatus}
          compact
          denseMobile={denseMobile}
        />
      </Link>

      <div className={`flex flex-1 flex-col ${denseMobile ? "p-3 sm:p-5" : "p-5"}`}>
        <p className="truncate text-xs font-bold text-arc-blue">{productContext}</p>
        <h3
          className={`mt-2 break-words font-display font-black leading-tight text-arc-midnight ${
            denseMobile ? "min-h-12 text-base sm:text-xl" : "min-h-14 text-xl"
          }`}
        >
          <Link href={href} className="transition hover:text-arc-blue">
            {product.title}
          </Link>
        </h3>

        <dl
          className={`mt-3 border-t border-arc-line pt-3 ${denseMobile ? "hidden sm:block" : ""}`}
        >
          <div className="flex min-w-0 items-center justify-between gap-3 text-xs">
            <dt className="shrink-0 font-semibold text-slate-500">SKU</dt>
            <dd className="truncate font-bold text-arc-midnight">{product.sku}</dd>
          </div>
          {selectionCue ? (
            <div className="mt-2 flex min-w-0 items-center justify-between gap-3 text-xs">
              <dt className="shrink-0 font-semibold text-slate-500">{selectionCue.label}</dt>
              <dd className="truncate font-bold text-arc-midnight">{selectionCue.value}</dd>
            </div>
          ) : null}
        </dl>

        <div
          data-nosnippet
          data-snippet-region="product-card-actions"
          className="mt-auto flex min-h-12 items-end justify-between gap-3 border-t border-arc-line pt-3"
        >
          <Link
            href={href}
            className="inline-flex min-h-11 items-center text-sm font-bold text-arc-blue transition hover:text-arc-copper"
          >
            <span className={denseMobile ? "sm:hidden" : "hidden"}>View</span>
            <span className={denseMobile ? "hidden sm:inline" : "inline"}>View Product</span>
            <span className="ml-2" aria-hidden="true">
              &rarr;
            </span>
          </Link>
          <div className="transition lg:pointer-events-none lg:opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:opacity-100">
            <AddToRfqButton
              variant="card"
              item={{
                sku: product.sku,
                name: product.title,
                category: category.title,
                categorySlug: category.slug,
                slug: product.slug,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
