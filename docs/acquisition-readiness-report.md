# Acquisition Readiness Report

Evidence date: 2026-08-29. This internal report separates repository facts, verified production behavior and business evidence that still requires external confirmation.

## Executive Status

ArcFort Weld is live and indexable. The RFQ path is configured through the email provider, while final inbox placement still requires external confirmation. The next growth constraint is not another general page. It is stronger product evidence, verified measurement and disciplined follow-up on the pages already receiving search impressions.

- Production deployment verified: Yes
- Canonical production URL: https://www.arcfortweld.com
- Production sitemap URLs: 88
- Live SEO audit checked: 2026-08-29
- Security headers checked: 2026-08-29
- Active public products: 40
- Draft products held from publication: 3
- Product categories: 6
- Governed product series: 0
- Catalog product-series evidence records: 10
- Governed series-component facts: 589
- Governed series-component candidates: 189
- Governed compatibility relationships: 4
- Governed field-level technical facts: 15
- Governed product image assets: 46
- Application pages: 6
- Buyer guides: 17
- RFQ production-ready status: Yes
- Search Console baseline: 8 clicks / 422 impressions / 1.90% CTR

## Acquisition Channels

| Channel           | Evidence                                                                                             | Current status                                                                                                     | Next control                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Organic search    | Search Console export for 2026-06-26 through 2026-08-09                                              | 8 clicks and 422 impressions recorded                                                                              | Compare a clean 28-day post-change window on or after 2026-09-12                                                 |
| Website RFQ       | Production status and controlled provider acceptance                                                 | Email delivery mode; sales notification, buyer confirmation and attachments are configured                         | Confirm matching references in the sales and buyer inboxes                                                       |
| Email / WhatsApp  | arcfortweld@outlook.com and +86-18803076512 are visible across major buyer paths                     | Direct fallback contacts available                                                                                 | Track non-PII click and qualified-inquiry outcomes                                                               |
| Product catalog   | 40 active pages across 6 categories, 0 governed public series and 10 catalog-series evidence records | Active records have registered migration-period or approved image files; drafts and unready series remain excluded | Replace legacy references with rights-approved exact-product views, then verify product and series relationships |
| Distributor / OEM | Dedicated service pages, builders and buyer workbooks                                                | Operational buyer preparation paths are published                                                                  | Review completed workbooks and qualified RFQs, not page count                                                    |

## RFQ And Delivery Evidence

- Production status checked: 2026-08-29
- Delivery mode: email
- Sales email configured: Yes
- Buyer confirmation configured: Yes
- Attachment delivery configured: Yes
- Provider acceptance last verified: 2026-07-26
- Sales inbox placement: Needs external confirmation
- Buyer inbox placement: Needs external confirmation
- Optional Supabase inquiry storage: Not configured; email capture remains the active delivery path

## Product Evidence

- Total product records: 43
- Active products with existing publication-eligible image files: 40
- Active products without publication-eligible image files: 0
- Active products whose structured source type is still `unknown`: 18
- Registered image assets: 46
- Search-eligible exact image assets: 0
- Legacy public reference image assets: 43
- Blocked image assets: 3
- Image assets with approved usage rights: 0
- Image assets with unknown source: 9
- Products with confirmed technical data status: 0
- Products with confirmed compatibility status: 0
- Products with confirmed OEM status: 0
- Governed product-series records: 0
- Governed series-to-product relationships: 0
- Company-catalog series evidence records: 10
- Catalog series still in evidence review: 9
- Catalog series blocked by source conflict: 1
- Series-component facts confirmed: 0
- Series-component data conflicts blocked: 14
- Series-component images approved: 0 of 276
- Compatibility relationships confirmed: 0
- Compatibility relationships retained as reference only: 4
- Field-level technical facts confirmed: 0
- Field-level technical facts awaiting confirmation: 15

Draft product pages remain excluded from static generation and sitemap publication until exact-product imagery is reviewed.

| SKU            | Product              | Category                   | Required evidence                                                   |
| -------------- | -------------------- | -------------------------- | ------------------------------------------------------------------- |
| AF-PLA-RC-0011 | Plasma Retaining Cap | Plasma Cutting Consumables | Reviewed own or legally usable supplier photo for the exact product |
| AF-ACC-WM-0015 | Welding Magnet       | Welding Accessories        | Reviewed own or legally usable supplier photo for the exact product |
| AF-TIG-TS-0036 | TIG Torch Switch     | TIG Torch Parts            | Reviewed own or legally usable supplier photo for the exact product |

## Content Coverage

| Product category           | Active products | Buyer guides | Applications |
| -------------------------- | --------------: | -----------: | -----------: |
| MIG/MAG Torch Parts        |              10 |            9 |            4 |
| TIG Torch Parts            |               8 |            7 |            2 |
| Plasma Cutting Consumables |               7 |            5 |            3 |
| Welding Consumables        |               4 |            2 |            2 |
| Welding Machines           |               2 |            1 |            1 |
| Welding Accessories        |               9 |            5 |            6 |

## Email Domain Authentication

- Public DNS checked: 2026-08-29
- DKIM public key: Present
- SPF for custom MAIL FROM: Present
- Custom MAIL FROM MX: Present
- DMARC: Confirmed missing or invalid

The public sender records support the configured Resend/Amazon SES path. DMARC remains a separate DNS control and must not be described as configured until the record is published and rechecked.

## External Confirmations

- Search Console sitemap submission: Needs external confirmation
- GA4 Realtime page views: Needs external confirmation
- GA4 RFQ conversion event: Needs external confirmation
- Resend credential rotation after external exposure: Needs external confirmation
- Supplier-image provenance and usage rights: Needs external confirmation

These items cannot be proven from public page content or repository files. Update the evidence JSON only after checking the relevant provider console, DNS record or mailbox.

## Highest-Impact Next Actions

1. Confirm that the exposed Resend credential has been rotated, then record only the confirmation state, never the key.
2. Add a monitoring-mode DMARC TXT record only after DNS-change approval, then rerun the email-domain audit.
3. Confirm one matching RFQ reference in the sales mailbox and one in the buyer-confirmation mailbox.
4. Work through `docs/product-image-asset-report.md`: confirm source and usage rights, then replace migration-period references with exact-product images.
5. Supply exact, legally usable product photos for the three blocked draft SKUs; do not publish their current placeholders as product evidence.
6. Complete the 15AK evidence intake, resolve the 602 page-identity conflict and work through the detailed 24KD/25AK/36KD/40KD/501D/602 component confirmation and image queues in `docs/product-series-component-evidence-report.md` before publishing another series.
7. Confirm material, dimensions, interfaces and fitment for active products from drawings, samples or approved supplier/company records.
8. Confirm GA4 Realtime and `rfq_submit_success` / lead events without recording buyer PII.
9. Export Search Console again on or after 2026-09-12; prioritize high-impression low-click existing URLs before adding overlapping content.
10. Configure Supabase only if searchable inquiry history, attachment retention or multi-user sales operations are needed.

## Update Workflow

1. Update `docs/operations/acquisition-production-evidence.json` after a real provider, mailbox, DNS or analytics check.
2. Update product CSV and reviewed product images through the existing SKU workflow.
3. Run `npm run products:report`, `npm run series:components:validate`, `npm run series:components:report`, `npm run series:report`, `npm run compatibility:report`, `npm run technical:report`, `npm run images:assets:report` and `npm run acquisition:report`.
4. Run the required SEO, lint, type, build, performance and security checks before deployment.
