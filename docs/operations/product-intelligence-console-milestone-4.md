# M4 Compatibility, Media And Supporting Records

Date: 2026-09-24
Scope: local implementation toward the approved Console V1 architecture. M4 is not complete.

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
