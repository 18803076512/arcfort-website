import type { Product } from "./schemas";

export const homepageFeaturedProductSlugs = [
  "mig-mag-welding-torch",
  "mig-swan-neck",
  "tig-ceramic-cup-5",
  "plasma-electrode",
  "plasma-nozzle",
  "electrode-holder",
  "ground-clamp",
  "wire-feeder",
] as const;

export function selectHomepageFeaturedProducts(products: readonly Product[]) {
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));

  return homepageFeaturedProductSlugs
    .map((slug) => productsBySlug.get(slug))
    .filter((product): product is Product => Boolean(product));
}
