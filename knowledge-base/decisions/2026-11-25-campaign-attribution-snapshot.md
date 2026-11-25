# Inquiry Source Snapshots For Tracked Campaign Arrivals

Date: 2026-11-25. Scope: the public website's per-tab RFQ source metadata. No provider, analytics
account, database schema, product fact or commercial policy changes.

## Evidence And Problem

Seven isolated actual-production-build browser scenarios reproduced a mixed snapshot. A complete
social campaign A followed by a partial valid email campaign B stored B's source, medium, campaign
and entry path, but retained A's omitted term/content. The sales-source summary correctly named B
while still displaying A's content. Missing fields therefore implied evidence from another arrival.

The existing tracker already accepts any valid UTM field and updates the landing path for that
arrival. Repository guidance promises bounded/sanitized metadata, not a first-touch, multi-touch or
GA4 attribution model. The setup table's first-session-page wording contradicted that existing
reset behavior. Same-origin referrers are also accepted by the existing origin sanitizer, so neutral
"referring website origin" is more accurate than promising an external-only filter.

The dated diagnostic packet is retained separately under
`outputs/campaign-attribution-baseline-20261125/`; it contains synthetic labels only and does not
claim production deployment, actual RFQ delivery or a business attribution policy.

## Decision

Keep the existing acceptance predicate: at least one of the five incoming UTM labels survives the
existing sanitizer. For an accepted tracked arrival, replace one complete seven-field snapshot:

- Current sanitized pathname, without query or fragment.
- Current sanitized HTTP(S) referrer origin, including an explicit empty value when unavailable.
- All five sanitized UTM fields; omitted or invalid incoming values become empty.

No value is borrowed from the prior snapshot on replacement. This includes partial arrivals for
the same campaign. Campaign-link authors must supply the complete desired labels.

Content-only and term-only arrivals remain accepted, rather than changing the existing predicate.
Their missing source/medium/campaign fields are unknown. The existing summary may use a genuine
current external referrer; otherwise it says "Direct or unattributed inquiry". That label is not
proof of direct acquisition. The summary already ignores ArcFort's own domain; no host-filtering or
summary-label rule changes here.

Without any valid new UTM, preserve the complete sanitized stored snapshot and do not write it
again. Without stored attribution, capture the initial path/referrer with empty campaign fields.
The pure `resolveSourceAttributionArrival` helper returns the selected snapshot and whether a save
should be attempted. The component retains its existing one-time mount trigger and storage access
guards. It does not begin tracking every client-side navigation or query change.

## Boundaries And Consequences

- Storage is optional metadata. Access/write failure must not break the RFQ page; no persistence
  guarantee or success event is added. Existing JSON parsing/validity behavior is unchanged.
- Old browser snapshots and historical RFQ records are not repaired or reinterpreted. A fresh valid
  arrival replaces browser state; otherwise existing state remains until normal tab expiry.
- This changes future website RFQ metadata selection, not GA4 session attribution, event collection,
  advertising settings, sales-ledger rows or hosted records.
- Query/referrer labels remain buyer-controlled operational hints. Do not treat them as verified
  business outcomes, personal identity or evidence of product compatibility.
- The request-level referrer displayed separately in RFQ emails is a different field and is unchanged.

## Verification And Reversal

Test complete A to partial B, invalid optional B fields, no-valid-UTM preservation, clean invalid
arrival, content/term-only arrivals, current external/ArcFort/empty referrers, duplicate parameters,
idempotence and input immutability. Assert complete snapshots and the actual lead-source summary.
Verify the actual tracker at mobile/desktop widths, including malformed JSON and blocked storage,
without submitting an RFQ or sending mail. Bind source, build, exact CI, Production and live
readback independently; local browser state is not an inbox or provider receipt.

Withhold release if values from different arrivals mix or privacy guards regress. A scoped revert
uses the existing authorized repository/main release workflow. Do not rewrite source records or
infer missing historical fields to reverse this change.
