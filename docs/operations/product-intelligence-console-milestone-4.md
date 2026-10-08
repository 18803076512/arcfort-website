# M4 Compatibility, Media And Supporting Records

Date: 2026-09-24
Scope: local implementation toward the approved Console V1 architecture. M4 is not complete.

Latest validation: [cross-page hydration diagnosis](#october-9-cross-page-hydration-diagnosis).
Candidate `83a53697` fails the strict page-error gate after 47 scenarios: React 418/HTML on the
owner's 360px product history page, before packaging. Current closure is **BLOCKED** pending repair.
Earlier `fb22f8aa` passes two native attempts; that non-reproduction did not resolve the fault.
Candidate `74031362` previously
passed [combined native acceptance](#october-8-combined-native-acceptance). Technical documents,
real 15AK evidence and M4 exit remain incomplete. Dated sections retain their historical scopes.

## Objective And Boundaries

Deliver governed compatibility, OEM/reference numbers, packaging, SKU media and technical documents
before frozen preview/release work. Preserve immutable source evidence and explicit human decisions.
The [V1 architecture](../product-intelligence-console-v1-architecture.md) remains the full target;
this sequence does not replace M4 with a read-only inventory or redefine V1 success.

1. **M4-A, media inspection:** SKU view coverage, asset inventory, assignment/rights/match filters,
   recorded-hash duplicates and private read boundaries. Implemented locally; fresh CI pending.
2. **M4-B, governed relationship and media commands:** exact endpoints/variants, immutable source
   bindings, proposals, review, effective/current revisions, stale-save/idempotency controls and
   readiness integration. Exact compatibility source intake and private relationship revisions/
   review are prepared locally as M4-B1/B2 below, with command contracts in M4-B3 and local
   compatibility reads/UI in M4-B4. Media mutations remain unimplemented. Asset-global approval
   cannot substitute for per-SKU match.
3. **M4-C, OEM/packaging/document workbench:** typed evidence-backed records, private document links
   and bounded review, without inventing references or commercial terms. Not implemented.
4. **M4-D, full acceptance:** real Auth/RLS/PostgREST, persistence, role revocation, browser workflows,
   concurrency and negative publication controls for the exact candidate. Not complete.

No hosted migration, local database switch, reset, import replay, authority cutover, merge or
deployment is included. The accepted Docker/M3 baseline and all adopted data remain untouched.
The September M3 push approval does not silently authorize new M4 external writes.

## M4-A Implementation

- `lib/domain/catalog/media.ts`: coverage and recorded-approval interpretation; restricted public
  thumbnail paths and SHA-256-format checks. No evidence is modified.
- `lib/console/media.ts`: current-session/current-role reads of existing RLS tables. Parent pages
  contain 25 products/assets. Related rows are fetched in counted 250-row requests for only that
  page; a lower provider cap is followed until the exact total is reached. Empty/duplicate/drifting
  or excessive results fail closed. There is a 10,000-row per-related-query safety limit, not silent
  truncation. Multi-request reads are not claimed to be an atomic database snapshot.
- `/console/media`: SKU Coverage and Asset Inventory. Products link to scoped media and back to
  their evidence record; navigation adds Product Media. Searches and filters are GET-only.
  Main/detail/package missing-mapping filters execute in PostgREST before count/pagination, never
  by filtering only the current page's rendered rows.
- `MediaWorkspace`: existing Console table/tab/status patterns, missing main/detail/package
  mapping, multiple-main warning, incomplete approval, unassigned asset and same-recorded-hash
  warnings. Existing public reference thumbnails open at their recorded local paths.
- `CatalogViews` pagination retains media view/filter parameters. No public route, canonical,
  sitemap, RFQ behavior or database schema changes.

The source owner and approver identifier are used server-side only to derive presence flags.
DTOs omit their values, raw snapshots, private paths/buckets, source files and internal notes.
No private Storage URL is signed; no original file is uploaded, edited or exported.

### Evidence Interpretation

"Mapped" means a relationship row exists, not that the file is present or correct. Detail coverage
uses explicitly typed thread/hole/surface/dimension/technical views; generic gallery, front and
45-degree views do not silently satisfy that check. These are intake indicators, not new release
requirements. A recorded asset approval requires the existing search-eligible, approved-rights,
exact-product, source/owner and human-attribution metadata. It is not proof of a new approval or
of exact match for every SKU sharing the asset.

Duplicate warnings compare existing valid SHA-256 fields across the visible assets' entire
matching set, including other pages. They do not hash storage files or infer duplicate geometry.
Missing/invalid hashes remain explicit unknowns. Filename checks only validate the allowed public
reference path; private original naming and content-hash ingestion remain M4-B work.

The anti-join and empty-embedding query follows the official
[PostgREST resource-embedding contract](https://postgrest.org/en/stable/references/api/resource_embedding.html#null-filtering-on-embedded-resources).
TypeScript and transport tests are not a substitute for an actual PostgREST/RLS run.

## Local Validation

Run with the bundled Node runtime / locked repository dependencies:

| Check                                                | Result / scope                                                                                                                                                                                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run console:media:test`                         | PASS: five groups covering evidence, filters, paths, actual Supabase query construction with synthetic transport, 1,103 related rows, beyond-row-cap parent pagination, cross-page hash lookup, current-role denial and fail-closed reads |
| `npm run console:commands:test`                      | PASS: eight existing command groups                                                                                                                                                                                                       |
| `npm run console:boundaries:test`                    | PASS: local mail, configuration, origin, form, authorization and layout contracts                                                                                                                                                         |
| `npm run console:entrance:test`                      | PASS: offline entrance/security contracts                                                                                                                                                                                                 |
| `npm run console:media:ui:test`                      | PASS using installed Edge: GET filters, tabs, empty/missing/duplicate states, actual image loads, keyboard order, ten screenshots at 360/390/768/1024/1440; zero page errors, external requests or mutations                              |
| `npm run console:ui:test`                            | PASS: existing M3 synthetic browser regression and thirteen screenshots                                                                                                                                                                   |
| `npm run lint`, `npm run typecheck`, `npm run build` | PASS; 93 static outputs, media remains dynamic                                                                                                                                                                                            |
| `npm run performance:budget`                         | PASS; budgets unchanged                                                                                                                                                                                                                   |
| `npm run seo:audit`, `npm run seo:links`             | PASS; 40 indexable products, zero public series, no broken audited links                                                                                                                                                                  |
| `npm run security:secrets`, `git diff --check`       | PASS; repeat after documentation changes                                                                                                                                                                                                  |
| Owned local production-mode privacy probe            | PASS for three media URLs with Console disabled: no catalog payload, private/no-store/noindex/no-referrer and login destination; test server stopped                                                                                      |
| Fresh real Auth/RLS/PostgREST                        | NOT RUN for this candidate; disposable CI tests extended, including positive unassigned/hash controls, scoped lookup, revoked viewer, DTO sentinel and 1,103-product pagination                                                           |

Synthetic UI artifacts are ignored under `.tmp/console-media-ui/`. The optional fixture remains
loopback-only at `http://127.0.0.1:3901/console/media`; it has no database or Auth connection and must
not be deployed. Missing default Playwright Chromium was handled using installed Edge, without
installing a browser or changing system security. An incorrect fixture image root and ambiguous
select labels were found, fixed and re-tested before the final PASS.

## Gate And Next Action

Local implementation and offline/UI checks are complete. The M4-A integration/release gate is
**BLOCKED** pending fresh candidate-specific real database CI. This is not a whole-goal impasse:
the remaining M4 design/implementation can continue within the local boundary. No owner approval,
publication readiness, live deployment or completed M4/V1 is inferred from these checks.

Request separately scoped review/commit/push approval for
`18803076512/arcfort-website`, branch `codex/v2-industrial-brand-system`, CI only, retaining its
existing Vercel deployment suppression. Do not run the disposable fixture test against adopted local
`postgres` or hosted staging. After acceptance, implement exact-SKU media/compatibility revisions
and review while collecting real 15AK Level A and exact-image evidence.

Rollback is code-only: remove the new read surface with a reviewed patch; no data recovery, database
rollback or public source change is needed. Do not discard unrelated work.

## M4-B1 Compatibility Source Intake

Local implementation checkpoint: 2026-09-24. This is a prerequisite of the complete compatibility
editor, not a finished owner-facing workflow or an accepted M4 release.

### Files And Behavior

- Migration `202609240010_product_intelligence_compatibility_sources.sql` adds one forced-RLS,
  append-only source-binding table, two identity lookup indexes, exact target validation, private
  idempotent product-entity/source-intake commands and source-match/eligibility helpers. All older
  migrations, original public table columns, public RPCs and readiness views remain unchanged.
- Source and endpoint metadata hashes bind the exact directed SKU relationship, assembly scope,
  component role and document version/location. Wrong targets, scope reuse, ambiguous aliases,
  changed endpoints, malformed inputs and revoked/unauthorized actors fail closed. Bound source
  rows cannot be rewritten even through a privileged transaction capability.
- Supporting evidence, contradictions and catalog grouping remain distinct. A qualifying source
  is not an approval. No compatibility relationship, verification event or publish record is
  created by these commands. There is no new HTTP endpoint or UI and no original file upload.
- `lib/supabase/database.types.ts` is regenerated using the official embedded public-schema
  generator. `scripts/console/validate-product-intelligence-migrations.ts` includes migration 10;
  `scripts/console/sql-runtime/test-authority.mjs` additionally checks all four imported 15AK
  relationships and their unchanged entities/evidence. The new SQL suite covers source commands.
- The [dated decision](../../knowledge-base/decisions/2026-09-24-console-m4-compatibility-evidence.md)
  retains evidence semantics, scope limits and future review requirements. Goal status and the
  append-only AI change log record the checkpoint.

No canonical product, compatibility, media or business data changed. Tests used a credential-free
in-memory database only; the adopted local database, three archives/template and hosted project
were not contacted. Public routes, visual components, SEO and RFQ remain unchanged by M4-B1.

### Validation And Remaining Gate

- `console:authority:test:embedded`: PASS, ten migrations, ten suites / 325 assertions including
  79 new source tests, negative runner controls, two exact 17-table imports, original 15 technical
  scopes and four actual reference relationships preserved. Tests prove the four SKU-directed
  relationship types, RLS reads, current-role rejection, receipts and transactional rollback.
- Official embedded public-schema type parity: PASS; generated types were not hand-edited.
  Full CLI byte parity is still required. A single existing function-argument layout is also
  reformatted by this generation; it is not an RPC signature change or proof of CLI parity.
- `console:migrations:validate`, `compatibility:validate`, `compatibility:report`, lint and
  TypeScript: PASS. The canonical report retains four reference-only / zero confirmed records.
- Production build: PASS, captured exit 0 and 93 static outputs; Console routes remain dynamic.
  A previous build's session handle was lost across continuation and its process was confirmed
  absent before this completed rerun; no success is inferred from the interrupted observation.
- Performance, SEO and built internal links: PASS, budgets unchanged, 40 indexable products,
  zero public series and 80 HTML / two dynamic source pages audited. Secret scan: PASS, 544 text
  files including untracked changes. `git diff --check`: PASS (only existing CRLF policy warnings).
- No new UI was implemented in M4-B1, so no new visual/browser claim is made. M4-A synthetic
  screenshots remain scoped to its prior unchanged UI, not proof of a database-backed editor.
- NOT RUN: fresh real PostgreSQL/Supabase reset + both pgTAP runners + full CLI types + real
  Auth/PostgREST/concurrent/persisted-browser acceptance. Do not run disposable acceptance against
  retained adopted data. Embedded role claims are not actual Auth tokens.

Release status remains **BLOCKED** for this uncommitted M4 candidate, while safe local implementation
can continue. The pending M4-A-only push question does not automatically cover this new schema batch.
No push, merge, hosted migration, deployment, authority change or real-data approval occurred.

Next implement compatibility proposal/current-head history, submitted-digest human decisions and
effective readiness integration, then local-only application contracts and owner UI. Complete
media mapping/review and OEM/packaging/documents, followed by full-stack acceptance and the real
15AK evidence/preview/QA/publishing pilot. None of these requirements is removed by this checkpoint.

## M4-B2 Compatibility Revisions And Human Review

Local implementation checkpoint: 2026-09-25. This completes the private SQL revision/review batch,
not a usable owner-facing compatibility editor, accepted M4 release or full V1/15AK pilot.
Reviewed as uncommitted M4 working-tree changes on `codex/v2-industrial-brand-system`, based on
`b88c67fee7aadc05e02fc13d1dc94e52e15ecd92`; the earlier commit's CI does not validate these changes.

### Files And Behavior

- Migration `202609240011_product_intelligence_compatibility_review.sql` adds forced-RLS revision
  heads/history, one-open-revision and current-pointer indexes, private propose/submit/review
  commands and an exact-approval trigger. All earlier migrations remain untouched. No new public
  RPC, HTTP endpoint, service/client write grant or private-command EXECUTE grant is added.
- Roots retain exact directed endpoints/type/scope. Proposals append candidate/evidence rows,
  preserving originals/current values and predecessor history. Strict inputs, current-role checks,
  authority/role locking, revision checks and actor/request receipts reject unauthorized, stale,
  conflicting, duplicated or changed retry payloads atomically.
- Submit binds the complete candidate/source/endpoint digest. APPROVE requires matching Level A
  relationship evidence and a server-attributed exact decision. EDIT creates an unconfirmed
  successor and retains unresolved conflict. REJECT retains the prior current value; rejected
  first proposals never become current. Historical confirmed rows are not rewritten.
- `pi_effective_compatibility_relationships` preserves caller RLS and separates current/open rows
  from history. Readiness and dashboard queries now use this projection. Any effective unconfirmed
  relationship blocks readiness even alongside another approval, and open proposals prevent
  VERIFIED. Existing technical/media/SEO/QA/publishing checks remain. Zero relationships is not
  proof of required compatibility coverage; category-specific coverage still needs release policy.
- `lib/supabase/database.types.ts`, the migration validator and embedded real-source runner cover
  the new schema. The SQL suite covers the command/guard/state boundaries. The
  [dated decision](../../knowledge-base/decisions/2026-09-25-console-m4-compatibility-revisions.md),
  Goal status and AI change log preserve the rule and its limits.

No canonical product, compatibility, media, identity or commercial data changed. Actual source
records are loaded only into a credential-free in-memory test. No retained local/hosted migration,
database switch, reset, import replay, public-source cutover, commit, push or deployment occurred.
No UI component, public URL, metadata, structured data, RFQ or public visual behavior changes here.

### Validation And Remaining Gate

- `console:authority:test:embedded`: PASS, eleven migrations and eleven suites / 417 assertions,
  including 92 compatibility review checks, negative controls, two exact 17-table imports, all
  fifteen original technical scopes and four actual reference-only relationships preserved.
  Four real-source compatibility proposals retain original current pointers and complete original
  rows, with zero confirmation events or publications. Successful approval fixtures are synthetic.
- The additional exact-source guard test constructs a matching event/digest with an unbound generic
  source and proves confirmation is still rejected. Prior tests cover timestamp EDIT, wrong digest,
  source/scope/role mismatch, conflict carry-forward, prior-approved-plus-pending readiness,
  rejected first/current history, immutable confirmed rows and revoked actor receipt/read denial.
- Official embedded public-schema type parity, migration validation, canonical compatibility
  validation/report, standalone lint and TypeScript: PASS. Canonical compatibility remains four
  reference-only / zero confirmed records. Full CLI type-byte parity is not claimed.
- Production build: PASS, captured exit 0 and all 93 static outputs; Console remains dynamic.
  Performance budgets, SEO (40 indexable products / zero public series), built internal links
  (80 HTML / two dynamic source pages) and secret scan (547 text files including untracked changes)
  pass. No new UI was implemented; no new browser or visual acceptance is claimed in M4-B2.
- NOT RUN for this candidate: fresh real PostgreSQL with both pgTAP runners, full CLI types,
  actual Auth/PostgREST, multi-connection races and database-backed browser acceptance. Simulated
  JWT claims in embedded tests are not real Auth tokens. Existing M4-A screenshots do not prove a
  compatibility editor. Do not run a disposable reset/import against any adopted database.

Release gate: **BLOCKED**, while safe local implementation can continue. No whole-goal impasse or
completed V1 is implied. The older M4-A-only CI question does not authorize this schema batch.
Before external submission, review the full candidate and obtain scoped CI-only branch approval.

Next connect typed local-only compatibility command/read contracts and the owner editor/review UI;
then finish exact-SKU media mapping/review and OEM/packaging/documents, full-stack acceptance and the
real 15AK source/approval/preview/QA/publication workflow. Preserve all evidence requirements.

## M4-B3 Local Compatibility Command Contract

Local implementation checkpoint: 2026-09-25. The five application commands are prepared; compatibility
read models and owner-facing UI are not yet implemented. This is not full M4 or V1 acceptance.

### Files And Behavior

- `lib/domain/catalog/compatibility.ts` defines the four SKU-directed relationship types, exact
  relationship copy, source fields and five action names. `lib/domain/catalog/commands.ts` strictly
  validates them and reuses technical evidence-link/reason/date checks. The new source selector is
  an intake declaration, never factual confirmation. Review decision arrays are rejected explicitly.
- `lib/console/commands.ts` maps typed actions to exact SQL arguments and command-specific minimal
  result shapes. Current roles are rechecked before each dispatch/retry. New identity receipts must
  match the requested SKU UUID; case-only UUID spelling does not create a false failed result.
  Existing CSRF, bounded JSON parsing, retry IDs and sanitized errors remain shared.
- `lib/console/working-config.ts` requires `CONSOLE_COMPATIBILITY_ENABLED=true` in addition to the
  complete existing exact-loopback working configuration. `.env.example` defaults it to false.
  No active environment file was changed. The flag controls application dispatch, not direct SQL
  privilege; the database independently enforces current actor/adopted scope/evidence.
- Migration `202609250012_product_intelligence_compatibility_commands.sql` prepares five narrow
  authenticated-only wrappers, delegating to the existing private commands. New root is an optional
  final SQL argument; all other target/version/evidence/decision inputs remain explicit. No adoption,
  account/role grant, direct table write grant or publication is introduced.
- Generated database types, migration validator, new SQL/TypeScript tests, package script and
  existing quality workflow include the contract. New reusable rules are retained in the
  [command decision](../../knowledge-base/decisions/2026-09-25-console-m4-compatibility-commands.md).

This is uncommitted local M4 code based on `b88c67fee7aadc05e02fc13d1dc94e52e15ecd92`, not a new CI
pass for that commit. No retained/hosted database was migrated or reset, no real source was approved,
and no public product data, URL, SEO, RFQ or visual component changed. The complete 15AK workflow,
media operations, supporting records and frozen preview/QA/publication remain required.

### Validation And Remaining Gate

- Embedded SQL and official public-schema type parity: PASS, twelve migrations, twelve suites /
  448 assertions, including 31 new wrapper checks. The wrapper tests use actual SQL role switches
  for authenticated, anon and service roles, and prove editor/reviewer/owner separation, idempotent
  decisions, immutable predecessor retention and no publication. Full CLI byte parity is not proven.
- `console:compatibility:test`: PASS, six groups for default-off/exact-local gating, strict payloads,
  role matrix, actual Supabase request serialization through synthetic fetch, minimal receipts,
  revoked/unverified sessions and malformed/private provider results. The review-array regression
  first failed, then passed after strict string validation. Auth and network responses here are
  synthetic, not proof of an actual provider call.
- `console:commands:test`: PASS, all eight existing groups. Boundary, entrance and migration checks:
  PASS. Standalone TypeScript and full lint: PASS, with focused lint rerun after the parser fix.
  The first lint session handle was lost, its process was confirmed absent, and a new full run
  completed with captured exit 0; no success is inferred from the missing session.
- Production build: PASS, captured exit 0 and all 93 static outputs. Standalone TypeScript was
  rerun after the final parser change and passes. Public performance budgets, SEO (40 indexable
  products / zero series), built internal links (80 HTML / two dynamic source pages) and secret
  scanning (552 text files including untracked changes) pass. Public visual behavior is unchanged.
- NOT RUN: current-candidate real PostgreSQL/native runners/CLI types, actual Auth/PostgREST,
  multi-connection races and persisted UI acceptance. No new browser acceptance is claimed because
  this batch adds no UI. Do not run disposable resets/imports against retained adopted data.

Release gate remains **BLOCKED**, not a whole-goal impasse. No push, merge, migration, deployment or
real product approval is authorized by these results. Next implement bounded current/source/history
reads and the owner compatibility workbench, then validate the complete persisted flow with genuine
15AK evidence. Keep M3 external-write and older M4-A-only question scopes separate from this batch.

## M4-B4 Compatibility Workbench

Local checkpoint: 2026-09-26. This is uncommitted work on top of
`b88c67fee7aadc05e02fc13d1dc94e52e15ecd92`, not an accepted database deployment or a CI result.

### Files And User Workflow

- New `lib/console/compatibility.ts` reads the exact SKU's identity, immutable reference, current
  relationships, pending proposals, bound sources and minimal paginated decision history. Recorded
  targets support type/literal-name search and 25-row pagination. Unknown roots do not select an
  unrelated relationship. `lib/console/read-pages.ts` extracts the media reader's counted-row
  mechanism; `lib/console/media.ts` reuses it without changing evidence semantics.
- New `components/console/CompatibilityWorkbench.tsx` provides identity creation, exact target /
  assembly scope / component role, source intake, proposal save, submission and human review.
  Three separate comparisons retain reference/current/candidate meaning. Source assertion, basis,
  document revision and location remain visible. Pending conflicts cannot be overwritten by an
  ordinary save. Missing exact evidence and company-catalog-only evidence cannot enable approval.
- New protected `/console/products/[id]/compatibility` route and `ProductWorkingNav` link are gated
  by the existing compatibility flag; product overview/edit/review/history pass that gate to the
  navigation. The feature remains disabled in active configuration. No new role grant or schema is
  introduced in B4.
- Existing Console styles are reused, with a scoped form alignment rule in `console.css`. Mobile
  comparisons stack; a new relationship omits empty comparison columns. Stable accessible labels,
  keyboard access, unsaved-change warnings, scope interlocks and retry preservation are exercised.
  Newly recorded sources survive local relationship switching without implicitly linking them.
- Synthetic fixture, read/browser tests, package commands, quality read-test step and fixture README
  are added. The dated [workbench decision](../../knowledge-base/decisions/2026-09-26-console-m4-compatibility-workbench.md)
  owns reusable read-completeness and UI approval boundaries. Goal status and AI changelog are updated.

The data map remains repository-authoritative for public pages. Four real relationships remain
reference-only; no product/source/image record was changed outside synthetic test memory. No
retained database, archive, WSL distribution or container was reset. Public URLs, SEO, RFQ, sitemap
and deployment settings are unchanged. No M4 commit/push/merge/deploy or hosted migration occurred.

### Candidate Evidence

- `console:compatibility:reads:test`: PASS, four groups using the actual Supabase request builder
  with synthetic fetch/Auth. Includes exact-SKU reads, lower provider caps, 1,103 relationships,
  duplicate/count drift/early-empty/bound failures, missing current/source/target rejection,
  current roles, disabled gate, literal search, target page 41 and SKU/root-scoped history query.
  This proves serialization and mapping, not execution of the embedded PostgREST joins.
- `console:compatibility:ui:test`: PASS, eleven groups and eighteen screenshots at 360, 390, 768,
  1024, 1280 and 1440 px. Covers identity, save/retry, exact revision/digest, stale state, explicit
  APPROVE/EDIT/REJECT, conflict resolution, role restrictions, company-catalog-only denial, source
  intake/interlocks/retention, changed-scope warnings, target/history navigation, keyboard access
  and overflow. Zero page errors, unexpected console warnings/errors or external requests. Expected
  503/409 command failures are explicitly separated from console regressions. A transient development
  issue indicator seen during screenshot review did not recur in the fresh instrumented run or its
  final screenshots; no unsupported root cause is claimed. Actual commands are intercepted synthetic
  responses, not persisted product changes. Screenshots were visually inspected.
- `console:ui:test` and `console:media:ui:test`: PASS, existing editor regression / thirteen
  screenshots and media regression / ten screenshots with existing public reference images.
  `console:media:test`: PASS, all five groups after the shared reader extraction.
- `console:compatibility:test` / `console:commands:test`: PASS, six and eight groups. Boundary and
  entrance tests pass. Embedded SQL rerun passes twelve suites / 448 assertions, official embedded
  public-schema type parity, two 17-table shadow replays and all real-source retention controls.
  No retained or external database is used by this embedded test.
- Full lint, standalone TypeScript and final production build: PASS; build captured exit 0 and
  93 static outputs. Compatibility remains dynamic (5.27 kB route / 116 kB first load in this build).
  One interrupted build handle disappeared; process absence was checked before fresh successful
  reruns. No success is inferred from that lost handle.
- Public performance budgets, SEO (40 indexable products / zero public series), built links
  (80 HTML / two dynamic source pages) and repository secret scan pass. No public source/data diff
  exists. No new source fact or exact-product evidence is inferred from these code checks.

### Remaining Release Gate

Release status: **BLOCKED**. This is a release gate, not an impasse for continued local development.
Current-candidate actual Auth/PostgREST/RLS, persisted browser behavior, concurrent sessions, full
native CLI type parity and fresh CI remain required. Target identity creation beyond the exact SKU
entity, governed media writes, OEM/packaging/documents, verified preview and publication are not
completed. Real 15AK Level A evidence and owner decisions remain necessary; synthetic approval does
not supply them. No release destination is authorized by the UI tests.

The loopback fixture at port 3901 can be used for visual inspection only; it cannot save records
manually. It is not a preview of verified public product data. Next prepare and verify an isolated
full-stack compatibility acceptance run without resetting/switching adopted data, then complete
the remaining media/supporting-record work toward the full pilot.

## M4-B5 Isolated Acceptance Preparation

Local checkpoint: 2026-09-26, uncommitted on `b88c67fee7aadc05e02fc13d1dc94e52e15ecd92`.
This section records runner implementation, **not a successful full-stack execution**.

`scripts/console/test-compatibility-isolated.ts` extends the existing pristine-runner sequence with
real-client entity/source/proposal/submission/review requests. It reuses disposable SKU
`AF-MIG-TS-9996` and an existing recorded series target, without changing real target metadata or
creating another product. Prepared checks cover role denials, immutable bound sources, failed-command
rollback, source-free and catalog-only approval refusal, conflict-preserving EDIT, explicit conflict
resolution, observed lock contention, same-request approval receipts, reviewer attribution, joined
history, exact-SKU isolation and revoked-session denial. Ordinary concurrent saves are exercised
before introducing conflict because the database intentionally prohibits ordinary conflict edits.

`scripts/console/test-compatibility-working-browser.ts` adds seven planned browser scenario groups
to the same owned production server and authenticated contexts. It reuses disposable browser SKU
`AF-MIG-TS-9998`. Forms create identity, select a recorded target, save/submit, explicitly link two
new evidence sources, EDIT, resolve a conflict and APPROVE, reject a follow-up, preserve stale-tab
input and deny a cached approval after revocation. Independent readers check persistence/history.
Six additional responsive screenshots are requested at 360, 390, 768, 1024, 1280 and 1440 px; none
has been produced by this new runner yet. HTTP responses pass through unchanged, not synthetic
intercepts. The report counts actual screenshots instead of a hardcoded M3 total.

### Safety And Retention

- `test-working-isolated.ts` remains the only executable entry point. It requires the exact local
  CI invocation, CLI-discovered loopback credentials, invite-only local Auth, expected Docker
  container identity and pristine imported data before synthetic accounts or writes. It now also
  requires zero compatibility heads, revisions and source bindings; a missing new table fails before
  writes. Existing accounts, adoption or work are not reset. Do not execute it on the retained stack.
- Compatibility opt-in is explicit in the runner-owned server configuration. Ambient application
  flags, service credentials and remote URLs are not inherited. The default server helper remains
  compatibility-disabled. No active `.env` file or retained/hosted feature setting changed.
- After API/browser acceptance, original compatibility entities, relationship rows, evidence sources
  and all links for original relationships must match their initial row snapshots. Existing product /
  technical retention checks remain; the expected synthetic product count is still three and
  publication count must remain zero. No real 15AK fitment is approved by these synthetic checks.
- The existing disposable CI step is renamed to identify M3 plus compatibility coverage; no new
  reset, hosted destination, permission or deployment step is added. M3 authorization and an older
  M4-A-only question do not authorize submitting the current M4-A/B1-B5 candidate. A new exact-branch
  CI-only approval was requested and has not been assumed.

### Evidence And Remaining Work

Local guard tests pass (eight target/baseline groups and five server-environment groups), including
an actual integrated-runner invocation with an invalid target that exits at preflight before host
or provider access. The new
RPC spelling was corrected against generated types; source-free approval and missing conflict
resolution retain their distinct database error contracts. Six compatibility command groups, four
synthetic read groups and all 448 embedded SQL assertions pass. Embedded official type parity and
two 17-table replays also pass. These checks do not execute the new actual Auth/PostgREST/browser
sequence, nor prove its selectors, joined requests or multi-connection behavior at runtime.
Final standalone TypeScript, changed-script ESLint with zero warnings, scoped formatting and the
562-file secret scan pass. Public data/source directories have no diff. No application component
changed in this batch, so the production build and visual browser suite were not rerun; B4's earlier
results retain their original scope. The new full-stack responsive screenshots remain outstanding.

The new full-stack runner, native CLI parity and fresh candidate CI remain **NOT RUN**. No retained
or hosted migration, database switch, reset, import, actual approval, commit/push, merge or deployment
occurred during this preparation. The read-only Windows prerequisite recheck was not executed because
the tool approval service returned an authentication error; the historical accepted Docker repair
record was not replaced with a new success claim. No Windows setting or reboot was performed.

Release status remains **BLOCKED** pending real full-stack evidence and destination authorization.
This is progress toward independent compatibility management and human review, not completion of
M4 or the twelve V1 criteria. Next run the reviewed candidate in authorized disposable CI, fix and
rerun any actual integration failures, then continue media/supporting records and the real 15AK
verified preview/QA/publication pilot.

## M4-B6 Exact-SKU Media Source Intake

Local checkpoint: 2026-09-26, uncommitted on `b88c67fee7aadc05e02fc13d1dc94e52e15ecd92`.
This prepares source metadata only, not a working upload/mapping/approval interface.

### Implementation And Evidence Boundary

- New migration `202609260013_product_intelligence_media_sources.sql` adds forced-RLS immutable
  `media_source_bindings`, private source intake, exact-scope matching and declared-metadata review
  eligibility. Rights and product-match evidence have separate dimensions and qualifying bases.
  Existing current-role, authority, capability, idempotency and audit patterns are reused.
- Bindings fingerprint the actual source/asset rows and product identity. They cannot be reused
  across SKU, asset, role or dimension, including assets with the same recorded file hash. A product
  must actually exist, not merely occur in an adoption's pilot-ID list. Direct writes remain frozen;
  bound sources/bindings cannot be edited, deleted or truncated through the intake capability.
- No public command wrapper, UI, upload, assignment, review event, storage policy or readiness
  change is included. Original files and geometry are untouched. Metadata eligibility does not
  authenticate evidence, grant rights, verify image bytes or establish exact-product identity.
- New `product_intelligence_media_sources.test.sql`, updated migration validator and embedded
  runner cover this boundary. `lib/supabase/database.types.ts` public-schema types are generated
  using the existing official Supabase generator; no handwritten schema member is substituted.
  The dated [media decision](../../knowledge-base/decisions/2026-09-26-console-m4-media-evidence.md)
  owns reusable semantics; media inspection knowledge, Goal status and AI changelog link this batch.

### Validation

`console:authority:test:embedded` passes 13 migrations / 13 suites / **528 pgTAP assertions**,
including 80 new media checks. Coverage includes current roles and revoked retries, actor receipts,
exact scope, timezone invariance, changed metadata, independent rights/match bases, retained
contradictions, strict fields/dates, existing technical/compatibility non-substitution, RLS and
immutability. Asset/mapping/product rows are compared in full after normal intake. Separate
privileged drift probes each begin with matching evidence and are confined to the fixture transaction.
The strict single-transaction test adapter was preserved, not weakened to permit nested transaction
control. A missing-product negative control exposed and verified the explicit existence check.

Both 17-table real-source shadow replays and adoption negative controls pass. Import creates zero
media bindings. Four subsequent, explicitly synthetic catalog-reference intakes exercise the actual
imported 15AK SKU/main-asset identities; none qualifies for rights or product-match review. Every
original media/assignment row remains identical, with zero verification/publication events. These
fixtures live only in the embedded database, not the retained or hosted catalog.

Official embedded public-schema type parity, migration validation and standalone TypeScript pass.
The independent SQL-report unit baseline is updated from the M3 count to the verified 13 suites /
528 assertions, with an added nested-transaction rejection control; no result gate is relaxed.
Its strict-report and runner-preflight tests pass. Final changed-script ESLint (zero warnings),
scoped Prettier, `git diff --check` and the 565-file secret scan pass; public data/source directories
have no diff. Goal documentation received only the scoped phase insertion, without table reformatting.
Actual Supabase Auth/PostgREST, multi-connection locking, persisted browser behavior, full native
CLI parity and current-candidate CI are not proven by this embedded run. No new frontend behavior
was introduced, so this batch does not rerun or enlarge B4's build/visual claims.

### Rollout And Remaining Work

No commit/push/merge, retained/hosted migration, database reset/switch/import, active flag, canonical
product evidence, SEO, public URL or RFQ behavior changed. The pending exact-branch M4-A/B1-B5 CI-only
submission question does not cover this new B6 migration; do not silently include it under that
scope. The Windows prerequisite recheck was not executed because automatic approval review hit its
usage limit. No Windows/Docker setting or restart occurred, and historical recovery evidence is not
presented as a fresh system check.

Release remains **BLOCKED**, not a halt to local development. The next media work must connect
verified original-file intake, immutable SKU mapping revisions and explicit rights/match review to
the owner interface, then run real disposable full-stack acceptance. OEM/packaging/documents,
verified preview, release QA, publication and real owner-supplied 15AK evidence remain required.

## M4-B7 Private Original Intake Foundation

Local checkpoint: 2026-09-27, uncommitted on `b88c67fee7aadc05e02fc13d1dc94e52e15ecd92`.
This completes the original-intake foundation only, not the owner upload or media review workflow.

### Implementation

- Migration `202609260014_product_intelligence_original_intake.sql` adds immutable forced-RLS
  intent/completion ledgers, actor-scoped request receipts, SKU identity checks, generated paths and
  exact Storage metadata matching. Restrictive insert/update/delete policies apply only to the new
  `working-originals/` namespace. Existing unmanaged/evidence policies remain unchanged.
- Original identity/provenance cannot be replaced after completion. New assets remain private,
  blocked and unapproved, with `byte_verification: not_attested`; no product mapping or verification
  event is created. Private commands are not exposed by new RPC wrappers or an HTTP endpoint.
- `lib/console/original-files.ts` performs bounded stream reads, signature/MIME/extension checks,
  full single-raster decoding, dimension/pixel limits and SHA-256 of unchanged original bytes. It
  rejects corrupt/vector/animated input and unsafe filenames, preserves EXIF orientation, cancels
  failed reads and returns sanitized errors. Final review fixed empty reads bypassing the count bound.
- Sharp `0.34.5` becomes an explicit dependency at its already installed version. The lockfile only
  changes root/optional classification, not versions or integrity. The actual-byte test is wired
  into the quality job. Bootstrap Storage columns are synthetic in-memory fixtures only; no managed
  Storage schema is modified. Types are generated with the existing official Supabase generator.
- The [dated decision](../../knowledge-base/decisions/2026-09-27-console-m4-original-intake.md) owns
  API/metadata/byte/approval distinctions, namespace scope, service bypass and retention limitations.

### Validation

All 14 embedded suites / **598 pgTAP assertions** pass, including **70 original-intake checks**.
The new suite covers adoption/roles, actor and payload identity, unsafe manifests, actual authenticated
RLS evaluation, generated paths, denied overwrite/move/delete, unchanged legacy policy, idempotent
completion, wrong object owner/size/MIME, immutable rows, stale SKU identity and revoked retries.
Its direct Storage-row inserts are rollback-only synthetic fixtures, not uploads to a provider.
Official public-schema type parity, both 17-table shadow replays and existing real-source retention
checks pass. No real 15AK evidence or approval was created by those tests.

`console:originals:test` passes six groups using generated raster buffers, including all four formats,
corruption/truncation, real two-frame WebP rejection, byte-identical oriented JPEG, pixel/byte bounds,
empty-chunk cancellation and an actual 15-second stalled-read timeout. These files are synthetic and
not saved as product assets. TypeScript, targeted zero-warning lint, migration validation and the
strict 14-suite / 598-assertion SQL-report test pass. Production build exits 0 with 93 static outputs.
The original-file module has no application route caller yet; a green build is not upload acceptance.

Final scoped formatting, performance budgets, SEO audit, built internal-link audit (80 HTML plus two
dynamic source pages), company evidence validation/tests and the 570-file secret scan pass. The
regenerated Goal report updates schema/test inventory to 14/598 and still reports zero strict
verified SKUs. Existing legacy media/company-evidence warnings remain; no canonical/public source
directory has a diff.

Actual Auth/PostgREST/Storage API round trips, provider object bytes, multi-connection races, native
CLI type parity and fresh candidate CI remain unverified. No new user-facing controls were added,
so no new responsive/browser acceptance is claimed. UI upload, object readback, immutable mapping
review, independent rights/match decisions and release readiness remain required.

### Rollout And Next Gate

No commit/push/merge/deployment, retained/hosted migration, reset/reimport, active setting, public
product data, image geometry, public URL, SEO or RFQ behavior changed. B7 is not included in the
unanswered M4-A/B1-B5 CI-only question. Do not run disposable acceptance over the adopted stack.
The latest read-only Windows check separately confirms VirtualMachinePlatform enabled, a present
hypervisor, Engine 29.8.0 responding and seven running containers (six healthy, REST without a
healthcheck). This is fresh host health, not a new database-retention or M4 acceptance result; no
Windows/Docker change or restart was performed.

Next connect authenticated user-client upload and full object readback to an owner-facing SKU intake,
with bounded request/concurrency handling, stable retries and no leaked private paths or service key.
Then exercise the real disposable Storage/Auth/browser stack before treating intake as usable.
Release remains **BLOCKED** while local development continues; M4, V1 and the real 15AK pilot are
not complete. OEM/packaging/documents, verified preview, QA and authorized publication are still open.

## M4-B8 Original Upload And Readback

Local checkpoint: 2026-09-27, uncommitted on `b88c67fee7aadc05e02fc13d1dc94e52e15ecd92`.
This connects the B7 foundation to an intake UI; it does not complete real Storage acceptance or
the SKU media approval workflow.

### Implementation

- Migration `202609270015_product_intelligence_original_commands.sql` exposes authenticated
  begin/completion wrappers and 25-row counted history. Existing current-role/authority locks and
  strict private commands remain. Each actor can create 100 new intents per rolling 24 hours;
  unchanged current-authority retries remain available at that limit. SQL completion is still
  `not_attested`. No assignment, approval, readiness or public projection is created.
- `lib/domain/catalog/originals.ts`, `lib/console/original-upload.ts` and `originals.ts` provide
  strict input/result contracts, bounded authenticated orchestration and a projected read DTO.
  Actual raster validation precedes reservation. Upload uses the exact generated path and unchanged
  bytes with overwrite disabled; streamed readback must match the hash and bytes before completion.
  Timeout-after-persistence and duplicate retries reconcile the existing object rather than replace
  it. The single local process allows two simultaneous actors and one upload per actor.
- `POST /api/console/originals` owns configuration, provider, origin, session, roles and private
  responses. It is outside the 10 MiB Console middleware body clone, not a larger global clone
  setting or a weakened existing matcher. Staging-host isolation remains. Actual HTTP testing
  caught the global Referrer-Policy overriding this route; an exact-path private-header rule in
  `next.config.ts` fixes it. Non-POST requests return 405. No service key is introduced.
- An independent default-off `CONSOLE_ORIGINALS_ENABLED` flag requires the existing exact local
  working boundary. `OriginalIntake`, the SKU originals route, shared product navigation and CSS
  add file/source entry, local image preview, explicit upload, bounded retry, readonly role states
  and completion/current-identity history. Received originals remain visibly pending review.
  Changing input changes request identities; unchanged in-form retries retain them. The form does
  not provide durable reload recovery, resumable transport, rights/match approval or role mapping.
- Synthetic fixture/browser tests, HTTP test runner, unit/SQL tests, generated public-schema types,
  migration/report checks and quality-job coverage are updated. No existing component is removed.
  The [dated decision](../../knowledge-base/decisions/2026-09-27-console-m4-original-upload.md)
  records evidence boundaries, resource limits, API placement and retained-incomplete-object policy.

### Validation

All 15 embedded suites / **627 pgTAP assertions** pass, including **29 new wrapper/history checks**.
These cover grants/private denial, working authority, role/revocation, unchanged retries, the 100
intent limit, read scope and 102-record pagination without approving byte attestation. Official
embedded public-schema type parity, two exact 17-table replays and existing original 15AK/media
preservation probes pass. The database is in-memory; synthetic Storage rows are not provider uploads.

Six actual raster-byte groups and nine upload/read groups pass. The latter use the real installed
Supabase SDK with mocked HTTP: they verify origin/flag/role refusal before reads, strict metadata,
exact upload bytes, readback integrity, no overwrite, timeout reconciliation, denied completion,
bounded concurrency and counted private DTO projection. A greater-than-10-MiB raster survives that
service pipeline, but this is not proof of large-file HTTP transport through a real Auth/Storage
stack. No test-produced raster is saved as a real product asset.

The original browser runner passes payload/retry/error/receipt, role/history, image loading,
keyboard/unsaved-input and six-width layout checks, with six screenshots and no page errors or
non-loopback requests. Screenshots at 360 and 1440 pixels are visually inspected. Existing editor
(ten scenarios), compatibility (eleven groups/eighteen screenshots) and read-only media (ten
screenshots) regressions pass. All browser upload/command responses are intercepted synthetic data.

`console:originals:http:test`, with explicit local QA opt-in, passes a fresh production build and
the owned loopback HTTP suite, then shuts down its own server. It proves noindex/no-store/no-referrer,
unauthenticated payload exclusion, disabled/method/origin refusal, staging-host isolation and public
shell/social-image behavior. It does not log in, upload an original or mutate a database.
Standalone TypeScript, full zero-warning ESLint, scoped formatting, performance budgets, SEO audit
and built internal links (80 HTML pages plus two dynamic sources) pass. Migration validation, the
strict 15-suite/627-assertion report test, `git diff --check` and the 582-file secret scan pass.
The regenerated Goal report retains 43 structured products, zero strict verified SKUs and the
existing legacy-media/company-evidence warnings. Public data/source paths have no diff.

### Rollout And Remaining Gates

No commit, push, merge, deployment, retained/hosted migration, reset/import/switch, active flag,
canonical product evidence, public URL, RFQ behavior, original geometry or product mapping changed.
M3 and the unanswered M4-A/B1-B5 CI-only question do not authorize submitting this newer B6-B8
candidate. Never reset or adopt the retained stack to run a disposable acceptance test.

Real authenticated Storage upload/download, native SQL/type parity, multi-connection races and fresh
candidate CI remain **NOT RUN**. In-form retry is not durable resume after reload, intent quota is
not a global Storage quota, and successful upload is not trustworthy SQL byte attestation or human
approval. Incomplete uploads remain retained until a separate recovery/retention design exists.
The local fixture is available only for synthetic interaction/layout review on loopback port 3901.

Release remains **BLOCKED** while local implementation progresses. The next gate is real isolated
Auth/Storage/browser acceptance of original upload, including greater-than-10-MiB transport and
unchanged-byte readback. Then complete immutable media mapping/review, supporting records, verified
preview/QA and authorized publication using actual owner-supplied 15AK evidence. Full M4 and the
twelve V1 criteria are not complete.

## M4-B9 Original Cookie Scope Correction

Local checkpoint: 2026-09-27, uncommitted on `b88c67fee7aadc05e02fc13d1dc94e52e15ecd92`.
Preparation for real browser upload uncovered a blocking B8 defect: `/api/console/originals` was
outside the existing login-cookie path `/console`. The earlier intercepted UI/SDK tests and disabled
HTTP route did not prove authenticated intake. This correction takes precedence over B8 API placement.

### Change And Evidence

- Move the handler to `app/(console)/console/originals/route.ts` and update the form/domain path to
  `/console/originals`. Remove the old API route without an alias. Keep Cookie path, HttpOnly,
  SameSite, provider/user/role checks, independent default-off flag and original bytes unchanged.
- Change only the first middleware matcher: match Console root and all descendants except the
  exact streaming endpoint/trailing-slash form. The handler owns its complete auth/refresh/privacy
  boundary. Other Console paths and the staging host retain middleware. Existing global Console
  headers/log exclusion cover the new path, so remove the now-redundant B8 API-only config rules.
- Add `test-middleware-matchers.ts`, package/quality-job coverage and production-manifest verification
  in `test-original-http.ts`. Replace the old source-string matcher assertion with execution of the
  installed Next parser/matcher. Cases cover root/auth/commands/media/SKU routes, close names,
  descendants, encoded paths, framework suffixes, public exclusions and staging-host coverage.
- Extend the synthetic browser test with a real Edge cookie-delivery probe and negative control.
  The HttpOnly `/console` cookie cannot be read from JavaScript, is absent from the old API path
  and is required on the form upload. No real credential, Auth login or database is used.
- Extend production HTTP checks with old-route absence, new-route methods/privacy/disabled refusal
  and staging GET/POST denial. A first build failed on a test-only ambient const-enum import; the
  type-only enum use corrected it. The first HTTP rerun correctly returned the existing staging
  POST policy's 404 instead of the new test's assumed 403; the assertion now requires that policy,
  without modifying or weakening staging access.

Fresh production build, source and compiled middleware coverage, and the complete owned-server
HTTP privacy/CSRF/host/public-shell suite pass. The runner stops its owned server and confirms port
release. The updated original UI passes four bounded groups, six screenshots, unchanged payload/
retry checks, cookie scope, role/history/keyboard behavior and zero page errors/external requests.
Nine upload/read unit groups and offline Console boundary/entrance tests pass. Real large-file
HTTP storage, real Auth/persistence and candidate CI are still **NOT RUN**.
Final standalone TypeScript, full zero-warning lint, scoped formatting, performance budgets, SEO,
`git diff --check` and the 584-file secret scan pass. Canonical/public source paths have no diff.

### Remaining Scope

The [B9 decision](../../knowledge-base/decisions/2026-09-27-console-m4-original-cookie-scope.md)
records the supersession without rewriting historical B8 evidence. No schema, canonical product
data, original asset/geometry, mapping, public SEO/RFQ behavior, active setting or retained database
changed. No commit/push/merge/deploy occurred. Previous M3 and unanswered B5-only submission scopes
do not authorize this current candidate. The local synthetic preview remains a layout/interaction
fixture, not a usable evidence-upload system.

Release remains **BLOCKED** pending actual disposable Auth/Storage/browser acceptance. Next extend
the existing guarded runner to test real upload, unchanged-byte readback, retry/revocation and
greater-than-10-MiB transport before adding human SKU media approval. Full V1 and the real 15AK
preview/QA/publication pilot remain open.

## M4-B10 Real Original Acceptance And Authorized CI

Checkpoint: 2026-09-28. The owner explicitly approved review, commit and push of the current M4
batch to `18803076512/arcfort-website`, `codex/v2-industrial-brand-system`, for isolated CI only.
This supersedes the unanswered B5-only question, not historical test results. PR 130 is open against
`main`, with remote/local baseline `b88c67fee7aadc05e02fc13d1dc94e52e15ecd92`; automatic Vercel
deployment for this branch remains disabled. The [dated authorization record](../../knowledge-base/decisions/2026-09-28-console-m4-isolated-ci.md)
owns the precise limits. No merge, deployment or retained/hosted database operation is included.

### Prepared Acceptance

`test-original-working-browser.ts` extends the existing guarded runner with actual owner/reviewer
login cookies, form HTTP and Storage upload/download. It generates synthetic small and >10 MiB PNG
bytes, compares stored bytes and SHA-256, exercises unchanged retry and changed-receipt rejection,
denies viewer/anonymous/cross-origin/corrupt input, probes object overwrite/move/delete refusal,
checks private counted history and six responsive widths, and denies revoked/logout access.
There is no mocked HTTP response in this helper. Successful receipts remain blocked, unconfirmed,
unmapped and `not_attested`, with no approval or lifecycle promotion.

The parent acceptance adds pristine zero-count guards for media bindings, upload intents,
completions and Storage objects; independent explicit server feature options; exact original-media
and mapping retention; and final two-object owner/path/size/MIME reconciliation. Existing product,
fact, compatibility and zero-publication retention checks remain. The CI step runs these alongside
the full M3 and compatibility workflow in the existing disposable GitHub job.

Eight target-guard groups and six server-environment groups pass locally, along with TypeScript
and zero-warning lint. Fresh embedded SQL passes 15 suites / 627 assertions, complete official
public-schema type parity, two exact 17-table source replays and the real-source retention probes.
These do not attest actual provider or large-file transport behavior. Real-stack results and the
reviewed commit/run identity must be recorded after execution, not inferred from the script.

Pre-submission review found no additional blocking code defect after B9's cookie correction.
All 18 focused domain/command/read/media/original/guard/boundary/config/report/migration/source
scripts pass for the current tree. Fresh production build and actual source/compiled matcher and
HTTP isolation suites pass. Standalone TypeScript, zero-warning lint, scoped formatting, diff
checks, performance budgets, SEO and 80-page/two-dynamic-source internal-link checks pass. The
586-text-file secret scan is clear. Canonical data, public images, public app/API routes, RFQ,
`vercel.json` and `next.config.ts` have no diff. Submission for isolated CI is permitted; release
is still BLOCKED on the separate gates below.

### Remaining Gates

CI execution is authorized but its current-candidate result is pending at this checkpoint.
Release remains BLOCKED. Keep the retained local stack untouched and feature flags off. A green
isolated run does not complete media approval/mapping, the real 15AK pilot, hosted adoption or V1.

### First CI Result And Storage Guard Fixture Correction

Candidate `f366ad1678dfbc056bbfad763cb227a613c37175` was reviewed, committed and pushed only to
the authorized branch. [Run 36359590258](https://github.com/18803076512/arcfort-website/actions/runs/36359590258)
passed the complete quality job, but the database job failed in the original-intake SQL suite.
The actual Storage `protect_delete()` statement trigger rejects raw DELETE before RLS; the old
embedded fixture did not model this platform behavior. The run executed 589 assertions before
stopping and did not reach real browser/Storage acceptance. No successful overall CI is claimed.

Read-only inspection of the installed function/trigger confirmed the `storage.allow_delete_query`
operation setting and BEFORE DELETE FOR EACH STATEMENT boundary. The fixture now models that
guard, and only `pg_temp.remove` uses a function-local setting to simulate a Storage operation
inside its rollback-only transaction. No trigger, runtime migration or real protection is disabled.
Three additional checks require raw managed/legacy deletion refusal and restoration after the
operation probe; existing RLS checks still require zero managed deletions and unchanged legacy
policy. The actual Storage API immutability test remains mandatory in browser acceptance.
This follows the [official Storage schema boundary](https://supabase.com/docs/guides/storage/schema/design):
application writes use the API, not direct metadata manipulation.

The corrected embedded suite passes all **630 assertions**, complete official public-schema type
parity, both source replays and original-source retention. The strict SQL report test passes and
the generated Goal inventory is updated. This is fixture parity, not a replacement for native CI.

### Storage API Boundary Correction

The next candidate `9157f8d7de87d8fc80db894c89fef0a0a8c1a070`,
[run 36359940605](https://github.com/18803076512/arcfort-website/actions/runs/36359940605), again
passed quality but failed before the intake suite: the native SQL test role cannot set the
service-owned `storage.allow_delete_query` parameter. The function-local probe above is superseded
and removed, with no grant or service-role impersonation added. SQL now tests the enabled platform
guard, raw managed/legacy DELETE denial and row retention, never claiming those are API/RLS tests.
The embedded guard remains to prevent the original false assumption from recurring.

The real browser helper retains actual API managed-delete denial/readback and adds a positive
control: upload a generated ordinary synthetic object, delete it through the same owner's Storage
API session, and require it to disappear while the managed original survives. The final database
reconciliation still requires exactly two objects. This proves policy selectivity without changing
platform configuration; all writes remain limited to the disposable CI synthetic scope.

### Native Type Parity Diagnostic

Candidate `9e871b35ab54f3facffffd2dfc6d1fb43de144f7`,
[run 36360276167](https://github.com/18803076512/arcfort-website/actions/runs/36360276167), passed
quality, native pgTAP and independent SQL reporting but failed complete CLI type parity near line 2458. No browser acceptance ran. `sync-database-types.ts` now emits a bounded schema-only comparison
on mismatch, preserving strict failure; it never prints connection configuration or row values.
The exact native difference must be inspected before regenerating types or changing the embedded
generator contract. No retained database is migrated merely to obtain types.

Diagnostic candidate `f3172313ff6dc32cfee0f9620b1525efcc978761`,
[run 36360625820](https://github.com/18803076512/arcfort-website/actions/runs/36360625820), repeated
the native SQL pass and exposed the first type difference: `pi_can_upload_original` has identical
Args/Returns tokens but the native generator retains multiline formatting. The native gate now
uses the installed TypeScript parser/printer to compare **the entire generated syntax tree**,
normalizing whitespace/comments and optional terminators. It does not omit schemas, functions, argument optionality,
nullability, enum literals, helpers or Constants; literal content is retained exactly. New negative
controls cover each of these contract changes and invalid syntax, and run in quality CI. A fresh
native run must prove the complete contract, not just this first matching function.

### Native Contract Pass And Browser Diagnostic

Candidate `59feb26fbf9ed9b0e6ee8a412a86077dad1d5657`,
[run 36378423576](https://github.com/18803076512/arcfort-website/actions/runs/36378423576), passed
quality, native SQL, independent reporting, **complete native type parity**, two source replays,
M2 real authentication/RLS/pagination and pristine M3 setup. The working browser phase failed;
the parent's privacy-safe log suppressed its nested checkpoint. No full acceptance is claimed.
The browser runner now logs only controlled phase/checkpoint/completed-test labels and numeric
assertion operands, distinguishing owned-server startup from later browser failures. Credentials,
request/response bodies, raw errors and provider output remain suppressed.

`671bf6eca12fc31c50b22b09a23677aeabfbb075` /
[run 36378936135](https://github.com/18803076512/arcfort-website/actions/runs/36378936135) reproduces
the failure in the first owner original-intake scenario, after the M3 editor/review checks and
compatibility browser helper return. Intake diagnostics now distinguish form entry, HTTP response,
cookie/receipt, feedback, asset metadata, byte readback and replay; numeric transport/page-error
counters and a controlled failure category are included. No raw payload/credential is logged, and
neither upload success nor full compatibility revocation acceptance is inferred from partial progress.

### Original Source Select Label Fix

`57622a6821bc3ea73c1204e50dac2d386fea696a` /
[run 36379601255](https://github.com/18803076512/arcfort-website/actions/runs/36379601255) identifies
a timeout while filling the owner form, before any upload request, with zero page errors and
external requests. Local Edge inspection reproduces the cause: the wrapping Source type label
includes all option text, so its exact label selector matches zero controls while the three other
form labels each match one. Add the explicit `aria-label="Source type"` using the existing Console
select pattern, and extend synthetic UI regression to select `other_reference` and assert the
actual submitted metadata. Visible text and business/Storage rules are unchanged. This repairs a
real accessible-name ambiguity instead of weakening the exact-name acceptance selector.

The corrected synthetic browser suite passes exact source selection/submitted metadata, scoped
cookie delivery, retry/error/receipt behavior, six viewport screenshots, image load, keyboard and
role/history checks. The 360-pixel screenshot is inspected. This local fixture has no database;
real original persistence still requires the new isolated run.

## September 28 Isolated CI Acceptance

Reviewed implementation candidate `c4d7b703a41bef387e9428011d29df1bfb18948b` passed both jobs in
[run 36411029604](https://github.com/18803076512/arcfort-website/actions/runs/36411029604), completed
at 2026-09-28 10:45:31 UTC. This result supersedes the pending real-provider and failed-run
checkpoints above for the submitted B1-B10 scope, not for all of M4 or V1.

### Verified Gates

- Quality: focused Console/domain/command/privacy/guard tests, generated-data checks, secret scan,
  zero-warning lint, TypeScript, production build, public SEO/internal-link/image/snippet checks,
  RFQ regressions and unchanged performance budgets passed.
- Database: fresh native migration replay, all 15 pgTAP suites / 630 assertions, independent
  rollback-only SQL reporting with negative controls, and complete native generated-type syntax
  parity passed. The embedded 630-assertion/source-preservation gate also passed independently.
- Imports and Auth: two exact 17-table source reconciliations passed before M2 Auth/RLS and
  1,103-record pagination acceptance. The disposable runner then rebuilt and reconciled its
  pristine baseline twice before adoption. These resets occurred only in the GitHub runner.
- Actual working workflow: observed lock contention, stale-command/idempotency checks, technical
  and compatibility review/history, and **24 database-backed browser scenarios** passed. This
  includes actual owner/reviewer login cookies and form uploads, a >10 MiB generated original,
  exact downloaded bytes and SHA-256, unchanged retry, invalid input/origin/role refusal, managed
  object overwrite/move/delete protection and an ordinary-object API deletion positive control.
- Revocation/logout: real browser HTTP, direct RPC and Storage reads are denied after role
  revocation; logout denies receipt replay. Responsive checks run at six widths; browser acceptance
  requires zero page errors and zero external requests. Local synthetic 360/1440-pixel visual
  inspection remains separately scoped; runner screenshots are not claimed as manually inspected.
- Final retention: every original variant, technical fact, compatibility/source row and media/
  mapping row matches its captured baseline. Exactly two synthetic intents, completions and
  Storage objects agree on actor, path, size and MIME type. There are zero media source bindings,
  zero publication records, and three synthetic non-shadow drafts remain `DRAFT` / `needs_photo`.
  The owned test server and disposable Supabase services stopped successfully.

### Disposition And Remaining Work

The authorized isolated submission gate is **PASS_WITH_WARNINGS**; external release remains
**BLOCKED**. PR 130 was verified open and unmerged at this candidate, with both checks successful
and no GitHub deployment record for its SHA. Branch auto-deployment remains disabled. No retained
local or hosted migration/reset/import/adoption, active feature setting, production deployment,
canonical product data, public route, SEO or RFQ change was performed in this batch.

Warnings remain bounded to the unactivated implementation: uploads are synthetic evidence, SQL
completion remains `not_attested`, rights and exact-product match remain unapproved, media mapping/
human approval is unfinished, and interrupted-upload recovery is not durable resume. The full
real 15AK pilot, supporting records, verified website preview/QA/publication, hosted rollout and
all twelve V1 requirements remain incomplete. Existing legacy-image/evidence warnings are unchanged.

Next implement the controlled immutable SKU media mapping and rights/match review batch, using
the verified private-intake boundary and actual owner-supplied evidence. Publication, deployment
and retained/hosted database writes continue to require their own exact authorization. Do not
repeat Docker repair or reset the retained stack to reuse this disposable acceptance runner.

## M4-B11 Private Stored-Original Inspection

Local checkpoint: 2026-10-04, uncommitted on `c190456df9609397859c2767bd13c3cf10d22068`.
The [dated inspection decision](../../knowledge-base/decisions/2026-10-04-console-m4-stored-original-inspection.md)
owns the read-only, private-original and separate human-approval boundaries.

### Implementation

- Add `lib/domain/catalog/original-inspection.ts`, `lib/console/original-inspection.ts`,
  `lib/console/original-work.ts` and `app/(console)/console/originals/inspect/route.ts` for exact
  SKU/intent/completion/asset resolution, bounded actual-byte validation and private unchanged-byte
  responses. Current access is rechecked after the read; no command mutates data.
- Add `StoredOriginalInspection.tsx`, connect history controls in `OriginalIntake.tsx` and use
  restrained Console CSS for blob preview, bounded zoom, original download, retry, cancellation,
  focus restoration and TIFF download-only state. No public visual or image changes.
- Share upload/inspection decoder capacity and preserve caller cancellation in `client.ts` while
  retaining its existing private fetch/timeout policy. The real SDK adapter regression exercises
  signal propagation rather than assuming custom Storage options survive the adapter.
- Add the focused inspection script and package/quality command. Extend synthetic original UI,
  fixture, source/compiled matcher, default-off HTTP and real disposable browser helper coverage.
  The real helper's new inspection/download/read-only/revocation assertions are not run locally.

### Local Verification

- `console:originals:inspect:test`: all eight groups pass, including strict boundaries/IDs,
  manifest/path/size/hash refusal, no mutations, all current roles, revocation/session change,
  request cancellation, shared decoder limits and real-SDK fetch-adapter cancellation.
- `console:originals:test` and `console:originals:upload:test`: all six actual-byte and nine mocked
  upload/history groups pass, including >10 MiB bytes and resource/deadline controls.
- Synthetic Edge browser: five groups, twelve screenshots at 360/390/768/1024/1280/1440 px, zero
  page errors and external requests. Exact blob download, retry/sanitization, zoom, close/abort/
  blob-URL release, role/incomplete-history and TIFF states pass. Inspection screenshots at 360 and
  1440 px are visually reviewed; these are generated test rasters, not product evidence.
- Standalone TypeScript and zero-warning whole-repository ESLint pass. A fresh owned-server
  production build succeeds. Installed source and compiled middleware coverage pass.
- Twenty-two scoped production HTTP probes pass: non-POST refusal, default-off same/cross/null
  origin rejection, sanitized/private/no-store/noindex/no-referrer responses, exact-wire staging
  host isolation and no cookies. The owned server stops and port 3000 is released. An initial
  ad hoc virtual-host probe used Node fetch, which rewrote Host; the corrected wire-HTTP probe
  passes. Runtime host/matcher rules were not changed.
- The full `console:originals:http:test` does **not** pass locally: its unchanged same-origin
  invalid-session-form assertion expects 400 but receives 503 because the loopback Auth provider
  is unavailable. No provider, retained stack or assertion was changed to hide this prerequisite.
  This narrower HTTP pass does not replace full Auth/session/Storage acceptance.
- Command, entrance, boundary, destination and pristine-runner/server guard regressions pass.
  Performance, SEO, eighty built pages/two dynamic-source internal links, built image-evidence
  and snippet audits pass. Canonical records, public paths, images, RFQ and deployment configuration
  have no diff. Scoped Prettier and `git diff --check` pass; the 595-text-file secret scan is clear.
  `goal:report` reconciles 43 structured products/zero strict verified SKUs with unchanged existing
  image/company-evidence warnings. The synthetic fixture server is also stopped after acceptance.

### Disposition

Local implementation is ready for scoped submission review; activation/release remains **BLOCKED**
on current-candidate real isolated acceptance and separate rollout approval. On October 4, read-only
GitHub verification confirms baseline `c190456d` has both successful jobs in
[run 36411995482](https://github.com/18803076512/arcfort-website/actions/runs/36411995482), and PR 130
is open/unmerged at that SHA. This is completed B1-B10 evidence, not a B11 result.

No B11 commit/push, merge/deployment, retained/hosted migration/reset/import/adoption, active flag,
media mapping/approval or publication was performed. Replayed B1-B10 approval is not silently
extended to this new batch. Next obtain exact B11 CI-only authorization and run the existing
pristine disposable acceptance; then continue immutable exact-SKU media mapping and independent
human rights/match review. Real 15AK evidence and the full twelve-criterion V1 gate remain open.

## M4-B12 Immutable Media Mapping Draft Foundation

Local checkpoint: 2026-10-04, uncommitted on `c190456df9609397859c2767bd13c3cf10d22068`.
The [dated mapping decision](../../knowledge-base/decisions/2026-10-04-console-m4-media-mapping-drafts.md)
owns the proposal/submission, unchanged public mapping and independent human-approval boundaries.

### Files And Contracts

- Add `supabase/migrations/202610040016_product_intelligence_media_mapping_drafts.sql` and
  `supabase/tests/database/product_intelligence_media_mapping_drafts.test.sql`: exact SKU/role/slot
  heads, immutable revision/predecessor history and source links, private proposal/submission
  commands, safe invoker state view and an open-proposal lifecycle guard. No public mutation
  wrapper, command endpoint, UI, human review, effective mapping or activation is added.
- Generate the complete public schema member in `lib/supabase/database.types.ts` through the
  existing embedded official generator. Existing GraphQL/helpers/constants and enums are retained.
- Extend `scripts/console/validate-product-intelligence-migrations.ts`,
  `scripts/console/test-database-test-report.ts` and
  `scripts/console/sql-runtime/test-authority.mjs` for migration 16, the exact 16-suite/722-assertion
  baseline, no-disabled-trigger/private-mutation checks and four actual-SKU identity fixtures.
- Adapt the single TRUNCATE-refusal assertion in
  `supabase/tests/database/product_intelligence_media_sources.test.sql` to explicit CASCADE inside
  its rolled-back fixture. The new FK otherwise refuses before the guard can run. The required
  immutable `55000` refusal and all 80 original source assertions remain unchanged in strength.
- Update this record, `docs/CODEX_GOAL.md`, `docs/CHANGELOG_AI.md`, generated
  `docs/goal-progress-report.md`, the media inspection knowledge record and dated decision. The
  generated report updates only migration/test inventory counts, not SKU evidence or pass claims.
  No canonical CSV/registry, public image, route, SEO or RFQ diff.

### Current-Candidate Validation

- `console:authority:test:embedded`: all 16 migrations apply only to memory; all 16 suites/722
  pgTAP assertions pass, including 92 new mapping checks. Strict roles/RLS/grants, actor-scoped
  retry, bounded copy/slots/sources, exact original and source identity, immutable history/digests,
  stale save/submit, unselected contradictions, revocation, lifecycle refusals and retention pass.
  No trigger is disabled. Audit events are retained and no verification/publication is produced.
- Complete official public-schema generated-type parity, two exact 17-table replays, adoption
  negative controls, all fifteen original technical scopes and four reference compatibility
  relationships pass. Four synthetic recorded-original proposals against actual imported 15AK
  SKU identities reach `pending`/`NEEDS_FACTORY_CONFIRMATION` with separate reference-only sources;
  all original product/fact/asset/mapping rows remain exact and approval/publication counts are zero.
  These in-memory fixtures contain Storage metadata only, not actual stored file bytes.
- `console:migrations:validate`, `console:sql-qa:test` and `console:types:test` pass. The report test
  initially stops at its old 15-suite baseline; after explicit coverage review it now strictly
  requires 16 suites/722 assertions. Failed/count-mismatched/skipped reports remain rejected.
- Standalone `typecheck`, whole-repository zero-warning `lint`, and a fresh owned-server production
  build pass. `console:browser:test:smoke` uses actual Edge without a provider: unavailable login,
  private/no-store/noindex headers, cross-origin denial and fail-closed commands pass. The owned
  server stops and port 3000 is released. This is not login/database/Storage acceptance.
- Catalog domain, product draft, eight command groups, six compatibility command groups, four
  compatibility read groups, five media read groups, destination/boundary guards, eight pristine
  target groups and six owned-server guard groups pass. No retained provider is started or reset.
- The combined working-tree original regressions also pass: eight inspection groups, six actual
  byte/stream groups, nine upload/history groups and installed/compiled middleware coverage. Public
  SEO, eighty built-page/two dynamic-source internal-link, 43-image evidence, snippet and performance
  audits pass. Scoped formatting and `git diff --check` pass; 598 repository text files have no
  high-confidence secrets. `goal:report` remains 43 structured products/zero strict verified SKUs,
  with unchanged legacy-image, duplicate-content and representative-company-visual warnings.

### Disposition And Remaining Scope

The local schema foundation is validated; activation/submission/release remains **BLOCKED** on
exact new-batch authorization and current-candidate native/provider acceptance. Historical B1-B10
CI is not B12 acceptance, and the pending B11-only question does not include this migration.
No B12 commit/push, merge, deployment, retained/hosted migration/reset/import/adoption, active flag,
original transformation, effective mapping, human approval or publication occurred.
Fresh October 4 read-only GitHub inspection confirms PR 130 remains open/unmerged at `c190456d`
with both successful checks from run `36411995482`; that completed baseline is not the new batch.

The state view only reports proposals. Readiness/dashboard/current-effective integration and
explicit human APPROVE/EDIT/REJECT remain unimplemented. The open-proposal trigger blocks future
publishable lifecycle updates, not retroactive demotion or a complete QA gate. Native SQL/CLI types,
Auth/PostgREST/Storage, multi-connection race checks and new real mapping UI acceptance are not run.
The separately recorded B11 full-session HTTP limitation remains; no assertion/provider was changed.

Next implement explicit rights and exact-product human review against an inspected original and
the exact submitted revision, then current/effective readiness integration and owner-facing controls.
Use real owner-supplied evidence for the 15AK pilot; synthetic metadata cannot close V1 criteria 3,
7 or 12, verified preview/QA/publication or the overall goal. Publication and any retained/hosted
database application still require their own exact authorization.

## M4-B13 Exact-SKU Media Mapping Review

Local checkpoint: 2026-10-04, uncommitted on `c190456df9609397859c2767bd13c3cf10d22068`.
The [dated review decision](../../knowledge-base/decisions/2026-10-04-console-m4-media-mapping-review.md)
extends B12 for private human decisions, current/effective mapping and database readiness.

### Files And Implementation

- Add `supabase/migrations/202610040017_product_intelligence_media_mapping_review.sql` and
  `supabase/tests/database/product_intelligence_media_mapping_review.test.sql`: immutable decision
  and current tables, exact event/confirmation/current guards, reusable append helper, private
  APPROVE/EDIT/REJECT, guarded reader-only validity helper, effective mappings, separate media
  readiness/metrics and stronger existing readiness/dashboard SQL. Force RLS and retain no direct
  caller/service writes or public mutation wrapper. No SQL trigger is disabled.
- Regenerate `lib/supabase/database.types.ts` with the embedded official public generator;
  GraphQL/helpers/constants and existing public relation columns remain exact. Update migration
  validation and the SQL-report baseline in `validate-product-intelligence-migrations.ts` and
  `test-database-test-report.ts` to 17 suites/831 assertions without relaxing strict result checks.
- Extend `scripts/console/sql-runtime/test-authority.mjs` with four real-SKU reference-only approval
  negative controls. Extend `local-acceptance.ts`, `test-local-acceptance.ts` and
  `test-working-isolated.ts` to refuse existing mapping work in all five new tables and require
  their retention after the existing real upload workflow. No real mapping RPC/UI scenario exists
  yet; the extended real runner has not executed for this batch.
- Update Goal, generated inventory report, this runbook, append-only changelog, media knowledge
  and dated decision. No Console component, public image/route, canonical registry, RFQ or visual
  change. Original product geometry and existing public authority are unchanged.

### Current-Candidate Verification

- All 17 migrations apply only in memory; all 17 suites/831 assertions pass, including 109 new
  review checks. Cover independent dimensions/eligible submitted sources, explicit declarations,
  role/actor/retry/stale handling, event forgery, pointer/decision immutability, conflict-preserving
  EDIT, REJECT retention, stale-original rejection, new contradiction invalidation, read RLS,
  revocation, timezone stability and lifecycle/ready blockers. Successful approvals are entirely
  synthetic fixtures, not owner-supplied product evidence.
- Official complete public-schema type parity and original relation-column parity pass. The first
  implementation added readiness columns and was correctly rejected by that existing contract;
  the final version preserves twenty existing columns and nine dashboard metrics, with separate
  new detail views. The assertion was not weakened.
- Two exact 17-table source replays, adoption negative controls and all original technical/
  compatibility scopes pass. Four actual imported 15AK SKU identities accept synthetic pending
  mappings but refuse reference-only approval; all original products/facts/assets/mappings stay
  exact, with zero decisions, approval events and publication. Storage fixtures are metadata only.
- Migration, strict SQL-report/type contract, standalone TypeScript and zero-warning whole-repo
  lint pass. Eight command, six compatibility command, four compatibility read, five media read,
  boundary/entrance, eight pristine-target and six owned-server guard groups pass. Pristine guards
  test each new table's nonzero refusal. The retained provider was not started/reset/imported.
- Fresh production build and actual Edge unavailable-provider smoke pass: private/no-store/noindex
  headers, unavailable login, cross-origin refusal and fail-closed command. The owned server stops
  and port 3000 is released. This does not prove login, original bytes, human controls or DB writes.
- Final standalone typecheck/lint and compiled middleware checks pass. Public performance, SEO,
  eighty built-page/two dynamic-source internal-link, 43-image evidence and snippet audits pass.
  Scoped Prettier and `git diff --check` pass; 601 text files contain no high-confidence secrets.
  Generated Goal inventory updates to 17 migrations/831 declared assertions while preserving
  43 structured products/zero strict verified SKUs. Existing legacy-image, duplicate-content and
  representative-company-visual warnings remain unchanged. No public live verification is claimed.

### Release Gate And Next Work

Release/activation is **BLOCKED**: no current-candidate native SQL/CLI types, real Auth/PostgREST/
Storage/race acceptance, actual-byte observation binding or owner-facing mapping/review UI.
No B13 commit/push, merge/deployment, retained/hosted migration, active setting, canonical approval
or public data change occurred. Existing CI-only authorization is not extended to B11-B13.

Human confirmation validates an exact stored declaration, not that the byte inspector actually ran.
The application must bind authenticated actual-byte inspection/revalidation to the exact reviewer
observation before any public mutation grant. Even an internally approved original remains private,
`not_attested` in the original SQL completion and not public/search-eligible. Public derivative/output
governance, supporting records, verified preview/QA/publication and real 15AK evidence remain open.

Next connect exact-scope source/proposal/review controls to stored-original observation and the
effective/readiness reads behind a separate default-off boundary. Execute fresh authorized
disposable provider/UI/concurrency acceptance without touching retained data. This local foundation
is progress toward criteria 3/5/6/7/9, not completion of those criteria or the overall V1 goal.

## M4-B14 Observed Media Review Commands

Local checkpoint: 2026-10-04, uncommitted on `c190456df9609397859c2767bd13c3cf10d22068`.
The [dated observation decision](../../knowledge-base/decisions/2026-10-04-console-m4-observed-media-commands.md)
owns protocol, key handling, historical/current evidence and activation boundaries.

### Files And Implementation

- Add `supabase/migrations/202610040018_product_intelligence_media_review_commands.sql` and the
  61-assertion `product_intelligence_media_review_commands.test.sql`: empty private key table,
  immutable observation ledger, safe pending snapshot, independent HMAC/binding/expiry verifier,
  authenticated source/propose/submit/review wrappers and a private-history reader boolean.
  No keys, source data, original transformation or trigger bypass are introduced by the migration.
- Add `lib/domain/catalog/media-commands.ts` and `lib/console/media-observation.ts`; extend the
  domain/Console `commands.ts`, `working-config.ts`, original inspector and its existing route.
  Four typed commands support six decision forms behind the new independent default-off flag.
  Reuse bounded decode/capacity, exact cookie scope, current Auth/roles, invite-only provider and
  same-origin headers. Ordinary original inspection remains read-only for all five roles.
- Add `scripts/console/test-media-commands.ts`; extend inspector tests, SQL/source runner, migration
  validator, strict SQL report, pristine guard/unit/real-runner preparation, owned browser smoke
  and HTTP header assertions. Add the new command test to `package.json` and quality workflow;
  regenerate the official public database type member. Private key/ledger types are not exposed.
- Record Goal/generated inventory, this runbook, media knowledge, dated decision and append-only
  log. No new UI component or visual change; B11-B13 local work and all public originals, canonical
  product/compatibility/media data, public routes, SEO and RFQ remain unchanged.

### Current-Candidate Verification

- All 18 in-memory migrations and 18 suites/892 assertions pass, including 61 new checks for
  roles/grants, exact snapshots, missing/forged tokens, version/key/actor/adoption/mapping/sequence/
  digest/original/time mismatches, expiry, nonce collision rollback, new unselected contradiction,
  explicit human confirmation, exact receipt replay, revocation and immutable private history.
  Successful decisions use synthetic metadata/signing keys only, not real Storage bytes or rights.
- Node/pgcrypto HMAC and tamper parity, complete official public type/original column parity, two
  exact 17-table source replays and all existing adoption/technical/compatibility scopes pass.
  All four actual 15AK identities refuse application approval without an observation AND retain
  the reference-only refusal. Original rows and zero decisions/currents/observations/publication
  remain exact. No signing key remains in the post-fixture source replay.
- Eleven original-inspector groups pass. New groups process real decoded synthetic raster bytes,
  verify the signed exact binding and short lifetime, and refuse corrupt bytes, changed snapshots,
  reviewer downgrade, disabled settings and unavailable configuration. SDK Auth/Storage responses
  are mocked; these are not real-provider acceptance. Five media transport/domain groups cover
  six forms, strict inputs, independent local flag, role matrix, exact nullable RPC fields,
  malformed responses and private-error/output suppression.
- Existing eight technical-command, six compatibility-command, nine upload/readback groups and
  eight pristine-target groups pass. Pristine guards now refuse existing private observation/key
  rows as well as all mapping work. The real disposable runner retains empty observer tables
  after its older upload-only workflow; this prepared assertion was not newly run against Auth.
- Standalone TypeScript, zero-warning whole-repo lint and fresh production build pass (95 generated
  static outputs). Real Edge unavailable-provider smoke verifies private headers, fail-closed
  commands and three disabled-observation origin probes without any observation/cookie leakage.
  Its owned server stops and port 3000 is released. No login, DB write or human review is claimed.
- Final candidate rebuild/browser smoke and compiled middleware checks pass after enforcing
  positive media result versions and exact submitted/reviewed mapping identities. Performance,
  SEO, eighty-page/two-source internal-link, 43-image evidence and snippet audits pass. Scoped
  Prettier, tracked `git diff --check` and untracked SQL whitespace checks pass (no-index exit 1
  denotes new-file differences only). The 607-text-file secret scan is clear. Generated Goal
  inventory is 18 migrations/892 declared assertions, still 43 structured/zero strict verified
  SKUs with unchanged legacy-rights, duplicate-content and representative-company-media warnings.

### Release Gate And Remaining Work

Activation/release is **BLOCKED** on fresh native SQL/full CLI parity, real Auth/PostgREST/Storage,
multi-connection race checks, counted effective reviewer DTOs and explicit owner UI. B11's full
HTTP session test still has an unavailable Auth prerequisite; it is not weakened or hidden by the
unavailable-provider smoke. No retained stack is started, reset, migrated or imported for this work.

No commit/push, merge, deployment, actual key provisioning, hosted/retained database write or
active flag occurred. B1-B10 submission is complete; the pending B11-B13-only authorization does
not include this B14 change. Historical green CI cannot prove the new candidate.

Next implement the SKU mapping/editor/reviewer workflow with original display/download, explicit
human rights AND match controls, selected evidence, expired-observation refresh and counted
effective/history/readiness reads. Future previews/QA must distinguish current evidence validity
from matching byte observation and retain private/non-public original output. Complete fresh
authorized disposable acceptance and real owner-supplied 15AK evidence before activation. The
supporting-record, verified preview/QA/publication workflow and full V1 are not complete.

## M4-B15 SKU Media Mapping Workbench

Local checkpoint: 2026-10-04, uncommitted on `c190456df9609397859c2767bd13c3cf10d22068`.
The [dated workbench decision](../../knowledge-base/decisions/2026-10-04-console-m4-media-mapping-workbench.md)
owns the read/human/observation boundary. No repository rule is overridden.

### Files, Components And Data

- Add `lib/console/media-mapping.ts`, `lib/domain/catalog/media-review.ts`,
  `components/console/MediaMappingWorkbench.tsx` and the protected
  `app/(console)/console/(protected)/products/[id]/media/page.tsx`.
- Extend `StoredOriginalInspection.tsx`, `ProductWorkingNav.tsx`, private `console.css` and all six
  existing SKU detail/edit/review/history/compatibility/originals pages. New mapping navigation is
  independently disabled. Reuse existing command hooks, feedback, links, statuses and input styles.
  No component is removed; all ordinary five-role original inspection behavior remains intact.
- Add `scripts/console/media-mapping-fixture.ts`, `test-media-mapping-reads.ts` and
  `test-media-mapping-browser.mjs`; extend the UI fixture, production browser smoke and compiled
  matcher checks. Add two package scripts and the read test to the prepared quality workflow.
- Update Goal/generated inventory, this runbook, media knowledge, dated decision and append-only
  changelog. No new migration or database type change in B15. No canonical CSV, public asset,
  product truth, original raster geometry, public route, SEO, RFQ or provider configuration changes.
  Synthetic fixtures only; no retained/hosted database write, real human approval or key provisioning.

### UI And Verification

Private utilitarian SKU/slot navigation compares current mapping, immutable proposal and original
record. Evidence dimensions, source level/assertion/basis/version/location/date/custodian, unselected
conflicts and paginated proposal/decision history remain visible. Owner/editor/reviewer roles differ;
viewer/publisher remain read-only. No floating section cards, new dependency or public visual change.

Pending copy/source scope is frozen; source addition forces latest-record reload. APPROVE needs exact
fresh observation, qualifying selected rights/match sources, three human acknowledgements and explicit
conflict resolution when needed. EDIT/REJECT carry no observation/confirmation. Inspection expiry,
close, errors and edits clear acknowledgements; recheck does not auto-confirm. A SQL-only current
approval has an explicit missing-observation/internal-only label, not a fabricated verification state.
All approved private originals remain not publication ready. Failed/missed responses can reload latest
records; no decision is inferred from provider acceptance or a synthetic success response.

- **PASS:** `console:media:mapping:test`, seven groups. Counted query/ID batching, a 17-row provider
  cap over 1,004 sources, 26 original choices, missing/foreign/duplicate links, truncated history,
  changed heads, same-revision review drift, role revocation, separate current/observation booleans,
  minimal DTO, reference qualification and observation binding/expiry. SDK transport is mocked.
- **PASS:** `console:media:mapping:ui:test`, fourteen groups in real Edge with synthetic HTTP:
  all six command forms, frozen input, selected source dimensions, unselected conflicts, lower-level
  evidence refusal, role visibility, sanitized errors/stale comparison, context/close/expiry reset,
  fresh recheck, focus restoration, unsaved navigation and history links. Seven commands/32 inspections;
  zero browser errors/external requests. No Auth/Storage/database persistence is claimed.
- **PASS:** 360/390/768/1024/1280/1440 screenshots, no page overflow and 44px action targets.
  Current 360/1440 captures visually inspected; long file names and source text do not overlap.
  Artifacts: `.tmp/console-media-mapping-ui/report.json` and `mapping-{width}.png`.
  Raw observation tokens never enter DOM text, URL query, localStorage or sessionStorage.
- **PASS:** old original browser workflow, including exact bytes/cookie scope, TIFF, zoom/download,
  six widths, role states, retry/cancel/close/abort/revoke and unsaved controls. Inspector eleven
  groups, media commands five, technical commands eight and compatibility read regressions pass.
- **PASS:** all 18 in-memory migrations/suites, 892 assertions, complete official public-type/source
  parity, Node/pgcrypto HMAC parity and two exact 17-table replays. Four actual 15AK identities retain
  reference-only refusal and all original rows, with zero approvals/observations/publication.
- **PASS:** standalone TypeScript, zero-warning whole-repo ESLint and fresh production build with
  95 static outputs. The mapping route is private/dynamic; public performance budgets unchanged.
  Owned real production Edge smoke verifies no-provider login, same-origin denial, disabled
  observations, no token/cookie/catalog leak and actual mapping-route return to unavailable login.
  The initial fixed-307 probe was wrong for streamed pages: exact meta redirect and browser landing
  are now required, following installed Next and official documentation; HTTP 200 alone cannot pass.
- **PASS:** compiled middleware still covers the mapping route; public SEO, eighty built-page/two
  dynamic-source link, 43-image evidence, snippet and performance audits. Scoped formatting and
  whitespace/secret checks are included in final hygiene. Fixture and owned production servers are
  stopped, ports 3901/3000 released. No deployment/live buyer-channel verification is claimed.

### Gate And Next Action

Activation/publication status: **BLOCKED**. Native SQL/full CLI types, real Auth/PostgREST/Storage and
multi-connection review/role/expiry races have not been newly proven for B11-B15. The old full HTTP
Auth prerequisite remains unavailable, not weakened or replaced by no-provider smoke. The retained
stack is never started/reset/migrated/imported to conceal this limitation. Real 15AK exact images,
rights/match evidence, public output governance, supporting records, verified preview/QA/publication
and all twelve V1 criteria remain open. Legacy rights/search and duplicate/representative-media
warnings remain unchanged. All UI fixture evidence is explicitly synthetic.

No B15 commit/push, merge/deploy, active flag, key provisioning, hosted/retained change or public
data change occurred. Earlier B1-B10 CI passed; pending B11-B13-only permission is not B14/B15
submission authority, and historical CI does not validate this new candidate.

Next prepare real-service reviewer acceptance and obtain authorization for an exact reviewed
disposable native/Auth/Storage/concurrency CI batch. Keep the preserved stack untouched; afterward
use owner-supplied exact 15AK evidence to progress the real pilot, not synthetic approval records.

Final hygiene rechecked 2026-10-05: standalone TypeScript and zero-warning ESLint pass; scoped
Prettier and tracked whitespace checks pass; 615 tracked/untracked text files have no high-confidence
secret patterns. Generated inventory remains 18 migrations/892 declared assertions and 43 structured/
zero strict verified SKUs. HEAD is unchanged; all publication/activation/native-provider limits above
remain in force. No new goal-completion claim or authorization is inferred from final hygiene.

## M4-B16 Disposable Media Acceptance Preparation

Local checkpoint: 2026-10-05, uncommitted on `c190456df9609397859c2767bd13c3cf10d22068`.
The [dated acceptance decision](../../knowledge-base/decisions/2026-10-05-console-m4-disposable-media-acceptance.md)
owns the ephemeral-key/test-data boundaries. This completes local harness preparation only,
not native acceptance or M4/V1. No repository rule override applies.

### Files And Scope

- Add `scripts/console/media-acceptance.ts`, `test-media-acceptance.ts` and
  `test-media-working-browser.ts`.
- Extend `local-acceptance.ts` with the shared complete pristine count query;
  `browser-server.ts`/`test-browser-server.ts` with explicit observer/runtime-only configuration;
  `test-original-working-browser.ts` with in-memory original bytes/IDs returned to the media helper;
  `test-working-browser.ts`/`test-working-isolated.ts` with the guarded media sequence, revocation,
  exact ledger counts, source parity, key disable and no-publication assertions.
- Add `console:media:acceptance:guards` to `package.json` and the prepared quality workflow;
  rename the existing database workflow step to include media review. Preserve the existing CI-only
  reset/teardown and do not add a local retained-stack reset or another provider/destination.
- Update this record, Goal/generated report, media knowledge, dated decision and append-only log.
  Components/visuals removed or changed: none. No new dependency, application route/schema change,
  canonical data/image/geometry change or SEO/RFQ impact in B16. Existing B11-B15 work is preserved.

### Prepared Real-Service Scenarios

The existing fresh CI/local/socket/container/provider/source checks remain mandatory. Before a
synthetic account or observer write, re-read the full pristine baseline. Generate a new random
32-byte key/UUID, send insert via captured psql stdin with statement/error-statement logging disabled,
and pass it explicitly to the owned Next runtime only. Do not inherit an ambient observer key,
put it into process-global env, load `.env`, include it in the build or expose it to the browser.
Disable only the owned key on success/failure and clear its helper reference; no history is deleted.
If provisioning returns an error, attempt exact-ID disable and report an unverifiable cleanup.

The native helper operates only on `AF-MIG-TS-9998`, a synthetic non-shadow DRAFT, and generated
raster/test-only evidence. It prepares seven additional native scenarios, not seven passes:

1. Two independent actual source forms, source reload, exact original association and submission.
2. Real cookie-scoped byte inspection/raster load, three human acknowledgements, APPROVE persistence
   and two contended exact receipt retries with one immutable decision/observation.
3. Unselected contradiction invalidation, EDIT conflict inheritance and explicit REJECT retention.
4. Anonymous/viewer/foreign-origin inspection, copied actor/tampered signature refusals and two
   fresh approval requests observed waiting on PostgreSQL locks; exactly one must win.
5. Exact immutable four-revision decision history and six persisted 360-1440px viewport screenshots.
6. Revoked reviewer cannot inspect, read, replay completed review or use a still-current observation.
7. Logged-out owner browser cannot inspect or reuse copied review credentials.

Final fixture assertions require three sources, one head, five revisions, ten evidence links,
four decisions, one current, two observations and one disabled key. The final pending candidate
and historical current/observation remain retained after revocation and disable. Both original
objects/manifests stay unchanged, unapproved and `not_attested`; original 43 variants/604 technical
values, compatibility and original media rows remain exactly preserved. Re-download both Storage
objects after media review, revocation and browser logout through the independently retained owner
SDK session and compare their complete bytes. Require no synthetic
`product_media`, no replayable observation in receipts/events, zero publication-ready non-legacy
output and zero `publish_records`. The pristine zero-work gate is not relaxed to achieve these
post-fixture counts. Failed fixtures remain until the disposable job's existing owned teardown.

### Checks Actually Run

- **PASS:** five mocked provisioning guards, seven browser-server guards and eight target/invocation
  guards. Existing work/missing counts/ambient settings are refused; random material is generated
  only after the guard; runtime/build separation, scoped disable, cleanup failure and sanitized
  provider error are tested. These are not actual key provisioning or Docker/provider acceptance.
- **PASS:** seven mapping read groups, five media command groups and eleven inspector groups.
  Transport remains explicitly mocked. TypeScript and whole-repository zero-warning ESLint pass.
- **PASS:** 18 embedded suites/892 assertions, complete public schema type parity, HMAC parity,
  two exact 17-table replays and real-15AK-identity negative controls. No external service used.
- **PASS:** migration validator, strict SQL-report and database-type contracts. No new migration.
- **PASS:** fresh production build plus actual Edge unavailable-provider/private-header/origin/
  disabled-observation/mapping-route smoke. Initial restricted build failed in Windows SWC path
  canonicalization with access denied; ordinary local permissions passed the unchanged owned
  harness. Server was stopped; ports 3000/3901/54321 have no listeners. No Auth/Storage acceptance
  is inferred from this intentionally provider-absent smoke.
- Final formatting, whitespace, secrets, compiled matcher and public output audit results are
  recorded after final hygiene below. No native media screenshots/results have been generated.

### Remaining Gate And Next Action

Native/CLI/Auth/PostgREST/Storage/multi-connection media acceptance: **NOT_RUN**.
Activation/publication: **BLOCKED**. The complete prepared browser sequence, ephemeral key SQL,
actual provider behavior and exact final fixture counts must be proven in newly authorized clean CI;
local guard/SQL/smoke results cannot substitute. Retained local Auth remains unavailable and is
not started/reset to satisfy a test. Real 15AK image/rights/match evidence, public output governance,
supporting records, verified preview/QA/publication and all twelve V1 criteria remain incomplete.

No actual provider key, active flag, retained/hosted migration/import/write, public/canonical change,
commit/push, merge or deployment occurred. B1-B10 authorization is fulfilled; pending B11-B13-only
permission does not cover B14-B16. Next obtain fresh exact-batch reviewed CI-only submission
authorization, run native acceptance and address any real failure without weakening the safeguards.
Then use owner-supplied exact 15AK evidence for real human approval. Existing legacy-media warnings
and public source authority remain unchanged.

Final hygiene (2026-10-05): current TypeScript/zero-warning lint, scoped formatting/whitespace,
compiled production middleware, public SEO/43-image/performance, company evidence/Goal report and
619-text-file secret checks pass. Client chunks contain neither observer-secret configuration nor
private key table names. Generated inventory remains 43 structured/zero strict verified SKUs and
18 migrations/892 declared SQL assertions. No native media screenshots or results are claimed.
HEAD and public/canonical/deployment files remain unchanged, with all owned test sessions stopped.
The earlier unanswered B11-B13-only question is superseded by a new pending exact B11-B16 CI-only
question for `18803076512/arcfort-website`, `codex/v2-industrial-brand-system`; this is not approval.

### B16 Review Follow-Up

Local checkpoint: 2026-10-05. This is B16 review/test preparation, not a new application phase.

- Add `scripts/console/sql-runtime/rehearse-media-workflow.mjs` and invoke it from the existing
  embedded authority runner after both pristine 17-table imports, before later authority fixtures.
  Exercise the actual domain parser, Node server signer and public SQL wrappers in one rollback-only
  transaction. JWT actors and Storage object metadata are simulated; no provider or inspector runs.
- Reuse validated insert/disable builders from `media-acceptance.ts`, preserving caller transaction
  ownership and native CI/pristine checks. Generate in-memory random key material only after the
  pristine check; clear owned buffers/reference and roll back all users, work and key rows.
  The package embedded command uses `--conditions=react-server` for the actual server-only signer.
- Correct only synthetic source dates in the rehearsal and `test-media-working-browser.ts` to the
  execution UTC date. The first rehearsal refused the fixed October 5 fixture while UTC was still
  October 4. Source validation, real evidence dates and publication gates are not weakened.
- **PASS:** source/propose/submit/APPROVE/EDIT/REJECT through all five revisions; omitted contradiction
  invalidation, EDIT conflict inheritance, REJECT/current retention and exact same-request replay.
  Copied-actor, viewer, altered HMAC, closed-candidate and revoked-role/snapshot/replay refusals pass.
- **PASS:** exactly three sources, one head, five revisions, ten links, four decisions, one current,
  two observations and one disabled key before rollback. Original asset metadata is unchanged;
  no raw token/key is present in receipt/event output. Current historical proof survives reviewer
  revocation/key disable; the synthetic SKU stays DRAFT, blocked and without eligible main output,
  synthetic `product_media`, publication-ready non-legacy mapping or publication record.
- **PASS:** after rollback the full pristine counts and all full rows in 17 imported tables match
  their pre-rehearsal snapshots. Existing real-15AK/reference-only negative controls still pass.
  All 18 suites/892 declared pgTAP assertions, official public types/source and HMAC parity pass;
  rehearsal JavaScript assertions are additional and do not inflate the declared pgTAP inventory.
- **PASS:** six observer guards, seven browser-server guards, eight target guards, five media-command,
  seven mapping-read and eleven inspector groups; migration/type/report contracts, standalone
  TypeScript and zero-warning lint. Final formatting/secret/whitespace evidence follows below.

Components, visuals, dependencies, migrations, canonical product/media data and public SEO/RFQ:
unchanged in this follow-up. No retained/hosted operation, Docker/WSL startup/reset, native key,
active flag, commit/push, merge or deployment occurred. Native Auth/PostgREST/Storage/actual-byte/
concurrency acceptance remains **NOT_RUN**, activation/publication **BLOCKED**, and full V1
incomplete. The existing pending exact B11-B16 CI-only question is not answered by this review;
do not infer new authority from an old fulfilled M4 approval or a synthetic pass.

Next run the prepared native workflow after fresh exact-batch CI authorization, then advance the
real 15AK pilot with owner-supplied image/rights/match evidence and separate publication approval.

Final follow-up hygiene (2026-10-05): the actual package embedded command also exits 0 with the
892-assertion suite and new rehearsal. Standalone TypeScript/zero-warning lint, scoped formatting,
tracked whitespace and 620-text-file secret checks pass. Generated inventory remains 43 structured/
zero strict verified SKUs and 18 migrations/892 declared assertions; legacy image/company warnings
are unchanged. HEAD remains `c190456df9609397859c2767bd13c3cf10d22068`; public/canonical/deployment
files are unchanged. Read-only netstat shows no connection/listener on ports 3000/3901/54321.
All test sessions have completed. No production build/UI test is rerun for this test-only follow-up;
the separately bounded prior B16 no-provider build result is not expanded into native proof.

## M4-C1 OEM Reference Source Foundation

Local checkpoint: 2026-10-05 on unchanged HEAD `c190456df9609397859c2767bd13c3cf10d22068`.
This progresses the M4-C OEM/packaging/document scope, not M5 or a reduced definition of V1.
The [dated decision](../../knowledge-base/decisions/2026-10-05-console-m4-oem-source-intake.md)
owns the new source boundary, alternatives, future review and reversal conditions.

### Files And Behavior

- Add migration `202610050019_product_intelligence_oem_sources.sql`: one forced-RLS immutable
  `oem_source_bindings` table, exact scope index, private source intake/match/eligibility helpers,
  source immutability and audit hooks. Reuse current authority/role locks, receipts and capabilities.
- Add `product_intelligence_oem_sources.test.sql` with 80 rollback-only assertions and
  `scripts/console/sql-runtime/rehearse-oem-intake.mjs`; extend the existing authority runner.
- Generate `lib/supabase/database.types.ts` with the official embedded generator, preserving its
  non-public helpers/enums; extend migration/strict-report contracts to 19 migrations/suites and
  972 assertions. No earlier migration or test assertion is removed or weakened.
- Add the exact zero `oemSources` pristine check in `local-acceptance.ts` and its two guard fixtures.
  Existing OEM work is refusal, not permission to reset a database or bypass the current guard.
- Update Goal/generated report, this runbook, dated source decision, OEM knowledge and append-only
  log. Components/visuals/dependencies removed or added: none. No public route or runtime UI change.

Sources retain exact editable SKU, manufacturer label, unnormalized reference string, full source
digest, current product-identity digest, custodian/date/document version/location and explicit
supports/contradicts/reference-only assertion. No alias, equivalent number or compatibility is
inferred. The source class/level/basis must agree. A company catalog or official manufacturer
reference cannot alone support ArcFort confirmation. Qualifying declared Level A metadata only
prepares later human review; it is not document verification, an approved OEM record or fitment.

Only private database functions are prepared. There is no public mutation RPC, application command,
UI, active flag or current/effective OEM revision in this batch. Original `oem_references` and
repository facts remain unchanged. All test reference strings are explicitly synthetic TEST-ONLY
values, not invented real product facts or canonical data.

### Checks Actually Run

- **PASS:** 80 new SQL assertions: adoption, exact identity, receipt replay/payload drift, source
  classes/bases, missing/malformed/oversized/future fields, cross-SKU/manufacturer/number refusal,
  contradictory evidence, role/service-claim/revocation, forced RLS, absence of mutation grants,
  immutability even with transaction capability, product-identity drift and zero confirmation/
  compatibility/approval/publication. A legacy OEM row and complete product rows remain unchanged.
- **PASS:** all 19 embedded suites/972 pgTAP assertions, complete official public-schema type parity,
  HMAC parity, two exact 17-table imports and all previous real-15AK/media/technical/compatibility
  negative controls. No provider or retained database is contacted.
- **PASS:** four real 15AK identifiers plus one actually created synthetic draft accept only their
  exact TEST-ONLY source bindings; company-catalog/reference-only evidence cannot support review.
  Original OEM/variant/technical/compatibility/media/source rows remain unchanged; all 17 imported
  tables plus OEM tables exactly match their pre-rehearsal full rows after rollback. No approval,
  fitment or publication is produced. Additional JavaScript assertions do not inflate pgTAP counts.
- **PASS:** six observer, seven browser-server and eight target guards, strict report/type/migration
  contracts, standalone TypeScript and whole-repository zero-warning lint.
- **PASS:** fresh production build and owned real Edge unavailable-provider/private-header/
  foreign-origin/default-off-observation smoke with ordinary local permissions. No `.env`, Auth,
  Docker or database is used; the owned server stops and its port is released. No UI is added,
  so no new reviewer screenshot or actual human/browser persistence is claimed.
- **PASS:** compiled production middleware, public SEO/internal links/snippets, all 43 legacy-image
  evidence projections, unchanged performance budgets and company evidence validation. Existing
  legacy rights/duplicate/company-representative warnings remain; zero new eligible public images.

### Remaining Gate And Next Action

Native SQL/full CLI types/Auth/PostgREST/multi-connection acceptance: **NOT_RUN** for this candidate.
The new source metadata tests are not real OEM evidence or a completed owner workbench. Activation/
publication stays **BLOCKED**. Implement exact OEM proposals, frozen review, conflict-preserving
APPROVE/EDIT/REJECT, effective/current reads and owner controls; complete packaging/documents and
then the full M4 gate. Real 15AK Level A facts, exact photos/rights/match, verified preview/QA and
separately authorized publication remain necessary for all twelve V1 criteria.

No actual signing key, retained/hosted migration/import/write, Docker/WSL startup/reset, canonical
fact/image, public-source cutover, commit/push, merge or deployment occurred. Pending B11-B16 CI-only
authority is not extended to C1; retain that exact scope if a reply arrives. Any submission containing
this new batch needs fresh exact destination/action/batch authority. No repository rule override.

Final C1 hygiene (2026-10-05): scoped formatting, tracked whitespace and 625-text-file secret checks
pass. Generated inventory is 19 migrations/19 suites/972 declared assertions and 43 structured/zero
strict verified SKUs. Original public/canonical/deployment files and HEAD are unchanged; read-only
netstat shows no connection/listener on ports 3000/3901/54321. Owned test sessions are completed.
These results do not alter native-provider, real-evidence, approval or full-V1 limits above.

## M4-C2 Frozen OEM Human Review

Local checkpoint: 2026-10-05 on unchanged HEAD `c190456df9609397859c2767bd13c3cf10d22068`.
The [dated review decision](../../knowledge-base/decisions/2026-10-05-console-m4-oem-human-review.md)
extends the C1 source boundary inside M4-C, without treating the private schema as completed V1.

### Files And Behavior

- Add `202610050020_product_intelligence_oem_review.sql`: five forced-RLS read-only tables for
  heads/revisions/evidence/decisions/currents, exact snapshot/source/decision/current guards,
  private propose/submit/review commands, guarded validity read, invoker effective/readiness views
  and shared readiness/dashboard/lifecycle protection. No application mutation grant or UI.
- Add `product_intelligence_oem_review.test.sql`, 110 rollback-only assertions. C1's existing
  TRUNCATE refusal test now includes dependent tables via CASCADE so the original prohibition
  still runs after the new foreign keys; no successful truncation or weaker acceptance occurs.
- Regenerate `lib/supabase/database.types.ts` using the official embedded generator. Extend
  migration/report checks to 20 suites/1,082 assertions; extend all pristine guards/fixtures with
  zero OEM heads/revisions/evidence/decisions/currents. Existing data remains a hard refusal.
- Extend `rehearse-oem-intake.mjs` with proposal/submission/refusal and all new-table rollback
  parity; preserve the existing full source-row checks. Update Goal/generated inventory, OEM
  knowledge, dated decision and append-only log. Dependencies/components/visual changes: none.

Heads retain exact SKU/slot and optional original lineage; proposals preserve case, punctuation
and digits. Selected evidence must match exact SKU/manufacturer/reference. Frozen hashes include
the full original row, current identity, all selected source rows and omitted known contradictions.
Conflicted/pending drafts require a human decision; EDIT retains history, creates a new unapproved
proposal and cannot clear inherited conflict by changing the number. REJECT preserves the preceding
current. APPROVE requires a fresh frozen snapshot, current human role, explicitly selected eligible
source, four acknowledgements and conflict resolution when needed. Level B decisions remain
`OEM_REFERENCE`; only qualifying exact Level A plus human review can support `CONFIRMED`.

Original OEM rows are not mutated. Invalid current approvals remain visible as `DATA_CONFLICT`,
never quietly fall back to an original. All effective OEM rows have `publication_ready=false`;
designation approval never changes compatibility. Open/conflicted/invalid OEM records add only
the OEM readiness blocker and deny publishable lifecycle transitions. Existing twenty-column
readiness/nine-metric dashboard shapes and technical-conflict metric meaning remain unchanged.

### Checks Actually Run

- **PASS:** all 110 new assertions: role/adoption boundaries, no mutation grants, forced RLS,
  exact-source/identity/lineage/duplicate/slot validation, atomic receipts, frozen hashes and
  timezone, human/status/source acknowledgements, Level B/A/catalog/secondary distinctions,
  omitted/new/inherited conflicts, EDIT rollback/history, REJECT/current retention, exact original
  rows, independent decision/current/evidence guards even with capability, source/identity drift,
  readiness increment/removal without bypassing other blockers, revocation/RLS and zero publication.
- **PASS:** all 20 embedded suites/1,082 pgTAP assertions, exact complete official public type
  contracts, old HMAC parity, two complete 17-table source imports and existing media/technical/
  compatibility negative controls plus sequential media rehearsal. No provider contacted.
- **PASS:** four real 15AK identifiers plus one actually created synthetic draft receive five
  frozen TEST-ONLY OEM proposals. Every reference-only company-catalog APPROVE attempt fails
  specifically with evidence SQLSTATE `23514`, not a transport error; zero decisions/currents/
  compatibility/publication. All original rows and every imported/OEM table are exact after rollback.
  These JavaScript checks are additional to, not included in, the pgTAP count.
- **PASS:** eight disposable target/pristine, six observer, seven owned-server guards; strict
  migration/report/type contracts, destination configuration, old command/media-read/inspector
  regressions; whole TypeScript and zero-warning lint.
- **PASS:** fresh production build and real owned Edge unavailable-provider/private-header/
  cross-origin/default-off observation/command smoke. Ordinary local permissions avoid the known
  restricted Windows SWC path issue. No `.env` file, retained database or provider is used; the
  owned server is stopped and its port released. No new OEM UI or responsive evidence is claimed.

### Remaining Gate And Next Action

Native PostgreSQL/full CLI types/Auth/PostgREST/role revocation/concurrency: **NOT_RUN** for C2.
Source metadata and synthetic acknowledgements are not real OEM document/identity approval.
Application contracts/HTTP commands and the usable owner workbench remain next, followed by
packaging/documents and full M4 acceptance. Full V1 still needs real 15AK Level A facts, exact
photos/rights/match, governed public output, verified preview/QA and separately authorized publication.
Activation/publication remains **BLOCKED**; that gate does not prevent safe local V1 implementation.

The late September 28 compatibility/original/cookie approval was verified as already fulfilled:
read-only GitHub showed `c190456d`, both successful jobs in run `36411995482`, PR 130 open/unmerged
and branch deployments disabled. It does not cover current uncommitted work. Pending B11-B16-only
authority is not extended to C1/C2. No commit/push, merge/deploy, actual key, active flag, provider/
retained migration/import/write/reset/startup, canonical fact/image, public-source cutover or
repository rule override occurs here. Do not start/reset the retained stack for fresh acceptance.

Final C2 hygiene (2026-10-05): scoped formatting/whitespace, compiled middleware, public SEO
(40 product/zero series pages), all 80 built pages/two dynamic link audits, 43 legacy-image evidence
projections/zero eligible search images, snippet and unchanged performance-budget checks pass.
Company evidence validation retains its existing representative-media warnings. Secret scan passes
for all 628 tracked/untracked text files. Generated inventory is 20 migrations/20 suites/1,082
declared assertions and 43 structured/zero strict verified SKUs. Public/canonical/deployment files
have no diff; read-only netstat shows no listener/connection on 3000/3901/54321. All owned sessions
are completed. No native, real human approval, external-write or full-V1 claim is added.

## M4-C3 OEM Application Workbench

Local checkpoint: 2026-10-05, unchanged HEAD `c190456df9609397859c2767bd13c3cf10d22068`.
The [C3 decision](../../knowledge-base/decisions/2026-10-05-console-m4-oem-workbench.md) owns the
application/SQL activation distinction and extends, rather than replaces, C1/C2 evidence rules.

### Files And Experience

- Migration `202610050021_product_intelligence_oem_commands.sql`: four narrow authenticated public
  wrappers; guarded source-current/proposal-fresh reads; two invoker state views. No new table,
  private/direct-write/anonymous/service grant or original/compatibility/publication mutation.
- New `lib/domain/catalog/oem.ts`, `lib/console/oem.ts`, `components/console/OemWorkbench.tsx` and
  `app/(console)/console/(protected)/products/[id]/oem/page.tsx`; extend command parser/executor,
  default-off configuration, shared navigation, existing Console CSS and explicit error-clear hook.
- New rollback-only OEM command SQL suite (48 assertions), seven command and seven read groups,
  synthetic OEM fixture and fifteen-group browser script. Extend fixture routing, production
  no-provider smoke, official generated types, strict migration/report checks, package/quality tests
  and this runbook/Goal/knowledge/log. Dependencies unchanged.

The private workspace displays SKU, imported originals, stable reference heads, current approval,
latest proposal, all exact-scope source metadata/contradictions and paginated decisions. It supports
source entry, proposal save, frozen submission and human APPROVE/EDIT/REJECT with existing current
roles and CSRF/receipts. Reference versus confirmed status is an explicit human choice with selected
qualifying frozen evidence, unchecked acknowledgements and required conflict resolution. Source
intake defaults to company-catalog/reference-only with blank evidence details; it is not approval.
No numbering normalization, fitment inference, public preview/QA/publish action or factual change.

Changed copy/evidence/reason blocks old-snapshot submit/approve. Stale-command failures require
reload. Reload restores stored fields and clears unsaved source/decision choices. Pending source
edits block competing actions; exact original lineage cannot be reused by another head. Current
invalid approvals stay visibly conflicted; history labels preserve actual decision status separately
from the original proposal. Reads reject counted-page gaps/duplicates, source/class/scope/current
inconsistency and detectable state/role drift. HTTP rechecks are not an atomic database snapshot.

`CONSOLE_OEM_ENABLED` is a separate default-off application guard requiring exact local working
configuration. No active setting changed. Migration 21's authenticated RPC grants are independently
role/adoption/snapshot guarded, not revoked by this UI switch; applying it to any native/hosted target
is a separate authorized operation. Every effective OEM publication flag remains false.

### Checks Actually Run

- **PASS:** 21 embedded suites / 1,130 pgTAP assertions, including all 48 new wrapper/grant/current
  role/view/lineage/reference/receipt/revocation/original-retention/no-fit/no-publication assertions.
  Complete official public types, HMAC parity, two exact 17-table source imports, old sequential
  media rehearsal and five frozen TEST-ONLY OEM real-identity proposals/refusal/rollback checks pass.
- **PASS:** seven OEM parser/transport/config/role/result/eligibility groups and seven counted
  read/current/history/drift/failure groups using the actual SDK with mocked provider transport.
- **PASS:** fifteen real Edge synthetic UI groups, fourteen intercepted commands, six screenshots
  at 360/390/768/1024/1280/1440. Approve A/B, unchecked declarations, conflict resolution, stale
  source/current/snapshot, EDIT/REJECT, unchanged submit versus unsaved edits, new proposal/lineage,
  source defaults/retention, current roles, reload/unsaved/history, malformed reply/retry/busy state,
  successful source reset and decision navigation without an unsaved prompt,
  keyboard order, target size and nonblank/no-overflow checks. All six screenshots inspected;
  zero page errors and zero external requests. `.tmp/console-oem-ui/report.json` owns local evidence.
  The fixture is explicitly synthetic and has no database connection; persistence is not proven.
- **PASS:** whole TypeScript, zero-warning lint; existing command/media read/inspector/original/
  compatibility/config/type/report and disposable target/observer/owned-server guards. Fresh
  production build plus actual owned Edge no-provider/private-header/cross-origin/default-off
  command smoke includes both media and OEM routes. Owned servers stopped; ports released.
- **PASS:** compiled middleware/source matcher, public SEO (40 products/zero series), 80 built pages
  and two dynamic link sources, all 43 legacy images/zero new search-eligible assets, snippet,
  unchanged performance budgets and company evidence checks. Existing company/media warnings stay.
- **PASS:** current owned production-server HTTP privacy/host isolation/CSRF/public-shell/social/
  sitemap/robots regression with explicit `--provider-absent`, including the OEM route. This mode
  independently refuses runtime env files or an occupied provider port and requires exact 503/body
  responses before form/Auth mutation. Default native mode retains the exact 400/form requirement;
  native Auth is not inferred or weakened by an absent-provider pass.

Initial synthetic checks exposed unstable select/textarea label matching; explicit accessible names
corrected it. The attempted selection of an already bound original was rightly denied; the corrected
fixture tests both that denial and an actually unlinked synthetic original. No authority constraint
or production behavior was weakened to obtain the pass. The standalone old HTTP script initially
lacked its server, then correctly encountered absent-provider 503 rather than its native 400
prerequisite. Neither failed invocation is counted as a pass. The subsequent owned current-build
browser smoke and explicit absent-provider HTTP mode both completed successfully.

### Remaining Gate And Next Action

Native CLI/full types/Auth/PostgREST/multi-connection/persisted OEM browser acceptance: **NOT_RUN**.
Real OEM document verification, Level A 15AK technical facts, exact photos/rights/match, packaging/
documents and governed preview/QA/publication remain open. Local workbench acceptance is progress,
not full M4/V1 or a proven publication channel. Prepare native isolated OEM acceptance next without
starting/resetting any adopted/retained database. All twelve V1 success criteria remain in scope.

Read-only GitHub reconfirmed CI `36411995482` successful for `c190456d`, both quality/database jobs,
and PR 130 open/unmerged on the exact authorized branch. The late September 28 approval was already
fulfilled; pending B11-B16-only authority is not enlarged to C1-C3. No commit/push, merge/deploy,
native migration/import/reset, provider operation, actual key, active feature, canonical fact/image,
commercial-policy or public-source change occurs. No repository rule override. The Docker repair
remains historically accepted; this turn's read found its engine pipe absent, so no new current
engine/data-health claim or repeated installation/start/reset is made.

Final C3 hygiene: scoped formatting, tracked whitespace and high-confidence secret scan pass for
639 repository text files. Generated inventory is 21 migrations/21 suites/1,130 declared assertions
and 43 structured/zero strict verified SKUs. HEAD/public/canonical/deployment files remain unchanged.
All owned test handles completed and no test listener remains on 3000/3901/54321. The native and
real-evidence gates above stay open; safe local progress does not authorize activation or completion.

## M4-C4 Disposable OEM Acceptance Preparation

Local checkpoint: 2026-10-05; unchanged HEAD `c190456df9609397859c2767bd13c3cf10d22068`.
The [C4 decision](../../knowledge-base/decisions/2026-10-05-console-m4-disposable-oem-acceptance.md)
owns invocation, provider-absence finding, scope, rollback and authority boundaries.

### Files And Prepared Workflow

- New `scripts/console/oem-acceptance.ts`, `test-oem-acceptance.ts`, `test-oem-working-browser.ts`
  and `sql-runtime/rehearse-oem-workflow.mjs`; extend the actual authority rehearsal.
- Extend `local-acceptance.ts`, `browser-server.ts`, their guard suites, `test-working-browser.ts`
  and `test-working-isolated.ts`. Exact `--local` remains default; optional final `--oem` is separate
  from ambient flags and from owner permission. Package/quality runs the new non-native guard only.
- Extend no-provider browser/HTTP preflights and safe stage diagnostics. No application component,
  route, CSS, migration/type, dependency, public source or active configuration change.
- Update this runbook, Goal/generated inventory, OEM knowledge, C4 decision and append-only log.

The prepared native workflow uses actual parent Auth sessions, UI forms, private cookies and real
unmodified command replies. It covers B reference-only approval, late unselected contradiction,
stale review, EDIT conflict inheritance, REJECT retention, explicit A confirmation/resolution,
observed exact-receipt contention and a fresh form/SDK approval race. Wrong scope/designation,
digest/evidence/status, anonymous/viewer/editor/foreign-origin, revoked HTTP/RPC/receipt/read and
logout cases refuse. Counted history and six widths are prepared, not claimed executed here.

Only the parent's created synthetic DRAFT 9998 receives OEM writes. The final independent ledger
requires 3 sources, 1 head, 5 revisions, 10 links, 4 reviewer decisions, 1 valid current; statuses/
states remain exact and publication counts zero. Original imported OEM/source/product/fact/fit/
media rows stay exact; the OEM phase also snapshots working technical/compatibility/media and all
product/publication rows for no interference. B16 original-byte retention/key disable is preserved.

### Checks Actually Run

- **PASS:** all 21 embedded suites / 1,130 assertions, official complete public types, HMAC parity,
  two exact 17-table source imports, existing media and real-identity TEST-ONLY OEM negative controls.
- **PASS:** new sequential actual-parser/public-wrapper OEM rehearsal: two created synthetic
  drafts; three exact sources, five revisions, B reference/A confirmation with explicit declarations,
  late omitted contradiction, stale refusal, EDIT/REJECT, exact receipt retry and sequential stale
  loser, active editor/viewer refusal, reviewer revocation, exact independent ledger and retained
  rows; zero publication and full pristine/17-table rollback parity. Simulated actors only.
- **PASS:** 8 local target, 9 server and 4 OEM fixture/ledger/default-CI guard groups. Malformed
  OEM invocation is refused by the integrated runner before host/provider access. All HTTP statuses
  and timeout/policy/reset/unknown failures refuse no-provider mode; only ECONNREFUSED qualifies.
  Existing 14 OEM command/read groups and media provisioning/commands/reads/inspector regressions pass.
- **PASS:** TypeScript, zero-warning lint, strict 21-suite/1,130 report, migration/type contracts,
  installed matcher source; independent current production build (95 generated pages), owned
  no-provider-config server startup and Edge launch diagnostic. All owned processes stopped.
- **PASS:** completed-build public SEO (40 products/zero series), 80 HTML/two source-page links,
  all 43 legacy image disclosures/zero new eligible assets, snippets, unchanged performance budgets
  and company evidence. Existing representative-company-media warnings remain.

Initial rehearsal controls expected 23514 where exact scope/designation mismatch correctly returns
22023; the test expectation was corrected. The independent private ledger correctly refused the
authenticated role; it now runs as privileged evidence, while public read validity is tested under
the owner role. No SQL grant, evidence guard or application contract was weakened.

### Provider-Absence Finding And Remaining Gate

The initial no-provider browser smoke failed, eventually localized to login provider-state: the
invited-member form appeared instead of unavailable state. Ordinary read-only loopback settings
GET with an invalid synthetic key returned HTTP 200/invite-only switches, despite successful port
bind/no netstat listener. No Auth login/form mutation was performed; service identity is unverified.
Standalone server and Edge launches pass, but do NOT substitute for the failed full smoke.

`assertProviderAbsent` now runs before either no-provider entrypoint's server/browser/form/command
requests, accepting only actual connection refusal. Both current entrypoints were actually checked
to exit at that preflight, with no server/browser/POST. This is a **PASS refusal control**, not a
no-provider acceptance pass. Full no-provider browser/HTTP acceptance here is **BLOCKED**; native
OEM Auth/PostgREST/multi-connection/persisted browser acceptance is **NOT_RUN**. An early public link
audit read an in-progress rebuilding directory (zero HTML); the completed-build rerun passed all
80 pages. Missing-script invocation was corrected; it is not counted as a type-contract pass.

Do not stop/reconfigure/reset the reachable endpoint, adopt the retained stack, infer Docker health
or claim native acceptance. No native migration, actual key, retained/hosted write, production/
canonical fact, OEM truth, fitment, public media, SEO/RFQ or visual change. No commit/push/merge/
deployment or rule override. The old CI approval is fulfilled; a fresh B11-B16 plus C1-C4 scoped
review/commit/push/explicit OEM isolated-CI question replaces pending B11-B16-only scope, unanswered.

Next complete the separately authorized disposable native OEM gate, then the remaining M4 packaging/
documents and real 15AK evidence. The full V1 goal/all twelve success criteria remain incomplete.

Final C4 hygiene: all 21 scoped code/record files pass formatting; whitespace/typecheck and the
644-text-file high-confidence secret scan pass. The final embedded rerun again passes all 1,130
assertions and the new OEM workflow. Generated inventory remains 21 migrations/21 suites and 43
structured/zero strict verified SKUs. Public/canonical/deployment targets and HEAD are unchanged;
all owned sessions have completed and no test listener remains on 3000/3901. A reachable provider
is not stopped or treated as an owned test process. Native/no-provider/real-evidence limits remain.

## M4-D1 Physical Packaging Source Foundation

Local checkpoint: 2026-10-05; HEAD remains `c190456df9609397859c2767bd13c3cf10d22068`.
The [D1 decision](../../knowledge-base/decisions/2026-10-05-console-m4-packaging-source-intake.md)
owns the physical-copy/source, original/commercial authority, rollback and permission boundaries.

### Files And Behavior

- New migration `202610050022_product_intelligence_packaging_sources.sql`, SQL suite and
  `sql-runtime/rehearse-packaging-intake.mjs`; extend the embedded authority runner.
- Extend migration validation, strict SQL-report inventory and officially generated public types.
- Extend pristine disposable baseline/local guard/media-observer guard fixtures with
  `packagingSources=0`. Missing/nonzero state refuses before any writes. The prepared native
  runner adds exact original-packaging retention and a final zero-source check, not packaging writes.
- New D1 decision and packaging knowledge; update Goal/generated inventory, this runbook and log.

Physical copy contains only description, quantity and unit; unknown quantity/unit are both null.
Explicit bounded integer counts and unchanged unit labels remain exact. No MOQ/lead-time change,
unit alias/conversion, package-hierarchy inference, human confirmation or lifecycle promotion.
Bindings retain SKU identity, optional original lineage, full source/original hashes, source class/
level/basis/date/custodian/revision/location/assertion and session actor. Private source receipts
recheck current roles. The forced-RLS audited table and bound sources are append-only, with no
public mutation wrapper or direct/anonymous/service permission. No migration is applied natively.

### Checks Actually Run

- **PASS:** 22 embedded suites / 1,238 assertions, including 108 new packaging checks for exact
  quantity/unit/lineage, explicit unknowns, commercial-field rejection, limits/date/class/forged
  approval refusal, current-role/revoked-receipt denial, immutability and identity/original drift.
- **PASS:** complete official public-schema type parity, Node/pgcrypto HMAC controls, two exact
  17-table source imports and all existing technical/compatibility/media/OEM rehearsals.
- **PASS:** five TEST-ONLY packaging sources on four actual 15AK identities and one created
  synthetic DRAFT; exact receipt retry/change refusal, mismatched count/unit/SKU/original refusal,
  reference-only ineligibility, no new human approval or publication and complete rollback.
- **PASS:** all 43 original packaging rows, unknown quantities/unconfirmed states and full MOQ/
  lead-time notes remain exact; originals/facts/OEM/fit/media/publication have no interference.
- **PASS:** eight local target, six media-observer, four OEM acceptance and nine server guard
  groups, strict SQL report/type/migration/shadow contracts and existing console privacy boundaries.
  TypeScript, zero-warning lint, tracked whitespace and initial secret scan pass.

### Remaining Gate And Authority

The sequential in-memory results use simulated actors, not actual Supabase Auth/PostgREST,
multi-connection races, real packaging documents or an owner review. **Native packaging NOT_RUN**;
the packaging editor, immutable revisions, human APPROVE/EDIT/REJECT and current/history projection
are **NOT_IMPLEMENTED** at D1. No readiness metric or public fact is promoted by intake.
The previous provider-absence blocker remains untested/unchanged here; no Docker operation,
loopback provider request, native migration, retained/hosted write, actual key or feature activation.

No commit/push/merge/deploy, canonical product/image/company/commercial change, SEO/RFQ/visual change
or repository rule override. This new D1 scope is not included in the pending B11-B16 plus C1-C4
CI-only question, and the replayed September 28 scope is already fulfilled. Do not append D1 to
an eventual older-scope submission without its own exact approval.

Next finish packaging proposals/human decisions/workbench, then native acceptance and technical
document management. Obtain actual Level A 15AK evidence for verified preview/QA/authorized
publication. Source foundations, embedded tests and existing green CI do not complete full V1.

Final D1 regression: a fresh production build passes with 95 generated pages. Completed-build SEO,
80 HTML/two dynamic-source link checks, 43 legacy image disclosures, snippets and performance pass;
existing company representative-image warnings remain. OEM/media/original/compatibility command,
read and byte/transport regressions and installed matcher checks pass. Final embedded rerun retains
all 1,238 assertions, full public-type parity, exact 43-row packaging retention and rollback.
All owned test/build handles completed. No native packaging or no-provider browser pass is claimed.

## M4-D2 Frozen Packaging Human Review

Local checkpoint: 2026-10-05; HEAD remains `c190456df9609397859c2767bd13c3cf10d22068`.
The [D2 decision](../../knowledge-base/decisions/2026-10-05-console-m4-packaging-human-review.md)
owns scope, exact conflict history, human status, commercial separation and reversal semantics.

### Files And Behavior

- Add migration `202610050023_product_intelligence_packaging_review.sql` and its 94-assertion suite.
  Prepare five forced-RLS history/current tables, private commands, exact event guards, a guarded
  Boolean read, effective packaging/readiness views and a lifecycle trigger.
- Extend `sql-runtime/rehearse-packaging-intake.mjs` from five sources to five frozen reference
  proposals with exact confirmation refusal, no decision/current/publication and complete rollback.
- Update public types through the official generator, migration/report validators, pristine local/
  media guard fixtures and prepared native final-retention checks for all six packaging tables.
- Add synthetic packaging prerequisites to compatibility-review and workflow-guard SQL fixtures
  so each continues testing its intended independent gate with runtime protections enabled.
- Add D2 decision/knowledge and update Goal/generated inventory, this runbook and append-only log.

No application component, route, visual, active flag, public mutation wrapper or actual evidence is
added. Original physical/commercial records remain intact. Missing packaging records now appear
with zero count and a blocker, including rejected-only history. Quantity changes and rejection do
not erase unresolved conflicts; late contradictions against an earlier count still invalidate the
current frozen proposal/approval in the same head. Explicit Level B review remains reference-only
and cannot satisfy supplied-packaging readiness. Unknown counts cannot receive CONFIRMED.

### Checks Actually Run

- **PASS:** 23 embedded suites / 1,332 assertions, including 94 packaging review checks and the
  108 existing packaging-source checks. Covers roles/revocation/receipts, source/lineage/quantity,
  human status/declarations, stale snapshots, late omitted/historical conflicts, EDIT/REJECT,
  immutability/forgery, missing-record lifecycle refusal and unassigned-session read isolation.
- **PASS:** complete official public-schema type parity, HMAC controls, two exact 17-table source
  imports and all existing technical/compatibility/media/OEM rehearsals.
- **PASS:** four actual 15AK identities plus one created synthetic draft accept five frozen
  TEST-ONLY reference proposals, reject actual CONFIRMED calls with the exact evidence error and
  leave zero decisions/current/publication. All 43 original packaging rows, full MOQ/lead-time
  notes and other source tables are unchanged; all rehearsal writes roll back.
- **PASS:** eight local-target and six media-observer guard groups; strict SQL-report/migration
  checks, full TypeScript and zero-warning lint.

The missing-record correction initially made the compatibility SQL fixture fail with the packaging
error instead of its intended compatibility error. Its prerequisite now uses real private frozen
packaging commands with synthetic evidence; the old pre-adoption workflow fixture uses its actual
governed source/event/confirmation path. No trigger is disabled or grant widened. The full rerun
passes; the initial failure is not counted as a pass.

### Remaining Work And Authority

Embedded actors are simulated and sequential. **Native packaging Auth/PostgREST/races NOT_RUN**;
the packaging application contracts, counted UI reads and owner workbench are **NOT_IMPLEMENTED**.
Existing pristine native tests check absence/retention only, not packaging behavior. No existing
provider is contacted or stopped to make a no-provider test pass; Docker health is not reasserted.

No real packaging confirmation, canonical/image/company/commercial change, SEO/RFQ/visual change,
native/retained/hosted mutation, actual key, active setting, commit/push/merge/deployment or rule
override. D1/D2 are outside the pending B11-B16 plus C1-C4 CI-only question. Continue packaging
commands/workbench, separately authorized native acceptance and technical documents, then the real
15AK evidence/verified preview/QA/authorized-publication workflow. Full M4 and V1 remain incomplete.

Final D2 regression: fresh production build completed with 95 generated pages using synthetic
public build configuration only. Completed-build SEO (40 indexable products), 80 HTML/two source
internal-link checks, 43 legacy image disclosures, snippet hygiene and performance budgets pass.
Generated inventory is current at 23 migrations/23 suites/1,332 assertions, 43 structured products
and zero strict verified SKUs. Scoped formatting and whitespace checks pass; the 652-text-file
secret scan finds no high-confidence patterns. Public/canonical/deployment paths have no diff.
Existing media-rights and representative-company-image warnings remain. All owned build/test
handles completed; no server or native/provider acceptance was started in D2.

## M4-D3 Packaging Application Workbench

Local checkpoint: 2026-10-06; HEAD remains `c190456df9609397859c2767bd13c3cf10d22068`.
The [D3 decision](../../knowledge-base/decisions/2026-10-06-console-m4-packaging-workbench.md) extends
D2 with the application boundary; prior dated sections retain their historical scope.

### Files And Behavior

- Add migration `202610050024_product_intelligence_packaging_commands.sql`, four narrow authenticated
  wrappers, guarded source/proposal freshness reads, two invoker-security views and the 52-assertion
  command SQL suite. Regenerate complete public types with the official Supabase generator; extend
  migration/report contracts. Update D1's old no-public-wrapper assertion to require denial for
  anonymous/service callers while preserving private/direct-mutation denial.
- Add `lib/domain/catalog/packaging.ts`, exact packaging command parsing/SDK dispatch, independent
  default-off `CONSOLE_PACKAGING_ENABLED`, current role checks and sanitized minimal receipts.
- Add `lib/console/packaging.ts` for counted and scope-checked originals/sources/current/proposal/
  history; cross-check and reread displayed readiness totals. No private snapshot/actor data is
  returned. HTTP rereads are not an atomic snapshot; database guards remain authoritative.
- Add `PackagingWorkbench.tsx` and protected `/console/products/[id]/packaging`, extend existing
  product navigation and scoped CSS. Show current/latest/conflicting evidence, explicit unknown
  quantity, immutable original lineage, human review controls and read-only commercial notes.
  Reset acknowledgements on changed approval evidence/status; protect dirty source target and
  frozen submission. No public page, new dependency or actual factory fact is added.
- Add synthetic fixture and command/read/browser scripts, package test entries and offline
  command/read checks in the existing quality workflow. No native packaging CI task runs here.
- Add D3 decision/knowledge and update this runbook, Goal/generated inventory and append-only log.

### Checks Actually Run

- **PASS:** 24 embedded suites / 1,384 assertions, including 52 application-command checks plus
  D1's 108 and D2's 94 packaging checks. Actual authenticated database roles exercise narrow
  wrappers; anonymous/service/private/direct mutation remain refused. These are simulated JWT
  actors in sequential in-memory PostgreSQL, not native Auth or independent concurrent clients.
- **PASS:** complete official public-schema type parity, Node/pgcrypto HMAC controls, two exact
  17-table source replays and prior technical/compatibility/media/OEM rollback rehearsals.
- **PASS:** five frozen TEST-ONLY packaging reference proposals on four actual 15AK identities and
  one synthetic draft refuse actual confirmation and preserve all 43 original packaging records,
  full commercial notes, zero new approvals/publication and exact 17-table rollback parity.
- **PASS:** 8 packaging command and 9 packaging-read groups. Exact unknown/known quantity, source
  lineage, commercial-field refusal, roles/default-off behavior, counted pagination, stale/detached
  state, readiness mismatch/drift, history and sanitized transport failures are covered.
- **PASS:** 50 tests across packaging/OEM/shared commands, SQL-report/types and server guards, plus
  34 additional compatibility/media/original-inspection/local-target/privacy/matcher tests. Some
  script tests contain their own subgroups; these totals are not additional SQL assertions.
- **PASS:** 13 provider-free Edge browser groups: explicit reference/actual acknowledgements,
  retry identity, status/source reset, unknown count, stale proposal/source/current, historical
  conflict resolution, EDIT/REJECT, null-count save, stale receipt reload, dirty evidence target,
  role controls, read-only MOQ/lead time, missing package and history/keyboard navigation.
  Six full-page screenshots at 1440/1280/1024/768/390/360, overflow/pixel checks, zero page errors
  and zero external requests. Results: `.tmp/console-packaging-ui/result.json` and
  `.tmp/console-packaging-ui/packaging-{width}.png`; desktop/mobile images visually inspected.

The first migration-24 SQL run correctly invalidated D1's obsolete assertion that no public
packaging wrapper exists. The revised test checks the intended narrowed grants instead; all
private and direct-write guards remain intact. The final complete embedded run passes.

### Remaining Gate And Authority

**Native packaging Auth/PostgREST/persistence/races NOT_RUN.** Browser commands above are intercepted
and cannot modify any provider; automated declarations are not owner review. Real packaging source
documents, technical documents and verified preview/QA/authorized publication remain incomplete.
The application flag stays off. Applying a wrapper in the future exposes its role/authority-guarded
SQL capability independently of the flag, so UI disable must not be described as permission removal.

No Docker change, request to the retained loopback provider, native migration, retained/hosted write,
real key, public/canonical/company/image/commercial change, RFQ change, commit/push/merge/deployment
or repository-rule override. The existing CI observation for `c190456d` is historical, not evidence
for these uncommitted files; no new remote status is claimed. The already fulfilled September scope
and pending B11-B16 plus C1-C4 question do not cover D1-D3. Do not append packaging to an older-scope
push. Next prepare explicit disposable native packaging acceptance and collect exact 15AK packaging
evidence; full M4 and all twelve V1 criteria remain active and incomplete.

Final D3 regression: the final production build passes with 95 generated pages, including the
default-off dynamic packaging route. Type checking, zero-warning lint, public SEO (40 indexable
products), 80 HTML/two source internal-link checks, 43 legacy-image disclosures, snippets and
performance budgets pass. Packaging's 17 command/read groups also pass without a React-server
runtime override, matching the prepared quality-job invocation. Scoped formatting, whitespace
and the 663-text-file secret scan pass. Inventory is 24 migrations/24 suites/1,384 assertions;
43 structured products and zero strict verified SKUs remain. Public/canonical/deployment paths
have no diff. Existing image-rights and representative-company-image warnings remain unresolved.

All owned test/build sessions completed. A separate hidden, sanitized, provider-free fixture
preview was intentionally left at `http://127.0.0.1:3901/console/products/a3000000-0000-4000-8000-000000000001/packaging`
for owner inspection; it cannot save to business data. Local process metadata is retained in
`.tmp/console-packaging-preview.json`. Ordinary desktop/mobile viewport screenshots are
`.tmp/console-packaging-ui/normal-1440.png` and `normal-390.png`, in addition to the six long-copy
stress screenshots. The fixture is not the authenticated native Console or a deployed entrance.

## M4-D4 Disposable Packaging Acceptance Preparation

Local checkpoint: 2026-10-06; unchanged HEAD `c190456df9609397859c2767bd13c3cf10d22068`.
The [D4 decision](../../knowledge-base/decisions/2026-10-06-console-m4-disposable-packaging-acceptance.md)
owns the prepared contract, synthetic evidence and authorization boundary.

### Files And Prepared Behavior

- Add `scripts/console/packaging-acceptance.ts`, strict fixture/ledger guard tests and
  `test-packaging-working-browser.ts`. Target only the parent's synthetic non-shadow browser DRAFT;
  use real source/proposal/review forms, actual SDK/RPC and existing observed authority-lock races.
- Extend `local-acceptance.ts`, `browser-server.ts`, `test-working-isolated.ts` and
  `test-working-browser.ts` with explicit independent packaging opt-in, shared real role/revocation/
  logout phases, exact final ledger and original/commercial retention. Default invocations remain
  off. Prepared invocation: `--local --packaging`, optionally with unique `--oem`; not run here.
- Add `sql-runtime/rehearse-packaging-workflow.mjs` to the existing in-memory authority runner. Use
  actual parser/public wrappers, simulated actors and savepoint-controlled exact SQL error checks.
- Correct packaging and OEM native harnesses to await their refreshed latest-proposal revision and
  state. The former full-document-load wait does not match these App Router workbenches. No runtime
  UI change or relaxation of provider/authorization/data assertions was needed.
- Add package/quality fixture-guard entry and expand invocation/server guard tests. Current CI does
  not opt into native packaging/OEM writes. Add D4 decision/knowledge, Goal checkpoint and this log.

The packaging test history is one stable head: unknown-count reference approval; 10-piece pending
proposal followed by a late contradiction against the historical unknown copy; EDIT to 12 pieces;
REJECT; a fresh explicitly resolved 12-piece confirmation; one further pending revision for
revocation tests. The final exact ledger is five sources, five revisions, six selected-evidence
links, four reviewer decisions and one valid current, with zero publication-ready/publication rows.
Unknown Level A metadata still cannot confirm the quantity. This is never real factory evidence.

### Checks Actually Run

- **PASS:** 24 embedded suites / 1,384 pgTAP assertions, complete official public-schema type parity,
  HMAC, two exact 17-table imports and all existing rollback rehearsals.
- **PASS:** new sequential packaging workflow through actual parser/public wrappers and SQL guards:
  exact null/count/unit history, source scope/status/digest/role refusals, historical contradiction,
  EDIT/REJECT, explicit confirmation/resolution, stale second approval, receipt replay/revocation,
  independent actor/history ledger, exact non-interference and complete 17-table rollback.
- **PASS:** existing four-real-15AK-identity/one-synthetic-draft reference rehearsal still refuses
  actual confirmation and preserves all 43 packaging/commercial records without publication.
- **PASS:** 67 combined tests across ten server guards, eight invocation/target guards, four
  packaging/four OEM acceptance groups, packaging/OEM commands/reads and shared command/privacy/
  SQL-report contracts. Invalid staging/target switches are refused before host/provider access.
- **PASS:** TypeScript, zero-warning lint and a fresh synthetic-config production build with 95
  generated pages. No real key is included in the build environment.

Earlier build/test handles disappeared after continuation before their terminal output could be
retrieved. They were not counted as completed passes. Fresh type and complete SQL runs returned
exit zero; the current production-build handle also returned exit zero. A read-only CIM process
query was unavailable and is not Docker-health or runtime evidence.

### Remaining Gate And Authority

**Native packaging Auth/PostgREST/persistence/races NOT_RUN.** The new browser script has not been
executed against a real service. Its planned screenshot assertions are not new screenshot evidence.
No retained loopback Auth probe, Docker change, native migration, retained/hosted write or key/flag
activation occurs here. Existing no-provider limitations were not retested or worked around.

No public/canonical/company/media/commercial data, route, visual, SEO/RFQ or dependency changes;
no commit/push/merge/deploy or repository-rule override. The branch's deployment disable remains
intact. Native target safety and test preparation do not themselves grant external-write authority.

The new owner question covers review/commit/push of B11-B16, C1-C4 and D1-D4 to
`18803076512/arcfort-website` / `codex/v2-industrial-brand-system`, explicitly opting into disposable
OEM and packaging CI, with no merge/deployment/hosted/retained-local change. It replaces the unanswered
B11-B16 plus C1-C4 question; no answer is inferred. Next execute the separately authorized clean CI
gate and continue technical documents/real 15AK evidence, then verified preview/QA/authorized
publication. Full M4, the real pilot and all twelve V1 criteria remain incomplete.

## October 7 Authorized Combined CI Submission

The owner explicitly approved review, commit and push of B11-B16, C1-C4 and D1-D4 to
`18803076512/arcfort-website` / `codex/v2-industrial-brand-system`, including OEM and packaging
acceptance in the disposable CI job. The [dated authorization](../../knowledge-base/decisions/2026-10-07-console-m4-media-oem-packaging-ci.md)
supersedes pending-approval statements in the historical preparation checkpoints above.
No merge, deployment, hosted operation or retained-local mutation is included.

Read-only GitHub verification found PR #130 OPEN at `c190456df9609397859c2767bd13c3cf10d22068`.
Its September green run is not evidence for the pending batch. Review covered the new SQL grants,
role/adoption and immutable-review guards, byte inspection and signed observation, counted private
read models, default-off workbenches, invocation/target protection, exact retained-source checks
and synthetic-only native scenarios. No public/canonical/deployment file changed.

The existing database job now invokes `npm run console:working:test:local -- --oem --packaging`.
Guard tests parse the workflow and require this exact opt-in only in the database job, with normal
package commands and ambient feature flags unchanged. No dependency was added; the parser is the
existing locked ESLint YAML dependency. Fresh local checks pass all 29 foundation commands,
TypeScript, zero-warning ESLint, scoped formatting and the 669-file secret scan. The immediately
preceding D4 build passed 95 pages with unchanged application code; candidate native CI remains
pending at this submission checkpoint. This is not release or real-product approval.

The final local rerun also passed all 24 SQL suites / 1,384 assertions, public type/HMAC parity,
both exact 17-table imports and complete media/OEM/packaging rollback rehearsals. Built SEO,
internal links, all 43 legacy-image disclosures, snippets and unchanged performance budgets pass.

### First Combined Native Run

Candidate `186baca39a5296bcb72b04482e0b6c492bd5bca5` was committed and pushed to the exact authorized
branch. [Run 37568904066](https://github.com/18803076512/arcfort-website/actions/runs/37568904066)
passed the complete quality job and native migrations, SQL/report/type, source reconciliation and
Auth pagination steps. The combined browser step failed an assertion in stored-original inspection,
before media/OEM/packaging acceptance. It reported zero page errors and external requests, with two
successful original-upload responses. That partial result is not combined acceptance.

The next candidate adds static substep and allowlisted test-file/line diagnostics only. No raw
assertion values, provider response, cookies or credentials are printed, and no check is skipped or
weakened. Exact failing assertion and complete native acceptance remain to be established.

### Browser Binary Evidence Follow-Up

The diagnostic candidate `3e4488f5d82e5837bc14f4bc5e01b486b98be7dc` / [run 37569568378](https://github.com/18803076512/arcfort-website/actions/runs/37569568378)
again passed quality and native preparation, then identified the failure at the browser inspector's
`Response.body()` comparison (`test-original-working-browser.ts:242`). The preceding direct owner
and viewer HTTP checks passed exact MIME/length/security headers and byte equality, as did Storage
readback and browser status/privacy/cookie assertions. This does not yet identify the browser/API
difference's root cause or prove the subsequent download.

A standalone loopback-only generated-PNG diagnostic passed Edge's plain, continued and unchanged
pass-through responses, including browser-consumed bytes; it did not reproduce Linux CI's failure.
No provider or existing local service was used. The native harness now retains real inspection
responses through the same unchanged `route.fetch` / `route.fulfill({ response })` pattern already
used for commands. It compares those bytes and additionally compares the browser's actual rendered
Blob bytes; the original browser-download byte comparison remains required. Media review uses the
same two-ended byte checks. No fixture response replaces the provider, no application code changes,
and native acceptance remains pending until this exact candidate passes.

The follow-up CSP control found that `connect-src 'self'` rejects the added `fetch(blob:)` test.
CSP remains unchanged. Both original and media inspection now compare the browser's native download
of the displayed Blob, alongside retained real upstream bytes and actual image decoding. The
loopback control passed all three modes under the same CSP. In its pass-through case the browser
diagnostic `Response.body()` returned zero bytes while the 125-byte upstream, consumed Blob and
native download were identical. This directly demonstrates why browser diagnostic body retrieval
alone is not byte-retention evidence, although it does not establish every detail of Linux CI's
earlier mismatch. The intermediate `a4055b77` candidate is superseded by this CSP-compatible test.

### Native Media Navigation Follow-Up

Candidate `4e250c2d30437500c72e4783f0ee1e50cd155e18` / [run 37615695868](https://github.com/18803076512/arcfort-website/actions/runs/37615695868)
passed quality, native preparation and the original-browser phase. The media harness then rejected
the real unsaved-navigation `confirm` because its handler expected only `beforeunload`. The
application correctly retains the unsaved original selection when new evidence is recorded.

The harness now accepts only the exact discard message on the synthetic owner's page during its
explicit evidence reload. Other confirmations are dismissed and fail the sanitized acceptance
path; asynchronous handler errors are retained rather than thrown outside the main test. At least
two actual reload confirmations must be exercised. No runtime guard, human evidence decision or
database contract changes. Complete media/OEM/packaging native acceptance remains pending.

### October 8 OEM Refresh Diagnostic

Candidate `7fa5060e9552c84f105e01e93c9f088edaa9b732` / [run 37617278658](https://github.com/18803076512/arcfort-website/actions/runs/37617278658)
passed quality and reached OEM after the complete media phase. OEM source/proposal/submission and
refusal checks passed; its real reviewer approval returned success, but waiting for the refreshed
latest-proposal snapshot timed out. Packaging and final cross-module revocation/retention remain
unrun. This is not combined acceptance or proof of a runtime versus harness refresh defect.

The next diagnostic verifies the acting participant's persisted history before waiting for the
rendered state and reports only allowlisted review states/revisions and element counts on timeout.
No page content, evidence text, provider response or credentials are logged; no runtime change or
automatic reload is used to conceal a refresh defect.

### OEM And Packaging Navigation Repair

The diagnostic run [37697460689](https://github.com/18803076512/arcfort-website/actions/runs/37697460689)
at `b6214b1c` confirmed a real stale rendered snapshot: database and acting-participant history
were revision 1 `pending`, while the page remained revision 1 `proposed`. Quality passed; combined
acceptance did not. The failure occurred at submission in this run, not the previous approval step.

OEM and packaging now use fresh document requests after successful commands and record selection,
matching existing Console navigation. Error inputs, retry receipts and discard confirmations remain
intact; standalone source-entry refresh still preserves an unsaved copy. The
[dated navigation decision](../../knowledge-base/decisions/2026-10-08-console-oem-packaging-document-navigation.md)
supersedes the D4 refresh description only. Synthetic browser regressions explicitly require actual
document requests rather than just a changed URL; native state/history/race checks remain required.

Initial sandboxed local preview/browser launches failed due to dependency realpath and browser
process restrictions, not application assertions. Scoped escalated loopback-only fixture runs use
the existing dependencies without a database, account or new installation. TypeScript, focused lint
and 31 OEM/packaging command/read tests pass. Native acceptance still awaits the repaired candidate.

Fresh synthetic UI runs pass 15 OEM and 14 packaging groups across 360/390/768/1024/1280/1440 widths,
including actual document-navigation assertions, pixel/overflow checks, error retention and role
controls, with zero page errors or external requests. Reviewed OEM mobile and packaging desktop
screenshots retain readable stacked/two-column layouts. Formatting, whitespace and the 670-file
secret scan pass. These component fixtures do not replace native provider acceptance.

## October 8 Combined Native Acceptance

**Status: PASS_WITH_WARNINGS for the authorized isolated-CI submission only.** Exact candidate
`7403136272fa06c011e0c49a6af7904948279efa` passes both jobs in
[run 37698778273](https://github.com/18803076512/arcfort-website/actions/runs/37698778273).
The authorized destination remains `18803076512/arcfort-website`, branch
`codex/v2-industrial-brand-system`. Readback shows PR #130 OPEN at this candidate, targeting main,
with no merge. The branch's deployment-disable setting is unchanged.

### Applicable Gate Evidence

- **PASS, code/public regression:** the quality job includes all 29 Console foundation commands,
  secret/data/image/company evidence checks, source-generation parity, RFQ builders, SEO, lint,
  TypeScript, production build, built links/image/snippet audits and performance budgets. These
  protect the shared application while the batch changes only private Console workflows.
- **PASS, native schema and boundaries:** 24 pgTAP suites / 1,384 assertions; rollback-only SQL
  reporter negative controls; exact complete public types; embedded HMAC parity; repeatable exact
  17-table source reconciliation; real Auth/RLS and large-catalog pagination.
- **PASS, native browser and persistence:** 47 scenarios with real sessions/private cookies,
  Next forms, PostgREST and Storage. Includes compatibility, unchanged inspected/downloaded
  original bytes, signed media observations, explicit synthetic human review, exact receipt
  replay, actual observed lock contention, role revocation and logged-out denials. Both OEM and
  packaging opt-ins print their terminal native-pass messages only after independent final ledgers.
- **PASS, retained-source/publication boundaries:** exact original variant/technical/compatibility/
  media/OEM/packaging rows remain unchanged, including all 43 packaging/commercial rows. Both stored
  originals remain byte-exact. OEM retains 3 sources, 1 head, 5 revisions, 10 evidence links,
  4 decisions and 1 current; packaging retains 5 sources, 1 head, 5 revisions, 6 links, 4 decisions
  and 1 current. New publication eligibility and `publish_records` remain zero. Observer disable
  and revoked sessions preserve historically authorized decisions rather than deleting history.
- **PASS, component/responsive regression:** local synthetic OEM 15 groups and packaging 14 groups
  at six widths, with real document-request assertions, no overflow/page errors/external requests,
  and representative screenshot review. The native workflow also executes its six-width persisted
  views. Runner-local native screenshots are not represented as a durable downloaded artifact.

### Findings And Remaining Work

No blocking finding remains for this exact disposable-CI scope. Earlier failed/cancelled runs above
remain historical evidence, not passes. The identified stale-state defect is repaired in runtime;
the native test still waits for the true persisted state without an injected reload.

Warnings: all successful new approval declarations are TEST-ONLY synthetic records, not verified
15AK facts, real document review, image rights or product publication. Technical-document support,
real owner/source evidence and the complete verified preview/QA/authorized publishing flow remain
open. Owner/source reviewers must supply and confirm real technical, compatibility and media
evidence through their governed workflows; `technical-verification`, `compatibility-mapping`,
`product-media-manager` and then `product-publishing` remain the applicable handoffs. These are
blockers for future real-product publication, not waivers granted by this CI result.

Fresh Goal-report regeneration has no diff and still reports 43 structured products with zero
strict verified SKUs. Existing warnings remain: 43 legacy-reference image-rights gaps, two reused
image-content groups and three representative company visuals. Their evidence/publication states
are unchanged; this CI acceptance does not resolve or approve those records.

The host runner notes an upcoming Ubuntu image-label migration; no dependency/runner update is
included in this batch. CI and owned local synthetic preview processes have ended. No retained
local stack, Docker setting, hosted database, production environment, public data or SEO/RFQ path
was modified. No merge/deployment/live acceptance or repository-rule override is claimed.

Next controlled action: finish M4 technical-document intake/review and real 15AK evidence collection
before implementing and verifying the full frozen preview/release gates. Keep all twelve V1
criteria active; do not treat this submission milestone as V1 or M4 completion.

## October 8 Page-Error Revalidation

Documentation candidate `16b4c06e5f8d8a0f2f0dba1e22f06b7160716663` has no runtime diff from the
accepted candidate, but [run 37699781923](https://github.com/18803076512/arcfort-website/actions/runs/37699781923)
failed the final zero-page-error assertion: all 47 browser scenarios completed, with three page
errors and zero external requests. Quality and native SQL passed; final parent acceptance did not
complete. The earlier green run remains historical evidence, not a waiver for this intermittent
failure or a pass for that head. At that checkpoint, submission revalidation was BLOCKED by them.

The next diagnostic retains at most eight static phase/checkpoint names, allowlisted error types,
React numeric codes and static client-chunk locations. It logs no raw error message, page body,
URL query, source data, session or credentials. The zero-error assertion remains unchanged. Do not
rerun merely to obtain a green result; identify and resolve the evidenced failure first.

Instrumented candidate `fb22f8aab6b501f67896999f3eb274a77acc494d` passes quality and native
[run 37726932305](https://github.com/18803076512/arcfort-website/actions/runs/37726932305), attempts
1 and 2. The second attempt reran only the database job to capture the intermittent failure with
the new diagnostic. Both complete 47 scenarios, zero page errors/external requests, 24 SQL suites /
1,384 assertions and the terminal parent/media/OEM/packaging retention checks. Neither attempt
reproduced the error; no runtime fix or error suppression was added in this diagnostic candidate.

Current CI submission result is PASS_WITH_WARNINGS. The precise warning is an unreproduced earlier
three-page-error failure, with unknown cause. It is not marked resolved, not evidence of a clean
production release, and not justification to weaken the zero-error assertion. The Console
maintainer should inspect the now-bounded diagnostic on recurrence before any external release;
the owner has not authorized merge/deployment or acceptance of release warnings. Avoid indefinite
identical reruns merely to accumulate green results. All real 15AK evidence and V1 limits above remain.

## October 8 Hydration Recurrence

Candidate `90e18693625e4153c052156182bf3befe9c61791`,
[run 37728451960](https://github.com/18803076512/arcfort-website/actions/runs/37728451960),
passes quality but fails native browser closure after 47 scenarios. The bounded diagnostic records
React error 418 and a TypeError at `packaging private history and six persisted responsive views`;
external requests are zero. React's installed source identifies 418 as a hydration mismatch, but
this evidence alone does not identify the component or prove that packaging data caused it.

Current submission closure is **BLOCKED** until diagnosed and repaired. Instrument role, static
route category, viewport, the individual responsive/final-proposal checkpoints, hydration kind
and known stream-helper/null-parent signatures. Never log raw messages, private paths, form values,
account identifiers or complete stacks; keep the original zero-error assertion unchanged.
Synthetic production-mode UI checks without a database have not reproduced the fault. Investigate
streaming layout timing as a hypothesis, not a confirmed cause. All CI-only authorization and
real-product publication limits remain unchanged; no retained local stack is used for diagnosis.

## October 9 Cross-Page Hydration Diagnosis

At `83a5369783fef42c5a15391b9f45541b5f6d4a2e`,
[run 37769648625](https://github.com/18803076512/arcfort-website/actions/runs/37769648625), quality
and 47 scenario bodies complete, but final pageErrors=1 fails. The sanitized diagnostic identifies
`418`, `HTML`, owner, width 360 and the initial read-only/responsive phase. Its `other` route is the
product history route, the only section in that loop omitted from the previous allowlist; history
is now explicitly named. This occurs before OEM/packaging and rules out a packaging-only cause.

Inspect the existing pinned React build at its failing claim using a temporary CDP breakpoint.
Only fixed HTML tag categories, child/template counts and readyState may leave the browser, never
node text, attributes, React props, business values, credentials, full URLs or stacks. The breakpoint
does not change renderer code, skip errors or stop at ordinary successful rendering. A local
synthetic H1-to-H2 mismatch proves expected H1 / actual H2 are captured correctly and the real
pageerror still fires. Add 24 bounded read-only history document loads to capture the intermittent
case; this is a changed diagnostic experiment, not an identical rerun seeking green results.

The temporary synthetic asynchronous layout experiments remain uncommitted until useful as a
regression. Neither Edge nor pinned Chromium synthetic non-native probes reproduced the genuine
fault. Root cause remains unproven; investigate shared private layout/streaming before runtime edits.
