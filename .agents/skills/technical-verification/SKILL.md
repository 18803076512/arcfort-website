---
name: technical-verification
description: Classify welding product technical facts by source and verification status while preserving evidence and preventing references from becoming confirmed factory claims.
---

# Technical Verification

## Purpose

Evaluate field-level product facts and assign one governed status without guessing:

- `CONFIRMED`
- `OEM_REFERENCE`
- `STANDARD_REFERENCE`
- `NEEDS_FACTORY_CONFIRMATION`
- `DATA_CONFLICT`

The skill preserves the original source, separates reference values from ArcFort Weld values and
produces an auditable verification handoff.

## Trigger Conditions

Use this skill when a task asks to verify, compare, classify or reconcile dimensions, threads,
materials, weights, electrical parameters, duty cycle, packaging data, OEM references or other exact
technical fields.

Do not use it merely to ingest a source, map compatibility, approve media or publish a page.

## Required Inputs

- Exact SKU or governed product/candidate identifier
- Technical field name and candidate value
- Exact evidence source and source location
- Evidence scope showing which product/variant the value describes
- Current governed value and verification status, if one exists

## Optional Inputs

- Unit and tolerance
- Controlled drawing, sample, measurement record or factory record
- Official manufacturer catalog/manual
- Applicable standard and clause
- Comparison source and comparison value
- Reviewer identity and ISO review date
- Factory confirmation intake row

## Source Priority

1. Level A: confirmed ArcFort Weld company/factory evidence tied to the exact SKU or variant
2. Level B: official manufacturer catalog/manual evidence
3. Level C: applicable standard with its scope stated
4. Level D: competitor, distributor or marketplace reference

Level D cannot confirm an exact value. A Level A source conflict remains `DATA_CONFLICT`; company
ownership does not make one conflicting value automatically correct.

## Workflow

1. Read the applicable product/technical knowledge, prior decisions and current technical registry.
2. Establish exact subject identity before evaluating the value.
3. Preserve the raw source value, unit, location and context separately from any normalized value.
4. Normalize units only when conversion is deterministic and retain both source and normalized forms.
5. Compare the candidate with current governed facts and other credible sources.
6. Assign exactly one status:
   - `CONFIRMED`: exact-item Level A evidence, qualifying evidence type, reviewer and date are present.
   - `OEM_REFERENCE`: official manufacturer reference retained as reference only.
   - `STANDARD_REFERENCE`: applicable standard value retained with scope and clause.
   - `NEEDS_FACTORY_CONFIRMATION`: identity, source, evidence or review is incomplete.
   - `DATA_CONFLICT`: credible values disagree or source identity is internally inconsistent.
7. Keep the original reference and confirmed value in separate fields. Never overwrite provenance.
8. Record the confirmation requirement or conflict-resolution question.
9. Run technical validators and produce a handoff without changing public copy.

## Output Contract

Return one record per evaluated field containing:

- Product/SKU and variant scope
- Field name, source value, normalized value and unit
- Exact source, source location and source level
- Evidence basis and evidence reference
- Assigned verification status
- Existing governed value and comparison result
- Conflict details or confirmation requirement
- Reviewer and last verified date when real
- Public projection eligibility: `confirmed`, `reference_only`, or `private`
- Downstream impact on compatibility, publishing and media labels

## Validation

- A `CONFIRMED` record must be Level A, exact-item scoped and include qualifying evidence, reviewer
  and ISO review date.
- `OEM_REFERENCE` requires a real official manufacturer source.
- `STANDARD_REFERENCE` requires a named applicable standard and bounded scope.
- `DATA_CONFLICT` must retain all credible values and remain blocked.
- No unconfirmed value may appear in a shadow confirmed field.
- Run `npm run technical:validate` and `npm run technical:report` after registry or intake changes.
- Run affected product, series and compatibility validators when the field participates in those
  relationships.

## Stop Conditions

Stop and return `NEEDS_FACTORY_CONFIRMATION` or `DATA_CONFLICT` when:

- Exact SKU/variant identity is missing.
- The source cannot be reproduced.
- Two credible sources disagree.
- The evidence is only visual similarity or a secondary marketplace listing.
- Reviewer/date requirements for confirmation are absent.
- Confirmation would require interpreting a drawing or standard outside its documented scope.

## Approval Requirements

No approval is required to classify a value as reference, needs-confirmation or conflict. Setting or
promoting a value to `CONFIRMED` requires a real authorized reviewer decision backed by qualifying
Level A evidence. Public promotion remains a separate publishing decision.

## Data That May Be Modified

- `lib/data/product-technical-facts.ts`
- Matching `data/intake/*-technical-confirmation.csv` files
- Technical evidence reports and knowledge-base records
- Verification, reviewer and review-date fields when supported by real evidence

## Data That Must Never Be Modified Automatically

- Original source values, source locations or evidence files
- A reference value into a confirmed ArcFort Weld value
- Exact SKU identity to make evidence appear applicable
- Compatibility status, image rights or publication state
- OEM numbers, dimensions, materials, electrical ratings, duty cycle or tolerances by inference
- Certification, price, capacity, customer or commercial-policy data

## Handoff

Provide governed facts to `$compatibility-mapping` when they support fitment and to
`$product-publishing` only with their status and evidence boundary intact. Send unresolved factory
questions back to the intake workflow.
