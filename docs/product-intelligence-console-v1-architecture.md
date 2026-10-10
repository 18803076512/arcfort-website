# ArcFort Weld Product Intelligence Console V1 Architecture

Status: **Approved - Milestone 1 authorized on 2026-08-30**
Repository baseline reviewed: **2026-08-30**
Pilot scope: **15AK MIG/MAG product family**

This proposal completed the architecture-first action for the ArcFort Weld Product Intelligence and
Business Operating System goal. The owner approved decisions D0-D7 on 2026-08-30. The implementation
record is `knowledge-base/decisions/2026-08-30-product-intelligence-console-v1-foundation.md`.

## Executive Recommendation

Build Product Intelligence Console V1 as a protected module in the existing Next.js repository,
backed by a dedicated Supabase Postgres, Auth and private Storage project. Keep the public website
statically generated from a versioned, approved release snapshot rather than reading mutable draft
records directly from the database.

Use a staged authority transition:

1. The repository CSV and governed TypeScript registries remain canonical during shadow migration.
2. Supabase receives read-only migration copies and supports the 15AK review workflow without
   changing public pages.
3. The owner verifies data parity, permissions, audit history and the publish gate.
4. Only after an explicit cutover decision does Supabase become canonical for the approved pilot
   scope.
5. Public Next.js pages continue to consume a generated, immutable release projection with stable
   URLs and a rollback path.

This is the smallest architecture that adds real approval, audit, relational compatibility and
media governance without turning Phase 1 into an ERP or making website availability depend on a
live internal database query.

## Goal-Mode Alignment

The current `docs/CODEX_GOAL.md` says the immediate bottleneck is verified company and 15AK evidence,
and that a Supabase or Sanity product backend is not yet the next bottleneck. The newer Product
Intelligence objective selects Console V1 as the current system phase.

These positions are compatible: the console governs the same 15AK evidence rather than bypassing it.
The owner approved Console V1 as the next implementation phase on 2026-08-30, while preserving the
evidence-first priority and repository source-of-truth boundary during shadow migration. The dated
decision is `knowledge-base/decisions/2026-08-30-product-intelligence-console-v1-foundation.md`.

## Current Repository Audit

### Framework And Routing

| Area             | Current state                                                                                          | Consequence for V1                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Framework        | Next.js `15.5.22`, React 19, TypeScript and Tailwind CSS                                               | Reuse the App Router and existing build system.                               |
| Routing          | App Router pages for products, categories, held series, applications, guides, commercial pages and RFQ | Add a separate protected `/console` route group without changing public URLs. |
| Public rendering | Product and category content is projected into statically generated routes                             | Preserve static public output and SEO stability.                              |
| APIs             | Two RFQ route-handler families exist                                                                   | Do not mix RFQ/CRM scope into Console V1.                                     |
| Commands         | Build, lint, typecheck and extensive product/media/SEO/RFQ validators already exist                    | Reuse them as downstream release gates.                                       |

### Product And Content Architecture

The current product flow is:

```text
data/import/products.csv
  -> scripts/validate-products.ts
  -> scripts/import-products.ts
  -> lib/data/products.ts
  -> content/products.ts
  -> lib/content/products.ts
  -> static product/category pages
```

Current structured sources are fragmented by responsibility:

| Responsibility               | Current canonical or governed source                |
| ---------------------------- | --------------------------------------------------- |
| Product working records      | `data/import/products.csv`                          |
| Generated product projection | `lib/data/products.ts`                              |
| Public product adapter       | `content/products.ts` and `lib/content/products.ts` |
| Technical facts              | `lib/data/product-technical-facts.ts`               |
| Compatibility                | `lib/data/compatibility-relationships.ts`           |
| Product media evidence       | `data/assets/product-image-assets.csv`              |
| Unassigned media             | `data/evidence/local-product-image-triage.csv`      |
| Series evidence              | `lib/data/product-series-evidence.ts`               |
| Series components            | `data/evidence/product-series-component-facts.csv`  |
| Factory review intake        | `data/intake/*.csv`                                 |
| SEO projection               | `lib/content/seo.ts` and `lib/content/jsonld.ts`    |

