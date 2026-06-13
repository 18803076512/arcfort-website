# Supabase Product Catalog Setup

This guide prepares Supabase for ARCFORT product categories, product SKUs, product images, FAQs and
related product links.

The current website still reads product content from TypeScript mock data. This database setup is
for the next migration step after real SKU data is confirmed.

## Files

- `supabase/product-catalog-schema.sql` - product catalog tables and private asset bucket
- `docs/product-sku-template.csv` - CSV source template for SKU collection
- `scripts/validate-product-csv.mjs` - product CSV validator
- `scripts/generate-products-from-csv.mjs` - product content preview/generation script

## Step 1: Run SQL

Open Supabase SQL Editor and run:

```sql
-- Copy the full contents of supabase/product-catalog-schema.sql
```

This creates:

- `public.product_categories`
- `public.products`
- `public.product_images`
- `public.product_faqs`
- `public.product_relations`
- Private storage bucket `product-assets`

## Step 2: Security Model

The SQL enables RLS on all product catalog tables and grants access to `service_role`.

Rules:

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Do not prefix service role variables with `NEXT_PUBLIC_`.
- Do not create public insert or update policies for website visitors.
- Keep product assets private until the image delivery workflow is confirmed.

## Step 3: Product Data Flow

Recommended flow:

1. Collect real SKU data in `docs/product-sku-template.csv`.
2. Mark missing fields as `To be confirmed`.
3. Run `npm run validate:products`.
4. Fix errors and review warnings.
5. Preview generated content with `npm run generate:products`.
6. Review generated fields with the product owner.
7. Import confirmed data into Supabase tables.

## Tables

### `product_categories`

Stores product category SEO and buyer guide content.

Important fields:

- `slug`
- `code`
- `title`
- `description`
- `seo_title`
- `seo_description`
- `seo_intro`
- `buyer_guide`
- `features`
- `faq`
- `status`

### `products`

Stores SKU and product detail page content.

Important fields:

- `category_slug`
- `slug`
- `title`
- `sku`
- `kind`
- `process`
- `short_description`
- `description`
- `specifications`
- `compatibility`
- `applications`
- `features`
- `packaging`
- `moq`
- `lead_time`
- `missing_fields`
- `status`

### `product_images`

Stores private asset paths and alt text.

Images should not be public until the production image workflow is confirmed.

### `product_faqs`

Stores product-level FAQ items.

### `product_relations`

Stores related, compatible or replacement product links.

## Status Workflow

Use these status values:

- `draft`
- `review`
- `published`
- `archived`

Do not publish rows until real data has been checked.

## Missing Data Policy

Do not invent:

- Product specifications
- Certifications
- Prices
- Stock status
- Factory capacity
- Customer cases

Use `To be confirmed` and list missing fields in `missing_fields`.

## Future Importer

After real SKU data is available, add a server-side importer that:

- Reads a validated CSV file
- Upserts `product_categories`
- Upserts `products`
- Inserts product FAQs
- Inserts product relations
- Stores product asset paths after upload

The importer should run server-side only and use environment variables for Supabase credentials.
