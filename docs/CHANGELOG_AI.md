# ArcFort Weld AI Change Log

This append-only log records substantial Codex work so future sessions can understand what changed,
why it changed and which risks remain. Add the newest entry at the top, below this introduction. Do
not include secrets, buyer PII, private prospect data or unconfirmed claims.

## Required Entry Schema

Every substantial completed task must add one dated entry containing:

- Date
- Task
- Files Changed
- Data Changed
- SEO Impact
- Known Issues
- Reusable Knowledge Added
- Next Recommended Action

Components Changed, Visual Changes, Validation and Deployment may be added when relevant. Entries
created before this schema remain valid historical records and must not be rewritten only for
formatting consistency.

## 2026-09-02 - Milestone 1 CI Runtime Proof And Hosted Setup Handoff

**Task**

Completed reproducible validation of the committed Milestone 1 foundation, repaired two clean-CI
toolchain failures and documented the exact hosted staging setup still needed. This supersedes the
unrun-current-database status in the earlier same-day entry without rewriting that historical record.

**Files Changed**

- `package-lock.json` - narrowly repaired missing optional `@emnapi` dependency entries from the
  committed lock baseline; unrelated dependency versions were retained.
- `lib/supabase/database.types.ts` - regenerated formatting using locked Prettier `3.8.4`; no schema
  field, table, function or type semantics changed.
- `README.md`, `docs/CODEX_GOAL.md` and
  `docs/operations/product-intelligence-console-milestone-1.md` - recorded the verified CI candidate,
  separated Windows runtime failure from Linux proof and added owner-facing staging setup steps.
- `scripts/report-goal-progress.ts` and `docs/goal-progress-report.md` - replaced stale unrun-runtime
  wording with candidate-scoped evidence guidance and the hosted project as the next action.
- `knowledge-base/technical/console-validation-reproducibility.md` - retained locked-generation,
  minimal lock-repair and isolated-versus-hosted verification lessons.
- `docs/CHANGELOG_AI.md` - this record. The foundation file inventory is retained in the preceding
  Milestone 1 entries and commit `daab9f8` (59 files).

**Components And Visual Changes**

None. No public page, UI component, route, RFQ endpoint or visual asset was created, changed or removed.

**Data Changed**

No canonical product, company, technical, compatibility, media or SEO value changed. The shadow
source revision remains `f185ebc9ebba875bc59141b872780297804fef894866108fa14d65bf995fc41b`.
The progress report still distinguishes 43 structured records from zero strict verified SKUs.

**SEO Impact**

None. Public URLs, canonicals, metadata, schema, sitemap, robots and indexed content are unchanged.

**Validation**

- Committed and pushed foundation `daab9f8`, minimal lock repair `80347da` and formatter correction
  `6383171` to `codex/v2-industrial-brand-system` in PR #130.
- Run `33572913056` exposed missing optional dependencies during clean Linux `npm ci`; the next run
  `33590716692` passed quality and all 74 database tests but exposed generated-type formatting drift.
