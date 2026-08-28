# Renqiu Ailesen Catalog Product Data Audit

Source PDF: `output/pdf/renqiu-ailesen-welding-catalog.pdf`

Public catalog: `/downloads/renqiu-ailesen-welding-catalog.pdf`

Audit date: 2026-06-29

## Extraction Notes

- PDF pages 1-2 contain extractable text.
- Most catalog product pages are image-based, so exact table values are not imported as confirmed specifications.
- New website products below are product-family pages verified by visual page review only.
- Dimensions, compatibility, OEM numbers, electrical ratings, certifications and prices remain unconfirmed unless later supplied by factory data, drawing, sample or approved product sheet.

## Added Product Families

| SKU            | Product                                 | Website Category           | PDF Evidence                                                                                                                                                                                                                              | Public Data Status |
| -------------- | --------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| AF-MIG-MT-0031 | MIG/MAG Welding Torch                   | MIG/MAG Torch Parts        | PDF pages 4-18 - MIG/MAG torch assemblies and exploded torch part tables are visible across the MIG/MAG section.                                                                                                                          | needs_review       |
| AF-MIG-MS-0032 | MIG Torch Switch                        | MIG/MAG Torch Parts        | PDF pages 19-21 - Torch switch and small MIG/MAG replacement accessories are visible in the late MIG/MAG section.                                                                                                                         | needs_review       |
| AF-MAC-WF-0033 | Wire Feeder                             | Welding Machines           | PDF pages 19-20 and 39-40 - Wire feeder units and wire feeder accessories are visible in the catalog.                                                                                                                                     | needs_review       |
| AF-PLA-PT-0034 | Plasma Cutting Torch                    | Plasma Cutting Consumables | PDF pages 22-24 and 55-57 - Plasma torch assemblies and plasma consumable groups are visible in plasma sections.                                                                                                                          | needs_review       |
| AF-TIG-TT-0035 | TIG Welding Torch                       | TIG Torch Parts            | PDF pages 25-37 - TIG torch assemblies, exploded diagrams and TIG accessory tables are visible in the TIG section.                                                                                                                        | needs_review       |
| AF-TIG-TS-0036 | TIG Torch Switch                        | TIG Torch Parts            | PDF page 37 - TIG torch handles and switch-related accessory images are visible near the end of the TIG section.                                                                                                                          | needs_review       |
| AF-MAC-SG-0037 | Stud Welding Gun                        | Welding Machines           | PDF page 37 - Stud welding gun products are visible in the catalog.                                                                                                                                                                       | needs_review       |
| AF-ACC-SA-0038 | Stud Welding Accessories                | Welding Accessories        | PDF pages 37 and 58 - Stud welding accessories and small copper accessory groups are visible in catalog sections.                                                                                                                         | needs_review       |
| AF-ACC-RT-0039 | Robotic MIG/MAG Welding Torch Front End | Welding Accessories        | PDF pages 48-54 - Robotic welding torch neck/front-end assemblies and related removable parts are visible. The evidence does not confirm a complete robot flange, cable package, collision mount, cooling circuit or model compatibility. | needs_review       |
| AF-CON-SE-0040 | Spot Welding Electrode                  | Welding Consumables        | PDF page 58 - Spot welding electrode and cap series are visible on the accessories summary page.                                                                                                                                          | needs_review       |
| AF-ACC-FA-0041 | Wire Feeder Accessories                 | Welding Accessories        | PDF pages 39-41 - Wire feeder accessories, connectors and feeder-related components are visible in the catalog.                                                                                                                           | needs_review       |
| AF-ACC-PC-0042 | Welding Protective Cover                | Welding Accessories        | PDF page 58 - Rubber house, canvas hose, leather house, dust prevent cover and protective cover items are visible.                                                                                                                        | needs_review       |
| AF-ACC-FM-0043 | CO2 Flowmeter                           | Welding Accessories        | PDF page 58 - CO2 flowmeter item is visible on the accessories summary page.                                                                                                                                                              | needs_review       |

## Already Covered By Existing SKU Pages

