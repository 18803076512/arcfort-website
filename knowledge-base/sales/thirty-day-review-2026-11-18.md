# Thirty-Day Sales Review

Decision date: 2026-11-18. Scope: the existing owner-only sales workbook, its derived
`30-Day Review` tab and the interpretation of its aggregate results. No buyer records, private
workbook identifier or populated sales data belong in this repository.

## Period And Source

The two editable UTC boundaries define an exact 30-day interval: start inclusive, end exclusive.
The initial observation period is 2026-11-18 00:00 UTC through 2026-12-18 00:00 UTC. It is a forward
observation window, not an already completed month of results. The tab uses fixed inputs rather
than `NOW()`; an invalid window suppresses its metrics until corrected.

The review reads the existing 500-row RFQ Ledger and Daily Review capacities. It neither creates
inquiries nor changes the original fields, actions, validations, queue, access or recalculation
settings. Future action plans remain Beijing time, Monday-Saturday; actual event evidence remains
UTC. The reference-clock limitation in the
[existing operating handoff](sales-action-and-product-evidence-handoff-2026-11-15.md) still applies.

## Counting Rules

- Exclude `internal_test` entries. Exclude every occurrence of a duplicated RFQ reference and show
  the number of excluded reference keys separately; do not select one row's status arbitrarily.
- The received cohort requires a unique reference and a valid actual receipt time inside the
  interval. Missing or invalid receipt times are visible separately and do not enter its denominator.
- Qualification, open/closed and `won` counts describe the cohort's current manually entered state.
  The ledger has no win timestamp: this is not a count of orders won during the interval or a
  historical snapshot of state at its end.
- First-response and sent-quotation coverage require valid actual timestamps at or after receipt
  and before the interval ends. A sent-quote label with missing or inconsistent time is a separate
  review item; it is not automatically treated as an unsent quote.
- Open records with no owner, specific next action or valid Beijing action plan are separate
  operating checks. These checks do not send reminders or establish response-time compliance.
- Daily Review counts timestamped rows and their entered source-check states. Duplicate check rows
  can exist; totals do not prove twice-daily inspection or inbox completeness.
- An empty denominator leaves rates blank. Zero registered rows do not establish zero demand,
  zero mailbox receipts or a conversion rate.

## Verification And Daily Use

Before release, evaluate the native formulas against separate synthetic scratch sheets: interval
boundaries, tests, duplicate conflicts, missing/invalid times, current outcomes, action plans,
empty denominators and invalid intervals. Keep fixtures outside the real Ledger and Daily Review;
remove only the scratch sheets created for that verification. Retain anonymized results privately.

Read back the final native values, formulas, validation and formatting; compare the original tabs
and private access before and after. Synthetic arithmetic or a balanced formula alone cannot prove
Google Sheets evaluation. If a new source row exceeds the governed 500-row capacity, review and
expand all dependent ranges together rather than treating this view as a complete ledger.

The November 18 native verification passed 18 positive metric cases, empty-source blank rates and
an invalid-window suppression check with no formula errors. The three newly created scratch tabs
were removed. Final readback preserved the original five tabs, source formulas/validation and
owner-only access; the 30-day view was added without entering real inquiry or check rows. Native
formula/format structure was verified through the API; a rendered Google Sheets screenshot was
unavailable in that execution environment. These checks do not establish sales activity or results.

For ongoing use, record actual inbox checks and real inquiries in the original tabs, with reliable
event times and a specific next action. Review the aggregate data-quality rows before interpreting
the cohort. Change the two period inputs deliberately for each comparison, and retain a dated
private snapshot if a historical result is needed. Do not copy buyer identity or attachments into
analytics or a public report.
