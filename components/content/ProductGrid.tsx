import { ProductCard } from "@/components/content/ProductCard";
import type { Product, ProductCategory } from "@/lib/content/schemas";

export type ProductGridItem = {
  product: Product;
  category: ProductCategory;
};

type ProductGridProps = {
  items: ProductGridItem[];
  variant?: "catalog" | "featured";
  className?: string;
};

const gridClasses = {
  catalog: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
  featured: "grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
} as const;

export function ProductGrid({ items, variant = "catalog", className = "" }: ProductGridProps) {
  return (
    <div className={`${gridClasses[variant]} ${className}`}>
      {items.map(({ product, category }) => (
        <ProductCard
          key={`${category.slug}-${product.slug}`}
          product={product}
          category={category}
          denseMobile={variant === "featured"}
        />
      ))}
    </div>
  );
}
