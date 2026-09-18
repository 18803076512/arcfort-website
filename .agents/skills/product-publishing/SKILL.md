---
name: product-publishing
description: Assemble verified ArcFort Weld product data, media, compatibility, SEO, and RFQ elements into publication-ready pages; production publication remains approval and QA gated.
---

# Product Publishing

## Purpose

Assemble only publishable governed data into consistent ArcFort Weld product pages. The default mode
prepares and validates a local publication candidate. External publication is a separate, explicit
mode that requires approval and a current release gate.

## Trigger Conditions

Use this skill when a task asks to prepare, generate, update or publish a product page, product batch
or product-series page from canonical data.

Do not use it to invent missing data, verify technical values, infer compatibility, approve media or
decide keyword architecture from scratch.

## Required Inputs

- Canonical active or publication-candidate product record
- Technical-verification output for critical technical fields
- Governed compatibility relationships
- Canonical image-asset records and an exact approved main image
- Category/series route context
- SEO target and canonical URL
- RFQ context requirements
- Requested mode: `prepare` or explicitly approved `publish`

## Optional Inputs

- Approved gallery, PDF/download and model matrix
- Product-specific FAQ evidence
- Related products and internal-link recommendations
- Packaging/OEM data with verification status
- Existing page route and migration/redirect plan
- Release identifier and deployment destination

## Source Priority

Publish only from canonical governed sources:

1. Confirmed ArcFort Weld product and company records
2. Governed reference facts with visible reference labels
3. Governed compatibility and media registries
4. Approved SEO architecture and existing route contracts

Raw spreadsheets, PDFs, chat text, marketplace listings or unreviewed intake files are not direct
publishing sources.

## Workflow

1. Read current publication decisions, canonical product data, technical facts, compatibility,
   media assets, SEO architecture and page templates.
2. Build a readiness manifest before changing public-facing output.
3. Block the candidate if critical identity, exact main image, rights, route, RFQ or required evidence
   is missing or conflicting.
4. Use existing reusable templates and adapters rather than creating one-off product pages.
5. Generate the page with:
   - H1, short description and overview
   - SKU, category and series/family context
   - Technical table with verification-safe values
   - Governed gallery
   - Compatibility confidence and confirmation guidance
   - Applications and evidence-safe features
   - Packaging, MOQ, lead-time and OEM sections
   - FAQ
   - Unique metadata, Product/Breadcrumb/FAQ structured data where valid
   - Related products/categories and internal links
   - Product-context RFQ CTA and direct contact fallback
6. Preserve existing URLs. Any route change requires an approved migration and redirect plan.
7. Keep unsupported fields grouped as technical details available upon request rather than publishing
   repeated placeholders.
8. Generate only a local candidate in `prepare` mode.
9. Run all product, image, compatibility, SEO, RFQ and build gates, then invoke `$release-qa`.
10. Publish externally only when approval covers the exact destination and the release result permits it.

## Output Contract

Return:

- Product/SKU and canonical target URL
- Mode: `prepare` or `publish`
- Readiness manifest for data, technical facts, compatibility, media, SEO, RFQ and route stability
- Files generated or changed
- Public fields included, reference-labeled or withheld
- Metadata and structured-data types generated
- Internal-link and related-product map
- Validation commands and results
- Release QA status and unresolved warnings/blockers
- Publication destination, commit and live verification only when actually performed

## Validation

- Product, SKU, category and slug are unique and canonical.
- Critical values are confirmed or visibly reference/needs-confirmation guidance.
- Main image is exact-product, rights-approved and `search_eligible`.
- Compatibility labels match the governed registry.
- Product JSON-LD matches visible content and omits unsupported offers, review and rating data.
- Canonical, sitemap, robots, breadcrumbs and internal links remain correct.
- RFQ prefill/product context and fallbacks work.
- Run the relevant product, technical, compatibility, media, SEO, RFQ, lint, typecheck and build checks.
- A current `$release-qa` result is mandatory for the exact candidate and commit.

## Stop Conditions

Return `BLOCKED` without publication when:

- Any critical product identity or evidence conflict exists.
- Required technical data is falsely presented as confirmed.
- Main imagery is missing, blocked, rights-unknown or not an exact-product match.
- Compatibility is promoted beyond its evidence.
- Duplicate SKU/slug or broken route exists.
- RFQ, schema, canonical, sitemap or build validation fails.
- Release QA returns `BLOCKED`.
- External publication approval or exact destination is absent.

## Approval Requirements

No approval is needed to generate a non-public local candidate from already governed data. Explicit
owner approval is required before external publication, deployment, index submission, major URL
change or accepting `PASS_WITH_WARNINGS`. `BLOCKED` cannot be overridden by approval; its blocking
conditions must be resolved and QA rerun.

## Data That May Be Modified

- Existing product adapters, reusable page templates and generated page output within task scope
- Governed product metadata and internal-link mappings when sourced from approved SEO architecture
- Sitemap/structured-data projections derived from publishable records
- Product publication reports and changelog entries
- Deployment state only in explicitly approved `publish` mode

## Data That Must Never Be Modified Automatically

- Raw source evidence or technical verification status
- Product dimensions, threads, materials, OEM numbers, compatibility or certifications
- Image ownership, usage rights or exact-product match
- Stable SKU or public URL without approved migration
- Prices, stock, factory capacity, customer cases or commercial policy
- A blocked/draft record into active/indexable state
- Production deployment, DNS, analytics or provider configuration without explicit approval

## Handoff

Send missing facts to `$technical-verification`, fit questions to `$compatibility-mapping`, image
gaps to `$product-media-manager` and keyword/URL issues to `$seo-architecture`. Always finish with
`$release-qa`; do not publish during skill-system setup or a planning-only task.