Editorial categories, guides, applications and company content are TypeScript content modules. No
Sanity CMS or other editorial CMS is connected. Console V1 should not migrate these unrelated page
families.

### Verified Data Baseline

The current authoritative reports and source files show:

| Metric                                     | Current state |
| ------------------------------------------ | ------------: |
| Product records                            |            43 |
| Active public records                      |            40 |
| Draft records                              |             3 |
| Products with `confirmed` data status      |             0 |
| Products still marked `needs_review`       |            43 |
| Governed exact field-level technical facts |            15 |
| Confirmed technical facts                  |             0 |
| Governed compatibility relationships       |             4 |
| Confirmed compatibility relationships      |             0 |
| Product image asset records                |            46 |
| Rights-approved exact-product assets       |             0 |
| Search-eligible product assets             |             0 |
| Series evidence records                    |            10 |
| Governed public series pages               |             0 |
| Series component facts                     |           589 |
| Series component candidates                |           189 |
| Confirmed series component facts           |             0 |
| Held data conflicts                        |            14 |

The main bottleneck is verified evidence and controlled approval, not product-page rendering.

### Media

- `public/images/products/` contains 119 files.
- `data/assets/product-image-assets.csv` contains 46 canonical asset records.
- Existing active-product images are retained as `legacy_reference`; none is both exact-product and
  rights-approved.
- The current scripts already detect missing files, duplicates, weak resolution, rights gaps and
  unassigned files.
- There is no authenticated upload, review or owner-approval UI.

### Database And CMS

- `supabase/product-catalog-schema.sql` is a deprecated, fail-closed historical draft and is not the
  active product source.
- That draft stores specifications and compatibility primarily as JSONB and lacks field-level
  evidence, variants, approval events, audit history, release candidates and the required lifecycle.
- Supabase is currently used only as an optional RFQ storage path when environment variables exist.
- Production evidence records RFQ email as the active delivery channel and Supabase RFQ storage as
  not configured.
- There is no product-database client or product repository abstraction in runtime code.

The existing product-catalog SQL must not be applied as the Console V1 schema. It can be retained as
historical planning input until an approved migration replaces it.

### Authentication And Administration

- No `/admin` or `/console` route exists.
- No authentication library, session middleware/proxy, user profile table or role model exists.
- No public signup should be introduced for an internal industrial product system.
- No owner approval, edit/reject action, audit event or release sign-off UI exists.

### Deployment And Operations

- GitHub Actions runs product, media, series, compatibility, technical, RFQ, SEO, security,
  performance, lint, typecheck and build checks.
- Vercel serves the public Next.js site; production deployment evidence is recorded separately.
- The repository does not contain the full external Vercel project configuration or deployment
  permissions, so local code cannot prove those settings.
- Scheduled GitHub Actions perform read-only production health checks.

## What Should Be Reused

1. **Existing Next.js application:** keep one repository and reuse the App Router, TypeScript,
   Tailwind and current CI.
2. **Public presentation layer:** preserve product/category templates, product cards, SEO builders,
   sitemap, robots, redirects, structured data and RFQ context.
3. **Stable identifiers:** preserve current SKU, category slug and product slug values.
4. **Evidence registries:** import the existing technical, compatibility, image and series records
   with their current statuses and source references intact.
5. **Validators and reports:** use current scripts as parity fixtures while database-native checks
   are introduced.
6. **Workflow skills:** map ingestion, verification, compatibility, media, SEO, publishing and QA
   actions to the repository skills in `docs/SKILLS_INDEX.md`.
7. **Git-backed release evidence:** keep reviewed release projections and schema migrations in
   version control.
8. **Airtable intake boundary:** Airtable may remain a non-authoritative contributor surface until
   the Console review experience demonstrably replaces it.

## What Should Be Refactored

1. Replace the flat proposed Supabase catalog schema with migration-managed relational tables.
2. Separate product family identity from sellable SKU variants.
3. Move exact technical values out of product-wide JSON or prose into field-level versioned records.
4. Keep compatibility as relationships, not a text array inside a product.
5. Unify source, evidence, review and lifecycle terminology across product, series and media data.
6. Make `lib/data/products.ts` a generated public projection after cutover, not an independently
   edited source.
