# ArcFort Weld Codex Goal Mode

Evidence baseline: 2026-08-30. Production observations referenced here were last verified on
2026-08-29 unless a later date is recorded in the relevant operations evidence.

## Purpose And Authority

This document is the strategic north star for long-term Codex work on ArcFort Weld. It keeps future
tasks connected to one industrial data and acquisition system instead of treating the website as a
collection of isolated pages.

Operational rules remain authoritative in this order:

1. `AGENTS.md`
2. `docs/CODEX_GOAL.md` for long-term direction and phase priorities
3. Relevant, non-superseded records in `knowledge-base/decisions/`
4. `docs/DESIGN_SYSTEM.md` for visual and interaction decisions
5. `docs/CONTENT_RULES.md` for claims, data presentation and SEO copy
6. `docs/QA_CHECKLIST.md` for applicable completion evidence
7. The current task prompt

This file records the destination, current baseline, priorities and phase gates. It does not relax
the evidence, security, SEO, RFQ or approval controls in those files.

## Confirmed Identity

- Legal company: Renqiu Ailesen Welding Technology Co., Ltd.
- Chinese company name: 任丘市埃勒森焊接科技有限公司
- Brand: ArcFort Weld
- Website: https://www.arcfortweld.com
- Business email: arcfortweld@outlook.com
- WhatsApp: +86-18803076512
- Location: Renqiu City, Cangzhou, Hebei Province, China
- Main port: Tianjin Xingang Port / Tianjin Port, China

Use `lib/content/site.ts` as the central runtime source for confirmed public company information.
Do not introduce a competing copy of these facts in page components or product records.

## North Star

Build ArcFort Weld into a modern, professional and data-driven welding and cutting industrial brand
with nationwide China-market capability and international B2B export capability.

The long-term operating system must connect:

- Product, technical and compatibility databases
- Governed product and company media libraries
- Website, product catalogs and technical resources
- SEO measurement and publishing controls
- Distributor and OEM / ODM support
- RFQ intake, qualification and sales follow-up
- A durable business knowledge base and decision record

The website is one frontend of this system. Structured, source-aware business and product data must
become the long-term source of truth.

## Business And Product Scope

ArcFort Weld supports welding machines, cutting machines, MIG/MAG, TIG, MMA and plasma cutting
products, torch parts, plasma cutting consumables, welding consumables, welding accessories and
evidence-backed OEM / ODM work.

Priority product systems are:

- MIG/MAG: 15AK, 24KD, 25AK, 36KD, 40KD, 501D, 602 and other verified families
- TIG: torches, ceramic cups, gas lenses, collets, collet bodies, back caps and consumables
- Plasma: torches, electrodes, nozzles, shields, retaining caps, swirl rings and consumable kits
- Machines: MIG/MAG, TIG, MMA, multi-process machines and plasma cutters

Primary buyers include distributors, importers, wholesalers, OEM buyers, industrial suppliers,
repair workshops and industrial users.

## Data-First Operating Model

Always follow this sequence:

`Verified source -> Structured data -> Validation -> Product relationships -> Website -> SEO -> Catalog -> Sales support`

Never use `Product name -> AI guess -> Publish`.

Evidence priority is:

1. Level A: confirmed ArcFort Weld company or factory data
2. Level B: official manufacturer catalogs and manuals
3. Level C: applicable IEC, ISO, AWS or other standards
4. Level D: competitor, distributor or marketplace references

Important technical fields must support `field_value`, `source`, `source_level`,
`verification_status` and `last_verified_date`. Allowed verification states are `CONFIRMED`,
`OEM_REFERENCE`, `STANDARD_REFERENCE`, `NEEDS_FACTORY_CONFIRMATION` and `DATA_CONFLICT`.

Only Level A evidence with the required review record may be presented as a confirmed ArcFort Weld
specification. Appearance, similar naming or catalog grouping cannot establish compatibility.

## Current Repository Baseline