- MIG Contact Tip
- MIG Gas Nozzle
- MIG Diffuser
- MIG Torch Liner
- MIG Swan Neck
- TIG Ceramic Cup
- TIG Collet
- TIG Collet Body
- TIG Gas Lens
- Plasma Electrode
- Plasma Nozzle
- Plasma Swirl Ring
- Plasma Shield
- Plasma Retaining Cap
- Electrode Holder
- Ground Clamp
- Welding Cable
- Dinse Connector

## MIG/MAG Series Evidence Registry

The MIG/MAG catalog review now has a canonical structured registry in
`lib/data/product-series-evidence.ts`. It records 10 distinct catalog families and their source pages:
15AK, 24KD, 25AK, 36KD, 40KD, 501D, 602 and ORK 200A/350A/500A.

All 10 records currently remain `evidence_review`: they can help a buyer identify the catalog series
in an RFQ, but do not generate indexable series routes until exact product records, rights-approved
exact-product images and governed product-to-series relationships pass the publication gate. The
prepared 15AK candidate is retained, and its former URL temporarily redirects to the MIG/MAG
category while image evidence is collected. See `docs/product-series-readiness-report.md` for the
generated work queue.

## Plasma Consumable Evidence Review

The catalog visually identifies `Swirl Ring` as a consumable in several plasma torch assemblies on
PDF pages 22-23, including A-81, PT-31, CB-50, LT-50, TongChang60 and SG-51 references. This confirms
that plasma swirl rings are within the company catalog product range, but it does not confirm one
universal geometry or compatibility for `AF-PLA-SR-0009`.

PDF page 22 also uses `Stand off guide`, while the current website starter product is named `Plasma
Torch Spacer`. The two terms must not be treated as identical without a torch model, drawing or
sample. The catalog uses `Shield` for several torch-front parts; this is not sufficient evidence to
rename or confirm the current `Plasma Retaining Cap` starter SKU.

The catalog component thumbnails are too small to serve as professional exact-SKU main images.
Keep these three products on `needs_photo` until reviewed product photos are available.

## 24KD Component Evidence Review

PDF page 9 (catalog pages 11-12) has been decomposed into 68 field-level source records and 23
component/variant candidates in `data/evidence/product-series-component-facts.csv`. The candidates
include complete 3 m and 5 m torches, three nozzle profiles, seven contact-tip material/wire-size
variants, holder, two diffuser variants, swan neck, support spring, rear handle, adaptor nut, Euro
connector, connector nut and two liner lengths.

The catalog lists the complete torch at 100 A for CO2 and mixed gases, 35% duty cycle and 0.6-1.0 mm
wire. The official ABICOR BINZEL MB GRIP 24 KD catalog lists 250 A CO2, 220 A mixed gases, 60% duty
cycle and 0.8-1.2 mm wire. These three fields are retained as `DATA_CONFLICT` and `blocked`; neither
source is used as an ArcFort Weld specification. The exact supplied torch requires a factory
specification or controlled product evidence.

Use `data/intake/24kd-series-confirmation.csv` for factory confirmation and
`data/intake/24kd-image-intake.csv` for exact-product image collection. The 24KD evidence record stays
in `evidence_review`; it has no public series route or canonical component SKU mapping.

## 25AK Component Evidence Review

PDF page 10 (catalog pages 13-14) has been decomposed into 64 field-level source records and 21
component/variant candidates in `data/evidence/product-series-component-facts.csv`. The candidates
include complete 3 m and 5 m torches, three nozzle profiles, seven contact-tip material/wire-size
variants, tip holder, swan neck, support spring, rear handle, adaptor nut, Euro connector, connector
nut and two liner lengths. The company page does not show a gas diffuser in the 25AK front-end stack,
so none has been inferred.

The catalog lists the complete torch at 100 A for CO2 and mixed gases, 35% duty cycle and 0.6-1.0 mm
wire. The official ABICOR BINZEL MB GRIP 25 AK catalog lists 230 A CO2, 200 A mixed gases, 60% duty
cycle and 0.8-1.2 mm wire. These three fields are retained as `DATA_CONFLICT` and `blocked`; neither
source is used as an ArcFort Weld specification. The exact supplied torch requires a factory
specification or controlled product evidence.

Use `data/intake/25ak-series-confirmation.csv` for factory confirmation and
`data/intake/25ak-image-intake.csv` for exact-product image collection. The 25AK evidence record stays
in `evidence_review`; it has no public series route, compatibility relationship or canonical
component SKU mapping.

