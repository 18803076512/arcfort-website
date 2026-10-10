# M4 OEM Reference Source Intake

Date: 2026-10-05
Status: local private foundation; application/native activation not performed.

## Scope And Decision

Begin M4-C supporting records with one bounded OEM/reference evidence unit, not M5 publishing.
The approved [V1 architecture](../../docs/product-intelligence-console-v1-architecture.md) still
requires the complete OEM, packaging and technical-document workbench before frozen release work.
This source foundation does not replace those deliverables with a read-only inventory.

Keep `oem_references` and repository sources unchanged. Append declared evidence into
`oem_source_bindings`, tied to an exact editable SKU, manufacturer label and reference string.
Preserve case, punctuation and leading digits; do not infer aliases, equivalent models or fitment.
Bind the full immutable source row and current SKU identity with hashes. A changed product identity
invalidates the old match; source corrections append a new record rather than rewriting history.

Reuse authority-then-role locking, session actor attribution, exact actor/request/payload receipts,
scoped mutation capability and append-only audit. Owner/editor/reviewer may record unapproved
evidence. Viewer/publisher/unassigned/revoked/service-claim callers are refused. The table forces
RLS and has authenticated Console read access only; private functions have no public/Auth/service
execute grants. No HTTP command, UI, feature flag or public OEM mutation RPC is added.

## Evidence Boundaries

Require source class/level/basis consistency, ISO non-future evidence date, custodian, version,
location and explicit supporting/contradicting/reference-only assertion. Record contradictions
without suppressing or upgrading them.

Declared exact Level A factory record, controlled drawing, approved sample or verified-reference
metadata can support later human review. Company catalogs, official manufacturer references,
standards and secondary references cannot alone confirm an ArcFort SKU reference. This helper
does not validate document content, verify a number, record human approval or assign `CONFIRMED`.
A verified reference designation will not establish product compatibility; that separate workflow
must retain its own exact endpoint, scope and evidence.

Future revisions/review must bind the exact immutable evidence set, retain omitted known conflicts,
preserve preceding/current history and reject stale or contradictory confirmation. Do not expose
an OEM application mutation until those controls and native acceptance exist. Packaging quantities,
commercial terms and technical-document permissions are separate M4-C work, not inferred here.

## Alternatives And Consequences

- Reusing generic technical-value intake loses the manufacturer/reference identity and can obscure
  the difference between a designation and fitment. Keep this small source boundary explicit.
- Updating original `oem_references` would overwrite the import/rollback authority and bypass a
  reviewed proposal. Keep intake separate until governed effective revisions are implemented.
- Treating a manufacturer catalog or matching text as ArcFort confirmation weakens evidence.
  Retain reference-only declarations and require actual human evidence review later.

The new migration extends the disposable pristine guard with an explicit zero OEM-source count.
This is a stronger refusal, never permission to reset existing work. No existing database is
migrated or replayed. Rollback before activation is reviewed code removal with type regeneration;
after any separately approved activation, preserve source and audit history rather than deleting it.

## Evidence And Authorization

The [C1 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-c1-oem-reference-source-foundation)
owns exact files, executed checks and remaining gates. Embedded SQL and simulated-role tests do not
prove actual Auth/PostgREST, multi-connection behavior, hosted migration or real OEM evidence.
No canonical fact, real reference, compatibility, retained/hosted data, publication or original file
is changed. Existing B11-B16 CI-only permission remains pending and is not silently expanded to C1.
No commit/push, merge or deployment is authorized or performed for this new batch.

Next implement exact OEM proposals, conflict-preserving human review and effective/current reads,
then the owner workbench and separately authorized native acceptance. Full M4/V1 remains incomplete.
