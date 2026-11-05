# RFQ Delivery And Qualification Baseline

Evidence baseline: 2026-08-29; repository workflow review 2026-10-29

## Purpose

Preserve the difference between implemented RFQ behavior, provider acceptance and proven mailbox
delivery. Do not store buyer names, email addresses, phone numbers, messages, files or other PII in
this knowledge base.

## Implemented Repository Capability

The current RFQ route collects buyer name, company, email, WhatsApp, country, product requirements,
quantity, message, source context and controlled attachments. Server-side controls cover validation,
file signatures and size limits, BotID, rate limiting, idempotency and stable inquiry references.

The qualification helper classifies an inquiry as ready for sales review only when a buyer quantity
or order plan, destination country and concrete product evidence are present. Product evidence is a
specific model, part/SKU or drawing reference, a dimension, or an attached file. Merely asking for a
model, photo, material or MOQ does not count as supplying that detail. When the quantity field points
to selected product lines, each selected line must include its own quantity or order plan; numbered
notes in additional requirements are not product lines. This is an intake hint, not verification of
compatibility, technical specifications or price. Those still require buyer-supplied evidence and
technical review.

## Delivery Evidence

- Active delivery mode: email.
- Sales notification, buyer confirmation and attachment handling are configured.
- A successful Resend response establishes provider acceptance only. The API fields
  `emailProviderAccepted` and `buyerConfirmationProviderAccepted` state this directly; legacy
  `emailDelivered` and `buyerConfirmationDelivered` are compatible aliases, not mailbox evidence.
- Provider acceptance was last recorded on 2026-07-26.
- Production RFQ read-only status was last checked on 2026-11-04.
- Sales-mailbox placement: not externally confirmed.
- Buyer-mailbox placement: not externally confirmed.
- Optional Supabase inquiry storage: not configured; email remains the active delivery path.
- On a failed website submission, the form preserves the buyer's fields and shows selectable
  fallback details. Email and WhatsApp links use only the base contacts, with no buyer data in URLs.
- The server-rendered form starts in a disabled, visibly labelled preparation state and becomes
  editable only after client hydration. This prevents text entered before React is ready from being
  erased when controlled fields attach. The preparation notice offers direct email and WhatsApp
  links even if scripts never load; it does not imply an inquiry was submitted. The guard applies to
  the shared form on RFQ, Contact and Distributor Supply pages. The status panel remains after
  hydration, so a buyer reading near the form does not lose their place when fields become active.
- BotID's browser fetch wrapper can wait for its challenge before calling native `fetch`. Its wait
  does not consume the request's `AbortSignal`, so the client needs an independent deadline that
  rejects the waiting promise and aborts the eventual native request. An attempt reference shown
  before a response is only a reconciliation key; it never proves provider acceptance or receipt.
- Sales notification actions use the buyer email as `Reply-To` and show buyer contact details as
  text. No buyer email address or phone number is placed in an action URL.

Provider acceptance is not proof of inbox placement. The website must not claim proven end-to-end
delivery until one controlled browser submission produces the same inquiry reference in the sales
mailbox and buyer confirmation mailbox, and its selected test attachment is present in the sales
message. These are separately recorded outcomes.

## Qualified Inquiry Minimum

For a useful quotation, sales should obtain:

- Product name, model, SKU or reference number.
- Size, thread, material or other identifying detail where applicable.
- Quantity or order plan.
- Destination country and, before freight calculation, destination city or port.
- Drawing, product list or clear sample photographs when fit cannot be verified from text.
- Standard packing or OEM logo, private-label and carton requirements.
- Requested shipping term when known.

## External Verification Procedure

1. Use synthetic, non-sensitive test details and a controlled buyer mailbox.
2. Submit through the production browser form, including one allowed test attachment.
3. Record only the generated inquiry reference, timestamps and pass/fail outcome in operations
   evidence; do not commit message content or addresses. Use the `inboxVerification` fields in
   `docs/operations/acquisition-production-evidence.json`: submission reference and UTC time,
   separately observed reference, receipt and check times for each mailbox, plus reviewer ID and
   review time. A checked failure uses `false` with a check time; an unchecked mailbox stays null.
4. Match the reference in the sales notification and buyer confirmation.
5. Confirm attachment availability and sender-domain authentication separately. Record the selected
   test attachment outcome in `rfq.salesAttachmentPresentConfirmed`; it requires observed sales
   mailbox receipt and uses that inspection's check time. Mailbox evidence alone does not establish
   that an attachment was included.
6. Update `docs/operations/acquisition-production-evidence.json` and regenerate reports.

## Production Form Readiness Evidence

The pre-hydration input-loss diagnosis reproduced on 2026-11-05 in 6/6 local and 2/2 earlier live,
read-only browser trials at 390px. PR #142 deployed the guarded form at main commit `be1be209`;
Production deployment `7576381248` succeeded. After styles and fonts loaded, the live RFQ, Contact
and Distributor Supply pages passed 6/6 delayed-script browser checks at 390px and 1440px: fields
started disabled with direct email and WhatsApp fallback, then enabled with synthetic input retained
and no form or scroll displacement. No browser error, horizontal overflow or POST occurred. This
confirms the published form readiness behavior; it does not establish provider acceptance, sales
inbox placement, buyer confirmation or attachment receipt.

## Remaining Owner Evidence

- Sales and buyer inbox placement for the same controlled inquiry reference.
- Confirmation that the previously exposed email-provider credential was rotated.
- DMARC policy decision and verification.
- GA4 RFQ conversion-event evidence without buyer PII.
