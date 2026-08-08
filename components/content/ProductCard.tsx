import Link from "next/link";
import { AddToRfqButton } from "@/components/rfq/AddToRfqButton";
import type { Product, ProductCategory } from "@/lib/content/schemas";
import { ProductVisual } from "@/components/content/ProductVisual";

type ProductCardProps = {
  product: Product;
  category: ProductCategory;
  denseMobile?: boolean;
};

export function ProductCard({ product, category, denseMobile = false }: ProductCardProps) {
  const href = `/products/${category.slug}/${product.slug}`;

  return (
    <article className="group flex h-full min-w-0 flex-col border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial">
      <Link href={href} aria-label={`View ${product.title}`}>
        <ProductVisual
          label={product.imageLabel}
          title={product.title}
          category={category.code}
          mainImage={product.mainImage}
          imageStatus={product.imageStatus}
          compact
          denseMobile={denseMobile}
        />
      </Link>
      <div className={`flex flex-1 flex-col ${denseMobile ? "p-3 sm:p-5" : "p-5"}`}>
        <div className="flex items-start justify-between gap-3">
          <div
            className={`min-w-0 truncate font-bold uppercase text-arc-blue ${
              denseMobile
                ? "text-[10px] tracking-[0.08em] sm:text-xs sm:tracking-[0.16em]"
                : "text-xs tracking-[0.16em]"
            }`}
          >
            {category.shortTitle}
          </div>
          <div
            className={`shrink-0 whitespace-nowrap text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 ${
              denseMobile ? "hidden sm:block" : ""
            }`}
          >
            {product.sku}
          </div>
        </div>
        <h3
          className={`mt-3 break-words font-display font-black leading-tight text-arc-midnight ${
            denseMobile ? "min-h-[3.75rem] text-base sm:min-h-0 sm:text-xl" : "text-xl"
          }`}
        >
          <Link href={href} className="transition hover:text-arc-blue">
            {product.title}
          </Link>
        </h3>
        <p
          className={`mt-3 flex-1 text-sm leading-6 text-slate-600 ${
            denseMobile ? "hidden sm:block" : ""
          }`}
        >
          {product.shortDescription}
        </p>
        <div
          data-nosnippet
          data-snippet-region="product-card-actions"
          className={`border-t border-slate-100 pt-4 ${
            denseMobile
              ? "mt-4 grid gap-2 sm:mt-5 sm:flex sm:items-center sm:justify-between sm:gap-3"
              : "mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          }`}
        >
          <Link
            href={href}
            className={`inline-flex min-h-10 items-center font-bold uppercase text-arc-blue transition hover:text-arc-copper ${
              denseMobile
                ? "justify-center text-[11px] tracking-[0.08em] sm:justify-start sm:text-sm sm:tracking-[0.14em]"
                : "text-sm tracking-[0.14em]"
            }`}
          >
            <span className={denseMobile ? "sm:hidden" : "hidden"}>Details</span>
            <span className={denseMobile ? "hidden sm:inline" : "inline"}>View Details</span>
          </Link>
          <AddToRfqButton
            variant="compact"
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
    </article>
  );
}
