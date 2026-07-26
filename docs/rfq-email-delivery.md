# RFQ Email Delivery Setup

This guide connects the ArcFort Weld RFQ form to real email delivery without committing secrets.

## Goal

When a buyer submits `/rfq`, the website should:

- Validate required RFQ fields.
- Validate upload type, single-file size and total upload size.
- Reject obvious automated spam submissions without adding friction for normal buyers.
- Record the source path, referrer and user agent in the sales notification email.
- Send a sales notification email to `arcfortweld@outlook.com`.
- Send an automatic confirmation email to the buyer's submitted email address when email delivery
  is configured.
- Include uploaded RFQ files as email attachments when Resend is configured.
- Optionally store RFQ records and attachment metadata in Supabase.
- Give the buyer and sales team the same traceable `AF-RFQ-...` reference.

## Current Implementation

Files:

- `app/rfq/RfqForm.tsx` - frontend validation and buyer success message.
- `app/api/rfq/route.ts` - server-side validation, optional Supabase storage and Resend email delivery.
- `.env.example` - environment variable names only.

Email flow:

- Sales notification goes to `RFQ_EMAIL_RECIPIENT` and includes RFQ details, source metadata and
  uploaded attachments.
- Buyer confirmation goes to the submitted buyer email and includes a clean RFQ summary plus ArcFort
  Weld backup contact details.
- Buyer confirmation delivery is treated as a secondary enhancement. A temporary buyer confirmation
  failure does not block the sales notification success response.
- Resend and Supabase delivery run independently. A Supabase outage does not block a successful
  sales email, and a Resend outage does not discard an inquiry that Supabase stored successfully.
- When files are selected and Resend is unavailable, Supabase counts as a complete delivery only
  after the inquiry row and every selected file are stored.
- The browser shows success only when at least one delivery channel succeeds. Otherwise it displays
  the RFQ reference and prefilled email and WhatsApp fallback links.

Attachment limits:

- Allowed file types: PDF, Excel, CSV, Word, JPG and PNG.
- Maximum files: 5.
- Maximum single file size: 4 MB.
- Maximum total upload size: 4 MB.

The 4 MB cap keeps the complete multipart request below the Vercel Function 4.5 MB payload limit.
Resend supports larger email payloads, but the buyer upload must reach the Vercel API first. Ask
buyers to send larger files directly by email or WhatsApp.

References:

- <https://vercel.com/docs/functions/limitations#request-body-size>
- <https://resend.com/docs/dashboard/emails/attachments#attachment-limitations>

Spam controls:

- Hidden honeypot field.
- Minimum form completion time of 3 seconds.
- Maximum form age of 24 hours.
- Server-side validation mirrors frontend validation.
- Source path is normalized before storage or email notification.

## Required Vercel Environment Variables

Set these in Vercel Project Settings, not in repository files:

```bash
RFQ_EMAIL_RECIPIENT=arcfortweld@outlook.com
RFQ_EMAIL_FROM=ArcFort Weld <rfq@arcfortweld.com>
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```

Recommended sender:

- `RFQ_EMAIL_FROM=ArcFort Weld <rfq@arcfortweld.com>`

Only use this after `arcfortweld.com` is verified in Resend. If the sender domain is not verified,
Resend can reject or restrict production email sending.

## Resend Setup

1. Create or open a Resend account.
2. Add the sending domain `arcfortweld.com`.
3. Add the DNS records requested by Resend in Cloudflare DNS.
4. Wait until Resend shows the domain as verified.
5. Create a Resend API key.
6. Add `RESEND_API_KEY` in Vercel environment variables.
7. Add `RFQ_EMAIL_FROM` using the verified domain.
8. Keep `RFQ_EMAIL_RECIPIENT=arcfortweld@outlook.com`.

Do not commit the API key or any email password.

## Optional Supabase Storage

If Supabase variables are also configured, the website will store inquiry records and attachment
metadata in Supabase. Email delivery still works through Resend.

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SUPABASE_RFQ_TABLE=rfq_inquiries
SUPABASE_RFQ_BUCKET=rfq-attachments
```

Use `docs/supabase-rfq-setup.md` for the database setup.

## Test After Deployment

After adding Vercel environment variables and redeploying:

1. Open `https://www.arcfortweld.com/api/rfq/status`.
2. Confirm `email.ready` is `true` after Resend variables are configured.
3. Open `https://www.arcfortweld.com/rfq`.
4. Submit a test RFQ with a small PDF or JPG attachment.
5. Confirm the success message says the RFQ was sent to the sales email.
6. Confirm the page displays an `AF-RFQ-...` reference.
7. Confirm the sales email subject and body contain that reference.
8. Confirm the success message says a confirmation copy was sent to the buyer email.
9. Check `arcfortweld@outlook.com` for the RFQ email.
10. Check the buyer test inbox for the confirmation email and matching reference.
11. Confirm uploaded files appear as email attachments in the sales notification.
12. If Supabase is configured, confirm the inquiry row and reference appear in `rfq_inquiries`.

Expected API response after Resend is configured:

```json
{
  "ok": true,
  "reference": "AF-RFQ-20260726-12345678",
  "emailConfigured": true,
  "emailDelivered": true,
  "emailRecipient": "arcfortweld@outlook.com",
  "emailAttachmentCount": 1,
  "backendConfigured": true
}
```

Run shared frontend/server constraint tests before deployment:

```bash
npm run test:rfq
```

## Troubleshooting

- Visit `/api/rfq/status` after every environment variable change to confirm backend readiness.
- `emailConfigured:false`: `RESEND_API_KEY` or `RFQ_EMAIL_FROM` is missing in Vercel.
- `emailDelivered:false`: Resend was not configured or rejected the request.
- `backendConfigured:false`: Neither Resend delivery nor Supabase storage is configured.
- HTTP `502`: delivery providers were configured but no channel succeeded. Check Resend and
  Supabase logs using the returned RFQ reference.
- HTTP `503`: no automated delivery provider is configured in that environment.
- Attachment error: reduce file count, reduce file size, or send large files directly by email.
- Sender rejected: verify `arcfortweld.com` in Resend and confirm DNS records in Cloudflare.
- `Please reload the RFQ form and try again`: the submission was too fast, too old, or missing
  form timing data. Reload `/rfq` and submit again.

## Security Rules

- Never commit `RESEND_API_KEY`.
- Never commit email passwords.
- Never expose Supabase service role keys to client components.
- Never prefix service keys with `NEXT_PUBLIC_`.
- Rotate any key immediately if it is exposed.
