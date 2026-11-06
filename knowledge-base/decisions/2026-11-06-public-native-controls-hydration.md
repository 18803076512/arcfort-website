# Public Native Controls During Hydration

Date: 2026-11-06 UTC. Scope: public header navigation and product image galleries.

## Evidence

Read-only production browser checks delayed first-party Next.js chunks without changing response
bytes. On the homepage at 390px and 1440px, a buyer could open the native Menu or Products
`<details>` before hydration, but it closed when hydration finished. The shared
`AutoClosingDetails` effect closed any open menu on its first mount even though the pathname had not
changed. On a MIG gas-nozzle detail page at both widths, thumbnail two was clickable before
hydration, yet the selected state and full-image link stayed on image one afterward. That thumbnail
button relied on a client click handler which was not ready. The tests made no POST or external
request and saw no page error. The product finder kept its values and navigation in the tested
hydrated paths; it is outside this repair.

## Decision

Keep native menu interaction available immediately. Close an open menu only when its pathname truly
changes; continue to close it on an outside pointer event, Escape, or a clicked link after hydration.
Keep the first product image, its evidence disclosure and direct full-image link available in server
HTML. Disable gallery thumbnail buttons until their client click handler is ready, with a preparing
title and visual disabled state; retain each thumbnail's evidence disclosure in its accessible label
while disabled, then restore normal selection. This avoids a silent lost click and does not change
product media identity, rights or publication state.

Use the existing production-build public hydration runner for delayed-script, keyboard and no-script
regressions. It must refuse requests beyond loopback GET/HEAD and send no inquiry. This decision
does not infer search indexing, RFQ delivery or image-rights approval from UI behavior.

## Local Verification

The repaired production build, lint, typecheck, performance budget and 776-file secret-pattern scan
passed. The public browser regression passed 120/120 delayed page loads, 3/3 navigation checks and
3/3 gallery checks with zero page errors or refused requests. It verified menu state at 390px and
1440px, Escape focus return, a native no-script RFQ link, thumbnail selection after readiness and
a direct initial-image link without scripts. Representative 390px and 1440px screenshots showed no
horizontal overflow. Hosted CI and live post-deployment checks remain separate release gates.

The first PR CI run exposed a useful guardrail: replacing the server-rendered thumbnail label with
a generic loading label removed the product-family reference disclosure for three gallery assets.
The loading state now uses a separate title while preserving the disclosure label. The rebuilt
public-image audit passes all 43 legacy-reference assets. The independent Console browser timeout
from the same run remains a separate, unproven CI failure until rerun.

## Hosted And Production Follow-up

PR #147's corrected head `095551935b7bcbd655b01b1982b27522d582f1ea` passed both quality
and isolated Product Intelligence database jobs in run `42202570362`. It merged to `main` as
`bd2257fbe0b54cea6e0d58cd960f18f5c1903b66` on 2026-11-06 10:36:44 UTC; main push run
`42204003126` passed both jobs. Production deployment `7598068717` succeeded for that merge at
10:38:04 UTC. The first CI run's Console browser timeout was not reproduced in the corrected run;
its original cause remains unproven, and this CI result does not establish hosted M4 activation.

Read-only live browser checks at 390px and 1440px passed 4/4 delayed-script navigation and gallery
cases. The no-script direct link remained available; checks sent no POST and observed no page errors.
Post-deployment health found 88 sitemap URLs, 82/82 reachable HTML pages, 40/40 product inquiry
paths, configured RFQ status, core sender DNS records and expected security headers. The next
observed scheduled health run `42279216498` also passed at 19:23:37 UTC for that merge. Actual
scheduled runs may be delayed or skipped; these checks do not establish inbox delivery, current
Google indexing, GA4 collection or exact-product image rights.

## Reversal

If the navigation or gallery implementation changes, retain the buyer-behavior assertions: an
already-open native menu survives hydration, route changes close it, thumbnails only become active
when their selection handler can run, and direct paths remain available without scripts. Remove the
guard only if a replacement passes the same negative/positive browser cases.
