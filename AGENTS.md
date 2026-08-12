# AGENTS.md

## Mission

Build and maintain ArcFort Weld as a credible, searchable, conversion-focused industrial B2B
website that generates qualified international RFQs for Renqiu Ailesen Welding Technology Co.,
Ltd.

Use this priority order when requirements compete:

1. Factual accuracy and buyer trust.
2. Qualified inquiry conversion.
3. Search visibility and useful content depth.
4. Mobile usability, accessibility, speed, and security.
5. Maintainable product data and repeatable publishing workflows.

Do not optimize for page count, visual novelty, or keyword volume at the expense of buyer value.
Every important change should help a buyer understand the offer, verify fit, or send a better RFQ.

## Confirmed Business Identity

Use these facts consistently. Prefer a central site configuration over duplicating them in page
components.

- Legal English name: Renqiu Ailesen Welding Technology Co., Ltd.
- Legal Chinese name: 任丘市埃勒森焊接科技有限公司
- Website brand: ArcFort Weld
- Website: https://www.arcfortweld.com
- Business email: arcfortweld@outlook.com
- WhatsApp: +86-18803076512
- Address: Renqiu City, Cangzhou, Hebei Province, China
- Main port: Tianjin Xingang Port / Tianjin Port, China
- Other ports: Qingdao Port or Ningbo Port may be discussed upon request.
- Preferred payment: T/T, with 30% deposit before production and 70% balance before shipment.
- L/C at sight: may be discussed for large orders; terms depend on order and cooperation history.
- MOQ: small trial orders are accepted for standard products. OEM MOQ depends on product and
  packaging requirements.
- Regular-order lead time: normally 7-20 working days after deposit confirmation.
- Sample-order lead time: normally 3-7 working days when materials are available.
- OEM/custom lead time: normally 20-35 working days depending on quantity, packaging, and schedule.
- OEM scope: logo printing, private-label packaging, carton design, and model customization based on
  buyer samples, drawings, photos, or technical requirements.

Do not introduce alternative company names, contact details, addresses, or commercial terms without
explicit confirmation. Do not describe the business as a certified manufacturer, factory owner, or
authorized distributor unless supporting evidence has been provided. "Industrial welding and
cutting supplier" is the safe default positioning.

## Market Positioning

The website serves international distributors, importers, wholesalers, welding equipment suppliers,
repair workshops, industrial users, and OEM buyers.

Core product scope:

- MIG/MAG torch parts and consumables
- TIG torch parts and consumables
- Plasma cutting consumables
- Welding consumables
- Welding machines and cutting machines
- Welding accessories and OEM welding products

Write in professional, natural B2B English. Be direct, specific, and practical. Avoid exaggerated
claims, consumer-style hype, empty superlatives, fake urgency, and generic text that could belong to
any supplier. Use industrial terminology accurately, including MIG/MAG, TIG, MMA, contact tip, tip
holder, gas lens, ceramic cup, nozzle, electrode, torch liner, diffuser, shield, and swirl ring.

## Evidence And Claims

Never invent or imply:

- Product specifications, dimensions, ratings, materials, OEM numbers, or confirmed compatibility
- Certifications, test reports, patents, awards, or regulatory approvals
- Prices, discounts, stock status, production capacity, export volume, or delivery guarantees
- Factory scale, equipment counts, employee counts, years of experience, or inspection statistics
- Customer names, testimonials, reviews, projects, partnerships, or sales territories

Use evidence in this order: confirmed company data, company-owned technical documents, reviewed
product samples or drawings, official supplier/catalog data with a recorded source, and
company-approved product photography. Record `source_type`, `source_reference`, verification status,
reviewer, and review date where the data model supports them.

For missing facts, use buyer-friendly wording such as "Available upon request", "Contact us for
details", "Can be confirmed by sample or drawing", `TBD`, `needs_review`, or `unknown`. Do not fill a
public page with repeated placeholders. Group unresolved values under "Technical details available
upon request" and tell the buyer what to send for confirmation.

## Product Data Standards

Keep one canonical structured product source that can later move to Sanity or Supabase. Do not place
independent product facts directly inside page components. Preserve stable SKU, category, and slug
identifiers when updating content.

Each product record should support:

- Identity: SKU, product name, category, category slug, and product slug
- Buyer summary: short description, full description, applications, and key features
- Technical data: material, size, thread, compatible brand/model, OEM number, and other relevant
  category-specific fields
- Commercial data: packaging, MOQ, lead time, customization, and sample availability
- Media: reviewed main image, gallery images, image source/status, and optional catalog PDF
- Governance: publication status, data status, compatibility status, OEM status, source, reviewer,
  and review date
- SEO: unique meta title, meta description, canonical route, image alt text, and structured data

Every published product page must include:

1. A precise H1 and concise B2B short description.
2. SKU and product category.
3. Reviewed product imagery or a clearly labeled non-indexable placeholder while still in draft.
4. Specification table containing only confirmed facts or carefully labeled request-based values.
5. Compatibility guidance that explains how fit should be confirmed.
6. Applications and buyer-relevant product features.
7. Packaging, MOQ, lead-time, and OEM guidance.
8. Product-specific FAQ content.
9. Related products and relevant category links.
10. A clear RFQ call-to-action with email and WhatsApp alternatives.
11. Product and BreadcrumbList structured data where valid.

Do not claim exact brand/model compatibility unless confirmed. Prefer: "Compatibility can be
confirmed by torch model, OEM reference, sample, drawing, or dimensional details." Separate general
reference models from confirmed fitment.

Products with `placeholder` or `needs_photo` image status must remain `draft`. An active product must
use a reviewed `own_photo` or legally usable `supplier_photo` that clearly depicts the listed product.
Do not scrape ecommerce photos, remove watermarks, conceal image provenance, or use a visually
similar product as proof of an exact model. Alt text must identify the product naturally without
keyword stuffing.

## Category, Application, And Guide Content

Every category page should include:

- Unique H1, SEO introduction, and buyer-oriented meta title/description
- Product grid driven by active product data
- Product range and common selection variables
- Buyer guide covering model, size, material, thread, compatibility, quantity, and documentation
- Applications, OEM/packing/MOQ guidance, FAQ, related categories, and RFQ CTA
- Internal links to useful products, applications, guides, contact, and RFQ pages
- BreadcrumbList and FAQ structured data where the visible content supports it

Application pages must explain the operating context, typical product families, selection risks,
maintenance or purchasing considerations, and the information needed for quotation. Do not pretend
that ArcFort Weld supplied a named project or customer.

Guide articles must answer a real purchasing, compatibility, maintenance, or sourcing question.
Avoid mass-producing thin AI articles. Each guide should have a distinct search intent, useful
technical structure, relevant internal links, and a practical next step. Update existing strong pages
before creating overlapping pages.

## Company And Trust Content

The About page should clearly distinguish the legal company from the ArcFort Weld website brand and
state the confirmed location, product scope, target buyers, OEM services, and export-oriented supply
role. Keep the same facts in the footer, Contact page, RFQ page, Organization schema, and social
profiles.

Trust sections should describe verifiable processes rather than unsupported adjectives:

- Incoming material or product checks, only when actually performed
- In-process, dimensional, appearance, packing, and pre-shipment checks, only as confirmed workflows
- Sample/drawing-based compatibility confirmation
- Export packing and customized packaging options
- Clear quotation, production, inspection, and shipment communication

Quality Control, OEM Service, and Shipping & Payment pages must state what buyers should provide,
what ArcFort Weld can confirm, and what varies by product or order. Do not display fake laboratory,
factory, team, certificate, shipment, or customer imagery. Label representative visuals accurately.

## Acquisition And Conversion Rules

The primary conversion is a qualified RFQ. Email and WhatsApp are secondary paths for buyers who do
not complete the form.

Every important landing, category, product, application, and guide page should:

- Explain what is supplied and for whom within the first viewport.
- Show a relevant product, product family, or operational image.
- Offer a visible `Request a Quote` action without overwhelming the page with competing buttons.
- Keep email and WhatsApp reachable within two interactions.
- Tell buyers what information improves quotation accuracy.
- Link to the next useful decision page instead of ending in a dead end.

Use intent-matched CTA copy. Product pages should request model, size, quantity, and compatibility
evidence. OEM pages should request drawings, samples, logo, packaging, and annual or trial quantity.
Distributor pages should request product range, destination market, quantity, and target models.

