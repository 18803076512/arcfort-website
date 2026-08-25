# ArcFort Weld AI Change Log

This append-only log records major Codex decisions so future sessions can understand what changed,
why it changed and which risks remain. Add the newest entry at the top, below this introduction. Do
not include secrets, buyer PII, private prospect data or unconfirmed claims.

## 2026-08-21 - V2 Phase 7 Product Image Asset Governance

**Task**

Created a canonical product-image asset registry and evidence gate so file existence, visual match,
source, ownership, usage rights and search eligibility are reviewed separately. Existing public
images remain available through an explicit migration state while exact-product replacements are
collected.

**Files Changed**

- `data/assets/product-image-assets.csv` and `lib/data/product-image-assets.ts` - added the canonical
  46-row image evidence registry and generated runtime data.
- `scripts/product-image-asset-utils.ts`, `scripts/manage-product-image-assets.ts` and
  `scripts/report-product-image-assets.ts` - added initialization, append-only sync, generation,
  validation, file inspection, duplicate detection and readiness reporting.
- `lib/content/schemas.ts` and `lib/content/product-images.ts` - added typed asset governance and
  registry-driven display/search selectors.
- `components/content/ProductGallery.tsx`, `ProductVisual.tsx`, `ProductCard.tsx` and
  `ProductOverview.tsx` - routed product-card and detail-gallery images and alt text through the
  governed asset layer.
- `data/import/products.csv`, `lib/data/products.ts` and
  `public/images/products/tig-collet-body-reference.jpg` - replaced the unsupported cross-category
  TIG collet-body image assignment with a visibly TIG accessory-group reference while retaining an
  explicit exact-variant confirmation boundary.
- `package.json`, `.github/workflows/quality.yml` and
  `scripts/report-acquisition-readiness.ts` - added image asset commands, CI drift checks and
  acquisition-readiness counts.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md`,
  `docs/product-image-source-audit.md`, `docs/product-image-asset-report.md` and
  `knowledge-base/assets/product-image-governance.md` - documented the evidence states, replacement
  workflow, QA gate and current work queue.

**Components Changed**

- Product cards and product galleries now display only registered non-blocked assets.
- Search metadata, Product/WebPage JSON-LD and image sitemap paths continue using the existing search
  selector, now backed by the asset registry.
- No component or public route was removed.

**Data Changed**

- Registered 46 paths across 43 products: 43 migration-period public references and 3 blocked draft
  assets.
- Recorded 14 company-catalog crops, 23 local supplier-archive references and 9 assets with unknown
  original source.
- No image was labeled company-owned, exact-product, rights-approved or newly search-eligible.
- Retained two same-family duplicate-image groups for contact-tip and ceramic-cup variants; the
  unsupported cross-category MIG diffuser/TIG collet-body duplicate was removed.
- No SKU, route, technical value, compatibility claim, OEM number, certification or price changed.

**Visual Changes**

- The TIG Collet Body page now uses a TIG accessory-group reference containing visible collet-body
  components instead of the prior MIG diffuser image.
- Existing layout, CTA hierarchy, responsive grids and reference-image caption remain unchanged.

**SEO Impact**

- Product URLs, canonicals, metadata copy, structured-data shape, sitemap routes and internal links
  are unchanged.
- Existing migrated image URLs remain in search metadata to avoid an uncontrolled removal. New image
  search eligibility now requires approved rights, exact-product match, known source/owner, source
  file, reviewer and date.

**Validation**

- Product CSV validation passed for 43 products; image file checks retained the three expected
  non-blocking `needs_photo` warnings.
- Image asset validation passed for 46 assets with no errors; it reported 43 usage-rights migration
  warnings and two same-family duplicate-content groups.
- Product-series, compatibility, field-level technical evidence, product-series relationship and
  product-search checks passed.
- ESLint, TypeScript and the Next.js production build passed; 91 pages were generated.
- SEO, built internal-link, snippet-hygiene, performance-budget and repository secret checks passed.
- Playwright verified Product Center, TIG Collet Body and MIG Diffuser at 360, 390, 768, 1024, 1280
  and 1440 pixels: all 18 combinations returned 200, had one H1, no horizontal overflow and no broken
  images after forced lazy-load completion. TIG and MIG pages resolved distinct governed assets.

**Known Issues**

- No registered image has approved usage rights or exact-SKU company-owned evidence yet.
- Nine image records still have unknown original source; 35 assets are below 1000 pixels on at least
  one side and one is below 600 pixels on at least one side.
- Three draft products remain blocked pending dedicated product photos.
- Existing contact-tip and ceramic-cup variants still share same-family reference content.
- No deployment or controlled production-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Collect the 15AK company-owned image intake first, record source owner and usage approval, and
  promote only exact-product assets that pass the registry gate.

## 2026-08-21 - V2 Phase 6 Field-Level Technical Evidence And Factory Intake

**Task**

Created a field-level technical evidence layer for the four governed 15AK products and a structured
factory confirmation and company-owned image intake pack. Product specification rows now resolve
from evidence records when a governed fact exists instead of relying only on undifferentiated flat
product fields.

**Files Changed**

- `lib/content/schemas.ts`, `lib/data/product-technical-facts.ts` and
  `lib/content/product-technical-facts.ts` - added the technical-fact schema, 15 catalog-reference
  records and evidence-safe public projection.
- `content/products.ts` - uses governed technical rows for the four 15AK products while preserving
  legacy product fields as fallback for all other records.
- `data/intake/15ak-technical-confirmation.csv` and `data/intake/15ak-image-intake.csv` - added
  factory-return fields and 20 product photography requests without pre-filling unconfirmed results.
- `scripts/product-technical-evidence-utils.ts`, `scripts/test-product-technical-facts.ts` and
  `scripts/report-product-technical-evidence.ts` - added validation and readiness reporting.
- `package.json`, `.github/workflows/quality.yml`, `scripts/report-product-series-readiness.ts` and
  `scripts/report-acquisition-readiness.ts` - integrated the technical evidence gate into CI and
  operational reports.
- `scripts/check-secret-patterns.ts` - extended pre-commit scanning to tracked and untracked
  non-ignored repository files.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md`,
  `knowledge-base/technical/15ak-technical-evidence-workflow.md` and
  `docs/product-technical-evidence-report.md` - documented the workflow, evidence boundary and
  current readiness.

**Components Changed**

- No component was removed or structurally redesigned. Existing Specification Table and Product
  Overview components receive more precise evidence-governed rows through the product adapter.

**Data Changed**

- Added 15 field-level references for M6 0.8 mm and 1.0 mm contact tips, the 15AK tip holder and the
  three catalog nozzle profiles.
- All 15 facts remain `NEEDS_FACTORY_CONFIRMATION`; none was promoted to a confirmed ArcFort Weld
  specification.
- Added 20 company-owned photography requests covering main, functional detail, dimensional and
  packaging evidence. All remain `requested`.
- No SKU, product route, compatibility status, OEM number, price, certification or company fact was
  changed.

**Visual Changes**

- The four 15AK product pages show discrete material, wire-size, length, connection and nozzle-variant
  reference rows with explicit confirmation notes.
- Product layouts, images, CTA hierarchy and responsive structure remain unchanged.

**SEO Impact**

- Product URLs, canonical metadata, structured data, sitemap and internal links are unchanged.
- Buyer-visible technical terminology is more precise while unconfirmed values remain qualified.

**Validation**

- Technical evidence validation passed for 15 facts, 15 factory intake rows and 20 image requests
  with no errors or warnings.
- Product validation passed for 43 records; series evidence, public series relationships,
  compatibility relationships and product search tests passed.
- The product image check retained three non-blocking existing `needs_photo` warnings.
- ESLint, TypeScript and the Next.js production build passed; 91 pages were generated.
- SEO, built internal-link, snippet-hygiene and performance-budget checks passed.
- The expanded secret scan checked 287 tracked and untracked text files with no high-confidence
  finding.
- Playwright verified the four governed product pages at 360, 390, 768, 1024, 1280 and 1440 pixels:
  one H1, no horizontal overflow, all expected technical labels, visible catalog-reference notes,
  valid product WebPage schema, no unsupported Product rich-result data and no broken images.
- Manual mobile and desktop screenshot review found no overlap, clipping or CTA conflict.

**Known Issues**

- No 15AK field-level fact has exact-SKU factory, drawing, approved-sample or measurement evidence.
- No company-owned image request is approved yet; existing reviewed supplier images remain in use.
- The complete 15AK insulator, spring, swan-neck and liner matrix remains undocumented.
- No production deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Return the two 15AK intake CSV files with factory values, evidence references and company-owned
  source images, then upgrade only the records that pass the evidence gate.

## 2026-08-21 - V2 Phase 5 Compatibility Relationship Registry

**Task**

Created the canonical compatibility relationship layer and migrated the four public 15AK
product-to-series relationships out of the series record. Public series tables and product reverse
links now derive from one evidence-governed registry.

**Files Changed**

- `lib/content/schemas.ts` - added reusable relationship, entity and evidence-basis types for future
  Product, Series, Torch, Machine and OEM Reference connections.
- `lib/data/compatibility-relationships.ts` - added the four source-backed 15AK relationship records,
  confirmation requirements and internal evidence notes.
- `lib/content/compatibility.ts`, `lib/data/product-series.ts` and
  `lib/content/product-series.ts` - added evidence-safe selectors and changed public/reverse series
  relationships to use the registry.
- `scripts/test-compatibility-registry.ts`, `scripts/report-compatibility-readiness.ts`, `package.json`
  and `.github/workflows/quality.yml` - added confirmation gates, generated reporting and CI checks.
