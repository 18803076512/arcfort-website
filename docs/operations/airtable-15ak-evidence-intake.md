# Airtable 15AK Evidence Intake

## Purpose

The private Airtable base `ArcFort Weld - 15AK Evidence Intake` gives factory and product reviewers
a simpler place to supply evidence for the first governed 15AK product family. It is an intake and
review surface only. Repository CSV files and governed TypeScript registries remain the publication
source of truth.

No Airtable record may confirm a specification, approve an image or publish a product automatically.

The current base covers the four governed public-product records. The broader 46-candidate 15AK
component matrix remains repository-only until an external schema and transfer review are explicitly
approved; do not force those candidate rows into the existing 15 technical or 20 image records.

## Current Base Structure

The verified base contains five tables:

| Table              | Records | Purpose                                                          |
| ------------------ | ------: | ---------------------------------------------------------------- |
| Workflow           |       5 | Permanent authority, review and transfer rules                   |
| P0 Image Decisions |       4 | Decisions for active main images with unresolved provenance      |
| Technical Reviews  |      15 | Field-level 15AK factory-confirmation requests                   |
| Image Requests     |      20 | Main, technical-detail, dimensional and packaging image requests |
| Local Asset Triage |      73 | Unassigned repository files sorted for evidence review           |

At initialization, all 15 technical rows remain `NEEDS_FACTORY_CONFIRMATION`, all 20 image requests
remain `requested`, and all four P0 images remain `Needs review`. No record is confirmed, approved or
search eligible. The 73 local candidates also remain `needs_confirmation`, `unverified` and
`needs_review`; visual-family labels do not prove exact-product identity.

Keep the Airtable base ID, access tokens, reviewer contact details and private account information
out of Git. Repository documentation identifies the base by name only.

## Authority Boundary

- Airtable values are proposed reviewer input, not public product data.
- A technical value may be transferred as `CONFIRMED` only for the exact SKU and only when it has a
  qualifying evidence type, a specific evidence reference, a reviewer and an ISO review date.
- A file upload proves only that a file was supplied. It does not prove ownership, website-use
  rights, exact-product identity or technical accuracy.
- An image may become approved only after source owner, usage-rights basis, exact-product match,
  source file, reviewer and review date are recorded and the local canonical asset has been checked.
- A catalog reference remains reference evidence. It cannot confirm universal compatibility or an
  exact ArcFort Weld specification by itself.
- `DATA_CONFLICT` values remain blocked until the conflicting evidence is resolved.
- Internal notes and reviewer information must never be projected into public pages, analytics or
  structured data.

## Canonical Repository Mapping

| Airtable table     | Review target                                             | Canonical repository destination               |
| ------------------ | --------------------------------------------------------- | ---------------------------------------------- |
| Technical Reviews  | Exact-SKU values and evidence                             | `data/intake/15ak-technical-confirmation.csv`  |
| Image Requests     | Company-owned or rights-approved product image intake     | `data/intake/15ak-product-image-intake.csv`    |
| P0 Image Decisions | Existing active-image provenance and replacement decision | `data/assets/product-image-assets.csv`         |
| Local Asset Triage | Unassigned files and visual-family sorting                | `data/evidence/local-product-image-triage.csv` |
| Workflow           | Operating rules only                                      | This document and `AGENTS.md`                  |

Use `docs/product-image-tasks.csv` as the generated review queue when reconciling P0 decisions. Do
not edit generated runtime registries to bypass the canonical CSV files.

## Controlled Transfer Procedure

### Complementary Factory Workbook

The private Airtable base and the local `ArcFort-Weld-15AK-Evidence-Intake.xlsx` workbook are two
reviewer interfaces over the same governed intake model. Neither is authoritative and neither may
sync automatically into public data.

The combined workbook covers 46 assembly candidates, 58 component image requests, 15 product
technical rows and 20 product image requests. It excludes internal notes and uses formulas to count
only evidence-complete rows as review-ready. See
`docs/operations/15ak-factory-evidence-handoff.md` for its sheet structure and controlled return
procedure.

Do not import the workbook into Airtable as an uncontrolled table expansion. The broader Airtable
schema still requires explicit external approval and a reviewed mapping for stable IDs, evidence
fields and attachment handling.

1. Export or review only the Airtable records that a named reviewer has completed.
2. Open the referenced evidence and confirm that it belongs to the exact SKU or explicitly scoped
   variant.
3. Compare the proposal with the existing catalog reference and record `DATA_CONFLICT` when they
   disagree.
4. Transfer accepted technical responses to `data/intake/15ak-technical-confirmation.csv`.
5. Transfer accepted image responses to `data/intake/15ak-product-image-intake.csv`.
6. Use `data/intake/15ak-series-confirmation.csv` and `data/intake/15ak-image-intake.csv` only for
   evidence tied to a named catalog assembly candidate, not as a shortcut to a public SKU.
7. Place approved original image files under the governed local product-image path without changing
   product geometry, markings, threads, holes or connections.
8. Update `data/assets/product-image-assets.csv` only after provenance, rights and exact-product review.
9. Regenerate reports and inspect the diff before any product, relationship or image state changes.
10. Publish only through the repository review, PR and deployment workflow.

Run the applicable checks:

```bash
npm run technical:validate
npm run technical:report
npm run series:components:validate
npm run series:components:report
npm run images:assets:validate
npm run images:triage:validate
npm run products:image-tasks
npm run images:assets:report
npm run compatibility:validate
npm run products:validate
npm run products:report
npm run seo:audit
npm run lint
npm run typecheck
npm run build
```

## Companion File Collection

A Dropbox file request can be used to collect original photos and evidence files from non-Airtable
contributors. It must remain a private intake channel and follow the same approval boundary. Creating
the folder and file request requires explicit owner confirmation of the exact folder path, request
title, deadline and open/closed state.

The proposed configuration is:

- Folder: `/ArcFort Weld/15AK Evidence Intake`
- File request title: `ArcFort Weld 15AK Product Photos and Evidence`
- Deadline: none
- State: open

Do not treat a Dropbox upload as an approved product asset. Transfer only reviewed originals into the
canonical repository image workflow.
