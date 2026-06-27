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
- Sales notification includes source path, landing page, referrer and UTM fields when available.
- Buyer receives a clear success message after submission.
- Large or failed submissions still direct the buyer to email or WhatsApp.
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
7. Submit a test RFQ at `https://www.arcfortweld.com/rfq`.
8. Confirm the success message says the RFQ was sent to sales email.
9. Confirm the success message says a confirmation copy was sent to the buyer email.
10. Confirm `arcfortweld@outlook.com` receives the sales notification.
11. Confirm the buyer test inbox receives the confirmation email.
12. Submit one test with a small PDF or JPG attachment and confirm the attachment arrives in the
    sales notification.
13. Submit one test URL with `?utm_source=test&utm_medium=qa&utm_campaign=rfq-check` and confirm
    the sales notification includes the UTM fields.

## Expected Status Response

After Resend is configured, `https://www.arcfortweld.com/api/rfq/status` should include:

```json
{
  "ok": true,
  "productionReady": true,
  "email": {
    "ready": true,
    "resendApiKeyConfigured": true,
    "fromConfigured": true,
    "recipientConfigured": true,
    "recipient": "arcfortweld@outlook.com"
  }
}
```

If Supabase is not configured, `storage.ready` can remain `false`. Email delivery alone is enough
for the first production inquiry workflow.

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
- Attachment rejected: reduce file count or file size. Current limits are 5 files, 10 MB per file
  and 25 MB total.
- `backendConfigured:false` after submit: neither Resend email nor Supabase storage is ready.

## Launch Decision

The site is ready for active inquiry traffic when:

- `/api/rfq/status` shows `email.ready:true`.
- A real test RFQ reaches `arcfortweld@outlook.com`.
- Email and WhatsApp backup links are visible on `/rfq`, product pages and the footer.

Until then, the website can still receive manual inquiries by visible email and WhatsApp, but the
RFQ form is not a complete automated lead channel.
