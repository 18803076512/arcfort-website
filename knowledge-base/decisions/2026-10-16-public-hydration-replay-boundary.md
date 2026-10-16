# Public Hydration Replay Boundary

Date: 2026-10-16 (Asia/Shanghai).
Status: scoped repair and local negative/positive regression verified; clean CI pending.

## Evidence

The PR 130 release preflight found one React 418/HTML error during a 60-case public browser smoke.
A second ordinary run passed, so a single green run cannot close this intermittent failure.
Delaying only unchanged public app modules by 8-320ms then produced 21 errors in 120 loads across
seven routes: products, the 15AK nozzle detail, About, Contact, distributor supply, OEM and RFQ.
The browser allowed only loopback GET/HEAD and submitted no inquiry or other business command.

A test-browser-only renderer probe, never written to build files, reproduced the failure on OEM
at 1440px. Expected ancestry was MAIN/BODY/HTML; the cursor was already at SCRIPT inside MAIN.
The failing host had no children or state node but still equaled the hydration parent. Document
state was interactive with no templates. The installed Next 15.5.22 renderer resets and restarts
HostComponent in `replaySuspendedUnitOfWork` without restoring the hydration cursor.

This is direct public-route evidence of the same replay shape addressed by React's
[merged fix #35494](https://github.com/react/react/pull/35494), not an assumption from the
[earlier Console-only finding](2026-10-10-console-hydration-replay-boundary.md).
React's [418 explanation](https://react.dev/errors/418) alone does not establish a cause; the local
failure shape and unchanged-byte negative/positive regressions are the relevant evidence here.

## Decision

Add one keyed Fragment around public layout children inside the existing `main#main-content`.
Like the existing Console fix, this keeps lazy RSC children off the claimed host during replay.
It adds no DOM node, client component, delay, dependency, URL, data copy or style. Do not patch the
renderer, suppress errors, disable SSR, remove public content or alter RFQ behavior to hide failure.

Retain `scripts/test-public-hydration.ts` as a production-build regression: 120 loads at 360/1440px,
ten routes, six bounded delay passes, every page exercising a public module, one main H1, exact
normalized canonical and zero page errors. HTTP responses remain unchanged. The owned loopback
server refuses runtime env files, strips ambient service credentials and closes after the test.
The browser refuses non-loopback and mutating requests. Run it in quality CI using the existing
pinned browser runtime after the normal public build. Local ordinary six-width image/layout
smoke remains separate; the stress test is not proof of RFQ delivery or product evidence.

## Verification And Reversal

The committed regression itself fails the unmodified build with two errors in 120 loads / 778
delayed module requests, then passes the repaired build with zero errors in 120 loads / 777 delayed
requests. Neither run instruments the renderer. All 60 ordinary route/width geometry, H1, canonical,
image-load and page-error cases pass after repair. Desktop homepage and mobile product screenshots
retain the existing design and image-reference labels. Build, scoped lint/typecheck, performance,
SEO, built links, governed image projection and snippets pass. Clean CI remains pending.
Native document CI remains an independent gate. No merge, deployment, retained/hosted write or
activation is authorized by this decision itself.
Existing owner authorization covers reviewed PR 130 release only after applicable gates pass.

Remove the workaround only after the actually bundled renderer contains the upstream fix and the
unchanged-byte regression passes without it. Removing it before then restores a reproduced failure.
No canonical data, commercial terms, evidence state, SEO routes or public-source authority changes.
