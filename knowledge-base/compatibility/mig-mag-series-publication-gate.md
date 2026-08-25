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
