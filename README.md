# arcfort-website

ARCFORT Welding & Cutting Solutions independent website project.

## Brand

- Brand name: ARCFORT
- Full brand: ARCFORT Welding & Cutting Solutions
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

- `content/categories.ts` - sample product category content
- `content/products.ts` - sample product detail content
- `content/applications.ts` - application page content
- `content/guides.ts` - buyer guide and article content
- `lib/content/schemas.ts` - reusable TypeScript content schema
- `lib/content/seo.ts` - metadata helper
- `lib/content/jsonld.ts` - JSON-LD helpers for Product, BreadcrumbList, Organization, and FAQ

The current mock content includes 6 product categories, 8 sample products, 6 application pages and 3 buyer guides. Missing product data is marked as `To be confirmed` instead of inventing specifications, certifications, prices, stock status, factory capacity, or customer cases.

## RFQ System

The `/rfq` page includes a responsive inquiry form with:

- Name, company, email, WhatsApp, country, product requirements, quantity, and message fields
- Required-field validation
- Business email format validation
- Drawing, product list, PDF, Excel, Word, JPG, and PNG upload selection
- Server-side validation through `/api/rfq`
- Success state after validation

Supabase setup files:

- `supabase/rfq-schema.sql` - RFQ table and private attachment bucket setup
- `docs/supabase-rfq-setup.md` - Supabase, Vercel and testing instructions
- `docs/launch-checklist.md` - production launch checklist
- `docs/product-sku-template.csv` - SKU import planning template
- `docs/product-data-workflow.md` - product CSV workflow and validation rules

Supabase storage is optional and must be configured through environment variables. No real API keys,
email passwords, database passwords, or private tokens are committed.

Environment variables:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_RFQ_TABLE=rfq_inquiries
SUPABASE_RFQ_BUCKET=rfq-attachments
```

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
- Uses `To be confirmed` for email and WhatsApp until official contact details are confirmed
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

## Notes

- No real API keys or secrets are included.
- The RFQ page validates submissions and can store them in Supabase after environment variables are configured.
- Replace placeholder contact details before production launch.
- The privacy notice uses placeholder contact information and should be reviewed before production launch.
- `app/sitemap.ts` and `app/robots.ts` are included for search engine discovery.
- Product and category pages include SEO metadata and JSON-LD structured data where appropriate.
