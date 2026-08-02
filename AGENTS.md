# AGENTS.md

## Project Context

This repository is an industrial B2B website for Renqiu Ailesen Welding Technology Co., Ltd.

The website focuses on welding machines, cutting machines, welding torch consumables, TIG torch
parts, MIG/MAG torch parts, plasma cutting consumables, OEM welding accessories, and export inquiry
generation.

## Content Rules

1. Do not invent product specifications, certifications, prices, stock status, factory capacity, or
   customer cases.
2. If a field is missing, use a clear placeholder such as "Available upon request", "Contact us for
   details", "TBD", "needs_review", or "unknown" and report it after the task.
3. All product pages must be written in professional B2B English.
4. Use industrial terminology accurately, including MIG/MAG, TIG, MMA, plasma cutting, contact tip,
   tip holder, gas lens, ceramic cup, nozzle, electrode, torch liner, and diffuser.
5. Every product page should include title, short description, specification table, compatibility,
   applications, product features, packaging/MOQ/lead time, FAQ, and RFQ call-to-action.
6. Every category page should include SEO intro text, product grid, buyer guide section, FAQ, and
   internal links to related categories.
7. Add SEO metadata and JSON-LD structured data where appropriate.
8. Keep the design consistent with an industrial blue B2B style.
9. Do not hardcode real API keys, email passwords, database passwords, private tokens, or credentials.
10. After changes, run lint, build, and type checks when available.
11. Summarize all modified files and any missing data after each task.
12. Do not invent OEM numbers, compatible models, certifications, prices, exact technical ratings,
    unverified product dimensions, or other unconfirmed specifications.
13. Uncertain SKU data must be marked as "needs_review", "unknown", "Available upon request",
    "Contact us for details", or "TBD" as appropriate.

## Workflow Rules

1. Read relevant files before modifying code.
2. Complete one clearly scoped task at a time.
3. Do not remove existing functionality unless the task explicitly requires it.
4. Keep all pages responsive for desktop and mobile.
5. Keep all pages suitable for overseas B2B industrial inquiries.
6. Ask for a plan before implementing large changes.
7. Run `npm run products:validate` before importing SKU CSV data.
8. Run `npm run products:check-images` before importing or publishing product images.
9. Run `npm run products:image-tasks` when product images are missing or before requesting product photos.
10. Run `npm run products:report` before publishing SKU batches so missing images and placeholder
    fields are visible.
11. Run `npm run seo:audit` before publishing important product, category, application or guide
    updates. Fix blocking duplicate-route and broken-reference errors before deployment.
12. For RFQ changes, check `/api/rfq/status` after deployment and report whether `email.ready` is
    true. If it is false, clearly state that automated email delivery is not production-ready yet.
13. Do not treat the RFQ form as a complete lead channel until a real test inquiry reaches the
    configured sales email.
14. Do not hardcode Google Analytics IDs, Search Console verification tokens or marketing pixels;
    use environment variables.
15. After publishing important page, SKU, category or guide updates, run
    `npm run indexing:submit -- --dry-run` and submit through IndexNow only after the deployed
    sitemap and key file are reachable.
16. Do not enable Google Product rich result JSON-LD unless real public `offers`, `review`, or
    `aggregateRating` data is available on the same product page. Never add fake prices, stock
    status, ratings or reviews to satisfy structured data tools.
17. After deployment, run `npm run security:audit:live`. Do not weaken the Content Security Policy
    or add third-party browser origins without documenting the service, buyer value and required
    CSP directives.
18. Keep Vercel BotID Basic protection on `POST /api/rfq`. Do not enable paid BotID Deep Analysis or
    paid Vercel Firewall rate limiting without explicit billing approval. Test protected RFQ delivery
    from a real browser because command-line requests do not carry the BotID browser challenge.
19. Keep products with `placeholder` or `needs_photo` image status as `draft`. An active product must
    have a reviewed `own_photo` or `supplier_photo` that clearly supports the published product type.
20. After frontend layout, shared component, script or site-image changes, run `npm run build` and
    `npm run performance:budget`. Do not raise a performance budget without documenting the measured
    buyer value and the reason the additional transfer cost is necessary.
21. Run `npm run security:secrets` before committing environment, deployment, documentation or
    integration changes. A credential exposed in chat, logs or any external channel must be rotated
    at its provider even when the repository scan is clean.
22. Keep the scheduled Production health incident workflow enabled. The health job must remain
    read-only; grant `issues: write` only to the separate incident job, and never include credentials
    or buyer-submitted RFQ data in incident titles, bodies or comments.
23. Keep RFQ client requests bounded by a visible timeout and preserve buyer-entered values on
    failure. Never automatically retry a submitted RFQ because the first request may already have
    reached the server or email provider.
24. Preserve RFQ email idempotency. An unchanged manual retry must reuse the browser submission
    token and stable RFQ reference, while sales and buyer emails must use separate Resend
    idempotency keys. Do not include buyer PII in an idempotency key.
25. Preserve optional RFQ storage idempotency. Supabase attachment retries must reuse stable object
    paths, and database writes must ignore duplicate RFQ references without overwriting an existing
    inquiry or resetting its workflow status.

## SKU Import Rules

For bulk SKU work, prefer the simple SKU workflow first:

- Maintain `data/import/products-simple.csv`.
- Run `npm run products:simple:preview` before generating the full CSV.
- Run `npm run products:simple:generate` to create `data/import/products.csv`.
- Run `npm run products:simple:import` only after reviewing the generated CSV.
- The simple workflow may generate placeholders and review statuses, but it must not invent
  confirmed technical facts.

Allowed automatic generation:

- `sku`
- `name`
- `category`
- `slug`
- `short_description`
- `description`
- `main_image` path
- `material` as an unconfirmed placeholder
- `size` as an unconfirmed placeholder
- `thread` as an unconfirmed placeholder
- `compatible_brand` as an unconfirmed placeholder
- `compatible_model` as an unconfirmed placeholder
- `oem_number` as `TBD` only
- `package` as an unconfirmed placeholder
- `moq` as an unconfirmed placeholder
- `lead_time` as an unconfirmed placeholder
- `application`
- `meta_title`
- `meta_description`
- `status`
- `data_status`
- `image_status`
- `compatibility_status`
- `oem_status`
- `category_slug`
- `gallery_images` path

Never auto-generate:

- OEM number
- Confirmed compatible model
- Certification
- Price
- Exact technical rating
- Unverified product dimensions

## Future Data Sources

Product and category data may later come from Supabase or Sanity CMS. Until then, keep mock data
structured, explicit, and easy to replace.
