# Console Mobile Staging Entrance

Date: 2026-09-06; provider and candidate review: 2026-09-07.
State: implementation candidate, **not an active HTTPS deployment**.

## Scope And Current Blocker

The owner approved a protected, mobile-accessible HTTPS test entrance connected only to Supabase
`fdsvzuqixppsakukkrsf`, with no production website/RFQ change, paid service or password bypass.
See [the access decision](../../knowledge-base/decisions/2026-09-06-console-mobile-entrance.md).

Recommended destination: `https://console-staging.arcfortweld.com/console/login`. This is a reserved
candidate in code, not evidence that DNS, a certificate, Tunnel or Access exists. The connected
Cloudflare API returned authentication error `10000`; its dashboard and Vercel dashboard both showed
login pages. No cloud resources, DNS, Auth redirect settings or invitations were changed by this batch.
That connection failure was resolved for zone/Access reads on 2026-09-07, as recorded below. Billing
visibility and exact new hostname/policy approval remain open. Never retrieve browser cookies or CLI
credentials to work around a missing permission.

The owner subsequently reported setting a password. A fresh staging Auth check still found the
approved account unconfirmed, without a sign-in timestamp or Console role. External entrance
activation is paused while clarifying that handoff; local code preparation is not proof of a live
mobile login. Do not send another invitation or grant a role from that report alone.

## Architecture

`Phone -> Cloudflare Access -> named Tunnel -> loopback-only Next.js -> staging Supabase Auth/RLS`

- Use a named test tunnel and the dedicated hostname, not a public Quick Tunnel or production Vercel
  project. The PC must remain running and connected during this supervised M2 handoff. This is not
  persistent cloud hosting or a production Console deployment.
- Protect the entire hostname with Access, not only `/console`. Allow only the already approved
  administrator mailbox. No Everyone, bypass, service-token or wildcard-mailbox policy.
- Set the Access session to one hour. Validate the application JWT at the tunnel and in the app:
  signature, issuer, audience, expiry, issued-at age, subject, app type and exact allowed mailbox.
- Only `/console`, its routes and `/_next/static/` assets are eligible. The root redirects to login
  only after verification; robots disallows everything. Public pages, downloads, sitemap and RFQ APIs
  return private 404 responses on the staging hostname.
- Each data access still checks Supabase identity, email confirmation, current role and database RLS.
  Cloudflare Access is an outer gate, not a substitute for the owner's password or Console role.
- Session cookies are HttpOnly, SameSite=Lax, Secure over HTTPS and limited to `/console`. All
  Console responses retain no-store, no-referrer and noindex. No invitation URL/token/password logs.
- Vercel, production Supabase, importer keys, SMTP credentials and RFQ service credentials remain
  rejected. The normal loopback and disposable CI paths remain available without external Access.

## Runtime Configuration

Use a dedicated process environment, never the production project's environment. Supply only:

| Variable                           | Value/source                                                               |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `CONSOLE_ENABLED`                  | `true`, only after the protection preflight passes                         |
| `CONSOLE_DEPLOYMENT`               | `access-tunnel`                                                            |
| `CONSOLE_ENVIRONMENT`              | `staging`                                                                  |
| `CONSOLE_ORIGIN`                   | `https://console-staging.arcfortweld.com`                                  |
| `CONSOLE_SUPABASE_URL`             | `https://fdsvzuqixppsakukkrsf.supabase.co`                                 |
| `CONSOLE_SUPABASE_PUBLISHABLE_KEY` | Actual staging public/anon key, not a service key                          |
| `CONSOLE_ACCESS_ISSUER`            | Exact verified team's HTTPS `cloudflareaccess.com` origin                  |
| `CONSOLE_ACCESS_AUDIENCE`          | Exact created Access application's 64-character audience                   |
| `CONSOLE_ACCESS_EMAIL`             | Owner-approved mailbox in the [mail runbook](console-staging-auth-smtp.md) |

Issuer and audience are currently missing. Do not replace them with test fixture values. Remove
`SUPABASE_ACCESS_TOKEN`, service-role keys, SMTP and Resend secrets before launching Next.js. Keep
Tunnel credentials in the tunnel process only; never put them in Next.js, Git, commands or chat.
Bind Next.js to `127.0.0.1`, not `0.0.0.0`. Do not open a firewall port or create a Windows service
as part of this temporary handoff.

