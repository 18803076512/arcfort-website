import type { ArcfortProductData } from "../data/products.ts";
import type { ProductSeriesEvidence } from "../data/product-series-evidence.ts";
import type { CompatibilityRelationship, ProductImageAsset, ProductSeries } from "./schemas.ts";

type ProductSeriesPublicationInputs = {
  series: ProductSeries;
  evidence: ProductSeriesEvidence;
  products: ArcfortProductData[];
  imageAssets: ProductImageAsset[];
  relationships: CompatibilityRelationship[];
};

function hasApprovedExactMainImage(productSlug: string, imageAssets: ProductImageAsset[]) {
  return imageAssets.some(
    (asset) =>
      asset.productSlug === productSlug &&
      asset.role === "main" &&
      asset.publicationStatus === "search_eligible" &&
      asset.contentMatchStatus === "exact_product" &&
      asset.usageRightsStatus === "approved" &&
      asset.ownershipStatus !== "unknown" &&
      Boolean(asset.sourceOwner) &&
      Boolean(asset.sourceFile) &&
      Boolean(asset.reviewedBy) &&
      Boolean(asset.reviewedDate),
  );
}

export function getProductSeriesPublicationIssues({
  series,
  evidence,
  products,
  imageAssets,
  relationships,
}: ProductSeriesPublicationInputs) {
  const issues: string[] = [];
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));

  if (evidence.publicationStatus !== "published") {
    issues.push(`Evidence status is ${evidence.publicationStatus}, not published.`);
  }

  if (evidence.imageEvidenceStatus !== "reviewed_product_images") {
    issues.push(
      `Image evidence status is ${evidence.imageEvidenceStatus}, not reviewed_product_images.`,
    );
  }

  if (series.verificationStatus === "DATA_CONFLICT") {
    issues.push("Series verification status is DATA_CONFLICT.");
  }

  if (series.productReferences.length < 3) {
    issues.push("Fewer than three governed product relationships are available.");
  }

  for (const reference of series.productReferences) {
    const product = productsBySlug.get(reference.productSlug);

    if (!product) {
      issues.push(`Canonical product ${reference.productSlug} does not exist.`);
      continue;
    }

    if (product.status !== "active") {
      issues.push(`Canonical product ${product.sku} is not active.`);
    }

    if (product.categorySlug !== series.categorySlug) {
      issues.push(`Canonical product ${product.sku} belongs to another category.`);
    }

    const relationship = relationships.find(
      (candidate) =>
        candidate.relationshipType === "product_to_series" &&
        candidate.subject.type === "product" &&
        candidate.subject.id === reference.productSlug &&
        candidate.target.type === "series" &&
        candidate.target.id === evidence.id,
    );

    if (!relationship) {
      issues.push(`Governed relationship for ${product.sku} does not exist.`);
    } else if (
      relationship.relationshipStatus === "unverified" ||
      relationship.verificationStatus === "DATA_CONFLICT"
    ) {
      issues.push(`Governed relationship for ${product.sku} is not publication eligible.`);
    }

    if (!hasApprovedExactMainImage(reference.productSlug, imageAssets)) {
      issues.push(
        `${product.sku} lacks a rights-approved, exact-product, search-eligible main image.`,
      );
    }
  }

  if (
    !series.productReferences.some((reference) => reference.productSlug === series.heroProductSlug)
  ) {
    issues.push("Hero product is not part of the governed series relationships.");
  } else if (!hasApprovedExactMainImage(series.heroProductSlug, imageAssets)) {
    issues.push("Hero product lacks a rights-approved exact-product main image.");
  }

  return issues;
}

export function isProductSeriesPublicationReady(inputs: ProductSeriesPublicationInputs) {
  return getProductSeriesPublicationIssues(inputs).length === 0;
}
