# ArcFort Weld Repository Rules

These are the permanent execution rules for this repository. They apply to every future Codex task
unless the user explicitly overrides a rule for a clearly stated task. Record any override and its
scope in the final report and in `docs/CHANGELOG_AI.md` when the task is major.

## Rule Priority

Read these files before planning any major task. Within the repository, apply them in this order:

1. `AGENTS.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/CONTENT_RULES.md`
4. `docs/QA_CHECKLIST.md`
5. The current task prompt

The current task defines the requested outcome. The repository rules define how that outcome is
implemented safely and consistently. A short prompt does not silently cancel these rules. When a
direct conflict remains, stop and report it unless the user has explicitly scoped an override.

## Mission

Build and maintain ArcFort Weld as a credible, searchable and conversion-focused industrial brand
system for Renqiu Ailesen Welding Technology Co., Ltd. The website must generate qualified RFQs,
support national supply and distributor cooperation in China, and retain international B2B export
capability.

Use this decision order:

1. Factual accuracy and buyer trust.
2. Qualified inquiry conversion.
3. Search visibility and useful technical content.
4. Mobile usability, accessibility, speed, reliability and security.
5. Maintainable product data and repeatable publishing workflows.

Do not optimize for page count, keyword volume, visual novelty or feature count at the expense of
buyer value. Every important change should help a buyer understand the offer, assess fit, navigate a
product system or submit a more useful inquiry.

## Confirmed Identity

Use the central site configuration wherever possible. Do not create competing copies of these facts.

- Legal English name: Renqiu Ailesen Welding Technology Co., Ltd.
- Legal Chinese name: 任丘市埃勒森焊接科技有限公司
- Brand: ArcFort Weld
- Website: https://www.arcfortweld.com
- Business email: arcfortweld@outlook.com
- WhatsApp: +86-18803076512
- Address: Renqiu City, Cangzhou, Hebei Province, China
- Main port: Tianjin Xingang Port / Tianjin Port, China
- Other ports: Qingdao Port or Ningbo Port may be discussed upon request.
- Preferred payment: T/T, 30% deposit before production and 70% balance before shipment.
- L/C at sight: may be discussed for large orders; final terms depend on the order and cooperation
  history.
- MOQ: small trial orders are accepted for selected standard products. OEM MOQ depends on product and
  packaging requirements.
- Regular lead time: normally 7-20 working days after deposit confirmation.
- Sample lead time: normally 3-7 working days when materials are available.
- OEM/custom lead time: normally 20-35 working days depending on quantity, packaging and schedule.
- OEM scope: logo printing, private-label packaging, carton design and model customization based on
  buyer samples, drawings, photos or technical requirements.

Do not introduce alternative identities or commercial terms without explicit confirmation. Do not
describe the business as a certified manufacturer, factory owner or authorized distributor without
supporting evidence. "Industrial welding and cutting supplier" is the safe default positioning.

## Brand Positioning

ArcFort Weld is being developed as a modern nationwide welding and cutting industrial brand for the
China market while retaining international B2B export capability.

The website must feel like:

- A serious industrial brand
- A professional engineering company
- A scalable national supplier
- A modern manufacturing enterprise
- An international B2B supplier

It must not feel like a generic export site, Alibaba listing, cheap template, AI-generated website,
SaaS startup or flashy consumer brand. Use a premium industrial, modern engineering, technical,
clean, structured, confident and international visual language.

Core product scope:

- MIG/MAG torch parts and consumables
- TIG torch parts and consumables
- Plasma cutting consumables
- Welding consumables
- Welding machines and cutting machines
- Welding accessories and OEM welding products

## Mandatory Workflow

### 1. Inspect

Before changing code or content:

- Read these repository rules and the relevant implementation files.
- Identify existing components and design tokens.
- Identify product/content data sources and governance states.
- Identify routing, metadata, structured data, sitemap and internal-link dependencies.
- Identify RFQ, contact, analytics, security and deployment dependencies.
- Inspect `git status` and preserve unrelated user changes.

Never rewrite blindly.

### 2. Plan

Before a major change, state:

- Objective
- Components affected
- Files affected
- Data, SEO, RFQ and compatibility risks
- Implementation and verification sequence

Make the plan clear before implementation. A plan is not a substitute for implementation.

### 3. Implement In Small Batches

Use a controlled unit such as one global system, page family, component family or product series.
Good examples include Header + Mega Menu, Homepage, Product Card + Product Grid, or one torch series.
Do not redesign the full site in one uncontrolled change.

