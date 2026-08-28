# ArcFort Weld QA Checklist

Use this checklist after reading `AGENTS.md`. Select every gate affected by the task. A major task is
not complete until applicable checks pass or the final report clearly identifies a check that could
not run and why.

## 1. Scope And Change Safety

- [ ] Read `AGENTS.md`, `docs/DESIGN_SYSTEM.md`, `docs/CONTENT_RULES.md` and this checklist.
- [ ] Inspect relevant pages, components, styles, schemas, data and tests before editing.
- [ ] Check `git status`; identify and preserve unrelated user files and changes.
- [ ] State objective, affected components/files, risks and implementation sequence.
- [ ] Keep the batch to one global system, page family, component family or product series.
- [ ] Avoid route, data-schema or dependency changes unless required by buyer/business value.
- [ ] Append a task record to `docs/CHANGELOG_AI.md` for major work.

## 2. Business Identity And Claims

- [ ] Legal English and Chinese names match the central site configuration.
- [ ] Brand, website, email, WhatsApp and address are correct.
- [ ] Payment, MOQ, lead time, port and OEM wording match confirmed policy.
- [ ] No alternate company identity or unsupported manufacturer/authorized-distributor claim appears.
- [ ] No invented certification, capacity, customer, case, review, statistic, price, stock or guarantee
      appears.
- [ ] China-market language does not imply branches, dealer count or service-center coverage.
- [ ] Company imagery is real, approved and accurately labeled.

## 3. Product Data And Images

- [ ] Canonical SKU/category/slug identifiers remain stable unless a migration is planned.
- [ ] Exact technical values include a traceable source and verification status.
- [ ] Governed field-level values are projected from `lib/data/product-technical-facts.ts`, not copied
      into page components.
- [ ] Catalog references remain visibly qualified until exact-SKU confirmation evidence is recorded.
- [ ] Factory intake retains the original reference separately from confirmed values.
- [ ] Only `CONFIRMED` values are presented as confirmed ArcFort Weld specifications.
- [ ] Level D references are not the sole evidence for exact values.
- [ ] Conflicting sources are marked `DATA_CONFLICT` rather than silently resolved.
- [ ] Confirmed, reference and needs-confirmation compatibility are visibly distinct.
- [ ] Missing values use concise buyer guidance rather than repeated placeholder rows.
- [ ] Draft/placeholder/needs-photo products remain excluded from public generation and sitemap.
- [ ] Active product images exist, depict the listed product and have recorded provenance/usage rights.
- [ ] Every canonical main/gallery path has one matching product-image asset-registry row.
- [ ] `search_eligible` assets have exact-product match, approved rights, source owner, reviewer and date.
- [ ] `legacy_reference` assets are not described as confirmed exact-product or rights-approved images.
- [ ] Real product geometry, thread, holes, dimensions, shape and connections were not altered.
- [ ] Internal notes and source-only governance fields are not exposed publicly.

Run for product or SKU changes:

```bash
npm run products:validate
npm run products:check-images
npm run products:report
npm run images:assets:sync
npm run images:assets:generate
npm run images:assets:validate
npm run images:assets:report
npm run images:triage:validate
npm run technical:validate
npm run technical:report
npm run acquisition:report
```

For product-series evidence, category-family or public series changes, also run:

```bash
npm run series:validate
npm run series:components:generate
npm run series:components:validate
npm run series:components:report
npm run test:product-series
npm run series:report
npm run compatibility:validate
npm run compatibility:report
```

For factory technical confirmation or company-owned product-image intake, confirm that every
`CONFIRMED` technical row has a value, qualifying evidence, evidence reference, reviewer and date.
Confirm that every `approved` image row has ownership, usage rights, source file, reviewer, date and
an existing local asset. An unconfirmed row must never contain a shadow confirmed value.

Confirm that only `published` evidence records generate series routes and that every public
relationship points to an active product with reviewed imagery and traceable compatibility evidence.
Verify that public relationship projections come from the compatibility registry, confirmed states
have qualifying evidence, and `DATA_CONFLICT` or `unverified` records remain private.

For series-component intake, confirm that every candidate has exactly one `component_presence` fact
and one main-image request. Confirm that `DATA_CONFLICT` facts are `blocked`, SKU mappings point to a
canonical SKU, and no requested/received image is treated as approved. Generated component facts and
the component evidence report must have no CI drift.

