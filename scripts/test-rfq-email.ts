#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  buildBuyerConfirmationEmailHtml,
  buildInquiryEmailHtml,
  type RfqEmailPayload,
} from "../lib/rfq-email.ts";

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
    landingPage: "/products?utm_source=buyer&utm_medium=email",
    referrer: "https://example.com/<source>",
    utmSource: "buyer-newsletter",
    utmMedium: "email",
    utmCampaign: "summer & autumn",
    utmTerm: "",
    utmContent: "",
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
assert.match(inquiryHtml, /Inquiry Source/);
assert.match(inquiryHtml, /drawing-&lt;revision-a&gt;\.pdf/);
assert.match(inquiryHtml, /rfq\/drawing-&lt;revision-a&gt;\.pdf/);
assert.match(inquiryHtml, /Test Browser &lt;unsafe&gt;/);

assert.match(confirmationHtml, /RFQ Received/);
assert.match(confirmationHtml, /What Happens Next/);
assert.match(confirmationHtml, /mailto:arcfortweld@outlook\.com/);
assert.match(confirmationHtml, /https:\/\/wa\.me\/8618803076512/);
assert.match(confirmationHtml, /Additional%20RFQ%20details%20-%20AF-RFQ-20260801-TEST01/);
assert.match(confirmationHtml, /add%20details%20to%20RFQ%20AF-RFQ-20260801-TEST01/);
assert.doesNotMatch(confirmationHtml, /rfq\/drawing-&lt;revision-a&gt;\.pdf/);

console.log("RFQ email template tests passed.");
