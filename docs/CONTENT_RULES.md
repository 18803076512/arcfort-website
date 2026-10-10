# ArcFort Weld Content Rules

This document owns business claims, product data presentation, English/Chinese market messaging, SEO
content and conversion copy. Before substantial content work, read `AGENTS.md`,
`docs/CODEX_GOAL.md`, relevant knowledge-base evidence and decisions, then the applicable design and
QA rules. Factual accuracy is more important than fluent copy.

Visual treatment belongs to `docs/DESIGN_SYSTEM.md`; check selection belongs to
`docs/QA_CHECKLIST.md`. Content must project canonical evidence rather than create a parallel source
of truth in page copy.

## Audience And Purpose

Primary audiences:

- China-market distributors, regional suppliers and industrial buyers
- International distributors, importers and wholesalers
- Welding equipment suppliers and repair workshops
- Industrial users, purchasing teams and maintenance teams
- OEM/private-label buyers

Primary conversion: a qualified RFQ containing enough product, compatibility, quantity, packaging
and destination information for a useful commercial response.

Secondary conversions: email, WhatsApp, catalog/download engagement and distributor/OEM project
preparation.

## Confirmed Company Language

Use these facts consistently and preferably through the central site configuration:

- Renqiu Ailesen Welding Technology Co., Ltd.
- 任丘市埃勒森焊接科技有限公司
- ArcFort Weld
- https://www.arcfortweld.com
- arcfortweld@outlook.com
- +86-18803076512
- Renqiu City, Cangzhou, Hebei Province, China
- Tianjin Xingang Port / Tianjin Port, China

Position the business as an industrial welding and cutting supplier unless stronger evidence has been
provided. Distinguish the legal company name from the ArcFort Weld brand on About, Contact, RFQ,
footer and Organization structured data.

## Voice And Terminology

Write professional, technical, clear, restrained and natural B2B English. Chinese content should be
equally professional and written for the China market, not mechanically translated from English.

Use precise terminology where applicable:

- MIG/MAG, TIG, MMA and plasma cutting
- Contact tip, tip holder, gas nozzle, diffuser and torch liner
- Collet, collet body, gas lens, ceramic cup and back cap
- Electrode, nozzle, shield, retaining cap and swirl ring
- Welding cable, cable connector, electrode holder and ground clamp

Avoid empty or unsupported phrases such as:

- Best quality
- World leading
- No.1 manufacturer
- 100% guaranteed
- Premium quality
- Top manufacturer

Prefer factual buyer language:

- OEM packaging is available.
- Multiple sizes are available.
- Compatibility can be confirmed by model, drawing or sample.
- Technical specifications are available upon request.
- Small trial orders are available for selected standard products.

Do not repeat the same keyword unnaturally in names, labels, headings or alt text. A title such as
`MIG MIG MIG Contact Tip` is always an error.

## Evidence Model

Every exact technical value should support:

| Field                 | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| `field_value`         | The displayed or stored value                                 |
| `source`              | Exact document, drawing, sample, record or approved reference |
| `source_level`        | Evidence authority from A to D                                |
| `verification_status` | Current confidence/governance state                           |
| `last_verified_date`  | ISO date of the last real review                              |

Source levels:

- Level A: confirmed ArcFort Weld factory/company data.
- Level B: official manufacturer catalogs or manuals.
- Level C: applicable IEC, ISO or AWS standards.
- Level D: competitor, distributor or marketplace references.

Level D may inform research questions or terminology but must not independently confirm an exact
technical specification. Record source references precisely enough for another reviewer to repeat
the check.

Verification statuses:

- `CONFIRMED`: supported by approved ArcFort Weld/company evidence and permitted as a confirmed
  ArcFort Weld value.
- `OEM_REFERENCE`: an official reference value retained as a reference, not automatically an ArcFort
  Weld specification.
- `STANDARD_REFERENCE`: information from an applicable standard, with scope stated.
- `NEEDS_FACTORY_CONFIRMATION`: plausible or requested information that still needs evidence.
- `DATA_CONFLICT`: two or more credible sources disagree; do not publish one as confirmed.

Never invent or imply:

- Dimensions, threads, materials, material grades, weights or unverified product geometry
- OEM/reference numbers or exact compatibility
- Packaging quantities or product-specific MOQ/lead time without evidence
- Electrical parameters, duty cycle, output, performance or exact technical ratings
- Certification, test-report or compliance status
- Price, stock, discounts or delivery guarantees
- Production capacity, factory size, equipment count, staff count or export volume
- Customers, cases, reviews, awards, partners or distributor coverage

