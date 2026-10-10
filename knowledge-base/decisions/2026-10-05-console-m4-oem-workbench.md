# M4 OEM Application Workbench

Date: 2026-10-05
Status: local implementation and synthetic acceptance; native activation not performed.

## Decision And Scope

Extend the [C2 frozen-review boundary](2026-10-05-console-m4-oem-human-review.md) with four typed
application commands and an OEM workbench. This changes C2's no-application-grant checkpoint, not
its source, human verification, conflict, compatibility, original retention or publication rules.
All twelve V1 criteria and the complete real 15AK workflow remain required.

Migration 21 grants authenticated execution of four narrow public wrappers. Each delegates to C1/C2
private functions, current confirmed Console role checks, authority locks, exact receipts and frozen
evidence/decision guards. No private implementation grant, direct table write or anonymous/service
mutation grant is added. Guarded Boolean source-current/proposal-fresh reads and invoker views expose
only the working state needed by the UI. No actual database receives this migration here.

The application requires a separate default-off `CONSOLE_OEM_ENABLED` plus the existing exact local
working configuration. This is an application switch, not a database permission switch: separately
approved application of migration 21 would expose the narrow role-checked RPCs to authenticated
Console members independently of that UI flag. Do not describe a disabled UI as revoking SQL access.
Keep retained/hosted migrations and any native activation separately authorized.

## Human Workflow And Reads

Reuse the existing command endpoint, CSRF, current roles, parser, idempotent request hook and error
sanitization. Preserve exact designation strings; client input cannot supply reviewed state, actor,
public eligibility, compatibility or a forged acknowledgement. Responses retain only typed IDs,
exact sequence and required digest. Source intake defaults to unconfirmed catalog/reference-only
metadata with blank provenance, not a prefilled factory claim or review.

Display originals separately from current approvals and latest proposals. Evidence and decisions
are scoped to exact SKU/head/reference identity. Counted reads reject missing or drifting totals,
duplicates, detached links, invalid current pointers and inconsistent states. Re-read head, source
and effective state and current roles before returning; this detects observed drift but is not an
atomic transaction across all HTTP reads. Mutations still require the database's exact fresh hash.

Human approval chooses only qualifying evidence frozen into the proposal. Official manufacturer
references stay `OEM_REFERENCE`. An exact Level A source plus explicit human declarations can support
`CONFIRMED`, but neither metadata nor this synthetic UI verifies actual document contents. Known
contradictions remain visible and need a meaningful resolution; EDIT cannot hide inherited conflict.
Changed fields cannot submit or approve an old snapshot. Stale-command errors require reload before
submission/approval. Reload resets unsaved fields and acknowledgement choices. Source edits and
reference edits cannot discard each other through a concurrent action.

History preserves historical proposal status separately from actual decision status. Role revocation
denies current reads and replay without erasing old decisions. All effective OEM publication flags
remain false. No designation decision writes compatibility or public facts.

## Evidence, Rollback And Remaining Gate

The [C3 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-c3-oem-application-workbench)
owns executed checks and files. SQL runs only in memory with simulated actors/rollback. Browser tests
exercise the actual React components against synthetic intercepted transport, not persisted native
Auth/PostgREST or real human approval. No preview/QA/publishing success is inferred from them.

Before any activation, rollback is reviewed local code/type removal. After use, preserve original
sources, proposals, decisions and audit; never delete history or reset adopted data to disable the UI.
No new key, active setting, retained/hosted write, commit/push, merge, deployment, public route/fact,
SEO/RFQ or commercial-policy change occurs here. No repository rule override.

The late September 28 approval remains fulfilled at `c190456d`, verified read-only with successful
CI run `36411995482` and open/unmerged PR 130. Neither it nor pending B11-B16-only authority covers
C1-C3. A submission containing these new batches needs exact destination/action/batch authorization.
Next prepare the native isolated OEM acceptance within M4, then packaging/documents and the real
15AK evidence needed for governed verified preview, QA and separately authorized publication.
