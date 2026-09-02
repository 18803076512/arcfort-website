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

Public signup is disabled. The first owner is not stored in `seed.sql`. Create an invite-only Auth
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
No staging reference, CLI authentication or local staging credentials are configured. The isolated
runtime gate is `PASS` for the exact tested candidate. Milestone 1 exit remains `BLOCKED` only on
the outstanding named/authorized hosted staging parity gate; Console Milestone 2 must not begin.

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
