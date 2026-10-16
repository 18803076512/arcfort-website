# M4 Observed Media Review Commands

Date: 2026-10-04
Status: local implementation and embedded/synthetic validation only; unapplied and disabled.

## Decision And Trust Boundary

Extend [B13](2026-10-04-console-m4-media-mapping-review.md) with application command contracts and
an independently verified server observation. This supersedes its private-mutation-only checkpoint,
not its source, human decision, immutable history or public-output rules. Preparing authenticated
SQL wrappers is not applying a migration or activating a reviewer interface.

Reuse the exact private stored-original inspector. Its ordinary SKU/asset mode remains read-only
for all five Console roles. Its new pending-mapping mode requires current owner/reviewer access,
the separate default-off `CONSOLE_MEDIA_REVIEW_ENABLED` flag, originals/working flags and the exact
loopback destination. Read an exact pending snapshot before and after bounded full-raster byte
validation. Refuse changed role, identity, candidate, original metadata, cancellation or provider
failure before issuing an observation. Return unchanged bytes and a private response header, not a
Storage URL, transformed original or public asset.

Use Node's built-in HMAC-SHA-256 and the existing
[PostgreSQL pgcrypto HMAC primitive](https://www.postgresql.org/docs/current/pgcrypto.html#PGCRYPTO-GENERAL-HASHING-FUNCS).
The versioned, fixed-field ASCII payload binds observer key ID, authenticated actor, exact working
adoption, mapping ID, head sequence, submitted digest, original metadata digest, issued/expiry
seconds and a random UUID nonce. The mapping/original digests bind the asset, intent, manifest,
Storage identity and selected/known conflicting evidence. Lifetime is at most five minutes.
Database validation independently checks every binding, current snapshot, active key/time window
and all 32 signature bytes. A supplied checkbox, copied digest or unsigned RPC snapshot cannot
substitute for the signing secret or successful actual-byte inspection.

APPROVE through `public.pi_review_media_mapping` requires that observation AND B13's separate human
inspection/rights/exact-product declarations, selected qualifying sources and conflict resolution.
EDIT/REJECT cannot carry an observation or confirmation and retain their existing atomic correction
and rejection semantics. Authority/role checks precede receipt replay; only an exact completed
actor-scoped request may replay after expiry/key rotation. A reused nonce rolls back the entire
new decision. Store only the token digest and bound observation metadata, never the raw token,
signature or secret in command receipts, verification events, audit records or logs.

## Key Provisioning And Historical Evidence

The migration creates an empty private key table with forced RLS and no anonymous/authenticated/
service access. It does not provision a key. Server-only environment names are
`CONSOLE_MEDIA_OBSERVATION_KEY_ID` and `CONSOLE_MEDIA_OBSERVATION_SECRET_HEX`; no actual value is
documented, configured or committed. Native/disposable acceptance must provision an ephemeral
cryptographically random 32-byte key only after the pristine target checks. Never reuse fixture
keys. Real retained/hosted provisioning or activation requires its own exact target/action approval,
protected administrative handling, matching server configuration and tested rotation/recovery.
Do not put a secret in browser configuration, a CLI argument or shell/provider output.

The immutable private observation ledger has no direct caller/service grant. The authenticated
reader helper `pi_media_review_observed` reports historical observation separately from B13's
current human-evidence validity. Expiry/rotation prevents NEW approval; it does not rewrite a past
inspection. Private SQL foundation fixtures can still exercise human-only decisions without byte
evidence. They are distinguishable by a missing observation and are not application acceptance.
Future reviewer DTOs, verified previews and QA must require both current validity and the matching
observation before describing an application-approved mapping as inspected.

A server observation proves bytes were processed, not that a person viewed or understood them,
and not permanent byte attestation of a mutable external service. Human controls, current byte
revalidation and governed public-output QA remain necessary. Original SQL completions remain
`not_attested`; internally reviewed originals remain private and not search/publication eligible.

## Validation, Remaining Gates And Reversal

The [B14 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b14-observed-media-review-commands)
owns exact files and checks. All 18 embedded suites/892 assertions, Node/pgcrypto HMAC parity,
11 inspector groups, five media command groups and original technical/compatibility/upload
regressions pass. Synthetic SQL keys/metadata and mocked SDK downloads are not real Auth/Storage
or human product evidence. Actual 15AK identities retain original rows and zero observations,
decisions, approval and publication.

No key provisioning, retained/hosted migration, active flag, commit/push, merge, deployment or
canonical/public data change occurred. The pending B11-B13 CI-only question does not include this
new B14 batch. Native SQL/full CLI types, Auth/PostgREST/Storage, multi-connection races, usable
reviewer UI, real 15AK evidence and complete V1 remain outstanding. Activation/release is BLOCKED.

Before application, reversal is reviewed removal of unapplied code. After application, retain
observation/decision history, revoke the relevant key/activation and use a reviewed forward
correction. Do not delete originals, reset adopted data or silently remove evidence.