The RFQ form should request only information needed to qualify and quote: buyer identity, company,
email, WhatsApp, country, product/model, requirements, quantity, message, and optional files. Explain
accepted files, size limits, and privacy expectations. Preserve entered values on failure, show a
bounded timeout, provide email/WhatsApp fallback contacts, and never automatically resubmit.

Do not claim the RFQ channel works until a real browser submission reaches the configured sales
mailbox. Keep `/api/rfq/status` operational and report `email.ready`, buyer confirmation,
attachments, and optional storage separately. Preserve stable RFQ references and separate Resend
idempotency keys for sales and buyer emails. Never include buyer PII in idempotency keys, analytics,
URLs, logs, or public incident reports.

Do not use fake inquiry counters, stock counters, countdowns, customer logos, reviews, star ratings,
or "recent order" notifications. Measure real outcomes instead: qualified RFQs, RFQ completion rate,
email/WhatsApp clicks, organic landing pages, target-country traffic, and inquiry source.

## Visual, Mobile, And Accessibility Standards

Maintain a restrained industrial-blue, European/American B2B visual system. Product information and
buyer actions take priority over decoration. Use consistent spacing, typography, button hierarchy,
image treatment, borders, and iconography across all pages.

- Design mobile-first and verify common phone and desktop widths.
- Prevent horizontal overflow, clipped text, layout shifts, and overlapping sticky elements.
- Keep tap targets at least 44 by 44 CSS pixels where practical.
- Use readable body text, visible focus states, semantic headings, labels, keyboard navigation, and
  sufficient color contrast.
- Product images must be sharp, correctly oriented, consistently framed, and useful for inspection.
- Do not use decorative imagery as a substitute for product evidence.
- Keep the primary mobile CTA reachable without obscuring content or browser controls.
- Prefer fast static content and optimized responsive images; avoid animation that delays buyer tasks.

After layout or media changes, verify screenshots on mobile and desktop and inspect for overflow,
cropping, empty image states, CTA conflicts, and text wrapping.

## SEO Standards

Optimize for useful international buyer searches, not keyword density.

- Every indexable page needs one clear H1, unique title, useful meta description, canonical URL, and
  meaningful internal links.
- Product/category names in metadata must match visible page content.
- Keep route slugs stable, lowercase, concise, and descriptive. Add redirects when published routes
  must change.
- Prevent indexation of draft, placeholder-image, duplicate, filtered, internal search, and test pages.
- Keep `sitemap.xml` limited to canonical indexable URLs and keep `robots.txt` valid.
- Use Organization, WebSite, BreadcrumbList, Product, and FAQ structured data only when supported by
  matching visible content.
- Do not add Product `offers`, `review`, or `aggregateRating` without real public price/availability
  or review data on the same page.
- Do not create doorway pages, spun location pages, duplicated FAQs, hidden keywords, or pages whose
  only purpose is indexing.
- Preserve `data-nosnippet` on repetitive navigation, trust strips, footers, image labels, and card
  actions. Never apply it to the H1 or primary buyer content.

Use Search Console and analytics data to improve pages already receiving impressions. Prefer work in
this order: indexing errors, high-impression low-click pages, high-intent category/product gaps,
internal linking, content refreshes, then net-new informational content.

Analytics IDs, Search Console tokens, advertising pixels, and verification values must come from
environment variables. Track useful conversion events without recording buyer messages, file names,
email addresses, phone numbers, or other PII.

## Ethical Promotion And Lead Development

Promotion links must come from `data/promotion/campaigns.csv` and be regenerated with
`npm run promotion:links`. Campaign IDs and URLs must not contain buyer PII.

Prospect research may include company-level official website and public business contact routes.
Never present a prospect list as customers, partners, distributors, or endorsements. Do not automate
unsolicited bulk outreach. Manually review relevance, identify ArcFort Weld, use concise personalized
messages, provide a relevant reason for contact, and honor opt-out requests.

Prioritize businesses with evidence of welding, cutting, MRO, torch consumables, industrial supply,
or distributor activity. Track research, review, sent, reply, qualified, quoted, and outcome states
separately. Do not report outreach drafts as sent messages or report page traffic as qualified leads.

## Security, Privacy, And Reliability

