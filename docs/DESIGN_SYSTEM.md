# ArcFort Weld Design System

This document owns ArcFort Weld visual, interaction and responsive standards. Before substantial UI
work, read `AGENTS.md`, `docs/CODEX_GOAL.md`, relevant knowledge-base evidence and decisions, then
the applicable content and QA rules. Use this system for all new UI and bring existing UI toward it
in controlled page or component batches. Do not trigger an uncontrolled full-site redesign merely
because an older component differs.

Business claims, product facts, compatibility and SEO copy remain governed by
`docs/CONTENT_RULES.md`; completion evidence remains governed by `docs/QA_CHECKLIST.md`. A visual
mockup cannot create or upgrade a factual claim, image-rights state or publication status.

## Design Intent

The interface should communicate a premium industrial brand, modern engineering discipline,
technical competence, operational stability and international B2B readiness. It should not resemble
a marketplace listing, low-cost export template, SaaS dashboard or consumer campaign.

Direction: premium industrial brand, modern engineering, clean, professional, technical, structured
and international. Avoid generic export templates, Alibaba-like presentation, AI-looking layouts,
excessive cards or badges, excessive gradients, glass effects and unnecessary animation. Prefer real
approved imagery, strong whitespace, clear typography, professional industrial composition and
technical-data readability.

The visual test is simple: a buyer should understand the product system, company role and next action
within three seconds, without being asked to process decorative noise.

## Color Tokens

Use semantic tokens rather than scattering literal colors through page components. These values are
the target palette for future consolidation of the implementation.

| Token                    | Value     | Use                                                   |
| ------------------------ | --------- | ----------------------------------------------------- |
| `--color-brand-950`      | `#0B1F33` | Primary dark surfaces, footer, high-emphasis headings |
| `--color-brand-900`      | `#102A43` | Header and dark section alternatives                  |
| `--color-brand-800`      | `#163A5F` | Strong brand surfaces and selected states             |
| `--color-brand-700`      | `#1E5E96` | Links, technical accents and interactive states       |
| `--color-brand-600`      | `#2774AE` | Secondary actions and chart/data emphasis             |
| `--color-surface`        | `#FFFFFF` | Main surface and product-image field                  |
| `--color-surface-subtle` | `#F6F8FA` | Alternating section background                        |
| `--color-surface-muted`  | `#EEF2F5` | Technical groups and quiet backgrounds                |
| `--color-text`           | `#101820` | Primary text                                          |
| `--color-text-muted`     | `#334155` | Supporting copy                                       |
| `--color-text-subtle`    | `#64748B` | Captions and secondary metadata                       |
| `--color-border`         | `#DDE3E8` | Dividers and restrained component borders             |
| `--color-action`         | `#B84B0C` | Accessible engineering-orange primary CTA             |
| `--color-action-hover`   | `#9A3D08` | Primary CTA hover/active state                        |

Engineering orange is a scarce action color. Do not use it as a large background theme, repeated
badge color or decorative accent. Status colors must have text/icon redundancy and accessible
contrast.

Avoid one-note blue pages by balancing dark brand surfaces with white product fields, neutral gray
sections, real materials and the limited CTA accent. Do not add purple, neon, beige-heavy or
brown-heavy themes.

## Typography

Use one global font stack that supports both English and Chinese. Prefer the existing project font
pipeline; do not add a remote font solely for novelty. Recommended fallback stack:

```css
font-family: Inter, "Noto Sans SC", "Microsoft YaHei", Arial, sans-serif;
```

Use the following roles. Values are target ranges, not permission to create per-page variants.

