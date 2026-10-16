# M4 Authenticated Original Upload And Readback

Date: 2026-09-27
Status: local implementation and bounded tests; real Auth/Storage acceptance outstanding.

2026-09-27 correction: API placement below is superseded by the
[B9 cookie-scope decision](2026-09-27-console-m4-original-cookie-scope.md). The original path could
not receive `/console` login cookies; historical B8 tests did not prove authenticated upload.

## Decision And Scope

Extend the [B7 original-intake foundation](2026-09-27-console-m4-original-intake.md) with
authenticated upload/completion RPC wrappers, counted SKU history and an owner-facing original
intake form. Keep `CONSOLE_ORIGINALS_ENABLED` independently default-off and inside the existing
exact loopback working-mode boundary. No active configuration or retained/hosted schema is changed.
Existing M3 approval and the unanswered M4-A/B1-B5 CI question do not cover submitting B6-B8.

Use the current authenticated user client, not a service key. Recheck invite-only provider settings,
origin, current membership and owner/editor/reviewer roles before reading the original. Migration 15
retains private-function denial and authority/role locking, exposes only authenticated wrappers and
limits each actor to 100 new intents per rolling 24 hours. An existing receipt can retry at that
limit, subject to unchanged identity/payload and current authority. Other current Console roles can
read counted history, but cannot upload.

The Node handler is `POST /api/console/originals`, outside the first `/console` middleware matcher.
Installed Next.js 15.5.22 defaults its middleware body clone to 10 MiB; allowing a 25 MiB original
through that clone would truncate it. Do not raise the global clone limit or weaken the Console
matcher. The new handler owns its complete configuration, same-origin, provider/session/role and
private-response boundary; the existing staging-host isolation matcher still applies. Non-POST
methods return 405. The exact API path also receives private/no-store/no-referrer/noindex headers in
Next configuration, because a production HTTP check demonstrated the global Referrer-Policy could
override the route response. Exclude incoming request URLs for this private path from development
request logging. Public security headers and RFQ protection remain unchanged.

## Original Fidelity And Retry

Send the original as a raw body and URI-encoded JSON identity/source metadata in a bounded 8 KiB
header. Validate its strict fields and declared size/type, then apply the B7 actual-byte validator.
Reserve the server-generated actor/asset path, upload unchanged bytes with `upsert: false`, download
that exact path as a bounded stream, decode it and compare both SHA-256 and bytes before requesting
completion. Return only the asset/intent IDs or sanitized errors, never provider messages, private
paths, hashes or actor IDs.

Attempt readback even when upload reports failure: a timeout can occur after persistence. An
unchanged retry uses the same begin/completion request identities and cannot overwrite an existing
object. A changed file or source requires a new identity. UI retry identities survive only while the
form remains mounted; browser reload recovery and a resumable upload protocol are not implemented.
Incomplete intents/objects are retained, not automatically deleted. Future recovery or cleanup must
preserve evidence and have a separately reviewed retention policy.

The single-process loopback handler permits two simultaneous actors and one request per actor.
This bounds local decoder memory alongside B7 byte/pixel/time limits; it is not distributed rate
limiting. The database intent limit is not a global Storage quota and does not change pre-existing
unmanaged Storage policies. Supabase recommends resumable uploads for files over 6 MB; this local
implementation uses bounded standard uploads and full unchanged retries, not resumable guarantees.
[Supabase standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads).

## Evidence Is Not Approval

A successful server round trip checks those observed stored bytes at that time. It does not create
a trusted database byte attestation: an authorized caller can invoke the RPC wrappers directly, so
SQL completion deliberately remains `byte_verification: not_attested`. It also does not grant legal
rights, establish exact-SKU match, assign a MAIN/detail role or change publication readiness.
Future human media review must recheck the stored original and bind independent rights and match
evidence to the exact submitted SKU/asset/role revision. Recorded completion is not approval.

The history DTO contains file/source summaries, completion/current-identity flags and a page count,
not Storage locations or raw metadata. The UI preserves unsubmitted input on failure, shows local
image previews without transforming the original and labels received files as pending review.
TIFF intake is allowed but has no browser inline preview. All fixture records and raster images
used in local UI tests are synthetic, not new ArcFort evidence or approved assets.

## Verification And Rollback

The [B8 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b8-original-upload-and-readback)
owns candidate results: 627 embedded SQL assertions, actual-byte groups, mocked-SDK orchestration,
synthetic responsive UI, production HTTP privacy and public-site regressions. They do not prove a
real authenticated Storage round trip, native provider behavior, multi-connection races or fresh CI.
Keep activation off until the current candidate passes authorized disposable-stack acceptance.
Never run a reset/import/disposable runner against an adopted catalog to obtain that evidence.

Rollback of unapplied code is a reviewed batch removal with no data deletion. Once applied and used,
correct forward while retaining original bytes, intents and history. No production source authority,
public product route, original geometry or confirmed fact changes under this decision. Media review,
supporting records, verified preview/QA and the complete real 15AK publication pilot remain open.
