# M4 Immutable Media Mapping Drafts

Date: 2026-10-04
Status: local schema foundation; no retained or hosted application, activation or submission.

## Decision And Scope

Prepare exact-SKU mapping drafts after the [source binding](2026-09-26-console-m4-media-evidence.md),
[original upload](2026-09-27-console-m4-original-upload.md) and
[stored-original inspection](2026-10-04-console-m4-stored-original-inspection.md) boundaries.
A draft is not an effective `product_media` row, legal permission, exact-product approval or a
public image. The governed repository registry remains the public source and rollback authority.

Use a stable head for one SKU, media role and slot, append-only content revisions and immutable
source links. Main has only slot zero; other roles have bounded slots. Each revision retains its
predecessor, alt text, actor, reason and metadata fingerprints of the SKU, asset and exact completed
original. A legacy asset, incomplete upload or another SKU's original cannot substitute for that
original. Equal recorded file hashes do not merge asset identities or transfer evidence.

Owner/editor may propose; owner/editor/reviewer may submit. Check current authenticated authority
and role before actor-scoped receipt replay, retaining the existing authority-then-role lock order.
Force RLS and grant current Console readers SELECT only. Keep the mutations and capability private
with no caller/service execution grant or public RPC wrapper. Never disable an immutable trigger to
fill a digest: the creating command can fill its initial zero digest only when other content is
unchanged and the computed digest agrees; completed digests cannot be rewritten.

## Submission And Conflicts

Submission binds the exact current head sequence and complete proposal digest, including selected
source records/bindings and all known contradictions for the same SKU/asset/role, even if omitted
from the proposal. Changed SKU identity, recorded original metadata/version or newly known conflict
invalidates submission. Freeze a submitted proposal as `pending`; do not silently overwrite it.
Supersede only an ordinary unsubmitted proposal, retaining its content and predecessor history.

Known contradictions derive `DATA_CONFLICT` and cannot be erased by ordinary saving or dropping a
source selection. Non-conflicting drafts remain `NEEDS_FACTORY_CONFIRMATION`. Neither state can
become `CONFIRMED`, approved or an effective image in this batch. Evidence counts distinguish usage
rights from product match; a count is not eligibility or a human decision.

An open proposed/pending mapping blocks database updates into `VERIFIED`, `READY_FOR_PUBLISH`,
`QA_PASSED` and `PUBLISHED`. The existing readiness/dashboard views are not integrated yet, and this
guard does not retroactively demote a product that was already verified. Do not expose or activate
the workflow before complete current/effective mapping and readiness integration plus explicit
APPROVE/EDIT/REJECT are implemented and verified. The read-only state view omits original Storage
paths and file hashes; raw Console-authorized table reads remain private metadata.

## Evidence Boundary And Alternatives

`private.pi_media_original_digest` validates recorded intent, completion and Storage object identity
and metadata. It does not download or attest actual raster bytes. The original completion remains
`not_attested`; later human review must inspect unchanged stored bytes and separately decide both
usage rights and exact-product match against the exact submitted revision.

Directly editing `product_media`, reusing global asset approval or treating uploaded bytes as
permission would lose that decision boundary. A separate immutable proposal preserves the original
public mapping while allowing a reviewer to compare a complete candidate. It deliberately leaves
pending/conflicting proposals blocked until the next explicit human-review batch.

## Validation And Reversal

Migration `202610040016_product_intelligence_media_mapping_drafts.sql` and its rollback-only test
implement this decision. The [B12 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b12-immutable-media-mapping-draft-foundation)
owns the candidate checks: 92 new assertions, 16 suites/722 total embedded assertions, official
public-schema type parity, two exact 17-table replays and four synthetic mapping proposals against
actual imported 15AK identities. PGlite has no Storage file bytes; these are metadata fixtures,
not actual image evidence. Native SQL/type, Auth/PostgREST/Storage and multi-connection acceptance
remain outstanding. No human approval or publication occurs.

The previous source-binding TRUNCATE refusal test now uses explicit CASCADE inside its rolled-back
fixture so the new referencing table does not stop at a foreign-key error first. It still requires
the immutable guard's `55000` refusal; no deletion or weaker runtime rule is introduced.

B1-B10 authorization/CI does not cover this new B12 batch, nor does the pending B11-only question.
No commit/push, merge, deployment, active flag, original transformation or retained/hosted schema
change occurred. Rollback of this unapplied foundation is reviewed code removal. After application,
retain mapping/source history and use a reviewed forward correction rather than dropping evidence.
Full human media workflow, real 15AK evidence and all twelve V1 requirements remain open.
