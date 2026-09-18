# 602 Series Component Evidence

## Purpose

This record preserves the reviewed company-catalog page associated with the 602 water-cooled
MIG/MAG torch family without treating its internally conflicting layout as confirmed ArcFort Weld
product data. It creates a controlled factory-confirmation and exact-image queue while keeping the
series private.

## Sources

- Company source: `public/downloads/renqiu-ailesen-welding-catalog.pdf`, PDF page 14, catalog pages
  21-22.
- Official OEM reference: ABICOR BINZEL MIG/MAG Spare Parts List 2.0, technical overview page 6 and
  MB 602 pages 49-51:
  `https://www.binzel-abicor.com/uploads/Content/Germany/PDF-Files/PDF_Files_MIGMAG/English/mig_mag_spare_parts_list_2_0_v1.pdf`.
- Review date: 2026-08-28.

The official OEM source establishes an MB 602 reference family and reference technical values. It
does not confirm which ArcFort Weld product the company-catalog page depicts or that an ArcFort Weld
item has OEM compatibility.

## Catalog Identity Conflict

The company page header reads `ORK 501D Water Cooled MIG/MAG Welding Torch`. On the same page, the
technical table lists `ORK 602 Complete Torch 3M` and `ORK 602 Complete Torch 5M`, followed by 602
wear-part candidates. This is an internal source contradiction.

The series registry therefore uses:

- Verification: `DATA_CONFLICT`
- Publication: `blocked`
- Public category/RFQ choice: excluded
- Public series route: not generated

Do not choose the table designation merely because it matches an official OEM family. Factory review
must identify the exact supplied product and resolve whether the page header, table, imagery or more
than one element is incorrect.

## Canonical Records

- Facts: `data/evidence/product-series-component-facts.csv`
- Factory and SKU intake: `data/intake/602-series-confirmation.csv`
- Image intake: `data/intake/602-image-intake.csv`
- Generated runtime facts: `lib/data/product-series-component-facts.ts`
- Generated status report: `docs/product-series-component-evidence-report.md`

Current baseline:

- 72 field-level facts
- 22 component/variant candidates
- 37 exact-image requests
- 1 blocked company-catalog identity conflict
- 4 official OEM reference facts kept separate from company values
- 0 confirmed facts
- 0 canonical 602 SKU mappings
- 0 product-to-series compatibility relationships
- 0 approved exact-product images

## Candidate Scope

The queue preserves the candidates visibly named or shown on the catalog page:

- Complete 3 m and 5 m water-cooled torch candidates
- One 18 mm gas-nozzle candidate
- Seven M8 x 30 contact-tip material/wire-size candidates
- One M8 x 25.5 mm contact-tip holder candidate
- DMC and ceramic gas-diffuser candidates
- Swan neck, support spring, rear handle, adaptor nut, central connector and M10 x 1 nut
- 3.5 m and 5.5 m liner candidates for the catalog's stated wire range
- One separately governed rear-media connection set

These are catalog candidates, not SKUs. Dimensions and material labels remain source references until
the exact supplied item has qualifying Level A evidence.

## Water-Cooled Interface Boundary

The assembly image shows multiple media leads, but it does not reliably label coolant supply,
coolant return, shielding gas, power and control functions. Hose color, position and visual
similarity must not be used to assign a role.

Require a controlled connection drawing, verified marking or factory record that identifies every
path, connector, seal and machine-side interface before compatibility or complete-torch publication.

## Promotion Gate

The 602 record can leave `blocked` only after:

1. Factory evidence resolves the 501D page header versus 602 table conflict.
2. The exact supplied complete torch and component identities are recorded.
3. Water, gas, power, control and wire-path interfaces are identified from controlled evidence.
4. Every promoted technical value retains source, reviewer and review date.
5. Exact-product images have source ownership, website-use rights and exact-item review.
6. Canonical SKUs and compatibility relationships pass their normal governance checks.
7. Series, product, image, SEO and build validation passes.

Until then, no 602 page, buyer-facing series choice or confirmed ArcFort Weld specification should
be published from this evidence.
