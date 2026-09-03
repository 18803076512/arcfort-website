# Product Intelligence Console - Milestone 2 Implementation

Date: 2026-09-03
Status: Local implementation in review; real owner onboarding and M2 exit not complete.

## Scope And Authority

The owner approved M2-A/B/C/D/E. Destination: existing PR #130 and staging
`fdsvzuqixppsakukkrsf` only. No merge, production deployment, paid service, SMTP change, product
publication, product evidence mutation or public source-of-truth cutover occurred.

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

Direct Management API readback verified:

| Setting                    | Result                                                                       |
| -------------------------- | ---------------------------------------------------------------------------- |
| Project                    | `fdsvzuqixppsakukkrsf`, expected name/organization/region, `ACTIVE_HEALTHY`  |
| Signup                     | Disabled                                                                     |
| Email confirmation         | Required; auto-confirmation remains off                                      |
| Anonymous sign-in          | Off                                                                          |
| Site URL                   | `http://127.0.0.1:3000`                                                      |
| Redirect allowlist         | Exact `/console/auth/callback` and `/console/auth/confirm` under that origin |
| Custom SMTP                | Not configured                                                               |
| Hosted email templates     | Original default templates, unchanged                                        |
| Accounts/roles/invitations | None created by this task                                                    |

The provider rejected email-template modification on the Free-plan default mail provider with HTTP 400. The rejected requests changed nothing; a reduced three-field patch succeeded. All other Auth
fields were compared before/after and remained unchanged. Local templates are not proof of hosted
delivery. Do not enable SMTP, upgrade billing or reuse RFQ credentials without a separate decision.

## Validation In Progress

- Local config/origin/body-limit/filter/access/layout unit checks passed.
- Typecheck and lint passed; build passed before the final social-image path correction.
- Company, distributor, quality, trade terms, search, attribution and all three RFQ tests passed.
- SEO audit retained 40 indexable product pages, six categories, six applications and 17 guides.
- Built internal-link audit passed across 80 HTML pages and two dynamic source pages.
- Performance gates retained their original budgets and passed after including the public group
  layout/error assets. Homepage JavaScript was 126.7 KiB against 140 KiB; shared CSS 9.8 KiB/15 KiB.
- Added isolated real Auth/RLS/session/role-revocation/DTO tests and a 1,103-row pagination fixture.
  They run after M1's two imports in disposable CI, never against hosted staging. Results pending.
- Full owner login/inbox and authenticated responsive browser checks remain pending.

## Files And Contracts

- `app/layout.tsx`, `app/(public)/`, `components/content/PublicNotFound.tsx`: public shell isolation
  and URL-preserving physical moves; contact/distributor RFQ component imports adjusted.
- `app/(console)/console/`: layouts, pages, auth handlers, loading/error/not-found and scoped CSS.
- `components/console/`: auth panel, full-document links, tables, status, pagination and history guard.
- `lib/console/`: destination config, request security, SSR client, access checks and read-only queries.
- `middleware.ts`, `next.config.ts`, `app/robots.ts`: Console-only session refresh/privacy headers and
  indexing exclusion. Public `app/sitemap.ts` and RFQ API source remain unchanged.
- `supabase/config.toml`, `supabase/templates/`: local invitation/recovery configuration only.
- `.env.example`, `package.json`, `package-lock.json`: environment names, SDK versions and tests.
- `scripts/console/test-console-boundaries.ts`, `test-console-isolated.ts`, `.github/workflows/quality.yml`:
  unit and disposable database checks, preserving all existing M1 CI gates.
- Nine existing public source-path test/audit files and `scripts/check-performance-budget.ts`:
  route-group-aware paths with unchanged assertions/budgets.
- `README.md`, Goal/design documents, M2 plan, dated decision and AI change log: implementation,
  approval, operator handoff and known blockers. Earlier uncommitted M1 completion documents retained.

## Remaining Gates

1. Named first administrator mailbox. The business address is not assumed to be the login identity.
2. Approved mail-service resolution for the provider template restriction; actual receipt and
   owner-set password remain unverified. Do not invent success from API acceptance.
3. Verified account identity followed by exactly one intended owner role; no additional accounts.
4. Real authenticated browser checks and candidate-specific isolated CI completion.
5. Existing dependency audit reports seven advisories (six high, one moderate) in non-Supabase
   dependency chains. No force upgrade was applied. Review these before any production release.
6. Full V1 editing, verification, publishing and the real 15AK pilot belong to later milestones.

M2 activation/exit remains BLOCKED on the real onboarding gates. This is not a claim that the
production website was changed or that the full operating-system goal is complete.
