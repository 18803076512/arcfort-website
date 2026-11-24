# Analytics Referrer Boundary

Finding and baseline date: 2026-11-20; release verification resumed on 2026-11-24.
This is website-side preparation for an owner-controlled GA4 stream.
It does not create a property, enable production analytics or change consent/account settings.

## Observed Gap

The existing tag configuration and manual page views sanitize the current page location, but
neither explicitly supplied `page_referrer`. Google's
[configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config#page_referrer),
checked on November 20, defines that field's default as the browser's `document.referrer` and
supports a stream-level override. Under the site's `strict-origin-when-cross-origin` policy,
same-origin hard navigation can retain a source URL's search parameters in that browser value.
Cleaning only the destination location leaves a separate source-URL boundary uncovered.

Production GA4 was inactive in the November 20 read-only health check. This finding is a
pre-activation code gap, not evidence that real buyer data reached an analytics provider.

## Shared Rule

`AnalyticsTracker` and `trackAnalyticsPageView` both use the existing `sanitizeReferrerOrigin`
rule from `lib/source-attribution.ts`. A valid HTTP(S) referrer becomes its origin; a direct,
invalid or unsupported-protocol referrer becomes an explicit empty string. Supplying that empty
value matters: omitting the parameter would leave the provider's documented default in effect.
Paths, queries, fragments and URL credentials are not carried in this field.

The stream configuration covers ordinary custom events; explicit manual page views carry the
same bounded field. This deliberately retains coarse referring-domain information rather than
previous-page detail. The existing allowlisted campaign location policy remains unchanged.

## Verification And Limits

Use actual source components in an isolated local browser fixture with a synthetic measurement
ID, synthetic source-URL markers and a stubbed Google-tag boundary. Show that a same-origin hard
navigation retains the marker in `document.referrer`, while the corrected configuration and page
view contain only the origin. Cover valid external origins, direct/invalid referrers, consent
denial/grant and the unconfigured state. Block external requests and RFQ submissions.

Passing that fixture verifies the website's tag commands; it is not a Google network receipt,
DebugView observation, end-to-end lead test or production stream activation. Actual account
settings, enhanced-measurement review and consent-aware collection still require their own
owner-controlled acceptance. The existing activation instructions and single `generate_lead`
key-event rule remain in force.

No product facts, image rights, public URLs, metadata, schema, RFQ delivery policy or private
ledger records change. DMARC, current native GSC data, exact-product evidence and the unrelated
intermittent private document-refresh cause remain separate open items.
