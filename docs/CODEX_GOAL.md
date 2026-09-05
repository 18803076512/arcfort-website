# ArcFort Weld Codex Goal Mode

Evidence baseline: 2026-09-03; staging owner/mail update: 2026-09-06.
Production observations referenced here were last verified on
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
| Company claims         | 22 governed claim records: 16 approved Level A statements and six blocked unsupported topics                                                                                    |
| Company media          | Three files and three governed site-media records; all remain representative legacy references and zero are approved company evidence                                           |
| Knowledge base         | 25 files, including durable company, SEO, sales and database-validation baselines alongside product, technical, compatibility, asset and decision records                       |
| SEO                    | Central metadata and JSON-LD builders, canonical handling, sitemap, robots, redirects, static audits and live-readiness checks                                                  |
| Search baseline        | Site is live and indexable; 88 production sitemap URLs and a recorded baseline of 8 clicks, 422 impressions and 1.90% CTR                                                       |
| RFQ                    | Email-provider flow, validation, attachments, buyer confirmation, BotID and idempotency are implemented; final sales and buyer inbox placement remains externally unverified    |
| Delivery operations    | Deployment and live health evidence exist; DMARC, credential-rotation confirmation, GA4 conversion evidence and Search Console submission still require owner-side verification |
| Product Intelligence   | M1 hosted foundation gates passed on 2026-09-03: five migrations, 74 assertions, schema-member type parity and two 17-table imports; shadow-only, no Console UI or publication  |

The technical website foundation is mature. The primary constraint is verified evidence, not another
general page or a larger unreviewed SKU count.

## Current System Phase

The owner approved Product Intelligence Console V1 decisions D0-D7 on 2026-08-30. The current
completed implementation batch is **Milestone 1 - Data Foundation**, with 15AK remaining the first
real-data pilot. M1's runtime gates pass with bounded operational warnings. The next batch is
**Milestone 2 - Console Shell And Dashboard**, approved on 2026-09-03. Its local technical candidate
passed final isolated CI on 2026-09-04; activation remains pending. Owner onboarding is not complete.
Supabase is not authoritative for public pages and no product data was published.

The M2 batch and exact acceptance matrix are recorded in
`docs/operations/product-intelligence-console-milestone-2-plan.md`. Initial read-only inspection on
2026-09-03 found that hosted signup was not disabled. M2 scope, URL-preserving layout isolation and
staging Auth changes were subsequently approved and implemented locally. Signup is now disabled and
the exact loopback URLs are configured. The default Free-plan mail provider rejected custom
invitation/recovery templates. The owner subsequently selected `info@arcfortweld.com` and approved
separate staging Resend SMTP. SMTP/templates were configured on 2026-09-05 and one invitation has
provider-reported delivery. A read-only check on 2026-09-06 found the account still unconfirmed; no
owner role was assigned. Real mailbox receipt, password/login and authenticated browser checks remain
open. Local/CI mail remains collector-only. See the
`docs/operations/console-staging-auth-smtp.md` runbook for evidence and corrected CLI setting drift,
and the M2 implementation record for
candidate-specific code and test status. Isolated CI passed Auth, RLS, revocation and 1,103-row
pagination checks; do not treat that synthetic result as completed real-owner onboarding.

The foundation and readiness, SEO-approval and destination-safety hardening are committed on
`codex/v2-industrial-brand-system` in PR #130. On 2026-09-02, isolated Linux CI at commit `6383171`
passed a fresh database reset, all 74 pgTAP assertions, generated-type drift validation and two
consecutive exact-row shadow imports across 17 tables. Static validation, deterministic generation,
lint, typecheck and the public production build also passed. Candidate-specific evidence is retained
in `docs/operations/product-intelligence-console-milestone-1.md`; later schema/importer changes must
rerun the same gates. Windows Docker Desktop still has a separate host startup failure.

On 2026-09-03 the owner replaced the staging destination with `arcfort-product-intelligence-staging`,
project reference `fdsvzuqixppsakukkrsf`, reported Singapore and the Free plan, and explicitly
authorized Milestone 1 migration and shadow import only in this non-production project. The prior
`bdaucwemujiunpyptkpq` destination is superseded and must not receive further writes. See
`knowledge-base/decisions/2026-09-03-product-intelligence-staging-replacement.md`.
Local token login subsequently succeeded on 2026-09-03. A fresh authenticated CLI lookup verified
the exact reference/name, Singapore (`ap-southeast-1`) and provider status `ACTIVE_HEALTHY`.
The authenticated project organization is `xycjhlnlacqocitjkagq`; the owner confirmed project
management and recovery responsibility. Hosted inspection found an empty public schema, no
migration history, zero users/buckets and PostgreSQL `17.6`. The five-migration dry-run passed with
no seeds or custom roles. The owner then supplied paired project and Billing Dashboard screenshots
showing the exact project and Free Plan. Their scoped provenance and the crop's missing organization
header are recorded in the runbook; this is reviewed owner-provided Dashboard evidence, not a
successful organization API read. The requested billing evidence handoff is now resolved.

The follow-up organization-plan request returned HTTP 403; project access does not imply billing
read access. No token permissions or billing settings were changed to resolve that gap. The SQL-report QA
adapter avoids the Windows Docker dependency for hosted testing; it preserves
the five existing test files, checks all 74 planned assertions and rejects missing/failed results.
Its unit/configuration checks pass. On 2026-09-03 the owner authorized
committing and pushing this tooling to PR #130 for isolated database CI only. That separate approval
does not include a merge or production deployment. Hosted migration/import execution used the
owner's earlier explicit authorization for the exact replacement staging project.

