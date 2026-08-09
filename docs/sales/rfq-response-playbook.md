# RFQ Response Playbook

This playbook helps ArcFort Weld respond consistently to website inquiries without inventing
technical facts, compatibility, prices, certifications or delivery promises.

## Operating Routine

- Review the sales inbox and Resend delivery log at least twice each business day.
- Keep the website RFQ reference in every reply and internal record.
- Reply from the business mailbox. Do not move buyer contact details, messages or attachments into
  Git, public documents or analytics URLs.
- Treat the website's quotation-readiness label as a checklist aid only. A person must review every
  inquiry before quotation or rejection.
- Use the sales email's lead-source summary to organize channel follow-up, but treat it as an
  operational hint because campaign parameters and browser referrers can be buyer-controlled.
- Verify the recipient before using the one-click email or WhatsApp actions. WhatsApp is shown only
  when the buyer supplied an international-format number; do not assume that it grants permission
  for unrelated marketing messages.
- Scan buyer attachments with endpoint protection. Never enable document macros.

## First Review

Confirm what the buyer supplied:

1. Product name, SKU, OEM reference or product family.
2. Torch, machine or system model when compatibility matters.
3. Size, thread, material, rating or marked dimensions only when supplied by the buyer or verified
   against a controlled technical source.
4. Quantity per line item and whether the order is a trial, regular supply or OEM requirement.
5. Standard packing, logo, private-label, carton or model customization requirements.
6. Destination country, port or city and preferred shipping term when freight is requested.
7. Drawing, product list, label photo or clear sample photos when identification is incomplete.

Never infer compatibility from a similar appearance. Use "Compatibility can be confirmed by sample
or drawing" until the technical reference has been checked.

## Response Path

### Sufficient Product Detail

Use this when the product reference, quantity and destination are clear enough for internal review.

```text
Subject: Re: ArcFort Weld RFQ [REFERENCE] - [PRODUCT OR COMPANY]

Dear [NAME],

Thank you for your inquiry. We have recorded the requested product scope and quantity under RFQ
[REFERENCE]. Our team is checking the applicable specification, packing and delivery options.

Before we finalize the quotation, please confirm whether you require standard export packing or
private-label packaging, and provide the destination port or city if freight is required.

We will only confirm compatibility and technical details after checking the model reference,
drawing or sample information supplied for this inquiry.

Best regards,
ArcFort Weld
Renqiu Ailesen Welding Technology Co., Ltd.
```

### Technical Details Needed

Use this when product identification or fit cannot be verified from the inquiry.

```text
Subject: Additional product details needed - RFQ [REFERENCE]

Dear [NAME],

Thank you for contacting ArcFort Weld. To identify the correct welding or cutting part for RFQ
[REFERENCE], please send any available part number, torch or machine model, marked dimensions,
drawing, product list or clear sample photos.

Please also confirm the required quantity for each item. Compatibility will be checked against the
information you provide before we prepare the quotation.

Best regards,
ArcFort Weld
Renqiu Ailesen Welding Technology Co., Ltd.
```

### OEM Or Packaging Clarification

```text
Subject: OEM details for RFQ [REFERENCE]

Dear [NAME],

Thank you for your OEM inquiry. ArcFort Weld can review logo printing, private-label packaging,
carton design and model customization requirements.

Please send the product list, expected quantity per item, logo file, packaging reference and any
sample or drawing available. OEM MOQ and lead time depend on the product, quantity and packaging
requirements and will be confirmed after review.

Best regards,
ArcFort Weld
Renqiu Ailesen Welding Technology Co., Ltd.
```

### Outside Current Scope

Use this only after a person confirms the requested product is outside the current supply scope.

```text
Subject: Re: ArcFort Weld RFQ [REFERENCE]

Dear [NAME],

Thank you for sending the details for RFQ [REFERENCE]. After reviewing the current request, we are
not able to confirm a suitable supply option from our present product scope. We prefer not to quote
an unverified alternative.

We appreciate your inquiry and will be glad to review future requirements for welding machines,
cutting machines, MIG/MAG torch parts, TIG torch parts, plasma cutting consumables and welding
accessories.

Best regards,
ArcFort Weld
Renqiu Ailesen Welding Technology Co., Ltd.
```

## Quotation Checks

Before sending a quotation:

- Verify the quoted product matches the buyer's model, drawing, sample or controlled product data.
- Separate confirmed facts from details that remain available upon request.
- Confirm currency, unit, quantity, packaging, MOQ, lead time basis, payment terms and quotation
  validity in the quotation document.
- Confirm whether freight is included and identify the applicable shipping term.
- Do not add CE, ISO, RoHS, UL or other certification claims unless the exact product evidence is
  available and approved for use.
- Do not promise stock, capacity or shipment dates that have not been checked.

## Follow-up Record

Keep these fields in a private sales system or protected spreadsheet:

- RFQ reference
- Received date
- Company and buyer contact
- Product scope
- Missing technical information
- Assigned owner
- Last response date
- Next action date
- Outcome

Do not store buyer PII in this repository. Aggregated campaign reporting should use counts and
campaign IDs only.
