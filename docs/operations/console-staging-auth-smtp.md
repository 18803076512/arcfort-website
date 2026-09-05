# Console Staging Auth Mail And Owner Handoff

Recorded: 2026-09-06. Provider configuration/invitation evidence: 2026-09-05.
Scope: M2 onboarding only, not production RFQ email or a public Console deployment.

## Approved Destination

- Supabase project: `fdsvzuqixppsakukkrsf`, `arcfort-product-intelligence-staging`.
- Organization: `xycjhlnlacqocitjkagq`; region: Singapore (`ap-southeast-1`).
- First administrator mailbox, explicitly selected by the owner: `info@arcfortweld.com`.
- The owner approved a separate Resend SMTP credential for staging Auth, its replacement after the
  failed handoff, and secure local key entry. This does not authorize rotation of production RFQ keys.
- No billing upgrade, production setting, data-source cutover or public publishing is in scope.

## Recorded Provider State

`supabase/config.staging.toml` is a secret-free **reference snapshot**, not an executable deployment
configuration. It is not loaded by local Supabase, Next.js or CI. The recorded settings are:

- SMTP: `smtp.resend.com`, TLS port `465`, username `resend`.
- Sender: `auth@arcfortweld.com`, display name `ArcFort Weld Product Intelligence`.
- Resend key: `ArcFort Staging Auth SMTP`, Sending access limited to `arcfortweld.com`.
- Resend dashboard showed `arcfortweld.com` as Verified. This is provider evidence, not evidence of
  the administrator mailbox's forwarding rules or inbox placement.
- Global signup disabled; email provider enabled; confirmations required; anonymous sign-ins off.
- Site URL: `http://127.0.0.1:3000`; only the exact `/console/auth/callback` and
  `/console/auth/confirm` paths are allowed redirects under that origin.
- Invitation/recovery subjects and HTML match `supabase/templates/`. They use a token hash and an
  explicit user confirmation POST. Do not log, publish, inspect or consume a user's invitation token.
- Existing hosted values retained: TOTP enrollment/verification enabled, email frequency `1m`, OTP
  length `8`, storage file-size limit `50MiB`.

## Configuration Incident And Correction

The installed Supabase CLI `2.116.0` applied `config push` immediately; it was **not a dry-run**.
Alongside the intended SMTP/templates, omitted local fields initially changed TOTP settings, email
frequency and OTP length. A storage update from the hosted `50MiB` to local `25MiB` was attempted but
rejected with HTTP 402 mentioning vector buckets. No plan upgrade was performed.

The next apply explicitly restored TOTP enrollment/verification to true, email frequency to `1m`,
OTP length to `8`, and retained the existing hosted storage `50MiB`. A subsequent reconciliation
returned API, database, Auth and storage `up_to_date`. This is parity of **CLI-supported projected
fields**, not a claim that every Management API field was compared. The earlier three-field Auth
patch's complete readback in the 2026-09-03 record must not be attributed to this later operation.

Future changes must use a target-verified, narrowly scoped Auth API or dashboard update with a
reviewed before/after field list. Never push `supabase/config.toml` to hosted staging and never use
`config push` as an inspection command. Do not automatically reset Auth, remove users, reopen signup
or disable SMTP as rollback. Stop on unplanned drift and obtain approval for a different scope.

## Local And CI Isolation

`supabase/config.toml` configures only the disposable local stack and its mail collector on port
`54324`. It has no external SMTP section or secret dependency. Its local storage limit remains
`25MiB`; local test defaults are deliberately distinct from hosted Auth policy.

`npm run console:boundaries:test` rejects custom SMTP configuration or a missing/disabled collector,
including negative fixture checks. Both `npm run console:db:start` and the database CI job run this
guard **before** starting Supabase. Disposable authentication tests must never receive hosted SMTP
keys, use a real mailbox or point to a hosted database.

`SUPABASE_AUTH_SMTP_PASS` is an operator-only name, not a Next.js environment variable. Real values
must not enter `.env.example`, repository config, CI, logs, process command arguments or chat.
The approved one-time handoff used loopback input and Windows DPAPI. On 2026-09-06, the exact temporary
cipher, receipt marker, input helpers and retired broad-push/credential-probe helpers were removed.
No unrelated temporary files were deleted. Do not copy the key into a long-lived local app env file.

## Invitation Evidence And Remaining Steps

Exactly one invitation was sent to the chosen administrator on 2026-09-05. The Resend email list
reported **Delivered** for `ArcFort Weld Console Invitation`; this means provider-reported delivery,
not that the owner has opened the mailbox or signed in. A read-only Auth check on 2026-09-06 found one
matching account and `email_confirmed_at` still absent. No owner role was assigned by this work.
The owner subsequently reported that the invitation was not received. A read-only DNS lookup found
the domain's MX at `inbound-smtp.us-east-1.amazonaws.com`; this does not prove forwarding to the
owner's everyday mailbox. Confirm the intended login address or existing mailbox routing before
sending another invitation. Do not silently change the account identity or production MX records.

1. Start the reviewed Console at `http://127.0.0.1:3000` with only its staging public key and disabled
   importer. Keep it off Vercel and bound to loopback.
2. The owner opens the invitation in their own mailbox and sets a password themselves. Do not ask
   them to send a password, token or full invite URL into chat. An old invitation may have expired;
   coordinate a single new invitation only when the owner is ready, not an automatic resend loop.
3. Verify the provider-confirmed identity and actual owner login. Only then perform the already
   approved one-user `owner` assignment, inspecting current roles first and recording the result.
4. Check authenticated dashboard/products/readiness at the approved responsive sizes, logout and
   revocation behavior. Distinguish isolated CI evidence from a real owner browser session.

M2 activation remains **BLOCKED** until these real-owner gates pass. M3 editing/publishing and the
full V1 goal are not complete. Production RFQ delivery is a separate workflow and was not tested by
this invitation. The previously exposed production credential still requires a separate scoped
rotation/dependency check; do not reuse or revoke it as part of staging onboarding.

## References

- [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase local configuration](https://supabase.com/docs/guides/local-development/cli/config)
- [Resend SMTP](https://resend.com/docs/send-with-smtp)
- [M2 access boundary](../../knowledge-base/decisions/2026-09-03-console-m2-access-boundary.md)
- [Staging mail decision](../../knowledge-base/decisions/2026-09-06-console-staging-auth-mail.md)
