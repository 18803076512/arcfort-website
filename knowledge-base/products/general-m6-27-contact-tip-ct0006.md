# General M6 x 27 mm Contact Tip: AF-MIG-CT-0006

Review date: 2026-10-29. This is an internal evidence handoff, not a confirmed product specification or a new public series relationship.

## Identity and source boundary

`AF-MIG-CT-0006` is the active MIG contact tip M6 1.2 mm product record. Its existing `data/import/products.csv` row cites the Renqiu Ailesen welding catalog PDF page 20 (catalog page 33), where the general M6 x 27 mm contact-tip table includes 1.2 mm bore references and E-Cu / CuCrZr options. The product row's `source_type` remains `unknown`. This handoff retains that recorded source location; it does not independently verify the PDF or confirm the supplied SKU's final length, material or fit.

The [15AK series record](15ak-mig-mag-series.md) excludes this SKU. Its 25 mm contact-tip references, factory intake and four product relationships cannot be copied to CT0006 because the documented catalog grouping differs.
The [dated intake-boundary decision](../decisions/2026-10-29-general-m6-27-contact-tip-intake-boundary.md)
records the gate and the evidence required to change it.

## Separate factory confirmation queue

Use `data/intake/general-m6-27-contact-tip-technical-confirmation.csv`. Its four reference rows cover material options, wire bore, overall length and thread. All are `NEEDS_FACTORY_CONFIRMATION`; confirmed values, evidence decisions, reviewer and review date are blank. Stable intake IDs are review keys, not published technical fact IDs.

For each row, identify the exact physical SKU or variant and obtain a factory record, controlled drawing, approved sample or documented measurement. Preserve the catalog value in `reference_value`; place any verified result in `confirmed_value` with qualifying evidence type and reference, reviewer and ISO date. A disagreement is `DATA_CONFLICT` until reviewed. An intake response never updates `lib/data/product-technical-facts.ts` or the public product page automatically.

Before quoting fit, confirm the buyer's torch model, current contact-tip length, mating holder, wire size and supplied sample or drawing. Do not infer 15AK compatibility from the shared M6 thread or from a similar photo.

## Image and publication handoff

The existing main image is `legacy_reference`, `product_family_reference`, with unknown source owner and unconfirmed website-use rights in `data/assets/product-image-assets.csv`. Use its existing P0 row in `docs/product-image-tasks.csv` to collect the exact-product original and rights basis, rather than copying a 15AK image request into this technical queue. The current contact-tip images reuse identical family-reference content, so visual similarity cannot establish variant identity.

After real evidence is reviewed, the independent intake may record a qualifying `CONFIRMED` result
with the exact value, evidence reference, reviewer and date. A separate reviewed PR must then extend
the technical validator to reconcile CT0006 canonical facts against this independent queue, add only
supported facts to `lib/data/product-technical-facts.ts`, and review their public projection. The
current validator deliberately blocks an unmapped CT0006 fact; do not place it in the four-SKU 15AK
CSV to make that gate pass. Update the product record, compatibility registry and image asset registry
only for fields separately supported by evidence. Publication still requires the normal
product/media/compatibility gates.

Run `npm run technical:validate`, `npm run technical:report`, `npm run products:validate`, `npm run images:assets:validate` and `npm run compatibility:validate` after intake or evidence changes.
