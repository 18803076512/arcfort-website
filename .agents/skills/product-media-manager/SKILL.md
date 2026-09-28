---
name: product-media-manager
description: Govern product images by SKU, role, provenance, rights, exact-product match, and publication state while detecting missing views and preserving real geometry.
---

# Product Media Manager

## Purpose

Build and maintain a traceable ArcFort Weld product media library. Map each approved asset to the
correct SKU and role, detect missing evidence, preserve usage rights and prevent a family reference
or edited lookalike from becoming proof of an exact product.

## Trigger Conditions

Use this skill when a task involves:

- Adding, replacing, checking or organizing product images
- Mapping media files to SKUs or product series
- Reviewing provenance, ownership, usage rights or exact-product identity
- Detecting missing product views
- Preparing safe image optimization or gallery assignments
- Reconciling local files with the canonical asset registry

## Required Inputs

- Product SKU or governed candidate identifier
- Source file or exact local file path
- Requested media role
- Source owner/origin and usage-rights basis when known
- Exact-product or family-level match evidence
- Existing product and image-asset registry records

## Optional Inputs

- Original source filename and checksum
- Capture date, photographer or supplier authorization
- Controlled sample, drawing, label or packaging reference
- Reviewer and ISO review date
- Requested crop, background, color or format treatment
- Alt text and gallery order
- Existing local-image triage record

## Source Priority

1. Company-owned original photo of the exact product with documented usage rights
2. Supplier-authorized exact-product photo with documented website-use permission
3. Official catalog or company-catalog product/family reference, clearly bounded
4. Marketplace or third-party image used only for internal research and identification questions

File presence, visual similarity, watermark removal or search-engine availability does not prove
ownership, permission or exact-product identity.

## Workflow

1. Read product, image-governance and relevant series knowledge plus previous image decisions.
2. Resolve the target SKU and inspect its canonical requested image paths.
3. Record file fingerprint, dimensions, format, source filename and lineage without altering the
   original.
4. Inspect whether the file depicts the exact SKU, a product-family reference, packaging, a detail or
   an unrelated candidate.
5. Assign one role: main, 45-degree, thread detail, hole/orifice detail, surface/material detail,
   dimension image, packaging image or bulk image.
6. Record owner, usage-rights status, content-match status, reviewer and review date.
7. Apply only non-deceptive presentation edits when authorized: canvas/padding, crop that retains the
   full relevant product, orientation correction, exposure/white-balance correction, background
   cleanup and format/compression optimization. Preserve an edit log.
8. Never change thread, hole, dimensions, shape, connection, marking or product count.
9. Update the canonical asset registry or the unassigned triage queue, then regenerate the runtime
   registry.
10. Report missing roles and publication blockers by SKU.

## Output Contract

Return:

- Asset ID, SKU, role and public candidate path
- Original file reference, checksum, dimensions and format
- Source owner, source type and usage-rights status
- Exact-product/content-match status
- Publication state: `search_eligible`, `legacy_reference`, `display_only`, or `blocked`
- Reviewer and review date when real
- Alt text and gallery order
- Edit operations performed, if any
- Missing-view checklist by SKU
- Duplicate-file, orphan-file, rights and identity warnings
- Explicit statement that product geometry was not changed

## Validation

- `search_eligible` requires exact-product match, approved usage basis, known source owner, reviewer
  and review date.
- `legacy_reference` must remain labeled as a family/reference image and excluded from search metadata.
- Every canonical main/gallery path must have one matching registry record and an existing local file.
- No blocked asset may be rendered or projected to SEO metadata.
- Run `npm run images:assets:sync`, `npm run images:assets:generate`,
  `npm run images:assets:validate`, `npm run images:assets:report`,
  `npm run images:triage:validate`, `npm run test:image-readiness` and
  `npm run test:image-presentation` as applicable.
- Run `npm run products:check-images` and `npm run seo:images` when product/public paths change.

## Stop Conditions

Stop or keep the asset blocked when:

- Source owner or website-use rights are unknown.
- Exact-product identity cannot be established.
- The file conflicts with the SKU, drawing, label or product geometry.
- The requested edit would change or conceal true product geometry or markings.
- A watermark would need to be removed to imply ownership.
- A generated or similar-looking image is requested as evidence of a real exact product.
- The target SKU or role is ambiguous.

## Approval Requirements

Inventory, hashing, missing-image detection and triage are low-risk. Require an authorized reviewer
before assigning approved rights, exact-product match, `search_eligible`, replacing a public main
image or performing an edit beyond lossless/format optimization. External image licensing or paid
generation requires owner approval.

## Data That May Be Modified

- `data/assets/product-image-assets.csv`
- `data/evidence/local-product-image-triage.csv`
- Governed files under `public/images/products/`
- Generated `lib/data/product-image-assets.ts`
- Product-image reports, task lists and media knowledge-base records
- Non-deceptive derivative files with retained lineage

## Data That Must Never Be Modified Automatically

- Real product thread, holes, dimensions, shape, connections, markings or product count
- Original source files or source-lineage evidence
- Usage rights, ownership, exact-product match or reviewer approval
- Product technical specifications, compatibility or SKU identity
- Publication status solely because an image looks professional
- Watermarks or provenance information to conceal source
- Factory/company scenes presented as real evidence when they are generated or unverified

## Handoff

Send unresolved product identity to `$product-data-ingestion` or `$technical-verification`. Send only
governed asset records to `$product-publishing`; `$release-qa` must block missing, rights-unknown or
identity-conflicting critical images.