## 36KD Component Evidence Review

PDF page 11 (catalog pages 15-16) has been decomposed into 69 field-level source records and 24
component/variant candidates. The candidates include complete 3 m and 5 m torches, three nozzle
profiles, six contact-tip material/wire-size variants, three tip-holder lengths, two diffuser
variants, swan neck, support spring, rear handle, adaptor nut, Euro connector, connector nut and two
liner lengths.

The company catalog lists the complete torch at 340 A CO2 / 320 A mixed gases, while the official
ABICOR BINZEL MB GRIP 36 KD catalog lists 320 A CO2 / 290 A mixed gases. The company catalog also
lists the cylindrical nozzle opening as 19 mm in its main component table and 20 mm in its wear-parts
table. Both discrepancies are retained as `DATA_CONFLICT` with `blocked` lifecycle; no disputed value
is used as an ArcFort Weld specification.

Use `data/intake/36kd-series-confirmation.csv` for factory confirmation and
`data/intake/36kd-image-intake.csv` for exact-product image collection. The 36KD evidence record stays
in `evidence_review`; it has no public series route, compatibility relationship or canonical
component SKU mapping.

## 40KD Component Evidence Review

PDF page 12 (catalog pages 17-18) has been decomposed into 69 field-level source records and 24
component/variant candidates. The candidates include complete 3 m and 5 m torches, three nozzle
profiles, eight contact-tip material/wire-size variants, tip holder, two diffuser variants, swan
neck, support spring, rear handle, adaptor nut, Euro connector, connector nut and two liner lengths.

The company catalog lists 380 A CO2 / 360 A mixed gases and 60% duty cycle. The official ABICOR
BINZEL MB 40 KD manual lists 350 A CO2 / 320 A mixed gases and 35% duty cycle. Both fields are
retained as separate `DATA_CONFLICT` records with `blocked` lifecycle. The 1.0-2.4 mm wire range
matches both sources, but remains a request-based catalog reference until the exact supplied torch is
confirmed.

Use `data/intake/40kd-series-confirmation.csv` for factory confirmation and
`data/intake/40kd-image-intake.csv` for exact-product image collection. The 40KD evidence record stays
in `evidence_review`; it has no public series route, compatibility relationship or canonical
component SKU mapping.

## 501D Component Evidence Review

PDF page 13 (catalog pages 19-20) has been decomposed into 89 field-level source records and 29
component/variant candidates. The candidates include complete 3 m and 5 m water-cooled torches, six
nozzle profile/wall-thickness variants, seven contact-tip variants, two diffusers, two tip-holder
lengths, insulator, swan neck, support spring, rear handle, adaptor nut, Euro connector, connector
nut, two liners and a separately governed rear-media connection set.

The company catalog lists 380 A CO2 / 360 A mixed gases, 60% duty cycle and 1.0-2.4 mm wire. The
official ABICOR BINZEL MB GRIP 501 D reference lists 500 A CO2 / 450 A mixed gases, 100% duty cycle
and 1.0-1.6 mm wire. All three fields are retained as `DATA_CONFLICT` with `blocked` lifecycle;
neither source is used as an ArcFort Weld specification.

The catalog image visibly contains multiple neck and rear media leads, but it does not label every
coolant, gas, power or control function. The evidence therefore records only visible multiple-media
interfaces and requires a factory connection drawing. Hose color is not used to assign a function.

Use `data/intake/501d-series-confirmation.csv` for factory confirmation and
`data/intake/501d-image-intake.csv` for exact-product image collection. The 501D evidence record stays
in `evidence_review`; it has no public series route, compatibility relationship or canonical
component SKU mapping.

## Data Still Missing

- Confirmed exact model numbers and compatibility tables for each product family.
- Confirmed product dimensions, electrical ratings, material grades and surface treatments.
- Confirmed package quantity, MOQ by item and real lead time by item.
- Dedicated confirmed white-background product photos for each newly added product family. Temporary
  main images have been assigned from local product photos or Renqiu Ailesen catalog crops; see
  `docs/product-image-source-audit.md`.
- Public certifications, prices or stock status. These must not be invented.
