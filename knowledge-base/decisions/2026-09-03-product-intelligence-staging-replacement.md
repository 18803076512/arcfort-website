# Product Intelligence Staging Destination Replacement

Date: 2026-09-03
Status: Owner approved; identity, empty schema and preview verified; billing and hosted replay pending

## Decision And Evidence

The owner supplied `arcfort-product-intelligence-staging`, reference `fdsvzuqixppsakukkrsf`,
Singapore, Free plan, and explicitly confirmed the destination-specific authorization on 2026-09-03.
Only this non-production project may receive the reviewed Milestone 1 migrations and shadow import.

This replaces the 2026-09-02 authorization for `bdaucwemujiunpyptkpq` recorded in
[the Milestone 1 runbook](../../docs/operations/product-intelligence-console-milestone-1.md).
Do not migrate, import into, reset, delete or otherwise modify the old project as part of this task.
Historical records remain unchanged; they are not current write authorization.

The original [Milestone 1 decision](2026-08-30-product-intelligence-console-v1-foundation.md) remains
authoritative for scope, repository source-of-truth, evidence states and the Milestone 2 exit gate.

## Preconditions And Exclusions

- Confirm authenticated project reference, name, organization/account, region, plan and existing
  schema before writes. Owner-reported metadata is not an authenticated inspection.
- Review the migration dry-run and record the rollback owner before applying anything.
- Stop for unexpected tables/data or a mismatched project; never force, reset or delete to proceed.
- No production connection, public publication, paid upgrade or production service change.
- Keep the local shadow-write guard disabled until the exact reviewed operation is ready.
- Do not transfer a project API key from the old destination. Configure new credentials locally.
- Retain failed-import audit evidence and keep the repository product sources canonical.

## Current Observation

The initial 2026-09-03 CLI check reported that no access token was configured. After local masked-input
token login, an independent authenticated lookup verified reference `fdsvzuqixppsakukkrsf`, name
`arcfort-product-intelligence-staging`, region `ap-southeast-1` (Singapore), and provider-reported
status `ACTIVE_HEALTHY`. A second read-only lookup under Windows PowerShell also passed.

The first helper incorrectly reported failure because Windows PowerShell treated non-fatal native
stderr as a terminating error; this was reproduced and corrected. Project lookup success, not the
helper banner, establishes CLI access. It does not by itself confirm ownership, billing or parity.

Subsequent authenticated project metadata identifies organization `xycjhlnlacqocitjkagq`. The owner
explicitly confirmed managing this project and serving as recovery/rollback owner. Hosted structural
inspection found PostgreSQL `17.6`, no public relations/functions or migration-history table, zero
Auth users and zero storage buckets. The reviewed dry-run lists exactly the five Milestone 1
migrations, with no seeds or custom roles. Exact commands and observations are retained in the
runbook's 2026-09-03 preflight section.

Free remains owner-reported: the CLI organization list returned no records and the available
Dashboard browser requires sign-in. Project/plan Dashboard evidence has been requested. No billing
change, paid upgrade or inference about the owner's organization permissions is made from this gap.
The follow-up target-only authenticated organization endpoint returned HTTP 403 after project
identity validation succeeded. Do not broaden credential scope or reinterpret missing access as
Free-plan evidence. The screenshot request remains the bounded next owner action.

The ignored destination file uses the new reference/URL, with an empty project server key and
disabled write guard. No persistent CLI project link, hosted migration, pgTAP suite replay or shadow
import has been performed by this workflow. CLI connection preflight can initialize a temporary
login role; do not confuse that with applied business migrations.

## Reversal

If this destination is incorrect or unavailable, stop and request another explicit destination
decision. Do not silently return to the old project. Repository and public website data are
unaffected by this preparation; deleting a hosted project is not an automatic rollback.

## Next Action

Finish billing-plan verification, then recheck the exact target and apply the reviewed migration set
within the existing destination-specific authorization. Retain all 74 hosted TAP results, generate
and compare types, and reconcile the same shadow snapshot twice before evaluating Milestone 1 exit.
The newly prepared SQL-report runner requires its own isolated PostgreSQL/CI proof before hosted
use; existing pg_prove checks remain required. On 2026-09-03 the owner explicitly authorized commit
and push to PR #130 for isolated database CI. This separate authorization does not include a merge,
production deployment or staging database write; the Free-plan evidence gate is unchanged.
The operations runbook documents the local masked-input token fallback for Windows browser-login
failures. Tokens, API keys and database passwords must never enter Git, chat or these records.
