# Product Center Anchor Clearance

Date: 2026-11-17

## Evidence

Read-only production clicks on Find Products, Browse Categories and View product catalog reproduced
headings hidden by the 77px sticky header. At 390px, the three H2 tops were approximately 32px, 32px
and 63px; the finder and category headings were also obscured at 1440px. The native fragment links
aligned their sections with the viewport top without allowing for the header.

## Decision

Apply the existing Tailwind `scroll-mt-24` spacing token (96px) consistently to the product finder,
product categories and product catalog sections. Keep native fragment navigation and the existing
section spacing. This supplements the
[mobile product hierarchy](2026-11-17-mobile-product-and-rfq-hierarchy.md) and preserves the
[finder navigation state contract](2026-11-17-product-finder-navigation-state.md).

The offset is local to these three destinations. It changes neither the global header/layout nor
anchor IDs, query parameters, applied-filter identity, product/media data or SEO contracts.

## Verification And Reversal

Click the three existing links at 360, 390, 768, 1024, 1280 and 1440px. Wait for smooth scrolling to
finish, then compare each H2 bounding rectangle with the header bottom and viewport bounds. Retain
screenshots and measured production-before/local-candidate results separately. A computed CSS value
alone does not prove the heading is visible.

If header height changes, repeat those actual-click checks before changing the offset. Revert only
the scoped offset if it regresses navigation; preserve the earlier finder-state repair and all
product, evidence and route records.