Prefer reusable components. Evaluate extraction when the same UI pattern appears more than twice.
Expected reusable families include Container, Section, SectionHeading, Button, Badge, ProductCard,
CategoryCard, SolutionCard, FeatureCard, TechnicalTable, ProductGallery, Breadcrumb, CTA, MegaMenu,
RFQPanel and DownloadCard. Reuse established project patterns before adding a new abstraction.

### 4. Validate

Run all checks applicable to the change as defined in `docs/QA_CHECKLIST.md`. At minimum consider:

- Build, lint, typecheck and focused tests
- Routing and redirects
- Desktop, laptop, tablet and mobile behavior
- Metadata, canonical URLs, structured data, internal links, sitemap and robots
- Accessibility and keyboard behavior
- RFQ context, validation, uploads and delivery state
- Product data, publication and image governance
- Performance and secret scanning

### 5. Report

Every completed task report must include:

- Files changed
- Components created, changed or removed
- Data changed
- Visual changes
- SEO impact
- Checks run and results
- Missing evidence, unresolved issues and remaining drafts/placeholders
- Deployment and live-verification status when relevant
- One recommended next step with the highest buyer or acquisition value

### 6. Record And Stop

After every major task, append a dated entry to `docs/CHANGELOG_AI.md` with the task, files,
components, data, SEO impact, known issues and next recommended step.

Stop after the requested phase. Do not automatically continue into the next development phase unless
the user explicitly requests it.

## Evidence And Product Data

Never invent or imply exact product specifications, dimensions, ratings, material grades, OEM
numbers, confirmed compatibility, certifications, prices, stock, capacity, export volume, customers,
reviews, projects, awards, market share, branch offices, distributor counts, service centers or
delivery guarantees.

Use evidence in this order:

1. Level A: ArcFort Weld confirmed factory/company data.
2. Level B: official manufacturer catalogs or manuals.
3. Level C: applicable IEC, ISO or AWS standards.
4. Level D: competitor, distributor or marketplace references.

Level D must never be the sole source for an exact technical specification. If sources conflict, do
not choose one automatically. Mark the field `DATA_CONFLICT` and request confirmation.

Technical values should support `field_value`, `source`, `source_level`, `verification_status` and
`last_verified_date`. Use these verification statuses:

- `CONFIRMED`
- `OEM_REFERENCE`
- `STANDARD_REFERENCE`
- `NEEDS_FACTORY_CONFIRMATION`
- `DATA_CONFLICT`

Only `CONFIRMED` values may be presented as confirmed ArcFort Weld specifications. Do not infer
compatibility from appearance. Separate Confirmed Compatibility, Reference Compatibility and Needs
Confirmation. Support compatibility with company confirmation, a drawing, a sample, a verified
reference number or confirmed dimensions.

For missing facts, use buyer-friendly wording such as "Available upon request", "Contact us for
details", "Can be confirmed by sample or drawing", `TBD`, `needs_review` or `unknown`. Group public
unknowns under "Technical details available upon request" instead of repeating placeholders.

Keep one canonical structured product source ready for later migration to Sanity or Supabase. Do not
hardcode independent product facts in page components. Preserve stable SKU, category and slug
identifiers.

Products with `placeholder` or `needs_photo` image status must remain `draft`. An active product must
have a reviewed `own_photo` or legally usable `supplier_photo` that depicts the listed product. Do not
scrape ecommerce images, remove watermarks, conceal provenance, alter product geometry or use a
similar-looking item as proof of an exact model.

Keep every canonical main and gallery image in `data/assets/product-image-assets.csv`; generate the
runtime registry with `npm run images:assets:generate`. Each asset must retain product/SKU assignment,
role, public path, alt text, source, ownership, usage-rights status, content-match status, publication
status, reviewer and review date. `legacy_reference` is a migration state for an already published
family-level image, not evidence of approved rights or exact-product identity. Only an asset with an
approved usage basis, exact-product match, reviewer and date may become `search_eligible`. Keep
`notes_internal` private. Run `npm run images:assets:validate` and `npm run images:assets:report` after
any canonical product-image, image-path or image-status change.

Keep files that exist under `public/images/products/` but are not assigned to a canonical product in
`data/evidence/local-product-image-triage.csv`. A visual-family label is an internal sorting aid, not
proof of exact identity or compatibility. Run `npm run images:triage:validate` after adding, removing
or assigning a local product-image file. Move a candidate into the canonical asset registry only
after source owner, website-use rights, exact-product evidence, reviewer and review date are real.

