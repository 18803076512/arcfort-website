# arcfort-website

Industrial B2B website for ArcFort Weld, operated by Renqiu Ailesen Welding Technology Co., Ltd.

## Brand

- Brand name: ArcFort Weld
- Company English name: Renqiu Ailesen Welding Technology Co., Ltd.
- Company Chinese name: 任丘市埃勒森焊接科技有限公司
- Positioning: Industrial Welding & Cutting Solutions
- Audience: Global distributors, importers, wholesalers, OEM buyers, industrial users, and repair workshops

## Confirmed Business Information

- Business email: `arcfortweld@outlook.com`
- WhatsApp: `+86-18803076512`
- Address: Renqiu City, Cangzhou, Hebei Province, China
- Main port: Tianjin Xingang Port / Tianjin Port, China
- Alternative ports: Qingdao Port or Ningbo Port are available upon request
- Payment terms: T/T, 30% deposit before production, 70% balance before shipment
- MOQ policy: Small trial orders accepted; OEM MOQ depends on product and packaging requirements
- Lead time: 7-20 working days for regular orders
- OEM service: Logo, packaging, private label, and model customization available

## Tech Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- ESLint
- Prettier

## Pages

- `/` - Home
- `/products` - Product center
- `/products/[category]` - Product category page
- `/products/[category]/[slug]` - Product detail page
- `/applications` - Application center
- `/applications/[slug]` - Application detail page
- `/guides` - Buyer guide center
- `/guides/[slug]` - Buyer guide article
- `/about` - About
- `/oem-service` - OEM service and private label support
- `/quality-control` - Quality control and inspection workflow
- `/shipping-payment` - Shipping, payment, MOQ and lead time information
- `/downloads` - Catalog, data sheet and RFQ document request center
- `/contact` - Contact
- `/privacy` - Privacy notice
- `/rfq` - Request for quotation
- `/api/rfq` - RFQ submission endpoint prepared for Supabase and Resend
- `/api/rfq/status` - RFQ backend configuration status check without exposing secrets

## Content Architecture

- `content/categories.ts` - product category SEO content
- `lib/data/products.ts` - CMS-ready mock product data source for Sanity or Supabase migration
- `content/products.ts` - adapter that maps product data into the current page schema
- `content/applications.ts` - application page content
- `content/guides.ts` - buyer guide and article content
- `lib/content/schemas.ts` - reusable TypeScript content schema
- `lib/content/site.ts` - centralized company, contact, trade, port, payment, MOQ, lead time and OEM information
- `lib/content/seo.ts` - metadata helper
- `lib/content/jsonld.ts` - JSON-LD helpers for Product, BreadcrumbList, Organization and FAQ

The website currently includes 6 product categories, 34 active product records, 6 application pages,
3 buyer guides and dedicated trust pages for OEM service, quality control, shipping/payment and
document requests. The product data includes the first 30 SKU batch plus retained generic starter
records. Missing product data must remain explicit instead of inventing specifications,
certifications, prices, stock status, factory capacity or customer cases.

## Product Lines

- MIG/MAG Torch Parts
- TIG Torch Parts
- Plasma Cutting Consumables
- Welding Consumables
- Welding Machines
- Welding Accessories

## SKU Bulk Import Workflow

For daily SKU maintenance, use the simple SKU workflow first. It lets you maintain a short CSV and
generate the full website product CSV automatically.

Simple CSV files:

- `data/import/products-simple-template.csv` - simple SKU template
- `data/import/products-simple.csv` - active simple working SKU file, currently aligned with the first 30 SKU batch
- `data/import/products-simple-30-sku-template.csv` - reusable first 30 SKU worksheet

Simple workflow:

1. Edit `data/import/products-simple.csv`.
2. Put product images in `public/images/products/` using the `image_name` values.
3. Run `npm run products:simple:preview` to check generated data without writing files.
4. Run `npm run products:simple:generate` to generate `data/import/products.csv`.
5. Run `npm run products:check-images`.
6. Run `npm run products:image-tasks` when product photos are missing.
7. Run `npm run products:report` to generate the internal product readiness checklist.
8. Run `npm run products:simple:import` to update `lib/data/products.ts`.
9. Run `npm run downloads:generate` to refresh public buyer download files.
10. Run `npm run build`.

To preview the reusable first 30 SKU worksheet without replacing the active simple CSV:

```bash
node --experimental-strip-types scripts/import-simple-products.ts --input data/import/products-simple-30-sku-template.csv
```

The simple importer can generate safe routing, image-path, SEO and placeholder values. It must not
generate confirmed OEM numbers, confirmed compatible models, certifications, prices, exact technical
ratings or unverified product dimensions.

Full CSV workflow:

1. Copy `data/import/products-template.csv` to `data/import/products.csv`.
2. Fill product data in `data/import/products.csv`.
3. Put product images in `public/images/products/`.
4. Run `npm run products:validate`.
5. Run `npm run products:check-images`.
6. Run `npm run products:image-tasks` when product photos are missing.
7. Run `npm run products:report`.
8. Run `npm run products:import`.
9. Run `npm run downloads:generate`.
10. Run `npm run build`.
11. Submit a pull request.