7. Replace text-only `verifiedBy` fields with authenticated reviewer identities and append-only
   verification events.
8. Prevent the CSV preparation layer from silently assigning a fallback category or publishable
   identity to ambiguous input. Generated values must remain labeled staging suggestions.
9. Add explicit release candidates and QA records instead of allowing a product status edit to make
   a page public.
10. Replace one-off SQL files with versioned `supabase/migrations/` plus policy tests and generated
    TypeScript database types.

## Proposed System Topology

```text
Factory files / CSV / Excel / PDF / measurements / image intake
                              |
                              v
                  Import batch and staging rows
                              |
                   validation + duplicate checks
                              |
                              v
        Product / variant / series / component candidate records
             |                |                  |
             v                v                  v
      Technical values   Compatibility      Media + documents
             \                |                  /
              \               |                 /
               +-------- Evidence sources ------+
                              |
                    Human approve/edit/reject
                              |
                       Readiness projection
                              |
                    Authenticated page preview
                              |
                   SEO + release candidate
                              |
                        Release QA gate
                              |
                       Owner approval
                              |
                Immutable public release snapshot
                              |
                    Existing website adapters
                              |
                    Next.js build and deploy
```

The console reads and writes governed records. The public website reads only the current approved
release snapshot. Draft edits can therefore never appear publicly because of a cache miss, database
query bug or partially completed review.

## Application Architecture

### One Repository, Two Experiences

Keep the current public site and add an authenticated route group:

```text
app/
  (public)/                 # optional future route organization; no URL change
  (console)/
    console/
      dashboard/
      products/
      series/
      technical-data/
      compatibility/
      media/
      technical-library/
      verification/
      website/
      seo/
      qa/
      system/
```

Do not move existing public routes merely to introduce route groups. Route groups do not need to be
part of the first implementation batch.

Console routes must be dynamic, authenticated, `noindex`, excluded from sitemap and isolated from
public caching. Public routes remain static wherever practical.

### Layer Boundaries

```text
Console UI
  -> Server Actions / Route Handlers
  -> Application services
  -> Server-only data access layer and DTOs
  -> Supabase client scoped to authenticated user/RLS
  -> Postgres + private Storage
```

Suggested code ownership:

```text
lib/domain/catalog/        # lifecycle, evidence and readiness rules
lib/console/actions/       # small authenticated commands
lib/console/queries/       # read models and dashboard projections
lib/console/dto/           # minimum fields returned to UI
lib/supabase/client.ts     # browser session client when interaction requires it
lib/supabase/server.ts     # cookie-aware server client
lib/supabase/admin.ts      # server-only service client for controlled jobs only
lib/publishing/            # snapshot generation and release comparison
supabase/migrations/       # versioned schema, functions, grants and RLS
supabase/tests/            # allow/deny and lifecycle database tests
generated/catalog/         # approved public release projection
```

Authorization must be enforced in the data access layer and in Postgres RLS. Hiding a navigation
item or protecting only the top-level console layout is not sufficient.

## Proposed V1 Data Model

Use relational rows for identity, technical values, evidence and relationships. Use JSONB only for
immutable source snapshots, bounded display configuration or audit payloads where relational
queries are not required.

### Catalog Identity

| Table                | Purpose                                         | Important controls                              |
| -------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `product_categories` | Stable product-system taxonomy                  | Unique slug; no casual route changes            |
| `product_series`     | Series/family identity and evidence state       | Publication held independently from products    |
| `products`           | Product-family/master identity                  | No exact SKU claim required at this level       |
| `product_variants`   | Sellable SKU/model/variant                      | Unique SKU and route slug; lifecycle lives here |
| `series_components`  | Catalog component candidates before SKU mapping | Candidate is not automatically a product        |

During migration, every current SKU may map to one product and one variant. Family consolidation can
occur later only when it preserves routes and evidence.

### Technical, OEM, Packaging And Compatibility