For 15AK, also confirm that the exact-SKU queue (`15ak-product-image-intake.csv`) remains separate
from the catalog-component queue (`15ak-image-intake.csv`). A series candidate must not replace a
public product image or specification until an explicit SKU mapping and the normal evidence gates
have been completed.

For water- or liquid-cooled series, verify that coolant supply/return, gas, power and control roles
come from a controlled connection drawing or verified marking. A hose color, position or visually
similar connector must not be used to assign a media function or compatibility relationship.

For an internal factory-review workbook, reconcile per-series and total candidate, image-request and
conflict counts against the canonical CSV files. Confirm that stable IDs are preserved,
`notes_internal` is omitted, formulas contain no spreadsheet errors and blocked/conflict rows remain
visibly blocked. A completed workbook must be reconciled field by field and must not directly import,
publish or confirm repository data.

When the import source changed, also run the applicable preview/import workflow and verify generated
files have no unexpected drift.

## 4. Visual Design

- [ ] Palette follows `docs/DESIGN_SYSTEM.md`; engineering orange is limited to primary action.
- [ ] Typography roles, line lengths and heading hierarchy are consistent.
- [ ] Spacing follows the shared scale; page sections have sufficient breathing room.
- [ ] Product imagery is prominent, sharp, correctly oriented and consistently framed.
- [ ] Product cards allocate roughly 65-75% of their visual area to imagery.
- [ ] Borders, shadows, badges, pills and cards are used only when hierarchy needs them.
- [ ] No glassmorphism, neon, glow, particles, heavy parallax or constant motion appears.
- [ ] No card is nested inside another decorative card.
- [ ] CTA hierarchy is clear and does not overwhelm the viewport.
- [ ] The first viewport states what is supplied, for whom and the next action.
- [ ] The page feels manually designed for a serious industrial brand, not a template.

## 5. Responsive Review

Capture and inspect the changed experience at representative widths:

- [ ] 360px mobile
- [ ] 390px mobile
- [ ] 768px tablet
- [ ] 1024px tablet/small laptop
- [ ] 1280px laptop
- [ ] 1440px desktop

At each applicable width verify:

- [ ] Header and menu are operable; no inaccessible nested menu state.
- [ ] Hero hierarchy and visual crop remain intentional.
- [ ] Product/category grid columns and gaps are appropriate.
- [ ] Product gallery does not shift or crop evidence incorrectly.
- [ ] Technical tables stack or scroll without clipping.
- [ ] RFQ fields, errors, upload state and actions remain visible.
- [ ] Footer and contact details wrap cleanly.
- [ ] No horizontal overflow, clipped word, overlap or layout shift appears.
- [ ] Sticky contact/RFQ controls do not obscure content or browser controls.
- [ ] Tap targets are approximately 44 by 44 CSS pixels where practical.

Record screenshot paths or the exact reason visual verification could not run.

## 6. Accessibility

- [ ] Exactly one visible H1 exists on every indexable page.
- [ ] H2/H3 order is logical and not chosen for appearance alone.
- [ ] Navigation landmarks, main content, sections and footer are semantic.
- [ ] All controls are keyboard reachable in a sensible order.
- [ ] Focus indicators are visible against every surface.
- [ ] Buttons and links are semantically distinct.
- [ ] Inputs have persistent labels, useful errors and programmatic descriptions.
- [ ] Images have meaningful, concise alt text; decorative images are ignored appropriately.
- [ ] Text, icons, borders and states have sufficient contrast.
- [ ] Content remains usable with zoom and longer Chinese/English strings.
- [ ] Motion respects `prefers-reduced-motion`.

## 7. SEO And Discoverability

- [ ] Existing public URLs remain stable or have explicit redirects.
- [ ] Each important page has a unique title, meta description, canonical and one H1.
- [ ] Visible title/product/category names match metadata.
- [ ] Breadcrumbs match route hierarchy and BreadcrumbList JSON-LD.
- [ ] Product, FAQ, Organization and WebSite structured data match visible facts.
- [ ] Product schema omits unsupported `offers`, `review` and `aggregateRating`.
- [ ] Draft, placeholder, filtered, internal-search, duplicate and test pages are not indexable.
- [ ] Sitemap contains only canonical indexable URLs; robots remains valid.
- [ ] Changed pages link to relevant products, categories, applications, guides and RFQ.
- [ ] Repetitive navigation/CTA/footer text retains intended snippet controls.
- [ ] No hidden keyword block, doorway page, duplicated FAQ or keyword stuffing was added.

Run for important content, route or SEO changes:

```bash
npm run seo:audit
npm run seo:links
npm run seo:snippets
```

