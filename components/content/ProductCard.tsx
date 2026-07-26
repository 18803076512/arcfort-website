import Link from "next/link";
import { AddToRfqButton } from "@/components/rfq/AddToRfqButton";
import type { Product, ProductCategory } from "@/lib/content/schemas";
import { ProductVisual } from "@/components/content/ProductVisual";

type ProductCardProps = {
  product: Product;
  category: ProductCategory;
};

export function ProductCard({ product, category }: ProductCardProps) {
  const href = `/products/${category.slug}/${product.slug}`;

  return (
    <article className="group flex h-full flex-col border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial">
      <Link href={href} aria-label={`View ${product.title}`}>
        <ProductVisual
          label={product.imageLabel}
          title={product.title}
          category={category.code}
          mainImage={product.mainImage}
          compact
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
            {category.shortTitle}
          </div>
          <div className="shrink-0 whitespace-nowrap text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {product.sku}
          </div>
        </div>
        <h3 className="mt-3 font-display text-xl font-black leading-tight text-arc-midnight">
          <Link href={href} className="transition hover:text-arc-blue">
            {product.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{product.shortDescription}</p>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={href}
            className="text-sm font-bold uppercase tracking-[0.14em] text-arc-blue transition hover:text-arc-copper"
          >
            View Details
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
