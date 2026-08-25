# MIG/MAG Product Series Evidence Registry

## Purpose

The canonical registry is `lib/data/product-series-evidence.ts`. It separates company-catalog proof
that a named product family exists from proof that an exact ArcFort Weld SKU fits that family.

Source document: Renqiu Ailesen welding catalog PDF. Public copy:
`/downloads/renqiu-ailesen-welding-catalog.pdf`.

## Reviewed Series

| Series | PDF page | Catalog pages | Current public status |
| --- | ---: | --- | --- |
| ORK 200A | 4 | 1-2 | Evidence review |
| ORK 350A | 5 | 3-4 | Evidence review |
| ORK 500A | 6 | 5-6 | Evidence review |
| 15AK | 7-8 | 7-10 | Published with reference-only relationships |
| 24KD | 9 | 11-12 | Evidence review |
| 25AK | 10 | 13-14 | Evidence review |
| 36KD | 11 | 15-16 | Evidence review |
| 40KD | 12 | 17-18 | Evidence review |
| 501D | 13 | 19-20 | Evidence review |
| 602 | 14 | 21-22 | Evidence review |

The registry records only the visible component-family scope and source pages. It does not import
ratings, dimensions, material grades, compatibility or OEM references as confirmed ArcFort Weld
product specifications.

## Current Public Boundary

Only 15AK has canonical active products, reviewed product images and governed relationships required
by the current public series template. The other nine records are available as exact catalog-series
choices in the MIG/MAG RFQ builder but do not create indexable series pages.

## Required Evidence For Expansion

- Exact product-to-series SKU mapping for every component to be published
- Reviewed exact-product main and connection-detail images with documented usage rights
- Approved sample, drawing, verified reference or factory-confirmed fitment record
- Product-specific data source, verification status, reviewer and review date
- Clear distinction between reference-only and confirmed compatibility

Use `npm run series:validate` and `npm run series:report` after every registry change.
