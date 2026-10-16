# M4 Private Original Intake Boundary

Date: 2026-09-27
Status: local foundation verified; no retained/hosted migration or upload interface.

## Decision

Extend the [media evidence boundary](2026-09-26-console-m4-media-evidence.md) with immutable upload
intent/completion ledgers. Reserve a generated path for one actor, asset and unchanged adopted SKU
identity before receiving an original. Completion requires matching Storage owner, size and MIME
metadata, and creates a private, blocked, unapproved asset. It never creates a product assignment or
human verification event. Actor-scoped retries retain current-role and identity checks.

Restrictive authenticated Storage policies cover only `pi-product-originals/working-originals/`.
An insert requires the actor's current, incomplete intent; update, move and delete are denied in
that namespace. Existing legacy/evidence policies are unchanged. This is not protection against a
Storage administrator or service-role bypass. Incomplete uploads are retained; automated deletion
is not part of this decision. Recovery/cleanup needs its own reviewed retention policy.

The intake functions remain private without caller/service EXECUTE grants. The only new public
function is a read-only RLS predicate. HTTP/UI integration must retain authenticated user clients,
same-origin checks, bounded reads/concurrency, default-off activation, stable request identities,
upload-through-API and actual object readback. No additional runtime service key is introduced.

## Three Separate Claims

1. A declared manifest and matching Storage row do not prove file bytes. Completion explicitly stores
   `byte_verification: not_attested`. Supabase stores object metadata separately from the file and
   requires file mutations through its API, not SQL writes to `storage.objects`.
   [Storage schema](https://supabase.com/docs/guides/storage/schema/design).
2. The server-only file validator reads bounded bytes, checks filename/signature/MIME/extension,
   fully decodes one raster and hashes the original bytes. This proves only the submitted buffer,
   not its persisted Storage object. It does not establish rights, SKU match or malware clearance.
3. Human rights and exact-product review remain separate exact-SKU decisions. No successful intake,
   equal hash, decoded image or declared `own_photo` classification grants either approval.

Use `owner_id` for Storage uploader identity; it is not legal ownership evidence. Supabase documents
that ownership alone provides no access control and that the old `owner` field is deprecated.
[Storage ownership](https://supabase.com/docs/guides/storage/security/ownership).

## Byte Fidelity And Resource Bounds

Allow JPEG, PNG, WebP and TIFF only; reject animation/multiple pages, sub-images, corrupt/truncated
rasters and vector/document inputs. Limit originals to 25 MiB, 16,000 per dimension and 40 million
pixels. Bound reads to 15 seconds and 8,192 attempts, including empty chunks, and use a ten-second
Sharp pipeline timeout. Before an HTTP endpoint is enabled, also enforce request/concurrency limits.

Sharp `0.34.5` is now an explicit dependency at the exact version already present through Next.js;
the lockfile adds no package/version/integrity change. Metadata inspection is header-only, so it is
not a complete raster validation. [Sharp metadata](https://sharp.pixelplumbing.com/api-input/).
The installed version's `src/pipeline.cc` calls `SetTimeout`; `stats.cc` and `metadata.cc` do not.
Use the full `raw().toBuffer()` pipeline for decoding, discard those pixels, and return the unchanged
original buffer. Do not save a decoded/re-encoded replacement, rotate EXIF pixels or edit geometry.
The pipeline timeout is not claimed as a hard wall-clock sandbox around every native header read.

## Verification And Reversal

Migration 14 and its 70 SQL assertions run only in the embedded test database. Its synthetic Storage
table/metadata fixtures test RLS expressions, not the real Storage API/provider. Six actual byte-test
groups include corruption, animation, orientation preservation, bounds, empty-chunk refusal and a
real stalled-read timeout. The [M4 record](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b7-private-original-intake-foundation)
owns the complete results and missing integration evidence.

This changes code only. No retained/hosted schema, original asset, mapping, public fact, active flag
or source authority changed. Roll back unapplied code as a reviewed batch, not by dropping retained
evidence or deleting uploads. After future application, use forward corrections preserving history.
The pending M4-A/B1-B5 CI submission question does not authorize submitting B6/B7 or applying them.
