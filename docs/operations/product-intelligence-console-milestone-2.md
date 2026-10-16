# Product Intelligence Console - Milestone 2 Implementation

Date: 2026-09-03; real-owner browser acceptance update: 2026-09-08.
Status: PASS_WITH_WARNINGS for the local, staging-backed read-only M2 scope. Owner onboarding and
authenticated acceptance are complete. External HTTPS deployment and full V1 are not complete.

## Scope And Authority

The owner approved M2-A/B/C/D/E. Destination: existing PR #130 and staging
`fdsvzuqixppsakukkrsf` only. Subsequent scoped approval covers staging Auth SMTP and the explicitly
chosen first owner mailbox. No merge, production deployment, paid service, product publication,
product evidence mutation or public source-of-truth cutover occurred.

## Implemented Locally

- Independent public and private route layouts, preserving public content/URLs. Public social-image
  files remain at their original path to avoid Next route-group hashing of their endpoint names.
- Disabled-by-default, exact-origin, non-production Console configuration. Import write guard and
  service key must be absent from the Console process.
- Official cookie-aware Supabase SSR clients, server-confirmed user checks, current non-revoked
  database roles, application authorization and caller-session RLS. No client role claims are trusted.
- Login, logout, recovery, explicit invite confirmation and owner-set password handlers. No public
  registration, role-management API or automatic owner grant.
- Read-only dashboard, paginated products, series/component candidates, technical evidence and
  readiness blockers. Counts retain their true scope; no mock success on a failed database read.
- Minimal column selections exclude raw snapshots, internal notes, audit payloads and private paths.
- No-store/noindex/private Console responses, no public analytics/attribution and no cached client
  navigation. Existing RFQ endpoints, BotID, redirects and public security headers are retained.

## Hosted Configuration - 2026-09-06 Snapshot

The initial 2026-09-03 three-field Auth patch used complete Management API readback. Later SMTP
configuration used the CLI; distinguish these evidence scopes. Latest recorded state:

| Setting                    | Result                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| Project                    | `fdsvzuqixppsakukkrsf`, expected name/organization/region, `ACTIVE_HEALTHY`                       |
| Signup                     | Disabled                                                                                          |
| Email confirmation         | Required; auto-confirmation remains off                                                           |
| Anonymous sign-in          | Off                                                                                               |
| Site URL                   | `http://127.0.0.1:3000`                                                                           |
| Redirect allowlist         | Exact `/console/auth/callback` and `/console/auth/confirm` under that origin                      |
| Custom SMTP                | Separate approved Resend SMTP, configured 2026-09-05                                              |
| Hosted email templates     | Repository invitation/recovery templates installed                                                |
| Accounts/roles/invitations | Owner approved a replacement login mailbox on 2026-09-06; new invitation delivered; no role grant |

The initial default-provider template rejection (HTTP 400) changed nothing; a reduced three-field
patch succeeded. Later approved SMTP setup, CLI default drift, explicit correction and projected
configuration reconciliation are recorded in the [mail runbook](console-staging-auth-smtp.md).
Resend reported delivery for the original and approved replacement invitation, one per mailbox;
neither is owner inbox/login evidence. Local/CI config
is collector-only; a separate non-loaded staging snapshot records hosted policy. Do not upgrade
billing, reuse RFQ credentials or run broad config pushes to bypass a remaining gate.

## Validation Evidence

- Local config/origin/body-limit/filter/access/layout unit checks passed.
- Typecheck and lint passed. The production build passed with 92 generated pages and every Console
  route remaining dynamic; public distributor social-image endpoints retained their original URLs.
- Company, distributor, quality, trade terms, search, attribution and all three RFQ tests passed.
- SEO audit retained 40 indexable product pages, six categories, six applications and 17 guides.
- Built internal-link audit passed across 80 HTML pages and two dynamic source pages.
- Performance gates retained their original budgets and passed after including the public group
  layout/error assets. Homepage JavaScript was 126.7 KiB against 140 KiB; shared CSS 9.8 KiB/15 KiB.
- Isolated real Auth/RLS/session/role-revocation/DTO tests and a 1,103-row pagination fixture passed
  in final GitHub Actions run `33815534865` at commit `44f1ee9`. They run after M1's two imports in
  disposable CI, never against hosted staging. Synthetic accounts and records were discarded with
  that stack.
