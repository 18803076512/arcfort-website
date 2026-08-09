#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  buildBuyerConfirmationEmailHtml,
  buildBuyerConfirmationEmailText,
  buildInquiryEmailHtml,
  buildInquiryEmailText,
  type RfqEmailPayload,
} from "../lib/rfq-email.ts";
import { buildRfqLeadSourceSummary } from "../lib/rfq-lead-source.ts";
import { buildRfqQuotationReadiness } from "../lib/rfq-qualification.ts";

const payload: RfqEmailPayload = {
  name: 'Alex <script>alert("buyer")</script>',
  company: "Buyer & Distributor Ltd.",
  email: "buyer@example.com",
  whatsapp: "+1 000 000 0000",
  country: "United States",
  productRequirements: "MIG contact tips <M6>\nQuantity: 500 pcs",
  quantity: "500 pcs",
  message: "Private label bags & export cartons required.",
  sourcePath: "/products/mig-mag-torch-parts/mig-contact-tip",
  sourceAttribution: {
    landingPage: "/distributor-supply?utm_source=outreach_email&utm_medium=email",
    referrer: "https://example.com/<source>",
    utmSource: "outreach_email",
    utmMedium: "email",
    utmCampaign: "distributor_sourcing_2026",
    utmTerm: "",
    utmContent: "introduction",
  },
};
const attachments = [
  {
    name: "drawing-<revision-a>.pdf",
    size: 1024 * 1024,
    type: "application/pdf",
    path: "rfq/drawing-<revision-a>.pdf",
  },
];
const reference = "AF-RFQ-20260801-TEST01";
const requestMeta = {
  referrer: "https://www.arcfortweld.com/rfq",
  userAgent: "Test Browser <unsafe>",
};

const inquiryHtml = buildInquiryEmailHtml(payload, attachments, reference, requestMeta);
const confirmationHtml = buildBuyerConfirmationEmailHtml(payload, attachments, reference);
const inquiryText = buildInquiryEmailText(payload, attachments, reference, requestMeta);
const confirmationText = buildBuyerConfirmationEmailText(payload, attachments, reference);

