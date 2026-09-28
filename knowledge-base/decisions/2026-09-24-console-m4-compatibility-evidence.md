# M4 Exact Compatibility Evidence Intake

Date: 2026-09-24
Status: local schema preparation implemented; not applied to retained or hosted databases.

## Scope And Authority

This implements an evidence-intake prerequisite of the approved
[V1 architecture](../../docs/product-intelligence-console-v1-architecture.md), using the
[working-authority boundary](2026-09-09-console-m3-working-authority.md) and the existing atomic
command receipts. It does not extend the old M3 external-write approval to M4, change public data
authority, or supersede the canonical compatibility registry's factual evidence.

## Decision

Store new compatibility source bindings as immutable records with exact product variant, directed
subject/target UUIDs, relationship type, assembly scope, component role, document location/revision,
source classification and assertion. Distinguish `supports`, `contradicts` and `catalog_grouping`.
Never infer these from a product name, image, shared series or reverse graph link.

Bind the complete source and endpoint metadata rows with UTC-stable SHA-256 digests. Reject
cross-SKU/target/type/scope/role reuse, changed endpoints and ambiguous product/series identities.
The digest covers database metadata, not the original document bytes or the truth of an assertion.
Source classification is an intake declaration for later review, not an authenticated factory claim.
Bound source rows and bindings cannot be edited or deleted; a correction is a new source revision.

Reuse an existing unambiguous product entity. For an adopted pilot SKU or a draft created under
the same adoption, owner/editor may create a missing product entity using its canonical SKU label.
This creates identity only, never a fitment relationship. This batch supports the four existing
SKU-directed relationship types; series-to-torch and torch-to-machine commands remain future work
requiring an explicit editable-scope design. Their exclusion here does not remove them from V1.

Intake requires a current owner/editor/reviewer, and identity creation requires owner/editor.
Existing authority-then-role locking and actor/command/request receipts remain in force, including
before a retry. New commands have no public wrappers or caller/service EXECUTE grants. The ledger
forces RLS and allows reads only through the existing current Console role policy.

The source eligibility helper is only an input to a future human-review command. It accepts a
matching supporting Level A company record with one of the canonical qualifying evidence bases.
Catalog grouping, company catalogs, contradictions and Levels B/C/D never satisfy it. Even a true
result creates no review event, confirmed relationship, readiness upgrade or publication.

## Alternatives And Consequences

A generic `exact_subject` source flag cannot establish both endpoints or the specific assembly.
Overwriting source notes loses what a reviewer actually saw. Immutable scope bindings follow the
M3 technical pattern while retaining compatibility's directed relationship semantics.

The future relationship command must use this exact binding together with immutable proposals,
submitted digests, current pointers and explicit APPROVE/EDIT/REJECT events. It must preserve
contradictions and update effective/readiness queries before exposing new revisions. Neither this
eligibility helper nor the older timestamp-only compatibility guard is a complete review workflow.
The common authority lock is deliberately conservative; multi-connection races and throughput are
not proven by the embedded engine.

## Evidence And Recovery

Migration: `supabase/migrations/202609240010_product_intelligence_compatibility_sources.sql`.
Suite: `supabase/tests/database/product_intelligence_compatibility_sources.test.sql`.
The [M4 record](../../docs/operations/product-intelligence-console-milestone-4.md) owns the exact
candidate checks and unrun integration gates. Embedded execution passed 79 new assertions, all
325 assertions across ten suites, two 17-table source replays and preservation of the four real
15AK reference relationships. No real fit was confirmed.

No existing local database, archive, volume or hosted project received this migration. Recovery for
this checkpoint is code-only. Do not reset adopted data or remove history during later application;
any such application still needs exact-target review and the applicable approval. Before exposing
commands, run fresh PostgreSQL/CLI-type/Auth/PostgREST/concurrency and persisted browser checks.
