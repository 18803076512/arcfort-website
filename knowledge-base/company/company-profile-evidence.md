# ArcFort Weld Company Profile Evidence

Evidence baseline: 2026-09-01

## Purpose

Keep confirmed company identity and commercial statements separate from unsupported manufacturing,
certification, capacity and customer claims. Public pages should project approved records from the
governed company-claim registry rather than create independent facts in page components.

## Canonical Sources

- `data/evidence/company-claims.csv` stores claim-level source, verification and publication state.
- `lib/content/site.ts` is the current runtime projection for confirmed public company information.
- `AGENTS.md#confirmed-identity` records the owner-confirmed repository baseline.
- `data/assets/company-media-assets.csv` governs site-level company and representative media.

The claim registry contains 16 approved Level A records and six deliberately blocked claim topics.
The approved records cover legal identity, brand, website, contact information, location, ports,
payment policy, order timing, MOQ policy and OEM scope. They do not establish factory ownership,
certification, capacity, customer cases, distributor coverage or export volume.

## Public Positioning Boundary

The safe default positioning is `industrial welding and cutting supplier`. ArcFort Weld may describe
nationwide supply, distributor cooperation, technical support and evidence-backed OEM support. It
must not describe the legal entity as a certified manufacturer, factory owner or authorized
distributor until matching Level A evidence is registered and reviewed.

Commercial policies are company-level guidance, not product-specific promises. A product page must
not convert the general MOQ or lead-time policy into an exact quantity or delivery date without
order-specific evidence.

## Media Boundary

The three current files under `public/images/site/` are registered as `representative_only` and
`legacy_reference`. They are not evidence of an ArcFort Weld factory, production line, inspection
process, warehouse, shipment, customer project or exact SKU. Their ownership and website-use basis
still require confirmation.

Real company evidence requires the original file, subject identity, source owner, company ownership,
approved usage rights, reviewer and ISO review date. Generated or representative visuals cannot be
promoted to `company_evidence`.

## Update Workflow

1. Add or edit the claim or media row without changing its source evidence.
2. Use `CONFIRMED` only for Level A evidence with reviewer and date.
3. Keep unsupported or conflicting claims `blocked`.
4. Run `npm run company:evidence:validate`.
5. Review any public projection separately; registry approval does not deploy a website change.

## Evidence Still Needed

- Legal registration material suitable for internal verification and any approved public excerpt.
- Evidence clarifying supplier, manufacturer and factory-ownership roles.
- Current scoped certification documents before any certification statement.
- Company-owned factory, production, inspection, packing, warehouse and shipment photographs.
- Permissioned customer or distributor evidence before any named case, logo or coverage claim.
