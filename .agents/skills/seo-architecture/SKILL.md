---
name: seo-architecture
description: Map welding buyer keywords and search intent to canonical product, series, compatibility, category, solution, and guide URLs while detecting cannibalization and protecting existing SEO.
---

# SEO Architecture

## Purpose

Design a durable search architecture that connects buyer demand to the strongest governed ArcFort
Weld page type and internal-link path. Prioritize commercial product systems over generic article
volume and protect existing indexed equity.

## Trigger Conditions

Use this skill when a task asks for:

- Keyword, query or Search Console analysis
- Search-intent and page-type mapping
- Target URL or internal-link architecture
- Category, series, compatibility or product SEO planning
- Cannibalization, duplicate-intent or orphan-page detection
- Metadata/content refresh prioritization
- Indexing, sitemap or canonical architecture review

## Required Inputs

- Existing route, canonical, sitemap and indexability inventory
- Canonical product/category/series readiness state
- Target market and language
- Buyer/search objective
- Existing metadata and internal links

## Optional Inputs

- Google Search Console query/page exports
- GA4 non-PII landing-page and conversion data
- Approved keyword research or SERP evidence
- Buyer RFQ terminology and sales questions without PII
- Competitor/category terminology used only as research
- Planned product, series or compatibility releases

## Source Priority

For search demand and performance:

1. First-party Search Console, live index and non-PII analytics evidence
2. Current ArcFort Weld routes, product readiness and RFQ intent
3. Official manufacturer terminology and applicable standards
4. Reputable third-party keyword/SERP research

For product claims, continue to use the Level A-D evidence rules in `AGENTS.md`. Search volume or a
competitor page never confirms a technical fact.

## Workflow

1. Read current SEO reports, route contracts, product readiness, relevant decisions and existing
   content before proposing a new URL.
2. Normalize queries by market/language and identify transactional, commercial investigation,
   compatibility, technical support or informational intent.
3. Map one primary intent to one canonical target URL and record useful secondary intents.
4. Choose page type in this priority order when evidence supports it:
   1. Product page
   2. Product-series page
   3. Compatibility page or governed compatibility section
   4. Commercial category page
   5. Industry/commercial solution page
   6. Technical guide
   7. Generic supporting article only for a distinct unmet intent
5. Compare proposed targets with existing titles, H1s, slugs, content and query performance.
6. Detect cannibalization, duplicate intent, thin variants, orphan pages and missing decision links.
7. Prefer improving an existing high-impression/low-click page over creating an overlapping page.
8. Define inbound/outbound internal links and the next buyer action, usually product review or RFQ.
9. Preserve existing URLs unless an approved migration has stronger evidence and a redirect plan.
10. Produce an implementation plan; public changes remain a separate approved task.

## Output Contract

Return an SEO architecture map containing:

- Market/language
- Primary keyword/query cluster and search intent
- Recommended page type and canonical target URL
- Existing competing URLs and cannibalization severity
- Keep, improve, merge, redirect, hold or create recommendation
- H1/title/meta direction without unsupported claims
- Required product/data readiness and publication dependencies
- Inbound and outbound internal-link targets
- RFQ or commercial next action
- Indexability, canonical and structured-data recommendation
- Priority, evidence source and review date
- Blocking risks and approval requirements

## Validation

- Every target URL is unique, canonical and aligned with one primary intent.
- No recommendation changes a product fact or verification status.
- New pages do not overlap existing indexed pages without a documented consolidation reason.
- Internal links resolve and support a real buyer decision path.
- Metadata is unique and consistent with visible content.
- Structured data is appropriate and supported by visible facts.
- Sitemap and robots behavior remains deliberate.
- Run `npm run seo:audit`, `npm run seo:links`, `npm run seo:images` and
  `npm run seo:snippets` when implementing important SEO changes.
- Use live audits only for authorized read-only verification and record the evidence date.

## Stop Conditions

Stop or hold the recommendation when:

- Product/series/compatibility evidence is not ready for the proposed page type.
- Query data is too weak to justify a new overlapping URL.
- A URL migration lacks redirects, canonical handling or owner approval.
- The plan would create doorway pages, location spam, hidden keywords or generic AI content.
- A proposed claim relies on search demand rather than product evidence.
- Search Console/analytics data would expose buyer PII.

## Approval Requirements

Read-only auditing, keyword mapping and draft architecture need no additional approval. Require owner
approval before major URL migration, merge/removal of indexed pages, bulk metadata replacement,
index submission, production deployment or an external analytics/Search Console write.

## Data That May Be Modified

- SEO architecture reports and `knowledge-base/seo/` records
- Metadata/internal-link plans and non-public implementation drafts
- Existing metadata, internal links, sitemap or structured-data code only in an explicitly scoped
  implementation task with normal validation

## Data That Must Never Be Modified Automatically

- Canonical product facts, technical verification or compatibility status
- Stable public URLs, redirects or indexability without approved migration
- Product publication status or image-rights state
- Search Console, GA4 or production indexing configuration without approval
- Buyer PII, private inquiry data or unverified customer terminology
- Fake reviews, ratings, offers, prices, locations or keyword-stuffed content

## Handoff

Send page-ready architecture to `$product-publishing`. Send missing product/series evidence upstream
instead of creating a weaker generic page. `$release-qa` verifies the implemented route, metadata,
schema, links, sitemap and indexing behavior.
