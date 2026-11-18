# RFQ List Mutation Outcomes

Decision date: 2026-11-18. Scope: local candidate for truthful browser feedback and consent-gated
RFQ-list analytics. No production settings, product records, routes or delivery contracts change.

## Observed Failure

`lib/rfq-list.ts` already catches `localStorage.setItem` failures and returns the readable saved
list without dispatching `arcfort:rfq-list-changed`. The Add to RFQ button nevertheless announced
success and emitted `rfq_list_add` or `rfq_list_remove` unconditionally. The RFQ form similarly
emitted removal and clear events without checking the returned list.

A fresh production-build browser reproduction blocked only writes to the RFQ-list key with a
synthetic `SecurityError`. The target remained absent and the previously saved product remained
intact; the button's selected state correctly remained false. Its live announcement still said
the target was added, and the mocked local analytics callback received `rfq_list_add`. The bug was
false feedback and measurement, not a false visual selected state.

A second reproduction started with a hydrated saved selection, then denied both reads and writes.
The library's array-only read fallback returned `[]` for the inaccessible list. Callers could mistake
that unknown state for a confirmed removal or clear. Denying reads while permitting writes also
allowed a mutation based on that empty fallback to overwrite the previously saved selection.

## Decision And Consequences

Keep the existing array-returning storage API and add `readRfqListSnapshot`, which distinguishes a
readable normalized list from unavailable or malformed storage. An unavailable list is unknown,
not proof that the saved selection is empty. All list mutators, including line-item edits, skip the
write when the current selection cannot be read. After a write, confirm readable saved state before
dispatching the existing change event, so unverified writes do not reset event-driven selection UI.

Confirm mutation outcomes using a fresh readable saved snapshot at the affected callers:

- Addition succeeds only when the readable saved list contains the target's `getRfqListItemKey`.
- Removal succeeds only when the readable saved list no longer contains that key.
- Clearing succeeds only when the readable saved list is empty.

Only confirmed outcomes produce existing success announcements or success analytics. Failed button
actions announce the failure and point to the existing product-aware Request a Quote path. Failed
RFQ-form removal/clear actions display a status message pointing to the existing email/WhatsApp
fallbacks. Unverified outcomes retain the visible selection, existing validation and
attempt-reference state. Blocked or skipped writes preserve the saved selection; a completed write
whose verification becomes unreadable can have changed storage. A later successful action clears
the form's list-mutation error.

The existing hydration guard, button layout, 50-product limit, normalized unique product keys,
analytics consent check and non-PII event parameters stay in force. Line-item edits retain their
existing interaction-start event, which describes an attempted interaction rather than a saved
mutation; the existing editing API is retained with the unreadable-storage write guard.

The readable snapshot augments the library without changing existing array-returning consumers or
adding a persistent buffer. Retrying a failed write or submitting an inquiry automatically would
add unrelated behavior and is outside this decision.

## Verification And Evidence Boundary

The existing production-build public hydration runner now covers normal add/remove and form
remove/clear, denied analytics consent, duplicate normalization, full capacity, and blocked RFQ-list
writes using both `SecurityError` and `QuotaExceededError` at 390px and 1440px. It checks stored
selection, selected state, announcements/status, event names/parameters/counts, retained line-item
details, fallback URLs and RFQ draft context. It also covers read-only and combined read/write loss
after hydration, plus storage becoming unreadable immediately after a successful write. The runner
inspects actual saved bytes through the captured original getter and counts attempted writes; a
read-only failure must cause zero mutation writes. Unverified outcomes retain the prior visible
selection and suppress success events. Analytics is mocked in the browser; the runner refuses all
external requests and all methods except GET/HEAD. It never sends an RFQ.

Local evidence is retained under
`outputs/ecosystem-execution-20261118/rfq-selection/`: the `before` directory contains the failing
baseline build/browser log and observed false success event; `after` contains candidate check logs,
browser observations/report and failure-state screenshots; `before-unreadable` retains the second
failing reproduction and `final` retains checks for the complete read/write-loss repair. These
ignored artifacts contain only synthetic test selection data and public product context.

This local verification does not establish production analytics collection, inbox placement or sales
results. Deployment and live verification remain separate actions.

## Reversal

Revert the scoped storage/component/form guards and runner additions together only if an alternative
preserves the same blocked-storage, unreadable-storage, successful-mutation, consent, capacity,
fallback and hydration checks.
Do not restore unconditional success feedback or events. This extends the existing
[native-controls hydration decision](2026-11-06-public-native-controls-hydration.md) and preserves
the [RFQ hierarchy decision](2026-11-17-mobile-product-and-rfq-hierarchy.md).