| Role           | Desktop target      | Mobile target  | Guidance                                |
| -------------- | ------------------- | -------------- | --------------------------------------- |
| Display        | 56-64px / 1.05-1.12 | 38-44px / 1.1  | Rare brand or major campaign heading    |
| H1             | 44-56px / 1.08-1.15 | 34-40px / 1.12 | One per page, immediate subject clarity |
| H2             | 32-40px / 1.15-1.22 | 28-32px / 1.2  | Major page sections                     |
| H3             | 22-28px / 1.25      | 20-24px / 1.3  | Component or content group heading      |
| Body Large     | 18-20px / 1.6       | 17-18px / 1.55 | Hero and section introductions          |
| Body           | 16-18px / 1.65      | 16px / 1.6     | Main reading content                    |
| Technical Data | 14-16px / 1.45      | 14-16px / 1.45 | Specs, model and SKU values             |
| Caption        | 13-14px / 1.45      | 13-14px / 1.45 | Supporting metadata only                |
| Button         | 14-16px / 1         | 15-16px / 1    | Clear action labels                     |

Rules:

- Use strong H1 presence without oversized marketing typography inside compact tools.
- Keep body line length near 60-75 characters where practical.
- Do not use font size based on viewport width.
- Letter spacing is `0`; avoid negative tracking.
- Use weight and scale sparingly. Do not bold whole paragraphs.
- Technical numbers, models and SKUs must align and scan easily; use tabular numerals where useful.
- Chinese and English versions should feel equal in hierarchy rather than mechanically identical in
  line breaks.

## Spacing And Layout

Use a consistent 4px-based spacing scale:

`4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120`

Do not repeatedly introduce arbitrary gaps. Suggested use:

- Inline/icon gaps: 8-12px
- Component padding: 16-32px
- Grid gaps: 24-32px
- Section spacing: 80-120px desktop, 56-80px tablet, 48-64px mobile
- Hero content width: approximately 560-720px depending on language
- Reading column: approximately 680-780px
- Main container: approximately 1200-1320px with responsive side padding

Pages should breathe. Use full-width section bands with constrained inner containers; do not make
every section a floating card. Avoid cards inside cards.

## Shape, Border And Shadow

- Default radius: 4-8px.
- Use larger radius only for a specific established media treatment, never as a universal style.
- Use `#DDE3E8` borders to separate data or repeated items when spacing alone is insufficient.
- Shadows should be subtle and rare: product hover, menus and dialogs are valid cases.
- Avoid thick decorative borders, glass effects, glowing outlines and floating section frames.

## Buttons And Links

Button hierarchy:

1. Primary: engineering-orange filled button for the main commercial action.
2. Secondary: industrial-blue filled or outlined button for a meaningful alternative.
3. Tertiary: text link with directional icon for navigation or learning.

Rules:

- Use one dominant primary CTA per viewport region.
- Keep labels specific: `Request a Quote`, `Add to RFQ`, `View Product`, `Download Catalog`.
- Use familiar icons for icon actions and provide tooltips for unfamiliar icons.
- Minimum practical target is 44 by 44 CSS pixels.
- Preserve visible focus, hover, active, disabled, loading, success and error states.
- Do not place three or more competing buttons on a product card.

## Core Components

Use and evolve these reusable families:

- `Container`: responsive max-width and side padding.
- `Section`: vertical rhythm and optional semantic background.
- `SectionHeading`: eyebrow only when useful, H2 and concise support text.
- `Button`: primary, secondary, tertiary and icon variants.
- `Badge`: reserved for meaningful status or family context, not decoration.
- `ProductCard`: image-led catalog entry.
- `CategoryCard`: product-system entry with clear range and destination.
- `SolutionCard`: buyer problem, scope and next step.
- `FeatureCard`: one verifiable operational capability.
- `TechnicalTable`: scan-friendly key/value data with mobile behavior.
- `ProductGallery`: main, detail and evidence images without geometry alteration.
- `Breadcrumb`: compact hierarchy with structured-data parity.
- `CTA`: one intent-matched action and limited fallback contact.
- `MegaMenu`: grouped product/solution/resource navigation.
- `RFQPanel`: product context, qualification prompts and submission action.
- `DownloadCard`: document purpose, format and buyer use.

If a pattern occurs more than twice, inspect whether an existing component can absorb it before
creating another page-specific version.

### Current Implementation Map

