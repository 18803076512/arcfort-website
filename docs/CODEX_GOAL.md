# ArcFort Weld Codex Goal Mode

Evidence baseline: 2026-09-03; staging owner/browser acceptance: 2026-09-08;
M3 local approval: 2026-09-09; command/UI checkpoint: 2026-09-10; local/clean-CI acceptance: 2026-09-18.
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
| Product Intelligence   | M1 hosted foundation, M2 local owner/browser and M3 local/CI draft/review gates passed with warnings; hosted remains read-only, with no public-source cutover or publication       |

The technical website foundation is mature. The primary constraint is verified evidence, not another
general page or a larger unreviewed SKU count.

## Current System Phase

The owner approved Product Intelligence Console V1 decisions D0-D7 on 2026-08-30. The current
completed implementation batches are **Milestone 1 - Data Foundation**, the local, staging-backed
read-only scope of **Milestone 2 - Console Shell And Dashboard**, and the local/disposable-CI scope
of **Milestone 3 - Draft Editing And Technical Review**. M3 candidate `e5c23e31` passed clean CI on
2026-09-18 (Shanghai); hosted M3 is unperformed. 15AK remains the first real-data pilot.
M2 owner onboarding and authenticated browser acceptance passed with bounded warnings
on 2026-09-08. Candidate `5021ae265b4c471957650435d011b61508c0274f` has successful quality and isolated
database CI in run `34083109446`. External HTTPS/mobile deployment and full V1 remain incomplete.
Supabase is not authoritative for public pages and no product data was published. See the dated
[acceptance record](operations/product-intelligence-console-milestone-2.md#2026-09-08-real-owner-browser-acceptance).

The M2 batch and exact acceptance matrix are recorded in
`docs/operations/product-intelligence-console-milestone-2-plan.md`. Initial read-only inspection on
2026-09-03 found that hosted signup was not disabled. M2 scope, URL-preserving layout isolation and
staging Auth changes were subsequently approved and implemented locally. Signup is now disabled and
the exact loopback URLs are configured. The default Free-plan mail provider rejected custom
invitation/recovery templates. The owner subsequently approved separate staging Resend SMTP,
configured on 2026-09-05. After reporting no receipt at the first address, the owner explicitly
approved a replacement administrator mailbox on 2026-09-06. The initial provider-reported delivery
was followed by verified email/password-login evidence, an explicitly approved owner grant and
actual browser acceptance on 2026-09-08. The superseded account remains unprivileged. Local/CI mail
remains collector-only; historical run `33998964482` passed at `f906f3c8` before the current candidate.
See the
`docs/operations/console-staging-auth-smtp.md` runbook for evidence and corrected CLI setting drift,
and the M2 implementation record for
candidate-specific code and test status. Isolated CI passed Auth, RLS, revocation and 1,103-row
pagination checks; do not treat that synthetic result as completed real-owner onboarding.

On 2026-09-06, the owner approved preparing a protected HTTPS test entrance because loopback links
cannot be used on their phone. The [mobile staging candidate](operations/console-mobile-staging.md)
is disabled and not deployed. Cloudflare zone/Access reads recovered on 2026-09-07, but subscription
visibility is still denied and no new app/tunnel/DNS exists. Plan and exact-destination approval gates
remain in the runbook before any provisioning.
The earlier password-report/confirmation discrepancy is now resolved by the dated Auth and browser
evidence. Do not reopen that handoff, enable a tunnel, resend invitations or repeat the owner grant.

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

Retain the completed local/CI M3 baseline and review the next controlled product-data phase:

Current access update: the approved staging owner has verified email, evidenced password login and
one active `owner` role. The role committed on 2026-09-07 and was independently read back with audit
event `3682` on 2026-09-08. The superseded account has no role. These gates are complete; do not
repeat invitations, password setup or the first-owner bootstrap. Authenticated owner UI/responsive/
logout acceptance is complete, including 43-row pagination, conflict/readiness filters and denied
post-logout access. See the [M2 acceptance record](operations/product-intelligence-console-milestone-2.md#2026-09-08-real-owner-browser-acceptance)
and [Auth runbook](operations/console-staging-auth-smtp.md) for exact scope and evidence.

Latest M3 checkpoint (2026-09-18): reviewed candidate `e5c23e31` passed both jobs in
[CI run 35284287968](https://github.com/18803076512/arcfort-website/actions/runs/35284287968), including
fresh M2 Auth/pagination and the complete M3 SQL/API/ten-scenario browser/source-retention sequence.
The approved local/disposable-CI M3 gate is **PASS_WITH_WARNINGS**. The owner authorized only review,
commit and push to the existing branch; it remains unmerged, with its automatic Vercel deployment
disabled. Hosted M3 migration/adoption and full V1 are not completed or authorized by this pass.
The dated [acceptance record](operations/console-m3-isolated-acceptance.md#september-18-clean-ci-acceptance)
supersedes the older pending-CI checkpoints below and retains exact bounds and remaining evidence.

1. Preserve the completed local/CI [M3 draft-editing/evidence plan](operations/product-intelligence-console-milestone-3-plan.md).
   The owner approved M3-A through M3-E on 2026-09-09 for local development and isolated testing.
   The [first authority/import barrier](operations/product-intelligence-console-milestone-3.md)
   and private atomic product draft/technical review commands are implemented with passing embedded
   SQL tests (246 assertions plus all fifteen real-source pilot scopes). Local-only command endpoints,
   editing/review UI and paginated history are implemented, with eight command-contract test groups
   and synthetic browser checks. The [isolated acceptance runner](operations/console-m3-isolated-acceptance.md)
   and seven target-guard test groups are prepared. On September 13 the owner explicitly approved
   preserving the failed local database as `arcfort_m3_failed_20260913` and creating a new `postgres`
   from the reviewed empty template. That operation completed with old rows, audit, settings and
   ACLs retained. Original pg_prove and the independent SQL-report runner each passed 9 suites /
   246 assertions; complete CLI type parity and two exact 17-table imports passed. The new run
   completed real Auth/PostgREST, adoption/import contention, duplicate creation, stale saves,
   technical EDIT/APPROVE/REJECT and revocation before failing in browser acceptance.
   September 14 diagnostics verified two browser-test transport repairs: raw malformed JSON bytes
   and retention of unchanged real server responses across navigation. Login, rejection requests
   and an existing create-receipt replay passed. The owner subsequently approved the exact second local preservation to
   `arcfort_m3_failed_20260914`; see the
   [new authorization](../knowledge-base/decisions/2026-09-14-console-m3-local-baseline-rerun.md).
   That second operation is now complete. Both archives and the empty template remain intact.
   On the new baseline, SQL/types/two imports and the API phase passed again. Nine real browser
   groups and twelve responsive screenshots passed before failure in the final session/logout group.
   A retained-fixture diagnostic reproduced a streamed-redirect timing assertion and passed after
   waiting for actual login navigation; the full repaired runner and current clean CI remain unproven.
   Current local data retains three synthetic drafts, six verification events and one adoption;
   all 43 original variants / 604 facts are unchanged, with zero publish records. Thirty-six
   regression scripts, full typecheck and lint pass. Execution and remaining gates are tracked in
   the [latest runbook](operations/console-m3-isolated-acceptance.md#september-14-second-preservation-result).
   Do not ask for either completed preservation approval again. The owner subsequently confirmed
   the third exact preservation to `arcfort_m3_failed_20260914_b` on September 17; it completed with
   all three archives/template and original database ACL/settings retained. Fresh SQL/types/two
   imports passed, and the complete ten-group browser report passed with twelve screenshots and
   zero page errors/external requests. The terminal handle was lost across a later Windows reboot;
   no captured overall exit code is claimed. Independent final retention checks after normal Docker
   startup passed for all 43 original variants / 604 facts and zero publication. Current candidate
   clean CI and durable full-run completion evidence were still missing at that checkpoint and
   were subsequently supplied by the September 18 CI acceptance linked above. See the
   [latest acceptance section](operations/console-m3-isolated-acceptance.md#september-17-third-preservation-and-fresh-browser-acceptance).
   No fourth switch is authorized; never reset or replay imports over any adopted database.
   The September 17 Docker
   all-users recovery passed ordinary desktop startup and two normal restarts with unchanged
   retained database snapshots. Its documented preserving uninstall unexpectedly removed active
   data, which was recovered from verified cold backups. Subsequent Windows reboot/normal-shortcut
   acceptance passed at 2026-09-17 04:14 UTC, with all original retained data matching again and
   correct CLI discovery. C-drive free space recovered to approximately 12 GB without agent cleanup;
   see the [recovery record](../knowledge-base/technical/docker-desktop-recovery.md).
   These are environment/data-retention results, not full M3 acceptance.
   Do not request the same general M3 approval again. Hosted migration/adoption, real technical
   confirmation, merge and publication remain separate gates.
2. Preserve exact staging target `fdsvzuqixppsakukkrsf`; old-project authorization remains
   superseded. Any further account, permission or provider change needs separate scoped approval.
   No service key may reach browser code.
3. Keep Console within its approved local boundary. External HTTPS/mobile activation requires its
   own provider/destination approval and live checks. Preserve invite-only policy, current role
   checks, private/noindex responses and application/RLS isolation.
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
controlled draft-editing/evidence-intake plan.
