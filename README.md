# arcfort-website

Industrial B2B website for ArcFort Weld, operated by Renqiu Ailesen Welding Technology Co., Ltd.

## Brand

- Brand name: ArcFort Weld
- Company English name: Renqiu Ailesen Welding Technology Co., Ltd.
- Company Chinese name: 任丘市埃勒森焊接科技有限公司
- Positioning: Industrial Welding & Cutting Solutions
- Audience: Global distributors, importers, wholesalers, OEM buyers, industrial users, and repair workshops

The legal entity and website brand are deliberately separated in structured data: Schema.org
`Organization` uses Renqiu Ailesen Welding Technology Co., Ltd. as its primary name, while ArcFort
Weld is represented as the `Brand` and `WebSite`. Add `sameAs` links only for verified profiles
controlled by this company; never associate unrelated companies that use a similar brand name.

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
- `/distributor-supply` - Distributor, importer and wholesale sourcing information
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
- `docs/content-research/` - internal source records used to verify technical buyer-guide claims
- `lib/content/schemas.ts` - reusable TypeScript content schema
- `lib/content/site.ts` - centralized company, contact, trade, port, payment, MOQ, lead time and OEM information
- Shared email and WhatsApp link builders in `lib/content/site.ts` prefill product, quantity,
  destination and reference prompts so buyers can start a usable inquiry from any major page.
- `lib/content/seo.ts` - metadata helper
- `lib/content/jsonld.ts` - JSON-LD helpers for Product, BreadcrumbList, Organization and FAQ
- `lib/content/product-redirects.ts` - permanent redirects for retired product URLs and historical
  category aliases
- `lib/content/product-search.ts` - server-rendered product search, category filtering and pagination
- `lib/content/topic-links.ts` - category-to-guide internal linking map

The website currently includes 6 product categories, 43 product records (41 active public products
and 2 draft records awaiting reviewed images), 6 application pages, 14 buyer guides and dedicated
trust pages for distributor supply, OEM service, quality control, shipping/payment and document
requests. Four retained generic starter URLs permanently
redirect to their current category pages so they do not compete with exact SKU pages. Missing product data must remain explicit
instead of inventing specifications, certifications, prices, stock status, factory capacity or
customer cases.

Plasma and TIG category records also provide structured component guides, selection variables and
compatibility evidence checklists. These sections are rendered from `content/categories.ts`, link to
active product records and guide buyers toward model-, drawing- or sample-based confirmation. The
TIG parts identification guide is intentionally separate from the TIG consumable-stack selection
guide: one helps name unknown parts from photos and samples, while the other checks how known parts
fit together.

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
simple file. Existing publication and verification metadata is retained. New or updated rows without
a reviewed own or supplier image are generated as `draft`, preventing placeholder products from
returning to public category pages when the simple SKU batch is regenerated.

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
- Keep products with `needs_photo` or `placeholder` image status as `draft`; only publish them after
  the product type is supported by a reviewed own or supplier photo.
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
- Server-side file signature checks for PDF, JPG, PNG, CSV, legacy Office and OOXML attachments
- Success state only after Resend email or complete Supabase inquiry and attachment storage confirms
  delivery
- Buyer-visible RFQ reference in success and delivery-failure responses
- Optional Supabase storage for RFQ records and attachment metadata
- Optional Resend email notification to the configured business email
- RFQ file attachments sent with the Resend email when email delivery is configured
- Branded HTML sales notifications and buyer confirmations with a plain-text fallback for email
  client compatibility
- A privacy-safe quotation-readiness panel in the sales email with confirmed inquiry signals and
  missing-information prompts; it does not score or reject buyers
- A human-readable lead-source summary and one-click buyer email action in the sales notification;
  the WhatsApp action appears only for an international-format number supplied by the buyer
- Privacy-bounded RFQ attribution that retains only the entry page path, external referrer origin
  and validated UTM labels; unrelated query parameters and full referrer paths are discarded
- Buyer confirmation guidance covering product references, drawings, sample photos, packaging and
  destination details that can accelerate manual review
- Resend idempotency keys for both the sales notification and buyer confirmation, preventing an
  unchanged retry from sending duplicate emails during the provider's 24-hour protection window