### Product Series Evidence

Keep catalog-family evidence in `lib/data/product-series-evidence.ts` and public series records in
`lib/data/product-series.ts`. A catalog page may establish that a named sourcing family and component
group exist, but it does not confirm universal fit or every product-to-series relationship.

Only a `published` evidence record with reviewed exact-product imagery, canonical product records and
governed relationships may generate a public series page. Records in `evidence_review` may appear as
clearly bounded catalog choices in an RFQ, but must not create indexable series pages. Run
`npm run series:validate` and `npm run series:report` after any series evidence, category-family or
public series change.

For catalog families under detailed review, keep field-level source facts in
`data/evidence/product-series-component-facts.csv`, factory/SKU intake in the corresponding
`data/intake/*-series-confirmation.csv`, and image requests in the corresponding
`data/intake/*-image-intake.csv`. Generate the runtime facts with
`npm run series:components:generate`. A candidate is not a product SKU, a catalog dimension is not a
confirmed ArcFort Weld specification, and an image request is not an approved public asset.

`DATA_CONFLICT` component facts must remain `blocked`. A component can move to `ready_for_sku` only
after its exact identity and technical evidence are resolved; `mapped_to_sku` requires an existing
canonical SKU. A `CONFIRMED` component fact must be variant-scoped, Level A and backed by a matching
confirmed intake row with qualifying evidence. Run `npm run series:components:validate` and
`npm run series:components:report` after changing component facts, confirmation intake or image
intake.

Keep product relationships in `lib/data/compatibility-relationships.ts`; do not duplicate them inside
series or page components. Catalog grouping alone remains `reference_only`. A relationship can become
`confirmed` only when its verification status is `CONFIRMED` and its recorded evidence includes
factory confirmation, a controlled drawing, an approved sample, a verified reference number or
confirmed dimensions. Run `npm run compatibility:validate` and `npm run compatibility:report` after
every relationship change.

Keep exact field-level reference values in `lib/data/product-technical-facts.ts` when a product has a
governed technical-fact record. Do not copy a different value into the product CSV or a component to
bypass that registry. A company-catalog value may be presented only as a labeled reference while its
status is `NEEDS_FACTORY_CONFIRMATION`; it must not be described as a confirmed ArcFort Weld SKU
specification.

Use `data/intake/15ak-technical-confirmation.csv` to retain the original catalog reference separately
from factory-confirmed values. A row may move to `CONFIRMED` only when the exact SKU has a qualifying
factory record, controlled drawing, approved sample, verified reference or measurement record plus a
reviewer and date. Use `data/intake/15ak-image-intake.csv` for company-owned image collection; an
image may move to `approved` only after ownership, usage rights, source file, reviewer and date are
recorded. Run `npm run technical:validate` and `npm run technical:report` after either file or the
technical registry changes.

See `docs/CONTENT_RULES.md` for page requirements, terminology, SEO, market-specific content and
source handling.

## Visual And Experience Governance

Follow `docs/DESIGN_SYSTEM.md`. Preserve a restrained industrial-blue system with disciplined use of
engineering orange for primary actions only. Prioritize strong whitespace, product photography,
clear hierarchy, clean grids, restrained shadows and consistent typography.

Avoid excessive badges, pills, boxes, gradients, round cards, decorative icons, animation and
microcopy. Do not use glassmorphism, neon, glow, particles, heavy parallax or constant motion. If
hierarchy and spacing communicate the information, do not add another visual container.

The homepage is a brand page, not a database dump. Product imagery should dominate product cards.
The header must keep the primary navigation focused on Products, Solutions, Industries, OEM / ODM,
Distributors, Resources and About, with Contact and Request Quote as actions. Do not put MOQ, ports,
payment, lead time or product counts in primary navigation.

Design specifically for desktop, laptop, tablet and mobile. Mobile must not be compressed desktop.
Maintain semantic headings, visible focus, keyboard navigation, form labels, sufficient contrast,
readable technical tables and tap targets of approximately 44 by 44 CSS pixels where practical.

## China And International Architecture

Prepare for separate `/zh/` and `/en/` experiences sharing the product database, technical data and
design system. Do not create these routes casually or change existing URLs without a migration plan.

- China messaging may emphasize 全国供货, 经销商合作, 产品体系, 技术支持, OEM/ODM and 工业客户支持.
- International messaging may emphasize distributor supply, OEM, export, compatibility, RFQ and
  shipping.

