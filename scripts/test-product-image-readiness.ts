#!/usr/bin/env node

import assert from "node:assert/strict";
import { imageAssetHeaders, type ProductImageAssetCsvRow } from "./product-image-asset-utils.ts";
import { assessProductMainImageEvidence } from "./product-image-readiness-utils.ts";

const product = {
  sku: "AF-MIG-CT-TEST",
  main_image: "/images/products/test-contact-tip.jpg",
};

function asset(overrides: Partial<ProductImageAssetCsvRow> = {}): ProductImageAssetCsvRow {
  const row = Object.fromEntries(
    imageAssetHeaders.map((header) => [header, ""]),
  ) as ProductImageAssetCsvRow;

  return {
    ...row,
    asset_id: "img-af-mig-ct-test-main-01",
    sku: product.sku,
    product_slug: "test-contact-tip",
    role: "main",
    public_path: product.main_image,
    alt_text: "Test contact tip",
    source_kind: "local_supplier_archive",
    source_reference: "Controlled test fixture",
    source_file: "test-contact-tip-original.jpg",
    source_owner: "Test supplier",
    ownership_status: "supplier_or_third_party",
    usage_rights_status: "approved",
    content_match_status: "exact_product",
    publication_status: "search_eligible",
    reviewed_by: "Test reviewer",
    reviewed_date: "2026-08-29",
    ...overrides,
  };
}

const fileExists = () => true;

const exact = assessProductMainImageEvidence(product, [asset()], fileExists);
assert.equal(exact.hasRegisteredPublicMainImage, true);
assert.equal(exact.hasSearchEligibleExactMainImage, true);
assert.deepEqual(exact.gaps, []);

const legacy = assessProductMainImageEvidence(
  product,
  [
    asset({
      publication_status: "legacy_reference",
      usage_rights_status: "needs_confirmation",
      content_match_status: "product_family_reference",
    }),
  ],
  fileExists,
);
assert.equal(legacy.hasRegisteredPublicMainImage, true);
assert.equal(legacy.hasSearchEligibleExactMainImage, false);
assert(legacy.gaps.includes("approved_usage_rights"));
assert(legacy.gaps.includes("exact_product_match"));
assert(legacy.gaps.includes("search_eligible"));

const incompleteSearchState = assessProductMainImageEvidence(
  product,
  [asset({ publication_status: "search_eligible", source_owner: "" })],
  fileExists,
);
assert.equal(incompleteSearchState.hasRegisteredPublicMainImage, true);
assert.equal(incompleteSearchState.hasSearchEligibleExactMainImage, false);
assert(incompleteSearchState.gaps.includes("source_owner"));

const missingRegistry = assessProductMainImageEvidence(product, [], fileExists);
assert.equal(missingRegistry.hasRegisteredPublicMainImage, false);
assert.equal(missingRegistry.hasSearchEligibleExactMainImage, false);
assert.deepEqual(missingRegistry.gaps, ["registry_record"]);

const missingFile = assessProductMainImageEvidence(product, [asset()], () => false);
assert.equal(missingFile.hasRegisteredPublicMainImage, false);
assert.equal(missingFile.hasSearchEligibleExactMainImage, false);
assert.deepEqual(missingFile.gaps, ["image_file"]);

console.log("Product main-image evidence classification tests passed.");
