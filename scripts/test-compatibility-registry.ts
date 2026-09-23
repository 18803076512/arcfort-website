#!/usr/bin/env node

import assert from "node:assert/strict";
import { getProductSeriesReferencesForEvidence } from "../lib/content/compatibility.ts";
import { compatibilityRelationships } from "../lib/data/compatibility-relationships.ts";
import { productSeries } from "../lib/data/product-series.ts";
import { productSeriesEvidence } from "../lib/data/product-series-evidence.ts";
import { arcfortProducts } from "../lib/data/products.ts";
import type {
  CompatibilityEntityType,
  CompatibilityRelationshipType,
} from "../lib/content/schemas.ts";

const products = arcfortProducts.filter((product) => (product.status ?? "active") === "active");
const productsBySlug = new Map(products.map((product) => [product.slug, product]));
const seriesEvidenceById = new Map(productSeriesEvidence.map((record) => [record.id, record]));
const expectedEntityTypes: Record<
  CompatibilityRelationshipType,
  [CompatibilityEntityType, CompatibilityEntityType]
> = {
  product_to_series: ["product", "series"],
  product_to_torch: ["product", "torch"],
  product_to_machine: ["product", "machine"],
  product_to_oem_reference: ["product", "oem_reference"],
  series_to_torch: ["series", "torch"],
  torch_to_machine: ["torch", "machine"],
};
const confirmationEvidence = new Set([
  "factory_confirmation",
  "drawing",
  "approved_sample",
  "verified_reference_number",
  "confirmed_dimensions",
]);

assert.equal(compatibilityRelationships.length, 4);
assert.equal(
  new Set(compatibilityRelationships.map((relationship) => relationship.id)).size,
  compatibilityRelationships.length,
  "Compatibility relationship IDs must be unique.",
);
assert.equal(
  new Set(
    compatibilityRelationships.map(
      (relationship) =>
        `${relationship.relationshipType}:${relationship.subject.type}:${relationship.subject.id}:${relationship.target.type}:${relationship.target.id}`,
    ),
  ).size,
  compatibilityRelationships.length,
  "Compatibility entity relationships must not be duplicated.",
);

for (const relationship of compatibilityRelationships) {
  assert.match(relationship.id, /^compat-[a-z0-9-]+$/);
  assert.ok(relationship.subject.id.length > 0 && relationship.target.id.length > 0);
  assert.deepEqual(
    [relationship.subject.type, relationship.target.type],
    expectedEntityTypes[relationship.relationshipType],
  );
  assert.ok(relationship.role.length >= 15);
  assert.ok(relationship.evidenceBasis.length > 0);
  assert.equal(new Set(relationship.evidenceBasis).size, relationship.evidenceBasis.length);
  assert.ok(relationship.sourceReference.length >= 40);
  assert.match(relationship.reviewedDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(relationship.reviewedBy.length >= 10);

  if (relationship.subject.type === "product") {
    const product = productsBySlug.get(relationship.subject.id);
    assert.ok(product, `${relationship.id} references a missing or non-public product.`);
    assert.ok(
      product.imageStatus === "own_photo" || product.imageStatus === "supplier_photo",
      `${relationship.id} requires reviewed exact-product imagery.`,
    );

    if (relationship.relationshipStatus === "confirmed") {
      assert.equal(product.compatibilityStatus, "confirmed");
    }
  }

  if (relationship.target.type === "series") {
    assert.ok(
      seriesEvidenceById.has(relationship.target.id),
      `${relationship.id} references missing series evidence.`,
    );
  }

  if (relationship.relationshipStatus === "confirmed") {
    assert.equal(relationship.verificationStatus, "CONFIRMED");
    assert.ok(
      relationship.evidenceBasis.some((basis) => confirmationEvidence.has(basis)),
      `${relationship.id} cannot be confirmed from a catalog grouping alone.`,
    );
  } else {
    assert.equal(relationship.buyerConfirmationRequired, true);
    assert.ok(relationship.confirmationRequirements.length >= 3);
  }

  if (relationship.verificationStatus === "DATA_CONFLICT") {
    assert.notEqual(relationship.relationshipStatus, "confirmed");
  }
}

for (const series of productSeries) {
  assert.deepEqual(
    series.productReferences,
    getProductSeriesReferencesForEvidence(series.evidenceId),
    `${series.name} public references must be generated from the compatibility registry.`,
  );
}

const publicRelationshipCount = productSeries.reduce(
  (total, series) => total + series.productReferences.length,
  0,
);
const eligibleRelationshipCount = compatibilityRelationships.filter(
  (relationship) =>
    relationship.relationshipType === "product_to_series" &&
    relationship.relationshipStatus !== "unverified" &&
    relationship.verificationStatus !== "DATA_CONFLICT" &&
    productSeries.some((series) => series.evidenceId === relationship.target.id),
).length;
assert.equal(publicRelationshipCount, eligibleRelationshipCount);

console.log("Compatibility registry validation passed.");
console.log(`Relationships checked: ${compatibilityRelationships.length}`);
console.log(
  `Confirmed: ${compatibilityRelationships.filter((item) => item.relationshipStatus === "confirmed").length}`,
);
console.log(
  `Reference only: ${compatibilityRelationships.filter((item) => item.relationshipStatus === "reference_only").length}`,
);
console.log(
  `Needs confirmation: ${compatibilityRelationships.filter((item) => item.buyerConfirmationRequired).length}`,
);