Use these values when data is uncertain:

- `Available upon request`
- `Contact us for details`
- `TBD`
- `needs_review`
- `unknown`

## RFQ System

The `/rfq` page includes a responsive inquiry form with:

- Name, company, email, WhatsApp, country, product requirements, quantity and message fields
- Required-field validation
- Business email format validation
- Drawing, product list, PDF, Excel, Word, JPG and PNG upload selection
- Server-side validation through `/api/rfq`
- Success state after validation
- Optional Supabase storage for RFQ records and attachment metadata
- Optional Resend email notification to the configured business email
- RFQ file attachments sent with the Resend email when email delivery is configured
- Backend readiness check at `/api/rfq/status`
- Lightweight spam protection with honeypot, timing checks and source-path tracking

Supabase storage and Resend email delivery are optional production services and must be configured
through environment variables. No real API keys, email passwords, database passwords or private
tokens are committed.

For production launch, follow `docs/rfq-production-readiness.md` and confirm
`https://www.arcfortweld.com/api/rfq/status` reports `email.ready:true` before treating the RFQ form as
a complete automated lead channel.

Environment variables:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_RFQ_TABLE=rfq_inquiries
SUPABASE_RFQ_BUCKET=rfq-attachments
RFQ_EMAIL_RECIPIENT=arcfortweld@outlook.com
RFQ_EMAIL_FROM=
RESEND_API_KEY=
GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_GA_ID=
```

## Search Console and Analytics

The site supports Google Search Console verification and GA4 tracking through environment variables.
No analytics IDs are hardcoded.

Configure in Vercel only after the accounts are ready:

```bash
GOOGLE_SITE_VERIFICATION=your-google-site-verification-token
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

When `NEXT_PUBLIC_GA_ID` is configured, the site tracks:

- Page views through GA4.
- RFQ success events: `rfq_submit_success`.
- Email link clicks: `contact_email_click`.
- WhatsApp link clicks: `contact_whatsapp_click`.
- RFQ link clicks: `rfq_link_click`.

Submit `https://www.arcfortweld.com/sitemap.xml` in Google Search Console after domain verification.

## Buyer Download Files

The `/downloads` page provides buyer-facing CSV files that help distributors and importers prepare
RFQ information.

Generated public files:

- `public/downloads/arcfort-public-product-list.csv` - active product list with SKU, product URL
  and RFQ-ready sourcing notes
- `public/downloads/arcfort-rfq-template.csv` - buyer worksheet for product list quotation requests

Refresh the files after SKU updates:

```bash
npm run downloads:generate
```

The public product list must not expose internal notes, private supplier references, prices,
unconfirmed certifications or hidden SKU workflow fields.

## Useful Documents

- `supabase/rfq-schema.sql` - RFQ table and private attachment bucket setup
- `docs/supabase-rfq-setup.md` - Supabase, Vercel and testing instructions
- `docs/rfq-email-delivery.md` - Resend email delivery setup for RFQ notifications and attachments
- `docs/rfq-production-readiness.md` - production RFQ email setup, Vercel environment variables and live test checklist
- `docs/launch-checklist.md` - production launch checklist
- `docs/arcfort-product-information-table.csv` - 12-product B2B information table with missing data notes
- `docs/product-image-checklist.csv` - product image status and replacement checklist
- `docs/first-30-sku-image-checklist.csv` - image checklist for the imported first 30 SKU batch
- `docs/product-image-tasks.csv` - generated missing image task list with target filenames and shot guidance
- `docs/representative-product-image-notes.md` - representative product-family image usage notes
- `docs/product-readiness-report.md` - generated product data, image and confirmation status checklist
- `docs/site-wide-upgrade-roadmap.md` - phased roadmap for improving page quality, SEO and RFQ conversion
- `docs/product-image-shooting-guide.md` - product photo shooting and editing guide
- `docs/missing-product-data-supplement.csv` - missing data worksheet for product pages
- `docs/production-missing-data-supplement.md` - production missing data priority and RFQ backend notes
- `docs/sku-template-guide.md` - SKU template filling guide and first batch recommendation
- `docs/first-30-sku-preparation.md` - first 30 SKU worksheet workflow and data confirmation guide
- `docs/product-data-workflow.md` - product CSV workflow and validation rules
- `supabase/product-catalog-schema.sql` - future product catalog database schema
- `docs/supabase-product-catalog-setup.md` - product catalog database setup instructions

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run checks:

```bash
npm run lint
npm run products:validate
npm run products:check-images
npm run products:image-tasks
npm run products:report
npm run downloads:generate
```

## Notes

- No real API keys or secrets are included.
- `app/sitemap.ts` and `app/robots.ts` are included for search engine discovery.
- Product and category pages include SEO metadata and JSON-LD structured data where appropriate.
- Analytics and Search Console verification are environment-driven and should not be hardcoded.
- Confirm real product images, final SKU codes and exact product specifications before scaling
  product pages.
