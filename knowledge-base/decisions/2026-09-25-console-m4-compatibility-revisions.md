# M4 Exact Compatibility Revisions And Review

Date: 2026-09-25
Status: local schema preparation and embedded validation; not applied to retained or hosted data.

## Scope And Authority

This implements the revision/review prerequisite described by the
[M4 evidence decision](2026-09-24-console-m4-compatibility-evidence.md), following the
[working-authority boundary](2026-09-09-console-m3-working-authority.md) and the
[technical-revision pattern](2026-09-09-console-m3-technical-revisions.md).
It does not approve factual fit, expose HTTP/RPC commands, change public data authority or extend
M3 external-write authorization to M4. The canonical four 15AK relationships remain reference-only.

## Decision

Keep original relationship rows and separate revision heads, current pointers and review metadata.
Every proposal appends a relationship and evidence links. Existing relationships must be selected
explicitly; new relationships have no implicit current value. A root retains its directed endpoints,
relationship type and assembly scope. One proposed/pending revision per root is permitted.
Saving or submitting is not a human approval, and rejected/superseded rows remain history.

Proposal digests include the complete candidate, endpoint metadata, assembly scope and sorted
evidence/source/binding rows. Submit binds that digest; review rechecks the digest, head revision,
current role and editable scope. Digests are UTC-stable and describe stored metadata, not source
file bytes or the truth of the entered evidence.

APPROVE requires exact matching supporting Level A evidence and an explicit current owner/reviewer
decision for the same candidate and source list. The additional confirmation trigger independently
checks both exact event/digest and qualifying bound evidence; a generic `exact_subject` flag, EDIT
event or fabricated matching event without an exact source binding cannot satisfy it.
Server-side attribution and immutable confirmed-history protection remain in force.

EDIT appends an unconfirmed proposal, preserving unresolved conflict. Ordinary save cannot overwrite
a pending review or erase a conflicting proposal. Contradictory source bindings remain conflicts
even when a submitted evidence link labels them supporting. Conflict approval requires a separate
resolution reason. REJECT leaves the previous current relationship intact; rejecting a first
proposal does not create a current value. Decisions, receipts and state changes are atomic.

Current/open effective relationships feed readiness and dashboard compatibility counts. Historical
approvals and rejected/superseded conflicts do not count. This deliberately strengthens migration 8's
compatibility readiness condition: **any effective unconfirmed relationship is a blocker**, even
when another relationship is confirmed. Every open compatibility proposal must also be reviewed
before VERIFIED. This supersedes the old aggregate compatibility condition only; technical, media,
SEO, QA and publishing gates are not relaxed. Zero relationships still does not prove compatibility
coverage; required relationship coverage remains a later category/release-policy requirement.

## Alternatives And Consequences

Overwriting originals loses evidence and breaks confirmed-history immutability. Counting all rows
would retain rejected conflicts and allow historical approvals to distort readiness. Requiring only
one confirmed relationship would hide a new unresolved proposal. Separate current pointers and an
RLS-preserving effective view avoid these problems without rewriting original records.

Commands keep the existing authority-then-role lock and actor/command/request receipt strategy.
New metadata tables force RLS, expose only current-role reads and receive no caller/service write
grants. Private commands receive no caller/service EXECUTE grants. The conservative common authority
lock is not evidence of multi-connection concurrency correctness or 1,000-SKU throughput.

## Evidence And Recovery

Migration: `supabase/migrations/202609240011_product_intelligence_compatibility_review.sql`.
Suite: `supabase/tests/database/product_intelligence_compatibility_review.test.sql`.
The [M4 record](../../docs/operations/product-intelligence-console-milestone-4.md) retains the full
candidate gate. Eleven embedded suites pass 417 assertions, including 92 review assertions, two
17-table source replays and four real-source proposal/current-pointer retention checks. Successful
confirmation tests use synthetic fixtures only. No real relationship or source file was approved.

No retained local database, archive, volume or hosted project received this migration. Recovery at
this checkpoint is code-only; preserve later applied history with forward corrections, never a reset
or shadow replay over working data. Application reads/wrappers/UI, real PostgreSQL/CLI type parity,
Auth/PostgREST, concurrent and persisted-browser checks remain required before release. No M4 or V1
completion, publication readiness or deployment is inferred from the private SQL commands.

Revisit the readiness policy only through a dated decision with explicit reference-only publication
semantics and matching QA tests; do not restore the weaker aggregate condition to make a test pass.
