# arcfort-website

ArcFort Weld independent website project for Renqiu Ailesen Welding Technology Co., Ltd.

## Brand

- Brand name: ArcFort Weld
- Company English name: Renqiu Ailesen Welding Technology Co., Ltd.
- Company Chinese name: 任丘市埃勒森焊接科技有限公司
- Positioning: Industrial Welding & Cutting Solutions
- Audience: Global distributors, importers, OEM buyers, industrial users, and repair workshops

## Tech Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- ESLint
- Prettier

## Pages

- `/` - Home
- `/products` - Product center
- `/products/[category]` - SEO category page
- `/products/[category]/[slug]` - Product detail page
- `/applications` - Application center
- `/applications/[slug]` - Application detail page
- `/guides` - Buyer guide center
- `/guides/[slug]` - Buyer guide article
- `/about` - About
- `/contact` - Contact
- `/privacy` - Privacy notice
- `/rfq` - Request for quotation
- `/api/rfq` - RFQ submission endpoint prepared for Supabase

## Content Architecture

- `content/categories.ts` - product category SEO content
- `content/products.ts` - product detail content
- `content/applications.ts` - application page content
- `content/guides.ts` - buyer guide and article content
- `lib/content/schemas.ts` - reusable TypeScript content schema
- `lib/content/seo.ts` - metadata helper
- `lib/content/jsonld.ts` - JSON-LD helpers for Product, BreadcrumbList, Organization, and FAQ

The current content includes 6 product categories, 10 starter product pages, 6 application pages and 3 buyer guides. Missing product data must remain explicit instead of inventing specifications, certifications, prices, stock status, factory capacity, or customer cases.

## RFQ System

The `/rfq` page includes a responsive inquiry form with:

- Name, company, email, WhatsApp, country, product requirements, quantity, and message fields
- Required-field validation
- Business email format validation
- Drawing, product list, PDF, Excel, Word, JPG, and PNG upload selection
- Server-side validation through `/api/rfq`
- Success state after validation
- Optional Supabase storage for RFQ records and attachment metadata
- Optional Resend email notification to the configured business email

Supabase setup files:

- `supabase/rfq-schema.sql` - RFQ table and private attachment bucket setup
- `docs/supabase-rfq-setup.md` - Supabase, Vercel and testing instructions
- `docs/launch-checklist.md` - production launch checklist
- `docs/product-sku-template.csv` - SKU import planning template
- `docs/missing-product-data-supplement.csv` - missing data worksheet for the first 10 product pages
- `docs/production-missing-data-supplement.md` - production missing data priority and RFQ backend notes
- `docs/sku-template-guide.md` - SKU template filling guide and first batch recommendation
- `docs/product-data-workflow.md` - product CSV workflow and validation rules
- `supabase/product-catalog-schema.sql` - future product catalog database schema
- `docs/supabase-product-catalog-setup.md` - product catalog database setup instructions

Supabase storage and Resend email delivery are optional production services and must be configured
through environment variables. No real API keys, email passwords, database passwords, or private
tokens are committed.

Environment variables:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_RFQ_TABLE=rfq_inquiries
SUPABASE_RFQ_BUCKET=rfq-attachments
RFQ_EMAIL_RECIPIENT=arcfortweld@outlook.com
RFQ_EMAIL_FROM=
RESEND_API_KEY=
```

Confirmed business information:

- Business email: `arcfortweld@outlook.com`
- WhatsApp: `+86-18803076512`
- Address: Renqiu City, Cangzhou, Hebei Province, China
- Main port: Tianjin Xingang Port / Tianjin Port, China
- Alternative ports: Qingdao Port or Ningbo Port are available upon request

Suggested Supabase table fields:

- `name`
- `company`
- `email`
- `whatsapp`
- `country`
- `product_requirements`
- `quantity`
- `message`
- `attachments` as JSON
- `source_path`
- `status`
- `created_at`

## About Page

- Hero section
- Company overview
- What We Supply
- Our Advantages
- Quality Control
- Contact and RFQ CTA

## Contact Page

- Uses B2B inquiry-focused content for welding and cutting sourcing
- Uses confirmed email, WhatsApp, company address and export inquiry information
- Links buyers to `/rfq` for product lists, drawings, quantities and packaging requirements

## Product Lines

- MIG Torch Parts
- TIG Torch Parts
- Plasma Cutting Parts
- Welding Consumables
- Welding Machines
- Welding Accessories

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Validate product CSV data:

```bash
npm run validate:products
```

Preview generated product content:

```bash
npm run generate:products
```

## Notes

- No real API keys or secrets are included.
- The RFQ page validates submissions and can store them in Supabase or send email through Resend after environment variables are configured.
- Confirm real product images, final SKU codes and exact product specifications before scaling product pages.
- `app/sitemap.ts` and `app/robots.ts` are included for search engine discovery.
- Product and category pages include SEO metadata and JSON-LD structured data where appropriate.
