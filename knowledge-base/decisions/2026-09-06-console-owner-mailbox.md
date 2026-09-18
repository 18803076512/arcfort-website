# Console Owner Mailbox Replacement

Date: 2026-09-06
Status: Explicitly approved for one staging invitation; owner activation not yet verified.

## Superseded Decision

This replaces only the administrator mailbox choice in
[the staging Auth mail decision](2026-09-06-console-staging-auth-mail.md).
The owner reported not receiving the invitation at the prior domain address, supplied their actual
Outlook mailbox, then explicitly confirmed changing the staging login recipient to that address and
sending one invitation. The exact current and superseded addresses are maintained in the
[onboarding runbook](../../docs/operations/console-staging-auth-smtp.md).

## Scope And Evidence

The target remains `fdsvzuqixppsakukkrsf`. A fresh authenticated identity/health check and no-existing-
account preflight passed. One new invitation was accepted and Resend reported delivery to the newly
approved mailbox. Neither provider acceptance nor Delivered proves that the owner set a password or
signed in. No user role was granted. The old unconfirmed account remains untouched and unprivileged.

Only the verified new identity may receive the intended first-owner role after the owner completes
the real login/password handoff. This approval does not cover additional users, account deletion,
production RFQ recipients, website business contact details, forwarding rules or DNS changes.
Stop on an unexpected identity, an existing conflicting role or a failed confirmation; do not
auto-confirm a user or generate/set their password to bypass the gate.
