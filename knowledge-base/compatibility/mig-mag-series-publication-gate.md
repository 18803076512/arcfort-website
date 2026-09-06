# MIG/MAG Series Publication Gate

## Evidence Review

A company catalog can confirm that a named torch family and component group are within the documented
sourcing range. It does not prove that every visually similar component or trade-name equivalent is
compatible.

## Publication Requirements

A product-series record may become public only when all of the following are true:

1. The catalog or company source and exact pages are recorded.
2. Canonical product records exist with stable SKU, category and slug identifiers.
3. Every public product has a reviewed exact-product image and traceable image source.
4. Every product-to-series relationship is explicitly `reference_only` or `confirmed`.
5. A confirmed relationship is supported by company confirmation, drawing, approved sample,
   verified reference number or confirmed dimensions.
6. Buyer selection variables and final-fit evidence requirements are visible on the page.
7. Data, SEO, link, image, responsive and build checks pass.

## Status Rules

- `evidence_review`: may be selected in an RFQ; no indexable series page.
- `published`: may generate a series route, sitemap entry and internal links.
- `blocked`: retains a `DATA_CONFLICT`; no public claim or route.

Do not promote a record because the page would be useful for SEO. Product and compatibility evidence
must come first.

## Automated Enforcement

`lib/content/product-series-publication.ts` evaluates each candidate against the evidence record,
canonical products, image-asset registry and compatibility registry. A candidate enters the public
`productSeries` collection only when every linked product has a `search_eligible` main image with
approved usage rights, exact-product match, source owner, source file, reviewer and review date.

Held series URLs use a temporary redirect to the parent category. This prevents a misleading or
404 page while preserving the option to restore the same canonical URL after evidence approval.
`npm run series:validate` must fail if a record is marked `published` without satisfying this gate.
