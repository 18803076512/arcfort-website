# Distributor Workbook Quantity Association

Date: 2026-11-26. Scope: the existing public distributor RFQ workbook's quantity counter.

## Reproduced Problem

In `Start Here`, B7 counts product-name cells C7:C66 while B8 independently counts numeric trial
quantities I7:I66. C8 compares those totals. With three named products, moving one product's
quantity to an unnamed row leaves both totals at three and incorrectly displays `Ready`.
LibreOffice headless recalculation reproduced the complete, missing and compensating-orphan cases.
This is a local synthetic workbook observation, not an actual buyer or sales outcome.

## Decision

Count numeric trial quantities only when the same product row has a nonempty name. Use the
existing, broadly supported `SUMPRODUCT` and `ISNUMBER` functions for the complete row range.
Preserve B7, C8 and all other formulas, labels, dropdowns, formatting and worksheets. C8's existing
zero-product branch remains a per-counter state; C7 separately prompts the buyer to add products.

This corrects row association without introducing a new quantity, unit or quotation policy.
Numeric zero/negative values retain their prior counter behavior; numeric text still needs numeric
entry. Spreadsheet engines can coerce logical cells differently, so retain the actual native
observations without claiming cross-engine input validation. A quantity counter never verifies a
product, unit, specification, fit, price, commercial term or quotation readiness as a whole. Human
supplier review remains required.

The four public XLSX files are maintained artifacts; the existing download generator generates
CSV files. Add a scoped standard-library maintenance tool for this distributor formula. Its
default/check operation is read-only; explicit write repairs only the recognized old formula,
preserves unrelated ZIP part payloads and metadata, and refuses unexpected source formulas.
This is a surgical repair, with no new package dependency or full-workbook regeneration.

## Validation And Boundaries

Verify the actual distributed file, not only a separate implementation of the intended formula.
Require native spreadsheet recalculation on isolated synthetic copies for missing, compensating
orphan, extra orphan, sparse/last-row and numeric/text/formula cases. Verify only the intended
worksheet formula changes, all other ZIP parts and public downloads are preserved, and default
checking, unknown-source refusal and repeat repair are safe. Integrate the maintenance regression
into the existing distributor test and run the applicable RFQ/upload, build, lint/type, performance,
SEO and secret gates. Bind exact PR/main CI, Production and the live workbook download hash.

Native validation records the actual engine/version. It does not prove every Excel, WPS or mobile
client, nor does a local file edit submit an RFQ. Keep the shipped template blank and use synthetic
copies only for recalculation. No product, evidence, source, right, hosted record or account setting
is confirmed or changed by this repair.

Rollback follows the existing authorized repository/main and official-site release workflow.
Withhold a repair that changes unrelated workbook content or restores independent quantity counts.
