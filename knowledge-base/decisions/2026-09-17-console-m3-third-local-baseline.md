# M3 Third Local Baseline Authorization

Date: 2026-09-17
Status: owner-approved preservation completed; local browser/retention evidence passed.

The owner confirmed the exact third local preservation and integrated acceptance operation after
Docker's all-users cold-start acceptance. This supersedes the pending-authorization state in the
[second run record](2026-09-14-console-m3-local-baseline-rerun.md), not its historical results.

Preserve current local `postgres` as `arcfort_m3_failed_20260914_b`, retain both
`arcfort_m3_failed_20260913` and `arcfort_m3_failed_20260914`, and create fresh `postgres` from the
reviewed empty `arcfort_m3_qa_20260913_c` template. Retain all other databases and both Docker cold
backup generations. This does not authorize the separately proposed backup relocation.

The exact destination is project `arcfort-product-intelligence`, container
`supabase_db_arcfort-product-intelligence`, context `desktop-linux`, and the local
`dockerDesktopLinuxEngine` pipe. Briefly stop the same six local API consumers, terminate only the
two verified idle platform workers, and restore/compare the original database ACL and settings.
Keep setting values inside PostgreSQL. No global role changes, database drops, resets, WSL
unregistration, volume pruning, hosted writes, remote CI dispatch, push or deployment are authorized.

Before mutation, compare current data with `.tmp/m3-retention-20260914.json` and both archives and
the template with `.tmp/m3-preservation-20260914.json`. Refuse an existing destination or operation
report. Save bounded checkpoints; inspect any partial operation before recovery instead of blindly
repeating a rename. Run SQL tests, generated-type parity, two exact shadow imports and the full
repaired M3 API/browser runner only on the new baseline.

A failure after adoption must retain its fixtures and history. This approval does not permit a
fourth database switch. Synthetic acceptance cannot confirm real product facts or authorize public
source transition or publication. The [runbook](../../docs/operations/console-m3-isolated-acceptance.md)
owns the execution result and remaining gates.

The authorized switch completed on September 17 with all three archives and the template retained.
The initial helper stopped before restoring settings; its checkpoint remains unchanged. A separately
guarded finalizer verified the partial state, restored only the original settings/ACL, enabled the
empty baseline and restarted the same six consumers. No fourth switch or reset occurred.

SQL/types/two imports passed. The fresh integrated invocation reached and passed all ten persisted
browser scenarios. Its terminal handle was unavailable after a later Windows reboot; no captured
overall exit code is claimed. Final source-retention assertions were independently repeated read-only
after ordinary Docker startup and passed. Current clean CI remains a separate, unapproved gate.
