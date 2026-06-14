# SKU Template Guide

This guide explains how to prepare the first ArcFort Weld SKU list for website product pages and future
Supabase or Sanity CMS import.

## How To Use The CSV

Use:

```txt
docs/product-sku-template.csv
```

Keep one row per SKU or product variation. Start with 20-50 confirmed or priority items before
expanding to the full catalog.

## Important Rules

- Do not invent specifications, certifications, prices, stock status, factory capacity or customer
  cases.
- Use clear buyer-facing fallback text for uncertain product fields instead of inventing data.
- Keep `To be confirmed` only for internal SKU or fields that must stay visibly pending in source
  data.
- Add every unknown field name to `missing_fields`.
- Use professional B2B English product names.
- Use semicolons for list fields such as `applications`, `features`, `related_product_slugs` and
  `missing_fields`.

## Standard Product Fields

Every product row should prepare these buyer-facing fields:

| Field | Example |
| --- | --- |
| `title` | MIG Contact Tip M6 1.0mm |
| `category_slug` | `mig-mag-torch-parts` |
| `material` | Copper / CuCrZr |
| `thread` | M6 |
| `size` | 1.0mm |
| `length` | 25mm |
| `compatible_model` | MB15 / MB24 |
| `application` | MIG/MAG welding torch consumables |
| `package` | 100 pcs/bag |
| `moq` | 500 pcs |
| `lead_time` | 7-15 working days |
| `image_name` | mig-contact-tip-m6-10.jpg |
| `oem` | Available |
| `short_description` | Copper contact tip for stable wire feeding in MIG welding. |

## Uncertain Field Fallbacks

Use these values when exact data is not confirmed:

| Uncertain data | Website value |
| --- | --- |
| Exact length unknown | Available upon request |
| MOQ unknown | Small trial orders accepted |
| Compatible model unknown | Compatibility can be confirmed by sample or drawing |
| Package unknown | Standard export packing or customized packaging |
| Material unknown | Copper material, specific grade to be confirmed |

## Category Slugs

Use only these category values:

| Category | `category_slug` |
| --- | --- |
| MIG/MAG Torch Parts | `mig-mag-torch-parts` |
| TIG Torch Parts | `tig-torch-parts` |
| Plasma Cutting Consumables | `plasma-cutting-consumables` |
| Welding Consumables | `welding-consumables` |
| Welding Machines | `welding-machines` |
| Welding Accessories | `welding-accessories` |

## Product Type Values

Use:

| Product type | `kind` |
| --- | --- |
| Consumables, torch parts and accessories | `welding-consumable` |
| Welding and cutting machines | `welding-equipment` |

## Process Values

Use:

- `MIG/MAG`
- `TIG`
- `MMA`
- `Plasma Cutting`
- `To be confirmed`

## First SKU Batch Recommendation

Start with these product families:

| Product line | Suggested first SKUs |
| --- | --- |
| MIG/MAG Torch Parts | Contact tip, gas nozzle, diffuser, torch liner, tip holder |
| TIG Torch Parts | Ceramic cup, collet, collet body, gas lens, back cap |
| Plasma Cutting Consumables | Electrode, nozzle, swirl ring, shield cup, consumable kit |
| Welding Consumables | Welding holder, ground clamp, welding cable, electrode, welding wire |
| Welding Machines | MIG/MAG welding machine, TIG welding machine, MMA welding machine, plasma cutting machine |
| Welding Accessories | Connector, electrode holder, cable lug, torch connector, accessory kit |

## Validation

After editing the CSV, run:

```bash
npm run validate:products
```

Warnings for `To be confirmed` are expected during data collection. Errors should be fixed before
generating or importing product data.