- `app/globals.css`: semantic color variables, responsive section rhythm, display/H2/H3/body,
  technical-data and caption roles, focus behavior and button variants.
- `tailwind.config.ts`: matching `arc.*` colors, site/reading widths, header height, restrained
  radii and shadows.
- `components/ui/Container.tsx`, `Section.tsx`, `SectionHeading.tsx` and `ButtonLink.tsx`: shared
  layout and action primitives.
- `components/navigation/ProductMegaMenu.tsx` and `MobileNavigation.tsx`: process-led desktop and
  mobile product navigation using the same route data.
- `components/home/HomeHero.tsx`, `ProductSystemCard.tsx` and `HomeInquiryCta.tsx`: the Phase 1
  homepage brand, catalog-entry and qualified-inquiry patterns.
- `app/products/page.tsx`: the Phase 2 Product Center sequence: finder, product systems, published
  catalog, RFQ preparation and sourcing FAQ.
- `components/content/CategoryPageTemplate.tsx`: the Phase 2 category sequence: product range,
  evidence-based parts and selection, buyer guide, applications, FAQ and related categories.
- `components/content/ProductDetailTemplate.tsx` and `ProductOverview.tsx`: the Phase 2 product
  hierarchy from image and identity through specifications, delivery, applications, FAQ and RFQ.
- `components/content/ProductGallery.tsx` and `ProductGalleryViewer.tsx`: server-governed image
  selection with client-side thumbnail switching only when multiple display-eligible assets exist.
- `components/content/TechnicalTable.tsx`: one key/value table contract shared by specifications
  and compatibility information.
- `components/content/RfqCta.tsx`: one commercial action with direct email and WhatsApp fallbacks;
  do not add port, payment or repeated policy cards back into the CTA.

Do not duplicate these primitives in a page. Extend the shared implementation only when a new state
has a clear reusable purpose.

## Header And Navigation

Primary information architecture:

- Products
- Solutions
- Industries
- OEM / ODM
- Distributors
- Resources
- About

Actions:

- Contact
- Request Quote

Do not put MOQ, port, payment, lead time, category count or product count in primary navigation. The
desktop mega menu must be scannable and keyboard accessible. Mobile navigation must be a deliberate
compact hierarchy, with no clipped groups or nested interaction traps.

## Homepage Blueprint

The homepage is a brand and decision page, not a database dump. Preferred order:

1. Hero
2. Product Systems
3. Featured Products
4. Industry Solutions
5. Why ArcFort Weld
6. Manufacturing & Quality
7. OEM / ODM
8. Distributor Cooperation
9. Applications
10. Technical Resources
11. Final CTA

Detailed payment, port, MOQ and shipping policies belong on relevant inner pages. Do not repeat every
trust statement in every section.

### Hero

Maximum composition:

- One eyebrow when necessary
- One headline
- One short supporting paragraph
- Two CTAs
- One strong, relevant visual

Do not load the hero with product counts, category counts, MOQ, payment, port, shipping or multiple
badges. Product/place/brand evidence should be visible in the first viewport, with a hint of the next
section on common desktop and mobile screens.

## Product Catalog Patterns

### Product Center

Use this decision order:

1. Product finder
2. Product systems
3. Published product catalog
4. RFQ preparation
5. FAQ and one final RFQ

Do not place category shortcuts, duplicate category cards, trade-policy cards and service cards
between the finder and the actual product catalog. Link to supporting buyer pages from one quiet
resource row.

### Category Page

Use five primary page paths: Products, Parts & Selection, Buyer Guide, Applications and FAQ &
Related. Preserve useful category copy and evidence in server-rendered HTML, but collapse long
company-catalog family matrices behind an explicit `Company Catalog Reference` disclosure.
Catalog families organize sourcing; they never prove universal compatibility.

### Product Card

The product image should occupy approximately 65-75% of the card. Default content:

- Product name
- Series or family
- One or two confirmed or clearly labeled selection cues
- `View Product` link

