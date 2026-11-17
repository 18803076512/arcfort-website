# Product Finder Applied Filters And Navigation

Date: 2026-11-17

## Evidence

Read-only production browser interaction at 390px and 1440px reproduced a mismatch after searching
for an existing SKU and category, then choosing Clear Filters: the URL had no filters and the
catalog showed all 40 public products, but the native search input and category select retained
the old values. After another search, browser Back returned to the unfiltered URL while the
controls still showed that later query/category. The browser made GET/HEAD requests only.

The finder uses uncontrolled native fields initialized with `defaultValue`. Client navigation on
the same product-center route updates the server-selected catalog and finder props without
necessarily replacing the dirty native controls. This does not change the search algorithm's
correct result; it leaves the buyer's visible form inconsistent with the applied filters.

This supplements the finder scope left outside
[the native-control hydration decision](2026-11-06-public-native-controls-hydration.md).
The [mobile visual hierarchy](2026-11-17-mobile-product-and-rfq-hierarchy.md) remains in force.

## Decision

Give the finder a stable React identity derived from the normalized applied query and category.
When that pair changes, initialize a fresh native form from the new applied filter values.
Do not include page number or fragment in that identity: changing pages or jumping back to the
finder within the same applied filters should retain an unsubmitted draft.

Keep the native form, GET action and uncontrolled fields available before hydration. Do not add a
mount effect that overwrites early buyer input, and do not replace search/history with forced
document reloads to conceal the inconsistency. URL construction, filtering, pagination, canonical
and parameterized-page noindex rules remain unchanged.

## Verification

Exercise search, clear, browser Back/Forward and same-filter fragment/pagination navigation at
mobile and desktop widths. Check both visible controls and result/URL state, using a document
marker to prove normal client navigation did not silently become a hard reload. Preserve native
input before hydration and unsubmitted drafts within an unchanged applied filter pair.

Use the existing isolated production-build hydration runner, its loopback GET/HEAD restrictions
and delayed unchanged modules. Retain the production before observation separately from local,
clean-CI and post-deployment evidence. None of these checks proves RFQ delivery, search ranking or
product/media approval.

## Reversal

If initial hydration or same-filter navigation loses a buyer's draft, withhold release and rerun
the focused browser cases. A scoped revert follows the existing authorized repository release
workflow; product data, image evidence and provider settings are outside this change.
