import Link from "next/link";
import type { Product, ProductCategory } from "@/lib/content/schemas";
import { ProductVisual } from "@/components/content/ProductVisual";

type ProductCardProps = {
  product: Product;
  category: ProductCategory;
};

export function ProductCard({ product, category }: ProductCardProps) {
  return (
    <Link
      href={`/products/${category.slug}/${product.slug}`}
      className="group flex h-full flex-col border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-arc-blue hover:shadow-industrial"
    >
      <ProductVisual
        label={product.imageLabel}
        title={product.title}
        category={category.code}
        mainImage={product.mainImage}
        compact
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-arc-blue">
          {category.shortTitle}
        </div>
        <h3 className="mt-3 font-display text-xl font-black leading-tight text-arc-midnight">
          {product.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{product.shortDescription}</p>
        <span className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-arc-blue group-hover:text-arc-copper">
          View Product
        </span>
      </div>
    </Link>
  );
}