`Add to RFQ` may appear on hover or as a secondary compact action if touch devices have an equivalent
path. Avoid repeated MIG/TIG labels, multiple badges, long descriptions, technical tables and three
buttons.

### Product Detail

Above the fold:

- Left: product gallery
- Right: product name, series, model/SKU, short technical summary, key specifications, Request Quote
  and Contact Sales

Below the fold:

1. Overview
2. Technical Specifications
3. Available Models
4. Compatibility
5. Applications
6. Packaging
7. OEM / ODM
8. Downloads
9. FAQ
10. Related Products
11. RFQ

Technical tables must be easy to scan. On small screens, use stacked key/value rows or controlled
horizontal scrolling with a visible affordance; never clip values.

## Industry Solution Patterns

### Applications Center

Use this decision order:

1. One representative industrial hero with a visible representative-image label
2. Six image-led industry solution paths
3. A short application-to-RFQ preparation sequence
4. One final RFQ action

Industry cards should use governed related-product imagery. Prefer a different eligible product
image for adjacent cards when the data supports it. Do not use unverified customer, factory or
project photography to make an industry page appear more established.

### Application Detail

Use this buyer path:

1. Application context and one related product reference
2. Operating environment
3. Relevant product systems
4. Selection considerations and evidence requirements
5. Application-specific RFQ checklist
6. Related product records
7. FAQ and one final RFQ

Application guidance narrows a product family but never proves technical fit. Compatibility must
still be reviewed from the installed model, current part, drawing, sample, assembly photos or
confirmed dimensions. Present product-reference images as product evidence, not as proof of an
ArcFort Weld project in that industry.

## Commercial Solution Patterns

Use one shared sticky section navigation for long commercial pages. Keep it directly below the
global Header, horizontally scrollable on mobile and limited to five useful decision points.

### OEM / ODM

Use this buyer path: OEM scope, product families, approval process, RFQ Builder, project files,
supporting decisions and FAQ. Keep the base-product reference separate from logo, artwork, packing
and model-customization requirements. A representative product image must explicitly state that it
is not proof of an exact SKU or production facility.

### Distributor Supply

Use this buyer path: product range, sourcing brief, direct inquiry, program support, commercial
basis, repeat-order process, resources and FAQ. The guided Builder and embedded RFQ form have
different roles: the Builder organizes the commercial brief; the form sends contact details and
attachments. Do not claim territory, exclusivity, distributor counts or market coverage.

### Quality Coordination

Trust comes from traceable buyer evidence and order records rather than unsupported factory or
inspection claims. Show the approval workflow, product-family mismatch risks, buyer inputs,
supplier confirmations and available evidence. Keep inspection scope, method, timing and record
availability order-specific.

### Shipping & Payment

Separate confirmed company policy from order-specific freight, insurance, Incoterms, documents and
shipment dates. Present lead times by order type, then connect product approval, payment, packing
and dispatch in one workflow. Never imply fixed freight or guaranteed delivery.

## Company, Resource And Inquiry Patterns

### About

Lead with the legal company name and state the relationship between Renqiu Ailesen Welding
Technology Co., Ltd. and the ArcFort Weld website brand. Use this buyer path: company identity,
product systems, buyer programs, inquiry-to-order basis, evidence boundaries, supporting resources,
FAQ and RFQ. Company facts may be presented as a compact technical record; product-specific claims
must remain outside that record.

### Buyer Guides

Treat the guide index as an editorial library rather than a grid of promotional cards. Group
articles by buyer intent: identification and compatibility, product selection, and RFQ/equipment/OEM
preparation. Each library row needs a title, concise decision-oriented summary, review date and one
reading action. Do not use keyword tags as decoration when the group heading already communicates
the topic.

### Technical Buyer Guide Detail

Use one continuous technical-document pattern for guide detail pages:

1. A restrained hero with one H1, a concise decision statement, review dates and two actions at
   most.
2. A conditional sticky section navigation containing only sections that exist on the page.
3. An optional component or decision reference table when the guide needs assembly-level context.
4. A continuous numbered article with a compact sticky desktop contents list and a collapsible
   mobile contents control.
