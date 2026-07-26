import { getSearchEligibleProductImages } from "@/lib/content/product-images";
import type { Product } from "@/lib/content/schemas";

export function getPreferredSeoImage(products: readonly Product[]) {
  for (const product of products) {
    const [image] = getSearchEligibleProductImages(product);

    if (image) {
      return image;
    }
  }

  return undefined;
}
