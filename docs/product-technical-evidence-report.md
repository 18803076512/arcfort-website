# Product Technical Evidence Readiness Report

This internal report separates company-catalog references from confirmed ArcFort Weld SKU specifications. Catalog values remain reference data until the exact SKU is supported by a factory record, controlled drawing, approved sample, verified reference or measurement record.

## Summary

- Governed products: 4
- Field-level technical facts: 15
- Confirmed technical facts: 0
- Facts needing factory confirmation: 15
- Data conflicts: 0
- Completed factory confirmation rows: 0 of 15
- Approved company-owned image requests: 0 of 20

## Technical Fact Matrix

| SKU            | Product                  | Field                      | Catalog reference | Verification               | Source                                                                                                        |
| -------------- | ------------------------ | -------------------------- | ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| AF-MIG-CT-0004 | MIG Contact Tip M6 0.8mm | Material options           | E-Cu / CuCrZr     | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table, 0.8 mm references. |
| AF-MIG-CT-0004 | MIG Contact Tip M6 0.8mm | Wire size reference        | 0.8 mm            | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table, 0.8 mm row.        |
| AF-MIG-CT-0004 | MIG Contact Tip M6 0.8mm | Overall length reference   | 25 mm             | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table.                    |
| AF-MIG-CT-0004 | MIG Contact Tip M6 0.8mm | Thread reference           | M6                | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table.                    |
| AF-MIG-CT-0005 | MIG Contact Tip M6 1.0mm | Material options           | E-Cu / CuCrZr     | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table, 1.0 mm references. |
| AF-MIG-CT-0005 | MIG Contact Tip M6 1.0mm | Wire size reference        | 1.0 mm            | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table, 1.0 mm row.        |
| AF-MIG-CT-0005 | MIG Contact Tip M6 1.0mm | Overall length reference   | 25 mm             | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table.                    |
| AF-MIG-CT-0005 | MIG Contact Tip M6 1.0mm | Thread reference           | M6                | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), M6 x 25 mm contact-tip table.                    |
| AF-MIG-TH-0007 | MIG Tip Holder for MB15  | Overall length reference   | 42 mm             | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK contact-tip holder drawing.                 |
| AF-MIG-TH-0007 | MIG Tip Holder for MB15  | Contact-tip side thread    | M6                | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK contact-tip holder drawing.                 |
| AF-MIG-TH-0007 | MIG Tip Holder for MB15  | Torch-neck side thread     | M8 x 1 LH         | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK contact-tip holder drawing.                 |
| AF-MIG-GN-0008 | MIG Gas Nozzle for MB15  | Overall length reference   | 53 mm             | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK nozzle drawing and table.                   |
| AF-MIG-GN-0008 | MIG Gas Nozzle for MB15  | Cylindrical nozzle opening | 16 mm             | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK cylindrical nozzle reference.               |
| AF-MIG-GN-0008 | MIG Gas Nozzle for MB15  | Conical nozzle opening     | 12 mm             | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK conical nozzle reference.                   |
| AF-MIG-GN-0008 | MIG Gas Nozzle for MB15  | Tapered nozzle opening     | 9.5 mm            | NEEDS_FACTORY_CONFIRMATION | Renqiu Ailesen welding catalog PDF page 8 (catalog page 10), 15AK tapered nozzle reference.                   |

## Factory Confirmation Intake

Use `data/intake/15ak-technical-confirmation.csv`. Do not overwrite the catalog-reference columns. Complete the confirmed value, evidence type, evidence reference, reviewer and review date only after checking the exact SKU.

A row may move to `CONFIRMED` only when it has a confirmed value and qualifying Level A evidence. A company catalog grouping by itself remains `NEEDS_FACTORY_CONFIRMATION`.

### Intake Status

- NEEDS_FACTORY_CONFIRMATION: 15

## Product Image Intake

Use `data/intake/15ak-product-image-intake.csv`. Main, connection/detail, dimensional and packaging images are requested separately so one visually similar photo cannot be used as evidence for every variant.

### Image Status

- requested: 20

### Requests By Product

| SKU            | Product                  | Requested assets | Approved assets |
| -------------- | ------------------------ | ---------------: | --------------: |
| AF-MIG-CT-0004 | MIG Contact Tip M6 0.8mm |                5 |               0 |
| AF-MIG-CT-0005 | MIG Contact Tip M6 1.0mm |                5 |               0 |
| AF-MIG-TH-0007 | MIG Tip Holder for MB15  |                5 |               0 |
| AF-MIG-GN-0008 | MIG Gas Nozzle for MB15  |                5 |               0 |

## Confirmation Gate

1. Confirm the exact SKU and physical variant; do not confirm a whole product family from appearance.
2. Record the measured or factory-approved value and its unit without replacing the catalog reference.
3. Attach or identify the factory record, controlled drawing, approved sample, verified reference or measurement record.
4. Record reviewer and review date, then update the canonical technical fact deliberately.
5. For images, record source owner and usage rights before changing an asset to `approved`.
6. Run `npm run technical:validate`, `npm run technical:report`, product checks and the production build.

## Current Evidence Gaps

- The 15AK product-to-series relationships remain reference-only.
- No field-level fact in this registry has factory, controlled-drawing, approved-sample or measurement confirmation yet.
- Company-owned main, detail, dimensional and packaging image sets have not been approved for these four products.
- Series-specific insulator, spring, swan-neck and liner SKU mapping still requires source evidence.
