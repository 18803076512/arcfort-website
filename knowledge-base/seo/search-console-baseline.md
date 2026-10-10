# ArcFort Weld Search Console Baseline

Evidence baseline: 2026-08-12 export; repository review 2026-09-01

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

## Current Evidence Boundary

- The production site and sitemap were verified separately in the acquisition evidence record.
- Search Console sitemap submission remains owner-side and is not confirmed in repository evidence.
- GA4 real-time operation and RFQ conversion-event evidence remain unconfirmed.
- Query-level and landing-page decisions require a fresh export; generic keyword production should
  not replace product, series, compatibility and commercial-page priorities.

## Next Review

1. Export the same Search Console dimensions for a clean comparable date range on or after
   2026-09-12.
2. Preserve clicks, impressions, CTR, average position, query and landing-page dimensions without
   buyer PII.
3. Compare like-for-like periods and separate brand, product, category and guide intent.
4. Record cannibalization or indexing decisions in `knowledge-base/decisions/` before changing URLs.
5. Update the production evidence JSON and regenerate the acquisition and Goal progress reports.
