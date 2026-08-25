# 15AK MIG/MAG Torch Parts Series

## Purpose

This record defines the evidence boundary for the public 15AK catalog-reference series page:

`/products/mig-mag-torch-parts/series/15ak-mig-mag-torch-parts`

It is a sourcing and product-identification aid. It is not a universal compatibility claim.

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
