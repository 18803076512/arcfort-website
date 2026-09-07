# Console Staging Auth Mail And Owner Handoff

Recorded: 2026-09-06. SMTP evidence: 2026-09-05; replacement invitation: 2026-09-06.
Scope: M2 onboarding only, not production RFQ email or a public Console deployment.

## Approved Destination

- Supabase project: `fdsvzuqixppsakukkrsf`, `arcfort-product-intelligence-staging`.
- Organization: `xycjhlnlacqocitjkagq`; region: Singapore (`ap-southeast-1`).
- Current administrator mailbox, explicitly approved on 2026-09-06: `arcfortweld1@outlook.com`.
- Superseded invitation address: `info@arcfortweld.com`. Retain that unconfirmed account without a
  role; do not delete it, grant access or change its email automatically.
- The public business mailbox remains `arcfortweld@outlook.com`; no website/RFQ recipient changed.
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

The owner then explicitly approved using `arcfortweld1@outlook.com` for staging login and sending one
new invitation. A fresh target/name/organization/region/health check passed and found zero matching
accounts for that mailbox. The existing loopback login form and HTTP privacy checks passed before
the single invitation was sent. Resend's email list showed Delivered for the new recipient and the
expected invitation subject. The new account was unconfirmed at creation; no role was granted and the
old account was not altered. There have been two invitations total, one to each explicitly approved
address, not a resend loop. Password setup and actual login still require the owner's interaction.

## Exact-Candidate CI Evidence

On 2026-09-06, [run 33998964482](https://github.com/18803076512/arcfort-website/actions/runs/33998964482)
was read back as completed successfully for `f906f3c8d5afd4be2d52a1b8ebd3a091f42d927a`.
Both quality and isolated database jobs passed, including the pre-start mail guard, fresh reset,
schema/RLS tests, SQL-report negative controls, generated types, two exact-row shadow imports and
Console Auth/revocation/pagination tests. An earlier tool-approval quota error delayed observation;
it was not a CI failure. Later documentation-only commits do not change that tested runtime, but
their own PR checks must still be inspected rather than inheriting a green status.

## Remaining Owner Handoff

Update after the mobile-access approval on 2026-09-06: the owner reported setting a password.
A fresh target-verified read still found the approved replacement identity unconfirmed, no sign-in
timestamp and zero Console roles. This contradicts completion of the invitation handoff, not the
owner's statement that they set some password. Clarify the page/account before granting access.
No additional invitation, confirmation, password change or role mutation was performed.

The separately prepared [mobile HTTPS entrance](console-mobile-staging.md) remains disabled and not
provisioned. Cloudflare zone/Access reads recovered on 2026-09-07, but plan visibility and the exact
new hostname/policy approval remain open; see that runbook for current evidence. The original loopback instructions
below remain applicable to the currently running local service; use the mobile runbook only after
its actual provider and protection gates pass.

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

## 2026-09-07 Coordinated Desktop Reinvitation

The owner requested email verification again and confirmed they are now using the computer hosting
the loopback Console. This allows a new desktop handoff without activating the mobile HTTPS entrance.
The local login rendered correctly and both login/confirmation routes passed the pre-send HTTP
checks. No hosted Auth URL, SMTP, DNS or access-policy setting was changed.

A target-verified read found the same approved replacement identity, still unconfirmed, without a
sign-in timestamp or role. One reinvitation was accepted by Supabase Auth at
`2026-09-06T22:57:13Z` (2026-09-07 06:57 China time). Its response identified the existing account and
still reported it unconfirmed. No duplicate account, role assignment, password change or automatic
confirmation occurred. This is now three accepted invitations overall: the first domain-mailbox
invitation, the replacement Outlook invitation, and this one coordinated Outlook reinvitation.

The ignored operator helper records attempt intent before the send and refuses an automatic repeat
after either acceptance or an ambiguous network response. Its first preflight stopped before sending
because Windows PowerShell wrapped the empty role result; parsing the HTTP JSON directly resolved
that issue. The subsequent guarded attempt was the only actual resend. No secret or invitation URL
was recorded. API acceptance is not Resend Delivered, inbox placement, or successful owner login.

The next action is for the owner to open the newest invitation on this computer, choose
`Review Invitation`, choose `Continue` on the local confirmation page, and set their own password.
Then re-read the exact identity's confirmation and sign-in state before any owner-role operation.
Do not reopen the old password-page clarification as a prerequisite to this newly coordinated handoff.
Do not resend again without coordinating with the owner. The existing mobile activation gates remain
unchanged and are not needed for this desktop-only step.

## Desktop Form Error Resolution

After the coordinated resend, the owner reported `Console request unavailable.`. The session handler
returned this before touching the invitation or password because native no-referrer form navigation
uses a literal null Origin. See the
[native-form origin decision](../../knowledge-base/decisions/2026-09-07-console-native-form-origin.md)
for the isolated reproduction, bounded same-origin metadata validation and negative tests.

This is a local application defect, not evidence that the mailbox or password was wrong. Apply the
rebuilt local candidate and have the owner reopen the newest invitation and choose Continue. Do not
request an old token, automatically resend, consume the link or grant a role. A 403 from this entrance
guard does not consume the invitation; expiry is still controlled by Supabase and must not be assumed.

## References

- [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase local configuration](https://supabase.com/docs/guides/local-development/cli/config)
- [Resend SMTP](https://resend.com/docs/send-with-smtp)
- [M2 access boundary](../../knowledge-base/decisions/2026-09-03-console-m2-access-boundary.md)
- [Staging mail decision](../../knowledge-base/decisions/2026-09-06-console-staging-auth-mail.md)
- [Owner mailbox replacement](../../knowledge-base/decisions/2026-09-06-console-owner-mailbox.md)
