# Mobile Product And RFQ Visual Hierarchy

Date: 2026-11-17

## Scope

The owner requested implementation of the homepage, product-center, product-detail and RFQ issues
found in the same-day visual review. This is a controlled presentation refinement of the existing
site. Product, media, compatibility, commercial, URL and publishing evidence gates remain unchanged.

This decision supplements the mobile layout interpretation of
[Product Presentation Phase 2](2026-08-21-product-presentation-phase-2.md); the desktop gallery and
product-summary arrangement, canonical identities and RFQ contracts remain in force. Detailed
visual rules remain in [the design system](../../docs/DESIGN_SYSTEM.md).

## Decisions

- Put the single product title and SKU before the gallery on small screens. Use one source of
  identity content and one H1; keep the useful desktop image-and-summary composition.
- Present category destinations compactly on mobile before the product catalog, preserving the
  finder, all category links and a direct path to the catalog.
- Shorten repeated homepage introductions and use product imagery and clear destinations to guide
  the page. Retain useful indexable content, evidence labels and buyer paths.
- Bring dedicated RFQ fields forward with a compact page introduction, empty-list summary and
  optional starters. Keep populated line-item controls and submission/failure information intact.
- Use the existing shared primary-action styling for RFQ submission, including its disabled,
  pending and success actions. No provider, validation, deadline or idempotency behavior changes.
- Standardize image frames and proportions without altering source pixels or product geometry.
  A cleaner frame does not prove exact identity, rights, factory ownership or technical fit.

## Source Boundaries And Remaining Inputs

The existing public product images remain governed references. No generated image, similar-looking
item or representative industrial scene may replace a pending exact-product or company-evidence
requirement. Original SKU-specific photography, connection details, source ownership, website-use
rights, reviewer and date remain required before replacement through the
[media workflow](../assets/product-image-governance.md).

The four-product evidence handoff is documented in
[the 15AK factory guide](../../docs/operations/15ak-factory-evidence-handoff.md). CT0006 remains in
its independent evidence queue. Public-data state and image publication state are not promoted by
this layout work.

## Validation And Reversal

Verify the four page families at 360, 390, 768, 1024, 1280 and 1440 pixels. Compare product-identity,
catalog and first-RFQ-field placement with the dated before capture; check overflow, image loading,
readable captions, keyboard controls, native form states and existing RFQ prefill paths. Run the
applicable build, lint, type, SEO, image-evidence, performance and secret checks before release.

Before/after screenshots and exact candidate/release receipts belong in non-public operational
artifacts and the corresponding PR; they are not conversion-rate or real-device claims. If a
layout regression appears, revert the scoped UI commit through the authorized repository release
workflow while preserving product and evidence data.
