# Product Menu In Short Desktop Windows

Date: 2026-11-25. Scope: the existing desktop Products menu below the sticky header.

## Reproduced Failure

At a 1280 x 400 CSS-pixel viewport, native Tab reached Torch Liners and Swan Necks wholly below the
visible window. Their positions stayed fixed while PageDown and wheel moved the document. The
absolute panel had no height bound or internal scroll area. At 1280 pixels wide its bottom link
clipped below a 512-pixel viewport height; the existing six-pixel focus outline needed 518 pixels.
Tall-window and separate mobile-menu controls did not show this failure.

## Decision

Bound the panel to the viewport space below the existing `--header-height` token. Retain a `100vh`
fallback and use `100dvh` when supported. Allow internal vertical scrolling, contain overscroll and
leave scroll padding for the existing keyboard focus ring. Preserve the natural panel height when
it already fits.

Keep all links, native details/summary interaction, hydration preservation, Escape/focus return and
the separate mobile menu. No JavaScript sizing listener, new component, dependency or URL change is
required.

## Verification Contract

Use actual keyboard navigation to the previously hidden link at 1280 x 400 and 1280 x 500. Verify
the whole link and focus outline are visible, wheel scrolling reaches the panel bottom without
moving the document, and Escape closes and returns focus. Retain 1280 x 720, 1440 x 900 and mobile
controls. Exercise delayed hydration with unchanged response bytes and verify the deployed menu
independently. Bounding-box visibility alone does not prove keyboard or scroll behavior.