- Retry-safe optional Supabase delivery: attachment objects use stable reference paths with upsert,
  and duplicate inquiry rows are ignored by the unique RFQ reference without resetting their status
- HTML escaping for buyer, attachment and source values before they are rendered in email markup
- Independent email and storage delivery so one provider failure does not block the other
- Prefilled email and WhatsApp fallback when automated delivery is unavailable
- Backend readiness check at `/api/rfq/status`
- Lightweight spam protection with same-origin checks, honeypot, timing checks and source-path
  tracking
- Invisible Vercel BotID Basic verification on browser submissions to `POST /api/rfq`
- Best-effort application fallback limiting each hashed client key to 5 RFQ attempts per 10 minutes,
  with `429`, `Retry-After` and `X-RateLimit-*` response headers
- Structured server logs for delivery outcome, RFQ reference and Resend message IDs without buyer
  personal data
- Persistent multi-product RFQ shortlist stored in the buyer's browser
- Live shortlist count in the desktop header, mobile menu and sticky contact bar
- Per-product quantity and buyer reference fields for mixed distributor inquiries
- Selected products automatically merged into the RFQ submission with SKU, category, line quantity
  and model, size or drawing reference when provided
- Buyer-guide RFQ links prefill the guide topic so the sales team can see the sourcing context
- Every buyer guide links directly to the downloadable RFQ worksheet and the upload form through a
  responsive download, complete and upload workflow
- The Contact page embeds the same production RFQ form with a `contact_page` placement marker, so
  buyers can submit requirements and attachments without an extra page transition

Buyers can add up to 50 products from product cards or detail pages. The shortlist and optional
line-item quantities or references remain in browser `localStorage` until the buyer submits the RFQ
or clears the list; it does not require an account and does not expose internal product fields. When
every selected product has a line quantity, the overall quantity summary becomes optional.

The form also shows a quotation-preparation check before submission. It identifies whether product
evidence, quantity, destination and supporting files are present, then lists buyer-friendly details
that can reduce follow-up. RFQ conversion events include only the readiness status and signal count;
buyer contact data, requirements and attachment names are not sent to analytics.

Attachment signature checks reject files whose contents do not match the submitted extension before
storage or email delivery. This reduces simple extension spoofing but does not replace endpoint
malware scanning; sales users must continue to scan external attachments and avoid enabling macros.

Supabase storage and Resend email delivery are optional production services and must be configured
through environment variables. No real API keys, email passwords, database passwords or private
tokens are committed.

For production launch, follow `docs/rfq-production-readiness.md` and confirm
`https://www.arcfortweld.com/api/rfq/status` reports `email.ready:true` before treating the RFQ form as
a complete automated lead channel. Configuration readiness must still be followed by one controlled
test inquiry that reaches the sales inbox.

Run the shared RFQ validation, reference and email-template safety tests with:

```bash
npm run test:rfq
```

Check the deployed backend without sending an inquiry:

```bash
npm run rfq:check-live
```

BotID requires a browser-generated challenge on protected submissions. Send a controlled production
test from the deployed `/rfq` page, then confirm the matching `AF-RFQ-...` reference in the sales
inbox and Resend logs. The command-line checker remains a non-mutating readiness check and does not
send an inquiry.

The browser waits up to 45 seconds for the RFQ API response. It never retries automatically because
a delayed response can arrive after the server has already accepted the inquiry. On timeout, all
entered fields and selected attachments remain in the form. An unchanged manual retry reuses the
same submission token, RFQ reference, Resend idempotency keys and optional Supabase storage paths;
editing the inquiry creates a new token. The buyer is still directed to check for the confirmation
email before retrying or using the email/WhatsApp fallback.

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

Scan all Git-tracked text files for high-confidence API keys, access tokens, private keys and
sensitive environment-variable assignments before committing configuration or documentation:

```bash
npm run security:secrets
```

The scan redacts matched values and reports only the credential type, file and line number. It runs
in CI before product generation, linting and build checks. It complements provider-side key rotation
and GitHub secret scanning; it does not make a key safe again after that key has been shared outside
the repository.

