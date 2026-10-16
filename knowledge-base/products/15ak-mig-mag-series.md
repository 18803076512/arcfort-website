# 15AK MIG/MAG Torch Parts Series

## Purpose

This record defines the evidence boundary for the prepared 15AK catalog-reference series candidate:

`/products/mig-mag-torch-parts/series/15ak-mig-mag-torch-parts`

The URL currently uses a temporary redirect to the MIG/MAG category because the linked product
images do not yet prove approved usage rights and exact-product identity. The candidate content is
retained for restoration after the publication gate passes. It is a sourcing and
product-identification aid, not a universal compatibility claim.

## Evidence Source

- Source: Renqiu Ailesen welding catalog PDF pages 7-8 (catalog pages 7-10)
- Source level: A, company-owned catalog evidence
- Current verification status: `NEEDS_FACTORY_CONFIRMATION`
- Public relationship wording: catalog reference / reference only

The page resolves technical cues from the canonical product records instead of duplicating exact
values in the series record.

## Governed Product Relationships

| SKU            | Product                  | Series role                           | Relationship   |
| -------------- | ------------------------ | ------------------------------------- | -------------- |
| AF-MIG-CT-0004 | MIG Contact Tip M6 0.8mm | Contact tip, 0.8 mm catalog reference | Reference only |
| AF-MIG-CT-0005 | MIG Contact Tip M6 1.0mm | Contact tip, 1.0 mm catalog reference | Reference only |
| AF-MIG-TH-0007 | MIG Tip Holder for MB15  | Contact tip holder catalog reference  | Reference only |
| AF-MIG-GN-0008 | MIG Gas Nozzle for MB15  | Gas nozzle catalog reference          | Reference only |

The general M6 1.2 mm contact-tip record is deliberately excluded. Its current source describes a
general M6 x 27 reference and does not document it inside the same 15AK catalog group.

## Catalog Component Evidence

The detailed evidence registry now keeps the catalog's air-valve and standard complete-torch
arrangements separate. It records 46 component or variant candidates, 158 field-level catalog facts
and 58 exact-image requests. These are internal review records, not additional public SKUs.

- `data/evidence/product-series-component-facts.csv` - source facts and verification states
- `data/intake/15ak-series-confirmation.csv` - factory identity and SKU confirmation queue
- `data/intake/15ak-image-intake.csv` - exact component and assembly image requests
- `knowledge-base/products/15ak-component-evidence.md` - scope, assembly matrix and publication gate

The four governed public product records continue to use the separate exact-SKU technical and image
workflow. A matching component name is not evidence that the catalog candidate and public SKU are
the same supplied part.

## Prepared Buyer Identification Interface

The retained series candidate presents the two documented catalog arrangements as separate buyer
identification paths when it becomes publication eligible:

1. Air-Valve Torch Arrangement, sourced from company catalog pages 7-8.
2. Standard Complete-Torch Arrangement, sourced from company catalog pages 9-10.

Each path names component groups only; it does not publish the internal candidate rows, dimensions,
ratings or unconfirmed SKU mappings. Its RFQ action carries the selected arrangement, requested
component position, quantity, torch label and available evidence into the RFQ form. The prefilled
text explicitly states that the relationship is catalog-reference only and that final fit requires
evidence.

The comparison is an identification aid, not a compatibility matrix. When restored, it must remain
responsive, keep the two catalog arrangements visually separate and retain the generic
component-stack fallback for future public series records that do not have arrangement-level source
evidence.

## Publication Hold

- Evidence status: `evidence_review`
- Image evidence status: `needs_photos`
- Public-series collection: excluded
- Sitemap and primary navigation: excluded
- Former series URL: temporary redirect to `/products/mig-mag-torch-parts`

Restore the page only when every linked product has a rights-approved, exact-product,
search-eligible main image with source owner, source file, reviewer and review date, and all
relationship and build checks pass.

## Buyer Confirmation Requirements

Before final fit is quoted, request the exact torch label or model, the installed front-end component
stack, required wire size, component reference numbers when available, and a clear sample photo or
drawing with measurable details.

## Missing Evidence

- Confirmed torch arrangement and complete component-stack drawing
- Confirmed SKU mapping for the cataloged insulators, springs, swan necks, liners and rear components
- Approved samples or factory-confirmed fitment records
- Company-owned main, detail, dimensional, packaging and bulk images for the complete series
- Confirmed rules for differentiating visually similar 15AK-style arrangements

Do not promote any relationship to confirmed compatibility until the evidence is recorded in the
canonical product and series data.