- `scripts/report-product-series-readiness.ts`, `scripts/report-acquisition-readiness.ts`,
  `docs/product-series-readiness-report.md`, `docs/compatibility-readiness-report.md` and
  `docs/acquisition-readiness-report.md` - integrated compatibility state into operational reports.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md` and
  `knowledge-base/compatibility/compatibility-registry.md` - documented the canonical source,
  confirmation gate and maintenance workflow.

**Components Changed**

- No public component was added, removed or visually redesigned.
- Existing Product Series and Product Detail components receive the same public relationship shape
  from the new registry.

**Data Changed**

- Added four product-to-series compatibility records for the two 15AK contact tips, tip holder and
  gas nozzle.
- All four remain `reference_only`, `NEEDS_FACTORY_CONFIRMATION` and buyer-confirmation required.
- No confirmed compatibility, OEM number, dimension, rating, price, certification or product
  specification was added.

**Visual Changes**

- No intentional visual change. The 15AK series table still shows four catalog-reference rows and
  the four related product pages retain one 15AK reverse link.
- Internal relationship notes are never rendered in public HTML.

**SEO Impact**

- Preserved every URL, canonical, metadata record, structured-data type, sitemap entry and internal
  link destination.
- The unpublished 24KD series route still returns 404 and remains outside the sitemap.

**Validation**

- Compatibility registry validation passed for four relationships: zero confirmed, four
  reference-only and four requiring confirmation.
- Product-series validation passed for one series and four generated public relationships.
- ESLint, TypeScript and the Next.js production build passed; 91 pages were generated.
- Playwright verified the series relationship table at 360, 768 and 1440 pixels, all four product
  reverse links, exclusion of the unrelated M6 1.2 mm tip, hidden internal notes and the unpublished
  24KD 404 response.

**Known Issues**

- No relationship has enough evidence to become `confirmed`.
- 15AK still needs the exact torch arrangement, complete component stack, connection evidence and
  company-approved image set.
- The registry does not yet contain Product-to-Torch, Product-to-Machine or OEM Reference entities;
  these must be added only from real evidence.
- No production deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Create the 15AK factory confirmation and image intake pack, then update the registry only from the
  returned drawing, sample, measurement and photo evidence.

## 2026-08-21 - V2 Phase 4 MIG/MAG Series Evidence Registry

**Task**

Converted the MIG/MAG catalog-family references from grouped page copy into a governed evidence
registry. The category page and RFQ builder now distinguish 10 exact company-catalog series while
only the evidence-ready 15AK record generates a public series page.

**Files Changed**

- `lib/data/product-series-evidence.ts` - added the canonical evidence, source-page, publication,
  image and missing-data records for 15AK, 24KD, 25AK, 36KD, 40KD, 501D, 602 and ORK
  200A/350A/500A.
- `lib/content/schemas.ts` and `lib/data/product-series.ts` - linked category and public series data
  to stable evidence IDs and made the 15AK source boundary inherit from the registry.
- `content/categories.ts` and `components/content/CategoryPageTemplate.tsx` - replaced grouped manual
  series data with 10 exact evidence-driven reference families and corrected the catalog source line.
- `scripts/test-product-series-evidence.ts`, `scripts/report-product-series-readiness.ts`,
  `scripts/test-mig-rfq-builder.ts` and `package.json` - added publication-gate validation, reporting
  and exact RFQ option tests.
- `.github/workflows/quality.yml` - added series validation, relationship testing and generated-report
  drift checks to CI.
- `scripts/report-acquisition-readiness.ts`, `docs/acquisition-readiness-report.md` and
  `docs/product-series-readiness-report.md` - added catalog-series coverage and the expansion work
  queue.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md` and
  `docs/catalog-product-data-audit.md` - documented the source registry and publication gate.
- `knowledge-base/products/mig-mag-series-evidence-registry.md` and
  `knowledge-base/compatibility/mig-mag-series-publication-gate.md` - retained the reusable catalog
  evidence and compatibility decisions.

**Components Changed**

- No new public component was required; the existing category reference table and MIG/MAG RFQ
  builder now consume the governed family data.
- No component, route or buyer function was removed.

**Data Changed**

- Added 10 company-catalog series evidence records with exact PDF/catalog page references.
- Split grouped RFQ values such as 24KD/25AK and 36KD/40KD into exact series choices.
- Kept one record `published` and nine records in `evidence_review`.
- No product specification, SKU, OEM number, price, certification or confirmed compatibility value
  was added or changed.

**Visual Changes**

- The MIG/MAG category now presents one readable catalog-matrix row per exact series.
- The RFQ builder shows the selected series and its catalog-documented component scope without
  implying fit.
- Mobile and desktop layouts retain the existing industrial table and form system; no extra badges,
  card family or decorative UI was introduced.

**SEO Impact**

- Preserved every public URL, canonical, sitemap entry and structured-data type.
- Added no thin series pages: 24KD, 25AK, 36KD, 40KD, 501D, 602 and ORK records remain non-indexable
  until publication evidence passes.
- Strengthened the existing MIG/MAG category content and RFQ vocabulary with exact catalog series
  names.

**Validation**

- Series evidence validation passed for 10 records: one published and nine in evidence review.
- Product-series relationship and MIG/MAG RFQ builder tests passed.
- ESLint, TypeScript and SEO audit passed.
- Next.js production build passed and generated 91 pages.
- Playwright verified the category matrix and RFQ builder at 360, 390, 768 and 1440 pixels with no
  horizontal overflow, 10 exact family records, hidden links for unpublished series and preserved
  24KD RFQ context.

**Known Issues**

- Nine series still need canonical products, reviewed exact-product images and governed
  product-to-series relationships before public pages can be created.
- 15AK still lacks a complete insulator, spring, swan-neck and liner SKU matrix.
- Catalog evidence confirms the documented family scope, not universal compatibility.
- No production deployment or live mailbox RFQ delivery test was performed in this phase.

**Next Recommended Step**

- Complete the 15AK component matrix and image set first; then use the readiness report to build 24KD
  as the next governed public series.

## 2026-08-21 - V2 Phase 3 15AK Product Series System

**Task**

Created the first governed product-series buying path for the 15AK MIG/MAG catalog-reference group.
The page connects related products, source-backed selection cues, compatibility checks, technical
resources and a series-specific RFQ path without presenting catalog grouping as confirmed fitment.

**Files Changed**

- `lib/content/schemas.ts`, `lib/data/product-series.ts` and `lib/content/product-series.ts` - added
  reusable series, relationship, evidence and verification types plus the first governed record.
- `components/content/ProductSeriesPageTemplate.tsx`, `SeriesReferenceTable.tsx` and
  `ProductSeriesLinkBand.tsx` - added the series buying page, responsive reference table and product
  detail reverse-link component.
- `app/products/[category]/series/[series]/page.tsx` - added the static series route, metadata,
  canonical URL and supported JSON-LD.
- `components/content/CategoryPageTemplate.tsx`, `components/content/ProductDetailTemplate.tsx`,
  `app/products/[category]/[slug]/page.tsx`, `content/categories.ts` and
  `lib/content/site-navigation.ts` - connected category, product and navigation paths to the series.
- `app/sitemap.ts`, `scripts/audit-seo.ts`, `scripts/check-performance-budget.ts`,
  `scripts/report-acquisition-readiness.ts`, `scripts/test-product-series.ts` and `package.json` -
  added series discovery, reporting, performance budgets and automated governance checks.
- `README.md`, `knowledge-base/products/15ak-mig-mag-series.md` and
  `knowledge-base/compatibility/15ak-reference-mapping.md` - documented the data source, evidence
  boundary, compatibility workflow and publishing checks.
- `docs/acquisition-readiness-report.md` - regenerated the acquisition report with governed series
  coverage.

**Components Changed**

- Created `ProductSeriesPageTemplate`, `SeriesReferenceTable` and `ProductSeriesLinkBand`.
- Extended the Category and Product Detail templates with evidence-backed series links.
- No public route, product page, RFQ function or existing component was removed.

**Data Changed**

- Added one 15AK series record and four governed product relationships.
- All four relationships remain `reference_only`; the overall record remains
  `NEEDS_FACTORY_CONFIRMATION`.
- No canonical product specification, company fact, price, OEM number or confirmed compatibility
  value changed.
- The general M6 1.2 mm contact tip was deliberately excluded because its current record does not
  document the same 15AK catalog grouping.

**Visual Changes**

- Added a product-led series first screen with one primary RFQ action, reviewed imagery and a compact
  evidence-status row.
- Added a responsive product system, catalog-reference table, selection checklist, applications,
  technical resources, FAQ and final RFQ section.
- Mobile ordering now places product imagery immediately after the primary actions; desktop keeps a
  balanced text-and-image catalog composition.

**SEO Impact**

- Added one canonical, statically generated series route to the sitemap and internal navigation.
- Added BreadcrumbList, CollectionPage and FAQPage structured data supported by visible content.
- Added reverse links from all four product pages and the MIG/MAG category page.
- Product schema intentionally remains on product detail pages; no unsupported ProductGroup,
  Offer, Review or AggregateRating markup was added.

**Validation**

- Product-series governance test passed for one series and four relationships.
- Product validation passed for 43 records; the image check retained three non-blocking warnings.
- SEO, internal-link and snippet-hygiene audits passed.
- ESLint, TypeScript and the Next.js production build passed; 91 pages were generated.
- The Product Series JavaScript budget passed at 126.3 KiB against a 150 KiB limit.
- Playwright verified 360, 390, 768, 1024, 1280 and 1440 pixel layouts, reviewed images, canonical
  URL, supported JSON-LD, RFQ series context, product/category links and sitemap inclusion.

**Known Issues**

- The complete 15AK insulator, spring, swan-neck and liner SKU mapping is not yet documented.
- Exact torch arrangement and final product-to-torch compatibility still require factory, sample,
  drawing, label or verified reference-number evidence.
- More company-owned detail, dimensional, packaging and bulk-series images are needed.
- AF-PLA-RC-0011, AF-ACC-WM-0015 and AF-TIG-TS-0036 still require reviewed product images.
- No production deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Confirm the complete 15AK component matrix and obtain reviewed images, then extend the same governed
  model before starting another series.

## 2026-08-21 - V2 Phase 2 Product Presentation System

**Task**

Implemented the Phase 2 product presentation batch across Product Card, Product Grid and the
product-detail first screen. The change makes reviewed imagery, product identity, useful technical
cues and RFQ actions easier to scan while preserving product routes, source data, verification
statuses, SEO and RFQ behavior.

**Files Changed**

- `lib/content/product-presentation.ts` - added a presentation adapter that derives stable family
  labels and filters low-signal or duplicated specification fields.
- `components/content/ProductGrid.tsx`, `components/content/ProductGallery.tsx` and
  `components/content/ProductOverview.tsx` - added reusable product-grid, reviewed-gallery and
  product-first overview components.
- `components/content/ProductCard.tsx`, `components/content/ProductVisual.tsx`,
  `components/content/SpecificationTable.tsx` and `components/content/CompatibilityTable.tsx` -
  simplified product imagery, card content and technical-table presentation.
- `components/content/ProductDetailTemplate.tsx` - rebuilt the detail-page first screen, simplified
  section navigation and reused the shared related-product grid.
