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

| SKU | Product | Website Category | PDF Evidence | Public Data Status |
| --- | --- | --- | --- | --- |
| AF-MIG-MT-0031 | MIG/MAG Welding Torch | MIG/MAG Torch Parts | PDF pages 4-18 - MIG/MAG torch assemblies and exploded torch part tables are visible across the MIG/MAG section. | needs_review |
| AF-MIG-MS-0032 | MIG Torch Switch | MIG/MAG Torch Parts | PDF pages 19-21 - Torch switch and small MIG/MAG replacement accessories are visible in the late MIG/MAG section. | needs_review |
| AF-MAC-WF-0033 | Wire Feeder | Welding Machines | PDF pages 19-20 and 39-40 - Wire feeder units and wire feeder accessories are visible in the catalog. | needs_review |
| AF-PLA-PT-0034 | Plasma Cutting Torch | Plasma Cutting Consumables | PDF pages 22-24 and 55-57 - Plasma torch assemblies and plasma consumable groups are visible in plasma sections. | needs_review |
| AF-TIG-TT-0035 | TIG Welding Torch | TIG Torch Parts | PDF pages 25-37 - TIG torch assemblies, exploded diagrams and TIG accessory tables are visible in the TIG section. | needs_review |
| AF-TIG-TS-0036 | TIG Torch Switch | TIG Torch Parts | PDF page 37 - TIG torch handles and switch-related accessory images are visible near the end of the TIG section. | needs_review |
| AF-MAC-SG-0037 | Stud Welding Gun | Welding Machines | PDF page 37 - Stud welding gun products are visible in the catalog. | needs_review |
| AF-ACC-SA-0038 | Stud Welding Accessories | Welding Accessories | PDF pages 37 and 58 - Stud welding accessories and small copper accessory groups are visible in catalog sections. | needs_review |
| AF-ACC-RT-0039 | Robot Welding Torch | Welding Accessories | PDF pages 48-54 - Robot welding torch assemblies and related torch parts are visible in the robot section. | needs_review |
| AF-CON-SE-0040 | Spot Welding Electrode | Welding Consumables | PDF page 58 - Spot welding electrode and cap series are visible on the accessories summary page. | needs_review |
| AF-ACC-FA-0041 | Wire Feeder Accessories | Welding Accessories | PDF pages 39-41 - Wire feeder accessories, connectors and feeder-related components are visible in the catalog. | needs_review |
| AF-ACC-PC-0042 | Welding Protective Cover | Welding Accessories | PDF page 58 - Rubber house, canvas hose, leather house, dust prevent cover and protective cover items are visible. | needs_review |
| AF-ACC-FM-0043 | CO2 Flowmeter | Welding Accessories | PDF page 58 - CO2 flowmeter item is visible on the accessories summary page. | needs_review |

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

## Data Still Missing

- Confirmed exact model numbers and compatibility tables for each product family.
- Confirmed product dimensions, electrical ratings, material grades and surface treatments.
- Confirmed package quantity, MOQ by item and real lead time by item.
- Dedicated confirmed white-background product photos for each newly added product family. Temporary
  main images have been assigned from local product photos or Renqiu Ailesen catalog crops; see
  `docs/product-image-source-audit.md`.
- Public certifications, prices or stock status. These must not be invented.
