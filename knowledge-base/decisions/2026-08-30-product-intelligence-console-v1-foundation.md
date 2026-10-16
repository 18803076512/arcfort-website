# Product Intelligence Console V1 Foundation Decision

Date: 2026-08-30
Status: Approved for implementation

## Decision

The owner approved architecture decisions D0-D7 from
`docs/product-intelligence-console-v1-architecture.md` and authorized Product Intelligence Console
V1 Milestone 1 using the recommended defaults.

The approved boundaries are:

1. Product Intelligence Console V1 is the next implementation phase. The 15AK evidence workflow is
   its first real-data workload and remains evidence-first.
2. Use a dedicated Supabase project for Product Intelligence Postgres, Auth and private Storage.
3. Keep the protected console under `/console` in the current Next.js repository.
4. Use invite-only Supabase Auth with no public signup and owner-controlled roles.
5. Import repository data into a shadow database first. Keep the repository sources canonical until
   parity is accepted, then consider a separately approved 15AK-only authority cutover.
6. Keep public website data in an immutable, Git-backed approved release snapshot. Public pages must
   never read mutable draft records directly.
7. Keep original product media and evidence private. Export only rights-approved, exact-product web
   derivatives for public use.
8. Develop locally and in a separate hosted non-production environment before any production
   database or authentication change.

## Milestone 1 Scope

Milestone 1 delivers the data foundation only:

- Versioned Supabase migrations
- Typed database and domain contracts
- Import staging and deterministic shadow projections
- Append-only audit records
- Enforced lifecycle and verification invariants
- RLS policies and database tests
- Count, identifier, status and conflict reconciliation against repository sources

Login, console navigation and dashboard UI belong to Milestone 2. Product editing and human review
UI belong to Milestone 3. Public source-of-truth cutover and publication remain separately gated.

## Authority Boundary

During Milestone 1:

- `data/import/products.csv` and the governed TypeScript/CSV registries remain canonical.
- Supabase contains shadow copies only and cannot publish or update public pages.
- Existing source values, verification states, conflicts and media-rights states must be preserved.
- Import must never create a `CONFIRMED`, `VERIFIED`, `QA_PASSED` or `PUBLISHED` state.
- No hosted project, production credential, public route or deployment is changed without a separate
  destination-specific action and verification.

## Reversal And Rollback

Repository sources remain the rollback authority throughout shadow migration. A failed or incomplete
database import is discarded and replayed from versioned migrations and a deterministic shadow
projection. The public website continues to use its existing static product adapter, so a database
outage cannot remove published pages.

## Next Decision Gate

Milestone 2 may start only after Milestone 1 exit evidence proves schema reproducibility, RLS and
lifecycle behavior, and shadow parity. A hosted non-production Supabase project must be named and
verified before claiming remote parity or authentication readiness.
