# Site-Wide Upgrade Roadmap

This roadmap defines the next improvement sequence for ArcFort Weld. The goal is to make the
website more professional, easier to index, and stronger for overseas B2B RFQ conversion.

## Production Baseline - 2026-08-13

The production build currently generates 89 pages and includes 40 indexable products, six product
categories, six application pages and 16 buyer guides. Product search, category-specific RFQ
builders, the OEM project builder, canonical metadata, sitemap, robots, structured data and the
validated RFQ form are in place. The Search Console export dated 2026-08-12 is recorded in
`docs/seo/search-console-baseline-2026-08-12.md` and should be used as the measurement baseline.

The site is technically ready to acquire inquiries, but four evidence and operational tasks now
matter more than adding another general page:

1. Confirm that a controlled browser RFQ reaches the sales mailbox and that the buyer confirmation
   email arrives. Confirm that the Resend credential previously shared outside the deployment
   environment has been rotated.
2. Replace the three `needs_photo` draft products with reviewed own or legally usable supplier
   photos. Review material, dimensions, fitment and source evidence for the 40 active products.
3. Recheck Search Console after a comparable 28-day period. Improve pages with impressions and weak
   click-through rate before publishing overlapping guide content.
4. Measure qualified RFQs, form completion, email clicks and WhatsApp clicks without collecting
   buyer messages, contact details or file names in analytics.

The distributor and importer path now includes a guided mixed-product sourcing brief plus a
four-tab RFQ workbook for buyer profile, SKU lines, trial and repeat quantities, packing and
evidence review. Future changes should be driven by real builder, download and qualified-inquiry
activity rather than adding another overlapping distributor page.

## Phase 1 - Global Conversion Foundation

Status: completed and monitored.

- Group the header navigation into cleaner buyer paths.
- Add a site-wide B2B trust strip with product count, category count, port, OEM, MOQ and lead time.
- Strengthen the footer with an RFQ-focused closing section.
- Keep the sticky RFQ, WhatsApp and email contact bar.

## Phase 2 - Product Center and Category Pages

Status: completed for the current six-category structure; continue from search and RFQ evidence.

Improve the pages that Google and buyers use most:

- Add stronger category landing sections for MIG/MAG, TIG, plasma, consumables, machines and accessories.
- Add clearer product-grid ordering for the first 30 SKU batch.
- Add category-specific buyer checklists and compatibility notes.
- Add internal links between category pages, related products, RFQ and guide articles.
- Keep all unconfirmed dimensions and compatibility details marked as buyer-confirmed data.

## Phase 3 - Product Detail Pages

Status: core template completed; real product evidence is the remaining constraint.

Make each product page stronger for RFQ conversion:

- Add a clearer sticky or side RFQ panel on desktop.
- Highlight missing technical details in a cleaner buyer confirmation block.
- Add product image status handling and real-photo replacement priority.
- Add stronger related product groups.
- Add category-specific FAQ content where possible.
- Add RFQ links that pass the product name into the RFQ form.

## Phase 4 - Company Trust Pages

Status: core qualification pages completed; evidence-based media can be added when available.

Improve supplier qualification pages:

- About Us: make company positioning, product scope and buyer fit clearer.
- OEM Service: add OEM workflow, packaging options and artwork confirmation steps.
- Quality Control: add inspection flow and buyer-confirmed quality expectations.
- Shipping & Payment: add practical export planning details.
- Contact: make inquiry instructions more direct and easier to scan.

## Phase 5 - Content and SEO Expansion

Status: 16 buyer guides and six application pages are live; prioritize measured updates.

Scale organic search content without low-quality pages:

- Add buying guides for contact tips, ceramic cups, plasma electrodes and nozzles.
- Add RFQ preparation guides for distributors and OEM buyers.
- Add application-specific content for shipbuilding, pipeline, automotive, fabrication and repair.
- Add product comparison and selection articles only when the claims are safe and data-backed.

## Phase 6 - Real Data and Media

Status: in progress and now the highest-impact content task.

Replace placeholders with confirmed assets:

- Add real product photos for the first 30 SKU batch.
- Confirm material, size, thread, package, MOQ and lead time by product.
- Add authorized PDF catalogs.
- Add factory, warehouse, packaging and inspection photos if available.
- Do not publish certificates, customer cases or capacity claims unless real proof is provided.

## Phase 7 - RFQ Backend and Measurement

Status: technically configured; end-to-end mailbox delivery is not yet proven.

Finish conversion tracking:

- Configure Resend for real RFQ email delivery.
- Configure Supabase for inquiry storage and attachment records if needed.
- Add Google Search Console and sitemap submission.
- Add analytics or privacy-friendly conversion tracking.
- Monitor which categories and products bring RFQ traffic.
