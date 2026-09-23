# Compatibility Registry

## Purpose

The canonical relationship source is `lib/data/compatibility-relationships.ts`. It is designed to
grow from product-to-series records into a graph connecting products, series, torches, machines and
verified OEM references without embedding fitment claims in page components.

## Required Relationship Data

Every relationship records:

- Stable relationship ID and relationship type
- Subject and target entity type plus stable identifier
- Buyer-facing role
- `confirmed`, `reference_only` or `unverified` status
- Source type, evidence level and verification status
- Evidence basis and exact source reference
- Whether buyer confirmation is still required
- Product-specific confirmation requirements
- Reviewer and ISO review date
- Optional internal notes that are never rendered publicly

## Current 15AK Relationships

| Product | Target | Status | Verification |
| --- | --- | --- | --- |
| MIG Contact Tip M6 0.8mm | 15AK series evidence | Reference only | Needs factory confirmation |
| MIG Contact Tip M6 1.0mm | 15AK series evidence | Reference only | Needs factory confirmation |
| MIG Tip Holder for MB15 | 15AK series evidence | Reference only | Needs factory confirmation |
| MIG Gas Nozzle for MB15 | 15AK series evidence | Reference only | Needs factory confirmation |

The source catalog places these product references inside the documented 15AK group. It does not
prove universal fit, so every relationship still requests torch-label, component-stack, connection,
sample or drawing evidence.

## Confirmation Gate

A relationship may become `confirmed` only when:

1. `verificationStatus` is `CONFIRMED`.
2. Evidence includes factory confirmation, a controlled drawing, an approved sample, a verified
   reference number or confirmed dimensions.
3. The product record itself is eligible for the same compatibility status.
4. Conflicting evidence has been resolved and documented.
5. `npm run compatibility:validate` passes.

Company-catalog grouping alone remains `reference_only`. Similar appearance is never evidence.
