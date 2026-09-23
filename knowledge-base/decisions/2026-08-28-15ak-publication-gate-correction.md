# 15AK Series Publication Gate Correction

## Decision

Hold the prepared 15AK MIG/MAG series candidate in `evidence_review` and remove it from the public
series collection until its linked products satisfy the exact-image publication gate.

## Evidence

The previous evidence record used `published` and `reviewed_product_images`, but the four linked
product records resolve to image assets with `legacy_reference`, `product_family_reference` and
`needs_confirmation` usage-rights states. Those assets are useful migration references but do not
prove exact-product identity or approved website usage.

The four product-to-series relationships remain governed `reference_only` records. They preserve the
catalog association but do not prove final fit.

## Implementation Boundary

- Keep the complete 15AK candidate content and stable slug.
- Change evidence state to `evidence_review` and image state to `needs_photos`.
- Exclude the candidate from Sitemap, navigation, product reverse links and static series output.
- Temporarily redirect the former series URL to the MIG/MAG category instead of returning 404.
- Evaluate future publication from canonical product, image-asset and compatibility registries.

## Republication Requirements

1. Every linked product has a canonical active record.
2. Every linked product has a main image marked `search_eligible` and `exact_product`.
3. Usage rights are `approved` with source owner, source file, reviewer and review date.
4. Every product-to-series relationship remains governed and is not `unverified` or
   `DATA_CONFLICT`.
5. Series, compatibility, image, SEO, responsive and production-build checks pass.

Do not restore the page only for SEO value. Evidence approval must come first.
