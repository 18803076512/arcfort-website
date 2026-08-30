---
name: product-data-ingestion
description: Ingest welding product data from Excel, CSV, PDF, technical sheets, factory measurements, or product lists into governed draft records without publishing them.
---

# Product Data Ingestion

## Purpose

Convert source files and factory inputs into traceable, structured ArcFort Weld product candidates.
Preserve what the source actually says, expose missing data, detect duplicates and conflicts, and
prepare a reviewable handoff. This skill never publishes a product.

## Trigger Conditions

Use this skill when a task involves importing or reconciling:

- Excel or CSV product lists
- PDF catalogs or technical sheets
- Factory measurements or controlled drawings
- Supplier or official manufacturer records
- Existing product tables that need normalization or deduplication

Do not use it to confirm technical values, assert compatibility, approve images or publish pages.
Hand those outcomes to the relevant downstream skill.

## Required Inputs

- Source file or an exact readable source location
- Source owner or origin when known
- Intended product scope or family
- Target import mode: preview, staging, or reviewed canonical import
- Existing canonical product source for duplicate and conflict comparison

## Optional Inputs

- Column mapping or workbook sheet selection
- Known SKU/category/slug mapping
- Reviewer name and review date
- Unit conventions and language mapping
- Existing image filenames, PDF references or source-page notes
- Requested output path when a non-default staging location is required

## Source Priority

Apply the repository evidence order:

1. Level A: confirmed ArcFort Weld company/factory records tied to the exact item
2. Level B: official manufacturer catalogs or manuals
3. Level C: applicable IEC, ISO, AWS or other standards
4. Level D: competitor, distributor or marketplace references

File type does not determine source level. A company-branded PDF or spreadsheet is not automatically
`CONFIRMED`; scope, exact-product identity, evidence and reviewer state still control the result.

## Workflow

1. Read `AGENTS.md`, `docs/CODEX_GOAL.md`, applicable product knowledge and previous decisions.
2. Inspect the current canonical schema and import scripts before defining a mapping.
3. Parse the source with a structured parser appropriate to its format. Preserve workbook sheet,
   row, PDF page, drawing number or measurement-record references.
4. Normalize field names, whitespace, category labels and clearly equivalent units without changing
   the underlying technical meaning.
5. Match existing records by SKU first, then stable slug and explicit source reference. Never match
   exact products from appearance or a similar name alone.
6. Detect duplicate SKU, duplicate slug, conflicting values, incomplete identity and unsupported
   publication states.
7. Generate only allowed derived values such as draft slug, meta copy or requested image paths.
   Keep every generated value labeled as generated and unconfirmed.
8. Write a preview or staging batch by default. A reviewed canonical import must retain current
   fields, unresolved values and source metadata.
9. Run the applicable product validators and produce a downstream handoff manifest.

## Output Contract

Return a structured ingestion result containing:

- `batch_id` and source identifier
- Source file, page/sheet/row references and inferred source level
- New, updated, unchanged and rejected record counts
- Draft structured product records with stable proposed identifiers
- Missing required and optional fields by record
- Duplicate SKU and duplicate slug findings
- Field-level conflicts with both original values preserved
- Generated-field list and generation basis
- Warning and blocking-error lists
- Recommended next skill for each unresolved area
- Explicit statement: `publication_performed: false`

## Validation

- Validate required CSV/product fields and allowed status values.
- Confirm SKU and slug uniqueness against the entire canonical source, not only the new batch.
- Confirm category slugs exist and image paths follow repository conventions.
- Confirm source references survive transformation.
- Run `npm run products:validate`, `npm run products:check-images` and
  `npm run products:report` when the canonical product source changes.
- Use `npm run products:simple:preview` before the simple-SKU generation/import workflow.
- Treat warnings as visible review items; never silently drop a source row.

## Stop Conditions

Stop without canonical import when:

- The source file cannot be read reliably.
- SKU identity is ambiguous or duplicate records cannot be resolved safely.
- A source value conflicts with governed data.
- The requested schema would discard existing fields or evidence.
- The task asks this skill to confirm, publish or deploy data.
- An owner decision is required to replace an existing canonical record.

## Approval Requirements

Preview, parsing, duplicate analysis and staging are low-risk and need no additional approval.
Require explicit owner approval before replacing canonical product records, changing stable SKU/slug
identity, importing a destructive update or writing to an external/production database.

## Data That May Be Modified

- Non-public staging or intake files under `data/intake/`
- Draft rows in `data/import/products.csv` when the task explicitly requests reviewed import
- Generated `lib/data/products.ts` only through the existing validated import workflow
- Import reports and missing-data manifests
- Internal source-reference and review fields

New or updated records must remain `draft` or `needs_review` unless a separate governed process
already proves a stronger state.

## Data That Must Never Be Modified Automatically

- Confirmed technical values or their original evidence
- Stable existing SKU, category or public slug without approved migration
- OEM/reference numbers, confirmed compatibility or certifications
- Exact dimensions, threads, materials, weights, electrical ratings or duty cycle
- Prices, stock, factory capacity, customer cases or commercial policy
- Product publication status, sitemap eligibility or production database records
- `notes_internal` visibility or any buyer PII

## Handoff

Send technical candidates to `$technical-verification`, relationship candidates to
`$compatibility-mapping`, media references to `$product-media-manager`, and only fully governed
records to `$product-publishing`.
