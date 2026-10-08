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
| Product Intelligence   | M1 hosted foundation, M2 local owner/browser and M3 local/CI draft/review gates passed with warnings; hosted remains read-only, with no public-source cutover or publication    |

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

Latest diagnostic validation (2026-10-08): candidate `90e18693625e4153c052156182bf3befe9c61791`
fails [run 37728451960](https://github.com/18803076512/arcfort-website/actions/runs/37728451960)
after 47 browser scenarios: React hydration error 418 and a TypeError during the packaging history/
responsive checkpoint. Quality passes; external requests remain zero. **Current closure is BLOCKED**
pending diagnosis and repair, not an authorization or real-data blocker. The native diagnostic now
separates fixed role/route/viewport/checkpoint labels and stream-error categories without private
messages. Production-mode synthetic fixture probes have not reproduced the fault; they do not
substitute for native acceptance. No deployment or hosted/retained-local change is authorized.

Prior diagnostic validation (2026-10-08): `fb22f8aab6b501f67896999f3eb274a77acc494d` passes
[run 37726932305](https://github.com/18803076512/arcfort-website/actions/runs/37726932305), including
two complete native attempts with 47 browser scenarios, zero page errors and final retention checks.
The added diagnostic does not change runtime or suppress errors. **Stability warning remains:**
documentation candidate `16b4c06e` previously recorded three unclassified page errors after the same
47 scenarios. They did not recur in either instrumented attempt; their cause is not established or
claimed fixed. Keep the bounded diagnostic and investigate recurrence. This is CI evidence only,
not permission or proof for production/real-product publication; full V1 remains incomplete.

Latest accepted CI checkpoint (2026-10-08): B11-B16, C1-C4 and D1-D4 at `7403136272fa06c011e0c49a6af7904948279efa`
pass both jobs in [run 37698778273](https://github.com/18803076512/arcfort-website/actions/runs/37698778273).
The exact disposable candidate passes 24 native SQL suites / 1,384 assertions and 47 database-backed
browser scenarios, including media observation/original bytes, OEM and packaging review, observed
contention, revoked access and exact original/commercial retention. A real stale OEM snapshot was
fixed with [document navigation](../knowledge-base/decisions/2026-10-08-console-oem-packaging-document-navigation.md).
The [scoped submission gate](operations/product-intelligence-console-milestone-4.md#october-8-combined-native-acceptance)
is **PASS_WITH_WARNINGS**, not production or real-product approval. PR #130 remains open; no merge,
deployment or hosted/retained-local change occurred. Technical documents, real 15AK evidence and
the verified preview/QA/authorized publishing workflow remain incomplete. Keep the full V1 active.

Authorization record (2026-10-07): the owner explicitly approved review, commit and push of
B11-B16, C1-C4 and D1-D4 to `18803076512/arcfort-website` / `codex/v2-industrial-brand-system`,
with explicit OEM and packaging disposable CI only. The [dated decision](../knowledge-base/decisions/2026-10-07-console-m4-media-oem-packaging-ci.md)
supersedes the historical pending-approval status below. The October 8 accepted checkpoint above
supersedes this authorization record's previously unrun native gate only; no merge, deployment,
hosted or retained-local change is authorized.

Retain the completed local/CI M3 baseline and review the next controlled product-data phase:

Prior local M4 checkpoint (2026-10-06): M4-D4 prepares explicit default-off disposable packaging
form/Auth/RPC/observed-race/revocation acceptance. All 24 embedded suites / 1,384 assertions and a
new actual-parser/public-wrapper five-revision packaging rollback rehearsal pass. The exact ledger
retains unknown/10/12-piece synthetic history, historical-count conflicts, explicit human states,
original commercial rows and zero publication. Sixty-seven guard/command/read/contract regressions,
TypeScript, zero-warning lint and fresh 95-page production build pass. Native packaging acceptance
is NOT_RUN; simulated actors and sequential replay do not prove the full service workflow. See the
[D4 record](operations/product-intelligence-console-milestone-4.md#m4-d4-disposable-packaging-acceptance-preparation).
No retained/hosted/provider operation, active setting, public-source change, push or deployment.
A new exact B11-B16 plus C1-C4 plus D1-D4 CI-only question replaces the pending older scope; no
approval is inferred. Next verify native isolated media/OEM/packaging, finish technical documents
and collect real 15AK evidence for verified preview/QA/authorized publication. Full V1 remains
active and incomplete under all twelve success criteria.

Prior local M4 checkpoint (2026-10-06): M4-D3 adds narrow authenticated packaging commands, counted
source/current/history reads and a default-off private workbench. All 24 embedded suites / 1,384
assertions, complete public-type parity and exact 17-table replay/rollback checks pass. Seventeen
packaging command/read groups and thirteen synthetic Edge browser groups across six widths pass;
shared OEM/compatibility/media/command/privacy regressions pass. Unknown quantity remains null,
commercial notes stay read-only, human acknowledgements reset on evidence/status changes, and
readiness totals reject inconsistency. All 43 original packaging/commercial rows remain unchanged.
See the [D3 record](operations/product-intelligence-console-milestone-4.md#m4-d3-packaging-application-workbench).
Native Auth/PostgREST/concurrency/persisted owner review and real packaging evidence are still
unproven. No retained/hosted migration, Docker/provider operation, active flag, public-source change
or new push/deployment. D1-D3 are outside the pending B11-B16 plus C1-C4 CI scope. Next prepare
disposable native packaging acceptance, then technical documents and real 15AK evidence for
verified preview/QA/authorized publication. Full V1/all twelve criteria remain incomplete.

Prior local M4 checkpoint (2026-10-05): M4-D2 prepares immutable physical packaging proposals,
frozen human APPROVE/EDIT/REJECT, effective records and readiness. All 23 embedded suites / 1,332
assertions, full public-type parity, two exact 17-table replays and five frozen TEST-ONLY
reference proposals/confirmation-refusal/rollback pass. Missing records, unknown counts, reference
approvals and unresolved conflicts block packaging readiness; historical count changes cannot hide
new contradictory evidence. All 43 original packaging/commercial rows remain exact. See the
[D2 record](operations/product-intelligence-console-milestone-4.md#m4-d2-frozen-packaging-human-review).
Private SQL and simulated roles do not establish a usable browser workflow or real confirmation.
No application mutation flag/RPC, native migration, retained/hosted write, public-source change or
new push/deployment. D1/D2 are outside the pending B11-B16 plus C1-C4 CI-only scope. Next complete
packaging application commands/read workbench and native acceptance, technical documents and real
15AK evidence for verified preview/QA/authorized publication. Full V1/all twelve criteria remain
incomplete; no smaller completion definition is substituted.

Prior local M4 checkpoint (2026-10-05): M4-D1 prepares exact-SKU physical packaging source
bindings and private immutable intake, preserving the full original packaging/commercial rows.
All 22 embedded suites / 1,238 assertions, official public types, two exact 17-table source
replays and a new four-real-identity/one-synthetic-draft packaging rollback rehearsal pass.
Unknown counts stay null; reference-only sources do not confirm actual packaging. Existing
disposable guards now refuse retained packaging sources and verify original retention, without
native execution. See the [D1 record](operations/product-intelligence-console-milestone-4.md#m4-d1-physical-packaging-source-foundation).
No application editor/review, public RPC, active flag, retained/hosted migration or public change.
This new local batch is outside the pending B11-B16 plus C1-C4 CI-only question. Continue packaging
proposals/human review/workbench/native acceptance, technical documents and real 15AK evidence,
then governed verified preview/QA/publication. Full V1/all twelve criteria remain incomplete.

Prior local M4 checkpoint (2026-10-05): M4-C4 prepares explicit default-off disposable OEM
form/SDK/observed-race/revocation/retention acceptance. Twenty-one embedded suites / 1,130
assertions and a new actual-parser/public-wrapper sequential five-revision OEM workflow pass,
including exact ledger, unselected conflict, human statuses, original retention and 17-table
rollback. Eight target, nine server and four OEM acceptance guard groups pass. Fresh production
build, type/lint/contracts and public SEO/link/image/performance checks pass. Native acceptance is
NOT_RUN. No-provider browser/HTTP acceptance is blocked because a read-only loopback Auth request
responds despite a free bind; strengthened preflights now refuse before mutation. See the
[C4 record](operations/product-intelligence-console-milestone-4.md#m4-c4-disposable-oem-acceptance-preparation).
No public/canonical/retained/hosted write, activation, commit/push or deployment. A new exact
B11-B16 plus C1-C4 CI-only question replaces pending B11-B16-only scope; no authorization inferred.
Next separately authorize/verify native isolated OEM, then packaging/documents and real 15AK
evidence. All twelve V1 criteria and the full workflow remain active and incomplete.

Prior local M4 checkpoint (2026-10-05): M4-C3 adds typed OEM intake/proposal/submission/review
commands, guarded current/fresh reads and the usable owner/editor/reviewer workbench. The independent
application flag remains off; no native migration or activation occurs. Twenty-one embedded suites /
1,130 assertions, complete official public types, exact source replays, fourteen OEM command/read
test groups and fifteen synthetic Edge browser groups across six widths pass. Fresh production
build and actual no-provider private-route smoke pass; original/canonical/public/compatibility/SEO/
RFQ authority remains unchanged, with zero publication. See the
[C3 record](operations/product-intelligence-console-milestone-4.md#m4-c3-oem-application-workbench)
for exact limits. Native Auth/PostgREST/concurrency and real OEM document/human verification remain
unproven. The late September 28 CI approval is already fulfilled and does not cover C1-C3; pending
B11-B16-only scope is not enlarged. Next prepare native isolated OEM acceptance, then remaining
packaging/documents and real 15AK evidence for the verified preview/QA/publication gates. Full V1
and all twelve criteria remain incomplete; no commit/push, retained/hosted write or deployment.

Prior local M4 checkpoint (2026-10-05): M4-C2 adds exact immutable OEM proposals, frozen human
APPROVE/EDIT/REJECT, explicit original lineage, conflict-preserving corrections, private current/
effective reads and readiness. Original OEM rows/public/compatibility remain unchanged and all OEM
output is private, not publication-ready. All 20 embedded suites/1,082 assertions, complete public
types/source parity, old media rehearsal and five real-identity TEST-ONLY OEM proposal/refusal/
rollback checks pass. TypeScript/lint and fresh production/no-provider browser smoke pass. The
[C2 record](operations/product-intelligence-console-milestone-4.md#m4-c2-frozen-oem-human-review)
and [review decision](../knowledge-base/decisions/2026-10-05-console-m4-oem-human-review.md) retain
exact evidence and limits. No application mutation/UI/activation, native/hosted/retained migration,
real human product approval, commit/push or publication is added. The late September 28 CI-only
approval was already fulfilled; neither it nor pending B11-B16 scope covers C1/C2. Next build OEM
application contracts and the usable human workbench within M4-C, then packaging/documents and the
full M4 gate. Native acceptance, real 15AK evidence, public output, verified preview/QA/publication
and all twelve V1 criteria remain active and incomplete.

Prior local M4 checkpoint (2026-10-05): M4-C1 adds private OEM/reference source intake, immutable
exact-SKU/manufacturer/number bindings and stricter disposable pristine checks. Original OEM rows,
public facts and compatibility remain unchanged; source eligibility is not confirmation or fitment.
All 19 embedded suites/972 assertions, complete public-type/source parity, the existing media
rehearsal and a rollback-only OEM rehearsal with four real 15AK identities plus one created synthetic
draft pass. The [C1 record](operations/product-intelligence-console-milestone-4.md#m4-c1-oem-reference-source-foundation)
and [source decision](../knowledge-base/decisions/2026-10-05-console-m4-oem-source-intake.md) retain the
exact limits. No application command/UI, current OEM revision, human approval, retained/hosted write,
native migration or publication is added. OEM proposals/review/workbench, packaging/documents,
governed public output, preview/QA and the real pilot remain open. Next implement OEM revisions and
human review within M4-C. The pending B11-B16 CI-only question does not cover this new C1 batch;
do not silently expand any later response. Full V1 remains active and incomplete.

Prior local M4 checkpoint (2026-10-05): B16 prepares native disposable media source/propose/submit/
APPROVE/EDIT/REJECT acceptance, exact original observations, actor/signature/role refusals,
PostgreSQL-observed receipt/fresh-approval contention and strict retained-source/no-publication
counts. Random observer provisioning is guarded by a fresh full pristine check, stdin-only SQL,
runtime-only configuration and exact-ID disable on success/failure; no actual key is provisioned.
Six provisioning, seven server and eight target guard groups pass, along with read/command/
inspector regressions, 18 embedded suites/892 assertions, type contracts, TypeScript/lint and fresh
real no-provider production browser smoke. The restricted SWC build failed on Windows path access;
ordinary local permissions passed without weakening the probe, and the owned server was stopped.
The B16 review follow-up adds a rollback-only sequential media rehearsal through the actual domain
parser, Node signer and SQL wrappers: five revisions, exact history/counts, refusal/revocation,
key disable, zero publication and exact 17-table rollback parity pass. Synthetic evidence dates
use the execution UTC date rather than a future local-calendar fixture. Simulated JWT actors and
Storage metadata do not prove native Auth, original byte inspection or concurrency.
The [B16 record](operations/product-intelligence-console-milestone-4.md#m4-b16-disposable-media-acceptance-preparation)
and [disposable acceptance decision](../knowledge-base/decisions/2026-10-05-console-m4-disposable-media-acceptance.md)
distinguish prepared scenarios from execution. Fresh native/CLI/Auth/PostgREST/Storage/race acceptance
remains unrun. No retained/hosted write, active setting, new schema/public/canonical fact, commit/
push, merge or deployment occurred. The earlier unanswered B11-B13-only question is now replaced
by a pending exact B11-B16 CI-only question; no new approval is inferred. Next obtain that approval
and run the prepared native gate, then real 15AK image/
rights/match evidence. Activation/publication, supporting records, verified preview/QA, governed
public media output and all twelve V1 criteria remain incomplete. Preserve the existing Docker data.

Local M4-B15 checkpoint (2026-10-04): B15 connects counted exact-SKU originals, mappings, all
related evidence and paginated history to a usable local editor/reviewer workbench. Source entry,
propose, submit and APPROVE/EDIT/REJECT controls retain independent roles, frozen pending snapshots,
exact original observation, separate rights/match evidence and explicit human acknowledgements.
Seven read/domain groups and fourteen synthetic browser groups across six widths pass; current
validity is distinguished from matching recorded observation and private output remains blocked.
Existing 18 embedded suites/892 assertions, public-type/source parity, inspector/command and old
original UI regressions pass. TypeScript, lint, fresh production build, compiled middleware and real
unavailable-provider/disabled-feature browser smoke pass. The
[B15 record](operations/product-intelligence-console-milestone-4.md#m4-b15-sku-media-mapping-workbench)
and [workbench decision](../knowledge-base/decisions/2026-10-04-console-m4-media-mapping-workbench.md)
retain exact scope, screenshot evidence and native/provider acceptance limitations. No commit/push,
actual key, active flag, retained/hosted write or public/canonical data change occurred. Pending
B11-B13-only CI permission is not extended to B14/B15. Next prepare and obtain fresh authorized
disposable native/Auth/PostgREST/Storage/concurrency acceptance, then owner-supplied exact 15AK
image/right/match evidence. Supporting records, public output, verified preview/QA/publication and
all twelve V1 criteria remain incomplete; synthetic UI results are not real pilot approval.

Local M4-B14 checkpoint (2026-10-04): B14 connects exact source/proposal/submission/review command
contracts and prepares authenticated SQL wrappers with a mandatory short-lived server observation
for application approval. The original inspector processes unchanged private bytes and rechecks the
exact actor/adoption/candidate/original snapshot before signing; database HMAC verification, nonce
uniqueness and atomic receipts remain independent from human rights/match confirmation. All 18
embedded suites/892 assertions, official public-type/source parity, Node/pgcrypto HMAC parity,
11 inspector groups and five media-command groups pass. TypeScript/lint, a fresh production build
and actual unavailable-provider/disabled-observation browser smoke pass. The
[B14 record](operations/product-intelligence-console-milestone-4.md#m4-b14-observed-media-review-commands)
and [observation decision](../knowledge-base/decisions/2026-10-04-console-m4-observed-media-commands.md)
retain unapplied/default-off scope, empty real key configuration and private-output boundaries.
No commit/push, key provisioning, retained/hosted migration, active flag or canonical/public fact
change occurred. The pending B11-B13 CI-only question does not authorize B14. Native/provider/race
acceptance, counted effective review reads, explicit human controls, real 15AK evidence, supporting
records, verified preview/QA/publication and full V1 remain open. Inspection is not rights, product
match, public image eligibility or completion of the twelve criteria.

Local M4-B13 checkpoint (2026-10-04): B13 implements private exact-SKU media APPROVE/EDIT/REJECT,
immutable decision events, current/effective mappings and open/invalid approval readiness guards.
All 17 embedded suites/831 assertions and complete official public-type/source parity pass; all
four actual 15AK identities refuse reference-only approval with original rows and zero decisions/
publication retained. Existing readiness columns/dashboard contracts are preserved. TypeScript,
lint, fresh production build and real unavailable-provider browser smoke pass. The
[B13 record](operations/product-intelligence-console-milestone-4.md#m4-b13-exact-sku-media-mapping-review)
and [review decision](../knowledge-base/decisions/2026-10-04-console-m4-media-mapping-review.md) retain
human declaration versus actual-byte evidence and private reviewed-original versus public output
boundaries. Commands/UI and actual-byte observation binding are not exposed; native/provider/
concurrency acceptance remains unrun. No commit/push, retained/hosted migration, active flag or
canonical/public fact change occurred. New-batch submission needs separate authorization. Usable
owner media review, real 15AK evidence, supporting records, verified preview/QA/publication and full
V1 remain incomplete; private SQL and synthetic decisions do not close the twelve criteria.

Local M4-B12 checkpoint (2026-10-04): B12 prepares immutable exact-SKU/role/slot media mapping
drafts, separate source links, current-digest submission and an open-proposal lifecycle guard.
All 16 embedded suites/722 assertions, complete official public-type parity, two exact 17-table
replays and four synthetic pending proposals using actual 15AK identities preserve original rows
with zero approval/publication. Migration/report/type contracts, TypeScript, lint and a fresh
production build with real unavailable-provider browser smoke pass. The
[B12 record](operations/product-intelligence-console-milestone-4.md#m4-b12-immutable-media-mapping-draft-foundation)
and [mapping decision](../knowledge-base/decisions/2026-10-04-console-m4-media-mapping-drafts.md)
retain the metadata-versus-bytes, private proposal and independent human-review boundaries. This
is local schema preparation only, not complete readiness/dashboard integration, effective mapping
or human APPROVE/EDIT/REJECT. No retained/hosted schema, active flag or public data changed. Existing
B1-B10 approval and the pending B11-only submission question do not authorize a B12 push. Native/
provider/concurrency acceptance, owner UI, real 15AK evidence and full V1 remain outstanding.

Local M4-B11 checkpoint (2026-10-04): B11 adds authenticated stored-original inspection,
unchanged-byte download and bounded zoom before later human media approval. Eight mocked-SDK
groups, original-file/upload regressions, five synthetic browser groups at six widths, production
default-off private HTTP, TypeScript, lint and public SEO/performance regressions pass. The full
session HTTP smoke cannot pass without the currently unavailable local Auth provider; it was not
weakened or rerun over retained data. New real-provider acceptance is prepared, not executed. See
the [B11 record](operations/product-intelligence-console-milestone-4.md#m4-b11-private-stored-original-inspection).
This batch remains local/unsubmitted, with no schema/data/approval/active-flag change. The replayed
B1-B10 authorization is already fulfilled and does not authorize the new B11 push. Preserve the
completed Docker recovery and retained stack. Full media mapping/review and V1 remain incomplete.

Accepted M4 B1-B10 checkpoint (2026-09-28): reviewed candidate `c4d7b703` passed both jobs in
[CI run 36411029604](https://github.com/18803076512/arcfort-website/actions/runs/36411029604).
The authorized compatibility/media-original/cookie/acceptance batch passes native 15-suite /
630-assertion SQL, complete type parity, exact source replay, Auth/RLS, actual Storage byte
readback and 24 real database-backed browser scenarios, including revocation and retention.
The isolated submission gate is **PASS_WITH_WARNINGS**, not completed M4 or release approval.
The [dated acceptance](operations/product-intelligence-console-milestone-4.md#september-28-isolated-ci-acceptance)
supersedes the pending CI checkpoints below for this submitted scope. No retained/hosted migration,
active flag, merge, deployment, canonical product change or publication occurred. Next complete
immutable SKU media mapping and human rights/match review; real 15AK evidence, supporting records,
verified preview/QA/publication and full V1 remain open. Do not reset adopted data or reopen Docker
repair to repeat a disposable CI test.

M4 update (2026-09-24): the local read-only media inspection workbench is implemented with SKU
coverage, asset filters, incomplete-approval/missing-view indicators and recorded-hash duplicate
checks. Offline/query-transport, synthetic responsive UI and public-site regressions pass. Fresh
real Auth/RLS/PostgREST CI is still required for this candidate; no M4 push/merge/deployment or
database mutation is implied by the earlier M3 authorization. The
[M4 record](operations/product-intelligence-console-milestone-4.md) retains this boundary and the
remaining compatibility/media commands, OEM/packaging/documents and full acceptance scope.
M4, full V1 and the real 15AK pilot are not complete.

M4-B1 update (2026-09-24): exact-SKU compatibility source intake and immutable endpoint/source
bindings are prepared locally in migration 10, with 79 new embedded SQL assertions (325 total)
and preservation checks for all four real reference relationships. No database migration was
applied outside the in-memory test; no public command/UI or real confirmation is enabled. The
[evidence decision](../knowledge-base/decisions/2026-09-24-console-m4-compatibility-evidence.md)
separates source eligibility from human approval. Relationship revisions/review, media commands,
supporting records, fresh full-stack CI and the complete real-data pilot remain required.

M4-B2 update (2026-09-25): migration 11 prepares compatibility proposal/current-head history,
submitted-digest APPROVE/EDIT/REJECT and current/open readiness integration. All 417 embedded SQL
assertions pass, including 92 review checks and proposals against the four actual 15AK references
without changing their original rows or confirming fit. The
[revision decision](../knowledge-base/decisions/2026-09-25-console-m4-compatibility-revisions.md)
records the stronger readiness rule: a historical/current approval cannot hide a new unconfirmed
relationship. No local retained/hosted migration, public command grant or UI integration occurred.
Owner-facing compatibility editing, media commands, OEM/packaging/documents, full-stack CI and the
real evidence/preview/QA/publication pilot remain required; private SQL is not completed V1.

M4-B3 update (2026-09-25): five compatibility command contracts now connect the existing same-origin
handler to authenticated SQL wrappers prepared in migration 12. A separate default-off local-only
flag prevents implicit activation by M3 settings. All 448 embedded assertions, six new synthetic
transport groups and eight existing command groups pass. The
[command decision](../knowledge-base/decisions/2026-09-25-console-m4-compatibility-commands.md)
separates web configuration from database authorization. No active setting, retained/hosted schema
or public product data changed. Current/source/history reads, owner UI and real full-stack
acceptance are still required before this becomes a usable compatibility workflow.

M4-B4 update (2026-09-26): the SKU-scoped compatibility route, counted current/source/history reads,
target search and owner comparison/editor are implemented locally behind the unchanged default-off
flag. Four read groups and eleven synthetic browser groups / eighteen screenshots pass, alongside
existing editor/media regressions and 448 embedded SQL assertions. The
[workbench decision](../knowledge-base/decisions/2026-09-26-console-m4-compatibility-workbench.md)
separates UI/source-intake feedback from authoritative approval. Real Auth/PostgREST/persistence,
concurrency and fresh CI remain unproven for this candidate. No retained/hosted database, canonical
fact, public route or active flag changed. Media mutations, supporting records and the real 15AK
verified preview/QA/publication workflow remain required; synthetic UI is not completed V1.

M4-B5 preparation (2026-09-26): the pristine isolated runner now includes compatibility API and
browser scenarios, explicit test-server opt-in, additional existing-work refusal checks and exact
retention of original compatibility/source rows. Thirteen guard groups and the existing 448 embedded
SQL assertions pass. The actual Auth/PostgREST/concurrent/browser sequence has not run; CI-only
submission of the current M4 candidate requires its own authorization. See the
[preparation record](operations/product-intelligence-console-milestone-4.md#m4-b5-isolated-acceptance-preparation).
No active configuration, retained data, real evidence or public source changed.

M4-B6 preparation (2026-09-26): migration 13 adds immutable media source bindings to the exact SKU,
asset, role and separate usage-rights/product-match dimension. All 528 embedded assertions pass,
including 80 new checks, public-schema type parity and two 17-table replays. Four synthetic source
intakes against actual imported 15AK identities preserve all original images/mappings and produce
no approval or publication. The
[media evidence decision](../knowledge-base/decisions/2026-09-26-console-m4-media-evidence.md)
distinguishes declared metadata from byte verification and human approval. No retained/hosted
migration, original upload, mapping command, review UI or active setting changed. Fresh full-stack
CI and exact submission approval remain outstanding; the pending B5 submission scope does not
include this new migration. Full media review and the real 15AK preview/QA/publication pilot remain
required, not replaced by source-intake tests.

M4-B7 preparation (2026-09-27): migration 14 adds private original upload intent/completion ledgers
and restrictive policies limited to their managed Storage namespace. A server-only validator checks
actual raster bytes and retains the original unchanged. All 598 embedded SQL assertions and six
actual byte-test groups pass; the production build retains 93 static outputs. The
[original-intake decision](../knowledge-base/decisions/2026-09-27-console-m4-original-intake.md)
separates declared metadata, input-byte validation and human approval. SQL completion remains
`not_attested`, private and blocked. No upload endpoint/UI, actual Storage round trip, retained/hosted
migration or public-data change occurred. Connect and test authenticated upload/readback before
claiming usable intake; SKU media review and the real 15AK preview/QA/publication pilot remain open.

M4-B8 preparation (2026-09-27): migration 15 and a separately disabled local-only API connect
authenticated original upload, exact byte readback and counted SKU intake history to a responsive
form. All 627 embedded SQL assertions, six byte groups, nine mocked-SDK groups, six-width synthetic
UI and actual production-build HTTP privacy checks pass. The
[upload decision](../knowledge-base/decisions/2026-09-27-console-m4-original-upload.md) retains the
distinction between observed stored bytes, SQL `not_attested` completion and human rights/match
approval. No real Auth/Storage round trip, retained/hosted migration or candidate CI is claimed.
No active flag, canonical product fact, public route or media assignment changed. Complete real
disposable upload acceptance, then immutable media review and the real 15AK preview/QA/publication
pilot; synthetic upload feedback is not completed V1.

M4-B9 correction (2026-09-27): inspection for real upload acceptance found B8's API path outside
the `/console` login-cookie scope. The endpoint now lives at `/console/originals`, with unchanged
cookie restrictions and an exact-path middleware-body-clone exemption. Actual browser cookie
delivery, installed/production matcher coverage and fresh production HTTP privacy/host checks pass.
The [replacement decision](../knowledge-base/decisions/2026-09-27-console-m4-original-cookie-scope.md)
supersedes B8 API placement only. No Auth/Storage persistence, schema application, active flag or
media approval is implied. Continue real disposable acceptance and the full 15AK workflow; the
twelve V1 requirements remain incomplete.

M4-B10 submission update (2026-09-28): the owner explicitly authorized the current M4 compatibility,
media/originals, cookie correction and real isolated acceptance batch for review, commit and push
to `18803076512/arcfort-website` / `codex/v2-industrial-brand-system`, for isolated CI only. This
replaces the unanswered B5-only scope; no merge, deployment, hosted change or retained-stack
migration/reset/import/switch is included. Real unmocked original-upload/Storage acceptance is
prepared with >10 MiB transport, byte retention, retries, role/revocation and source preservation.
Fourteen local target/server guard groups and fresh embedded 15-suite/627-assertion checks pass;
actual candidate CI is pending. See the [B10 record](operations/product-intelligence-console-milestone-4.md#m4-b10-real-original-acceptance-and-authorized-ci).
Do not classify prepared assertions as real-provider evidence or mark V1 complete.

B10 first CI result: `f366ad16` / run `36359590258` passed the complete quality job but stopped in
the original-intake SQL fixture on Supabase's raw metadata deletion protection. The fixture now
models the platform guard and confines its RLS operation probe to a rollback-only function-local
setting; runtime policies/protection are unchanged. Fresh embedded SQL passes 630 assertions and
type/source parity. Native SQL and real browser/Storage acceptance remain pending on the corrected
candidate. Do not rerun against retained data.

The `9157f8d7` rerun rejected that service-owned parameter even in the SQL fixture. The probe is
removed, without an added grant: SQL now verifies raw-delete refusal/retention, while actual API
acceptance verifies managed-original retention and successful ordinary synthetic-object deletion.
Fresh embedded 630-assertion/type/source checks still pass. Refer to the latest M4 runbook section
for the native CI result; neither earlier failed run is acceptance evidence.

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

Windows environment update (2026-09-18): after a new boot exposed disabled VirtualMachinePlatform,
the owner approved only that component's re-enable without automatic reboot. A later actual boot,
active hypervisor, ordinary Docker startup and read-only retention of all original data/archives
passed at 11:57:43 UTC. The [recovery record](../knowledge-base/technical/docker-desktop-recovery.md)
owns this completed environment gate. Do not repeat installation, reset adopted data or request the
same restart again. Full V1 and real 15AK evidence remain open.

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
