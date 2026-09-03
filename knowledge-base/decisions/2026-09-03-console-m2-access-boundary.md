# Console M2 Access And Layout Boundary

Date: 2026-09-03
Status: Approved for local implementation and the specified staging Auth configuration; not production.

The owner explicitly confirmed M2-A through M2-E in the
[reviewed plan](../../docs/operations/product-intelligence-console-milestone-2-plan.md).
This extends the [M1 foundation decision](2026-08-30-product-intelligence-console-v1-foundation.md)
without changing public data authority, evidence status or publication permissions.

## Decisions

- Use URL-preserving route groups to remove the public root's analytics, attribution, metadata and
  sales shell from Console. This is privacy isolation, not a cosmetic site rewrite. Keep social-image
  files outside the group because Next 15 adds a group-derived metadata-image URL suffix otherwise.
- Keep the shared root 404 fallback neutral and use a public catch-all for the full public 404 shell.
  This prevents public analytics/schema/navigation component payloads from appearing in private
  Console responses while preserving the buyer-facing public not-found experience.
- Use official Supabase SSR/client packages and a public key with the caller's session. Normal reads
  must not use the M1 service-role importer. Each data function checks fresh identity/current roles;
  database RLS remains independently enforced. Public pages continue to read the Git-backed catalog.
- Keep full-document Console navigation and no-store responses to avoid a private client Router Cache
  becoming authority after revocation/logout. BFCache restoration reloads the document.
- Gate the local UI by exact loopback origin and reject Vercel in M2. Keep the feature off by default.
- Use `/console/readiness` as a separate paginated blocker queue alongside category/name/SKU/lifecycle
  product filters. This avoids fetching all records into memory or adding an unapproved SQL view.
- Do not assign the business mailbox as administrator without an explicit owner choice.

## Hosted Evidence

The target was revalidated as `fdsvzuqixppsakukkrsf`, `arcfort-product-intelligence-staging`,
organization `xycjhlnlacqocitjkagq`, Singapore, `ACTIVE_HEALTHY`.
The Management API rejected the combined Auth/template payload with HTTP 400 because custom
email-template modification is unavailable on the Free-plan default provider. Readback confirmed no
changes from those rejected attempts. No billing/SMTP workaround or credential expansion was made.

A reduced approved patch changed only `disable_signup`, `site_url` and `uri_allow_list`. Readback
confirmed signup disabled, `http://127.0.0.1:3000`, the two exact Console callback/confirm URLs,
confirmation retained and anonymous sign-ins disabled. Every other returned Auth field matched the
pre-write state, including templates and SMTP. No account, role or invitation was created.

Local invitation/recovery templates use provider token hashes and a user-initiated confirmation POST
so link scanning does not consume them. They are not installed on hosted staging. Do not replace
this with auto-confirmation, implicit-fragment handling or an owner grant merely to bypass the mail
gate. Request a separately scoped SMTP/delivery decision and the named owner mailbox first.

## Reversal

Disable Console locally to stop access; preserve the Git-backed public website. Revert code only
through reviewed Git changes. Do not restore open signup, delete accounts or reset staging as an
automatic rollback. No merge, production deployment, source cutover or product publishing is approved.
