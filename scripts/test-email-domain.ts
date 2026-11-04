#!/usr/bin/env node

import assert from "node:assert/strict";
import { getEmailSenderDomain } from "../lib/email-domain.ts";
import { hasDmarcAggregateReportUri } from "./email-domain-audit-policy.ts";

assert.equal(getEmailSenderDomain("ArcFort Weld <rfq@arcfortweld.com>"), "arcfortweld.com");
assert.equal(getEmailSenderDomain("RFQ@ARCFORTWELD.COM"), "arcfortweld.com");
assert.equal(
  getEmailSenderDomain("ArcFort Weld <rfq@send.arcfortweld.com>"),
  "send.arcfortweld.com",
);
assert.equal(getEmailSenderDomain("ArcFort Weld"), undefined);
assert.equal(getEmailSenderDomain("rfq@localhost"), undefined);
assert.equal(getEmailSenderDomain("rfq@arcfortweld.com\r\nBcc: buyer@example.com"), undefined);
assert.equal(getEmailSenderDomain(undefined), undefined);

assert.equal(hasDmarcAggregateReportUri("v=DMARC1; p=none; pct=100"), false);
assert.equal(
  hasDmarcAggregateReportUri("v=DMARC1; p=none; ruf=mailto:forensic@example.com"),
  false,
);
assert.equal(hasDmarcAggregateReportUri("v=DMARC1; p=none; rua= "), false);
assert.equal(
  hasDmarcAggregateReportUri("v=DMARC1; p=none; rua=mailto:reports@example.com garbage"),
  false,
);
assert.equal(hasDmarcAggregateReportUri("v=DMARC1; p=none; rua=mailto:reports@example.com"), true);
assert.equal(
  hasDmarcAggregateReportUri("v=DMARC1; p=none; rua=mailto:reports@example.com!10m"),
  true,
);

console.log("Email sender-domain tests passed.");
