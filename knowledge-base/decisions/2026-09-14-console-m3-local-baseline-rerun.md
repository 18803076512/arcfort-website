# M3 Second Local Baseline Authorization

Date: 2026-09-14
Status: owner-approved preservation completed; integrated acceptance remains incomplete.

This follows the completed
[first local preservation](2026-09-13-console-m3-local-baseline-preservation.md). The owner explicitly
allowed preserving current local `postgres` as `arcfort_m3_failed_20260914`, creating another empty
local `postgres` from the reviewed `arcfort_m3_qa_20260913_c` template, and repeating full M3 acceptance.
This second approval resolves the previously recorded exact-operation blocker; do not ask for it again.

Preserve both `arcfort_m3_failed_20260913` and the newly retained database, including synthetic
users, drafts, receipts, adoption ledgers and audit. The current source has 46 variants, three
drafts and three synthetic verification events; the first archive retains its separately verified
45-variant state. Inspect actual state before execution and stop on an unexplained mismatch.

The destination remains the existing local Docker Desktop pipe and
`supabase_db_arcfort-product-intelligence` container. Briefly stopping the original API consumers
and exactly identified idle platform workers, restoring existing database ACL/settings and
restarting those consumers are part of this preservation switch. Do not drop/reset either adopted
database, change global roles, introduce another archive destination, or connect to a hosted project.

The ignored helper `.tmp/preserve-m3-database-20260914.mjs` records non-secret checkpoints and keeps
new database connections disabled until original platform settings and ACLs have been restored and
compared. Secret setting values stay in PostgreSQL rather than being exported into logs or files.
Inspect a partial checkpoint before recovery; do not blindly rerun a completed rename.

The [acceptance runbook](../../docs/operations/console-m3-isolated-acceptance.md) owns dated execution,
checks and remaining gates. This approval is local acceptance only, not remote CI dispatch,
hosted adoption/migration, production deployment, real product confirmation or publication.

The second preservation completed on September 14. Both archived databases retain their recorded
counts and hashes; the new baseline retained matching platform settings and ACLs. The fresh run
passed SQL/types/import/API gates and nine browser groups, then failed in the final session/logout
group. A targeted diagnostic reproduced a streamed-redirect timing assertion and passed after the
test waited for actual login navigation. This narrower result is not a fresh integrated pass.
The completed authorization does not cover another database archive/name switch.