| Area                   | Current evidence                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application            | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, ESLint and Prettier                                                                                                  |
| Public routes          | 18 page route files and two API route families, including product, category, series, application, guide and RFQ paths                                                           |
| Reusable UI            | 59 TypeScript component files using the governed industrial design system                                                                                                       |
| Product pipeline       | `data/import/products.csv` -> validation/import scripts -> `lib/data/products.ts` -> content adapter -> static App Router pages                                                 |
| Product records        | 43 total: 40 active and three draft across six categories; all 43 remain `needs_review`                                                                                         |
| Product series         | 10 catalog evidence records; zero governed public series                                                                                                                        |
| Series evidence        | 589 component facts and 189 candidates; zero confirmed component facts and 14 blocked data conflicts                                                                            |
| Compatibility          | Four governed reference-only relationships; zero confirmed relationships                                                                                                        |
| Technical facts        | 15 governed field-level facts; zero confirmed ArcFort Weld facts                                                                                                                |
| Product media          | 119 repository product-image files and 46 canonical asset records; zero rights-approved, exact-product, search-eligible assets                                                  |
| Public product imagery | All 40 active products retain legacy-reference main images; three draft products remain blocked for exact images                                                                |
| Company media          | Three files under `public/images/site`; no dedicated company-media evidence registry yet                                                                                        |
| Knowledge base         | 19 files across `assets`, `compatibility`, `decisions`, `products` and `technical`                                                                                              |
| SEO                    | Central metadata and JSON-LD builders, canonical handling, sitemap, robots, redirects, static audits and live-readiness checks                                                  |
| Search baseline        | Site is live and indexable; 88 production sitemap URLs and a recorded baseline of 8 clicks, 422 impressions and 1.90% CTR                                                       |
| RFQ                    | Email-provider flow, validation, attachments, buyer confirmation, BotID and idempotency are implemented; final sales and buyer inbox placement remains externally unverified    |
| Delivery operations    | Deployment and live health evidence exist; DMARC, credential-rotation confirmation, GA4 conversion evidence and Search Console submission still require owner-side verification |

The technical website foundation is mature. The primary constraint is verified evidence, not another
general page or a larger unreviewed SKU count.

## Canonical Source Map

- Repository execution rules: `AGENTS.md` and `docs/*_RULES.md`
- Confirmed public company data: `lib/content/site.ts`
- Canonical product working data: `data/import/products.csv`
- Generated typed product data: `lib/data/products.ts`
- Public product projection: `content/products.ts` and `lib/content/products.ts`
- Product image evidence: `data/assets/product-image-assets.csv`
- Unassigned local image triage: `data/evidence/local-product-image-triage.csv`
- Product-series evidence: `lib/data/product-series-evidence.ts`
- Public product-series records: `lib/data/product-series.ts`
- Series component evidence and intake: `data/evidence/product-series-component-facts.csv` and
  `data/intake/*-series-confirmation.csv`
- Compatibility relationships: `lib/data/compatibility-relationships.ts`
- Field-level technical facts: `lib/data/product-technical-facts.ts`
- SEO metadata and structured data: `lib/content/seo.ts` and `lib/content/jsonld.ts`
- Production evidence: `docs/operations/acquisition-production-evidence.json`
- Acquisition baseline: `docs/acquisition-readiness-report.md`
- Durable research and decisions: `knowledge-base/`

Do not bypass these sources by hardcoding independent public facts in a page component.

## Product Development Stages

### Stage 1: 100 Verified High-Quality SKUs

Focus first on 15AK and then the next evidence-ready MIG/MAG, TIG and plasma families. Each published
SKU must have a stable identifier and route, reviewed product copy, verified critical data,
governed compatibility status, an exact legally usable main image and an RFQ path.

### Stage 2: 300 Verified SKUs

Expand product-family depth, available models, related-component relationships, buyer guides and
distributor-ready product resources without weakening Stage 1 evidence gates.

### Stage 3: 500 Verified SKUs

Broaden machines, accessories and solution coverage; strengthen China-market content architecture,
catalog automation and structured distributor support.

### Stage 4: 1000+ Structured SKUs

Operate one governed product system that can feed the website, catalogs, RFQs, distributor data and
future CMS or database services. SKU quantity never overrides verification quality.

## Goal Mode Priorities

Unless a critical production issue exists, work in this order:

