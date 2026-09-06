# 501D Series Component Evidence

## Purpose

This record preserves the reviewed 501D company-catalog spread as internal sourcing evidence without
turning catalog references into confirmed ArcFort Weld products. It adds explicit water-cooled media
connection governance for factory confirmation, future SKU creation and image collection.

## Sources

- Company source: `output/pdf/renqiu-ailesen-welding-catalog.pdf`, PDF page 13, catalog pages 19-20.
- Official comparison: ABICOR BINZEL MIG/MAG catalog, MB GRIP 501 D section:
  `https://www.binzel-abicor.com/uploads/Content/Germany/PDF-Files/PDF_Files_MIGMAG/English/PRO_M277_GB_MIGMAG_31_WEB_PW.pdf`.
- Review date: 2026-08-21.

The company catalog proves that the document contains an ORK 501D water-cooled sourcing group and
the listed candidates. It does not prove OEM fit, shared dimensions, connector functions or supplied
complete-torch technical values.

## Canonical Records

- Facts: `data/evidence/product-series-component-facts.csv`
- Factory and SKU intake: `data/intake/501d-series-confirmation.csv`
- Image intake: `data/intake/501d-image-intake.csv`
- Generated runtime facts: `lib/data/product-series-component-facts.ts`
- Generated status report: `docs/product-series-component-evidence-report.md`

Current baseline:

- 89 field-level facts
- 29 component/variant candidates
- 46 image requests
- 3 blocked source conflicts
- 0 confirmed facts
- 0 canonical 501D SKU mappings
- 0 approved exact-product images

## Conflict Boundary

The company catalog and official OEM reference disagree on rating, duty cycle and wire range. All
three records use `DATA_CONFLICT` and lifecycle `blocked`. Neither value may be published without
exact supplied-product Level A evidence.

## Water-Cooled Interface Boundary

The catalog assembly image shows multiple media leads at the neck and rear cable assembly. It does
not identify every coolant supply, coolant return, shielding-gas, power or control role. The registry
therefore records only visible multiple-media interfaces.

Do not assign an interface function from color, position or visual similarity. Require a factory
connection diagram, controlled drawing or verified marking that identifies each path, connector and
seal arrangement.

## Variant Boundary

Six nozzle profile/wall variants, seven contact tips, two diffusers and two tip-holder lengths are
separate candidates. Shared diagrams remain family references only. Every candidate needs exact
identity, interface, measurement and image evidence before SKU creation.

## Promotion Gate

A candidate may become a canonical SKU only after:

1. The exact supplied product name and identity are recorded.
2. Rating, duty-cycle and wire-range conflicts are resolved by qualifying Level A evidence.
3. Water, gas, power, control and wire-path interfaces are identified from controlled evidence.
4. Technical values, reviewer and review date are recorded.
5. Exact-product images have source ownership and usage rights.
6. Product-to-series compatibility is governed separately at the correct confidence level.
7. Product, image, compatibility, SEO and build checks pass.

Until then the 501D series stays in `evidence_review` and creates no indexable public route.
