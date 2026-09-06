# MIG/MAG Series Evidence Workbook Handoff

## Purpose

`ArcFort-Weld-MIG-MAG-Series-Evidence-Intake.xlsx` is an internal factory-review workbook for the
24KD, 25AK, 36KD, 40KD, 501D and blocked 602 catalog evidence groups. It combines the existing
controlled confirmation, image and conflict queues in one reviewer surface:

| Series | Component candidates | Image requests | Source conflicts |
| ------ | -------------------: | -------------: | ---------------: |
| 24KD   |                   23 |             34 |                3 |
| 25AK   |                   21 |             31 |                3 |
| 36KD   |                   24 |             35 |                2 |
| 40KD   |                   24 |             35 |                2 |
| 501D   |                   29 |             46 |                3 |
| 602    |                   22 |             37 |                1 |
| Total  |                  143 |            218 |               14 |

The workbook is kept under the ignored `outputs/` workspace. It is not a public catalog, product
database or website download. It deliberately omits every `notes_internal` field.

## 602 Blocked Scope

The workbook now includes the 22 candidates, 37 image requests and one blocked identity conflict
from:

- `data/intake/602-series-confirmation.csv`
- `data/intake/602-image-intake.csv`
- `data/evidence/product-series-component-facts.csv`

These rows exist to collect resolution evidence, not to select a catalog value. The company page
conflicts between a 501D header and 602 complete-torch and technical tables. Do not resolve that
identity by copying adjacent 501D values, by treating the table as automatically authoritative or by
using visual similarity. Exact identity requires a factory record, controlled drawing, approved
sample, verified reference or confirmed measurement tied to the reviewed variant.

Repository CSV files and governed TypeScript registries remain authoritative. Completing a workbook
row does not create a SKU, confirm a specification, approve an image, establish compatibility or
publish a series page.

## Workbook Sections

### Start Here

Defines the legal company, six-series scope, queue totals, controlled review process and evidence
rules. Formula-driven counts show review-ready and blocked/conflict states without changing source
data. The 602 warning remains visible in this section.

### Series Summary

Shows formula-driven candidate, image and conflict counts for each series. Review-ready counts depend
on the completed evidence fields in the workbook. They are a handoff check, not a publication state.

### Component Confirmation

Contains 143 stable candidate rows sourced from:

- `data/intake/24kd-series-confirmation.csv`
- `data/intake/25ak-series-confirmation.csv`
- `data/intake/36kd-series-confirmation.csv`
- `data/intake/40kd-series-confirmation.csv`
- `data/intake/501d-series-confirmation.csv`
- `data/intake/602-series-confirmation.csv`

Pale-orange columns collect factory names, proposed SKU identifiers, technical and commercial values,
evidence, reviewer and date. `REVIEW READY` requires a `CONFIRMED` decision plus evidence type,
evidence reference, reviewer and ISO date. It does not bypass repository review.

### Image Intake

Contains 218 candidate-specific requests sourced from the six corresponding `*-image-intake.csv`
files. An approved row requires source owner, website-use basis, original file name, reviewer and ISO
date. A received file alone does not prove ownership, rights or exact-product identity.

### Conflict Register

Contains the 14 `DATA_CONFLICT` facts from
`data/evidence/product-series-component-facts.csv`. Each row preserves the company-catalog value,
comparison value, both references and the conflict explanation. A row remains blocked until all of
these are present:

1. Factory resolution for the exact variant.
2. Qualifying evidence type.
3. Specific evidence reference.
4. Decision status supported by the evidence.
5. Reviewer name and ISO review date.

Do not select a catalog or comparison value because it appears more typical. Use the exact supplied
variant and qualifying evidence.

## Accepted Evidence

Use one or more of these sources tied to the exact candidate or variant:

- Factory product record or specification.
- Controlled drawing.
- Approved physical sample.
- Verified reference number.
- Confirmed dimensions or documented measurement record.
- Packaging record for packaging fields.
- Original company-owned product photo.
- Supplier photo with documented website-use permission and exact-product match.

The Renqiu Ailesen company catalog and official OEM comparison documents are important reference
evidence, but neither confirms the final ArcFort Weld supplied product without exact-item review.

## Controlled Repository Reconciliation

After a factory or product reviewer returns the workbook:

1. Preserve every Candidate ID, Request ID, Fact ID and Series Evidence ID.
2. Open and review every referenced record, drawing, sample, measurement or original image.
3. Reconcile component responses to the matching series confirmation CSV by Candidate ID.
4. Reconcile image responses to the matching series image-intake CSV by Request ID.
5. Reconcile conflict decisions to `product-series-component-facts.csv` by Fact ID while preserving
   both original references.
6. Use `DATA_CONFLICT` when returned evidence still disagrees or has uncertain variant scope.
7. Create a canonical product only after exact identity, technical evidence and approved imagery are
   complete.
8. Record product-to-series or compatibility relationships separately; catalog grouping alone stays
   `reference_only`.
9. Update image assets only after source, rights, exact-product match, reviewer and date are real.
10. Run:

```bash
npm run series:components:generate
npm run series:components:validate
npm run series:components:report
npm run series:validate
npm run series:report
npm run compatibility:validate
npm run compatibility:report
npm run images:assets:validate
npm run images:assets:report
npm run products:validate
npm run products:report
npm run seo:audit
npm run lint
npm run typecheck
npm run build
```

11. Review the diff and confirm that no candidate, unresolved conflict, unverified relationship or
    rights-unconfirmed image became public or indexable.

Do not import the workbook directly over canonical CSV files. Reconciliation must be keyed by stable
IDs and reviewed field by field.

## Publication Boundary

24KD, 25AK, 36KD, 40KD and 501D remain `evidence_review`; 602 remains `blocked`. The workbook does not
create public routes, metadata, structured data, sitemap entries or RFQ compatibility claims.
Publish a series only after canonical products, reviewed exact-product imagery and governed
relationships satisfy the existing series publication gate. Resolve the 602 page-identity conflict
before evaluating it for any later publication state.