- `components/rfq/AddToRfqButton.tsx` - added a compact card action while preserving RFQ-list state.
- `components/content/CategoryPageTemplate.tsx`, `app/page.tsx`, `app/products/page.tsx`,
  `app/applications/[slug]/page.tsx` and `app/guides/[slug]/page.tsx` - adopted the shared Product Grid.
- `knowledge-base/decisions/2026-08-21-product-presentation-phase-2.md` - recorded product
  presentation, evidence and follow-up decisions.

**Components Changed**

- Created `ProductGrid`, `ProductGallery` and `ProductOverview`.
- Updated `ProductCard`, `ProductVisual`, `SpecificationTable`, `CompatibilityTable`,
  `ProductDetailTemplate` and `AddToRfqButton`.
- No existing component or public feature was removed.

**Data Changed**

- No canonical product, company, compatibility or commercial data changed.
- Product Name, SKU, Category and low-signal placeholders are filtered only from prominent
  presentation rows; source records remain intact.
- The product readiness report was regenerated from the existing 43 product records.

**Visual Changes**

- Product cards now use a larger square product image, a concise product-system context, SKU, up to
  two useful technical cues and one compact RFQ action.
- Product-detail first screens now show reviewed imagery beside the H1, summary, series, SKU, supply
  context and all three commercial actions before the key specification list.
- Missing technical values are grouped into one buyer-oriented disclosure instead of repeated across
  prominent page areas.
- Specification and compatibility tables use quieter divider rows with less nested framing.

**SEO Impact**

- Preserved all product and category routes, canonical URLs, metadata, structured data, sitemap and
  robots behavior.
- Preserved indexable product content and internal links while reducing repetitive UI text in
  Product Cards.
- SEO, internal-link and snippet-hygiene audits pass for 40 active products, 6 categories, 6
  applications and 17 guides.

**Validation**

- Product CSV validation passed for 43 products.
- Product image check completed with three non-blocking `needs_photo` warnings.
- Product readiness and product search checks passed.
- ESLint and TypeScript checks passed.
- Next.js production build passed and generated 90 pages.
- RFQ constraints, email rendering and provider-timeout tests passed.
- Performance budgets and tracked-secret scan passed.
- Playwright verified representative MIG/MAG, TIG, plasma and welding-equipment products at 390 and
  1440 pixels with no horizontal overflow, loaded reviewed images and available conversion actions.
  Product Card RFQ state and the mobile featured-product grid also passed.

**Known Issues**

- AF-PLA-RC-0011 Plasma Retaining Cap, AF-ACC-WM-0015 Welding Magnet and AF-TIG-TS-0036 TIG Torch
  Switch still need reviewed product images.
- Additional company-owned detail, dimension, packaging and bulk-product photography is needed for
  stronger product evidence.
- Reference-only and unverified compatibility records still require factory, sample, drawing or
  reference-number confirmation.
- No production deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- Build one complete 15AK MIG/MAG series buying system after the model matrix, drawings,
  compatibility evidence and reviewed image set are available.

## 2026-08-21 - V2 Phase 1 Global Brand System And Homepage

**Task**

Implemented Phase 1 of the ArcFort Weld V2 upgrade: the global visual foundation, single-layer
Header, scalable Product Mega Menu, brand-led Homepage and simplified Footer. Existing routes,
product records, SEO infrastructure, structured data, sitemap, robots and RFQ behavior were
preserved.

**Files Changed**

- `tailwind.config.ts` and `app/globals.css` - consolidated industrial-blue tokens, accessible
  engineering-orange actions, typography, spacing, containers, buttons and reduced-motion behavior.
- `app/layout.tsx` - adopted the new global shell and removed the commercial trust strip from every
  page while retaining the mobile contact bar and structured data.
- `app/page.tsx` and `content/homepage.ts` - replaced the dense supplier-template homepage with a
  product-system, industry, cooperation, resource and RFQ hierarchy.
- `components/Header.tsx`, `components/navigation/NavigationMenu.tsx`,
  `components/navigation/ProductMegaMenu.tsx` and `lib/content/site-navigation.ts` - added the new
  desktop/mobile information architecture and data-driven product navigation.
- `components/Footer.tsx`, `components/BrandLockup.tsx`, `components/StickyContactBar.tsx` and
  `components/rfq/RfqListLink.tsx` - unified branding, contact access and CTA presentation.
- `components/home/ProductSystemCard.tsx` - added an image-led product-system card.
- `components/ui/ButtonLink.tsx`, `components/ui/Container.tsx`, `components/ui/Section.tsx` and
  `components/ui/SectionHeading.tsx` - added reusable Phase 1 layout primitives.
- `scripts/audit-snippet-hygiene.ts` - aligned snippet checks with the new global regions.
- `lib/content/site.ts` - recorded the significant homepage content update date.
- `README.md` and `docs/DESIGN_SYSTEM.md` - linked the governance documents and aligned action colors.

**Components Changed**

- Created `BrandLockup`, `NavigationMenu`, `ProductMegaMenu`, `ProductSystemCard`, `ButtonLink`,
  `Container`, `Section` and `SectionHeading`.
- Rebuilt `Header` and `Footer`.
- Updated `StickyContactBar` and `RfqListLink` typography and contrast.
- Removed `BuyerTrustStrip` from the global render path; its source file remains available and no
  user data or functionality was deleted.

**Data Changed**

- Added centralized navigation and homepage presentation data.
- No company identity, product technical specification, SKU, compatibility or commercial policy was
  changed.

**Visual Changes**

- Replaced the multi-layer utility navigation with a single restrained sticky header.
- Added a six-system product mega menu and compact mobile navigation.
- Rebuilt the homepage around product imagery, whitespace, quiet neutral bands and one restrained
  action accent.
- Simplified the footer and removed port, MOQ, payment and lead-time clutter from global navigation.
- Kept representative industrial images visibly labeled so they are not presented as company
  factory evidence.

**SEO Impact**

- Preserved published URLs, canonical metadata, Organization/WebSite/WebPage structured data,
  sitemap, robots and active product generation.
- Reorganized homepage internal links around product categories, applications, guides, company and
  RFQ paths without changing route identifiers.
- Updated snippet-hygiene rules for the new header/footer structure; the audit passes.

**Validation**

- ESLint passed with zero warnings.
- TypeScript `tsc --noEmit` passed.
- Company-profile and RFQ constraint, email-template and provider-timeout tests passed.
- Next.js production build passed and generated 90 pages.
- SEO audit passed for 40 active products, 6 categories, 6 applications and 17 guides.
- Built internal-link audit, snippet-hygiene audit, performance budget and tracked-secret scan passed.
- Playwright verified 360, 390, 1024 and 1440 pixel viewports with no horizontal overflow; H1 and
  Header bounds passed, and mobile navigation plus desktop Mega Menu opened correctly.
- Manual screenshot review confirmed hero framing, responsive line wrapping, CTA access and the
  lazy-loaded representative quality image.

**Known Issues**

- Existing `ProductCard` content density and action treatment remain for the planned Phase 2 product
  component batch.
- Representative site images are not company-factory evidence and must keep their visible labels
  until approved real company photography is supplied.
- China and international market architecture is prepared in content only; `/zh/` and `/en/` routes
  are not implemented.
- No deployment or controlled live-mailbox RFQ test was performed in this phase.

**Next Recommended Step**

- After explicit approval, begin Phase 2 with the Product Card, Product Grid and product-detail
  above-the-fold component family while preserving existing product URLs and evidence controls.

## 2026-08-21 - Permanent Repository Governance System

**Task**

Established permanent execution, design, content and QA rules for ArcFort Weld. The governance model
adds the China nationwide-brand direction while preserving international B2B acquisition, factual
evidence, product governance, RFQ, SEO, accessibility, performance and security requirements.

**Files Changed**

- `AGENTS.md` - repository mission, rule priority, workflow and non-negotiable safeguards.
- `docs/DESIGN_SYSTEM.md` - industrial brand tokens, typography, spacing, components and page patterns.
- `docs/CONTENT_RULES.md` - evidence, terminology, product/page content, market and SEO standards.
- `docs/QA_CHECKLIST.md` - visual, technical, data, SEO, mobile, RFQ and release gates.
- `docs/CHANGELOG_AI.md` - append-only major-task decision history and entry template.

**Components Changed**

- None. This task defines future component standards without changing runtime components.

**Data Changed**

- No product or company data changed.
- Added a five-state technical verification model and four-level source hierarchy as governance only.

**Visual Changes**

- None in the runtime website. The target industrial-blue palette, engineering-orange CTA accent,
  typography roles, spacing scale and component behavior are now documented.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change.
- Future redesigns must preserve all existing SEO assets and index controls.

**Validation**

- Governance coverage and cross-reference check passed for all five required files.
- Prettier check passed for all five governance files.
- Changed-file secret pattern check and repository secret scan passed.
- ESLint passed with zero warnings.
- TypeScript `tsc --noEmit` passed.
- Next.js production build passed and generated 90 pages.
- Runtime visual screenshots were not required because this task changed documentation only.

**Known Issues**

- Existing UI has not yet been audited component-by-component against the new design system.
- `/zh/` and `/en/` are architectural targets, not implemented routes.
- Product fields require migration planning before the full evidence model can be stored canonically.

**Next Recommended Step**

- Audit global design tokens, Header/Mega Menu and shared layout components against the new system,
  then implement that single global batch with desktop/mobile visual verification.

## 2026-08-21 - V2 Phase 8 24KD Series Component Evidence

**Task**

Converted the reviewed 24KD company-catalog spread into a governed field-level evidence, factory
confirmation and exact-image intake workflow. The phase deliberately created no public 24KD SKU or
series route because exact product evidence is incomplete and three complete-torch data fields
conflict with the official OEM reference.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - 68 sourced 24KD series, component and variant
  facts with three explicit source conflicts.
- `data/intake/24kd-series-confirmation.csv` - 23 candidate factory/SKU confirmation records.
- `data/intake/24kd-image-intake.csv` - 34 exact-product, technical, dimension and packaging image
  requests.
- `lib/data/product-series-component-facts.ts` - generated runtime evidence projection.
- `scripts/product-series-component-utils.ts` - CSV parsing, cross-record validation and generation.
- `scripts/manage-product-series-components.ts` - generate and generated-file drift command.
- `scripts/report-product-series-components.ts` - internal component readiness report generator.
- `scripts/report-product-series-readiness.ts` and `scripts/report-acquisition-readiness.ts` - 24KD
  component, conflict and intake counts in existing operational reports.
