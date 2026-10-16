# M4 Private Document Original Inspection

Date: 2026-10-12
Status: E5 local preparation verified; not activated or accepted against native document providers.

## Decision

Extend the [E4 library](2026-10-12-console-m4-document-library.md) with read-only inspection of a
recorded exact-SKU PDF. This supersedes only E4's missing-inspection checkpoint. The default-off
local boundary, immutable originals, pending verification and external-write approval rules remain.

Migration 29 adds `pi_document_original_snapshot(variant_uuid,document_uuid)`. Current Console
readers may obtain a snapshot only when the working-SKU binding, upload intent, completion and
Storage object still agree. The digest covers the frozen binding/intent/completion and relevant
object identity, path, bucket, owner, version and metadata. Read-driven access timestamps are not
part of identity. This function makes no writes and grants nothing to anonymous/service roles.

The `/console/documents/inspect` handler accepts only bounded same-origin JSON under the existing
document flag and `/console` cookie scope. It checks current confirmed membership, obtains the
snapshot, reads the entire private original with cancellation/deadlines and validates actual PDF
bytes in the existing child parser. Declared byte size, SHA-256 and page count must match. Current
identity/roles and the snapshot are checked again before returning bytes. Image upload, PDF upload
and inspection share the existing per-actor/process work capacity.

The response is private/no-store/noindex, attachment-only, `nosniff`, same-origin and sandboxed.
Its browser receipt includes only document identity, filename, size and page count. Storage paths,
hashes, actor IDs and snapshot digests are not sent by this HTTP handler. All five current reader
roles can inspect, consistent with existing private Storage reading; editorial authority is not
expanded. This is not an atomic transaction across the database and Storage service.

## Interaction And Evidence Limits

The library offers inspection only for current, recorded originals. The browser verifies the
receipt against the displayed document, counts response bytes, bounds reads, and supplies a local
Blob download. It never embeds PDF content in an iframe, object or viewer. Closing, retrying or
unmounting aborts work and revokes the temporary URL; heading and return focus are preserved.
The upload selection and unsaved metadata draft are independent of the inspection panel.

Successful download is neither a durable trusted observation nor proof that a human read the
document. Completion remains `not_attested`; rights and exact-SKU review remain pending. No fact,
fitment, source level, publication status or current evidence pointer is upgraded. The parser is
structural, not malware clearance, full rendering or an OS/RSS memory sandbox. Data already released
to an authorized reader cannot be remotely recalled after a later membership change.

## Verification And Reversal

The [E5 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e5-private-pdf-inspection)
records SQL, mocked SDK, synthetic browser, independent traced packages and actual HTTP evidence
separately. The HTTP test initially refused provider-absent mode because local Auth was running;
the final normal-mode test performed only read-only settings checks and invalid-form boundaries.
No retained process was stopped or provider configuration changed to make a test pass.

Before authorized application, rollback means a reviewed code reversal only. After application,
retain originals/receipts/history and use forward corrections. E1-E5 are not covered by the completed
B11-B16/C1-C4/D1-D4 CI approval. No commit/push/merge/deployment, retained/hosted migration, real upload,
Docker/WSL repair, source-authority transition or repository-rule override occurred.

Next implement domain-separated trusted document observation and explicit human rights/exact-SKU
review, then native isolated acceptance under exact new authorization. Full V1 and the real 15AK
pilot remain incomplete. No real product evidence was added by these synthetic checks.