| Table                         | Purpose                                                      | Important controls                                              |
| ----------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `technical_field_definitions` | Controlled field keys, labels, value types and units         | Prevent arbitrary duplicate field names                         |
| `technical_values`            | Versioned values scoped to variant or component              | Value, unit, source level and verification status stay together |
| `oem_references`              | Governed OEM/reference numbers                               | Never confirmed from marketplace evidence alone                 |
| `packaging_records`           | Package method, quantity and commercial notes                | Product-specific quantities require evidence                    |
| `compatibility_entities`      | Torch, machine, series, product and OEM reference identities | Stable entity keys                                              |
| `compatibility_relationships` | Directed relationship with role and confidence               | Separate confirmed, reference and needs-confirmation states     |

When sources disagree, retain separate candidate values and create a `DATA_CONFLICT`; never
overwrite one reference with another.

### Evidence And Human Review

| Table                      | Purpose                                                    | Important controls                                    |
| -------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| `evidence_sources`         | Document, drawing, measurement, sample or catalog identity | Source level, owner, exact reference and date         |
| `technical_value_evidence` | Links one value to one or more sources                     | Preserves conflicting and supporting evidence         |
| `compatibility_evidence`   | Links one relationship to supporting sources               | Appearance cannot be evidence for confirmed fit       |
| `verification_events`      | Append-only approve/edit/reject decisions                  | Authenticated reviewer, time, before/after and reason |
| `import_batches`           | One source ingestion session                               | File hash, source, creator, counts and status         |
| `import_rows`              | Raw normalized candidate rows                              | Never public; errors and warnings retained            |

`CONFIRMED` requires qualifying Level A evidence and an authenticated human approval. Codex may
prepare a proposal but cannot create that approval event.

### Media And Documents

| Table                 | Purpose                                                   | Important controls                                           |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `media_assets`        | Original file identity, hash, source, owner and rights    | Originals remain private by default                          |
| `product_media`       | SKU/variant assignment, role, order and match status      | Exact-product match and publication eligibility are separate |
| `technical_documents` | Catalogs, drawings, manuals and evidence files            | Public/private state and source ownership                    |
| `entity_documents`    | Links a document to product, variant, series or component | Scope must be explicit                                       |

Media roles should support `MAIN`, `FRONT`, `45_DEGREE`, `THREAD_DETAIL`, `HOLE_DETAIL`,
`SURFACE_DETAIL`, `DIMENSION`, `PACKAGE`, `BULK` and `APPLICATION`. File processing may crop,
normalize background and export derivatives but must not alter geometry, markings, threads, holes,
dimensions or connections.

### SEO, Release And Audit

| Table                | Purpose                                                         | Important controls                                   |
| -------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| `seo_records`        | Entity, locale, intent, title, description and canonical target | One canonical intent owner; no unapproved URL change |
| `release_candidates` | Frozen proposed publication scope                               | Exact source revision and creator                    |
| `release_items`      | Variant/series/page snapshot included in a release              | Missing critical data blocks item                    |
| `release_qa_results` | Immutable gate result and check evidence                        | Only `PASS` or accepted warnings may proceed         |
| `publish_records`    | Destination, commit/deployment and live verification            | Does not claim success without external evidence     |
| `audit_events`       | Append-only material data and permission changes                | Actor, action, entity, before/after and timestamp    |

The database should expose read-only readiness views for the dashboard instead of storing manually
maintained counters.

## Product Lifecycle

Apply the lifecycle to each sellable variant/SKU:

```text
DRAFT
  -> INGESTED
  -> DATA_INCOMPLETE
  -> NEEDS_VERIFICATION
  -> VERIFIED
  -> READY_FOR_PUBLISH
  -> QA_PASSED
  -> PUBLISHED
  -> NEEDS_UPDATE
```

Rules:

- Import creates `INGESTED`, never `VERIFIED`.
- Missing critical identity or source fields produce `DATA_INCOMPLETE`.
- Unapproved technical, compatibility or media facts produce `NEEDS_VERIFICATION`.
- `VERIFIED` requires all configured critical gates for the product type.
- `READY_FOR_PUBLISH` is derived from data, media, SEO and route readiness.
- Only a release QA record can produce `QA_PASSED`.
- Only an approved publish record can produce `PUBLISHED`.
- A changed confirmed fact, withdrawn image right or detected conflict moves the item to
  `NEEDS_UPDATE` without deleting its last approved public snapshot.
- State transitions must be validated by application services and database constraints/functions;
  they must not be arbitrary dropdown edits.

