# Console M3 Implementation Evidence

Reviewed: 2026-09-18
Scope: local development and isolated testing only.
Plan: [M3 editing and review](product-intelligence-console-milestone-3-plan.md).
Decision: [M3 working authority](../../knowledge-base/decisions/2026-09-09-console-m3-working-authority.md).

## Progress

| Batch                               | State                                          | Remaining gate                       |
| ----------------------------------- | ---------------------------------------------- | ------------------------------------ |
| M3-A through M3-E authorization     | Approved                                       | Hosted actions are still separate    |
| M3.1a authority/import barrier      | Real SQL, Auth and lock tests pass in clean CI | Separate hosted approval required   |
| M3.1b atomic product draft commands | Real API and browser persistence pass in CI   | Local-only pilot boundary           |
| M3.1c source-bound technical review | Real SQL/API/browser decisions pass in CI     | Real Level A evidence still missing |
| M3.2 product creation/editing       | Browser create/retry/stale/reload pass in CI   | Hosted execution unperformed        |
| M3.3 technical review/history       | Browser EDIT/APPROVE/REJECT/history pass in CI | No real-product confirmation        |
| M3.4 full acceptance                | PASS_WITH_WARNINGS, local/disposable CI       | Full V1 and publication incomplete  |

No hosted migration or adoption was performed. Existing staging Console remains read-only. No
real product, source, company record, hosted account/role/provider or publication status was changed.
Local synthetic accounts, roles, a test adoption and three drafts now exist; see the latest checkpoint.

## Authority Barrier

`supabase/migrations/202609090006_product_intelligence_working_authority.sql` creates two forced-RLS
private tables, private operational helpers and guards on 26 catalog/import/release tables. It does
not enable editing or change the five already-applied migrations. Existing public column and RPC
contracts are unchanged; no generated public Supabase type was manually modified.

The authority state is off by default. A separately invoked adoption must:

1. Authenticate the current owner and lock the authority and role rows.
2. Reject unfinished imports and mismatched batch counts/source hashes.
3. Compare the exact reviewed projection of all seventeen source tables. Missing columns, extra
   rows or altered values fail instead of being skipped.
4. Check the four exact pilot identities and all fifteen original references. Reject prior
   non-shadow/review/publication state requiring a broader adoption decision.
5. Retain complete source rows, the import batch, source-file hashes, repository commit, owner,
   reason, date and SHA-256 digest in an append-only ledger.
6. Atomically freeze legacy replay and all direct catalog/release writes. Do not reset lifecycles,
   flip `is_shadow`, confirm technical facts or make a public product.

The command remains in the non-exposed `private` schema with no client/service EXECUTE grant. Do
not construct a browser call or use a service key to invoke it. It is intentionally an operational
gate, separate from the future owner/editor/reviewer application commands. An external migration
preview and adoption authorization are still required before staging execution.

## Product Draft Commands

Migration `202609090007` adds private draft heads, typed copy revisions, append-only command receipts
and a transaction-scoped internal write capability. Owner/editor create and save commands check
current roles, working scope, allowlisted fields, complete-catalog identity uniqueness and expected
revision. Duplicate actor/command/request IDs return the original result; changed payloads or stale
revisions fail. Receipt replay still requires current permission. New records start in DRAFT;
adopted records retain their ID/SKU/slug/category/lifecycle and original raw snapshot.

Draft copy lives in typed revision columns, not `raw_snapshot`. Revision zero retains the original
source copy for adopted products. Saving updates only working names/model and appends the new copy
revision. The capability is private, bound to backend/transaction/actor and removed before return;
service clients cannot forge it with headers or a session variable. All function failures roll back
the product/variant, revision, receipt, audit and capability together. No delete, publication,
verification or media action is allowed by these commands. Migration 9 adds gated caller-session
application wrappers, described below; hosted schema still has only the original five migrations.

## Technical Review Commands

Migration `202609090008` adds three read-only-to-client, forced-RLS relational tables: technical
revision heads, revision history and source bindings. Original technical/evidence rows are not
rewritten or deleted. A head retains the current value while proposed/pending replacements are
separate rows. Rejected and superseded rows remain inspectable but are excluded from effective
readiness. The original public relation columns and public RPC signatures remain unchanged.

