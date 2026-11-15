# 15AK Factory Evidence Workbook Handoff

## Purpose

The current ArcFort Weld 15AK Evidence Intake workbook is an internal collection aid that combines
the two documented catalog arrangements and the four governed public products in one reviewer
surface. Its five sheets contain:

- 46 assembly and component confirmation rows.
- 58 component and complete-torch image requests.
- 15 exact-SKU technical confirmation rows.
- 20 exact-SKU product image requests.

The generated local artifact is named `ArcFort-Weld-15AK-Evidence-Intake.xlsx`. It is kept under the
ignored `outputs/` workspace, not under `public/downloads/`, and must not be distributed as a public
catalog or indexed resource. The workbook deliberately omits every `notes_internal` field.

The workbook is not a product database and must not publish or confirm data automatically. The CSV
files in `data/intake/` and the governed registries remain the repository source of truth.

## Rebuild And Verify The Private Files

The previous handoff referred to a local artifact without retaining a generator. The reproducible
generator now reads all four canonical 15AK intake CSVs and creates the separate CT0006 file from
its independent CSV. From the repository root:

```bash
python -m venv /tmp/arcfort-evidence-review-venv
/tmp/arcfort-evidence-review-venv/bin/python -m pip install -r scripts/evidence-workbooks/requirements.txt
/tmp/arcfort-evidence-review-venv/bin/python scripts/evidence-workbooks/generate.py --as-of 2026-11-15
/tmp/arcfort-evidence-review-venv/bin/python scripts/evidence-workbooks/verify.py
```

Choose the actual preparation date for `--as-of`; it labels preparation only, not verification of a
product. The same source bytes and preparation date must produce byte-identical output. The verifier
independently opens the XLSX files, compares all non-internal source cells and stable IDs, checks the
two scopes remain separate, and repeats generation to a temporary location. It never imports
reviewer answers or updates canonical facts.

Outputs are `outputs/ArcFort-Weld-15AK-Evidence-Intake.xlsx`,
`outputs/ArcFort-Weld-CT0006-Evidence-Intake.xlsx` and
`outputs/evidence-workbooks-manifest.json`. The manifest retains source hashes and stable-ID to
worksheet-row mappings. Keep these reviewer files private; returned evidence is reconciled manually.

On a phone or in WPS/Excel, start with **Start Here**, then the four exact products in
**Product Technical** / **Product Images**. Orange columns accept reviewer input; grey columns retain
reference context and IDs. The sheets have an accidental-edit guard, not a confidentiality control.
Use separate originals or controlled evidence references, leave unknowns blank and return actual
reviewer/date information. Worksheet dates use native dates displayed as `yyyy-mm-dd`; normalize
them to ISO dates during the reviewed CSV transfer.

The 46 assembly candidates are a separate queue from the four existing product SKUs. Do not merge
similarly named components or move a candidate to a public SKU merely to complete a row. “Response
fields complete” is a collection checklist, not proof of source quality, rights, fit or approval.

`AF-MIG-CT-0006` is outside this four-product 15AK workbook. Its general M6 x 27 mm catalog
reference uses `data/intake/general-m6-27-contact-tip-technical-confirmation.csv` and the existing
product image asset task; do not replace it with the 15AK 25 mm reference. After exact-SKU evidence
is reviewed, a separate PR must map any CT0006 canonical technical facts to this independent queue
and update the technical validator before a public value is promoted.

Earlier handoffs named `arcfort-15ak-factory-evidence-intake.xlsx` as a four-product helper. Treat
any retained copy as historical; it is not required to regenerate the current package. Do not use
it for the 46-candidate component matrix or delete a retained copy without an archive decision.
The generated combined workbook is the current 15AK collection artifact.

## Workbook Sections

### Start Here

Shows the legal company, series scope, authority boundary, queue counts, controlled review workflow
and non-negotiable evidence rules. Formula-driven counts distinguish total rows, review-ready rows
and conflicts or blocked image decisions.

### Assembly Confirmation

Contains the 46 air-valve and standard complete-torch candidates. Pale-orange columns collect the
factory product name, proposed or existing SKU, technical values, commercial values, evidence,
status, reviewer and date. The two arrangements must remain separate until exact-product evidence
proves a shared component.

### Component Images

Contains 58 exact-candidate requests for complete layouts, main views, connection details, markings
and dimensional evidence. An approved row requires source owner, website-use rights basis, original
file name, reviewer, date and the governed local file.

### Product Technical

Contains 15 company-catalog reference values and blank reviewer fields. A row may move to
`CONFIRMED` only when all of these are present:

1. Confirmed value and unit where applicable.
2. Qualifying evidence type.
3. Specific evidence reference.
4. Reviewer name.
5. ISO review date.

Use `DATA_CONFLICT` when evidence disagrees. Do not choose a convenient value.

### Product Images

Contains 20 requested views across the four products. Record the original file, source owner,
website-use basis, review status, reviewer and date. Main, connection, dimensional and packaging
views must identify the same exact SKU or approved physical variant.

P0 provenance decisions for the existing active main images remain in the canonical image registry
and the private Airtable review surface. They are not duplicated in the combined workbook.

## Accepted Evidence

Use one or more of these sources:

- Factory product record for the exact SKU.
- Controlled drawing for the exact supplied variant.
- Approved physical sample with recorded measurement or comparison.
- Documented measurement record tied to the exact SKU.
- Original company-owned product photo.
- Supplier photo with documented website-use permission and exact-product match.

A company catalog is valid reference context but does not, by itself, confirm every ArcFort Weld SKU
field or compatibility relationship.

## Controlled Repository Update

After a product or factory reviewer completes the workbook:

1. Preserve every Candidate ID, Request ID, Record ID and SKU; do not rename rows in Excel.
2. Review every completed row against the separately attached or referenced evidence.
3. Transfer accepted assembly responses to `data/intake/15ak-series-confirmation.csv`.
4. Transfer accepted component-image responses to `data/intake/15ak-image-intake.csv`.
5. Transfer accepted product technical responses to
   `data/intake/15ak-technical-confirmation.csv`.
6. Transfer accepted product image responses to `data/intake/15ak-product-image-intake.csv`.
7. Transfer catalog-component responses only when the evidence names the exact
   assembly candidate; do not substitute a similarly named public SKU.
8. Update `data/assets/product-image-assets.csv` only after source, rights and exact-product review.
9. Update canonical product or compatibility data deliberately; do not copy unreviewed workbook
   fields into public product records.
10. Run:

```bash
npm run technical:validate
npm run technical:report
npm run series:components:validate
npm run series:components:report
npm run images:assets:validate
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

11. Review the diff and confirm that no draft, candidate, conflict or unverified relationship became
    indexable.

Do not import the workbook directly into the canonical CSV files. Reconciliation must be keyed by
the stable row identifiers and reviewed field by field.

## Prohibited Shortcuts

Do not infer dimensions, threads, material grades, OEM numbers, compatibility, packaging quantities,
ratings or certification from appearance. Do not remove watermarks or conceal image provenance. Do
not change product threads, holes, dimensions, connections or shape during image editing.
