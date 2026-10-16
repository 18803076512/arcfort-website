# 25AK Series Component Evidence

## Purpose

This record preserves the reviewed 25AK company-catalog spread as internal sourcing evidence without
turning catalog references into confirmed ArcFort Weld products. It supports factory confirmation,
future SKU creation and exact-image collection.

## Sources

- Company source: `output/pdf/renqiu-ailesen-welding-catalog.pdf`, PDF page 10, catalog pages 13-14.
- Official comparison: ABICOR BINZEL MIG/MAG welding torch catalog, MB GRIP 25 AK section:
  `https://www.binzel-abicor.com/uploads/Content/Germany/PDF-Files/PDF_Files_MIGMAG/English/migmag-katalog_pro_m277gb_2_0-v1_web.pdf`.
- Review date: 2026-08-21.

The company catalog proves that the document contains an ORK 25AK sourcing group and the listed
component candidates. It does not prove that every item fits an OEM torch, that shared diagrams
apply to every variant, or that the supplied complete torch has the catalog electrical values.

## Canonical Records

- Facts: `data/evidence/product-series-component-facts.csv`
- Factory and SKU intake: `data/intake/25ak-series-confirmation.csv`
- Image intake: `data/intake/25ak-image-intake.csv`
- Generated runtime facts: `lib/data/product-series-component-facts.ts`
- Generated status report: `docs/product-series-component-evidence-report.md`

Current baseline:

- 64 field-level facts
- 21 component/variant candidates
- 31 image requests
- 3 blocked source conflicts
- 0 confirmed facts
- 0 canonical 25AK SKU mappings
- 0 approved exact-product images

## Conflict Boundary

The company catalog and official OEM reference disagree on complete-torch rating, duty cycle and wire
range. The records retain both source values and use `DATA_CONFLICT` plus lifecycle `blocked`.
Neither value may appear as an ArcFort Weld specification until the exact supplied torch has Level A
evidence, such as a factory specification or controlled product test.

## Variant Boundary

The catalog contains three nozzle profiles, seven contact-tip variants and one tip holder. Shared
nozzle dimensions remain source references only; each profile needs its own evidence. The page does
not list a gas diffuser in the 25AK front-end stack, so one must not be inferred from another series.

The catalog wording about compatibility remains a source statement, not confirmed compatibility.
Final fit requires exact torch identification plus a drawing, sample, verified reference or confirmed
dimensions.

## Promotion Gate

A candidate may become a canonical SKU only after:

1. The exact supplied product name and identity are recorded.
2. Technical values are supported by qualifying evidence.
3. Reviewer and review date are recorded.
4. Exact-product main and required detail images have source ownership and usage rights.
5. Product-to-series compatibility is recorded separately with the correct confidence level.
6. Product, image, compatibility, SEO and build checks pass.

Until then the 25AK series stays in `evidence_review` and creates no indexable public route.