Candidate `202c189f1f062fa20fff8219aca3a0aba66f1c79` subsequently passed isolated
[CI run 33714502709](https://github.com/18803076512/arcfort-website/actions/runs/33714502709).
Both jobs passed: the original pg_prove and SQL-report paths each ran all 74 assertions; the new
runner's pass/fail/count-mismatch controls passed on pgTAP `1.3.3`. Generated database types matched,
and two complete shadow imports reconciled 17 tables each. The website quality/build/SEO/RFQ gates
also passed. The evidence-only follow-up `4518b885` passed
[run 33714840051](https://github.com/18803076512/arcfort-website/actions/runs/33714840051) too.

On 2026-09-03 the unchanged tested candidate was applied to `fdsvzuqixppsakukkrsf` after repeated
identity/schema/preview checks. All five migrations, all 74 hosted assertions with real negative
controls, and two 17-table exact-row shadow imports passed. Every generated `public` and
`graphql_public` schema member matches the committed types. Hosted output includes additional
PostgREST `14.5` metadata; full-file identity is not claimed and the local type
artifact was retained. The existing project server key was used only in process memory.

Final hosted evidence confirms 28 forced-RLS tables, two private buckets, all 43 products in shadow
mode, no duplicate SKU/slug, zero Auth users/console roles and zero publication records. The 14
conflicts and all unconfirmed fact/compatibility/media states remain unchanged. The M1 foundation
gate is `PASS_WITH_WARNINGS`: Windows Docker is still unavailable, generator metadata differs, and
hosted Auth setup must be verified before Console access. These are not permission to publish
unverified products. The full Console UI, 15AK pilot and production authority transition remain
incomplete. The runbook retains exact commands, suite hashes and final counts.

The approval and source-of-truth boundary are recorded in
`knowledge-base/decisions/2026-08-30-product-intelligence-console-v1-foundation.md`.

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
- Reusable workflow skills: `.agents/skills/` and `docs/SKILLS_INDEX.md`
- Approved Product Intelligence Console V1 architecture:
  `docs/product-intelligence-console-v1-architecture.md`
- Product Intelligence Console V1 phase decision:
  `knowledge-base/decisions/2026-08-30-product-intelligence-console-v1-foundation.md`

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

1. Level A measurements, drawings, identity evidence and exact photos for the 15AK family and later
   priority series.
2. Confirmed compatibility and field-level technical facts. Existing registries are structurally
   ready but contain no confirmed records.
3. Real company-owned factory, production, inspection, packing, warehouse and shipment media with
   owner, rights, subject match, reviewer and date. The current three site visuals are representative
   legacy references only.
4. Owner-side evidence for RFQ inbox delivery, credential rotation, DMARC, GA4 conversion tracking
   and Search Console submission.
5. A later `/zh/` and `/en/` information-architecture and URL-migration plan. The current root site
   is English and public URLs must not be changed casually.

The approved Supabase Product Intelligence foundation now addresses the review, audit and publishing
workflow bottleneck. During shadow migration, the governed CSV-to-TypeScript pipeline remains the
canonical rollback authority. Database adoption must not weaken evidence quality or ownership gates.

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

Complete the approved Product Intelligence Console V1 Milestone 2 gates:

1. Validate the local M2 implementation and isolated CI. Resolve the first owner mailbox and
   default-provider template restriction before claiming real invitation/login success. Do not add
   publishing or CRM work; keep Console disabled outside controlled local QA.
2. Recheck the exact staging target `fdsvzuqixppsakukkrsf`; old-project authorization remains
   superseded. Obtain the owner access/role/bootstrap handoff and provider-setting approval before
   changing hosted Auth or creating an account. No service key may reach browser code.
3. Close the observed hosted signup gap only with scoped approval, then verify redirect, session and
   role boundaries before exposing Console access. Local Auth config is not hosted evidence. Test
   unauthorized requests at application and RLS layers; do not infer email delivery from API success.
4. Preserve repository data authority, product routes, SEO and RFQ. Shadow imports must not overwrite
   future reviewed Console edits without a separately approved authority-transition design.
5. Retain both isolated and hosted M1 proof. Schema/importer/test/contract changes require fresh
   candidate-specific gates, not reuse of these green results. Keep write guards off by default.
6. Continue collecting Level A 15AK facts and exact-product images for the later verification pilot;
   do not convert reference values into confirmed data to fill the future dashboard.

## Goal Evidence Infrastructure

The controlled evidence-infrastructure batch is implemented:

- `data/evidence/company-claims.csv` governs approved and blocked company statements.
- `data/assets/company-media-assets.csv` separates representative visuals from real company evidence.
- `knowledge-base/company`, `knowledge-base/seo` and `knowledge-base/sales` retain durable baselines.
- `scripts/report-goal-progress.ts` generates `docs/goal-progress-report.md` from canonical data.
- `npm run company:evidence:validate` and `npm run goal:report` are CI-gated.

The report deliberately separates 43 structured records from zero strict verified SKUs. The next
evidence action is not more page volume; it is Level A 15AK and company media evidence alongside the
controlled Console access/dashboard phase.
