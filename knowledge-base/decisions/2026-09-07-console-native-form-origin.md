# Console Native Form Origin Verification

Date: 2026-09-07
Scope: fix legitimate Console form POST rejection without changing authentication or publication.

## Evidence

The owner reported `Console request unavailable.` during desktop onboarding. That response is emitted
by the session handler's entrance check, before invitation verification, password handling or login.
The Console deliberately sends both HTTP and metadata `Referrer-Policy: no-referrer`.

A credential-free loopback browser fixture using the actual shared origin guard reproduced a native
POST with literal `Origin: null`, `Sec-Fetch-Site: same-origin`, `Sec-Fetch-Mode: navigate` and
`Sec-Fetch-Dest: document`. Referer was absent. The previous guard rejected it. The same browser
submission passed after the change; no hosted account or invitation token was used in this test.

## Decision

Keep the exact Host comparison and the existing explicit-origin validation. Add one bounded native
form case: literal `Origin: null` is accepted only when all three browser-controlled Fetch Metadata
headers equal the values above. A missing Origin is not literal null. Cross-site, same-site, none,
missing metadata, fetch/no-cors and iframe requests do not qualify. An explicit foreign origin is
never rescued by Fetch Metadata. Do not trust Referer or permit arbitrary null origins.

Browser scripts cannot set `Sec-` headers; metadata is derived from the complete request/redirect
context, not a caller-supplied form field. Non-browser clients can forge headers, just as they can
forge Origin, but this check does not authenticate them. Supabase confirmation, session identity,
current database role and RLS remain mandatory. The optional HTTPS entrance still requires its
signed Access JWT and HTTPS transport before reaching Auth.

Keep no-referrer, no-store, noindex, HttpOnly/SameSite cookies and user-initiated confirmation POSTs.
Do not fix this by disclosing invitation URLs through Referer, allowing all null origins, setting a
password automatically, confirming a mailbox administratively or assigning a role early.

## Validation And Reuse

The boundary suite covers the native positive case and individual negative/missing headers. The
Access suite covers a signed native request and rejection without Access or from a cross-site.
The built HTTP suite uses intentionally invalid JSON bodies: same-origin requests must reach the
400 form check while unsafe origins return 403. These probes cannot send mail or mutate an account.

For a manual browser regression, run:

```bash
node --experimental-strip-types scripts/console/serve-origin-browser-fixture.ts
```

Open `http://127.0.0.1:3002/` and click its only button. The fixture logs only diagnostic booleans;
all must be true after a legitimate native submission. It makes no external request, binds only to
loopback and expires after ten minutes. Stop it after QA. This fixture is not an account or live
owner-login test. Keep native form coverage alongside synthetic HTTP requests in future auth work.

## Sources And Reversal

- [MDN Referrer-Policy and Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)
- [W3C Fetch Metadata](https://www.w3.org/TR/fetch-metadata/)
- [M2 boundary decision](2026-09-03-console-m2-access-boundary.md)

This clarifies the request-provenance implementation only, not an override of any account, role,
source-of-truth or network activation gate. If future browser behavior fails these checks, fail
closed and use an explicitly reviewed CSRF-token or same-origin fetch design; never silently remove
the metadata conditions. Revert through a reviewed code change if required.
