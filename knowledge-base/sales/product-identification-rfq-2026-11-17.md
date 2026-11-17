# Product Identification In RFQ Drafts

Scope date: 2026-11-17. This is an inquiry-collection change for existing products. It does not
confirm specifications, compatibility, image rights or quotation eligibility.

## Observed Gap And Shared Questions

A fresh read-only production check found that the native RFQ links for CT0004, CT0005, CT0006,
TH0007 and GN0008 carried three generic questions. The product pages' identification guidance did
not become the corresponding part-specific questions in the RFQ draft or contact drafts.

`lib/content/product-identification-rfq.ts` now supplies questions by exact SKU:

| Product scope                         | Buyer evidence requested                                                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| CT0004, CT0005 and independent CT0006 | Installed torch, current contact tip and mating holder, wire size, overall length, thread/pitch, drawing/sample/photos and material requirement |
| TH0007                                | Installed torch and existing holder, both connection ends, thread/pitch, handedness, seating geometry, overall length and photos/drawing/sample |
| GN0008                                | Installed torch, current nozzle reference, profile, opening, attachment interface, overall length and same-variant photos/drawing/sample        |

The shared product template carries all five questions to the direct website RFQ, email and both
product-aware WhatsApp links, including the lower RFQ CTA. Existing robot-torch and wire-feeder
buying profiles take precedence and retain their established contact-draft behavior: four questions
in the primary WhatsApp shortcut and the full profile in the lower CTA. Other products retain
their existing fallback prompts.

Questions remain unanswered. No catalog length, thread, material or compatibility result is inserted
as an answer. CT0006 shares a contact-tip identification method, not 15AK membership or its catalog
values. Keep its [independent evidence boundary](../products/general-m6-27-contact-tip-ct0006.md).

## Intake And Sales Review Boundary

The buyer reviews the draft and supplies any available identifying evidence. The added questions
are not new mandatory form fields. Blank quantity and country questions do not satisfy those inputs.
A selected site SKU plus an actual buyer quantity and country can still be ready for human sales
review under the existing qualification rule; that label does not confirm technical details or fit.
The required compatibility/specification review remains in the sales follow-up checklist.

No attachment is created from a question, and no email/WhatsApp message is sent by preparing a link.
The product identity in these URLs is public site context; buyer identity and message content must
remain out of analytics and repository records.

## Separate Evidence Observed On November 17

Connected Airtable reads at 04:18-04:20 UTC found all 15 technical requests unconfirmed, all 20
product-image requests still requested, four P0 image decisions pending, and all 73 local candidates
without rights/exact-match approval. CT0004's four technical and five image rows have no new source
evidence. The inspected comments also supplied no attachment or review decision. Historical local
file-lineage fields remain historical evidence, not product confirmation.

The existing private sales summary still displayed zero entered-row metrics and no recorded daily
review timestamps. Those counters do not prove no inquiry was received or that no unlogged check
occurred. No buyer fields were read or copied into this record.

Read-only production health and sampled canonical-host redirects passed. HTTP availability and
configured mail delivery do not establish current search indexing, inbox placement or sales results.
The new questions do not close any of these separate evidence gates.

## Validation Contract

Focused tests cover exact SKU routing, no seeded catalog answers, blank quantity/country behavior
and existing buying-profile fallback. Browser regression reads all product-aware web/email/WhatsApp drafts for the
five products plus both buying-profile controls at 390px and 1440px, follows the native quote link,
checks that RFQ text survives navigation with quantity/country still blank, and blocks mutating or
external requests. Production verification likewise uses GET/HEAD only, with no real inquiry send.
