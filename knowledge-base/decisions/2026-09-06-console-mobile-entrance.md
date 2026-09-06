# Protected Mobile Console Entrance

Date: 2026-09-06
Status: Owner-approved outcome; local implementation candidate. External activation pending.

## Reason And Superseded Scope

The owner cannot use a PC loopback invitation URL from their phone. They explicitly approved a
protected HTTPS staging test entrance, with no production/RFQ changes, paid service or password
bypass. This supersedes **only** the loopback-only UI restriction in the
[M2 access decision](2026-09-03-console-m2-access-boundary.md) for a reviewed protected entrance.
It does not authorize arbitrary hosted origins, Vercel enablement, public product publishing or an
early owner grant. The [replacement mailbox decision](2026-09-06-console-owner-mailbox.md) remains.

## Selected Implementation

Prepare `console-staging.arcfortweld.com` behind Cloudflare Access and a named Tunnel to the existing
loopback Next.js runtime. Preserve Supabase verification and RLS, default-off behavior and the exact
staging project. Require independently verified Access JWTs and the one approved mailbox; do not
trust an email header or token decoding alone. Block public website/RFQ routes on the new hostname.

This reuses the tested Node/Next runtime without a hosting-platform migration or an unprotected
temporary tunnel. It does depend on the owner's PC staying online. A persistent hosted Console is a
separate operational decision, not an implied deliverable of the temporary M2 handoff.

## Approval And External Evidence

On inspection, the Cloudflare connector returned authentication error `10000` and the dashboard
showed a login screen. Account/plan/DNS/Access identity cannot yet be verified. No new resource,
account policy, DNS record, hosted Auth setting or invitation has been written. Confirm the exact
dedicated hostname/policy at provisioning; do not treat this candidate hostname as already live.
Existing apex/www/mail records and the public business mailbox remain unchanged.

## Reversal And Acceptance

Keep the origin feature disabled until the [mobile runbook](../../docs/operations/console-mobile-staging.md)
preflight and real HTTPS/Access checks pass. Stop the dedicated process/Tunnel to close the test
entrance; do not disable authentication or reset data. Record live resource IDs, approved destination,
exact code candidate and tests after actual activation. Password setup remains the owner's action.
