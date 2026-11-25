# Public Model References In Catalog Search

Date: 2026-11-25. Scope: the existing Product Center's internal search, using the already-public
product projection. This is a discoverability correction, not a product-evidence promotion.

## Observed Gap

The November 24 public SSR and unchanged canonical-projection baseline found no results for
`15AK`. `MB15 contact tip` returned an existing holder but omitted CT0004 and CT0005, while each
contact tip's exact SKU returned its correct product. Their public specifications already carried
qualified `15AK / MB15 reference family` wording with sample/drawing/model confirmation guidance.
The matcher searched title, SKU, category, descriptions and applications, excluding specification
values. Existing public model references therefore could not contribute to term matching.

## Search Boundary

Append values returned by `getPublicSpecificationRows(product)` to the existing searchable text.
Use the projected `Product`, not raw source records, technical/candidate registries, internal notes,
image metadata or compatibility guesses. The existing helper excludes identity labels and
low-signal placeholders. Identity matching already has title, SKU and category inputs.

Keep the existing AND-term matching, normalization, aliases, title/SKU/category scoring, category
filters and pagination. No new technical values, product records, series memberships or confirmed
compatibility are created. A matched reference remains a reference with the same public wording;
discoverability does not establish fit or quotation eligibility. CT0006 retains its independent
general M6 x 27 mm identity and must not match 15AK/MB15 from this change.

The shared display/presentation helpers retain their behavior. Their runtime imports use relative
`.ts` paths so the plain Node regression runner can execute the same visibility rules as Next.js,
including the canonical `TO_BE_CONFIRMED` constant. Do not duplicate that constant or implement a
second list of public-row exclusions inside the matcher.

## Verification Contract

- A model appearing only in a visible reference row must match alone and with product terms.
- Category filters, exact/compact SKU and existing synonyms must retain their behavior.
- Image-name/identity rows, placeholders and non-public fields must not supply search matches.
- Derive actual result counts from the complete public product projection; retain existing valid
  matches such as the MB15 holder. Test CT0006 separately and preserve reference qualifications.
- Exercise the native finder, clear/history and query noindex behavior at 390px and 1440px. Follow
  representative product-to-RFQ links with GET only, retaining product identity and unanswered
  technical questions without submitting an inquiry.
- Verify the exact candidate and merged tree, CI, Production deployment and official-domain search
  and health before reporting publication. Keep baseline, local and production observations dated.

## Unchanged Gates And Rollback

Public URLs, metadata, canonical, sitemap, filtered/internal-search noindex and image eligibility
remain governed by their existing rules. Product, technical, compatibility, media, company and
buyer records remain unchanged. Current analytics/account evidence, original images and technical
confirmation are independent work, not inferred from search results or passing HTTP checks.

If hidden content becomes searchable or existing exact-SKU/category behavior regresses, withhold
release. A deployed regression uses a scoped revert through the existing authorized PR/main release
workflow; no product-data migration is needed. Preserve the earlier
[finder navigation-state decision](../decisions/2026-11-17-product-finder-navigation-state.md).
