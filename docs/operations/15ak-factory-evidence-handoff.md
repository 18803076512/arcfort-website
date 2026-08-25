# 15AK Factory Evidence Handoff

## Purpose

The ArcFort Weld 15AK Factory Evidence Intake workbook is an internal collection aid for four
priority public products:

- AF-MIG-CT-0004 - MIG Contact Tip M6 0.8mm
- AF-MIG-CT-0005 - MIG Contact Tip M6 1.0mm
- AF-MIG-TH-0007 - MIG Tip Holder for MB15
- AF-MIG-GN-0008 - MIG Gas Nozzle for MB15

It also contains P0 provenance decisions for AF-MIG-CT-0006 because the active 1.2 mm contact-tip
image shares the same unknown-source risk as the 0.8 mm and 1.0 mm references.

The workbook is not a product database and must not publish or confirm data automatically. The CSV
files in `data/intake/` and the governed registries remain the repository source of truth.

The catalog also contains two broader 15AK assembly forms. Their 46 component and variant candidates
are maintained separately in `data/intake/15ak-series-confirmation.csv` with 58 image requests in
`data/intake/15ak-image-intake.csv`. Those rows are not public SKUs and are not represented by the
four-product workbook unless a reviewer deliberately adds a corresponding evidence task.

## Workbook Sections

### Review Summary

Shows unresolved P0 provenance decisions, confirmed technical-fact count and approved image-request
count. The values are formulas linked to the working sheets.

### Technical Facts

Contains 15 company-catalog reference values and blank reviewer fields. A row may move to
`CONFIRMED` only when all of these are present:

1. Confirmed value and unit where applicable.
2. Qualifying evidence type.
3. Specific evidence reference.
4. Reviewer name.
5. ISO review date.

Use `DATA_CONFLICT` when evidence disagrees. Do not choose a convenient value.

### Image Evidence

Contains 20 requested views across the four products. Record the original file, source owner,
website-use basis, review status, reviewer and date. Main, connection, dimensional and packaging
views must identify the same exact SKU or approved physical variant.

### P0 Image Decisions

Contains four active main images with unknown provenance. Choose one controlled decision:

- Replace the asset with a company-owned or rights-approved exact-product image.
- Approve the existing asset only after source, owner, usage basis and exact-SKU evidence are real.
- Retire the asset and hold the product from image-led publication.
- Keep `Needs review` until evidence is available.

## Accepted Evidence

Use one or more of these sources:

- Factory product record for the exact SKU.
- Controlled drawing for the exact supplied variant.
- Approved physical sample with recorded measurement or comparison.
- Documented measurement record tied to the exact SKU.
- Original company-owned product photo.
- Supplier photo with documented website-use permission and exact-product match.

A company catalog is valid reference context but does not, by itself, confirm every ArcFort Weld SKU
field or compatibility relationship.

## Controlled Repository Update

After a product or factory reviewer completes the workbook:

1. Review every completed row against the attached or referenced evidence.
2. Transfer accepted technical responses to `data/intake/15ak-technical-confirmation.csv`.
3. Transfer accepted image responses to `data/intake/15ak-product-image-intake.csv`.
4. Transfer catalog-component responses to the series files only when the evidence names the exact
   assembly candidate; do not substitute a similarly named public SKU.
5. Update `data/assets/product-image-assets.csv` only after source, rights and exact-product review.
6. Update canonical product or compatibility data deliberately; do not copy unreviewed workbook
   fields into public product records.
7. Run:

```bash
npm run technical:validate
npm run technical:report
npm run series:components:validate
npm run series:components:report
npm run images:assets:validate
npm run products:image-tasks
npm run images:assets:report
npm run compatibility:validate
npm run products:validate
npm run products:report
npm run seo:audit
npm run lint
npm run typecheck
npm run build
```

8. Review the diff and confirm that no draft, candidate, conflict or unverified relationship became
   indexable.

## Prohibited Shortcuts

Do not infer dimensions, threads, material grades, OEM numbers, compatibility, packaging quantities,
ratings or certification from appearance. Do not remove watermarks or conceal image provenance. Do
not change product threads, holes, dimensions, connections or shape during image editing.
