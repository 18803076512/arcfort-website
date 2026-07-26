import { existsSync } from "node:fs";
import path from "node:path";

export function hasPublicProductImage(imagePath?: string) {
  if (!imagePath?.startsWith("/images/products/")) {
    return false;
  }

  const relativePath = imagePath.replace(/^\/+/, "");

  return existsSync(path.join(process.cwd(), "public", relativePath));
}

type ProductImageSource = {
  mainImage: string;
  galleryImages: string[];
  imageStatus?: "own_photo" | "supplier_photo" | "placeholder" | "needs_photo";
};

export function getSearchEligibleProductImages(product: ProductImageSource) {
  if (product.imageStatus !== "own_photo" && product.imageStatus !== "supplier_photo") {
    return [];
  }

  return Array.from(
    new Set(
      [product.mainImage, ...product.galleryImages].filter((imagePath) =>
        hasPublicProductImage(imagePath),
      ),
    ),
  );
}
