# ArcFort Weld Search Console Baseline

Evidence baseline: 2026-08-12 export; repository review 2026-10-29

## Source

The governed numeric baseline is stored in
`docs/operations/acquisition-production-evidence.json`. The owner supplied the external export named
`arcfortweld.com-Performance-on-Search-2026-08-12.xlsx`; the workbook is not a repository runtime
dependency and may contain account-specific context, so this knowledge record retains only the
aggregate evidence required for comparison.

## Recorded Period

- Search property: `arcfortweld.com`
- Data period: 2026-06-26 through 2026-08-09
- Clicks: 8
- Impressions: 422
- CTR: 1.90%
- Earliest planned comparable review: 2026-09-12

These values are a historical baseline, not a claim about current performance. No ranking position,
query growth, conversion or indexing conclusion should be inferred without the matching export and
date range.

The internal reports flag Search Console performance as a historical baseline when the recorded
data-end date is more than 35 days before the production evidence date. The 35-day review threshold
is a 28-day comparison window plus seven days to export and review; it is an internal prompt to
refresh evidence, not a Google indexing or data-finalization guarantee. A new production HTTP check
does not refresh the Search Console data period.

## Next Native Search Console Export

Use the `arcfortweld.com` domain property in Google Search Console directly. Export a complete,
dated 28-day Performance period and its comparable prior period with the property, search type and
filters recorded. Retain the property totals for clicks, impressions and CTR separately from any
query/page tables; truncated rows must not be summed into a property total. Include the query and
page views needed to prioritize existing buyer pages. For the separate “Redirect error” indexing
reason, export the actual example URLs, current validation state and last crawl dates, then inspect
the exact URLs before proposing a redirect change.

Store only reviewed aggregates and dates in the repository evidence record. Keep raw exports in an
owner-controlled location and avoid account identifiers or buyer data in public reports. Update
`docs/operations/acquisition-production-evidence.json` only after the native export is checked, then
regenerate both reports. Until that happens, current search traffic and indexing status remain
unknown even while the public pages pass HTTP crawl checks.

## Current Evidence Boundary

- The production site and sitemap were verified separately in the acquisition evidence record.
- Search Console sitemap submission remains owner-side and is not confirmed in repository evidence.
- GA4 real-time operation and RFQ conversion-event evidence remain unconfirmed.
- Query-level and landing-page decisions require a fresh export; generic keyword production should
  not replace product, series, compatibility and commercial-page priorities.

## Next Review

1. The 2026-09-12 comparable-review date has passed. Export the same Search Console dimensions for
   a new clean comparable date range.
2. Preserve clicks, impressions, CTR, average position, query and landing-page dimensions without
   buyer PII.
3. Compare like-for-like periods and separate brand, product, category and guide intent.
4. Record cannibalization or indexing decisions in `knowledge-base/decisions/` before changing URLs.
5. Update the production evidence JSON and regenerate the acquisition and Goal progress reports.