Private commands append source references, propose values, submit exact digests and apply explicit
APPROVE/EDIT/REJECT decisions. They use the existing authority lock, current role lock, transaction
capability, payload-bound receipts and safe SQLSTATE errors. Source references require an exact SKU,
field, profile/connection side, asserted value/unit, document revision/location, custodian and date.
Level A still needs a qualifying evidence basis; a generic `exact_subject` boolean cannot qualify.
Supplied source details are operator input, not an automatic factual endorsement.

Submission hashes the complete candidate plus evidence rows, links and exact-subject bindings.
Approval requires this unchanged revision, qualifying exact-item Level A evidence matching value
and unit, and an exact APPROVE event. Actor/time are server derived. EDIT produces a new unconfirmed
proposal, never approval. Conflicts cannot be overwritten by ordinary saves or cleared by EDIT;
approval of a conflict requires explicit human resolution. A failed replacement/evidence/decision
leaves no partial event, state transition, confirmation or command receipt.

`pi_effective_technical_values` and updated readiness/dashboard/lifecycle SQL exclude historical
approvals from current counts, retain pending conflicts as blockers, and require every known
critical-field scope before VERIFIED. These functions never advance lifecycle themselves. Existing
application technical reads use this projection only when local working mode is enabled. Disabled
and hosted read-only modes retain the original tables and never query the absent working views.

See the [technical revision decision](../../knowledge-base/decisions/2026-09-09-console-m3-technical-revisions.md).

## Local SQL Tests

The optional nested runtime is isolated from website dependencies. Install from its own directory:

```bash
cd scripts/console/sql-runtime
npm ci --ignore-scripts
cd ../../..
npm run console:authority:test:embedded
```

The runner creates a fresh in-memory PostgreSQL WASM instance, applies all nine migrations and runs
the unmodified pgTAP SQL suites through the repository report adapter. It closes the instance in
`finally`. It loads no `.env` file and has no external database URL, email service or listener.

September 11 embedded checks (the later real and embedded suites contain 246 assertions):

- 240/240 SQL assertions: the original 74, 20 authority, 32 draft-command, 90 technical-review and
  24 public command/read-projection checks.
- Passing, intentionally failing and assertion-count-mismatch runner controls.
- Two sequential real-source imports with complete field parity in all seventeen tables.
- Rejection without partial adoption for altered references, omitted fields/tables, wrong revision,
  unfinished import, changed source-file hashes, non-owner roles, revoked owner and service claims.
- One immutable adoption/audit record; repeated adoption, baseline deletion and authority reversal
  rejected.
- Service-role replay rejected before the import-batch write, and direct updates/empty deletes on
  every source table rejected. TRUNCATE is rejected too.
- Full retained rows and baseline hash match; public product IDs, technical values, imagery and
  publication count are unchanged.
- Owner/editor draft save, stale saves, receipt replay, changed-payload rejection, revoked-role
  rejection, duplicate create and rollback after a duplicate-slug failure all pass.
- Missing, secondary, unbound, wrong-SKU, wrong-field, wrong-side/profile/value/unit and stale source
  evidence cannot confirm a value. Invalid EDIT rolls back its event and revision together. Exact
  approval, EDIT, reject, receipt/revocation, conflict carry-forward, historical/current selection,
  source time-zone stability and read-only RLS checks pass using synthetic values only.
- After two unchanged real-source imports and adoption checks, all fifteen real 15AK reference
  fields can create separate unconfirmed candidates under their exact original roots. Complete
  original rows remain unchanged, distinct scopes survive, and no human verification event is added.
- The official Supabase `@supabase/postgrest-typegen` engine introspects the embedded database.
  With locked formatting and TypeScript AST comparison, its complete `Database.public` member
  matches the committed artifact. The generator regenerated that member for the new public tables
  and effective view; no hand-edited schema types or invented query metadata are used.
  `graphql_public` and actual CLI/container generation are not covered by this scoped comparison.

To regenerate the public member after an intentional schema change, run
`node --experimental-strip-types scripts/console/sql-runtime/test-authority.mjs --write-public-types`.
This uses the official engine, replaces only the parsed `Database.public` member and preserves
GraphQL/helper/constant declarations. It rejects enum changes, which require full CLI generation.
Always rerun without the write flag; full isolated CLI drift checking remains mandatory.

This is **not** a Supabase Auth/PostgREST or multi-connection test. Synthetic `auth.uid()` and storage
schema fixtures cannot establish authentication security, provider behavior or hosted readiness.
At the September 11 checkpoint Windows had no usable Docker CLI/runtime; the later checkpoints
below record recovery and actual local-service results. Do not substitute the hosted project to
obtain a green test. The normal isolated CI still runs real reset/pgTAP/type/parity/Auth gates, and the
embedded supplement is added without removing them. No new CI run was dispatched in this batch.

