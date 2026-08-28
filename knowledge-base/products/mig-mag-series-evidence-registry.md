# MIG/MAG Product Series Evidence Registry

## Purpose

The canonical registry is `lib/data/product-series-evidence.ts`. It separates company-catalog proof
that a named product family exists from proof that an exact ArcFort Weld SKU fits that family.

Source document: Renqiu Ailesen welding catalog PDF. Public copy:
`/downloads/renqiu-ailesen-welding-catalog.pdf`.

## Reviewed Series

| Series   | PDF page | Catalog pages | Current public status                   |
| -------- | -------: | ------------- | --------------------------------------- |
| ORK 200A |        4 | 1-2           | Evidence review                         |
| ORK 350A |        5 | 3-4           | Evidence review                         |
| ORK 500A |        6 | 5-6           | Evidence review                         |
| 15AK     |      7-8 | 7-10          | Evidence review - exact images required |
| 24KD     |        9 | 11-12         | Evidence review                         |
| 25AK     |       10 | 13-14         | Evidence review                         |
| 36KD     |       11 | 15-16         | Evidence review                         |
| 40KD     |       12 | 17-18         | Evidence review                         |
| 501D     |       13 | 19-20         | Evidence review                         |
| 602      |       14 | 21-22         | Blocked - catalog identity conflict     |

The registry records only the visible component-family scope and source pages. It does not import
ratings, dimensions, material grades, compatibility or OEM references as confirmed ArcFort Weld
product specifications.

## Current Public Boundary

No MIG/MAG series currently meets the complete public-series gate. Nine non-blocked records remain
available as bounded catalog-series choices in the MIG/MAG RFQ builder but do not create indexable
series pages. The 602 record is private because PDF page 14 uses a 501D header while the same page's
complete-torch and technical table identifies 602. The prepared 15AK candidate has canonical
products and four governed reference-only relationships, but its linked main images remain
`legacy_reference` with unresolved usage rights or exact-product identity. Its former public URL
temporarily redirects to the MIG/MAG category and can be restored after the image and relationship
gates pass.

## Factory Review Workbook

The local `ArcFort-Weld-MIG-MAG-Series-Evidence-Intake.xlsx` workbook projects the governed 24KD,
25AK, 36KD, 40KD and 501D queues into one factory-review surface. It contains 121 component
candidates, 181 candidate-specific image requests and 13 controlled source conflicts. The 602 queue
is newer than this ignored workbook and remains in `data/intake/602-series-confirmation.csv` and
`data/intake/602-image-intake.csv` until a deliberate workbook refresh is completed.

The workbook is not canonical data, excludes internal notes and cannot promote a candidate, fact,
image or relationship automatically. Review-ready formulas only indicate that the required handoff
fields are populated. Reconcile returned rows by stable Candidate ID, Request ID and Fact ID through
`docs/operations/mig-mag-series-evidence-handoff.md` before changing any repository state.

## Required Evidence For Expansion

- Exact product-to-series SKU mapping for every component to be published
- Reviewed exact-product main and connection-detail images with documented usage rights
- Approved sample, drawing, verified reference or factory-confirmed fitment record
- Product-specific data source, verification status, reviewer and review date
- Clear distinction between reference-only and confirmed compatibility

Use `npm run series:validate` and `npm run series:report` after every registry change.
