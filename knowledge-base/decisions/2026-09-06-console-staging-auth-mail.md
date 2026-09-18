# Staging Auth Mail Is Separate From Local Tests And Production RFQ

Date: 2026-09-06
Status: Approved staging mail setup; real-owner activation remains pending.

## Superseded Boundary

This updates only the missing-owner/mail-service gate in the
[2026-09-03 M2 access decision](2026-09-03-console-m2-access-boundary.md).
The owner subsequently selected `info@arcfortweld.com`, approved custom staging Auth SMTP and a
domain-limited Sending credential in Resend. The target remains `fdsvzuqixppsakukkrsf` only.
The old record describes its dated state; it is not an instruction to undo the later approved SMTP.

## Decision And Evidence

- Keep local/CI `supabase/config.toml` collector-only. Record hosted SMTP and policy in the non-loaded,
  secret-free `supabase/config.staging.toml`; it is not a deployment input.
- Use narrowly scoped, before/after-reviewed Auth updates in future. CLI `config push` immediately
  applies multiple services, can introduce omitted-field defaults, and is not an atomic dry-run.
- Retain the initial unintended drift and its correction in the
  [mail runbook](../../docs/operations/console-staging-auth-smtp.md). CLI projection parity is not
  complete Management API parity. Do not hide the failed storage update or weaken billing controls.
- Keep the distinct staging SMTP credential outside application runtime/CI and remove one-time
  encrypted handoff material after use. Never inspect Windows credential stores to extract CLI
  access; use the CLI's normal authenticated operations.
- One invitation has provider-reported delivery. On 2026-09-06 the named account remained
  unconfirmed. Delivery does not establish inbox receipt, password setup, identity or owner role.

## Consequences And Reversal

No product fact, image right, publication state, production RFQ configuration or public URL changes.
The first real owner must finish mailbox/password verification before the approved role grant.
Local mail safety runs before database startup; full isolated CI must still pass at the exact PR
candidate. Keep Console disabled in production and preserve the public Git-backed data source.

Reversal is a reviewed code change or separately authorized targeted provider update. Do not restore
open signup, delete accounts, reset staging, reuse the production key or start a paid plan as an
automatic workaround. The next action is the real-owner onboarding gate, not M3 or publication.
