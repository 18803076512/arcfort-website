# M4 Packaging Application Workbench

Date: 2026-10-06
Status: local implementation and synthetic/embedded verification; native activation not performed.

## Decision And Authority

Extend the [D2 review decision](2026-10-05-console-m4-packaging-human-review.md) with narrow public
application commands, counted source/current/history reads and a private SKU packaging workbench.
The original physical records, MOQ and lead-time notes retain their prior authority. This prepares
usable packaging review in the approved V1 architecture; it does not confirm actual supplied
quantities, change commercial terms or authorize publication.

Migration 24 exposes four authenticated wrappers for source intake, proposal, frozen submission
and human review. The private implementations retain current membership, role, adopted authority,
idempotency, expected revision and frozen-evidence checks. No anonymous/service/private-function
execution or direct table mutation is granted. Invoker-security source/revision views expose the
exact physical copy, explicit original lineage, source freshness and known contradiction IDs.
Historical-count conflicts use D2's same-original or same-head historical-copy scope.

`CONSOLE_PACKAGING_ENABLED` is a separate default-off application flag and requires the existing
exact local working configuration. No flag or database is activated here. The flag controls the
application entrance, not SQL authorization: an applied wrapper is governed by database roles and
authority even when the UI is hidden. Disabling the UI is not database permission revocation.

## Application And Human Review

Reuse the existing command route, same-origin protection, current-session authorization, sanitized
errors, retry receipts and Console navigation/form components. Parse exact description/count/unit
and original IDs; reject commercial fields and client authority injection. Unknown count and unit
remain paired nulls. A positive explicit count and unit are required for actual confirmation; no
package hierarchy, conversion or quantity is inferred from a description.

The workbench separates current approval from the latest proposal, displays known historical
contradictions, shows selected source provenance and paginated decisions, and retains imported MOQ
and lead-time notes in read-only output. Owner/editor propose; owner/editor/reviewer add evidence
and submit; owner/reviewer decide. Viewer/publisher have no mutation controls. Adding a source does
not select it, approve it or confirm a product automatically.

Source-entry edits lock their physical target and original lineage until discarded or submitted.
Dirty physical/selected-evidence changes cannot submit or approve the old frozen proposal. Stale
proposal/source/approval states are visible; a stale receipt requires reload. Status or approval-
source changes clear human acknowledgement checkboxes. APPROVE requires exact selected qualifying
evidence and explicit declarations; EDIT creates an unapproved correction; REJECT has no approval
fields. Source metadata and automated clicks in tests are not human inspection of actual evidence.

## Read Consistency

Reads use exact counts, stable ordering and bounded pagination, validate SKU/head/original/current/
source relationships, and recheck current roles and observed source/head/original/effective state.
Displayed missing-quantity, unresolved and conflict totals must match the returned effective records;
a readiness reread rejects observed drift. History requires exact sequence/count and scoped actual
decisions, distinguishing proposal status from the approved status. Provider errors never echo raw
private payloads. These HTTP rereads detect observed inconsistency, not an atomic database snapshot;
database frozen-hash/role checks remain authoritative for mutation.

## Evidence, Alternatives And Reversal

The [D3 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-d3-packaging-application-workbench)
owns the exact test results and files. Embedded SQL, intercepted SDK transport and provider-free
React browser fixtures are separate evidence levels. None proves native Auth/PostgREST, persistence,
concurrent clients, real source inspection or owner review. All actual packaging/commercial rows
remain unchanged and every effective packaging row stays not publication ready.

Rejected alternatives: editable commercial terms in this physical review, deriving quantities from
package names, approving unknown counts, and using the UI flag as the only mutation authority.
These would blur ownership or weaken exact evidence and database boundaries. Existing Console
patterns and the D2 data model are sufficient; no new runtime dependency is needed.

Before activation, reversal is a reviewed code/schema/type change. After authorized use, preserve
sources, revisions, decisions and original commercial records and use forward corrections. Do not
reset, unregister, reimport over or delete retained data to obtain a passing test.

No Docker/provider operation, retained/hosted migration, real key, active flag, canonical/public
data, SEO/RFQ, commit/push/merge/deployment or repository-rule override occurs here. D1-D3 are outside
the pending B11-B16 plus C1-C4 CI question; the fulfilled September compatibility/original/Cookie
approval does not authorize these later changes. Next prepare separately scoped disposable native
packaging acceptance and collect real 15AK packaging evidence. Documents and the full verified
preview/QA/authorized publication workflow remain required for all twelve V1 success criteria.
