# M4 Exact-Original Document Review Sources

Date: 2026-10-12
Status: E6 private SQL preparation verified locally; unapplied and not exposed as a command or UI.

## Decision

Build the evidence-intake prerequisite for the signed/human document review described in the
[E5 decision](2026-10-12-console-m4-document-inspection.md). This is not the promised complete
human review workflow; it supplies the missing governed inputs before implementing that workflow.
Existing source, publication, activation and approval boundaries remain unchanged.

Migration 30 reuses `evidence_sources` and adds immutable `document_source_bindings`. Each source
is bound to one exact SKU, technical-document ID, original snapshot and one dimension:
`usage_rights` or `exact_scope`. The original must have a current reference, upload intent,
completion and matching Storage metadata. This is still metadata linkage, not byte attestation.

Intake records source class/level, basis, supports/contradicts/reference-only assertion, custodian,
reference, location, scope, evidence date and revision. Unknown dates/revisions remain null instead
of manufactured values. Contradictions append alongside supporting/reference records; no source
silently replaces another. Both the source and its binding are immutable, audited and private.

Rights bases are company ownership, supplier authorization and a license record. Exact-scope bases
are controlled drawing, approved sample, inspection record and SKU record. Eligibility for later
human review requires a dated Level A company record, a supporting assertion, a matching current
snapshot and the appropriate dimension basis. Catalogs, standards, secondary references, unknown
dates and contradictions are retained but cannot satisfy that positive-evidence gate. An eligibility
result does not resolve other conflicting sources or constitute approval.

The private command reuses authority/role locks, actor-scoped idempotency and scoped mutation
capabilities. Owner/editor/reviewer may be eligible callers, but no public wrapper or authenticated/
service execute grant is added in E6. A current reader can inspect history through existing RLS.
Source matching rechecks the exact original; changed SKU/document/Storage state cannot be accepted
through an old source or replay. A rights source cannot substitute for an exact-scope source, nor
can either become a field-bound technical source through the existing technical review command.

## Verification And Remaining Boundary

The [E6 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e6-document-review-evidence-foundation)
owns current checks. The in-memory rehearsal adds fifteen TEST-ONLY sources to four actual 15AK
identities and one synthetic draft, retains five contradictions, denies technical-source reuse,
and rolls back all records, receipts, audit and synthetic Storage metadata exactly. It provides no
real company evidence, native Auth/Storage, human decision or byte observation.

The strict SQL-report baseline was still at 24 suites / 1,384 assertions before this batch. After
reviewing and running all six E-series suites it now requires exactly 30 suites / 1,674 assertions,
with explicit document-suite names and plans. Missing/failed/skipped/TODO/truncated reports still
fail. Pristine acceptance now refuses an existing or omitted document-source count and never resets
retained data to make a test runnable.

Next freeze a review candidate with both source dimensions and all known contradictions, add
domain-separated signed byte observation, then explicit human APPROVE/EDIT/REJECT with history,
UI and native isolated acceptance. No document approval can be inferred from E6 alone. Sources do
not change technical values, fitment, document rights flags, public URLs or publication readiness.

E1-E6 are local/uncommitted/unapplied and outside the completed older CI authorization. No real
key, migration, feature flag, file upload, Docker operation, commit/push/merge/deploy or repository
rule override occurred. Revert unapplied code only through a reviewed change; after application,
retain sources/originals/history and correct forward. Full V1 and the real 15AK workflow remain open.
