import type { ProductImportRow } from "./product-import-utils.ts";
import type { ProductImageAssetCsvRow } from "./product-image-asset-utils.ts";

export type ProductMainImageSubject = Pick<ProductImportRow, "sku" | "main_image">;

export type ProductMainImageEvidenceGap =
  | "registry_record"
  | "image_file"
  | "known_source"
  | "source_file"
  | "source_owner"
  | "approved_usage_rights"
  | "exact_product_match"
  | "reviewer"
  | "review_date"
  | "search_eligible";

export type ProductMainImageEvidence = {
  asset?: ProductImageAssetCsvRow;
  fileExists: boolean;
  hasRegisteredPublicMainImage: boolean;
  hasSearchEligibleExactMainImage: boolean;
  gaps: ProductMainImageEvidenceGap[];
};

export const productMainImageEvidenceGapLabels: Record<ProductMainImageEvidenceGap, string> = {
  registry_record: "canonical registry record",
  image_file: "image file",
  known_source: "known source",
  source_file: "original source file",
  source_owner: "source owner",
  approved_usage_rights: "approved website-use rights",
  exact_product_match: "exact-product match",
  reviewer: "reviewer",
  review_date: "review date",
  search_eligible: "search-eligible publication state",
};

export function assessProductMainImageEvidence(
  product: ProductMainImageSubject,
  assets: ProductImageAssetCsvRow[],
  imageFileExists: (publicPath: string) => boolean,
): ProductMainImageEvidence {
  const asset = assets.find(
    (candidate) =>
      candidate.sku === product.sku &&
      candidate.role === "main" &&
      candidate.public_path === product.main_image,
  );
  const fileExists = imageFileExists(product.main_image);
  const gaps: ProductMainImageEvidenceGap[] = [];

  if (!asset) {
    gaps.push("registry_record");
  }

  if (!fileExists) {
    gaps.push("image_file");
  }

  if (asset) {
    if (asset.source_kind === "unknown" || asset.ownership_status === "unknown") {
      gaps.push("known_source");
    }
    if (!asset.source_file) {
      gaps.push("source_file");
    }
    if (!asset.source_owner) {
      gaps.push("source_owner");
    }
    if (asset.usage_rights_status !== "approved") {
      gaps.push("approved_usage_rights");
    }
    if (asset.content_match_status !== "exact_product") {
      gaps.push("exact_product_match");
    }
    if (!asset.reviewed_by) {
      gaps.push("reviewer");
    }
    if (!asset.reviewed_date) {
      gaps.push("review_date");
    }
    if (asset.publication_status !== "search_eligible") {
      gaps.push("search_eligible");
    }
  }

  const hasRegisteredPublicMainImage = Boolean(
    asset &&
    fileExists &&
    (asset.publication_status === "search_eligible" ||
      asset.publication_status === "legacy_reference"),
  );

  return {
    asset,
    fileExists,
    hasRegisteredPublicMainImage,
    hasSearchEligibleExactMainImage: Boolean(asset && fileExists && gaps.length === 0),
    gaps,
  };
}