If sources conflict, retain both references internally, mark `DATA_CONFLICT`, keep the public claim
unconfirmed and request company/factory review.

### Field-Level Technical Evidence

Use `lib/data/product-technical-facts.ts` for governed exact-value references. Each record must retain
the product slug, field, displayed value, unit when applicable, source field, evidence basis, exact
source reference, source level, verification status, reviewer and last verified date. Page adapters
may project those records into specification tables, but page components must not contain competing
technical values.

Company-catalog values can remain publicly useful when they are visibly labeled as catalog
references and the buyer is told what must be confirmed. Catalog evidence alone does not promote an
ArcFort Weld SKU to `CONFIRMED`. Confirmation requires Level A evidence tied to the exact SKU through
a factory record, controlled drawing, approved sample, verified reference number, confirmed
dimensions or measurement record.

Keep original references and confirmation results in separate columns. Do not overwrite the source
reference when a factory value is returned. A confirmed intake row requires a value, evidence type,
evidence reference, reviewer and ISO review date. If evidence disagrees, use `DATA_CONFLICT` and keep
that fact out of public projections until reviewed.

Company-owned image intake must request the main product, connection or functional details,
dimensional reference and actual packaging separately. Approval requires a source owner, usage-rights
record, original file reference, reviewer, review date and existing local asset. A current supplier
image is not automatically company-owned evidence.

### Product Image Evidence

`data/assets/product-image-assets.csv` is the canonical registry for every product main and gallery
image. Product CSV paths identify which files a product requests; the asset registry decides whether
each file may be displayed or included in search metadata. Page components must not bypass this
registry.

Use publication states precisely:

- `search_eligible`: exact product, approved usage basis, known owner/source, reviewer and date.
- `legacy_reference`: pre-existing public family-level reference retained during migration; rights or
  exact identity remain unresolved.
- `display_only`: allowed in a bounded buyer-facing context but excluded from search metadata.
- `blocked`: unavailable to public product presentation and search metadata.

Do not call a `legacy_reference` exact, owned, approved or confirmed. Do not promote an asset merely
because the file exists, looks similar, appears in a supplier archive or was cropped from a catalog.
Store source-owner, usage-rights and review evidence in the registry; never expose
`notes_internal`. Generate, validate and report the registry before publishing image changes.

## Missing Data

Use concise buyer-friendly states:

- `Available upon request`
- `Contact us for details`
- `Can be confirmed by sample or drawing`
- `TBD`
- `needs_review`
- `unknown`

Do not expose long tables filled with placeholders. Group unresolved data under `Technical details
available upon request` and explain exactly what the buyer should send: product model, torch model,
reference number, drawing, clear sample photos, dimensions, quantity and intended application.

## Product Record Requirements

Keep one canonical structured product source. Every record should support:

- Identity: SKU, product name, series/family, category, category slug and product slug
- Buyer summary: short description, overview, applications and key features
- Technical data: material, size, thread, compatible brand/model, OEM number and category fields
- Commercial data: packaging, MOQ, lead time, customization and sample availability
- Media: main image, gallery, alt text, source, usage rights, status and optional PDF
- Governance: publication, data, image, compatibility and OEM status; source; reviewer; review date
- SEO: unique meta title, meta description, canonical route and structured-data eligibility

Do not place separate product facts directly in page components. Preserve established SKU and routes.

### Product Publication Gate

- `placeholder` and `needs_photo` products remain `draft` and must not enter sitemap/static product
  generation.
- An active product requires an existing `own_photo` or legally usable `supplier_photo` of the listed
  product.
- Every active main/gallery image must have a matching non-blocked asset-registry row. New
  search-eligible images require approved rights and an exact-product match.
- Exact geometry or model evidence must not be inferred from a family-level image.
- Public specs must be confirmed or clearly presented as selection/confirmation guidance.
- Product JSON-LD must match visible content and omit unsupported offers, ratings and reviews.

### Product Page Structure

Every published product page should include:

1. One precise H1 and concise B2B description.
2. Series/family, SKU and category.
3. Reviewed product gallery.
4. Short list of buyer-relevant, evidence-safe selection cues.
5. Technical specification table.
6. Available models only when supported by a governed source.
7. Compatibility guidance with confidence clearly separated.
8. Applications and practical features.
9. Packaging, MOQ, lead time and OEM guidance.
10. Downloads where relevant.
11. Product-specific FAQ.
12. Related products and category links.
13. Intent-matched RFQ CTA plus contact fallback.
14. Product and BreadcrumbList structured data where valid.

