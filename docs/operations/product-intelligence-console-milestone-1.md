# Product Intelligence Console V1 - Milestone 1 Operations

Status: Repository foundation at `6383171` passed static checks and isolated Linux CI database replay
on 2026-09-02, including all 74 pgTAP assertions and two exact-row shadow imports. A named, authorized
hosted staging replay remains required before Milestone 1 can exit. No Console UI or production
source-of-truth cutover is included.

## Authority Boundary

Milestone 1 is a shadow system. The canonical sources remain:

- `data/import/products.csv`
- `lib/data/product-series-evidence.ts`
- `data/evidence/product-series-component-facts.csv`
- `lib/data/product-technical-facts.ts`
- `lib/data/compatibility-relationships.ts`
- `data/assets/product-image-assets.csv`

The public website still reads the existing generated TypeScript adapters. It does not read the
Product Intelligence database. A database outage or incomplete import therefore cannot remove or
rewrite current product pages.

The older `supabase/product-catalog-schema.sql` prototype is retained as a fully commented historical
draft behind an exception guard. It must never be applied; only versioned files under
`supabase/migrations/` define the Product Intelligence schema.

## Current Reconciled Repository Baseline

The deterministic shadow projection records:

| Metric                              | Count |
| ----------------------------------- | ----: |
| Product records                     |    43 |
| Active legacy product records       |    40 |
| Draft legacy product records        |     3 |
| Products marked `needs_review`      |    43 |
| Categories                          |     6 |
| Series evidence records             |    10 |
| Component subjects                  |   213 |
| Variant/component candidates        |   189 |
| Series component facts              |   589 |
| `DATA_CONFLICT` component facts     |    14 |
| Exact-SKU technical facts           |    15 |
| Confirmed exact-SKU technical facts |     0 |
| Compatibility relationships         |     4 |
| Confirmed compatibility             |     0 |
| Governed media assets               |    46 |
| Search-eligible media assets        |     0 |

`generated/console/product-intelligence-shadow-v1.json` is generated, reviewable evidence. It is not
a public catalog release and contains internal source records, so it must never be served from
`public/`.

## Repository Validation

Run these commands after changing a canonical product, technical, compatibility, series or media
source:

```bash
npm run console:shadow:generate
npm run console:shadow:validate
npm run console:domain:test
npm run console:migrations:validate
```

The generator uses the canonical product CSV, not `lib/data/products.ts`. This detects generated-file
drift instead of copying it into the new database.

## Local Supabase Prerequisites

Use a Docker-compatible container runtime and the Supabase CLI. The local stack is development-only
and must not be exposed to the internet. CLI `2.116.0` is pinned in `devDependencies`.
Run `npm ci` first so CLI and formatter versions match the lockfile. The isolated Linux CI job uses
the same commands and provides candidate-specific runtime evidence when this Windows host cannot
start Docker; it is not a hosted staging environment.

```bash
npx supabase start
npx supabase db reset --local
npx supabase test db --local
npm run console:shadow:apply:local
```

`db reset --local` is destructive only to the local development database. Never add `--linked`
unless the owner has named a disposable non-production project and explicitly approved resetting
that destination.

After migrations and tests pass, generate the official database types from the running schema:

```bash
npm run console:db:types
npm run console:db:types:check
```

The check command regenerates and formats the type definition in memory, then fails if the committed
file differs from the migrated local schema. CI runs the same check against a clean database.

`lib/supabase/database.types.ts` was initially generated from the verified local schema on 2026-08-31.
Its formatting was aligned with locked Prettier `3.8.4`, and exact regeneration passed against all
five migrations on 2026-09-02. It is the complete schema snapshot for future data-access work. The narrower
`lib/supabase/product-intelligence.types.ts` remains the Milestone 1 shadow-import contract. Review
both when a migration changes; do not hand-edit the generated schema file.

## Hosted Non-Production Setup

### Owner Setup

