# Airtable Evidence Intake Boundary Decision

Date: 2026-08-25

## Objective

Provide a low-friction evidence collection workflow for 15AK reviewers without creating a second
product source of truth or allowing unreviewed cloud data to reach public ArcFort Weld pages.

## Decision

The private Airtable base `ArcFort Weld - 15AK Evidence Intake` is a non-authoritative intake and
review surface. Repository CSV files and governed TypeScript registries remain canonical.

Airtable may hold:

- Proposed exact-SKU technical values and evidence references.
- Original image requests, attachments and source-owner details.
- Reviewer decisions for unresolved P0 image provenance.
- Internal workflow notes and transfer status.

Airtable must not:

- Publish or update website product records automatically.
- Convert a reference value into a confirmed specification.
- Approve usage rights or exact-product identity from an upload alone.
- Create compatibility claims, OEM numbers, certifications, dimensions or ratings.
- Bypass repository validators, PR review or deployment controls.

## Rationale

Factory and product contributors need an approachable interface, while the website needs a stable,
versioned and reviewable data authority. Keeping cloud collection separate from publication avoids
dual-source conflicts, accidental claims and untraceable changes.

## Transfer Gate

Every accepted cloud response must be reviewed against its evidence, transferred into the matching
canonical CSV, validated and reviewed in Git before publication. The detailed procedure is recorded
in `docs/operations/airtable-15ak-evidence-intake.md`.

## Current Scope

The initial base covers five workflow rules, four P0 image decisions, 15 technical-review rows and 20
image requests. It contains no confirmed technical values, approved images or search-eligible assets
at initialization.

## Reconsideration Trigger

Revisit this decision only when ArcFort Weld has a defined multi-user product-management workflow,
field-level permissions, audit history and a designed one-way or bidirectional synchronization
contract. A future Sanity, Supabase or Airtable integration must preserve the same evidence and
publication gates.
