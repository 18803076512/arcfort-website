import { productCategories as categoryContent } from "@/content/categories";

export const productCategories = categoryContent.map((category) => ({
  code: category.code,
  name: category.title,
  slug: category.slug,
  description: category.description,
  items: category.features,
}));
