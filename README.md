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
- `lib/content/product-redirects.ts` - permanent redirects for retired product URLs and historical
  category aliases
- `lib/content/product-search.ts` - server-rendered product search, category filtering and pagination
- `lib/content/topic-links.ts` - category-to-guide internal linking map

The website currently includes 6 product categories, 43 indexable product records, 6 application
pages, 6 buyer guides and dedicated trust pages for OEM service, quality control, shipping/payment
and document requests. Four retained generic starter URLs permanently redirect to their current
category pages so they do not compete with exact SKU pages. Missing product data must remain explicit
instead of inventing specifications, certifications, prices, stock status, factory capacity or
customer cases.

The `/products` route supports server-rendered search by product name or SKU, category filtering and
12-item pagination. Filter and pagination URLs use the product-center canonical and `noindex,follow`
so buyers can share result URLs without creating duplicate indexable search pages.

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

The generator updates rows that match the simple CSV and preserves existing rows that are not in the
simple file. This prevents catalog-derived or separately maintained products from being removed when
the simple SKU batch is regenerated.

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
10. Run `npm run seo:audit`.
11. Run `npm run build`.

To preview the reusable first 30 SKU worksheet without replacing the active simple CSV:

```bash
node --experimental-strip-types scripts/import-simple-products.ts --input data/import/products-simple-30-sku-template.csv
```

The simple importer can generate safe routing, image-path, SEO and placeholder values. It must not
generate confirmed OEM numbers, confirmed compatible models, certifications, prices, exact technical
ratings or unverified product dimensions. Known product families use the editorial profiles in
`scripts/product-copy-profiles.ts` to generate function-specific English copy. New product families
use a conservative category fallback and print a review warning before import.

Catalog-derived products can use the same reviewed editorial profiles:

```bash
npm run products:refresh-copy
npm run products:refresh-copy:write
npm run products:import
```

The first command previews matched catalog products. The write command updates only active
`official_catalog` rows with an exact editorial profile; it stops if a product profile is missing.

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
10. Run `npm run seo:audit`.
11. Run `npm run build`.
12. Submit a pull request.

Use these values when data is uncertain:

- `Available upon request`
- `Contact us for details`
- `TBD`
- `needs_review`
- `unknown`

Product image publication rules:

- Use `own_photo` only for a confirmed ArcFort or company-owned product photo.
- Use `supplier_photo` for a reviewed supplier image that clearly matches the published product
  type; keep exact model, dimensions and compatibility unconfirmed unless separately verified.
- Use `needs_photo` when the current file is a placeholder, illustration or family-level image that
  cannot confirm the published SKU.
- Only `own_photo` and `supplier_photo` images are eligible for product Open Graph metadata,
  Product JSON-LD and image sitemap entries.
- Keep the original image source in `source_reference` and record `verified_by` and
  `verified_date`; these internal fields are not exposed on public pages.

## RFQ System

The `/rfq` page includes a responsive inquiry form with:

- Name, company, email, WhatsApp, country, product requirements, quantity and message fields
- Required-field validation
- Business email format validation
- Drawing, product list, PDF, Excel, Word, JPG and PNG upload selection
- Server-side validation through `/api/rfq`
- Success state only after Resend email or complete Supabase inquiry and attachment storage confirms
  delivery
- Buyer-visible RFQ reference in success and delivery-failure responses
- Optional Supabase storage for RFQ records and attachment metadata
- Optional Resend email notification to the configured business email
- RFQ file attachments sent with the Resend email when email delivery is configured
- Independent email and storage delivery so one provider failure does not block the other
- Prefilled email and WhatsApp fallback when automated delivery is unavailable
- Backend readiness check at `/api/rfq/status`
- Lightweight spam protection with same-origin checks, honeypot, timing checks and source-path
  tracking
- Structured server logs for delivery outcome, RFQ reference and Resend message IDs without buyer
  personal data
- Persistent multi-product RFQ shortlist stored in the buyer's browser
- Live shortlist count in the desktop header, mobile menu and sticky contact bar
- Selected products automatically merged into the RFQ submission with SKU and category

Buyers can add up to 50 products from product cards or detail pages. The shortlist remains in
browser `localStorage` until the buyer submits the RFQ or clears the list; it does not require an
account and does not expose internal product fields.

Supabase storage and Resend email delivery are optional production services and must be configured
through environment variables. No real API keys, email passwords, database passwords or private
tokens are committed.

For production launch, follow `docs/rfq-production-readiness.md` and confirm
`https://www.arcfortweld.com/api/rfq/status` reports `email.ready:true` before treating the RFQ form as
a complete automated lead channel. Configuration readiness must still be followed by one controlled
test inquiry that reaches the sales inbox.

Run the shared RFQ validation and reference tests with:

```bash
npm run test:rfq
```

Check the deployed backend without sending an inquiry:

```bash
npm run rfq:check-live
```

Send a controlled production test only when the sales or test inbox is ready:

```bash
npm run rfq:check-live -- --send --confirm-production --email=arcfortweld@outlook.com
npm run rfq:check-live -- --send --confirm-production --email=arcfortweld@outlook.com --attachment=public/images/products/mig-diffuser.jpg
```

The test command requires both `--send` and `--confirm-production` because it creates real Resend
emails. A successful API response means the email provider accepted the messages; final inbox
placement must still be confirmed in Outlook or Resend logs.

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

