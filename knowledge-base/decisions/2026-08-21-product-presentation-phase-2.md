# Product Presentation Phase 2 Decision

Date: 2026-08-21

## Objective

Present ArcFort Weld products as an industrial catalog that helps distributors and technical buyers
identify a product, review safe technical cues and start an RFQ without changing canonical product
data, URLs or verification status.

## Decisions

- Product cards are image-led and contain the product family context, product name, SKU, no more
  than two useful specification cues, one product link and one compact RFQ-list action.
- Product identity fields such as Product Name, SKU and Category are excluded from card and overview
  specification rows because they are already visible elsewhere.
- Low-signal values such as `TBD`, `unknown`, `To be confirmed` and generic request-based placeholders
  are filtered from prominent specification rows. Missing values remain available through one
  grouped technical-details disclosure when buyer input can resolve them.
- Product family labels fall back to a category-based public label when the source family duplicates
  the complete product title. This changes presentation only and does not change source data.
- The product-detail first screen prioritizes: reviewed product image, precise H1, short description,
  product family, SKU, supply context, Request a Quote, Add to RFQ and Contact Sales. Key
  specifications follow immediately after the actions.
- Product imagery is rendered only when the record is search-eligible and the referenced local asset
  exists. Missing or unreviewed images use a restrained labeled placeholder and do not create a false
  product representation.
- Compatibility and specification tables use simple definition-list rows for scanning and preserve
  all evidence and review language from the product record.
- Related-product grids use the same Product Card and Product Grid system as category, application,
  guide, product-center and homepage product listings.

## Preserved Contracts

- Existing product, category and canonical URL slugs.
- Existing product records, SKU values, verification statuses and source references.
- Product, BreadcrumbList, FAQ and page-level structured data generation.
- Sitemap, robots, internal links and static route generation.
- RFQ query context, RFQ list behavior, email and WhatsApp fallbacks.

## Verification

- Next.js production build generated 90 pages, including 40 active product detail routes.
- ESLint and TypeScript checks passed.
- Product validation, product image check, product readiness report and product search tests passed.
- SEO, internal-link, snippet-hygiene, RFQ, performance-budget and secret checks passed.
- Playwright checked representative MIG/MAG, TIG, plasma and welding-equipment product pages at 390
  and 1440 pixels with no horizontal overflow. Product images, H1 content and conversion actions were
  present, and Product Card RFQ interaction worked.

## Known Data Gaps

- AF-PLA-RC-0011 Plasma Retaining Cap needs a reviewed product image.
- AF-ACC-WM-0015 Welding Magnet needs a reviewed product image.
- AF-TIG-TS-0036 TIG Torch Switch needs a reviewed product image.
- Additional company-owned product angles, packaging images and confirmed drawings would improve
  buyer confidence.
- Reference-only or unverified compatibility data still requires factory confirmation, a drawing,
  a sample or a verified reference number before it can be presented as confirmed fitment.

## Next Recommended Product Stage

Build one complete series-level buying system, starting with the 15AK MIG/MAG torch and consumable
family only after its model matrix, drawings, fitment evidence and reviewed image set are available.
That stage should add a series overview, available-model table and compatibility workflow without
changing current published product URLs.