for (const html of [inquiryHtml, confirmationHtml]) {
  assert.match(html, /^<!doctype html>/);
  assert.match(html, new RegExp(reference));
  assert.match(html, /Renqiu Ailesen Welding Technology Co\., Ltd\./);
  assert.match(html, /Buyer &amp; Distributor Ltd\./);
  assert.match(html, /&lt;script&gt;alert\(&quot;buyer&quot;\)&lt;\/script&gt;/);
  assert.match(html, /MIG contact tips &lt;M6&gt;<br \/>Quantity: 500 pcs/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.doesNotMatch(html, /<M6>/);
}

assert.match(inquiryHtml, /New Website RFQ/);
assert.match(inquiryHtml, /Quotation Readiness/);
assert.match(inquiryHtml, /Ready for sales review/);
assert.match(inquiryHtml, /Sales follow-up checklist/);
assert.match(inquiryHtml, /Lead Source/);
assert.match(inquiryHtml, /Distributor outreach email/);
assert.match(inquiryHtml, /Reply to Buyer/);
assert.match(inquiryHtml, /mailto:buyer%40example\.com\?subject=Re%3A%20ArcFort%20Weld%20RFQ/);
assert.match(inquiryHtml, /https:\/\/wa\.me\/10000000000/);
assert.match(inquiryHtml, /Inquiry Source/);
assert.match(inquiryHtml, /drawing-&lt;revision-a&gt;\.pdf/);
assert.match(inquiryHtml, /rfq\/drawing-&lt;revision-a&gt;\.pdf/);
assert.match(inquiryHtml, /Test Browser &lt;unsafe&gt;/);

assert.match(confirmationHtml, /RFQ Received/);
assert.match(confirmationHtml, /What Happens Next/);
assert.match(confirmationHtml, /Information That Helps Us Review Faster/);
assert.match(confirmationHtml, /mailto:arcfortweld@outlook\.com/);
assert.match(confirmationHtml, /https:\/\/wa\.me\/8618803076512/);
assert.match(confirmationHtml, /Additional%20RFQ%20details%20-%20AF-RFQ-20260801-TEST01/);
assert.match(confirmationHtml, /add%20details%20to%20RFQ%20AF-RFQ-20260801-TEST01/);
assert.doesNotMatch(confirmationHtml, /rfq\/drawing-&lt;revision-a&gt;\.pdf/);

assert.match(inquiryText, /Quotation Readiness: Ready for sales review/);
assert.match(inquiryText, /Sales Follow-up Checklist:/);
assert.match(inquiryText, /Lead Source: Distributor outreach email/);
assert.match(inquiryText, /Sales Response Actions:/);
assert.match(inquiryText, /https:\/\/wa\.me\/10000000000/);
assert.match(inquiryText, /rfq\/drawing-<revision-a>\.pdf/);
assert.match(confirmationText, /Information that can help us review faster:/);
assert.match(confirmationText, /arcfortweld@outlook\.com/);
assert.doesNotMatch(confirmationText, /rfq\/drawing-<revision-a>\.pdf/);
assert.doesNotMatch(confirmationText, /(?:within|in) 24 hours/i);

const detailedReadiness = buildRfqQuotationReadiness(payload, attachments);
assert.equal(detailedReadiness.status, "ready_for_sales_review");
assert.ok(detailedReadiness.confirmedSignals.includes("1 supporting file attached"));

const incompleteReadiness = buildRfqQuotationReadiness(
  {
    country: "New Zealand",
    quantity: "Trial order",
    productRequirements: "We need welding consumables for distribution.",
    message: "Please send details.",
  },
  [],
);
assert.equal(incompleteReadiness.status, "technical_details_needed");
assert.match(incompleteReadiness.followUpItems.join("\n"), /part number/);
assert.match(incompleteReadiness.followUpItems.join("\n"), /sample photos/);
assert.doesNotMatch(incompleteReadiness.label, /New Zealand|Trial order/);

const missingCommercialDetailsReadiness = buildRfqQuotationReadiness(
  {
    country: "",
    quantity: "",
    productRequirements: "MIG contact tip M6 1.0mm, reference AF-MIG-CT-0005.",
    message: "Please quote standard export packing.",
  },
  [],
);
assert.equal(missingCommercialDetailsReadiness.status, "technical_details_needed");
assert.match(missingCommercialDetailsReadiness.followUpItems.join("\n"), /required quantity/i);
assert.match(missingCommercialDetailsReadiness.followUpItems.join("\n"), /destination country/i);

const referralSummary = buildRfqLeadSourceSummary(
  {
    landingPage: "/products/mig-mag-torch-parts",
    referrer: "https://welding-directory.example/suppliers",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
  },
  "/products/mig-mag-torch-parts",
);
assert.equal(referralSummary.label, "Referral: welding-directory.example");

const invalidWhatsAppHtml = buildInquiryEmailHtml(
  { ...payload, whatsapp: "020 1234 5678" },
  attachments,
  reference,
  requestMeta,
);
assert.doesNotMatch(invalidWhatsAppHtml, /https:\/\/wa\.me\/02012345678/);
assert.match(invalidWhatsAppHtml, /Reply by Email/);

const encodedEmailHtml = buildInquiryEmailHtml(
  { ...payload, email: "buyer@example.com?body=untrusted" },
  attachments,
  reference,
  requestMeta,
);
assert.match(encodedEmailHtml, /mailto:buyer%40example\.com%3Fbody%3Duntrusted\?subject=/);
assert.doesNotMatch(encodedEmailHtml, /mailto:buyer@example\.com\?body=/);

console.log("RFQ email template tests passed.");