Global responses include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` and `Cross-Origin-Opener-Policy` headers. Configure a Vercel Firewall rate-limit
rule for `POST /api/rfq` when production traffic starts; application-level form checks are not a
replacement for an infrastructure-level rate limit.

## Search Console and Analytics

The site supports Google Search Console verification and GA4 tracking through environment variables.
No analytics IDs are hardcoded.

Run the blocking SEO consistency check before every important deployment:

```bash
npm run seo:audit
```

The audit checks indexable product routes, duplicate metadata, category and product references,
legacy redirects, homepage featured-product coverage, reviewed image eligibility, guide metadata,
article dates, guide content depth and placeholder-content warnings. Warnings identify editorial
work that still needs real product data; broken links, duplicate routes, thin guides and invalid
references fail the command.

After deployment, audit every sitemap URL against the live site:

```bash
npm run seo:audit:live
```

The live audit verifies HTTP status, redirects, title length, meta descriptions, canonical URLs,
English language markup, one H1 per HTML page, indexability, Open Graph metadata, Twitter cards,
required JSON-LD types, Product rich-result safety, same-page fragment links, image `alt`/`src`
attributes, sitemap `lastmod` values, every sitemap product image, filtered catalog `noindex`,
robots.txt, download indexing headers, legacy category redirects and crawlable internal links to
every sitemap URL. It also reports whether an HTML Search Console verification tag is present and
whether GA4 is configured. An absent HTML tag is only a reminder to confirm DNS-based ownership
verification separately. Audit a local or preview deployment while still requiring production
canonical URLs with:

```bash
npm run seo:audit:live -- --fetch-base-url=http://localhost:3000
```

Configure in Vercel only after the accounts are ready:

```bash
GOOGLE_SITE_VERIFICATION=your-google-site-verification-token
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

When `NEXT_PUBLIC_GA_ID` is configured, the Google tag is not loaded until the visitor explicitly
allows optional analytics. Analytics consent is stored locally and can be changed on `/privacy`.
Advertising storage, ad user data and ad personalization remain denied.

- Sanitized SPA page views without URL query strings.
- Product views: `view_item`.
- Product search result summaries: `product_catalog_search`.
- RFQ validation, start, error and success events: `rfq_validation_error`, `rfq_submit_start`,
  `rfq_submit_error`, `rfq_submit_success`.
- GA4 recommended lead event after a successful RFQ: `generate_lead`.
- Email link clicks: `contact_email_click`.
- WhatsApp link clicks: `contact_whatsapp_click`.
- RFQ link clicks: `rfq_link_click`.
- Catalog and buyer-tool clicks: `catalog_download_click`, `buyer_tool_download_click`.

Visitor names, company names, countries, email addresses, telephone or WhatsApp numbers, messages,
uploaded file names, search text and raw campaign values are not sent to analytics. After creating
the GA4 data stream:

1. Mark `generate_lead` as a key event.
2. Do not assign a lead value or currency until a real internal lead-value policy exists.
3. In Enhanced Measurement, avoid browser-history page-view tracking because the application sends
   sanitized SPA page views itself.
4. Verify one `page_view` per navigation and one `generate_lead` per successful RFQ in DebugView.

Submit `https://www.arcfortweld.com/sitemap.xml` in Google Search Console after domain verification.
The sitemap includes stable `lastmod` values for every indexable URL and includes only reviewed
product images in image sitemap entries. Category, application and buyer-guide metadata uses a
relevant reviewed product image when one is available.

Product and category pages also expose visible section navigation with stable fragment IDs. Keep
these IDs stable when redesigning long pages so external links and search-result section links do
not break.

Update `contentLastModified` in `lib/content/site.ts` only after a significant public content
change. Product URLs use the later of `productTemplateLastModified` and each record's
`verifiedDate`; never generate a changing build-time date for sitemap entries.

For IndexNow-compatible search engines, the repository includes a public key file and a submission
script. After deployment, run:

```bash
npm run indexing:submit -- --dry-run
npm run indexing:submit
```

See `docs/search-indexing-submission.md` for the full indexing workflow.

## Buyer Download Files

The `/downloads` page provides buyer-facing CSV files that help distributors and importers prepare
RFQ information.

Generated public files:

- `public/downloads/renqiu-ailesen-welding-catalog.pdf` - compressed website version of the Renqiu
  Ailesen welding product catalog for buyer download
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
- `docs/product-image-checklist.csv` - legacy starter-product image planning worksheet
- `docs/first-30-sku-image-checklist.csv` - original first-30-SKU image planning worksheet
- `docs/product-image-tasks.csv` - generated missing image task list with target filenames and shot guidance
- `docs/representative-product-image-notes.md` - representative product-family image usage notes
- `docs/product-readiness-report.md` - generated product data, image and confirmation status checklist
- `docs/site-wide-upgrade-roadmap.md` - phased roadmap for improving page quality, SEO and RFQ conversion
- `docs/product-image-shooting-guide.md` - product photo shooting and editing guide
- `docs/catalog-product-data-audit.md` - Renqiu Ailesen PDF catalog review notes and imported product-family evidence
- `docs/product-image-source-audit.md` - temporary product image source notes for catalog-derived SKU pages
- `docs/missing-product-data-supplement.csv` - missing data worksheet for product pages
- `docs/production-missing-data-supplement.md` - production missing data priority and RFQ backend notes
- `docs/search-indexing-submission.md` - Google Search Console and IndexNow submission workflow
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
npm run indexing:submit -- --dry-run
```

## Notes

- No real API keys or secrets are included.
- `app/sitemap.ts` and `app/robots.ts` are included for search engine discovery.
- Product and category pages include SEO metadata and JSON-LD structured data where appropriate.
- Product detail pages currently use BreadcrumbList and FAQPage structured data only. Product rich
  result markup is disabled until real public offer, review or aggregate rating data is available.
- Analytics and Search Console verification are environment-driven and should not be hardcoded.
- Confirm real product images, final SKU codes and exact product specifications before scaling
  product pages.
