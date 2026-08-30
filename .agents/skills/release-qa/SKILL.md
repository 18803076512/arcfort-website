---
name: release-qa
description: Act as the final ArcFort Weld release gate by returning PASS, PASS_WITH_WARNINGS, or BLOCKED across code, routes, mobile, data, media, SEO, schema, RFQ, and publication controls.
---

# Release QA

## Purpose

Provide an evidence-based final decision for an exact change set and release candidate. This skill is
read-only by default and cannot publish, approve missing evidence or weaken a blocking gate.

Allowed results are exactly:

- `PASS`
- `PASS_WITH_WARNINGS`
- `BLOCKED`

## Trigger Conditions

Use this skill before commit/release completion, product publication, deployment or live verification
when a change affects code, routes, public content, product data, media, SEO, schema, RFQ, security or
production configuration.

It may also be invoked explicitly to audit a proposed release without fixing it.

## Required Inputs

- Exact change scope and intended outcome
- Current Git diff/commit or release identifier
- Affected routes, data sources and components
- Applicable repository rules and prior decisions
- Required validation commands for the changed surface
- Intended destination when deployment/publication is requested

## Optional Inputs

- Build, lint, typecheck and focused test outputs
- Responsive screenshots and browser evidence
- Product, technical, compatibility and media reports
- SEO, schema, internal-link and sitemap reports
- RFQ delivery/status evidence
- Production health evidence and rollback plan
- Accepted-warning decision from the owner

## Source Priority

1. Current canonical repository state and governed source records
2. Applicable rules, Goal Mode phase and non-superseded decisions
3. Direct command/test output for the exact change set
4. Browser and production evidence for the exact target environment
5. Historical reports only when still current and scoped to the same candidate

Plans, prior green builds, provider acceptance and file existence are not proof of the current
release behavior.

## Workflow

1. Read the mandatory rules, Goal, relevant knowledge, decisions and applicable QA sections.
2. Bind the audit to an exact diff/commit and intended release destination.
3. Determine affected gates; do not omit a gate merely because its command is slow.
4. Check as applicable:
   - Build, lint, typecheck and focused tests
   - Routing, redirects, static/dynamic generation and not-found behavior
   - Mobile/responsive layout, accessibility and performance
   - Technical evidence and verification labels
   - Product images, provenance, rights, exact match and missing critical roles
   - SEO metadata, canonical, internal links, sitemap, robots and indexing
   - Product, BreadcrumbList, Organization and FAQ schema parity
   - RFQ context, validation, upload, delivery status and fallbacks
   - Duplicate SKU, duplicate slug and category/route integrity
   - Missing critical identity, technical, media or governance fields
   - Secrets, security boundaries and production approval
5. Separate blocking failures from non-blocking warnings and cite direct evidence for each.
6. Return one status using the decision rules below.
7. Do not repair findings inside the gate unless the user explicitly starts a separate scoped fix.

## Output Contract

Return a release gate report containing:

- `status`: `PASS`, `PASS_WITH_WARNINGS`, or `BLOCKED`
- Change-set/commit identifier and intended destination
- Applicable gates and why each applies
- Commands/checks run with pass/fail/not-run result
- Blocking findings ordered by severity
- Non-blocking warnings with owner and follow-up
- Product/SKU/route/media records affected
- Missing evidence or unrun checks and residual risk
- Approval state and whether external publication is permitted
- Required upstream skill for each blocking issue
- Exact next action

## Validation

Use these decision rules:

- `PASS`: every applicable gate passes, no critical evidence is missing and required approval for the
  next external action is present.
- `PASS_WITH_WARNINGS`: all blocking gates pass; remaining issues are explicitly non-blocking,
  visible, bounded and do not create incorrect public information. External release requires owner
  acceptance of the listed warnings.
- `BLOCKED`: any applicable critical gate fails, is unverified or cannot be run; content/data is
  blocked/draft/conflicting; a duplicate SKU/slug exists; a critical field or exact image is missing;
  compatibility is overstated; routes/schema/RFQ/security fail; or required approval is absent.

Never allow `BLOCKED` content or a `BLOCKED` release candidate to publish. Owner preference cannot
change the status until the underlying gate is resolved and rerun.

## Stop Conditions

Return `BLOCKED` and stop when:

- The exact change set or release destination is unknown.
- Authoritative data and generated output do not match.
- An applicable validation cannot be executed or its output is unavailable.
- Unrelated working-tree changes prevent reliable attribution.
- Evidence, image rights, compatibility or technical facts are conflicting.
- The task asks QA to approve or publish its own unverified work.

## Approval Requirements

Read-only QA needs no additional approval. External publication, deployment, merge, DNS/provider
change or acceptance of `PASS_WITH_WARNINGS` requires the approval defined in `AGENTS.md` and the
originating skill. QA never grants that approval.

## Data That May Be Modified

- Non-public QA reports when the task requests a stored artifact
- `docs/CHANGELOG_AI.md` only after the underlying task is actually complete
- Read-only evidence snapshots that contain no secrets or buyer PII

By default, this skill modifies nothing.

## Data That Must Never Be Modified Automatically

- Product records, technical facts or compatibility relationships
- Image ownership, rights, identity or publication state
- SKU, slug, route, canonical, sitemap or robots behavior
- RFQ, email, storage, DNS, analytics or production configuration
- Build/performance budgets to hide a failure
- A `BLOCKED` result into a pass state
- Production deployment or publication state

## Handoff

Route ingestion failures to `$product-data-ingestion`, fact failures to `$technical-verification`,
fitment failures to `$compatibility-mapping`, media failures to `$product-media-manager`, SEO
failures to `$seo-architecture`, and page assembly failures to `$product-publishing`. Rerun this
skill only after the authoritative change set is updated.