Do not machine-translate market-specific positioning. "Nationwide Supply", 全国供货, "Distributor
Cooperation", 经销商合作, "Technical Support", 技术支持, "OEM / ODM" and 工业客户支持 are allowed.
Do not claim a dealer network until real dealer evidence exists.

## SEO And Conversion Protection

Do not damage existing SEO during visual work. Preserve URLs, canonicals, metadata, structured data,
internal links, breadcrumbs, sitemap, robots and indexed buyer content. Do not change routes only for
appearance.

Every indexable page needs one clear H1, a unique title, useful meta description, canonical URL,
logical H2/H3 structure and meaningful internal links. Keep draft, placeholder-image, duplicate,
filter, internal-search and test pages out of the index. Use Organization, WebSite, BreadcrumbList,
Product and FAQ structured data only when visible content supports it. Do not add Product `offers`,
`review` or `aggregateRating` without matching real public data.

The primary conversion is a qualified RFQ. Protect the RFQ form, product-to-RFQ context, email
routing, uploads, validation and fallback contacts. Never claim the RFQ channel works until a real
browser submission reaches the configured sales mailbox. Never include buyer PII in analytics,
idempotency keys, URLs, logs or public reports.

## Security And Reliability

- Never hardcode API keys, passwords, private tokens, database credentials or email credentials.
- Rotate any credential exposed in chat, logs, source or another external channel.
- Use deployment environment variables and document names without values.
- Validate RFQ input and files server-side; restrict type/size, sanitize file names and avoid logging
  buyer content.
- Preserve Content Security Policy and document the buyer value before adding browser origins.
- Preserve Vercel BotID Basic on `POST /api/rfq`; do not enable paid protection without billing
  approval.
- Preserve RFQ email/storage idempotency and stable inquiry references.
- Keep production health monitoring read-only and free of secrets or buyer data.

## Engineering And SKU Workflow

Follow the established Next.js App Router, TypeScript and Tailwind CSS patterns. Prefer server
components and static generation for indexable content. Add client code only for real interaction.
Keep dependencies light and do not increase performance budgets without measured buyer value.

Routine SKU workflow:

1. Maintain `data/import/products-simple.csv`.
2. Run `npm run products:simple:preview`.
3. Review generated values and unresolved fields.
4. Run `npm run products:simple:generate`.
5. Run `npm run products:validate` and `npm run products:check-images`.
6. Run `npm run images:assets:sync`, review appended evidence rows and validate the canonical image
   asset registry.
7. Run `npm run products:simple:import` only after review.
8. Run `npm run products:report` and `npm run images:assets:report` before publication.

The workflow may generate identifiers, routing, descriptive copy, image paths and unconfirmed
placeholders. It must never auto-generate a confirmed OEM number, exact model compatibility,
certification, price, stock, technical rating, dimension, material grade, performance or fitment.

## Prohibited Actions

Do not:

- Rewrite the entire website without a staged plan.
- Invent business, product, technical, compatibility or commercial data.
- Remove useful indexed content or SEO infrastructure for cosmetic reasons.
- Change public URLs without a strong reason, redirect plan and SEO verification.
- Add fake testimonials, customer logos, certificates, production statistics or distributor coverage.
- Add a random design library or heavy visual dependency without measurable business value.
- Create inconsistent page-specific styles when a shared pattern should be used.
- Continue into the next implementation phase without the user's instruction.

## Self-Critique And Definition Of Done

Before completing design work, ask:

- Does this look like a serious national industrial brand and international engineering supplier?
- Does it look deliberately designed rather than AI-generated?
- Is hierarchy obvious within three seconds?
- Is there enough whitespace and are product images prominent?
- Are there too many cards, badges, CTAs or words?
- Would an industrial buyer trust the company and continue browsing?

Refine any unsatisfactory answer before reporting completion.

A task is complete only when the requested experience works, applicable checks pass, claims are
supported, mobile and desktop states are usable, the change log is updated for major work, and the
result is reported clearly. A deployed RFQ feature is not a proven lead channel until a real inquiry
reaches the configured mailbox. A product is not publication-ready until its data and image evidence
meet these rules.

## Final Principle

When choosing between more features and better presentation, choose better presentation unless the
feature has clear business value. When choosing between more text and clearer visual hierarchy,
choose hierarchy. When choosing between inventing information and leaving it for confirmation, leave
it for confirmation. When choosing between short-term novelty and long-term industrial consistency,
choose consistency.

Build ArcFort Weld as one scalable industrial brand system, not a collection of independently
designed pages.