Global responses include a Content Security Policy plus `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` and legacy browser hardening
headers. The CSP keeps statically generated pages cacheable, blocks plugins, frames and inline event
handler attributes, and only allows same-origin resources plus the official Google tag and GA4
collection origins. Advertising endpoints are not allowed because this site does not enable Google
Ads or advertising signals. Re-audit the policy before adding another browser-side service.

The RFQ endpoint uses free Vercel BotID Basic browser verification before parsing an inquiry. If the
verification service is temporarily unavailable, the endpoint fails open to the existing same-origin,
honeypot, timing, file-validation and application-rate-limit protections so genuine buyers retain the
email and WhatsApp-backed inquiry path. The application limiter uses Vercel's forwarded client IP,
hashes the key with a process-local salt and keeps no raw IP address. It is not distributed because
Vercel Functions can restart or scale across instances. A paid Vercel Firewall rate-limit rule for
`POST /api/rfq` remains optional for sustained abuse and must not be enabled without billing approval.

The App Router includes three buyer-facing recovery layers: `app/not-found.tsx` for missing URLs,
`app/error.tsx` for page-level runtime errors and `app/global-error.tsx` for root-layout failures.
Keep product, RFQ, business email and WhatsApp recovery routes available when these pages are
updated. Error pages must not expose stack traces, credentials or internal request data.

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

Search performance improvements should follow exported Search Console evidence rather than isolated
keyword assumptions. Keep dated baselines under `docs/seo/`, use page and query-cluster trends, and
wait at least 28 days before judging title or content changes. The current baseline and action record
is `docs/seo/search-console-baseline-2026-08-12.md`.

Homepage search-title changes should preserve the visible H1 and broad supply scope unless the search
evidence clearly supports a repositioning. Keep the first viewport focused on product categories,
direct contact and RFQ entry, and verify that mobile buyers can see the next content band without a
full-screen promotional block.

Run the combined production health check without sending an RFQ or email:

```bash
npm run health:production
```

GitHub Actions runs the same non-mutating production health check every six hours. A failed run
opens or updates one `[Production] ArcFort Weld health check failed` issue with the Actions run link;
the next successful run adds a recovery note and closes that issue. The health job keeps read-only
repository access, while only the separate incident job receives `issues: write` permission.

## Performance Budgets

Run a production build and then check the buyer-facing transfer budgets with:

```bash
npm run build
npm run performance:budget
```

The budget reads the generated Next.js app manifest and checks gzip-compressed JavaScript for the
homepage, Product Center and RFQ route, shared CSS, individual JavaScript assets and source files in
`public/images/site/`. It prevents future shared scripts, form features or visual assets from
quietly increasing the initial buyer download. Update a limit only after measuring the deployed page
and documenting why the additional transfer cost provides necessary buyer value.

The Next.js image configuration includes common mobile and desktop viewport widths so full-width
buyer-facing images receive a close responsive AVIF or WebP candidate instead of downloading the
next much larger default size. Keep page-level `sizes` values accurate when adding or changing an
image layout, and measure the deployed optimized response rather than treating the source-file size
as the browser transfer size.

Audit only the deployed CSP, browser hardening headers, HSTS, framework disclosure and RFQ status
cache policy with:

```bash
npm run security:audit:live
```

`.github/workflows/production-health.yml` runs this check every six hours and can also be started
manually from GitHub Actions. It fails when the production RFQ configuration is no longer ready or
when the live SEO audit finds a blocking route, metadata, sitemap, robots, redirect, structured-data
or internal-link problem, or when required production security headers regress. Search Console and
GA4 configuration reminders remain non-blocking.

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

Tracked contact, RFQ and download link events include a non-personal `link_placement` value such as
`header`, `footer`, `sticky_contact`, `navigation`, `sidebar` or `page_content`. This supports CTA
placement analysis without sending link text, email subjects, product requirements or buyer data.

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

- `public/downloads/arcfort-distributor-sourcing-guide.pdf` - four-page English distributor guide
  covering product scope, sourcing workflow, confirmed trade terms and an RFQ checklist
- `public/downloads/renqiu-ailesen-welding-catalog.pdf` - compressed website version of the Renqiu
  Ailesen welding product catalog for buyer download
