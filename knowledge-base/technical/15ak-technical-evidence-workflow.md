# 15AK Technical Evidence And Factory Intake Workflow

## Purpose

This workflow turns company-catalog references into governed field-level product data without
presenting an unverified catalog grouping as a confirmed ArcFort Weld SKU specification.

The current scope covers:

- AF-MIG-CT-0004 - MIG Contact Tip M6 0.8mm
- AF-MIG-CT-0005 - MIG Contact Tip M6 1.0mm
- AF-MIG-TH-0007 - MIG Tip Holder for MB15
- AF-MIG-GN-0008 - MIG Gas Nozzle for MB15

## Canonical Records

- `lib/data/product-technical-facts.ts` stores field value, unit, evidence, source level,
  verification status, reviewer and last verified date.
- `lib/content/product-technical-facts.ts` creates public specification rows and excludes
  `DATA_CONFLICT` records.
- `data/intake/15ak-technical-confirmation.csv` separates catalog references from returned factory
  values.
- `data/intake/15ak-product-image-intake.csv` tracks requested main, technical, dimensional and
  packaging images plus ownership and review evidence.

This exact-SKU workflow is separate from the 15AK catalog-component workflow. The latter uses
`data/intake/15ak-series-confirmation.csv` and `data/intake/15ak-image-intake.csv` for candidates that
do not yet have confirmed ArcFort Weld SKU mappings.

## Current Boundary

The 15 recorded technical facts come from the Renqiu Ailesen company catalog. They remain
`NEEDS_FACTORY_CONFIRMATION` because a catalog family table does not by itself prove the final value
for every ArcFort Weld SKU or supplied variant.

Public product pages may show these values as company-catalog references with a confirmation note.
They must not describe them as confirmed ArcFort Weld specifications.

## Factory Confirmation Steps

1. Open `data/intake/15ak-technical-confirmation.csv` without changing the reference columns.
2. Check the exact physical SKU against a factory record, controlled drawing, approved sample,
   verified reference number or measurement record.
3. Enter the confirmed value and unit, evidence type, evidence reference, reviewer and review date.
4. Set `verification_status` to `CONFIRMED` only when all evidence fields are complete.
5. Update the matching canonical technical fact deliberately; do not automate this evidence decision.
6. Run `npm run technical:validate` and `npm run technical:report`.

If the returned value conflicts with the catalog, retain both internally, set `DATA_CONFLICT` and
stop public projection until the conflict is resolved.

## Image Collection Steps

1. Follow each shot request in `data/intake/15ak-product-image-intake.csv` using the exact listed
   product.
2. Do not change thread, opening, geometry, color or product markings during editing.
3. Record source owner, permitted usage, original file name, reviewer and review date.
4. Move a row to `approved` only after the target file exists and depicts the exact product or variant.
5. Replace an existing supplier image only after the company-owned replacement passes review.

## Publication Gate

A technical fact can become confirmed only with Level A evidence tied to the exact SKU. An image can
become approved only with documented ownership and an existing reviewed asset. Compatibility remains
separately governed in `lib/data/compatibility-relationships.ts`; confirming a dimension does not
automatically confirm the complete product-to-series fit.
