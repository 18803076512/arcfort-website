# M3 Disposable Acceptance Separation

Date: 2026-09-11
Status: test infrastructure implemented; real-service acceptance not yet executed successfully.

This extends the [local command decision](2026-09-10-console-m3-local-command-ui.md), without changing
catalog authority or granting external-write permission.

M2 pagination fixtures and M3 exact adoption cannot share a dirty test baseline. Preserve both gates:
run M2 first, reset only the disposable local CI database, perform two exact repository imports and
then run M3. The M3 runner itself refuses existing users or working records and has no reset operation.
Never turn this fixture reset into a rollback instruction for an adopted working database.

Concurrency evidence must include observed PostgreSQL lock blocking, not only Promise scheduling or
elapsed delays. Separate real Auth/PostgREST assertions from embedded SQL and synthetic UI checks.
The runner must fail closed without a verified local Docker socket/container and exact endpoints;
hosted credentials and provider overrides cannot supply a fallback. Technical approvals use synthetic
new products only, retaining all original source rows.

The [acceptance runbook](../../docs/operations/console-m3-isolated-acceptance.md) owns commands,
sequence and current evidence. As of this review, target guards and local regression checks pass;
the real runner stops at environment preflight. No real database, browser or hosted pass is claimed.
Revisit the test topology only if M2 fixture cleanup or a reviewed isolated-environment strategy
changes, while keeping exact parity and independent evidence gates intact.