## Local Application And UI

Migration `202609090009` exposes six authenticated-only SQL wrappers and four minimal read RPCs.
Every wrapper rechecks the existing private role/adoption/revision contract. Direct private EXECUTE,
direct table mutation, service impersonation and adoption through the browser remain unavailable.
The read projection exposes typed copy, revision, working scope and paginated history, never full
raw snapshots or private audit payloads. Migration application does not adopt data or grant a role.

`POST /console/commands` is default-off. `CONSOLE_WORKING_ENABLED=true` additionally requires exact
local origin `http://127.0.0.1:3000`, local Supabase `http://127.0.0.1:54321`, invite-only provider,
verified caller identity and current roles. Existing configuration rejects Vercel, hosted/tunnel
working mode and service credentials. The handler uses caller cookies, not a service key. It accepts
only bounded UTF-8 JSON (128 KiB), an allowlisted typed command and the custom request header.
An opaque `Origin: null` is accepted only with exact Host and browser-owned same-origin/cors/empty
metadata. Native-form rules are unchanged. Responses are private/no-store/noindex, expose only
command-specific UUID/revision/digest fields and fixed error messages, and apply refreshed cookies.

The product list/detail link to new-product, copy, exact-scope review and 25-row history views.
Forms preserve input on failure, reuse request identity for an unchanged retry, block duplicate
submits and warn before discarding unsaved values. Stale errors offer a separate comparison tab.
Source save disables scope/value/actions while pending. Technical views compare original/current/
saved proposal, retain distinct sides/profiles, show source versions/locations/values and separate
Save, Submit, APPROVE, EDIT and REJECT. EDIT cannot become APPROVE. Viewer controls remain read-only;
no lifecycle, compatibility, media rights, public slug editing or publication controls were added.
History preserves rejected/superseded values, sources and human attribution. Private originals and
upload/signing remain M4, not a claimed feature of this source-reference form.

