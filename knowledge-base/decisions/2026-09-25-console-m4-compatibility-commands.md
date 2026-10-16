# M4 Local Compatibility Command Boundary

Date: 2026-09-25
Status: local code and embedded/offline tests; not applied to retained or hosted databases.

## Context

This connects the [exact source bindings](2026-09-24-console-m4-compatibility-evidence.md) and
[revision/review commands](2026-09-25-console-m4-compatibility-revisions.md) to the existing
[local command transport](2026-09-10-console-m3-local-command-ui.md). It does not authorize M4
migration/adoption, real fitment approval, hosted access, publication or external submission.

## Decision

Add five typed actions to the existing same-origin JSON handler: ensure an exact SKU entity,
record bound evidence, propose a relationship revision, submit and review. Reuse the caller session,
current-role check, body limit, CSRF contract, request receipts and bounded error mapping. Do not
create an alternate service-key transport. Subject, target, type, assembly scope, component role,
revision, digest, evidence links and decision reason retain their separate meanings.

Compatibility application commands additionally require `CONSOLE_COMPATIBILITY_ENABLED=true`.
The default is false, and the existing complete local working checks must also pass. Enabling the
M3 flag alone, staging, hosted URLs, alternate loopback origins or an Access tunnel cannot enable
these actions. Only the example configuration changed; no active environment setting was enabled.

Migration 12 prepares authenticated-only SQL wrappers, with pinned search paths and no direct
private EXECUTE, service-role or anonymous grants. Database commands independently check the current
actor, adopted editable scope and exact evidence. The application flag is not a database privilege
or RLS gate: once a future authorized migration is applied, authenticated direct RPC calls still
depend on those database controls, not on the web process environment.

The public proposal wrapper takes an optional final root UUID. Application input must explicitly
choose `root_id: null` for a new proposal with revision zero; transport omits the SQL argument so
the generated nullable/default contract needs no unsafe type assertion. Existing roots pass the
exact UUID and revision. Identity results must match the requested SKU UUID, case-insensitively.

Strict input validation rejects extra authority/status fields, malformed types (including an
array masquerading as a review decision), unsupported relationship directions, self-links, invalid
source classification/date, empty scope/requirements and oversized/duplicate evidence. It does not
pretend to prove endpoint existence or source truth; the SQL commands enforce those checks.

Command results expose only required IDs, revision and submitted digest. Raw snapshots, source
digests and provider/SQL messages are not returned. Existing technical command behavior is retained
and regression-tested. No new UI, read model, target-identity creation beyond the exact SKU entity,
image command or publication route is included in this contract checkpoint.

## Evidence And Recovery

The [M4 runbook](../../docs/operations/product-intelligence-console-milestone-4.md) owns current
checks. Thirty-one new wrapper assertions pass in the embedded engine (448 total), including actual
SQL role switches, EDIT/APPROVE/REJECT, retry and revoked-reviewer denial. Six new transport groups
use the real Supabase request builder with synthetic fetch/Auth responses; eight original command
groups also pass. Neither result proves actual Supabase Auth/PostgREST or persisted browser use.

Rollback at this checkpoint is code-only. After any future application, disable the web feature
without deleting adoption/history/receipts; privilege or schema recovery needs reviewed forward
changes. Do not reset the adopted local database or replay shadow imports over it. Next implement
bounded current/source/history reads and the owner-facing comparison/editor, followed by fresh
real database, concurrent and browser acceptance. Full V1 and the real 15AK pilot remain open.
