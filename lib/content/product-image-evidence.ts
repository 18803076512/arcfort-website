import type { ProductImageAsset, ProductImageAssetRole } from "./schemas.ts";

export type ProductImageEvidenceState =
  "reviewed_exact_product" | "product_family_reference" | "buyer_reference";

function hasText(value?: string) {
  return Boolean(value?.trim());
}

function hasIsoReviewDate(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function isSearchEligibleProductImageAsset(asset: ProductImageAsset) {
  return (
    asset.publicationStatus === "search_eligible" &&
    asset.contentMatchStatus === "exact_product" &&
    asset.usageRightsStatus === "approved" &&
    asset.ownershipStatus !== "unknown" &&
    asset.sourceKind !== "unknown" &&
    hasText(asset.sourceReference) &&
    hasText(asset.sourceOwner) &&
    hasText(asset.sourceFile) &&
    hasText(asset.reviewedBy) &&
    hasIsoReviewDate(asset.reviewedDate)
  );
}

export function getProductImageEvidenceState(asset: ProductImageAsset): ProductImageEvidenceState {
  if (isSearchEligibleProductImageAsset(asset)) {
    return "reviewed_exact_product";
  }

  if (
    asset.publicationStatus === "legacy_reference" ||
    asset.contentMatchStatus === "product_family_reference"
  ) {
    return "product_family_reference";
  }

  return "buyer_reference";
}

function formatRole(role: ProductImageAssetRole) {
  return role.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getProductImageDisclosureLabel(
  evidenceState: ProductImageEvidenceState,
  role?: ProductImageAssetRole,
) {
  const compactLabels: Record<ProductImageEvidenceState, string> = {
    reviewed_exact_product: "Reviewed product image",
    product_family_reference: "Family reference image",
    buyer_reference: "Buyer reference image",
  };
  const detailedLabels: Record<ProductImageEvidenceState, string> = {
    reviewed_exact_product: "reviewed exact-product image",
    product_family_reference: "product-family reference image",
    buyer_reference: "buyer reference image",
  };

  return role
    ? `${formatRole(role)} ${detailedLabels[evidenceState]}`
    : compactLabels[evidenceState];
}