5. An optional evidence checklist and specialist buyer tool when they materially improve the RFQ.
6. A three-step download, complete and upload workflow for any worksheet or workbook.
7. Related categories and products before related guides, then FAQ and the final RFQ action.

Guide sections should read as a technical publication, not a stack of promotional cards. Keep long
copy in a readable text measure, use borders and spacing to separate steps, and reserve white cards
for the main article surface or a genuinely interactive tool. Reference tables must become labeled
mobile records instead of compressed desktop columns. Preserve visible evidence boundaries and do
not let a buyer guide imply confirmed product fit, dimensions, ratings or certification.

### Downloads

Separate public catalogs/reference PDFs from working RFQ files. Use the shared `DownloadCard` row
with one file-type marker, one description, one evidence note and one download action. Product-
specific document requests belong in a separate RFQ path; do not make unavailable documents look
downloadable.

### Contact And RFQ

Contact must show verified direct channels and then one embedded RFQ form. RFQ must make the form
the dominant task, with a concise evidence checklist and direct email/WhatsApp fallbacks. Do not
repeat full payment, MOQ, shipping and quality sections on either page; link to the dedicated
commercial pages instead. Preserve form prefill, selected-product context, attachment validation,
delivery status, timeout behavior and failure fallbacks.

## Images

Prioritize real, evidence-based product and company images.

Desired product set:

- Main view
- 45-degree view
- Thread detail
- Hole/orifice detail
- Surface/material detail
- Dimension image sourced from approved data
- Package image
- Bulk image

Desired company set when real evidence exists:

- Factory or operating site
- Production
- Warehouse
- Inspection
- Packing
- Shipment

Do not invent company scenes and present them as evidence. Do not alter product thread, holes,
dimensions, shape or connections. Keep products sharp, correctly oriented, consistently framed and
large enough to inspect. Use responsive `next/image` behavior and WebP/AVIF where appropriate.

Product-gallery captions must reflect the governed asset state. Use “reviewed product image” only
for an exact-product, search-eligible asset. Use “product-family reference image” for a family-level
legacy reference and keep it visually subordinate to the product title and RFQ action. Never let a
generic caption imply that an unverified image proves the exact SKU.

## Responsive Standards

Design and verify at representative widths:

- Mobile: 360px and 390px
- Tablet: 768px and 1024px
- Laptop: 1280px
- Desktop: 1440px or wider

Review Header, Mega Menu, Hero, product grid, gallery, technical tables, RFQ and footer. Prevent
horizontal overflow, clipped words, layout shift, sticky CTA overlap and browser-control conflicts.
Mobile spacing, content order and CTA placement must be designed explicitly.

## Motion

Allowed:

- Gentle entrance
- Image reveal
- Button hover
- Navigation transition
- Product hover
- Subtle fade-up

Avoid 3D rotation, particles, heavy parallax, glow, flash, constant motion and animation that delays
a buyer task. Respect `prefers-reduced-motion`.

## Accessibility And Performance

- Preserve semantic headings and one H1 per page.
- Maintain keyboard access, visible focus, form labels and link/button distinction.
- Use meaningful alt text without keyword stuffing.
- Maintain sufficient contrast in default, hover, focus, disabled and error states.
- Define stable dimensions/aspect ratios for media, cards and fixed-format controls.
- Avoid heavy UI libraries added only for decoration.
- Keep fonts, images, JavaScript and animation within project budgets.

## Visual Completion Review

Before completion, ask:

- Is the main subject and action clear in three seconds?
- Does this feel like a serious industrial brand rather than a template?
- Is whitespace doing enough work, or have boxes replaced hierarchy?
- Are product images prominent and technically useful?
- Are there too many cards, pills, badges, icons, CTAs or paragraphs?
- Does mobile have deliberate content order and spacing?
- Would a distributor or industrial buyer continue browsing?

Refine any weak answer before declaring the design complete.
