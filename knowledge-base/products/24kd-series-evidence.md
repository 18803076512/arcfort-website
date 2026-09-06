# 24KD Series Component Evidence

## Purpose

This record preserves the reviewed 24KD company-catalog spread as internal sourcing evidence without
turning catalog references into confirmed ArcFort Weld products. It supports factory confirmation,
future SKU creation and exact-image collection.

## Sources

- Company source: `output/pdf/renqiu-ailesen-welding-catalog.pdf`, PDF page 9, catalog pages 11-12.
- Official comparison: ABICOR BINZEL MIG/MAG welding torch catalog, MB GRIP 24 KD section:
  `https://www.binzel-abicor.com/uploads/Content/Germany/PDF-Files/PDF_Files_MIGMAG/English/PRO_M277_GB_MIGMAG_31_WEB_PW.pdf`.
- Review date: 2026-08-21.

The company catalog proves that the document contains an ORK 24KD sourcing group and the listed
component candidates. It does not prove that every item fits an OEM torch, that every diagram applies
to every variant, or that the supplied complete torch has the catalog electrical values.

## Canonical Records

- Facts: `data/evidence/product-series-component-facts.csv`
- Factory and SKU intake: `data/intake/24kd-series-confirmation.csv`
- Image intake: `data/intake/24kd-image-intake.csv`
- Generated runtime facts: `lib/data/product-series-component-facts.ts`
- Generated status report: `docs/product-series-component-evidence-report.md`

Current baseline:

- 68 field-level facts
- 23 component/variant candidates
- 34 image requests
- 3 blocked source conflicts
- 0 confirmed facts
- 0 canonical 24KD SKU mappings
- 0 approved exact-product images

## Conflict Boundary

The company catalog and official OEM reference disagree on complete-torch rating, duty cycle and wire
range. The records retain both source values and use `DATA_CONFLICT` plus lifecycle `blocked`.
Neither value may appear as an ArcFort Weld specification until the exact supplied torch has Level A
evidence, such as a factory specification or controlled product test.

## Variant Boundary

Three nozzle profiles and seven contact-tip variants are separate candidates. Shared catalog
dimensions remain source references only. One photograph, drawing or measurement cannot confirm all
variants unless controlled factory documentation explicitly establishes the shared geometry.

The catalog wording `Compatible torch and Parts For BINZEL` remains a source statement, not confirmed
compatibility. Final fit requires exact torch identification plus drawing, sample, verified reference
or confirmed dimensions.

## Promotion Gate

A candidate may become a canonical SKU only after:

1. The exact supplied product name and identity are recorded.
2. Technical values are supported by qualifying evidence.
3. Reviewer and review date are recorded.
4. Exact-product main and required detail images have source ownership and usage rights.
5. Product-to-series compatibility is recorded separately with the correct confidence level.
6. Product, image, compatibility, SEO and build checks pass.

Until then the 24KD series stays in `evidence_review` and creates no indexable public route.
