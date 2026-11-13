# Search Console Alert Triage - 2026-11-13

Scope: the English international B2B website at `https://www.arcfortweld.com`.
Repository checkpoint: `main` at `9665fa5`. This record distinguishes native Google notifications,
current website behavior and the affected-URL evidence that is still missing.

## Native Notification Evidence

The connected mailbox contains these Google Search Console transaction notices. Only the business
facts below are retained; mail headers, recipient details, account IDs and tracking links are omitted.

| Notice date (UTC)       | Reported reason                      | What the notice establishes                         | Missing evidence                                                    |
| ----------------------- | ------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------- |
| 2026-11-09 08:51:35 UTC | Excluded by noindex; Not found (404) | Google notified the owner of these indexing reasons | Example URLs, affected counts, last crawl, current validation state |
| 2026-10-22 07:52:14 UTC | Redirect error                       | Google sent a separate redirect-error notice        | Example URLs, affected count, last crawl, current validation state  |

The November notice has no attachment and its body does not list affected website URLs. A later
mailbox check on November 13 returned no newer notice. Notice dates are not crawl dates. Neither
notice refreshes the native Performance export, whose daily data still ends on 2026-08-09.

The October notice and the separate 48-URL validation notice remain historical evidence in
[the October follow-up](indexing-follow-up-2026-10-25.md). A validation notice does not establish
that every affected page is indexed or ranking.

## Current Technical Evidence And Intended URLs

The November 13 GET/HEAD audit passed 88 sitemap URLs, 82/82 reachable HTML pages, 40/40 product
inquiry paths, registered redirects and the six missing-route families. The audit rejects noindex
sitemap pages, wrong canonical/status signals and non-indexable redirect destinations. It does not
read Google's index or identify the URLs behind these notices.

These targeted checks also observed the following intended behavior:

| URL path                                                    | Observed behavior                          | Intent and next action                                                                  |
| ----------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| `/products`                                                 | 200; index/follow                          | Keep the canonical commercial product center and its product/RFQ links                  |
| `/products?q=AFMIGCT0005`                                   | 200; noindex/follow; canonical `/products` | Keep filtered search results out of the index; preserve buyer search and RFQ navigation |
| `/downloads/arcfort-public-product-list.csv`                | 200; `X-Robots-Tag: noindex`               | Keep the downloadable CSV available without treating it as a competing landing page     |
| `/console`                                                  | 200; noindex/nofollow/noarchive            | Keep the private workbench excluded                                                     |
| `/products/plasma-cutting-consumables/plasma-retaining-cap` | 404; noindex; no canonical                 | Hold the draft product until its publication gates pass                                 |
| `/products/welding-accessories/welding-magnet`              | 404; noindex; no canonical                 | Hold the draft product until its publication gates pass                                 |
| `/products/tig-torch-parts/tig-torch-switch`                | 308 to the existing compatibility guide    | Keep the governed historical redirect                                                   |

These paths are examples of deliberate exclusions and redirects, not a claimed match to Google's
affected-URL list. No accidental noindex or 404 was reproduced on the current public sitemap pages.
That finding does not close any Google issue. No query cluster or new landing page is proposed from
the notification alone; current search demand remains unknown.

Implementation references: `app/(public)/products/page.tsx`, `next.config.ts`,
`content/products.ts`, `lib/content/product-redirects.ts` and `scripts/audit-live-seo.ts`.

## Canonical Host And Redirect Chains

An additional bounded read-only check covered four origins and these eight paths: 32/32 cases
reached the expected `https://www.arcfortweld.com` target with final HTTP 200, without loops,
unexpected hosts or request errors.

| Source path                                                     | Expected final path             | Group        |
| --------------------------------------------------------------- | ------------------------------- | ------------ |
| `/`                                                             | `/`                             | Direct       |
| `/products`                                                     | `/products`                     | Direct       |
| `/products/mig-mag-torch-parts/mig-contact-tip-m6-0-8mm`        | Same path                       | Direct       |
| `/products/mig-torch-parts`                                     | `/products/mig-mag-torch-parts` | Legacy alias |
| `/products/mig-torch-parts/mig-contact-tip`                     | `/products/mig-mag-torch-parts` | Legacy alias |
| `/products/mig-mag-torch-parts/series/15ak-mig-mag-torch-parts` | `/products/mig-mag-torch-parts` | Held series  |
| `/sitemap.xml`                                                  | `/sitemap.xml`                  | Direct       |
| `/robots.txt`                                                   | `/robots.txt`                   | Direct       |

The status sequences below list redirect responses before the final 200:

| Starting origin               | Direct paths | Legacy aliases | Held series   |
| ----------------------------- | ------------ | -------------- | ------------- |
| `http://arcfortweld.com`      | 308, 308     | 308, 308, 308  | 308, 308, 307 |
| `https://arcfortweld.com`     | 308          | 308, 308       | 308, 307      |
| `http://www.arcfortweld.com`  | 308          | 308, 308       | 308, 307      |
| `https://www.arcfortweld.com` | None         | 308            | 307           |

Host normalization preserves the source path; the application then resolves the registered alias
or held-series redirect. This sample shows current website behavior only. The missing Google
examples may involve different paths, historical crawls or another condition.

## Required Per-URL Handoff

Use the existing `arcfortweld.com` native Search Console property. Export the noindex, 404 and
redirect-error example lists separately, retaining:

1. The exact URL, issue reason, report/export date and validation state.
2. Google's last crawl date and fetch/index permission result when available.
3. Declared and Google-selected canonical URLs when URL Inspection provides them.
4. Sitemap/discovery information when present; keep unavailable fields unknown.

For each supplied URL, compare current HTTP, redirect chain, robots/noindex and canonical behavior
with its intended public, filtered, private, draft or historical role. Compare Google's last crawl
with the actual repair deployment. Repair a reproduced mismatch, retain deliberate exclusions or
record that a later Google observation is required. Do not remove private/draft protections, redirect
unknown 404s to the home page or resubmit unchanged URLs merely to reduce an alert count.

GSC Wizard currently reports a subscription limitation. A native export can supply the examples
without purchasing a third-party subscription. This review did not submit indexing requests or
change Search Console, DNS, URLs, redirects, product facts or publication states. Follow
[the indexing workflow](../../docs/search-indexing-submission.md) once actual affected URLs are available.
