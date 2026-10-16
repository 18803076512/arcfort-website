# Compatibility Workbench Read And Review Boundary

Date: 2026-09-26
Status: local implementation and synthetic acceptance; not enabled on retained or hosted data.

## Decision

Connect the [compatibility commands](2026-09-25-console-m4-compatibility-commands.md) to a
SKU-scoped workbench at `/console/products/[id]/compatibility`. The same default-off exact-local
flag gates both the route and its product navigation. Existing current-session/current-role and
working-adoption checks remain mandatory. This does not extend any M3 external-write approval.

Show immutable original reference, effective current relationship and saved candidate separately.
A source declaration or proposal is not confirmation. Submit/review actions bind the saved candidate
ID, revision and digest; client edits must be saved before submission. APPROVE, EDIT and REJECT
remain explicit decisions with reasons, and conflict approval requires a separate resolution.
Client approval hints require a matching bound supporting Level A source with a qualifying basis;
company-catalog membership is insufficient. Database commands recheck eligibility independently.

Retain changed fields after failures and reuse a request receipt for an unchanged retry. Warn before
discarding unrecorded sources or edited proposals. Source recording and relationship commands
interlock while in flight. A newly recorded source remains available across client-side relationship
switches but must be explicitly linked; recording it must not silently change the submitted source
list. If a retained source binding no longer matches edited scope/role, show the mismatch without
rewriting evidence or removing it automatically.

## Read Completeness And Privacy

Reuse `readAllConsoleRows` for media and compatibility. Related rows are counted and requested in
250-row ranges, advancing by the actual received length so a lower provider cap cannot masquerade
as missing evidence. Missing/duplicate/drifting/excessive rows fail closed, with a 10,000-row safety
bound per scoped collection (including the aggregate of ID batches). Relationship/source reads are
limited to one exact SKU; target lookup and history have separate 25-row pages. This supports bounded
catalog lookup, not a claim of measured 1,000-SKU concurrent throughput.

Verify current/candidate pointers against the effective set and directed endpoints. Fetch evidence
links and sources separately so nested collection truncation cannot silently hide links. The DTO
contains required identities, labels, verification/confidence, source reference/basis/version/location
and decision history. It excludes raw snapshots, custodian identifiers and source/endpoint hashes.
Entered source references remain visible to authorized Console users; no private source file is
downloaded or signed. The proposal digest is an intentional concurrency token, not a file hash.

Multi-request reads are not transactional snapshots. Detectable inconsistencies fail closed; stored
metadata labels do not prove source truth, binding freshness or approval eligibility. SQL revision
and digest checks remain authoritative for mutations. The exact PostgREST joins and current-role
behavior still require real full-stack acceptance, not only typed synthetic transport tests.

## Validation And Reversal

The [M4 runbook](../../docs/operations/product-intelligence-console-milestone-4.md) records four new
read-test groups, eleven synthetic browser groups with eighteen responsive screenshots, existing
media/editor regressions and embedded SQL checks. Accessible-name and newly-recorded-source
retention defects found during this batch were fixed and regression-tested.

No canonical product, compatibility, image or technical evidence changed. No feature flag was
enabled, no retained/hosted schema was migrated and nothing was published. Reversal is code-only
at this checkpoint; preserve later database history and use reviewed forward corrections instead
of resets. Next prepare isolated real Auth/PostgREST/persistence/concurrency acceptance without
switching or resetting adopted databases, then complete media and supporting records toward the
real 15AK preview/QA/publication pilot. Full M4 and V1 remain incomplete.

## Isolated Acceptance Preparation Checkpoint

Later on 2026-09-26, the [M4-B5 runner preparation](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b5-isolated-acceptance-preparation)
connects real-client API and browser scenarios to the existing pristine CI runner, without executing
them on retained data. Target records remain unchanged; only disposable synthetic SKU relationships
may be approved. Ordinary concurrent-save tests must precede conflict creation because a conflict
requires explicit review, not an ordinary save. Preserve imported entity/source/relationship/link
rows as well as technical/product rows. Browser opt-in must be explicit and must not inherit ambient
application flags. Prepared tests and passing local guard/embedded checks are not full-stack evidence.
The broader M4 candidate needs new scoped CI submission authorization; the old M3 approval is not
reused. This adds acceptance knowledge without changing the workbench evidence or publication gates.
