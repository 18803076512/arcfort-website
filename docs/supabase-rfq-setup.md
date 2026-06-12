# Supabase RFQ Setup

This guide connects the ARCFORT `/rfq` form to Supabase without committing real secrets.

## What This Enables

- Store RFQ submissions from `/api/rfq`
- Store optional RFQ attachments in a private Supabase Storage bucket
- Keep browser visitors blocked from direct database access
- Keep all credentials in deployment environment variables

## Files

- `app/rfq/page.tsx` - RFQ landing page
- `app/rfq/RfqForm.tsx` - client-side validation and form submission
- `app/api/rfq/route.ts` - server-side validation and optional Supabase write
- `supabase/rfq-schema.sql` - database table and storage bucket setup
- `.env.example` - required environment variable names only

## Step 1: Create Supabase Project

Create or open the Supabase project that will receive ARCFORT RFQ inquiries.

Do not paste Supabase keys into repository files. Keys must only be added to local `.env.local` or
Vercel environment variables.

## Step 2: Run SQL

Open Supabase SQL Editor and run:

```sql
-- Copy the full contents of supabase/rfq-schema.sql
```

This creates:

- `public.rfq_inquiries`
- Private storage bucket `rfq-attachments`
- Indexes for status, country and created date
- An `updated_at` trigger
- RLS enabled on the inquiry table

The table does not create public visitor policies. The website API route writes with the server-only
service role key.

## Step 3: Configure Environment Variables

Set these variables in Vercel Project Settings, or in local `.env.local` for testing:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SUPABASE_RFQ_TABLE=rfq_inquiries
SUPABASE_RFQ_BUCKET=rfq-attachments
```

Security rules:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components.
- Never prefix the service role key variable with `NEXT_PUBLIC_`.
- Never commit `.env.local`.
- Rotate the key immediately if it is ever exposed.

## Step 4: Test Submission

After deployment or local setup:

1. Open `/rfq`.
2. Fill required fields: name, company, email, country, product requirements and quantity.
3. Upload a small test PDF, Excel, CSV, Word, JPG or PNG file if needed.
4. Submit the form.
5. Confirm a new row appears in `public.rfq_inquiries`.
6. If an attachment was uploaded, confirm a file appears in the private `rfq-attachments` bucket.

## Expected Table Columns

| Column | Purpose |
| --- | --- |
| `id` | Internal inquiry ID |
| `name` | Buyer contact name |
| `company` | Buyer company |
| `email` | Buyer business email |
| `whatsapp` | Optional WhatsApp contact |
| `country` | Destination or buyer country |
| `product_requirements` | Product list, models, drawings or sample notes |
| `quantity` | Required quantity or estimated order volume |
| `message` | Additional packaging, OEM, delivery or sourcing notes |
| `attachments` | JSON list of uploaded file metadata and storage paths |
| `source_path` | Source page, currently `/rfq` |
| `status` | Inquiry workflow status |
| `created_at` | Inquiry creation time |
| `updated_at` | Last update time |

## Supported Attachment Types

The frontend and API route currently allow:

- PDF
- Excel
- CSV
- Word
- JPG
- PNG

Maximum upload limits:

- 5 files per RFQ
- 10 MB per file

## Workflow Status Values

The database accepts:

- `new`
- `reviewing`
- `quoted`
- `closed`
- `spam`

## Production Notes

- Add a notification workflow later, such as Resend, Supabase Edge Functions or a CRM webhook.
- Build an admin dashboard later before exposing inquiry management to non-technical users.
- Use signed URLs for private attachment downloads if an admin dashboard is added.
- Keep all missing product details as `To be confirmed` until confirmed by buyer drawings, samples or product references.
