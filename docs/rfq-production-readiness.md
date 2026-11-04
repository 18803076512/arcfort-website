# RFQ Production Readiness Checklist

This checklist is for turning the ArcFort Weld RFQ form into a real inquiry capture channel.
It does not contain secrets and should be safe to commit.
Use [RFQ Email Delivery](rfq-email-delivery.md) for the current API response contract and provider
semantics when maintaining this checklist.

## Current Goal

The website can already display the RFQ form, validate buyer input and show email/WhatsApp backup
contacts. Production readiness means a buyer submission must also reach the sales team reliably.

Minimum production target:

- RFQ form accepts required fields and valid attachments.
- Website requests an email notification to `arcfortweld@outlook.com`.
- Website requests a confirmation email to the buyer email when Resend is configured.
- Sales and buyer emails use separate Resend idempotency keys derived from a stable browser
  submission token, protecting unchanged retries from duplicate delivery for 24 hours.
- Every API response includes a traceable `AF-RFQ-...` reference. The browser also derives an
  attempt reference from its stable submission token before sending; this is a lookup aid, not proof
  that the request or either email was accepted.
- Sales notification includes source path, landing page, referrer and UTM fields when available.
- Buyer sees success only after Resend accepts the sales request or Supabase stores the inquiry and
  every selected attachment. Provider acceptance does not prove either mailbox received an email.
- Resend and Supabase run independently, so one channel can still capture the inquiry if the other
  provider fails.
- Each Resend request has a 12-second timeout. A stalled buyer confirmation does not reverse an
  already accepted sales notification. The browser has an independent 45-second deadline covering
  BotID's pre-request challenge, the request and response parsing; aborting a fetch alone cannot
  end a stalled BotID challenge.
- Optional Supabase rows and attachment paths are idempotent by RFQ reference. An unchanged retry
  does not create a duplicate row or reset the existing inquiry status.
- A Supabase-only submission with selected files succeeds only when both the inquiry row and files
  are stored. Saving file names without the files does not produce a buyer success state.
- Large or failed submissions preserve the buyer's fields and any attempt or returned RFQ reference,
  clearly mark delivery as unconfirmed, show selectable details for manual copying, and link to the
  base email and WhatsApp contacts. Buyer details are not placed in those URLs.
- Browser submissions to `POST /api/rfq` run Vercel BotID Basic before inquiry parsing. A verified
  bot is rejected; a BotID outage falls back to the application's origin, timing and rate controls.
- No API keys, email passwords or database secrets are committed to the repository.

## Required Email Delivery Setup

Use Resend for website-to-sales email notification.

Set these variables in Vercel Project Settings for Production, Preview and Development if needed:

```bash
RFQ_EMAIL_RECIPIENT=arcfortweld@outlook.com
RFQ_EMAIL_FROM=ArcFort Weld <rfq@arcfortweld.com>
RESEND_API_KEY=your-resend-api-key
```

Important:

- `RESEND_API_KEY` must never be committed.
- `RFQ_EMAIL_FROM` must use a sender domain verified in Resend.
- The recommended sender is `rfq@arcfortweld.com` after `arcfortweld.com` is verified.
- If the sender domain is not verified, Resend may reject production email delivery.

## DNS Setup For Resend

In Resend:

1. Add the sending domain `arcfortweld.com`.
2. Copy the DNS records Resend provides.
3. Add those records in Cloudflare DNS.
4. Wait until Resend marks the domain as verified.
5. Create an API key for the website.
6. Add the API key to Vercel as `RESEND_API_KEY`.

Do not use personal Outlook passwords for website email sending.

## Optional Supabase Inquiry Storage

An accepted sales email request is the minimum configured path. Actual sales-mailbox receipt is a
separate launch check. Supabase is optional but useful for inquiry records and attachment metadata.

Set these variables only if inquiry database storage is required:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SUPABASE_RFQ_TABLE=rfq_inquiries
SUPABASE_RFQ_BUCKET=rfq-attachments
```

Before adding Supabase variables, run `supabase/rfq-schema.sql` in the Supabase SQL editor.

Security rules:

- Never expose the service role key in client components.
- Never prefix server-only keys with `NEXT_PUBLIC_`.
- Rotate the service role key immediately if exposed.

## Controlled Production Acceptance

Use this sequence only after the owner authorizes one real test submission and the reviewer can
inspect both the sales mailbox and a controlled, receivable buyer test mailbox. Use synthetic,
non-sensitive buyer details and a harmless small test attachment; `example.com` is not a receivable
buyer inbox. Do not repeat an ambiguous timed-out submission automatically.

The first four setup steps apply only when the relevant provider configuration still needs a
change. A test-submission authorization does not authorize a DNS, Resend or Vercel change; obtain
exact-destination approval for any such write. Readiness and inbox placement are separate checks.

1. Verify `arcfortweld.com` in Resend.
2. Add the Resend DNS records in Cloudflare.
3. Add `RFQ_EMAIL_RECIPIENT`, `RFQ_EMAIL_FROM` and `RESEND_API_KEY` in Vercel.
4. Redeploy the Vercel production deployment.
5. Open `https://www.arcfortweld.com/api/rfq/status`.
6. Confirm `email.ready` is `true`.
7. Open `https://www.arcfortweld.com/rfq?utm_source=test&utm_medium=qa&utm_campaign=rfq-check`
   in a normal browser, enter the controlled buyer mailbox, note the UTC time immediately before
   clicking Submit, and submit one RFQ with a small PDF or JPG test attachment so the BotID
   challenge is attached to the request.