- `public/downloads/arcfort-public-product-list.csv` - active product list with SKU, product URL
  and RFQ-ready sourcing notes
- `public/downloads/arcfort-rfq-template.csv` - buyer worksheet for product list quotation requests
- `public/downloads/arcfort-oem-project-brief.xlsx` - four-tab OEM project workbook for buyer,
  product-line, packaging, artwork and evidence-file preparation
- `public/downloads/arcfort-plasma-consumables-rfq.xlsx` - four-tab plasma consumables workbook for
  torch references, consumable line items, quantities, evidence files and compatibility review
- `public/downloads/arcfort-welding-machine-rfq.xlsx` - four-tab welding equipment workbook for
  buyer requirements, supplier confirmation, accessories, market documents and order approval

Refresh the files after SKU updates:

```bash
npm run downloads:generate
```

The public product list must not expose internal notes, private supplier references, prices,
unconfirmed certifications or hidden SKU workflow fields.

The OEM project brief is a buyer-completed preparation file. Its readiness summary uses workbook
formulas, and its product, model, size, rating, certification and compatibility fields must remain
buyer-provided or evidence-based. Do not prefill unverified technical claims.

The plasma consumables RFQ workbook follows the same evidence-first rule. Buyers should enter one
electrode, nozzle, swirl ring, retaining cap, shield, spacer or kit per line, link each line to an
evidence ID, and use `Reference only`, `Unverified` or `Supplier review required` when fit is not
documented. The workbook can be uploaded directly through the production RFQ form.

The welding machine RFQ workbook separates the buyer's process, application and destination
electrical requirements from the supplier's proposed configuration and supporting evidence. Exact
output, duty cycle, interfaces, certification and other technical fields must remain buyer-provided
or supplier-confirmed for the quoted machine. The workbook can be uploaded directly through the RFQ
form with nameplate photos, approved specifications or reference documents.

High-value products can add a dedicated buying profile in
`lib/content/product-buying-profiles.ts`. A profile supplies product-specific selection variables,
evidence checks, RFQ fields, FAQs and an optional buyer download without adding unconfirmed technical
values to the core SKU record. The Wire Feeder profile is the first implementation and reuses the
welding machine RFQ workbook for power-source, interface, accessory and approval review.

## Distributor Promotion Workflow

The first measurable promotion campaign targets relevant welding and cutting product distributors,
importers and wholesalers. Campaign definitions are stored in `data/promotion/campaigns.csv`; the
generated UTM links are stored in `docs/promotion/campaign-links.csv`.

Generate and verify promotion links with:

```bash
npm run promotion:links
npm run promotion:prospects
npm run promotion:wave
npm run promotion:check
npm run promotion:test
```

The English campaign assets are:

- `public/downloads/arcfort-distributor-sourcing-guide.pdf` - published buyer download
- `scripts/generate-distributor-guide.py` - reproducible PDF source using ReportLab and Pillow
- `docs/promotion/distributor-campaign-playbook.md` - audience, channel, measurement and publishing workflow
- `docs/promotion/outreach-templates.md` - targeted email, permission-based WhatsApp, LinkedIn and directory copy
- `docs/promotion/content-calendar.csv` - four-week channel sequence
- `docs/promotion/social-preview-asset.md` - distributor social-image source, usage limits and validation
- `docs/promotion/distributor-prospect-research.csv` - verified public-company research with official source and contact URLs
- `docs/promotion/prospect-qualification-guide.md` - qualification, status, privacy and manual outreach rules
- `data/promotion/outreach-wave-01.csv` - five-company Oceania test batch mapped to verified sources and campaign links
- `docs/promotion/outreach-wave-01.md` - company-specific drafts for manual review and sending only
- `data/promotion/outreach-wave-02.csv` - five-company South Africa, UK and Canada test batch
- `docs/promotion/outreach-wave-02.md` - second-wave company-specific drafts for manual review only
- `data/promotion/outreach-wave-03.csv` - five-company United Arab Emirates test batch
- `docs/promotion/outreach-wave-03.md` - third-wave company-specific drafts for manual review only
- `data/promotion/outreach-wave-04.csv` - five-company Saudi Arabia industrial supplier batch
- `docs/promotion/outreach-wave-04.md` - fourth-wave company-specific drafts for manual review only

