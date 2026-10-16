# OEM And Packaging Document Navigation

Date: 2026-10-08
Status: local and native isolated acceptance passed; not deployment approval.

## Evidence

Disposable run [37697460689](https://github.com/18803076512/arcfort-website/actions/runs/37697460689)
at `b6214b1cc01575dc16fdf96301b73f59f3aef9da` passed quality and reached OEM. After successful
submission, both the database read model and acting participant's history reported revision 1
`pending`, while the rendered latest-proposal panel stayed at revision 1 `proposed`. The prior run
failed at the corresponding approval refresh. Increasing a test timeout or reloading from the test
would conceal a real stale-state problem.

## Decision

Use full document navigation after successful OEM/packaging commands and record selection, matching
the [M2 access boundary](2026-09-03-console-m2-access-boundary.md) and existing technical/media forms.
Remove the paired App Router push/refresh at those transitions. Fresh document requests recheck
session and roles and reload the persisted snapshot. Failures retain form inputs and retry identity.
Explicit unsaved-change confirmation remains required for record switching.

Standalone source-entry refresh remains in place to preserve the unsaved designation/packaging
copy; it does not perform a router push or imply selection, confirmation or publication of evidence.
Manual reload retains its existing unsaved-input confirmation. No data, grant, route or feature
default changes. This supersedes only the navigation description in the
[D4 preparation](2026-10-06-console-m4-disposable-packaging-acceptance.md), not its other safeguards.

## Verification And Reversal

Synthetic UI tests must observe actual document requests for successful commands and record
selection, plus unchanged error/role/input gates at all six widths. Native CI must still prove
exact persisted states, historical decisions, contention, revocation and retained data. Synthetic
responses alone are not native evidence. Reversal requires a reviewed alternative proving fresh
state and the same session/role boundary; never bypass the test with a forced reload or weaken RLS.

This remains within the owner's exact combined media/OEM/packaging CI-only authorization. No merge,
deployment, hosted or retained-local operation is performed or newly authorized.

## Accepted Evidence

The repaired runtime at `7403136272fa06c011e0c49a6af7904948279efa` passes both jobs in
[run 37698778273](https://github.com/18803076512/arcfort-website/actions/runs/37698778273), including
all 47 native browser scenarios and final OEM/packaging ledgers, revocation and retention checks.
Local regressions pass 15 OEM / 14 packaging groups at six widths and require actual document
requests for success and record switching. The complete M4/V1 and real 15AK publishing gates remain
outside this result; see the [runbook](../../docs/operations/product-intelligence-console-milestone-4.md#october-8-combined-native-acceptance).
