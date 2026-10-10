# M4 Packaging Frozen Human Review

Date: 2026-10-05
Status: local migration and embedded verification; native activation and owner workbench incomplete.

## Decision And Authority

Extend the [D1 source decision](2026-10-05-console-m4-packaging-source-intake.md) with immutable
physical packaging proposals, frozen submission, human APPROVE/EDIT/REJECT, effective records and
readiness. Original `packaging_records`, including MOQ and lead-time notes, remain unchanged. This
is the packaging part of the approved V1 architecture, not commercial-policy editing or publication.

Migration 23 adds five forced-RLS tables: stable exact-SKU/slot heads, revisions, selected evidence,
append-only decisions and current pointers. An optional original link is explicit, unique, belongs
to the exact SKU and cannot be reassigned. Known descriptions/counts/units remain exact; unknown
quantity and unit remain paired nulls. Corrections never infer package hierarchy or convert units.

Frozen digests bind the copy, head scope, current SKU identity, full original row, selected immutable
source/binding rows and known contradictions. For a linked original, all contradictions against
that original participate even if they describe another count. For a new package without original
lineage, contradictions matching any historical copy in the same head participate. This prevents
changing the count from hiding later evidence against an earlier count. Different heads are not
inferred aliases or merged by appearance.

Ordinary saves cannot overwrite pending or conflicted proposals. EDIT atomically records the
decision and creates a new unapproved revision. Unresolved or newly observed predecessor conflicts
carry into the next revision, including after REJECT and ordinary resave. Rejecting a proposed
value is not an evidence-conflict resolution. New contradictions invalidate earlier approvals;
an invalid current remains visible as `DATA_CONFLICT`, without silently restoring the original.

## Human Decisions

Owner/editor may propose; owner/editor/reviewer may submit; only current owner/reviewer may decide.
Preserve authority-then-role lock order, actor/request/payload receipts, expected sequence and exact
submitted/fresh digests. Independent event/decision/current/evidence guards also validate scoped
internal writes. Revoked roles cannot replay receipts; a historical decision does not require its
reviewer to retain membership forever. Stored digests use a fixed timezone.

APPROVE requires a selected exact source and acknowledgements `source_checked`, `packaging_checked`,
`commercial_terms_unchanged` and `arcfort_packaging_confirmed`. The last is true only for `CONFIRMED`.
Confirmation requires a known positive quantity/unit and declared qualifying Level A packaging,
factory, controlled-drawing or approved-sample evidence. Official manufacturer Level B catalog
evidence supports only `OEM_REFERENCE`. Company catalogs, standards, secondary references and
reference-only Level A cannot confirm ArcFort's supplied packaging. Conflicts require an explicit
meaningful resolution. EDIT/REJECT cannot carry approval fields or change commercial terms.

Source metadata, test declarations and simulated decisions are not actual document inspection or
real ArcFort packaging evidence. Real confirmation still requires an authorized human and the
matching source. No actual product-specific quantity is confirmed by this development batch.

## Readiness And Visibility

Effective reads preserve original/current/open history. Every effective record remains
`publication_ready=false`. Unknown counts, open proposals, unconfirmed originals, manufacturer
references and invalid current approvals block the packaging gate. A SKU with no effective
packaging records has `packaging_count=0` and one unresolved missing-record blocker; it does not
acquire a fabricated quantity row. Rejected-only history remains missing.

The packaging trigger also blocks VERIFIED, READY_FOR_PUBLISH, QA_PASSED and PUBLISHED when no
original/current packaging exists. Preserve all other technical, compatibility, media and OEM
gates, the twenty-column shared readiness view and the nine-metric dashboard contract. Existing
rows are not retroactively changed; current reads expose their unresolved state. Invoker-security
aggregation does not expose missing SKU identities to unassigned sessions.

Only current Console readers receive SELECT. The single public helper is a guarded Boolean
validity read; mutation functions remain private with no application RPC, flag or UI activation.
Disposable pristine guards require all six packaging tables empty and preserve complete original
packaging rows. Existing data is refusal, never permission to reset or replay over retained work.

## Evidence And Remaining Work

The [D2 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-d2-frozen-packaging-human-review)
owns exact checks, including the initial old-fixture failure and corrected prerequisite setup.
Embedded tests use simulated actors and sequential in-memory PostgreSQL. The real-identity
rehearsal creates five TEST-ONLY reference proposals, proves actual confirmation refusal and
rolls back all changes while retaining all 43 original packaging/commercial records. Native
Auth/PostgREST, multi-connection races, actual documents and owner browser review remain unproven.

Before activation, reversal is a reviewed code change/type regeneration. After separately
authorized use, preserve source/audit/decision history and apply forward corrections. No retained
or hosted migration, Docker operation, provider request, key, active flag, canonical/public data,
SEO/RFQ, commit/push/merge/deployment or repository-rule override occurs in this batch. The pending
B11-B16 plus C1-C4 CI-only question does not include D1/D2; the earlier fulfilled approval is not
expanded by a repeated reply.

Next connect the packaging commands and counted reads to an owner/editor/reviewer workbench, then
obtain native isolated acceptance. Technical documents, real 15AK evidence and the verified
preview/QA/authorized publication workflow remain required for all twelve V1 success criteria.