- `docs/product-series-component-evidence-report.md` - generated component matrix and work queue.
- `knowledge-base/products/24kd-series-evidence.md` - durable source and publication boundary.
- `AGENTS.md`, `README.md`, `docs/CONTENT_RULES.md`, `docs/QA_CHECKLIST.md` and
  `docs/catalog-product-data-audit.md` - workflow, governance and audit documentation.
- `package.json` and `.github/workflows/quality.yml` - component evidence commands and CI drift gate.
- `lib/content/schemas.ts` - typed series-component fact model.
- `components/content/ProductSeriesPageTemplate.tsx` - removed the hard-coded 15AK label from the
  reusable series template.

**Components Changed**

- Updated `ProductSeriesPageTemplate` to derive the reference-group label from the current series.
- No new public 24KD component or page was created.

**Data Changed**

- Recorded 68 company-catalog field facts across 23 24KD component/variant candidates.
- Preserved company-catalog and official ABICOR BINZEL comparison values for rating, duty cycle and
  wire range as three `DATA_CONFLICT` records with `blocked` lifecycle.
- Recorded zero confirmed 24KD facts, zero canonical SKU mappings and zero approved images.

**Visual Changes**

- No visible layout or image change. The existing 15AK series text renders the same while the
  component is now safe for future series reuse.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change.
- The 24KD series remains `evidence_review`; build output still contains one public series page and
  no 24KD route.

**Validation**

- Product-series component generation, drift validation and report passed: 68 facts, 23 candidates,
  34 image requests, zero structural errors.
- Product CSV validation passed for 43 records; image check retained three known draft-image
  warnings.
- Product image registry passed with 46 assets, 43 rights-review warnings and two duplicate-content
  groups retained as known migration work.
- Product-series, public-series, compatibility and 15AK technical-evidence tests passed.
- ESLint and TypeScript passed with zero errors.
- Next.js production build passed and generated 91 pages.
- SEO audit passed for 40 active products, 6 categories, 1 public series, 6 applications and 17
  guides; built internal links, snippet hygiene, performance budget and repository secret scan also
  passed.
- `git diff --check` passed. Temporary PDF review images and the accidental local pnpm cache were
  removed.

**Known Issues**

- The exact supplied 24KD complete-torch rating, duty cycle and wire range require Level A factory or
  controlled-test evidence.
- All 23 24KD candidates still need exact identity/technical confirmation; all 34 image requests are
  still `requested`.
- No 24KD compatibility relationship, canonical SKU or public series page is ready.
- Existing site-wide image risks remain: 43 migration-period references need rights confirmation,
  two families reuse identical images and three draft products need exact photos.
- Externally exposed Resend credential rotation and real sales/buyer mailbox placement remain outside
  repository verification.

**Next Recommended Step**

- Obtain the first factory evidence pack for the 24KD complete torch, three nozzle profiles and seven
  contact-tip variants, including exact white-background images, measurements/drawings and the
  supplied-torch specification needed to resolve the three conflicts.

## 2026-08-21 - V2 Phase 9 25AK Series Component Evidence

**Task**

Converted the reviewed 25AK company-catalog spread into the governed multi-series component
evidence workflow. The workflow now discovers matching confirmation and image-intake files by
series, while keeping all unconfirmed 25AK candidates and six cross-series source conflicts outside
public product data.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added 64 sourced 25AK series, component and
  variant facts with three explicit complete-torch source conflicts.
- `data/intake/25ak-series-confirmation.csv` - added 21 exact-product factory/SKU confirmation
  candidates.
- `data/intake/25ak-image-intake.csv` - added 31 exact-product, technical, dimension, packaging and
  bulk-image requests.
- `lib/data/product-series-component-facts.ts` - regenerated the runtime evidence projection with
  24KD and 25AK facts.
- `scripts/product-series-component-utils.ts` and `scripts/manage-product-series-components.ts` -
  generalized intake discovery, pairing, series identity and path validation.
- `scripts/report-product-series-components.ts`, `scripts/report-product-series-readiness.ts` and
  `scripts/report-acquisition-readiness.ts` - replaced 24KD-only reporting with detailed-series
  summaries and work queues.
- `docs/product-series-component-evidence-report.md`, `docs/product-series-readiness-report.md` and
  `docs/acquisition-readiness-report.md` - regenerated operational status reports.
- `knowledge-base/products/25ak-series-evidence.md`, `README.md` and
  `docs/catalog-product-data-audit.md` - documented source values, conflicts and publication gates.

**Components Changed**

- None. This phase changed internal product evidence and reporting only.

**Data Changed**

- Recorded 64 field-level facts across 21 25AK component/variant candidates and 31 image requests.
- Preserved company-catalog and official ABICOR BINZEL comparison values for rating, duty cycle and
  wire range as three `DATA_CONFLICT` records with `blocked` lifecycle.
- The detailed workflow now totals 132 facts, 44 candidates, 65 image requests and six conflicts.
- Recorded zero confirmed 25AK facts, zero SKU mappings, zero compatibility relationships and zero
  approved 25AK images.

**Visual Changes**

- None. No 25AK public page, product card or product image was added.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change. The 25AK evidence record remains
  `evidence_review` and does not generate an indexable route.

**Validation**

- Multi-series component generation and drift validation passed for two paired confirmation/image
  intake files with 132 facts, 44 candidates and 65 image requests.
- Component, series and acquisition reports regenerated without structural errors.
- Full product, image, compatibility, technical, SEO, lint, type, build, performance and security
  checks are recorded after the phase QA run.

**Known Issues**

- The exact supplied 25AK complete-torch rating, duty cycle and wire range require Level A factory or
  controlled-test evidence.
- All 21 candidates still need identity and technical confirmation; all 31 image requests remain
  `requested`.
- No canonical 25AK SKU, compatibility relationship or public series page is ready.

**Next Recommended Step**

- Obtain the first 25AK factory evidence pack for the complete torch, three nozzle profiles, seven
  contact-tip variants and tip holder, including exact product images and controlled technical data.

## 2026-08-21 - V2 Phase 10 36KD Series Component Evidence

**Task**

Converted the reviewed 36KD company-catalog spread into the governed multi-series component
workflow. The phase preserved one official-reference rating conflict and one contradiction within
the company catalog instead of selecting a plausible value.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added 69 sourced 36KD facts with two explicit
  source conflicts.
- `data/intake/36kd-series-confirmation.csv` - added 24 exact-product factory/SKU candidates.
- `data/intake/36kd-image-intake.csv` - added 35 exact-product and evidence image requests.
- `lib/content/schemas.ts` and `scripts/product-series-component-utils.ts` - added governed
  `company_catalog` comparison-source support for contradictions within one company document.
- `lib/data/product-series-component-facts.ts` - regenerated the runtime projection for three
  detailed series.
- `scripts/report-product-series-components.ts`, `scripts/report-product-series-readiness.ts` and
  `scripts/report-acquisition-readiness.ts` - generalized conflict wording and included 36KD work.
- `docs/product-series-component-evidence-report.md`, `docs/product-series-readiness-report.md` and
  `docs/acquisition-readiness-report.md` - regenerated the multi-series operational reports.
- `knowledge-base/products/36kd-series-evidence.md`, `README.md`, `docs/CONTENT_RULES.md` and
  `docs/catalog-product-data-audit.md` - documented sources, internal conflict handling and the
  publication boundary.

**Components Changed**

- None. This phase changed internal evidence, validation and reporting only.

**Data Changed**

- Recorded 69 field facts across 24 36KD candidates and 35 image requests.
- Preserved 340 A CO2 / 320 A mixed gases from the company catalog and 320 A CO2 / 290 A mixed gases
  from the official OEM reference as a blocked rating conflict.
- Preserved the company's conflicting 19 mm and 20 mm cylindrical-nozzle entries as a second blocked
  conflict.
- The detailed workflow now totals 201 facts, 68 candidates, 100 image requests and eight conflicts.
- Recorded zero confirmed 36KD facts, zero SKU mappings, zero compatibility relationships and zero
  approved 36KD images.

**Visual Changes**

- None. No 36KD public page, product card or product image was added.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change. The 36KD evidence record remains
  `evidence_review` and does not generate an indexable route.

**Validation**

- Multi-series generation and structural validation passed for 201 facts, 68 candidates, 100 image
  requests and three paired intake sets.
- Full product, image, compatibility, technical, SEO, lint, type, build, RFQ, performance and
  security results are recorded after the phase QA run.

**Known Issues**

- The exact supplied 36KD complete-torch rating and cylindrical-nozzle opening require Level A
  factory, drawing, measurement or controlled-test evidence.
- All 24 candidates need exact identity and technical confirmation; all 35 image requests remain
  `requested`.
- No canonical 36KD SKU, compatibility relationship or public series page is ready.

**Next Recommended Step**

- Obtain exact 36KD evidence for the complete torch and cylindrical nozzle first, then confirm the
  remaining nozzle, contact-tip, holder and diffuser variants independently.

## 2026-08-21 - V2 Phase 11 40KD Series Component Evidence

**Task**

Converted the reviewed 40KD company-catalog spread into the governed multi-series component
workflow, retaining the complete-torch rating and duty-cycle differences from the official OEM
manual as blocked conflicts.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added 69 sourced 40KD facts with two explicit
  complete-torch conflicts.
- `data/intake/40kd-series-confirmation.csv` - added 24 exact-product factory/SKU candidates.
- `data/intake/40kd-image-intake.csv` - added 35 exact-product and evidence image requests.
- `lib/data/product-series-component-facts.ts` - regenerated the runtime projection for four
  detailed series.
- `scripts/report-acquisition-readiness.ts` and generated readiness reports - added 40KD to the
  governed work queue and aggregate counts.
- `knowledge-base/products/40kd-series-evidence.md`, `README.md` and
  `docs/catalog-product-data-audit.md` - documented sources, conflicts and publication gates.

**Components Changed**

- None. This phase changed internal product evidence and reporting only.

**Data Changed**

- Recorded 69 field facts across 24 40KD candidates and 35 image requests.
- Preserved company-catalog 380 A CO2 / 360 A mixed gases against official-reference 350 A CO2 /
  320 A mixed gases as a blocked conflict.
- Preserved company-catalog 60% duty cycle against official-reference 35% as a second blocked
  conflict.
- The detailed workflow now totals 270 facts, 92 candidates, 135 image requests and ten conflicts.
- Recorded zero confirmed 40KD facts, zero SKU mappings, zero compatibility relationships and zero
  approved 40KD images.