### Compatibility

Never infer fit because two products look alike. Compatibility must be supported by company/factory
confirmation, drawing, sample, verified reference number or confirmed dimensions.

Present separate states:

- Confirmed Compatibility
- Reference Compatibility
- Needs Confirmation

Store governed relationships in the compatibility registry rather than product-series copy or page
components. Every relationship must identify its subject, target, relationship type, public status,
evidence basis, source, verification status, confirmation requirements, reviewer and review date.
Internal notes must never be rendered publicly.

Catalog grouping supports `Reference Compatibility`, not `Confirmed Compatibility`. Confirmation
requires `CONFIRMED` verification plus factory confirmation, a controlled drawing, an approved
sample, a verified reference number or confirmed dimensions. `DATA_CONFLICT` relationships must be
excluded from public projections until reviewed.

Recommended wording: `Compatibility can be confirmed by torch model, OEM reference, sample, drawing
or dimensional details.` A brand or model reference narrows review; it does not automatically prove
fit.

### Product Series Publication

Keep company-catalog family evidence separate from published product-series pages. A catalog series
record must retain the exact document pages, component names visible in that source, evidence level,
verification status, image status, review date and missing evidence.

- `published` requires canonical products, reviewed exact-product images and governed relationships.
- `evidence_review` can support an RFQ series choice but must not generate an indexable series page.
- `blocked` must retain the unresolved `DATA_CONFLICT` and remain private.
- Series grouping is not universal compatibility; final fit still needs company confirmation,
  drawing, sample, verified reference number or confirmed dimensions.
- Exact technical values belong in canonical product records, not duplicated series copy.

### Series Component Evidence

Use `data/evidence/product-series-component-facts.csv` when a catalog family is being decomposed into
component and variant candidates. Preserve each catalog value at field level with source reference,
source level, verification status, reviewer and date. Store external primary-reference comparisons
alongside the catalog value only when a real conflict exists; do not silently choose the more
convenient value.

Keep three states separate:

- A catalog `fact` records what the reviewed source says.
- A confirmation `candidate` records what the company must verify before creating or mapping a SKU.
- An image `request` records the exact view and evidence needed; it is not a public asset approval.

`DATA_CONFLICT` requires the comparison source, comparison value, conflict note and a `blocked`
lifecycle. `CONFIRMED` requires a variant-scoped Level A fact and matching confirmed intake with a
factory record, controlled drawing, approved sample, verified reference, confirmed dimensions or a
measurement/packaging record. Never promote a requested or received image into the public image
registry until ownership, usage rights, exact-product identity, reviewer, date and the local file are
present.

When two tables, diagrams or pages in the same company document disagree, use `company_catalog` as
the comparison source and preserve both locations and values. An internal Level A source conflict is
still blocked; company ownership of the document does not make either value automatically correct.

For liquid- or water-cooled torch evidence, keep coolant supply, coolant return, shielding gas,
power, control and wire-path interfaces separate. A visible hose color or connector shape does not
identify its function. Require a factory connection diagram, controlled drawing or verified marking
before assigning a media role or compatibility relationship.

## Category Pages

Every category page should include:

- Unique H1, SEO introduction, title and meta description
- Active product grid driven by canonical data
- Product range and common selection variables
- Buyer guide covering model, size, material, thread, compatibility, quantity and documentation
- Applications and operating context
- OEM/ODM, packaging and MOQ guidance
- FAQ based on visible useful content
- Related categories, products, applications and guides
- RFQ CTA that states what to provide
- BreadcrumbList and FAQ structured data where supported

Do not pad categories with generic paragraphs. Content should help the buyer identify the required
part or prepare a more accurate RFQ.

## Homepage

The homepage is a brand and product-system overview. It should communicate:

- What ArcFort Weld supplies
- Who it serves
- Major product systems
- Relevant industry/solution paths
- Verifiable sourcing, quality and customization processes
- A clear route to products, technical resources and RFQ

Do not turn the homepage into a policy archive. Keep detailed port, payment, packaging, MOQ and lead
time explanations on relevant inner pages. Avoid demo, sample, template or unfinished wording.

## Company And Trust Pages

Use `data/evidence/company-claims.csv` as the governed claim register and `lib/content/site.ts` as its
current runtime projection. An approved public claim requires Level A evidence, `CONFIRMED` status,
source reference, reviewer and review date. Keep blocked topics out of public copy rather than
softening them into an unsupported implication.

