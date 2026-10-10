# 40KD Series Component Evidence

## Purpose

This record preserves the reviewed 40KD company-catalog spread as internal sourcing evidence without
turning catalog references into confirmed ArcFort Weld products. It supports factory confirmation,
future SKU creation and exact-image collection.

## Sources

- Company source: `output/pdf/renqiu-ailesen-welding-catalog.pdf`, PDF page 12, catalog pages 17-18.
- Official comparison: ABICOR BINZEL MB/RAB operating instructions, MB 40 KD technical-data row:
  `https://www.binzel-abicor.com/uploads/Content/Germany/PDF-Files/PDF_Files_Manuals/BAL_0045_MB_RAB_DE_EN_FR_ES_Neu.pdf`.
- Review date: 2026-08-21.

The company catalog proves that the document contains an ORK 40KD sourcing group and the listed
component candidates. It does not prove OEM fit, shared dimensions or the supplied complete-torch
electrical values.

## Canonical Records

- Facts: `data/evidence/product-series-component-facts.csv`
- Factory and SKU intake: `data/intake/40kd-series-confirmation.csv`
- Image intake: `data/intake/40kd-image-intake.csv`
- Generated runtime facts: `lib/data/product-series-component-facts.ts`
- Generated status report: `docs/product-series-component-evidence-report.md`

Current baseline:

- 69 field-level facts
- 24 component/variant candidates
- 35 image requests
- 2 blocked source conflicts
- 0 confirmed facts
- 0 canonical 40KD SKU mappings
- 0 approved exact-product images

## Conflict Boundary

The company catalog lists 380 A CO2 / 360 A mixed gases and 60% duty cycle, while the official OEM
manual lists 350 A CO2 / 320 A mixed gases and 35% duty cycle. Both records use `DATA_CONFLICT` and
lifecycle `blocked`. Neither value may be published without exact supplied-product Level A evidence.

The 1.0-2.4 mm wire range agrees across both sources but is not automatically confirmed for ArcFort
Weld supply. Agreement between references is not a substitute for exact-product evidence.

## Variant Boundary

Three nozzle profiles, eight contact-tip variants and two diffuser variants are separate candidates.
Catalog diagrams remain references only. Each candidate needs exact identity, interface,
measurement and image evidence before SKU creation.

The catalog compatibility wording remains a source statement, not confirmed fitment. Final fit
requires exact torch identification plus a drawing, approved sample, verified reference or confirmed
dimensions.

## Promotion Gate

A candidate may become a canonical SKU only after:

1. The exact supplied product name and identity are recorded.
2. Rating and duty-cycle conflicts are resolved by qualifying Level A evidence.
3. Technical values, reviewer and review date are recorded.
4. Exact-product main and required detail images have source ownership and usage rights.
5. Product-to-series compatibility is governed separately at the correct confidence level.
6. Product, image, compatibility, SEO and build checks pass.

Until then the 40KD series stays in `evidence_review` and creates no indexable public route.
