#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { productCategories } from "../content/categories.ts";
import { getProductSeriesPublicationIssues } from "../lib/content/product-series-publication.ts";
import { compatibilityRelationships } from "../lib/data/compatibility-relationships.ts";
import { productImageAssets } from "../lib/data/product-image-assets.ts";
import { productSeries, productSeriesCandidates } from "../lib/data/product-series.ts";
import { productSeriesEvidence } from "../lib/data/product-series-evidence.ts";
import { arcfortProducts } from "../lib/data/products.ts";

const requiredCoreSeries = ["15AK", "24KD", "25AK", "36KD", "40KD", "501D", "602"];
const migCategory = productCategories.find((category) => category.slug === "mig-mag-torch-parts");

assert.ok(migCategory, "MIG/MAG category must exist.");
assert.equal(
  productSeriesEvidence.length,
  10,
  "The reviewed MIG/MAG catalog set must contain 10 records.",
);
assert.equal(
  new Set(productSeriesEvidence.map((record) => record.id)).size,
  productSeriesEvidence.length,
  "Series evidence IDs must be unique.",
);
assert.equal(
  new Set(productSeriesEvidence.map((record) => record.seriesSlug)).size,
  productSeriesEvidence.length,
  "Series evidence slugs must be unique.",
);

for (const seriesName of requiredCoreSeries) {
  assert.ok(
    productSeriesEvidence.some((record) => record.name.startsWith(seriesName)),
    `${seriesName} must have a governed catalog evidence record.`,
  );
}

for (const record of productSeriesEvidence) {
  assert.match(record.id, /^mig-series-[a-z0-9-]+$/);
  assert.match(record.seriesSlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(record.categorySlug, "mig-mag-torch-parts");
  assert.equal(record.process, "MIG/MAG");
  assert.equal(record.sourceType, "official_catalog");
  assert.equal(record.sourceLevel, "A");
  assert.notEqual(record.verificationStatus, "DATA_CONFLICT");
  assert.match(record.sourceReference, /Renqiu Ailesen welding catalog PDF page/);
  assert.ok(record.pdfPages.length > 0 && record.pdfPages.every((page) => page >= 1 && page <= 58));
  assert.ok(
    record.catalogPages.length > 0 &&
      record.catalogPages.every((page) => Number.isInteger(page) && page > 0),
  );
  assert.equal(record.catalogUrl, "/downloads/renqiu-ailesen-welding-catalog.pdf");
  assert.ok(record.documentedComponents.length >= 6);
  assert.equal(new Set(record.documentedComponents).size, record.documentedComponents.length);
  assert.ok(record.buyerCheck.length >= 180);
  assert.ok(record.missingEvidence.length >= 3);
  assert.match(record.reviewedDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(record.reviewedBy.length >= 10);

  const matchingPublicSeries = productSeries.find((series) => series.evidenceId === record.id);
  const matchingCandidate = productSeriesCandidates.find(
    (series) => series.evidenceId === record.id,
  );
  const publicationIssues = matchingCandidate
    ? getProductSeriesPublicationIssues({
        series: matchingCandidate,
        evidence: record,
        products: arcfortProducts,
        imageAssets: productImageAssets,
        relationships: compatibilityRelationships,
      })
    : [];

  if (record.publicationStatus === "published") {
    assert.ok(record.publicSeriesSlug, `${record.name} needs a public route slug.`);
    assert.equal(record.imageEvidenceStatus, "reviewed_product_images");
    assert.ok(matchingCandidate, `${record.name} needs a governed ProductSeries candidate.`);
    assert.deepEqual(
      publicationIssues,
      [],
      `${record.name} does not satisfy the exact-image and relationship publication gate.`,
    );
    assert.ok(matchingPublicSeries, `${record.name} needs a governed public ProductSeries record.`);
    assert.equal(matchingPublicSeries.slug, record.publicSeriesSlug);
    assert.equal(matchingPublicSeries.sourceReference, record.sourceReference);
    assert.equal(matchingPublicSeries.sourceLevel, record.sourceLevel);
    assert.equal(matchingPublicSeries.verificationStatus, record.verificationStatus);
  } else {
    assert.equal(record.publicSeriesSlug, undefined);
    assert.equal(
      matchingPublicSeries,
      undefined,
      `${record.name} must not generate a public series page before publication approval.`,
    );

    if (matchingCandidate && record.imageEvidenceStatus === "needs_photos") {
      assert.ok(
        publicationIssues.some((issue) => issue.includes("rights-approved")),
        `${record.name} is marked needs_photos but has no exact-image publication issue.`,
      );
    }
  }

  if (record.publicationStatus === "blocked") {
    assert.equal(record.verificationStatus, "DATA_CONFLICT");
  }
}

const referencedEvidenceIds = migCategory.referenceFamilies?.map((family) => family.evidenceId);
assert.deepEqual(
  new Set(referencedEvidenceIds).size,
  productSeriesEvidence.length,
  "Every catalog evidence record must appear once in the MIG/MAG category family list.",
);

for (const family of migCategory.referenceFamilies ?? []) {
  assert.ok(family.evidenceId, `${family.name} needs an evidence ID.`);
  const evidence = productSeriesEvidence.find((record) => record.id === family.evidenceId);
  assert.ok(evidence, `${family.name} references missing evidence.`);
  assert.equal(family.name, evidence.name);
  assert.deepEqual(family.documentedComponents, evidence.documentedComponents);
  assert.equal(family.buyerCheck, evidence.buyerCheck);
  assert.equal(
    family.seriesSlug,
    evidence.publicationStatus === "published" ? evidence.publicSeriesSlug : undefined,
  );
}

for (const series of productSeries) {
  const evidence = productSeriesEvidence.find((record) => record.id === series.evidenceId);
  assert.ok(evidence, `${series.name} needs a valid evidence record.`);
  assert.equal(evidence.publicationStatus, "published");
}

const catalogPath = path.join(
  process.cwd(),
  "public",
  "downloads",
  "renqiu-ailesen-welding-catalog.pdf",
);
assert.ok(existsSync(catalogPath), "The public company catalog must exist.");

console.log("Product-series evidence validation passed.");
console.log(`Catalog series reviewed: ${productSeriesEvidence.length}`);
console.log(
  `Published: ${productSeriesEvidence.filter((record) => record.publicationStatus === "published").length}`,
);
console.log(
  `Evidence review: ${productSeriesEvidence.filter((record) => record.publicationStatus === "evidence_review").length}`,
);
