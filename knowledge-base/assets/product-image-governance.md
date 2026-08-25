# Product Image Governance

## Purpose

ArcFort Weld product images are buyer evidence, not decoration. This workflow keeps product identity,
image provenance, usage rights and search publication decisions separate from the product CSV so a
file cannot become trusted merely because it exists in `public/images/products/`.

## Canonical Files

- `data/import/products.csv`: product assignment and requested main/gallery paths.
- `data/assets/product-image-assets.csv`: canonical evidence and publication status for each path.
- `lib/data/product-image-assets.ts`: generated runtime registry; never edit manually.
- `docs/product-image-asset-report.md`: generated replacement and evidence queue.
- `docs/product-image-source-audit.md`: historical source-review notes.

## Evidence Dimensions

Each asset records separate answers to four questions:

1. Where did the file come from (`source_kind`, source reference and original file)?
2. Who owns or supplied it (`source_owner`, `ownership_status`)?
3. Is its website use approved (`usage_rights_status`)?
4. Does it show the exact SKU or only a product family (`content_match_status`)?

Do not infer one answer from another. A company catalog crop can have traceable provenance but still
need a usage decision and an exact-SKU replacement. A visually correct supplier image can still have
unknown rights. A high-resolution image can still depict the wrong variant.

## Publication States

- `search_eligible`: exact-product image with approved usage basis, known source/owner, reviewer and
  review date.
- `legacy_reference`: pre-existing public reference retained during migration; rights or exact match
  are unresolved.
- `display_only`: bounded buyer-facing reference excluded from search metadata.
- `blocked`: excluded from product cards, galleries and search metadata.

The runtime accepts `legacy_reference` in existing product displays and search metadata only to avoid
an uncontrolled removal of already published images. This is a migration policy, not a target state.
New assets must not enter through `legacy_reference` as a shortcut.

## Replacement Workflow

1. Confirm the SKU and product family using the physical label, controlled drawing, dimensions or a
   reviewed sample.
2. Collect a dedicated main view plus connection/detail, dimensional and packaging views where they
   help a buyer verify fit.
3. Preserve geometry. Do not alter threads, holes, dimensions, shape, connections or markings.
4. Record the original file, source owner and written/company-owned usage basis.
5. Update the canonical path in the product CSV and its asset-registry row together.
6. Set exact match and approved rights only when evidence supports both.
7. Add reviewer and ISO review date, then move the asset to `search_eligible`.
8. Generate, validate, report, build and visually inspect the affected product family.

## Commands

```bash
npm run products:validate
npm run products:check-images
npm run images:assets:sync
npm run images:assets:generate
npm run images:assets:validate
npm run images:assets:report
npm run seo:audit
npm run build
```

`images:assets:sync` only appends product paths that are missing from the registry and preserves all
existing evidence. A changed main path can intentionally cause an asset-ID conflict; update that
existing row manually so source history is reviewed instead of silently replaced.

## Current Migration Baseline

As of 2026-08-21, the registry covers 46 image references across 43 products. Existing active images
remain `legacy_reference`; the three missing-photo product assets remain `blocked`. No asset has yet
been promoted to company-owned, exact-product and rights-approved `search_eligible` status. Use the
generated report for the live counts and work queue rather than copying these numbers into public
content.
