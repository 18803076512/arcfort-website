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

The website currently includes 6 product categories, 12 starter product pages, 6 application pages,
3 buyer guides and dedicated trust pages for OEM service, quality control, shipping/payment and
document requests. Missing product data must remain explicit instead of inventing specifications,
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
- `data/import/products-simple.csv` - simple working SKU file

Simple workflow:

1. Edit `data/import/products-simple.csv`.
2. Put product images in `public/images/products/` using the `image_name` values.
3. Run `npm run products:simple:preview` to check generated data without writing files.
4. Run `npm run products:simple:generate` to generate `data/import/products.csv`.
5. Run `npm run products:check-images`.
6. Run `npm run products:simple:import` to update `lib/data/products.ts`.
7. Run `npm run build`.

The simple importer can generate safe routing, image-path, SEO and placeholder values. It must not
generate confirmed OEM numbers, confirmed compatible models, certifications, prices, exact technical
ratings or unverified product dimensions.

Full CSV workflow:

1. Copy `data/import/products-template.csv` to `data/import/products.csv`.
2. Fill product data in `data/import/products.csv`.
3. Put product images in `public/images/products/`.
4. Run `npm run products:validate`.
5. Run `npm run products:check-images`.
6. Run `npm run products:import`.
7. Run `npm run build`.
8. Submit a pull request.

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

Supabase storage and Resend email delivery are optional production services and must be configured
through environment variables. No real API keys, email passwords, database passwords or private
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

## Useful Documents

- `supabase/rfq-schema.sql` - RFQ table and private attachment bucket setup
- `docs/supabase-rfq-setup.md` - Supabase, Vercel and testing instructions
- `docs/rfq-email-delivery.md` - Resend email delivery setup for RFQ notifications and attachments
- `docs/launch-checklist.md` - production launch checklist
- `docs/arcfort-product-information-table.csv` - 12-product B2B information table with missing data notes
- `docs/product-image-checklist.csv` - product image status and replacement checklist
- `docs/product-image-shooting-guide.md` - product photo shooting and editing guide
- `docs/missing-product-data-supplement.csv` - missing data worksheet for product pages
- `docs/production-missing-data-supplement.md` - production missing data priority and RFQ backend notes
- `docs/sku-template-guide.md` - SKU template filling guide and first batch recommendation
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
```

## Notes

- No real API keys or secrets are included.
- `app/sitemap.ts` and `app/robots.ts` are included for search engine discovery.
- Product and category pages include SEO metadata and JSON-LD structured data where appropriate.
- Confirm real product images, final SKU codes and exact product specifications before scaling
  product pages.
