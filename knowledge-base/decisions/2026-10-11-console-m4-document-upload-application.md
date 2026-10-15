# M4 Private Document Upload Application

Date: 2026-10-11
Status: E3 local code and synthetic transport/package/HTTP checks verified; not activated or submitted.

## Scope And Authority

Extend [E1 references](2026-10-11-console-m4-document-reference-intake.md) and
[E2 originals](2026-10-11-console-m4-document-original-intake.md) with authenticated user-session
wrappers and a raw PDF upload handler. This supersedes their checkpoint statement that no public
RPC/upload endpoint is implemented, not their evidence or activation boundaries. E1/E2 records
remain historical. No document intake grants factual confirmation, rights or publication approval.

Migration 27 exposes only reference creation, upload reservation and metadata completion. Each
delegates to its existing private guard, including current roles, adoption, immutable reference,
actor-scoped receipts and upload quota. Anonymous/service execution and direct private-function
access remain denied. Browser feature flags are not database authorization; direct authenticated
RPC callers still pass the same database guards, and completion always remains `not_attested`.

`CONSOLE_DOCUMENTS_ENABLED` defaults false and requires the existing exact-loopback working
configuration. It is independent of image upload, compatibility and review flags. No current
environment file or native-acceptance opt-in is changed. The prior B11-B16/C1-C4/D1-D4 CI approval
does not authorize E1-E3 submission, activation, real document upload or any external write.

## Upload And Failure Contract

`POST /console/documents/upload` is inside the existing `/console` cookie scope. Only this exact
path and the existing raster upload omit middleware's body clone; neighbouring, encoded/case
variants and the staging host remain covered. The route independently validates configuration,
exact Origin/Host/custom command header, invite-only provider, authenticated user and current
owner/editor/reviewer. It refreshes cookies onto private responses. Other verbs return private 405.

Bounded URI-encoded metadata contains only document ID, stable begin/completion request IDs,
filename and byte count. It cannot supply a storage path, trusted hash, page count or approval.
Encoded content, invalid MIME/length and unsafe names are refused before writes. The actual input
passes the E2 parser; the server derives its immutable manifest. One actor can hold one upload/
inspection slot, with two slots shared across raster and PDF work in a single process. This is not
distributed rate limiting or an OS memory sandbox.

Use the authenticated client and `upsert: false` at the exact generated private path. An upload
error/timeout can follow persistence, so read back that same path and compare the complete original
buffer, SHA-256 and parsed page count before requesting metadata completion. Never overwrite,
delete, rewrite, flatten or automatically start a new intent. Cancellation stops further stages;
an already persisted intent/object remains retained for explicit retry. Provider calls retain the
existing twelve-second fetch bound and file parsing/reads retain E2 limits.

Invalid submitted bytes return 422. An unavailable/corrupt/timed-out stored copy returns a generic
503, not a demand to replace a valid submitted original. A different valid stored file returns 409.
Role changes, quotas, database refusals and malformed receipts fail closed. Responses contain only
safe error messages or exact document/intent IDs, never source bytes, storage paths or provider
diagnostics. Actual upload reconciliation is transient application evidence, not a durable trusted
observation or human rights/exact-scope review; those remain separate pending requirements.

## Build Packaging And Evidence

The parser path is project-root relative. The exact route's `outputFileTracingIncludes` contains
the unchanged parser and its five E2 dependencies. Next documents that trace paths are relative to
each `.nft.json`, and can be copied to a deployment directory; includes cover files static analysis
cannot determine. See [Next 15 output tracing](https://nextjs.org/docs/15/app/api-reference/config/next-config-js/output).
No global standalone/deployment output setting or public bundle dependency is introduced.

The package test copies only the actual route trace plus its entry into a unique OS temporary
directory outside the repository, invokes the built handler, and runs real parser children. Its
provider transport is mocked and its Request cookie interface is a harness adapter. It verifies
an over-10-MiB PDF, unchanged readback, real SSR refresh-generated response cookies, safe failures
and cleanup. It proves parser/dependency resolution without ancestor repository fallback, not a
live Auth/Storage service or full Next HTTP dispatch. Separate owned-server HTTP checks cover real
Next dispatch for default-off/unauthenticated boundaries, staging isolation and unchanged public
pages. No company document, account or retained stack is used.

The [E3 runbook](../../docs/operations/product-intelligence-console-milestone-4.md#m4-e3-authenticated-pdf-upload-and-packaging)
owns exact checks and missing evidence. Local preparation is PASS_WITH_WARNINGS; external release
and activation remain BLOCKED until separately authorized native/provider/browser acceptance.

## Next Gate And Reversal

Build the counted Technical Library intake/version workflow and private stored-original inspection,
then governed human document rights/exact-SKU review. Never inline arbitrary originals or infer
technical facts from a successful upload. Real 15AK evidence, owner decisions, verified preview,
release QA, publication and all twelve V1 success criteria remain required.

Before application, reversal is reviewed code-only. Afterwards retain immutable references,
receipts, objects and audit history and correct with forward records; no reset/cleanup is inferred.
No public source-authority transition, product data, commercial policy, merge or deployment changed.
No repository rule was overridden.
