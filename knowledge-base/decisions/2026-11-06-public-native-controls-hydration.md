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
label and visual disabled state; then restore normal selection. This avoids a silent lost click and
does not change product media identity, rights or publication state.

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

## Reversal

If the navigation or gallery implementation changes, retain the buyer-behavior assertions: an
already-open native menu survives hydration, route changes close it, thumbnails only become active
when their selection handler can run, and direct paths remain available without scripts. Remove the
guard only if a replacement passes the same negative/positive browser cases.
