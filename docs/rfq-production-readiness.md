# RFQ Production Readiness Checklist

This checklist is for turning the ArcFort Weld RFQ form into a real inquiry capture channel.
It does not contain secrets and should be safe to commit.

## Current Goal

The website can already display the RFQ form, validate buyer input and show email/WhatsApp backup
contacts. Production readiness means a buyer submission must also reach the sales team reliably.

Minimum production target:

- RFQ form accepts required fields and valid attachments.
- Website sends an email notification to `arcfortweld@outlook.com`.
- Website sends an automatic confirmation email to the buyer email when Resend is configured.
- Sales and buyer emails use separate Resend idempotency keys derived from a stable browser
  submission token, protecting unchanged retries from duplicate delivery for 24 hours.
- Every accepted or rejected submission receives a traceable `AF-RFQ-...` reference.
- Sales notification includes source path, landing page, referrer and UTM fields when available.
- Buyer sees success only after email delivery or database storage succeeds.
- Resend and Supabase run independently, so one channel can still capture the inquiry if the other
  provider fails.
- Optional Supabase rows and attachment paths are idempotent by RFQ reference. An unchanged retry
  does not create a duplicate row or reset the existing inquiry status.
- A Supabase-only submission with selected files succeeds only when both the inquiry row and files
  are stored. Saving file names without the files does not produce a buyer success state.
- Large or failed submissions still direct the buyer to email or WhatsApp.
- Browser submissions to `POST /api/rfq` pass Vercel BotID Basic verification before inquiry parsing.
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

Email delivery is the minimum requirement. Supabase is optional but useful for inquiry records and
attachment metadata.

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

## Deployment Steps

1. Verify `arcfortweld.com` in Resend.
2. Add the Resend DNS records in Cloudflare.
3. Add `RFQ_EMAIL_RECIPIENT`, `RFQ_EMAIL_FROM` and `RESEND_API_KEY` in Vercel.
4. Redeploy the Vercel production deployment.
5. Open `https://www.arcfortweld.com/api/rfq/status`.
6. Confirm `email.ready` is `true`.
7. Submit a test RFQ in a real browser at `https://www.arcfortweld.com/rfq` so the BotID challenge is
   attached to the request.
8. Confirm the success message says the RFQ was sent to sales email.
9. Confirm the page displays an `AF-RFQ-...` reference.
10. Confirm the sales notification subject and body contain the same reference.
11. Confirm the success message says a confirmation copy was sent to the buyer email.
12. Confirm `arcfortweld@outlook.com` receives the sales notification.
13. Confirm the buyer test inbox receives the confirmation email and matching reference.
14. Submit one test with a small PDF or JPG attachment and confirm the attachment arrives in the
    sales notification.
15. Submit one test URL with `?utm_source=test&utm_medium=qa&utm_campaign=rfq-check` and confirm
    the sales notification includes the UTM fields.

## Repeatable Live Check

Check production configuration without sending an email:

```bash
npm run rfq:check-live
```

BotID-protected submissions require a browser-generated challenge. Send a controlled test from the
deployed `/rfq` page instead of a command-line HTTP client. A successful page response proves that
the production API and Resend accepted the message; confirm final inbox placement and the matching
RFQ reference in Outlook or Resend logs.

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

If Supabase is not configured, `storage.ready` can remain `false`. Email delivery alone is enough
for the first production inquiry workflow.

`productionReady` is true only when the environment can capture the inquiry and deliver selected
attachments. For a Supabase-only setup, both the RFQ table and private attachment bucket are
required.

Before deployment, run:

```bash
npm run test:rfq
```

## Test RFQ Content

Use a realistic test message:

```text
Name: Test Buyer
Company: Test Distributor
Email: buyer@example.com
WhatsApp: +1 000 000 0000
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
- `backendConfigured:false` after submit: neither Resend email nor Supabase storage is ready.
- HTTP `502`: at least one provider is configured, but no delivery channel completed. Use the
  displayed RFQ reference and prefilled email or WhatsApp fallback, then check provider logs.
- HTTP `503`: neither Resend nor Supabase is configured in that environment.

## Launch Decision

The site is ready for active inquiry traffic when:

- `/api/rfq/status` shows `email.ready:true`.
- A real test RFQ reaches `arcfortweld@outlook.com`.
- Email and WhatsApp backup links are visible on `/rfq`, product pages and the footer.

Until then, the website can still receive manual inquiries by visible email and WhatsApp, but the
RFQ form is not a complete automated lead channel.