1. Correct inaccurate public information and protect website stability.
2. Verify product facts, product identity and legally usable exact imagery.
3. Complete 15AK evidence and product relationships before expanding overlapping families.
4. Build compatibility as a source-aware company asset.
5. Improve product-detail clarity and qualified RFQ conversion.
6. Add real company evidence, distributor support and OEM / ODM workflows.
7. Improve premium industrial presentation without weakening indexed content.
8. Prepare a controlled China and international architecture.
9. Expand SEO only after the corresponding product foundation is strong.

## Missing Long-Term Infrastructure

The current repository still needs:

1. A governed company-claim register for legal identity, supplier role, quality processes,
   manufacturing claims, capabilities and commercial statements.
2. A company-media evidence registry covering factory, production, inspection, packing, warehouse
   and shipment images with owner, rights, subject match, reviewer and date.
3. A compact Goal Mode progress report connecting the 100 / 300 / 500 / 1000 milestones to verified
   data, exact imagery, compatibility, series and publication readiness.
4. Durable `knowledge-base/company`, `knowledge-base/seo` and `knowledge-base/sales` areas. Continue
   using the existing `knowledge-base/assets` area for media governance rather than creating a
   competing media taxonomy.
5. Level A measurements, drawings, identity evidence and exact photos for the 15AK family and later
   priority series.
6. Confirmed compatibility and field-level technical facts. Existing registries are structurally
   ready but contain no confirmed records.
7. Owner-side evidence for RFQ inbox delivery, credential rotation, DMARC, GA4 conversion tracking
   and Search Console submission.
8. A later `/zh/` and `/en/` information-architecture and URL-migration plan. The current root site
   is English and public URLs must not be changed casually.

A Sanity or Supabase product backend may become useful at higher operating scale, but it is not the
next bottleneck. The governed CSV-to-TypeScript pipeline is adequate until evidence quality,
ownership and publishing workflow are stronger.

## Autonomous Execution Boundary

For each meaningful phase:

1. Inspect current rules, data, evidence, routes, SEO and RFQ dependencies.
2. Compare the authoritative state with this goal and choose the highest-value safe batch.
3. Implement a controlled page, component, data or evidence family.
4. Run applicable validation, build, lint, type, SEO, media, RFQ and security checks.
5. Preserve reusable facts and decisions in governed data or `knowledge-base/`.
6. Update `docs/CHANGELOG_AI.md` and report evidence, unresolved items and the next best step.
7. Stop at the requested or meaningful phase boundary.

Codex may autonomously organize data, improve validation, refactor safely, strengthen SEO structure,
map media, detect missing evidence and improve QA. Owner approval is required before publishing
unverified specifications, changing confirmed legal or commercial policy, claiming certifications,
performing major URL migrations, deleting substantial production data or making high-risk production
changes.

## Definition Of Progress

Progress is measured by stronger verified assets and buyer outcomes, not by page or word count.
Useful measures include:

- Verified and publication-ready SKUs by family
- Exact, rights-approved product images by SKU
- Confirmed technical fields and compatibility relationships
- Resolved data conflicts and completed review queues
- Qualified RFQs with preserved product context
- Search clicks, qualified landing pages and RFQ conversion without buyer PII
- Distributor resources backed by current product data
- Real company evidence with documented ownership and review

No task is complete merely because code builds. Claims, data, routes, media rights, SEO projection,
mobile behavior and conversion paths must satisfy the applicable repository gates.

## Recommended Next Setup Phase

Build the company and 15AK evidence foundation before changing major public layouts:

1. Create structured company-claim and company-media evidence registries.
2. Record only verified legal, supplier, process and capability evidence.
3. Complete the existing 15AK factory confirmation and exact-image intake files with Level A
   measurements, drawings, product identity and image-rights evidence.
4. Generate a compact Goal Mode progress report from canonical sources.
5. Promote no product, image, technical fact or compatibility relationship until its evidence gate
   passes.

## Files To Create Next

These files are intentionally not part of Goal Mode initialization and should be created as the next
controlled evidence-infrastructure batch:

- `data/evidence/company-claims.csv`
- `data/assets/company-media-assets.csv`
- `knowledge-base/company/company-profile-evidence.md`
- `knowledge-base/seo/search-console-baseline.md`
- `knowledge-base/sales/rfq-delivery-and-qualification.md`
- `scripts/report-goal-progress.ts`
- `docs/goal-progress-report.md`
