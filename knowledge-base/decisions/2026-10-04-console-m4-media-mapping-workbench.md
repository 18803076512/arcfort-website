# M4 Exact-SKU Media Mapping Workbench

Date: 2026-10-04
Status: local default-off implementation and synthetic UI validation; not activated.

## Decision And Scope

Connect the [B14 observed commands](2026-10-04-console-m4-observed-media-commands.md) to a private
SKU workbench at `/console/products/[id]/media`. This completes the local human-control/read
interface, not B14's native-provider/activation gate. Preserve the [B13 review rules](2026-10-04-console-m4-media-mapping-review.md),
immutable originals, separate evidence dimensions and repository public authority.

Owner/editor may propose; owner/editor/reviewer may record sources and submit; only current
owner/reviewer may decide. Viewer/publisher can compare and ordinarily inspect but receive no
mutation controls. Application and SQL independently enforce roles; hidden controls are not
authorization. Keep all working/original/media flags default-off and exact-loopback only.

## Read And Human Evidence Boundaries

Read counted, explicitly projected same-SKU heads, latest states, effective mappings, immutable
revisions, selected links and ALL bound evidence, including unselected contradictions. Fetch ID
batches of at most 100 and continue lower-cap provider pages; reject missing/duplicate/foreign
links, unsupported scope, truncated history and detectable drift. Original choices retain the
existing counted 25-row RPC. Never include Storage paths, raw snapshots, file hashes, actors,
signing secrets or observation tokens in the serialized workbench/history DTO.

Recheck heads AND state/effective projections after composing the workbench: review decisions need
not increment a head. Recheck current access and scoped history heads. These bounded reads are not
an atomic database snapshot; the authoritative command/inspector snapshot checks remain mandatory.

Current internal validity and recorded byte observation are separate booleans. A valid SQL-only
decision is labeled internal approval only with a missing-inspection warning, not as complete
application approval. Invalid current proof remains visible; legacy mappings are not silently
restored. Preserve immutable history's original verification state rather than rewriting it from
the current decision. Every reviewed original remains private and not publication ready.

Pending candidates are frozen. APPROVE requires selected qualifying Level A rights AND exact-match
source IDs, a fresh exact-mapping observation and three explicit human acknowledgements. Known
contradictions require a resolution. EDIT appends an unconfirmed replacement and preserves SQL
conflict/history rules; REJECT retains preceding mappings. New evidence forces latest-record
reload before any further decision. A successful source entry does not select or approve itself.

The browser checks observation shape/binding/expiry only; it does not verify HMAC or own a secret.
Keep the token in component memory, absent from DOM, URLs and browser persistence. Inline raster
load (or explicit TIFF download) enables acknowledgements; closing, failure, candidate/asset change,
replacement mode or expiry clears them. A fresh inspection still requires fresh human confirmations.
No UI can prove someone actually looked at an image; the declarations retain that human boundary.

## Validation And Reversal

Seven read/domain groups include 1,004 sources under a 17-row provider cap, 26 originals, role and
same-revision drift, exact event/history scope, separate observation/current state and token expiry.
Fourteen real-browser groups use synthetic HTTP transport only: all six command forms, conflicts,
reference-only refusal, roles, stale/error/close/expiry/recheck states, keyboard focus restoration,
unsaved navigation and six widths. Native Auth/Storage/DB approval is not proven by those fixtures.
The [B15 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b15-sku-media-mapping-workbench)
owns exact files, checks, screenshot paths and release blockers.

The first production probe incorrectly required HTTP 307 after streaming had begun. Installed
Next 15.5.22's `make-get-server-inserted-html` emits a meta redirect in that case, matching the
[official redirect documentation](https://nextjs.org/docs/app/api-reference/functions/redirect)
(reviewed 2026-10-04). Check the exact same-origin redirect marker/target, private headers, absent
catalog payload AND actual browser login destination; HTTP 200 alone is not a pass.

No migration/key/flag/provider or public-data change, commit/push, merge or deployment occurred.
Pending B11-B13-only submission approval does not cover B14/B15. Before activation, obtain fresh
authorized disposable native/Auth/PostgREST/Storage/concurrency acceptance and real owner-supplied
15AK image/right/match evidence. Public derivative governance, supporting records, verified preview,
QA and separately authorized publication remain open. Full V1 is not achieved; no repository rule
override applies. Reversal is reviewed local code removal while preserving all earlier work/history.