- Exact commit `6383171365fa1ae14904025789cf52ae9718c815` passed both jobs in
  [run 33591108612](https://github.com/18803076512/arcfort-website/actions/runs/33591108612).
- Direct logs prove reset from all five migrations, 74 pgTAP assertions, exact generated-type parity,
  two exact-row reconciliations across 17 imported tables and clean local-stack teardown.
- Full quality CI passed source/generated-data validation, secret scanning, RFQ and domain tests,
  lint, typecheck, production build and built link/image/snippet/performance audits.
- The documentation follow-up regenerated the goal report twice with identical output and passed
  company evidence validation, evidence-gate regression tests, focused lint, typecheck, formatting,
  `git diff --check` and a 408-file secret scan. It changes report wording only, not SQL, importer
  contracts or database fixtures.

**Known Issues**

- Milestone 1 exit remains `BLOCKED` pending a named, authorized hosted non-production Supabase
  project and exact parity replay. No project reference, CLI login or staging secrets are configured.
- The approved Docker Desktop upgrade to `4.89.0` from the official checksum-verified installer
  completed, but Windows still cannot access/rename the new `sailor-ingest.sock`. No factory reset,
  WSL removal, Windows feature change or reboot was performed. Linux CI is separate runtime proof.
- Automated Codex Security diff scanning remains unavailable as described in the previous entry;
  no automated semantic-scan pass is claimed.
- Product evidence gaps remain unchanged: no strict verified SKU, confirmed exact-SKU technical
  fact, confirmed compatibility or rights-approved exact main image. Representative company visuals
  are not factory evidence.

**Reusable Knowledge Added**

Added the validation reproducibility record and a safe owner-to-operator hosted setup handoff.
Reference-only data cannot become confirmed because infrastructure tests pass.

**Deployment**

The authorized branch push triggered successful automatic Vercel previews. The PR is not merged;
no production deployment, hosted Supabase write, provider-permission change or data-authority
cutover was made. Installing the approved Docker update changed only the local tool installation.

**Next Recommended Action**

Create and name the dedicated Supabase staging project, confirm its owner/region/plan/rollback owner,
configure credentials locally and review the migration dry-run before the authorized hosted replay.
Do not start Console Milestone 2 until staging parity is accepted.

## 2026-09-02 - Product Intelligence Milestone 1 Release-Audit Hardening

**Task**

Audited the exact uncommitted Product Intelligence Console V1 Milestone 1 candidate, closed four
fail-open or operational failure paths, reran all non-container quality gates and corrected the
documentation so the earlier 68-test runtime record is not presented as proof of the current
74-assertion working tree. This batch did not start Console UI or change the public data source.

**Files Changed**

- `lib/supabase/product-intelligence-config.ts` and
  `scripts/console/test-product-intelligence-config.ts` - restricted local writes to HTTP loopback
  destinations and retained exact project-reference matching for hosted staging.
- `lib/supabase/product-intelligence-rest.ts` and
  `scripts/console/test-product-intelligence-rest.ts` - rejected empty-filter `selectOne` and
  `update` operations so a caller cannot accidentally address an entire table.
- `scripts/console/apply-shadow-catalog.ts` - marked an import batch `FAILED` when any post-creation
  import, reconciliation or exact-parity step fails without masking the original error.
- `supabase/migrations/202608300003_product_intelligence_readiness.sql` and
  `202608310005_product_intelligence_workflow_guards.sql` - blocked readiness on unconfirmed legacy
  data, missing or unresolved technical evidence, compatibility conflicts, missing exact eligible
  main media and unapproved SEO; required at least one applicable critical field before verification;
  and aligned publisher SEO approval with RLS.
- `supabase/tests/database/product_intelligence_workflow_guards.test.sql` and
  `scripts/console/validate-product-intelligence-migrations.ts` - expanded fail-closed workflow
  coverage from 16 to 22 assertions and added static checks for the new gates.
- `package.json` and `.github/workflows/quality.yml` - added the REST guard test to the local and CI
  validation surfaces.
- `README.md`, `docs/CODEX_GOAL.md`,
  `docs/operations/product-intelligence-console-milestone-1.md`,
  `scripts/report-goal-progress.ts` and `docs/goal-progress-report.md` - separated historical runtime
  evidence from the current candidate and made fresh local replay the first next action.

**Components Changed**

- No public page, component, route, RFQ endpoint or browser bundle behavior changed.

**Data Changed**

- No canonical product, company, technical, compatibility, media or public SEO value changed.
- The deterministic shadow projection still contains 43 products and the same source revision
  `f185ebc9ebba875bc59141b872780297804fef894866108fa14d65bf995fc41b`.
- Two consecutive generations retained SHA-256
  `4D98BC4678F6C75FAF03D03BD569CAB3B1170276333C1F4C794456F1201909F7`.

**SEO Impact**

- No public URL, canonical, metadata, schema, sitemap, robots rule or indexable content changed.
- Shadow database readiness now requires an approved or published SEO record instead of treating a
  generated shadow record as publication approval.

**Validation**

- Console domain, destination, REST, migration and shadow validators passed; five migrations and 28
  governed tables were checked statically.
- Company evidence, product CSV, image, series, compatibility, technical, RFQ, promotion, search and
  SEO tests passed with only the already-governed media/evidence warnings.
- Secret scanning checked 407 repository text files and found no high-confidence secret pattern.
- Focused Prettier, ESLint, TypeScript, deterministic generated-artifact checks and `git diff
--check` passed.
- Next.js `15.5.22` production build passed with 90 generated pages. Built internal-link,
  product-image evidence, snippet and performance-budget audits also passed.
- The current PostgreSQL reset, 74 declared pgTAP assertions, generated-type drift check and double
  database import were not run because Docker Desktop `4.88.1` crashes before engine startup on the
  host's AF_UNIX runtime socket failure.
- Codex Security could not create a durable automated diff scan: the original Chinese path caused a
  GBK decode failure, and an equivalent ASCII-path working copy was incorrectly rejected as a bare or
  unresolved worktree before a `scanId` was created. Manual trust-boundary review and repository
  secret scanning were completed, but automated semantic-scan coverage remains unavailable.

**Known Issues**

- `$release-qa` status is `BLOCKED` because applicable database tests for the exact current candidate
  are unrun. No local commit was created.
- A named, authorized hosted non-production Supabase project and exact staging parity are still
  required before Milestone 2.
- Product and company evidence gaps remain unchanged: zero strict verified SKUs, zero confirmed
  compatibility relationships, zero confirmed exact-SKU technical facts, and zero rights-approved
  exact main product images.

**Reusable Knowledge Added**

- Recorded destination-label bypass, empty-filter mutation, incomplete-batch status, vacuous critical
  verification and shadow-SEO approval as required regression cases for later Console work.
- Recorded that historical database evidence is candidate-specific and cannot validate later SQL or
  test edits.

**Deployment**

- None. No commit, push, merge, hosted database write, public deployment or provider setting changed.

**Next Recommended Action**

- Restore a Docker-compatible local runtime, then run database reset, all 74 pgTAP assertions,
  generated-type drift validation and two exact-row shadow imports for this same candidate before
  creating the local Milestone 1 commit.

## 2026-09-01 - Company Evidence Governance And Goal Progress Baseline

**Task**

Added fail-closed company-claim and company-media governance, recorded durable company, search and
RFQ operating baselines, and generated a deterministic Goal progress report for the 100, 300, 500
and 1,000 verified-SKU milestones. This batch improves evidence control without publishing new
claims or starting Product Intelligence Console Milestone 2.

**Files Changed**

- `data/evidence/company-claims.csv` and `data/assets/company-media-assets.csv` - created canonical
  claim and company-media evidence registries.
- `scripts/company-evidence-utils.ts`, `scripts/validate-company-evidence.ts` and
  `scripts/test-company-evidence.ts` - added governed parsing, fail-closed validation and negative
  evidence-state tests.
- `scripts/report-goal-progress.ts` and `docs/goal-progress-report.md` - added a deterministic Goal
  baseline report and milestone-gap calculations.
- `knowledge-base/company/company-profile-evidence.md`,
  `knowledge-base/seo/search-console-baseline.md` and
  `knowledge-base/sales/rfq-delivery-and-qualification.md` - retained reusable operating evidence
  outside chat history.
- `AGENTS.md`, `docs/CODEX_GOAL.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md` and `README.md` -
  documented the new sources of truth, publication gates and operating commands.
- `package.json` and `.github/workflows/quality.yml` - added company-evidence validation, negative
  tests and Goal-report drift detection to the local and CI workflows.

**Components Changed**

- No public component, page, route or RFQ behavior changed.

**Data Changed**

- Registered 22 company claims: 16 Level A confirmed claims are approved and six unsupported claim
  topics remain explicitly blocked.
- Registered three current site visuals as representative legacy references; none is approved as
  real company, factory, production, inspection, packing or shipment evidence.
- Recorded the current structured baseline: 43 products, zero strict verified SKUs, 15 governed
  technical facts with zero confirmed values, four reference relationships with zero confirmed
  relationships, 46 product-image assets with zero search-eligible exact main images, and 589 series
  component facts including 14 unresolved conflicts.

**SEO Impact**

- No public URL, canonical, metadata, schema, sitemap, robots rule or indexable content changed.
- Preserved the Search Console baseline of eight clicks, 422 impressions and 1.90% CTR for
  2026-06-26 through 2026-08-09 as evidence for later acquisition decisions.

**Validation**

- Company evidence validation passed with expected warnings for three representative-only visuals.
- Negative evidence tests passed and proved that weak-source claims, generated company visuals,
  unresolved conflicts and duplicate claim IDs fail closed.
- Product validation, canonical image-asset validation, Console domain/config/migration validation,
  deterministic shadow validation, Goal-report determinism, Prettier, ESLint, TypeScript, secret
  scanning, `git diff --check` and the Next.js production build passed. The build generated 90 pages.

**Known Issues**

- Product Intelligence Console Milestone 1 still requires exact-parity replay in a named,
  authorized hosted non-production Supabase project before Milestone 2 may begin.
- The local Docker Desktop engine currently returns HTTP 500 after a Windows/WSL socket failure, so
  the final local generated-database-type drift rerun could not be repeated in this batch. Previous
  clean local migration, pgTAP and generated-type evidence remains recorded.
- Forty-three legacy product-image references still require usage-rights review, two duplicate image
  content groups remain, and no exact main product image is search eligible.
- No technical fact, compatibility relationship or company/factory image has yet passed its strict
  publication gate. Owner-side RFQ inbox delivery, credential rotation, GA4 and Search Console
  sitemap evidence also remain unconfirmed.

**Reusable Knowledge Added**

- Added canonical company-claim and company-media registries, durable company/SEO/RFQ evidence
  notes, and a reproducible Goal progress report suitable for CI drift checks.

**Deployment**

- None. No hosted database, public website, provider account or production configuration changed.

**Next Recommended Action**

- Authorize a dedicated hosted non-production Supabase project for Milestone 1 parity replay, then
  collect Level A 15AK technical evidence and rights-cleared exact product/company photography.

## 2026-08-31 - Product Intelligence Local Runtime And Idempotent Import Proof

**Task**

Installed and stabilized the local Docker/WSL runtime, executed the complete Supabase Milestone 1
schema, corrected runtime-only import and authorization defects, generated official database types
and proved the deterministic shadow import can reconcile twice with exact source-field parity.

**Files Changed**

- `scripts/console/build-shadow-catalog.ts` and `validate-shadow-catalog.ts` - deduplicated identical
  technical-evidence links, rejected duplicate composite links and validated SEO product subjects.
- `scripts/console/apply-local-shadow-catalog.ts` - replaced the Windows shell wrapper with a direct,
  argument-safe Node invocation of the pinned Supabase CLI.
- `lib/domain/catalog/shadow-catalog.ts` - aligned shadow SEO records with the database
  `entity_type` contract.
- `lib/supabase/product-intelligence-rest.ts` - accepted successful empty PostgREST responses and
  used a TypeScript-compatible explicit class field; added paginated reads and filtered updates for
  exact import reconciliation.
- `lib/domain/catalog/shadow-parity.ts` and `scripts/console/apply-shadow-catalog.ts` - added
  deterministic per-row, per-source-field parity across all 17 imported tables and fail-closed batch
  status when destination drift is detected.
- `scripts/console/sync-database-types.ts`, `package.json` and `.github/workflows/quality.yml` - added
  generated-type drift detection and made CI prove two consecutive exact-parity imports.
- `lib/supabase/product-intelligence-config.ts`, `.env.example` and
  `scripts/console/test-product-intelligence-config.ts` - required the authorized staging project
  reference to match the direct HTTPS destination before a hosted shadow write can begin.
- `lib/supabase/database.types.ts` - generated the full TypeScript schema from the verified local
  PostgreSQL database.
- `supabase/migrations/202608300002_product_intelligence_security.sql`,
  `202608300003_product_intelligence_readiness.sql` and
  `202608310005_product_intelligence_workflow_guards.sql` - supported current JSON JWT claims,
  corrected enum reconciliation and allowed controlled service-role lifecycle validation.
- `supabase/tests/database/` - strengthened immutable-evidence coverage and added the service-job,
  JWT-claims, reconciliation and idempotent-upsert permission tests.
- `supabase/product-catalog-schema.sql`, `docs/supabase-product-catalog-setup.md` and
  `docs/product-data-workflow.md` - fail-closed the superseded schema prototype and redirected old
  setup instructions to the versioned Product Intelligence migrations.
- `.gitignore`, `README.md`, `docs/CODEX_GOAL.md` and this operations runbook - recorded the verified
  local state and retained hosted parity gate.

**Components Changed**

- No public component, page or route changed. Milestone 2 Console UI was not started.

**Data Changed**

- Created only an isolated local shadow database. It contains 43 products, 604 technical values,
  617 technical-evidence links, 43 SEO rows and 46 media rows for the deterministic source revision.
- Preserved all 14 `DATA_CONFLICT` facts and zero confirmed technical, compatibility or
  search-eligible media states. Canonical repository data and the public website remain unchanged.

**SEO Impact**

- None. No public URL, metadata, schema, canonical, sitemap, robots rule or indexable content changed.

**Validation**

- Docker Desktop `4.88.1`, Engine `29.7.2` and WSL `2.7.12.0` ran the isolated local stack.
- `supabase db reset --local` applied all five migrations and seed data successfully.
- Five pgTAP files passed all 68 schema, RLS, lifecycle, workflow and service-job tests.
- The complete shadow import reconciled twice at revision `f185ebc9ebba`, comparing all governed
  source fields across 17 imported tables and proving current-baseline idempotency.
- A synthetic unexpected SEO row passed aggregate reconciliation but was rejected by exact-row
  parity; the importer exited non-zero and marked the batch `FAILED`. A clean reset and two imports
  then passed again.
- The deprecated schema draft failed closed and created no legacy product table.
- Generated database types match the clean migrated schema through the automated drift check.
- Catalog-domain, static migration, deterministic shadow, ESLint, TypeScript, secret scan and the
  Next.js production build all pass; the build generated 90 pages.

**Known Issues**

- The full Milestone 1 exit remains blocked until this batch is reviewed/committed and the exact
  snapshot reconciles in a named, dedicated hosted non-production Supabase project.
- Windows build `26200` currently needs Docker AI/inference disabled on this workstation because of
  an upstream AF_UNIX socket failure. Renamed stale socket directories were retained outside the
  repository and were not deleted.
- Existing product evidence blockers remain unchanged: zero confirmed technical facts, zero
  confirmed compatibility and zero search-eligible exact-product media.

**Reusable Knowledge Added**

- PostgREST service jobs must read `request.jwt.claims` as well as the legacy single-role setting.
- Shadow link tables require deterministic composite-key deduplication before PostgREST upsert.
- Importers must prove both clean first-run reconciliation and a second idempotent run.
- Aggregate counts are insufficient migration evidence; imported source columns need deterministic
  multiset parity so status changes, duplicates and unexpected rows cannot hide behind equal counts.
- A staging label is not destination evidence; guarded writes must also match the exact authorized
  project reference to the direct service hostname.
- Superseded executable database drafts must remain fail-closed and cannot coexist as an alternate
  installation path beside the governed migration chain.

**Deployment**

- Local development only. No hosted Supabase, production database, website deployment, DNS or
  provider configuration was changed.

**Next Recommended Action**

- Review and commit this batch, then name and explicitly authorize one dedicated Supabase staging
  project for dry-run, migration replay, pgTAP and shadow reconciliation parity.

## 2026-08-31 - Product Intelligence Console V1 Milestone 1 Repository Foundation

**Task**

Implemented the approved D0-D7 Milestone 1 data foundation for Product Intelligence Console V1.
Added a versioned Supabase schema, human verification and lifecycle guards, versioned release QA,
forced RLS, private evidence storage policies, a deterministic repository-to-database shadow
projection, guarded import and reconciliation tooling, database tests and CI coverage. The existing
repository remains canonical and the public website continues to use its current static product
adapters.

**Files Changed**

- `supabase/config.toml`, `supabase/seed.sql`, `supabase/migrations/` and `supabase/tests/database/`
  - added the local database configuration, 28-table governed schema, five
    security/readiness/storage/workflow migrations and pgTAP schema, lifecycle, RLS and workflow
    tests.
- `lib/domain/catalog/` - added lifecycle, verification and deterministic shadow-catalog domain
  logic.
- `lib/supabase/` - added the Milestone 1 import contract, guarded environment configuration and
  server-only REST transport.
- `scripts/console/` - added shadow generation, validation, guarded apply/reconciliation, local
  apply, domain tests and static migration validation.
- `generated/console/product-intelligence-shadow-v1.json` - added the deterministic, private
  repository shadow snapshot.
- `.env.example`, `.gitignore`, `package.json`, `package-lock.json` and
  `.github/workflows/quality.yml` - documented isolated Product Intelligence variables, pinned the
  Supabase CLI and added local/CI validation commands.
- `docs/product-intelligence-console-v1-architecture.md`,
  `docs/operations/product-intelligence-console-milestone-1.md`, `docs/CODEX_GOAL.md`, `README.md`
  and `knowledge-base/decisions/2026-08-30-product-intelligence-console-v1-foundation.md` - recorded
  the approved decisions, authority boundary, operations, rollback and milestone exit gates.

**Components Changed**

- No public website component or route changed.
- Added backend domain modules and operational commands only; the protected Console UI remains a
  Milestone 2 concern.

**Data Changed**

- Generated a non-public shadow projection for 43 canonical CSV products, 6 categories, 10 series,
  589 component facts, 15 exact-SKU technical facts, 4 compatibility relationships and 46 governed
  media assets.
- Preserved 14 `DATA_CONFLICT` component facts, zero confirmed technical facts, zero confirmed
  compatibility relationships and zero search-eligible assets. No reference evidence was promoted.
- Did not write to a local, staging or production database and did not change canonical product,
  company, RFQ or publication data.

**SEO Impact**

- None. No public URL, canonical, metadata, schema, internal link, sitemap, robots rule or indexable
  content changed. The public site has no runtime dependency on the new database.

**Validation**

- Passed full ESLint and TypeScript checks.
- Passed product CSV, series component, technical evidence, compatibility, media asset, local image
  triage, secret, catalog-domain, migration and shadow reconciliation validations. All migration and
  pgTAP SQL files also passed PostgreSQL syntax parsing.
- Passed the production Next.js build with 90 generated pages, the built internal-link and SEO
  audits, and the existing performance budgets.
- The deterministic shadow baseline contains 43 products and source revision
  `f185ebc9ebba875bc59141b872780297804fef894866108fa14d65bf995fc41b`.
- Supabase CLI `2.116.0` parsed the project configuration. Database reset, pgTAP execution, official
  type generation and an actual shadow write were not run because this host has no Docker/Podman
  runtime and no named hosted non-production project was authorized.
- `$release-qa` result for the Milestone 1 exit is `BLOCKED`: repository checks pass, but database
  runtime and hosted shadow-parity evidence are applicable critical gates and remain unverified.

**Known Issues**

- Milestone 1 has not met its runtime exit gate until migrations and pgTAP tests pass in a real local
  stack, CLI database types are reviewed and the snapshot reconciles in a named hosted
  non-production Supabase project.
- Three SKUs remain `needs_photo`; 43 legacy public reference assets still need explicit usage-rights
  confirmation, two image groups reuse identical content, and 73 local candidates have neither
  approved website rights nor confirmed exact-product identity.
- Four legacy starter records remain in generated `lib/data/products.ts` but not in the canonical
  product CSV. They remain draft-only and were deliberately excluded from the shadow baseline.
- The production dependency audit still reports one moderate and three high advisories in the
  existing Next.js/PostCSS/Sharp/Nanoid tree. A framework-major upgrade is outside this controlled
  data-foundation batch and must be assessed separately.

**Reusable Knowledge Added**

- The repository now has an approved shadow-authority boundary, explicit catalog lifecycle,
  field-level evidence model, compatibility evidence model, append-only audit strategy, private
  media policy and deterministic import/reconciliation contract.
- `docs/operations/product-intelligence-console-milestone-1.md` is the runbook for local and hosted
  non-production verification without exposing service-role credentials or changing the public
  catalog.

**Next Recommended Action**

- Start Docker Desktop/Podman for an isolated local Supabase run, then execute database reset,
  pgTAP tests, local shadow reconciliation and CLI type generation. After local evidence passes,
  name and authorize one dedicated hosted non-production Supabase project for the same replay.

## 2026-08-30 - Product Intelligence Console V1 Architecture Proposal

**Task**

Inspected the current website, product pipeline, evidence registries, media governance, Supabase
drafts, authentication state, deployment flow and operational checks. Produced an architecture-first
proposal for a protected Product Intelligence Console V1 and stopped before implementation as
required.

**Files Changed**

- `docs/product-intelligence-console-v1-architecture.md` - recorded the current-state audit,
  reusable systems, refactoring boundaries, proposed data model, authentication and publication
  architecture, migration/rollback plan, milestones, risks and owner decision gates.
- `docs/CODEX_GOAL.md` - added the proposal to the canonical source map without changing the current
  source-of-truth boundary.
- `docs/CHANGELOG_AI.md` - recorded this architecture milestone.

**Data Changed**

- No company, product, technical, compatibility, packaging, media, SEO or RFQ record changed.
- No database, Supabase project, authentication account, release candidate or publication state was
  created.

**SEO Impact**

- None. No public route, canonical, metadata, schema, internal link, sitemap, robots rule or
  indexable content changed.

**Known Issues**

- The current Goal Mode still prioritizes company and 15AK evidence before a database backend. The
  proposed Console V1 implementation phase requires an explicit owner decision and a dated Goal
  Mode decision before code or schema work begins.
- Supabase, console placement, authentication, authority transition, release projection, media
  storage and environment decisions remain proposals pending owner approval.
- All 43 product records remain `needs_review`; current governed technical, compatibility and media
  evidence still contains no confirmed technical fact, confirmed relationship or search-eligible
  exact-product image.
- The existing `supabase/product-catalog-schema.sql` is not sufficient for Console V1 and must not be
  applied as the approved schema.

**Reusable Knowledge Added**

- The repository now has one architecture proposal explaining how to preserve the current static
  website and evidence gates while introducing a central database, human approvals, audit history,
  private previews and immutable release snapshots.
- The proposed migration keeps repository sources canonical during shadow mode and limits the first
  authority cutover to an owner-approved 15AK scope.

**Next Recommended Action**

- Resolve decisions D0-D7 in `docs/product-intelligence-console-v1-architecture.md`, record the
  approved Goal Mode phase, then implement Milestone 1 only: versioned schema, RLS tests,
  audit/lifecycle foundations and a read-only shadow import.

## 2026-08-30 - Core Workflow Skill System

**Task**

Created seven repository-scoped ArcFort Weld workflow skills for governed product ingestion,
technical verification, compatibility mapping, product media, publication preparation, SEO
architecture and final release QA. Defined explicit handoff contracts, mutation boundaries,
approval gates and stop conditions without publishing or changing any product.

**Files Changed**

- `.agents/skills/product-data-ingestion/SKILL.md` - defined evidence-preserving ingestion for
  spreadsheets, PDFs, technical sheets, measurements and product lists.
- `.agents/skills/technical-verification/SKILL.md` - defined field-level verification statuses and
  source requirements.
- `.agents/skills/compatibility-mapping/SKILL.md` - defined governed compatibility relationships and
  evidence thresholds.
- `.agents/skills/product-media-manager/SKILL.md` - defined SKU media roles, rights, exact-match and
  geometry-protection controls.
- `.agents/skills/product-publishing/SKILL.md` - defined preparation and explicitly approved publish
  modes using only publishable verified inputs.
- `.agents/skills/seo-architecture/SKILL.md` - defined intent, URL ownership, internal linking and
  cannibalization controls.
- `.agents/skills/release-qa/SKILL.md` - defined the final `PASS`, `PASS_WITH_WARNINGS` and `BLOCKED`
  release gate.
- `docs/SKILLS_INDEX.md` - indexed skill triggers, inputs, outputs, mutation rights, publication
  rights, approval requirements and handoffs.
- `scripts/validate-core-skills.ts` and `package.json` - added a dependency-free structural skill
  validation command.
- `AGENTS.md`, `docs/CODEX_GOAL.md` and `docs/QA_CHECKLIST.md` - connected repository skills to the
  permanent workflow, canonical source map and QA selection rules.
- `docs/CHANGELOG_AI.md` - recorded this controlled setup batch.

**Data Changed**

- No company fact, product record, technical value, compatibility relationship, media assignment,
  publication status or database record changed.

**SEO Impact**

- No public URL, metadata, schema, internal link, Sitemap entry, robots rule or indexable page
  changed. The SEO skill now protects these surfaces in future architecture work.

**Known Issues**

- The optional external `skill-creator` quick validator requires PyYAML, which is not present in the
  bundled Python runtime. The repository validator covers the required frontmatter, sections,
  contracts, index links and domain-specific controls without adding a project dependency.
- The skills define controlled capabilities only; no external database connector or publishing
  transport is granted by them.

**Reusable Knowledge Added**

- Repository-local skills live under `.agents/skills/` and are invoked explicitly with
  `$skill-name` or selected automatically from precise trigger descriptions.
- Workflow ownership is now explicit: ingestion owns candidate structure, technical verification
  owns facts, compatibility mapping owns relationships, media management owns assets, SEO owns
  search architecture, publishing assembles approved inputs and release QA owns the final verdict.

**Next Recommended Action**

- Use `$product-data-ingestion` on one bounded, evidence-backed factory product sheet and keep the
  resulting records in review state; do not publish until the downstream verification, media and QA
  gates pass.

## 2026-08-30 - Permanent Repository Rules Harmonization

**Task**

Reviewed the permanent repository rules against Goal Mode and the active knowledge-base decisions.
Established one consistent pre-task reading order, document ownership model, autonomy and approval
boundary, product-data prohibition list, QA selection model and change-log contract.

**Files Changed**

- `AGENTS.md` - added Goal Mode authority, mandatory pre-task inspection, explicit document
  responsibilities, safe autonomy, approval boundaries, production safety, knowledge retention and
  the required change-log fields.
- `docs/CODEX_GOAL.md` - aligned its hierarchy with the permanent repository rules and decision
  records.
- `docs/DESIGN_SYSTEM.md` - clarified its visual-only ownership and Goal Mode reading prerequisites.
- `docs/CONTENT_RULES.md` - clarified its content/data ownership and expanded the permanent
  no-invention list.
- `docs/QA_CHECKLIST.md` - added scope-based check selection, Goal Mode/knowledge reading, duplicate
  SKU/slug gates, critical-data checks and reusable-knowledge reporting.
- `docs/CHANGELOG_AI.md` - defined the mandatory future entry schema and recorded this task.

**Data Changed**

- No company fact, product record, technical value, compatibility relationship, image state, route
  or publication status changed.

**SEO Impact**

- None. No public URL, metadata, structured data, internal link, Sitemap entry, robots rule or
  indexable content changed.

**Known Issues**

- The rules intentionally reference future company, SEO and sales knowledge-base areas that remain
  to be created in the next evidence-infrastructure phase.
- Existing historical change-log entries use earlier schemas and were left unchanged.

**Reusable Knowledge Added**

- The repository now defines where each rule belongs, what every substantial task must read, which
  actions are autonomous and which require approval, and how validation must match the changed
  surface.

**Next Recommended Action**

- Create the governed company-claim and company-media evidence registries defined in
  `docs/CODEX_GOAL.md`, then complete the existing 15AK Level A evidence intake.

## 2026-08-30 - Codex Goal Mode Initialization

**Task**

Inspected the repository architecture, product and media governance, knowledge base, SEO system,
RFQ dependencies and current evidence baseline. Added one long-term Goal Mode document that connects
future work to a verified product-data, compatibility, media, acquisition and sales-support system.

**Files Changed**

- `docs/CODEX_GOAL.md` - recorded the long-term operating goal, canonical source map, current
  evidence baseline, staged SKU milestones, infrastructure gaps, execution boundaries and next
  evidence setup phase.
- `docs/CHANGELOG_AI.md` - recorded this initialization batch.

**Components Changed**

- No public component, route, RFQ handler, data adapter or deployment setting changed.

**Data Changed**

- No company fact, product record, technical value, compatibility relationship, image assignment or
  publication status changed.
- The baseline documents 43 products, 40 active products, three drafts, zero confirmed technical
  facts, zero confirmed compatibility relationships and zero exact search-eligible product images.

**Visual Changes**

- None.

**SEO Impact**

- None. No URL, metadata, structured data, Sitemap entry, robots rule or public content changed.

**Known Issues**

- Verified product and company evidence remains the principal acquisition constraint.
- The knowledge base has no dedicated company, SEO or sales area yet.
- Company media has no canonical evidence registry.
- RFQ inbox placement, credential rotation, DMARC, GA4 conversion evidence and Search Console
  submission still require owner-side confirmation.

**Next Recommended Step**

- Build the governed company-claim and company-media registries, then complete the existing 15AK
  factory confirmation and exact-image intake before another major public-site phase.

## 2026-08-29 - P0 MIG Local Image Lineage Extension

**Task**

Extended the P0 product-image provenance audit beyond repository history by comparing the unresolved
contact-tip and MB15-nozzle assets with available local image archives. Recorded only reproducible
file-lineage evidence and kept ownership, usage-rights and exact-product gates unchanged.

**Files Changed**

- `data/assets/product-image-assets.csv` - recorded the older local source filename, file hash and
  review date for the three shared contact-tip references.
- `data/evidence/local-product-image-triage.csv` - attached the same local-lineage evidence to the
  unassigned repository contact-tip candidate.
- `knowledge-base/assets/p0-repository-image-lineage.md` - documented the local exact-hash and
  perceptual-hash method, the contact-tip match and the bounded no-match result for the nozzle set.
- `lib/data/product-image-assets.ts` and `docs/product-image-tasks.csv` - regenerated from canonical
  evidence after validation.
- `docs/CHANGELOG_AI.md` - recorded this evidence batch.

**Components Changed**

- No public component, route, RFQ handler or deployment setting changed.

**Data Changed**

- The historical contact-tip image now has a traceable local source filename (`15AK导电嘴.png`),
  750 x 750 PNG dimensions, SHA-256 fingerprint and older file timestamp.
- The three contact-tip asset records remain `unknown`, `needs_confirmation`,
  `product_family_reference` and `legacy_reference`.
- No credible external source copy was found for the MB15 gas-nozzle main or gallery images. Their
  evidence states remain unchanged.

**Visual Changes**

- None. No image file or public rendering changed.

**SEO Impact**

- None. Legacy references remain excluded from Open Graph, Product structured data and image sitemap
  projection.

**Known Issues**

- Source ownership and website-use rights for all four P0 main images remain unresolved.
- The shared contact-tip image does not prove the 0.8 mm, 1.0 mm or 1.2 mm variant.
- The gas-nozzle images do not prove exact MB15 identity.

**Next Recommended Step**

- Capture or obtain company-authorized exact-product views for the four P0 SKUs, including labels or
  controlled sample/drawing evidence, then record owner, usage basis, reviewer and date before any
  search-eligibility upgrade.

## 2026-08-29 - Product Main-Image Evidence Reconciliation

**Task**

Corrected the internal readiness language that previously treated the product CSV's
`own_photo`/`supplier_photo` workflow states as reviewed image evidence. Both product and acquisition
reports now use the canonical image asset registry to distinguish a retained public reference from
a rights-approved, exact-product, search-eligible main image.

**Files Changed**

- `scripts/product-image-readiness-utils.ts` - added one shared, evidence-complete main-image
  assessment with explicit missing controls.
- `scripts/product-image-asset-utils.ts` - allowed report callers to bind asset validation to an
  explicit product CSV instead of silently falling back to the default source.
- `scripts/test-product-image-readiness.ts` - added regression coverage for exact, legacy,
  incomplete, unregistered and missing-file states.
- `scripts/report-product-readiness.ts` and `docs/product-readiness-report.md` - reconciled CSV and
  asset-registry states and generated the active-SKU evidence gap queue.
- `scripts/report-acquisition-readiness.ts` and `docs/acquisition-readiness-report.md` - replaced
  ambiguous image readiness counts with registered-public, retained-legacy and search-eligible exact
  main-image counts.
- `package.json` and `.github/workflows/quality.yml` - added the image-readiness regression gate.
- `README.md` and `docs/QA_CHECKLIST.md` - documented the evidence boundary and required check.
- `docs/CHANGELOG_AI.md` - recorded this batch.

**Components Changed**

- No public page, route, component, RFQ handler or deployment setting changed.

**Data Changed**

- No product fact, image file, image assignment, rights state or publication state changed.
- The generated reports now state that all 40 active products retain registered legacy-reference
  main images, zero active products have search-eligible exact main images and three draft main
  images remain blocked.
- The product report lists the specific missing controls for each active SKU without upgrading any
  evidence state.

**Visual Changes**

- None on the public website.

**SEO Impact**

- No URL, metadata, structured data, sitemap entry, image path or indexation state changed.
- The corrected internal evidence counts reduce the risk of treating family-reference imagery as
  exact-product image-search evidence in a later publication decision.

**Validation**

- Product main-image classification tests passed for exact, legacy, incomplete, unregistered and
  missing-file cases.
- Product and acquisition reports regenerated from 43 products and 46 governed image assets.
- Product CSV, product-file, canonical image-asset and 73-file local-triage checks passed. The three
  existing draft-image warnings and 43 legacy-rights warnings remain intentionally visible.
- ESLint, TypeScript and the 350-file repository secret scan passed.
- Static SEO, built internal links across 80 HTML and two dynamic source pages, snippet hygiene and
  performance budgets passed.
- The Next.js production build passed with 90 generated pages.

**Known Issues**

- Zero active products currently have a rights-approved, exact-product, search-eligible main image.
- Four active main images have unknown provenance; three draft products remain blocked for dedicated
  exact-product images.
- No product data status, compatibility status or OEM status is confirmed yet.

**Next Recommended Step**

- Collect company-owned exact-product main images for the four active unknown-provenance SKUs and the
  three blocked draft SKUs, then record source, rights, exact match, reviewer and date before any
  registry upgrade.

## 2026-08-29 - Bounded Production Health Retries And DNS Evidence

**Task**

Reduced false production-health incidents by adding bounded retries for read-only live SEO and
DNS-over-HTTPS checks, while preserving final HTTP failures as blocking results. Refreshed the
non-sensitive acquisition evidence from live RFQ, SEO, security-header and public email-DNS checks.

**Files Changed**

- `scripts/live-audit-fetch.ts` - added the shared read-only retry, per-attempt timeout, response-body
  consumption and bounded backoff implementation.
- `scripts/test-live-audit-fetch.ts` - added local transport/status retry tests without contacting
  production.
- `scripts/audit-live-seo.ts` - added bounded retries, lower concurrency, retry metrics and an early
  terminal-failure budget.
- `scripts/audit-email-domain.ts` - routed DNS-over-HTTPS checks through the same retry boundary.
- `package.json` and `.github/workflows/quality.yml` - added `test:live-audit` and its CI gate.
- `docs/operations/acquisition-production-evidence.json`,
  `scripts/report-acquisition-readiness.ts` and `docs/acquisition-readiness-report.md` - recorded and
  projected the 2026-08-29 production and sender-domain evidence.
- `README.md`, `docs/launch-checklist.md` and `docs/QA_CHECKLIST.md` - documented retry controls,
  operational limits and email-authentication review.
- `docs/CHANGELOG_AI.md` - recorded this batch.

**Components Changed**

- No public page, component, route, RFQ handler or deployment configuration changed.

**Data Changed**

- Recorded successful read-only checks for production RFQ readiness, 88 Sitemap URLs and required
  security headers on 2026-08-29.
- Recorded public DKIM, SPF and custom MAIL FROM MX as present.
- Recorded DMARC as confirmed missing. No DNS record was created or modified.
- Mailbox placement, Resend credential rotation, GA4, Search Console submission and image rights
  remain unconfirmed.

**Visual Changes**

- None.

**SEO Impact**

- No public metadata, canonical, structured data, Sitemap entry or indexed page changed.
- The live SEO monitor can now recover from limited network or retryable HTTP failures without
  masking a deterministic or persistent production error.

**Validation**

- Local bounded-retry tests passed for transient `503`, connection reset, response-body timeout,
  non-retryable `404`, persistent `503` and non-read-only method protection.
- Live SEO passed across 88 Sitemap URLs and 43 Sitemap images after two transient retries.
- Email-domain audit verified DKIM, SPF and custom MAIL FROM MX; DMARC remained the only DNS warning.
- Production RFQ status and live security-header checks passed without sending an inquiry or email.
- ESLint, TypeScript, the repository secret scan and the Next.js production build passed; the build
  generated 90 pages.
- Built internal links, snippet hygiene and performance budgets passed. The live SEO audit recorded
  zero terminal request failures.

**Known Issues**

- DMARC is absent at `_dmarc.arcfortweld.com` and requires an approved DNS change.
- Actual sales/buyer inbox placement and exposed Resend credential rotation remain externally
  unconfirmed.
- GA4 is inactive; Search Console HTML verification is absent and DNS-based ownership remains
  externally unconfirmed.

**Next Recommended Step**

- After operator approval, add a monitoring-mode DMARC record, rerun the email-domain audit and then
  confirm one controlled RFQ reference in both the sales and buyer-confirmation inboxes.

## 2026-08-29 - Six-Series MIG/MAG Factory Evidence Workbook

**Task**

Regenerated the private MIG/MAG factory-review workbook from the canonical series confirmation,
image-intake and conflict queues so 602 can be reviewed in the same controlled surface without
weakening its blocked catalog-identity boundary.

**Files Changed**

- `README.md` - updated the private workbook scope and current queue totals.
- `docs/operations/mig-mag-series-evidence-handoff.md` - documented the six-series workbook,
  per-series counts, 602 conflict handling and controlled return procedure.
- `knowledge-base/products/mig-mag-series-evidence-registry.md` - synchronized the long-term series
  evidence record with the refreshed workbook.
- `docs/QA_CHECKLIST.md` - added a reusable factory-review workbook reconciliation gate.
- `docs/CHANGELOG_AI.md` - recorded this batch.
- `outputs/019eb6d1-0ad6-7fd1-b285-3ffd5cf0b73d/ArcFort-Weld-MIG-MAG-Series-Evidence-Intake.xlsx`
  - refreshed the ignored local reviewer artifact; it is not tracked or published.

**Components Changed**

- No website component, route or public download changed.

**Data Changed**

- The workbook now projects six governed queues: 143 component candidates, 218 image requests and
  14 controlled source conflicts.
- Added the existing 22 602 candidates, 37 image requests and one identity conflict to the private
  reviewer surface.
- No canonical CSV value, SKU, technical fact, relationship, product image status or publication
  state changed.

**Visual Changes**

- The five-sheet workbook retains industrial-blue hierarchy, wrapped technical cells, frozen review
  headers, restrained input highlighting and visible blocked/conflict states.
- The 602 rows use the same controlled review formatting as the existing series and include a clear
  page-identity warning.

**SEO Impact**

- None. The workbook remains private and ignored. No product page, series route, metadata, structured
  data, sitemap entry or RFQ claim changed.

**Validation**

- Workbook verification passed for six series, 143 candidates, 218 image requests and 14 conflicts;
  formulas, data validation, queue totals and visible 602 blocked states were checked against the
  canonical queues.
- Series component validation passed for 589 facts, 189 candidates, 276 image requests and all seven
  confirmation/image-intake file pairs with no errors or warnings.
- Product-series evidence validation passed with ten reviewed catalog records: zero published, nine
  in evidence review and one blocked.
- Compatibility validation retained four reference-only relationships, zero confirmed
  relationships and no 602 public relationship.
- MIG/MAG RFQ and SEO audits passed; the SEO audit retained 40 indexable products, six categories and
  zero public series pages.
- ESLint, TypeScript, repository secret scanning and the Next.js production build passed. The build
  generated 90 pages.

**Known Issues**

- The workbook still contains no factory-confirmed candidate responses or approved exact-product
  images.
- The 501D/602 page-identity conflict is unresolved and 602 remains `blocked` / `DATA_CONFLICT`.
- Returned workbooks require stable-ID, field-by-field repository reconciliation; direct import is
  intentionally prohibited.

**Next Recommended Step**

- Have the factory or product owner resolve the 602 page identity with a controlled record, drawing,
  approved sample, verified reference or confirmed measurement before reviewing its component and
  image rows for SKU creation.

## 2026-08-21 - V2 Phase 7 Product Image Asset Governance

**Task**

Created a canonical product-image asset registry and evidence gate so file existence, visual match,
source, ownership, usage rights and search eligibility are reviewed separately. Existing public
images remain available through an explicit migration state while exact-product replacements are
collected.

**Files Changed**

- `data/assets/product-image-assets.csv` and `lib/data/product-image-assets.ts` - added the canonical
  46-row image evidence registry and generated runtime data.
- `scripts/product-image-asset-utils.ts`, `scripts/manage-product-image-assets.ts` and
  `scripts/report-product-image-assets.ts` - added initialization, append-only sync, generation,
  validation, file inspection, duplicate detection and readiness reporting.
- `lib/content/schemas.ts` and `lib/content/product-images.ts` - added typed asset governance and
  registry-driven display/search selectors.
- `components/content/ProductGallery.tsx`, `ProductVisual.tsx`, `ProductCard.tsx` and
  `ProductOverview.tsx` - routed product-card and detail-gallery images and alt text through the
  governed asset layer.
- `data/import/products.csv`, `lib/data/products.ts` and
  `public/images/products/tig-collet-body-reference.jpg` - replaced the unsupported cross-category
  TIG collet-body image assignment with a visibly TIG accessory-group reference while retaining an
  explicit exact-variant confirmation boundary.
- `package.json`, `.github/workflows/quality.yml` and
  `scripts/report-acquisition-readiness.ts` - added image asset commands, CI drift checks and
  acquisition-readiness counts.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md`,
  `docs/product-image-source-audit.md`, `docs/product-image-asset-report.md` and
  `knowledge-base/assets/product-image-governance.md` - documented the evidence states, replacement
  workflow, QA gate and current work queue.

**Components Changed**

- Product cards and product galleries now display only registered non-blocked assets.
- Search metadata, Product/WebPage JSON-LD and image sitemap paths continue using the existing search
  selector, now backed by the asset registry.
- No component or public route was removed.

**Data Changed**

- Registered 46 paths across 43 products: 43 migration-period public references and 3 blocked draft
  assets.
- Recorded 14 company-catalog crops, 23 local supplier-archive references and 9 assets with unknown
  original source.
- No image was labeled company-owned, exact-product, rights-approved or newly search-eligible.
- Retained two same-family duplicate-image groups for contact-tip and ceramic-cup variants; the
  unsupported cross-category MIG diffuser/TIG collet-body duplicate was removed.
- No SKU, route, technical value, compatibility claim, OEM number, certification or price changed.

**Visual Changes**

- The TIG Collet Body page now uses a TIG accessory-group reference containing visible collet-body
  components instead of the prior MIG diffuser image.
- Existing layout, CTA hierarchy, responsive grids and reference-image caption remain unchanged.

**SEO Impact**

- Product URLs, canonicals, metadata copy, structured-data shape, sitemap routes and internal links
  are unchanged.
- Existing migrated image URLs remain in search metadata to avoid an uncontrolled removal. New image
  search eligibility now requires approved rights, exact-product match, known source/owner, source
  file, reviewer and date.

**Validation**

- Product CSV validation passed for 43 products; image file checks retained the three expected
  non-blocking `needs_photo` warnings.
- Image asset validation passed for 46 assets with no errors; it reported 43 usage-rights migration
  warnings and two same-family duplicate-content groups.
- Product-series, compatibility, field-level technical evidence, product-series relationship and
  product-search checks passed.
- ESLint, TypeScript and the Next.js production build passed; 91 pages were generated.
- SEO, built internal-link, snippet-hygiene, performance-budget and repository secret checks passed.
- Playwright verified Product Center, TIG Collet Body and MIG Diffuser at 360, 390, 768, 1024, 1280
  and 1440 pixels: all 18 combinations returned 200, had one H1, no horizontal overflow and no broken
  images after forced lazy-load completion. TIG and MIG pages resolved distinct governed assets.

**Known Issues**

- No registered image has approved usage rights or exact-SKU company-owned evidence yet.
- Nine image records still have unknown original source; 35 assets are below 1000 pixels on at least
  one side and one is below 600 pixels on at least one side.
- Three draft products remain blocked pending dedicated product photos.
- Existing contact-tip and ceramic-cup variants still share same-family reference content.
- No deployment or controlled production-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Collect the 15AK company-owned image intake first, record source owner and usage approval, and
  promote only exact-product assets that pass the registry gate.

## 2026-08-21 - V2 Phase 6 Field-Level Technical Evidence And Factory Intake

**Task**

Created a field-level technical evidence layer for the four governed 15AK products and a structured
factory confirmation and company-owned image intake pack. Product specification rows now resolve
from evidence records when a governed fact exists instead of relying only on undifferentiated flat
product fields.

**Files Changed**

- `lib/content/schemas.ts`, `lib/data/product-technical-facts.ts` and
  `lib/content/product-technical-facts.ts` - added the technical-fact schema, 15 catalog-reference
  records and evidence-safe public projection.
- `content/products.ts` - uses governed technical rows for the four 15AK products while preserving
  legacy product fields as fallback for all other records.
- `data/intake/15ak-technical-confirmation.csv` and `data/intake/15ak-product-image-intake.csv` - added
  factory-return fields and 20 product photography requests without pre-filling unconfirmed results.
- `scripts/product-technical-evidence-utils.ts`, `scripts/test-product-technical-facts.ts` and
  `scripts/report-product-technical-evidence.ts` - added validation and readiness reporting.
- `package.json`, `.github/workflows/quality.yml`, `scripts/report-product-series-readiness.ts` and
  `scripts/report-acquisition-readiness.ts` - integrated the technical evidence gate into CI and
  operational reports.
- `scripts/check-secret-patterns.ts` - extended pre-commit scanning to tracked and untracked
  non-ignored repository files.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md`,
  `knowledge-base/technical/15ak-technical-evidence-workflow.md` and
  `docs/product-technical-evidence-report.md` - documented the workflow, evidence boundary and
  current readiness.

**Components Changed**

- No component was removed or structurally redesigned. Existing Specification Table and Product
  Overview components receive more precise evidence-governed rows through the product adapter.

**Data Changed**

- Added 15 field-level references for M6 0.8 mm and 1.0 mm contact tips, the 15AK tip holder and the
  three catalog nozzle profiles.
- All 15 facts remain `NEEDS_FACTORY_CONFIRMATION`; none was promoted to a confirmed ArcFort Weld
  specification.
- Added 20 company-owned photography requests covering main, functional detail, dimensional and
  packaging evidence. All remain `requested`.
- No SKU, product route, compatibility status, OEM number, price, certification or company fact was
  changed.

**Visual Changes**

- The four 15AK product pages show discrete material, wire-size, length, connection and nozzle-variant
  reference rows with explicit confirmation notes.
- Product layouts, images, CTA hierarchy and responsive structure remain unchanged.

**SEO Impact**

- Product URLs, canonical metadata, structured data, sitemap and internal links are unchanged.
- Buyer-visible technical terminology is more precise while unconfirmed values remain qualified.

**Validation**

- Technical evidence validation passed for 15 facts, 15 factory intake rows and 20 image requests
  with no errors or warnings.
- Product validation passed for 43 records; series evidence, public series relationships,
  compatibility relationships and product search tests passed.
- The product image check retained three non-blocking existing `needs_photo` warnings.
- ESLint, TypeScript and the Next.js production build passed; 91 pages were generated.
- SEO, built internal-link, snippet-hygiene and performance-budget checks passed.
- The expanded secret scan checked 287 tracked and untracked text files with no high-confidence
  finding.
- Playwright verified the four governed product pages at 360, 390, 768, 1024, 1280 and 1440 pixels:
  one H1, no horizontal overflow, all expected technical labels, visible catalog-reference notes,
  valid product WebPage schema, no unsupported Product rich-result data and no broken images.
- Manual mobile and desktop screenshot review found no overlap, clipping or CTA conflict.

**Known Issues**

- No 15AK field-level fact has exact-SKU factory, drawing, approved-sample or measurement evidence.
- No company-owned image request is approved yet; existing reviewed supplier images remain in use.
- The complete 15AK insulator, spring, swan-neck and liner matrix remains undocumented.
- No production deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Return the two 15AK intake CSV files with factory values, evidence references and company-owned
  source images, then upgrade only the records that pass the evidence gate.

## 2026-08-21 - V2 Phase 5 Compatibility Relationship Registry

**Task**

Created the canonical compatibility relationship layer and migrated the four public 15AK
product-to-series relationships out of the series record. Public series tables and product reverse
links now derive from one evidence-governed registry.

**Files Changed**

- `lib/content/schemas.ts` - added reusable relationship, entity and evidence-basis types for future
  Product, Series, Torch, Machine and OEM Reference connections.
- `lib/data/compatibility-relationships.ts` - added the four source-backed 15AK relationship records,
  confirmation requirements and internal evidence notes.
- `lib/content/compatibility.ts`, `lib/data/product-series.ts` and
  `lib/content/product-series.ts` - added evidence-safe selectors and changed public/reverse series
  relationships to use the registry.
- `scripts/test-compatibility-registry.ts`, `scripts/report-compatibility-readiness.ts`, `package.json`
  and `.github/workflows/quality.yml` - added confirmation gates, generated reporting and CI checks.
- `scripts/report-product-series-readiness.ts`, `scripts/report-acquisition-readiness.ts`,
  `docs/product-series-readiness-report.md`, `docs/compatibility-readiness-report.md` and
  `docs/acquisition-readiness-report.md` - integrated compatibility state into operational reports.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md` and
  `knowledge-base/compatibility/compatibility-registry.md` - documented the canonical source,
  confirmation gate and maintenance workflow.

**Components Changed**

- No public component was added, removed or visually redesigned.
- Existing Product Series and Product Detail components receive the same public relationship shape
  from the new registry.

**Data Changed**

- Added four product-to-series compatibility records for the two 15AK contact tips, tip holder and
  gas nozzle.
- All four remain `reference_only`, `NEEDS_FACTORY_CONFIRMATION` and buyer-confirmation required.
- No confirmed compatibility, OEM number, dimension, rating, price, certification or product
  specification was added.

**Visual Changes**

- No intentional visual change. The 15AK series table still shows four catalog-reference rows and
  the four related product pages retain one 15AK reverse link.
- Internal relationship notes are never rendered in public HTML.

**SEO Impact**

- Preserved every URL, canonical, metadata record, structured-data type, sitemap entry and internal
  link destination.
- The unpublished 24KD series route still returns 404 and remains outside the sitemap.

**Validation**

- Compatibility registry validation passed for four relationships: zero confirmed, four
  reference-only and four requiring confirmation.
- Product-series validation passed for one series and four generated public relationships.
- ESLint, TypeScript and the Next.js production build passed; 91 pages were generated.
- Playwright verified the series relationship table at 360, 768 and 1440 pixels, all four product
  reverse links, exclusion of the unrelated M6 1.2 mm tip, hidden internal notes and the unpublished
  24KD 404 response.

**Known Issues**

- No relationship has enough evidence to become `confirmed`.
- 15AK still needs the exact torch arrangement, complete component stack, connection evidence and
  company-approved image set.
- The registry does not yet contain Product-to-Torch, Product-to-Machine or OEM Reference entities;
  these must be added only from real evidence.
- No production deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Create the 15AK factory confirmation and image intake pack, then update the registry only from the
  returned drawing, sample, measurement and photo evidence.

## 2026-08-21 - V2 Phase 4 MIG/MAG Series Evidence Registry

**Task**

Converted the MIG/MAG catalog-family references from grouped page copy into a governed evidence
registry. The category page and RFQ builder now distinguish 10 exact company-catalog series while
only the evidence-ready 15AK record generates a public series page.

**Files Changed**

- `lib/data/product-series-evidence.ts` - added the canonical evidence, source-page, publication,
  image and missing-data records for 15AK, 24KD, 25AK, 36KD, 40KD, 501D, 602 and ORK
  200A/350A/500A.
- `lib/content/schemas.ts` and `lib/data/product-series.ts` - linked category and public series data
  to stable evidence IDs and made the 15AK source boundary inherit from the registry.
- `content/categories.ts` and `components/content/CategoryPageTemplate.tsx` - replaced grouped manual
  series data with 10 exact evidence-driven reference families and corrected the catalog source line.
- `scripts/test-product-series-evidence.ts`, `scripts/report-product-series-readiness.ts`,
  `scripts/test-mig-rfq-builder.ts` and `package.json` - added publication-gate validation, reporting
  and exact RFQ option tests.
- `.github/workflows/quality.yml` - added series validation, relationship testing and generated-report
  drift checks to CI.
- `scripts/report-acquisition-readiness.ts`, `docs/acquisition-readiness-report.md` and
  `docs/product-series-readiness-report.md` - added catalog-series coverage and the expansion work
  queue.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md` and
  `docs/catalog-product-data-audit.md` - documented the source registry and publication gate.
- `knowledge-base/products/mig-mag-series-evidence-registry.md` and
  `knowledge-base/compatibility/mig-mag-series-publication-gate.md` - retained the reusable catalog
  evidence and compatibility decisions.

**Components Changed**

- No new public component was required; the existing category reference table and MIG/MAG RFQ
  builder now consume the governed family data.
- No component, route or buyer function was removed.

**Data Changed**

- Added 10 company-catalog series evidence records with exact PDF/catalog page references.
- Split grouped RFQ values such as 24KD/25AK and 36KD/40KD into exact series choices.
- Kept one record `published` and nine records in `evidence_review`.
- No product specification, SKU, OEM number, price, certification or confirmed compatibility value
  was added or changed.

**Visual Changes**

- The MIG/MAG category now presents one readable catalog-matrix row per exact series.
- The RFQ builder shows the selected series and its catalog-documented component scope without
  implying fit.
- Mobile and desktop layouts retain the existing industrial table and form system; no extra badges,
  card family or decorative UI was introduced.

**SEO Impact**

- Preserved every public URL, canonical, sitemap entry and structured-data type.
- Added no thin series pages: 24KD, 25AK, 36KD, 40KD, 501D, 602 and ORK records remain non-indexable
  until publication evidence passes.
- Strengthened the existing MIG/MAG category content and RFQ vocabulary with exact catalog series
  names.

**Validation**

- Series evidence validation passed for 10 records: one published and nine in evidence review.
- Product-series relationship and MIG/MAG RFQ builder tests passed.
- ESLint, TypeScript and SEO audit passed.
- Next.js production build passed and generated 91 pages.
- Playwright verified the category matrix and RFQ builder at 360, 390, 768 and 1440 pixels with no
  horizontal overflow, 10 exact family records, hidden links for unpublished series and preserved
  24KD RFQ context.

**Known Issues**

- Nine series still need canonical products, reviewed exact-product images and governed
  product-to-series relationships before public pages can be created.
- 15AK still lacks a complete insulator, spring, swan-neck and liner SKU matrix.
- Catalog evidence confirms the documented family scope, not universal compatibility.
- No production deployment or live mailbox RFQ delivery test was performed in this phase.

**Next Recommended Step**

- Complete the 15AK component matrix and image set first; then use the readiness report to build 24KD
  as the next governed public series.

## 2026-08-21 - V2 Phase 3 15AK Product Series System

**Task**

Created the first governed product-series buying path for the 15AK MIG/MAG catalog-reference group.
The page connects related products, source-backed selection cues, compatibility checks, technical
resources and a series-specific RFQ path without presenting catalog grouping as confirmed fitment.

**Files Changed**

- `lib/content/schemas.ts`, `lib/data/product-series.ts` and `lib/content/product-series.ts` - added
  reusable series, relationship, evidence and verification types plus the first governed record.
- `components/content/ProductSeriesPageTemplate.tsx`, `SeriesReferenceTable.tsx` and
  `ProductSeriesLinkBand.tsx` - added the series buying page, responsive reference table and product
  detail reverse-link component.
- `app/products/[category]/series/[series]/page.tsx` - added the static series route, metadata,
  canonical URL and supported JSON-LD.
- `components/content/CategoryPageTemplate.tsx`, `components/content/ProductDetailTemplate.tsx`,
  `app/products/[category]/[slug]/page.tsx`, `content/categories.ts` and
  `lib/content/site-navigation.ts` - connected category, product and navigation paths to the series.
- `app/sitemap.ts`, `scripts/audit-seo.ts`, `scripts/check-performance-budget.ts`,
  `scripts/report-acquisition-readiness.ts`, `scripts/test-product-series.ts` and `package.json` -
  added series discovery, reporting, performance budgets and automated governance checks.
- `README.md`, `knowledge-base/products/15ak-mig-mag-series.md` and
  `knowledge-base/compatibility/15ak-reference-mapping.md` - documented the data source, evidence
  boundary, compatibility workflow and publishing checks.
- `docs/acquisition-readiness-report.md` - regenerated the acquisition report with governed series
  coverage.

**Components Changed**

- Created `ProductSeriesPageTemplate`, `SeriesReferenceTable` and `ProductSeriesLinkBand`.
- Extended the Category and Product Detail templates with evidence-backed series links.
- No public route, product page, RFQ function or existing component was removed.

**Data Changed**

- Added one 15AK series record and four governed product relationships.
- All four relationships remain `reference_only`; the overall record remains
  `NEEDS_FACTORY_CONFIRMATION`.
- No canonical product specification, company fact, price, OEM number or confirmed compatibility
  value changed.
- The general M6 1.2 mm contact tip was deliberately excluded because its current record does not
  document the same 15AK catalog grouping.

**Visual Changes**

- Added a product-led series first screen with one primary RFQ action, reviewed imagery and a compact
  evidence-status row.
- Added a responsive product system, catalog-reference table, selection checklist, applications,
  technical resources, FAQ and final RFQ section.
- Mobile ordering now places product imagery immediately after the primary actions; desktop keeps a
  balanced text-and-image catalog composition.

**SEO Impact**

- Added one canonical, statically generated series route to the sitemap and internal navigation.
- Added BreadcrumbList, CollectionPage and FAQPage structured data supported by visible content.
- Added reverse links from all four product pages and the MIG/MAG category page.
- Product schema intentionally remains on product detail pages; no unsupported ProductGroup,
  Offer, Review or AggregateRating markup was added.

**Validation**

- Product-series governance test passed for one series and four relationships.
- Product validation passed for 43 records; the image check retained three non-blocking warnings.
- SEO, internal-link and snippet-hygiene audits passed.
- ESLint, TypeScript and the Next.js production build passed; 91 pages were generated.
- The Product Series JavaScript budget passed at 126.3 KiB against a 150 KiB limit.
- Playwright verified 360, 390, 768, 1024, 1280 and 1440 pixel layouts, reviewed images, canonical
  URL, supported JSON-LD, RFQ series context, product/category links and sitemap inclusion.

**Known Issues**

- The complete 15AK insulator, spring, swan-neck and liner SKU mapping is not yet documented.
- Exact torch arrangement and final product-to-torch compatibility still require factory, sample,
  drawing, label or verified reference-number evidence.
- More company-owned detail, dimensional, packaging and bulk-series images are needed.
- AF-PLA-RC-0011, AF-ACC-WM-0015 and AF-TIG-TS-0036 still require reviewed product images.
- No production deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Confirm the complete 15AK component matrix and obtain reviewed images, then extend the same governed
  model before starting another series.

## 2026-08-21 - V2 Phase 2 Product Presentation System

**Task**

Implemented the Phase 2 product presentation batch across Product Card, Product Grid and the
product-detail first screen. The change makes reviewed imagery, product identity, useful technical
cues and RFQ actions easier to scan while preserving product routes, source data, verification
statuses, SEO and RFQ behavior.

**Files Changed**

- `lib/content/product-presentation.ts` - added a presentation adapter that derives stable family
  labels and filters low-signal or duplicated specification fields.
- `components/content/ProductGrid.tsx`, `components/content/ProductGallery.tsx` and
  `components/content/ProductOverview.tsx` - added reusable product-grid, reviewed-gallery and
  product-first overview components.
- `components/content/ProductCard.tsx`, `components/content/ProductVisual.tsx`,
  `components/content/SpecificationTable.tsx` and `components/content/CompatibilityTable.tsx` -
  simplified product imagery, card content and technical-table presentation.
- `components/content/ProductDetailTemplate.tsx` - rebuilt the detail-page first screen, simplified
  section navigation and reused the shared related-product grid.
- `components/rfq/AddToRfqButton.tsx` - added a compact card action while preserving RFQ-list state.
- `components/content/CategoryPageTemplate.tsx`, `app/page.tsx`, `app/products/page.tsx`,
  `app/applications/[slug]/page.tsx` and `app/guides/[slug]/page.tsx` - adopted the shared Product Grid.
- `knowledge-base/decisions/2026-08-21-product-presentation-phase-2.md` - recorded product
  presentation, evidence and follow-up decisions.

**Components Changed**

- Created `ProductGrid`, `ProductGallery` and `ProductOverview`.
- Updated `ProductCard`, `ProductVisual`, `SpecificationTable`, `CompatibilityTable`,
  `ProductDetailTemplate` and `AddToRfqButton`.
- No existing component or public feature was removed.

**Data Changed**

- No canonical product, company, compatibility or commercial data changed.
- Product Name, SKU, Category and low-signal placeholders are filtered only from prominent
  presentation rows; source records remain intact.
- The product readiness report was regenerated from the existing 43 product records.

**Visual Changes**

- Product cards now use a larger square product image, a concise product-system context, SKU, up to
  two useful technical cues and one compact RFQ action.
- Product-detail first screens now show reviewed imagery beside the H1, summary, series, SKU, supply
  context and all three commercial actions before the key specification list.
- Missing technical values are grouped into one buyer-oriented disclosure instead of repeated across
  prominent page areas.
- Specification and compatibility tables use quieter divider rows with less nested framing.

**SEO Impact**

- Preserved all product and category routes, canonical URLs, metadata, structured data, sitemap and
  robots behavior.
- Preserved indexable product content and internal links while reducing repetitive UI text in
  Product Cards.
- SEO, internal-link and snippet-hygiene audits pass for 40 active products, 6 categories, 6
  applications and 17 guides.

**Validation**

- Product CSV validation passed for 43 products.
- Product image check completed with three non-blocking `needs_photo` warnings.
- Product readiness and product search checks passed.
- ESLint and TypeScript checks passed.
- Next.js production build passed and generated 90 pages.
- RFQ constraints, email rendering and provider-timeout tests passed.
- Performance budgets and tracked-secret scan passed.
- Playwright verified representative MIG/MAG, TIG, plasma and welding-equipment products at 390 and
  1440 pixels with no horizontal overflow, loaded reviewed images and available conversion actions.
  Product Card RFQ state and the mobile featured-product grid also passed.

**Known Issues**

- AF-PLA-RC-0011 Plasma Retaining Cap, AF-ACC-WM-0015 Welding Magnet and AF-TIG-TS-0036 TIG Torch
  Switch still need reviewed product images.
- Additional company-owned detail, dimension, packaging and bulk-product photography is needed for
  stronger product evidence.
- Reference-only and unverified compatibility records still require factory, sample, drawing or
  reference-number confirmation.
- No production deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Build one complete 15AK MIG/MAG series buying system after the model matrix, drawings,
  compatibility evidence and reviewed image set are available.

## 2026-08-21 - V2 Phase 1 Global Brand System And Homepage

**Task**

Implemented Phase 1 of the ArcFort Weld V2 upgrade: the global visual foundation, single-layer
Header, scalable Product Mega Menu, brand-led Homepage and simplified Footer. Existing routes,
product records, SEO infrastructure, structured data, sitemap, robots and RFQ behavior were
preserved.

**Files Changed**

- `tailwind.config.ts` and `app/globals.css` - consolidated industrial-blue tokens, accessible
  engineering-orange actions, typography, spacing, containers, buttons and reduced-motion behavior.
- `app/layout.tsx` - adopted the new global shell and removed the commercial trust strip from every
  page while retaining the mobile contact bar and structured data.
- `app/page.tsx` and `content/homepage.ts` - replaced the dense supplier-template homepage with a
  product-system, industry, cooperation, resource and RFQ hierarchy.
- `components/Header.tsx`, `components/navigation/NavigationMenu.tsx`,
  `components/navigation/ProductMegaMenu.tsx` and `lib/content/site-navigation.ts` - added the new
  desktop/mobile information architecture and data-driven product navigation.
- `components/Footer.tsx`, `components/BrandLockup.tsx`, `components/StickyContactBar.tsx` and
  `components/rfq/RfqListLink.tsx` - unified branding, contact access and CTA presentation.
- `components/home/ProductSystemCard.tsx` - added an image-led product-system card.
- `components/ui/ButtonLink.tsx`, `components/ui/Container.tsx`, `components/ui/Section.tsx` and
  `components/ui/SectionHeading.tsx` - added reusable Phase 1 layout primitives.
- `scripts/audit-snippet-hygiene.ts` - aligned snippet checks with the new global regions.
- `lib/content/site.ts` - recorded the significant homepage content update date.
- `README.md` and `docs/DESIGN_SYSTEM.md` - linked the governance documents and aligned action colors.

**Components Changed**

- Created `BrandLockup`, `NavigationMenu`, `ProductMegaMenu`, `ProductSystemCard`, `ButtonLink`,
  `Container`, `Section` and `SectionHeading`.
- Rebuilt `Header` and `Footer`.
- Updated `StickyContactBar` and `RfqListLink` typography and contrast.
- Removed `BuyerTrustStrip` from the global render path; its source file remains available and no
  user data or functionality was deleted.

**Data Changed**

- Added centralized navigation and homepage presentation data.
- No company identity, product technical specification, SKU, compatibility or commercial policy was
  changed.

**Visual Changes**

- Replaced the multi-layer utility navigation with a single restrained sticky header.
- Added a six-system product mega menu and compact mobile navigation.
- Rebuilt the homepage around product imagery, whitespace, quiet neutral bands and one restrained
  action accent.
- Simplified the footer and removed port, MOQ, payment and lead-time clutter from global navigation.
- Kept representative industrial images visibly labeled so they are not presented as company
  factory evidence.

**SEO Impact**

- Preserved published URLs, canonical metadata, Organization/WebSite/WebPage structured data,
  sitemap, robots and active product generation.
- Reorganized homepage internal links around product categories, applications, guides, company and
  RFQ paths without changing route identifiers.
- Updated snippet-hygiene rules for the new header/footer structure; the audit passes.

**Validation**

- ESLint passed with zero warnings.
- TypeScript `tsc --noEmit` passed.
- Company-profile and RFQ constraint, email-template and provider-timeout tests passed.
- Next.js production build passed and generated 90 pages.
- SEO audit passed for 40 active products, 6 categories, 6 applications and 17 guides.
- Built internal-link audit, snippet-hygiene audit, performance budget and tracked-secret scan passed.
- Playwright verified 360, 390, 1024 and 1440 pixel viewports with no horizontal overflow; H1 and
  Header bounds passed, and mobile navigation plus desktop Mega Menu opened correctly.
- Manual screenshot review confirmed hero framing, responsive line wrapping, CTA access and the
  lazy-loaded representative quality image.

**Known Issues**

- Existing `ProductCard` content density and action treatment remain for the planned Phase 2 product
  component batch.
- Representative site images are not company-factory evidence and must keep their visible labels
  until approved real company photography is supplied.
- China and international market architecture is prepared in content only; `/zh/` and `/en/` routes
  are not implemented.
- No deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- After explicit approval, begin Phase 2 with the Product Card, Product Grid and product-detail
  above-the-fold component family while preserving existing product URLs and evidence controls.

## 2026-08-21 - Permanent Repository Governance System

**Task**

Established permanent execution, design, content and QA rules for ArcFort Weld. The governance model
adds the China nationwide-brand direction while preserving international B2B acquisition, factual
evidence, product governance, RFQ, SEO, accessibility, performance and security requirements.

**Files Changed**

- `AGENTS.md` - repository mission, rule priority, workflow and non-negotiable safeguards.
- `docs/DESIGN_SYSTEM.md` - industrial brand tokens, typography, spacing, components and page patterns.
- `docs/CONTENT_RULES.md` - evidence, terminology, product/page content, market and SEO standards.
- `docs/QA_CHECKLIST.md` - visual, technical, data, SEO, mobile, RFQ and release gates.
- `docs/CHANGELOG_AI.md` - append-only major-task decision history and entry template.

**Components Changed**

- None. This task defines future component standards without changing runtime components.

**Data Changed**

- No product or company data changed.
- Added a five-state technical verification model and four-level source hierarchy as governance only.

**Visual Changes**

- None in the runtime website. The target industrial-blue palette, engineering-orange CTA accent,
  typography roles, spacing scale and component behavior are now documented.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change.
- Future redesigns must preserve all existing SEO assets and index controls.

**Validation**

- Governance coverage and cross-reference check passed for all five required files.
- Prettier check passed for all five governance files.
- Changed-file secret pattern check and repository secret scan passed.
- ESLint passed with zero warnings.
- TypeScript `tsc --noEmit` passed.
- Next.js production build passed and generated 90 pages.
- Runtime visual screenshots were not required because this task changed documentation only.

**Known Issues**

- Existing UI has not yet been audited component-by-component against the new design system.
- `/zh/` and `/en/` are architectural targets, not implemented routes.
- Product fields require migration planning before the full evidence model can be stored canonically.

**Next Recommended Step**

- Audit global design tokens, Header/Mega Menu and shared layout components against the new system,
  then implement that single global batch with desktop/mobile visual verification.

## 2026-08-21 - V2 Phase 8 24KD Series Component Evidence

**Task**

Converted the reviewed 24KD company-catalog spread into a governed field-level evidence, factory
confirmation and exact-image intake workflow. The phase deliberately created no public 24KD SKU or
series route because exact product evidence is incomplete and three complete-torch data fields
conflict with the official OEM reference.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - 68 sourced 24KD series, component and variant
  facts with three explicit source conflicts.
- `data/intake/24kd-series-confirmation.csv` - 23 candidate factory/SKU confirmation records.
- `data/intake/24kd-image-intake.csv` - 34 exact-product, technical, dimension and packaging image
  requests.
- `lib/data/product-series-component-facts.ts` - generated runtime evidence projection.
- `scripts/product-series-component-utils.ts` - CSV parsing, cross-record validation and generation.
- `scripts/manage-product-series-components.ts` - generate and generated-file drift command.
- `scripts/report-product-series-components.ts` - internal component readiness report generator.
- `scripts/report-product-series-readiness.ts` and `scripts/report-acquisition-readiness.ts` - 24KD
  component, conflict and intake counts in existing operational reports.
- `docs/product-series-component-evidence-report.md` - generated component matrix and work queue.
- `knowledge-base/products/24kd-series-evidence.md` - durable source and publication boundary.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md` and
  `docs/catalog-product-data-audit.md` - workflow, governance and audit documentation.
- `package.json` and `.github/workflows/quality.yml` - component evidence commands and CI drift gate.
- `lib/content/schemas.ts` - typed series-component fact model.
- `components/content/ProductSeriesPageTemplate.tsx` - removed the hard-coded 15AK label from the
  reusable series template.

**Components Changed**

- Updated `ProductSeriesPageTemplate` to derive the reference-group label from the current series.
- No new public 24KD component or page was created.

**Data Changed**

- Recorded 68 company-catalog field facts across 23 24KD component/variant candidates.
- Preserved company-catalog and official ABICOR BINZEL comparison values for rating, duty cycle and
  wire range as three `DATA_CONFLICT` records with `blocked` lifecycle.
- Recorded zero confirmed 24KD facts, zero canonical SKU mappings and zero approved images.

**Visual Changes**

- No visible layout or image change. The existing 15AK series text renders the same while the
  component is now safe for future series reuse.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change.
- The 24KD series remains `evidence_review`; build output still contains one public series page and
  no 24KD route.

**Validation**

- Product-series component generation, drift validation and report passed: 68 facts, 23 candidates,
  34 image requests, zero structural errors.
- Product CSV validation passed for 43 records; image check retained three known draft-image
  warnings.
- Product image registry passed with 46 assets, 43 rights-review warnings and two duplicate-content
  groups retained as known migration work.
- Product-series, public-series, compatibility and 15AK technical-evidence tests passed.
- ESLint and TypeScript passed with zero errors.
- Next.js production build passed and generated 91 pages.
- SEO audit passed for 40 active products, 6 categories, 1 public series, 6 applications and 17
  guides; built internal links, snippet hygiene, performance budget and repository secret scan also
  passed.
- `git diff --check` passed. Temporary PDF review images and the accidental local pnpm cache were
  removed.

**Known Issues**

- The exact supplied 24KD complete-torch rating, duty cycle and wire range require Level A factory or
  controlled-test evidence.
- All 23 24KD candidates still need exact identity/technical confirmation; all 34 image requests are
  still `requested`.
- No 24KD compatibility relationship, canonical SKU or public series page is ready.
- Existing site-wide image risks remain: 43 migration-period references need rights confirmation,
  two families reuse identical images and three draft products need exact photos.
- Externally exposed Resend credential rotation and real sales/buyer mailbox placement remain outside
  repository verification.

**Next Recommended Step**

- Obtain the first factory evidence pack for the 24KD complete torch, three nozzle profiles and seven
  contact-tip variants, including exact white-background images, measurements/drawings and the
  supplied-torch specification needed to resolve the three conflicts.

## 2026-08-21 - V2 Phase 9 25AK Series Component Evidence

**Task**

Converted the reviewed 25AK company-catalog spread into the governed multi-series component
evidence workflow. The workflow now discovers matching confirmation and image-intake files by
series, while keeping all unconfirmed 25AK candidates and six cross-series source conflicts outside
public product data.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added 64 sourced 25AK series, component and
  variant facts with three explicit complete-torch source conflicts.
- `data/intake/25ak-series-confirmation.csv` - added 21 exact-product factory/SKU confirmation
  candidates.
- `data/intake/25ak-image-intake.csv` - added 31 exact-product, technical, dimension, packaging and
  bulk-image requests.
- `lib/data/product-series-component-facts.ts` - regenerated the runtime evidence projection with
  24KD and 25AK facts.
- `scripts/product-series-component-utils.ts` and `scripts/manage-product-series-components.ts` -
  generalized intake discovery, pairing, series identity and path validation.
- `scripts/report-product-series-components.ts`, `scripts/report-product-series-readiness.ts` and
  `scripts/report-acquisition-readiness.ts` - replaced 24KD-only reporting with detailed-series
  summaries and work queues.
- `docs/product-series-component-evidence-report.md`, `docs/product-series-readiness-report.md` and
  `docs/acquisition-readiness-report.md` - regenerated operational status reports.
- `knowledge-base/products/25ak-series-evidence.md`, `README.md` and
  `docs/catalog-product-data-audit.md` - documented source values, conflicts and publication gates.

**Components Changed**

- None. This phase changed internal product evidence and reporting only.

**Data Changed**

- Recorded 64 field-level facts across 21 25AK component/variant candidates and 31 image requests.
- Preserved company-catalog and official ABICOR BINZEL comparison values for rating, duty cycle and
  wire range as three `DATA_CONFLICT` records with `blocked` lifecycle.
- The detailed workflow now totals 132 facts, 44 candidates, 65 image requests and six conflicts.
- Recorded zero confirmed 25AK facts, zero SKU mappings, zero compatibility relationships and zero
  approved 25AK images.

**Visual Changes**

- None. No 25AK public page, product card or product image was added.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change. The 25AK evidence record remains
  `evidence_review` and does not generate an indexable route.

**Validation**

- Multi-series component generation and drift validation passed for two paired confirmation/image
  intake files with 132 facts, 44 candidates and 65 image requests.
- Component, series and acquisition reports regenerated without structural errors.
- Full product, image, compatibility, technical, SEO, lint, type, build, performance and security
  checks are recorded after the phase QA run.

**Known Issues**

- The exact supplied 25AK complete-torch rating, duty cycle and wire range require Level A factory or
  controlled-test evidence.
- All 21 candidates still need identity and technical confirmation; all 31 image requests remain
  `requested`.
- No canonical 25AK SKU, compatibility relationship or public series page is ready.

**Next Recommended Step**

- Obtain the first 25AK factory evidence pack for the complete torch, three nozzle profiles, seven
  contact-tip variants and tip holder, including exact product images and controlled technical data.

## 2026-08-21 - V2 Phase 10 36KD Series Component Evidence

**Task**

Converted the reviewed 36KD company-catalog spread into the governed multi-series component
workflow. The phase preserved one official-reference rating conflict and one contradiction within
the company catalog instead of selecting a plausible value.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added 69 sourced 36KD facts with two explicit
  source conflicts.
- `data/intake/36kd-series-confirmation.csv` - added 24 exact-product factory/SKU candidates.
- `data/intake/36kd-image-intake.csv` - added 35 exact-product and evidence image requests.
- `lib/content/schemas.ts` and `scripts/product-series-component-utils.ts` - added governed
  `company_catalog` comparison-source support for contradictions within one company document.
- `lib/data/product-series-component-facts.ts` - regenerated the runtime projection for three
  detailed series.
- `scripts/report-product-series-components.ts`, `scripts/report-product-series-readiness.ts` and
  `scripts/report-acquisition-readiness.ts` - generalized conflict wording and included 36KD work.
- `docs/product-series-component-evidence-report.md`, `docs/product-series-readiness-report.md` and
  `docs/acquisition-readiness-report.md` - regenerated the multi-series operational reports.
- `knowledge-base/products/36kd-series-evidence.md`, `README.md`, `docs/CONTENT_RULES.md` and
  `docs/catalog-product-data-audit.md` - documented sources, internal conflict handling and the
  publication boundary.

**Components Changed**

- None. This phase changed internal evidence, validation and reporting only.

**Data Changed**

- Recorded 69 field facts across 24 36KD candidates and 35 image requests.
- Preserved 340 A CO2 / 320 A mixed gases from the company catalog and 320 A CO2 / 290 A mixed gases
  from the official OEM reference as a blocked rating conflict.
- Preserved the company's conflicting 19 mm and 20 mm cylindrical-nozzle entries as a second blocked
  conflict.
- The detailed workflow now totals 201 facts, 68 candidates, 100 image requests and eight conflicts.
- Recorded zero confirmed 36KD facts, zero SKU mappings, zero compatibility relationships and zero
  approved 36KD images.

**Visual Changes**

- None. No 36KD public page, product card or product image was added.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change. The 36KD evidence record remains
  `evidence_review` and does not generate an indexable route.

**Validation**

- Multi-series generation and structural validation passed for 201 facts, 68 candidates, 100 image
  requests and three paired intake sets.
- Full product, image, compatibility, technical, SEO, lint, type, build, RFQ, performance and
  security results are recorded after the phase QA run.

**Known Issues**

- The exact supplied 36KD complete-torch rating and cylindrical-nozzle opening require Level A
  factory, drawing, measurement or controlled-test evidence.
- All 24 candidates need exact identity and technical confirmation; all 35 image requests remain
  `requested`.
- No canonical 36KD SKU, compatibility relationship or public series page is ready.

**Next Recommended Step**

- Obtain exact 36KD evidence for the complete torch and cylindrical nozzle first, then confirm the
  remaining nozzle, contact-tip, holder and diffuser variants independently.

## 2026-08-21 - V2 Phase 11 40KD Series Component Evidence

**Task**

Converted the reviewed 40KD company-catalog spread into the governed multi-series component
workflow, retaining the complete-torch rating and duty-cycle differences from the official OEM
manual as blocked conflicts.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added 69 sourced 40KD facts with two explicit
  complete-torch conflicts.
- `data/intake/40kd-series-confirmation.csv` - added 24 exact-product factory/SKU candidates.
- `data/intake/40kd-image-intake.csv` - added 35 exact-product and evidence image requests.
- `lib/data/product-series-component-facts.ts` - regenerated the runtime projection for four
  detailed series.
- `scripts/report-acquisition-readiness.ts` and generated readiness reports - added 40KD to the
  governed work queue and aggregate counts.
- `knowledge-base/products/40kd-series-evidence.md`, `README.md` and
  `docs/catalog-product-data-audit.md` - documented sources, conflicts and publication gates.

**Components Changed**

- None. This phase changed internal product evidence and reporting only.

**Data Changed**

- Recorded 69 field facts across 24 40KD candidates and 35 image requests.
- Preserved company-catalog 380 A CO2 / 360 A mixed gases against official-reference 350 A CO2 /
  320 A mixed gases as a blocked conflict.
- Preserved company-catalog 60% duty cycle against official-reference 35% as a second blocked
  conflict.
- The detailed workflow now totals 270 facts, 92 candidates, 135 image requests and ten conflicts.
- Recorded zero confirmed 40KD facts, zero SKU mappings, zero compatibility relationships and zero
  approved 40KD images.

**Visual Changes**

- None. No 40KD public page, product card or product image was added.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change. The 40KD evidence record remains
  `evidence_review` and does not generate an indexable route.

**Validation**

- Multi-series generation and structural validation passed for 270 facts, 92 candidates, 135 image
  requests and four paired intake sets.
- Full product, image, compatibility, technical, SEO, lint, type, build, RFQ, performance and
  security results are recorded after the phase QA run.

**Known Issues**

- Exact supplied-torch rating and duty cycle require Level A factory or controlled-test evidence.
- All 24 candidates need exact identity and technical confirmation; all 35 image requests remain
  `requested`.
- No canonical 40KD SKU, compatibility relationship or public series page is ready.

**Next Recommended Step**

- Obtain exact 40KD complete-torch evidence first, then confirm the eight contact-tip variants and
  associated liner range before creating SKUs.

## 2026-08-21 - V2 Phase 12 501D Water-Cooled Series Evidence

**Task**

Converted the reviewed 501D company-catalog spread into the governed component workflow and added a
water-cooled connection boundary that prevents hose color or visual similarity from becoming a media
function or compatibility claim.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added 89 sourced 501D facts with three
  complete-torch conflicts and explicit visible-interface records.
- `data/intake/501d-series-confirmation.csv` - added 29 exact-product factory/SKU candidates.
- `data/intake/501d-image-intake.csv` - added 46 exact-product, measurement and media-connection image
  requests.
- `lib/content/schemas.ts` and `scripts/product-series-component-utils.ts` - added a governed
  `wall_thickness` field for nozzle evidence.
- `lib/data/product-series-component-facts.ts` - regenerated the runtime projection for five detailed
  series.
- `scripts/report-acquisition-readiness.ts` and generated readiness reports - added 501D to the
  aggregate work queue.
- `knowledge-base/products/501d-series-evidence.md`, `README.md`, `docs/CONTENT_RULES.md`,
  `docs/QA_CHECKLIST.md` and `docs/catalog-product-data-audit.md` - documented water-cooled interface
  evidence and publication gates.

**Components Changed**

- None. This phase changed internal evidence, validation and reporting only.

**Data Changed**

- Recorded 89 field facts across 29 501D candidates and 46 image requests.
- Preserved company-catalog and official OEM values for rating, duty cycle and wire range as three
  blocked conflicts.
- Added a rear-media connection-set candidate without assigning functions to visible colored hoses.
- The detailed workflow now totals 359 facts, 121 candidates, 181 image requests and thirteen
  conflicts.
- Recorded zero confirmed 501D facts, zero SKU mappings, zero compatibility relationships and zero
  approved 501D images.

**Visual Changes**

- None. No 501D public page, product card or product image was added.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change. The 501D evidence record remains
  `evidence_review` and does not generate an indexable route.

**Validation**

- Multi-series generation and structural validation passed for 359 facts, 121 candidates, 181 image
  requests and five paired intake sets.
- Full product, image, compatibility, technical, SEO, lint, type, build, RFQ, performance and
  security results are recorded after the phase QA run.

**Known Issues**

- Exact supplied-torch rating, duty cycle and wire range require Level A evidence.
- Coolant, gas, power and control connections need a labeled factory connection drawing.
- All 29 candidates need exact identity and technical confirmation; all 46 image requests remain
  `requested`.
- No canonical 501D SKU, compatibility relationship or public series page is ready.

**Next Recommended Step**

- Obtain the 501D torch specification and connection drawing first, then confirm nozzle wall
  variants, tip holders and the rear-media assembly before creating SKUs.

## 2026-08-21 - V2 Phase 1 Brand Presentation System

**Task**

Stabilized the global design system, Header, Product Mega Menu, mobile navigation, homepage and
Footer as the first controlled phase of the ArcFort Weld V2 national industrial brand upgrade.
Existing routes, product data, structured data, sitemap, robots rules and RFQ behavior were
preserved.

**Files Changed**

- `app/globals.css` and `tailwind.config.ts` - added aligned semantic typography, spacing, media,
  header, radius and shadow tokens plus a stable mobile Hero constraint.
- `app/page.tsx` - retained the `content/homepage.ts` data-driven structure, updated the home search
  title and consolidated the industries/applications language.
- `components/Header.tsx`, `components/navigation/ProductMegaMenu.tsx` and
  `components/navigation/MobileNavigation.tsx` - separated and stabilized desktop and mobile
  navigation behavior.
- `components/home/HomeHero.tsx` and `components/home/HomeInquiryCta.tsx` - created reusable home
  brand and qualified-inquiry sections.
- `components/Footer.tsx` - removed the repeated Footer CTA directly after the homepage final CTA
  and retained the product, cooperation, resource and contact hierarchy.
- `next.config.ts` - declared the existing `75` and `88` responsive-image quality values.
- `scripts/audit-snippet-hygiene.ts` - changed the search-snippet contract from the removed Footer
  CTA to the single homepage inquiry region.
- `README.md` and `docs/DESIGN_SYSTEM.md` - documented the V2 Phase 1 implementation boundaries and
  component map.

**Components Changed**

- Created `HomeHero`, `HomeInquiryCta` and `MobileNavigation`.
- Updated `Header`, `ProductMegaMenu` and `Footer`.
- Removed no reusable component; only the duplicate Footer CTA region was removed.

**Data Changed**

- No product, company, compatibility, technical, commercial or RFQ data changed.
- Homepage metadata title changed to `Industrial Welding & Cutting Solutions`.
- The visible section label changed from `Industry Solutions` to `Industries & Applications`.

**Visual Changes**

- Added a consistent display, section, technical-data and caption system.
- Kept one full-bleed industrial Hero image, one headline and two actions.
- Preserved image-led Product Systems and active-product-driven Featured Products.
- Removed adjacent duplicate inquiry bands between the homepage and Footer.
- Made the mobile Hero expose a clean hint of the next section without placing its title behind the
  fixed inquiry bar.

**SEO Impact**

- Preserved every URL, canonical, structured-data helper, sitemap entry and robots rule.
- Updated only the homepage search title while preserving the broad welding and cutting scope.
- Kept repetitive final-inquiry, navigation, product-card action and Footer regions protected from
  search snippets.

**Validation**

- ESLint and TypeScript passed with no errors.
- Next.js production build passed and generated 91 pages, including 40 product pages, six category
  pages, one governed series page, six applications and seventeen guides.
- SEO, 81-page built internal-link, snippet-hygiene, performance-budget and repository secret audits
  passed.
- RFQ constraints, email templates, provider timeout and all buyer-specific RFQ builders passed.
- Product, image, series, compatibility and field-level technical evidence checks passed.
- Playwright production checks passed at 360, 390, 430, 768, 1024, 1280 and 1440 CSS pixels with no
  horizontal overflow, one H1, contained navigation panels and working Escape/focus return.

**Known Issues**

- Three draft products still need exact reviewed images before publication.
- Forty-three legacy product-image references still need explicit usage-rights confirmation, and two
  duplicate-content image groups need variant-specific replacements.
- The homepage industrial and packing visuals remain clearly labeled representative visuals; real
  company-owned factory, inspection, warehouse, packing and shipment photography is still needed.
- Production deployment and a controlled live RFQ mailbox-delivery test were not performed in this
  phase.

**Next Recommended Step**

- Start V2 Phase 2 with the Product Center and Product Card family, then move through category and
  product-detail presentation without changing current URLs or evidence boundaries.

## 2026-08-21 - V2 Phase 2 Product Catalog System

**Task**

Upgraded the Product Center, product cards, six category pages and forty product-detail pages as the
second controlled V2 presentation phase. Preserved product records, evidence statuses, URLs,
structured data, sitemap, RFQ behavior and all buyer-specific RFQ builders.

**Files Changed**

- `app/products/page.tsx` - replaced repeated shortcut, policy and service-card sections with a
  product finder, image-led systems, catalog, RFQ preparation and FAQ sequence.
- `components/content/CategoryPageTemplate.tsx` - reduced the section navigation to five buyer
  paths, grouped catalog-family evidence in an expandable reference section and retained product,
  selection, RFQ-builder, application, FAQ and internal-link content.
- `components/content/ProductDetailTemplate.tsx` - removed duplicate confirmation and commercial
  policy cards while retaining evidence-safe specifications, compatibility, selection, delivery,
  applications, FAQ, related products and RFQ paths.
- `components/content/ProductCard.tsx` - made cards image-led and limited body data to SKU plus one
  useful selection cue.
- `components/content/ProductGallery.tsx` and `ProductGalleryViewer.tsx` - added governed server
  image selection and thumbnail switching for multiple eligible assets.
- `components/content/TechnicalTable.tsx`, `SpecificationTable.tsx` and
  `CompatibilityTable.tsx` - introduced one responsive technical key/value system.
- `components/content/RfqCta.tsx` - reduced the CTA to one quotation action plus email and
  WhatsApp fallbacks.
- `components/products/ProductFinderForm.tsx` - aligned the finder with shared button and surface
  styles.
- `next.config.ts` - allowed the product-gallery quality value used by Next Image.
- `README.md`, `docs/DESIGN_SYSTEM.md` and this changelog - documented the Phase 2 boundaries and
  reusable patterns.

**Components Changed**

- Created `ProductGalleryViewer` and `TechnicalTable`.
- Updated `ProductGallery`, `ProductCard`, `RfqCta`, `SpecificationTable`,
  `CompatibilityTable`, `ProductFinderForm`, `CategoryPageTemplate` and
  `ProductDetailTemplate`.
- Removed no product, RFQ, SEO or data component.

**Data Changed**

- No product, company, compatibility, certification, commercial or technical fact changed.
- No draft product became public and no evidence status changed.

**Visual Changes**

- Product Center now presents real categories and published products before secondary sourcing
  guidance.
- Product cards reserve most of their area for product imagery and remove repeated data rows.
- Category pages use continuous information bands and technical rows instead of repeated card
  groups; long reference-family matrices are available on demand.
- Product details use a stable image field, compact page navigation, reusable technical tables and a
  shorter overview-to-RFQ path.
- RFQ sections use one clear primary action without repeated trade-policy boxes.

**SEO Impact**

- Preserved all canonical paths, route parameters, metadata generation, JSON-LD, sitemap and robots
  behavior.
- Preserved all category SEO content, FAQ schema support, company-catalog source links and priority
  internal links.
- Retained `data-nosnippet` boundaries for navigation, product visuals, card actions, related
  category codes and RFQ regions.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- Product CSV, image, readiness, search, series, component evidence, compatibility and technical
  fact checks passed.
- RFQ constraints, email/provider handling and MIG/MAG, TIG, plasma, welding-machine and OEM RFQ
  builder tests passed.
- SEO, 81-page built internal links, snippet hygiene, performance budget and secret scan passed.
- Playwright checked Product Center, MIG/MAG category and product-detail pages at 390, 768 and 1440
  pixels: all returned 200, used one H1, had no document overflow or broken images.

**Known Issues**

- Plasma Retaining Cap, Welding Magnet and TIG Torch Switch remain draft because exact reviewed
  images are missing.
- Forty-three legacy product-image references still need explicit usage-rights confirmation, and
  two duplicate-content image groups need variant-specific replacements.
- Most published product records currently have one display-eligible image; thread, dimension,
  packaging and bulk gallery images still require approved product-specific photography.
- Production deployment and a controlled live RFQ mailbox-delivery test were not performed.

**Next Recommended Step**

- Continue with V2 Phase 3 for Applications and Industry Solutions, then replace legacy reference
  images with company-owned product and process photography in governed batches.

## 2026-08-21 - V2 Phase 3A Applications And Industry Solutions

**Task**

Upgraded the Applications center and all six industry solution pages into one evidence-safe buyer
journey. The work connects operating context, relevant product systems, selection evidence and an
application-specific RFQ without implying unverified customer projects or technical fit.

**Files Changed**

- `app/applications/page.tsx` - replaced signal and sourcing card groups with a representative
  industrial hero, image-led industry paths, a three-step RFQ preparation sequence and one CTA.
- `app/applications/[slug]/page.tsx` - rebuilt the shared detail template around operating context,
  product systems, selection evidence, RFQ fields, related products and FAQ.
- `components/content/IndustrySolutionCard.tsx` - added a reusable industry card using governed
  related-product imagery and a non-breaking fallback.
- `content/applications.ts` - added application-specific operating contexts, selection
  considerations and RFQ information requirements for six industries.
- `lib/content/schemas.ts` - extended `ApplicationPage` with the new structured fields.
- `docs/DESIGN_SYSTEM.md` and this changelog - documented the reusable application-page system and
  evidence boundary.

**Components Changed**

- Created `IndustrySolutionCard`.
- Reused `Container`, `Section`, `SectionHeading`, `ButtonLink`, `ProductGrid`, `FaqSection`,
  `BuyerResourceLinks` and `RfqCta`.
- Removed no route, product, RFQ or structured-data component.

**Data Changed**

- Added buyer guidance for shipbuilding, automotive, pipeline, metal fabrication, construction and
  repair-workshop sourcing.
- No technical specification, compatibility, certification, customer case or commercial claim was
  added or changed.

**Visual Changes**

- Applications now opens with one visual message and exposes the six industries as image-led paths.
- Industry cards prefer distinct governed product images while retaining a safe fallback.
- Detail pages use a related product reference above the fold, continuous technical rows and one
  application RFQ checklist instead of repeated card groups.
- Mobile uses deliberate stacking, horizontally scrollable section navigation and the existing
  bottom contact bar without page overflow.

**SEO Impact**

- Preserved all application URLs, canonical metadata, static generation, sitemap inclusion,
  BreadcrumbList, FAQ and application WebPage structured data.
- Strengthened visible buyer content and internal links to relevant categories, products and RFQ.
- Kept representative-image labels, navigation and repeated CTA content outside search snippets.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, built 81-page internal-link audit, snippet hygiene, performance budget and secret scan
  passed.
- Playwright checked Applications and Shipbuilding pages at 390, 768 and 1440 pixels: all returned
  200, used one H1, had no horizontal overflow, loaded all images after lazy-load traversal and kept
  the section navigation aligned below the 77-pixel Header.
- Verified the application RFQ action carries process, equipment, product reference, quantity,
  packaging and destination prompts into `/rfq`.

**Known Issues**

- The Applications hero remains a clearly labeled representative visual, not company-facility or
  customer-project evidence.
- Industry cards rely on existing governed product imagery; company-owned industry-context,
  inspection, packaging and shipment photography is still needed.
- Most related products still have only one display-eligible image, so detail, dimension, packaging
  and bulk views remain incomplete.
- Production deployment and a controlled live RFQ mailbox-delivery test were not performed.

**Next Recommended Step**

- Continue V2 Phase 3B with the OEM/ODM, Quality Control, Distributor and Shipping/Payment solution
  pages, using the same evidence-led hierarchy and one clear RFQ path.

## 2026-08-21 - V2 Phase 3B Commercial Solutions And Trust Pages

**Task**

Unified OEM/ODM, Distributor Supply, Quality Control and Shipping/Payment into one evidence-led
commercial solution system. Preserved existing business data, downloads, interactive RFQ tools,
email delivery behavior, routes, metadata and structured data while removing repeated card groups
and competing actions.

**Files Changed**

- `app/oem-service/page.tsx` - reorganized OEM scope, product families, approval process, Builder,
  project brief, support links and FAQ around one approved product reference.
- `app/distributor-supply/page.tsx` - clarified the roles of the sourcing Builder and embedded RFQ
  form; consolidated product range, program support, commercial basis, process and resources.
- `app/quality-control/page.tsx` - organized inspection workflow, mismatch-risk matrix, buyer and
  supplier controls, evidence options and certification boundaries into continuous technical rows.
- `app/shipping-payment/page.tsx` - separated confirmed company policy from order-specific trade
  terms and connected lead times, order workflow, quotation inputs and buyer paths.
- `components/content/PageSectionNav.tsx` - added one reusable sticky page-navigation pattern.
- `components/content/ProcessSteps.tsx` - added reusable responsive process rows for light and dark
  sections.
- `components/content/BuyerPathList.tsx` - added reusable internal and download resource rows.
- `docs/DESIGN_SYSTEM.md` and this changelog - documented the shared commercial-page system.

**Components Changed**

- Created `PageSectionNav`, `ProcessSteps` and `BuyerPathList`.
- Reused `OemRfqBuilder`, `DistributorRfqBuilder`, `RfqForm`, `FaqSection`, `RfqCta`, `Container`,
  `Section`, `SectionHeading` and `ButtonLink`.
- Removed no form, download, RFQ, route or structured-data component.

**Data Changed**

- No company identity, technical specification, compatibility, certification, pricing, capacity,
  customer, commercial-policy or product fact changed.
- Public copy was tightened to preserve the distinction between buyer input and supplier-confirmed
  order details.

**Visual Changes**

- Long solution pages now use one five-item sticky section navigation aligned below the Header.
- Repeated cards became continuous process, evidence, commercial and resource rows.
- OEM and Distributor pages use clearly labeled representative imagery with two hero actions.
- Quality matrices stack into readable labeled records on mobile instead of clipped tables.
- Shipping terms use a restrained dark commercial summary rather than promotional trade cards.

**SEO Impact**

- Preserved all four canonical routes, titles, descriptions, WebPage, BreadcrumbList and FAQ
  structured data, sitemap behavior and important internal links.
- Preserved route-specific Distributor Open Graph and Twitter images.
- Kept evidence labels, repeated navigation and representative-image notes outside search snippets
  where appropriate.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, 81-page built internal-link audit, snippet hygiene, performance budget and secret scan
  passed.
- RFQ constraints, email template, provider-timeout, OEM Builder, Distributor Builder/workbook,
  Quality Control and Export Order Terms tests passed.
- Playwright checked all four pages at 390, 768 and 1440 pixels: every page returned 200, used one
  H1, had no horizontal overflow or broken image, and kept the section navigation aligned below the
  77-pixel Header.
- Browser interaction confirmed the OEM Builder updates its readiness state and the Distributor
  page retains both the sourcing Builder and direct RFQ form.

**Known Issues**

- OEM, Distributor and Quality heroes still use clearly labeled representative visuals rather than
  company-owned production, inspection, packing or shipment photography.
- No verified factory, production-line, warehouse, inspection-equipment or shipment image set is
  available for publication.
- Production deployment and a controlled live RFQ mailbox-delivery test were not performed.

**Next Recommended Step**

- Continue V2 Phase 3C with About, Resources, Downloads, Contact and RFQ, then audit the remaining
  guide-detail presentation as a separate page family.

## 2026-08-21 - V2 Phase 3C Company, Resources And Inquiry Pages

**Task**

Reorganized About, Guides, Downloads, Contact and RFQ into one evidence-led buyer journey. Reduced
repeated trade-policy cards, preserved confirmed company information and made the production RFQ
form the dominant conversion task without changing its API or delivery contract.

**Files Changed**

- `app/about/page.tsx` - rebuilt legal identity, product systems, buyer programs, order process,
  evidence boundaries, company resources, FAQ and RFQ hierarchy.
- `app/guides/page.tsx` - grouped 17 buyer guides by identification, product selection and
  RFQ/OEM intent in a continuous editorial library.
- `app/downloads/page.tsx` - separated public catalogs from RFQ workbooks, retained all nine
  downloads and added product-specific document request paths.
- `app/contact/page.tsx` - consolidated verified direct contact information around one embedded
  RFQ form, response process and supporting buyer resources.
- `app/rfq/page.tsx` - made the form primary on desktop and mobile while retaining search-parameter
  prefill, selected products, attachments, validation, delivery status and fallback channels.
- `app/oem-service/page.tsx` - added a contextual company-profile link for supplier verification.
- `components/content/DownloadCard.tsx` - added a reusable catalog/workbook download row.
- `docs/DESIGN_SYSTEM.md` and this changelog - documented company, resource and inquiry patterns.

**Components Changed**

- Created `DownloadCard`.
- Reused `PageSectionNav`, `ProcessSteps`, `BuyerPathList`, `SectionHeading`, `FaqSection`,
  `RfqCta`, `RfqForm`, `Container`, `Section` and `ButtonLink`.
- Removed no route, form, file-download, API, schema or buyer tool.

**Data Changed**

- No company identity, product specification, compatibility, certification, pricing, capacity,
  customer, commercial-policy or RFQ-delivery data changed.
- All 17 guide records and all nine public download files remain available at their existing URLs.

**Visual Changes**

- About now reads as a supplier-verification page rather than a sequence of promotional cards.
- Guides use buyer-intent groups and compact editorial rows without decorative keyword badges.
- Downloads use restrained file rows with prominent file type and one action.
- Contact and RFQ place the form ahead of repeated policy content and use dedicated commercial pages
  for supporting decisions.
- Mobile pages use deliberate stacking, full-width actions and no RFQ/contact sticky-bar overlap.

**SEO Impact**

- Preserved all five canonical routes, titles, descriptions, BreadcrumbList, WebPage/CollectionPage
  and FAQ structured data, sitemap behavior and public download URLs.
- Retained all 17 guide links and strengthened contextual internal links among company, quality,
  shipping, downloads, products and RFQ pages.
- Kept visible H1s aligned with metadata and maintained one indexable content hierarchy per page.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, 81-page built internal-link audit, snippet hygiene, RFQ constraints/email/provider-
  timeout tests, performance budget and secret scan passed.
- Playwright checked About, Guides, Downloads, Contact and RFQ at 360, 390, 768 and 1440 pixels:
  every page returned 200, used one H1, had no horizontal overflow or broken image and retained the
  expected form/download counts.
- Scrolled browser checks confirmed each section navigation aligns directly below the 77-pixel
  Header. RFQ query parameters correctly prefilled product and quantity fields.

**Known Issues**

- The About hero uses a clearly labeled representative product-range image; verified company-owned
  premises, team, warehouse, inspection, packing and shipment photography is still unavailable.
- Product-specific data sheets remain request-based until the exact product evidence is approved.
- Production deployment and one controlled real-browser RFQ delivery to the configured mailbox were
  not performed in this phase.

**Next Recommended Step**

- Upgrade the 17 guide-detail pages as one controlled page family, preserving their technical
  content, article schema, buyer tools and product/category links.

## 2026-08-21 - V2 Phase 3D Technical Buyer Guide Details

**Task**

Rebuilt the 17 guide-detail pages as one evidence-led technical publication family. Preserved every
guide URL, structured-data contract, worksheet, specialist RFQ tool and product relationship while
improving long-form hierarchy and mobile readability.

**Files Changed**

- `app/guides/[slug]/page.tsx` - rebuilt the shared guide-detail hierarchy, navigation, article,
  checklist, buyer-tool, related-content, FAQ and RFQ presentation.
- `components/content/GuideContents.tsx` - added responsive desktop and mobile guide contents.
- `components/content/ComponentReferenceTable.tsx` - added responsive technical component and
  sourcing-decision reference rows.
- `components/content/DownloadCard.tsx` - added buyer-tool-specific action labels while retaining
  the shared download pattern.
- `docs/DESIGN_SYSTEM.md` and this changelog - documented the guide-detail system and validation.

**Components Changed**

- Created `GuideContents` and `ComponentReferenceTable`.
- Extended `DownloadCard` with an optional action label.
- Reused `PageSectionNav`, `ProductGrid`, `BuyerPathList`, `WeldingMachineRfqBuilder`,
  `FaqSection`, `RfqCta`, `Container`, `Section` and `ButtonLink`.
- Removed no guide route, worksheet, interactive builder, schema or content record.

**Data Changed**

- No guide, company, product, compatibility, technical, certification or commercial data changed.
- All 17 guide records, four component references, specialist RFQ tools and related relationships
  continue to use their existing content sources.

**Visual Changes**

- Guides now use a technical-reference table, continuous numbered article and restrained sticky
  contents instead of repeating the same card treatment for every section.
- Buyer evidence checklists and downloadable RFQ tools have a clear decision sequence.
- Related categories, products and guides are visually distinct and ordered by buyer usefulness.
- Mobile reference rows, article contents, forms and actions use deliberate stacking without
  compressed desktop tables.

**SEO Impact**

- Preserved all guide URLs, canonical metadata, Article, BreadcrumbList and FAQ structured data.
- Kept visible H1s and guide metadata aligned and retained required RFQ snippet regions.
- Strengthened contextual navigation to categories, products, related guides and RFQ without
  adding duplicate or thin pages.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, 81-page built internal-link audit, snippet hygiene, robot guide, welding-machine RFQ
  builder, RFQ constraints, performance budget and secret scan passed.
- Playwright checked representative compatibility, RFQ and equipment guides at 360, 768 and 1440
  pixels. All nine states returned 200, used one H1, had no horizontal overflow or broken images,
  retained the expected technical sections and tools, and aligned the sticky navigation below the
  Header.

**Known Issues**

- Some related products still rely on reviewed catalog crops rather than a complete company-owned
  multi-angle image set.
- Technical guide content deliberately leaves exact product fit, dimensions, ratings and compliance
  evidence to quotation or approved documentation.
- Production deployment and one controlled live RFQ mailbox-delivery test were not performed.

**Next Recommended Step**

- Audit the remaining product evidence and image-governance backlog, then improve the strongest
  search-impression product/category opportunities without publishing unverified technical claims.

## 2026-08-21 - V2 Phase 4A Product Image Evidence Queue

**Task**

Closed the gap between the three missing-photo draft products and the wider image-governance
backlog. Rebuilt the generated task list around all registered assets and made product-gallery
captions reflect exact-product versus family-reference evidence.

**Files Changed**

- `scripts/generate-product-image-tasks.ts` - generates a prioritized provenance, rights,
  exact-match, resolution and replacement queue from the governed image registry.
- `scripts/product-image-asset-utils.ts` - detects PNG/JPEG by file signature and warns when the
  extension and real file format differ.
- `scripts/report-product-image-assets.ts` - reports file-format corrections and signature-based
  dimensions alongside rights, source, resolution and duplicate-image gaps.
- `docs/product-image-tasks.csv` - refreshed from three missing-photo tasks to the complete 46-asset
  evidence queue.
- `docs/product-image-asset-report.md` - refreshed dimensions and file-format correction section.
- `components/content/ProductGallery.tsx` and `ProductGalleryViewer.tsx` - pass and disclose the
  governed content-match and publication status.
- `.github/workflows/quality.yml` - regenerates and diff-checks the image evidence task queue.
- `README.md`, `docs/DESIGN_SYSTEM.md` and this changelog - documented workflow and disclosure rules.

**Components Changed**

- Extended `ProductGalleryViewer` with evidence-aware captions.
- Removed no product image, route, product, gallery action or asset-registry row.

**Data Changed**

- No image was marked exact, rights-approved or search-eligible.
- No product, specification, compatibility, price, certification, SKU or publication status changed.
- The generated queue now contains 46 actionable assets: four P0, 23 P1 and 19 P2 tasks.
- Three contact-tip files were identified as PNG content stored under `.jpg` paths; they remain
  published legacy references and are queued for reviewed re-export or rename.

**Visual Changes**

- Product detail galleries now say “product-family reference image” for current family-level legacy
  assets. Future exact, reviewed assets will say “reviewed product image”.
- Card imagery and gallery geometry are unchanged.

**SEO Impact**

- Product URLs, canonical metadata, structured data, sitemap and image paths are unchanged.
- Evidence-aware captions reduce the chance that a family-level visual is interpreted as proof of
  exact SKU geometry.

**Validation**

- Image-asset validation and image-task generation passed with no blocking errors.
- Signature detection reported the three known extension/content mismatches as warnings.
- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, 81-page built internal-link audit, snippet hygiene, performance budget and repository
  secret scan passed.
- Playwright checked the contact-tip and MB15 gas-nozzle product galleries at 360 and 1440 pixels.
  All four states returned 200, used one H1, had no horizontal overflow or broken images, retained
  the expected gallery counts and showed the evidence-aware family-reference caption.

**Known Issues**

- All 46 governed assets still require explicit usage-rights review; none is yet search eligible as
  an exact-product asset.
- Nine assets still have unknown source provenance, including four active main-image P0 tasks.
- Three files still need reviewed re-export or rename so their extensions match the actual image
  format. No automatic binary conversion was performed because product geometry must be preserved.

**Next Recommended Step**

- Complete the four P0 source/provenance decisions, then capture company-owned exact-product views
  for the 15AK contact tips, holder and nozzle while confirming the 15 governed technical facts.

## 2026-08-21 - V2 Phase 4B 15AK Factory Evidence Workbook

**Task**

Created a low-friction internal workbook that turns the highest-priority 15AK technical, image and
provenance gaps into structured factory/reviewer inputs without enabling automatic publication.

**Files Changed**

- `docs/operations/15ak-factory-evidence-handoff.md` - documented the workbook, accepted evidence,
  controlled CSV/registry update and required validation sequence.
- `README.md` - linked the 15AK evidence handoff from repository operations documentation.
- `docs/CHANGELOG_AI.md` - recorded the operational artifact and evidence boundary.
- Generated operational artifact: `arcfort-15ak-factory-evidence-intake.xlsx` in the task output
  directory; the existing CSVs remain canonical.

**Components Changed**

- None. This phase adds an internal evidence-collection artifact, not a public website component.

**Data Changed**

- No technical value, product record, image status, compatibility relationship or publication
  state changed.
- The workbook projects four unresolved P0 provenance decisions, 15 technical-fact review rows and
  20 exact-product image requests from existing governed sources.

**Visual Changes**

- None on the public website.
- The internal workbook uses ArcFort industrial-blue hierarchy, pale-orange input cells, frozen
  headers, filters, status dropdowns and formula-driven readiness counts.

**SEO Impact**

- None. No URL, metadata, schema, sitemap, image path or indexation state changed.

**Validation**

- Workbook summary formulas returned four unresolved P0 decisions, zero confirmed technical facts
  and zero approved image requests, matching the governed repository state.
- Formula-error scan found no `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?` or `#N/A` cells.
- All four worksheets were rendered and visually reviewed for hierarchy, clipping, wrapping,
  editable-input distinction and table readability.

**Known Issues**

- The workbook still requires real factory/product-owner input; it intentionally contains no new
  confirmed technical or image evidence.
- Completed workbook rows require manual evidence review and controlled transfer to canonical CSVs.

**Next Recommended Step**

- Have the product owner resolve the four P0 provenance rows first, then complete the 15 technical
  confirmations and capture the requested exact-product image sets.

## 2026-08-25 - V2 Release Candidate Consolidation And QA

**Task**

Audited the complete uncommitted V2 website and data-governance worktree, regenerated the governed
reports, closed two buyer-path/mobile issues and verified the result as one reviewable release
candidate without promoting unconfirmed product evidence.

**Files Changed**

- `app/rfq/page.tsx` - links RFQ buyers directly to the quality inspection workflow.
- `components/navigation/MobileNavigation.tsx` - reserves space for the fixed mobile inquiry bar so
  the open menu and its final actions remain reachable.
- `docs/site-wide-upgrade-roadmap.md` - records the verified 91-page build and governed 15AK series
  page.
- Governed product, image, series, compatibility, technical and acquisition reports were
  regenerated from their canonical sources.
- `docs/CHANGELOG_AI.md` - records the release-candidate audit and remaining evidence constraints.

**Components Changed**

- Refined `MobileNavigation`; no component, route, form or buyer tool was removed.

**Data Changed**

- No product value, compatibility relationship, image-rights state, technical confirmation,
  company fact or publication status changed.
- The verified governed state remains 43 product records, 40 active products, three image-blocked
  drafts, 46 image assets, one published series, four reference-only relationships and 15 technical
  facts awaiting confirmation.

**Visual Changes**

- The 360px mobile menu now ends above the fixed inquiry controls and can scroll its `Contact Sales`
  action fully into view.
- No desktop page composition or product geometry changed.

**SEO Impact**

- Preserved all public URLs, canonicals, metadata, schema, sitemap records and redirects.
- Strengthened the RFQ-to-quality internal link by targeting the visible inspection workflow.
- The production build continues to expose 40 product pages, six categories, one series page, six
  applications and 17 guides.

**Validation**

- Product CSV, image presence, image registry, product-series evidence, 359 component facts, 121
  component candidates, 181 image requests, compatibility registry and 15 technical facts passed
  their domain validators.
- ESLint, TypeScript and Next.js 15 production build passed; 91 pages generated.
- RFQ constraints, email templates, provider timeout, product search, category/OEM/distributor RFQ
  builders, company profile, quality control, shipping terms, robotic torch and sender-domain tests
  passed.
- SEO, 81-page built internal-link, snippet hygiene, performance budget and 328-file secret scans
  passed.
- Playwright checked 11 representative routes at 360, 768 and 1440 pixels plus the open mobile menu:
  all 34 states returned the expected content, one H1, no horizontal overflow, no broken images and
  no browser console errors. The mobile menu/sticky-control overlap and final-action reachability
  checks passed after refinement.

**Known Issues**

- All 46 product image assets still require explicit usage-rights review; nine have unknown source
  provenance and four active main images remain P0 decisions.
- Three products remain drafts until reviewed exact-product images are supplied.
- The 15 governed 15AK technical facts and all compatibility relationships still require qualifying
  evidence before confirmation.
- Sales and buyer inbox placement, exposed Resend-key rotation, Search Console submission and
  analytics confirmation remain external operational checks.
- Production deployment was not performed in this consolidation phase.

**Next Recommended Step**

- Resolve the four P0 image provenance decisions and complete the 15AK factory technical/image
  intake before publishing another series or expanding the active SKU count.

## 2026-08-25 - 15AK Airtable Evidence Intake

**Task**

Created a private, reviewer-friendly Airtable intake for 15AK technical and product-image evidence,
then documented the boundary that keeps repository data authoritative.

**Files Changed**

- `docs/operations/airtable-15ak-evidence-intake.md` - cloud intake purpose, authority boundary,
  canonical mapping, transfer procedure and proposed companion file-request configuration.
- `knowledge-base/decisions/2026-08-25-airtable-evidence-intake-boundary.md` - durable decision against
  automatic publication or a second source of product truth.
- `README.md` - linked the Airtable intake workflow from the 15AK evidence and useful-document sections.
- `docs/CHANGELOG_AI.md` - recorded this operational integration.

**Components Changed**

- None.

**Data Changed**

- Created the private Airtable base `ArcFort Weld - 15AK Evidence Intake` with five workflow records,
  four P0 image-decision records, 15 technical-review records and 20 image-request records.
- No public or canonical product data changed. All technical rows remain
  `NEEDS_FACTORY_CONFIRMATION`; all image requests remain `requested`; all P0 decisions remain
  `Needs review`.

**Visual Changes**

- None.

**SEO Impact**

- None. Public URLs, metadata, schema, sitemap and indexability states are unchanged.

**Validation**

- Verified Airtable table counts and status distributions after seeding.
- Confirmed that the base contains no confirmed technical value, approved image or search-eligible
  publication state.
- Ran the repository technical-fact, product-image asset and secret-pattern checks after documenting
  the workflow.

**Known Issues**

- The four P0 image provenance decisions, 15 technical facts and 20 requested image views still need
  real reviewer evidence.
- A Dropbox companion file request was not created because its exact folder, title, deadline and
  open/closed state require explicit owner confirmation.
- Airtable remains private external account state and has no automatic repository synchronization.

**Next Recommended Step**

- Approve the proposed Dropbox intake configuration, then collect original 15AK product photos and
  exact-SKU evidence for review and controlled repository transfer.

## 2026-08-25 - Contact Tip Image Encoding Correction

**Task**

Corrected three contact-tip image files whose `.jpg` extension did not match their PNG-encoded
content, without changing public paths or upgrading their evidence status.

**Files Changed**

- `public/images/products/mig-contact-tip-m6-0-8mm.jpg` - re-exported as real JPEG at 750 x 750.
- `public/images/products/mig-contact-tip-m6-1-0mm.jpg` - re-exported as real JPEG at 750 x 750.
- `public/images/products/mig-contact-tip-m6-1-2mm.jpg` - re-exported as real JPEG at 750 x 750.
- `docs/product-image-tasks.csv` - regenerated the governed image action queue.
- `docs/product-image-asset-report.md` - regenerated the image asset readiness report.
- `docs/product-image-source-audit.md` - recorded the correction and unchanged evidence boundary.
- `docs/CHANGELOG_AI.md` - recorded this controlled asset correction.

**Components Changed**

- None.

**Data Changed**

- No product field, image path, publication state, source, ownership or usage-rights state changed.
- File-format correction count decreased from three to zero.

**Visual Changes**

- None intended. Dimensions, crop and composition remain unchanged.

**SEO Impact**

- Existing image URLs and product URLs are preserved. Correct MIME-compatible encoding reduces the
  risk of image processing or caching inconsistencies.

**Validation**

- Product image asset validation passed for 46 assets with zero file-format corrections.
- Product image task and asset reports regenerated without upgrading any evidence state.
- Product, SEO, lint, TypeScript and production-build checks were run before publication.

**Known Issues**

- The three files still reuse the same family-level visual and remain unresolved P0 provenance
  decisions.
- Forty-three legacy public reference assets still require explicit usage-rights confirmation.
- Two duplicate-content groups still need variant-specific replacements.

**Next Recommended Step**

- Collect rights-approved, exact-SKU front, connection/detail and packaging views for the 15AK
  contact-tip variants through the governed evidence intake.

## 2026-08-25 - Unassigned Product Image Triage System

**Task**

Converted the 73 unassigned files in `public/images/products/` from an unstructured folder backlog
into a governed candidate-review system without assigning any file to an exact SKU.

**Files Changed**

- `data/evidence/local-product-image-triage.csv` - canonical candidate, visual-family, rights,
  exact-match, review and priority records for every unassigned product-image file.
- `scripts/validate-local-image-triage.ts` - validates schema, allowed states, file coverage,
  uniqueness, canonical-registry separation and approval evidence gates.
- `package.json` - added `npm run images:triage:validate`.
- `.github/workflows/quality.yml` - added local-image triage validation to the product-image CI gate.
- `AGENTS.md` - added permanent unassigned-image governance and migration rules.
- `docs/QA_CHECKLIST.md` - added the triage validator to product/image checks.
- `docs/operations/airtable-15ak-evidence-intake.md` - documented the fifth Airtable table and its
  canonical repository mapping.
- `knowledge-base/decisions/2026-08-25-airtable-evidence-intake-boundary.md` - recorded the expanded
  cloud-review scope and repository authority.
- `README.md` - documented the candidate CSV and validation command.
- `docs/CHANGELOG_AI.md` - recorded this image-evidence workflow.

**Components Changed**

- None.

**Data Changed**

- Added 73 local candidate records: 9 P0, 44 P1 and 20 P2.
- Visual-family sorting contains 21 MIG/MAG, 22 TIG, 10 plasma, three welding consumable, eight
  welding accessory, two welding equipment and seven unknown records.
- Added a matching private Airtable `Local Asset Triage` table with 73 records plus evidence,
  reviewer and ISO-date fields.
- All candidates remain `needs_confirmation`, `unverified` and `needs_review`. No canonical product
  assignment or public image state changed.

**Visual Changes**

- None.

**SEO Impact**

- No route, metadata, schema, sitemap or indexability change. The new gate reduces the risk of an
  unreviewed local file entering product image SEO.

**Validation**

- Confirmed one triage row for each of the 73 unassigned product-image files.
- Confirmed zero approved usage-rights records and zero confirmed exact-product matches.
- Confirmed the three image-blocked drafts still have no safe local replacement candidate.
- Ran image triage, image registry, product, SEO, lint, TypeScript and production-build checks before
  publication.

**Known Issues**

- The local filenames and visual-family labels do not establish source ownership or exact-product
  identity.
- No Welding Magnet or dedicated TIG Torch Switch photo was found. Several plasma consumable images
  cannot be identified as a retaining cap without model, drawing or source evidence.
- The nine P0 local family candidates still need source-owner, rights and labeled-sample or drawing
  review before any canonical assignment.

**Next Recommended Step**

- Have the product owner review the nine P0 local candidates and collect exact 15AK product photos;
  then transfer only approved files into `data/assets/product-image-assets.csv`.

## 2026-08-25 - P0 Repository Image Lineage

**Task**

Traced the four unresolved P0 public main images to byte-identical repository copies so future source
review starts from reproducible file evidence rather than visual guesswork.

**Files Changed**

- `data/assets/product-image-assets.csv` - recorded repository-lineage evidence for three contact-tip
  assets and one gas-nozzle asset without changing their governance states.
- `data/evidence/local-product-image-triage.csv` - linked the matching contact-tip and gas-nozzle
  candidates to their Git blob evidence.
- `lib/data/product-image-assets.ts` - regenerated runtime image evidence data.
- `knowledge-base/assets/p0-repository-image-lineage.md` - documented method, hashes, findings,
  evidence boundaries and required resolution.
- `knowledge-base/assets/product-image-governance.md` - added unassigned candidate governance and the
  current baseline.
- `docs/product-image-source-audit.md` - added the P0 lineage conclusion.
- `docs/product-image-tasks.csv` - regenerated from the updated evidence registry; the asset report
  was also regenerated and produced no tracked diff.
- `README.md` - linked the lineage evidence record.
- `docs/CHANGELOG_AI.md` - recorded this evidence improvement.

**Components Changed**

- None.

**Data Changed**

- The three pre-format-correction contact-tip assets share Git blob
  `1876a63cce63de1ba2626d865950a9e13e2bceb1` with `mig-contact-tip.jpg`.
- The current AF-MIG-GN-0008 main asset shares Git blob
  `756d8bd608a3fed0cd83d0cf51f71bcecfebe674` with `mig-gas-nozzle.jpg`.
- No source owner, rights, exact-product, compatibility or publication status was upgraded.

**Visual Changes**

- None.

**SEO Impact**

- None. Product and image URLs, metadata, schema and indexability are unchanged.

**Validation**

- Verified exact Git blob identity for the four asset-to-candidate relationships.
- Regenerated and validated the canonical image asset runtime data, evidence queue and report.
- Revalidated local candidate coverage and approval gates.
- Ran product, SEO, lint, TypeScript and production-build checks before publication.

**Known Issues**

- Repository lineage does not identify the original owner or prove website-use rights.
- Shared contact-tip imagery cannot distinguish the three wire-bore variants.
- Exact product identity for AF-MIG-GN-0008 remains unverified.

**Next Recommended Step**

- Ask the image owner or supplier to confirm the two upstream files, then compare dedicated physical
  variants against labeled samples or controlled drawings before replacing the P0 assets.

## 2026-08-25 - 15AK Component Evidence System

**Task**

Converted the two 15AK company-catalog assembly forms into the same governed component, factory
confirmation and image-intake system used by the later MIG/MAG series.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added separate air-valve and standard 15AK
  component facts with source, verification and lifecycle states.
- `data/intake/15ak-series-confirmation.csv` - added exact-candidate factory and SKU confirmation
  rows.
- `data/intake/15ak-image-intake.csv` - added exact candidate main, connection, marking and
  dimensional image requests.
- `data/intake/15ak-product-image-intake.csv` - renamed the existing four-SKU image queue so its
  scope cannot be confused with the new component queue.
- `lib/data/product-series-component-facts.ts` - regenerated the internal runtime registry.
- `scripts/product-technical-evidence-utils.ts` and
  `scripts/report-product-technical-evidence.ts` - updated the product-level image queue path.
- `scripts/report-product-series-components.ts` - added candidate-group identifiers and clearer
  publication-boundary reporting.
- `docs/product-series-component-evidence-report.md`, `docs/product-series-readiness-report.md`,
  `docs/product-technical-evidence-report.md` and `docs/acquisition-readiness-report.md` - refreshed
  internal readiness outputs.
- `knowledge-base/products/15ak-component-evidence.md` - documented source scope, candidate counts,
  dual-assembly separation and confirmation gates.
- `knowledge-base/products/15ak-mig-mag-series.md`,
  `knowledge-base/technical/15ak-technical-evidence-workflow.md`, operational handoff documents,
  `AGENTS.md`, `docs/QA_CHECKLIST.md` and `README.md` - documented the separate product and component
  workflows.

**Components Changed**

- None. The component-evidence registry remains internal and is not projected into public pages.

**Data Changed**

- Added 46 15AK catalog candidates: 23 for the air-valve arrangement and 23 for the standard
  complete-torch arrangement.
- Added 158 field-level catalog facts and 58 governed image requests.
- All new facts and candidates remain `NEEDS_FACTORY_CONFIRMATION`; every image remains `requested`.
- No new SKU, confirmed compatibility relationship, approved image or public technical claim was
  created.

**Visual Changes**

- None.

**SEO Impact**

- None. Public routes, product metadata, structured data, sitemap and indexability are unchanged.

**Known Issues**

- None of the 46 candidates has exact-product factory confirmation, an approved SKU mapping or an
  approved image.
- Similar component names across the two catalog arrangements must remain separate until controlled
  evidence proves they are the same supplied part.
- The private Airtable base still covers the four governed public products only; the broader
  component matrix has not been externally synchronized.

**Next Recommended Step**

- Have the product owner confirm the two complete 15AK assemblies first, then work through the
  nozzle, contact-tip, holder and liner candidates using labeled samples, controlled drawings and
  company-owned images.

## 2026-08-25 - 15AK Buyer Assembly Identification

**Task**

Converted the governed 15AK air-valve and standard complete-torch catalog evidence into a public,
responsive buyer-identification interface without publishing unconfirmed specifications or
compatibility claims.

**Files Changed**

- `lib/content/schemas.ts` - added the reusable product-series assembly-reference contract.
- `lib/data/product-series.ts` - added the two documented 15AK arrangements, buyer checks, SEO copy
  and arrangement-identification FAQ.
- `components/content/SeriesAssemblyComparison.tsx` - added the responsive arrangement comparison
  and evidence-led RFQ prefill action.
- `components/content/ProductSeriesPageTemplate.tsx` - integrated the comparison into the shared
  series page while retaining a fallback for series without arrangement evidence.
- `scripts/test-product-series.ts` - added assembly-reference identity, completeness and 15AK
  separation checks.
- `lib/content/site.ts` - updated the public content modification date.
- `knowledge-base/products/15ak-mig-mag-series.md` - recorded the public projection and evidence
  boundary.
- `docs/CHANGELOG_AI.md` - recorded this phase.

**Components Changed**

- Created `SeriesAssemblyComparison` and added an Arrangements destination to the shared series
  navigation.
- No component or buyer function was removed.

**Data Changed**

- Added two public assembly-reference summaries linked to company catalog pages 7-8 and 9-10.
- No SKU, exact technical value, OEM number, confirmed compatibility, image evidence or commercial
  term changed.

**Visual Changes**

- The 15AK page now separates air-valve and standard complete-torch paths in a two-column desktop
  comparison and a divided vertical mobile layout.
- Component groups, buyer checks and a dedicated RFQ preparation action improve scanability without
  adding marketplace-style badges or nested cards.

**SEO Impact**

- Improved the existing 15AK page title support, meta description, FAQ and visible long-form buyer
  guidance while preserving its URL, canonical, breadcrumb, schema and sitemap entry.
- Added no new indexable route.

**Validation**

- Product-series, series-evidence, component-evidence, compatibility, technical-fact, product,
  image-asset, image-triage, RFQ, search, SEO, snippet, internal-link, secret and performance checks
  passed.
- ESLint, TypeScript and the Next.js production build passed; 91 pages were generated.
- Playwright verified 360, 390, 768, 1024, 1280 and 1440 pixel widths: both arrangements and the
  section navigation rendered, responsive dividers switched correctly, the RFQ prefill retained the
  selected arrangement and evidence boundary, and every state had one H1, no horizontal overflow,
  no broken image and no browser console error.

**Known Issues**

- Both arrangements remain catalog reference only; none of the 46 component candidates has a
  confirmed SKU mapping or approved exact-product image.
- Production deployment and a controlled live RFQ mailbox test are outside this phase.

**Next Recommended Step**

- Collect company-owned complete-torch and connection views for both arrangements, then confirm the
  complete assemblies before reviewing individual replacement components.

## 2026-08-25 - Combined 15AK Factory Evidence Workbook

**Task**

Created one internal Excel handoff that combines the governed 15AK assembly, component-image,
product-technical and product-image queues without changing any canonical or public status.

**Files Changed**

- `docs/operations/15ak-factory-evidence-handoff.md` - updated the sheet model, evidence gates and
  controlled reconciliation procedure for the combined workbook.
- `docs/operations/airtable-15ak-evidence-intake.md` - documented the non-authoritative boundary
  between the workbook, Airtable and canonical repository data.
- `knowledge-base/products/15ak-component-evidence.md` - recorded the reusable reviewer projection.
- `README.md` - linked the combined factory handoff from the 15AK evidence workflow.
- `docs/CHANGELOG_AI.md` - recorded this phase.

**Components Changed**

- None. The workbook is an internal evidence-collection artifact and does not add a public website
  component or route.

**Data Changed**

- Projected 46 assembly candidates, 58 component-image requests, 15 product-technical rows and 20
  product-image requests into five Excel sheets.
- No field moved to `CONFIRMED`; no image moved to `approved`; no SKU, compatibility relationship,
  technical value, image path or publication state changed.
- Every `notes_internal` field was omitted from the workbook.

**Visual Changes**

- Added a restrained industrial-blue Start Here sheet, formula-driven queue summary, frozen data
  headers, pale-orange reviewer-input columns, validation dropdowns and status formatting.
- No public website visual changed.

**SEO Impact**

- None. The workbook remains in the ignored local `outputs/` directory and is not available under a
  public or indexable URL.

**Validation**

- Reopened the exported XLSX and verified five sheets with 30, 51, 63, 20 and 25 used rows.
- Verified source queue counts of 46, 58, 15 and 20, preserved cross-sheet formulas, zero spreadsheet
  formula errors and zero `notes_internal` exposure.
- Rendered and visually reviewed all five worksheets for hierarchy, wrapping, input fields and status
  controls.

**Known Issues**

- The workbook remains empty of confirmed factory responses and approved exact-product images.
- Returned workbooks still require field-by-field repository reconciliation; no direct import is
  allowed.
- Broader Airtable synchronization and Dropbox file collection still require explicit owner
  approval.

**Next Recommended Step**

- Send the workbook and separate photo-shot instructions to the factory reviewer, beginning with the
  two complete 15AK torch arrangements and their machine-side connections.

## 2026-08-27 - Local Product Image Triage Review Board

**Task**

Converted the governed 73-file local product-image backlog into a private visual review surface so
source, usage rights and exact-product identity can be reviewed more efficiently without weakening
the canonical publication gate.

**Files Changed**

- `scripts/local-image-triage-utils.ts` - added the shared CSV model, allowed states and file listing.
- `scripts/validate-local-image-triage.ts` - reused the shared model while preserving validation.
- `scripts/generate-local-image-triage-board.ts` - generated the private, filterable HTML review board.
- `package.json` - added `images:triage:board`.
- `README.md` - documented the local reviewer workflow.
- `knowledge-base/assets/product-image-governance.md` - recorded the authority and transfer boundary.
- `docs/CHANGELOG_AI.md` - recorded this phase.

**Components Changed**

- Added an internal review board with summary counts, priority/family/status filters, original-file
  links and browser-read image dimensions. No public website component or route changed.

**Data Changed**

- Projected all 73 existing triage rows into the generated board.
- No candidate, source, usage right, exact match, review status, product assignment or publication
  state changed.
- `notes_internal` remains excluded from the review artifact.

**Visual Changes**

- Added a restrained industrial-blue local tool with responsive image grids and an evidence-first
  review workflow. No public website visual changed.

**SEO Impact**

- None. The generated board is ignored under `output/`, carries `noindex,nofollow` and is not a
  public route.

**Validation**

- Validated all 73 triage rows and 73 unassigned files with the existing governance gate: 9 P0, 44
  P1 and 20 P2; no candidate was rights-approved or exact-match confirmed.
- Generated the review board and verified 73 rendered candidates, no `notes_internal` exposure and
  correct nine-record P0 filtering.
- Ran browser checks at 360, 768 and 1440 CSS pixels: one H1, zero broken images, zero horizontal
  overflow and zero console errors.
- Visually reviewed the desktop overview plus the mobile filters and first P0 product card.

**Known Issues**

- All 73 candidates still require real source, usage-rights and exact-product decisions.
- The board is intentionally read-only; approved decisions must be reconciled through the canonical
  CSV and asset-registry workflow.

**Next Recommended Step**

- Review the nine P0 candidates first, record real evidence, and move only approved exact-product
  assets into the canonical registry.

## 2026-08-27 - MIG/MAG Series Factory Evidence Workbook

**Task**

Combined the governed 24KD, 25AK, 36KD, 40KD and 501D evidence queues into one internal factory
workbook so candidate identity, exact-item imagery and source conflicts can be reviewed without
creating premature products or public series pages.

**Files Changed**

- `docs/operations/mig-mag-series-evidence-handoff.md` - documented workbook scope, evidence gates,
  conflict resolution and controlled reconciliation.
- `knowledge-base/products/mig-mag-series-evidence-registry.md` - recorded the reusable factory-review
  projection and authority boundary.
- `README.md` - linked the combined MIG/MAG series evidence handoff.
- `docs/CHANGELOG_AI.md` - recorded this phase.

**Components Changed**

- None. The workbook is an internal evidence-collection artifact and adds no public website component
  or route.

**Data Changed**

- Projected 121 component candidates, 181 candidate-specific image requests and 13 controlled source
  conflicts into five Excel sheets.
- No SKU, technical value, compatibility relationship, image path, review state, series publication
  state or public content changed.
- Every `notes_internal` field was omitted from the workbook.

**Visual Changes**

- Added a restrained industrial-blue Start Here sheet, formula-driven series summary, frozen data
  headers, pale-orange reviewer-input columns, validation dropdowns and red conflict controls.
- No public website visual changed.

**SEO Impact**

- None. The workbook remains under the ignored `outputs/` directory and does not create an indexable
  route, metadata or sitemap entry.

**Validation**

- Reopened the exported XLSX and verified five sheets with 30, 10, 126, 186 and 18 used rows.
- Reconciled source counts of 121 candidates, 181 image requests and 13 conflicts, including per-series
  counts of 23/21/24/24/29 candidates and 34/31/35/35/46 image requests.
- Verified preserved cross-sheet formulas, zero spreadsheet formula errors and zero
  `notes_internal` exposure.
- Rendered and visually reviewed every worksheet for hierarchy, wrapping, frozen identifiers, input
  areas and conflict visibility.

**Known Issues**

- All five series remain in `evidence_review`; no candidate has a confirmed SKU mapping or approved
  exact-product image.
- The 13 source conflicts remain blocked until exact-variant Level A evidence is returned.
- Returned workbooks require field-by-field reconciliation; no direct import is allowed.

**Next Recommended Step**

- Send the workbook to the factory reviewer and resolve the 13 conflict rows before creating the
  first 24KD canonical products.

## 2026-08-27 - Product Category Mobile Hierarchy

**Task**

Reduced the first-screen content load across all six product-category pages so buyers reach the
published product range and selection paths sooner, while preserving the complete indexable category
copy and RFQ preparation guidance.

**Files Changed**

- `components/content/CategoryPageTemplate.tsx` - simplified the category hero and moved the full
  sourcing overview and inquiry checklist below the product grid.
- `docs/CHANGELOG_AI.md` - recorded this controlled category-page batch.

**Components Changed**

- Changed the shared `CategoryPageTemplate`; no component was created or removed.

**Data Changed**

- None. Product, category, technical, compatibility, image, company and commercial data remain
  unchanged.

**Visual Changes**

- Category heroes now contain one category message, one concise description and two buyer actions.
- Long SEO copy and the three-part inquiry checklist now form a restrained sourcing overview after
  the product grid instead of delaying products in the first viewport.
- At 360px, the six product sections now begin between 625px and 663px from the page top.

**SEO Impact**

- Preserved all category URLs, metadata, canonicals, structured data, internal links and visible SEO
  copy.
- Moved rather than removed the category introduction, keeping it in server-rendered HTML after the
  primary product range.

**Validation**

- Passed ESLint, TypeScript and the Next.js production build with 91 generated pages.
- Passed SEO, internal-link, snippet-hygiene, performance-budget and secret scans.
- Browser-tested all six categories at 360, 390, 768, 1024, 1280 and 1440 CSS pixels: every route
  returned 200 with one H1, no horizontal overflow, no broken images and no console errors.
- Visually reviewed the MIG/MAG category hero and relocated sourcing overview at mobile, tablet and
  desktop widths.

**Known Issues**

- Product imagery remains the main publication bottleneck: many records still use governed
  family-level references while exact-product rights and identity evidence are pending.

**Next Recommended Step**

- Resolve the P0 product-image evidence queue and promote only approved exact-product assets into the
  canonical registry.

## 2026-08-28 - 15AK Series Publication Gate Correction

**Task**

Corrected the mismatch between the 15AK series publication state and its real image evidence, then
added an automated gate so an indexable series page cannot be created from family-level legacy
images with unresolved usage rights.

**Files Changed**

- `lib/content/product-series-publication.ts` - added the canonical product, image and relationship
  publication evaluator.
- `lib/data/product-series-evidence.ts` and `lib/data/product-series.ts` - retained the 15AK
  candidate while moving it back to evidence review and filtering public series through the gate.
- `lib/content/product-redirects.ts`, `lib/content/site-navigation.ts` and `next.config.ts` - removed
  the premature navigation entry and added a recoverable temporary redirect.
- `scripts/test-product-series-evidence.ts` and `scripts/audit-seo.ts` - enforce image evidence and
  held-series redirect rules.
- `README.md`, `docs/catalog-product-data-audit.md`, `docs/site-wide-upgrade-roadmap.md`, three
  generated readiness reports and the 15AK/MIG-MAG knowledge-base records - synchronized the current
  publication boundary and restoration requirements.
- `knowledge-base/decisions/2026-08-28-15ak-publication-gate-correction.md` - recorded the reusable
  evidence decision.

**Components Changed**

- No UI component was created or removed. The desktop product navigation data no longer exposes the
  held 15AK route.

**Data Changed**

- Changed 15AK from `published` to `evidence_review` and from `reviewed_product_images` to
  `needs_photos`.
- Public product-series count changed from one to zero; the full 15AK candidate, 10 catalog evidence
  records, four reference-only relationships and 15 technical facts remain intact.

**Visual Changes**

- Removed the direct 15AK item from the desktop Products mega menu.
- The MIG/MAG category still presents 15AK as a bounded catalog-reference RFQ choice without a
  misleading public-series link.

**SEO Impact**

- Removed the unready 15AK series URL from the Sitemap and public internal links.
- Added a temporary 307 redirect from the stable series URL to the MIG/MAG category so the held page
  does not return 404 and can be restored at the same URL after evidence approval.
- Production output changed from 91 to 90 generated pages; product, category and guide URLs remain
  unchanged.

**Validation**

- Passed ESLint, TypeScript and the Next.js production build with 90 generated pages.
- Passed product-series evidence, public-series, compatibility, series-component, technical,
  product CSV and image-asset validation.
- Regenerated product-series, component and acquisition readiness reports.
- Passed SEO, built internal-link, snippet-hygiene, performance-budget and secret scans.
- Verified the held URL returns 307 to the MIG/MAG category, Sitemap excludes the series URL, and
  360px/1440px category checks have one H1, no held link, no overflow, no broken image and no console
  error.

**Known Issues**

- The four linked 15AK products still lack rights-approved, exact-product main images.
- All four 15AK relationships remain reference-only and all 15 governed technical facts still need
  exact-SKU confirmation.
- The wider asset registry still contains 43 legacy public references requiring rights review.

**Next Recommended Step**

- Collect and approve exact 15AK main, connection-detail and packaging images for the four canonical
  products, then rerun the gate before restoring the series URL.

## 2026-08-28 - 602 Catalog Identity Conflict And Evidence Queue

**Task**

Reviewed company-catalog PDF page 14 against the official OEM reference, preserved its 602 component
content as governed internal evidence, and blocked the series because the same company page uses a
501D header and 602 complete-torch/technical tables.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added 72 sourced 602 facts, including one
  explicit company-catalog identity conflict and four separately labeled OEM reference facts.
- `data/intake/602-series-confirmation.csv` and `data/intake/602-image-intake.csv` - added 22 stable
  component candidates and 37 exact-image requests for factory review.
- `lib/data/product-series-component-facts.ts` - regenerated the runtime evidence projection.
- `lib/data/product-series-evidence.ts` - marked 602 `DATA_CONFLICT` / `blocked`, recorded the missing
  resolution evidence and excluded blocked records from public category/RFQ projection.
- `scripts/test-product-series-evidence.ts`, `scripts/test-mig-rfq-builder.ts` and
  `scripts/audit-seo.ts` - added blocked-series privacy and projection gates.
- `scripts/report-product-series-readiness.ts` and `scripts/report-acquisition-readiness.ts` - added
  blocked-series counts and 602 resolution guidance.
- `knowledge-base/products/602-series-evidence.md` and
  `knowledge-base/decisions/2026-08-28-602-catalog-identity-conflict.md` - documented sources,
  conflict boundary, candidates and reversal conditions.
- `README.md`, `docs/catalog-product-data-audit.md`, `docs/site-wide-upgrade-roadmap.md`,
  `docs/operations/mig-mag-series-evidence-handoff.md`, the MIG/MAG registry and generated readiness
  reports - synchronized totals and the public/private boundary.

**Components Changed**

- No UI component was created or removed. The MIG/MAG category and RFQ builder now receive nine
  non-blocked catalog-reference families instead of all ten evidence records.

**Data Changed**

- Added 72 field facts, 22 candidates and 37 image requests for the 602 review queue.
- Detailed-series totals are now 589 facts, 189 candidates and 276 image requests across seven
  series; 14 facts remain blocked as `DATA_CONFLICT`.
- Changed 602 from `evidence_review` / `NEEDS_FACTORY_CONFIRMATION` to `blocked` /
  `DATA_CONFLICT` and removed it from buyer-facing family choices.
- Added no SKU, compatibility relationship, approved image or confirmed ArcFort Weld technical
  value.

**Visual Changes**

- The ambiguous 602 family is no longer visible in the MIG/MAG catalog-reference list or RFQ
  selector. No layout or styling changed.

**SEO Impact**

- No URL, metadata, schema, sitemap or robots change. No 602 series page existed or was generated.
- The ambiguous family name and source wording are absent from the built MIG/MAG public page while
  the evidence remains available internally.

**Validation**

- Passed ESLint, TypeScript and the Next.js production build with 90 generated pages.
- Passed product-series evidence, public-series, series-component, MIG/MAG RFQ, compatibility,
  technical, product CSV and image-asset validation.
- Regenerated component, series, acquisition, compatibility, technical, product and image readiness
  reports.
- Passed SEO, built internal-link, snippet-hygiene, performance-budget and secret scans.
- Confirmed the built MIG/MAG category contains no 602 catalog-reference, conflicting page-header or
  602 complete-torch wording.

**Known Issues**

- Factory evidence has not resolved whether the company-catalog page header, table, imagery or more
  than one element is incorrect.
- No exact-product 602 image, controlled water/media connection drawing, canonical SKU or governed
  compatibility relationship is approved.
- The ignored five-series factory workbook predates this queue; the canonical 602 CSVs must be
  reviewed directly until the workbook is deliberately regenerated.

**Next Recommended Step**

- Obtain a factory-signed page identity decision and controlled 602 water/media connection drawing,
  then reconcile candidates and images by stable IDs before considering any public projection.

## 2026-08-29 - Public Product Image Evidence Projection

**Task**

Separated retained product-family reference images from rights-approved exact-product images across
buyer-facing cards, galleries and search-image projection.

**Files Changed**

- `lib/content/product-image-evidence.ts` - added the shared exact-image evidence gate and public
  disclosure states.
- `lib/content/product-images.ts` - limited search-image projection to fully evidenced
  `search_eligible` assets while retaining governed legacy references for labeled display.
- `components/content/ProductVisual.tsx`, `ProductGallery.tsx` and `ProductGalleryViewer.tsx` - added
  compact card disclosure and centralized gallery disclosure without exposing internal evidence.
- `scripts/test-product-image-presentation.ts`, `package.json` and `.github/workflows/quality.yml` -
  added a focused regression test and CI gate.
- `scripts/audit-built-product-image-evidence.ts` - added a post-build audit across public product
  HTML, social metadata, structured data and the image sitemap.
- `README.md` and `docs/QA_CHECKLIST.md` - documented the public-display and search-index boundary.

**Components Changed**

- Changed `ProductVisual` cards to show a restrained image-evidence caption.
- Changed `ProductGalleryViewer` to receive only a public evidence state instead of registry status
  fields.
- Created no new public page or route and removed no component.

**Data Changed**

- No product facts, image files, asset assignments or registry statuses changed.
- Existing `legacy_reference` assets remain buyer-facing migration references but no longer enter
  product metadata, structured data or image sitemap projection.

**Visual Changes**

- Product cards now distinguish family reference imagery from future reviewed exact-product imagery
  with a small caption below the image.
- Existing detail-gallery captions retain the same buyer meaning through one shared evidence helper.

**SEO Impact**

- Product URLs, canonicals, titles, descriptions and page content remain unchanged.
- Only fully evidenced `search_eligible` images may now enter Open Graph metadata, Product/WebPage
  JSON-LD or image sitemap entries. Current legacy references are intentionally excluded.

**Validation**

- Passed the focused public image-presentation test, shared image-readiness test, canonical image
  registry validation and product image-file check. The expected three draft-product image warnings
  remain non-blocking.
- Passed ESLint, TypeScript, product CSV validation, source SEO audit, built internal-link audit,
  snippet hygiene, performance budget and tracked/untracked secret scanning.
- Passed the Next.js production build with 90 generated pages.
- Passed the post-build image-evidence audit across 43 public assets: every legacy reference is
  disclosed, none enters social metadata, structured data or the image sitemap, and zero assets are
  currently projected as rights-approved exact search images.
- Inspected homepage/category product cards and a representative product detail page at 360, 390,
  768, 1024, 1280 and 1440 CSS pixels in the local production server. No horizontal overflow,
  caption clipping, action overflow or browser-console error was found. Temporary review screenshots
  were inspected in the browser and were not retained as repository artifacts.

**Known Issues**

- No current product image has completed the approved-rights, exact-product and source-owner evidence
  gate, so product-specific search-image projection remains empty until reviewed assets are supplied.
- Retained legacy images still require source, usage-rights and exact-SKU review or replacement.

**Next Recommended Step**

- Resolve the four P0 unknown-provenance main images, beginning with the three M6 contact-tip variants,
  using original source files or newly captured exact-product photography.

## Entry Template

```markdown
## YYYY-MM-DD - Task Name

**Task**

Short objective and reason for the change.

**Files Changed**

- `path/to/file` - purpose

**Components Changed**

- Created, changed or removed components; write `None` when not applicable.

**Data Changed**

- Product, company, SEO, analytics or operational data affected; write `None` when not applicable.

**Visual Changes**

- Buyer-visible design impact; write `None` when not applicable.

**SEO Impact**

- URLs, metadata, schema, sitemap or internal-link impact; write `None` when not applicable.

**Validation**

- Commands and manual checks completed.

**Known Issues**

- Missing evidence, blocked checks, drafts and operational risks.

**Next Recommended Step**

- One highest-impact follow-up.
```
