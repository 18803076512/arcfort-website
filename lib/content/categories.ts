import { productCategories } from "@/content/categories";

export function getAllProductCategories() {
  return productCategories;
}

export function getProductCategoryBySlug(slug: string) {
  return productCategories.find((category) => category.slug === slug);
}

export function getRelatedCategories(slugs: string[]) {
  return productCategories.filter((category) => slugs.includes(category.slug));
}