1. Sign in to the [Supabase Dashboard](https://supabase.com/dashboard) and select your organization.
2. Create a new project dedicated to this workflow. Suggested name:
   `arcfort-product-intelligence-staging`. Do not reuse the website's existing database.
3. Keep the database password in a password manager. Do not send passwords, API secrets, access
   tokens or connection strings in chat, screenshots, Git or this runbook.
4. Use the Free plan if available for the organization and workload. Stop for owner approval if
   project quota or billing requires an upgrade; do not change an existing production plan.
5. Choose the region deliberately. Southeast Asia (Singapore) is a suggested staging location,
   subject to the owner's data-residency choice. See
   [available regions](https://supabase.com/docs/guides/platform/regions).
6. Once provisioned, copy only the project reference from the dashboard address
   `https://supabase.com/dashboard/project/<project-ref>`. The reference and Project URL are not
   passwords. Send the name, reference, owner, region and plan, plus confirmation that this is a
   dedicated non-production project and permission for the Milestone 1 migration/shadow import.
7. Leave the empty project intact. Do not paste tutorial SQL, manually create tables or connect it to
   Vercel/production. Configure CLI login and required private environment variables locally before
   the controlled dry-run below. Review the exact migration plan before applying it.

The [official project quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
documents project creation and the Connect panel. Only its project-creation guidance applies here;
this repository already contains its schema, application and guarded import workflow.

### Operator Handoff

Before any hosted write, record:

1. Supabase project name and project reference.
2. Account owner and billing plan.
3. Region and data-residency choice.
4. Confirmation that the project is staging/non-production and dedicated to Product Intelligence.
5. Migration preview and rollback owner.

Then link only that project and preview migrations:

```bash
npx supabase link --project-ref <staging-project-ref>
npx supabase db push --dry-run
```

Applying migrations with `npx supabase db push` is an external write and requires approval for the
exact project after the dry-run has been reviewed.

### Current Staging Authorization - 2026-09-03

The owner explicitly replaced the prior destination and confirmed the following scope on
2026-09-03. This is the only current hosted write authorization for this task. See the
[replacement decision](../../knowledge-base/decisions/2026-09-03-product-intelligence-staging-replacement.md).

| Field             | Current Value                                                                        | Evidence                                                              |
| ----------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Project name      | `arcfort-product-intelligence-staging`                                               | Owner supplied; authenticated CLI lookup verified                     |
| Project reference | `fdsvzuqixppsakukkrsf`                                                               | Owner authorized; authenticated CLI lookup verified                   |
| Direct API URL    | `https://fdsvzuqixppsakukkrsf.supabase.co`                                           | Derived from the authenticated project reference; REST replay pending |
| Organization      | `xycjhlnlacqocitjkagq`                                                               | Authenticated project metadata                                        |
| Region            | Singapore (`ap-southeast-1`)                                                         | Authenticated CLI lookup verified                                     |
| Plan              | Free                                                                                 | Owner reported; authenticated verification pending                    |
| Recovery owner    | Project owner, confirmed in this task on 2026-09-03                                  | Owner confirmed project management and recovery responsibility        |
| Authorized writes | Reviewed Milestone 1 migrations and shadow import only                               | Owner confirmation on 2026-09-03                                      |
| Exclusions        | No existing-data deletion, production connection, public publication or paid upgrade | Explicit scoped confirmation                                          |

The old `bdaucwemujiunpyptkpq` project is no longer an authorized target for this work. Do not
migrate/import into it, delete it or silently fall back to it. Its earlier record below is history.

The initial CLI check returned "Access token not provided". Local token login subsequently succeeded
on 2026-09-03. Independent authenticated CLI lookups verified the exact project reference/name,
Singapore (`ap-southeast-1`), organization ID and provider-reported status `ACTIVE_HEALTHY`.
The owner then explicitly confirmed managing this staging project and responsibility for recovery.
Authenticated structural inspection and migration dry-run passed, as recorded below. No migrations,
database test suite or shadow import have been applied to this replacement project by this workflow.

The table above retains the owner-supplied authorization evidence. The later authenticated checks
confirm name, reference, region and organization ID, not the reported billing plan or the owner's
account role. The CLI organization-list response was empty; this does not establish a plan or
contradict the owner's management confirmation. The in-app Dashboard session requires sign-in.
Non-sensitive Dashboard evidence of the project and Free plan has been requested before hosted
writes. `ACTIVE_HEALTHY` is provider metadata, not a substitute for schema, RLS or parity tests.

A subsequent target-only Management API check independently revalidated the project's name/ref and
organization, then received HTTP 403 from `GET /v1/organizations/xycjhlnlacqocitjkagq`. No credential
was printed or persisted by that check. The official
[organization endpoint](https://supabase.com/docs/reference/api/v1-get-an-organization) exposes the
plan and requires organization-read permissions. Do not widen token permissions, infer Free from an
empty list, retry with another account or change billing to pass this gate; retain the Dashboard
evidence request.

The ignored `.env.product-intelligence.local` now targets the replacement URL/reference, retains an
empty project server key and keeps `PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE=false`. No CLI project
link exists. Do not copy an old project key into the new configuration. CLI account authentication
and the project server key used by the shadow importer are separate credentials.

### Hosted Preflight And Preview - 2026-09-03

The authenticated inspection targeted only `fdsvzuqixppsakukkrsf` and returned:

| Check                                                | Observed Result                                 |
| ---------------------------------------------------- | ----------------------------------------------- |
| Database / server                                    | `postgres` / PostgreSQL `17.6`                  |
| Existing public tables, views and materialized views | None                                            |
| Existing public functions                            | None                                            |
| `supabase_migrations.schema_migrations`              | Absent                                          |
| Auth users                                           | 0                                               |
| Storage buckets                                      | 0                                               |
| Static migration validation                          | PASS: 5 migrations, 28 governed tables          |
| Domain, destination and REST transport tests         | PASS                                            |
| Deterministic shadow validation                      | PASS: 43 products; all evidence states retained |

Read-only SQL used `db query --linked --project-ref fdsvzuqixppsakukkrsf --output json`.
The explicit reference selects the authorized project without creating a persistent project link.
CLI preflight reports `Initialising login role` and may create provider-managed connection/cache
state; this is not a business-table migration and must not be described as zero provider side effects.

The exact preview command completed with exit code zero:

```bash
npx supabase db push --linked --project-ref fdsvzuqixppsakukkrsf --dry-run --skip-vault
```

It returned `dryRun: true`, `upToDate: false`, no seeds, no custom roles and exactly these files:

1. `202608300001_product_intelligence_foundation.sql`
2. `202608300002_product_intelligence_security.sql`
3. `202608300003_product_intelligence_readiness.sql`
4. `202608300004_product_intelligence_private_storage.sql`
5. `202608310005_product_intelligence_workflow_guards.sql`

The reviewed candidate creates the governed schema, RLS/workflow guards, readiness views and two
private buckets. The final migration replaces only policies from earlier migrations in this set.
It does not delete business rows. `--skip-vault` prevents unrelated Vault secret synchronization;
do not add `--include-all`, `--include-roles`, `--include-seed` or any reset operation.

At this preflight, the migration/importer/contracts/snapshot diff against tested commit `21c877a1`
was empty. A later SQL-QA tooling batch below adds a shared target-config reader and test runner;
it requires its own CI validation. The migrations and deterministic source snapshot are unchanged.
The current
shadow revision is `f185ebc9ebba875bc59141b872780297804fef894866108fa14d65bf995fc41b` and its file
SHA-256 is `4D98BC4678F6C75FAF03D03BD569CAB3B1170276333C1F4C794456F1201909F7`.

A rollback-only probe with two SELECT statements proved that hosted `db query` returns only the last
result set. Do not run a pgTAP file through this command and infer all assertions passed from exit
code zero or an empty final `finish()` result. Use a runner that retains the full TAP assertion
count and failures. The installed CLI advertises `test db --linked --project-ref`; actual hosted
execution and all 74 passing assertions still need to be verified after the migration.

The owner is the recovery contact. Stop on any unexpected state and preserve evidence. Do not reset,
recreate or delete the hosted database without separate authorization. Before applying, finish plan
verification and repeat the target/empty-schema/preview checks if the project or candidate has changed.
After applying, require real hosted tests, generated-type parity and two exact-row shadow imports;
none is proven by this preview.

### SQL Report Runner Preparation - 2026-09-03

The installed CLI's `test db --linked` still launches a Docker pg_prove container. Its source also
shows that local `db query` uses the extended PostgreSQL protocol, which rejects a multi-statement
test file. Do not replace a complete test harness with either a bare SQL exit code or an untested
local/hosted transport assumption.

The repository now contains:

- `scripts/console/database-test-report.ts`: prepares only the reviewed BEGIN/plan/finish/ROLLBACK
  envelope and validates suite identity, normalized source SHA-256, exact plan/execution counts,
  failure count, finish diagnostics and pgTAP version. Existing assertions and fixtures are unchanged.
- `scripts/console/run-database-sql-tests.ts`: requires an explicit local or guarded staging target,
  validates every source first, runs positive/negative/count-mismatch self-checks, then all five suites.
  A transport error is not accepted as a successful negative control. Provider error bodies are not
  printed. Every normal result is collected before the test's final ROLLBACK.
- `scripts/console/test-database-test-report.ts`: tests malformed/empty/partial/failed reports,
  source mismatches, unsafe envelopes, skipped/TODO tests, all five source bodies / 74 planned
  assertions and CLI rejection of disabled, ambiguous, production or mismatched destinations.

Commands:

```bash
npm run console:sql-qa:test
# Requires this project's existing isolated local Supabase stack:
npm run console:db:test:sql
# Only after destination/plan/authorization review and successful migrations:
npm run console:db:test:staging
```

Local SQL QA uses `psql` inside `supabase_db_arcfort-product-intelligence`, after matching its label
and the repository project ID. The existing CI pg_prove step remains intact; the additional SQL step
tests the same assertion/counter contract against real PostgreSQL. Staging SQL QA uses explicit-ref
Management API requests and requires the existing target/write guards, but no project server key.
The importer still separately requires its server key. No new dependency is added.

This is not a sandbox for third-party SQL: only reviewed repository tests may be executed. File
hashes bind results to the tested content, not to owner approval. A passing QA report does not promote
product verification, authorize publication, or prove migration/import parity by itself.

Unit/configuration checks pass. The local Docker health recheck failed because
`dockerDesktopLinuxEngine` was absent; no reset/restart was performed. The new PostgreSQL SQL-runner
path and hosted transport have not yet run. Owner approval was requested to commit/push this tooling
to the existing PR #130 branch for isolated CI; no push, merge, production deployment or staging write
was performed in this preparation batch.

On 2026-09-03 the owner subsequently authorized committing and pushing the prepared tooling to
PR #130 (`codex/v2-industrial-brand-system`) to run isolated database tests. The PR was verified open,
targeting `main`, with no auto-merge request. Only the existing quality workflow's disposable local
Supabase stack may be used in this batch; no hosted credentials, staging mutation, merge or production
deployment are authorized by this follow-up. Candidate-specific CI results must be recorded before
claiming the new SQL report path passes real PostgreSQL tests.

### Isolated SQL Runner CI Evidence - 2026-09-03

The authorized PR #130 push produced candidate `202c189f1f062fa20fff8219aca3a0aba66f1c79` and
[Quality checks run 33714502709](https://github.com/18803076512/arcfort-website/actions/runs/33714502709).
Both jobs completed successfully. The database job ran from `04:17:30Z` to `04:19:46Z`; the website
quality job completed at `04:18:41Z`. These results are from disposable Linux CI containers, not the
hosted staging project or the Windows Docker host.

| Gate                   | Direct Evidence                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Fresh migration replay | All five reviewed migrations applied during reset                                     |
| Original pg_prove      | `Files=5, Tests=74`, `Result: PASS`                                                   |
| SQL runner self-checks | Passing assertion, intentional failure and plan mismatch correctly detected           |
| SQL lifecycle          | 12/12, zero failures                                                                  |
| SQL RLS                | 10/10, zero failures                                                                  |
| SQL schema             | 25/25, zero failures                                                                  |
| SQL service job        | 5/5, zero failures                                                                    |
| SQL workflow guards    | 22/22, zero failures                                                                  |
| SQL total              | 5 files, 74 assertions, pgTAP `1.3.3`; suite source hashes retained in the job log    |
| Generated types        | Match the migrated local schema                                                       |
| Shadow parity          | Two successful imports; 17 tables per import, 34 exact-row/source-column checks       |
| Source snapshot        | Revision `f185ebc9ebba875bc59141b872780297804fef894866108fa14d65bf995fc41b` unchanged |
| Website quality        | Build, lint, typecheck, data/media/SEO/RFQ tests, built audits and performance passed |
| Cleanup                | Disposable local Supabase services stopped successfully                               |

Before this push, local report/config/REST/domain/migration/shadow checks, full lint, typecheck,
formatting, diff hygiene and secret scanning passed. `npm run build` generated 90 pages. No new
dependency, SQL migration, canonical product/media value, public route or RFQ implementation changed.

Release QA for this tooling-only PR/isolated-CI scope is PASS. That result is not authorization to
merge, publish or deploy. The hosted Free-plan evidence, project server-key configuration, real
Management API test transport, generated-type parity and two hosted imports remain outstanding.
The local staging write guard is unchanged and disabled. Record any follow-up documentation-only
commit separately from this tested implementation candidate; never claim these logs tested a later
runtime change.

### Windows Local Token Login Fallback

The previous console reported a non-interactive error. A later corrected console produced a login
link, but browser visibility and CLI authentication were not established. Do not keep reopening the
same unsuccessful flow or change PowerShell execution policy to work around it.

For this workstation, the ignored `.tmp/supabase-token-login.cmd` offers a local masked-input
fallback:

1. Manually open [Supabase Account Access Tokens](https://supabase.com/dashboard/account/tokens) in
   the owner's browser and create a token for this setup with the shortest practical expiry.
2. Double-click `.tmp/supabase-token-login.cmd` in the repository's File Explorer folder, or run
   `& '.\.tmp\supabase-token-login.cmd'` from PowerShell in the repository root.
3. Paste the personal access token into the masked local prompt and press Enter. Never put it in
   chat, a screenshot, a shell command argument, a repository file or a support log.
4. The helper invokes the native CLI using a temporary process environment variable, then checks
   only the exact authorized project's reference and name. It clears the variable on exit and
   performs no migration, import, deletion or production operation.
5. Report only success or a non-sensitive failure. The helper suppresses provider output on errors
   so a credential is not accidentally echoed. The operator must independently verify CLI access,
   project metadata, schema and the migration preview before the next write.

The helper does not store the token in its source or in the staging env file. The CLI manages its
own account credential storage: native credential storage when available, with a possible plaintext
`~/.supabase/access-token` fallback. Treat either as private local credentials. See
[the official CLI login documentation](https://supabase.com/docs/reference/cli/supabase-login).
Do not confuse a personal access token with the project's publishable/anon or secret/service-role
API key. Revoke the setup token when it is no longer needed.

The first helper displayed a false failure after successful authentication. A read-only Windows
PowerShell reproduction confirmed `ErrorActionPreference=Stop` converted the CLI's non-fatal
missing-project-link stderr into `NativeCommandError`. The local helper now captures each native
exit code, restores strict error handling before parsing/validation, checks target identity and
reports only a non-sensitive failure stage. A fresh target lookup passed under Windows PowerShell.
Do not paste the token again once authenticated access is independently confirmed. Do not link a
database merely to suppress this warning; linking belongs to the next reviewed staging operation.

### Historical Staging Handoff - 2026-09-02 (Superseded)

This section preserves the earlier investigation; use the 2026-09-03 record above for current actions.

The owner supplied and explicitly approved this exact non-production destination:

| Field             | Value                                                                                | Evidence                                                               |
| ----------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Project name      | `arcfort-product-intelligence-staging`                                               | Owner supplied                                                         |
| Project reference | `bdaucwemujiunpyptkpq`                                                               | Owner supplied and explicitly authorized                               |
| Direct API URL    | `https://bdaucwemujiunpyptkpq.supabase.co`                                           | Derived from the supplied reference; unauthenticated endpoint responds |
| Region            | Singapore                                                                            | Owner reported; authenticated metadata check pending                   |
| Plan              | Free                                                                                 | Owner reported; authenticated billing check pending                    |
| Authorized writes | Milestone 1 migrations and shadow import only                                        | Owner confirmation on 2026-09-02                                       |
| Exclusions        | No existing-data deletion, production connection, public publication or paid upgrade | Scoped request and confirmation                                        |

At the initial connection check, `GET /auth/v1/health` returned HTTP 401 without credentials. This
proves endpoint reachability only, not project ownership, authenticated database health or parity.
`supabase projects list --output json` reported that no access token was configured. The operator
requested local CLI login; the owner must complete any browser consent and verification-code entry
in the local terminal, never in chat. A browser Dashboard login alone does not authenticate the CLI.

The owner's Windows screenshot subsequently showed that PowerShell's execution policy blocked the
temporary `.ps1` login helper. No policy or trusted-publisher setting was changed. On this verified
Windows x64 installation, use the native CLI directly from the repository root:

```powershell
& '.\node_modules\@supabase\cli-windows-x64\bin\supabase.exe' login
```

The local helper was replaced with `.tmp/supabase-login.cmd`, which invokes the same executable in a
visible Command Prompt and keeps errors on screen. These local helpers are not deployed or committed.
Complete browser consent and enter any verification code in that terminal only; never send a code,
access token or API key in chat. This recovery step does not establish that login has succeeded.

Local `.env.product-intelligence.local` is ignored by the existing `.env*.local` rule and contains
the exact non-secret destination, `staging` environment, an empty server key and a disabled write
guard. It is not a deployed Vercel configuration and is not automatically loaded by the importer.
Use an explicit local environment-file loader or process environment after reviewing its values.
Do not print populated credentials in command output or include them in a report.

Next, authenticate and verify the exact project, its organization/owner, region, plan and existing
database objects. Review the dry-run before applying the approved migrations. If unexpected objects,
existing data or a different project are found, stop; do not reset, force a migration or delete rows.
Retain failed-import audit evidence and keep repository sources canonical. Confirm a rollback owner
before any hosted write that requires recovery work. Hosted dry-run, migrations, pgTAP and shadow
parity are not yet proven by this handoff record.

## Controlled Shadow Import

The hosted import command refuses production mode and requires an explicit write guard. Set values
in the shell or deployment secret store; never commit them. Local development should use
`npm run console:shadow:apply:local`, which reads only ephemeral credentials from the running local
CLI stack.

Required variables:

- `PRODUCT_INTELLIGENCE_SUPABASE_URL`
- `PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY`
- `PRODUCT_INTELLIGENCE_ENVIRONMENT=local` or `staging`
- `PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE=true`
- `PRODUCT_INTELLIGENCE_STAGING_PROJECT_REF=<exact-authorized-project-ref>` for hosted staging

The existing `PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY` variable accepts either a modern
`sb_secret_...` key or a legacy service-role JWT. Modern opaque keys are sent through `apikey` only;
they are not JWT Bearer tokens. Legacy keys retain both headers for local-stack compatibility. Never
use a publishable/anon key for this administrative import or expose the server key to a browser.
This follows the [Supabase API-key guidance](https://supabase.com/docs/guides/getting-started/api-keys).

`local` is deliberately restricted to an HTTP loopback URL (`127.0.0.1`, `localhost` or IPv6
loopback). Any hosted project must use `staging`, HTTPS and the exact authorized project reference;
changing only the environment label cannot bypass the destination guard.

For staging, the importer requires the direct HTTPS Supabase project URL and verifies that its
hostname exactly matches the separately supplied project reference. This deliberate double entry
prevents a mislabeled environment variable from redirecting a reviewed import to another project.

After reviewing the generated snapshot and confirming the exact destination:

```bash
npm run console:shadow:apply
```

The importer performs idempotent upserts, creates one import batch, preserves every source state and
calls `pi_reconcile_shadow_batch`. It does not delete destination rows and it cannot move shadow
variants beyond `NEEDS_VERIFICATION`. A count mismatch marks the batch `FAILED` and blocks the next
milestone.

## RLS And Role Bootstrap

Local configuration disables public signup; hosted Auth configuration has not yet been verified or
changed. Do not infer a hosted setting from `supabase/config.toml`. Verify invite-only operation
before enabling Console access. The first owner is not stored in `seed.sql`. Create an invite-only Auth
user in the named non-production project, then assign `owner` with a controlled service-role action.
Do not expose the service-role key to a browser or `NEXT_PUBLIC_*` variable.

Database policies provide:

- No anonymous access to Product Intelligence tables or private buckets.
- Viewer read-only access.
- Editor identity/import preparation access.
- Reviewer governed evidence access and append-only review events.
- Publisher release preparation access without final factual confirmation power.
- Owner role management and final publication authority.

Milestone 2 must also enforce authorization in the server-side data access layer. RLS does not make a
hidden navigation item a security boundary.

## Rollback

- Stop a failed import and retain its batch/audit evidence.
- Fix the canonical source or migration in a new version; do not rewrite an applied migration.
- Recreate a local or disposable staging database from migrations and replay the deterministic
  snapshot.
- Keep the public website on its existing static adapter.
- Do not cut over 15AK authority until a later explicit parity decision.

## Milestone 1 Exit Evidence

Milestone 1 is complete only when all of the following are available:

- Static migration and domain validation pass.
- `supabase db reset --local` succeeds.
- All pgTAP schema, lifecycle and RLS tests pass.
- CLI-generated database types are reviewed and committed.
- The deterministic snapshot reconciles in a named hosted non-production project.
- No current identifier, source status, conflict or verification state changes during import.
- No public route, metadata, sitemap, RFQ behavior or source-of-truth boundary changes.

## Current Validation State - 2026-09-02

The foundation, six added workflow assertions and readiness, SEO-approval, REST and destination
guards are committed in PR #130. Exact tested commit:
`6383171365fa1ae14904025789cf52ae9718c815`.
[GitHub Actions run 33591108612](https://github.com/18803076512/arcfort-website/actions/runs/33591108612)
completed both `quality` and `product-intelligence-database` successfully. Direct database logs prove:

- Clean Linux `npm ci`, isolated Supabase startup and `supabase db reset --local` succeeded.
- All five migrations applied; five pgTAP files executed 74 assertions with `Result: PASS`.
- CLI-generated database types exactly matched the committed file.
- Two consecutive imports reconciled both counts and every source-controlled field across all 17
  imported tables. Both used revision
  `f185ebc9ebba875bc59141b872780297804fef894866108fa14d65bf995fc41b`.
- Counts remained 43 products, 43 variants, 604 technical values, 617 technical-evidence links,
  46 media records and 43 SEO records. No source status, conflict or verification was promoted.
- CI shut down the isolated stack with `supabase stop --no-backup`.

The quality job passed domain/configuration/REST/migration/shadow validation, source and generated
data checks, secret scanning, product/media/company/series/compatibility/technical gates, RFQ tests,
SEO, lint, typecheck, production build and built-page link/image/snippet/performance audits.

Two reproducibility failures were resolved before this passing run. The first clean install exposed
missing cross-platform optional `@emnapi` dependencies in the lockfile. The lock was repaired from
the committed baseline with npm `10.9.3`, preserving unrelated versions. A later run passed all 74
tests but found type-file formatting drift: the previous installed Prettier was `3.9.6`, while the
lock pins `3.8.4`. A real `npm ci` and locked reformat fixed only generated helper layout, not schema
semantics. See `knowledge-base/technical/console-validation-reproducibility.md`.

The separately approved Windows Docker Desktop upgrade from `4.88.1` to `4.89.0` installed from the
official checksum-verified installer, but did not restore this host's runtime. Logs still report
that Windows cannot access/rename `sailor-ingest.sock` to its stale path. No factory reset, WSL
removal, Windows feature change or reboot was performed. Earlier quarantined socket directories
were retained, not deleted blindly. The passing Linux job does not resolve this Windows problem.

The PR remains unmerged. Vercel produced a successful automatic branch preview after the authorized
push; no production deployment, hosted Supabase migration or public data-source switch was made.
The owner subsequently supplied and authorized a staging destination, as recorded in the hosted
handoff section above; authentication and hosted parity must still be proven separately. The isolated
runtime gate is `PASS` for the exact tested candidate. Milestone 1 exit remains `BLOCKED` on the
outstanding hosted staging parity gate; Console Milestone 2 must not begin.

## Validation Record - 2026-08-31

The local runtime proof used Supabase CLI `2.116.0`, Docker Desktop `4.88.1`, Docker Engine `29.7.2`
and WSL `2.7.12.0`. `supabase db reset --local` recreated the database, applied all five migrations,
loaded `supabase/seed.sql` and restarted the isolated containers successfully.

Five pgTAP files executed against PostgreSQL and all 68 tests passed. Coverage includes schema,
lifecycle transitions, forced RLS, immutable events, evidence confirmation gates, release QA,
current PostgREST JSON JWT claims, service-job reconciliation and idempotent-upsert permissions.

The deterministic shadow snapshot at revision
`f185ebc9ebba875bc59141b872780297804fef894866108fa14d65bf995fc41b` reconciled twice in succession.
Each run compared every source-controlled field across all 17 imported tables, not only aggregate
counts. It preserved 43 products, 604 technical values, 617 technical-evidence links, 43 SEO records,
46 media records, all 14 data conflicts and zero confirmed facts/compatibility/media promotions.
The second run proves the importer is idempotent for the current baseline.

A negative runtime test inserted one synthetic local-only SEO row. Aggregate count reconciliation
still completed, but exact-row parity rejected the unexpected identifier, exited non-zero and marked
the import batch `FAILED`. The database was then reset from migrations; all 68 pgTAP tests passed and
two clean exact-parity imports passed again. Official database types were generated into
`lib/supabase/database.types.ts` from that verified schema, and the automated drift check passes.

The superseded `supabase/product-catalog-schema.sql` draft was also executed as a negative test. It
failed closed with its deprecation guard and created no legacy product table, leaving the versioned
Product Intelligence migrations as the only supported installation path.

Catalog-domain, migration, shadow, secret, ESLint and TypeScript checks pass. The Next.js production
build also passes with 90 generated pages. No public route, SEO record, RFQ behavior, canonical
source or production service changed.

On this Windows 11 build, Docker Desktop's optional AI/secrets socket services encountered an
upstream AF_UNIX reparse-point failure. The host-level workaround disabled Docker AI/inference and
retained renamed socket directories for later cleanup; it did not change repository or database
security. The same socket class later prevented a fresh 2026-09-02 runtime start, as recorded above.

No hosted non-production project was named or authorized, so no remote migration or data write was
attempted. The 2026-08-31 candidate's local-runtime gate was `PASS`; that result does not cover later
migration amendments. The later 2026-09-02 replay and remaining hosted staging gate are recorded in
the current validation section above. Historical runtime results must not be reused for an untested
candidate.
