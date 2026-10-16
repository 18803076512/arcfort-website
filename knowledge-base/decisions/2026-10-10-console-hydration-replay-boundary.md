# Console Hydration Replay Boundary

Date: 2026-10-10
Status: local regression and full uninstrumented native candidate acceptance passed; CI scope only.

## Evidence

Diagnostic `d732744e58c9b1b6160a246584ed8ad9eda8788d` /
[run 38023797228](https://github.com/18803076512/arcfort-website/actions/runs/38023797228) completes
48 scenario bodies, then fails the strict browser-error gate on owner media at 1280px. The failing
host ancestry is DIV/BODY/HTML; its hydration cursor is a pending Suspense comment inside
`console-root`. Its child list is empty and its own DOM state is reset, although the hydration
parent still equals that fiber. The document is loading, with two templates. React 418/HTML is
followed by `$RS` null-parent failure. This matches the earlier history-page failure shape.

The installed Next 15.5.22 renderer's `replayBeginWork` resets/restarts HostComponent without
restoring the hydration cursor. React's merged
[upstream fix #35494](https://github.com/react/react/pull/35494) restores that cursor after an
immediately resolved suspension. This is distinct from simply assuming that every streaming error
is the parser race described in #37321.

A database-free fixture imports the real root/Console/loading/error components with a synthetic
private workspace and history. Normal and small-chunk transmission each complete 60 loads without
errors. Delaying only the error-page client module by 8-320ms reproduces 28 page errors in 120 loads,
including the same empty-child/reset-host/comment-cursor shape and one subsequent stream error.
No HTML or RSC payload is changed to produce this failure.

## Decision

Wrap SessionHistoryBoundary and the Console layout's children in one keyed React Fragment inside
the existing `console-root` div. The Fragment provides a non-host reconciliation boundary for lazy
RSC children, so their suspension does not replay an already-claimed host node. A key is required
to retain the Fragment fiber. It creates no DOM element and changes no public route, metadata,
loading fallback, authorization, full-document navigation or data contract.

Prefer this small, Console-scoped workaround over patching the bundled renderer, adding delays to
application hydration, suppressing errors, disabling SSR or removing loading/error boundaries.
Do not infer a public-site issue or make an unrelated framework upgrade from this evidence.

## Verification And Reversal

The same synthetic delayed-module case completes 120 loads with zero errors after the change.
A second run with completely uninstrumented renderer bytes verifies 120 delayed module requests
and zero errors. Focused lint, full typecheck, Console boundary checks and all ten browser-server
isolation guards pass. These results do not replace native authentication/data/browser acceptance.

Remove the generated-renderer probe from the committed runner. Keep 120 bounded read-only history
loads at 360/1440px with the real error module delayed, count all 120 affected requests, and retain
strict zero-page-error checks. Normal business tests, final ledgers and retention must also pass.
Remove the keyed boundary only after the actually bundled renderer includes the upstream fix and
the delayed-module regression plus full native acceptance pass without it.

This repairs the owner-authorized media/OEM/packaging CI batch only. It grants no merge, deployment,
hosted/retained-local data operation, source-authority change or real-product publication approval.

## Native Acceptance

Candidate `3fffe5f91771576fdaa6fd524ffbc08bd3d5aff7` passes both jobs in
[run 38024660872](https://github.com/18803076512/arcfort-website/actions/runs/38024660872).
The uninstrumented browser runner completes 48 scenarios and counts all 120 delayed history modules
with strict zero-error gates. All 24 SQL suites / 1,384 assertions pass, followed by exact final
parent/media/OEM/packaging ledgers, revocation, original/commercial retention and zero publication.
This resolves the reproduced replay regression for this candidate and tested matrix, not all future
framework behavior or production/real-product acceptance. Full V1 and the real 15AK pilot remain open.
