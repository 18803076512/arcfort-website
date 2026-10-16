# 15AK Reference Mapping And Compatibility Workflow

## Core Rule

A shared catalog group does not prove universal fit. The 15AK registry associates four canonical
products with the catalog family for internal review, but every product-to-series relationship
remains `reference_only`. The prepared series page is currently held from publication until its
exact-product image evidence passes the public-series gate.

## Current Relationship Matrix

| Product                  | Evidence        | Public status     | Final fit         |
| ------------------------ | --------------- | ----------------- | ----------------- |
| MIG Contact Tip M6 0.8mm | Company catalog | Catalog reference | Evidence required |
| MIG Contact Tip M6 1.0mm | Company catalog | Catalog reference | Evidence required |
| MIG Tip Holder for MB15  | Company catalog | Catalog reference | Evidence required |
| MIG Gas Nozzle for MB15  | Company catalog | Catalog reference | Evidence required |

## Confirmation Inputs

Use one or more of the following before converting a reference relationship to confirmed fitment:

1. Factory-confirmed product and torch mapping.
2. An approved sample showing the complete connection and component stack.
3. A legible torch label or verified reference number.
4. A drawing with thread, length, diameter, opening profile and connection details as applicable.
5. Measured dimensional details that distinguish the requested arrangement from similar variants.

Record the evidence source, evidence level, reviewer, review date and verification status. A visual
resemblance alone is not sufficient.

## Status Handling

- `confirmed`: use only when the canonical evidence supports the exact product-to-series fit.
- `reference_only`: show the item as a sourcing reference and ask the buyer for confirmation inputs.
- `unverified`: do not present as a governed series relationship on an indexable page.
- `DATA_CONFLICT`: do not choose a value automatically; hold publication and request review.

## Adding Future Relationships

Add a product only when it has an active canonical record, a reviewed product image, a matching
category, a traceable source and at least reference-level compatibility evidence. Run
`npm run test:product-series`, the product image checks, SEO checks and the production build before
publication.
