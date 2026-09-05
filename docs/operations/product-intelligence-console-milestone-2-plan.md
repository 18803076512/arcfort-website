# Product Intelligence Console V1 - Milestone 2 Plan

Date: 2026-09-03
Status: M2-A through M2-E approved; local technical candidate verified in GitHub Actions run
`33815534865`. Real owner onboarding and M2 activation remain pending.
The first administrator mailbox has not yet been named. Invitation, verified account handoff and
role assignment remain pending; the public business mailbox is not assumed to be the login mailbox.

## Objective And Scope

Deliver an invite-only, role-aware Console at `/console` with a real dashboard and read-only
product, series and evidence screens. This is the next controlled batch toward the full Console V1,
not a replacement for the later editing, verification, publishing and 15AK pilot milestones.

The [approved architecture](../product-intelligence-console-v1-architecture.md) and
[M1 phase decision](../../knowledge-base/decisions/2026-08-30-product-intelligence-console-v1-foundation.md)
remain authoritative. M1's runtime gates passed in the
[exact authorized staging project](product-intelligence-console-milestone-1.md#hosted-milestone-1-completion---2026-09-03).
No approval for M2 account creation, Auth settings, production access or publication is inferred
from M1's migration/import authorization. The owner's subsequent explicit confirmation authorizes
the M2 defaults below, not a production merge, deployment, publication or paid service.

## Initial Evidence At Planning Time

Inspected runtime: `4518b885ad0971533c4408fee216b5bec2a4ebaf` on
`codex/v2-industrial-brand-system`, with the six local M1 completion documents preserved.

- Next.js `15.5.22`, App Router, React 19, TypeScript, Tailwind; no `/console`, Auth SDK or session
  middleware exists. Use the installed Next 15 conventions, not a copied Next 16 `proxy.ts` example.
- `app/layout.tsx` renders public metadata/JSON-LD, attribution, analytics, Header, Footer and sticky
  RFQ contacts for every route. A child Console layout alone cannot remove those ancestors.
- Public security headers, BotID and redirects live in `next.config.ts`; they must remain intact.
- `app/robots.ts` currently excludes `/api/` only; sitemap is generated from public repository data.
- M1 already provides `console_user_roles`, `pi_can_view_console`, forced RLS, generated database
  types, `pi_dashboard_metrics` and `pi_variant_readiness` with `security_invoker=true`.
- The hosted snapshot has 43 shadow products, 14 conflicting technical values and zero confirmed
  exact-SKU facts/compatibility/search-eligible media. There are no Console users or role assignments
  in the recorded M1 final audit. These are not 43 verified or Console-published products.

### Read-Only Hosted Auth Preflight

On 2026-09-03 an authenticated CLI lookup rechecked project `fdsvzuqixppsakukkrsf`, its name,
Singapore region, organization `xycjhlnlacqocitjkagq` and `ACTIVE_HEALTHY` status. A public client key
for that exact project was used only in memory for `GET /auth/v1/settings`. No Auth mutation,
signup attempt, invitation, password request, email or role grant occurred.

| Field                            | Observed value                | Meaning for M2                                                          |
| -------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `disable_signup`                 | `false`                       | Public signup is not disabled at the provider; block Console activation |
| `mailer_autoconfirm`             | `false`                       | Automatic email confirmation is off; retain this                        |
| `external.email`                 | `true`                        | Email authentication is enabled; delivery is not proven                 |
| `external.anonymous_users`       | `false`                       | Anonymous sign-ins are disabled                                         |
| Other enabled external providers | None returned                 | Do not enable OAuth/phone providers in this batch                       |
| SMTP configuration               | Not returned by this endpoint | Inspect separately; do not infer default/custom SMTP                    |
| Redirect allowlist               | Not returned by this endpoint | Inspect separately before changing or enabling callbacks                |

The local `supabase/config.toml` disables signup, but it is not proof of the hosted configuration.
An enabled signup setting is not evidence that anyone registered or obtained database access;
M1's RLS and the absence of active Console roles are separate controls.

## Recommended Decisions For Approval

| ID   | Recommended default                                                                       | Boundary                                                                                           |
| ---- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| M2-A | Implement locally, update existing PR #130 and run isolated CI                            | No merge, production deployment or production environment variables                                |
| M2-B | Separate public and Console server layouts with URL-preserving route groups               | Review the physical file moves and all source-based tests before changing files                    |
| M2-C | Configure invite-only Auth only in `fdsvzuqixppsakukkrsf`                                 | Disable signup, retain email confirmation, keep anonymous sign-ins off; exact local redirects only |
| M2-D | Use email/password after a provider-backed invitation; owner sets their own password      | Owner must name the first login mailbox; do not infer it from the business contact email           |
| M2-E | Grant only the named first user the existing `owner` role after verified account identity | No additional members, provider-team access, automatic role escalation or public user management   |

The recommended initial local origin is `http://127.0.0.1:3000`, matching the existing local Supabase
configuration. Confirm the actual available port before provider changes. Proposed exact callback
destinations are `/console/auth/callback` and `/console/auth/confirm` under that origin; use the
provider-supported invitation/recovery flow selected and tested during implementation. Do not add
wildcards, arbitrary `next` URLs, the public website domain or an unapproved Vercel hostname.

No new paid service or custom SMTP/DNS change is part of this approval. If the named mailbox cannot
receive the provider invitation under its actual SMTP configuration, stop and present the exact
delivery/setup gap. Do not reuse RFQ credentials, disable confirmation, auto-confirm the owner or
grant organization-team access to bypass delivery restrictions. Never request a password or token
in chat.

## Implementation Batches

### M2.1 - Layout And Privacy Boundary

Use a minimal common root layout for HTML/body, local fonts, neutral icons and global CSS. Move
public page UI into `app/(public)/` with a public layout holding the existing website shell,
marketing metadata, JSON-LD and trackers. Add `app/(console)/console/` with its own layout, title,
navigation, error/loading states and no public tracking or commercial CTA components.

This proposes a narrow adjustment to the architecture's advice not to move pages merely to introduce
groups: the reason here is server-rendered privacy isolation, not folder cosmetics. It requires
M2-B review before any move. Preserve every URL and all public page content. Keep `/api/rfq`,
`/api/rfq/status`, robots and sitemap at their existing endpoints. Review social-image routes,
error boundaries and not-found behavior explicitly. Do not solve layout selection by reading
request headers in the root and making every public page dynamic; do not CSS-hide the public shell.

Add private/no-store response handling and `X-Robots-Tag: noindex, nofollow` on every Console path,
including login, callback, errors and disabled states. Console metadata must not inherit the public
home canonical, Open Graph/product data or index directives. Add the Console exclusion to robots
and assert that sitemap stays unchanged. Robots/noindex are not authorization controls.

Only Console paths use session middleware. Public browsing and RFQ must not acquire an Auth
dependency, session-refresh latency or an expanded CSP. Console-origin outbound calls should be
server-side; do not add a broad Supabase browser origin or Realtime dependency for read-only pages.

### M2.2 - Authentication And Application Authorization

Use the official `@supabase/supabase-js` and `@supabase/ssr` packages behind small server wrappers.
Select and lock compatible versions during implementation. Do not hand-roll JWT verification or
session rotation. Prefer server actions/handlers for login, logout, invitation completion and
recovery; no business database credentials or access/refresh tokens may enter client DTOs.

Validate identity with the provider (`getUser` for a fresh server-confirmed user), then check current,
non-revoked database roles. Never authorize from an email match, a client-provided role, user-editable
metadata or the unvalidated user object returned by `getSession`. Memoization may be request-scoped
only. Every query/handler requires the access check; a layout redirect alone is insufficient.

Use the caller's session and a public client key for normal reads so RLS applies. Do not use the M1
service-role REST client for dashboard requests. Keep its write guard off and its key absent from
the Console runtime. The M2 config reader must be separate from enabling a shadow import.

Host-only cookies should be limited to the Console path where supported by the chosen SDK flow,
HttpOnly for the proposed server-only session design, SameSite and secure on HTTPS. Restrict HTTP
to the explicitly approved loopback origin. Test invite/recovery links, token refresh and cookie
propagation with the actual SDK; cookie flags must not be guessed from a mock.

Require same-origin checks and bounded input for login/logout/password mutations. Permit only local
Console return paths. Do not log passwords, auth codes, token hashes, session objects or provider
error bodies. Use generic credential failures and accessible retry guidance without account
enumeration. Preserve provider rate limits; do not claim distributed throttling from an in-memory
limiter. Test how invitation links behave with scanners/prefetch and never implement automatic
login or role grants from an email-query parameter.

Treat disabled config, invalid destination, expired session, missing/revoked role, unavailable Auth
and unavailable database as distinct internal states with non-sensitive UI. Fail closed instead of
showing the repository snapshot as if a live database read succeeded.

The feature must be off by default and rejected for production during M2. Configure only reviewed
local/staging origins. A successful local login is not approval to expose `/console` on production.

### M2.3 - Read-Only Console And Query Contracts

Planned initial routes:

| Route                     | Data and interaction                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `/console/login`          | Invited-user login, bounded error and recovery path; no signup control               |
| `/console`                | Redirect authorized users to dashboard; unauthorized users to login                  |
| `/console/dashboard`      | Governed metrics and linked blocker queues                                           |
| `/console/products`       | Server-side search, category/lifecycle/blocker filters, stable pagination            |
| `/console/products/[id]`  | SKU/identity, technical facts, source status, media/compatibility/packaging evidence |
| `/console/series`         | Series evidence and component counts, distinct from product SKUs                     |
| `/console/series/[id]`    | Family candidates and unresolved conflicts; no implied fit                           |
| `/console/technical-data` | Field-level unresolved/conflict list, linked to the correct subject                  |

All current active Console roles can use these read-only views. Role-aware UI must not invent
editing/publication capabilities in M2. Read-only describes the new application surface, not a
claim that an existing database `owner` credential has no mutation permissions. Existing RLS role
and lifecycle constraints remain authoritative; anonymous/no-role/viewer mutation denial needs
explicit tests.

Use `pi_dashboard_metrics` and `pi_variant_readiness` with the caller's RLS session. Show the
difference between 43 shadow records, 40 legacy active website products and zero Console-published
products. Show data conflicts as technical-value counts, not an invented count of bad SKUs.
Readiness is diagnostic; it must not approve or advance any lifecycle state.

Use explicit column selections and small server DTOs. Do not serialize `raw_snapshot`, imported
`raw_payload`, `notes_internal`, full audit before/after values, credentials or private file URLs.
Return identity, status and approved-to-view evidence context only. Display source references as
text or allowlisted links; never fetch a database-supplied URL automatically. Existing governed
public reference images may be shown with their evidence state, never promoted to exact/approved
imagery. Private originals/uploads/download signing belong to later scoped media work.

Validate search length, UUIDs, filter enums and page size; build queries through the SDK rather
than concatenating raw filter expressions. Bound result sets and use deterministic secondary ID
sorting. Test against a synthetic dataset larger than a page and the provider's default row cap;
43 current products are not evidence that 1,000+ rows paginate correctly.

Reuse site color/font tokens with a neutral operational canvas, compact headings, readable numeric
columns and restrained status labels. No hero, promotional cards, fake charts or inactive future
module links. Desktop gets a stable sidebar/table; mobile gets deliberate navigation, named row
fields and usable overflow regions. Never compress an entire technical table into tiny text.

### M2.4 - Real Validation And Owner Handoff

Run the existing quality gates and add focused auth/config/access/DTO/browser checks. Use synthetic
non-sensitive users and fixtures in isolated CI. Do not create or delete hosted test accounts under
the M1 authorization. The real staging owner login and role bootstrap need M2-C/D/E approval.

Prove invitation receipt, successful owner-set credentials, authorized page read, logout, expired
session handling and denied requests in a browser. Do not claim inbox delivery from API acceptance.
Use current hosted settings evidence before activation, not the local TOML or this proposal.

## Expected File Surface

The implementation surface and remaining acceptance evidence are tracked in
[the M2 implementation record](product-intelligence-console-milestone-2.md):

- `app/layout.tsx`, new public/Console group layouts, relocated public UI files, and new Console
  pages/handlers. Public slugs/content/API URLs remain unchanged.
- `middleware.ts` with a Console-only matcher; server Supabase session wrapper(s) under
  `lib/supabase/`, Console config/access/query/DTO modules under `lib/console/`.
- Reusable Console navigation/table/status/error components under `components/console/`; small
  scoped additions to global tokens only when existing tokens do not cover the operational surface.
- `next.config.ts`, `app/robots.ts`, sitemap/metadata isolation tests, environment-name-only examples,
  `package.json` and `package-lock.json` for the two justified SDK packages and test commands.
- Source-path consumers requiring reviewed updates if M2-B is approved:
  `scripts/audit-internal-links.ts`, `test-company-profile.ts`, `test-distributor-rfq-builder.ts`,
  `test-welding-machine-rfq-builder.ts`, `test-quality-control.ts`, `test-promotion-attribution.ts`,
  `test-oem-rfq-builder.ts`, `test-product-search.ts` and `test-export-order-terms.ts`.
  Recheck all source-path consumers before moving files; do not weaken assertions to hide moves.
- `.github/workflows/quality.yml` and new scoped test fixtures/harness. Preserve the existing
  isolated database reset, both 74-assertion paths, generated-type check and double shadow import.
- Documentation/knowledge/change log and the final exact-candidate QA evidence.

No new database migration is assumed. If a real query/security gap requires one, stop to review an
additive migration and obtain target-specific approval; never edit an already applied M1 migration.

## Acceptance Matrix

| Area             | Required evidence before M2 exit                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| Disabled feature | Missing/production/mismatched config exposes no Console data or client credential                             |
| Provider Auth    | Hosted signup disabled, anonymous sign-ins off, email confirmation retained, exact redirects reviewed         |
| Owner            | Explicit mailbox/identity handoff, real invitation receipt and login, one intended role assignment            |
| Access           | Anonymous, tampered/expired sessions, missing/revoked roles and direct handler/RSC requests denied            |
| Isolation        | Two sessions cannot read each other's cached response; logout/back/reload cannot expose stale private payload |
| RLS              | Application uses caller identity; no service key in page requests; viewer/no-role mutation denial proven      |
| Data             | Live reads match shadow source counts/statuses; failures do not masquerade as zero or mock successes          |
| Query UX         | Bounded input, filter/sort/page behavior and unknown-ID handling; large synthetic paging test                 |
| Privacy          | No raw payload/notes/private path/token in unauthenticated HTML, RSC, logs, analytics or shared caches        |
| Layout           | No public trackers/CTA shell on Console; public screenshots and page behavior remain unchanged                |
| Responsive       | Keyboard and 360/390/768/1440px browser checks; readable tables, focus and errors                             |
| SEO/RFQ          | Canonicals, 40 active product routes, public sitemap/robots, snippets, BotID and RFQ tests retained           |
| Quality          | Lint, typecheck, build, secrets, public performance budgets and focused M2 tests pass                         |
| Deployment       | Exact PR/preview approval and resulting state recorded; no production activation or data cutover              |

M2 is not complete from a screenshot, green unit tests, an Auth user row or a successful build alone.
Record each proof and any blocked item. Full V1 additionally requires M3-M6 and real 15AK evidence.

### Current Acceptance Status - 2026-09-04

The disabled-feature, provider-setting, access, RLS, data, query, privacy, public-layout, responsive,
SEO/RFQ and quality gates have candidate-specific evidence in the
[M2 implementation record](product-intelligence-console-milestone-2.md). Final run `33815534865`
passed both the public quality job and disposable database/Auth job at commit `44f1ee9`.

The owner and deployment rows remain open. No real mailbox has been named, no invitation received,
no hosted role assigned and no authenticated owner browser session verified. No merge, production
deployment, product publication or source cutover is authorized by the technical result.

### Onboarding Update - 2026-09-06

This supersedes the missing-mailbox/SMTP statements in the dated 2026-09-03/04 observations above
and the original inputs below. The owner chose `info@arcfortweld.com` and approved a separate
domain-limited Resend credential for staging Auth. SMTP/templates are configured, and one invitation
has provider-reported delivery. The account remained unconfirmed at the 2026-09-06 read-only check;
no role grant or real-owner browser verification has occurred. The owner gate remains open.

The [staging mail runbook](console-staging-auth-smtp.md) records CLI default drift and correction,
local/CI mail isolation, exact evidence limits and the remaining handoff. These actions do not
authorize production activation, a billing change or M3 product publishing.

## Rollback And Stop Conditions

Keep the Console feature disabled until checks pass. Public pages retain their Git-backed source
and do not depend on Supabase availability. Stop on unexpected target identity, accounts, scope,
credentials, data drift or failed authorization tests. Do not reset the database or rerun the M1
import to conceal a UI/query problem.

On failure, stop activation and preserve audit state. Code rollback is a reviewed revert, not a
destructive worktree reset. Hosted Auth/role rollback requires a named owner and explicit action;
do not re-enable signup or delete accounts automatically. No product publication occurs in M2.

## Sources And Outstanding Inputs

Official references reviewed on 2026-09-03:

- [Supabase SSR client and session validation](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs):
  official SDK wrappers, verified identity and cookie refresh; adapt examples to installed Next 15.
- [Next.js authentication and authorization](https://nextjs.org/docs/app/guides/authentication):
  server-side data-access authorization and minimal DTO boundaries.
- [Next.js route groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups):
  layout organization without changing URL segments; public route parity still needs testing.
- [Supabase Auth SMTP](https://supabase.com/docs/guides/auth/auth-smtp): the default mail service has
  recipient restrictions and is not proof of general invitation delivery. The actual staging SMTP
  configuration has not been inspected and its suitability is unknown.

M2-A/B/C/D/E were approved on 2026-09-03; port 3000 was checked before provider updates. Owner inputs
still required: first owner login mailbox and a separate mail-service decision. The provider rejected
custom invite/recovery templates while using the Free-plan default mail provider. Signup closure and
the two exact loopback callbacks were applied independently; templates/SMTP/billing remain unchanged.
Do not send secrets in chat.
