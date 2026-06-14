# Production Missing Data Supplement

This document tracks the real data still needed before ArcFort Weld product pages and RFQ flow can be considered fully production-ready.

## Files To Use

- `docs/missing-product-data-supplement.csv` - exact missing field worksheet for the first 10 product pages
- `docs/product-sku-template.csv` - current product data source used for SKU planning and future import
- `docs/sku-template-guide.md` - field rules and fallback wording

## Business Data Status

Confirmed business information is already available in the website config:

- Company: Renqiu Ailesen Welding Technology Co., Ltd.
- Brand: ArcFort Weld
- Email: arcfortweld@outlook.com
- WhatsApp: +86-18803076512
- Address: Renqiu City, Cangzhou, Hebei Province, China
- Main port: Tianjin Xingang Port / Tianjin Port, China
- Payment terms: T/T, 30% deposit, 70% balance before shipment
- MOQ policy: Small trial orders accepted for standard torch parts and consumables
- Lead time policy: 7-20 working days for regular orders after deposit confirmation
- OEM service: Logo, packaging, private label and model customization are available

## RFQ Backend Data Still Needed

The RFQ form validates submissions, but real delivery requires production environment variables.

Required for email delivery:

- `RESEND_API_KEY`
- `RFQ_EMAIL_FROM`
- `RFQ_EMAIL_RECIPIENT=arcfortweld@outlook.com`

Optional for database storage and attachment records:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_RFQ_TABLE=rfq_inquiries`
- `SUPABASE_RFQ_BUCKET=rfq-attachments`

Do not commit these values to the repository.

## Product Data Priority

Fill the missing CSV in this order:

1. Internal SKU or part number
2. Real product image file name
3. Exact length, thread and size
4. Material grade
5. Compatible model and compatible brand reference
6. OEM number or cross reference
7. Standard package quantity
8. MOQ and lead time by product family

## First 10 Product Gaps

| Product | Highest priority missing data |
| --- | --- |
| MIG Contact Tip M6 0.8mm | SKU, real image, length, compatible brand, OEM number |
| MIG Contact Tip M6 1.0mm | SKU, real image, length, compatible brand, OEM number |
| MIG Contact Tip M6 1.2mm | SKU, real image, length, compatible brand, OEM number |
| MIG Tip Holder for MB15 | SKU, real image, material grade, thread, length, compatible brand, OEM number, package |
| MIG Gas Nozzle for MB15 | SKU, real image, material grade, thread, length, compatible brand, OEM number, package |
| TIG Ceramic Cup #5 | SKU, real image, thread, length, compatible model, compatible brand, OEM number, package |
| TIG Ceramic Cup #6 | SKU, real image, thread, length, compatible model, compatible brand, OEM number, package |
| TIG Gas Lens 1.6mm | SKU, real image, material grade, thread, length, compatible model, compatible brand, OEM number, package |
| Plasma Electrode | SKU, real image, material grade, thread, size, length, compatible model, compatible brand, OEM number, package |
| Plasma Nozzle | SKU, real image, material grade, thread, size, length, compatible model, compatible brand, OEM number, package |

## Product Image Requirements

Prepare images with these planned file names:

- `mig-contact-tip-m6-08.jpg`
- `mig-contact-tip-m6-10.jpg`
- `mig-contact-tip-m6-12.jpg`
- `mig-tip-holder-mb15.jpg`
- `mig-gas-nozzle-mb15.jpg`
- `tig-ceramic-cup-5.jpg`
- `tig-ceramic-cup-6.jpg`
- `tig-gas-lens-16.jpg`
- `plasma-electrode.jpg`
- `plasma-nozzle.jpg`

Recommended image style:

- Clean product photo on white or light industrial background
- Minimum width: 1200 px
- Use one main product image per SKU first
- Avoid watermarks, competitor logos and unrelated certificates
- Keep the file names lowercase with hyphens

## What Not To Add Without Proof

Do not add these fields unless official data is confirmed:

- CE, ISO, RoHS, UL or other certifications
- Exact factory capacity
- Exact stock status
- Customer cases
- Exact compatible brand claims
- Exact machine performance claims
- Prices

## Next Step After Filling

After `docs/missing-product-data-supplement.csv` is filled:

1. Copy confirmed values into `docs/product-sku-template.csv`.
2. Run `npm run validate:products`.
3. Add real images to the website image directory when product image rendering is implemented.
4. Update `content/products.ts` or generate product content from CSV.
5. Run `npm run build`.
