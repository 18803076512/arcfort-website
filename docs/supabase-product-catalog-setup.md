# Deprecated Supabase Product Catalog Draft

This document is retained only to redirect older repository links. Do not run
`supabase/product-catalog-schema.sql`. That prototype stored important product facts in broad JSONB
fields and does not implement the approved Product Intelligence evidence, verification, lifecycle,
audit, release or RLS model.

## Current Product Intelligence Setup

The approved schema is versioned under `supabase/migrations/`. Follow
`docs/operations/product-intelligence-console-milestone-1.md` for:

- isolated local Supabase startup and reset;
- pgTAP schema, RLS, lifecycle and workflow tests;
- generated TypeScript database types;
- deterministic shadow generation and reconciliation;
- hosted non-production approval boundaries;
- rollback and source-of-truth protection.

The repository CSV and governed technical, compatibility, series and media registries remain
canonical during Milestone 1. Supabase receives shadow copies only and cannot publish to the public
website.

## Legacy File Safety

`supabase/product-catalog-schema.sql` is deliberately non-executable. It raises an exception before
the fully commented historical draft. This guard prevents an old setup instruction from creating a
second, incompatible product schema.

Do not remove the guard or revive the legacy tables. A future schema change must be a reviewed,
versioned migration with database tests and an explicit authority decision.