- Loopback HTTP checks passed for private headers, unauthenticated catalog-payload exclusion,
  cross-origin POST rejection, public shells/canonicals, sitemap/robots and both social-image routes.
- Browser checks passed at 360, 390, 768 and 1440 CSS pixels for the login/recovery experience,
  anonymous protected-route behavior and retained public homepage/contact content. Inputs remain at
  least 44 pixels high and tested pages had no horizontal overflow.
- Exact-candidate run `33998964482` passed quality and isolated database jobs at `f906f3c8`, including
  the new pre-start local mail isolation guard and all existing database/Auth gates.
- Full owner login/inbox and authenticated responsive browser checks remain pending.

## Files And Contracts

- `app/layout.tsx`, `app/(public)/`, `components/content/PublicNotFound.tsx`: public shell isolation
  and URL-preserving physical moves; contact/distributor RFQ component imports adjusted.
- `app/(console)/console/`: layouts, pages, auth handlers, loading/error/not-found and scoped CSS.
- `components/console/`: auth panel, full-document links, tables, status, pagination and history guard.
- `lib/console/`: destination config, request security, SSR client, access checks and read-only queries.
- `middleware.ts`, `next.config.ts`, `app/robots.ts`: Console-only session refresh/privacy headers and
  indexing exclusion. Public `app/sitemap.ts` and RFQ API source remain unchanged.
- `supabase/config.toml`, `supabase/templates/`: local collector and shared invitation/recovery HTML.
  `supabase/config.staging.toml`: non-loaded hosted reference; not a deployment input.
- `.env.example`, `package.json`, `package-lock.json`: environment names, SDK versions and tests.
- `scripts/console/test-console-boundaries.ts`, `test-console-isolated.ts`, `test-console-http.ts`,
  `.github/workflows/quality.yml`: unit, loopback HTTP and disposable database checks, preserving all
  existing M1 CI gates.
- Nine existing public source-path test/audit files and `scripts/check-performance-budget.ts`:
  route-group-aware paths with unchanged assertions/budgets.
- `README.md`, Goal/design documents, M2 plan, dated decision and AI change log: implementation,
  approval, operator handoff and known blockers. Earlier uncommitted M1 completion documents retained.

## Remaining Gates - Historical 2026-09-06 Snapshot

The owner/browser blockers below are superseded by the dated acceptance record that follows.
Retain this snapshot as historical evidence, not instructions to repeat onboarding.

1. The owner has approved distinct staging SMTP and a replacement login mailbox, recorded in the
   mail runbook. Actual mailbox receipt, owner-set password and login still require their interaction.
2. The invitation has provider-reported delivery; do not treat it as verified inbox/login evidence.
3. Verified replacement account identity followed by exactly one intended owner role. The prior
   unconfirmed account must remain unchanged and unprivileged.
4. Real authenticated browser checks. Candidate-specific isolated CI is complete.
5. Existing dependency audit reports seven advisories (six high, one moderate) in non-Supabase
   dependency chains. No force upgrade was applied. Review these before any production release.
6. Full V1 editing, verification, publishing and the real 15AK pilot belong to later milestones.

M2 activation/exit remains BLOCKED on the real onboarding gates. This is not a claim that the
production website was changed or that the full operating-system goal is complete.

## 2026-09-08 Real-Owner Browser Acceptance

**Candidate:** `5021ae265b4c471957650435d011b61508c0274f`, branch
`codex/v2-industrial-brand-system`, existing PR #130. The local application uses only the public
staging key and caller session against `fdsvzuqixppsakukkrsf`; importer writes remain disabled.
Public pages still read repository data. No account/role/provider changes or product mutations were
performed during this acceptance batch. Sign Out ended only the current browser session.

The owner confirmed seeing the Overview. The same real authenticated browser then demonstrated the
following, without injecting a session, inspecting credentials or using a service-role client:

| Check                        | Observed result                                                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview                     | Owner navigation; 43 SKU/shadow records, zero Console-published/verified/ready records; 40 legacy active website records shown separately                  |
| Product pagination           | Page 1 has 25 records, page 2 has 18; 43 unique SKUs and no overlap                                                                                        |
| SKU search/detail            | `AF-MIG-CT-0004` returns one matching record and opens its real detail, source evidence, media, compatibility and packaging tables                         |
| Product-name/category search | Ceramic search returns the two ceramic-cup records; TIG category returns the same two TIG records                                                          |
| Empty/clear/lifecycle        | No-match query shows zero records and a clear empty state; Clear restores 43; VERIFIED filter returns zero                                                 |
| Series                       | Ten reference groups; 602 detail has 23 component candidates and retains DATA_CONFLICT / blocked, not publishable status                                   |
| Technical evidence           | DATA_CONFLICT filter returns 14 rows, all explicitly marked as conflicts; total overview retains 586 values awaiting factory confirmation                  |
| Readiness                    | Missing eligible main-image filter returns 43 SKUs; unresolved compatibility filter returns four SKUs                                                      |
| Image evidence               | Inspected product reference image loads at 750 x 750; legacy/family/reference and unresolved-rights labels are retained                                    |
| Responsive                   | Product-detail document has no horizontal overflow at 360, 390, 768, 1024, 1280 and 1440 CSS pixels; tables scroll inside their own regions                |
| Interaction                  | At 390px search/select/submit controls are 44px high; 360px technical table accepts keyboard focus, visible outline and ArrowRight scrolling               |
| Logout isolation             | Sign Out returns to login; Back, reload and direct navigation to the previously visited product detail return to unauthenticated login with no SKU visible |

Screenshots were visually inspected for desktop Overview, 360px detail, 768px technical evidence
and 390px filters. These are responsive browser observations, not a physical-phone or exhaustive
assistive-technology certification. Viewport overrides were reset. A local service interruption was
recovered using the same reviewed loopback launcher before resuming; no new invitation or role grant
was needed. The normal login page remains available for the owner's next session.

### Validation Scope

- Fresh local `console:http:test` passed: private/noindex/no-store responses, unauthenticated payload
  exclusion, CSRF/native-form origin and staging-host isolation, retained public shell/social images.
- Fresh local `console:boundaries:test` passed: mail isolation, config, origin, forms, filters,
  authorization and layout contracts.
- Exact-candidate [CI run 34083109446](https://github.com/18803076512/arcfort-website/actions/runs/34083109446)
  was read back as successful for both `quality` and `product-intelligence-database`. This is the
  existing run at the candidate above, not a new run triggered by browser QA. It includes build,
  lint, typecheck, public SEO/RFQ/performance checks and disposable database/Auth/RLS/revocation/
  two-session/1,103-row pagination checks.
- Hosted owner permission was not revoked for testing. Expired/tampered/no-role and cross-session
  cases retain isolated CI evidence; they are not claimed as additional hosted-account mutations.
- Only documentation changed after acceptance; Prettier, `git diff --check` and `security:secrets`
  passed for the final documentation delta. No fresh full build is implied for unchanged runtime code.

### Result And Remaining Boundaries

**PASS_WITH_WARNINGS: local staging-backed read-only M2 acceptance.** Email confirmation,
owner-set/password-login evidence, the exact audited owner grant and actual authenticated browser
checks are now complete. Do not repeat those setup operations.

- All 43 SKUs still lack an eligible exact-product main image; 14 technical values conflict and 586
  need factory confirmation. These are correctly exposed diagnostic blockers, not permission to
  publish. Four SKU compatibility relationships remain unconfirmed.
- Dense source-evidence tables remain vertically long on narrow phones. Focus and horizontal
  scrolling work; a future scoped evidence-panel improvement can reduce reading effort without
  hiding provenance or changing facts.
- The earlier dependency audit recorded seven advisories (six high, one moderate); that inventory
  was not refreshed or remediated here. A production release needs a fresh scoped security review.
- The external HTTPS/mobile entrance remains disabled and undeployed. No merge, production
  deployment, public-source cutover, product editing or publication occurred.
- Full V1 still requires later milestones and a real 15AK evidence pilot. The next recommended
  action is a bounded M3 draft-editing/evidence-intake plan with an explicit shadow-import authority
  and approval boundary; do not start product publishing under this acceptance result.