- Never hardcode API keys, passwords, private tokens, database credentials, or email credentials.
- A credential exposed in chat, logs, source, or another external channel must be rotated at its
  provider even if the repository scan is clean.
- Keep secrets in deployment environment variables and document variable names without values.
- Validate RFQ input and uploads server-side, restrict file type/size, sanitize file names, and avoid
  logging buyer-submitted content.
- Preserve Content Security Policy and document the buyer value and required directives before adding
  a third-party browser origin.
- Keep Vercel BotID Basic protection on `POST /api/rfq`. Do not enable paid BotID or firewall features
  without explicit billing approval.
- Preserve RFQ email and optional Supabase storage idempotency. Duplicate references must not
  overwrite an existing inquiry or reset its workflow state.
- Keep production health monitoring read-only. Only a separate incident job may have issue-write
  permission, and incidents must never contain secrets or buyer data.

## Engineering And Data Architecture

Follow the established Next.js App Router, TypeScript, Tailwind CSS, and project component patterns.
Read relevant files before editing. Keep changes scoped, preserve existing behavior, and do not remove
features or user work without explicit approval.

Centralize reusable business information, product records, category content, SEO generation,
structured data, RFQ configuration, and tracking helpers. Keep content types explicit and ready for
migration so mock data can later move to Sanity or Supabase without rewriting page contracts.

Prefer server components and static generation for indexable content. Add client-side code only for
real interaction. Keep dependencies light, avoid unnecessary third-party scripts, and do not raise a
performance budget without documenting measured buyer value.

## SKU Import Rules

Use the simple SKU workflow for routine batches:

1. Maintain `data/import/products-simple.csv`.
2. Run `npm run products:simple:preview`.
3. Review generated values and unresolved fields.
4. Run `npm run products:simple:generate` to create `data/import/products.csv`.
5. Run `npm run products:validate` and `npm run products:check-images`.
6. Run `npm run products:simple:import` only after review.
7. Run `npm run products:report` before publication.

The workflow may generate identifiers, copy, paths, and review placeholders, but generated values are
not confirmed technical facts.

Allowed automatic generation:

- SKU, name, category, category slug, and product slug
- Short description, description, application copy, meta title, and meta description
- Main image and gallery image paths
- Unconfirmed placeholders for material, size, thread, compatible brand/model, package, MOQ, and lead
  time
- `oem_number` as `TBD` only
- Publication, data, image, compatibility, and OEM review statuses

Never auto-generate as confirmed:

- OEM number or exact compatible model
- Certification or compliance status
- Price, stock, or exact technical rating
- Product dimensions, material grade, performance, or fitment not supported by evidence

## Required Quality Checks

Run checks appropriate to the change and report any command that cannot run.

For product/SKU changes:

- `npm run products:validate`
- `npm run products:check-images`
- `npm run products:report`

For important content, route, or SEO changes:

- `npm run seo:audit`
- `npm run seo:snippets`
- Verify metadata, canonical URLs, structured data, sitemap inclusion, and internal links

For frontend, shared component, script, or site-image changes:

- `npm run lint`
- Type checks when available
- `npm run build`
- `npm run performance:budget`
- Mobile and desktop visual verification

Before commit or deployment:

- Review the diff and exclude unrelated user files.
- Run `npm run security:secrets`.
- Confirm no draft or unreviewed product was made indexable.
- Summarize modified files, remaining placeholders, missing evidence, and unresolved operational risks.

After deployment:

- Verify important live pages, canonical URLs, sitemap, robots, and key assets.
- Check `/api/rfq/status` and complete one controlled real-browser delivery test without automatic
  retry.
- Run `npm run security:audit:live`.
- Run `npm run indexing:submit -- --dry-run`; submit IndexNow only after the deployed sitemap and key
  file are reachable.
- Confirm analytics and Search Console without exposing verification values.

## Definition Of Done

A task is complete only when the requested experience works, relevant checks pass, factual claims are
supported, mobile and desktop states are usable, and the result is reported clearly. A deployed RFQ
feature is not a proven lead channel until a real inquiry reaches the configured mailbox. A published
product is not production-ready until its data and image status meet the rules above.

After every task, report:

- Files changed
- Checks run and results
- Missing product or company evidence
- Remaining placeholders or draft items
- Deployment and live-verification status, when relevant
- The next highest-impact action for qualified inquiry growth
