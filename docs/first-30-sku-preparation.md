# First 30 SKU Preparation Guide

This guide is for preparing the first scalable SKU batch for ArcFort Weld. It is designed for
industrial B2B welding and cutting product pages, not for retail-style product listings.

## Files

- `data/import/products-simple-30-sku-template.csv` - first 30 SKU worksheet with safe placeholders
- `data/import/products-simple.csv` - active simple SKU file, currently aligned with this 30 SKU batch
- `data/import/products.csv` - generated full product CSV
- `lib/data/products.ts` - website product data generated from the full CSV

## Recommended Workflow

1. Review `data/import/products-simple-30-sku-template.csv`.
2. Edit `data/import/products-simple.csv` for the active website SKU list.
3. Add real product photos to `public/images/products/`.
4. Keep image filenames consistent with the `image_name` column.
5. Run a preview before writing generated data:

```bash
npm run products:simple:preview
```

6. Generate the full CSV after reviewing the preview:

```bash
npm run products:simple:generate
```

7. Check image availability:

```bash
npm run products:check-images
```

8. Import products into the website data file:

```bash
npm run products:simple:import
```

9. Build the website:

```bash
npm run build
```

## Direct Preview for the 30 SKU Template

To preview the 30 SKU worksheet without replacing the active simple CSV, run:

```bash
node --experimental-strip-types scripts/import-simple-products.ts --input data/import/products-simple-30-sku-template.csv
```

This command should generate product rows in preview mode only. It does not write files unless
`--write` is added.

## Current Import Status

The first 30 SKU worksheet has been promoted into the active simple CSV workflow. Importing the
current active CSV keeps existing generic starter records and adds more specific first-batch SKUs.
This is intentional: existing product data is retained until it is deliberately archived or replaced
after real specifications and product photos are confirmed.

## What You Should Confirm Before Publishing

For each SKU, collect or verify:

- Real product photo
- Material or material grade
- Size, thread, length or connection detail
- Compatible model or reference part, if confirmed
- Package method and quantity
- MOQ policy for the item
- Regular lead time
- OEM packaging availability
- PDF catalog or drawing, if available

## Safe Placeholder Rules

Use these values when data is not confirmed:

- `Available upon request`
- `Contact us for details`
- `TBD`
- `needs_review`
- `unknown`

Do not publish unconfirmed facts as confirmed specifications.

## Never Invent

Do not invent:

- OEM numbers
- Confirmed compatible models
- Certifications
- Prices
- Exact technical ratings
- Unverified product dimensions
- Factory capacity or customer cases

## First Batch Priority

Start with products that are easiest to photograph and most likely to attract search traffic:

1. MIG contact tips
2. MIG gas nozzles
3. MIG tip holders and diffusers
4. TIG ceramic cups
5. TIG gas lenses and collet bodies
6. Plasma electrodes and nozzles
7. Ground clamps and cable connectors

This gives the website a stronger foundation for Google indexing and RFQ conversion before scaling
to hundreds or thousands of SKUs.
