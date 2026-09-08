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

## 2026-09-07 Desktop Service Resume

On the owner's next continuation, normal authenticated CLI access recovered. The approved staging
project again matched its name, organization, region and healthy state. The same replacement owner
account was still unconfirmed, without a sign-in timestamp or any Console role.

The loopback service was no longer reachable. Restarting the existing reviewed build with only the
staging public key and importer disabled restored the login page. The built Console HTTP suite passed,
including the native-form origin regression, private routes, unsafe-origin rejection, staging-host
isolation and public SEO shell checks. The browser displayed the login form. This is service recovery,
not a new build, hosted deployment or successful owner login.

A separate, fixed operator attempt identifier was prepared without changing the earlier invitation
receipt. Approval review rejected the additional resend before process execution because the previous
coordinated approval did not cover a further email. **No new invitation was sent in this resume.**
Do not invoke another helper or provider path to bypass that rejection. Obtain explicit approval for
one additional invitation to the same approved mailbox before executing this new attempt. Preserve
both the previous receipt and the intent-before-send protection against ambiguous retries.

The owner handoff remains pending. Keep passwords, invitation tokens and full invitation URLs out of
chat and logs. Do not infer expiration, delivery, verification or role readiness from the restored
login page. No password, role, SMTP, Auth policy, production or mobile-entrance setting changed.

## 2026-09-07 Explicitly Approved Additional Desktop Invitation

After the rejected attempt above, the owner explicitly approved one additional invitation to
`arcfortweld1@outlook.com`. The same guarded helper then rechecked the exact healthy staging target,
existing owner identity, absent email confirmation/sign-in and empty roles. Both local login and
confirmation preflight requests passed before sending.

Supabase Auth accepted exactly one resend at `2026-09-07T10:51:01Z` (18:51 China time). The response
matched the existing identity and remained unconfirmed. The new fixed-attempt receipt records intent
and acceptance; the earlier receipt remains intact. There are now four accepted invitations overall,
including the original superseded address and three to the approved replacement mailbox. The earlier
approval rejection did not send an email. No further resend is authorized by this operation.

This records API acceptance only, not Resend delivery, inbox placement or completed login. The owner
must use the newest invitation on this computer, select Review Invitation and Continue, and complete
password setup themselves. No password, owner role, SMTP setting, production service or public
business contact changed. Recheck actual confirmation and owner login before any role assignment.

## 2026-09-07 Email Confirmation Verified; Browser Session Pending

After the owner reported signing in, a fresh target-verified Auth read found the same approved
replacement account with both email confirmation and a sign-in timestamp present. Its Console role
list was still empty. This closes the email-confirmation gate; do not send another invitation merely
because the Console dashboard is not yet accessible.

The current in-app browser still showed the login form. Navigating that same tab to the dashboard
returned `/console/login?state=unauthenticated`, not the no-role state. The provider timestamp may
also result from invitation verification; it does not establish a current password-login session in
this browser. Another browser's session was not inspected. The owner was handed the existing login
form with the approved mailbox entered, to submit their own password. No role, password, email or
provider configuration was changed.

Next verify an authenticated no-role state in the owner's browser, then perform only the approved
single-user owner bootstrap. Do not treat this pending browser handoff as an unconfirmed mailbox,
failed mail delivery, or permission to consume an invitation or set a password for the owner.

## 2026-09-07 Password Login Verified; Explicit Role Approval Required

The owner reported the no-active-role message. The observed in-app tab still showed an
unauthenticated login page, so it was not represented as an authenticated browser acceptance test.
A narrowly scoped database read provided independent evidence: the approved account has a retained
password authentication-method record at `2026-09-07T10:56:48Z`. Only the method, count and time were
read; no session identifiers, tokens, passwords or IP addresses were returned. The scoped legacy Auth
audit query returned no rows and was not treated as proof of a failed login.

A final read-only bootstrap preview confirmed the exact verified owner is eligible, a recent
password login exists, and the complete Console role table has zero rows. The owner-reported login
handoff and provider-side password evidence are now satisfied. Do not ask the owner to repeat email
verification or password setup merely because a different browser tab has no session.

The ignored `.tmp/bootstrap-staging-console-owner.sql` prepares one fixed-target first-owner
operation with transaction-local timeouts, a role-table lock, repeated identity/password checks, an
empty-role-table requirement and an audit assertion. It inserts only the approved account's owner
role. `granted_by` is null for an operator bootstrap rather than falsely attributing it to a user
session. Existing roles, conflicting identity or a failed check stop the operation; no automatic
revocation, retry or product write is included.

