# 36KD Series Component Evidence

## Purpose

This record preserves the reviewed 36KD company-catalog spread as internal sourcing evidence without
turning catalog references into confirmed ArcFort Weld products. It supports factory confirmation,
future SKU creation and exact-image collection.

## Sources

- Company source: `output/pdf/renqiu-ailesen-welding-catalog.pdf`, PDF page 11, catalog pages 15-16.
- Official comparison: ABICOR BINZEL MIG/MAG welding torch catalog, MB GRIP 36 KD section:
  `https://www.binzel-abicor.com/uploads/Content/Germany/PDF-Files/PDF_Files_MIGMAG/English/migmag-katalog_pro_m277gb_2_0-v1_web.pdf`.
- Review date: 2026-08-21.

The company catalog proves that the document contains an ORK 36KD sourcing group and the listed
component candidates. It does not prove OEM fit, shared dimensions across variants or the supplied
complete-torch rating.

## Canonical Records

- Facts: `data/evidence/product-series-component-facts.csv`
- Factory and SKU intake: `data/intake/36kd-series-confirmation.csv`
- Image intake: `data/intake/36kd-image-intake.csv`
- Generated runtime facts: `lib/data/product-series-component-facts.ts`
- Generated status report: `docs/product-series-component-evidence-report.md`

Current baseline:

- 69 field-level facts
- 24 component/variant candidates
- 35 image requests
- 2 blocked source conflicts
- 0 confirmed facts
- 0 canonical 36KD SKU mappings
- 0 approved exact-product images

## Conflict Boundary

The company catalog lists 340 A CO2 / 320 A mixed gases, while the official OEM reference lists
320 A CO2 / 290 A mixed gases. The company spread also contradicts itself by listing the cylindrical
nozzle opening as 19 mm in the main table and 20 mm in the wear-parts table. Both records use
`DATA_CONFLICT` and lifecycle `blocked`; no value may be selected without exact-product evidence.

## Variant Boundary

Three nozzle profiles, six contact-tip variants, three tip-holder lengths and two diffuser variants
are separate candidates. Shared diagrams remain family references only. Each candidate requires its
own identity, interface, measurement and image evidence before SKU creation.

The catalog compatibility wording remains a source statement, not confirmed fitment. Final fit
requires exact torch identification plus a drawing, approved sample, verified reference or confirmed
dimensions.

## Promotion Gate

A candidate may become a canonical SKU only after:

1. The exact supplied product name and identity are recorded.
2. Conflicts are resolved by qualifying Level A evidence.
3. Technical values, reviewer and review date are recorded.
4. Exact-product main and required detail images have source ownership and usage rights.
5. Product-to-series compatibility is governed separately at the correct confidence level.
6. Product, image, compatibility, SEO and build checks pass.

Until then the 36KD series stays in `evidence_review` and creates no indexable public route.
