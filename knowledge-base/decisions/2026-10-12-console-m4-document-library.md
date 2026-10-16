# M4 Counted Private Technical Library

Date: 2026-10-12
Status: E4 local preparation verified; not activated, submitted or accepted against native providers.

## Decision

Extend the [E3 application](2026-10-11-console-m4-document-upload-application.md) with a usable
Technical Library and exact-SKU intake/version workflow. This supersedes E3's checkpoint that no
library UI exists, not its evidence, activation or submission boundaries. The earlier authorized
B11-B16/C1-C4/D1-D4 batch is complete; it does not authorize E1-E4 external writes.

Migration 28 provides one authenticated reader RPC with 25-row pages, deterministic timestamp/ID
ordering and an exact total even for empty or out-of-range pages. Global scope means all working
SKUs, not every document in the database. The projection exposes declared provenance, version
lineage, subject freshness and original-upload status. It excludes Storage paths, hashes, actors,
raw snapshots and approval assertions. Current Console membership is checked on every call.

Only the original intake actor with a current owner/editor/reviewer role receives their pending
begin-upload request ID. Another editor, a viewer, a revoked user or a completed upload cannot
obtain that retry identity. The ID enables an unchanged-original retry after refresh; it does not
transfer ownership, create overwrite rights, authorize a different file or establish verification.

The application checks exact scope, cardinality, unique IDs and field contracts before rendering.
The global library is a counted reading/navigation surface; writes remain inside an exact-SKU
page. Reference creation uses the existing authenticated command endpoint and independent
default-off document flag. Unknown issue dates/revisions remain null. New versions explicitly name
the prior reference and start with blank metadata; no automatic copy, supersession or confirmation.

## Interaction And Retention

The UI keeps stable command/upload identities for retries, sanitizes provider failures, checks
upload result identities and retains the selected file after a failed request. Pending upload
recovery uses the actor-only ID returned by the database. If refreshed state makes the selected
reference unavailable, its file selection remains visible with upload disabled and explicit close.
Unsaved draft/file navigation warns before leaving. Stale or foreign-pending originals cannot be
uploaded, and recorded originals are not replaceable. Corrections require forward versions.

Shared Console navigation, tables, forms, icons and typography are reused. Long document metadata
wraps, table columns retain readable minimum widths within a keyboard-focusable horizontal region,
and mobile forms become one column. No public page, product asset, technical fact or SEO route changes.

## Evidence Boundary

The [E4 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e4-counted-technical-library)
owns exact results. Embedded PostgreSQL, mocked SDK transport, real PDF children, built private HTTP
boundaries and synthetic React/browser checks are distinct evidence classes. The browser fixture
is loopback-only and has no Auth, database or upload persistence. Never use real private files there.

`recorded` means upload metadata exists; it remains `not_attested` and rights/exact-SKU review is
pending. No arbitrary PDF is rendered inline, no source URL fetched and no document fact approved.
Private stored-original inspection, durable trusted observation, human rights/scope review,
native Auth/Storage/browser/race acceptance and full CLI type parity remain required. Structural
parsing is not malware clearance or an OS memory sandbox. Real 15AK and all twelve V1 gates remain.

## Reversal And Next Gate

Before separately authorized application, reverse only a reviewed code batch. After application,
retain immutable references, receipts, files and audit history and correct through forward records.
Never reset a retained environment or use a feature flag as database authorization.

Next build private stored-original inspection and governed human document review, then prepare
native isolated acceptance and obtain exact-batch/branch authorization before commit/push/CI.
No merge, deployment, retained/hosted DB mutation, real upload, Docker repair, authority cutover,
commercial-policy change or repository-rule override occurred in E4.