Approval review rejected the write command **before execution**, requiring explicit authorization
for this particular persistent owner permission despite the earlier M2 planning approval. No role
was granted. Ask specifically to grant `owner` to `arcfortweld1@outlook.com` only in
`fdsvzuqixppsakukkrsf`; do not use REST, the dashboard or another SQL path to bypass the rejection.
This role carries database governance permissions, even though the M2 screens are read-only. It is
not Supabase organization membership, production access, a source cutover or permission to publish.

After that approval, recheck the target and role preview, execute once, then read back the role and
audit entry. Authenticated page/viewport/logout acceptance remains separate; retain the working
owner session and do not claim the in-app browser is that session without observing it.

## 2026-09-08 Owner Bootstrap Completion Readback

The owner explicitly confirmed the exact persistent `owner` permission for the approved replacement
mailbox in staging only. A fresh project/account check and read-only preview again found the expected
verified identity, recent password login and an empty role table. The guarded SQL then committed one
role at `2026-09-07T11:34:50.965333Z` (2026-09-07 19:34 China time). It was not retried during the
following continuation.

Readback on 2026-09-08 confirmed:

- Total Console role rows: one.
- Expected approved account's active owner rows: one; `revoked_at` is null.
- Superseded account's role rows: zero.
- Audit event `3682`: `console_user_roles`, `INSERT`, actor kind `database`, with the same timestamp.

The existing transaction guards and audit assertion passed. No Auth password, invitation,
organization membership, additional account, SMTP setting, product data or public data authority was
changed. This grants staging database governance permissions, not production access or an instruction
to publish. Future invocations of the first-owner script must not run now that the role table is
populated. Any revocation is a separate explicitly approved operation, not an automatic QA cleanup.

The local server had stopped before this continuation. The same reviewed runtime
`5021ae265b4c471957650435d011b61508c0274f` was restored on loopback with the staging public key only
and importer disabled. The built HTTP suite passed private/noindex behavior, native-form origin,
unsafe-origin rejection, staging-host isolation and public shell/social-image checks. No new
application build or hosted deployment is claimed.

No existing Console tab remained in the observed in-app browser. A fresh dashboard tab correctly
returned an unauthenticated login page. This does not undo the verified password login or owner
grant. Have the owner refresh the dashboard in their originally authenticated browser, or sign in
themselves in the new tab. Do not request another invitation, password reset or owner grant.

**Completed gates:** email confirmation, evidenced password login, exact single-user owner grant and
audit readback. **Remaining gate:** authenticated owner UI acceptance, including products/readiness,
responsive layouts and logout. M2 acceptance and full Console V1 completion must not be claimed from
role or unauthenticated HTTP checks alone. M3 editing/publishing and mobile HTTPS activation remain
outside this operation.

## 2026-09-08 Authenticated Owner Acceptance Completion

The owner subsequently confirmed seeing the Overview, and the actual authenticated in-app browser
was verified at the same loopback origin. The
[M2 acceptance record](product-intelligence-console-milestone-2.md#2026-09-08-real-owner-browser-acceptance)
contains the candidate, observed counts, filters/pagination, product/series/evidence/readiness,
responsive/keyboard and test results. This supersedes the pending browser gate above.

The final real Sign Out returned to the login page. Back, reload and a direct previously visited
product URL also required login and displayed no SKU data. The owner role was not revoked and no
password, invitation, SMTP policy, product record or production setting was changed. The login page
is the expected final state after this test, not a recurrence of the earlier account-setup failure.

Local staging-backed read-only acceptance is PASS_WITH_WARNINGS. The external HTTPS/mobile entrance
is still disabled and undeployed; full V1 editing/publishing and data authority transition remain
separate work. Do not rerun the consumed bootstrap or send another invitation to continue.

## References

- [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase local configuration](https://supabase.com/docs/guides/local-development/cli/config)
- [Resend SMTP](https://resend.com/docs/send-with-smtp)
- [M2 access boundary](../../knowledge-base/decisions/2026-09-03-console-m2-access-boundary.md)
- [Staging mail decision](../../knowledge-base/decisions/2026-09-06-console-staging-auth-mail.md)
- [Owner mailbox replacement](../../knowledge-base/decisions/2026-09-06-console-owner-mailbox.md)
