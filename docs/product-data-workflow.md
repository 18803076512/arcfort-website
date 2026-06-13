# Product Data Workflow

This workflow prepares ARCFORT for 1000-3000 welding and cutting SKUs without inventing product data.

## Goal

Use `docs/product-sku-template.csv` as the first structured source for real product data. The CSV can
later be migrated to Supabase or Sanity CMS.

## Files

- `docs/product-sku-template.csv` - product data collection template
- `scripts/validate-product-csv.mjs` - CSV validation script
- `content/products.ts` - current mock product data used by the website
- `content/categories.ts` - current product category data

## Validate Product CSV

Run:

```bash
npm run validate:products
```

Or validate another file:

```bash
node scripts/validate-product-csv.mjs path/to/products.csv
```

The validator checks:

- Required columns
- Duplicate columns
- Known `category_slug`
- Valid `product_slug` format
- Duplicate product slugs
- Valid product `kind`
- Valid welding process
- Fields marked `To be confirmed`

## Required Product Rules

- Do not invent product specifications.
- Do not invent certifications.
- Do not invent prices.
- Do not invent stock status.
- Do not invent factory capacity.
- Do not invent customer cases.
- Use `To be confirmed` for missing data.
- Add missing fields to `missing_fields`.

## Recommended Workflow

1. Export or prepare product data in the CSV template.
2. Keep one row per SKU or product variation.
3. Fill confirmed data only.
4. Mark unknown data as `To be confirmed`.
5. Run `npm run validate:products`.
6. Fix validation errors.
7. Review warnings for missing data.
8. Import the validated data into Supabase, Sanity CMS or generated TypeScript content.

## Field Notes

| Field | Notes |
| --- | --- |
| `category_slug` | Must match a slug in `content/categories.ts`. |
| `product_slug` | Use lowercase letters, numbers and hyphens. |
| `title` | Professional B2B English product name. |
| `sku` | Use `To be confirmed` if internal SKU is not ready. |
| `kind` | Use `welding-consumable` or `welding-equipment`. |
| `process` | Use `MIG/MAG`, `TIG`, `MMA`, `Plasma Cutting` or `To be confirmed`. |
| `short_description` | One concise B2B sentence. |
| `applications` | Separate multiple values with semicolons. |
| `features` | Separate multiple values with semicolons. |
| `related_product_slugs` | Separate product slugs with semicolons. |
| `missing_fields` | Separate missing field names with semicolons. |

## Next Migration Step

After real SKU data is confirmed, create an importer that converts the CSV into one of these targets:

- Supabase tables for product management
- Sanity CMS documents
- Generated TypeScript content for static builds

Do not connect a live importer until the data owner confirms field accuracy.
