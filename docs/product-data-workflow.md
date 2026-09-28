# Product Data Workflow

This workflow prepares ARCFORT for 1000-3000 welding and cutting SKUs without inventing product data.

## Goal

Use `docs/product-sku-template.csv` as the first structured source for real product data. The CSV can
later be migrated to Supabase or Sanity CMS.

## Files

- `docs/product-sku-template.csv` - product data collection template
- `docs/missing-product-data-supplement.csv` - first 10 product missing data worksheet
- `docs/production-missing-data-supplement.md` - production missing data priority and RFQ backend notes
- `scripts/validate-product-csv.mjs` - CSV validation script
- `content/products.ts` - current mock product data used by the website
- `content/categories.ts` - current product category data
- `supabase/product-catalog-schema.sql` - deprecated, deliberately non-executable schema prototype
- `docs/supabase-product-catalog-setup.md` - redirect to the governed Product Intelligence setup

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
- Standard product fields such as `length`, `compatible_model`, `image_name` and `oem`

## Preview Generated Product Content

Run:

```bash
npm run generate:products
```

This converts the CSV into a TypeScript product content preview and prints it in the terminal. It
does not write files by default.

## Write Generated Product Content

After real product data is confirmed, run:

```bash
npm run generate:products:write
```

This writes:

```txt
content/generated-products.ts
```

Safety behavior:

- The write command refuses rows where `product_slug` is `to-be-confirmed`.
- The write command refuses rows where `title` is `to-be-confirmed`.
- The write command refuses rows where `process` is `To be confirmed`.
- Generated content should be reviewed before importing it into live pages.

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
8. Preview generated content with `npm run generate:products`.
9. Write generated content only after real product data is confirmed.
10. Import the reviewed data into Supabase, Sanity CMS or generated TypeScript content.

## Field Notes

| Field                   | Notes                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `category_slug`         | Must match a slug in `content/categories.ts`.                                                        |
| `product_slug`          | Use lowercase letters, numbers and hyphens.                                                          |
| `title`                 | Professional B2B English product name.                                                               |
| `sku`                   | Use `To be confirmed` if internal SKU is not ready.                                                  |
| `kind`                  | Use `welding-consumable` or `welding-equipment`.                                                     |
| `process`               | Use `MIG/MAG`, `TIG`, `MMA`, `Plasma Cutting` or `To be confirmed`.                                  |
| `short_description`     | One concise B2B sentence.                                                                            |
| `length`                | Use confirmed length or `Available upon request`.                                                    |
| `compatible_model`      | Use confirmed models such as `MB15 / MB24` or `Compatibility can be confirmed by sample or drawing`. |
| `oem`                   | Use `Available` when OEM service is available.                                                       |
| `image_name`            | Use a descriptive planned filename such as `mig-contact-tip-m6-10.jpg`.                              |
| `application`           | Main buyer-facing application phrase for the specification table.                                    |
| `applications`          | Separate multiple values with semicolons.                                                            |
| `features`              | Separate multiple values with semicolons.                                                            |
| `related_product_slugs` | Separate product slugs with semicolons.                                                              |
| `missing_fields`        | Separate missing field names with semicolons.                                                        |

## Product Intelligence Migration Path

The active Supabase foundation is the governed Product Intelligence schema under
`supabase/migrations/`. It imports repository data as a non-authoritative shadow, preserves source
and verification states, and reconciles stable identifiers before any authority change.

Do not run `supabase/product-catalog-schema.sql`; it is a blocked historical prototype. Follow
`docs/operations/product-intelligence-console-milestone-1.md` for local reset, database tests,
generated types, shadow import and hosted non-production approval requirements.

Do not connect a live importer or change the website source until the owner approves the exact
scope after parity, evidence and release-gate verification.