`seo:links` and `seo:snippets` may require a successful production build first.

## 8. RFQ And Contact

- [ ] Product/category/guide context reaches the RFQ page correctly.
- [ ] Name, company, email, WhatsApp, country, product/model, requirements, quantity, message and
      optional file behavior remain correct.
- [ ] Required, email-format, file-type and file-size validation works server-side.
- [ ] File names are sanitized and buyer content is not logged.
- [ ] Values are preserved on failure and submission has a bounded timeout.
- [ ] Failure does not auto-resubmit; email and WhatsApp fallback remain available.
- [ ] Stable RFQ reference and separate non-PII idempotency keys are preserved.
- [ ] BotID Basic protection remains on `POST /api/rfq`.
- [ ] Public copy distinguishes configured provider readiness from proven inbox delivery.

Run for RFQ/contact/API changes:

```bash
npm run test:rfq
```

After deployment, perform one controlled browser submission without automatic retry. Confirm the
same RFQ reference in the sales mailbox and buyer confirmation mailbox before claiming delivery is
proven.

## 9. Technical Checks

Run for frontend, shared component, route, script or site-image changes:

```bash
npm run lint
npm run typecheck
npm run build
npm run performance:budget
```

For production health-monitoring or live-audit changes, also run:

```bash
npm run test:live-audit
npm run health:production
```

Confirm that retries are limited to read-only requests and transient transport/status failures.
Deterministic HTTP errors and a retryable status that persists through the final attempt must still
fail the corresponding audit.

Also run focused tests for the changed domain. Available examples include:

```bash
npm run test:product-search
npm run test:mig-rfq
npm run test:tig-rfq
npm run test:plasma-rfq
npm run test:machine-rfq
npm run test:oem-rfq
npm run test:distributor-rfq
npm run test:company-profile
npm run test:quality-control
```

Confirm:

- [ ] Build completes and expected static/dynamic routes are generated.
- [ ] No broken import, hydration, console or runtime errors are introduced.
- [ ] New dependency has clear business value and is not decorative weight.
- [ ] Images have stable dimensions and responsive delivery.
- [ ] Performance budget was not increased to hide a regression.

## 10. Security And Privacy

- [ ] No secret, private token, credential or mailbox password exists in tracked changes.
- [ ] Environment-variable names are documented without values.
- [ ] Any credential exposed externally has been rotated at its provider.
- [ ] CSP and other security headers remain valid.
- [ ] Buyer PII is absent from analytics, URLs, logs, campaign IDs and public reports.
- [ ] Upload and API changes retain server-side validation and bounded resource use.
- [ ] Monitoring remains read-only and incidents contain no buyer data.

Run before commit or deployment:

```bash
npm run security:secrets
```

## 11. Pre-Commit Review

- [ ] Review `git diff` and `git diff --check`.
- [ ] Exclude unrelated and unreviewed user files.
- [ ] Confirm generated files are current and deterministic.
- [ ] Confirm no draft or unreviewed product became indexable.
- [ ] Confirm no SEO route or structured-data regression.
- [ ] Confirm the AI change-log entry accurately describes this batch.
- [ ] Summarize missing evidence and operational risks.

## 12. Post-Deployment Review

- [ ] Verify homepage, affected pages, canonical URLs and key assets on production.
- [ ] Verify `sitemap.xml` and `robots.txt`.
- [ ] Check `/api/rfq/status` and report email, buyer confirmation, attachments and storage separately.
- [ ] Confirm DKIM, SPF, custom MAIL FROM MX and DMARC independently; public DNS state does not prove
      inbox placement or credential rotation.
- [ ] Complete one controlled browser RFQ delivery check when RFQ behavior changed.
- [ ] Run `npm run security:audit:live`.
- [ ] Run `npm run indexing:submit -- --dry-run`.
- [ ] Submit IndexNow only after the deployed sitemap and key file are reachable.
- [ ] Confirm analytics/Search Console state without exposing verification values.
- [ ] Record deployment URL/commit and live verification in `docs/CHANGELOG_AI.md` when relevant.

## 13. Final Report Template

Every task should report:

- Files changed
- Components created, changed and removed
- Data changed
- Visual changes
- SEO impact
- Checks run and results
- Remaining placeholders/drafts
- Missing company/product evidence
- Deployment/live verification status
- Highest-impact next recommended step

Do not report a check as passed unless its output directly covers the claim. Do not treat provider
acceptance as inbox delivery, a build as visual verification, or file existence as image provenance.
