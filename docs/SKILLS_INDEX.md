# ArcFort Weld Core Skills Index

This index routes repeated ArcFort Weld business and publishing workflows to repository-level Codex
skills. The skills live under `.agents/skills/` and are automatically discoverable when their
frontmatter trigger matches a task. They may also be invoked explicitly with `$skill-name`.

Skills are subordinate to `AGENTS.md`, `docs/CODEX_GOAL.md`, non-superseded decisions and the
applicable design, content and QA rules. Loading a skill never grants permission to publish, deploy,
change production data or weaken an evidence gate.

## Core Skills

In this table, “database” includes canonical repository registries and external product databases.
“Publish” means making content production-visible or indexable, not preparing a local draft.

| Skill                                                                         | Purpose                                                           | Trigger                                                                             | Input                                                                               | Output                                                                                                        | May Modify Database?                                                          | May Publish?                          | Approval Required?                                                                   |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| [`product-data-ingestion`](../.agents/skills/product-data-ingestion/SKILL.md) | Normalize source files into governed product candidates           | Excel, CSV, PDF, technical sheet, factory measurement or product-list import        | Source file, origin, scope, import mode, canonical product source                   | Draft records, missing fields, duplicates, conflicts and handoff manifest                                     | Staging/draft only; canonical replacement requires approval; production DB no | No                                    | For canonical replacement, destructive import or external DB write                   |
| [`technical-verification`](../.agents/skills/technical-verification/SKILL.md) | Classify field-level technical facts and preserve evidence        | Exact value verification, source comparison or conflict review                      | SKU/field/value, exact evidence, scope and current governed fact                    | Verification record with one allowed status, source, conflict/confirmation requirement and public eligibility | Technical evidence registry only                                              | No                                    | To assign `CONFIRMED` or promote a fact publicly                                     |
| [`compatibility-mapping`](../.agents/skills/compatibility-mapping/SKILL.md)   | Build governed SKU/series/torch/machine/component relationships   | Fitment, replacement, series membership or related-product mapping                  | Canonical subject/target, relationship type, technical facts and evidence           | Relationship record, confidence state, duplicate/orphan/conflict findings                                     | Compatibility registry; confirmed state requires approval                     | No                                    | For confirmed/public compatibility or major reclassification                         |
| [`product-media-manager`](../.agents/skills/product-media-manager/SKILL.md)   | Map exact product media to SKU, role, provenance and rights       | Image intake, replacement, triage, missing-view or rights review                    | SKU, file, role, source owner, rights and match evidence                            | Governed asset record, edit log, missing-image and blocker report                                             | Product media registry and governed files                                     | No                                    | For rights approval, exact match, `search_eligible` or public main-image replacement |
| [`product-publishing`](../.agents/skills/product-publishing/SKILL.md)         | Assemble governed data into publication-ready product experiences | Product/page/batch preparation or explicitly approved publication                   | Canonical product, verified facts, compatibility, media, SEO target and RFQ context | Page candidate, readiness manifest, metadata/schema/links and release handoff                                 | Only within an explicitly scoped publishing task; never raw evidence          | Yes, only after QA and exact approval | Always for external publication; warnings require acceptance                         |
| [`seo-architecture`](../.agents/skills/seo-architecture/SKILL.md)             | Map keyword and buyer intent to one canonical page architecture   | Keyword mapping, Search Console analysis, cannibalization or internal-link planning | Route inventory, product readiness, market, intent and optional search data         | Keyword-intent-page-URL map, cannibalization findings and internal-link plan                                  | SEO plans/metadata only in scoped tasks; product facts no                     | No by default                         | For URL migration, bulk public SEO changes, index submission or provider writes      |
| [`release-qa`](../.agents/skills/release-qa/SKILL.md)                         | Return the final evidence-based release gate                      | Before publication, deployment or completion of a substantial public/data change    | Exact diff/commit, release scope, applicable rules and validation evidence          | `PASS`, `PASS_WITH_WARNINGS` or `BLOCKED` report                                                              | QA reports only; read-only by default                                         | No                                    | QA review no; external release approval remains separate                             |

## Invocation

Future tasks may invoke a skill explicitly:

```text
Use $product-data-ingestion to preview this factory spreadsheet.
Use $technical-verification to classify these 15AK measurements.
Use $compatibility-mapping to review these torch-to-component relationships.
Use $product-media-manager to map these exact-product photos to SKUs.
Use $seo-architecture to map these Search Console queries to existing URLs.
Use $product-publishing to prepare a local product-page candidate only.
Use $release-qa to gate commit <commit> for the stated release destination.
```

When the request clearly matches one skill, Codex may select it automatically. Use the smallest set
that covers the task; do not load all seven for an unrelated or read-only request.

## Controlled Workflow

The normal product lifecycle is:

1. `$product-data-ingestion` produces non-public structured candidates.
2. `$technical-verification` classifies exact field values.
3. `$compatibility-mapping` records evidence-backed relationships.
4. `$product-media-manager` establishes exact-image identity and rights.
5. `$seo-architecture` maps a ready product/system to one canonical search target.
6. `$product-publishing` prepares a local candidate from governed outputs.
7. `$release-qa` returns the final release status.
8. External publication occurs only with the exact required approval and a permitted QA result.

Technical verification, compatibility and media work may proceed in parallel when their inputs are
independent. Product publishing must wait for all critical upstream gates.

## Overlap And Conflict Boundaries

- Ingestion structures source data; it does not verify facts.
- Technical verification classifies individual values; it does not claim fitment.
- Compatibility mapping relates governed records; it does not create technical facts.
- Media management establishes image provenance and role; it does not identify a product from
  appearance alone.
- SEO architecture decides search ownership; it does not make a product publishable.
- Product publishing assembles approved inputs; it cannot promote their evidence state.
- Release QA judges the exact candidate; it does not fix, approve or publish its own findings.

If two skills appear to own the same mutation, stop at the upstream evidence owner and pass a
read-only handoff to the downstream skill. The canonical registries and non-superseded decisions
remain authoritative.

## Release Status Policy

- `PASS`: all applicable gates pass and required approval for the next action is present.
- `PASS_WITH_WARNINGS`: blocking gates pass, warnings are bounded, and owner acceptance is required
  before external release.
- `BLOCKED`: any critical gate, evidence requirement or approval is missing. Publishing is prohibited.

This setup creates workflow definitions only. It does not ingest, verify, map, publish or deploy any
product.

## Maintenance

After changing a core skill or this index, run:

```bash
npm run skills:validate
```

Also use the Codex `skill-creator` quick validator when available. Review descriptions manually so
automatic discovery remains precise; a structurally valid skill can still have an unsafe trigger or
overlapping mutation boundary.
