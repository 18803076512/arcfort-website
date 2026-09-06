# Compatibility Readiness Report

This internal report tracks governed product relationships. A relationship is not confirmed merely because products share a catalog page, series name or similar appearance.

## Summary

- Governed compatibility relationships: 4
- Confirmed relationships: 0
- Reference-only relationships: 4
- Unverified relationships: 0
- Relationships requiring buyer/factory evidence: 4

## Relationship Matrix

| Relationship                       | Subject                                   | Target                       | Public status  | Verification               | Evidence basis  |
| ---------------------------------- | ----------------------------------------- | ---------------------------- | -------------- | -------------------------- | --------------- |
| compat-mig-15ak-contact-tip-m6-0-8 | MIG Contact Tip M6 0.8mm (AF-MIG-CT-0004) | 15AK catalog reference group | reference only | NEEDS_FACTORY_CONFIRMATION | company catalog |
| compat-mig-15ak-contact-tip-m6-1-0 | MIG Contact Tip M6 1.0mm (AF-MIG-CT-0005) | 15AK catalog reference group | reference only | NEEDS_FACTORY_CONFIRMATION | company catalog |
| compat-mig-15ak-tip-holder         | MIG Tip Holder for MB15 (AF-MIG-TH-0007)  | 15AK catalog reference group | reference only | NEEDS_FACTORY_CONFIRMATION | company catalog |
| compat-mig-15ak-gas-nozzle         | MIG Gas Nozzle for MB15 (AF-MIG-GN-0008)  | 15AK catalog reference group | reference only | NEEDS_FACTORY_CONFIRMATION | company catalog |

## Evidence Required Before Confirmation

### MIG Contact Tip M6 0.8mm (AF-MIG-CT-0004)

Current relationship: Contact tip - 0.8 mm catalog reference. Status: reference_only.

- Exact torch label and installed front-end arrangement
- Visible contact-tip marking or documented wire diameter
- Tip-holder thread and seating geometry from an approved sample or drawing

### MIG Contact Tip M6 1.0mm (AF-MIG-CT-0005)

Current relationship: Contact tip - 1.0 mm catalog reference. Status: reference_only.

- Exact torch label and installed front-end arrangement
- Visible contact-tip marking or documented wire diameter
- Tip-holder thread and seating geometry from an approved sample or drawing

### MIG Tip Holder for MB15 (AF-MIG-TH-0007)

Current relationship: Contact tip holder catalog reference. Status: reference_only.

- Exact torch label and complete front-end component order
- Contact-tip side and torch-neck side connection details
- Approved sample, drawing or measured reference for the complete holder geometry

### MIG Gas Nozzle for MB15 (AF-MIG-GN-0008)

Current relationship: Gas nozzle catalog reference. Status: reference_only.

- Exact torch label and installed front-end arrangement
- Nozzle profile, opening and attachment details
- Approved sample, drawing or clear front and side photographs

## Confirmation Gate

A relationship may change to `confirmed` only when its verification status is `CONFIRMED` and the evidence includes factory confirmation, a controlled drawing, an approved sample, a verified reference number or confirmed dimensions. Company-catalog grouping alone remains reference-only.

When evidence conflicts, retain the references internally, set `DATA_CONFLICT`, exclude the relationship from public projections and request review. Never resolve fitment from appearance alone.

## Workflow

1. Add or update the relationship in `lib/data/compatibility-relationships.ts`.
2. Record the subject, target, role, source, evidence basis, verification status and review date.
3. Keep buyer confirmation requirements specific to the product connection or assembly.
4. Run `npm run compatibility:validate` and `npm run compatibility:report`.
5. Run product-series, product, SEO and build checks before publication.
