# Public Product Qualifications

Date: 2026-11-25. Scope: existing product cards, company commercial copy, product projections and
public product/distributor downloads. This corrects lost qualifications; it does not approve new
product facts or change order policy.

## Observed Gaps

The public card projection retained a technical row's value but discarded its public note. CT0004
and CT0005 therefore displayed E-Cu / CuCrZr without the adjacent catalog/quoted-SKU confirmation
note supplied by the governed technical projection.

Existing generic product MOQ and lead-time defaults also omitted conditions from the approved
company policies. Public summaries and downloads could imply trial-order eligibility for every
standard product or omit deposit confirmation as the regular schedule's starting condition.

## Source And Projection Rules

- Keep technical values and public notes together wherever the card shows that row. A dense-mobile
  row that is hidden must hide both. Use only the existing public `SpecRow.note`, never internal
  evidence notes. Material options remain catalog references requiring supplied-grade confirmation.
- The approved Level A `claim-moq-policy` and `claim-regular-lead-time` rows in
  [company claims](../../data/evidence/company-claims.csv) retain authority. Trial orders apply to
  selected standard products; OEM MOQ depends on product and packaging. Regular timing is normally
  7-20 working days after deposit confirmation, subject to order review.
- [Site configuration](../../lib/content/site.ts) projects those company conditions. Both lead-time
  properties share the same qualified regular-order wording.
- [The public commercial adapter](../../lib/content/public-commercial-terms.ts) recognizes only
  the exact two old generic defaults. It replaces them with existing qualified company guidance in
  product specifications, product commercial fields and downloadable product rows. Other values,
  including blanks, custom terms and whitespace variants, remain verbatim. This is not general
  validation or approval of custom order terms.
- Future simple-import defaults use the qualified company wording. This batch does not run a
  canonical import. Raw product records, technical facts, review/status/date fields and evidence
  registries remain unchanged.
- The distributor PDF reads approved, confirmed Level A policy rows with source/reviewer/date and
  fails generation if they do not qualify. Longer terms must wrap inside their existing table rows.
  Product-list-only generation must preserve the separate RFQ template.

## Validation And Remaining Gates

Verify exact legacy mapping, selective/custom preservation and approved-source conditions; reconcile
all public CSV rows by SKU and inspect the changed PDF page. Check actual visible cards where the
value is shown, including ordinary and dense layouts, and product specification/delivery sections.
Keep baseline and post-change browser/HTTP observations separate from source and deployment proof.

No SKU, image, compatibility, quotation or inbox result is promoted. The first CT0004 original
technical/media package, real analytics and sales activity remain independent inputs. A correction
that exposes internal notes, changes raw evidence, drops custom terms or changes unrelated RFQ
template bytes must be withheld or reverted through the existing repository workflow.
