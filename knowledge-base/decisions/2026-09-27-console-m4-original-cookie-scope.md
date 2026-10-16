# M4 Original Upload Cookie Scope Correction

Date: 2026-09-27
Status: local correction verified; actual authenticated Storage acceptance still required.
Supersedes: API placement only in [B8 upload/readback](2026-09-27-console-m4-original-upload.md).
All original fidelity, authorization, evidence and rollout limits in B7/B8 remain.

## Finding

Console login and refresh cookies intentionally use `Path=/console`, HttpOnly and SameSite=Lax.
B8 placed its new upload endpoint at `/api/console/originals` to avoid Next's 10 MiB middleware
request-body clone. Browsers do not send `/console` cookies to that API path, so a genuine signed-in
user would be unauthenticated there. A synthetic component response, manually authenticated SDK
client or disabled-route HTTP test could not prove otherwise. This was found while preparing the
real browser acceptance, before any retained/hosted activation or deployment.

## Correction

Use `POST /console/originals` and retain the existing Cookie path/security options unchanged. Do not
widen the session cookie to `/`, introduce a second credential cookie, put tokens in JavaScript or
add an unauthenticated bridge. The old `/api/console/originals` route is removed, not redirected.
It was never a published product URL; no public product migration is involved.

Exclude only the exact new upload path and its trailing-slash form from the first Console middleware
matcher. The upload route already owns independent configuration, same-origin, invite-only provider,
current-user/role and private-response checks, including its own refresh-cookie propagation. Other
Console paths, descendants, similarly named paths and framework suffixes retain the middleware.
The all-path staging-host matcher is unchanged. Staging's existing non-session POST block still
returns 404 before the uploader, and the uploader remains independently default-off/local-only.

Use Next's supported negative-lookahead matcher, with constant source configuration so the framework
can analyze it. [Next.js 15 middleware matcher documentation](https://nextjs.org/docs/15/app/api-reference/file-conventions/middleware#matcher).
Test using the installed Next source parser and route matcher, then the actual production middleware
manifest. Do not replace framework matching with a hand-written approximation or a string-presence
assertion. Public routes do not acquire Console middleware through this change.

The relocated route now inherits the existing `/console/:path*` private Next headers and request-log
exclusion. Remove the B8 extra API header/log rules; verify no-store/noindex/no-referrer on actual
production responses. Do not raise the global middleware body limit.

## Evidence And Remaining Gate

The real Edge browser test adds an explicitly synthetic HttpOnly `/console` cookie, verifies it is
absent from `document.cookie` and from an old-path negative-control request, and requires it on the
form's actual upload request. The upload response remains intercepted synthetic data, not a successful
Auth/Storage transaction. Existing byte/payload/retry/privacy/role/layout checks remain in that run.

The [B9 record](../../docs/operations/product-intelligence-console-milestone-4.md#m4-b9-original-cookie-scope-correction)
owns results and exact limits. Real login, provider upload/download, persisted history and
greater-than-10-MiB HTTP byte fidelity still need authorized disposable-stack acceptance. No new
schema, real original, mapping, rights, exact-match evidence, publication or active flag is changed.
The current unpushed candidate is not authorized by the previous M3 or pending B5-only CI scopes.

Rollback must keep upload disabled unless a replacement proves both cookie delivery and bounded
full-body transport. Do not restore the known out-of-scope endpoint as a working fallback. Preserve
all source originals and existing retained databases; no reset or deletion is part of this fix.