**Visual Changes**

- None. No 40KD public page, product card or product image was added.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change. The 40KD evidence record remains
  `evidence_review` and does not generate an indexable route.

**Validation**

- Multi-series generation and structural validation passed for 270 facts, 92 candidates, 135 image
  requests and four paired intake sets.
- Full product, image, compatibility, technical, SEO, lint, type, build, RFQ, performance and
  security results are recorded after the phase QA run.

**Known Issues**

- Exact supplied-torch rating and duty cycle require Level A factory or controlled-test evidence.
- All 24 candidates need exact identity and technical confirmation; all 35 image requests remain
  `requested`.
- No canonical 40KD SKU, compatibility relationship or public series page is ready.

**Next Recommended Step**

- Obtain exact 40KD complete-torch evidence first, then confirm the eight contact-tip variants and
  associated liner range before creating SKUs.

## 2026-08-21 - V2 Phase 12 501D Water-Cooled Series Evidence

**Task**

Converted the reviewed 501D company-catalog spread into the governed component workflow and added a
water-cooled connection boundary that prevents hose color or visual similarity from becoming a media
function or compatibility claim.

**Files Changed**

- `data/evidence/product-series-component-facts.csv` - added 89 sourced 501D facts with three
  complete-torch conflicts and explicit visible-interface records.
- `data/intake/501d-series-confirmation.csv` - added 29 exact-product factory/SKU candidates.
- `data/intake/501d-image-intake.csv` - added 46 exact-product, measurement and media-connection image
  requests.
- `lib/content/schemas.ts` and `scripts/product-series-component-utils.ts` - added a governed
  `wall_thickness` field for nozzle evidence.
- `lib/data/product-series-component-facts.ts` - regenerated the runtime projection for five detailed
  series.
- `scripts/report-acquisition-readiness.ts` and generated readiness reports - added 501D to the
  aggregate work queue.
- `knowledge-base/products/501d-series-evidence.md`, `README.md`, `docs/CONTENT_RULES.md`,
  `docs/QA_CHECKLIST.md` and `docs/catalog-product-data-audit.md` - documented water-cooled interface
  evidence and publication gates.

**Components Changed**

- None. This phase changed internal evidence, validation and reporting only.

**Data Changed**

- Recorded 89 field facts across 29 501D candidates and 46 image requests.
- Preserved company-catalog and official OEM values for rating, duty cycle and wire range as three
  blocked conflicts.
- Added a rear-media connection-set candidate without assigning functions to visible colored hoses.
- The detailed workflow now totals 359 facts, 121 candidates, 181 image requests and thirteen
  conflicts.
- Recorded zero confirmed 501D facts, zero SKU mappings, zero compatibility relationships and zero
  approved 501D images.

**Visual Changes**

- None. No 501D public page, product card or product image was added.

**SEO Impact**

- No URL, metadata, structured data, sitemap or robots change. The 501D evidence record remains
  `evidence_review` and does not generate an indexable route.

**Validation**

- Multi-series generation and structural validation passed for 359 facts, 121 candidates, 181 image
  requests and five paired intake sets.
- Full product, image, compatibility, technical, SEO, lint, type, build, RFQ, performance and
  security results are recorded after the phase QA run.

**Known Issues**

- Exact supplied-torch rating, duty cycle and wire range require Level A evidence.
- Coolant, gas, power and control connections need a labeled factory connection drawing.
- All 29 candidates need exact identity and technical confirmation; all 46 image requests remain
  `requested`.
- No canonical 501D SKU, compatibility relationship or public series page is ready.

**Next Recommended Step**

- Obtain the 501D torch specification and connection drawing first, then confirm nozzle wall
  variants, tip holders and the rear-media assembly before creating SKUs.

## 2026-08-21 - V2 Phase 1 Brand Presentation System

**Task**

Stabilized the global design system, Header, Product Mega Menu, mobile navigation, homepage and
Footer as the first controlled phase of the ArcFort Weld V2 national industrial brand upgrade.
Existing routes, product data, structured data, sitemap, robots rules and RFQ behavior were
preserved.

**Files Changed**

- `app/globals.css` and `tailwind.config.ts` - added aligned semantic typography, spacing, media,
  header, radius and shadow tokens plus a stable mobile Hero constraint.
- `app/page.tsx` - retained the `content/homepage.ts` data-driven structure, updated the home search
  title and consolidated the industries/applications language.
- `components/Header.tsx`, `components/navigation/ProductMegaMenu.tsx` and
  `components/navigation/MobileNavigation.tsx` - separated and stabilized desktop and mobile
  navigation behavior.
- `components/home/HomeHero.tsx` and `components/home/HomeInquiryCta.tsx` - created reusable home
  brand and qualified-inquiry sections.
- `components/Footer.tsx` - removed the repeated Footer CTA directly after the homepage final CTA
  and retained the product, cooperation, resource and contact hierarchy.
- `next.config.ts` - declared the existing `75` and `88` responsive-image quality values.
- `scripts/audit-snippet-hygiene.ts` - changed the search-snippet contract from the removed Footer
  CTA to the single homepage inquiry region.
- `README.md` and `docs/DESIGN_SYSTEM.md` - documented the V2 Phase 1 implementation boundaries and
  component map.

**Components Changed**

- Created `HomeHero`, `HomeInquiryCta` and `MobileNavigation`.
- Updated `Header`, `ProductMegaMenu` and `Footer`.
- Removed no reusable component; only the duplicate Footer CTA region was removed.

**Data Changed**

- No product, company, compatibility, technical, commercial or RFQ data changed.
- Homepage metadata title changed to `Industrial Welding & Cutting Solutions`.
- The visible section label changed from `Industry Solutions` to `Industries & Applications`.

**Visual Changes**

- Added a consistent display, section, technical-data and caption system.
- Kept one full-bleed industrial Hero image, one headline and two actions.
- Preserved image-led Product Systems and active-product-driven Featured Products.
- Removed adjacent duplicate inquiry bands between the homepage and Footer.
- Made the mobile Hero expose a clean hint of the next section without placing its title behind the
  fixed inquiry bar.

**SEO Impact**

- Preserved every URL, canonical, structured-data helper, sitemap entry and robots rule.
- Updated only the homepage search title while preserving the broad welding and cutting scope.
- Kept repetitive final-inquiry, navigation, product-card action and Footer regions protected from
  search snippets.

**Validation**

- ESLint and TypeScript passed with no errors.
- Next.js production build passed and generated 91 pages, including 40 product pages, six category
  pages, one governed series page, six applications and seventeen guides.
- SEO, 81-page built internal-link, snippet-hygiene, performance-budget and repository secret audits
  passed.
- RFQ constraints, email templates, provider timeout and all buyer-specific RFQ builders passed.
- Product, image, series, compatibility and field-level technical evidence checks passed.
- Playwright production checks passed at 360, 390, 430, 768, 1024, 1280 and 1440 CSS pixels with no
  horizontal overflow, one H1, contained navigation panels and working Escape/focus return.

**Known Issues**

- Three draft products still need exact reviewed images before publication.
- Forty-three legacy product-image references still need explicit usage-rights confirmation, and two
  duplicate-content image groups need variant-specific replacements.
- The homepage industrial and packing visuals remain clearly labeled representative visuals; real
  company-owned factory, inspection, warehouse, packing and shipment photography is still needed.
- Production deployment and a controlled live RFQ mailbox-delivery test were not performed in this
  phase.

**Next Recommended Step**

- Start V2 Phase 2 with the Product Center and Product Card family, then move through category and
  product-detail presentation without changing current URLs or evidence boundaries.

## 2026-08-21 - V2 Phase 2 Product Catalog System

**Task**

Upgraded the Product Center, product cards, six category pages and forty product-detail pages as the
second controlled V2 presentation phase. Preserved product records, evidence statuses, URLs,
structured data, sitemap, RFQ behavior and all buyer-specific RFQ builders.

**Files Changed**

- `app/products/page.tsx` - replaced repeated shortcut, policy and service-card sections with a
  product finder, image-led systems, catalog, RFQ preparation and FAQ sequence.
- `components/content/CategoryPageTemplate.tsx` - reduced the section navigation to five buyer
  paths, grouped catalog-family evidence in an expandable reference section and retained product,
  selection, RFQ-builder, application, FAQ and internal-link content.
- `components/content/ProductDetailTemplate.tsx` - removed duplicate confirmation and commercial
  policy cards while retaining evidence-safe specifications, compatibility, selection, delivery,
  applications, FAQ, related products and RFQ paths.
- `components/content/ProductCard.tsx` - made cards image-led and limited body data to SKU plus one
  useful selection cue.
- `components/content/ProductGallery.tsx` and `ProductGalleryViewer.tsx` - added governed server
  image selection and thumbnail switching for multiple eligible assets.
- `components/content/TechnicalTable.tsx`, `SpecificationTable.tsx` and
  `CompatibilityTable.tsx` - introduced one responsive technical key/value system.
- `components/content/RfqCta.tsx` - reduced the CTA to one quotation action plus email and
  WhatsApp fallbacks.
- `components/products/ProductFinderForm.tsx` - aligned the finder with shared button and surface
  styles.
- `next.config.ts` - allowed the product-gallery quality value used by Next Image.
- `README.md`, `docs/DESIGN_SYSTEM.md` and this changelog - documented the Phase 2 boundaries and
  reusable patterns.

**Components Changed**

- Created `ProductGalleryViewer` and `TechnicalTable`.
- Updated `ProductGallery`, `ProductCard`, `RfqCta`, `SpecificationTable`,
  `CompatibilityTable`, `ProductFinderForm`, `CategoryPageTemplate` and
  `ProductDetailTemplate`.
- Removed no product, RFQ, SEO or data component.

**Data Changed**

- No product, company, compatibility, certification, commercial or technical fact changed.
- No draft product became public and no evidence status changed.

**Visual Changes**

- Product Center now presents real categories and published products before secondary sourcing
  guidance.
- Product cards reserve most of their area for product imagery and remove repeated data rows.
- Category pages use continuous information bands and technical rows instead of repeated card
  groups; long reference-family matrices are available on demand.
- Product details use a stable image field, compact page navigation, reusable technical tables and a
  shorter overview-to-RFQ path.
- RFQ sections use one clear primary action without repeated trade-policy boxes.

**SEO Impact**

