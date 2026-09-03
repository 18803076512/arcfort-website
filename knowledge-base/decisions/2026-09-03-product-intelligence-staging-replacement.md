# Product Intelligence Staging Destination Replacement

Date: 2026-09-03
Status: Owner approved; reviewed hosted Milestone 1 migration, tests and shadow parity completed

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

At initial preflight Free remained owner-reported: the CLI organization list returned no records and the available
Dashboard browser requires sign-in. Project/plan Dashboard evidence has been requested. No billing
change, paid upgrade or inference about the owner's organization permissions is made from this gap.
The follow-up target-only authenticated organization endpoint returned HTTP 403 after project
identity validation succeeded. Do not broaden credential scope or reinterpret missing access as
Free-plan evidence. The screenshot request was subsequently satisfied by the paired Dashboard
evidence below.

### Dashboard Evidence Follow-Up

The owner supplied a project screenshot showing the exact authorized URL/reference, name, Singapore,
Healthy status and no migrations, followed by the requested Billing screenshot explicitly showing
`Free Plan`. Reviewed SHA-256 values:

- Project screenshot: `F7BB6B68E31E1A2CB2A5A839488444D0F0DEFB97678D2004AB8720553B58DFFE`.
- Billing screenshot: `6CF83FC209B2607E60AF762A2E61B06FE3513E373FBF7326792895C88EBF4D0B`.

The billing crop omits the organization header; its association with this project is the owner's
scoped response to the exact-project evidence request, corroborated by the paired project capture.
This is reviewed owner-provided Dashboard evidence, not a successful organization API lookup.
It satisfies the requested screenshot handoff without expanding credential permissions. No plan,
billing or account setting was changed. Screenshots are not published in the repository.

A fresh authenticated lookup reconfirmed the exact ref/name, organization `xycjhlnlacqocitjkagq`,
Singapore and `ACTIVE_HEALTHY`. The pre-write database check again found an empty public schema,
zero users/buckets and no migration history; the dry-run again listed only the five reviewed files.

The ignored destination file still uses the new reference/URL, with an empty project server key and
disabled write guard. No persistent CLI project link was created. CLI connection preflight can
initialize a temporary login role; do not confuse that with applied business migrations.

### Hosted Execution Outcome

After the accepted Dashboard evidence and repeated preflight, the five reviewed migrations were
actually applied to `fdsvzuqixppsakukkrsf`. The hosted SQL runner passed all 74 assertions on pgTAP
`1.3.3`, including its real pass/fail/count-mismatch controls. TypeScript AST comparison found all
`public` and `graphql_public` schema members identical to the committed types. The complete generated
files differ only by five added lines for hosted PostgREST `14.5` metadata and comments; the local
canonical artifact was not overwritten and full-file identity is not claimed.

Two approved imports reconciled every source-controlled field across 17 tables at unchanged revision
`f185ebc9ebba875bc59141b872780297804fef894866108fa14d65bf995fc41b`. The current project's existing
server key was obtained through the authenticated CLI and used only in child-process memory. No
credential was printed, saved to the destination file or copied from the old project.

Final hosted checks found all 28 tables under forced RLS, two private buckets, zero users/roles or
publication records, no duplicate SKU/slug, all 43 products retained as needs-review shadow records,
14 preserved conflicts and zero fact/compatibility/media promotions. The single import batch is
`RECONCILED`; append-only audit history remains intact. The operations runbook retains exact suite
hashes, counts, commands, tested commit and warnings. No production or billing setting changed.

## Reversal

If this destination is incorrect or unavailable, stop and request another explicit destination
decision. Do not silently return to the old project. Repository and public website data are
unaffected by this preparation; deleting a hosted project is not an automatic rollback.

## Next Action

Milestone 1's scoped foundation gate is `PASS_WITH_WARNINGS`; review the next Console shell,
invite-only authentication and read-only dashboard plan before Milestone 2. The public website still
uses repository sources. Hosted Auth configuration/owner-role bootstrap require their own controlled
handoff, and real 15AK data/media review remains necessary before any product release.

Preserve the isolated CI proof alongside hosted results and rerun both after schema/importer changes.
The owner-authorized PR #130 push and isolated tests were a separate action, not permission to merge
or deploy production. Tested implementation `202c189f1f062fa20fff8219aca3a0aba66f1c79` passed
[run 33714502709](https://github.com/18803076512/arcfort-website/actions/runs/33714502709), and its
documentation follow-up `4518b885ad0971533c4408fee216b5bec2a4ebaf` passed
[run 33714840051](https://github.com/18803076512/arcfort-website/actions/runs/33714840051).
The operations runbook documents the local masked-input token fallback for Windows browser-login
failures. Tokens, API keys and database passwords must never enter Git, chat or these records.
