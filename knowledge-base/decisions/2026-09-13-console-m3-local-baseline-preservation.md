# M3 Local Baseline Preservation

Date: 2026-09-13
Reviewed: 2026-09-14
Status: exact local operation approved by the owner and completed.

This extends the [isolated acceptance separation](2026-09-11-console-m3-isolated-acceptance.md)
without changing working authority, publication gates or hosted permissions.

The owner explicitly allowed retaining the failed local `postgres` database under
`arcfort_m3_failed_20260913` and establishing a fresh `postgres` test baseline. The approved scope
was local only, with a brief Supabase interruption and no deletion of the old data. The reviewed
empty template was `arcfort_m3_qa_20260913_c`, within the existing
`supabase_db_arcfort-product-intelligence` container and local Docker Desktop pipe.

The chosen operation preserved the entire old database, including adopted records, synthetic users,
drafts and audit, rather than deleting fixtures or replaying legacy imports into an adopted system.
Platform database settings and ACLs were retained and verified. Only two exactly identified idle
preloaded platform worker connections were closed after API consumers stopped; database connection
permission was restored after rename. No database, volume or global role was deleted or reset.

This is not a reusable rollback command and does not authorize another archive name, repeated
database replacement, hosted operation or production write. Preserve the old adoption ledger and
the current test database if a later run fails. A new exact local replacement needs its own approval.
Do not hide replacement logic inside the fail-closed acceptance runner.

The [acceptance runbook](../../docs/operations/console-m3-isolated-acceptance.md#september-13-14-authorized-preservation-and-browser-diagnostics)
owns the execution checkpoints, bounded evidence, retained directory/database names and remaining
gates. Passing synthetic tests never confirms a real ArcFort product or authorizes publication.
