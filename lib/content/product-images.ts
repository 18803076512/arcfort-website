import { existsSync } from "node:fs";
import path from "node:path";
import { productImageAssets } from "@/lib/data/product-image-assets";
import type { ProductImageAsset } from "@/lib/content/schemas";

export function hasPublicProductImage(imagePath?: string) {
  if (!imagePath?.startsWith("/images/products/")) {
    return false;
  }

  const relativePath = imagePath.replace(/^\/+/, "");

  return existsSync(path.join(process.cwd(), "public", relativePath));
}

type ProductImageSource = {
  sku: string;
  slug: string;
  mainImage: string;
  galleryImages: string[];
  imageStatus?: "own_photo" | "supplier_photo" | "placeholder" | "needs_photo";
};

function getProductImageAssets(product: ProductImageSource) {
  if (product.imageStatus !== "own_photo" && product.imageStatus !== "supplier_photo") {
    return [];
  }

  const assignedPaths = new Set([product.mainImage, ...product.galleryImages]);

  return productImageAssets.filter(
    (asset) =>
      asset.sku === product.sku &&
      asset.productSlug === product.slug &&
      assignedPaths.has(asset.publicPath) &&
      hasPublicProductImage(asset.publicPath),
  );
}

export function getDisplayEligibleProductImageAssets(product: ProductImageSource) {
  return getProductImageAssets(product).filter((asset) =>
    ["search_eligible", "legacy_reference", "display_only"].includes(asset.publicationStatus),
  );
}

export function getDisplayEligibleProductImages(product: ProductImageSource) {
  return getDisplayEligibleProductImageAssets(product).map((asset) => asset.publicPath);
}

export function getSearchEligibleProductImages(product: ProductImageSource) {
  return getProductImageAssets(product)
    .filter((asset) => ["search_eligible", "legacy_reference"].includes(asset.publicationStatus))
    .map((asset) => asset.publicPath);
}

export function getProductImageAltText(
  product: ProductImageSource,
  imagePath: string,
  fallback: string,
) {
  return (
    getProductImageAssets(product).find((asset) => asset.publicPath === imagePath)?.altText ??
    fallback
  );
}

export function getProductImageAsset(
  product: ProductImageSource,
  imagePath: string,
): ProductImageAsset | undefined {
  return getProductImageAssets(product).find((asset) => asset.publicPath === imagePath);
}
