# Product Intelligence Console V1 - Milestone 1 Operations

Status: Repository foundation is statically verified. The earlier 68-test migration baseline passed
locally, but the current 74-assertion guard amendments still require a fresh database replay. A named
hosted staging replay also remains required before Milestone 1 can exit.

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

`lib/supabase/database.types.ts` was generated from the verified local schema on 2026-08-31 and is
the complete schema snapshot for future data-access work. The narrower
`lib/supabase/product-intelligence.types.ts` remains the Milestone 1 shadow-import contract. Review
both when a migration changes; do not hand-edit the generated schema file.

## Hosted Non-Production Setup

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

The current working batch adds six workflow assertions and strengthens readiness, SEO approval,
shadow-import failure handling, REST mutation filters and destination guards. Static migration,
domain, configuration, REST, shadow, secret, product, media, SEO, lint, typecheck and production-build
checks pass. The deterministic 43-product snapshot also generated twice with the same revision and
SHA-256 digest.

Docker Desktop `4.88.1` currently exits before the local engine starts because Windows cannot access
new AF_UNIX socket files under the Docker runtime and secrets-engine directories. Quarantining the
stale directories and disabling optional AI/inference settings did not produce a stable runtime. No
Docker update, factory reset, Windows feature change or reboot was performed automatically.

Therefore `supabase db reset --local`, the 74 current pgTAP assertions, generated database-type drift
validation and two exact-row database imports have not been rerun for these amendments. The
2026-08-31 record below remains valid historical evidence for its exact earlier candidate; it must
not be presented as proof of the current working tree.

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
migration amendments. The current Milestone 1 `$release-qa` verdict remains `BLOCKED` on a fresh
local database replay, reviewed commit and hosted staging parity. Milestone 2 must not begin before
those gates pass for the same candidate.
