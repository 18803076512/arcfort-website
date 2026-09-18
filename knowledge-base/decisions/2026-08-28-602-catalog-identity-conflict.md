# Decision: Block The 602 Catalog Series Until Page Identity Is Resolved

Date: 2026-08-28

## Context

Renqiu Ailesen company-catalog PDF page 14 uses an ORK 501D page header while its technical and
complete-torch table identifies ORK 602. The same page contains component and wear-part references
that visually form a water-cooled torch arrangement.

An official ABICOR BINZEL source confirms that an MB 602 family exists and provides OEM reference
values. It cannot determine which ArcFort Weld supplied product the internally inconsistent company
page represents.

## Decision

- Mark `mig-series-602` as `DATA_CONFLICT` with publication status `blocked`.
- Remove it from buyer-facing category and MIG/MAG RFQ family choices.
- Preserve all visible component candidates and reference values in governed internal evidence.
- Create separate factory-confirmation and exact-image queues.
- Do not generate a 602 series route, SKU, compatibility relationship or confirmed specification.

## Consequences

- The conflict remains visible to internal reviewers instead of being silently resolved.
- Buyer-facing pages cannot expose the ambiguous family as a selectable catalog reference.
- Official OEM values remain labeled `OEM_REFERENCE` and do not become ArcFort Weld claims.
- Restoring the family requires factory evidence tied to the exact supplied product, not another
  secondary reference.

## Reversal Condition

This decision may be revised after a controlled company/factory record identifies the correct page
family and exact product scope, with reviewer and date. Any resulting SKU, image or compatibility
publication must still pass the standard product and series gates.
