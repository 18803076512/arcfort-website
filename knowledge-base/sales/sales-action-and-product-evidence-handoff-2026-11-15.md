# Sales Action And Product Evidence Handoff

Review date: 2026-11-15. Scope: private sales operations and evidence collection; no new public
product facts, compatibility, media approval or sales result.

## Confirmed Operating Arrangement

The owner will personally assign inquiries, give first human responses and follow up. The future
calendar is Beijing time (`Asia/Shanghai`, UTC+8), Monday-Saturday. This decision does not establish
the timezone of old email records, daily working hours or a statutory holiday calendar.

Under exact owner authorization, the existing private Google sales workbook was upgraded in place.
It remains owner-only and stores actual event times in UTC. The original 14 headers are retained;
four added headers are `next_action`, `missing_information`, `next_action_due_beijing` and
`action_state`. The currently empty J column now derives planned UTC from the Q Beijing-time plan.
Action Queue reads the same 500 source rows. Qualification, quote and outcome states remain human
decisions; internal tests do not count as real leads or orders. No inquiry row was inserted.

Independent native readback verified 1,000 derived formulas, 500 new date validators, preserved
original validation, zero entered-row metrics, empty queue, time settings and private access.
Private file identifiers, mail locators, buyer identity and populated records are not stored here.

## Reference Clock Limitation

At 06:26:37 UTC, a fresh Sheets API read still returned a 06:17:57 reference clock despite the
`MINUTE` recalculation setting. An instruction edit later refreshed it to 06:28. This proves a cache
was observed; it does not prove reliable unattended deadline reminders. The private Read Me now
labels reference clocks without calling them actual event times and requires manual deadline
checks against Q when stale. Actual events use reliable email or device-clock evidence, never a
cached `NOW()` value. Unknown historical times stay blank.

See the [sales playbook](../../docs/sales/rfq-response-playbook.md) for the ongoing procedure.
The [empty CSV](../../docs/sales/rfq-sales-ledger-template.csv) mirrors the 18 headers only; CSV
cannot preserve the live workbook's formulas, validations, permission or derived queue.

## Product Evidence Is Still The Next Source Gate

Fresh connected Airtable reads on 2026-11-15 found the 15 technical requests unconfirmed, 20 product
image requests without originals, four P0 decisions pending and no completed exact-match/rights
approval among 73 local assets. Historical file-lineage reviews are not product evidence. Drive
and Dropbox searches found no matching original in accessible scopes; offline/inaccessible sources
remain unknown. No evidence record was promoted or synchronized by this read.

P0 image priority is not 15AK membership: its four rows include CT0006 and omit TH0007, whose image
task is P1. CT0006 keeps its independent general-M6 technical intake and separate reviewer file.
The four governed 15AK product SKUs remain CT0004, CT0005, TH0007 and GN0008.

The [factory handoff](../../docs/operations/15ak-factory-evidence-handoff.md) defines the source CSVs
and stable-ID reconciliation. A completed worksheet is proposed reviewer input, not automatic
confirmation, publication eligibility or approval to quote. Keep buyer-provided records in the
controlled mailbox; a factory evidence package must not copy buyer messages or identity into Git.

## Current Search Access

At 06:36 UTC on 2026-11-15, GSC Wizard `get_account_info` returned
`payment_required` / `subscription_required`, with no active trial or subscription. Further calls
were not attempted because the connector reports that all would be rejected. No property was
registered and no subscription was enabled. Current property access, latest data date, recent and
previous 28-day totals remain unknown. The historical export ending 2026-08-09 is unchanged.
Native Google Search Console read-only exports remain an alternative source.

## Next Operating Action

Use the existing private ledger for actual inbox checks and real inquiries. For each open inquiry,
record the owner, specific next action and planned Beijing time. Where product evidence is missing,
route a stable-ID factory request and retain reference values separately from supplied answers.
Review technical facts, compatibility, exact image identity and rights through their separate
governed gates before public promotion or quotation confirmation.
