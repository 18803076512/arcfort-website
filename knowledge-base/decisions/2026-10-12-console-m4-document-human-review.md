# M4 Frozen Document Candidates And Human Decisions

Prepared: 2026-10-12; final local verification: 2026-10-13 (Asia/Shanghai).
Status: E7 private SQL preparation verified locally; no application approval endpoint or activation.

## Decision

Extend the [E6 evidence foundation](2026-10-12-console-m4-document-sources.md) with immutable
document-review candidates, submissions and human APPROVE/EDIT/REJECT decisions. This replaces
E6's unfinished candidate/decision prerequisite only. It does not turn metadata inspection into
trusted byte observation, expose a command or complete the promised reviewer workflow.

Each exact document version has a SKU-bound head and monotonically advancing review sequence.
Candidates retain their predecessor, human scope note, sorted selected sources, original digest,
all-known-evidence digest, unconfirmed/conflicting state, reason and server attribution. Candidate
content never changes. Submission is a separate immutable record; changing an unsubmitted proposal
appends a successor, while a pending proposal first requires an explicit human decision.

The evidence digest includes full source/binding records for ALL sources of that document, not just
the chosen positive sources. Known contradictions remain `DATA_CONFLICT` even when omitted from
selection. A later source, including a non-conflicting source, invalidates the earlier evidence
snapshot and requires deliberate review. A source or approval does not transfer to a new document
version, different SKU, technical field, compatibility relationship or public publication.

Only current owners/editors propose; owners/editors/reviewers submit; only owners/reviewers decide.
Existing authority-then-role locks and actor-scoped receipts are reused. Role checks precede replay.
Completed receipts are historical command results, not a fresh validity assertion. Five forced-RLS
tables allow current Console readers to read history but grant no direct writes, anonymous or
service access. All functions remain private and ungranted.

## Human Decisions And History

APPROVE requires an unchanged submitted snapshot, exact current original metadata, two separately
selected qualifying Level A sources, and exact human declarations of original inspection, usage
rights and SKU scope. Conflicting candidates additionally require a meaningful resolution reason.
The independent decision trigger checks the full verification event, candidate, selected sources,
actor and timestamp; a scoped write capability alone cannot manufacture a current approval.

EDIT closes the pending review and atomically appends an unconfirmed replacement for the SAME exact
document, with new scope/source selections. It does not edit a source file or technical fact.
Invalid replacement input or unavailable original rolls back the event, decision and head advance.
Inherited conflicts remain. REJECT can record a stale/missing original without approving it and
leaves the prior current pointer intact. Neither action accepts a confirmation or approval sources.

Current pointers advance only for a valid exact human approval. A later original/evidence change
makes that approval invalid without deleting its history. Revoking the historical reviewer prevents
new decisions/replay by that session; it does not retroactively erase a prior human decision.
New open candidates do not replace the last approved pointer. A future effective/readiness DTO MUST
report open work separately, so a prior current cannot hide an unfinished successor.

## Trust, Validation And Remaining Work

`pi_document_review_approval_valid` is PRIVATE and validates human declarations/evidence only.
It does NOT prove that the byte inspector ran, that a human read/understood a PDF, or that a remote
object can never change. E7 adds no public validity/readiness projection. Do not expose APPROVE or
count it as application-verified before domain-separated signed byte observation, current-snapshot
revalidation, explicit reviewer UI and native acceptance are implemented. Do not reuse a media
observation token/key namespace. Existing completion records remain `not_attested`, documents
remain private with unconfirmed rights, and no technical/compatibility/publication record is changed.

The [E7 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e7-frozen-document-human-review)
records 31 embedded suites / 1,762 assertions, including 88 review assertions. Four actual 15AK
identities and one synthetic draft receive TEST-ONLY pending references; all refuse reference-only
approval despite declarations/resolution. Original data, receipts, audit and synthetic Storage rows
roll back exactly. This is not native Auth/Storage, real owner approval or multi-connection evidence.

Native CLI types, domain-separated observation/signing, application commands, counted review DTOs,
effective-state/readiness integration, reviewer UI and native isolated acceptance remain required.
Real 15AK facts, rights-approved exact images, verified preview and publication remain incomplete.
The full goal is unchanged and active.

No key, real upload, retained/hosted migration, feature activation, Docker change, commit/push/CI,
merge/deploy or repository-rule override occurred. E1-E7 remain local and outside prior fulfilled
CI authorization. Before application, reversal is a reviewed source change; after application,
preserve originals, evidence and decisions and correct forward without deleting history.