## Provisioning Order

1. Revalidate connected account, ownership of `arcfortweld.com`, existing DNS, Access organization,
   plan and available free capacity. Stop on a charge, contract, existing conflicting hostname or
   lack of permission. Confirm the exact new subdomain/Access policy before the external write.
2. Create the restricted Access application first. Read back its exact domain, one-mailbox allow
   policy, issuer, audience and one-hour session. Retain IDs without secrets.
3. Create only the named staging Tunnel. Its exact-host rule points to the loopback test process;
   unmatched hosts use `http_status:404`. Require Access token validation with the exact team/audience,
   preserve the external Host, and forward HTTPS protocol. Do not use a local-host header override.
4. Configure/start the dedicated Next.js process with the reviewed code and public staging key.
   Install a current official `cloudflared` binary only if needed. Start it without displaying or
   logging its credential. Add only the new staging DNS record after Access is active. Do not alter
   apex, `www`, MX, TXT, production Workers or RFQ records.
5. Verify HTTPS certificate and anonymous denial from outside the PC. A forged assertion must fail.
   Owner signs in to Access themselves. Verify permitted login/assets, CSRF rejection, private
   headers, route isolation and mobile display; ensure no caching or request query/body logging.
6. Only after the reachable entrance passes, update **just** hosted staging Auth `site_url` and the
   exact callback/confirm allow-list. Use a reviewed narrow API/dashboard change, read back all
   affected values and retain prior settings. Never run `supabase config push`.
7. Coordinate one fresh invitation/recovery appropriate to the actual existing account state. Keep
   the older unprivileged account unchanged; do not auto-confirm, create duplicates, set the owner's
   password or consume a link on their behalf. Owner opens the email on their phone, confirms and
   sets their own password. Provider acceptance is not proof of inbox or login success.
8. Verify the replacement identity and actual login before the already approved single-owner role
   assignment. Complete authenticated M2 QA; do not begin M3 product editing/publishing.

## Verification And Rollback

Run `console:boundaries:test`, `console:entrance:test`, lint, typecheck, build, secrets and applicable
RFQ/SEO regression checks. Run `console:http:test` against the newly built loopback server; it also
probes staging Host handling without DNS, credentials, mail or a real Access token. Offline signed
JWT fixtures prove verifier behavior only. They do not prove cloud protection or authenticated use.

Disable the dedicated Console process and stop only its named Tunnel to close the entrance. Keep
Access protection in place until any staging DNS removal is approved. Never reopen signup, disable
confirmation, remove users/roles or reset the database as automatic rollback. Do not restore expired
invitations; coordinate owner handoff after any exact-origin change.

## References

- [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/)
- [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

Live activation, actual mobile password setup, owner role and authenticated M2 acceptance remain open.

## 2026-09-07 Candidate Review

The exact PR target was read back as open PR #130 on `codex/v2-industrial-brand-system`, based on
`main`. The new entrance is a default-off code candidate, not an activated release. Host isolation
also covers case, explicit port and trailing-dot variants; authorization continues to require the
exact canonical origin. The middleware host pattern escapes literal dots. Unit and built HTTP
checks must cover these variants before the candidate is accepted.

A new read-only staging identity check still returned the expected account unconfirmed, without a
sign-in timestamp or role. No additional owner evidence was supplied. Do not infer which password
was set, create an account, resend mail or grant access automatically.

The connected Cloudflare API now verifies account `5476b5083b65f0c635ce02b036712885` owns active zone
`d42a4838537e166d97863f2ff3ce9366` (`arcfortweld.com`). Existing Access organization:
`liangchenhui.cloudflareaccess.com`. Exact candidate-host app lookup, named `arcfort-console-staging`
tunnel lookup and candidate DNS lookup returned no records. Subscription reads alone still return
authorization error `10000`; this must not be described as a total connector outage or a verified
Free plan. No provider writes occurred. The account/zone check is complete; confirm plan/cost and the
exact new hostname/one-mailbox policy before activation. An Access organization alone does not prove
the required policy, application audience, tunnel protection or mobile login exists.
