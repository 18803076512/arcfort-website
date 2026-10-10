# M4 OEM Frozen Human Review

Date: 2026-10-05
Status: local private implementation; native activation and application workbench not performed.

## Decision And Scope

Extend the [C1 source boundary](2026-10-05-console-m4-oem-source-intake.md), without superseding its
exact identity, source, compatibility or public-authority rules. Prepare immutable OEM proposals,
frozen submission, human APPROVE/EDIT/REJECT, current/effective reads and readiness inside M4-C.
This is not the complete owner workflow, M4 gate, M5 release preparation or full V1.

Keep original `oem_references` immutable. A head is a stable exact-SKU/slot identity, optionally
linked to one original row. Explicit original lineage is required when the proposed designation
matches an existing original. The original must belong to the same SKU and cannot be reassigned.
Different manufacturers/numbers are not inferred aliases; preserve spelling, punctuation and
leading digits. An approved linked revision overlays the original only in private effective reads;
its original row and all historical proposals/decisions remain accessible through governed tables.

Bind each candidate hash to immutable content, head scope, current SKU identity, full original row,
selected immutable binding/source rows and all known exact-scope contradictions, even when omitted.
Ordinary saves cannot replace pending/conflicted proposals. EDIT closes the frozen proposal and
atomically creates a new unapproved one; changing its reference or evidence cannot clear inherited
conflict. REJECT retains the previous current/original. New evidence or identity drift invalidates
an approval rather than silently falling back to the original.

## Human Review And Status

Use current owner/reviewer membership, authority-then-role locks, actor/request/payload receipts,
exact sequence/submitted hash and fresh observed hash. Decisions and verification events freeze
the full pending snapshot, sorted selected sources, reason, human declaration and replacement.
Independent decision/current/revision/evidence guards apply even with scoped transaction capability.
Historical validity does not require a reviewer to retain privilege forever; new reads/commands and
receipt replay do require current privilege.

An APPROVE requires an explicitly selected exact source and four human acknowledgements:
`source_checked`, `reference_checked`, `compatibility_not_asserted` and
`arcfort_reference_confirmed`. The last is true only for `CONFIRMED`, false for `OEM_REFERENCE`.
Qualifying exact Level A factory/drawing/sample/verified-reference metadata can support a human
`CONFIRMED` decision. Official manufacturer Level B catalog metadata can support only a visibly
distinct `OEM_REFERENCE` decision. Company catalogs, technical standards, secondary references,
reference-only Level A and contradictions cannot confirm ArcFort's supplied product designation.
Conflicted proposals additionally require an explicit meaningful resolution. EDIT/REJECT cannot
carry an approval status, acknowledgement, selected approval source or resolution payload.

These declarations and metadata checks do not independently inspect documents or prove real OEM
truth. An approved designation never creates or changes a compatibility relationship. No actual
human approves real product data during the synthetic tests.

## Readiness And Activation

All five new tables force RLS with current Console membership read-only grants. Commands remain
private with no authenticated/service mutation execute grant or HTTP/UI/feature setting. The sole
public helper is a guarded Boolean read, not an evidence or unassigned-user oracle. Effective
references/readiness views use invoker security. Every OEM effective row has `publication_ready=false`.

Open proposals, unreviewed original conflicts and invalid current approvals block publishable
lifecycle states and add an OEM blocker to the existing twenty-column shared readiness contract.
Keep the nine-metric dashboard contract and technical-conflict metric meaning; do not silently
add OEM conflicts to its technical count. A valid reference-only status does not imply verified
ArcFort facts, but is not itself an unresolved conflict. Existing rows are not retroactively demoted.

The disposable pristine guard now requires all five OEM revision tables empty before mutation.
Existing work is refusal, never permission to reset retained data. Before separately approved
activation, rollback is reviewed code removal/type regeneration; after any actual use, preserve
sources, decisions and audit history. Do not delete historical data to undo a current pointer.

## Evidence And Remaining Work

The [C2 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-c2-frozen-oem-human-review)
owns exact files and checks. Embedded tests use simulated JWT roles and in-memory PostgreSQL,
including TEST-ONLY reference proposals on four real 15AK identities and one created synthetic
draft. They prove scope, evidence-gate refusal, original-row retention and rollback, not native
Auth/PostgREST/concurrency, real documents or completed human UI.

The late approval corresponding to the September 28 compatibility/original/cookie batch was
already fulfilled. Its CI remains scoped to that commit. Neither it nor the pending B11-B16-only
question is expanded to C1/C2. No new commit/push, merge/deploy, provider/retained migration/write,
actual key, active setting, canonical fact or public-source cutover occurs here.

Next implement OEM application contracts and the usable owner/editor/reviewer workbench, with
native acceptance separately authorized; complete packaging/documents and real 15AK evidence
before the full M4 and verified preview/QA/publication gates. All twelve V1 criteria remain in scope.
