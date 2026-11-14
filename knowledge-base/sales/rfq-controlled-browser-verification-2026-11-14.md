# Controlled RFQ Browser Verification — 2026-11-14

## Scope And Authorization

The owner explicitly approved one new internal browser submission, a synthetic CSV and subsequent
inspection of both controlled mailboxes and the sales attachment. The old November 4 attempt
remains separately unknown and must not be resent. This approval did not authorize retries,
protection changes, provider/DNS changes or a direct API substitute.

The production page was `/rfq`, posting to `/api/rfq` at `https://www.arcfortweld.com`.
Immediately before execution, GitHub `main` was
`2ac781054104429709b5c2ebc122234176f9a6a8` (PR #158), and the page returned HTTP 200.
The internal case was `AF-INTERNAL-DELIVERY-20261114-01`; its form details explicitly requested
delivery verification only, with no quotation or order. No real buyer data was used.

## Direct Observation

| Evidence                                     | Observed result                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Browser                                      | Isolated automated Chromium context; published form and original BotID integration            |
| Submit click requested (UTC)                 | `2026-11-14T12:48:50.047Z`                                                                    |
| Production RFQ POST observed (UTC)           | `2026-11-14T12:48:50.594Z`                                                                    |
| Clicks / RFQ POSTs                           | One / one; no retry or fallback send                                                          |
| Prepared client reference                    | `AF-RFQ-20261114-C245B983`                                                                    |
| Server response and final page reference     | `AF-RFQ-20261114-61AA6680`                                                                    |
| Response observed (UTC)                      | `2026-11-14T12:48:51.622Z`                                                                    |
| HTTP / API result                            | 403 / `ok:false`; browser verification rejected                                               |
| Page outcome                                 | Visible verification error, server reference, preserved form/attachment and fallback contacts |
| BotID resource                               | One observed request, HTTP 200; no failed BotID request observed                              |
| Other writes blocked / page errors           | Zero / zero                                                                                   |
| Provider acceptance fields                   | Not returned; remain unknown                                                                  |
| Sales inbox / buyer inbox / sales attachment | Not inspected; all remain null                                                                |

TLS verification remained enabled. The managed proxy CA was temporarily made available to the
browser and certificate names, trust flags and fingerprints were verified restored afterwards.
The test did not mock the RFQ response, change browser detection, forge a challenge or bypass
BotID. An exclusive local attempt lock and network guard prevented another RFQ POST.

## Interpretation And Reference Mapping

The RFQ route creates a server reference at entry. A positive BotID bot classification returns 403
before parsing the form or replacing that reference with the client-token-derived reference.
The form correctly prefers the returned reference in its error and manual fallback details.
Thus the two references above describe the same rejected request. The canonical
`inboxVerification.submittedReference` uses the server/final-page reference and the recorded click
time, as an attempted submission only. Both references are retained here for reconciliation.

This early-return path precedes email processing. It supplies no new provider acceptance or
mailbox evidence. Keep `providerAcceptanceVerified` at its existing date, all three inbox/attachment
flags null, and both mailbox observations and reviewer fields null. A rejection is not a checked
mailbox failure. Do not fill absent provider fields with false.

This proves the automated session was rejected. It does not establish that a normal human buyer
is rejected, identify the old hanging submission's cause or verify end-to-end email delivery.

## Next Handoff

Do not replay this case or send a substitute email. The next delivery test needs a separately
approved new case, executed by the owner in an ordinary browser with BotID intact, followed by
human inspection of both inboxes/junk and the sales attachment under the same returned reference.
Record the click time, HTTP/UI result and available reference without sharing buyer details.
If that human session also receives 403, use its exact UTC window and server reference for a
read-only Vercel/BotID review before proposing a protection change. Never disable protection to
make a delivery test pass.

DMARC, provider credential rotation, current GSC, GA4 and exact-product evidence remain independent
unresolved gates. The private synthetic packet, screenshots and execution receipt stay outside Git.
