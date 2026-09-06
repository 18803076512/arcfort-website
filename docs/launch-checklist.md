# ARCFORT Website Launch Checklist

Use this checklist before switching the website to production traffic.

## Code Readiness

- `npm run lint` passes.
- `npm run build` passes.
- `sitemap.xml` is generated.
- `robots.txt` is generated.
- Header and footer links are working.
- RFQ form validation works.
- Product, category, application and guide pages render correctly.

## Required Business Data

- Official business email: arcfortweld@outlook.com.
- Official WhatsApp number: +86-18803076512.
- Company address: Renqiu City, Cangzhou, Hebei Province, China.
- Main port: Tianjin Xingang Port / Tianjin Port, China.
- Alternative ports: Qingdao Port or Ningbo Port are available upon request.
- Product-image publication status: all 40 active records have existing files marked as own or
  supplier photos; 3 draft products still need exact-product photos as of 2026-08-13. Supplier-image
  provenance and usage rights still require a central evidence record.
- Public product list CSV: available in `/downloads`.
- Product catalog PDF: available at `/downloads/renqiu-ailesen-welding-catalog.pdf`.
- Product records: 43; 40 are active public SKU pages and 3 remain draft pending reviewed images.
- Product specifications: pending by product.
- MOQ and lead time by product: covered by policy, pending by exact product and order quantity.

## Supabase RFQ Setup

- Supabase is optional while verified Resend email delivery is active.
- Run `supabase/rfq-schema.sql` in Supabase SQL Editor.
- Create or confirm private bucket `rfq-attachments`.
- Configure `SUPABASE_URL` in Vercel.
- Configure `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
- Configure `SUPABASE_RFQ_TABLE=rfq_inquiries`.
- Configure `SUPABASE_RFQ_BUCKET=rfq-attachments`.
- Submit a real test RFQ and confirm the row is stored.
- Upload a test attachment and confirm the file path is stored.
- Submit a test RFQ with UTM parameters and confirm source attribution fields are stored.

## RFQ Email Delivery

- Production status reported `productionReady:true`, `email.ready:true`, buyer-confirmation readiness
  and attachment-delivery readiness on 2026-08-13.
- Resend accepted a controlled sales notification and buyer confirmation on 2026-07-26.
- Resend accepted one controlled JPG attachment in the sales notification on 2026-07-26.
- Confirm the matching test references in the Outlook inbox or Resend logs.
- Confirm `/api/rfq/status` reports the application rate-limit fallback as enabled.
- Configure a Vercel Firewall rate limit for `POST /api/rfq`.

## Vercel Deployment

- Import GitHub repository `arcfort-website`.
- Framework preset: Next.js.
- Production branch: `main`.
- Add custom domains:
  - `arcfortweld.com`
  - `www.arcfortweld.com`
- Set required environment variables.
- Deploy production.
- Confirm HTTPS works for both domains.
- Production deployment verified at `https://www.arcfortweld.com` on 2026-08-01.
- Apex-domain redirect to `https://www.arcfortweld.com` verified on 2026-08-01.

## SEO Checks

- Confirm homepage title and description.
- Confirm Organization structured data uses Renqiu Ailesen Welding Technology Co., Ltd. as the
  company identity and ArcFort Weld only as the website brand.
- Add social-profile `sameAs` links only after confirming the profile is controlled by this company.
- Complete independent trademark clearance before expanding paid promotion into new markets.
- Confirm product category metadata.
- Confirm product detail metadata.
- Confirm application and guide metadata.
- Search Console performance data is available for the `arcfortweld.com` property. The export dated
  2026-08-12 contains 8 clicks and 422 impressions through 2026-08-09.
- Confirm the current ownership-verification method and sitemap submission inside Search Console.
  `GOOGLE_SITE_VERIFICATION` is only required when HTML-tag verification is the chosen method.
- IndexNow accepted the latest changed-page submission with HTTP 200 on 2026-08-13.
- Confirm no invented certifications, prices, stock status, factory capacity or customer cases are published.

## Analytics and Conversion Tracking

- Create a GA4 property for `arcfortweld.com`.
- Configure `NEXT_PUBLIC_GA_ID` in Vercel.
- Confirm page views appear in GA4 Realtime.
- Submit a test RFQ and confirm `rfq_submit_success` appears in GA4 Realtime or DebugView.
- Confirm RFQ sales email includes landing page, referrer and UTM attribution fields.
- Click Email, WhatsApp and RFQ links and confirm click events are tracked.
- Do not hardcode analytics IDs in repository files.

## Automated Production Monitoring

- `.github/workflows/production-health.yml` checks production every six hours and supports manual
  runs from GitHub Actions.
- `npm run health:production` verifies RFQ readiness and audits all live sitemap URLs without
  sending an inquiry or email.
- `npm run test:live-audit` verifies bounded retries locally. Transient network and selected
  retryable HTTP failures may retry; deterministic and persistent failures must still surface.
- Treat a failed scheduled run as an operational alert: inspect the failed RFQ or SEO step, confirm
  the deployed site, and restore the lead channel before publishing additional changes.
- Confirm the sender-domain DKIM, SPF, custom MAIL FROM MX and DMARC state separately. Do not describe
  DMARC as configured until the DNS record is published and the email-domain audit passes.
- Keep GitHub Actions notifications enabled for the repository owner so failed scheduled runs are
  visible outside the Actions page.

## Post-Launch

- Review confirmed business data before major website updates.
- Use the private outreach workbook to execute and record the three manually reviewed distributor waves;
  do not commit buyer replies or contact details.
- Replace the remaining placeholder or non-product images for `AF-PLA-RC-0011` Plasma Retaining Cap,
  `AF-ACC-WM-0015` Welding Magnet and `AF-TIG-TS-0036` TIG Torch Switch with exact-product photos.
- Confirm source and usage-right records for active supplier images, especially product records whose
  `source_type` remains `unknown`.
- Refresh public download files with `npm run downloads:generate` after SKU updates.
- Import confirmed SKU data using `docs/product-sku-template.csv`.
- Review `docs/acquisition-readiness-report.md` and update its non-sensitive production evidence
  after mailbox, analytics, DNS or provider-console checks.