- Preserved all canonical paths, route parameters, metadata generation, JSON-LD, sitemap and robots
  behavior.
- Preserved all category SEO content, FAQ schema support, company-catalog source links and priority
  internal links.
- Retained `data-nosnippet` boundaries for navigation, product visuals, card actions, related
  category codes and RFQ regions.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- Product CSV, image, readiness, search, series, component evidence, compatibility and technical
  fact checks passed.
- RFQ constraints, email/provider handling and MIG/MAG, TIG, plasma, welding-machine and OEM RFQ
  builder tests passed.
- SEO, 81-page built internal links, snippet hygiene, performance budget and secret scan passed.
- Playwright checked Product Center, MIG/MAG category and product-detail pages at 390, 768 and 1440
  pixels: all returned 200, used one H1, had no document overflow or broken images.

**Known Issues**

- Plasma Retaining Cap, Welding Magnet and TIG Torch Switch remain draft because exact reviewed
  images are missing.
- Forty-three legacy product-image references still need explicit usage-rights confirmation, and
  two duplicate-content image groups need variant-specific replacements.
- Most published product records currently have one display-eligible image; thread, dimension,
  packaging and bulk gallery images still require approved product-specific photography.
- Production deployment and a controlled live RFQ mailbox-delivery test were not performed.

**Next Recommended Step**

- Continue with V2 Phase 3 for Applications and Industry Solutions, then replace legacy reference
  images with company-owned product and process photography in governed batches.

## 2026-08-21 - V2 Phase 3A Applications And Industry Solutions

**Task**

Upgraded the Applications center and all six industry solution pages into one evidence-safe buyer
journey. The work connects operating context, relevant product systems, selection evidence and an
application-specific RFQ without implying unverified customer projects or technical fit.

**Files Changed**

- `app/applications/page.tsx` - replaced signal and sourcing card groups with a representative
  industrial hero, image-led industry paths, a three-step RFQ preparation sequence and one CTA.
- `app/applications/[slug]/page.tsx` - rebuilt the shared detail template around operating context,
  product systems, selection evidence, RFQ fields, related products and FAQ.
- `components/content/IndustrySolutionCard.tsx` - added a reusable industry card using governed
  related-product imagery and a non-breaking fallback.
- `content/applications.ts` - added application-specific operating contexts, selection
  considerations and RFQ information requirements for six industries.
- `lib/content/schemas.ts` - extended `ApplicationPage` with the new structured fields.
- `docs/DESIGN_SYSTEM.md` and this changelog - documented the reusable application-page system and
  evidence boundary.

**Components Changed**

- Created `IndustrySolutionCard`.
- Reused `Container`, `Section`, `SectionHeading`, `ButtonLink`, `ProductGrid`, `FaqSection`,
  `BuyerResourceLinks` and `RfqCta`.
- Removed no route, product, RFQ or structured-data component.

**Data Changed**

- Added buyer guidance for shipbuilding, automotive, pipeline, metal fabrication, construction and
  repair-workshop sourcing.
- No technical specification, compatibility, certification, customer case or commercial claim was
  added or changed.

**Visual Changes**

- Applications now opens with one visual message and exposes the six industries as image-led paths.
- Industry cards prefer distinct governed product images while retaining a safe fallback.
- Detail pages use a related product reference above the fold, continuous technical rows and one
  application RFQ checklist instead of repeated card groups.
- Mobile uses deliberate stacking, horizontally scrollable section navigation and the existing
  bottom contact bar without page overflow.

**SEO Impact**

- Preserved all application URLs, canonical metadata, static generation, sitemap inclusion,
  BreadcrumbList, FAQ and application WebPage structured data.
- Strengthened visible buyer content and internal links to relevant categories, products and RFQ.
- Kept representative-image labels, navigation and repeated CTA content outside search snippets.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, built 81-page internal-link audit, snippet hygiene, performance budget and secret scan
  passed.
- Playwright checked Applications and Shipbuilding pages at 390, 768 and 1440 pixels: all returned
  200, used one H1, had no horizontal overflow, loaded all images after lazy-load traversal and kept
  the section navigation aligned below the 77-pixel Header.
- Verified the application RFQ action carries process, equipment, product reference, quantity,
  packaging and destination prompts into `/rfq`.

**Known Issues**

- The Applications hero remains a clearly labeled representative visual, not company-facility or
  customer-project evidence.
- Industry cards rely on existing governed product imagery; company-owned industry-context,
  inspection, packaging and shipment photography is still needed.
- Most related products still have only one display-eligible image, so detail, dimension, packaging
  and bulk views remain incomplete.
- Production deployment and a controlled live RFQ mailbox-delivery test were not performed.

**Next Recommended Step**

- Continue V2 Phase 3B with the OEM/ODM, Quality Control, Distributor and Shipping/Payment solution
  pages, using the same evidence-led hierarchy and one clear RFQ path.

## 2026-08-21 - V2 Phase 3B Commercial Solutions And Trust Pages

**Task**

Unified OEM/ODM, Distributor Supply, Quality Control and Shipping/Payment into one evidence-led
commercial solution system. Preserved existing business data, downloads, interactive RFQ tools,
email delivery behavior, routes, metadata and structured data while removing repeated card groups
and competing actions.

**Files Changed**

- `app/oem-service/page.tsx` - reorganized OEM scope, product families, approval process, Builder,
  project brief, support links and FAQ around one approved product reference.
- `app/distributor-supply/page.tsx` - clarified the roles of the sourcing Builder and embedded RFQ
  form; consolidated product range, program support, commercial basis, process and resources.
- `app/quality-control/page.tsx` - organized inspection workflow, mismatch-risk matrix, buyer and
  supplier controls, evidence options and certification boundaries into continuous technical rows.
- `app/shipping-payment/page.tsx` - separated confirmed company policy from order-specific trade
  terms and connected lead times, order workflow, quotation inputs and buyer paths.
- `components/content/PageSectionNav.tsx` - added one reusable sticky page-navigation pattern.
- `components/content/ProcessSteps.tsx` - added reusable responsive process rows for light and dark
  sections.
- `components/content/BuyerPathList.tsx` - added reusable internal and download resource rows.
- `docs/DESIGN_SYSTEM.md` and this changelog - documented the shared commercial-page system.

**Components Changed**

- Created `PageSectionNav`, `ProcessSteps` and `BuyerPathList`.
- Reused `OemRfqBuilder`, `DistributorRfqBuilder`, `RfqForm`, `FaqSection`, `RfqCta`, `Container`,
  `Section`, `SectionHeading` and `ButtonLink`.
- Removed no form, download, RFQ, route or structured-data component.

**Data Changed**

- No company identity, technical specification, compatibility, certification, pricing, capacity,
  customer, commercial-policy or product fact changed.
- Public copy was tightened to preserve the distinction between buyer input and supplier-confirmed
  order details.

**Visual Changes**

- Long solution pages now use one five-item sticky section navigation aligned below the Header.
- Repeated cards became continuous process, evidence, commercial and resource rows.
- OEM and Distributor pages use clearly labeled representative imagery with two hero actions.
- Quality matrices stack into readable labeled records on mobile instead of clipped tables.
- Shipping terms use a restrained dark commercial summary rather than promotional trade cards.

**SEO Impact**

- Preserved all four canonical routes, titles, descriptions, WebPage, BreadcrumbList and FAQ
  structured data, sitemap behavior and important internal links.
- Preserved route-specific Distributor Open Graph and Twitter images.
- Kept evidence labels, repeated navigation and representative-image notes outside search snippets
  where appropriate.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, 81-page built internal-link audit, snippet hygiene, performance budget and secret scan
  passed.
- RFQ constraints, email template, provider-timeout, OEM Builder, Distributor Builder/workbook,
  Quality Control and Export Order Terms tests passed.
- Playwright checked all four pages at 390, 768 and 1440 pixels: every page returned 200, used one
  H1, had no horizontal overflow or broken image, and kept the section navigation aligned below the
  77-pixel Header.
- Browser interaction confirmed the OEM Builder updates its readiness state and the Distributor
  page retains both the sourcing Builder and direct RFQ form.

**Known Issues**

- OEM, Distributor and Quality heroes still use clearly labeled representative visuals rather than
  company-owned production, inspection, packing or shipment photography.
- No verified factory, production-line, warehouse, inspection-equipment or shipment image set is
  available for publication.
- Production deployment and a controlled live RFQ mailbox-delivery test were not performed.

**Next Recommended Step**

- Continue V2 Phase 3C with About, Resources, Downloads, Contact and RFQ, then audit the remaining
  guide-detail presentation as a separate page family.

## 2026-08-21 - V2 Phase 3C Company, Resources And Inquiry Pages

**Task**

Reorganized About, Guides, Downloads, Contact and RFQ into one evidence-led buyer journey. Reduced
repeated trade-policy cards, preserved confirmed company information and made the production RFQ
form the dominant conversion task without changing its API or delivery contract.

**Files Changed**

- `app/about/page.tsx` - rebuilt legal identity, product systems, buyer programs, order process,
  evidence boundaries, company resources, FAQ and RFQ hierarchy.
- `app/guides/page.tsx` - grouped 17 buyer guides by identification, product selection and
  RFQ/OEM intent in a continuous editorial library.
- `app/downloads/page.tsx` - separated public catalogs from RFQ workbooks, retained all nine
  downloads and added product-specific document request paths.
- `app/contact/page.tsx` - consolidated verified direct contact information around one embedded
  RFQ form, response process and supporting buyer resources.
- `app/rfq/page.tsx` - made the form primary on desktop and mobile while retaining search-parameter
  prefill, selected products, attachments, validation, delivery status and fallback channels.
- `app/oem-service/page.tsx` - added a contextual company-profile link for supplier verification.
- `components/content/DownloadCard.tsx` - added a reusable catalog/workbook download row.
- `docs/DESIGN_SYSTEM.md` and this changelog - documented company, resource and inquiry patterns.

**Components Changed**

- Created `DownloadCard`.
- Reused `PageSectionNav`, `ProcessSteps`, `BuyerPathList`, `SectionHeading`, `FaqSection`,
  `RfqCta`, `RfqForm`, `Container`, `Section` and `ButtonLink`.
- Removed no route, form, file-download, API, schema or buyer tool.

**Data Changed**

- No company identity, product specification, compatibility, certification, pricing, capacity,
  customer, commercial-policy or RFQ-delivery data changed.
- All 17 guide records and all nine public download files remain available at their existing URLs.

**Visual Changes**

