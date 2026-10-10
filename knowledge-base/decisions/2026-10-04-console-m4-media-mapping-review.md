# M4 Exact-SKU Media Mapping Review

Date: 2026-10-04
Status: local private SQL and embedded validation; no retained/hosted application or activation.

## Decision

Extend the [B12 mapping foundation](2026-10-04-console-m4-media-mapping-drafts.md) with immutable
APPROVE/EDIT/REJECT decisions, exact pending-snapshot events and separate current pointers.
This replaces B12's unfinished decision/current/readiness boundary only. It does not weaken source
scope, original identity, immutable content, default-off flags or public repository authority.

Only a current authenticated owner/reviewer may decide. Authority/role checks and locks precede
actor-scoped receipt replay. A decision is bound to the current head sequence, original submitted
digest, full pending candidate snapshot, sorted submitted sources and the current observed digest.
Immutable event/decision guards independently enforce these bindings and server attribution;
transaction capability alone cannot approve a candidate or set a current pointer.

APPROVE requires selected qualifying Level A supporting evidence for BOTH `usage_rights` and
`product_match`, separately named source IDs, the unchanged original metadata digest, and explicit
human declarations that the original was inspected, rights confirmed and exact product confirmed.
Extra keys, wrong dimensions, unselected sources, reference-only sources, stale original/evidence
and unknown decisions fail closed. `DATA_CONFLICT` additionally requires a meaningful explicit
resolution reason. A newly recorded contradiction invalidates an already approved current mapping.

The declaration is human evidence, not machine proof of raster bytes. SQL still cannot download or
attest a Storage object. Preserve the original completion's `not_attested` marker and the
[private byte inspector](2026-10-04-console-m4-stored-original-inspection.md). Before exposing approval
commands, implement authenticated actual-byte inspection/revalidation and an exact observation
binding in the application, explicit reviewer controls, fresh native/provider acceptance and the
separate activation decision. A supplied boolean or metadata digest is not sufficient proof that
the inspector actually ran. No public mutation wrapper or HTTP/UI review command is granted here.

## History, Correction And Effective State

APPROVE changes only the exact SKU/role/slot current pointer. It never edits the original proposal's
verification status, global asset rights/match/publication fields or any `product_media` row.
Past decisions survive later reviewer-role revocation; revoked sessions cannot read/replay them.
Changed object identity, source fingerprints or new contradictions invalidate current proof instead.

EDIT closes the pending candidate as superseded and atomically appends an unconfirmed replacement,
with a predecessor and validated exact asset/copy/source scope. An inherited unresolved conflict
remains `DATA_CONFLICT`; selecting a different asset or omitting evidence is not automatic resolution.
Invalid replacement input rolls back the event, decision and candidate changes together.
REJECT closes the pending proposal and keeps the prior current or legacy value. It may reject a
stale original while recording both submitted and observed digests; stale metadata never approves.
Neither EDIT nor REJECT can carry a confirmation or silently become APPROVE.

The invoker effective projection includes current and open candidates, hides rejected/superseded
history and replaces a legacy slot only after approval. It does not fall back to legacy if that
current approval later becomes invalid. Internal approved originals remain private and
`publication_ready=false`; they are not public/search-eligible assets. A governed derivative/output
and publication workflow is still required before they can satisfy public main-image readiness.

## Readiness And Contract Preservation

Open mappings and invalid current approvals are independent readiness blockers and lifecycle guards.
Dashboard verified/ready counts cannot hide those new blockers behind historical lifecycle states.
This does not retroactively rewrite stored lifecycle states or claim complete release QA.

Preserve all twenty columns of `pi_variant_readiness` and the existing nine-metric dashboard contract.
Use separate invoker `pi_media_mapping_readiness` and `pi_media_mapping_metrics` views for new details.
An initial additive-column implementation was rejected by the original contract assertion; the
contract was preserved rather than weakened. Technical, compatibility, SEO and publication gates
remain intact. Missing required view coverage and category-specific media policy remain later QA work.

## Validation And Recovery

Migration `202610040017_product_intelligence_media_mapping_review.sql` and the 109-assertion suite
implement the decision. The [B13 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b13-exact-sku-media-mapping-review)
records all 17 embedded suites/831 assertions, complete official public type parity, two exact
17-table replays and original pilot preservation. Successful decisions use synthetic SQL fixtures
only. All four actual imported 15AK identities refuse reference-only approval and retain zero
decisions/approvals/publications, with original product/fact/asset/mapping rows unchanged.

Pristine-runner guards now also refuse any rows in all five new mapping tables; the existing real
runner retains zero mapping rows after its old upload-only workflow. These are prepared assertions,
not newly executed real-provider evidence. No reset/import/migration over retained data is allowed.

No new CI submission, commit/push, merge, deployment, active flag, canonical fact or image changed.
Previous B1-B10 authorization and the pending B11-only question do not authorize this new B13 write.
Native SQL/CLI type parity, Auth/PostgREST/Storage, concurrent races, usable owner UI and real 15AK
evidence remain outstanding. Full V1 is not achieved. Reversal before application is reviewed code
removal; after application preserve decisions/history and use a reviewed forward correction.
