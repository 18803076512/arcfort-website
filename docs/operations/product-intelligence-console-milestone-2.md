# Product Intelligence Console - Milestone 2 Implementation

Date: 2026-09-03; staging Auth mail update: 2026-09-06.
Status: Local candidate verified; real owner onboarding and M2 exit not complete.

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

## Hosted Configuration

The initial 2026-09-03 three-field Auth patch used complete Management API readback. Later SMTP
configuration used the CLI; distinguish these evidence scopes. Latest recorded state:

| Setting                    | Result                                                                       |
| -------------------------- | ---------------------------------------------------------------------------- |
| Project                    | `fdsvzuqixppsakukkrsf`, expected name/organization/region, `ACTIVE_HEALTHY`  |
| Signup                     | Disabled                                                                     |
| Email confirmation         | Required; auto-confirmation remains off                                      |
| Anonymous sign-in          | Off                                                                          |
| Site URL                   | `http://127.0.0.1:3000`                                                      |
| Redirect allowlist         | Exact `/console/auth/callback` and `/console/auth/confirm` under that origin |
| Custom SMTP                | Separate approved Resend SMTP, configured 2026-09-05                         |
| Hosted email templates     | Repository invitation/recovery templates installed                          |
| Accounts/roles/invitations | One named administrator invited; still unconfirmed on 2026-09-06; no role grant |

The initial default-provider template rejection (HTTP 400) changed nothing; a reduced three-field
patch succeeded. Later approved SMTP setup, CLI default drift, explicit correction and projected
configuration reconciliation are recorded in the [mail runbook](console-staging-auth-smtp.md).
Resend reported one invitation Delivered, which is not owner inbox/login evidence. Local/CI config
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

## Remaining Gates

1. The owner has selected `info@arcfortweld.com` and approved distinct staging SMTP. Actual mailbox
   receipt, owner-set password and login still require the owner's interaction.
2. The invitation has provider-reported delivery; do not treat it as verified inbox/login evidence.
3. Verified account identity followed by exactly one intended owner role; no additional accounts.
4. Real authenticated browser checks. Candidate-specific isolated CI is complete.
5. Existing dependency audit reports seven advisories (six high, one moderate) in non-Supabase
   dependency chains. No force upgrade was applied. Review these before any production release.
6. Full V1 editing, verification, publishing and the real 15AK pilot belong to later milestones.

M2 activation/exit remains BLOCKED on the real onboarding gates. This is not a claim that the
production website was changed or that the full operating-system goal is complete.