## Human Approval Model

Every uncertain value should provide these actions:

- **Approve:** permitted only when the exact evidence gate is satisfied; records reviewer and date.
- **Edit:** creates a new proposed revision and preserves the original source value.
- **Reject:** closes the proposal with a reason; it does not delete source evidence.

Recommended V1 roles:

| Role        | Scope                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| `owner`     | User management, policy, final confirmation, warning acceptance and publication approval |
| `editor`    | Ingestion, draft identity/content and missing-data preparation                           |
| `reviewer`  | Evidence review, technical/compatibility/media decisions within assigned scope           |
| `publisher` | Release candidate preparation after verification; no factual confirmation power          |
| `viewer`    | Read-only dashboard and record access                                                    |

V1 may start with one owner account holding all roles, but the database should not assume all future
users have owner permissions. Disable public signup and use owner-created invitations only.

## Console Information Architecture

| Area              | V1 responsibility                                                          |
| ----------------- | -------------------------------------------------------------------------- |
| Dashboard         | Readiness counts, blockers, conflicts, missing evidence and next actions   |
| Products          | Product/variant identity, lifecycle, category, series and completeness     |
| Series            | Family evidence, component candidates and SKU mapping                      |
| Technical Data    | Field-level values, units, sources, statuses and conflicts                 |
| Compatibility     | Relationship editor with confirmed/reference/needs-confirmation separation |
| OEM References    | Reference values and evidence without automatic fit claims                 |
| Packaging         | Product-specific packaging evidence and unresolved commercial details      |
| Media             | Upload, hash, rights, match, role, missing-view and duplicate review       |
| Technical Library | Catalogs, drawings, measurements and document-to-entity links              |
| Verification      | Unified approve/edit/reject queue with evidence side by side               |
| Website           | Authenticated product preview from a frozen candidate snapshot             |
| SEO               | Intent, canonical target, metadata and internal-link review                |
| QA                | Release gate results, blocking checks and warnings                         |
| System            | Users, roles, import/export state and non-secret environment readiness     |

The console should be a dense operational tool. It should reuse brand colors and typography but not
copy the public marketing-page composition.

## Authentication And Data Security

Approved implementation direction:

- Supabase Auth with invite-only users and cookie-based server sessions.
- A server-only data access layer that verifies the user and returns minimal DTOs.
- RLS and explicit grants on every exposed table; no anonymous catalog-management access.
- Service-role access only for controlled server jobs such as reviewed import/export, never browser
  components.
- Private Storage for original product images, evidence documents and drawings.
- Time-limited signed URLs for authorized review of private files.
- No ISR or public caching on authenticated console routes.
- No buyer RFQ PII in the product console, audit reports or analytics.

Supabase documents cookie-based SSR clients for Next.js, while Next.js recommends centralizing
authorization in a data access layer. Supabase also requires RLS/grant review on exposed tables and
supports private buckets whose downloads require an authenticated request or signed URL. These
controls must be tested, not assumed.

Primary implementation references:

- [Next.js authentication and authorization](https://nextjs.org/docs/app/guides/authentication)
- [Next.js data security](https://nextjs.org/docs/app/guides/data-security)
- [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase private storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase database migrations](https://supabase.com/docs/guides/local-development/database-migrations)

The Supabase SSR helper is currently documented as beta. Keep it behind small local client wrappers
so an API change does not spread through console components.

## Publication Architecture

Do not publish by changing `product_variants.lifecycle_state` directly.

1. Select verified records for a release candidate.
2. Freeze the exact product, technical, compatibility, media and SEO revisions.
3. Generate an authenticated website preview from that frozen snapshot.
4. Run domain validation and `$release-qa` against the exact candidate.
5. Obtain owner approval for the destination and any bounded warnings.
6. Export an immutable public release snapshot.
7. Project that snapshot through the existing product adapters.
8. Run the complete website build and SEO checks.
9. Commit and deploy only with authorization covering the exact repository/branch/environment.
10. Record the commit, deployment, live checks and rollback release.

Recommended transition output:

```text
generated/catalog/releases/<release-id>.json
generated/catalog/current.json
```

The generated files contain public fields only. Internal notes, rejected values, source-only files,
private document paths and user identities must never enter the website bundle.

The current `lib/data/products.ts` adapter may remain during transition. After parity is proven, it
should be generated from the approved snapshot or replaced by a typed snapshot adapter. It must not
remain a manually edited competing source.

## Migration And Rollback Plan

### Step 0 - Approval And Environment

- D0-D7 were approved on 2026-08-30; retain the dated decision record.
- Create local migration tooling and a non-production Supabase environment.
- Do not connect the public website.

### Step 1 - Shadow Schema

- Create versioned migrations, generated database types, role policies and audit functions.
- Import copies of existing products, technical facts, compatibility, series evidence and media
  records without changing their status.
- Reconcile source and destination counts and identifiers.

### Step 2 - Shadow Console

- Add protected read-only dashboard and record detail pages.
- Verify user/session behavior and RLS allow/deny cases.
- Keep all mutations disabled until parity is accepted.

### Step 3 - Controlled 15AK Review

- Enable edits only for the 15AK pilot.
- Route all uncertain values through propose/approve/edit/reject.
- Preserve existing CSV/TypeScript sources as rollback authority during this step.

### Step 4 - Preview And Release Candidate

- Generate a private preview and compare it with current routes and content.
- Verify no internal fields or private assets leak.
- Produce a release snapshot without deploying it.

### Step 5 - Scope-Limited Authority Cutover

- After explicit owner approval, make Supabase canonical for the approved 15AK scope only.
- Freeze legacy repository inputs for that scope and generate them from the release projection.
- Keep unrelated product families on the existing workflow until separately migrated.

### Rollback

- Database migrations require reviewed down/forward recovery instructions and backups.
- Public rollback selects the last approved release snapshot and rebuilds it.
- A database outage must not remove the last published product pages.
- A withdrawn or conflicting fact blocks the next release but does not silently rewrite historical
  release evidence.

## V1 Milestones And Exit Gates

### Milestone 0 - Architecture Approval

Exit when the platform, console placement, authentication, authority transition, media storage and
publishing decisions are explicitly accepted.

### Milestone 1 - Data Foundation

Deliver versioned migrations, typed database access, import staging, audit events, lifecycle rules,
RLS tests and a reconciled shadow import. Exit only when current record counts, stable identifiers,
statuses and conflicts match the repository sources.

### Milestone 2 - Console Shell And Dashboard

Deliver invite-only login, role-aware navigation, dashboard readiness views and read-only products,
series and evidence screens. Exit only when unauthorized requests fail at both application and
database layers.

### Milestone 3 - 15AK Product And Verification Workflow

Deliver product/variant editing, field-level technical facts, evidence display and
approve/edit/reject. Exit only when a proposed value can move through review without losing its
original source or being confirmed automatically.

### Milestone 4 - Compatibility, OEM, Packaging, Media And Documents

Deliver governed relationships, exact-image mapping, rights review, missing-view detection,
packaging records and technical document links. Exit only when appearance cannot produce confirmed
fit and an image cannot become public without rights and exact-match evidence.

### Milestone 5 - Preview, SEO, Publishing And Release QA

Deliver frozen candidate previews, metadata, structured-data projection, internal links, readiness
warnings, QA results and immutable release snapshots. Exit only when `BLOCKED` candidates cannot
publish and public routes remain stable.

### Milestone 6 - Complete 15AK Pilot

Create one real 15AK SKU from source intake through human verification, media approval, compatibility
review, preview, QA and owner-approved publication without directly editing a website page. Exit
only when rollback works and every public fact can be traced to its approved source.

## Success-Criteria Coverage

| Goal criterion                             | Architectural proof path                               |
| ------------------------------------------ | ------------------------------------------------------ |
| Create a product without page-code editing | Product/variant record plus generated release snapshot |
| Store technical source and status          | `technical_values` plus evidence links                 |
| Map images to SKU                          | `media_assets` plus `product_media`                    |
| Manage compatibility separately            | Compatibility entities and relationships               |
| Show missing data                          | Readiness views and dashboard blocker queues           |
| Show conflicts                             | Versioned candidate values with `DATA_CONFLICT`        |
| Approve/edit/reject                        | Append-only `verification_events`                      |
| Generate website preview                   | Frozen authenticated release candidate                 |
| Block unsafe publication                   | Release QA plus lifecycle transition enforcement       |
| Avoid conflicting product copies           | Database authority plus generated public projection    |
| Scale to 1000+ SKUs                        | Indexed relational identity/value/relationship tables  |
| Complete 15AK workflow                     | Milestone 6 acceptance test                            |

## Decisions Requiring Owner Approval

| ID  | Decision                 | Recommended default                                                                             | Why approval is required                                                                            | Current state       |
| --- | ------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------- |
| D0  | Goal Mode phase priority | Make Console V1 the next implementation phase while keeping 15AK evidence as its first workload | Reconciles the new objective with the current evidence-first phase recorded in `docs/CODEX_GOAL.md` | Approved 2026-08-30 |
| D1  | Central platform         | Supabase Postgres + Auth + Storage                                                              | Creates an external data authority and future recurring cost                                        | Approved 2026-08-30 |
| D2  | Console placement        | Protected `/console` module in this Next.js repository                                          | Defines security and deployment boundary                                                            | Approved 2026-08-30 |
| D3  | Authentication           | Invite-only Supabase Auth; no public signup; owner-controlled roles                             | Requires user/account and login policy choices                                                      | Approved 2026-08-30 |
| D4  | Authority transition     | Shadow import, parity review, then 15AK-only cutover                                            | Changes the canonical source boundary established by prior decisions                                | Approved 2026-08-30 |
| D5  | Public publishing        | Git-backed immutable snapshot; no direct draft database reads                                   | Defines release, rollback and SEO behavior                                                          | Approved 2026-08-30 |
| D6  | Media storage            | Private originals/evidence; export only approved web derivatives                                | Affects rights, storage cost and public asset delivery                                              | Approved 2026-08-30 |
| D7  | Environment and region   | Local development plus separate hosted non-production environment before production             | Requires provider region, budget and account ownership                                              | Approved 2026-08-30 |
| D8  | Airtable transition      | Keep it non-authoritative until Console review parity is proven                                 | Revises an existing intake workflow only after replacement is ready                                 | Awaiting owner      |

Local schema development is authorized by D0-D7. Applying migrations, credentials or shadow data to
a hosted project still requires the exact non-production destination to be named and verified.
Source-of-truth cutover remains a later, scope-specific approval. D8 can remain unchanged through the
pilot.

## Explicit Non-Goals For V1

- CRM, customer management, quotation generation or distributor management
- Pricing, inventory, purchasing, production planning or financial accounting
- Public user accounts or customer portals
- Automatic confirmation of technical or compatibility facts
- Direct publish-on-save behavior
- Migration of all guides, applications and company content into a CMS
- `/zh/` and `/en/` route migration
- Rewriting existing public product URLs or templates
- Authoritative migration of all 43 products before the 15AK workflow succeeds; a read-only shadow
  copy is required for parity testing

## Principal Risks And Controls

| Risk                                  | Required control                                                           |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Two competing canonical sources       | Shadow mode, explicit scope cutover and one-way projection                 |
| Unverified data promoted by UI action | Evidence-aware transition rules plus human approval                        |
| Service-role exposure                 | Server-only client, environment variables and secret scanning              |
| RLS gap                               | Explicit grants, policy tests and application-layer authorization          |
| Private preview leakage               | Authenticated dynamic routes, `noindex`, private assets and DTO filtering  |
| SEO regression                        | Stable routes, immutable snapshot, existing metadata/schema/sitemap audits |
| Media rights or identity error        | Separate rights, ownership, exact-match and publication states             |
| Audit tampering                       | Append-only events and restricted update/delete grants                     |
| Partial release                       | Frozen release candidate and exact QA result                               |
| Database outage                       | Public static snapshot remains available                                   |
| Premature complexity                  | 15AK-only mutation scope and explicit V1 non-goals                         |

## Approved Next Action

With D0-D7 approved and the phase decision recorded, create Milestone 1 as one controlled
batch: replace the unused draft catalog SQL with versioned local Supabase migrations, generated
types, RLS tests, audit/lifecycle foundations and a read-only shadow import of current governed data.
Do not add public publishing or migrate unrelated products in that batch.
