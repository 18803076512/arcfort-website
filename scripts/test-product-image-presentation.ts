#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  getProductImageDisclosureLabel,
  getProductImageEvidenceState,
  isSearchEligibleProductImageAsset,
} from "../lib/content/product-image-evidence.ts";
import type { ProductImageAsset } from "../lib/content/schemas.ts";
import { productImageAssets } from "../lib/data/product-image-assets.ts";

const reviewedExactAsset: ProductImageAsset = {
  assetId: "img-test-main-01",
  sku: "AF-MIG-CT-TEST",
  productSlug: "test-product",
  role: "main",
  publicPath: "/images/products/test-product.jpg",
  altText: "Test product",
  sourceKind: "company_owned_photo",
  sourceReference: "Controlled product photography record TEST-001.",
  sourceFile: "test-product-original.jpg",
  sourceOwner: "Renqiu Ailesen Welding Technology Co., Ltd.",
  ownershipStatus: "company_owned",
  usageRightsStatus: "approved",
  contentMatchStatus: "exact_product",
  publicationStatus: "search_eligible",
  reviewedBy: "Product data reviewer",
  reviewedDate: "2026-08-29",
};

assert.equal(isSearchEligibleProductImageAsset(reviewedExactAsset), true);
assert.equal(getProductImageEvidenceState(reviewedExactAsset), "reviewed_exact_product");
assert.equal(
  getProductImageDisclosureLabel("reviewed_exact_product", "main"),
  "Main reviewed exact-product image",
);

assert.equal(
  isSearchEligibleProductImageAsset({ ...reviewedExactAsset, sourceOwner: undefined }),
  false,
  "A search image must have a source owner.",
);
assert.equal(
  isSearchEligibleProductImageAsset({
    ...reviewedExactAsset,
    publicationStatus: "legacy_reference",
  }),
  false,
  "A legacy reference must never enter search-image projection.",
);
assert.equal(
  isSearchEligibleProductImageAsset({
    ...reviewedExactAsset,
    contentMatchStatus: "product_family_reference",
  }),
  false,
  "A family reference must never enter search-image projection.",
);

const legacyAssets = productImageAssets.filter(
  (asset) => asset.publicationStatus === "legacy_reference",
);
const malformedSearchAssets = productImageAssets.filter(
  (asset) =>
    asset.publicationStatus === "search_eligible" && !isSearchEligibleProductImageAsset(asset),
);

for (const asset of legacyAssets) {
  assert.equal(getProductImageEvidenceState(asset), "product_family_reference");
  assert.equal(isSearchEligibleProductImageAsset(asset), false);
  assert.doesNotMatch(
    getProductImageDisclosureLabel(getProductImageEvidenceState(asset), asset.role),
    /reviewed exact-product/i,
  );
}

assert.equal(
  malformedSearchAssets.length,
  0,
  `Search-eligible registry rows failed the full evidence gate: ${malformedSearchAssets
    .map((asset) => asset.assetId)
    .join(", ")}`,
);

console.log("Product-image public presentation tests passed.");
console.log(`Legacy references checked: ${legacyAssets.length}`);
console.log(
  `Rights-approved exact search images: ${productImageAssets.filter(isSearchEligibleProductImageAsset).length}`,
);
