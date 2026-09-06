# RFQ Delivery And Qualification Baseline

Evidence baseline: 2026-08-29; repository review 2026-09-01

## Purpose

Preserve the difference between implemented RFQ behavior, provider acceptance and proven mailbox
delivery. Do not store buyer names, email addresses, phone numbers, messages, files or other PII in
this knowledge base.

## Implemented Repository Capability

The current RFQ route collects buyer name, company, email, WhatsApp, country, product requirements,
quantity, message, source context and controlled attachments. Server-side controls cover validation,
file signatures and size limits, BotID, rate limiting, idempotency and stable inquiry references.

The qualification helper classifies an inquiry as ready for sales review only when quantity,
destination country and product evidence are present. Product evidence may be a model, part number,
SKU, drawing, sample, photo, thread, size, material or dimensional reference. Compatibility and
unconfirmed specifications still require buyer-supplied evidence and technical review.

## Delivery Evidence

- Active delivery mode: email.
- Sales notification, buyer confirmation and attachment handling are configured.
- Provider acceptance was last recorded on 2026-07-26.
- Production RFQ status was last checked on 2026-08-29.
- Sales-mailbox placement: not externally confirmed.
- Buyer-mailbox placement: not externally confirmed.
- Optional Supabase inquiry storage: not configured; email remains the active delivery path.

Provider acceptance is not proof of inbox placement. The website must not claim proven end-to-end
delivery until one controlled browser submission produces the same inquiry reference in the sales
mailbox and buyer confirmation mailbox.

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
   evidence; do not commit message content or addresses.
4. Match the reference in the sales notification and buyer confirmation.
5. Confirm attachment availability and sender-domain authentication.
6. Update `docs/operations/acquisition-production-evidence.json` and regenerate reports.

## Remaining Owner Evidence

- Sales and buyer inbox placement for the same controlled inquiry reference.
- Confirmation that the previously exposed email-provider credential was rotated.
- DMARC policy decision and verification.
- GA4 RFQ conversion-event evidence without buyer PII.
