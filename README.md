# arcfort-website

Industrial B2B website for ArcFort Weld, operated by Renqiu Ailesen Welding Technology Co., Ltd.

## Brand

- Brand name: ArcFort Weld
- Company English name: Renqiu Ailesen Welding Technology Co., Ltd.
- Company Chinese name: 任丘市埃勒森焊接科技有限公司
- Positioning: Industrial Welding & Cutting Solutions
- Audience: Global distributors, importers, wholesalers, OEM buyers, industrial users, and repair workshops

The legal entity and website brand are deliberately separated in structured data: Schema.org
`Organization` uses Renqiu Ailesen Welding Technology Co., Ltd. as its primary name, while ArcFort
Weld is represented as the `Brand` and `WebSite`. Add `sameAs` links only for verified profiles
controlled by this company; never associate unrelated companies that use a similar brand name.

## Confirmed Business Information

- Business email: `arcfortweld@outlook.com`
- WhatsApp: `+86-18803076512`
- Address: Renqiu City, Cangzhou, Hebei Province, China
- Main port: Tianjin Xingang Port / Tianjin Port, China
- Alternative ports: Qingdao Port or Ningbo Port are available upon request
- Payment terms: T/T, 30% deposit before production, 70% balance before shipment
- MOQ policy: Small trial orders accepted; OEM MOQ depends on product and packaging requirements
- Lead time: 7-20 working days for regular orders
- OEM service: Logo, packaging, private label, and model customization available

## Tech Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- ESLint
- Prettier
- Supabase Product Intelligence foundation (shadow mode; not a public website dependency)

## Product Intelligence Console V1

The approved Product Intelligence architecture adds a dedicated Supabase Postgres, Auth and private
Storage foundation without changing the website's current product source. Milestone 1 is data-only:
there is no `/console` UI or website signup path yet, and no direct database-to-website publishing.
Hosted Auth configuration must be verified before enabling Console access.