`lucide-react@1.43.0` is the only new root runtime dependency, for recognizable action icons. Icons
are confined to Console components; public performance budgets were not increased. The
[official React guide](https://lucide.dev/guide/react) documents individual icon imports.

## Browser Evidence And Limits

The standalone `scripts/console/ui-fixture` reuses real components/CSS with conspicuous synthetic
data labels. It has no Auth session, database client or write implementation. The Playwright runner
intercepts commands for UI scenarios; its separate real HTTP probe checks only browser-origin
metadata. It cannot prove database persistence, RLS, concurrency or owner acceptance.
The Edge probe observed an explicit same-origin Origin header under no-referrer; the opaque-origin
branch is covered by unit cases, not claimed as an observed browser behavior.

Evidence is retained in `.tmp/console-ui/results.json` and thirteen screenshots: new/review at
360, 390, 768, 1024, 1280 and 1440px, plus expanded source intake at 390px. Ten browser scenarios
cover create retry, stale-input retention, comparison/unsaved warnings, exact submit digest, all
three review decisions, source-save interlocks, viewer controls and responsive layouts. No page
overflow or page errors were observed. Visual inspection found and corrected invisible selected
checkboxes caused by the generic input background; native appearance now preserves checked state.
Stable accessible textarea/select labels were added after the browser checks exposed changing names.
See the [fixture guide](../../scripts/console/ui-fixture/README.md) for reproduction.

## Release Boundary

September 11 acceptance-tool update: the [real-service runner](console-m3-isolated-acceptance.md)
is now prepared with seven target/baseline guard test groups and a separate fresh M3 CI baseline
after M2. It includes observed transaction contention and caller-session persistence assertions.
The local attempt exited nonzero at preflight; no real-service or database-backed browser pass is
claimed. See that runbook for the exact environment limitation and remaining acceptance scope.

The subsequent browser-extension batch wires ten real form/HTTP/persistence scenarios into the same
isolated runner. Four server guard groups and a real production Next/Edge unavailable-provider smoke
pass, including private response headers and owned-process shutdown. This is rejection-path evidence;
the database-backed browser scenarios had not passed at that September 11 checkpoint.

### September 13 Earlier Checkpoint

Following the owner-controlled restart, Virtual Machine Platform and the existing Docker engine
are operational. Four M3 migrations were applied only locally; an older local SEO policy was aligned
with existing migration 005. Two exact seventeen-table imports and complete CLI type parity passed.
All nine SQL suites now pass **246 assertions** in an ACL-preserving real PostgreSQL QA database.
Six added pre-adoption viewer assertions failed before the role-guard fix and pass afterward;
embedded regression/type/source-lineage checks also pass. The early role check preserves the locked
second check and original lock order. No published migration source was rewritten.

Real Auth/adoption tests progressed to duplicate creation and exposed a direct-only lock observer.
The corrected observer follows actual blocking chains without relaxing waiter counts or timeouts.
A targeted existing-SKU probe now observes both blocked callers and both expected duplicate errors.
The full runner had not completed. At that checkpoint, local state retained 45 variants (43 original plus two
synthetic drafts), five synthetic users, four roles, one test adoption and zero verification events.
The proposed data-preserving fresh local database switch was rejected by automatic safety review;
it has not executed and needs specific owner approval. Do not delete the adoption or replay imports.

The [acceptance runbook](console-m3-isolated-acceptance.md#september-13-post-restart-checkpoint)
owns exact recovery actions, preserved directories/databases, test scope and the then-pending approval.
Current typecheck, focused lint, target/browser/command/boundary guards and migration/report checks
pass. No full browser, clean-CI or hosted pass is inferred from these partial results.
Later September 13 revalidation found the Docker engine stopped; a bounded startup reproduced the
same IPC rename failure. The owned failed startup was stopped, no new directory/database change
was made, and the pending original pg_prove check did not execute. Exact switch approval is still
absent. The runbook records the current blocker separately from the earlier successful recovery.

### September 14 First Preservation Checkpoint

The owner subsequently approved the exact local database preservation operation. Old `postgres`
was retained intact as `arcfort_m3_failed_20260913`; a new empty `postgres` was created from the
reviewed QA template with matching platform settings/ACLs. That approval is fulfilled, not pending.
Original pg_prove and the SQL-report runner each passed all 9 suites / 246 assertions, complete CLI
type parity passed, and two exact 17-table imports reconciled before adoption.

The new full runner completed real Auth/PostgREST and observed multi-connection API checks, including
adoption/import blocking, duplicate creation, stale saves, source-bound EDIT/APPROVE/REJECT, history
and editor revocation. Browser production build and real form logins passed, but browser acceptance
failed. Two actual test-transport defects were diagnosed: Playwright string JSON serialization and
response-body eviction after document navigation. Raw-byte requests and unchanged real upstream
response retention now pass targeted HTTP and existing-create-receipt diagnostics. No application
security rule or expected result was weakened; no success response was fabricated.

At this first-preservation checkpoint, local data retained 46 variants, five synthetic users, four roles, one adoption, three
draft heads, three synthetic verification events and zero publish records. All 43 original variants
and 604 facts exactly match the immutable adoption baseline; the separate old archive's hashes and
7,287 audit records remain intact. Local synthetic login passwords were renewed in memory only.

This was a **BLOCKED M3 release**, not a completed Console V1. Full repaired browser flows,
responsive evidence and fresh integrated/clean-CI acceptance are still missing. The next proposed
local archive is `arcfort_m3_failed_20260914`; that different operation needs specific approval and
has not executed. Do not reset either adopted database or replay old imports over its working data.
The [latest runbook](console-m3-isolated-acceptance.md#september-13-14-authorized-preservation-and-browser-diagnostics)
owns exact evidence and remaining gates. Current full typecheck, focused lint, command/target/browser
guards, boundaries, migration validation and SQL-report contracts pass. No remote CI was dispatched.
Recurring Docker IPC startup failures remain an environment risk. The workbench still fails closed
above 200 scopes/source bindings per SKU; large-scale operating throughput is not proven.

### September 14 Latest Checkpoint

The [second exact authorization](../../knowledge-base/decisions/2026-09-14-console-m3-local-baseline-rerun.md)
was received and fulfilled. `arcfort_m3_failed_20260913` and `arcfort_m3_failed_20260914` retain their
independently verified counts/hashes; a fresh `postgres` retained equivalent platform settings/ACLs.
On that baseline both SQL paths passed 9 suites / 246 assertions, full CLI type parity and two
exact 17-table imports passed, and the real API phase passed again.

The fresh browser run passed nine groups: login/private cookies; HTTP rejection; creation/retry/
reload; two-tab stale-input/history; missing-source rejection; source-bound EDIT; explicit APPROVE;
REJECT/history retention; and read-only/missing-image/responsive checks. Twelve synthetic-only
screenshots cover edit/review/history at 360, 390, 768 and 1440px with no horizontal overflow.
Representative visual inspection found readable, non-overlapping forms and history.

The full runner still exited nonzero in the last session/logout group. A retained-fixture diagnostic
reproduced an immediate-URL assertion before the App Router streamed redirect completed. The test
now waits for login navigation and records granular final-group checkpoints; application code,
permission rules and expected rejection statuses are unchanged. The targeted before/after check
passed revoked-role HTTP 403, logout 303, zero cookies, absent editor controls and logged-out HTTP 403. This does not convert the failed integrated run into a pass.

Current local data retains 46 variants, five synthetic users, four roles (editor/reviewer revoked),
one adoption, three draft heads, six synthetic verification events and zero publish records.
All 43 original variants and 604 facts exactly match the immutable baseline; both archives and
the empty QA template remain intact. All 36 selected regression scripts, full typecheck and full
lint pass, including M1/M2 contracts, SQL-report/migration guards, RFQ, SEO and performance budgets.
The existing production build was recreated by the real browser diagnostics. A fresh M2 isolated
Auth/pagination run and current clean CI have not been run on this adopted fixture.

**Release status: BLOCKED.** A fresh complete repaired M3 run is still needed. Another exact local
preservation switch is not covered by either fulfilled approval; no adopted database may be reset.
See the [latest runbook](console-m3-isolated-acceptance.md#september-14-second-preservation-result)
for the precise proposed next operation, evidence and missing gates. No hosted or public change
was made. Real 15AK source/media gaps and later milestones remain separate.

September 11 local checks: 240 embedded assertions and official public-type parity; command/draft/domain/
boundary/entrance/config/REST/report tests; migration/shadow validation; typecheck/lint and build
(93 generated entries, including non-public handlers). The final September 11 build, typecheck,
lint, command tests, ten browser scenarios, RFQ, SEO content/links/images/snippets, performance budget
and 510-file secret scan passed. Homepage JavaScript is 126.6 KiB against the unchanged 140 KiB budget;
shared CSS is 9.8 KiB against 15 KiB. All real source counts remain unchanged.

The original Level A 15AK facts, exact-product images and compatibility evidence are still missing
for the real pilot. Public routes, canonicals, sitemap, SEO and RFQ sources remain unchanged. No
commit/push, hosted migration/adoption, hosted account/provider change, deployment or publication occurred.
Disable the mutation flag for read-only operation; retain drafts, receipts and the adoption ledger.
Never replay the old import over adopted working data as a rollback.

### September 17 Current Acceptance Update

The third owner-approved preservation completed with all three archives, the empty template and
original ACL/settings retained. Fresh SQL paths each passed 246 assertions; generated types and
two exact 17-table imports passed. The new persisted browser report passes all ten scenarios and
twelve responsive screenshots, including final revocation/logout, with zero errors/external requests.
Original 43 variants / 604 facts and all archives were independently verified after a further
Windows reboot and ordinary Docker startup. No application or test expectations changed in this batch.

The full test process's terminal handle was lost across the reboot, so its overall exit code is
unavailable. Final data assertions were independently repeated, not skipped. Current clean CI and
durable integrated completion evidence are still missing; **M3 release remains BLOCKED**, while
the local browser/data-retention gates now pass. No fourth database switch, hosted change, CI push
or publication is authorized. See the
[dated runbook](console-m3-isolated-acceptance.md#september-17-third-preservation-and-fresh-browser-acceptance).

## September 18 Candidate CI Gate

Candidate `e5c23e31f9b34c7e10801c444167ecb3501da670` passed both jobs in
[run 35284287968](https://github.com/18803076512/arcfort-website/actions/runs/35284287968). This includes
all 246 assertions through both SQL paths, full type/import parity, fresh M2 Auth/pagination, all ten
M3 browser scenarios and complete runner/source-retention/cleanup success. The approved local/CI M3
gate is **PASS_WITH_WARNINGS**; historical failed checkpoints above remain historical, not open gates.
See the [current acceptance](console-m3-isolated-acceptance.md#september-18-clean-ci-acceptance)
for candidate identity, deployment refusal/readback and explicit pilot limits. Hosted adoption,
real technical confirmation, full V1 and public publication remain separate and incomplete.