Only allowlisted UTM fields are retained in GA4 page locations; unrelated query parameters are
discarded. RFQ lead attribution applies the same campaign-value rules and stores only the entry path
and external referrer origin. Do not put buyer personal data in UTM parameters or analytics events.
Outreach must be relevant, identified and manually reviewed; the repository does not automate unsolicited messages.
`npm run promotion:test` also verifies that the RFQ conversion funnel keeps its form-start,
submission, lead, contact and buyer-download events, and that the form-start event contains no buyer
PII or inquiry content.

The prospect research file is not a customer or partner list. It must contain company-level public
information only. Recheck each official website before contact, use small manually reviewed batches,
keep correspondence outside Git and honor opt-out requests. `npm run promotion:prospects` validates
the schema, official-domain URLs, campaign IDs, statuses and accidental contact data.

The four outreach waves contain twenty unique company-level drafts and are not an automated sending
system. Run `npm run promotion:wave`, reopen every official evidence page, approve each message
manually and use only the company's published business inquiry route. Keep replies and contact
records in a private sales system rather than Git.

Use the private `arcfort-outreach-tracker.xlsx` workbook for daily execution. It consolidates the
twenty official contact routes, evidence sources, product angles and UTM links, then calculates review,
send, reply, follow-up and qualified-inquiry metrics from editable status fields. The workbook belongs
under the ignored `outputs/` directory and must never be committed after buyer responses are added.
Initial zero values mean the drafts have not been sent; they are not campaign-performance results.

The distributor landing page and Contact page embed the same production RFQ form used by `/rfq`, so
buyers can submit a product list without an extra page transition. The form keeps attachment,
validation, BotID, email delivery and failure-fallback behavior. Conversion events include only the
controlled `form_placement` value (`distributor_landing`, `contact_page` or `rfq_page`) and never
buyer PII.

The distributor landing page has route-specific 1200 x 630 Open Graph and Twitter images. Shared
site chrome, visual category codes, product-image labels and repeated card actions use static
`data-nosnippet` regions so Google can build cleaner result snippets from the page's primary B2B
content. After each build, run:

```bash
npm run seo:snippets
```

## Useful Documents

- `supabase/rfq-schema.sql` - RFQ table and private attachment bucket setup
- `docs/supabase-rfq-setup.md` - Supabase, Vercel and testing instructions
- `docs/rfq-email-delivery.md` - Resend email delivery setup for RFQ notifications and attachments
- `docs/rfq-production-readiness.md` - production RFQ email setup, Vercel environment variables and live test checklist
- `docs/sales/rfq-response-playbook.md` - manual RFQ qualification, reply templates and quotation checks
- `docs/performance-baseline.md` - measured mobile baseline, methodology and enforced build budgets
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
- `docs/seo/search-console-baseline-2026-08-12.md` - Search Console baseline, prioritized pages and 28-day measurement plan
- `docs/promotion/distributor-campaign-playbook.md` - first distributor campaign workflow and measurement plan
- `docs/promotion/outreach-templates.md` - compliant distributor outreach copy
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
npm run typecheck
npm run products:validate
npm run products:check-images
npm run products:image-tasks
npm run products:report
npm run seo:audit
npm run test:rfq
npm run downloads:generate
npm run indexing:submit -- --dry-run
```

Pull requests and pushes to `main` run the same product, image, SEO, RFQ, lint, type and production
build checks through `.github/workflows/quality.yml`.

## Notes

- No real API keys or secrets are included.
- `app/sitemap.ts` and `app/robots.ts` are included for search engine discovery.
- Product and category pages include SEO metadata and JSON-LD structured data where appropriate.
- Product detail pages currently use BreadcrumbList and FAQPage structured data only. Product rich
  result markup is disabled until real public offer, review or aggregate rating data is available.
- Analytics and Search Console verification are environment-driven and should not be hardcoded.
- Confirm real product images, final SKU codes and exact product specifications before scaling
  product pages.