- About now reads as a supplier-verification page rather than a sequence of promotional cards.
- Guides use buyer-intent groups and compact editorial rows without decorative keyword badges.
- Downloads use restrained file rows with prominent file type and one action.
- Contact and RFQ place the form ahead of repeated policy content and use dedicated commercial pages
  for supporting decisions.
- Mobile pages use deliberate stacking, full-width actions and no RFQ/contact sticky-bar overlap.

**SEO Impact**

- Preserved all five canonical routes, titles, descriptions, BreadcrumbList, WebPage/CollectionPage
  and FAQ structured data, sitemap behavior and public download URLs.
- Retained all 17 guide links and strengthened contextual internal links among company, quality,
  shipping, downloads, products and RFQ pages.
- Kept visible H1s aligned with metadata and maintained one indexable content hierarchy per page.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, 81-page built internal-link audit, snippet hygiene, RFQ constraints/email/provider-
  timeout tests, performance budget and secret scan passed.
- Playwright checked About, Guides, Downloads, Contact and RFQ at 360, 390, 768 and 1440 pixels:
  every page returned 200, used one H1, had no horizontal overflow or broken image and retained the
  expected form/download counts.
- Scrolled browser checks confirmed each section navigation aligns directly below the 77-pixel
  Header. RFQ query parameters correctly prefilled product and quantity fields.

**Known Issues**

- The About hero uses a clearly labeled representative product-range image; verified company-owned
  premises, team, warehouse, inspection, packing and shipment photography is still unavailable.
- Product-specific data sheets remain request-based until the exact product evidence is approved.
- Production deployment and one controlled real-browser RFQ delivery to the configured mailbox were
  not performed in this phase.

**Next Recommended Step**

- Upgrade the 17 guide-detail pages as one controlled page family, preserving their technical
  content, article schema, buyer tools and product/category links.

## 2026-08-21 - V2 Phase 3D Technical Buyer Guide Details

**Task**

Rebuilt the 17 guide-detail pages as one evidence-led technical publication family. Preserved every
guide URL, structured-data contract, worksheet, specialist RFQ tool and product relationship while
improving long-form hierarchy and mobile readability.

**Files Changed**

- `app/guides/[slug]/page.tsx` - rebuilt the shared guide-detail hierarchy, navigation, article,
  checklist, buyer-tool, related-content, FAQ and RFQ presentation.
- `components/content/GuideContents.tsx` - added responsive desktop and mobile guide contents.
- `components/content/ComponentReferenceTable.tsx` - added responsive technical component and
  sourcing-decision reference rows.
- `components/content/DownloadCard.tsx` - added buyer-tool-specific action labels while retaining
  the shared download pattern.
- `docs/DESIGN_SYSTEM.md` and this changelog - documented the guide-detail system and validation.

**Components Changed**

- Created `GuideContents` and `ComponentReferenceTable`.
- Extended `DownloadCard` with an optional action label.
- Reused `PageSectionNav`, `ProductGrid`, `BuyerPathList`, `WeldingMachineRfqBuilder`,
  `FaqSection`, `RfqCta`, `Container`, `Section` and `ButtonLink`.
- Removed no guide route, worksheet, interactive builder, schema or content record.

**Data Changed**

- No guide, company, product, compatibility, technical, certification or commercial data changed.
- All 17 guide records, four component references, specialist RFQ tools and related relationships
  continue to use their existing content sources.

**Visual Changes**

- Guides now use a technical-reference table, continuous numbered article and restrained sticky
  contents instead of repeating the same card treatment for every section.
- Buyer evidence checklists and downloadable RFQ tools have a clear decision sequence.
- Related categories, products and guides are visually distinct and ordered by buyer usefulness.
- Mobile reference rows, article contents, forms and actions use deliberate stacking without
  compressed desktop tables.

**SEO Impact**

- Preserved all guide URLs, canonical metadata, Article, BreadcrumbList and FAQ structured data.
- Kept visible H1s and guide metadata aligned and retained required RFQ snippet regions.
- Strengthened contextual navigation to categories, products, related guides and RFQ without
  adding duplicate or thin pages.

**Validation**

- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, 81-page built internal-link audit, snippet hygiene, robot guide, welding-machine RFQ
  builder, RFQ constraints, performance budget and secret scan passed.
- Playwright checked representative compatibility, RFQ and equipment guides at 360, 768 and 1440
  pixels. All nine states returned 200, used one H1, had no horizontal overflow or broken images,
  retained the expected technical sections and tools, and aligned the sticky navigation below the
  Header.

**Known Issues**

- Some related products still rely on reviewed catalog crops rather than a complete company-owned
  multi-angle image set.
- Technical guide content deliberately leaves exact product fit, dimensions, ratings and compliance
  evidence to quotation or approved documentation.
- Production deployment and one controlled live RFQ mailbox-delivery test were not performed.

**Next Recommended Step**

- Audit the remaining product evidence and image-governance backlog, then improve the strongest
  search-impression product/category opportunities without publishing unverified technical claims.

## 2026-08-21 - V2 Phase 4A Product Image Evidence Queue

**Task**

Closed the gap between the three missing-photo draft products and the wider image-governance
backlog. Rebuilt the generated task list around all registered assets and made product-gallery
captions reflect exact-product versus family-reference evidence.

**Files Changed**

- `scripts/generate-product-image-tasks.ts` - generates a prioritized provenance, rights,
  exact-match, resolution and replacement queue from the governed image registry.
- `scripts/product-image-asset-utils.ts` - detects PNG/JPEG by file signature and warns when the
  extension and real file format differ.
- `scripts/report-product-image-assets.ts` - reports file-format corrections and signature-based
  dimensions alongside rights, source, resolution and duplicate-image gaps.
- `docs/product-image-tasks.csv` - refreshed from three missing-photo tasks to the complete 46-asset
  evidence queue.
- `docs/product-image-asset-report.md` - refreshed dimensions and file-format correction section.
- `components/content/ProductGallery.tsx` and `ProductGalleryViewer.tsx` - pass and disclose the
  governed content-match and publication status.
- `.github/workflows/quality.yml` - regenerates and diff-checks the image evidence task queue.
- `README.md`, `docs/DESIGN_SYSTEM.md` and this changelog - documented workflow and disclosure rules.

**Components Changed**

- Extended `ProductGalleryViewer` with evidence-aware captions.
- Removed no product image, route, product, gallery action or asset-registry row.

**Data Changed**

- No image was marked exact, rights-approved or search-eligible.
- No product, specification, compatibility, price, certification, SKU or publication status changed.
- The generated queue now contains 46 actionable assets: four P0, 23 P1 and 19 P2 tasks.
- Three contact-tip files were identified as PNG content stored under `.jpg` paths; they remain
  published legacy references and are queued for reviewed re-export or rename.

**Visual Changes**

- Product detail galleries now say “product-family reference image” for current family-level legacy
  assets. Future exact, reviewed assets will say “reviewed product image”.
- Card imagery and gallery geometry are unchanged.

**SEO Impact**

- Product URLs, canonical metadata, structured data, sitemap and image paths are unchanged.
- Evidence-aware captions reduce the chance that a family-level visual is interpreted as proof of
  exact SKU geometry.

**Validation**

- Image-asset validation and image-task generation passed with no blocking errors.
- Signature detection reported the three known extension/content mismatches as warnings.
- ESLint, TypeScript and Next.js production build passed; 91 pages generated.
- SEO audit, 81-page built internal-link audit, snippet hygiene, performance budget and repository
  secret scan passed.
- Playwright checked the contact-tip and MB15 gas-nozzle product galleries at 360 and 1440 pixels.
  All four states returned 200, used one H1, had no horizontal overflow or broken images, retained
  the expected gallery counts and showed the evidence-aware family-reference caption.

**Known Issues**

- All 46 governed assets still require explicit usage-rights review; none is yet search eligible as
  an exact-product asset.
- Nine assets still have unknown source provenance, including four active main-image P0 tasks.
- Three files still need reviewed re-export or rename so their extensions match the actual image
  format. No automatic binary conversion was performed because product geometry must be preserved.

**Next Recommended Step**

- Complete the four P0 source/provenance decisions, then capture company-owned exact-product views
  for the 15AK contact tips, holder and nozzle while confirming the 15 governed technical facts.

## 2026-08-21 - V2 Phase 4B 15AK Factory Evidence Workbook

**Task**

Created a low-friction internal workbook that turns the highest-priority 15AK technical, image and
provenance gaps into structured factory/reviewer inputs without enabling automatic publication.

**Files Changed**

- `docs/operations/15ak-factory-evidence-handoff.md` - documented the workbook, accepted evidence,
  controlled CSV/registry update and required validation sequence.
- `README.md` - linked the 15AK evidence handoff from repository operations documentation.
- `docs/CHANGELOG_AI.md` - recorded the operational artifact and evidence boundary.
- Generated operational artifact: `arcfort-15ak-factory-evidence-intake.xlsx` in the task output
  directory; the existing CSVs remain canonical.

**Components Changed**

- None. This phase adds an internal evidence-collection artifact, not a public website component.

**Data Changed**

- No technical value, product record, image status, compatibility relationship or publication
  state changed.
- The workbook projects four unresolved P0 provenance decisions, 15 technical-fact review rows and
  20 exact-product image requests from existing governed sources.

**Visual Changes**

- None on the public website.
- The internal workbook uses ArcFort industrial-blue hierarchy, pale-orange input cells, frozen
  headers, filters, status dropdowns and formula-driven readiness counts.

**SEO Impact**

- None. No URL, metadata, schema, sitemap, image path or indexation state changed.

**Validation**

- Workbook summary formulas returned four unresolved P0 decisions, zero confirmed technical facts
  and zero approved image requests, matching the governed repository state.
- Formula-error scan found no `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?` or `#N/A` cells.
- All four worksheets were rendered and visually reviewed for hierarchy, clipping, wrapping,
  editable-input distinction and table readability.

**Known Issues**

- The workbook still requires real factory/product-owner input; it intentionally contains no new
  confirmed technical or image evidence.
- Completed workbook rows require manual evidence review and controlled transfer to canonical CSVs.

**Next Recommended Step**

- Have the product owner resolve the four P0 provenance rows first, then complete the 15 technical
  confirmations and capture the requested exact-product image sets.

## 2026-08-25 - V2 Release Candidate Consolidation And QA

**Task**

Audited the complete uncommitted V2 website and data-governance worktree, regenerated the governed
reports, closed two buyer-path/mobile issues and verified the result as one reviewable release
candidate without promoting unconfirmed product evidence.