8. Confirm the success page says the inquiry was submitted and asks the buyer to save its reference;
   it must not claim sales or buyer inbox receipt.
9. Record the displayed `AF-RFQ-...` reference and whether buyer confirmation was requested.
10. Confirm the sales notification with that reference and attachment actually appears in
    `arcfortweld@outlook.com`, including the expected source and UTM fields.
11. Confirm the buyer confirmation with the same reference actually appears in the controlled
    buyer inbox. If either message is missing, inspect the relevant Resend request and mailbox
    folders without treating provider acceptance as inbox proof.

Record the result in `docs/operations/acquisition-production-evidence.json` without buyer names,
addresses, message text or attachments. Set `rfq.inboxVerification.submittedReference` to the page
reference and `submittedAt` to the UTC time noted immediately before the submit click, not the
later success-screen time. For each mailbox, set `observedReference` to the reference actually seen,
`receivedAt` to the message's UTC receipt time and `checkedAt` to the UTC inspection time. Set the
matching
`salesMailboxPlacementConfirmed` or `buyerMailboxPlacementConfirmed` flag to `true` only after
checking that mailbox. If a mailbox was checked and the message was absent, set its flag to `false`,
keep `observedReference` and `receivedAt` null, and record `checkedAt`. Leave an unchecked mailbox
and its flag null. Set `salesAttachmentPresentConfirmed` to `true` only when the selected test
attachment is present in the received sales message, `false` when the message was inspected and its
attachment is absent, or null when unchecked. It requires a confirmed sales mailbox result and
shares that mailbox's `checkedAt` inspection time. Record an internal reviewer name or ID in
`reviewedBy`, the UTC review time in `reviewedAt`, and the latest check date in `asOf`. The validator
allows a reference date one UTC day either side of submission because the browser can reuse a valid
submission token across midnight.
Run `npm run acquisition:report` and `npm run goal:report`; neither report may mark a mailbox
confirmed from a bare boolean. Do not call the full RFQ path proven until both mailbox flags and
the sales attachment flag are confirmed for this test.

## Repeatable Live Check

Check production configuration without sending an email:

```bash
npm run rfq:check-live
```

BotID-protected submissions require a browser-generated challenge. Send a controlled test from the
deployed `/rfq` page instead of a command-line HTTP client. A successful page response means Resend
accepted the sales request or Supabase stored the inquiry and required attachments. Check both
mailboxes for the matching reference; a Resend response or log alone cannot prove inbox placement.

## Abuse Protection

The application rejects browser requests with an untrusted `Origin` or `Sec-Fetch-Site`, and keeps
the existing honeypot, minimum form-completion time, text limits, file-type limits and request-size
limit. Vercel BotID Basic adds an invisible browser challenge and server-side check before the form
body is parsed. Basic mode is explicitly selected so paid Deep Analysis is not enabled accidentally.
Every response receives an RFQ reference.

The API also includes a best-effort fixed-window fallback:

- 5 RFQ attempts per 10 minutes per hashed client key
- Vercel's forwarded client IP is used when available
- Raw IP addresses are not stored
- Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` and
  `X-RateLimit-Policy`
- Blocked requests return HTTP `429` with `Retry-After`

This fallback is process-local. It resets when a Vercel Function instance restarts and cannot share
counts across horizontally scaled instances. It reduces repeated bursts but is not a distributed
production WAF. BotID reduces automated submissions, but it is not a distributed request counter.

If sustained abuse appears, consider a paid Vercel Firewall rate-limit rule for production traffic:

- Path: `/api/rfq`
- Method: `POST`
- Suggested starting threshold: 5 requests per 10 minutes per source IP
- Action: rate limit or challenge

Review the threshold after real traffic begins. Vercel Firewall rate limiting is a paid capability;
do not enable it without billing approval. The infrastructure rule cannot be verified from the
repository and should be confirmed in the Vercel project dashboard.

## Production Verification Record

On 2026-11-04 the owner reported a controlled browser submission that remained at `Submitting...`
without a displayed reference, and no new matching email in either controlled Outlook inbox or
junk folder. The exact click time and the Vercel/Resend request result were unavailable. This is an
unreconciled attempt, not evidence that the provider accepted or rejected the inquiry. No automatic
retry was made and the inbox verification evidence remains unset. A local repair now bounds the
BotID challenge wait independently; production behavior still requires release and a separately
authorized controlled check.

Controlled browser verification attempted on 2026-08-13:

- The deployed form did not show a success response within 60 seconds. No automatic retry was made.
- `/api/rfq/status` continued to report the email configuration as ready, but configuration state
  does not prove provider acceptance or inbox placement.
- The matching Resend log and Outlook inbox result remain unknown. This attempt must not be reported
  as a delivered inquiry.
- The finding triggered bounded Resend request timeouts so a provider stall cannot leave the buyer
  without a clear response indefinitely.

API verification performed on 2026-07-26:

- `AF-RFQ-20260726-CDF899D4`: Resend accepted the sales notification and buyer confirmation.
- `AF-RFQ-20260726-7F7535FA`: Resend accepted the sales notification with one JPG attachment and
  accepted the buyer confirmation.
- Supabase remained optional and unconfigured during these checks.
- Outlook inbox placement and spam-folder placement still require confirmation in the mailbox.

## Expected Status Response

After Resend is configured, `https://www.arcfortweld.com/api/rfq/status` should include:

```json
{
  "ok": true,
  "productionReady": true,
  "inquiryCaptureReady": true,
  "attachmentDeliveryReady": true,
  "deliveryMode": "email",
  "referenceTracking": true,
  "botProtection": {
    "integrated": true,
    "provider": "Vercel BotID",
    "checkLevel": "basic",
    "protectedPath": "/api/rfq",
    "method": "POST",
    "fallbackOnVerificationError": true
  },
  "rateLimit": {
    "applicationFallback": true,
    "distributed": false,
    "limit": 5,
    "windowSeconds": 600,
    "infrastructureRuleRecommended": true
  },
  "email": {
    "ready": true,
    "buyerConfirmationReady": true,
    "idempotencyProtected": true,
    "idempotencyWindowHours": 24,
    "providerRequestTimeoutSeconds": 12,
    "resendApiKeyConfigured": true,
    "fromConfigured": true,
    "recipientConfigured": true,
    "recipient": "arcfortweld@outlook.com"
  },
  "storage": {
    "ready": false,
    "idempotencyProtected": true,
    "conflictKey": "reference",
    "attachmentRetrySafe": true
  }
}
```

If Supabase is not configured, `storage.ready` can remain `false`. Resend provider acceptance can
produce a successful website response, but the real sales inbox must still be checked before the
channel is called a proven lead path.

`productionReady` reports configuration that can capture the inquiry and submit selected
attachments; it does not report mailbox receipt. For a Supabase-only setup, both the RFQ table and
private attachment bucket are required.

Before deployment, run:

```bash
npm run test:rfq
```

## Test RFQ Content

Use a synthetic test message, replacing the buyer-email placeholder with an actual controlled,
receivable test mailbox before submitting:

```text
Name: Test Buyer
Company: Test Distributor
Email: [controlled buyer test mailbox]
WhatsApp: [leave blank unless a controlled test number is available]
Country: United States
Product Requirements:
MIG Contact Tip M6 1.0mm, 500 pcs. Please confirm material, package and lead time.
Quantity: 500 pcs
Message:
This is an internal delivery test for ArcFort Weld RFQ email notification.
```

After testing, mark the email as an internal test and do not treat it as a real inquiry.

## Troubleshooting

- `email.ready:false`: `RESEND_API_KEY` or `RFQ_EMAIL_FROM` is missing in Vercel.
- `recipientConfigured:false`: add `RFQ_EMAIL_RECIPIENT=arcfortweld@outlook.com`.
- Email not received: check Resend logs, sender domain verification and spam folder.
- Sender rejected: verify `arcfortweld.com` DNS records in Resend.
- Attachment rejected: reduce file count or file size. Current limits are 5 files and 4 MB total,
  keeping the multipart request below Vercel's 4.5 MB Function payload limit.
- `backendConfigured:false` after submit: neither Resend accepted the sales request nor Supabase
  stored the inquiry and required attachments.
- HTTP `502`: at least one provider is configured, but no channel accepted or stored the inquiry.
  Keep the displayed RFQ reference, copy the selectable details into the chosen email or WhatsApp
  app, and add attachments again if needed. The contact links contain no buyer details or query
  parameters. Check provider logs before deciding whether to retry an ambiguous submission.
- HTTP `503`: neither Resend nor Supabase is configured in that environment.

## Launch Decision

The site is ready for active inquiry traffic when:

- `/api/rfq/status` shows `email.ready:true`.
- One authorized controlled RFQ reaches `arcfortweld@outlook.com` and the controlled buyer inbox
  with the same reference; the sales copy includes the submitted test attachment.
- Email and WhatsApp backup links are visible on `/rfq`, product pages and the footer.

Until then, the website can still receive manual inquiries by visible email and WhatsApp, but the
RFQ form is not a complete automated lead channel.
