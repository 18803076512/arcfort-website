# Google Search Console Baseline - 2026-08-12

## Source and Scope

- Property: `arcfortweld.com`
- Source file: `arcfortweld.com-Performance-on-Search-2026-08-12.xlsx`
- Search type: Web
- Export range: Past 3 months
- Exported: 2026-08-12

This is an early-stage dataset. The device table contains 422 impressions and 8 clicks, while the
query table contains no clicked queries. Google can omit low-volume queries for privacy, so query
rows must not be treated as a complete attribution record. Avoid changing URLs or creating duplicate
pages from one or two impressions.

## Current Baseline

| Segment | Clicks | Impressions |   CTR | Average position |
| ------- | -----: | ----------: | ----: | ---------------: |
| Mobile  |      5 |          80 | 6.25% |            30.95 |
| Desktop |      3 |         341 | 0.88% |            39.49 |
| Tablet  |      0 |           1 | 0.00% |            50.00 |

Desktop generates most impressions but has materially lower CTR than mobile. Search snippets and
desktop category relevance should be monitored, while mobile usability remains protected through
responsive QA.

## Search Opportunities

### Priority 1: strengthen category relevance

| Page                                   | Impressions | Clicks | Average position | Action                                                                                                                                                                                |
| -------------------------------------- | ----------: | -----: | ---------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/products/plasma-cutting-consumables` |         155 |      0 |            51.10 | Align title and copy with `plasma cutter consumables`, `plasma torch consumables` and full-stack component intent. Add a dedicated full-stack guide and stronger product/guide links. |
| `/products/tig-torch-parts`            |          85 |      0 |            41.95 | Keep the component identification structure and align the snippet with `TIG torch parts`, `parts`, `consumables` and component-name searches.                                         |
| `/products/mig-mag-torch-parts`        |          28 |      0 |            37.46 | Add the same component, selection-variable and compatibility workflow depth already used for TIG and plasma.                                                                          |
| `/products`                            |          30 |      0 |            33.87 | Preserve the category-led catalog and strengthen internal links from guides and service pages.                                                                                        |

The leading non-brand query families are plasma cutter consumables, plasma cutting consumables,
plasma torch consumables and TIG torch parts. These terms should be covered naturally within the
matching category, not split into near-duplicate doorway pages.

### Priority 2: improve pages close to page one

| Page                                         | Impressions | Clicks | Average position | Action                                                                                                                   |
| -------------------------------------------- | ----------: | -----: | ---------------: | ------------------------------------------------------------------------------------------------------------------------ |
| `/guides/welding-machine-sourcing-checklist` |          17 |      0 |            11.18 | Improve title and meta description around distributor sourcing checklist intent; retain the existing URL.                |
| `/`                                          |          39 |      1 |            14.56 | Keep the current welding and cutting supplier positioning and monitor CTR after the latest title/description deployment. |
| `/products/welding-machines/wire-feeder`     |          11 |      0 |            16.55 | Obtain confirmed model and technical data before making deeper specification claims.                                     |
| `/rfq`                                       |           6 |      0 |            17.50 | Preserve the clear quote intent and confirm live email delivery before driving more search traffic.                      |

The MIG torch switch query and product page have appeared around page-one positions but with only one
or two impressions. Improve the existing MIG product snippet and component context; do not create a
second MIG switch page. The separate TIG Torch Switch URL recorded 9 impressions at average position
36, but its assigned catalog crop was later verified as a normal torch cable termination rather than
a dedicated switch. Product evidence takes priority over preserving an unsupported commercial page.

### Priority 3: protect commercial winners

- `/oem-service` generated 5 clicks from 22 impressions with 22.73% CTR at average position 12.68.
- `/guides/oem-welding-products-private-label-guide` generated 1 click from 3 impressions at average
  position 3.67.

OEM and private-label intent is the strongest observed commercial entry path. Preserve both URLs,
link relevant category and guide content to the OEM service, and avoid weakening their title intent.

## Changes Implemented From This Baseline

1. Refined MIG/MAG, TIG and plasma category snippets around the observed query language.
2. Added a full MIG/MAG component identification, selection and compatibility workflow.
3. Added `Plasma Cutter Consumables and Parts Guide` for complete-stack informational intent.
4. Improved the existing MIG torch switch product snippet instead of creating a duplicate page.
5. Refined the welding machine sourcing checklist snippet for distributor sourcing intent.
6. Preserved OEM service and private-label guide URLs as the current strongest commercial pathway.
7. Expanded the existing TIG parts identification guide with an assembly-based component reference,
   buyer checks and an evidence checklist instead of creating a competing TIG URL.
8. Added a structured OEM project brief download and tracked its download as a non-PII buyer-tool
   conversion, strengthening the highest-performing commercial pathway.
9. Expanded the existing plasma parts guide with a front-end component reference, evidence
   checklist and topic-specific RFQ fields instead of creating another competing plasma URL.
10. Added a plasma consumables RFQ workbook that connects each requested part to a torch reference,
    quantity, evidence ID and compatibility-review status, and linked it from the category, guide
    and Download Center.
11. Expanded the existing welding machine sourcing checklist with a buyer-versus-supplier decision
    matrix, distributor evidence checklist and topic-specific RFQ fields instead of changing its
    near-page-one URL.
12. Added a welding machine RFQ workbook for destination electrical inputs, documented performance
    requirements, accessories, market documents and approval checkpoints, with tracked links from
    the guide, category and Download Center.
13. Expanded the existing Wire Feeder product URL, which recorded 11 impressions at average position
    16.55, with equipment-specific search copy, selection variables, compatibility evidence, RFQ
    fields and a direct link to the welding machine RFQ workbook.
14. Updated the homepage search title around welding torch parts and plasma consumables after the
    homepage recorded 39 impressions at average position 14.56, while preserving its welding machine
    and OEM scope in the description and visible hero copy.
15. Reduced the mobile hero height, exposed direct email and WhatsApp contact on small screens, linked
    the first-viewport supply scope to commercial category pages and added immediate RFQ / worksheet
    actions after the hero.
16. Repositioned the product center around welding and cutting product-catalog intent after it recorded
    30 impressions at average position 33.87, and moved its product finder ahead of supporting buyer
    content.
17. Added buyer-language search aliases for observed query variants including plasma cutter
    consumables, TIG gun parts, GTAW torch components, spare parts and plural component names, with a
    regression test in the quality workflow.
18. Retired the unsupported TIG Torch Switch SKU from the public catalog, permanently redirected its
    existing URL to a focused replacement and compatibility guide, and added a buyer worksheet for
    handle, switch, control-lead, connector and machine evidence. This preserves the existing search
    path without presenting a cable-termination image as a switch product.
19. Expanded the plasma consumables category, which recorded 155 impressions and no clicks, with a
    company-catalog reference matrix for SP-60, A-81, PT-31, CB-50, LT-50, AG-60, TongChang60,
    SG-51 and P-80 series products. Added an interactive RFQ builder that carries the buyer's torch
    family, requested components, existing reference, quantity and packing requirement into the RFQ
    form without turning catalog references into universal compatibility claims.

## Measurement Plan

Review a fresh Search Console export after at least 28 days and compare:

- Impressions, average position and CTR for the three torch/consumable category pages.
- Query families containing `plasma cutter consumables`, `plasma torch consumables`, `TIG torch
parts` and `MIG welding torch parts`.
- CTR for the homepage and welding machine sourcing checklist.
- Clicks and assisted RFQ activity from OEM service and guide pages.
- Desktop CTR versus mobile CTR.
- Indexed status and canonical selection for newly added guide URLs.

Do not judge a content change from isolated one-impression queries. Use page-level trends, query
clusters and at least a 28-day comparison window.