**Files Changed**

- `app/rfq/page.tsx` - links RFQ buyers directly to the quality inspection workflow.
- `components/navigation/MobileNavigation.tsx` - reserves space for the fixed mobile inquiry bar so
  the open menu and its final actions remain reachable.
- `docs/site-wide-upgrade-roadmap.md` - records the verified 91-page build and governed 15AK series
  page.
- Governed product, image, series, compatibility, technical and acquisition reports were
  regenerated from their canonical sources.
- `docs/CHANGELOG_AI.md` - records the release-candidate audit and remaining evidence constraints.

**Components Changed**

- Refined `MobileNavigation`; no component, route, form or buyer tool was removed.

**Data Changed**

- No product value, compatibility relationship, image-rights state, technical confirmation,
  company fact or publication status changed.
- The verified governed state remains 43 product records, 40 active products, three image-blocked
  drafts, 46 image assets, one published series, four reference-only relationships and 15 technical
  facts awaiting confirmation.

**Visual Changes**

- The 360px mobile menu now ends above the fixed inquiry controls and can scroll its `Contact Sales`
  action fully into view.
- No desktop page composition or product geometry changed.

**SEO Impact**

- Preserved all public URLs, canonicals, metadata, schema, sitemap records and redirects.
- Strengthened the RFQ-to-quality internal link by targeting the visible inspection workflow.
- The production build continues to expose 40 product pages, six categories, one series page, six
  applications and 17 guides.

**Validation**

- Product CSV, image presence, image registry, product-series evidence, 359 component facts, 121
  component candidates, 181 image requests, compatibility registry and 15 technical facts passed
  their domain validators.
- ESLint, TypeScript and Next.js 15 production build passed; 91 pages generated.
- RFQ constraints, email templates, provider timeout, product search, category/OEM/distributor RFQ
  builders, company profile, quality control, shipping terms, robotic torch and sender-domain tests
  passed.
- SEO, 81-page built internal-link, snippet hygiene, performance budget and 328-file secret scans
  passed.
- Playwright checked 11 representative routes at 360, 768 and 1440 pixels plus the open mobile menu:
  all 34 states returned the expected content, one H1, no horizontal overflow, no broken images and
  no browser console errors. The mobile menu/sticky-control overlap and final-action reachability
  checks passed after refinement.

**Known Issues**

- All 46 product image assets still require explicit usage-rights review; nine have unknown source
  provenance and four active main images remain P0 decisions.
- Three products remain drafts until reviewed exact-product images are supplied.
- The 15 governed 15AK technical facts and all compatibility relationships still require qualifying
  evidence before confirmation.
- Sales and buyer inbox placement, exposed Resend-key rotation, Search Console submission and
  analytics confirmation remain external operational checks.
- Production deployment was not performed in this consolidation phase.

**Next Recommended Step**

- Resolve the four P0 image provenance decisions and complete the 15AK factory technical/image
  intake before publishing another series or expanding the active SKU count.

## 2026-08-25 - 15AK Airtable Evidence Intake

**Task**

Created a private, reviewer-friendly Airtable intake for 15AK technical and product-image evidence,
then documented the boundary that keeps repository data authoritative.

**Files Changed**

- `docs/operations/airtable-15ak-evidence-intake.md` - cloud intake purpose, authority boundary,
  canonical mapping, transfer procedure and proposed companion file-request configuration.
- `knowledge-base/decisions/2026-08-25-airtable-evidence-intake-boundary.md` - durable decision against
  automatic publication or a second source of product truth.
- `README.md` - linked the Airtable intake workflow from the 15AK evidence and useful-document sections.
- `docs/CHANGELOG_AI.md` - recorded this operational integration.

**Components Changed**

- None.

**Data Changed**

- Created the private Airtable base `ArcFort Weld - 15AK Evidence Intake` with five workflow records,
  four P0 image-decision records, 15 technical-review records and 20 image-request records.
- No public or canonical product data changed. All technical rows remain
  `NEEDS_FACTORY_CONFIRMATION`; all image requests remain `requested`; all P0 decisions remain
  `Needs review`.

**Visual Changes**

- None.

**SEO Impact**

- None. Public URLs, metadata, schema, sitemap and indexability states are unchanged.

**Validation**

- Verified Airtable table counts and status distributions after seeding.
- Confirmed that the base contains no confirmed technical value, approved image or search-eligible
  publication state.
- Ran the repository technical-fact, product-image asset and secret-pattern checks after documenting
  the workflow.

**Known Issues**

- The four P0 image provenance decisions, 15 technical facts and 20 requested image views still need
  real reviewer evidence.
- A Dropbox companion file request was not created because its exact folder, title, deadline and
  open/closed state require explicit owner confirmation.
- Airtable remains private external account state and has no automatic repository synchronization.

**Next Recommended Step**

- Approve the proposed Dropbox intake configuration, then collect original 15AK product photos and
  exact-SKU evidence for review and controlled repository transfer.

## 2026-08-25 - Contact Tip Image Encoding Correction

**Task**

Corrected three contact-tip image files whose `.jpg` extension did not match their PNG-encoded
content, without changing public paths or upgrading their evidence status.

**Files Changed**

- `public/images/products/mig-contact-tip-m6-0-8mm.jpg` - re-exported as real JPEG at 750 x 750.
- `public/images/products/mig-contact-tip-m6-1-0mm.jpg` - re-exported as real JPEG at 750 x 750.
- `public/images/products/mig-contact-tip-m6-1-2mm.jpg` - re-exported as real JPEG at 750 x 750.
- `docs/product-image-tasks.csv` - regenerated the governed image action queue.
- `docs/product-image-asset-report.md` - regenerated the image asset readiness report.
- `docs/product-image-source-audit.md` - recorded the correction and unchanged evidence boundary.
- `docs/CHANGELOG_AI.md` - recorded this controlled asset correction.

**Components Changed**

- None.

**Data Changed**

- No product field, image path, publication state, source, ownership or usage-rights state changed.
- File-format correction count decreased from three to zero.

**Visual Changes**

- None intended. Dimensions, crop and composition remain unchanged.

**SEO Impact**

- Existing image URLs and product URLs are preserved. Correct MIME-compatible encoding reduces the
  risk of image processing or caching inconsistencies.

**Validation**

- Product image asset validation passed for 46 assets with zero file-format corrections.
- Product image task and asset reports regenerated without upgrading any evidence state.
- Product, SEO, lint, TypeScript and production-build checks were run before publication.

**Known Issues**

- The three files still reuse the same family-level visual and remain unresolved P0 provenance
  decisions.
- Forty-three legacy public reference assets still require explicit usage-rights confirmation.
- Two duplicate-content groups still need variant-specific replacements.

**Next Recommended Step**

- Collect rights-approved, exact-SKU front, connection/detail and packaging views for the 15AK
  contact-tip variants through the governed evidence intake.

## 2026-08-25 - Unassigned Product Image Triage System

**Task**

Converted the 73 unassigned files in `public/images/products/` from an unstructured folder backlog
into a governed candidate-review system without assigning any file to an exact SKU.

**Files Changed**

- `data/evidence/local-product-image-triage.csv` - canonical candidate, visual-family, rights,
  exact-match, review and priority records for every unassigned product-image file.
- `scripts/validate-local-image-triage.ts` - validates schema, allowed states, file coverage,
  uniqueness, canonical-registry separation and approval evidence gates.
- `package.json` - added `npm run images:triage:validate`.
- `.github/workflows/quality.yml` - added local-image triage validation to the product-image CI gate.
- `AGENTS.md` - added permanent unassigned-image governance and migration rules.
- `docs/QA_CHECKLIST.md` - added the triage validator to product/image checks.
- `docs/operations/airtable-15ak-evidence-intake.md` - documented the fifth Airtable table and its
  canonical repository mapping.
- `knowledge-base/decisions/2026-08-25-airtable-evidence-intake-boundary.md` - recorded the expanded
  cloud-review scope and repository authority.
- `README.md` - documented the candidate CSV and validation command.
- `docs/CHANGELOG_AI.md` - recorded this image-evidence workflow.

**Components Changed**

- None.

**Data Changed**

- Added 73 local candidate records: 9 P0, 44 P1 and 20 P2.
- Visual-family sorting contains 21 MIG/MAG, 22 TIG, 10 plasma, three welding consumable, eight
  welding accessory, two welding equipment and seven unknown records.
- Added a matching private Airtable `Local Asset Triage` table with 73 records plus evidence,
  reviewer and ISO-date fields.
- All candidates remain `needs_confirmation`, `unverified` and `needs_review`. No canonical product
  assignment or public image state changed.

**Visual Changes**

- None.

**SEO Impact**

- No route, metadata, schema, sitemap or indexability change. The new gate reduces the risk of an
  unreviewed local file entering product image SEO.

**Validation**

- Confirmed one triage row for each of the 73 unassigned product-image files.
- Confirmed zero approved usage-rights records and zero confirmed exact-product matches.
- Confirmed the three image-blocked drafts still have no safe local replacement candidate.
- Ran image triage, image registry, product, SEO, lint, TypeScript and production-build checks before
  publication.

**Known Issues**

- The local filenames and visual-family labels do not establish source ownership or exact-product
  identity.
- No Welding Magnet or dedicated TIG Torch Switch photo was found. Several plasma consumable images
  cannot be identified as a retaining cap without model, drawing or source evidence.
- The nine P0 local family candidates still need source-owner, rights and labeled-sample or drawing
  review before any canonical assignment.

**Next Recommended Step**

- Have the product owner review the nine P0 local candidates and collect exact 15AK product photos;
  then transfer only approved files into `data/assets/product-image-assets.csv`.

## Entry Template

```markdown
## YYYY-MM-DD - Task Name

**Task**

Short objective and reason for the change.

**Files Changed**

- `path/to/file` - purpose

**Components Changed**

- Created, changed or removed components; write `None` when not applicable.

**Data Changed**

- Product, company, SEO, analytics or operational data affected; write `None` when not applicable.

**Visual Changes**

- Buyer-visible design impact; write `None` when not applicable.

**SEO Impact**

- URLs, metadata, schema, sitemap or internal-link impact; write `None` when not applicable.

**Validation**

- Commands and manual checks completed.

**Known Issues**

- Missing evidence, blocked checks, drafts and operational risks.

**Next Recommended Step**

- One highest-impact follow-up.
```
