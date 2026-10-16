---
name: compatibility-mapping
description: Build evidence-backed relationships among ArcFort Weld SKUs, series, torches, machines, reference numbers, dimensions, and related products without inferring fit from appearance.
---

# Compatibility Mapping

## Purpose

Create governed, source-aware compatibility and product relationships that help buyers identify the
correct welding or cutting part while clearly separating confirmed, reference and unresolved fit.

## Trigger Conditions

Use this skill when a task asks to map or review relationships between:

- SKU and product series
- Torch and machine
- Component and assembly
- OEM/reference number and product
- Thread, wire size, dimensions or interface and candidate fit
- Related, replacement or companion products

Do not use it to confirm a technical field, approve an image or publish a relationship directly.

## Required Inputs

- Governed subject identifier and subject type
- Governed target identifier and target type
- Proposed relationship type
- Evidence source and exact source reference
- Current technical facts relevant to the relationship
- Existing relationship record, if any

## Optional Inputs

- Factory confirmation record
- Controlled drawing or connection diagram
- Approved sample comparison
- Verified OEM/reference number
- Confirmed dimensions, thread or wire size
- Series/component evidence record
- Reviewer and ISO review date
- Public wording requested by a buyer-facing task

## Source Priority

1. Level A: exact-product factory confirmation, controlled drawing, approved sample, verified
   reference or confirmed dimensions
2. Level B: official manufacturer catalogs/manuals scoped to the exact relationship
3. Level C: applicable interface or product standard with scope stated
4. Level D: distributor, competitor or marketplace reference

Appearance, color, similar naming, catalog grouping or a Level D source alone never proves confirmed
compatibility.

## Workflow

1. Read current product, series, technical and compatibility records plus relevant decisions.
2. Resolve both subject and target to stable canonical identifiers.
3. Identify the exact relationship type: series membership, fits-with, used-on, replaces, equivalent,
   accessory-for, related-to or another governed type.
4. Gather the technical fields that actually control fit, such as thread, wire size, dimensions,
   connector/interface or torch/machine model.
5. Check evidence scope and technical verification status. Never borrow a family-level fact for an
   exact SKU without an explicit mapping.
6. Classify public confidence as Confirmed Compatibility, Reference Compatibility or Needs
   Confirmation while preserving the underlying verification status.
7. Record confirmation requirements for every non-confirmed relationship.
8. Detect reverse-link inconsistencies, duplicate relationships and conflicting targets.
9. Write only to the canonical compatibility registry and run its validators.

## Output Contract

Return relationship records containing:

- Stable relationship ID
- Subject ID/type and target ID/type
- Relationship type and direction
- Public confidence state
- Verification status
- Evidence basis, source level and exact source reference
- Controlling technical facts and their statuses
- Confirmation requirement or conflict note
- Reviewer and review date when real
- Public projection eligibility
- Related-product and publishing handoff impact

Also return duplicate, orphan, reverse-link and conflict findings.

## Validation

- Every subject and target must resolve to a canonical governed record.
- Confirmed compatibility requires `CONFIRMED` verification plus qualifying Level A evidence.
- Reference compatibility must remain visibly qualified.
- `DATA_CONFLICT` and unverified relationships remain private or blocked.
- Catalog series membership alone remains `reference_only`.
- Run `npm run compatibility:validate` and `npm run compatibility:report` after changes.
- Run `npm run series:validate` and relevant product tests when series relationships change.

## Stop Conditions

Stop without confirming a relationship when:

- Subject or target identity is ambiguous.
- Fit depends on an unverified dimension, thread, model or interface.
- Evidence is limited to appearance, similar naming or marketplace claims.
- Sources conflict.
- A relationship would create an orphan, circular replacement or unsupported exact equivalence.
- The task asks this skill to bypass the canonical registry or publication gate.

## Approval Requirements

Reference-only and needs-confirmation records may be prepared without additional approval. A
relationship may become confirmed or public only after an authorized reviewer approves the
qualifying evidence. Major compatibility reclassification or replacement mapping requires owner
approval because it can affect purchasing decisions.

## Data That May Be Modified

- `lib/data/compatibility-relationships.ts`
- Compatibility evidence reports and knowledge-base records
- Reference-only and needs-confirmation relationship records
- Reviewer/date fields when backed by a real review

## Data That Must Never Be Modified Automatically

- Product technical facts or their verification status
- SKU, series, torch or machine identity
- OEM/reference numbers or confirmed dimensions
- A relationship from reference/unverified to confirmed
- Public product copy, routes, sitemap or structured data
- Product image identity, rights or publication state
- Prices, certifications, capacity or commercial policy

## Handoff

Send unresolved technical dependencies to `$technical-verification`. Send complete governed
relationships to `$product-publishing` with their confidence labels intact. `$release-qa` must block
any publication that promotes an unverified or conflicting relationship.
