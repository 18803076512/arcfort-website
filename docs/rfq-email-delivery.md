# RFQ Email Delivery Setup

This guide connects the ArcFort Weld RFQ form to real email delivery without committing secrets.

## Goal

When a buyer submits `/rfq`, the website should:

- Validate required RFQ fields.
- Validate upload type, single-file size and total upload size.
- Reject obvious automated spam submissions without adding friction for normal buyers.
- Record the source path, referrer and user agent in the sales notification email.
- Send a sales notification email to `arcfortweld@outlook.com`.
- Include uploaded RFQ files as email attachments when Resend is configured.
- Optionally store RFQ records and attachment metadata in Supabase.

## Current Implementation

Files:

- `app/rfq/RfqForm.tsx` - frontend validation and buyer success message.
- `app/api/rfq/route.ts` - server-side validation, optional Supabase storage and Resend email delivery.
- `.env.example` - environment variable names only.

Attachment limits:

- Allowed file types: PDF, Excel, CSV, Word, JPG and PNG.
- Maximum files: 5.
- Maximum single file size: 10 MB.
- Maximum total upload size: 25 MB.

The 25 MB total upload limit keeps the RFQ email attachment payload below common email API limits
after Base64 encoding.

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
6. Check `arcfortweld@outlook.com` for the RFQ email.
7. Confirm uploaded files appear as email attachments.
8. If Supabase is configured, confirm the inquiry row appears in `rfq_inquiries`.

Expected API response after Resend is configured:

```json
{
  "ok": true,
  "emailConfigured": true,
  "emailDelivered": true,
  "emailRecipient": "arcfortweld@outlook.com",
  "emailAttachmentCount": 1,
  "backendConfigured": true
}
```

## Troubleshooting

- Visit `/api/rfq/status` after every environment variable change to confirm backend readiness.
- `emailConfigured:false`: `RESEND_API_KEY` or `RFQ_EMAIL_FROM` is missing in Vercel.
- `emailDelivered:false`: Resend was not configured or rejected the request.
- `backendConfigured:false`: Neither Resend delivery nor Supabase storage is configured.
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
