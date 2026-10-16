# M4 Physical Packaging Source Foundation

Date: 2026-10-05
Status: local migration preparation and isolated rollback proof, not an activated workflow.

## Scope And Original Authority

The approved [V1 architecture](../../docs/product-intelligence-console-v1-architecture.md)
requires packaging management. Original `packaging_records` combines physical description,
quantity/unit and commercial MOQ/lead-time notes. Preserve its full rows and the repository
commercial policy. Do not route product-specific commercial-policy changes through packaging
evidence or general product editing. This decision extends the
[working-authority boundary](2026-09-09-console-m3-working-authority.md), not its activation scope.

Migration 22 adds only `packaging_source_bindings` and private helpers. Physical copy has exactly
`package_description`, `quantity` and `quantity_unit`; unknown quantity/unit must both be explicit
null. Known counts are positive bounded integers with an explicitly supplied unit. No unit
conversion, alias, package hierarchy, per-carton multiplication or quantity inference is performed.
Strings preserve case and punctuation, rejecting leading/trailing whitespace, controls and overflow.
Commercial/confirmation fields are rejected. The existing public table shapes, importer, identities,
readiness, lifecycle, website data adapter and publication authority are unchanged.

## Exact Sources And Human Boundary

Each append-only binding retains exact SKU identity, physical copy, optional explicitly selected
original-record lineage, complete original/source SHA-256, custodian, document revision/location,
date, source class/level/basis, assertion and session actor. An original must belong to the exact
SKU; a new package cannot silently inherit an original, even with the same physical description.
Identity, count/unit, full original or source drift invalidates a match. Timezone does not change
the digests. Contradictions remain separate immutable sources, never overwritten or auto-selected.

Declared supporting exact Level A packaging records, factory records, controlled drawings or
approved samples are eligible for later human review only. A company catalog, manufacturer,
standard, secondary reference, contradiction or reference-only assertion cannot confirm supplied
ArcFort packaging. Metadata eligibility is not actual document inspection, a human decision, a
known quantity or publication eligibility. An unknown count cannot evidence a guessed count.
Future packaging revisions/review must retain those unknowns and all known conflicting evidence.

Private intake retains authority-then-current-role lock order, adoption/exact-pilot or created-draft
scope, transaction/actor capabilities, actor-scoped payload receipts and post-command cleanup.
Owner/editor/reviewer may record unapproved evidence; other or revoked sessions cannot replay.
There is no public mutation RPC, browser command, confirmation event or application opt-in. The
new table is forced-RLS, current-console-reader-only, audited and immutable; anon/service/direct
write and private-function execution remain denied. The reviewed migration is not applied here.

## Evidence, Rollback And Remaining Work

The [D1 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-d1-physical-packaging-source-foundation)
owns actual check results. Embedded PostgreSQL proves refusal/idempotence/roles/immutability and
type/source parity; simulated JWT actors are not real Supabase Auth/PostgREST or concurrent sessions.
The separate rehearsal uses four imported 15AK identities and a created synthetic DRAFT with
explicit TEST-ONLY packaging descriptions/counts and reference-only source metadata. No real
packaging statement is confirmed, and all source writes roll back. All 43 imported records have
unknown quantity/unit and `NEEDS_FACTORY_CONFIRMATION`; their full rows, including commercial
notes, are compared exactly. Publication and new human decisions remain zero.

Disposable acceptance now refuses nonzero or missing packaging-source baseline before any account,
observer or workflow writes. The existing prepared native workflow also checks unchanged original
packaging and zero packaging sources at the end; it does not exercise new packaging intake.
Never reset existing work or infer that native acceptance ran from these guards.

Before native activation, reversal is a reviewed local code change. After any separately authorized
intake, preserve source/audit/receipt history and use forward corrections; never clear retained
evidence to reimport. No Docker, retained/hosted database, key, active setting, push/merge/deployment,
canonical/public fact, SEO/RFQ or visual change occurs here. No repository rule override.
The pending B11-B16 plus C1-C4 CI question does not include this new D1 batch.

Next implement immutable packaging proposals and exact human APPROVE/EDIT/REJECT, then counted
original/current/source/history reads, an owner workbench and separately authorized real isolated
acceptance. Technical-document links and real 15AK evidence/verified preview/QA/publication remain
required. D1 is a foundation step, not completed packaging, M4 or any declaration of full V1 success.
