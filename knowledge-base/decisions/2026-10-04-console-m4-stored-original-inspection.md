# M4 Private Stored-Original Inspection

Date: 2026-10-04
Status: local implementation and bounded acceptance; current-candidate isolated CI outstanding.

## Decision And Scope

Add read-only `POST /console/originals/inspect` and an inline original-history inspector as the
prerequisite for later human media review. The selected-file preview is not a stored-object check.
Retain the existing independent default-off originals flag, exact loopback working-mode boundary,
invite-only provider check, same-origin command header, current confirmed Auth membership and RLS.
All five existing Console roles may inspect; upload permissions remain unchanged.

The endpoint remains inside middleware and its `/console` cookie scope. Only the existing exact
upload path skips the middleware body clone. No public or signed Storage URL is issued. Resolve the
requested SKU/asset against working state, its exact intent, completion and immutable manifest;
require the expected private bucket and actor/asset path. Download a bounded stream, decode the
complete raster and compare actual size, MIME, dimensions and SHA-256 before returning unchanged
bytes. Recheck identity/membership and request cancellation before releasing bytes.

Upload and inspection share the existing one-request-per-actor/two-actor decoder capacity in the
single loopback process. This is not distributed rate limiting. The cookie-scoped client's fetch
adapter now combines caller cancellation with its existing 12-second timeout instead of replacing
the caller signal. Request errors remain sanitized; private paths, hashes and provider payloads do
not enter the response DTO.

## Presentation And Evidence Boundary

Render JPG/PNG/WebP from a temporary browser blob URL with Fit/100%/200% controls and unchanged-file
download. TIFF is download-only. Closing/retrying cancels the read and revokes its blob URL; closing
returns focus to the history control. Incomplete receipts cannot open the inspector, and stale SKU
identity remains visibly flagged. This does not transform, rotate, re-encode or replace an original.

An observed valid original is not proof of usage rights or exact-product match. SQL completion
remains `not_attested`; no media binding, approval, mapping, lifecycle or publication state changes.
The [B8 upload decision](2026-09-27-console-m4-original-upload.md) and
[B9 cookie decision](2026-09-27-console-m4-original-cookie-scope.md) remain authoritative.

## Acceptance And Authorization

The [B11 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b11-private-stored-original-inspection)
records exact local checks and the failed full-session HTTP prerequisite. Mocked SDK service tests,
synthetic browser screenshots and default-off production HTTP checks are not actual Auth/Storage
acceptance. Extend the existing pristine disposable browser helper for real inspection/download,
read-only roles and revocation/logout; never reset the retained adopted catalog to run it.

On October 4, the owner replayed the existing B1-B10 CI-only approval. Its recorded submission is
already completed at `c190456d`, with both jobs successful in run `36411995482` and PR 130 still open
and unmerged. Do not silently extend that batch authorization to this new B11 write. No B11 commit,
push, merge, deployment, hosted/retained database write or active-setting change has been performed.

Rollback of this unapplied batch is reviewed code removal, not object/ledger deletion. Keep
activation off until fresh authorized disposable acceptance; then continue immutable exact-SKU
mapping and independent human rights/match approval. The real 15AK pilot and full V1 remain open.
