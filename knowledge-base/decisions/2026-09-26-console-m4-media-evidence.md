# M4 Exact-SKU Media Evidence Intake

Date: 2026-09-26
Status: local schema preparation; no retained or hosted database application.

## Scope And Authority

This prepares the media evidence prerequisite of the approved
[V1 foundation](2026-08-30-product-intelligence-console-v1-foundation.md). It extends the
[read-only inspection boundary](../assets/console-media-inspection.md), not the canonical product
image registry or public source authority. Existing M3 and pending M4-A/B1-B5 CI-only submission
scopes do not authorize submitting this additional B6 migration.

## Decision

Bind each new source immutably to one existing product variant, asset identity, media role and
evidence dimension: `usage_rights` or `product_match`. Retain source owner, reference, date, document
location/revision, declared classification and `supports`, `contradicts` or `reference_only`.
Recording permission does not establish SKU identity, and identifying a SKU does not grant image
usage rights. A global asset approval cannot certify every SKU sharing that asset.

Store UTC-stable SHA-256 fingerprints of the complete source/asset metadata and the variant's
identity fields (`id`, `product_id`, `category_id`, `sku`, `model`). Changed recorded file hashes,
provenance or product identity invalidate the binding. Identical recorded file hashes do not merge
different asset identities. Another role or SKU requires another explicit source binding.
These are metadata fingerprints, not a fresh hash of image bytes, proof of original-file existence,
ownership, an exact-product visual inspection or permission to publish.

Only current owner/editor/reviewer sessions may record sources, within the adopted pilot or a draft
created under that adoption. Check actual product and asset existence and lock both before
fingerprinting. Retain authority/role locking and actor-scoped request receipts, including on retry.
Force RLS; allow existing current Console roles to read. Keep the intake private with no public RPC
wrapper or caller/service EXECUTE grant. Bound sources and binding rows are append-only; a correction
is a new record, never an edit that silently changes a previous review's evidence.

The eligibility helper evaluates declared metadata only. A supporting Level A company record with
a qualifying dimension-specific basis may support later human review. Catalog references,
contradictions, reference-only assertions and Levels B/C/D do not qualify. Neither successful intake
nor eligibility changes a media assignment, rights/match/publication status, verification event,
readiness or public output. A source cannot substitute for a technical or compatibility binding.

## Consequences And Alternatives

Reusing `exact_subject` alone would lose SKU/role/dimension scope. Reusing a global asset status
would incorrectly transfer an approval between products. Separate immutable bindings preserve the
existing source model while preventing both shortcuts. The full asset fingerprint deliberately
invalidates evidence on any metadata change; future review commands must account for this rather
than mutate global asset approval and accidentally invalidate their own proof.

The next media batch still needs original-file intake and byte verification, immutable mapping
proposals, explicit APPROVE/EDIT/REJECT, both evidence dimensions tied to the exact submitted revision,
conflict preservation, effective/current views and readiness integration. Private storage paths
must not leak into public DTOs. No complete media workflow or V1 success criterion is closed here.

## Evidence And Reversal

Migration `202609260013_product_intelligence_media_sources.sql` and its database test implement this
boundary. The [M4 record](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b6-exact-sku-media-source-intake)
owns candidate validation and outstanding full-stack evidence. All 80 new embedded assertions pass;
four explicitly synthetic intake fixtures also exercise actual imported 15AK SKU/asset identities
without modifying original media/mappings or producing approval/publication events.

This is code-only preparation. No retained database, original file, storage policy, hosted project
or public registry changed. Future application needs destination review and applicable permission;
never reset an adopted database to apply or undo this migration. Once source records exist, retain
their history and use a reviewed forward correction rather than dropping evidence.