Use `data/assets/company-media-assets.csv` for site-level media. Only a reviewed company-owned photo
with approved rights and a matching subject may be described as company evidence. Generated,
representative or legacy-reference visuals may support layout only and must not imply a real factory,
process, shipment, customer or exact product.

The About page should explain the legal company, ArcFort Weld brand, confirmed location, product
scope, target buyers, OEM services and China/international supply role. Do not claim ownership,
certification, capacity or history beyond evidence.

Quality Control, OEM / ODM and Shipping & Payment pages should state:

- What the buyer should provide
- What ArcFort Weld can review or confirm
- What varies by product/order
- What evidence or approval controls the next step

Describe real processes rather than unsupported adjectives. Do not use invented factory, laboratory,
shipment, team, certificate or customer imagery as company evidence.

## Application Pages And Guides

Application pages should explain the operating context, typical product families, selection risks,
maintenance/purchasing considerations and RFQ information needed. Never imply supply to a named
project or customer without evidence.

Guides should answer a real purchasing, compatibility, maintenance or sourcing question. Each guide
needs a distinct intent, useful technical structure, relevant internal links and practical next step.
Improve pages already receiving impressions before creating overlapping articles. Do not mass
produce thin AI content.

## China And International Content

Plan for `/zh/` and `/en/` to share product identities and confirmed technical data while allowing
market-specific messaging.

China-market priorities:

- 全国供货
- 经销商合作
- 产品体系
- 技术支持
- OEM/ODM
- 工业客户支持

International priorities:

- Distributor sourcing
- OEM/private label
- Export packing and shipping preparation
- Compatibility evidence
- RFQ quality

Do not machine-translate positioning. Do not claim nationwide branches, dealer network, service
centers, market share or sales coverage. Allowed phrasing includes Nationwide Supply, 全国供货,
Distributor Cooperation, 经销商合作, Technical Support, 技术支持, OEM / ODM and 工业客户支持.

## SEO Rules

Every indexable page requires:

- One clear H1 matching the buyer intent
- Unique, natural SEO title and meta description
- Canonical URL
- Logical H2/H3 hierarchy
- Relevant internal links to the next decision step
- Appropriate structured data supported by visible content

Preserve existing URLs, redirects, metadata, structured data, breadcrumbs, internal links, sitemap
and robots during redesign. Do not change slugs for appearance. Keep draft, duplicate, filtered,
internal-search, placeholder and test pages out of the index.

Use Organization, WebSite, BreadcrumbList, Product and FAQ schema only where appropriate. Do not add
Product `offers`, `review` or `aggregateRating` without real public price/availability or review data
shown on the page. Do not create doorway pages, location spam, duplicated FAQs, hidden keywords or
spun pages.

Use Search Console in this priority order:

1. Indexing and canonical errors
2. High-impression, low-click existing pages
3. High-intent category/product gaps
4. Internal linking improvements
5. Content refreshes
6. New informational pages

## RFQ And Conversion Copy

The primary action is a qualified RFQ; email and WhatsApp are fallback paths. Keep one visible main
action per commercial region and avoid stacking repeated CTA boxes.

Intent-specific prompts:

- Product: model, size, quantity and compatibility evidence
- OEM / ODM: sample/drawing, logo, packaging, trial and annual quantity
- Distributor: product range, destination market, target models, trial and repeat quantity
- Machine/equipment: power source/model, technical requirements, accessories and destination

The RFQ form should request only information necessary to qualify and quote: buyer identity, company,
email, WhatsApp, country, product/model, requirements, quantity, message and optional files. Explain
accepted files, size limits and privacy. Preserve entered values on failure, use a bounded timeout,
provide email/WhatsApp fallback and never auto-resubmit.

Do not call email delivery proven until a controlled browser submission reaches the sales mailbox.
Report provider readiness, sales delivery, buyer confirmation, attachment handling and optional
storage separately.

## Ethical Acquisition

Do not use fake counters, urgency, customer logos, reviews, ratings, orders or stock notices. Measure
qualified RFQs, form completion, email/WhatsApp clicks, organic landing pages, target-market traffic
and inquiry source.

Prospect research may use public company-level websites and contact routes. Never present prospects
as customers or partners. Do not automate unsolicited bulk outreach. Manually review relevance,
identify ArcFort Weld, give a specific reason for contact and honor opt-out requests.

Never place buyer PII, inquiry text, file names, email addresses or phone numbers in analytics,
campaign IDs, URLs, logs, idempotency keys or public reports.
