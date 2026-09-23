# 15AK Catalog Component Evidence

## Purpose

Convert the two 15AK assembly forms shown in the Renqiu Ailesen company catalog into an auditable
factory-confirmation and image-collection queue. This record does not create a SKU, confirm a
BINZEL relationship or automatically restore the prepared 15AK series page.

## Sources

- PDF page 7, catalog pages 7-8: ORK 15AK air-valve torch arrangement.
- PDF page 8, catalog pages 9-10: ORK 15AK complete torch arrangement.
- Source level: A company-catalog evidence.
- Verification status: `NEEDS_FACTORY_CONFIRMATION`.

The catalog establishes that these named candidate rows appear in the company document. It does not
prove the exact ArcFort Weld supplied variant, final rating, universal fit or a relationship to an
existing public SKU.

## Governed Scope

| Assembly scope                        | Candidates | Field facts | Image requests |
| ------------------------------------- | ---------: | ----------: | -------------: |
| Air-valve arrangement                 |         23 |          75 |             29 |
| Standard complete-torch arrangement   |         23 |          73 |             29 |
| Shared series and assembly references |          - |          10 |              - |
| Total                                 |         46 |         158 |             58 |

The two arrangements deliberately retain separate nozzle, contact-tip, holder, insulator, swan-neck
and liner candidates. Repeated catalog names do not prove that the physical parts are identical.

## Canonical Records

- `data/evidence/product-series-component-facts.csv`: catalog values, source references, status and
  lifecycle.
- `data/intake/15ak-series-confirmation.csv`: exact candidate identity, proposed SKU, factory values
  and evidence review.
- `data/intake/15ak-image-intake.csv`: one main-image request for each candidate plus critical
  connection, marking and dimensional views.
- `lib/data/product-series-component-facts.ts`: generated runtime registry; never edit manually.
- `docs/product-series-component-evidence-report.md`: generated matrix and readiness summary.

The exact-SKU product workflow remains separate:

- `data/intake/15ak-technical-confirmation.csv`
- `data/intake/15ak-product-image-intake.csv`

## Candidate Groups

The air-valve arrangement records complete torch lengths, nozzle profiles, contact-tip material and
wire-size references, holder, insulator, swan neck, hexagon nut, air valve, air line, switch line,
liner options and cable assemblies.

The standard arrangement records complete torch lengths, nozzle profiles, contact-tip material and
wire-size references, holder spring, holder, insulator, swan neck, cable-support spring, rear
handle, adaptor nut, Euro connector, connector nut and liner options.

Catalog dimensions, threads, ratings, duty cycles and wire ranges remain reference values. They are
not confirmed ArcFort Weld specifications.

## Confirmation Gate

1. Identify the exact physical candidate and assembly form.
2. Record a factory specification, controlled drawing, approved sample, verified reference or
   measurement record.
3. Preserve the catalog reference and use `DATA_CONFLICT` when returned evidence differs.
4. Record a reviewer and ISO review date.
5. Approve imagery only after ownership, website-use rights, original file and exact-product match
   are documented.
6. Create or map a SKU only after identity and evidence are complete.
7. Add a compatibility relationship separately; catalog grouping is never sufficient.

Run `npm run series:components:validate`, `npm run series:components:report`, product, compatibility,
image, SEO and build checks before any publication decision.

## Reviewer Workbook

The local `ArcFort-Weld-15AK-Evidence-Intake.xlsx` workbook projects the 46 candidates, 58 component
image requests and the separate exact-SKU product queues into one factory-review surface. It keeps
stable IDs, catalog reference text and confirmation requirements visible while highlighting only
reviewer-input cells.

The workbook is not canonical data, excludes internal notes and cannot promote a candidate, image or
technical fact automatically. Reconcile returned rows by stable ID through
`docs/operations/15ak-factory-evidence-handoff.md` before changing any CSV or public state.