The current destination-specific staging approval and Windows local-login fallback are in the
[Milestone 1 runbook](docs/operations/product-intelligence-console-milestone-1.md#current-staging-authorization---2026-09-03).
Check that record before linking a project; a previous project reference is not current approval.
Local login helpers and credentials are ignored by Git and must never be deployed.

Key files:

- `supabase/migrations/` - versioned relational schema, lifecycle, human verification, release QA,
  audit, RLS, readiness and private storage policies
- `supabase/tests/database/` - pgTAP schema, lifecycle, RLS and workflow-guard tests
- `lib/domain/catalog/` - shared lifecycle, verification and shadow-data contracts
- `lib/supabase/database.types.ts` - Supabase CLI types generated from the verified local schema
- `scripts/console/` - deterministic shadow generation, validation and guarded staging import
- `generated/console/product-intelligence-shadow-v1.json` - reviewed repository shadow projection;
  never serve this internal file publicly
- `docs/operations/product-intelligence-console-milestone-1.md` - local, staging, import and rollback
  procedure
- `data/evidence/company-claims.csv` - governed company claims and blocked unsupported topics
- `data/assets/company-media-assets.csv` - company/site media provenance and evidence status
- `docs/goal-progress-report.md` - generated 100/300/500/1000 SKU and evidence progress report

Routine repository checks:

```bash
npm run console:shadow:generate
npm run console:shadow:validate
npm run console:domain:test
npm run console:config:test
npm run console:sql-qa:test
npm run console:migrations:validate
npm run console:db:types:check
npm run company:evidence:validate
npm run company:evidence:test
npm run goal:report
```

Install the locked dependencies with `npm ci` before generating database types; formatter version
drift can change the generated file even when the schema is identical. The database type check
requires the local Supabase stack to be running. Use
`npm run console:db:types` after an intentional schema change, review the generated type diff and
commit it with the matching migration.

The guarded `npm run console:shadow:apply` command writes only when a named local or staging Supabase
destination and explicit shadow-write environment flag are configured. It is not a production
publication command. Repository CSV and governed registries remain canonical until a later approved
15AK cutover.

`PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY` accepts a modern Supabase secret key or a legacy
service-role JWT. Modern secret keys are sent only through the `apikey` header; legacy JWTs retain
Bearer authorization. Keep both kinds server-only and out of Git. CLI login and the destination
approval record are separate from these project API credentials; follow the operations runbook.

The 2026-09-02 isolated Linux CI proof for commit `6383171` applied all five migrations, passed all
74 pgTAP assertions, matched CLI-generated database types and reconciled every source-controlled
field across 17 imported tables twice for the complete 43-product shadow snapshot.
[Both CI jobs passed](https://github.com/18803076512/arcfort-website/actions/runs/33591108612),
including lint, typecheck and the production build. This is an isolated local-stack test on a CI
runner, not proof of hosted Supabase parity or production publication. The operations runbook retains
the exact candidate evidence and separate Windows Docker startup limitation. The replacement staging
project `fdsvzuqixppsakukkrsf` subsequently completed the real hosted replay on 2026-09-03, after
authenticated identity/empty-schema checks, owner recovery confirmation, reviewed paired Free-plan
Dashboard evidence and a repeated dry-run. All five migrations, 74 hosted assertions and two
17-table exact-row imports passed. Generated `public` and `graphql_public` schema members match the
committed types; the added hosted PostgREST-version metadata means the entire generated
file is not byte-identical. The local canonical type file was retained. See the
[hosted completion evidence](docs/operations/product-intelligence-console-milestone-1.md#hosted-milestone-1-completion---2026-09-03).
The scoped M1 result is `PASS_WITH_WARNINGS`, not approval to publish or change data authority.

SQL-based database QA is available for the reviewed Milestone 1 tests:

- `npm run console:sql-qa:test` validates the report adapter and destination rejection cases without
  a database or credentials.
- `npm run console:db:test:sql` uses `psql` in this project's already running local Supabase container.
  CI retains the existing pg_prove run and additionally checks the SQL report path with real passing,
  failing and count-mismatch controls.
- `npm run console:db:test:staging` uses the authenticated CLI Management API without a local Docker
  dependency. It requires the reviewed staging URL/reference, `staging` environment and explicit
  shadow-write guard. It does not need the project's service-role key and does not load env files
  automatically. Do not enable it until the target, plan, migrations and authorization are verified.

The adapter preserves existing test assertions and fixtures, adds a final pgTAP counter/diagnostic
report before ROLLBACK, and rejects missing, failed, partial or mismatched results. These commands
are for reviewed repository SQL only, not an arbitrary-SQL sandbox. The new adapter's unit and local
quality checks pass. At commit `202c189f1f062fa20fff8219aca3a0aba66f1c79`,
[isolated CI run 33714502709](https://github.com/18803076512/arcfort-website/actions/runs/33714502709)
also passed the new runner's three self-checks and all 74 assertions on PostgreSQL, the original
pg_prove suite, generated types and two exact-row shadow imports across 17 tables. The real hosted
SQL transport and all 74 assertions have now passed too. Final hosted inspection found 28 forced-RLS
tables, two private buckets, 43 shadow products, no duplicate SKU/slug, no test users/roles and no
publication records. All 14 conflicts and unconfirmed evidence states remain unchanged.
The existing server key was used only in process memory for the approved import; the ignored local
env file retains an empty key and a disabled write guard. No production connection was made.

Milestone 1's data-foundation gates are complete; the full Console V1 is not. The
[Milestone 2 implementation plan](docs/operations/product-intelligence-console-milestone-2-plan.md)
now defines layout isolation, invite-only login, authorization and read-only dashboard/product views.
A read-only hosted Auth preflight found `disable_signup=false`; Console activation must wait for
the remaining callback/delivery review and named owner-account handoff. The owner approved M2-A
through M2-E on 2026-09-03. The local read-only Console technical candidate is now verified; see the
[M2 implementation record](docs/operations/product-intelligence-console-milestone-2.md).
Hosted signup has subsequently been disabled and exact loopback URLs configured in the approved
staging project. The owner approved separate staging Resend SMTP, configured on 2026-09-05. After
reporting no receipt at the initial address, the owner approved a different login mailbox on
2026-09-06. Its single invitation has provider-reported delivery; no owner role has been granted.
Actual password/login and authenticated browser checks remain open. See the
[staging Auth mail runbook](docs/operations/console-staging-auth-smtp.md) for configuration evidence,
the corrected CLI setting drift and the remaining real-owner handoff. Console stays disabled by
default and rejects Vercel environments. PR #130 is not merged or deployed to production by this work.

### Read-Only Console Development

Public page files live under `app/(public)/` without changing their URLs. Console files live under
`app/(console)/console/`; public tracking, metadata and navigation do not wrap them. Social-image
endpoints remain at `app/distributor-supply/` to retain their existing stable URLs.

Use the `CONSOLE_*` names in `.env.example` only in a reviewed local process. Keep the Product
Intelligence import write guard off and its service key absent. The server uses the public client
key plus the signed-in user's session, checks current roles and relies on RLS for every read.
`npm run console:boundaries:test` checks local safety contracts. After a reviewed local production
server is running, `npm run console:http:test` verifies private response headers, unauthenticated
payload isolation, cross-origin POST rejection, public shell retention and stable social-image
routes without submitting credentials or email. Isolated CI additionally runs
`npm run console:auth:test:local` against disposable users and 1,103 synthetic pagination records;
this command refuses non-CI/hosted execution. It is not an owner invitation workflow.

The invitation/recovery HTML in `supabase/templates/` is also installed on approved staging Auth.
Local `supabase/config.toml` remains collector-only; `supabase/config.staging.toml` is a non-loaded
reference, not a deployment input. `console:db:start` and database CI check mail isolation before
starting disposable services. Never provide real SMTP secrets to these tests or push local config to
hosted staging. Provider-reported delivery is not verified owner inbox/login. Do not deploy or enable
Console on the public website during M2.

## Pages

- `/` - Home
- `/products` - Product center
- `/products/[category]` - Product category page
- `/products/[category]/[slug]` - Product detail page
- `/applications` - Application center
- `/applications/[slug]` - Application detail page
- `/guides` - Buyer guide center
- `/guides/[slug]` - Buyer guide article
- `/about` - About
- `/distributor-supply` - Distributor, importer and wholesale sourcing information
- `/oem-service` - OEM service and private label support
- `/quality-control` - Quality control and inspection workflow
- `/shipping-payment` - Shipping, payment, MOQ and lead time information
- `/downloads` - Catalog, data sheet and RFQ document request center
- `/contact` - Contact
- `/privacy` - Privacy notice
- `/rfq` - Request for quotation
- `/api/rfq` - RFQ submission endpoint prepared for Supabase and Resend
- `/api/rfq/status` - RFQ backend configuration status check without exposing secrets

## Content Architecture

- `app/globals.css` and `tailwind.config.ts` - shared industrial brand colors, typography roles,
  spacing, container, radius, shadow and interaction tokens
- `components/ui/` - reusable container, section, section-heading and button primitives
- `components/navigation/` - scalable desktop product mega menu, secondary navigation menus and
  deliberate mobile navigation
- `components/home/` - homepage hero, product-system cards and final qualified-inquiry CTA
- `content/homepage.ts` - homepage product-system, industry, advantage, quality and resource content
- `content/categories.ts` - product category SEO content
- `lib/data/products.ts` - CMS-ready mock product data source for Sanity or Supabase migration
- `content/products.ts` - adapter that maps product data into the current page schema
- `content/applications.ts` - application page content
- `content/guides.ts` - buyer guide and article content
- `lib/data/product-series.ts` - governed product-series records, evidence boundaries and RFQ fields
- `lib/data/product-series-evidence.ts` - company-catalog series source pages, publication gates,
  image evidence and missing-data records
- `data/evidence/product-series-component-facts.csv` - canonical field-level catalog evidence for
  component and variant candidates under series review
- `lib/data/product-series-component-facts.ts` - generated runtime projection of series-component
  evidence; never edit it directly
- `lib/data/compatibility-relationships.ts` - canonical product, series, torch, machine and reference
  relationship records
- `lib/content/compatibility.ts` - evidence-safe compatibility selectors and public series projections
- `lib/data/product-technical-facts.ts` - field-level technical references with evidence and
  verification status
- `lib/content/product-technical-facts.ts` - evidence-safe product specification projection
- `lib/content/product-series.ts` - series selectors, route builders and product relationship resolver
- `docs/content-research/` - internal source records used to verify technical buyer-guide claims
- `lib/content/schemas.ts` - reusable TypeScript content schema
- `lib/content/site.ts` - centralized company, contact, trade, port, payment, MOQ, lead time and OEM information
- `lib/content/company-profile.ts` - About-page buyer profiles, evidence boundaries, FAQ, due-diligence links and company RFQ prompt
- `lib/content/quality-control.ts` - order-specific inspection stages, product-family review matrix, evidence options, FAQ and quality RFQ prompt
- Shared email and WhatsApp link builders in `lib/content/site.ts` prefill product, quantity,
  destination and reference prompts so buyers can start a usable inquiry from any major page.
- `lib/content/seo.ts` - metadata helper
- `lib/content/jsonld.ts` - JSON-LD helpers for Product, BreadcrumbList, Organization and FAQ
- `lib/content/product-redirects.ts` - permanent redirects for retired product URLs and historical
  category aliases
- `lib/content/product-search.ts` - server-rendered product search, category filtering and pagination
- `lib/content/topic-links.ts` - category-to-guide internal linking map

The website currently includes 6 product categories, 43 product records (40 active public products
and 3 draft records awaiting reviewed images), 6 application pages, 17 buyer guides and dedicated
trust pages for distributor supply, OEM service, quality control, shipping/payment and document
requests. Four retained generic starter URLs permanently
redirect to their current category pages so they do not compete with exact SKU pages. Missing product data must remain explicit
instead of inventing specifications, certifications, prices, stock status, factory capacity or
customer cases.

The V2 Phase 1 presentation layer is intentionally separate from product and SEO data. The global
Header, Product Mega Menu, homepage and Footer consume stable routes and canonical content sources;
visual changes must not rewrite product facts, URL identifiers, structured data or RFQ behavior.
The homepage uses one full-bleed representative industrial visual and labels it as representative,
not as evidence of ArcFort Weld facilities or exact products. Product-system and featured-product
sections remain data-driven so future Sanity or Supabase migration does not require a page rewrite.

V2 Phase 2 applies the same presentation system to the Product Center, category pages and product
details without changing canonical URLs or product evidence. The Product Center now follows a
search, product-system, catalog, RFQ-preparation and FAQ sequence. Category pages keep all
server-rendered SEO content and RFQ builders but group company-catalog reference families in an
expandable evidence section. Product details use the reviewed image registry, a reusable gallery,
shared technical tables and a concise quotation CTA. Product cards show only the family, product
name, SKU, one useful selection cue and buyer actions; technical truth remains in the canonical
product source.

The company-catalog series registry currently covers 10 distinct MIG/MAG references: 15AK, 24KD,
25AK, 36KD, 40KD, 501D, 602 and ORK 200A/350A/500A. Nine records remain bounded RFQ choices in
`evidence_review`; 602 is `blocked` and private because its catalog page uses a 501D header while the
same page's complete-torch and technical table identifies 602. None generates an indexable series
page. The prepared 15AK candidate is retained internally, while its former URL temporarily redirects
to the MIG/MAG category until every linked product has a rights-approved, exact-product main image
and the governed relationships pass the publication gate. Keep exact technical values in the
canonical product source and run
`npm run series:validate`, `npm run test:product-series` and `npm run series:report` before
publication.

The detailed series-component workflow currently covers 15AK, 24KD, 25AK, 36KD, 40KD, 501D and 602. Together they contain 589 sourced catalog/OEM-reference facts, 189 component/variant candidates
and 276 exact-image requests. Fourteen source fields are held as `DATA_CONFLICT`: thirteen existing
technical or dimensional conflicts plus the 602 page-identity contradiction. No candidate in this
workflow is a public SKU and these reviews create no public series route. Maintain
the matching `data/intake/*-series-confirmation.csv` and
`data/intake/*-image-intake.csv` files, then run `npm run series:components:generate`,
`npm run series:components:validate` and `npm run series:components:report`.

The compatibility registry currently contains four 15AK product-to-series relationships. All remain
`reference_only` because company-catalog grouping does not prove final fit. Add relationship evidence
in `lib/data/compatibility-relationships.ts`, never duplicate it in a page component, and run
`npm run compatibility:validate` plus `npm run compatibility:report` before changing any public
compatibility status.

The field-level technical registry currently contains 15 company-catalog references for four 15AK
products. These values drive the public specification rows but remain visibly qualified as catalog
references because none has exact-SKU factory confirmation yet. Use
`data/intake/15ak-technical-confirmation.csv` for factory values and evidence, and
`data/intake/15ak-product-image-intake.csv` for company-owned main, detail, dimensional and packaging images.
Run `npm run technical:validate` and `npm run technical:report` before changing a reference to
`CONFIRMED` or approving a collected image.

The private Airtable base `ArcFort Weld - 15AK Evidence Intake` is an optional reviewer interface,
not a product database. Cloud records must be reviewed and transferred deliberately into the
canonical intake CSV files before repository validation and PR review. See
`docs/operations/airtable-15ak-evidence-intake.md` for the authority boundary and transfer procedure.
The local `ArcFort-Weld-15AK-Evidence-Intake.xlsx` workbook provides a combined factory handoff for
the 46 component candidates, 58 component image requests, 15 product technical rows and 20 product
image requests. It remains an ignored working artifact; use
`docs/operations/15ak-factory-evidence-handoff.md` for controlled reconciliation.

The local `ArcFort-Weld-MIG-MAG-Series-Evidence-Intake.xlsx` workbook combines the governed 24KD,
25AK, 36KD, 40KD, 501D and 602 review queues: 143 component candidates, 218 image requests and 14
blocked source conflicts. The 602 rows are included for controlled factory review but remain
`blocked` because the company catalog conflicts between a 501D page header and 602 tables. The
workbook remains an ignored reviewer artifact, is not canonical data and creates no products or
public routes.
Use `docs/operations/mig-mag-series-evidence-handoff.md` for the controlled return procedure.

The About page is the canonical public company profile for the legal-company and ArcFort Weld brand
relationship. Update confirmed identity and contact facts in `lib/content/site.ts`, keep buyer-facing
company content in `lib/content/company-profile.ts`, then run `npm run test:company-profile` before
publishing changes.

The Quality Control page is the buyer-facing reference for product identification, compatibility,
inspection evidence, packing approval and pre-shipment review. Keep its workflow in
`lib/content/quality-control.ts`, avoid unsupported inspection or certification claims, and run
`npm run test:quality-control` before publishing changes.

MIG/MAG, plasma and TIG category records also provide structured component guides, selection variables and
compatibility evidence checklists. These sections are rendered from `content/categories.ts`, link to
active product records and guide buyers toward model-, drawing- or sample-based confirmation. The
TIG parts identification guide is intentionally separate from the TIG consumable-stack selection
guide: one helps name unknown parts from photos and samples, while the other checks how known parts
fit together.

The existing robotic welding torch product URL is retained because Search Console has already
recorded impressions and a click. Its product-specific buying profile treats the current catalog
image as evidence of a robotic MIG/MAG torch neck/front-end family only. Buyers must provide the
installed cell and torch references, interface or neck drawing, cooling and cable arrangement, and
the consumable stack before a replacement is quoted. Run `npm run test:robot-torch` after changing
this product, its buying profile or its replacement guide.

The MIG/MAG category and automotive application page also provide contextual paths to the robotic
torch product and replacement guide. After `npm run build`, run `npm run seo:links` to verify that
both priority URLs retain at least four distinct inbound source pages. The same audit protects these
commercial paths from becoming sitemap-only pages during future layout or content changes.

The plasma category also provides a company-catalog reference matrix and an interactive RFQ builder.
The builder carries the buyer's torch family, requested components, visible part reference, quantity
and packing requirement into `/rfq`. Catalog family names remain reference-only until the exact torch
label, approved sample or drawing has been reviewed for compatibility.

The TIG category provides the same evidence-led path for WP-9/WP-20, WP-17/WP-18/WP-26 and WP-27 catalog
reference groups, with TIG-specific fields for the front-end arrangement, requested parts, documented
tungsten diameter and cup or part marking. The builder organizes buyer input without asserting that a
catalog reference group or visually similar component confirms compatibility.

The MIG/MAG category organizes buyer-facing company-catalog references into 15AK, 24KD/25AK,
36KD/40KD, 501D and ORK 200A/350A/500A groups. The internally conflicting 602 record remains private
until factory evidence resolves its page identity. The RFQ builder records the torch or cooling
arrangement, requested parts, documented wire diameter, visible part or drawing reference, quantity
and packing. These labels are inquiry references only; final fit still requires the exact torch
label, complete front-end stack, drawing, approved sample and connection evidence.

The Welding Machines category and welding machine sourcing checklist include an interactive sourcing
brief for process, application, documented destination electrical input, machine arrangement,
accessories, requested documents, destination, quantity and packing. The generated text is carried
into the validated RFQ form as buyer requirements; it never presents an output rating, interface or
certification as confirmed supplier data. Run `npm run test:machine-rfq` after changing this workflow.

The OEM Service page includes a decision-based RFQ builder for product scope, customization type,
available evidence, project stage, quantity, destination market and packing approach. It prepares a
structured `/rfq` request without sending the inquiry or placing logo files, drawings or proprietary
buyer content in analytics. Buyers upload those files through the validated RFQ form.

The `/products` route supports server-rendered search by product name or SKU, category filtering and
12-item pagination. Filter and pagination URLs use the product-center canonical and `noindex,follow`
so buyers can share result URLs without creating duplicate indexable search pages.

## Product Lines

- MIG/MAG Torch Parts
- TIG Torch Parts
- Plasma Cutting Consumables
- Welding Consumables
- Welding Machines
- Welding Accessories

## SKU Bulk Import Workflow

For daily SKU maintenance, use the simple SKU workflow first. It lets you maintain a short CSV and
generate the full website product CSV automatically.

The generator updates rows that match the simple CSV and preserves existing rows that are not in the
simple file. Existing publication and verification metadata is retained. New or updated rows without
a reviewed own or supplier image are generated as `draft`, preventing placeholder products from
returning to public category pages when the simple SKU batch is regenerated.

Simple CSV files:

- `data/import/products-simple-template.csv` - simple SKU template
- `data/import/products-simple.csv` - active simple working SKU file, currently aligned with the first 30 SKU batch
- `data/import/products-simple-30-sku-template.csv` - reusable first 30 SKU worksheet

Simple workflow:

1. Edit `data/import/products-simple.csv`.
2. Put product images in `public/images/products/` using the `image_name` values.
3. Run `npm run products:simple:preview` to check generated data without writing files.
4. Run `npm run products:simple:generate` to generate `data/import/products.csv`.
5. Run `npm run products:check-images`.
6. Run `npm run products:image-tasks` to refresh the full image evidence queue.
7. Run `npm run images:assets:sync`, review the appended rows in
   `data/assets/product-image-assets.csv`, then run `npm run images:assets:validate`.
8. Run `npm run products:report` and `npm run images:assets:report` to refresh internal readiness
   checklists.
9. Run `npm run acquisition:report` to refresh the acquisition, evidence and external-control report.
10. Run `npm run products:simple:import` to update `lib/data/products.ts`.
11. Run `npm run downloads:generate` to refresh public buyer download files.
12. Run `npm run seo:audit`.
13. Run `npm run build`.

To preview the reusable first 30 SKU worksheet without replacing the active simple CSV:

```bash
node --experimental-strip-types scripts/import-simple-products.ts --input data/import/products-simple-30-sku-template.csv
```

The simple importer can generate safe routing, image-path, SEO and placeholder values. It must not
generate confirmed OEM numbers, confirmed compatible models, certifications, prices, exact technical
ratings or unverified product dimensions. Known product families use the editorial profiles in
`scripts/product-copy-profiles.ts` to generate function-specific English copy. New product families
use a conservative category fallback and print a review warning before import.

Catalog-derived products can use the same reviewed editorial profiles:

```bash
npm run products:refresh-copy
npm run products:refresh-copy:write
npm run products:import
```

The first command previews matched catalog products. The write command updates only active
`official_catalog` rows with an exact editorial profile; it stops if a product profile is missing.

Full CSV workflow:

1. Copy `data/import/products-template.csv` to `data/import/products.csv`.
2. Fill product data in `data/import/products.csv`.
3. Put product images in `public/images/products/`.
4. Run `npm run products:validate`.
5. Run `npm run products:check-images`.
6. Run `npm run products:image-tasks` to refresh the full image evidence queue.
7. Run `npm run images:assets:sync`, then review and update the appended image evidence rows.
8. Run `npm run images:assets:validate`, `npm run products:report` and
   `npm run images:assets:report`.
9. Run `npm run acquisition:report`.
10. Run `npm run products:import`.
11. Run `npm run downloads:generate`.
12. Run `npm run seo:audit`.
13. Run `npm run build`.
14. Submit a pull request.

Use these values when data is uncertain:

- `Available upon request`
- `Contact us for details`
- `TBD`
- `needs_review`
- `unknown`

Product image publication rules:

- `data/assets/product-image-assets.csv` is the canonical evidence and publication registry for
  product main/gallery images. `lib/data/product-image-assets.ts` is generated from it.
- `data/evidence/local-product-image-triage.csv` tracks every unassigned file under
  `public/images/products/`. Its visual-family labels support review only and must never be treated as
  exact-SKU or compatibility evidence. Run `npm run images:triage:validate` after adding, removing or
  assigning local image files.
- Use `own_photo` only for a confirmed ArcFort or company-owned product photo.
- Use `supplier_photo` for a reviewed supplier image that clearly matches the published product
  type; keep exact model, dimensions and compatibility unconfirmed unless separately verified.
- Use `needs_photo` when the current file is a placeholder, illustration or family-level image that
  cannot confirm the published SKU.
- Keep products with `needs_photo` or `placeholder` image status as `draft`; only publish them after
  the product type is supported by a reviewed own or supplier photo.
- The product must use `own_photo` or `supplier_photo`, and the exact asset-registry row must pass the
  complete `search_eligible` evidence gate before it can enter product Open Graph metadata, Product
  JSON-LD or image sitemap entries.
- `legacy_reference` preserves a previously published reference image during migration. It does not
  prove exact-product identity or approved usage rights. It remains visibly labeled as a reference
  in buyer-facing product presentation and is excluded from search metadata. New `search_eligible`
  rows require an exact product match, approved usage basis, known source/owner and source file,
  reviewer and ISO review date.
- Keep the original image source in `source_reference` and record `verified_by` and
  `verified_date`; these internal fields are not exposed on public pages.
- Run `npm run images:assets:report` to review unknown sources, rights gaps, blocked assets,
  resolution priorities, duplicate content and unassigned local files.
- `npm run products:report` reconciles the product CSV with the canonical image asset registry. A CSV
  value of `own_photo` or `supplier_photo` is workflow metadata only; it must not be counted as an
  approved exact-product image unless the matching registry row satisfies every `search_eligible`
  evidence control.
- Run `npm run test:image-readiness` after changing the shared main-image evidence rules. The test
  keeps retained `legacy_reference` images distinct from rights-approved exact-product images.
- Run `npm run test:image-presentation` after changing product cards, galleries or search-image
  projection. The test prevents retained family references from entering metadata, Product JSON-LD
  or image sitemap projection as reviewed exact-product images.
- Run `npm run seo:images` after `npm run build` to inspect every built public product page and the
  generated sitemap for evidence disclosure and search-image eligibility drift.
- Run `npm run images:triage:board` to validate the 73 unassigned local candidates and generate the
  private, filterable review board at `output/reports/local-product-image-triage.html`. The board is
  read-only, omits `notes_internal` and never assigns or approves an image automatically.
- Run `npm run products:image-tasks` to generate `docs/product-image-tasks.csv` from the governed
  registry. The queue covers source ownership, website-use rights, exact-SKU matching, resolution,
  blocked assets and reviewer evidence instead of reporting only missing files.
- Image-task priority is deterministic: `P0` is an active main image with unknown provenance; `P1`
  covers main or blocked MIG/MAG, TIG and plasma assets; `P2` covers the remaining active assets;
  `P3` is reserved for lower-priority draft or secondary assets.
- Re-export or rename files whose extension does not match the detected image content. Keep the
  registry path, canonical product data and generated asset file synchronized through the reviewed
  image workflow.

## RFQ System

The `/rfq` page includes a responsive inquiry form with:

- Name, company, email, WhatsApp, country, product requirements, quantity and message fields
- Required-field validation
- Business email format validation
- Drawing, product list, PDF, Excel, Word, JPG and PNG upload selection
- Server-side validation through `/api/rfq`
- Server-side file signature checks for PDF, JPG, PNG, CSV, legacy Office and OOXML attachments
- Success state only after Resend email or complete Supabase inquiry and attachment storage confirms
  delivery
- Buyer-visible RFQ reference in success and delivery-failure responses
- Optional Supabase storage for RFQ records and attachment metadata
- Optional Resend email notification to the configured business email
- RFQ file attachments sent with the Resend email when email delivery is configured
- Branded HTML sales notifications and buyer confirmations with a plain-text fallback for email
  client compatibility
- A privacy-safe quotation-readiness panel in the sales email with confirmed inquiry signals and
  missing-information prompts; it does not score or reject buyers
- A human-readable lead-source summary and one-click buyer email action in the sales notification;
  the WhatsApp action appears only for an international-format number supplied by the buyer
- Privacy-bounded RFQ attribution that retains only the entry page path, external referrer origin
  and validated UTM labels; unrelated query parameters and full referrer paths are discarded
- Buyer confirmation guidance covering product references, drawings, sample photos, packaging and
  destination details that can accelerate manual review
- Resend idempotency keys for both the sales notification and buyer confirmation, preventing an
  unchanged retry from sending duplicate emails during the provider's 24-hour protection window
- Retry-safe optional Supabase delivery: attachment objects use stable reference paths with upsert,
  and duplicate inquiry rows are ignored by the unique RFQ reference without resetting their status
- HTML escaping for buyer, attachment and source values before they are rendered in email markup
- Independent email and storage delivery so one provider failure does not block the other
- A 12-second timeout for each Resend request so a stalled sales notification or buyer confirmation
  cannot hold the browser request open indefinitely; sales delivery remains successful when only
  the optional buyer confirmation times out
- Prefilled email and WhatsApp fallback when automated delivery is unavailable
- Backend readiness check at `/api/rfq/status`
- Lightweight spam protection with same-origin checks, honeypot, timing checks and source-path
  tracking
- Invisible Vercel BotID Basic verification on browser submissions to `POST /api/rfq`
- Best-effort application fallback limiting each hashed client key to 5 RFQ attempts per 10 minutes,
  with `429`, `Retry-After` and `X-RateLimit-*` response headers
- Structured server logs for delivery outcome, RFQ reference and Resend message IDs without buyer
  personal data
- Persistent multi-product RFQ shortlist stored in the buyer's browser
- Live shortlist count in the desktop header, mobile menu and sticky contact bar
- Per-product quantity and buyer reference fields for mixed distributor inquiries
- Selected products automatically merged into the RFQ submission with SKU, category, line quantity
  and model, size or drawing reference when provided
- Buyer-guide RFQ links prefill the guide topic so the sales team can see the sourcing context
- Every buyer guide links directly to the downloadable RFQ worksheet and the upload form through a
  responsive download, complete and upload workflow
- The Contact page embeds the same production RFQ form with a `contact_page` placement marker, so
  buyers can submit requirements and attachments without an extra page transition

Buyers can add up to 50 products from product cards or detail pages. The shortlist and optional
line-item quantities or references remain in browser `localStorage` until the buyer submits the RFQ
or clears the list; it does not require an account and does not expose internal product fields. When
every selected product has a line quantity, the overall quantity summary becomes optional.

The form also shows a quotation-preparation check before submission. It identifies whether product
evidence, quantity, destination and supporting files are present, then lists buyer-friendly details
that can reduce follow-up. RFQ conversion events include only the readiness status and signal count;
buyer contact data, requirements and attachment names are not sent to analytics.

Attachment signature checks reject files whose contents do not match the submitted extension before
storage or email delivery. This reduces simple extension spoofing but does not replace endpoint
malware scanning; sales users must continue to scan external attachments and avoid enabling macros.

Supabase storage and Resend email delivery are optional production services and must be configured
through environment variables. No real API keys, email passwords, database passwords or private
tokens are committed.

For production launch, follow `docs/rfq-production-readiness.md` and confirm
`https://www.arcfortweld.com/api/rfq/status` reports `email.ready:true` before treating the RFQ form as
a complete automated lead channel. Configuration readiness must still be followed by one controlled
test inquiry that reaches the sales inbox.

Run the shared RFQ validation, reference and email-template safety tests with:

```bash
npm run test:rfq
```

Check the deployed backend without sending an inquiry:

```bash
npm run rfq:check-live
```

Audit the Resend sender domain, DKIM, custom MAIL FROM SPF/MX and DMARC records:

```bash
npm run email:audit:live
```

The audit treats missing DMARC as an actionable warning while SPF, DKIM and the custom MAIL FROM
records remain blocking checks. See `docs/rfq-email-delivery.md` before changing the DMARC policy.

BotID requires a browser-generated challenge on protected submissions. Send a controlled production
test from the deployed `/rfq` page, then confirm the matching `AF-RFQ-...` reference in the sales
inbox and Resend logs. The command-line checker remains a non-mutating readiness check and does not
send an inquiry.

Each Resend request is bounded to 12 seconds, while the browser waits up to 45 seconds for the full
RFQ API response. It never retries automatically because
a delayed response can arrive after the server has already accepted the inquiry. On timeout, all
entered fields and selected attachments remain in the form. An unchanged manual retry reuses the
same submission token, RFQ reference, Resend idempotency keys and optional Supabase storage paths;
editing the inquiry creates a new token. The buyer is still directed to check for the confirmation
email before retrying or using the email/WhatsApp fallback.

Environment variables:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_RFQ_TABLE=rfq_inquiries
SUPABASE_RFQ_BUCKET=rfq-attachments
RFQ_EMAIL_RECIPIENT=arcfortweld@outlook.com
RFQ_EMAIL_FROM=
RESEND_API_KEY=
GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_GA_ID=
```

Scan all Git-tracked text files for high-confidence API keys, access tokens, private keys and
sensitive environment-variable assignments before committing configuration or documentation:

```bash
npm run security:secrets
```

The scan redacts matched values and reports only the credential type, file and line number. It runs
in CI before product generation, linting and build checks. It complements provider-side key rotation
and GitHub secret scanning; it does not make a key safe again after that key has been shared outside
the repository.

Global responses include a Content Security Policy plus `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` and legacy browser hardening
headers. The CSP keeps statically generated pages cacheable, blocks plugins, frames and inline event
handler attributes, and only allows same-origin resources plus the official Google tag and GA4
collection origins. Advertising endpoints are not allowed because this site does not enable Google
Ads or advertising signals. Re-audit the policy before adding another browser-side service.

The RFQ endpoint uses free Vercel BotID Basic browser verification before parsing an inquiry. If the
verification service is temporarily unavailable, the endpoint fails open to the existing same-origin,
honeypot, timing, file-validation and application-rate-limit protections so genuine buyers retain the
email and WhatsApp-backed inquiry path. The application limiter uses Vercel's forwarded client IP,
hashes the key with a process-local salt and keeps no raw IP address. It is not distributed because
Vercel Functions can restart or scale across instances. A paid Vercel Firewall rate-limit rule for
`POST /api/rfq` remains optional for sustained abuse and must not be enabled without billing approval.

The App Router includes three buyer-facing recovery layers: `app/not-found.tsx` for missing URLs,
`app/(public)/error.tsx` for page-level runtime errors and `app/global-error.tsx` for root-layout failures.
Keep product, RFQ, business email and WhatsApp recovery routes available when these pages are
updated. Error pages must not expose stack traces, credentials or internal request data.

## Search Console and Analytics

The site supports Google Search Console verification and GA4 tracking through environment variables.
No analytics IDs are hardcoded.

Run the blocking SEO consistency check before every important deployment:

```bash
npm run seo:audit
```

The audit checks indexable product routes, duplicate metadata, category and product references,
legacy redirects, homepage featured-product coverage, reviewed image eligibility, guide metadata,
article dates, guide content depth and placeholder-content warnings. Warnings identify editorial
work that still needs real product data; broken links, duplicate routes, thin guides and invalid
references fail the command.

After deployment, audit every sitemap URL against the live site:

```bash
npm run seo:audit:live
```

The live audit uses a bounded read-only retry policy for transient network failures and HTTP
`408`, `425`, `429`, `500`, `502`, `503` and `504` responses. It does not retry deterministic results
such as `404`, and a persistent transient status still fails the audit. Defaults are four concurrent
requests, three attempts, a 20-second per-attempt timeout and bounded exponential backoff. Test the
retry boundary without contacting production with:

```bash
npm run test:live-audit
```

For diagnosis, the live audit accepts `--batch-size`, `--request-attempts`,
`--request-timeout-ms`, `--retry-base-delay-ms` and `--max-request-failures`. The default failure
budget stops the audit after eight final network or retryable-status failures so a broad outage
cannot consume the full scheduled-job window. Do not increase these values to conceal a real
production failure.

Search performance improvements should follow exported Search Console evidence rather than isolated
keyword assumptions. Keep dated baselines under `docs/seo/`, use page and query-cluster trends, and
wait at least 28 days before judging title or content changes. The current baseline and action record
is `docs/seo/search-console-baseline-2026-08-12.md`.

Homepage search-title changes should preserve the visible H1 and broad supply scope unless the search
evidence clearly supports a repositioning. Keep the first viewport focused on product categories,
direct contact and RFQ entry, and verify that mobile buyers can see the next content band without a
full-screen promotional block.

The product center search accepts common buyer terminology as well as exact names and SKUs. Keep
industry aliases such as `GTAW` / `TIG`, `torch` / `gun`, and `cutting` / `cutter` covered by
`npm run test:product-search` when expanding the catalog or changing search behavior.

Run the combined production health check without sending an RFQ or email:

```bash
npm run health:production
```

GitHub Actions runs the same non-mutating production health check every six hours. A failed run
opens or updates one `[Production] ArcFort Weld health check failed` issue with the Actions run link;
the next successful run adds a recovery note and closes that issue. The health job keeps read-only
repository access, while only the separate incident job receives `issues: write` permission.
Email-domain checks use the same bounded retry helper for DNS-over-HTTPS. DKIM, SPF and custom MAIL
FROM MX are currently present; DMARC remains missing and requires an approved DNS change before it
can be recorded as configured.

## Performance Budgets

Run a production build and then check the buyer-facing transfer budgets with:

```bash
npm run build
npm run performance:budget
```

The budget reads the generated Next.js app manifest and checks gzip-compressed JavaScript for the
homepage, Product Center and RFQ route, shared CSS, individual JavaScript assets and source files in
`public/images/site/`. It prevents future shared scripts, form features or visual assets from
quietly increasing the initial buyer download. Update a limit only after measuring the deployed page
and documenting why the additional transfer cost provides necessary buyer value.

The Next.js image configuration includes common mobile and desktop viewport widths so full-width
buyer-facing images receive a close responsive AVIF or WebP candidate instead of downloading the
next much larger default size. Keep page-level `sizes` values accurate when adding or changing an
image layout, and measure the deployed optimized response rather than treating the source-file size
as the browser transfer size.

Audit only the deployed CSP, browser hardening headers, HSTS, framework disclosure and RFQ status
cache policy with:

```bash
npm run security:audit:live
```

`.github/workflows/production-health.yml` runs this check every six hours and can also be started
manually from GitHub Actions. It fails when the production RFQ configuration is no longer ready or
when the live SEO audit finds a blocking route, metadata, sitemap, robots, redirect, structured-data
or internal-link problem, or when required production security headers regress. Search Console and
GA4 configuration reminders remain non-blocking.

The live audit verifies HTTP status, redirects, title length, meta descriptions, canonical URLs,
English language markup, one H1 per HTML page, indexability, Open Graph metadata, Twitter cards,
required JSON-LD types, Product rich-result safety, same-page fragment links, image `alt`/`src`
attributes, sitemap `lastmod` values, every sitemap product image, filtered catalog `noindex`,
robots.txt, download indexing headers, legacy category redirects and crawlable internal links to
every sitemap URL. Retired product redirects and buyer-tool download indexing headers are checked
as well. It also reports whether an HTML Search Console verification tag is present and
whether GA4 is configured. An absent HTML tag is only a reminder to confirm DNS-based ownership
verification separately. Audit a local or preview deployment while still requiring production
canonical URLs with:

```bash
npm run seo:audit:live -- --fetch-base-url=http://localhost:3000
```

Configure in Vercel only after the accounts are ready:

```bash
GOOGLE_SITE_VERIFICATION=your-google-site-verification-token
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

When `NEXT_PUBLIC_GA_ID` is configured, the Google tag is not loaded until the visitor explicitly
allows optional analytics. Analytics consent is stored locally and can be changed on `/privacy`.
Advertising storage, ad user data and ad personalization remain denied.

- Sanitized SPA page views without URL query strings.
- Product views: `view_item`.
- Product search result summaries: `product_catalog_search`.
- RFQ validation, start, error and success events: `rfq_validation_error`, `rfq_submit_start`,
  `rfq_submit_error`, `rfq_submit_success`.
- GA4 recommended lead event after a successful RFQ: `generate_lead`.
- Email link clicks: `contact_email_click`.
- WhatsApp link clicks: `contact_whatsapp_click`.
- RFQ link clicks: `rfq_link_click`.
- Catalog and buyer-tool clicks: `catalog_download_click`, `buyer_tool_download_click`.

Tracked contact, RFQ and download link events include a non-personal `link_placement` value such as
`header`, `footer`, `sticky_contact`, `navigation`, `sidebar` or `page_content`. This supports CTA
placement analysis without sending link text, email subjects, product requirements or buyer data.

Visitor names, company names, countries, email addresses, telephone or WhatsApp numbers, messages,
uploaded file names, search text and raw campaign values are not sent to analytics. After creating
the GA4 data stream:

1. Mark `generate_lead` as a key event.
2. Do not assign a lead value or currency until a real internal lead-value policy exists.
3. In Enhanced Measurement, avoid browser-history page-view tracking because the application sends
   sanitized SPA page views itself.
4. Verify one `page_view` per navigation and one `generate_lead` per successful RFQ in DebugView.

Submit `https://www.arcfortweld.com/sitemap.xml` in Google Search Console after domain verification.
The sitemap includes stable `lastmod` values for every indexable URL and includes only reviewed
product images in image sitemap entries. Category, application and buyer-guide metadata uses a
relevant reviewed product image when one is available.

Product and category pages also expose visible section navigation with stable fragment IDs. Keep
these IDs stable when redesigning long pages so external links and search-result section links do
not break.

Update `contentLastModified` in `lib/content/site.ts` only after a significant public content
change. Product URLs use the later of `productTemplateLastModified` and each record's
`verifiedDate`; never generate a changing build-time date for sitemap entries.

For IndexNow-compatible search engines, the repository includes a public key file and a submission
script. After deployment, run:

```bash
npm run indexing:submit -- --dry-run
npm run indexing:submit
```

See `docs/search-indexing-submission.md` for the full indexing workflow.

## Buyer Download Files

The `/downloads` page provides buyer-facing CSV files that help distributors and importers prepare
RFQ information.

Generated public files:

- `public/downloads/arcfort-distributor-sourcing-guide.pdf` - four-page English distributor guide
  covering product scope, sourcing workflow, confirmed trade terms and an RFQ checklist
- `public/downloads/renqiu-ailesen-welding-catalog.pdf` - compressed website version of the Renqiu
  Ailesen welding product catalog for buyer download
- `public/downloads/arcfort-public-product-list.csv` - active product list with SKU, product URL
  and RFQ-ready sourcing notes
- `public/downloads/arcfort-rfq-template.csv` - buyer worksheet for product list quotation requests
- `public/downloads/arcfort-distributor-rfq-workbook.xlsx` - four-tab distributor workbook for
  buyer profile, mixed SKU lines, trial and repeat quantities, packing requirements, evidence files
  and supplier-review status
- `public/downloads/arcfort-oem-project-brief.xlsx` - four-tab OEM project workbook for buyer,
  product-line, packaging, artwork and evidence-file preparation
- `public/downloads/arcfort-plasma-consumables-rfq.xlsx` - four-tab plasma consumables workbook for
  torch references, consumable line items, quantities, evidence files and compatibility review
- `public/downloads/arcfort-welding-machine-rfq.xlsx` - four-tab welding equipment workbook for
  buyer requirements, supplier confirmation, accessories, market documents and order approval
- `public/downloads/arcfort-tig-torch-switch-identification.csv` - switch, handle, control-lead and
  connector evidence worksheet for TIG torch switch replacement review

Refresh the files after SKU updates:

```bash
npm run downloads:generate
```

The public product list must not expose internal notes, private supplier references, prices,
unconfirmed certifications or hidden SKU workflow fields.

The OEM project brief is a buyer-completed preparation file. Its readiness summary uses workbook
formulas, and its product, model, size, rating, certification and compatibility fields must remain
buyer-provided or evidence-based. Do not prefill unverified technical claims.

The plasma consumables RFQ workbook follows the same evidence-first rule. Buyers should enter one
electrode, nozzle, swirl ring, retaining cap, shield, spacer or kit per line, link each line to an
evidence ID, and use `Reference only`, `Unverified` or `Supplier review required` when fit is not
documented. The workbook can be uploaded directly through the production RFQ form.

The welding machine RFQ workbook separates the buyer's process, application and destination
electrical requirements from the supplier's proposed configuration and supporting evidence. Exact
output, duty cycle, interfaces, certification and other technical fields must remain buyer-provided
or supplier-confirmed for the quoted machine. The workbook can be uploaded directly through the RFQ
form with nameplate photos, approved specifications or reference documents.

The distributor RFQ workbook is intended for mixed product ranges and larger SKU lists. It keeps
buyer-provided current references separate from supplier-confirmed fit, uses evidence IDs to connect
photos or drawings to line items, and separates trial quantities from expected repeat purchasing.
Upload the completed workbook through the RFQ form with the referenced evidence files.

High-value products can add a dedicated buying profile in
`lib/content/product-buying-profiles.ts`. A profile supplies product-specific selection variables,
evidence checks, RFQ fields, FAQs and an optional buyer download without adding unconfirmed technical
values to the core SKU record. The Wire Feeder profile is the first implementation and reuses the
welding machine RFQ workbook for power-source, interface, accessory and approval review.

When a published SKU is found to have insufficient product evidence, change it to `draft` in the
source CSV and add a permanent redirect from its former product URL to the closest evidence-based
category or buyer guide. The TIG Torch Switch route follows this workflow: its previous catalog crop
showed a normal torch cable termination rather than a dedicated switch, so the route now leads to a
switch replacement and compatibility guide with a downloadable identification worksheet.

## Distributor Promotion Workflow

The first measurable promotion campaign targets relevant welding and cutting product distributors,
importers and wholesalers. Campaign definitions are stored in `data/promotion/campaigns.csv`; the
generated UTM links are stored in `docs/promotion/campaign-links.csv`.

Generate and verify promotion links with:

```bash
npm run promotion:links
npm run promotion:prospects
npm run promotion:wave
npm run promotion:check
npm run promotion:test
```

The English campaign assets are:

- `public/downloads/arcfort-distributor-sourcing-guide.pdf` - published buyer download
- `scripts/generate-distributor-guide.py` - reproducible PDF source using ReportLab and Pillow
- `docs/promotion/distributor-campaign-playbook.md` - audience, channel, measurement and publishing workflow
- `docs/promotion/outreach-templates.md` - targeted email, permission-based WhatsApp, LinkedIn and directory copy
- `docs/promotion/content-calendar.csv` - four-week channel sequence
- `docs/promotion/social-preview-asset.md` - distributor social-image source, usage limits and validation
- `docs/promotion/distributor-prospect-research.csv` - verified public-company research with official source and contact URLs
- `docs/promotion/prospect-qualification-guide.md` - qualification, status, privacy and manual outreach rules
- `data/promotion/outreach-wave-01.csv` - five-company Oceania test batch mapped to verified sources and campaign links
- `docs/promotion/outreach-wave-01.md` - company-specific drafts for manual review and sending only
- `data/promotion/outreach-wave-02.csv` - five-company South Africa, UK and Canada test batch
- `docs/promotion/outreach-wave-02.md` - second-wave company-specific drafts for manual review only
- `data/promotion/outreach-wave-03.csv` - five-company United Arab Emirates test batch
- `docs/promotion/outreach-wave-03.md` - third-wave company-specific drafts for manual review only
- `data/promotion/outreach-wave-04.csv` - five-company Saudi Arabia industrial supplier batch
- `docs/promotion/outreach-wave-04.md` - fourth-wave company-specific drafts for manual review only

Only allowlisted UTM fields are retained in GA4 page locations; unrelated query parameters are
discarded. RFQ lead attribution applies the same campaign-value rules and stores only the entry path
and external referrer origin. Do not put buyer personal data in UTM parameters or analytics events.
Outreach must be relevant, identified and manually reviewed; the repository does not automate unsolicited messages.
`npm run promotion:test` also verifies that the RFQ conversion funnel keeps its form-start,
submission, lead, contact and buyer-download events, and that the form-start event contains no buyer
PII or inquiry content.

The prospect research file is not a customer or partner list. It must contain company-level public
information only. Recheck each official website before contact, use small manually reviewed batches,
keep correspondence outside Git and honor opt-out requests. `npm run promotion:prospects` validates
the schema, official-domain URLs, campaign IDs, statuses and accidental contact data.

The four outreach waves contain twenty unique company-level drafts and are not an automated sending
system. Run `npm run promotion:wave`, reopen every official evidence page, approve each message
manually and use only the company's published business inquiry route. Keep replies and contact
records in a private sales system rather than Git.

Use the private `arcfort-outreach-tracker.xlsx` workbook for daily execution. It consolidates the
twenty official contact routes, evidence sources, product angles and UTM links, then calculates review,
send, reply, follow-up and qualified-inquiry metrics from editable status fields. The workbook belongs
under the ignored `outputs/` directory and must never be committed after buyer responses are added.
Initial zero values mean the drafts have not been sent; they are not campaign-performance results.

The distributor landing page and Contact page embed the same production RFQ form used by `/rfq`, so
buyers can submit a product list without an extra page transition. The form keeps attachment,
validation, BotID, email delivery and failure-fallback behavior. Conversion events include only the
controlled `form_placement` value (`distributor_landing`, `contact_page` or `rfq_page`) and never
buyer PII.

The distributor landing page has route-specific 1200 x 630 Open Graph and Twitter images. Shared
site chrome, visual category codes, product-image labels and repeated card actions use static
`data-nosnippet` regions so Google can build cleaner result snippets from the page's primary B2B
content. After each build, run:

```bash
npm run seo:snippets
```

## Useful Documents

- `AGENTS.md` - permanent repository mission, workflow and evidence safeguards
- `docs/DESIGN_SYSTEM.md` - shared industrial brand tokens, layout and component standards
- `docs/CONTENT_RULES.md` - company, product, market, SEO and RFQ content rules
- `docs/QA_CHECKLIST.md` - visual, technical, mobile, data and release quality gates
- `docs/CHANGELOG_AI.md` - major Codex implementation decisions and unresolved issues
- `knowledge-base/decisions/2026-08-21-product-presentation-phase-2.md` - reusable Product Card,
  Product Grid and product-detail presentation decisions
- `knowledge-base/products/15ak-mig-mag-series.md` - evidence scope, governed products and missing
  data for the 15AK series
- `knowledge-base/products/15ak-component-evidence.md` - separate air-valve and standard 15AK
  catalog component matrices, factory-confirmation queues and publication gates
- `knowledge-base/compatibility/15ak-reference-mapping.md` - rules for reference and confirmed 15AK
  compatibility relationships
- `knowledge-base/products/mig-mag-series-evidence-registry.md` - reviewed company-catalog MIG/MAG
  series sources and publication boundaries
- `knowledge-base/products/24kd-series-evidence.md` - field-level 24KD catalog evidence, data
  conflicts, candidate intake and publication boundary
- `knowledge-base/products/25ak-series-evidence.md` - field-level 25AK catalog evidence, data
  conflicts, candidate intake and publication boundary
- `knowledge-base/products/36kd-series-evidence.md` - field-level 36KD catalog evidence, external and
  internal source conflicts, candidate intake and publication boundary
- `knowledge-base/products/40kd-series-evidence.md` - field-level 40KD catalog evidence, rating and
  duty-cycle conflicts, candidate intake and publication boundary
- `knowledge-base/products/501d-series-evidence.md` - field-level 501D water-cooled evidence, media
  connection governance, source conflicts, candidate intake and publication boundary
- `knowledge-base/products/602-series-evidence.md` - blocked 501D/602 catalog identity conflict,
  field-level 602 candidates, water-cooled interface controls and evidence requirements
- `knowledge-base/compatibility/mig-mag-series-publication-gate.md` - reusable rules for converting a
  catalog family into governed public product relationships
- `knowledge-base/compatibility/compatibility-registry.md` - relationship model, confirmation evidence
  and current 15AK status
- `knowledge-base/technical/15ak-technical-evidence-workflow.md` - field-level confirmation and
  company-owned image intake process
- `docs/operations/15ak-factory-evidence-handoff.md` - low-friction workbook handoff and controlled
  review process for 15AK technical facts, image evidence and P0 provenance decisions
- `docs/operations/mig-mag-series-evidence-handoff.md` - combined 24KD, 25AK, 36KD, 40KD, 501D and
  blocked 602 factory-review workbook boundary, conflict handling and controlled repository
  reconciliation
- `docs/operations/airtable-15ak-evidence-intake.md` - private Airtable intake boundary, verified
  table scope and controlled repository transfer procedure
- `data/evidence/local-product-image-triage.csv` - canonical review states for unassigned local
  product-image candidates, including source, rights and exact-match gates
- `knowledge-base/assets/p0-repository-image-lineage.md` - reproducible Git-blob evidence linking
  four P0 public assets to repository copies without implying ownership, rights or exact-SKU identity
- `knowledge-base/decisions/2026-08-25-airtable-evidence-intake-boundary.md` - decision record keeping
  cloud evidence collection non-authoritative and repository publication canonical
- `docs/product-technical-evidence-report.md` - current technical-fact and 15AK evidence readiness
- `supabase/rfq-schema.sql` - RFQ table and private attachment bucket setup
- `docs/supabase-rfq-setup.md` - Supabase, Vercel and testing instructions
- `docs/rfq-email-delivery.md` - Resend email delivery setup for RFQ notifications and attachments
- `docs/rfq-production-readiness.md` - production RFQ email setup, Vercel environment variables and live test checklist
- `docs/sales/rfq-response-playbook.md` - manual RFQ qualification, reply templates and quotation checks
- `docs/performance-baseline.md` - measured mobile baseline, methodology and enforced build budgets
- `docs/launch-checklist.md` - production launch checklist
- `docs/arcfort-product-information-table.csv` - 12-product B2B information table with missing data notes
- `docs/product-image-checklist.csv` - legacy starter-product image planning worksheet
- `docs/first-30-sku-image-checklist.csv` - original first-30-SKU image planning worksheet
- `docs/product-image-tasks.csv` - generated product-image evidence queue covering provenance,
  rights, exact-SKU matching, resolution, replacement priority and capture guidance
- `docs/representative-product-image-notes.md` - representative product-family image usage notes
- `docs/product-readiness-report.md` - generated product data, image and confirmation status checklist
- `docs/product-series-readiness-report.md` - generated catalog-series evidence, publication and
  missing-data checklist
- `docs/product-series-component-evidence-report.md` - generated detailed-series component matrices,
  conflicts, factory confirmation and image-intake status
- `docs/compatibility-readiness-report.md` - generated relationship status and confirmation-evidence
  checklist
- `docs/acquisition-readiness-report.md` - generated acquisition-channel, RFQ, product-evidence, content-coverage and external-confirmation report
- `docs/operations/acquisition-production-evidence.json` - non-sensitive production, mailbox, Search Console, analytics and security evidence states used by the acquisition report
- `docs/site-wide-upgrade-roadmap.md` - phased roadmap for improving page quality, SEO and RFQ conversion
- `docs/product-image-shooting-guide.md` - product photo shooting and editing guide
- `docs/catalog-product-data-audit.md` - Renqiu Ailesen PDF catalog review notes and imported product-family evidence
- `docs/product-image-source-audit.md` - temporary product image source notes for catalog-derived SKU pages
- `docs/missing-product-data-supplement.csv` - missing data worksheet for product pages
- `docs/production-missing-data-supplement.md` - production missing data priority and RFQ backend notes
- `docs/search-indexing-submission.md` - Google Search Console and IndexNow submission workflow
- `docs/seo/search-console-baseline-2026-08-12.md` - Search Console baseline, prioritized pages and 28-day measurement plan
- `docs/promotion/distributor-campaign-playbook.md` - first distributor campaign workflow and measurement plan
- `docs/promotion/outreach-templates.md` - compliant distributor outreach copy
- `docs/sku-template-guide.md` - SKU template filling guide and first batch recommendation
- `docs/first-30-sku-preparation.md` - first 30 SKU worksheet workflow and data confirmation guide
- `docs/product-data-workflow.md` - product CSV workflow and validation rules
- `supabase/product-catalog-schema.sql` - blocked historical schema prototype; do not apply
- `docs/supabase-product-catalog-setup.md` - redirect to the governed Product Intelligence runbook

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run checks:

```bash
npm run lint
npm run typecheck
npm run products:validate
npm run products:check-images
npm run products:image-tasks
npm run products:report
npm run acquisition:report
npm run seo:audit
npm run test:rfq
npm run downloads:generate
npm run indexing:submit -- --dry-run
```

Pull requests and pushes to `main` run the same product, image, SEO, RFQ, lint, type and production
build checks through `.github/workflows/quality.yml`.

## Notes

- No real API keys or secrets are included.
- `app/sitemap.ts` and `app/robots.ts` are included for search engine discovery.
- Product and category pages include SEO metadata and JSON-LD structured data where appropriate.
- Product detail pages currently use BreadcrumbList and FAQPage structured data only. Product rich
  result markup is disabled until real public offer, review or aggregate rating data is available.
- Analytics and Search Console verification are environment-driven and should not be hardcoded.
- Confirm real product images, final SKU codes and exact product specifications before scaling
  product pages.
