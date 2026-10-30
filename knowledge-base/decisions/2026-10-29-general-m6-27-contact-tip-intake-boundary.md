# General M6 x 27 mm Contact Tip Intake Boundary

Date: 2026-10-29. Scope: internal evidence collection for `AF-MIG-CT-0006`; no public product, image, compatibility or series promotion.

## Decision

Keep `AF-MIG-CT-0006` in a separate technical confirmation queue. The four public products governed by the 15AK exact-SKU intake remain unchanged. CT0006 intake values are catalog references under `NEEDS_FACTORY_CONFIRMATION`; they do not create canonical field-level technical facts or confirm the supplied SKU's dimensions, material or fit.

The technical validator rejects a CT0006 row in the 15AK intake and rejects an unmapped CT0006 canonical fact. This is an intentional review gate. It prevents a similar product name from moving the general M6 x 27 mm reference into the 15AK 25 mm scope through a routine data update.

## Evidence and existing decision

- `data/import/products.csv` records a catalog PDF page 20 (catalog page 33) general M6 x 27 mm reference with 1.2 mm bore and E-Cu / CuCrZr options. The row's `source_type` is `unknown`; this decision does not independently authenticate the PDF or the supplied exact SKU.
- `knowledge-base/products/15ak-mig-mag-series.md` explicitly excludes the general 1.2 mm contact tip from its four governed reference-only relationships.
- The earlier [15AK publication gate correction](2026-08-28-15ak-publication-gate-correction.md) keeps that series out of publication until exact images and relationship evidence pass review.
- `data/assets/product-image-assets.csv` marks the existing CT0006 image `legacy_reference`, with unresolved owner, usage rights and exact match.

## Deliberate promotion path

1. Match a factory record, controlled drawing, approved sample or measurement record to the exact CT0006 SKU and physical variant.
2. Preserve each original catalog reference in the independent intake. Record a different measured value separately; use `DATA_CONFLICT` when credible evidence disagrees.
3. A `CONFIRMED` intake result requires a qualifying exact-SKU evidence type and reference, actual reviewer and ISO review date. Those fields are blank in the current queue.
4. In a separate reviewed PR, extend the technical validator's fact-to-intake reconciliation to this independent queue before adding any canonical technical fact or public projection. Rerun technical, product, media, compatibility, SEO and release checks for affected data.
5. Review image ownership, website-use rights and exact match separately. Review any compatibility relationship separately; neither follows from a matching thread or catalog image.

Do not copy a 15AK 25 mm value, shared family image or reference-only fitment to CT0006 to pass a check.

## Reversal condition

If later controlled evidence establishes a different CT0006 identity, dimension or 15AK relationship, record a dated superseding decision with the exact source and reviewer before changing this boundary. A changed catalog interpretation alone does not confirm the supplied SKU.
